(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 96887, e => {
  "use strict";

  function t(e) {
    return {
      id: e.id,
      type: e.type,
      enabled: e.enabled,
      x_percent: e.xPercent,
      y_percent: e.yPercent,
      width_percent: e.widthPercent,
      height_percent: e.heightPercent,
      opacity: e.opacity,
      z_index: e.zIndex ?? null,
      effect: "cover" === e.type ? e.effect : null,
      motion: "text" === e.type ? e.motion ?? null : null,
      color: "cover" === e.type || "text" === e.type ? e.color : null,
      text: "text" === e.type ? e.text : null,
      font_size: "text" === e.type ? e.fontSize : null,
      font_family: "text" === e.type ? e.fontFamily ?? null : null,
      font_weight: "text" === e.type ? e.fontWeight ?? null : null,
      image_path: "image" === e.type ? e.imagePath : null
    }
  }

  function i(e) {
    return {
      aspect_ratio: e.aspectRatio,
      background: {
        mode: e.background.mode,
        color: e.background.color,
        blur: e.background.blur
      }
    }
  }

  function n(e) {
    return {
      enabled: e.enabled,
      x_percent: e.xPercent,
      y_percent: e.yPercent,
      width_percent: e.widthPercent,
      height_percent: e.heightPercent,
      delogo_band: e.delogoBand,
      softness: e.softness
    }
  }

  function r(e, t) {
    if (!Number.isSafeInteger(t.width) || t.width < 1 || t.width > 32768 || !Number.isSafeInteger(t.height) || t.height < 1 || t.height > 32768) throw Error("nle_document_visual_render_size_invalid");
    return {
      preset_id: e.presetId,
      font_family: e.fontFamily,
      font_size: e.fontSize,
      font_color: e.fontColor,
      background_color: e.backgroundColor,
      background_opacity: e.backgroundOpacity,
      position: e.position,
      alignment: e.alignment,
      offset_x: e.offsetX ?? null,
      offset_y: e.offsetY ?? null,
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
      max_width_percent: e.maxWidthPercent ?? 90,
      render_width: t.width,
      render_height: t.height
    }
  }
  e.s(["encodeNleCanvasComposition", 0, i, "encodeNleOverlay", 0, t, "encodeNleSourceRemoval", 0, n, "encodeNleSubtitleStyle", 0, r, "encodeNleVisualMutation", 0, function(e, o, a, l, s) {
    return {
      overlays: e.map(t),
      subtitleStyle: r(o, a),
      canvasComposition: i(l),
      sourceRemoval: n(s)
    }
  }, "nleSourceAudioModeForGainPercent", 0, function(e, t) {
    if (!Number.isInteger(e) || e < 0 || e > 100) throw Error("nle_document_audio_mix_invalid");
    return "separated_background" === t ? "separated_background" : 0 === e ? "muted" : "original_mix"
  }])
}, 30148, e => {
  "use strict";
  e.i(89268);
  var t = e.i(63126),
    i = e.i(96887),
    n = e.i(54181);
  let r = "dichvideo-nle-document-v1";

  function o(e, t) {
    let i = Error(`nle_document_invalid:${e||"document"}:${t}`.slice(0, 192));
    throw i.code = "nle_document_invalid", i
  }

  function a(e, t, i) {
    var n;
    let r;
    (!e || "object" != typeof e || Array.isArray(e)) && o(i, "expected_object");
    let a = Object.keys(e).find(e => !t.includes(e));
    return a && o((n = i, r = a.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "unknown", n ? `${n}.${r}` : r), "unknown_key"), e
  }

  function l(e, t) {
    return (!Array.isArray(e) || e.length > 1e5) && o(t, "invalid_array"), e
  }

  function s(e, t, i = 65536) {
    return ("string" != typeof e || function(e) {
      let t = 0;
      for (let i = 0; i < e.length; i += 1) {
        let n = e.charCodeAt(i);
        if (n <= 127) t += 1;
        else if (n <= 2047) t += 2;
        else if (n >= 55296 && n <= 56319) {
          let n = e.charCodeAt(i + 1);
          n >= 56320 && n <= 57343 && (i += 1), t += n >= 56320 && n <= 57343 ? 4 : 3
        } else t += 3
      }
      return t
    }(e) > i) && o(t, "invalid_string"), e
  }

  function d(e, t, i = 160) {
    let n = s(e, t, i);
    return n.trim() || o(t, "empty_string"), n
  }

  function c(e, t) {
    let i = d(e, t, 160);
    return "." !== i && ".." !== i && /^[a-zA-Z0-9_.:-]+$/.test(i) || o(t, "invalid_id"), i
  }

  function u(e, t, i = 0, n = Number.MAX_SAFE_INTEGER) {
    return (!Number.isSafeInteger(e) || e < i || e > n) && o(t, "invalid_integer"), e
  }

  function _(e, t, i, n) {
    return ("number" != typeof e || !Number.isFinite(e) || e < i || e > n) && o(t, "invalid_number"), e
  }

  function p(e, t) {
    return "boolean" != typeof e && o(t, "invalid_boolean"), e
  }

  function m(e, t) {
    if (null != e) return _(e, t, -Number.MAX_VALUE, Number.MAX_VALUE)
  }

  function g(e, t) {
    let i = d(e, t, 32768);
    return (/^[a-zA-Z]:[\\/]/.test(i) || i.startsWith("/") || i.startsWith("\\")) && o(t, "unsafe_relative_path"), i.split(/[\\/]/).some(e => !e || "." === e || ".." === e) && o(t, "unsafe_relative_path"), i
  }

  function h(e, t, i) {
    return "string" == typeof e && i.includes(e) || o(t, "invalid_value"), e
  }
  let v = ["capcut_classic", "karaoke_highlight", "black_pill", "creator_keywords", "cinematic_soft", "minimal_clean", "pair_black_white", "pair_white_black", "pair_red_white", "pair_yellow_black", "pair_blue_white"];

  function f(e, t) {
    let i = `overlays[${t}]`,
      n = a(e, ["id", "type", "enabled", "x_percent", "y_percent", "width_percent", "height_percent", "opacity", "z_index", "effect", "motion", "color", "text", "font_size", "font_family", "font_weight", "image_path"], i),
      r = {
        id: c(n.id, `${i}.id`),
        enabled: p(n.enabled, `${i}.enabled`),
        xPercent: _(n.x_percent, `${i}.x_percent`, -100, 200),
        yPercent: _(n.y_percent, `${i}.y_percent`, -100, 200),
        widthPercent: _(n.width_percent, `${i}.width_percent`, -100, 200),
        heightPercent: _(n.height_percent, `${i}.height_percent`, -100, 200),
        opacity: _(n.opacity, `${i}.opacity`, 0, 1),
        ...null === n.z_index || void 0 === n.z_index ? {} : {
          zIndex: u(n.z_index, `${i}.z_index`, -0x80000000, 0x7fffffff)
        }
      },
      l = h(n.type, `${i}.type`, ["cover", "text", "image"]);
    if ("cover" === l) return null !== n.image_path && void 0 !== n.image_path && o(`${i}.image_path`, "unexpected_value"), {
      ...r,
      type: l,
      effect: h(n.effect, `${i}.effect`, ["solid", "glass", "mirror", "remove"]),
      color: d(n.color, `${i}.color`, 128)
    };
    if ("text" === l) {
      var m;
      let e;
      null !== n.image_path && void 0 !== n.image_path && o(`${i}.image_path`, "unexpected_value");
      let t = null === n.motion || void 0 === n.motion ? void 0 : h(n.motion, `${i}.motion`, ["none", "wander"]);
      return {
        ...r,
        type: l,
        text: s(n.text, `${i}.text`),
        color: d(n.color, `${i}.color`, 128),
        fontSize: (m = n.font_size, 0 !== (e = u(m, `${i}.font_size`, 0, 1e3)) ? e : "wander" === t ? 34 : 28),
        ...t ? {
          motion: t
        } : {},
        ...null === n.font_family || void 0 === n.font_family ? {} : {
          fontFamily: d(n.font_family, `${i}.font_family`, 1024)
        },
        ...null === n.font_weight || void 0 === n.font_weight ? {} : {
          fontWeight: u(n.font_weight, `${i}.font_weight`, 1, 1e3)
        }
      }
    }
    return {
      ...r,
      type: l,
      imagePath: g(n.image_path, `${i}.image_path`)
    }
  }

  function b(e) {
    var t;
    let i, b, S, w, I, E, x, C = a(e, ["schema_version", "revision", "source", "captions", "voice_cues", "overlays", "playback", "subtitle_style", "canvas_composition", "source_removal", "audio_clips", "ttssieure_selection"], "");
    C.schema_version !== r && o("schema_version", "unsupported_schema");
    let T = a(C.source, ["relative_path", "duration_ms", "width", "height", "frame_rate_numerator", "frame_rate_denominator"], "source"),
      k = {
        relativePath: g(T.relative_path, "source.relative_path"),
        durationMs: u(T.duration_ms, "source.duration_ms", 1, 6048e5),
        width: u(T.width, "source.width", 1, 32768),
        height: u(T.height, "source.height", 1, 32768),
        frameRateNumerator: u(T.frame_rate_numerator, "source.frame_rate_numerator", 1, 0xffffffff),
        frameRateDenominator: u(T.frame_rate_denominator, "source.frame_rate_denominator", 1, 0xffffffff)
      },
      V = ["selected_voice", "default_voice", "final_voice", "missing_audio"],
      A = new Set,
      $ = null,
      P = l(C.captions, "captions").map((e, t) => {
        let i = `captions[${t}]`,
          n = a(e, ["caption_id", "source_index", "source_start_ms", "source_end_ms", "original_text", "translated_text", "excluded", "tts_resolution", "requested_voice", "actual_voice", "tts_edit_baseline"], i),
          r = {
            captionId: c(n.caption_id, `${i}.caption_id`),
            sourceIndex: u(n.source_index, `${i}.source_index`, 1),
            sourceStartMs: u(n.source_start_ms, `${i}.source_start_ms`, 0, 6048e5),
            sourceEndMs: u(n.source_end_ms, `${i}.source_end_ms`, 0, 6048e5),
            originalText: s(n.original_text, `${i}.original_text`),
            translatedText: s(n.translated_text, `${i}.translated_text`),
            excluded: void 0 !== n.excluded && p(n.excluded, `${i}.excluded`),
            ttsResolution: n.tts_resolution ? h(n.tts_resolution, `${i}.tts_resolution`, V) : void 0,
            requestedVoice: n.requested_voice ? s(n.requested_voice, `${i}.requested_voice`) : void 0,
            actualVoice: n.actual_voice ? s(n.actual_voice, `${i}.actual_voice`) : void 0,
            ttsEditBaseline: function(e, t) {
              if (null == e) return;
              let i = a(e, ["translated_text", "audio_identity"], t);
              return {
                translatedText: s(i.translated_text, `${t}.translated_text`),
                audioIdentity: s(i.audio_identity, `${t}.audio_identity`, 4096)
              }
            }(n.tts_edit_baseline, `${i}.tts_edit_baseline`)
          };
        (r.sourceStartMs >= k.durationMs || r.sourceStartMs > r.sourceEndMs || !r.originalText.trim() && !r.translatedText.trim() || A.has(r.captionId)) && o(i, "invalid_identity_or_timing");
        let l = [r.sourceStartMs, r.sourceEndMs, r.sourceIndex];
        return $ && 0 >= y(l, $) && o(i, "invalid_order"), $ = l, A.add(r.captionId), r
      }),
      F = new Set,
      M = new Set,
      R = null,
      N = l(C.voice_cues, "voice_cues").map((e, t) => {
        var i, n, r;
        let l, p, m, v = `voice_cues[${t}]`,
          f = a(e, ["cue_id", "caption_id", "source_index", "semantic_span_id", "canonical_ordinal", "source_start_ms", "source_end_ms", "audio", "voice_id", "language", "rate", "pitch", "tts_resolution", "requested_voice"], v),
          b = a(f.audio, ["relative_path", "duration_ms", "byte_count", "container"], `${v}.audio`),
          S = {
            cueId: c(f.cue_id, `${v}.cue_id`),
            captionId: c(f.caption_id, `${v}.caption_id`),
            sourceIndex: u(f.source_index, `${v}.source_index`, 1),
            semanticSpanId: c(f.semantic_span_id, `${v}.semantic_span_id`),
            canonicalOrdinal: u(f.canonical_ordinal, `${v}.canonical_ordinal`, 0, 0xffffffff),
            sourceStartMs: u(f.source_start_ms, `${v}.source_start_ms`, 0, 6048e5),
            sourceEndMs: u(f.source_end_ms, `${v}.source_end_ms`, 0, 6048e5),
            audio: {
              relativePath: g(b.relative_path, `${v}.audio.relative_path`),
              durationMs: u(b.duration_ms, `${v}.audio.duration_ms`, 1),
              byteCount: u(b.byte_count, `${v}.audio.byte_count`, 1),
              container: (l = d(b.container, i = `${v}.audio.container`, 16), /^[a-zA-Z0-9]+$/.test(l) || o(i, "invalid_container"), l)
            },
            voiceId: ("." !== (p = d(f.voice_id, n = `${v}.voice_id`, 160)) && ".." !== p && p.trim() === p && /^[a-zA-Z0-9_.: ()/-]+$/.test(p) || o(n, "invalid_id"), p),
            language: (m = d(f.language, r = `${v}.language`, 32), /^[a-zA-Z0-9-]+$/.test(m) || o(r, "invalid_language"), m),
            rate: _(f.rate, `${v}.rate`, 5e-324, 4),
            pitch: _(f.pitch, `${v}.pitch`, -24, 24),
            ttsResolution: f.tts_resolution ? h(f.tts_resolution, `${v}.tts_resolution`, V) : void 0,
            requestedVoice: f.requested_voice ? s(f.requested_voice, `${v}.requested_voice`) : void 0
          },
          w = P.find(e => e.captionId === S.captionId);
        (!w || S.sourceIndex !== w.sourceIndex || S.sourceStartMs < w.sourceStartMs || S.sourceEndMs > w.sourceEndMs || S.sourceStartMs >= k.durationMs || S.sourceStartMs > S.sourceEndMs || F.has(S.cueId) || M.has(S.canonicalOrdinal)) && o(v, "invalid_identity_or_mapping");
        let I = [S.sourceStartMs, S.sourceEndMs, S.canonicalOrdinal, S.cueId];
        return R && 0 >= y(I, R) && o(v, "invalid_order"), R = I, F.add(S.cueId), M.add(S.canonicalOrdinal), S
      }),
      D = l(C.overlays, "overlays").map(f),
      L = new Set;
    for (let e of D) L.has(e.id) && o("overlays", "duplicate_id"), L.add(e.id);
    let O = a(C.playback, ["timing_mode", "requested_voice_rate_tenths", "marker_cue_ids", "original_volume", "translated_volume", "source_audio_mode"], "playback"),
      q = l(O.marker_cue_ids, "playback.marker_cue_ids").map((e, t) => c(e, `playback.marker_cue_ids[${t}]`));
    (new Set(q).size !== q.length || q.some(e => !F.has(e))) && o("playback.marker_cue_ids", "invalid_mapping");
    let B = {
        timingMode: h(O.timing_mode, "playback.timing_mode", ["source_timeline", "fixed_voice_speed"]),
        requestedVoiceRateTenths: u(O.requested_voice_rate_tenths, "playback.requested_voice_rate_tenths", 5, 20),
        markerCueIds: q,
        originalVolume: _(O.original_volume, "playback.original_volume", 0, 1),
        translatedVolume: _(O.translated_volume, "playback.translated_volume", 0, 5),
        sourceAudioMode: h(O.source_audio_mode, "playback.source_audio_mode", ["original_mix", "separated_background", "vocals_only", "muted"])
      },
      z = void 0 === C.audio_clips ? void 0 : l(C.audio_clips, "audio_clips").map((e, t) => {
        let i = `audio_clips[${t}]`,
          n = a(e, ["clip_id", "file_name", "relative_path", "gain_percent", "start_ms", "trim_in_ms", "trim_end_ms", "duration_ms"], i);
        return {
          clipId: c(n.clip_id, `${i}.clip_id`),
          fileName: s(n.file_name, `${i}.file_name`, 512),
          relativePath: g(n.relative_path, `${i}.relative_path`),
          gainPercent: u(n.gain_percent, `${i}.gain_percent`, 0, 150),
          startMs: u(n.start_ms, `${i}.start_ms`, 0, 6048e5),
          trimInMs: u(n.trim_in_ms, `${i}.trim_in_ms`, 0, 6048e5),
          trimEndMs: u(n.trim_end_ms, `${i}.trim_end_ms`, 0, 6048e5),
          durationMs: u(n.duration_ms, `${i}.duration_ms`, 0, 6048e5)
        }
      }),
      U = void 0 === C.ttssieure_selection ? void 0 : {
        provider: s((i = a(C.ttssieure_selection, ["provider", "model_id", "voice_id", "voice_settings"], "ttssieure_selection")).provider, "ttssieure_selection.provider", 64),
        modelId: s(i.model_id, "ttssieure_selection.model_id", 128),
        voiceId: s(i.voice_id, "ttssieure_selection.voice_id", 256),
        ...void 0 === i.voice_settings ? {} : {
          voiceSettings: i.voice_settings && "object" == typeof i.voice_settings && !Array.isArray(i.voice_settings) ? i.voice_settings : o("ttssieure_selection.voice_settings", "expected_object")
        }
      };
    return {
      schemaVersion: r,
      revision: u(C.revision, "revision", 1),
      source: k,
      captions: P,
      voiceCues: N,
      overlays: D,
      playback: B,
      audioClips: z,
      ttssieureSelection: U,
      subtitleStyle: (t = C.subtitle_style, w = null === (S = a(t, ["preset_id", "font_family", "font_size", "font_color", "background_color", "background_opacity", "position", "alignment", "offset_x", "offset_y", "bold", "italic", "outline", "outline_color", "outline_width", "shadow", "shadow_color", "background_style", "accent_color", "words_per_caption", "max_width_percent", "render_width", "render_height"], b = "subtitle_style")).preset_id || void 0 === S.preset_id ? "black_pill" : h(S.preset_id, `${b}.preset_id`, v), I = null === S.background_style || void 0 === S.background_style ? "none" : h(S.background_style, `${b}.background_style`, ["none", "pill"]), E = null === S.words_per_caption || void 0 === S.words_per_caption ? 4 : u(S.words_per_caption, `${b}.words_per_caption`, 1, 100), x = null === S.max_width_percent || void 0 === S.max_width_percent ? 90 : u(S.max_width_percent, `${b}.max_width_percent`, 10, 100), {
        enabled: !0,
        presetId: w,
        fontFamily: d(S.font_family, `${b}.font_family`, 1024),
        fontSize: u(S.font_size, `${b}.font_size`, 1, 1e3),
        fontColor: d(S.font_color, `${b}.font_color`, 128),
        backgroundColor: d(S.background_color, `${b}.background_color`, 128),
        backgroundOpacity: _(S.background_opacity, `${b}.background_opacity`, 0, 1),
        backgroundStyle: I,
        accentColor: function(e, t, i = 65536) {
          return null == e ? null : s(e, t, i)
        }(S.accent_color, `${b}.accent_color`, 128) ?? "#FFE347",
        position: h(S.position, `${b}.position`, ["top", "center", "bottom"]),
        alignment: h(S.alignment, `${b}.alignment`, ["left", "center", "right"]),
        offsetX: m(S.offset_x, `${b}.offset_x`),
        offsetY: m(S.offset_y, `${b}.offset_y`),
        bold: p(S.bold, `${b}.bold`),
        italic: p(S.italic, `${b}.italic`),
        outline: p(S.outline, `${b}.outline`),
        outlineColor: d(S.outline_color, `${b}.outline_color`, 128),
        outlineWidth: u(S.outline_width, `${b}.outline_width`, 0, 1e3),
        shadow: p(S.shadow, `${b}.shadow`),
        shadowColor: d(S.shadow_color, `${b}.shadow_color`, 128),
        wordsPerCaption: E,
        maxWidthPercent: x
      }),
      canvasComposition: function(e) {
        if (null == e) return {
          aspectRatio: n.DEFAULT_CANVAS_COMPOSITION.aspectRatio,
          background: {
            ...n.DEFAULT_CANVAS_COMPOSITION.background
          }
        };
        let t = "canvas_composition",
          i = a(e, ["aspect_ratio", "background"], t),
          r = a(i.background, ["mode", "color", "blur"], `${t}.background`),
          l = h(i.aspect_ratio, `${t}.aspect_ratio`, ["source", "16:9", "9:16"]),
          s = h(r.mode, `${t}.background.mode`, ["none", "solid", "blur"]);
        ("source" === l && "none" !== s || "source" !== l && "none" === s) && o(t, "incompatible_modes");
        let c = d(r.color, `${t}.background.color`, 16);
        return /^#[0-9a-fA-F]{6}$/.test(c) || o(`${t}.background.color`, "invalid_color"), {
          aspectRatio: l,
          background: {
            mode: s,
            color: c,
            blur: _(r.blur, `${t}.background.blur`, 1, 64)
          }
        }
      }(C.canvas_composition),
      sourceRemoval: function(e) {
        if (null == e) return {
          ...n.DEFAULT_SOURCE_REMOVAL
        };
        let t = "source_removal",
          i = a(e, ["enabled", "x_percent", "y_percent", "width_percent", "height_percent", "delogo_band", "softness"], t),
          r = {
            enabled: p(i.enabled, `${t}.enabled`),
            xPercent: _(i.x_percent, `${t}.x_percent`, 0, 100),
            yPercent: _(i.y_percent, `${t}.y_percent`, 0, 100),
            widthPercent: _(i.width_percent, `${t}.width_percent`, 5e-324, 100),
            heightPercent: _(i.height_percent, `${t}.height_percent`, 5e-324, 100),
            delogoBand: u(i.delogo_band, `${t}.delogo_band`, 1, 64),
            softness: _(i.softness, `${t}.softness`, 0, 1)
          };
        return (r.xPercent + r.widthPercent > 100 || r.yPercent + r.heightPercent > 100) && o(t, "geometry_out_of_bounds"), r
      }(C.source_removal)
    }
  }

  function y(e, t) {
    for (let i = 0; i < e.length; i += 1)
      if (e[i] !== t[i]) return e[i] < t[i] ? -1 : 1;
    return 0
  }
  async function S(i) {
    let n = await (0, t.readProjectManifest)(i);
    if (n.project_id !== i || n.manifest.id !== i || "completed" !== n.manifest.status || !n.manifest.nle_document) throw Error("project_reprocess_required");
    let r = b(n.manifest.nle_document),
      {
        planNlePreviewProjection: o
      } = await e.A(98233),
      a = await o(w(r), r.revision);
    return {
      ...r,
      previewProjection: a
    }
  }

  function w(e) {
    return {
      schema_version: e.schemaVersion,
      revision: e.revision,
      source: {
        relative_path: e.source.relativePath,
        duration_ms: e.source.durationMs,
        width: e.source.width,
        height: e.source.height,
        frame_rate_numerator: e.source.frameRateNumerator,
        frame_rate_denominator: e.source.frameRateDenominator
      },
      captions: e.captions.map(e => ({
        caption_id: e.captionId,
        source_index: e.sourceIndex,
        source_start_ms: e.sourceStartMs,
        source_end_ms: e.sourceEndMs,
        original_text: e.originalText,
        translated_text: e.translatedText,
        excluded: e.excluded,
        ...e.ttsResolution ? {
          tts_resolution: e.ttsResolution
        } : {},
        ...e.requestedVoice ? {
          requested_voice: e.requestedVoice
        } : {},
        ...e.actualVoice ? {
          actual_voice: e.actualVoice
        } : {},
        ...e.ttsEditBaseline ? {
          tts_edit_baseline: {
            translated_text: e.ttsEditBaseline.translatedText,
            audio_identity: e.ttsEditBaseline.audioIdentity
          }
        } : {}
      })),
      voice_cues: e.voiceCues.map(e => ({
        cue_id: e.cueId,
        caption_id: e.captionId,
        source_index: e.sourceIndex,
        semantic_span_id: e.semanticSpanId,
        canonical_ordinal: e.canonicalOrdinal,
        source_start_ms: e.sourceStartMs,
        source_end_ms: e.sourceEndMs,
        audio: {
          relative_path: e.audio.relativePath,
          duration_ms: e.audio.durationMs,
          byte_count: e.audio.byteCount,
          container: e.audio.container
        },
        voice_id: e.voiceId,
        language: e.language,
        rate: e.rate,
        pitch: e.pitch,
        ...e.ttsResolution ? {
          tts_resolution: e.ttsResolution
        } : {},
        ...e.requestedVoice ? {
          requested_voice: e.requestedVoice
        } : {}
      })),
      overlays: e.overlays.map(i.encodeNleOverlay),
      playback: {
        timing_mode: e.playback.timingMode,
        requested_voice_rate_tenths: e.playback.requestedVoiceRateTenths,
        marker_cue_ids: e.playback.markerCueIds,
        original_volume: e.playback.originalVolume,
        translated_volume: e.playback.translatedVolume,
        source_audio_mode: e.playback.sourceAudioMode
      },
      ...void 0 === e.audioClips ? {} : {
        audio_clips: e.audioClips.map(e => ({
          clip_id: e.clipId,
          file_name: e.fileName,
          relative_path: e.relativePath,
          gain_percent: e.gainPercent,
          start_ms: e.startMs,
          trim_in_ms: e.trimInMs,
          trim_end_ms: e.trimEndMs,
          duration_ms: e.durationMs
        }))
      },
      ...void 0 === e.ttssieureSelection ? {} : {
        ttssieure_selection: {
          provider: e.ttssieureSelection.provider,
          model_id: e.ttssieureSelection.modelId,
          voice_id: e.ttssieureSelection.voiceId,
          ...void 0 === e.ttssieureSelection.voiceSettings ? {} : {
            voice_settings: e.ttssieureSelection.voiceSettings
          }
        }
      },
      subtitle_style: (0, i.encodeNleSubtitleStyle)(e.subtitleStyle, e.source),
      canvas_composition: (0, i.encodeNleCanvasComposition)(e.canvasComposition),
      source_removal: (0, i.encodeNleSourceRemoval)(e.sourceRemoval)
    }
  }
  e.s(["NLE_DOCUMENT_SCHEMA_V1", 0, r, "canHydrateNleProject", 0, function(e) {
    return !!(e && "completed" === e.status && (e.nleDocument || e.nleDocumentAvailable))
  }, "canOpenNleProject", 0, function(e) {
    return !!(e && "completed" === e.status && e.nleDocument && Number.isSafeInteger(e.nleDocument.revision) && e.nleDocument.revision > 0)
  }, "decodeNleDocument", 0, b, "decodeNlePreviewProjection", 0, function(e, t) {
    let i = "preview_projection",
      n = a(e, ["schemaVersion", "inputHash", "revision", "durationMs", "videoSpans", "voiceClips", "captionClips", "audioClips"], i);
    "nle-preview-projection-v1" !== n.schemaVersion && o(i, "unsupported_schema");
    let r = d(n.inputHash, `${i}.inputHash`, 80);
    /^sha256:[0-9a-f]{64}$/.test(r) || o(`${i}.inputHash`, "invalid_hash");
    let s = u(n.revision, `${i}.revision`, 1);
    void 0 !== t && s !== t && o(`${i}.revision`, "stale_revision");
    let c = u(n.durationMs, `${i}.durationMs`, 1),
      p = l(n.videoSpans, `${i}.videoSpans`).map((e, t) => {
        let n = `${i}.videoSpans[${t}]`,
          r = a(e, ["sourceStartMs", "sourceEndMs", "sequenceStartMs", "sequenceEndMs", "videoPlaybackRate"], n),
          l = {
            sourceStartMs: u(r.sourceStartMs, `${n}.sourceStartMs`),
            sourceEndMs: u(r.sourceEndMs, `${n}.sourceEndMs`, 1),
            sequenceStartMs: u(r.sequenceStartMs, `${n}.sequenceStartMs`),
            sequenceEndMs: u(r.sequenceEndMs, `${n}.sequenceEndMs`, 1),
            videoPlaybackRate: _(r.videoPlaybackRate, `${n}.videoPlaybackRate`, 5e-324, Number.MAX_VALUE)
          };
        return (l.sourceStartMs >= l.sourceEndMs || l.sequenceStartMs >= l.sequenceEndMs) && o(n, "invalid_timing"), l
      });
    (0 === p.length || p[0]?.sourceStartMs !== 0 || p[0]?.sequenceStartMs !== 0 || p.at(-1)?.sequenceEndMs !== c || p.some((e, t) => t > 0 && (e.sourceStartMs !== p[t - 1].sourceEndMs || e.sequenceStartMs !== p[t - 1].sequenceEndMs))) && o(`${i}.videoSpans`, "invalid_continuity");
    let m = l(n.voiceClips, `${i}.voiceClips`).map((e, t) => {
        let n = `${i}.voiceClips[${t}]`,
          r = a(e, ["cueId", "captionId", "audioPath", "placedStartMs", "placedEndMs", "playbackRate"], n),
          l = {
            cueId: d(r.cueId, `${n}.cueId`),
            captionId: d(r.captionId, `${n}.captionId`),
            audioPath: g(r.audioPath, `${n}.audioPath`),
            placedStartMs: u(r.placedStartMs, `${n}.placedStartMs`),
            placedEndMs: u(r.placedEndMs, `${n}.placedEndMs`, 1),
            playbackRate: _(r.playbackRate, `${n}.playbackRate`, 5e-324, Number.MAX_VALUE)
          };
        return (l.placedStartMs >= l.placedEndMs || l.placedEndMs > c) && o(n, "invalid_timing"), l
      }),
      h = l(n.captionClips, `${i}.captionClips`).map((e, t) => {
        let n = `${i}.captionClips[${t}]`,
          r = a(e, ["captionId", "placedStartMs", "placedEndMs"], n),
          l = {
            captionId: d(r.captionId, `${n}.captionId`),
            placedStartMs: u(r.placedStartMs, `${n}.placedStartMs`),
            placedEndMs: u(r.placedEndMs, `${n}.placedEndMs`, 1)
          };
        return (l.placedStartMs >= l.placedEndMs || l.placedEndMs > c) && o(n, "invalid_timing"), l
      }),
      v = void 0 === n.audioClips ? void 0 : l(n.audioClips, `${i}.audioClips`).map((e, t) => {
        let n = `${i}.audioClips[${t}]`,
          r = a(e, ["clipId", "relativePath", "placedStartMs", "placedEndMs", "trimInMs", "gainPercent"], n),
          l = {
            clipId: d(r.clipId, `${n}.clipId`),
            relativePath: g(r.relativePath, `${n}.relativePath`),
            placedStartMs: u(r.placedStartMs, `${n}.placedStartMs`),
            placedEndMs: u(r.placedEndMs, `${n}.placedEndMs`, 1),
            trimInMs: u(r.trimInMs, `${n}.trimInMs`),
            gainPercent: u(r.gainPercent, `${n}.gainPercent`, 0, 150)
          };
        return (l.placedStartMs >= l.placedEndMs || l.placedEndMs > c) && o(n, "invalid_timing"), l
      });
    return {
      schemaVersion: "nle-preview-projection-v1",
      inputHash: r,
      revision: s,
      durationMs: c,
      videoSpans: p,
      voiceClips: m,
      captionClips: h,
      ...void 0 === v ? {} : {
        audioClips: v
      }
    }
  }, "encodeNleDocument", 0, w, "hydrateNleProject", 0, S, "nleCaptionsToSubtitles", 0, function(e, t) {
    return t.captions.map((i, n) => ({
      id: i.captionId,
      videoId: e,
      index: n + 1,
      startTime: i.sourceStartMs,
      endTime: i.sourceEndMs,
      originalText: i.originalText,
      translatedText: i.translatedText,
      excluded: i.excluded,
      ttsResolution: i.ttsResolution,
      requestedVoice: i.requestedVoice,
      actualVoice: i.actualVoice,
      stableCueId: i.captionId,
      fieldAuthority: {
        stableCueId: i.captionId,
        originalText: "engine",
        translatedText: "engine",
        timing: "engine",
        excluded: "engine"
      },
      confidence: 1,
      style: {
        ...t.subtitleStyle
      }
    }))
  }, "nleDocumentDiagnosticToken", 0, function(e) {
    let t = [e];
    for (let i of (e && "object" == typeof e && t.push(e.message, e.developerMessage, e.developer_message), t)) {
      if ("string" != typeof i) continue;
      let e = i.match(/nle_document_invalid:[a-zA-Z0-9_.\[\]-]{1,128}:[a-z_]{1,32}/);
      if (e) return e[0].slice(0, 192)
    }
    return null
  }])
}, 90571, e => {
  "use strict";
  var t = function() {
    return (t = Object.assign || function(e) {
      for (var t, i = 1, n = arguments.length; i < n; i++)
        for (var r in t = arguments[i]) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
      return e
    }).apply(this, arguments)
  };
  "function" == typeof SuppressedError && SuppressedError, e.s(["__assign", () => t, "__awaiter", 0, function(e, t, i, n) {
    return new(i || (i = Promise))(function(r, o) {
      function a(e) {
        try {
          s(n.next(e))
        } catch (e) {
          o(e)
        }
      }

      function l(e) {
        try {
          s(n.throw(e))
        } catch (e) {
          o(e)
        }
      }

      function s(e) {
        var t;
        e.done ? r(e.value) : ((t = e.value) instanceof i ? t : new i(function(e) {
          e(t)
        })).then(a, l)
      }
      s((n = n.apply(e, t || [])).next())
    })
  }, "__rest", 0, function(e, t) {
    var i = {};
    for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && 0 > t.indexOf(n) && (i[n] = e[n]);
    if (null != e && "function" == typeof Object.getOwnPropertySymbols)
      for (var r = 0, n = Object.getOwnPropertySymbols(e); r < n.length; r++) 0 > t.indexOf(n[r]) && Object.prototype.propertyIsEnumerable.call(e, n[r]) && (i[n[r]] = e[n[r]]);
    return i
  }, "__spreadArray", 0, function(e, t, i) {
    if (i || 2 == arguments.length)
      for (var n, r = 0, o = t.length; r < o; r++) !n && r in t || (n || (n = Array.prototype.slice.call(t, 0, r)), n[r] = t[r]);
    return e.concat(n || Array.prototype.slice.call(t))
  }])
}, 8325, e => {
  "use strict";
  var t, i, n = e.i(86682);
  async function r(e, t) {
    window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener(e, t), await (0, n.invoke)("plugin:event|unlisten", {
      event: e,
      eventId: t
    })
  }
  async function o(e, t, i) {
    var o;
    let a = "string" == typeof(null == i ? void 0 : i.target) ? {
      kind: "AnyLabel",
      label: i.target
    } : null != (o = null == i ? void 0 : i.target) ? o : {
      kind: "Any"
    };
    return (0, n.invoke)("plugin:event|listen", {
      event: e,
      target: a,
      handler: (0, n.transformCallback)(t)
    }).then(t => async () => r(e, t))
  }
  async function a(e, t, i) {
    return o(e, i => {
      r(e, i.id), t(i)
    }, i)
  }
  async function l(e, t) {
    await (0, n.invoke)("plugin:event|emit", {
      event: e,
      payload: t
    })
  }
  async function s(e, t, i) {
    await (0, n.invoke)("plugin:event|emit_to", {
      target: "string" == typeof e ? {
        kind: "AnyLabel",
        label: e
      } : e,
      event: t,
      payload: i
    })
  }(t = i || (i = {})).WINDOW_RESIZED = "tauri://resize", t.WINDOW_MOVED = "tauri://move", t.WINDOW_CLOSE_REQUESTED = "tauri://close-requested", t.WINDOW_DESTROYED = "tauri://destroyed", t.WINDOW_FOCUS = "tauri://focus", t.WINDOW_BLUR = "tauri://blur", t.WINDOW_SCALE_FACTOR_CHANGED = "tauri://scale-change", t.WINDOW_THEME_CHANGED = "tauri://theme-changed", t.WINDOW_CREATED = "tauri://window-created", t.WEBVIEW_CREATED = "tauri://webview-created", t.DRAG_ENTER = "tauri://drag-enter", t.DRAG_OVER = "tauri://drag-over", t.DRAG_DROP = "tauri://drag-drop", t.DRAG_LEAVE = "tauri://drag-leave", e.s(["TauriEvent", 0, i, "emit", 0, l, "emitTo", 0, s, "listen", 0, o, "once", 0, a])
}, 34618, e => {
  "use strict";
  var t = e.i(68834),
    i = e.i(8325),
    n = e.i(68476);
  e.i(89268);
  var r = e.i(7787),
    o = e.i(30797),
    a = e.i(81341);
  let l = "dichvideo-engine-vnext",
    s = "windows-x64-engine",
    d = [s, "windows-x64-universal"],
    c = null,
    u = 0;

  function _() {
    u += 1, c = null
  }

  function p(e, t) {
    let i = e.installedFamilies.find(e => e.family === l);
    return !!(i?.healthy && i.path && i.packageSha256 && i.packageSha256.toLowerCase() === t.sha256.toLowerCase())
  }

  function m(e) {
    return e.installedFamilies.find(e => e.family === l && e.healthy && e.path && e.packageSha256 && ("trusted" === e.trustStatus || "dev_override" === e.trustStatus)) ?? null
  }

  function g(e) {
    let t = e instanceof Error ? e.message : "string" == typeof e ? e : "",
      i = e && "object" == typeof e && "code" in e && "string" == typeof e.code ? e.code : "";
    return t ? t.includes("engine_vnext_manifest_legacy_fallback") ? "Server vẫn đang trả manifest Engine cũ. Hãy cập nhật cấu hình server vNext rồi thử lại." : t.includes("engine_vnext_manifest_missing_engine") ? "Server chưa có gói DichVideo Engine cho máy này." : "engine_vnext_app_update_required" === i || t.includes("engine_vnext_app_update_required") ? "Cần cập nhật App trước khi cài DichVideo Engine." : t.includes("engine_vnext_base_package_too_large") ? "Gói DichVideo Engine hiện quá lớn. DichVideo cần cập nhật gói engine nhẹ trước khi tải về máy này." : t.includes("engine_vnext_rollback_unavailable") ? "Chưa có phiên bản Engine trước để quay về trên máy này." : t.includes("download_failed") ? `Kh\xf4ng tải được DichVideo Engine. Chi tiết: ${t}` : t.includes("checksum_mismatch") || t.includes("vnext_package_size_mismatch") ? "Gói DichVideo Engine tải về không khớp manifest tin cậy. Hãy thử lại sau khi server được cập nhật." : `Kh\xf4ng chuẩn bị được DichVideo Engine. Chi tiết: ${t}` : "Không chuẩn bị được DichVideo Engine."
  }
  async function h(e) {
    let t = (0, a.isTauri)() ? await (0, o.getAppVersion)() : "0.1.28",
      i = await n.cloudApi.engineVnextManifest(e, "windows-x64", "alpha", t);
    if (i.fallback_family) throw Error("engine_vnext_manifest_legacy_fallback");
    let r = function(e) {
      for (let t of d) {
        let i = e.recommended?.[t] ?? null;
        if (i) return {
          variantKey: s,
          recommendation: i
        }
      }
      throw Error("engine_vnext_manifest_missing_engine")
    }(i);
    return {
      manifest: i,
      selectedRecommendation: r
    }
  }
  let v = (0, t.create)((e, t) => ({
    status: "idle",
    ready: !1,
    requiresInstall: !1,
    manifest: null,
    registryStatus: null,
    statusCheckedAt: null,
    requiredRecommendation: null,
    plan: null,
    progress: null,
    error: null,
    repairRequired: !1,
    loadStatus: async (i, n = {}) => {
      let o = n.staleMs ?? 0,
        l = t().statusCheckedAt;
      if (!n.force && l && Date.now() - l < o || c && (await c, !n.force)) return;
      let s = ++u;
      c = (async () => {
        if (!(0, a.isTauri)()) {
          if (s !== u) return;
          e({
            status: "ready",
            ready: !0,
            requiresInstall: !1,
            error: null,
            statusCheckedAt: Date.now()
          });
          return
        }
        e({
          status: "checking",
          error: null
        });
        let n = null;
        try {
          let o;
          if (n = await (0, r.getEngineRegistryStatus)(), t().repairRequired) {
            if (s !== u) return;
            e({
              status: "blocked",
              ready: !1,
              requiresInstall: !0,
              registryStatus: n,
              statusCheckedAt: Date.now(),
              error: "DichVideo Engine bị hỏng. Hãy cài lại Engine để tiếp tục xử lý."
            });
            return
          }
          try {
            o = await h(i)
          } catch (t) {
            if (m(n)) {
              if (s !== u) return;
              e({
                status: "ready",
                ready: !0,
                requiresInstall: !1,
                registryStatus: n,
                statusCheckedAt: Date.now(),
                progress: null,
                error: null
              });
              return
            }
            throw t
          }
          let {
            manifest: a,
            selectedRecommendation: l
          } = o, d = l.recommendation, c = p(n, d);
          if (s !== u) return;
          e({
            status: c ? "ready" : "blocked",
            ready: c,
            requiresInstall: !c,
            manifest: a,
            registryStatus: n,
            statusCheckedAt: Date.now(),
            requiredRecommendation: d,
            progress: null,
            error: null
          })
        } catch (t) {
          if (s !== u) return;
          e({
            status: "blocked",
            ready: !1,
            requiresInstall: null !== n && null === m(n),
            ...n ? {
              registryStatus: n
            } : {},
            error: g(t),
            statusCheckedAt: Date.now()
          })
        }
      })().finally(() => {
        s === u && (c = null)
      }), await c
    },
    prepareRequiredEngine: async e => {
      await t().installRequiredEngine(e)
    },
    installRequiredEngine: async n => {
      _();
      let o = t().repairRequired;
      if (!(0, a.isTauri)()) return void e({
        status: "ready",
        ready: !0,
        requiresInstall: !1,
        error: null,
        statusCheckedAt: Date.now()
      });
      e({
        status: "checking",
        ready: !1,
        error: null,
        progress: null
      });
      let s = null,
        d = null;
      try {
        let t;
        d = await (0, r.getEngineRegistryStatus)();
        try {
          t = await h(n)
        } catch (t) {
          if (m(d) && !o) return void e({
            status: "ready",
            ready: !0,
            requiresInstall: !1,
            registryStatus: d,
            statusCheckedAt: Date.now(),
            progress: null,
            error: null
          });
          throw t
        }
        let {
          manifest: a,
          selectedRecommendation: c
        } = t, u = c.recommendation;
        if (p(d, u) && !o) return void e({
          status: "ready",
          ready: !0,
          requiresInstall: !1,
          manifest: a,
          registryStatus: d,
          statusCheckedAt: Date.now(),
          requiredRecommendation: u,
          plan: null,
          progress: null,
          error: null
        });
        if (o) {
          let e = d.installedFamilies.find(e => e.family === l);
          e?.version && (await (0, r.uninstallEngineVnextPackage)(e.version), d = await (0, r.getEngineRegistryStatus)())
        }
        if (u.compressed_bytes > 0x2bc00000) throw Error("engine_vnext_base_package_too_large");
        let _ = await (0, r.getEngineVnextInstallPlan)({
          variant: c.variantKey,
          version: u.version,
          compressedBytes: u.compressed_bytes,
          installedBytes: u.installed_bytes
        });
        if (!_.canInstallNow) throw Error(`engine_vnext_install_blocked: ${function(e){if("insufficient_disk_space"===e.blockedReasonCode){let t=e.missingBytes?(e.missingBytes/1024/1024/1024).toFixed(1):null;return t?`M\xe1y n\xe0y thiếu khoảng ${t} GB để c\xe0i DichVideo Engine.`:"Máy này không đủ dung lượng để cài DichVideo Engine."}return"disk_space_unknown"===e.blockedReasonCode?"Chưa kiểm tra được dung lượng trống để cài DichVideo Engine.":"Chưa thể cài DichVideo Engine trên máy này."}(_)}`);
        s = await (0, i.listen)("engine-vnext-install-progress", t => {
          e({
            progress: t.payload,
            status: "installing",
            requiresInstall: !0
          })
        }), e({
          status: "installing",
          requiresInstall: !0,
          manifest: a,
          registryStatus: d,
          requiredRecommendation: u,
          plan: _
        }), await (0, r.downloadAndInstallEngineVnextPackage)({
          packageUrl: u.url,
          version: u.version,
          sha256: u.sha256,
          packageSizeBytes: u.compressed_bytes,
          installedBytes: u.installed_bytes,
          manifestSha256: null
        });
        let g = await (0, r.getEngineRegistryStatus)();
        if (!p(g, u)) throw Error("engine_vnext_install_not_ready_after_install");
        let v = g;
        try {
          let e = await (0, r.runLegacyRuntimeCleanupMigration)({
            dryRun: !1,
            force: !0
          });
          (e.ran || e.removedPaths.length > 0 || e.errors.length > 0) && (e.errors.length > 0 && console.warn("Post-install legacy runtime cleanup reported errors:", e), v = await (0, r.getEngineRegistryStatus)())
        } catch (e) {
          console.warn("Post-install legacy runtime cleanup skipped:", e)
        }
        e({
          status: "ready",
          ready: !0,
          requiresInstall: !1,
          repairRequired: !1,
          registryStatus: v,
          statusCheckedAt: Date.now(),
          progress: null,
          error: null
        })
      } catch (t) {
        throw e({
          status: "blocked",
          ready: !1,
          requiresInstall: !0,
          ...d ? {
            registryStatus: d
          } : {},
          error: g(t),
          statusCheckedAt: Date.now()
        }), t
      } finally {
        s?.()
      }
    },
    rollbackCurrentEngine: async i => {
      if (_(), !(0, a.isTauri)()) return void e({
        status: "ready",
        ready: !0,
        requiresInstall: !1,
        error: null,
        statusCheckedAt: Date.now()
      });
      e({
        status: "checking",
        ready: !1,
        error: null,
        progress: null
      });
      try {
        let e = (await (0, r.getEngineRegistryStatus)()).installedFamilies.find(e => e.family === l);
        if (!e?.version) throw Error("engine_vnext_rollback_unavailable");
        await (0, r.uninstallEngineVnextPackage)(e.version), await t().loadStatus(i, {
          force: !0
        })
      } catch (t) {
        throw e({
          status: "blocked",
          ready: !1,
          requiresInstall: !0,
          error: g(t),
          statusCheckedAt: Date.now()
        }), t
      }
    },
    markRepairRequired: () => e({
      status: "blocked",
      ready: !1,
      requiresInstall: !0,
      repairRequired: !0,
      error: "DichVideo Engine bị hỏng. Hãy cài lại Engine để tiếp tục xử lý.",
      statusCheckedAt: Date.now()
    }),
    clearError: () => e({
      error: null
    })
  }));
  e.s(["ENGINE_VNEXT_STATUS_CACHE_MS", 0, 3e4, "useEngineVnextInstallStore", 0, v])
}, 45017, e => {
  "use strict";
  var t = e.i(68834);
  let i = null,
    n = (0, t.create)(e => ({
      pendingRequest: null,
      requestEnginePreparation: t => new Promise(n => {
        i?.("cancelled"), i = n, e({
          pendingRequest: t
        })
      }),
      resolveEnginePreparation: t => {
        i?.(t), i = null, e({
          pendingRequest: null
        })
      }
    }));
  e.s(["useEnginePreparationStore", 0, n])
}, 90808, e => {
  "use strict";

  function t(e) {
    if (!e.trim()) throw Error("subtitle_stable_cue_id_required");
    return {
      stableCueId: e,
      originalText: "engine",
      translatedText: "engine",
      timing: "engine",
      excluded: "engine"
    }
  }

  function i(e, i) {
    let n = e.stableCueId ?? i?.stableCueId ?? `source:${e.index}`;
    return i?.stableCueId === n ? {
      ...i
    } : t(n)
  }
  e.s(["authorSubtitleField", 0, function(e, t, n, r) {
    let o = i(e, t);
    o[n] = "user";
    let a = {
      ...e,
      stableCueId: o.stableCueId,
      fieldAuthority: o
    };
    if ("timing" === n) return {
      authority: o,
      subtitle: {
        ...a,
        startTime: r.startTime,
        endTime: r.endTime
      }
    };
    if ("excluded" === n) return {
      authority: o,
      subtitle: {
        ...a,
        excluded: r
      }
    };
    let l = {
      ...a,
      [n]: r
    };
    return "translatedText" === n && (l.engineReadiness = {
      translation: "ready",
      tts: e.engineReadiness?.tts ?? "not_requested"
    }), {
      authority: o,
      subtitle: l
    }
  }, "createEngineSubtitleAuthority", 0, t, "mergeEngineCueIntoAuthoredSubtitle", 0, function(e, t, n) {
    let r = i(e, n ?? e.fieldAuthority);
    if ((t.stableCueId ?? r.stableCueId) !== r.stableCueId) throw Error("subtitle_stable_cue_identity_mismatch");
    let o = {
      ...e,
      ...t,
      id: e.id,
      videoId: e.videoId ?? t.videoId,
      style: e.style,
      stableCueId: r.stableCueId,
      fieldAuthority: r
    };
    return "user" === r.originalText && (o.originalText = e.originalText), "user" === r.translatedText && (o.translatedText = e.translatedText), "user" === r.timing && (o.startTime = e.startTime, o.endTime = e.endTime), "user" === r.excluded && (o.excluded = e.excluded), "user" === r.translatedText && (o.engineReadiness = {
      translation: "ready",
      tts: t.engineReadiness?.tts ?? e.engineReadiness?.tts ?? "not_requested"
    }), o
  }])
}, 9628, e => {
  "use strict";

  function t(e) {
    return (e ?? "").replace(/\s+/g, " ").trim()
  }

  function i(e) {
    let i = t(e.translatedText || e.originalText);
    return [e.index, i].join("|")
  }

  function n(e) {
    let [, t, i] = e.split("|", 3), n = Number(t), r = Number(i);
    return Number.isFinite(n) && Number.isFinite(r) ? {
      startTime: n,
      endTime: r
    } : null
  }
  e.s(["applySubtitleExclusions", 0, function(e, r) {
    if (!r || 0 === r.length) return e.map(e => ({
      ...e,
      excluded: !1
    }));
    let o = new Set(r),
      a = new Set(r.map(e => {
        let t;
        return ((t = e.split("|")).length < 4 ? null : [t[0], t.slice(3).join("|")].join("|")) ?? e
      }).filter(Boolean)),
      l = r.map(n).filter(e => !!e);
    return e.map(e => {
      let n;
      return {
        ...e,
        excluded: o.has(i(e)) || o.has((n = t(e.translatedText || e.originalText), [e.index, Math.max(0, Math.round(e.startTime)), Math.max(0, Math.round(e.endTime)), n].join("|"))) || a.has(i(e)) || l.some(t => e.startTime >= t.startTime - 1 && e.endTime <= t.endTime + 1)
      }
    })
  }, "excludedSubtitleFingerprintsForVideo", 0, function(e, t) {
    return e.filter(e => e.videoId === t && !0 === e.excluded).map(i)
  }])
}, 89271, 81795, e => {
  "use strict";

  function t(e, t) {
    return e.startTime - t.startTime || e.index - t.index
  }

  function i(e, i) {
    if (!i) return [];
    let n = e.filter(e => e.videoId === i).sort(t);
    return n.length > 0 ? n : e.filter(e => !e.videoId).sort(t)
  }

  function n(e, t) {
    return e.filter(e => !0 !== e.excluded && t >= e.startTime && t <= e.endTime).sort((e, t) => t.startTime - e.startTime || t.index - e.index)[0]
  }
  e.s(["DEFAULT_SUBTITLE_STYLE", 0, {
    enabled: !0,
    presetId: "black_pill",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 18,
    fontColor: "#FFFFFF",
    backgroundColor: "#000000",
    backgroundOpacity: .76,
    backgroundStyle: "pill",
    accentColor: "#FFE347",
    position: "bottom",
    alignment: "center",
    maxWidthPercent: 90,
    bold: !0,
    italic: !1,
    outline: !1,
    outlineColor: "#000000",
    outlineWidth: 0,
    shadow: !1,
    shadowColor: "#000000CC",
    wordsPerCaption: 4
  }], 89271), e.s(["activeSubtitleIdAtTime", 0, function(e, t) {
    return n(e, t)?.id ?? null
  }, "getActiveSubtitleAtTime", 0, n, "getRenderSubtitlesForVideo", 0, function(e, t, n) {
    let r = i(t, n);
    return (r.length > 0 ? r : i(e, n)).filter(e => !0 !== e.excluded)
  }, "getSubtitlesForVideo", 0, i, "hasRenderSubtitlesForVideo", 0, function(e, t) {
    return i(e, t).length > 0
  }], 81795)
}, 53397, 12785, 57362, 5823, e => {
  "use strict";

  function t(e, t, i, n, r, o) {
    return {
      id: e,
      label: t,
      cssFamily: i,
      fontFamily: `"${i}", "Noto Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
      regularAssetPath: n,
      boldAssetPath: o,
      recommendedUse: r
    }
  }
  let i = [{
    id: "system",
    label: "Hệ thống",
    cssFamily: "system-ui",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    recommendedUse: "Mặc định của hệ điều hành"
  }, t("be-vietnam-pro", "Be Vietnam Pro", "Be Vietnam Pro", "/fonts/subtitles/BeVietnamPro-Regular.ttf", "Tiếng Việt hiện đại", "/fonts/subtitles/BeVietnamPro-Bold.ttf"), t("inter", "Inter", "Inter", "/fonts/subtitles/Inter.ttf", "Trung tính, nội dung dài"), t("noto-sans", "Noto Sans", "Noto Sans", "/fonts/subtitles/NotoSans.ttf", "Fallback an toàn"), t("source-sans-3", "Source Sans 3", "Source Sans 3", "/fonts/subtitles/SourceSans3.ttf", "Hướng dẫn và review"), t("barlow", "Barlow", "Barlow", "/fonts/subtitles/Barlow-Regular.ttf", "Video mạng xã hội", "/fonts/subtitles/Barlow-Bold.ttf"), t("lexend", "Lexend", "Lexend", "/fonts/subtitles/Lexend.ttf", "Dễ đọc, giáo dục"), t("nunito", "Nunito", "Nunito", "/fonts/subtitles/Nunito.ttf", "Mềm, thân thiện"), t("noto-serif", "Noto Serif", "Noto Serif", "/fonts/subtitles/NotoSerif.ttf", "Điện ảnh, tài liệu")];

  function n(e) {
    return e.trim().replace(/^["']|["']$/g, "").toLowerCase()
  }

  function r(e) {
    let t = n((e ?? "").split(",")[0] ?? ""),
      r = (e ?? "").trim();
    return i.find(e => e.id === r || e.fontFamily === r || n(e.cssFamily) === t) ?? i[0]
  }

  function o(e, t) {
    return t >= 700 && e.boldAssetPath ? e.boldAssetPath : e.regularAssetPath ?? e.boldAssetPath
  }
  e.s(["SUBTITLE_FONT_OPTIONS", 0, i, "getSubtitleCanvasFontWeight", 0, function(e) {
    return e ? 700 : 400
  }, "getSubtitleFontAssetPath", 0, o, "normalizeSubtitleFontFamily", 0, function(e) {
    return r(e).fontFamily
  }, "resolveSubtitleExportFontOption", 0, function(e) {
    let t = r(e);
    return o(t, t.boldAssetPath ? 700 : 400) ? t : i.find(e => "be-vietnam-pro" === e.id) ?? t
  }, "resolveSubtitleLayoutFontFamily", 0, function(e) {
    let t = r(e.fontFamily);
    return "system" === t.id ? "Segoe UI" : t.cssFamily
  }], 53397);
  var a = e.i(89271);
  let l = {
      ...a.DEFAULT_SUBTITLE_STYLE,
      enabled: !0,
      shadow: !1
    },
    s = [{
      id: "capcut_classic",
      name: "CC/TikTok",
      description: "Chữ trắng lớn, viền đen dày, không nền hộp.",
      style: {
        ...l,
        presetId: "capcut_classic",
        fontSize: 18,
        backgroundOpacity: 0,
        backgroundStyle: "none",
        outline: !0,
        outlineWidth: 4,
        shadow: !1
      }
    }, {
      id: "karaoke_highlight",
      name: "Karaoke",
      description: "Nền trong, chữ đậm, màu nhấn vàng cho karaoke/keyword.",
      style: {
        ...l,
        presetId: "karaoke_highlight",
        fontSize: 18,
        fontColor: "#FFE347",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#FFE347",
        outline: !0,
        outlineColor: "#3B0764",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#1E1B4B"
      }
    }, {
      id: "black_pill",
      name: "Hộp đen",
      description: "Nền đen gọn, dễ đọc, gần style subtitle app truyền thống.",
      style: {
        ...l,
        presetId: "black_pill",
        fontSize: 18,
        backgroundOpacity: .76,
        backgroundStyle: "pill",
        outlineWidth: 0,
        outline: !1,
        shadow: !1
      }
    }, {
      id: "creator_keywords",
      name: "Creator",
      description: "Chữ trắng viền đen, màu nhấn xanh cho keyword.",
      style: {
        ...l,
        presetId: "creator_keywords",
        fontSize: 18,
        fontColor: "#BBF7D0",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#34D399",
        outline: !0,
        outlineColor: "#064E3B",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#022C22"
      }
    }, {
      id: "pair_black_white",
      name: "Đen/Trắng",
      description: "Chữ đen viền trắng, nổi rõ trên cảnh sáng vừa phải.",
      style: {
        ...l,
        presetId: "pair_black_white",
        fontSize: 22,
        fontColor: "#000000",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#FFFFFF",
        outline: !0,
        outlineColor: "#FFFFFF",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#FFFFFF",
        wordsPerCaption: 4
      }
    }, {
      id: "pair_white_black",
      name: "Trắng/Đen",
      description: "Chữ trắng viền đen kinh điển, đọc tốt trên đa số video.",
      style: {
        ...l,
        presetId: "pair_white_black",
        fontSize: 22,
        fontColor: "#FFFFFF",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#000000",
        outline: !0,
        outlineColor: "#000000",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#000000",
        wordsPerCaption: 4
      }
    }, {
      id: "pair_red_white",
      name: "Đỏ/Trắng",
      description: "Chữ đỏ viền trắng cho caption nhấn mạnh, cảnh tối hoặc trung tính.",
      style: {
        ...l,
        presetId: "pair_red_white",
        fontSize: 22,
        fontColor: "#EF4444",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#FFFFFF",
        outline: !0,
        outlineColor: "#FFFFFF",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#7F1D1D",
        wordsPerCaption: 4
      }
    }, {
      id: "pair_yellow_black",
      name: "Vàng/Đen",
      description: "Chữ vàng viền đen, hợp video năng lượng cao và highlight.",
      style: {
        ...l,
        presetId: "pair_yellow_black",
        fontSize: 22,
        fontColor: "#FDE047",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#000000",
        outline: !0,
        outlineColor: "#000000",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#000000",
        wordsPerCaption: 4
      }
    }, {
      id: "pair_blue_white",
      name: "Xanh/Trắng",
      description: "Chữ xanh viền trắng, sạch và nổi trên cảnh tối.",
      style: {
        ...l,
        presetId: "pair_blue_white",
        fontSize: 22,
        fontColor: "#2563EB",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        accentColor: "#FFFFFF",
        outline: !0,
        outlineColor: "#FFFFFF",
        outlineWidth: 4,
        shadow: !1,
        shadowColor: "#1E3A8A",
        wordsPerCaption: 4
      }
    }, {
      id: "cinematic_soft",
      name: "Cinematic",
      description: "Chữ trắng lớn, nền kính tối mềm cho video kể chuyện hoặc review.",
      style: {
        ...l,
        presetId: "cinematic_soft",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: 24,
        fontColor: "#E0F2FE",
        backgroundColor: "#0F172A",
        backgroundOpacity: .42,
        backgroundStyle: "pill",
        accentColor: "#93C5FD",
        outline: !1,
        outlineWidth: 0,
        shadow: !1,
        shadowColor: "#000000",
        wordsPerCaption: 4
      }
    }, {
      id: "minimal_clean",
      name: "Minimal",
      description: "Gọn, sạch, ít hiệu ứng; hợp video đào tạo và nội dung dài.",
      style: {
        ...l,
        presetId: "minimal_clean",
        fontSize: 20,
        fontColor: "#FFFFFF",
        backgroundOpacity: 0,
        backgroundStyle: "none",
        outline: !1,
        outlineWidth: 0,
        shadow: !1,
        shadowColor: "#000000",
        wordsPerCaption: 5
      }
    }];

  function d(e) {
    let t = s.find(e => e.id === a.DEFAULT_SUBTITLE_STYLE.presetId);
    return s.find(t => t.id === e) ?? t ?? s[0]
  }
  e.s(["SUBTITLE_STYLE_PRESETS", 0, s, "applySubtitleStylePreset", 0, function(e, t) {
    let i = d(t);
    return {
      ...e,
      ...i.style,
      offsetX: e.offsetX ?? 0,
      offsetY: e.offsetY ?? 0
    }
  }, "getSubtitleStylePreset", 0, d], 12785), e.s(["replaceSubtitleStyleForVideo", 0, function(e, t, i) {
    return e.map(e => e.videoId === t ? {
      ...e,
      style: {
        ...i
      }
    } : e)
  }], 57362), e.s(["normalizeCharacterAdvisoryCueIndexesByVideo", 0, function(e) {
    return {}
  }], 5823)
}, 44318, e => {
  "use strict";
  var t = e.i(68834),
    i = e.i(79473),
    n = e.i(48868),
    r = e.i(89271),
    o = e.i(54217),
    a = e.i(81795),
    l = e.i(9628),
    s = e.i(53397),
    d = e.i(12785),
    c = e.i(57362),
    u = e.i(5823),
    _ = e.i(75157),
    p = e.i(90808);

  function m(e, t) {
    let i = new Map(e.filter(e => e.videoId === t).sort((e, t) => e.startTime - t.startTime || e.index - t.index).map((e, t) => [e.id, t + 1]));
    return e.map(e => e.videoId === t && i.has(e.id) ? {
      ...e,
      index: i.get(e.id)
    } : e)
  }

  function g(e, t) {
    return e.filter(e => e.videoId !== t)
  }

  function h(e, t) {
    if (!e) return t;
    let i = e.trim(),
      n = i.startsWith("#") ? i : `#${i}`;
    return /^#[0-9a-fA-F]{3}$/.test(n) ? `#${n[1]}${n[1]}${n[2]}${n[2]}${n[3]}${n[3]}` : /^#[0-9a-fA-F]{6}$/.test(n) ? n.toUpperCase() : t
  }

  function v(e, t = {}) {
    let i = (0, d.getSubtitleStylePreset)(e?.presetId),
      n = {
        ...r.DEFAULT_SUBTITLE_STYLE,
        ...i.style,
        ...e ?? {}
      },
      o = new Set([23, 25, 30, 31, 32]).has(n.fontSize) && t.normalizeLegacyFontSizeDefaults ? i.style.fontSize : n.fontSize ?? i.style.fontSize,
      a = h(n.fontColor, r.DEFAULT_SUBTITLE_STYLE.fontColor),
      l = h(n.backgroundColor, r.DEFAULT_SUBTITLE_STYLE.backgroundColor),
      c = h(n.outlineColor, r.DEFAULT_SUBTITLE_STYLE.outlineColor),
      u = h(n.shadowColor, r.DEFAULT_SUBTITLE_STYLE.shadowColor),
      _ = h(n.accentColor, i.style.accentColor),
      p = "pill" === n.backgroundStyle ? Math.max(.48, Math.min(.92, n.backgroundOpacity ?? i.style.backgroundOpacity)) : Math.max(0, Math.min(.92, n.backgroundOpacity ?? i.style.backgroundOpacity));
    return {
      ...n,
      enabled: !1 !== n.enabled,
      presetId: i.id,
      fontColor: a,
      backgroundColor: l,
      backgroundStyle: n.backgroundStyle || i.style.backgroundStyle,
      accentColor: _,
      fontFamily: (0, s.normalizeSubtitleFontFamily)(n.fontFamily || r.DEFAULT_SUBTITLE_STYLE.fontFamily),
      fontSize: Math.max(10, Math.min(56, o)),
      backgroundOpacity: p,
      bold: n.bold ?? i.style.bold,
      outline: n.outline ?? i.style.outline,
      outlineColor: c,
      outlineWidth: Math.max(0, Math.min(8, n.outlineWidth ?? i.style.outlineWidth)),
      shadow: n.shadow ?? i.style.shadow,
      shadowColor: u,
      wordsPerCaption: r.DEFAULT_SUBTITLE_STYLE.wordsPerCaption,
      maxWidthPercent: Math.max(25, Math.min(100, n.maxWidthPercent ?? 90)),
      offsetX: n.offsetX ?? 0,
      offsetY: n.offsetY ?? 0
    }
  }
  async function f(t) {
    if (!t) return;
    let {
      useVideoStore: i
    } = await e.A(82855);
    i.getState().clearTtsForVideo(t)
  }
  async function b(t, i) {
    if (!t) return;
    let {
      useVideoStore: n
    } = await e.A(82855);
    n.getState().clearTtsForSubtitle(t, i)
  }
  async function y(t, i) {
    if (!t) return;
    let {
      useVideoStore: n
    } = await e.A(82855);
    n.getState().markEditedSubtitleTtsDirty(t, i)
  }
  async function S(t) {
    if (!t) return;
    let {
      useVideoStore: i
    } = await e.A(82855);
    i.getState().invalidateTtsTimelineForVideo(t)
  }
  async function w(t) {
    if (!t) return;
    let {
      useVideoStore: i
    } = await e.A(82855), {
      persistLatestProjectManifest: n
    } = await e.A(55149), r = i.getState(), o = (0, l.excludedSubtitleFingerprintsForVideo)(I.getState().subtitles, t);
    r.updateVideo(t, {
      excludedSubtitleFingerprints: o
    }), await n(t, i.getState)
  }
  let I = (0, t.create)()((0, i.persist)((t, i) => ({
    subtitles: [],
    renderSubtitles: [],
    selectedSubtitleId: null,
    globalStyle: v(r.DEFAULT_SUBTITLE_STYLE),
    isTranscribing: !1,
    transcribeProgress: 0,
    characterAdvisoryCueIndexesByVideo: {},
    setSubtitles: e => t({
      subtitles: e,
      renderSubtitles: [],
      selectedSubtitleId: null
    }),
    replaceVideoSubtitles: (e, i) => t(t => {
      let n = [...t.subtitles.filter(t => t.videoId !== e), ...i];
      return {
        subtitles: m(n, e),
        renderSubtitles: g(t.renderSubtitles, e),
        selectedSubtitleId: n.some(e => e.id === t.selectedSubtitleId) ? t.selectedSubtitleId : null
      }
    }),
    replaceTerminalProjectSubtitles: (e, i, n) => t(t => {
      let r = [...t.subtitles.filter(t => t.videoId !== e), ...i],
        o = [...t.renderSubtitles.filter(t => t.videoId !== e), ...n];
      return {
        subtitles: m(r, e),
        renderSubtitles: m(o, e),
        selectedSubtitleId: r.some(e => e.id === t.selectedSubtitleId) ? t.selectedSubtitleId : null
      }
    }),
    replaceVideoRenderSubtitles: (e, i) => t(t => ({
      renderSubtitles: m([...t.renderSubtitles.filter(t => t.videoId !== e), ...i], e)
    })),
    clearVideoRenderSubtitles: e => t(t => ({
      renderSubtitles: e ? g(t.renderSubtitles, e) : []
    })),
    addSubtitle: e => {
      let i = (0, _.generateId)();
      return t(t => ({
        subtitles: m([...t.subtitles, {
          ...e,
          id: i
        }], e.videoId),
        renderSubtitles: g(t.renderSubtitles, e.videoId)
      })), i
    },
    updateSubtitle: (e, n) => {
      let r = i().subtitles.find(t => t.id === e);
      t(t => ({
        subtitles: t.subtitles.map(t => {
          let i, r, o;
          return t.id === e ? (i = t, r = t.fieldAuthority ?? (0, p.createEngineSubtitleAuthority)(t.stableCueId ?? `source:${t.index}`), "originalText" in n && void 0 !== n.originalText && ({
            subtitle: i,
            authority: r
          } = (0, p.authorSubtitleField)(i, r, "originalText", n.originalText)), "translatedText" in n && void 0 !== n.translatedText && ({
            subtitle: i,
            authority: r
          } = (0, p.authorSubtitleField)(i, r, "translatedText", n.translatedText)), ("startTime" in n || "endTime" in n) && ({
            subtitle: i,
            authority: r
          } = (0, p.authorSubtitleField)(i, r, "timing", {
            startTime: n.startTime ?? i.startTime,
            endTime: n.endTime ?? i.endTime
          })), "excluded" in n && void 0 !== n.excluded && ({
            subtitle: i,
            authority: r
          } = (0, p.authorSubtitleField)(i, r, "excluded", n.excluded)), o = {
            ...n
          }, delete o.originalText, delete o.translatedText, delete o.startTime, delete o.endTime, delete o.excluded, {
            ...i,
            ...o,
            fieldAuthority: r
          }) : t
        }),
        renderSubtitles: "startTime" in n || "endTime" in n || "originalText" in n || "translatedText" in n ? g(t.renderSubtitles, r?.videoId) : t.renderSubtitles
      }))
    },
    toggleSubtitleExcluded: n => {
      let r = i().subtitles.find(e => e.id === n);
      if (!r) return;
      let o = !0 !== r.excluded;
      t(e => ({
        subtitles: m(e.subtitles.map(e => e.id === n ? (0, p.authorSubtitleField)(e, e.fieldAuthority, "excluded", o).subtitle : e), r.videoId),
        renderSubtitles: g(e.renderSubtitles, r.videoId),
        selectedSubtitleId: n
      })), r.videoId && e.A(82855).then(async ({
        useVideoStore: e
      }) => {
        let i = e.getState(),
          a = i.videos.find(e => e.id === r.videoId);
        if (!a?.nleDocument) {
          await w(r.videoId), await y(r.videoId), await S(r.videoId);
          return
        }
        try {
          await i.setNleCaptionExcluded(r.videoId, r.stableCueId ?? r.id, o)
        } catch {
          t(e => ({
            subtitles: e.subtitles.map(e => e.id === n && e.excluded === o ? (0, p.authorSubtitleField)(e, e.fieldAuthority, "excluded", !o).subtitle : e)
          }))
        }
      })
    },
    removeSubtitle: e => {
      let n = i().subtitles.find(t => t.id === e);
      t(t => ({
        subtitles: m(t.subtitles.filter(t => t.id !== e), n?.videoId),
        renderSubtitles: g(t.renderSubtitles, n?.videoId),
        selectedSubtitleId: t.selectedSubtitleId === e ? null : t.selectedSubtitleId
      })), f(n?.videoId)
    },
    updateSubtitleText: (e, n, r) => {
      let o = i().subtitles.find(t => t.id === e);
      t(t => ({
        subtitles: t.subtitles.map(t => t.id === e ? (0, p.authorSubtitleField)(t, t.fieldAuthority, n, r).subtitle : t),
        renderSubtitles: g(t.renderSubtitles, o?.videoId)
      })), "translatedText" === n && (y(o?.videoId, [e]), b(o?.videoId, e))
    },
    replaceReplacementOccurrenceForVideo: (e, i, n) => {
      let r = [];
      return t(t => {
        let a = (0, o.replaceReplacementOccurrenceInSubtitles)(t.subtitles, e, i, n);
        return 0 === (r = a.changedCueIds).length ? t : {
          subtitles: a.subtitles,
          renderSubtitles: g(t.renderSubtitles, e)
        }
      }), 0 !== r.length && (y(e, r), Promise.all(r.map(t => b(e, t))), !0)
    },
    replaceReplacementPairsForVideo: (e, i) => {
      let n = [];
      return (t(t => {
        let r = (0, o.replaceReplacementPairsInSubtitles)(t.subtitles, e, i);
        return 0 === (n = r.changedCueIds).length ? t : {
          subtitles: r.subtitles,
          renderSubtitles: g(t.renderSubtitles, e)
        }
      }), 0 === n.length) ? 0 : (y(e, n), Promise.all(n.map(t => b(e, t))), n.length)
    },
    updateSubtitleTime: (e, n, r) => {
      let o = i().subtitles.find(t => t.id === e);
      t(t => ({
        subtitles: t.subtitles.map(t => t.id === e ? (0, p.authorSubtitleField)(t, t.fieldAuthority, "timing", {
          startTime: n ?? t.startTime,
          endTime: r ?? t.endTime
        }).subtitle : t),
        renderSubtitles: g(t.renderSubtitles, o?.videoId)
      })), y(o?.videoId, [e]), S(o?.videoId)
    },
    setSelectedSubtitle: e => t({
      selectedSubtitleId: e
    }),
    setGlobalStyle: e => t(t => {
      let i = v({
        ...t.globalStyle,
        ...e
      }, {
        normalizeLegacyFontSizeDefaults: !1
      });
      return {
        globalStyle: i,
        subtitles: t.subtitles.map(e => ({
          ...e,
          style: {
            ...i
          }
        })),
        renderSubtitles: t.renderSubtitles.map(e => ({
          ...e,
          style: {
            ...i
          }
        }))
      }
    }),
    setGlobalStyleForNewVideos: e => t(t => ({
      globalStyle: v({
        ...t.globalStyle,
        ...e
      }, {
        normalizeLegacyFontSizeDefaults: !1
      })
    })),
    applyVideoSubtitleStyle: (e, i, n) => t(t => {
      let r = v(i, {
        normalizeLegacyFontSizeDefaults: !1
      });
      return {
        ...n ? {
          globalStyle: r
        } : {},
        subtitles: (0, c.replaceSubtitleStyleForVideo)(t.subtitles, e, r),
        renderSubtitles: (0, c.replaceSubtitleStyleForVideo)(t.renderSubtitles, e, r)
      }
    }),
    setTranscribing: e => t({
      isTranscribing: e
    }),
    setTranscribeProgress: e => t({
      transcribeProgress: e
    }),
    setCharacterAdvisoryCueIndexes: (e, i) => t(t => {
      let n = (0, u.normalizeCharacterAdvisoryCueIndexesByVideo)({
        [e]: i
      });
      return Object.hasOwn(n, e) ? {
        characterAdvisoryCueIndexesByVideo: {
          ...t.characterAdvisoryCueIndexesByVideo,
          [e]: n[e]
        }
      } : t
    }),
    clearCharacterAdvisoryCueIndexes: e => t(t => ({
      characterAdvisoryCueIndexesByVideo: e ? Object.fromEntries(Object.entries(t.characterAdvisoryCueIndexesByVideo).filter(([t]) => t !== e)) : {}
    })),
    getSubtitleAtTime: e => {
      let {
        subtitles: t
      } = i();
      return (0, a.getActiveSubtitleAtTime)(t, e)
    },
    shiftAllSubtitles: e => t(t => ({
      subtitles: t.subtitles.map(t => ({
        ...t,
        startTime: Math.max(0, t.startTime + e),
        endTime: Math.max(0, t.endTime + e)
      })),
      renderSubtitles: []
    })),
    clearAll: () => t({
      subtitles: [],
      renderSubtitles: [],
      selectedSubtitleId: null,
      characterAdvisoryCueIndexesByVideo: {}
    })
  }), {
    name: "dichvideo-subtitle-session",
    storage: (0, i.createJSONStorage)(() => (0, n.createLegacyStorage)(() => localStorage, {
      "dichvideo-subtitle-session": ["video-glm-subtitle-session"]
    })),
    partialize: e => ({
      globalStyle: e.globalStyle,
      characterAdvisoryCueIndexesByVideo: e.characterAdvisoryCueIndexesByVideo
    }),
    merge: (e, t) => {
      let i = e?.globalStyle,
        n = i && "capcut_classic" === i.presetId && (i.enabled ?? !0) === !0 && (i.fontSize ?? 18) === 18 && "#FFFFFF" === i.fontColor && "#000000" === i.backgroundColor && (i.backgroundOpacity ?? 0) === 0 && (i.backgroundStyle ?? "none") === "none" && (i.accentColor ?? "#FFE347") === "#FFE347" && (i.position ?? "bottom") === "bottom" && (i.alignment ?? "center") === "center" && (i.maxWidthPercent ?? 90) === 90 && (i.bold ?? !0) === !0 && (i.italic ?? !1) === !1 && (i.outline ?? !0) === !0 && "#000000" === i.outlineColor && (i.outlineWidth ?? 4) === 4 && (i.shadow ?? !1) === !1 && (i.shadowColor ?? "#000000CC") === "#000000CC" && (i.wordsPerCaption ?? r.DEFAULT_SUBTITLE_STYLE.wordsPerCaption) === r.DEFAULT_SUBTITLE_STYLE.wordsPerCaption ? t.globalStyle : {
          ...t.globalStyle,
          ...i ?? {}
        };
      return {
        ...t,
        globalStyle: {
          ...v(n, {
            normalizeLegacyFontSizeDefaults: !i?.presetId
          })
        },
        selectedSubtitleId: null,
        isTranscribing: !1,
        transcribeProgress: 0,
        renderSubtitles: [],
        characterAdvisoryCueIndexesByVideo: (0, u.normalizeCharacterAdvisoryCueIndexesByVideo)(e?.characterAdvisoryCueIndexesByVideo)
      }
    }
  }));
  e.s(["useSubtitleStore", 0, I])
}, 18849, e => {
  "use strict";
  let t = "piper_native",
    i = [{
      id: "dv_vi_001",
      label: "Ngọc Huyền",
      shortLabel: "Ngọc Huyền",
      description: "Nữ tự nhiên, truyền cảm, hợp thuyết minh và kể chuyện.",
      gender: "female",
      language: "vi",
      provider: t,
      voice: "dv_vi_001",
      demoAudioPath: "/voice-demos/dichvideo/dv_vi_001.mp3?v=dv-preview-20260730b"
    }, {
      id: "dv_vi_002",
      label: "Mạnh Dũng",
      shortLabel: "Mạnh Dũng",
      description: "Nam rõ chữ, vững giọng, hợp tin tức và thuyết minh.",
      gender: "male",
      language: "vi",
      provider: t,
      voice: "dv_vi_002",
      demoAudioPath: "/voice-demos/dichvideo/dv_vi_002.mp3?v=dv-preview-20260730b"
    }, {
      id: "dv_vi_003",
      label: "Minh Khang",
      shortLabel: "Minh Khang",
      description: "Nam trẻ, sáng giọng, hợp review và nội dung hiện đại.",
      gender: "male",
      language: "vi",
      provider: t,
      voice: "dv_vi_003",
      demoAudioPath: "/voice-demos/dichvideo/dv_vi_003.mp3?v=dv-preview-20260730b"
    }, {
      id: "dv_vi_004",
      label: "Minh Quang",
      shortLabel: "Minh Quang",
      description: "Nam ấm, cân bằng, hợp video dài và dẫn chuyện.",
      gender: "male",
      language: "vi",
      provider: t,
      voice: "dv_vi_004",
      demoAudioPath: "/voice-demos/dichvideo/dv_vi_004.mp3?v=dv-preview-20260730b"
    }];
  e.s(["DICHVIDEO_TTS_PROVIDER_ID", 0, t, "DICHVIDEO_VOICE_OPTIONS", 0, i, "DICHVIDEO_VOICE_PREVIEW_TEXT", 0, "Xin chào, chào mừng đến với trang dịch video chấm com.", "getDichVideoVoiceById", 0, function(e) {
    return i.find(t => t.id === e) ?? null
  }, "isDichVideoVoiceId", 0, function(e) {
    return i.some(t => t.id === e)
  }])
}, 54302, e => {
  "use strict";
  let t = "vieneu_native",
    i = /^(?:vn_vi_\d+|dv_vi_\d+|vieneu_vi_\d+|vn:\d+|dv:voice:\d+)$/i,
    n = {
      Review: "review_phim",
      "Tin Tức & Thời Sự": "tin_tuc",
      "Kể Chuyện & Sách Nói": "ke_chuyen",
      "Podcast & Thuyết Minh": "podcast",
      "Quảng Cáo & Shorts": "quang_cao",
      "Điện Ảnh & Tài Liệu": "dien_anh"
    },
    r = {
      review_phim: "🎬 Review",
      tin_tuc: "📰 Tin Tức & Thời Sự",
      ke_chuyen: "📖 Kể Chuyện & Sách Nói",
      podcast: "🎙️ Podcast & Thuyết Minh",
      quang_cao: "📢 Quảng Cáo & Shorts",
      dien_anh: "🎥 Điện Ảnh & Tài Liệu"
    };

  function o(e) {
    let i = e.id.match(/^dv_vi_(\d+)$/i)?.[1];
    if (!i) return null;
    let o = n[e.acoustic_traits],
      a = "female" === e.gender ? "Nữ" : "male" === e.gender ? "Nam" : "",
      l = [a && `${a} ${e.region}`.trim(), e.acoustic_traits].filter(Boolean);
    return {
      id: `vn_vi_${i}`,
      label: `${e.display_name} (${e.region})`,
      shortLabel: e.display_name,
      description: l.join(" · "),
      gender: "female" === e.gender ? "female" : "male",
      region: e.region,
      ...o ? {
        category: o,
        categoryLabel: r[o]
      } : {},
      provider: t,
      voice: e.id,
      demoAudioPath: "",
      verification_status: e.verification_status
    }
  }
  let a = [];

  function l(e) {
    if (!e) return null;
    let n = e.trim();
    if (!n) return null;
    let r = a,
      o = r.find(e => e.id === n);
    if (o) return o;
    let l = r.find(e => e.voice === n);
    if (l) return l;
    if (n.startsWith("dv:voice:")) {
      let e = n.slice(9),
        t = `dv_vi_${e}`,
        i = `vn_vi_${e}`,
        o = r.find(e => e.voice === t || e.id === i);
      if (o) return o
    }
    let s = r.find(e => e.shortLabel.toLowerCase() === n.toLowerCase());
    if (s) return s;
    if (!i.test(n)) return null;
    let d = n.match(/(?:vn_vi_|dv_vi_|vieneu_vi_|vn:|dv:voice:)(\d+)$/i)?.[1] ?? "";
    return d ? {
      id: `vn_vi_${d}`,
      label: `vn_vi_${d}`,
      shortLabel: `vn_vi_${d}`,
      description: "",
      gender: "male",
      region: "",
      provider: t,
      voice: `dv_vi_${d}`,
      demoAudioPath: "",
      verification_status: "catalog_pending"
    } : null
  }
  e.s(["VIENEU_TTS_PROVIDER_ID", 0, t, "VIENEU_VOICE_PREVIEW_TEXT", 0, "Xin chào, chào mừng đến với trang dịch video chấm com.", "applyVieNeuEmbeddedCatalog", 0, function(e) {
    return a = e.map(o).filter(e => null !== e)
  }, "getVieNeuVoiceOptions", 0, function() {
    return a
  }, "isVieNeuVoiceId", 0, function(e) {
    return i.test(e.trim()) || null !== l(e)
  }, "resolveVieNeuVoice", 0, l])
}, 72888, e => {
  "use strict";
  e.s(["VIENEU_TURBO_PROVIDER", 0, "vieneu_turbo", "isVieNeuTurboVoiceId", 0, function(e) {
    return /^vnt:preset:[a-f0-9]{64}$/.test(e) || /^vnt:clone:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}:[a-f0-9]{64}$/.test(e)
  }])
}, 38991, e => {
  "use strict";
  var t = e.i(68834),
    i = e.i(79473),
    n = e.i(48868),
    r = e.i(53065);
  let o = (0, t.create)()((0, i.persist)((e, t) => ({
    currentView: "dashboard",
    settingsSection: "local-engine",
    sidebarCollapsed: !1,
    activePanel: null,
    isExportOpen: !1,
    accountPricingScrollRequest: 0,
    capCutLoginOpen: !1,
    setCurrentView: t => e({
      currentView: t
    }),
    leaveEditor: async (i, n) => {
      "editor" === t().currentView && n ? await (0, r.leaveEditorWithProjectAuthority)(n, () => e({
        currentView: i
      })) : e({
        currentView: i
      })
    },
    setSettingsSection: t => e({
      settingsSection: a(t)
    }),
    openEngineSettings: () => e({
      currentView: "settings",
      settingsSection: "local-engine"
    }),
    openAccountPricingSettings: () => e(e => ({
      currentView: "settings",
      settingsSection: "cloud",
      accountPricingScrollRequest: e.accountPricingScrollRequest + 1
    })),
    toggleSidebar: () => e(e => ({
      sidebarCollapsed: !e.sidebarCollapsed
    })),
    setSidebarCollapsed: t => e({
      sidebarCollapsed: t
    }),
    setActivePanel: t => e({
      activePanel: t
    }),
    setIsExportOpen: t => e({
      isExportOpen: t
    }),
    setCapCutLoginOpen: t => e({
      capCutLoginOpen: t
    })
  }), {
    name: "dichvideo-app-session",
    storage: (0, i.createJSONStorage)(() => (0, n.createLegacyStorage)(() => localStorage, {
      "dichvideo-app-session": ["video-glm-app-session"]
    })),
    partialize: e => ({
      settingsSection: e.settingsSection,
      activePanel: e.activePanel
    }),
    merge: (e, t) => ({
      ...t,
      ...e,
      currentView: "dashboard",
      settingsSection: a(e?.settingsSection),
      sidebarCollapsed: !1,
      isExportOpen: !1,
      accountPricingScrollRequest: 0,
      capCutLoginOpen: !1
    })
  }));

  function a(e) {
    return "glossary" === e ? "glossary" : "cloud" === e ? "cloud" : "local-engine"
  }
  e.s(["useAppStore", 0, o])
}, 77496, e => {
  "use strict";
  let t = "viral_tts",
    i = [{
      id: "viral-review-girl",
      label: "Reviewer sáng giọng",
      shortLabel: "Reviewer",
      description: "Nữ rõ chữ, hợp review phim và recap.",
      gender: "female",
      language: "vi",
      provider: t,
      upstreamVoice: "BV562_streaming",
      resourceId: "7483736254694035984",
      demoAudioPath: "/voice-demos/viral/viral-review-girl.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-dubbing-young-man",
      label: "Anh chàng lồng phim",
      shortLabel: "Lồng phim",
      description: "Nam trẻ, tự tin, hợp video giải trí.",
      gender: "male",
      language: "vi",
      provider: t,
      upstreamVoice: "BV075_streaming",
      resourceId: "7102355803792740865",
      demoAudioPath: "/voice-demos/viral/viral-dubbing-young-man.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-deep-narrator",
      label: "Nam trầm trailer",
      shortLabel: "Trailer",
      description: "Nam trầm, hợp kể chuyện và review dài.",
      gender: "male",
      language: "vi",
      provider: t,
      upstreamVoice: "BV560_streaming",
      resourceId: "7483736167565758992",
      demoAudioPath: "/voice-demos/viral/viral-deep-narrator.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-romance-storyteller",
      label: "Nàng kể chuyện",
      shortLabel: "Kể chuyện",
      description: "Nữ mềm, hợp truyện và phim cảm xúc.",
      gender: "female",
      language: "vi",
      provider: t,
      upstreamVoice: "BV421_vivn_streaming",
      resourceId: "7252594014782755330",
      demoAudioPath: "/voice-demos/viral/viral-romance-storyteller.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-chatty-girl",
      label: "Nữ nhanh vui",
      shortLabel: "Nhanh vui",
      description: "Nữ nhanh, sáng, hợp TikTok/Douyin.",
      gender: "female",
      language: "vi",
      provider: t,
      upstreamVoice: "BV074_streaming",
      resourceId: "7102355709945188865",
      demoAudioPath: "/voice-demos/viral/viral-chatty-girl.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-everyday-girl",
      label: "Nữ tự nhiên",
      shortLabel: "Tự nhiên",
      description: "Nữ rõ chữ, trung tính, hợp nhiều loại video.",
      gender: "female",
      language: "vi",
      provider: t,
      upstreamVoice: "vi_female_huong",
      resourceId: "7264854897953083905",
      demoAudioPath: "/voice-demos/viral/viral-everyday-girl.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-hoai-my",
      label: "Nữ truyền cảm",
      shortLabel: "Truyền cảm",
      description: "Nữ mềm, tự nhiên, hợp kể chuyện và thuyết minh.",
      gender: "female",
      language: "vi",
      provider: t,
      upstreamVoice: "vi-VN-HoaiMyNeural",
      resourceId: "7371666434650280464",
      demoAudioPath: "/voice-demos/viral/viral-hoai-my.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-nam-minh",
      label: "Nam dẫn chuyện",
      shortLabel: "Dẫn chuyện",
      description: "Nam rõ chữ, chắc nhịp, hợp review và tin tức.",
      gender: "male",
      language: "vi",
      provider: t,
      upstreamVoice: "vi-VN-NamMinhNeural",
      resourceId: "7371666524727153168",
      demoAudioPath: "/voice-demos/viral/viral-nam-minh.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-kid-voice",
      label: "Bé lí lắc",
      shortLabel: "Lí lắc",
      description: "Giọng nhỏ, vui, hợp nội dung giải trí ngắn.",
      gender: "female",
      language: "vi",
      provider: t,
      upstreamVoice: "BV074_streaming_dsp",
      resourceId: "7550087831092251920",
      demoAudioPath: "/voice-demos/viral/viral-kid-voice.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-kenny-emperor",
      label: "Đại ca hài",
      shortLabel: "Đại ca",
      description: "Nam hiệu ứng, hợp clip hài và bình luận kịch tính.",
      gender: "male",
      language: "vi",
      provider: t,
      upstreamVoice: "BV075_streaming_demon_dsp",
      resourceId: "7569442422665661712",
      demoAudioPath: "/voice-demos/viral/viral-kenny-emperor.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-robot-vn",
      label: "Robot vui",
      shortLabel: "Robot",
      description: "Giọng robot vui, hợp meme và nội dung công nghệ.",
      gender: "male",
      language: "vi",
      provider: t,
      upstreamVoice: "BV075_streaming_robot_dsp",
      resourceId: "7538698409633516816",
      demoAudioPath: "/voice-demos/viral/viral-robot-vn.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }, {
      id: "viral-viet-meo",
      label: "Mèo hài hước",
      shortLabel: "Mèo vui",
      description: "Giọng méo vui, hợp reaction và clip giải trí.",
      gender: "male",
      language: "vi",
      provider: t,
      upstreamVoice: "BV075_streaming_vibrato_dsp",
      resourceId: "7569450639810465040",
      demoAudioPath: "/voice-demos/viral/viral-viet-meo.mp3?v=vi-preview-20260624c",
      labStatus: "live-ready"
    }];
  e.s(["VIRAL_TTS_PROVIDER_ID", 0, t, "VIRAL_VOICE_OPTIONS", 0, i, "VIRAL_VOICE_PREVIEW_TEXT", 0, "Xin chào, chào mừng đến với trang dịch video chấm com", "getViralVoiceById", 0, function(e) {
    return i.find(t => t.id === e) ?? null
  }, "isViralVoiceId", 0, function(e) {
    return i.some(t => t.id === e)
  }])
}, 82139, e => {
  "use strict";
  let t = null;

  function i() {
    if (t) {
      try {
        t.pause(), t.currentTime = 0
      } catch {}
      t = null
    }
  }
  async function n(e) {
    i();
    let n = new Audio(e);
    t = n, n.onended = () => {
      t === n && (t = null)
    };
    try {
      return await n.play(), n
    } catch (e) {
      throw t === n && (t = null), e
    }
  }
  e.s(["playVoicePreviewAudio", 0, n, "stopVoicePreviewAudio", 0, i])
}, 78238, e => {
  "use strict";
  e.i(89268);
  var t = e.i(62281),
    i = e.i(81341),
    n = e.i(77496),
    r = e.i(82139);

  function o(e) {
    if ("string" == typeof e) return e;
    if (e && "object" == typeof e) {
      if ("string" == typeof e.customerMessage) return e.customerMessage;
      if ("string" == typeof e.customer_message) return e.customer_message;
      if ("string" == typeof e.message) return e.message;
      if ("string" == typeof e.code) return e.code
    }
    return String(e)
  }
  async function a(e) {
    let o = (0, n.getViralVoiceById)(e);
    if (o?.demoAudioPath) return await (0, r.playVoicePreviewAudio)(o.demoAudioPath), {
      providerId: o.provider,
      voiceId: e,
      audioPath: o.demoAudioPath,
      bytes: 0,
      elapsedMs: 0
    };
    let a = await (0, t.generateViralVoicePreview)({
      voiceId: e,
      text: n.VIRAL_VOICE_PREVIEW_TEXT
    });
    return await (0, r.playVoicePreviewAudio)((0, i.resolveMediaSrc)(a.audioPath)), await (0, i.showMessage)("Mẫu giọng đọc", `Đang ph\xe1t ${o?.label??"Giọng cao cấp"} (${Math.round(a.bytes/1024)} KB).`, "info"), a
  }
  e.s(["playViralVoicePreview", 0, a, "viralVoiceErrorText", 0, o, "viralVoiceNeedsSettings", 0, function(e) {
    let t = o(e);
    return /viral_tts_not_configured|viral_tts_session_expired|premium-voice/i.test(t)
  }])
}, 17569, 68527, e => {
  "use strict";
  e.i(89268);
  var t = e.i(62281),
    i = e.i(81341),
    n = e.i(38991);

  function r() {
    n.useAppStore.getState().setCapCutLoginOpen(!0)
  }
  async function o() {
    if (!(0, i.isTauri)()) return r(), !0;
    try {
      if ((await (0, t.getViralVoiceCapCutStatus)()).connected) return !1
    } catch {}
    return r(), !0
  }
  e.s(["PREMIUM_VOICE_LOGIN_GUIDANCE", 0, "Tạo tài khoản CC miễn phí và Đăng nhập để sử dụng giọng cao cấp", "openCapCutLoginIfNeeded", 0, o], 17569);
  var a = e.i(68476),
    l = e.i(77496),
    s = e.i(78238),
    d = e.i(57342);
  let c = l.VIRAL_VOICE_OPTIONS[0].id,
    u = new Set(["viral_tts_not_configured", "viral_tts_session_expired"]),
    _ = new Set(["viral_tts_capcut_http_failed", "viral_tts_capcut_network_failed", "viral_tts_empty_audio", "viral_tts_missing_audio_url", "viral_tts_material_failed", "viral_tts_preview_failed", "viral_tts_text_too_long", "viral_tts_voice_unknown"]),
    p = e => {
      if (e && "object" == typeof e)
        for (let t of ["code", "error_code"]) {
          let i = e[t];
          if ("string" == typeof i && i.trim()) return i.trim()
        }
      return null
    },
    m = e => (0, s.viralVoiceErrorText)(e).slice(0, 512);
  async function g(e) {
    let {
      apiUrl: t,
      token: i
    } = d.useCloudStore.getState();
    if (i) try {
      await a.cloudApi.recordPremiumVoiceCheck(t, i, e)
    } catch {}
  }
  async function h({
    surface: e,
    voice: i
  }) {
    let n = Date.now();
    try {
      let r = await (0, t.generateViralVoicePreview)({
        voiceId: i,
        text: l.VIRAL_VOICE_PREVIEW_TEXT
      });
      return await g({
        surface: e,
        operation: "synthesis_preview",
        status: "succeeded",
        sub_operation: "synthesis",
        provider_id: l.VIRAL_TTS_PROVIDER_ID,
        voice_id: i,
        elapsed_ms: r.elapsedMs || Date.now() - n
      }), r
    } catch (o) {
      let t, r;
      throw await g({
        surface: e,
        operation: "synthesis_preview",
        status: "failed",
        sub_operation: (t = p(o)?.toLowerCase() ?? "", r = m(o).toLowerCase(), u.has(t) || t.includes("session") || r.includes("phiên") || r.includes("dang nhap") || r.includes("đăng nhập") ? "session" : t.includes("login") || t.includes("auth") ? "auth_check" : _.has(t) || t.includes("preview") || t.includes("capcut") || t.includes("audio") || t.includes("tts") || t.includes("text_too_long") || r.includes("multi_platform") || r.includes("giọng cao cấp") ? "synthesis" : "unknown"),
        provider_id: l.VIRAL_TTS_PROVIDER_ID,
        voice_id: i,
        error_code: p(o),
        error_message: m(o),
        elapsed_ms: Date.now() - n
      }), o
    }
  }
  e.s(["PREMIUM_VOICE_SETTINGS_CHECK_VOICE_ID", 0, c, "checkPremiumVoiceSynthesisReadiness", 0, h], 68527)
}]);