use app_lib::project::delete;
use std::path::Path;

fn mkdir(p: &Path) {
    std::fs::create_dir_all(p).unwrap();
    std::fs::write(p.join("giu-lai.txt"), b"x").unwrap();
}

#[test]
fn xoa_duoc_du_an_that() {
    let root = tempfile::tempdir().unwrap();
    let p = root.path().join("p1");
    mkdir(&p);
    mkdir(&p.join("tts/segments"));

    delete(root.path(), &p).unwrap();
    assert!(!p.exists(), "thư mục dự án phải biến mất");
    assert!(root.path().exists(), "thư mục gốc phải còn nguyên");
}

#[test]
fn tu_choi_xoa_chinh_thu_muc_goc() {
    let root = tempfile::tempdir().unwrap();
    mkdir(&root.path().join("p1"));

    let e = delete(root.path(), root.path()).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(root.path().exists(), "thư mục gốc VẪN PHẢI còn sau lời gọi bị từ chối");
    assert!(root.path().join("p1").exists());
}

#[test]
fn tu_choi_thu_muc_nam_ngoai_root() {
    let root = tempfile::tempdir().unwrap();
    let ngoai = tempfile::tempdir().unwrap();
    mkdir(&ngoai.path().join("quan-trong"));

    let e = delete(root.path(), &ngoai.path().join("quan-trong")).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(
        ngoai.path().join("quan-trong").exists(),
        "thư mục ngoài VẪN PHẢI còn sau lời gọi bị từ chối"
    );
}

#[test]
fn tu_choi_duong_dan_dung_hai_cham_de_thoat_ra_ngoai() {
    let root = tempfile::tempdir().unwrap();
    let ngoai = tempfile::tempdir().unwrap();
    mkdir(&ngoai.path().join("quan-trong"));
    mkdir(&root.path().join("p1"));

    // root/p1/../../<ngoai>/quan-trong — canonicalize sẽ rút gọn về đường dẫn thật
    let lach = root.path().join("p1").join("..").join("..")
        .join(ngoai.path().file_name().unwrap())
        .join("quan-trong");

    let e = delete(root.path(), &lach).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(
        ngoai.path().join("quan-trong").exists(),
        "thư mục ngoài VẪN PHẢI còn sau lời gọi bị từ chối"
    );
}

#[test]
fn tu_choi_thu_muc_chau_chu_khong_phai_con_truc_tiep() {
    let root = tempfile::tempdir().unwrap();
    let chau = root.path().join("p1").join("tts");
    mkdir(&chau);

    let e = delete(root.path(), &chau).unwrap_err();
    assert!(e.to_string().contains("từ chối xoá"), "{e}");
    assert!(chau.exists(), "thư mục cháu VẪN PHẢI còn sau lời gọi bị từ chối");
}

#[test]
fn du_an_khong_ton_tai_bao_loi_chu_khong_panic() {
    let root = tempfile::tempdir().unwrap();
    assert!(delete(root.path(), &root.path().join("khong-co")).is_err());
}
