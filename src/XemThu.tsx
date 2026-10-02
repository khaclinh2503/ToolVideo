import { useEffect, useRef, useState } from "react";
import VungMoLop, { type VungMoUI } from "./VungMoLop";
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
  /** Vùng làm mờ; `undefined` ⇒ không hiện lớp khoanh vùng nào. */
  vungMo?: VungMoUI[];
  onDoiVungMo?: (v: VungMoUI[]) => void;
  /** Bật thì lớp khoanh vùng ăn chuột — lúc đó KHÔNG bấm được nút phát. */
  dangVeVungMo?: boolean;
  /** Phóng to/thu nhỏ nội dung, %. 100 = nguyên bản. */
  zoomPct?: number;
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
 * Chiều cao hệ quy chiếu của script ASS mà ffmpeg sinh ra từ file SRT.
 *
 * libass KHÔNG lấy độ phân giải video làm hệ quy chiếu cho `FontSize`. ffmpeg
 * chuyển SRT sang ASS trước khi đưa cho libass, và header nó sinh ra ghi cứng
 * `PlayResX: 384 / PlayResY: 288` bất kể video 360p hay 4K. libass vẽ trong
 * lưới 288 đơn vị đó rồi phóng cả khung lên kích thước thật, nên `FontSize=24`
 * là 24/288 ≈ 8.3% CHIỀU CAO KHUNG — tỉ lệ với khung, không phải một số pixel
 * tuyệt đối trên khung gốc.
 *
 * Đã đo thật (ffmpeg 9.0.2, burn `FontSize=24,Outline=0` lên nền đen, đếm hàng
 * pixel sáng): chiều cao chữ "H" là 19 / 39 / 57 / 115 px ở 360p / 720p /
 * 1080p / 4K — đúng tỉ lệ với chiều cao khung, không đứng yên ở một con số.
 * Công thức cũ `size * clientHeight / videoHeight` (tin rằng 24 nghĩa là 24px
 * trên khung gốc) vẽ nhỏ hơn bản xuất 3.75 lần trên video 1080p và 7.5 lần
 * trên 4K.
 *
 * Phải khớp `export::ASS_PLAY_RES_Y` bên Rust; `tests/hang_so_ui_test.rs` ghim.
 */
const ASS_PLAY_RES_Y = 288;

/**
 * Hệ số quy `FontSize` của ASS sang `font-size` của CSS.
 *
 * libass đo `FontSize` bằng ascent+descent của font, còn CSS `font-size` là ô
 * em. Arial có ascent 0.905 + descent 0.212 = 1.117 em, nên một em CSS ứng với
 * 1/1.117 ≈ 0.895 lần FontSize. Kiểm lại bằng số đo ở trên: cao chữ "H" đo
 * được chia cho `size * clientHeight / 288` ra 0.633…0.650; chia tiếp cho tỉ
 * lệ cap-height của Arial (0.716 em) ra 0.88…0.91. Lấy tròn 0.9.
 *
 * Hệ số này KHÔNG áp cho độ dày viền: `Outline` của ASS là bề dày đường viền
 * đo thẳng trong lưới 288, không dính gì tới metric của font.
 */
const ASS_EM_TREN_FONTSIZE = 0.9;

// Lề dọc `MarginV=10` (cùng lưới 288) quyết định phụ đề nằm cách đáy bao
// nhiêu. Nó không xuất hiện ở file này vì việc đặt vị trí nằm trọn trong CSS —
// xem `.xem-thu-cap` trong App.css, nơi 10 và 288 được khai làm biến CSS.

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


