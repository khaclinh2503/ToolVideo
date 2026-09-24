import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

interface SttResultDto {
  srtPath: string;
  cueCount: number;
}

function App() {
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);

  async function onRun() {
    const selected = await open({
      filters: [{ name: "Video", extensions: ["mp4", "mkv", "mov"] }],
    });
    if (!selected) return;

    setRunning(true);
    setStatus("Đang chạy STT...");
    try {
      const r = await invoke<SttResultDto>("run_stt", {
        videoPath: selected,
        lang: "zh",
      });
      setStatus(`Xong: ${r.cueCount} cue → ${r.srtPath}`);
    } catch (e) {
      setStatus(`Lỗi: ${String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="container">
      <h1>DichVideo-Local</h1>
      <p>Chọn video và chạy nhận dạng giọng nói (STT).</p>

      <div className="row">
        <button type="button" onClick={onRun} disabled={running}>
          {running ? "Đang chạy..." : "Chạy STT"}
        </button>
      </div>

      {status && <p>{status}</p>}
    </main>
  );
}

export default App;
