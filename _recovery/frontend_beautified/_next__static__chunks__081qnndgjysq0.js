(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 67464, 22997, e => {
  "use strict";
  var t, n, i, r, a = e.i(86682);
  (t = i || (i = {}))[t.Audio = 1] = "Audio", t[t.Cache = 2] = "Cache", t[t.Config = 3] = "Config", t[t.Data = 4] = "Data", t[t.LocalData = 5] = "LocalData", t[t.Document = 6] = "Document", t[t.Download = 7] = "Download", t[t.Picture = 8] = "Picture", t[t.Public = 9] = "Public", t[t.Video = 10] = "Video", t[t.Resource = 11] = "Resource", t[t.Temp = 12] = "Temp", t[t.AppConfig = 13] = "AppConfig", t[t.AppData = 14] = "AppData", t[t.AppLocalData = 15] = "AppLocalData", t[t.AppCache = 16] = "AppCache", t[t.AppLog = 17] = "AppLog", t[t.Desktop = 18] = "Desktop", t[t.Executable = 19] = "Executable", t[t.Font = 20] = "Font", t[t.Home = 21] = "Home", t[t.Runtime = 22] = "Runtime", t[t.Template = 23] = "Template", e.s(["BaseDirectory", 0, i], 22997);
  async function o(e, t) {
    if (e instanceof URL && "file:" !== e.protocol) throw TypeError("Must be a file URL.");
    await (0, a.invoke)("plugin:fs|mkdir", {
      path: e instanceof URL ? e.toString() : e,
      options: t
    })
  }
  async function s(e, t) {
    if (e instanceof URL && "file:" !== e.protocol) throw TypeError("Must be a file URL.");
    let n = await (0, a.invoke)("plugin:fs|read_text_file", {
        path: e instanceof URL ? e.toString() : e,
        options: t
      }),
      i = n instanceof ArrayBuffer ? n : Uint8Array.from(n);
    return new TextDecoder(t?.encoding ?? "utf-8").decode(i)
  }
  async function c(e, t) {
    if (e instanceof URL && "file:" !== e.protocol) throw TypeError("Must be a file URL.");
    await (0, a.invoke)("plugin:fs|remove", {
      path: e instanceof URL ? e.toString() : e,
      options: t
    })
  }
  async function u(e, t, n) {
    if (e instanceof URL && "file:" !== e.protocol || t instanceof URL && "file:" !== t.protocol) throw TypeError("Must be a file URL.");
    await (0, a.invoke)("plugin:fs|rename", {
      oldPath: e instanceof URL ? e.toString() : e,
      newPath: t instanceof URL ? t.toString() : t,
      options: n
    })
  }
  async function l(e, t, n) {
    if (e instanceof URL && "file:" !== e.protocol) throw TypeError("Must be a file URL.");
    let i = new TextEncoder;
    await (0, a.invoke)("plugin:fs|write_text_file", i.encode(t), {
      headers: {
        path: encodeURIComponent(e instanceof URL ? e.toString() : e),
        options: JSON.stringify(n)
      }
    })
  }
  async function d(e, t) {
    if (e instanceof URL && "file:" !== e.protocol) throw TypeError("Must be a file URL.");
    return await (0, a.invoke)("plugin:fs|exists", {
      path: e instanceof URL ? e.toString() : e,
      options: t
    })
  }(n = r || (r = {}))[n.Start = 0] = "Start", n[n.Current = 1] = "Current", n[n.End = 2] = "End", a.Resource, a.Resource, e.s(["exists", 0, d, "mkdir", 0, o, "readTextFile", 0, s, "remove", 0, c, "rename", 0, u, "writeTextFile", 0, l], 67464)
}, 81341, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(68078),
    i = e.i(67464);
  async function r(e, n) {
    await (0, t.invoke)("plugin:shell|open", {
      path: e,
      with: n
    })
  }

  function a() {
    return "__TAURI_INTERNALS__" in window
  }
  async function o(e) {
    if (e) {
      if (!a()) return void window.open(e, "_blank", "noopener,noreferrer");
      await r(e)
    }
  }
  async function s(e) {
    if (!e) return !1;
    if (a()) try {
      return await (0, t.invoke)("file_exists", {
        path: e
      })
    } catch {}
    try {
      return await (0, i.exists)(e)
    } catch {
      return !1
    }
  }
  async function c(e) {
    return (0, t.invoke)("compute_file_sha256", {
      path: e
    })
  }
  async function u(e) {
    if (!a()) return console.warn("openFileDialog is only available in Tauri runtime."), null;
    let t = await (0, n.open)({
      multiple: !1,
      filters: e ?? [{
        name: "Video",
        extensions: ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv"]
      }]
    });
    return "string" == typeof t ? t : null
  }
  async function l(e) {
    if (!a()) return console.warn("openMultipleFileDialog is only available in Tauri runtime."), [];
    let t = await (0, n.open)({
      multiple: !0,
      filters: e ?? [{
        name: "Video",
        extensions: ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv"]
      }]
    });
    return t ? Array.isArray(t) ? t : [t] : []
  }
  async function d() {
    if (!a()) return console.warn("openDirectoryDialog is only available in Tauri runtime."), null;
    let e = await (0, n.open)({
      directory: !0,
      multiple: !1
    });
    return "string" == typeof e ? e : null
  }
  async function p(e) {
    return e.trim() ? a() ? (0, t.invoke)("list_video_files_in_directory", {
      path: e
    }) : (console.warn("listVideoFilesInDirectory is only available in Tauri runtime."), []) : []
  }
  async function _(e, t) {
    return a() ? (0, n.save)({
      defaultPath: e,
      filters: t ?? [{
        name: "MP4",
        extensions: ["mp4"]
      }, {
        name: "MKV",
        extensions: ["mkv"]
      }, {
        name: "WebM",
        extensions: ["webm"]
      }]
    }) : (console.warn("saveFileDialog is only available in Tauri runtime."), null)
  }
  async function f(e, t, i = "info") {
    if (!a()) {
      let n = "error" === i ? "[Error]" : "warning" === i ? "[Warning]" : "[Info]";
      window.alert(`${n} ${e}

${t}`);
      return
    }
    await (0, n.message)(t, {
      title: e,
      kind: i
    })
  }
  async function m(e, t, i = "warning", r = {}) {
    if (!a()) {
      let n = "error" === i ? "[Error]" : "warning" === i ? "[Warning]" : "[Info]";
      return window.confirm(`${n} ${e}

${t}`)
    }
    return (0, n.ask)(t, {
      title: e,
      kind: i,
      okLabel: r.confirmLabel,
      cancelLabel: r.cancelLabel
    })
  }
  e.s(["askMessage", 0, m, "computeFileSha256", 0, c, "fileExists", 0, s, "isTauri", 0, a, "listVideoFilesInDirectory", 0, p, "openDirectoryDialog", 0, d, "openFileDialog", 0, u, "openMultipleFileDialog", 0, l, "openUrlInSystemBrowser", 0, o, "resolveMediaSrc", 0, function(e) {
    return /^(?:asset|http|https|data|blob):/i.test(e) ? e : a() ? (0, t.convertFileSrc)(e) : e
  }, "saveFileDialog", 0, _, "showMessage", 0, f], 81341)
}, 41824, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(67464),
    i = e.i(22997);
  let r = "auth";

  function a(e) {
    let t = {
        "dichvideo-auth-session": "session",
        "dichvideo-auth-session-code-verifier": "pkce",
        "dichvideo-auth-session-user": "user"
      },
      n = Object.hasOwn(t, e) ? t[e] : null;
    if (!n) throw Error("desktop_auth_storage_key_unsupported");
    return {
      file: `${r}/${n}.json`,
      pending: `${r}/${n}.pending.json`
    }
  }
  async function o() {
    return (0, t.invoke)("start_desktop_auth_bridge")
  }
  async function s(e) {
    return (0, t.invoke)("poll_desktop_auth_bridge", {
      authState: e
    })
  }
  async function c() {
    return (0, t.invoke)("get_device_fingerprint")
  }
  async function u(e) {
    await (0, n.exists)(e, {
      baseDir: i.BaseDirectory.AppLocalData
    }) && await (0, n.remove)(e, {
      baseDir: i.BaseDirectory.AppLocalData
    })
  }
  e.s(["desktopAuthSessionFileStorage", 0, {
    async getItem(e) {
      let {
        file: t
      } = a(e);
      return await (0, n.exists)(t, {
        baseDir: i.BaseDirectory.AppLocalData
      }) ? (0, n.readTextFile)(t, {
        baseDir: i.BaseDirectory.AppLocalData
      }) : null
    },
    async setItem(e, t) {
      let {
        file: o,
        pending: s
      } = a(e);
      if (await (0, n.mkdir)(r, {
          baseDir: i.BaseDirectory.AppLocalData,
          recursive: !0
        }), await (0, n.writeTextFile)(s, t, {
          baseDir: i.BaseDirectory.AppLocalData
        }), await (0, n.readTextFile)(s, {
          baseDir: i.BaseDirectory.AppLocalData
        }) !== t) throw Error("desktop auth pending write verification failed");
      await (0, n.rename)(s, o, {
        oldPathBaseDir: i.BaseDirectory.AppLocalData,
        newPathBaseDir: i.BaseDirectory.AppLocalData
      })
    },
    async removeItem(e) {
      let {
        file: t,
        pending: n
      } = a(e);
      await u(n), await u(t)
    }
  }, "getDeviceFingerprint", 0, c, "pollDesktopAuthBridge", 0, s, "startDesktopAuthBridge", 0, o])
}, 63126, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(81341);
  async function i(e, n, i) {
    let r = {
      path: e,
      data_base64: function(e) {
        let t = "";
        for (let n = 0; n < e.length; n += 32768) t += String.fromCharCode(...e.subarray(n, n + 32768));
        return btoa(t)
      }(n),
      expected_extension: i ?? null
    };
    return (0, t.invoke)("write_managed_binary_file", {
      request: r
    })
  }
  async function r() {
    return (0, t.invoke)("get_temp_dir")
  }
  async function a() {
    return (0, t.invoke)("get_default_output_dir")
  }
  async function o() {
    return (0, t.invoke)("get_log_file_path")
  }
  async function s(e) {
    if (e) return (0, n.isTauri)() ? (0, t.invoke)("open_file_in_system", {
      path: e
    }) : void console.warn("openPathInSystem is only available in Tauri runtime.")
  }
  async function c(e) {
    if (e) return (0, n.isTauri)() ? (0, t.invoke)("reveal_path_in_system", {
      path: e
    }) : void console.warn("revealPathInSystem is only available in Tauri runtime.")
  }
  async function u(e) {
    return (0, t.invoke)("read_managed_text_file", {
      path: e
    })
  }
  async function l(e) {
    return (0, t.invoke)("delete_managed_project_files", {
      request: e
    })
  }
  async function d(e) {
    return (0, t.invoke)("prune_native_vnext_runs", {
      request: e
    })
  }
  async function p() {
    return (0, t.invoke)("get_managed_paths")
  }
  async function _(e) {
    return (0, t.invoke)("get_project_workspace_dir", {
      projectId: e
    })
  }
  async function f(e, n) {
    return (0, t.invoke)("get_project_artifact_path", {
      projectId: e,
      kind: n
    })
  }
  async function m(e, n) {
    return (0, t.invoke)("write_project_manifest", {
      projectId: e,
      manifest: n
    })
  }
  async function h(e) {
    return (0, t.invoke)("read_project_manifest", {
      projectId: e
    })
  }
  async function g(e) {
    return (0, t.invoke)("seal_export_design_preset_images_command", {
      request: e
    })
  }
  async function v() {
    let e = await (0, t.invoke)("list_project_manifests");
    for (let t of e.warnings) console.warn(`Project manifest skipped: ${t.path} (${t.reason})`);
    return e.records
  }
  async function y(e) {
    return (0, t.invoke)("delete_project_workspace", {
      projectId: e
    })
  }
  async function b(e) {
    return (0, t.invoke)("export_project_support_bundle", {
      request: e
    })
  }
  async function w(e) {
    return (0, t.invoke)("open_project_support_bundle_folder", {
      path: e
    })
  }
  async function k() {
    return (0, t.invoke)("get_dependency_status")
  }
  async function x() {
    return (0, t.invoke)("ensure_directories")
  }
  e.s(["deleteManagedProjectFiles", 0, l, "deleteProjectWorkspace", 0, y, "ensureDirectories", 0, x, "exportProjectSupportBundle", 0, b, "getDefaultOutputDir", 0, a, "getDependencyStatus", 0, k, "getLogFilePath", 0, o, "getManagedPaths", 0, p, "getProjectArtifactPath", 0, f, "getProjectWorkspaceDir", 0, _, "getTempDir", 0, r, "listProjectManifests", 0, v, "openPathInSystem", 0, s, "openProjectSupportBundleFolder", 0, w, "pruneNativeVnextRuns", 0, d, "readManagedTextFile", 0, u, "readProjectManifest", 0, h, "revealPathInSystem", 0, c, "sealExportDesignPresetImages", 0, g, "writeManagedBinaryFile", 0, i, "writeProjectManifest", 0, m])
}, 3570, e => {
  "use strict";
  var t = e.i(86682);
  async function n() {
    return await (0, t.invoke)("read_terminal_report_outbox")
  }
  async function i(e, n) {
    return await (0, t.invoke)("enqueue_terminal_report_draft", {
      jobId: e,
      draft: n
    })
  }
  async function r(e, n) {
    return await (0, t.invoke)("ack_terminal_report", {
      deliveryId: e,
      payloadSha256: n
    })
  }
  async function a(e, n, i) {
    return await (0, t.invoke)("quarantine_legacy_terminal_evidence", {
      jobId: e,
      reasonCode: n,
      evidenceSha256: i
    })
  }
  e.s(["ackTerminalReport", 0, r, "enqueueTerminalReportDraft", 0, i, "quarantineLegacyTerminalEvidence", 0, a, "readTerminalReportOutbox", 0, n])
}, 88717, e => {
  "use strict";
  var t = e.i(54181);
  let n = /^sha256:[0-9a-f]{64}$/,
    i = /^[0-9a-f]{64}$/,
    r = BigInt(0),
    a = BigInt(1),
    o = (a << BigInt(64)) - a,
    s = -(a << BigInt(63)),
    c = (a << BigInt(63)) - a,
    u = new Map;

  function l(e, t) {
    if (!e || "object" != typeof e || Array.isArray(e)) throw Error(`${t} must be an object`);
    return e
  }

  function d(e, t) {
    if (!Array.isArray(e)) throw Error(`${t} must be an array`);
    return e
  }

  function p(e, t) {
    if ("string" != typeof e || 0 === e.length) throw Error(`${t} must be a nonempty string`);
    return e
  }

  function _(e, t, n = 0) {
    if ("number" != typeof e || !Number.isInteger(e) || e < n) throw Error(`${t} must be an integer`);
    return e
  }

  function f(e, t) {
    if ("number" != typeof e || !Number.isFinite(e)) throw Error(`${t} must be a finite number`);
    return e
  }

  function m(e, t) {
    if ("boolean" != typeof e) throw Error(`${t} must be a boolean`);
    return e
  }

  function h(e, t) {
    let i = p(e, t);
    if (!n.test(i)) throw Error(`${t} must be a sha256 identity`);
    return i
  }

  function g(e, t) {
    let n = p(e, t);
    if (!i.test(n)) throw Error(`${t} must be a raw sha256 digest`);
    return n
  }

  function v(e, t, n) {
    if ("string" != typeof e) throw Error(`${t} must be a decimal string`);
    if (!(n ? /^(?:0|-?[1-9][0-9]*)$/ : /^(?:0|[1-9][0-9]*)$/).test(e)) throw Error(`${t} must use canonical decimal form`);
    let i = BigInt(e);
    if (n ? i < s || i > c : i < r || i > o) throw Error(`${t} is outside its exact integer range`);
    return e
  }

  function y(e, t) {
    return v(e, t, !1)
  }

  function b(e, t) {
    return v(e, t, !0)
  }

  function w(e, t) {
    let n = l(e, t),
      i = y(n.numerator, `${t}.numerator`),
      a = y(n.denominator, `${t}.denominator`);
    if (BigInt(a) === r) throw Error(`${t}.denominator must be positive`);
    return {
      numerator: i,
      denominator: a
    }
  }
  async function k(e) {
    let t = new Uint8Array(8 * e.length),
      n = new DataView(t.buffer);
    e.forEach((e, t) => n.setBigInt64(8 * t, e, !0));
    let i = new Uint8Array(await crypto.subtle.digest("SHA-256", t));
    return `sha256:${Array.from(i,e=>e.toString(16).padStart(2,"0")).join("")}`
  }
  async function x(e) {
    let t, n = l(e, "sourceTimebase.pts.index");
    if ("source-frame-pts-index-v1" !== n.schemaVersion) throw Error("PTS index schema is invalid");
    let i = y(n.frameCount, "sourceTimebase.pts.index.frameCount"),
      o = l(n.storage, "sourceTimebase.pts.index.storage");
    if ("uniform" === o.kind) t = {
      kind: "uniform",
      firstPts: b(o.firstPts, "sourceTimebase.pts.index.storage.firstPts"),
      deltaTicks: b(o.deltaTicks, "sourceTimebase.pts.index.storage.deltaTicks"),
      frameCount: y(o.frameCount, "sourceTimebase.pts.index.storage.frameCount")
    };
    else if ("delta_blocks" === o.kind) {
      let e = d(o.encodedDeltas, "sourceTimebase.pts.index.storage.encodedDeltas").map((e, t) => {
          let n = _(e, `sourceTimebase.pts.index.storage.encodedDeltas[${t}]`);
          if (n > 255) throw Error("PTS encoded byte is outside u8");
          return n
        }),
        n = d(o.checkpoints, "sourceTimebase.pts.index.storage.checkpoints").map((e, t) => {
          let n = l(e, `sourceTimebase.pts.index.storage.checkpoints[${t}]`);
          return {
            ordinal: y(n.ordinal, `sourceTimebase.pts.index.storage.checkpoints[${t}].ordinal`),
            pts: b(n.pts, `sourceTimebase.pts.index.storage.checkpoints[${t}].pts`),
            byteOffset: y(n.byteOffset, `sourceTimebase.pts.index.storage.checkpoints[${t}].byteOffset`)
          }
        });
      if (0 === n.length || BigInt(n[0].ordinal) !== r) throw Error("PTS checkpoints must begin at ordinal zero");
      n.forEach((t, i) => {
        if (i > 0 && BigInt(t.ordinal) <= BigInt(n[i - 1].ordinal)) throw Error("PTS checkpoints must be strictly ordered");
        if (BigInt(t.byteOffset) > BigInt(e.length)) throw Error("PTS checkpoint byte offset is invalid")
      }), t = {
        kind: "delta_blocks",
        firstPts: b(o.firstPts, "sourceTimebase.pts.index.storage.firstPts"),
        checkpointInterval: _(o.checkpointInterval, "sourceTimebase.pts.index.storage.checkpointInterval", 1),
        checkpoints: n,
        encodedDeltas: e,
        frameCount: y(o.frameCount, "sourceTimebase.pts.index.storage.frameCount")
      }
    } else throw Error("PTS storage kind is invalid");
    if (t.frameCount !== i) throw Error("PTS storage/frame-count mismatch");
    let u = h(n.sequenceSha256, "sourceTimebase.pts.index.sequenceSha256"),
      p = {
        schemaVersion: "source-frame-pts-index-v1",
        storage: t,
        frameCount: i,
        sequenceSha256: u
      },
      f = function(e) {
        let t = Number(BigInt(e.frameCount));
        if (!Number.isSafeInteger(t) || t <= 0) throw Error("PTS frame count cannot be materialized safely");
        let n = [];
        if ("uniform" === e.storage.kind) {
          let i = BigInt(e.storage.firstPts),
            r = BigInt(e.storage.deltaTicks);
          for (let e = 0; e < t; e += 1) n.push(i + r * BigInt(e));
          return n
        }
        let i = new Map(e.storage.checkpoints.map(e => [Number(BigInt(e.ordinal)), e])),
          o = BigInt(e.storage.firstPts),
          u = 0;
        for (let l = 0; l < t; l += 1) {
          let t = i.get(l);
          if (t) o = BigInt(t.pts), u = Number(BigInt(t.byteOffset));
          else if (l > 0) {
            let [t, n] = function(e, t) {
              let n = r,
                i = r;
              for (let r = t; r < e.length && r < t + 10; r += 1) {
                let t = e[r];
                if (n |= BigInt(127 & t) << i, (128 & t) == 0) return [n >> a ^ -(n & a), r + 1];
                i += BigInt(7)
              }
              throw Error("PTS delta encoding is truncated or invalid")
            }(e.storage.encodedDeltas, u);
            o += t, u = n
          }
          if (o < s || o > c) throw Error("PTS reconstruction overflowed i64");
          n.push(o)
        }
        return n
      }(p);
    if (f.some((e, t) => t > 0 && e <= f[t - 1])) throw Error("PTS sequence must be strictly increasing");
    if (await k(f) !== u) throw Error("PTS sequence hash does not match original timestamps");
    return p
  }
  async function I(e) {
    let t = l(e, "sourceTimebase");
    if ("virtual" === t.kind) return {
      kind: "virtual",
      frameRate: w(t.frameRate, "sourceTimebase.frameRate"),
      sourceDurationMs: y(t.sourceDurationMs, "sourceTimebase.sourceDurationMs"),
      estimatedSourceFrames: y(t.estimatedSourceFrames, "sourceTimebase.estimatedSourceFrames")
    };
    if ("exact" !== t.kind) throw Error("sourceTimebase.kind is invalid");
    let n = l(t.pts, "sourceTimebase.pts"),
      i = l(n.metrics, "sourceTimebase.pts.metrics"),
      a = y(n.timeBaseDenominator, "sourceTimebase.pts.timeBaseDenominator");
    if (BigInt(a) === r) throw Error("sourceTimebase.pts.timeBaseDenominator must be positive");
    return {
      kind: "exact",
      pts: {
        index: await x(n.index),
        metrics: {
          presentedFrameCount: y(i.presentedFrameCount, "sourceTimebase.pts.metrics.presentedFrameCount"),
          decodedFrameCount: y(i.decodedFrameCount, "sourceTimebase.pts.metrics.decodedFrameCount"),
          parserBytes: y(i.parserBytes, "sourceTimebase.pts.metrics.parserBytes"),
          maxBufferBytes: y(i.maxBufferBytes, "sourceTimebase.pts.metrics.maxBufferBytes"),
          ffprobePasses: _(i.ffprobePasses, "sourceTimebase.pts.metrics.ffprobePasses"),
          countOnlyDecodePasses: _(i.countOnlyDecodePasses, "sourceTimebase.pts.metrics.countOnlyDecodePasses")
        },
        timeBaseNumerator: y(n.timeBaseNumerator, "sourceTimebase.pts.timeBaseNumerator"),
        timeBaseDenominator: a,
        mediaTimelineOriginPts: b(n.mediaTimelineOriginPts, "sourceTimebase.pts.mediaTimelineOriginPts")
      }
    }
  }

  function S(e, t) {
    let n = l(e, t);
    if (!["tts_audio", "preview_carrier", "subtitle_manifest", "overlay_manifest", "image_asset"].includes(String(n.kind))) throw Error(`${t}.kind is invalid`);
    let i = {
      kind: n.kind,
      relativePath: p(n.relativePath, `${t}.relativePath`),
      resolvedPath: p(n.resolvedPath, `${t}.resolvedPath`),
      sha256: h(n.sha256, `${t}.sha256`),
      byteCount: y(n.byteCount, `${t}.byteCount`)
    };
    return null != n.durationMs && (i.durationMs = y(n.durationMs, `${t}.durationMs`)), null != n.sampleRateHz && (i.sampleRateHz = _(n.sampleRateHz, `${t}.sampleRateHz`, 1)), null != n.channels && (i.channels = _(n.channels, `${t}.channels`, 1)), i
  }

  function P(e, t) {
    let n = `spans[${t}]`,
      i = l(e, n);
    return {
      spanId: p(i.spanId, `${n}.spanId`),
      semanticSpanId: null == i.semanticSpanId ? null : p(i.semanticSpanId, `${n}.semanticSpanId`),
      sourceStartFrame: y(i.sourceStartFrame, `${n}.sourceStartFrame`),
      sourceEndFrame: y(i.sourceEndFrame, `${n}.sourceEndFrame`),
      sourceStartPts: b(i.sourceStartPts, `${n}.sourceStartPts`),
      sourceEndPts: b(i.sourceEndPts, `${n}.sourceEndPts`),
      outputStartFrame: y(i.outputStartFrame, `${n}.outputStartFrame`),
      outputEndFrame: y(i.outputEndFrame, `${n}.outputEndFrame`),
      videoPlaybackRate: w(i.videoPlaybackRate, `${n}.videoPlaybackRate`)
    }
  }

  function E(e, t) {
    let n = `voiceCues[${t}]`,
      i = l(e, n);
    return {
      voiceCueId: p(i.voiceCueId, `${n}.voiceCueId`),
      semanticSpanId: p(i.semanticSpanId, `${n}.semanticSpanId`),
      canonicalOrdinal: _(i.canonicalOrdinal, `${n}.canonicalOrdinal`),
      rawArtifact: S(i.rawArtifact, `${n}.rawArtifact`),
      effectiveVoiceRate: w(i.effectiveVoiceRate, `${n}.effectiveVoiceRate`),
      rawSampleCount: y(i.rawSampleCount, `${n}.rawSampleCount`),
      playbackSampleCount: y(i.playbackSampleCount, `${n}.playbackSampleCount`),
      outputStartFrame: y(i.outputStartFrame, `${n}.outputStartFrame`),
      outputEndFrame: y(i.outputEndFrame, `${n}.outputEndFrame`)
    }
  }

  function T(e, t) {
    let n = `voiceCues[${t}]`,
      i = l(e, n);
    return {
      ...E(e, t),
      selectedArtifact: S(i.selectedArtifact, `${n}.selectedArtifact`)
    }
  }

  function j(e, t) {
    let n = `voiceCues[${t}]`,
      i = l(e, n);
    if (Object.prototype.hasOwnProperty.call(i, "selectedArtifact")) throw Error(`${n}.selectedArtifact is forbidden for V3`);
    return E(e, t)
  }

  function A(e, t) {
    let n = `captions[${t}]`,
      i = l(e, n);
    return {
      captionId: p(i.captionId, `${n}.captionId`),
      voiceCueId: null == i.voiceCueId ? null : p(i.voiceCueId, `${n}.voiceCueId`),
      sourceStartFrame: y(i.sourceStartFrame, `${n}.sourceStartFrame`),
      sourceEndFrame: y(i.sourceEndFrame, `${n}.sourceEndFrame`),
      outputStartFrame: y(i.outputStartFrame, `${n}.outputStartFrame`),
      outputEndFrame: y(i.outputEndFrame, `${n}.outputEndFrame`),
      translatedText: p(i.translatedText, `${n}.translatedText`)
    }
  }

  function C(e, t) {
    let n = `captions[${t}]`,
      i = l(e, n);
    if (Object.prototype.hasOwnProperty.call(i, "voiceCueId")) throw Error(`${n}.voiceCueId is forbidden for V3`);
    let r = d(i.voiceCueIds, `${n}.voiceCueIds`).map((e, t) => p(e, `${n}.voiceCueIds[${t}]`));
    if (new Set(r).size !== r.length) throw Error(`${n}.voiceCueIds contains duplicates`);
    return {
      captionId: p(i.captionId, `${n}.captionId`),
      semanticSpanId: p(i.semanticSpanId, `${n}.semanticSpanId`),
      voiceCueIds: r,
      sourceStartFrame: y(i.sourceStartFrame, `${n}.sourceStartFrame`),
      sourceEndFrame: y(i.sourceEndFrame, `${n}.sourceEndFrame`),
      outputStartFrame: y(i.outputStartFrame, `${n}.outputStartFrame`),
      outputEndFrame: y(i.outputEndFrame, `${n}.outputEndFrame`),
      translatedText: p(i.translatedText, `${n}.translatedText`)
    }
  }

  function $(e, t) {
    let n = l(e, t),
      i = l(n.endpoint, `${t}.endpoint`),
      a = y(i.timeBaseDenominator, `${t}.endpoint.timeBaseDenominator`);
    if (BigInt(a) === r) throw Error(`${t}.endpoint.timeBaseDenominator must be positive`);
    return {
      endpoint: {
        endpointTicks: y(i.endpointTicks, `${t}.endpoint.endpointTicks`),
        timeBaseNumerator: y(i.timeBaseNumerator, `${t}.endpoint.timeBaseNumerator`),
        timeBaseDenominator: a
      },
      codecName: p(n.codecName, `${t}.codecName`),
      channels: _(n.channels, `${t}.channels`, 1),
      sampleRateHz: _(n.sampleRateHz, `${t}.sampleRateHz`, 1)
    }
  }

  function R(e) {
    return e && "object" == typeof e && !Object.isFrozen(e) && (Object.freeze(e), Object.values(e).forEach(R)), e
  }
  async function V(e) {
    let n, i, r, a = l(e, "graph");
    if ("project-playback-graph-v1" !== a.schemaVersion && "project-edit-graph-v1" !== a.schemaVersion) throw Error("graph schema is invalid");
    let o = _(a.outputSampleRateHz, "outputSampleRateHz", 1),
      s = {
        algorithmVersion: p(a.algorithmVersion, "algorithmVersion"),
        generationId: p(a.generationId, "generationId"),
        timingAuthority: function(e) {
          let t = l(e, "timingAuthority"),
            n = p(t.generationId, "timingAuthority.generationId");
          if (!/^generation:[0-9a-f]{64}$/.test(n)) throw Error("timingAuthority.generationId is invalid");
          return {
            generationId: n,
            planHash: h(t.planHash, "timingAuthority.planHash"),
            timelineStateHash: h(t.timelineStateHash, "timingAuthority.timelineStateHash")
          }
        }(a.timingAuthority),
        graphHash: h(a.graphHash, "graphHash"),
        transportProjectionHash: h(a.transportProjectionHash, "transportProjectionHash"),
        audioScheduleHash: h(a.audioScheduleHash, "audioScheduleHash"),
        visualSnapshotHash: h(a.visualSnapshotHash, "visualSnapshotHash"),
        projectId: p(a.projectId, "projectId"),
        jobId: p(a.jobId, "jobId"),
        sourceIdentity: h(a.sourceIdentity, "sourceIdentity"),
        mode: function(e) {
          let t = l(e, "mode");
          if ("source_timeline" === t.mode) return {
            mode: "source_timeline"
          };
          if ("fixed_voice_speed" === t.mode) {
            let e = _(t.requestedVoiceRateTenths, "mode.requestedVoiceRateTenths", 10);
            if (e > 20) throw Error("mode.requestedVoiceRateTenths is outside the milestone set");
            return {
              mode: "fixed_voice_speed",
              requestedVoiceRateTenths: e
            }
          }
          throw Error("mode is invalid")
        }(a.mode),
        sourceTimebase: await I(a.sourceTimebase),
        outputFrameRate: w(a.outputFrameRate, "outputFrameRate"),
        outputFrames: y(a.outputFrames, "outputFrames"),
        outputSampleRateHz: o,
        outputSamples: y(a.outputSamples, "outputSamples"),
        spans: d(a.spans, "spans").map(P),
        voiceCues: [],
        captions: [],
        projectAudio: function(e) {
          var t;
          let n, i, r, a = l(e, "projectAudio");
          if ("project-audio-track-v1" !== a.schemaVersion) throw Error("projectAudio schema is invalid");
          let o = a.sourceSelection;
          if ("original_mix" !== o && "separated_background" !== o && "separated_vocals" !== o) throw Error("projectAudio source selection is invalid");
          let s = a.dashboardSnapshotMode;
          if (!["keep_low", "keep_full", "separate_background", "muted"].includes(String(s))) throw Error("projectAudio mode is invalid");
          return {
            schemaVersion: "project-audio-track-v1",
            audioGenerationId: p(a.audioGenerationId, "projectAudio.audioGenerationId"),
            sourceSelection: o,
            gainPercent: _(a.gainPercent, "projectAudio.gainPercent"),
            dashboardSnapshotMode: s,
            separationState: {
              ...l(a.separationState, "projectAudio.separationState")
            },
            backgroundArtifactReceipt: null == a.backgroundArtifactReceipt ? null : (t = a.backgroundArtifactReceipt, i = l(t, n = "projectAudio.backgroundArtifactReceipt"), r = l(i.engine, `${n}.engine`), {
              schemaVersion: p(i.schemaVersion, `${n}.schemaVersion`),
              audioGenerationId: p(i.audioGenerationId, `${n}.audioGenerationId`),
              sourcePinFingerprint: g(i.sourcePinFingerprint, `${n}.sourcePinFingerprint`),
              sourceAudioStream: $(i.sourceAudioStream, `${n}.sourceAudioStream`),
              engine: {
                engineId: p(r.engineId, `${n}.engine.engineId`),
                runtimeVersion: h(r.runtimeVersion, `${n}.engine.runtimeVersion`),
                modelName: p(r.modelName, `${n}.engine.modelName`),
                modelSha256: g(r.modelSha256, `${n}.engine.modelSha256`),
                parametersSha256: g(r.parametersSha256, `${n}.engine.parametersSha256`)
              },
              outputContractVersion: p(i.outputContractVersion, `${n}.outputContractVersion`),
              artifactRelPath: p(i.artifactRelPath, `${n}.artifactRelPath`),
              resolvedArtifactPath: p(i.resolvedArtifactPath, `${n}.resolvedArtifactPath`),
              artifactSha256: g(i.artifactSha256, `${n}.artifactSha256`),
              byteCount: y(i.byteCount, `${n}.byteCount`),
              artifactAudioStream: $(i.artifactAudioStream, `${n}.artifactAudioStream`),
              operationId: p(i.operationId, `${n}.operationId`)
            }),
            sourcePinFingerprint: g(a.sourcePinFingerprint, "projectAudio.sourcePinFingerprint"),
            updatedAtMs: y(a.updatedAtMs, "projectAudio.updatedAtMs")
          }
        }(a.projectAudio),
        visuals: (i = function(e) {
          let t = "visuals.subtitleStyle",
            n = l(e, t),
            i = new Set(["capcut_classic", "karaoke_highlight", "black_pill", "creator_keywords", "cinematic_soft", "minimal_clean", "pair_black_white", "pair_white_black", "pair_red_white", "pair_yellow_black", "pair_blue_white"]).has(n.presetId) ? n.presetId : "capcut_classic",
            r = n.position;
          if ("top" !== r && "center" !== r && "bottom" !== r) throw Error(`${t}.position is invalid`);
          let a = n.alignment;
          if ("left" !== a && "center" !== a && "right" !== a) throw Error(`${t}.alignment is invalid`);
          let o = "pill" === n.backgroundStyle ? "pill" : "none",
            s = p(n.fontColor, `${t}.fontColor`);
          return {
            enabled: !0,
            presetId: i,
            fontFamily: p(n.fontFamily, `${t}.fontFamily`),
            fontSize: _(n.fontSize, `${t}.fontSize`, 1),
            fontColor: s,
            backgroundColor: p(n.backgroundColor, `${t}.backgroundColor`),
            backgroundOpacity: f(n.backgroundOpacity, `${t}.backgroundOpacity`),
            backgroundStyle: o,
            accentColor: "string" == typeof n.accentColor && n.accentColor ? n.accentColor : s,
            position: r,
            alignment: a,
            offsetX: null == n.offsetX ? 0 : f(n.offsetX, `${t}.offsetX`),
            offsetY: null == n.offsetY ? 0 : f(n.offsetY, `${t}.offsetY`),
            bold: m(n.bold, `${t}.bold`),
            italic: m(n.italic, `${t}.italic`),
            outline: m(n.outline, `${t}.outline`),
            outlineColor: p(n.outlineColor, `${t}.outlineColor`),
            outlineWidth: _(n.outlineWidth, `${t}.outlineWidth`),
            shadow: m(n.shadow, `${t}.shadow`),
            shadowColor: p(n.shadowColor, `${t}.shadowColor`),
            wordsPerCaption: null == n.wordsPerCaption ? 6 : _(n.wordsPerCaption, `${t}.wordsPerCaption`, 1)
          }
        }((n = l(a.visuals, "visuals")).subtitleStyle), r = function(e) {
          if (null == e) return {
            aspectRatio: t.DEFAULT_CANVAS_COMPOSITION.aspectRatio,
            background: {
              ...t.DEFAULT_CANVAS_COMPOSITION.background
            }
          };
          let n = l(e, "visuals.canvasComposition"),
            i = l(n.background, "visuals.canvasComposition.background"),
            r = n.aspectRatio ?? n.aspect_ratio,
            a = i.mode;
          if (!["source", "16:9", "9:16"].includes(r) || !["none", "solid", "blur"].includes(a) || "source" === r && "none" !== a || "source" !== r && "none" === a) throw Error("visuals.canvasComposition is invalid");
          let o = p(i.color, "visuals.canvasComposition.background.color");
          if (!/^#[0-9a-fA-F]{6}$/.test(o)) throw Error("visuals.canvasComposition color is invalid");
          let s = f(i.blur, "visuals.canvasComposition.background.blur");
          if (s < 1 || s > 64) throw Error("visuals.canvasComposition blur is invalid");
          return {
            aspectRatio: r,
            background: {
              mode: a,
              color: o,
              blur: s
            }
          }
        }(n.canvasComposition), {
          subtitleStyle: i,
          canvasComposition: r,
          sourceRemoval: function(e) {
            if (null == e) return {
              ...t.DEFAULT_SOURCE_REMOVAL
            };
            let n = l(e, "visuals.sourceRemoval"),
              i = {
                enabled: m(n.enabled, "visuals.sourceRemoval.enabled"),
                xPercent: f(n.xPercent ?? n.x_percent, "visuals.sourceRemoval.xPercent"),
                yPercent: f(n.yPercent ?? n.y_percent, "visuals.sourceRemoval.yPercent"),
                widthPercent: f(n.widthPercent ?? n.width_percent, "visuals.sourceRemoval.widthPercent"),
                heightPercent: f(n.heightPercent ?? n.height_percent, "visuals.sourceRemoval.heightPercent"),
                delogoBand: _(n.delogoBand ?? n.delogo_band, "visuals.sourceRemoval.delogoBand", 1),
                softness: f(n.softness, "visuals.sourceRemoval.softness")
              };
            if (i.xPercent < 0 || i.yPercent < 0 || i.widthPercent <= 0 || i.heightPercent <= 0 || i.xPercent + i.widthPercent > 100 || i.yPercent + i.heightPercent > 100 || i.delogoBand > 64 || i.softness < 0 || i.softness > 1) throw Error("visuals.sourceRemoval is invalid");
            return i
          }(n.sourceRemoval),
          exportLayers: d(n.exportLayers, "visuals.exportLayers").map((e, t) => {
            let n = l(e, `visuals.exportLayers[${t}]`);
            return {
              layer: function(e, t) {
                let n = l(e, t),
                  i = {
                    id: p(n.id, `${t}.id`),
                    enabled: m(n.enabled, `${t}.enabled`),
                    xPercent: f(n.xPercent, `${t}.xPercent`),
                    yPercent: f(n.yPercent, `${t}.yPercent`),
                    widthPercent: f(n.widthPercent, `${t}.widthPercent`),
                    heightPercent: f(n.heightPercent, `${t}.heightPercent`),
                    opacity: f(n.opacity, `${t}.opacity`),
                    ...null == n.zIndex ? {} : {
                      zIndex: _(n.zIndex, `${t}.zIndex`)
                    }
                  };
                if ("cover" === n.type) {
                  if ("solid" !== n.effect && "glass" !== n.effect && "mirror" !== n.effect && "remove" !== n.effect) throw Error(`${t}.effect is invalid`);
                  return {
                    ...i,
                    type: "cover",
                    effect: n.effect,
                    color: p(n.color, `${t}.color`)
                  }
                }
                if ("text" === n.type) {
                  if (null != n.motion && "none" !== n.motion && "wander" !== n.motion) throw Error(`${t}.motion is invalid`);
                  return {
                    ...i,
                    type: "text",
                    text: p(n.text, `${t}.text`),
                    color: p(n.color, `${t}.color`),
                    fontSize: _(n.fontSize, `${t}.fontSize`, 1),
                    ...null == n.motion ? {} : {
                      motion: n.motion
                    },
                    ...null == n.fontFamily ? {} : {
                      fontFamily: p(n.fontFamily, `${t}.fontFamily`)
                    },
                    ...null == n.fontWeight ? {} : {
                      fontWeight: _(n.fontWeight, `${t}.fontWeight`, 1)
                    }
                  }
                }
                if ("image" === n.type) return {
                  ...i,
                  type: "image",
                  imagePath: p(n.imagePath, `${t}.imagePath`)
                };
                throw Error(`${t}.type is invalid`)
              }(n.layer, `visuals.exportLayers[${t}].layer`),
              imageArtifact: null == n.imageArtifact ? null : S(n.imageArtifact, `visuals.exportLayers[${t}].imageArtifact`)
            }
          })
        })
      };
    if ("project-playback-graph-v1" === a.schemaVersion) {
      if (!/^playback:[0-9a-f]{64}$/.test(s.generationId)) throw Error("generationId is invalid for V2");
      if (null != a.editRevision || null != a.assetManifestHash || null != a.captionSetHash) throw Error("V2 graph carries V3 edit authority");
      return R({
        ...s,
        schemaVersion: "project-playback-graph-v1",
        voiceCues: d(a.voiceCues, "voiceCues").map(T),
        captions: d(a.captions, "captions").map(A)
      })
    }
    if (!/^edit:[0-9a-f]{64}$/.test(s.generationId)) throw Error("generationId is invalid for V3");
    let c = d(a.voiceCues, "voiceCues").map(j),
      u = new Set(c.map(e => e.voiceCueId)),
      v = d(a.captions, "captions").map(C);
    if (v.some(e => e.voiceCueIds.some(e => !u.has(e)))) throw Error("V3 caption references an unknown voice cue");
    return R({
      ...s,
      schemaVersion: "project-edit-graph-v1",
      editRevision: y(a.editRevision, "editRevision"),
      assetManifestHash: h(a.assetManifestHash, "assetManifestHash"),
      captionSetHash: h(a.captionSetHash, "captionSetHash"),
      voiceCues: c,
      captions: v
    })
  }
  async function M(e, t) {
    let n = [e.terminalGenerationId, e.playbackGenerationId, e.graphHash, e.timingAuthority.generationId, e.timingAuthority.planHash, e.timingAuthority.timelineStateHash, e.authoritySchemaVersion ?? "", e.editRevision ?? "", e.assetManifestHash ?? "", e.captionSetHash ?? "", e.artifactMembershipHash ?? ""].join("\n"),
      i = u.get(n);
    if (i) return i;
    let r = (async () => {
      let n = await V(await t(e));
      if (n.projectId !== e.projectId || n.jobId !== e.jobId || n.generationId !== e.playbackGenerationId || n.timingAuthority.generationId !== e.timingAuthority.generationId || n.timingAuthority.planHash !== e.timingAuthority.planHash || n.timingAuthority.timelineStateHash !== e.timingAuthority.timelineStateHash || n.graphHash !== e.graphHash || n.transportProjectionHash !== e.transportProjectionHash || n.audioScheduleHash !== e.audioScheduleHash || n.visualSnapshotHash !== e.visualSnapshotHash || n.projectAudio.audioGenerationId !== e.audioGenerationId || "project-edit-graph-v1" === n.schemaVersion && ("terminal-readiness-receipt-v3" !== e.authoritySchemaVersion || n.editRevision !== e.editRevision || n.assetManifestHash !== e.assetManifestHash || n.captionSetHash !== e.captionSetHash || null != e.artifactMembershipHash) || "project-playback-graph-v1" === n.schemaVersion && (null != e.authoritySchemaVersion || null != e.editRevision || null != e.assetManifestHash)) throw Error("project playback hydration authority mismatch");
      return n
    })();
    u.set(n, r);
    try {
      return await r
    } catch (e) {
      throw u.delete(n), e
    }
  }

  function F(e, t) {
    let n = BigInt(e) * BigInt(t.denominator) * BigInt(1e3),
      i = BigInt(t.numerator);
    if (i === r) throw Error("output frame-rate denominator is invalid");
    let a = Number((n + i / BigInt(2)) / i);
    if (!Number.isSafeInteger(a)) throw Error("caption presentation time exceeds safe milliseconds");
    return a
  }
  e.s(["hydrateProjectPlaybackGraphOnce", 0, M, "projectPlaybackCaptionsToSubtitles", 0, function(e, t, n) {
    let i = n.every((e, t) => e.index === t),
      r = n.every((e, t) => e.index === t + 1),
      a = new Set,
      o = n.some(t => {
        let n = t.stableCueId?.trim();
        return !!(t.videoId !== e || !t.originalText.trim() || !n || a.has(n)) || (a.add(n), !1)
      });
    if (n.length !== t.captions.length || !i && !r || o) throw Object.assign(Error("project subtitle text authority mismatch"), {
      code: "project_subtitle_text_authority_mismatch"
    });
    let s = new Map(n.map(e => [e.stableCueId, e])),
      c = new Map(t.voiceCues.map(e => [e.voiceCueId, e.canonicalOrdinal]));
    return t.captions.map((i, r) => {
      let a = "project-edit-graph-v1" === t.schemaVersion ? i.voiceCueIds?.[0] : i.voiceCueId,
        o = "project-edit-graph-v1" === t.schemaVersion ? i.captionId : a ?? i.captionId,
        u = s.get(o),
        l = null == a ? r : c.get(a),
        d = null == l ? void 0 : n[l],
        p = "project-edit-graph-v1" === t.schemaVersion ? u : u ?? d;
      if (!p) throw Object.assign(Error("project subtitle text authority mismatch"), {
        code: "project_subtitle_text_authority_mismatch"
      });
      return {
        id: i.captionId,
        videoId: e,
        index: r,
        startTime: F(i.outputStartFrame, t.outputFrameRate),
        endTime: F(i.outputEndFrame, t.outputFrameRate),
        originalText: p.originalText,
        translatedText: i.translatedText,
        stableCueId: o,
        confidence: 1,
        style: t.visuals.subtitleStyle
      }
    })
  }, "projectPlaybackDurationMs", 0, function(e) {
    let t = Number(e.outputFrames),
      n = Number(e.outputFrameRate.numerator),
      i = t * Number(e.outputFrameRate.denominator) * 1e3 / n;
    if (!Number.isFinite(i) || i < 0) throw Error("project playback duration cannot be represented for Preview");
    return i
  }, "validateProjectPlaybackGraph", 0, V])
}, 53065, 21455, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(88717),
    i = e.i(81341);
  async function r(e) {
    e.cancelVisualDraft();
    try {
      await e.awaitSubmittedVisual()
    } catch {}
    e.fenceAndDispose(), e.navigate()
  }
  e.s(["createProjectTimingModeCoordinator", 0, function(e) {
    let t = 0,
      n = !1,
      i = !1,
      r = [],
      a = () => {
        n || i || (n = !0, queueMicrotask(() => {
          n = !1, o()
        }))
      },
      o = async () => {
        if (i || 0 === r.length) return;
        i = !0;
        let t = r.splice(0),
          n = t.at(-1);
        t.slice(0, -1).forEach(e => e.resolve({
          status: "superseded"
        }));
        try {
          await e.resolveVisual(), e.stop();
          let t = await e.createDraft(n.intent),
            i = await e.validateDraft(t),
            r = await e.promote(i),
            a = await e.hydrate(r);
          await e.commit(a, r), e.reload(), e.seekZero();
          let o = await e.autoplay();
          n.resolve({
            status: o ? "playing" : "ready_paused"
          })
        } catch (t) {
          e.notice(t), n.reject(t)
        } finally {
          i = !1, a()
        }
      };
    return {
      change(n) {
        try {
          var i;
          if ("source_timeline" !== n.mode && ("fixed_voice_speed" !== n.mode || !("number" == typeof(i = n.requestedVoiceRateTenths) && Number.isInteger(i) && i >= 10 && i <= 20))) throw Error("project_timing_mode_invalid");
          if (e.hasActiveExport()) throw Error("project_export_active")
        } catch (e) {
          return Promise.reject(e)
        }
        let o = ++t,
          s = new Promise((e, t) => {
            r.push({
              revision: o,
              intent: n,
              resolve: e,
              reject: t
            })
          });
        return a(), s
      }
    }
  }, "leaveEditorProject", 0, r], 21455);
  let a = (BigInt(1) << BigInt(64)) - BigInt(1),
    o = /^sha256:[0-9a-f]{64}$/,
    s = /^(?:playback|edit):[0-9a-f]{64}$/,
    c = new Map,
    u = new Map,
    l = new Map,
    d = new Map;
  async function p(e) {
    await u.get(e)
  }

  function _(e) {
    let t = l.get(e);
    l.delete(e), t?.()
  }
  async function f(e) {
    _(e), await p(e)
  }
  async function m(e, t) {
    if (l.has(e)) throw Object.assign(Error("Finish or cancel the overlay edit before exporting."), {
      code: "project_visual_draft_active"
    });
    await p(e);
    let n = t();
    if (!n) throw Object.assign(Error("Project export authority is unavailable."), {
      code: "terminal_project_export_authority_missing"
    });
    return n
  }
  async function h(e, t) {
    await r({
      cancelVisualDraft: () => _(e),
      awaitSubmittedVisual: () => p(e),
      fenceAndDispose: () => {
        let t = d.get(e);
        t?.stop(), t?.dispose(), d.delete(e)
      },
      navigate: t
    })
  }

  function g(e) {
    if ("string" != typeof e || !/^(0|[1-9][0-9]*)$/.test(e)) return !1;
    let t = BigInt(e);
    return t > BigInt(0) && t <= a
  }
  async function v(r) {
    if (!(0, i.isTauri)()) throw Error("project_visual_mutation_desktop_required");
    if (!(r && "string" == typeof r.projectId && r.projectId && "string" == typeof r.jobId && r.jobId && s.test(r.expectedGenerationId) && o.test(r.expectedGraphHash) && /^terminal:[0-9a-f]{64}$/.test(r.expectedTerminalGenerationId) && "string" == typeof r.operationId && r.operationId && "string" == typeof r.gestureId && r.gestureId && g(r.customerMutationRevision) && r.patch && "object" == typeof r.patch)) throw Error("project visual mutation request is invalid");
    let a = r.patch;
    if ("replace_canvas_composition" === r.patch.kind) {
      let {
        encodeNleCanvasComposition: t
      } = await e.A(17263);
      a = {
        kind: r.patch.kind,
        canvasComposition: t(r.patch.canvasComposition)
      }
    } else if ("replace_source_removal" === r.patch.kind) {
      let {
        encodeNleSourceRemoval: t
      } = await e.A(17263);
      a = {
        kind: r.patch.kind,
        sourceRemoval: t(r.patch.sourceRemoval)
      }
    }
    let c = await (0, t.invoke)("mutate_engine_vnext_project_visual", {
      request: {
        ...r,
        patch: a
      }
    });
    return {
      ...c,
      graph: await (0, n.validateProjectPlaybackGraph)(c.graph),
      receipt: b(c.receipt)
    }
  }
  async function y(e) {
    if (!(0, i.isTauri)()) throw Error("project_timing_mutation_desktop_required");
    if (!e || !e.projectId || !e.jobId || !/^terminal:[0-9a-f]{64}$/.test(e.expectedTerminalGenerationId) || !s.test(e.expectedAuthority?.generationId ?? "") || !o.test(e.expectedAuthority?.graphHash ?? "") || !o.test(e.expectedAuthority?.transportProjectionHash ?? "") || !o.test(e.expectedAuthority?.audioScheduleHash ?? "") || !o.test(e.expectedAuthority?.visualSnapshotHash ?? "") || !g(e.customerMutationRevision) || "fixed_voice_speed" === e.mode.mode && ![10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].includes(e.mode.requestedVoiceRateTenths)) throw Error("project timing mutation request is invalid");
    let r = await (0, t.invoke)("mutate_engine_vnext_project_playback", {
        request: {
          projectId: e.projectId,
          jobId: e.jobId,
          expectedTerminalGenerationId: e.expectedTerminalGenerationId,
          expectedAuthority: e.expectedAuthority,
          clientRevision: e.customerMutationRevision,
          mode: e.mode
        }
      }),
      a = b(r.receipt);
    if (r.clientRevision !== e.customerMutationRevision || a.projectId !== e.projectId || a.jobId !== e.jobId || !a.timingAuthority || !/^generation:[0-9a-f]{64}$/.test(a.timingAuthority.generationId) || !/^sha256:[0-9a-f]{64}$/.test(a.timingAuthority.planHash) || !/^sha256:[0-9a-f]{64}$/.test(a.timingAuthority.timelineStateHash)) throw Object.assign(Error("project timing promotion authority mismatch"), {
      code: "project_playback_authority_mismatch"
    });
    let c = await (0, n.validateProjectPlaybackGraph)(await (0, t.invoke)("hydrate_engine_vnext_project_playback_graph", {
      request: {
        projectId: a.projectId,
        jobId: a.jobId,
        terminalGenerationId: a.terminalGenerationId,
        terminalSnapshotHash: a.terminalSnapshotHash,
        timingAuthority: a.timingAuthority,
        playbackGenerationId: a.playbackGenerationId,
        graphHash: a.graphHash,
        transportProjectionHash: a.transportProjectionHash,
        audioScheduleHash: a.audioScheduleHash,
        visualSnapshotHash: a.visualSnapshotHash,
        audioGenerationId: a.audioGenerationId,
        authoritySchemaVersion: a.authoritySchemaVersion,
        editRevision: a.editRevision,
        assetManifestHash: a.assetManifestHash,
        captionSetHash: a.captionSetHash,
        artifactMembershipHash: a.artifactMembershipHash
      }
    }));
    if (c.generationId !== a.playbackGenerationId || c.graphHash !== a.graphHash) throw Object.assign(Error("hydrated timing graph authority mismatch"), {
      code: "project_playback_authority_mismatch"
    });
    return {
      receipt: a,
      mode: r.mode,
      outputDurationMs: r.outputDurationMs,
      customerMutationRevision: r.clientRevision,
      graph: c
    }
  }

  function b(e) {
    if (!e || "object" != typeof e) throw Object.assign(Error("project mutation receipt is invalid"), {
      code: "project_playback_authority_mismatch"
    });
    let t = e.timingAuthority;
    if (!("string" == typeof e.projectId && "string" == typeof e.jobId && /^terminal:[0-9a-f]{64}$/.test(String(e.terminalGenerationId ?? "")) && o.test(String(e.terminalSnapshotHash ?? "")) && o.test(String(e.graphHash ?? "")) && o.test(String(e.transportProjectionHash ?? "")) && o.test(String(e.audioScheduleHash ?? "")) && o.test(String(e.visualSnapshotHash ?? "")) && o.test(String(e.captionSetHash ?? "")) && "string" == typeof e.audioGenerationId && t && /^generation:[0-9a-f]{64}$/.test(t.generationId) && o.test(t.planHash) && o.test(t.timelineStateHash))) throw Object.assign(Error("project mutation receipt authority is invalid"), {
      code: "project_playback_authority_mismatch"
    });
    let n = {
      schemaVersion: "string" == typeof e.schemaVersion ? e.schemaVersion : void 0,
      projectId: e.projectId,
      jobId: e.jobId,
      sourceIdentity: String(e.sourceIdentity ?? ""),
      settingsGeneration: String(e.settingsGeneration ?? ""),
      terminalGenerationId: e.terminalGenerationId,
      terminalSnapshotHash: e.terminalSnapshotHash,
      graphHash: e.graphHash,
      transportProjectionHash: e.transportProjectionHash,
      audioScheduleHash: e.audioScheduleHash,
      visualSnapshotHash: e.visualSnapshotHash,
      audioGenerationId: e.audioGenerationId,
      captionSetHash: e.captionSetHash,
      timingAuthority: t
    };
    if ("terminal-readiness-receipt-v3" === e.schemaVersion) {
      let t = String(e.editRevision ?? "");
      if (!g(t) || !/^edit:[0-9a-f]{64}$/.test(String(e.editGenerationId ?? "")) || !o.test(String(e.assetManifestHash ?? "")) || null != e.artifactMembershipHash) throw Object.assign(Error("Terminal V3 mutation receipt is invalid"), {
        code: "project_playback_authority_mismatch"
      });
      return {
        ...n,
        playbackGenerationId: e.editGenerationId,
        authoritySchemaVersion: "terminal-readiness-receipt-v3",
        editRevision: t,
        assetManifestHash: e.assetManifestHash,
        artifactMembershipHash: null
      }
    }
    if (!/^playback:[0-9a-f]{64}$/.test(String(e.playbackGenerationId ?? "")) || !o.test(String(e.artifactMembershipHash ?? ""))) throw Object.assign(Error("Terminal V2 mutation receipt is invalid"), {
      code: "project_playback_authority_mismatch"
    });
    return {
      ...n,
      playbackGenerationId: e.playbackGenerationId,
      artifactMembershipHash: e.artifactMembershipHash,
      authoritySchemaVersion: null,
      editRevision: null,
      assetManifestHash: null
    }
  }
  e.s(["awaitProjectVisualMutation", 0, p, "getProjectPreviewRuntimeOwner", 0, function(e) {
    return d.get(e) ?? null
  }, "leaveEditorWithProjectAuthority", 0, h, "nextProjectAuthorityRevision", 0, function(e) {
    let t = BigInt(Date.now()) * BigInt(1e3),
      n = c.get(e) ?? BigInt(0),
      i = t > n ? t : n + BigInt(1);
    if (i > a) throw Error("project authority revision exhausted");
    return c.set(e, i), i.toString()
  }, "normalizeProjectMutationReceipt", 0, b, "prepareProjectExportAdmission", 0, m, "promoteProjectTimingMutation", 0, y, "promoteProjectVisualMutation", 0, v, "registerProjectPreviewRuntime", 0, function(e, t) {
    return d.set(e, t), () => {
      d.get(e) === t && d.delete(e)
    }
  }, "registerProjectVisualDraft", 0, function(e, t) {
    return l.set(e, t), () => {
      l.get(e) === t && l.delete(e)
    }
  }, "resolveProjectVisualBeforeTimingMutation", 0, f, "trackProjectVisualMutation", 0, function(e, t) {
    let n = (u.get(e) ?? Promise.resolve()).catch(() => void 0).then(t);
    return u.set(e, n), n.finally(() => {
      u.get(e) === n && u.delete(e)
    }).catch(() => void 0), n
  }], 53065)
}, 7787, 46982, 53752, 26978, 27814, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(81341);
  e.i(53065);
  var i = e.i(88717);
  async function r() {
    return (0, t.invoke)("get_local_engine_status")
  }
  async function a(e) {
    return (0, n.isTauri)() ? (0, t.invoke)("verify_desktop_api_capabilities", {
      signedConfigBundle: e
    }) : {
      schema_version: "v1",
      revision: 0,
      expires_at: null,
      features: []
    }
  }
  async function o() {
    return (0, t.invoke)("get_local_engine_quick_status")
  }
  async function s() {
    return (0, t.invoke)("get_local_engine_performance_profile")
  }
  async function c() {
    return (0, t.invoke)("get_local_engine_installed_manifests")
  }
  async function u() {
    return (0, n.isTauri)() ? (0, t.invoke)("get_engine_registry_status") : {
      preferredFamily: "dichvideo-engine-vnext",
      installedFamilies: [{
        family: "dichvideo-engine-vnext",
        version: null,
        healthy: !1,
        path: null,
        packageSha256: null,
        packageSizeBytes: null,
        installedBytes: null,
        trustStatus: "absent",
        capabilities: []
      }],
      fallbackFamily: null
    }
  }
  async function l(e = {}) {
    return (0, n.isTauri)() ? (0, t.invoke)("run_legacy_runtime_cleanup_migration", {
      request: e
    }) : {
      migrationId: "legacy-runtime-cleanup-v1-dichvideo-engine",
      ran: !1,
      blockedReason: "desktop_required",
      removedPaths: [],
      skippedPaths: [],
      errors: [],
      reclaimedBytes: 0,
      activeVnextVersion: null
    }
  }
  async function d(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("transcribe_with_engine_vnext", {
      request: e
    })
  }
  async function p(e) {
    return (0, n.isTauri)() ? (0, t.invoke)("cancel_engine_vnext_transcription", {
      runId: e
    }) : {
      runId: e,
      canceled: !1,
      markerPath: null
    }
  }
  async function _(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("download_and_install_engine_vnext_package", {
      request: e
    })
  }
  async function f(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("get_engine_vnext_install_plan", {
      request: e
    })
  }
  async function m(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("uninstall_engine_vnext_package", {
      version: e
    })
  }
  async function h(e) {
    return (0, n.isTauri)() ? (0, t.invoke)("get_engine_vnext_addon_status", {
      addonId: e
    }) : {
      addonId: e,
      installed: !1,
      trusted: !1,
      version: null,
      path: null,
      packageSha256: null,
      capabilities: [],
      errorCode: "desktop_required",
      source: null
    }
  }
  async function g(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("get_engine_vnext_addon_install_plan", {
      request: e
    })
  }
  async function v(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("download_and_install_engine_vnext_addon", {
      request: e
    })
  }
  async function y(e) {
    if (!(0, n.isTauri)()) throw Error("engine_vnext_desktop_only");
    return (0, t.invoke)("uninstall_engine_vnext_addon", {
      addonId: e
    })
  }
  async function b(e) {
    return (0, n.isTauri)() ? (0, t.invoke)("select_engine_vnext_stt_route", {
      request: e
    }) : {
      useVnext: !1,
      route: "legacy.soni_whisperx",
      language: e.sourceLanguage || "auto",
      reason: "desktop_required",
      fallbackAllowed: !0,
      fallbackRoute: "legacy.soni_whisperx"
    }
  }
  async function w(e, n = "windows-x64", i = "stable") {
    return (0, t.invoke)("get_local_engine_install_plan", {
      apiUrl: e,
      platform: n,
      channel: i
    })
  }
  async function k(e, n = "windows-x64", i = "stable", r) {
    return (0, t.invoke)("fetch_local_engine_manifest", {
      apiUrl: e,
      platform: n,
      channel: i,
      variant: r ?? null
    })
  }
  async function x(e) {
    return (0, t.invoke)("install_local_engine", {
      request: e
    })
  }
  async function I() {
    return (0, t.invoke)("start_local_engine")
  }
  async function S() {
    return (0, t.invoke)("stop_local_engine")
  }
  async function P(e) {
    return (0, t.invoke)("configure_local_engine_backend_root", {
      path: e
    })
  }
  async function E(e) {
    return (0, t.invoke)("configure_local_engine_python_path", {
      path: e
    })
  }
  async function T(e) {
    return (0, t.invoke)("create_local_engine_job", {
      request: e
    })
  }
  async function j(e) {
    return (0, t.invoke)("get_local_engine_job", {
      jobId: e
    })
  }
  async function A(i, r = {}) {
    if (!(0, n.isTauri)()) throw Error("native_media_preflight_desktop_required");
    if (!r.onMediaProgress || !i.progressOperationId) return (0, t.invoke)("preflight_engine_vnext_media", {
      request: i
    });
    let {
      listen: a
    } = await e.A(23982), o = await a("native-media-progress-v2", e => {
      e.payload.operationId === i.progressOperationId && r.onMediaProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("preflight_engine_vnext_media", {
        request: i
      })
    } finally {
      o()
    }
  }
  async function C(e) {
    if (!(0, n.isTauri)()) throw Error("native_source_pin_bind_desktop_required");
    return (0, t.invoke)("bind_engine_vnext_source_pin", {
      request: e
    })
  }
  async function $(e) {
    if (!(0, n.isTauri)()) throw Error("native_cue_export_cache_desktop_required");
    return (0, t.invoke)("begin_engine_vnext_cue_export_cache_session", {
      request: e
    })
  }
  async function R(e) {
    if (!(0, n.isTauri)()) throw Error("native_cue_export_cache_desktop_required");
    return (0, t.invoke)("release_engine_vnext_cue_export_cache_session", {
      sessionId: e
    })
  }
  async function V(e) {
    if (!(0, n.isTauri)()) throw Error("native_subtitle_cache_desktop_required");
    return (0, t.invoke)("lookup_engine_vnext_subtitle_export_cache", {
      request: e
    })
  }
  async function M(e) {
    if (!(0, n.isTauri)()) throw Error("native_subtitle_cache_desktop_required");
    return (0, t.invoke)("put_engine_vnext_subtitle_export_cache_object", {
      request: e
    })
  }
  async function F(e) {
    if (!(0, n.isTauri)()) throw Error("native_subtitle_cache_desktop_required");
    return (0, t.invoke)("put_engine_vnext_subtitle_export_cache_manifest", {
      request: e
    })
  }
  async function H(e) {
    if (!(0, n.isTauri)()) throw Error("native_project_audio_requires_desktop");
    return O(await (0, t.invoke)("inspect_engine_vnext_project_audio_track", {
      request: e
    }))
  }
  async function D(e) {
    if (!(0, n.isTauri)()) throw Error("native_project_audio_requires_desktop");
    return O(await (0, t.invoke)("set_engine_vnext_project_audio_gain", {
      request: e
    }))
  }
  async function B(i, r = {}) {
    if (!(0, n.isTauri)()) throw Error("native_project_audio_requires_desktop");
    if (!r.onProgress) return O(await (0, t.invoke)("separate_engine_vnext_project_audio", {
      request: i
    }));
    let {
      listen: a
    } = await e.A(23982), o = await a("native-media-progress-v2", e => {
      e.payload.operationId === i.operationId && r.onProgress?.(e.payload)
    });
    try {
      let e = await (0, t.invoke)("separate_engine_vnext_project_audio", {
        request: i
      });
      return O(e)
    } finally {
      o()
    }
  }
  async function L(e) {
    if (!(0, n.isTauri)()) throw Error("native_project_audio_requires_desktop");
    return O(await (0, t.invoke)("restore_engine_vnext_project_audio", {
      request: e
    }))
  }

  function O(e) {
    let t = G(e),
      n = N(t?.projectId),
      i = N(t?.jobId),
      r = N(t?.previewCarrierPath),
      a = N(t?.timelineGeneration),
      o = N(t?.terminalGenerationId),
      s = N(t?.terminalSnapshotHash),
      c = N(t?.playbackGenerationId),
      u = N(t?.graphHash),
      l = N(t?.transportProjectionHash),
      d = N(t?.audioScheduleHash),
      p = N(t?.visualSnapshotHash),
      _ = N(t?.audioGenerationId),
      f = N(t?.captionSetHash),
      m = N(t?.artifactMembershipHash),
      h = G(t?.timingAuthority),
      g = N(h?.generationId),
      v = N(h?.planHash),
      y = N(h?.timelineStateHash);
    if (!t || !n || !i || !r || !a || !o || !s || !c || a !== c || !u || !l || !d || !p || !_ || !f || !m || !g || !v || !y || !t.exportState) throw Error("project_audio_response_invalid");
    return {
      projectId: n,
      jobId: i,
      state: q(t.state),
      timelineGeneration: a,
      terminalGenerationId: o,
      terminalSnapshotHash: s,
      timingAuthority: {
        generationId: g,
        planHash: v,
        timelineStateHash: y
      },
      playbackGenerationId: c,
      graphHash: u,
      transportProjectionHash: l,
      audioScheduleHash: d,
      visualSnapshotHash: p,
      audioGenerationId: _,
      captionSetHash: f,
      artifactMembershipHash: m,
      previewCarrierPath: r,
      exportState: t.exportState
    }
  }

  function q(e) {
    let t = G(e),
      n = N(t?.schemaVersion),
      i = N(t?.audioGenerationId),
      r = t?.sourceSelection,
      a = t?.dashboardSnapshotMode,
      o = t?.gainPercent,
      s = t?.updatedAtMs;
    if (!t || "project-audio-track-v1" !== n || !i || "original_mix" !== r && "separated_background" !== r || !["keep_low", "keep_full", "separate_background", "muted"].includes(String(a)) || "number" != typeof o || !Number.isInteger(o) || o < 0 || o > 100 || "number" != typeof s || !Number.isSafeInteger(s) || s <= 0) throw Error("project_audio_response_invalid");
    return {
      schemaVersion: n,
      audioGenerationId: i,
      sourceSelection: r,
      gainPercent: o,
      dashboardSnapshotMode: a,
      separationState: function(e) {
        let t = G(e);
        switch (t?.state) {
          case "not_requested":
          case "requested":
          case "ready":
          case "canceled":
          case "regeneration_required":
            return {
              state: t.state
            };
          case "running":
            return {
              state: "running"
            };
          case "failed": {
            let e = N(t.code);
            if (e) return {
              state: "failed",
              code: e
            }
          }
        }
        throw Error("project_audio_response_invalid")
      }(t.separationState),
      backgroundArtifactReceipt: function(e) {
        if (null == e) return null;
        let t = G(e),
          n = G(t?.engine),
          i = N(t?.schemaVersion),
          r = N(n?.engineId),
          a = N(n?.runtimeVersion),
          o = N(t?.outputContractVersion);
        if (!i || !r || !a || !o) throw Error("project_audio_response_invalid");
        return {
          schemaVersion: i,
          engineId: r,
          runtimeVersion: a,
          outputContractVersion: o
        }
      }(t.backgroundArtifactReceipt),
      updatedAtMs: s
    }
  }

  function G(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : null
  }

  function N(e) {
    return "string" == typeof e && e.trim().length > 0 ? e.trim() : null
  }
  async function z(i, r = {}) {
    if (!(0, n.isTauri)()) throw Error("native_cue_preview_desktop_required");
    if (!r.onProgress) return (0, t.invoke)("export_engine_vnext_cue_preview_plan", {
      request: i
    });
    let {
      listen: a
    } = await e.A(23982), o = await a("native-media-progress-v2", e => {
      e.payload.operationId === i.cancelRunId && r.onProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("export_engine_vnext_cue_preview_plan", {
        request: i
      })
    } finally {
      o()
    }
  }
  async function U(e) {
    if (!(0, n.isTauri)()) throw Error("native_direct_export_desktop_required");
    return (0, t.invoke)("preflight_engine_vnext_direct_export", {
      request: e
    })
  }
  async function W(i, r = {}) {
    if (!(0, n.isTauri)()) throw Error("native_direct_export_desktop_required");
    if (!r.onProgress) return (0, t.invoke)("export_engine_vnext_direct", {
      request: i
    });
    let {
      listen: a
    } = await e.A(23982), o = await a("native-media-progress-v2", e => {
      e.payload.operationId === i.cancelRunId && r.onProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("export_engine_vnext_direct", {
        request: i
      })
    } finally {
      o()
    }
  }
  async function K(e) {
    if (!(0, n.isTauri)()) throw Error("native_final_delivery_desktop_required");
    return (0, t.invoke)("inspect_engine_vnext_cue_preview_delivery", {
      request: e
    })
  }
  async function X(i, r = {}) {
    if (!(0, n.isTauri)()) throw Error("native_final_delivery_desktop_required");
    if (!r.onProgress) return (0, t.invoke)("retry_engine_vnext_cue_preview_delivery", {
      request: i
    });
    let {
      listen: a
    } = await e.A(23982), o = await a("native-media-progress-v2", e => {
      e.payload.operationId === i.operationId && r.onProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("retry_engine_vnext_cue_preview_delivery", {
        request: i
      })
    } finally {
      o()
    }
  }
  async function J(e) {
    if (!(0, n.isTauri)()) throw Error("native_cue_preview_desktop_required");
    return (0, t.invoke)("preflight_engine_vnext_cue_preview_export", {
      request: e
    })
  }
  async function Z(e) {
    if (!(0, n.isTauri)()) throw Error("native_cue_preview_desktop_required");
    return (0, t.invoke)("audit_engine_vnext_cue_preview_cleanup", {
      request: e
    })
  }
  async function Y(e) {
    if (!(0, n.isTauri)()) throw Error("native_media_recovery_desktop_required");
    return (0, t.invoke)("recover_engine_vnext_media_artifacts", {
      request: e
    })
  }
  async function Q(e) {
    if (!(0, n.isTauri)()) throw Error("terminal_project_desktop_required");
    return (0, t.invoke)("inspect_engine_vnext_terminal_project", {
      request: e
    })
  }
  async function ee(e) {
    if (!(0, n.isTauri)()) throw Error("project_playback_hydration_desktop_required");
    return (0, i.hydrateProjectPlaybackGraphOnce)(e, e => (0, t.invoke)("hydrate_engine_vnext_project_playback_graph", {
      request: e
    }))
  }
  async function et(n, i = {}) {
    if (!i.onProgress && !i.onMediaProgress) return (0, t.invoke)("run_engine_vnext_native_job", {
      request: n
    });
    let {
      listen: r
    } = await e.A(23982), a = [];
    try {
      return i.onProgress && a.push(await r("engine-vnext-native-progress", e => {
        e.payload.jobId === n.authorization.jobId && i.onProgress?.(e.payload)
      })), i.onMediaProgress && a.push(await r("native-media-progress-v2", e => {
        e.payload.operationId === (n.progressOperationId ?? n.authorization.jobId) && i.onMediaProgress?.(e.payload)
      })), await (0, t.invoke)("run_engine_vnext_native_job", {
        request: n
      })
    } finally {
      for (let e of a) e()
    }
  }
  async function en(i) {
    if (!(0, n.isTauri)()) throw Error("nle_document_mutation_desktop_required");
    if (!i.projectId || !Number.isSafeInteger(i.expectedRevision) || i.expectedRevision <= 0 || !i.mutation) throw Error("nle_document_mutation_request_invalid");
    let r = i.mutation;
    if ("update_visuals" === i.mutation.kind) {
      let {
        encodeNleVisualMutation: t
      } = await e.A(17263), {
        sourceWidth: n,
        sourceHeight: a,
        canvasComposition: o,
        sourceRemoval: s,
        overlays: c,
        subtitleStyle: u,
        ...l
      } = i.mutation, {
        canvasOutputSize: d
      } = await e.A(9154), p = d(n, a, o.aspectRatio);
      r = {
        ...l,
        ...t(c, u, p, o, s)
      }
    }
    let a = await (0, t.invoke)("mutate_engine_vnext_nle_document", {
        request: {
          ...i,
          mutation: r
        }
      }),
      {
        decodeNleDocument: o,
        decodeNlePreviewProjection: s
      } = await e.A(34619),
      c = o(a.document);
    if (c.revision !== i.expectedRevision + 1) throw Object.assign(Error("NLE document mutation revision mismatch"), {
      code: "nle_document_mutation_response_invalid"
    });
    return {
      ...c,
      previewProjection: s(a.previewProjection, c.revision)
    }
  }

  function ei(e, t) {
    return `nle-background:${e}:${t}`
  }
  async function er(i, r = {}) {
    if (!(0, n.isTauri)()) throw Error("nle_background_separation_desktop_required");
    if ("string" != typeof i?.projectId || 0 === i.projectId.trim().length || !Number.isSafeInteger(i.expectedRevision) || i.expectedRevision <= 0) throw es("nle_background_request_invalid", "NLE background separation request is invalid");
    let a = ei(i.projectId, i.expectedRevision),
      {
        listen: o
      } = await e.A(23982),
      s = await o("native-media-progress-v2", e => {
        e.payload.operationId === a && r.onProgress?.(e.payload)
      });
    try {
      let e = await (0, t.invoke)("separate_engine_vnext_nle_background", {
        request: i
      });
      return await ea(e, i.expectedRevision)
    } finally {
      s()
    }
  }
  async function ea(t, n) {
    let i;
    if (!t || "object" != typeof t || Array.isArray(t) || "string" != typeof t.previewCarrierPath || 0 === t.previewCarrierPath.trim().length || "boolean" != typeof t.reusedArtifact) throw eo();
    try {
      let {
        decodeNleDocument: n
      } = await e.A(34619);
      i = n(t.document)
    } catch {
      throw eo()
    }
    if (i.revision !== n && i.revision !== n + 1) throw eo();
    let {
      decodeNlePreviewProjection: r
    } = await e.A(34619);
    return {
      document: {
        ...i,
        previewProjection: r(t.previewProjection, i.revision)
      },
      previewProjection: r(t.previewProjection, i.revision),
      previewCarrierPath: t.previewCarrierPath.trim(),
      reusedArtifact: t.reusedArtifact
    }
  }

  function eo() {
    return es("nle_background_response_invalid", "NLE background separation response is invalid")
  }

  function es(e, t) {
    return Object.assign(Error(t), {
      code: e
    })
  }
  async function ec(e = {
    jobObservations: []
  }) {
    if (!(0, n.isTauri)()) throw Error("processing_reconciliation_desktop_required");
    return (0, t.invoke)("reconcile_engine_vnext_processing_projects", {
      request: e
    })
  }
  async function eu(e) {
    return (0, t.invoke)("cancel_engine_vnext_native_job", {
      runId: e
    })
  }
  async function el(n, i = {}) {
    if (!i.onProgress) return (0, t.invoke)("regenerate_engine_vnext_native_tts", {
      request: n
    });
    let {
      listen: r
    } = await e.A(23982), a = await r("engine-vnext-native-progress", e => {
      e.payload.jobId === n.runId && i.onProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("regenerate_engine_vnext_native_tts", {
        request: n
      })
    } finally {
      a()
    }
  }
  async function ed(e) {
    return (0, t.invoke)("analyze_srt_audio", {
      input: e
    })
  }
  async function ep(n, i = {}) {
    if (!i.onProgress) return (0, t.invoke)("synthesize_srt_audio", {
      request: n
    });
    let {
      listen: r
    } = await e.A(23982), a = await r("srt-audio-progress", e => {
      e.payload.runId === n.runId && i.onProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("synthesize_srt_audio", {
        request: n
      })
    } finally {
      a()
    }
  }
  async function e_(e) {
    return (0, t.invoke)("open_srt_audio_output_folder", {
      path: e
    })
  }
  async function ef(e) {
    return (0, t.invoke)("create_gpu_subtitle_job", {
      request: e
    })
  }
  async function em(e) {
    return (0, t.invoke)("get_gpu_subtitle_job", {
      request: e
    })
  }
  async function eh(e) {
    return (0, t.invoke)("download_gpu_subtitle_result", {
      request: e
    })
  }
  async function eg() {
    return (0, t.invoke)("get_runtime_packages")
  }
  async function ev(e) {
    return (0, t.invoke)("install_runtime_package", {
      packageId: e
    })
  }
  e.s(["analyzeSrtAudio", 0, ed, "auditEngineVnextCuePreviewCleanup", 0, Z, "beginEngineVnextCueExportCacheSession", 0, $, "bindEngineVnextSourcePin", 0, C, "cancelEngineVnextNativeJob", 0, eu, "cancelEngineVnextTranscription", 0, p, "configureLocalEngineBackendRoot", 0, P, "configureLocalEnginePythonPath", 0, E, "createGpuSubtitleJob", 0, ef, "createLocalEngineJob", 0, T, "downloadAndInstallEngineVnextAddon", 0, v, "downloadAndInstallEngineVnextPackage", 0, _, "downloadGpuSubtitleResult", 0, eh, "exportEngineVnextCuePreviewPlan", 0, z, "exportEngineVnextDirect", 0, W, "fetchLocalEngineManifest", 0, k, "getEngineRegistryStatus", 0, u, "getEngineVnextAddonInstallPlan", 0, g, "getEngineVnextAddonStatus", 0, h, "getEngineVnextInstallPlan", 0, f, "getGpuSubtitleJob", 0, em, "getLocalEngineInstallPlan", 0, w, "getLocalEngineInstalledManifests", 0, c, "getLocalEngineJob", 0, j, "getLocalEnginePerformanceProfile", 0, s, "getLocalEngineQuickStatus", 0, o, "getLocalEngineStatus", 0, r, "getRuntimePackages", 0, eg, "hydrateEngineVnextProjectPlaybackGraph", 0, ee, "inspectEngineVnextCuePreviewDelivery", 0, K, "inspectEngineVnextProjectAudioTrack", 0, H, "inspectEngineVnextTerminalProject", 0, Q, "installLocalEngine", 0, x, "installRuntimePackage", 0, ev, "lookupEngineVnextSubtitleExportCache", 0, V, "mutateEngineVnextNleDocument", 0, en, "nleBackgroundOperationId", 0, ei, "openSrtAudioOutputFolder", 0, e_, "preflightEngineVnextCuePreviewExport", 0, J, "preflightEngineVnextDirectExport", 0, U, "preflightEngineVnextMedia", 0, A, "putEngineVnextSubtitleExportCacheManifest", 0, F, "putEngineVnextSubtitleExportCacheObject", 0, M, "reconcileEngineVnextProcessingProjects", 0, ec, "recoverEngineVnextMediaArtifacts", 0, Y, "regenerateEngineVnextNativeTts", 0, el, "releaseEngineVnextCueExportCacheSession", 0, R, "restoreEngineVnextProjectAudio", 0, L, "retryEngineVnextCuePreviewDelivery", 0, X, "runEngineVnextNativeJob", 0, et, "runLegacyRuntimeCleanupMigration", 0, l, "sanitizeProjectAudioTrackStateProjection", 0, q, "selectEngineVnextSttRoute", 0, b, "separateEngineVnextNleBackground", 0, er, "separateEngineVnextProjectAudio", 0, B, "setEngineVnextProjectAudioGain", 0, D, "startLocalEngine", 0, I, "stopLocalEngine", 0, S, "synthesizeSrtAudio", 0, ep, "transcribeWithEngineVnext", 0, d, "uninstallEngineVnextAddon", 0, y, "uninstallEngineVnextPackage", 0, m, "verifySignedServerConfigCapabilities", 0, a], 7787);
  let ey = "Arial, 'Segoe UI', sans-serif";

  function eb(e, t, n) {
    return Math.min(n, Math.max(t, e))
  }

  function ew(e) {
    return "cover" === e ? 10 : 30
  }

  function ek(e) {
    let t = Math.round(e.zIndex ?? ew(e.type)),
      n = Number.isFinite(t) ? eb(t, 0, 100) : ew(e.type);
    return "cover" === e.type && "mirror" === e.effect ? Math.min(n, 19) : n
  }

  function ex(e) {
    return e.map((e, t) => ({
      layer: e,
      index: t,
      zIndex: ek(e)
    })).sort((e, t) => e.zIndex - t.zIndex || e.index - t.index).map(({
      layer: e
    }) => e)
  }

  function eI(e) {
    return [...e].sort((e, t) => e.startTime - t.startTime || e.index - t.index)
  }
  async function eS(e) {
    let n = await (0, t.invoke)("import_video", {
      path: e
    });
    return {
      id: n.id,
      name: n.name,
      path: n.path,
      size: n.size,
      duration: n.duration,
      width: n.width,
      height: n.height,
      fps: n.fps,
      codec: n.video_codec,
      audioCodec: n.audio_codec ?? void 0,
      sourceAudioStreamCount: Number.isSafeInteger(n.audio_stream_count) && n.audio_stream_count >= 0 ? n.audio_stream_count : void 0,
      thumbnail: n.thumbnail ?? void 0,
      audioTrackId: n.audio_tracks[0] ? String(n.audio_tracks[0].index) : void 0,
      status: "idle",
      addedAt: new Date
    }
  }
  e.s(["EXPORT_SUBTITLE_LAYER_Z_INDEX", 0, 20, "EXPORT_TEXT_DEFAULT_FONT_FAMILY", 0, ey, "EXPORT_TEXT_DEFAULT_FONT_WEIGHT", 0, 700, "getDefaultExportLayerZIndex", 0, ew, "getExportGlassBlurPixels", 0, function() {
    return 12
  }, "getExportLayerRenderZIndex", 0, ek, "getExportLayerTextPreviewStyle", 0, function(e, t, n = 1) {
    let i = Math.max(0, t),
      r = Number.isFinite(n) && n >= 0 ? n : 1,
      a = eb(e.opacity, 0, 1),
      o = eb(.35 * a, 0, 1),
      s = eb(.55 * a, 0, 1),
      c = Math.max(10, i * (e.fontSize / 720) * r);
    return {
      color: e.color,
      opacity: a,
      fontFamily: e.fontFamily ?? ey,
      fontWeight: e.fontWeight ?? 700,
      fontSize: `${c}px`,
      textShadow: `2px 2px 2px rgba(0, 0, 0, ${s})`,
      WebkitTextStroke: `1px rgba(0, 0, 0, ${o})`,
      paintOrder: "stroke fill"
    }
  }, "getPreviewDisplayScale", 0, function(e, t) {
    let n = Math.max(0, e.width),
      i = Math.max(0, t?.width ?? e.width);
    return n ? i ? n / i : 1 : 0
  }, "sortExportLayersForRender", 0, ex], 46982);
  let eP = new Map;
  async function eE(e, n = {}) {
    let i = e.trim().replaceAll("/", "\\").toLocaleLowerCase("en-US"),
      r = eP.get(i);
    if (r) return r;
    let a = n.force ?? !1,
      o = (0, t.invoke)("ensure_preview_video", {
        path: e,
        force: a
      });
    eP.set(i, o);
    try {
      return await o
    } finally {
      eP.get(i) === o && eP.delete(i)
    }
  }
  async function eT(e, n, i) {
    return (0, t.invoke)("generate_thumbnail", {
      videoPath: e,
      outputPath: n,
      timeOffset: i
    })
  }
  async function ej(e, n, i) {
    return (0, t.invoke)("extract_audio", {
      videoPath: e,
      outputPath: n,
      audioTrackIndex: i ?? null
    })
  }
  async function eA(e) {
    return (0, t.invoke)("get_audio_duration", {
      path: e
    })
  }
  async function eC(e) {
    return (0, t.invoke)("build_translation_character_context", {
      request: e
    })
  }
  async function e$(e, n, i, r = "libre_translate", a = {}) {
    let o = await (0, t.invoke)("translate_text", {
      request: {
        texts: e,
        source_lang: n,
        target_lang: i,
        engine: r,
        model: a.model ?? null,
        base_url: a.baseUrl ?? null,
        api_key: a.apiKey ?? null,
        context_segments: a.contextSegments ?? null,
        global_context: a.globalContext ?? null,
        translation_style_id: a.translationStyle?.styleId ?? null,
        translation_style_prompt: a.translationStyle?.prompt ?? null,
        user_glossary: a.userGlossary ?? [],
        character_context: a.characterContext ?? null,
        segment_indexes: a.segmentIndexes ?? null,
        batch_index: a.batchIndex ?? null,
        batch_count: a.batchCount ?? null
      }
    });
    return a.includeCharacterMetadata ? {
      translatedTexts: o.translated_texts,
      characterMentions: o.character_mentions ?? null
    } : o.translated_texts
  }
  async function eR(e, n, i, r, a, o = 1, s = 1, c = 1, u = {}) {
    return (0, t.invoke)("batch_generate_tts", {
      entries: eI(e).map(e => ({
        id: e.id,
        index: e.index,
        start_time: e.startTime,
        end_time: e.endTime,
        original_text: e.originalText,
        translated_text: e.translatedText,
        speaker: e.speaker ?? null,
        confidence: e.confidence
      })),
      voice: n,
      engine: i,
      language: r,
      outputDir: a,
      speed: o,
      pitch: s,
      volume: c,
      apiKey: u.apiKey ?? null,
      baseUrl: u.baseUrl ?? null,
      provider: u.provider ?? null,
      modelId: u.modelId ?? null
    })
  }

  function eV(e) {
    return {
      id: e.id,
      type: e.type,
      enabled: e.enabled,
      x_percent: e.xPercent,
      y_percent: e.yPercent,
      width_percent: e.widthPercent,
      height_percent: e.heightPercent,
      opacity: e.opacity,
      z_index: ek(e),
      effect: "cover" === e.type ? e.effect : null,
      motion: "text" === e.type ? e.motion ?? "none" : null,
      color: "cover" === e.type || "text" === e.type ? e.color : null,
      text: "text" === e.type ? e.text : null,
      font_size: "text" === e.type ? e.fontSize : null,
      font_family: "text" === e.type ? e.fontFamily ?? ey : null,
      font_weight: "text" === e.type ? e.fontWeight ?? 700 : null,
      image_path: "image" === e.type ? e.imagePath : null
    }
  }
  async function eM(n, i, r) {
    let a = {
      operationId: r.operationId,
      config: {
        project_id: i.projectId ?? null,
        video_path: n,
        bitrate_reference_video_path: i.bitrateReferenceVideoPath ?? null,
        subtitle_path: i.subtitlePath ?? null,
        tts_audio_path: i.ttsAudioPath ?? null,
        output_path: i.outputPath + "/" + i.filename + "." + i.outputFormat,
        video_codec: i.videoCodec,
        video_quality: i.videoQuality,
        resolution: i.resolution,
        audio_mode: i.audioMode,
        mix_ratio: i.mixRatio,
        source_audio_override_path: i.sourceAudioOverridePath ?? null,
        original_audio_volume: i.originalAudioVolume ?? null,
        translated_audio_volume: i.translatedAudioVolume ?? null,
        audio_content_profile: i.audioContentProfile ?? null,
        subtitle_mode: i.subtitleMode,
        subtitle_format: i.subtitleFormat,
        burn_subtitles: i.burnSubtitles,
        subtitle_overlay_manifest_path: i.subtitleOverlayManifestPath ?? null,
        output_format: i.outputFormat,
        export_layers: ex(i.exportLayers ?? []).map(eV),
        system_watermark: i.systemWatermark ? {
          enabled: i.systemWatermark.enabled,
          text: i.systemWatermark.text,
          seed: i.systemWatermark.seed
        } : null,
        watermark_policy_signature: i.watermarkPolicySignature ?? null
      }
    };
    if (!r.onProgress) return (0, t.invoke)("export_video", a);
    let {
      listen: o
    } = await e.A(23982), s = await o("native-media-progress-v2", e => {
      e.payload.operationId === r.operationId && r.onProgress?.(e.payload)
    });
    try {
      return await (0, t.invoke)("export_video", a)
    } finally {
      s()
    }
  }

  function eF(e, t) {
    if (!e) return null;
    let n = function(e) {
      if (!e) return null;
      let t = Math.round(e.width),
        n = Math.round(e.height);
      return !Number.isFinite(t) || !Number.isFinite(n) || t <= 0 || n <= 0 ? null : {
        width: t,
        height: n
      }
    }(t);
    return {
      preset_id: e.presetId,
      font_family: e.fontFamily,
      font_size: e.fontSize,
      font_color: e.fontColor,
      background_color: e.backgroundColor,
      background_opacity: e.backgroundOpacity,
      position: e.position,
      alignment: e.alignment,
      max_width_percent: e.maxWidthPercent ?? 90,
      offset_x: e.offsetX ?? 0,
      offset_y: e.offsetY ?? 0,
      bold: e.bold,
      italic: e.italic,
      outline: e.outline,
      outline_color: e.outlineColor,
      outline_width: e.outlineWidth,
      shadow: e.shadow,
      shadow_color: e.shadowColor,
      background_style: e.backgroundStyle,
      accent_color: e.accentColor,
      words_per_caption: e.wordsPerCaption,
      render_width: n?.width ?? null,
      render_height: n?.height ?? null
    }
  }
  async function eH(e, n) {
    return (0, t.invoke)("verify_exported_media", {
      outputPath: e,
      requireAudio: n
    })
  }
  async function eD(e, n, i, r, a) {
    return (0, t.invoke)("export_subtitles", {
      entries: eI(e).map(e => ({
        id: e.id,
        index: e.index,
        start_time: e.startTime,
        end_time: e.endTime,
        original_text: e.originalText,
        translated_text: e.translatedText,
        speaker: e.speaker ?? null,
        confidence: e.confidence
      })),
      format: n,
      outputPath: i,
      style: eF(r, a)
    })
  }
  async function eB(e, n, i, r = 0, a = []) {
    return (0, t.invoke)("render_subtitle_preview_frame", {
      entries: eI(e).map(e => ({
        id: e.id,
        index: e.index,
        start_time: e.startTime,
        end_time: e.endTime,
        original_text: e.originalText,
        translated_text: e.translatedText,
        speaker: e.speaker ?? null,
        confidence: e.confidence
      })),
      style: eF(n, i),
      timeMs: r,
      layouts: a
    })
  }
  async function eL(e, n, i) {
    return (0, t.invoke)("compose_tts_audio", {
      entries: e.map(e => ({
        id: e.id,
        index: e.index,
        start_time: e.startTime,
        end_time: e.endTime,
        original_text: e.originalText,
        translated_text: e.translatedText,
        speaker: e.speaker ?? null,
        confidence: e.confidence
      })),
      clipPaths: n,
      outputPath: i
    })
  }

  function eO() {
    if (!(0, n.isTauri)()) throw Error("piper_native_desktop_required")
  }
  async function eq(n, i = {}) {
    if (eO(), !i.onProgress) return (0, t.invoke)("prepare_piper_native_components", {
      request: n
    });
    let {
      listen: r
    } = await e.A(23982), a = await r("piper-component-progress", e => i.onProgress?.(e.payload));
    try {
      return await (0, t.invoke)("prepare_piper_native_components", {
        request: n
      })
    } finally {
      a()
    }
  }
  async function eG(e) {
    eO(), await (0, t.invoke)("cancel_engine_vnext_native_job", {
      runId: e
    })
  }
  e.s(["batchGenerateTts", 0, eR, "buildTranslationCharacterContext", 0, eC, "composeTtsAudio", 0, eL, "ensurePreviewVideo", 0, eE, "exportSubtitles", 0, eD, "exportVideo", 0, eM, "extractAudio", 0, ej, "generateThumbnail", 0, eT, "getAudioDuration", 0, eA, "importVideo", 0, eS, "renderSubtitlePreviewFrame", 0, eB, "translateText", 0, e$, "verifyExportedMedia", 0, eH], 53752), e.s(["cancelPiperNativePreparation", 0, eG, "getPiperNativeComponentStatus", 0, function() {
    return eO(), (0, t.invoke)("get_piper_native_component_status")
  }, "preparePiperNativeComponents", 0, eq, "repairPiperNativeComponent", 0, function(e) {
    return eO(), (0, t.invoke)("repair_piper_native_component", {
      componentId: e
    })
  }], 26978);
  let eN = /\b(auth[_-]?token|job[_-]?token|api[_-]?key|apikey|password|secret)\s*[:=]\s*("[^"]+"|'[^']+'|[^\s,;]+)/gi,
    ez = /\bBearer\s+[A-Za-z0-9._-]{20,}/gi,
    eU = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    eW = /[A-Za-z]:[\\/][^\s"']+/g,
    eK = /-filter_complex\s+([^\n\r]+)/g;

  function eX(e) {
    return String.fromCharCode(...e)
  }
  e.s(["sanitizeAppLogMessage", 0, function(e) {
    return e.replace(ez, "Bearer <redacted>").replace(eU, "<jwt-redacted>").replace(eN, (e, t) => `${t}=<redacted>`).replace(eW, "<path>").replace(eK, "-filter_complex <redacted>").replaceAll("vnext.sherpa_sensevoice_2024_int8", "vnext.stt_primary").replaceAll("vnext.sherpa_multilingual", "vnext.stt_general").replaceAll("legacy.soni_whisperx", "legacy.local").replaceAll("sensevoice-2024-int8", "model.primary").replaceAll("sherpa-multilingual-selected", "model.general").replaceAll("silero-vad-selected", "model.activity").replaceAll("sherpa-onnx-vad-with-offline-asr", "media-segmenter").replaceAll("sherpa-onnx", "media-core").replaceAll(eX([115, 101, 114, 118, 101, 114, 95, 57, 114, 111, 117, 116, 101, 114]), "server.route_primary").replaceAll(eX([99, 108, 105, 112, 114, 111, 120, 121]), "server.route_secondary")
  }], 27814)
}, 35771, e => {
  "use strict";
  e.s(["APP_STARTUP_UPDATE_CHECK_TIMEOUT_MS", 0, 5e3, "APP_UPDATE_DEFAULT_CHECK_TIMEOUT_MS", 0, 3e4])
}, 30797, 62281, 79569, 45638, 3007, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(27814),
    i = e.i(35771),
    r = e.i(81341);
  let a = null;
  async function o() {
    return (0, t.invoke)("get_app_version")
  }
  async function s(t = {}) {
    let n = t.timeoutMs ?? i.APP_UPDATE_DEFAULT_CHECK_TIMEOUT_MS,
      c = (0, r.isTauri)() ? await o() : "0.1.0";
    if (!(0, r.isTauri)()) return a = null, {
      available: !1,
      currentVersion: c,
      latestVersion: c,
      date: null,
      body: null,
      appEnv: "development"
    };
    let l = await u();
    if ("production" !== l) return a = null, {
      available: !1,
      currentVersion: c,
      latestVersion: c,
      date: null,
      body: null,
      appEnv: l
    };
    let {
      check: d
    } = await e.A(43583), p = await d({
      timeout: n
    });
    return a = p, {
      available: !!p,
      currentVersion: p?.currentVersion ?? c,
      latestVersion: p?.version ?? c,
      date: p?.date ?? null,
      body: p?.body ?? null,
      appEnv: l
    }
  }
  async function c(t) {
    if (!(0, r.isTauri)()) throw Error("app_update_desktop_only");
    let {
      check: n
    } = await e.A(43583), i = a ?? await n({
      timeout: 3e4
    });
    if (!i) throw Error("app_update_not_available");
    let o = 0,
      s = null;
    await i.downloadAndInstall(e => {
      if ("Started" === e.event) {
        o = 0, s = e.data.contentLength ?? null, t?.({
          stage: "started",
          bytesDownloaded: o,
          bytesTotal: s,
          percent: 0
        });
        return
      }
      if ("Progress" === e.event) {
        o += e.data.chunkLength, t?.({
          stage: "downloading",
          bytesDownloaded: o,
          bytesTotal: s,
          percent: s ? Math.min(o / s * 100, 99) : 0
        });
        return
      }
      t?.({
        stage: "finished",
        bytesDownloaded: o,
        bytesTotal: s,
        percent: 100
      })
    }), a = null;
    let {
      relaunch: c
    } = await e.A(29690);
    await c()
  }
  async function u() {
    return (0, t.invoke)("get_app_env")
  }
  async function l(e, i) {
    let a = (0, n.sanitizeAppLogMessage)(i);
    (0, r.isTauri)() ? await (0, t.invoke)("append_app_log", {
      level: e,
      message: a
    }) : console["error" === e ? "error" : "warn" === e ? "warn" : "log"](a)
  }
  async function d() {
    return (0, t.invoke)("get_viral_voice_capcut_status")
  }
  async function p(e) {
    return (0, t.invoke)("login_viral_voice_capcut", {
      request: e
    })
  }
  async function _(e) {
    return (0, t.invoke)("import_viral_voice_capcut_cookies", {
      request: e
    })
  }
  async function f() {
    return (0, t.invoke)("delete_viral_voice_capcut_session")
  }
  async function m(e) {
    return (0, t.invoke)("generate_viral_voice_preview", {
      request: e
    })
  }

  function h(e) {
    return JSON.stringify([e.captionId, e.sourceStartMs, e.sourceEndMs, e.originalText, e.translatedText])
  }

  function g(e) {
    let t = (e.translatedText || e.originalText || "").replace(/\s+/g, " ").trim(),
      n = e.sourceStartMs;
    return {
      captionId: e.captionId,
      nativeInputHash: "browser-literal-fallback",
      sourceStartMs: n,
      sourceEndMs: Math.max(e.sourceEndMs, n),
      chunks: t ? [{
        text: t,
        placedStartMs: n,
        placedEndMs: Math.max(e.sourceEndMs, n + 1)
      }] : []
    }
  }
  async function v(e) {
    return (0, r.isTauri)() ? (0, t.invoke)("plan_display_caption_projection", {
      request: {
        captions: e
      }
    }) : {
      schemaVersion: "display-caption-projection-v1",
      captions: e.map(g)
    }
  }
  e.s(["appendAppLog", 0, l, "checkAppUpdate", 0, s, "getAppEnv", 0, u, "getAppVersion", 0, o, "installAppUpdate", 0, c], 30797), e.s(["deleteViralVoiceCapCutSession", 0, f, "generateViralVoicePreview", 0, m, "getViralVoiceCapCutStatus", 0, d, "importViralVoiceCapCutCookies", 0, _, "loginViralVoiceCapCut", 0, p], 62281);
  let y = new Map;

  function b(e) {
    return new Map(e.flatMap(e => {
      let t = y.get(h(e));
      return t ? [
        [e.captionId, t]
      ] : []
    }))
  }
  async function w(e) {
    let t = e.filter(e => !y.has(h(e)));
    if (t.length > 0) {
      let e = await v(t),
        n = new Map(t.map(e => [e.captionId, e]));
      for (let t of e.captions) {
        let e = n.get(t.captionId);
        e && y.set(h(e), t)
      }
    }
    return b(e)
  }
  async function k(e) {
    return (0, t.invoke)("prepare_subtitle_geometry_measurement", {
      input: e
    })
  }
  async function x(e, n, i) {
    return (0, t.invoke)("finalize_subtitle_geometry_layout", {
      request: {
        input: e,
        requestId: n,
        measurements: i
      }
    })
  }
  async function I() {
    return (0, r.isTauri)() ? (0, t.invoke)("vieneu_turbo_runtime_status") : {
      ready: !1,
      downloadable: !1,
      version: null,
      sizeBytes: 0,
      error: "Chỉ dùng trong app desktop."
    }
  }
  async function S() {
    if (!(0, r.isTauri)()) throw Error("Chỉ dùng trong app desktop.");
    await (0, t.invoke)("install_vieneu_turbo_runtime")
  }
  async function P() {
    (0, r.isTauri)() && await (0, t.invoke)("cancel_vieneu_turbo_runtime_install")
  }
  async function E(t) {
    if (!(0, r.isTauri)()) return () => {};
    let {
      listen: n
    } = await e.A(23982);
    return n("vieneu-turbo-runtime-progress", e => t({
      ...e.payload,
      percent: Math.round(e.payload.bytesDownloaded / Math.max(1, e.payload.bytesTotal) * 100)
    }))
  }
  async function T() {
    return (0, r.isTauri)() ? (0, t.invoke)("list_vieneu_embedded_voices") : {
      enabled: !1,
      revision: "unavailable",
      voices: []
    }
  }
  async function j(e, n = "vieneu_native", i = "vi") {
    if (!(0, r.isTauri)()) throw Error("tauri_environment_required");
    return (0, t.invoke)("preview_tts_voice", {
      voice: e,
      engine: n,
      language: i
    })
  }
  async function A() {
    if ((0, r.isTauri)()) return (0, t.invoke)("cancel_preview_tts_voice")
  }
  e.s(["displayCaptionInputFromSubtitle", 0, function(e) {
    return {
      captionId: e.id,
      sourceStartMs: e.startTime,
      sourceEndMs: e.endTime,
      originalText: e.originalText,
      translatedText: e.translatedText
    }
  }, "displayCaptionProjectionInputKey", 0, h, "readCachedDisplayCaptionProjections", 0, b, "resolveDisplayCaptionProjections", 0, w], 79569), e.s(["canUseNativeSubtitleGeometry", 0, function() {
    return (0, r.isTauri)()
  }, "finalizeSubtitleGeometryLayout", 0, x, "prepareSubtitleGeometryMeasurement", 0, k], 45638), e.s(["cancelPreviewTtsVoice", 0, A, "cancelVieNeuRuntimeInstall", 0, P, "getVieNeuRuntimeStatus", 0, I, "installVieNeuRuntime", 0, S, "listVieNeuEmbeddedVoices", 0, T, "listenVieNeuRuntimeProgress", 0, E, "previewTtsVoice", 0, j], 3007)
}, 3134, e => {
  "use strict";
  var t = e.i(86682),
    n = e.i(81341);

  function i() {
    if (!(0, n.isTauri)()) throw Error("Chỉ dùng trong ứng dụng desktop.")
  }
  async function r() {
    return (0, n.isTauri)() ? (0, t.invoke)("vieneu_turbo_runtime_status") : {
      ready: !1,
      downloadable: !1,
      localInstallable: !1,
      version: null,
      sizeBytes: 0,
      installedSizeBytes: 0,
      error: "Chỉ dùng trong ứng dụng desktop."
    }
  }
  async function a(e) {
    return i(), (0, t.invoke)("install_vieneu_turbo_runtime", {
      localArchive: e ?? null
    })
  }
  async function o() {
    (0, n.isTauri)() && await (0, t.invoke)("cancel_vieneu_turbo_runtime_install")
  }
  async function s() {
    (0, n.isTauri)() && await (0, t.invoke)("cancel_vieneu_turbo_operation")
  }
  async function c() {
    return i(), (await (0, t.invoke)("list_vieneu_turbo_voices")).voices
  }
  async function u(e, n, r = !0) {
    return i(), (0, t.invoke)("enroll_vieneu_turbo_voice", {
      name: e,
      referenceAudio: n,
      denoise: r
    })
  }
  async function l(e) {
    i(), await (0, t.invoke)("delete_vieneu_turbo_voice", {
      voiceId: e
    })
  }
  e.s(["cancelTurboInstall", 0, o, "cancelTurboOperation", 0, s, "deleteTurboVoice", 0, l, "enrollTurboVoice", 0, u, "installTurboRuntime", 0, a, "listTurboVoices", 0, c, "turboRuntimeStatus", 0, r])
}, 89268, 24614, 57623, 96725, e => {
  "use strict";
  var t = e.i(81341);
  e.i(41824), e.i(63126), e.i(3570), e.i(7787), e.i(53752), e.i(26978), e.i(30797), e.i(62281), e.i(79569), e.i(45638), e.i(3007), e.i(3134);
  var n = e.i(86682);

  function i() {
    if (!(0, t.isTauri)()) throw Error("Chỉ dùng trong ứng dụng desktop.")
  }
  async function r(e) {
    return i(), (0, n.invoke)("ttssieure_key_set", {
      key: e
    })
  }
  async function a() {
    return i(), (0, n.invoke)("ttssieure_key_status")
  }
  async function o() {
    return i(), (0, n.invoke)("ttssieure_key_clear")
  }
  async function s(e) {
    return i(), (0, n.invoke)("ttssieure_catalog_refresh", {
      provider: e
    })
  }
  async function c(e) {
    return i(), (0, n.invoke)("ttssieure_catalog_get", {
      provider: e
    })
  }
  async function u(e) {
    return i(), (0, n.invoke)("ttssieure_voices_list", {
      provider: e.provider,
      language: e.language ?? null
    })
  }
  async function l(e) {
    return i(), (0, n.invoke)("ttssieure_voice_preview", {
      request: e
    })
  }
  async function d(e) {
    return i(), (0, n.invoke)("ttssieure_generate_start", {
      request: e
    })
  }
  async function p(e) {
    return i(), (0, n.invoke)("ttssieure_generate_cancel", {
      batchId: e
    })
  }
  async function _(e) {
    return i(), (0, n.invoke)("ttssieure_generate_status", {
      batchId: e.batchId ?? null,
      projectId: e.projectId ?? null
    })
  }
  async function f(e) {
    return i(), (0, n.invoke)("ttssieure_reconcile", {
      projectId: e
    })
  }

  function m() {
    if (!(0, t.isTauri)()) throw Error("Chỉ dùng trong ứng dụng desktop.")
  }
  async function h(e, t) {
    return m(), (0, n.invoke)("audio_clip_import", {
      projectId: e,
      srcPath: t
    })
  }
  async function g(e, t, i) {
    return m(), (0, n.invoke)("audio_clip_update", {
      projectId: e,
      clipId: t,
      patch: i
    })
  }
  async function v(e, t) {
    return m(), (0, n.invoke)("audio_clip_remove", {
      projectId: e,
      clipId: t
    })
  }

  function y() {
    if (!(0, t.isTauri)()) throw Error("Chỉ dùng trong ứng dụng desktop.")
  }
  async function b(e, t) {
    return y(), (0, n.invoke)("srt_import_preview", {
      projectId: e,
      srtPath: t
    })
  }
  async function w(e, t, i) {
    return y(), (0, n.invoke)("srt_import_apply", {
      projectId: e,
      srtPath: t,
      previewToken: i.previewToken,
      expectedRevision: i.expectedRevision
    })
  }
  async function k(e) {
    return y(), (0, n.invoke)("srt_import_restore", {
      projectId: e
    })
  }
  e.s(["ttssieureCatalogGet", 0, c, "ttssieureCatalogRefresh", 0, s, "ttssieureGenerateCancel", 0, p, "ttssieureGenerateStart", 0, d, "ttssieureGenerateStatus", 0, _, "ttssieureKeyClear", 0, o, "ttssieureKeySet", 0, r, "ttssieureKeyStatus", 0, a, "ttssieureReconcile", 0, f, "ttssieureVoicePreview", 0, l, "ttssieureVoicesList", 0, u], 24614), e.s(["audioClipImport", 0, h, "audioClipRemove", 0, v, "audioClipUpdate", 0, g], 57623), e.s(["srtImportApply", 0, w, "srtImportPreview", 0, b, "srtImportRestore", 0, k], 96725), e.s([], 89268)
}]);