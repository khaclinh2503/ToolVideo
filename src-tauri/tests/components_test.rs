use app_lib::components::{specs, Archive};
use app_lib::components::verify_sha256;

#[test]
fn verify_rejects_wrong_hash() {
    let f = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(f.path(), b"hello").unwrap();
    // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    assert!(verify_sha256(f.path(), "deadbeef").is_err());
    assert!(verify_sha256(
        f.path(),
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    )
    .is_ok());
}

#[test]
fn manifest_liet_ke_du_moi_artifact_va_dung_hinh_dang() {
    let s = specs().unwrap();
    // Con số ở đây là bản kiểm kê có chủ ý, không phải chi tiết cài đặt: thêm
    // hay bớt một artifact thì phải sửa cả danh sách id bên dưới, để không ai
    // lặng lẽ thêm một thứ được tải về rồi đem chạy mà không ai soát.
    // 10 (M1-M6) + 15 file model VieNeu-TTS đã pin ở Task 4 (M7)
    // + 3 (llama-bin, llama-cudart, gemma-3-12b) ở Task 2 (M9) = 28.
    assert_eq!(s.len(), 28, "components.json phải có đủ 28 artifact");

    let ids: Vec<&str> = s.iter().map(|c| c.id.as_str()).collect();
    for want in [
        "ffmpeg", "sherpa", "sense-voice", "sense-voice-tokens",
        "silero-vad", "piper", "piper-voice-vi", "piper-voice-vi-cfg",
        "python", "yt-dlp",
        "vieneu-config-json",
        "vieneu-denoiser-onnx",
        "vieneu-onnx_update-config-json",
        "vieneu-onnx_update-tokenizer-json",
        "vieneu-onnx_update-vieneu_acoustic_cached-onnx",
        "vieneu-onnx_update-vieneu_backbone_shared-data",
        "vieneu-onnx_update-vieneu_decode_step-onnx",
        "vieneu-onnx_update-vieneu_prefill-onnx",
        "vieneu-onnx_update-vieneu_v3_heads-npz",
        "vieneu-codec_browser_onnx_meta-json",
        "vieneu-moss_audio_tokenizer_decode_full-onnx",
        "vieneu-moss_audio_tokenizer_decode_shared-data",
        "vieneu-moss_audio_tokenizer_decode_step-onnx",
        "vieneu-moss_audio_tokenizer_encode-data",
        "vieneu-moss_audio_tokenizer_encode-onnx",
        "llama-bin",
        "llama-cudart",
        "gemma-3-12b",
    ] {
        assert!(ids.contains(&want), "thiếu component '{want}' trong {ids:?}");
    }

    for c in &s {
        assert!(c.url.starts_with("https://"), "{}: url phải là https", c.id);
        assert!(!c.files.is_empty(), "{}: files rỗng", c.id);
        if c.archive == Archive::Raw {
            assert_eq!(c.files.len(), 1, "{}: raw phải có đúng 1 file map", c.id);
            assert!(c.files[0].from.is_none(), "{}: raw không được có 'from'", c.id);
        } else {
            for f in &c.files {
                assert!(f.from.is_some(), "{}: archive phải có 'from'", c.id);
            }
        }
    }
}

#[test]
fn manifest_installs_to_paths_m1_expects() {
    let s = specs().unwrap();
    let all_to: Vec<String> = s.iter().flat_map(|c| c.files.iter().map(|f| f.to.clone())).collect();
    // 4/5 đường dẫn resolve_engine_ctx đang đòi, khai báo tĩnh trong components.json.
    // (sherpa-onnx-vad-with-offline-asr.exe không kiểm được ở đây vì nó đến qua chép cả cây con.)
    for want in [
        "ffmpeg/ffmpeg.exe",
        "sherpa/sense-voice.onnx",
        "sherpa/tokens.txt",
        "sherpa/vad-model.onnx",
    ] {
        assert!(all_to.contains(&want.to_string()), "thiếu đích '{want}' trong {all_to:?}");
    }
}

use app_lib::components::{download_verified, Progress};
use app_lib::error::PipelineError;
use httpmock::prelude::*;

// sha256("hello world") = b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
const HELLO_SHA: &str = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

