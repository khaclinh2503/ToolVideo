import { useEffect, useRef, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";

export interface CueDto {
  index: number; startMs: number; endMs: number; text: string;
  durationMs: number; audioPath: string | null; stale: boolean;
}
export interface SubtitleConfig {
  font: string; size: number; color: string;
  outline_color: string; outline: number;
}
export interface WatermarkConfig {
  enabled: boolean; path: string; corner: string;
  size_pct: number; opacity: number; margin_pct: number;
}

interface XemThuProps {
  videoPath: string;
  cues: CueDto[];
  sub: SubtitleConfig;
  wm: WatermarkConfig | undefined;
}

/** WebView2 dựng trên Chromium, và Chromium không mở container Matroska. */
function phatDuoc(p: string): boolean {
  return !p.toLowerCase().endsWith(".mkv");
}

/**
 * Vị trí logo theo góc. Margin quy ra PX theo BỀ NGANG khung cho CẢ HAI trục,
 * khớp cách Rust tính (`Watermark::overlay_xy` trong export.rs):
 * `margin_px = video_w * margin_pct / 100`, dùng chung một giá trị đó cho cả x
 * lẫn y. Không được gán thẳng marginPct kèm ký hiệu "%" cho top/bottom như
 * bản trước: CSS % của top/bottom quy theo chiều CAO khối chứa chứ không phải
 * bề ngang, nên trên video 16:9 lề dọc hiện ra chỉ bằng ~0.56 lần lề thật
 * trong bản xuất.
 */
function viTriLogo(corner: string, marginPct: number, rongPx: number): React.CSSProperties {
  const m = `${(rongPx * marginPct) / 100}px`;
  switch (corner) {
    case "tl": return { left: m, top: m };
    case "tr": return { right: m, top: m };
    case "bl": return { left: m, bottom: m };
    default: return { right: m, bottom: m };
  }
}

export default function XemThu({ videoPath, cues, sub, wm }: XemThuProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tMs, setTMs] = useState(0);
  // Tỉ lệ khung hiển thị so với khung gốc, để quy đổi cỡ chữ.
  const [tiLe, setTiLe] = useState(1);
  // Bề ngang thật của khung hiển thị (px), để quy margin logo ra px — xem
  // viTriLogo phía trên vì sao không dùng "%" trực tiếp.
  const [rongPx, setRongPx] = useState(0);
  const [loi, setLoi] = useState("");

  // Đường dẫn video mà lệnh cho_phep_xem đã CHẮC CHẮN trả về thành công. So
  // sánh trực tiếp với videoPath (thay vì một cờ boolean bật/tắt thủ công) để
  // khi người dùng mở dự án khác, giá trị cũ tự động không còn khớp nữa — nếu
  // dùng một boolean rời thì phải nhớ reset nó, quên một chỗ là dự án thứ hai
  // "thừa hưởng" cờ đã cấp của dự án đầu và lại vẽ src trước khi có quyền.
  const [videoCapChoDuongDan, setVideoCapChoDuongDan] = useState("");
  const videoSanSang = videoPath !== "" && videoCapChoDuongDan === videoPath;

  useEffect(() => {
    if (!videoPath || !phatDuoc(videoPath)) return;
    // Phải khai phạm vi và CHỜ nó resolve trước khi thẻ <video> được gán src —
    // xem điều kiện videoSanSang ở JSX bên dưới. useEffect chạy SAU khi trình
    // duyệt đã commit và vẽ khung hình, nên nếu thẻ video có src ngay từ lần
    // render đầu (dựa trên một cờ mặc định "đã sẵn sàng"), trình duyệt đã kịp
    // bắt đầu tải trước khi invoke này resolve — asset protocol từ chối im
    // lặng và src không bao giờ đổi lại để nạp lần hai.
    invoke("cho_phep_xem", { path: videoPath })
      .then(() => { setLoi(""); setVideoCapChoDuongDan(videoPath); })
      .catch((e) => setLoi(`Không mở được video để xem thử: ${String(e)}`));
  }, [videoPath]);

  // Cùng logic reset-tự-nhiên như trên, áp cho logo.
  const [wmCapChoDuongDan, setWmCapChoDuongDan] = useState("");
  const wmSanSang = !!wm?.path && wmCapChoDuongDan === wm.path;

  useEffect(() => {
    if (!wm?.enabled || !wm.path) return;
    const p = wm.path;
    invoke("cho_phep_xem", { path: p })
      .then(() => setWmCapChoDuongDan(p))
      .catch(() => { /* logo sẽ không hiện, không phải lỗi chặn cả trình phát */ });
  }, [wm?.enabled, wm?.path]);

  function capNhatKichThuoc() {
    const v = ref.current;
    if (!v || !v.videoHeight) return;
    setTiLe(v.clientHeight / v.videoHeight);
    setRongPx(v.clientWidth);
  }

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // `onResize` của thẻ <video> chỉ bắn khi videoWidth/videoHeight NỘI TẠI
    // đổi (đổi nguồn phát), không bắn khi khung HIỂN THỊ đổi cỡ. Đổi cỡ cửa sổ
    // ứng dụng thì clientHeight/clientWidth đổi nhưng videoHeight nội tại giữ
    // nguyên, nên phải nghe qua ResizeObserver mới bắt được, nếu không tỉ lệ
    // chữ và lề logo tính một lần lúc nạp xong rồi cứ thế trôi sai.
    const ro = new ResizeObserver(capNhatKichThuoc);
    ro.observe(v);
    capNhatKichThuoc();
    return () => ro.disconnect();
  }, [videoSanSang]);

  // Tính TRƯỚC mọi lệnh return sớm bên dưới. Task 8 treo thêm một useEffect ăn
  // theo `cue`, mà hook nằm sau một nhánh return là lỗi "rendered more hooks
  // than during the previous render" — React đếm hook theo thứ tự gọi, không
  // theo tên.
  const cue = cues.find((c) => c.startMs <= tMs && tMs < c.endMs);

  const am = useRef<HTMLAudioElement>(null);
  const cueDangPhat = useRef<number>(-1);

  // Phát wav của cue đang chạy. Dùng MỘT thẻ audio đổi src thay vì hẹn giờ cả
  // dải: người dùng tua liên tục khi căn chỉnh, mà mọi lịch hẹn đều phải huỷ và
  // dựng lại sau mỗi lần tua — một thẻ theo cue hiện tại là đủ và không lệch.
  useEffect(() => {
    const a = am.current;
    const v = ref.current;
    if (!a || !v) return;
    const idx = cue?.index ?? -1;
    if (idx === cueDangPhat.current) return;
    cueDangPhat.current = idx;
    if (!cue?.audioPath || v.paused) { a.pause(); return; }
    a.src = convertFileSrc(cue.audioPath);
    // Vào giữa cue (do tua) thì phát từ đúng chỗ đó, không quay về đầu câu.
    a.currentTime = Math.max(0, (tMs - cue.startMs) / 1000);
    a.play().catch(() => { /* chưa có wav cho cue này */ });
  }, [cue?.index, cue?.audioPath]);

  if (!videoPath) {
    return <p className="muted">Mở một dự án để xem thử.</p>;
  }
  if (!phatDuoc(videoPath)) {
    return (
      <p className="muted">
        Video .mkv không phát được trong app (khung xem của Windows không đọc
        định dạng này). Dùng nút "Xem thử phụ đề" ở trên để chấm kiểu chữ trên
        một khung hình thật; bản xuất ra vẫn bình thường.
      </p>
    );
  }
  if (loi) return <p className="warn">{loi}</p>;

  return (
    <div className="xem-thu">
      {!videoSanSang ? (
        <p className="muted">Đang xin quyền mở video để xem thử…</p>
      ) : (
        <>
          <video
            ref={ref}
            src={convertFileSrc(videoPath)}
            controls
            onLoadedMetadata={(e) => { capNhatKichThuoc(); e.currentTarget.volume = 0.18; }}
            onTimeUpdate={(e) => setTMs(e.currentTarget.currentTime * 1000)}
            onError={() => setLoi("Không phát được video — file có thể đã bị xoá hoặc đổi tên.")}
          />
          {wmSanSang && wm?.enabled && wm.path && (
            <img
              className="xem-thu-logo"
              src={convertFileSrc(wm.path)}
              alt=""
              style={{ ...viTriLogo(wm.corner, wm.margin_pct, rongPx), width: `${wm.size_pct}%`, opacity: wm.opacity }}
            />
          )}
          {cue && (
            <div
              className="xem-thu-cap"
              style={{
                fontFamily: sub.font,
                // Cỡ chữ ASS tính trên khung hình gốc: FontSize=24 nghĩa là 24px
                // trên video 1080p, không phải 24px trên màn hình.
                fontSize: `${sub.size * tiLe}px`,
                color: sub.color,
                WebkitTextStrokeWidth: `${sub.outline * tiLe}px`,
                WebkitTextStrokeColor: sub.outline_color,
                paintOrder: "stroke fill",
              }}
            >
              {cue.text}
            </div>
          )}
        </>
      )}
      <audio ref={am} />
      <p className="muted">
        Tiếng lồng nghe thử lấy từ file của từng câu, chưa khớp khung — câu nào đọc
        dài quá chỗ của nó sẽ chồng sang câu sau. Bản xuất thật có thêm bước ép vừa
        khung nên không bị.
      </p>
    </div>
  );
}
