//! Công cụ DEV (không đóng gói vào app): tải từng artifact trong components.json,
//! in sha256 + size thật và liệt kê entry đầu của archive để chốt chuỗi `from`.
//!
//!   cd src-tauri && cargo run --bin pin_components
//!
//! Sau đó chép giá trị in ra vào components.json rồi commit.

use app_lib::components::{specs, Archive};
use sha2::{Digest, Sha256};
use std::io::Read;

fn sha256_of(path: &std::path::Path) -> std::io::Result<(String, u64)> {
    let mut f = std::fs::File::open(path)?;
    let mut h = Sha256::new();
    let mut buf = vec![0u8; 65536];
    let mut n_total = 0u64;
    loop {
        let n = f.read(&mut buf)?;
        if n == 0 { break; }
        h.update(&buf[..n]);
        n_total += n as u64;
    }
    Ok((format!("{:x}", h.finalize()), n_total))
}

fn list_entries(path: &std::path::Path, archive: Archive) -> Vec<String> {
    let mut out = Vec::new();
    match archive {
        Archive::Zip => {
            if let Ok(f) = std::fs::File::open(path) {
                if let Ok(mut z) = zip::ZipArchive::new(f) {
                    for i in 0..z.len() {
                        if let Ok(e) = z.by_index(i) {
                            out.push(e.name().to_string());
                        }
                    }
                }
            }
        }
        Archive::TarBz2 => {
            if let Ok(f) = std::fs::File::open(path) {
                let dec = bzip2::read::BzDecoder::new(f);
                let mut t = tar::Archive::new(dec);
                if let Ok(entries) = t.entries() {
                    for e in entries.flatten() {
                        if let Ok(p) = e.path() {
                            out.push(p.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
        Archive::Raw => {}
    }
    out
}

fn main() {
    let dir = std::env::temp_dir().join("dvl-pin");
    std::fs::create_dir_all(&dir).unwrap();
    let specs = specs().expect("components.json hỏng");

    for s in &specs {
        let dest = dir.join(format!("{}.bin", s.id));
        if !dest.exists() {
            eprintln!("--> tải {} ...", s.id);
            // Ghim = chấp nhận bất kỳ hash nào ở lần đầu: tải bằng client thô, không verify.
            let mut resp = reqwest::blocking::Client::builder()
                .user_agent("DichVideo-Local/0.1")
                .connect_timeout(std::time::Duration::from_secs(30))
                .timeout(None)
                .build()
                .unwrap()
                .get(&s.url)
                .send()
                .unwrap_or_else(|e| panic!("{}: {e}", s.id));
            assert!(resp.status().is_success(), "{}: HTTP {}", s.id, resp.status());
            let mut f = std::fs::File::create(&dest).unwrap();
            std::io::copy(&mut resp, &mut f).unwrap();
        }
        let (sha, size) = sha256_of(&dest).unwrap();
        println!("\n=== {} ===\n  \"sha256\": \"{sha}\",\n  \"size\": {size},", s.id);

        let entries = list_entries(&dest, s.archive);
        if !entries.is_empty() {
            println!("  entries ({}), 40 dòng đầu:", entries.len());
            for e in entries.iter().take(40) {
                println!("    {e}");
            }
        }
    }
    println!("\nChép các giá trị trên vào src-tauri/components.json (và sửa 'from' nếu lệch).");
}