#[test]
fn download_writes_file_and_reports_progress() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/a.bin");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let dest = dir.path().join("sub").join("a.part");

    let mut seen: Vec<(u64, u64)> = Vec::new();
    let mut on = |p: Progress| {
        if let Progress::Download { done, total } = p {
            seen.push((done, total));
        }
    };
    download_verified(&server.url("/a.bin"), &dest, HELLO_SHA, &mut on).unwrap();

    assert_eq!(std::fs::read(&dest).unwrap(), b"hello world");
    let last = seen.last().copied().expect("phải báo tiến độ ít nhất 1 lần");
    assert_eq!(last.0, 11, "done phải bằng số byte đã tải");
}

#[test]
fn download_with_wrong_hash_errors_and_leaves_no_file() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/b.bin");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let dest = dir.path().join("b.part");

    let err = download_verified(&server.url("/b.bin"), &dest, "deadbeef", &mut |_| {}).unwrap_err();
    match err {
        PipelineError::ChecksumMismatch { got, .. } => assert_eq!(got, HELLO_SHA),
        e => panic!("mong ChecksumMismatch, nhận {e:?}"),
    }
    assert!(!dest.exists(), "file tạm phải bị xoá khi sai hash");
}

#[test]
fn download_http_404_is_io_error_with_status_and_url() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/missing");
        then.status(404).body("nope");
    });
    let dir = tempfile::tempdir().unwrap();
    let url = server.url("/missing");
    let err = download_verified(&url, &dir.path().join("c.part"), HELLO_SHA, &mut |_| {})
        .unwrap_err();
    match err {
        PipelineError::Io(m) => {
            assert!(m.contains(&url), "thông điệp phải nêu url: {m}");
            assert!(m.contains("404"), "thông điệp phải nêu mã trạng thái HTTP: {m}");
        }
        e => panic!("mong Io, nhận {e:?}"),
    }
}

#[test]
fn download_truncated_stream_errors_and_cleans_up_partial_file() {
    use std::io::{Read as _, Write as _};
    use std::net::TcpListener;

    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    let server = std::thread::spawn(move || {
        if let Ok((mut sock, _)) = listener.accept() {
            let mut buf = [0u8; 4096];
            let _ = sock.read(&mut buf);
            let _ = sock.write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 1000000\r\n\r\n");
            let _ = sock.write_all(&vec![b'x'; 1000]);
            let _ = sock.flush();
        }
    });

    let dir = tempfile::tempdir().unwrap();
    let dest = dir.path().join("truncated.part");
    let url = format!("http://{addr}/big.bin");

    let err = download_verified(&url, &dest, HELLO_SHA, &mut |_| {}).unwrap_err();
    match err {
        PipelineError::Io(m) => assert!(
            m.contains("đứt kết nối"),
            "phải là lỗi đọc giữa luồng, không phải lỗi gửi request: {m}"
        ),
        e => panic!("mong Io (đứt luồng), nhận {e:?}"),
    }
    assert!(!dest.exists(), "file nửa vời phải bị xoá khi đứt luồng");
    let _ = server.join();
}

use app_lib::components::{place_files, ComponentSpec, FileMap};
use std::io::Write as _;

fn spec(id: &str, archive: Archive, files: Vec<(Option<&str>, &str)>) -> ComponentSpec {
    ComponentSpec {
        id: id.into(),
        url: "https://example.invalid/x".into(),
        sha256: String::new(),
        size: 0,
        archive,
        files: files
            .into_iter()
            .map(|(from, to)| FileMap { from: from.map(|s| s.to_string()), to: to.into() })
            .collect(),
    }
}

fn make_zip(path: &std::path::Path, entries: &[(&str, &[u8])]) {
    let f = std::fs::File::create(path).unwrap();
    let mut z = zip::ZipWriter::new(f);
    let opt = zip::write::SimpleFileOptions::default();
    for (name, data) in entries {
        z.start_file(*name, opt).unwrap();
        z.write_all(data).unwrap();
    }
    z.finish().unwrap();
}

fn make_tar_bz2(path: &std::path::Path, entries: &[(&str, &[u8])]) {
    let f = std::fs::File::create(path).unwrap();
    let enc = bzip2::write::BzEncoder::new(f, bzip2::Compression::fast());
    let mut t = tar::Builder::new(enc);
    for (name, data) in entries {
        let mut h = tar::Header::new_gnu();
        h.set_size(data.len() as u64);
        h.set_mode(0o644);
        h.set_cksum();
        t.append_data(&mut h, *name, *data).unwrap();
    }
    t.into_inner().unwrap().finish().unwrap();
}

