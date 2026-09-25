use app_lib::commands::SttResultDto;

#[test]
fn dto_from_result() {
    let dto = SttResultDto {
        srt_path: "a/source.srt".into(),
        cue_count: 3,
        project_dir: "a".into(),
    };
    let js = serde_json::to_string(&dto).unwrap();
    assert!(js.contains("\"cueCount\":3"));
}

#[test]
fn dtos_are_camel_case_and_stt_has_project_dir() {
    let s = app_lib::commands::SttResultDto { srt_path: "a".into(), cue_count: 1, project_dir: "p".into() };
    let js = serde_json::to_string(&s).unwrap();
    assert!(js.contains("\"projectDir\":\"p\"") && js.contains("\"cueCount\":1"));
    let t = app_lib::commands::TranslateResultDto { srt_path: "b".into(), cue_count: 2 };
    assert!(serde_json::to_string(&t).unwrap().contains("\"cueCount\":2"));
}

#[test]
fn component_progress_event_is_camel_case_with_expected_phases() {
    let ev = app_lib::commands::ComponentProgressEvent {
        id: "ffmpeg".into(),
        phase: "download",
        done: 1,
        total: 2,
    };
    let js = serde_json::to_string(&ev).unwrap();
    assert!(js.contains("\"id\":\"ffmpeg\""));
    assert!(js.contains("\"phase\":\"download\""));
    assert!(js.contains("\"done\":1"));
    assert!(js.contains("\"total\":2"));

    // App.tsx branches on these three literal phase strings.
    for phase in ["download", "extract", "done"] {
        let ev = app_lib::commands::ComponentProgressEvent {
            id: "x".into(),
            phase,
            done: 0,
            total: 0,
        };
        let js = serde_json::to_string(&ev).unwrap();
        assert!(js.contains(&format!("\"phase\":\"{phase}\"")));
    }
}

#[test]
fn components_missing_report_lists_ids_not_yet_installed() {
    let dir = tempfile::tempdir().unwrap();
    let missing = app_lib::commands::missing_component_ids(dir.path()).unwrap();
    // So với chính danh sách spec chứ không ghim con số: ý cần khẳng định là
    // "thư mục trống ⇒ THIẾU HẾT", và thêm một component mới không được làm
    // test này đỏ oan. Vẫn bắt được lỗi thật (lọc nhầm, trùng, rơi mục) vì so
    // cả tập id chứ không chỉ số lượng.
    let tat_ca: Vec<String> = app_lib::components::specs()
        .unwrap()
        .into_iter()
        .map(|s| s.id)
        .collect();
    assert_eq!(missing, tat_ca, "thư mục trống ⇒ mọi component đều phải bị báo thiếu");
    assert!(missing.contains(&"piper".to_string()));
    assert!(missing.contains(&"yt-dlp".to_string()));
}

#[test]
fn export_dto_serialize_ra_camel_case() {
    let dto = app_lib::commands::ExportResultDto {
        output_path: r"E:\du an\output\final.mp4".into(),
        adjusted: 3,
        capped: 1,
        placed: 42,
        truncated: 0,
        saturated: 0,
    };
    let j = serde_json::to_string(&dto).unwrap();
    assert!(j.contains("\"outputPath\""), "UI đọc camelCase: {j}");
    assert!(!j.contains("output_path"), "{j}");
}

#[test]
fn export_progress_event_giu_nguyen_4_ten_phase() {
    // App.tsx branches on these four literal phase strings verbatim.
    for phase in ["retime", "dub", "encode", "done"] {
        let ev = app_lib::commands::ExportProgressEvent { phase: phase.into() };
        let j = serde_json::to_string(&ev).unwrap();
        assert_eq!(j, format!("{{\"phase\":\"{phase}\"}}"), "{j}");
    }
}

#[test]
fn project_summary_dto_serialize_ra_camel_case() {
    let s = app_lib::project::ProjectSummary {
        project_dir: std::path::PathBuf::from(r"E:\du an\p1"),
        meta: app_lib::project::ProjectMeta {
            version: 1,
            video_path: r"E:\phim\clip.mp4".into(),
            src_lang: "zh".into(),
            tgt_lang: "vi".into(),
            created_at: 1,
            updated_at: 2,
            export_path: None,
        },
        status: app_lib::project::ProjectStatus {
            has_stt: true,
            has_translation: false,
            has_tts: false,
            has_export: false,
            video_exists: true,
        },
    };
    let j = serde_json::to_string(&app_lib::commands::summary_to_dto(&s)).unwrap();

    // Cặp đa từ mới phân biệt được rename_all; trường một từ thì không.
    assert!(j.contains("\"projectDir\""), "{j}");
    assert!(!j.contains("project_dir"), "{j}");
    assert!(j.contains("\"videoName\":\"clip.mp4\""), "{j}");
    assert!(j.contains("\"hasStt\":true"), "{j}");
    assert!(j.contains("\"videoExists\":true"), "{j}");
}

