use crate::error::PipelineError;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::io::{Read, Write};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
pub enum Archive {
    #[serde(rename = "zip")]
    Zip,
    #[serde(rename = "tar.bz2")]
    TarBz2,
    #[serde(rename = "raw")]
    Raw,
}

#[derive(Debug, Clone, Deserialize)]
pub struct FileMap {
    /// `None` ⇒ archive = Raw (chính file tải về).
    /// `Some("a/b/c.exe")` ⇒ 1 file trong archive.
    /// `Some("a/b/")` ⇒ cả cây con (kết bằng '/').
    pub from: Option<String>,
    /// Đường dẫn đích, tương đối `models_dir()`, luôn dùng '/'.
    pub to: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ComponentSpec {
    pub id: String,
    pub url: String,
    pub sha256: String,
    pub size: u64,
    pub archive: Archive,
    pub files: Vec<FileMap>,
}

#[derive(Debug, Clone, Copy)]
pub enum Progress {
    Download { done: u64, total: u64 },
    Extract,
    Done,
}

pub fn specs() -> Result<Vec<ComponentSpec>, PipelineError> {
    serde_json::from_str(include_str!("../components.json"))
        .map_err(|e| PipelineError::Io(format!("components.json hỏng: {e}")))
}

pub fn verify_sha256(path: &Path, expected: &str) -> Result<(), PipelineError> {
    let bytes = std::fs::read(path).map_err(|e| PipelineError::Io(e.to_string()))?;
    let got = format!("{:x}", Sha256::digest(&bytes));
    if got.eq_ignore_ascii_case(expected) {
        Ok(())
    } else {
        Err(PipelineError::ChecksumMismatch {
            expected: expected.into(),
            got,
        })
    }
}

/// Tải `url` về `dest` theo luồng, vừa ghi vừa băm sha256.
/// Sai hash hay lỗi I/O ⇒ xoá `dest` và trả lỗi.
pub fn download_verified(
    url: &str,
    dest: &Path,
    expected_sha256: &str,
    on: &mut dyn FnMut(Progress),
) -> Result<(), PipelineError> {
    if let Some(d) = dest.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let client = reqwest::blocking::Client::builder()
        .user_agent("DichVideo-Local/0.1")
        .connect_timeout(std::time::Duration::from_secs(30))
        .timeout(None)
        .build()
        .map_err(|e| PipelineError::Io(e.to_string()))?;

    let mut resp = client
        .get(url)
        .send()
        .map_err(|e| PipelineError::Io(format!("không tải được {url}: {e}")))?;
    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        return Err(PipelineError::Io(format!(
            "không tải được {url}: HTTP {status}"
        )));
    }

    let result = (|| -> Result<String, PipelineError> {
        let total = resp.content_length().unwrap_or(0);
        let mut file = std::fs::File::create(dest).map_err(|e| PipelineError::Io(e.to_string()))?;
        let mut hasher = Sha256::new();
        let mut buf = vec![0u8; 65536];
        let mut done: u64 = 0;
        let mut last = std::time::Instant::now();
        loop {
            let n = resp
                .read(&mut buf)
                .map_err(|e| PipelineError::Io(format!("đứt kết nối khi tải {url}: {e}")))?;
            if n == 0 {
                break;
            }
            hasher.update(&buf[..n]);
            file.write_all(&buf[..n]).map_err(|e| PipelineError::Io(e.to_string()))?;
            done += n as u64;
            if last.elapsed() >= std::time::Duration::from_millis(100) {
                last = std::time::Instant::now();
                on(Progress::Download { done, total });
            }
        }
        file.flush().map_err(|e| PipelineError::Io(e.to_string()))?;
        drop(file);
        on(Progress::Download { done, total });

        Ok(format!("{:x}", hasher.finalize()))
    })();

    match result {
        Ok(got) => {
            if !got.eq_ignore_ascii_case(expected_sha256) {
                let _ = std::fs::remove_file(dest);
                return Err(PipelineError::ChecksumMismatch {
                    expected: expected_sha256.to_string(),
                    got,
                });
            }
            Ok(())
        }
        Err(e) => {
            let _ = std::fs::remove_file(dest);
            Err(e)
        }
    }
}

