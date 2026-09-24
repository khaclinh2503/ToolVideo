(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 8594, e => {
  "use strict";
  let t = (0, e.i(68834).create)()(e => ({
    prepared: null,
    active: null,
    prepare: t => e({
      prepared: t
    }),
    activatePrepared: (t, i) => {
      let n = !1;
      return e(e => e.prepared?.projectId !== t || e.prepared.generationId !== i ? e : (n = !0, {
        active: e.prepared
      })), n
    },
    promoteVisual: (t, i, n, a) => {
      let r = !1;
      return e(e => e.active?.projectId !== t || e.active.generationId !== i || e.active.graphHash !== n || a.projectId !== t || a.transportProjectionHash !== e.active.transportProjectionHash || a.audioScheduleHash !== e.active.audioScheduleHash ? e : (r = !0, {
        active: a,
        prepared: e.prepared?.projectId === t ? a : e.prepared
      })), r
    },
    promoteTiming: (t, i, n, a) => {
      let r = !1;
      return e(e => e.active?.projectId !== t || e.active.generationId !== i || e.active.graphHash !== n || a.projectId !== t ? e : (r = !0, {
        active: a,
        prepared: e.prepared?.projectId === t ? a : e.prepared
      })), r
    },
    clear: t => e(e => t ? {
      prepared: e.prepared?.projectId === t ? null : e.prepared,
      active: e.active?.projectId === t ? null : e.active
    } : {
      prepared: null,
      active: null
    })
  }));
  e.s(["useTerminalProjectStore", 0, t])
}, 6285, e => {
  "use strict";
  var t = e.i(68834);
  e.i(89268);
  var i = e.i(63126),
    n = e.i(7787),
    a = e.i(81341);
  let r = e => {
      let t = e instanceof Error ? e.message : "string" == typeof e ? e : "";
      return t ? t.includes("download_failed") || t.includes("Tải thất bại") ? `Kh\xf4ng tải được th\xe0nh phần cần thiết. Chi tiết: ${t}` : t.includes("Lỗi zip") ? `G\xf3i tải về kh\xf4ng hợp lệ hoặc bị gi\xe1n đoạn. Chi tiết: ${t}` : `Kh\xf4ng c\xe0i được th\xe0nh phần cần thiết. Chi tiết: ${t}` : "Không tải/cài được thành phần cần thiết."
    },
    o = (0, t.create)((t, o) => ({
      status: null,
      managedPaths: null,
      packages: [],
      isLoading: !1,
      isLoaded: !1,
      isSetupOpen: !1,
      installing: null,
      error: null,
      loadStatus: async () => {
        o().isLoaded || o().isLoading || await o().refreshStatus()
      },
      refreshStatus: async () => {
        if (t({
            isLoading: !0,
            error: null
          }), !(0, a.isTauri)()) return void t({
          isLoading: !1,
          isLoaded: !0,
          isSetupOpen: !1,
          managedPaths: null,
          error: null,
          status: {
            os: "web",
            arch: "browser",
            managed_paths: {
              root: "N/A",
              bin: "N/A",
              models: "N/A",
              cache: "N/A",
              projects: "N/A",
              temp: "N/A",
              output: "N/A"
            },
            dependencies: [],
            setup_complete: !0,
            missing_required: []
          }
        });
        try {
          await (0, i.ensureDirectories)();
          let [e, a, r] = await Promise.all([(0, i.getManagedPaths)(), (0, i.getDependencyStatus)(), (0, n.getRuntimePackages)().catch(() => [])]);
          t({
            managedPaths: e,
            status: a,
            packages: r,
            isLoading: !1,
            isLoaded: !0,
            isSetupOpen: !a.setup_complete,
            error: null
          })
        } catch (e) {
          console.error("Failed to load dependency status:", e), t({
            isLoading: !1,
            isLoaded: !0,
            isSetupOpen: !1,
            error: r(e)
          })
        }
      },
      setSetupOpen: e => t({
        isSetupOpen: e
      }),
      installPackage: async i => {
        t({
          error: null,
          installing: {
            packageId: i,
            stage: "downloading",
            percent: 0,
            message: "Đang chuẩn bị..."
          }
        });
        let a = null;
        try {
          let {
            listen: r
          } = await e.A(23982);
          a = await r("install-progress", e => {
            let i = e.payload;
            i.package_id === o().installing?.packageId && t({
              installing: {
                packageId: i.package_id,
                stage: i.stage,
                percent: i.percent,
                message: i.message
              }
            })
          }), await (0, n.installRuntimePackage)(i), await o().refreshStatus()
        } catch (e) {
          throw console.error("Install failed:", e), t({
            error: r(e)
          }), e
        } finally {
          a?.(), t({
            installing: null
          })
        }
      }
    }));
  e.s(["useDependencyStore", 0, o])
}, 65055, e => {
  "use strict";
  e.s(["QUEUE_ITEM_STATUS_LABELS", 0, {
    waiting: "Đang chờ",
    paused: "Đã tạm dừng",
    preflight: "Chuẩn bị",
    processing: "Đang xử lý",
    retrying: "Thử lại",
    settlement_pending: "Đang hoàn tất trạng thái",
    interrupted: "Đã gián đoạn",
    failed: "Có lỗi",
    done: "Hoàn thành",
    skipped: "Bỏ qua"
  }, "isQueueItemActive", 0, function(e) {
    return "preflight" === e || "processing" === e || "retrying" === e
  }, "isRecoverableQueueError", 0, function(e) {
    let t = e instanceof Error ? e.message : String(e),
      i = e && "object" == typeof e && "string" == typeof Reflect.get(e, "code") ? String(Reflect.get(e, "code")) : "",
      n = `${i} ${t}`.toLowerCase();
    return n.includes("worker") || n.includes("engine_exited") || n.includes("connection") || n.includes("request_timeout") || n.includes("server_unreachable") || n.includes("timeout") || n.includes("timed out") || n.includes("network") || n.includes("fetch failed")
  }, "queueItemStatusVariant", 0, function(e) {
    return "failed" === e || "interrupted" === e ? "destructive" : "done" === e ? "success" : "paused" === e ? "secondary" : "retrying" === e || "preflight" === e || "processing" === e || "settlement_pending" === e ? "warning" : "secondary"
  }])
}, 41152, e => {
  "use strict";
  let t = "Cần cài đặt DichVideo Engine trong Cài đặt > DichVideo Engine trước khi xử lý video.",
    i = ["engine_settings_required", "native_vnext_runtime_unavailable", "native_vnext_runtime_not_trusted", "engine_not_installed", "runtime_not_trusted", "vnext_runtime_missing", "vnext_runtime_untrusted", "vnext_sealed_runtime_invalid"];

  function n(e) {
    let t = e.toLowerCase();
    return i.some(e => t.includes(e))
  }
  e.s(["ENGINE_REPAIR_REQUIRED_MESSAGE", 0, "DichVideo Engine bị hỏng. Hãy cài lại Engine trong Cài đặt > DichVideo Engine rồi tiếp tục xử lý.", "ENGINE_SETTINGS_REQUIRED_MESSAGE", 0, t, "createEngineSettingsRequiredError", 0, function(e) {
    return Object.assign(Error(t), {
      code: "engine_settings_required",
      customerMessage: t,
      developerMessage: e ?? "DichVideo Engine is not ready for processing.",
      engineSettingsRequired: !0,
      fallbackAllowed: !1
    })
  }, "isEngineRepairRequiredError", 0, function(e) {
    return ("string" == typeof e ? e : e && "object" == typeof e ? ["code", "error_code", "message", "developerMessage", "developer_message"].map(t => e[t]).filter(e => "string" == typeof e).join(" ") : "").toLowerCase().includes("vnext_sealed_runtime_invalid")
  }, "isEngineSettingsRequiredError", 0, function(e) {
    if (!e) return !1;
    if ("string" == typeof e) return n(e);
    if ("object" == typeof e) {
      if (!0 === e.engineSettingsRequired) return !0;
      for (let t of ["code", "message", "customerMessage", "customer_message", "developerMessage", "developer_message"]) {
        let i = e[t];
        if ("string" == typeof i && n(i)) return !0
      }
    }
    return e instanceof Error && n(e.message)
  }, "isEngineSettingsRequiredText", 0, n])
}, 63890, e => {
  "use strict";
  let t = "local_voice_dichvideo_paid_minutes_required",
    i = "Bạn cần có phút trả phí để sử dụng Giọng DichVideo.",
    n = [
      [/local_voice_dichvideo_paid_minutes_required|insufficient.*credits|payment_required/i, i],
      [/authorization|forbidden|denied|token/i, "Phiên sử dụng Giọng DichVideo không hợp lệ hoặc đã hết hạn. Hãy thử lại."],
      [/disk_space/i, "Máy không còn đủ dung lượng để chuẩn bị Giọng DichVideo. Hãy giải phóng dung lượng rồi thử lại."],
      [/download|unavailable|component_missing/i, "Chưa thể tải thành phần Giọng DichVideo. Hãy kiểm tra mạng rồi thử lại."],
      [/corrupt|pack_invalid|identity_mismatch|component_not_ready/i, "Thành phần Giọng DichVideo cần được kiểm tra hoặc tải lại trước khi sử dụng."],
      [/cancel/i, "Đã hủy chuẩn bị hoặc tạo Giọng DichVideo."],
      [/normaliz/i, "Nội dung chưa thể chuẩn hóa cho Giọng DichVideo. Hãy kiểm tra văn bản rồi thử lại."],
      [/process|timeout/i, "Bộ tạo Giọng DichVideo đã dừng trước khi hoàn tất. Hãy thử lại."],
      [/output|wav/i, "Không thể tạo tệp âm thanh Giọng DichVideo hợp lệ. Hãy thử lại."]
    ];

  function a(e, t = "native_tts_piper_failed") {
    if (e && "object" == typeof e) {
      for (let t of [e.code, e.errorCode, e.error_code, e.message])
        if ("string" == typeof t && t.trim()) return t.trim()
    }
    return "string" == typeof e && e.trim() ? e.trim() : t
  }

  function r(e) {
    return n.find(([t]) => t.test(e))?.[1] ?? "Giọng DichVideo chưa sẵn sàng. Hãy thử lại."
  }

  function o(e, t) {
    let i = Object.assign(Error(e), {
      code: e,
      customerMessage: r(e),
      fallbackAllowed: !1
    });
    return t && "object" == typeof t && ("string" == typeof t.developerMessage ? Object.assign(i, {
      developerMessage: t.developerMessage
    }) : "string" == typeof t.developer_message && Object.assign(i, {
      developerMessage: t.developer_message
    })), i
  }
  e.s(["PIPER_PAID_MINUTES_REQUIRED_CODE", 0, t, "isPiperPaidMinutesRequired", 0, function(e) {
    let n = [e];
    e && "object" == typeof e && n.push(e.code, e.errorCode, e.error_code, e.customerMessage, e.customer_message, e.message);
    let a = i.toLowerCase();
    return n.some(e => {
      if ("string" != typeof e) return !1;
      let i = e.trim().toLowerCase();
      return i.includes(t) || i.includes(a)
    })
  }, "normalizePiperError", 0, function(e, t = "native_tts_piper_failed") {
    return o(a(e, t), e)
  }, "piperAuthorizationDenialError", 0, function(e, t) {
    let i = e?.trim() || "native_tts_piper_authorization_failed",
      n = t?.trim();
    return o(i, n ? {
      developerMessage: n
    } : void 0)
  }, "piperCustomerMessageForCode", 0, r, "piperErrorCode", 0, a, "structuredPiperError", 0, o])
}, 1046, 72428, 77730, 17028, e => {
  "use strict";
  var t = e.i(41152),
    i = e.i(63890);
  let n = {
      badgeLabel: "Lỗi",
      detail: "Video chưa xử lý xong. Hãy chạy lại; nếu vẫn lỗi, gửi log cho đội hỗ trợ."
    },
    a = {
      badgeLabel: "Ngôn ngữ nguồn chưa hỗ trợ",
      detail: "Engine vNext hiện hỗ trợ Tự động, Tiếng Trung, Tiếng Anh, Tiếng Nhật, Tiếng Hàn, Tiếng Quảng Đông, Tiếng Thái, Tiếng Nga và Tiếng Ả Rập. Hãy chọn một ngôn ngữ trong danh sách rồi chạy lại."
    },
    r = {
      badgeLabel: "Không nhận diện được lời thoại",
      detail: "DichVideo chưa đọc được lời thoại đủ tin cậy. Hãy kiểm tra âm thanh nguồn; nếu đang để Tự động, hãy chọn rõ ngôn ngữ nguồn như Tiếng Trung, Tiếng Anh, Tiếng Nhật hoặc Tiếng Hàn rồi chạy lại."
    },
    o = {
      badgeLabel: "Không tìm thấy phụ đề có sẵn",
      detail: "Không tìm thấy phụ đề có sẵn rõ ràng trong video. Hãy chọn chế độ nhận diện giọng nói hoặc dùng video có phụ đề hiển thị trong hình."
    },
    s = {
      badgeLabel: "Không thể Tự giãn",
      detail: "Không thể hoàn tất chế độ Tự giãn cho video này. Bạn có thể chọn Giữ nguyên thời lượng hoặc điều chỉnh thời gian phụ đề/giọng đọc rồi xử lý lại."
    },
    l = {
      badgeLabel: "Cần bắt đầu lại",
      detail: "Mở Lịch sử và xóa project này để bắt đầu lại. Video nguồn liên kết sẽ được giữ nguyên.",
      action: "start_fresh"
    };

  function d(e, t) {
    return Number.isFinite(e) ? Math.max(0, Math.min(1e4, Math.trunc(e))) : t
  }

  function u(e, t = 0) {
    return Number.isFinite(e) ? 100 * Math.max(0, Math.min(100, Math.trunc(e))) : t
  }
  e.s(["getProcessingErrorDisplay", 0, function(e, d) {
    let u, c, p, g, h, m, f, _, v, b, S = (e ?? "").trim(),
      y = d?.trim().toLowerCase();
    return "native_source_pin_binding_conflict" === y || S.toLowerCase().includes("native_source_pin_binding_conflict") ? l : "native_subtitle_ocr_not_found" === y ? o : S ? (0, i.isPiperPaidMinutesRequired)(S) ? {
      badgeLabel: "Cần nạp phút",
      detail: (0, i.piperCustomerMessageForCode)(i.PIPER_PAID_MINUTES_REQUIRED_CODE),
      action: "top_up_minutes"
    } : (u = S.toLowerCase()).includes("edge tts failed for selected voice") || u.includes("edge tts không trả về audio") || u.includes("không trả về audio cho giọng") || u.includes("khong tra ve audio cho giong") || u.includes("không tạo được giọng đọc") ? {
      badgeLabel: "Không tạo được giọng đọc",
      detail: "Không tạo được giọng đọc đã chọn. Hãy chạy lại video hoặc chọn giọng đọc khác; nếu video dài, xử lý ít video hơn cùng lúc."
    } : (c = S.toLowerCase()).includes("translation_provider_not_configured") || c.includes("server dịch") ? {
      badgeLabel: "Dịch vụ dịch chưa sẵn sàng",
      detail: "Dịch vụ dịch của DichVideo chưa sẵn sàng. Hãy thử lại sau khi hệ thống được cập nhật."
    } : (p = S.toLowerCase()).includes("thiếu ram") || p.includes("out of memory") || p.includes("failed to allocate memory") ? {
      badgeLabel: "Máy thiếu bộ nhớ",
      detail: "Máy không còn đủ bộ nhớ để xử lý video này. Hãy đóng bớt ứng dụng, khởi động lại Local Engine rồi chạy lại."
    } : (g = S.toLowerCase()).includes("engine_exited") || g.includes("bộ xử lý local đã dừng") ? {
      badgeLabel: "Bộ xử lý đã dừng",
      detail: "Bộ xử lý video đã dừng giữa chừng. Hãy khởi động lại Local Engine rồi chạy lại video."
    } : (0, t.isEngineSettingsRequiredText)(S) ? {
      badgeLabel: "Cần cài bộ xử lý",
      detail: t.ENGINE_SETTINGS_REQUIRED_MESSAGE
    } : (h = S.toLowerCase()).includes("native_vnext_route_required:unsupported_language_alpha") || h.includes("unsupported_language_alpha") || h.includes("native_stt_language_unsupported") ? a : (m = S.toLowerCase()).includes("native_stt_route_retry_failed") || m.includes("native_stt_text_quality_failed") || m.includes("native_stt_timing_coverage_failed") || m.includes("không nhận diện được lời thoại với các tuyến") || m.includes("khong nhan dien duoc loi thoai voi cac tuyen") ? r : (f = S.toLowerCase(), !(!(_ = f.match(/\bnative_(?:retime|time_warp|source_anchor)_[a-z0-9_]+\b/)?.[0]) || /(?:cancel(?:ed|led)|job_paused|pipeline_canceled)/.test(f) || /(?:đã hủy|tạm dừng)/.test(f) || /(?:no space left|not enough space|disk full|insufficient[^\n]*space)/.test(f) || /(?:hết dung lượng|không đủ dung lượng|ổ đĩa)/.test(f) || /native_time_warp_ff(?:mpeg|probe)_missing/.test(_) || /(?:ffmpeg|ffprobe)[^\n]*(?:missing|not found|unavailable|không tìm thấy)/.test(f) || /(?:missing|not found|unavailable|không tìm thấy)[^\n]*(?:ffmpeg|ffprobe)/.test(f) || /\bruntime_(?:not_trusted|unavailable|missing|required|not_found)\b/.test(f)) && 1) ? s : (v = S.toLowerCase()).includes("vnext native") || v.includes("native_vnext") ? n : (b = S.toLowerCase()).includes("_failed") || b.includes("backend_") || b.includes("runtime_") || b.includes("stack trace") || b.includes("traceback") || b.includes("provider_not_configured") ? n : {
      badgeLabel: n.badgeLabel,
      detail: S
    } : n
  }], 1046), e.s(["freezeFailedQueueItemProgress", 0, function(e, t) {
    let i = Number.isFinite(e) ? e : 0,
      n = Number.isFinite(t) ? t : i;
    return Math.min(99, Math.max(0, i, n))
  }, "mergeQueueItemProgressFromTask", 0, function(e, t) {
    let i = Math.max(Math.max(u(e.progress), d(e.progressBasisPoints, 0)), d(t.progressBasisPoints, u(t.progress)));
    return {
      progress: Math.min(99, Math.max(e.progress, t.progress, Math.round(i / 100))),
      progressBasisPoints: i,
      progressStageBasisPoints: t.progressStageBasisPoints ?? e.progressStageBasisPoints,
      progressMessageKey: t.progressMessageKey ?? e.progressMessageKey,
      progressOperationId: t.progressOperationId ?? e.progressOperationId,
      progressGeneration: t.progressGeneration ?? e.progressGeneration,
      progressSequence: t.progressSequence ?? e.progressSequence,
      message: t.message || e.message
    }
  }], 72428);
  var c = e.i(18849),
    p = e.i(77496),
    g = e.i(54302),
    h = e.i(72888);
  let m = "queue_tts_route_inconsistent";

  function f(e) {
    return {
      ...e,
      translationStyle: {
        ...e.translationStyle
      },
      sonitranslateSettings: {
        ...e.sonitranslateSettings
      },
      dubbingTimeline: {
        ...e.dubbingTimeline
      },
      seriesBatchStampSnapshot: e.seriesBatchStampSnapshot ? structuredClone(e.seriesBatchStampSnapshot) : void 0
    }
  }

  function _(e) {
    return "string" == typeof e && e.trim().length > 0
  }

  function v(e) {
    return !!e && "object" == typeof e && _(Reflect.get(e, "schemaVersion")) && _(Reflect.get(e, "engineId")) && _(Reflect.get(e, "runtimeVersion")) && _(Reflect.get(e, "outputContractVersion"))
  }

  function b(e) {
    return "separate_background" === e || "mute_original" === e ? e : "mix_original"
  }

  function S(e, t, i) {
    if (i && null == e && null == t) return {
      gainPercent: 100,
      dashboardSnapshotMode: "keep_full",
      sourceSelection: "original_mix",
      nativeTrackReady: !1
    };
    let n = b(e),
      a = "mute_original" === n ? 0 : Math.round(100 * ("number" == typeof t && Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : .18));
    return {
      gainPercent: a,
      dashboardSnapshotMode: "separate_background" === n ? "separate_background" : "mute_original" === n || 0 === a ? "muted" : 100 === a ? "keep_full" : "keep_low",
      sourceSelection: "original_mix",
      nativeTrackReady: !1
    }
  }

  function y(e) {
    var t, i;
    let n = e?.nleDocument?.playback;
    if (n) {
      let e = Math.round(100 * Math.max(0, Math.min(1, n.originalVolume))),
        t = "separated_background" === n.sourceAudioMode,
        i = "vocals_only" === n.sourceAudioMode,
        a = "muted" === n.sourceAudioMode || 0 === e;
      return {
        gainPercent: a ? 0 : e,
        dashboardSnapshotMode: t || i ? "separate_background" : a ? "muted" : 100 === e ? "keep_full" : "keep_low",
        sourceSelection: t ? "separated_background" : i ? "separated_vocals" : "original_mix",
        nativeTrackReady: !0
      }
    }
    return (t = e?.projectAudioTrack, t?.schemaVersion === "project-audio-track-v1" && _(t.audioGenerationId) && ("original_mix" === t.sourceSelection || "separated_background" === t.sourceSelection || "separated_vocals" === t.sourceSelection) && Number.isInteger(t.gainPercent) && t.gainPercent >= 0 && t.gainPercent <= 100 && ("keep_low" === (i = t.dashboardSnapshotMode) || "keep_full" === i || "separate_background" === i || "muted" === i) && function(e) {
      if (!e || "object" != typeof e) return !1;
      let t = Reflect.get(e, "state");
      return "failed" === t ? _(Reflect.get(e, "code")) : "not_requested" === t || "requested" === t || "running" === t || "ready" === t || "canceled" === t || "regeneration_required" === t
    }(t.separationState) && Number.isSafeInteger(t.updatedAtMs) && t.updatedAtMs > 0 && (null == t.backgroundArtifactReceipt || v(t.backgroundArtifactReceipt)) && ("original_mix" === t.sourceSelection || v(t.backgroundArtifactReceipt))) ? {
      gainPercent: e.projectAudioTrack.gainPercent,
      dashboardSnapshotMode: e.projectAudioTrack.dashboardSnapshotMode,
      sourceSelection: e.projectAudioTrack.sourceSelection,
      nativeTrackReady: !0
    } : S(e?.originalAudioStrategy, e?.originalAudioVolume, !0)
  }
  e.s(["assertQueueExecutionTtsRoute", 0, function(e) {
    if (!e.includeTts) return;
    let t = e.ttsProvider?.trim() || "edge_tts",
      i = e.sonitranslateSettings.tts_voice00.trim();
    if (t === h.VIENEU_TURBO_PROVIDER || (0, h.isVieNeuTurboVoiceId)(i)) {
      if (t !== h.VIENEU_TURBO_PROVIDER || !(0, h.isVieNeuTurboVoiceId)(i)) throw Error(m);
      return
    }
    let n = (0, c.isDichVideoVoiceId)(i),
      a = (0, p.isViralVoiceId)(i),
      r = null !== (0, g.resolveVieNeuVoice)(i);
    if (!("piper_native" === t ? n : t === p.VIRAL_TTS_PROVIDER_ID ? a : t === g.VIENEU_TTS_PROVIDER_ID ? r : !n && !a && !r)) throw Error(m)
  }, "cloneQueueExecutionSnapshot", 0, f, "projectRecoveryExecutionSnapshot", 0, function(e, t) {
    var i;
    let n = f(e),
      a = t.nleDocument?.playback,
      r = t.dubbingTimeline ?? (a?.timingMode === "fixed_voice_speed" && Number.isInteger(i = a.requestedVoiceRateTenths) && i >= 10 && i <= 20 ? {
        mode: "fixed_voice_speed",
        requestedVoiceRateTenths: a.requestedVoiceRateTenths
      } : a?.timingMode === "source_timeline" ? {
        mode: "source_timeline"
      } : null);
    r ? (n.dubbingTimeline = {
      ...r
    }, n.dubbingTimelineIntent = t.dubbingTimelineIntent ?? null, n.recoveryExecutionState = "project_persisted") : n.recoveryExecutionState = "timing_unknown";
    let o = t.nativeTtsProvider?.trim(),
      s = t.nativeTtsVoice?.trim();
    o && s ? (n.includeTts = !0, n.ttsProvider = o, n.sonitranslateSettings.tts_voice00 = s, n.sonitranslateSettings.output_type = "video") : t.nleDocument && 0 === t.nleDocument.voiceCues.length && (n.includeTts = !1, n.ttsProvider = void 0, n.sonitranslateSettings.output_type = "subtitle", n.sonitranslateSettings.sync_voice_timing = !1, n.sonitranslateSettings.display_subtitle_timing = "source_timing", n.sonitranslateSettings.burn_subtitles_to_video = !1, n.sonitranslateSettings.soft_subtitles_to_video = !1);
    let l = a?.sourceAudioMode,
      d = "separated_background" === l || "vocals_only" === l ? "separate_background" : "muted" === l ? "mute_original" : "original_mix" === l ? "mix_original" : t.originalAudioStrategy,
      u = a?.originalVolume ?? t.originalAudioVolume;
    return d && (n.sonitranslateSettings.original_audio_strategy = d), "number" == typeof u && Number.isFinite(u) && (n.sonitranslateSettings.volume_original_audio = u), "number" == typeof a?.translatedVolume && Number.isFinite(a.translatedVolume) && (n.sonitranslateSettings.volume_translated_audio = a.translatedVolume), n
  }, "resolveQueueExecutionSnapshot", 0, function(e, t) {
    return e.executionSnapshot ?? t.snapshot
  }], 77730), e.s(["hasAuthoredSourcePreviewAudioPolicy", 0, function(e) {
    let t = e?.originalAudioStrategy;
    return "mute_original" === t || ("mix_original" === t || "separate_background" === t) && "number" == typeof e?.originalAudioVolume && Number.isFinite(e.originalAudioVolume) && e.originalAudioVolume >= 0 && e.originalAudioVolume <= 1
  }, "previewAudioGainVideoPatch", 0, function(e, t) {
    if (!Number.isInteger(t) || t < 0 || t > 100) throw TypeError("project_audio_gain_invalid");
    return {
      originalAudioStrategy: "separate_background" === e.originalAudioStrategy ? "separate_background" : 0 === t ? "mute_original" : "mix_original",
      originalAudioVolume: t / 100
    }
  }, "resolveSourcePreviewAudioPolicy", 0, y, "resolveSourcePreviewMediaAudio", 0, function(e, t, i) {
    if (!Number.isFinite(t) || t < 0 || t > 1) throw TypeError("preview_transport_volume_invalid");
    let n = y(e);
    return {
      volume: n.gainPercent / 100 * t,
      muted: i || 0 === n.gainPercent || 0 === t
    }
  }, "sourcePreviewAudioVideoPatchFromQueueSnapshot", 0, function(e) {
    let t = b(e.sonitranslateSettings.original_audio_strategy),
      i = S(t, e.sonitranslateSettings.volume_original_audio, !1);
    return {
      originalAudioStrategy: "mute_original" === t || 0 === i.gainPercent ? "mute_original" : t,
      originalAudioVolume: i.gainPercent / 100
    }
  }], 17028)
}, 97347, e => {
  "use strict";
  let t = ["outputDuration", "previewVideoPath", "previewSourcePath", "draftVideoPath", "translatedVideoPath", "cuePreviewPlanPath", "cuePreviewPlanHash", "cuePreviewSchemaVersion", "cuePreviewCueCount", "cuePreviewGeneration", "cuePreviewArchitecture", "cuePreviewTimelineVideoPath", "cuePreviewJobId", "cuePreviewOriginalVolume", "cuePreviewTranslatedVolume", "nativeProjectReadiness", "terminalAdmission", "activeTerminalGeneration", "projectAudioTrack", "projectAudioPreviewCarrierPath", "projectTempoMarkerCueIds", "subtitlesBurnedIntoVideo", "finalExportPath", "finalExportedAt", "finalExportHasSubtitles", "finalExportHasWatermark", "finalExportHasOverlays", "translatedSubtitlePath", "sourceSubtitlePath", "alignedSourceSubtitlePath", "subtitleAlignmentPath", "displaySubtitlePath", "voiceSubtitlePath", "translationDebugPath", "performanceTracePath", "supportBundlePath", "ttsAudioFiles", "ttsTimelineAudioPath", "ttsManifestPath", "editedSubtitleTtsDirty", "editedSubtitleTtsDirtyCaptionIds", "excludedSubtitleFingerprints", "dubbingTimelineResult", "dubbingTimelineVideoPath", "srtAudioOutputPath", "srtAudioWorkDir", "srtAudioTtsManifestPath", "srtAudioAudioManifestPath", "exportWatermarkPolicy", "projectAuthorizationReceipt", "billingScopeJobId", "pausedBillingScopeJobId", "lastAuthorizedJobId", "billingSourceVideoSeconds", "billingChargedSeconds", "billingNonRefundableSeconds", "billingTargetLanguage", "billingTtsProvider", "billingAuthorizationPending", "billingAuthorizationRequestKeyHash", "translationServerUsageStarted", "nativeTtsProvider", "nativeTtsVoice", "processingError", "processingErrorCode", "processingErrorDetail", "processingStartedAt", "processingCompletedAt", "processingDurationMs", "processingSession", "processingRecoveryBinding"];

  function i(e) {
    let t = e?.trim();
    return t ? (/^[a-zA-Z]:[\\/]/.test(t) || t.includes("\\") ? t.replace(/[\\/]+/g, "\\") : t).toLowerCase() : ""
  }
  e.s(["isQueuedVideo", 0, function(e) {
    return !e.translatedVideoPath && "idle" === e.status
  }, "isUntouchedReusableDraft", 0, function(e, i) {
    return !("idle" !== e.status || e.translatedVideoPath || !i.dashboardDraftVideoIds.includes(e.id) || i.queueVideoIds.includes(e.id)) && t.every(t => null == e[t])
  }, "normalizeQueuedSourcePath", 0, i, "sameQueuedSourcePath", 0, function(e, t) {
    let n = i(e),
      a = i(t);
    return "" !== n && n === a
  }])
}, 70631, e => {
  "use strict";
  let t = /^sha256:[0-9a-f]{64}$/,
    i = new Set(["smbios_uuid", "baseboard_serial", "system_volume_serial", "machine_guid"]);
  e.s(["buildTrialAuthorizationEvidence", 0, function({
    fingerprint: e,
    sourceContentHash: n,
    requestIdempotencyKey: a
  }) {
    if (null !== n && !t.test(n)) throw Error("trial_source_content_hash_invalid");
    if ("string" != typeof a || a.trim() !== a || a.length < 1 || a.length > 128) throw Error("trial_request_idempotency_key_invalid");
    return {
      source_content_hash: n,
      request_idempotency_key: a,
      trial_device_fingerprint: function(e) {
        let n = e.trial_device_fingerprint;
        if (!n || "three-day-trial-device-fingerprint-v2" !== n.contract_version || "string" != typeof n.installation_id || !n.installation_id.trim() || n.installation_id !== e.installation_id || !Array.isArray(n.strong_anchors) || n.strong_anchors.length < 2 || n.strong_anchors.length > 4) return null;
        let a = new Set,
          r = new Set,
          o = [];
        for (let e of n.strong_anchors) {
          if (!i.has(e.kind) || !t.test(e.digest) || "sha256-v1" !== e.algorithm_version || "collected" !== e.collection_outcome || a.has(e.kind) || r.has(e.digest)) return null;
          a.add(e.kind), r.add(e.digest), o.push({
            kind: e.kind,
            digest: e.digest,
            algorithm_version: "sha256-v1",
            collection_outcome: "collected"
          })
        }
        return {
          contract_version: "three-day-trial-device-fingerprint-v2",
          installation_id: n.installation_id,
          strong_anchors: o
        }
      }(e)
    }
  }, "createTrialAuthorizationRequestId", 0, function() {
    let e = globalThis.crypto?.randomUUID;
    if ("function" != typeof e) throw Error("trial_request_id_unavailable");
    return `trial-auth:${e.call(globalThis.crypto)}`
  }, "selectSrtAudioAuthorizationSource", 0, function(e) {
    let t = e.srtContent?.trim();
    if (t) return {
      kind: "inline",
      value: t
    };
    let i = e.srtPath?.trim();
    return i ? {
      kind: "file",
      value: i
    } : null
  }])
}, 98106, 13052, 69160, 87518, e => {
  "use strict";
  let t = "Lần xử lý trước đã dừng khi ứng dụng đóng. Hãy thêm video lại để tạo project mới.",
    i = "DichVideo đang hoàn tất trạng thái của lần xử lý trước.";
  e.s(["projectSettlementIntoDesktopState", 0, function(e) {
    ! function(e) {
      let {
        settlement: t,
        video: i,
        queueItem: n
      } = e, a = i?.processingSession ?? n?.processingSession;
      if (i && i.id !== t.projectId || n && n.videoId !== t.projectId || a && (a.project_id !== t.projectId || a.job_id !== t.jobId)) throw Error("processing_settlement_identity_mismatch")
    }(e);
    let n = {
        pipeline: 0,
        resume: 0,
        authorize: 0
      },
      {
        settlement: a
      } = e;
    if ("completed_ready" === a.disposition) {
      if (a.completion.projectId !== a.projectId || a.completion.jobId !== a.jobId) throw Error("processing_settlement_identity_mismatch");
      return {
        projection: a,
        videoPatch: {
          status: "completed",
          processingError: void 0,
          processingErrorCode: void 0,
          processingErrorDetail: void 0
        },
        queueItemPatch: {
          status: "done",
          stage: "Hoàn tất",
          progress: 100,
          progressBasisPoints: 1e4,
          errorKind: void 0,
          errorMessage: void 0,
          message: void 0
        },
        queueRunPatch: {
          status: "completed",
          activeItemId: void 0
        },
        commands: n
      }
    }
    if ("interrupted" === a.disposition) {
      if (a.receipt.projectId !== a.projectId || a.receipt.jobId !== a.jobId || "desktop_processing_interrupted" !== a.receipt.errorCode) throw Error("processing_settlement_identity_mismatch");
      return {
        projection: {
          disposition: "interrupted",
          projectId: a.projectId,
          jobId: a.jobId,
          code: "desktop_processing_interrupted"
        },
        videoPatch: {
          status: "error",
          processingError: t,
          processingErrorCode: "desktop_processing_interrupted",
          processingErrorDetail: void 0
        },
        queueItemPatch: {
          status: "interrupted",
          stage: "Đã dừng",
          progress: e.queueItem?.progress ?? 0,
          errorKind: "terminal",
          errorMessage: t,
          message: t
        },
        queueRunPatch: {
          status: "completed",
          activeItemId: void 0
        },
        commands: n
      }
    }
    return {
      projection: a,
      videoPatch: {
        status: "error",
        processingError: i,
        processingErrorCode: a.reasonCode,
        processingErrorDetail: void 0
      },
      queueItemPatch: {
        status: "settlement_pending",
        stage: "Đang hoàn tất trạng thái",
        progress: e.queueItem?.progress ?? 0,
        errorKind: "terminal",
        errorMessage: i,
        message: i
      },
      queueRunPatch: {
        status: "completed",
        activeItemId: void 0
      },
      commands: n
    }
  }], 98106);
  let n = new Set(["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv"]);

  function a(e) {
    let t = e.split(".").pop()?.toLowerCase();
    return t && n.has(t) ? t : void 0
  }

  function r(e) {
    return e.filter(e => !!e.trim() && !!a(e))
  }

  function o(e, t) {
    let i = e.replace(/[\\/]+$/, ""),
      n = e.includes("\\") ? "\\" : "/",
      a = l(t).replace(/\.[^.]+$/, "");
    return `${i}${n}${a}.mp4`
  }

  function s(e) {
    return e.filter(e => "skip" !== e.kind && ("waiting" === e.status || "failed" === e.status))
  }

  function l(e) {
    let t = e.replace(/[/\\]+$/, ""),
      i = t.split(/[/\\]/);
    return i[i.length - 1] || t
  }

  function d(e) {
    return e.trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/+$/, "").toLowerCase()
  }

  function u(e, t) {
    return d(e) === d(t)
  }

  function c(e) {
    let t = e?.nleDocument?.overlays,
      i = void 0 !== t ? t : e?.exportLayers ?? [],
      n = e?.nleDocument?.playback,
      a = e?.nativeProjectReadiness?.tempoState,
      r = n?.timingMode ?? (a?.state === "applied" ? "fixed_voice_speed" : null),
      o = n?.requestedVoiceRateTenths ?? (a?.state === "applied" && "number" == typeof a.targetTempoTenths ? a.targetTempoTenths : null);
    return {
      overlays: i,
      subtitleStyle: e?.nleDocument?.subtitleStyle ?? null,
      canvasComposition: e?.nleDocument?.canvasComposition ?? null,
      sourceRemoval: e?.nleDocument?.sourceRemoval ?? null,
      sourceAudioMode: n?.sourceAudioMode ?? null,
      originalVolume: n?.originalVolume ?? null,
      translatedVolume: n?.translatedVolume ?? null,
      nativeTtsVoice: e?.nativeTtsVoice?.trim() || null,
      timingMode: r,
      requestedVoiceRateTenths: o ?? null
    }
  }

  function p(e) {
    return [...e]
  }
  async function g(e, t) {
    if (e?.nleDocument) return c(e);
    let i = await t();
    return c({
      ...e,
      nleDocument: i
    })
  }
  async function h({
    items: e,
    parentVideoId: t,
    existingVideos: i,
    addVideoFromFile: n,
    enqueueAndStart: a,
    applyStamps: r,
    snapshotFromParent: o,
    onItemBound: s,
    onItemStatus: l
  }) {
    let d = function(e) {
      let t = [];
      for (let i of e) "skip" !== i.kind && t.push({
        path: i.path,
        videoId: i.videoId,
        action: i.kind
      });
      return t
    }(e);
    if (0 === d.length) return;
    let u = o();
    for (let e of d) {
      l(e.path, "running");
      try {
        let o = e.videoId ? i.find(i => i.id === e.videoId && i.id !== t) : void 0,
          d = o?.id ?? await n(e.path);
        if (o || await s(e.path, d, t), o?.status === "completed") {
          await r(d), l(e.path, "delivered");
          continue
        }
        await a([d], u)
      } catch {
        l(e.path, "failed")
      }
    }
  }
  async function m(e) {
    let t = s(e.items);
    return 0 === t.length ? 0 : (await h({
      ...e,
      items: t
    }), t.length)
  }
  e.s(["filterSupportedVideoFiles", 0, function(e) {
    return e.filter(e => !!a(e.name))
  }, "filterSupportedVideoPaths", 0, r, "getVideoPathsFromTauriDragDropPayload", 0, function(e) {
    return "drop" !== e.type ? [] : r(e.paths ?? [])
  }], 13052), e.s(["buildSeriesBatchAudioPlan", 0, function(e, t, i) {
    let n = e.sourceAudioMode,
      a = e.originalVolume,
      r = e.translatedVolume;
    return null !== n && null !== a && Number.isFinite(a) && null !== r && Number.isFinite(r) ? {
      requiresBackgroundSeparation: ("separated_background" === n || "vocals_only" === n) && (t.playback.sourceAudioMode !== n || !i?.trim()),
      mutation: {
        kind: "update_audio_mix",
        originalVolume: Math.round(100 * a),
        translatedVolume: Math.round(100 * r),
        sourceAudioMode: n
      }
    } : {
      requiresBackgroundSeparation: !1,
      mutation: null
    }
  }, "buildSeriesBatchItems", 0, function(e, t) {
    let i = new Map;
    for (let t of r([...e])) {
      let e = d(t);
      !e || i.has(e) || i.set(e, t)
    }
    return [...i.values()].map(e => ({
      path: e,
      name: l(e),
      kind: u(e, t) ? "skip" : "full",
      status: "waiting",
      exportStatus: "waiting"
    }))
  }, "buildSeriesBatchVisualMutation", 0, function(e, t) {
    return {
      kind: "update_visuals",
      overlays: p(e.overlays),
      subtitleStyle: e.subtitleStyle ?? t.subtitleStyle,
      canvasComposition: e.canvasComposition ?? t.canvasComposition,
      sourceRemoval: e.sourceRemoval ?? t.sourceRemoval,
      sourceWidth: t.source.width,
      sourceHeight: t.source.height
    }
  }, "collectSeriesBatchOutputCollisions", 0, function(e, t) {
    let i = new Map;
    for (let n of e) {
      let e = o(t, n),
        a = d(e),
        r = i.get(a);
      if (r) {
        r.sourcePaths.push(n);
        continue
      }
      i.set(a, {
        outputPath: e,
        outputName: l(e),
        sourcePaths: [n]
      })
    }
    return [...i.values()].filter(e => e.sourcePaths.length > 1 || e.sourcePaths.some(t => u(t, e.outputPath)))
  }, "collectSeriesBatchRecoveryItems", 0, s, "compactSeriesBatchVideoTitle", 0, function(e, t = 46) {
    let i = e.trim();
    if (i.length <= t || t < 8) return i;
    let n = /\.[^.]+$/.exec(i)?.[0] ?? "",
      a = Math.min(i.length - 2, Math.max(n.length + 14, Math.floor(.46 * t))),
      r = Math.max(1, t - a - 1);
    return `${i.slice(0,r)}…${i.slice(-a)}`
  }, "groupSeriesBatchHistory", 0, function(e) {
    let t = new Map(e.map(e => [e.id, e])),
      i = new Map;
    for (let t of e) {
      if (!t.seriesBatchParentId || t.seriesBatchParentId === t.id) continue;
      let e = i.get(t.seriesBatchParentId) ?? [];
      e.push(t), i.set(t.seriesBatchParentId, e)
    }
    let n = new Set,
      a = [],
      r = e => {
        n.has(e.id) || (n.add(e.id), a.push(e))
      };
    for (let n of e) {
      let e = t.get(n.seriesBatchParentId ?? "") ?? n;
      for (let t of (r(e), i.get(e.id) ?? [])) r(t);
      r(n)
    }
    return a
  }, "isSameMediaPath", 0, u, "joinSeriesBatchExportPath", 0, o, "mergeSeriesBatchItems", 0, function(e, t) {
    let i = [...e];
    for (let e of t) {
      let t = i.findIndex(t => u(t.path, e.path));
      if (-1 === t) {
        i.push(e);
        continue
      }
      i[t] = {
        ...i[t],
        ...e,
        status: i[t].status,
        exportStatus: i[t].exportStatus ?? "waiting",
        videoId: i[t].videoId,
        appliedStampFingerprint: i[t].appliedStampFingerprint,
        settingsApplied: i[t].settingsApplied,
        thumbnail: e.thumbnail ?? i[t].thumbnail
      }
    }
    return i
  }, "mergeSeriesBatchStampOverlays", 0, p, "normalizePersistedSeriesBatchItem", 0, function(e) {
    let t = "skip" !== e.kind && "running" === e.status ? "failed" : e.status,
      i = "queued" === e.exportStatus || "exporting" === e.exportStatus ? "failed" : e.exportStatus;
    return t === e.status && i === e.exportStatus ? e : {
      ...e,
      status: t,
      exportStatus: i
    }
  }, "reconcileLegacySeriesBatchItemVideoIds", 0, function(e, t, i) {
    let n = !1,
      a = e.map(e => {
        if (e.videoId || "reexport" !== e.kind || "delivered" !== e.status) return e;
        let a = t.filter(t => t.id !== i && u(t.path, e.path));
        return 1 !== a.length || "completed" !== a[0].status ? e : (n = !0, {
          ...e,
          videoId: a[0].id
        })
      });
    return n ? a : e
  }, "resolveSeriesBatchItemVideo", 0, function(e, t) {
    return e.videoId ? t.find(t => t.id === e.videoId) : void 0
  }, "resolveSeriesBatchStampSnapshot", 0, g, "seriesBatchAutoExportEligible", 0, function(e, t, i) {
    return !!(i && "skip" !== e.kind && "delivered" === e.status && "waiting" === e.exportStatus && !0 === e.settingsApplied && t?.status === "completed")
  }, "seriesBatchBadgeVariant", 0, function(e) {
    return "skip" === e.kind ? "secondary" : "failed" === e.status ? "destructive" : "running" === e.status ? "warning" : "waiting" === e.status ? "outline" : "failed" === e.exportStatus ? "destructive" : "delivered" === e.exportStatus ? "success" : "queued" === e.exportStatus || "exporting" === e.exportStatus ? "warning" : "delivered" === e.status ? "success" : "outline"
  }, "seriesBatchChildRemovalTarget", 0, function(e) {
    return e ? "project" : "batch"
  }, "seriesBatchHistoryStatusPresentation", 0, function(e, t) {
    return "skip" === e.kind ? {
      label: "Tập mẫu",
      detail: "",
      variant: "secondary"
    } : "running" === e.status ? {
      label: "Đang xử lý",
      detail: "",
      variant: "warning"
    } : "waiting" === e.status ? {
      label: "Chờ xử lý",
      detail: "",
      variant: "outline"
    } : "failed" === e.status ? t?.kind === "error" && t.label ? {
      label: t.label,
      detail: t.detail,
      variant: t.variant
    } : {
      label: "Lỗi xử lý",
      detail: "",
      variant: "destructive"
    } : "failed" === e.exportStatus ? {
      label: "Lỗi xuất",
      detail: "",
      variant: "destructive"
    } : "queued" === e.exportStatus || "exporting" === e.exportStatus ? {
      label: "Đang xuất",
      detail: "",
      variant: "warning"
    } : t?.label ? {
      label: t.label,
      detail: t.detail,
      variant: t.variant
    } : "delivered" === e.status ? {
      label: "Đã xử lý",
      detail: "",
      variant: "success"
    } : {
      label: "Chờ xử lý",
      detail: "",
      variant: "outline"
    }
  }, "seriesBatchKindLabel", 0, function(e) {
    return "skip" === e ? "Tập mẫu" : "reexport" === e ? "Xuất lại" : "Xử lý mới"
  }, "seriesBatchParentDeletionBlocked", 0, function(e) {
    return e.some(e => "delivered" !== e.status)
  }, "seriesBatchParentFolderLabel", 0, function(e) {
    let t = e.replace(/[/\\]+$/, "").split(/[/\\]/);
    return t.length > 1 && t[t.length - 2] || "Thư mục nguồn"
  }, "seriesBatchStampFingerprint", 0, function(e) {
    return JSON.stringify({
      voice: e.nativeTtsVoice ?? "",
      style: e.subtitleStyle,
      canvas: e.canvasComposition,
      sourceRemoval: e.sourceRemoval,
      sourceAudioMode: e.sourceAudioMode ?? "",
      originalVolume: e.originalVolume ?? "",
      translatedVolume: e.translatedVolume ?? "",
      timingMode: e.timingMode ?? "",
      rate: e.requestedVoiceRateTenths ?? "",
      overlays: e.overlays.map(e => {
        let t = {
          ...e
        };
        return delete t.id, t
      })
    })
  }, "seriesBatchStampsFromVideo", 0, c, "seriesBatchStampsNeedSync", 0, function(e, t) {
    return e !== t
  }], 69160), e.s(["resolveSeriesBatchExecutionSnapshot", 0, function(e, t) {
    return e ?? t()
  }, "resumeSeriesBatchProcessing", 0, m, "seriesBatchPostProcessAction", 0, function(e, t) {
    return "skip" === e ? "none" : "completed" === t ? "apply_stamps" : "fail"
  }, "startSeriesBatchProcessing", 0, h], 87518)
}, 94010, e => {
  "use strict";
  e.i(89268);
  var t = e.i(81341),
    i = e.i(53752),
    n = e.i(63126);
  async function a(e) {
    if ("srt_audio" === e.projectType || !(0, t.isTauri)() || e.thumbnail && await (0, t.fileExists)(e.thumbnail)) return e;
    if (e.sourceMissing) return {
      ...e,
      thumbnail: void 0
    };
    try {
      var a;
      let r = await (0, n.getProjectArtifactPath)(e.id, "media.thumbnail");
      if (await (0, t.fileExists)(r)) return {
        ...e,
        thumbnail: r
      };
      if (!e.path || !await (0, t.fileExists)(e.path)) return e;
      let o = await (0, i.generateThumbnail)(e.path, r, (a = e.duration, !Number.isFinite(a) || a <= 1 ? 0 : Math.min(a >= 6 ? 5 : Math.max(.25, .25 * a), Math.max(0, a - .1))));
      return {
        ...e,
        thumbnail: o
      }
    } catch (t) {
      return console.warn("Failed to ensure project thumbnail:", t), e
    }
  }
  e.s(["ensureProjectThumbnail", 0, a])
}, 21193, 56583, e => {
  "use strict";
  e.i(89268);
  var t = e.i(81341),
    i = e.i(63126),
    n = e.i(90808);

  function a() {
    return `${Date.now()}-${Math.random().toString(36).slice(2,11)}`
  }

  function r(e) {
    let t = e.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{2,3})$/);
    if (!t) return 0;
    let [, i, n, a, r] = t, o = 2 === r.length ? 10 * Number(r) : Number(r.padEnd(3, "0").slice(0, 3));
    return 60 * Number(i) * 6e4 + 60 * Number(n) * 1e3 + 1e3 * Number(a) + o
  }

  function o(e) {
    let t = [];
    return e.replace(/\r/g, "").split(/\n{2,}/).forEach((e, i) => {
      let n = e.split("\n").map(e => e.trim()).filter(Boolean),
        a = n.findIndex(e => e.includes("-->"));
      if (-1 === a) return;
      let o = Number(n[0]) || i + 1,
        [s, l] = n[a].split("-->").map(e => e.trim()),
        d = n.slice(a + 1).join("\n");
      d && t.push({
        index: o,
        startTime: r(s),
        endTime: r(l),
        text: d,
        artifactOrder: t.length
      })
    }), t.sort((e, t) => e.startTime - t.startTime || (e.artifactOrder ?? 0) - (t.artifactOrder ?? 0) || e.index - t.index)
  }

  function s(e) {
    let t = [],
      i = [];
    for (let n of e.map((e, t) => ({
        ...e,
        artifactOrder: e.artifactOrder ?? t
      })).sort((e, t) => e.startTime - t.startTime || e.artifactOrder - t.artifactOrder || e.index - t.index)) {
      if (function(e) {
          let t = e.text.trim();
          return !(Math.max(0, e.endTime - e.startTime) >= 300) && (!t || /^[\p{N}\p{P}\p{S}\s]+$/u.test(t) && t.length <= 4)
        }(n)) {
        i.push(n.index);
        continue
      }
      t.push({
        ...n,
        displayable: !0,
        mergedFromIndexes: [...i, n.index]
      }), i.length = 0
    }
    if (i.length > 0 && t.length > 0) {
      let e = t[t.length - 1];
      e.mergedFromIndexes = [...e.mergedFromIndexes, ...i]
    }
    return t
  }

  function l(e) {
    let t = new Map;
    for (let i of e)
      for (let e of (t.set(i.index, i), i.mergedFromIndexes)) t.set(e, i);
    return t
  }

  function d(e) {
    let t = e.text.trim();
    return t.length <= 4 && /^[\p{N}\p{P}\p{S}\s]+$/u.test(t)
  }

  function u(e, t) {
    if (t <= 0) return 0;
    let i = 0;
    for (let n of e.matchAll(/[\s\S]/gu))
      if ((i += 1) === t) return (n.index ?? 0) + n[0].length;
    return e.length
  }

  function c({
    videoId: e,
    style: t,
    sourceEntries: i,
    translatedEntries: r,
    alignmentCues: o = [],
    existingSubtitles: p,
    createId: g = a
  }) {
    let h = new Map(p.map(e => [e.index, e])),
      m = s(i),
      f = s(r),
      _ = f.length > 0,
      v = _ ? f : m,
      b = new Set,
      S = l(m),
      y = function(e) {
        let t = new Map;
        for (let i of e) t.set(i.displayIndex, i), t.set(i.voiceIndex, i);
        return t
      }(o),
      P = function(e, t, i) {
        let n = l(t),
          a = new Map(e.map(e => [e.index, e])),
          r = new Map;
        for (let e of i) {
          let t = a.get(e.displayIndex) ?? a.get(e.voiceIndex);
          if (!t || !n.has(e.sourceIndex)) continue;
          let i = r.get(e.sourceIndex) ?? [];
          i.push(t), r.set(e.sourceIndex, i)
        }
        let o = new Map;
        for (let [e, t] of r) {
          if (t.length <= 1) continue;
          t.sort((e, t) => e.startTime - t.startTime || e.index - t.index);
          let i = n.get(e);
          if (!i || i.mergedFromIndexes.length > 1 || t.some(d)) continue;
          let a = function(e, t) {
            let i = e.trim().split(/\s+/).filter(Boolean).join(" ");
            if (t.length <= 1 || !i) return [i || e];
            let n = function(e) {
              let t = [],
                i = 0;
              for (let n of e.matchAll(/[.!?;:\u2026\u3002\uff01\uff1f\uff1b\uff1a]+/gu)) {
                let a = (n.index ?? 0) + n[0].length,
                  r = e.slice(i, a).trim();
                r && t.push(r), i = a
              }
              let n = e.slice(i).trim();
              return n && t.push(n), t.length > 0 ? t : [e]
            }(i);
            return n.length === t.length ? n : function(e, t) {
              let i = Array.from(e).length;
              if (i < t.length) return t.map(() => e);
              let n = t.map(e => {
                  let t = Math.max(0, e.endTime - e.startTime);
                  return t > 0 ? t : Array.from(e.text).filter(e => !/\s/u.test(e)).length || 1
                }),
                a = n.reduce((e, t) => e + t, 0) || t.length,
                r = [],
                o = 0,
                s = 1;
              for (let l = 0; l < t.length - 1; l += 1) {
                o += n[l];
                let d = i - (t.length - l - 1),
                  c = function(e, t, i, n) {
                    let a = [],
                      r = 0;
                    for (let t of Array.from(e)) {
                      if ((r += 1) < i || r > n) continue;
                      let o = /[\s.!?;:,\u2026\u3001\u3002\uff0c\uff01\uff1f\uff1b\uff1a]/u.test(t);
                      a.push({
                        byteIndex: u(e, r),
                        charIndex: r,
                        preferred: o
                      })
                    }
                    let o = a.filter(e => e.preferred).sort((e, i) => Math.abs(e.charIndex - t) - Math.abs(i.charIndex - t));
                    return o[0] ? o[0].byteIndex : u(e, t)
                  }(e, Math.min(Math.max(Math.round(i * o / a), s), d), s, d);
                r.push(c), s = Array.from(e.slice(0, c)).length + 1
              }
              let l = [],
                d = 0;
              for (let t of r) l.push(e.slice(d, t).trim()), d = t;
              return l.push(e.slice(d).trim()), l.every(Boolean) ? l : t.map(() => e)
            }(i, t)
          }(i.text, t);
          a.length === t.length && t.forEach((e, t) => {
            o.set(e.index, a[t])
          })
        }
        return o
      }(f, m, o),
      T = !_ || m.length === f.length;
    return v.map((i, a) => {
      let r, o, s = _ ? y.get(i.index) : void 0,
        l = s ? S.get(s.sourceIndex) : void 0,
        d = _ ? l ?? (T ? (o = (r = e => {
          let t, n = -1 / 0;
          for (let a of m) {
            if (!e && b.has(a)) continue;
            let r = function(e, t) {
              var i;
              let n = Math.max(0, Math.min(e.endTime, t.endTime) - Math.max(e.startTime, t.startTime)),
                a = Math.abs(e.startTime - t.startTime),
                r = Math.abs(e.endTime - t.endTime);
              if (n <= 0 && a > 250) return -1 / 0;
              let o = n;
              return 0 === a ? o += 1e3 : a <= 50 ? o += 500 : a <= 250 && (o += 100), r <= 50 && (o += 100), i = e.text, /[\p{L}\p{N}]/u.test(i) || (o -= 1e3), o += Math.min(200, e.text.trim().length), o -= Math.abs((e.artifactOrder ?? 0) - (t.artifactOrder ?? 0)) / 1e3
            }(a, i);
            r > n && (t = a, n = r)
          }
          return t && Number.isFinite(n) ? t : void 0
        })(!1)) ? (b.add(o), o) : r(!0) : void 0) : i,
        u = h.get(i.index) ?? h.get(a + 1),
        c = P.get(i.index) ?? d?.text ?? (T ? u?.originalText : void 0) ?? "",
        p = u?.stableCueId ?? `source:${i.index}`,
        f = {
          id: u?.id ?? g(),
          videoId: e,
          stableCueId: p,
          fieldAuthority: u?.fieldAuthority ?? (0, n.createEngineSubtitleAuthority)(p),
          engineReadiness: {
            translation: _ ? "ready" : "pending",
            tts: u?.engineReadiness?.tts ?? "not_requested"
          },
          index: i.index,
          startTime: i.startTime,
          endTime: i.endTime,
          originalText: c,
          translatedText: _ ? i.text : u?.translatedText ?? "",
          excluded: u?.excluded === !0,
          confidence: u?.confidence ?? 1,
          style: u?.style ?? {
            ...t
          }
        };
      return u ? (0, n.mergeEngineCueIntoAuthoredSubtitle)(u, f, u.fieldAuthority) : f
    }).sort((e, t) => e.startTime - t.startTime || e.index - t.index).map((e, t) => ({
      ...e,
      index: t + 1
    }))
  }
  e.s(["buildUnifiedSubtitles", 0, c, "canonicalSubtitleWriteWouldShrink", 0, function(e, t) {
    return s(e).length > t
  }, "parseSrtEntries", 0, o], 56583);
  var p = e.i(9628);
  async function g(e) {
    return (0, i.readManagedTextFile)(e)
  }
  async function h(e, i) {
    if (!e || !await (0, t.fileExists)(e)) return [];
    try {
      return o(await g(e))
    } catch (e) {
      return console.warn(`Failed to read ${i} subtitle:`, e), []
    }
  }

  function m(e) {
    if (!e || "object" != typeof e || Array.isArray(e)) return null;
    let t = e.voiceIndex ?? e.voice_index,
      i = e.displayIndex ?? e.display_index,
      n = e.sourceIndex ?? e.source_index;
    return "number" == typeof t && "number" == typeof i && "number" == typeof n && Number.isFinite(t) && Number.isFinite(i) && Number.isFinite(n) ? {
      voiceIndex: t,
      displayIndex: i,
      sourceIndex: n
    } : null
  }
  async function f(e) {
    if (!e || !await (0, t.fileExists)(e)) return [];
    try {
      let t = JSON.parse(await g(e));
      return Array.isArray(t.cues) ? t.cues.map(m).filter(e => null !== e) : []
    } catch (e) {
      return console.warn("Failed to read subtitle alignment:", e), []
    }
  }

  function _(e) {
    return e.display_subtitle_path ?? e.subtitle_path
  }

  function v(e) {
    return e.sourceSubtitlePath
  }

  function b(e) {
    return e.voiceSubtitlePath ?? e.displaySubtitlePath ?? e.translatedSubtitlePath
  }

  function S(e) {
    return !!(e.sourceSubtitlePath || e.alignedSourceSubtitlePath || e.subtitleAlignmentPath || e.displaySubtitlePath || e.voiceSubtitlePath || e.translatedSubtitlePath)
  }
  async function y(e) {
    if (e && await (0, t.fileExists)(e)) try {
      let i = JSON.parse(await g(e)),
        n = "string" == typeof i.aligned_source_subtitle_path ? i.aligned_source_subtitle_path.trim() : "",
        a = "string" == typeof i.subtitle_alignment_path ? i.subtitle_alignment_path.trim() : "";
      return {
        alignedSourceSubtitlePath: n && await (0, t.fileExists)(n) ? n : void 0,
        subtitleAlignmentPath: a && await (0, t.fileExists)(a) ? a : void 0
      }
    } catch (e) {
      console.warn("Failed to read subtitle artifact paths from translation debug:", e)
    }
  }
  async function P(e) {
    return (await y(e))?.alignedSourceSubtitlePath
  }
  async function T(e) {
    let i = e.aligned_source_subtitle_path?.trim();
    return i && await (0, t.fileExists)(i) ? i : P(e.translation_debug_path)
  }

  function w(e, t) {
    let i = t.filter(e => !0 === e.excluded).map(e => ({
      startTime: e.startTime,
      endTime: e.endTime
    }));
    return 0 === i.length ? e : e.map(e => ({
      ...e,
      excluded: !0 === e.excluded || i.some(t => e.startTime < t.endTime && e.endTime > t.startTime)
    }))
  }
  async function x({
    sourceSubtitlePath: t,
    displaySubtitlePath: i,
    renderSubtitlePath: n,
    subtitleAlignmentPath: a,
    videoId: r
  }) {
    if (!t && !i && !n) return !1;
    let {
      useSubtitleStore: o
    } = await e.A(5990), {
      useVideoStore: s
    } = await e.A(82855), l = o.getState(), d = s.getState().videos.find(e => e.id === r)?.excludedSubtitleFingerprints, u = l.subtitles.filter(e => e.videoId === r), g = [], m = [], _ = [];
    g = await h(t, "source"), m = await h(i, "display"), _ = await h(n, "render");
    let v = await f(a);
    if (0 === g.length && 0 === m.length && 0 === _.length) return !1;
    let b = (0, p.applySubtitleExclusions)(u, d);
    if ((g.length > 0 || m.length > 0) && (b = (0, p.applySubtitleExclusions)(c({
        videoId: r,
        style: l.globalStyle,
        sourceEntries: g,
        translatedEntries: m,
        alignmentCues: v,
        existingSubtitles: u
      }), d), l.replaceVideoSubtitles(r, b)), _.length > 0) {
      let e = (0, p.applySubtitleExclusions)(c({
        videoId: r,
        style: l.globalStyle,
        sourceEntries: g,
        translatedEntries: _,
        alignmentCues: v,
        existingSubtitles: []
      }), d);
      l.replaceVideoRenderSubtitles(r, w(e, b))
    } else l.clearVideoRenderSubtitles(r);
    return !0
  }
  async function I(e, t) {
    return x({
      sourceSubtitlePath: e.source_subtitle_path,
      displaySubtitlePath: e.voice_subtitle_path ?? _(e),
      renderSubtitlePath: _(e),
      videoId: t
    })
  }
  async function E(e) {
    try {
      return await x({
        sourceSubtitlePath: v(e),
        displaySubtitlePath: b(e),
        renderSubtitlePath: e.displaySubtitlePath,
        subtitleAlignmentPath: e.subtitleAlignmentPath,
        videoId: e.id
      })
    } catch (e) {
      return console.warn("Failed to refresh project subtitle artifacts:", e), !1
    }
  }
  async function A(t) {
    let {
      useSubtitleStore: i
    } = await e.A(5990), n = i.getState(), a = n.subtitles.filter(e => e.videoId === t.id), [r, o, s, l] = await Promise.all([h(v(t), "source"), h(b(t), "display"), h(t.displaySubtitlePath, "render"), f(t.subtitleAlignmentPath)]);
    if (0 === r.length || 0 === o.length) throw Object.assign(Error("terminal subtitle artifacts are incomplete"), {
      code: "terminal_project_subtitle_artifacts_incomplete",
      fallbackAllowed: !1
    });
    let d = (0, p.applySubtitleExclusions)(c({
        videoId: t.id,
        style: n.globalStyle,
        sourceEntries: r,
        translatedEntries: o,
        alignmentCues: l,
        existingSubtitles: a
      }), t.excludedSubtitleFingerprints),
      u = s.length > 0 ? w((0, p.applySubtitleExclusions)(c({
        videoId: t.id,
        style: n.globalStyle,
        sourceEntries: r,
        translatedEntries: s,
        alignmentCues: l,
        existingSubtitles: []
      }), t.excludedSubtitleFingerprints), d) : [];
    return {
      subtitles: d,
      renderSubtitles: u
    }
  }
  async function k(t) {
    if (!S(t)) return !1;
    let {
      useSubtitleStore: i
    } = await e.A(5990), n = i.getState();
    return !!(n.subtitles.some(e => e.videoId === t.id) || n.renderSubtitles.some(e => e.videoId === t.id)) || E(t)
  }
  async function V(t, i) {
    let {
      useSubtitleStore: n
    } = await e.A(5990), a = n.getState(), r = a.subtitles.filter(e => e.videoId === i), s = o(await g(t));
    return 0 !== s.length && (a.replaceVideoSubtitles(i, c({
      videoId: i,
      style: a.globalStyle,
      sourceEntries: s,
      translatedEntries: [],
      existingSubtitles: r
    })), !0)
  }
  async function N(e) {
    if (e.alignedSourceSubtitlePath && e.subtitleAlignmentPath || !e.translationDebugPath) return e;
    if (!await (0, t.fileExists)(e.translationDebugPath)) return {
      ...e,
      translationDebugPath: void 0
    };
    let i = await y(e.translationDebugPath),
      n = e.alignedSourceSubtitlePath ?? i?.alignedSourceSubtitlePath,
      a = e.subtitleAlignmentPath ?? i?.subtitleAlignmentPath;
    return n || a ? {
      ...e,
      alignedSourceSubtitlePath: n,
      subtitleAlignmentPath: a
    } : e
  }
  e.s(["alignedSourceSubtitlePathForJob", 0, T, "buildVideoSubtitleArtifactProjection", 0, A, "displaySubtitlePathForJob", 0, _, "ensureAlignedSourceSubtitlePath", 0, N, "ensureVideoSubtitleArtifactsHydrated", 0, k, "readOptionalSrtEntries", 0, h, "syncGpuSubtitleToTimeline", 0, V, "syncLocalEngineSubtitlesToTimeline", 0, I, "syncSubtitleArtifactsToTimeline", 0, x, "videoHasSubtitleArtifacts", 0, S], 21193)
}, 62686, e => {
  "use strict";
  var t = e.i(48357);
  let i = new Set(["importing", "extracting_audio", "transcribing", "translating", "generating_tts", "exporting"]);

  function n(e) {
    if (!e) return;
    let t = e instanceof Date ? e : new Date(String(e));
    return Number.isNaN(t.getTime()) ? void 0 : t
  }

  function a(e) {
    return {
      ...e,
      sourceMode: e.sourceMode ?? "linked",
      sourceMissing: !!e.sourceMissing,
      addedAt: e.addedAt instanceof Date ? e.addedAt : new Date(e.addedAt),
      finalExportedAt: n(e.finalExportedAt),
      processingStartedAt: n(e.processingStartedAt),
      processingCompletedAt: n(e.processingCompletedAt)
    }
  }
  let r = ["thumbnail", "previewVideoPath", "previewSourcePath", "draftVideoPath", "translatedVideoPath", "cuePreviewPlanPath", "cuePreviewTimelineVideoPath", "projectAudioPreviewCarrierPath", "finalExportPath", "translatedSubtitlePath", "sourceSubtitlePath", "alignedSourceSubtitlePath", "subtitleAlignmentPath", "displaySubtitlePath", "voiceSubtitlePath", "translationDebugPath", "performanceTracePath", "supportBundlePath", "ttsTimelineAudioPath", "ttsManifestPath", "dubbingTimelineVideoPath", "srtAudioOutputPath"];
  e.s(["PROCESSING_VIDEO_STATUSES", 0, i, "PROJECT_ARTIFACT_PATH_KEYS", 0, r, "applyProcessingStatusTimestamps", 0, function(e, t, a = new Date) {
    let r = n(e.processingStartedAt);
    if (i.has(t)) {
      let n = !r || !i.has(e.status);
      return {
        ...e,
        status: t,
        processingStartedAt: n ? a : r,
        processingCompletedAt: void 0,
        processingDurationMs: void 0,
        processingError: void 0,
        processingErrorCode: void 0,
        processingErrorDetail: void 0
      }
    }
    if ("completed" === t) {
      let i = r ? Math.max(0, a.getTime() - r.getTime()) : e.processingDurationMs;
      return {
        ...e,
        status: t,
        processingStartedAt: r,
        processingCompletedAt: a,
        processingDurationMs: i,
        processingError: void 0,
        processingErrorCode: void 0,
        processingErrorDetail: void 0
      }
    }
    if ("error" === t) {
      let i = r ? Math.max(0, a.getTime() - r.getTime()) : e.processingDurationMs;
      return {
        ...e,
        status: t,
        processingStartedAt: r,
        processingCompletedAt: a,
        processingDurationMs: i,
        processingError: e.processingError,
        processingErrorCode: e.processingErrorCode,
        processingErrorDetail: e.processingErrorDetail
      }
    }
    return {
      ...e,
      status: t,
      processingError: void 0,
      processingErrorCode: void 0,
      processingErrorDetail: void 0
    }
  }, "mergeHydratedProjectVideo", 0, function(e, t) {
    return a({
      ...e,
      ...t,
      thumbnail: t.thumbnail,
      previewVideoPath: t.previewVideoPath,
      previewSourcePath: t.previewSourcePath,
      draftVideoPath: t.draftVideoPath,
      translatedVideoPath: t.translatedVideoPath,
      nleDocument: t.nleDocument,
      cuePreviewPlanPath: t.cuePreviewPlanPath,
      cuePreviewPlanHash: t.cuePreviewPlanHash,
      cuePreviewSchemaVersion: t.cuePreviewSchemaVersion,
      cuePreviewCueCount: t.cuePreviewCueCount,
      cuePreviewGeneration: t.cuePreviewGeneration,
      cuePreviewArchitecture: t.cuePreviewArchitecture,
      cuePreviewTimelineVideoPath: t.cuePreviewTimelineVideoPath,
      cuePreviewJobId: t.cuePreviewJobId,
      cuePreviewOriginalVolume: t.cuePreviewOriginalVolume,
      cuePreviewTranslatedVolume: t.cuePreviewTranslatedVolume,
      nativeProjectReadiness: t.nativeProjectReadiness,
      projectAudioTrack: t.projectAudioTrack,
      projectAudioPreviewCarrierPath: t.projectAudioPreviewCarrierPath,
      projectTempoMarkerCueIds: t.projectTempoMarkerCueIds,
      finalExportPath: t.finalExportPath,
      projectType: t.projectType,
      sourceKind: t.sourceKind,
      translatedSubtitlePath: t.translatedSubtitlePath,
      sourceSubtitlePath: t.sourceSubtitlePath,
      alignedSourceSubtitlePath: t.alignedSourceSubtitlePath,
      subtitleAlignmentPath: t.subtitleAlignmentPath,
      displaySubtitlePath: t.displaySubtitlePath,
      voiceSubtitlePath: t.voiceSubtitlePath,
      translationDebugPath: t.translationDebugPath,
      performanceTracePath: t.performanceTracePath,
      supportBundlePath: t.supportBundlePath,
      ttsAudioFiles: function(e, t) {
        if (!t.cuePreviewPlanPath) return t.ttsAudioFiles && t.ttsAudioFiles.length > 0 ? t.ttsAudioFiles : e?.ttsAudioFiles ?? t.ttsAudioFiles
      }(e, t),
      ttsTimelineAudioPath: t.ttsTimelineAudioPath,
      ttsManifestPath: t.ttsManifestPath,
      srtAudioOutputPath: t.srtAudioOutputPath,
      projectRoot: t.projectRoot,
      sourceMode: "linked",
      sourceMissing: t.sourceMissing,
      processingStartedAt: t.processingStartedAt ?? e?.processingStartedAt,
      processingCompletedAt: t.processingCompletedAt ?? e?.processingCompletedAt,
      processingDurationMs: t.processingDurationMs ?? e?.processingDurationMs,
      processingError: t.processingError ?? e?.processingError,
      billingScopeJobId: t.billingScopeJobId ?? e?.billingScopeJobId,
      lastAuthorizedJobId: t.lastAuthorizedJobId ?? e?.lastAuthorizedJobId,
      billingSourceVideoSeconds: t.billingSourceVideoSeconds ?? e?.billingSourceVideoSeconds,
      billingChargedSeconds: t.billingChargedSeconds ?? e?.billingChargedSeconds,
      billingNonRefundableSeconds: t.billingNonRefundableSeconds ?? e?.billingNonRefundableSeconds,
      billingTargetLanguage: t.billingTargetLanguage ?? e?.billingTargetLanguage,
      billingTtsProvider: t.billingTtsProvider ?? e?.billingTtsProvider,
      billingAuthorizationPending: t.billingAuthorizationPending,
      billingAuthorizationRequestKeyHash: t.billingAuthorizationRequestKeyHash,
      nativeTtsProvider: t.nativeTtsProvider ?? e?.nativeTtsProvider,
      nativeTtsVoice: t.nativeTtsVoice ?? e?.nativeTtsVoice,
      originalAudioStrategy: t.originalAudioStrategy ?? e?.originalAudioStrategy,
      originalAudioVolume: t.originalAudioVolume ?? e?.originalAudioVolume,
      exportWatermarkPolicy: t.exportWatermarkPolicy ?? e?.exportWatermarkPolicy,
      dubbingTimeline: t.dubbingTimeline ?? e?.dubbingTimeline,
      dubbingTimelineVideoPath: t.dubbingTimelineVideoPath ?? e?.dubbingTimelineVideoPath,
      excludedSubtitleFingerprints: t.excludedSubtitleFingerprints ?? e?.excludedSubtitleFingerprints
    })
  }, "normalizeHydratedProcessingStatus", 0, function(e, n, r) {
    return !i.has(n.status) || r && i.has(e?.status) ? n : (0, t.normalizeDesktopProcessingSession)(n.processingSession) ? a({
      ...n,
      processingError: void 0,
      processingErrorCode: void 0,
      processingErrorDetail: void 0
    }) : a({
      ...n,
      status: "error",
      processingError: n.processingError ?? "Lần xử lý trước đã dừng trước khi hoàn tất. Hãy xử lý lại video hoặc xóa project này khỏi lịch sử."
    })
  }, "projectArtifactPathsChanged", 0, function(e, t) {
    return r.some(i => e[i] !== t[i]) || function(e, t) {
      if (!e && !t) return !1;
      let i = e ?? [],
        n = t ?? [];
      return i.length !== n.length || i.some((e, t) => e !== n[t])
    }(e.ttsAudioFiles, t.ttsAudioFiles)
  }, "toOptionalDate", 0, n, "toVideoFile", 0, a])
}, 7165, 4653, e => {
  "use strict";

  function t(e, ...i) {
    let n = e.includes("\\") ? "\\" : "/";
    return [e.replace(/[\\/]+$/, ""), ...i.map(e => e.replace(/^[\\/]+|[\\/]+$/g, ""))].filter(Boolean).join(n)
  }

  function i(e) {
    if (!e?.trim()) return null;
    let t = e.trim().replace(/[\\/]+$/, ""),
      i = Math.max(t.lastIndexOf("\\"), t.lastIndexOf("/"));
    if (i < 0) return null;
    if (0 === i) return t.slice(0, 1);
    let n = t.slice(0, i + 1);
    return /^[a-zA-Z]:[\\/]$/.test(n) ? n : t.slice(0, i)
  }
  e.s(["cleanLocalPath", 0, function(e) {
    return "string" == typeof e && e.trim().length > 0 ? e.trim() : void 0
  }, "joinLocalPath", 0, t, "localPathParent", 0, function(e) {
    let t = e.trim(),
      i = Math.max(t.lastIndexOf("\\"), t.lastIndexOf("/"));
    return i > 0 ? t.slice(0, i) : ""
  }, "uniqueDefinedPaths", 0, function(e) {
    return Array.from(new Set(e.map(e => e?.trim()).filter(e => !!e)))
  }], 4653), e.s(["nativeVnextRunDirFromArtifactPath", 0, function(e) {
    if (!e?.trim()) return null;
    let t = e.trim().replace(/\\/g, "/"),
      i = "/native-vnext/",
      n = t.toLowerCase().indexOf(i);
    if (n < 0) return null;
    let a = t.slice(n + i.length),
      r = a.split("/")[0]?.trim();
    return r && "." !== r && ".." !== r ? t.slice(0, n + i.length + r.length) : null
  }, "parentDirectoryFromPath", 0, i, "pushCleanupCandidate", 0, function(e, t) {
    t && t.trim() && e.push(t)
  }, "srtAudioWorkDirFromOutputPath", 0, function(e) {
    let n = i(e);
    return n ? t(n, `${function(e){if(!e?.trim())return null;let t=e.trim().replace(/[\\/]+$/,""),i=Math.max(t.lastIndexOf("\\"),t.lastIndexOf("/")),n=i>=0?t.slice(i+1):t,a=n.lastIndexOf(".");return(a>0?n.slice(0,a):n).trim()||null}(e)??"srt_audio"}_dichvideo_srt_audio`) : null
  }, "uniqueCleanupPaths", 0, function(e) {
    return Array.from(new Set(e.map(e => e?.trim()).filter(e => !!e)))
  }], 7165)
}, 4174, 27895, e => {
  "use strict";
  e.i(89268);
  var t = e.i(81341),
    i = e.i(63126),
    n = e.i(62686),
    a = e.i(7165),
    r = e.i(4653);
  async function o(e) {
    let i = e?.trim();
    if (i) return await (0, t.fileExists)(i) ? i : void 0
  }
  async function s(e) {
    return e ? Promise.all(e.map(async e => {
      let i = e?.trim();
      return i && await (0, t.fileExists)(i) ? i : ""
    })) : e
  }
  async function l(e) {
    let t = await Promise.all(n.PROJECT_ARTIFACT_PATH_KEYS.map(async t => [t, await o(e[t])]));
    return (0, n.toVideoFile)({
      ...e,
      ...Object.fromEntries(t),
      ttsAudioFiles: await s(e.ttsAudioFiles)
    })
  }
  async function d(e) {
    let t = await (0, i.getManagedPaths)(),
      n = [],
      o = [],
      s = [];
    for (let t of ((0, a.pushCleanupCandidate)(n, e.thumbnail), (0, a.pushCleanupCandidate)(n, e.previewVideoPath), (0, a.pushCleanupCandidate)(n, e.previewSourcePath), (0, a.pushCleanupCandidate)(n, e.translatedVideoPath), (0, a.pushCleanupCandidate)(n, e.translatedSubtitlePath), (0, a.pushCleanupCandidate)(n, e.sourceSubtitlePath), (0, a.pushCleanupCandidate)(n, e.alignedSourceSubtitlePath), (0, a.pushCleanupCandidate)(n, e.subtitleAlignmentPath), (0, a.pushCleanupCandidate)(n, e.displaySubtitlePath), (0, a.pushCleanupCandidate)(n, e.voiceSubtitlePath), (0, a.pushCleanupCandidate)(n, e.translationDebugPath), (0, a.pushCleanupCandidate)(n, e.performanceTracePath), (0, a.pushCleanupCandidate)(n, e.srtAudioOutputPath), (0, a.pushCleanupCandidate)(n, e.srtAudioTtsManifestPath), (0, a.pushCleanupCandidate)(n, e.srtAudioAudioManifestPath), e.ttsAudioFiles ?? []))(0, a.pushCleanupCandidate)(n, t);
    (0, a.pushCleanupCandidate)(n, e.ttsTimelineAudioPath), (0, a.pushCleanupCandidate)(n, e.ttsManifestPath), (0, a.pushCleanupCandidate)(n, e.dubbingTimelineVideoPath), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.performanceTracePath)), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.ttsManifestPath)), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.displaySubtitlePath)), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.voiceSubtitlePath)), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.dubbingTimelineVideoPath)), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.translatedVideoPath)), (0, a.pushCleanupCandidate)(o, (0, a.nativeVnextRunDirFromArtifactPath)(e.draftVideoPath));
    let l = u(e);
    for (let i of (l && (0, a.pushCleanupCandidate)(o, `${t.output}/native-vnext/${l}`), function(e, t) {
        let i = u(e);
        if (!i) return [];
        let n = e.projectRoot?.trim() || (0, r.joinLocalPath)(t.projects, e.id),
          o = (0, r.joinLocalPath)(n, "native-vnext", i);
        return (0, a.uniqueCleanupPaths)([(0, r.joinLocalPath)(o, "preview/"), (0, r.joinLocalPath)(o, "preview-render"), (0, r.joinLocalPath)(o, "tts"), (0, r.joinLocalPath)(o, "source-separation", "background"), (0, r.joinLocalPath)(o, "timeline"), (0, r.joinLocalPath)(o, "retime"), (0, r.joinLocalPath)(o, "exports")])
      }(e, t)))(0, a.pushCleanupCandidate)(o, i);
    return (0, a.pushCleanupCandidate)(s, (0, a.parentDirectoryFromPath)(e.srtAudioOutputPath)), (0, a.pushCleanupCandidate)(o, e.srtAudioWorkDir ?? (0, a.srtAudioWorkDirFromOutputPath)(e.srtAudioOutputPath)), (0, a.pushCleanupCandidate)(o, `${t.projects}/${e.id}`), (0, a.pushCleanupCandidate)(o, `${t.temp}/tts_${e.id}`), {
      project_id: e.id,
      file_paths: (0, a.uniqueCleanupPaths)(n),
      directory_paths: (0, a.uniqueCleanupPaths)(o),
      empty_directory_paths: (0, a.uniqueCleanupPaths)(s),
      protected_paths: (0, a.uniqueCleanupPaths)([e.path, e.finalExportPath])
    }
  }

  function u(e) {
    let t = (e.cuePreviewJobId ?? e.lastAuthorizedJobId ?? e.billingScopeJobId)?.trim();
    return !t || "." === t || ".." === t || /[\\/]/.test(t) ? null : t
  }

  function c(e) {
    if (!e) return null;
    let t = (e instanceof Date ? e : new Date(e)).getTime();
    return Number.isFinite(t) ? t : null
  }

  function p(e) {
    return "number" == typeof e && Number.isFinite(e) && e > 0 ? Math.round(e) : 0
  }

  function g(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : null
  }
  e.s(["buildProjectCleanupRequest", 0, d, "pruneMissingProjectArtifactFiles", 0, l], 4174), e.s(["formatProcessingDurationLabel", 0, function(e) {
    let t = function(e) {
      if ("number" == typeof e.processingDurationMs && e.processingDurationMs > 0) return Math.round(e.processingDurationMs);
      let t = c(e.processingStartedAt),
        i = c(e.processingCompletedAt);
      return null === t || null === i || i <= t ? null : i - t
    }(e);
    if (null === t) return null;
    let i = Math.max(1, Math.round(t / 1e3)),
      n = Math.floor(i / 3600),
      a = Math.floor(i % 3600 / 60),
      r = i % 60;
    return n > 0 ? a > 0 ? `${n} giờ ${a} ph\xfat` : `${n} giờ` : a > 0 ? r > 0 ? `${a} ph\xfat ${r} gi\xe2y` : `${a} ph\xfat` : `${r} gi\xe2y`
  }, "getProcessingDurationMsFromTrace", 0, function(e) {
    let t = g(e);
    if (!t) return null;
    let i = p(t.total_ms ?? t.total_wall_ms ?? t.wall_ms);
    if (i > 0) return i;
    let n = g(t.timings_ms);
    if (n) {
      let e = Object.values(n).reduce((e, t) => e + p(t), 0);
      return e > 0 ? e : null
    }
    let a = g(t.pipeline_timings_ms);
    if (a) {
      let e = p(a.translation_tts_pipeline_ms);
      return e > 0 ? e : null
    }
    return null
  }], 27895)
}, 1885, e => {
  "use strict";
  e.i(89268);
  var t = e.i(7787),
    i = e.i(51026),
    n = e.i(30148);

  function a(e) {
    return "needs_review" === e.status
  }

  function r(e) {
    return void 0 === l(e.outputVideoPath) && void 0 !== l(e.cuePreviewPlanPath) && void 0 !== l(e.timelineVideoPath) && /^sha256:[0-9a-f]{64}$/.test(e.cuePreviewPlanHash ?? "") && "native-cue-preview-plan-v2" === e.cuePreviewSchemaVersion && Number.isSafeInteger(e.cuePreviewCueCount) && (e.cuePreviewCueCount ?? 0) > 0 && Number.isSafeInteger(e.cuePreviewGeneration) && (e.cuePreviewGeneration ?? 0) > 0 && ("cue_window_v1" === e.cuePreviewArchitecture || "chunk_cache_v1" === e.cuePreviewArchitecture) && void 0 !== l(e.cuePreviewJobId) && u(e.cuePreviewOriginalVolume, 1) && u(e.cuePreviewTranslatedVolume, 5)
  }

  function o(e) {
    var t;
    let i = e.completedSettlement,
      n = i?.timingAuthority ?? e.readiness?.timingAuthority;
    return !0 === e.nativePipeline && "completed" === e.status && void 0 === l(e.outputVideoPath) && e.readiness?.readyForEdit === !0 && void 0 !== l(e.terminalGenerationId) && void 0 !== l(e.terminalSnapshotHash) && "string" == typeof i?.projectId && i.projectId.length > 0 && i?.terminalGenerationId === e.terminalGenerationId && i?.terminalSnapshotHash === e.terminalSnapshotHash && !!((t = n) && "object" == typeof t && /^generation:[0-9a-f]{64}$/.test(String(t.generationId)) && /^sha256:[0-9a-f]{64}$/.test(String(t.planHash)) && /^sha256:[0-9a-f]{64}$/.test(String(t.timelineStateHash)))
  }

  function s(e, t, i) {
    let n = d(e);
    return void 0 !== n && n >= t && n <= i ? n : null
  }

  function l(e) {
    return "string" == typeof e && e.trim().length > 0 ? e.trim() : void 0
  }

  function d(e) {
    return "number" == typeof e && Number.isFinite(e) ? e : void 0
  }

  function u(e, t) {
    return "number" == typeof e && Number.isFinite(e) && e >= 0 && e <= t
  }

  function c(e) {
    let t = l(e);
    return t ? t.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "").toLowerCase() : ""
  }

  function p(e) {
    let t = c(e),
      i = t.lastIndexOf("/");
    return i > 0 ? t.slice(0, i) : ""
  }

  function g(e) {
    return e ? e.split(/[\\/]/).filter(Boolean).pop()?.toLowerCase() ?? "" : ""
  }

  function h(e) {
    return /\.native-vnext\.mp4$/i.test(g(e))
  }

  function m(e, t) {
    return !t || !h(t) || function(e, t) {
      if (!t || !h(t)) return !0;
      let i = p(e.performanceTracePath);
      if (!i) return !0;
      let n = p(t);
      return n === i || n.startsWith(`${i}/`)
    }(e, t) ? "" : c(t)
  }

  function f(e) {
    if (!e) return 0;
    let t = e instanceof Date ? e.getTime() : Date.parse(e);
    return Number.isFinite(t) ? t : 0
  }

  function _(e) {
    return Math.max(f(e.processingCompletedAt), f(e.projectManifestUpdatedAt), f(e.addedAt))
  }

  function v(e) {
    return /^draft_read_again_\d+\.mp4$/i.test(g(e))
  }
  e.s(["clearSharedNativeVnextOutputArtifacts", 0, function(e) {
    let t = new Map;
    e.forEach((e, i) => {
      for (let n of new Set([e.translatedVideoPath, e.draftVideoPath].map(t => m(e, t)).filter(Boolean))) {
        let a = t.get(n) ?? [];
        a.push({
          index: i,
          video: e
        }), t.set(n, a)
      }
    });
    let i = new Map;
    for (let [e, n] of t) {
      if (n.length <= 1) continue;
      let t = n.reduce((e, t) => {
        let i = _(e.video),
          n = _(t.video);
        return n > i || n === i && t.index > e.index ? t : e
      });
      i.set(e, t.index)
    }
    return e.map((e, t) => {
      let n = m(e, e.translatedVideoPath),
        a = m(e, e.draftVideoPath),
        r = !!(n && i.has(n) && i.get(n) !== t),
        o = !!(a && i.has(a) && i.get(a) !== t);
      return r || o ? {
        ...e,
        translatedVideoPath: r ? void 0 : e.translatedVideoPath,
        draftVideoPath: o ? void 0 : e.draftVideoPath
      } : e
    })
  }, "nativeDirectTerminalV2SettlementMatches", 0, function(e, t, i, n) {
    let a = e.completedSettlement;
    return o(e) && a?.schemaVersion === "completed-settlement-receipt-v1" && a?.projectId === t && a.jobId === i && a.leaseGeneration === n && /^terminal:[0-9a-f]{64}$/.test(e.terminalGenerationId ?? "") && /^sha256:[0-9a-f]{64}$/.test(e.terminalSnapshotHash ?? "") && a.terminalGenerationId === e.terminalGenerationId && a.terminalSnapshotHash === e.terminalSnapshotHash
  }, "nativeVnextCompletedVideoPatch", 0, function({
    response: e,
    exportWatermarkPolicy: u,
    ttsProvider: c,
    ttsVoice: p,
    dubbingTimeline: g,
    originalAudioPolicy: h
  }) {
    let m, f = a(e),
      _ = !f && e.nleDocument ? {
        ...m = (0, n.decodeNleDocument)(e.nleDocument),
        previewProjection: (0, n.decodeNlePreviewProjection)(e.nlePreviewProjection, m.revision)
      } : void 0,
      v = !f && r(e),
      b = !f && o(e),
      S = function(e) {
        if (!e || "source_timeline" === e.mode) return {
          mode: "source_timeline"
        };
        if ("fixed_voice_speed" === e.mode) {
          let t = e.requestedVoiceRateTenths;
          return "project-fixed-voice-rate-v2" === e.fixedVoiceRateSchema ? Number.isInteger(t) && t >= 10 && t <= 20 ? {
            mode: "fixed_voice_speed",
            requestedVoiceRateTenths: t
          } : {
            mode: "source_timeline"
          } : null != e.fixedVoiceRateSchema ? {
            mode: "source_timeline"
          } : Number.isInteger(t) && t >= 10 && t <= 15 ? {
            mode: "fixed_voice_speed",
            requestedVoiceRateTenths: t
          } : Number.isInteger(t) && t >= 16 && t <= 18 ? {
            mode: "fixed_voice_speed",
            requestedVoiceRateTenths: 15
          } : {
            mode: "source_timeline"
          }
        }
        if ("hybrid_stretch" !== e.mode) return {
          mode: "source_timeline"
        };
        let t = s(e.targetTempo, 1, 1.8),
          i = s(e.maxVideoSlowdown, 1, 3),
          n = s(e.maxTotalStretchRatio, 1, 3);
        if (null === t || null === i || null === n) return {
          mode: "source_timeline"
        };
        if ("current_preset" === e.timingIntent) return "hybrid_1_25" !== e.presetId && "hybrid_1_4" !== e.presetId || t !== ("hybrid_1_25" === e.presetId ? 1.25 : 1.4) || 3 !== i || 3 !== n ? {
          mode: "source_timeline"
        } : {
          mode: "fixed_voice_speed",
          requestedVoiceRateTenths: "hybrid_1_25" === e.presetId ? 12 : 14
        };
        if ("historical_numeric" !== e.timingIntent || null != e.presetId) return {
          mode: "source_timeline"
        };
        if (1.25 === t) return {
          mode: "fixed_voice_speed",
          requestedVoiceRateTenths: 12
        };
        if (1.45 === t || 1.4 === t) return {
          mode: "fixed_voice_speed",
          requestedVoiceRateTenths: 14
        };
        if (1.6 === t || 1.7 === t || 1.8 === t) return {
          mode: "fixed_voice_speed",
          requestedVoiceRateTenths: 15
        };
        let a = Math.round(10 * t);
        return 10 * t === a && a >= 10 && a <= 15 ? {
          mode: "fixed_voice_speed",
          requestedVoiceRateTenths: a
        } : {
          mode: "source_timeline"
        }
      }(g),
      y = f ? void 0 : (0, i.dubbingTimelineResultFromNativeMetrics)(e.metrics);
    return {
      nleDocument: _,
      draftVideoPath: f ? void 0 : e.outputVideoPath ?? void 0,
      translatedVideoPath: f ? void 0 : e.outputVideoPath ?? void 0,
      outputDuration: f ? void 0 : d(e.metrics?.output_duration_seconds),
      dubbingTimelineResult: y,
      translatedSubtitlePath: e.voiceSubtitlePath ?? e.subtitlePath ?? e.displaySubtitlePath ?? void 0,
      sourceSubtitlePath: e.sourceSubtitlePath ?? void 0,
      alignedSourceSubtitlePath: e.alignedSourceSubtitlePath ?? void 0,
      subtitleAlignmentPath: e.subtitleAlignmentPath ?? void 0,
      displaySubtitlePath: e.displaySubtitlePath ?? e.subtitlePath ?? void 0,
      voiceSubtitlePath: e.voiceSubtitlePath ?? void 0,
      translationDebugPath: e.translationDebugPath ?? void 0,
      performanceTracePath: e.performanceTracePath ?? void 0,
      ttsManifestPath: f ? void 0 : e.ttsManifestPath ?? void 0,
      ...v ? {
        ttsAudioFiles: void 0,
        ttsTimelineAudioPath: void 0
      } : {},
      cuePreviewPlanPath: v ? l(e.cuePreviewPlanPath) : void 0,
      cuePreviewPlanHash: v ? e.cuePreviewPlanHash ?? void 0 : void 0,
      cuePreviewSchemaVersion: v ? "native-cue-preview-plan-v2" : void 0,
      cuePreviewCueCount: v ? e.cuePreviewCueCount ?? void 0 : void 0,
      cuePreviewGeneration: v ? e.cuePreviewGeneration ?? void 0 : void 0,
      cuePreviewArchitecture: v ? e.cuePreviewArchitecture ?? void 0 : void 0,
      cuePreviewTimelineVideoPath: v ? l(e.timelineVideoPath) : void 0,
      cuePreviewJobId: v ? l(e.cuePreviewJobId) : void 0,
      cuePreviewOriginalVolume: v ? e.cuePreviewOriginalVolume ?? void 0 : void 0,
      cuePreviewTranslatedVolume: v ? e.cuePreviewTranslatedVolume ?? void 0 : void 0,
      nativeProjectReadiness: (v || b) && e.readiness?.readyForEdit ? e.readiness : void 0,
      projectAudioTrack: (v || b) && e.projectAudio ? (0, t.sanitizeProjectAudioTrackStateProjection)(e.projectAudio) : void 0,
      projectAudioPreviewCarrierPath: v && e.projectAudio ? l(e.timelineVideoPath) : void 0,
      activeTerminalGeneration: b ? l(e.terminalGenerationId) : void 0,
      completedSettlement: b ? e.completedSettlement ?? void 0 : void 0,
      processingError: f ? "Bản dịch cần kiểm tra thủ công. Hãy sửa phụ đề rồi tạo lại giọng đọc." : void 0,
      finalExportPath: void 0,
      finalExportedAt: void 0,
      finalExportHasSubtitles: void 0,
      finalExportHasWatermark: void 0,
      finalExportHasOverlays: void 0,
      subtitlesBurnedIntoVideo: !1,
      exportWatermarkPolicy: u,
      projectAuthorizationReceipt: void 0,
      editedSubtitleTtsDirty: !1,
      editedSubtitleTtsDirtyCaptionIds: [],
      nativeTtsProvider: l(c),
      nativeTtsVoice: l(p),
      originalAudioStrategy: h.strategy,
      originalAudioVolume: h.volume,
      dubbingTimeline: S,
      dubbingTimelineIntent: "fixed_voice_speed" === S.mode ? "current_preset" : void 0,
      dubbingTimelineVideoPath: y ? l(e.timelineVideoPath) : void 0
    }
  }, "nativeVnextNeedsReview", 0, a, "nativeVnextTraceArtifactsFromTrace", 0, function(e) {
    return !e || "object" != typeof e || Array.isArray(e) ? {} : {
      outputVideoPath: l(e.output_video_path),
      displaySubtitlePath: l(e.display_subtitle_path)
    }
  }, "repairNativeVnextOutputArtifactsFromTrace", 0, function(e, t) {
    var i;
    if ("completed" !== e.status) return e;
    let n = v(e.translatedVideoPath),
      a = v(e.draftVideoPath),
      r = (i = e.displaySubtitlePath, /^gpu_fast\.(?:srt|vtt|ass)$/i.test(g(i))),
      o = {
        ...e
      };
    return t.outputVideoPath && (!o.translatedVideoPath || n) && (o.translatedVideoPath = t.outputVideoPath), a && (o.draftVideoPath = void 0), t.displaySubtitlePath && (!o.displaySubtitlePath || r) && (o.displaySubtitlePath = t.displaySubtitlePath), o
  }, "reviewableNativeResponse", 0, function(e) {
    if (!0 === e.nativePipeline && "completed" === e.status) {
      try {
        if (e.nleDocument) {
          let t = (0, n.decodeNleDocument)(e.nleDocument);
          return (0, n.decodeNlePreviewProjection)(e.nlePreviewProjection, t.revision), !0
        }
      } catch {
        return !1
      }
      return void 0 !== l(e.outputVideoPath) || r(e) || o(e)
    }
    return !0 === e.nativePipeline && a(e) && !!(e.voiceSubtitlePath ?? e.subtitlePath ?? e.displaySubtitlePath)
  }])
}, 88016, 54221, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(63126),
    n = e.i(81341),
    a = e.i(27895),
    r = e.i(62686),
    o = e.i(1885),
    s = e.i(4653),
    l = e.i(7165);
  async function d(e) {
    return (0, i.readManagedTextFile)(e)
  }
  async function u(e) {
    if (e.processingDurationMs || "completed" !== e.status || !e.performanceTracePath) return e;
    if (!await (0, n.fileExists)(e.performanceTracePath)) return {
      ...e,
      performanceTracePath: void 0
    };
    try {
      let t = JSON.parse(await d(e.performanceTracePath)),
        i = (0, a.getProcessingDurationMsFromTrace)(t);
      if (!i) return e;
      let n = (0, r.toOptionalDate)(e.addedAt),
        o = n ? new Date(n.getTime() + i) : void 0;
      return {
        ...e,
        processingStartedAt: n ?? e.processingStartedAt,
        processingCompletedAt: o ?? e.processingCompletedAt,
        processingDurationMs: i
      }
    } catch (t) {
      return console.warn("Failed to backfill processing duration from performance trace:", t), e
    }
  }
  async function c(e) {
    if ("completed" !== e.status || !e.performanceTracePath || !await (0, n.fileExists)(e.performanceTracePath)) return e;
    try {
      let t = JSON.parse(await d(e.performanceTracePath)),
        i = (0, o.nativeVnextTraceArtifactsFromTrace)(t),
        a = i.outputVideoPath && await (0, n.fileExists)(i.outputVideoPath) ? i.outputVideoPath : void 0,
        r = i.displaySubtitlePath && await (0, n.fileExists)(i.displaySubtitlePath) ? i.displaySubtitlePath : void 0;
      return (0, o.repairNativeVnextOutputArtifactsFromTrace)(e, {
        outputVideoPath: a,
        displaySubtitlePath: r
      })
    } catch (t) {
      return console.warn("Failed to repair native vNext output artifacts from performance trace:", t), e
    }
  }
  async function p(e) {
    if ("completed" !== e.status || !e.performanceTracePath || !await (0, n.fileExists)(e.performanceTracePath)) return e;
    try {
      let n = JSON.parse(await d(e.performanceTracePath)),
        a = function(e, t) {
          if (!e.performanceTracePath || !t || "object" != typeof t || Array.isArray(t) || !0 !== t.effective_watermark_required) return null;
          let i = (0, s.localPathParent)(e.performanceTracePath);
          return i ? {
            project_id: e.id,
            file_paths: (0, s.uniqueDefinedPaths)([(0, s.cleanLocalPath)(t.native_audio_path), (0, s.joinLocalPath)(i, "tts", "native-audio.m4a"), e.ttsManifestPath, (0, s.joinLocalPath)(i, "tts", "native-tts-manifest.json"), (0, s.joinLocalPath)(i, "tts", "native-audio-manifest.json"), (0, s.cleanLocalPath)(t.raw_stt_output_path), (0, s.joinLocalPath)(i, "stt", "engine-vnext-raw.json"), (0, s.cleanLocalPath)(t.normalized_stt_output_path), (0, s.joinLocalPath)(i, "stt", "engine-vnext-normalized.json")]),
            directory_paths: (0, s.uniqueDefinedPaths)([(0, s.joinLocalPath)(i, "tts", "segments"), (0, s.joinLocalPath)(i, "tts", "worker")]),
            empty_directory_paths: [],
            protected_paths: (0, s.uniqueDefinedPaths)([e.path, e.translatedVideoPath, e.draftVideoPath, e.finalExportPath])
          } : null
        }(e, n);
      if (!a) return e;
      let r = await (0, i.deleteManagedProjectFiles)(a);
      r.errors.length > 0 ? await (0, t.appendAppLog)("warn", `[history:${e.id}] Protected native vNext artifact cleanup reported ${r.errors.length} error(s)`) : (r.deleted_files.length > 0 || r.deleted_directories.length > 0) && await (0, t.appendAppLog)("info", `[history:${e.id}] Protected native vNext artifact cleanup removed ${r.deleted_files.length} file(s), ${r.deleted_directories.length} dir(s)`)
    } catch (e) {
      console.warn("Failed to cleanup protected native vNext artifacts:", e)
    }
    return e
  }
  async function g({
    records: e,
    activeTasks: t
  }) {
    if (!(0, n.isTauri)()) return null;
    try {
      var a;
      return await (0, i.pruneNativeVnextRuns)({
        referenced_job_ids: function(e, t) {
          let i = new Set;
          for (let t of e) {
            var n;
            h(i, t.project_id), h(i, t.manifest.id), h(i, t.manifest.processing_session?.job_id);
            let e = !(n = t.manifest.settings_snapshot?.billing) || "object" != typeof n || Array.isArray(n) ? null : n;
            for (let n of (h(i, m(e?.last_authorized_job_id)), h(i, m(e?.billing_scope_job_id)), Object.values(t.manifest.artifacts ?? {}))) h(i, function(e) {
              if (!e?.trim()) return;
              let t = e.trim().replace(/\\/g, "/").replace(/\/+$/, "");
              return t.split("/").pop()?.trim() || void 0
            }((0, l.nativeVnextRunDirFromArtifactPath)(n)))
          }
          for (let e of t)("pending" === e.status || "processing" === e.status) && h(i, e.videoId);
          return Array.from(i).sort()
        }(e, t),
        protected_paths: (a = e, Array.from(new Set(a.map(e => e.manifest.source?.path?.trim()).filter(e => !!e)))),
        min_age_days: 7,
        dry_run: !1
      })
    } catch (e) {
      return console.warn("[native-vnext-cleanup] orphan run cleanup failed", {
        message: e instanceof Error ? e.message : String(e)
      }), null
    }
  }

  function h(e, t) {
    let i = t?.trim();
    !i || "." === i || ".." === i || /[\\/]/.test(i) || e.add(i)
  }

  function m(e) {
    if ("string" == typeof e) return e.trim() || void 0
  }
  e.s(["backfillProcessingMetadataFromTrace", 0, u, "cleanupProtectedNativeVnextArtifacts", 0, p, "cuePreviewCleanupAuditPaths", 0, function(e) {
    let t = (0, s.cleanLocalPath)(e.projectRoot),
      i = (0, s.cleanLocalPath)(e.cuePreviewJobId);
    if (!t || !i || "." === i || ".." === i || /[\\/]/.test(i)) return [];
    let n = (0, s.joinLocalPath)(t, "native-vnext", i);
    return (0, s.uniqueDefinedPaths)([(0, s.cleanLocalPath)(e.cuePreviewPlanPath), (0, s.cleanLocalPath)(e.cuePreviewTimelineVideoPath), (0, s.joinLocalPath)(t, "cache", "export-v1"), (0, s.joinLocalPath)(n, "preview"), (0, s.joinLocalPath)(n, "preview-render"), (0, s.joinLocalPath)(n, "tts"), (0, s.joinLocalPath)(n, "source-separation"), (0, s.joinLocalPath)(n, "timeline"), (0, s.joinLocalPath)(n, "retime"), (0, s.joinLocalPath)(n, "exports"), (0, l.nativeVnextRunDirFromArtifactPath)(e.performanceTracePath) ?? void 0])
  }, "repairNativeVnextOutputArtifactsFromTraceFile", 0, c], 88016), e.s(["pruneOrphanNativeVnextRunsFromHistory", 0, g], 54221)
}, 67392, 6040, 65547, 46917, 25648, 38825, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(81341),
    n = e.i(63126),
    a = e.i(94010),
    r = e.i(63754),
    o = e.i(58450),
    s = e.i(21193),
    l = e.i(62686),
    d = e.i(4174),
    u = e.i(88016),
    c = e.i(1885),
    p = e.i(54221),
    g = e.i(97347);

  function h(e, t) {
    return e.filter(e => e !== t)
  }

  function m(e, t) {
    var i, n;
    let a, r = e.videos.findIndex(e => e.id === t);
    if (r < 0) throw Error("project_delete_video_not_found");
    let o = e.dashboardDraftVideoIds.indexOf(t),
      s = e.activeVideoId === t;
    return {
      next: (i = e, n = t, a = i.activeVideoId === n, {
        videos: i.videos.filter(e => e.id !== n),
        tasks: i.tasks.filter(e => e.videoId !== n),
        activeVideoId: y(i.videos, i.activeVideoId, n),
        dashboardDraftVideoIds: h(i.dashboardDraftVideoIds, n),
        currentTime: a ? 0 : i.currentTime,
        isPlaying: !a && i.isPlaying
      }),
      snapshot: {
        video: e.videos[r],
        videoIndex: r,
        tasks: e.tasks.flatMap((e, i) => e.videoId === t ? [{
          task: e,
          index: i
        }] : []),
        dashboardDraftIndex: o >= 0 ? o : null,
        wasActive: s,
        activeVideoId: e.activeVideoId,
        currentTime: e.currentTime,
        isPlaying: e.isPlaying
      }
    }
  }

  function f(e, t) {
    let i = [...e.videos];
    i.some(e => e.id === t.video.id) || i.splice(Math.min(t.videoIndex, i.length), 0, t.video);
    let n = [...e.tasks];
    for (let e of t.tasks) n.some(t => t.id === e.task.id) || n.splice(Math.min(e.index, n.length), 0, e.task);
    let a = [...e.dashboardDraftVideoIds];
    return null === t.dashboardDraftIndex || a.includes(t.video.id) || a.splice(Math.min(t.dashboardDraftIndex, a.length), 0, t.video.id), {
      videos: i,
      tasks: n,
      dashboardDraftVideoIds: a,
      activeVideoId: t.wasActive ? t.activeVideoId : e.activeVideoId,
      currentTime: t.wasActive ? t.currentTime : e.currentTime,
      isPlaying: t.wasActive ? t.isPlaying : e.isPlaying
    }
  }
  let _ = new Set(["pending", "processing"]);

  function v(e, t) {
    return {
      videos: e.videos.map(e => e.id === t && l.PROCESSING_VIDEO_STATUSES.has(e.status) ? (0, l.applyProcessingStatusTimestamps)(e, "idle") : e),
      tasks: e.tasks.filter(e => !(e.videoId === t && _.has(e.status)))
    }
  }

  function b(e, t) {
    let i = new Map(e.videos.map(e => [e.id, e])),
      n = new Set(t.map(e => e.id)),
      a = [...t.map(e => {
        let t = i.get(e.id);
        return (0, l.mergeHydratedProjectVideo)(t, e)
      }), ...e.videos.filter(e => !n.has(e.id)).map(l.toVideoFile)],
      r = e.activeVideoId && a.some(t => t.id === e.activeVideoId) ? e.activeVideoId : a[0]?.id ?? null;
    return {
      videos: a,
      activeVideoId: r
    }
  }

  function S(e, t) {
    let i = new Map(e.map(e => [e.id, e])),
      n = t.filter(e => {
        let t = i.get(e.id);
        return e.alignedSourceSubtitlePath && e.alignedSourceSubtitlePath !== t?.alignedSourceSubtitlePath || e.subtitleAlignmentPath && e.subtitleAlignmentPath !== t?.subtitleAlignmentPath || e.translationDebugPath !== t?.translationDebugPath
      }),
      a = new Map(n.map(e => [e.id, e]));
    return {
      videos: e.map(e => a.get(e.id) ?? e),
      backfilledVideos: n
    }
  }

  function y(e, t, i) {
    return t !== i ? t : e.find(e => e.id !== i)?.id ?? null
  }
  async function P(e, t, i) {
    let n = Array(e.length),
      a = 0,
      r = Array.from({
        length: Math.min(t, e.length)
      }, async () => {
        for (; a < e.length;) {
          let t = a;
          a += 1, n[t] = await i(e[t], t)
        }
      });
    return await Promise.all(r), n
  }

  function T(e) {
    let t = e && "object" == typeof e ? Reflect.get(e, "code") : null;
    if ("string" == typeof t) {
      let e = t.trim().toLowerCase();
      if (/^[a-z][a-z0-9_]{0,127}$/.test(e)) return e
    }
    return "project_history_record_hydration_failed"
  }
  async function w(e) {
    try {
      await (0, o.persistProjectManifestForVideo)(e, {}, {
        preserveUpdatedAt: !0
      })
    } catch (e) {
      await (0, t.appendAppLog)("warn", `[project-history] metadata_persist_failed code=${T(e)}`).catch(() => void 0)
    }
  }
  async function x(e) {
    try {
      return await (0, s.ensureAlignedSourceSubtitlePath)(e)
    } catch (i) {
      return await (0, t.appendAppLog)("warn", `[project-history] aligned_subtitle_backfill_failed code=${T(i)}`).catch(() => void 0), e
    }
  }
  async function I(e, i) {
    try {
      return await (0, s.ensureVideoSubtitleArtifactsHydrated)(e)
    } catch (e) {
      return await (0, t.appendAppLog)("warn", `[project-history] ${i}_subtitle_hydration_failed code=${T(e)}`).catch(() => void 0), !1
    }
  }
  async function E({
    get: e,
    set: o
  }) {
    if (!(0, i.isTauri)()) return;
    let g = e().videos.find(t => t.id === e().activeVideoId);
    g && await I(g, "active");
    let h = await (0, n.listProjectManifests)(),
      m = new Map(e().videos.map(e => [e.id, e])),
      f = t => m.has(t) && !e().videos.some(e => e.id === t),
      _ = new Set(e().tasks.filter(e => e.videoId && ("pending" === e.status || "processing" === e.status)).map(e => e.videoId)),
      v = (await P(h, 6, async e => {
        try {
          let t = "srt_audio" === e.manifest.project_type && ("srt_paste" === e.manifest.source.mode || "text_paste" === e.manifest.source.mode) || await (0, i.fileExists)(e.manifest.source.path),
            n = (0, r.manifestRecordToVideoFile)(e, {
              sourceMissing: !t
            }),
            o = await (0, a.ensureProjectThumbnail)(n),
            s = await (0, u.backfillProcessingMetadataFromTrace)(o),
            c = await (0, u.repairNativeVnextOutputArtifactsFromTraceFile)(s),
            p = await (0, u.cleanupProtectedNativeVnextArtifacts)(c),
            g = await (0, d.pruneMissingProjectArtifactFiles)(p),
            h = m.get(g.id),
            v = (0, l.normalizeHydratedProcessingStatus)(h, g, _.has(g.id)),
            b = {
              ...v,
              exportWatermarkPolicy: v.exportWatermarkPolicy ?? h?.exportWatermarkPolicy,
              dubbingTimeline: v.dubbingTimeline ?? h?.dubbingTimeline,
              dubbingTimelineVideoPath: v.dubbingTimelineVideoPath ?? h?.dubbingTimelineVideoPath
            };
          return !f(b.id) && (v.thumbnail && !e.manifest.artifacts.thumbnail || v.processingDurationMs && !e.manifest.processing?.duration_ms || v.status !== g.status || v.processingError !== g.processingError || (0, l.projectArtifactPathsChanged)(s, v) || h?.exportWatermarkPolicy && !v.exportWatermarkPolicy || h?.dubbingTimeline && !v.dubbingTimeline || h?.dubbingTimelineVideoPath && !v.dubbingTimelineVideoPath || (e.manifest.artifacts.cue_preview_plan || e.manifest.artifacts.cue_preview_timeline_video || e.manifest.settings_snapshot?.cue_preview) && !v.cuePreviewPlanPath) && await w(b), {
            record: e,
            video: b
          }
        } catch (e) {
          return await (0, t.appendAppLog)("warn", `[project-history] record_hydration_failed code=${T(e)}`).catch(() => void 0), null
        }
      })).filter(e => null !== e),
      y = v.map(({
        video: e
      }) => e),
      A = (0, c.clearSharedNativeVnextOutputArtifacts)(y),
      k = new Map(A.map(e => [e.id, e]));
    await P(v, 6, async ({
      video: e
    }) => {
      let t = k.get(e.id);
      t && !f(t.id) && (t.translatedVideoPath !== e.translatedVideoPath || t.draftVideoPath !== e.draftVideoPath) && await w(t)
    }), await (0, p.pruneOrphanNativeVnextRunsFromHistory)({
      records: h,
      activeTasks: e().tasks
    }), o(e => {
      let t = new Set(e.videos.map(e => e.id)),
        i = A.filter(e => !m.has(e.id) || t.has(e.id));
      return b({
        videos: e.videos,
        activeVideoId: e.activeVideoId
      }, i)
    });
    let V = await P(e().videos, 6, x),
      N = S(e().videos, V);
    N.backfilledVideos.length > 0 && (o({
      videos: N.videos
    }), await P(N.backfilledVideos.filter(e => !f(e.id)), 6, w));
    let M = e().videos.filter(s.videoHasSubtitleArtifacts),
      L = M.find(t => t.id === e().activeVideoId);
    L && await I(L, "terminal"), P(M.filter(e => e.id !== L?.id), 6, e => (0, s.ensureVideoSubtitleArtifactsHydrated)(e).catch(() => !1))
  }
  e.s(["activeVideoFromList", 0, function(e, t) {
    return e.find(e => e.id === t)
  }, "activeVideoIdAfterAppend", 0, function(e, t, i) {
    return i ? t : e ?? t
  }, "appendDashboardDraftVideoIds", 0, function(e, t) {
    let i = new Set(e);
    for (let e of t) e && i.add(e);
    return Array.from(i)
  }, "appendVideoToList", 0, function(e, t) {
    return [...e, t]
  }, "applyAlignedSourceSubtitleBackfillsToVideos", 0, S, "cancelVideoProcessingInStoreState", 0, v, "filterDashboardDraftVideoIdsForVideos", 0, function(e, t) {
    let i = new Set(t.filter(e => (0, g.isQueuedVideo)(e)).map(e => e.id)),
      n = [];
    for (let t of e) i.has(t) && !n.includes(t) && n.push(t);
    return n
  }, "mergeHydratedProjectVideosIntoStoreState", 0, b, "removeDashboardDraftVideoId", 0, h, "removeVideoFromStoreState", 0, function(e, t) {
    return {
      videos: e.videos.filter(e => e.id !== t),
      activeVideoId: y(e.videos, e.activeVideoId, t)
    }
  }, "replaceVideoInList", 0, function(e, t) {
    return e.map(e => e.id === t.id ? t : e)
  }, "restoreVideoProjectDeletionUiState", 0, f, "setVideoProcessingErrorInList", 0, function(e, t, i, n, a) {
    return e.map(e => e.id === t ? {
      ...(0, l.applyProcessingStatusTimestamps)(e, "error"),
      processingError: i,
      processingErrorCode: n,
      processingErrorDetail: a
    } : e)
  }, "stageVideoProjectDeletionUiState", 0, m, "updateVideoInList", 0, function(e, t, i) {
    return e.map(e => e.id === t ? {
      ...e,
      ...i
    } : e)
  }, "updateVideoStatusInList", 0, function(e, t, i) {
    return e.map(e => e.id === t ? (0, l.applyProcessingStatusTimestamps)(e, i) : e)
  }], 6040), e.s(["syncProjectHistoryFromManifestsJob", 0, E], 67392);
  var A = e.i(7787),
    k = e.i(48357),
    V = e.i(11101);
  let N = new Map;
  async function M(e) {
    let t = Array.from(N.get(e) ?? []);
    N.delete(e);
    let i = (await Promise.allSettled(t.map(e => Promise.resolve().then(e.dispose)))).filter(e => "rejected" === e.status);
    if (i.length > 0) throw AggregateError(i.map(e => e.reason), "cue_preview_runtime_dispose_failed")
  }

  function L(e) {
    "function" == typeof globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame(() => e()) : globalThis.setTimeout(e, 0)
  }
  async function C(e = L) {
    await new Promise(t => e(t)), await new Promise(t => e(t))
  }
  async function j(e) {
    let t, i = e.stage();
    try {
      await e.waitForUiDetach(), await e.disposePreviewRuntimes(), await e.stopProjectRuntime(), t = await e.deleteWorkspace()
    } catch (t) {
      throw await e.rollback(i), t
    }
    return await e.commit(t), t
  }
  let R = "pipeline_canceled:",
    D = new Map;

  function F(e, t) {
    D.set(e, {
      intent: "cancel",
      message: t
    })
  }

  function H(e, t) {
    D.set(e, {
      intent: "pause",
      message: t
    })
  }

  function $(e, t) {
    D.set(e, {
      intent: "abandon",
      message: t
    })
  }

  function O(e) {
    return Error(`${R} ${e}`)
  }

  function G(e) {
    return D.get(e) ?? {
      intent: "cancel",
      message: "Đã dừng xử lý video."
    }
  }

  function U(e) {
    return G(e).message
  }

  function q(e) {
    let t = G(e);
    return D.delete(e), t
  }
  e.s(["consumePipelineCancellation", 0, function(e) {
    let {
      message: t
    } = q(e);
    return t
  }, "consumePipelineCancellationRequest", 0, q, "isPipelineCancellation", 0, function(e, t) {
    return (e instanceof Error ? e.message : String(e)).toLowerCase().includes(R) || D.has(t)
  }, "pipelineCanceledError", 0, O, "pipelineCancellationMessage", 0, U, "requestPipelineAbandonment", 0, $, "requestPipelineCancellation", 0, F, "requestPipelinePause", 0, H, "throwIfPipelineCanceled", 0, function(e) {
    if (D.has(e)) throw O(U(e))
  }], 65547);
  let B = new Map;

  function z(e, t) {
    B.set(e, t)
  }

  function J(e, t) {
    B.get(e) === t && B.delete(e)
  }

  function K(e) {
    return B.get(e)
  }
  async function W(e, t, i) {
    z(e, t);
    try {
      return await i()
    } finally {
      J(e, t)
    }
  }
  e.s(["activeNativePipelineJobId", 0, K, "forgetActiveNativePipelineJob", 0, J, "rememberActiveNativePipelineJob", 0, z, "withActiveNativePipelineJob", 0, W], 46917);
  let Q = new Set(["generating_tts", "exporting"]);
  async function Y(e) {
    let t = "translation_in_progress" === e.phase ? `Video đang được dịch tr\xean server. Hủy b\xe2y giờ sẽ kh\xf4ng được ho\xe0n ${e.chargedMinutes} ph\xfat. Tiếp tục hủy?` : `Hủy b\xe2y giờ sẽ kh\xf4ng được ho\xe0n ${e.chargedMinutes} ph\xfat v\xec bản dịch đ\xe3 xử l\xfd xong. Tiếp tục?`;
    return await (0, i.askMessage)("Hủy xử lý video?", t, "warning", {
      confirmLabel: "Tiếp tục hủy",
      cancelLabel: "Quay lại"
    }) ? "confirmed" : "cancelled"
  }
  async function Z(e) {
    let t = K(e);
    t && await (0, A.cancelEngineVnextNativeJob)(t), await (0, A.cancelEngineVnextTranscription)(e);
    let i = Date.now() + 1e4;
    for (; K(e);) {
      if (Date.now() >= i) throw Error("native_processing_runtime_release_timeout");
      await new Promise(e => {
        globalThis.setTimeout(e, 50)
      })
    }
  }
  async function X(e) {
    let i = K(e);
    if (i) try {
      await (0, A.cancelEngineVnextNativeJob)(i)
    } catch (i) {
      await (0, t.appendAppLog)("warn", `[pipeline:${e}] Stop requested but native vNext did not confirm cancel: ${i instanceof Error?i.message:String(i)}`)
    }
    try {
      await (0, A.cancelEngineVnextTranscription)(e)
    } catch (i) {
      await (0, t.appendAppLog)("warn", `[pipeline:${e}] Stop requested but Engine vNext did not confirm cancel: ${i instanceof Error?i.message:String(i)}`)
    }
    try {
      await (0, A.stopLocalEngine)()
    } catch (i) {
      await (0, t.appendAppLog)("warn", `[pipeline:${e}] Stop requested but Local Engine did not confirm stop: ${i instanceof Error?i.message:String(i)}`)
    }
  }
  async function ee({
    videoId: e,
    reason: t,
    get: i,
    set: n
  }) {
    let a = function(e) {
      if (!e) return null;
      let t = function(e) {
        let t = e.billingNonRefundableSeconds;
        if ("number" == typeof t && Number.isFinite(t)) return Math.max(0, Math.round(t));
        let i = e.exportWatermarkPolicy;
        return Math.max(0, Math.round((e.billingChargedSeconds ?? i?.chargedSeconds ?? 0) + (i?.fairUseSecondsUsed ?? 0) + (i?.voicePremiumChargedSeconds ?? 0)))
      }(e);
      if (t <= 0) return null;
      let i = Math.max(1, Math.ceil(t / 60));
      return "translating" === e.status ? e.translationServerUsageStarted ? {
        chargedMinutes: i,
        phase: "translation_in_progress"
      } : null : Q.has(e.status) ? {
        chargedMinutes: i,
        phase: "post_translation"
      } : null
    }(i().videos.find(t => t.id === e));
    a && "cancelled" === await Y(a) || (F(e, t), n(t => v({
      videos: t.videos,
      tasks: t.tasks
    }, e)), await X(e))
  }
  async function et({
    videoId: e,
    reason: t,
    set: i
  }) {
    H(e, t), i(t => v({
      videos: t.videos,
      tasks: t.tasks
    }, e)), await X(e)
  }
  e.s(["cancelVideoProcessingJob", 0, ee, "pauseVideoProcessingJob", 0, et, "stopVideoProcessingRuntimeForDeletion", 0, Z], 25648);
  let ei = "job_abandoned",
    en = new Set(["importing", "extracting_audio", "transcribing", "translating", "generating_tts", "exporting"]),
    ea = new Set(["not_charged", "refunded", "free_retry_available"]);

  function er(e, t) {
    let i = (0, k.normalizeDesktopProcessingSession)(e.processingSession);
    return i && en.has(e.status) ? t && t.job_id === i.job_id ? ea.has(t.disposition) || "unknown_manual_review" !== t.disposition && 0 === Math.max(0, Math.round(t.outstanding_total_seconds)) ? "normal" : "requires_abandonment" : "requires_disposition" : "normal"
  }
  async function eo(e, t) {
    let i = await (0, V.enqueueLocalJobTerminalReport)(t.job_id, {
      lease_generation: t.lease_generation,
      status: "canceled",
      error_code: ei,
      error_message: "User confirmed deletion of an unfinished project.",
      metrics: {
        source_duration_seconds: t.authorized_source_seconds,
        engine_provider: "desktop_local",
        funnel_events: [{
          event: "job_abandoned",
          metadata: {
            source: "project_delete"
          }
        }]
      },
      diagnostic: {
        stage: t.current_stage,
        error_code: ei,
        error_message: "User confirmed deletion of an unfinished project.",
        diagnostic: {
          intent: "user_confirmed_project_deletion"
        }
      }
    });
    if (i.job_id !== t.job_id || !i.request.delivery_id || !i.request.payload_sha256) throw Error("job_abandonment_evidence_invalid");
    $(e, "Project deletion confirmed by user.")
  }
  async function es({
    videoId: a,
    options: r = {},
    get: o,
    set: s
  }) {
    let l, c = o().videos.find(e => e.id === a);
    if (!c) return {
      removedVideo: !1,
      cleanupReport: null,
      workspaceReport: null
    };
    let p = o().tasks.find(e => e.videoId === a && "processing" === e.status),
      g = er(c, r.disposition);
    if ("requires_disposition" === g) throw Error("Không xác minh được trạng thái phút của job đang xử lý. Project chưa bị xóa.");
    if ("requires_abandonment" === g) {
      if (!r.confirmAbandon) throw Error("Cần xác nhận dừng job và không hoàn số phút còn lại trước khi xóa.");
      let e = (0, k.normalizeDesktopProcessingSession)(c.processingSession);
      if (!e) throw Error("processing_session_missing_or_invalid");
      await eo(a, e)
    } else if (p) throw Error("Project đang xử lý. Hãy đợi tác vụ hiện tại hoàn tất trước khi xóa.");
    let h = null,
      _ = null,
      v = (0, i.isTauri)();
    try {
      _ = await j({
        stage: () => {
          let e = m(o(), a);
          return s(e.next), e.snapshot
        },
        waitForUiDetach: C,
        disposePreviewRuntimes: () => M(a),
        stopProjectRuntime: () => Z(a),
        deleteWorkspace: () => v ? (0, n.deleteProjectWorkspace)(a) : Promise.resolve(null),
        commit: async () => {
          let {
            useQueueStore: t
          } = await e.A(68915);
          t.getState().skipProjectItems(a);
          let {
            useSubtitleStore: i
          } = await e.A(5990);
          i.setState(e => ({
            subtitles: e.subtitles.filter(e => e.videoId !== a)
          }))
        },
        rollback: e => {
          s(t => f(t, e))
        }
      })
    } catch (n) {
      let e = function(e) {
        let t = "string" == typeof e?.code ? e.code : null;
        if (t?.startsWith("project_") && "project_delete_queue_persist_failed" !== t) return t;
        let i = (e instanceof Error ? e.message : String(e)).match(/\b(project_[a-z0-9_]+)\b/);
        return i?.[1] === "project_delete_queue_persist_failed" ? null : i?.[1] ?? null
      }(n);
      if (e) throw Object.assign(Error("project_export_active" === e ? "Project đang được xuất video." : e), {
        code: e
      });
      let i = n instanceof Error ? n.message : String(n);
      throw await (0, t.appendAppLog)("error", `[history:${a}] Project deletion failed before a durable outcome: ${i}`), Error("Không thể xóa project lúc này. Hãy đóng ứng dụng đang dùng file rồi thử lại.")
    }
    if (v) {
      let e = (0, u.cuePreviewCleanupAuditPaths)(c),
        i = c.cuePreviewJobId?.trim();
      try {
        let e = await (0, d.buildProjectCleanupRequest)(c);
        h = await (0, n.deleteManagedProjectFiles)(e)
      } catch (e) {
        l = e instanceof Error ? e.message : String(e), await (0, t.appendAppLog)("warn", `[history:${a}] Project cleanup failed after workspace delete: ${l}`)
      }
      if (_?.outcome !== "deferred" && i && e.length > 0) {
        let t = await (0, A.auditEngineVnextCuePreviewCleanup)({
          projectId: a,
          jobId: i,
          referencedPaths: e
        });
        if (!t.clean) {
          let e = [...t.remainingPaths, ...t.rejectedPaths].join("; ");
          throw Error(`cue_preview_cleanup_audit_failed: ${e}`)
        }
      }
      _?.outcome === "deferred" && await (0, t.appendAppLog)("info", `[history:${a}] Project workspace deletion deferred until file handles are released.`)
    }
    return {
      removedVideo: !0,
      cleanupReport: h,
      workspaceReport: _,
      cleanupError: l
    }
  }
  e.s(["deleteVideoProjectJob", 0, es, "formatBillingLiabilityDuration", 0, function(e) {
    let t = Math.max(0, Math.round(e)),
      i = Math.floor(t / 60),
      n = t % 60;
    return i > 0 ? `${i} ph\xfat ${n} gi\xe2y` : `${n} gi\xe2y`
  }, "projectDeletionJobId", 0, function(e) {
    return (0, k.normalizeDesktopProcessingSession)(e.processingSession)?.job_id ?? e.billingScopeJobId?.trim() ?? e.lastAuthorizedJobId?.trim() ?? null
  }, "projectDeletionMode", 0, er], 38825)
}, 32217, e => {
  "use strict";

  function t(e, t) {
    if (!e || "object" != typeof e || !(t in e)) return "";
    var i = e[t];
    if (null == i) return "";
    if ("string" == typeof i) return i.trim();
    if ("number" == typeof i || "boolean" == typeof i || "bigint" == typeof i) return String(i);
    if (i instanceof Error) return i.message.trim();
    try {
      return JSON.stringify(i)
    } catch {
      return ""
    }
  }

  function i(e) {
    if (null == e) return "unknown_error";
    if ("string" == typeof e) return e.trim() || "unknown_error";
    if ("number" == typeof e || "boolean" == typeof e || "bigint" == typeof e) return String(e);
    let i = t(e, "code") || t(e, "error_code"),
      n = t(e, "customerMessage") || t(e, "customer_message"),
      a = t(e, "developerMessage") || t(e, "developer_message"),
      r = t(e, "message") || t(e, "error") || t(e, "detail"),
      o = e instanceof Error ? e.message.trim() : r,
      s = t(e, "cause"),
      l = t(e, "fallbackAllowed") || t(e, "fallback_allowed"),
      d = t(e, "fallbackRoute") || t(e, "fallback_route"),
      u = [i ? `code=${i}` : "", n ? `customer=${n}` : "", a ? `developer=${a}` : "", o && o !== i ? `message=${o}` : "", s ? `cause=${s}` : "", l ? `fallbackAllowed=${l}` : "", d ? `fallbackRoute=${d}` : ""].filter(Boolean);
    return u.length > 0 ? u.join(" | ") : "object_error"
  }
  e.s(["METRICS_ERROR_CODE_LIMIT", 0, 64, "METRICS_ERROR_MESSAGE_LIMIT", 0, 255, "diagnosticTextForPipelineError", 0, i, "errorTextField", 0, t, "metricText", 0, function(e, t) {
    if (null == e || "string" == typeof e && !e.trim()) return null;
    let n = i(e).trim();
    if (!n) return null;
    let a = function(e) {
      if (!/ffmpeg/i.test(e)) return null;
      let t = e.match(/(?:^|\|\s*)code=([^|]+)/i)?.[1]?.trim(),
        i = e.replace(/\r/g, "\n").split(/\n+|\s+\|\s+/).map(e => e.replace(/^developer=/i, "").replace(/^(shared\s+)?FFmpeg export failed:\s*/i, "").replace(/^FFmpeg export failed:\s*/i, "").replace(/ffmpeg version.*$/i, "").trim()).filter(e => e && !/^(ffmpeg version|built with|configuration:|lib(?:av|sw)\w+|copyright \(c\))/i.test(e)).filter(e => !/^(code|customer)=/i.test(e)).filter(e => !/^(shared\s+)?FFmpeg export failed:?\s*$/i.test(e)),
        n = i.filter(e => /(error|failed|invalid|permission denied|not found|no such|unable|cannot|conversion)/i.test(e)),
        a = (n.length > 0 ? n : i).slice(-4);
      if (0 === a.length) return null;
      let r = t ? `code=${t} | ` : "";
      return `${r}${a.join(" | ")}`
    }(n);
    return function(e, t, i = !1) {
      let n = e.replace(/\s+/g, " ").trim();
      if (!n) return null;
      if (n.length <= t) return n;
      if (!i || t <= 4) return n.slice(0, t);
      let a = n.match(/^code=[^|]+/),
        r = a ? `${a[0].trim()} | ` : "",
        o = t - r.length - 3;
      return o <= 8 ? `...${n.slice(-(t-3))}` : `${r}...${n.slice(-o)}`
    }(a ?? n, t, !!a)
  }])
}, 43519, e => {
  "use strict";
  e.i(89268);
  var t = e.i(81341),
    i = e.i(63126),
    n = e.i(32217),
    a = e.i(44318);
  async function r(e) {
    return (0, i.readManagedTextFile)(e)
  }
  async function o(e) {
    if (!e || !await (0, t.fileExists)(e)) return null;
    try {
      var i = JSON.parse(await r(e));
      if (!i || "object" != typeof i) return null;
      let t = i.segments;
      if (!t || "object" != typeof t || Array.isArray(t)) return null;
      for (let e of Object.values(t)) {
        if (!e || "object" != typeof e) continue;
        let t = e.voice;
        if ("string" == typeof t && t.trim()) return t.trim()
      }
      return null
    } catch (e) {
      return console.warn("Failed to infer native TTS voice from manifest:", e), null
    }
  }

  function s(e, t = 0) {
    return Array.from({
      length: Math.max(e?.length ?? 0, t)
    }, (t, i) => {
      let n = e?.[i];
      return "string" == typeof n ? n : ""
    })
  }

  function l(e, t) {
    return e.map(e => e.id === t ? {
      ...e,
      ttsTimelineAudioPath: void 0
    } : e)
  }

  function d(e) {
    return [...new Set((e ?? []).map(e => e.trim()).filter(Boolean))]
  }
  async function u(e, i) {
    if (!e || 0 === i) return !1;
    let n = (e.ttsAudioFiles ?? []).slice(0, i);
    return !(n.length < i) && !!n.every(Boolean) && (await Promise.all(n.map(e => (0, t.fileExists)(e)))).every(Boolean)
  }
  e.s(["clearTtsArtifactForSubtitle", 0, function(e, t, i) {
    let n = a.useSubtitleStore.getState().subtitles.filter(e => e.videoId === t && !0 !== e.excluded && e.translatedText.trim().length > 0).sort((e, t) => e.startTime - t.startTime || e.index - t.index).findIndex(e => e.id === i);
    return n < 0 ? l(e, t) : e.map(e => e.id === t ? {
      ...e,
      ttsAudioFiles: function(e, t) {
        let i = s(e, t + 1);
        for (; i.length <= t;) i.push("");
        return i[t] = "", i
      }(e.ttsAudioFiles, n),
      ttsTimelineAudioPath: void 0
    } : e)
  }, "clearTtsArtifactsForVideo", 0, function(e, t) {
    return e.map(e => e.id === t ? {
      ...e,
      ttsAudioFiles: [],
      ttsTimelineAudioPath: void 0
    } : e)
  }, "editedSubtitleTtsUserMessage", 0, function(e) {
    let t = (0, n.errorTextField)(e, "customerMessage") || (0, n.errorTextField)(e, "customer_message"),
      i = (0, n.errorTextField)(e, "code") || (0, n.errorTextField)(e, "error_code"),
      a = (0, n.diagnosticTextForPipelineError)(e),
      r = `${i} ${a}`.toLowerCase();
    return r.includes("invalid_timeline") || r.includes("overlap") ? "Timeline phụ đề đang bị sai hoặc bị chồng thời gian. Hãy sửa lại mốc thời gian rồi tạo lại âm thanh." : r.includes("canonical_subtitle_shrink_blocked") ? "Không thể lưu phụ đề vì dữ liệu mới thiếu dòng so với file hiện tại. Hãy mở lại project rồi thử lại." : r.includes("input_missing") || r.includes("source video does not exist") ? "Không tìm thấy video gốc. Hãy khôi phục file gốc hoặc import lại video trước khi tạo lại âm thanh." : r.includes("manifest_missing") || r.includes("artifact_required") ? "Video này không còn đủ dữ liệu TTS để tạo lại âm thanh. Hãy xử lý lại video." : r.includes("watermark_policy_required") ? "Video này cần xử lý lại để tạo bản xuất hợp lệ trước khi tạo lại âm thanh." : r.includes("viral_tts_material_failed") || r.includes("40402002") ? "Dịch vụ giọng đọc không tạo được audio cho câu này." : t || "Không tạo lại được âm thanh cho câu này."
  }, "hasCompleteTtsAudio", 0, u, "inferNativeTtsVoiceFromManifest", 0, o, "invalidateTtsTimelineArtifactForVideo", 0, l, "markEditedSubtitleTtsArtifactsDirty", 0, function(e, t, i) {
    let n = d(i);
    return e.map(e => e.id === t ? {
      ...e,
      editedSubtitleTtsDirty: !0,
      editedSubtitleTtsDirtyCaptionIds: d([...e.editedSubtitleTtsDirtyCaptionIds ?? [], ...n]),
      ttsTimelineAudioPath: void 0
    } : e)
  }, "normalizeTtsAudioFilesForCompose", 0, s, "translatedLogicalSubtitlesForVideo", 0, function(e) {
    return a.useSubtitleStore.getState().subtitles.filter(t => t.videoId === e).sort((e, t) => e.startTime - t.startTime || e.index - t.index)
  }])
}, 77800, 68426, 80072, e => {
  "use strict";
  e.s(["appendProcessingTask", 0, function(e, t, i) {
    return [...e, {
      ...t,
      id: i
    }]
  }, "removeProcessingTask", 0, function(e, t) {
    return e.filter(e => e.id !== t)
  }, "updateProcessingTask", 0, function(e, t, i) {
    return e.map(e => {
      if (e.id !== t) return e;
      let n = {
          ...e,
          ...i
        },
        a = e.progressBasisPoints ?? 100 * e.progress,
        r = i.progressBasisPoints ?? (void 0 === i.progress ? void 0 : 100 * i.progress);
      return void 0 !== r && r < a && (n.progress = Math.max(e.progress, i.progress ?? e.progress), n.progressBasisPoints = a), n
    })
  }], 77800), e.i(89268);
  var t = e.i(53752),
    i = e.i(63126),
    n = e.i(81341),
    a = e.i(58450),
    r = e.i(44318);
  async function o({
    videoId: e,
    voice: s,
    engine: l,
    language: d,
    speed: u,
    pitch: c,
    volume: p,
    options: g,
    get: h
  }) {
    if (!h().videos.find(t => t.id === e)) throw Error("Video not found for TTS generation.");
    if (!(0, n.isTauri)()) throw Error("TTS generation requires the Tauri desktop runtime.");
    let {
      addTask: m,
      updateTask: f,
      updateVideoStatus: _,
      setVideoProcessingError: v
    } = h(), b = r.useSubtitleStore.getState().subtitles.filter(t => t.videoId === e && t.translatedText.trim().length > 0).sort((e, t) => e.startTime - t.startTime || e.index - t.index);
    if (0 === b.length) throw Error("No translated subtitles available for TTS generation.");
    let S = m({
      videoId: e,
      type: "tts",
      status: "processing",
      progress: 0,
      message: "Đang chuẩn bị tạo giọng đọc..."
    });
    try {
      var y, P;
      _(e, "generating_tts");
      let n = await (0, i.getProjectArtifactPath)(e, "tts.segmentDir");
      f(S, (y = b.length, {
        progress: 20,
        message: `Đang tạo giọng đọc cho ${y} phụ đề...`
      }));
      let r = await (0, t.batchGenerateTts)(b, s, l, d, n, u, c, p, g),
        o = r.filter(Boolean).length;
      if (0 === o) throw Error("No TTS audio files were generated.");
      return f(S, (P = b.length, {
        progress: 100,
        status: "completed",
        message: `Đ\xe3 tạo ${o}/${P} file audio.`
      })), h().updateVideo(e, {
        ttsAudioFiles: r,
        ttsTimelineAudioPath: void 0
      }), _(e, "completed"), await (0, a.persistLatestProjectManifest)(e, h, {
        tts_engine: l,
        voice: s,
        language: d,
        speed: u,
        pitch: c,
        volume: p
      }), r
    } catch (i) {
      console.error("TTS generation failed:", i);
      let t = i instanceof Error ? i.message : String(i);
      throw v(e, t), f(S, {
        status: "error",
        message: "Tạo giọng đọc thất bại.",
        error: t
      }), i
    }
  }
  e.s(["runTtsGenerationJob", 0, o], 68426);
  var s = e.i(43519);
  async function l({
    videoId: e,
    get: o
  }) {
    let d = o().videos.find(t => t.id === e);
    if (!d || !(0, n.isTauri)()) return null;
    let u = d.ttsTimelineAudioPath;
    if (u && await (0, n.fileExists)(u)) return u;
    let c = r.useSubtitleStore.getState().subtitles.filter(t => t.videoId === e && t.translatedText.trim().length > 0).sort((e, t) => e.startTime - t.startTime || e.index - t.index);
    if (0 === c.length) return null;
    let p = (0, s.normalizeTtsAudioFilesForCompose)(d.ttsAudioFiles, c.length);
    if (!p.some(Boolean)) return null;
    let g = await (0, i.getProjectArtifactPath)(e, "tts.timeline");
    return await (0, t.composeTtsAudio)(c, p, g), o().updateVideo(e, {
      ttsTimelineAudioPath: g
    }), await (0, a.persistLatestProjectManifest)(e, o, {
      artifact: "tts_timeline"
    }), g
  }
  e.s(["runTtsTimelineJob", 0, l], 80072)
}, 88455, e => {
  "use strict";
  let t = [{
      value: "zh",
      name: "Chinese",
      nativeName: "中文",
      viName: "Tiếng Trung",
      label: "Tiếng Trung",
      description: "Video gốc tiếng Trung."
    }, {
      value: "en",
      name: "English",
      nativeName: "English",
      viName: "Tiếng Anh",
      label: "Tiếng Anh",
      description: "Video gốc tiếng Anh."
    }, {
      value: "ja",
      name: "Japanese",
      nativeName: "日本語",
      viName: "Tiếng Nhật",
      label: "Tiếng Nhật",
      description: "Video gốc tiếng Nhật."
    }, {
      value: "ko",
      name: "Korean",
      nativeName: "한국어",
      viName: "Tiếng Hàn",
      label: "Tiếng Hàn",
      description: "Video gốc tiếng Hàn."
    }, {
      value: "yue",
      name: "Cantonese",
      nativeName: "廣東話",
      viName: "Tiếng Quảng Đông",
      label: "Tiếng Quảng Đông",
      description: "Video gốc tiếng Quảng Đông."
    }, {
      value: "th",
      name: "Thai",
      nativeName: "ไทย",
      viName: "Tiếng Thái",
      label: "Tiếng Thái",
      description: "Video gốc tiếng Thái."
    }, {
      value: "ru",
      name: "Russian",
      nativeName: "Русский",
      viName: "Tiếng Nga",
      label: "Tiếng Nga",
      description: "Video gốc tiếng Nga."
    }, {
      value: "ar",
      name: "Arabic",
      nativeName: "العربية",
      viName: "Tiếng Ả Rập",
      label: "Tiếng Ả Rập",
      description: "Video gốc tiếng Ả Rập."
    }, {
      value: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      viName: "Tiếng Indonesia",
      label: "Tiếng Indonesia",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "ms",
      name: "Malay",
      nativeName: "Bahasa Melayu",
      viName: "Tiếng Mã Lai",
      label: "Tiếng Mã Lai",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "fil",
      name: "Filipino",
      nativeName: "Filipino",
      viName: "Tiếng Filipino",
      label: "Tiếng Filipino",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "fr",
      name: "French",
      nativeName: "Français",
      viName: "Tiếng Pháp",
      label: "Tiếng Pháp",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "de",
      name: "German",
      nativeName: "Deutsch",
      viName: "Tiếng Đức",
      label: "Tiếng Đức",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "es",
      name: "Spanish",
      nativeName: "Español",
      viName: "Tiếng Tây Ban Nha",
      label: "Tiếng Tây Ban Nha",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "pt",
      name: "Portuguese",
      nativeName: "Português",
      viName: "Tiếng Bồ Đào Nha",
      label: "Tiếng Bồ Đào Nha",
      description: "Nhận diện chất lượng cao."
    }, {
      value: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
      viName: "Tiếng Hindi",
      label: "Tiếng Hindi",
      description: "Nhận diện chất lượng cao."
    }],
    i = [{
      code: "vi",
      name: "Vietnamese",
      nativeName: "Tiếng Việt",
      viName: "Tiếng Việt",
      flag: "🇻🇳",
      edgeTtsVoice: "vi-VN-HoaiMyNeural",
      edgeTtsVoiceMale: "vi-VN-NamMinhNeural"
    }, {
      code: "en",
      name: "English",
      nativeName: "English",
      viName: "Tiếng Anh",
      flag: "🇺🇸",
      edgeTtsVoice: "en-US-AriaNeural",
      edgeTtsVoiceMale: "en-US-GuyNeural"
    }, {
      code: "zh",
      name: "Chinese",
      nativeName: "中文",
      viName: "Tiếng Trung",
      flag: "🇨🇳",
      edgeTtsVoice: "zh-CN-XiaoxiaoNeural",
      edgeTtsVoiceMale: "zh-CN-YunxiNeural"
    }, {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
      viName: "Tiếng Nhật",
      flag: "🇯🇵",
      edgeTtsVoice: "ja-JP-NanamiNeural",
      edgeTtsVoiceMale: "ja-JP-KeitaNeural"
    }, {
      code: "ko",
      name: "Korean",
      nativeName: "한국어",
      viName: "Tiếng Hàn",
      flag: "🇰🇷",
      edgeTtsVoice: "ko-KR-SunHiNeural",
      edgeTtsVoiceMale: "ko-KR-InJoonNeural"
    }, {
      code: "fr",
      name: "French",
      nativeName: "Français",
      viName: "Tiếng Pháp",
      flag: "🇫🇷",
      edgeTtsVoice: "fr-FR-DeniseNeural",
      edgeTtsVoiceMale: "fr-FR-HenriNeural"
    }, {
      code: "de",
      name: "German",
      nativeName: "Deutsch",
      viName: "Tiếng Đức",
      flag: "🇩🇪",
      edgeTtsVoice: "de-DE-KatjaNeural",
      edgeTtsVoiceMale: "de-DE-ConradNeural"
    }, {
      code: "es",
      name: "Spanish",
      nativeName: "Español",
      viName: "Tiếng Tây Ban Nha",
      flag: "🇪🇸",
      edgeTtsVoice: "es-ES-ElviraNeural",
      edgeTtsVoiceMale: "es-ES-AlvaroNeural"
    }, {
      code: "pt",
      name: "Portuguese",
      nativeName: "Português",
      viName: "Tiếng Bồ Đào Nha",
      flag: "🇧🇷",
      edgeTtsVoice: "pt-BR-FranciscaNeural",
      edgeTtsVoiceMale: "pt-BR-AntonioNeural"
    }, {
      code: "ru",
      name: "Russian",
      nativeName: "Русский",
      viName: "Tiếng Nga",
      flag: "🇷🇺",
      edgeTtsVoice: "ru-RU-SvetlanaNeural",
      edgeTtsVoiceMale: "ru-RU-DmitryNeural"
    }, {
      code: "th",
      name: "Thai",
      nativeName: "ไทย",
      viName: "Tiếng Thái",
      flag: "🇹🇭",
      edgeTtsVoice: "th-TH-PremwadeeNeural",
      edgeTtsVoiceMale: "th-TH-NiwatNeural"
    }, {
      code: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      viName: "Tiếng Indonesia",
      flag: "🇮🇩",
      edgeTtsVoice: "id-ID-GadisNeural",
      edgeTtsVoiceMale: "id-ID-ArdiNeural"
    }, {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      viName: "Tiếng Ả Rập",
      flag: "🇸🇦",
      edgeTtsVoice: "ar-SA-ZariyahNeural",
      edgeTtsVoiceMale: "ar-SA-HamedNeural"
    }, {
      code: "af",
      name: "Afrikaans",
      nativeName: "Afrikaans",
      viName: "Tiếng Afrikaans",
      flag: "🇿🇦",
      edgeTtsVoice: "af-ZA-AdriNeural",
      edgeTtsVoiceMale: "af-ZA-WillemNeural"
    }, {
      code: "sq",
      name: "Albanian",
      nativeName: "Shqip",
      viName: "Tiếng Albania",
      flag: "🇦🇱",
      edgeTtsVoice: "sq-AL-AnilaNeural",
      edgeTtsVoiceMale: "sq-AL-IlirNeural"
    }, {
      code: "am",
      name: "Amharic",
      nativeName: "አማርኛ",
      viName: "Tiếng Amharic",
      flag: "🇪🇹",
      edgeTtsVoice: "am-ET-MekdesNeural",
      edgeTtsVoiceMale: "am-ET-AmehaNeural"
    }, {
      code: "az",
      name: "Azerbaijani",
      nativeName: "Azərbaycanca",
      viName: "Tiếng Azerbaijan",
      flag: "🇦🇿",
      edgeTtsVoice: "az-AZ-BanuNeural",
      edgeTtsVoiceMale: "az-AZ-BabekNeural"
    }, {
      code: "bn",
      name: "Bengali",
      nativeName: "বাংলা",
      viName: "Tiếng Bengal",
      flag: "🇧🇩",
      edgeTtsVoice: "bn-BD-NabanitaNeural",
      edgeTtsVoiceMale: "bn-BD-PradeepNeural"
    }, {
      code: "bs",
      name: "Bosnian",
      nativeName: "Bosanski",
      viName: "Tiếng Bosnia",
      flag: "🇧🇦",
      edgeTtsVoice: "bs-BA-VesnaNeural",
      edgeTtsVoiceMale: "bs-BA-GoranNeural"
    }, {
      code: "bg",
      name: "Bulgarian",
      nativeName: "Български",
      viName: "Tiếng Bulgaria",
      flag: "🇧🇬",
      edgeTtsVoice: "bg-BG-KalinaNeural",
      edgeTtsVoiceMale: "bg-BG-BorislavNeural"
    }, {
      code: "my",
      name: "Burmese",
      nativeName: "မြန်မာ",
      viName: "Tiếng Myanmar",
      flag: "🇲🇲",
      edgeTtsVoice: "my-MM-NilarNeural",
      edgeTtsVoiceMale: "my-MM-ThihaNeural"
    }, {
      code: "ca",
      name: "Catalan",
      nativeName: "Català",
      viName: "Tiếng Catalunya",
      flag: "🇪🇸",
      edgeTtsVoice: "ca-ES-JoanaNeural",
      edgeTtsVoiceMale: "ca-ES-EnricNeural"
    }, {
      code: "hr",
      name: "Croatian",
      nativeName: "Hrvatski",
      viName: "Tiếng Croatia",
      flag: "🇭🇷",
      edgeTtsVoice: "hr-HR-GabrijelaNeural",
      edgeTtsVoiceMale: "hr-HR-SreckoNeural"
    }, {
      code: "cs",
      name: "Czech",
      nativeName: "Čeština",
      viName: "Tiếng Séc",
      flag: "🇨🇿",
      edgeTtsVoice: "cs-CZ-VlastaNeural",
      edgeTtsVoiceMale: "cs-CZ-AntoninNeural"
    }, {
      code: "da",
      name: "Danish",
      nativeName: "Dansk",
      viName: "Tiếng Đan Mạch",
      flag: "🇩🇰",
      edgeTtsVoice: "da-DK-ChristelNeural",
      edgeTtsVoiceMale: "da-DK-JeppeNeural"
    }, {
      code: "nl",
      name: "Dutch",
      nativeName: "Nederlands",
      viName: "Tiếng Hà Lan",
      flag: "🇳🇱",
      edgeTtsVoice: "nl-NL-ColetteNeural",
      edgeTtsVoiceMale: "nl-NL-MaartenNeural"
    }, {
      code: "et",
      name: "Estonian",
      nativeName: "Eesti",
      viName: "Tiếng Estonia",
      flag: "🇪🇪",
      edgeTtsVoice: "et-EE-AnuNeural",
      edgeTtsVoiceMale: "et-EE-KertNeural"
    }, {
      code: "fil",
      name: "Filipino",
      nativeName: "Filipino",
      viName: "Tiếng Filipino",
      flag: "🇵🇭",
      edgeTtsVoice: "fil-PH-BlessicaNeural",
      edgeTtsVoiceMale: "fil-PH-AngeloNeural"
    }, {
      code: "fi",
      name: "Finnish",
      nativeName: "Suomi",
      viName: "Tiếng Phần Lan",
      flag: "🇫🇮",
      edgeTtsVoice: "fi-FI-NooraNeural",
      edgeTtsVoiceMale: "fi-FI-HarriNeural"
    }, {
      code: "gl",
      name: "Galician",
      nativeName: "Galego",
      viName: "Tiếng Galicia",
      flag: "🇪🇸",
      edgeTtsVoice: "gl-ES-SabelaNeural",
      edgeTtsVoiceMale: "gl-ES-RoiNeural"
    }, {
      code: "ka",
      name: "Georgian",
      nativeName: "ქართული",
      viName: "Tiếng Gruzia",
      flag: "🇬🇪",
      edgeTtsVoice: "ka-GE-EkaNeural",
      edgeTtsVoiceMale: "ka-GE-GiorgiNeural"
    }, {
      code: "el",
      name: "Greek",
      nativeName: "Ελληνικά",
      viName: "Tiếng Hy Lạp",
      flag: "🇬🇷",
      edgeTtsVoice: "el-GR-AthinaNeural",
      edgeTtsVoiceMale: "el-GR-NestorasNeural"
    }, {
      code: "gu",
      name: "Gujarati",
      nativeName: "ગુજરાતી",
      viName: "Tiếng Gujarati",
      flag: "🇮🇳",
      edgeTtsVoice: "gu-IN-DhwaniNeural",
      edgeTtsVoiceMale: "gu-IN-NiranjanNeural"
    }, {
      code: "he",
      name: "Hebrew",
      nativeName: "עברית",
      viName: "Tiếng Do Thái",
      flag: "🇮🇱",
      edgeTtsVoice: "he-IL-HilaNeural",
      edgeTtsVoiceMale: "he-IL-AvriNeural"
    }, {
      code: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
      viName: "Tiếng Hindi",
      flag: "🇮🇳",
      edgeTtsVoice: "hi-IN-SwaraNeural",
      edgeTtsVoiceMale: "hi-IN-MadhurNeural"
    }, {
      code: "hu",
      name: "Hungarian",
      nativeName: "Magyar",
      viName: "Tiếng Hungary",
      flag: "🇭🇺",
      edgeTtsVoice: "hu-HU-NoemiNeural",
      edgeTtsVoiceMale: "hu-HU-TamasNeural"
    }, {
      code: "is",
      name: "Icelandic",
      nativeName: "Íslenska",
      viName: "Tiếng Iceland",
      flag: "🇮🇸",
      edgeTtsVoice: "is-IS-GudrunNeural",
      edgeTtsVoiceMale: "is-IS-GunnarNeural"
    }, {
      code: "iu",
      name: "Inuktitut",
      nativeName: "ᐃᓄᒃᑎᑐᑦ",
      viName: "Tiếng Inuktitut",
      flag: "🇨🇦",
      edgeTtsVoice: "iu-Latn-CA-SiqiniqNeural",
      edgeTtsVoiceMale: "iu-Latn-CA-TaqqiqNeural"
    }, {
      code: "ga",
      name: "Irish",
      nativeName: "Gaeilge",
      viName: "Tiếng Ireland",
      flag: "🇮🇪",
      edgeTtsVoice: "ga-IE-OrlaNeural",
      edgeTtsVoiceMale: "ga-IE-ColmNeural"
    }, {
      code: "it",
      name: "Italian",
      nativeName: "Italiano",
      viName: "Tiếng Ý",
      flag: "🇮🇹",
      edgeTtsVoice: "it-IT-ElsaNeural",
      edgeTtsVoiceMale: "it-IT-DiegoNeural"
    }, {
      code: "jv",
      name: "Javanese",
      nativeName: "Basa Jawa",
      viName: "Tiếng Java",
      flag: "🇮🇩",
      edgeTtsVoice: "jv-ID-SitiNeural",
      edgeTtsVoiceMale: "jv-ID-DimasNeural"
    }, {
      code: "kn",
      name: "Kannada",
      nativeName: "ಕನ್ನಡ",
      viName: "Tiếng Kannada",
      flag: "🇮🇳",
      edgeTtsVoice: "kn-IN-SapnaNeural",
      edgeTtsVoiceMale: "kn-IN-GaganNeural"
    }, {
      code: "kk",
      name: "Kazakh",
      nativeName: "Қазақша",
      viName: "Tiếng Kazakhstan",
      flag: "🇰🇿",
      edgeTtsVoice: "kk-KZ-AigulNeural",
      edgeTtsVoiceMale: "kk-KZ-DauletNeural"
    }, {
      code: "km",
      name: "Khmer",
      nativeName: "ខ្មែរ",
      viName: "Tiếng Khmer",
      flag: "🇰🇭",
      edgeTtsVoice: "km-KH-SreymomNeural",
      edgeTtsVoiceMale: "km-KH-PisethNeural"
    }, {
      code: "lo",
      name: "Lao",
      nativeName: "ລາວ",
      viName: "Tiếng Lào",
      flag: "🇱🇦",
      edgeTtsVoice: "lo-LA-KeomanyNeural",
      edgeTtsVoiceMale: "lo-LA-ChanthavongNeural"
    }, {
      code: "lv",
      name: "Latvian",
      nativeName: "Latviešu",
      viName: "Tiếng Latvia",
      flag: "🇱🇻",
      edgeTtsVoice: "lv-LV-EveritaNeural",
      edgeTtsVoiceMale: "lv-LV-NilsNeural"
    }, {
      code: "lt",
      name: "Lithuanian",
      nativeName: "Lietuvių",
      viName: "Tiếng Litva",
      flag: "🇱🇹",
      edgeTtsVoice: "lt-LT-OnaNeural",
      edgeTtsVoiceMale: "lt-LT-LeonasNeural"
    }, {
      code: "mk",
      name: "Macedonian",
      nativeName: "Македонски",
      viName: "Tiếng Macedonia",
      flag: "🇲🇰",
      edgeTtsVoice: "mk-MK-MarijaNeural",
      edgeTtsVoiceMale: "mk-MK-AleksandarNeural"
    }, {
      code: "ms",
      name: "Malay",
      nativeName: "Bahasa Melayu",
      viName: "Tiếng Mã Lai",
      flag: "🇲🇾",
      edgeTtsVoice: "ms-MY-YasminNeural",
      edgeTtsVoiceMale: "ms-MY-OsmanNeural"
    }, {
      code: "ml",
      name: "Malayalam",
      nativeName: "മലയാളം",
      viName: "Tiếng Malayalam",
      flag: "🇮🇳",
      edgeTtsVoice: "ml-IN-SobhanaNeural",
      edgeTtsVoiceMale: "ml-IN-MidhunNeural"
    }, {
      code: "mt",
      name: "Maltese",
      nativeName: "Malti",
      viName: "Tiếng Malta",
      flag: "🇲🇹",
      edgeTtsVoice: "mt-MT-GraceNeural",
      edgeTtsVoiceMale: "mt-MT-JosephNeural"
    }, {
      code: "mr",
      name: "Marathi",
      nativeName: "मराठी",
      viName: "Tiếng Marathi",
      flag: "🇮🇳",
      edgeTtsVoice: "mr-IN-AarohiNeural",
      edgeTtsVoiceMale: "mr-IN-ManoharNeural"
    }, {
      code: "mn",
      name: "Mongolian",
      nativeName: "Монгол",
      viName: "Tiếng Mông Cổ",
      flag: "🇲🇳",
      edgeTtsVoice: "mn-MN-YesuiNeural",
      edgeTtsVoiceMale: "mn-MN-BataaNeural"
    }, {
      code: "ne",
      name: "Nepali",
      nativeName: "नेपाली",
      viName: "Tiếng Nepal",
      flag: "🇳🇵",
      edgeTtsVoice: "ne-NP-HemkalaNeural",
      edgeTtsVoiceMale: "ne-NP-SagarNeural"
    }, {
      code: "nb",
      name: "Norwegian Bokmål",
      nativeName: "Norsk bokmål",
      viName: "Tiếng Na Uy",
      flag: "🇳🇴",
      edgeTtsVoice: "nb-NO-PernilleNeural",
      edgeTtsVoiceMale: "nb-NO-FinnNeural"
    }, {
      code: "ps",
      name: "Pashto",
      nativeName: "پښتو",
      viName: "Tiếng Pashto",
      flag: "🇦🇫",
      edgeTtsVoice: "ps-AF-LatifaNeural",
      edgeTtsVoiceMale: "ps-AF-GulNawazNeural"
    }, {
      code: "fa",
      name: "Persian",
      nativeName: "فارسی",
      viName: "Tiếng Ba Tư",
      flag: "🇮🇷",
      edgeTtsVoice: "fa-IR-DilaraNeural",
      edgeTtsVoiceMale: "fa-IR-FaridNeural"
    }, {
      code: "pl",
      name: "Polish",
      nativeName: "Polski",
      viName: "Tiếng Ba Lan",
      flag: "🇵🇱",
      edgeTtsVoice: "pl-PL-ZofiaNeural",
      edgeTtsVoiceMale: "pl-PL-MarekNeural"
    }, {
      code: "ro",
      name: "Romanian",
      nativeName: "Română",
      viName: "Tiếng Romania",
      flag: "🇷🇴",
      edgeTtsVoice: "ro-RO-AlinaNeural",
      edgeTtsVoiceMale: "ro-RO-EmilNeural"
    }, {
      code: "sr",
      name: "Serbian",
      nativeName: "Српски",
      viName: "Tiếng Serbia",
      flag: "🇷🇸",
      edgeTtsVoice: "sr-RS-SophieNeural",
      edgeTtsVoiceMale: "sr-RS-NicholasNeural"
    }, {
      code: "si",
      name: "Sinhala",
      nativeName: "සිංහල",
      viName: "Tiếng Sinhala",
      flag: "🇱🇰",
      edgeTtsVoice: "si-LK-ThiliniNeural",
      edgeTtsVoiceMale: "si-LK-SameeraNeural"
    }, {
      code: "sk",
      name: "Slovak",
      nativeName: "Slovenčina",
      viName: "Tiếng Slovakia",
      flag: "🇸🇰",
      edgeTtsVoice: "sk-SK-ViktoriaNeural",
      edgeTtsVoiceMale: "sk-SK-LukasNeural"
    }, {
      code: "sl",
      name: "Slovenian",
      nativeName: "Slovenščina",
      viName: "Tiếng Slovenia",
      flag: "🇸🇮",
      edgeTtsVoice: "sl-SI-PetraNeural",
      edgeTtsVoiceMale: "sl-SI-RokNeural"
    }, {
      code: "so",
      name: "Somali",
      nativeName: "Soomaali",
      viName: "Tiếng Somali",
      flag: "🇸🇴",
      edgeTtsVoice: "so-SO-UbaxNeural",
      edgeTtsVoiceMale: "so-SO-MuuseNeural"
    }, {
      code: "su",
      name: "Sundanese",
      nativeName: "Basa Sunda",
      viName: "Tiếng Sunda",
      flag: "🇮🇩",
      edgeTtsVoice: "su-ID-TutiNeural",
      edgeTtsVoiceMale: "su-ID-JajangNeural"
    }, {
      code: "sw",
      name: "Swahili",
      nativeName: "Kiswahili",
      viName: "Tiếng Swahili",
      flag: "🇰🇪",
      edgeTtsVoice: "sw-KE-ZuriNeural",
      edgeTtsVoiceMale: "sw-KE-RafikiNeural"
    }, {
      code: "sv",
      name: "Swedish",
      nativeName: "Svenska",
      viName: "Tiếng Thụy Điển",
      flag: "🇸🇪",
      edgeTtsVoice: "sv-SE-SofieNeural",
      edgeTtsVoiceMale: "sv-SE-MattiasNeural"
    }, {
      code: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
      viName: "Tiếng Tamil",
      flag: "🇮🇳",
      edgeTtsVoice: "ta-IN-PallaviNeural",
      edgeTtsVoiceMale: "ta-IN-ValluvarNeural"
    }, {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      viName: "Tiếng Telugu",
      flag: "🇮🇳",
      edgeTtsVoice: "te-IN-ShrutiNeural",
      edgeTtsVoiceMale: "te-IN-MohanNeural"
    }, {
      code: "tr",
      name: "Turkish",
      nativeName: "Türkçe",
      viName: "Tiếng Thổ Nhĩ Kỳ",
      flag: "🇹🇷",
      edgeTtsVoice: "tr-TR-EmelNeural",
      edgeTtsVoiceMale: "tr-TR-AhmetNeural"
    }, {
      code: "uk",
      name: "Ukrainian",
      nativeName: "Українська",
      viName: "Tiếng Ukraina",
      flag: "🇺🇦",
      edgeTtsVoice: "uk-UA-PolinaNeural",
      edgeTtsVoiceMale: "uk-UA-OstapNeural"
    }, {
      code: "ur",
      name: "Urdu",
      nativeName: "اردو",
      viName: "Tiếng Urdu",
      flag: "🇵🇰",
      edgeTtsVoice: "ur-PK-UzmaNeural",
      edgeTtsVoiceMale: "ur-PK-AsadNeural"
    }, {
      code: "uz",
      name: "Uzbek",
      nativeName: "Oʻzbek",
      viName: "Tiếng Uzbekistan",
      flag: "🇺🇿",
      edgeTtsVoice: "uz-UZ-MadinaNeural",
      edgeTtsVoiceMale: "uz-UZ-SardorNeural"
    }, {
      code: "cy",
      name: "Welsh",
      nativeName: "Cymraeg",
      viName: "Tiếng Wales",
      flag: "🇬🇧",
      edgeTtsVoice: "cy-GB-NiaNeural",
      edgeTtsVoiceMale: "cy-GB-AledNeural"
    }, {
      code: "zu",
      name: "Zulu",
      nativeName: "isiZulu",
      viName: "Tiếng Zulu",
      flag: "🇿🇦",
      edgeTtsVoice: "zu-ZA-ThandoNeural",
      edgeTtsVoiceMale: "zu-ZA-ThembaNeural"
    }];

  function n(e) {
    return "string" == typeof e && i.some(t => t.code === e)
  }
  let a = [{
      value: "vi",
      name: "Vietnamese",
      nativeName: "Tiếng Việt",
      viName: "Tiếng Việt",
      label: "Tiếng Việt",
      description: "Dịch sang tiếng Việt."
    }, {
      value: "en",
      name: "English",
      nativeName: "English",
      viName: "Tiếng Anh",
      label: "Tiếng Anh",
      description: "Dịch sang tiếng Anh."
    }, {
      value: "zh",
      name: "Chinese",
      nativeName: "中文",
      viName: "Tiếng Trung",
      label: "Tiếng Trung",
      description: "Dịch sang tiếng Trung."
    }, {
      value: "ja",
      name: "Japanese",
      nativeName: "日本語",
      viName: "Tiếng Nhật",
      label: "Tiếng Nhật",
      description: "Dịch sang tiếng Nhật."
    }, {
      value: "ko",
      name: "Korean",
      nativeName: "한국어",
      viName: "Tiếng Hàn",
      label: "Tiếng Hàn",
      description: "Dịch sang tiếng Hàn."
    }, {
      value: "th",
      name: "Thai",
      nativeName: "ไทย",
      viName: "Tiếng Thái",
      label: "Tiếng Thái",
      description: "Dịch sang tiếng Thái."
    }],
    r = new Set(a.map(e => e.value)),
    o = i.filter(e => !r.has(e.code)).map(e => ({
      value: e.code,
      name: e.name,
      nativeName: e.nativeName,
      viName: e.viName,
      label: `${e.flag} ${e.nativeName}`,
      description: `Dịch sang ${e.viName}.`
    }));

  function s(e) {
    return t.some(t => t.value === e)
  }
  e.s(["DASHBOARD_ADDITIONAL_TARGET_LANGUAGE_OPTIONS", 0, o, "DASHBOARD_PRIMARY_TARGET_LANGUAGE_OPTIONS", 0, a, "DASHBOARD_SOURCE_LANGUAGE_OPTIONS", 0, t, "TRANSLATION_TARGET_LANGUAGES", 0, i, "edgeTtsVoiceForTargetLanguage", 0, function(e, t) {
    let n = e?.trim().toLowerCase();
    if (!n) return;
    let a = i.find(e => e.code === n);
    if (a) return "male" === t ? a.edgeTtsVoiceMale : a.edgeTtsVoice
  }, "isSourceLanguageCode", 0, s, "isTargetLanguageCode", 0, n, "normalizeSourceLanguageCode", 0, function(e) {
    return s(e) ? e : "zh"
  }, "normalizeTargetLanguageCode", 0, function(e) {
    return n(e) ? e : "vi"
  }])
}, 27875, e => {
  "use strict";
  var t = e.i(54302),
    i = e.i(72888),
    n = e.i(18849),
    a = e.i(77496);
  let r = n.DICHVIDEO_VOICE_OPTIONS.map(e => ({
      id: e.id,
      label: e.label,
      shortLabel: e.shortLabel,
      description: e.description,
      provider: e.provider,
      voice: e.voice,
      demoAudioPath: e.demoAudioPath,
      gender: e.gender
    })),
    o = a.VIRAL_VOICE_OPTIONS.map(e => ({
      id: e.id,
      label: e.label,
      shortLabel: e.shortLabel,
      description: e.description,
      provider: e.provider,
      voice: e.id,
      demoAudioPath: e.demoAudioPath,
      gender: e.gender
    })),
    s = [{
      id: "vieneu",
      label: "Giọng cao cấp",
      get options() {
        return (0, t.getVieNeuVoiceOptions)().map(e => ({
          id: e.id,
          label: e.label,
          shortLabel: e.shortLabel,
          description: e.description,
          provider: e.provider,
          voice: e.voice,
          demoAudioPath: e.demoAudioPath,
          category: e.category,
          categoryLabel: e.categoryLabel,
          gender: e.gender,
          region: e.region
        }))
      }
    }, {
      id: "dichvideo",
      label: "Giọng DichVideo",
      options: r
    }, {
      id: "cc",
      label: "Giọng CC",
      options: o
    }];
  e.s(["PREMIUM_VOICE_GROUPS", 0, s, "getPremiumVoiceOptions", 0, function() {
    return s.flatMap(e => e.options)
  }, "isPremiumVoiceId", 0, function(e) {
    return (0, n.isDichVideoVoiceId)(e) || (0, a.isViralVoiceId)(e) || (0, t.isVieNeuVoiceId)(e) || (0, i.isVieNeuTurboVoiceId)(e)
  }])
}, 5071, e => {
  "use strict";
  var t = e.i(68834),
    i = e.i(79473),
    n = e.i(48868),
    a = e.i(88455),
    r = e.i(18849),
    o = e.i(77496),
    s = e.i(27875);
  let l = {
    sourceLang: "zh",
    targetLang: "vi",
    processingMode: "balanced",
    voiceMode: "male",
    originalAudioMode: "keep_low"
  };

  function d(e) {
    return "string" == typeof e && ((0, r.isDichVideoVoiceId)(e) || (0, o.isViralVoiceId)(e) || (0, s.isPremiumVoiceId)(e)) || "female" === e || "none" === e ? e : "male"
  }

  function u(e) {
    return "keep_full" === e || "separate_background" === e || "muted" === e ? e : "keep_low"
  }

  function c(e) {
    return "ocr_only" === e ? e : "balanced"
  }
  let p = (0, t.create)()((0, i.persist)(e => ({
    ...l,
    setSourceLang: t => e({
      sourceLang: (0, a.normalizeSourceLanguageCode)(t)
    }),
    setTargetLang: t => e({
      targetLang: (0, a.normalizeTargetLanguageCode)(t)
    }),
    setProcessingMode: t => e({
      processingMode: c(t)
    }),
    setVoiceMode: t => e({
      voiceMode: d(t)
    }),
    setOriginalAudioMode: t => e({
      originalAudioMode: u(t)
    })
  }), {
    name: "dichvideo-dashboard-preferences",
    storage: (0, i.createJSONStorage)(() => (0, n.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      sourceLang: e.sourceLang,
      targetLang: e.targetLang,
      processingMode: e.processingMode,
      voiceMode: e.voiceMode,
      originalAudioMode: e.originalAudioMode
    }),
    merge: (e, t) => ({
      ...t,
      sourceLang: (0, a.normalizeSourceLanguageCode)(e?.sourceLang),
      targetLang: (0, a.normalizeTargetLanguageCode)(e?.targetLang),
      processingMode: c(e?.processingMode),
      voiceMode: d(e?.voiceMode),
      originalAudioMode: u(e?.originalAudioMode)
    })
  }));
  e.s(["useDashboardPreferencesStore", 0, p])
}, 31868, e => {
  "use strict";

  function t(e) {
    let t = Math.max(0, Math.round(Number.isFinite(e) ? e : 0)),
      i = Math.floor(t / 36e5),
      n = Math.floor(t % 36e5 / 6e4),
      a = Math.floor(t % 6e4 / 1e3);
    return `${String(i).padStart(2,"0")}:${String(n).padStart(2,"0")}:${String(a).padStart(2,"0")},${String(t%1e3).padStart(3,"0")}`
  }

  function i(e) {
    return e.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map(e => e.trim()).filter(Boolean).join("\n")
  }

  function n(e, n) {
    let a = e.map(e => ({
      subtitle: e,
      text: i(e[n])
    })).filter(({
      text: e
    }) => e.length > 0).map(({
      subtitle: e,
      text: i
    }, n) => [String(n + 1), `${t(e.startTime)} --> ${t(e.endTime)}`, i].join("\n"));
    return a.length > 0 ? a.join("\n\n").concat("\n") : ""
  }

  function a(e) {
    let t = e.trim().split(/[\\/]/).pop() || "video",
      i = t.lastIndexOf(".");
    return i > 0 ? t.slice(0, i) : t
  }
  e.s(["normalizeSubtitleTextForSrt", 0, i, "originalSrtFileNameForVideo", 0, function(e) {
    return `${a(e)||"video"}-phu-de-goc.srt`
  }, "subtitlesToSrt", 0, n, "subtitlesToVoiceSrt", 0, function(e) {
    return n(e, "translatedText")
  }, "translatedSrtFileNameForVideo", 0, function(e) {
    return `${a(e)||"video"}-phu-de-dich.srt`
  }])
}, 43424, 35269, 74296, e => {
  "use strict";
  let t = Promise.resolve(),
    i = 0,
    n = 0;
  async function a(e, r = {}) {
    let o, s = i + n;
    n += 1;
    let l = t.catch(() => void 0),
      d = new Promise(e => {
        o = e
      });
    t = l.then(() => d), s > 0 && await r.onQueued?.(s), await l, n = Math.max(0, n - 1), i = 1, await r.onStarted?.();
    try {
      return await e()
    } finally {
      i = 0, o()
    }
  }

  function r(e) {
    return "queued" === e ? "Đang xếp video..." : "preparing" === e || "loading" === e || "prepare" === e ? "Đang chuẩn bị video..." : "preprocess" === e || "extract_audio" === e ? "Đang chuẩn bị âm thanh..." : "transcribe" === e || "stt" === e ? "Đang tạo phụ đề..." : "align" === e || "subtitles" === e ? "Đang căn phụ đề..." : "server_translate" === e || "translate" === e || "translation" === e ? "Đang dịch nội dung..." : "synthesize_voice" === e || "tts" === e || "translation_tts_pipeline" === e ? "Đang tạo giọng đọc..." : "source_pts_index" === e ? "Đang lập chỉ mục hình" : "retime_video" === e ? "Đang tự kéo dài video để giọng đọc đều hơn..." : "compose_audio" === e ? "Đang ghép âm thanh..." : "source_separation" === e ? "Đang tách giọng gốc, giữ tiếng nền..." : "export" === e ? "Đang hoàn thiện video..." : "trace" === e ? "Đang kiểm tra kết quả..." : "completed" === e ? "Hoàn tất." : "Đang xử lý video..."
  }
  e.s(["runExclusiveLocalCpuJob", 0, a], 43424), e.s(["taskMessageForLocalEngineStage", 0, r, "videoStatusForLocalEngineStage", 0, function(e) {
    return "preparing" === e || "loading" === e || "prepare" === e || "preprocess" === e || "extract_audio" === e || "transcribe" === e || "stt" === e || "align" === e || "subtitles" === e ? "transcribing" : "server_translate" === e || "translate" === e || "translation" === e ? "translating" : "synthesize_voice" === e || "tts" === e || "translation_tts_pipeline" === e ? "generating_tts" : "source_pts_index" === e || "retime_video" === e || "compose_audio" === e || "source_separation" === e || "export" === e || "trace" === e ? "exporting" : "completed" === e ? "completed" : "translating"
  }], 35269), e.s(["createEditedSubtitleTtsRefreshTask", 0, function(e) {
    return {
      videoId: e,
      type: "tts",
      status: "processing",
      progress: 1,
      message: "Đang tạo lại âm thanh từ phụ đề đã sửa..."
    }
  }, "editedSubtitleTtsRefreshCompletedTaskUpdate", 0, function(e, t) {
    return {
      progress: 100,
      status: "completed",
      message: `Đ\xe3 tạo lại \xe2m thanh (${e}/${t} đoạn tạo lại).`
    }
  }, "editedSubtitleTtsRefreshFailedTaskUpdate", 0, function(e) {
    return {
      status: "error",
      message: "Không tạo lại được âm thanh.",
      error: e
    }
  }, "editedSubtitleTtsRefreshProgressTaskUpdate", 0, function(e, t) {
    if (t && t.totalCount > 1) {
      let i = 100 / t.totalCount,
        n = Math.max(0, Math.min(100, e.percent)) / 100 * i,
        a = Math.max(Math.max(1, Math.min(99, Math.floor(t.completedCount * i + n))), t.minProgress ?? 1),
        r = Math.min(t.totalCount, t.completedCount + 1);
      return {
        progress: a,
        message: `Đang tạo giọng ${r}/${t.totalCount}...`
      }
    }
    return {
      progress: Math.max(Math.max(1, Math.min(99, e.percent)), t?.minProgress ?? 1),
      message: r(e.stage)
    }
  }, "editedSubtitleTtsRefreshQueuedTaskUpdate", 0, function() {
    return {
      progress: 1,
      message: "Đang chờ tài nguyên CPU để tạo lại âm thanh..."
    }
  }, "editedSubtitleTtsRefreshStartedTaskUpdate", 0, function() {
    return {
      progress: 4,
      message: "Đang chuẩn bị tạo lại âm thanh..."
    }
  }, "videoStatusForEditedSubtitleTtsRefreshStage", 0, function(e) {
    return "compose_audio" === e || "export" === e ? "exporting" : "generating_tts"
  }], 74296)
}, 79705, e => {
  "use strict";
  var t = e.i(32217);
  let i = "dichvideo-engine-vnext",
    n = "dichvideo-engine-vnext-native",
    a = "local-engine",
    r = "translation_needs_manual_review",
    o = new Set(["completed", "failed", "canceled"]);

  function s(e) {
    let i = (0, t.errorTextField)(e, "code") || (0, t.errorTextField)(e, "error_code");
    return i || (e instanceof Error ? e.message : "string" == typeof e ? e : "")
  }

  function l(e) {
    return {
      engine_policy_version: e?.engine_policy_version ?? null,
      translation_route: e?.translation_route ?? null,
      tts_route: e?.tts_route ?? null,
      tts_fallback_reason: null,
      runtime_trust_set_id: e?.runtime_trust_set_id ?? null
    }
  }

  function d(e) {
    return "number" == typeof e && Number.isFinite(e) && e >= 0 ? Math.round(e) : null
  }

  function u(e) {
    return "string" == typeof e && e.trim() ? e.trim() : null
  }

  function c(e) {
    return {
      preflight_wall_ms: d(e?.preflight_wall_ms),
      preflight_backend_ms: d(e?.preflight_backend_ms),
      runtime_package_hash: u(e?.runtime_package_hash),
      engine_family: u(e?.engine_family)
    }
  }

  function p(e) {
    return "completed" === e.status ? null : (0, t.metricText)(e.error_code, t.METRICS_ERROR_CODE_LIMIT) ?? ("canceled" === e.status ? "job_canceled" : "local_engine_failed")
  }

  function g(e) {
    return "completed" === e.status ? null : (0, t.metricText)(e.error_message, t.METRICS_ERROR_MESSAGE_LIMIT)
  }

  function h(e) {
    let i = s(e) || (0, t.errorTextField)(e, "error_code");
    return /^(vnext|native|nle|viral|job|request|server|auth|trial|local)_[a-z0-9_]+$/i.test(i) && i.length <= t.METRICS_ERROR_CODE_LIMIT ? (0, t.metricText)(i, t.METRICS_ERROR_CODE_LIMIT) ?? "local_engine_launch_failed" : "local_engine_launch_failed"
  }

  function m(e) {
    return "number" == typeof e && Number.isFinite(e) ? e : null
  }

  function f(e) {
    if (!e) return null;
    let t = "fixed_voice_speed" === e.mode ? e : null,
      i = "hybrid_stretch" === e.mode ? e : null,
      n = t ? "fixed_voice_speed" : i ? "hybrid_stretch" : "source_timeline",
      a = !!(t || i);
    return {
      dubbing_timeline_mode: n,
      target_tempo: t ? t.requestedVoiceRateTenths / 10 : m(i?.targetTempo),
      max_video_slowdown: m(i?.maxVideoSlowdown),
      max_total_stretch_ratio: m(i?.maxTotalStretchRatio),
      retime_requested: a,
      retime_skipped: !a
    }
  }

  function _(e) {
    let t = f(e);
    return t ? {
      event: "native_dubbing_timeline",
      metadata: t
    } : null
  }

  function v(e, i = 1200) {
    let n = (0, t.diagnosticTextForPipelineError)(e).replace(/Bearer\s+\S+/gi, "Bearer <redacted>").replace(/\b(auth_token|job_token|api_key|apikey|password|secret)\s*[:=]\s*[^,\s|;]+/gi, (e, t) => `${t}=<redacted>`).replace(/[A-Za-z]:[\\/][^\s"'|]+/g, "<path>").replace(/-filter_complex\s+[^|]+/gi, "-filter_complex <redacted>").replace(/vnext\.sherpa_sensevoice_2024_int8/g, "vnext.stt_primary").replace(/vnext\.sherpa_multilingual/g, "vnext.stt_general").replace(/legacy\.soni_whisperx/g, "legacy.local").replace(/sensevoice-2024-int8/g, "model.primary").replace(/sherpa-multilingual-selected/g, "model.general").replace(/silero-vad-selected/g, "model.activity").replace(/sherpa-onnx/g, "media-core").replace(/\s+/g, " ").trim();
    if (!n) return null;
    let a = [...n];
    if (a.length <= i) return n;
    if (i <= 16) return a.slice(0, i).join("");
    let r = " ... ",
      o = [...r].length,
      s = Math.min(180, Math.floor((i - o) / 3)),
      l = i - o - s;
    return `${a.slice(0,s).join("")}${r}${a.slice(-l).join("")}`
  }

  function b(e, t = 1200) {
    if (null != e && ("string" != typeof e || e.trim())) return v(e, t) ?? void 0
  }

  function S(e, t = 20) {
    return e.map(e => b(e, 320)).filter(e => !!e).slice(0, t)
  }

  function y(e, i, n, a, r, o) {
    let s = b((0, t.errorTextField)(e, "developerMessage") || (0, t.errorTextField)(e, "developer_message")),
      l = b((0, t.errorTextField)(e, "customerMessage") || (0, t.errorTextField)(e, "customer_message"), 400),
      d = (0, t.errorTextField)(e, "fallbackAllowed") || (0, t.errorTextField)(e, "fallback_allowed") || void 0,
      u = f(o);
    return {
      app_surface: "desktop",
      job_family: "local_video_translate",
      code: i,
      diagnostic: v(e),
      developer_message: s ?? null,
      customer_message: l ?? null,
      fallback_allowed: d ?? null,
      source_video_seconds: "number" == typeof r && Number.isFinite(r) ? r : null,
      engine_family: n.engine_family,
      runtime_package_hash: n.runtime_package_hash,
      preflight_wall_ms: n.preflight_wall_ms,
      preflight_backend_ms: n.preflight_backend_ms,
      engine_policy_version: a?.engine_policy_version ?? null,
      translation_route: a?.translation_route ?? null,
      tts_route: a?.tts_route ?? null,
      runtime_trust_set_id: a?.runtime_trust_set_id ?? null,
      ...u ?? {}
    }
  }

  function P(e, t, i) {
    if (!t.metrics) return null;
    let n = "failed" === t.metrics.status || "canceled" === t.metrics.status || "needs_review" === t.metrics.status ? t.metrics.status : "completed",
      a = t.qualityWarnings.length > 0 ? t.qualityWarnings : t.metrics.quality_warnings,
      o = "needs_review" !== t.status || a.includes(r) ? a : [...a, r];
    return {
      ...t.metrics,
      status: n,
      engine_policy_version: e.engine_policy_version ?? t.metrics.engine_policy_version ?? null,
      translation_route: e.translation_route ?? t.metrics.translation_route ?? null,
      tts_route: t.metrics.tts_route ?? e.tts_route ?? null,
      tts_fallback_reason: t.metrics.tts_fallback_reason ?? null,
      runtime_trust_set_id: e.runtime_trust_set_id ?? t.metrics.runtime_trust_set_id ?? null,
      error_code: t.metrics.error_code ?? null,
      error_message: t.metrics.error_message ?? null,
      quality_warnings: o,
      ...c(i)
    }
  }
  e.s(["ENGINE_VNEXT_FAMILY", 0, i, "ENGINE_VNEXT_NATIVE_FAMILY", 0, n, "LEGACY_ENGINE_FAMILY", 0, a, "buildCanceledAuthorizedLocalJobMetrics", 0, function(e, i, n = "Đã dừng xử lý video.", a, r = "job_canceled") {
    let o = _(a);
    return {
      status: "canceled",
      stage_timings: {},
      source_duration_seconds: e,
      output_duration_seconds: null,
      real_time_factor: null,
      subtitle_cue_count: 0,
      voiceover_cue_count: 0,
      output_audio_stream_count: 0,
      engine_provider: "unknown",
      runtime_version: null,
      runtime_hash: null,
      ...c(null),
      runtime_accelerator: null,
      runtime_profile: null,
      ...l(i),
      watermark_present: !1,
      translation_input_tokens: 0,
      translation_output_tokens: 0,
      estimated_provider_cost_vnd: 0,
      error_code: r,
      error_message: (0, t.metricText)(n, t.METRICS_ERROR_MESSAGE_LIMIT),
      quality_warnings: [r],
      funnel_events: o ? [o] : []
    }
  }, "buildFailedAuthorizedLocalJobDiagnostic", 0, function(e, i, n, a, r) {
    let o = h(n),
      s = c(a);
    return {
      stage: b((0, t.errorTextField)(n, "stage") || (0, t.errorTextField)(n, "pipeline_stage") || (0, t.errorTextField)(n, "phase") || (0, t.errorTextField)(n, "step"), 64) ?? "local_pipeline",
      error_code: o,
      error_message: (0, t.metricText)((0, t.diagnosticTextForPipelineError)(n), t.METRICS_ERROR_MESSAGE_LIMIT),
      diagnostic: y(n, o, s, i, e, r)
    }
  }, "buildFailedAuthorizedLocalJobMetrics", 0, function(e, r, o, s, d) {
    let u, p = h(o),
      g = c(s);
    return {
      status: "failed",
      stage_timings: {},
      source_duration_seconds: e,
      output_duration_seconds: null,
      real_time_factor: null,
      subtitle_cue_count: 0,
      voiceover_cue_count: 0,
      output_audio_stream_count: 0,
      engine_provider: g.engine_family === i || g.engine_family === n ? n : g.engine_family === a ? "soni_legacy" : "unknown",
      runtime_version: g.engine_family === i || g.engine_family === n ? n : g.engine_family,
      runtime_hash: g.runtime_package_hash,
      ...g,
      runtime_accelerator: null,
      runtime_profile: null,
      ...l(r),
      watermark_present: !1,
      translation_input_tokens: 0,
      translation_output_tokens: 0,
      estimated_provider_cost_vnd: 0,
      error_code: p,
      error_message: (0, t.metricText)((0, t.diagnosticTextForPipelineError)(o), t.METRICS_ERROR_MESSAGE_LIMIT),
      quality_warnings: [p],
      funnel_events: (u = _(d), [{
        event: "local_job_failure_diagnostic",
        metadata: y(o, p, g, r, e, d)
      }, ...u ? [u] : []])
    }
  }, "buildLocalJobMetrics", 0, function(e, t, i) {
    return e.metrics ? {
      ...e.metrics,
      status: "failed" === e.status || "canceled" === e.status ? e.status : "completed",
      runtime_accelerator: e.metrics.runtime_accelerator ?? e.runtime_accelerator,
      runtime_profile: e.metrics.runtime_profile ?? e.runtime_profile,
      engine_policy_version: t?.engine_policy_version ?? e.metrics.engine_policy_version ?? null,
      translation_route: t?.translation_route ?? e.metrics.translation_route ?? null,
      tts_route: t?.tts_route ?? null,
      tts_fallback_reason: null,
      runtime_trust_set_id: t?.runtime_trust_set_id ?? e.metrics.runtime_trust_set_id ?? null,
      watermark_present: e.metrics.watermark_present,
      error_code: p(e),
      error_message: g(e),
      quality_warnings: e.quality_warnings.length > 0 ? e.quality_warnings : e.metrics.quality_warnings,
      ...c(i)
    } : o.has(e.status) ? {
      status: "failed" === e.status || "canceled" === e.status ? e.status : "completed",
      stage_timings: {},
      source_duration_seconds: null,
      output_duration_seconds: null,
      real_time_factor: null,
      subtitle_cue_count: 0,
      voiceover_cue_count: 0,
      output_audio_stream_count: +!!e.output_video_path,
      engine_provider: "unknown",
      runtime_version: null,
      runtime_hash: null,
      ...c(i),
      runtime_accelerator: e.runtime_accelerator,
      runtime_profile: e.runtime_profile,
      ...l(t),
      watermark_present: !1,
      translation_input_tokens: 0,
      translation_output_tokens: 0,
      estimated_provider_cost_vnd: 0,
      error_code: p(e),
      error_message: g(e),
      quality_warnings: e.quality_warnings,
      funnel_events: []
    } : null
  }, "buildNativeVnextJobDiagnostic", 0, function(e, i, n) {
    if (!0 === i.nativePipeline && "completed" === i.status) return null;
    let a = P(e, i, n),
      r = b(i.fallbackReason, 320) ?? null,
      o = (0, t.metricText)(a?.error_code ?? r ?? `native_vnext_status_${i.status}`, t.METRICS_ERROR_CODE_LIMIT) ?? "native_vnext_failed",
      s = (0, t.metricText)(a?.error_message ?? r ?? `native_vnext_status_${i.status}`, t.METRICS_ERROR_MESSAGE_LIMIT);
    return {
      stage: "native_vnext",
      error_code: o,
      error_message: s,
      diagnostic: {
        app_surface: "desktop",
        job_family: "native_vnext_video_translate",
        native_pipeline: i.nativePipeline,
        native_status: i.status,
        fallback_reason: r,
        quality_warnings: S(i.qualityWarnings),
        source_duration_seconds: a?.source_duration_seconds ?? null,
        output_duration_seconds: a?.output_duration_seconds ?? null,
        real_time_factor: a?.real_time_factor ?? null,
        subtitle_cue_count: a?.subtitle_cue_count ?? 0,
        voiceover_cue_count: a?.voiceover_cue_count ?? 0,
        output_audio_stream_count: a?.output_audio_stream_count ?? 0,
        engine_provider: a?.engine_provider ?? i.engineFamily,
        runtime_version: a?.runtime_version ?? null,
        runtime_hash: a?.runtime_hash ?? null,
        runtime_accelerator: a?.runtime_accelerator ?? null,
        runtime_profile: a?.runtime_profile ?? null,
        stage_timings: a?.stage_timings ?? {},
        translation_input_tokens: a?.translation_input_tokens ?? 0,
        translation_output_tokens: a?.translation_output_tokens ?? 0,
        estimated_provider_cost_vnd: a?.estimated_provider_cost_vnd ?? 0,
        error_code: o,
        error_message: s,
        ...c(n),
        ...l(e),
        tts_fallback_reason: a?.tts_fallback_reason ?? null
      }
    }
  }, "buildNativeVnextJobMetrics", 0, P, "buildTerminalLocalJobDiagnostic", 0, function(e, t, i) {
    if ("completed" === e.status) return null;
    let n = c(i),
      a = p(e),
      r = g(e);
    return {
      stage: b(e.stage, 64) ?? "local_engine",
      error_code: a,
      error_message: r,
      diagnostic: {
        app_surface: "desktop",
        job_family: "local_engine_job",
        engine_job_status: e.status,
        engine_job_stage: b(e.stage, 120) ?? null,
        progress: "number" == typeof e.progress && Number.isFinite(e.progress) ? Math.round(e.progress) : null,
        quality_warnings: S(e.quality_warnings),
        engine_provider: e.metrics?.engine_provider ?? "unknown",
        runtime_version: e.metrics?.runtime_version ?? null,
        runtime_hash: e.metrics?.runtime_hash ?? null,
        runtime_accelerator: e.runtime_accelerator,
        runtime_profile: e.runtime_profile,
        error_code: a,
        error_message: r,
        ...n,
        ...l(t)
      }
    }
  }, "cloudDiagnosticsUploaded", 0, function(e) {
    return "true" === (0, t.errorTextField)(e, "cloudDiagnosticsUploaded")
  }, "engineVnextErrorCode", 0, s, "securePreflightMetrics", 0, c])
}, 5792, e => {
  "use strict";
  var t = e.i(61917),
    i = e.i(92719);
  e.s(["FAST_GPU_LOCAL_TRANSLATION_BATCH_SIZE", 0, 200, "FAST_GPU_LOCAL_TRANSLATION_CONCURRENCY", 0, 2, "FAST_GPU_SERVER_TRANSLATION_BATCH_SIZE", 0, 50, "FAST_GPU_SERVER_TRANSLATION_RETRIES", 0, 3, "fastGpuOpenAiBaseUrl", 0, function(e) {
    return e.openai_base_url.trim() || "http://192.168.1.54:20128/v1"
  }, "fastGpuTranslationModel", 0, function(e) {
    return (0, t.parseGptTranslateProcess)(e.translate_process).model
  }, "fastGpuTtsVoice", 0, function(e) {
    return e.tts_voice00 || i.DEFAULT_SONITRANSLATE_SETTINGS.tts_voice00
  }, "gpuWorkerUserMessage", 0, function(e, t) {
    let i = e instanceof Error ? e.message : "string" == typeof e ? e : "";
    return /gpu_worker_base_url_required/i.test(i) ? "GPU worker URL is not configured." : /gpu_worker_http_401|gpu_worker_http_403/i.test(i) ? "GPU worker rejected the API key. Check the Fast GPU settings." : /gpu_worker_input_not_found/i.test(i) ? "GPU worker cannot read the selected video file." : i || t
  }, "taskMessageForGpuWorkerStage", 0, function(e) {
    return "queued" === e ? "GPU job queued..." : "uploading" === e || "preparing" === e ? "GPU worker is preparing the video..." : "transcribe" === e ? "GPU worker is creating subtitles..." : "completed" === e ? "GPU subtitles completed." : "GPU worker is processing subtitles..."
  }])
}, 98272, e => {
  "use strict";
  let t = "edge_tts",
    i = {
      "viral-hoai-my": "vi-VN-HoaiMyNeural-Female",
      "viral-nam-minh": "vi-VN-NamMinhNeural-Male"
    };
  e.s(["EDGE_TTS_PROVIDER_ID", 0, t, "resolveTtsVoiceRoute", 0, function(e, n) {
    let a = e?.trim() || t,
      r = n?.trim() || "",
      o = i[r];
    return o ? {
      provider: t,
      voice: o,
      requiresCapCutSession: !1
    } : {
      provider: a,
      voice: r,
      requiresCapCutSession: "viral_tts" === a
    }
  }])
}, 44798, 80341, e => {
  "use strict";
  let t = ["tts_voice00", "tts_voice01", "tts_voice02", "tts_voice03", "tts_voice04", "tts_voice05", "tts_voice06", "tts_voice07", "tts_voice08", "tts_voice09", "tts_voice10", "tts_voice11"];

  function i(e) {
    return Math.max(0, Math.ceil(e))
  }

  function n(e) {
    if (!Number.isFinite(e)) return 1 / 0;
    let t = i(e);
    return 0 === t ? 0 : Math.max(1, Math.floor(t / 60))
  }
  e.s(["buildSoniSpeakerSettings", 0, function(e, i) {
    var n;
    let a = (n = i.defaultVoice, Object.fromEntries(t.map(e => [e, n])));
    return {
      ...e,
      ...(i.speakerMode, {
        min_speakers: 1,
        max_speakers: 1,
        diarization_model: "disable"
      }),
      ...a
    }
  }], 44798), e.s(["evaluateEntitlementPreflight", 0, function(e) {
    var t, a;
    let r, o = e.queuedVideoSeconds.reduce((e, t) => e + i(t), 0),
      s = e.license?.plan_code ?? null,
      l = Math.max(0, e.license?.included_video_seconds_available ?? 0),
      d = Math.max(0, e.balance ? e.balance.video_credits_seconds : 0),
      u = "free_weekly" === s || "trial" === s,
      c = ("monthly_unlimited" === s || "monthly_unlimited_legacy" === s) && !!e.license?.paid_local_processing_allowed,
      p = c ? 0 : u && d > 0 ? Math.min(o, d) : 0,
      g = u ? Math.min(Math.max(o - p, 0), l) : 0,
      h = c || u ? p : Math.min(o, d),
      m = i((t = e.license, r = Math.max(0, (a = e.balance) ? a.video_credits_seconds : 0), (t?.plan_code === "monthly_unlimited" || t?.plan_code === "monthly_unlimited_legacy") && t.paid_local_processing_allowed ? 1 / 0 : Math.max(0, t?.included_video_seconds_available ?? 0) + r)),
      f = Math.max(0, o - m),
      _ = n(o),
      v = n(m),
      b = n(f),
      S = {
        requiredSeconds: o,
        availableSeconds: m,
        missingSeconds: f,
        requiredMinutes: _,
        availableMinutes: v,
        missingMinutes: b,
        planCode: s,
        includedSecondsAvailable: l,
        walletSecondsAvailable: d,
        estimatedFreeSecondsUsed: g,
        estimatedWalletSecondsUsed: h,
        estimatedExportWatermarkRequired: u && g > 0 && p <= 0
      };
    return e.isDesktop ? e.hasSession ? e.paymentSessions?.some(e => "awaiting_review" === e.status) ? {
      status: "payment_pending",
      ...S
    } : !e.license?.paid_local_processing_allowed && m <= 0 ? {
      status: "needs_plan",
      ...S
    } : f > 0 ? {
      status: "needs_upgrade",
      ...S
    } : {
      status: "ready",
      ...S
    } : {
      status: "signed_out",
      ...S
    } : {
      status: "desktop_required",
      ...S
    }
  }, "formatEntitlementDuration", 0, function(e) {
    if (!Number.isFinite(e)) return "không giới hạn";
    let t = i(e);
    if (t < 60) return `${t}s`;
    let n = Math.floor(t / 60),
      a = t % 60;
    return a > 0 ? `${n} ph\xfat ${a}s` : `${n} ph\xfat`
  }], 80341)
}, 20829, e => {
  "use strict";
  var t = e.i(61917),
    i = e.i(43035),
    n = e.i(44798),
    a = e.i(80341),
    r = e.i(18849),
    o = e.i(77496),
    s = e.i(54302),
    l = e.i(98272),
    d = e.i(72888),
    u = e.i(58749);

  function c(e, t) {
    return "keep_full" === e && "fixed_voice_speed" === t.mode ? "keep_low" : e
  }

  function p(e) {
    if ((0, d.isVieNeuTurboVoiceId)(e)) return (0, l.resolveTtsVoiceRoute)(d.VIENEU_TURBO_PROVIDER, e);
    let t = function(e) {
      if ((0, d.isVieNeuTurboVoiceId)(e)) return e;
      let t = (0, r.isDichVideoVoiceId)(e) ? (0, r.getDichVideoVoiceById)(e) : null;
      if (t) return t.voice;
      let i = (0, o.isViralVoiceId)(e) ? (0, o.getViralVoiceById)(e) : null;
      if (i) return i.id;
      let n = (0, s.resolveVieNeuVoice)(e);
      return n ? n.voice : "female" === e ? "vi-VN-HoaiMyNeural-Female" : "vi-VN-NamMinhNeural-Male"
    }(e);
    return (0, l.resolveTtsVoiceRoute)((0, r.isDichVideoVoiceId)(e) ? r.DICHVIDEO_TTS_PROVIDER_ID : (0, o.isViralVoiceId)(e) ? o.VIRAL_TTS_PROVIDER_ID : (0, s.resolveVieNeuVoice)(e) ? s.VIENEU_TTS_PROVIDER_ID : "edge_tts", t)
  }
  e.s(["CLOUD_STATUS_PREFLIGHT_CACHE_MS", 0, 2e4, "NON_VIETNAMESE_VOICE_OPTIONS", 0, [{
    value: "male",
    label: "Nam",
    description: "Tạo lồng tiếng bằng giọng nam mặc định của ngôn ngữ đích."
  }, {
    value: "female",
    label: "Nữ",
    description: "Tạo lồng tiếng bằng giọng nữ mặc định của ngôn ngữ đích."
  }, {
    value: "none",
    label: "Không / Tạo sau",
    description: "Chỉ dịch và tạo phụ đề. Tạo giọng sau bằng TTSSieure (BYOK) trong Editor."
  }], "ORIGINAL_AUDIO_OPTIONS", 0, [{
    value: "keep_low",
    label: "Giữ nhỏ",
    description: "Giữ âm thanh gốc ở nền nhỏ dưới giọng đọc."
  }, {
    value: "keep_full",
    label: "Giữ âm gốc 100%",
    description: "Giữ âm thanh gốc 100% và trộn thêm giọng đọc."
  }, {
    value: "separate_background",
    label: "Tắt giọng gốc, giữ nền",
    description: "Thử tách lời gốc bằng AI local rồi giữ ambience, SFX và nhạc nền khi xuất."
  }, {
    value: "muted",
    label: "Tắt âm thanh gốc",
    description: "Tắt toàn bộ âm thanh gốc trong bản xuất."
  }], "VOICE_OPTIONS", 0, [{
    value: "male",
    label: "Nam",
    description: "Tạo lồng tiếng bằng giọng nam Việt."
  }, {
    value: "female",
    label: "Nữ",
    description: "Tạo lồng tiếng bằng giọng nữ Việt."
  }, {
    value: "none",
    label: "Không / Tạo sau",
    description: "Chỉ dịch và tạo phụ đề. Tạo giọng sau bằng TTSSieure (BYOK) trong Editor."
  }], "buildQueueSnapshot", 0, function({
    sourceLang: e,
    targetLang: a,
    processingMode: r,
    voiceMode: o,
    originalAudioMode: s,
    baseSettings: l
  }) {
    let d = "none" !== o,
      g = p(o),
      h = {
        mode: "source_timeline"
      },
      m = c(s, h),
      f = "keep_full" === s && "keep_low" === m ? .18 : l.sonitranslateSettings.volume_original_audio;
    return {
      sourceLang: e,
      targetLang: a,
      includeTts: d,
      ttsProvider: g.provider,
      processingMode: r,
      translationStyle: (0, u.resolveTranslationStyleSelection)(l.translationStyleSettings),
      createdAt: new Date().toISOString(),
      dubbingTimeline: h,
      dubbingTimelineIntent: null,
      sonitranslateSettings: (0, n.buildSoniSpeakerSettings)((0, i.applyLocalProcessingMode)(r, {
        ...l.sonitranslateSettings,
        volume_original_audio: "muted" === m ? 0 : "keep_full" === m ? 1 : f,
        original_audio_strategy: "muted" === m ? "mute_original" : "separate_background" === m ? "separate_background" : "mix_original",
        translate_process: (0, t.toGptTranslateProcess)(t.DEFAULT_GPT_TRANSLATION_MODEL, "batch"),
        ...d ? {} : {
          output_type: "subtitle",
          sync_voice_timing: !1,
          display_subtitle_timing: "source_timing",
          burn_subtitles_to_video: !1,
          soft_subtitles_to_video: !1
        }
      }), {
        speakerMode: "one",
        defaultVoice: g.voice,
        customSpeakerVoices: !1
      })
    }
  }, "dependencyHasMediaTools", 0, function(e) {
    if (!e) return !1;
    let t = new Set(e.dependencies.filter(e => e.installed).map(e => e.id));
    return t.has("ffmpeg") && t.has("ffprobe")
  }, "effectiveOriginalAudioModeForTimeline", 0, c, "entitlementGateTitle", 0, function(e) {
    return "signed_out" === e.status ? "Đăng nhập để xử lý video" : "needs_plan" === e.status ? "Kích hoạt gói miễn phí" : "needs_upgrade" === e.status ? "Liên hệ nâng cấp" : "payment_pending" === e.status ? "Đang xử lý nâng cấp" : "desktop_required" === e.status ? "Cần mở bằng app desktop" : ""
  }, "entitlementPreflightMessage", 0, function(e) {
    return "desktop_required" === e.status ? "Cần mở bằng app desktop trước khi xử lý video." : "signed_out" === e.status ? "Đăng nhập để xử lý video. Gói miễn phí có 60 phút mỗi ngày." : "payment_pending" === e.status ? "Đang xử lý nâng cấp. Unlimited sẽ sẵn sàng trong tài khoản của bạn." : "needs_plan" === e.status ? "Kích hoạt gói miễn phí trong phần tài khoản hoặc liên hệ nâng cấp Unlimited." : "needs_upgrade" === e.status ? `T\xe0i khoản chưa đủ ph\xfat cho to\xe0n bộ danh s\xe1ch. Cần ${(0,a.formatEntitlementDuration)(e.requiredSeconds)}, hiện c\xf3 ${(0,a.formatEntitlementDuration)(e.availableSeconds)}. Chọn \xedt video hơn hoặc li\xean hệ n\xe2ng cấp.` : ""
  }, "importFailureMessage", 0, function(e) {
    let t = e instanceof Error ? e.message : "string" == typeof e ? e : "";
    return /ffprobe|ffmpeg/i.test(t) && /not found|path|install/i.test(t) ? "DichVideo chưa chuẩn bị xong trình đọc video. Kiểm tra mạng rồi thử nhập lại video." : /Video file not found|cannot find the file|không tìm thấy/i.test(t) ? "Không tìm thấy file video. Hãy kiểm tra file còn tồn tại ở đúng vị trí rồi thử lại." : /FFprobe failed|Failed to parse FFprobe|Invalid data/i.test(t) ? "DichVideo không đọc được metadata của file này. Hãy thử file MP4/MKV/MOV khác hoặc chuyển mã video trước khi nhập." : t ? `DichVideo kh\xf4ng đọc được file video n\xe0y. Chi tiết: ${t}` : "DichVideo không đọc được file video này. Hãy kiểm tra file rồi thử lại."
  }, "processingTimeLabel", 0, function(e) {
    if (!Number.isFinite(e)) return "Xử lý cần không giới hạn";
    let t = Math.max(0, Math.ceil(e));
    return t < 60 ? `Xử l\xfd cần ${t} gi\xe2y` : `Xử l\xfd cần ${Math.ceil(t/60)} ph\xfat`
  }, "routeForVoiceMode", 0, p])
}, 13308, e => {
  "use strict";
  var t = e.i(20829);
  e.i(89268);
  var i = e.i(81341),
    n = e.i(6285);
  let a = /\b(?:EACCES|EPERM)\b|permission denied|access (?:is )?denied|(?:os error|error code)\s*5\b/i,
    r = /download_(?:client_)?failed|tải thất bại|\bnetwork\b|timed? out|\btimeout\b|\bDNS\b|connection (?:failed|refused|reset)|failed to connect|HTTP status|error sending request/i,
    o = /\b(token|api[_ -]?key|password|secret|authorization)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
    s = /([?&](?:token|api[_-]?key|password|secret|authorization)=)[^&#\s]*/gi,
    l = /\bBearer\s+[^\s,;]+/gi;

  function d(e) {
    let t = e.trim();
    return !t || /[.!?]$/.test(t) ? t : `${t}.`
  }
  async function u({
    setPreparationMessage: e,
    logContext: c,
    checkingMessage: p,
    preparingMessage: g,
    errorTitle: h,
    contextMessage: m
  }) {
    if (!(0, i.isTauri)()) return !0;
    let f = n.useDependencyStore.getState();
    try {
      e(p), await f.refreshStatus();
      let i = n.useDependencyStore.getState().status;
      if ((0, t.dependencyHasMediaTools)(i) || (e(g), await n.useDependencyStore.getState().installPackage("ffmpeg"), await n.useDependencyStore.getState().refreshStatus(), i = n.useDependencyStore.getState().status, (0, t.dependencyHasMediaTools)(i))) return !0;
      throw Error("media_tools_missing_after_install")
    } catch (t) {
      console.error(`Failed to prepare media tools for ${c}:`, t);
      let e = function(e, t) {
        let i, n = d(t),
          u = (i = ((function(e) {
            if ("string" == typeof e) return e;
            if (!e || "object" != typeof e) return "";
            let t = "string" == typeof e.code ? e.code.trim() : "",
              i = "string" == typeof e.message ? e.message.trim() : "";
            return t && i && !i.toLowerCase().startsWith(t.toLowerCase()) ? `${t}: ${i}` : i || t
          })(e).split(/\r?\n/).map(e => e.trim()).find(Boolean) ?? "").replace(l, "Bearer [đã ẩn]").replace(o, "$1=[đã ẩn]").replace(s, "$1[đã ẩn]").replace(/\s+/g, " ").trim()).length <= 320 ? i : `${i.slice(0,317)}...`;
        if (!u) return `${n} Kh\xf4ng c\xf3 chi tiết lỗi.`.trim();
        let c = "media_tools_missing_after_install" === u ? "FFmpeg/FFprobe vẫn chưa sẵn sàng sau khi cài đặt." : d(u),
          p = `${n} Chi tiết: ${c}`.trim();
        return a.test(u) ? `${p} Windows hoặc phần mềm bảo mật đang chặn quyền truy cập. H\xe3y cho ph\xe9p đ\xfang tệp hoặc thư mục được n\xeau trong chi tiết lỗi, rồi thử lại.` : r.test(u) ? `${p} H\xe3y kiểm tra kết nối mạng rồi thử lại.` : p
      }(t, m);
      return await (0, i.showMessage)(h, e, "error"), !1
    } finally {
      e(null)
    }
  }
  e.s(["ensureMediaToolsReady", 0, u])
}, 17962, 2684, 88327, e => {
  "use strict";
  let t = "native_edited_tts_piper_local_project_required",
    i = new Set(["dv_vi_001", "dv_vi_002", "dv_vi_003", "dv_vi_004"]),
    n = /^[a-f0-9]{64}$/;
  e.s(["resolveEditedTtsPiperLocalProject", 0, function({
    providerId: e,
    voiceId: a,
    processingSession: r,
    watermarkRequired: o
  }) {
    let s;
    if (e?.trim() !== "piper_native") return null;
    let l = a?.trim();
    if (!l || !i.has(l) || !1 !== o || !r || "finalize" !== r.current_stage || !((s = r.piper_execution_identity) && "piper-component-execution-v1" === s.schemaVersion && "piper-voice-pack-vi-dichvideo-v1" === s.componentId && s.componentVersion.length > 0 && s.componentVersion.trim() === s.componentVersion && n.test(s.packFingerprint)) || "dichvideo_vi_normalizer_v1" !== s.normalizerId) throw Object.assign(Error(t), {
      code: t,
      customerMessage: "Video này chưa có dữ liệu Giọng DichVideo đã xử lý. Hãy xử lý video một lần bằng Giọng DichVideo rồi thử lại.",
      fallbackAllowed: !1
    });
    return {
      processingSession: r
    }
  }], 17962);
  var a = e.i(51026),
    r = e.i(675);
  let o = /^sha256:[0-9a-f]{64}$/,
    s = /^(?:generation|playback|edit):[0-9a-f]{64}$/,
    l = /^(?:playback|edit):[0-9a-f]{64}$/,
    d = /^edit:[0-9a-f]{64}$/,
    u = "Dữ liệu lồng tiếng của project đang cần khôi phục. Hãy chờ vài giây rồi thử lại. Nếu lỗi vẫn còn, hãy xử lý lại video.",
    c = "Dữ liệu Tự giãn/Export cũ không còn được dùng. Phụ đề và giọng đọc vẫn được giữ; mở Editor để tạo lại phần Stretch rồi xuất, không cần dịch hay tạo giọng lại.";

  function p(e) {
    return "string" != typeof e ? null : e.trim() || null
  }

  function g(e) {
    return "number" == typeof e && Number.isFinite(e) && e >= 0 && e <= 5
  }

  function h(e) {
    return !!(e?.readyForEdit && s.test(e.timelineGeneration) && o.test(e.timelineStateHash))
  }

  function m(e) {
    let t = e?.nativeProjectReadiness,
      i = e?.terminalAdmission,
      n = p(e?.processingSession?.job_id) ?? p(e?.cuePreviewJobId),
      a = p(t?.audioGenerationId),
      r = i?.timingAuthority,
      s = p(i?.audioGenerationId),
      u = !!(i?.authoritySchemaVersion === "terminal-readiness-receipt-v3" && d.test(i?.playbackGenerationId ?? "") && p(i?.editRevision) && o.test(i?.assetManifestHash ?? "") && i?.artifactMembershipHash == null);
    return e && !e.translatedVideoPath && !e.draftVideoPath && h(t) && n && s && (null === a || a === s) && i?.state === "ready" && i.projectId === e.id && i.jobId === n && i.generationId && i.generationId === e.activeTerminalGeneration && i.audioGenerationId === s && r && /^generation:[0-9a-f]{64}$/.test(r.generationId) && o.test(r.planHash) && o.test(r.timelineStateHash) && t?.timingAuthority?.generationId === r.generationId && t?.timingAuthority?.planHash === r.planHash && t?.timingAuthority?.timelineStateHash === r.timelineStateHash && i.snapshotHash && i.playbackGenerationId && l.test(i.playbackGenerationId) && u && i.playbackGenerationId === t.timelineGeneration && i.graphHash && o.test(i.graphHash) && i.transportProjectionHash && o.test(i.transportProjectionHash) && i.transportProjectionHash === t.timelineStateHash && i.audioScheduleHash && o.test(i.audioScheduleHash) && i.visualSnapshotHash && o.test(i.visualSnapshotHash) && i.captionSetHash && o.test(i.captionSetHash) ? {
      projectId: e.id,
      jobId: n,
      timingGenerationId: r.generationId,
      timingPlanHash: r.planHash,
      timingStateHash: r.timelineStateHash,
      generationId: i.playbackGenerationId,
      timelineStateHash: i.transportProjectionHash,
      audioGenerationId: s,
      terminalGenerationId: i.generationId,
      terminalSnapshotHash: i.snapshotHash,
      playbackGenerationId: i.playbackGenerationId,
      graphHash: i.graphHash,
      transportProjectionHash: i.transportProjectionHash,
      audioScheduleHash: i.audioScheduleHash,
      visualSnapshotHash: i.visualSnapshotHash,
      captionSetHash: i.captionSetHash,
      artifactMembershipHash: i.artifactMembershipHash ?? null,
      authoritySchemaVersion: i.authoritySchemaVersion ?? null,
      editRevision: i.editRevision ?? null,
      assetManifestHash: i.assetManifestHash ?? null
    } : null
  }
  e.s(["STRETCH_RETIME_REPROCESS_REQUIRED_MESSAGE", 0, c, "cuePreviewRecoveryRequiredError", 0, function() {
    return Object.assign(Error(u), {
      code: "native_cue_preview_recovery_required",
      customerMessage: u
    })
  }, "getCuePreviewProjectRef", 0, function(e) {
    if (!e || e.translatedVideoPath || e.draftVideoPath || h(e.nativeProjectReadiness)) return null;
    let t = p(e.cuePreviewPlanPath),
      i = p(e.cuePreviewPlanHash),
      n = p(e.cuePreviewTimelineVideoPath),
      a = p(e.cuePreviewJobId),
      r = e.cuePreviewCueCount,
      s = e.cuePreviewGeneration,
      l = e.outputDuration ?? e.duration;
    return !(!t || !i || !o.test(i) || "native-cue-preview-plan-v2" !== e.cuePreviewSchemaVersion || "cue_window_v1" !== e.cuePreviewArchitecture || !n || !a || a.length > 256 || /[\\/]/.test(a)) && Number.isSafeInteger(r) && !((r ?? 0) <= 0) && Number.isSafeInteger(s) && !((s ?? 0) <= 0) && "number" == typeof l && Number.isFinite(l) && !(l <= 0) && g(e.cuePreviewOriginalVolume) && g(e.cuePreviewTranslatedVolume) ? {
      projectId: e.id,
      jobId: a,
      planPath: t,
      planHash: i,
      generation: s,
      cueCount: r,
      timelineVideoPath: n,
      timelineDurationMs: Math.round(1e3 * l),
      originalVolume: e.cuePreviewOriginalVolume,
      translatedVolume: e.cuePreviewTranslatedVolume
    } : null
  }, "getTerminalDirectExportProjectRef", 0, m, "requiresCuePreviewRecovery", 0, function(e) {
    if (!e || m(e) || h(e.nativeProjectReadiness) && (0, r.canHydrateTerminalProject)(e)) return !1;
    let t = p(e.lastAuthorizedJobId) ?? p(e.billingScopeJobId);
    return !!("srt_audio" !== e.projectType && "completed" === e.status && e.projectRoot && !e.cuePreviewPlanPath && !e.draftVideoPath && !e.translatedVideoPath && p(e.nativeTtsProvider) && p(e.nativeTtsVoice) && t && "." !== t && ".." !== t && !/[\\/]/.test(t))
  }, "requiresStretchRetimeReprocess", 0, function(e) {
    return !!e && "srt_audio" !== e.projectType && "completed" === e.status && !e.nleDocument && e.dubbingTimeline?.mode === "hybrid_stretch" && !(0, a.dubbingTimelineResultToManifestSnapshot)(e.dubbingTimelineResult)
  }, "resolvePlanOnlyPreviewMediaAudio", 0, function(e, t, i) {
    if (!Number.isInteger(e) || e < 0 || e > 100) throw TypeError("project_audio_gain_invalid");
    if (!Number.isFinite(t) || t < 0 || t > 1) throw TypeError("preview_transport_volume_invalid");
    return {
      volume: e / 100 * t,
      muted: i || 0 === e || 0 === t
    }
  }, "stretchRetimeReprocessRequiredError", 0, function() {
    return Object.assign(Error(c), {
      code: "native_stretch_retime_v4_reprocess_required",
      customerMessage: c
    })
  }], 2684);
  let f = Object.freeze([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

  function _(e) {
    return Number.isInteger(e) && "number" == typeof e && e >= 10 && e <= 20
  }

  function v(e) {
    return `${(e/10).toFixed(1)}x`
  }
  let b = Object.freeze({
    project_tempo_export_locked: "Không thể chỉnh tốc độ giọng đọc khi đang xuất video.",
    project_tempo_generation_stale: "Project vừa thay đổi. Hãy thử áp dụng lại.",
    project_tempo_target_invalid: "Chỉ có thể chọn các mốc từ 1.0x đến 2.0x.",
    project_tempo_target_missing: "Hãy chọn một mốc từ 1.0x đến 2.0x.",
    project_tempo_restore_target_invalid: "Không thể khôi phục video gốc với tốc độ đã chọn.",
    project_tempo_not_ready_for_edit: "Project chưa sẵn sàng để chỉnh tốc độ giọng đọc.",
    project_tempo_job_missing: "Không tìm thấy dữ liệu chỉnh sửa của project.",
    native_project_tempo_requires_desktop: "Tốc độ giọng đọc chỉ dùng được trong ứng dụng DichVideo."
  });
  e.s(["buildNleTempoControlModel", 0, function(e) {
    let t = "fixed_voice_speed" === e.timingMode && _(e.requestedVoiceRateTenths) ? e.requestedVoiceRateTenths : "source_timeline" === e.timingMode ? 10 : null;
    if (null === t) throw Error("project_tempo_target_invalid");
    let i = "fixed_voice_speed" === e.timingMode;
    return {
      label: i ? `Tốc độ giọng đọc \xb7 ${v(t)}` : "Tốc độ giọng đọc",
      selectedTempoTenths: t,
      options: f.map(e => ({
        value: e,
        label: v(e)
      })),
      canRestore: i,
      markerCount: i ? 0 : new Set(e.markerCueIds.filter(Boolean)).size
    }
  }, "buildProjectTempoControlModel", 0, function(e, t) {
    let i = "applied" === e.tempoState.state && _(e.tempoState.targetTempoTenths) ? e.tempoState.targetTempoTenths : null,
      n = "unapplied" === e.tempoState.state ? new Set(t.filter(Boolean)).size : 0,
      a = i ?? 10;
    return {
      label: null !== i ? `Tốc độ giọng đọc \xb7 ${v(i)}` : 10 === a ? "Tốc độ giọng đọc" : `Tốc độ giọng đọc \xb7 ${v(a)}`,
      selectedTempoTenths: a,
      options: f.map(e => ({
        value: e,
        label: v(e)
      })),
      canRestore: "applied" === e.tempoState.state,
      markerCount: n
    }
  }, "isProjectTempoTenths", 0, _, "projectTempoCustomerMessage", 0, function(e) {
    let t = e && "object" == typeof e && "code" in e && "string" == typeof e.code ? e.code : null;
    return t && b[t] || "Không thể cập nhật tốc độ video. Hãy thử lại."
  }, "projectTempoReadinessFromMutation", 0, function(e) {
    return {
      readyForEdit: !0,
      timelineGeneration: e.timelineGeneration,
      timelineStateHash: e.timelineStateHash,
      tempoState: e.tempoState,
      exportState: e.exportState,
      audioGenerationId: e.audioGenerationId
    }
  }], 88327)
}, 31755, e => {
  "use strict";

  function t(e) {
    return [Math.floor(e / 36e5), Math.floor(e % 36e5 / 6e4), Math.floor(e % 6e4 / 1e3)].map(e => String(e).padStart(2, "0")).join(":") + `,${String(e%1e3).padStart(3,"0")}`
  }

  function i(e) {
    return e.trim().replace(/\s+/gu, " ")
  }
  async function n(e) {
    let t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
    return `sha256:${[...new Uint8Array(t)].map(e=>e.toString(16).padStart(2,"0")).join("")}`
  }
  async function a(e, a) {
    let r = e.captions.find(e => e.captionId === a);
    if (!r) throw Error("nle_edited_tts_caption_missing");
    let o = e.voiceCues.filter(e => e.captionId === a).sort((e, t) => e.canonicalOrdinal - t.canonicalOrdinal || e.cueId.localeCompare(t.cueId));
    if (0 === o.length) {
      if ("missing_audio" === r.ttsResolution) {
        let o = r.translatedText;
        return [{
          projectRevision: e.revision,
          cueId: `cue-${r.captionId}`,
          captionId: a,
          captionText: o,
          captionTextHash: await n(o),
          voiceSrt: `1
${t(r.sourceStartMs)} --> ${t(r.sourceEndMs)}
${i(o)}
`
        }]
      }
      return []
    }
    if (1 !== o.length) throw Error("nle_edited_tts_split_cue_selection_required");
    let s = o[0],
      l = r.translatedText;
    return [{
      projectRevision: e.revision,
      cueId: s.cueId,
      captionId: a,
      captionText: l,
      captionTextHash: await n(l),
      voiceSrt: `1
${t(s.sourceStartMs)} --> ${t(s.sourceEndMs)}
${i(l)}
`
    }]
  }
  e.s(["buildNleEditedTtsCueContexts", 0, a, "captionAudioIdentity", 0, function(e, t) {
    let i = e.voiceCues.filter(e => e.captionId === t && !!e.audio.relativePath).sort((e, t) => e.canonicalOrdinal - t.canonicalOrdinal);
    return 0 === i.length ? "" : i.map(e => `${e.cueId}:${e.audio.relativePath}:${e.audio.byteCount}:${e.audio.durationMs}`).join(";")
  }, "nleCaptionTextHash", 0, n, "normalizeNleEditedTtsTextForSrt", 0, i])
}, 76223, 55313, e => {
  "use strict";
  let t = "minimax",
    i = ["elevenlabs", t],
    n = {
      elevenlabs: "ElevenLabs",
      minimax: "MiniMax"
    },
    a = {
      elevenlabs: "eleven_v3",
      minimax: "speech-2.8-hd"
    },
    r = "ttssieure/";

  function o(e, t) {
    return `${e.trim()}\u0000${t.trim()}`
  }

  function s(e) {
    if (!e || "object" != typeof e || "string" != typeof e.provider || !h(e.provider) || "string" != typeof e.voiceId || !e.voiceId.trim()) return null;
    let t = e.voiceId.trim();
    return /[\s/]/.test(t) ? null : {
      provider: e.provider,
      modelId: a[e.provider],
      voiceId: t,
      name: "string" == typeof e.name && e.name.trim() ? e.name.trim() : t,
      addedAtMs: "number" == typeof e.addedAtMs && Number.isFinite(e.addedAtMs) ? e.addedAtMs : 0,
      ..."string" == typeof e.sampleUrl && e.sampleUrl.trim() ? {
        sampleUrl: e.sampleUrl.trim()
      } : {},
      ..."number" == typeof e.verifiedAtMs && Number.isFinite(e.verifiedAtMs) ? {
        verifiedAtMs: e.verifiedAtMs
      } : {}
    }
  }

  function l(e, t) {
    let i = t.voiceId.trim(),
      n = e.find(e => e.provider === t.provider && e.voiceId === i);
    if (n) {
      let i = "number" == typeof t.verifiedAtMs && (!n.verifiedAtMs || t.verifiedAtMs > n.verifiedAtMs) ? t.verifiedAtMs : n.verifiedAtMs,
        a = n.sampleUrl ?? t.sampleUrl;
      if (i !== n.verifiedAtMs || a !== n.sampleUrl) {
        let t = {
          ...n,
          ...i ? {
            verifiedAtMs: i
          } : {},
          ...a ? {
            sampleUrl: a
          } : {}
        };
        return {
          voices: e.map(e => e === n ? t : e),
          result: {
            kind: "existing",
            voice: t
          }
        }
      }
      return {
        voices: [...e],
        result: {
          kind: "existing",
          voice: n
        }
      }
    }
    let a = s({
      provider: t.provider,
      voiceId: i,
      name: t.name,
      sampleUrl: t.sampleUrl,
      verifiedAtMs: t.verifiedAtMs,
      addedAtMs: t.addedAtMs ?? 0
    });
    if (!a) return {
      voices: [...e],
      result: {
        kind: "invalid"
      }
    };
    let r = {
      ...a,
      addedAtMs: t.addedAtMs ?? Date.now()
    };
    return {
      voices: [...e, r],
      result: {
        kind: "added",
        voice: r
      }
    }
  }
  let d = {
    af: "Afrikaans",
    ar: "Arabic",
    bg: "Bulgarian",
    yue: "Cantonese",
    ca: "Catalan",
    zh: "Chinese (Mandarin)",
    hr: "Croatian",
    cs: "Czech",
    da: "Danish",
    nl: "Dutch",
    en: "English",
    fil: "Filipino",
    tl: "Filipino",
    fi: "Finnish",
    fr: "French",
    de: "German",
    el: "Greek",
    he: "Hebrew",
    hi: "Hindi",
    hu: "Hungarian",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    ms: "Malay",
    no: "Norwegian",
    nb: "Norwegian",
    nn: "Nynorsk",
    fa: "Persian",
    pl: "Polish",
    pt: "Portuguese",
    ro: "Romanian",
    ru: "Russian",
    sk: "Slovak",
    sl: "Slovenian",
    es: "Spanish",
    sv: "Swedish",
    ta: "Tamil",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    vi: "Vietnamese"
  };

  function u(e) {
    return (e ?? "").trim().toLowerCase().split(/[-_]/)[0] ?? ""
  }

  function c(e, t) {
    if (!e || "object" != typeof e) return null;
    for (let i of t) {
      let t = e[i];
      if ("string" == typeof t && t.trim()) return t.trim();
      if ("number" == typeof t && Number.isFinite(t)) return String(t)
    }
    return null
  }

  function p(e, t) {
    if (e && "object" == typeof e)
      for (let i of t) {
        let t = e[i];
        if ("number" == typeof t && Number.isFinite(t)) return t;
        if ("string" == typeof t && t.trim()) {
          let e = Number(t);
          if (Number.isFinite(e)) return e
        }
      }
  }

  function g(e) {
    if (!e) return null;
    let t = a[e.provider];
    if (!t) return null;
    for (let i of e.models ?? []) {
      let n = function(e, t) {
        if (!t || "object" != typeof t) return null;
        let i = c(t, ["model_id", "modelId", "id"]);
        if (!i) return null;
        let n = Array.isArray(t.languages) ? t.languages.map(e => "string" == typeof e ? e : c(e, ["language_id", "languageId", "code", "id"])).filter(e => "string" == typeof e && e.length > 0) : [];
        return {
          provider: e,
          modelId: i,
          characterCostMultiplier: p(t.model_rates, ["character_cost_multiplier", "characterCostMultiplier"]) ?? p(t, ["character_cost_multiplier", "characterCostMultiplier"]),
          creditRatio: p(t, ["credit_ratio", "creditRatio"]),
          maxChars: p(t, ["maximum_text_length_per_request", "maximumTextLengthPerRequest", "max_chars", "maxChars"]) ?? p(t, ["max_characters_request", "maxCharactersRequest"]),
          languageIds: n
        }
      }(e.provider, i);
      if (n && n.modelId === t) return n
    }
    return {
      provider: e.provider,
      modelId: t,
      languageIds: []
    }
  }

  function h(e) {
    return i.includes(e)
  }

  function m(e) {
    return !!(e.audio && "string" == typeof e.audio.relativePath && e.audio.relativePath.trim().length > 0)
  }

  function f(e, t) {
    let i = new Set(t.filter(m).map(e => e.captionId));
    return e.filter(e => !0 !== e.excluded && e.translatedText.trim().length > 0 && (!i.has(e.captionId) || "missing_audio" === e.ttsResolution)).map(e => e.captionId)
  }
  async function _(e) {
    let t = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(e));
    return `sha256:${[...new Uint8Array(t)].map(e=>e.toString(16).padStart(2,"0")).join("")}`
  }
  async function v(e) {
    let t = [...e.cues].map(e => `${e.cueId}:${e.textHash}`).sort().join(",");
    return _([e.provider, e.modelId, e.voiceId, JSON.stringify(function e(t) {
      return Array.isArray(t) ? t.map(e) : t && "object" == typeof t ? Object.keys(t).sort().reduce((i, n) => (i[n] = e(t[n]), i), {}) : t
    }(e.voiceSettings ?? {})), e.languageCode, t].join("|"))
  }
  let b = new Set(["submitted", "completed", "failed", "failed_credits", "uncertain", "uncertain_remote", "completed_orphaned"]);

  function S(e) {
    let t = function(e) {
        if (e && "object" == typeof e) {
          let t = "code" in e ? e.code : "message" in e ? e.message : null;
          if ("string" == typeof t) {
            let e = t.match(/[a-z][a-z0-9_]+/);
            if (e) return e[0]
          }
          try {
            let e = JSON.parse("string" == typeof t ? t : String(t));
            if ("string" == typeof e.code) return e.code
          } catch {}
        }
        if ("string" == typeof e) {
          let t = e.match(/[a-z][a-z0-9_]+/);
          if (t) return t[0];
          try {
            let t = JSON.parse(e);
            if ("string" == typeof t.code) return t.code
          } catch {}
        }
        return null
      }(e) ?? "",
      i = function(e) {
        if (e && "object" == typeof e) {
          let t = "detail" in e ? e.detail : "message" in e ? e.message : null;
          if ("string" == typeof t && t.trim()) return t.trim()
        }
        return "string" == typeof e && e.trim() ? e.trim() : null
      }(e);
    switch (t) {
      case "key_missing":
      case "ttssieure_key_missing":
        return "Chưa nhập API key TTSsieure — mở menu chọn giọng đọc → tab TTSsieure.com để nhập key.";
      case "key_invalid":
      case "ttssieure_key_invalid":
        return "API key TTSSieure không hợp lệ.";
      case "key_store_unsupported":
        return "Lưu API key TTSSieure chưa được hỗ trợ trên hệ điều hành này.";
      case "language_unsupported":
      case "ttssieure_language_unsupported":
        return "Ngôn ngữ đích không được giọng/model này hỗ trợ.";
      case "credits_insufficient":
      case "failed_credits":
      case "ttssieure_credits_insufficient":
        return "Không đủ credit TTSSieure — nạp thêm trên ttssieure.com rồi thử lại.";
      case "rate_limited":
        return "Giới hạn tốc độ TTSSieure — thử lại sau.";
      case "cancelled":
        return "Đã hủy tạo giọng.";
      case "stale_text":
        return "Phụ đề đã đổi sau khi duyệt — câu này cần duyệt lại.";
      case "unverifiable_key_changed":
        return "API key đã thay đổi — không kiểm tra được các task đã gửi.";
      case "uncertain":
      case "uncertain_remote":
        return "Chưa xác định được task trên TTSSieure — kiểm tra trạng thái trước khi gửi lại.";
      case "ttssieure_not_implemented":
        return "Tính năng TTSSieure chưa sẵn sàng trong bản này.";
      default:
        return i && i !== t ? `Kh\xf4ng tạo được giọng TTSSieure: ${i}` : "Không tạo được giọng TTSSieure."
    }
  }
  e.s(["TTSSIEURE_ALLOWED_MODELS", 0, a, "TTSSIEURE_LIBRARY_URL", 0, "https://ttssieure.com/app/voices", "TTSSIEURE_PROVIDERS", 0, i, "TTSSIEURE_PROVIDER_LABELS", 0, n, "computeTtssieureApprovalHash", 0, v, "countTtssieureCharacters", 0, function(e) {
    return [...e.trim().replace(/\s+/gu, " ")].length
  }, "estimateTtssieureCredits", 0, function(e, t) {
    let i = t?.characterCostMultiplier ?? t?.creditRatio;
    return "number" != typeof i || !Number.isFinite(i) || i < 0 ? {
      kind: "unknown"
    } : {
      kind: "estimate",
      credits: Math.ceil(Math.max(0, e) * i)
    }
  }, "formatTtssieureEstimate", 0, function(e) {
    return "estimate" === e.kind ? `~${e.credits} credit` : "chưa có dữ liệu phí — sẽ trừ credit tài khoản TTSSieure"
  }, "isTtssieureProvider", 0, function(e) {
    let t = e?.trim() ?? "";
    return "ttssieure" === t || t.startsWith(r)
  }, "isTtssieureProviderAllowed", 0, h, "isTtssieureVoiceName", 0, function(e) {
    return "string" == typeof e && e.trim().startsWith(r)
  }, "mintTtssieureClientBatchId", 0, function() {
    return crypto.randomUUID()
  }, "normalizeTtssieureSavedVoice", 0, s, "normalizeTtssieureTargetLang", 0, u, "parseTtssieureVoiceId", 0, function(e) {
    if ("string" != typeof e) return null;
    let t = e.trim().split("/");
    return "ttssieure" !== t[0] ? null : 4 === t.length && t[1] && t[2] && t[3] ? {
      provider: t[1],
      modelId: t[2],
      voiceId: t[3]
    } : 3 === t.length && t[1] && t[2] ? {
      provider: t[1],
      voiceId: t[2]
    } : null
  }, "resolveTtssieureScopeCaptionIds", 0, function(e) {
    let t, {
      scope: i,
      captions: n,
      voiceCues: a,
      selectedCaptionId: r,
      checkedCaptionIds: o
    } = e;
    if ("selected" === i) {
      let e = n.find(e => e.captionId === r);
      t = e && !0 !== e.excluded ? [e.captionId] : []
    } else t = "missing" === i ? f(n, a) : n.filter(e => !0 !== e.excluded && e.translatedText.trim().length > 0).map(e => e.captionId);
    if (o) {
      let e = new Set(o);
      t = t.filter(t => e.has(t))
    }
    return t
  }, "ttssieureApprovalCueId", 0, function(e, t) {
    let i = t.find(t => t.captionId === e);
    return i ? i.cueId ?? `cue-${e}` : `cue-${e}`
  }, "ttssieureBatchCounts", 0, function(e) {
    let t = {
      total: e.length,
      completed: 0,
      failed: 0,
      uncertain: 0,
      inFlight: 0,
      skipped: 0
    };
    for (let i of e) "completed" === i.state || "completed_orphaned" === i.state ? t.completed += 1 : "failed" === i.state || "failed_credits" === i.state ? t.failed += 1 : "uncertain" === i.state || "uncertain_remote" === i.state || "unverifiable_key_changed" === i.state ? t.uncertain += 1 : "skipped_stale" === i.state ? t.skipped += 1 : t.inFlight += 1;
    return t
  }, "ttssieureCaptionTextHash", 0, function(e) {
    return _(e)
  }, "ttssieureCueStateLabel", 0, function(e) {
    switch (e) {
      case "intent":
        return "Chờ gửi";
      case "submitted":
        return "Đã gửi";
      case "completed":
        return "Hoàn tất";
      case "failed":
        return "Thất bại";
      case "failed_credits":
        return "Hết credit";
      case "uncertain":
      case "uncertain_remote":
        return "Chưa xác định";
      case "skipped_stale":
        return "Bỏ qua (phụ đề đã đổi)";
      case "completed_orphaned":
        return "Hoàn tất (phụ đề đã đổi)";
      case "unverifiable_key_changed":
        return "Key đã đổi";
      default:
        return e
    }
  }, "ttssieureCueStateTone", 0, function(e) {
    switch (e) {
      case "completed":
        return "ok";
      case "completed_orphaned":
      case "uncertain":
      case "uncertain_remote":
      case "unverifiable_key_changed":
      case "skipped_stale":
        return "warn";
      case "failed":
      case "failed_credits":
        return "error";
      case "submitted":
        return "active";
      default:
        return "pending"
    }
  }, "ttssieureErrorMessage", 0, S, "ttssieureLanguageSupport", 0, function(e, i, n) {
    let a, r = (a = u(i), e === t ? d[a] ?? i.trim() : a);
    if (!r) return {
      supported: !1,
      languageCode: "",
      reason: `kh\xf4ng hỗ trợ ${i||"ngôn ngữ đích"}`
    };
    if (!n || !h(e)) return {
      supported: !1,
      languageCode: r,
      reason: `kh\xf4ng hỗ trợ ${i}`
    };
    let o = function(e) {
        let t = e?.languages;
        if (!Array.isArray(t)) return [];
        let i = [];
        for (let e of t) {
          if ("string" == typeof e && e.trim()) {
            i.push({
              id: e.trim(),
              name: e.trim()
            });
            continue
          }
          let t = c(e, ["language_id", "languageId", "code", "iso", "id"]),
            n = c(e, ["name", "language_name", "languageName", "label"]);
          (t || n) && i.push({
            id: t ?? n ?? "",
            name: n ?? t ?? ""
          })
        }
        return i
      }(n),
      s = g(n),
      l = r.toLowerCase(),
      p = o.some(e => e.id.toLowerCase() === l || e.name.toLowerCase() === l) || (s?.languageIds.some(e => e.toLowerCase() === l) ?? !1);
    return (o.length > 0 || (s?.languageIds.length ?? 0) > 0) && !p ? {
      supported: !1,
      languageCode: r,
      reason: `kh\xf4ng hỗ trợ ${i}`
    } : {
      supported: !0,
      languageCode: r
    }
  }, "ttssieureModelInfo", 0, g, "ttssieureProviderLabel", 0, function(e) {
    return n[e] ?? e
  }, "ttssieureSavedVoiceKey", 0, o, "ttssieureSubmittedCount", 0, function(e) {
    return e.filter(e => b.has(e.state)).length
  }, "ttssieureUnvoicedCaptionIds", 0, f, "ttssieureVoiceOptionId", 0, function(e, t, i) {
    return `${r}${e}/${t}/${i}`
  }, "upsertTtssieureSavedVoice", 0, l], 76223);
  var y = e.i(68834),
    P = e.i(79473),
    T = e.i(48868);
  e.i(89268);
  var w = e.i(81341),
    x = e.i(24614);

  function I(e) {
    return e && "object" == typeof e && "string" == typeof e.provider && h(e.provider) && "string" == typeof e.modelId && a[e.provider] === e.modelId && "string" == typeof e.voiceId && e.voiceId.trim() && "string" == typeof e.targetLang && u(e.targetLang) ? {
      provider: e.provider,
      modelId: e.modelId,
      voiceId: e.voiceId,
      ...e.voiceSettings && "object" == typeof e.voiceSettings ? {
        voiceSettings: e.voiceSettings
      } : {},
      ..."string" == typeof e.displayName && e.displayName.trim() ? {
        displayName: e.displayName
      } : {},
      targetLang: u(e.targetLang)
    } : null
  }
  let E = (0, y.create)()((0, P.persist)((e, t) => ({
    keyStatus: null,
    keyStatusLoading: !1,
    catalogs: {},
    voiceLists: {},
    dashboardSelection: null,
    voicePrefs: {},
    savedVoices: [],
    dialogRequest: null,
    batches: {},
    refreshKeyStatus: async () => {
      if (!(0, w.isTauri)()) {
        let t = {
          configured: !1
        };
        return e({
          keyStatus: t,
          keyStatusLoading: !1
        }), t
      }
      e({
        keyStatusLoading: !0
      });
      try {
        let t = await (0, x.ttssieureKeyStatus)();
        return e({
          keyStatus: t,
          keyStatusLoading: !1
        }), t
      } catch (t) {
        throw e({
          keyStatusLoading: !1
        }), t
      }
    },
    saveKey: async t => {
      let i = await (0, x.ttssieureKeySet)(t);
      return e({
        keyStatus: i
      }), i
    },
    clearKey: async () => {
      await (0, x.ttssieureKeyClear)(), e({
        keyStatus: {
          configured: !1
        }
      })
    },
    loadCatalog: async (i, n) => {
      let a = t().catalogs[i];
      if (!n?.refresh && (a?.status === "loading" || a?.status === "ready") || a?.status === "loading") return a;
      e(e => ({
        catalogs: {
          ...e.catalogs,
          [i]: {
            status: "loading",
            snapshot: a?.snapshot
          }
        }
      }));
      try {
        let t = n?.refresh ? await (0, x.ttssieureCatalogRefresh)(i) : await (0, x.ttssieureCatalogGet)(i),
          a = {
            status: "ready",
            snapshot: t
          };
        return e(e => ({
          catalogs: {
            ...e.catalogs,
            [i]: a
          }
        })), a
      } catch (n) {
        let t = {
          status: "error",
          snapshot: a?.snapshot,
          error: S(n)
        };
        return e(e => ({
          catalogs: {
            ...e.catalogs,
            [i]: t
          }
        })), t
      }
    },
    fetchVoiceList: async (i, n, a) => {
      let r = u(n) || void 0,
        o = t().voiceLists[i],
        s = o?.fetchedAt !== void 0 && Date.now() - o.fetchedAt < 864e5;
      if (!a?.refresh && (o?.status === "loading" || o?.status === "ready" && o.language === r && s)) return o;
      e(e => ({
        voiceLists: {
          ...e.voiceLists,
          [i]: {
            status: "loading",
            language: r,
            list: o?.list
          }
        }
      }));
      try {
        let t = await (0, x.ttssieureVoicesList)({
            provider: i,
            language: r
          }),
          n = {
            status: "ready",
            language: r,
            list: t,
            fetchedAt: Date.now()
          };
        return e(e => ({
          voiceLists: {
            ...e.voiceLists,
            [i]: n
          }
        })), n
      } catch (n) {
        let t = {
          status: "error",
          language: r,
          list: o?.list,
          error: S(n)
        };
        return e(e => ({
          voiceLists: {
            ...e.voiceLists,
            [i]: t
          }
        })), t
      }
    },
    selectDashboardVoice: (i, n) => {
      let a = I({
        ...i,
        targetLang: n
      });
      a && (e({
        dashboardSelection: a
      }), t().rememberVoicePreference(a.targetLang, {
        provider: a.provider,
        modelId: a.modelId,
        voiceId: a.voiceId,
        ...a.displayName ? {
          displayName: a.displayName
        } : {}
      }))
    },
    clearDashboardVoice: () => e({
      dashboardSelection: null
    }),
    rememberVoicePreference: (t, i) => {
      let n = u(t);
      n && e(e => ({
        voicePrefs: {
          ...e.voicePrefs,
          [n]: i
        }
      }))
    },
    addSavedVoice: i => {
      let {
        voices: n,
        result: a
      } = l(t().savedVoices, {
        provider: i.provider,
        voiceId: i.voiceId,
        name: i.name,
        sampleUrl: i.sampleUrl,
        addedAtMs: Date.now()
      });
      return "invalid" === a.kind ? null : (e({
        savedVoices: n
      }), a.voice)
    },
    renameSavedVoice: (t, i, n) => {
      let a = n.trim();
      a && e(e => ({
        savedVoices: e.savedVoices.map(e => e.provider === t && e.voiceId === i ? {
          ...e,
          name: a
        } : e),
        ...e.dashboardSelection?.provider === t && e.dashboardSelection.voiceId === i ? {
          dashboardSelection: {
            ...e.dashboardSelection,
            displayName: a
          }
        } : {},
        voicePrefs: Object.fromEntries(Object.entries(e.voicePrefs).map(([e, n]) => [e, n.provider === t && n.voiceId === i ? {
          ...n,
          displayName: a
        } : n]))
      }))
    },
    removeSavedVoice: (t, i) => {
      e(e => {
        let n = {
          ...e.voicePrefs
        };
        for (let [e, a] of Object.entries(n)) a.provider === t && a.voiceId === i && delete n[e];
        return {
          savedVoices: e.savedVoices.filter(e => e.provider !== t || e.voiceId !== i),
          dashboardSelection: e.dashboardSelection?.provider === t && e.dashboardSelection.voiceId === i ? null : e.dashboardSelection,
          voicePrefs: n
        }
      })
    },
    markSavedVoiceVerified: (t, i) => {
      let n = Date.now();
      e(e => ({
        savedVoices: e.savedVoices.map(e => e.provider !== t || e.voiceId !== i || e.verifiedAtMs ? e : {
          ...e,
          verifiedAtMs: n
        })
      }))
    },
    requestGenerateDialog: i => {
      let n = (t().dialogRequest?.nonce ?? 0) + 1;
      return e({
        dialogRequest: {
          projectId: i,
          nonce: n
        }
      }), n
    },
    consumeDialogRequest: i => {
      let n = t().dialogRequest;
      return n && n.projectId === i ? (e({
        dialogRequest: null
      }), n) : null
    },
    setBatchStatus: (t, i) => {
      e(e => {
        let n = {
          ...e.batches
        };
        return i ? n[t] = i : delete n[t], {
          batches: n
        }
      })
    }
  }), {
    name: "dichvideo-ttssieure",
    storage: (0, P.createJSONStorage)(() => (0, T.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      dashboardSelection: e.dashboardSelection,
      voicePrefs: e.voicePrefs,
      savedVoices: e.savedVoices,
      voiceLists: Object.fromEntries(Object.entries(e.voiceLists).filter(([, e]) => "ready" === e.status && e.list))
    }),
    merge: (e, t) => {
      let i = I(e?.dashboardSelection),
        n = function(e) {
          if (!e || "object" != typeof e) return {};
          let t = {};
          for (let [i, n] of Object.entries(e)) n && "object" == typeof n && "string" == typeof n.provider && h(n.provider) && "string" == typeof n.modelId && "string" == typeof n.voiceId && n.voiceId.trim() && (t[u(i)] = {
            provider: n.provider,
            modelId: n.modelId,
            voiceId: n.voiceId,
            ..."string" == typeof n.displayName && n.displayName.trim() ? {
              displayName: n.displayName
            } : {}
          });
          return t
        }(e?.voicePrefs),
        a = function(e, t, i) {
          let n = e;
          for (let e of [t, ...Object.values(i)]) e && (n = l(n, {
            provider: e.provider,
            voiceId: e.voiceId,
            name: e.displayName,
            addedAtMs: 0
          }).voices);
          return n
        }(function(e) {
          if (!Array.isArray(e)) return [];
          let t = new Set,
            i = [];
          for (let n of e) {
            let e = s(n);
            if (!e) continue;
            let a = o(e.provider, e.voiceId);
            t.has(a) || (t.add(a), i.push(e))
          }
          return i
        }(e?.savedVoices), i, n),
        r = Object.fromEntries(Object.entries(e?.voiceLists ?? {}).filter(([, e]) => e?.status === "ready" && Array.isArray(e?.list?.voices)));
      return {
        ...t,
        dashboardSelection: i,
        voicePrefs: n,
        savedVoices: a,
        voiceLists: r
      }
    }
  }));
  e.s(["useTtssieureStore", 0, E], 55313)
}, 62138, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(53752),
    n = e.i(81341),
    a = e.i(63126),
    r = e.i(7787),
    o = e.i(92719),
    s = e.i(5071),
    l = e.i(58450),
    d = e.i(21193),
    u = e.i(56583),
    c = e.i(31868),
    p = e.i(43519),
    g = e.i(4653),
    h = e.i(7165),
    m = e.i(43424),
    f = e.i(74296),
    _ = e.i(56260),
    v = e.i(79705),
    b = e.i(5792),
    S = e.i(64192),
    y = e.i(32217),
    P = e.i(77496),
    T = e.i(98272),
    w = e.i(13308),
    x = e.i(17962),
    I = e.i(2684),
    E = e.i(88327),
    A = e.i(53065),
    k = e.i(88717),
    V = e.i(44318),
    N = e.i(8594),
    M = e.i(675),
    L = e.i(31755),
    C = e.i(30148),
    j = e.i(76223),
    R = e.i(55313);
  let D = "Không thể chuẩn bị FFmpeg/FFprobe để tạo lại âm thanh.";

  function F(e) {
    return "string" == typeof e && e.trim().length > 0 ? e.trim() : null
  }
  async function H(e) {
    if (e.cuePreviewPlanPath) {
      let t = F(e.cuePreviewTimelineVideoPath);
      if (!t || !await (0, n.fileExists)(t)) throw Error("File timeline của preview không còn, hãy xử lý lại video trước khi tạo lại âm thanh.");
      return t
    }
    if (e.dubbingTimeline?.mode !== "hybrid_stretch") return null;
    let t = F(e.dubbingTimelineVideoPath);
    if (!t || !await (0, n.fileExists)(t)) throw Error("File video timeline của bản Hybrid không còn, hãy chạy lại video để chỉnh sửa giọng đọc.");
    return t
  }
  let $ = 'Giọng TTSsieure — dùng "Tạo giọng đọc" trong thanh công cụ Editor để duyệt và tạo lại.';

  function O(e) {
    return R.useTtssieureStore.getState().requestGenerateDialog(e), Object.assign(Error($), {
      code: "ttssieure_paid_voice_dialog_required",
      customerMessage: $
    })
  }

  function G(e) {
    return [Math.floor(e / 36e5), Math.floor(e % 36e5 / 6e4), Math.floor(e % 6e4 / 1e3)].map(e => String(e).padStart(2, "0")).join(":") + `,${String(e%1e3).padStart(3,"0")}`
  }
  async function U(e, i, n) {
    try {
      await (0, l.persistLatestProjectManifest)(e, i, {
        artifact: "nle_edited_subtitle_tts_refresh",
        phase: n
      })
    } catch (i) {
      await (0, t.appendAppLog)("warn", `[pipeline:${e}] NLE edited subtitle TTS state persistence failed phase=${n} diagnostic=${(0,y.diagnosticTextForPipelineError)(i)}`).catch(() => void 0)
    }
  }
  async function q(e, i, n, o) {
    let s = i.nleDocument;
    if (!s) return null;
    let l = s,
      d = V.useSubtitleStore.getState().selectedSubtitleId,
      u = [...new Set((o?.captionIds ?? []).map(e => e.trim()).filter(Boolean))],
      c = [...new Set((i.editedSubtitleTtsDirtyCaptionIds ?? []).map(e => e.trim()).filter(Boolean))],
      h = new Set([...c, ...(s.captions ?? []).filter(e => "missing_audio" === e.ttsResolution || "default_voice" === e.ttsResolution || "final_voice" === e.ttsResolution).map(e => e.captionId)]),
      _ = u.length > 0 ? u : h.size > 0 ? (s.captions ?? []).map(e => e.captionId).filter(e => h.has(e)) : d ? [d] : [];
    if (0 === _.length) throw Object.assign(Error("Hãy chọn một câu phụ đề để tạo lại âm thanh."), {
      code: "nle_edited_tts_caption_required"
    });
    let b = o?.ttsProvider ?? i.nativeTtsProvider ?? i.billingTtsProvider ?? "edge_tts";
    if (!o?.ttsProvider && (0, j.isTtssieureProvider)(b) || !o?.ttsVoice && _.find(e => {
        let t = l.captions?.find(t => t.captionId === e),
          n = l.voiceCues.find(t => t.captionId === e),
          a = i.nativeTtsVoice ?? t?.requestedVoice ?? n?.voiceId;
        return (0, j.isTtssieureVoiceName)(a)
      })) throw O(e);
    let S = i.projectRoot;
    if (!S) throw Error("nle_document_reprocess_required");
    let P = n().addTask((0, f.createEditedSubtitleTtsRefreshTask)(e)),
      T = {
        processingStartedAt: i.processingStartedAt,
        processingCompletedAt: i.processingCompletedAt,
        processingDurationMs: i.processingDurationMs
      },
      w = new Set,
      x = 0,
      I = 1,
      E = _.length;
    try {
      for (let s of (n().updateTask(P, (0, f.editedSubtitleTtsRefreshStartedTaskUpdate)()), _)) {
        let d, h = await (0, L.buildNleEditedTtsCueContexts)(l, s);
        if (0 === h.length && u.length > 0) {
          let e = l.captions?.find(e => e.captionId === s);
          e && !0 !== e.excluded && e.translatedText.trim() && (h = [{
            projectRevision: l.revision,
            cueId: `cue-${e.captionId}`,
            captionId: s,
            captionText: e.translatedText,
            captionTextHash: await (0, L.nleCaptionTextHash)(e.translatedText),
            voiceSrt: `1
${G(e.sourceStartMs)} --> ${G(e.sourceEndMs)}
${(0,L.normalizeNleEditedTtsTextForSrt)(e.translatedText)}
`
          }])
        }
        if (0 === h.length) {
          if (_.length <= 1) throw Object.assign(Error("Câu phụ đề này không có giọng đọc để tạo lại."), {
            code: "nle_edited_tts_voice_cue_missing"
          });
          w.add(s), I = Math.max(I, Math.min(99, Math.floor(w.size / E * 100)));
          continue
        }
        let A = h[0],
          k = l.voiceCues.find(e => e.cueId === A.cueId),
          N = l.captions?.find(e => e.captionId === A.captionId),
          M = o?.ttsVoice ?? i.nativeTtsVoice ?? N?.requestedVoice ?? k?.voiceId ?? "vi-VN-NamMinhNeural";
        if (!o?.ttsVoice && (0, j.isTtssieureVoiceName)(M)) throw O(e);
        let R = k?.language ?? i.billingTargetLanguage ?? "vi",
          D = A.captionTextHash,
          F = (0, L.captionAudioIdentity)(l, s);
        try {
          if (!(d = await (0, m.runExclusiveLocalCpuJob)(() => (0, r.regenerateEngineVnextNativeTts)({
              engineFamily: v.ENGINE_VNEXT_NATIVE_FAMILY,
              runId: `${e}-nle-edited-tts-${Date.now()}`,
              inputPath: i.path,
              voiceSubtitleContent: A.voiceSrt,
              voiceSubtitlePath: (0, g.joinLocalPath)(S, "subtitles/nle-edited-tts-voice.srt"),
              displaySubtitlePath: (0, g.joinLocalPath)(S, "subtitles/nle-edited-tts-display.srt"),
              ttsManifestPath: i.ttsManifestPath ?? (0, g.joinLocalPath)(S, "tts/nle-edited-tts-unused-manifest.json"),
              outputVideoPath: null,
              performanceTracePath: null,
              targetLanguage: R,
              ttsProvider: b,
              ttsVoice: M,
              sourceDurationMs: l.source.durationMs,
              sourceWidth: l.source.width,
              sourceHeight: l.source.height,
              burnSubtitles: !1,
              watermarkRequired: !1,
              watermarkText: null,
              watermarkPolicySignature: null,
              soniCompatibility: null,
              dubbingTimeline: null,
              cuePreview: null,
              terminalProject: null,
              nleProject: {
                projectId: e,
                cueId: A.cueId,
                captionId: A.captionId,
                expectedRevision: A.projectRevision,
                expectedCaptionTextHash: D
              },
              processingSession: i.processingSession ?? null
            }, {
              onProgress: e => {
                let t = (0, f.editedSubtitleTtsRefreshProgressTaskUpdate)(e, {
                  completedCount: w.size,
                  totalCount: E,
                  minProgress: I
                });
                "number" == typeof t.progress && (I = Math.max(I, t.progress)), n().updateTask(P, t)
              }
            }))).nleDocument || 1 !== d.generatedClipCount || 0 !== d.reusedClipCount || 1 !== d.voiceoverCueCount) throw Object.assign(Error("native_nle_edited_tts_response_invalid"), {
            code: "native_nle_edited_tts_response_invalid"
          });
          let t = (0, C.decodeNleDocument)(d.nleDocument),
            a = {
              ...t,
              previewProjection: (0, C.decodeNlePreviewProjection)(d.nlePreviewProjection, t.revision)
            };
          if (a.revision !== l.revision + 1) throw Object.assign(Error("native_nle_edited_tts_response_invalid"), {
            code: "native_nle_edited_tts_response_invalid"
          });
          l = a, V.useSubtitleStore.getState().replaceVideoSubtitles(e, (0, C.nleCaptionsToSubtitles)(e, l)), x += 1, w.add(s), I = Math.max(I, Math.min(99, Math.floor(w.size / E * 100))), w.size < E && n().updateTask(P, {
            progress: I,
            message: `Đang tạo giọng ${w.size+1}/${E}...`
          });
          let o = c.filter(e => !w.has(e));
          n().updateVideo(e, {
            nleDocument: l,
            nativeTtsProvider: d.providerId,
            nativeTtsVoice: M,
            editedSubtitleTtsDirty: o.length > 0,
            editedSubtitleTtsDirtyCaptionIds: o,
            status: "completed",
            processingError: void 0,
            processingErrorDetail: void 0,
            ...T
          })
        } catch (b) {
          let i = !1,
            o = !1,
            d = !1,
            u = null;
          try {
            let t = await (0, a.readProjectManifest)(e);
            u = t?.manifest?.nle_document ? (0, C.decodeNleDocument)(t.manifest.nle_document) : null
          } catch (i) {
            await (0, t.appendAppLog)("warn", `[pipeline:${e}] Failed to read canonical manifest after TTS failure: ${(0,y.diagnosticTextForPipelineError)(i)}`).catch(() => void 0), u = null
          }
          if (null === u) {
            let i = (0, p.editedSubtitleTtsUserMessage)(b);
            throw n().updateVideo(e, {
              status: "completed",
              ...T,
              processingError: i
            }), n().updateTask(P, (0, f.editedSubtitleTtsRefreshFailedTaskUpdate)(i)), await (0, t.appendAppLog)("error", `[pipeline:${e}] NLE edited subtitle native TTS refresh failed: ${(0,y.diagnosticTextForPipelineError)(b)}`), Object.assign(Error(i), {
              code: "nle_edited_tts_cue_failed",
              customerMessage: i,
              audioCommitted: !1,
              rolledBack: !1,
              cause: b
            })
          }
          l = u;
          let g = u.captions.find(e => e.captionId === s),
            h = (0, L.captionAudioIdentity)(u, s),
            m = g ? await (0, L.nleCaptionTextHash)(g.translatedText) : null;
          if (d = !!(h && h.trim().length > 0 && h !== F && u.voiceCues.some(e => e.captionId === s && e.audio && "string" == typeof e.audio.relativePath && e.audio.relativePath.trim().length > 0 && e.audio.byteCount > 0 && e.audio.durationMs > 0) && m === D && !g?.ttsEditBaseline && u.revision > A.projectRevision)) {
            w.add(s);
            let t = (0, C.nleCaptionsToSubtitles)(e, u);
            V.useSubtitleStore.getState().replaceVideoSubtitles(e, t)
          } else {
            let n = (0, C.nleCaptionsToSubtitles)(e, u);
            if (V.useSubtitleStore.getState().replaceVideoSubtitles(e, n), g?.ttsEditBaseline && (o = !0, m === D && h === g.ttsEditBaseline.audioIdentity)) try {
              let t = await (0, r.mutateEngineVnextNleDocument)({
                projectId: e,
                expectedRevision: u.revision,
                mutation: {
                  kind: "rollback_caption_tts_baseline",
                  captionId: s,
                  expectedCaptionTextHash: D,
                  expectedAudioIdentity: g.ttsEditBaseline.audioIdentity
                }
              });
              l = t, i = !0;
              let n = (0, C.nleCaptionsToSubtitles)(e, t);
              V.useSubtitleStore.getState().replaceVideoSubtitles(e, n)
            } catch (i) {
              await (0, t.appendAppLog)("warn", `[pipeline:${e}] NLE edited subtitle baseline rollback failed: ${(0,y.diagnosticTextForPipelineError)(i)}`).catch(() => void 0)
            }
          }
          let _ = d ? (0, p.editedSubtitleTtsUserMessage)(b) : i ? "Tạo lại giọng thất bại. Đã khôi phục phụ đề cũ." : o ? "Tạo lại giọng thất bại. Không thể khôi phục phụ đề cũ." : (0, p.editedSubtitleTtsUserMessage)(b),
            v = c.filter(e => !w.has(e) && (!i || e !== s));
          throw n().updateVideo(e, {
            nleDocument: l,
            status: "completed",
            ...T,
            editedSubtitleTtsDirty: v.length > 0,
            editedSubtitleTtsDirtyCaptionIds: v,
            processingError: _
          }), await U(e, n, "partial_failure"), n().updateTask(P, (0, f.editedSubtitleTtsRefreshFailedTaskUpdate)(_)), await (0, t.appendAppLog)("error", `[pipeline:${e}] NLE edited subtitle native TTS refresh failed: ${(0,y.diagnosticTextForPipelineError)(b)}`), Object.assign(Error(_), {
            code: "nle_edited_tts_cue_failed",
            customerMessage: _,
            audioCommitted: d,
            rolledBack: i,
            cause: b
          })
        }
      }
      return n().updateVideo(e, {
        nleDocument: l,
        editedSubtitleTtsDirty: !1,
        editedSubtitleTtsDirtyCaptionIds: [],
        status: "completed",
        processingError: void 0,
        processingErrorDetail: void 0,
        ...T
      }), await U(e, n, "completed"), n().updateTask(P, (0, f.editedSubtitleTtsRefreshCompletedTaskUpdate)(x, _.length)), x
    } catch (r) {
      if (r && "object" == typeof r && "nle_edited_tts_cue_failed" === r.code) throw r;
      let i = (0, y.diagnosticTextForPipelineError)(r),
        a = c.filter(e => !w.has(e));
      throw n().updateVideo(e, {
        nleDocument: l,
        status: "completed",
        ...T,
        editedSubtitleTtsDirty: !0,
        editedSubtitleTtsDirtyCaptionIds: a,
        processingError: (0, p.editedSubtitleTtsUserMessage)(r)
      }), await U(e, n, "partial_failure"), n().updateTask(P, (0, f.editedSubtitleTtsRefreshFailedTaskUpdate)((0, p.editedSubtitleTtsUserMessage)(r))), await (0, t.appendAppLog)("error", `[pipeline:${e}] NLE edited subtitle native TTS refresh failed: ${i}`), r
    }
  }
  async function B(e, t) {
    let i = await (0, d.readOptionalSrtEntries)(e, "display");
    if ((0, u.canonicalSubtitleWriteWouldShrink)(i, t.length)) throw Object.assign(Error("canonical_subtitle_shrink_blocked"), {
      code: "canonical_subtitle_shrink_blocked",
      developerMessage: `canonical subtitle write would shrink ${i.length} cues to ${t.length}`
    })
  }
  async function z({
    videoId: e,
    video: t,
    get: i,
    captionIds: n,
    ttsProvider: a,
    ttsVoice: r
  }) {
    let o = await q(e, t, i, {
      captionIds: n,
      ttsProvider: a,
      ttsVoice: r
    });
    if (null === o) throw Object.assign(Error("Project này chưa có dữ liệu NLE để tạo lại âm thanh."), {
      code: "nle_document_reprocess_required"
    });
    return o
  }
  async function J({
    videoId: e,
    video: u,
    get: L,
    captionIds: C
  }) {
    let R = await q(e, u, L, {
      captionIds: C
    });
    if (null !== R) return R;
    if ((0, I.requiresCuePreviewRecovery)(u)) throw (0, I.cuePreviewRecoveryRequiredError)();
    let $ = (0, I.getTerminalDirectExportProjectRef)(u),
      G = $ ? (0, A.nextProjectAuthorityRevision)(e) : null,
      U = $ ? N.useTerminalProjectStore.getState().active : null,
      z = $ ? (0, A.getProjectPreviewRuntimeOwner)(e) : null;
    if ($) {
      if (!U || U.projectId !== e || U.generationId !== $.terminalGenerationId || U.graphHash !== $.graphHash) throw Error("direct_terminal_project_not_active");
      await (0, A.resolveProjectVisualBeforeTimingMutation)(e), z?.stop()
    }
    let K = u.exportWatermarkPolicy,
      W = !!u.cuePreviewPlanPath,
      Q = u.ttsManifestPath ?? await (0, a.getProjectArtifactPath)(e, "tts.manifest");
    if ([
        ["voiceSubtitlePath", u.voiceSubtitlePath],
        ["displaySubtitlePath", u.displaySubtitlePath]
      ].filter(([, e]) => !e).length > 0) throw Error("Video này không còn đủ dữ liệu TTS để tạo lại âm thanh. Hãy xử lý lại video.");
    let [Y, Z] = await Promise.all([(0, n.fileExists)(u.voiceSubtitlePath), (0, n.fileExists)(u.displaySubtitlePath)]), X = W || (u.ttsManifestPath ? await (0, n.fileExists)(Q) : !!K?.watermarkRequired);
    if (!Y || !Z || !X) throw Error("Video này không còn đủ dữ liệu TTS để tạo lại âm thanh. Hãy xử lý lại video.");
    let ee = (0, p.translatedLogicalSubtitlesForVideo)(e),
      et = ee.filter(e => e.translatedText.trim().length > 0),
      ei = et.filter(e => !0 !== e.excluded);
    if (0 === et.length || !W && 0 === ei.length) throw Error("Chưa có phụ đề dịch để tạo lại âm thanh.");
    let en = function(e, t) {
        let i = F(e.cuePreviewPlanPath);
        if (!i) return null;
        let n = F(e.cuePreviewPlanHash),
          a = F(e.cuePreviewJobId),
          r = e.cuePreviewGeneration,
          o = e.nativeProjectReadiness?.readyForEdit ? e.nativeProjectReadiness : null,
          s = F(o?.timelineGeneration),
          l = F(o?.timelineStateHash);
        if (!n || !/^sha256:[0-9a-f]{64}$/.test(n) || !a || !Number.isSafeInteger(r) || (r ?? 0) <= 0 || o && (!s || !/^generation:[0-9a-f]{64}$/.test(s) || !l || !/^sha256:[0-9a-f]{64}$/.test(l))) throw Error("Dữ liệu preview hiện tại không đầy đủ. Hãy mở lại project hoặc xử lý lại video.");
        return {
          projectId: e.id,
          jobId: a,
          planPath: i,
          planHash: n,
          generation: r,
          timelineGeneration: s,
          timelineStateHash: l,
          excludedCueIndices: t
        }
      }(u, et.flatMap((e, t) => !0 === e.excluded ? [t + 1] : [])),
      ea = en?.generation ?? 0,
      er = en?.planHash ?? "",
      eo = u.voiceSubtitlePath;
    if (K?.watermarkRequired && (!K.watermarkText?.trim() || !K.authorizationJti?.trim())) throw Error("Video này cần xử lý lại để tạo bản xuất hợp lệ trước khi tạo lại âm thanh.");
    let es = {
        processingStartedAt: u.processingStartedAt,
        processingCompletedAt: u.processingCompletedAt,
        processingDurationMs: u.processingDurationMs
      },
      {
        addTask: el,
        updateTask: ed,
        updateVideoStatus: eu
      } = L(),
      ec = el((0, f.createEditedSubtitleTtsRefreshTask)(e));
    try {
      if (eu(e, "generating_tts"), !await (0, w.ensureMediaToolsReady)({
          setPreparationMessage: e => {
            e && ed(ec, {
              progress: 1,
              message: e
            })
          },
          logContext: "edited subtitle audio refresh",
          checkingMessage: "Đang kiểm tra FFmpeg/FFprobe...",
          preparingMessage: "Đang cài lại FFmpeg/FFprobe...",
          errorTitle: "Không thể chuẩn bị bộ xử lý media",
          contextMessage: D
        })) throw Object.assign(Error("edited_tts_media_tools_unavailable"), {
        code: "edited_tts_media_tools_unavailable",
        customerMessage: D
      });
      await B(eo, ee);
      let n = o.useSettingsStore.getState().settings,
        y = (0, S.safeLocalEngineSoniSettings)(n.sonitranslateSettings ?? o.DEFAULT_SONITRANSLATE_SETTINGS),
        I = (0, _.withVideoOriginalAudioPolicy)(y, u),
        A = await (0, p.inferNativeTtsVoiceFromManifest)(Q),
        C = u.nativeTtsProvider ?? u.billingTtsProvider,
        R = u.nativeTtsVoice ?? function(e) {
          if (e?.trim() !== P.VIRAL_TTS_PROVIDER_ID) return;
          let t = s.useDashboardPreferencesStore.getState().voiceMode;
          return (0, P.isViralVoiceId)(t) ? t : P.VIRAL_VOICE_OPTIONS[0]?.id
        }(C);
      if ((0, j.isTtssieureProvider)(C) || (0, j.isTtssieureVoiceName)(R)) throw O(e);
      let q = (0, T.resolveTtsVoiceRoute)(C, R ?? A ?? (0, b.fastGpuTtsVoice)(y)),
        J = (0, x.resolveEditedTtsPiperLocalProject)({
          providerId: q.provider,
          voiceId: q.voice,
          processingSession: u.processingSession,
          watermarkRequired: K?.watermarkRequired
        }),
        W = `${e}-edited-tts-${Date.now()}`,
        Y = en || $ ? null : await (0, a.getProjectArtifactPath)(e, "exports.draft"),
        Z = u.performanceTracePath ?? await (0, a.getProjectArtifactPath)(e, "traces.performance"),
        X = (0, h.parentDirectoryFromPath)(Z),
        el = (0, h.parentDirectoryFromPath)(eo) ?? (0, h.parentDirectoryFromPath)(u.displaySubtitlePath);
      if (!el) throw Error("Video này không còn thư mục phụ đề hợp lệ để tạo lại âm thanh.");
      let eg = (0, g.joinLocalPath)(el, "voice.edited-tts.srt"),
        eh = (0, g.joinLocalPath)(el, "display.edited-tts.srt"),
        em = X ? (0, g.joinLocalPath)(X, `performance-edited-subtitle-tts-${Date.now()}.json`) : null,
        ef = await H(u),
        e_ = await (0, m.runExclusiveLocalCpuJob)(() => (0, r.regenerateEngineVnextNativeTts)({
          engineFamily: v.ENGINE_VNEXT_NATIVE_FAMILY,
          runId: W,
          inputPath: function(e, t, i) {
            if (!t) return i ?? e.path;
            let n = F(e.processingSession?.source_pin_path);
            if (!n) throw Error("direct_terminal_source_pin_missing");
            return n
          }(u, $, ef),
          voiceSubtitleContent: (0, c.subtitlesToVoiceSrt)(en || $ ? et : ei),
          voiceSubtitlePath: eg,
          displaySubtitlePath: eh,
          ttsManifestPath: Q,
          outputVideoPath: $ || en ? null : Y,
          performanceTracePath: em,
          targetLanguage: "vi",
          ttsProvider: q.provider,
          ttsVoice: q.voice,
          sourceDurationMs: $ || ef ? null : u.duration > 0 ? Math.round(1e3 * u.duration) : null,
          sourceWidth: u.width > 0 ? u.width : null,
          sourceHeight: u.height > 0 ? u.height : null,
          burnSubtitles: !1,
          watermarkRequired: !!K?.watermarkRequired,
          watermarkText: K?.watermarkText ?? null,
          watermarkPolicySignature: K?.authorizationJti ?? null,
          soniCompatibility: (0, _.buildNativeEditedSubtitleTtsCompatibilitySettings)(I),
          dubbingTimeline: (0, _.buildNativeDubbingTimelineSettings)(u.dubbingTimeline?.mode === "hybrid_stretch" ? {
            mode: "preserve_duration"
          } : u.dubbingTimeline ?? n.dubbingTimeline, {
            includeTts: !0,
            allowHistoricalNumericIntent: "historical_numeric" === u.dubbingTimelineIntent
          }),
          cuePreview: en,
          terminalProject: $ ? {
            projectId: $.projectId,
            jobId: $.jobId,
            expectedTerminalGenerationId: $.terminalGenerationId,
            expectedTerminalSnapshotHash: $.terminalSnapshotHash,
            expectedAuthority: {
              generationId: $.playbackGenerationId,
              graphHash: $.graphHash,
              transportProjectionHash: $.transportProjectionHash,
              audioScheduleHash: $.audioScheduleHash,
              visualSnapshotHash: $.visualSnapshotHash
            },
            clientRevision: G,
            baseSourceSubtitlePath: u.sourceSubtitlePath ?? null,
            baseTranslatedSubtitlePath: u.translatedSubtitlePath ?? u.voiceSubtitlePath ?? null,
            cues: et.map(e => ({
              captionId: e.id,
              stableCueId: e.stableCueId ?? e.id,
              excluded: !0 === e.excluded
            }))
          } : null,
          processingSession: J?.processingSession ?? u.processingSession ?? null
        }, {
          onProgress: t => {
            ed(ec, (0, f.editedSubtitleTtsRefreshProgressTaskUpdate)(t)), eu(e, (0, f.videoStatusForEditedSubtitleTtsRefreshStage)(t.stage))
          }
        }), {
          onQueued: () => {
            ed(ec, (0, f.editedSubtitleTtsRefreshQueuedTaskUpdate)())
          },
          onStarted: () => {
            ed(ec, (0, f.editedSubtitleTtsRefreshStartedTaskUpdate)())
          }
        }),
        ev = null !== en,
        eb = $ ? e_.terminalMutation : null;
      if ($) {
        if (null !== e_.outputVideoPath || !eb || eb.clientRevision !== G || eb.terminalGenerationId === $.terminalGenerationId || eb.graphHash === $.graphHash || eb.playbackGenerationId === $.playbackGenerationId) throw Object.assign(Error("native_direct_terminal_mutation_response_invalid"), {
          code: "native_direct_terminal_mutation_response_invalid"
        });
        let t = await (0, r.hydrateEngineVnextProjectPlaybackGraph)({
          projectId: e,
          jobId: $.jobId,
          terminalGenerationId: eb.terminalGenerationId,
          terminalSnapshotHash: eb.terminalSnapshotHash,
          timingAuthority: eb.timingAuthority,
          playbackGenerationId: eb.playbackGenerationId,
          graphHash: eb.graphHash,
          transportProjectionHash: eb.transportProjectionHash,
          audioScheduleHash: eb.audioScheduleHash,
          visualSnapshotHash: eb.visualSnapshotHash,
          audioGenerationId: eb.audioGenerationId,
          authoritySchemaVersion: eb.authoritySchemaVersion ?? void 0,
          editRevision: eb.editRevision ?? void 0,
          assetManifestHash: eb.assetManifestHash ?? void 0,
          artifactMembershipHash: eb.artifactMembershipHash ?? void 0
        });
        var ep = U.graph.mode;
        if (t.mode.mode !== ep.mode || "source_timeline" !== t.mode.mode && ("fixed_voice_speed" !== ep.mode || t.mode.requestedVoiceRateTenths !== ep.requestedVoiceRateTenths) || t.generationId !== eb.playbackGenerationId || t.graphHash !== eb.graphHash || t.transportProjectionHash !== eb.transportProjectionHash || t.audioScheduleHash !== eb.audioScheduleHash || t.visualSnapshotHash !== eb.visualSnapshotHash || "project-edit-graph-v1" === t.schemaVersion && (t.editRevision !== eb.editRevision || t.assetManifestHash !== eb.assetManifestHash) || t.timingAuthority.generationId !== eb.timingAuthority.generationId || t.timingAuthority.planHash !== eb.timingAuthority.planHash || t.timingAuthority.timelineStateHash !== eb.timingAuthority.timelineStateHash) throw Object.assign(Error("native_direct_terminal_mutation_response_invalid"), {
          code: "native_direct_terminal_mutation_response_invalid"
        });
        let i = (0, k.projectPlaybackCaptionsToSubtitles)(e, t, (0, p.translatedLogicalSubtitlesForVideo)(e)),
          n = {
            projectId: e,
            generationId: eb.terminalGenerationId,
            snapshotHash: eb.terminalSnapshotHash,
            timingAuthority: eb.timingAuthority,
            audioGenerationId: eb.audioGenerationId,
            playbackGenerationId: eb.playbackGenerationId,
            graphHash: eb.graphHash,
            transportProjectionHash: eb.transportProjectionHash,
            audioScheduleHash: eb.audioScheduleHash,
            visualSnapshotHash: eb.visualSnapshotHash,
            graph: t,
            subtitles: i,
            renderSubtitles: i
          };
        if (!N.useTerminalProjectStore.getState().promoteTiming(e, $.terminalGenerationId, $.graphHash, n)) throw Object.assign(Error("direct terminal mutation was superseded"), {
          code: "direct_edited_tts_mutation_superseded"
        });
        V.useSubtitleStore.getState().replaceTerminalProjectSubtitles(e, i, i), L().updateVideo(e, {
          outputDuration: Number(eb.outputDurationMs) / 1e3,
          nativeProjectReadiness: {
            readyForEdit: !0,
            timelineGeneration: eb.playbackGenerationId,
            timelineStateHash: eb.transportProjectionHash,
            tempoState: "source_timeline" === t.mode.mode ? {
              state: "unapplied"
            } : {
              state: "applied",
              targetTempoTenths: t.mode.requestedVoiceRateTenths,
              generationId: eb.playbackGenerationId,
              logicalPlanHash: eb.transportProjectionHash
            },
            exportState: {
              state: "needs_export"
            },
            audioGenerationId: eb.audioGenerationId,
            timingAuthority: eb.timingAuthority
          },
          activeTerminalGeneration: eb.terminalGenerationId,
          terminalAdmission: (0, M.readyTerminalAdmissionFromMutation)({
            projectId: e,
            jobId: $.jobId,
            ...eb
          })
        }), await z?.reloadTimingGraph(t)
      }
      if (ev) {
        if (null !== e_.outputVideoPath || !e_.previewPlanPath || !e_.previewPlanHash || !/^sha256:[0-9a-f]{64}$/.test(e_.previewPlanHash) || e_.previewGeneration !== ea + 1 || e_.previewCueCount !== et.length || u.nativeProjectReadiness?.readyForEdit && !e_.projectTempo || !e_.timelineVideoPath) throw Object.assign(Error("native_edited_preview_response_invalid"), {
          code: "native_edited_preview_response_invalid"
        });
        let t = L().videos.find(t => t.id === e);
        if (t?.cuePreviewPlanHash !== er || t?.cuePreviewGeneration !== ea) throw Object.assign(Error("native_cue_preview_plan_stale"), {
          code: "native_cue_preview_plan_stale"
        })
      } else if (!$ && !e_.outputVideoPath) throw Object.assign(Error("native_edited_tts_output_missing"), {
        code: "native_edited_tts_output_missing"
      });
      return await B(eo, ee), await (0, i.exportSubtitles)(ee, "srt", eo, null), await (0, d.syncSubtitleArtifactsToTimeline)({
        sourceSubtitlePath: null,
        displaySubtitlePath: null,
        renderSubtitlePath: e_.displaySubtitlePath,
        videoId: e
      }), L().updateVideo(e, {
        draftVideoPath: ev ? void 0 : e_.outputVideoPath ?? void 0,
        translatedVideoPath: ev ? void 0 : e_.outputVideoPath ?? void 0,
        translatedSubtitlePath: eo,
        voiceSubtitlePath: eo,
        displaySubtitlePath: e_.displaySubtitlePath,
        ttsManifestPath: (ev || $) && $ ? u.ttsManifestPath : e_.ttsManifestPath,
        ...$ ? {
          activeTerminalGeneration: eb?.terminalGenerationId
        } : {},
        cuePreviewPlanPath: ev ? e_.previewPlanPath ?? void 0 : void 0,
        cuePreviewPlanHash: ev ? e_.previewPlanHash ?? void 0 : void 0,
        cuePreviewSchemaVersion: ev ? "native-cue-preview-plan-v2" : void 0,
        cuePreviewCueCount: ev ? e_.previewCueCount ?? void 0 : void 0,
        cuePreviewGeneration: ev ? e_.previewGeneration ?? void 0 : void 0,
        cuePreviewArchitecture: ev ? u.cuePreviewArchitecture : void 0,
        cuePreviewTimelineVideoPath: ev ? e_.timelineVideoPath ?? void 0 : void 0,
        cuePreviewJobId: ev ? u.cuePreviewJobId : void 0,
        cuePreviewOriginalVolume: ev ? u.cuePreviewOriginalVolume : void 0,
        cuePreviewTranslatedVolume: ev ? u.cuePreviewTranslatedVolume : void 0,
        ...ev && e_.projectTempo ? {
          outputDuration: e_.projectTempo.outputDurationMs / 1e3,
          nativeProjectReadiness: (0, E.projectTempoReadinessFromMutation)(e_.projectTempo),
          projectTempoMarkerCueIds: e_.projectTempo.markerCueIds
        } : {},
        nativeTtsProvider: e_.providerId,
        nativeTtsVoice: q.voice,
        editedSubtitleTtsDirty: !1,
        editedSubtitleTtsDirtyCaptionIds: [],
        projectAuthorizationReceipt: void 0,
        ttsAudioFiles: ev ? void 0 : [],
        ttsTimelineAudioPath: void 0,
        finalExportPath: void 0,
        finalExportedAt: void 0,
        finalExportHasSubtitles: void 0,
        finalExportHasWatermark: void 0,
        finalExportHasOverlays: void 0,
        subtitlesBurnedIntoVideo: !1,
        status: "completed",
        ...es
      }), ed(ec, (0, f.editedSubtitleTtsRefreshCompletedTaskUpdate)(e_.generatedClipCount, e_.voiceoverCueCount)), await (0, l.persistLatestProjectManifest)(e, L, {
        artifact: "edited_subtitle_tts_refresh",
        tts_provider: e_.providerId,
        generated_clip_count: e_.generatedClipCount,
        reused_clip_count: e_.reusedClipCount
      }), await (0, t.appendAppLog)("info", `[pipeline:${e}] Edited subtitle native TTS refresh completed generated=${e_.generatedClipCount}/${e_.voiceoverCueCount} reused=${e_.reusedClipCount} output=${e_.outputVideoPath}`), e_.generatedClipCount
    } catch (a) {
      $ && U && z && await z.reloadTimingGraph(U.graph).catch(() => void 0);
      let i = (0, p.editedSubtitleTtsUserMessage)(a),
        n = (0, y.diagnosticTextForPipelineError)(a);
      throw L().updateVideo(e, {
        status: "completed",
        ...es,
        processingError: i
      }), ed(ec, (0, f.editedSubtitleTtsRefreshFailedTaskUpdate)(i)), await (0, t.appendAppLog)("error", `[pipeline:${e}] Edited subtitle native TTS refresh failed: ${n}`), Object.assign(Error(i), {
        cause: a
      })
    }
  }
  e.s(["runEditedSubtitleTtsRefreshJob", 0, J, "runNleVoiceRegenerateForCaptions", 0, z])
}, 53690, 61010, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(81341),
    n = e.i(53752),
    a = e.i(58450);

  function r(e, t) {
    return e.filter(e => e.videoId === t).sort((e, t) => e.startTime - t.startTime || e.index - t.index)
  }

  function o(e, t) {
    let i = r(e, t);
    return i.some(e => e.translatedText.trim().length > 0) ? "dubbing" : i.some(e => e.originalText.trim().length > 0) ? "translate" : "full"
  }

  function s(e, t, i) {
    return [...e.filter(e => e.videoId !== t), ...r(i, t)]
  }
  e.s(["getPipelineResumeStage", 0, o, "getVideoSubtitles", 0, r, "mergeVideoSubtitles", 0, s], 61010);
  var l = e.i(43519),
    d = e.i(44318);
  async function u({
    videoId: e,
    config: c,
    get: p
  }) {
    let g = o(d.useSubtitleStore.getState().subtitles, e);
    if ("full" === g) await (0, t.appendAppLog)("info", `[pipeline:${e}] Dubbing resume stage=full`), await p().runFullPipeline(e, c.sourceLang, c.targetLang, c.translationEngine);
    else if ("translate" === g) {
      let {
        addTask: i,
        updateTask: o,
        updateVideoStatus: l,
        setVideoProcessingError: u
      } = p(), g = i({
        videoId: e,
        type: "translation",
        status: "processing",
        progress: 60,
        message: "Tiếp tục xử lý..."
      });
      try {
        let i;
        l(e, "translating");
        let u = r(d.useSubtitleStore.getState().subtitles, e).filter(e => e.originalText.trim().length > 0);
        if (0 === u.length) throw Error("No source subtitles available for translation.");
        let h = u.map(e => e.originalText),
          m = c.translationEngine ?? "libre_translate";
        try {
          i = await (0, n.translateText)(h, c.sourceLang, c.targetLang, m)
        } catch (r) {
          let a = "libre_translate" === m ? "google_translate" : null;
          if (await (0, t.appendAppLog)("warn", `[pipeline:${e}] Resume translation failed via ${m}: ${r instanceof Error?r.message:String(r)}`), !a) throw r;
          o(g, {
            progress: 70,
            message: "Đang thử cách dịch khác..."
          }), i = await (0, n.translateText)(h, c.sourceLang, c.targetLang, a), m = a
        }
        let f = u.map((e, t) => ({
            ...e,
            translatedText: i[t] || ""
          })),
          _ = d.useSubtitleStore.getState();
        _.setSubtitles(s(_.subtitles, e, f)), p().clearTtsForVideo(e), l(e, "completed"), o(g, {
          progress: 100,
          status: "completed",
          message: "Đã dịch xong, đang tạo giọng đọc."
        }), await (0, t.appendAppLog)("info", `[pipeline:${e}] Resume translation completed via ${m}`), await (0, a.persistLatestProjectManifest)(e, p, {
          source_lang: c.sourceLang,
          target_lang: c.targetLang,
          translation_engine: m
        })
      } catch (i) {
        let t = i instanceof Error ? i.message : String(i);
        throw u(e, t), o(g, {
          status: "error",
          message: "Tiếp tục xử lý thất bại. Hãy thử lại sau.",
          error: t
        }), i
      }
    } else await (0, t.appendAppLog)("info", `[pipeline:${e}] Dubbing resume stage=dubbing, skipping extract/STT/translation`), p().updateVideoStatus(e, "completed"), await (0, a.persistLatestProjectManifest)(e, p, {
      source_lang: c.sourceLang,
      target_lang: c.targetLang,
      resume_stage: "dubbing"
    });
    let h = r(d.useSubtitleStore.getState().subtitles, e).filter(e => e.translatedText.trim().length > 0);
    if (0 === h.length) throw Error("No translated subtitles available for TTS.");
    let m = p().videos.find(t => t.id === e);
    if (await (0, l.hasCompleteTtsAudio)(m, h.length)) await (0, t.appendAppLog)("info", `[pipeline:${e}] Complete TTS checkpoint exists, skipping TTS generation`);
    else {
      await (0, t.appendAppLog)("info", `[pipeline:${e}] Starting TTS generation subtitles=${h.length} engine=${c.ttsEngine} voice=${c.voice}`);
      let i = (await p().generateTtsForActiveSubtitles(e, c.voice, c.ttsEngine, c.language, c.speed, c.pitch, c.volume, c.ttsOptions)).filter(Boolean).length;
      if (0 === i) throw Error("No TTS audio files were generated after translation.");
      await (0, t.appendAppLog)("info", `[pipeline:${e}] TTS generation completed clips=${i}/${h.length}`)
    }
    let f = p().videos.find(t => t.id === e);
    if (f?.ttsTimelineAudioPath && await (0, i.fileExists)(f.ttsTimelineAudioPath)) return void await (0, t.appendAppLog)("info", `[pipeline:${e}] TTS timeline checkpoint exists, skipping timeline compose`);
    if (f?.ttsTimelineAudioPath && (p().updateVideo(e, {
        ttsTimelineAudioPath: void 0
      }), await (0, t.appendAppLog)("warn", `[pipeline:${e}] TTS timeline checkpoint missing, rebuilding`)), !(f?.ttsAudioFiles ?? []).some(Boolean)) throw Error("No TTS audio files are available for timeline composition.");
    let _ = await p().buildTtsTimelineForVideo(e);
    if (!_) throw Error("TTS timeline composition did not produce audio.");
    await (0, t.appendAppLog)("info", `[pipeline:${e}] TTS timeline composed path=${_}`), await (0, a.persistLatestProjectManifest)(e, p, {
      source_lang: c.sourceLang,
      target_lang: c.targetLang,
      tts_engine: c.ttsEngine,
      voice: c.voice
    })
  }
  e.s(["runDubbingPipelineJob", 0, u], 53690)
}, 95412, 54747, e => {
  "use strict";
  e.i(47167);
  var t = e.i(68834),
    i = e.i(8325),
    n = e.i(68476),
    a = e.i(21826);
  let r = "english-stt-whispercpp",
    o = "stt.en.whisper_cpp_small",
    s = "multilingual-stt-whispercpp",
    l = "stt.multi.whisper_cpp_small_q5",
    d = [{
      id: r,
      title: "Nhận diện tiếng Anh tốt hơn",
      description: "Tăng độ chính xác phụ đề cho video tiếng Anh.",
      capability: o,
      settingKey: "dichvideo.engineVnextAddon.englishSttWhispercpp.enabled",
      defaultEnabled: !0,
      featureLabel: "Tiếng Anh chất lượng cao",
      fallbackLabel: "Đang dùng chế độ tiêu chuẩn",
      installingDescription: "Đang cài gói nhận diện tiếng Anh.",
      unavailableDescription: "Chưa có gói nhận diện tiếng Anh phù hợp cho máy này.",
      installedDisabledDescription: "Gói đã cài, bật lên để dùng cho video tiếng Anh.",
      legacyIncludedDescription: "DichVideo Engine hiện tại chưa có gói tiếng Anh chất lượng cao.",
      enabledDescription: "Video tiếng Anh sẽ dùng nhận diện chất lượng cao khi xử lý.",
      legacyEnabledDescription: "Cài gói tiếng Anh chất lượng cao để dùng chế độ này.",
      installActionLabel: "Cài gói tiếng Anh",
      enableLabel: "Dùng cho video tiếng Anh",
      noPackageLabel: "Chưa có gói"
    }, {
      id: s,
      title: "Nhận diện đa ngôn ngữ tốt hơn",
      description: "Tăng độ chính xác phụ đề cho các ngôn ngữ đã benchmark đạt trên CPU.",
      capability: l,
      settingKey: "dichvideo.engineVnextAddon.multilingualSttWhispercpp.enabled",
      defaultEnabled: !0,
      featureLabel: "Đa ngôn ngữ chất lượng cao",
      fallbackLabel: "Cần tải gói nhận diện đa ngôn ngữ",
      installingDescription: "Đang cài gói nhận diện đa ngôn ngữ.",
      unavailableDescription: "Chưa có gói nhận diện đa ngôn ngữ phù hợp cho máy này.",
      installedDisabledDescription: "Gói đã cài, bật lên để dùng cho ngôn ngữ đã hỗ trợ.",
      legacyIncludedDescription: "DichVideo Engine hiện tại chưa có gói nhận diện đa ngôn ngữ.",
      enabledDescription: "Các ngôn ngữ đã benchmark đạt sẽ dùng nhận diện chất lượng cao khi xử lý.",
      legacyEnabledDescription: "Cài gói nhận diện đa ngôn ngữ để dùng chế độ này.",
      installActionLabel: "Cài gói đa ngôn ngữ",
      enableLabel: "Dùng cho ngôn ngữ đã hỗ trợ",
      noPackageLabel: "Chưa có gói"
    }];

  function u(e) {
    return d.find(t => t.id === e) ?? null
  }

  function c(e) {
    let t = u(e);
    if (!t) throw Error(`engine_vnext_addon_unsupported: ${e}`);
    return t
  }

  function p(e, t, i) {
    var n;
    let a = u(t);
    if (!a) return null;
    let r = e?.[t] ?? null;
    if (!r?.capabilities?.includes(a.capability)) return null;
    let o = r.recommended?.[i] ?? null;
    return o || ("string" == typeof(n = r).version && "string" == typeof n.url && "string" == typeof n.sha256 && "number" == typeof n.compressed_bytes && "number" == typeof n.installed_bytes ? {
      version: r.version,
      url: r.url,
      sha256: r.sha256,
      compressed_bytes: r.compressed_bytes,
      installed_bytes: r.installed_bytes
    } : null)
  }
  e.s(["ENGINE_VNEXT_ADDONS", 0, d, "ENGLISH_STT_ADDON_CAPABILITY", 0, o, "ENGLISH_STT_ADDON_ID", 0, r, "ENGLISH_STT_WHISPER_ROUTE", 0, "vnext.whisper_cpp_small_en", "MULTILINGUAL_STT_ADDON_CAPABILITY", 0, l, "MULTILINGUAL_STT_ADDON_ID", 0, s, "WHISPER_MULTILINGUAL_STT_ROUTE", 0, "vnext.whisper_cpp_small_multi", "findEngineVnextAddonRecommendation", 0, p, "requireEngineVnextAddonDefinition", 0, c], 54747), e.i(89268);
  var g = e.i(7787),
    h = e.i(30797),
    m = e.i(81341);
  let f = "windows-x64-cpu",
    _ = "windows-x64-gpu-cu12";

  function v(e) {
    let t = c(e),
      i = window.localStorage.getItem(t.settingKey);
    return null === i ? t.defaultEnabled : "true" === i
  }

  function b(e, t) {
    let i = c(e);
    window.localStorage.setItem(i.settingKey, t ? "true" : "false")
  }

  function S(e, t) {
    let i = c(e),
      n = t instanceof Error ? t.message : "string" == typeof t ? t : "";
    return n ? n.includes("insufficient_disk_space") ? `M\xe1y n\xe0y chưa đủ dung lượng để c\xe0i ${i.title}.` : n.includes("download_failed") ? `Kh\xf4ng tải được ${i.title}. H\xe3y kiểm tra mạng rồi thử lại.` : n.includes("checksum_mismatch") ? `G\xf3i ${i.title} tải về kh\xf4ng khớp dữ liệu tin cậy. H\xe3y thử lại sau.` : n.includes("addon_manifest_untrusted") ? `G\xf3i ${i.title} chưa được DichVideo x\xe1c thực. H\xe3y thử lại sau.` : n.includes("manifest_missing") || n.includes("addon_manifest_missing") ? i.unavailableDescription : `Kh\xf4ng chuẩn bị được ${i.title}. H\xe3y thử lại sau.` : `Chưa chuẩn bị được ${i.title}.`
  }

  function y(e) {
    let t = e.vendor.toLowerCase(),
      i = e.name.toLowerCase();
    return t.includes("nvidia") || i.includes("nvidia")
  }
  async function P() {
    try {
      return ((await (0, g.getLocalEnginePerformanceProfile)()).detected_gpus ?? []).some(y)
    } catch {
      return !1
    }
  }
  async function T(e) {
    return await P() && e.recommended?.[_] ? {
      variantKey: _
    } : {
      variantKey: f
    }
  }

  function w(e) {
    let t = Number.parseInt(e ?? "", 10);
    return Number.isFinite(t) && t > 0 ? t : null
  }
  async function x(e, t) {
    var i;
    let d, u, c, g = (0, m.isTauri)() ? await (0, h.getAppVersion)() : "0.1.29",
      _ = await n.cloudApi.engineVnextManifest(e, "windows-x64", "alpha", g);
    d = function(e) {
      if ("production" !== a.CLOUD_APP_ENV || "production" === a.CLOUD_APP_ENV) return null;
      let t = "0.1.0-alpha.1-english-stt-smoke".trim(),
        i = "".trim(),
        n = "8f2459451f10d178eebd572557bda6c4c1bd7a49d47ca9a12c366451e0eaa332".trim(),
        r = w("459955140"),
        s = w("543756270");
      return t && i && n && r && s && /^(file:\/\/|https:\/\/)/i.test(i) ? {
        requires_engine_family: e.family,
        requires_min_app_version: e.minimum_app_version,
        capabilities: [o],
        recommended: {
          [f]: {
            version: t,
            url: i,
            sha256: n,
            compressed_bytes: r,
            installed_bytes: s
          }
        }
      } : null
    }(i = _), u = function(e) {
      if ("production" !== a.CLOUD_APP_ENV || "production" === a.CLOUD_APP_ENV) return null;
      let t = "0.1.0-alpha.1-multilingual-stt-e2e".trim(),
        i = "".trim(),
        n = "a212d8ab630b27da8f85b1f379c1e5ac4c50142c7e557f85dce6d1603abbb434".trim(),
        r = w("198480377"),
        o = w("246228110");
      return t && i && n && r && o && /^(file:\/\/|https:\/\/)/i.test(i) ? {
        requires_engine_family: e.family,
        requires_min_app_version: e.minimum_app_version,
        capabilities: [l],
        recommended: {
          [f]: {
            version: t,
            url: i,
            sha256: n,
            compressed_bytes: r,
            installed_bytes: o
          }
        }
      } : null
    }(i), _ = d || u ? {
      ...i,
      addons: {
        ...i.addons ?? {},
        ...d ? {
          [r]: d
        } : {},
        ...u ? {
          [s]: u
        } : {}
      }
    } : i;
    let v = await T(_),
      b = p(_.addons, t, v.variantKey);
    if (!b) return null;
    let S = b.version.trim(),
      y = b.sha256.trim().toLowerCase();
    try {
      c = new URL(b.url)
    } catch {
      throw Error(`${t}_addon_manifest_untrusted_url`)
    }
    if ("https:" !== c.protocol && ("production" !== a.CLOUD_APP_ENV, 1)) throw Error(`${t}_addon_manifest_untrusted_url`);
    if (!S) throw Error(`${t}_addon_manifest_untrusted_version`);
    if (!/^[a-f0-9]{64}$/i.test(y)) throw Error(`${t}_addon_manifest_untrusted_sha256`);
    if (!Number.isFinite(b.compressed_bytes) || b.compressed_bytes <= 0 || !Number.isFinite(b.installed_bytes) || b.installed_bytes <= 0) throw Error(`${t}_addon_manifest_untrusted_size`);
    return {
      ...b,
      version: S,
      url: b.url.trim(),
      sha256: y
    }
  }
  async function I(e, t) {
    if (!(0, m.isTauri)()) return !1;
    try {
      return !!await x(e, t)
    } catch {
      return !1
    }
  }

  function E(e) {
    return {
      enabled: v(e),
      status: "idle",
      recommendation: null,
      addonStatus: null,
      plan: null,
      progress: null,
      error: null
    }
  }

  function A(e, t, i) {
    return {
      addons: {
        ...e.addons,
        [t]: {
          ...e.addons[t] ?? E(t),
          ...i
        }
      }
    }
  }

  function k(e, t) {
    let i = c(e);
    return !!(t?.installed && t.trusted && t.capabilities.includes(i.capability))
  }

  function V(e) {
    return M.getState().addons[e] ?? E(e)
  }
  async function N(e) {
    return M.getState().refreshLocalStatus(e)
  }
  let M = (0, t.create)((e, t) => ({
    addons: Object.fromEntries(d.map(e => [e.id, E(e.id)])),
    setAddonEnabled: (t, i) => {
      b(t, i), e(e => A(e, t, {
        enabled: i
      }))
    },
    refreshLocalStatus: async t => {
      let i = v(t);
      if (!(0, m.isTauri)()) return e(e => A(e, t, {
        enabled: i,
        status: "not_installed",
        addonStatus: null,
        progress: null,
        error: null
      })), null;
      try {
        let n = await (0, g.getEngineVnextAddonStatus)(t);
        return e(e => A(e, t, {
          enabled: i,
          addonStatus: n,
          status: k(t, n) ? "installed" : "not_installed",
          progress: null,
          error: null
        })), n
      } catch (n) {
        return e(e => A(e, t, {
          enabled: i,
          status: "error",
          progress: null,
          error: S(t, n)
        })), null
      }
    },
    loadStatus: async (i, n) => {
      let a = v(n);
      if (!(0, m.isTauri)()) return void e(e => A(e, n, {
        enabled: a,
        status: "not_installed",
        recommendation: null,
        addonStatus: null,
        progress: null,
        error: null
      }));
      e(e => A(e, n, {
        enabled: a,
        status: "checking",
        error: null
      }));
      try {
        let i = await (0, g.getEngineVnextAddonStatus)(n),
          r = k(n, i);
        e(e => A(e, n, {
          enabled: a,
          recommendation: i.installed ? t().addons[n]?.recommendation ?? null : null,
          addonStatus: i,
          status: r ? "installed" : "not_installed",
          progress: null,
          error: null
        }))
      } catch (t) {
        e(e => A(e, n, {
          enabled: a,
          status: "error",
          progress: null,
          error: S(n, t)
        }))
      }
    },
    installAddon: async (t, n) => {
      if (!(0, m.isTauri)()) return void e(e => A(e, n, {
        status: "not_installed",
        error: null
      }));
      e(e => A(e, n, {
        status: "checking",
        error: null,
        progress: null
      }));
      let a = null;
      try {
        let r = await x(t, n);
        if (!r) throw Error(`${n}_addon_manifest_missing`);
        let o = await (0, g.getEngineVnextAddonInstallPlan)({
          addonId: n,
          version: r.version,
          compressedBytes: r.compressed_bytes,
          installedBytes: r.installed_bytes
        });
        if (!o.canInstallNow) throw Error(`${n}_addon_install_blocked: ${o.blockedReasonCode}`);
        a = await (0, i.listen)("engine-vnext-addon-install-progress", t => {
          e(e => A(e, n, {
            progress: t.payload,
            status: "installing"
          }))
        }), e(e => A(e, n, {
          status: "installing",
          recommendation: r,
          plan: o
        }));
        let s = await (0, g.downloadAndInstallEngineVnextAddon)({
            addonId: n,
            packageUrl: r.url,
            version: r.version,
            sha256: r.sha256,
            packageSizeBytes: r.compressed_bytes,
            installedBytes: r.installed_bytes
          }),
          l = await (0, g.getEngineVnextAddonStatus)(s.addonId);
        b(n, !0), e(e => A(e, n, {
          enabled: !0,
          addonStatus: l,
          status: k(n, l) ? "installed" : "not_installed",
          progress: null,
          error: null
        }))
      } catch (t) {
        throw e(e => A(e, n, {
          status: "error",
          progress: null,
          error: S(n, t)
        })), t
      } finally {
        a?.()
      }
    },
    uninstallAddon: async t => {
      let i = v(t);
      if (!(0, m.isTauri)()) return void e(e => A(e, t, {
        enabled: i,
        status: "not_installed",
        recommendation: null,
        addonStatus: null,
        plan: null,
        progress: null,
        error: null
      }));
      e(e => A(e, t, {
        enabled: i,
        status: "uninstalling",
        error: null,
        progress: null
      }));
      try {
        let n = await (0, g.uninstallEngineVnextAddon)(t);
        e(e => A(e, t, {
          enabled: i,
          recommendation: null,
          addonStatus: n,
          plan: null,
          progress: null,
          status: k(t, n) ? "installed" : "not_installed",
          error: null
        }))
      } catch (n) {
        e(e => {
          let a;
          return A(e, t, {
            enabled: i,
            status: "error",
            progress: null,
            error: (a = c(t), (n instanceof Error ? n.message : "string" == typeof n ? n : "").includes("desktop_only") ? `Chỉ c\xf3 thể x\xf3a ${a.title} trong bản app desktop.` : `Kh\xf4ng x\xf3a được ${a.title}. H\xe3y thử lại sau.`)
          })
        })
      }
    },
    clearError: t => {
      e(e => A(e, t, {
        error: null
      }))
    }
  }));
  e.s(["engineVnextAddonIncludedInCurrentEngine", 0, function(e, t) {
    return !!(k(e, t) && t?.source === "legacy_monolithic")
  }, "engineVnextAddonInstalled", 0, k, "engineVnextAddonPath", 0, function(e) {
    let t, i = V(e);
    return (t = V(e)).enabled && k(e, t.addonStatus) ? i.addonStatus?.path ?? null : null
  }, "engineVnextAddonRecommendationAvailable", 0, I, "engineVnextAddonVisibleInSettings", 0, function(e, t) {
    let i = t ?? V(e);
    return "installing" === i.status || "uninstalling" === i.status || !!i.addonStatus?.installed
  }, "refreshEngineVnextAddonRuntimeStatus", 0, N, "useEngineVnextAddonStore", 0, M], 95412)
}, 90976, 30606, 96269, 71708, 98948, 57686, 3669, 59253, 43769, 27901, 53693, 53901, 12333, 64059, 31367, 16331, 43960, 15162, 15023, e => {
  "use strict";
  var t = e.i(47167),
    i = e.i(79705),
    n = e.i(54747);
  e.i(89268);
  var a = e.i(30797),
    r = e.i(95412),
    o = e.i(45017);
  let s = new Set,
    l = new Set(["id", "ms", "fil", "fr", "de", "es", "pt", "hi"]);

  function d(e) {
    return !!e && !!s.has(e) && (s.delete(e), !0)
  }

  function u(e) {
    let t = e instanceof Error ? e.message : String(e);
    return Object.assign(Error(t.includes("manifest_missing") || t.includes("addon_manifest_missing") ? "Chưa có gói tiếng Anh phù hợp để tải. Video chưa chạy; bạn có thể chọn Để sau ở lần xử lý tiếp theo để dùng nhận diện chuẩn." : "Chưa tải được gói tiếng Anh. Video chưa chạy; hãy kiểm tra mạng rồi thử lại, hoặc chọn Để sau ở lần xử lý tiếp theo để dùng nhận diện chuẩn."), {
      code: "english_stt_addon_install_failed",
      cause: e
    })
  }

  function c(e) {
    let t = e instanceof Error ? e.message : String(e);
    return Object.assign(Error(t.includes("manifest_missing") || t.includes("addon_manifest_missing") ? "Gói nhận diện đa ngôn ngữ chưa sẵn sàng để tải. Video chưa chạy; hãy thử lại sau khi DichVideo cập nhật gói này." : "Chưa tải được gói nhận diện đa ngôn ngữ. Video chưa chạy; hãy kiểm tra mạng rồi thử lại."), {
      code: "multilingual_stt_addon_install_failed",
      cause: e
    })
  }
  async function p(e, t, i) {
    e && await (0, a.appendAppLog)(t, `[pipeline:${e}] ${i}`)
  }
  async function g() {
    return "confirmed" === await o.useEnginePreparationStore.getState().requestEnginePreparation({
      reason: "missing",
      title: "Tải gói nhận diện tiếng Anh?",
      description: "Video đang chọn tiếng Anh. DichVideo có thể tải thêm gói nhận diện để nghe tiếng Anh rõ hơn và chia câu tự nhiên hơn. Nếu chọn Để sau, app vẫn xử lý bằng nhận diện chuẩn và sẽ hỏi lại ở lần xử lý tiếng Anh tiếp theo.",
      detailTitle: "Tải một lần cho máy này",
      detailDescription: "DichVideo tự chọn gói phù hợp với máy. Bạn có thể xóa gói này trong Cài đặt khi không cần nữa.",
      confirmLabel: "Tải gói tiếng Anh",
      cancelLabel: "Để sau"
    })
  }
  async function h(e) {
    return "confirmed" === await o.useEnginePreparationStore.getState().requestEnginePreparation({
      reason: "missing",
      title: "Tải gói nhận diện đa ngôn ngữ?",
      description: `Video đang chọn ng\xf4n ngữ ${e}. DichVideo cần tải th\xeam g\xf3i nhận diện để nghe r\xf5 hơn v\xe0 chia c\xe2u tự nhi\xean hơn trước khi xử l\xfd.`,
      detailTitle: "Tải một lần cho máy này",
      detailDescription: "DichVideo tự chọn gói phù hợp với máy. Bạn có thể xóa gói này trong Cài đặt khi không cần nữa.",
      confirmLabel: "Tải gói đa ngôn ngữ",
      cancelLabel: "Để sau"
    })
  }

  function m(e) {
    return l.has(e.trim().toLowerCase())
  }
  async function f({
    sourceLanguage: e,
    apiUrl: t,
    videoId: i,
    taskId: a,
    updateTask: o,
    onStatusMessage: s
  }) {
    if ("en" !== e) return null;
    s?.("Đang kiểm tra gói tiếng Anh...");
    let l = await (0, r.refreshEngineVnextAddonRuntimeStatus)(n.ENGLISH_STT_ADDON_ID),
      c = (0, r.engineVnextAddonPath)(n.ENGLISH_STT_ADDON_ID);
    if (c) return await p(i, "info", `English STT add-on ready route=${n.ENGLISH_STT_WHISPER_ROUTE}`), c;
    if (l?.installed && !l.trusted) return await p(i, "warn", `English STT add-on installed but not trusted; using standard English STT error=${l.errorCode??"untrusted"}`), null;
    if (l?.installed) return await p(i, "info", "English STT add-on installed but disabled or missing capability; using standard English STT"), null;
    if (d(i)) return await p(i, "info", "English STT add-on prompt already handled before queue start; using standard English STT"), null;
    if (!await (0, r.engineVnextAddonRecommendationAvailable)(t, n.ENGLISH_STT_ADDON_ID)) throw await p(i, "warn", "English STT add-on package recommendation missing; processing blocked before install prompt"), s?.(null), u(Error("addon_manifest_missing"));
    if (s?.(null), !await g()) return await p(i, "info", "English STT add-on install declined; using standard English STT"), null;
    s?.("Đang tải gói tiếng Anh..."), a && o && o(a, {
      progress: 6,
      message: "Đang tải gói nhận diện tiếng Anh..."
    });
    try {
      await r.useEngineVnextAddonStore.getState().installAddon(t, n.ENGLISH_STT_ADDON_ID);
      let e = await (0, r.refreshEngineVnextAddonRuntimeStatus)(n.ENGLISH_STT_ADDON_ID),
        a = (0, r.engineVnextAddonPath)(n.ENGLISH_STT_ADDON_ID);
      if (a) return await p(i, "info", `English STT add-on installed route=${n.ENGLISH_STT_WHISPER_ROUTE}`), a;
      throw await p(i, "warn", `English STT add-on install finished but not ready; processing blocked error=${e?.errorCode??"not_ready"}`), u(Error(e?.errorCode ?? "not_ready"))
    } catch (t) {
      if (t instanceof Error && "code" in t && "english_stt_addon_install_failed" === t.code) throw t;
      let e = t instanceof Error ? t.message : String(t);
      throw await p(i, "warn", `English STT add-on install error; processing blocked error=${e}`), u(t)
    } finally {
      s?.(null)
    }
  }
  async function _({
    sourceLanguage: e,
    apiUrl: t,
    videoId: i,
    taskId: a,
    updateTask: o,
    onStatusMessage: s
  }) {
    let l = e.trim().toLowerCase();
    if (!m(l)) return null;
    s?.("Đang kiểm tra gói nhận diện đa ngôn ngữ...");
    let u = await (0, r.refreshEngineVnextAddonRuntimeStatus)(n.MULTILINGUAL_STT_ADDON_ID),
      g = (0, r.engineVnextAddonPath)(n.MULTILINGUAL_STT_ADDON_ID);
    if (g) return await p(i, "info", `Multilingual STT add-on ready route=${n.WHISPER_MULTILINGUAL_STT_ROUTE}`), g;
    if (u?.installed) throw await p(i, "warn", `Multilingual STT add-on installed but not ready; processing blocked error=${u.errorCode??"not_ready"}`), c(Error(u.errorCode ?? "not_ready"));
    if (d(i)) throw await p(i, "info", "Multilingual STT add-on prompt already handled before queue start; processing blocked"), c(Error("install_declined"));
    if (!await (0, r.engineVnextAddonRecommendationAvailable)(t, n.MULTILINGUAL_STT_ADDON_ID)) throw await p(i, "warn", "Multilingual STT add-on package recommendation missing; processing blocked before install prompt"), c(Error("addon_manifest_missing"));
    if (s?.(null), !await h(l)) throw await p(i, "info", "Multilingual STT add-on install declined; processing blocked"), c(Error("install_declined"));
    s?.("Đang tải gói nhận diện đa ngôn ngữ..."), a && o && o(a, {
      progress: 6,
      message: "Đang tải gói nhận diện đa ngôn ngữ..."
    });
    try {
      await r.useEngineVnextAddonStore.getState().installAddon(t, n.MULTILINGUAL_STT_ADDON_ID);
      let e = await (0, r.refreshEngineVnextAddonRuntimeStatus)(n.MULTILINGUAL_STT_ADDON_ID),
        a = (0, r.engineVnextAddonPath)(n.MULTILINGUAL_STT_ADDON_ID);
      if (a) return await p(i, "info", `Multilingual STT add-on installed route=${n.WHISPER_MULTILINGUAL_STT_ROUTE}`), a;
      throw await p(i, "warn", `Multilingual STT add-on install finished but not ready; processing blocked error=${e?.errorCode??"not_ready"}`), c(Error(e?.errorCode ?? "not_ready"))
    } catch (t) {
      if (t instanceof Error && "code" in t && "multilingual_stt_addon_install_failed" === t.code) throw t;
      let e = t instanceof Error ? t.message : String(t);
      throw await p(i, "warn", `Multilingual STT add-on install failed; processing blocked error=${e}`), c(t)
    } finally {
      s?.(null)
    }
  }
  e.s(["ensureEnglishSttAddonReadyForProcessing", 0, f, "ensureWhisperMultilingualSttAddonReadyForProcessing", 0, _, "isWhisperMultilingualSourceLanguage", 0, m, "markEnglishSttAddonPromptHandledForVideos", 0, function(e) {
    for (let t of e) s.add(t)
  }], 30606);
  let v = {
    family: i.ENGINE_VNEXT_FAMILY,
    allowFallback: !1
  };

  function b() {
    return !1
  }

  function S(e) {
    let t = e?.family === i.ENGINE_VNEXT_FAMILY || e?.family === i.LEGACY_ENGINE_FAMILY ? e.family : v.family,
      n = t !== i.LEGACY_ENGINE_FAMILY || b() ? t : v.family,
      a = "string" == typeof e?.lastRoute && e.lastRoute.trim() ? e.lastRoute.trim() : void 0;
    return {
      family: n,
      allowFallback: b() && e?.allowFallback === !0,
      ...a ? {
        lastRoute: a
      } : {}
    }
  }

  function y() {
    return !0
  }

  function P(e) {
    let t = "dichvideo-engine-vnext";
    return t === i.ENGINE_VNEXT_FAMILY || t === i.LEGACY_ENGINE_FAMILY && b() ? S({
      ...e,
      family: t
    }) : S(e)
  }
  e.s(["DEFAULT_ENGINE_PREFERENCE", 0, v, "effectiveEnginePreference", 0, P, "engineVnextPipelineAlphaEnabled", 0, function() {
    return !0
  }, "engineVnextRouteSourceLanguage", 0, function(e) {
    return t.default.env.NEXT_PUBLIC_DICHVIDEO_ENGINE_VNEXT_SOURCE_LANGUAGE?.trim() || e || "auto"
  }, "engineVnextStrictModeEnabled", 0, y, "legacyCustomerProcessingPathEnabled", 0, b, "nativeVnextAutoRouteDecision", 0, function(e) {
    return {
      useVnext: e,
      route: "vnext.auto_probe",
      language: "auto",
      reason: e ? "auto_audio_probe" : "vnext_unavailable",
      fallbackAllowed: !1,
      fallbackRoute: "legacy.soni_whisperx"
    }
  }, "nativeVnextJobSttRoute", 0, function(e, t = null, i = null) {
    return "auto" === e.language ? null : "en" === e.language && t ? n.ENGLISH_STT_WHISPER_ROUTE : i && m(e.language) ? n.WHISPER_MULTILINGUAL_STT_ROUTE : e.route
  }, "nativeVnextRouteSourceLanguage", 0, function(e) {
    return e.trim() || "auto"
  }, "normalizeEnginePreference", 0, S], 90976);
  var T = e.i(75157),
    w = e.i(58450),
    x = e.i(94010),
    I = e.i(62686),
    E = e.i(97347),
    A = e.i(63126),
    k = e.i(53752);
  async function V(e, t, i) {
    let n = e.filter(e => (0, E.sameQueuedSourcePath)(e.path, t)).reverse().find(e => (0, E.isUntouchedReusableDraft)(e, i));
    if (!n) return null;
    let a = await (0, x.ensureProjectThumbnail)({
      ...n,
      path: t,
      sourceMissing: !1
    });
    return {
      video: a,
      changed: a.thumbnail !== n.thumbnail || a.path !== n.path || a.sourceMissing !== n.sourceMissing
    }
  }
  async function N(e, t) {
    let i = await (0, k.importVideo)(e),
      n = await (0, A.getProjectWorkspaceDir)(i.id);
    return (0, x.ensureProjectThumbnail)((0, I.toVideoFile)({
      ...i,
      projectRoot: n,
      sourceMode: "linked",
      sourceMissing: !1,
      exportLayers: i.exportLayers ?? t
    }))
  }
  var M = e.i(6040),
    L = e.i(68834),
    C = e.i(79473),
    j = e.i(48868);

  function R(e) {
    return e.map((e, t) => ({
      ...e,
      id: `preset_${e.type}_${Date.now()}_${t}_${Math.random().toString(36).slice(2,8)}`
    }))
  }

  function D(e, t) {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      subtitleStyle: {
        ...e
      },
      exportLayers: R(t)
    }
  }
  async function F(e, t) {
    let i = t.filter(e => "image" === e.type).map(e => e.imagePath);
    if (0 === i.length) return R(t);
    let n = await (0, A.sealExportDesignPresetImages)({
      projectId: e,
      imagePaths: i
    });
    if (n.length !== i.length) throw Object.assign(Error("preset image sealing returned an incomplete result"), {
      code: "nle_image_asset_write_failed"
    });
    let a = 0;
    return R(t).map(e => {
      if ("image" !== e.type) return e;
      let t = n[a];
      return a += 1, {
        ...e,
        imagePath: t
      }
    })
  }

  function H(e, t) {
    let i = e && "object" == typeof e ? e : {
        message: e
      },
      n = [i.code, i.name, i.message].find(e => "string" == typeof e && /^(?:nle_[a-z_]+|preset_[a-z_]+|QuotaExceededError|SecurityError)$/.test(e)),
      r = "string" == typeof n ? n : "preset_save_failed";
    (0, a.appendAppLog)("error", `[preset-save] stage=${t} code=${r}`).catch(() => void 0);
    let o = "seal_images" === t ? "lưu ảnh preset" : "lưu dữ liệu preset";
    return Object.assign(Error(`Kh\xf4ng thể ${o}. M\xe3 lỗi: ${r}.`), {
      code: r,
      stage: t,
      cause: e
    })
  }
  e.s(["cloneExportDesignPresetLayers", 0, R, "createExportDesignPreset", 0, D, "sealExportDesignPresetLayers", 0, F], 96269);
  let $ = "dichvideo-export-design-preset";

  function O(e, t, i) {
    return e.find(e => e.id === t) ?? e.find(e => e.id === i) ?? e[0] ?? null
  }

  function G(e, t) {
    if ("u" < typeof localStorage) throw Error("preset_storage_unavailable");
    if (localStorage.setItem($, JSON.stringify({
        state: {
          presets: e,
          activePresetId: t
        },
        version: 1
      })), null === localStorage.getItem($)) throw Error("preset_storage_write_failed")
  }
  let U = (0, L.create)()((0, C.persist)((e, t) => ({
    presets: [],
    activePresetId: null,
    savePreset: async (i, n, a, r) => {
      let o = i.trim();
      if (!o) throw H(Error("preset_name_empty"), "persist_data");
      let s = "seal_images";
      try {
        let i = await F(r, a);
        s = "persist_data";
        let l = D(n, i),
          d = t().presets.find(e => e.name === o),
          u = d?.id ?? `preset_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
          c = {
            id: u,
            name: o,
            preset: l
          },
          p = d ? t().presets.map(e => e.id === d.id ? c : e) : [...t().presets, c],
          g = t().activePresetId ?? u;
        return G(p, g), e({
          presets: p,
          activePresetId: g
        }), u
      } catch (e) {
        throw H(e, s)
      }
    },
    deletePreset: t => e(e => {
      let i = e.presets.filter(e => e.id !== t);
      return {
        presets: i,
        activePresetId: e.activePresetId === t ? i[0]?.id ?? null : e.activePresetId
      }
    }),
    setActivePreset: t => e({
      activePresetId: t
    }),
    getPresetExportLayers: e => R(O(t().presets, e, t().activePresetId)?.preset.exportLayers ?? []),
    getPresetExportLayersForProject: async (i, n) => {
      let a = O(t().presets, n, t().activePresetId);
      if (!a) return [];
      let r = await F(i, a.preset.exportLayers),
        o = {
          ...a,
          preset: {
            ...a.preset,
            exportLayers: r
          }
        },
        s = t().presets.map(e => e.id === a.id ? o : e);
      return G(s, t().activePresetId), e({
        presets: s
      }), R(r)
    }
  }), {
    name: $,
    version: 1,
    storage: (0, C.createJSONStorage)(() => (0, j.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      presets: e.presets,
      activePresetId: e.activePresetId
    }),
    migrate: e => {
      if (e?.presets) return {
        presets: e.presets,
        activePresetId: e.activePresetId ?? e.presets[0]?.id ?? null
      };
      if (e?.preset) {
        let t = "preset_default";
        return {
          presets: [{
            id: t,
            name: "Mặc định",
            preset: e.preset
          }],
          activePresetId: t
        }
      }
      return {
        presets: [],
        activePresetId: null
      }
    }
  }));
  e.s(["useExportDesignPresetStore", 0, U], 71708);
  var q = e.i(44318);

  function B() {
    return U.getState().getPresetExportLayers()
  }

  function z() {
    let e = U.getState(),
      t = e.presets.find(t => t.id === e.activePresetId)?.preset;
    t && q.useSubtitleStore.getState().setGlobalStyleForNewVideos(t.subtitleStyle)
  }
  e.s(["applyPresetSubtitleStyleForNewVideo", 0, z, "getPresetExportLayersForNewVideo", 0, B], 98948);
  var J = e.i(81341);
  let K = new Map;
  async function W({
    filePath: e,
    queueVideoIds: t,
    get: i,
    set: n
  }) {
    let a = i(),
      r = await V(a.videos, e, {
        dashboardDraftVideoIds: a.dashboardDraftVideoIds,
        queueVideoIds: t
      });
    if (r) {
      let e = r.video;
      return r.changed && await (0, w.persistProjectManifestForVideo)(e, {}, {
        preserveUpdatedAt: !0
      }), n(t => ({
        videos: (0, M.replaceVideoInList)(t.videos, e),
        activeVideoId: e.id
      })), e.id
    }
    if ((0, J.isTauri)()) {
      let t = null;
      try {
        let i = await N(e, B());
        return t = i.id, await (0, w.persistProjectManifestForVideo)(i), z(), n(e => ({
          videos: (0, M.appendVideoToList)(e.videos, i),
          activeVideoId: (0, M.activeVideoIdAfterAppend)(e.activeVideoId, i.id, !0)
        })), i.id
      } catch (e) {
        if (console.error("Failed to import video:", e), t) try {
          await (0, A.deleteProjectWorkspace)(t)
        } catch (e) {
          console.error("Failed to roll back imported project workspace:", e)
        }
        throw e
      }
    }
    let o = (0, T.generateId)();
    z();
    let s = function({
      filePath: e,
      id: t,
      exportLayers: i
    }) {
      return {
        id: t,
        name: e.split(/[\\/]/).pop() || "video.mp4",
        path: e,
        size: 5e7,
        duration: 300,
        width: 1920,
        height: 1080,
        fps: 30,
        codec: "h264",
        status: "idle",
        addedAt: new Date,
        exportLayers: i
      }
    }({
      filePath: e,
      id: o,
      exportLayers: B()
    });
    return n(e => ({
      videos: (0, M.appendVideoToList)(e.videos, s),
      activeVideoId: (0, M.activeVideoIdAfterAppend)(e.activeVideoId, o, !0)
    })), o
  }
  async function Q({
    videoId: e,
    get: t
  }) {
    let i = t().videos.find(t => t.id === e);
    if (!i) throw Error("support_bundle_video_not_found");
    let n = await (0, A.exportProjectSupportBundle)({
      project_id: e,
      last_error_code: "error" === i.status ? "processing_error" : null,
      last_error_message: i.processingError ?? null
    });
    return t().updateVideo(e, {
      supportBundlePath: n.path
    }), await (0, w.persistLatestProjectManifest)(e, t), n
  }
  e.s(["addVideoFromFileJob", 0, function({
    filePath: e,
    queueVideoIds: t = [],
    get: i,
    set: n
  }) {
    return function(e, t) {
      let i = (0, E.normalizeQueuedSourcePath)(e);
      if (!i) return t();
      let n = K.get(i);
      if (n) return n;
      let a = t();
      K.set(i, a);
      let r = () => {
        K.get(i) === a && K.delete(i)
      };
      return a.then(r, r), a
    }(e, () => W({
      filePath: e,
      queueVideoIds: t,
      get: i,
      set: n
    }))
  }], 57686), e.s(["exportSupportBundleJob", 0, Q], 3669);
  var Y = e.i(7787);
  let Z = e => new Promise(t => setTimeout(t, e));
  async function X(e, t, i) {
    let n = Date.now();
    try {
      return await i()
    } finally {
      t[e] = Date.now() - n
    }
  }
  e.s(["formatLocalPreflightTimings", 0, function(e) {
    return Object.entries(e).map(([e, t]) => `${e}_ms=${t}`).join(" ")
  }, "measureLocalPreflight", 0, X, "observeLocalPreflightPromise", 0, function(e) {
    return e.catch(() => void 0), e
  }, "totalLocalPreflightTimingMs", 0, function(e) {
    return Object.values(e).reduce((e, t) => e + t, 0)
  }, "wait", 0, Z], 59253);
  var ee = e.i(21193),
    et = e.i(5792),
    ei = e.i(92719),
    en = e.i(57342),
    ea = e.i(68476),
    er = e.i(21826);

  function eo(e) {
    return {
      index: e.index,
      start_ms: Math.max(0, Math.round(e.startTime)),
      end_ms: Math.max(Math.round(e.startTime) + 1, Math.round(e.endTime)),
      text: e.originalText
    }
  }

  function es(e, t) {
    let i = e.trim().split("");
    return i.length <= t ? i.join("") : `${i.slice(0,t).join("")}...`
  }

  function el(e, t, i) {
    let n = e.split("");
    if (!(n.length < 2))
      for (let e = 0; e < n.length; e += 1) {
        let a = Math.min(e + 4, n.length);
        for (let r = e + 2; r <= a; r += 1) {
          let a = n.slice(e, r).join("");
          if (function(e) {
              let t = e.split("");
              return t.length > 0 && t.every(e => "的一是在不了和有就人都说到要及与第段句旁白正在路上下令请讨论".includes(e))
            }(a)) continue;
          let o = Math.max(0, t - n.length + e),
            s = i.get(a);
          s ? (s.count += 1, s.firstPosition = Math.min(s.firstPosition, o)) : i.set(a, {
            count: 1,
            firstPosition: o,
            chars: r - e
          })
        }
      }
  }
  var ed = e.i(64192),
    eu = e.i(61010),
    ec = e.i(99512),
    ep = e.i(58749);
  async function eg(e) {
    let t = en.useCloudStore.getState();
    if (!t.token) throw Error("Cloud login is required for Fast GPU server translation.");
    try {
      return await e(t.apiUrl, t.token)
    } catch (n) {
      if (!(n instanceof er.CloudApiError) || 401 !== n.status && 403 !== n.status) throw n;
      let t = await en.useCloudStore.getState().refreshAuthToken(),
        i = en.useCloudStore.getState();
      if (!t || !i.token) throw n;
      return e(i.apiUrl, i.token)
    }
  }
  async function eh({
    apiUrl: e,
    token: t,
    request: i
  }) {
    let n = null;
    for (let a = 1; a <= et.FAST_GPU_SERVER_TRANSLATION_RETRIES; a += 1) try {
      return await ea.cloudApi.translateSegments(e, t, i)
    } catch (e) {
      if (n = e, a >= et.FAST_GPU_SERVER_TRANSLATION_RETRIES) break;
      await Z(3e3 * a)
    }
    throw n instanceof Error ? n : Error(String(n))
  }

  function em(e) {
    return e.reduce((e, t) => e + Math.max(1, t.trim().split(/\s+/).filter(Boolean).length), 0)
  }
  async function ef({
    settings: e,
    baseUrl: t,
    request: i
  }) {
    let n = null;
    for (let a = 1; a <= et.FAST_GPU_SERVER_TRANSLATION_RETRIES; a += 1) {
      let r = Date.now();
      try {
        let n = await (0, k.translateText)(i.segments.map(e => e.text), i.source_language || "auto", i.target_language, "openai_compatible", {
            model: i.model,
            baseUrl: t,
            apiKey: e.openai_api_key.trim(),
            contextSegments: i.context_segments,
            globalContext: i.global_context,
            translationStyle: {
              styleId: i.translation_style_id ?? "auto",
              prompt: i.translation_style_prompt ?? null
            },
            userGlossary: i.user_glossary,
            characterContext: i.character_context ?? null,
            segmentIndexes: i.segments.map(e => e.index),
            batchIndex: i.batch_index ?? void 0,
            batchCount: i.batch_count ?? void 0,
            includeCharacterMetadata: !0
          }),
          o = n.translatedTexts;
        if (o.length !== i.segments.length) throw Error("Local GPT translation returned a different segment count.");
        return {
          job_id: i.job_id,
          target_language: i.target_language,
          provider: "openai_compatible_local",
          model: i.model,
          translated_segments: i.segments.map((e, t) => ({
            index: e.index,
            text: o[t] ?? ""
          })),
          character_mentions: n.characterMentions,
          usage: {
            input_tokens: em(i.segments.map(e => e.text)),
            output_tokens: em(o),
            estimated_cost_vnd: 0,
            provider_latency_ms: Date.now() - r,
            retry_count: a - 1,
            translated_segment_count: o.length
          }
        }
      } catch (e) {
        if (n = e, a >= et.FAST_GPU_SERVER_TRANSLATION_RETRIES) break;
        await Z(3e3 * a)
      }
    }
    throw n instanceof Error ? n : Error(String(n))
  }
  async function e_({
    videoId: t,
    video: i,
    sourceLang: n,
    targetLang: r,
    model: o,
    taskId: s,
    updateTask: l
  }) {
    let {
      useSubtitleStore: d
    } = await e.A(5990), u = d.getState(), c = (0, eu.getVideoSubtitles)(u.subtitles, t).filter(e => e.originalText.trim().length > 0).sort((e, t) => e.startTime - t.startTime || e.index - t.index);
    if (0 === c.length) throw Error("No source subtitles available for server translation.");
    let p = ei.useSettingsStore.getState().settings.sonitranslateSettings ?? ei.DEFAULT_SONITRANSLATE_SETTINGS,
      g = (0, et.fastGpuOpenAiBaseUrl)(p),
      h = g.length > 0,
      m = h ? "local GPT endpoint" : "server",
      f = (0, ed.sourceVideoSeconds)(i),
      _ = (0, ep.resolveTranslationStyleSelection)(ei.useSettingsStore.getState().settings.translationStyleSettings),
      v = (0, ec.buildActiveTranslationGlossaryPayload)(ei.useSettingsStore.getState().settings.translationGlossary),
      b = {
        source_language: n || null,
        target_language: r,
        rules: ["Translate the exact dialogue meaning from the source video; do not invent, summarize, or reuse earlier-job translations.", "Keep character names, titles, organizations, and place names consistent within this video.", "The requested segment text is authoritative; use global context only to resolve names, titles, pronouns, and continuity without adding facts.", "Use source_samples only as whole-video context; translate only the requested segments."],
        entity_candidates: function(e) {
          let t = new Map,
            i = 0;
          for (let n of e) {
            let e = "";
            for (let a of n.originalText) ! function(e) {
              let t = e.codePointAt(0) ?? 0;
              return t >= 13312 && t <= 19903 || t >= 19968 && t <= 40959 || t >= 63744 && t <= 64255 || t >= 131072 && t <= 173791 || t >= 173824 && t <= 177983 || t >= 177984 && t <= 178207 || t >= 178208 && t <= 183983
            }(a) ? (el(e, i, t), e = "") : e += a, i += 1;
            el(e, i, t)
          }
          return [...t.entries()].sort(([e, t], [i, n]) => n.count - t.count || n.chars - t.chars || t.firstPosition - n.firstPosition || e.localeCompare(i)).slice(0, 24).map(([e]) => e)
        }(c),
        source_samples: function(e) {
          if (e.length <= 6) return e.map(e => ({
            index: e.index,
            text: es(e.originalText, 120)
          }));
          let t = new Set;
          t.add(0), t.add(1);
          let i = Math.max(0, Math.floor(e.length / 2) - 1);
          return t.add(i), t.add(Math.min(e.length - 1, i + 1)), t.add(Math.max(0, e.length - 2)), t.add(e.length - 1), [...t].sort((e, t) => e - t).slice(0, 6).map(t => e[t]).filter(e => !!e).map(e => ({
            index: e.index,
            text: es(e.originalText, 120)
          }))
        }(c)
      },
      S = await en.useCloudStore.getState().fetchServerConfig(),
      y = S?.signed_config_bundle.payload.engine_policy.translation_character_context_enabled === !0,
      P = (0, J.isTauri)() && y ? await (0, k.buildTranslationCharacterContext)({
        source_language_requested: n,
        source_language_resolved: n,
        target_language: r,
        cues: c.map(eo)
      }) : null;
    l(s, {
      progress: 95,
      status: "processing",
      message: `Creating ${m} translation job for ${c.length} subtitle cues...`
    });
    let T = `local-gpt-${t}`;
    if (!h) {
      let e = await eg((e, t) => ea.cloudApi.createJob(e, t, {
        source: "desktop_fast_gpu",
        job_type: "video_translate",
        video_seconds: f,
        target_language: r,
        tts_provider: "edge",
        premium_voice_seconds: 0
      }));
      T = e.id, en.useCloudStore.setState(t => ({
        jobs: [e, ...t.jobs.filter(t => t.id !== e.id)]
      }))
    }
    let w = new Map,
      x = 0,
      I = 0,
      E = 0,
      A = h ? et.FAST_GPU_LOCAL_TRANSLATION_BATCH_SIZE : et.FAST_GPU_SERVER_TRANSLATION_BATCH_SIZE,
      V = function(e, t) {
        let i = [];
        for (let n = 0; n < e.length; n += t) i.push(e.slice(n, n + t));
        return i
      }(c, A),
      N = h ? Math.min(et.FAST_GPU_LOCAL_TRANSLATION_CONCURRENCY, V.length) : 1;
    await (0, a.appendAppLog)("info", `[pipeline:${t}] Fast GPU ${m} translation job=${T} model=${o} cues=${c.length} batch_size=${A} concurrency=${N} batches=${V.length}`);
    let M = async e => {
      let t, i, a, d, u = V[e] ?? [];
      l(s, {
        progress: Math.min(98, 95 + Math.floor(e / Math.max(1, V.length) * 3)),
        message: `Translating subtitle batch ${e+1}/${V.length} on ${m}...`
      });
      let S = {
        job_id: T,
        source_language: n,
        target_language: r,
        source_video_seconds: f,
        model: o,
        translation_style_id: _.styleId,
        translation_style_prompt: _.prompt ?? void 0,
        user_glossary: v,
        global_context: b,
        character_context: P,
        batch_index: e,
        batch_count: V.length,
        context_segments: (t = e * A, i = Math.min(c.length, t + A), a = Math.max(0, t - 8), d = Math.min(c.length, i + 8), c.slice(a, d).filter((e, n) => {
          let r = a + n;
          return r < t || r >= i
        }).slice(0, 64).map(eo)),
        segments: u.map(eo)
      };
      return {
        batchIndex: e,
        batch: u,
        response: h ? await ef({
          settings: p,
          baseUrl: g,
          request: S
        }) : await eg((e, t) => eh({
          apiUrl: e,
          token: t,
          request: S
        }))
      }
    }, L = ({
      batch: e,
      response: t
    }) => {
      let i = new Map(e.map(e => [e.index, e.originalText]));
      if (t.translated_segments.find(e => (function(e, t, i, n) {
          if ("development_server_proxy" === e) return !0;
          let a = n.trim(),
            r = `[${t}]`;
          if (!a.toLowerCase().startsWith(r.toLowerCase())) return !1;
          let o = a.slice(r.length).trim();
          return 0 === o.length || o === i.trim()
        })(t.provider, r, i.get(e.index) ?? "", e.text))) throw Error(h ? "Local GPT translation returned placeholder output; check the configured GPT endpoint/model before running Fast GPU TTS." : "ChÆ°a táº¡o Ä‘Æ°á»£c báº£n dá»‹ch há»£p lá»‡ cho Fast GPU TTS. HĂ£y kiá»ƒm tra cĂ i Ä‘áº·t dá»‹ch rá»“i cháº¡y láº¡i.");
      for (let e of t.translated_segments) w.set(e.index, e.text);
      x += t.usage.input_tokens, I += t.usage.output_tokens, E += t.usage.estimated_cost_vnd
    };
    if (h) {
      let e = 0,
        t = Array.from({
          length: N
        }, async () => {
          let t = [];
          for (; e < V.length;) {
            let i = e;
            e += 1, t.push(await M(i))
          }
          return t
        });
      for (let e of (await Promise.all(t)).flat().sort((e, t) => e.batchIndex - t.batchIndex)) L(e)
    } else
      for (let e = 0; e < V.length; e += 1) L(await M(e));
    let C = c.map(e => {
        let t = w.get(e.index) ?? "";
        if (!t.trim()) throw Error(`Server translation returned no text for subtitle ${e.index}.`);
        return {
          ...e,
          translatedText: t
        }
      }),
      j = d.getState();
    j.setSubtitles((0, eu.mergeVideoSubtitles)(j.subtitles, t, C)), await (0, a.appendAppLog)("info", `[pipeline:${t}] Fast GPU ${m} translation completed job=${T} cues=${C.length} input_tokens=${x} output_tokens=${I} estimated_cost_vnd=${E}`)
  }
  async function ev({
    videoId: t,
    video: i,
    targetLang: n,
    get: r
  }) {
    var o;
    let s, l, d = r().videos.find(e => e.id === t) ?? i,
      u = d.ttsTimelineAudioPath;
    if (!u) throw Error("TTS timeline audio is missing; cannot render dubbed video.");
    let c = await (0, k.getAudioDuration)(u);
    if (!Number.isFinite(c) || c <= 0) throw Error("TTS timeline audio is not readable; cannot render dubbed video.");
    let {
      useSubtitleStore: p
    } = await e.A(5990), g = p.getState(), h = (0, eu.getVideoSubtitles)(g.subtitles, t).filter(e => e.translatedText.trim().length > 0), m = await (0, A.getProjectWorkspaceDir)(t), f = h.length > 0 ? `${m}/subtitles/gpu_fast.srt` : null;
    f && await (0, k.exportSubtitles)(h, "srt", f, null);
    let _ = await (0, A.getDefaultOutputDir)(),
      v = (o = d.name || i.name, l = o.replace(/\.[^./\\]+$/, "").trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 120), `${l||"dubbed_video"}__${n}_dubbed`),
      b = {
        videoCodec: "copy",
        videoQuality: "high",
        resolution: "original",
        audioMode: "tts_only",
        mixRatio: 1,
        audioContentProfile: "documentary",
        subtitleMode: f ? "external" : "none",
        subtitleFormat: "srt",
        burnSubtitles: !1,
        outputFormat: "mp4",
        outputPath: _,
        filename: v,
        exportLayers: []
      };
    r().updateVideoStatus(t, "exporting"), await (0, a.appendAppLog)("info", `[pipeline:${t}] Rendering dubbed video with TTS audio output=${_}/${v}.mp4`);
    try {
      s = await (0, k.exportVideo)(i.path, {
        ...b,
        subtitlePath: f,
        ttsAudioPath: u
      }, {
        operationId: `gpu-fast-export:${t}:copy:${Date.now().toString(36)}`
      })
    } catch (e) {
      await (0, a.appendAppLog)("warn", `[pipeline:${t}] Fast stream-copy render failed, retrying H.264 render: ${e instanceof Error?e.message:String(e)}`), s = await (0, k.exportVideo)(i.path, {
        ...b,
        videoCodec: "h264",
        subtitlePath: f,
        ttsAudioPath: u
      }, {
        operationId: `gpu-fast-export:${t}:render:${Date.now().toString(36)}`
      })
    }
    return await (0, k.verifyExportedMedia)(s.output_path, !0), r().updateVideo(t, {
      draftVideoPath: s.output_path,
      translatedVideoPath: s.output_path,
      subtitlesBurnedIntoVideo: !1,
      finalExportPath: void 0,
      finalExportedAt: void 0,
      finalExportHasSubtitles: void 0,
      finalExportHasWatermark: void 0,
      finalExportHasOverlays: void 0,
      translatedSubtitlePath: f ?? d.translatedSubtitlePath,
      displaySubtitlePath: f ?? d.displaySubtitlePath
    }), r().updateVideoStatus(t, "completed"), await (0, w.persistLatestProjectManifest)(t, r, {
      target_lang: n,
      artifact: "dubbed_video"
    }), await (0, a.appendAppLog)("info", `[pipeline:${t}] Dubbed video rendered output=${s.output_path}`), s.output_path
  }
  let eb = new Set(["completed", "failed", "canceled"]);
  async function eS({
    videoId: e,
    video: t,
    sourceLang: i,
    targetLang: n,
    get: r
  }) {
    let {
      updateVideoStatus: o,
      setVideoProcessingError: s,
      addTask: l,
      updateTask: d
    } = r(), u = null;
    try {
      let {
        gpuWorker: s
      } = ei.useSettingsStore.getState().settings;
      if (!s.baseUrl.trim()) throw Error("gpu_worker_base_url_required");
      await (0, a.appendAppLog)("info", `[pipeline:${e}] Start GPU Fast subtitle source=${i} target=${n}`), o(e, "transcribing"), u = l({
        videoId: e,
        type: "transcription",
        status: "processing",
        progress: 0,
        message: "Starting GPU subtitle job..."
      });
      let c = await (0, A.getDefaultOutputDir)(),
        p = await (0, Y.createGpuSubtitleJob)({
          base_url: s.baseUrl,
          api_key: s.apiKey || void 0,
          input_path: t.path,
          output_dir: c,
          source_language: i,
          target_language: n,
          timeout_seconds: s.timeoutSeconds
        }),
        g = Math.max(1, Math.ceil(s.timeoutSeconds || 1800));
      for (let t = 0; t < g && (o(e, "transcribing"), d(u, {
          progress: Math.max(1, Math.min(99, p.progress)),
          message: (0, et.taskMessageForGpuWorkerStage)(p.stage)
        }), !eb.has(p.status)); t += 1) await Z(1e3), p = await (0, Y.getGpuSubtitleJob)({
        base_url: s.baseUrl,
        api_key: s.apiKey || void 0,
        job_id: p.job_id
      });
      if (!eb.has(p.status)) throw Error("GPU worker timed out before subtitles completed.");
      if ("completed" !== p.status) throw Error(p.error_message || "GPU worker did not complete the subtitle job.");
      let h = await (0, A.getProjectArtifactPath)(e, "subtitles.source"),
        m = await (0, Y.downloadGpuSubtitleResult)({
          base_url: s.baseUrl,
          api_key: s.apiKey || void 0,
          job_id: p.job_id,
          output_path: h
        });
      if (!await (0, ee.syncGpuSubtitleToTimeline)(m, e)) throw Error("GPU worker completed but returned no readable subtitles.");
      r().updateVideo(e, {
        draftVideoPath: void 0,
        translatedVideoPath: void 0,
        translatedSubtitlePath: void 0,
        finalExportPath: void 0,
        finalExportedAt: void 0,
        finalExportHasSubtitles: void 0,
        finalExportHasWatermark: void 0,
        finalExportHasOverlays: void 0,
        sourceSubtitlePath: m,
        displaySubtitlePath: m,
        voiceSubtitlePath: void 0,
        translationDebugPath: void 0,
        performanceTracePath: void 0,
        ttsAudioFiles: [],
        ttsTimelineAudioPath: void 0
      }), await (0, w.persistLatestProjectManifest)(e, r, {
        source_lang: i,
        target_lang: n,
        artifact: "source_subtitle"
      }), d(u, {
        progress: 95,
        status: "processing",
        message: "Đang dịch nội dung..."
      }), await (0, a.appendAppLog)("info", `[pipeline:${e}] GPU Fast subtitle completed source_subtitle=${m}`);
      let f = ei.useSettingsStore.getState().settings.sonitranslateSettings ?? ei.DEFAULT_SONITRANSLATE_SETTINGS,
        _ = (0, et.fastGpuTranslationModel)(f);
      await e_({
        videoId: e,
        video: t,
        sourceLang: i,
        targetLang: n,
        model: _,
        taskId: u,
        updateTask: d
      }), await r().runDubbingPipeline(e, {
        sourceLang: i,
        targetLang: n,
        translationEngine: (0, et.fastGpuTranslationModel)(f),
        ttsEngine: "edge_tts",
        voice: (0, et.fastGpuTtsVoice)(f),
        language: n,
        speed: 1,
        pitch: 1,
        volume: 1
      }), d(u, {
        progress: 98,
        status: "processing",
        message: "Đang hoàn thiện video..."
      }), await ev({
        videoId: e,
        video: t,
        targetLang: n,
        get: r
      }), d(u, {
        progress: 100,
        status: "completed",
        message: "Hoàn tất."
      }), await (0, a.appendAppLog)("info", `[pipeline:${e}] GPU Fast pipeline completed through translation and TTS`)
    } catch (i) {
      console.error("GPU fast pipeline failed:", i);
      let t = (0, et.gpuWorkerUserMessage)(i, "GPU Fast pipeline failed.");
      throw s(e, t), await (0, a.appendAppLog)("error", `[pipeline:${e}] GPU Fast failed: ${i instanceof Error?i.message:String(i)}`), u && d(u, {
        status: "error",
        message: "Video chưa xử lý xong.",
        error: t
      }), Error(t)
    }
  }
  async function ey(e, t) {
    await (0, w.ensureLinkedSourceAvailable)(e, t)
  }
  e.s(["runGpuFastSubtitlePipelineJob", 0, eS], 43769), e.s(["ensureSourceVideoAvailableForProcessing", 0, ey], 27901);
  var eP = e.i(14829);

  function eT(e, t) {
    if ("trial_expired" === e) return "Thời gian dùng thử 3 ngày đã kết thúc. Bạn có thể nạp phút hoặc chọn gói để tiếp tục.";
    if ("free_minutes_insufficient" === e || "trial_bucket_exhausted" === e || "trial_daily_minutes_exhausted" === e || "trial_insufficient_seconds" === e || "trial_minutes_exhausted" === e) return "Phút dùng thử hôm nay không đủ cho video này. Bạn có thể dùng video ngắn hơn, chờ lượt 60 phút tiếp theo trong thời hạn 3 ngày hoặc nạp thêm phút.";
    if ("trial_google_identity_required" === e) return "Dùng thử dành cho tài khoản đăng ký bằng nút Đăng nhập với Google. Hãy đăng nhập đúng tài khoản Google đã đăng ký.";
    if ("trial_identity_already_claimed" === e) return "Tài khoản Google này đã được cấp dùng thử trước đó. Đăng ký lại không bắt đầu thêm một đợt dùng thử.";
    if (e?.startsWith("trial_")) return `Chưa thể cấp quyền d\xf9ng thử cho lần xử l\xfd n\xe0y. H\xe3y thử lại; nếu vẫn lỗi, li\xean hệ hỗ trợ k\xe8m m\xe3 ${e}.`;
    if ("insufficient_video_credits" === e) return "Không đủ ví phút. Hãy cộng thêm phút hoặc dùng gói tháng.";
    if ("insufficient_voice_premium_credits" === e) return "Không đủ ví phút cho giọng đọc API ngoài. Hãy cộng thêm phút hoặc dùng giọng đọc tiêu chuẩn.";
    if ("license_inactive" === e) return "License chưa hoạt động hoặc đã bị khóa. Hãy kiểm tra tài khoản trong Cài đặt.";
    if ("free_weekly_minutes_exhausted" === e) return "Gói miễn phí hôm nay đã hết phút. Hãy đợi reset ngày mai hoặc nâng cấp tài khoản trong Cài đặt.";
    if ("fair_use_payg_required" === e || "payment_required" === e) return "Tài khoản hiện chưa có quyền xử lý local. Hãy kích hoạt gói hoặc cộng thêm ví phút trong Cài đặt.";
    if ("device_limit_reached" === e) return `G\xf3i Unlimited đang d\xf9ng tr\xean thiết bị kh\xe1c hoặc v\xed ph\xfat tr\xean m\xe1y n\xe0y đ\xe3 hết. H\xe3y nạp th\xeam ph\xfat để d\xf9ng ngay tr\xean m\xe1y n\xe0y. Nếu cần chuyển g\xf3i sang m\xe1y n\xe0y, nhắn Telegram: ${eP.TELEGRAM_CONTACT_HREF}.`;
    if ("free_device_required" === e) return "Hãy đăng nhập trong app và kích hoạt thiết bị này trước khi dùng gói miễn phí.";
    if ("free_device_already_claimed" === e) return `Thiết bị n\xe0y đ\xe3 d\xf9ng quota miễn ph\xed cho một t\xe0i khoản kh\xe1c. H\xe3y d\xf9ng t\xe0i khoản đ\xe3 k\xedch hoạt trước đ\xf3. Nếu bạn đổi chủ m\xe1y, nhắn Telegram: ${eP.TELEGRAM_CONTACT_HREF}.`;
    if ("free_user_device_already_claimed" === e) return `T\xe0i khoản n\xe0y đ\xe3 nhận quota miễn ph\xed tr\xean một thiết bị kh\xe1c. H\xe3y d\xf9ng thiết bị đ\xe3 k\xedch hoạt. Nếu bạn đổi m\xe1y, nhắn Telegram: ${eP.TELEGRAM_CONTACT_HREF}.`;
    if ("device_switch_cooldown" === e) return "Bạn vừa đổi thiết bị. Có thể đổi lại sau 7 ngày hoặc liên hệ hỗ trợ nếu cần gấp.";
    if ("device_not_authorized" === e) return "Thiết bị này chưa được kích hoạt cho tài khoản hiện tại. Hãy vào Cài đặt, đăng nhập lại rồi kích hoạt thiết bị.";
    if ("authorization_rate_limited" === e || "abuse_rate_limited" === e) return "Máy chủ đang tạm giới hạn yêu cầu xác thực từ thiết bị này. Hãy đợi vài phút rồi chạy lại.";
    if ("account_not_found" === e) return "Tài khoản chưa được khởi tạo trên dichvideo.com. Hãy đăng xuất, đăng nhập lại trong Cài đặt rồi chạy lại.";
    if ("unauthorized" === e) return "Phiên đăng nhập không còn hợp lệ. Hãy đăng nhập lại trong Cài đặt bằng email và mật khẩu tài khoản.";
    if ("runtime_not_trusted" === e) return "Bộ xử lý local hiện tại chưa nằm trong danh sách runtime được tin cậy. Hãy cập nhật Local Engine.";
    if ("server_config_invalid" === e) return "Kết nối máy chủ chậm. Kiểm tra mạng rồi thử lại.";
    if ("token_expired" === e) return "Phiên xác thực xử lý đã hết hạn. Hãy chạy lại để lấy token mới.";
    if ("auth_token_expired" === e) return "Phiên đăng nhập tài khoản đã hết hạn. dichvideo.com sẽ thử làm mới tự động; nếu vẫn lỗi, hãy đăng nhập lại trong Cài đặt.";
    if ("auth_session_invalid" === e) return "Phiên đăng nhập không còn hợp lệ. Hãy đăng nhập lại trong Cài đặt bằng email và mật khẩu tài khoản.";
    if ("auth_reauthentication_required" === e) return "Không tìm thấy phiên đăng nhập đang hoạt động. Hãy đăng nhập lại trong Cài đặt rồi chạy lại video.";
    if ("desktop_required" === e) return "Xử lý local trả phí chỉ khả dụng trong bản desktop.";
    let i = "Không thể xác thực quyền xử lý local. Hãy kiểm tra tài khoản, thiết bị và kết nối mạng.",
      n = t?.trim();
    return n ? `${i} Chi tiết: ${n}` : e ? `${i} M\xe3 lỗi: ${e}.` : i
  }
  async function ew({
    videoId: e,
    get: t
  }) {
    let i = t().videos.find(t => t.id === e);
    return i ? (0, J.isTauri)() ? (await ey(i, () => t().updateVideo(e, {
      sourceMissing: !0
    })), i) : (en.useCloudStore.setState({
      authorizationStatus: "unavailable",
      authorizationBlockedReason: "desktop_required",
      authorizationError: eT("desktop_required")
    }), null) : null
  }
  e.s(["authorizationRecoveryMessage", 0, eT], 53693), e.s(["getDesktopProcessingVideo", 0, ew], 53901);
  var ex = e.i(48357),
    eI = e.i(18849),
    eE = e.i(4653),
    eA = e.i(15166);
  let ek = "piper_native",
    eV = "native_retry_tts_route_unavailable";

  function eN(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : null
  }

  function eM(e) {
    return "string" == typeof e && e.trim() ? e.trim() : void 0
  }

  function eL() {
    return Object.assign(Error(eV), {
      code: eV,
      customerMessage: "Chưa thể tiếp tục phiên tạo giọng cũ vì cấu hình đã lưu không còn đủ để xác thực. Dữ liệu đã tạo vẫn được giữ nguyên; hãy cập nhật DichVideo rồi thử tiếp tục lại.",
      fallbackAllowed: !1
    })
  }
  async function eC(e) {
    if (!(eM(e.pausedBillingScopeJobId) || "error" === e.status)) return null;
    let t = (0, ex.normalizeDesktopProcessingSession)(e.processingSession);
    if (!t || t.project_id !== e.id || !new Set([e.pausedBillingScopeJobId, e.lastAuthorizedJobId, e.billingScopeJobId, e.exportWatermarkPolicy?.jobId].map(eM).filter(e => !!e)).has(t.job_id)) return null;
    let i = eM(e.nativeTtsProvider),
      n = eM(e.nativeTtsVoice);
    if (!!i != !!n) throw eL();
    if (i && n) {
      if (i === ek && (!(0, eI.isDichVideoVoiceId)(n) || !t.piper_execution_identity)) throw eL();
      return {
        provider: i,
        voice: n,
        recoveredFromArtifact: !1
      }
    }
    let a = t.piper_execution_identity;
    if (!a) return null;
    let r = (0, eE.joinLocalPath)(t.native_output_root_path, "native-vnext", t.job_id, "tts", "native-tts-manifest.json");
    try {
      if (!await (0, J.fileExists)(r)) throw eL();
      let e = function(e, t) {
        let i = eN(e);
        if (!i || i.provider_id !== ek || i.normalizer_id !== eA.DICHVIDEO_VI_NORMALIZER_ID || !(0, eA.samePiperComponentExecutionIdentity)(i.piper_execution_identity, t)) return null;
        let n = eN(i.segments),
          a = n ? Object.values(n) : [];
        if (0 === a.length) return null;
        let r = new Set;
        for (let e of a) {
          let t = eN(e),
            i = eM(t?.voice);
          if (!i || !(0, eI.isDichVideoVoiceId)(i) || (r.add(i), r.size > 1)) return null
        }
        let [o] = r;
        return o ? {
          provider: ek,
          voice: o,
          recoveredFromArtifact: !0
        } : null
      }(JSON.parse(await (0, A.readManagedTextFile)(r)), a);
      if (!e) throw eL();
      return e
    } catch (e) {
      if (e && "object" == typeof e && e.code === eV) throw e;
      throw eL()
    }
  }
  e.s(["resolvePinnedNativeTtsRouteForRetry", 0, eC], 12333);
  var ej = e.i(89271),
    eR = e.i(92997);

  function eD({
    authorization: e,
    vnextPackageSha256: t
  }) {
    return {
      jobId: e.job_id,
      authorizationJti: e.authorization_jti,
      enginePolicyVersion: e.engine_policy_version,
      processingPolicyHash: e.processing_policy_hash,
      runtimeTrustSetId: e.runtime_trust_set_id,
      runtimePackageHash: e.runtime_package_hash,
      vnextPackageSha256: t,
      allowedVideoSeconds: e.allowed_video_seconds,
      serverTranslationRequired: e.server_translation_required,
      characterContextEnabled: !0 === e.translation_character_context_enabled,
      translationRoute: e.translation_route,
      ttsRoute: e.tts_route,
      localTtsFallbackAllowed: e.local_tts_fallback_allowed,
      watermarkRequired: e.watermark_required,
      watermarkText: e.watermark_text,
      planCode: e.plan_code
    }
  }

  function eF(e, t) {
    return e.installedFamilies.find(e => e.family === t)
  }

  function eH(e) {
    let t = (0, i.engineVnextErrorCode)(e).toLowerCase();
    return !t.includes("vnext_canceled") && (e && "object" == typeof e && "fallbackAllowed" in e ? !0 === e.fallbackAllowed : e && "object" == typeof e && "fallback_allowed" in e ? !0 === e.fallback_allowed : t.includes("vnext_"))
  }
  e.s(["authorizationLocalEngineSettings", 0, function(e) {
    return e.processing_policy?.local_engine_settings ?? e.local_engine_settings ?? {}
  }, "buildEngineVnextNativeAuthorization", 0, function({
    authorization: e,
    vnextPackageSha256: t,
    apiUrl: i
  }) {
    return {
      jobId: e.job_id,
      retryOfJobId: e.retry_of_job_id ?? null,
      authorizationJti: e.authorization_jti,
      jobToken: e.token,
      enginePolicyVersion: e.engine_policy_version,
      processingPolicyHash: e.processing_policy_hash,
      runtimeTrustSetId: e.runtime_trust_set_id,
      runtimePackageHash: e.runtime_package_hash,
      vnextPackageSha256: t,
      allowedVideoSeconds: e.allowed_video_seconds,
      serverTranslationRequired: e.server_translation_required,
      characterContextEnabled: !0 === e.translation_character_context_enabled,
      translationRoute: e.translation_route,
      ttsRoute: e.tts_route,
      localTtsFallbackAllowed: e.local_tts_fallback_allowed,
      grantedFeatures: e.granted_features,
      localTtsProvider: e.local_tts_provider,
      localTtsVoice: e.local_tts_voice,
      localTtsNormalizer: e.local_tts_normalizer,
      watermarkRequired: e.watermark_required,
      watermarkText: e.watermark_text,
      planCode: e.plan_code,
      lifecycleContractVersion: e.lifecycle_contract_version,
      policySnapshotHash: e.policy_snapshot_hash,
      tokenExpiresAt: e.token_expires_at,
      renewalDeadlineAt: e.renewal_deadline_at,
      leaseGeneration: e.lease_generation,
      renewalUrl: function(e, t) {
        if (e.lifecycle_contract_version !== eR.LOCAL_JOB_LIFECYCLE_CONTRACT) return null;
        let i = t.trim().replace(/\/+$/, "");
        return i ? `${i}/jobs/${encodeURIComponent(e.job_id)}/token/renew` : null
      }(e, i)
    }
  }, "buildEngineVnextServerPolicy", 0, eD, "engineFamilyStatus", 0, eF, "isEngineVnextFallbackAllowed", 0, eH, "requireCustomerNativeVnextFamily", 0, function(e) {
    let t = eF(e, i.ENGINE_VNEXT_FAMILY);
    if (!t?.healthy || !t.path || !t.packageSha256) throw Object.assign(Error("native_vnext_runtime_unavailable"), {
      code: "native_vnext_runtime_unavailable",
      fallbackAllowed: !1
    });
    return {
      ...t,
      healthy: !0,
      path: t.path,
      packageSha256: t.packageSha256
    }
  }], 64059);
  var e$ = e.i(35269),
    eO = e.i(65547);
  async function eG({
    result: e,
    videoId: t,
    replaceVideoSubtitles: i
  }) {
    let n = await (0, A.getProjectArtifactPath)(t, "subtitles.source"),
      a = e.segments.map((e, i) => {
        let n = Math.max(0, Math.round(1e3 * e.start)),
          a = Math.round(1e3 * e.end);
        return {
          id: `${t}-vnext-${i+1}`,
          videoId: t,
          index: i + 1,
          startTime: n,
          endTime: a > n ? a : n + 1e3,
          originalText: e.text,
          translatedText: "",
          speaker: void 0,
          confidence: e.confidence ?? 1,
          style: ej.DEFAULT_SUBTITLE_STYLE
        }
      });
    return await (0, k.exportSubtitles)(a, "srt", n, null), i(t, a), n
  }
  async function eU({
    videoId: e,
    authorization: t,
    preparedMedia: n,
    preparedVnextStt: r,
    taskId: o,
    updateTask: s,
    replaceVideoSubtitles: l,
    get: d
  }) {
    let u = P(d().enginePreference ?? v),
      c = y();
    if (!r) return null;
    let p = r.routeDecision,
      g = p.route,
      h = p.language,
      m = r.vnextPackageSha256;
    try {
      d().setEnginePreference({
        lastRoute: p.route
      }), o && s(o, {
        progress: 16,
        message: (0, e$.taskMessageForLocalEngineStage)("transcribe")
      });
      let i = await (0, A.getProjectArtifactPath)(e, "media.extractedAudio");
      await (0, k.extractAudio)(n.sourcePinPath, i), (0, eO.throwIfPipelineCanceled)(e);
      let u = await (0, A.getProjectArtifactPath)(e, "temp.root"),
        c = await (0, Y.transcribeWithEngineVnext)({
          runId: e,
          audioPath: i,
          engineDir: r.engineDir,
          outputDir: `${u}/engine-vnext`,
          route: r.sttRoute ?? p.route,
          language: p.language,
          provider: "cpu",
          numThreads: 4,
          serverPolicy: eD({
            authorization: t,
            vnextPackageSha256: r.vnextPackageSha256
          })
        });
      if (0 === c.segments.length) throw Error("vnext_empty_transcript");
      let g = await eG({
        result: c,
        videoId: e,
        replaceVideoSubtitles: l
      });
      return d().updateVideo(e, {
        sourceSubtitlePath: g,
        displaySubtitlePath: g,
        translatedSubtitlePath: void 0,
        voiceSubtitlePath: void 0
      }), await (0, a.appendAppLog)("info", `[pipeline:${e}] Engine vNext STT completed route=${c.route} provider=cpu fallback=${c.fallbackUsed} cues=${c.segments.length} source_subtitle=${g}`), {
        sourceSubtitlePath: g,
        route: c.route,
        language: c.language || p.language,
        rawOutputPath: c.rawOutputPath,
        normalizedOutputPath: c.normalizedOutputPath,
        fallbackUsed: c.fallbackUsed,
        packageSha256: r.vnextPackageSha256,
        engineVersion: c.engineVersion,
        fallbackReason: c.fallbackUsed ? "engine_provider_retry" : null,
        sttMs: c.timingsMs.stt ?? null
      }
    } catch (n) {
      let t = (0, i.engineVnextErrorCode)(n);
      if (t.includes("vnext_canceled") || (0, eO.isPipelineCancellation)(n, e)) throw (0, eO.pipelineCanceledError)((0, eO.pipelineCancellationMessage)(e));
      if (!c && u.allowFallback && eH(n)) return await (0, a.appendAppLog)("warn", `[pipeline:${e}] Engine vNext STT failed; falling back to legacy. reason=${n instanceof Error?n.message:String(n)}`), {
        sourceSubtitlePath: null,
        route: g,
        language: h,
        rawOutputPath: null,
        normalizedOutputPath: null,
        fallbackUsed: !0,
        packageSha256: m,
        engineVersion: null,
        fallbackReason: t || "vnext_stt_failed",
        sttMs: null
      };
      throw n
    }
  }
  e.s(["ENGINE_VNEXT_PROVIDER", 0, "cpu", "maybeRunEngineVnextStt", 0, eU], 31367);
  let eq = "native-media-progress-v2",
    eB = new Set(["processing", "export"]),
    ez = new Set(["provisional", "sealed"]),
    eJ = new Set(["none", "units", "output_frames", "output_time_us", "bytes", "cues", "batches", "artifacts"]),
    eK = new Set(["stage_started", "work_advanced", "heartbeat", "reuse", "resume_replay", "verified_terminal"]),
    eW = /^[a-z][a-z0-9_]{0,63}$/;

  function eQ(e, t, i = Number.MAX_SAFE_INTEGER) {
    return Number.isSafeInteger(e) && e >= t && e <= i
  }

  function eY(e) {
    let t = !e || "object" != typeof e || Array.isArray(e) ? null : e;
    if (!t || t.schemaVersion !== eq || "string" != typeof t.operationId || 0 === t.operationId.trim().length || t.operationId.length > 256 || !eB.has(t.operationKind) || !eQ(t.generation, 1) || !eQ(t.sequence, 1) || "string" != typeof t.phase || !eW.test(t.phase) || !eQ(t.overallBasisPoints, 0, 1e4) || !eQ(t.durableBasisPoints, 0, 1e4) || !eQ(t.stageBasisPoints, 0, 1e4) || !eQ(t.completedUnits, 0) || !(null === t.totalUnits || eQ(t.totalUnits, 1)) || !ez.has(t.totalState) || !eJ.has(t.workKind) || "string" != typeof t.messageKey || !eW.test(t.messageKey) || !eK.has(t.reason) || "boolean" != typeof t.terminal || t.durableBasisPoints > t.overallBasisPoints || null !== t.totalUnits && t.completedUnits > t.totalUnits) return null;
    let i = t.terminal && "verified_terminal" === t.reason && 1e4 === t.overallBasisPoints && 1e4 === t.durableBasisPoints && 1e4 === t.stageBasisPoints;
    return (t.terminal ? i : 1e4 !== t.overallBasisPoints) ? {
      schemaVersion: eq,
      operationId: t.operationId,
      operationKind: t.operationKind,
      generation: t.generation,
      sequence: t.sequence,
      phase: t.phase,
      overallBasisPoints: t.overallBasisPoints,
      durableBasisPoints: t.durableBasisPoints,
      stageBasisPoints: t.stageBasisPoints,
      completedUnits: t.completedUnits,
      totalUnits: t.totalUnits,
      totalState: t.totalState,
      workKind: t.workKind,
      messageKey: t.messageKey,
      reason: t.reason,
      terminal: t.terminal
    } : null
  }

  function eZ(e, t) {
    let i = eY(t);
    return i ? e && (e.terminal || i.operationId !== e.operationId || i.generation < e.generation || i.generation === e.generation && i.sequence <= e.sequence || i.overallBasisPoints < e.overallBasisPoints || i.durableBasisPoints < e.durableBasisPoints || i.generation === e.generation && i.phase === e.phase && i.stageBasisPoints < e.stageBasisPoints) ? e : i : e
  }

  function eX(e) {
    return e.terminal ? 100 : Math.min(99, Math.round(e.overallBasisPoints / 100))
  }

  function e0(e) {
    let t = Number.isFinite(e) ? Math.max(0, Math.min(1e4, Math.trunc(e))) : 0;
    return 1e4 === t ? "100%" : `${(t/100).toFixed(1)}%`
  }
  e.s(["compatibilityPercentForMediaProgress", 0, eX, "formatBasisPoints", 0, e0, "parseNativeMediaProgressV2", 0, eY, "reduceMediaProgress", 0, eZ], 16331);
  let e1 = {
    process_prepare: "Đang chuẩn bị video",
    process_subtitles: "Đang tạo phụ đề",
    process_translate: "Đang dịch nội dung",
    process_voice: "Đang tạo giọng đọc",
    process_timing: "Đang điều chỉnh nhịp video và âm thanh",
    preview_ready: "Đang chuẩn bị bản xem trước",
    reconciling: "Đang hoàn tất dữ liệu chỉnh sửa",
    process_preview: "Đang chuẩn bị bản xem trước",
    process_verify: "Đang kiểm tra kết quả",
    export_prepare: "Đang chuẩn bị bản xuất",
    export_visuals: "Đang chuẩn bị phụ đề và bố cục",
    export_video: "Đang tạo video hoàn chỉnh",
    export_audio: "Đang hoàn thiện âm thanh",
    export_verify: "Đang kiểm tra video hoàn chỉnh",
    export_render_complete: "Video đã tạo xong, đang lưu vào thư mục bạn chọn",
    export_delivery_copy: "Đang lưu video vào nơi bạn đã chọn",
    export_delivery_durability: "Đang đảm bảo file đã được lưu an toàn",
    export_delivery_verify: "Đang kiểm tra file đã lưu"
  };

  function e6(e) {
    if ("resume_continue" === e.messageKey) {
      let t = e.stageBasisPoints % 100 == 0 ? `${e.stageBasisPoints/100}%` : e0(e.stageBasisPoints);
      return `Đang tiếp tục phần chưa ho\xe0n tất \xb7 ${t}`
    }
    return e1[e.messageKey] ?? "Đang xử lý video"
  }

  function e2() {
    return {
      progress: 6,
      message: (0, e$.taskMessageForLocalEngineStage)("prepare")
    }
  }

  function e3(e) {
    let t = eY(e);
    return t ? {
      progress: eX(t),
      progressBasisPoints: t.overallBasisPoints,
      progressStageBasisPoints: t.stageBasisPoints,
      progressMessageKey: t.messageKey,
      progressOperationId: t.operationId,
      progressGeneration: t.generation,
      progressSequence: t.sequence,
      message: e6(t)
    } : "percent" in e && "stage" in e && Number.isFinite(e.percent) && "string" == typeof e.stage ? {
      progress: Math.max(1, Math.min(99, e.percent)),
      message: (0, e$.taskMessageForLocalEngineStage)(e.stage)
    } : {}
  }
  e.s(["mediaProgressMessage", 0, e6], 43960), e.s(["createNativeVnextProgressAuthority", 0, function() {
    let e = null;
    return {
      acceptMedia: t => {
        let i = eZ(e, t);
        return null === i || i === e ? {} : (e = i, e3(i))
      },
      acceptLegacy: t => null !== e ? {} : e3(t),
      acceptCompatibility: t => null === e ? t : {},
      current: () => e
    }
  }, "nativeVnextPipelineCompletedTaskUpdate", 0, function(e) {
    return {
      progress: 100,
      status: "completed",
      message: e ? "Bản dịch cần kiểm tra. Hãy sửa phụ đề rồi tạo lại giọng đọc." : (0, e$.taskMessageForLocalEngineStage)("completed")
    }
  }, "nativeVnextPipelinePrepareTaskUpdate", 0, e2, "nativeVnextPipelineQueuedTaskUpdate", 0, function() {
    return {
      progress: 6,
      message: "Đang chờ tài nguyên CPU để xử lý video..."
    }
  }, "nativeVnextPipelineStartedTaskUpdate", 0, function() {
    return e2()
  }], 15162);
  var e4 = e.i(64581);
  let e5 = new Map(["preflight", "stt", "translation", "tts", "compose_audio", "retime", "export", "finalize"].map((e, t) => [e, t])),
    e8 = e => ({
      stage: e.stage.trim().slice(0, 64) || "processing",
      progress: Math.max(0, Math.min(99, Math.round(e.progress))),
      message: e.message?.trim().slice(0, 255) || null,
      lease_generation: e.lease_generation
    });

  function e9(e) {
    return e5.get(e ?? "") ?? -1
  }

  function e7(e, t) {
    return null == e ? t : null == t ? e : Math.max(e, t)
  }

  function te(e, t) {
    let i = e9(e.stage);
    return e9(t.stage) < i ? {
      ...e,
      progress: Math.max(e.progress, t.progress),
      lease_generation: e7(e.lease_generation, t.lease_generation)
    } : {
      stage: t.stage,
      progress: Math.max(e.progress, t.progress),
      message: t.message ?? null,
      lease_generation: e7(e.lease_generation, t.lease_generation)
    }
  }
  e.s(["createLocalJobHeartbeat", 0, function(e, t) {
    let i = e8(t),
      n = !1,
      r = !1,
      o = 0,
      s = !1,
      l = async (t = !1) => {
        if (n || r) return;
        let l = Date.now();
        if (!t && l - o < 5e3) return;
        let {
          token: d
        } = en.useCloudStore.getState();
        if (d) {
          r = !0;
          try {
            var u;
            let t = await (0, e4.withFreshAuthToken)(() => en.useCloudStore.getState(), e => en.useCloudStore.setState(e), (t, n) => ea.cloudApi.heartbeatJob(t, n, e, i));
            u = i, i = te(u, e8({
              stage: t.heartbeat_stage ?? u.stage,
              progress: t.progress,
              message: t.heartbeat_message,
              lease_generation: u.lease_generation
            })), o = l
          } catch (t) {
            s || (s = !0, (0, a.appendAppLog)("warn", `[pipeline:${e}] Unable to send local job heartbeat: ${t instanceof Error?t.message:String(t)}`).catch(() => void 0))
          } finally {
            r = !1
          }
        }
      }, d = setInterval(() => {
        l(!0)
      }, 15e3);
    return l(!0), {
      update: e => {
        i = te(i, e8(e)), l(!1)
      },
      stop: () => {
        n = !0, clearInterval(d)
      }
    }
  }], 15023)
}, 3083, e => {
  "use strict";
  var t = e.i(68476),
    i = e.i(92997),
    n = e.i(79705),
    a = e.i(1885);
  e.i(89268);
  var r = e.i(30797),
    o = e.i(11101),
    s = e.i(57342),
    l = e.i(64581);

  function d(e) {
    let t = e.lease_generation;
    if (!Number.isSafeInteger(t) || (t ?? -1) < 0) throw Error("local_job_terminal_lease_generation_missing");
    return t
  }
  async function u({
    authorization: e,
    jobId: t = e.job_id,
    reportedStatus: n,
    metrics: a,
    diagnostic: r = null,
    completedOutputAvailable: s,
    fallbackErrorCode: l = null,
    fallbackErrorMessage: c = null
  }) {
    if (e?.lifecycle_contract_version !== i.LOCAL_JOB_LIFECYCLE_CONTRACT) return !1;
    if (e.job_id !== t) throw Error("local_job_terminal_authorization_mismatch");
    let p = "completed" === n ? "completed" : "needs_review" === n ? s ? "completed" : "failed" : n,
      g = "completed" !== p;
    return await (0, o.enqueueLocalJobTerminalReport)(t, {
      lease_generation: d(e),
      status: p,
      error_code: g ? a?.error_code ?? r?.error_code ?? l : null,
      error_message: g ? a?.error_message ?? r?.error_message ?? c : null,
      metrics: a ? {
        stage_timings: a.stage_timings,
        source_duration_seconds: a.source_duration_seconds,
        output_duration_seconds: a.output_duration_seconds,
        real_time_factor: a.real_time_factor,
        subtitle_cue_count: a.subtitle_cue_count,
        voiceover_cue_count: a.voiceover_cue_count,
        output_audio_stream_count: a.output_audio_stream_count,
        watermark_present: a.watermark_present,
        engine_provider: a.engine_provider,
        runtime_version: a.runtime_version,
        runtime_hash: a.runtime_hash,
        preflight_wall_ms: a.preflight_wall_ms,
        preflight_backend_ms: a.preflight_backend_ms,
        runtime_package_hash: a.runtime_package_hash,
        engine_family: a.engine_family,
        engine_policy_version: a.engine_policy_version,
        translation_route: a.translation_route,
        tts_route: a.tts_route,
        tts_fallback_reason: a.tts_fallback_reason,
        runtime_trust_set_id: a.runtime_trust_set_id,
        translation_input_tokens: a.translation_input_tokens,
        translation_output_tokens: a.translation_output_tokens,
        estimated_provider_cost_vnd: a.estimated_provider_cost_vnd,
        quality_warnings: a.quality_warnings,
        funnel_events: a.funnel_events
      } : void 0,
      diagnostic: r
    }), !0
  }

  function c(e, t) {
    s.useCloudStore.getState().queueOfflineJobUpdate({
      jobId: e,
      kind: "metrics",
      payload: t
    })
  }

  function p(e, t) {
    s.useCloudStore.getState().queueOfflineJobUpdate({
      jobId: e,
      kind: "diagnostics",
      payload: t
    })
  }
  async function g(e) {
    let {
      token: t
    } = s.useCloudStore.getState();
    return t ? (0, l.withFreshAuthToken)(() => s.useCloudStore.getState(), e => s.useCloudStore.setState(e), e) : null
  }
  async function h(e, i, n) {
    if (!s.useCloudStore.getState().token) return p(e, i), !0;
    try {
      return await g((n, a) => t.cloudApi.uploadJobDiagnostic(n, a, e, i)), !0
    } catch (t) {
      return p(e, i), await (0, r.appendAppLog)("warn", `[pipeline:${e}] Unable to upload ${n} diagnostics: ${t instanceof Error?t.message:String(t)}`), !1
    }
  }
  async function m(e, i, n) {
    if (!s.useCloudStore.getState().token) return c(e, i), !0;
    try {
      return await g((n, a) => t.cloudApi.uploadJobMetrics(n, a, e, i)), !0
    } catch (t) {
      return c(e, i), await (0, r.appendAppLog)("warn", n(t)), !1
    }
  }
  async function f(e, t, i) {
    let a = (0, n.buildTerminalLocalJobDiagnostic)(t, e, i);
    return !!a && h(e.job_id, a, "local job")
  }
  async function _(e, t, i) {
    let a = (0, n.buildLocalJobMetrics)(t, e, i);
    if (!a) return !1;
    let r = (0, n.buildTerminalLocalJobDiagnostic)(t, e, i);
    if (await u({
        authorization: e,
        reportedStatus: a.status,
        metrics: a,
        diagnostic: r,
        completedOutputAvailable: !!t.output_video_path
      })) return !0;
    let o = await m(e.job_id, a, e => `[pipeline:${t.job_id}] Unable to upload local job metrics: ${e instanceof Error?e.message:String(e)}`);
    return "failed" === a.status && await f(e, t, i), o
  }
  async function v(e, t, i) {
    let a = (0, n.buildNativeVnextJobDiagnostic)(e, t, i);
    return !!a && h(e.job_id, a, "native vNext")
  }
  async function b(e, t, i, r) {
    if ("completed" === t.status && t.nleDocument) return (0, o.flushTerminalReportOutbox)({
      force: !0
    }).catch(() => void 0), !0;
    if (t.completedSettlement) {
      let i = d(e);
      if (!r || !(0, a.nativeDirectTerminalV2SettlementMatches)(t, r, e.job_id, i)) throw Error("native_direct_terminal_settlement_invalid");
      return (0, o.flushTerminalReportOutbox)({
        force: !0
      }).catch(() => void 0), !0
    }
    let s = (0, n.buildNativeVnextJobMetrics)(e, t, i),
      l = (0, n.buildNativeVnextJobDiagnostic)(e, t, i),
      c = "completed" === t.status || "canceled" === t.status || "needs_review" === t.status ? t.status : "failed";
    if (await u({
        authorization: e,
        reportedStatus: c,
        metrics: s,
        diagnostic: l,
        completedOutputAvailable: !!t.outputVideoPath,
        fallbackErrorCode: t.fallbackReason ?? `native_vnext_status_${t.status}`,
        fallbackErrorMessage: t.fallbackReason
      })) return !0;
    if (!s && !l) return !1;
    let p = !1;
    return s && (p = await m(e.job_id, s, t => `[pipeline:${e.job_id}] Unable to upload native vNext metrics: ${t instanceof Error?t.message:String(t)}`)), l && (p = await v(e, t, i) || p), p
  }
  async function S(e, t, i, a, r, o) {
    let s = (0, n.buildFailedAuthorizedLocalJobMetrics)(i, e, a, r, o),
      l = (0, n.buildFailedAuthorizedLocalJobDiagnostic)(i, e, a, r, o);
    return !!(e && await u({
      authorization: e,
      jobId: t,
      reportedStatus: "failed",
      metrics: s,
      diagnostic: l,
      completedOutputAvailable: !1
    })) || (await m(t, s, e => `[pipeline:${t}] Unable to upload failed local job metrics after ${a instanceof Error?a.message:String(a)}: ${e instanceof Error?e.message:String(e)}`), await y(e, t, i, a, r, o), !0)
  }
  async function y(e, t, i, a, r, o) {
    return h(t, (0, n.buildFailedAuthorizedLocalJobDiagnostic)(i, e, a, r, o), "failed local job")
  }
  async function P(e, t, i, a, r, o, s = {}) {
    let l = {
      ...(0, n.buildCanceledAuthorizedLocalJobMetrics)(i, e, a, o, s.errorCode),
      ...(0, n.securePreflightMetrics)(r)
    };
    return !!(e && await u({
      authorization: e,
      jobId: t,
      reportedStatus: "canceled",
      metrics: l,
      completedOutputAvailable: !1
    })) || (await m(t, l, e => `[pipeline:${t}] Unable to upload canceled local job metrics: ${e instanceof Error?e.message:String(e)}`), !0)
  }
  e.s(["createLocalJobTerminalDeliveryOwner", 0, function() {
    let e = !1;
    return {
      get claimed() {
        return e
      },
      deliverOnce: async t => !e && (e = !0, await t(), !0)
    }
  }, "enqueueV1LocalJobTerminalFromMetrics", 0, u, "uploadCanceledAuthorizedLocalJobMetrics", 0, P, "uploadFailedAuthorizedLocalJobMetrics", 0, S, "uploadNativeVnextJobMetrics", 0, b, "uploadTerminalLocalJobMetrics", 0, _])
}, 69261, 91865, 31881, 3496, 55699, e => {
  "use strict";
  var t = e.i(47167);
  e.i(89268);
  var i = e.i(30797),
    n = e.i(63126),
    a = e.i(7787),
    r = e.i(58450),
    o = e.i(21193),
    s = e.i(43424),
    l = e.i(31367),
    d = e.i(15162),
    u = e.i(1885),
    c = e.i(46917),
    p = e.i(56260),
    g = e.i(99512),
    h = e.i(90976),
    m = e.i(79705),
    f = e.i(15023),
    _ = e.i(68476),
    v = e.i(64581),
    b = e.i(57342),
    S = e.i(17569),
    y = e.i(62281),
    P = e.i(3083);
  let T = "dichvideo-native-resource-policy-active-job";

  function w() {
    try {
      return window.localStorage
    } catch {
      return null
    }
  }

  function x(e, t, i) {
    let n = w();
    if (!n) return;
    let a = {
      jobId: e,
      videoId: t,
      policy: i,
      startedAt: new Date().toISOString()
    };
    n.setItem(T, JSON.stringify(a))
  }

  function I(e) {
    let t = w();
    if (!t) return;
    let i = t.getItem(T);
    if (i) {
      try {
        let t = JSON.parse(i);
        if (t.jobId && t.jobId !== e) return
      } catch {}
      t.removeItem(T)
    }
  }
  e.s(["consumeOrphanedNativeResourcePolicyMarker", 0, function() {
    let e = w();
    return e && e.getItem(T) && e.removeItem(T), null
  }, "markNativeResourcePolicyJobCompleted", 0, I, "markNativeResourcePolicyJobStarted", 0, x], 91865);
  var E = e.i(64192),
    A = e.i(65547),
    k = e.i(92719),
    V = e.i(48357),
    N = e.i(64059),
    M = e.i(675);
  async function L({
    video: e,
    response: t,
    jobId: i,
    operationId: n,
    fallbackOriginalAudioPolicy: a,
    inspect: r,
    nextAuthorityRevision: o,
    setGain: s
  }) {
    let l, d, u, c = (l = e.originalAudioStrategy ?? a.strategy, d = "number" == typeof e.originalAudioVolume && Number.isFinite(e.originalAudioVolume) ? Math.max(0, Math.min(1, e.originalAudioVolume)) : a.volume, {
        strategy: l,
        volume: "mute_original" === l ? 0 : d
      }),
      p = t.projectAudio,
      g = t.readiness;
    if (!p || !g?.readyForEdit) return {
      response: t,
      originalAudioPolicy: c
    };
    let h = Math.round(100 * c.volume);
    if (p.gainPercent === h) return {
      response: t,
      originalAudioPolicy: c
    };
    if (!t.terminalGenerationId || !t.terminalSnapshotHash) throw Object.assign(Error("completed project audio has no terminal identity"), {
      code: "project_audio_terminal_unavailable",
      fallbackAllowed: !1
    });
    let m = await r({
        projectId: e.id,
        jobId: i,
        expectedTimelineGeneration: g.timelineGeneration
      }),
      f = g.timingAuthority ?? t.completedSettlement?.timingAuthority;
    if (m.projectId !== e.id || m.jobId !== i || m.state.audioGenerationId !== p.audioGenerationId || m.audioGenerationId !== p.audioGenerationId || m.timelineGeneration !== g.timelineGeneration || m.playbackGenerationId !== g.timelineGeneration || m.transportProjectionHash !== g.timelineStateHash || m.terminalGenerationId !== t.terminalGenerationId || m.terminalSnapshotHash !== t.terminalSnapshotHash || !f || m.timingAuthority.generationId !== f.generationId || m.timingAuthority.planHash !== f.planHash || m.timingAuthority.timelineStateHash !== f.timelineStateHash) throw Object.assign(Error("completed project audio authority is stale"), {
      code: "project_audio_terminal_authority_mismatch",
      fallbackAllowed: !1
    });
    let _ = await s({
      projectId: e.id,
      jobId: i,
      operationId: n ?? (u = e.id.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 96), `project-audio-finalize-${u}-${Date.now().toString(36)}`),
      expectedAudioGenerationId: p.audioGenerationId,
      expectedTimelineGeneration: g.timelineGeneration,
      expectedTerminalGenerationId: t.terminalGenerationId,
      expectedTerminalSnapshotHash: t.terminalSnapshotHash,
      expectedAuthority: {
        generationId: m.playbackGenerationId,
        graphHash: m.graphHash,
        transportProjectionHash: m.transportProjectionHash,
        audioScheduleHash: m.audioScheduleHash,
        visualSnapshotHash: m.visualSnapshotHash
      },
      customerMutationRevision: o(e.id),
      gainPercent: h
    });
    if (_.projectId !== e.id || _.jobId !== i || _.state.gainPercent !== h || _.audioGenerationId !== _.state.audioGenerationId || _.audioGenerationId === m.audioGenerationId || _.timelineGeneration !== _.playbackGenerationId || _.transportProjectionHash !== m.transportProjectionHash || _.visualSnapshotHash !== m.visualSnapshotHash || _.timingAuthority.generationId !== m.timingAuthority.generationId || _.timingAuthority.planHash !== m.timingAuthority.planHash || _.timingAuthority.timelineStateHash !== m.timingAuthority.timelineStateHash || _.terminalGenerationId === m.terminalGenerationId || _.terminalSnapshotHash === m.terminalSnapshotHash || _.graphHash === m.graphHash || _.audioScheduleHash === m.audioScheduleHash) throw Object.assign(Error("completed project audio mutation is invalid"), {
      code: "project_audio_mutation_response_invalid",
      fallbackAllowed: !1
    });
    return {
      originalAudioPolicy: c,
      terminalAdmission: (0, M.readyTerminalAdmissionFromMutation)(_),
      response: {
        ...t,
        projectAudio: _.state,
        readiness: {
          ...g,
          timelineGeneration: _.playbackGenerationId,
          timelineStateHash: _.transportProjectionHash,
          exportState: _.exportState,
          audioGenerationId: _.state.audioGenerationId,
          timingAuthority: _.timingAuthority
        }
      }
    }
  }
  var C = e.i(53065),
    j = e.i(55313),
    R = e.i(76223);
  async function D(e, t) {
    await (0, S.openCapCutLoginIfNeeded)();
    let i = Date.now() + 6e5;
    for (; Date.now() < i;) {
      (0, A.throwIfPipelineCanceled)(e), t();
      try {
        if ((await (0, y.getViralVoiceCapCutStatus)()).connected) return
      } catch {}
      await new Promise(e => window.setTimeout(e, 1e3))
    }
    throw Object.assign(Error("capcut_reauthentication_timeout"), {
      code: "capcut_reauthentication_timeout",
      fallbackAllowed: !1
    })
  }
  async function F({
    videoId: e,
    video: S,
    sourceLang: y,
    targetLang: T,
    effectiveLocalEngineSettings: w,
    includeTts: M,
    authorization: H,
    nativeAuthorization: $,
    nativeResourcePolicy: O,
    outputDir: G,
    translationApiUrl: U,
    translationModel: q,
    translationStyle: B,
    translationGlossary: z,
    ttsProvider: J = t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_TTS_PROVIDER || "edge_tts",
    ttsVoice: K,
    dubbingTimeline: W,
    dubbingTimelineIntent: Q,
    processingMode: Y,
    processingSession: Z,
    preparedMedia: X,
    taskId: ee,
    updateTask: et,
    get: ei,
    securePreflightEvidence: en,
    terminalDeliveryOwner: ea,
    ttssieureSelection: er,
    subtitleSource: eo
  }) {
    if (!X) return !1;
    let es = void 0 !== er ? er : (() => {
        if (M) return null;
        let e = j.useTtssieureStore.getState().dashboardSelection;
        return e && e.targetLang === (0, R.normalizeTtssieureTargetLang)(T) ? {
          provider: e.provider,
          modelId: e.modelId,
          voiceId: e.voiceId,
          ...e.voiceSettings ? {
            voiceSettings: e.voiceSettings
          } : {}
        } : null
      })(),
      el = M && !eo && !es,
      ed = H,
      eu = $,
      ec = Z,
      {
        routeDecision: ep,
        vnextPackageSha256: eg,
        englishSttAddonPath: eh,
        multilingualSttAddonPath: em
      } = X;
    try {
      let t;
      if ((0, A.throwIfPipelineCanceled)(e), ei().setEnginePreference({
          lastRoute: ep.route
        }), ec && eg !== ed.runtime_package_hash) throw Object.assign(Error("native_resume_runtime_binding_mismatch"), {
        code: "native_resume_runtime_binding_mismatch",
        fallbackAllowed: !1
      });
      let M = (0, p.buildNativeSoniCompatibilitySettings)(w),
        j = (0, p.buildNativeDubbingTimelineSettings)(W ?? k.useSettingsStore.getState().settings.dubbingTimeline, {
          includeTts: el,
          allowHistoricalNumericIntent: "historical_numeric" === Q
        }),
        R = X.progressAuthority ?? (0, d.createNativeVnextProgressAuthority)();
      if (ee) {
        let e = R.acceptCompatibility((0, d.nativeVnextPipelinePrepareTaskUpdate)());
        Object.keys(e).length > 0 && et(ee, e)
      }
      let F = z ?? (0, g.buildActiveTranslationGlossaryPayload)(k.useSettingsStore.getState().settings.translationGlossary);
      (0, A.throwIfPipelineCanceled)(e), ei().updateVideo(e, {
        translationServerUsageStarted: !1
      }), (0, c.rememberActiveNativePipelineJob)(e, ed.job_id), O && x(ed.job_id, e, O);
      let H = (0, f.createLocalJobHeartbeat)(ed.job_id, {
          stage: ec?.current_stage ?? "preparing",
          progress: 6,
          message: "Preparing native vNext pipeline",
          lease_generation: ec?.lease_generation
        }),
        $ = () => (0, s.runExclusiveLocalCpuJob)(() => (0, a.runEngineVnextNativeJob)({
          engineFamily: m.ENGINE_VNEXT_NATIVE_FAMILY,
          projectId: e,
          inputPath: X.sourcePinPath,
          outputDir: G,
          sourceLanguage: ep.language,
          sttRoute: (0, h.nativeVnextJobSttRoute)(ep, eh, em),
          sttProvider: l.ENGINE_VNEXT_PROVIDER,
          targetLanguage: T,
          authorization: eu,
          processingSession: ec,
          processingPolicy: ed.processing_policy,
          translationApiUrl: U,
          translationModel: q,
          translationStyleId: B.styleId,
          translationStylePrompt: B.prompt,
          userGlossary: F,
          includeTts: el,
          ttsProvider: el ? J : null,
          ttsVoice: el ? K : null,
          ttssieureSelection: es,
          subtitleSource: eo ?? null,
          burnSubtitles: !1,
          soniCompatibility: M,
          dubbingTimeline: j,
          subtitleTimingMode: "cue",
          subtitleTimingAddonPath: null,
          englishSttAddonPath: eh,
          multilingualSttAddonPath: em,
          legacyWorkerUrl: null,
          developerBenchmark: !1,
          subtitleOcr: (0, p.buildNativeSubtitleOcrSettings)(S, Y),
          resourcePolicy: O,
          progressSequence: X.progressSequence ?? 0,
          progressOperationId: X.progressOperationId ?? ed.job_id
        }, {
          onProgress: t => {
            if (t.serverTranslationUsageStarted) return void ei().updateVideo(e, {
              translationServerUsageStarted: !0
            });
            if (H.update({
                stage: t.lifecycleStage ?? ec?.current_stage ?? t.stage,
                progress: t.percent,
                message: null,
                lease_generation: ec?.lease_generation
              }), ee) {
              let e = R.acceptLegacy(t);
              Object.keys(e).length > 0 && et(ee, e)
            }
          },
          onMediaProgress: e => {
            let t = R.acceptMedia(e),
              i = R.current();
            i && 0 !== Object.keys(t).length && (H.update({
              stage: ec?.current_stage ?? i.phase,
              progress: i.terminal ? 100 : Math.min(99, Math.round(i.overallBasisPoints / 100)),
              message: null,
              lease_generation: ec?.lease_generation
            }), ee && et(ee, t))
          }
        }), {
          onQueued: () => {
            if (H.update({
                stage: ec?.current_stage ?? "queued",
                progress: 6,
                message: "Waiting for local CPU slot",
                lease_generation: ec?.lease_generation
              }), ee) {
              let e = R.acceptCompatibility((0, d.nativeVnextPipelineQueuedTaskUpdate)());
              Object.keys(e).length > 0 && et(ee, e)
            }
          },
          onStarted: () => {
            if (H.update({
                stage: ec?.current_stage ?? "preparing",
                progress: 6,
                message: "Native vNext pipeline started",
                lease_generation: ec?.lease_generation
              }), ee) {
              let e = R.acceptCompatibility((0, d.nativeVnextPipelineStartedTaskUpdate)());
              Object.keys(e).length > 0 && et(ee, e)
            }
          }
        });
      try {
        for (;;) try {
          t = await $();
          break
        } catch (n) {
          if ("wait_for_reauthentication" !== (n && "object" == typeof n && "code" in n && "string" == typeof n.code ? n.code : n instanceof Error ? n.message : String(n))) throw n;
          await D(e, () => {
            H.update({
              stage: ec?.current_stage ?? "tts",
              progress: 6,
              message: "Đang chờ đăng nhập lại CapCut",
              lease_generation: ec?.lease_generation
            })
          });
          let t = await (0, v.withFreshAuthToken)(() => b.useCloudStore.getState(), e => b.useCloudStore.setState(e), (e, t) => _.cloudApi.resumeLocalJob(e, t, ed.job_id, {
            device_id: ed.device_id,
            runtime_package_hash: X.vnextPackageSha256,
            policy_snapshot_hash: ec.policy_snapshot_hash,
            authorized_source_seconds: ec.authorized_source_seconds,
            observed_stage: ec.current_stage,
            local_interruption_count: Object.values(ec.interruption_counts).reduce((e, t) => e + ("number" == typeof t && Number.isFinite(t) ? t : 0), 0),
            reason: "reauthentication"
          }));
          if ("resumed" !== t.outcome || !t.authorization) throw Object.assign(Error(t.error_code || "capcut_reauthentication_resume_failed"), {
            code: t.error_code || "capcut_reauthentication_resume_failed",
            fallbackAllowed: !1
          });
          ed = t.authorization, eu = (0, N.buildEngineVnextNativeAuthorization)({
            authorization: ed,
            vnextPackageSha256: X.vnextPackageSha256,
            apiUrl: b.useCloudStore.getState().apiUrl
          });
          let i = ed.lease_generation ?? ec.lease_generation;
          ec = {
            ...ec,
            lease_generation: i,
            updated_at: new Date().toISOString()
          }, ei().updateVideo(e, {
            processingSession: ec
          }), H.update({
            stage: ec.current_stage,
            progress: 6,
            message: "Đã đăng nhập lại CapCut, tiếp tục từ checkpoint",
            lease_generation: ec.lease_generation
          })
        }
      } finally {
        H.stop(), I(ed.job_id), (0, c.forgetActiveNativePipelineJob)(e, ed.job_id)
      }
      if (!(0, u.reviewableNativeResponse)(t)) {
        let i = t.fallbackReason || `native_vnext_status_${t.status}`,
          n = await ea.deliverOnce(() => (0, P.uploadNativeVnextJobMetrics)(ed, t, en, e));
        throw Object.assign(Error(i), {
          code: i,
          fallbackAllowed: !1,
          cloudDiagnosticsUploaded: n
        })
      }
      if (t.completedSettlement) {
        let i = ed.lease_generation;
        if (!Number.isSafeInteger(i) || i < 0 || !(0, u.nativeDirectTerminalV2SettlementMatches)(t, e, ed.job_id, i)) throw Object.assign(Error("native_direct_terminal_settlement_invalid"), {
          code: "native_direct_terminal_settlement_invalid",
          fallbackAllowed: !1
        })
      }
      let Z = (0, p.originalAudioPolicyFromSoniSettings)(w),
        er = t.nleDocument ? {
          response: t,
          originalAudioPolicy: Z
        } : await L({
          video: ei().videos.find(t => t.id === e) ?? S,
          response: t,
          jobId: ed.job_id,
          fallbackOriginalAudioPolicy: Z,
          inspect: a.inspectEngineVnextProjectAudioTrack,
          nextAuthorityRevision: C.nextProjectAuthorityRevision,
          setGain: a.setEngineVnextProjectAudioGain
        }),
        ef = er.response,
        e_ = (0, u.nativeVnextNeedsReview)(ef);
      return await (0, o.syncSubtitleArtifactsToTimeline)({
        sourceSubtitlePath: ef.sourceSubtitlePath,
        displaySubtitlePath: ef.voiceSubtitlePath ?? ef.subtitlePath ?? ef.displaySubtitlePath,
        renderSubtitlePath: ef.displaySubtitlePath ?? ef.subtitlePath,
        subtitleAlignmentPath: ef.subtitleAlignmentPath,
        videoId: e
      }), ei().updateVideo(e, {
        ...(0, u.nativeVnextCompletedVideoPatch)({
          response: ef,
          exportWatermarkPolicy: (0, E.exportWatermarkPolicyFromAuthorization)(ed),
          ttsProvider: el ? J : null,
          ttsVoice: el ? K : null,
          dubbingTimeline: j,
          originalAudioPolicy: er.originalAudioPolicy
        }),
        ...er.terminalAdmission ? {
          terminalAdmission: er.terminalAdmission,
          activeTerminalGeneration: er.terminalAdmission.generationId
        } : {}
      }), ei().updateVideoStatus(e, "completed"), await (0, r.persistLatestProjectManifest)(e, ei, {
        source_lang: y,
        target_lang: T,
        include_tts: el,
        engine: "native-vnext"
      }), await (0, V.refreshFinalizedDesktopProcessingSession)({
        currentSession: ec,
        readPersistedSession: async () => (await (0, n.readProjectManifest)(e)).manifest.processing_session,
        applySession: t => {
          ei().updateVideo(e, {
            processingSession: t
          })
        }
      }) || await (0, i.appendAppLog)("warn", `[pipeline:${e}] Completed native session could not be refreshed from the project manifest.`).catch(() => void 0), ee && et(ee, (0, d.nativeVnextPipelineCompletedTaskUpdate)(e_)), await (0, i.appendAppLog)(e_ ? "warn" : "info", `[pipeline:${e}] Engine vNext native ${e_?"needs_review":"completed"} output=${t.outputVideoPath??""} package_sha256=${eg??""}`), ea.deliverOnce(() => (0, P.uploadNativeVnextJobMetrics)(ed, t, en, e)).catch(async t => {
        let n = (0, m.engineVnextErrorCode)(t) || "local_job_reporting_failed";
        await (0, i.appendAppLog)("warn", `[pipeline:${e}] Completed project reporting deferred. reason=${n}`).catch(() => void 0)
      }), !0
    } catch (n) {
      if ((0, A.isPipelineCancellation)(n, e)) throw n;
      let t = (0, m.engineVnextErrorCode)(n) || "native_vnext_failed";
      throw await (0, i.appendAppLog)("error", `[pipeline:${e}] Engine vNext native failed without legacy fallback. reason=${t}`), ei().setEnginePreference({
        lastRoute: `${m.ENGINE_VNEXT_NATIVE_FAMILY}:failed:${t}`
      }), n
    }
  }
  e.s(["maybeRunEngineVnextNativePipeline", 0, F], 69261);
  var H = e.i(35269);
  e.s(["localEnginePipelineTaskState", 0, {
    createLocalEnginePipelineTask: function(e) {
      return {
        videoId: e,
        type: "translation",
        status: "processing",
        progress: 0,
        message: (0, H.taskMessageForLocalEngineStage)("prepare")
      }
    },
    localEnginePipelinePrepareTaskUpdate: function(e) {
      return {
        progress: e,
        message: (0, H.taskMessageForLocalEngineStage)("prepare")
      }
    },
    localEnginePipelineAuthorizationTaskUpdate: function() {
      return {
        progress: 12,
        message: "Đang xác thực phiên xử lý..."
      }
    },
    localEnginePipelineWaitingForPreparationTaskUpdate: function() {
      return {
        progress: 5,
        message: "Đang chờ chuẩn bị ứng dụng..."
      }
    },
    localEnginePipelinePreparingApplicationTaskUpdate: function() {
      return {
        progress: 5,
        message: "Đang chuẩn bị ứng dụng..."
      }
    },
    localEnginePipelineUpdatingApplicationTaskUpdate: function() {
      return {
        progress: 5,
        message: "Đang cập nhật ứng dụng..."
      }
    },
    localEnginePipelineStartingSessionTaskUpdate: function() {
      return {
        progress: 5,
        message: "Đang khởi động phiên xử lý..."
      }
    },
    localEnginePipelineCheckingAccountTaskUpdate: function() {
      return {
        progress: 8,
        message: "Đang kiểm tra tài khoản..."
      }
    },
    localEnginePipelinePreparingSessionTaskUpdate: function() {
      return {
        progress: 12,
        message: "Đang chuẩn bị phiên xử lý..."
      }
    },
    localEnginePipelinePreparingConfigTaskUpdate: function() {
      return {
        progress: 14,
        message: "Đang chuẩn bị cấu hình xử lý..."
      }
    },
    localEnginePipelineStartingVideoTaskUpdate: function() {
      return {
        progress: 15,
        message: "Đang bắt đầu xử lý video..."
      }
    },
    localEnginePipelineRestartingSessionTaskUpdate: function() {
      return {
        progress: 15,
        message: "Đang khởi động lại phiên xử lý..."
      }
    },
    localEnginePipelineProgressTaskUpdate: function(e, t) {
      return {
        progress: Math.max(1, t),
        message: (0, H.taskMessageForLocalEngineStage)(e)
      }
    },
    localEnginePipelineCompletedTaskUpdate: function() {
      return {
        progress: 100,
        status: "completed",
        message: "Hoàn thành xử lý video."
      }
    },
    localEnginePipelineFailedTaskUpdate: function(e) {
      return {
        status: "error",
        message: "Không thể hoàn tất xử lý video.",
        error: e
      }
    }
  }], 31881), e.s(["clearGeneratedResultForVideo", 0, function({
    videoId: e,
    replaceVideoSubtitles: t,
    updateVideo: i
  }) {
    t(e, []), i(e, {
      previewVideoPath: void 0,
      previewSourcePath: void 0,
      draftVideoPath: void 0,
      translatedVideoPath: void 0,
      outputDuration: void 0,
      subtitlesBurnedIntoVideo: !1,
      finalExportPath: void 0,
      finalExportedAt: void 0,
      finalExportHasSubtitles: void 0,
      finalExportHasWatermark: void 0,
      finalExportHasOverlays: void 0,
      translatedSubtitlePath: void 0,
      sourceSubtitlePath: void 0,
      alignedSourceSubtitlePath: void 0,
      subtitleAlignmentPath: void 0,
      displaySubtitlePath: void 0,
      voiceSubtitlePath: void 0,
      translationDebugPath: void 0,
      performanceTracePath: void 0,
      ttsAudioFiles: [],
      ttsTimelineAudioPath: void 0,
      ttsManifestPath: void 0,
      editedSubtitleTtsDirty: !1,
      editedSubtitleTtsDirtyCaptionIds: [],
      processingError: void 0,
      processingErrorCode: void 0,
      processingErrorDetail: void 0
    })
  }], 3496), e.s(["localEngineCompletedVideoPatch", 0, function({
    job: e,
    displaySubtitlePath: t,
    alignedSourceSubtitlePath: i,
    ttsManifestPath: n,
    exportWatermarkPolicy: a
  }) {
    var r;
    return {
      draftVideoPath: e.output_video_path ?? void 0,
      translatedVideoPath: e.output_video_path ?? void 0,
      outputDuration: "number" == typeof(r = e.metrics?.output_duration_seconds) && Number.isFinite(r) ? r : void 0,
      subtitlesBurnedIntoVideo: !1,
      finalExportPath: void 0,
      finalExportedAt: void 0,
      finalExportHasSubtitles: void 0,
      finalExportHasWatermark: void 0,
      finalExportHasOverlays: void 0,
      translatedSubtitlePath: e.voice_subtitle_path ?? t ?? void 0,
      sourceSubtitlePath: e.source_subtitle_path ?? void 0,
      alignedSourceSubtitlePath: i ?? void 0,
      displaySubtitlePath: t ?? void 0,
      voiceSubtitlePath: e.voice_subtitle_path ?? void 0,
      translationDebugPath: e.translation_debug_path ?? void 0,
      performanceTracePath: e.performance_trace_path ?? void 0,
      ttsManifestPath: e.tts_manifest_path ?? n,
      ttsAudioFiles: [],
      ttsTimelineAudioPath: void 0,
      exportWatermarkPolicy: a,
      projectAuthorizationReceipt: void 0,
      editedSubtitleTtsDirty: !1,
      editedSubtitleTtsDirtyCaptionIds: []
    }
  }], 55699)
}, 57979, 50986, 34703, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(7787),
    n = e.i(41152),
    a = e.i(53693),
    r = e.i(32217),
    o = e.i(63890);
  let s = new Set(["native_audio_artifact_promotion_locked", "native_windows_sharing_lock_exhausted"]);

  function l(e, t) {
    let i = (0, r.errorTextField)(e, "code") || (0, r.errorTextField)(e, "error_code"),
      l = i.trim().toLowerCase();
    if (s.has(l)) return "Windows đang giữ tệp media vừa tạo. Hãy đóng ứng dụng đang dùng tệp rồi thử tiếp. Nếu lỗi lặp lại, chỉ thêm ngoại lệ bảo vệ thời gian thực cho thư mục xử lý media nhỏ nhất được DichVideo chỉ ra hoặc gỡ bớt trình quét trùng chức năng; không cần tắt hay mở rộng ngoại lệ sang thư mục khác.";
    if ("retry_scope_mismatch" === l) return "Phiên xử lý cũ không khớp với cấu hình đã lưu. Dữ liệu đã tạo vẫn được giữ nguyên; hãy cập nhật DichVideo rồi tiếp tục lại.";
    let d = (0, r.errorTextField)(e, "customerMessage") || (0, r.errorTextField)(e, "customer_message");
    if ("native_retry_tts_route_unavailable" === l) return d || "Chưa thể tiếp tục phiên tạo giọng cũ vì cấu hình đã lưu không còn đủ để xác thực. Dữ liệu đã tạo vẫn được giữ nguyên; hãy cập nhật DichVideo rồi thử tiếp tục lại.";
    let u = (0, r.errorTextField)(e, "developerMessage") || (0, r.errorTextField)(e, "developer_message"),
      c = (0, r.errorTextField)(e, "message") || (0, r.errorTextField)(e, "error") || (0, r.errorTextField)(e, "detail"),
      p = e instanceof Error ? e.message : "string" == typeof e ? e : d || u || c || i || t,
      g = [i, u, d, c, p].filter(Boolean).join(" "),
      h = g.toLowerCase(),
      m = p.replace(/^runtime_incomplete:\s*/i, "").trim(),
      f = p.match(/(?:^|\s\|\s)log=(.+)$/i)?.[1]?.trim();
    if (h.includes("native_tts_piper") || h.includes("local_voice_dichvideo")) return (0, o.piperCustomerMessageForCode)(g);
    if ("disk_full" === l || "export_insufficient_space" === l || "vnext_temp_disk_full" === l || "project_audio_insufficient_disk" === l || l.endsWith("disk_space_insufficient") || h.includes("disk_space_insufficient") || h.includes("insufficient_space") || h.includes("enospc") || h.includes("os error 28") || h.includes("os error 112") || h.includes("no space left") || h.includes("disk full") || h.includes("not enough space")) return "Ổ đĩa đã đầy nên DichVideo không ghi được dữ liệu xử lý. Hãy dọn bớt dung lượng trống rồi thử lại.";
    if (h.includes("native_source_pin_binding_conflict")) return "Dự án cục bộ cần được tạo lại trước khi xử lý tiếp.";
    if (h.includes("native_vnext_runtime_unavailable") || h.includes("native_vnext_runtime_not_trusted")) return n.ENGINE_SETTINGS_REQUIRED_MESSAGE;
    if (h.includes("native_vnext_route_required:unsupported_language_alpha") || h.includes("unsupported_language_alpha") || h.includes("native_stt_language_unsupported")) return "Ngôn ngữ nguồn chưa hỗ trợ. Engine vNext hiện hỗ trợ Tự động, Tiếng Trung, Tiếng Anh, Tiếng Nhật, Tiếng Hàn, Tiếng Quảng Đông, Tiếng Thái, Tiếng Nga và Tiếng Ả Rập. Hãy chọn một ngôn ngữ trong danh sách rồi chạy lại.";
    if (h.includes("native_stt_route_retry_failed") || h.includes("native_stt_text_quality_failed") || h.includes("native_stt_timing_coverage_failed") || h.includes("không nhận diện được lời thoại với các tuyến") || h.includes("khong nhan dien duoc loi thoai voi cac tuyen")) return "Không nhận diện được lời thoại. DichVideo chưa đọc được lời thoại đủ tin cậy. Hãy kiểm tra âm thanh nguồn; nếu đang để Tự động, hãy chọn rõ ngôn ngữ nguồn như Tiếng Trung, Tiếng Anh, Tiếng Nhật hoặc Tiếng Hàn rồi chạy lại.";
    if (h.includes("native_vnext_required")) return "Engine vNext native là đường xử lý mặc định hiện tại và chưa sẵn sàng cho video này. Hãy cập nhật DichVideo Engine rồi chạy lại.";
    if (h.includes("runtime_incomplete")) return `Bộ xử l\xfd local c\xf2n thiếu th\xe0nh phần: ${m||p}`;
    if (h.includes("backend_source_install_failed")) return "Không thể tự chuẩn bị bộ xử lý video. Hãy mở Cài đặt > DichVideo Engine, bấm kiểm tra/cài đặt lại rồi chạy lại.";
    if (h.includes("python_bootstrap_failed")) return `Kh\xf4ng thể tự tạo Python runtime cho bộ xử l\xfd local. Chi tiết: ${p.replace(/^python_bootstrap_failed:\s*/i,"").trim()||p}`;
    if (h.includes("sonitranslate") || h.includes("runtime files are not available")) return "Bộ xử lý local chưa có đủ thành phần để xử lý video trên máy này. Hãy cài đặt hoặc cập nhật lại bộ xử lý local trong Cài đặt.";
    if (h.includes("engine_exited")) return `Bộ xử l\xfd local đ\xe3 dừng trong l\xfac xử l\xfd video. Thường l\xe0 do hết RAM hoặc tiến tr\xecnh xử l\xfd bị tho\xe1t giữa chừng. H\xe3y restart Local Engine rồi chạy lại video với cấu h\xecnh CPU nhẹ.${f?` Nhật k\xfd worker: ${f}`:""}`;
    if (h.includes("engine_not_ready")) return "Hãy khởi động bộ xử lý local trước khi xử lý video.";
    if (h.includes("engine_not_installed")) return n.ENGINE_SETTINGS_REQUIRED_MESSAGE;
    if (h.includes("engine_start_failed")) return "Không thể khởi động bộ xử lý local. Hãy cài đặt hoặc cập nhật lại bộ xử lý local trong Cài đặt.";
    if (h.includes("no valid hugging face token")) return 'Nhận diện nhiều người nói chưa sẵn sàng trên máy này. Chọn "1 người" trong mục Người nói rồi chạy lại để xử lý nhanh, hoặc cấu hình nhận diện nhiều người trước khi bật tách giọng.';
    if (h.includes("forbidden_text_file_path") || h.includes("forbidden path")) return "Không thể đọc phụ đề đã tạo vì đường dẫn nằm ngoài thư mục do dichvideo.com quản lý.";
    if (h.includes("read_text_file_failed") || h.includes("text_file_not_found")) return `Kh\xf4ng thể đọc file phụ đề đ\xe3 tạo. Chi tiết: ${p}`;
    if (h.includes("mkl_malloc") || h.includes("failed to allocate memory") || h.includes("out of memory")) return "Bộ xử lý local bị thiếu RAM. dichvideo.com sẽ tự hạ cấu hình CPU cho lần chạy tiếp theo; hãy restart Local Engine rồi chạy lại video.";
    if (h.includes("edge tts failed for selected voice")) return "Không tạo được giọng đọc đã chọn. Hãy chạy lại video hoặc chọn giọng đọc khác; nếu video dài, xử lý ít video hơn cùng lúc.";
    if (h.includes("translation_provider_not_configured")) return "Server dịch của DichVideo chưa sẵn sàng. Đây là lỗi cấu hình server, không phải lỗi video của bạn; hãy thử lại sau khi DichVideo cập nhật dịch vụ.";
    if (h.includes("translation_job_capacity_exceeded")) return "Dịch video đang bận. Vui lòng thử lại sau vài phút.";
    if (h.includes("native_translation_request_failed") || h.includes("origin_bad_gateway") || h.includes("origin_connection") || h.includes("origin_timeout") || h.includes("http 502") || h.includes("http 503") || h.includes("http 504") || h.includes("status 502") || h.includes("status 503") || h.includes("status 504")) return "Dịch phụ đề đang tạm thời gián đoạn. Hãy thử lại sau vài phút.";
    if (h.includes("browser_signature_banned") || h.includes("error 1010") || h.includes("error 1020") || h.includes("cloudflare_access_denied") || h.includes("cf-turnstile") || h.includes("cf-challenge") || h.includes("challenge-platform") || h.includes("just a moment...")) return "Kết nối tới máy chủ dichvideo.com bị lớp bảo vệ Cloudflare chặn (mã kiểm tra bảo mật/chữ ký kết nối). Hãy thử lại sau vài phút hoặc liên hệ hỗ trợ nếu lỗi tiếp diễn.";
    if (h.includes("cloudflare_error")) return `Cloudflare đang b\xe1o lỗi khi kết nối API dichvideo.com. Chi tiết: ${p||t}`;
    let _ = p.match(/(?:^|\|\s*)customer=([^|]+)/i)?.[1]?.trim(),
      v = d || _ || "";
    if (v && ("viral_tts_session_expired" === l || h.includes("viral_tts_session_expired") || "server_tts_not_authorized" === l || h.includes("server_tts_not_authorized"))) return v;
    if (h.includes("http 403") || h.includes("status 403")) return v || "Yêu cầu bị máy chủ từ chối (403 Forbidden). Hãy kiểm tra tài khoản hoặc đăng nhập lại trong Cài đặt.";
    if (h.includes("bearer token expired") || h.includes("jwt expired") || h.includes("auth_token_expired")) return (0, a.authorizationRecoveryMessage)("auth_token_expired");
    if (h.includes("auth_session_invalid") || h.includes("invalid refresh token") || h.includes("refresh token not found")) return (0, a.authorizationRecoveryMessage)("auth_session_invalid");
    for (let e of ["insufficient_video_credits", "insufficient_voice_premium_credits", "license_inactive", "free_weekly_minutes_exhausted", "trial_minutes_exhausted", "fair_use_payg_required", "payment_required", "device_limit_reached", "free_device_required", "free_device_already_claimed", "free_user_device_already_claimed", "device_switch_cooldown", "device_not_authorized", "authorization_rate_limited", "abuse_rate_limited", "account_not_found", "unauthorized", "runtime_not_trusted", "server_config_invalid", "token_expired", "auth_token_expired", "auth_session_invalid", "desktop_required"])
      if (h.includes(e)) return (0, a.authorizationRecoveryMessage)(e);
    return h.includes("job_failed") && h.includes("http status 401") ? "Phiên xử lý local bị từ chối (401). Hãy đăng nhập lại trong Cài đặt, cập nhật Local Engine rồi chạy lại video." : p || t
  }

  function d(e) {
    let t = e instanceof Error ? e.message : "string" == typeof e ? e : "",
      i = t.toLowerCase(),
      n = t.match(/(?:^|\s\|\s)log=(.+)$/i)?.[1]?.trim();
    return i.includes("engine_exited") || i.includes("engine_not_ready") ? `Bộ xử l\xfd local đ\xe3 dừng giữa chừng trong l\xfac xử l\xfd video n\xean kết quả đang chạy kh\xf4ng thể tiếp tục. H\xe3y restart Local Engine rồi chạy lại; nếu c\xf2n lặp lại, giảm cấu h\xecnh nhận diện, batch size, tắt nhận diện nhiều người n\xf3i hoặc tắt bắt chước giọng.${n?` Nhật k\xfd worker: ${n}`:""}` : l(e, "Bộ xử lý local đã dừng trong lúc xử lý video.")
  }

  function u(e) {
    let t = (e instanceof Error ? e.message : "string" == typeof e ? e : "").toLowerCase();
    return t.includes("engine_not_ready") || t.includes("engine_exited") || t.includes("connection refused") || t.includes("error trying to connect") || t.includes("connection reset") || t.includes("timed out") || t.includes("timeout")
  }
  e.s(["isLocalEngineUnavailableForCreate", 0, u, "localEnginePollingUserMessage", 0, d, "localEngineUserMessage", 0, l, "pipelineErrorLogMessage", 0, function(e) {
    return (0, r.diagnosticTextForPipelineError)(e)
  }], 50986);
  let c = new Set(["completed", "failed", "canceled"]);

  function p(e) {
    return c.has(e)
  }
  async function g(e, n) {
    try {
      return await (0, i.createLocalEngineJob)(e)
    } catch (a) {
      if (!u(a) || (await n?.(), await (0, t.appendAppLog)("warn", `[pipeline] Local Engine was unavailable while creating a job; restarting once before retrying. reason=${a instanceof Error?a.message:String(a)}`), !(await (0, i.startLocalEngine)()).ready)) throw a;
      return await (0, i.createLocalEngineJob)(e)
    }
  }
  e.s(["createLocalEngineJobWithRestart", 0, g, "isTerminalLocalEngineStatus", 0, p], 57979);
  var h = e.i(31881),
    m = e.i(35269),
    f = e.i(59253),
    _ = e.i(21193),
    v = e.i(65547);
  async function b({
    videoId: e,
    taskId: t,
    job: n,
    updateVideoStatus: a,
    updateTask: r,
    onProgress: o
  }) {
    let s = n;
    for (let n = 0; n < 3600 && ((0, v.throwIfPipelineCanceled)(e), a(e, (0, m.videoStatusForLocalEngineStage)(s.stage)), r(t, h.localEnginePipelineTaskState.localEnginePipelineProgressTaskUpdate(s.stage, s.progress)), o?.(s), await (0, _.syncLocalEngineSubtitlesToTimeline)(s, e), !p(s.status)); n += 1) {
      await (0, f.wait)(1e3), (0, v.throwIfPipelineCanceled)(e);
      try {
        s = await (0, i.getLocalEngineJob)(s.job_id)
      } catch (e) {
        throw Error(d(e))
      }
    }
    return s
  }
  e.s(["pollLocalEngineJobToTerminal", 0, b], 34703)
}, 37333, e => {
  "use strict";
  e.s(["runtimeHashIsTrustedByServerConfig", 0, function(e, t) {
    var i;
    let n;
    return i = e.signed_config_bundle.payload, !!(n = t?.trim()) && (i.trusted_runtime_hashes.some(e => e === n) || i.trusted_runtime_packages.some(e => e.sha256 === n))
  }])
}, 15291, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(59253);
  async function n({
    videoId: e,
    localPreflightTimings: a,
    localPreflightWallMs: r,
    force: o
  }) {
    let s = (0, i.totalLocalPreflightTimingMs)(a);
    !o && r < 5e3 && s < 5e3 || await (0, t.appendAppLog)("info", `[benchmark:${e}] Native vNext preflight preflight_wall_ms=${r} step_sum_ms=${s} ${(0,i.formatLocalPreflightTimings)(a)}`)
  }
  async function a({
    videoId: e,
    localPreflightTimings: n,
    localPreflightWallMs: r,
    force: o
  }) {
    let s = (0, i.totalLocalPreflightTimingMs)(n);
    (o || !(s < 5e3)) && await (0, t.appendAppLog)("info", `[benchmark:${e}] Local preflight preflight_wall_ms=${r} step_sum_ms=${s} ${(0,i.formatLocalPreflightTimings)(n)}`)
  }
  async function r({
    videoId: e,
    localPreflightTimings: n
  }) {
    let a = (0, i.formatLocalPreflightTimings)(n);
    if (!a) return;
    let o = (0, i.totalLocalPreflightTimingMs)(n);
    await (0, t.appendAppLog)("warn", `[benchmark:${e}] Native vNext preflight failed preflight_wall_ms=${o} ${a}`)
  }
  e.s(["logLocalPreflightBenchmark", 0, a, "logNativeVnextPreflightBenchmark", 0, n, "logNativeVnextPreflightFailure", 0, r])
}, 86115, e => {
  "use strict";
  var t = e.i(68527),
    i = e.i(98272),
    n = e.i(78238);
  async function a({
    enabled: e = !0,
    provider: r,
    voice: o
  }) {
    let s = (0, i.resolveTtsVoiceRoute)(r, o);
    if (e && s.requiresCapCutSession && s.voice) try {
      await (0, t.checkPremiumVoiceSynthesisReadiness)({
        surface: "pipeline_preflight",
        voice: s.voice
      })
    } catch (i) {
      let e = (0, n.viralVoiceErrorText)(i),
        t = `Kh\xf4ng thể d\xf9ng Giọng cao cấp trước khi xử l\xfd. ${e}`;
      throw Object.assign(Error(t), {
        code: "viral_tts_preflight_failed",
        customerMessage: t,
        fallbackAllowed: !1,
        provider: s.provider,
        voice: s.voice
      })
    }
  }
  e.s(["ensurePremiumVoiceReadyForProcessing", 0, a])
}, 86677, 81099, 65244, e => {
  "use strict";
  e.i(89268);
  var t = e.i(30797),
    i = e.i(63126),
    n = e.i(41824),
    a = e.i(7787),
    r = e.i(59253),
    o = e.i(76553),
    s = e.i(92719);
  let l = {
    selected_runtime_id: null,
    selected_accelerator: "cpu",
    runtime_profile: "cpu_optimized",
    recommended_action: null,
    reason_code: "adaptive_profile_unavailable",
    settings: {
      transcriber_model: "small",
      compute_type: "int8",
      batch_size: 1
    },
    explanations: []
  };
  e.s(["startLocalEnginePreflightPrep", 0, function(e, o) {
    let s = (0, r.observeLocalPreflightPromise)(Promise.all([(0, r.measureLocalPreflight)("device_fingerprint", o, () => (0, n.getDeviceFingerprint)()), (0, r.measureLocalPreflight)("app_version", o, () => (0, t.getAppVersion)())]));
    return {
      identity: s,
      outputDir: (0, r.observeLocalPreflightPromise)((0, r.measureLocalPreflight)("output_dir", o, () => (0, i.getDefaultOutputDir)())),
      adaptiveEngineProfile: (0, r.observeLocalPreflightPromise)((0, r.measureLocalPreflight)("adaptive_engine_profile", o, async () => {
        try {
          return await (0, a.getLocalEnginePerformanceProfile)()
        } catch (i) {
          return await (0, t.appendAppLog)("warn", `[pipeline:${e}] Adaptive engine profile unavailable, using CPU defaults: ${i instanceof Error?i.message:String(i)}`), l
        }
      }))
    }
  }, "startNativeVnextPreflightPrep", 0, function(e, l) {
    let d = (0, r.observeLocalPreflightPromise)(Promise.all([(0, r.measureLocalPreflight)("device_fingerprint", l, () => (0, n.getDeviceFingerprint)()), (0, r.measureLocalPreflight)("app_version", l, () => (0, t.getAppVersion)())])),
      u = (0, r.observeLocalPreflightPromise)((0, r.measureLocalPreflight)("output_dir", l, () => (0, i.getDefaultOutputDir)()));
    return {
      identity: d,
      outputDir: u,
      registry: (0, r.observeLocalPreflightPromise)((0, r.measureLocalPreflight)("engine_registry", l, () => (0, a.getEngineRegistryStatus)())),
      nativeResourcePolicy: (0, r.observeLocalPreflightPromise)((0, r.measureLocalPreflight)("native_resource_policy", l, async () => (0, o.resolveNativeResourcePolicyForJob)(s.useSettingsStore.getState().settings.nativeResourcePolicyPreset)))
    }
  }], 86677);
  var d = e.i(41152),
    u = e.i(45017),
    c = e.i(34618),
    p = e.i(38991);
  async function g(e) {
    return (0, a.installLocalEngine)({
      api_url: e,
      platform: "windows-x64",
      channel: "stable"
    })
  }
  async function h(e) {
    if ("confirmed" !== await u.useEnginePreparationStore.getState().requestEnginePreparation(e)) throw Error("Bạn chưa chuẩn bị bộ xử lý video. Video chưa chạy và bạn chưa bị trừ phút.")
  }
  async function m(e) {
    await c.useEngineVnextInstallStore.getState().loadStatus(e, {
      force: !0
    });
    let t = c.useEngineVnextInstallStore.getState();
    if (!t.ready) throw p.useAppStore.getState().openEngineSettings(), (0, d.createEngineSettingsRequiredError)(t.error ?? "Engine vNext runtime is not installed or not trusted.")
  }
  e.s(["confirmEnginePreparation", 0, h, "ensureNativeVnextRuntimeReadyForProcessing", 0, m, "installTrustedLocalEngine", 0, g], 81099);
  var f = e.i(54747),
    _ = e.i(90976),
    v = e.i(64059);
  let b = "audio.source_separation.spleeter_2stems_fp16";

  function S(e, t) {
    return !!e?.capabilities?.includes(t)
  }
  var y = e.i(79705),
    P = e.i(68834);
  e.i(68476);
  var T = e.i(21826),
    w = e.i(37333);
  let x = null;
  async function I(e, t, i) {
    let n = Date.now();
    try {
      return await i()
    } finally {
      t[e] = Date.now() - n
    }
  }

  function E(e, t, i) {
    return {
      status: e,
      warmed: !1,
      skippedReason: t,
      timings: i
    }
  }
  async function A(e) {
    if (x) return x;
    x = (async () => {
      let t = {};
      try {
        let [i, n] = await Promise.all([I("server_config", t, e.fetchServerConfig), I("local_engine_status", t, () => (0, a.getLocalEngineQuickStatus)())]);
        if (!i) return E(n, "server_config_unavailable", t);
        if (!n.installed) return e.onStatus?.(n), E(n, "engine_not_installed", t);
        if (!n.runtime_hash || !(0, w.runtimeHashIsTrustedByServerConfig)(i, n.runtime_hash)) return e.onStatus?.(n), E(n, "runtime_not_trusted", t);
        if (n.ready) return e.onStatus?.(n), {
          status: n,
          warmed: !0,
          skippedReason: null,
          timings: t
        };
        let r = await I("start_local_engine", t, () => (0, a.startLocalEngine)());
        return e.onStatus?.(r), {
          status: r,
          warmed: r.ready,
          skippedReason: r.ready ? null : "engine_not_ready",
          timings: t
        }
      } catch (i) {
        return e.onError?.(i), {
          status: null,
          warmed: !1,
          skippedReason: "warmup_failed",
          timings: t
        }
      }
    })();
    try {
      let t = await x;
      return e.onTiming?.(t), t
    } finally {
      x = null
    }
  }
  let k = "windows-x64",
    V = "stable",
    N = "gpu-cu12";

  function M(e) {
    return e?.trim().toLowerCase() ?? ""
  }

  function L(e) {
    let t = e?.match(/\d+(?:\.\d+)*/);
    return t ? t[0].split(".").map(e => Number.parseInt(e, 10)) : null
  }

  function C(e, t) {
    let i = L(e),
      n = L(t);
    if (!i || !n) return 0;
    let a = Math.max(i.length, n.length);
    for (let e = 0; e < a; e += 1) {
      let t = i[e] ?? 0,
        a = n[e] ?? 0;
      if (t !== a) return t > a ? 1 : -1
    }
    return 0
  }

  function j(e, t, i) {
    return !e || !t || M(t) === M(i.sha256) || 0 > C(i.version, e) ? null : {
      available: !0,
      installedVersion: e,
      latestVersion: i.version,
      latestHash: i.sha256,
      variant: D(i)
    }
  }
  async function R(e) {
    let t = await Promise.allSettled([(0, a.fetchLocalEngineManifest)(e, k, V, "cpu"), (0, a.fetchLocalEngineManifest)(e, k, V, N)]),
      i = t.flatMap(e => "fulfilled" === e.status ? [e.value] : []);
    if (0 === i.length) {
      let e = t.find(e => "rejected" === e.status);
      throw e?.reason ?? Error("manifest_unavailable")
    }
    return i
  }

  function D(e) {
    return e.variant === N ? N : "cpu"
  }

  function F(e) {
    let t = e?.version?.toLowerCase() ?? "";
    return e?.accelerator === "nvidia-cuda" || e?.runtime_profile === "gpu" || t.includes("gpu") ? N : "cpu"
  }

  function H(e, t) {
    let i = C(e.version, t.version);
    if (0 !== i) return i;
    let n = D(e),
      a = D(t);
    return n === N && a !== N ? 1 : n !== N && a === N ? -1 : 0
  }

  function $(e) {
    return e.reduce((e, t) => {
      let i = D(t),
        n = e[i];
      return (!n || H(t, n) > 0) && (e[i] = t), e
    }, {})
  }
  var O = e.i(81341),
    G = e.i(57342);
  let U = null,
    q = null,
    B = 0,
    z = null,
    J = 0;

  function K() {
    B += 1, q = null
  }
  let W = {
      installed: !1,
      running: !1,
      ready: !1,
      version: null,
      runtime_hash: null,
      accelerator: null,
      runtime_profile: null,
      display_name: "dichvideo.com Local Engine",
      install_dir: null,
      error_code: null,
      error_message: null,
      checks: [{
        id: "manifest",
        label: "Gói cài đặt",
        ok: !1,
        details: "Chưa tìm thấy bộ xử lý local trên máy này."
      }]
    },
    Q = e => e instanceof Error ? e.message : "string" == typeof e ? e : "",
    Y = e => {
      let t = Q(e),
        i = t.toLowerCase(),
        n = t.replace(/^runtime_incomplete:\s*/i, "").replace(/^manifest_unavailable:\s*/i, "").replace(/^download_failed:\s*/i, "").replace(/^replace_existing_runtime_failed:\s*/i, "").replace(/^activate_runtime_failed:\s*/i, "").replace(/^write_runtime_file_failed:\s*/i, "").replace(/^insufficient_disk_space:\s*/i, "").replace(/^backend_root_invalid:\s*/i, "").replace(/^backend_source_install_failed:\s*/i, "").replace(/^python_runtime_invalid:\s*/i, "").replace(/^python_bootstrap_failed:\s*/i, "").replace(/^engine_start_failed:\s*/i, "").replace(/^engine_exited:\s*/i, "").replace(/^job_failed:\s*/i, "").trim() || t.trim(),
        a = t.match(/(?:^|\s\|\s)log=(.+)$/i)?.[1]?.trim();
      return i.includes("python") || i.includes("missing python package") || i.includes("thiếu python package") || i.includes("python_runtime_invalid") || i.includes("python_bootstrap_failed") || i.includes("runtime_incomplete") || i.includes("backend_source_install_failed") || i.includes("backend_root_invalid") || i.includes("requirements") || i.includes("rarfile") || i.includes("torch") || i.includes("cudnn") || i.includes("sonitranslate") ? "Bộ xử lý cần cập nhật. Hãy bấm Cập nhật lại bộ xử lý để app tự sửa gói xử lý trên máy này. Không cần thao tác kỹ thuật thủ công." : i.includes("runtime_incomplete") ? `Bộ xử l\xfd local c\xf2n thiếu th\xe0nh phần: ${n}` : i.includes("backend_root_invalid") ? `Thư mục xử l\xfd kh\xf4ng hợp lệ. H\xe3y chọn thư mục chứa app_rvc.py. Chi tiết: ${n}` : i.includes("backend_source_install_failed") ? `Kh\xf4ng thể tự tải/c\xe0i backend xử l\xfd video. Chi tiết: ${n}` : i.includes("runtime files are not available") ? "Bộ xử lý local chưa có đủ thành phần để chạy trên máy này. Hãy cài đặt hoặc cập nhật lại bộ xử lý local." : i.includes("desktop") || i.includes("browser") ? "Local Engine chỉ dùng được trong bản desktop." : i.includes("manifest_unavailable") || i.includes("fetch") || i.includes("network") ? `Kh\xf4ng lấy được th\xf4ng tin g\xf3i c\xe0i đặt Local Engine. Chi tiết: ${n}` : i.includes("unsupported_platform") ? `M\xe1y n\xe0y chưa được g\xf3i Local Engine hiện tại hỗ trợ. Chi tiết: ${n}` : i.includes("checksum_mismatch") ? "Không thể xác minh gói Local Engine: mã kiểm tra gói tải về không khớp. Hãy cài đặt lại." : i.includes("insufficient_disk_space") ? n : i.includes("extract_failed") ? `Kh\xf4ng thể giải n\xe9n/c\xe0i đặt Local Engine. Chi tiết: ${n}` : i.includes("replace_existing_runtime_failed") || i.includes("activate_runtime_failed") || i.includes("write_runtime_file_failed") ? `Kh\xf4ng thể cập nhật file runtime ở bước c\xe0i đặt. Chi tiết: ${n}` : i.includes("access is denied") || i.includes("permission denied") ? `Kh\xf4ng c\xf3 quyền truy cập file/thư mục runtime ở bước c\xe0i đặt. Chi tiết: ${n}` : i.includes("invalid_runtime_version") ? `Th\xf4ng tin g\xf3i Local Engine kh\xf4ng hợp lệ. Chi tiết: ${n}` : i.includes("engine_not_installed") ? "Cần cài đặt Local Engine trước khi khởi động." : i.includes("engine_health_timeout") ? "Local Engine đã khởi động nhưng chưa sẵn sàng. Hãy dừng rồi thử lại." : i.includes("engine_start_failed") ? `Kh\xf4ng thể khởi động bộ xử l\xfd local. Chi tiết: ${n}` : i.includes("engine_exited") ? `Local Engine đ\xe3 dừng giữa chừng. H\xe3y khởi động lại Local Engine rồi chạy lại.${a?` Nhật k\xfd worker: ${a}`:` Chi tiết: ${n}`}` : i.includes("engine_not_ready") ? "Hãy khởi động Local Engine trước khi chạy kiểm tra xử lý." : i.includes("job_failed") ? `Local Engine chưa ho\xe0n tất được lần kiểm tra xử l\xfd. Chi tiết: ${n}` : t ? `Thao t\xe1c với Local Engine chưa ho\xe0n tất. Chi tiết: ${t}` : "Thao tác với Local Engine chưa hoàn tất, nhưng backend không trả chi tiết lỗi."
    },
    Z = e => (console.error("Local Engine error", e), Y(e)),
    X = (0, P.create)((t, n) => ({
      manifest: null,
      installedRuntimeManifests: {},
      runtimeManifests: {},
      status: null,
      statusCheckedAt: null,
      runtimeUpdate: null,
      runtimeUpdates: {},
      runtimeUpdateCheckedAt: null,
      performanceProfile: null,
      performanceProfileLoading: !1,
      performanceProfileCheckedAt: null,
      installPlan: null,
      installPlanLoading: !1,
      installPlanCheckedAt: null,
      gpuRuntimeUnavailable: !1,
      progress: null,
      lastJob: null,
      loading: !1,
      error: null,
      refreshStatus: async (e = {}) => {
        let i = e.staleMs ?? 0,
          r = n().statusCheckedAt;
        if (!e.force && r && Date.now() - r < i) return;
        let o = !0 === e.silent;
        if (o || t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !!o && n().loading
        });
        try {
          let i = e.quick ? await (0, a.getLocalEngineQuickStatus)() : await (0, a.getLocalEngineStatus)();
          t({
            status: i,
            statusCheckedAt: Date.now(),
            loading: !!o && n().loading,
            error: i.error_message ? Y(i.error_message) : null
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !!o && n().loading
          })
        }
      },
      refreshPerformanceProfile: async (e = {}) => {
        let i = e.staleMs ?? 0,
          r = n().performanceProfileCheckedAt;
        !e.force && r && Date.now() - r < i || (U || (U = (async () => {
          if (t({
              performanceProfileLoading: !0
            }), !(0, O.isTauri)()) return void t({
            performanceProfile: null,
            performanceProfileCheckedAt: Date.now(),
            performanceProfileLoading: !1
          });
          try {
            let e = await (0, a.getLocalEnginePerformanceProfile)();
            t({
              performanceProfile: e,
              performanceProfileCheckedAt: Date.now(),
              performanceProfileLoading: !1,
              gpuRuntimeUnavailable: "nvidia-cuda" !== e.selected_accelerator && n().gpuRuntimeUnavailable
            })
          } catch (e) {
            console.warn("Local Engine performance profile unavailable", e), t({
              performanceProfile: null,
              performanceProfileCheckedAt: Date.now(),
              performanceProfileLoading: !1
            })
          }
        })().finally(() => {
          U = null
        })), await U)
      },
      refreshInstallPlan: async (e = T.DEFAULT_CLOUD_API_URL, i = {}) => {
        let r = i.staleMs ?? 0,
          o = n().installPlanCheckedAt;
        if (!i.force && o && Date.now() - o < r || z && (await z, !i.force)) return;
        let s = ++J;
        t({
          installPlanLoading: !0
        }), z = (async () => {
          try {
            if (!(0, O.isTauri)()) {
              if (s !== J) return;
              t({
                installPlan: null,
                installPlanCheckedAt: Date.now()
              });
              return
            }
            let i = await (0, a.getLocalEngineInstallPlan)(e, k, V);
            if (s !== J) return;
            t({
              installPlan: i,
              installPlanCheckedAt: Date.now()
            })
          } catch (e) {
            if (console.warn("Local Engine install plan unavailable", e), s !== J) return;
            t({
              installPlan: null,
              installPlanCheckedAt: Date.now()
            })
          } finally {
            s === J && t({
              installPlanLoading: !1
            })
          }
        })().finally(() => {
          s === J && (z = null)
        }), await z
      },
      refreshRuntimeUpdate: async (e = T.DEFAULT_CLOUD_API_URL, i = {}) => {
        let r = i.staleMs ?? 0,
          o = n().runtimeUpdateCheckedAt;
        if (!i.force && o && Date.now() - o < r || q && (await q, !i.force)) return;
        let s = ++B;
        q = (async () => {
          if (!(0, O.isTauri)()) {
            if (s !== B) return;
            t({
              runtimeUpdate: null,
              runtimeUpdates: {},
              runtimeUpdateCheckedAt: Date.now()
            });
            return
          }
          try {
            var r, o, l, d;
            let u, c, p, g = n().status;
            (!g || i.force) && (g = await (0, a.getLocalEngineQuickStatus)(), t({
              status: g,
              statusCheckedAt: Date.now()
            }));
            let h = await R(e),
              m = await (0, a.getLocalEngineInstalledManifests)(),
              f = $(m),
              _ = (r = g, c = F(r), h.filter(e => D(e) === c)),
              v = (d = g, !(u = _.reduce((e, t) => e ? H(t, e) > 0 ? t : e : t, null)) || d?.installed && 0 > C(u.version, d.version) ? null : u);
            if (s !== B) return;
            t({
              manifest: v,
              installedRuntimeManifests: $(m),
              runtimeManifests: $(h),
              runtimeUpdate: (o = g, _.reduce((e, t) => {
                let i = o?.installed && o.runtime_hash && M(o.runtime_hash) !== M(t.sha256) && C(t.version, o.version) >= 0 ? j(o?.version, o?.runtime_hash, t) : null;
                if (!i) return e;
                if (!e) return i;
                let n = C(i.latestVersion, e.latestVersion);
                return n > 0 || 0 === n && i.variant === N && e.variant !== N ? i : e
              }, null)),
              runtimeUpdates: (l = g, p = $(h), Object.keys(p).reduce((e, t) => {
                let i, n = p[t],
                  a = (i = f[t]) ? {
                    version: i.version,
                    hash: i.sha256
                  } : l?.installed && F(l) === t ? {
                    version: l.version,
                    hash: l.runtime_hash
                  } : null;
                if (!n || !a) return e;
                let r = j(a.version, a.hash, n);
                return r && (e[t] = r), e
              }, {})),
              runtimeUpdateCheckedAt: Date.now()
            })
          } catch (e) {
            if (console.warn("Local Engine runtime update check unavailable", e), s !== B) return;
            t({
              runtimeUpdate: null,
              runtimeUpdates: {},
              runtimeUpdateCheckedAt: Date.now()
            })
          }
        })().finally(() => {
          s === B && (q = null)
        }), await q
      },
      fetchManifest: async (e = T.DEFAULT_CLOUD_API_URL) => {
        if (t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        try {
          let i = await (0, a.fetchLocalEngineManifest)(e, k, V);
          t({
            manifest: i,
            loading: !1
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !1
          })
        }
      },
      install: async (i = T.DEFAULT_CLOUD_API_URL, r = {}) => {
        if (t({
            loading: !0,
            error: null,
            progress: {
              stage: "preparing",
              bytes_downloaded: 0,
              bytes_total: 0,
              percent: 0,
              message: "Đang chuẩn bị cài đặt bộ xử lý local..."
            }
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          progress: null,
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        let o = null;
        try {
          let s = await e.A(23982);
          o = await s.listen("local-engine-install-progress", e => {
            t({
              progress: e.payload
            })
          });
          let l = await (0, a.installLocalEngine)({
            api_url: i,
            platform: k,
            channel: V,
            variant: r.variant,
            cleanup_cpu_before_gpu: r.cleanupCpuBeforeGpu ?? !1
          });
          K(), t({
            status: l,
            statusCheckedAt: Date.now(),
            runtimeUpdate: null,
            runtimeUpdates: {},
            loading: !1,
            progress: null,
            error: l.error_message ? Y(l.error_message) : null
          });
          try {
            let e = await (0, a.fetchLocalEngineManifest)(i, k, V);
            t({
              manifest: e
            })
          } catch (e) {
            console.warn("Local Engine manifest refresh failed after install", e)
          }
          await n().refreshPerformanceProfile({
            force: !0
          }), await n().refreshInstallPlan(i, {
            force: !0
          }), await n().refreshRuntimeUpdate(i, {
            force: !0
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !1,
            progress: null
          })
        } finally {
          o?.()
        }
      },
      installGpuRuntime: async (i = T.DEFAULT_CLOUD_API_URL) => {
        if (t({
            loading: !0,
            error: null,
            progress: {
              stage: "preparing",
              bytes_downloaded: 0,
              bytes_total: 0,
              percent: 0,
              message: "Đang chuẩn bị cài gói tăng tốc GPU..."
            }
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          progress: null,
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        let r = null;
        try {
          let o = await e.A(23982);
          r = await o.listen("local-engine-install-progress", e => {
            t({
              progress: e.payload
            })
          });
          let s = await (0, a.installLocalEngine)({
            api_url: i,
            platform: k,
            channel: V,
            variant: N,
            cleanup_cpu_before_gpu: !1
          });
          K(), t({
            status: s,
            statusCheckedAt: Date.now(),
            runtimeUpdate: null,
            runtimeUpdates: {},
            loading: !1,
            progress: null,
            gpuRuntimeUnavailable: !1,
            error: s.error_message ? Y(s.error_message) : null
          }), await n().refreshPerformanceProfile({
            force: !0
          }), await n().refreshInstallPlan(i, {
            force: !0
          }), await n().refreshRuntimeUpdate(i, {
            force: !0
          })
        } catch (n) {
          let e, i = ((e = Q(n).toLowerCase()).includes("download_failed") || e.includes("manifest_unavailable")) && e.includes("404") ? {
            unavailable: !0,
            message: "Tăng tốc chưa sẵn sàng trong bản hiện tại. App vẫn xử lý video bình thường."
          } : {
            unavailable: !1,
            message: Y(n)
          };
          t({
            error: i.unavailable ? null : i.message,
            gpuRuntimeUnavailable: i.unavailable,
            loading: !1,
            progress: null
          })
        } finally {
          r?.()
        }
      },
      warmForProcessing: async (e = T.DEFAULT_CLOUD_API_URL) => {
        if (!(0, O.isTauri)()) return;
        let i = await A({
          fetchServerConfig: () => G.useCloudStore.getState().fetchServerConfig(),
          onStatus: e => {
            t({
              status: e,
              statusCheckedAt: Date.now(),
              error: e.error_message ? Y(e.error_message) : null
            })
          },
          onTiming: t => {
            let i = Object.entries(t.timings).map(([e, t]) => `${e}_ms=${t}`).join(" ");
            console.info(`[local-engine-warmup] api_url=${e} warmed=${t.warmed} skipped=${t.skippedReason??""} ${i}`)
          },
          onError: e => {
            console.warn("[local-engine-warmup] failed", e)
          }
        });
        i.status?.ready && n().refreshPerformanceProfile({
          staleMs: 6e4
        })
      },
      start: async () => {
        if (t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        try {
          let e = await (0, a.startLocalEngine)();
          t({
            status: e,
            statusCheckedAt: Date.now(),
            loading: !1,
            error: e.error_message ? Y(e.error_message) : null
          }), await n().refreshPerformanceProfile({
            force: !0
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !1
          })
        }
      },
      stop: async () => {
        if (t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        try {
          let e = await (0, a.stopLocalEngine)();
          t({
            status: e,
            statusCheckedAt: Date.now(),
            loading: !1,
            error: e.error_message ? Y(e.error_message) : null
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !1
          })
        }
      },
      configureBackendRoot: async e => {
        if (t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        try {
          let i = await (0, a.configureLocalEngineBackendRoot)(e);
          t({
            status: i,
            statusCheckedAt: Date.now(),
            loading: !1,
            error: i.error_message ? Y(i.error_message) : null
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !1
          })
        }
      },
      configurePythonPath: async e => {
        if (t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        try {
          let i = await (0, a.configureLocalEnginePythonPath)(e);
          t({
            status: i,
            statusCheckedAt: Date.now(),
            loading: !1,
            error: i.error_message ? Y(i.error_message) : null
          })
        } catch (e) {
          t({
            error: Z(e),
            loading: !1
          })
        }
      },
      createCheckJob: async () => {
        if (t({
            loading: !0,
            error: null
          }), !(0, O.isTauri)()) return void t({
          status: W,
          statusCheckedAt: Date.now(),
          loading: !1,
          error: "Local Engine chỉ dùng được trong bản desktop."
        });
        try {
          let e = await (0, i.getDefaultOutputDir)(),
            r = await (0, a.createLocalEngineJob)({
              input_path: "",
              output_dir: e,
              source_language: "auto",
              target_language: "vi",
              tts_provider: "edge",
              subtitle_mode: "export",
              voice_words: 0
            });
          t({
            lastJob: r,
            loading: !1
          }), await n().refreshStatus()
        } catch (e) {
          t({
            error: Z(e),
            loading: !1
          })
        }
      },
      clearError: () => t({
        error: null
      })
    }));
  async function ee({
    apiUrl: e,
    vnextFamily: t,
    taskId: i,
    updateTask: n
  }) {
    if (S(t, b)) return;
    i && n && n(i, {
      progress: 6,
      message: "Đang cập nhật DichVideo Engine để dùng chế độ giữ nền..."
    });
    let r = X.getState();
    await r.refreshRuntimeUpdate(e, {
      force: !0
    }), await r.install(e);
    let o = await (0, a.getEngineRegistryStatus)();
    if (!S((0, v.engineFamilyStatus)(o, y.ENGINE_VNEXT_FAMILY), b)) throw Object.assign(Error("native_vnext_engine_update_required:source_separation"), {
      code: "native_vnext_engine_update_required:source_separation",
      fallbackAllowed: !1
    })
  }

  function et(e) {
    return Object.assign(Error(e.customerMessage), e, {
      fallbackAllowed: !1
    })
  }
  var ei = e.i(30606);
  async function en(e, t) {
    return {
      englishSttAddonPath: await (0, ei.ensureEnglishSttAddonReadyForProcessing)({
        sourceLanguage: e.language,
        videoId: t.videoId,
        apiUrl: t.apiUrl,
        taskId: t.taskId,
        updateTask: t.updateTask
      }),
      multilingualSttAddonPath: await (0, ei.ensureWhisperMultilingualSttAddonReadyForProcessing)({
        sourceLanguage: e.language,
        videoId: t.videoId,
        apiUrl: t.apiUrl,
        taskId: t.taskId,
        updateTask: t.updateTask
      })
    }
  }
  async function ea(e) {
    let i = (0, v.requireCustomerNativeVnextFamily)(e.initialRegistry),
      n = (0, _.nativeVnextRouteSourceLanguage)(e.sourceLanguage),
      r = "auto" === n ? (0, _.nativeVnextAutoRouteDecision)(!0) : await (0, a.selectEngineVnextSttRoute)({
        sourceLanguage: n,
        transcriptHint: null,
        vnextAvailable: !0,
        sensevoiceAvailable: !0,
        multilingualAvailable: !0
      });
    if (!r.useVnext) throw Object.assign(Error(`native_vnext_route_required:${r.reason}`), {
      code: `native_vnext_route_required:${r.reason}`,
      fallbackAllowed: !1
    });
    let {
      englishSttAddonPath: o,
      multilingualSttAddonPath: s
    } = await en(r, e);
    e.requiresSourceSeparation && (await ee({
      apiUrl: e.apiUrl,
      vnextFamily: i,
      taskId: e.taskId,
      updateTask: e.updateTask
    }), i = (0, v.requireCustomerNativeVnextFamily)(await (0, a.getEngineRegistryStatus)())), s ? await (0, t.appendAppLog)("info", `[pipeline:${e.videoId}] Native vNext using add-on ${f.MULTILINGUAL_STT_ADDON_ID}`) : o && await (0, t.appendAppLog)("info", `[pipeline:${e.videoId}] Native vNext using add-on ${f.ENGLISH_STT_ADDON_ID}`);
    let l = await (0, a.preflightEngineVnextMedia)({
      projectId: e.projectId,
      sourcePath: e.sourcePath,
      outputDir: e.outputDir,
      pipelineKind: "native_vnext",
      engineDir: i.path,
      sttRoute: (0, _.nativeVnextJobSttRoute)(r, o, s),
      englishSttAddonPath: o,
      multilingualSttAddonPath: s,
      retryOfJobId: e.retryOfJobId ?? null,
      allowMissingSourceAudio: e.allowMissingSourceAudio,
      includeTts: e.includeTts,
      dubbingTimeline: e.dubbingTimeline,
      progressOperationId: e.progressOperationId,
      progressGeneration: e.progressGeneration
    }, {
      onMediaProgress: t => {
        if (!e.taskId) return;
        let i = e.progressAuthority.acceptMedia(t);
        Object.keys(i).length > 0 && e.updateTask(e.taskId, i)
      }
    });
    if ("failed" === l.status) throw et(l.failure);
    return {
      routeDecision: r,
      engineDir: i.path,
      vnextPackageSha256: i.packageSha256,
      englishSttAddonPath: o,
      multilingualSttAddonPath: s,
      progressOperationId: e.progressOperationId,
      progressAuthority: e.progressAuthority,
      ...l.preflight,
      progressSequence: l.preflight.progressSequence ?? void 0
    }
  }
  async function er(e) {
    let t;
    if ("local-engine" === e.enginePreference.family || "auto" === e.enginePreference.family && !(0, _.engineVnextPipelineAlphaEnabled)()) return null;
    let i = await (0, a.getEngineRegistryStatus)();
    try {
      t = (0, v.requireCustomerNativeVnextFamily)(i)
    } catch (t) {
      if ((0, _.engineVnextStrictModeEnabled)() || !e.enginePreference.allowFallback) throw t;
      return null
    }
    let n = await (0, a.selectEngineVnextSttRoute)({
      sourceLanguage: (0, _.engineVnextRouteSourceLanguage)(e.sourceLanguage),
      transcriptHint: null,
      vnextAvailable: !0,
      sensevoiceAvailable: !0,
      multilingualAvailable: !0
    });
    if (!n.useVnext) {
      if ((0, _.engineVnextStrictModeEnabled)() || !e.enginePreference.allowFallback) throw Object.assign(Error(`vnext_route_required:${n.reason}`), {
        code: `vnext_route_required:${n.reason}`,
        fallbackAllowed: !1
      });
      return null
    }
    let {
      englishSttAddonPath: r,
      multilingualSttAddonPath: o
    } = await en(n, e);
    return {
      engineDir: t.path,
      sttRoute: (0, _.nativeVnextJobSttRoute)(n, r, o),
      routeDecision: n,
      vnextPackageSha256: t.packageSha256,
      englishSttAddonPath: r,
      multilingualSttAddonPath: o
    }
  }
  async function eo(e) {
    let t = await (0, a.preflightEngineVnextMedia)({
      projectId: e.projectId,
      sourcePath: e.sourcePath,
      outputDir: e.outputDir,
      pipelineKind: "legacy_local",
      engineDir: e.preparedVnextStt?.engineDir ?? null,
      sttRoute: e.preparedVnextStt?.sttRoute ?? null,
      englishSttAddonPath: e.preparedVnextStt?.englishSttAddonPath ?? null,
      multilingualSttAddonPath: e.preparedVnextStt?.multilingualSttAddonPath ?? null,
      retryOfJobId: e.retryOfJobId ?? null,
      allowMissingSourceAudio: !1,
      includeTts: e.includeTts,
      dubbingTimeline: e.dubbingTimeline
    });
    if ("failed" === t.status) throw et(t.failure);
    return t.preflight
  }
  e.s(["preflightLegacyLocalMediaBeforeAuthorization", 0, eo, "prepareNativeVnextMediaBeforeAuthorization", 0, ea, "prepareVnextSttBeforeAuthorization", 0, er], 65244)
}, 65991, 92863, 22692, 15132, 18081, e => {
  "use strict";
  e.s(["useVideoStore", () => tv], 65991);
  var t = e.i(68834),
    i = e.i(79473),
    n = e.i(48868),
    a = e.i(75157);
  e.i(89268);
  var r = e.i(7787),
    o = e.i(30797),
    s = e.i(81341),
    l = e.i(67392),
    d = e.i(88717),
    u = e.i(38825),
    c = e.i(62686),
    p = e.i(43519),
    g = e.i(77800),
    h = e.i(68426),
    m = e.i(80072),
    f = e.i(62138),
    _ = e.i(53690),
    v = e.i(6040),
    b = e.i(90976),
    S = e.i(57686),
    y = e.i(3669),
    P = e.i(43769),
    T = e.i(27901),
    w = e.i(53901),
    x = e.i(98948),
    I = e.i(25648);
  e.i(47167);
  var E = e.i(61917),
    A = e.i(92719),
    k = e.i(63126),
    V = e.i(58450),
    N = e.i(21193),
    M = e.i(12333),
    L = e.i(31367),
    C = e.i(69261),
    j = e.i(76553),
    R = e.i(31881),
    D = e.i(15162),
    F = e.i(3496),
    H = e.i(55699),
    $ = e.i(57979),
    O = e.i(34703),
    G = e.i(53693),
    U = e.i(56260),
    q = e.i(99512),
    B = e.i(58749),
    z = e.i(79705),
    J = e.i(3083),
    K = e.i(15023),
    W = e.i(5792),
    Q = e.i(50986),
    Y = e.i(64059),
    Z = e.i(64192),
    X = e.i(37333),
    ee = e.i(41152),
    et = e.i(34618),
    ei = e.i(65547),
    en = e.i(59253),
    ea = e.i(32217),
    er = e.i(15291),
    eo = e.i(86115),
    es = e.i(88455),
    el = e.i(98272),
    ed = e.i(86677),
    eu = e.i(81099),
    ec = e.i(65207),
    ep = e.i(38991),
    eg = e.i(57342),
    eh = e.i(44318),
    em = e.i(48357),
    ef = e.i(35612),
    e_ = e.i(65244),
    ev = e.i(44077);
  let eb = {
    mode: "source_timeline"
  };

  function eS({
    requested: e,
    includeTts: t,
    durationSeconds: i,
    authenticatedResume: n = !1
  }) {
    return function({
      requested: e,
      includeTts: t,
      eligibility: i,
      authenticatedResume: n
    }) {
      return t && ("fixed_voice_speed" === e.mode || "hybrid_stretch" === e.mode) ? n ? {
        timeline: e,
        eligibility: i,
        capApplied: !1
      } : "allowed" !== i ? {
        timeline: eb,
        eligibility: i,
        capApplied: "too_long" === i
      } : {
        timeline: e,
        eligibility: i,
        capApplied: !1
      } : {
        timeline: eb,
        eligibility: i,
        capApplied: !1
      }
    }({
      requested: e,
      includeTts: t,
      eligibility: "number" != typeof i || !Number.isFinite(i) || i <= 0 ? "unknown" : i > 3600 ? "too_long" : "allowed",
      authenticatedResume: n
    })
  }
  var ey = e.i(18849),
    eP = e.i(15166),
    eT = e.i(63890);
  let ew = {
    phase: "missing",
    ready: !1,
    components: [],
    progress: null,
    errorCode: null
  };

  function ex(e, t) {
    var i, n, a, r;
    if ("status" === t.type) {
      let e = (i = t.status).components.some(e => "corrupt" === e.state) ? "corrupt" : i.components.some(e => !!e.errorCode) ? "error" : i.ready && i.components.length > 0 && i.components.every(e => "ready" === e.state) ? "ready" : "missing";
      return {
        phase: e,
        ready: "ready" === e,
        components: t.status.components.map(e => ({
          ...e
        })),
        progress: null,
        errorCode: (n = t.status, n.components.find(e => e.errorCode)?.errorCode ?? null)
      }
    }
    if ("prepare_started" === t.type) return {
      ...e,
      phase: "downloading",
      ready: !1,
      progress: null,
      errorCode: null
    };
    if ("repair_started" === t.type) return {
      ...e,
      phase: "verifying",
      ready: !1,
      progress: null,
      errorCode: null
    };
    if ("progress" === t.type) {
      let i, n = (a = e.progress, r = t.progress, i = a?.componentId === r.componentId, {
        ...r,
        bytesDownloaded: i ? Math.max(a.bytesDownloaded, r.bytesDownloaded) : r.bytesDownloaded,
        bytesTotal: i ? Math.max(a.bytesTotal, r.bytesTotal) : r.bytesTotal,
        percent: Math.max(a?.percent ?? 0, Math.min(100, Math.max(0, Math.trunc(r.percent))))
      });
      return {
        ...e,
        phase: "verifying" === n.stage ? "verifying" : "downloading",
        ready: !1,
        progress: n,
        errorCode: null
      }
    }
    return "canceled" === t.type ? {
      ...e,
      phase: "canceled",
      ready: !1,
      errorCode: t.errorCode
    } : {
      ...e,
      phase: "error",
      ready: !1,
      errorCode: t.errorCode
    }
  }
  var eI = e.i(26978);
  let eE = (0, t.create)((e, t) => {
    let i = t => (e(e => ex(e, {
        type: "status",
        status: t
      })), t),
      n = t => {
        let i = function(e) {
          if (e && "object" == typeof e) {
            for (let t of [e.code, e.errorCode, e.error_code, e.message])
              if ("string" == typeof t && t.trim()) return t.trim()
          }
          return "string" == typeof e && e.trim() ? e.trim() : "piper_component_operation_failed"
        }(t);
        e(e => ex(e, {
          type: /(?:^|_)cancel(?:ed|led)(?:_|$)/i.test(i) ? "canceled" : "failed",
          errorCode: i
        }))
      };
    return {
      ...ew,
      refresh: async () => {
        try {
          return i(await (0, eI.getPiperNativeComponentStatus)())
        } catch (e) {
          throw n(e), e
        }
      },
      prepare: async t => {
        e(e => ex(e, {
          type: "prepare_started"
        }));
        try {
          let n = await (0, eI.preparePiperNativeComponents)(t, {
            onProgress: t => {
              e(e => ex(e, {
                type: "progress",
                progress: t
              }))
            }
          });
          return i(n)
        } catch (e) {
          throw n(e), e
        }
      },
      retry: async e => t().prepare(e),
      repair: async t => {
        e(e => ex(e, {
          type: "repair_started"
        }));
        try {
          return i(await (0, eI.repairPiperNativeComponent)(t))
        } catch (e) {
          throw n(e), e
        }
      },
      cancel: async t => {
        try {
          await (0, eI.cancelPiperNativePreparation)(t), e(e => ex(e, {
            type: "canceled",
            errorCode: "native_tts_piper_canceled"
          }))
        } catch (e) {
          throw n(e), e
        }
      }
    }
  });
  async function eA({
    apiUrl: e,
    authorization: t,
    vnextPackageSha256: i,
    provider: n,
    voice: a,
    authorizedSourceSeconds: r,
    expectedIdentity: o
  }) {
    let s, l = (0, Y.buildEngineVnextNativeAuthorization)({
      authorization: t,
      vnextPackageSha256: i,
      apiUrl: e
    });
    if (n !== ey.DICHVIDEO_TTS_PROVIDER_ID) return {
      authorization: l,
      piperExecutionIdentity: null
    };
    if (!a || !(0, ey.isDichVideoVoiceId)(a)) throw (0, eT.structuredPiperError)("native_tts_piper_voice_unknown");
    try {
      s = await eE.getState().prepare({
        apiUrl: e,
        authorization: l,
        deviceId: t.device_id,
        voiceId: a,
        authorizedSourceSeconds: r
      })
    } catch (e) {
      throw (0, eT.normalizePiperError)(e, "native_tts_piper_component_prepare_failed")
    }
    let d = (0, eP.normalizePiperComponentExecutionIdentity)(s.executionIdentity);
    if (!s.ready || !d) throw (0, eT.structuredPiperError)("native_tts_piper_component_not_ready");
    if (o && !(0, eP.samePiperComponentExecutionIdentity)(d, o)) throw (0, eT.structuredPiperError)("native_tts_piper_execution_identity_mismatch");
    return {
      authorization: l,
      piperExecutionIdentity: d
    }
  }
  e.s(["preparePiperForAuthorizedJob", 0, eA], 92863);
  let ek = new Set(["request_timeout", "server_unreachable"]);

  function eV(e, t, i, n) {
    let a = i?.trim();
    return Object.assign(Error(t), {
      code: e,
      customerMessage: t,
      fallbackAllowed: !1,
      failureKind: n
    }, a ? {
      developerMessage: a
    } : void 0)
  }

  function eN({
    code: e,
    detail: t,
    ttsProvider: i
  }) {
    let n = e?.trim() || "authorization_failed";
    return ek.has(n) ? eV(n, "Kết nối máy chủ đang chậm hoặc tạm gián đoạn. Hãy kiểm tra mạng rồi thử lại.", t, "network") : "piper_native" === i && (n.startsWith("native_tts_piper_") || n.startsWith("local_voice_dichvideo_")) ? Object.assign((0, eT.piperAuthorizationDenialError)(n, t), {
      failureKind: "voice_authorization"
    }) : eV(n, (0, G.authorizationRecoveryMessage)(n, t), t, "authorization")
  }
  e.s(["localPreflightFailureError", 0, eN], 22692);
  var eM = e.i(46917),
    eL = e.i(70631);
  let eC = /^[a-f0-9]{64}$/;
  async function ej({
    update: e,
    persist: t,
    bind: i
  }) {
    return e(), await t(), i()
  }

  function eR(e, t) {
    if ("vi" === e.trim().toLowerCase()) return;
    let i = /-Male$/i.test((t ?? "").trim());
    return (0, es.edgeTtsVoiceForTargetLanguage)(e, i ? "male" : "female")
  }

  function eD(e, t, i) {
    let n = eR(i, t.tts_voice00);
    return n ? (0, el.resolveTtsVoiceRoute)(el.EDGE_TTS_PROVIDER_ID, n) : (0, el.resolveTtsVoiceRoute)(e ?? "edge_tts", (0, W.fastGpuTtsVoice)(t))
  }
  async function eF(e, t) {
    (0, F.clearGeneratedResultForVideo)({
      videoId: e,
      replaceVideoSubtitles: eh.useSubtitleStore.getState().replaceVideoSubtitles,
      updateVideo: t().updateVideo
    })
  }

  function eH(e) {
    let t = e.policy_snapshot_hash ?? "",
      i = e.renewal_deadline_at ?? "",
      n = e.lease_generation;
    if (e.lifecycle_contract_version !== em.LOCAL_JOB_LIFECYCLE_CONTRACT || !/^[a-f0-9]{64}$/.test(t) || !i || "number" != typeof n || !Number.isSafeInteger(n) || n < 0) throw Error("local_job_resume_contract_required");
    return {
      policySnapshotHash: t,
      renewalDeadlineAt: i,
      leaseGeneration: n
    }
  }
  async function e$({
    sourceLanguage: e,
    targetLanguage: t,
    translationStyle: i,
    glossary: n,
    processingMode: a,
    includeTts: r,
    ttsProvider: o,
    ttsVoice: s,
    piperExecutionIdentity: l,
    effectiveLocalEngineSettings: d,
    dubbingTimeline: u,
    dubbingTimelineIntent: c,
    nativeResourcePolicy: p,
    authorization: g
  }) {
    return (0, ef.canonicalJsonSha256)(await (0, em.buildQueueSnapshotHashInput)({
      sourceLanguage: e,
      targetLanguage: t,
      translationStyle: i,
      glossary: n,
      processingMode: a,
      includeTts: r,
      ttsProvider: o,
      ttsVoice: s,
      piperExecutionIdentity: l,
      dubbingTimeline: u,
      dubbingTimelineIntent: c,
      subtitleMode: {
        burnSubtitles: !1,
        timingMode: "cue"
      },
      resourcePolicy: p,
      effectiveLocalEngineSettings: d,
      runtimePackageHash: g.runtime_package_hash,
      runtimeTrustSetId: g.runtime_trust_set_id,
      enginePolicyVersion: g.engine_policy_version,
      processingPolicyHash: g.processing_policy_hash
    }))
  }

  function eO(e, t) {
    ev.useQueueStore.setState(i => ({
      items: i.items.map(n => n.videoId === e && n.runId === i.activeRunId && ("preflight" === n.status || "processing" === n.status || "retrying" === n.status) ? {
        ...n,
        status: "processing",
        processingSession: t
      } : n)
    }))
  }
  async function eG({
    videoId: e,
    video: t,
    sourceLang: i,
    targetLang: n,
    includeTts: s = !0,
    ttsProvider: l,
    processingMode: d,
    translationStyleOverride: u,
    sonitranslateSettingsOverride: c,
    dubbingTimelineOverride: p,
    dubbingTimelineIntent: g,
    authorizationRequestIdempotencyKey: h,
    subtitleSource: m,
    get: f
  }) {
    let _ = (0, B.normalizeResolvedTranslationStyle)(u),
      {
        updateVideoStatus: v,
        setVideoProcessingError: S,
        updateVideo: y,
        addTask: P,
        updateTask: T,
        removeTask: w
      } = f(),
      x = null,
      I = null,
      F = null,
      W = null,
      es = null,
      el = !1,
      eb = null,
      ey = null,
      eP = null,
      ew = (0, J.createLocalJobTerminalDeliveryOwner)(),
      ex = l ?? "edge_tts",
      eI = "",
      eE = null,
      ek = {},
      eV = Date.now(),
      eU = h ?? (0, eL.createTrialAuthorizationRequestId)(),
      eq = await (0, ef.canonicalJsonSha256)(eU),
      eB = (t, i) => {
        if (T(t, i), t === x) {
          let i = f().tasks.find(e => e.id === t);
          i && (0, ev.publishQueueTaskProgress)(e, i)
        }
      };
    try {
      let u = eg.useCloudStore.getState();
      {
        let i = (0, Z.safeLocalEngineSoniSettings)(c ?? A.useSettingsStore.getState().settings.sonitranslateSettings ?? A.DEFAULT_SONITRANSLATE_SETTINGS),
          a = (eE = s ? await (0, M.resolvePinnedNativeTtsRouteForRetry)(t) : null) ?? eD(l, i, n);
        if (ex = a.provider, eI = a.voice, eE?.recoveredFromArtifact && (y(e, {
            nativeTtsProvider: eE.provider,
            nativeTtsVoice: eE.voice
          }), await (0, V.persistLatestProjectManifest)(e, f)), s && "piper_native" === a.provider && (0, b.legacyCustomerProcessingPathEnabled)()) throw (0, eT.structuredPiperError)("native_tts_piper_requires_native_vnext");
        await (0, eo.ensurePremiumVoiceReadyForProcessing)({
          enabled: s,
          provider: a.provider,
          voice: a.voice
        }), (0, ei.throwIfPipelineCanceled)(e)
      }(0, b.legacyCustomerProcessingPathEnabled)() || await (0, eu.ensureNativeVnextRuntimeReadyForProcessing)(u.apiUrl), await (0, o.appendAppLog)("info", `[pipeline:${e}] Start Local Engine source=${i} target=${n}`), v(e, "translating"), y(e, {
        translationServerUsageStarted: !1
      }), x = P(R.localEnginePipelineTaskState.createLocalEnginePipelineTask(e)), await eF(e, f), (0, ei.throwIfPipelineCanceled)(e);
      let h = (0, b.legacyCustomerProcessingPathEnabled)() ? null : (0, ed.startNativeVnextPreflightPrep)(e, ek),
        S = (0, en.measureLocalPreflight)("server_config", ek, () => u.fetchServerConfig());
      T(x, R.localEnginePipelineTaskState.localEnginePipelinePrepareTaskUpdate(4));
      let w = await S;
      (0, ei.throwIfPipelineCanceled)(e);
      let B = w;
      if (!B) throw Error((0, G.authorizationRecoveryMessage)("server_config_invalid"));
      if (!(0, b.legacyCustomerProcessingPathEnabled)()) {
        if (!h) throw Error("native_vnext_preflight_prep_unavailable");
        T(x, R.localEnginePipelineTaskState.localEnginePipelinePrepareTaskUpdate(5));
        let [
          [o, v], b, S, P
        ] = await Promise.all([h.identity, h.outputDir, h.registry, h.nativeResourcePolicy]);
        (0, ei.throwIfPipelineCanceled)(e);
        let w = (0, Z.safeLocalEngineSoniSettings)(c ?? A.useSettingsStore.getState().settings.sonitranslateSettings ?? A.DEFAULT_SONITRANSLATE_SETTINGS),
          N = p ?? A.useSettingsStore.getState().settings.dubbingTimeline,
          M = (0, U.buildNativeDubbingTimelineSettings)(N, {
            includeTts: s,
            allowHistoricalNumericIntent: "historical_numeric" === g
          }),
          L = (0, q.buildActiveTranslationGlossaryPayload)(A.useSettingsStore.getState().settings.translationGlossary),
          j = eE ?? eD(l, w, n),
          H = j.provider;
        ex = H, eI = j.voice;
        let $ = (0, Z.retryScopeTtsProvider)(s, H);
        W = $;
        let O = function(e, t, i, n) {
            if (!0 === e.billingAuthorizationPending && eC.test(n) && e.billingAuthorizationRequestKeyHash === n && e.billingTargetLanguage === t && e.billingTtsProvider === i) {
              var a;
              let t;
              return a = e.lastAuthorizedJobId, (t = a?.trim()) && t === a ? t : void 0
            }
          }(t, n, $, eq) ?? ("number" == typeof t.billingSourceVideoSeconds && Number.isFinite(t.billingSourceVideoSeconds) ? (0, Z.retryOfJobIdForLocalPreflight)(t, n, $, t.billingSourceVideoSeconds) : void 0),
          G = `processing-preflight-${(0,a.generateId)()}`,
          J = (0, D.createNativeVnextProgressAuthority)(),
          K = await (0, en.measureLocalPreflight)("native_media_preflight", ek, () => (0, e_.prepareNativeVnextMediaBeforeAuthorization)({
            projectId: e,
            videoId: e,
            sourcePath: t.path,
            outputDir: b,
            sourceLanguage: i,
            retryOfJobId: O,
            allowMissingSourceAudio: "ocr_only" === d,
            includeTts: s,
            dubbingTimeline: M,
            requiresSourceSeparation: s && "separate_background" === (0, U.buildNativeSoniCompatibilitySettings)(w).originalAudioStrategy,
            initialRegistry: S,
            apiUrl: u.apiUrl,
            taskId: x,
            updateTask: eB,
            progressOperationId: G,
            progressGeneration: 1,
            progressAuthority: J
          }));
        if (!(0, X.runtimeHashIsTrustedByServerConfig)(B, K.vnextPackageSha256)) throw Error("native_vnext_runtime_not_trusted");
        let Q = K.authorizedSourceSeconds,
          ee = eS({
            requested: N,
            includeTts: s,
            durationSeconds: K.authorizedSourceSeconds
          }).timeline,
          et = (0, U.buildNativeDubbingTimelineSettings)(ee, {
            includeTts: s,
            allowHistoricalNumericIntent: "historical_numeric" === g
          }),
          ea = "hybrid_stretch" === et.mode ? et.timingIntent ?? null : null;
        ey = et;
        let eo = (0, U.buildLocalJobRequestedFeatures)(s, d, {
            preferNoWatermark: (0, U.shouldPreferNoWatermarkForLocalJob)({
              license: eg.useCloudStore.getState().license,
              balance: eg.useCloudStore.getState().balance
            }) || (0, U.shouldRequestLocalVoiceDichVideo)(s, H)
          }),
          ed = (0, Z.retryOfJobIdForLocalPreflight)(t, n, $, Q),
          eu = await (0, k.getProjectArtifactPath)(e, "tts.manifest");
        s && (f().updateVideo(e, {
          ttsManifestPath: eu
        }), await (0, V.persistLatestProjectManifest)(e, f, {
          artifact: "tts_manifest"
        })), T(x, R.localEnginePipelineTaskState.localEnginePipelineAuthorizationTaskUpdate());
        let ep = await (0, en.measureLocalPreflight)("local_preflight", ek, () => u.localPreflight({
          device: {
            hardware_fingerprint_hash: o.hardware_fingerprint_hash,
            installation_id: o.installation_id,
            app_version: v,
            os: o.os,
            runtime_hash: K.vnextPackageSha256,
            anchor_count: o.anchor_count
          },
          job: {
            source_video_seconds: K.authorizedSourceSeconds,
            target_language: n,
            tts_provider: "edge",
            premium_voice_seconds: 0,
            requested_features: [...eo],
            ...(0, U.buildLocalVoiceAuthorizationRoute)(s, j.provider, j.voice),
            runtime_package_hash: K.vnextPackageSha256,
            installed_app_version: v,
            supports_watermark_policy: !0,
            supports_local_job_resume_v1: !0,
            retry_of_job_id: ed,
            ...(0, eL.buildTrialAuthorizationEvidence)({
              fingerprint: o,
              sourceContentHash: `sha256:${K.sourceFingerprint}`,
              requestIdempotencyKey: eU
            })
          }
        }));
        if ((0, ei.throwIfPipelineCanceled)(e), !ep) {
          let e = eg.useCloudStore.getState();
          throw eN({
            code: e.authorizationBlockedReason,
            detail: e.authorizationError,
            ttsProvider: s ? j.provider : null
          })
        }
        let eh = ep.authorization;
        I = eh.job_id, F = Q, es = eh;
        let {
          policySnapshotHash: ef,
          renewalDeadlineAt: ev,
          leaseGeneration: eP
        } = eH(eh), eT = (0, Z.billingMetadataFromAuthorization)(eh, Q, n, $, j.provider, j.voice, ed), eR = await ej({
          update: () => y(e, {
            ...eT,
            sourceFingerprint: K.sourceFingerprint,
            billingAuthorizationPending: !0,
            billingAuthorizationRequestKeyHash: eq
          }),
          persist: () => (0, V.persistLatestProjectManifest)(e, f),
          bind: () => (0, r.bindEngineVnextSourcePin)({
            projectId: e,
            sourceFingerprint: K.sourceFingerprint,
            jobId: eh.job_id,
            policySnapshotHash: ef,
            retryOfJobId: eh.retry_of_job_id ?? null
          })
        });
        if (el = !0, eR.sourcePinPath !== K.sourcePinPath || eR.sourceFingerprint !== K.sourceFingerprint || eR.jobId !== eh.job_id || eR.policySnapshotHash !== ef) throw Error("native_source_pin_binding_mismatch");
        if (await (0, ec.confirmChargedAfterRefundAuthorization)(eh) === "cancelled") throw (0, ei.requestPipelineCancellation)(e, "Đã hủy xử lý lại video."), (0, ec.chargedAfterRefundCancelledError)();
        let eF = {
            ...w,
            burn_subtitles_to_video: !1,
            soft_subtitles_to_video: !1
          },
          eG = (0, Y.authorizationLocalEngineSettings)(eh),
          ez = {
            ...eF,
            ...eG,
            output_type: s ? eF.output_type : "subtitle",
            sync_voice_timing: !!s && !!(eG.sync_voice_timing ?? eF.sync_voice_timing),
            display_subtitle_timing: s ? String(eG.display_subtitle_timing ?? eF.display_subtitle_timing) : "source_timing",
            burn_subtitles_to_video: !1,
            soft_subtitles_to_video: !1
          },
          eJ = (0, U.originalAudioPolicyFromSoniSettings)(ez),
          eK = eE ?? eD(H, ez, n);
        ex = eK.provider, eI = eK.voice;
        let eW = (0, Z.buildVerifiedServerConfig)(B);
        await (0, r.verifySignedServerConfigCapabilities)(B.signed_config_bundle);
        let eQ = await (0, eM.withActiveNativePipelineJob)(e, eh.job_id, () => eA({
          apiUrl: eW.api_url,
          authorization: eh,
          vnextPackageSha256: K.vnextPackageSha256,
          provider: s ? eK.provider : null,
          voice: s ? eK.voice : null,
          authorizedSourceSeconds: K.authorizedSourceSeconds
        }));
        (0, ei.throwIfPipelineCanceled)(e);
        let eY = await e$({
            sourceLanguage: i,
            targetLanguage: n,
            translationStyle: _,
            glossary: L,
            processingMode: d ?? "balanced",
            includeTts: s,
            ttsProvider: eK.provider,
            ttsVoice: eK.voice,
            piperExecutionIdentity: eQ.piperExecutionIdentity ?? void 0,
            effectiveLocalEngineSettings: ez,
            dubbingTimeline: ee,
            dubbingTimelineIntent: ea,
            nativeResourcePolicy: P,
            authorization: eh
          }),
          eZ = (0, em.createDesktopProcessingSession)({
            projectId: e,
            jobId: eh.job_id,
            attemptId: eh.attempt_id,
            logicalJobId: eh.logical_job_id,
            resumeGeneration: eh.resume_generation,
            producingAppVersion: eh.producing_app_version,
            deviceId: eh.device_id,
            policySnapshotHash: ef,
            renewalDeadlineAt: ev,
            leaseGeneration: eP,
            authorizedSourceSeconds: K.authorizedSourceSeconds,
            queueSnapshotHash: eY,
            currentStage: "preflight",
            sourcePinPath: K.sourcePinPath,
            nativeOutputRootPath: b,
            piperExecutionIdentity: eQ.piperExecutionIdentity ?? void 0
          });
        y(e, {
          ...(0, Z.billingMetadataFromAuthorization)(eh, Q, n, $, eK.provider, eK.voice, ed),
          sourceFingerprint: K.sourceFingerprint,
          billingAuthorizationPending: void 0,
          billingAuthorizationRequestKeyHash: void 0,
          processingSession: eZ,
          processingRecoveryBinding: void 0,
          originalAudioStrategy: eJ.strategy,
          originalAudioVolume: eJ.volume
        }), eO(e, eZ), await (0, V.persistLatestProjectManifest)(e, f, {
          source_lang: i,
          target_lang: n,
          include_tts: s,
          engine: "native-vnext"
        });
        let eX = Date.now() - eV;
        if (eb = (0, z.securePreflightMetrics)({
            preflight_wall_ms: eX,
            preflight_backend_ms: ep.timings_ms?.total ?? ek.local_preflight ?? null,
            runtime_package_hash: K.vnextPackageSha256,
            engine_family: z.ENGINE_VNEXT_FAMILY
          }), await (0, er.logNativeVnextPreflightBenchmark)({
            videoId: e,
            localPreflightTimings: ek,
            localPreflightWallMs: eX,
            force: !1
          }), !await (0, C.maybeRunEngineVnextNativePipeline)({
            videoId: e,
            video: t,
            sourceLang: i,
            targetLang: n,
            effectiveLocalEngineSettings: ez,
            includeTts: s,
            outputDir: b,
            authorization: eh,
            nativeAuthorization: eQ.authorization,
            nativeResourcePolicy: P,
            translationApiUrl: eW.api_url,
            translationModel: (0, E.parseGptTranslateProcess)(ez.translate_process).model,
            translationStyle: _,
            translationGlossary: L,
            ttsProvider: eK.provider,
            ttsVoice: eK.voice,
            dubbingTimeline: ee,
            dubbingTimelineIntent: ea,
            processingMode: d,
            processingSession: eZ,
            preparedMedia: K,
            taskId: x,
            updateTask: eB,
            get: f,
            securePreflightEvidence: eb,
            terminalDeliveryOwner: ew,
            subtitleSource: m
          })) throw Object.assign(Error("native_vnext_required"), {
          code: "native_vnext_required",
          fallbackAllowed: !1
        });
        return
      }
      let ee = await (0, en.measureLocalPreflight)("local_engine_status", ek, () => (0, r.getLocalEngineQuickStatus)());
      if (!ee.installed) {
        T(x, R.localEnginePipelineTaskState.localEnginePipelineWaitingForPreparationTaskUpdate()), await (0, eu.confirmEnginePreparation)({
          reason: "missing",
          title: "Chuẩn bị bộ xử lý video",
          description: "DichVideo cần cài bộ xử lý tiêu chuẩn trên máy này trước khi chạy video. Bước này chỉ làm một lần và bạn chưa bị trừ phút."
        }), T(x, R.localEnginePipelineTaskState.localEnginePipelinePreparingApplicationTaskUpdate());
        try {
          ee = await (0, en.measureLocalPreflight)("install_trusted_engine", ek, () => (0, eu.installTrustedLocalEngine)(u.apiUrl)), B = await (0, en.measureLocalPreflight)("server_config_refresh", ek, () => u.fetchServerConfig({
            force: !0
          })) ?? B
        } catch (e) {
          throw Error(`Kh\xf4ng chuẩn bị được bộ xử l\xfd video. Bạn chưa bị trừ ph\xfat. Chi tiết: ${e instanceof Error?e.message:String(e)}`)
        }
      }
      if (!(0, X.runtimeHashIsTrustedByServerConfig)(B, ee.runtime_hash)) {
        await (0, eu.confirmEnginePreparation)({
          reason: "untrusted",
          title: "Cập nhật bộ xử lý video",
          description: "DichVideo cần cập nhật bộ xử lý tiêu chuẩn trước khi chạy video. Bước này chỉ làm một lần và bạn chưa bị trừ phút."
        }), T(x, R.localEnginePipelineTaskState.localEnginePipelineUpdatingApplicationTaskUpdate());
        try {
          ee = await (0, en.measureLocalPreflight)("install_trusted_engine", ek, () => (0, eu.installTrustedLocalEngine)(u.apiUrl)), B = await (0, en.measureLocalPreflight)("server_config_refresh", ek, () => u.fetchServerConfig({
            force: !0
          })) ?? B
        } catch (e) {
          throw Error(`Kh\xf4ng cập nhật được bộ xử l\xfd video. Bạn chưa bị trừ ph\xfat. Chi tiết: ${e instanceof Error?e.message:String(e)}`)
        }
      }(0, ei.throwIfPipelineCanceled)(e);
      let et = (0, ed.startLocalEnginePreflightPrep)(e, ek);
      if (ee.ready || (T(x, R.localEnginePipelineTaskState.localEnginePipelineStartingSessionTaskUpdate()), ee = await (0, en.measureLocalPreflight)("start_local_engine", ek, () => (0, r.startLocalEngine)())), !ee.ready) throw Error("Bộ xử lý local chưa sẵn sàng. Hãy thử dừng rồi khởi động lại trong Cài đặt.");
      (0, ei.throwIfPipelineCanceled)(e);
      let ea = ee.runtime_hash;
      if (!ea) throw Error("runtime_not_trusted: Local Engine chưa có runtime hash để xác thực.");
      if (!(0, X.runtimeHashIsTrustedByServerConfig)(B, ea)) throw Error((0, G.authorizationRecoveryMessage)("runtime_not_trusted"));
      let ep = (0, Z.safeLocalEngineSoniSettings)(c ?? A.useSettingsStore.getState().settings.sonitranslateSettings ?? A.DEFAULT_SONITRANSLATE_SETTINGS),
        ef = eE ?? eD(l, ep, n),
        ev = ef.provider;
      ex = ev, eI = ef.voice;
      let eG = (0, Z.retryScopeTtsProvider)(s, ev);
      W = eG;
      let ez = "number" == typeof t.billingSourceVideoSeconds && Number.isFinite(t.billingSourceVideoSeconds) ? (0, Z.retryOfJobIdForLocalPreflight)(t, n, eG, t.billingSourceVideoSeconds) : void 0;
      T(x, R.localEnginePipelineTaskState.localEnginePipelineCheckingAccountTaskUpdate());
      let [
        [eJ, eK], eW
      ] = await Promise.all([et.identity, et.outputDir]), eQ = p ?? A.useSettingsStore.getState().settings.dubbingTimeline, eY = (0, U.buildNativeDubbingTimelineSettings)(eQ, {
        includeTts: s,
        allowHistoricalNumericIntent: "historical_numeric" === g
      }), eZ = (0, j.resolveNativeResourcePolicyForJob)(A.useSettingsStore.getState().settings.nativeResourcePolicyPreset), eX = (0, q.buildActiveTranslationGlossaryPayload)(A.useSettingsStore.getState().settings.translationGlossary), e0 = await (0, e_.prepareVnextSttBeforeAuthorization)({
        videoId: e,
        sourceLanguage: i,
        enginePreference: (0, b.effectiveEnginePreference)(f().enginePreference),
        apiUrl: u.apiUrl,
        taskId: x,
        updateTask: T
      }), e1 = await (0, e_.preflightLegacyLocalMediaBeforeAuthorization)({
        projectId: e,
        sourcePath: t.path,
        outputDir: eW,
        retryOfJobId: ez,
        includeTts: s,
        dubbingTimeline: eY,
        preparedVnextStt: e0
      }), e6 = e1.authorizedSourceSeconds, e2 = eS({
        requested: eQ,
        includeTts: s,
        durationSeconds: e1.authorizedSourceSeconds
      }).timeline, e3 = (0, U.buildNativeDubbingTimelineSettings)(e2, {
        includeTts: s,
        allowHistoricalNumericIntent: "historical_numeric" === g
      }), e4 = "hybrid_stretch" === e3.mode ? e3.timingIntent ?? null : null;
      ey = e3;
      let e5 = (0, Z.retryOfJobIdForLocalPreflight)(t, n, eG, e6),
        e8 = (0, U.buildLocalJobRequestedFeatures)(s, d, {
          preferNoWatermark: (0, U.shouldPreferNoWatermarkForLocalJob)({
            license: eg.useCloudStore.getState().license,
            balance: eg.useCloudStore.getState().balance
          }) || (0, U.shouldRequestLocalVoiceDichVideo)(s, ev)
        }),
        e9 = await (0, k.getProjectArtifactPath)(e, "tts.manifest");
      s && (f().updateVideo(e, {
        ttsManifestPath: e9
      }), await (0, V.persistLatestProjectManifest)(e, f, {
        artifact: "tts_manifest"
      })), T(x, R.localEnginePipelineTaskState.localEnginePipelinePreparingSessionTaskUpdate());
      let e7 = (0, en.measureLocalPreflight)("local_preflight", ek, () => u.localPreflight({
          device: {
            hardware_fingerprint_hash: eJ.hardware_fingerprint_hash,
            installation_id: eJ.installation_id,
            app_version: eK,
            os: eJ.os,
            runtime_hash: ea,
            anchor_count: eJ.anchor_count
          },
          job: {
            source_video_seconds: e1.authorizedSourceSeconds,
            target_language: n,
            tts_provider: "edge",
            premium_voice_seconds: 0,
            requested_features: [...e8],
            ...(0, U.buildLocalVoiceAuthorizationRoute)(s, ef.provider, ef.voice),
            runtime_package_hash: ea,
            installed_app_version: eK,
            supports_watermark_policy: !0,
            supports_local_job_resume_v1: !0,
            retry_of_job_id: e5,
            ...(0, eL.buildTrialAuthorizationEvidence)({
              fingerprint: eJ,
              sourceContentHash: `sha256:${e1.sourceFingerprint}`,
              requestIdempotencyKey: eU
            })
          }
        })),
        [te, tt] = await Promise.all([e7, et.adaptiveEngineProfile]);
      if ((0, ei.throwIfPipelineCanceled)(e), !te) {
        let e = eg.useCloudStore.getState();
        throw eN({
          code: e.authorizationBlockedReason,
          detail: e.authorizationError
        })
      }
      let ti = te.device,
        tn = te.authorization,
        ta = te.offline_lease;
      I = tn.job_id, F = e6, es = tn;
      let {
        policySnapshotHash: tr,
        renewalDeadlineAt: to,
        leaseGeneration: ts
      } = eH(tn), tl = await (0, r.bindEngineVnextSourcePin)({
        projectId: e,
        sourceFingerprint: e1.sourceFingerprint,
        jobId: tn.job_id,
        policySnapshotHash: tr,
        retryOfJobId: tn.retry_of_job_id ?? null
      });
      if (el = !0, tl.sourcePinPath !== e1.sourcePinPath || tl.sourceFingerprint !== e1.sourceFingerprint || tl.jobId !== tn.job_id || tl.policySnapshotHash !== tr) throw Error("native_source_pin_binding_mismatch");
      if (await (0, ec.confirmChargedAfterRefundAuthorization)(tn) === "cancelled") throw (0, ei.requestPipelineCancellation)(e, "Đã hủy xử lý lại video."), (0, ec.chargedAfterRefundCancelledError)();
      eb = (0, z.securePreflightMetrics)({
        preflight_wall_ms: Date.now() - eV,
        preflight_backend_ms: te.timings_ms?.total ?? ek.local_preflight ?? null,
        runtime_package_hash: ea,
        engine_family: z.LEGACY_ENGINE_FAMILY
      });
      let td = {
          ...ep,
          burn_subtitles_to_video: !1,
          soft_subtitles_to_video: !1
        },
        tu = {
          ...td,
          transcriber_model: tt.settings.transcriber_model,
          compute_type: tt.settings.compute_type,
          batch_size: tt.settings.batch_size,
          output_type: s ? td.output_type : "subtitle",
          sync_voice_timing: !!s && td.sync_voice_timing,
          display_subtitle_timing: s ? td.display_subtitle_timing : "source_timing",
          burn_subtitles_to_video: !1,
          soft_subtitles_to_video: !1
        };
      await (0, o.appendAppLog)("info", `[pipeline:${e}] Adaptive engine accelerator=${tt.selected_accelerator} profile=${tt.runtime_profile??"default"} reason=${tt.reason_code??""}`);
      let tc = (0, Y.authorizationLocalEngineSettings)(tn),
        tp = {
          ...tu,
          ...tc,
          output_type: s ? tu.output_type : "subtitle",
          sync_voice_timing: !!s && !!(tc.sync_voice_timing ?? tu.sync_voice_timing),
          display_subtitle_timing: s ? String(tc.display_subtitle_timing ?? tu.display_subtitle_timing) : "source_timing",
          burn_subtitles_to_video: !1,
          soft_subtitles_to_video: !1
        },
        tg = (0, U.originalAudioPolicyFromSoniSettings)(tp),
        th = eE ?? eD(ev, tp, n);
      ex = th.provider, eI = th.voice;
      let tm = await e$({
          sourceLanguage: i,
          targetLanguage: n,
          translationStyle: _,
          glossary: eX,
          processingMode: d ?? "balanced",
          includeTts: s,
          ttsProvider: th.provider,
          ttsVoice: th.voice,
          effectiveLocalEngineSettings: tp,
          dubbingTimeline: e2,
          dubbingTimelineIntent: e4,
          nativeResourcePolicy: eZ,
          authorization: tn
        }),
        tf = (0, em.createDesktopProcessingSession)({
          projectId: e,
          jobId: tn.job_id,
          attemptId: tn.attempt_id,
          logicalJobId: tn.logical_job_id,
          resumeGeneration: tn.resume_generation,
          producingAppVersion: tn.producing_app_version,
          deviceId: tn.device_id,
          policySnapshotHash: tr,
          renewalDeadlineAt: to,
          leaseGeneration: ts,
          authorizedSourceSeconds: e1.authorizedSourceSeconds,
          queueSnapshotHash: tm,
          currentStage: "preflight",
          sourcePinPath: e1.sourcePinPath,
          nativeOutputRootPath: eW
        });
      y(e, {
        ...(0, Z.billingMetadataFromAuthorization)(tn, e6, n, eG, th.provider, th.voice, e5),
        sourceFingerprint: e1.sourceFingerprint,
        processingSession: tf,
        processingRecoveryBinding: void 0,
        originalAudioStrategy: tg.strategy,
        originalAudioVolume: tg.volume
      }), eO(e, tf), await (0, V.persistLatestProjectManifest)(e, f, {
        source_lang: i,
        target_lang: n,
        include_tts: s,
        engine: "local"
      }), T(x, R.localEnginePipelineTaskState.localEnginePipelinePreparingConfigTaskUpdate());
      let t_ = (0, Z.buildVerifiedServerConfig)(B);
      T(x, R.localEnginePipelineTaskState.localEnginePipelineStartingVideoTaskUpdate());
      let tv = eg.useCloudStore.getState().token;
      (0, ei.throwIfPipelineCanceled)(e);
      let tb = Date.now() - eV;
      await (0, er.logLocalPreflightBenchmark)({
        videoId: e,
        localPreflightTimings: ek,
        localPreflightWallMs: tb,
        force: !1
      }), (0, ei.throwIfPipelineCanceled)(e), eP = (0, K.createLocalJobHeartbeat)(tn.job_id, {
        stage: "preparing",
        progress: 15,
        message: "Starting legacy local engine pipeline",
        lease_generation: tf.lease_generation
      });
      let tS = await (0, L.maybeRunEngineVnextStt)({
        videoId: e,
        authorization: tn,
        preparedMedia: e1,
        preparedVnextStt: e0,
        taskId: x,
        updateTask: T,
        replaceVideoSubtitles: eh.useSubtitleStore.getState().replaceVideoSubtitles,
        get: f
      });
      (0, ei.throwIfPipelineCanceled)(e);
      let ty = tS?.sourceSubtitlePath ? tS.language : i,
        tP = await (0, $.createLocalEngineJobWithRestart)({
          input_path: e1.sourcePinPath,
          output_dir: eW,
          source_language: ty,
          target_language: n,
          tts_provider: "edge",
          subtitle_mode: "none",
          voice_words: 0,
          sonitranslate_settings: {
            ...tp,
            tts_voice00: eR(n, tp.tts_voice00) ?? tp.tts_voice00
          },
          developer_benchmark: !1,
          input_duration_sec: e6,
          device_id: ti.id,
          requested_features: [...e8],
          verified_server_config: t_,
          runtime_hash: ea,
          runtime_accelerator: tt.selected_accelerator,
          runtime_profile: tt.runtime_profile,
          job_token: tn.token,
          engine_policy_version: tn.engine_policy_version,
          server_translation_required: tn.server_translation_required,
          translation_route: tn.translation_route,
          server_issued_settings: tc,
          server_translation: (0, Z.buildServerTranslationPolicy)(t_.api_url, tn, tv, ty, n, e6, (0, E.parseGptTranslateProcess)(tp.translate_process).model, eX, _),
          offline_lease_id: ta?.id,
          heartbeat_grace_seconds: ta?.heartbeat_grace_seconds,
          tts_manifest_path: e9,
          precomputed_source_subtitle_path: tS?.sourceSubtitlePath ?? void 0,
          engine_vnext_stt_route: tS?.route,
          engine_vnext_fallback_used: tS?.fallbackUsed ?? !1,
          engine_vnext_package_sha256: tS?.packageSha256 ?? void 0,
          engine_vnext_version: tS?.engineVersion ?? void 0,
          engine_vnext_fallback_reason: tS?.fallbackReason ?? void 0,
          engine_vnext_stt_ms: tS?.sttMs ?? void 0
        }, () => {
          x && T(x, R.localEnginePipelineTaskState.localEnginePipelineRestartingSessionTaskUpdate())
        });
      if ((0, ei.throwIfPipelineCanceled)(e), tP = await (0, O.pollLocalEngineJobToTerminal)({
          videoId: e,
          taskId: x,
          job: tP,
          updateVideoStatus: v,
          updateTask: T,
          onProgress: t => {
            t.server_translation_usage_started && y(e, {
              translationServerUsageStarted: !0
            }), eP && eP.update({
              stage: t.stage,
              progress: t.progress,
              message: t.status
            })
          }
        }), eP && (eP.stop(), eP = null), "completed" !== tP.status) throw await ew.deliverOnce(() => (0, J.uploadTerminalLocalJobMetrics)(tn, tP, eb)), Error((0, Q.localEngineUserMessage)(tP.error_message, "Bộ xử lý local chưa hoàn tất được video này."));
      let tT = await (0, N.alignedSourceSubtitlePathForJob)(tP);
      await (0, N.syncLocalEngineSubtitlesToTimeline)(tP, e);
      let tw = (0, N.displaySubtitlePathForJob)(tP);
      f().updateVideo(e, (0, H.localEngineCompletedVideoPatch)({
        job: tP,
        displaySubtitlePath: tw,
        alignedSourceSubtitlePath: tT,
        ttsManifestPath: e9,
        exportWatermarkPolicy: (0, Z.exportWatermarkPolicyFromAuthorization)(tn)
      })), v(e, "completed"), await (0, V.persistLatestProjectManifest)(e, f, {
        source_lang: i,
        target_lang: n,
        include_tts: s,
        engine: "local"
      }), await ew.deliverOnce(() => (0, J.uploadTerminalLocalJobMetrics)(tn, tP, eb)), eB(x, R.localEnginePipelineTaskState.localEnginePipelineCompletedTaskUpdate()), await (0, o.appendAppLog)("info", `[pipeline:${e}] Local Engine completed output=${tP.output_video_path??""} subtitle=${tP.subtitle_path??""} display_subtitle=${tP.display_subtitle_path??""} voice_subtitle=${tP.voice_subtitle_path??""} source_subtitle=${tP.source_subtitle_path??""} aligned_source_subtitle=${tT??""} translation_debug=${tP.translation_debug_path??""}`)
    } catch (c) {
      let a, r;
      if ((0, ec.isChargedAfterRefundCancelledError)(c)) {
        eP && (eP.stop(), eP = null);
        let i = (0, ei.consumePipelineCancellation)(e);
        if (v(e, "idle"), el && I && (y(e, {
            pausedBillingScopeJobId: I
          }), await (0, V.persistLatestProjectManifest)(e, f)), x && w(x), I && !ew.claimed) {
          let e = I;
          await ew.deliverOnce(() => (0, J.uploadCanceledAuthorizedLocalJobMetrics)(es, e, F ?? (0, Z.sourceVideoSeconds)(t), i, eb, ey))
        }
        throw await (0, o.appendAppLog)("info", `[pipeline:${e}] Charged-after-refund retry canceled by user.`), (0, ec.chargedAfterRefundCancelledError)()
      }
      if ((0, ei.isPipelineCancellation)(c, e)) {
        eP && (eP.stop(), eP = null);
        let i = (0, ei.consumePipelineCancellationRequest)(e),
          a = i.message;
        if (v(e, "idle"), "pause" === i.intent && I && (y(e, {
            billingScopeJobId: I,
            pausedBillingScopeJobId: I,
            billingSourceVideoSeconds: F ?? (0, Z.sourceVideoSeconds)(t),
            billingTargetLanguage: n,
            billingTtsProvider: W ?? (0, Z.retryScopeTtsProvider)(s, ex),
            ...s && ex && eI ? {
              nativeTtsProvider: ex,
              nativeTtsVoice: eI
            } : {},
            processingError: void 0,
            processingErrorCode: void 0,
            processingErrorDetail: void 0
          }), await (0, V.persistLatestProjectManifest)(e, f)), x && w(x), "abandon" !== i.intent && I && !ew.claimed) {
          let e = I;
          await ew.deliverOnce(() => (0, J.uploadCanceledAuthorizedLocalJobMetrics)(es, e, F ?? (0, Z.sourceVideoSeconds)(t), a, eb, ey, {
            errorCode: "pause" === i.intent ? "job_paused" : "job_canceled"
          }))
        }
        throw await (0, o.appendAppLog)("info", `[pipeline:${e}] ${"pause"===i.intent?"Paused by user.":"abandon"===i.intent?"Abandoned for project deletion.":"Canceled by user."}`), (0, ei.pipelineCanceledError)(a)
      }
      if ((0, ee.isEngineRepairRequiredError)(c) && et.useEngineVnextInstallStore.getState().markRepairRequired(), (0, ee.isEngineSettingsRequiredError)(c)) throw ep.useAppStore.getState().openEngineSettings(), x && w(x), y(e, {
        status: "idle",
        processingError: void 0,
        processingErrorCode: void 0,
        processingErrorDetail: void 0
      }), await (0, o.appendAppLog)("info", `[pipeline:${e}] Waiting for DichVideo Engine installation in Settings.`), c;
      eP && (eP.stop(), eP = null), console.error("Pipeline failed:", (0, Q.pipelineErrorLogMessage)(c));
      let l = (0, Q.localEngineUserMessage)(c, "Không thể hoàn tất xử lý video."),
        d = (a = (0, z.engineVnextErrorCode)(c).trim().toLowerCase(), /^[a-z][a-z0-9_]{0,127}$/.test(a) ? a : void 0);
      S(e, l, d, (r = ((0, ea.errorTextField)(c, "developerMessage") || (0, ea.errorTextField)(c, "developer_message")).replace(/\s+/g, " ").trim()) ? r.slice(0, 240) : void 0), x && eB(x, R.localEnginePipelineTaskState.localEnginePipelineFailedTaskUpdate(l)), await (0, er.logNativeVnextPreflightFailure)({
        videoId: e,
        localPreflightTimings: ek
      }).catch(e => {
        console.warn("Failed to log preflight failure:", e)
      });
      try {
        await (0, V.persistLatestProjectManifest)(e, f, {
          source_lang: i,
          target_lang: n,
          include_tts: s,
          engine: "local"
        })
      } catch (e) {
        console.warn("Failed to persist failed project manifest:", e)
      }
      if (I && !ew.claimed && !(0, z.cloudDiagnosticsUploaded)(c)) {
        let e = I;
        await ew.deliverOnce(() => (0, J.uploadFailedAuthorizedLocalJobMetrics)(es, e, F ?? (0, Z.sourceVideoSeconds)(t), c, eb, ey)).catch(e => {
          console.warn("Failed to persist terminal failure report:", e)
        })
      }
      let u = "";
      try {
        u = await (0, k.getLogFilePath)()
      } catch {
        u = ""
      }
      throw await (0, o.appendAppLog)("error", `[pipeline:${e}] Failed: ${(0,Q.pipelineErrorLogMessage)(c)}${u?` | log=${u}`:""}`).catch(e => console.warn("Failed to log pipeline failure:", e)), Object.assign(Error(l), d ? {
        code: d,
        customerMessage: l,
        fallbackAllowed: !1
      } : void 0)
    }
  }
  var eU = e.i(675);
  async function eq(e, t) {
    let {
      persist: i,
      ...n
    } = t, a = await (0, eU.hydrateTerminalProject)(e, n);
    return "ready" === a.state && await i(), a.state
  }
  var eB = e.i(8594),
    ez = e.i(30148),
    eJ = e.i(96269);

  function eK(e) {
    return ("separated_background" === e.sourceAudioMode || "vocals_only" === e.sourceAudioMode) && !e.verifiedBackgroundCarrierPath?.trim()
  }

  function eW(e) {
    let t = e?.trim().replaceAll("\\", "/") ?? "";
    return /^\/\/\?\/unc\//i.test(t) ? t = `//${t.slice(8)}` : /^\/\/\?\//.test(t) && (t = t.slice(4)), (t = (t = t.startsWith("//") ? `//${t.slice(2).replace(/\/+/g,"/")}` : t.replace(/\/+/g, "/")).replace(/\/+$/, "")) ? t.toLocaleLowerCase("en-US") : null
  }
  e.s(["getPlaybackIssue", 0, function(e, t) {
    let i = e?.split(".").pop()?.toLowerCase(),
      n = t ? `Codec hiện tại: ${t}.` : "";
    return "mkv" === i || "avi" === i || "mov" === i ? {
      title: "DichVideo đang tạo bản preview tương thích",
      description: `File .${i} đ\xe3 được nhập th\xe0nh c\xf4ng nhưng WebView2 kh\xf4ng ph\xe1t trực tiếp container n\xe0y. ${n} DichVideo sẽ tạo bản MP4 preview H.264/AAC tự động.`
    } : {
      title: "DichVideo đang tạo bản preview tương thích",
      description: `${n} WebView2 kh\xf4ng ph\xe1t trực tiếp biến thể H.264/container hiện tại. DichVideo sẽ tạo bản MP4 preview H.264/AAC trong thư mục tạm.`
    }
  }, "getTerminalPreviewPlaybackIssue", 0, function(e) {
    return {
      title: "Không phát được bản xem trước",
      description: e
    }
  }, "getVideoMimeType", 0, function(e) {
    if (e) switch (e.split(".").pop()?.toLowerCase()) {
      case "mp4":
        return "video/mp4";
      case "webm":
        return "video/webm";
      case "mov":
        return "video/quicktime";
      case "mkv":
        return "video/x-matroska";
      case "avi":
        return "video/x-msvideo";
      default:
        return
    }
  }, "isBenignPlaybackAbort", 0, function(e) {
    let t = e instanceof DOMException ? e.name : "",
      i = e instanceof Error ? e.message.toLowerCase() : String(e).toLowerCase();
    return "AbortError" === t && (i.includes("media was removed from the document") || i.includes("interrupted by a call to pause") || i.includes("interrupted by a new load request"))
  }, "needsNleBackgroundCarrierHydration", 0, eK, "resolveNleProjectSourcePath", 0, function(e) {
    let t = e.projectRoot?.trim().replace(/[\\/]+$/, ""),
      i = e.relativeSourcePath?.trim().replace(/^[\\/]+/, "");
    if (t && i) {
      let e = t.includes("\\") ? "\\" : "/",
        n = i.replace(/[\\/]+/g, e);
      return `${t}${e}${n}`
    }
    return e.linkedSourcePath?.trim() || null
  }, "selectHevcAwarePlaybackPath", 0, function({
    sourcePlaybackPath: e,
    originalPath: t,
    previewPlaybackPath: i,
    hevcStatus: n
  }) {
    let a;
    return null === (a = eW(e)) || a !== eW(t) || "ineligible" === n ? i || e : "supported" === n ? t : i
  }, "selectNleBackgroundPlaybackPath", 0, function(e) {
    return "separated_background" !== e.sourceAudioMode && "vocals_only" !== e.sourceAudioMode ? e.sourcePath?.trim() || null : e.verifiedBackgroundCarrierPath?.trim() || null
  }, "selectTerminalEditorPlaybackBasePath", 0, function({
    desktopRuntime: e,
    terminalProjectActive: t,
    terminalProject: i,
    generatedPath: n,
    sourcePath: a
  }) {
    return i ? function({
      audioSourceSelection: e,
      sourcePath: t,
      carrierPath: i
    }) {
      return "separated_background" === e || "separated_vocals" === e ? i : t
    }(i) : e && t ? void 0 : n || a
  }, "shouldPreparePreviewBeforePlayback", 0, function(e, t) {
    let i;
    return "mp4" !== e?.split(".").pop()?.toLowerCase() || "h264" !== ((i = t?.trim().toLowerCase()) ? "avc1" === i ? "h264" : i : null)
  }], 15132);
  var eQ = e.i(69160),
    eY = e.i(88327),
    eZ = e.i(21455);

  function eX() {
    throw Error("nle_preview_timing_invalid")
  }

  function e0(e, t = 0) {
    return (!Number.isSafeInteger(e) || e < t) && eX(), e
  }

  function e1(e, t, i, n, a) {
    (!Number.isFinite(e) || e < t || e > i) && eX();
    let r = i - t,
      o = a - n;
    return e0(r, 1), e0(o, 1), e0(n + Math.round((e - t) / r * o))
  }

  function e6(e, t) {
    (!Number.isFinite(t) || t < 0) && eX();
    let i = e.videoSpans.find((i, n) => t >= i.sequenceStartMs && (t < i.sequenceEndMs || n === e.videoSpans.length - 1));
    return (!i || t > i.sequenceEndMs) && eX(), i
  }

  function e2(e, t) {
    let i = e6(e, t);
    return e1(t, i.sequenceStartMs, i.sequenceEndMs, i.sourceStartMs, i.sourceEndMs)
  }

  function e3(e, t) {
    let i, n = e.videoSpans.at(-1)?.sourceEndMs,
      a = void 0 !== n && t > n && t - n <= 1 ? n : t,
      r = ((!Number.isFinite(a) || a < 0) && eX(), (i = e.videoSpans.find((t, i) => a >= t.sourceStartMs && (a < t.sourceEndMs || i === e.videoSpans.length - 1))) && !(a > i.sourceEndMs) || eX(), i);
    return e1(a, r.sourceStartMs, r.sourceEndMs, r.sequenceStartMs, r.sequenceEndMs)
  }

  function e4(e, t, i) {
    Number.isFinite(i) || eX();
    let n = Math.min(e.durationMs, Math.max(0, i)),
      a = e2(e, n);
    return Math.min(t.durationMs, Math.max(0, e3(t, a)))
  }

  function e5(e) {
    let t = e.previewProjection;
    return t && t.revision === e.revision || eX(), t
  }

  function e8(e) {
    return e5(e)
  }
  e.s(["activeNleCaptionIdAtSequenceMs", 0, function(e, t) {
    return !Number.isFinite(t) || t < 0 ? null : e.captionClips.find(e => t >= e.placedStartMs && t < e.placedEndMs)?.captionId ?? null
  }, "buildNleSequenceSchedule", 0, e8, "nleSequenceScheduleInputKey", 0, function(e) {
    return e5(e).inputHash
  }, "remapSequencePlayheadMs", 0, e4, "sequenceMsAtSourceMs", 0, e3, "sourceMsAtSequenceMs", 0, e2, "videoSpanAtSequenceMs", 0, e6], 18081);
  var e9 = e.i(53065),
    e7 = e.i(86682);

  function te(e) {
    return "project-edit-graph-v1" === e.schemaVersion
  }
  async function tt(e) {
    if (!(0, s.isTauri)()) throw Error("project_caption_mutation_desktop_required");
    if (!e.projectId || !e.jobId || !/^terminal:[0-9a-f]{64}$/.test(e.expectedTerminalGenerationId) || !/^sha256:[0-9a-f]{64}$/.test(e.expectedGraphHash) || !/^(0|[1-9][0-9]*)$/.test(e.expectedRevision) || 0 === e.captions.length || new Set(e.captions.map(e => e.captionId)).size !== e.captions.length) throw Error("project caption mutation request is invalid");
    let t = await (0, e7.invoke)("mutate_engine_vnext_project_captions", {
        request: e
      }),
      i = await (0, d.validateProjectPlaybackGraph)(t.graph),
      n = (0, e9.normalizeProjectMutationReceipt)(t.receipt);
    if (!te(i) || "terminal-readiness-receipt-v3" !== n.authoritySchemaVersion || n.projectId !== e.projectId || n.jobId !== e.jobId || n.playbackGenerationId !== i.generationId || n.graphHash !== i.graphHash || n.editRevision !== i.editRevision || n.assetManifestHash !== i.assetManifestHash || n.captionSetHash !== i.captionSetHash) throw Object.assign(Error("caption mutation authority mismatch"), {
      code: "project_caption_mutation_authority_mismatch"
    });
    return {
      graph: i,
      receipt: n
    }
  }
  let ti = null,
    tn = new Map,
    ta = new Map,
    tr = 0;
  async function to(e, t) {
    let i = (ta.get(e) ?? Promise.resolve()).catch(() => void 0).then(t);
    ta.set(e, i);
    try {
      await i
    } finally {
      ta.get(e) === i && ta.delete(e)
    }
  }

  function ts(e) {
    if (e && "object" == typeof e) {
      let t = "code" in e ? e.code : "message" in e ? e.message : null;
      if ("string" == typeof t && /^[a-z][a-z0-9_]+$/.test(t)) return t
    }
    if ("string" == typeof e) {
      if (/^[a-z][a-z0-9_]+$/.test(e)) return e;
      try {
        let t = JSON.parse(e);
        if ("string" == typeof t.code) return t.code
      } catch {}
    }
    return null
  }

  function tl(e) {
    let t = e8(e);
    return {
      nleDocument: e,
      exportLayers: e.overlays,
      outputDuration: t.durationMs / 1e3,
      dubbingTimeline: "fixed_voice_speed" === e.playback.timingMode ? {
        mode: "fixed_voice_speed",
        requestedVoiceRateTenths: e.playback.requestedVoiceRateTenths
      } : {
        mode: "source_timeline"
      },
      originalAudioStrategy: "muted" === e.playback.sourceAudioMode ? "mute_original" : "separated_background" === e.playback.sourceAudioMode ? "separate_background" : "mix_original",
      originalAudioVolume: e.playback.originalVolume
    }
  }
  async function td(e, t, i, n) {
    let a = i().videos.find(t => t.id === e)?.nleDocument;
    if (!a) throw Error("nle_document_reprocess_required");
    for (let i = 0; i < 2; i += 1) try {
      let i = await (0, r.mutateEngineVnextNleDocument)({
        projectId: e,
        expectedRevision: a.revision,
        mutation: t
      });
      return n(t => ({
        videos: (0, v.updateVideoInList)(t.videos, e, tl(i))
      })), i
    } catch (t) {
      if (0 !== i || "nle_document_revision_stale" !== ts(t)) throw t;
      a = await (0, ez.hydrateNleProject)(e), n(t => ({
        videos: (0, v.updateVideoInList)(t.videos, e, tl(a))
      }))
    }
    throw Error("nle_document_revision_stale")
  }

  function tu(e, t, i) {
    let n = tn.get(e);
    if (n) return n;
    let a = null,
      r = Promise.resolve("ready_paused"),
      o = (0, eZ.createProjectTimingModeCoordinator)({
        hasActiveExport: () => t().tasks.some(t => t.videoId === e && "export" === t.type && ("pending" === t.status || "processing" === t.status)),
        resolveVisual: () => (0, e9.resolveProjectVisualBeforeTimingMutation)(e),
        stop: () => {
          let t = (0, e9.getProjectPreviewRuntimeOwner)(e);
          if (!t) throw Error("project_preview_runtime_missing");
          t.stop()
        },
        createDraft: async i => {
          let n = t().videos.find(t => t.id === e),
            a = eB.useTerminalProjectStore.getState().active;
          if (!n || !a || a.projectId !== e) throw Error("project_timing_authority_missing");
          return {
            intent: i,
            projection: a,
            video: n
          }
        },
        validateDraft: async e => e,
        promote: async t => ({
          draft: t,
          result: await (0, e9.promoteProjectTimingMutation)({
            projectId: e,
            jobId: t.video.processingSession?.job_id ?? t.video.cuePreviewJobId ?? "",
            expectedTerminalGenerationId: t.projection.generationId,
            expectedAuthority: {
              generationId: t.projection.playbackGenerationId,
              graphHash: t.projection.graphHash,
              transportProjectionHash: t.projection.transportProjectionHash,
              audioScheduleHash: t.projection.audioScheduleHash,
              visualSnapshotHash: t.projection.visualSnapshotHash
            },
            customerMutationRevision: (0, e9.nextProjectAuthorityRevision)(e),
            mode: t.intent
          })
        }),
        hydrate: async e => e.result.graph,
        commit: (t, n) => {
          var r, o;
          let s, l, u, c, p = (r = n.draft, s = (o = n.result).graph, l = o.receipt, u = eh.useSubtitleStore.getState().subtitles.filter(e => e.videoId === r.video.id), c = (0, d.projectPlaybackCaptionsToSubtitles)(r.video.id, s, u), {
            projectId: r.video.id,
            generationId: l.terminalGenerationId,
            snapshotHash: l.terminalSnapshotHash,
            timingAuthority: s.timingAuthority,
            audioGenerationId: l.audioGenerationId,
            playbackGenerationId: s.generationId,
            graphHash: s.graphHash,
            transportProjectionHash: s.transportProjectionHash,
            audioScheduleHash: s.audioScheduleHash,
            visualSnapshotHash: s.visualSnapshotHash,
            graph: s,
            subtitles: c,
            renderSubtitles: c
          });
          if (!eB.useTerminalProjectStore.getState().promoteTiming(e, n.draft.projection.generationId, n.draft.projection.graphHash, p)) throw Object.assign(Error("timing promotion was superseded"), {
            code: "project_playback_mutation_superseded"
          });
          a = t;
          let g = n.result.receipt,
            h = n.result.mode,
            m = "source_timeline" === h.mode ? {
              state: "unapplied"
            } : {
              state: "applied",
              targetTempoTenths: h.requestedVoiceRateTenths,
              generationId: t.generationId,
              logicalPlanHash: t.transportProjectionHash
            };
          i(i => ({
            videos: (0, v.updateVideoInList)(i.videos, e, {
              outputDuration: Number(n.result.outputDurationMs) / 1e3,
              exportLayers: t.visuals.exportLayers.map(e => e.layer),
              nativeProjectReadiness: {
                readyForEdit: !0,
                timelineGeneration: t.generationId,
                timelineStateHash: t.transportProjectionHash,
                tempoState: m,
                exportState: {
                  state: "needs_export"
                },
                audioGenerationId: t.projectAudio.audioGenerationId,
                timingAuthority: t.timingAuthority
              },
              projectTempoMarkerCueIds: [],
              activeTerminalGeneration: g.terminalGenerationId,
              terminalAdmission: (0, eU.readyTerminalAdmissionFromMutation)(g)
            }),
            ...i.activeVideoId === e ? {
              currentTime: 0,
              isPlaying: !1
            } : {}
          }))
        },
        reload: () => {
          let t = (0, e9.getProjectPreviewRuntimeOwner)(e);
          if (!t || !a) throw Error("project_preview_runtime_missing");
          r = t.reloadTimingGraph(a)
        },
        seekZero: () => void 0,
        autoplay: async () => await r === "playing",
        notice: () => void 0
      });
    return tn.set(e, o), o
  }
  async function tc(e, t, i) {
    try {
      let n = await t().hydrateEditorContent(e),
        a = t().videos.find(t => t.id === e),
        r = a?.activeTerminalGeneration;
      if ("ready" !== n || !a || !r || i && r !== i || !(0, eU.canOpenTerminalProject)(a) || !eB.useTerminalProjectStore.getState().activatePrepared(e, r)) throw Object.assign(Error("terminal tempo projection could not be activated"), {
        code: "project_tempo_terminal_activation_failed",
        fallbackAllowed: !1
      });
      return !0
    } catch (i) {
      throw eB.useTerminalProjectStore.getState().clear(e), t().updateVideo(e, {
        terminalAdmission: void 0,
        activeTerminalGeneration: void 0
      }), i
    }
  }

  function tp(e) {
    let t = {
      ...e
    };
    return t.projectRoot && t.nleDocument && (t.nleDocumentAvailable = !0, delete t.nleDocument), delete t.terminalAdmission, delete t.activeTerminalGeneration, t
  }
  let tg = null,
    th = null,
    tm = null,
    tf = null,
    t_ = (() => {
      let e = (0, i.createJSONStorage)(() => (0, n.createLegacyStorage)(() => localStorage, {
        "dichvideo-video-session": ["video-glm-video-session"]
      }));
      if (e) return {
        getItem: t => e.getItem(t),
        setItem: (t, i) => {
          i.state === th || (tf = i.state, null === tm && (tm = setTimeout(() => {
            tm = null;
            let i = tf;
            if (tf = null, i && i !== th) try {
              e.setItem(t, {
                state: i
              }), th = i
            } catch (e) {
              console.warn("video session persist failed:", e)
            }
          }, 150)))
        },
        removeItem: t => (null !== tm && (clearTimeout(tm), tm = null), tf = null, th = null, e.removeItem(t))
      }
    })(),
    tv = (0, t.create)()((0, i.persist)((e, t) => ({
      videos: [],
      activeVideoId: null,
      dashboardDraftVideoIds: [],
      tasks: [],
      currentTime: 0,
      previewSeekRequest: null,
      isPlaying: !1,
      volume: 1,
      playbackRate: 1,
      enginePreference: b.DEFAULT_ENGINE_PREFERENCE,
      projectHistoryHydrationState: "idle",
      syncProjectHistoryFromManifests: async () => {
        if ("hydrating" === t().projectHistoryHydrationState && ti) return ti;
        let i = Promise.resolve();
        return ti = i = (async () => {
          e({
            projectHistoryHydrationState: "hydrating"
          });
          try {
            await (0, l.syncProjectHistoryFromManifestsJob)({
              get: t,
              set: e
            }), e({
              projectHistoryHydrationState: "ready"
            })
          } catch (t) {
            throw e({
              projectHistoryHydrationState: "failed"
            }), t
          } finally {
            ti === i && (ti = null)
          }
        })(), i
      },
      refreshTerminalAdmission: async i => {
        let n = t().videos.find(e => e.id === i);
        if (!n) return "locked";
        let a = await (0, eU.inspectTerminalProjectAdmission)(n, async e => (0, s.isTauri)() ? (0, r.inspectEngineVnextTerminalProject)(e) : {
          state: "locked",
          projectId: e.projectId,
          jobId: e.jobId,
          recovery: {
            stage: "terminal_project_desktop_required",
            missingArtifactCount: 0
          }
        });
        return e(e => ({
          videos: (0, v.updateVideoInList)(e.videos, i, {
            terminalAdmission: a,
            activeTerminalGeneration: "ready" === a.state ? a.generationId : void 0
          })
        })), a.state
      },
      hydrateEditorContent: async i => {
        let n = t().videos.find(e => e.id === i);
        if (!n) return "locked";
        let a = null,
          o = await eq(n, {
            inspect: async e => a = (0, s.isTauri)() ? await (0, r.inspectEngineVnextTerminalProject)(e) : {
              state: "locked",
              projectId: e.projectId,
              jobId: e.jobId,
              recovery: {
                stage: "terminal_project_desktop_required",
                missingArtifactCount: 0
              }
            },
            loadProjection: async (e, t) => {
              let i = await (0, r.hydrateEngineVnextProjectPlaybackGraph)({
                  projectId: t.projectId,
                  jobId: t.jobId,
                  terminalGenerationId: t.generationId,
                  terminalSnapshotHash: t.snapshotHash,
                  timingAuthority: t.timingAuthority,
                  playbackGenerationId: t.playbackGenerationId,
                  graphHash: t.graphHash,
                  transportProjectionHash: t.transportProjectionHash,
                  audioScheduleHash: t.audioScheduleHash,
                  visualSnapshotHash: t.visualSnapshotHash,
                  audioGenerationId: t.audioGenerationId,
                  captionSetHash: t.captionSetHash,
                  ...t.artifactMembershipHash ? {
                    artifactMembershipHash: t.artifactMembershipHash
                  } : {},
                  ..."terminal-readiness-receipt-v3" === t.authoritySchemaVersion ? {
                    authoritySchemaVersion: t.authoritySchemaVersion,
                    editRevision: t.editRevision,
                    assetManifestHash: t.assetManifestHash
                  } : {}
                }),
                n = await (0, N.buildVideoSubtitleArtifactProjection)(e),
                a = (0, d.projectPlaybackCaptionsToSubtitles)(e.id, i, n.subtitles);
              return {
                projectId: t.projectId,
                generationId: t.generationId,
                snapshotHash: t.snapshotHash,
                timingAuthority: t.timingAuthority,
                audioGenerationId: t.audioGenerationId,
                playbackGenerationId: t.playbackGenerationId,
                graphHash: t.graphHash,
                transportProjectionHash: t.transportProjectionHash,
                audioScheduleHash: t.audioScheduleHash,
                visualSnapshotHash: t.visualSnapshotHash,
                graph: i,
                subtitles: a,
                renderSubtitles: a
              }
            },
            commit: (t, i) => {
              eh.useSubtitleStore.getState().replaceTerminalProjectSubtitles(t.projectId, t.subtitles, t.renderSubtitles), eB.useTerminalProjectStore.getState().prepare(t), e(e => ({
                videos: e.videos.map(e => e.id === t.projectId ? {
                  ...e,
                  ...(0, eU.projectVideoPatchFromHydratedProjection)(e, t, i)
                } : e)
              }))
            },
            persist: () => (0, V.persistLatestProjectManifest)(i, t, {
              artifact: "terminal_project_hydration"
            })
          });
        return "ready" !== o && a && e(e => ({
          videos: (0, v.updateVideoInList)(e.videos, i, {
            terminalAdmission: a ?? void 0,
            activeTerminalGeneration: void 0
          })
        })), o
      },
      openTerminalProject: async i => {
        let n = await t().hydrateEditorContent(i),
          a = t().videos.find(e => e.id === i);
        return "ready" === n && !!a && !!(0, eU.canOpenTerminalProject)(a) && !!a.activeTerminalGeneration && !!eB.useTerminalProjectStore.getState().activatePrepared(a.id, a.activeTerminalGeneration) && (e({
          activeVideoId: a.id
        }), ep.useAppStore.getState().setCurrentView("editor"), !0)
      },
      openNleProject: async i => {
        let n = t().videos.find(e => e.id === i);
        if (!n || "completed" !== n.status) return !1;
        try {
          let a = await (0, ez.hydrateNleProject)(i),
            l = n.projectAudioPreviewCarrierPath,
            d = !1;
          if ((0, s.isTauri)() && eK({
              sourceAudioMode: a.playback.sourceAudioMode,
              verifiedBackgroundCarrierPath: l
            })) {
            let e = await (0, r.separateEngineVnextNleBackground)({
              projectId: i,
              expectedRevision: a.revision
            });
            a = e.document, l = e.previewCarrierPath, d = !0
          }
          let u = (0, ez.nleCaptionsToSubtitles)(i, a),
            c = "fixed_voice_speed" === a.playback.timingMode ? {
              mode: "fixed_voice_speed",
              requestedVoiceRateTenths: a.playback.requestedVoiceRateTenths
            } : {
              mode: "source_timeline"
            },
            p = "muted" === a.playback.sourceAudioMode ? "mute_original" : "separated_background" === a.playback.sourceAudioMode ? "separate_background" : "mix_original",
            g = {
              nleDocument: a,
              exportLayers: a.overlays,
              dubbingTimeline: c,
              originalAudioStrategy: p,
              originalAudioVolume: a.playback.originalVolume,
              projectAudioPreviewCarrierPath: l
            };
          e(e => ({
            videos: (0, v.updateVideoInList)(e.videos, i, g),
            activeVideoId: i,
            currentTime: 0,
            isPlaying: !1
          })), eh.useSubtitleStore.getState().setGlobalStyleForNewVideos(a.subtitleStyle), eh.useSubtitleStore.getState().replaceVideoSubtitles(i, u), d && await (0, V.persistLatestProjectManifest)(i, t).catch(async () => {
            await (0, o.appendAppLog)("warn", `[history:${i}] Recovered NLE background carrier could not be persisted.`).catch(() => void 0)
          });
          let h = t().videos.find(e => e.id === i);
          if (!(0, ez.canOpenNleProject)(h)) {
            let e = Error("nle_document_invalid");
            throw e.code = "nle_document_invalid", e
          }
          return ep.useAppStore.getState().setCurrentView("editor"), !0
        } catch (a) {
          let e = ts(a) ?? "nle_document_invalid",
            t = (0, ez.nleDocumentDiagnosticToken)(a);
          if (await (0, o.appendAppLog)("warn", `[history:${i}] NLE project open failed code=${e}${t?` diagnostic=${t}`:""}`).catch(() => void 0), a && "object" == typeof a && "code" in a) throw a;
          let n = Error(e);
          throw n.code = e, n
        }
      },
      activateMutatedTerminalProject: (e, i) => tc(e, t, i),
      addVideo: t => {
        let i = (0, a.generateId)();
        (0, x.applyPresetSubtitleStyleForNewVideo)();
        let n = {
          ...t,
          id: i,
          status: "idle",
          addedAt: new Date,
          exportLayers: t.exportLayers ?? (0, x.getPresetExportLayersForNewVideo)()
        };
        return e(e => ({
          videos: (0, v.appendVideoToList)(e.videos, n),
          activeVideoId: (0, v.activeVideoIdAfterAppend)(e.activeVideoId, i, !1)
        })), i
      },
      addVideoFromFile: async (i, n) => (0, S.addVideoFromFileJob)({
        filePath: i,
        queueVideoIds: n?.queueVideoIds,
        get: t,
        set: e
      }),
      addDashboardDraftVideoIds: t => e(e => ({
        dashboardDraftVideoIds: (0, v.appendDashboardDraftVideoIds)(e.dashboardDraftVideoIds, t)
      })),
      removeDashboardDraftVideoId: t => e(e => ({
        dashboardDraftVideoIds: (0, v.removeDashboardDraftVideoId)(e.dashboardDraftVideoIds, t)
      })),
      clearDashboardDraftVideoIds: () => e({
        dashboardDraftVideoIds: []
      }),
      removeVideo: t => {
        eB.useTerminalProjectStore.getState().clear(t), e(e => ({
          ...(0, v.removeVideoFromStoreState)({
            videos: e.videos,
            activeVideoId: e.activeVideoId
          }, t),
          dashboardDraftVideoIds: (0, v.removeDashboardDraftVideoId)(e.dashboardDraftVideoIds, t)
        }))
      },
      deleteVideoProject: async (i, n) => {
        let a = await (0, u.deleteVideoProjectJob)({
          videoId: i,
          options: n,
          get: t,
          set: e
        });
        return eB.useTerminalProjectStore.getState().clear(i), a
      },
      exportSupportBundle: async e => (0, y.exportSupportBundleJob)({
        videoId: e,
        get: t
      }),
      setActiveVideo: t => e({
        activeVideoId: t
      }),
      updateVideoStatus: (t, i) => e(e => ({
        videos: (0, v.updateVideoStatusInList)(e.videos, t, i)
      })),
      setVideoProcessingError: (t, i, n, a) => e(e => ({
        videos: (0, v.setVideoProcessingErrorInList)(e.videos, t, i, n, a)
      })),
      updateVideo: (t, i) => e(e => ({
        videos: (0, v.updateVideoInList)(e.videos, t, i)
      })),
      cancelVideoProcessing: async (i, n = "Đã dừng xử lý video.") => (0, I.cancelVideoProcessingJob)({
        videoId: i,
        reason: n,
        get: t,
        set: e
      }),
      pauseVideoProcessing: async (i, n = "Đã tạm dừng xử lý video.") => (0, I.pauseVideoProcessingJob)({
        videoId: i,
        reason: n,
        get: t,
        set: e
      }),
      clearTtsForVideo: t => e(e => ({
        videos: (0, p.clearTtsArtifactsForVideo)(e.videos, t)
      })),
      clearTtsForSubtitle: (t, i) => e(e => ({
        videos: (0, p.clearTtsArtifactForSubtitle)(e.videos, t, i)
      })),
      markEditedSubtitleTtsDirty: (t, i) => e(e => ({
        videos: (0, p.markEditedSubtitleTtsArtifactsDirty)(e.videos, t, i)
      })),
      setNleCaptionExcluded: async (i, n, a) => {
        await td(i, {
          kind: "set_caption_excluded",
          captionId: n,
          excluded: a
        }, t, e)
      },
      commitProjectCaptionText: async i => {
        await to(i, async () => {
          let n = t().videos.find(e => e.id === i);
          if (n?.nleDocument) {
            let a = new Map(eh.useSubtitleStore.getState().subtitles.filter(e => e.videoId === i).map(e => [e.id, e.translatedText])),
              r = n.nleDocument.captions.filter(e => a.has(e.captionId) && a.get(e.captionId) !== e.translatedText);
            r.length > 0 && (e(e => ({
              videos: (0, p.markEditedSubtitleTtsArtifactsDirty)(e.videos, i, r.map(e => e.captionId))
            })), 1 === r.length ? await td(i, {
              kind: "update_caption_text",
              captionId: r[0].captionId,
              translatedText: a.get(r[0].captionId)
            }, t, e) : await td(i, {
              kind: "update_captions_text",
              updates: r.map(e => ({
                captionId: e.captionId,
                translatedText: a.get(e.captionId)
              }))
            }, t, e), await (0, V.persistLatestProjectManifest)(i, t, {
              artifact: "nle_project_caption_mutation"
            }));
            return
          }
          let a = eB.useTerminalProjectStore.getState().active;
          if (!n || !a || a.projectId !== i || !te(a.graph)) return;
          let r = new Map(eh.useSubtitleStore.getState().subtitles.filter(e => e.videoId === i).map(e => [e.id, e.translatedText])),
            o = a.graph.captions.filter(e => r.has(e.captionId) && r.get(e.captionId) !== e.translatedText).map(e => e.captionId);
          o.length > 0 && e(e => ({
            videos: (0, p.markEditedSubtitleTtsArtifactsDirty)(e.videos, i, o)
          }));
          try {
            let o = await tt({
                projectId: i,
                jobId: n.processingSession?.job_id ?? n.cuePreviewJobId ?? "",
                expectedTerminalGenerationId: a.generationId,
                expectedGraphHash: a.graphHash,
                expectedRevision: a.graph.editRevision,
                captions: a.graph.captions.map(e => ({
                  captionId: e.captionId,
                  translatedText: r.get(e.captionId) ?? e.translatedText
                }))
              }),
              s = o.graph,
              l = (0, d.projectPlaybackCaptionsToSubtitles)(i, s, eh.useSubtitleStore.getState().subtitles.filter(e => e.videoId === i)),
              u = {
                projectId: i,
                generationId: o.receipt.terminalGenerationId,
                snapshotHash: o.receipt.terminalSnapshotHash,
                timingAuthority: s.timingAuthority,
                audioGenerationId: o.receipt.audioGenerationId,
                playbackGenerationId: s.generationId,
                graphHash: s.graphHash,
                transportProjectionHash: s.transportProjectionHash,
                audioScheduleHash: s.audioScheduleHash,
                visualSnapshotHash: s.visualSnapshotHash,
                graph: s,
                subtitles: l,
                renderSubtitles: l
              };
            if (!eB.useTerminalProjectStore.getState().promoteTiming(i, a.generationId, a.graphHash, u)) throw Object.assign(Error("caption promotion was superseded"), {
              code: "project_caption_mutation_superseded"
            });
            eh.useSubtitleStore.getState().replaceTerminalProjectSubtitles(i, l, l), e(e => ({
              videos: (0, v.updateVideoInList)(e.videos, i, {
                activeTerminalGeneration: o.receipt.terminalGenerationId,
                terminalAdmission: (0, eU.readyTerminalAdmissionFromMutation)(o.receipt)
              })
            })), await (0, V.persistLatestProjectManifest)(i, t, {
              artifact: "terminal_project_caption_mutation"
            })
          } catch (a) {
            let e = await t().hydrateEditorContent(i),
              n = t().videos.find(e => e.id === i);
            throw "ready" === e && n?.activeTerminalGeneration && eB.useTerminalProjectStore.getState().activatePrepared(i, n.activeTerminalGeneration), a
          }
        })
      },
      invalidateTtsTimelineForVideo: t => e(e => ({
        videos: (0, p.invalidateTtsTimelineArtifactForVideo)(e.videos, t)
      })),
      setCurrentTime: t => e({
        currentTime: t
      }),
      requestPreviewSeek: t => {
        let i = Math.max(0, Number.isFinite(t) ? t : 0);
        e({
          currentTime: i,
          previewSeekRequest: {
            requestId: tr += 1,
            outputSeconds: i
          }
        })
      },
      acknowledgePreviewSeek: t => e(e => e.previewSeekRequest?.requestId === t ? {
        previewSeekRequest: null
      } : {}),
      setIsPlaying: t => e({
        isPlaying: t
      }),
      setVolume: t => e({
        volume: t
      }),
      setPlaybackRate: t => e({
        playbackRate: t
      }),
      setEnginePreference: t => e(e => ({
        enginePreference: (0, b.normalizeEnginePreference)({
          ...e.enginePreference,
          ...t
        })
      })),
      addTask: t => {
        let i = (0, a.generateId)();
        return e(e => ({
          tasks: (0, g.appendProcessingTask)(e.tasks, t, i)
        })), i
      },
      updateTask: (t, i) => e(e => ({
        tasks: (0, g.updateProcessingTask)(e.tasks, t, i)
      })),
      removeTask: t => e(e => ({
        tasks: (0, g.removeProcessingTask)(e.tasks, t)
      })),
      getActiveVideo: () => {
        let e = t();
        return (0, v.activeVideoFromList)(e.videos, e.activeVideoId)
      },
      runFullPipeline: async (e, i, n, a, r) => {
        let s = await (0, w.getDesktopProcessingVideo)({
          videoId: e,
          get: t
        });
        if (!s) return;
        await eG({
          videoId: e,
          video: s,
          sourceLang: i,
          targetLang: n,
          includeTts: r?.includeTts ?? !0,
          ttsProvider: r?.ttsProvider,
          processingMode: r?.processingMode,
          translationStyleOverride: r?.translationStyle,
          sonitranslateSettingsOverride: r?.sonitranslateSettings,
          dubbingTimelineOverride: r?.dubbingTimeline,
          dubbingTimelineIntent: r?.dubbingTimelineIntent,
          authorizationRequestIdempotencyKey: r?.authorizationRequestIdempotencyKey,
          subtitleSource: r?.subtitleSource,
          get: t
        });
        let l = t().videos.find(t => t.id === e);
        if ((0, ez.canOpenNleProject)(l)) {
          if (t().activeVideoId === e && "editor" === ep.useAppStore.getState().currentView) try {
            await t().openNleProject(e)
          } catch (i) {
            let t = ts(i) ?? "nle_document_invalid";
            await (0, o.appendAppLog)("warn", `[pipeline:${e}] Completed NLE could not refresh the active Editor. reason=${t}`).catch(() => void 0)
          }
        } else await t().refreshTerminalAdmission(e)
      },
      runGpuFastSubtitlePipeline: async (e, i, n) => {
        let a = await (0, w.getDesktopProcessingVideo)({
          videoId: e,
          get: t
        });
        a && await (0, P.runGpuFastSubtitlePipelineJob)({
          videoId: e,
          video: a,
          sourceLang: i,
          targetLang: n,
          get: t
        })
      },
      runDubbingPipeline: async (e, i) => {
        await (0, w.getDesktopProcessingVideo)({
          videoId: e,
          get: t
        }) && await (0, _.runDubbingPipelineJob)({
          videoId: e,
          config: i,
          get: t
        })
      },
      generateTtsForActiveSubtitles: async (e, i, n, a, r = 1, o = 1, s = 1, l = {}) => (0, h.runTtsGenerationJob)({
        videoId: e,
        voice: i,
        engine: n,
        language: a,
        speed: r,
        pitch: o,
        volume: s,
        options: l,
        get: t
      }),
      refreshNativeTtsForEditedSubtitles: async (e, i) => {
        let n = t().videos.find(t => t.id === e);
        if (!n) throw Error("Video not found for edited subtitle TTS refresh.");
        if (!(0, s.isTauri)()) throw Error("Tạo lại âm thanh cần chạy trong bản desktop.");
        if (await (0, T.ensureSourceVideoAvailableForProcessing)(n, () => t().updateVideo(e, {
            sourceMissing: !0
          })), n.nleDocument && (await t().commitProjectCaptionText(e), !(n = t().videos.find(t => t.id === e)))) throw Error("Video not found after NLE caption commit.");
        return (0, f.runEditedSubtitleTtsRefreshJob)({
          videoId: e,
          video: n,
          get: t,
          captionIds: i
        })
      },
      buildTtsTimelineForVideo: async e => (0, m.runTtsTimelineJob)({
        videoId: e,
        get: t
      }),
      applyProjectTempo: async (i, n) => {
        let a = t().videos.find(e => e.id === i);
        if (a?.nleDocument) {
          let r = e8(a.nleDocument),
            o = t(),
            s = Math.round(Math.max(0, 1e3 * o.currentTime)),
            l = o.isPlaying,
            d = e8(await td(i, {
              kind: "commit_playback",
              timingMode: "fixed_voice_speed",
              requestedVoiceRateTenths: n,
              markerCueIds: a.nleDocument.playback.markerCueIds
            }, t, e));
          e({
            currentTime: e4(r, d, s) / 1e3,
            isPlaying: l
          });
          return
        }
        await tu(i, t, e).change({
          mode: "fixed_voice_speed",
          requestedVoiceRateTenths: n
        }), await (0, V.persistLatestProjectManifest)(i, t)
      },
      restoreProjectSource: async i => {
        let n = t().videos.find(e => e.id === i);
        if (n?.nleDocument) {
          let a = e8(n.nleDocument),
            r = t(),
            o = Math.round(Math.max(0, 1e3 * r.currentTime)),
            s = r.isPlaying,
            l = e8(await td(i, {
              kind: "commit_playback",
              timingMode: "source_timeline",
              requestedVoiceRateTenths: 10,
              markerCueIds: n.nleDocument.playback.markerCueIds
            }, t, e));
          e({
            currentTime: e4(a, l, o) / 1e3,
            isPlaying: s
          });
          return
        }
        await tu(i, t, e).change({
          mode: "source_timeline"
        }), await (0, V.persistLatestProjectManifest)(i, t)
      },
      readSeriesBatchStamps: async i => {
        let n = t().videos.find(e => e.id === i);
        if (!n || "srt_audio" === n.projectType) throw Error("series_batch_template_unavailable");
        let a = await (0, eQ.resolveSeriesBatchStampSnapshot)(n, async () => {
          let t = await (0, ez.hydrateNleProject)(i);
          return e(e => ({
            videos: (0, v.updateVideoInList)(e.videos, i, tl(t))
          })), t
        });
        return (0, s.isTauri)() && (a.overlays = await (0, eJ.sealExportDesignPresetLayers)(i, a.overlays)), structuredClone(a)
      },
      applySeriesBatchStamps: async (i, n) => {
        let a = t().videos.find(e => e.id === i);
        if (!a || "srt_audio" === a.projectType) return;
        let o = (0, eJ.cloneExportDesignPresetLayers)(n.overlays ?? []);
        if ((0, s.isTauri)()) {
          let e = [];
          for (let t of o) {
            if ("image" !== t.type) {
              e.push(t);
              continue
            }
            try {
              e.push(...await (0, eJ.sealExportDesignPresetLayers)(i, [t]))
            } catch {
              console.warn(`Series batch optional image skipped: ${t.id}`)
            }
          }
          o = e
        }
        if (!a.nleDocument && "completed" === a.status) try {
          let n = await (0, ez.hydrateNleProject)(i);
          e(e => ({
            videos: (0, v.updateVideoInList)(e.videos, i, tl(n))
          })), a = t().videos.find(e => e.id === i) ?? a
        } catch {}
        if ((a = t().videos.find(e => e.id === i) ?? a).nleDocument) {
          let l = a.nleDocument;
          await td(i, (0, eQ.buildSeriesBatchVisualMutation)({
            ...n,
            overlays: o
          }, l), t, e);
          let d = t().videos.find(e => e.id === i)?.nleDocument;
          if (!d) throw Error("nle_document_reprocess_required");
          let u = t().videos.find(e => e.id === i),
            c = (0, eQ.buildSeriesBatchAudioPlan)(n, d, u?.projectAudioPreviewCarrierPath);
          if (c.requiresBackgroundSeparation && (0, s.isTauri)()) {
            let t = await (0, r.separateEngineVnextNleBackground)({
              projectId: i,
              expectedRevision: d.revision
            });
            e(e => ({
              videos: (0, v.updateVideoInList)(e.videos, i, {
                ...tl(t.document),
                projectAudioPreviewCarrierPath: t.previewCarrierPath
              })
            }))
          }
          c.mutation && await td(i, c.mutation, t, e)
        } else e(e => ({
          videos: (0, v.updateVideoInList)(e.videos, i, {
            exportLayers: (0, eQ.mergeSeriesBatchStampOverlays)(o)
          })
        }));
        void 0 !== n.nativeTtsVoice && e(e => ({
          videos: (0, v.updateVideoInList)(e.videos, i, {
            nativeTtsVoice: n.nativeTtsVoice || void 0
          })
        })), n.subtitleStyle && eh.useSubtitleStore.getState().applyVideoSubtitleStyle(i, n.subtitleStyle, t().activeVideoId === i);
        try {
          if ("fixed_voice_speed" === n.timingMode && (0, eY.isProjectTempoTenths)(n.requestedVoiceRateTenths)) await t().applyProjectTempo(i, n.requestedVoiceRateTenths);
          else if ("source_timeline" === n.timingMode) {
            let e = t().videos.find(e => e.id === i)?.nleDocument?.playback;
            e?.timingMode === "fixed_voice_speed" && await t().restoreProjectSource(i)
          }
        } catch (e) {
          console.warn("Series batch optional tempo skipped:", e)
        }
        await (0, V.persistLatestProjectManifest)(i, t)
      }
    }), {
      name: "dichvideo-video-session",
      storage: t_,
      partialize: function(e) {
        let t = tg;
        if (t && t.input.videos === e.videos && t.input.activeVideoId === e.activeVideoId && t.input.dashboardDraftVideoIds === e.dashboardDraftVideoIds && t.input.volume === e.volume && t.input.enginePreference === e.enginePreference) return t.payload;
        let i = {
          videos: e.videos.map(tp),
          activeVideoId: e.activeVideoId,
          dashboardDraftVideoIds: e.dashboardDraftVideoIds,
          volume: e.volume,
          enginePreference: (0, b.normalizeEnginePreference)(e.enginePreference)
        };
        return tg = {
          input: {
            videos: e.videos,
            activeVideoId: e.activeVideoId,
            dashboardDraftVideoIds: e.dashboardDraftVideoIds,
            volume: e.volume,
            enginePreference: e.enginePreference
          },
          payload: i
        }, i
      },
      merge: (e, t) => {
        let i = (e?.videos ?? []).map(e => ({
          ...(0, c.toVideoFile)(e),
          terminalAdmission: void 0,
          activeTerminalGeneration: void 0
        }));
        return {
          ...t,
          ...e,
          videos: i,
          dashboardDraftVideoIds: (0, v.filterDashboardDraftVideoIdsForVideos)(e?.dashboardDraftVideoIds ?? [], i),
          enginePreference: (0, b.normalizeEnginePreference)(e?.enginePreference),
          tasks: t.tasks,
          currentTime: t.currentTime,
          isPlaying: t.isPlaying,
          playbackRate: t.playbackRate,
          projectHistoryHydrationState: t.projectHistoryHydrationState
        }
      }
    }))
}, 44077, 4073, e => {
  "use strict";
  e.s(["applyNativeProcessingSettlements", () => M, "inFlightQueueVideoIds", () => I, "publishQueueTaskProgress", () => N, "useQueueStore", () => H], 44077);
  var t = e.i(68834),
    i = e.i(79473);
  e.i(89268);
  var n = e.i(30797),
    a = e.i(65055),
    r = e.i(65207),
    o = e.i(48868),
    s = e.i(41152),
    l = e.i(1046),
    d = e.i(72428),
    u = e.i(77730),
    c = e.i(17028),
    p = e.i(58450),
    g = e.i(58749),
    h = e.i(97347),
    m = e.i(70631),
    f = e.i(98106),
    _ = e.i(38991);
  e.s(["onSeriesBatchVideoCompleted", () => P, "onSeriesBatchVideoFailed", () => w, "onSeriesBatchVideoStarted", () => T, "useSeriesBatchStore", () => y], 4073);
  var v = e.i(69160),
    b = e.i(87518),
    S = e.i(65991);
  let y = (0, t.create)()((0, i.persist)((e, t) => ({
    dialogOpen: !1,
    panelOpen: !1,
    templateVideoId: null,
    templatePath: "",
    templateName: "",
    outputDir: "",
    autoExport: !1,
    autoExportActive: !1,
    exportBatchIds: [],
    executionSnapshot: null,
    items: [],
    selectedPath: null,
    openDialog: i => {
      let n = t().templateVideoId === i.videoId,
        a = S.useVideoStore.getState().videos.filter(e => e.seriesBatchParentId === i.videoId && e.id !== i.videoId).map(e => ({
          path: e.path,
          name: e.name,
          videoId: e.id,
          kind: "reexport",
          status: "completed" === e.status ? "delivered" : "failed",
          exportStatus: "waiting",
          settingsApplied: !0
        }));
      e({
        dialogOpen: !0,
        templateVideoId: i.videoId,
        templatePath: i.path,
        templateName: i.name,
        selectedPath: i.path,
        items: n && t().items.length > 0 ? t().items : a,
        autoExport: !!n && t().autoExport,
        autoExportActive: !1,
        executionSnapshot: n ? t().executionSnapshot : null
      })
    },
    closeDialog: () => e({
      dialogOpen: !1
    }),
    setOutputDir: t => e({
      outputDir: t
    }),
    setAutoExport: t => e({
      autoExport: t
    }),
    setExecutionSnapshot: t => e({
      executionSnapshot: (0, u.cloneQueueExecutionSnapshot)(t)
    }),
    addPaths: i => {
      let {
        templatePath: n,
        items: a
      } = t();
      e({
        items: (0, v.mergeSeriesBatchItems)(a, (0, v.buildSeriesBatchItems)(i, n))
      })
    },
    removePaths: i => {
      let {
        items: n,
        selectedPath: a
      } = t(), r = n.filter(e => i.some(t => (0, v.isSameMediaPath)(t, e.path))), o = n.filter(e => !i.some(t => (0, v.isSameMediaPath)(t, e.path))), s = !!a && !o.some(e => (0, v.isSameMediaPath)(e.path, a));
      for (let t of (e({
          items: o,
          selectedPath: s ? o[0]?.path ?? null : a
        }), r)) {
        let e = S.useVideoStore.getState();
        t.videoId && e.videos.some(e => e.id === t.videoId) && (e.updateVideo(t.videoId, {
          seriesBatchParentId: null
        }), (0, p.persistLatestProjectManifest)(t.videoId, S.useVideoStore.getState).catch(() => {
          console.warn("[series-batch] parent_detach_persist_failed")
        }))
      }
    },
    bindItemVideo: async (i, n, a) => {
      let r = a ?? t().templateVideoId;
      t().templateVideoId === r && e(e => ({
        items: e.items.map(e => (0, v.isSameMediaPath)(e.path, i) ? {
          ...e,
          videoId: n
        } : e)
      }));
      let o = S.useVideoStore.getState();
      r && r !== n && o.videos.some(e => e.id === n) && (o.updateVideo(n, {
        seriesBatchParentId: r
      }), await (0, p.persistLatestProjectManifest)(n, S.useVideoStore.getState).catch(() => {
        console.warn("[series-batch] parent_binding_persist_failed")
      }))
    },
    reconcileLegacyItemVideos: t => e(e => {
      let i = (0, v.reconcileLegacySeriesBatchItemVideoIds)(e.items, t, e.templateVideoId);
      return i === e.items ? e : {
        items: i
      }
    }),
    startUiPreview: () => e({
      dialogOpen: !1,
      panelOpen: !0,
      autoExportActive: t().autoExport
    }),
    closePanel: () => e({
      panelOpen: !1
    }),
    trackExportBatch: t => e(e => !t || e.exportBatchIds.includes(t) ? e : {
      exportBatchIds: [...e.exportBatchIds, t]
    }),
    finishBatch: () => e({
      dialogOpen: !1,
      panelOpen: !1,
      templateVideoId: null,
      templatePath: "",
      templateName: "",
      autoExport: !1,
      autoExportActive: !1,
      exportBatchIds: [],
      executionSnapshot: null,
      items: [],
      selectedPath: null
    }),
    selectPath: t => e({
      selectedPath: t
    }),
    markSettingsApplied: () => e({
      items: t().items.map(e => "skip" === e.kind ? e : {
        ...e,
        settingsApplied: !0
      })
    }),
    markStampApplied: (i, n) => e({
      items: t().items.map(e => "skip" !== e.kind && i.some(t => (0, v.isSameMediaPath)(t, e.path)) ? {
        ...e,
        settingsApplied: !0,
        appliedStampFingerprint: n
      } : e)
    }),
    setItemStatuses: t => e(e => {
      if (0 === t.length) return e;
      let i = !1,
        n = e.items.map(e => {
          let n = t.find(t => (0, v.isSameMediaPath)(t.path, e.path));
          if (!n) return e;
          let a = "running" === n.status ? "waiting" : e.exportStatus;
          return e.status === n.status && e.exportStatus === a ? e : (i = !0, {
            ...e,
            status: n.status,
            exportStatus: a
          })
        });
      return i ? {
        items: n
      } : e
    }),
    setItemExportStatuses: t => e(e => {
      if (0 === t.length) return e;
      let i = !1,
        n = e.items.map(e => {
          let n = t.find(t => t.videoId === e.videoId);
          return n && e.exportStatus !== n.exportStatus ? (i = !0, {
            ...e,
            exportStatus: n.exportStatus
          }) : e
        });
      return i ? {
        items: n
      } : e
    }),
    setItemThumbnails: t => e(e => {
      if (0 === t.length) return e;
      let i = !1,
        n = e.items.map(e => {
          let n = t.find(t => (0, v.isSameMediaPath)(t.path, e.path));
          return n && e.thumbnail !== n.thumbnail ? (i = !0, {
            ...e,
            thumbnail: n.thumbnail
          }) : e
        });
      return i ? {
        items: n
      } : e
    })
  }), {
    name: "dichvideo-series-batch",
    storage: (0, i.createJSONStorage)(() => (0, o.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      panelOpen: e.panelOpen,
      templateVideoId: e.templateVideoId,
      templatePath: e.templatePath,
      templateName: e.templateName,
      outputDir: e.outputDir,
      executionSnapshot: e.executionSnapshot,
      items: e.items,
      selectedPath: e.selectedPath
    }),
    merge: (e, t) => {
      var i, n;
      return {
        ...t,
        panelOpen: e?.panelOpen === !0,
        templateVideoId: "string" == typeof e?.templateVideoId ? e.templateVideoId : null,
        templatePath: "string" == typeof e?.templatePath ? e.templatePath : "",
        templateName: "string" == typeof e?.templateName ? e.templateName : "",
        outputDir: "string" == typeof e?.outputDir ? e.outputDir : "",
        autoExport: !1,
        autoExportActive: !1,
        exportBatchIds: [],
        executionSnapshot: (i = e?.executionSnapshot) && "object" == typeof i && "string" == typeof i.sourceLang && "string" == typeof i.targetLang && "boolean" == typeof i.includeTts && i.translationStyle && "object" == typeof i.translationStyle && i.sonitranslateSettings && "object" == typeof i.sonitranslateSettings && i.dubbingTimeline && "object" == typeof i.dubbingTimeline && "string" == typeof i.createdAt ? (0, u.cloneQueueExecutionSnapshot)(i) : null,
        items: Array.isArray(n = e?.items) ? n.flatMap(e => e && "object" == typeof e && "string" == typeof e.path && 0 !== e.path.trim().length && "string" == typeof e.name ? [(0, v.normalizePersistedSeriesBatchItem)({
          ...e,
          exportStatus: e.exportStatus ?? "waiting"
        })] : []) : [],
        selectedPath: "string" == typeof e?.selectedPath ? e.selectedPath : null
      }
    }
  }));
  async function P(e, t) {
    if (t) {
      await S.useVideoStore.getState().applySeriesBatchStamps(e, t);
      let i = y.getState(),
        n = i.items.find(t => t.videoId === e);
      n && (i.markStampApplied([n.path], (0, v.seriesBatchStampFingerprint)(t)), i.setItemStatuses([{
        path: n.path,
        status: "delivered"
      }]));
      return
    }
    let i = y.getState();
    if (!i.panelOpen || !i.templateVideoId || e === i.templateVideoId) return;
    let n = S.useVideoStore.getState(),
      a = n.videos.find(t => t.id === e),
      r = i.items.find(t => t.videoId === e);
    if (!a || !r || "apply_stamps" !== (0, b.seriesBatchPostProcessAction)(r.kind, "completed")) return;
    let o = n.videos.find(e => e.id === i.templateVideoId);
    if (!o) return void i.setItemStatuses([{
      path: r.path,
      status: "failed"
    }]);
    try {
      let i = S.useVideoStore.getState(),
        n = t ?? await i.readSeriesBatchStamps(o.id),
        a = (0, v.seriesBatchStampFingerprint)(n);
      await i.applySeriesBatchStamps(e, n);
      let s = y.getState();
      s.markStampApplied([r.path], a), s.setItemStatuses([{
        path: r.path,
        status: "delivered"
      }])
    } catch (e) {
      console.error("Series batch post-process stamp apply failed:", e), y.getState().setItemStatuses([{
        path: r.path,
        status: "failed"
      }])
    }
  }

  function T(e) {
    let t = y.getState();
    if (!t.panelOpen || e === t.templateVideoId) return;
    let i = t.items.find(t => t.videoId === e);
    i && "skip" !== i.kind && t.setItemStatuses([{
      path: i.path,
      status: "running"
    }])
  }

  function w(e) {
    let t = y.getState();
    if (!t.panelOpen || e === t.templateVideoId) return;
    let i = t.items.find(t => t.videoId === e);
    i && "fail" === (0, b.seriesBatchPostProcessAction)(i.kind, "error") && t.setItemStatuses([{
      path: i.path,
      status: "failed"
    }])
  }

  function x(e) {
    return "failed" !== e && "done" !== e && "skipped" !== e && "interrupted" !== e && "settlement_pending" !== e
  }

  function I(e) {
    return e.filter(e => x(e.status)).map(e => e.videoId)
  }
  let E = "DichVideo đang hoàn tất trạng thái của lần xử lý trước.";

  function A() {
    return new Date().toISOString()
  }

  function k(e) {
    return `${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`
  }
  let V = null;

  function N(e, t) {
    H.setState(i => ({
      items: i.items.map(i => i.videoId === e && ("preflight" === i.status || "processing" === i.status || "retrying" === i.status) ? {
        ...i,
        ...(0, d.mergeQueueItemProgressFromTask)(i, t),
        ..."error" === t.status ? {
          status: "failed",
          stage: "Lỗi",
          message: t.error ?? t.message,
          errorMessage: t.error ?? t.message
        } : {}
      } : i)
    }))
  }

  function M(e) {
    let t = new Map(e.map(e => [e.projectId, e])),
      i = S.useVideoStore.getState().videos;
    S.useVideoStore.setState({
      videos: i.map(e => {
        let i = t.get(e.id);
        if (!i) return e;
        let n = (0, f.projectSettlementIntoDesktopState)({
          settlement: i,
          video: e
        });
        return {
          ...e,
          ...n.videoPatch
        }
      })
    }), H.setState(e => {
      let n = new Map;
      return {
        items: e.items.map(e => {
          let a = t.get(e.videoId);
          if (!a || "skipped" === e.status) return e;
          let r = i.find(t => t.id === e.videoId),
            o = (0, f.projectSettlementIntoDesktopState)({
              settlement: a,
              video: r,
              queueItem: e
            });
          return n.set(e.id, o), {
            ...e,
            ...o.queueItemPatch,
            completedAt: "settlement_pending" === a.disposition ? e.completedAt : e.completedAt ?? A()
          }
        }),
        runs: e.runs.map(e => {
          if (!e.activeItemId) return e;
          let t = n.get(e.activeItemId);
          return t ? {
            ...e,
            ...t.queueRunPatch,
            completedAt: e.completedAt ?? A()
          } : e
        })
      }
    })
  }

  function L(e) {
    return e.activeRunId ? e.runs.find(t => t.id === e.activeRunId) : void 0
  }

  function C(e, t) {
    try {
      let i = (0, c.sourcePreviewAudioVideoPatchFromQueueSnapshot)(t);
      if (e.originalAudioStrategy === i.originalAudioStrategy && e.originalAudioVolume === i.originalAudioVolume) return !1;
      return S.useVideoStore.getState().updateVideo(e.id, i), !0
    } catch {
      return !1
    }
  }
  async function j(e) {
    try {
      await (0, p.persistLatestProjectManifest)(e, S.useVideoStore.getState)
    } catch {
      await (0, n.appendAppLog)("warn", "[queue] Source preview audio policy could not be persisted into the project manifest.").catch(() => void 0)
    }
  }

  function R(e) {
    let t = [...S.useVideoStore.getState().tasks].reverse().find(t => t.videoId === e.videoId && ("processing" === t.status || "pending" === t.status));
    return t?.progress ?? e.progress
  }

  function D(e) {
    return {
      ...e,
      status: "paused",
      stage: "Đã tạm dừng",
      progress: R(e),
      message: "Đã tạm dừng. Bấm Tiếp tục để xử lý lại, không trừ phút.",
      errorKind: void 0,
      errorMessage: void 0,
      startedAt: void 0
    }
  }

  function F(e) {
    return {
      ...e,
      status: "waiting",
      stage: "Đang chuẩn bị tiếp tục",
      progress: e.progress,
      message: "Đang tiếp tục phần xử lý còn dang dở.",
      errorKind: void 0,
      errorMessage: void 0,
      completedAt: void 0,
      startedAt: void 0
    }
  }
  let H = (0, t.create)()((0, i.persist)((e, t) => ({
    runs: [],
    items: [],
    activeRunId: null,
    enqueueAndStart: async (i, n) => {
      var a;
      let r = S.useVideoStore.getState(),
        o = i.map(e => r.videos.find(t => t.id === e)).filter(e => !!e);
      if (0 === o.length) return;
      let s = t(),
        l = L(s),
        d = (0, u.cloneQueueExecutionSnapshot)(n),
        c = l && ("running" === (a = l.status) || "paused" === a) ? l : {
          id: k("queue_run"),
          status: "running",
          snapshot: (0, u.cloneQueueExecutionSnapshot)(d),
          createdAt: A(),
          startedAt: A()
        },
        p = new Set(s.items.filter(e => e.runId === c.id && "skipped" !== e.status).map(e => e.videoId)),
        g = new Set,
        f = new Set,
        _ = o.filter(e => {
          let t = (0, h.normalizeQueuedSourcePath)(e.path);
          return !(p.has(e.id) || g.has(e.id) || t && f.has(t)) && (g.add(e.id), t && f.add(t), !0)
        }),
        v = _.map(e => {
          var t;
          return t = c.id, {
            id: k("queue_item"),
            runId: t,
            videoId: e.id,
            sourcePath: e.path,
            name: e.name,
            status: "waiting",
            stage: "Đang chờ",
            progress: 0,
            retryCount: 0,
            createdAt: A(),
            executionSnapshot: (0, u.cloneQueueExecutionSnapshot)(d),
            authorizationRequestIdempotencyKey: (0, m.createTrialAuthorizationRequestId)()
          }
        }),
        b = _.filter(e => C(e, d)).map(e => e.id);
      await Promise.all(b.map(j)), e(e => {
        let t = e.runs.some(e => e.id === c.id);
        return {
          activeRunId: c.id,
          runs: t ? e.runs.map(e => e.id === c.id ? {
            ...e,
            status: "running",
            completedAt: void 0
          } : e) : [...e.runs, c],
          items: [...e.items.map(e => e.runId === c.id && "paused" === e.status ? F(e) : e), ...v]
        }
      }), $()
    },
    pauseQueue: async () => {
      let i = t(),
        n = L(i);
      if (!n || "running" !== n.status) return;
      let a = i.items.find(e => e.id === n.activeItemId),
        r = a ?? i.items.find(e => e.runId === n.id && "waiting" === e.status);
      e(e => ({
        runs: e.runs.map(e => e.id === n.id ? {
          ...e,
          status: "paused",
          activeItemId: void 0
        } : e),
        items: e.items.map(e => r && e.id === r.id ? D(e) : e)
      })), a && await S.useVideoStore.getState().pauseVideoProcessing(a.videoId, "Đã tạm dừng xử lý video.")
    },
    resumeQueue: async () => {
      let i = L(t());
      i && "paused" === i.status && (e(e => ({
        runs: e.runs.map(e => e.id === i.id ? {
          ...e,
          status: "running"
        } : e),
        items: e.items.map(e => e.runId === i.id && "paused" === e.status ? F(e) : e)
      })), $())
    },
    retryFailed: async () => {
      let i = L(t());
      !i || t().items.some(e => e.runId === i.id && "failed" === e.status && "recoverable" === e.errorKind) && (e(e => ({
        runs: e.runs.map(e => e.id === i.id && "completed" === e.status ? {
          ...e,
          status: "running",
          completedAt: void 0
        } : e),
        items: e.items.map(e => e.runId === i.id && "failed" === e.status && "recoverable" === e.errorKind ? {
          ...e,
          status: "waiting",
          stage: "Đang chờ",
          progress: 0,
          message: void 0,
          errorKind: void 0,
          errorMessage: void 0,
          completedAt: void 0,
          authorizationRequestIdempotencyKey: (0, m.createTrialAuthorizationRequestId)()
        } : e)
      })), $())
    },
    retryQueueItem: async i => {
      let n = t(),
        a = n.items.find(e => e.id === i && "failed" === e.status);
      if (!a) return;
      let r = n.runs.find(e => e.id === a.runId);
      r && (e(e => ({
        activeRunId: r.id,
        runs: e.runs.map(e => e.id === r.id ? {
          ...e,
          status: "running",
          activeItemId: "running" === e.status ? e.activeItemId : void 0,
          completedAt: void 0
        } : e),
        items: e.items.map(e => e.id === a.id ? {
          ...e,
          status: "waiting",
          stage: "Đang chờ",
          progress: 0,
          message: void 0,
          errorKind: void 0,
          errorMessage: void 0,
          completedAt: void 0,
          authorizationRequestIdempotencyKey: (0, m.createTrialAuthorizationRequestId)()
        } : e)
      })), $())
    },
    removeQueueItem: i => {
      let n = t().items.find(e => e.id === i && ("waiting" === e.status || "paused" === e.status || "failed" === e.status || "interrupted" === e.status || "settlement_pending" === e.status));
      n && (e(e => ({
        items: e.items.map(e => e.id === i ? {
          ...e,
          status: "skipped",
          stage: "Bỏ qua",
          completedAt: A()
        } : e)
      })), w(n.videoId))
    },
    skipProjectItems: t => {
      e(e => {
        let i = new Set(e.items.filter(e => e.videoId === t && ("waiting" === e.status || "paused" === e.status || "preflight" === e.status || "retrying" === e.status || "settlement_pending" === e.status || "interrupted" === e.status)).map(e => e.id));
        return {
          items: e.items.map(e => i.has(e.id) ? {
            ...e,
            status: "skipped",
            stage: "Bỏ qua",
            completedAt: A()
          } : e),
          runs: e.runs.map(e => e.activeItemId && i.has(e.activeItemId) ? {
            ...e,
            activeItemId: void 0
          } : e)
        }
      })
    },
    isVideoQueued: e => t().items.some(t => t.videoId === e && x(t.status)),
    resumePausedVideo: i => {
      let n = t(),
        a = n.items.find(e => e.videoId === i && "paused" === e.status);
      if (!a) return !1;
      let r = n.runs.find(e => e.id === a.runId);
      return !!r && (e(e => ({
        activeRunId: r.id,
        runs: e.runs.map(e => e.id === r.id ? {
          ...e,
          status: "running",
          activeItemId: void 0,
          completedAt: void 0
        } : e),
        items: e.items.map(e => e.id === a.id ? F(a) : e)
      })), $(), !0)
    }
  }), {
    name: "dichvideo-queue-session",
    storage: (0, i.createJSONStorage)(() => (0, o.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      runs: e.runs,
      items: e.items,
      activeRunId: e.activeRunId
    }),
    merge: (e, t) => {
      let i = (e?.runs ?? []).map(e => {
          var t;
          let i, n, a, r;
          return {
            ...e,
            snapshot: (i = (t = e.snapshot).dubbingTimeline, n = t.dubbingTimelineIntent ?? ("hybrid_stretch" === i.mode && void 0 === i.presetId ? "historical_numeric" : "hybrid_stretch" === i.mode ? "current_preset" : null), a = t.sonitranslateSettings, r = "hybrid_stretch" === i.mode && "separate_background" !== a.original_audio_strategy && "mute_original" !== a.original_audio_strategy && a.volume_original_audio >= 1 ? {
              ...a,
              volume_original_audio: .18
            } : a, {
              ...t,
              translationStyle: (0, g.normalizeResolvedTranslationStyle)(t.translationStyle),
              dubbingTimeline: i,
              dubbingTimelineIntent: n,
              sonitranslateSettings: r
            })
          }
        }),
        n = e?.items ?? [],
        a = new Set(n.filter(e => !!e.processingSession && ["waiting", "paused", "preflight", "processing", "retrying", "pausing", "recovering"].includes(String(e.status))).map(e => e.id)),
        r = new Set(n.filter(e => !e.processingSession && ["preflight", "processing", "retrying", "pausing", "recovering"].includes(String(e.status))).map(e => e.id)),
        o = new Set([...a, ...r]),
        s = new Set(n.filter(e => o.has(e.id)).map(e => e.runId)),
        l = new Set(n.filter(e => r.has(e.id) || !o.has(e.id) && ("waiting" === e.status || "paused" === e.status)).map(e => e.runId));
      return {
        ...t,
        ...e,
        runs: i.map(e => s.has(e.id) ? l.has(e.id) ? {
          ...e,
          status: "paused",
          activeItemId: void 0,
          completedAt: void 0
        } : {
          ...e,
          status: "completed",
          activeItemId: void 0
        } : e),
        items: n.map(e => a.has(e.id) ? {
          ...e,
          status: "settlement_pending",
          stage: "Đang hoàn tất trạng thái",
          message: E,
          errorKind: "terminal",
          errorMessage: E
        } : r.has(e.id) ? D(e) : e),
        activeRunId: e?.activeRunId && (!s.has(e.activeRunId) || l.has(e.activeRunId)) ? e.activeRunId : null
      }
    }
  }));
  async function $() {
    return V || (V = O().finally(() => {
      V = null
    }))
  }
  async function O() {
    for (;;) {
      let e = H.getState(),
        t = L(e);
      if (!t || "running" !== t.status) return;
      let i = e.items.find(e => e.runId === t.id && "waiting" === e.status);
      if (!i) return void H.setState(e => ({
        runs: e.runs.map(e => e.id === t.id ? {
          ...e,
          status: "completed",
          activeItemId: void 0,
          completedAt: A()
        } : e)
      }));
      H.setState(e => ({
        runs: e.runs.map(e => e.id === t.id ? {
          ...e,
          activeItemId: i.id
        } : e),
        items: e.items.map(e => e.id === i.id ? {
          ...e,
          status: "preflight",
          stage: "Chuẩn bị",
          progress: Math.max(e.progress, 1),
          startedAt: A()
        } : e)
      }));
      let n = H.getState().runs.find(e => e.id === t.id);
      if (n?.status !== "running") return void
      function(e, t) {
        H.setState(i => ({
          runs: i.runs.map(t => t.id === e ? {
            ...t,
            status: "paused",
            activeItemId: void 0
          } : t),
          items: i.items.map(e => e.id === t ? D(e) : e)
        }))
      }(t.id, i.id);
      await G(t, i);
      let a = H.getState().runs.find(e => e.id === t.id);
      if (a?.status !== "running") return
    }
  }
  async function G(e, t) {
    if (!S.useVideoStore.getState().videos.find(e => e.id === t.videoId)) return void U(t.id, "Video không còn trong project.", "terminal");
    T(t.videoId), H.setState(e => ({
      items: e.items.map(e => e.id === t.id ? {
        ...e,
        status: "preflight",
        stage: "Chuẩn bị",
        progress: Math.max(e.progress, 2)
      } : e)
    }));
    let i = (0, u.resolveQueueExecutionSnapshot)(t, e),
      n = S.useVideoStore.getState().videos.find(e => e.id === t.videoId);
    n && !(0, c.hasAuthoredSourcePreviewAudioPolicy)(n) && C(n, i) && await j(t.videoId);
    for (let n = t.retryCount; n <= 1; n += 1) try {
      (0, u.assertQueueExecutionTtsRoute)(i), n > 0 && H.setState(e => ({
        items: e.items.map(e => e.id === t.id ? {
          ...e,
          status: "retrying",
          stage: "Thử lại",
          retryCount: n
        } : e)
      })), await S.useVideoStore.getState().runFullPipeline(t.videoId, i.sourceLang, i.targetLang, void 0, {
        includeTts: i.includeTts,
        ttsProvider: i.ttsProvider,
        processingMode: i.processingMode,
        translationStyle: i.translationStyle,
        sonitranslateSettings: i.sonitranslateSettings,
        dubbingTimeline: i.dubbingTimeline,
        dubbingTimelineIntent: i.dubbingTimelineIntent,
        authorizationRequestIdempotencyKey: t.authorizationRequestIdempotencyKey,
        subtitleSource: "imported_srt" === i.subtitleSource && i.importedSrtVideoId === t.videoId && i.importedSrtPath ? {
          srtPath: i.importedSrtPath
        } : void 0
      }), await P(t.videoId, i.seriesBatchStampSnapshot);
      let a = S.useVideoStore.getState().videos.find(e => e.id === t.videoId);
      H.setState(i => ({
        runs: i.runs.map(t => t.id === e.id ? {
          ...t,
          activeItemId: void 0
        } : t),
        items: i.items.map(e => e.id === t.id ? {
          ...e,
          status: "done",
          stage: "Hoàn thành",
          progress: 100,
          outputPath: a?.finalExportPath ?? a?.draftVideoPath ?? a?.translatedVideoPath,
          completedAt: A()
        } : e)
      }));
      return
    } catch (c) {
      if ((0, r.isChargedAfterRefundCancelledError)(c)) return void
      function(e, t) {
        H.setState(i => ({
          runs: i.runs.map(t => t.id === e ? {
            ...t,
            activeItemId: void 0
          } : t),
          items: i.items.map(e => e.id === t ? {
            ...e,
            status: "failed",
            stage: "Đã hủy",
            message: "Đã hủy xử lý lại video.",
            errorKind: "recoverable",
            errorMessage: "Đã hủy xử lý lại video.",
            completedAt: A(),
            startedAt: void 0
          } : e)
        }))
      }(e.id, t.id);
      if ((c instanceof Error ? c.message : String(c)).toLowerCase().includes("pipeline_canceled")) return void
      function(e, t) {
        H.setState(i => {
          let n = i.runs.find(t => t.id === e);
          return {
            runs: i.runs.map(t => t.id === e ? {
              ...t,
              activeItemId: void 0
            } : t),
            items: i.items.map(e => e.id !== t || "skipped" === e.status || "done" === e.status || "failed" === e.status ? e : n?.status === "running" || "waiting" === e.status ? F(e) : D(e))
          }
        })
      }(e.id, t.id);
      if ((0, s.isEngineSettingsRequiredError)(c)) {
        _.useAppStore.getState().openEngineSettings(),
          function(e, t, i = s.ENGINE_SETTINGS_REQUIRED_MESSAGE) {
            H.setState(n => ({
              runs: n.runs.map(t => t.id === e ? {
                ...t,
                status: "paused",
                activeItemId: void 0
              } : t),
              items: n.items.map(e => e.id === t ? {
                ...e,
                status: "waiting",
                stage: "Cần cài DichVideo Engine",
                progress: 0,
                message: i,
                errorKind: void 0,
                errorMessage: void 0,
                startedAt: void 0
              } : e)
            }))
          }(e.id, t.id, (0, s.isEngineRepairRequiredError)(c) ? s.ENGINE_REPAIR_REQUIRED_MESSAGE : s.ENGINE_SETTINGS_REQUIRED_MESSAGE), S.useVideoStore.getState().updateVideo(t.videoId, {
            status: "idle",
            processingError: void 0,
            processingErrorCode: void 0,
            processingErrorDetail: void 0
          });
        return
      }
      let i = (0, a.isRecoverableQueueError)(c);
      if (i && n < 1) continue;
      let o = c instanceof Error ? c.message : String(c),
        d = function(e) {
          if (!e || "object" != typeof e) return;
          let t = Reflect.get(e, "code");
          if ("string" != typeof t) return;
          let i = t.trim().toLowerCase();
          return /^[a-z][a-z0-9_]{0,127}$/.test(i) ? i : void 0
        }(c),
        u = (0, l.getProcessingErrorDisplay)(o, d);
      U(t.id, u.detail, i ? "recoverable" : "terminal", d), S.useVideoStore.getState().setVideoProcessingError(t.videoId, u.detail, d, function(e) {
        if (!e || "object" != typeof e) return;
        let t = Reflect.get(e, "developerMessage") ?? Reflect.get(e, "developer_message");
        if ("string" != typeof t) return;
        let i = t.replace(/\s+/g, " ").trim();
        return i ? i.slice(0, 240) : void 0
      }(c));
      return
    }
  }

  function U(e, t, i, n) {
    let a = H.getState().items.find(t => t.id === e)?.videoId;
    a && w(a);
    let r = (0, l.getProcessingErrorDisplay)(t, n);
    H.setState(t => ({
      runs: t.runs.map(t => t.activeItemId === e ? {
        ...t,
        activeItemId: void 0
      } : t),
      items: t.items.map(t => t.id === e ? {
        ...t,
        status: "failed",
        stage: r.badgeLabel,
        progress: (0, d.freezeFailedQueueItemProgress)(t.progress, R(t)),
        message: r.detail,
        errorKind: i,
        errorMessage: r.detail,
        completedAt: A()
      } : t)
    }))
  }
}]);