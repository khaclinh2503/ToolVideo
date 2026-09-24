use app_lib::error::PipelineError;
use app_lib::srt::Segment;
use app_lib::translate::{translate_segments, TranslateProvider};
use std::cell::RefCell;

struct Fake {
    calls: RefCell<Vec<usize>>,
    bad_len: bool,
}

impl TranslateProvider for Fake {
    fn id(&self) -> &'static str {
        "fake"
    }

    fn batch_size(&self) -> usize {
        3
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        self.calls.borrow_mut().push(texts.len());
        if self.bad_len {
            return Ok(vec!["x".into()]);
        }
        Ok(texts.iter().map(|t| format!("VI:{t}")).collect())
    }
}

fn segs(n: usize) -> Vec<Segment> {
    (0..n)
        .map(|i| Segment {
            start_ms: i as u64 * 1000,
            end_ms: i as u64 * 1000 + 500,
            text: format!("t{i}"),
        })
        .collect()
}

#[test]
fn chunks_by_batch_size_and_keeps_order_and_timing() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: false,
    };
    let out = translate_segments(&p, &segs(7), "zh", "vi").unwrap();
    assert_eq!(p.calls.borrow().as_slice(), &[3, 3, 1]);
    assert_eq!(out.len(), 7);
    assert_eq!(out[4].text, "VI:t4");
    assert_eq!(out[4].start_ms, 4000);
    assert_eq!(out[4].end_ms, 4500);
}

#[test]
fn empty_input_makes_no_calls() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: false,
    };
    assert!(translate_segments(&p, &[], "zh", "vi").unwrap().is_empty());
    assert!(p.calls.borrow().is_empty());
}

#[test]
fn length_mismatch_is_provider_error() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: true,
    };
    let err = translate_segments(&p, &segs(2), "zh", "vi").unwrap_err();
    assert!(matches!(err, PipelineError::ProviderError { .. }));
}

struct FakeWide {
    calls: RefCell<Vec<usize>>,
}

impl TranslateProvider for FakeWide {
    fn id(&self) -> &'static str {
        "fake_wide"
    }

    fn batch_size(&self) -> usize {
        // Large enough that all 4 segments in the blank-text test land in a
        // single chunk, so we can assert exactly one call is made.
        40
    }

    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        self.calls.borrow_mut().push(texts.len());
        Ok(texts.iter().map(|t| format!("VI:{t}")).collect())
    }
}

#[test]
fn blank_texts_are_not_sent_and_map_to_empty_string() {
    let p = FakeWide {
        calls: RefCell::new(vec![]),
    };
    let segs = vec![
        Segment { start_ms: 0, end_ms: 100, text: "a".into() },
        Segment { start_ms: 100, end_ms: 200, text: "".into() },
        Segment { start_ms: 200, end_ms: 300, text: "  ".into() },
        Segment { start_ms: 300, end_ms: 400, text: "b".into() },
    ];
    let out = translate_segments(&p, &segs, "zh", "vi").unwrap();
    // Exactly one call sent, containing only the non-blank texts.
    assert_eq!(p.calls.borrow().as_slice(), &[2]);
    let texts: Vec<&str> = out.iter().map(|s| s.text.as_str()).collect();
    assert_eq!(texts, vec!["VI:a", "", "", "VI:b"]);
    // timings preserved
    assert_eq!(out[3].start_ms, 300);
    assert_eq!(out[3].end_ms, 400);
}

#[test]
fn chunk_with_only_blank_texts_makes_no_call() {
    let p = Fake {
        calls: RefCell::new(vec![]),
        bad_len: false,
    };
    let segs = vec![
        Segment { start_ms: 0, end_ms: 100, text: "".into() },
        Segment { start_ms: 100, end_ms: 200, text: "   ".into() },
    ];
    let out = translate_segments(&p, &segs, "zh", "vi").unwrap();
    assert!(p.calls.borrow().is_empty());
    assert_eq!(out.iter().map(|s| s.text.as_str()).collect::<Vec<_>>(), vec!["", ""]);
}

struct Newliner;
impl TranslateProvider for Newliner {
    fn id(&self) -> &'static str {
        "newliner"
    }
    fn batch_size(&self) -> usize {
        10
    }
    fn translate_batch(
        &self,
        texts: &[&str],
        _s: &str,
        _t: &str,
    ) -> Result<Vec<String>, PipelineError> {
        Ok(texts
            .iter()
            .map(|t| match *t {
                "x" => "x\n\n\ny".to_string(),
                "z" => "  z  ".to_string(),
                other => other.to_string(),
            })
            .collect())
    }
}

#[test]
fn translated_text_is_normalized_for_clean_srt_reparse() {
    let p = Newliner;
    let segs = vec![
        Segment { start_ms: 0, end_ms: 100, text: "x".into() },
        Segment { start_ms: 100, end_ms: 200, text: "z".into() },
    ];
    let out = translate_segments(&p, &segs, "zh", "vi").unwrap();
    assert_eq!(out[0].text, "x\ny");
    assert_eq!(out[1].text, "z");
}
