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
"""
import json
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


def main() -> int:
    _dam_bao_utf8()

    # Nhập trễ (không import ở top-level): lỗi thiếu PYTHONPATH hoặc gói cài
    # hỏng chỉ nên xảy ra ở đây, bắt được và báo rõ qua stderr thay vì để
    # traceback trần trụi văng ra trước khi main() kịp chạy.
    try:
        from vieneu import Vieneu
    except Exception as e:  # noqa: BLE001
        print(f"loi: không nạp được thư viện vieneu: {e}", file=sys.stderr, flush=True)
        return 1

    try:
        # backend="onnx": ép chạy CPU, torch-free — đúng mục tiêu M7 (không
        # phụ thuộc GPU/CUDA, không cần cài PyTorch). Không truyền `onnx_dir`:
        # để SDK tự tải model ONNX (~435 MB) về HF_HOME ở lần chạy đầu; Task 4
        # sẽ pin thư mục cục bộ đó vào components.json rồi truyền `onnx_dir`
        # khi việc pin đã xong.
        tts = Vieneu(backend="onnx")
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
