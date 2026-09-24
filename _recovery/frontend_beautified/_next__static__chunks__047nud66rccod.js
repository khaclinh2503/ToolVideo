(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 14702, (e, t, r) => {
  t.exports = {
    schemaVersion: "watermark-motion-v1",
    durationMultiplier: 2,
    customerPreviewBaseCycleMs: 18e3,
    protectionPreviewBaseCycleMs: [17e3, 19e3, 21e3, 23e3],
    exportBaseCycleMs: 5e4,
    exportWaypointCount: 5
  }
}, 36417, e => {
  e.v(function(t, r) {
    return e.b(t, "static/chunks/turbopack-worker-0sjn--fhq~1cg.js", ["static/chunks/0t._tcqrc4n50.js", "static/chunks/turbopack-008.8k4i6r.rh.js"], r)
  })
}, 76722, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    i = e.i(46696),
    a = e.i(78001),
    n = e.i(62368),
    s = e.i(80796),
    o = e.i(94004),
    l = e.i(49817),
    c = e.i(32781),
    d = e.i(63453),
    u = e.i(56522),
    h = e.i(56420);
  let p = (0, h.default)("sliders-horizontal", [
    ["path", {
      d: "M10 5H3",
      key: "1qgfaw"
    }],
    ["path", {
      d: "M12 19H3",
      key: "yhmn1j"
    }],
    ["path", {
      d: "M14 3v4",
      key: "1sua03"
    }],
    ["path", {
      d: "M16 17v4",
      key: "1q0r14"
    }],
    ["path", {
      d: "M21 12h-9",
      key: "1o4lsq"
    }],
    ["path", {
      d: "M21 19h-5",
      key: "1rlt1p"
    }],
    ["path", {
      d: "M21 5h-7",
      key: "1oszz2"
    }],
    ["path", {
      d: "M8 10v4",
      key: "tgpxqk"
    }],
    ["path", {
      d: "M8 12H3",
      key: "a7s4jb"
    }]
  ]);
  var m = e.i(86563);
  let g = (0, h.default)("captions", [
    ["rect", {
      width: "18",
      height: "14",
      x: "3",
      y: "5",
      rx: "2",
      ry: "2",
      key: "12ruh7"
    }],
    ["path", {
      d: "M7 15h4M15 15h2M7 11h2M13 11h4",
      key: "1ueiar"
    }]
  ]);
  var x = e.i(73474),
    f = e.i(23827),
    v = e.i(94533),
    b = e.i(87486),
    y = e.i(19455),
    w = e.i(57428),
    j = e.i(76639),
    k = e.i(93479),
    S = e.i(68148),
    N = e.i(67489),
    C = e.i(77572);

  function M({
    children: e
  }) {
    return (0, t.jsx)("div", {
      "data-editor-action-toolbar": !0,
      className: "flex min-h-10 items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card/45 px-2 py-1.5",
      children: e
    })
  }
  let _ = (0, h.default)("badge-cent", [
    ["path", {
      d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      key: "3c2336"
    }],
    ["path", {
      d: "M12 7v10",
      key: "jspqdw"
    }],
    ["path", {
      d: "M15.4 10a4 4 0 1 0 0 4",
      key: "2eqtx8"
    }]
  ]);
  var P = e.i(41120),
    T = e.i(59684),
    E = e.i(98534),
    R = e.i(75157);
  e.i(89268);
  var I = e.i(81341),
    V = e.i(20829),
    A = e.i(56260),
    F = e.i(89290),
    D = e.i(17245),
    L = e.i(78238),
    z = e.i(54302),
    B = e.i(72888),
    O = e.i(24614),
    $ = e.i(76223),
    H = e.i(62138),
    q = e.i(38991),
    K = e.i(57342),
    X = e.i(44318),
    G = e.i(55313),
    W = e.i(65991);
  let U = [{
      provider: "edge_tts",
      voice: "vi-VN-NamMinhNeural-Male",
      label: "Edge · Nam Minh (Nam)"
    }, {
      provider: "edge_tts",
      voice: "vi-VN-HoaiMyNeural-Female",
      label: "Edge · Hoài Mỹ (Nữ)"
    }],
    Y = new Set;

  function J(e, t) {
    return e.captions.find(e => e.captionId === t)?.translatedText ?? ""
  }

  function Z(e) {
    let t = G.useTtssieureStore.getState();
    for (let r of e.salvagedVoices ?? []) t.markSavedVoiceVerified(r.provider, r.voiceId)
  }

  function Q() {
    let e = (0, W.useVideoStore)(e => e.videos.find(t => t.id === e.activeVideoId)),
      r = e?.nleDocument;
    return e && r && (r.captions?.length ?? 0) !== 0 ? (0, t.jsx)(ee, {
      video: e,
      document: r
    }) : null
  }

  function ee({
    video: e,
    document: i
  }) {
    let a = e.id,
      n = e.billingTargetLanguage ?? "vi",
      s = (0, G.useTtssieureStore)(e => e.keyStatus),
      o = (0, G.useTtssieureStore)(e => e.catalogs),
      l = (0, G.useTtssieureStore)(e => e.dashboardSelection),
      d = (0, G.useTtssieureStore)(e => e.voicePrefs),
      u = (0, G.useTtssieureStore)(e => e.savedVoices),
      h = (0, G.useTtssieureStore)(e => e.dialogRequest),
      p = (0, X.useSubtitleStore)(e => e.selectedSubtitleId),
      m = (0, K.useCloudStore)(e => e.license),
      g = (0, K.useCloudStore)(e => e.balance),
      x = (0, A.shouldPreferNoWatermarkForLocalJob)({
        license: m,
        balance: g
      }),
      [f, v] = (0, r.useState)(!1),
      [b, k] = (0, r.useState)(""),
      [S, N] = (0, r.useState)("missing"),
      [C, M] = (0, r.useState)(new Set),
      [P, Q] = (0, r.useState)(null),
      [er, ei] = (0, r.useState)(null),
      [ea, en] = (0, r.useState)(null),
      [es, eo] = (0, r.useState)([]),
      [el, ec] = (0, r.useState)(null),
      ed = s?.configured === !0,
      eu = (0, r.useCallback)(() => {
        k((0, $.mintTtssieureClientBatchId)()), ei(null), en(null), eo([]), v(!0)
      }, []);
    (0, r.useEffect)(() => {
      if (!f) return;
      let e = G.useTtssieureStore.getState();
      if (e.refreshKeyStatus().catch(() => {}), e.keyStatus?.configured)
        for (let t of $.TTSSIEURE_PROVIDERS) e.loadCatalog(t).catch(() => {});
      (0, O.ttssieureReconcile)(a).then(e => {
        eo(e.candidates ?? []), Z(e)
      }).catch(() => {})
    }, [f, a, n]);
    let eh = (0, r.useMemo)(() => $.TTSSIEURE_PROVIDERS.map(e => {
      let t = o[e],
        r = t?.snapshot,
        i = (0, $.ttssieureModelInfo)(r),
        a = i?.modelId ?? $.TTSSIEURE_ALLOWED_MODELS[e],
        s = (0, $.ttssieureLanguageSupport)(e, n, r),
        l = u.filter(t => t.provider === e);
      return {
        provider: e,
        modelId: a,
        model: i,
        support: s,
        voices: l,
        entry: t
      }
    }), [o, n, u]);
    (0, r.useEffect)(() => {
      let e = i.ttssieureSelection;
      e && G.useTtssieureStore.getState().addSavedVoice({
        provider: e.provider,
        voiceId: e.voiceId
      })
    }, [i.ttssieureSelection]), (0, r.useEffect)(() => {
      if (!f || P) return;
      let t = i.ttssieureSelection,
        r = l?.targetLang === (0, $.normalizeTtssieureTargetLang)(n) ? l : null,
        a = d[(0, $.normalizeTtssieureTargetLang)(n)],
        s = t ?? r ?? a ?? null;
      if (s) return void Q({
        kind: "paid",
        provider: s.provider,
        modelId: s.modelId,
        voiceId: s.voiceId,
        label: `TTSSieure \xb7 ${s.voiceId}`
      });
      let o = e.nativeTtsVoice;
      if (o && !(0, $.isTtssieureVoiceName)(o)) return void Q({
        kind: "free",
        provider: e.nativeTtsProvider ?? e.billingTtsProvider ?? "edge_tts",
        voice: o,
        label: `Giọng hiện tại \xb7 ${o}`
      });
      let c = eh.flatMap(e => e.voices.map(t => ({
        group: e,
        voice: t
      }))).find(({
        group: e,
        voice: t
      }) => e.support.supported && !!t.voiceId);
      if (c && ed) return void Q({
        kind: "paid",
        provider: c.group.provider,
        modelId: c.group.modelId,
        voiceId: c.voice.voiceId,
        label: c.voice.name
      });
      let u = U[0];
      u && Q({
        kind: "free",
        provider: u.provider,
        voice: u.voice,
        label: u.label
      })
    }, [f, P, i.ttssieureSelection, l, d, n, e, eh, ed]);
    let ep = (0, r.useMemo)(() => {
        if (P?.kind === "paid") return (0, $.ttssieureVoiceOptionId)(P.provider, P.modelId, P.voiceId);
        if (P?.kind === "free") return (0, B.isVieNeuTurboVoiceId)(P.voice) ? P.voice : (0, E.premiumVoiceSelectOptions)().find(e => e.provider === P.provider && e.voice === P.voice)?.id ?? (0, E.premiumVoiceSelectOptions)().find(e => e.voice === P.voice)?.id;
        let t = i.ttssieureSelection;
        if (t) return (0, $.ttssieureVoiceOptionId)(t.provider, t.modelId, t.voiceId);
        let r = e.nativeTtsVoice;
        if (r && !(0, $.isTtssieureVoiceName)(r)) return (0, B.isVieNeuTurboVoiceId)(r) ? r : (0, E.premiumVoiceSelectOptions)().find(e => e.voice === r)?.id
      }, [P, i.ttssieureSelection, e.nativeTtsVoice]),
      em = (0, r.useCallback)(e => {
        let t = (0, $.parseTtssieureVoiceId)(e);
        if (t?.modelId) {
          Q({
            kind: "paid",
            provider: t.provider,
            modelId: t.modelId,
            voiceId: t.voiceId,
            label: `TTSSieure \xb7 ${t.voiceId}`
          }), eu();
          return
        }
        let r = (0, E.selectedVoiceOption)(e);
        if (!r) return;
        let i = (0, V.routeForVoiceMode)(e);
        Q({
          kind: "free",
          provider: i.provider,
          voice: i.voice,
          label: r.label
        }), eu()
      }, [eu]),
      eg = (0, r.useCallback)(async e => {
        try {
          await (0, F.playPremiumVoicePreview)(e)
        } catch (t) {
          if ((0, L.viralVoiceNeedsSettings)(t) && q.useAppStore.getState().setCapCutLoginOpen(!0), (0, z.isVieNeuVoiceId)(e) && ((0, D.isVieNeuRuntimeMissingError)(t) || (0, D.isVieNeuCanceledError)(t))) return;
          await (0, I.showMessage)("Chưa tạo được mẫu giọng", `${(0,z.isVieNeuVoiceId)(e)?(0,D.vieneuVoiceErrorText)(t):(0,L.viralVoiceErrorText)(t)}

C\xe2u demo: ${(0,F.premiumVoicePreviewText)(e)}`, "warning")
        }
      }, []);
    (0, r.useEffect)(() => {
      Y.has(a) || !(i.ttssieureSelection ?? (l?.targetLang === (0, $.normalizeTtssieureTargetLang)(n) ? l : null)) || (Y.add(a), (0, O.ttssieureReconcile)(a).then(async e => {
        eo(e.candidates ?? []), Z(e), (e.salvaged?.length ?? 0) > 0 && await W.useVideoStore.getState().openNleProject(a).catch(() => !1)
      }).catch(() => {}), 0 !== (0, $.ttssieureUnvoicedCaptionIds)(i.captions, i.voiceCues).length && eu())
    }, [a, i, l, n, eu]), (0, r.useEffect)(() => {
      h?.projectId === a && (G.useTtssieureStore.getState().consumeDialogRequest(a), eu())
    }, [h, a, eu]);
    let ex = (0, r.useMemo)(() => (0, $.resolveTtssieureScopeCaptionIds)({
      scope: S,
      captions: i.captions,
      voiceCues: i.voiceCues,
      selectedCaptionId: p
    }), [S, i.captions, i.voiceCues, p]);
    (0, r.useEffect)(() => {
      f && M(new Set(ex))
    }, [f, ex]);
    let ef = (0, r.useMemo)(() => ex.filter(e => C.has(e)), [ex, C]),
      ev = (0, r.useMemo)(() => ef.reduce((e, t) => e + (0, $.countTtssieureCharacters)(J(i, t)), 0), [ef, i]),
      eb = (0, r.useMemo)(() => {
        if (P?.kind !== "paid") return null;
        let e = eh.find(e => e.provider === P.provider);
        return e?.model ?? null
      }, [P, eh]),
      ey = (0, r.useMemo)(() => P?.kind === "paid" ? (0, $.estimateTtssieureCredits)(ev, eb) : null, [P, ev, eb]),
      ew = eb?.maxChars,
      ej = (0, r.useMemo)(() => "number" == typeof ew && ew > 0 ? ef.filter(e => (0, $.countTtssieureCharacters)(J(i, e)) > ew) : [], [ef, i, ew]),
      ek = (0, r.useMemo)(() => ef.filter(e => !ej.includes(e)), [ef, ej]),
      eS = (0, r.useMemo)(() => {
        if (P?.kind !== "paid") return !0;
        let e = eh.find(e => e.provider === P.provider);
        return e?.support.supported === !0
      }, [P, eh]),
      eN = s?.balance,
      eC = P?.kind === "paid" && ey?.kind === "estimate" && "number" == typeof eN && eN < ey.credits,
      eM = null !== el || !P || 0 === ek.length || "paid" === P.kind && (!ed || !eS || eC);
    (0, r.useEffect)(() => {
      if (!er || er.finished) return;
      let e = !1,
        t = async () => {
          try {
            let t = await (0, O.ttssieureGenerateStatus)({
              batchId: er.batchId
            });
            if (e) return;
            ei(t), G.useTtssieureStore.getState().setBatchStatus(a, t), t.finished && (P?.kind === "paid" && t.cues.some(e => "completed" === e.state) && G.useTtssieureStore.getState().markSavedVoiceVerified(P.provider, P.voiceId), await W.useVideoStore.getState().openNleProject(a).catch(() => !1))
          } catch {}
        }, r = window.setInterval(() => void t(), 1500);
      return t(), () => {
        e = !0, window.clearInterval(r)
      }
    }, [er?.batchId, er?.finished, a]);
    let e_ = async () => {
      if (P && 0 !== ek.length && !el) {
        ec("confirm"), en(null);
        try {
          if ("free" === P.kind) {
            let t = await (0, H.runNleVoiceRegenerateForCaptions)({
              videoId: a,
              video: e,
              get: () => W.useVideoStore.getState(),
              captionIds: ek,
              ttsProvider: P.provider,
              ttsVoice: P.voice
            });
            en(`Đ\xe3 tạo ${t} c\xe2u bằng giọng miễn ph\xed.`);
            return
          }
          let t = eh.find(e => e.provider === P.provider),
            r = t?.support.languageCode ?? (0, $.ttssieureLanguageSupport)(P.provider, n, t?.entry?.snapshot).languageCode,
            s = await Promise.all(ek.map(async e => ({
              cueId: (0, $.ttssieureApprovalCueId)(e, i.voiceCues),
              textHash: await (0, $.ttssieureCaptionTextHash)(J(i, e))
            }))),
            o = await (0, $.computeTtssieureApprovalHash)({
              provider: P.provider,
              modelId: P.modelId,
              voiceId: P.voiceId,
              voiceSettings: {},
              languageCode: r,
              cues: s
            }),
            l = await (0, O.ttssieureGenerateStart)({
              projectId: a,
              scope: S,
              captionIds: ek,
              provider: P.provider,
              modelId: P.modelId,
              voiceId: P.voiceId,
              voiceSettings: {},
              clientBatchId: b,
              approvalHash: o,
              expectedRevision: i.revision,
              targetLanguage: n
            });
          ei({
            batchId: l.batchId,
            projectId: a,
            cues: ek.map(e => ({
              captionId: e,
              state: "intent"
            })),
            finished: !1,
            cancelled: !1
          }), G.useTtssieureStore.getState().rememberVoicePreference((0, $.normalizeTtssieureTargetLang)(n), {
            provider: P.provider,
            modelId: P.modelId,
            voiceId: P.voiceId,
            displayName: P.label
          })
        } catch (e) {
          en((0, $.ttssieureErrorMessage)(e))
        } finally {
          ec(null)
        }
      }
    }, eP = async () => {
      if (er && !el) {
        ec("cancel");
        try {
          await (0, O.ttssieureGenerateCancel)(er.batchId);
          let e = (0, $.ttssieureSubmittedCount)(er.cues);
          en(`Đ\xe3 gửi ${e} c\xe2u — TTSSieure c\xf3 thể đ\xe3 trừ credit cho c\xe1c c\xe2u n\xe0y.`), ei({
            ...er,
            cancelled: !0
          })
        } catch (e) {
          en((0, $.ttssieureErrorMessage)(e))
        } finally {
          ec(null)
        }
      }
    }, eT = async () => {
      if (er && !el) {
        ec("sync");
        try {
          let e = await (0, O.ttssieureGenerateStatus)({
            batchId: er.batchId
          });
          ei(e)
        } catch (e) {
          en((0, $.ttssieureErrorMessage)(e))
        } finally {
          ec(null)
        }
      }
    }, eE = async () => {
      if (!el) {
        ec("sync");
        try {
          let e = await (0, O.ttssieureReconcile)(a);
          eo(e.candidates ?? []), Z(e);
          let t = await (0, O.ttssieureGenerateStatus)({
            projectId: a
          }).catch(() => null);
          t && ei(t), await W.useVideoStore.getState().openNleProject(a).catch(() => !1)
        } catch (e) {
          en((0, $.ttssieureErrorMessage)(e))
        } finally {
          ec(null)
        }
      }
    };
    return (0, t.jsxs)(t.Fragment, {
      children: [(0, t.jsx)(E.PremiumVoiceSelect, {
        value: ep,
        onValueChange: em,
        onPreview: e => void eg(e),
        dichVideoProcessingEnabled: x,
        onTopUpMinutes: () => q.useAppStore.getState().openAccountPricingSettings(),
        targetLang: n,
        className: "h-8",
        triggerClassName: "min-h-8 h-8 rounded-lg border-border bg-background px-2.5 font-medium text-foreground shadow-xs hover:bg-muted hover:text-foreground"
      }), er ? (0, t.jsxs)(y.Button, {
        type: "button",
        variant: "outline",
        size: "sm",
        className: "h-8 shrink-0 gap-1.5 text-xs",
        onClick: () => v(!0),
        title: "Xem tiến trình tạo giọng đọc",
        children: [er.finished || er.cancelled ? null : (0, t.jsx)(c.Loader2, {
          className: "h-3.5 w-3.5 animate-spin"
        }), er.finished ? "Kết quả giọng đọc" : er.cancelled ? "Batch đã hủy" : "Đang tạo giọng…"]
      }) : null, (0, t.jsx)(j.Dialog, {
        open: f,
        onOpenChange: v,
        children: (0, t.jsxs)(j.DialogContent, {
          className: "flex max-h-[85vh] w-[min(42rem,calc(100vw-2rem))] flex-col overflow-hidden",
          children: [(0, t.jsxs)(j.DialogHeader, {
            children: [(0, t.jsx)(j.DialogTitle, {
              className: "text-sm",
              children: "Tạo giọng đọc"
            }), (0, t.jsxs)(j.DialogDescription, {
              className: "text-[11px]",
              children: ["Giọng đã chọn: ", P?.label ?? "—", ". Chỉ tạo lại âm thanh, không xử lý lại video."]
            })]
          }), (0, t.jsx)("div", {
            className: "flex-1 space-y-3 overflow-y-auto pr-1",
            children: er ? (0, t.jsx)(et, {
              batch: er,
              document: i,
              candidates: es,
              busy: el,
              onCheckStatus: eT,
              onReloadResults: eE,
              onRetryFailed: () => {
                if (!er) return;
                let e = er.cues.filter(e => "failed" === e.state || "failed_credits" === e.state).map(e => e.captionId);
                0 !== e.length && (k((0, $.mintTtssieureClientBatchId)()), ei(null), eo([]), M(new Set(e)), en("Thử lại sẽ trừ credit lại cho các câu đã chọn — kiểm tra kỹ trước khi duyệt."))
              },
              onCancel: eP
            }) : (0, t.jsxs)(t.Fragment, {
              children: [(0, t.jsxs)("section", {
                className: "space-y-1.5",
                children: [(0, t.jsx)("p", {
                  className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
                  children: "Phạm vi"
                }), (0, t.jsx)("div", {
                  className: "flex gap-1",
                  children: [{
                    id: "selected",
                    label: "Câu đang chọn"
                  }, {
                    id: "missing",
                    label: "Câu thiếu giọng"
                  }, {
                    id: "all",
                    label: "Toàn bộ câu"
                  }].map(e => (0, t.jsx)("button", {
                    type: "button",
                    "data-scope": e.id,
                    onClick: () => N(e.id),
                    className: (0, R.cn)("h-7 rounded-md border border-border px-2.5 text-xs transition-colors", S === e.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"),
                    children: e.label
                  }, e.id))
                }), 0 === ex.length ? (0, t.jsx)("p", {
                  className: "rounded-md bg-muted/50 px-2 py-1.5 text-[11px] text-muted-foreground",
                  children: "selected" === S ? "Chưa chọn câu phụ đề nào trong danh sách." : "missing" === S ? "Không có câu nào thiếu giọng." : "Không có câu phụ đề nào."
                }) : (0, t.jsx)(T.ScrollArea, {
                  className: "max-h-40 rounded-md border border-border",
                  children: (0, t.jsx)("div", {
                    className: "divide-y divide-border/50",
                    children: ex.map(e => {
                      let r = i.captions.find(t => t.captionId === e),
                        a = "number" == typeof ew && P?.kind === "paid" && (0, $.countTtssieureCharacters)(r?.translatedText ?? "") > ew;
                      return (0, t.jsxs)("label", {
                        className: "flex cursor-pointer items-start gap-2 px-2 py-1.5 text-xs hover:bg-muted/40",
                        children: [(0, t.jsx)(w.Checkbox, {
                          checked: C.has(e),
                          onCheckedChange: t => {
                            M(r => {
                              let i = new Set(r);
                              return !0 === t ? i.add(e) : i.delete(e), i
                            })
                          }
                        }), (0, t.jsxs)("span", {
                          className: "min-w-0 flex-1",
                          children: [(0, t.jsx)("span", {
                            className: (0, R.cn)("block truncate", a && "text-destructive"),
                            children: r?.translatedText || e
                          }), (0, t.jsxs)("span", {
                            className: "block text-[10px] text-muted-foreground",
                            children: [(0, $.countTtssieureCharacters)(r?.translatedText ?? ""), " ký tự", a ? ` \xb7 vượt giới hạn ${ew}` : ""]
                          })]
                        })]
                      }, e)
                    })
                  })
                })]
              }), (0, t.jsxs)("section", {
                className: "space-y-1.5 rounded-md border border-border bg-muted/20 p-3",
                children: [(0, t.jsxs)("p", {
                  className: "text-xs",
                  children: [(0, t.jsx)("span", {
                    className: "font-semibold",
                    children: ek.length
                  }), " câu ·", " ", (0, t.jsx)("span", {
                    className: "font-semibold",
                    children: ev
                  }), " ký tự", P ? ` \xb7 ${P.label}` : ""]
                }), ej.length > 0 ? (0, t.jsxs)("p", {
                  className: "text-[11px] text-destructive",
                  children: [ej.length, " câu vượt giới hạn ký tự của model — đã loại khỏi lượt này."]
                }) : null, P?.kind === "paid" ? (0, t.jsxs)(t.Fragment, {
                  children: [(0, t.jsxs)("p", {
                    className: "text-[11px] text-muted-foreground",
                    children: ["Ước tính: ", ey ? (0, $.formatTtssieureEstimate)(ey) : "…", "number" == typeof eN ? ` \xb7 Số dư: ${eN} credit` : ""]
                  }), eC && ey?.kind === "estimate" ? (0, t.jsxs)("p", {
                    className: "text-[11px] font-semibold text-destructive",
                    children: ["Không đủ credit — cần ~", ey.credits, ", còn ", eN, ". Nạp thêm trên ttssieure.com."]
                  }) : null, (0, t.jsx)("p", {
                    className: "text-[10px] leading-4 text-muted-foreground",
                    children: "Phụ đề sẽ được gửi tới TTSSieure; phí trừ vào tài khoản TTSSieure của bạn."
                  })]
                }) : (0, t.jsx)("p", {
                  className: "text-[11px] text-muted-foreground",
                  children: "miễn phí — không trừ credit"
                }), ea ? (0, t.jsx)("p", {
                  className: "text-[11px] text-amber-600 dark:text-amber-400",
                  children: ea
                }) : null]
              })]
            })
          }), er ? null : (0, t.jsxs)("div", {
            className: "flex items-center justify-end gap-2 pt-1",
            children: [(0, t.jsx)(y.Button, {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => v(!1),
              children: "Đóng"
            }), (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              className: "h-8 gap-1.5 text-xs",
              disabled: eM,
              onClick: () => void e_(),
              children: ["confirm" === el ? (0, t.jsx)(c.Loader2, {
                className: "h-3.5 w-3.5 animate-spin"
              }) : (0, t.jsx)(_, {
                className: "h-3.5 w-3.5"
              }), P?.kind === "paid" ? "Duyệt & tạo (trừ credit)" : "Tạo giọng đọc (miễn phí)"]
            })]
          })]
        })
      })]
    })
  }

  function et({
    batch: e,
    document: r,
    candidates: i,
    busy: a,
    onCheckStatus: n,
    onReloadResults: s,
    onRetryFailed: o,
    onCancel: l
  }) {
    let c = (0, $.ttssieureBatchCounts)(e.cues),
      d = e.cues.filter(e => "failed" === e.state || "failed_credits" === e.state).length,
      u = e.cues.filter(e => "uncertain" === e.state || "uncertain_remote" === e.state).length;
    return (0, t.jsxs)("section", {
      className: "space-y-2",
      children: [(0, t.jsx)("p", {
        className: "text-xs font-semibold",
        children: e.finished ? `${c.completed}/${c.total} c\xe2u th\xe0nh c\xf4ng` : e.cancelled ? "Đã hủy" : "Đang tạo giọng…"
      }), (0, t.jsx)("div", {
        className: "divide-y divide-border/50 rounded-md border border-border",
        children: e.cues.map(e => {
          let i = r.captions.find(t => t.captionId === e.captionId),
            a = (0, $.ttssieureCueStateTone)(e.state);
          return (0, t.jsxs)("div", {
            className: "flex items-center gap-2 px-2 py-1.5 text-xs",
            children: [(0, t.jsx)("span", {
              className: (0, R.cn)("h-1.5 w-1.5 shrink-0 rounded-full", "ok" === a && "bg-emerald-500", "error" === a && "bg-destructive", "warn" === a && "bg-amber-500", "active" === a && "animate-pulse bg-sky-500", "pending" === a && "bg-muted-foreground/40")
            }), (0, t.jsx)("span", {
              className: "min-w-0 flex-1 truncate",
              children: i?.translatedText || e.captionId
            }), (0, t.jsxs)("span", {
              className: "shrink-0 text-[10px] text-muted-foreground",
              children: [(0, $.ttssieureCueStateLabel)(e.state), e.detail ? ` \xb7 ${e.detail}` : ""]
            })]
          }, e.captionId)
        })
      }), u > 0 && i.length > 0 ? (0, t.jsxs)("div", {
        className: "space-y-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5",
        children: [(0, t.jsxs)("p", {
          className: "text-[11px] font-semibold text-amber-700 dark:text-amber-400",
          children: [u, " câu chưa xác định — kiểm tra task trên ttssieure.com trước khi gửi lại."]
        }), i.map(e => (0, t.jsxs)("p", {
          className: "text-[10px] text-muted-foreground",
          children: ["task ", e.taskId, e.status ? ` \xb7 ${e.status}` : "", e.createdAt ? ` \xb7 ${e.createdAt}` : "", "number" == typeof e.chars ? ` \xb7 ${e.chars} k\xfd tự` : ""]
        }, e.taskId))]
      }) : null, (0, t.jsxs)("div", {
        className: "flex flex-wrap items-center gap-2 pt-1",
        children: [(0, t.jsxs)(y.Button, {
          type: "button",
          variant: "outline",
          size: "sm",
          className: "h-7 gap-1.5 text-[11px]",
          disabled: null !== a,
          onClick: n,
          children: [(0, t.jsx)(P.RefreshCw, {
            className: (0, R.cn)("h-3 w-3", "sync" === a && "animate-spin")
          }), "Kiểm tra trạng thái"]
        }), (0, t.jsx)(y.Button, {
          type: "button",
          variant: "outline",
          size: "sm",
          className: "h-7 gap-1.5 text-[11px]",
          disabled: null !== a,
          onClick: s,
          children: "Tải lại kết quả"
        }), d > 0 && e.finished ? (0, t.jsx)(y.Button, {
          type: "button",
          variant: "outline",
          size: "sm",
          className: "h-7 gap-1.5 text-[11px] text-amber-600 dark:text-amber-400",
          disabled: null !== a,
          onClick: o,
          children: "Thử lại (tính phí lại)"
        }) : null, e.finished || e.cancelled ? null : (0, t.jsx)(y.Button, {
          type: "button",
          variant: "ghost",
          size: "sm",
          className: "ml-auto h-7 text-[11px] text-destructive",
          disabled: null !== a,
          onClick: l,
          children: "Hủy batch"
        })]
      })]
    })
  }
  let er = (0, h.default)("replace", [
    ["path", {
      d: "M14 4a1 1 0 0 1 1-1",
      key: "dhj8ez"
    }],
    ["path", {
      d: "M15 10a1 1 0 0 1-1-1",
      key: "1mnyi5"
    }],
    ["path", {
      d: "M21 4a1 1 0 0 0-1-1",
      key: "sfs9ap"
    }],
    ["path", {
      d: "M21 9a1 1 0 0 1-1 1",
      key: "mp6qeo"
    }],
    ["path", {
      d: "m3 7 3 3 3-3",
      key: "x25e72"
    }],
    ["path", {
      d: "M6 10V5a2 2 0 0 1 2-2h2",
      key: "15xut4"
    }],
    ["rect", {
      x: "3",
      y: "14",
      width: "7",
      height: "7",
      rx: "1",
      key: "1bkyp8"
    }]
  ]);
  var ei = e.i(68877),
    ea = e.i(24071),
    en = e.i(67927);
  let es = (0, h.default)("list-checks", [
      ["path", {
        d: "M13 5h8",
        key: "a7qcls"
      }],
      ["path", {
        d: "M13 12h8",
        key: "h98zly"
      }],
      ["path", {
        d: "M13 19h8",
        key: "c3s6r1"
      }],
      ["path", {
        d: "m3 17 2 2 4-4",
        key: "1jhpwq"
      }],
      ["path", {
        d: "m3 7 2 2 4-4",
        key: "1obspn"
      }]
    ]),
    eo = (0, h.default)("settings-2", [
      ["path", {
        d: "M14 17H5",
        key: "gfn3mx"
      }],
      ["path", {
        d: "M19 7h-9",
        key: "6i9tg"
      }],
      ["circle", {
        cx: "17",
        cy: "17",
        r: "3",
        key: "18b49y"
      }],
      ["circle", {
        cx: "7",
        cy: "7",
        r: "3",
        key: "dfmy0x"
      }]
    ]),
    el = (0, h.default)("arrow-left", [
      ["path", {
        d: "m12 19-7-7 7-7",
        key: "1l729n"
      }],
      ["path", {
        d: "M19 12H5",
        key: "x3x0zl"
      }]
    ]);
  var ec = e.i(89664),
    ed = e.i(15281),
    eu = e.i(77071),
    eh = e.i(63676),
    ep = e.i(99375),
    em = e.i(92719);

  function eg(e) {
    return e.trim().toLocaleLowerCase("vi-VN")
  }

  function ex(e, t, r, i) {
    let a = e.trim();
    if (!a) return "Hãy nhập từ hoặc cụm từ cần tìm.";
    let n = eg(a);
    return r.some(e => e.id !== i && eg(e.from) === n) ? "Cụm từ này đã có trong danh sách." : null
  }

  function ef({
    onBack: e
  }) {
    let i = (0, em.useSettingsStore)(e => e.settings.replacementPairs),
      a = (0, em.useSettingsStore)(e => e.addReplacementPair),
      n = (0, em.useSettingsStore)(e => e.updateReplacementPair),
      s = (0, em.useSettingsStore)(e => e.removeReplacementPair),
      [o, l] = (0, r.useState)(""),
      [c, d] = (0, r.useState)(""),
      [u, h] = (0, r.useState)(null),
      [p, m] = (0, r.useState)(""),
      [g, f] = (0, r.useState)(""),
      v = (0, r.useMemo)(() => ex(o, c, i), [o, i, c]),
      b = (0, r.useMemo)(() => ex(p, g, i, u ?? void 0), [p, u, g, i]),
      w = () => {
        h(null), m(""), f("")
      },
      j = () => {
        u && !b && (n(u, {
          from: p,
          to: g
        }), w())
      };
    return (0, t.jsxs)("div", {
      className: "space-y-4",
      children: [(0, t.jsxs)("div", {
        className: "flex items-center gap-2",
        children: [(0, t.jsx)(y.Button, {
          type: "button",
          size: "icon-sm",
          variant: "ghost",
          title: "Quay lại tìm và thay thế",
          "aria-label": "Quay lại tìm và thay thế",
          onClick: e,
          children: (0, t.jsx)(el, {
            className: "h-4 w-4"
          })
        }), (0, t.jsxs)("div", {
          children: [(0, t.jsx)("h3", {
            className: "text-sm font-semibold",
            children: "Quản lý cặp đã lưu"
          }), (0, t.jsx)("p", {
            className: "text-xs text-muted-foreground",
            children: "Dùng chung cho mọi video trên máy này."
          })]
        })]
      }), (0, t.jsxs)("div", {
        className: "grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_auto]",
        children: [(0, t.jsxs)("label", {
          className: "space-y-1 text-xs font-medium",
          children: [(0, t.jsx)("span", {
            children: "Tìm"
          }), (0, t.jsx)(k.Input, {
            value: o,
            placeholder: "Từ hoặc cụm từ",
            onChange: e => l(e.target.value)
          })]
        }), (0, t.jsx)(ei.ArrowRight, {
          className: "mb-2 hidden h-4 w-4 text-muted-foreground sm:block"
        }), (0, t.jsxs)("label", {
          className: "space-y-1 text-xs font-medium",
          children: [(0, t.jsx)("span", {
            children: "Thay bằng"
          }), (0, t.jsx)(k.Input, {
            value: c,
            placeholder: "Để trống nếu muốn xóa",
            onChange: e => d(e.target.value)
          })]
        }), (0, t.jsxs)(y.Button, {
          type: "button",
          size: "sm",
          className: "h-8",
          disabled: !!v,
          onClick: () => {
            v || (a(o, c), l(""), d(""))
          },
          children: [(0, t.jsx)(eu.Plus, {
            className: "h-3.5 w-3.5"
          }), "Thêm"]
        })]
      }), o && v ? (0, t.jsx)("p", {
        className: "text-xs text-destructive",
        children: v
      }) : null, (0, t.jsx)(T.ScrollArea, {
        className: "max-h-[44vh] pr-3",
        children: (0, t.jsx)("div", {
          className: "divide-y divide-border border-y border-border",
          children: 0 === i.length ? (0, t.jsx)("p", {
            className: "py-8 text-center text-sm text-muted-foreground",
            children: "Chưa có cặp thay thế nào."
          }) : i.map(e => (0, t.jsx)("div", {
            className: "py-3",
            children: u === e.id ? (0, t.jsxs)("div", {
              className: "grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_auto_auto]",
              children: [(0, t.jsx)(k.Input, {
                value: p,
                onChange: e => m(e.target.value)
              }), (0, t.jsx)(ei.ArrowRight, {
                className: "hidden h-4 w-4 text-muted-foreground sm:block"
              }), (0, t.jsx)(k.Input, {
                value: g,
                onChange: e => f(e.target.value)
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon-sm",
                variant: "ghost",
                title: "Lưu thay đổi",
                "aria-label": "Lưu thay đổi",
                disabled: !!b,
                onClick: j,
                children: (0, t.jsx)(ec.Check, {
                  className: "h-4 w-4"
                })
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon-sm",
                variant: "ghost",
                title: "Hủy chỉnh sửa",
                "aria-label": "Hủy chỉnh sửa",
                onClick: w,
                children: (0, t.jsx)(eh.X, {
                  className: "h-4 w-4"
                })
              }), b ? (0, t.jsx)("p", {
                className: "text-xs text-destructive sm:col-span-5",
                children: b
              }) : null]
            }) : (0, t.jsxs)("div", {
              className: "flex min-w-0 items-center gap-3",
              children: [(0, t.jsx)(ep.Switch, {
                checked: e.enabled,
                onCheckedChange: t => n(e.id, {
                  enabled: t
                }),
                "aria-label": `${e.enabled?"Tắt":"Bật"} cặp ${e.from}`
              }), (0, t.jsxs)("div", {
                className: "grid min-w-0 flex-1 items-center gap-1 text-sm sm:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)]",
                children: [(0, t.jsx)("span", {
                  className: "truncate font-medium",
                  title: e.from,
                  children: e.from
                }), (0, t.jsx)(ei.ArrowRight, {
                  className: "h-3.5 w-3.5 text-muted-foreground"
                }), (0, t.jsx)("span", {
                  className: "truncate text-muted-foreground",
                  title: e.to || "Xóa từ",
                  children: e.to || "Xóa từ"
                })]
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon-sm",
                variant: "ghost",
                title: `Sửa ${e.from}`,
                "aria-label": `Sửa ${e.from}`,
                onClick: () => {
                  h(e.id), m(e.from), f(e.to)
                },
                children: (0, t.jsx)(ed.Pencil, {
                  className: "h-4 w-4"
                })
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon-sm",
                variant: "ghost",
                title: `X\xf3a ${e.from}`,
                "aria-label": `X\xf3a ${e.from}`,
                onClick: () => s(e.id),
                children: (0, t.jsx)(x.Trash2, {
                  className: "h-4 w-4"
                })
              })]
            })
          }, e.id))
        })
      })]
    })
  }
  var ev = e.i(54217);

  function eb(e) {
    return e.trim().toLocaleLowerCase("vi-VN")
  }

  function ey({
    open: e,
    onOpenChange: i,
    videoId: a,
    subtitles: n,
    savedPairs: s,
    savedOccurrences: o
  }) {
    let l = (0, em.useSettingsStore)(e => e.addReplacementPair),
      c = (0, X.useSubtitleStore)(e => e.replaceReplacementOccurrenceForVideo),
      d = (0, X.useSubtitleStore)(e => e.replaceReplacementPairsForVideo),
      h = (0, X.useSubtitleStore)(e => e.setSelectedSubtitle),
      p = (0, W.useVideoStore)(e => e.requestPreviewSeek),
      m = (0, W.useVideoStore)(e => e.commitProjectCaptionText),
      [g, x] = (0, r.useState)("find"),
      [f, v] = (0, r.useState)(""),
      [b, w] = (0, r.useState)(""),
      [S, N] = (0, r.useState)(0),
      [C, M] = (0, r.useState)(!1),
      _ = (0, r.useMemo)(() => new Map(n.map(e => [e.id, e])), [n]),
      P = (0, r.useMemo)(() => ({
        id: "__manual_replacement_pair__",
        from: f.trim(),
        to: b,
        enabled: !!f.trim()
      }), [f, b]),
      E = (0, r.useMemo)(() => (0, ev.findReplacementOccurrences)(n, [P]), [P, n]),
      I = 0 === E.length ? 0 : Math.min(S, E.length - 1),
      V = E[I] ?? null,
      A = V ? _.get(V.cueId) ?? null : null,
      F = (0, r.useMemo)(() => {
        let e = new Map;
        for (let t of o) {
          let r = e.get(t.pairId) ?? [];
          r.push(t), e.set(t.pairId, r)
        }
        return e
      }, [o]),
      D = (0, r.useMemo)(() => s.flatMap(e => {
        let t = F.get(e.id) ?? [];
        return t.length > 0 ? [{
          pair: e,
          occurrences: t
        }] : []
      }), [F, s]),
      L = s.find(e => eb(e.from) === eb(f)),
      z = f.trim() ? L ? "Cụm từ này đã có trong danh sách." : null : "Hãy nhập từ hoặc cụm từ cần tìm.",
      B = e => {
        if (!e) return;
        let t = _.get(e.cueId);
        t && (h(t.id), p(t.startTime / 1e3))
      },
      O = e => {
        if (0 === E.length) return;
        let t = Math.max(0, Math.min(e, E.length - 1));
        N(t), B(E[t])
      },
      $ = async () => {
        if (V && c(a, P, V)) {
          M(!0);
          try {
            await m(a)
          } finally {
            M(!1)
          }
        }
      }, H = async e => {
        if (0 !== d(a, [e])) {
          N(0), M(!0);
          try {
            await m(a)
          } finally {
            M(!1)
          }
        }
      };
    return (0, t.jsx)(j.Dialog, {
      open: e,
      onOpenChange: e => {
        e || x("find"), i(e)
      },
      children: (0, t.jsxs)(j.DialogContent, {
        className: "max-w-3xl",
        children: [(0, t.jsxs)(j.DialogHeader, {
          children: [(0, t.jsx)(j.DialogTitle, {
            children: "find" === g ? "Tìm và thay thế" : "Cặp thay thế đã lưu"
          }), (0, t.jsx)(j.DialogDescription, {
            children: "find" === g ? "Tìm trong bản dịch của video hiện tại và thay đúng nội dung bạn nhập." : "Thêm, sửa hoặc tắt các cặp được dùng để gợi ý trên mọi video."
          })]
        }), "manage" === g ? (0, t.jsx)(ef, {
          onBack: () => x("find")
        }) : (0, t.jsxs)("div", {
          className: "space-y-4",
          children: [(0, t.jsxs)("div", {
            className: "grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)]",
            children: [(0, t.jsxs)("label", {
              className: "space-y-1 text-xs font-medium",
              children: [(0, t.jsx)("span", {
                children: "Tìm"
              }), (0, t.jsx)(k.Input, {
                autoFocus: !0,
                value: f,
                placeholder: "Nhập từ hoặc cụm từ",
                onChange: e => {
                  v(e.target.value), N(0)
                }
              })]
            }), (0, t.jsx)(ei.ArrowRight, {
              className: "mb-2 hidden h-4 w-4 text-muted-foreground sm:block"
            }), (0, t.jsxs)("label", {
              className: "space-y-1 text-xs font-medium",
              children: [(0, t.jsx)("span", {
                children: "Thay bằng"
              }), (0, t.jsx)(k.Input, {
                value: b,
                placeholder: "Để trống nếu muốn xóa",
                onChange: e => {
                  w(e.target.value), N(0)
                }
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "border-y border-border py-3",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-3",
              children: [(0, t.jsxs)("div", {
                className: "flex items-center gap-1",
                children: [(0, t.jsx)(y.Button, {
                  type: "button",
                  size: "icon-sm",
                  variant: "ghost",
                  title: "Kết quả trước",
                  "aria-label": "Kết quả trước",
                  disabled: 0 === I || 0 === E.length,
                  onClick: () => O(I - 1),
                  children: (0, t.jsx)(ea.ChevronLeft, {
                    className: "h-4 w-4"
                  })
                }), (0, t.jsx)("span", {
                  className: "min-w-16 text-center text-xs text-muted-foreground",
                  "aria-live": "polite",
                  children: 0 === E.length ? "0 kết quả" : `${I+1}/${E.length}`
                }), (0, t.jsx)(y.Button, {
                  type: "button",
                  size: "icon-sm",
                  variant: "ghost",
                  title: "Kết quả tiếp theo",
                  "aria-label": "Kết quả tiếp theo",
                  disabled: 0 === E.length || I >= E.length - 1,
                  onClick: () => O(I + 1),
                  children: (0, t.jsx)(en.ChevronRight, {
                    className: "h-4 w-4"
                  })
                })]
              }), A ? (0, t.jsx)("span", {
                className: "text-xs text-muted-foreground",
                children: (0, R.formatTime)(A.startTime)
              }) : null]
            }), (0, t.jsx)("div", {
              className: "mt-2 min-h-12 text-sm leading-6 text-foreground",
              children: A && V ? (0, t.jsxs)("p", {
                children: [A.translatedText.slice(0, V.start), (0, t.jsx)("mark", {
                  className: "rounded bg-amber-300/70 px-0.5 text-foreground dark:bg-amber-500/45",
                  children: A.translatedText.slice(V.start, V.end)
                }), A.translatedText.slice(V.end)]
              }) : (0, t.jsx)("p", {
                className: "text-muted-foreground",
                children: "Không tìm thấy vị trí phù hợp trong bản dịch."
              })
            })]
          }), (0, t.jsxs)("div", {
            className: "flex flex-wrap items-center gap-2",
            children: [(0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "outline",
              disabled: !V || C,
              onClick: () => void $(),
              children: [(0, t.jsx)(er, {
                className: "h-3.5 w-3.5"
              }), "Thay vị trí này"]
            }), (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              disabled: 0 === E.length || C,
              onClick: () => void H(P),
              children: [(0, t.jsx)(es, {
                className: "h-3.5 w-3.5"
              }), "Thay tất cả (", E.length, ")"]
            }), (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "ghost",
              className: "sm:ml-auto",
              disabled: !!z,
              title: z ?? "Lưu để tự phát hiện trong video khác",
              onClick: () => {
                z || l(f, b)
              },
              children: [(0, t.jsx)(u.Save, {
                className: "h-3.5 w-3.5"
              }), "Lưu cặp này"]
            })]
          }), f && z ? (0, t.jsx)("p", {
            className: "text-xs text-muted-foreground",
            children: z
          }) : null, (0, t.jsxs)("div", {
            className: "space-y-2 border-t border-border pt-4",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-3",
              children: [(0, t.jsxs)("div", {
                children: [(0, t.jsx)("h3", {
                  className: "text-sm font-semibold",
                  children: "Gợi ý từ cặp đã lưu"
                }), (0, t.jsx)("p", {
                  className: "text-xs text-muted-foreground",
                  children: "Các cặp đang xuất hiện trong video này."
                })]
              }), (0, t.jsxs)(y.Button, {
                type: "button",
                size: "sm",
                variant: "ghost",
                onClick: () => x("manage"),
                children: [(0, t.jsx)(eo, {
                  className: "h-3.5 w-3.5"
                }), "Quản lý cặp đã lưu"]
              })]
            }), 0 === D.length ? (0, t.jsx)("p", {
              className: "border-y border-border py-6 text-center text-sm text-muted-foreground",
              children: "Không có gợi ý trong video này"
            }) : (0, t.jsx)(T.ScrollArea, {
              className: "max-h-[28vh] pr-3",
              children: (0, t.jsx)("div", {
                className: "divide-y divide-border border-y border-border",
                children: D.map(({
                  pair: e,
                  occurrences: r
                }) => (0, t.jsxs)("div", {
                  className: "flex min-w-0 items-center gap-3 py-3",
                  children: [(0, t.jsxs)("button", {
                    type: "button",
                    className: "grid min-w-0 flex-1 items-center gap-1 text-left text-sm sm:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)]",
                    onClick: () => {
                      v(e.from), w(e.to), N(0), B(r[0] ?? null)
                    },
                    children: [(0, t.jsx)("span", {
                      className: "truncate font-medium",
                      title: e.from,
                      children: e.from
                    }), (0, t.jsx)(ei.ArrowRight, {
                      className: "h-3.5 w-3.5 text-muted-foreground"
                    }), (0, t.jsx)("span", {
                      className: "truncate text-muted-foreground",
                      title: e.to || "Xóa từ",
                      children: e.to || "Xóa từ"
                    })]
                  }), (0, t.jsxs)(y.Button, {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    disabled: C,
                    onClick: () => void H(e),
                    children: ["Thay tất cả (", r.length, ")"]
                  })]
                }, e.id))
              })
            })]
          })]
        })]
      })
    })
  }

  function ew({
    videoId: e,
    subtitles: i,
    savedPairs: a,
    savedOccurrences: n
  }) {
    let [s, o] = (0, r.useState)(!1), l = n.length;
    return (0, t.jsxs)(t.Fragment, {
      children: [(0, t.jsxs)(y.Button, {
        type: "button",
        size: "sm",
        variant: "outline",
        className: "h-7 border-border bg-background px-2.5 text-xs text-primary shadow-sm",
        "aria-haspopup": "dialog",
        onClick: () => o(!0),
        children: [(0, t.jsx)(er, {
          className: "h-3.5 w-3.5"
        }), "Tìm và thay thế", l > 0 ? (0, t.jsx)("span", {
          className: "inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground",
          children: l
        }) : null]
      }), (0, t.jsx)(ey, {
        open: s,
        onOpenChange: o,
        videoId: e,
        subtitles: i,
        savedPairs: a,
        savedOccurrences: n
      })]
    })
  }
  var ej = e.i(71028),
    ek = e.i(95925),
    eS = e.i(37822);

  function eN({
    visible: e
  }) {
    return e ? (0, t.jsxs)("span", {
      "data-project-tempo-cue-marker": !0,
      className: "mt-0.5 inline-flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary",
      title: "Câu này cần thêm thời gian để giữ giọng đọc tự nhiên",
      children: [(0, t.jsx)(ej.Gauge, {
        className: "size-3",
        "aria-hidden": "true"
      }), (0, t.jsx)("span", {
        className: "sr-only",
        children: "Câu này cần thêm thời gian để giữ giọng đọc tự nhiên"
      })]
    }) : null
  }

  function eC({
    model: e,
    disabled: i = !1,
    highlighted: a = !1,
    onApply: n,
    onRestore: s
  }) {
    let [o, l] = (0, r.useState)(e.selectedTempoTenths), [c, d] = (0, r.useState)(!1);
    (0, r.useEffect)(() => {
      l(e.selectedTempoTenths)
    }, [e.selectedTempoTenths]);
    let u = async e => {
      if (!c && !i) {
        d(!0);
        try {
          await e()
        } finally {
          d(!1)
        }
      }
    };
    return (0, t.jsxs)(eS.Popover, {
      children: [(0, t.jsx)(eS.PopoverTrigger, {
        asChild: !0,
        children: (0, t.jsxs)(y.Button, {
          type: "button",
          size: "sm",
          variant: "outline",
          className: (0, R.cn)("h-8 shrink-0 gap-1.5 text-xs", a && "tempo-fast-cue-highlight"),
          disabled: i || c,
          "data-project-tempo-trigger": !0,
          "data-fast-cue-highlight": a ? "true" : void 0,
          children: [(0, t.jsx)(ej.Gauge, {
            className: "size-3.5",
            "aria-hidden": "true"
          }), e.label]
        })
      }), (0, t.jsxs)(eS.PopoverContent, {
        align: "start",
        className: "w-80 space-y-3 p-3",
        children: [(0, t.jsx)("p", {
          className: "text-[11px] leading-4 text-muted-foreground",
          children: "Giọng đọc đang phải đọc nhanh để khớp video gốc. Tăng mức này để giọng đọc chậm và tự nhiên hơn — video sẽ dài thêm tương ứng."
        }), (0, t.jsx)("div", {
          className: "grid grid-cols-3 gap-1.5",
          role: "group",
          "aria-label": "Tốc độ giọng đọc",
          children: e.options.map(e => (0, t.jsx)(y.Button, {
            type: "button",
            size: "sm",
            variant: o === e.value ? "default" : "outline",
            className: "h-8 text-xs tabular-nums",
            "aria-pressed": o === e.value,
            "data-project-tempo-option": e.value,
            onClick: () => l(e.value),
            disabled: i || c,
            children: e.label
          }, e.value))
        }), e.markerCount > 0 ? (0, t.jsxs)("p", {
          "data-project-tempo-markers": !0,
          className: "text-[11px] leading-4 text-muted-foreground",
          children: [e.markerCount, " câu cần thêm thời gian để giữ giọng đọc tự nhiên."]
        }) : null, (0, t.jsx)(y.Button, {
          type: "button",
          size: "sm",
          className: "h-8 w-full text-xs",
          "data-project-tempo-apply": !0,
          disabled: i || c,
          onClick: () => void u(() => n(o)),
          children: "Áp dụng"
        }), e.canRestore ? (0, t.jsxs)(y.Button, {
          type: "button",
          size: "sm",
          variant: "ghost",
          className: "h-8 w-full gap-1.5 text-xs",
          "data-project-tempo-restore": !0,
          disabled: i || c,
          onClick: () => void u(s),
          children: [(0, t.jsx)(ek.RotateCcw, {
            className: "size-3.5",
            "aria-hidden": "true"
          }), "Khôi phục video gốc"]
        }) : null]
      })]
    })
  }
  var eM = e.i(33658),
    e_ = e.i(43420),
    e_ = e_,
    eP = e.i(28523),
    eT = e.i(21357),
    eE = e.i(70152),
    eR = e.i(81140),
    eI = e.i(20783),
    eV = e.i(30030),
    eA = e.i(69340),
    eF = e.i(86318),
    eD = e.i(99682),
    eL = e.i(35804),
    ez = e.i(48425),
    eB = e.i(75830),
    eO = ["PageUp", "PageDown"],
    e$ = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
    eH = {
      "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
      "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
      "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
      "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
    },
    eq = "Slider",
    [eK, eX, eG] = (0, eB.createCollection)(eq),
    [eW, eU] = (0, eV.createContextScope)(eq, [eG]),
    [eY, eJ] = eW(eq),
    eZ = r.forwardRef((e, i) => {
      let {
        name: a,
        min: n = 0,
        max: s = 100,
        step: o = 1,
        orientation: l = "horizontal",
        disabled: c = !1,
        minStepsBetweenThumbs: d = 0,
        defaultValue: u = [n],
        value: h,
        onValueChange: p = () => {},
        onValueCommit: m = () => {},
        inverted: g = !1,
        form: x,
        ...f
      } = e, v = r.useRef(new Set), b = r.useRef(0), y = r.useRef(!1), w = "horizontal" === l, [j = [], k] = (0, eA.useControllableState)({
        prop: h,
        defaultProp: u,
        onChange: e => {
          let t = [...v.current];
          t[b.current]?.focus({
            preventScroll: !0,
            focusVisible: y.current
          }), y.current = !1, p(e)
        }
      }), S = r.useRef(j);

      function N(e, t, {
        commit: r
      } = {
        commit: !1
      }) {
        let i, a = function(e) {
            if (!Number.isFinite(e)) return 0;
            let t = e.toString();
            if (t.includes("e")) {
              let [e, r] = t.split("e"), i = e.split(".")[1] || "", a = Number(r);
              return Math.max(0, i.length - a)
            }
            let r = t.split(".")[1];
            return r ? r.length : 0
          }(o),
          l = Math.round((Math.round((e - n) / o) * o + n) * (i = Math.pow(10, a))) / i,
          c = (0, eE.clamp)(l, [n, s]);
        k((e = []) => {
          let i = function(e = [], t, r) {
            let i = [...e];
            return i[r] = t, i.sort((e, t) => e - t)
          }(e, c, t);
          if (! function(e, t) {
              if (t > 0) return Math.min(...e.slice(0, -1).map((t, r) => e[r + 1] - t)) >= t;
              return !0
            }(i, d * o)) return e;
          {
            b.current = i.indexOf(c);
            let t = String(i) !== String(e);
            return t && r && m(i), t ? i : e
          }
        })
      }
      return (0, t.jsx)(eY, {
        scope: e.__scopeSlider,
        name: a,
        disabled: c,
        min: n,
        max: s,
        valueIndexToChangeRef: b,
        thumbs: v.current,
        values: j,
        orientation: l,
        form: x,
        children: (0, t.jsx)(eK.Provider, {
          scope: e.__scopeSlider,
          children: (0, t.jsx)(eK.Slot, {
            scope: e.__scopeSlider,
            children: (0, t.jsx)(w ? e1 : e2, {
              "aria-disabled": c,
              "data-disabled": c ? "" : void 0,
              ...f,
              ref: i,
              onPointerDown: (0, eR.composeEventHandlers)(f.onPointerDown, () => {
                c || (S.current = j, y.current = !1)
              }),
              min: n,
              max: s,
              inverted: g,
              onSlideStart: c ? void 0 : function(e) {
                let t = function(e, t) {
                  if (1 === e.length) return 0;
                  let r = e.map(e => Math.abs(e - t)),
                    i = Math.min(...r);
                  return r.indexOf(i)
                }(j, e);
                N(e, t)
              },
              onSlideMove: c ? void 0 : function(e) {
                N(e, b.current)
              },
              onSlideEnd: c ? void 0 : function() {
                let e = S.current[b.current];
                j[b.current] !== e && m(j)
              },
              onHomeKeyDown: () => {
                c || (y.current = !0, N(n, 0, {
                  commit: !0
                }))
              },
              onEndKeyDown: () => {
                c || (y.current = !0, N(s, j.length - 1, {
                  commit: !0
                }))
              },
              onStepKeyDown: ({
                event: e,
                direction: t
              }) => {
                if (!c) {
                  y.current = !0;
                  let r = eO.includes(e.key) || e.shiftKey && e$.includes(e.key),
                    i = b.current;
                  N(j[i] + o * (r ? 10 : 1) * t, i, {
                    commit: !0
                  })
                }
              }
            })
          })
        })
      })
    });
  eZ.displayName = eq;
  var [eQ, e0] = eW(eq, {
    startEdge: "left",
    endEdge: "right",
    size: "width",
    direction: 1
  }), e1 = r.forwardRef((e, i) => {
    let {
      min: a,
      max: n,
      dir: s,
      inverted: o,
      onSlideStart: l,
      onSlideMove: c,
      onSlideEnd: d,
      onStepKeyDown: u,
      ...h
    } = e, [p, m] = r.useState(null), g = (0, eI.useComposedRefs)(i, e => m(e)), x = r.useRef(void 0), f = (0, eF.useDirection)(s), v = "ltr" === f, b = v && !o || !v && o;

    function y(e) {
      let t = x.current || p.getBoundingClientRect(),
        r = tc([0, t.width], b ? [a, n] : [n, a]);
      return x.current = t, r(e - t.left)
    }
    return (0, t.jsx)(eQ, {
      scope: e.__scopeSlider,
      startEdge: b ? "left" : "right",
      endEdge: b ? "right" : "left",
      direction: b ? 1 : -1,
      size: "width",
      children: (0, t.jsx)(e5, {
        dir: f,
        "data-orientation": "horizontal",
        ...h,
        ref: g,
        style: {
          ...h.style,
          "--radix-slider-thumb-transform": "translateX(-50%)"
        },
        onSlideStart: e => {
          let t = y(e.clientX);
          l?.(t)
        },
        onSlideMove: e => {
          let t = y(e.clientX);
          c?.(t)
        },
        onSlideEnd: () => {
          x.current = void 0, d?.()
        },
        onStepKeyDown: e => {
          let t = eH[b ? "from-left" : "from-right"].includes(e.key);
          u?.({
            event: e,
            direction: t ? -1 : 1
          })
        }
      })
    })
  }), e2 = r.forwardRef((e, i) => {
    let {
      min: a,
      max: n,
      inverted: s,
      onSlideStart: o,
      onSlideMove: l,
      onSlideEnd: c,
      onStepKeyDown: d,
      ...u
    } = e, h = r.useRef(null), p = (0, eI.useComposedRefs)(i, h), m = r.useRef(void 0), g = !s;

    function x(e) {
      let t = m.current || h.current.getBoundingClientRect(),
        r = tc([0, t.height], g ? [n, a] : [a, n]);
      return m.current = t, r(e - t.top)
    }
    return (0, t.jsx)(eQ, {
      scope: e.__scopeSlider,
      startEdge: g ? "bottom" : "top",
      endEdge: g ? "top" : "bottom",
      size: "height",
      direction: g ? 1 : -1,
      children: (0, t.jsx)(e5, {
        "data-orientation": "vertical",
        ...u,
        ref: p,
        style: {
          ...u.style,
          "--radix-slider-thumb-transform": "translateY(50%)"
        },
        onSlideStart: e => {
          let t = x(e.clientY);
          o?.(t)
        },
        onSlideMove: e => {
          let t = x(e.clientY);
          l?.(t)
        },
        onSlideEnd: () => {
          m.current = void 0, c?.()
        },
        onStepKeyDown: e => {
          let t = eH[g ? "from-bottom" : "from-top"].includes(e.key);
          d?.({
            event: e,
            direction: t ? -1 : 1
          })
        }
      })
    })
  }), e5 = r.forwardRef((e, r) => {
    let {
      __scopeSlider: i,
      onSlideStart: a,
      onSlideMove: n,
      onSlideEnd: s,
      onHomeKeyDown: o,
      onEndKeyDown: l,
      onStepKeyDown: c,
      ...d
    } = e, u = eJ(eq, i);
    return (0, t.jsx)(ez.Primitive.span, {
      ...d,
      ref: r,
      onKeyDown: (0, eR.composeEventHandlers)(e.onKeyDown, e => {
        "Home" === e.key ? (o(e), e.preventDefault()) : "End" === e.key ? (l(e), e.preventDefault()) : eO.concat(e$).includes(e.key) && (c(e), e.preventDefault())
      }),
      onPointerDown: (0, eR.composeEventHandlers)(e.onPointerDown, e => {
        let t = e.target;
        t.setPointerCapture(e.pointerId), e.preventDefault(), u.thumbs.has(t) ? t.focus({
          preventScroll: !0,
          focusVisible: !1
        }) : a(e)
      }),
      onPointerMove: (0, eR.composeEventHandlers)(e.onPointerMove, e => {
        e.target.hasPointerCapture(e.pointerId) && n(e)
      }),
      onPointerUp: (0, eR.composeEventHandlers)(e.onPointerUp, e => {
        let t = e.target;
        t.hasPointerCapture(e.pointerId) && (t.releasePointerCapture(e.pointerId), s(e))
      })
    })
  }), e3 = "SliderTrack", e4 = r.forwardRef((e, r) => {
    let {
      __scopeSlider: i,
      ...a
    } = e, n = eJ(e3, i);
    return (0, t.jsx)(ez.Primitive.span, {
      "data-disabled": n.disabled ? "" : void 0,
      "data-orientation": n.orientation,
      ...a,
      ref: r
    })
  });
  e4.displayName = e3;
  var e8 = "SliderRange",
    e7 = r.forwardRef((e, i) => {
      let {
        __scopeSlider: a,
        ...n
      } = e, s = eJ(e8, a), o = e0(e8, a), l = r.useRef(null), c = (0, eI.useComposedRefs)(i, l), d = s.values.length, u = s.values.map(e => tl(e, s.min, s.max)), h = d > 1 ? Math.min(...u) : 0, p = 100 - Math.max(...u);
      return (0, t.jsx)(ez.Primitive.span, {
        "data-orientation": s.orientation,
        "data-disabled": s.disabled ? "" : void 0,
        ...n,
        ref: c,
        style: {
          ...e.style,
          [o.startEdge]: h + "%",
          [o.endEdge]: p + "%"
        }
      })
    });
  e7.displayName = e8;
  var e6 = "SliderThumb",
    [e9, te] = eW(e6),
    tt = "SliderThumbProvider";

  function tr(e) {
    let {
      __scopeSlider: i,
      name: a,
      children: n,
      internal_do_not_use_render: s
    } = e, o = eJ(tt, i), l = eX(i), [c, d] = r.useState(null), u = r.useMemo(() => c ? l().findIndex(e => e.ref.current === c) : -1, [l, c]), h = (0, eL.useSize)(c), p = !c || !!o.form || !!c.closest("form"), m = o.values[u], g = a ?? (o.name ? o.name + (o.values.length > 1 ? "[]" : "") : void 0), x = void 0 === m ? 0 : tl(m, o.min, o.max);
    r.useEffect(() => {
      if (c) return o.thumbs.add(c), () => {
        o.thumbs.delete(c)
      }
    }, [c, o.thumbs]);
    let f = {
      value: m,
      name: g,
      form: o.form,
      isFormControl: p,
      index: u,
      thumb: c,
      onThumbChange: d,
      percent: x,
      size: h
    };
    return (0, t.jsx)(e9, {
      scope: i,
      ...f,
      children: "function" == typeof s ? s(f) : n
    })
  }
  tr.displayName = tt;
  var ti = "SliderThumbTrigger",
    ta = r.forwardRef((e, r) => {
      var i, a, n, s, o;
      let l, c, {
          __scopeSlider: d,
          ...u
        } = e,
        h = eJ(ti, d),
        p = e0(ti, d),
        {
          index: m,
          value: g,
          percent: x,
          size: f,
          onThumbChange: v
        } = te(ti, d),
        b = (0, eI.useComposedRefs)(r, e => v(e)),
        y = (i = m, (a = h.values.length) > 2 ? `Value ${i+1} of ${a}` : 2 === a ? ["Minimum", "Maximum"][i] : void 0),
        w = f?.[p.size],
        j = w ? (n = w, s = x, o = p.direction, c = tc([0, 50], [0, l = n / 2]), (l - c(s) * o) * o) : 0;
      return (0, t.jsx)("span", {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [p.startEdge]: `calc(${x}% + ${j}px)`
        },
        children: (0, t.jsx)(eK.ItemSlot, {
          scope: d,
          children: (0, t.jsx)(ez.Primitive.span, {
            role: "slider",
            "aria-label": e["aria-label"] || y,
            "aria-valuemin": h.min,
            "aria-valuenow": g,
            "aria-valuemax": h.max,
            "aria-orientation": h.orientation,
            "data-orientation": h.orientation,
            "data-disabled": h.disabled ? "" : void 0,
            tabIndex: h.disabled ? void 0 : 0,
            ...u,
            ref: b,
            style: void 0 === g ? {
              display: "none"
            } : e.style,
            onFocus: (0, eR.composeEventHandlers)(e.onFocus, () => {
              h.valueIndexToChangeRef.current = m
            })
          })
        })
      })
    });
  ta.displayName = ti;
  var tn = r.forwardRef((e, r) => {
    let {
      __scopeSlider: i,
      name: a,
      ...n
    } = e;
    return (0, t.jsx)(tr, {
      __scopeSlider: i,
      name: a,
      internal_do_not_use_render: ({
        index: e,
        isFormControl: a
      }) => (0, t.jsxs)(t.Fragment, {
        children: [(0, t.jsx)(ta, {
          ...n,
          ref: r,
          __scopeSlider: i
        }), a ? (0, t.jsx)(to, {
          __scopeSlider: i
        }, e) : null]
      })
    })
  });
  tn.displayName = e6;
  var ts = "SliderBubbleInput",
    to = r.forwardRef(({
      __scopeSlider: e,
      ...i
    }, a) => {
      let {
        value: n,
        name: s,
        form: o
      } = te(ts, e), l = r.useRef(null), c = (0, eI.useComposedRefs)(l, a), d = (0, eD.usePrevious)(n);
      return r.useEffect(() => {
        let e = l.current;
        if (!e) return;
        let t = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        if (d !== n && t) {
          let r = new Event("input", {
            bubbles: !0
          });
          t.call(e, n), e.dispatchEvent(r)
        }
      }, [d, n]), (0, t.jsx)(ez.Primitive.input, {
        style: {
          display: "none"
        },
        name: s,
        form: o,
        ...i,
        ref: c,
        defaultValue: n
      })
    });

  function tl(e, t, r) {
    return (0, eE.clamp)(100 / (r - t) * (e - t), [0, 100])
  }

  function tc(e, t) {
    return r => {
      if (e[0] === e[1] || t[0] === t[1]) return t[0];
      let i = (t[1] - t[0]) / (e[1] - e[0]);
      return t[0] + i * (r - e[0])
    }
  }
  to.displayName = ts;
  let td = r.forwardRef(({
    className: e,
    "aria-label": r,
    "aria-labelledby": i,
    ...a
  }, n) => (0, t.jsxs)(eZ, {
    ref: n,
    className: (0, R.cn)("relative flex w-full touch-none select-none items-center", e),
    ...a,
    children: [(0, t.jsx)(e4, {
      className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary",
      children: (0, t.jsx)(e7, {
        className: "absolute h-full bg-primary"
      })
    }), (0, t.jsx)(tn, {
      "aria-label": r,
      "aria-labelledby": i,
      className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/10 cursor-grab active:cursor-grabbing"
    })]
  }));
  td.displayName = eZ.displayName;
  var tu = e.i(5750),
    th = e.i(68834),
    tp = e.i(7787),
    tm = e.i(57623),
    tg = e.i(17028),
    tx = e.i(58450),
    tf = e.i(30797),
    tv = e.i(53065),
    tb = e.i(30148);

  function ty(e) {
    return e.voiceOn && e.musicOn ? "original_mix" : e.voiceOn ? "vocals_only" : e.musicOn ? "separated_background" : "muted"
  }

  function tw(e) {
    return "separated_background" === e || "vocals_only" === e
  }
  let tj = () => {},
    tk = () => {},
    tS = () => void 0,
    tN = new Map,
    tC = new Map,
    tM = new Map;

  function t_(e) {
    return W.useVideoStore.getState().videos.find(t => t.id === e)
  }

  function tP(e, t) {
    W.useVideoStore.getState().updateVideo(e, t)
  }

  function tT(e) {
    return "muted" === e ? "mute_original" : "separated_background" === e || "vocals_only" === e ? "separate_background" : "mix_original"
  }

  function tE(e, t) {
    let r = (tM.get(e) ?? Promise.resolve()).catch(() => {}).then(t);
    return tM.set(e, r), r.finally(() => {
      tM.get(e) === r && tM.delete(e)
    }), r
  }
  async function tR(e, t) {
    let r = t_(e)?.nleDocument;
    if (!r) throw Object.assign(Error("project_audio_not_ready"), {
      code: "project_audio_not_ready"
    });
    for (let i = 0; i < 2; i += 1) try {
      let i = await (0, tp.mutateEngineVnextNleDocument)({
        projectId: e,
        expectedRevision: r.revision,
        mutation: {
          kind: "update_audio_mix",
          originalVolume: Math.round(100 * r.playback.originalVolume),
          translatedVolume: Math.round(100 * r.playback.translatedVolume),
          sourceAudioMode: t
        }
      });
      tP(e, {
        nleDocument: i,
        originalAudioVolume: i.playback.originalVolume,
        originalAudioStrategy: tT(i.playback.sourceAudioMode),
        ..."original_mix" === i.playback.sourceAudioMode || "muted" === i.playback.sourceAudioMode ? {
          projectAudioPreviewCarrierPath: void 0
        } : {}
      });
      return
    } catch (t) {
      if (0 === i && function(e) {
          let t = (0, tu.projectAudioErrorCode)(e);
          return "nle_document_revision_stale" === t || "nle_document_mutation_stale" === t
        }(t)) {
        let t = await (0, tb.hydrateNleProject)(e);
        tP(e, {
          nleDocument: t
        }), r = t;
        continue
      }
      throw t
    }
  }

  function tI(e) {
    let t = e?.nleDocument?.playback.sourceAudioMode;
    if ("separated_background" === t || "vocals_only" === t) return !0;
    let r = e?.projectAudioTrack;
    return !!(r?.separationState?.state === "ready" || r?.backgroundArtifactReceipt) || !!e?.projectAudioPreviewCarrierPath
  }
  async function tV(e, t) {
    let r = W.useVideoStore.getState().videos.find(t => t.id === e),
      i = r?.nleDocument;
    if (!r || !i) return !1;
    if (t && "separated_background" !== i.playback.sourceAudioMode) return !0;
    let a = (0, tp.nleBackgroundOperationId)(r.id, i.revision);
    tC.set(e, a), tj(e, {
      state: "separating",
      operationId: a,
      progressBasisPoints: 0
    });
    try {
      let n = await (0, tp.separateEngineVnextNleBackground)({
        projectId: r.id,
        expectedRevision: i.revision
      }, {
        onProgress: t => {
          tC.get(e) === a && tj(e, {
            state: "separating",
            operationId: a,
            progressBasisPoints: t.overallBasisPoints
          })
        }
      });
      if (t && n.document.revision !== i.revision) throw Object.assign(Error("nle_background_response_invalid"), {
        code: "nle_background_response_invalid"
      });
      let s = t_(r.id)?.nleDocument;
      return (!s || n.document.revision >= s.revision) && tP(r.id, {
        nleDocument: n.document,
        originalAudioStrategy: "separate_background",
        originalAudioVolume: n.document.playback.originalVolume,
        projectAudioPreviewCarrierPath: n.previewCarrierPath
      }), tj(e, {
        state: "idle"
      }), !0
    } catch (a) {
      let i = (0, tu.projectAudioErrorCode)(a) ?? "project_audio_separation_failed";
      if (t && "nle_background_cache_invalid" === i) return W.useVideoStore.getState().updateVideo(r.id, {
        projectAudioPreviewCarrierPath: void 0
      }), tj(e, {
        state: "error",
        code: i,
        message: (0, tu.projectAudioTrackCustomerMessage)(a)
      }), await (0, tf.appendAppLog)("warn", `[project-audio:${e}] Separated background cache is missing and must be regenerated.`).catch(() => void 0), !1;
      throw tj(e, {
        state: "error",
        code: i,
        message: (0, tu.projectAudioTrackCustomerMessage)("project_audio_separation_canceled" === i ? Object.assign(Error(i), {
          code: i
        }) : a)
      }), await (0, tf.appendAppLog)("warn", `[project-audio:${e}] NLE background separation failed: ${(0,tu.projectAudioErrorLogMessage)(a)}`).catch(() => void 0), a
    } finally {
      tC.get(e) === a && tC.delete(e)
    }
  }
  async function tA(e) {
    let t = W.useVideoStore.getState().videos.find(t => t.id === e),
      r = t?.nleDocument;
    if (!t || !r) return !1;
    let i = await (0, tp.mutateEngineVnextNleDocument)({
      projectId: t.id,
      expectedRevision: r.revision,
      mutation: {
        kind: "update_audio_mix",
        originalVolume: Math.round(100 * r.playback.originalVolume),
        translatedVolume: Math.round(100 * r.playback.translatedVolume),
        sourceAudioMode: "original_mix"
      }
    });
    return W.useVideoStore.getState().updateVideo(t.id, {
      nleDocument: i,
      originalAudioStrategy: "mix_original",
      originalAudioVolume: i.playback.originalVolume,
      projectAudioPreviewCarrierPath: void 0
    }), tj(e, {
      state: "idle"
    }), !0
  }

  function tF(e, t) {
    let r = W.useVideoStore.getState(),
      i = r.videos.find(t => t.id === e);
    if (!i) throw Object.assign(Error("project_audio_not_ready"), {
      code: "project_audio_not_ready"
    });
    t > 0 && tO.set(e, t), r.updateVideo(e, (0, tg.previewAudioGainVideoPatch)(i, t))
  }
  async function tD(e, t) {
    let r = W.useVideoStore.getState(),
      i = r.videos.find(t => t.id === e),
      a = i?.nleDocument;
    if (!i || !a) return !1;
    let n = await (0, tp.mutateEngineVnextNleDocument)({
      projectId: e,
      expectedRevision: a.revision,
      mutation: {
        kind: "update_audio_mix",
        originalVolume: t,
        translatedVolume: Math.round(100 * a.playback.translatedVolume),
        sourceAudioMode: function(e, t) {
          if (!Number.isInteger(e) || e < 0 || e > 100) throw Error("nle_document_audio_mix_invalid");
          return "separated_background" === t || "vocals_only" === t ? t : 0 === e ? "muted" : "original_mix"
        }(t, a.playback.sourceAudioMode)
      }
    });
    return r.updateVideo(e, {
      nleDocument: n,
      originalAudioVolume: n.playback.originalVolume,
      originalAudioStrategy: "muted" === n.playback.sourceAudioMode ? "mute_original" : "separated_background" === n.playback.sourceAudioMode || "vocals_only" === n.playback.sourceAudioMode ? "separate_background" : "mix_original"
    }), tN.delete(e), !0
  }
  let tL = {
    state: "working"
  };
  async function tz(e) {
    let t = await (0, tb.hydrateNleProject)(e);
    tP(e, {
      nleDocument: t,
      originalAudioVolume: t.playback.originalVolume,
      originalAudioStrategy: tT(t.playback.sourceAudioMode)
    })
  }
  let tB = (0, tu.createProjectAudioTrackController)({
      getVideo: e => W.useVideoStore.getState().videos.find(t => t.id === e),
      updateVideo: (e, t) => W.useVideoStore.getState().updateVideo(e, t),
      persistVideo: e => (0, tx.persistLatestProjectManifest)(e, W.useVideoStore.getState),
      onPersistenceError: e => {
        (0, tf.appendAppLog)("warn", `[project-audio:${e}] Project manifest projection could not be refreshed after a verified audio mutation.`).catch(() => void 0)
      },
      inspect: tp.inspectEngineVnextProjectAudioTrack,
      setGain: tp.setEngineVnextProjectAudioGain,
      separate: tp.separateEngineVnextProjectAudio,
      restore: tp.restoreEngineVnextProjectAudio,
      cancel: tp.cancelEngineVnextNativeJob,
      activateTerminal: (e, t) => W.useVideoStore.getState().activateMutatedTerminalProject(e, t),
      nextAuthorityRevision: tv.nextProjectAuthorityRevision,
      onOperation: (e, t) => tj(e, t)
    }),
    tO = new Map;
  async function t$(e, t) {
    let r = t_(e),
      i = r?.nleDocument;
    if (!r || !i) throw Object.assign(Error("project_audio_not_ready"), {
      code: "project_audio_not_ready"
    });
    let a = i.playback.sourceAudioMode,
      n = tC.has(e);
    if (tk(e, t), t === a) {
      n || tk(e, null);
      return
    }
    if (!tw(t) || tI(r)) try {
      await tE(e, async () => {
        tS(e) === t && await tR(e, t)
      }), tC.has(e) || tS(e) !== t || tk(e, null);
      return
    } catch (i) {
      tS(e) === t && tk(e, null);
      let r = (0, tu.projectAudioErrorCode)(i) ?? "project_audio_separation_failed";
      throw tj(e, {
        state: "error",
        code: r,
        message: (0, tu.projectAudioTrackCustomerMessage)(i)
      }), i
    }
    try {
      await tV(e, !1);
      let t = t_(e),
        r = t?.nleDocument?.playback.sourceAudioMode,
        i = tS(e) ?? r;
      i && r && i !== r && await tE(e, async () => {
        await tR(e, i)
      })
    } finally {
      tS(e) && tk(e, null)
    }
  }
  async function tH(e, t) {
    let r = t_(e);
    if (!r) throw Object.assign(Error("project_audio_not_ready"), {
      code: "project_audio_not_ready"
    });
    tk(e, t);
    try {
      "muted" === t ? r.projectAudioTrack ? (tB.queueGain(e, 0), await tB.flushGain(e)) : tF(e, 0) : "original_mix" === t ? r.projectAudioTrack ? await tB.restore(e) : tF(e, tO.get(e) ?? 100) : await tB.separate(e), tS(e) === t && tk(e, null)
    } catch (r) {
      throw tS(e) === t && tk(e, null), r
    }
  }
  let tq = (0, th.create)((e, t) => {
      tj = (t, r) => {
        e(e => ({
          operations: {
            ...e.operations,
            [t]: r
          }
        }))
      }, tk = (t, r) => {
        e(e => {
          let i = {
            ...e.pendingSourceModes
          };
          return null === r ? delete i[t] : i[t] = r, {
            pendingSourceModes: i
          }
        })
      }, tS = e => t().pendingSourceModes[e];
      let r = (t, r) => {
          e(e => ({
            audioClipOperations: {
              ...e.audioClipOperations,
              [t]: r
            }
          }))
        },
        i = async (e, t, i) => {
          r(e, tL);
          try {
            return await t(), r(e, {
              state: "idle"
            }), !0
          } catch (t) {
            return r(e, {
              state: "error",
              message: function(e, t) {
                switch ((0, tu.projectAudioErrorCode)(e)) {
                  case "audio_clip_import_invalid":
                  case "audio_clip_unreadable":
                  case "audio_clip_probe_failed":
                  case "audio_clip_not_audio":
                  case "audio_clip_empty":
                    return "File âm thanh không đọc được hoặc định dạng không hỗ trợ.";
                  case "audio_clip_limit":
                    return "Mỗi video hiện chỉ thêm được một đoạn âm thanh.";
                  case "audio_clip_span_invalid":
                    return "Điểm bắt đầu hoặc vùng cắt không hợp lệ.";
                  case "nle_document_revision_stale":
                  case "nle_document_mutation_stale":
                    return "Project vừa thay đổi. Hãy thử lại.";
                  case "audio_clip_not_implemented":
                    return "Tính năng âm thanh thêm chưa sẵn sàng trong bản này.";
                  default:
                    return t
                }
              }(t, i)
            }), await (0, tf.appendAppLog)("warn", `[project-audio:${e}] audio clip operation failed: ${(0,tu.projectAudioErrorLogMessage)(t)}`).catch(() => void 0), !1
          }
        };
      return {
        operations: {},
        pendingSourceModes: {},
        audioClipOperations: {},
        inspect: tB.inspect,
        authorPreviewGain: tF,
        commitPreviewGain: async (e, t) => {
          if (tF(e, t), !await tD(e, t)) try {
            await (0, tx.persistLatestProjectManifest)(e, W.useVideoStore.getState)
          } catch (t) {
            throw await (0, tf.appendAppLog)("warn", `[project-audio:${e}] Preview gain could not be persisted before native audio was ready.`).catch(() => void 0), t
          }
        },
        queueGain: (e, t) => {
          let r = W.useVideoStore.getState().videos.find(t => t.id === e);
          if (r?.nleDocument) {
            tN.set(e, t), tF(e, t);
            return
          }
          tB.queueGain(e, t)
        },
        flushGain: async e => {
          let t = W.useVideoStore.getState().videos.find(t => t.id === e);
          if (t?.nleDocument) {
            let r = tN.get(e) ?? Math.round((t.originalAudioVolume ?? t.nleDocument.playback.originalVolume) * 100);
            await tD(e, r);
            return
          }
          await tB.flushGain(e)
        },
        separate: async e => {
          await tV(e, !1) || await tB.separate(e)
        },
        restore: async e => {
          await tA(e) || await tB.restore(e)
        },
        ensureNleBackground: async e => {
          await tV(e, !0)
        },
        cancel: async e => {
          let t = tC.get(e);
          t ? await (0, tp.cancelEngineVnextNativeJob)(t) : await tB.cancel(e)
        },
        setStemToggles: async (e, r) => {
          let i = ty(r);
          await t().setSourceAudioMode(e, i)
        },
        setSourceAudioMode: async (e, t) => {
          let r = t_(e);
          r?.nleDocument ? await t$(e, t) : await tH(e, t)
        },
        importAudioClip: async (e, t) => i(e, async () => {
          await (0, tm.audioClipImport)(e, t), await tz(e)
        }, "File âm thanh không đọc được hoặc định dạng không hỗ trợ."),
        updateAudioClip: async (e, t, r) => i(e, async () => {
          await (0, tm.audioClipUpdate)(e, t, r), await tz(e)
        }, "Không thể cập nhật âm thanh thêm. Hãy thử lại."),
        removeAudioClip: async (e, t) => i(e, async () => {
          await (0, tm.audioClipRemove)(e, t), await tz(e)
        }, "Không thể xóa âm thanh thêm. Hãy thử lại.")
      }
    }),
    tK = [{
      name: "Âm thanh",
      extensions: ["mp3", "wav", "m4a", "aac", "ogg", "flac"]
    }];

  function tX({
    videoId: e,
    track: i,
    previewPolicy: a,
    nleAvailable: n = !1,
    disabled: s = !1
  }) {
    var o, l;
    let d, u, {
        operations: h,
        pendingSourceModes: p,
        audioClipOperations: m,
        authorPreviewGain: g,
        commitPreviewGain: f,
        queueGain: v,
        flushGain: b,
        cancel: w,
        setStemToggles: j,
        importAudioClip: k,
        updateAudioClip: N,
        removeAudioClip: C
      } = tq(),
      M = (0, W.useVideoStore)(t => t.videos.find(t => t.id === e)),
      _ = h[e] ?? {
        state: "idle"
      },
      [T, E] = (0, r.useState)(null),
      [V, A] = (0, r.useState)(null),
      F = "separating" === _.state || i?.separationState.state === "running" || i?.separationState.state === "requested",
      D = "separating" === _.state ? _.progressBasisPoints : F ? 0 : null,
      L = (0, tu.projectAudioOperationFailureMessage)(_, T, i?.separationState.state === "failed" ? i.separationState.code : null),
      z = n ? a.gainPercent : i?.gainPercent ?? a.gainPercent,
      B = V?.videoId === e ? V.value : z,
      O = `${B}%`,
      $ = function(e) {
        let t = e?.nleDocument?.playback.sourceAudioMode;
        if (t) return t;
        let r = e?.projectAudioTrack;
        return r ? "separated_background" === r.sourceSelection ? "separated_background" : "separated_vocals" === r.sourceSelection ? "vocals_only" : 0 === r.gainPercent ? "muted" : "original_mix" : e?.originalAudioStrategy === "mute_original" || e?.originalAudioVolume === 0 ? "muted" : e?.originalAudioStrategy === "separate_background" ? "separated_background" : "original_mix"
      }(M),
      H = p[e] ?? $,
      q = function(e) {
        switch (e) {
          case "separated_background":
            return {
              voiceOn: !1, musicOn: !0
            };
          case "vocals_only":
            return {
              voiceOn: !0, musicOn: !1
            };
          case "muted":
            return {
              voiceOn: !1, musicOn: !1
            };
          default:
            return {
              voiceOn: !0, musicOn: !0
            }
        }
      }(H),
      K = tI(M),
      X = e => !!s || !!tw(ty({
        ...q,
        [e]: !q[e]
      })) && (!i && !n || F && !K),
      G = t => {
        E(null), j(e, t).catch(e => E((0, tu.projectAudioTrackCustomerMessage)(e)))
      },
      U = (e, t) => {
        E(null), e().then(() => {
          E(null), t?.()
        }).catch(e => E((0, tu.projectAudioTrackCustomerMessage)(e)))
      },
      Y = (0, r.useMemo)(() => L || (F ? "Đang tách giọng…" : ""), [L, F]),
      J = M?.nleDocument?.audioClips?.[0],
      Z = m[e] ?? {
        state: "idle"
      },
      Q = "working" === Z.state,
      ee = s || Q || F,
      [et, er] = (0, r.useState)(null),
      [ei, ea] = (0, r.useState)({}),
      [en, es] = (0, r.useState)(!1),
      eo = (0, r.useRef)(null),
      el = J && M?.projectRoot ? (o = M.projectRoot, l = J.relativePath, d = o.replace(/[\\/]+$/, ""), u = l.replace(/^[\\/]+/, "").replace(/\\/g, "/"), `${d}/${u}`) : null;
    (0, r.useEffect)(() => () => {
      eo.current?.pause(), eo.current = null
    }, []), (0, r.useEffect)(() => {
      let e = eo.current;
      eo.current = null, e?.pause()
    }, [J?.clipId, J?.relativePath]);
    let ec = () => {
        (0, I.openFileDialog)(tK).then(t => {
          t && k(e, t)
        }).catch(() => void 0)
      },
      ed = t => {
        J && N(e, J.clipId, t)
      },
      eu = (e, r, i) => {
        let a = ei[e];
        return (0, t.jsxs)("label", {
          className: "flex items-center justify-between gap-2 text-[11px] text-muted-foreground",
          children: [(0, t.jsx)("span", {
            className: "shrink-0",
            children: r
          }), (0, t.jsx)("input", {
            type: "text",
            inputMode: "numeric",
            "aria-label": r,
            className: "h-7 w-20 rounded-md border border-input bg-background px-1.5 text-right font-mono text-[11px] tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
            value: a ?? (0, R.formatTime)(i),
            disabled: ee,
            onFocus: () => ea(t => ({
              ...t,
              [e]: (0, R.formatTime)(i)
            })),
            onChange: t => ea(r => ({
              ...r,
              [e]: t.target.value
            })),
            onBlur: () => {
              if (ea(t => {
                  let r = {
                    ...t
                  };
                  return delete r[e], r
                }), void 0 === a) return;
              let t = function(e) {
                let t = e.trim();
                if (!t) return null;
                let r = t.split(":");
                if (r.length < 1 || r.length > 3) return null;
                let i = 0,
                  a = 0,
                  n = r[0];
                if (3 === r.length ? (i = Number(r[0]), a = Number(r[1]), n = r[2]) : 2 === r.length && (a = Number(r[0]), n = r[1]), !Number.isInteger(i) || !Number.isInteger(a) || i < 0 || a < 0) return null;
                let s = /^(\d{1,3})(?:[.,](\d{1,3}))?$/.exec(n);
                if (!s) return null;
                let o = (3600 * i + 60 * a + Number(s[1])) * 1e3 + (s[2] ? Number(s[2].padEnd(3, "0")) : 0);
                return Number.isSafeInteger(o) && o >= 0 ? o : null
              }(a);
              null !== t && t !== i && ed({
                [e]: t
              })
            },
            onKeyDown: t => {
              "Enter" === t.key && t.currentTarget.blur(), "Escape" === t.key && (ea(t => {
                let r = {
                  ...t
                };
                return delete r[e], r
              }), t.currentTarget.blur())
            }
          })]
        })
      };
    return (0, t.jsxs)("div", {
      className: "space-y-3",
      children: [(0, t.jsxs)("section", {
        "data-project-audio-authoring-surface": "editor",
        className: "space-y-3 rounded-md border border-border/70 bg-card/40 p-3",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-2",
          children: [(0, t.jsxs)("div", {
            className: "min-w-0",
            children: [(0, t.jsx)("h2", {
              className: "text-sm font-medium",
              children: "Âm thanh video"
            }), (0, t.jsx)("p", {
              className: "truncate text-[11px] text-muted-foreground",
              children: "separated_background" === H ? "Nhạc nền đã tách" : "vocals_only" === H ? "Chỉ giọng nói" : "muted" === H ? "Đã tắt âm thanh gốc" : "Âm thanh gốc"
            })]
          }), (0, t.jsx)("span", {
            className: "shrink-0 font-mono text-xs tabular-nums text-primary",
            children: O
          })]
        }), (0, t.jsxs)("div", {
          className: "space-y-1.5",
          children: [(0, t.jsx)("label", {
            htmlFor: `project-audio-gain-${e}`,
            className: "sr-only",
            children: "Âm lượng video"
          }), (0, t.jsx)(td, {
            id: `project-audio-gain-${e}`,
            "aria-label": "Âm lượng video",
            min: 0,
            max: 100,
            step: 1,
            value: [B],
            disabled: F || !!i && s,
            onValueChange: ([t]) => {
              try {
                let r = Math.round(t);
                A({
                  videoId: e,
                  value: r
                }), i ? v(e, r) : g(e, r)
              } catch (e) {
                A(null), E((0, tu.projectAudioTrackCustomerMessage)(e))
              }
            },
            onValueCommit: ([t]) => {
              let r = Math.round(t);
              U(() => i ? b(e) : f(e, r), () => A(null))
            }
          }), (0, t.jsxs)("div", {
            className: "flex justify-between text-[10px] text-muted-foreground",
            children: [(0, t.jsx)("span", {
              children: "0%"
            }), (0, t.jsx)("span", {
              children: "100%"
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "space-y-2",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between gap-2",
            children: [(0, t.jsx)("span", {
              className: "text-xs text-foreground",
              children: "Giọng nói"
            }), (0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)("span", {
                className: "text-[11px] text-muted-foreground",
                children: q.voiceOn ? "Bật" : "Tắt"
              }), (0, t.jsx)(ep.Switch, {
                "aria-label": "Giọng nói",
                checked: q.voiceOn,
                disabled: X("voiceOn"),
                onCheckedChange: e => G({
                  ...q,
                  voiceOn: e
                })
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "flex items-center justify-between gap-2",
            children: [(0, t.jsx)("span", {
              className: "text-xs text-foreground",
              children: "Nhạc & âm nền"
            }), (0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)("span", {
                className: "text-[11px] text-muted-foreground",
                children: q.musicOn ? "Bật" : "Tắt"
              }), (0, t.jsx)(ep.Switch, {
                "aria-label": "Nhạc & âm nền",
                checked: q.musicOn,
                disabled: X("musicOn"),
                onCheckedChange: e => G({
                  ...q,
                  musicOn: e
                })
              })]
            })]
          }), (0, t.jsxs)("p", {
            className: "flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground",
            children: [(0, t.jsx)(e_.default, {
              className: "mt-0.5 h-3 w-3 shrink-0"
            }), "Tách bằng AI có thể còn lẫn tiếng môi trường hoặc giọng hát — kết quả không tuyệt đối."]
          })]
        }), (0, t.jsx)("div", {
          "data-project-audio-status-slot": !0,
          className: "min-h-[2.75rem] space-y-1.5 text-[11px] text-muted-foreground",
          "aria-live": "polite",
          children: F ? (0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-2",
              children: [(0, t.jsxs)("span", {
                className: "inline-flex min-w-0 items-center gap-1.5 truncate",
                children: [(0, t.jsx)(c.Loader2, {
                  className: "h-3 w-3 animate-spin"
                }), Y]
              }), (0, t.jsxs)("span", {
                className: "font-mono tabular-nums",
                children: [Math.round((D ?? 0) / 100), "%"]
              })]
            }), (0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)(S.Progress, {
                value: (D ?? 0) / 100,
                className: "h-1.5 flex-1"
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon",
                variant: "ghost",
                className: "h-6 w-6 shrink-0",
                "aria-label": "Hủy tách giọng",
                title: "Hủy tách giọng",
                onClick: () => U(() => w(e)),
                children: (0, t.jsx)(eh.X, {
                  className: "h-3.5 w-3.5"
                })
              })]
            })]
          }) : L ? (0, t.jsx)("p", {
            className: "text-destructive",
            children: L
          }) : null
        })]
      }), n ? (0, t.jsxs)("section", {
        "data-project-audio-clip-surface": "editor",
        className: "space-y-3 rounded-md border border-border/70 bg-card/40 p-3",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-2",
          children: [(0, t.jsx)("h2", {
            className: "text-sm font-medium",
            children: "Nhạc/âm thanh thêm"
          }), Q ? (0, t.jsx)(c.Loader2, {
            className: "h-3.5 w-3.5 animate-spin text-muted-foreground"
          }) : null]
        }), J ? (0, t.jsxs)("div", {
          className: "space-y-2.5",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center gap-2",
            children: [(0, t.jsx)(eM.FileAudio, {
              className: "h-4 w-4 shrink-0 text-muted-foreground"
            }), (0, t.jsxs)("div", {
              className: "min-w-0 flex-1",
              children: [(0, t.jsx)("p", {
                className: "truncate text-xs font-medium",
                title: J.fileName,
                children: J.fileName
              }), (0, t.jsx)("p", {
                className: "font-mono text-[10px] tabular-nums text-muted-foreground",
                children: (0, R.formatTime)(J.durationMs)
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center justify-between text-[11px] text-muted-foreground",
              children: [(0, t.jsx)("span", {
                children: "Âm lượng"
              }), (0, t.jsxs)("span", {
                className: "font-mono tabular-nums",
                children: [et ?? J.gainPercent, "%"]
              })]
            }), (0, t.jsx)(td, {
              "aria-label": "Âm lượng âm thanh thêm",
              min: 0,
              max: 150,
              step: 1,
              value: [et ?? J.gainPercent],
              disabled: ee,
              onValueChange: ([e]) => er(Math.round(e)),
              onValueCommit: ([e]) => {
                let t = Math.round(e);
                er(null), t !== J.gainPercent && ed({
                  gainPercent: t
                })
              }
            }), (0, t.jsxs)("div", {
              className: "flex justify-between text-[10px] text-muted-foreground",
              children: [(0, t.jsx)("span", {
                children: "0%"
              }), (0, t.jsx)("span", {
                children: "150%"
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [eu("startMs", "Bắt đầu lúc", J.startMs), eu("trimInMs", "Cắt đầu", J.trimInMs), eu("trimEndMs", "Cắt cuối", J.trimEndMs)]
          }), (0, t.jsxs)("div", {
            className: "flex items-center gap-1.5",
            children: [(0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "outline",
              className: "h-7 flex-1 text-[11px]",
              disabled: ee || !el,
              onClick: () => {
                if (!el || !J) return;
                if (eo.current) {
                  eo.current.pause(), eo.current = null, es(!1);
                  return
                }
                let e = new Audio((0, I.resolveMediaSrc)(el));
                eo.current = e, e.volume = Math.min(1, J.gainPercent / 100);
                let t = Math.min(J.trimEndMs, J.durationMs) / 1e3;
                e.onloadedmetadata = () => {
                  e.currentTime = J.trimInMs / 1e3, e.play().then(() => es(!0)).catch(() => {
                    eo.current = null, es(!1), E("File âm thanh không đọc được hoặc định dạng không hỗ trợ.")
                  })
                }, e.ontimeupdate = () => {
                  eo.current === e && e.currentTime >= t && e.pause()
                }, e.onended = () => es(!1), e.onpause = () => es(!1), e.onerror = () => {
                  eo.current === e && (eo.current = null), es(!1), E("File âm thanh không đọc được hoặc định dạng không hỗ trợ.")
                }
              },
              children: [en ? (0, t.jsx)(eP.Pause, {
                className: "h-3 w-3"
              }) : (0, t.jsx)(eT.Play, {
                className: "h-3 w-3"
              }), "Nghe thử"]
            }), (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "outline",
              className: "h-7 flex-1 text-[11px]",
              disabled: ee,
              onClick: ec,
              children: [(0, t.jsx)(P.RefreshCw, {
                className: "h-3 w-3"
              }), "Thay file"]
            }), (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "outline",
              className: "h-7 flex-1 text-[11px] text-destructive hover:text-destructive",
              disabled: ee,
              onClick: () => {
                J && (0, I.askMessage)("Xóa âm thanh đã tải lên", "Xóa âm thanh đã tải lên khỏi video?", "warning", {
                  confirmLabel: "Xóa",
                  cancelLabel: "Hủy"
                }).then(t => {
                  t && (eo.current?.pause(), eo.current = null, es(!1), C(e, J.clipId))
                }).catch(() => void 0)
              },
              children: [(0, t.jsx)(x.Trash2, {
                className: "h-3 w-3"
              }), "Xóa"]
            })]
          })]
        }) : (0, t.jsxs)("div", {
          className: "space-y-2",
          children: [(0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "h-8 w-full justify-center text-xs",
            disabled: s || Q || F,
            onClick: ec,
            children: [(0, t.jsx)(eM.FileAudio, {
              className: "h-3.5 w-3.5"
            }), "Tải âm thanh lên"]
          }), (0, t.jsx)("p", {
            className: "text-[11px] text-muted-foreground",
            children: "Thêm nhạc nền hoặc âm thanh vào video"
          })]
        }), "error" === Z.state ? (0, t.jsx)("p", {
          className: "text-[11px] text-destructive",
          children: Z.message
        }) : null]
      }) : null]
    })
  }
  var tG = e.i(47167),
    tW = e.i(81795),
    tU = e.i(53752),
    tY = e.i(54181);

  function tJ({
    sourceVideo: e,
    isPlaying: i,
    currentTime: a,
    canvas: n
  }) {
    let s = (0, r.useRef)(null);
    return ((0, r.useEffect)(() => {
      let t = s.current;
      if (!t || !e || "blur" !== n.background.mode) return;
      let r = 0,
        a = null,
        o = !1,
        l = () => {
          if (o || e.readyState < 2 || !e.videoWidth) return;
          let r = "16:9" === n.aspectRatio ? 320 : 180,
            i = "16:9" === n.aspectRatio ? 180 : 320;
          t.width !== r && (t.width = r), t.height !== i && (t.height = i);
          let a = t.getContext("2d");
          if (!a) return;
          let s = e.videoWidth / e.videoHeight,
            l = r / i,
            c = 0,
            d = 0,
            u = e.videoWidth,
            h = e.videoHeight;
          s > l ? (u = h * l, c = (e.videoWidth - u) / 2) : (h = u / l, d = (e.videoHeight - h) / 2), a.clearRect(0, 0, r, i), a.filter = `blur(${Math.max(1,n.background.blur/2)}px)`, a.drawImage(e, c, d, u, h, -8, -8, r + 16, i + 16), a.filter = "none"
        },
        c = () => {
          o || r || !i || ("function" == typeof e.requestVideoFrameCallback ? (a = "rvfc", r = e.requestVideoFrameCallback(() => {
            r = 0, l(), c()
          })) : (a = "raf", r = requestAnimationFrame(() => {
            r = 0, l(), c()
          })))
        };
      return l(), c(), () => {
        o = !0, r && ("rvfc" === a ? e.cancelVideoFrameCallback?.(r) : cancelAnimationFrame(r), r = 0)
      }
    }, [n, a, i, e]), "source" === n.aspectRatio) ? null : "solid" === n.background.mode ? (0, t.jsx)("div", {
      "aria-hidden": !0,
      className: "absolute inset-0",
      style: {
        background: n.background.color
      }
    }) : (0, t.jsx)("canvas", {
      ref: s,
      "aria-hidden": !0,
      className: "absolute inset-0 h-full w-full"
    })
  }

  function tZ({
    sourceVideo: e,
    isPlaying: i,
    currentTime: a,
    removal: n,
    editable: s = !1,
    onDraftChange: o,
    onCommit: l,
    onDraftRegistrationChange: c
  }) {
    let d = (0, r.useRef)(null),
      u = (0, r.useRef)(null),
      h = (0, r.useRef)(null),
      [p, m] = (0, r.useState)(n),
      [g, x] = (0, r.useState)(!1),
      f = (0, r.useRef)(n),
      v = (0, r.useRef)(null);
    (0, r.useEffect)(() => {
      if (v.current) return;
      let e = requestAnimationFrame(() => {
        f.current = n, m(n)
      });
      return () => cancelAnimationFrame(e)
    }, [n]), (0, r.useEffect)(() => {
      let t = d.current;
      if (!t || !e || !p.enabled) return;
      let r = 0,
        a = null,
        n = !1,
        s = () => {
          if (n || e.readyState < 2 || !e.videoWidth) return;
          let r = p.delogoBand,
            i = Math.max(0, Math.floor(e.videoWidth * p.xPercent / 100) - r),
            a = Math.max(0, Math.floor(e.videoHeight * p.yPercent / 100) - r),
            s = Math.min(e.videoWidth, Math.ceil(e.videoWidth * (p.xPercent + p.widthPercent) / 100) + r),
            o = Math.min(e.videoHeight, Math.ceil(e.videoHeight * (p.yPercent + p.heightPercent) / 100) + r),
            l = Math.max(1, s - i),
            c = Math.max(1, o - a);
          t.width !== l && (t.width = l), t.height !== c && (t.height = c);
          let d = t.getContext("2d", {
            willReadFrequently: !0
          });
          if (d) try {
            let t = Math.max(0, i - 1),
              r = Math.max(0, a - 1),
              n = Math.min(e.videoWidth, i + l + 1),
              s = Math.min(e.videoHeight, a + c + 1),
              o = Math.max(1, n - t),
              h = Math.max(1, s - r),
              p = u.current ?? document.createElement("canvas");
            u.current = p, p.width = o, p.height = h;
            let m = p.getContext("2d", {
              willReadFrequently: !0
            });
            if (!m) return;
            m.drawImage(e, t, r, o, h, 0, 0, o, h);
            let g = m.getImageData(0, 0, o, h).data,
              f = d.createImageData(l, c),
              v = f.data,
              b = (e, i, a) => {
                let n = Math.min(o - 1, Math.max(0, e - t));
                return g[(Math.min(h - 1, Math.max(0, i - r)) * o + n) * 4 + a]
              };
            for (let e = 0; e < c; e += 1) {
              let t = a + e,
                r = e + 1,
                n = c - e,
                s = Math.min(r, n) ** 2;
              for (let o = 0; o < l; o += 1) {
                let d = (e * l + o) * 4,
                  u = i + o,
                  h = o + 1,
                  p = l - o,
                  m = Math.min(h, p) ** 2,
                  g = m + s || 1;
                for (let e = 0; e < 3; e += 1) {
                  let o = (b(i - 1, t, e) * p + b(i + l, t, e) * h) / (l + 1),
                    x = (b(u, a - 1, e) * n + b(u, a + c, e) * r) / (c + 1);
                  v[d + e] = Math.round((o * s + x * m) / g)
                }
                v[d + 3] = 255
              }
            }
            d.putImageData(f, 0, 0), x(!1)
          } catch {
            d.clearRect(0, 0, l, c), x(!0)
          }
        },
        o = () => {
          n || r || !i || ("function" == typeof e.requestVideoFrameCallback ? (a = "rvfc", r = e.requestVideoFrameCallback(() => {
            r = 0, s(), o()
          })) : (a = "raf", r = requestAnimationFrame(() => {
            r = 0, s(), o()
          })))
        };
      return s(), o(), () => {
        n = !0, r && ("rvfc" === a ? e.cancelVideoFrameCallback?.(r) : cancelAnimationFrame(r), r = 0)
      }
    }, [a, p, i, e]);
    let b = r.default.useCallback(e => {
      let t = v.current;
      t && (!e || t.gestureId === e) && (v.current = null, t.target.hasPointerCapture(t.pointerId) && t.target.releasePointerCapture(t.pointerId), f.current = t.start, m(t.start), o?.(t.start), c?.(null))
    }, [o, c]);
    (0, r.useEffect)(() => {
      let e = e => {
        "Escape" === e.key && v.current && (e.preventDefault(), b())
      };
      return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e)
    }, [b]), (0, r.useEffect)(() => () => {
      v.current && (v.current = null, c?.(null))
    }, [c]);
    let y = (e, t) => {
        if (!s) return;
        e.preventDefault(), e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId);
        let r = `source-removal-${e.pointerId}-${Date.now()}`;
        v.current = {
          pointerId: e.pointerId,
          mode: t,
          startX: e.clientX,
          startY: e.clientY,
          start: f.current,
          gestureId: r,
          target: e.currentTarget
        }, c?.({
          gestureId: r,
          cancel: () => b(r)
        })
      },
      w = e => {
        let t = v.current,
          r = h.current;
        if (!t || !r || t.pointerId !== e.pointerId) return;
        let i = r.getBoundingClientRect(),
          a = (e.clientX - t.startX) / Math.max(1, i.width) * 100,
          n = (e.clientY - t.startY) / Math.max(1, i.height) * 100,
          s = (0, tY.normalizedSourceRemoval)("move" === t.mode ? {
            ...t.start,
            xPercent: t.start.xPercent + a,
            yPercent: t.start.yPercent + n
          } : {
            ...t.start,
            widthPercent: t.start.widthPercent + a,
            heightPercent: t.start.heightPercent + n
          });
        f.current = s, m(s), o?.(s)
      },
      j = (e, t) => {
        let r = v.current;
        if (r && r.pointerId === e.pointerId) {
          if (v.current = null, e.currentTarget.hasPointerCapture(e.pointerId) && e.currentTarget.releasePointerCapture(e.pointerId), !t) {
            v.current = r, b(r.gestureId);
            return
          }
          c?.(null), Promise.resolve(l?.(f.current))
        }
      };
    if (!p.enabled) return null;
    let k = e?.videoWidth ? p.delogoBand / e.videoWidth * 100 : 0,
      S = e?.videoHeight ? p.delogoBand / e.videoHeight * 100 : 0;
    return (0, t.jsx)("div", {
      ref: h,
      className: "pointer-events-none absolute inset-0",
      children: (0, t.jsxs)("div", {
        className: s ? "pointer-events-auto absolute cursor-move border border-dashed border-white/80" : "absolute",
        style: {
          left: `${Math.max(0,p.xPercent-k)}%`,
          top: `${Math.max(0,p.yPercent-S)}%`,
          width: `${Math.min(100,p.widthPercent+2*k)}%`,
          height: `${Math.min(100,p.heightPercent+2*S)}%`
        },
        onPointerDown: e => y(e, "move"),
        onPointerMove: w,
        onPointerUp: e => j(e, !0),
        onPointerCancel: e => j(e, !1),
        children: [g ? (0, t.jsx)("div", {
          "aria-hidden": !0,
          className: "absolute inset-0 bg-black/5 backdrop-blur-md"
        }) : null, (0, t.jsx)("canvas", {
          ref: d,
          "aria-hidden": !0,
          className: `h-full w-full ${g?"invisible":""}`
        }), s ? (0, t.jsx)("button", {
          type: "button",
          "aria-label": "Doi kich thuoc vung xoa phu de",
          className: "absolute bottom-0 right-0 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-[2px] border border-white bg-primary",
          onPointerDown: e => y(e, "resize"),
          onPointerMove: w,
          onPointerUp: e => j(e, !0),
          onPointerCancel: e => j(e, !1)
        }) : null]
      })
    })
  }
  let tQ = (0, h.default)("eraser", [
    ["path", {
      d: "M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21",
      key: "g5wo59"
    }],
    ["path", {
      d: "m5.082 11.09 8.828 8.828",
      key: "1wx5vj"
    }]
  ]);
  var t0 = e.i(72382),
    t1 = e.i(80860);
  let t2 = (0, h.default)("flip-horizontal-2", [
      ["path", {
        d: "m3 7 5 5-5 5V7",
        key: "couhi7"
      }],
      ["path", {
        d: "m21 7-5 5 5 5V7",
        key: "6ouia7"
      }],
      ["path", {
        d: "M12 20v2",
        key: "1lh1kg"
      }],
      ["path", {
        d: "M12 14v2",
        key: "8jcxud"
      }],
      ["path", {
        d: "M12 8v2",
        key: "1woqiv"
      }],
      ["path", {
        d: "M12 2v2",
        key: "tus03m"
      }]
    ]),
    t5 = (0, h.default)("image", [
      ["rect", {
        width: "18",
        height: "18",
        x: "3",
        y: "3",
        rx: "2",
        ry: "2",
        key: "1m3agn"
      }],
      ["circle", {
        cx: "9",
        cy: "9",
        r: "2",
        key: "af1f0g"
      }],
      ["path", {
        d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
        key: "1xmnt7"
      }]
    ]);
  var t3 = e.i(28623);
  let t4 = (0, h.default)("square", [
      ["rect", {
        width: "18",
        height: "18",
        x: "3",
        y: "3",
        rx: "2",
        key: "afitv7"
      }]
    ]),
    t8 = (0, h.default)("type", [
      ["path", {
        d: "M12 4v16",
        key: "1654pz"
      }],
      ["path", {
        d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",
        key: "e0r10z"
      }],
      ["path", {
        d: "M9 20h6",
        key: "s66wpe"
      }]
    ]);
  var t7 = e.i(24687);

  function t6({
    value: e,
    onChange: i
  }) {
    let [a, n] = (0, r.useState)(e), [s, o] = (0, r.useState)(!1);
    return (0, t.jsx)(t7.Textarea, {
      value: s ? a : e,
      onFocus: () => {
        o(!0), n(e)
      },
      onChange: e => {
        let t = e.target.value;
        n(t), i(t)
      },
      onBlur: () => {
        o(!1)
      },
      className: "min-h-20 text-xs"
    })
  }
  var t9 = e.i(46798),
    re = e.i(46982);

  function rt({
    centerXPercent: e,
    targetXPercent: t = 50,
    thresholdPercent: r = 1.2
  }) {
    let i = Number.isFinite(t) ? t : 50,
      a = Number.isFinite(e) ? e : i,
      n = Math.abs(a - i) <= (Number.isFinite(r) ? Math.max(0, r) : 1.2);
    return {
      xPercent: n ? i : a,
      snapped: n
    }
  }
  let rr = Object.freeze(["png", "jpg", "jpeg", "webp", "bmp", "gif", "avif"]),
    ri = /^(?:asset|https?|data|blob):/i,
    ra = /^(?:[a-z]:[\\/]|\\\\)/i;

  function rn(e, t) {
    if (!Number.isInteger(e) || 0 >= Number(e)) throw Error(`Invalid watermark motion contract field: ${t}`);
    return Number(e)
  }
  let rs = function(e) {
      if ("watermark-motion-v1" !== e.schemaVersion) throw Error("Unsupported watermark motion contract schema");
      if (!Array.isArray(e.protectionPreviewBaseCycleMs) || 4 !== e.protectionPreviewBaseCycleMs.length) throw Error("Watermark motion contract requires four protection trajectories");
      let t = {
        schemaVersion: "watermark-motion-v1",
        durationMultiplier: rn(e.durationMultiplier, "durationMultiplier"),
        customerPreviewBaseCycleMs: rn(e.customerPreviewBaseCycleMs, "customerPreviewBaseCycleMs"),
        protectionPreviewBaseCycleMs: e.protectionPreviewBaseCycleMs.map((e, t) => rn(e, `protectionPreviewBaseCycleMs[${t}]`)),
        exportBaseCycleMs: rn(e.exportBaseCycleMs, "exportBaseCycleMs"),
        exportWaypointCount: rn(e.exportWaypointCount, "exportWaypointCount")
      };
      if (5 !== t.exportWaypointCount) throw Error("watermark-motion-v1 requires five export waypoints");
      return t
    }(e.i(14702).default),
    ro = Object.freeze({
      schemaVersion: rs.schemaVersion,
      durationMultiplier: rs.durationMultiplier,
      customerPreviewCycleMs: rs.customerPreviewBaseCycleMs * rs.durationMultiplier,
      protectionPreviewCycleMs: rs.protectionPreviewBaseCycleMs.map(e => e * rs.durationMultiplier),
      exportCycleMs: rs.exportBaseCycleMs * rs.durationMultiplier,
      exportWaypointCount: rs.exportWaypointCount
    }),
    rl = (e, t, r) => Math.min(r, Math.max(t, e)),
    rc = e => Math.round(1e6 * e) / 1e6;

  function rd(e, t) {
    return e.promotedLayer
  }

  function ru({
    layer: e,
    projectAssetRoot: i
  }) {
    let a = (0, r.useMemo)(() => (function(e, t) {
        let r = e.trim();
        if (!r) return null;
        if (ri.test(r) || ra.test(r) || r.startsWith("/")) return r;
        if (!t?.trim()) return null;
        let i = r.replace(/\\/g, "/").split("/");
        if (i.length < 3 || "nle-assets" !== i[0] || "visuals" !== i[1] || i.some(e => !e || "." === e || ".." === e)) return null;
        let a = t.trim().replace(/[\\/]+$/, "");
        if (!a) return null;
        let n = a.includes("\\") ? "\\" : "/";
        return `${a}${n}${i.join(n)}`
      })(e.imagePath, i), [e.imagePath, i]),
      n = a ? (0, I.resolveMediaSrc)(a) : null,
      [s, o] = (0, r.useState)(null),
      l = n === s;
    return !n || l ? (0, t.jsx)("div", {
      "data-export-image-preview-fallback": !0,
      className: "flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground",
      style: {
        opacity: e.opacity
      },
      children: (0, t.jsx)(t5, {
        className: "h-1/2 w-1/2",
        "aria-hidden": "true"
      })
    }) : (0, t.jsx)("img", {
      src: n,
      alt: "",
      className: "h-full w-full object-contain",
      style: {
        opacity: e.opacity
      },
      onError: () => o(n)
    })
  }
  let rh = (e, t, r) => Math.min(r, Math.max(t, e)),
    rp = () => `layer_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

  function rm(e, t, r) {
    return e.map(e => e.id === t ? r(e) : e)
  }

  function rg(e) {
    return "cover" === e.type && "glass" === e.effect
  }

  function rx(e) {
    return "cover" === e.type && "mirror" === e.effect
  }

  function rf(e) {
    return "text" === e.type && "wander" === e.motion
  }

  function rv(e) {
    return rf(e) ? "Watermark chạy" : (0, tY.isSourceRemovalExportLayer)(e) ? "Xóa phụ đề / vật thể" : rx(e) ? "Gương rõ" : "cover" === e.type ? rg(e) ? "Kính mờ" : "Nền phủ" : "text" === e.type ? "Chữ" : "Logo"
  }

  function rb({
    layer: e,
    mirrorPreview: i
  }) {
    let a, n, s = (0, r.useRef)(null),
      o = (a = rh(e.heightPercent, 1, 100), (n = rh(e.yPercent, 0, 100 - a)) >= a ? n - a : rh(n + a, 0, 100 - a));
    return (0, r.useEffect)(() => {
      let t = s.current,
        r = i?.sourceVideo;
      if (!t || !r) return;
      let a = 0,
        n = null,
        l = !1,
        c = () => {
          !l && !a && i?.isPlaying && ("function" == typeof r.requestVideoFrameCallback ? (n = "rvfc", a = r.requestVideoFrameCallback(() => {
            a = 0, n = null, d()
          })) : (n = "raf", a = requestAnimationFrame(() => {
            a = 0, n = null, d()
          })))
        },
        d = () => {
          if (l) return;
          let i = r.videoWidth,
            a = r.videoHeight;
          if (!i || !a || r.readyState < 2) {
            let e = t.getContext("2d");
            e && (e.fillStyle = "rgba(20, 24, 32, 0.72)", e.fillRect(0, 0, Math.max(1, t.width), Math.max(1, t.height))), c();
            return
          }
          let n = Math.min(i - 1, Math.round(i * rh(e.xPercent, 0, 100) / 100)),
            s = Math.min(a - 1, Math.round(a * o / 100)),
            d = Math.max(1, Math.min(i - n, Math.round(i * rh(e.widthPercent, 1, 100) / 100))),
            u = Math.max(1, Math.min(a - s, Math.round(a * rh(e.heightPercent, 1, 100) / 100)));
          t.width !== d && (t.width = d), t.height !== u && (t.height = u);
          let h = t.getContext("2d");
          if (h) {
            try {
              h.clearRect(0, 0, t.width, t.height), h.drawImage(r, n, s, d, u, 0, 0, t.width, t.height)
            } catch (e) {
              console.warn("Mirror preview draw skipped:", e), h.fillStyle = "rgba(20, 24, 32, 0.72)", h.fillRect(0, 0, t.width, t.height)
            }
            c()
          }
        };
      return d(), () => {
        l = !0, a && ("rvfc" === n ? r.cancelVideoFrameCallback?.(a) : cancelAnimationFrame(a), a = 0, n = null)
      }
    }, [e.heightPercent, e.widthPercent, e.xPercent, i?.currentTime, i?.isPlaying, i?.sourceVideo, o]), (0, t.jsx)("div", {
      className: "relative h-full w-full overflow-hidden bg-transparent",
      children: (0, t.jsx)("canvas", {
        ref: s,
        "aria-hidden": "true",
        className: "h-full w-full",
        style: {
          opacity: 1
        }
      })
    })
  }

  function ry({
    color: e,
    onCommit: i
  }) {
    let [a, n] = (0, r.useState)(e), s = (0, r.useRef)(e), o = e => {
      s.current = e, n(e)
    };
    return (0, t.jsx)(k.Input, {
      type: "color",
      "aria-label": "Màu nền canvas",
      value: a,
      className: "h-8 w-full p-1",
      onChange: e => o(e.target.value),
      onBlur: () => {
        s.current !== e && i(s.current)
      },
      onKeyDown: t => {
        "Enter" === t.key ? t.currentTarget.blur() : "Escape" === t.key && (t.preventDefault(), o(e), t.currentTarget.blur())
      }
    })
  }

  function rw({
    fontSize: e,
    onCommit: i
  }) {
    let [a, n] = (0, r.useState)(String(e)), s = (0, r.useRef)(String(e)), o = e => {
      s.current = e, n(e)
    };
    return (0, t.jsx)(k.Input, {
      type: "number",
      min: 10,
      max: 160,
      value: a,
      onChange: e => o(e.target.value),
      onBlur: () => {
        if (!s.current.trim()) return void o(String(e));
        let t = Number(s.current);
        if (!Number.isFinite(t)) return void o(String(e));
        let r = Math.round(rh(t, 10, 160));
        o(String(r)), r !== e && i(r)
      },
      onKeyDown: t => {
        "Enter" === t.key ? t.currentTarget.blur() : "Escape" === t.key && (t.preventDefault(), o(String(e)), t.currentTarget.blur())
      }
    })
  }

  function rj({
    layers: e,
    selectedLayerId: i,
    compact: a = !1,
    movingWatermarkAllowed: n = !1,
    canvasComposition: s = tY.DEFAULT_CANVAS_COMPOSITION,
    sourceRemoval: o = tY.DEFAULT_SOURCE_REMOVAL,
    onCanvasCompositionChange: l,
    onSourceRemovalChange: c,
    onLayersChange: d,
    onSelectedLayerIdChange: u,
    onPickLogo: h
  }) {
    let p, m = (0, r.useMemo)(() => e.find(e => e.id === i) ?? null, [e, i]),
      g = !!(c && i === tY.SOURCE_REMOVAL_OVERLAY_ID),
      f = !!(c && o.enabled),
      v = async () => {
        let t = await h();
        if (!t) return;
        let r = {
          id: rp(),
          type: "image",
          enabled: !0,
          xPercent: 72,
          yPercent: 8,
          widthPercent: 18,
          heightPercent: 12,
          opacity: .85,
          zIndex: (0, re.getDefaultExportLayerZIndex)("image"),
          imagePath: t
        };
        d([...e, r]), u(r.id)
      }, b = (t, r) => {
        d(rm(e, t, e => ({
          ...e,
          ...r
        })))
      };
    return (0, t.jsxs)("div", {
      "data-export-layer-controls": !0,
      className: "space-y-3",
      children: [l ? (0, t.jsxs)("div", {
        className: "border-b border-border px-1 pb-3",
        children: [(0, t.jsxs)("div", {
          className: "mb-2 flex items-center justify-between",
          children: [(0, t.jsx)("p", {
            className: "text-xs font-semibold",
            children: "Khung hình"
          }), (0, t.jsx)("span", {
            className: "text-[10px] text-muted-foreground",
            children: "Preview = Export"
          })]
        }), (0, t.jsx)("div", {
          className: "grid grid-cols-3 gap-1",
          role: "group",
          "aria-label": "Tỷ lệ khung hình",
          children: ["source", "16:9", "9:16"].map(e => (0, t.jsx)(y.Button, {
            type: "button",
            size: "sm",
            variant: s.aspectRatio === e ? "default" : "outline",
            className: "h-8 text-xs",
            onClick: () => void l((0, tY.canvasCompositionForAspect)(e)),
            children: "source" === e ? "Gốc" : e
          }, e))
        }), "source" !== s.aspectRatio ? (0, t.jsxs)("div", {
          className: "mt-3 space-y-3",
          children: [(0, t.jsx)("div", {
            className: "flex gap-2",
            children: ["blur", "solid"].map(e => (0, t.jsx)(y.Button, {
              type: "button",
              size: "sm",
              variant: s.background.mode === e ? "secondary" : "outline",
              className: "h-8 flex-1 text-xs",
              onClick: () => void l({
                ...s,
                background: {
                  ...s.background,
                  mode: e
                }
              }),
              children: "blur" === e ? "Nền mờ" : "Màu nền"
            }, e))
          }), "solid" === s.background.mode ? (0, t.jsx)(ry, {
            color: s.background.color,
            onCommit: e => l({
              ...s,
              background: {
                ...s.background,
                color: e
              }
            })
          }, s.background.color) : (0, t.jsxs)("div", {
            className: "space-y-1",
            children: [(0, t.jsxs)("div", {
              className: "flex justify-between text-[10px] text-muted-foreground",
              children: [(0, t.jsx)("span", {
                children: "Độ mờ nền"
              }), (0, t.jsxs)("span", {
                children: [Math.round(s.background.blur), " px"]
              })]
            }), (0, t.jsx)(td, {
              min: 1,
              max: 64,
              step: 1,
              value: [s.background.blur],
              onValueCommit: ([e]) => void l({
                ...s,
                background: {
                  ...s.background,
                  blur: e ?? 24
                }
              })
            })]
          })]
        }) : null]
      }) : null, (0, t.jsxs)("div", {
        className: "rounded-lg border border-border bg-card/60 p-3",
        children: [(0, t.jsxs)("div", {
          className: "mb-3",
          children: [(0, t.jsx)("p", {
            className: "text-xs font-semibold",
            children: "Watermark / Overlay"
          }), (0, t.jsx)("p", {
            className: "mt-1 text-[10px] leading-4 text-muted-foreground",
            children: "Thêm nền phủ, chữ hoặc logo rồi kéo thả ngay trên video preview."
          })]
        }), (0, t.jsxs)("div", {
          "data-export-layer-add-buttons": !0,
          className: "grid grid-cols-2 gap-2",
          children: [(0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "justify-start text-xs",
            onClick: () => {
              let t = {
                id: rp(),
                type: "cover",
                enabled: !0,
                xPercent: 12,
                yPercent: 72,
                widthPercent: 76,
                heightPercent: 14,
                opacity: .72,
                zIndex: (0, re.getDefaultExportLayerZIndex)("cover"),
                effect: "solid",
                color: "#000000"
              };
              d([...e, t]), u(t.id)
            },
            children: [(0, t.jsx)(t4, {
              className: "mr-1 h-3.5 w-3.5"
            }), "Nền phủ"]
          }), (0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "justify-start text-xs",
            onClick: () => {
              let t = {
                id: rp(),
                type: "cover",
                enabled: !0,
                xPercent: 10,
                yPercent: 70,
                widthPercent: 80,
                heightPercent: 16,
                opacity: .05,
                zIndex: (0, re.getDefaultExportLayerZIndex)("cover"),
                effect: "glass",
                color: "#FFFFFF"
              };
              d([...e, t]), u(t.id)
            },
            children: [(0, t.jsx)(t3.Sparkles, {
              className: "mr-1 h-3.5 w-3.5"
            }), "Kính mờ"]
          }), (0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "justify-start text-xs",
            onClick: () => {
              let t = {
                id: rp(),
                type: "cover",
                enabled: !0,
                xPercent: 8,
                yPercent: 70,
                widthPercent: 84,
                heightPercent: 18,
                opacity: 1,
                zIndex: (0, re.getDefaultExportLayerZIndex)("cover"),
                effect: "mirror",
                color: "#000000"
              };
              d([...e, t]), u(t.id)
            },
            children: [(0, t.jsx)(t2, {
              className: "mr-1 h-3.5 w-3.5"
            }), "Gương rõ"]
          }), (0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "justify-start text-xs",
            onClick: () => {
              let t = {
                id: rp(),
                type: "text",
                enabled: !0,
                xPercent: 64,
                yPercent: 84,
                widthPercent: 28,
                heightPercent: 8,
                opacity: .85,
                zIndex: (0, re.getDefaultExportLayerZIndex)("text"),
                text: "dichvideo.com",
                color: "#FFFFFF",
                fontSize: 28,
                fontFamily: re.EXPORT_TEXT_DEFAULT_FONT_FAMILY,
                fontWeight: re.EXPORT_TEXT_DEFAULT_FONT_WEIGHT
              };
              d([...e, t]), u(t.id)
            },
            children: [(0, t.jsx)(t8, {
              className: "mr-1 h-3.5 w-3.5"
            }), "Chữ"]
          }), (0, t.jsx)(t9.TooltipProvider, {
            delayDuration: 0,
            children: (0, t.jsxs)(t9.Tooltip, {
              children: [(0, t.jsx)(t9.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsx)("span", {
                  "data-export-moving-watermark-tooltip-trigger": !0,
                  className: "block",
                  tabIndex: n ? -1 : 0,
                  "aria-disabled": !n,
                  children: (0, t.jsxs)(y.Button, {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    className: "w-full justify-start text-xs",
                    "data-export-moving-watermark-button": !0,
                    disabled: !n,
                    onClick: () => {
                      if (!n) return;
                      let t = {
                        id: rp(),
                        type: "text",
                        enabled: !0,
                        xPercent: 8,
                        yPercent: 12,
                        widthPercent: 34,
                        heightPercent: 10,
                        opacity: .88,
                        zIndex: (0, re.getDefaultExportLayerZIndex)("text"),
                        text: "dichvideo.com",
                        color: "#FFFFFF",
                        motion: "wander",
                        fontSize: 34,
                        fontFamily: re.EXPORT_TEXT_DEFAULT_FONT_FAMILY,
                        fontWeight: re.EXPORT_TEXT_DEFAULT_FONT_WEIGHT
                      };
                      d([...e, t]), u(t.id)
                    },
                    children: [(0, t.jsx)(t8, {
                      className: "mr-1 h-3.5 w-3.5"
                    }), "Watermark chạy"]
                  })
                })
              }), (0, t.jsx)(t9.TooltipContent, {
                children: n ? "Thêm watermark chạy khắp video" : "Nâng cấp để sử dụng"
              })]
            })
          }), (0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "justify-start text-xs",
            onClick: v,
            children: [(0, t.jsx)(t5, {
              className: "mr-1 h-3.5 w-3.5"
            }), "Logo"]
          }), (0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "justify-start text-xs",
            onClick: () => {
              let t = {
                id: rp(),
                type: "cover",
                enabled: !0,
                xPercent: tY.DEFAULT_SOURCE_REMOVAL.xPercent,
                yPercent: tY.DEFAULT_SOURCE_REMOVAL.yPercent,
                widthPercent: tY.DEFAULT_SOURCE_REMOVAL.widthPercent,
                heightPercent: tY.DEFAULT_SOURCE_REMOVAL.heightPercent,
                opacity: 1,
                zIndex: (0, re.getDefaultExportLayerZIndex)("cover"),
                effect: "remove",
                color: "#000000"
              };
              d([...e, t]), u(t.id)
            },
            children: [(0, t.jsx)(tQ, {
              className: "mr-1 h-3.5 w-3.5"
            }), "Xóa phụ đề / vật thể"]
          })]
        })]
      }), (0, t.jsxs)("div", {
        className: `grid gap-3 ${a?"":"md:grid-cols-[180px_1fr]"}`,
        children: [(0, t.jsxs)("div", {
          "data-export-layer-list": !0,
          className: "space-y-2",
          children: [f ? (0, t.jsxs)("div", {
            "data-source-removal-overlay": !0,
            className: `flex items-center gap-1 rounded-lg border bg-background/50 p-1 ${g?"border-primary bg-primary/5":"border-border"}`,
            children: [(0, t.jsxs)("button", {
              type: "button",
              onClick: () => u(tY.SOURCE_REMOVAL_OVERLAY_ID),
              className: "min-w-0 flex-1 rounded-md px-2 py-1 text-left text-xs hover:bg-muted/70",
              children: [(0, t.jsx)("span", {
                className: "block truncate font-medium",
                children: "1. Xóa phụ đề / vật thể"
              }), (0, t.jsx)("span", {
                className: "block text-[10px] text-muted-foreground",
                children: o.enabled ? "Đang áp dụng" : "Đang ẩn khỏi preview"
              })]
            }), (0, t.jsx)(y.Button, {
              type: "button",
              size: "icon",
              variant: "ghost",
              className: "h-7 w-7 shrink-0",
              "aria-label": o.enabled ? "Ẩn vùng xóa" : "Hiện vùng xóa",
              title: o.enabled ? "Ẩn vùng xóa" : "Hiện vùng xóa",
              onClick: () => {
                c && c((0, tY.normalizedSourceRemoval)({
                  ...o,
                  enabled: !o.enabled
                }))
              },
              children: o.enabled ? (0, t.jsx)(t0.Eye, {
                className: "h-3.5 w-3.5"
              }) : (0, t.jsx)(t1.EyeOff, {
                className: "h-3.5 w-3.5"
              })
            })]
          }) : null, e.map((e, r) => (0, t.jsxs)("div", {
            className: `flex items-center gap-1 rounded-lg border bg-background/50 p-1 ${i===e.id?"border-primary bg-primary/5":"border-border"}`,
            children: [(0, t.jsxs)("button", {
              type: "button",
              onClick: () => u(e.id),
              className: "min-w-0 flex-1 rounded-md px-2 py-1 text-left text-xs hover:bg-muted/70",
              children: [(0, t.jsxs)("span", {
                className: "block truncate font-medium",
                children: [r + (f ? 2 : 1), ". ", rv(e)]
              }), (0, t.jsx)("span", {
                className: "block text-[10px] text-muted-foreground",
                children: (0, tY.isSourceRemovalExportLayer)(e) ? e.enabled ? "Đang áp dụng" : "Đang ẩn khỏi preview" : rx(e) ? "Áp dụng rõ 100%" : `Độ r\xf5 ${Math.round(100*e.opacity)}%`
              })]
            }), (0, t.jsx)(y.Button, {
              type: "button",
              size: "icon",
              variant: "ghost",
              className: "h-7 w-7 shrink-0",
              "aria-label": e.enabled ? "Ẩn layer overlay" : "Hiện layer overlay",
              title: e.enabled ? "Ẩn layer overlay" : "Hiện layer overlay",
              onClick: () => {
                b(e.id, {
                  enabled: !e.enabled
                })
              },
              children: e.enabled ? (0, t.jsx)(t0.Eye, {
                className: "h-3.5 w-3.5"
              }) : (0, t.jsx)(t1.EyeOff, {
                className: "h-3.5 w-3.5"
              })
            })]
          }, e.id)), 0 !== e.length || f ? null : (0, t.jsx)("p", {
            className: "rounded-lg border border-dashed border-border bg-background/40 p-3 text-[10px] leading-4 text-muted-foreground",
            children: "Chưa có layer overlay."
          })]
        }), g && c ? (0, t.jsxs)("div", {
          className: "space-y-3 rounded-lg border border-border bg-background/65 p-3 shadow-sm",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between gap-3",
            children: [(0, t.jsxs)("div", {
              className: "min-w-0",
              children: [(0, t.jsx)("span", {
                className: "block truncate text-xs font-medium",
                children: "Đang chọn: Xóa phụ đề / vật thể"
              }), (0, t.jsx)("span", {
                className: "text-[10px] text-muted-foreground",
                children: "Kéo khung trực tiếp trên preview"
              })]
            }), (0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)(ep.Switch, {
                checked: o.enabled,
                onCheckedChange: e => void c((0, tY.normalizedSourceRemoval)({
                  ...o,
                  enabled: e
                }))
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon",
                variant: "ghost",
                "aria-label": "Xóa vùng xóa",
                title: "Xóa vùng xóa",
                onClick: () => {
                  c && (c((0, tY.normalizedSourceRemoval)({
                    ...o,
                    enabled: !1
                  })), u(e[0]?.id ?? null))
                },
                children: (0, t.jsx)(x.Trash2, {
                  className: "h-4 w-4"
                })
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-1",
            children: [(0, t.jsxs)("div", {
              className: "flex justify-between text-[10px] text-muted-foreground",
              children: [(0, t.jsx)("span", {
                children: "Viền"
              }), (0, t.jsxs)("span", {
                children: [o.delogoBand, "px"]
              })]
            }), (0, t.jsx)(td, {
              min: 1,
              max: 24,
              step: 1,
              value: [o.delogoBand],
              onValueCommit: ([e]) => void c((0, tY.normalizedSourceRemoval)({
                ...o,
                delogoBand: e ?? 6
              }))
            })]
          })]
        }) : m ? (0, t.jsxs)("div", {
          className: "space-y-3 rounded-lg border border-border bg-background/65 p-3 shadow-sm",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between gap-3",
            children: [(0, t.jsxs)("div", {
              className: "min-w-0",
              children: [(0, t.jsxs)("span", {
                className: "block truncate text-xs font-medium",
                children: ["Đang chọn: ", rv(m)]
              }), (0, t.jsx)("span", {
                className: "text-[10px] text-muted-foreground",
                children: (0, tY.isSourceRemovalExportLayer)(m) ? "Kéo khung trực tiếp trên preview" : m.enabled ? "Play video để áp dụng" : "Đang ẩn khỏi preview"
              })]
            }), (0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)(ep.Switch, {
                checked: m.enabled,
                onCheckedChange: e => b(m.id, {
                  enabled: e
                })
              }), (0, t.jsx)(y.Button, {
                type: "button",
                size: "icon",
                variant: "ghost",
                onClick: () => {
                  var t;
                  let r;
                  return t = m.id, void(d(r = e.filter(e => e.id !== t)), i === t && u(r[0]?.id ?? null))
                },
                children: (0, t.jsx)(x.Trash2, {
                  className: "h-4 w-4"
                })
              })]
            })]
          }), "text" === m.type ? (0, t.jsxs)("label", {
            className: "block space-y-1.5",
            children: [(0, t.jsx)("span", {
              className: "text-[10px] font-medium text-muted-foreground",
              children: "Nội dung chữ"
            }), (0, t.jsx)(t6, {
              value: m.text,
              onChange: e => b(m.id, {
                text: e
              })
            }, m.id)]
          }) : null, ("cover" !== m.type || rx(m) || (0, tY.isSourceRemovalExportLayer)(m)) && "text" !== m.type ? null : (0, t.jsxs)("label", {
            className: "block space-y-1.5",
            children: [(0, t.jsx)("span", {
              className: "text-[10px] font-medium text-muted-foreground",
              children: "Màu"
            }), (0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)(k.Input, {
                type: "color",
                value: (p = m.color, /^#[0-9a-f]{6}$/i.test(p)) ? m.color : "#000000",
                className: "h-9 w-12 shrink-0 p-1",
                onChange: e => b(m.id, {
                  color: e.target.value
                })
              }), (0, t.jsx)(k.Input, {
                value: m.color,
                className: "font-mono text-xs uppercase",
                onChange: e => b(m.id, {
                  color: e.target.value
                })
              })]
            })]
          }), rx(m) || (0, tY.isSourceRemovalExportLayer)(m) ? null : (0, t.jsxs)("div", {
            className: "space-y-1",
            children: [(0, t.jsxs)("div", {
              className: "flex justify-between text-[10px] text-muted-foreground",
              children: [(0, t.jsx)("span", {
                children: "Độ rõ"
              }), (0, t.jsxs)("span", {
                children: [Math.round(100 * m.opacity), "%"]
              })]
            }), (0, t.jsx)(td, {
              value: [m.opacity],
              min: .05,
              max: 1,
              step: .05,
              onValueChange: ([e]) => b(m.id, {
                opacity: e
              })
            })]
          }), "text" === m.type ? (0, t.jsxs)("label", {
            className: "block space-y-1.5",
            children: [(0, t.jsx)("span", {
              className: "text-[10px] font-medium text-muted-foreground",
              children: "Cỡ chữ"
            }), (0, t.jsx)(rw, {
              fontSize: m.fontSize,
              onCommit: e => b(m.id, {
                fontSize: e
              })
            }, `${m.id}:${m.fontSize}`)]
          }) : null]
        }) : (0, t.jsx)("div", {
          className: "rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground",
          children: "Thêm hoặc chọn một layer để chỉnh vị trí và độ mờ."
        })]
      })]
    })
  }

  function rk({
    layers: e,
    selectedLayerId: i,
    layerTypes: a,
    layerFilter: n,
    renderSize: s,
    mirrorPreview: o,
    projectAssetRoot: l,
    onLayersChange: c,
    onVisualGestureCommit: d,
    onVisualDraftChange: u,
    onSelectedLayerIdChange: h,
    onInteractionChange: p,
    onCenterGuideChange: m
  }) {
    let g = (0, r.useRef)(null),
      [x, f] = (0, r.useState)(null),
      v = (0, r.useRef)(null),
      b = (0, r.useRef)(null),
      y = (0, r.useRef)(() => {}),
      [w, j] = (0, r.useState)({
        width: 0,
        height: 0
      }),
      k = (0, r.useMemo)(() => x ? rm(e, x.promotedLayer.id, () => x.draftLayer) : e, [x, e]),
      S = (0, r.useMemo)(() => (0, re.sortExportLayersForRender)(k.filter(e => e.enabled).filter(e => !(0, tY.isSourceRemovalExportLayer)(e)).filter(e => !a || a.includes(e.type)).filter(e => !n || n(e))), [n, a, k]),
      N = s ?? w,
      C = (0, re.getPreviewDisplayScale)(w, N);
    (0, r.useEffect)(() => () => {
      u?.(null), p?.(!1), m?.(!1)
    }, [m, p, u]), (0, r.useEffect)(() => {
      if (!x) return;
      let e = e => {
        "Escape" === e.key && (y.current(!1), rd(x, "escape"), f(null), u?.(null), p?.(!1), m?.(!1))
      };
      return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e)
    }, [x, m, p, u]), (0, r.useEffect)(() => {
      let e = g.current;
      if (!e) return;
      let t = () => {
        let t = e.getBoundingClientRect();
        j({
          width: t.width,
          height: t.height
        })
      };
      t();
      let r = new ResizeObserver(t);
      return r.observe(e), () => r.disconnect()
    }, []);
    let M = (e, t, r) => {
        if (0 !== e.button || v.current) return;
        e.preventDefault(), e.stopPropagation(), h(t.id);
        let i = g.current?.getBoundingClientRect();
        if (!i?.width || !i.height) return;
        e.currentTarget.setPointerCapture(e.pointerId), v.current = {
          id: e.pointerId,
          target: e.currentTarget
        }, p?.(!0);
        let a = function(e) {
          if (!e.gestureId || e.surface.width <= 0 || e.surface.height <= 0) throw Error("visual gesture input is invalid");
          return {
            gestureId: e.gestureId,
            mode: e.mode,
            origin: {
              ...e.pointer
            },
            surface: {
              ...e.surface
            },
            promotedLayer: e.layer,
            draftLayer: e.layer
          }
        }({
          gestureId: `visual-gesture-${rp()}`,
          layer: t,
          mode: r,
          pointer: {
            x: e.clientX,
            y: e.clientY
          },
          surface: {
            width: i.width,
            height: i.height
          }
        });
        b.current = a, f(a), u?.({
          gestureId: a.gestureId,
          cancel: () => {
            b.current?.gestureId === a.gestureId && y.current(!1), f(e => e?.gestureId === a.gestureId ? null : e), p?.(!1), m?.(!1)
          }
        })
      },
      _ = t => {
        let r, i, a, n = b.current;
        if (!n) return;
        b.current = null;
        let s = v.current;
        if (v.current = null, s?.target.hasPointerCapture(s.id) && s.target.releasePointerCapture(s.id), p?.(!1), m?.(!1), !t) {
          rd(n, "pointercancel"), f(null), p?.(!1), u?.(null);
          return
        }
        let o = (r = {}, i = n.promotedLayer, (a = n.draftLayer).xPercent !== i.xPercent && (r.xPercent = a.xPercent), a.yPercent !== i.yPercent && (r.yPercent = a.yPercent), a.widthPercent !== i.widthPercent && (r.widthPercent = a.widthPercent), a.heightPercent !== i.heightPercent && (r.heightPercent = a.heightPercent), a.opacity !== i.opacity && (r.opacity = a.opacity), a.enabled !== i.enabled && (r.enabled = a.enabled), a.zIndex !== i.zIndex && (r.zIndex = a.zIndex), 0 === Object.keys(r).length ? null : {
          kind: "update_export_layer",
          layerId: i.id,
          changes: r
        });
        if (!o) {
          f(null), p?.(!1), u?.(null);
          return
        }
        let l = rm(e, n.promotedLayer.id, () => n.draftLayer);
        u?.(null), Promise.resolve(d ? d({
          gestureId: n.gestureId,
          patch: o,
          layers: l
        }) : c(l)).catch(() => void 0).finally(() => {
          f(e => e?.gestureId === n.gestureId ? null : e), v.current || p?.(!1)
        })
      };
    return (0, r.useEffect)(() => {
      y.current = _
    }), (0, r.useEffect)(() => {
      let e = e => {
          v.current?.id === e.pointerId && y.current(!0)
        },
        t = () => y.current(!1),
        r = () => {
          document.hidden && t()
        };
      return window.addEventListener("pointerup", e), window.addEventListener("blur", t), document.addEventListener("visibilitychange", r), () => {
        window.removeEventListener("pointerup", e), window.removeEventListener("blur", t), document.removeEventListener("visibilitychange", r)
      }
    }, []), (0, t.jsx)("div", {
      ref: g,
      "data-export-layer-surface": !0,
      className: "absolute inset-0 pointer-events-none",
      onPointerMove: e => {
        var t;
        let r, i, a, n, s = b.current;
        if (!s || v.current?.id !== e.pointerId) return;
        if ("mouse" === e.pointerType && (1 & e.buttons) == 0) return void y.current(!0);
        let o = (r = ((t = {
          x: e.clientX,
          y: e.clientY
        }).x - s.origin.x) * 100 / s.surface.width, i = (t.y - s.origin.y) * 100 / s.surface.height, a = s.promotedLayer, n = "resize" === s.mode ? {
          ...a,
          widthPercent: rc(rl(a.widthPercent + r, 5, 100 - a.xPercent)),
          heightPercent: rc(rl(a.heightPercent + i, 5, 100 - a.yPercent))
        } : {
          ...a,
          xPercent: rc(rl(a.xPercent + r, 0, 100 - a.widthPercent)),
          yPercent: rc(rl(a.yPercent + i, 0, 100 - a.heightPercent))
        }, {
          ...s,
          draftLayer: n
        });
        if ("resize" === s.mode) {
          b.current = o, f(o), m?.(!1);
          return
        }
        let l = rt({
            centerXPercent: o.draftLayer.xPercent + o.draftLayer.widthPercent / 2
          }),
          c = l.snapped ? {
            ...o,
            draftLayer: {
              ...o.draftLayer,
              xPercent: rh(l.xPercent - o.draftLayer.widthPercent / 2, 0, 100 - o.draftLayer.widthPercent)
            }
          } : o;
        b.current = c, f(c), m?.(l.snapped)
      },
      onPointerUp: () => _(!0),
      onPointerCancel: () => _(!1),
      onLostPointerCapture: () => _(!1),
      children: S.map(e => {
        let r, a = rf(e);
        return (0, t.jsxs)("div", {
          className: `pointer-events-auto absolute cursor-move border ${i===e.id?"border-primary":"border-white/50"}`,
          style: {
            left: a ? "0%" : `${e.xPercent}%`,
            top: a ? "0%" : `${e.yPercent}%`,
            width: a ? "100%" : `${e.widthPercent}%`,
            height: a ? "100%" : `${e.heightPercent}%`,
            zIndex: (0, re.getExportLayerRenderZIndex)(e)
          },
          onPointerDown: t => M(t, e, "move"),
          children: ["cover" === e.type ? rx(e) ? (0, t.jsx)(rb, {
            layer: e,
            mirrorPreview: o
          }) : rg(e) ? (0, t.jsx)("div", {
            className: "h-full w-full",
            style: (r = (0, re.getExportGlassBlurPixels)(), {
              backgroundColor: ((e, t) => {
                let r = e.replace("#", "");
                if (!/^[0-9a-f]{6}$/i.test(r)) return `rgba(255, 255, 255, ${t})`;
                let i = Number.parseInt(r, 16);
                return `rgba(${i>>16&255}, ${i>>8&255}, ${255&i}, ${t})`
              })(e.color, e.opacity),
              backdropFilter: `blur(${r}px)`,
              WebkitBackdropFilter: `blur(${r}px)`,
              borderColor: "rgba(255, 255, 255, 0.35)",
              boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.18)"
            })
          }) : (0, t.jsx)("div", {
            className: "h-full w-full",
            style: {
              backgroundColor: e.color,
              opacity: e.opacity
            }
          }) : "text" === e.type ? (0, t.jsx)("div", {
            "data-export-moving-watermark-preview": !!a || void 0,
            className: a ? "export-moving-watermark-preview flex items-center justify-center overflow-hidden text-center font-semibold leading-none" : "flex h-full w-full items-center justify-center overflow-hidden text-center font-semibold leading-none",
            style: {
              ...a ? {
                width: `${e.widthPercent}%`,
                height: `${e.heightPercent}%`,
                "--export-watermark-cycle-ms": `${ro.customerPreviewCycleMs}ms`
              } : {},
              ...(0, re.getExportLayerTextPreviewStyle)(e, N.width, C)
            },
            children: e.text
          }) : (0, t.jsx)(ru, {
            layer: e,
            projectAssetRoot: l
          }), rf(e) ? null : (0, t.jsx)("button", {
            type: "button",
            "aria-label": "Resize layer",
            className: "absolute bottom-0 right-0 h-3 w-3 cursor-se-resize bg-primary",
            onPointerDown: t => M(t, e, "resize")
          })]
        }, e.id)
      })
    })
  }
  var rS = e.i(54037);

  function rN(e, t, r) {
    return Math.min(r, Math.max(t, e))
  }

  function rC(e, t) {
    return Number.isFinite(e) && e && Number.isFinite(t) && !(t <= 0) ? rN(e / 2 / t * 100, 2, 49) : 2
  }
  var rM = e.i(40131),
    r_ = e.i(79569),
    rP = e.i(99240);

  function rT(e, t) {
    return t ? Promise.resolve(t.call(e)) : Promise.resolve()
  }

  function rE(e, t = document) {
    return !!(e && function(e = document) {
      return e.fullscreenElement ?? e.webkitFullscreenElement ?? e.msFullscreenElement ?? null
    }(t) === e)
  }
  async function rR(e, t = document) {
    if (e) {
      if (rE(e, t)) return void await
      function(e = document) {
        return rT(e, e.exitFullscreen ?? e.webkitExitFullscreen ?? e.msExitFullscreen)
      }(t);
      await rT(e, e.requestFullscreen ?? e.webkitRequestFullscreen ?? e.msRequestFullscreen)
    }
  }
  var rI = e.i(15132);
  let rV = (0, h.default)("maximize", [
      ["path", {
        d: "M8 3H5a2 2 0 0 0-2 2v3",
        key: "1dcmit"
      }],
      ["path", {
        d: "M21 8V5a2 2 0 0 0-2-2h-3",
        key: "1e4gt3"
      }],
      ["path", {
        d: "M3 16v3a2 2 0 0 0 2 2h3",
        key: "wsl5sc"
      }],
      ["path", {
        d: "M16 21h3a2 2 0 0 0 2-2v-3",
        key: "18trek"
      }]
    ]),
    rA = (0, h.default)("minimize", [
      ["path", {
        d: "M8 3v3a2 2 0 0 1-2 2H3",
        key: "hohbtr"
      }],
      ["path", {
        d: "M21 8h-3a2 2 0 0 1-2-2V3",
        key: "5jw1f3"
      }],
      ["path", {
        d: "M3 16h3a2 2 0 0 1 2 2v3",
        key: "198tvr"
      }],
      ["path", {
        d: "M16 21v-3a2 2 0 0 1 2-2h3",
        key: "ph8mxp"
      }]
    ]),
    rF = (0, h.default)("skip-back", [
      ["path", {
        d: "M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z",
        key: "15892j"
      }],
      ["path", {
        d: "M3 20V4",
        key: "1ptbpl"
      }]
    ]),
    rD = (0, h.default)("skip-forward", [
      ["path", {
        d: "M21 4v16",
        key: "7j8fe9"
      }],
      ["path", {
        d: "M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z",
        key: "zs4d6"
      }]
    ]);
  var rL = e.i(26150);
  let rz = ["0.5", "0.75", "1", "1.25", "1.5", "2"],
    rB = (0, R.cn)("inline-flex items-center justify-center rounded-full bg-transparent text-white/85 shadow-none", "transition-colors duration-150 hover:bg-white/10 hover:text-white", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40", "disabled:pointer-events-none disabled:opacity-40"),
    rO = (0, R.cn)(rB, "h-8 w-8"),
    r$ = (0, R.cn)(rB, "h-9 w-9");

  function rH({
    isFullscreen: e,
    shouldShowPlayerControls: r,
    currentTime: i,
    duration: a,
    isPlaying: n,
    isMuted: s,
    volume: o,
    playbackRate: l,
    hasPlaybackIssue: c,
    hasVideoSource: d,
    onSeek: u,
    onTogglePlay: h,
    onToggleMute: p,
    onVolumeChange: m,
    onPlaybackRateChange: x,
    onFullscreenToggle: v
  }) {
    return (0, t.jsxs)("div", {
      "data-video-player-controls": !0,
      "data-video-player-controls-mode": e ? "overlay" : "external",
      className: (0, R.cn)("left-0 right-0 transition-opacity duration-300 z-30", e ? "absolute bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-12 pb-3" : "relative shrink-0 border-t border-white/10 bg-zinc-950 px-3 py-2", r ? "opacity-100" : "opacity-0 pointer-events-none"),
      children: [(0, t.jsx)("div", {
        className: "mb-3",
        children: (0, t.jsx)(td, {
          value: [i],
          min: 0,
          max: a,
          step: .1,
          onValueChange: u,
          className: "cursor-pointer",
          disabled: c
        })
      }), (0, t.jsxs)("div", {
        className: "flex items-center justify-between",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-1",
          children: [(0, t.jsxs)(t9.TooltipProvider, {
            delayDuration: 0,
            children: [(0, t.jsxs)(t9.Tooltip, {
              children: [(0, t.jsx)(t9.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsx)("button", {
                  type: "button",
                  className: rO,
                  onClick: () => u([Math.max(0, i - 10)]),
                  disabled: c,
                  children: (0, t.jsx)(rF, {
                    className: "w-4 h-4"
                  })
                })
              }), (0, t.jsx)(t9.TooltipContent, {
                children: "Lùi 10s"
              })]
            }), (0, t.jsxs)(t9.Tooltip, {
              children: [(0, t.jsx)(t9.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsx)("button", {
                  type: "button",
                  className: r$,
                  onClick: h,
                  children: n ? (0, t.jsx)(eP.Pause, {
                    className: "w-5 h-5"
                  }) : (0, t.jsx)(eT.Play, {
                    className: "w-5 h-5 ml-0.5"
                  })
                })
              }), (0, t.jsx)(t9.TooltipContent, {
                children: n ? "Tạm dừng" : "Phát"
              })]
            }), (0, t.jsxs)(t9.Tooltip, {
              children: [(0, t.jsx)(t9.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsx)("button", {
                  type: "button",
                  className: rO,
                  onClick: () => u([Math.min(a, i + 10)]),
                  disabled: c,
                  children: (0, t.jsx)(rD, {
                    className: "w-4 h-4"
                  })
                })
              }), (0, t.jsx)(t9.TooltipContent, {
                children: "Tiến 10s"
              })]
            })]
          }), (0, t.jsxs)("span", {
            className: "text-xs text-white/70 ml-2 font-mono tabular-nums",
            children: [(0, R.formatTime)(1e3 * i), " / ", (0, R.formatTime)(1e3 * a)]
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center gap-1",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center gap-2 group/vol",
            children: [(0, t.jsx)("button", {
              type: "button",
              className: rO,
              onClick: p,
              disabled: c,
              children: s || 0 === o ? (0, t.jsx)(rL.VolumeX, {
                className: "w-4 h-4"
              }) : (0, t.jsx)(f.Volume2, {
                className: "w-4 h-4"
              })
            }), (0, t.jsx)("div", {
              className: "w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200",
              children: (0, t.jsx)(td, {
                value: [s ? 0 : o],
                min: 0,
                max: 1,
                step: .05,
                onValueChange: m,
                className: "w-20",
                disabled: c
              })
            })]
          }), (0, t.jsxs)(N.Select, {
            value: String(l),
            onValueChange: x,
            disabled: c,
            children: [(0, t.jsxs)(N.SelectTrigger, {
              className: "h-7 w-16 text-xs border-0 bg-white/10 text-white",
              children: [(0, t.jsx)(ej.Gauge, {
                className: "w-3 h-3 mr-1"
              }), (0, t.jsx)(N.SelectValue, {})]
            }), (0, t.jsx)(N.SelectContent, {
              children: rz.map(e => (0, t.jsxs)(N.SelectItem, {
                value: e,
                children: [e, "x"]
              }, e))
            })]
          }), (0, t.jsx)("button", {
            type: "button",
            className: rO,
            "aria-label": "Phụ đề",
            children: (0, t.jsx)(g, {
              className: "w-4 h-4"
            })
          }), (0, t.jsx)(t9.TooltipProvider, {
            delayDuration: 0,
            children: (0, t.jsxs)(t9.Tooltip, {
              children: [(0, t.jsx)(t9.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsx)("button", {
                  type: "button",
                  className: rO,
                  onClick: v,
                  disabled: !d || c,
                  "aria-label": e ? "Thoát toàn màn hình" : "Toàn màn hình",
                  children: e ? (0, t.jsx)(rA, {
                    className: "w-4 h-4"
                  }) : (0, t.jsx)(rV, {
                    className: "w-4 h-4"
                  })
                })
              }), (0, t.jsx)(t9.TooltipContent, {
                children: e ? "Thoát toàn màn hình" : "Toàn màn hình"
              })]
            })
          })]
        })]
      })]
    })
  }
  let rq = "DichVideo đã dừng tạo preview tương thích vì video dài hơn 1 giờ; mã hóa lại toàn bộ sẽ tốn quá nhiều thời gian và tài nguyên. Xử lý và xuất video vẫn hoạt động bình thường.",
    rK = "DichVideo không thể xác định thời lượng để tạo preview tương thích an toàn. Xử lý và xuất video vẫn hoạt động bình thường.",
    rX = "Không tìm thấy video nguồn",
    rG = "File video nguồn không còn ở vị trí đã nhập. Hãy khôi phục file về đúng vị trí cũ hoặc nhập lại video để tiếp tục. Project và dữ liệu chỉnh sửa vẫn được giữ nguyên.";
  var rW = e.i(2684);
  let rU = ["trajectory-1", "trajectory-2", "trajectory-3", "trajectory-4"];

  function rY({
    videoRef: e,
    videoViewport: i,
    watermark: a
  }) {
    var n;
    let s = (0, r.useRef)(null),
      [o, l] = (0, r.useState)(null),
      c = `${i.width}:${i.height}:${a.text}`;
    if ((0, r.useEffect)(() => {
        let t = e.current;
        if (!t || "u" < typeof document) return;
        let r = document;
        t.disablePictureInPicture = !0;
        let i = () => {
          r.pictureInPictureElement === t && r.exitPictureInPicture && r.exitPictureInPicture().catch(() => void 0)
        };
        return t.addEventListener("enterpictureinpicture", i), i(), () => {
          t.removeEventListener("enterpictureinpicture", i), t.disablePictureInPicture = !1
        }
      }, [e]), (0, r.useEffect)(() => {
        let e = s.current;
        if (!e || i.width <= 0 || i.height <= 0) return;
        let t = () => {
          let t = e.scrollWidth,
            r = e.scrollHeight;
          if (t <= 0 || r <= 0) return;
          let a = {
            ... function({
              viewportWidth: e,
              viewportHeight: t,
              intrinsicWidth: r,
              intrinsicHeight: i
            }) {
              if ([e, t, r, i].some(e => !Number.isFinite(e) || e <= 0)) throw Error("Preview protection fit requires positive finite dimensions");
              let a = e - 16,
                n = t - 16;
              if (a <= 0 || n <= 0) throw Error("Preview protection viewport is too small for the edge inset");
              let s = Math.min(1, a / r, n / i);
              return {
                scale: s,
                safeHalfWidth: r * s / 2 + 8,
                safeHalfHeight: i * s / 2 + 8
              }
            }({
              viewportWidth: i.width,
              viewportHeight: i.height,
              intrinsicWidth: t,
              intrinsicHeight: r
            }),
            measurementKey: c
          };
          l(e => e?.measurementKey === a.measurementKey && e.scale === a.scale && e.safeHalfWidth === a.safeHalfWidth && e.safeHalfHeight === a.safeHalfHeight ? e : a)
        };
        if (t(), "u" < typeof ResizeObserver) return;
        let r = new ResizeObserver(t);
        return r.observe(e), () => r.disconnect()
      }, [c, i.height, i.width]), i.width <= 0 || i.height <= 0) return null;
    let d = o?.measurementKey === c ? o : null,
      u = {
        visibility: d ? "visible" : "hidden",
        "--preview-protection-cycle-ms": `${(n=function(e){switch(e){case"trajectory-1":return 1;case"trajectory-2":return 2;case"trajectory-3":return 3;case"trajectory-4":return 4}}(a.trajectory),ro.protectionPreviewCycleMs[n-1])}ms`,
        "--preview-protection-safe-half-width": `${d?.safeHalfWidth??8}px`,
        "--preview-protection-safe-half-height": `${d?.safeHalfHeight??8}px`,
        "--preview-protection-scale": d?.scale ?? 1
      };
    return (0, t.jsx)("div", {
      "data-preview-protection-watermark": !0,
      "aria-hidden": "true",
      className: "pointer-events-none absolute z-[45] overflow-hidden select-none",
      style: {
        left: `${i.offsetX}px`,
        top: `${i.offsetY}px`,
        width: `${i.width}px`,
        height: `${i.height}px`
      },
      children: (0, t.jsx)("span", {
        ref: s,
        className: `preview-protection-watermark__text ${a.trajectory}`,
        style: u,
        children: a.text
      })
    })
  }

  function rJ(e, t, r) {
    return Math.min(r, Math.max(t, e))
  }

  function rZ(e, t, r) {
    let i = Number(t),
      a = Number(e);
    if (!Number.isFinite(a) || !Number.isFinite(i) || i <= 0) throw Error(`${r} cannot be represented for Preview`);
    return a / i
  }

  function rQ(e, t) {
    let r = Number(t),
      i = rZ(e.outputFrameRate.numerator, e.outputFrameRate.denominator, "outputFrameRate");
    if (!Number.isFinite(r) || r < 0 || i <= 0) throw Error("output frame boundary cannot be represented for Preview");
    return 1e3 * r / i
  }

  function r0(e, t, r) {
    if ("virtual" === e.sourceTimebase.kind) return 1e3 * Number(r ? t.sourceEndFrame : t.sourceStartFrame) / rZ(e.sourceTimebase.frameRate.numerator, e.sourceTimebase.frameRate.denominator, "sourceTimebase.frameRate");
    let i = Number(r ? t.sourceEndPts : t.sourceStartPts),
      a = Number(e.sourceTimebase.pts.mediaTimelineOriginPts),
      n = Number(e.sourceTimebase.pts.timeBaseNumerator),
      s = Number(e.sourceTimebase.pts.timeBaseDenominator);
    if (![i, a, n, s].every(Number.isFinite) || s <= 0) throw Error("source PTS boundary cannot be represented for Preview");
    return (i - a) * n * 1e3 / s
  }

  function r1(e) {
    let t = e.spans.map(t => {
      let r = r0(e, t, !1),
        i = r0(e, t, !0),
        a = rQ(e, t.outputStartFrame),
        n = rQ(e, t.outputEndFrame),
        s = rZ(t.videoPlaybackRate.numerator, t.videoPlaybackRate.denominator, `span ${t.spanId} playback rate`);
      if (i < r || n < a || s <= 0) throw Error(`span ${t.spanId} cannot be indexed for Preview`);
      return {
        span: t,
        sourceStartMs: r,
        sourceEndMs: i,
        outputStartMs: a,
        outputEndMs: n,
        graphPlaybackRate: s
      }
    });
    return {
      graph: e,
      spans: t,
      sourceStarts: t.map(e => e.sourceStartMs),
      outputStarts: t.map(e => e.outputStartMs),
      outputDurationMs: rQ(e, e.outputFrames)
    }
  }

  function r2(e, t) {
    let r = 0,
      i = e.length;
    for (; r < i;) {
      let a = r + Math.floor((i - r) / 2);
      e[a] <= t ? r = a + 1 : i = a
    }
    return Math.max(0, r - 1)
  }

  function r5(e, t) {
    let r = rJ(t, 0, e.outputDurationMs);
    if (0 === e.spans.length) return {
      sourceTimeMs: 0,
      outputTimeMs: r,
      graphPlaybackRate: 1
    };
    let i = e.spans[r2(e.outputStarts, r)],
      a = Math.max(Number.EPSILON, i.outputEndMs - i.outputStartMs),
      n = rJ((r - i.outputStartMs) / a, 0, 1);
    return {
      sourceTimeMs: i.sourceStartMs + n * (i.sourceEndMs - i.sourceStartMs),
      outputTimeMs: r,
      graphPlaybackRate: i.graphPlaybackRate
    }
  }

  function r3(e, t, r, i = "ready", a = !1) {
    return Object.freeze({
      status: i,
      generationId: r.generationId,
      graphHash: r.graphHash,
      sourceTimeMs: e.sourceTimeMs,
      outputTimeMs: e.outputTimeMs,
      playing: e.playing,
      seeking: a,
      buffering: !1,
      playbackRate: e.playbackRate,
      graphPlaybackRate: e.graphPlaybackRate,
      activeCaptionId: function(e, t) {
        let r = t * Number(e.outputFrameRate.numerator) / (1e3 * Number(e.outputFrameRate.denominator)),
          i = 0,
          a = e.captions.length;
        for (; i < a;) {
          let t = i + Math.floor((a - i) / 2);
          Number(e.captions[t].outputStartFrame) <= r ? i = t + 1 : a = t
        }
        let n = e.captions[Math.max(0, i - 1)];
        return n && r >= Number(n.outputStartFrame) && r < Number(n.outputEndFrame) ? n.captionId : null
      }(r, e.outputTimeMs),
      epochs: Object.freeze({
        ...t
      })
    })
  }
  let r4 = Object.freeze({
    status: "disposed",
    generationId: "",
    graphHash: "",
    sourceTimeMs: 0,
    outputTimeMs: 0,
    playing: !1,
    seeking: !1,
    buffering: !1,
    playbackRate: 1,
    graphPlaybackRate: 1,
    activeCaptionId: null,
    epochs: Object.freeze({
      transport: 0,
      audio: 0,
      visual: 0
    })
  });

  function r8(e) {
    return Object.assign(Error(e), {
      code: "project_tts_raw_integrity_invalid"
    })
  }

  function r7(e, t) {
    if (!Number.isFinite(e) || e <= 0) throw Error(t);
    return e
  }

  function r6(e, t) {
    let r = Number(t) * Number(e.outputFrameRate.denominator) * 1e3 / Number(e.outputFrameRate.numerator);
    if (!Number.isFinite(r) || r < 0) throw Error("project_tts_graph_frame_invalid");
    return r
  }
  async function r9(e) {
    let t = new Uint8Array(await crypto.subtle.digest("SHA-256", e.slice(0)));
    return `sha256:${Array.from(t,e=>e.toString(16).padStart(2,"0")).join("")}`
  }
  class ie {
    dependencies;
    graph;
    cues;
    authorityKey;
    transportEpoch;
    revision;
    latestTransportRate;
    volume;
    muted;
    disposed;
    loaded;
    pending;
    constructor(e) {
      this.dependencies = e, this.graph = null, this.cues = [], this.authorityKey = null, this.transportEpoch = 0, this.revision = 0, this.latestTransportRate = null, this.volume = 1, this.muted = !1, this.disposed = !1, this.loaded = new Map, this.pending = new Map
    }
    setVolume(e, t) {
      if (this.volume = Math.min(10, Math.max(0, e)), this.muted = t, t) return void this.bumpRevisionAndClear();
      for (let e of this.loaded.values()) e.media.volume = this.volume, e.media.muted = !1
    }
    async unlock() {}
    installGraph(e, t) {
      if (this.disposed) return;
      let r = `${e.audioScheduleHash}\u0000${t}`,
        i = [...e.voiceCues].sort((e, t) => e.canonicalOrdinal - t.canonicalOrdinal || e.voiceCueId.localeCompare(t.voiceCueId)).map(t => {
          let {
            artifact: r,
            playbackRate: i
          } = function(e, t) {
            if ("project-edit-graph-v1" === e.schemaVersion) {
              var r;
              return {
                artifact: t.rawArtifact,
                playbackRate: r7(Number((r = t.effectiveVoiceRate).numerator) / Number(r.denominator), "project_tts_voice_rate_invalid")
              }
            }
            if (!t.selectedArtifact) throw Error("project_tts_selected_artifact_missing");
            return {
              artifact: t.selectedArtifact,
              playbackRate: 1
            }
          }(e, t), a = "project-edit-graph-v1" === e.schemaVersion ? Number(t.rawSampleCount) / r7(r.sampleRateHz ?? 0, "project_tts_raw_sample_rate_invalid") : Number(t.playbackSampleCount) / e.outputSampleRateHz, n = r6(e, t.outputStartFrame), s = r6(e, t.outputEndFrame);
          if (!r.resolvedPath || s <= n) throw Error("project_tts_segment_authority_invalid");
          return {
            voiceCueId: t.voiceCueId,
            canonicalOrdinal: t.canonicalOrdinal,
            artifact: r,
            artifactPath: r.resolvedPath,
            playbackRate: i,
            rawDurationSeconds: r7(a, "project_tts_artifact_duration_invalid"),
            outputStartMs: n,
            outputEndMs: s
          }
        });
      null != this.authorityKey && this.authorityKey !== r && this.bumpRevisionAndClear(), this.graph = e, this.cues = i, this.authorityKey = r
    }
    async sync(e) {
      if (this.disposed || !this.graph || !this.authorityKey || e.epoch < this.transportEpoch) return;
      if (e.epoch > this.transportEpoch && (this.transportEpoch = e.epoch, this.bumpRevisionAndClear()), null != this.latestTransportRate && this.latestTransportRate !== e.playbackRate && this.bumpRevisionAndClear(), this.latestTransportRate = e.playbackRate, !e.playing || this.muted) return void this.bumpRevisionAndClear();
      let t = this.revision,
        r = this.authorityKey,
        i = this.desiredCues(e.outputTimeMs),
        a = new Set(i.map(e => e.voiceCueId));
      for (let [e, t] of this.loaded) a.has(e) || this.releaseEntry(t);
      try {
        if (await Promise.all(i.map(e => this.ensureLoaded(e, t))), t !== this.revision || r !== this.authorityKey || this.disposed) return;
        for (let r of i) {
          let i = this.loaded.get(r.voiceCueId);
          i && (this.configure(i, e.playbackRate), r.outputStartMs <= e.outputTimeMs && e.outputTimeMs < r.outputEndMs ? await this.startCurrent(i, e, t) : this.scheduleFuture(i, e, t))
        }
      } catch (e) {
        throw this.bumpRevisionAndClear(), e
      }
    }
    fenceTransport(e) {
      e <= this.transportEpoch || (this.transportEpoch = e, this.bumpRevisionAndClear())
    }
    async dispose() {
      this.disposed || (this.disposed = !0, this.authorityKey = null, this.graph = null, this.cues = [], this.bumpRevisionAndClear())
    }
    desiredCues(e) {
      let t = this.cues.filter(t => t.outputStartMs <= e && e < t.outputEndMs),
        r = new Set(t.map(e => e.voiceCueId));
      return [...t, ...this.cues.filter(t => !r.has(t.voiceCueId) && t.outputStartMs >= e).sort((e, t) => e.outputStartMs - t.outputStartMs || e.canonicalOrdinal - t.canonicalOrdinal || e.voiceCueId.localeCompare(t.voiceCueId)).slice(0, 2)]
    }
    ensureLoaded(e, t) {
      let r = this.loaded.get(e.voiceCueId);
      if (r) return Promise.resolve(r);
      let i = this.pending.get(e.voiceCueId);
      if (i?.revision === t) return i.promise;
      let a = this.loadCue(e, t);
      return this.pending.set(e.voiceCueId, {
        revision: t,
        promise: a
      }), a.finally(() => {
        this.pending.get(e.voiceCueId)?.promise === a && this.pending.delete(e.voiceCueId)
      }).catch(() => void 0), a
    }
    async loadCue(e, t) {
      let r = await this.dependencies.fetchArrayBuffer(this.dependencies.resolveMediaSource(e.artifactPath));
      if (t !== this.revision || this.disposed) return null;
      if (BigInt(r.byteLength) !== function(e) {
          if (!/^(0|[1-9][0-9]*)$/.test(e)) throw r8("raw cue byte authority is invalid");
          return BigInt(e)
        }(e.artifact.byteCount)) throw r8("raw cue byte count does not match authority");
      let i = await r9(r);
      if (t !== this.revision || this.disposed) return null;
      if (i !== e.artifact.sha256) throw r8("raw cue SHA-256 does not match authority");
      let a = this.dependencies.createObjectUrl(new Blob([r]), e.voiceCueId);
      if (t !== this.revision || this.disposed) return this.dependencies.revokeObjectUrl(a), null;
      let n = this.dependencies.createMediaElement(e.voiceCueId);
      n.preload = "auto", n.preservesPitch = !0, n.src = a, n.load?.();
      let s = {
        cue: e,
        media: n,
        objectUrl: a,
        startTimer: null,
        endTimer: null,
        starting: !1,
        playing: !1
      };
      return this.loaded.set(e.voiceCueId, s), s
    }
    configure(e, t) {
      e.media.preservesPitch = !0, e.media.playbackRate = e.cue.playbackRate * r7(t, "project_tts_transport_rate_invalid"), e.media.volume = this.volume, e.media.muted = this.muted
    }
    async startCurrent(e, t, r) {
      if (this.clearStartTimer(e), e.starting || e.playing && !e.media.paused) return;
      let i = Math.max(0, t.outputTimeMs - e.cue.outputStartMs) * e.cue.playbackRate / 1e3;
      if (!(i >= e.cue.rawDurationSeconds)) {
        e.media.currentTime = i, e.starting = !0;
        try {
          await e.media.play()
        } finally {
          e.starting = !1
        }
        if (r !== this.revision || this.disposed) return void this.releaseEntry(e);
        e.playing = !0, this.armEndTimer(e, Math.max(0, e.cue.outputEndMs - t.outputTimeMs) / r7(t.playbackRate, "project_tts_transport_rate_invalid"), r)
      }
    }
    scheduleFuture(e, t, r) {
      if (null != e.startTimer || e.playing) return;
      let i = r7(t.playbackRate, "project_tts_transport_rate_invalid"),
        a = Math.max(0, e.cue.outputStartMs - t.outputTimeMs) / i;
      e.startTimer = this.dependencies.setTimer(() => {
        e.startTimer = null, r !== this.revision || this.disposed || this.muted || (e.media.currentTime = 0, e.starting = !0, e.media.play().then(() => {
          r !== this.revision || this.disposed ? this.releaseEntry(e) : (e.playing = !0, this.armEndTimer(e, (e.cue.outputEndMs - e.cue.outputStartMs) / i, r))
        }).catch(t => {
          this.releaseEntry(e), this.dependencies.onError?.(t)
        }).finally(() => {
          e.starting = !1
        }))
      }, a)
    }
    armEndTimer(e, t, r) {
      null != e.endTimer && this.dependencies.clearTimer(e.endTimer), e.endTimer = this.dependencies.setTimer(() => {
        e.endTimer = null, r === this.revision && this.releaseEntry(e)
      }, Math.max(0, t))
    }
    clearStartTimer(e) {
      null != e.startTimer && (this.dependencies.clearTimer(e.startTimer), e.startTimer = null)
    }
    releaseEntry(e) {
      if (this.loaded.get(e.cue.voiceCueId) === e) {
        this.loaded.delete(e.cue.voiceCueId), null != e.startTimer && this.dependencies.clearTimer(e.startTimer), null != e.endTimer && this.dependencies.clearTimer(e.endTimer), e.startTimer = null, e.endTimer = null, e.starting = !1, e.playing = !1;
        try {
          e.media.pause()
        } catch {}
        e.media.src = "", this.dependencies.revokeObjectUrl(e.objectUrl)
      }
    }
    bumpRevisionAndClear() {
      for (let e of (this.revision += 1, this.pending.clear(), [...this.loaded.values()])) this.releaseEntry(e)
    }
  }
  let it = new Set(["project_playback_hash_invalid", "project_playback_artifact_invalid", "project_playback_authority_mismatch", "project_visual_authority_mismatch", "project_visual_generation_mismatch", "project_tts_raw_integrity_invalid"]);

  function ir(e, t) {
    if ("AbortError" === (e && "object" == typeof e && "name" in e && "string" == typeof e.name ? e.name : null) && "play" === t) return "benign_abort";
    let r = e && "object" == typeof e && "code" in e && "string" == typeof e.code ? e.code : null;
    return r && it.has(r) ? "integrity" : "visual_mutation" === t ? "mutation_candidate" : "preview_runtime"
  }

  function ii(e) {
    return e instanceof Error && e.message.trim() ? e.message : "Không phát được bản xem trước."
  }
  let ia = new Set(["hevc", "h265", "hvc1"]);

  function is(e) {
    return "string" != typeof e ? null : e.trim().toLocaleLowerCase("en-US") || null
  }

  function io(e) {
    return e.trim().replaceAll("/", "\\").toLocaleLowerCase("en-US")
  }
  async function il(e) {
    let t = (e.createVideo ?? function() {
        return document.createElement("video")
      })(),
      r = e.timeoutMs ?? 8e3,
      i = 0,
      a = 0,
      n = 0,
      s = null,
      o = null,
      l = !1;
    return new Promise(c => {
      let d = t.requestVideoFrameCallback?.bind(t),
        u = t.cancelVideoFrameCallback?.bind(t),
        h = r => {
          l || (l = !0, null !== o && clearTimeout(o), e.signal?.removeEventListener("abort", m), t.removeEventListener("error", g), t.removeEventListener("abort", g), null !== s && u && (u(s), s = null), t.pause(), t.removeAttribute("src"), t.load(), t.remove(), c(r))
        },
        p = t => {
          h({
            status: "unsupported",
            videoId: e.videoId,
            originalPath: e.originalPath,
            generation: e.generation,
            reason: t
          })
        };

      function m() {
        p("aborted")
      }

      function g() {
        p("load_error")
      }
      let x = (r, o) => {
        if (l) return;
        s = null;
        let c = o.mediaTime,
          u = t.currentTime;
        if (1 === (i += 1)) {
          a = c, n = u, s = d(x);
          return
        }
        let m = c - a,
          g = u - n;
        !Number.isFinite(m) || !Number.isFinite(g) || m <= 1e-6 || g <= 1e-6 ? p("clock_stalled") : t.videoWidth <= 0 || t.videoHeight <= 0 ? p("zero_dimensions") : h({
          status: "supported",
          videoId: e.videoId,
          originalPath: e.originalPath,
          generation: e.generation,
          evidence: {
            callbackCount: i,
            firstMediaTimeSeconds: a,
            lastMediaTimeSeconds: c,
            clockAdvanceMilliseconds: Math.round(1e3 * g),
            width: t.videoWidth,
            height: t.videoHeight
          }
        })
      };
      (t.muted = !0, t.playsInline = !0, t.preload = "auto", t.addEventListener("error", g), t.addEventListener("abort", g), e.signal?.addEventListener("abort", m, {
        once: !0
      }), e.signal?.aborted) ? p("aborted"): d ? (o = setTimeout(() => {
        p(1 === i ? "no_presented_frame" : "timeout")
      }, r), s = d(x), t.src = e.mediaSrc, t.play().catch(() => p("play_rejected"))) : p("rvfc_unavailable")
    })
  }

  function ic(e, t) {
    return !!(e && e.videoId === t.videoId && e.generation === t.generation && io(e.originalPath) === io(t.originalPath))
  }

  function id(e, t) {
    return ic(e, t) ? {
      ...e,
      probing: !1,
      result: t
    } : e
  }
  var iu = e.i(82022),
    ih = e.i(25398);

  function ip({
    onRetry: e
  }) {
    return (0, t.jsx)(t9.TooltipProvider, {
      delayDuration: 250,
      children: (0, t.jsxs)("div", {
        className: "mt-4 flex flex-wrap justify-center gap-2",
        children: [(0, t.jsxs)(t9.Tooltip, {
          children: [(0, t.jsx)(t9.TooltipTrigger, {
            asChild: !0,
            children: (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "secondary",
              "aria-label": "Thử lại",
              onClick: e,
              children: [(0, t.jsx)(ih.RotateCw, {
                "aria-hidden": "true"
              }), "Thử lại"]
            })
          }), (0, t.jsx)(t9.TooltipContent, {
            children: "Kiểm tra lại khả năng phát HEVC trực tiếp"
          })]
        }), (0, t.jsxs)(t9.Tooltip, {
          children: [(0, t.jsx)(t9.TooltipTrigger, {
            asChild: !0,
            children: (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "outline",
              "aria-label": "Mở trang HEVC của Microsoft",
              onClick: () => {
                (0, I.openUrlInSystemBrowser)("https://apps.microsoft.com/detail/9n4wgh0z6vhq").catch(e => {
                  console.error("Could not open Microsoft HEVC page:", e)
                })
              },
              children: [(0, t.jsx)(iu.ExternalLink, {
                "aria-hidden": "true"
              }), "Mở trang HEVC của Microsoft"]
            })
          }), (0, t.jsx)(t9.TooltipContent, {
            children: "Mở trang HEVC chính thức trong trình duyệt"
          })]
        })]
      })
    })
  }
  var im = e.i(8594),
    ig = e.i(88717);

  function ix(e, t, r) {
    return Math.max(1, Math.round(e * t * 1e3 / (1e3 * r)))
  }
  class iv {
    audioContext;
    node = null;
    initializing = null;
    anchor = null;
    volume = 1;
    muted = !1;
    disposed = !1;
    constructor(e) {
      if (!e?.audioContext || !Number.isSafeInteger(e.audioContext.sampleRate) || e.audioContext.sampleRate < 8e3 || e.audioContext.sampleRate > 192e3) throw Error("nle_preview_audio_mixer_options_invalid");
      this.audioContext = e.audioContext
    }
    async installWindow(e) {
      var t;
      if (this.assertActive(), t = this.audioContext.sampleRate, !(e && Number.isSafeInteger(e.revision) && e.revision >= 0 && Number.isSafeInteger(e.transportRateMilli) && e.transportRateMilli >= 1 && Array.isArray(e.clips) && e.clips.length <= 4 && e.clips.every(r => (function(e, t, r) {
          var i;
          if (!e || !("string" == typeof(i = e.cueId) && i.trim().length > 0) || !Number.isFinite(e.placedStartMs) || !Number.isFinite(e.placedEndMs) || e.placedStartMs < 0 || e.placedEndMs <= e.placedStartMs || e.sampleRate !== t || !Number.isSafeInteger(e.frameCount) || e.frameCount < 1 || !Array.isArray(e.channels) || 0 === e.channels.length) return !1;
          let a = ix(t, e.placedEndMs - e.placedStartMs, r);
          return e.frameCount === a && e.channels.every(t => ArrayBuffer.isView(t) && "[object Float32Array]" === Object.prototype.toString.call(t) && t.length === e.frameCount)
        })(r, t, e.transportRateMilli)))) throw Error("nle_preview_audio_mixer_window_invalid");
      (await this.ensureNode()).port.postMessage({
        type: "install_window",
        revision: e.revision,
        clips: e.clips.map(e => ({
          cueId: e.cueId,
          placedStartMs: e.placedStartMs,
          placedEndMs: e.placedEndMs,
          frameCount: e.frameCount,
          channels: e.channels
        }))
      })
    }
    async syncTransport(e) {
      if (this.assertActive(), !e || !Number.isFinite(e.playheadMs) || e.playheadMs < 0 || "boolean" != typeof e.playing || "boolean" != typeof e.discontinuity || "boolean" != typeof e.ownerGesture) throw Error("nle_preview_audio_mixer_transport_invalid");
      e.ownerGesture && e.playing && "running" !== this.audioContext.state && await this.audioContext.resume();
      let t = await this.ensureNode(),
        r = this.audioContext.currentTime,
        i = !this.anchor || e.discontinuity || this.anchor.playing !== e.playing;
      if (!i && e.playing && this.anchor) {
        let t = this.anchor.playheadMs + (r - this.anchor.contextTime) * 1e3;
        i = Math.abs(e.playheadMs - t) > 80
      }
      i && (t.port.postMessage({
        type: "transport",
        playheadMs: e.playheadMs,
        playing: e.playing,
        discontinuity: !0
      }), this.anchor = {
        playheadMs: e.playheadMs,
        contextTime: r,
        playing: e.playing
      })
    }
    async ensureAudioRunning() {
      this.assertActive(), "running" !== this.audioContext.state && await this.audioContext.resume()
    }
    setVolume(e, t) {
      if (this.assertActive(), !Number.isFinite(e) || "boolean" != typeof t) throw Error("nle_preview_audio_mixer_mix_invalid");
      this.volume = Math.max(0, Math.min(1, e)), this.muted = t, this.node?.port.postMessage({
        type: "mix",
        volume: this.volume,
        muted: this.muted
      })
    }
    dispose() {
      !this.disposed && (this.disposed = !0, this.anchor = null, this.node && (this.node.port.postMessage({
        type: "dispose"
      }), this.node.disconnect(), this.node = null))
    }
    assertActive() {
      if (this.disposed) throw Error("nle_preview_audio_mixer_disposed")
    }
    ensureNode() {
      if (this.node) return Promise.resolve(this.node);
      if (this.initializing) return this.initializing;
      let e = async () => {
        let e = null;
        try {
          await this.audioContext.audioWorklet.addModule("/nle-preview-voice-worklet.js"), this.assertActive();
          let t = new AudioWorkletNode(this.audioContext, "dichvideo-nle-preview-voice-v1");
          return e = t, this.assertActive(), t.connect(this.audioContext.destination), t.port.postMessage({
            type: "mix",
            volume: this.volume,
            muted: this.muted
          }), this.node = t, t
        } catch (r) {
          if (e) try {
            e.port.postMessage({
              type: "dispose"
            }), e.disconnect()
          } catch {}
          if (this.disposed || r instanceof Error && "nle_preview_audio_mixer_disposed" === r.message || "object" == typeof r && null !== r && "code" in r && "nle_preview_audio_mixer_disposed" === r.code) throw Object.assign(Error("nle_preview_audio_mixer_disposed"), {
            code: "nle_preview_audio_mixer_disposed"
          });
          let t = r instanceof Error ? r.message : String(r);
          throw Object.assign(Error(`nle_preview_audio_mixer_unavailable: ${t}`, {
            cause: r
          }), {
            code: "nle_preview_audio_mixer_unavailable",
            cause: r
          })
        } finally {
          this.initializing = null
        }
      };
      return this.initializing = e(), this.initializing
    }
  }

  function ib(e) {
    return "string" == typeof e && e.trim().length > 0
  }

  function iy(e, t, r) {
    return Number.isSafeInteger(e) && Number(e) >= t && Number(e) <= r
  }
  async function iw(e) {
    let t = await fetch(e);
    if (!t.ok) throw Error("nle_preview_pcm_fetch_failed");
    return t.arrayBuffer()
  }
  class ij {
    fetchArrayBuffer;
    decodeAudioData;
    maxEntries;
    entries = new Map;
    pending = new Map;
    cueGenerations = new Map;
    keyGenerations = new Map;
    retainedKeys = null;
    disposed = !1;
    constructor(e) {
      const t = e?.maxEntries ?? 3,
        r = e?.decodeAudioData ?? (e?.audioContext ? t => e.audioContext.decodeAudioData(t) : null);
      if (!iy(t, 1, 3) || !r) throw Error("nle_preview_pcm_cache_options_invalid");
      this.maxEntries = t, this.fetchArrayBuffer = e.fetchArrayBuffer ?? iw, this.decodeAudioData = r
    }
    get size() {
      return this.entries.size
    }
    getOrDecode(e) {
      if (this.disposed) return Promise.reject(Error("nle_preview_pcm_cache_disposed"));
      if (!e || !ib(e.cueId) || !ib(e.key) || !ib(e.source)) return Promise.reject(Error("nle_preview_pcm_asset_invalid"));
      if (this.retainedKeys && !this.retainedKeys.has(e.key)) return Promise.resolve(null);
      let t = this.entries.get(e.key);
      if (t) return t.cueId !== e.cueId ? Promise.reject(Error("nle_preview_pcm_asset_invalid")) : (this.entries.delete(e.key), this.entries.set(e.key, t), Promise.resolve(t.pcm));
      let r = this.cueGenerations.get(e.cueId) ?? 0,
        i = this.keyGenerations.get(e.key) ?? 0,
        a = this.pending.get(e.key);
      if (a && a.cueId === e.cueId && a.cueGeneration === r && a.keyGeneration === i) return a.promise;
      if (this.pending.size >= this.maxEntries) return Promise.resolve(null);
      let n = this.decodeAndCache(e, r, i).finally(() => {
        this.pending.get(e.key)?.promise === n && this.pending.delete(e.key)
      });
      return this.pending.set(e.key, {
        cueId: e.cueId,
        cueGeneration: r,
        keyGeneration: i,
        promise: n
      }), n
    }
    retain(e) {
      if (this.disposed) throw Error("nle_preview_pcm_cache_disposed");
      if (!Array.isArray(e) || e.length > this.maxEntries || e.some(e => !ib(e)) || new Set(e).size !== e.length) throw Error("nle_preview_pcm_retain_invalid");
      let t = new Set(e);
      for (let e of (this.retainedKeys = t, this.entries.keys())) t.has(e) || this.entries.delete(e);
      for (let [e] of this.pending) t.has(e) || (this.incrementKeyGeneration(e), this.pending.delete(e))
    }
    invalidateCue(e) {
      if (!this.disposed) {
        if (!ib(e)) throw Error("nle_preview_pcm_cue_invalid");
        for (let [t, r] of(this.cueGenerations.set(e, (this.cueGenerations.get(e) ?? 0) + 1), this.entries)) r.cueId === e && this.entries.delete(t);
        for (let [t, r] of this.pending) r.cueId === e && (this.incrementKeyGeneration(t), this.pending.delete(t))
      }
    }
    dispose() {
      this.disposed || (this.disposed = !0, this.entries.clear(), this.pending.clear(), this.retainedKeys = new Set)
    }
    async decodeAndCache(e, t, r) {
      let i = await this.fetchArrayBuffer(e.source);
      if ("[object ArrayBuffer]" !== Object.prototype.toString.call(i)) throw Error("nle_preview_pcm_fetch_failed");
      if (!this.isCurrent(e, t, r)) return null;
      let a = function(e, t) {
        if (!e || !iy(e.sampleRate, 8e3, 192e3) || !iy(e.length, 1, Number.MAX_SAFE_INTEGER) || !iy(e.numberOfChannels, 1, Number.MAX_SAFE_INTEGER)) throw Error("nle_preview_pcm_decode_invalid");
        let r = [];
        for (let t = 0; t < e.numberOfChannels; t += 1) {
          let i = e.getChannelData(t);
          if (!(ArrayBuffer.isView(i) && "[object Float32Array]" === Object.prototype.toString.call(i)) || i.length !== e.length) throw Error("nle_preview_pcm_decode_invalid");
          let a = new Float32Array(i.length);
          for (let e of (a.set(i), a))
            if (!Number.isFinite(e)) throw Error("nle_preview_pcm_decode_invalid");
          r.push(a)
        }
        let i = t ? 0 : Math.min(e.length, Math.round(.15 * e.sampleRate)),
          a = -1;
        for (let e = 0; e < i; e += 1)
          if (r.some(t => Math.abs(t[e]) >= .003)) {
            a = e;
            break
          } let n = Math.round(.02 * e.sampleRate),
          s = a > n ? a - n : 0,
          o = s > 0 ? r.map(e => e.slice(s)) : r;
        return {
          sampleRate: e.sampleRate,
          frameCount: e.length - s,
          channels: o
        }
      }(await this.decodeAudioData(i.slice(0)), !0 === e.preserveLeadingSilence);
      if (!this.isCurrent(e, t, r)) return null;
      for (this.entries.set(e.key, {
          cueId: e.cueId,
          pcm: a
        }); this.entries.size > this.maxEntries;) {
        let e = this.entries.keys().next().value;
        if ("string" != typeof e) break;
        this.entries.delete(e)
      }
      return a
    }
    isCurrent(e, t, r) {
      return !this.disposed && (this.cueGenerations.get(e.cueId) ?? 0) === t && (this.keyGenerations.get(e.key) ?? 0) === r && (!this.retainedKeys || this.retainedKeys.has(e.key))
    }
    incrementKeyGeneration(e) {
      this.keyGenerations.set(e, (this.keyGenerations.get(e) ?? 0) + 1)
    }
  }
  var ik = e.i(18081);
  let iS = Number.MAX_SAFE_INTEGER;

  function iN(e) {
    return "string" == typeof e && e.trim().length > 0
  }

  function iC(e, t, r) {
    return Number.isSafeInteger(e) && Number(e) >= t && Number(e) <= r
  }

  function iM(e) {
    return ArrayBuffer.isView(e) && "[object Float32Array]" === Object.prototype.toString.call(e)
  }

  function i_(e, t) {
    if (!Array.isArray(e) || 0 === e.length) return !1;
    let r = t ?? (iM(e[0]) ? e[0].length : 0);
    if (!Number.isSafeInteger(r) || r < 1) return !1;
    for (let t of e) {
      if (!iM(t) || t.length !== r) return !1;
      for (let e of t)
        if (!Number.isFinite(e)) return !1
    }
    return !0
  }

  function iP(e) {
    if (!iC(e.documentRevision, 1, Number.MAX_SAFE_INTEGER) || !iN(e.cueId) || !iN(e.relativePath) || !iC(e.byteCount, 1, Number.MAX_SAFE_INTEGER) || !iC(e.durationMs, 1, Number.MAX_SAFE_INTEGER) || !iC(e.effectiveRateMilli, 1, iS) || !iC(e.decodedSampleRate, 8e3, 192e3) || !iN(e.backendId) || !iN(e.backendVersion)) throw Error("nle_preview_stretch_identity_invalid");
    let t = JSON.stringify([e.documentRevision, e.cueId, e.relativePath, e.byteCount, e.durationMs]),
      r = JSON.stringify([e.documentRevision, e.cueId, e.relativePath, e.byteCount, e.durationMs, e.effectiveRateMilli, e.decodedSampleRate, e.backendId, e.backendVersion]);
    return {
      ...e,
      audioIdentity: t,
      key: r
    }
  }
  let iT = "sonic-wasm",
    iE = "0.2.0";
  class iR {
    id = iT;
    version = iE;
    worker;
    pending = new Map;
    inFlight = new Map;
    nextRequestId = 1;
    epoch = 1;
    disposed = !1;
    constructor(t = {}) {
      this.worker = (t.createWorker ?? function() {
        return e.r(36417)(Worker, {
          type: "module",
          name: "dichvideo-nle-preview-sonic"
        })
      })(), this.worker.onmessage = e => this.handleReply(e.data), this.worker.onerror = () => this.failWorker()
    }
    stretch(e) {
      let t, r;
      if (this.disposed) return Promise.reject(Error("nle_preview_stretch_disposed"));
      let i = JSON.stringify([e.audioIdentity, e.effectiveRateMilli, e.targetFrameCount, e.sampleRate]),
        a = this.inFlight.get(i);
      if (a) return a;
      var n, s = e;
      if (!s || !iN(s.cueId) || !iN(s.audioIdentity) || !iC(s.effectiveRateMilli, 1, iS) || !iC(s.targetFrameCount, 1, Number.MAX_SAFE_INTEGER) || !iC(s.sampleRate, 8e3, 192e3) || !i_(s.channels)) throw Error("nle_preview_stretch_request_invalid");
      let o = this.nextRequestId;
      this.nextRequestId += 1;
      let l = this.epoch,
        c = (n = e.channels, t = new Set, {
          descriptors: r = n.map(e => {
            let r = e.buffer instanceof ArrayBuffer && 0 === e.byteOffset && e.byteLength === e.buffer.byteLength && !t.has(e.buffer) ? e : e.slice(),
              i = r.buffer;
            return t.add(i), {
              buffer: i,
              byteOffset: r.byteOffset,
              length: r.length
            }
          }),
          transfer: r.map(e => e.buffer)
        }),
        d = new Promise((t, r) => {
          this.pending.set(o, {
            epoch: l,
            key: i,
            sampleRate: e.sampleRate,
            targetFrameCount: e.targetFrameCount,
            resolve: t,
            reject: r
          });
          try {
            this.worker.postMessage({
              type: "stretch",
              requestId: o,
              epoch: l,
              sampleRate: e.sampleRate,
              targetFrameCount: e.targetFrameCount,
              channels: c.descriptors
            }, c.transfer)
          } catch {
            this.pending.delete(o), r(Error("nle_preview_stretch_worker_failed"))
          }
        }).finally(() => {
          this.inFlight.delete(i)
        });
      return this.inFlight.set(i, d), d
    }
    async dispose() {
      if (this.disposed) return;
      this.disposed = !0, this.epoch += 1, this.worker.onmessage = null, this.worker.onerror = null, this.worker.terminate();
      let e = Error("nle_preview_stretch_disposed");
      for (let t of this.pending.values()) t.reject(e);
      this.pending.clear(), this.inFlight.clear()
    }
    handleReply(e) {
      let t = this.pending.get(e.requestId);
      if (t && e.epoch === t.epoch && e.epoch === this.epoch) {
        if (this.pending.delete(e.requestId), "error" === e.type) return void t.reject(Error(e.error || "nle_preview_stretch_worker_failed"));
        try {
          let r = e.channels.map(e => new Float32Array(e.buffer, e.byteOffset, e.length));
          t.resolve(function(e, t, r) {
            if (!e || !iC(t, 1, Number.MAX_SAFE_INTEGER) || !iC(r, 8e3, 192e3) || e.sampleRate !== r || e.frameCount !== t || !iN(e.backendId) || !iN(e.backendVersion) || !i_(e.channels, t)) throw Error("nle_preview_stretch_result_invalid");
            return e
          }({
            sampleRate: e.sampleRate,
            frameCount: e.frameCount,
            channels: r,
            backendId: iT,
            backendVersion: iE
          }, t.targetFrameCount, t.sampleRate))
        } catch {
          t.reject(Error("nle_preview_stretch_result_invalid"))
        }
      }
    }
    failWorker() {
      if (this.disposed) return;
      let e = Error("nle_preview_stretch_worker_failed");
      for (let t of this.pending.values()) t.reject(e);
      this.pending.clear(), this.inFlight.clear()
    }
  }

  function iI(e, t, r) {
    return Number.isSafeInteger(e) && Number(e) >= t && Number(e) <= r
  }

  function iV(e) {
    return !!e && Number.isFinite(e.playheadMs) && e.playheadMs >= 0 && "boolean" == typeof e.playing && Number.isFinite(e.transportRate) && e.transportRate > 0
  }

  function iA(e, t) {
    if (!e || !t || !iI(e.revision, 1, Number.MAX_SAFE_INTEGER) || t.revision !== e.revision || !Array.isArray(e.voiceCues) || !Array.isArray(t.voiceClips)) throw Error("nle_preview_voice_engine_schedule_invalid");
    let r = new Map;
    for (let t of e.voiceCues) {
      if (!t?.cueId || r.has(t.cueId)) throw Error("nle_preview_voice_engine_schedule_invalid");
      r.set(t.cueId, t)
    }
    let i = -1;
    for (let e of t.voiceClips) {
      let t = r.get(e.cueId);
      if (!t || e.audioPath !== t.audio.relativePath || !Number.isFinite(e.placedStartMs) || !Number.isFinite(e.placedEndMs) || e.placedStartMs < 0 || e.placedEndMs <= e.placedStartMs || e.placedStartMs < i || !Number.isFinite(e.playbackRate) || e.playbackRate <= 0) throw Error("nle_preview_voice_engine_schedule_invalid");
      i = e.placedStartMs
    }
    return r
  }

  function iF(e, t) {
    if (void 0 !== t.audioClips && !Array.isArray(t.audioClips) || void 0 !== e.audioClips && !Array.isArray(e.audioClips)) throw Error("nle_preview_voice_engine_schedule_invalid");
    let r = new Map;
    for (let t of e.audioClips ?? []) {
      if (!t?.clipId || r.has(t.clipId)) throw Error("nle_preview_voice_engine_schedule_invalid");
      r.set(t.clipId, t)
    }
    let i = -1;
    for (let e of t.audioClips ?? []) {
      let t = r.get(e.clipId);
      if (!t || e.relativePath !== t.relativePath || !Number.isFinite(e.placedStartMs) || !Number.isFinite(e.placedEndMs) || e.placedStartMs < 0 || e.placedEndMs <= e.placedStartMs || e.placedStartMs < i || !Number.isSafeInteger(e.trimInMs) || e.trimInMs < 0 || !Number.isSafeInteger(e.gainPercent) || e.gainPercent < 0 || e.gainPercent > 150) throw Error("nle_preview_voice_engine_schedule_invalid");
      i = e.placedStartMs
    }
    return r
  }

  function iD(e, t) {
    let r, i, a;
    return [...((r = e.voiceClips.findIndex(e => t >= e.placedStartMs && t < e.placedEndMs)) < 0 && (r = e.voiceClips.findIndex(e => e.placedStartMs > t)), r < 0 ? [] : e.voiceClips.slice(r, r + 3)).map(e => ({
      kind: "voice",
      clip: e
    })), ...((a = (i = e.audioClips ?? []).findIndex(e => t >= e.placedStartMs && t < e.placedEndMs)) < 0 && (a = i.findIndex(e => e.placedStartMs > t)), a < 0 ? [] : i.slice(a, a + 4)).map(e => ({
      kind: "audio",
      clip: e
    }))].slice(0, 4)
  }

  function iL(e) {
    return "voice" === e.kind ? e.clip.cueId : `audio:${e.clip.clipId}`
  }

  function iz(e, t) {
    return JSON.stringify([e.revision, t.cueId, t.audio.relativePath, t.audio.byteCount, t.audio.durationMs])
  }

  function iB(e, t) {
    return JSON.stringify([e.revision, "audio", t.clipId, t.relativePath, t.durationMs, t.fileName])
  }

  function iO(e, t, r) {
    let i = Math.round(1e3 * r);
    if (!iI(i, 1, Number.MAX_SAFE_INTEGER)) throw Error("nle_preview_voice_engine_transport_invalid");
    return ix(e, t, i)
  }

  function i$(e, t, r) {
    let i = new Map(e.voiceCues.map(e => [e.cueId, e])),
      a = new Map((e.audioClips ?? []).map(e => [e.clipId, e]));
    return JSON.stringify([e.revision, Math.round(1e3 * r), t.map(e => {
      if ("audio" === e.kind) {
        let t = e.clip,
          r = a.get(t.clipId);
        return ["audio", t.clipId, t.relativePath, t.placedStartMs, t.placedEndMs, t.trimInMs, t.gainPercent, r?.durationMs, r?.fileName]
      }
      let t = e.clip,
        r = i.get(t.cueId);
      return ["voice", t.cueId, t.audioPath, t.placedStartMs, t.placedEndMs, t.playbackRate, r?.audio.byteCount, r?.audio.durationMs]
    })])
  }
  class iH {
    document;
    currentSchedule;
    cueMap;
    audioClipMap;
    sampleRate;
    resolveAudioSource;
    pcmCache;
    stretchBackend;
    mixer;
    onScheduleVisible;
    onCueError;
    ready = new Map;
    reportedCueErrors = new Set;
    installedClips = [];
    epoch = 0;
    selectedSignature = null;
    activePreparation = null;
    latestTransport = null;
    disposed = !1;
    constructor(e) {
      if (!e || !iI(e.sampleRate, 8e3, 192e3) || "function" != typeof e.resolveAudioSource || !e.pcmCache || !e.stretchBackend || !e.mixer) throw Error("nle_preview_voice_engine_options_invalid");
      this.cueMap = iA(e.document, e.schedule), this.audioClipMap = iF(e.document, e.schedule), this.document = e.document, this.currentSchedule = e.schedule, this.sampleRate = e.sampleRate, this.resolveAudioSource = e.resolveAudioSource, this.pcmCache = e.pcmCache, this.stretchBackend = e.stretchBackend, this.mixer = e.mixer, this.onScheduleVisible = e.onScheduleVisible, this.onCueError = e.onCueError
    }
    get schedule() {
      return this.currentSchedule
    }
    get state() {
      return this.disposed ? "disposed" : "ready"
    }
    setVolume(e, t) {
      if (this.disposed) throw Error("nle_preview_voice_engine_disposed");
      this.mixer.setVolume(e, t)
    }
    ensureAudioRunning() {
      return this.disposed ? Promise.reject(Error("nle_preview_voice_engine_disposed")) : this.mixer.ensureAudioRunning()
    }
    sync(e, t = "tick") {
      if (this.disposed) return Promise.reject(Error("nle_preview_voice_engine_disposed"));
      if (!iV(e)) return Promise.reject(Error("nle_preview_voice_engine_transport_invalid"));
      let r = iD(this.currentSchedule, e.playheadMs),
        i = i$(this.document, r, e.transportRate);
      "schedule_commit" === t && this.onScheduleVisible?.(this.currentSchedule);
      let a = this.mixerTransport(e, t);
      return (this.latestTransport = a, i === this.selectedSignature) ? a.playing ? (this.activePreparation ?? Promise.resolve()).then(() => {
        if (!this.disposed) return this.mixer.syncTransport(this.latestTransport ?? a)
      }) : this.mixer.syncTransport(a) : this.beginPreparation(r, e, t, i)
    }
    replaceSchedule(e, t, r = this.document) {
      if (this.disposed) return Promise.reject(Error("nle_preview_voice_engine_disposed"));
      if (!iV(t)) return Promise.reject(Error("nle_preview_voice_engine_transport_invalid"));
      let i = iA(r, e),
        a = iF(r, e);
      this.epoch += 1, this.document = r, this.currentSchedule = e, this.cueMap = i, this.audioClipMap = a, this.onScheduleVisible?.(e);
      let n = iD(e, t.playheadMs),
        s = i$(r, n, t.transportRate);
      return this.latestTransport = this.mixerTransport(t, "schedule_commit"), this.beginPreparation(n, t, "schedule_commit", s, !1)
    }
    async dispose() {
      this.disposed || (this.disposed = !0, this.epoch += 1, this.selectedSignature = null, this.activePreparation = null, this.latestTransport = null, this.ready.clear(), this.reportedCueErrors.clear(), this.installedClips = [], this.pcmCache.dispose(), this.mixer.dispose(), await this.stretchBackend.dispose())
    }
    beginPreparation(e, t, r, i, a = !0) {
      a && (this.epoch += 1);
      let n = this.epoch;
      this.selectedSignature = i;
      let s = e.map(e => this.pcmAsset(e));
      this.pcmCache.retain(s.map(e => e.key));
      let o = "tick" === r ? Promise.resolve() : this.mixer.installWindow({
          revision: this.currentSchedule.revision,
          transportRateMilli: Math.round(1e3 * t.transportRate),
          clips: []
        }).then(() => {
          this.isCurrent(n) && (this.installedClips = [])
        }),
        l = this.mixer.syncTransport(this.mixerTransport(t, r)),
        c = this.prepareActive(n, e, t, o, l).catch(e => {
          throw this.isCurrent(n) && (this.selectedSignature = null), e
        }).finally(() => {
          this.activePreparation === c && (this.activePreparation = null)
        });
      return this.activePreparation = c, c
    }
    async prepareActive(e, t, r, i, a) {
      if (await Promise.all([i, a]), !this.isCurrent(e)) return;
      let n = t[0];
      if (!n) return;
      let s = await this.prepareClip(e, n, r.transportRate);
      if (!s || !this.isCurrent(e)) return;
      let o = [s];
      for (let i of t.slice(1)) {
        let t = i.clip,
          a = this.installedClips.find(e => e.cueId === iL(i) && e.placedStartMs === t.placedStartMs && e.placedEndMs === t.placedEndMs && e.frameCount === iO(this.sampleRate, t.placedEndMs - t.placedStartMs, r.transportRate));
        if (a) {
          o.push(a);
          continue
        }
        if (r.playheadMs >= t.placedStartMs && r.playheadMs < t.placedEndMs) try {
          let t = await this.prepareClip(e, i, r.transportRate);
          if (!this.isCurrent(e)) return;
          t && o.push(t)
        } catch {
          if (!this.isCurrent(e)) return
        }
      }
      await this.mixer.installWindow({
        revision: this.currentSchedule.revision,
        transportRateMilli: Math.round(1e3 * r.transportRate),
        clips: [...o]
      }), this.isCurrent(e) && (this.installedClips = [...o], this.prepareLookahead(e, t.slice(1), r.transportRate, o))
    }
    async prepareLookahead(e, t, r, i) {
      for (let a of t)
        if (!i.some(e => e.cueId === iL(a))) try {
          let t = await this.prepareClip(e, a, r);
          if (!t || !this.isCurrent(e) || (i.push(t), await this.mixer.installWindow({
              revision: this.currentSchedule.revision,
              transportRateMilli: Math.round(1e3 * r),
              clips: [...i]
            }), !this.isCurrent(e))) return;
          this.installedClips = [...i]
        } catch {
          if (!this.isCurrent(e)) return
        }
    }
    prepareClip(e, t, r) {
      return "voice" === t.kind ? this.prepareVoiceClip(e, t.clip, r) : this.prepareAudioClip(e, t.clip, r)
    }
    async prepareAudioClip(e, t, r) {
      let i = this.audioClipMap.get(t.clipId);
      if (!i) return null;
      try {
        let a = await this.pcmCache.getOrDecode(this.audioPcmAsset(t, i));
        if (!a || !this.isCurrent(e)) return null;
        if (a.sampleRate !== this.sampleRate) throw Error("nle_preview_pcm_sample_rate_mismatch");
        let n = t.placedEndMs - t.placedStartMs,
          s = Math.max(1, Math.round(a.sampleRate * n / 1e3)),
          o = Math.max(0, Math.min(a.frameCount, Math.round(a.sampleRate * t.trimInMs / 1e3))),
          l = t.gainPercent / 100,
          c = a.channels.map(e => {
            let t = new Float32Array(s),
              r = Math.max(0, Math.min(s, e.length - o));
            if (r > 0 && t.set(e.subarray(o, o + r)), 1 !== l)
              for (let e = 0; e < t.length; e += 1) t[e] *= l;
            return t
          }),
          d = iO(a.sampleRate, n, r),
          u = Math.round(1e3 * r),
          h = iP({
            documentRevision: this.document.revision,
            cueId: iL({
              kind: "audio",
              clip: t
            }),
            relativePath: t.relativePath,
            byteCount: a.frameCount,
            durationMs: Math.max(1, Math.round(a.frameCount / a.sampleRate * 1e3)),
            effectiveRateMilli: u,
            decodedSampleRate: a.sampleRate,
            backendId: this.stretchBackend.id,
            backendVersion: this.stretchBackend.version
          }),
          p = `${h.key}|${t.trimInMs}|${t.gainPercent}|${s}`,
          m = this.ready.get(p);
        if (m) this.ready.delete(p), this.ready.set(p, m);
        else {
          if (m = await this.stretchBackend.stretch({
              cueId: iL({
                kind: "audio",
                clip: t
              }),
              audioIdentity: h.audioIdentity,
              effectiveRateMilli: u,
              targetFrameCount: d,
              sampleRate: a.sampleRate,
              channels: c
            }), !this.isCurrent(e)) return null;
          for (this.ready.set(p, m); this.ready.size > 4;) {
            let e = this.ready.keys().next().value;
            if ("string" != typeof e) break;
            this.ready.delete(e)
          }
        }
        return this.audioMixerClip(t, m)
      } catch (a) {
        if (!this.isCurrent(e)) return null;
        let r = iB(this.document, i);
        if (!this.reportedCueErrors.has(r)) {
          this.reportedCueErrors.add(r);
          try {
            this.onCueError?.(t, a)
          } catch {}
        }
        throw a
      }
    }
    async prepareVoiceClip(e, t, r) {
      let i = this.cueMap.get(t.cueId);
      if (!i) return null;
      try {
        let a = await this.pcmCache.getOrDecode(this.pcmAsset({
          kind: "voice",
          clip: t
        }));
        if (!a || !this.isCurrent(e)) return null;
        if (a.sampleRate !== this.sampleRate) throw Error("nle_preview_pcm_sample_rate_mismatch");
        let n = iO(a.sampleRate, t.placedEndMs - t.placedStartMs, r),
          s = Math.round(t.playbackRate * r * 1e3),
          o = iP({
            documentRevision: this.document.revision,
            cueId: i.cueId,
            relativePath: i.audio.relativePath,
            byteCount: i.audio.byteCount,
            durationMs: i.audio.durationMs,
            effectiveRateMilli: s,
            decodedSampleRate: a.sampleRate,
            backendId: this.stretchBackend.id,
            backendVersion: this.stretchBackend.version
          }),
          l = this.ready.get(o.key);
        if (l) this.ready.delete(o.key), this.ready.set(o.key, l);
        else {
          if (l = await this.stretchBackend.stretch({
              cueId: i.cueId,
              audioIdentity: o.audioIdentity,
              effectiveRateMilli: s,
              targetFrameCount: n,
              sampleRate: a.sampleRate,
              channels: a.channels.map(e => e.slice())
            }), !this.isCurrent(e)) return null;
          for (this.ready.set(o.key, l); this.ready.size > 4;) {
            let e = this.ready.keys().next().value;
            if ("string" != typeof e) break;
            this.ready.delete(e)
          }
        }
        return this.mixerClip(t, l)
      } catch (a) {
        if (!this.isCurrent(e)) return null;
        let r = iz(this.document, i);
        if (!this.reportedCueErrors.has(r)) {
          this.reportedCueErrors.add(r);
          try {
            this.onCueError?.(t, a)
          } catch {}
        }
        throw a
      }
    }
    pcmAsset(e) {
      if ("audio" === e.kind) {
        let t = this.audioClipMap.get(e.clip.clipId);
        if (!t) throw Error("nle_preview_voice_engine_schedule_invalid");
        return this.audioPcmAsset(e.clip, t)
      }
      let t = this.cueMap.get(e.clip.cueId);
      if (!t) throw Error("nle_preview_voice_engine_schedule_invalid");
      return {
        cueId: t.cueId,
        key: iz(this.document, t),
        source: this.resolveAudioSource(t.audio.relativePath)
      }
    }
    audioPcmAsset(e, t) {
      return {
        cueId: iL({
          kind: "audio",
          clip: e
        }),
        key: iB(this.document, t),
        source: this.resolveAudioSource(e.relativePath),
        preserveLeadingSilence: !0
      }
    }
    mixerClip(e, t) {
      return {
        cueId: e.cueId,
        placedStartMs: e.placedStartMs,
        placedEndMs: e.placedEndMs,
        sampleRate: t.sampleRate,
        frameCount: t.frameCount,
        channels: t.channels
      }
    }
    audioMixerClip(e, t) {
      return {
        cueId: iL({
          kind: "audio",
          clip: e
        }),
        placedStartMs: e.placedStartMs,
        placedEndMs: e.placedEndMs,
        sampleRate: t.sampleRate,
        frameCount: t.frameCount,
        channels: t.channels
      }
    }
    mixerTransport(e, t) {
      return {
        playheadMs: e.playheadMs,
        playing: e.playing,
        discontinuity: "tick" !== t,
        ownerGesture: "play_start" === t
      }
    }
    isCurrent(e) {
      return !this.disposed && e === this.epoch
    }
  }
  async function iq(e) {
    try {
      await e
    } catch (e) {
      if (! function(e) {
          if ("object" == typeof e && null !== e && "name" in e && "AbortError" === e.name) return !0;
          if (e instanceof Error) return "nle_preview_voice_engine_disposed" === e.message || "nle_preview_audio_mixer_disposed" === e.message;
          if ("object" == typeof e && null !== e && "code" in e) {
            let t = e.code;
            return "nle_preview_voice_engine_disposed" === t || "nle_preview_audio_mixer_disposed" === t
          }
          return !1
        }(e)) throw e
    }
  }
  let iK = "1" === tG.default.env.NEXT_PUBLIC_DICHVIDEO_EXPORT_RENDERED_SUBTITLE_PREVIEW;

  function iX(e) {
    return null !== e && !e.paused && !e.seeking && e.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
  }

  function iG({
    exportLayers: e = [],
    selectedExportLayerId: i = null,
    onExportLayersChange: a,
    onExportLayerGestureCommit: n,
    onSelectedExportLayerIdChange: s,
    onSubtitlePreviewViewportChange: o,
    onSubtitleStyleCommit: l,
    onSourceRemovalCommit: d
  } = {}) {
    let u = (0, r.useRef)(null),
      [h, p] = (0, r.useState)(0),
      m = (0, r.useCallback)(e => {
        u.current !== e && (u.current = e, p(e => e + 1))
      }, []),
      g = (0, r.useRef)(null),
      x = (0, r.useRef)(null),
      f = (0, r.useRef)(null),
      v = (0, r.useRef)(!1),
      b = (0, r.useRef)(null),
      y = (0, r.useRef)(null),
      w = (0, r.useRef)(!1),
      j = (0, W.useVideoStore)(e => e.currentTime),
      k = (0, W.useVideoStore)(e => e.isPlaying),
      S = (0, W.useVideoStore)(e => e.volume),
      N = (0, W.useVideoStore)(e => e.playbackRate),
      C = (0, W.useVideoStore)(e => e.setIsPlaying),
      M = (0, W.useVideoStore)(e => e.setCurrentTime),
      _ = (0, W.useVideoStore)(e => e.previewSeekRequest),
      P = (0, W.useVideoStore)(e => e.acknowledgePreviewSeek),
      T = (0, W.useVideoStore)(e => e.setVolume),
      E = (0, W.useVideoStore)(e => e.setPlaybackRate),
      V = (0, W.useVideoStore)(e => e.updateVideo),
      A = (0, W.useVideoStore)(e => e.activeVideoId),
      F = (0, W.useVideoStore)(e => e.videos.find(t => t.id === e.activeVideoId)),
      {
        subtitles: D,
        renderSubtitles: L,
        globalStyle: z,
        setGlobalStyle: B
      } = (0, X.useSubtitleStore)(),
      [O, $] = (0, r.useState)(!0),
      [H, q] = (0, r.useState)(!1),
      [K, G] = (0, r.useState)(null),
      [U, Y] = (0, r.useState)(null),
      [J, Z] = (0, r.useState)({
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0
      }),
      [Q, ee] = (0, r.useState)(!1),
      [et, er] = (0, r.useState)(null),
      [ei, ea] = (0, r.useState)(!1),
      [en, es] = (0, r.useState)(!1),
      [eo, el] = (0, r.useState)(!1),
      ec = (0, r.useRef)(null),
      [ed, eu] = (0, r.useState)(null),
      [eh, ep] = (0, r.useState)(null),
      [em, eg] = (0, r.useState)(new Map),
      [ex, ef] = (0, r.useState)(!1),
      [ev, eb] = (0, r.useState)(null),
      [ey, ew] = (0, r.useState)(null),
      ej = (0, im.useTerminalProjectStore)(e => e.active),
      ek = F?.nleDocument ?? null,
      eS = ek?.canvasComposition ?? ej?.graph.visuals.canvasComposition ?? tY.DEFAULT_CANVAS_COMPOSITION,
      eN = ek?.sourceRemoval ?? ej?.graph.visuals.sourceRemoval ?? tY.DEFAULT_SOURCE_REMOVAL,
      eC = (0, r.useMemo)(() => e.filter(tY.isSourceRemovalExportLayer), [e]),
      eM = (0, r.useMemo)(() => !!(F?.projectRoot && (0, tb.canOpenNleProject)(F)), [F]),
      e_ = (0, r.useMemo)(() => eM && ek ? (0, ik.nleSequenceScheduleInputKey)(ek) : null, [eM, ek]),
      eP = (0, r.useMemo)(() => eM && ek ? (0, ik.buildNleSequenceSchedule)(ek) : null, [eM, e_]),
      eE = (0, r.useRef)(ek),
      eR = (0, r.useRef)(eP);
    eE.current = ek, eR.current = eP;
    let eI = eM || ej?.projectId !== A ? null : ej,
      eV = !!eI,
      eA = (0, I.isTauri)(),
      eF = !!(!eM && F && ej?.projectId === F.id),
      eD = F?.translatedVideoPath && F.translatedVideoPath !== ev ? F.translatedVideoPath : void 0,
      eL = eF && F?.path && F.projectAudioTrack ? {
        audioSourceSelection: F.projectAudioTrack.sourceSelection,
        sourcePath: F.path,
        carrierPath: "separated_background" === F.projectAudioTrack.sourceSelection || "separated_vocals" === F.projectAudioTrack.sourceSelection ? F.projectAudioPreviewCarrierPath ?? "" : F.path
      } : null,
      ez = null;
    if (eM && ek) {
      let e = (0, rI.resolveNleProjectSourcePath)({
        projectRoot: F?.projectRoot,
        relativeSourcePath: ek.source.relativePath,
        linkedSourcePath: F?.path
      });
      ez = (0, rI.selectNleBackgroundPlaybackPath)({
        sourceAudioMode: ek.playback.sourceAudioMode,
        sourcePath: e ?? void 0,
        verifiedBackgroundCarrierPath: F?.projectAudioPreviewCarrierPath
      })
    }
    let eB = eM ? ez ?? void 0 : (0, rI.selectTerminalEditorPlaybackBasePath)({
        desktopRuntime: eA,
        terminalProjectActive: eF,
        terminalProject: eL,
        generatedPath: eD,
        sourcePath: F?.path
      }),
      eO = !!(F?.path && !eD && eB === F.path),
      e$ = !!(eA && eO && (0, rI.shouldPreparePreviewBeforePlayback)(eB, F?.codec)),
      eH = !!(F?.path && ey === F.path),
      eq = (0, r.useMemo)(() => (function(e) {
        if (!e.isTauri) return {
          kind: "ineligible",
          reason: "not_tauri"
        };
        let t = io(e.originalPath);
        if (t !== io(e.selectedPath)) return {
          kind: "ineligible",
          reason: "not_original_source"
        };
        if (!t.endsWith(".mp4")) return {
          kind: "ineligible",
          reason: "not_mp4"
        };
        if (!ia.has(is(e.codec) ?? "")) return {
          kind: "ineligible",
          reason: "not_hevc"
        };
        let r = function(e) {
          let t = e.sourceAudioStreamCount;
          if (!Number.isSafeInteger(t) || void 0 === t || t < 0) return {
            kind: "unknown"
          };
          let r = is(e.audioCodec);
          return 0 === t ? null === r ? {
            kind: "none",
            streamCount: 0
          } : {
            kind: "unknown"
          } : null === r ? {
            kind: "unknown"
          } : "aac" === r ? {
            kind: "aac",
            streamCount: t
          } : {
            kind: "unsupported",
            streamCount: t,
            codec: r
          }
        }(e);
        return "unknown" === r.kind ? {
          kind: "ineligible",
          reason: "audio_unknown"
        } : "unsupported" === r.kind ? {
          kind: "ineligible",
          reason: "audio_unsupported"
        } : {
          kind: "eligible",
          videoId: e.videoId,
          originalPath: e.originalPath,
          normalizedOriginalPath: t,
          audio: r.kind
        }
      })({
        isTauri: eA && eO,
        videoId: F?.id ?? "",
        originalPath: F?.path ?? "",
        selectedPath: eB ?? "",
        codec: F?.codec,
        audioCodec: F?.audioCodec,
        sourceAudioStreamCount: F?.sourceAudioStreamCount
      }), [F?.audioCodec, F?.codec, F?.id, F?.path, F?.sourceAudioStreamCount, eA, eO, eB]),
      eK = function({
        eligibility: e
      }) {
        let t = "eligible" === e.kind ? e.videoId : null,
          i = "eligible" === e.kind ? e.originalPath : null,
          a = "eligible" === e.kind ? e.normalizedOriginalPath : null,
          n = (0, r.useRef)(null),
          s = (0, r.useRef)(null),
          [o, l] = (0, r.useState)(null),
          [c, d] = (0, r.useState)(0),
          u = t && a ? `${t}\u0000${a}\u0000${c}` : null,
          h = (0, r.useCallback)(() => {
            "eligible" === e.kind && d(e => e + 1)
          }, [e.kind]);
        (0, r.useEffect)(() => {
          var e;
          if (!t || !i || !u) return;
          let r = (e = n.current, {
              videoId: t,
              originalPath: i,
              normalizedOriginalPath: io(i),
              generation: (e?.generation ?? 0) + 1,
              probing: !0,
              result: null
            }),
            a = new AbortController;
          return n.current = r, s.current = r, il({
            videoId: t,
            originalPath: i,
            generation: r.generation,
            mediaSrc: (0, I.resolveMediaSrc)(i),
            timeoutMs: 8e3,
            signal: a.signal
          }).then(e => {
            let t = s.current,
              r = id(t, e);
            r && r !== t && (s.current = r, l({
              requestKey: u,
              session: r
            }))
          }).catch(() => {
            let e = {
                status: "unsupported",
                videoId: t,
                originalPath: i,
                generation: r.generation,
                reason: "load_error"
              },
              a = s.current,
              n = id(a, e);
            n && n !== a && (s.current = n, l({
              requestKey: u,
              session: n
            }))
          }), () => {
            var e;
            a.abort(), e = s.current, s.current = ic(e, r) ? null : e
          }
        }, [i, t, u]);
        let p = u && o?.requestKey === u ? o.session : null;
        return {
          result: p?.result ?? null,
          probing: null !== u && null === p,
          retry: h
        }
      }({
        eligibility: eq
      }),
      eX = "eligible" !== eq.kind ? e$ ? "proxy_required" : "ineligible" : eK.result?.status === "supported" ? eH ? "proxy_required" : "supported" : eK.result?.status === "unsupported" ? "unsupported" : "probing",
      eG = eB && F?.previewSourcePath === eB ? F?.previewVideoPath : void 0,
      eW = (0, rI.selectHevcAwarePlaybackPath)({
        sourcePlaybackPath: eB,
        originalPath: F?.path,
        previewPlaybackPath: eG,
        hevcStatus: eX
      }),
      eU = eW ? (0, I.resolveMediaSrc)(eW) : null,
      eY = F?.thumbnail ? (0, I.resolveMediaSrc)(F.thumbnail) : null,
      eJ = (0, rI.getVideoMimeType)(eW),
      eZ = !!(eB && ed === eB),
      eQ = eP ? eP.durationMs / 1e3 : null,
      e0 = eI ? (0, ig.projectPlaybackDurationMs)(eI.graph) / 1e3 : eQ ?? (eD ? F?.outputDuration ?? F?.duration ?? 300 : F?.duration ?? 300),
      e1 = eI ? (0, ig.projectPlaybackDurationMs)(eI.graph) / 1e3 : eQ ?? (eD ? F?.outputDuration ?? F?.duration : F?.duration),
      e2 = F && ("unsupported" === eX || "proxy_required" === eX) && !eG ? {
        videoId: F.id,
        title: "Đang dùng đường preview tương thích",
        description: "unsupported" === eX ? "Windows chưa phát trực tiếp nguồn HEVC này. DichVideo dùng preview H.264/AAC khi video đủ điều kiện; việc xử lý và xuất video vẫn hoạt động bình thường." : "DichVideo đang chuẩn bị preview H.264/AAC tương thích; việc xử lý và xuất video vẫn hoạt động bình thường."
      } : null,
      e5 = F && eA && eF && !eI ? {
        videoId: F.id,
        title: "Project chưa sẵn sàng",
        description: "Dữ liệu xem trước chưa đồng bộ. Hãy quay lại Lịch sử và mở project lại."
      } : null,
      e3 = U?.videoId === F?.id ? U : e5 ?? e2,
      e4 = !!et,
      e8 = function(e, t) {
        var r;
        let i;
        if (!t || e?.watermarkRequired !== !0) return null;
        let a = e.authorizationJti?.trim() || "preview-protection-missing-seed";
        return {
          text: (r = e.watermarkText, (i = r?.trim()) ? i.slice(0, 160) : "dichvideo.com"),
          trajectory: rU[function(e) {
            let t = 0x811c9dc5;
            for (let r = 0; r < e.length; r += 1) t ^= e.charCodeAt(r), t = Math.imul(t, 0x1000193);
            return t >>> 0
          }(a) % rU.length]
        }
      }(F?.exportWatermarkPolicy, eV),
      e7 = function({
        videoRef: e,
        mediaElementVersion: t,
        project: i,
        muted: a,
        volume: n,
        onError: s,
        onReady: o
      }) {
        let [l, c] = (0, r.useState)(null), [d, u] = (0, r.useState)("idle"), [h, p] = (0, r.useState)(null), m = (0, r.useRef)(null), g = (0, r.useRef)(i?.graph ?? null), x = (0, r.useRef)({
          onError: s,
          onReady: o
        });
        x.current = {
          onError: s,
          onReady: o
        }, (0, r.useEffect)(() => {
          let t = e.current;
          if (!t || !i) {
            m.current?.dispose(), m.current = null, g.current = null, c(null), u("idle"), p(null);
            return
          }
          u("loading"), p(null);
          let r = e => {
              let t = ir(e, "play");
              if ("benign_abort" === t) return;
              "integrity" === t && m.current?.fenceIntegrity();
              let r = ii(e);
              u("error"), p(r), x.current.onError(r)
            },
            s = function(e = {}) {
              return new ie({
                resolveMediaSource: e.resolveMediaSource ?? (e => e),
                fetchArrayBuffer: e.fetchArrayBuffer ?? (async e => {
                  let t = await fetch(e);
                  if (!t.ok) throw Error(`project_tts_fetch_failed:${t.status}`);
                  return t.arrayBuffer()
                }),
                createMediaElement: e.createMediaElement ?? (() => (function() {
                  if ("u" < typeof document) throw Error("project_tts_media_element_unavailable");
                  return document.createElement("audio")
                })()),
                createObjectUrl: e.createObjectUrl ?? (e => URL.createObjectURL(e)),
                revokeObjectUrl: e.revokeObjectUrl ?? (e => URL.revokeObjectURL(e)),
                setTimer: e.setTimer ?? ((e, t) => setTimeout(e, t)),
                clearTimer: e.clearTimer ?? (e => clearTimeout(e)),
                onError: e.onError
              })
            }({
              resolveMediaSource: I.resolveMediaSrc,
              onError: r
            }),
            o = function({
              media: e,
              graph: t,
              now: r = () => performance.now(),
              publishHz: i = 15,
              requestAnimationFrame: a = e => window.requestAnimationFrame(e),
              cancelAnimationFrame: n = e => window.cancelAnimationFrame(e),
              onFence: s,
              onRuntimeError: o,
              ttsScheduler: l
            }) {
              let c, d, u = 1e3 / Math.min(20, Math.max(10, i)),
                h = new Set,
                p = {
                  transport: 0,
                  audio: 0,
                  visual: 0
                },
                m = !1,
                g = 0,
                x = r(),
                f = t;
              l?.installGraph(t, p.audio);
              let v = (e = !1, t = !1) => {
                  let i = r();
                  (e || !(i - x < u)) && (x = i, d = r3(c, p, f, m ? "disposed" : "ready", t), h.forEach(e => e()))
                },
                b = function(e, t, r = {}) {
                  let i = r1(t),
                    a = 0,
                    n = !1,
                    s = 1,
                    o = NaN,
                    l = t => {
                      let r = rJ(t * s, .05, 16);
                      r !== o && (o = r, e.playbackRate = r)
                    },
                    c = () => {
                      let t = function(e, t) {
                        if (0 === e.spans.length) return {
                          sourceTimeMs: Math.max(0, t),
                          outputTimeMs: 0,
                          graphPlaybackRate: 1
                        };
                        let r = e.spans[r2(e.sourceStarts, t)],
                          i = Math.max(Number.EPSILON, r.sourceEndMs - r.sourceStartMs),
                          a = rJ((t - r.sourceStartMs) / i, 0, 1);
                        return {
                          sourceTimeMs: rJ(t, r.sourceStartMs, r.sourceEndMs),
                          outputTimeMs: rJ(r.outputStartMs + a * (r.outputEndMs - r.outputStartMs), 0, e.outputDurationMs),
                          graphPlaybackRate: r.graphPlaybackRate
                        }
                      }(i, Math.max(0, 1e3 * e.currentTime));
                      l(t.graphPlaybackRate);
                      let n = {
                        epoch: a,
                        generationId: i.graph.generationId,
                        graphHash: i.graph.graphHash,
                        sourceTimeMs: t.sourceTimeMs,
                        outputTimeMs: t.outputTimeMs,
                        playing: !e.paused,
                        playbackRate: s,
                        graphPlaybackRate: t.graphPlaybackRate
                      };
                      return r.onSnapshot?.(n), n
                    },
                    d = () => {
                      a += 1, r.onFence?.(a)
                    },
                    u = () => {
                      n || c()
                    },
                    h = ["timeupdate", "seeked", "play", "pause", "ratechange", "ended"];
                  return h.forEach(t => e.addEventListener(t, u)), "preservesPitch" in e && (e.preservesPitch = !0), "webkitPreservesPitch" in e && (e.webkitPreservesPitch = !0), l(r5(i, 0).graphPlaybackRate), {
                    async play() {
                      !n && (c(), await e.play(), n || c())
                    },
                    pause() {
                      n || (d(), e.pause(), c())
                    },
                    seekOutputMs(t) {
                      if (n) return c();
                      d();
                      let r = r5(i, t);
                      return l(r.graphPlaybackRate), e.currentTime = r.sourceTimeMs / 1e3, c()
                    },
                    setPlaybackRate(e) {
                      if (n || !Number.isFinite(e)) return c();
                      let t = rJ(e, .25, 4);
                      return t !== s && (d(), s = t), c()
                    },
                    replaceGeneration: t => (n || (d(), i = r1(t), o = NaN, e.currentTime = 0, l(r5(i, 0).graphPlaybackRate)), c()),
                    snapshot: c,
                    sample: c,
                    dispose() {
                      n || (d(), e.pause(), n = !0, h.forEach(t => e.removeEventListener(t, u)))
                    }
                  }
                }(e, t, {
                  onFence: e => {
                    l?.fenceTransport(e), s?.(e)
                  },
                  onSnapshot: e => {
                    c = e, l && l.sync(e).catch(e => o?.(e)), d && v(!1)
                  }
                });
              d = r3(c = b.snapshot(), p, f);
              let y = () => (c = b.sample(), v(!1), r3(c, p, f, m ? "disposed" : "ready")),
                w = function({
                  media: e,
                  onFrame: t,
                  requestAnimationFrame: r,
                  cancelAnimationFrame: i
                }) {
                  let a = !1,
                    n = !1,
                    s = null,
                    o = null,
                    l = () => {
                      null != s && ("rvfc" === o ? e.cancelVideoFrameCallback?.(s) : i(s), s = null, o = null)
                    },
                    c = () => {
                      if (!n && null == s) {
                        if ("function" == typeof e.requestVideoFrameCallback) {
                          o = "rvfc", s = e.requestVideoFrameCallback(() => {
                            s = null, o = null, n || (t(), a && !e.paused && c())
                          });
                          return
                        }
                        o = "raf", s = r(() => {
                          s = null, o = null, n || (t(), a && !e.paused && c())
                        })
                      }
                    };
                  return {
                    start() {
                      n || (a = !0, c())
                    },
                    stop() {
                      a = !1, l()
                    },
                    invalidate() {
                      n || c()
                    },
                    dispose() {
                      n || (n = !0, a = !1, l())
                    }
                  }
                }({
                  media: e,
                  onFrame: y,
                  requestAnimationFrame: a,
                  cancelAnimationFrame: n
                }),
                j = null;
              return {
                async play() {
                  if (m) return !1;
                  let t = ++g;
                  try {
                    if (await l?.unlock(), await b.play(), m || t !== g) return !1;
                    return c = b.sample(), w.start(), v(!0), !0
                  } catch (r) {
                    if (r && "object" == typeof r && "name" in r && "AbortError" === r.name && (m || t !== g || e.paused)) return !1;
                    return o?.(r), !1
                  }
                },
                pause() {
                  m || (g += 1, w.stop(), b.pause(), c = b.snapshot(), v(!0))
                },
                seekOutputMs(e) {
                  m || (g += 1, c = b.seekOutputMs(e), v(!0, !0), w.invalidate())
                },
                setTransportRate(e) {
                  m || (g += 1, c = b.setPlaybackRate(e), v(!0))
                },
                setAudioVolume(e, t) {
                  l?.setVolume(e, t)
                },
                sample: y,
                invalidateFrame() {
                  m || w.invalidate()
                },
                installTimingGraph(t) {
                  m || (g += 1, w.stop(), p.transport += 1, p.audio += 1, p.visual += 1, f = t, l?.installGraph(t, p.audio), c = b.replaceGeneration(t), v(!0), e.paused ? w.invalidate() : w.start())
                },
                reloadTimingGraph: t => {
                  let r = `${t.generationId}\u0000${t.graphHash}`;
                  if (j?.authorityKey === r) return j.promise;
                  let i = (async () => {
                    if (m) return "ready_paused";
                    g += 1, w.stop(), e.pause(), p.transport += 1, p.audio += 1, p.visual += 1, f = t, l?.installGraph(t, p.audio), e.load?.(), c = b.replaceGeneration(t), v(!0);
                    try {
                      if (await l?.unlock(), await b.play(), m) return "ready_paused";
                      return c = b.sample(), w.start(), v(!0), "playing"
                    } catch {
                      return c = b.snapshot(), v(!0), "ready_paused"
                    }
                  })();
                  return j = {
                    authorityKey: r,
                    promise: i
                  }, i.finally(() => {
                    j?.promise === i && (j = null)
                  }).catch(() => void 0), i
                },
                installVisualGraph(e) {
                  if (!m) {
                    if (e.transportProjectionHash !== f.transportProjectionHash || e.audioScheduleHash !== f.audioScheduleHash) {
                      let e = Object.assign(Error("visual-only promotion changed transport or audio authority"), {
                        code: "project_visual_authority_mismatch"
                      });
                      o?.(e);
                      return
                    }
                    p.visual += 1, f = e, v(!0), w.invalidate()
                  }
                },
                fenceIntegrity() {
                  m || (g += 1, w.stop(), p.transport += 1, p.audio += 1, p.visual += 1, b.pause(), c = b.snapshot(), v(!0))
                },
                getSnapshot: () => d,
                subscribe: e => (h.add(e), () => h.delete(e)),
                dispose() {
                  m || (g += 1, w.dispose(), b.dispose(), l && l.dispose(), m = !0, c = b.snapshot(), v(!0), h.clear())
                }
              }
            }({
              media: t,
              graph: i.graph,
              ttsScheduler: s,
              onRuntimeError: r
            });
          m.current = o, g.current = i.graph;
          let l = (0, tv.registerProjectPreviewRuntime)(i.projectId, {
            stop: () => o.pause(),
            reloadTimingGraph: e => (g.current = e, o.reloadTimingGraph(e)),
            dispose: () => o.dispose()
          });
          return t.muted = a, t.volume = Math.min(1, Math.max(0, n)), o.setAudioVolume(n, a), c(o), u("ready"), x.current.onReady?.(), () => {
            l(), o.dispose(), m.current === o && (m.current = null)
          }
        }, [t, i?.projectId, e]), (0, r.useEffect)(() => {
          let e = m.current;
          if (!e || !i || g.current === i.graph) return;
          let t = g.current;
          (g.current = i.graph, t && t.transportProjectionHash === i.graph.transportProjectionHash && t.audioScheduleHash === i.graph.audioScheduleHash) ? e.installVisualGraph(i.graph): e.reloadTimingGraph(i.graph).then(() => {
            u("ready")
          }).catch(e => {
            let t = ii(e);
            u("error"), p(t), x.current.onError(t)
          })
        }, [i]), (0, r.useEffect)(() => {
          let t = e.current;
          t && i && (t.muted = a, t.volume = Math.min(1, Math.max(0, n)), m.current?.setAudioVolume(n, a))
        }, [t, a, i, e, n]);
        let f = (0, r.useSyncExternalStore)(l ? l.subscribe : () => () => void 0, l ? l.getSnapshot : () => r4, () => r4),
          v = (0, r.useCallback)(async () => m.current?.play() ?? !1, []),
          b = (0, r.useCallback)(() => m.current?.pause(), []),
          y = (0, r.useCallback)(e => !!m.current && !!Number.isFinite(e) && (m.current.seekOutputMs(1e3 * Math.max(0, e)), !0), []),
          w = (0, r.useCallback)(e => {
            m.current?.setTransportRate(e)
          }, []),
          j = (0, r.useCallback)(() => m.current?.invalidateFrame(), []);
        return {
          status: d,
          generationId: f.generationId || null,
          error: h,
          activeCaptionId: f.activeCaptionId,
          readModel: f,
          play: v,
          pause: b,
          seekOutputSeconds: y,
          setTransportRate: w,
          invalidateFrame: j
        }
      }({
        videoRef: u,
        mediaElementVersion: h,
        project: eI,
        muted: H,
        volume: S,
        onError: (0, r.useCallback)((e, t) => {
          if (!F) return;
          let r = t ? "generation_mutation" === t.stage ? {
            title: "Không thể cập nhật tốc độ video",
            description: "project_tempo_generation_stale" === t.code ? "Project vừa thay đổi. Hãy thử áp dụng lại." : "Hãy thử lại."
          } : "plan_query" === t.stage ? {
            title: "Không thể tải thay đổi video",
            description: "Hãy thử lại."
          } : "window_query" === t.stage ? {
            title: "Không thể tải đoạn xem trước",
            description: "Hãy thử phát lại."
          } : "carrier_bind" === t.stage ? {
            title: "Không thể phát bản xem trước",
            description: "Hãy thử phát lại."
          } : "tts_schedule" === t.stage && "native_plan_only_preview_tts_artifact_missing" === t.code ? {
            title: "Cần tạo lại một đoạn âm thanh",
            description: "Một đoạn giọng đọc chưa sẵn sàng."
          } : "tts_schedule" === t.stage ? {
            title: "Không thể phát một đoạn giọng đọc",
            description: "Hãy thử phát lại."
          } : {
            title: "Không thể phát bản xem trước",
            description: "Hãy thử lại."
          } : (0, rI.getTerminalPreviewPlaybackIssue)(e);
          Y({
            videoId: F.id,
            source: "cue-preview",
            ...r
          })
        }, [F]),
        onReady: (0, r.useCallback)(() => {
          F && Y(e => e?.videoId === F.id && "cue-preview" === e.source ? null : e)
        }, [F])
      });
    (0, r.useEffect)(() => {
      let e;
      y.current?.dispose(), y.current = null;
      let t = eE.current,
        r = eR.current;
      if (!eM || !F?.projectRoot || !t || !r) return;
      try {
        var i;
        let a, n, s;
        a = (i = {
          projectRoot: F.projectRoot,
          document: t,
          schedule: r,
          resolveMediaSource: I.resolveMediaSrc,
          onCueError: (e, t) => {
            let r = "cueId" in e ? `Voice cue ${e.cueId}` : `Audio clip ${e.clipId}`;
            console.warn("NLE preview cue unavailable:", r, t), (0, tf.appendAppLog)("warn", `[nle-preview] ${r} could not be decoded or stretched.`).catch(() => void 0)
          }
        }).schedule ?? (0, ik.buildNleSequenceSchedule)(i.document), n = (i.createVoiceEngine ?? function(e) {
          let t = new globalThis.AudioContext;
          try {
            let r = new iH({
              document: e.document,
              schedule: e.schedule,
              sampleRate: t.sampleRate,
              resolveAudioSource: t => {
                var r;
                let i, a;
                return e.resolveMediaSource((r = e.projectRoot, i = r.replace(/\\/g, "/").replace(/\/+$/, ""), a = t.replace(/\\/g, "/").replace(/^\/+/, ""), `${i}/${a}`))
              },
              pcmCache: new ij({
                audioContext: t,
                maxEntries: 3
              }),
              stretchBackend: new iR,
              mixer: new iv({
                audioContext: t
              }),
              onCueError: e.onCueError
            });
            return {
              get schedule() {
                return r.schedule
              },
              setVolume(e, t) {
                r.setVolume(e, t)
              },
              ensureAudioRunning: () => r.ensureAudioRunning(),
              sync: (e, t) => r.sync(e, t),
              replaceSchedule: (e, t, i) => r.replaceSchedule(e, t, i),
              async dispose() {
                try {
                  await r.dispose()
                } finally {
                  "closed" !== t.state && await t.close()
                }
              }
            }
          } catch (e) {
            throw t.close().catch(() => {}), e
          }
        })({
          projectRoot: i.projectRoot,
          document: i.document,
          schedule: a,
          resolveMediaSource: i.resolveMediaSource,
          onCueError: i.onCueError
        }), s = !1, e = {
          get schedule() {
            return n.schedule
          },
          setVolume(e, t) {
            s || n.setVolume(e, t)
          },
          ensureAudioRunning: () => s ? Promise.resolve() : iq(n.ensureAudioRunning()),
          sync: (e, t = "tick") => s ? Promise.resolve() : iq(n.sync(e, t)),
          replaceSchedule: (e, t, r) => s ? Promise.resolve() : iq(n.replaceSchedule(t, r, e)),
          dispose() {
            s || (s = !0, n.dispose().catch(() => {}))
          }
        }
      } catch (e) {
        console.warn("NLE preview voice unavailable:", e);
        return
      }
      y.current = e;
      let a = W.useVideoStore.getState(),
        n = Math.max(0, 1e3 * a.currentTime);
      return e.sync({
        playheadMs: n,
        playing: a.isPlaying && iX(u.current),
        transportRate: a.playbackRate
      }, "schedule_commit").catch(e => {
        console.warn("NLE preview voice unavailable:", e)
      }), () => {
        e.dispose(), y.current === e && (y.current = null)
      }
    }, [F?.id, F?.projectRoot, eM]), (0, r.useEffect)(() => {
      let e = y.current;
      if (!e || !eM || !ek || !eP || e.schedule === eP) return;
      let t = W.useVideoStore.getState(),
        r = {
          playheadMs: Math.max(0, 1e3 * t.currentTime),
          playing: t.isPlaying && iX(u.current),
          transportRate: t.playbackRate
        };
      e.replaceSchedule(ek, eP, r).catch(e => {
        console.warn("NLE preview voice unavailable:", e)
      })
    }, [eM, ek, eP]), (0, r.useEffect)(() => {
      let e = y.current;
      e && ek && e.setVolume(ek.playback.translatedVolume * S, H)
    }, [H, ek, S]), (0, r.useEffect)(() => {
      let e = y.current;
      if (!e || !eM) return;
      let t = W.useVideoStore.getState();
      e.sync({
        playheadMs: Math.max(0, 1e3 * t.currentTime),
        playing: k && iX(u.current),
        transportRate: N
      }, "tick").catch(e => {
        console.warn("NLE preview voice unavailable:", e)
      })
    }, [eM, k, N]);
    let e6 = (0, r.useCallback)(e => {
      ec.current?.(), ec.current = null, e && F && (ec.current = (0, tv.registerProjectVisualDraft)(F.id, e.cancel))
    }, [F]);
    (0, r.useEffect)(() => () => {
      ec.current?.(), ec.current = null
    }, []);
    let e9 = eV ? e7.readModel.outputTimeMs / 1e3 : j,
      te = eV ? e7.readModel.playing : k,
      tt = eV ? e7.readModel.playbackRate : N,
      tr = (0, r.useMemo)(() => (0, tW.getRenderSubtitlesForVideo)(D, L, F?.id), [D, L, F?.id]),
      ti = (0, tW.hasRenderSubtitlesForVideo)(L, F?.id),
      ta = function(e, t) {
        let i = (0, r.useMemo)(() => t ? e.map(r_.displayCaptionInputFromSubtitle) : [], [t, e]),
          a = (0, r.useMemo)(() => i.map(r_.displayCaptionProjectionInputKey).join("\n"), [i]),
          [n, s] = (0, r.useState)(0);
        return (0, r.useEffect)(() => {
          let e = !1;
          return (0, r_.resolveDisplayCaptionProjections)(i).then(() => {
            e || s(e => e + 1)
          }).catch(e => {
            console.warn("Native display-caption projection failed; using literal preview text.", e)
          }), () => {
            e = !0
          }
        }, [a, i]), (0, r.useMemo)(() => (0, r_.readCachedDisplayCaptionProjections)(i), [a, i, n])
      }(tr, !eM && !ti),
      tn = {
        width: Math.round(F?.width || u.current?.videoWidth || 0),
        height: Math.round(F?.height || u.current?.videoHeight || 0)
      },
      ts = tn.width && tn.height ? (0, tY.canvasOutputSize)(tn.width, tn.height, eS.aspectRatio) : {
        width: 0,
        height: 0
      },
      to = tn.width && tn.height ? Math.min(J.width / tn.width, J.height / tn.height) : 0,
      tl = tn.width * to,
      tc = tn.height * to,
      td = J.offsetX + (J.width - tl) / 2,
      tu = J.offsetY + (J.height - tc) / 2,
      th = (0, re.getPreviewDisplayScale)(J, ts),
      tp = (0, rS.getSubtitlePreviewClasses)(z),
      tm = !!(eD && eW === eD && F?.subtitlesBurnedIntoVideo === !0),
      tx = a && s ? {
        onLayersChange: a,
        onSelectedLayerIdChange: s
      } : null,
      ty = (0, r.useCallback)(e => !(0, tY.isSourceRemovalExportLayer)(e) && ("cover" !== e.type || (0, re.getExportLayerRenderZIndex)(e) < re.EXPORT_SUBTITLE_LAYER_Z_INDEX), []),
      tw = (0, r.useCallback)(e => !(0, tY.isSourceRemovalExportLayer)(e) && ("cover" !== e.type || (0, re.getExportLayerRenderZIndex)(e) >= re.EXPORT_SUBTITLE_LAYER_Z_INDEX), []),
      tj = !ex || O && !Q && !e4 && !en && !eo,
      tk = !!(iK && eh && !Q && !e4),
      tS = !!(!tk && (en || Q || e4)),
      tN = eM && eP ? (0, ik.activeNleCaptionIdAtSequenceMs)(eP, 1e3 * e9) : null,
      tC = tN && ek ? ek.captions.find(e => e.captionId === tN) ?? null : null,
      tM = tC && F ? {
        id: tC.captionId,
        videoId: F.id,
        index: tC.sourceIndex,
        startTime: tC.sourceStartMs,
        endTime: tC.sourceEndMs,
        originalText: tC.originalText,
        translatedText: tC.translatedText,
        confidence: 1,
        style: z
      } : null,
      t_ = eM ? tM : eV ? tr.find(e => e.id === e7.activeCaptionId) ?? null : (0, tW.getActiveSubtitleAtTime)(tr, 1e3 * e9),
      tP = !!(!1 !== z.enabled && t_ && !tm),
      tT = eM ? tC ? tC.translatedText.trim() ? tC.translatedText : tC.originalText : "" : t_ ? ti ? (0, rM.getPreparedSubtitleDisplayText)(t_) : (0, rM.getTimedSubtitleDisplayText)(t_, e9, ta.get(t_.id)) : "",
      tE = ts.width,
      tR = ts.height,
      tI = (0, r.useMemo)(() => [...new Set((eM && ek ? ek.captions.map(e => e.translatedText.trim() ? e.translatedText : e.originalText) : tr.flatMap(e => {
        if (ti) return [(0, rM.getPreparedSubtitleDisplayText)(e)];
        let t = ta.get(e.id)?.chunks.map(e => e.text);
        return t?.length ? t : [(0, rM.getPreparedSubtitleDisplayText)(e)]
      })).map(e => e.trim()).filter(Boolean))], [tr, ta, eM, ti, ek]),
      tV = JSON.stringify([tI, z.fontFamily, z.fontSize, z.bold, z.italic, z.backgroundStyle, z.position, z.alignment, z.maxWidthPercent ?? null, z.outline, z.outlineWidth, z.shadow, z.offsetX ?? null, z.offsetY ?? null, tE, tR]);
    (0, r.useEffect)(() => {
      let e = !1;
      return Q ? () => {
        e = !0
      } : 0 !== tI.length && tE && tR ? ((0, rP.buildSubtitleLayoutSnapshot)(tI.map((e, t) => ({
        captionId: `preview-${t}`,
        text: e
      })), X.useSubtitleStore.getState().globalStyle, {
        width: tE,
        height: tR
      }).then(t => {
        e || eg(new Map(t.flatMap((e, t) => {
          let r = tI[t];
          return r ? [
            [r, e]
          ] : []
        })))
      }).catch(t => {
        console.error("Failed to measure subtitle preview layout:", t), e || eg(new Map)
      }), () => {
        e = !0
      }) : (eg(new Map), () => {
        e = !0
      })
    }, [tV, Q, tR, tE, tI]);
    let tA = em.get(tT.trim()) ?? null,
      tF = tA ? (0, rS.getSubtitlePreviewPositionPercent)(tA, z.offsetX ?? 0, z.offsetY ?? 0) : {
        left: 50,
        top: 50,
        baseLeft: 50,
        baseTop: 50
      },
      tD = tA ? (0, rS.getSubtitlePreviewContainerStyle)(tA, th) : {},
      tL = tA ? (0, rS.getSubtitlePreviewStyle)(z, tA, th) : {};
    (0, r.useEffect)(() => {
      let e = !1;
      if (!iK || !(0, I.isTauri)() || !tP || !t_ || !tA || !tT.trim() || !tE || !tR || Q || e4) return ep(null), () => {
        e = !0
      };
      let t = {
        ...t_,
        startTime: 0,
        endTime: 1e3,
        originalText: tT,
        translatedText: tT,
        style: z
      };
      return (0, tU.renderSubtitlePreviewFrame)([t], z, {
        width: tE,
        height: tR
      }, 0, [tA]).then(t => {
        e || ep((0, I.resolveMediaSrc)(t))
      }).catch(t => {
        console.error("Failed to render export subtitle preview frame:", t), e || ep(null)
      }), () => {
        e = !0
      }
    }, [t_, tT, tA, z, Q, e4, tR, tE, tP]);
    let tz = (0, r.useCallback)(e => {
      F && (F.translatedVideoPath === e ? eb(F.translatedVideoPath) : eb(e), eu(t => t === e ? null : t), Y(e => e?.videoId === F.id ? null : e), b.current = null, V(F.id, {
        previewVideoPath: void 0,
        previewSourcePath: void 0,
        ...F.draftVideoPath === e ? {
          draftVideoPath: void 0
        } : {},
        ...F.translatedVideoPath === e ? {
          translatedVideoPath: void 0,
          subtitlesBurnedIntoVideo: !1
        } : {}
      }))
    }, [F, V]);
    (0, r.useEffect)(() => {
      let e = !1;
      if (!F?.translatedVideoPath || !(0, I.isTauri)()) return () => {
        e = !0
      };
      let t = F.translatedVideoPath;
      return (0, I.fileExists)(t).then(r => {
        e || r || tz(t)
      }).catch(e => {
        console.warn("Could not verify generated playback artifact:", e)
      }), () => {
        e = !0
      }
    }, [F?.id, F?.translatedVideoPath, tz]);
    let tB = (0, r.useCallback)(async (e = {}) => {
        if (!F || !eB || !(0, I.isTauri)()) return "skipped";
        let t = e.force ?? !1,
          r = e.showIssue ?? !0;
        if (eG && !t) return "skipped";
        if (ed === eB) return "created";
        r && !eV && C(!1), eu(eB), r && Y({
          videoId: F.id,
          title: "Đang tạo bản preview tương thích",
          description: "Video gốc đã nhập được nhưng WebView không phát trực tiếp nguồn này. DichVideo đang chuẩn bị bản MP4 preview tương thích."
        });
        try {
          if (!await (0, I.fileExists)(eB)) {
            if (F.translatedVideoPath === eB && F.path) return tz(eB), "recovered";
            return r && Y({
              videoId: F.id,
              title: rX,
              description: rG
            }), "failed"
          }
          if (eV) return r && Y({
            videoId: F.id,
            title: "Không phát được bản xem trước",
            description: "Video nguồn không phát được trực tiếp trong WebView. Project vẫn được giữ nguyên để bạn thử lại hoặc xuất video."
          }), "failed";
          let e = await (0, tU.ensurePreviewVideo)(eB, {
            force: t
          });
          return V(F.id, {
            previewVideoPath: e,
            previewSourcePath: eB
          }), Y(null), "created"
        } catch (e) {
          if (console.error("Preview transcode failed:", e), r) {
            let t = e instanceof Error ? e.message : String(e),
              r = t.includes("Input video not found:"),
              i = t.includes("preview_transcode_duration_exceeded") ? rq : t.includes("preview_transcode_duration_unknown") ? rK : null;
            Y({
              videoId: F.id,
              title: r ? rX : i ? "Không tạo preview tương thích" : "Không thể tạo bản preview tương thích",
              description: r ? rG : i ?? `Video gốc đ\xe3 nhập được nhưng WebView kh\xf4ng ph\xe1t trực tiếp nguồn n\xe0y. Bộ xử l\xfd media FFmpeg/FFprobe kh\xf4ng tạo hoặc x\xe1c minh được bản preview H.264/AAC: ${t}`
            })
          }
          return "failed"
        } finally {
          eu(e => e === eB ? null : e)
        }
      }, [F, tz, eV, eG, ed, C, eB, V]),
      tO = (0, r.useCallback)(() => {
        Y(e => e?.videoId === F?.id ? null : e), ew(null), eK.retry()
      }, [F?.id, eK]),
      t$ = (0, r.useCallback)(() => {
        "supported" === eX && F?.path && eW === F.path && ew(F.path)
      }, [F?.path, eX, eW]),
      tH = (0, r.useCallback)(async () => {
        if (!u.current) return;
        let e = u.current;
        if (e3 && Y(null), eV) return void(te ? e7.pause() : e7.play());
        if (k) e.pause();
        else {
          if (eM && eP) {
            let t = Math.max(0, 1e3 * j);
            e.playbackRate = (0, ik.videoSpanAtSequenceMs)(eP, t).videoPlaybackRate * N;
            let r = y.current;
            if (r) {
              r.ensureAudioRunning().catch(e => {
                console.warn("NLE preview voice unavailable:", e)
              });
              try {
                await r.sync({
                  playheadMs: t,
                  playing: k && iX(e),
                  transportRate: N
                }, "play_start")
              } catch (e) {
                console.warn("NLE preview voice unavailable:", e)
              }
            }
          }
          try {
            await e.play()
          } catch (e) {
            if ((0, rI.isBenignPlaybackAbort)(e)) return void C(!1);
            console.error("Video playback failed:", e), C(!1), t$(), tB({
              force: !!(eG && eW === eG)
            }).then(e => {
              "skipped" === e && Y({
                videoId: F?.id ?? "unknown",
                ...(0, rI.getPlaybackIssue)(eW, F?.codec)
              })
            });
            return
          }
          C(!0);
          return
        }
        C(!k)
      }, [e3, F?.codec, F?.id, j, te, eM, k, eV, t$, eP, eW, N, tB, eG, C, e7]),
      tq = (0, r.useCallback)((e = "tick") => {
        let t, r = y.current,
          i = u.current;
        if (r && eM && eP && i) {
          try {
            t = (0, ik.sequenceMsAtSourceMs)(eP, 1e3 * i.currentTime)
          } catch {
            return
          }
          r.sync({
            playheadMs: t,
            playing: k && iX(i),
            transportRate: N
          }, e).catch(e => {
            console.warn("NLE preview voice unavailable:", e)
          })
        }
      }, [eM, k, eP, N]),
      tK = (0, r.useCallback)(() => {
        if (!eV && u.current) {
          let e = eM && eP ? (0, ik.sequenceMsAtSourceMs)(eP, 1e3 * u.current.currentTime) : 1e3 * u.current.currentTime;
          if (M(e / 1e3), eM && eP) {
            let t = (0, ik.videoSpanAtSequenceMs)(eP, e).videoPlaybackRate * N;
            Math.abs(u.current.playbackRate - t) > 1e-4 && (u.current.playbackRate = t);
            let r = y.current;
            r && r.sync({
              playheadMs: e,
              playing: k && iX(u.current),
              transportRate: N
            }, "tick").catch(e => {
              console.warn("NLE preview voice unavailable:", e)
            })
          }
        }
      }, [eM, k, eV, eP, N, M]);
    (0, r.useEffect)(() => {
      let e = u.current;
      if (w.current = !1, !e || !k || eV || "function" != typeof e.requestVideoFrameCallback) return;
      let t = !0,
        r = 0,
        i = e.currentTime,
        a = () => {
          t && (r += 1, e.requestVideoFrameCallback?.(a))
        };
      e.requestVideoFrameCallback(a);
      let n = window.setInterval(() => {
        let t = e.currentTime - i,
          a = r;
        r = 0, i = e.currentTime, e.paused || e.seeking || !(t > .05) || 0 !== a ? a > 0 && w.current && (w.current = !1, (0, tf.appendAppLog)("info", "[nle-preview] video frame stall recovered").catch(() => void 0)) : w.current || (w.current = !0, (0, tf.appendAppLog)("warn", `[nle-preview] video frame stall at t=${e.currentTime.toFixed(2)}s`).catch(() => void 0))
      }, 750);
      return () => {
        t = !1, window.clearInterval(n)
      }
    }, [k, eV, h]);
    let tX = (0, r.useCallback)(() => {
        let e = x.current,
          t = u.current;
        if (!e || !t || !F) return;
        let r = e.getBoundingClientRect(),
          i = r.width,
          a = r.height,
          n = F.width || t.videoWidth,
          s = F.height || t.videoHeight;
        if (!i || !a || !n || !s) return;
        let l = (0, tY.canvasOutputSize)(n, s, eS.aspectRatio),
          c = Math.min(i / l.width, a / l.height),
          d = l.width * c,
          h = l.height * c,
          p = {
            width: l.width,
            height: l.height,
            offsetX: 0,
            offsetY: 0
          };
        Z({
          width: d,
          height: h,
          offsetX: (i - d) / 2,
          offsetY: (a - h) / 2
        }), o?.(p)
      }, [F, o, eS.aspectRatio]),
      tG = (0, r.useCallback)((e, t, r) => {
        if (ek) {
          let i = "muted" === ek.playback.sourceAudioMode ? 0 : ek.playback.originalVolume;
          e.volume = Math.min(1, Math.max(0, i * t)), e.muted = r || i <= 0 || t <= 0;
          return
        }
        if (eI) {
          let i = (0, rW.resolvePlanOnlyPreviewMediaAudio)(eI.graph.projectAudio.gainPercent, t, r);
          e.volume = i.volume, e.muted = i.muted;
          return
        }
        if (eO) {
          let i = (0, tg.resolveSourcePreviewMediaAudio)(F, t, r);
          e.volume = i.volume, e.muted = i.muted;
          return
        }
        e.volume = Math.min(1, Math.max(0, t)), e.muted = r
      }, [F, eO, ek, eI]),
      tQ = (0, r.useCallback)(() => {
        if (u.current && (tG(u.current, S, H), !eV)) {
          let e = Math.max(0, 1e3 * j);
          u.current.playbackRate = eM && eP ? (0, ik.videoSpanAtSequenceMs)(eP, e).videoPlaybackRate * N : N
        }
        tX(), Y(e => e?.videoId === F?.id ? null : e)
      }, [F?.id, tG, j, H, eM, eV, eP, N, tX, S]),
      t0 = (0, r.useCallback)(() => {
        tX()
      }, [tX]),
      t1 = (0, r.useCallback)(() => {
        eV || C(!1), t$(), tB({
          force: !!(eG && eW === eG)
        }).then(e => {
          "skipped" === e && F && Y({
            videoId: F.id,
            ...(0, rI.getPlaybackIssue)(eW, F.codec)
          })
        })
      }, [F, eV, t$, eW, tB, eG, C]),
      t2 = (0, r.useCallback)(e => {
        let t = Math.max(0, 1e3 * e);
        if (eV) return void e7.seekOutputSeconds(t / 1e3);
        if (u.current && (u.current.currentTime = eM && eP ? (0, ik.sourceMsAtSequenceMs)(eP, t) / 1e3 : t / 1e3, M(t / 1e3), eM && eP)) {
          u.current.playbackRate = (0, ik.videoSpanAtSequenceMs)(eP, t).videoPlaybackRate * N;
          let e = y.current;
          e && e.sync({
            playheadMs: t,
            playing: k && iX(u.current),
            transportRate: N
          }, "user_seek").catch(e => {
            console.warn("NLE preview voice unavailable:", e)
          })
        }
      }, [eM, k, eV, eP, N, M, e7]),
      t5 = (0, r.useCallback)(e => {
        t2(e[0])
      }, [t2]);
    (0, r.useEffect)(() => {
      _ && (t2(_.outputSeconds), P(_.requestId))
    }, [P, t2, _]);
    let t3 = (0, r.useCallback)(e => {
        u.current && (tG(u.current, e[0], 0 === e[0]), T(e[0]), q(0 === e[0]))
      }, [tG, T]),
      t4 = (0, r.useCallback)(() => {
        u.current && (tG(u.current, S, !H), q(!H))
      }, [tG, H, S]),
      t8 = (0, r.useCallback)(e => {
        let t = parseFloat(e);
        if (!eV && u.current) {
          let e = Math.max(0, 1e3 * j);
          u.current.playbackRate = eM && eP ? (0, ik.videoSpanAtSequenceMs)(eP, e).videoPlaybackRate * t : t
        } else e7.setTransportRate(t);
        eV || E(t)
      }, [j, eM, eV, eP, E, e7]),
      t7 = (0, r.useCallback)(() => {
        rR(g.current).catch(e => {
          console.error("Fullscreen toggle failed:", e)
        })
      }, []),
      t6 = (0, r.useCallback)(() => {
        if (Q || e4 || en) {
          K && clearTimeout(K), $(!1);
          return
        }
        $(!0), K && clearTimeout(K), G(setTimeout(() => {
          te && $(!1)
        }, 3e3))
      }, [K, Q, e4, en, te]),
      t9 = (0, r.useCallback)((e, t) => {
        if (Q || e4 || en) return !0;
        let r = f.current?.getBoundingClientRect();
        return !!r && e >= r.left - 18 && e <= r.right + 18 && t >= r.top - 16 && t <= r.bottom + 16
      }, [Q, e4, en]),
      rr = (0, r.useCallback)(e => {
        if (t9(e.clientX, e.clientY)) {
          K && clearTimeout(K), $(!1);
          return
        }
        t6()
      }, [t6, K, t9]);
    (0, r.useEffect)(() => () => {
      K && clearTimeout(K)
    }, [K]), (0, r.useEffect)(() => {
      M(0), C(!1), eu(null), eb(null), ew(null), b.current = null
    }, [F?.id, M, C]), (0, r.useEffect)(() => {
      F && eB && (0, I.isTauri)() && "probing" !== eX && "supported" !== eX && (0, rI.shouldPreparePreviewBeforePlayback)(eB, F.codec) && !eG && ed !== eB && b.current !== eB && (b.current = eB, tB({
        force: !1,
        showIssue: !1
      }).then(e => {
        if ("failed" === e && b.current === eB && (b.current = null), "skipped" === e && "ineligible" !== eX && b.current === eB) {
          let e = "number" != typeof e1 || !Number.isFinite(e1) || e1 <= 0 ? "unknown" : e1 <= 3600 ? "allowed" : "too_long";
          "allowed" !== e && Y({
            videoId: F.id,
            title: "Không tạo preview tương thích",
            description: "too_long" === e ? rq : rK
          })
        }
      }))
    }, [F, eX, tB, eG, ed, e1, eB]), (0, r.useEffect)(() => {
      u.current && tG(u.current, S, H)
    }, [tG, H, eW, h, S]), (0, r.useEffect)(() => (tX(), window.addEventListener("resize", tX), () => window.removeEventListener("resize", tX)), [tX]), (0, r.useEffect)(() => {
      let e = x.current;
      if (!e || "u" < typeof ResizeObserver) return;
      let t = null,
        r = new ResizeObserver(() => {
          null !== t && cancelAnimationFrame(t), t = requestAnimationFrame(() => {
            t = null, tX()
          })
        });
      return r.observe(e), () => {
        r.disconnect(), null !== t && cancelAnimationFrame(t)
      }
    }, [tX]), (0, r.useEffect)(() => {
      if ("u" < typeof document) return;
      let e = () => {
        ef(rE(g.current, document)), requestAnimationFrame(tX)
      };
      return document.addEventListener("fullscreenchange", e), document.addEventListener("webkitfullscreenchange", e), document.addEventListener("msfullscreenchange", e), () => {
        document.removeEventListener("fullscreenchange", e), document.removeEventListener("webkitfullscreenchange", e), document.removeEventListener("msfullscreenchange", e)
      }
    }, [tX]), (0, r.useEffect)(() => {
      tX()
    }, [ex, tX]);
    let ri = (0, r.useCallback)(e => {
        v.current !== e && (v.current = e, ea(e))
      }, []),
      ra = (0, r.useCallback)(e => {
        J.width && J.height && (K && clearTimeout(K), $(!1), ee(!0), e.currentTarget.setPointerCapture(e.pointerId))
      }, [K, J.height, J.width]),
      rn = (0, r.useCallback)(e => {
        var t;
        let r, i, a, n;
        if (!Q || !x.current || !J.width || !J.height) return;
        let s = x.current.getBoundingClientRect(),
          o = e.clientX - s.left - J.offsetX,
          l = e.clientY - s.top - J.offsetY,
          c = (e.currentTarget.firstElementChild instanceof HTMLElement ? e.currentTarget.firstElementChild : e.currentTarget).getBoundingClientRect(),
          {
            xPercent: d,
            yPercent: u
          } = (r = (t = {
            pointerX: o,
            pointerY: l,
            viewportWidth: J.width,
            viewportHeight: J.height,
            subtitleWidth: c.width,
            subtitleHeight: c.height
          }).viewportWidth > 0 ? t.pointerX / t.viewportWidth * 100 : 50, i = t.viewportHeight > 0 ? t.pointerY / t.viewportHeight * 100 : 50, a = rC(t.subtitleWidth, t.viewportWidth), n = rC(t.subtitleHeight, t.viewportHeight), {
            xPercent: rN(r, a, 100 - a),
            yPercent: rN(i, n, 100 - n)
          }),
          h = rt({
            centerXPercent: d,
            targetXPercent: tF.baseLeft
          });
        ri(h.snapped), B({
          offsetX: h.xPercent - tF.baseLeft,
          offsetY: u - tF.baseTop,
          position: "bottom"
        })
      }, [Q, B, ri, tF.baseLeft, tF.baseTop, J.height, J.offsetX, J.offsetY, J.width]),
      rs = (0, r.useCallback)(e => {
        e.currentTarget.hasPointerCapture(e.pointerId) && e.currentTarget.releasePointerCapture(e.pointerId), ri(!1), ee(!1), Promise.resolve(l?.(X.useSubtitleStore.getState().globalStyle)).catch(() => void 0)
      }, [l, ri]),
      ro = (0, r.useCallback)((e, t) => {
        J.width && J.height && (e.preventDefault(), e.stopPropagation(), K && clearTimeout(K), $(!1), e.currentTarget.setPointerCapture(e.pointerId), er({
          mode: t,
          startClientX: e.clientX,
          startClientY: e.clientY,
          startMaxWidthPercent: z.maxWidthPercent ?? 90,
          startFontSize: z.fontSize
        }))
      }, [z.fontSize, z.maxWidthPercent, K, J.height, J.width]),
      rl = (0, r.useCallback)(e => {
        if (!et || !J.width || !J.height) return;
        e.preventDefault(), e.stopPropagation();
        let t = (e.clientX - et.startClientX) / J.width * 100,
          r = (e.clientY - et.startClientY) / J.height * 100;
        if (et.mode.startsWith("corner")) return void B({
          fontSize: function({
            startFontSize: e,
            deltaYPercent: t
          }) {
            return Math.round(rN((Number.isFinite(e) ? e : 18) - .5 * (Number.isFinite(t) ? t : 0), 10, 56))
          }({
            startFontSize: et.startFontSize,
            deltaYPercent: r
          })
        });
        let i = "width-left" === et.mode ? "left" : "right";
        B({
          maxWidthPercent: function({
            startMaxWidthPercent: e,
            deltaXPercent: t,
            edge: r
          }) {
            let i = Number.isFinite(e) ? e : 90,
              a = Number.isFinite(t) ? t : 0;
            return Math.round(rN("left" === r ? i - a : i + a, 25, 100))
          }({
            startMaxWidthPercent: et.startMaxWidthPercent,
            deltaXPercent: t,
            edge: i
          })
        })
      }, [B, et, J.height, J.width]),
      rc = (0, r.useCallback)(e => {
        e.preventDefault(), e.stopPropagation(), e.currentTarget.hasPointerCapture(e.pointerId) && e.currentTarget.releasePointerCapture(e.pointerId), er(null), Promise.resolve(l?.(X.useSubtitleStore.getState().globalStyle)).catch(() => void 0)
      }, [l]),
      rd = (0, t.jsx)(rH, {
        isFullscreen: ex,
        shouldShowPlayerControls: tj,
        currentTime: e9,
        duration: e0,
        isPlaying: te,
        isMuted: H,
        volume: S,
        playbackRate: tt,
        hasPlaybackIssue: !!e3,
        hasVideoSource: !!eU,
        onSeek: t5,
        onTogglePlay: tH,
        onToggleMute: t4,
        onVolumeChange: t3,
        onPlaybackRateChange: t8,
        onFullscreenToggle: t7
      });
    return (0, t.jsxs)("div", {
      ref: g,
      "data-video-player-shell": !0,
      "data-terminal-preview-status": eV ? e7.status : void 0,
      "data-nle-preview": eM ? "ready" : void 0,
      className: (0, R.cn)("relative flex flex-col bg-black overflow-hidden group", ex ? "h-screen w-screen rounded-none" : "rounded-xl"),
      onPointerMove: rr,
      onMouseLeave: () => te && $(!1),
      children: [(0, t.jsxs)("div", {
        ref: x,
        className: ex ? "relative flex h-full w-full flex-1 aspect-auto items-center justify-center bg-black" : "relative aspect-video bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center",
        children: [eU && J.width > 0 ? (0, t.jsx)("div", {
          className: "pointer-events-none absolute z-0 overflow-hidden",
          style: {
            left: J.offsetX,
            top: J.offsetY,
            width: J.width,
            height: J.height
          },
          children: (0, t.jsx)(tJ, {
            sourceVideo: u.current,
            isPlaying: te,
            currentTime: e9,
            canvas: eS
          })
        }) : null, eU ? (0, t.jsx)("video", {
          ref: m,
          crossOrigin: "anonymous",
          className: "absolute z-[1] object-contain",
          style: J.width > 0 ? {
            left: J.offsetX,
            top: J.offsetY,
            width: J.width,
            height: J.height
          } : {
            inset: 0,
            width: "100%",
            height: "100%"
          },
          preload: "auto",
          poster: eY ?? void 0,
          disablePictureInPicture: !!e8,
          onTimeUpdate: tK,
          onLoadedMetadata: tQ,
          onLoadedData: t0,
          onError: t1,
          onPlaying: () => tq("play_start"),
          onWaiting: () => tq("tick"),
          onSeeking: () => tq("tick"),
          onSeeked: () => tq("user_seek"),
          onEnded: () => {
            eV || C(!1)
          },
          children: (0, t.jsx)("source", {
            src: eU,
            type: eJ
          })
        }, `${F?.id??"video"}:${eW??""}`) : null, !eU && (0, t.jsx)("div", {
          className: "absolute inset-0 flex items-center justify-center",
          children: (0, t.jsxs)("div", {
            className: "text-center space-y-3",
            children: [(0, t.jsx)("div", {
              className: "w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto",
              children: "probing" === eX || "proxy_required" === eX ? (0, t.jsx)(c.Loader2, {
                className: "h-6 w-6 animate-spin text-white/45"
              }) : (0, t.jsx)(eT.Play, {
                className: "w-8 h-8 text-white/20"
              })
            }), (0, t.jsx)("div", {
              children: "probing" === eX || "proxy_required" === eX ? (0, t.jsx)("p", {
                className: "text-sm text-white/50",
                children: "probing" === eX ? "Đang kiểm tra preview HEVC" : "Đang chuẩn bị preview tương thích"
              }) : (0, t.jsxs)(t.Fragment, {
                children: [(0, t.jsx)("p", {
                  className: "text-sm text-white/40",
                  children: "Nhập video để bắt đầu"
                }), (0, t.jsx)("p", {
                  className: "text-xs text-white/20 mt-1",
                  children: "Kéo thả hoặc nhấn chọn file"
                })]
              })
            })]
          })
        }), eU && tl > 0 && tc > 0 ? (0, t.jsxs)("div", {
          className: "absolute z-[2]",
          style: {
            left: td,
            top: tu,
            width: tl,
            height: tc
          },
          children: [(0, t.jsx)(tZ, {
            sourceVideo: u.current,
            isPlaying: te,
            currentTime: e9,
            removal: eN,
            editable: !!(d && i === tY.SOURCE_REMOVAL_OVERLAY_ID),
            onCommit: d,
            onDraftRegistrationChange: e6
          }), eC.map(r => (0, t.jsx)(tZ, {
            sourceVideo: u.current,
            isPlaying: te,
            currentTime: e9,
            removal: (0, tY.sourceRemovalFromExportLayer)(r),
            editable: !!(tx && i === r.id),
            onCommit: t => tx?.onLayersChange(e.map(e => e.id === r.id ? {
              ...e,
              xPercent: t.xPercent,
              yPercent: t.yPercent,
              widthPercent: t.widthPercent,
              heightPercent: t.heightPercent
            } : e)),
            onDraftRegistrationChange: e6
          }, r.id))]
        }) : null, F && e3 && (0, t.jsx)("div", {
          className: "absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6",
          children: (0, t.jsxs)("div", {
            className: "max-w-lg rounded-2xl border border-white/10 bg-zinc-950/90 p-5 text-center shadow-2xl",
            children: [(0, t.jsx)("div", {
              className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300",
              children: eZ ? (0, t.jsx)(c.Loader2, {
                className: "h-5 w-5 animate-spin"
              }) : (0, t.jsx)(eT.Play, {
                className: "h-5 w-5"
              })
            }), (0, t.jsx)("h3", {
              className: "text-sm font-semibold text-white",
              children: e3.title
            }), (0, t.jsx)("p", {
              className: "mt-2 text-xs leading-5 text-white/70",
              children: e3.description
            }), (0, t.jsxs)("div", {
              className: "mt-4 rounded-lg bg-white/5 px-3 py-2 text-left text-[11px] text-white/60",
              children: [(0, t.jsxs)("div", {
                children: [(0, t.jsx)("span", {
                  className: "text-white/80",
                  children: "File:"
                }), " ", F?.name]
              }), (0, t.jsxs)("div", {
                children: [(0, t.jsx)("span", {
                  className: "text-white/80",
                  children: "Định dạng:"
                }), " ", eJ ?? "không xác định"]
              }), (0, t.jsxs)("div", {
                children: [(0, t.jsx)("span", {
                  className: "text-white/80",
                  children: "Codec:"
                }), " ", F?.codec ?? "không rõ"]
              })]
            }), "unsupported" === eX ? (0, t.jsx)(ip, {
              onRetry: tO
            }) : null]
          })
        }), tx && J.width > 0 && J.height > 0 ? (0, t.jsx)("div", {
          "data-export-layer-video-surface": "cover",
          className: "absolute pointer-events-none z-[5]",
          style: {
            left: `${J.offsetX}px`,
            top: `${J.offsetY}px`,
            width: `${J.width}px`,
            height: `${J.height}px`
          },
          children: (0, t.jsx)(rk, {
            layers: e,
            selectedLayerId: i,
            layerTypes: ["cover"],
            layerFilter: ty,
            projectAssetRoot: F?.projectRoot,
            renderSize: ts,
            mirrorPreview: {
              videoSrc: eU,
              posterSrc: eY,
              sourceVideo: u.current,
              currentTime: e9,
              isPlaying: te,
              playbackRate: tt
            },
            onLayersChange: tx.onLayersChange,
            onVisualGestureCommit: n,
            onVisualDraftChange: e6,
            onSelectedLayerIdChange: tx.onSelectedLayerIdChange,
            onInteractionChange: el,
            onCenterGuideChange: ri
          })
        }) : null, (Q || eo) && ei && J.width > 0 && J.height > 0 ? (0, t.jsx)("div", {
          "data-subtitle-center-guide": !0,
          "aria-hidden": "true",
          className: "pointer-events-none absolute z-30 w-px -translate-x-1/2 bg-primary/85 shadow-[0_0_10px_rgba(255,255,255,0.35)]",
          style: {
            left: `${J.offsetX+J.width/2}px`,
            top: `${J.offsetY}px`,
            height: `${J.height}px`
          }
        }) : null, tP && (0, t.jsxs)("div", {
          className: (0, R.cn)("absolute pointer-events-none flex justify-center", Q || e4 || en ? "z-40" : "z-10", "center" === z.position && "items-center"),
          style: {
            left: `${J.offsetX}px`,
            top: `${J.offsetY}px`,
            width: `${J.width||0}px`,
            height: `${J.height||0}px`
          },
          children: [tk ? (0, t.jsx)("img", {
            "data-export-rendered-subtitle-preview": !0,
            src: eh ?? void 0,
            alt: "",
            draggable: !1,
            className: "pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
          }) : null, (0, t.jsxs)("div", {
            ref: f,
            className: tp.container,
            onPointerEnter: () => {
              K && clearTimeout(K), es(!0), $(!1)
            },
            onPointerLeave: () => {
              es(!1), Q || e4 || t6()
            },
            onPointerDown: ra,
            onPointerMove: rn,
            onPointerUp: rs,
            onPointerCancel: rs,
            style: {
              left: `${tF.left}%`,
              top: `${tF.top}%`,
              ...tD,
              opacity: tk || !tA ? 0 : void 0
            },
            children: [(0, t.jsx)("p", {
              className: tp.text,
              style: tL,
              children: tA ? tA.lines.map((e, r) => (0, t.jsx)("span", {
                className: "block",
                children: e
              }, `${r}:${e}`)) : (0, t.jsx)("span", {
                className: "block",
                children: tT
              })
            }), tS ? (0, t.jsxs)(t.Fragment, {
              children: [(0, t.jsx)("div", {
                "data-subtitle-selection-box": !0,
                "aria-hidden": "true",
                className: "pointer-events-none absolute -inset-1 rounded-md border border-primary/90 shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_0_12px_rgba(255,255,255,0.18)]"
              }), (0, t.jsx)("button", {
                type: "button",
                "data-subtitle-resize-handle": "left",
                "aria-label": "Doi do rong phu de ben trai",
                className: "absolute left-0 top-1/2 z-10 h-5 w-2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none rounded-sm border border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                onPointerDown: e => ro(e, "width-left"),
                onPointerMove: rl,
                onPointerUp: rc,
                onPointerCancel: rc
              }), (0, t.jsx)("button", {
                type: "button",
                "data-subtitle-resize-handle": "right",
                "aria-label": "Doi do rong phu de ben phai",
                className: "absolute right-0 top-1/2 z-10 h-5 w-2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none rounded-sm border border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                onPointerDown: e => ro(e, "width-right"),
                onPointerMove: rl,
                onPointerUp: rc,
                onPointerCancel: rc
              }), (0, t.jsx)("button", {
                type: "button",
                "data-subtitle-resize-handle": "corner-top-left",
                "aria-label": "Doi co chu phu de",
                className: "absolute left-0 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize touch-none rounded-[3px] border border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                onPointerDown: e => ro(e, "corner-top-left"),
                onPointerMove: rl,
                onPointerUp: rc,
                onPointerCancel: rc
              }), (0, t.jsx)("button", {
                type: "button",
                "data-subtitle-resize-handle": "corner-top-right",
                "aria-label": "Doi co chu phu de",
                className: "absolute right-0 top-0 z-10 h-3 w-3 -translate-y-1/2 translate-x-1/2 cursor-nesw-resize touch-none rounded-[3px] border border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                onPointerDown: e => ro(e, "corner-top-right"),
                onPointerMove: rl,
                onPointerUp: rc,
                onPointerCancel: rc
              }), (0, t.jsx)("button", {
                type: "button",
                "data-subtitle-resize-handle": "corner-bottom-left",
                "aria-label": "Doi co chu phu de",
                className: "absolute bottom-0 left-0 z-10 h-3 w-3 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize touch-none rounded-[3px] border border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                onPointerDown: e => ro(e, "corner-bottom-left"),
                onPointerMove: rl,
                onPointerUp: rc,
                onPointerCancel: rc
              }), (0, t.jsx)("button", {
                type: "button",
                "data-subtitle-resize-handle": "corner-bottom-right",
                "aria-label": "Doi co chu phu de",
                className: "absolute bottom-0 right-0 z-10 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-nwse-resize touch-none rounded-[3px] border border-white bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                onPointerDown: e => ro(e, "corner-bottom-right"),
                onPointerMove: rl,
                onPointerUp: rc,
                onPointerCancel: rc
              })]
            }) : null]
          })]
        }), tx && J.width > 0 && J.height > 0 ? (0, t.jsx)("div", {
          "data-export-layer-video-surface": "watermark",
          className: "absolute pointer-events-none z-[40]",
          style: {
            left: `${J.offsetX}px`,
            top: `${J.offsetY}px`,
            width: `${J.width}px`,
            height: `${J.height}px`
          },
          children: (0, t.jsx)(rk, {
            layers: e,
            selectedLayerId: i,
            layerTypes: ["cover", "text", "image"],
            layerFilter: tw,
            projectAssetRoot: F?.projectRoot,
            renderSize: ts,
            mirrorPreview: {
              videoSrc: eU,
              posterSrc: eY,
              sourceVideo: u.current,
              currentTime: e9,
              isPlaying: te,
              playbackRate: tt
            },
            onLayersChange: tx.onLayersChange,
            onVisualGestureCommit: n,
            onVisualDraftChange: e6,
            onSelectedLayerIdChange: tx.onSelectedLayerIdChange,
            onInteractionChange: el,
            onCenterGuideChange: ri
          })
        }) : null, e8 ? (0, t.jsx)(rY, {
          videoRef: u,
          videoViewport: J,
          watermark: e8
        }, eW) : null, ex ? rd : null]
      }), ex ? null : rd]
    })
  }
  var iW = e.i(68270),
    iU = e.i(35952),
    iY = e.i(99847);
  let iJ = (0, h.default)("file-down", [
      ["path", {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        key: "1oefj6"
      }],
      ["path", {
        d: "M14 2v5a1 1 0 0 0 1 1h5",
        key: "wfsgrz"
      }],
      ["path", {
        d: "M12 18v-6",
        key: "17g6i2"
      }],
      ["path", {
        d: "m9 15 3 3 3-3",
        key: "1npd3o"
      }]
    ]),
    iZ = (0, h.default)("file-up", [
      ["path", {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
        key: "1oefj6"
      }],
      ["path", {
        d: "M14 2v5a1 1 0 0 0 1 1h5",
        key: "wfsgrz"
      }],
      ["path", {
        d: "M12 12v6",
        key: "3ahymv"
      }],
      ["path", {
        d: "m15 15-3-3-3 3",
        key: "15xj92"
      }]
    ]);
  var iQ = e.i(53138),
    i0 = e.i(96725);
  let i1 = Object.freeze({
    srt_import_stale: "File SRT hoặc project đã thay đổi sau khi xem trước. Hãy xem trước lại.",
    srt_import_unreadable: "Không đọc được file SRT.",
    srt_import_empty: "File SRT trống.",
    srt_import_malformed: "File SRT không đúng định dạng.",
    srt_import_encoding_unsupported: "File SRT dùng encoding chưa được hỗ trợ.",
    srt_import_timing_invalid: "Timing trong file SRT không hợp lệ (không tăng dần hoặc chồng lấn).",
    srt_import_retime_not_invertible: "Project đang chỉnh tốc độ — không ánh xạ được timing của SRT; tắt chỉnh tốc độ hoặc chỉnh tay.",
    srt_import_no_snapshot: "Chưa có bản lưu phụ đề nào để khôi phục.",
    srt_import_canceled: "Đã hủy nhập SRT.",
    srt_import_not_implemented: "Tính năng nhập SRT chưa sẵn sàng trong bản này."
  });

  function i2(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : null
  }

  function i5(e, ...t) {
    if (!e) return null;
    for (let r of t) {
      let t = e[r];
      if ("string" == typeof t && t.trim()) return t.trim()
    }
    return null
  }

  function i3(e) {
    if (!e || "{" !== e[0]) return null;
    try {
      let t = JSON.parse(e);
      return t && "object" == typeof t && !Array.isArray(t) ? t : null
    } catch {
      return null
    }
  }

  function i4(e) {
    let t = i2(e),
      r = t ? i5(t, "message", "error", "detail") : "string" == typeof e && e.trim() ? e.trim() : null,
      i = i3(r);
    return i5(t, "code", "error_code") ?? i5(i, "code", "error_code") ?? (r && /^srt_import_[a-z0-9_]+$/.test(r) ? r : null)
  }

  function i8(e) {
    return "srt_import_stale" === i4(e)
  }

  function i7(e) {
    let t = i2(e),
      r = i3(t ? i5(t, "message", "error", "detail") : "string" == typeof e && e.trim() ? e.trim() : null),
      i = i5(t, "customerMessage", "customer_message") ?? i5(r, "customerMessage", "customer_message");
    if (i && i.length <= 240 && !/[\u0000-\u001f\u007f]/.test(i)) return i;
    let a = i4(e),
      n = a && i1[a];
    return n || "Không nhập được file SRT. Hãy thử lại."
  }

  function i6({
    open: e,
    onOpenChange: i,
    videoId: a,
    srtPath: n,
    snapshotExists: s,
    disabled: o = !1,
    onApplied: l
  }) {
    let [d, u] = (0, r.useState)("previewing"), [h, p] = (0, r.useState)(null), [m, g] = (0, r.useState)(null), [x, f] = (0, r.useState)(!1), v = (0, r.useCallback)(async () => {
      if (n) {
        u("previewing"), p(null), g(null), f(!1);
        try {
          let e = await (0, i0.srtImportPreview)(a, n);
          p(e), u("ready")
        } catch (e) {
          g(i7(e)), f(i8(e)), u("error")
        }
      }
    }, [n, a]);
    (0, r.useEffect)(() => {
      if (!e || !n) return;
      let t = setTimeout(() => void v(), 0);
      return () => clearTimeout(t)
    }, [e, n, v]);
    let b = (0, r.useCallback)(async () => {
        if (n && h && "ready" === d) {
          u("applying"), g(null);
          try {
            let e = await (0, i0.srtImportApply)(a, n, h);
            l?.(e), i(!1)
          } catch (t) {
            g(i7(t));
            let e = i8(t);
            f(e), u(e ? "error" : "ready")
          }
        }
      }, [l, i, d, h, n, a]),
      w = "applying" === d,
      k = "previewing" === d;
    return (0, t.jsx)(j.Dialog, {
      open: e,
      onOpenChange: w ? () => {} : i,
      children: (0, t.jsxs)(j.DialogContent, {
        "data-srt-import-dialog": !0,
        onKeyDown: e => {
          "Enter" !== e.key || "ready" !== d || o || (e.preventDefault(), b())
        },
        children: [(0, t.jsxs)(j.DialogHeader, {
          children: [(0, t.jsx)(j.DialogTitle, {
            children: "Nhập SRT đã dịch"
          }), (0, t.jsx)(j.DialogDescription, {
            children: function(e) {
              if (!e) return "";
              let t = e.replace(/\\/g, "/");
              return t.slice(t.lastIndexOf("/") + 1)
            }(n) || "Chọn file phụ đề đã dịch để nhập vào video này."
          })]
        }), k ? (0, t.jsxs)("div", {
          className: "flex items-center gap-2 py-4 text-sm text-muted-foreground",
          children: [(0, t.jsx)(c.Loader2, {
            className: "h-4 w-4 animate-spin"
          }), "Đang đọc và kiểm tra file SRT…"]
        }) : "error" === d ? (0, t.jsxs)("div", {
          className: "space-y-3",
          children: [(0, t.jsx)("p", {
            className: "text-sm text-destructive",
            children: m
          }), x ? (0, t.jsx)("p", {
            className: "text-xs text-muted-foreground",
            children: "File SRT hoặc project vừa thay đổi — kết quả xem trước không còn khớp."
          }) : null]
        }) : h ? (0, t.jsxs)("div", {
          className: "space-y-3 text-sm",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between gap-3",
            children: [(0, t.jsx)("span", {
              className: "text-muted-foreground",
              children: "Chế độ áp dụng"
            }), (0, t.jsx)("span", {
              className: "rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
              children: function(e) {
                switch (e) {
                  case "match":
                    return "Khớp phụ đề hiện có";
                  case "replace":
                    return "Thay toàn bộ phụ đề";
                  default:
                    return "Phụ đề mới"
                }
              }(h.matchMode)
            })]
          }), (0, t.jsx)("p", {
            className: "text-xs text-muted-foreground",
            children: function(e) {
              switch (e) {
                case "match":
                  return "Thay thế văn bản đã dịch — giữ nguyên timing và văn bản gốc của app";
                case "replace":
                  return "Thay thế toàn bộ track phụ đề bằng timing và nội dung của file SRT";
                default:
                  return "Thêm track phụ đề mới từ file SRT (project chưa có phụ đề)"
              }
            }(h.matchMode)
          }), (0, t.jsxs)("div", {
            className: "grid grid-cols-2 gap-2 rounded-md border border-border/70 bg-muted/20 p-2.5 text-xs",
            children: [(0, t.jsxs)("div", {
              children: [(0, t.jsx)("span", {
                className: "text-muted-foreground",
                children: "Số câu: "
              }), (0, t.jsx)("span", {
                className: "font-medium tabular-nums",
                children: h.cueCount
              })]
            }), (0, t.jsxs)("div", {
              children: [(0, t.jsx)("span", {
                className: "text-muted-foreground",
                children: "Thời lượng: "
              }), (0, t.jsx)("span", {
                className: "font-medium tabular-nums",
                children: (0, R.formatTime)(h.durationMs)
              })]
            })]
          }), h.clippedCount > 0 || h.omittedCount > 0 ? (0, t.jsxs)("div", {
            className: "flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200",
            children: [(0, t.jsx)(iQ.AlertTriangle, {
              className: "mt-0.5 h-3.5 w-3.5 shrink-0"
            }), (0, t.jsxs)("span", {
              children: [
                [h.clippedCount > 0 ? `${h.clippedCount} c\xe2u sẽ bị cắt ở cuối video` : null, h.omittedCount > 0 ? `${h.omittedCount} c\xe2u nằm ngo\xe0i video sẽ bị bỏ` : null].filter(Boolean).join(", "), "."
              ]
            })]
          }) : null, h.clearsRetime ? (0, t.jsxs)("div", {
            className: "flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200",
            children: [(0, t.jsx)(iQ.AlertTriangle, {
              className: "mt-0.5 h-3.5 w-3.5 shrink-0"
            }), (0, t.jsx)("span", {
              children: "Project đang bật kéo giãn — áp dụng SRT sẽ tắt kéo giãn và giữ timing của file làm timeline chuẩn; bạn có thể bật lại sau khi tạo giọng."
            })]
          }) : null, h.firstCues.length > 0 ? (0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [(0, t.jsx)("p", {
              className: "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
              children: "Các câu đầu tiên"
            }), (0, t.jsx)("ul", {
              className: "space-y-1 rounded-md border border-border/70 p-2",
              children: h.firstCues.slice(0, 3).map(e => (0, t.jsxs)("li", {
                className: "grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 text-xs",
                children: [(0, t.jsxs)("span", {
                  className: "font-mono tabular-nums text-muted-foreground",
                  children: [(0, R.formatTime)(e.startMs), " → ", (0, R.formatTime)(e.endMs)]
                }), (0, t.jsx)("span", {
                  className: "truncate",
                  children: e.text
                })]
              }, e.index))
            })]
          }) : null, h.warnings.length > 0 ? (0, t.jsx)("ul", {
            className: "space-y-1 text-xs text-muted-foreground",
            children: h.warnings.map((e, r) => (0, t.jsxs)("li", {
              className: "flex items-start gap-1.5",
              children: [(0, t.jsx)(iQ.AlertTriangle, {
                className: "mt-0.5 h-3 w-3 shrink-0 text-amber-600"
              }), e]
            }, r))
          }) : null, (0, t.jsxs)("p", {
            className: (0, R.cn)("rounded-md bg-muted/30 p-2.5 text-[11px] leading-relaxed text-muted-foreground"),
            children: ["Nhập SRT không tạo giọng đọc — không tốn chi phí TTS.", " ", s ? "Đã có bản lưu phụ đề từ trước lần nhập đầu tiên; các chỉnh sửa sau lần nhập đó không nằm trong bản lưu — khôi phục sẽ quay về trạng thái trước lần nhập đầu tiên." : "Trước khi áp dụng, app sẽ lưu một bản phụ đề hiện tại để có thể khôi phục lại sau."]
          }), m ? (0, t.jsx)("p", {
            className: "text-sm text-destructive",
            children: m
          }) : null]
        }) : null, (0, t.jsxs)(j.DialogFooter, {
          children: [(0, t.jsx)(y.Button, {
            type: "button",
            variant: "outline",
            disabled: w,
            onClick: () => i(!1),
            children: "Hủy"
          }), "error" === d ? (0, t.jsxs)(y.Button, {
            type: "button",
            variant: "default",
            onClick: () => void v(),
            children: [(0, t.jsx)(iZ, {
              className: "h-4 w-4"
            }), "Xem trước lại"]
          }) : (0, t.jsxs)(y.Button, {
            type: "button",
            variant: "default",
            disabled: !h || w || k || o,
            onClick: () => void b(),
            children: [w ? (0, t.jsx)(c.Loader2, {
              className: "h-4 w-4 animate-spin"
            }) : null, "Áp dụng"]
          })]
        })]
      })
    })
  }
  var i9 = e.i(43519);
  let ae = "Đang dịch...";
  var at = e.i(61010),
    ar = e.i(31868);
  async function ai(e, t, r) {
    var i;
    let a = (0, ar.subtitlesToSrt)(t, r),
      n = "originalText" === r ? "SRT gốc" : "SRT đã dịch";
    if (!a) return void await (0, I.showMessage)(`Chưa c\xf3 ${n}`, `Phụ đề hiện tại chưa c\xf3 nội dung ${n.toLowerCase()} để xuất.`, "warning");
    let s = (i = e.name, "originalText" === r ? (0, ar.originalSrtFileNameForVideo)(i) : (0, ar.translatedSrtFileNameForVideo)(i));
    try {
      if (!(0, I.isTauri)()) {
        ! function(e, t) {
          if ("u" < typeof document) return;
          let r = URL.createObjectURL(new Blob([t], {
              type: "text/plain;charset=utf-8"
            })),
            i = document.createElement("a");
          i.href = r, i.download = e, i.style.display = "none", document.body.appendChild(i), i.click(), i.remove(), URL.revokeObjectURL(r)
        }(s, a), await (0, I.showMessage)(`Đ\xe3 xuất ${n}`, `Đ\xe3 tải file ${s}.`, "info");
        return
      }
      let e = await (0, I.saveFileDialog)(s, [{
        name: "SRT",
        extensions: ["srt"]
      }]);
      if (!e) return;
      await (0, tU.exportSubtitles)(t.map(e => ({
        subtitle: e,
        text: (0, ar.normalizeSubtitleTextForSrt)(e[r])
      })).filter(({
        text: e
      }) => e.length > 0).map(({
        subtitle: e,
        text: t
      }, r) => ({
        ...e,
        index: r + 1,
        originalText: t,
        translatedText: ""
      })), "srt", e, null), await (0, I.showMessage)(`Đ\xe3 xuất ${n}`, `Đ\xe3 lưu file ${e.split(/[\\/]/).pop()||e}.`, "info")
    } catch (e) {
      console.error("Failed to export subtitle SRT file:", e), await (0, I.showMessage)(`Kh\xf4ng xuất được ${n}`, e instanceof Error ? e.message : "Không thể ghi file SRT. Hãy chọn lại nơi lưu và thử lại.", "error")
    }
  }
  let aa = "78px minmax(0, 1fr) minmax(0, 1fr) 72px",
    an = r.default.memo(function({
      highlightedCueIds: e = new Set,
      tempoMarkerCueIds: a = new Set
    }) {
      let n = (0, X.useSubtitleStore)(e => e.subtitles),
        s = (0, X.useSubtitleStore)(e => e.selectedSubtitleId),
        o = (0, X.useSubtitleStore)(e => e.setSelectedSubtitle),
        l = (0, X.useSubtitleStore)(e => e.updateSubtitleText),
        c = (0, X.useSubtitleStore)(e => e.toggleSubtitleExcluded),
        u = (0, W.useVideoStore)(e => e.currentTime),
        h = (0, W.useVideoStore)(e => e.requestPreviewSeek),
        p = (0, W.useVideoStore)(e => e.commitProjectCaptionText),
        m = (0, W.useVideoStore)(e => e.refreshNativeTtsForEditedSubtitles),
        g = (0, W.useVideoStore)(e => e.videos.find(t => t.id === e.activeVideoId)),
        f = (0, W.useVideoStore)(e => e.updateVideo),
        v = (0, X.useSubtitleStore)(e => e.setSubtitles),
        [b, w] = (0, r.useState)(null),
        [j, k] = (0, r.useState)(""),
        [S, N] = (0, r.useState)(null),
        [C, M] = (0, r.useState)({
          scrollTop: 0,
          height: 420
        }),
        [_, P] = (0, r.useState)(null),
        [E, V] = (0, r.useState)(!1),
        [A, F] = (0, r.useState)(!1),
        [D, L] = (0, r.useState)(!1),
        z = (0, r.useRef)(null),
        B = g?.projectRoot,
        O = !!(g && (["importing", "extracting_audio", "transcribing", "translating", "generating_tts", "exporting"].includes(g.status) || g.nativeProjectReadiness?.exportState.state === "exporting")),
        $ = !g?.nleDocument || O || D,
        H = (0, r.useCallback)(async () => {
          if (!B) return void F(!1);
          let e = B.replace(/[\\/]+$/, "");
          F(await (0, I.fileExists)(`${e}/srt-import-backup.json`))
        }, [B]);
      (0, r.useEffect)(() => {
        H()
      }, [H]);
      let q = (0, r.useCallback)(e => {
          $ ? i.toast.error("Không thể nhập SRT lúc này", {
            description: "Project đang xử lý hoặc chưa sẵn sàng. Hãy thử lại sau."
          }) : (P(e), V(!0))
        }, [$]),
        K = (0, r.useCallback)(() => {
          (0, I.openFileDialog)([{
            name: "Phụ đề SRT",
            extensions: ["srt"]
          }]).then(e => {
            e && q(e)
          }).catch(() => void 0)
        }, [q]);
      (0, r.useEffect)(() => {
        let e;
        if (!(0, I.isTauri)()) return;
        let t = !1;
        return (0, iW.getCurrentWebview)().onDragDropEvent(async e => {
          let t = e.payload;
          if ("drop" !== t.type || !t.position) return;
          let r = (t.paths ?? []).find(e => /\.srt$/i.test(e.trim())),
            i = z.current;
          if (!r || !i) return;
          let a = await (0, iU.getCurrentWindow)().scaleFactor().catch(() => window.devicePixelRatio || 1),
            n = i.getBoundingClientRect(),
            s = t.position.x / a,
            o = t.position.y / a;
          s >= n.left && s <= n.right && o >= n.top && o <= n.bottom && q(r)
        }).then(r => {
          t ? r() : e = r
        }).catch(() => void 0), () => {
          t = !0, e?.()
        }
      }, [q]);
      let G = (0, r.useCallback)(async () => {
          if (!g) return;
          let e = await (0, tb.hydrateNleProject)(g.id);
          f(g.id, {
            nleDocument: e,
            originalAudioVolume: e.playback.originalVolume
          }), v((0, at.mergeVideoSubtitles)(X.useSubtitleStore.getState().subtitles, g.id, (0, tb.nleCaptionsToSubtitles)(g.id, e))), H()
        }, [g, H, v, f]),
        U = (0, r.useCallback)(() => {
          G().then(() => i.toast.success("Đã nhập phụ đề từ file SRT")).catch(() => i.toast.error("Đã nhập SRT nhưng chưa đọc lại được project."))
        }, [G]),
        Y = (0, r.useCallback)(() => {
          g && !D && (0, I.askMessage)("Khôi phục phụ đề", "Khôi phục phụ đề và giọng đọc đã tạo về trạng thái trước lần nhập SRT đầu tiên — kể cả giọng đã đổi sau đó. Các chỉnh sửa sau lần nhập đó không nằm trong bản lưu. Câu nào file audio gốc không còn sẽ được đánh dấu “Cần tạo lại giọng”.", "warning", {
            confirmLabel: "Khôi phục",
            cancelLabel: "Hủy"
          }).then(async e => {
            if (e) {
              L(!0);
              try {
                let e = await (0, i0.srtImportRestore)(g.id);
                await G(), i.toast.success(`Đ\xe3 kh\xf4i phục ${e.restoredCaptions} c\xe2u phụ đề` + (e.relinkedVoiceCues > 0 ? ` v\xe0 ${e.relinkedVoiceCues} giọng đọc` : "") + (e.staleVoiceCues > 0 ? `; ${e.staleVoiceCues} c\xe2u cần tạo lại giọng` : ""))
              } catch (e) {
                i.toast.error("Không khôi phục được phụ đề", {
                  description: i7(e)
                })
              } finally {
                L(!1)
              }
            }
          }).catch(() => void 0)
        }, [g, G, D]),
        J = (0, r.useMemo)(() => (0, tW.getSubtitlesForVideo)(n, g?.id), [g, n]),
        Z = (0, r.useMemo)(() => (0, ar.subtitlesToSrt)(J, "originalText").length > 0, [J]),
        Q = (0, r.useCallback)(() => {
          g && ai(g, J, "originalText")
        }, [g, J]),
        ee = (0, r.useMemo)(() => J.filter(e => "default_voice" === e.ttsResolution || "final_voice" === e.ttsResolution).length, [J]),
        et = (0, r.useMemo)(() => J.filter(e => "missing_audio" === e.ttsResolution).length, [J]),
        er = (0, r.useMemo)(() => g?.nleDocument ? (0, ik.buildNleSequenceSchedule)(g.nleDocument) : null, [g?.nleDocument]),
        ei = (0, r.useMemo)(() => er ? (0, ik.activeNleCaptionIdAtSequenceMs)(er, 1e3 * u) : (0, tW.activeSubtitleIdAtTime)(J, 1e3 * u), [u, er, J]),
        ea = (0, r.useMemo)(() => {
          let e = Math.floor(C.scrollTop / 56),
            t = Math.ceil(C.height / 56);
          return {
            start: Math.max(0, e - 8),
            end: Math.min(J.length, e + t + 8)
          }
        }, [J.length, C]),
        en = (0, r.useMemo)(() => J.slice(ea.start, ea.end), [J, ea]);
      (0, r.useEffect)(() => {
        if (!S) return;
        let e = () => {
          M(() => ({
            scrollTop: S.scrollTop,
            height: S.clientHeight || 420
          }))
        };
        e();
        let t = new ResizeObserver(e);
        return t.observe(S), () => t.disconnect()
      }, [S]);
      let es = (0, r.useCallback)(e => {
        let t = e.currentTarget;
        M({
          scrollTop: t.scrollTop,
          height: t.clientHeight || 420
        })
      }, []);
      (0, r.useEffect)(() => {
        s && (J.some(e => e.id === s) || o(null))
      }, [J, s, o]), (0, r.useEffect)(() => {
        !s && J.length > 0 && o(J[0].id)
      }, [J, s, o]);
      let eo = (e, t) => {
          w(`${e.id}-${t}`), k(e[t])
        },
        el = (e, t) => {
          l(e, t, j.trim()), w(null), "translatedText" === t && g && p(g.id).catch(e => {
            i.toast.error("Không lưu được câu phụ đề", {
              description: (0, i9.editedSubtitleTtsUserMessage)(e)
            })
          })
        },
        ec = e => {
          h((er ? (0, ik.sequenceMsAtSourceMs)(er, e) : e) / 1e3)
        };
      return (0, t.jsxs)("div", {
        className: "flex h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card",
        children: [ee > 0 || et > 0 ? (0, t.jsx)("div", {
          "data-tts-fallback-banner": !0,
          className: "flex items-center justify-between border-b border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-200",
          children: (0, t.jsxs)("div", {
            className: "flex items-center gap-2",
            children: [(0, t.jsx)(iY.AlertCircle, {
              className: "h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            }), (0, t.jsx)("span", {
              children: ee > 0 && et > 0 ? `${ee} c\xe2u d\xf9ng giọng thay thế, ${et} c\xe2u chưa c\xf3 audio. Bạn c\xf3 thể tạo lại từng c\xe2u.` : ee > 0 ? `${ee} c\xe2u d\xf9ng giọng thay thế. Bạn c\xf3 thể tạo lại từng c\xe2u.` : `${et} c\xe2u chưa c\xf3 audio. Bạn c\xf3 thể tạo lại từng c\xe2u.`
            })]
          })
        }) : null, (0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-2 border-b border-border px-3 py-1.5",
          children: [(0, t.jsx)("span", {
            className: "text-[11px] font-medium text-muted-foreground",
            children: "Phụ đề"
          }), (0, t.jsxs)("div", {
            className: "flex items-center gap-1.5",
            children: [A ? (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "ghost",
              className: "h-7 px-2 text-[11px] text-muted-foreground",
              disabled: $,
              onClick: Y,
              title: "Quay về phụ đề trước lần nhập SRT đầu tiên",
              children: [(0, t.jsx)(ek.RotateCcw, {
                className: "h-3.5 w-3.5"
              }), "Khôi phục phụ đề trước khi nhập SRT"]
            }) : null, (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "ghost",
              className: "h-7 px-2 text-[11px]",
              disabled: !Z,
              onClick: Q,
              title: "Xuất phụ đề gốc (.srt) — văn bản ngôn ngữ nguồn",
              children: [(0, t.jsx)(iJ, {
                className: "h-3.5 w-3.5"
              }), "Xuất SRT gốc"]
            }), (0, t.jsxs)(y.Button, {
              type: "button",
              size: "sm",
              variant: "ghost",
              className: "h-7 px-2 text-[11px]",
              disabled: $,
              onClick: K,
              title: "Nhập file phụ đề đã dịch (.srt) — không tạo giọng đọc",
              children: [(0, t.jsx)(iZ, {
                className: "h-3.5 w-3.5"
              }), "Nhập SRT đã dịch"]
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "grid items-center border-b border-border bg-muted/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
          style: {
            gridTemplateColumns: aa
          },
          children: [(0, t.jsx)("span", {
            children: "Time"
          }), (0, t.jsx)("span", {
            children: "Văn bản gốc"
          }), (0, t.jsx)("span", {
            children: "Văn bản dịch"
          }), (0, t.jsx)("span", {
            "aria-hidden": "true"
          })]
        }), (0, t.jsx)("div", {
          ref: z,
          className: "flex min-h-0 flex-1 flex-col",
          children: (0, t.jsx)(T.ScrollArea, {
            className: "flex-1",
            viewportRef: N,
            onViewportScroll: es,
            children: (0, t.jsx)("div", {
              "data-subtitle-virtualized": "true",
              className: "relative",
              style: {
                height: 56 * J.length + 16
              },
              children: en.map((r, n) => {
                let u = ea.start + n,
                  h = s === r.id,
                  p = ei === r.id,
                  f = !0 === r.excluded,
                  v = b === `${r.id}-originalText`,
                  y = b === `${r.id}-translatedText`,
                  w = e.has(r.id),
                  S = a.has(r.id),
                  N = r.fieldAuthority?.translatedText === "user" ? {
                    text: r.translatedText,
                    pending: !1
                  } : r.engineReadiness?.translation === "pending" ? {
                    text: ae,
                    pending: !0
                  } : r.engineReadiness?.translation === "ready" || r.translatedText.trim().length > 0 ? {
                    text: r.translatedText,
                    pending: !1
                  } : {
                    text: ae,
                    pending: !0
                  },
                  C = "missing_audio" === r.ttsResolution || "default_voice" === r.ttsResolution || "final_voice" === r.ttsResolution;
                return (0, t.jsxs)("div", {
                  "data-subtitle-active": p ? "true" : "false",
                  "data-subtitle-selected": h ? "true" : "false",
                  className: (0, R.cn)("absolute left-2 right-2 grid cursor-pointer items-center gap-2 rounded-md border px-2 py-1 transition-colors", ... function({
                    active: e,
                    selected: t,
                    highlighted: r,
                    excluded: i
                  }) {
                    let a = [e ? "border-primary/60 bg-primary/15" : "border-border hover:bg-muted/30"];
                    return t && a.push("ring-1 ring-primary/60"), !r || t || e || a.push("border-amber-500/60 bg-amber-500/5"), i && a.push("bg-muted/20 opacity-60"), a
                  }({
                    active: p,
                    selected: h,
                    highlighted: w,
                    excluded: f
                  })),
                  style: {
                    gridTemplateColumns: aa,
                    top: 8 + 56 * u,
                    height: 52
                  },
                  onClick: () => {
                    o(r.id), ec(r.startTime)
                  },
                  children: [(0, t.jsxs)("button", {
                    className: "rounded-md bg-muted/35 px-1.5 py-1 text-left",
                    onClick: e => {
                      e.stopPropagation(), ec(r.startTime)
                    },
                    children: [(0, t.jsx)("div", {
                      className: (0, R.cn)("truncate font-mono text-[10px] tabular-nums text-foreground/80", f && "line-through"),
                      children: (0, R.formatTime)(r.startTime)
                    }), (0, t.jsx)(eN, {
                      visible: S
                    })]
                  }), (0, t.jsx)("div", {
                    className: "rounded-md px-1 py-0.5",
                    children: v ? (0, t.jsx)("textarea", {
                      autoFocus: !0,
                      value: j,
                      onChange: e => k(e.target.value),
                      onBlur: () => el(r.id, "originalText"),
                      className: "min-h-9 w-full resize-none bg-transparent text-[13px] leading-5 text-foreground outline-none",
                      style: {
                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      }
                    }) : (0, t.jsx)("p", {
                      className: (0, R.cn)("line-clamp-2 min-h-9 whitespace-pre-wrap text-[13px] leading-5 text-foreground/85", f && "line-through"),
                      style: {
                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      },
                      onDoubleClick: () => eo(r, "originalText"),
                      children: r.originalText
                    })
                  }), (0, t.jsx)("div", {
                    className: "rounded-md bg-primary/[0.06] px-1 py-0.5",
                    children: y ? (0, t.jsx)("textarea", {
                      autoFocus: !0,
                      value: j,
                      onChange: e => {
                        var t, i;
                        return t = r.id, void(k(i = e.target.value), l(t, "translatedText", i))
                      },
                      onBlur: () => el(r.id, "translatedText"),
                      className: "min-h-9 w-full resize-none bg-transparent text-[13px] leading-5 text-foreground outline-none",
                      style: {
                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      }
                    }) : (0, t.jsxs)("div", {
                      className: "flex items-start gap-1.5",
                      children: ["missing_audio" === r.ttsResolution ? (0, t.jsx)("span", {
                        className: "shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-destructive/15 text-destructive border border-destructive/30",
                        title: "Chưa có audio cho câu này",
                        children: "Chưa có audio"
                      }) : "default_voice" === r.ttsResolution || "final_voice" === r.ttsResolution ? (0, t.jsx)("span", {
                        className: "shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
                        title: `Giọng thay thế: ${r.actualVoice||"mặc định"}`,
                        children: "Giọng thay thế"
                      }) : null, (0, t.jsx)("p", {
                        className: (0, R.cn)("line-clamp-2 min-h-9 flex-1 whitespace-pre-wrap text-[13px] font-semibold leading-5 text-foreground", N.pending && "font-normal text-muted-foreground", f && "line-through"),
                        style: {
                          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        },
                        onDoubleClick: () => eo(r, "translatedText"),
                        children: N.text
                      })]
                    })
                  }), (0, t.jsxs)("div", {
                    className: "flex items-center justify-end gap-1",
                    children: [C ? (0, t.jsx)("button", {
                      type: "button",
                      "aria-label": `Tạo lại giọng đọc cho c\xe2u ${r.index}`,
                      title: "Tạo lại giọng đọc cho câu này",
                      className: "inline-flex h-8 w-8 items-center justify-center rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 transition-colors",
                      onClick: e => {
                        e.preventDefault(), e.stopPropagation(), o(r.id), g && m(g.id, [r.id]).then(e => {
                          i.toast.success(`Đ\xe3 tạo lại giọng đọc cho ${e} c\xe2u`)
                        }).catch(e => {
                          i.toast.error("Không tạo lại được giọng đọc", {
                            description: (0, i9.editedSubtitleTtsUserMessage)(e)
                          })
                        })
                      },
                      children: (0, t.jsx)(d.Mic2, {
                        className: "h-4 w-4"
                      })
                    }) : null, (0, t.jsx)("button", {
                      type: "button",
                      "aria-label": r.excluded ? `Restore subtitle row ${r.index}` : `Exclude subtitle row ${r.index}`,
                      className: (0, R.cn)("inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors", r.excluded ? "hover:bg-primary/10 hover:text-primary" : "hover:bg-muted hover:text-foreground"),
                      onClick: e => {
                        e.preventDefault(), e.stopPropagation(), c(r.id)
                      },
                      children: r.excluded ? (0, t.jsx)(ek.RotateCcw, {
                        className: "h-4 w-4"
                      }) : (0, t.jsx)(x.Trash2, {
                        className: "h-4 w-4"
                      })
                    })]
                  })]
                }, r.id)
              })
            })
          })
        }), (0, t.jsx)(i6, {
          open: E,
          onOpenChange: V,
          videoId: g?.id ?? "",
          srtPath: _,
          snapshotExists: A,
          disabled: O,
          onApplied: U
        })]
      })
    }),
    as = (0, h.default)("captions-off", [
      ["path", {
        d: "M10.5 5H19a2 2 0 0 1 2 2v8.5",
        key: "jqtk4d"
      }],
      ["path", {
        d: "M17 11h-.5",
        key: "1961ue"
      }],
      ["path", {
        d: "M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2",
        key: "1keqsi"
      }],
      ["path", {
        d: "m2 2 20 20",
        key: "1ooewy"
      }],
      ["path", {
        d: "M7 11h4",
        key: "1o1z6v"
      }],
      ["path", {
        d: "M7 15h2.5",
        key: "1ina1g"
      }]
    ]),
    ao = (0, h.default)("palette", [
      ["path", {
        d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",
        key: "e79jfc"
      }],
      ["circle", {
        cx: "13.5",
        cy: "6.5",
        r: ".5",
        fill: "currentColor",
        key: "1okk4w"
      }],
      ["circle", {
        cx: "17.5",
        cy: "10.5",
        r: ".5",
        fill: "currentColor",
        key: "f64h9f"
      }],
      ["circle", {
        cx: "6.5",
        cy: "12.5",
        r: ".5",
        fill: "currentColor",
        key: "qy21gx"
      }],
      ["circle", {
        cx: "8.5",
        cy: "7.5",
        r: ".5",
        fill: "currentColor",
        key: "fotxhn"
      }]
    ]);
  var al = e.i(53397),
    ac = e.i(12785);

  function ad(e) {
    let t = e.trim().replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(t)) return null;
    let r = Number.parseInt(t, 16);
    return {
      red: r >> 16 & 255,
      green: r >> 8 & 255,
      blue: 255 & r
    }
  }

  function au({
    isSelected: e,
    style: r
  }) {
    let i = r.accentColor || r.fontColor;
    return (0, t.jsx)("span", {
      "data-subtitle-preset-preview": !0,
      className: (0, R.cn)("flex h-10 min-h-10 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md px-1.5 py-1 transition", e ? "outline outline-2 outline-primary" : "hover:outline hover:outline-1 hover:outline-primary/45"),
      children: (0, t.jsx)("span", {
        className: "max-w-full truncate rounded px-2 py-0.5 text-[12px] font-bold leading-none tracking-normal",
        style: {
          backgroundColor: "pill" === r.backgroundStyle ? function(e, t) {
            let r = ad(e);
            if (!r) return `rgba(0, 0, 0, ${t})`;
            let {
              red: i,
              green: a,
              blue: n
            } = r;
            return `rgba(${i}, ${a}, ${n}, ${t})`
          }(r.backgroundColor, Math.max(r.backgroundOpacity, .52)) : ! function(e) {
            let t = ad(e);
            if (!t) return !1;
            let {
              red: r,
              green: i,
              blue: a
            } = t;
            return (.2126 * r + .7152 * i + .0722 * a) / 255 >= .72
          }(r.fontColor) ? "transparent" : "rgba(15, 23, 42, 0.72)",
          color: r.fontColor,
          fontFamily: r.fontFamily,
          fontStyle: r.italic ? "italic" : "normal",
          textShadow: r.outline || r.shadow ? `0 1px 0 ${r.outlineColor}, 0 0 3px ${i}, 0 0 5px ${r.shadowColor||"#000000"}` : void 0
        },
        children: "Xin chào"
      })
    })
  }

  function ah({
    children: e
  }) {
    return (0, t.jsx)("span", {
      className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
      children: e
    })
  }

  function ap({
    onStyleCommit: e
  } = {}) {
    let {
      globalStyle: r,
      setGlobalStyle: i
    } = (0, X.useSubtitleStore)();

    function a(t) {
      let a = {
        ...r,
        ...t
      };
      i(a), Promise.resolve(e?.(a)).catch(() => void 0)
    }
    let n = !1 !== r.enabled;
    return (0, t.jsxs)("div", {
      "data-subtitle-style-panel": !0,
      className: "space-y-4",
      children: [(0, t.jsxs)("div", {
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [(0, t.jsx)(g, {
            className: "h-4 w-4 text-primary"
          }), (0, t.jsx)("p", {
            className: "text-sm font-semibold",
            children: "Style phụ đề"
          })]
        }), (0, t.jsx)("p", {
          className: "mt-1 text-[11px] leading-4 text-muted-foreground",
          children: "Chọn preset rồi tinh chỉnh chữ, nền và hiệu ứng. Nhịp hiện chữ được tự chia theo câu."
        })]
      }), (0, t.jsx)("section", {
        className: "space-y-2",
        children: (0, t.jsxs)("div", {
          className: "grid grid-cols-2 gap-1.5",
          children: [(0, t.jsxs)("button", {
            type: "button",
            "data-subtitle-none-button": !0,
            "aria-label": "Không phụ đề",
            onClick: () => a({
              enabled: !1
            }),
            className: "relative min-h-10 rounded-md bg-transparent p-0 text-left outline-none transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
            children: [(0, t.jsx)("span", {
              "data-subtitle-preset-preview": !0,
              className: (0, R.cn)("flex h-10 min-h-10 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-md border border-dashed border-border/80 px-1.5 py-1 transition", n ? "hover:outline hover:outline-1 hover:outline-primary/45" : "outline outline-2 outline-primary"),
              children: (0, t.jsxs)("span", {
                className: "flex max-w-full items-center gap-1.5 truncate rounded px-2 py-0.5 text-[12px] font-bold leading-none tracking-normal text-muted-foreground",
                children: [(0, t.jsx)(as, {
                  className: "h-3.5 w-3.5 shrink-0"
                }), "Không phụ đề"]
              })
            }), n ? null : (0, t.jsx)("span", {
              className: "absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow-sm",
              children: (0, t.jsx)(ec.Check, {
                className: "h-3 w-3"
              })
            })]
          }), ac.SUBTITLE_STYLE_PRESETS.map(e => {
            let i = n && e.id === r.presetId;
            return (0, t.jsxs)("button", {
              type: "button",
              "data-subtitle-preset-button": !0,
              "aria-label": `Use ${e.name} subtitle preset`,
              onClick: () => a((0, ac.applySubtitleStylePreset)(r, e.id)),
              className: "relative min-h-10 rounded-md bg-transparent p-0 text-left outline-none transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
              children: [(0, t.jsx)(au, {
                isSelected: i,
                style: e.style
              }), i ? (0, t.jsx)("span", {
                className: "absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow-sm",
                children: (0, t.jsx)(ec.Check, {
                  className: "h-3 w-3"
                })
              }) : null]
            }, e.id)
          })]
        })
      }), (0, t.jsxs)("section", {
        className: "space-y-3 rounded-md border border-border bg-background/45 p-3",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [(0, t.jsx)(t8, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), (0, t.jsx)(ah, {
            children: "Chữ"
          })]
        }), (0, t.jsxs)("div", {
          className: "space-y-1.5",
          children: [(0, t.jsx)(ah, {
            children: "Font chữ"
          }), (0, t.jsxs)(N.Select, {
            value: r.fontFamily,
            onValueChange: e => a({
              fontFamily: e
            }),
            children: [(0, t.jsx)(N.SelectTrigger, {
              "data-subtitle-font-select": !0,
              className: "h-8 text-xs",
              children: (0, t.jsx)(N.SelectValue, {})
            }), (0, t.jsx)(N.SelectContent, {
              children: al.SUBTITLE_FONT_OPTIONS.map(e => (0, t.jsx)(N.SelectItem, {
                value: e.fontFamily,
                textValue: e.label,
                children: (0, t.jsxs)("span", {
                  className: "flex items-center justify-between gap-3",
                  style: {
                    fontFamily: e.fontFamily
                  },
                  children: [(0, t.jsx)("span", {
                    children: e.label
                  }), (0, t.jsx)("span", {
                    className: "text-[10px] text-muted-foreground",
                    children: e.recommendedUse
                  })]
                })
              }, e.id))
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "space-y-2",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between",
            children: [(0, t.jsx)(ah, {
              children: "Kích thước"
            }), (0, t.jsxs)("span", {
              className: "font-mono text-[10px] text-primary",
              children: [r.fontSize, "px"]
            })]
          }), (0, t.jsx)(td, {
            value: [r.fontSize],
            min: 10,
            max: 48,
            step: 1,
            onValueChange: ([e]) => i({
              fontSize: e
            }),
            onValueCommit: ([e]) => a({
              fontSize: e
            })
          })]
        }), (0, t.jsxs)("div", {
          className: "grid grid-cols-2 gap-2",
          children: [(0, t.jsxs)("label", {
            className: "space-y-1",
            children: [(0, t.jsx)(ah, {
              children: "Màu chữ"
            }), (0, t.jsx)("input", {
              type: "color",
              value: r.fontColor,
              onChange: e => a({
                fontColor: e.target.value
              }),
              className: "h-8 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
            })]
          }), (0, t.jsxs)("label", {
            className: "space-y-1",
            children: [(0, t.jsx)(ah, {
              children: "Màu nền"
            }), (0, t.jsx)("input", {
              type: "color",
              value: r.backgroundColor,
              onChange: e => a({
                backgroundColor: e.target.value
              }),
              className: "h-8 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "grid grid-cols-2 gap-2",
          children: [(0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [(0, t.jsx)(ah, {
              children: "Nền"
            }), (0, t.jsxs)(N.Select, {
              value: r.backgroundStyle,
              onValueChange: e => a({
                backgroundStyle: e
              }),
              children: [(0, t.jsx)(N.SelectTrigger, {
                className: "h-8 text-xs",
                children: (0, t.jsx)(N.SelectValue, {})
              }), (0, t.jsxs)(N.SelectContent, {
                children: [(0, t.jsx)(N.SelectItem, {
                  value: "none",
                  children: "Không nền"
                }), (0, t.jsx)(N.SelectItem, {
                  value: "pill",
                  children: "Hộp bo"
                })]
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [(0, t.jsx)(ah, {
              children: "Vị trí"
            }), (0, t.jsxs)(N.Select, {
              value: r.position,
              onValueChange: e => a({
                position: e
              }),
              children: [(0, t.jsx)(N.SelectTrigger, {
                className: "h-8 text-xs",
                children: (0, t.jsx)(N.SelectValue, {})
              }), (0, t.jsxs)(N.SelectContent, {
                children: [(0, t.jsx)(N.SelectItem, {
                  value: "top",
                  children: "Trên"
                }), (0, t.jsx)(N.SelectItem, {
                  value: "center",
                  children: "Giữa"
                }), (0, t.jsx)(N.SelectItem, {
                  value: "bottom",
                  children: "Dưới"
                })]
              })]
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "space-y-2",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between",
            children: [(0, t.jsx)(ah, {
              children: "Độ mờ nền"
            }), (0, t.jsxs)("span", {
              className: "font-mono text-[10px] text-primary",
              children: [Math.round(100 * r.backgroundOpacity), "%"]
            })]
          }), (0, t.jsx)(td, {
            value: [r.backgroundOpacity],
            min: 0,
            max: 1,
            step: .02,
            onValueChange: ([e]) => i({
              backgroundOpacity: e
            }),
            onValueCommit: ([e]) => a({
              backgroundOpacity: e
            })
          })]
        })]
      }), (0, t.jsxs)("section", {
        className: "space-y-3 rounded-md border border-border bg-background/45 p-3",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [(0, t.jsx)(ao, {
            className: "h-3.5 w-3.5 text-muted-foreground"
          }), (0, t.jsx)(ah, {
            children: "Hiệu ứng"
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-3",
          children: [(0, t.jsxs)("div", {
            children: [(0, t.jsx)("p", {
              className: "text-xs font-medium",
              children: "Viền chữ"
            }), (0, t.jsx)("p", {
              className: "text-[10px] text-muted-foreground",
              children: "Giữ chữ nổi trên nền sáng."
            })]
          }), (0, t.jsx)(ep.Switch, {
            checked: r.outline,
            onCheckedChange: e => a({
              outline: e
            })
          })]
        }), (0, t.jsxs)("div", {
          className: "space-y-2",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between",
            children: [(0, t.jsx)(ah, {
              children: "Độ dày viền"
            }), (0, t.jsxs)("span", {
              className: "font-mono text-[10px] text-primary",
              children: [r.outlineWidth, "px"]
            })]
          }), (0, t.jsx)(td, {
            value: [r.outlineWidth],
            min: 0,
            max: 6,
            step: 1,
            onValueChange: ([e]) => i({
              outlineWidth: e
            }),
            onValueCommit: ([e]) => a({
              outlineWidth: e
            })
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-3",
          children: [(0, t.jsxs)("div", {
            children: [(0, t.jsx)("p", {
              className: "text-xs font-medium",
              children: "Bóng chữ"
            }), (0, t.jsx)("p", {
              className: "text-[10px] text-muted-foreground",
              children: "Tăng tương phản khi video nhiều chi tiết."
            })]
          }), (0, t.jsx)(ep.Switch, {
            checked: r.shadow,
            onCheckedChange: e => a({
              shadow: e
            })
          })]
        })]
      })]
    })
  }
  var am = e.i(26091),
    ag = e.i(33228),
    ax = e.i(64348),
    af = e.i(44861),
    av = e.i(16331),
    ab = e.i(47066),
    ay = e.i(34279),
    aw = e.i(51026),
    aj = e.i(63126);

  function ak(e, t) {
    return ((0, rW.getTerminalDirectExportProjectRef)(e) ? (0, af.directExportErrorDetails)(t) : (0, ax.exportErrorDetails)(t)).userMessage
  }

  function aS(e, t) {
    let r = Math.round(e ?? 0),
      i = Math.round(t ?? 0);
    return !Number.isFinite(r) || !Number.isFinite(i) || r <= 0 || i <= 0 ? null : {
      width: r,
      height: i
    }
  }

  function aN({
    open: e,
    onOpenChange: i,
    exportLayers: a,
    subtitlePreviewViewport: s
  }) {
    let {
      getActiveVideo: o,
      refreshNativeTtsForEditedSubtitles: l,
      tasks: d
    } = (0, W.useVideoStore)(), {
      jobs: u,
      cancelManualExportBatch: h,
      inspectManualExportDelivery: p,
      retryManualExportDelivery: m,
      retryManualExportDeliveryToAnotherPath: g,
      startManualExport: x
    } = (0, ag.useExportStore)(), {
      subtitles: f,
      renderSubtitles: v,
      globalStyle: b
    } = (0, X.useSubtitleStore)(), [w, k] = (0, r.useState)(!1), [N, C] = (0, r.useState)(null), [M, _] = (0, r.useState)(null), P = (0, r.useRef)(null), T = o(), E = T?.status === "completed" && T.dubbingTimeline?.mode === "hybrid_stretch" && T.dubbingTimelineResult ? T.dubbingTimelineResult : null, R = E && T && "number" == typeof T.outputDuration ? (0, aw.formatDubbingTimelineDurationNotice)(T.duration, T.outputDuration) : null, V = E ? (0, aw.formatDubbingTimelineDegradationNotice)(E) : null, A = (0, r.useMemo)(() => (0, tW.getRenderSubtitlesForVideo)(f, v, T?.id), [T?.id, v, f]), F = (0, r.useMemo)(() => (0, tW.getSubtitlesForVideo)(f, T?.id), [T?.id, f]), D = (0, r.useMemo)(() => (0, ar.subtitlesToSrt)(F, "originalText").length > 0, [F]), L = (0, r.useMemo)(() => (0, ar.subtitlesToSrt)(F, "translatedText").length > 0, [F]), z = (0, tW.hasRenderSubtitlesForVideo)(v, T?.id), B = (0, r.useMemo)(() => aS(s?.width, s?.height) ?? aS(T?.width, T?.height), [T, s]), O = (0, r.useMemo)(() => [...d].reverse().find(e => e.videoId === T?.id && "export" === e.type && ("pending" === e.status || "processing" === e.status)), [T?.id, d]), $ = (0, r.useMemo)(() => [...u].reverse().find(e => e.taskId === O?.id && ("queued" === e.status || "processing" === e.status)), [O?.id, u]), H = (0, r.useMemo)(() => [...u].reverse().find(e => e.videoId === T?.id && "delivery_failed" === e.status), [T?.id, u]), q = (0, r.useMemo)(() => [...u].reverse().find(e => e.videoId === T?.id), [T?.id, u]), G = q?.status === "error" ? q : null, U = O?.progressBasisPoints ?? (O?.progress ?? 0) * 100, Y = O?.progressMessageKey === "resume_continue" && void 0 !== O.progressStageBasisPoints ? `Phần đang tiếp tục: ${(0,av.formatBasisPoints)(O.progressStageBasisPoints)}` : null, J = !!O, Z = J || w, Q = !!T?.editedSubtitleTtsDirty, ee = T?.status !== "completed" || T.exportWatermarkPolicy ? null : T.lastAuthorizedJobId ?? T.billingScopeJobId, et = T && ee ? `${T.id}:${ee}` : null, er = !!(et && M === et), ei = !!(ee && N === ee), ea = !!(ee && !T?.exportWatermarkPolicy && !er && (ei || P.current !== et));
    (0, r.useEffect)(() => {
      e && T && p(T)
    }, [T, p, e]);
    let en = T ? (0, rW.requiresStretchRetimeReprocess)(T) ? rW.STRETCH_RETIME_REPROCESS_REQUIRED_MESSAGE : "completed" !== T.status || T.exportWatermarkPolicy ? null : ea ? "Đang khôi phục thông tin xuất..." : "Video này thiếu thông tin xuất và không khôi phục được. Hãy xử lý lại video." : "Chọn video trước khi xuất video",
      es = T?.exportWatermarkPolicy ? T.exportWatermarkPolicy.watermarkRequired ? "File xuất sẽ có watermark dichvideo.com theo gói miễn phí." : T.exportWatermarkPolicy.paygOverageChargedSeconds > 0 ? "File xuất không watermark vì lần xử lý này dùng ví phút." : "File xuất không watermark theo quyền hiện tại." : null;
    (0, r.useEffect)(() => {
      if (!e || !T || T.exportWatermarkPolicy || !ee || !et || P.current === et) return;
      let t = !1;
      return P.current = et, _(null), C(ee), (async () => {
        let e = await K.useCloudStore.getState().refreshExportWatermarkPolicy(ee);
        if (!t) {
          if (!e) {
            _(et), C(null);
            return
          }
          W.useVideoStore.getState().updateVideo(T.id, {
            exportWatermarkPolicy: e
          });
          try {
            await (0, tx.persistLatestProjectManifest)(T.id, W.useVideoStore.getState)
          } catch (e) {
            console.warn("[export-dialog] failed to persist restored export policy", {
              videoId: T.id,
              jobId: ee,
              message: e instanceof Error ? e.message : String(e)
            })
          }
          t || C(null)
        }
      })(), () => {
        t = !0, C(e => e === ee ? null : e)
      }
    }, [T, et, ee, e]);
    let eo = async e => {
      let t = await (0, I.saveFileDialog)(`${e.name.replace(/\.[^.]+$/,"")}_translated.mp4`, [{
        name: "MP4",
        extensions: ["mp4"]
      }]);
      return t ? {
        savePath: await (0, ab.resolveAvailableExportPath)(t, I.fileExists),
        defaultOutputDir: await (0, aj.getDefaultOutputDir)()
      } : null
    }, el = (e, t, r = A, n = b, s = z) => {
      x({
        video: e,
        savePath: t.savePath,
        defaultOutputDir: t.defaultOutputDir,
        subtitles: r,
        globalStyle: n,
        exportLayers: a,
        subtitleRenderSize: B,
        subtitlesEnabled: !1 !== n.enabled,
        preservePreparedSubtitleTiming: s
      }), i(!1)
    }, ec = async (e, t = A, r = b, i = z) => {
      try {
        await (0, ay.preflightManualExport)(e);
        let a = await eo(e);
        if (!a) return;
        el(e, a, t, r, i)
      } catch (r) {
        console.error("Export schedule failed:", r);
        let t = ak(e, r);
        await (0, I.showMessage)("Không thể bắt đầu xuất video", t, "error")
      }
    }, ed = async () => {
      if (!T) return void await (0, I.showMessage)("Chưa có video", "Hãy chọn video trước khi xuất video.", "warning");
      if (O) {
        await (0, I.showMessage)("Đang xuất video", "Video này đang được xuất trong nền.", "info"), i(!1);
        return
      }
      Q || await ec(T)
    }, eu = async () => {
      !T || O || en || await ec(T)
    }, eh = async () => {
      if (!T || O || en) return;
      let e = null;
      try {
        await (0, ay.preflightManualExport)(T), e = await eo(T)
      } catch (t) {
        console.error("Export destination selection failed:", t);
        let e = ak(T, t);
        await (0, I.showMessage)("Không thể bắt đầu xuất video", e, "error");
        return
      }
      if (e) {
        k(!0);
        try {
          await l(T.id);
          let t = W.useVideoStore.getState().videos.find(e => e.id === T.id) ?? T,
            r = X.useSubtitleStore.getState(),
            i = (0, tW.getRenderSubtitlesForVideo)(r.subtitles, r.renderSubtitles, t.id),
            a = (0, tW.hasRenderSubtitlesForVideo)(r.renderSubtitles, t.id);
          el(t, e, i, r.globalStyle, a)
        } catch (e) {
          console.error("Regenerate before export failed:", e), await (0, I.showMessage)("Không thể tạo lại âm thanh", (0, i9.editedSubtitleTtsUserMessage)(e), "error")
        } finally {
          k(!1)
        }
      }
    }, ep = async e => {
      T ? await ai(T, F, e) : await (0, I.showMessage)("Chưa có video", "Hãy chọn video trước khi xuất SRT.", "warning")
    };
    return (0, t.jsx)(j.Dialog, {
      open: e,
      onOpenChange: i,
      children: (0, t.jsxs)(j.DialogContent, {
        className: "max-w-md",
        children: [(0, t.jsxs)(j.DialogHeader, {
          children: [(0, t.jsxs)(j.DialogTitle, {
            className: "flex items-center gap-2",
            children: [(0, t.jsx)(n.Download, {
              className: "h-5 w-5 text-primary"
            }), "Xuất video"]
          }), (0, t.jsx)(j.DialogDescription, {
            children: "App sẽ tạo file MP4 với phụ đề, giọng đọc và overlay hiện tại khi có."
          })]
        }), O ? (0, t.jsxs)("div", {
          className: "space-y-2 rounded-md border border-border bg-background/60 p-3",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between gap-3",
            children: [(0, t.jsxs)("div", {
              className: "flex min-w-0 items-center gap-2",
              children: [(0, t.jsx)(c.Loader2, {
                className: "h-3.5 w-3.5 shrink-0 animate-spin text-primary"
              }), (0, t.jsx)("span", {
                className: "truncate text-xs text-muted-foreground",
                children: O.message
              })]
            }), (0, t.jsx)("span", {
              className: "shrink-0 font-mono text-xs tabular-nums text-primary",
              children: (0, av.formatBasisPoints)(U)
            })]
          }), (0, t.jsx)(S.Progress, {
            value: U / 100,
            className: "h-2"
          }), Y ? (0, t.jsx)("p", {
            className: "text-[11px] tabular-nums text-muted-foreground",
            children: Y
          }) : null, $ ? (0, t.jsxs)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            className: "w-full justify-center",
            "data-cancel-export-button": !0,
            disabled: !0 === $.cancelRequested,
            onClick: () => void h($.batchId),
            children: [$.cancelRequested ? (0, t.jsx)(c.Loader2, {
              className: "h-3.5 w-3.5 animate-spin"
            }) : (0, t.jsx)(t4, {
              className: "h-3.5 w-3.5"
            }), $.cancelRequested ? "Đang hủy..." : "Hủy xuất"]
          }) : null]
        }) : null, H ? (0, t.jsxs)("div", {
          "data-final-delivery-recovery": !0,
          className: "space-y-2 rounded-md border border-amber-500/35 bg-amber-500/5 p-3",
          children: [(0, t.jsx)("p", {
            className: "text-xs leading-5 text-amber-900 dark:text-amber-100",
            children: H.message
          }), (0, t.jsxs)("div", {
            className: "flex flex-wrap gap-2",
            children: [(0, t.jsx)(y.Button, {
              type: "button",
              size: "sm",
              onClick: () => void m(H.id),
              children: "Thử lưu lại"
            }), (0, t.jsx)(y.Button, {
              type: "button",
              size: "sm",
              variant: "outline",
              onClick: () => void g(H.id),
              children: "Lưu sang nơi khác"
            })]
          })]
        }) : null, G ? (0, t.jsxs)("div", {
          "data-export-failure": !0,
          className: "space-y-2 rounded-md border border-red-500/35 bg-red-500/5 p-3",
          children: [(0, t.jsxs)("div", {
            children: [(0, t.jsx)("p", {
              className: "text-xs font-medium text-red-900 dark:text-red-100",
              children: "Xuất video thất bại"
            }), (0, t.jsx)("p", {
              className: "mt-1 text-xs leading-5 text-red-900/90 dark:text-red-100/85",
              children: G.error ?? G.message
            }), (0, t.jsx)("p", {
              className: "mt-1 break-all text-[11px] leading-4 text-muted-foreground",
              children: G.savePath
            })]
          }), (0, t.jsx)(y.Button, {
            type: "button",
            size: "sm",
            variant: "outline",
            disabled: !T || Z,
            onClick: () => T && void ec(T),
            children: "Xuất lại"
          })]
        }) : null, es ? (0, t.jsx)("p", {
          className: "text-[11px] leading-4 text-muted-foreground",
          children: es
        }) : null, R ? (0, t.jsx)("p", {
          "data-hybrid-duration-notice": !0,
          className: "break-words text-[11px] leading-4 text-muted-foreground",
          children: R
        }) : null, V ? (0, t.jsx)("p", {
          "data-hybrid-degradation-notice": !0,
          className: "break-words text-[11px] leading-4 text-amber-400/90",
          children: V
        }) : null, en ? (0, t.jsxs)("div", {
          className: "rounded-md border border-amber-400/25 bg-amber-400/10 px-3 py-2",
          children: [(0, rW.requiresStretchRetimeReprocess)(T) ? (0, t.jsx)("p", {
            className: "text-xs font-medium text-amber-300",
            children: "Cần xử lý lại phần Tự giãn/Export"
          }) : null, (0, t.jsx)("p", {
            className: "mt-0.5 text-[11px] text-amber-400/90",
            children: en
          })]
        }) : null, (0, t.jsxs)("div", {
          "data-export-srt-actions": !0,
          className: "rounded-md border border-border bg-background/60 p-3",
          children: [(0, t.jsxs)("div", {
            className: "mb-2 flex items-center gap-2 text-xs font-medium text-foreground",
            children: [(0, t.jsx)(am.FileText, {
              className: "h-3.5 w-3.5 text-primary"
            }), "Xuất phụ đề SRT"]
          }), (0, t.jsxs)("div", {
            className: "grid grid-cols-2 gap-2",
            children: [(0, t.jsx)(y.Button, {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "justify-center text-xs",
              "data-export-srt-original": !0,
              disabled: !D,
              onClick: () => void ep("originalText"),
              children: "Xuất SRT gốc"
            }), (0, t.jsx)(y.Button, {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "justify-center text-xs",
              "data-export-srt-translated": !0,
              disabled: !L,
              onClick: () => void ep("translatedText"),
              children: "Xuất SRT đã dịch"
            })]
          })]
        }), Q ? (0, t.jsxs)("div", {
          className: "rounded-md border border-amber-500/35 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100",
          children: [(0, t.jsx)("p", {
            className: "font-medium text-amber-950 dark:text-amber-50",
            children: "Âm thanh chưa khớp với phụ đề đã sửa"
          }), (0, t.jsx)("p", {
            className: "mt-1 text-amber-900/90 dark:text-amber-100/85",
            children: "Bạn đã sửa, xóa hoặc khôi phục phụ đề nhưng chưa tạo lại âm thanh. Nếu xuất ngay, giọng đọc có thể không khớp phụ đề trên video."
          })]
        }) : null, Q ? (0, t.jsxs)(j.DialogFooter, {
          className: "flex-col gap-2 sm:flex-col sm:justify-start sm:space-x-0",
          children: [(0, t.jsxs)(y.Button, {
            className: "w-full justify-center",
            onClick: eh,
            disabled: Z || !!en,
            children: [w ? (0, t.jsx)(c.Loader2, {
              className: "h-4 w-4 animate-spin"
            }) : (0, t.jsx)(n.Download, {
              className: "h-4 w-4"
            }), w ? "Đang tạo lại âm thanh..." : "Tạo lại âm thanh rồi xuất"]
          }), (0, t.jsx)(y.Button, {
            variant: "outline",
            className: "w-full justify-center",
            onClick: eu,
            disabled: Z || !!en,
            children: "Xuất với âm thanh hiện tại"
          }), (0, t.jsx)(y.Button, {
            variant: "ghost",
            className: "w-full justify-center",
            onClick: () => i(!1),
            children: "Hủy"
          })]
        }) : (0, t.jsxs)(j.DialogFooter, {
          children: [(0, t.jsx)(y.Button, {
            variant: "outline",
            onClick: () => i(!1),
            children: J ? "Ẩn" : "Hủy"
          }), (0, t.jsxs)(y.Button, {
            onClick: ed,
            disabled: J || !!en,
            children: [J ? (0, t.jsx)(c.Loader2, {
              className: "h-4 w-4 animate-spin"
            }) : (0, t.jsx)(n.Download, {
              className: "h-4 w-4"
            }), J ? "Đang chạy nền" : "Xuất video"]
          })]
        })]
      })
    })
  }
  var aC = e.i(59416),
    aM = e.i(71708);

  function a_(e) {
    return "number" == typeof e && Number.isFinite(e)
  }
  var aP = e.i(27895),
    aT = e.i(96269),
    aE = e.i(43035),
    aR = e.i(3091),
    aI = e.i(88327),
    aV = e.i(675);
  let aA = {
    idle: {
      label: "Sẵn sàng",
      variant: "secondary"
    },
    importing: {
      label: "Đang nhập",
      variant: "warning"
    },
    extracting_audio: {
      label: "Tách âm thanh",
      variant: "warning"
    },
    transcribing: {
      label: "Nhận diện giọng",
      variant: "warning"
    },
    translating: {
      label: "Đang dịch",
      variant: "warning"
    },
    generating_tts: {
      label: "Tạo giọng đọc",
      variant: "warning"
    },
    exporting: {
      label: "Xuất video",
      variant: "warning"
    },
    completed: {
      label: "Đã xử lý",
      variant: "success"
    },
    error: {
      label: "Có lỗi",
      variant: "destructive"
    }
  };

  function aF(e) {
    return e && "object" == typeof e && "code" in e && "string" == typeof e.code ? e.code : null
  }
  e.s(["EditorPage", 0, function() {
    let [e, h] = (0, r.useState)(null), [_, P] = (0, r.useState)({
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0
    }), {
      leaveEditor: T,
      isExportOpen: E,
      setIsExportOpen: V
    } = (0, q.useAppStore)(), {
      tasks: A,
      getActiveVideo: F,
      runFullPipeline: D,
      updateVideo: L,
      refreshNativeTtsForEditedSubtitles: z,
      applyProjectTempo: B,
      restoreProjectSource: O,
      hydrateEditorContent: $
    } = (0, W.useVideoStore)(), H = tq(e => e.inspect), K = tq(e => e.ensureNleBackground), {
      settings: G
    } = (0, em.useSettingsStore)(), {
      globalStyle: U,
      setGlobalStyle: Y,
      subtitles: J
    } = (0, X.useSubtitleStore)(), {
      jobs: Z,
      inspectManualExportDelivery: ee,
      retryManualExportDelivery: et,
      retryManualExportDeliveryToAnotherPath: er
    } = (0, ag.useExportStore)(), {
      presets: ei,
      activePresetId: ea,
      savePreset: en,
      deletePreset: es,
      setActivePreset: eo,
      getPresetExportLayersForProject: el
    } = (0, aM.useExportDesignPresetStore)(), [ec, ed] = (0, r.useState)(null), [eu, eh] = (0, r.useState)(!1), [ep, eg] = (0, r.useState)(""), [ex, ef] = (0, r.useState)(!0), eb = (0, r.useMemo)(() => ei.find(e => e.id === ec) ?? ei.find(e => e.id === ea) ?? ei[0] ?? null, [ei, ec, ea]), ey = F(), ej = (0, im.useTerminalProjectStore)(e => e.active), ek = ey?.projectAudioTrack?.schemaVersion, eS = ey?.processingSession?.job_id?.trim() || ey?.cuePreviewJobId?.trim(), eN = (0, r.useMemo)(() => (0, tg.resolveSourcePreviewAudioPolicy)(ey), [ey]), eM = (0, r.useMemo)(() => (0, tW.getSubtitlesForVideo)(J, ey?.id), [ey?.id, J]), e_ = (0, r.useMemo)(() => (0, ev.findReplacementOccurrences)(eM, G.replacementPairs), [eM, G.replacementPairs]), eP = (0, r.useMemo)(() => new Set(e_.map(e => e.cueId)), [e_]), eT = (0, r.useMemo)(() => new Set(ey?.nativeProjectReadiness?.tempoState.state === "unapplied" ? ey.projectTempoMarkerCueIds ?? [] : []), [ey]), eE = (0, r.useMemo)(() => ey?.exportLayers ?? [], [ey?.exportLayers]), eR = ey?.nleDocument?.canvasComposition ?? ej?.graph.visuals.canvasComposition ?? tY.DEFAULT_CANVAS_COMPOSITION, eI = ey?.nleDocument?.sourceRemoval ?? ej?.graph.visuals.sourceRemoval ?? tY.DEFAULT_SOURCE_REMOVAL, eV = ey?.exportWatermarkPolicy?.watermarkRequired === !1, eA = (0, r.useCallback)(async (e, t, r, i) => {
      if (!ey) return;
      let a = W.useVideoStore.getState().videos.find(e => e.id === ey.id) ?? ey;
      if (a.nleDocument) {
        let t = a.nleDocument,
          n = r ?? X.useSubtitleStore.getState().globalStyle;
        for (let r = 0; r < 2; r += 1) try {
          let r = await (0, tp.mutateEngineVnextNleDocument)({
            projectId: ey.id,
            expectedRevision: t.revision,
            mutation: {
              kind: "update_visuals",
              overlays: e,
              subtitleStyle: n,
              canvasComposition: i?.canvasComposition ?? t.canvasComposition,
              sourceRemoval: i?.sourceRemoval ?? t.sourceRemoval,
              sourceWidth: t.source.width,
              sourceHeight: t.source.height
            }
          });
          L(ey.id, {
            nleDocument: r,
            exportLayers: r.overlays
          });
          break
        } catch (e) {
          if (0 === r && "nle_document_revision_stale" === aF(e)) try {
            t = await (0, tb.hydrateNleProject)(ey.id), L(ey.id, {
              nleDocument: t,
              exportLayers: t.overlays
            });
            continue
          } catch {}
          try {
            let e = await (0, tb.hydrateNleProject)(ey.id);
            L(ey.id, {
              nleDocument: e,
              exportLayers: e.overlays
            }), Y(e.subtitleStyle)
          } catch {}
          throw await (0, I.showMessage)("Không thể lưu thay đổi hiển thị", "Thay đổi chưa được lưu. DichVideo đã khôi phục thiết kế gần nhất.", "error"), e
        }
        return
      }
      let n = ej?.projectId === ey.id ? ej : null,
        s = ey.processingSession?.job_id;
      if (!n || !s) return void L(ey.id, {
        exportLayers: e
      });
      let o = (0, tv.nextProjectAuthorityRevision)(ey.id),
        l = `visual-${Date.now()}-${o}`,
        c = t?.gestureId ?? `visual-control-${Date.now()}-${o}`,
        d = t?.patch,
        u = i?.canvasComposition ? {
          kind: "replace_canvas_composition",
          canvasComposition: i.canvasComposition
        } : i?.sourceRemoval ? {
          kind: "replace_source_removal",
          sourceRemoval: i.sourceRemoval
        } : d?.kind === "update_export_layer" && n.graph.visuals.exportLayers.some(e => e.layer.id === d.layerId) ? d : {
          kind: "replace_export_layers",
          layers: e
        };
      try {
        let e = await (0, tv.promoteProjectVisualMutation)({
            projectId: ey.id,
            jobId: s,
            expectedGenerationId: n.playbackGenerationId,
            expectedGraphHash: n.graphHash,
            expectedTerminalGenerationId: n.generationId,
            operationId: l,
            gestureId: c,
            customerMutationRevision: o,
            patch: u
          }),
          t = await (0, ig.validateProjectPlaybackGraph)(e.graph),
          r = e.receipt;
        if (e.operationId !== l || e.customerMutationRevision !== o || r.projectId !== ey.id || r.jobId !== s || r.playbackGenerationId !== t.generationId || r.graphHash !== t.graphHash || r.transportProjectionHash !== n.transportProjectionHash || r.audioScheduleHash !== n.audioScheduleHash || r.timingAuthority.generationId !== n.timingAuthority.generationId || r.timingAuthority.planHash !== n.timingAuthority.planHash || r.timingAuthority.timelineStateHash !== n.timingAuthority.timelineStateHash || t.transportProjectionHash !== n.transportProjectionHash || t.audioScheduleHash !== n.audioScheduleHash) throw Object.assign(Error("visual promotion authority mismatch"), {
          code: "project_visual_authority_mismatch"
        });
        let i = (0, ig.projectPlaybackCaptionsToSubtitles)(ey.id, t, J.filter(e => e.videoId === ey.id));
        if (!im.useTerminalProjectStore.getState().promoteVisual(ey.id, n.generationId, n.graphHash, {
            projectId: ey.id,
            generationId: r.terminalGenerationId,
            snapshotHash: r.terminalSnapshotHash,
            timingAuthority: r.timingAuthority,
            audioGenerationId: r.audioGenerationId,
            playbackGenerationId: t.generationId,
            graphHash: t.graphHash,
            transportProjectionHash: t.transportProjectionHash,
            audioScheduleHash: t.audioScheduleHash,
            visualSnapshotHash: t.visualSnapshotHash,
            graph: t,
            subtitles: i,
            renderSubtitles: i
          })) throw Object.assign(Error("visual promotion response was superseded"), {
          code: "project_visual_mutation_superseded"
        });
        L(ey.id, {
          exportLayers: t.visuals.exportLayers.map(e => e.layer),
          activeTerminalGeneration: r.terminalGenerationId,
          terminalAdmission: (0, aV.readyTerminalAdmissionFromMutation)(r)
        })
      } catch (e) {
        throw "integrity" === ir(e, "visual_mutation") && (im.useTerminalProjectStore.getState().clear(ey.id), $(ey.id).catch(e => {
          console.error("Failed to recover visual integrity authority:", e)
        })), await (0, I.showMessage)("Không thể lưu thay đổi overlay", "Thay đổi chưa được lưu. DichVideo đã giữ nguyên thiết kế trước đó.", "error"), e
      }
    }, [ej, ey, $, Y, J, L]), eF = (0, r.useCallback)(e => ey ? (0, tv.trackProjectVisualMutation)(ey.id, () => eA(W.useVideoStore.getState().videos.find(e => e.id === ey.id)?.exportLayers ?? eE, void 0, void 0, {
      canvasComposition: e
    })) : eA(eE, void 0, void 0, {
      canvasComposition: e
    }), [ey, eA, eE]), eD = (0, r.useCallback)(e => ey ? (0, tv.trackProjectVisualMutation)(ey.id, () => eA(W.useVideoStore.getState().videos.find(e => e.id === ey.id)?.exportLayers ?? eE, void 0, void 0, {
      sourceRemoval: e
    })) : eA(eE, void 0, void 0, {
      sourceRemoval: e
    }), [ey, eA, eE]), eL = (0, r.useCallback)(e => ey ? (0, tv.trackProjectVisualMutation)(ey.id, () => eA(e)) : eA(e), [ey, eA]), ez = (0, r.useCallback)(e => ey ? (0, tv.trackProjectVisualMutation)(ey.id, () => eA(W.useVideoStore.getState().videos.find(e => e.id === ey.id)?.exportLayers ?? eE, void 0, e)) : eA(eE, void 0, e), [ey, eA, eE]), eB = (0, r.useCallback)(e => ey ? (0, tv.trackProjectVisualMutation)(ey.id, () => eA(e.layers, {
      gestureId: e.gestureId,
      patch: e.patch
    })) : eA(e.layers, {
      gestureId: e.gestureId,
      patch: e.patch
    }), [ey, eA]), eO = (0, r.useMemo)(() => [...A].reverse().find(e => e.videoId === ey?.id && ("pending" === e.status || "processing" === e.status)), [ey?.id, A]), e$ = (0, r.useMemo)(() => [...Z].reverse().find(e => e.videoId === ey?.id && "delivery_failed" === e.status), [ey?.id, Z]), eH = eO?.progressBasisPoints ?? (eO?.progress ?? 0) * 100, eq = eO?.progressMessageKey === "resume_continue" && void 0 !== eO.progressStageBasisPoints ? `Phần đang tiếp tục: ${(0,av.formatBasisPoints)(eO.progressStageBasisPoints)}` : null;
    (0, r.useEffect)(() => {
      ey && (0, tb.canOpenNleProject)(ey) || T("history", ey?.id ?? ej?.projectId ?? null)
    }, [ej?.projectId, ey, T]), (0, r.useEffect)(() => {
      ey && ee(ey)
    }, [ey, ee]), (0, r.useEffect)(() => {
      ey?.nativeProjectReadiness?.readyForEdit && eS && ek && H(ey.id).catch(e => {
        console.warn("Project audio inspection failed:", e)
      })
    }, [ey?.id, ey?.nativeProjectReadiness?.readyForEdit, ey?.nativeProjectReadiness?.timelineGeneration, H, eS, ek]), (0, r.useEffect)(() => {
      ey?.nleDocument && "separated_background" === ey.nleDocument.playback.sourceAudioMode && !ey.projectAudioPreviewCarrierPath && K(ey.id).catch(e => {
        console.warn("NLE background hydration failed:", e)
      })
    }, [ey?.id, ey?.nleDocument, ey?.projectAudioPreviewCarrierPath, K]);
    let eK = eO?.status === "pending" || eO?.status === "processing",
      eX = !!(ey && (0, tb.canOpenNleProject)(ey)),
      eG = (0, r.useMemo)(() => {
        if (!ey) return null;
        if (eX && ey.nleDocument) return (0, aI.buildNleTempoControlModel)(ey.nleDocument.playback);
        let e = ey.nativeProjectReadiness;
        return e?.readyForEdit ? (0, aI.buildProjectTempoControlModel)(e, ey.projectTempoMarkerCueIds ?? []) : null
      }, [ey, eX]),
      eW = eX ? eK : eK || ey?.nativeProjectReadiness?.exportState.state === "exporting",
      eU = !!(eX && ey?.nleDocument && "source_timeline" === ey.nleDocument.playback.timingMode && function(e) {
        let t = 0;
        if (Array.isArray(e))
          for (let r of e) {
            let e = function(e) {
              let t = e?.sourceStartMs,
                r = e?.sourceEndMs;
              if (!a_(t) || !a_(r)) return null;
              let i = r - t;
              if (i <= 0) return null;
              let a = e?.audio?.durationMs;
              return !a_(a) || a <= 0 ? null : a / i
            }(r);
            null !== e && e > t && (t = e)
          }
        return {
          eligible: t > 1.5,
          maxRatio: t
        }
      }(ey.nleDocument.voiceCues).eligible),
      eY = ey ? (0, aR.getHistoryOutputState)(ey) : null,
      eJ = !!(ey?.finalExportPath || ey?.draftVideoPath || ey?.translatedVideoPath),
      eZ = !!(ey?.finalExportPath || ey?.draftVideoPath || ey?.translatedVideoPath || ey?.translatedSubtitlePath || ey?.voiceSubtitlePath),
      eQ = !!ey?.editedSubtitleTtsDirty,
      e0 = !!ey?.nleDocument?.captions.some(e => "missing_audio" === e.ttsResolution || "default_voice" === e.ttsResolution || "final_voice" === e.ttsResolution),
      e1 = !!(ey?.nleDocument?.voiceCues.length || ey?.nleDocument?.captions.length || ey?.voiceSubtitlePath && ey?.displaySubtitlePath && (ey?.ttsManifestPath || ey?.exportWatermarkPolicy?.watermarkRequired)),
      e2 = !!(ey?.nleDocument?.voiceCues.length || ey?.nleDocument?.captions.length || eZ && (ey?.voiceSubtitlePath || ey?.ttsManifestPath)),
      e5 = !!(e2 && (eQ || e0) && e1 && !ey?.sourceMissing && !eK),
      e3 = e5 ? "Tạo lại âm thanh cho phụ đề đã sửa" : eK ? "Đang xử lý video." : eQ || e0 ? ey?.sourceMissing ? "Thiếu file gốc, cần import lại để tạo lại âm thanh." : e1 ? "Video này cần đủ phụ đề và dữ liệu TTS để tạo lại âm thanh." : "Video này không còn dữ liệu giọng đọc để tạo lại âm thanh. Hãy xử lý lại video." : "Sửa văn bản dịch để tạo lại giọng đọc",
      e4 = ey ? aA[ey.status] : void 0,
      e8 = ey ? (0, aP.formatProcessingDurationLabel)(ey) : null,
      e7 = eJ && eY?.label ? {
        label: eY.label,
        variant: eY.variant,
        title: eY.detail || eY.label
      } : eZ ? {
        label: "Đã có phụ đề/giọng",
        variant: "warning",
        title: "Đã có phụ đề hoặc giọng đọc. Bạn có thể xem lại, chỉnh sửa hoặc xuất video."
      } : {
        label: e4?.label ?? "Sẵn sàng",
        variant: e4?.variant ?? "outline",
        title: e4?.label ?? "Sẵn sàng"
      },
      e6 = async () => {
        if (!ey) return void await (0, I.showMessage)("Chưa có video", "Hãy chọn video từ Trang chủ hoặc Lịch sử trước.", "warning");
        try {
          await D(ey.id, "auto", "vi", void 0, {
            processingMode: "balanced",
            sonitranslateSettings: (0, aE.applyLocalProcessingMode)("balanced", G.sonitranslateSettings)
          })
        } catch (e) {
          console.error("Failed to run automatic pipeline:", e), await (0, I.showMessage)("Không thể xử lý video", e instanceof Error ? e.message : "Không thể hoàn tất quy trình tự động cho video hiện tại.", "error")
        }
      }, e9 = async () => {
        if (ey) try {
          let e = await z(ey.id);
          i.toast.success(`Đ\xe3 tạo lại giọng đọc cho ${e} c\xe2u`)
        } catch (e) {
          console.error("Failed to refresh native TTS from edited subtitles:", e), i.toast.error("Không tạo lại được giọng đọc", {
            description: (0, i9.editedSubtitleTtsUserMessage)(e)
          })
        }
      }, te = (0, r.useCallback)(async e => {
        if (ey) try {
          await B(ey.id, e)
        } catch (e) {
          console.error("Failed to apply project tempo:", e), await (0, I.showMessage)("Không thể chỉnh tốc độ giọng đọc", (0, aI.projectTempoCustomerMessage)(e), "error")
        }
      }, [ey, B]), tt = (0, r.useCallback)(async () => {
        if (ey) try {
          await O(ey.id)
        } catch (e) {
          await (0, I.showMessage)("Không thể khôi phục video gốc", (0, aI.projectTempoCustomerMessage)(e), "error")
        }
      }, [ey, O]), tr = async () => (0, I.openFileDialog)([{
        name: "Logo image",
        extensions: [...rr]
      }]), ti = async () => {
        let e = ep.trim();
        if (ey && e) try {
          let t = await en(e, U, eE, ey.id);
          ed(t), ex && eo(t), eh(!1), await (0, I.showMessage)("Đã lưu preset", ex ? `"${e}" sẽ được d\xf9ng cho video mới.` : `Đ\xe3 lưu "${e}". Chọn preset trong danh s\xe1ch để \xe1p dụng.`, "info")
        } catch (e) {
          await (0, I.showMessage)("Không thể lưu preset", "nle_image_asset_missing" === aF(e) ? "Ảnh logo không còn tồn tại. Hãy chọn lại ảnh rồi lưu preset." : e instanceof Error && "stage" in e ? e.message : "Không thể lưu ảnh hoặc dữ liệu preset. Hãy thử lại.", "error")
        }
      }, ta = async () => {
        let e = eb?.preset;
        if (!e || !eb) return void await (0, I.showMessage)("Chưa có preset", "Hãy chỉnh style hoặc overlay rồi bấm Lưu preset trước.", "warning");
        if (ey) {
          Y(e.subtitleStyle);
          try {
            let t = await el(ey.id, eb.id);
            await (0, tv.trackProjectVisualMutation)(ey.id, () => eA(t, void 0, e.subtitleStyle)), h(t[0]?.id ?? null), await (0, I.showMessage)("Đã áp dụng preset", `"${eb.name}" đ\xe3 được \xe1p dụng cho video hiện tại.`, "info")
          } catch (t) {
            if ("nle_image_asset_missing" === aF(t)) {
              let t = (0, aT.cloneExportDesignPresetLayers)(e.exportLayers.filter(e => "image" !== e.type));
              await (0, tv.trackProjectVisualMutation)(ey.id, () => eA(t, void 0, e.subtitleStyle)), h(t[0]?.id ?? null), await (0, I.showMessage)("Cần chọn lại ảnh preset", "Đã áp dụng style và overlay còn hợp lệ. Ảnh logo cũ không còn tồn tại, hãy chọn lại ảnh rồi lưu preset.", "warning");
              return
            }
            await (0, I.showMessage)("Không thể áp dụng preset", "Dữ liệu preset không thể lưu hoặc áp dụng.", "error")
          }
        }
      }, tn = async () => {
        eb && (es(eb.id), ed(null), await (0, I.showMessage)("Đã xóa preset", `"${eb.name}" đ\xe3 được x\xf3a.`, "info"))
      };
    if (!ey) return (0, t.jsx)("div", {
      "data-testid": "desktop-view-editor",
      className: "flex h-full items-center justify-center bg-background p-6",
      children: (0, t.jsxs)("div", {
        className: "flex max-w-md flex-col items-center text-center",
        children: [(0, t.jsx)("div", {
          className: "mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary",
          children: (0, t.jsx)(s.Film, {
            className: "h-7 w-7"
          })
        }), (0, t.jsx)("h1", {
          className: "text-lg font-semibold",
          children: "Chưa chọn video"
        }), (0, t.jsx)("p", {
          className: "mt-2 text-sm leading-6 text-muted-foreground",
          children: "Trình chỉnh sửa dùng để xem lại kết quả, chỉnh phụ đề và xuất video đã xử lý."
        }), (0, t.jsxs)("div", {
          className: "mt-5 flex flex-wrap justify-center gap-2",
          children: [(0, t.jsxs)(y.Button, {
            size: "sm",
            onClick: () => void T("dashboard", ej?.projectId),
            children: [(0, t.jsx)(l.Home, {
              className: "h-3.5 w-3.5"
            }), "Trang chủ"]
          }), (0, t.jsxs)(y.Button, {
            size: "sm",
            variant: "outline",
            onClick: () => void T("history", ej?.projectId),
            children: [(0, t.jsx)(o.History, {
              className: "h-3.5 w-3.5"
            }), "Lịch sử"]
          })]
        })]
      })
    });
    let ts = "error" === ey.status;
    return (0, t.jsxs)("div", {
      "data-testid": "desktop-view-editor",
      "data-editor-renderer": "legacy-1.1.10",
      className: "flex h-full flex-col bg-background",
      children: [(0, t.jsx)("div", {
        className: "border-b border-border bg-card/45 px-4 py-3",
        children: (0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-3",
          children: [(0, t.jsxs)("div", {
            className: "min-w-0 flex-1",
            children: [(0, t.jsx)("div", {
              className: "mb-1 flex flex-wrap items-center gap-2",
              children: (0, t.jsx)(b.Badge, {
                variant: e7.variant,
                title: e7.title,
                className: "text-[10px]",
                children: e7.label
              })
            }), (0, t.jsx)("h1", {
              className: "truncate text-sm font-semibold",
              children: ey.name
            }), (0, t.jsxs)("p", {
              className: "mt-1 truncate text-xs text-muted-foreground",
              children: [(0, R.formatDuration)(ey.duration), " · ", (0, R.formatFileSize)(ey.size), " · ", ey.width, "x", ey.height, eZ && e8 ? (0, t.jsxs)(t.Fragment, {
                children: [" · Xử lý: ", e8]
              }) : null]
            }), ey.sourceMissing ? (0, t.jsx)("p", {
              "data-editor-source-missing-note": !0,
              className: "mt-1 truncate text-[11px] text-warning-foreground",
              title: ey.path,
              children: "Thiếu file gốc, cần import lại để xử lý tiếp."
            }) : null]
          }), (0, t.jsxs)("div", {
            "data-editor-header-actions": !0,
            className: "flex shrink-0 items-center gap-2",
            children: [eZ ? null : (0, t.jsxs)(y.Button, {
              variant: "outline",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => void e6(),
              disabled: eK,
              children: [eK ? (0, t.jsx)(c.Loader2, {
                className: "h-3.5 w-3.5 animate-spin"
              }) : (0, t.jsx)(v.Wand2, {
                className: "h-3.5 w-3.5"
              }), eK ? "Đang xử lý" : "Dịch video"]
            }), ts ? (0, t.jsx)(aC.ErrorSupportLogButton, {
              videoId: ey.id,
              videoName: ey.name,
              className: "h-8 text-xs"
            }) : null, (0, t.jsx)(Q, {}), e2 ? (0, t.jsx)("span", {
              className: "inline-flex",
              title: e3,
              children: (0, t.jsxs)(y.Button, {
                variant: "outline",
                size: "sm",
                className: "h-8 text-xs",
                onClick: () => void e9(),
                disabled: !e5,
                children: [eK ? (0, t.jsx)(c.Loader2, {
                  className: "h-3.5 w-3.5 animate-spin"
                }) : (0, t.jsx)(d.Mic2, {
                  className: "h-3.5 w-3.5"
                }), "Tạo lại âm thanh"]
              })
            }) : null, (0, t.jsxs)(y.Button, {
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => V(!0),
              disabled: !eZ || eK,
              children: [(0, t.jsx)(n.Download, {
                className: "h-3.5 w-3.5"
              }), "Xuất Video"]
            })]
          })]
        })
      }), eO ? (0, t.jsxs)("div", {
        className: "border-b border-border bg-primary/5 px-4 py-2.5",
        children: [(0, t.jsxs)("div", {
          className: "mb-1 flex items-center justify-between gap-4 text-xs",
          children: [(0, t.jsxs)("div", {
            className: "flex min-w-0 items-center gap-2",
            children: [(0, t.jsx)(c.Loader2, {
              className: "h-3.5 w-3.5 shrink-0 animate-spin text-primary"
            }), (0, t.jsx)("span", {
              className: "truncate text-muted-foreground",
              children: eO.message
            })]
          }), (0, t.jsx)("span", {
            className: "shrink-0 font-mono tabular-nums text-primary",
            children: (0, av.formatBasisPoints)(eH)
          })]
        }), (0, t.jsx)(S.Progress, {
          value: eH / 100,
          className: "h-1.5"
        }), eq ? (0, t.jsx)("p", {
          className: "mt-1 text-[11px] tabular-nums text-muted-foreground",
          children: eq
        }) : null]
      }) : null, e$ && !eO ? (0, t.jsxs)("div", {
        "data-final-delivery-recovery": !0,
        className: "flex flex-wrap items-center gap-2 border-b border-amber-500/30 bg-amber-500/5 px-4 py-2.5",
        children: [(0, t.jsx)("span", {
          className: "min-w-0 flex-1 text-xs text-amber-900 dark:text-amber-100",
          children: e$.message
        }), (0, t.jsx)(y.Button, {
          type: "button",
          size: "sm",
          onClick: () => void et(e$.id),
          children: "Thử lưu lại"
        }), (0, t.jsx)(y.Button, {
          type: "button",
          size: "sm",
          variant: "outline",
          onClick: () => void er(e$.id),
          children: "Lưu sang nơi khác"
        })]
      }) : null, (0, t.jsx)("div", {
        className: "min-h-0 flex-1 overflow-hidden",
        children: (0, t.jsxs)("div", {
          className: "flex h-full min-w-0 flex-row",
          children: [(0, t.jsx)("div", {
            className: "min-h-0 flex-1 overflow-y-auto p-3",
            children: (0, t.jsxs)("div", {
              className: "flex min-h-full flex-col gap-3",
              children: [(0, t.jsx)("div", {
                className: "relative z-10 overflow-hidden rounded-lg border border-border bg-card/60",
                children: (0, t.jsx)(iG, {
                  exportLayers: eE,
                  selectedExportLayerId: e,
                  onExportLayersChange: eL,
                  onExportLayerGestureCommit: eB,
                  onSelectedExportLayerIdChange: h,
                  onSubtitlePreviewViewportChange: P,
                  onSubtitleStyleCommit: ez,
                  onSourceRemovalCommit: eD
                })
              }), (0, t.jsxs)("div", {
                className: "min-h-[440px]",
                children: [(0, t.jsxs)(M, {
                  children: [eG ? (0, t.jsx)(eC, {
                    model: eG,
                    disabled: eW,
                    highlighted: eU,
                    onApply: te,
                    onRestore: tt
                  }) : null, (0, t.jsx)(ew, {
                    videoId: ey.id,
                    subtitles: eM,
                    savedPairs: G.replacementPairs,
                    savedOccurrences: e_
                  })]
                }), (0, t.jsx)("div", {
                  className: "mt-3 min-h-[420px]",
                  children: (0, t.jsx)(an, {
                    highlightedCueIds: eP,
                    tempoMarkerCueIds: eT
                  })
                })]
              })]
            })
          }), (0, t.jsx)("aside", {
            "data-editor-right-panel": !0,
            "data-editor-export-panel": !0,
            className: "h-full min-h-[360px] w-[22rem] min-w-[22rem] max-w-[22rem] shrink-0 space-y-3 overflow-y-auto border-l border-border bg-card/30 p-3",
            children: (0, t.jsxs)(C.Tabs, {
              defaultValue: "subtitle-style",
              className: "space-y-3",
              children: [(0, t.jsxs)("div", {
                "data-export-design-preset-actions": !0,
                className: "flex items-center gap-1.5",
                children: [(0, t.jsxs)(N.Select, {
                  value: eb?.id ?? "",
                  onValueChange: ed,
                  children: [(0, t.jsx)(N.SelectTrigger, {
                    className: "h-8 min-w-0 flex-1 overflow-hidden text-xs",
                    "data-export-design-preset-select": !0,
                    "aria-label": "Chọn preset",
                    children: (0, t.jsx)(N.SelectValue, {
                      placeholder: "Chưa có preset — lưu để tạo"
                    })
                  }), (0, t.jsx)(N.SelectContent, {
                    children: ei.map(e => (0, t.jsxs)(N.SelectItem, {
                      value: e.id,
                      className: "text-xs",
                      children: [e.name, e.id === ea ? " ★" : ""]
                    }, e.id))
                  })]
                }), (0, t.jsxs)(y.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-8 shrink-0 px-2 text-xs",
                  "data-export-design-save-preset": !0,
                  title: "Lưu style phụ đề và overlay hiện tại thành preset mới (hoặc ghi đè preset cùng tên)",
                  onClick: () => void(ey && (eg(eb?.name ?? ""), ef(!ea), eh(!0))),
                  children: [(0, t.jsx)(u.Save, {
                    className: "h-3.5 w-3.5"
                  }), "Lưu"]
                }), (0, t.jsxs)(y.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  className: "h-8 shrink-0 px-2 text-xs",
                  "data-export-design-apply-preset": !0,
                  title: "Áp dụng preset đang chọn cho video hiện tại",
                  disabled: !eb,
                  onClick: () => void ta(),
                  children: [(0, t.jsx)(a.CopyCheck, {
                    className: "h-3.5 w-3.5"
                  }), "Áp dụng"]
                }), (0, t.jsx)(y.Button, {
                  type: "button",
                  size: "icon",
                  variant: "ghost",
                  className: "h-8 w-8 shrink-0",
                  "data-export-design-default-preset": !0,
                  title: "Đặt preset đang chọn làm mặc định cho video mới",
                  "aria-label": "Đặt preset mặc định",
                  disabled: !eb || eb.id === ea,
                  onClick: () => eb && eo(eb.id),
                  children: (0, t.jsx)(m.Star, {
                    className: eb?.id === ea ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"
                  })
                }), (0, t.jsx)(y.Button, {
                  type: "button",
                  size: "icon",
                  variant: "ghost",
                  className: "h-8 w-8 shrink-0",
                  "data-export-design-reset-preset": !0,
                  title: "Xóa preset đang chọn",
                  "aria-label": "Xóa preset đang chọn",
                  disabled: !eb,
                  onClick: () => void tn(),
                  children: (0, t.jsx)(x.Trash2, {
                    className: "h-3.5 w-3.5"
                  })
                })]
              }), (0, t.jsxs)(C.TabsList, {
                className: "grid h-8 w-full grid-cols-3",
                children: [(0, t.jsxs)(C.TabsTrigger, {
                  value: "subtitle-style",
                  className: "h-6 gap-1.5 text-xs",
                  children: [(0, t.jsx)(g, {
                    className: "h-3.5 w-3.5"
                  }), "Style"]
                }), (0, t.jsxs)(C.TabsTrigger, {
                  value: "overlay",
                  className: "h-6 gap-1.5 text-xs",
                  children: [(0, t.jsx)(p, {
                    className: "h-3.5 w-3.5"
                  }), "Overlay"]
                }), (0, t.jsxs)(C.TabsTrigger, {
                  value: "audio",
                  className: "h-6 gap-1.5 text-xs",
                  children: [(0, t.jsx)(f.Volume2, {
                    className: "h-3.5 w-3.5"
                  }), "Âm thanh"]
                })]
              }), (0, t.jsx)(C.TabsContent, {
                value: "subtitle-style",
                className: "mt-0",
                children: (0, t.jsx)(ap, {
                  onStyleCommit: ez
                })
              }), (0, t.jsx)(C.TabsContent, {
                value: "overlay",
                className: "mt-0",
                children: (0, t.jsx)(rj, {
                  compact: !0,
                  layers: eE,
                  canvasComposition: eR,
                  sourceRemoval: eI,
                  onCanvasCompositionChange: eF,
                  onSourceRemovalChange: eD,
                  selectedLayerId: e,
                  movingWatermarkAllowed: eV,
                  onLayersChange: eL,
                  onSelectedLayerIdChange: h,
                  onPickLogo: tr
                })
              }), (0, t.jsx)(C.TabsContent, {
                value: "audio",
                className: "mt-0",
                children: (0, t.jsx)(tX, {
                  videoId: ey.id,
                  track: eN.nativeTrackReady ? ey.projectAudioTrack : void 0,
                  previewPolicy: eN,
                  nleAvailable: eX,
                  nleSourceAudioMode: ey.nleDocument?.playback.sourceAudioMode,
                  disabled: eK || ey.nativeProjectReadiness?.exportState.state === "exporting"
                })
              })]
            })
          })]
        })
      }), (0, t.jsx)(j.Dialog, {
        open: eu,
        onOpenChange: eh,
        children: (0, t.jsxs)(j.DialogContent, {
          className: "max-w-sm",
          "data-export-design-preset-save-dialog": !0,
          children: [(0, t.jsxs)(j.DialogHeader, {
            children: [(0, t.jsx)(j.DialogTitle, {
              children: "Lưu preset"
            }), (0, t.jsx)(j.DialogDescription, {
              children: "Lưu style phụ đề và overlay hiện tại thành một preset đặt tên — ví dụ theo kênh. Trùng tên sẽ ghi đè preset cũ."
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-3",
            children: [(0, t.jsx)(k.Input, {
              value: ep,
              onChange: e => eg(e.target.value),
              placeholder: "Tên preset (ví dụ: Kênh Review)",
              autoFocus: !0,
              "data-export-design-preset-name-input": !0,
              onKeyDown: e => {
                "Enter" === e.key && ti()
              }
            }), (0, t.jsxs)("label", {
              className: "flex items-center gap-2 text-xs text-muted-foreground",
              htmlFor: "export-design-preset-default",
              children: [(0, t.jsx)(w.Checkbox, {
                id: "export-design-preset-default",
                checked: ex,
                onCheckedChange: e => ef(!0 === e),
                "data-export-design-preset-default-checkbox": !0
              }), "Dùng làm preset mặc định cho video mới"]
            })]
          }), (0, t.jsxs)(j.DialogFooter, {
            children: [(0, t.jsx)(y.Button, {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => eh(!1),
              children: "Hủy"
            }), (0, t.jsx)(y.Button, {
              type: "button",
              size: "sm",
              disabled: !ep.trim(),
              onClick: () => void ti(),
              "data-export-design-preset-save-confirm": !0,
              children: "Lưu"
            })]
          })]
        })
      }), (0, t.jsx)(aN, {
        open: E,
        onOpenChange: V,
        exportLayers: eE,
        subtitlePreviewViewport: _
      })]
    })
  }], 76722)
}]);