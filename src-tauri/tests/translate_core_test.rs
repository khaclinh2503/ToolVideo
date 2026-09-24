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