export default function XemThu({ videoPath, cues, sub, wm, vungMo, onDoiVungMo, dangVeVungMo, zoomPct }: XemThuProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [tMs, setTMs] = useState(0);
  // Số pixel hiển thị ứng với MỘT đơn vị của lưới ASS cao 288 — xem
  // ASS_PLAY_RES_Y phía trên. Đây là hệ số quy mọi con số của libass (cỡ chữ,
  // dày viền) sang px trên màn hình.
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
    // Chờ có videoHeight nội tại rồi mới đo: trước khi nạp xong metadata, thẻ
    // <video> còn giữ tỉ lệ mặc định 2:1 nên clientHeight chưa phải chiều cao
    // khung hình thật. Bản thân videoHeight KHÔNG tham gia phép quy đổi nữa —
    // hệ quy chiếu là lưới ASS cao 288, không phải khung gốc.
    if (!v || !v.videoHeight) return;
    setTiLe(v.clientHeight / ASS_PLAY_RES_Y);
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
  // Cue + đường dẫn audio đã đồng bộ lần gần nhất. So CẢ HAI, không chỉ index:
  // một cue được lồng lại tiếng (audioPath đổi, index giữ nguyên) mà chỉ so
  // index thì người dùng đứng nguyên trên cue đó sẽ tiếp tục nghe bản ghi cũ.
  const daDongBo = useRef<{ idx: number; path: string | null }>({ idx: -1, path: null });

  // Đưa thẻ audio về đúng vị trí BÊN TRONG cue đang đứng và phát/dừng theo
  // đúng trạng thái của video. Dùng lại MỘT thẻ audio (đổi src) thay vì hẹn
  // giờ cả dải: người dùng tua liên tục khi căn chỉnh, mọi lịch hẹn đều phải
  // huỷ và dựng lại sau mỗi lần tua.
  //
  // Đọc `video.currentTime` trực tiếp thay vì state `tMs`/`cue`: hàm này chạy
  // trong handler sự kiện, mà `tMs` ở đó là giá trị của lần render đã tạo ra
  // handler — React chỉ đưa giá trị mới vào ở lần render SAU.
  //
  // (Theo WHATWG, thuật toán tua bắn "timeupdate" RỒI mới tới "seeked" — tức
  // ngược với những gì chú thích cũ ở đây viết. Nhưng thứ tự đó không cứu được
  // gì: `setTMs` trong handler "timeupdate" chỉ xếp hàng một lần render mới,
  // nó không sửa biến `tMs` mà closure đang chạy đọc. Kết luận giữ nguyên, lý
  // do thì khác.)
  //
  // `batBuoc=true` bỏ qua việc so cue cũ/mới — dùng cho tua và phát tiếp: cả
  // hai đều có thể xảy ra TRONG CÙNG một cue (tua để căn chỉnh, hoặc tạm dừng
  // rồi tua rồi phát lại) mà vẫn phải chỉnh lại vị trí trong audio, không chỉ
  // khi đổi sang cue khác. Nhánh timeupdate/effect bình thường thì không cần
  // ép: cue không đổi thì audio đang ở đúng chỗ, khỏi nạp lại src mỗi lần.
  function dongBoTiengLong(video: HTMLVideoElement, batBuoc: boolean) {
    const a = am.current;
    if (!a) return;
    const tHienTai = video.currentTime * 1000;
    const cueHienTai = cues.find((c) => c.startMs <= tHienTai && tHienTai < c.endMs);
    const idx = cueHienTai?.index ?? -1;
    const path = cueHienTai?.audioPath ?? null;
    const doiCue = idx !== daDongBo.current.idx || path !== daDongBo.current.path;
    if (!batBuoc && !doiCue) return;
    daDongBo.current = { idx, path };
    if (!path) { a.pause(); return; }
    const src = convertFileSrc(path);
    if (a.src !== src) a.src = src;
    a.currentTime = Math.max(0, (tHienTai - (cueHienTai?.startMs ?? 0)) / 1000);
    if (video.paused) a.pause();
    else a.play().catch(() => { /* chưa có wav cho cue này */ });
  }

  // Cue tiến bình thường theo thời gian phát (không tua, không tạm dừng).
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    dongBoTiengLong(v, false);
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

  // `.xem-thu` là khối định vị (position: relative) của logo và phụ đề, nên
  // TRONG nó chỉ được có đúng khung hình. Thẻ <audio> và ghi chú bên dưới nằm
  // NGOÀI, vì hai lý do độc lập:
  //
  //  1. Chiều cao của `.xem-thu` là hệ quy chiếu cho `bottom:` của hai lớp
  //     phủ. Một đoạn <p> nằm trong đó cộng thêm chiều cao của mình vào khối
  //     chứa, đẩy logo và phụ đề lên khỏi mặt video.
  //  2. `.xem-thu` từng phải đặt `line-height: 0` để khử khe trắng dưới thẻ
  //     <video> inline, và line-height DI TRUYỀN — các dòng của đoạn ghi chú
  //     xuống dòng bị ép cao 0 và chồng đè lên nhau, không đọc được. (App.css
  //     nay khử khe đó bằng `display: block` trên chính thẻ video, nhưng ghi
  //     chú vẫn phải ra ngoài vì lý do 1.)
  //
  // Đưa ra ngoài chứ không vá lại `line-height` cho riêng đoạn <p>: vá thế chỉ
  // chữa triệu chứng 2, còn triệu chứng 1 vẫn còn nguyên.
  return (
    <>
    <div className="xem-thu">
      {!videoSanSang ? (
        <p className="muted">Đang xin quyền mở video để xem thử…</p>
      ) : (
        <>
          {/* Khung bị phóng: chứa HÌNH và lớp khoanh vùng, KHÔNG chứa logo và
              phụ đề. Đúng thứ tự filtergraph bên Rust — làm mờ rồi zoom rồi mới
              vẽ phụ đề/logo — nên vùng mờ phóng theo hình còn chữ thì không. */}
          <div
            className="xem-thu-phong"
            style={{ transform: `scale(${(zoomPct ?? 100) / 100})` }}
          >
          <video
            ref={ref}
            src={convertFileSrc(videoPath)}
            controls
            onLoadedMetadata={(e) => { capNhatKichThuoc(); e.currentTarget.volume = 0.18; }}
            onTimeUpdate={(e) => setTMs(e.currentTarget.currentTime * 1000)}
            // Tua có thể đứng nguyên trong cùng một cue (đúng lúc căn chỉnh) —
            // ép đồng bộ lại vị trí trong audio bất kể cue có đổi hay không.
            onSeeked={(e) => dongBoTiengLong(e.currentTarget, true)}
            // Tạm dừng video mà không dừng theo giọng lồng là bug rõ nhất:
            // người dùng nghe tiếng chạy tiếp trên khung hình đứng yên.
            onPause={() => am.current?.pause()}
            // Phát tiếp thì chỉnh lại vị trí trong audio theo cue hiện tại
            // (video có thể đã bị tua trong lúc tạm dừng), không phát tiếp từ
            // chỗ audio dừng lại trước đó.
            onPlay={(e) => dongBoTiengLong(e.currentTarget, true)}
            onError={() => setLoi("Không phát được video — file có thể đã bị xoá hoặc đổi tên.")}
          />
          {vungMo && onDoiVungMo && (
            <VungMoLop vungMo={vungMo} onDoi={onDoiVungMo} dangVe={!!dangVeVungMo} />
          )}
          </div>
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
                // `tiLe` đã là px-hiển-thị trên mỗi đơn vị của lưới ASS cao
                // 288; nhân thêm ASS_EM_TREN_FONTSIZE vì libass đo FontSize
                // theo ascent+descent còn CSS đo theo ô em (xem hai khối chú
                // thích đầu file, kèm số đo thật).
                fontSize: `${sub.size * tiLe * ASS_EM_TREN_FONTSIZE}px`,
                color: sub.color,
                // Cùng lưới 288, nhưng KHÔNG nhân hệ số em: Outline của ASS là
                // bề dày đường viền chứ không phải một số đo của font.
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
    </div>
    <audio ref={am} />
    <p className="muted">
      Tiếng lồng nghe thử lấy từ file của từng câu, chưa khớp khung — câu nào đọc
      dài quá chỗ của nó sẽ chồng sang câu sau. Bản xuất thật có thêm bước ép vừa
      khung nên không bị.
    </p>
    </>
  );
}