#[test]
fn video_name_roi_ve_ca_duong_dan_khi_khong_tach_duoc_ten_file() {
    // ".." không có `file_name()` (tra ve None), nhung fallback dung phai la
    // chinh chuoi video_path (khong rong) -- phan biet duoc voi mot fallback
    // sai kieu `.unwrap_or_default()` cung tra ve "" nhu ca tren duong dan rong.
    let s = app_lib::project::ProjectSummary {
        project_dir: std::path::PathBuf::from("p"),
        meta: app_lib::project::ProjectMeta {
            version: 1,
            video_path: "..".into(),
            src_lang: "zh".into(),
            tgt_lang: "vi".into(),
            created_at: 1,
            updated_at: 2,
            export_path: None,
        },
        status: app_lib::project::ProjectStatus {
            has_stt: false,
            has_translation: false,
            has_tts: false,
            has_export: false,
            video_exists: false,
        },
    };
    assert_eq!(app_lib::commands::summary_to_dto(&s).video_name, "..");
}

#[test]
fn src_langs_khong_rong_va_co_gia_tri_mac_dinh_o_dau() {
    // UI lấy phần tử đầu làm mặc định cho ô chọn.
    assert!(!app_lib::stt::SRC_LANGS.is_empty());
}

#[test]
fn new_project_meta_khong_hoan_doi_src_va_tgt() {
    let m = app_lib::project::new_project_meta(
        std::path::Path::new(r"E:\phim\clip.mp4"),
        "ja",
        "vi",
        123,
    );
    assert_eq!(m.src_lang, "ja");
    assert_eq!(m.tgt_lang, "vi");
}

#[test]
fn new_project_meta_video_path_tu_tham_so_video_chu_khong_phai_tu_dau_khac() {
    let m = app_lib::project::new_project_meta(
        std::path::Path::new(r"E:\phim\clip.mp4"),
        "ja",
        "vi",
        123,
    );
    assert_eq!(m.video_path, r"E:\phim\clip.mp4");
}

#[test]
fn new_project_meta_created_va_updated_bang_nhau_luc_tao() {
    let m = app_lib::project::new_project_meta(std::path::Path::new("v.mp4"), "ja", "vi", 999);
    assert_eq!(m.created_at, 999);
    assert_eq!(m.updated_at, 999);
    assert_eq!(m.created_at, m.updated_at);
}

#[test]
fn new_project_meta_trim_khoang_trang_quanh_ma_ngon_ngu() {
    // I1: một `tgt_lang` còn khoảng trắng thừa sẽ không khớp tên file
    // `translated.<tgt>.srt` mà `run_translate_stage` sinh ra (nó tự trim),
    // khiến `status()` không bao giờ tìm thấy bản dịch đã có trên đĩa.
    let m = app_lib::project::new_project_meta(std::path::Path::new("v.mp4"), " ja ", "vi ", 1);
    assert_eq!(m.src_lang, "ja");
    assert_eq!(m.tgt_lang, "vi");
}

#[test]
fn cue_dto_serialize_ra_camel_case() {
    let v = app_lib::cues::CueView {
        index: 3,
        start_ms: 1000,
        end_ms: 2000,
        text: "Xin chào".into(),
        duration_ms: 900,
        audio_path: Some(std::path::PathBuf::from(r"E:\du an\tts\segments\cue-0003.wav")),
        stale: true,
    };
    let j = serde_json::to_string(&app_lib::commands::cue_to_dto(&v)).unwrap();

    // Cặp đa từ mới phân biệt được rename_all; trường một từ thì không.
    assert!(j.contains("\"startMs\":1000"), "{j}");
    assert!(!j.contains("start_ms"), "{j}");
    assert!(j.contains("\"durationMs\":900"), "{j}");
    assert!(j.contains("\"audioPath\""), "{j}");
    assert!(j.contains("\"stale\":true"), "{j}");
}

#[test]
fn cue_dto_audio_path_null_khi_chua_co_giong() {
    let v = app_lib::cues::CueView {
        index: 1,
        start_ms: 0,
        end_ms: 1000,
        text: "X".into(),
        duration_ms: 0,
        audio_path: None,
        stale: true,
    };
    let j = serde_json::to_string(&app_lib::commands::cue_to_dto(&v)).unwrap();
    assert!(j.contains("\"audioPath\":null"), "{j}");
}
