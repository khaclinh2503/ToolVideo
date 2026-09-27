import { useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { listen } from "@tauri-apps/api/event";
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
interface AppConfig {
  translate: { default_provider: string; target_lang: string; openai: OpenAiConfig };
  tts: TtsConfig;
  subtitle: SubtitleConfig;
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

const FONT_GOI_Y = [
  "Arial", "Segoe UI", "Tahoma", "Verdana",
  "Times New Roman", "Calibri", "Roboto",
];
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

function App() {
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
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
      setStatus(`Dịch xong: ${r.cueCount} cue → ${r.srtPath}`);
      await refreshProjects();
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onTts() {
    if (!projectDir) { setStatus("Làm Bước 2 và Bước 3 trước."); return; }
    setRunning(true); setStatus("Đang lồng tiếng...");
    try {
      const r = await invoke<TtsResultDto>("run_tts", { projectDir, tgt });
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
    setRunning(true); setExported(""); setStatus("Đang xuất video...");
    try {
      const r = await invoke<ExportResultDto>("run_export", {
        projectDir, videoPath, tgt, burnSubs, softSubs,
        outDir: outDir || null,
      });
      const canhBao = r.capped > 0
        ? ` (${r.capped} câu phải đọc nhanh hết cỡ mà vẫn tràn)`
        : "";
      setExported(r.outputPath);
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

  return (
    <main className="container">
      <h1>DichVideo-Local</h1>

      {toolsReady === false && (
      <section>
        <h2>Bộ công cụ offline</h2>
        <div className="row">
          <button type="button" onClick={onEnsure} disabled={running}>Tải bộ công cụ</button>
          <span className="muted">
            ffmpeg, nhận dạng giọng nói và giọng đọc — khoảng 570 MB, chỉ cần tải
            một lần. Mọi bước bên dưới đều cần bộ này.
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
              <button type="button" onClick={() => onReveal(p.exportPath!)}>
                Mở thư mục
              </button>
            )}
            <button type="button" className="danger" onClick={() => onDeleteProject(p)} disabled={running}>Xoá</button>
          </div>
        ))}
      </section>

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

      <section>
        <h2>Bước 3 · Dịch phụ đề</h2>
        <div className="row">
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="google_free">Google (miễn phí)</option>
            <option value="openai_compat">LLM (OpenAI-compatible, key riêng)</option>
          </select>
          <input value={tgt} onChange={(e) => setTgt(e.target.value)} placeholder="Ngôn ngữ đích (vi)" className="input-lang" />
          <button type="button" className="primary" onClick={onTranslate} disabled={running || !projectDir}>Dịch</button>
        </div>
        {provider === "openai_compat" && oa && (
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

      <section>
        <h2>Bước 6 · Xuất video</h2>
        <label>
          <input
            type="checkbox"
            checked={burnSubs}
            onChange={(e) => setBurnSubs(e.target.checked)}
          />
          Ghi phụ đề vào hình (burn-in, phải mã hoá lại video nên lâu hơn nhiều)
        </label>
        {burnSubs && sub && (
          <>
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
            <div className="row">
              <button
                type="button"
                onClick={onXemThuPhuDe}
                disabled={running || subBusy || !projectDir}
              >
                {subBusy ? "Đang dựng…" : "Xem thử phụ đề"}
              </button>
              <span className="muted">
                Dựng một khung hình thật của video để xem kiểu chữ trước khi
                xuất — xuất cả video có thể mất vài phút.
              </span>
            </div>
            <div className="row">
              <span className={sub.size > 36 ? "warn" : "muted"}>
                {sub.size > 36
                  ? `Cỡ ${sub.size} khá lớn: phụ đề được cắt tối đa ${MAX_MOT_DONG} ký tự, nhưng cỡ này vẫn có thể tràn xuống hai dòng. Bấm Xem thử để chắc.`
                  : `Phụ đề đã được cắt tối đa ${MAX_MOT_DONG} ký tự mỗi câu. Cỡ chữ càng lớn càng dễ tràn hai dòng — ngưỡng tuỳ kích thước video.`}
              </span>
            </div>
            {subPreview && (
              <img className="sub-preview" src={subPreview} alt="Xem thử phụ đề" />
            )}
          </>
        )}
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
        {exported && (
          <div className="row">
            <button type="button" onClick={() => onReveal(exported)}>Mở thư mục chứa file</button>
            <span className="muted">{baseName(exported)}</span>
          </div>
        )}
      </section>

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
