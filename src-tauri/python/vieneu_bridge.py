"""Cầu nối VieNeu-TTS cho DichVideo-Local (M7).

Chạy như một tiến trình con (`python.exe vieneu_bridge.py`), theo cùng triết
lý giao thức dòng lệnh với `piper.exe --json-input` (xem
`src-tauri/src/tts/piper.rs`) để tầng Rust không cần biết đang gọi engine
lồng tiếng nào.

HỢP ĐỒNG STDIN/STDOUT — CHỐT Ở ĐÂY, Task 4 (provider Rust) đọc đúng các khoá
JSON dưới đây, đừng đổi tên khi sửa file này về sau:

  stdin  : mỗi dòng một object JSON
             {"text": "<văn bản>", "output_file": "<đường dẫn .wav>",
              "voice": "<tên giọng, tuỳ chọn>"}
           `voice` vắng mặt hoặc null ⇒ dùng giọng mặc định của model.
           KHÔNG có khoá "speed"/"length_scale": VieNeu-TTS không có tham số
           ép tốc độ đọc nào (đã grep `speed`/`tempo`/`length_scale`/`rate`
           trong `vieneu/v3turbo.py` và `vieneu/base.py` — rỗng). Việc ép tốc
           độ dồn hết cho ffmpeg `atempo` hậu xử lý ở tầng Rust.
  stdout : mỗi job tổng hợp xong in ĐÚNG MỘT dòng là `output_file` (đường dẫn
           vừa ghi), rồi flush ngay lập tức — tầng Rust đếm số dòng in ra để
           biết cue nào đã xong, cùng cách `piper.rs` đếm dòng của Piper.
  stderr : nhật ký + thông báo lỗi (không dùng để báo tiến độ job).
  exit   : khác 0 nếu có ít nhất một job hỏng. Một job lỗi không huỷ cả mẻ —
           script vẫn cố tổng hợp hết các job còn lại trong batch trước khi
           thoát với mã lỗi.

Mô hình nạp ĐÚNG MỘT LẦN cho toàn bộ batch (nạp lại tốn vài giây mỗi lần) —
đây là lý do dùng giao thức dòng thay vì spawn một tiến trình mỗi cue.

SDK: `vieneu==3.8.3` (xem `src-tauri/vieneu-requirements.txt`). Chữ ký dưới
đây đã đối chiếu trực tiếp với mã nguồn thật
(`models/vieneu/site-packages/vieneu/v3turbo.py`), KHÔNG phải bảng mã mẫu ban
đầu trong task-3-brief.md — bảng đó viết trước khi ai đọc SDK và sai hai chỗ:
  - Không có `infer_to_file(...)`. Chỉ có
    `infer(text, ref_audio=None, voice=None, ..., apply_watermark=True, ...)
    -> np.ndarray` (mảng float32 48 kHz mono) — phải tự ghi WAV bằng
    `soundfile` (đã có sẵn trong 79 gói đã cài ở Task 2).
  - `infer()` KHÔNG có tham số tốc độ nào — xem đoạn "Không có khoá speed" ở
    trên.
  - `apply_watermark=True` là mặc định của `infer()`. Cầu nối GIỮ NGUYÊN mặc
    định này (không truyền `False`): đó là thuỷ vân nhận biết giọng do AI tạo
    ra, đã có phán quyết giữ bật ở spec mục 5.2b.

Môi trường BẮT BUỘC do tiến trình cha (Rust) đặt khi spawn script này — script
này không tự đặt các biến này, thiếu là lỗi cấu hình ở tầng gọi:
  PYTHONPATH       -> <models>/vieneu/site-packages
  HF_HOME          -> <models>/vieneu/cache (để huggingface_hub không tự tải
                       vào %USERPROFILE%\\.cache của người dùng)
  PYTHONIOENCODING -> utf-8 (văn bản tiếng Việt đi qua stdin/stdout)

Môi trường TUỲ CHỌN (Task 4 — pin model cục bộ để chạy offline):
  VIENEU_MODELS_DIR -> <models>/vieneu — thư mục gốc chứa 15 file đã pin cứng
                       trong `components.json` (config.json, denoiser.onnx ở
                       gốc; onnx_update/ với 7 file backbone fp32; moss/ với 6
                       file codec ONNX). Xem `_tao_vieneu()` dưới đây để biết
                       cách từng file được SDK dùng tới và vì sao cần vá thêm
                       một hàm khởi tạo (không chỉ truyền tham số).
"""
import json
import os
import sys
from pathlib import Path


