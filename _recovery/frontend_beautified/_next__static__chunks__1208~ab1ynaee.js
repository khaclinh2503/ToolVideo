(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 63676, e => {
  "use strict";
  let t = (0, e.i(56420).default)("x", [
    ["path", {
      d: "M18 6 6 18",
      key: "1bl5f8"
    }],
    ["path", {
      d: "m6 6 12 12",
      key: "d8bk6v"
    }]
  ]);
  e.s(["X", 0, t], 63676)
}, 51757, e => {
  "use strict";
  var t = e.i(16933);
  e.s(["CheckCircle2", () => t.default])
}, 84026, e => {
  "use strict";
  let t = (0, e.i(56420).default)("shield-check", [
    ["path", {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }],
    ["path", {
      d: "m9 12 2 2 4-4",
      key: "dzmm74"
    }]
  ]);
  e.s(["ShieldCheck", 0, t], 84026)
}, 15288, e => {
  "use strict";
  var t = e.i(43476),
    a = e.i(75157);
  e.s(["Card", 0, function({
    className: e,
    size: r = "default",
    ...i
  }) {
    return (0, t.jsx)("div", {
      "data-slot": "card",
      "data-size": r,
      className: (0, a.cn)("group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl", e),
      ...i
    })
  }, "CardContent", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)("div", {
      "data-slot": "card-content",
      className: (0, a.cn)("px-(--card-spacing)", e),
      ...r
    })
  }, "CardDescription", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)("div", {
      "data-slot": "card-description",
      className: (0, a.cn)("text-sm text-muted-foreground", e),
      ...r
    })
  }, "CardHeader", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)("div", {
      "data-slot": "card-header",
      className: (0, a.cn)("group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)", e),
      ...r
    })
  }, "CardTitle", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)("div", {
      "data-slot": "card-title",
      className: (0, a.cn)("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", e),
      ...r
    })
  }])
}, 68148, e => {
  "use strict";
  var t = e.i(43476),
    a = e.i(71645),
    r = e.i(30030),
    i = e.i(48425),
    n = "Progress",
    [s, o] = (0, r.createContextScope)(n),
    [l, u] = s(n),
    d = a.forwardRef((e, a) => {
      var r, n;
      let {
        __scopeProgress: s,
        value: o = null,
        max: u,
        getValueLabel: d = h,
        ...c
      } = e;
      (u || 0 === u) && !x(u) && console.error((r = `${u}`, `Invalid prop \`max\` of value \`${r}\` supplied to \`Progress\`. Only numbers greater than 0 are valid max values. Defaulting to \`100\`.`));
      let p = x(u) ? u : 100;
      null === o || f(o, p) || console.error((n = `${o}`, `Invalid prop \`value\` of value \`${n}\` supplied to \`Progress\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or 100 if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`));
      let v = f(o, p) ? o : null,
        _ = g(v) ? d(v, p) : void 0;
      return (0, t.jsx)(l, {
        scope: s,
        value: v,
        max: p,
        children: (0, t.jsx)(i.Primitive.div, {
          "aria-valuemax": p,
          "aria-valuemin": 0,
          "aria-valuenow": g(v) ? v : void 0,
          "aria-valuetext": _,
          role: "progressbar",
          "data-state": m(v, p),
          "data-value": v ?? void 0,
          "data-max": p,
          ...c,
          ref: a
        })
      })
    });
  d.displayName = n;
  var c = "ProgressIndicator",
    p = a.forwardRef((e, a) => {
      let {
        __scopeProgress: r,
        ...n
      } = e, s = u(c, r);
      return (0, t.jsx)(i.Primitive.div, {
        "data-state": m(s.value, s.max),
        "data-value": s.value ?? void 0,
        "data-max": s.max,
        ...n,
        ref: a
      })
    });

  function h(e, t) {
    return `${Math.round(e/t*100)}%`
  }

  function m(e, t) {
    return null == e ? "indeterminate" : e === t ? "complete" : "loading"
  }

  function g(e) {
    return "number" == typeof e
  }

  function x(e) {
    return g(e) && !isNaN(e) && e > 0
  }

  function f(e, t) {
    return g(e) && !isNaN(e) && e <= t && e >= 0
  }
  p.displayName = c;
  var v = e.i(75157);
  let _ = a.forwardRef(({
    className: e,
    value: a,
    indicatorClassName: r,
    ...i
  }, n) => (0, t.jsx)(d, {
    ref: n,
    className: (0, v.cn)("relative h-2 w-full overflow-hidden rounded-full bg-secondary", e),
    ...i,
    children: (0, t.jsx)(p, {
      className: (0, v.cn)("h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out", r),
      style: {
        transform: `translateX(-${100-(a||0)}%)`
      }
    })
  }));
  _.displayName = d.displayName, e.s(["Progress", 0, _], 68148)
}, 33658, 28523, e => {
  "use strict";
  var t = e.i(56420);
  let a = (0, t.default)("file-headphone", [
    ["path", {
      d: "M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343",
      key: "1vfytu"
    }],
    ["path", {
      d: "M14 2v5a1 1 0 0 0 1 1h5",
      key: "wfsgrz"
    }],
    ["path", {
      d: "M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0",
      key: "1etmh7"
    }]
  ]);
  e.s(["FileAudio", 0, a], 33658);
  let r = (0, t.default)("pause", [
    ["rect", {
      x: "14",
      y: "3",
      width: "5",
      height: "18",
      rx: "1",
      key: "kaeet6"
    }],
    ["rect", {
      x: "5",
      y: "3",
      width: "5",
      height: "18",
      rx: "1",
      key: "1wsw3u"
    }]
  ]);
  e.s(["Pause", 0, r], 28523)
}, 25981, e => {
  "use strict";
  let t = (0, e.i(56420).default)("upload", [
    ["path", {
      d: "M12 3v12",
      key: "1x0j5s"
    }],
    ["path", {
      d: "m17 8-5-5-5 5",
      key: "7q97r8"
    }],
    ["path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
      key: "ih7n3h"
    }]
  ]);
  e.s(["Upload", 0, t], 25981)
}, 45909, e => {
  "use strict";
  var t = e.i(43476),
    a = e.i(71645),
    r = e.i(89664),
    i = e.i(15745),
    n = e.i(33658),
    s = e.i(69644),
    o = e.i(32781),
    l = e.i(28523),
    u = e.i(21357),
    d = e.i(95925),
    c = e.i(25981),
    p = e.i(94533),
    h = e.i(87486),
    m = e.i(19455),
    g = e.i(15288),
    x = e.i(76639),
    f = e.i(68148),
    v = e.i(24687),
    _ = e.i(98534),
    b = e.i(63511),
    w = e.i(90676);
  e.i(89268);
  var y = e.i(7787),
    N = e.i(63126),
    j = e.i(81341),
    C = e.i(27875),
    S = e.i(77496),
    k = e.i(54302),
    P = e.i(17569),
    M = e.i(89290),
    T = e.i(17245),
    F = e.i(63890),
    A = e.i(78238),
    V = e.i(56260),
    R = e.i(75157),
    D = e.i(38991),
    $ = e.i(57342),
    E = e.i(68834),
    z = e.i(68476),
    I = e.i(86115),
    J = e.i(13308),
    O = e.i(3083),
    B = e.i(98272),
    H = e.i(63754),
    U = e.i(37333),
    q = e.i(35612),
    L = e.i(30797);
  let K = /^[a-f0-9]{64}$/;
  async function X(e, t) {
    try {
      let a = (await (0, j.computeFileSha256)(e)).trim().toLowerCase(),
        r = a.startsWith("sha256:") ? a.slice(7) : a;
      if (K.test(r)) return `sha256:${r}`;
      await (0, L.appendAppLog)("warn", `[pipeline:${t}] Ignoring invalid source content hash format.`)
    } catch (e) {
      await (0, L.appendAppLog)("warn", `[pipeline:${t}] Unable to compute source content hash: ${e instanceof Error?e.message:String(e)}`)
    }
    return null
  }
  var W = e.i(70631),
    G = e.i(65207),
    Y = e.i(41824),
    Q = e.i(6285),
    Z = e.i(65991),
    ee = e.i(92863),
    et = e.i(22692);
  let ea = "dichvideo-engine-vnext-native",
    er = "Không thể chuẩn bị FFmpeg/FFprobe để tạo audio từ nội dung.";

  function ei(e) {
    return Math.max(1, Math.ceil(Math.max(e.lastEndMs, e.durationMs, 1) / 1e3))
  }
  async function en() {
    if (!(0, j.isTauri)()) return;
    let e = Q.useDependencyStore.getState();
    e.isLoaded && e.status || await e.refreshStatus();
    let t = Q.useDependencyStore.getState(),
      a = t.status;
    if (!a?.setup_complete) throw t.setSetupOpen(!0),
      function(e = []) {
        return Object.assign(Error("srt_audio_dependency_setup_required"), {
          code: "srt_audio_dependency_setup_required",
          customerMessage: "Please finish FFmpeg setup before creating SRT audio.",
          missingRequired: e
        })
      }(a?.missing_required ?? [])
  }

  function es(e) {
    return e && "object" == typeof e ? String(e.customerMessage ?? e.customer_message ?? e.developerMessage ?? e.developer_message ?? e.message ?? "srt_audio_failed") : e instanceof Error ? e.message : "string" == typeof e ? e : "srt_audio_failed"
  }

  function eo(e) {
    return e ? e.split(/[\\/]/).filter(Boolean).pop() ?? "" : ""
  }
  async function el({
    runId: e,
    sourceInput: t,
    outputPath: a,
    provider: r,
    voice: i,
    piperExecutionIdentity: n,
    analysis: s,
    startedAt: o,
    status: l,
    srtAudioOutputPath: u,
    srtAudioWorkDir: d,
    srtAudioTtsManifestPath: c,
    srtAudioAudioManifestPath: p,
    outputDurationMs: h,
    error: m
  }) {
    if ((0, j.isTauri)()) try {
      let g, x, f = new Date,
        v = (0, H.buildSrtAudioProjectManifest)({
          id: e,
          name: (g = eo(t.srtPath).replace(/\.[^.]+$/, ""), x = eo(a).replace(/\.[^.]+$/, ""), g || x || "SRT sang Audio"),
          sourcePath: t.srtPath ?? null,
          sourceContent: t.srtContent ?? null,
          sourceKind: "text" === t.inputFormat ? t.srtPath ? "text_file" : "text_paste" : t.srtPath ? "srt_file" : "srt_paste",
          outputDurationMs: h,
          outputPath: u,
          workDir: d,
          ttsManifestPath: c,
          audioManifestPath: p,
          status: l,
          analysis: s,
          provider: r,
          voice: i,
          piperExecutionIdentity: n,
          startedAt: o,
          completedAt: f,
          processingDurationMs: f.getTime() - o.getTime(),
          errorMessage: "error" === l ? es(m) : null
        });
      await (0, N.writeProjectManifest)(e, v), await Z.useVideoStore.getState().syncProjectHistoryFromManifests()
    } catch (e) {
      console.warn("Failed to persist SRT Audio history manifest:", e)
    }
  }

  function eu({
    status: e,
    analysis: t,
    authorization: a,
    runtimePackageHash: r,
    preflightWallMs: i,
    preflightBackendMs: n,
    startedAt: s,
    result: o,
    error: l
  }) {
    let u = ei(t),
      d = Math.max(0, Date.now() - s),
      c = o ? o.durationMs / 1e3 : null;
    return {
      status: e,
      stage_timings: {
        srt_audio_total_ms: d,
        ...o ? {
          srt_audio_synthesis_ms: o.elapsedMs
        } : {}
      },
      source_duration_seconds: u,
      output_duration_seconds: c,
      real_time_factor: u > 0 ? d / 1e3 / u : null,
      subtitle_cue_count: t.cueCount,
      voiceover_cue_count: t.voicePhraseCount,
      output_audio_stream_count: +("completed" === e),
      watermark_present: !1,
      engine_provider: ea,
      runtime_version: ea,
      runtime_hash: r,
      preflight_wall_ms: i,
      preflight_backend_ms: n,
      runtime_package_hash: r,
      engine_family: ea,
      runtime_accelerator: null,
      runtime_profile: null,
      engine_policy_version: a.engine_policy_version,
      translation_route: a.translation_route,
      tts_route: a.tts_route,
      tts_fallback_reason: null,
      runtime_trust_set_id: a.runtime_trust_set_id,
      translation_input_tokens: 0,
      translation_output_tokens: 0,
      estimated_provider_cost_vnd: 0,
      error_code: "failed" === e ? function(e) {
        if (e && "object" == typeof e) {
          let t = e.code ?? e.errorCode ?? e.error_code;
          if ("string" == typeof t && t.trim()) return t.trim()
        }
        return "srt_audio_failed"
      }(l) : "canceled" === e ? "job_canceled" : null,
      error_message: "completed" === e ? null : es(l).slice(0, 500),
      quality_warnings: o?.warnings ?? [],
      funnel_events: [{
        event: "srt_audio_job",
        metadata: {
          cue_count: t.cueCount,
          voice_phrase_count: t.voicePhraseCount,
          billable_seconds: u
        }
      }]
    }
  }
  async function ed(e, t, a) {
    if (await (0, O.enqueueV1LocalJobTerminalFromMetrics)({
        authorization: e,
        reportedStatus: t.status,
        metrics: t,
        completedOutputAvailable: a
      })) return;
    let r = e.job_id,
      i = $.useCloudStore.getState(),
      n = i.token;
    if (!n) return void i.queueOfflineJobUpdate({
      jobId: r,
      kind: "metrics",
      payload: t
    });
    try {
      await z.cloudApi.uploadJobMetrics(i.apiUrl, n, r, t)
    } catch {
      $.useCloudStore.getState().queueOfflineJobUpdate({
        jobId: r,
        kind: "metrics",
        payload: t
      })
    }
  }
  let ec = (0, E.create)(e => ({
      latestJob: null,
      resetLatestJob: () => e({
        latestJob: null
      }),
      createSrtAudio: async ({
        runId: t,
        sourceInput: a,
        outputPath: r,
        provider: i = "edge_tts_bing",
        voice: n,
        analysis: s,
        onProgress: o
      }) => {
        let l = Date.now(),
          u = new Date(l),
          d = Date.now(),
          c = (0, B.resolveTtsVoiceRoute)(i, n),
          p = $.useCloudStore.getState();
        if (!p.token || !p.user) throw Object.assign(Error("srt_audio_login_required"), {
          code: "srt_audio_login_required",
          customerMessage: "Cần đăng nhập tài khoản trước khi tạo audio."
        });
        let h = {
          runId: t,
          stage: "queued",
          percent: 1,
          message: "Đang chuẩn bị tạo audio...",
          completedCues: 0,
          totalCues: s.voicePhraseCount
        };
        e({
          latestJob: {
            runId: t,
            status: "queued",
            sourceInput: a,
            outputPath: r,
            voice: n,
            analysis: s,
            progress: h,
            result: null,
            errorMessage: null,
            startedAt: l
          }
        }), o?.(h);
        let m = null,
          g = null,
          x = null,
          f = null,
          v = null,
          _ = (0, O.createLocalJobTerminalDeliveryOwner)();
        try {
          if (await (0, I.ensurePremiumVoiceReadyForProcessing)({
              provider: c.provider,
              voice: c.voice
            }), !await (0, J.ensureMediaToolsReady)({
              setPreparationMessage: a => {
                if (!a) return;
                let r = {
                  ...h,
                  message: a
                };
                e(e => e.latestJob?.runId !== t ? e : {
                  latestJob: {
                    ...e.latestJob,
                    progress: r
                  }
                }), o?.(r)
              },
              logContext: "SRT-to-Audio",
              checkingMessage: "Đang kiểm tra FFmpeg/FFprobe...",
              preparingMessage: "Đang cài lại FFmpeg/FFprobe...",
              errorTitle: "Không thể chuẩn bị bộ xử lý media",
              contextMessage: er
            })) throw Object.assign(Error("srt_audio_media_tools_unavailable"), {
            code: "srt_audio_media_tools_unavailable",
            customerMessage: er
          });
          await en();
          let i = await p.fetchServerConfig({
            force: !0
          });
          if (!i) throw Error("server_config_invalid");
          let [n, b, w] = await Promise.all([(0, Y.getDeviceFingerprint)(), (0, L.getAppVersion)(), (0, y.getEngineRegistryStatus)()]), N = function(e) {
            let t = e.installedFamilies.find(e => "dichvideo-engine-vnext" === e.family);
            if (!t?.healthy || !t.path || !t.packageSha256) throw Object.assign(Error("native_vnext_runtime_unavailable"), {
              code: "native_vnext_runtime_unavailable",
              fallbackAllowed: !1
            });
            return t
          }(w);
          if (g = N.packageSha256, !(0, U.runtimeHashIsTrustedByServerConfig)(i, N.packageSha256)) throw Error("native_vnext_runtime_not_trusted");
          let j = (0, W.selectSrtAudioAuthorizationSource)(a),
            C = null;
          j?.kind === "inline" ? C = `sha256:${await (0,q.sha256Hex)(new TextEncoder().encode(j.value))}` : j?.kind === "file" && (C = await X(j.value, t));
          let S = await $.useCloudStore.getState().localPreflight({
            device: {
              hardware_fingerprint_hash: n.hardware_fingerprint_hash,
              installation_id: n.installation_id,
              app_version: b,
              os: n.os,
              runtime_hash: N.packageSha256,
              anchor_count: n.anchor_count
            },
            job: {
              job_type: "srt_audio",
              source_video_seconds: ei(s),
              target_language: "vi",
              tts_provider: "edge",
              premium_voice_seconds: 0,
              requested_features: (0, V.buildLocalJobRequestedFeatures)(!0, null, {
                preferNoWatermark: !0
              }).filter(e => "subtitles" !== e),
              ...(0, V.buildLocalVoiceAuthorizationRoute)(!0, c.provider, c.voice),
              runtime_package_hash: N.packageSha256,
              installed_app_version: b,
              supports_watermark_policy: !0,
              source_content_hash: C
            }
          });
          if (x = Date.now() - d, !S) {
            let e = $.useCloudStore.getState();
            throw (0, et.localPreflightFailureError)({
              code: e.authorizationBlockedReason,
              detail: e.authorizationError,
              ttsProvider: c.provider
            })
          }
          if (m = S.authorization, f = S.timings_ms?.total ?? null, await (0, G.confirmChargedAfterRefundAuthorization)(m) === "cancelled") throw (0, G.chargedAfterRefundCancelledError)();
          let k = await (0, ee.preparePiperForAuthorizedJob)({
            apiUrl: i.signed_config_bundle.payload.api_url,
            authorization: m,
            vnextPackageSha256: N.packageSha256,
            provider: c.provider,
            voice: c.voice,
            authorizedSourceSeconds: ei(s)
          });
          v = k.piperExecutionIdentity;
          let P = await (0, y.synthesizeSrtAudio)({
            runId: t,
            ...a,
            outputPath: r,
            engineFamily: ea,
            runtimePackageHash: N.packageSha256,
            translationApiUrl: i.signed_config_bundle.payload.api_url,
            authorization: k.authorization,
            deviceId: m.device_id,
            piperExecutionIdentity: k.piperExecutionIdentity,
            provider: c.provider,
            voice: c.voice,
            language: "vi",
            speed: 1,
            pitch: 1
          }, {
            onProgress: a => {
              e(e => e.latestJob?.runId !== t ? e : {
                latestJob: {
                  ...e.latestJob,
                  status: "completed" === a.stage ? "completed" : "generating",
                  progress: a
                }
              }), o?.(a)
            }
          });
          await el({
            runId: t,
            sourceInput: a,
            outputPath: r,
            provider: c.provider,
            voice: c.voice,
            piperExecutionIdentity: v,
            analysis: s,
            startedAt: u,
            status: "completed",
            srtAudioOutputPath: P.outputPath,
            srtAudioWorkDir: P.workDir,
            srtAudioTtsManifestPath: P.ttsManifestPath,
            srtAudioAudioManifestPath: P.audioManifestPath,
            outputDurationMs: P.durationMs
          });
          let M = {
            runId: t,
            stage: "completed",
            percent: 100,
            message: "Đã tạo file âm thanh.",
            completedCues: P.generatedClipCount,
            totalCues: P.voicePhraseCount
          };
          e(e => e.latestJob?.runId !== t ? e : {
            latestJob: {
              ...e.latestJob,
              status: "completed",
              progress: M,
              result: P,
              errorMessage: null
            }
          }), o?.(M);
          let T = m;
          if (!T) throw Error("srt_audio_authorization_missing");
          return await _.deliverOnce(() => ed(T, eu({
            status: "completed",
            analysis: s,
            authorization: T,
            runtimePackageHash: N.packageSha256,
            preflightWallMs: x,
            preflightBackendMs: f,
            startedAt: l,
            result: P
          }), !0)), P
        } catch (o) {
          let i = (0, F.piperErrorCode)(o),
            n = "piper_native" === c.provider && /piper|local_voice_dichvideo/i.test(i) ? (0, F.normalizePiperError)(o) : o;
          if (await el({
              runId: t,
              sourceInput: a,
              outputPath: r,
              provider: c.provider,
              voice: c.voice,
              piperExecutionIdentity: v,
              analysis: s,
              startedAt: u,
              status: "error",
              srtAudioOutputPath: null,
              error: n
            }), e(e => e.latestJob?.runId !== t ? e : {
              latestJob: {
                ...e.latestJob,
                status: "error",
                errorMessage: es(n)
              }
            }), m && g && !_.claimed) {
            let e = m,
              t = g,
              a = (0, G.isChargedAfterRefundCancelledError)(o) ? "canceled" : "failed";
            await _.deliverOnce(() => ed(e, eu({
              status: a,
              analysis: s,
              authorization: e,
              runtimePackageHash: t,
              preflightWallMs: x,
              preflightBackendMs: f,
              startedAt: l,
              error: n
            }), !1))
          }
          throw n
        }
      }
    })),
    ep = "srt-audio",
    eh = [{
      id: "vi-VN-NamMinhNeural-Male",
      label: "Nam Minh",
      shortLabel: "Nam",
      provider: "edge_tts_bing",
      voice: "vi-VN-NamMinhNeural-Male",
      description: "Nam, tiếng Việt"
    }, {
      id: "vi-VN-HoaiMyNeural-Female",
      shortLabel: "Nữ",
      provider: "edge_tts_bing",
      voice: "vi-VN-HoaiMyNeural-Female",
      label: "Hoài My",
      description: "Nữ, tiếng Việt"
    }];

  function em(e) {
    return e.split(/[\\/]/).filter(Boolean).pop() ?? ""
  }

  function eg(e) {
    let t = e.trim().replace(/[\\/]+$/, ""),
      a = Math.max(t.lastIndexOf("/"), t.lastIndexOf("\\"));
    return a < 0 ? "" : t.slice(0, a)
  }

  function ex(e, ...t) {
    let a = e.trim().replace(/[\\/]+$/, ""),
      r = a.includes("\\") ? "\\" : "/",
      i = t.map(e => e.trim().replace(/^[\\/]+|[\\/]+$/g, "")).filter(Boolean);
    return a ? i.length ? `${a}${r}${i.join(r)}` : a : i.join(r)
  }

  function ef(e = new Date) {
    let t = e.getFullYear(),
      a = String(e.getMonth() + 1).padStart(2, "0"),
      r = String(e.getDate()).padStart(2, "0"),
      i = String(e.getHours()).padStart(2, "0"),
      n = String(e.getMinutes()).padStart(2, "0"),
      s = String(e.getSeconds()).padStart(2, "0");
    return `${t}${a}${r}-${i}${n}${s}`
  }

  function ev(e) {
    return new Intl.NumberFormat("vi-VN").format(e)
  }

  function e_(e) {
    let t = "";
    if ("object" == typeof e && e) {
      let a = e.customerMessage ?? e.customer_message;
      if (a) return String(a);
      t = e.message ? String(e.message) : ""
    } else "string" == typeof e && (t = e);
    if ("srt_audio_login_required" === t || "Cloud login is required." === t || t === w.SUPABASE_AUTH_NOT_CONFIGURED_ERROR) return "Cần đăng nhập tài khoản trước khi tạo audio.";
    let a = (0, w.getSupabaseAuthCustomerErrorMessage)(t);
    return a || t || String(e || "Không thể tạo audio từ SRT.")
  }
  e.s(["SrtAudioPage", 0, function() {
    let e = (0, a.useRef)(null),
      {
        setCapCutLoginOpen: w,
        openAccountPricingSettings: E
      } = (0, D.useAppStore)(),
      z = (0, $.useCloudStore)(e => e.license),
      I = (0, $.useCloudStore)(e => e.balance),
      J = ec(e => e.createSrtAudio),
      O = ec(e => e.latestJob),
      B = ec(e => e.resetLatestJob),
      [H, U] = (0, a.useState)("srt"),
      [q, L] = (0, a.useState)({
        srt: {
          path: null,
          content: ""
        },
        text: {
          path: null,
          content: ""
        }
      }),
      K = q[H].path,
      X = q[H].content,
      W = (0, a.useRef)(0),
      [G, Y] = (0, a.useState)(null),
      [Q, Z] = (0, a.useState)(null),
      [ee, et] = (0, a.useState)(() => ef()),
      [ea, er] = (0, a.useState)(null),
      [ei, en] = (0, a.useState)(eh[0].id),
      [es, eo] = (0, a.useState)(!1),
      [el, eu] = (0, a.useState)(!1),
      [ed, eb] = (0, a.useState)(null);
    (0, a.useEffect)(() => {
      if (!(0, j.isTauri)()) return;
      let e = !0;
      return (0, N.getManagedPaths)().then(t => {
        e && t.output && Z(t.output)
      }).catch(() => {
        e && Z(null)
      }), () => {
        e = !1
      }
    }, []);
    let ew = X.trim(),
      ey = (0, a.useMemo)(() => ({
        inputFormat: H,
        srtPath: ew ? null : K,
        srtContent: ew || null
      }), [H, ew, K]),
      eN = (0, a.useMemo)(() => (function({
        srtPath: e,
        selectedOutputDir: t,
        managedOutputDir: a,
        stamp: r
      }) {
        var i;
        let n = function(e, t, a) {
            if (t) return t;
            if (a) return ex(a, ep);
            let r = e ? eg(e) : "";
            return r ? ex(r, ep) : ep
          }(e, t, a),
          s = (i = e) ? em(i).replace(/\.[^.]+$/, "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 48).replace(/[. ]+$/g, "") || "srt-sang-audio" : "noi-dung-sang-audio";
        return ex(n, `${s}-${r}.m4a`)
      })({
        srtPath: ey.srtPath,
        selectedOutputDir: G,
        managedOutputDir: Q,
        stamp: ee
      }), [Q, ee, G, ey.srtPath]),
      ej = eg(eN) || ep,
      eC = em(eN),
      eS = !!(ey.srtPath || ey.srtContent),
      ek = O?.progress ?? null,
      eP = O?.result ?? null,
      eM = O?.status === "queued" || O?.status === "generating",
      eT = eS && !eM && !es,
      eF = eP?.outputPath ? (0, j.resolveMediaSrc)(eP.outputPath) : null,
      eA = (0, b.useVieNeuCatalogStore)(e => e.voices),
      eV = (0, a.useMemo)(() => [...eh, ...eA, ...(0, _.premiumVoiceSelectOptions)().filter(e => "vieneu_native" !== e.provider)], [eA]),
      eR = (0, _.selectedVoiceOption)(ei, eV) ?? eh[0],
      eD = (0, V.shouldPreferNoWatermarkForLocalJob)({
        license: z,
        balance: I
      }),
      e$ = async e => {
        if (!e.srtPath && !e.srtContent) return await (0, j.showMessage)("Chưa có nội dung", "Hãy chọn file SRT/TXT hoặc nhập nội dung cần đọc.", "warning"), null;
        eo(!0);
        let t = ++W.current;
        try {
          let a = await (0, y.analyzeSrtAudio)(e);
          if (t !== W.current) return null;
          return er(a), a
        } catch (t) {
          let e = e_(t);
          return er(null), await (0, j.showMessage)("Không đọc được nội dung", e, "error"), null
        } finally {
          eo(!1)
        }
      }, eE = async () => e$(ey), ez = async () => {
        let e;
        eo(!0);
        try {
          e = await (0, j.openFileDialog)([{
            name: "text" === H ? "Văn bản UTF-8" : "SRT",
            extensions: ["text" === H ? "txt" : "srt"]
          }])
        } catch (e) {
          await (0, j.showMessage)("Không mở được hộp chọn file", e_(e), "error");
          return
        } finally {
          eo(!1)
        }
        e && (L(t => ({
          ...t,
          [H]: {
            path: e,
            content: ""
          }
        })), er(null), et(ef()), eu(!1), B(), await e$({
          inputFormat: H,
          srtPath: e,
          srtContent: null
        }))
      }, eI = async () => {
        let e = await (0, j.openDirectoryDialog)();
        e && (Y(e), et(ef()), eu(!1), B())
      }, eJ = async () => {
        if (!(0, j.isTauri)()) return void await (0, j.showMessage)("Cần app desktop", "Text / SRT sang Audio cần chạy trong app desktop để dùng Tauri và FFmpeg.", "warning");
        if (!eS) return void await (0, j.showMessage)("Thiếu nội dung", "Hãy chọn file SRT/TXT hoặc nhập nội dung cần đọc.", "warning");
        let e = await eE();
        if (!e) return;
        eu(!1), eb(null);
        let t = "u" > typeof crypto && "randomUUID" in crypto ? crypto.randomUUID() : `srt-audio-${Date.now()}`;
        try {
          await J({
            runId: t,
            sourceInput: ey,
            outputPath: eN,
            provider: eR.provider,
            voice: eR.voice,
            analysis: e
          }), et(ef())
        } catch (t) {
          let e = e_(t);
          if ((0, F.isPiperPaidMinutesRequired)(t)) return void eb(e);
          await (0, j.showMessage)("Tạo audio thất bại", e, "error")
        }
      }, eO = async e => {
        try {
          await (0, M.playPremiumVoicePreview)(e)
        } catch (t) {
          if ((0, A.viralVoiceNeedsSettings)(t) && w(!0), (0, k.isVieNeuVoiceId)(e) && ((0, T.isVieNeuRuntimeMissingError)(t) || (0, T.isVieNeuCanceledError)(t))) return;
          await (0, j.showMessage)("Chưa tạo được mẫu giọng", `${(0,k.isVieNeuVoiceId)(e)?(0,T.vieneuVoiceErrorText)(t):(0,A.viralVoiceErrorText)(t)}

C\xe2u demo: ${(0,M.premiumVoicePreviewText)(e)}`, "warning")
        }
      }, eB = async () => {
        if (eF && e.current) {
          if (el) {
            e.current.pause(), eu(!1);
            return
          }
          e.current.src = eF, await e.current.play(), eu(!0)
        }
      }, eH = async e => {
        try {
          await (0, y.openSrtAudioOutputFolder)(e)
        } catch (e) {
          await (0, j.showMessage)("Không hiện được file audio", e_(e), "error")
        }
      };
    return (0, t.jsxs)("div", {
      "data-testid": "desktop-view-srt-audio",
      className: "grid h-full min-h-0 grid-cols-2 gap-4 overflow-hidden bg-background p-4",
      style: {
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)"
      },
      children: [(0, t.jsx)("div", {
        "data-srt-audio-column": "upload",
        className: "min-w-0 min-h-0",
        children: (0, t.jsxs)(g.Card, {
          className: "flex h-full min-w-0 flex-col rounded-lg",
          children: [(0, t.jsx)(g.CardHeader, {
            className: "pb-3",
            children: (0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-3",
              children: [(0, t.jsxs)(g.CardTitle, {
                className: "flex items-center gap-2 text-sm",
                children: [(0, t.jsx)(n.FileAudio, {
                  className: "h-4 w-4 text-primary"
                }), "Nội dung cần đọc"]
              }), (0, t.jsx)(h.Badge, {
                variant: "outline",
                className: "h-5 px-2 text-[10px]",
                children: "text" === H ? "TXT / Văn bản" : "SRT"
              })]
            })
          }), (0, t.jsxs)(g.CardContent, {
            className: "flex min-h-0 flex-1 flex-col gap-4",
            children: [(0, t.jsx)("div", {
              className: "flex shrink-0 gap-2",
              role: "group",
              "aria-label": "Loại nội dung",
              children: ["text", "srt"].map(a => (0, t.jsx)(m.Button, {
                type: "button",
                variant: H === a ? "default" : "outline",
                "aria-pressed": H === a,
                disabled: eM || es,
                onClick: () => {
                  W.current += 1, U(a), er(null), e.current?.pause(), eu(!1), et(ef()), B()
                },
                children: "text" === a ? "Văn bản" : "SRT"
              }, a))
            }), "text" === H && (0, t.jsxs)("p", {
              className: "text-xs text-muted-foreground",
              children: ["Đọc nối tiếp theo nội dung, không cần mốc thời gian. File TXT dùng mã hóa UTF-8.", ea ? ` Thời lượng d\xf9ng để t\xednh ph\xfat ước t\xednh: ${Math.ceil(ea.durationMs/1e3)} gi\xe2y; audio thực tế c\xf3 thể kh\xe1c.` : " Thời lượng tính phút được ước tính theo độ dài văn bản (12 ký tự/giây)."]
            }), (0, t.jsxs)("div", {
              className: "grid shrink-0 gap-2 md:grid-cols-[minmax(0,1fr)_auto]",
              children: [(0, t.jsx)("div", {
                className: "flex h-9 min-w-0 items-center rounded-md border border-border bg-muted/20 px-3 text-xs text-muted-foreground",
                children: (0, t.jsx)("span", {
                  className: "truncate",
                  children: K ?? ("text" === H ? "Chưa chọn file .txt" : "Chưa chọn file .srt")
                })
              }), (0, t.jsxs)(m.Button, {
                type: "button",
                variant: "outline",
                className: "h-9 text-xs",
                disabled: eM || es,
                onClick: () => void ez(),
                children: [(0, t.jsx)(c.Upload, {
                  className: "h-3.5 w-3.5"
                }), "text" === H ? "Chọn TXT" : "Chọn SRT"]
              })]
            }), (0, t.jsxs)("div", {
              className: "flex min-h-0 flex-1 flex-col gap-2",
              children: [(0, t.jsxs)("div", {
                className: "flex items-center justify-between gap-3",
                children: [(0, t.jsxs)("label", {
                  className: "flex items-center gap-2 text-xs font-medium text-muted-foreground",
                  children: [(0, t.jsx)(i.ClipboardPaste, {
                    className: "h-3.5 w-3.5"
                  }), "text" === H ? "Hoặc nhập / dán văn bản" : "Hoặc paste nội dung SRT"]
                }), (0, t.jsxs)(m.Button, {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 text-xs",
                  disabled: !eS || es || eM,
                  onClick: () => void eE(),
                  children: [es ? (0, t.jsx)(o.Loader2, {
                    className: "h-3.5 w-3.5 animate-spin"
                  }) : null, "Phân tích"]
                })]
              }), (0, t.jsx)(v.Textarea, {
                "aria-label": "text" === H ? "Văn bản cần đọc" : "Nội dung SRT",
                disabled: eM || es,
                value: X,
                onChange: t => {
                  let a = t.target.value;
                  W.current += 1, L(e => ({
                    ...e,
                    [H]: {
                      path: null,
                      content: a
                    }
                  })), er(null), e.current?.pause(), eu(!1), B()
                },
                placeholder: "text" === H ? "Nhập hoặc dán văn bản cần chuyển thành giọng đọc..." : "1\n00:00:00,000 --> 00:00:02,000\nNội dung cần đọc...",
                className: "min-h-0 flex-1 font-mono text-xs leading-5"
              })]
            })]
          })]
        })
      }), (0, t.jsx)("div", {
        "data-srt-audio-column": "voice",
        className: "min-w-0 min-h-0 overflow-y-auto",
        children: (0, t.jsxs)(g.Card, {
          className: "min-w-0 rounded-lg",
          children: [(0, t.jsx)(g.CardHeader, {
            className: "pb-3",
            children: (0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-3",
              children: [(0, t.jsxs)("div", {
                className: "flex min-w-0 items-center gap-2",
                children: [(0, t.jsx)(g.CardTitle, {
                  className: "truncate text-sm",
                  children: "Phần chọn voice"
                }), (0, t.jsx)(h.Badge, {
                  variant: "outline",
                  className: "h-5 px-2 text-[10px]",
                  children: "Chọn voice"
                })]
              }), (0, t.jsxs)(m.Button, {
                size: "sm",
                className: "h-8 shrink-0 text-xs",
                onClick: () => void eJ(),
                disabled: !eT,
                children: [eM ? (0, t.jsx)(o.Loader2, {
                  className: "h-3.5 w-3.5 animate-spin"
                }) : (0, t.jsx)(p.Wand2, {
                  className: "h-3.5 w-3.5"
                }), eM ? "Đang tạo" : "Tạo audio"]
              })]
            })
          }), (0, t.jsxs)(g.CardContent, {
            className: "space-y-4",
            children: [(0, t.jsxs)("div", {
              className: "space-y-1.5",
              children: [(0, t.jsx)("label", {
                className: "text-[10px] font-medium text-muted-foreground",
                children: "Giọng đọc"
              }), (0, t.jsxs)("div", {
                className: "flex w-full max-w-full flex-wrap gap-1 rounded-md border border-border bg-secondary/40 p-1",
                children: [eh.map(e => {
                  let a = ei === e.id;
                  return (0, t.jsx)("button", {
                    type: "button",
                    title: e.description,
                    "aria-pressed": a,
                    disabled: eM,
                    onClick: () => en(e.id),
                    className: (0, R.cn)("min-h-9 min-w-[96px] flex-1 rounded px-2.5 py-1.5 text-left transition-colors", a && "bg-primary text-primary-foreground shadow-sm", !a && "bg-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground", eM && "cursor-not-allowed opacity-50"),
                    children: (0, t.jsxs)("span", {
                      className: "flex items-center justify-between gap-2 text-xs font-semibold",
                      children: [e.shortLabel, a ? (0, t.jsx)(r.Check, {
                        className: "h-3.5 w-3.5 shrink-0"
                      }) : null]
                    })
                  }, e.id)
                }), (0, t.jsx)(_.PremiumVoiceSelect, {
                  className: "min-w-[10.5rem] flex-1 sm:w-44 sm:flex-none",
                  value: (0, C.isPremiumVoiceId)(ei) ? ei : void 0,
                  onValueChange: e => {
                    (0, C.isPremiumVoiceId)(e) && (en(e), (0, S.isViralVoiceId)(e) && (0, P.openCapCutLoginIfNeeded)())
                  },
                  disabled: eM,
                  onPreview: e => void eO(e),
                  dichVideoProcessingEnabled: eD,
                  onTopUpMinutes: E
                })]
              })]
            }), (0, t.jsxs)("div", {
              className: "space-y-2 rounded-lg border border-border bg-muted/20 p-3",
              children: [(0, t.jsxs)("div", {
                className: "flex items-center justify-between gap-2",
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: "File audio đầu ra"
                }), (0, t.jsxs)(m.Button, {
                  type: "button",
                  variant: "outline",
                  className: "h-8 text-xs",
                  onClick: () => void eI(),
                  children: [(0, t.jsx)(s.FolderOpen, {
                    className: "h-3.5 w-3.5"
                  }), "Đổi thư mục"]
                })]
              }), (0, t.jsxs)("div", {
                className: "space-y-1 rounded-md border border-border bg-background/70 p-2",
                children: [(0, t.jsx)("p", {
                  className: "text-[10px] font-medium text-muted-foreground",
                  children: "Nơi lưu"
                }), (0, t.jsx)("p", {
                  className: "truncate text-[10px] text-muted-foreground",
                  children: ej
                }), (0, t.jsx)("p", {
                  className: "break-all font-mono text-xs font-medium",
                  children: eC
                })]
              }), G ? (0, t.jsxs)(m.Button, {
                type: "button",
                variant: "ghost",
                className: "h-7 px-2 text-xs",
                onClick: () => {
                  Y(null), et(ef()), eu(!1), B()
                },
                children: [(0, t.jsx)(d.RotateCcw, {
                  className: "h-3.5 w-3.5"
                }), "Dùng thư mục mặc định"]
              }) : null]
            }), ek ? (0, t.jsxs)("div", {
              className: "space-y-2 rounded-lg border border-border bg-primary/5 p-3",
              children: [(0, t.jsxs)("div", {
                className: "flex items-center justify-between gap-3",
                children: [(0, t.jsx)("p", {
                  className: "truncate text-xs text-muted-foreground",
                  children: ek.message
                }), (0, t.jsxs)("span", {
                  className: "font-mono text-xs text-primary",
                  children: [Math.round(ek.percent), "%"]
                })]
              }), (0, t.jsx)(f.Progress, {
                value: ek.percent,
                className: "h-1.5"
              }), (0, t.jsxs)("p", {
                className: "text-[10px] text-muted-foreground",
                children: [ev(ek.completedCues), " / ", ev(ek.totalCues), " đoạn đọc"]
              })]
            }) : null, eP ? (0, t.jsxs)("div", {
              className: "space-y-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3",
              children: [(0, t.jsx)("p", {
                className: "text-xs font-semibold text-emerald-700 dark:text-emerald-300",
                children: "Đã tạo audio"
              }), (0, t.jsx)("p", {
                className: "break-all text-[10px] text-muted-foreground",
                children: eP.outputPath
              }), (0, t.jsxs)("div", {
                className: "grid grid-cols-3 gap-2",
                children: [(0, t.jsxs)(m.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-8 text-xs",
                  onClick: () => void eB(),
                  children: [el ? (0, t.jsx)(l.Pause, {
                    className: "h-3.5 w-3.5"
                  }) : (0, t.jsx)(u.Play, {
                    className: "h-3.5 w-3.5"
                  }), "Nghe"]
                }), (0, t.jsx)(m.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-8 text-xs",
                  onClick: () => void(0, N.openPathInSystem)(eP.outputPath),
                  children: "Mở"
                }), (0, t.jsxs)(m.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-8 text-xs",
                  onClick: () => void eH(eP.outputPath),
                  children: [(0, t.jsx)(s.FolderOpen, {
                    className: "h-3.5 w-3.5"
                  }), "Hiện file"]
                })]
              }), (0, t.jsx)("audio", {
                ref: e,
                src: eF ?? void 0,
                onEnded: () => eu(!1),
                onPause: () => eu(!1),
                hidden: !0
              })]
            }) : null]
          })]
        })
      }), (0, t.jsx)(x.Dialog, {
        open: !!ed,
        onOpenChange: e => {
          e || eb(null)
        },
        children: (0, t.jsxs)(x.DialogContent, {
          children: [(0, t.jsxs)(x.DialogHeader, {
            children: [(0, t.jsx)(x.DialogTitle, {
              children: "Cần nạp phút"
            }), (0, t.jsx)(x.DialogDescription, {
              children: ed ?? "Bạn cần có phút trả phí để sử dụng Giọng DichVideo."
            })]
          }), (0, t.jsxs)(x.DialogFooter, {
            children: [(0, t.jsx)(m.Button, {
              type: "button",
              variant: "outline",
              onClick: () => eb(null),
              children: "Đóng"
            }), (0, t.jsx)(m.Button, {
              type: "button",
              onClick: () => {
                eb(null), E()
              },
              children: "Nạp phút"
            })]
          })]
        })
      })]
    })
  }], 45909)
}, 27431, e => {
  e.v(e => Promise.resolve().then(() => e(68078)))
}, 70578, e => {
  e.v(t => Promise.all(["static/chunks/05-hc5mcv332i.js"].map(t => e.l(t))).then(() => t(12315)))
}]);