fn make_tar_gz(path: &std::path::Path, entries: &[(&str, &[u8])]) {
    let f = std::fs::File::create(path).unwrap();
    let enc = flate2::write::GzEncoder::new(f, flate2::Compression::fast());
    let mut t = tar::Builder::new(enc);
    for (name, data) in entries {
        let mut h = tar::Header::new_gnu();
        h.set_size(data.len() as u64);
        h.set_mode(0o644);
        h.set_cksum();
        t.append_data(&mut h, *name, *data).unwrap();
    }
    t.into_inner().unwrap().finish().unwrap();
}

#[test]
fn place_raw_renames_download_to_target() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let part = dir.path().join("x.part");
    std::fs::write(&part, b"MODEL").unwrap();

    let s = spec("m", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    let written = place_files(&part, &s, &models).unwrap();

    assert_eq!(written, vec!["sherpa/sense-voice.onnx".to_string()]);
    assert_eq!(std::fs::read(models.join("sherpa/sense-voice.onnx")).unwrap(), b"MODEL");
}

#[test]
fn place_zip_picks_single_files_and_ignores_the_rest() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let zip_path = dir.path().join("a.zip");
    make_zip(&zip_path, &[
        ("build/bin/ffmpeg.exe", b"FF"),
        ("build/bin/ffprobe.exe", b"FP"),
        ("build/bin/ffplay.exe", b"PLAY"),
    ]);

    let s = spec("ffmpeg", Archive::Zip, vec![
        (Some("build/bin/ffmpeg.exe"), "ffmpeg/ffmpeg.exe"),
        (Some("build/bin/ffprobe.exe"), "ffmpeg/ffprobe.exe"),
    ]);
    place_files(&zip_path, &s, &models).unwrap();

    assert_eq!(std::fs::read(models.join("ffmpeg/ffmpeg.exe")).unwrap(), b"FF");
    assert_eq!(std::fs::read(models.join("ffmpeg/ffprobe.exe")).unwrap(), b"FP");
    assert!(!models.join("ffmpeg/ffplay.exe").exists(), "không được chép file không khai báo");
}

#[test]
fn place_zip_copies_whole_subtree_when_from_ends_with_slash() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let zip_path = dir.path().join("p.zip");
    make_zip(&zip_path, &[
        ("piper/piper.exe", b"EXE"),
        ("piper/espeak-ng-data/vi_dict", b"DICT"),
        ("other/readme.txt", b"NO"),
    ]);

    let s = spec("piper", Archive::Zip, vec![(Some("piper/"), "piper")]);
    let mut written = place_files(&zip_path, &s, &models).unwrap();
    written.sort();

    assert_eq!(written, vec!["piper/espeak-ng-data/vi_dict".to_string(), "piper/piper.exe".to_string()]);
    assert_eq!(std::fs::read(models.join("piper/piper.exe")).unwrap(), b"EXE");
    assert_eq!(std::fs::read(models.join("piper/espeak-ng-data/vi_dict")).unwrap(), b"DICT");
    assert!(!models.join("other").exists());
}

#[test]
fn place_tar_bz2_copies_subtree() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let tb = dir.path().join("s.tar.bz2");
    make_tar_bz2(&tb, &[
        ("sherpa-onnx-v1/bin/sherpa-onnx-vad-with-offline-asr.exe", b"ASR"),
        ("sherpa-onnx-v1/bin/onnxruntime.dll", b"DLL"),
        ("sherpa-onnx-v1/include/x.h", b"H"),
    ]);

    let s = spec("sherpa", Archive::TarBz2, vec![(Some("sherpa-onnx-v1/bin/"), "sherpa")]);
    place_files(&tb, &s, &models).unwrap();

    assert_eq!(
        std::fs::read(models.join("sherpa/sherpa-onnx-vad-with-offline-asr.exe")).unwrap(),
        b"ASR"
    );
    assert_eq!(std::fs::read(models.join("sherpa/onnxruntime.dll")).unwrap(), b"DLL");
    assert!(!models.join("sherpa/x.h").exists());
}

#[test]
fn giai_nen_duoc_tar_gz() {
    // Đây đúng định dạng mà python-build-standalone phát hành (.tar.gz),
    // dựng ngay trong test: không phụ thuộc mạng.
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let tgz = dir.path().join("x.tar.gz");
    make_tar_gz(&tgz, &[("python/python.exe", b"hello")]);

    let s = spec("python", Archive::TarGz, vec![(Some("python/python.exe"), "python/python.exe")]);
    place_files(&tgz, &s, &models).unwrap();

    assert_eq!(std::fs::read(models.join("python/python.exe")).unwrap(), b"hello");
}