def _dam_bao_utf8() -> None:
    """Tự vệ thêm cho trường hợp PYTHONIOENCODING lỡ chưa được đặt: ép lại
    encoding của các luồng chuẩn. Đây chỉ là lưới an toàn thứ hai — biến môi
    trường ở tầng gọi vẫn là yêu cầu bắt buộc (xem docstring)."""
    for luong, loi in ((sys.stdin, "strict"), (sys.stdout, "strict"), (sys.stderr, "replace")):
        if hasattr(luong, "reconfigure"):
            try:
                luong.reconfigure(encoding="utf-8", errors=loi)
            except Exception:
                pass  # luồng không hỗ trợ reconfigure (hiếm) — bỏ qua, không chặn chạy


def _tong_hop_mot_job(tts, job: dict) -> str:
    """Tổng hợp một job, ghi wav PCM 16-bit mono, trả về đường dẫn đã ghi.

    PCM 16-bit mono: cùng định dạng Piper đã tạo ra (xem `src-tauri/src/wav.rs`
    — `read_pcm16_mono`/`write_pcm16_mono`), để phần còn lại của pipeline
    (ghép track lồng tiếng, v.v.) không phải phân biệt cue nào do engine nào
    tạo ra.
    """
    import soundfile as sf

    text = job["text"]
    output_file = job["output_file"]
    voice = job.get("voice") or None  # "" hoặc null đều nghĩa là "dùng mặc định"

    wav = tts.infer(text, voice=voice, apply_watermark=True)

    out_path = Path(output_file)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out_path), wav, tts.sample_rate, subtype="PCM_16")
    return output_file


def _vieneu_tu_thu_muc_cuc_bo(root: Path):
    """Khởi tạo `Vieneu(backend="onnx")` trỏ thẳng vào 15 file đã pin cứng
    dưới `root` (= `VIENEU_MODELS_DIR`), không gọi HF Hub qua mạng.

    Đối chiếu trực tiếp mã nguồn `vieneu==3.8.3` đã cài (không suy đoán):

    - `onnx_dir`: `V3TurboVieNeuTTS.__init__` (`vieneu/v3turbo.py`) CHUYỂN TIẾP
      thẳng xuống `OnnxV3LiteEngine(onnx_dir=onnx_dir, ...)`
      (`vieneu/_v3_turbo_engine/onnx_runtime_lite.py`), nơi `onnx_dir` có mặt
      ⇒ `vd = Path(onnx_dir)` thay vì tải qua `hf_hub_download`. Chỉ cần
      truyền qua tham số `Vieneu(..., onnx_dir=...)` là đủ.
    - `backbone_repo` (= `checkpoint_path` của `OnnxV3LiteEngine`) trỏ vào
      chính `root`: `_resolve_root_file("denoiser.onnx")` kiểm
      `Path(checkpoint_path).is_dir()` trước, đọc thẳng file cục bộ, không
      gọi mạng. `_load_repo_voices` cũng kiểm `is_dir()` trước — thư mục cục
      bộ không có `voices_v3_turbo.json` thì lặng lẽ bỏ qua, KHÔNG gọi mạng
      (25 giọng preset đến từ `assets/voices_v3_turbo.json` đóng gói sẵn
      trong gói `vieneu`, không phải từ HF Hub).
    - `codec_dir`: đây là tham số của `OnnxV3LiteEngine`, nhưng
      `V3TurboVieNeuTTS.__init__` KHÔNG chuyển tiếp nó xuống — nó bị nuốt vào
      `**kwargs` rồi bỏ qua (đọc thẳng mã nguồn để xác nhận, không phải suy
      đoán). Vì vậy không có tham số nào của `Vieneu()` đặt được `codec_dir`
      cục bộ; phải vá tạm `OnnxV3LiteEngine.__init__` ngay trong tiến trình
      cầu nối này (không đụng gì tới site-packages đã cài trên đĩa) để chèn
      `codec_dir` mặc định trước khi gọi hàm khởi tạo gốc.
    """
    import vieneu._v3_turbo_engine.onnx_runtime_lite as _onnx_lite

    codec_dir = str(root / "moss")
    goc_init = _onnx_lite.OnnxV3LiteEngine.__init__

    def _init_da_va(self, *args, **kwargs):
        kwargs.setdefault("codec_dir", codec_dir)
        return goc_init(self, *args, **kwargs)

    _onnx_lite.OnnxV3LiteEngine.__init__ = _init_da_va

    from vieneu import Vieneu

    return Vieneu(backend="onnx", backbone_repo=str(root), onnx_dir=str(root / "onnx_update"))