/// Ghép `models` + đường dẫn tương đối, từ chối mọi đường đi ra ngoài `models`.
fn safe_join(models: &Path, rel: &str) -> Result<PathBuf, PipelineError> {
    if rel.is_empty() || rel.contains("..") || rel.starts_with('/') || rel.contains(':') {
        return Err(PipelineError::Io(format!("đường dẫn trong gói không hợp lệ: '{rel}'")));
    }
    Ok(models.join(rel.replace('/', std::path::MAIN_SEPARATOR_STR)))
}

fn write_member(models: &Path, rel_to: &str, data: &[u8]) -> Result<(), PipelineError> {
    let out = safe_join(models, rel_to)?;
    if let Some(d) = out.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    std::fs::write(&out, data).map_err(|e| PipelineError::Io(e.to_string()))
}

/// Đích tương ứng cho một entry trong archive, hoặc `None` nếu entry không được khai báo.
/// `from` kết bằng '/' ⇒ cây con: đích = `to` + phần đuôi sau tiền tố.
fn target_for(files: &[FileMap], entry: &str) -> Option<String> {
    for f in files {
        let Some(from) = f.from.as_deref() else { continue };
        if let Some(prefix) = from.strip_suffix('/') {
            let prefix = format!("{prefix}/");
            if let Some(rest) = entry.strip_prefix(&prefix) {
                if !rest.is_empty() {
                    return Some(format!("{}/{}", f.to.trim_end_matches('/'), rest));
                }
            }
        } else if entry == from {
            return Some(f.to.clone());
        }
    }
    None
}

/// Đặt các file khai báo trong `spec.files` từ `archive_path` vào `models`.
/// Trả danh sách đích tương đối đã ghi (dùng '/').
pub fn place_files(
    archive_path: &Path,
    spec: &ComponentSpec,
    models: &Path,
) -> Result<Vec<String>, PipelineError> {
    let mut written: Vec<String> = Vec::new();

    match spec.archive {
        Archive::Raw => {
            let to = &spec.files[0].to;
            let out = safe_join(models, to)?;
            if let Some(d) = out.parent() {
                std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
            }
            // rename có thể thất bại khi khác volume ⇒ fallback copy.
            if std::fs::rename(archive_path, &out).is_err() {
                std::fs::copy(archive_path, &out).map_err(|e| PipelineError::Io(e.to_string()))?;
                let _ = std::fs::remove_file(archive_path);
            }
            written.push(to.clone());
        }
        Archive::Zip => {
            let f = std::fs::File::open(archive_path).map_err(|e| PipelineError::Io(e.to_string()))?;
            let mut z = zip::ZipArchive::new(f).map_err(|e| PipelineError::Io(e.to_string()))?;
            for i in 0..z.len() {
                let mut e = z.by_index(i).map_err(|e| PipelineError::Io(e.to_string()))?;
                if e.is_dir() {
                    continue;
                }
                let name = e.name().replace('\\', "/");
                let Some(to) = target_for(&spec.files, &name) else { continue };
                let mut data = Vec::with_capacity(e.size() as usize);
                e.read_to_end(&mut data).map_err(|e| PipelineError::Io(e.to_string()))?;
                write_member(models, &to, &data)?;
                written.push(to);
            }
        }
        Archive::TarBz2 => {
            let f = std::fs::File::open(archive_path).map_err(|e| PipelineError::Io(e.to_string()))?;
            let dec = bzip2::read::BzDecoder::new(f);
            let mut t = tar::Archive::new(dec);
            for e in t.entries().map_err(|e| PipelineError::Io(e.to_string()))? {
                let mut e = e.map_err(|e| PipelineError::Io(e.to_string()))?;
                if !e.header().entry_type().is_file() {
                    continue;
                }
                let name = e
                    .path()
                    .map_err(|e| PipelineError::Io(e.to_string()))?
                    .to_string_lossy()
                    .replace('\\', "/");
                let Some(to) = target_for(&spec.files, &name) else { continue };
                let mut data = Vec::new();
                e.read_to_end(&mut data).map_err(|e| PipelineError::Io(e.to_string()))?;
                write_member(models, &to, &data)?;
                written.push(to);
            }
        }
    }

    // Mọi `from` là file lẻ đều phải tìm thấy; cây con phải chép được ít nhất 1 file.
    for f in &spec.files {
        let Some(from) = f.from.as_deref() else { continue };
        let found = if from.ends_with('/') {
            written.iter().any(|w| w.starts_with(&format!("{}/", f.to.trim_end_matches('/'))))
        } else {
            written.iter().any(|w| w == &f.to)
        };
        if !found {
            return Err(PipelineError::Io(format!(
                "gói '{}' thiếu '{from}' — bố cục archive đã đổi, cập nhật components.json",
                spec.id
            )));
        }
    }
    Ok(written)
}

