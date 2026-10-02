import { useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { listen } from "@tauri-apps/api/event";
import XemThu from "./XemThu";
import "./App.css";

interface SttResultDto { srtPath: string; cueCount: number; projectDir: string }
interface TranslateResultDto { srtPath: string; cueCount: number }
interface TtsResultDto { manifestPath: string; cueCount: number; generated: number; cached: number }
interface OpenAiConfig { base_url: string; api_key: string; model: string; context: string }
interface ContextDto { id: string; label: string }
interface TtsConfig { default_provider: string; voice: string; length_scale: number }
interface SubtitleConfig {
  font: string; size: number; color: string;
  outline_color: string; outline: number;
}
interface WatermarkConfig {
  enabled: boolean; path: string; corner: string;
  size_pct: number; opacity: number; margin_pct: number;
}
interface AppConfig {
  translate: { default_provider: string; target_lang: string; openai: OpenAiConfig };
  tts: TtsConfig;
  subtitle: SubtitleConfig;
  watermark: WatermarkConfig;
}

/** Font có sẵn trên mọi máy Windows và đủ dấu tiếng Việt. */
// Endpoint tương thích-OpenAI đã dựng sẵn, để khỏi phải nhớ URL.
const NHA_CUNG_CAP = [
  { ten: "NVIDIA build.nvidia.com", url: "https://integrate.api.nvidia.com/v1" },
  { ten: "OpenAI", url: "https://api.openai.com/v1" },
  { ten: "Groq", url: "https://api.groq.com/openai/v1" },
  { ten: "OpenRouter", url: "https://openrouter.ai/api/v1" },
  { ten: "LM Studio (máy này)", url: "http://localhost:1234/v1" },
];

// Model gợi ý theo endpoint. Số giây là ĐO THẬT trên một lô 40 cue phụ đề
// tiếng Trung chạy qua đúng đường của app, không phải phỏng đoán. Model suy
// luận chậm gấp hàng chục lần và có khi tiêu hết hạn mức token vào phần nghĩ
// rồi trả về rỗng — xem chỗ tắt suy luận trong translate/openai_compat.rs.
const MODEL_GOI_Y: Record<string, { ten: string; ghi_chu: string }[]> = {
  "https://integrate.api.nvidia.com/v1": [
    { ten: "openai/gpt-oss-20b", ghi_chu: "nhanh nhất, 28s mỗi 40 câu — nên dùng" },
    { ten: "deepseek-ai/deepseek-v4.1-flash", ghi_chu: "dịch sát nhất (xưng hô, anh rể/chị dâu) nhưng 72–85s và thỉnh thoảng lỗi 500" },
    { ten: "z-ai/glm-5.3-flash", ghi_chu: "103s mỗi 40 câu" },
    { ten: "z-ai/glm-5.3", ghi_chu: "model suy luận, 90s cho 3 câu — đừng dùng để dịch cả phim" },
  ],
  "https://api.openai.com/v1": [
    { ten: "gpt-4o-mini", ghi_chu: "rẻ, đủ dùng cho phụ đề" },
    { ten: "gpt-4o", ghi_chu: "dịch sát hơn, đắt hơn" },
  ],
};

// Phải khớp với srt::MAX_MOT_DONG bên Rust — chỉ dùng để hiển thị, bộ cắt thật
// nằm ở backend.
const MAX_MOT_DONG = 42;

// Phải khớp config::WatermarkConfig bên Rust — có test hang_so_ui_test giữ.
const WM_SIZE_MAC_DINH = 12;
const WM_MARGIN_MAC_DINH = 3;

// Trần của hai ô số logo. Phải khớp hai mốc `clamp` trong `Watermark::moi`
// (export.rs): Rust kẹp size_pct về 1..=100 và margin_pct về 0..=40.
//
// Không kẹp ở UI thì `max` trên thẻ <input type="number"> chỉ chặn nút mũi tên
// chứ không chặn gõ tay: gõ 150 làm TRÌNH PHÁT xem thử vẽ logo rộng gấp rưỡi
// khung hình, còn bản xuất vẫn ra 100% — lớp xem thử nói dối đúng cái việc nó
// sinh ra để làm.
const WM_SIZE_MAX = 100;
const WM_MARGIN_MAX = 40;

const WM_GOC = [
  { id: "tl", ten: "Trên trái" },
  { id: "tr", ten: "Trên phải" },
  { id: "bl", ten: "Dưới trái" },
  { id: "br", ten: "Dưới phải" },
];

const FONT_GOI_Y = [
  "Arial", "Segoe UI", "Tahoma", "Verdana",
  "Times New Roman", "Calibri", "Roboto",
];

// Hai phông "lính canh" dùng làm mốc so bề rộng — xem fontCoTonTai() ngay
// dưới. PHẢI dùng HAI keyword không liên quan, không phải một: đã đo thật
// bằng Edge headless (cùng lõi Chromium với WebView2) trên máy dựng bản này —
// generic `monospace` map ra đúng "Consolas", một font có thật cài sẵn trên
// Windows. Nếu chỉ so với lính canh `monospace`, gõ đúng "Consolas" cho bề
// rộng KHỚP lính canh (vì nó chính là font `monospace` trỏ tới), nên hàm báo
// "thiếu" một font đang cài thật — cảnh báo bắn nhầm trên input ĐÚNG, tệ hơn
// không báo vì dạy người dùng lơ cảnh báo. Thêm lính canh `sans-serif` (map
// ra "Arial" trên máy đo) và coi font là có thật nếu khác với MỘT TRONG HAI —
// hai generic hiếm khi trỏ cùng một font vật lý nên luôn còn một phép so
// phân biệt được.
const PHONG_LINH_CANH_1 = "monospace";
const PHONG_LINH_CANH_2 = "sans-serif";

/**
 * Phương thức `check` của `FontFaceSet` (`document.fonts`) KHÔNG dùng được để
 * phát hiện font thiếu trong WebView2: đã đo thật bằng Chrome/Edge headless
 * (cùng lõi Chromium với WebView2 trên Windows) — gọi nó với một tên bịa
 * hoàn toàn ("TenBiaKhongCoThat123") vẫn trả về `true`. Chromium coi mọi
 * shorthand hợp cú pháp là "sẵn sàng để vẽ" (nó SẼ vẽ được bằng font thay
 * thế), không phải "family này có thật".
 *
 * Kỹ thuật chuẩn thay thế: ghép [tên cần kiểm, phông lính canh] vào một font
 * shorthand rồi đo `measureText` — nếu trình duyệt tìm được đúng tên, nó vẽ
 * bằng font đó và bề rộng khác với khi chỉ có lính canh; nếu không tìm được,
 * nó rơi thẳng về lính canh và bề rộng bằng NHAU TUYỆT ĐỐI (canvas trả số
 * thực chính xác, không phải ước lượng nên không lo sai số nhoè ranh giới).
 *
 * Đã kiểm thêm trường hợp gõ dở một tiền tố của font thật (vd "Aria" giữa
 * chừng gõ "Arial", hay "Segoe" giữa chừng gõ "Segoe UI"): kỹ thuật này đúng
 * là báo tiền tố đó "không tồn tại", vì bản thân "Aria" không phải tên font
 * nào cả — đó là kết quả ĐÚNG. Cái cần chặn không phải ở hàm này mà ở việc
 * chờ người dùng ngừng gõ trước khi hiện cảnh báo (xem debounce trong App()).
 */
function boRongDoVoiFont(family: string): number {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `72px ${family}`;
  return ctx.measureText("mmmmmmmmmmlli0123456789").width;
}

/**
 * Thoát tên font để ghép an toàn vào font shorthand dạng `"tên", lính-canh`.
 * PHẢI thoát backslash trước rồi mới thoát dấu nháy đôi — đảo thứ tự sẽ thoát
 * luôn backslash mới sinh ra ở bước thoát dấu nháy, sai lại từ đầu.
 *
 * Đã đo thật (Edge headless): một tên kết thúc bằng backslash lẻ (vd gõ nhầm
 * "Foo\") mà không thoát, dấu backslash đó "ăn" luôn dấu nháy đôi mà code
 * chèn vào để đóng chuỗi — toàn bộ phần `", lính-canh` phía sau bị gộp vào
 * LÀM MỘT với tên font thành một family duy nhất. `ctx.font` vẫn gán "thành
 * công" (không phải no-op) nhưng rơi vào font mặc định của canvas, bề rộng đó
 * khác CẢ HAI lính canh — hàm báo "có thật" cho một tên chưa từng tồn tại.
 * Thoát đúng chuẩn CSS-string (\\ rồi \") giữ tên đó nguyên nghĩa một chuỗi ký
 * tự thường, không phá cấu trúc `family, lính-canh` nữa.
 */
function thoatTenFont(ten: string): string {
  return ten.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function fontCoTonTai(ten: string): boolean {
  const sach = ten.trim();
  if (!sach) return true;
  const thoat = thoatTenFont(sach);
  const linh1 = boRongDoVoiFont(PHONG_LINH_CANH_1);
  const linh2 = boRongDoVoiFont(PHONG_LINH_CANH_2);
  const co1 = boRongDoVoiFont(`"${thoat}", ${PHONG_LINH_CANH_1}`);
  const co2 = boRongDoVoiFont(`"${thoat}", ${PHONG_LINH_CANH_2}`);
  return co1 !== linh1 || co2 !== linh2;
}

// Bảy bước của quy trình, mỗi bước một tab. `id` cũng là số hiệu bước hiện
// trên màn hình, nên đừng đánh lại số nếu chỉ muốn đổi thứ tự hiển thị.
const BUOC = [
  { id: 1, ten: "Chọn video" },
  { id: 2, ten: "Lời thoại gốc" },
  { id: 3, ten: "Dịch phụ đề" },
  { id: 4, ten: "Sửa & nghe thử" },
  { id: 5, ten: "Lồng tiếng" },
  { id: 6, ten: "Phụ đề & Logo" },
  { id: 7, ten: "Xuất video" },
] as const;

/** Một giọng đọc mà một nhà cung cấp TTS hỗ trợ (trả về từ lệnh `tts_voices`). */
interface VoiceDto {
  id: string;
  ten: string;
  gioi: string;
  mien: string;
  phongCach: string;
  khuyenDung: boolean;
}
interface ExportResultDto {
  outputPath: string; adjusted: number; capped: number;
  placed: number; truncated: number; saturated: number;
  /** Thứ đã bị bỏ qua mà bản xuất vẫn thành công — hiện chỉ có logo. */
  warnings: string[];
}
interface ProjectSummaryDto {
  projectDir: string; videoPath: string; videoName: string;
  srcLang: string; tgtLang: string; updatedAt: number;
  hasStt: boolean; hasTranslation: boolean; hasTts: boolean;
  hasExport: boolean; videoExists: boolean;
  exportPath: string | null;
  thumbnailPath: string | null;
}
interface CueDto {
  index: number; startMs: number; endMs: number; text: string;
  durationMs: number; audioPath: string | null; stale: boolean;
}
interface PreviewDto {
  audioPath: string; durationMs: number; lengthScale: number; unconstrained: boolean;
}

/** Chỉ lấy tên file để hiện lên màn hình; đường dẫn đầy đủ quá dài. */
function baseName(p: string): string {
  return p.split(/[\\/]/).pop() ?? p;
}

/** 83450 -> "00:01:23,450" — cùng định dạng SRT mà người dùng đã quen. */
function msToTime(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor(ms / 60_000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  const mm = ms % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(mm, 3)}`;
}

/** "00:01:23,450" -> 83450; trả null nếu không đúng định dạng. */
function timeToMs(v: string): number | null {
  const m = v.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
  if (!m) return null;
  return (+m[1]) * 3_600_000 + (+m[2]) * 60_000 + (+m[3]) * 1000 + (+m[4].padEnd(3, "0"));
}

/** Nhãn hiển thị cho một giọng trong ô chọn: "⭐ Tên — Giới · Miền · phong cách". */
function voiceLabel(v: VoiceDto): string {
  const sao = v.khuyenDung ? "⭐ " : "";
  return `${sao}${v.ten} — ${v.gioi} · ${v.mien} · ${v.phongCach}`;
}

type MucSoTay = { goc: string; dich: string; ghi_chu: string };

/// Một tên model tìm được, kèm ý kiến của bảng Hán-Việt.
type TenTim = {
  goc: string;
  dich: string;
  loai: string;
  bang_doc: string;
  dang_ngo: boolean;
};

/// Tiến độ một bước đang chạy. `tong === 0` nghĩa là KHÔNG ĐẾM ĐƯỢC —
/// hiện đồng hồ chứ đừng bịa phần trăm.
type TienDo = { buoc: string; xong: number; tong: number };

const TEN_BUOC: Record<string, string> = {
  dich: "Đang dịch",
  long_tieng: "Đang lồng tiếng",
};

/// mm:ss cho đồng hồ chạy.
function dongHo(giay: number): string {
  const m = Math.floor(giay / 60);
  const g = giay % 60;
  return `${m}:${String(g).padStart(2, "0")}`;
}

/// Câu mẫu để chấm kiểu chữ, dài ĐÚNG `MAX_MOT_DONG` ký tự.
///
/// Dài đúng ngưỡng cắt mới cho thấy trường hợp xấu nhất: cỡ chữ lớn tới đâu
/// thì câu dài nhất bắt đầu tràn xuống hai dòng. Một câu ngắn trông lúc nào
/// cũng vừa, và người dùng chỉ phát hiện ra lúc xuất video.
///
/// Có đủ dấu tiếng Việt (ầ, ã, ò, ở, à) vì dấu là chỗ hay tràn khỏi ô chữ và
/// hay bị font thay thế vẽ sai.
const CAU_MAU_PHU_DE = "Cầu Cầu đâu rồi, lúc nãy còn ở đây mà anh?";

function App() {
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [tienDo, setTienDo] = useState<TienDo | null>(null);
  // Giây đã trôi của lần chạy hiện tại. Có bước không đếm được (nhận dạng lời
  // thoại chạy một lượt trong sherpa), mà câu hỏi thật của người dùng là "app
  // còn sống không" — một con số nhúc nhích mỗi giây trả lời được câu đó.
  const [giayChay, setGiayChay] = useState(0);
  // Bước đang mở. Chỉ đổi được khi `running` tắt — xem thanh tab ở phần render.
  const [tab, setTab] = useState(1);
  const [projectDir, setProjectDir] = useState("");
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [provider, setProvider] = useState("google_free");
  const [tgt, setTgt] = useState("vi");
  const [dl, setDl] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [burnSubs, setBurnSubs] = useState(false);
  const [softSubs, setSoftSubs] = useState(true);
  const [exportPhase, setExportPhase] = useState("");
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [srcLangs, setSrcLangs] = useState<string[]>([]);
  const [srcLang, setSrcLang] = useState("");
  const [cues, setCues] = useState<CueDto[]>([]);
  const [cueAudio, setCueAudio] = useState("");
  const [cueNote, setCueNote] = useState("");
  // null = chưa biết; chỉ hiện mục "Bộ công cụ" khi đã biết chắc là CHƯA đủ,
  // để nó không nhấp nháy rồi biến mất mỗi lần mở app.
  const [toolsReady, setToolsReady] = useState<boolean | null>(null);
  const [pickedVideo, setPickedVideo] = useState("");
  // Đường dẫn file vừa xuất, để mở thẳng thư mục chứa nó.
  const [exported, setExported] = useState("");
  // Những thứ backend đã BỎ QUA trong lượt xuất vừa rồi mà vẫn xuất xong (hiện
  // chỉ có logo). Không hiện ra thì người dùng chờ hết một lượt mã hoá lại
  // toàn bộ video rồi mở file ra thấy trống logo, không biết vì sao.
  const [xuatCanhBao, setXuatCanhBao] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [dlPct, setDlPct] = useState<number | null>(null);
  // "" = tải vào chỗ mặc định trong thư mục dữ liệu của app.
  const [dlDir, setDlDir] = useState("");
  // Câu demo của giọng đang chọn, để nghe thử trước khi lồng tiếng cả video.
  const [demoAudio, setDemoAudio] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);
  // Ảnh xem thử kiểu chữ phụ đề, dựng từ một khung hình thật của video.
  const [subPreview, setSubPreview] = useState("");
  const [subBusy, setSubBusy] = useState(false);
  // "" = ghi vào thư mục dự án như mặc định cũ.
  const [outDir, setOutDir] = useState("");
  const [contexts, setContexts] = useState<ContextDto[]>([]);
  // Danh sách giọng của nhà cung cấp TTS đang chọn (Bước 5); nạp lại mỗi khi
  // đổi nhà cung cấp.
  const [voices, setVoices] = useState<VoiceDto[]>([]);

  useEffect(() => {
    const un = listen<{ id: string; phase: string; done: number; total: number }>(
      "component_progress",
      (e) => {
        const { id, phase, done, total } = e.payload;
        if (phase === "download") {
          const pct = total > 0 ? ` ${Math.floor((done / total) * 100)}%` : ` ${(done / 1048576).toFixed(0)}MB`;
          setDl(`Đang tải ${id}${pct}`);
        } else if (phase === "extract") {
          setDl(`Đang giải nén ${id}...`);
        } else {
          setDl(`Xong ${id}`);
        }
      },
    );
    return () => { un.then((f) => f()); };
  }, []);

  useEffect(() => {
    const un = listen<{ phase: string }>("export_progress", (e) => {
      const ten: Record<string, string> = {
        retime: "Đang khớp giọng vào phụ đề...",
        dub: "Đang ghép dải tiếng dịch...",
        encode: "Đang xuất video...",
        done: "",
      };
      setExportPhase(ten[e.payload.phase] ?? e.payload.phase);
    });
    return () => { un.then((f) => f()); };
  }, []);

  useEffect(() => {
    const un = listen<TienDo>("tien_do", (e) => setTienDo(e.payload));
    return () => { un.then((f) => f()); };
  }, []);

  // Đồng hồ chỉ chạy khi có việc. Dọn tiến độ cũ lúc bắt đầu, nếu không lần
  // chạy mới sẽ hiện con số của lần trước trong mấy giây đầu.
  useEffect(() => {
    if (!running) { setTienDo(null); setGiayChay(0); return; }
    setGiayChay(0);
    const id = setInterval(() => setGiayChay((g) => g + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const un = listen<{ percent: number }>("download_progress", (e) => {
      setDlPct(e.payload.percent);
    });
    return () => { un.then((f) => f()); };
  }, []);

  useEffect(() => {
    invoke<AppConfig>("get_config").then((c) => { setCfg(c); setProvider(c.translate.default_provider); setTgt(c.translate.target_lang); });
  }, []);

  // Nạp lại danh sách giọng mỗi khi nhà cung cấp TTS (Bước 5) đổi. Giọng của
  // hai nhà cung cấp là hai không gian tên khác nhau ("Hải Đăng" vs.
  // "vi_VN-vais1000-medium"), nên nếu giọng đang chọn không còn nằm trong danh
  // sách mới thì phải đặt lại về mục đầu tiên — giữ nguyên là truyền một tên
  // vô nghĩa xuống engine.
  useEffect(() => {
    if (!cfg) return;
    let cancelled = false;
    const p = cfg.tts.default_provider;
    invoke<VoiceDto[]>("tts_voices", { provider: p })
      .then((vs) => {
        if (cancelled) return;
        // Sắp giọng ⭐ (khuyên dùng) lên đầu; sort ổn định nên trong mỗi nhóm
        // vẫn giữ đúng thứ tự backend trả về.
        const sorted = [...vs].sort((a, b) => Number(b.khuyenDung) - Number(a.khuyenDung));
        setVoices(sorted);
        setCfg((cur) => {
          if (!cur || cur.tts.default_provider !== p) return cur;
          if (sorted.some((v) => v.id === cur.tts.voice)) return cur;
          return { ...cur, tts: { ...cur.tts, voice: sorted[0]?.id ?? "" } };
        });
      })
      .catch((e) => setStatus(`Lỗi nạp danh sách giọng: ${String(e)}`));
    return () => { cancelled = true; };
  }, [cfg?.tts.default_provider]);

  async function refreshProjects() {
    try {
      setProjects(await invoke<ProjectSummaryDto[]>("list_projects"));
    } catch (e) {
      setStatus(`Lỗi đọc danh sách dự án: ${String(e)}`);
    }
  }

  async function refreshTools() {
    try {
      setToolsReady(await invoke<boolean>("components_ready"));
    } catch {
      // Không đọc được trạng thái thì cứ hiện mục tải — thà thừa một mục còn
      // hơn giấu mất nút tải duy nhất.
      setToolsReady(false);
    }
  }

  useEffect(() => {
    refreshTools();
    refreshProjects();
    invoke<ContextDto[]>("translate_contexts").then(setContexts);
    invoke<string[]>("src_langs").then((ls) => {
      setSrcLangs(ls);
      setSrcLang((cur) => cur || ls[0] || "zh");
    });
  }, []);

  async function onEnsure() {
    setRunning(true); setStatus("Đang chuẩn bị bộ công cụ…");
    try {
      await invoke("ensure_components");
      setStatus("Đã cài đủ bộ công cụ."); setDl("");
      await refreshTools();
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onDownload() {
    if (!url.trim()) { setStatus("Dán link video vào đã."); return; }
    setRunning(true); setDlPct(0); setStatus("Đang tải video từ link…");
    try {
      const path = await invoke<string>("download_video", { url, outDir: dlDir || null });
      // Tải xong thì coi như vừa chọn file đó ở Bước 1 — cùng đường với
      // onPickVideo, nên phải xoá trạng thái dự án cũ y hệt.
      setProjectDir(""); setVideoPath(""); setCues([]); setCueAudio(""); setCueNote(""); setExported("");
      setPickedVideo(path);
      setTab(2);
      setStatus(`Đã tải: ${baseName(path)} — sang Bước 2 để lấy lời thoại.`);
    } catch (e) {
      setStatus(`Lỗi tải video: ${String(e)}`);
    } finally {
      setRunning(false); setDlPct(null);
    }
  }

  async function onPickVideo() {
    const selected = await open({ filters: [{ name: "Video", extensions: ["mp4", "mkv", "mov"] }] });
    if (!selected) return;
    // Chọn video khác nghĩa là bắt đầu một dự án khác: bỏ hết trạng thái của dự
    // án đang mở, nếu không các bước sau vẫn trỏ vào dự án cũ.
    setProjectDir(""); setVideoPath(""); setCues([]); setCueAudio(""); setCueNote(""); setExported("");
    setPickedVideo(selected as string);
    setTab(2);
    setStatus(`Đã chọn video: ${baseName(selected as string)}`);
  }

  async function onStt() {
    if (!pickedVideo) { setStatus("Chọn video ở Bước 1 trước."); return; }
    setRunning(true); setStatus("Đang nhận dạng lời thoại trong video…");
    try {
      const r = await invoke<SttResultDto>("run_stt", { videoPath: pickedVideo, lang: srcLang });
      setProjectDir(r.projectDir); setVideoPath(pickedVideo);
      // Đã thành dự án thật rồi thì không còn là "video vừa chọn" nữa — nút nhận
      // dạng phải tắt đi, kẻo bấm lần nữa là đẻ thêm một dự án trùng.
      setPickedVideo("");
      setTab(3);
      setStatus(`Đã lấy lời thoại gốc: ${r.cueCount} câu → ${r.srtPath}`);
      await refreshProjects();
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onOpenProject(p: ProjectSummaryDto) {
    setRunning(true);
    try {
      const d = await invoke<ProjectSummaryDto>("open_project", { projectDir: p.projectDir });
      setProjectDir(d.projectDir);
      setVideoPath(d.videoPath);
      setPickedVideo("");
      setExported(d.exportPath ?? "");
      setTgt(d.tgtLang);
      setSrcLang(d.srcLang);
      // Nhảy thẳng tới bước còn dở thay vì bắt người dùng bấm lại từ Bước 1.
      // Đã lồng tiếng rồi thì chỉ còn việc xuất; đã dịch thì tới lồng tiếng.
      setTab(d.hasTts ? 6 : d.hasTranslation ? 5 : d.hasStt ? 3 : 1);
      setStatus(
        d.videoExists
          ? `Đã mở dự án: ${d.videoName}`
          : `Đã mở dự án: ${d.videoName} — nhưng không tìm thấy video gốc, không xuất được.`,
      );
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onDeleteProject(p: ProjectSummaryDto) {
    const ok = await confirm(
      `Xoá vĩnh viễn dự án của "${p.videoName}"?\nMọi file đã sinh (phụ đề, giọng đọc, video đã xuất) sẽ mất và không khôi phục được.`,
      { title: "Xoá dự án", kind: "warning" },
    );
    if (!ok) return;
    setRunning(true);
    try {
      await invoke("delete_project", { projectDir: p.projectDir });
      // Nếu đang mở chính dự án vừa xoá thì phải xoá trạng thái đi, nếu không
      // các nút bên dưới vẫn bật và trỏ vào một thư mục không còn tồn tại.
      if (projectDir === p.projectDir) {
        setProjectDir("");
        setVideoPath("");
        // Các bước sau không còn dự án để làm gì nữa, về Bước 1 cho khỏi nhìn
        // vào một tab rỗng.
        setTab(1);
      }
      await refreshProjects();
      setStatus(`Đã xoá dự án: ${p.videoName}`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onSaveCfg() {
    if (!cfg) return;
    try { await invoke("save_config", { cfg }); setStatus("Đã lưu cấu hình."); } catch (e) { setStatus(`Lỗi lưu: ${String(e)}`); }
  }

  const [soTay, setSoTay] = useState<MucSoTay[]>([]);
  const [tenTim, setTenTim] = useState<TenTim[]>([]);
  const [dangTimTen, setDangTimTen] = useState(false);

  // Sổ tay tên riêng của dự án. Giữ nguyên cả sổ trong state rồi ghi cả file:
  // sổ nhỏ, mà ghi cả file thì không có đường nào để giao diện và đĩa lệch nhau.
  async function napSoTay(dir: string) {
    try {
      const s: any = await invoke("so_tay_doc", { projectDir: dir });
      setSoTay(s?.muc ?? []);
    } catch {
      setSoTay([]);
    }
  }

  async function luuSoTay(muc: MucSoTay[]) {
    setSoTay(muc);
    if (!projectDir) return;
    try {
      await invoke("so_tay_ghi", { projectDir, soTay: { version: 1, muc } });
    } catch (e) {
      setStatus(`Không ghi được sổ tay: ${e}`);
    }
  }

  async function onTuTimTen() {
    if (!projectDir) { setStatus("Chọn dự án trước."); return; }
    setDangTimTen(true);
    setStatus("Đang đọc phụ đề để tìm tên riêng…");
    try {
      const ds: TenTim[] = await invoke("so_tay_tu_tim", { projectDir, provider });
      setTenTim(ds);
      setStatus(ds.length ? `Tìm được ${ds.length} tên riêng. Xem lại rồi bấm Thêm vào sổ.`
                          : "Không tìm thấy tên riêng nào.");
    } catch (e) {
      setStatus(`Không tìm được tên riêng: ${e}`);
    } finally {
      setDangTimTen(false);
    }
  }

  // Đổi dự án là đổi sổ tay: tên riêng thuộc về từng phim. Xoá sạch gợi ý đang
  // hiện dở, nếu không danh sách của phim cũ sẽ được bấm thêm vào sổ phim mới.
  useEffect(() => {
    setTenTim([]);
    if (!projectDir) { setSoTay([]); return; }
    napSoTay(projectDir);
  }, [projectDir]);

  async function onTranslate() {
    if (!projectDir) { setStatus("Lấy lời thoại ở Bước 2 trước."); return; }
    setRunning(true); setStatus(`Đang dịch bằng ${provider}...`);
    try {
      if (provider === "openai_compat" && cfg) {
        try {
          await invoke("save_config", { cfg });
        } catch (e) {
          setStatus(`Lỗi lưu cấu hình: ${String(e)}`);
          return;
        }
      }
      const src = srcLang || "auto";
      const r = await invoke<TranslateResultDto>("run_translate", { projectDir, provider, src, tgt });
      setTab(4);
      setStatus(`Dịch xong: ${r.cueCount} cue → ${r.srtPath}`);
      await refreshProjects();
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onTts() {
    if (!projectDir) { setStatus("Làm Bước 2 và Bước 3 trước."); return; }
    setRunning(true); setStatus("Đang lồng tiếng...");
    try {
      const r = await invoke<TtsResultDto>("run_tts", { projectDir, tgt });
      setTab(6);
      setStatus(`Lồng tiếng xong: ${r.cueCount} cue (sinh mới ${r.generated}, dùng lại ${r.cached}) → ${r.manifestPath}`);
      await refreshProjects();
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onLoadCues() {
    setRunning(true);
    try {
      setCues(await invoke<CueDto[]>("list_cues", { projectDir, tgt }));
      setCueNote("");
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onSaveCue(c: CueDto, text: string, startRaw: string, endRaw: string) {
    const startMs = timeToMs(startRaw);
    const endMs = timeToMs(endRaw);
    if (startMs === null || endMs === null) {
      setStatus("Thời điểm phải theo dạng HH:MM:SS,mmm — ví dụ 00:01:23,450");
      return;
    }
    setRunning(true);
    try {
      await invoke("save_cue", { projectDir, tgt, index: c.index, text, startMs, endMs });
      setCues(await invoke<CueDto[]>("list_cues", { projectDir, tgt }));
      setStatus(`Đã lưu cue ${c.index}.`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onPreviewCue(c: CueDto) {
    setRunning(true);
    setCueNote("");
    try {
      const r = await invoke<PreviewDto>("preview_cue", { projectDir, tgt, index: c.index });
      // Thêm tham số đổi mỗi lần để webview không phát lại bản đã cache.
      setCueAudio(`${convertFileSrc(r.audioPath)}?t=${Date.now()}`);
      setCues(await invoke<CueDto[]>("list_cues", { projectDir, tgt }));
      setStatus(`Nghe thử cue ${c.index}: ${r.durationMs} ms, tốc độ ${r.lengthScale}`);
      if (r.unconstrained) {
        setCueNote(
          "Không tìm thấy video gốc nên cue cuối được đọc không ràng buộc — tốc độ lúc xuất có thể khác.",
        );
      }
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  async function onExport() {
    setRunning(true); setExported(""); setXuatCanhBao([]); setStatus("Đang xuất video...");
    try {
      // Lưu cấu hình TRƯỚC khi xuất, luôn luôn. `run_export` đọc kiểu chữ và
      // logo từ đĩa qua `load_config()`, nó không nhận qua tham số. Nếu chỉ
      // trông vào nút "Lưu cấu hình" ở Bước 6 thì người dùng chỉnh font, thấy
      // trình phát đổi ngay trước mắt, sang Bước 7 bấm Xuất — và nhận về bản
      // với kiểu chữ CŨ, không một lời cảnh báo. Đó là cách hỏng tệ nhất: im
      // lặng và chỉ lộ ra sau khi đã chờ hết một lượt mã hoá.
      //
      // Lỗi lưu thì DỪNG hẳn chứ không xuất tiếp: xuất bằng cấu hình cũ trong
      // khi người dùng tưởng là cấu hình mới chính là thứ đang tránh.
      if (cfg) await invoke("save_config", { cfg });
      const r = await invoke<ExportResultDto>("run_export", {
        projectDir, videoPath, tgt, burnSubs, softSubs,
        outDir: outDir || null,
      });
      const canhBao = r.capped > 0
        ? ` (${r.capped} câu phải đọc nhanh hết cỡ mà vẫn tràn)`
        : "";
      setExported(r.outputPath);
      setXuatCanhBao(r.warnings ?? []);
      setStatus(`Xuất xong: ${baseName(r.outputPath)} — ${r.placed} câu lồng tiếng${canhBao}`);
      await refreshProjects();
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false); setExportPhase("");
    }
  }

  const sub = cfg?.subtitle;
  const setSub = (patch: Partial<SubtitleConfig>) =>
    cfg && setCfg({ ...cfg, subtitle: { ...cfg.subtitle, ...patch } });

  // Font gõ vào ô có thể không có trên máy này — nếu vậy, trình xem thử
  // (WebView2) và bản xuất (ffmpeg/libass) MỖI NƠI TỰ CHỌN một font thay thế
  // RIÊNG mà không ai báo cho ai biết, giống hệt kiểu hỏng-câm-lặng đã có
  // tiền lệ với vụ asset-scope ở lib.rs. Chờ người dùng NGỪNG gõ rồi mới
  // kiểm (debounce), không kiểm ngay mỗi phím: gõ dở một tiền tố của font
  // thật (vd "Aria" giữa chừng gõ "Arial") tự nó không phải tên font nào cả
  // nên kiểm ngay sẽ báo "thiếu" suốt cả quá trình gõ — đúng về kỹ thuật
  // nhưng phiền hơn là không báo.
  const [fontThieu, setFontThieu] = useState(false);
  useEffect(() => {
    if (!sub) { setFontThieu(false); return; }
    const ten = sub.font;
    const hen = window.setTimeout(() => setFontThieu(!fontCoTonTai(ten)), 500);
    return () => window.clearTimeout(hen);
  }, [sub?.font]);

  const wm = cfg?.watermark;
  const setWm = (patch: Partial<WatermarkConfig>) =>
    cfg && setCfg({ ...cfg, watermark: { ...cfg.watermark, ...patch } });

  async function onPickLogo() {
    const f = await open({ filters: [{ name: "Ảnh", extensions: ["png"] }] });
    if (!f) return;
    // Khai phạm vi ngay để trình phát hiện được logo mà không phải lưu config.
    // KHÔNG nuốt lỗi ở đây: asset protocol từ chối im lặng đúng là lớp lỗi
    // từng làm nghe thử cue câm suốt mấy milestone trước — báo cho người dùng
    // biết logo đã chọn nhưng xem thử sẽ trống, kẻo họ tưởng app hỏng.
    try {
      await invoke("cho_phep_xem", { path: f as string });
    } catch (e) {
      setStatus(`Đã chọn logo nhưng không xem thử được: ${String(e)} (xuất video vẫn dùng file này bình thường).`);
    }
    setWm({ path: f as string, enabled: true });
  }

  async function onXemThuPhuDe() {
    if (!projectDir) { setStatus("Mở một dự án đã dịch trước."); return; }
    setSubBusy(true);
    setStatus("Đang dựng khung hình xem thử…");
    try {
      // Lưu cấu hình trước: lệnh dựng khung đọc kiểu chữ từ đĩa, không nhận
      // qua tham số — không lưu thì bạn xem thử bản cũ mà không biết.
      if (cfg) await invoke("save_config", { cfg });
      const p = await invoke<string>("preview_subtitle", { projectDir, tgt });
      setSubPreview(`${convertFileSrc(p)}?t=${Date.now()}`);
      setStatus("");
    } catch (e) {
      setStatus(`Lỗi xem thử phụ đề: ${String(e)}`);
    } finally {
      setSubBusy(false);
    }
  }

  async function onNgheThuGiong() {
    if (!tts) return;
    setDemoBusy(true);
    setDemoAudio("");
    setStatus("Đang tạo câu đọc thử…");
    try {
      const path = await invoke<string>("preview_voice", {
        provider: tts.default_provider,
        voice: tts.voice,
      });
      // Thêm dấu thời gian để webview không phát lại bản cũ trong cache khi
      // người dùng nghe đi nghe lại cùng một giọng.
      setDemoAudio(`${convertFileSrc(path)}?t=${Date.now()}`);
      setStatus("");
    } catch (e) {
      setStatus(`Lỗi nghe thử giọng: ${String(e)}`);
    } finally {
      setDemoBusy(false);
    }
  }

  async function onPickDlDir() {
    const d = await open({ directory: true });
    if (!d) return;
    setDlDir(d as string);
  }

  async function onPickOutDir() {
    const d = await open({ directory: true });
    if (!d) return;
    setOutDir(d as string);
  }

  async function onReveal(path: string) {
    if (!path) return;
    try {
      await revealItemInDir(path);
    } catch (e) {
      // File có thể đã bị đổi tên hoặc xoá sau khi xuất; báo rõ thay vì im lặng.
      setStatus(`Không mở được thư mục: ${String(e)}`);
    }
  }

  const oa = cfg?.translate.openai;
  const setOa = (patch: Partial<OpenAiConfig>) => cfg && setCfg({ ...cfg, translate: { ...cfg.translate, openai: { ...cfg.translate.openai, ...patch } } });
  const tts = cfg?.tts;
  const setTts = (patch: Partial<TtsConfig>) => cfg && setCfg({ ...cfg, tts: { ...cfg.tts, ...patch } });

  /**
   * Bước đã đủ nguyên liệu để làm hay chưa. Chỉ dùng để làm mờ nhãn tab —
   * tab nào cũng bấm vào xem trước được, nút bên trong mới là chỗ chặn thật.
   */
  function thieuGi(id: number): string {
    if (id === 2) return pickedVideo ? "" : "Chọn video ở Bước 1 trước.";
    if (id >= 3) return projectDir ? "" : "Cần lấy lời thoại ở Bước 2 trước.";
    return "";
  }

  return (
    <main className="container">
      <h1>DichVideo-Local</h1>

      {toolsReady === false && (
      <section>
        <h2>Bộ công cụ offline</h2>
        <div className="row">
          <button type="button" onClick={onEnsure} disabled={running}>Tải bộ công cụ</button>
          <span className="muted">
            ffmpeg, nhận dạng giọng nói, giọng đọc và model dịch chạy trên máy —
            khoảng 9,5 GB, chỉ cần tải một lần. Riêng model dịch đã chiếm hơn 8 GB
            nên lần tải đầu mất hàng giờ nếu mạng chậm; cứ để chạy nền. Bản này mới
            thêm phần dịch trên máy, nên máy đã cài đủ từ trước vẫn thấy dòng này
            hiện lại. Mọi bước bên dưới đều cần bộ này.
          </span>
        </div>
        {dl && <p className="muted">{dl}</p>}
      </section>
      )}

      <section>
        <h2>Dự án gần đây</h2>
        {projects.length === 0 && (
          <p className="muted">Chưa có dự án nào. Chọn một video ở Bước 1 để bắt đầu.</p>
        )}
        {projects.map((p) => (
          <div className="project-row" key={p.projectDir}>
            {p.thumbnailPath && (
              <img
                className="project-thumb"
                src={convertFileSrc(p.thumbnailPath)}
                alt=""
              />
            )}
            <span className="grow">
              <b>{p.videoName}</b>
              <span className="muted">
                {" · "}
                {new Date(p.updatedAt).toLocaleString()}
                {" · "}
                {[
                  p.hasStt && "Phụ đề gốc",
                  p.hasTranslation && "Dịch",
                  p.hasTts && "Lồng tiếng",
                  p.hasExport && "Xuất",
                ]
                  .filter(Boolean)
                  .join(" · ") || "trống"}
              </span>
              {!p.videoExists && (
                <>
                  {" "}
                  <span className="badge err">⚠ mất video gốc</span>
                </>
              )}
            </span>
            <button type="button" onClick={() => onOpenProject(p)} disabled={running}>Mở</button>
            {p.exportPath && (
              <button type="button" onClick={() => onReveal(p.exportPath!)} disabled={running}>
                Mở thư mục
              </button>
            )}
            <button type="button" className="danger" onClick={() => onDeleteProject(p)} disabled={running}>Xoá</button>
          </div>
        ))}
      </section>

      <nav className={`tabs${running ? " locked" : ""}`} aria-label="Các bước">
        {BUOC.map((b) => {
          const thieu = thieuGi(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className={[
                tab === b.id ? "active" : "",
                thieu ? "chua-san" : "",
              ].filter(Boolean).join(" ")}
              aria-current={tab === b.id ? "step" : undefined}
              title={running ? "Đang chạy — không chuyển bước được." : thieu}
              onClick={() => setTab(b.id)}
              disabled={running}
            >
              <span className="tab-so">{b.id}</span>
              {b.ten}
            </button>
          );
        })}
      </nav>
      {running && (
        <p className="muted tabs-khoa">
          {tienDo && tienDo.tong > 0
            ? `${TEN_BUOC[tienDo.buoc] ?? tienDo.buoc} ${tienDo.xong}/${tienDo.tong} câu` +
              ` (${Math.floor((tienDo.xong / tienDo.tong) * 100)}%)`
            : "Đang chạy"}
          {" · "}{dongHo(giayChay)} — không chuyển bước được.
        </p>
      )}

      {tab === 1 && (
      <section>
        <h2>Bước 1 · Chọn video</h2>
        <div className="row">
          <button type="button" className="primary" onClick={onPickVideo} disabled={running}>
            Chọn video…
          </button>
          <span className="muted">hoặc dán link</span>
          <input
            className="grow"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            disabled={running}
          />
          <button type="button" onClick={onDownload} disabled={running || !url.trim()}>
            Tải về
          </button>
        </div>
        <div className="row">
          <button type="button" onClick={onPickDlDir} disabled={running}>
            Thư mục tải về…
          </button>
          <span className="muted">
            {dlDir || "mặc định: trong thư mục dữ liệu của app"}
          </span>
          {dlDir && (
            <button type="button" onClick={() => setDlDir("")} disabled={running}>
              Dùng mặc định
            </button>
          )}
        </div>
        {dlPct !== null && <p className="muted">Đang tải… {dlPct.toFixed(0)}%</p>}
        {pickedVideo ? (
          <p className="muted">Đã chọn: {baseName(pickedVideo)} — sang Bước 2 để lấy lời thoại.</p>
        ) : videoPath ? (
          <p className="muted">Dự án đang mở: {baseName(videoPath)}</p>
        ) : (
          <p className="muted">Mở một file mp4, mkv hoặc mov.</p>
        )}
      </section>
      )}

      {tab === 2 && (
      <section>
        <h2>Bước 2 · Lấy lời thoại gốc</h2>
        <div className="row">
          <label className="muted" htmlFor="src-lang">Tiếng nói trong video</label>
          <select
            id="src-lang"
            value={srcLang}
            onChange={(e) => setSrcLang(e.target.value)}
            disabled={running}
          >
            {srcLangs.map((l) => (
              <option key={l} value={l}>{l === "" ? "(tự nhận dạng)" : l}</option>
            ))}
          </select>
          <button
            type="button"
            className="primary"
            onClick={onStt}
            disabled={running || !pickedVideo || srcLangs.length === 0}
          >
            {running ? "Đang chạy…" : "Nhận dạng lời thoại"}
          </button>
        </div>
        <p className="muted">
          {pickedVideo
            ? "Nghe video và chép lại thành phụ đề theo đúng tiếng gốc. Chưa dịch gì ở bước này."
            : "Chọn video ở Bước 1 trước. Mở lại một dự án cũ thì lời thoại đã có sẵn, không cần chạy lại."}
        </p>
      </section>
      )}

      {tab === 3 && (
      <section>
        <h2>Bước 3 · Dịch phụ đề</h2>
        <div className="row">
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="google_free">Google (miễn phí)</option>
            <option value="openai_compat">LLM (OpenAI-compatible, key riêng)</option>
            <option value="llm_tren_may">LLM trên máy (không cần mạng)</option>
          </select>
          <input value={tgt} onChange={(e) => setTgt(e.target.value)} placeholder="Ngôn ngữ đích (vi)" className="input-lang" />
          <button type="button" className="primary" onClick={onTranslate} disabled={running || !projectDir}>Dịch</button>
        </div>
        {provider === "llm_tren_may" && (
          <p className="muted">
            Dịch chạy hẳn trên GPU của máy, không gửi gì ra mạng. Đo thật trên máy này:
            khoảng 26 giây mỗi 40 câu, chiếm khoảng 11 GB VRAM. Lần dịch đầu chờ thêm
            khoảng 6 giây để nạp model; xong là tự tắt để trả lại VRAM.
          </p>
        )}
        {/* Ngữ cảnh đi thẳng vào prompt hệ thống, nên nhà cung cấp nào dùng LLM
            cũng cần chọn được — `make_provider` vẫn truyền `openai.context` cho
            cả `llm_tren_may`, và mọi số đo chất lượng của nó đều đo với ngữ cảnh
            "phim". Google miễn phí không nhận hướng dẫn nào nên vẫn đứng ngoài. */}
        {(provider === "openai_compat" || provider === "llm_tren_may") && oa && (
          <div className="row">
            <label className="muted" htmlFor="ngu-canh">Ngữ cảnh</label>
            <select
              id="ngu-canh"
              value={oa.context}
              onChange={(e) => setOa({ context: e.target.value })}
              disabled={running}
            >
              <option value="">Tự động (để mô hình tự đoán thể loại)</option>
              {contexts.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <span className="muted">Nhớ bấm “Lưu cấu hình”.</span>
          </div>
        )}
        <div className="row col so-tay">
          <div className="row">
            <strong>Sổ tay tên riêng</strong>
            <button type="button" onClick={onTuTimTen} disabled={running || dangTimTen || !projectDir}>
              {dangTimTen ? "Đang tìm…" : "Tự tìm tên riêng"}
            </button>
            <button type="button" onClick={() => luuSoTay([...soTay, { goc: "", dich: "", ghi_chu: "" }])} disabled={running}>
              Thêm dòng
            </button>
          </div>
          <p className="muted">
            Tên trong sổ được ép đúng: sau khi dịch, câu nào gọi sai sẽ tự được dịch lại.
            Sổ riêng cho từng dự án, lưu ngay khi sửa.
          </p>
          {soTay.map((m, i) => (
            <div className="row" key={i}>
              <input
                value={m.goc}
                placeholder="tiếng gốc"
                onChange={(e) => luuSoTay(soTay.map((x, k) => (k === i ? { ...x, goc: e.target.value } : x)))}
              />
              <input
                value={m.dich}
                placeholder="tiếng Việt"
                onChange={(e) => luuSoTay(soTay.map((x, k) => (k === i ? { ...x, dich: e.target.value } : x)))}
              />
              <input
                value={m.ghi_chu}
                placeholder="ghi chú (tên con chó…)"
                onChange={(e) => luuSoTay(soTay.map((x, k) => (k === i ? { ...x, ghi_chu: e.target.value } : x)))}
              />
              <button type="button" onClick={() => luuSoTay(soTay.filter((_, k) => k !== i))} disabled={running}>Xoá</button>
            </div>
          ))}
          {tenTim.length > 0 && (
            <div className="row col ten-tim">
              <p className="muted">
                Máy tự tìm, chưa vào sổ. Dòng đánh dấu là chỗ bảng Hán-Việt đọc khác —
                đáng ngó chứ không chắc là sai, vì bảng thiếu khoảng 21% số chữ và trộn
                âm Nôm với âm Hán-Việt.
              </p>
              {tenTim.map((t, i) => (
                <div className="row" key={t.goc}>
                  <span className="muted">{t.goc}</span>
                  <input
                    value={t.dich}
                    onChange={(e) => setTenTim(tenTim.map((x, k) => (k === i ? { ...x, dich: e.target.value } : x)))}
                  />
                  <span className="muted">{t.loai}</span>
                  {t.dang_ngo && <span className="canh-bao">bảng đọc “{t.bang_doc}”</span>}
                </div>
              ))}
              <div className="row">
                <button
                  type="button"
                  className="primary"
                  disabled={running}
                  onClick={() => {
                    // Tên đã có trong sổ thì giữ bản người dùng đã sửa, không đè.
                    const co = new Set(soTay.map((m) => m.goc));
                    const them = tenTim
                      .filter((t) => !co.has(t.goc))
                      .map((t) => ({ goc: t.goc, dich: t.dich, ghi_chu: t.loai }));
                    luuSoTay([...soTay, ...them]);
                    setTenTim([]);
                  }}
                >
                  Thêm vào sổ
                </button>
                <button type="button" onClick={() => setTenTim([])} disabled={running}>Bỏ qua</button>
              </div>
            </div>
          )}
        </div>
        {provider === "openai_compat" && oa && (
          <div className="row col">
            <div className="row">
              <label className="muted" htmlFor="oa-nha">Nhà cung cấp</label>
              <select
                id="oa-nha"
                value={NHA_CUNG_CAP.some((n) => n.url === oa.base_url) ? oa.base_url : ""}
                onChange={(e) => {
                  const url = e.target.value;
                  if (!url) return;
                  // Model của nhà cũ gần như chắc chắn không tồn tại ở nhà mới,
                  // nên chuyển sang gợi ý đầu tiên thay vì để lại tên sẽ 404.
                  const goi_y = MODEL_GOI_Y[url]?.[0]?.ten;
                  setOa(goi_y ? { base_url: url, model: goi_y } : { base_url: url });
                }}
              >
                <option value="">— tự nhập —</option>
                {NHA_CUNG_CAP.map((n) => (
                  <option key={n.url} value={n.url}>{n.ten}</option>
                ))}
              </select>
            </div>
            <input value={oa.base_url} onChange={(e) => setOa({ base_url: e.target.value })} placeholder="base_url" />
            <input value={oa.api_key} onChange={(e) => setOa({ api_key: e.target.value })} placeholder="api_key" type="password" />
            <input
              value={oa.model}
              list="model-goi-y"
              onChange={(e) => setOa({ model: e.target.value })}
              placeholder="model"
            />
            <datalist id="model-goi-y">
              {(MODEL_GOI_Y[oa.base_url] ?? []).map((m) => (
                <option key={m.ten} value={m.ten}>{m.ghi_chu}</option>
              ))}
            </datalist>
            {(() => {
              const m = MODEL_GOI_Y[oa.base_url]?.find((x) => x.ten === oa.model);
              return m ? <span className="muted">{oa.model}: {m.ghi_chu}</span> : null;
            })()}
            <button type="button" onClick={onSaveCfg}>Lưu cấu hình</button>
          </div>
        )}
      </section>
      )}

      {tab === 4 && (
      <section>
        <h2>Bước 4 · Sửa phụ đề và nghe thử (tuỳ chọn)</h2>
        <div className="row">
          <button type="button" onClick={onLoadCues} disabled={running || !projectDir}>
            Nạp danh sách
          </button>
          {cues.length > 0 && <span className="muted">{cues.length} cue</span>}
        </div>
        {cueNote && <p className="badge stale">{cueNote}</p>}
        {cueAudio && <audio src={cueAudio} controls autoPlay />}
        {cues.length > 0 && (
          <div className="cue-list">
            {cues.map((c) => (
              <CueRow key={c.index} cue={c} running={running} onSave={onSaveCue} onPreview={onPreviewCue} />
            ))}
          </div>
        )}
      </section>
      )}

      {tab === 5 && (
      <section>
        <h2>Bước 5 · Lồng tiếng</h2>
        {tts && (
          <div className="row">
            <label className="muted" htmlFor="tts-provider">Nhà cung cấp</label>
            <select
              id="tts-provider"
              value={tts.default_provider}
              onChange={(e) => setTts({ default_provider: e.target.value })}
              disabled={running}
            >
              <option value="piper">Piper</option>
              <option value="vieneu">VieNeu</option>
            </select>
            <label className="muted" htmlFor="tts-voice">Giọng</label>
            <select
              id="tts-voice"
              value={tts.voice}
              onChange={(e) => setTts({ voice: e.target.value })}
              disabled={running || voices.length === 0}
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>{voiceLabel(v)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={onNgheThuGiong}
              disabled={running || demoBusy || !tts.voice}
            >
              {demoBusy ? "Đang tạo…" : "Nghe thử giọng"}
            </button>
            <button type="button" className="primary" onClick={onTts} disabled={running || !projectDir}>Lồng tiếng</button>
            <button type="button" onClick={onSaveCfg}>Lưu cấu hình</button>
          </div>
        )}
        {demoAudio && <audio src={demoAudio} controls autoPlay />}
        {demoBusy && (
          <p className="muted">
            Lần đầu mất khoảng 10 giây vì phải nạp model; nghe lại cùng giọng
            thì tức thì.
          </p>
        )}
        {tts?.default_provider === "vieneu" && (
          <p className="muted">
            VieNeu chậm hơn Piper khoảng 8 lần (đo thật: RTF 0.60 so với 0.07)
            — một video 10 phút Piper mất khoảng 45 giây, VieNeu mất khoảng 6
            phút. Đừng tưởng app bị treo, cứ để nó chạy.
          </p>
        )}
        <p className="muted">
          Nhớ bấm "Lưu cấu hình" thì nhà cung cấp/giọng mới chọn mới được dùng.
          VieNeu xuất giọng 48 kHz, Piper 22 kHz — sau khi đổi nhà cung cấp
          hoặc đổi giọng phải bấm "Lồng tiếng" lại cho cả dự án; nghe thử một
          cue ở Bước 4 sẽ không dùng được vì hai mức tần số không khớp nhau.
        </p>
      </section>
      )}

      {tab === 6 && (
      <section>
        <h2>Bước 6 · Phụ đề & Logo</h2>
        {sub && (
          <>
            {!burnSubs && (
              <p className="warn">
                Kiểu chữ dưới đây chỉ áp dụng khi bạn tick "Ghi phụ đề vào hình" ở Bước 7.
                Phụ đề bật/tắt được không mang kiểu chữ nào — trình phát của người xem tự
                quyết định font.
              </p>
            )}
            <div className="row">
              <label className="muted" htmlFor="sub-font">Font</label>
              <input
                id="sub-font"
                list="font-goi-y"
                value={sub.font}
                onChange={(e) => setSub({ font: e.target.value })}
                disabled={running}
              />
              <datalist id="font-goi-y">
                {FONT_GOI_Y.map((f) => <option key={f} value={f} />)}
              </datalist>

              <label className="muted" htmlFor="sub-size">Cỡ</label>
              <input
                id="sub-size"
                type="number"
                min={8}
                max={96}
                className="input-lang"
                value={sub.size}
                onChange={(e) => setSub({ size: Number(e.target.value) || 24 })}
                disabled={running}
              />

              <label className="muted" htmlFor="sub-color">Màu chữ</label>
              <input
                id="sub-color"
                type="color"
                value={sub.color}
                onChange={(e) => setSub({ color: e.target.value.toUpperCase() })}
                disabled={running}
              />

              <label className="muted" htmlFor="sub-outline-color">Màu viền</label>
              <input
                id="sub-outline-color"
                type="color"
                value={sub.outline_color}
                onChange={(e) => setSub({ outline_color: e.target.value.toUpperCase() })}
                disabled={running}
              />

              <label className="muted" htmlFor="sub-outline">Dày viền</label>
              <input
                id="sub-outline"
                type="number"
                min={0}
                max={6}
                className="input-lang"
                value={sub.outline}
                onChange={(e) => setSub({ outline: Number(e.target.value) || 0 })}
                disabled={running}
              />
            </div>
            <div className="mau-phu-de" aria-label="Mẫu kiểu chữ phụ đề">
              <div
                className="mau-phu-de-chu"
                style={{
                  fontFamily: sub.font,
                  color: sub.color,
                  WebkitTextStrokeColor: sub.outline_color,
                  // Hai biến này đi vào calc() trong App.css, nơi phép quy đổi
                  // sang lưới ASS 288 đơn vị được viết ra cho nhìn thấy được.
                  ["--sub-co" as string]: String(sub.size),
                  ["--sub-vien" as string]: String(sub.outline),
                }}
              >
                {CAU_MAU_PHU_DE}
              </div>
            </div>
            <p className="muted">
              Mẫu trên đúng tỉ lệ cỡ chữ so với khung hình và dài đúng {MAX_MOT_DONG} ký tự —
              ngưỡng cắt câu. Nó vẽ bằng trình duyệt nên nét chữ lệch chút ít so với bản
              xuất; muốn chấm chính xác thì bấm “Xem thử phụ đề” để dựng khung hình thật.
            </p>
            {fontThieu && (
              <p className="warn">
                Máy này không có font "{sub.font}" — trình xem thử và bản xuất video
                sẽ mỗi nơi TỰ CHỌN một font thay thế KHÁC NHAU (WebView2 rơi về font
                mặc định của hệ điều hành, còn ffmpeg/libass rơi về font mà
                fontconfig/DirectWrite chọn), nên chữ trên màn hình xem thử có thể
                không giống chữ trong video xuất ra.
              </p>
            )}
            <div className="row">
              <button
                type="button"
                onClick={onXemThuPhuDe}
                disabled={running || subBusy || !projectDir}
              >
                {subBusy ? "Đang dựng…" : "Xem thử phụ đề"}
              </button>
              <span className="muted">
                Dựng một khung hình thật của video để chấm kiểu chữ. Khung này chưa gồm
                logo — xem logo ở trình phát bên dưới.
              </span>
            </div>
            <div className="row">
              <span className={sub.size > 36 ? "warn" : "muted"}>
                {sub.size > 36
                  ? `Cỡ ${sub.size} khá lớn: xem mẫu ở trên — câu dài ${MAX_MOT_DONG} ký tự đã tràn xuống hai dòng chưa? Bấm Xem thử phụ đề để chấm chính xác.`
                  : `Phụ đề đã được cắt tối đa ${MAX_MOT_DONG} ký tự mỗi câu. Cỡ chữ càng lớn càng dễ tràn hai dòng — ngưỡng tuỳ kích thước video.`}
              </span>
            </div>
            {subPreview && (
              <img className="sub-preview" src={subPreview} alt="Xem thử phụ đề" />
            )}
          </>
        )}
        {wm && (
          <>
            <label>
              <input
                type="checkbox"
                checked={wm.enabled}
                onChange={(e) => setWm({ enabled: e.target.checked })}
                disabled={running}
              />
              Đóng dấu logo lên video
            </label>
            {wm.enabled && (
              <>
                <p className="warn">
                  Bật logo thì video phải mã hoá lại toàn bộ — lâu ngang "Ghi phụ đề vào
                  hình". Không bật thì xuất chỉ chép luồng hình nên nhanh hơn nhiều.
                </p>
                <div className="row">
                  <button type="button" onClick={onPickLogo} disabled={running}>Chọn file PNG…</button>
                  <span className="muted">{wm.path ? baseName(wm.path) : "chưa chọn"}</span>
                  {wm.path && (
                    <button type="button" onClick={() => setWm({ path: "" })} disabled={running}>Bỏ</button>
                  )}
                </div>
                <div className="row">
                  <label className="muted" htmlFor="wm-goc">Góc</label>
                  <select id="wm-goc" value={wm.corner} onChange={(e) => setWm({ corner: e.target.value })} disabled={running}>
                    {WM_GOC.map((g) => <option key={g.id} value={g.id}>{g.ten}</option>)}
                  </select>

                  <label className="muted" htmlFor="wm-size">Cỡ (% bề ngang)</label>
                  <input
                    id="wm-size" type="number" min={1} max={WM_SIZE_MAX} className="input-lang"
                    value={wm.size_pct}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Bỏ trống giữa lúc xoá để gõ lại: đừng nhảy về mặc định ngay khi
                      // ô còn rỗng, kẻo người dùng không xoá hết số cũ được.
                      if (raw === "") return;
                      const n = Number(raw);
                      // `||` coi 0 là falsy nên gõ "0" cũng bị đẩy về mặc định — nhưng ở
                      // đây 0 dưới min=1 mới thật vô nghĩa, nên clamp lên 1 chứ không
                      // nhảy hẳn về WM_SIZE_MAC_DINH; chỉ giá trị không phải số (rỗng,
                      // "abc") mới rơi về mặc định.
                      // Kẹp CẢ TRẦN: `max` của <input> không chặn gõ tay, mà Rust thì
                      // kẹp về WM_SIZE_MAX — không kẹp ở đây thì xem thử vẽ một cỡ còn
                      // bản xuất ra một cỡ khác.
                      setWm({
                        size_pct: Number.isFinite(n)
                          ? Math.min(WM_SIZE_MAX, Math.max(1, n))
                          : WM_SIZE_MAC_DINH,
                      });
                    }}
                    disabled={running}
                  />

                  <label className="muted" htmlFor="wm-margin">Lề (%)</label>
                  <input
                    id="wm-margin" type="number" min={0} max={WM_MARGIN_MAX} className="input-lang"
                    value={wm.margin_pct}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Bỏ trống giữa lúc xoá để gõ lại — như ô "Cỡ" ở trên.
                      if (raw === "") return;
                      const n = Number(raw);
                      // `||` coi 0 là falsy nên gõ "0" tự nhảy về mặc định — nhưng lề 0
                      // (logo sát mép) là giá trị hợp lệ, không phải lỗi. Dùng
                      // Number.isFinite để tách "không phải số" (rỗng, "abc") khỏi "bằng
                      // 0"; chỉ trường hợp đầu mới rơi về mặc định.
                      // Kẹp về 0..WM_MARGIN_MAX cho khớp `Watermark::moi` bên Rust —
                      // như ô "Cỡ" ở trên.
                      setWm({
                        margin_pct: Number.isFinite(n)
                          ? Math.min(WM_MARGIN_MAX, Math.max(0, n))
                          : WM_MARGIN_MAC_DINH,
                      });
                    }}
                    disabled={running}
                  />

                  <label className="muted" htmlFor="wm-opacity">Độ mờ</label>
                  <input
                    id="wm-opacity" type="range" min={0} max={100}
                    value={Math.round(wm.opacity * 100)}
                    onChange={(e) => setWm({ opacity: Number(e.target.value) / 100 })}
                    disabled={running}
                  />
                  <span className="muted">{Math.round(wm.opacity * 100)}%</span>
                </div>
              </>
            )}
          </>
        )}
        {/* Nút lưu đứng ở cấp BƯỚC, không nằm trong nhánh `wm.enabled`. Trước
            đây nó nằm trong đó, nên ai không bật logo thì cả bước 6 không có
            một chỗ nào để lưu kiểu chữ. Lưu thủ công giờ chỉ còn là tiện ích —
            `onExport` đã tự lưu trước khi xuất (xem chú thích ở đó), nên quên
            bấm cũng không xuất ra nhầm kiểu chữ nữa. */}
        <div className="row">
          <button type="button" onClick={onSaveCfg} disabled={running}>Lưu cấu hình</button>
          <span className="muted">
            Không bắt buộc: lúc bấm "Xuất video" ở Bước 7, thiết lập đang hiển thị ở
            đây được lưu tự động trước khi xuất.
          </span>
        </div>
        <h3 className="muted">Xem thử</h3>
        <div className="row">
          <button type="button" onClick={onLoadCues} disabled={running || !projectDir}>
            Nạp phụ đề để xem thử
          </button>
          <span className="muted">
            Lớp xem thử này vẽ bằng trình duyệt nên nét chữ và cách ngắt dòng lệch chút
            ít so với bản xuất — dùng để căn bố cục và thời điểm. Chấm kiểu chữ thì
            dùng nút "Xem thử phụ đề" ở trên.
          </span>
        </div>
        {sub && <XemThu videoPath={videoPath} cues={cues} sub={sub} wm={wm} />}
      </section>
      )}

      {tab === 7 && (
      <section>
        <h2>Bước 7 · Xuất video</h2>
        <label>
          <input
            type="checkbox"
            checked={burnSubs}
            onChange={(e) => setBurnSubs(e.target.checked)}
          />
          Ghi phụ đề vào hình (burn-in, phải mã hoá lại video nên lâu hơn nhiều)
        </label>
        <label>
          <input
            type="checkbox"
            checked={softSubs}
            disabled={burnSubs}
            onChange={(e) => setSoftSubs(e.target.checked)}
          />
          Kèm phụ đề bật/tắt được
        </label>
        <div className="row">
          <button type="button" onClick={onPickOutDir} disabled={running}>
            Thư mục lưu…
          </button>
          <span className="muted">
            {outDir || "mặc định: trong thư mục dự án"}
          </span>
          {outDir && (
            <button type="button" onClick={() => setOutDir("")} disabled={running}>
              Dùng mặc định
            </button>
          )}
        </div>
        <div className="row">
          <button
            type="button"
            className="primary"
            onClick={onExport}
            disabled={running || !projectDir || !videoPath}
          >
            Xuất video
          </button>
          {exportPhase && <span className="muted">{exportPhase}</span>}
        </div>
        {/* Cảnh báo chứ không phải lỗi: file đã xuất xong và dùng được, chỉ
            thiếu logo. Đặt ngay TRÊN nút mở thư mục để người dùng đọc trước
            khi mở file ra và tự đoán mò vì sao trống logo. */}
        {xuatCanhBao.map((w, i) => (
          <p className="warn" key={i}>{w}</p>
        ))}
        {exported && (
          <div className="row">
            <button type="button" onClick={() => onReveal(exported)} disabled={running}>Mở thư mục chứa file</button>
            <span className="muted">{baseName(exported)}</span>
          </div>
        )}
      </section>
      )}

      {status && <p className="status">{status}</p>}
    </main>
  );
}
function CueRow({
  cue,
  running,
  onSave,
  onPreview,
}: {
  cue: CueDto;
  running: boolean;
  onSave: (c: CueDto, text: string, startRaw: string, endRaw: string) => void;
  onPreview: (c: CueDto) => void;
}) {
  const [text, setText] = useState(cue.text);
  const [startRaw, setStartRaw] = useState(msToTime(cue.startMs));
  const [endRaw, setEndRaw] = useState(msToTime(cue.endMs));

  // Danh sách được nạp lại sau mỗi lần lưu hoặc nghe thử; đồng bộ lại ô nhập
  // theo giá trị vừa về từ đĩa, nếu không người dùng sẽ thấy bản cũ của chính mình.
  useEffect(() => {
    setText(cue.text);
    setStartRaw(msToTime(cue.startMs));
    setEndRaw(msToTime(cue.endMs));
  }, [cue.text, cue.startMs, cue.endMs]);

  return (
    <div className={cue.stale ? "cue-row stale" : "cue-row"}>
      <span className="cue-index">{cue.index}</span>
      <div className="cue-times">
        <input
          value={startRaw}
          onChange={(e) => setStartRaw(e.target.value)}
          title="Thời điểm bắt đầu"
        />
        <input
          value={endRaw}
          onChange={(e) => setEndRaw(e.target.value)}
          title="Thời điểm kết thúc"
        />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
      <div className="cue-actions">
        <button type="button" onClick={() => onSave(cue, text, startRaw, endRaw)} disabled={running}>
          Lưu
        </button>
        <button type="button" className="primary" onClick={() => onPreview(cue)} disabled={running}>
          Nghe thử
        </button>
        {cue.stale && <span className="badge stale">⚠ chưa nghe lại</span>}
      </div>
    </div>
  );
}

export default App;
