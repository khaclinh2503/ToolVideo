use app_lib::translate::llama_server::{
    cho_san_sang, cong_trong, doi_san_sang_va_kiem_song, hut_stderr_lien_tuc, DemStderr,
    LlamaServer,
};
use std::process::{Command, Stdio};
use std::time::Duration;

/// `/health` trả 200 NGAY khi tiến trình lên, nhưng lúc đó model còn đang nạp
/// và lời gọi dịch thật ăn 503. Đo thật khi dựng máy đo M9. Chờ theo `/health`
/// là chờ hụt, và biểu hiện thành một lỗi 503 khó hiểu giữa lúc dịch.
#[test]
fn san_sang_tinh_theo_loi_goi_that_khong_theo_health() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| { w.path("/health"); t.status(200).body("{}"); });
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(503).body("loading model");
    });
    let r = cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_millis(600));
    assert!(r.is_err(), "503 ở /v1/chat/completions thì KHÔNG được coi là sẵn sàng");
}

#[test]
fn san_sang_khi_loi_goi_that_tra_200() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(200).body(r#"{"choices":[{"message":{"content":"x"}}]}"#);
    });
    cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_secs(5)).unwrap();
}

/// Server lên nhưng không bao giờ nạp xong ⇒ phải hết giờ và báo rõ, không
/// treo app vô hạn.
#[test]
fn khong_bao_gio_san_sang_thi_het_gio() {
    let s = httpmock::MockServer::start();
    s.mock(|w, t| {
        w.method(httpmock::Method::POST).path("/v1/chat/completions");
        t.status(503);
    });
    let t0 = std::time::Instant::now();
    let r = cho_san_sang(&format!("{}/v1", s.base_url()), Duration::from_millis(800));
    assert!(r.is_err());
    assert!(t0.elapsed() < Duration::from_secs(5), "phải bỏ cuộc gần đúng hạn, không treo");
    let msg = format!("{}", r.unwrap_err());
    assert!(msg.contains("nạp") || msg.contains("sẵn sàng"), "thông báo phải nói rõ: {msg}");
}

/// Đóng cứng một cổng là rủi ro vì cổng có thể đang bận.
#[test]
fn cong_trong_khac_nhau_va_bind_duoc() {
    let a = cong_trong().unwrap();
    let b = cong_trong().unwrap();
    assert_ne!(a, 0);
    assert_ne!(b, 0);
    std::net::TcpListener::bind(("127.0.0.1", a)).expect("cổng phải bind được");
}

/// Thiếu engine hoặc thiếu model ⇒ lỗi phải chỉ thẳng người dùng đi tải bộ công
/// cụ, không phải một lỗi io trần trụi mà họ không biết nhìn đâu.
///
/// LƯU Ý: test này KHÔNG chạm tới nhánh đọc stderr — `khoi_dong` trả về trước
/// khi spawn. Nhánh stderr chỉ chạy khi một `llama-server.exe` CÓ THẬT chết lúc
/// nạp (thiếu DLL, driver cũ, GGUF hỏng), nên nó nằm ngoài tầm test thuần; xem
/// ghi chú cuối kế hoạch.
#[test]
fn thieu_engine_hoac_model_thi_chi_di_tai_bo_cong_cu() {
    let d = tempfile::tempdir().unwrap();

    // Thiếu exe.
    let gguf = d.path().join("k.gguf");
    std::fs::write(&gguf, b"x").unwrap();
    let r = LlamaServer::khoi_dong(&d.path().join("khong-co.exe"), &gguf);
    let msg = format!("{}", r.err().expect("thiếu exe phải lỗi"));
    assert!(msg.contains("bộ công cụ"), "phải chỉ đi tải, đang là: {msg}");

    // Thiếu model.
    let exe = d.path().join("co.exe");
    std::fs::write(&exe, b"x").unwrap();
    let r2 = LlamaServer::khoi_dong(&exe, &d.path().join("khong-co.gguf"));
    let msg2 = format!("{}", r2.err().expect("thiếu model phải lỗi"));
    assert!(msg2.contains("bộ công cụ"), "phải chỉ đi tải, đang là: {msg2}");
}

/// Bộ đệm stderr phải bị chặn trên: `llama-server` ghi log suốt cả phiên,
/// không ai giới hạn tự nhiên — giữ hết là rò rỉ bộ nhớ dần. Feed nhiều hơn
/// giới hạn rồi kiểm nó không phình vô hạn và vẫn giữ đúng dòng mới nhất
/// (thứ một chẩn đoán cần), không phải dòng cũ nhất.
#[test]
fn dem_stderr_bi_chan_tren_va_giu_dong_moi_nhat() {
    let dem = DemStderr::moi();
    let mut data = String::new();
    for i in 0..200 {
        data.push_str(&format!("line-{i}\n"));
    }
    hut_stderr_lien_tuc(std::io::Cursor::new(data.into_bytes()), dem.clone());

    let ra = dem.doc_ra();
    let so_dong = ra.split(" | ").count();
    assert!(so_dong <= 20, "phải bị chặn trên (còn 200 dòng feed vào), đang có {so_dong}");
    assert!(ra.contains("line-199"), "phải giữ dòng MỚI nhất: {ra}");
    assert!(!ra.contains("line-0 ") && !ra.ends_with("line-0"), "phải rớt dòng CŨ nhất khi vượt giới hạn: {ra}");
}

