import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

interface SttResultDto { srtPath: string; cueCount: number; projectDir: string }
interface TranslateResultDto { srtPath: string; cueCount: number }
interface TtsResultDto { manifestPath: string; cueCount: number; generated: number; cached: number }
interface OpenAiConfig { base_url: string; api_key: string; model: string }
interface AppConfig { translate: { default_provider: string; target_lang: string; openai: OpenAiConfig } }
interface ExportResultDto {
  outputPath: string; adjusted: number; capped: number;
  placed: number; truncated: number; saturated: number;
}
interface ProjectSummaryDto {
  projectDir: string; videoPath: string; videoName: string;
  srcLang: string; tgtLang: string; updatedAt: number;
  hasStt: boolean; hasTranslation: boolean; hasTts: boolean;
  hasExport: boolean; videoExists: boolean;
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
    invoke<AppConfig>("get_config").then((c) => { setCfg(c); setProvider(c.translate.default_provider); setTgt(c.translate.target_lang); });
  }, []);

  async function refreshProjects() {
    try {
      setProjects(await invoke<ProjectSummaryDto[]>("list_projects"));
    } catch (e) {
      setStatus(`Lỗi đọc danh sách dự án: ${String(e)}`);
    }
  }

  useEffect(() => {
    refreshProjects();
    invoke<string[]>("src_langs").then((ls) => {
      setSrcLangs(ls);
      setSrcLang((cur) => cur || ls[0] || "zh");
    });
  }, []);

  async function onEnsure() {
    setRunning(true); setStatus("Đang chuẩn bị bộ công cụ...");
    try {
      await invoke("ensure_components");
      setStatus("Đã cài đủ bộ công cụ."); setDl("");
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onRun() {
    const selected = await open({ filters: [{ name: "Video", extensions: ["mp4", "mkv", "mov"] }] });
    if (!selected) return;
    setProjectDir(""); setVideoPath("");
    setRunning(true); setStatus("Đang chạy STT...");
    try {
      const r = await invoke<SttResultDto>("run_stt", { videoPath: selected, lang: srcLang });
      setProjectDir(r.projectDir); setVideoPath(selected as string);
      setStatus(`STT xong: ${r.cueCount} cue → ${r.srtPath}`);
      await refreshProjects();
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onOpenProject(p: ProjectSummaryDto) {
    try {
      const d = await invoke<ProjectSummaryDto>("open_project", { projectDir: p.projectDir });
      setProjectDir(d.projectDir);
      setVideoPath(d.videoPath);
      setTgt(d.tgtLang);
      setSrcLang(d.srcLang);
      setStatus(
        d.videoExists
          ? `Đã mở dự án: ${d.videoName}`
          : `Đã mở dự án: ${d.videoName} — nhưng không tìm thấy video gốc, không xuất được.`,
      );
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    }
  }

  async function onDeleteProject(p: ProjectSummaryDto) {
    const ok = await confirm(
      `Xoá vĩnh viễn dự án của "${p.videoName}"?\nMọi file đã sinh (phụ đề, giọng đọc, video đã xuất) sẽ mất và không khôi phục được.`,
      { title: "Xoá dự án", kind: "warning" },
    );
    if (!ok) return;
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
    }
  }

  async function onSaveCfg() {
    if (!cfg) return;
    try { await invoke("save_config", { cfg }); setStatus("Đã lưu cấu hình."); } catch (e) { setStatus(`Lỗi lưu: ${String(e)}`); }
  }

  async function onTranslate() {
    if (!projectDir) { setStatus("Chạy STT trước."); return; }
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
      const src = provider === "google_free" ? "auto" : "zh";
      const r = await invoke<TranslateResultDto>("run_translate", { projectDir, provider, src, tgt });
      setStatus(`Dịch xong: ${r.cueCount} cue → ${r.srtPath}`);
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onTts() {
    if (!projectDir) { setStatus("Chạy STT và Dịch trước."); return; }
    setRunning(true); setStatus("Đang lồng tiếng...");
    try {
      const r = await invoke<TtsResultDto>("run_tts", { projectDir, tgt });
      setStatus(`Lồng tiếng xong: ${r.cueCount} cue (sinh mới ${r.generated}, dùng lại ${r.cached}) → ${r.manifestPath}`);
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onExport() {
    setRunning(true); setStatus("Đang xuất video...");
    try {
      const r = await invoke<ExportResultDto>("run_export", {
        projectDir, videoPath, tgt, burnSubs, softSubs,
      });
      const canhBao = r.capped > 0
        ? ` (${r.capped} câu phải đọc nhanh hết cỡ mà vẫn tràn)`
        : "";
      setStatus(`Xuất xong: ${r.outputPath} — ${r.placed} câu lồng tiếng${canhBao}`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false); setExportPhase("");
    }
  }

  const oa = cfg?.translate.openai;
  const setOa = (patch: Partial<OpenAiConfig>) => cfg && setCfg({ ...cfg, translate: { ...cfg.translate, openai: { ...cfg.translate.openai, ...patch } } });

  return (
    <main className="container">
      <h1>DichVideo-Local</h1>

      <h2>Dự án gần đây</h2>
      {projects.length === 0 && (
        <p style={{ opacity: 0.7 }}>Chưa có dự án nào. Chạy STT trên một video để tạo.</p>
      )}
      {projects.map((p) => (
        <div className="row" key={p.projectDir}>
          <span style={{ flex: 1 }}>
            <b>{p.videoName}</b>
            {" · "}
            {new Date(p.updatedAt).toLocaleString()}
            {" · "}
            {[
              p.hasStt && "STT",
              p.hasTranslation && "Dịch",
              p.hasTts && "Lồng tiếng",
              p.hasExport && "Xuất",
            ]
              .filter(Boolean)
              .join(" · ") || "trống"}
            {!p.videoExists && (
              <span style={{ color: "#c00" }}> · ⚠ mất video gốc</span>
            )}
          </span>
          <button type="button" onClick={() => onOpenProject(p)} disabled={running}>Mở</button>
          <button type="button" onClick={() => onDeleteProject(p)} disabled={running}>Xoá</button>
        </div>
      ))}

      <h2>Chọn video</h2>
      <div className="row">
        <button type="button" onClick={onEnsure} disabled={running}>Tải bộ công cụ</button>
        <select
          value={srcLang}
          onChange={(e) => setSrcLang(e.target.value)}
          disabled={running}
          title="Ngôn ngữ nói trong video"
        >
          {srcLangs.map((l) => (
            <option key={l} value={l}>{l === "" ? "(tự nhận dạng)" : l}</option>
          ))}
        </select>
        <button type="button" onClick={onRun} disabled={running}>
          {running ? "Đang chạy..." : "Chạy STT"}
        </button>
      </div>
      {dl && <p style={{ opacity: 0.7 }}>{dl}</p>}

      <h2>Dịch</h2>
      <div className="row">
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="google_free">Google (miễn phí)</option>
          <option value="openai_compat">LLM (OpenAI-compatible, key riêng)</option>
        </select>
        <input value={tgt} onChange={(e) => setTgt(e.target.value)} placeholder="Ngôn ngữ đích (vi)" style={{ width: 80 }} />
        <button type="button" onClick={onTranslate} disabled={running || !projectDir}>Dịch</button>
      </div>
      {provider === "openai_compat" && oa && (
        <div className="row" style={{ flexDirection: "column", gap: 6 }}>
          <input value={oa.base_url} onChange={(e) => setOa({ base_url: e.target.value })} placeholder="base_url" />
          <input value={oa.api_key} onChange={(e) => setOa({ api_key: e.target.value })} placeholder="api_key" type="password" />
          <input value={oa.model} onChange={(e) => setOa({ model: e.target.value })} placeholder="model" />
          <button type="button" onClick={onSaveCfg}>Lưu cấu hình</button>
        </div>
      )}

      <h2>Lồng tiếng</h2>
      <div className="row">
        <button type="button" onClick={onTts} disabled={running || !projectDir}>Lồng tiếng</button>
      </div>

      <h2>Xuất video</h2>
      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={burnSubs}
            onChange={(e) => setBurnSubs(e.target.checked)}
          />
          Ghi phụ đề vào hình (burn-in, phải mã hoá lại video nên lâu hơn nhiều)
        </label>
      </div>
      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={softSubs}
            disabled={burnSubs}
            onChange={(e) => setSoftSubs(e.target.checked)}
          />
          Kèm phụ đề bật/tắt được
        </label>
      </div>
      <div className="row">
        <button
          type="button"
          onClick={onExport}
          disabled={running || !projectDir || !videoPath}
        >
          Xuất video
        </button>
        {exportPhase && <span>{exportPhase}</span>}
      </div>
      {status && <p>{status}</p>}
    </main>
  );
}
export default App;
