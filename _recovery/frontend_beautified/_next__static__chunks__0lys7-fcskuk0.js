(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 80796, e => {
  "use strict";
  let t = (0, e.i(56420).default)("film", [
    ["rect", {
      width: "18",
      height: "18",
      x: "3",
      y: "3",
      rx: "2",
      key: "afitv7"
    }],
    ["path", {
      d: "M7 3v18",
      key: "bbkbws"
    }],
    ["path", {
      d: "M3 7.5h4",
      key: "zfgn84"
    }],
    ["path", {
      d: "M3 12h18",
      key: "1i2n21"
    }],
    ["path", {
      d: "M3 16.5h4",
      key: "1230mu"
    }],
    ["path", {
      d: "M17 3v18",
      key: "in4fa5"
    }],
    ["path", {
      d: "M17 7.5h4",
      key: "myr1c1"
    }],
    ["path", {
      d: "M17 16.5h4",
      key: "go4c1d"
    }]
  ]);
  e.s(["Film", 0, t], 80796)
}, 17924, 47116, 64348, 44861, 47066, 33474, e => {
  "use strict";
  var t = e.i(46982);
  e.s(["getExportAudioPlan", 0, function(e, t) {
    let i = !!e.translatedVideoPath,
      r = (e.ttsAudioFiles?.filter(Boolean).length ?? 0) > 0,
      a = "original" !== t,
      n = a && r;
    return {
      videoPath: e.translatedVideoPath || e.cuePreviewTimelineVideoPath || e.path,
      hasRenderedVoiceVideo: i,
      hasTimelineTtsAudio: r,
      requiresTimelineTts: a && !r && !i,
      shouldBuildTimelineTts: n,
      finalAudioMode: n ? t : "original"
    }
  }, "mapExportLayersForNative", 0, function(e) {
    return (0, t.sortExportLayersForRender)(e).map(e => ({
      id: e.id,
      type: e.type,
      enabled: e.enabled,
      x_percent: e.xPercent,
      y_percent: e.yPercent,
      width_percent: e.widthPercent,
      height_percent: e.heightPercent,
      opacity: e.opacity,
      z_index: (0, t.getExportLayerRenderZIndex)(e),
      effect: "cover" === e.type ? e.effect : null,
      motion: "text" === e.type ? e.motion ?? "none" : null,
      color: "cover" === e.type || "text" === e.type ? e.color : null,
      text: "text" === e.type ? e.text : null,
      font_size: "text" === e.type ? e.fontSize : null,
      font_family: "text" === e.type ? e.fontFamily ?? t.EXPORT_TEXT_DEFAULT_FONT_FAMILY : null,
      font_weight: "text" === e.type ? e.fontWeight ?? t.EXPORT_TEXT_DEFAULT_FONT_WEIGHT : null,
      image_path: "image" === e.type ? e.imagePath : null
    }))
  }], 17924), e.s(["exportCacheBatchCompletionMessage", 0, function(e) {
    return !Number.isSafeInteger(e) || e <= 0 ? null : `${e} video đ\xe3 xuất nhưng kh\xf4ng lưu đầy đủ bộ nhớ tăng tốc; lần Xuất lại c\xf3 thể l\xe2u hơn.`
  }, "exportCacheCompletionNotice", 0, function(e) {
    return "fully_persisted" === e.overall || "not_applicable" === e.overall ? {
      affected: !1,
      kind: "none",
      message: null
    } : {
      affected: !0,
      kind: e.overall,
      message: function(e) {
        switch (e) {
          case "free_reserve":
            return "Video đã xuất thành công. Bộ nhớ tăng tốc không được lưu đầy đủ vì ổ đĩa cần chừa ít nhất 10 GiB; lần Xuất lại sau có thể lâu như lần đầu.";
          case "project_limit":
          case "app_limit":
            return "Video đã xuất thành công. Bộ nhớ tăng tốc không được lưu đầy đủ vì đã đạt giới hạn được cấu hình; lần Xuất lại sau có thể lâu như lần đầu.";
          case "capacity_unknown":
            return "Video đã xuất thành công. Bộ nhớ tăng tốc không được lưu đầy đủ vì không thể xác minh dung lượng trống an toàn; lần Xuất lại sau có thể lâu như lần đầu.";
          default:
            return "Video đã xuất thành công. Bộ nhớ tăng tốc không được lưu đầy đủ vì vị trí lưu bộ nhớ tăng tốc không thể được ghi an toàn; lần Xuất lại sau có thể lâu như lần đầu."
        }
      }(e.audio.reason ?? e.subtitles.reason)
    }
  }], 47116);
  var i = e.i(32217);
  let r = new Set(["native_final_delivery_request_invalid", "native_final_delivery_copy_failed", "native_final_delivery_durability_failed", "native_final_delivery_promote_failed", "native_final_delivery_verification_failed", "native_final_delivery_canceled"]);

  function a(e) {
    let t = (0, i.errorTextField)(e, "code") || (0, i.errorTextField)(e, "error_code");
    return r.has(t) ? t : null
  }
  e.s(["exportErrorDetails", 0, function(e) {
    let t = (0, i.errorTextField)(e, "customerMessage") || (0, i.errorTextField)(e, "customer_message"),
      r = e instanceof Error ? e.message.trim() : (0, i.errorTextField)(e, "message") || (0, i.errorTextField)(e, "error") || (0, i.errorTextField)(e, "detail"),
      a = (0, i.errorTextField)(e, "code") || (0, i.errorTextField)(e, "error_code"),
      n = "string" == typeof e ? e.trim() : "";
    return {
      userMessage: t || r || a || n || "Xuất video thất bại.",
      developerDiagnostic: (0, i.diagnosticTextForPipelineError)(e)
    }
  }, "finalDeliveryFailureCode", 0, a, "finalDeliveryFailureMessage", 0, function(e) {
    return a(e) ? "Video đã tạo xong nhưng chưa lưu được. Hãy thử lưu lại, không cần xuất lại." : null
  }], 64348);
  let n = {
      export_insufficient_space: "Ổ đĩa không đủ dung lượng trống.",
      export_destination_unwritable: "Không thể ghi video vào thư mục đã chọn.",
      export_destination_exists: "Tệp đã tồn tại. Hãy chọn tên khác.",
      export_source_missing: "Không tìm thấy video gốc.",
      export_plan_invalid: "Dữ liệu chỉnh sửa của project không hợp lệ.",
      export_ffmpeg_start_failed: "Không thể khởi động bộ xuất video.",
      export_source_decode_failed: "Không thể đọc video gốc.",
      export_source_audio_decode_failed: "Không thể đọc âm thanh của video gốc.",
      export_subtitle_render_failed: "Không thể tạo phụ đề trên video.",
      export_visual_render_failed: "Không thể tạo hình ảnh cho video.",
      export_audio_mix_failed: "Không thể tạo âm thanh cho video.",
      export_all_encoders_failed: "Không thể mã hóa video trên máy này.",
      export_frame_count_mismatch: "Số khung hình của video xuất không chính xác.",
      export_duration_mismatch: "Thời lượng video xuất không chính xác.",
      export_codec_mismatch: "Định dạng mã hóa của video xuất không chính xác.",
      export_pixel_format_mismatch: "Định dạng màu của video xuất không chính xác.",
      export_audio_missing: "Video xuất bị thiếu âm thanh.",
      export_audio_endpoint_mismatch: "Âm thanh của video xuất chưa hoàn tất đúng thời lượng.",
      export_final_flush_failed: "Không thể hoàn tất việc ghi file video.",
      export_final_replace_denied: "Không thể lưu đè file đã có.",
      export_final_path_verification_failed: "Không thể hoàn tất file video tại vị trí đã chọn.",
      export_partial_cleanup_failed: "Không thể xóa file video xuất dở.",
      export_internal_unclassified: "Xuất video gặp lỗi chưa xác định."
    },
    o = {
      export_insufficient_space: "preflight",
      export_destination_unwritable: "preflight",
      export_destination_exists: "preflight",
      export_source_missing: "preflight",
      export_plan_invalid: "snapshot",
      export_ffmpeg_start_failed: "render",
      export_source_decode_failed: "render",
      export_source_audio_decode_failed: "audio",
      export_subtitle_render_failed: "visual",
      export_visual_render_failed: "visual",
      export_audio_mix_failed: "audio",
      export_all_encoders_failed: "render",
      export_frame_count_mismatch: "verify",
      export_duration_mismatch: "verify",
      export_codec_mismatch: "verify",
      export_pixel_format_mismatch: "verify",
      export_audio_missing: "verify",
      export_audio_endpoint_mismatch: "verify",
      export_final_flush_failed: "promote",
      export_final_replace_denied: "promote",
      export_final_path_verification_failed: "promote",
      export_partial_cleanup_failed: "cleanup",
      export_internal_unclassified: "internal"
    };
  async function s(e, t) {
    let i, r, a, n, o, s, l, c, d;
    if (!await t(e)) return e;
    let {
      directory: u,
      stem: h,
      extension: p,
      nextNumber: f
    } = (i = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/")), r = e.slice(0, i + 1), s = (o = (n = (a = e.slice(i + 1)).lastIndexOf(".")) > 0) ? a.slice(n) : "", l = o ? a.slice(0, n) : a, d = (c = /^(.*) \((\d+)\)$/.exec(l)) ? Number.parseInt(c[2], 10) : 0, c && Number.isSafeInteger(d) ? {
      directory: r,
      stem: c[1],
      extension: s,
      nextNumber: d + 1
    } : {
      directory: r,
      stem: l,
      extension: s,
      nextNumber: 1
    });
    for (let e = f; Number.isSafeInteger(e); e += 1) {
      let i = `${u}${h} (${e})${p}`;
      if (!await t(i)) return i
    }
    throw Error("export_output_name_unavailable")
  }
  e.s(["directExportErrorDetails", 0, function(e) {
    let t = (0, i.errorTextField)(e, "code") || (0, i.errorTextField)(e, "error_code") || null,
      r = t ? o[t] ?? null : null,
      a = (0, i.errorTextField)(e, "diagnosticCode") || (0, i.errorTextField)(e, "diagnostic_code") || null,
      s = (0, i.diagnosticTextForPipelineError)(e),
      l = "export_visual_render_failed" === t && (s.includes("export_visual_input_missing") || s.includes("image layer file not found"));
    return {
      code: t,
      stage: r,
      diagnosticCode: a,
      userMessage: l ? "Ảnh logo hoặc overlay không còn tồn tại. Hãy chọn lại ảnh hoặc xóa lớp ảnh rồi xuất lại." : t && n[t] || n.export_internal_unclassified,
      developerDiagnostic: [r ? `stage=${r}` : "", a ? `diagnosticCode=${a}` : "", s].filter(Boolean).join(" | ").slice(0, 2048)
    }
  }], 44861), e.s(["exportOutputDirectory", 0, function(e) {
    let t = Math.max(e.lastIndexOf("\\"), e.lastIndexOf("/"));
    return t >= 0 ? e.slice(0, t + 1) : null
  }, "resolveAvailableExportPath", 0, s], 47066);
  var l = e.i(35612),
    c = e.i(53397);
  let d = "subtitle-png-object-cache-v1",
    u = "css-preview-png-v1",
    h = new Map;

  function p(e) {
    return Error(`subtitle_png_key_invalid:${e}`)
  }

  function f(e, t) {
    if ("number" != typeof e || !Number.isFinite(e)) throw p(t);
    return e
  }

  function g(e, t) {
    let i = f(e, t);
    if (!Number.isSafeInteger(i) || i <= 0) throw p(t);
    return i
  }

  function m(e, t) {
    if ("string" != typeof e) throw p(t);
    return e
  }

  function _(e, t) {
    let i = m(e, t);
    if (0 === i.length) throw p(t);
    return i
  }

  function y(e, t) {
    if ("boolean" != typeof e) throw p(t);
    return e
  }

  function v(e) {
    if (!e || "object" != typeof e) throw p("style");
    return {
      enabled: y(e.enabled, "style.enabled"),
      presetId: _(e.presetId, "style.presetId"),
      fontFamily: _(e.fontFamily, "style.fontFamily"),
      fontSize: f(e.fontSize, "style.fontSize"),
      fontColor: _(e.fontColor, "style.fontColor"),
      backgroundColor: _(e.backgroundColor, "style.backgroundColor"),
      backgroundOpacity: f(e.backgroundOpacity, "style.backgroundOpacity"),
      backgroundStyle: _(e.backgroundStyle, "style.backgroundStyle"),
      accentColor: _(e.accentColor, "style.accentColor"),
      position: _(e.position, "style.position"),
      alignment: _(e.alignment, "style.alignment"),
      maxWidthPercent: f(e.maxWidthPercent ?? 90, "style.maxWidthPercent"),
      offsetX: f(e.offsetX ?? 0, "style.offsetX"),
      offsetY: f(e.offsetY ?? 0, "style.offsetY"),
      bold: y(e.bold, "style.bold"),
      italic: y(e.italic, "style.italic"),
      outline: y(e.outline, "style.outline"),
      outlineColor: _(e.outlineColor, "style.outlineColor"),
      outlineWidth: f(e.outlineWidth, "style.outlineWidth"),
      shadow: y(e.shadow, "style.shadow"),
      shadowColor: _(e.shadowColor, "style.shadowColor"),
      wordsPerCaption: f(e.wordsPerCaption, "style.wordsPerCaption")
    }
  }
  async function x(e) {
    return (0, l.canonicalJsonSha256)(function(e) {
      if (e.schemaVersion !== d) throw p("schemaVersion");
      if (e.renderer !== u) throw p("renderer");
      return {
        schemaVersion: d,
        renderer: u,
        rendererContractVersion: _(e.rendererContractVersion, "rendererContractVersion"),
        appVersion: _(e.appVersion, "appVersion"),
        text: m(e.text, "text"),
        renderWidth: g(e.renderWidth, "renderWidth"),
        renderHeight: g(e.renderHeight, "renderHeight"),
        style: v(e.style),
        nativeGeometrySnapshotId: _(e.nativeGeometrySnapshotId, "nativeGeometrySnapshotId"),
        fontIdentity: _(e.fontIdentity, "fontIdentity"),
        layoutContractVersion: _(e.layoutContractVersion, "layoutContractVersion")
      }
    }(e))
  }

  function b(e, t) {
    let i = _(e, t);
    if (!/^[0-9a-f]{64}$/.test(i)) throw p(t);
    return i
  }
  async function w(e) {
    let t = e.cues.map((e, t) => {
      let i = Math.round(f(e.startMs, `cues.${t}.startMs`)),
        r = Math.round(f(e.endMs, `cues.${t}.endMs`));
      if (r <= i) throw p(`cues.${t}.timing`);
      return {
        renderKey: b(e.renderKey, `cues.${t}.renderKey`),
        startMs: i,
        endMs: r
      }
    });
    return (0, l.canonicalJsonSha256)({
      schemaVersion: "subtitle-overlay-manifest-cache-v1",
      renderer: u,
      renderWidth: g(e.renderWidth, "renderWidth"),
      renderHeight: g(e.renderHeight, "renderHeight"),
      blankRenderKey: b(e.blankRenderKey, "blankRenderKey"),
      cues: t
    })
  }
  async function S() {
    if ("u" < typeof navigator) return {
      userAgent: null,
      platformVersion: null
    };
    let e = navigator.userAgent?.trim() || null,
      t = navigator.userAgentData;
    if (!t?.getHighEntropyValues) return {
      userAgent: e,
      platformVersion: null
    };
    try {
      let i = await t.getHighEntropyValues(["platformVersion"]);
      return {
        userAgent: e,
        platformVersion: i.platformVersion?.trim() || null
      }
    } catch {
      return {
        userAgent: e,
        platformVersion: null
      }
    }
  }
  async function P(e, t) {
    return new Promise(i => {
      let r = !1,
        a = e => {
          r || (r = !0, clearTimeout(n), i(e))
        },
        n = setTimeout(() => a(!1), Math.max(1, t));
      e.then(() => a(!0), () => a(!1))
    })
  }
  async function k(e, t) {
    let i = h.get(e);
    if (i) return i;
    let r = t(e).then(l.sha256Hex);
    h.set(e, r);
    try {
      return await r
    } catch (t) {
      throw h.get(e) === r && h.delete(e), t
    }
  }

  function M(e, t, i) {
    return {
      cacheable: !1,
      identity: null,
      optionId: e,
      assetPath: t,
      assetSha256: null,
      reason: i
    }
  }
  async function C(e, t = {
    loadFont: async e => {
      if ("u" < typeof document || !("fonts" in document)) throw Error("font_set_unavailable");
      return document.fonts.load(e)
    },
    checkFont: e => "u" > typeof document && "fonts" in document && document.fonts.check(e),
    readAssetBytes: async e => {
      let t = await fetch(e, {
        cache: "force-cache"
      });
      if (!t.ok) throw Error(`font_asset_http_${t.status}`);
      return new Uint8Array(await t.arrayBuffer())
    },
    getSystemFontEnvironment: S,
    timeoutMs: 3e3
  }) {
    let i, r = (0, c.resolveSubtitleExportFontOption)(e.fontFamily),
      a = (0, c.getSubtitleCanvasFontWeight)(e.bold);
    if ("system" === r.id) {
      let e = await t.getSystemFontEnvironment().catch(() => ({
        userAgent: null,
        platformVersion: null
      }));
      if (!e.userAgent?.trim() || !e.platformVersion?.trim()) return M(r.id, null, "system_environment_incomplete");
      let i = await (0, l.canonicalJsonSha256)({
        schemaVersion: "subtitle-system-font-environment-v1",
        optionId: r.id,
        fontWeight: a,
        userAgent: e.userAgent,
        platformVersion: e.platformVersion
      });
      return {
        cacheable: !0,
        identity: `system:sha256:${i}`,
        optionId: r.id,
        assetPath: null,
        assetSha256: null
      }
    }
    let n = (0, c.getSubtitleFontAssetPath)(r, a) ?? null;
    if (!n) return M(r.id, null, "bundled_asset_missing");
    let o = `${a} 24px ${(i=r.cssFamily.replace(/"/g,""),/\s/.test(i)?`"${i}"`:i)}`;
    if (!await P(Promise.resolve().then(() => t.loadFont(o)), t.timeoutMs)) return M(r.id, n, "font_load_failed_or_timed_out");
    try {
      if (!t.checkFont(o)) return M(r.id, n, "font_check_failed")
    } catch {
      return M(r.id, n, "font_check_failed")
    }
    try {
      let e = await k(n, t.readAssetBytes);
      return {
        cacheable: !0,
        identity: `bundled:${r.id}:sha256:${e}`,
        optionId: r.id,
        assetPath: n,
        assetSha256: e
      }
    } catch {
      return M(r.id, n, "font_asset_hash_failed")
    }
  }

  function I(e) {
    switch (e) {
      case "corrupt":
        return 4;
      case "budget_bypass":
        return 3;
      case "write_bypass":
        return 2;
      case "miss":
        return 1;
      case "hit":
        return 0
    }
  }

  function E(e, t) {
    return I(t) > I(e) ? t : e
  }

  function j(e) {
    return {
      startMs: Math.round(e.startTime),
      endMs: Math.round(e.endTime)
    }
  }
  async function T(e, t, i, r = 0, a = () => void 0) {
    let n = e.events.length + 1,
      o = 0;
    a({
      completed: 0,
      total: n
    });
    let s = 0,
      l = async e => {
        let i = t.nowMs(),
          r = await e();
        return s += Math.max(0, t.nowMs() - i), r
      }, c = await l(t.renderBlank), d = await t.writeScratchObject({
        renderKey: "blank",
        bytes: c
      });
    a({
      completed: ++o,
      total: n
    });
    let u = [];
    for (let [i, r] of e.events.entries()) {
      let e = await l(() => t.renderEvent(r)),
        s = await t.writeScratchObject({
          renderKey: `cue-${String(i).padStart(6,"0")}`,
          bytes: e
        }),
        c = j(r);
      u.push({
        path: s,
        start_ms: c.startMs,
        end_ms: c.endMs
      }), a({
        completed: ++o,
        total: n
      })
    }
    return {
      manifestPath: await t.writeScratchManifest({
        version: 1,
        renderer: "css-preview-png-v1",
        render_width: e.renderWidth,
        render_height: e.renderHeight,
        blank_path: d,
        cues: u
      }),
      cueCount: e.events.length,
      cacheMetrics: {
        status: i,
        hitCount: 0,
        missCount: e.events.length,
        renderMs: s,
        evictedBytes: r
      }
    }
  }
  async function $(e, t, i = () => void 0) {
    let r, a, n, o, s, l, c = e.cacheContext,
      h = e.fontIdentity;
    if (!c || !h?.cacheable) return T(e, t, "write_bypass", 0, i);
    try {
      let t = (t, i) => {
        var r;
        let a, n, o;
        return x((r = {
          rendererContractVersion: "css-preview-png-contract-v1",
          appVersion: c.appVersion,
          text: t,
          renderWidth: e.renderWidth,
          renderHeight: e.renderHeight,
          style: e.style,
          fontIdentity: h.identity,
          layoutContractVersion: "subtitle-text-layout-v1",
          nativeGeometrySnapshotId: i
        }, a = g(r.renderWidth, "renderWidth"), n = g(r.renderHeight, "renderHeight"), o = v(r.style), {
          schemaVersion: d,
          renderer: u,
          rendererContractVersion: _(r.rendererContractVersion, "rendererContractVersion"),
          appVersion: _(r.appVersion, "appVersion"),
          text: m(r.text, "text"),
          renderWidth: a,
          renderHeight: n,
          style: o,
          nativeGeometrySnapshotId: _(r.nativeGeometrySnapshotId, "nativeGeometrySnapshotId"),
          fontIdentity: _(r.fontIdentity, "fontIdentity"),
          layoutContractVersion: _(r.layoutContractVersion, "layoutContractVersion")
        }))
      };
      r = await t("", "native-geometry-blank-v1"), a = await Promise.all(e.events.map(i => t(i.text, e.geometrySnapshotIds?.[i.id] ?? "native-geometry-unavailable"))), n = e.events.map((e, t) => ({
        renderKey: a[t],
        ...j(e)
      })), o = await w({
        renderWidth: e.renderWidth,
        renderHeight: e.renderHeight,
        blankRenderKey: r,
        cues: n
      }), s = [...new Set([r, ...a])]
    } catch {
      return T(e, t, "write_bypass", 0, i)
    }
    try {
      l = await t.lookup({
        cacheSessionId: c.cacheSessionId,
        projectId: c.projectId,
        manifestKey: o,
        renderKeys: s
      })
    } catch {
      return T(e, t, "write_bypass", 0, i)
    }
    let p = Math.max(0, l.evictedBytes),
      f = e.events.length + 1;
    if (!e.requireScratchManifest && "hit" === l.status && l.manifestPath) return i({
      completed: 0,
      total: f
    }), i({
      completed: f,
      total: f
    }), {
      manifestPath: l.manifestPath,
      cueCount: e.events.length,
      cacheMetrics: {
        status: "hit",
        hitCount: e.events.length,
        missCount: 0,
        renderMs: 0,
        evictedBytes: p
      }
    };
    if ("budget_bypass" === l.status || "write_bypass" === l.status) return T(e, t, l.status, p, i);
    let y = new Set(s),
      b = new Map(l.objectHits.filter(e => y.has(e.renderKey)).map(e => [e.renderKey, e.path])),
      S = new Set(b.keys()),
      P = [r, ...a],
      k = () => {
        let e = new Set([...b.keys(), ...F.keys()]);
        i({
          completed: P.filter(t => e.has(t)).length,
          total: f
        })
      },
      M = a.filter(e => S.has(e)).length,
      C = e.events.length - M,
      I = l.status,
      V = 0,
      F = new Map;
    i({
      completed: 0,
      total: f
    }), k();
    let R = new Map;
    for (let [i, n] of(R.set(r, null), e.events.forEach((e, t) => {
        R.has(a[t]) || R.set(a[t], e)
      }), R)) {
      if (b.has(i)) continue;
      let e = t.nowMs(),
        r = n ? await t.renderEvent(n) : await t.renderBlank();
      V += Math.max(0, t.nowMs() - e);
      try {
        let e = await t.putObject({
          cacheSessionId: c.cacheSessionId,
          projectId: c.projectId,
          renderKey: i,
          pngBase64: function(e) {
            let t = "";
            for (let i = 0; i < e.length; i += 32768) t += String.fromCharCode(...e.subarray(i, i + 32768));
            return btoa(t)
          }(r)
        });
        if (p += Math.max(0, e.evictedBytes), I = E(I, e.status), e.persisted && e.path) {
          b.set(i, e.path), k();
          continue
        }
      } catch {
        I = E(I, "write_bypass")
      }
      let a = await t.writeScratchObject({
        renderKey: i,
        bytes: r
      });
      F.set(i, a), k()
    }
    let B = e => b.get(e) ?? F.get(e) ?? null,
      W = B(r),
      A = a.map(B);
    if (!W || A.some(e => !e)) throw Error("subtitle_overlay_object_path_missing");
    let H = b.size === s.length;
    if (!e.requireScratchManifest && H) try {
      let i = await t.putManifest({
        cacheSessionId: c.cacheSessionId,
        projectId: c.projectId,
        manifestKey: o,
        renderWidth: e.renderWidth,
        renderHeight: e.renderHeight,
        blankRenderKey: r,
        cues: n
      });
      if (p += Math.max(0, i.evictedBytes), I = E(I, i.status), i.persisted && i.path) return {
        manifestPath: i.path,
        cueCount: e.events.length,
        cacheMetrics: {
          status: I,
          hitCount: M,
          missCount: C,
          renderMs: V,
          evictedBytes: p
        }
      }
    } catch {
      I = E(I, "write_bypass")
    }
    return {
      manifestPath: await t.writeScratchManifest({
        version: 1,
        renderer: "css-preview-png-v1",
        render_width: e.renderWidth,
        render_height: e.renderHeight,
        blank_path: W,
        cues: e.events.map((e, t) => {
          let i = j(e);
          return {
            path: A[t],
            start_ms: i.startMs,
            end_ms: i.endMs
          }
        })
      }),
      cueCount: e.events.length,
      cacheMetrics: {
        status: e.requireScratchManifest ? I : E(I, "write_bypass"),
        hitCount: M,
        missCount: C,
        renderMs: V,
        evictedBytes: p
      }
    }
  }
  e.s(["exportSubtitleObjectsWithCacheV1", 0, $, "resolveSubtitleFontCacheIdentity", 0, C], 33474)
}, 40131, e => {
  "use strict";

  function t(e) {
    return (e.translatedText || e.originalText || "").replace(/\s+/g, " ").trim()
  }
  e.s(["getPreparedSubtitleDisplayText", 0, t, "getTimedSubtitleDisplayText", 0, function(e, i, r) {
    let a = t(e);
    if (!r || r.captionId !== e.id) return a;
    if (0 === r.chunks.length) return "";
    let n = 1e3 * i;
    return r.chunks.find(e => n >= e.placedStartMs && n < e.placedEndMs)?.text ?? (n < r.chunks[0].placedStartMs ? r.chunks[0].text : r.chunks[r.chunks.length - 1].text)
  }])
}, 54037, e => {
  "use strict";
  var t = e.i(75157);

  function i(e, t) {
    let i = (e || t).trim(),
      r = i.startsWith("#") ? i : `#${i}`;
    return /^#[0-9a-fA-F]{3}$/.test(r) ? `#${r[1]}${r[1]}${r[2]}${r[2]}${r[3]}${r[3]}` : /^#[0-9a-fA-F]{6}$/.test(r) ? r : /^#[0-9a-fA-F]{8}$/.test(r) ? r.slice(0, 7) : t
  }
  e.s(["getSubtitlePreviewClasses", 0, function(e) {
    return {
      container: (0, t.cn)("pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-move select-none touch-none text-center", "box-border max-w-full"),
      text: (0, t.cn)("m-0 inline-block max-w-full tracking-normal", "pill" === e.backgroundStyle ? "box-decoration-clone" : "")
    }
  }, "getSubtitlePreviewContainerStyle", 0, function(e, t = 1) {
    let i = Number.isFinite(t) && t >= 0 ? t : 1,
      r = e.nativeGeometry.maxWidth * i;
    return {
      width: `${r}px`,
      maxWidth: `${r}px`
    }
  }, "getSubtitlePreviewPositionPercent", 0, function(e, t = 0, i = 0) {
    let r = e.nativeGeometry,
      a = r.basePositionXPercent,
      n = r.basePositionYPercent,
      o = r.renderWidth > 0 ? r.centerX / r.renderWidth * 100 : a,
      s = r.renderHeight > 0 ? r.centerY / r.renderHeight * 100 : n;
    return {
      left: Math.min(100, Math.max(0, o + (Number.isFinite(t) ? t - r.appliedOffsetXPercent : 0))),
      top: Math.min(100, Math.max(0, s + (Number.isFinite(i) ? i - r.appliedOffsetYPercent : 0))),
      baseLeft: a,
      baseTop: n
    }
  }, "getSubtitlePreviewStyle", 0, function(e, t, r = 1) {
    var a, n;
    let o = Number.isFinite(r) && r >= 0 ? r : 1,
      s = t.nativeGeometry,
      l = i(e.shadowColor, "#000000"),
      c = s.hasPillBackground ? (a = e.backgroundColor || "#000000", n = e.backgroundOpacity, `${i(a,"#000000")}${Math.round(255*Math.max(0,Math.min(1,n))).toString(16).padStart(2,"0")}`) : "transparent";
    return {
      width: `${t.boxWidth*o}px`,
      height: `${t.boxHeight*o}px`,
      maxWidth: `${s.maxWidth*o}px`,
      display: "inline-block",
      boxSizing: "border-box",
      backgroundColor: c,
      borderRadius: `${t.radius*o}px`,
      padding: `${t.padding.vertical*o}px ${t.padding.horizontal*o}px`,
      fontSize: `${t.fontSize*o}px`,
      color: e.fontColor || "#FFFFFF",
      fontFamily: t.fontFamily,
      fontWeight: t.fontWeight,
      fontStyle: e.italic ? "italic" : "normal",
      lineHeight: `${s.lineHeight*o}px`,
      textAlign: e.alignment,
      textShadow: e.shadow ? `0 ${s.shadow.primaryOffsetY*o}px ${s.shadow.primaryBlur*o}px ${l}E6, 0 ${s.shadow.spreadOffsetY*o}px ${s.shadow.spreadBlur*o}px ${l}B8` : "none",
      WebkitTextStroke: s.outlineWidth > 0 ? `${s.outlineWidth*o}px ${e.outlineColor||"#000000"}` : "0 transparent",
      overflowWrap: "normal",
      wordBreak: "normal",
      whiteSpace: "pre",
      paintOrder: "stroke fill"
    }
  }])
}, 99240, e => {
  "use strict";
  var t = e.i(45638),
    i = e.i(53397);
  let r = new Map;
  async function a(e, t, i, r, a) {
    if ("u" < typeof document || !document.fonts) return;
    let n = `${r?"italic ":""}${t} ${Math.max(1,i)}px "${e}"`;
    await document.fonts.load(n, a.slice(0, 128) || "Tiếng Việt"), await document.fonts.ready
  }

  function n(e, t) {
    let i = e.measureText(t);
    return {
      text: t,
      width: Math.max(0, i.width),
      actualBoundingBoxAscent: Math.max(0, i.actualBoundingBoxAscent || 0),
      actualBoundingBoxDescent: Math.max(0, i.actualBoundingBoxDescent || 0)
    }
  }

  function o(e, t) {
    let i = Math.max(1, Number.isFinite(e.style.fontSize) ? e.style.fontSize : 18);
    return e.captions.flatMap(r => {
      let a = r.text.replace(/\s+/g, " ").trim();
      if (!a) return [];
      let n = t.measureText(a),
        o = Math.max(1, n.width),
        s = Math.max(0, n.actualBoundingBoxAscent || i),
        l = Math.max(0, n.actualBoundingBoxDescent || 0);
      return [{
        captionId: r.captionId,
        lines: [a],
        maxLineWidth: o,
        boxWidth: o,
        boxHeight: Math.max(1, s + l),
        fontFamily: e.style.fontFamily,
        fontWeight: e.style.fontWeight,
        fontSize: i,
        padding: {
          horizontal: 0,
          vertical: 0
        },
        radius: 0,
        anchor: 5,
        x: e.renderWidth / 2,
        y: e.renderHeight / 2,
        nativeGeometry: {
          schemaVersion: "subtitle-geometry-snapshot-v1",
          snapshotId: "browser-literal-fallback",
          renderWidth: e.renderWidth,
          renderHeight: e.renderHeight,
          maxWidth: e.renderWidth,
          lineHeight: Math.max(1, s + l),
          lineWidths: [o],
          centerX: e.renderWidth / 2,
          centerY: e.renderHeight / 2,
          basePositionXPercent: 50,
          basePositionYPercent: 50,
          appliedOffsetXPercent: 0,
          appliedOffsetYPercent: 0,
          outlineWidth: 0,
          shadow: {
            primaryOffsetY: 0,
            primaryBlur: 0,
            spreadOffsetY: 0,
            spreadBlur: 0
          },
          hasPillBackground: !1,
          ascent: s,
          descent: l
        }
      }]
    })
  }
  async function s(e) {
    if ("u" < typeof document) throw Error("subtitle_layout_requires_browser");
    let i = document.createElement("canvas").getContext("2d");
    if (!i) throw Error("subtitle_layout_canvas_unavailable");
    if (!(0, t.canUseNativeSubtitleGeometry)()) return i.font = `${e.style.italic?"italic ":""}${e.style.fontWeight} ${e.style.fontSize}px "${e.style.fontFamily}"`, o(e, i);
    let r = await (0, t.prepareSubtitleGeometryMeasurement)(e);
    await a(r.font.family, r.font.weight, r.font.size, r.font.italic, r.font.sample), i.font = `${r.font.italic?"italic ":""}${r.font.weight} ${r.font.size}px "${r.font.family}"`, i.textBaseline = "alphabetic";
    let s = new Map(r.measurementTexts.map(e => [e, n(i, e)])),
      l = await (0, t.finalizeSubtitleGeometryLayout)(e, r.requestId, [...s.values()]);
    if (l.pendingMeasurementTexts.length > 0) {
      for (let e of l.pendingMeasurementTexts) s.has(e) || s.set(e, n(i, e));
      l = await (0, t.finalizeSubtitleGeometryLayout)(e, r.requestId, [...s.values()])
    }
    if (l.requestId !== r.requestId || "subtitle-geometry-snapshot-v1" !== l.schemaVersion) throw Error("subtitle_geometry_snapshot_stale");
    if (l.pendingMeasurementTexts.length > 0) throw Error("subtitle_geometry_measurement_incomplete");
    return l.layouts
  }
  async function l(e) {
    if ("u" < typeof document) throw Error("subtitle_layout_requires_browser");
    let t = document.createElement("canvas").getContext("2d");
    if (!t) throw Error("subtitle_layout_canvas_unavailable");
    t.font = `${e.style.italic?"italic ":""}${e.style.fontWeight} ${e.style.fontSize}px "${e.style.fontFamily}"`;
    let i = [];
    for (let r = 0; r < e.captions.length; r += 48) {
      let a = {
        ...e,
        captions: e.captions.slice(r, r + 48)
      };
      try {
        i.push(...await s(a));
        continue
      } catch (e) {
        console.warn("Native subtitle geometry batch unavailable; retrying captions individually.", e)
      }
      for (let r of a.captions) {
        let a = {
          ...e,
          captions: [r]
        };
        try {
          i.push(...await s(a))
        } catch (e) {
          console.warn("Native subtitle geometry unavailable for one caption; using literal fallback.", e), i.push(...o(a, t))
        }
      }
    }
    return i
  }
  async function c(e, t, a) {
    let n, o = Math.round(a.width),
      s = Math.round(a.height);
    if (!Number.isFinite(o) || !Number.isFinite(s) || o <= 0 || s <= 0) throw Error("subtitle_layout_invalid_render_size");
    if (0 === e.length) return [];
    let c = (n = (e, t) => "number" == typeof e && Number.isFinite(e) ? e : t, {
        captions: e.map(e => ({
          captionId: e.captionId,
          text: e.text
        })),
        style: {
          fontFamily: (0, i.resolveSubtitleLayoutFontFamily)(t),
          fontSize: n(t.fontSize, 18),
          fontWeight: (0, i.getSubtitleCanvasFontWeight)(t.bold),
          italic: t.italic,
          backgroundStyle: t.backgroundStyle,
          position: t.position,
          alignment: t.alignment,
          maxWidthPercent: n(t.maxWidthPercent, null),
          offsetX: n(t.offsetX, null),
          offsetY: n(t.offsetY, null),
          outline: t.outline,
          outlineWidth: n(t.outlineWidth, 0),
          shadow: t.shadow
        },
        renderWidth: o,
        renderHeight: s
      }),
      d = JSON.stringify(c),
      u = r.get(d);
    if (u) return u;
    let h = l(c).catch(e => {
      throw r.delete(d), e
    });
    return r.set(d, h), h
  }
  e.s(["buildSubtitleLayoutSnapshot", 0, c])
}, 33228, 34279, e => {
  "use strict";
  var t = e.i(68834),
    i = e.i(46696),
    r = e.i(2684),
    a = e.i(17924),
    n = e.i(47116),
    o = e.i(64348),
    s = e.i(44861),
    l = e.i(47066),
    c = e.i(43424),
    d = e.i(16331),
    u = e.i(43960),
    h = e.i(76553),
    p = e.i(30148),
    f = e.i(96887),
    g = e.i(54181);
  e.i(89268);
  var m = e.i(63126),
    _ = e.i(33474),
    y = e.i(40131),
    v = e.i(79569),
    x = e.i(53397),
    b = e.i(54037),
    w = e.i(99240),
    S = e.i(7787);

  function P(e, t) {
    let i = e.includes("\\") ? "\\" : "/";
    return `${e.replace(/[\\/]+$/,"")}${i}${t}`
  }

  function k(e, t, i) {
    let r = (e || i).trim(),
      a = r.startsWith("#") ? r : `#${r}`;
    if (/^#[0-9a-fA-F]{3}$/.test(a) && (a = `#${a[1]}${a[1]}${a[2]}${a[2]}${a[3]}${a[3]}`), !/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(a)) return i;
    let n = Number.parseInt(a.slice(1, 3), 16),
      o = Number.parseInt(a.slice(3, 5), 16),
      s = Number.parseInt(a.slice(5, 7), 16),
      l = Math.min(1, Math.max(0, (9 === a.length ? Number.parseInt(a.slice(7, 9), 16) / 255 : 1) * t));
    return `rgba(${n}, ${o}, ${s}, ${l})`
  }

  function M(e) {
    let t = e.replace(/"/g, "");
    return /\s/.test(t) ? `"${t}"` : t
  }
  async function C(e) {
    if ("u" < typeof document || !("fonts" in document)) return !1;
    let t = (0, x.resolveSubtitleExportFontOption)(e.fontFamily),
      i = (0, x.getSubtitleCanvasFontWeight)(e.bold);
    if (!(0, x.getSubtitleFontAssetPath)(t, i)) return "system" === t.id;
    let r = `${i} 24px ${M(t.cssFamily)}`;
    return await new Promise(e => {
      let t = !1,
        i = i => {
          t || (t = !0, clearTimeout(a), e(i))
        },
        a = setTimeout(() => i(!1), 3e3);
      document.fonts.load(r).then(() => i(!0), () => i(!1))
    }) && document.fonts.check(r)
  }

  function I(e, t, i, r, a) {
    e.fillStyle = a, e.fillText(t, i, r)
  }

  function E(e, t, i, r, a, n) {
    let o = t - (e.length - 1) * i / 2;
    e.forEach((e, t) => {
      n(e, Math.round(o + t * i + (r - a) / 2))
    })
  }

  function j(e) {
    return new Promise((t, i) => {
      e.toBlob(e => {
        e ? t(e) : i(Error("subtitle_overlay_png_encode_failed"))
      }, "image/png")
    })
  }
  async function T(e) {
    if ("u" < typeof document) throw Error("subtitle_overlay_renderer_requires_browser");
    let t = document.createElement("canvas");
    t.width = e.width, t.height = e.height;
    let i = t.getContext("2d");
    if (!i) throw Error("subtitle_overlay_canvas_unavailable");
    return i.clearRect(0, 0, t.width, t.height), new Uint8Array(await (await j(t)).arrayBuffer())
  }
  async function $(e, t, i, r) {
    var a, n, o, s, l, c, d;
    let u, h, p;
    if ("u" < typeof document) throw Error("subtitle_overlay_renderer_requires_browser");
    await C(t);
    let f = (0, b.getSubtitlePreviewClasses)(t),
      g = r.nativeGeometry,
      m = document.createElement("canvas");
    m.width = i.width, m.height = i.height, m.dataset.previewContainerClass = f.container, m.dataset.previewTextClass = f.text;
    let _ = m.getContext("2d");
    if (!_) throw Error("subtitle_overlay_canvas_unavailable");
    _.clearRect(0, 0, m.width, m.height), _.imageSmoothingEnabled = !0, _.imageSmoothingQuality = "high", _.fontKerning = "normal", _.textRendering = "optimizeLegibility", a = r.fontSize, u = t.italic ? "italic " : "", h = (0, x.getSubtitleCanvasFontWeight)(t.bold), p = M((0, x.resolveSubtitleExportFontOption)(t.fontFamily).cssFamily), _.font = `${u}${h} ${a}px ${p}`, _.textAlign = t.alignment, _.textBaseline = "alphabetic";
    let y = r.lines,
      v = g.ascent,
      w = g.descent,
      S = g.centerX,
      P = g.centerY,
      T = Math.round(r.x),
      $ = (n = t.fontColor, o = "#FFFFFF", "string" != typeof n || 0 === n.trim().length ? o : n.trim().startsWith("#") ? k(n, 1, o) : n);
    if (g.hasPillBackground) {
      let e;
      _.fillStyle = k(t.backgroundColor, t.backgroundOpacity, "rgba(0, 0, 0, 0)"), s = Math.round(S - r.boxWidth / 2), l = Math.round(P - r.boxHeight / 2), c = r.boxWidth, d = r.boxHeight, e = Math.min(Math.max(0, r.radius), c / 2, d / 2), _.beginPath(), _.moveTo(s + e, l), _.lineTo(s + c - e, l), _.quadraticCurveTo(s + c, l, s + c, l + e), _.lineTo(s + c, l + d - e), _.quadraticCurveTo(s + c, l + d, s + c - e, l + d), _.lineTo(s + e, l + d), _.quadraticCurveTo(s, l + d, s, l + d - e), _.lineTo(s, l + e), _.quadraticCurveTo(s, l, s + e, l), _.closePath(), _.fill()
    }
    return t.shadow && (_.save(), _.shadowColor = k(t.shadowColor, .9, "#000000"), _.shadowBlur = g.shadow.primaryBlur, _.shadowOffsetX = 0, _.shadowOffsetY = g.shadow.primaryOffsetY, E(y, P, g.lineHeight, v, w, (e, t) => {
      I(_, e, T, t, $)
    }), _.restore(), _.save(), _.shadowColor = k(t.shadowColor, .72, "#000000"), _.shadowBlur = g.shadow.spreadBlur, _.shadowOffsetX = 0, _.shadowOffsetY = g.shadow.spreadOffsetY, E(y, P, g.lineHeight, v, w, (e, t) => {
      I(_, e, T, t, $)
    }), _.restore()), E(y, P, g.lineHeight, v, w, (e, i) => {
      var r;
      (r = g.outlineWidth) > 0 && (_.lineJoin = "round", _.miterLimit = 2, _.lineWidth = r, _.strokeStyle = k(t.outlineColor, 1, "#000000"), _.strokeText(e, T, i)), I(_, e, T, i, $)
    }), new Uint8Array(await (await j(m)).arrayBuffer())
  }
  async function V(e, t, i, r, a = !1, n = null, o = {}) {
    let s, l = Math.round(i.width),
      c = Math.round(i.height);
    if (!Number.isFinite(l) || !Number.isFinite(c) || l <= 0 || c <= 0) throw Error("subtitle_overlay_invalid_render_size");
    let d = a ? new Map : await (0, v.resolveDisplayCaptionProjections)(e.map(v.displayCaptionInputFromSubtitle)),
      u = function(e, t = !1, i = new Map) {
        return [...e].sort((e, t) => e.startTime - t.startTime || e.index - t.index).flatMap(e => {
          if (t) {
            let t = (0, y.getPreparedSubtitleDisplayText)(e);
            return t ? [{
              id: e.id,
              text: t,
              startTime: e.startTime,
              endTime: Math.max(e.endTime, e.startTime + 1)
            }] : []
          }
          let r = i.get(e.id);
          if (!r) {
            let t = (0, y.getPreparedSubtitleDisplayText)(e);
            return t ? [{
              id: e.id,
              text: t,
              startTime: e.startTime,
              endTime: Math.max(e.endTime, e.startTime + 1)
            }] : []
          }
          return r.chunks.map((t, i) => ({
            id: `${e.id}-${i}`,
            text: t.text,
            startTime: t.placedStartMs,
            endTime: t.placedEndMs
          }))
        })
      }(e, a, d);
    if (0 === u.length) return null;
    try {
      s = await (0, w.buildSubtitleLayoutSnapshot)(u.map(e => ({
        captionId: e.id,
        text: e.text
      })), t, {
        width: l,
        height: c
      })
    } catch (e) {
      return console.warn("Native subtitle geometry unavailable; skipping optional subtitle layer.", e), null
    }
    let h = new Map(s.map(e => [e.captionId, e])),
      p = u.filter(e => h.has(e.id));
    if (0 === p.length) return null;
    let f = P(r, `subtitle-overlays-${Date.now().toString(36)}`),
      g = n ? await (0, _.resolveSubtitleFontCacheIdentity)(t) : null;
    return (0, _.exportSubtitleObjectsWithCacheV1)({
      events: p,
      style: t,
      renderWidth: l,
      renderHeight: c,
      cacheContext: n,
      fontIdentity: g,
      geometrySnapshotIds: Object.fromEntries(p.map(e => [e.id, h.get(e.id).nativeGeometry.snapshotId])),
      requireScratchManifest: !!o.nleAuthority
    }, {
      nowMs: Date.now,
      renderBlank: () => T({
        width: l,
        height: c
      }),
      renderEvent: e => $(e, t, {
        width: l,
        height: c
      }, h.get(e.id)),
      writeScratchObject: ({
        renderKey: e,
        bytes: t
      }) => (0, m.writeManagedBinaryFile)(P(f, `${e}.png`), t, "png"),
      writeScratchManifest: async ({
        version: e,
        renderer: t,
        render_width: i,
        render_height: r,
        blank_path: a,
        cues: n
      }) => {
        let s = new TextEncoder().encode(JSON.stringify({
          version: e,
          renderer: t,
          render_width: i,
          render_height: r,
          blank_path: a,
          cues: n,
          nle_project_id: o.nleAuthority?.projectId,
          nle_revision: o.nleAuthority?.revision,
          logical_caption_count: o.nleAuthority?.logicalCaptionCount,
          render_chunk_count: n.length
        }, null, 2));
        return (0, m.writeManagedBinaryFile)(P(f, "manifest.json"), s, "json")
      },
      lookup: S.lookupEngineVnextSubtitleExportCache,
      putObject: S.putEngineVnextSubtitleExportCacheObject,
      putManifest: S.putEngineVnextSubtitleExportCacheManifest
    }, o.onProgress)
  }
  var F = e.i(30797),
    R = e.i(81341),
    B = e.i(53752),
    W = e.i(68476);
  let A = /^sha256:[0-9a-f]{64}$/,
    H = /^[0-9a-f]{64}$/,
    O = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/,
    z = /^[a-z0-9][a-z0-9_.-]{0,63}$/;

  function D(e) {
    return e?.authorizationContractVersion === "trial-authorization-v1" || e?.billingSource === "trial_bucket" || e?.billingSource === "legacy_transition"
  }
  async function q(e) {
    if (!A.test(e.artifactSha256)) throw Error("project_authorization_receipt_invalid");
    if (e.storedReceipt) return N(e.storedReceipt, e.exportPolicy, e.artifactSha256), {
      mode: "receipt_verified",
      receipt: e.storedReceipt
    };
    try {
      let t = await e.issueReceipt();
      return N(t, e.exportPolicy, e.artifactSha256), {
        mode: "receipt_verified",
        receipt: t
      }
    } catch (t) {
      if (D(e.exportPolicy)) throw Error("project_authorization_receipt_required", {
        cause: t
      });
      return {
        mode: "predecessor_compatibility",
        receipt: null
      }
    }
  }

  function N(e, t, i) {
    try {
      var r, a, n;
      let o = L(e, ["contract_version", "receipt", "signed_server_config_bundle"]);
      if ("project-authorization-receipt-response-v1" !== o.contract_version) throw Error("wrong response version");
      let s = L(o.receipt, ["receipt_version", "receipt_id", "receipt_sha256", "signed_token", "signing_key_id", "account_id", "device_id", "job_id", "authorization_jti", "authorization_contract_version", "billing_source", "charged_seconds", "fair_use_seconds_used", "payg_overage_charged_seconds", "voice_premium_charged_seconds", "watermark_required", "watermark_text", "source_hash_state", "source_content_hash", "granted_features", "artifact_identity", "accepted_component_identity", "allowed_operations", "issued_at"]),
        l = L(s.artifact_identity, ["artifact_kind", "artifact_sha256"]),
        c = L(o.signed_server_config_bundle, ["payload", "signature_b64"]),
        d = L(c.payload, ["api_url", "engine_policy", "runtime_trust_set_id", "trusted_runtime_hashes", "trusted_runtime_packages", "runtime_manifest_key_id", "runtime_manifest_public_keys", "job_token_key_id", "job_token_public_keys"]),
        u = K(s.allowed_operations),
        h = K(s.granted_features),
        p = X(d.job_token_public_keys);
      if (X(d.runtime_manifest_public_keys), K(d.trusted_runtime_hashes), !Array.isArray(d.trusted_runtime_packages)) throw Error("invalid trusted packages");
      let f = [s.charged_seconds, s.fair_use_seconds_used, s.payg_overage_charged_seconds, s.voice_premium_charged_seconds];
      if ("project_authorization_receipt_v1" !== s.receipt_version || !Y(s.receipt_id) || "string" != typeof s.receipt_sha256 || !H.test(s.receipt_sha256) || "string" != typeof s.signed_token || 3 !== s.signed_token.split(".").length || !Y(s.signing_key_id) || !Y(s.account_id) || !Y(s.device_id) || !Y(s.job_id) || !Y(s.authorization_jti) || !Y(s.authorization_contract_version) || !Y(s.billing_source) || f.some(e => {
          var t;
          return t = e, !("number" == typeof t && Number.isSafeInteger(t)) || !(t >= 0)
        }) || "boolean" != typeof s.watermark_required || (s.watermark_required ? (r = s.watermark_text, "string" != typeof r || !(r.length > 0) || !(r.length <= 255) || r.trim() !== r || !!/[\u0000-\u001f]/.test(r) || !!/(?:https?|ftp|file):\/\//i.test(r)) : null !== s.watermark_text) || !h.length || h.some(e => !z.test(e)) || new Set(h).size !== h.length || "existing_export_input" !== l.artifact_kind || l.artifact_sha256 !== i || !A.test(l.artifact_sha256) || 1 !== u.length || "existing_artifact_export" !== u[0] || "string" != typeof s.issued_at || !Number.isFinite(Date.parse(s.issued_at)) || "string" != typeof c.signature_b64 || !c.signature_b64 || d.job_token_key_id !== s.signing_key_id || 1 !== p.filter(e => e.key_id === s.signing_key_id).length) throw Error("receipt shape invalid");
      if (null !== s.accepted_component_identity) {
        let e = L(s.accepted_component_identity, ["component_id", "component_version", "artifact_sha256"]);
        if (!Y(e.component_id) || !Y(e.component_version) || "string" != typeof e.artifact_sha256 || !A.test(e.artifact_sha256)) throw Error("component identity invalid")
      }
      if (!("sha256_bound" === s.source_hash_state ? "string" == typeof s.source_content_hash && A.test(s.source_content_hash) : "unavailable_predecessor" === s.source_hash_state && null === s.source_content_hash && !s.authorization_contract_version.toLowerCase().includes("trial") && !["trial_bucket", "legacy_transition"].includes(s.billing_source))) throw Error("source hash invalid");
      if (t) {
        let e = t.grantedFeatures;
        if (D(t) && !Y(t.deviceId) || s.job_id !== t.jobId || void 0 !== t.deviceId && s.device_id !== t.deviceId || s.authorization_jti !== t.authorizationJti || s.charged_seconds !== t.chargedSeconds || s.fair_use_seconds_used !== t.fairUseSecondsUsed || s.payg_overage_charged_seconds !== t.paygOverageChargedSeconds || s.voice_premium_charged_seconds !== t.voicePremiumChargedSeconds || s.watermark_required !== t.watermarkRequired || s.watermark_text !== t.watermarkText || void 0 !== t.authorizationContractVersion && s.authorization_contract_version !== t.authorizationContractVersion || void 0 !== t.billingSource && s.billing_source !== t.billingSource || void 0 !== t.sourceContentHash && s.source_content_hash !== t.sourceContentHash || void 0 !== e && (a = s.granted_features, n = e, !G([...a].sort(), [...n].sort()))) throw Error("project scope mismatch")
      }
    } catch (e) {
      throw Error("project_authorization_receipt_invalid", {
        cause: e
      })
    }
  }

  function L(e, t) {
    if (!e || "object" != typeof e || Array.isArray(e)) throw Error("object required");
    if (!G(Object.keys(e).sort(), [...t].sort())) throw Error("unexpected object keys");
    return e
  }

  function K(e) {
    if (!Array.isArray(e) || !e.every(e => "string" == typeof e)) throw Error("string array required");
    return e
  }

  function X(e) {
    if (!Array.isArray(e)) throw Error("key array required");
    return e.map(e => {
      let t = L(e, ["key_id", "public_key_b64"]);
      if (!Y(t.key_id) || "string" != typeof t.public_key_b64 || !t.public_key_b64) throw Error("invalid key");
      return t
    })
  }

  function G(e, t) {
    return e.length === t.length && e.every((e, i) => e === t[i])
  }

  function Y(e) {
    return "string" == typeof e && O.test(e)
  }
  var J = e.i(58450),
    U = e.i(64581),
    Q = e.i(57342),
    Z = e.i(8594),
    ee = e.i(65991),
    et = e.i(53065);
  async function ei(e) {
    if (e.nleDocument) return void await (0, S.preflightEngineVnextDirectExport)({
      projectId: e.id,
      expectedRevision: e.nleDocument.revision
    });
    if ((0, r.requiresStretchRetimeReprocess)(e)) throw (0, r.stretchRetimeReprocessRequiredError)();
    if ((0, r.requiresCuePreviewRecovery)(e)) throw (0, r.cuePreviewRecoveryRequiredError)();
    if ((0, r.getTerminalDirectExportProjectRef)(e)) throw Error("nle_document_reprocess_required");
    let t = (0, r.getCuePreviewProjectRef)(e);
    t && await (0, S.preflightEngineVnextCuePreviewExport)({
      projectId: t.projectId,
      jobId: t.jobId,
      planPath: t.planPath,
      expectedPlanHash: t.planHash
    })
  }
  e.s(["preflightManualExport", 0, ei], 34279);
  var er = e.i(92719);
  let ea = {
    duration: 1 / 0,
    closeButton: !0
  };

  function en() {
    return `manual_export_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`
  }

  function eo() {
    return `manual_export_batch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`
  }

  function es(e) {
    return "completed" === e || "error" === e || "canceled" === e
  }

  function el(e, t) {
    ev.setState(i => ({
      jobs: i.jobs.map(i => i.id === e ? {
        ...i,
        ...t
      } : i)
    }))
  }

  function ec(e, t, i) {
    let r = ev.getState().jobs.find(t => t.id === e);
    if (!r) return;
    let a = r.mediaProgress ?? null,
      n = (0, d.reduceMediaProgress)(a, i);
    if (!n || n === a) return;
    let o = !0 === r.finalPathVerified,
      s = 99;
    n.terminal || (s = Math.min(99, (0, d.compatibilityPercentForMediaProgress)(n))), n.terminal && o && (s = 100);
    let l = n.terminal && !o ? 9999 : n.overallBasisPoints,
      c = (0, u.mediaProgressMessage)(n),
      h = {
        progress: s,
        progressBasisPoints: l,
        progressStageBasisPoints: n.stageBasisPoints,
        progressMessageKey: n.messageKey,
        message: c,
        mediaProgress: n
      };
    el(e, h), ee.useVideoStore.getState().updateTask(t, h)
  }

  function ed(e, t, r, a = {}) {
    let o = null,
      s = null;
    ev.setState(i => {
      let l = i.jobs.find(e => e.id === t),
        c = i.batches.find(t => t.id === e);
      if (!l || !c || es(l.status)) return i;
      let d = c.completed + +("completed" === r),
        u = c.failed + +("error" === r),
        h = c.canceled + +("canceled" === r),
        p = d + u + h,
        f = "completed" === r && a.savePath ? [...c.outputPaths, a.savePath] : c.outputPaths,
        g = "error" === r && a.error ? [...c.errors, a.error] : c.errors,
        m = c.cacheAffected + ("completed" === r && a.cacheOutcome && (0, n.exportCacheCompletionNotice)(a.cacheOutcome).affected ? 1 : 0),
        _ = {
          ...l,
          ...a,
          status: r
        },
        y = {
          ...c,
          completed: d,
          failed: u,
          canceled: h,
          outputPaths: f,
          errors: g,
          cacheAffected: m,
          notified: c.notified || p >= c.total
        };
      return !c.notified && p >= c.total && (o = y, s = _), {
        jobs: i.jobs.map(e => e.id === t ? _ : e),
        batches: i.batches.map(t => t.id === e ? y : t)
      }
    }), o && function(e, t) {
      let r = (0, n.exportCacheBatchCompletionMessage)(e.cacheAffected),
        a = [e.failed > 0 ? `${e.failed} video lỗi` : null, e.canceled > 0 ? `${e.canceled} video đ\xe3 hủy` : null, r].filter(Boolean),
        o = e.outputPaths[0],
        s = o ? (0, l.exportOutputDirectory)(o) : null,
        c = o ? {
          label: "Mở thư mục",
          onClick: () => {
            (0, m.revealPathInSystem)(s ?? o)
          }
        } : void 0;
      if (1 === e.total) {
        if (1 === e.completed) {
          let e = t?.cacheOutcome ? (0, n.exportCacheCompletionNotice)(t.cacheOutcome) : null;
          i.toast.success("Xuất video thành công", {
            ...ea,
            description: e?.message ?? "Video đã được tạo xong.",
            action: c
          });
          return
        }
        return 1 === e.canceled ? i.toast.info("Đã hủy xuất video", {
          ...ea,
          description: "Video chưa được xuất."
        }) : i.toast.error("Xuất video thất bại", {
          ...ea,
          description: e.errors[0] ?? "Không thể tạo video."
        })
      }
      let d = (e.completed === e.total, `Đ\xe3 xuất xong ${e.completed}/${e.total} video`),
        u = {
          ...ea,
          description: a.length > 0 ? a.join(" • ") : "Tất cả video đã được tạo xong.",
          action: c
        };
      e.failed > 0 || e.canceled > 0 ? i.toast.warning(d, u) : i.toast.success(d, u)
    }(o, s)
  }

  function eu(e) {
    let {
      jobs: t
    } = ev.getState();
    return t.find(t => t.id === e)?.status === "canceled"
  }

  function eh(e, t) {
    (0, J.persistLatestProjectManifest)(e, ee.useVideoStore.getState).catch(() => {
      (0, F.appendAppLog)("warn", `[manual-export-metadata] code=project_manifest_persist_failed phase=${t}`).catch(() => {
        console.warn("Verified export metadata persistence diagnostic unavailable.")
      })
    })
  }
  async function ep(e, t) {
    let i = await (0, R.computeFileSha256)(t),
      r = await q({
        exportPolicy: e.exportWatermarkPolicy,
        storedReceipt: e.projectAuthorizationReceipt,
        artifactSha256: i,
        issueReceipt: async () => {
          let t = e.exportWatermarkPolicy?.jobId?.trim();
          if (!t) throw Error("project_authorization_receipt_job_missing");
          return (0, U.withFreshAuthToken)(Q.useCloudStore.getState, Q.useCloudStore.setState, (e, r) => W.cloudApi.issueProjectAuthorizationReceipt(e, r, t, {
            artifact_kind: "existing_export_input",
            artifact_sha256: i
          }))
        }
      });
    return "receipt_verified" === r.mode && r.receipt !== e.projectAuthorizationReceipt && (ee.useVideoStore.getState().updateVideo(e.id, {
      projectAuthorizationReceipt: r.receipt
    }), await (0, J.persistLatestProjectManifest)(e.id, ee.useVideoStore.getState)), {
      artifactSha256: i,
      mode: r.mode
    }
  }
  async function ef(e, t, n, l) {
    let d = l,
      u = ee.useVideoStore.getState().updateTask,
      _ = "error",
      y = {},
      v = null;
    try {
      await (0, c.runExclusiveLocalCpuJob)(async () => {
        if (eu(t)) {
          _ = "canceled";
          return
        }
        let e = await (0, et.prepareProjectExportAdmission)(d.video.id, () => ee.useVideoStore.getState().videos.find(e => e.id === d.video.id) ?? null),
          i = e.nleDocument;
        d = {
          ...d,
          video: e,
          subtitles: i ? (0, p.nleCaptionsToSubtitles)(e.id, i) : d.subtitles,
          globalStyle: i ? i.subtitleStyle : d.globalStyle,
          subtitleRenderSize: i ? (0, g.canvasOutputSize)(i.source.width, i.source.height, i.canvasComposition.aspectRatio) : d.subtitleRenderSize,
          exportLayers: i ? i.overlays : e.exportLayers ?? d.exportLayers
        }, await ei(d.video);
        let o = performance.now(),
          s = (0, a.getExportAudioPlan)(d.video, "original"),
          l = d.video.nleDocument,
          c = l ? null : (0, r.getCuePreviewProjectRef)(d.video),
          x = l ? null : (0, r.getTerminalDirectExportProjectRef)(d.video);
        if (!l && d.video.nativeProjectReadiness?.readyForEdit && (!x || d.video.activeTerminalGeneration !== x.terminalGenerationId || d.video.terminalAdmission?.snapshotHash !== x.terminalSnapshotHash)) throw Object.assign(Error("terminal export authority is not active"), {
          code: "terminal_project_export_authority_missing",
          fallbackAllowed: !1
        });
        l || x || await ep(d.video, s.videoPath), c && !x && (v = {
          projectId: c.projectId,
          jobId: c.jobId,
          expectedPlanHash: c.planHash
        });
        let b = null,
          P = null;
        if (el(t, {
            status: "processing",
            progress: .1,
            progressBasisPoints: 10,
            message: "Đang kiểm tra dữ liệu xuất"
          }), u(n, {
            status: "processing",
            progress: .1,
            progressBasisPoints: 10,
            message: "Đang kiểm tra dữ liệu xuất"
          }), c && !x) try {
          let e = await (0, S.beginEngineVnextCueExportCacheSession)({
            projectId: c.projectId,
            jobId: c.jobId,
            planPath: c.planPath,
            expectedPlanHash: c.planHash
          });
          P = e.sessionId, b = e
        } catch (e) {
          console.warn("Cue export cache session unavailable; continuing without cache.", e)
        }
        try {
          let e, i = (k = d.video, k.exportWatermarkPolicy?.watermarkRequired ? {
            enabled: !0,
            text: k.exportWatermarkPolicy.watermarkText ?? "dichvideo.com",
            seed: k.exportWatermarkPolicy.authorizationJti
          } : null);
          var k, M, C, I = d.video,
            E = d.exportLayers;
          if (E.some(e => e.enabled && "text" === e.type && "wander" === e.motion) && I.exportWatermarkPolicy?.watermarkRequired !== !1) throw Error("moving_watermark_requires_paid_export: Cần Unlimited hoặc ví phút để xuất watermark chạy.");
          let r = null,
            p = null,
            g = null;
          if (!l && d.subtitlesEnabled && d.subtitles.length > 0) {
            if (!d.subtitleRenderSize) throw Error("Không xác định được kích thước video để render phụ đề.");
            let e = c && b ? b : null,
              i = c?.projectId,
              a = await V(x ? function(e, t) {
                if (!t || t.projectId !== e.projectId || t.generationId !== e.terminalGenerationId || t.snapshotHash !== e.terminalSnapshotHash || t.timingAuthority.generationId !== e.timingGenerationId || t.timingAuthority.planHash !== e.timingPlanHash || t.timingAuthority.timelineStateHash !== e.timingStateHash || t.audioGenerationId !== e.audioGenerationId || t.playbackGenerationId !== e.playbackGenerationId || t.graphHash !== e.graphHash || t.transportProjectionHash !== e.transportProjectionHash || t.audioScheduleHash !== e.audioScheduleHash || t.visualSnapshotHash !== e.visualSnapshotHash) throw Object.assign(Error("active terminal subtitle projection does not match Export authority"), {
                  code: "terminal_project_export_projection_mismatch",
                  fallbackAllowed: !1
                });
                return [...t.subtitles]
              }(x, Z.useTerminalProjectStore.getState().active) : d.subtitles, d.globalStyle, d.subtitleRenderSize, await (0, m.getProjectArtifactPath)(d.video.id, "temp.root"), !!x || d.preservePreparedSubtitleTiming, e && i ? {
                projectId: i,
                cacheSessionId: e.sessionId,
                appVersion: e.appVersion
              } : null, {
                onProgress: e => (function(e, t, i) {
                  if (i.total <= 0) return;
                  let r = Math.min(500, Math.max(10, Math.floor(500 * Math.max(0, i.completed) / i.total))),
                    a = {
                      progress: Math.min(4, Math.floor(r / 100)),
                      progressBasisPoints: r,
                      progressStageBasisPoints: Math.min(1e4, Math.floor(1e4 * Math.max(0, i.completed) / i.total)),
                      progressMessageKey: "export_visuals",
                      message: `Đang chuẩn bị phụ đề v\xe0 bố cục \xb7 ${Math.min(i.completed,i.total)}/${i.total}`
                    };
                  el(e, a), ee.useVideoStore.getState().updateTask(t, a)
                })(t, n, e)
              });
            r = a?.manifestPath ?? null, p = a?.cacheMetrics ?? null
          }
          let {
            filename: v,
            outputPath: P
          } = (M = d.savePath, C = d.defaultOutputDir, {
            filename: M.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, "") || "exported_video",
            outputPath: M.split(/[\\/]/).slice(0, -1).join("/") || C
          }), j = d.exportLayers.some(e => e.enabled), T = !!(r || i?.enabled || j), $ = {
            projectId: d.video.id,
            videoCodec: T ? "h264" : "copy",
            videoQuality: "high",
            bitrateReferenceVideoPath: d.video.path,
            resolution: "original",
            audioMode: s.finalAudioMode,
            mixRatio: .7,
            audioContentProfile: "documentary",
            subtitleMode: r && 1 ? "embedded" : "none",
            subtitleFormat: "srt",
            burnSubtitles: !!(r && 1),
            subtitleOverlayManifestPath: r,
            outputFormat: "mp4",
            outputPath: P,
            filename: v,
            exportLayers: d.exportLayers,
            systemWatermark: i,
            watermarkPolicySignature: d.video.exportWatermarkPolicy?.authorizationJti ?? null
          };
          if (l) {
            let e = (0, h.resolveNativeResourcePolicyForJob)(er.useSettingsStore.getState().settings.nativeResourcePolicyPreset);
            if (d.subtitlesEnabled && !d.subtitleRenderSize) throw Error("Không xác định được kích thước video để dàn phụ đề.");
            let a = d.subtitlesEnabled ? await (0, w.buildSubtitleLayoutSnapshot)(l.captions.map(e => ({
              captionId: e.captionId,
              text: e.translatedText.trim() ? e.translatedText : e.originalText
            })), l.subtitleStyle, d.subtitleRenderSize) : [];
            g = (await (0, S.exportEngineVnextDirect)({
              projectId: d.video.id,
              expectedRevision: l.revision,
              cancelRunId: t,
              outputPath: d.savePath,
              overwriteDestination: !0 === d.overwriteExisting,
              burnSubtitles: d.subtitlesEnabled,
              subtitleOverlayManifestPath: r,
              subtitleLayouts: a,
              exportLayers: l.overlays.map(f.encodeNleOverlay),
              canvasComposition: (0, f.encodeNleCanvasComposition)(l.canvasComposition),
              sourceRemoval: (0, f.encodeNleSourceRemoval)(l.sourceRemoval),
              watermarkRequired: !!i?.enabled,
              watermarkText: i?.text ?? null,
              watermarkPolicySignature: d.video.exportWatermarkPolicy?.authorizationJti ?? null,
              ffmpegThreads: e?.ffmpegThreads ?? null
            }, {
              onProgress: e => ec(t, n, e)
            })).appliedVisualSummary
          } else if (x) throw Error("nle_document_reprocess_required");
          else if (c) {
            let l = (0, h.resolveNativeResourcePolicyForJob)(er.useSettingsStore.getState().settings.nativeResourcePolicyPreset),
              u = await (0, S.exportEngineVnextCuePreviewPlan)({
                projectId: c.projectId,
                jobId: c.jobId,
                cancelRunId: t,
                planPath: c.planPath,
                expectedPlanHash: c.planHash,
                authorizationArtifactPath: s.videoPath,
                cacheSessionId: b?.sessionId,
                outputPath: d.savePath,
                subtitleOverlayManifestPath: r,
                exportLayers: (0, a.mapExportLayersForNative)(d.exportLayers),
                watermarkRequired: !!i?.enabled,
                watermarkText: i?.text ?? null,
                watermarkPolicySignature: d.video.exportWatermarkPolicy?.authorizationJti ?? null,
                ffmpegThreads: l?.ffmpegThreads ?? null
              }, {
                onProgress: e => ec(t, n, e)
              }),
              f = u.cacheMetrics,
              m = u.cacheOutcome,
              _ = {
                audio_cache_status: f.audioCacheStatus,
                audio_cache_lookup_ms: f.audioCacheLookupMs,
                audio_cache_bytes: f.audioCacheBytes,
                cue_identity_validation_count: f.cueIdentityValidationCount,
                cue_duration_probe_count: f.cueDurationProbeCount,
                native_audio_compose_ms: f.nativeAudioComposeMs,
                final_audio_bed_mix_ms: f.finalAudioBedMixMs,
                subtitle_png_hit_count: p?.hitCount ?? 0,
                subtitle_png_miss_count: p?.missCount ?? 0,
                subtitle_png_render_ms: p?.renderMs ?? 0,
                video_encode_ms: f.videoEncodeMs,
                final_mux_ms: f.finalMuxMs,
                cache_evicted_bytes: f.cacheEvictedBytes,
                native_command_wall_ms: f.nativeCommandWallMs,
                total_export_wall_ms: Math.max(0, Math.round(performance.now() - o)),
                audio_stream_copy: f.audioStreamCopy,
                cache_outcome_overall: m.overall,
                cache_audio_lookup: m.audio.lookup,
                cache_audio_persistence: m.audio.persistence,
                cache_audio_reason: m.audio.reason,
                cache_audio_requested_bytes: m.audio.requestedBytes,
                cache_audio_available_bytes: m.audio.availableBytes,
                cache_audio_free_reserve_bytes: m.audio.freeReserveBytes,
                cache_audio_persisted_bytes: m.audio.persistedBytes,
                cache_audio_evicted_bytes: m.audio.evictedBytes,
                cache_subtitle_lookup: m.subtitles.lookup,
                cache_subtitle_persistence: m.subtitles.persistence,
                cache_subtitle_reason: m.subtitles.reason,
                cache_subtitle_requested_bytes: m.subtitles.requestedBytes,
                cache_subtitle_available_bytes: m.subtitles.availableBytes,
                cache_subtitle_free_reserve_bytes: m.subtitles.freeReserveBytes,
                cache_subtitle_persisted_bytes: m.subtitles.persistedBytes,
                cache_subtitle_evicted_bytes: m.subtitles.evictedBytes
              };
            await (0, F.appendAppLog)("info", `[cue-export-cache] ${JSON.stringify(_)}`).catch(() => {
              console.warn("Cue export support metrics log unavailable.")
            }), g = u.appliedVisualSummary, e = m
          } else await (0, B.exportVideo)(s.videoPath, {
            ...$,
            subtitlePath: null,
            ttsAudioPath: null
          }, {
            operationId: t,
            onProgress: e => ec(t, n, e)
          }), await (0, B.verifyExportedMedia)(d.savePath, "original" !== $.audioMode || !!d.video.audioCodec);
          let R = g ? {
            finalExportHasSubtitles: g.subtitleOverlayApplied,
            finalExportHasWatermark: g.systemWatermarkApplied,
            finalExportHasOverlays: g.customerLayerIds.length > 0
          } : {
            finalExportHasSubtitles: !!(r && $.burnSubtitles),
            finalExportHasWatermark: !!i?.enabled,
            finalExportHasOverlays: j
          };
          ee.useVideoStore.getState().updateVideo(d.video.id, {
            finalExportPath: d.savePath,
            finalExportedAt: new Date,
            ...R
          }), el(t, {
            progress: 100,
            progressBasisPoints: 1e4,
            progressStageBasisPoints: 1e4,
            finalPathVerified: !0,
            nativeCancelRunId: void 0,
            cancelRequested: void 0,
            message: "Video đã sẵn sàng."
          }), u(n, {
            status: "completed",
            progress: 100,
            progressBasisPoints: 1e4,
            progressStageBasisPoints: 1e4,
            message: "Video đã sẵn sàng.",
            endTime: new Date
          }), _ = "completed", y = {
            progress: 100,
            progressBasisPoints: 1e4,
            finalPathVerified: !0,
            nativeCancelRunId: void 0,
            cancelRequested: void 0,
            message: "Video đã sẵn sàng.",
            savePath: d.savePath,
            cacheOutcome: e
          }, eh(d.video.id, "initial_delivery")
        } finally {
          P && await (0, S.releaseEngineVnextCueExportCacheSession)(P).catch(e => {
            console.warn("Cue export cache session release failed.", e)
          })
        }
      }, {
        onQueued: e => {
          if (eu(t)) return;
          let i = e > 1 ? `Đang chờ t\xe0i nguy\xean CPU để xuất video (${e} t\xe1c vụ trước)...` : "Đang chờ tài nguyên CPU để xuất video...";
          el(t, {
            status: "queued",
            progress: 0,
            message: i
          }), u(n, {
            status: "pending",
            progress: 0,
            message: i
          })
        },
        onStarted: () => {
          eu(t) || (el(t, {
            status: "processing",
            progress: 0,
            progressBasisPoints: 0,
            message: "Đang chuẩn bị bản xuất"
          }), u(n, {
            status: "processing",
            progress: 0,
            progressBasisPoints: 0,
            message: "Đang chuẩn bị bản xuất"
          }))
        }
      })
    } catch (c) {
      let {
        userMessage: e,
        developerDiagnostic: a
      } = (d.video.nleDocument || (0, r.getTerminalDirectExportProjectRef)(d.video) ? (0, s.directExportErrorDetails)(c) : null) ?? (0, o.exportErrorDetails)(c), l = v ? (0, o.finalDeliveryFailureCode)(c) : null;
      if (eu(t) || function(e) {
          let {
            jobs: t
          } = ev.getState();
          return t.find(t => t.id === e)?.cancelRequested === !0
        }(t)) _ = "canceled", y = {
        message: "Đã hủy xuất video.",
        error: "Đã hủy xuất video.",
        nativeCancelRunId: void 0,
        cancelRequested: void 0
      }, "native_final_delivery_canceled" === l && await em(d.video);
      else if (v && l) {
        let e = (0, o.finalDeliveryFailureMessage)(c) ?? "Video đã tạo xong nhưng chưa lưu được. Hãy thử lưu lại, không cần xuất lại.";
        _ = null;
        let r = ev.getState().jobs.find(e => e.id === t)?.progress ?? 99;
        el(t, {
          status: "delivery_failed",
          progress: Math.min(99, r),
          message: e,
          error: e,
          deliveryRetryLocator: v,
          finalPathVerified: !1
        }), u(n, {
          status: "error",
          message: e,
          error: e,
          endTime: new Date
        }), i.toast.error("Chưa lưu được video", {
          ...ea,
          description: e,
          action: {
            label: "Thử lưu lại",
            onClick: () => {
              ev.getState().retryManualExportDelivery(t)
            }
          }
        }), await (0, F.appendAppLog)("error", `[manual-export-delivery] ${a}`).catch(() => {
          console.error("Manual export delivery diagnostic unavailable.")
        })
      } else await (0, F.appendAppLog)("error", `[manual-export:${t}] ${a}`).catch(() => {
        console.error("Manual export failure log unavailable.", c)
      }), _ = "error", y = {
        message: "Xuất video thất bại.",
        error: e
      }, u(n, {
        status: "error",
        message: "Xuất video thất bại.",
        error: e,
        endTime: new Date
      })
    } finally {
      _ && ed(e, t, _, y)
    }
  }

  function eg(e) {
    return ev.getState().jobs.some(t => t.deliveryRetryLocator?.projectId === e.projectId && t.deliveryRetryLocator.jobId === e.jobId && t.deliveryRetryLocator.expectedPlanHash === e.expectedPlanHash)
  }
  async function em(e) {
    let t, i = (0, r.getCuePreviewProjectRef)(e);
    if (!i) return;
    let a = {
      projectId: i.projectId,
      jobId: i.jobId,
      expectedPlanHash: i.planHash
    };
    if (eg(a)) return;
    try {
      t = await (0, S.inspectEngineVnextCuePreviewDelivery)(a)
    } catch {
      return
    }
    if (!t.retryAvailable || t.receipt.finalPathVerified || eg(a)) return;
    let n = "Video đã tạo xong nhưng chưa lưu được. Hãy thử lưu lại, không cần xuất lại.",
      o = eo(),
      s = en(),
      l = ee.useVideoStore.getState().addTask({
        videoId: e.id,
        type: "export",
        status: "error",
        progress: 99,
        progressBasisPoints: 9999,
        message: n,
        error: n,
        endTime: new Date
      });
    ev.setState(i => ({
      batches: [...i.batches, {
        id: o,
        total: 1,
        completed: 0,
        failed: 0,
        canceled: 0,
        outputPaths: [],
        errors: [],
        cacheAffected: 0,
        notified: !1
      }],
      jobs: [...i.jobs, {
        id: s,
        batchId: o,
        taskId: l,
        videoId: e.id,
        videoName: e.name,
        savePath: t.requestedOutputPath,
        status: "delivery_failed",
        progress: 99,
        progressBasisPoints: 9999,
        message: n,
        error: n,
        deliveryRetryLocator: a,
        finalPathVerified: !1
      }]
    }))
  }
  async function e_(e, t) {
    let i = ev.getState().jobs.find(t => t.id === e);
    if (!i?.deliveryRetryLocator || "delivery_failed" !== i.status) return;
    let r = t ?? i.savePath,
      a = `${i.id}:delivery:${Date.now().toString(36)}`;
    el(e, {
      status: "processing",
      savePath: r,
      progress: Math.min(99, i.progress),
      message: "Đang lưu video vào nơi bạn đã chọn",
      error: void 0,
      nativeCancelRunId: a,
      cancelRequested: void 0,
      mediaProgress: void 0,
      finalPathVerified: !1
    }), ee.useVideoStore.getState().updateTask(i.taskId, {
      status: "processing",
      progress: Math.min(99, i.progress),
      message: "Đang lưu video vào nơi bạn đã chọn",
      error: void 0,
      endTime: void 0
    });
    try {
      let e = await (0, S.retryEngineVnextCuePreviewDelivery)({
        ...i.deliveryRetryLocator,
        operationId: a,
        outputPath: r
      }, {
        onProgress: e => ec(i.id, i.taskId, e)
      });
      if (!e.finalPathVerified) {
        let e = Error("native_final_delivery_verification_failed");
        throw Object.assign(e, {
          code: "native_final_delivery_verification_failed"
        }), e
      }
      el(i.id, {
        finalPathVerified: e.finalPathVerified,
        progress: 100,
        progressBasisPoints: 1e4,
        progressStageBasisPoints: 1e4,
        message: "Video đã sẵn sàng.",
        error: void 0,
        nativeCancelRunId: void 0,
        cancelRequested: void 0,
        deliveryRetryLocator: void 0
      }), ee.useVideoStore.getState().updateVideo(i.videoId, {
        finalExportPath: e.outputPath,
        finalExportedAt: new Date
      }), ee.useVideoStore.getState().updateTask(i.taskId, {
        status: "completed",
        progress: 100,
        progressBasisPoints: 1e4,
        progressStageBasisPoints: 1e4,
        message: "Video đã sẵn sàng.",
        error: void 0,
        endTime: new Date
      }), ed(i.batchId, i.id, "completed", {
        progress: 100,
        progressBasisPoints: 1e4,
        finalPathVerified: e.finalPathVerified,
        message: "Video đã sẵn sàng.",
        savePath: e.outputPath,
        cacheOutcome: i.cacheOutcome
      }), eh(i.videoId, "delivery_retry")
    } catch (t) {
      let e = (0, o.finalDeliveryFailureMessage)(t) ?? "Video đã tạo xong nhưng chưa lưu được. Hãy thử lưu lại, không cần xuất lại.";
      el(i.id, {
        status: "delivery_failed",
        progress: Math.min(99, ev.getState().jobs.find(e => e.id === i.id)?.progress ?? 99),
        message: e,
        error: e,
        nativeCancelRunId: void 0,
        cancelRequested: void 0,
        finalPathVerified: !1
      }), ee.useVideoStore.getState().updateTask(i.taskId, {
        status: "error",
        message: e,
        error: e,
        endTime: new Date
      })
    }
  }
  async function ey(e) {
    let t = ev.getState().jobs.find(t => t.id === e);
    if (!t?.deliveryRetryLocator || "delivery_failed" !== t.status) return;
    let i = t.savePath.split(/[\\/]/).pop() ?? `${t.videoName.replace(/\.[^.]+$/,"")}_translated.mp4`,
      r = await (0, R.saveFileDialog)(i, [{
        name: "MP4",
        extensions: ["mp4"]
      }]);
    r && await e_(e, await (0, l.resolveAvailableExportPath)(r, R.fileExists))
  }
  let ev = (0, t.create)()(e => ({
    jobs: [],
    batches: [],
    startManualExport: e => {
      let {
        jobIds: t
      } = ev.getState().startManualExportBatch([e]);
      return t[0]
    },
    startManualExportBatch: t => {
      if (0 === t.length) return {
        batchId: "",
        jobIds: []
      };
      let i = eo(),
        r = t.map(e => {
          let t = en(),
            r = ee.useVideoStore.getState().addTask({
              videoId: e.video.id,
              type: "export",
              status: "pending",
              progress: 0,
              message: "Đang chờ xuất video trong nền..."
            });
          return {
            request: e,
            job: {
              id: t,
              batchId: i,
              taskId: r,
              videoId: e.video.id,
              videoName: e.video.name,
              savePath: e.savePath,
              status: "queued",
              progress: 0,
              message: "Đang chờ xuất video trong nền...",
              nativeCancelRunId: t
            }
          }
        });
      for (let a of (e(e => ({
          batches: [...e.batches, {
            id: i,
            completed: 0,
            failed: 0,
            canceled: 0,
            total: t.length,
            outputPaths: [],
            errors: [],
            cacheAffected: 0,
            notified: !1
          }],
          jobs: [...e.jobs, ...r.map(e => e.job)]
        })), r)) ef(i, a.job.id, a.job.taskId, a.request);
      return {
        batchId: i,
        jobIds: r.map(e => e.job.id)
      }
    },
    cancelManualExportBatch: async e => {
      let {
        jobs: t
      } = ev.getState();
      for (let i of t.filter(t => t.batchId === e && ("queued" === t.status || "processing" === t.status && !!t.nativeCancelRunId && !0 !== t.cancelRequested))) {
        if ("processing" === i.status && i.nativeCancelRunId) {
          let e = "Đang hủy xuất video...";
          el(i.id, {
            cancelRequested: !0,
            message: e,
            error: void 0
          }), ee.useVideoStore.getState().updateTask(i.taskId, {
            status: "processing",
            message: e,
            error: void 0,
            endTime: void 0
          }), (0, S.cancelEngineVnextNativeJob)(i.nativeCancelRunId).catch(() => void 0);
          continue
        }
        ee.useVideoStore.getState().updateTask(i.taskId, {
          status: "error",
          message: "Đã hủy xuất video.",
          error: "Đã hủy xuất video.",
          endTime: new Date
        }), ed(e, i.id, "canceled", {
          message: "Đã hủy xuất video.",
          error: "Đã hủy xuất video."
        })
      }
      await
      function(e, t = 6e4) {
        let i = () => ev.getState().jobs.filter(t => t.batchId === e).every(e => {
          var t;
          return "delivery_failed" === (t = e.status) || es(t)
        });
        return i() ? Promise.resolve() : new Promise((e, r) => {
          let a = globalThis.setTimeout(() => {
              n(), r(Object.assign(Error("export_cancel_timeout"), {
                code: "export_cancel_timeout"
              }))
            }, t),
            n = ev.subscribe(() => {
              i() && (globalThis.clearTimeout(a), n(), e())
            })
        })
      }(e)
    },
    inspectManualExportDelivery: em,
    retryManualExportDelivery: e => e_(e),
    retryManualExportDeliveryToAnotherPath: ey
  }));
  e.s(["useExportStore", 0, ev], 33228)
}]);