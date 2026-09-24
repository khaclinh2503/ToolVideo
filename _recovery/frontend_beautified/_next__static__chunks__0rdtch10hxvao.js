(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 54181, e => {
  "use strict";
  let t = Object.freeze({
      aspectRatio: "source",
      background: Object.freeze({
        mode: "none",
        color: "#000000",
        blur: 24
      })
    }),
    n = Object.freeze({
      enabled: !1,
      xPercent: 5,
      yPercent: 76,
      widthPercent: 90,
      heightPercent: 14,
      delogoBand: 6,
      softness: .5
    });

  function i(e) {
    return Math.max(2, 2 * Math.round(e / 2))
  }

  function r(e) {
    if (!e) return {
      ...n
    };
    let t = Math.min(100, Math.max(1, e.widthPercent)),
      i = Math.min(100, Math.max(1, e.heightPercent));
    return {
      enabled: !!e.enabled,
      xPercent: Math.min(100 - t, Math.max(0, e.xPercent)),
      yPercent: Math.min(100 - i, Math.max(0, e.yPercent)),
      widthPercent: t,
      heightPercent: i,
      delogoBand: Math.round(Math.min(64, Math.max(1, e.delogoBand))),
      softness: Math.min(1, Math.max(0, e.softness))
    }
  }
  e.s(["DEFAULT_CANVAS_COMPOSITION", 0, t, "DEFAULT_SOURCE_REMOVAL", 0, n, "SOURCE_REMOVAL_OVERLAY_ID", 0, "source-removal-overlay", "canvasCompositionForAspect", 0, function(e) {
    return "source" === e ? {
      aspectRatio: "source",
      background: {
        ...t.background
      }
    } : {
      aspectRatio: e,
      background: {
        mode: "blur",
        color: "#000000",
        blur: 24
      }
    }
  }, "canvasOutputSize", 0, function(e, t, n) {
    let r = Math.max(2, Math.round(e)),
      a = Math.max(2, Math.round(t));
    if ("source" === n) return {
      width: r,
      height: a
    };
    let s = Math.min(r, a);
    return "16:9" === n ? {
      width: i(16 * s / 9),
      height: i(s)
    } : {
      width: i(s),
      height: i(16 * s / 9)
    }
  }, "isSourceRemovalExportLayer", 0, function(e) {
    return "cover" === e.type && "remove" === e.effect
  }, "normalizedSourceRemoval", 0, r, "sourceRemovalFromExportLayer", 0, function(e) {
    return r({
      enabled: e.enabled,
      xPercent: e.xPercent,
      yPercent: e.yPercent,
      widthPercent: e.widthPercent,
      heightPercent: e.heightPercent,
      delogoBand: n.delogoBand,
      softness: n.softness
    })
  }])
}, 86682, e => {
  "use strict";
  var t, n, i, r, a;

  function s(e, t, n, i) {
    if ("a" === n && !i) throw TypeError("Private accessor was defined without a getter");
    if ("function" == typeof t ? e !== t || !i : !t.has(e)) throw TypeError("Cannot read private member from an object whose class did not declare it");
    return "m" === n ? i : "a" === n ? i.call(e) : i ? i.value : t.get(e)
  }

  function o(e, t, n, i, r) {
    if ("m" === i) throw TypeError("Private method is not writable");
    if ("a" === i && !r) throw TypeError("Private accessor was defined without a setter");
    if ("function" == typeof t ? e !== t || !r : !t.has(e)) throw TypeError("Cannot write private member to an object whose class did not declare it");
    return "a" === i ? r.call(e, n) : r ? r.value = n : t.set(e, n), n
  }
  "function" == typeof SuppressedError && SuppressedError;
  let l = "__TAURI_TO_IPC_KEY__";

  function c(e, t = !1) {
    return window.__TAURI_INTERNALS__.transformCallback(e, t)
  }
  class u {
    constructor(e) {
      t.set(this, void 0), n.set(this, 0), i.set(this, []), r.set(this, void 0), o(this, t, e || (() => {}), "f"), this.id = c(e => {
        let a = e.index;
        if ("end" in e) return void(a == s(this, n, "f") ? this.cleanupCallback() : o(this, r, a, "f"));
        let l = e.message;
        if (a == s(this, n, "f")) {
          for (s(this, t, "f").call(this, l), o(this, n, s(this, n, "f") + 1, "f"); s(this, n, "f") in s(this, i, "f");) {
            let e = s(this, i, "f")[s(this, n, "f")];
            s(this, t, "f").call(this, e), delete s(this, i, "f")[s(this, n, "f")], o(this, n, s(this, n, "f") + 1, "f")
          }
          s(this, n, "f") === s(this, r, "f") && this.cleanupCallback()
        } else s(this, i, "f")[a] = l
      })
    }
    cleanupCallback() {
      window.__TAURI_INTERNALS__.unregisterCallback(this.id)
    }
    set onmessage(e) {
      o(this, t, e, "f")
    }
    get onmessage() {
      return s(this, t, "f")
    } [(t = new WeakMap, n = new WeakMap, i = new WeakMap, r = new WeakMap, l)]() {
      return `__CHANNEL__:${this.id}`
    }
    toJSON() {
      return this[l]()
    }
  }
  async function d(e, t = {}, n) {
    return window.__TAURI_INTERNALS__.invoke(e, t, n)
  }
  a = new WeakMap, e.s(["Channel", 0, u, "Resource", 0, class {
    get rid() {
      return s(this, a, "f")
    }
    constructor(e) {
      a.set(this, void 0), o(this, a, e, "f")
    }
    async close() {
      return d("plugin:resources|close", {
        rid: this.rid
      })
    }
  }, "SERIALIZE_TO_IPC_FN", 0, l, "convertFileSrc", 0, function(e, t = "asset") {
    return window.__TAURI_INTERNALS__.convertFileSrc(e, t)
  }, "invoke", 0, d, "transformCallback", 0, c], 86682)
}, 68078, e => {
  "use strict";
  var t = e.i(86682);
  async function n(e = {}) {
    return "object" == typeof e && Object.freeze(e), await (0, t.invoke)("plugin:dialog|open", {
      options: e
    })
  }
  async function i(e = {}) {
    return "object" == typeof e && Object.freeze(e), await (0, t.invoke)("plugin:dialog|save", {
      options: e
    })
  }
  async function r(e, n) {
    return await (0, t.invoke)("plugin:dialog|message", {
      message: e,
      title: n?.title,
      kind: n?.kind,
      buttons: function(e) {
        if (void 0 !== e) {
          if ("string" == typeof e) return e;
          else if ("ok" in e && "cancel" in e) return {
            OkCancelCustom: [e.ok, e.cancel]
          };
          else if ("yes" in e && "no" in e && "cancel" in e) return {
            YesNoCancelCustom: [e.yes, e.no, e.cancel]
          };
          else if ("ok" in e) return {
            OkCustom: e.ok
          }
        }
      }(n?.buttons)
    })
  }
  async function a(e, t) {
    let n = "string" == typeof t ? {
      title: t
    } : t;
    return n && !n.buttons && n.okLabel && (n.buttons = {
      ok: n.okLabel
    }), r(e, n)
  }
  async function s(e, t) {
    let n = "string" == typeof t ? {
        title: t
      } : t,
      i = n?.okLabel || n?.cancelLabel,
      a = n?.okLabel ?? "Yes";
    return await r(e, {
      title: n?.title,
      kind: n?.kind,
      buttons: i ? {
        ok: a,
        cancel: n.cancelLabel ?? "No"
      } : "YesNo"
    }) === a
  }
  async function o(e, t) {
    let n = "string" == typeof t ? {
        title: t
      } : t,
      i = n?.okLabel || n?.cancelLabel,
      a = n?.okLabel ?? "Ok";
    return await r(e, {
      title: n?.title,
      kind: n?.kind,
      buttons: i ? {
        ok: a,
        cancel: n.cancelLabel ?? "Cancel"
      } : "OkCancel"
    }) === a
  }
  e.s(["ask", 0, s, "confirm", 0, o, "message", 0, a, "open", 0, n, "save", 0, i])
}, 68834, e => {
  "use strict";
  var t = e.i(71645);
  let n = e => {
      let t, n = new Set,
        i = (e, i) => {
          let r = "function" == typeof e ? e(t) : e;
          if (!Object.is(r, t)) {
            let e = t;
            t = (null != i ? i : "object" != typeof r || null === r) ? r : Object.assign({}, t, r), n.forEach(n => n(t, e))
          }
        },
        r = () => t,
        a = {
          setState: i,
          getState: r,
          getInitialState: () => s,
          subscribe: e => (n.add(e), () => n.delete(e))
        },
        s = t = e(i, r, a);
      return a
    },
    i = e => {
      let i = e ? n(e) : n,
        r = e => (function(e, n = e => e) {
          let i = t.default.useSyncExternalStore(e.subscribe, t.default.useCallback(() => n(e.getState()), [e, n]), t.default.useCallback(() => n(e.getInitialState()), [e, n]));
          return t.default.useDebugValue(i), i
        })(i, e);
      return Object.assign(r, i), r
    };
  e.s(["create", 0, e => e ? i(e) : i], 68834)
}, 79473, 48868, e => {
  "use strict";

  function t(e, t) {
    let n;
    try {
      n = e()
    } catch (e) {
      return
    }
    return {
      getItem: e => {
        var i;
        let r = e => null === e ? null : JSON.parse(e, null == t ? void 0 : t.reviver),
          a = null != (i = n.getItem(e)) ? i : null;
        return a instanceof Promise ? a.then(r) : r(a)
      },
      setItem: (e, i) => n.setItem(e, JSON.stringify(i, null == t ? void 0 : t.replacer)),
      removeItem: e => n.removeItem(e)
    }
  }
  let n = e => t => {
    try {
      let i = e(t);
      if (i instanceof Promise) return i;
      return {
        then: e => n(e)(i),
        catch (e) {
          return this
        }
      }
    } catch (e) {
      return {
        then(e) {
          return this
        },
        catch: t => n(t)(e)
      }
    }
  };

  function i(e, t) {
    "u" > typeof console && console.warn(`[persist] Kh\xf4ng lưu được trạng th\xe1i cục bộ cho ${e}. App sẽ tiếp tục xử l\xfd v\xe0 thử lưu lại sau.`, t)
  }

  function r(e) {
    try {
      return e()
    } catch {
      return null
    }
  }

  function a(e, t, n) {
    try {
      let r = e.setItem(t, n);
      if (r instanceof Promise) return r.catch(e => i(t, e));
      return r
    } catch (e) {
      i(t, e);
      return
    }
  }
  e.s(["createJSONStorage", 0, t, "persist", 0, (e, i) => (r, a, s) => {
    let o, l = {
        storage: t(() => window.localStorage),
        partialize: e => e,
        version: 0,
        merge: (e, t) => ({
          ...t,
          ...e
        }),
        ...i
      },
      c = !1,
      u = 0,
      d = new Set,
      m = new Set,
      g = l.storage;
    if (!g) return e((...e) => {
      console.warn(`[zustand persist middleware] Unable to update item '${l.name}', the given storage is currently unavailable.`), r(...e)
    }, a, s);
    let p = () => {
        let e = l.partialize({
          ...a()
        });
        return g.setItem(l.name, {
          state: e,
          version: l.version
        })
      },
      f = s.setState;
    s.setState = (e, t) => (f(e, t), p());
    let h = e((...e) => (r(...e), p()), a, s);
    s.getInitialState = () => h;
    let _ = () => {
      var e, t;
      if (!g) return;
      let i = ++u;
      c = !1, d.forEach(e => {
        var t;
        return e(null != (t = a()) ? t : h)
      });
      let s = (null == (t = l.onRehydrateStorage) ? void 0 : t.call(l, null != (e = a()) ? e : h)) || void 0;
      return n(g.getItem.bind(g))(l.name).then(e => {
        if (e)
          if ("number" != typeof e.version || e.version === l.version) return [!1, e.state];
          else {
            if (l.migrate) {
              let t = l.migrate(e.state, e.version);
              return t instanceof Promise ? t.then(e => [!0, e]) : [!0, t]
            }
            console.error("State loaded from storage couldn't be migrated since no migrate function was provided")
          } return [!1, void 0]
      }).then(e => {
        var t;
        if (i !== u) return;
        let [n, s] = e;
        if (r(o = l.merge(s, null != (t = a()) ? t : h), !0), n) return p()
      }).then(() => {
        i === u && (null == s || s(a(), void 0), o = a(), c = !0, m.forEach(e => e(o)))
      }).catch(e => {
        i === u && (null == s || s(void 0, e))
      })
    };
    return s.persist = {
      setOptions: e => {
        l = {
          ...l,
          ...e
        }, e.storage && (g = e.storage)
      },
      clearStorage: () => {
        null == g || g.removeItem(l.name)
      },
      getOptions: () => l,
      rehydrate: () => _(),
      hasHydrated: () => c,
      onHydrate: e => (d.add(e), () => {
        d.delete(e)
      }),
      onFinishHydration: e => (m.add(e), () => {
        m.delete(e)
      })
    }, l.skipHydration || _(), o || h
  }], 79473), e.s(["createLegacyStorage", 0, function(e, t) {
    let n = (e, t, n) => (null !== n && a(e, t, n), n);
    return {
      getItem: i => {
        let s, o = r(e);
        if (!o) return null;
        let l = o.getItem(i),
          c = (s = t[i]) ? Array.isArray(s) ? {
            keys: s
          } : s : {
            keys: []
          };
        if (l instanceof Promise) return l;
        if (null !== l) {
          if (!c.merge) return l;
          for (let e of c.keys) {
            let t = o.getItem(e);
            if (t instanceof Promise) break;
            if (null !== t) {
              let n = c.merge(l, t, e);
              return a(o, i, n), n
            }
          }
          return l
        }
        for (let e of c.keys) {
          let t = o.getItem(e);
          if (t instanceof Promise) return t.then(e => n(o, i, e));
          if (null !== t) return n(o, i, t)
        }
        return null
      },
      setItem: (t, n) => {
        let i = r(e);
        if (i) return a(i, t, n)
      },
      removeItem: t => {
        let n = r(e);
        n?.removeItem(t)
      }
    }
  }], 48868)
}, 54217, e => {
  "use strict";

  function t(e, t) {
    let n = [];
    t.forEach((t, i) => {
      if (!t.enabled || !t.from.trim()) return;
      let r = RegExp(`(?<![\\p{L}\\p{N}])${t.from.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?![\\p{L}\\p{N}])`, "giu");
      for (let a of e.matchAll(r)) void 0 !== a.index && a[0] && n.push({
        start: a.index,
        end: a.index + a[0].length,
        pair: t,
        pairOrder: i
      })
    }), n.sort((e, t) => e.start - t.start || t.end - t.start - (e.end - e.start) || e.pairOrder - t.pairOrder);
    let i = [],
      r = 0;
    for (let e of n) e.start < r || (i.push(e), r = e.end);
    return i.filter(t => e.slice(t.start, t.end) !== t.pair.to)
  }
  e.s(["findReplacementOccurrences", 0, function(e, n) {
    let i = [];
    for (let r of e)
      if (!r.excluded && r.translatedText)
        for (let e of t(r.translatedText, n)) i.push({
          pairId: e.pair.id,
          cueId: r.id,
          start: e.start,
          end: e.end,
          matchedText: r.translatedText.slice(e.start, e.end),
          from: e.pair.from,
          to: e.pair.to
        });
    return i
  }, "normalizeReplacementPairs", 0, function(e) {
    if (!Array.isArray(e)) return [];
    let t = new Set,
      n = [];
    for (let i of e) {
      if (!i || "object" != typeof i) continue;
      let e = "string" == typeof i.id ? i.id.trim() : "",
        r = "string" == typeof i.from ? i.from.trim() : "",
        a = "string" == typeof i.to ? i.to : "";
      if (!e || !r) continue;
      let s = r.toLocaleLowerCase("vi-VN");
      t.has(s) || (t.add(s), n.push({
        id: e,
        from: r,
        to: a,
        enabled: !1 !== i.enabled
      }))
    }
    return n
  }, "replaceReplacementOccurrenceInSubtitles", 0, function(e, n, i, r) {
    let a = [];
    return {
      subtitles: e.map(e => {
        if (e.id !== r.cueId || e.videoId !== n || e.excluded) return e;
        let s = t(e.translatedText, [i]).find(e => e.pair.id === r.pairId && e.start === r.start && e.end === r.end);
        if (!s) return e;
        let o = [e.translatedText.slice(0, s.start), i.to, e.translatedText.slice(s.end)].join("");
        return o === e.translatedText ? e : (a.push(e.id), {
          ...e,
          translatedText: o
        })
      }),
      changedCueIds: a
    }
  }, "replaceReplacementPairsInSubtitles", 0, function(e, n, i, r) {
    let a = r ? new Set(r) : null,
      s = [];
    return {
      subtitles: e.map(e => {
        if (e.videoId !== n || e.excluded || a && !a.has(e.id)) return e;
        let r = function(e, n) {
          let i = t(e, n);
          if (0 === i.length) return e;
          let r = 0,
            a = "";
          for (let t of i) a += e.slice(r, t.start), a += t.pair.to, r = t.end;
          return a + e.slice(r)
        }(e.translatedText, i);
        return r === e.translatedText ? e : (s.push(e.id), {
          ...e,
          translatedText: r
        })
      }),
      changedCueIds: s
    }
  }])
}, 61917, e => {
  "use strict";
  let t = [{
      value: "gpt-5.5",
      label: "GPT-5.5",
      description: "Mặc định cân bằng giữa tốc độ và chất lượng cho dịch phụ đề."
    }],
    n = "gpt-5.5",
    i = `${n}_batch`;

  function r(e) {
    return t.some(t => t.value === e)
  }

  function a(e, t) {
    let i = r(e) ? e : n;
    return "batch" === t ? `${i}_batch` : i
  }

  function s(e) {
    let t = e?.trim() ?? "",
      i = t.endsWith("_batch") ? "batch" : "sequential",
      a = "batch" === i ? t.slice(0, -6) : t;
    return {
      model: r(a) ? a : n,
      mode: r(a) ? i : "batch"
    }
  }
  e.s(["DEFAULT_GPT_TRANSLATE_PROCESS", 0, i, "DEFAULT_GPT_TRANSLATION_MODEL", 0, n, "normalizeGptTranslateProcess", 0, function(e) {
    let t = s(e);
    return a(t.model, t.mode)
  }, "parseGptTranslateProcess", 0, s, "toGptTranslateProcess", 0, a])
}, 76553, 52380, 92771, e => {
  "use strict";
  let t = {
    safe: {
      profile: "safe_low_resource",
      sttThreads: 1,
      sourceSeparationThreads: 1,
      translationConcurrency: 1,
      ttsConcurrency: 1,
      ffmpegThreads: 1
    },
    balanced: {
      profile: "balanced",
      sttThreads: 2,
      sourceSeparationThreads: 2,
      translationConcurrency: 2,
      ttsConcurrency: 2,
      ffmpegThreads: 2
    },
    fast: {
      profile: "fast",
      sttThreads: 4,
      sourceSeparationThreads: 4,
      translationConcurrency: 4,
      ttsConcurrency: 4,
      ffmpegThreads: 4
    }
  };

  function n(e) {
    return "safe" === e || "balanced" === e || "fast" === e ? e : "default"
  }
  e.s(["normalizeNativeResourcePolicyPreset", 0, n, "resolveNativeResourcePolicyForJob", 0, function(e) {
    let i = n(e);
    return "default" === i ? null : {
      ...t[i]
    }
  }], 76553);
  let i = "__dichvideoSettingsMigratedFromVideoGlm",
    r = ["sync_voice_timing", "display_subtitle_timing"];

  function a(e) {
    try {
      let t = JSON.parse(e);
      return t && "object" == typeof t ? t : null
    } catch {
      return null
    }
  }
  e.s(["mergeLegacySettingsStorage", 0, function(e, t) {
    let n = a(e),
      s = a(t);
    if (!n || !s || n[i]) return e;
    let o = n.state?.settings,
      l = s.state?.settings;
    if (!o || !l) return e;
    let c = o.sonitranslateSettings ?? {},
      u = l.sonitranslateSettings ?? {},
      d = {
        ...u,
        ...c
      };
    for (let e of r) void 0 !== u[e] && (d[e] = u[e]);
    return JSON.stringify({
      ...n,
      [i]: !0,
      state: {
        ...n.state,
        settings: {
          ...l,
          ...o,
          sonitranslateSettings: d
        }
      }
    })
  }], 52380), e.s(["CLIENT_FALLBACK_ENGINE_SETTINGS", 0, {
    transcriber_model: "server_policy",
    batch_size: 1,
    compute_type: "server_policy",
    min_speakers: 1,
    max_speakers: 1,
    mix_method_audio: "Adjusting volumes and mixing audio",
    max_accelerate_audio: 1,
    acceleration_rate_regulation: !1,
    volume_original_audio: .18,
    volume_translated_audio: 1,
    output_format_subtitle: "srt",
    avoid_overlap: !1,
    vocal_refinement: !1,
    literalize_numbers: !0,
    segment_duration_limit: 30,
    diarization_model: "disable",
    output_type: "video (mp4)",
    voiceless_track: !1,
    voice_imitation: !1,
    voice_imitation_max_segments: 1,
    voice_imitation_vocals_dereverb: !1,
    voice_imitation_remove_previous: !0,
    voice_imitation_method: "disabled",
    text_segmentation_scale: "sentence",
    divide_text_segments_by: "",
    soft_subtitles_to_video: !1,
    burn_subtitles_to_video: !1,
    enable_cache: !0,
    custom_voices: !1,
    custom_voices_workers: 1,
    sync_voice_timing: !1,
    display_subtitle_timing: "source_timing"
  }], 92771)
}, 99512, e => {
  "use strict";
  let t = [{
    id: "sample-marketing-b2b-saas",
    name: "Marketing B2B SaaS",
    description: "Bộ mẫu cho nội dung marketing, sales và sản phẩm SaaS B2B.",
    enabled: !1,
    groups: [{
      id: "sample-marketing-metrics",
      name: "Chỉ số kinh doanh",
      terms: [{
        id: "sample-marketing-mrr",
        source: "MRR",
        target: "doanh thu định kỳ hàng tháng"
      }, {
        id: "sample-marketing-arr",
        source: "ARR",
        target: "doanh thu định kỳ hàng năm"
      }, {
        id: "sample-marketing-churn",
        source: "churn rate",
        target: "tỷ lệ rời bỏ"
      }, {
        id: "sample-marketing-ltv",
        source: "LTV",
        target: "giá trị vòng đời khách hàng"
      }]
    }, {
      id: "sample-marketing-funnel",
      name: "Phễu bán hàng",
      terms: [{
        id: "sample-marketing-lead",
        source: "qualified lead",
        target: "khách hàng tiềm năng đủ điều kiện"
      }, {
        id: "sample-marketing-pipeline",
        source: "sales pipeline",
        target: "đường ống bán hàng"
      }, {
        id: "sample-marketing-onboarding",
        source: "onboarding",
        target: "hướng dẫn khởi tạo"
      }, {
        id: "sample-marketing-retention",
        source: "retention",
        target: "giữ chân khách hàng"
      }]
    }]
  }, {
    id: "sample-one-piece-wano",
    name: "One Piece arc Wano",
    description: "Bộ mẫu cho tên riêng, địa danh và thuật ngữ trong arc Wano.",
    enabled: !1,
    groups: [{
      id: "sample-wano-characters",
      name: "Tên nhân vật",
      terms: [{
        id: "sample-wano-luffy",
        source: "Monkey D. Luffy",
        target: "Monkey D. Luffy"
      }, {
        id: "sample-wano-zoro",
        source: "Roronoa Zoro",
        target: "Roronoa Zoro"
      }, {
        id: "sample-wano-kinemon",
        source: "Kin'emon",
        target: "Kin'emon"
      }, {
        id: "sample-wano-kaido",
        source: "Kaido",
        target: "Kaido"
      }]
    }, {
      id: "sample-wano-terms",
      name: "Địa danh và phe nhóm",
      terms: [{
        id: "sample-wano-wano-country",
        source: "Wano Country",
        target: "Vương quốc Wano"
      }, {
        id: "sample-wano-straw-hat",
        source: "Straw Hat Pirates",
        target: "Băng Mũ Rơm"
      }, {
        id: "sample-wano-akazaya",
        source: "Akazaya Nine",
        target: "Cửu Hồng Bao"
      }, {
        id: "sample-wano-beast",
        source: "Beast Pirates",
        target: "Băng Bách Thú"
      }]
    }]
  }, {
    id: "sample-cardiology",
    name: "Y khoa tim mạch",
    description: "Bộ mẫu cho video chuyên ngành tim mạch và can thiệp mạch.",
    enabled: !1,
    groups: [{
      id: "sample-cardiology-diagnosis",
      name: "Chẩn đoán",
      terms: [{
        id: "sample-cardiology-mi",
        source: "myocardial infarction",
        target: "nhồi máu cơ tim"
      }, {
        id: "sample-cardiology-heart-failure",
        source: "heart failure",
        target: "suy tim"
      }, {
        id: "sample-cardiology-arrhythmia",
        source: "arrhythmia",
        target: "rối loạn nhịp tim"
      }, {
        id: "sample-cardiology-angina",
        source: "angina",
        target: "đau thắt ngực"
      }]
    }, {
      id: "sample-cardiology-procedures",
      name: "Thủ thuật và điều trị",
      terms: [{
        id: "sample-cardiology-pci",
        source: "PCI",
        target: "can thiệp mạch vành qua da"
      }, {
        id: "sample-cardiology-stent",
        source: "stent",
        target: "giá đỡ mạch"
      }, {
        id: "sample-cardiology-beta-blocker",
        source: "beta blocker",
        target: "thuốc chẹn beta"
      }, {
        id: "sample-cardiology-anticoagulant",
        source: "anticoagulant",
        target: "thuốc chống đông"
      }]
    }]
  }];

  function n(e) {
    return "object" == typeof e && null !== e && !Array.isArray(e)
  }

  function i(e, t) {
    return String("string" == typeof e ? e : "").slice(0, t)
  }

  function r(e, t) {
    return String("string" == typeof e ? e : "").replace(/\s+/g, " ").trim().slice(0, t).trim()
  }

  function a(e, t, n) {
    return "string" == typeof e ? i(e, t) : n
  }

  function s(e, t) {
    return String("string" == typeof e ? e : "").trim().slice(0, t).trim()
  }

  function o(e, t) {
    return String("string" == typeof e ? e : "").trim() || t
  }

  function l(e) {
    return {
      dictionaries: (Array.isArray(e?.dictionaries) ? e.dictionaries : null == e ? t : []).slice(0, 30).map((e, t) => {
        let s, l;
        return l = Array.isArray((s = n(e) ? e : {}).groups) ? s.groups.slice(0, 20).map((e, t) => {
          let r, s;
          return s = Array.isArray((r = n(e) ? e : {}).terms) ? r.terms.slice(0, 500).map((e, t) => {
            let r;
            return {
              id: o((r = n(e) ? e : {}).id, `term-${t+1}`),
              source: i(r.source, 120),
              target: i(r.target, 160)
            }
          }) : [], {
            id: o(r.id, `group-${t+1}`),
            name: a(r.name, 80, "Thuật ngữ"),
            terms: s
          }
        }) : [], {
          id: o(s.id, `dictionary-${t+1}`),
          name: a(s.name, 80, `Bộ từ điển ${t+1}`),
          description: r(s.description, 80) ? i(s.description, 80) : void 0,
          enabled: !1 !== s.enabled,
          groups: l
        }
      })
    }
  }

  function c(e) {
    let t = l(e),
      n = [],
      i = new Set;
    for (let e of t.dictionaries)
      if (e.enabled)
        for (let t of e.groups)
          for (let a of t.terms) {
            let s = r(a.source, 120),
              o = r(a.target, 160);
            if (!s || !o) continue;
            let l = s.toLocaleLowerCase();
            if (!i.has(l) && (i.add(l), n.push({
                source: s,
                target: o,
                dictionaryName: r(e.name, 80),
                groupName: r(t.name, 80)
              }), n.length >= 200)) return n
          }
    return n
  }
  e.s(["MAX_ACTIVE_TRANSLATION_GLOSSARY_ENTRIES", 0, 200, "MAX_TRANSLATION_GLOSSARY_DICTIONARIES", 0, 30, "MAX_TRANSLATION_GLOSSARY_GROUPS_PER_DICTIONARY", 0, 20, "MAX_TRANSLATION_GLOSSARY_TERMS_PER_GROUP", 0, 500, "buildActiveTranslationGlossary", 0, c, "buildActiveTranslationGlossaryPayload", 0, function(e) {
    return c(e).map(e => ({
      source: e.source,
      target: e.target,
      dictionary_name: e.dictionaryName,
      group_name: e.groupName
    }))
  }, "normalizeTranslationGlossarySettings", 0, l, "parseTranslationGlossaryTermList", 0, function(e) {
    let t = [],
      n = 0;
    for (let i of e.split(/\r?\n/)) {
      let e = i.trim();
      if (!e) continue;
      let r = function(e) {
        let t = -1,
          n = "";
        for (let i of ["	", "=", ":", "|"]) {
          let r = e.indexOf(i);
          !(r < 0) && (t < 0 || r < t) && (t = r, n = i)
        }
        return t >= 0 ? {
          index: t,
          separator: n
        } : null
      }(e);
      if (!r) {
        n += 1;
        continue
      }
      let a = s(e.slice(0, r.index), 120),
        o = s(e.slice(r.index + r.separator.length), 160);
      if (!a || !o) {
        n += 1;
        continue
      }
      t.push({
        source: a,
        target: o
      })
    }
    return {
      terms: t,
      skippedLineCount: n
    }
  }])
}, 58749, e => {
  "use strict";
  let t = ["auto", "review_film", "concise", "youth", "romance_ceo", "comedy", "historical_drama", "reflective", "technical", "action", "capcut"],
    n = [...t, "custom"],
    i = [{
      id: "auto",
      label: "Tự động (khuyến nghị)",
      description: "Tự chọn văn phong phù hợp với nội dung.",
      group: "recommended"
    }, {
      id: "review_film",
      label: "Review phim",
      description: "Li kỳ, lôi cuốn và bám sát nội dung.",
      group: "builtin"
    }, {
      id: "concise",
      label: "Dịch ngắn gọn",
      description: "Rút gọn câu chữ nhưng giữ đủ ý.",
      group: "builtin"
    }, {
      id: "youth",
      label: "Ngôn ngữ giới trẻ",
      description: "Tự nhiên, hiện đại, hợp video giải trí.",
      group: "builtin"
    }, {
      id: "romance_ceo",
      label: "Tổng tài / ngôn tình",
      description: "Kịch tính, cảm xúc, hợp phim tình cảm.",
      group: "builtin"
    }, {
      id: "comedy",
      label: "Hài đời thường",
      description: "Đời thường, nhanh và giữ nhịp gây cười.",
      group: "builtin"
    }, {
      id: "historical_drama",
      label: "Cổ trang / kiếm hiệp",
      description: "Hợp phim cung đấu, giang hồ và lịch sử.",
      group: "builtin"
    }, {
      id: "reflective",
      label: "Tâm trạng / triết lý",
      description: "Sâu lắng, đồng cảm và mềm mại.",
      group: "builtin"
    }, {
      id: "technical",
      label: "Khoa học / kỹ thuật",
      description: "Ưu tiên thuật ngữ chính xác và rõ ý.",
      group: "builtin"
    }, {
      id: "action",
      label: "Hành động / kịch tính",
      description: "Nhanh, mạnh và súc tích.",
      group: "builtin"
    }, {
      id: "capcut",
      label: "Phụ đề ngắn kiểu CapCut",
      description: "Câu ngắn, gọn và dễ đọc trên video ngắn.",
      group: "builtin"
    }, {
      id: "custom",
      label: "Tự nhập yêu cầu",
      description: "Dùng yêu cầu dịch riêng của bạn.",
      group: "custom"
    }],
    r = {
      selection: {
        kind: "builtin",
        styleId: "auto"
      },
      savedPrompts: []
    },
    a = new Set(t),
    s = new Set(n),
    o = /[\p{Cc}\p{Cf}]/gu;

  function l(e) {
    return null !== e && "object" == typeof e ? e : null
  }

  function c(e, t) {
    return "string" != typeof e ? "" : Array.from(e.replace(o, " ").replace(/\s+/gu, " ").trim()).slice(0, t).join("").trim()
  }

  function u(e) {
    return "string" == typeof e ? e.trim() : ""
  }

  function d(e) {
    return e.normalize("NFKC").toLocaleLowerCase("vi-VN")
  }

  function m(e) {
    let t = l(e);
    if (!t) return null;
    let n = u(t.id),
      i = c(t.name, 60),
      r = g(t.prompt);
    return n && i && r ? {
      id: n,
      name: i,
      prompt: r
    } : null
  }

  function g(e) {
    return c(e, 800)
  }

  function p(e) {
    let t = l(e),
      n = function(e) {
        if (!Array.isArray(e)) return [];
        let t = new Set,
          n = new Set,
          i = [];
        for (let r of e) {
          let e = m(r);
          if (!e) continue;
          let a = d(e.name);
          t.has(e.id) || n.has(a) || (t.add(e.id), n.add(a), i.push(e))
        }
        return i
      }(t?.savedPrompts);
    return {
      selection: function(e, t) {
        let n = l(e);
        if (!n) return {
          ...r.selection
        };
        if ("builtin" === n.kind) {
          let e = function(e) {
            if ("string" != typeof e) return null;
            let t = e.trim().toLowerCase().replaceAll("-", "_");
            return a.has(t) ? t : null
          }(n.styleId);
          return e ? {
            kind: "builtin",
            styleId: e
          } : {
            ...r.selection
          }
        }
        if ("saved" === n.kind) {
          let e = u(n.savedPromptId);
          return t.some(t => t.id === e) ? {
            kind: "saved",
            savedPromptId: e
          } : {
            ...r.selection
          }
        }
        return "custom" === n.kind ? {
          kind: "custom",
          prompt: g(n.prompt)
        } : {
          ...r.selection
        }
      }(t?.selection, n),
      savedPrompts: n
    }
  }
  e.s(["CUSTOM_TRANSLATION_STYLE_PROMPT_MAX_CHARS", 0, 800, "DEFAULT_TRANSLATION_STYLE_SETTINGS", 0, r, "SAVED_TRANSLATION_STYLE_NAME_MAX_CHARS", 0, 60, "TRANSLATION_STYLE_OPTIONS", 0, i, "addSavedTranslationStylePrompt", 0, function(e, t) {
    let n = p(e),
      i = m(t);
    return i ? n.savedPrompts.some(e => e.id === i.id) ? {
      settings: n,
      error: "duplicate_id"
    } : n.savedPrompts.some(e => d(e.name) === d(i.name)) ? {
      settings: n,
      error: "duplicate_name"
    } : {
      settings: {
        selection: {
          kind: "saved",
          savedPromptId: i.id
        },
        savedPrompts: [...n.savedPrompts, i]
      },
      error: null
    } : {
      settings: n,
      error: "invalid_prompt"
    }
  }, "normalizeResolvedTranslationStyle", 0, function(e) {
    let t = l(e),
      n = "string" == typeof t?.styleId ? t.styleId.trim().toLowerCase().replaceAll("-", "_") : "auto",
      i = s.has(n) ? n : "auto",
      r = "custom" === i && g(t?.prompt) || null;
    return {
      styleId: i,
      prompt: r
    }
  }, "normalizeTranslationStylePrompt", 0, g, "normalizeTranslationStyleSettings", 0, p, "removeSavedTranslationStylePrompt", 0, function(e, t) {
    let n = p(e),
      i = u(t);
    return {
      selection: "saved" === n.selection.kind && n.selection.savedPromptId === i ? {
        kind: "builtin",
        styleId: "auto"
      } : n.selection,
      savedPrompts: n.savedPrompts.filter(e => e.id !== i)
    }
  }, "resolveTranslationStyleSelection", 0, function(e) {
    let t = p(e),
      n = t.selection;
    if ("builtin" === n.kind) return {
      styleId: n.styleId,
      prompt: null
    };
    if ("custom" === n.kind) return {
      styleId: "custom",
      prompt: g(n.prompt) || null
    };
    let i = t.savedPrompts.find(e => e.id === n.savedPromptId);
    return {
      styleId: "custom",
      prompt: i?.prompt ?? null
    }
  }, "setTranslationStyleSelection", 0, function(e, t) {
    let n = p(e);
    return p({
      ...n,
      selection: t
    })
  }, "translationStyleLabel", 0, function(e) {
    let t = p(e),
      n = t.selection;
    return "saved" === n.kind ? t.savedPrompts.find(e => e.id === n.savedPromptId)?.name ?? i[0].label : "custom" === n.kind ? "Yêu cầu chưa lưu" : i.find(e => e.id === n.styleId)?.label ?? i[0].label
  }, "updateSavedTranslationStylePrompt", 0, function(e, t, n) {
    let i = p(e),
      r = u(t),
      a = i.savedPrompts.find(e => e.id === r);
    if (!a) return {
      settings: i,
      error: "not_found"
    };
    let s = m({
      ...a,
      ...n,
      id: a.id
    });
    return s ? i.savedPrompts.some(e => e.id !== a.id && d(e.name) === d(s.name)) ? {
      settings: i,
      error: "duplicate_name"
    } : {
      settings: {
        ...i,
        savedPrompts: i.savedPrompts.map(e => e.id === a.id ? s : e)
      },
      error: null
    } : {
      settings: i,
      error: "invalid_prompt"
    }
  }])
}, 92719, e => {
  "use strict";
  var t = e.i(68834),
    n = e.i(79473),
    i = e.i(61917),
    r = e.i(54217),
    a = e.i(48868),
    s = e.i(76553),
    o = e.i(52380),
    l = e.i(92771),
    c = e.i(99512),
    u = e.i(58749),
    d = e.i(75157);
  let m = {
      ...l.CLIENT_FALLBACK_ENGINE_SETTINGS,
      tts_voice00: "vi-VN-NamMinhNeural-Male",
      tts_voice01: "en-US-AndrewMultilingualNeural-Male",
      tts_voice02: "en-US-AvaMultilingualNeural-Female",
      tts_voice03: "en-US-BrianMultilingualNeural-Male",
      tts_voice04: "de-DE-SeraphinaMultilingualNeural-Female",
      tts_voice05: "de-DE-FlorianMultilingualNeural-Male",
      tts_voice06: "fr-FR-VivienneMultilingualNeural-Female",
      tts_voice07: "fr-FR-RemyMultilingualNeural-Male",
      tts_voice08: "en-US-EmmaMultilingualNeural-Female",
      tts_voice09: "en-US-AndrewMultilingualNeural-Male",
      tts_voice10: "en-US-EmmaMultilingualNeural-Female",
      tts_voice11: "en-US-AndrewMultilingualNeural-Male",
      translate_process: i.DEFAULT_GPT_TRANSLATE_PROCESS,
      dereverb_automatic_xtts: !0,
      openai_base_url: "",
      openai_api_key: ""
    },
    g = {
      baseUrl: "",
      apiKey: "",
      timeoutSeconds: 1800
    },
    p = {
      mode: "source_timeline"
    },
    f = (0, c.normalizeTranslationGlossarySettings)(),
    h = {
      processingMode: "normal",
      nativeResourcePolicyPreset: "default",
      gpuWorker: g,
      theme: "light",
      language: "vi",
      sttEngine: "whisper",
      googleSpeechApiKey: "",
      translationEngine: i.DEFAULT_GPT_TRANSLATION_MODEL,
      translationGlossary: f,
      translationStyleSettings: u.DEFAULT_TRANSLATION_STYLE_SETTINGS,
      replacementPairs: [],
      deepLApiKey: "",
      ttsEngine: "piper",
      googleCloudApiKey: "",
      sonitranslateSettings: m,
      dubbingTimeline: p,
      genmaxApiKey: "",
      genmaxBaseUrl: "https://api.genmax.io",
      genmaxProvider: "elevenlabs",
      genmaxVoiceId: "",
      genmaxModelId: "eleven_multilingual_v2",
      genmaxLanguageCode: "vi",
      defaultExportPreset: "youtube",
      autoSave: !0,
      hardwareAcceleration: !0,
      maxConcurrentTasks: 2,
      cacheSize: 2048,
      modelsPath: "",
      outputDefaultPath: ""
    };

  function _(e) {
    return e?.mode === "fixed_voice_speed" && (12 === e.requestedVoiceRateTenths || 14 === e.requestedVoiceRateTenths) ? {
      mode: "fixed_voice_speed",
      requestedVoiceRateTenths: e.requestedVoiceRateTenths
    } : p
  }

  function y(e) {
    var t;
    let n, a = e ?? {},
      o = a.replacementPairs ?? a.bannedKeywords,
      l = {
        ...a
      };
    delete l.bannedKeywords;
    let d = {
      ...m,
      ...l.sonitranslateSettings ?? {}
    };
    d.transcriber_model = m.transcriber_model, d.batch_size = m.batch_size, d.compute_type = m.compute_type, d.min_speakers = 1, d.max_speakers = 1, d.diarization_model = "disable", d.custom_voices = !1, d.voice_imitation = !1, d.translate_process = (0, i.normalizeGptTranslateProcess)(d.translate_process), "voiceover_whisper" === d.display_subtitle_timing && (d.display_subtitle_timing = "voiceover_tts_chunks"), d.sync_voice_timing && (d.max_accelerate_audio = m.max_accelerate_audio, d.acceleration_rate_regulation = m.acceleration_rate_regulation, d.avoid_overlap = m.avoid_overlap, d.segment_duration_limit = m.segment_duration_limit, d.text_segmentation_scale = m.text_segmentation_scale, d.display_subtitle_timing = m.display_subtitle_timing), "voiceover_tts_chunks" === d.display_subtitle_timing && d.max_speakers <= 1 && (d.burn_subtitles_to_video = !1, d.soft_subtitles_to_video = !0);
    let p = (0, i.parseGptTranslateProcess)(d.translate_process);
    return {
      ...h,
      ...l,
      processingMode: (l.processingMode, "normal"),
      nativeResourcePolicyPreset: (0, s.normalizeNativeResourcePolicyPreset)(l.nativeResourcePolicyPreset),
      gpuWorker: (t = l.gpuWorker, n = Number(t?.timeoutSeconds ?? g.timeoutSeconds), {
        baseUrl: "string" == typeof t?.baseUrl ? t.baseUrl.trim() : g.baseUrl,
        apiKey: "string" == typeof t?.apiKey ? t.apiKey.trim() : g.apiKey,
        timeoutSeconds: Number.isFinite(n) ? Math.max(60, Math.min(7200, Math.round(n))) : g.timeoutSeconds
      }),
      translationEngine: p.model,
      translationGlossary: (0, c.normalizeTranslationGlossarySettings)(l.translationGlossary),
      translationStyleSettings: (0, u.normalizeTranslationStyleSettings)(l.translationStyleSettings),
      replacementPairs: (0, r.normalizeReplacementPairs)(o),
      sonitranslateSettings: d,
      dubbingTimeline: _(l.dubbingTimeline)
    }
  }
  let v = (0, t.create)()((0, n.persist)((e, t) => ({
    settings: h,
    updateSettings: t => e(e => ({
      settings: y({
        ...e.settings,
        ...t
      })
    })),
    addReplacementPair: (t, n) => e(e => ({
      settings: y({
        ...e.settings,
        replacementPairs: [...e.settings.replacementPairs, {
          id: (0, d.generateId)(),
          from: t,
          to: n,
          enabled: !0
        }]
      })
    })),
    updateReplacementPair: (t, n) => e(e => ({
      settings: y({
        ...e.settings,
        replacementPairs: e.settings.replacementPairs.map(e => e.id === t ? {
          ...e,
          ...n
        } : e)
      })
    })),
    removeReplacementPair: t => e(e => ({
      settings: y({
        ...e.settings,
        replacementPairs: e.settings.replacementPairs.filter(e => e.id !== t)
      })
    })),
    setTranslationStyleSelection: t => e(e => ({
      settings: y({
        ...e.settings,
        translationStyleSettings: (0, u.setTranslationStyleSelection)(e.settings.translationStyleSettings, t)
      })
    })),
    addSavedTranslationStylePrompt: (n, i) => {
      let r = (0, u.addSavedTranslationStylePrompt)(t().settings.translationStyleSettings, {
        id: (0, d.generateId)(),
        name: n,
        prompt: i
      });
      return r.error ? r.error : (e(e => ({
        settings: y({
          ...e.settings,
          translationStyleSettings: r.settings
        })
      })), null)
    },
    updateSavedTranslationStylePrompt: (n, i, r) => {
      let a = (0, u.updateSavedTranslationStylePrompt)(t().settings.translationStyleSettings, n, {
        name: i,
        prompt: r
      });
      return a.error ? a.error : (e(e => ({
        settings: y({
          ...e.settings,
          translationStyleSettings: a.settings
        })
      })), null)
    },
    removeSavedTranslationStylePrompt: t => e(e => ({
      settings: y({
        ...e.settings,
        translationStyleSettings: (0, u.removeSavedTranslationStylePrompt)(e.settings.translationStyleSettings, t)
      })
    })),
    resetSoniTranslateSettings: () => e(e => ({
      settings: {
        ...e.settings,
        sonitranslateSettings: m
      }
    })),
    setTranslationEngine: t => e(e => {
      let n = (0, i.parseGptTranslateProcess)(e.settings.sonitranslateSettings.translate_process).mode;
      return {
        settings: y({
          ...e.settings,
          translationEngine: t,
          sonitranslateSettings: {
            ...e.settings.sonitranslateSettings,
            translate_process: (0, i.toGptTranslateProcess)(t, n)
          }
        })
      }
    }),
    setTTSEngine: t => e(e => ({
      settings: {
        ...e.settings,
        ttsEngine: t
      }
    })),
    setTheme: t => e(e => ({
      settings: {
        ...e.settings,
        theme: t
      }
    })),
    resetSettings: () => e({
      settings: h
    })
  }), {
    name: "dichvideo-settings",
    storage: (0, n.createJSONStorage)(() => (0, a.createLegacyStorage)(() => localStorage, {
      "dichvideo-settings": {
        keys: ["video-glm-settings"],
        merge: o.mergeLegacySettingsStorage
      }
    })),
    partialize: e => ({
      settings: e.settings
    }),
    version: 4,
    migrate: function(e) {
      let t = e && "object" == typeof e && !Array.isArray(e) ? e : {},
        n = t.settings && "object" == typeof t.settings ? t.settings : {};
      return {
        ...t,
        settings: {
          ...n,
          nativeResourcePolicyPreset: "default",
          dubbingTimeline: function(e) {
            if (!e || "object" != typeof e || Array.isArray(e)) return p;
            if ("fixed_voice_speed" === e.mode) return _(e);
            if ("hybrid_stretch" !== e.mode) return p;
            let t = (t, n, i) => e.targetTempo === t && e.maxVideoSlowdown === n && e.maxTotalStretchRatio === i;
            return "hybrid_1_25" === e.presetId && t(1.25, 3, 3) ? {
              mode: "fixed_voice_speed",
              requestedVoiceRateTenths: 12
            } : "hybrid_1_4" === e.presetId && t(1.4, 3, 3) ? {
              mode: "fixed_voice_speed",
              requestedVoiceRateTenths: 14
            } : void 0 === e.presetId && t(1.25, 3, 3) ? {
              mode: "fixed_voice_speed",
              requestedVoiceRateTenths: 12
            } : void 0 === e.presetId && (t(1.45, 2, 1.3) || t(1.4, 3, 3)) ? {
              mode: "fixed_voice_speed",
              requestedVoiceRateTenths: 14
            } : p
          }(n.dubbingTimeline)
        }
      }
    },
    merge: (e, t) => ({
      ...t,
      ...e,
      settings: y(e?.settings)
    })
  }));
  e.s(["DEFAULT_SONITRANSLATE_SETTINGS", 0, m, "useSettingsStore", 0, v])
}]);