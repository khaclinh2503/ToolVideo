import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

interface SttResultDto { srtPath: string; cueCount: number; projectDir: string }
interface TranslateResultDto { srtPath: string; cueCount: number }
interface OpenAiConfig { base_url: string; api_key: string; model: string }
interface AppConfig { translate: { default_provider: string; target_lang: string; openai: OpenAiConfig } }

function App() {
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [projectDir, setProjectDir] = useState("");
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [provider, setProvider] = useState("google_free");
  const [tgt, setTgt] = useState("vi");

  useEffect(() => {
    invoke<AppConfig>("get_config").then((c) => { setCfg(c); setProvider(c.translate.default_provider); setTgt(c.translate.target_lang); });
  }, []);

  async function onRun() {
    const selected = await open({ filters: [{ name: "Video", extensions: ["mp4", "mkv", "mov"] }] });
    if (!selected) return;
    setRunning(true); setStatus("Đang chạy STT...");
    try {
      const r = await invoke<SttResultDto>("run_stt", { videoPath: selected, lang: "zh" });
      setProjectDir(r.projectDir);
      setStatus(`STT xong: ${r.cueCount} cue → ${r.srtPath}`);
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  async function onSaveCfg() {
    if (!cfg) return;
    try { await invoke("save_config", { cfg }); setStatus("Đã lưu cấu hình."); } catch (e) { setStatus(`Lỗi lưu: ${String(e)}`); }
  }

  async function onTranslate() {
    if (!projectDir) { setStatus("Chạy STT trước."); return; }
    setRunning(true); setStatus(`Đang dịch bằng ${provider}...`);
    try {
      const src = provider === "google_free" ? "auto" : "zh";
      const r = await invoke<TranslateResultDto>("run_translate", { projectDir, provider, src, tgt });
      setStatus(`Dịch xong: ${r.cueCount} cue → ${r.srtPath}`);
    } catch (e) { setStatus(`Lỗi: ${String(e)}`); } finally { setRunning(false); }
  }

  const oa = cfg?.translate.openai;
  const setOa = (patch: Partial<OpenAiConfig>) => cfg && setCfg({ ...cfg, translate: { ...cfg.translate, openai: { ...cfg.translate.openai, ...patch } } });

  return (
    <main className="container">
      <h1>DichVideo-Local</h1>
      <div className="row"><button type="button" onClick={onRun} disabled={running}>{running ? "Đang chạy..." : "Chạy STT"}</button></div>

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
      {status && <p>{status}</p>}
    </main>
  );
}
export default App;