def _tao_vieneu():
    """Khởi tạo `Vieneu(backend="onnx")`.

    `VIENEU_MODELS_DIR` (tuỳ chọn, Rust đặt — xem `tts/vieneu.rs`) trỏ vào
    `<models>/vieneu`: nếu biến này có mặt VÀ cả `onnx_update/` lẫn `moss/`
    bên trong đều tồn tại (người dùng đã bấm "Tải bộ công cụ" và
    `components.json` đã đặt đủ 15 file), dùng thẳng model cục bộ đó — không
    gọi mạng (xem `_vieneu_tu_thu_muc_cuc_bo`).

    Vắng biến này, hoặc thư mục chưa đủ (chưa cài) ⇒ hành vi CŨ của Task 3 giữ
    nguyên: SDK tự tải qua HF Hub vào `HF_HOME`.
    """
    root_raw = os.environ.get("VIENEU_MODELS_DIR", "").strip()
    if root_raw:
        root = Path(root_raw)
        if (root / "onnx_update").is_dir() and (root / "moss").is_dir():
            return _vieneu_tu_thu_muc_cuc_bo(root)

    from vieneu import Vieneu

    # backend="onnx": ép chạy CPU, torch-free — đúng mục tiêu M7 (không phụ
    # thuộc GPU/CUDA, không cần cài PyTorch). Không có model cục bộ (nhánh
    # trên) ⇒ để SDK tự tải qua HF Hub vào HF_HOME như Task 3.
    return Vieneu(backend="onnx")


def main() -> int:
    _dam_bao_utf8()

    # Nhập trễ (không import ở top-level): lỗi thiếu PYTHONPATH hoặc gói cài
    # hỏng chỉ nên xảy ra ở đây, bắt được và báo rõ qua stderr thay vì để
    # traceback trần trụi văng ra trước khi main() kịp chạy.
    try:
        import vieneu  # noqa: F401
    except Exception as e:  # noqa: BLE001
        print(f"loi: không nạp được thư viện vieneu: {e}", file=sys.stderr, flush=True)
        return 1

    try:
        tts = _tao_vieneu()
    except Exception as e:  # noqa: BLE001
        print(f"loi: không nạp được model VieNeu-TTS: {e}", file=sys.stderr, flush=True)
        return 1

    loi = 0
    try:
        for dong in sys.stdin:
            dong = dong.strip()
            if not dong:
                continue
            try:
                job = json.loads(dong)
                duong_dan = _tong_hop_mot_job(tts, job)
                print(duong_dan, flush=True)
            except Exception as e:  # noqa: BLE001
                print(f"loi: {e}", file=sys.stderr, flush=True)
                loi = 1
    finally:
        tts.close()

    return loi


if __name__ == "__main__":
    sys.exit(main())