#[test]
fn place_errors_when_declared_member_missing() {
    let dir = tempfile::tempdir().unwrap();
    let zip_path = dir.path().join("e.zip");
    make_zip(&zip_path, &[("build/bin/other.exe", b"X")]);

    let s = spec("ffmpeg", Archive::Zip, vec![(Some("build/bin/ffmpeg.exe"), "ffmpeg/ffmpeg.exe")]);
    let err = place_files(&zip_path, &s, &dir.path().join("models")).unwrap_err();
    match err {
        PipelineError::Io(m) => assert!(m.contains("ffmpeg.exe"), "thông điệp phải nêu tên file: {m}"),
        e => panic!("mong Io, nhận {e:?}"),
    }
}

#[test]
fn place_rejects_path_traversal_entries() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().join("models");
    let zip_path = dir.path().join("evil.zip");
    make_zip(&zip_path, &[("piper/../../evil.txt", b"PWN"), ("piper/ok.txt", b"OK")]);

    let s = spec("piper", Archive::Zip, vec![(Some("piper/"), "piper")]);
    let err = place_files(&zip_path, &s, &models).unwrap_err();
    match err {
        PipelineError::Io(m) => assert!(m.contains("không hợp lệ"), "{m}"),
        e => panic!("mong Io, nhận {e:?}"),
    }
    assert!(!dir.path().join("evil.txt").exists());
}

use app_lib::components::{install_component, is_installed};

#[test]
fn install_downloads_places_and_records_state() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(GET).path("/model.onnx");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();

    let mut s = spec("sense-voice", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    s.url = server.url("/model.onnx");
    s.sha256 = HELLO_SHA.into();

    assert!(!is_installed(&s, &models));
    install_component(&s, &models, &mut |_| {}).unwrap();

    assert_eq!(std::fs::read(models.join("sherpa/sense-voice.onnx")).unwrap(), b"hello world");
    assert!(models.join(".state").join("sense-voice.json").exists());
    assert!(is_installed(&s, &models));
    m.assert_hits(1);

    // Lần 2: bỏ qua hoàn toàn, không phát request nào nữa.
    install_component(&s, &models, &mut |_| {}).unwrap();
    m.assert_hits(1);
}

