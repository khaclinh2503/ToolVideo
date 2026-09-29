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

/** Vị trí logo theo góc, khớp với `Watermark::overlay_xy` bên Rust. */
function viTriLogo(corner: string, marginPct: number): React.CSSProperties {
  // Lề tính theo % BỀ NGANG ở cả hai trục, đúng như bên Rust (margin_px dùng
  // chung cho x và y) — không đổi sang % chiều cao, sẽ lệch trên video 16:9.
  const m = `${marginPct}%`;
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
  const [loi, setLoi] = useState("");

  useEffect(() => {
    if (!videoPath || !phatDuoc(videoPath)) return;
    // Phải khai phạm vi TRƯỚC khi gán src, nếu không lần nạp đầu bị từ chối im
    // lặng và thẻ video ra ô đen.
    invoke("cho_phep_xem", { path: videoPath })
      .then(() => setLoi(""))
      .catch((e) => setLoi(`Không mở được video để xem thử: ${String(e)}`));
  }, [videoPath]);

  useEffect(() => {
    if (!wm?.enabled || !wm.path) return;
    invoke("cho_phep_xem", { path: wm.path }).catch(() => { /* logo sẽ không hiện */ });
  }, [wm?.enabled, wm?.path]);

  function doTiLe() {
    const v = ref.current;
    if (!v || !v.videoHeight) return;
    setTiLe(v.clientHeight / v.videoHeight);
  }

  // Tính TRƯỚC mọi lệnh return sớm bên dưới. Task 8 treo thêm một useEffect ăn
  // theo `cue`, mà hook nằm sau một nhánh return là lỗi "rendered more hooks
  // than during the previous render" — React đếm hook theo thứ tự gọi, không
  // theo tên.
  const cue = cues.find((c) => c.startMs <= tMs && tMs < c.endMs);

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
      <video
        ref={ref}
        src={convertFileSrc(videoPath)}
        controls
        onLoadedMetadata={doTiLe}
        onResize={doTiLe}
        onTimeUpdate={(e) => setTMs(e.currentTarget.currentTime * 1000)}
        onError={() => setLoi("Không phát được video — file có thể đã bị xoá hoặc đổi tên.")}
      />
      {wm?.enabled && wm.path && (
        <img
          className="xem-thu-logo"
          src={convertFileSrc(wm.path)}
          alt=""
          style={{ ...viTriLogo(wm.corner, wm.margin_pct), width: `${wm.size_pct}%`, opacity: wm.opacity }}
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
    </div>
  );
}