#[derive(serde::Serialize, serde::Deserialize)]
struct InstallState {
    sha256: String,
    files: Vec<String>,
}

fn state_path(models: &Path, id: &str) -> PathBuf {
    models.join(".state").join(format!("{id}.json"))
}

/// Đã cài = sổ `.state` ghi đúng sha256 hiện hành **và** mọi file trong sổ còn tồn tại.
pub fn is_installed(spec: &ComponentSpec, models: &Path) -> bool {
    let Ok(text) = std::fs::read_to_string(state_path(models, &spec.id)) else {
        return false;
    };
    let Ok(st) = serde_json::from_str::<InstallState>(&text) else {
        return false;
    };
    if !st.sha256.eq_ignore_ascii_case(&spec.sha256) {
        return false;
    }
    !st.files.is_empty()
        && st.files.iter().all(|f| {
            safe_join(models, f).map(|p| p.exists()).unwrap_or(false)
        })
}

/// Đã cài đủ chưa — dùng để ẩn mục "Bộ công cụ offline" khi không còn việc gì
/// để làm. Danh sách rỗng coi là **chưa** đủ: nếu không đọc nổi spec nào thì
/// nói "xong" là nói dối, và người dùng sẽ mất luôn nút tải duy nhất.
pub fn all_installed(models: &Path) -> Result<bool, PipelineError> {
    let specs = specs()?;
    Ok(!specs.is_empty() && specs.iter().all(|s| is_installed(s, models)))
}

pub fn install_component(
    spec: &ComponentSpec,
    models: &Path,
    on: &mut dyn FnMut(Progress),
) -> Result<(), PipelineError> {
    if is_installed(spec, models) {
        on(Progress::Done);
        return Ok(());
    }
    let tmp_dir = models.join(".tmp");
    std::fs::create_dir_all(&tmp_dir).map_err(|e| PipelineError::Io(e.to_string()))?;
    let part = tmp_dir.join(format!("{}.part", spec.id));

    download_verified(&spec.url, &part, &spec.sha256, on)?;

    on(Progress::Extract);
    let files = place_files(&part, spec, models)?;
    let _ = std::fs::remove_file(&part);

    let sp = state_path(models, &spec.id);
    if let Some(d) = sp.parent() {
        std::fs::create_dir_all(d).map_err(|e| PipelineError::Io(e.to_string()))?;
    }
    let st = InstallState { sha256: spec.sha256.clone(), files };
    std::fs::write(
        &sp,
        serde_json::to_string_pretty(&st).map_err(|e| PipelineError::Io(e.to_string()))?,
    )
    .map_err(|e| PipelineError::Io(e.to_string()))?;

    on(Progress::Done);
    Ok(())
}

/// Cài lần lượt các `specs` đã cho; dừng ngay ở cái đầu tiên lỗi.
/// Tách khỏi `install_all` để có thể test bằng spec tự tạo (mock),
/// không phụ thuộc `components.json` thật (tránh tải mạng thật khi test).
pub fn install_specs(
    specs: &[ComponentSpec],
    models: &Path,
    on: &mut dyn FnMut(&str, Progress),
) -> Result<(), PipelineError> {
    for spec in specs {
        if spec.sha256.trim().is_empty() {
            return Err(PipelineError::Io(format!(
                "component '{}' chưa ghim sha256 trong components.json — chạy `cargo run --bin pin_components`",
                spec.id
            )));
        }
        let id = spec.id.clone();
        install_component(spec, models, &mut |p| on(&id, p))?;
    }
    Ok(())
}

/// Cài lần lượt mọi component; dừng ngay ở cái đầu tiên lỗi.
pub fn install_all(
    models: &Path,
    on: &mut dyn FnMut(&str, Progress),
) -> Result<(), PipelineError> {
    install_specs(&specs()?, models, on)
}