#[test]
fn install_with_bad_hash_leaves_no_target_and_no_state() {
    let server = MockServer::start();
    server.mock(|when, then| {
        when.method(GET).path("/bad.onnx");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();

    let mut s = spec("sense-voice", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    s.url = server.url("/bad.onnx");
    s.sha256 = "0000000000000000000000000000000000000000000000000000000000000000".into();

    assert!(install_component(&s, &models, &mut |_| {}).is_err());
    assert!(!models.join("sherpa/sense-voice.onnx").exists());
    assert!(!models.join(".state").join("sense-voice.json").exists());
    assert!(!is_installed(&s, &models));
}

#[test]
fn is_installed_false_when_state_hash_differs() {
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();
    std::fs::create_dir_all(models.join("sherpa")).unwrap();
    std::fs::write(models.join("sherpa/sense-voice.onnx"), b"x").unwrap();
    std::fs::create_dir_all(models.join(".state")).unwrap();
    std::fs::write(
        models.join(".state").join("sense-voice.json"),
        r#"{"sha256":"cũ","files":["sherpa/sense-voice.onnx"]}"#,
    )
    .unwrap();

    let mut s = spec("sense-voice", Archive::Raw, vec![(None, "sherpa/sense-voice.onnx")]);
    s.sha256 = "mới".into();
    assert!(!is_installed(&s, &models), "sha256 đổi ⇒ phải cài lại");
}

use app_lib::components::install_specs;

#[test]
fn install_specs_stops_after_first_failing_component() {
    let server = MockServer::start();
    let m1 = server.mock(|when, then| {
        when.method(GET).path("/fail.bin");
        then.status(200).body("hello world");
    });
    let m2 = server.mock(|when, then| {
        when.method(GET).path("/never.bin");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();

    // spec đầu: hash khai báo sai ⇒ download_verified sẽ lỗi ChecksumMismatch.
    let mut s1 = spec("comp-a", Archive::Raw, vec![(None, "a/a.bin")]);
    s1.url = server.url("/fail.bin");
    s1.sha256 = "0000000000000000000000000000000000000000000000000000000000000000".into();

    // spec sau: hash đúng, nhưng không được phép chạm tới vì spec đầu đã lỗi.
    let mut s2 = spec("comp-b", Archive::Raw, vec![(None, "b/b.bin")]);
    s2.url = server.url("/never.bin");
    s2.sha256 = HELLO_SHA.into();

    let err = install_specs(&[s1, s2], &models, &mut |_, _| {});
    assert!(err.is_err(), "install_specs phải trả lỗi khi spec đầu lỗi");

    m1.assert_hits(1);
    m2.assert_hits(0);
}

#[test]
fn install_specs_rejects_unpinned_sha256_before_any_network_call() {
    let server = MockServer::start();
    let m = server.mock(|when, then| {
        when.method(GET).path("/unpinned.bin");
        then.status(200).body("hello world");
    });
    let dir = tempfile::tempdir().unwrap();
    let models = dir.path().to_path_buf();

    let mut s = spec("comp-c", Archive::Raw, vec![(None, "c/c.bin")]);
    s.url = server.url("/unpinned.bin");
    s.sha256 = String::new();

    let err = install_specs(&[s], &models, &mut |_, _| {}).unwrap_err();
    match err {
        PipelineError::Io(msg) => {
            assert!(msg.contains("comp-c"), "thông điệp phải nêu id component: {msg}");
            assert!(msg.contains("chưa ghim"), "thông điệp phải nói rõ chưa ghim sha256: {msg}");
        }
        e => panic!("mong Io, nhận {e:?}"),
    }
    m.assert_hits(0);
}

/// Thư mục trống ⇒ chưa cài gì ⇒ phải trả false, nếu không giao diện sẽ ẩn mất
/// nút tải duy nhất trên một máy chưa có engine nào.
#[test]
fn all_installed_false_khi_chua_cai_gi() {
    let d = tempfile::tempdir().unwrap();
    assert!(!app_lib::components::all_installed(d.path()).unwrap());
}

/// Sổ `.state` hỏng (đúng tên tệp nhưng không phải JSON hợp lệ) cũng phải ra
/// false chứ không được nổ — đây là trạng thái có thật khi lần tải trước bị
/// cắt ngang.
#[test]
fn all_installed_false_khi_state_hong() {
    let d = tempfile::tempdir().unwrap();
    let st = d.path().join(".state");
    std::fs::create_dir_all(&st).unwrap();
    for s in app_lib::components::specs().unwrap() {
        std::fs::write(st.join(format!("{}.json", s.id)), "{ khong phai json").unwrap();
    }
    assert!(!app_lib::components::all_installed(d.path()).unwrap());
}

/// `from: "**"` lấy trọn gói. Cần cho llama.cpp: 55 file nằm ngay gốc zip,
/// không có thư mục bọc nên không tiền tố nào khớp được.
#[test]
fn sao_ca_goi_lay_du_moi_file() {
    let d = tempfile::tempdir().unwrap();
    let zip = d.path().join("g.zip");
    make_zip(&zip, &[
        ("llama-server.exe", b"A"),
        ("ggml.dll", b"B"),
        ("cudart64_13.dll", b"C"),
    ]);
    let s = spec("llama-bin", Archive::Zip, vec![(Some("**"), "llm/bin")]);
    let models = d.path().join("models");
    let ra = app_lib::components::place_files(&zip, &s, &models).unwrap();
    assert_eq!(ra.len(), 3, "{ra:?}");
    for f in ["llama-server.exe", "ggml.dll", "cudart64_13.dll"] {
        assert!(models.join("llm/bin").join(f).is_file(), "thiếu {f}");
    }
}

/// Tên entry đi THẲNG từ archive vào đường dẫn đích, không qua một `from` do
/// người viết spec kiểm soát — nên đây là chỗ duy nhất trong hệ component mà
/// kẻ dựng archive tự chọn được đường dẫn ghi ra.
#[test]
fn sao_ca_goi_chan_duong_dan_doc() {
    let d = tempfile::tempdir().unwrap();
    let models = d.path().join("models");

    for (ten, entry) in [
        ("leo", "../../evil.dll"),
        ("tuyet_doi", "/etc/evil.dll"),
        ("o_dia", "C:/Windows/evil.dll"),
    ] {
        let zip = d.path().join(format!("{ten}.zip"));
        make_zip(&zip, &[(entry, b"X")]);
        let s = spec("doc", Archive::Zip, vec![(Some("**"), "llm/bin")]);
        let r = app_lib::components::place_files(&zip, &s, &models);
        assert!(r.is_err(), "entry '{entry}' phải bị chặn");
    }
    assert!(!d.path().join("evil.dll").exists());
}

/// Archive không có entry nào ⇒ lỗi to tiếng. Nếu im lặng báo thành công thì
/// `.state` ghi "đã cài" và app chết lúc chạy, xa chỗ gây lỗi.
#[test]
fn sao_ca_goi_rong_thi_bao_loi() {
    let d = tempfile::tempdir().unwrap();
    let zip = d.path().join("rong.zip");
    make_zip(&zip, &[]);
    let s = spec("rong", Archive::Zip, vec![(Some("**"), "llm/bin")]);
    let r = app_lib::components::place_files(&zip, &s, &d.path().join("models"));
    assert!(r.is_err(), "gói rỗng phải báo lỗi");
}

/// `target_for` dùng chung cho MỌI component. Sửa hỏng là ffmpeg và VieNeu
/// chết theo, mà lỗi lại hiện ở chỗ khác hẳn.
#[test]
fn cac_dang_from_cu_khong_doi() {
    let d = tempfile::tempdir().unwrap();
    let models = d.path().join("models");

    // Dạng file lẻ, đúng kiểu ffmpeg đang khai.
    let z1 = d.path().join("le.zip");
    make_zip(&z1, &[("build/bin/ffmpeg.exe", b"F"), ("build/bin/bo_qua.txt", b"X")]);
    let s1 = spec("le", Archive::Zip, vec![(Some("build/bin/ffmpeg.exe"), "ffmpeg/ffmpeg.exe")]);
    let r1 = app_lib::components::place_files(&z1, &s1, &models).unwrap();
    assert_eq!(r1, vec!["ffmpeg/ffmpeg.exe".to_string()]);
    assert!(!models.join("ffmpeg/bo_qua.txt").exists(), "file không khai không được chép");

    // Dạng cây con.
    let z2 = d.path().join("cay.zip");
    make_zip(&z2, &[("pkg/a.txt", b"A"), ("pkg/sub/b.txt", b"B"), ("ngoai.txt", b"N")]);
    let s2 = spec("cay", Archive::Zip, vec![(Some("pkg/"), "dich")]);
    let mut r2 = app_lib::components::place_files(&z2, &s2, &models).unwrap();
    r2.sort();
    assert_eq!(r2, vec!["dich/a.txt".to_string(), "dich/sub/b.txt".to_string()]);
    assert!(!models.join("dich/ngoai.txt").exists());
}

/// Ba component của M9 phải có mặt, ghim sha256, và đổ vào đúng chỗ mà
/// `LlamaServer` sẽ đi tìm.
#[test]
fn manifest_co_du_bo_llm_tren_may() {
    let ss = app_lib::components::specs().unwrap();
    let lay = |id: &str| ss.iter().find(|s| s.id == id)
        .unwrap_or_else(|| panic!("thiếu component '{id}'"));

    for id in ["llama-bin", "llama-cudart", "gemma-3-12b"] {
        let s = lay(id);
        assert!(!s.sha256.trim().is_empty(), "'{id}' chưa ghim sha256");
        assert!(s.size > 0, "'{id}' chưa ghi size");
    }

    // Hai gói zip lấy trọn, cùng đổ vào một thư mục: llama-server.exe cần các
    // DLL của cudart nằm CẠNH nó thì Windows mới nạp được.
    for id in ["llama-bin", "llama-cudart"] {
        let s = lay(id);
        assert_eq!(s.files.len(), 1, "'{id}' chỉ cần một khai trọn gói");
        assert_eq!(s.files[0].from.as_deref(), Some("**"), "'{id}' phải khai from=\"**\"");
        assert_eq!(s.files[0].to, "llm/bin", "'{id}' phải đổ vào llm/bin");
    }

    let g = lay("gemma-3-12b");
    assert_eq!(g.files[0].to, "llm/gguf/gemma-3-12b-it-Q5_K_M.gguf");
}

/// Bản CUDA phải là 13.4. RTX 50-series là Blackwell (sm_120); bản 12.4 không
/// biên dịch cho kiến trúc này và server sẽ không chạy nổi.
#[test]
fn llama_dung_ban_cuda_13() {
    let ss = app_lib::components::specs().unwrap();
    for id in ["llama-bin", "llama-cudart"] {
        let s = ss.iter().find(|s| s.id == id).unwrap();
        assert!(s.url.contains("cuda-13"), "'{id}' phải là bản CUDA 13.x, đang là: {}", s.url);
        assert!(!s.url.contains("cuda-12"), "'{id}' không được dùng bản CUDA 12.x");
    }
}