/// Đọc bộ đệm stderr không được đụng tới ống của tiến trình — đụng vào ống
/// (như bản cũ của `ly_do_chet`, dùng `read_to_string` trực tiếp) chỉ trả về
/// khi ống đóng, tức tiến trình đã chết. Gọi lúc tiến trình CÒN SỐNG (đây là
/// tình huống thật: `doi_san_sang` hết giờ vì model còn nạp dở, không phải vì
/// tiến trình chết) trước kia sẽ treo vô hạn.
#[test]
fn doc_bo_dem_stderr_khong_treo_khi_tien_trinh_con_song() {
    let mut child = Command::new("cmd")
        .args(["/C", "ping -n 6 127.0.0.1 >NUL"])
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .expect("cmd.exe phải chạy được trên Windows");

    let dem = DemStderr::moi();
    let nguon = child.stderr.take().unwrap();
    let dem2 = dem.clone();
    std::thread::spawn(move || hut_stderr_lien_tuc(nguon, dem2));

    // Tiến trình chắc chắn còn sống ở đây (ping -n 6 chạy vài giây).
    let t0 = std::time::Instant::now();
    let _ = dem.doc_ra();
    assert!(
        t0.elapsed() < Duration::from_millis(500),
        "đọc bộ đệm trong bộ nhớ không được chờ ống đóng: mất {:?}",
        t0.elapsed()
    );

    let _ = child.kill();
    let _ = child.wait();
}

/// Tiến trình chết sớm (ví dụ thua tranh chấp cổng ngay sau `cong_trong()`)
/// phải được báo là ĐÃ CHẾT ngay, không phải chờ hết `han` rồi báo nhầm
/// thành "model chưa nạp xong" — hai lỗi khác nhau, và chờ hết giờ cho một
/// tiến trình đã chết là chờ hụt vô nghĩa.
#[test]
fn tien_trinh_chet_thi_bao_chet_ngay_khong_doi_het_gio() {
    let mut child = Command::new("cmd")
        .args(["/C", "exit 1"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("cmd.exe phải chạy được trên Windows");

    let t0 = std::time::Instant::now();
    // Cổng 1 chắc chắn không có ai lắng nghe ⇒ mọi lời gọi HTTP đều lỗi
    // connect ngay, y hệt biểu hiện của một `llama-server` đã chết.
    let r = doi_san_sang_va_kiem_song(
        &mut child,
        "http://127.0.0.1:1/v1",
        Duration::from_secs(5),
        || "gia-lap-stderr".to_string(),
    );
    assert!(r.is_err(), "tiến trình đã chết thì không thể coi là sẵn sàng");
    assert!(
        t0.elapsed() < Duration::from_secs(3),
        "phải báo chết sớm, không đợi hết 5 giây: {:?}",
        t0.elapsed()
    );
    let msg = format!("{}", r.unwrap_err());
    assert!(
        msg.contains("tắt") || msg.contains("chết"),
        "thông báo phải nói rõ tiến trình đã tắt, không phải 'chưa nạp xong': {msg}"
    );
}

/// Chặn theo DÒNG thôi thì chưa đủ để nói "không rò rỉ bộ nhớ": "dòng" ở đây là
/// những gì `read_until(b'\n')` trả về, nên một luồng chỉ ngắt bằng `\r` (thanh
/// tiến trình) phình đúng MỘT mẩu không giới hạn. Phải chặn cả theo byte — và
/// vẫn giữ phần mới nhất, vì đó là chỗ có lỗi.
#[test]
fn dem_stderr_bi_chan_theo_byte_khong_chi_theo_dong() {
    let dem = DemStderr::moi();
    let mut data = vec![b'A'; 1_000_000];
    data.extend_from_slice(b"LOI-CUOI-CUNG");
    // Cả luồng KHÔNG có lấy một byte '\n' nào.
    assert!(!data.contains(&b'\n'));
    hut_stderr_lien_tuc(std::io::Cursor::new(data), dem.clone());

    let ra = dem.doc_ra();
    assert!(
        ra.len() <= 20 * 4096 + 1024,
        "bộ đệm phải bị chặn theo byte (feed vào 1 MB không xuống dòng), đang giữ {} byte",
        ra.len()
    );
    assert!(
        ra.contains("LOI-CUOI-CUNG"),
        "phải giữ phần MỚI NHẤT của luồng, không phải phần đầu"
    );
}

/// Hết giờ nạp model là hàng "VRAM đang bị việc khác chiếm" của spec §6, và
/// spec nói rõ phải GHI VÀO THÔNG BÁO để người dùng biết nhìn đâu. Trước đây
/// nhánh này chỉ trả về một con số giây trần trụi, trong khi nhánh tiến trình
/// chết thì có đuôi stderr — người gặp lỗi thường xuyên nhất lại là người không
/// nhận được chẩn đoán nào.
#[test]
fn het_gio_nap_van_kem_chan_doan_stderr() {
    let mut child = Command::new("cmd")
        .args(["/C", "ping -n 6 127.0.0.1 >NUL"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .expect("cmd.exe phải chạy được trên Windows");

    // Cổng 1 không có ai nghe ⇒ không bao giờ sẵn sàng, mà tiến trình con thì
    // VẪN SỐNG suốt — đúng hình dạng của "model nạp chưa xong".
    let r = doi_san_sang_va_kiem_song(
        &mut child,
        "http://127.0.0.1:1/v1",
        Duration::from_millis(900),
        || "DAU-VET-STDERR-CUOI-CUNG".to_string(),
    );
    let _ = child.kill();
    let _ = child.wait();

    let msg = format!("{}", r.err().expect("không sẵn sàng thì phải lỗi"));
    assert!(
        msg.contains("DAU-VET-STDERR-CUOI-CUNG"),
        "nhánh hết giờ cũng phải kèm đuôi stderr: {msg}"
    );
    assert!(
        msg.contains("VRAM"),
        "phải chỉ người dùng nhìn vào VRAM đang bị chiếm (spec §6): {msg}"
    );
}
