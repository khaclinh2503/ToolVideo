(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 48357, 35612, 15166, e => {
  "use strict";
  let t = () => TypeError("Value is not canonical JSON.");
  async function i(e) {
    if (!globalThis.crypto?.subtle) throw Error("Web Crypto SHA-256 is unavailable.");
    let t = e.slice();
    return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", t)), e => e.toString(16).padStart(2, "0")).join("")
  }
  async function n(e) {
    return i(new TextEncoder().encode(function e(i, n) {
      if (null === i || "boolean" == typeof i || "string" == typeof i) return JSON.stringify(i);
      if ("number" == typeof i) {
        if (!Number.isFinite(i)) throw t();
        return JSON.stringify(i)
      }
      if ("object" != typeof i) throw t();
      if (n.has(i)) throw TypeError("Canonical JSON cannot contain cycles.");
      n.add(i);
      try {
        if (Array.isArray(i)) {
          let r = [];
          for (let a = 0; a < i.length; a += 1) {
            if (!(a in i)) throw t();
            r.push(e(i[a], n))
          }
          return `[${r.join(",")}]`
        }
        let r = Object.getPrototypeOf(i);
        if (r !== Object.prototype && null !== r) throw t();
        let a = Reflect.ownKeys(i);
        if (a.some(e => "string" != typeof e)) throw t();
        let o = a.sort().map(r => {
          let a = Object.getOwnPropertyDescriptor(i, r);
          if (!a?.enumerable || !("value" in a)) throw t();
          return `${JSON.stringify(r)}:${e(a.value,n)}`
        });
        return `{${o.join(",")}}`
      } finally {
        n.delete(i)
      }
    }(e, new WeakSet)))
  }
  e.s(["canonicalJsonSha256", 0, n, "sha256Hex", 0, i], 35612);
  let r = "piper-component-execution-v1",
    a = "piper-voice-pack-vi-dichvideo-v1",
    o = "dichvideo_vi_normalizer_v1",
    s = /^[a-f0-9]{64}$/;

  function u(e) {
    return !e || "object" != typeof e || Array.isArray(e) ? null : e.schemaVersion === r && e.componentId === a && "string" == typeof e.componentVersion && e.componentVersion && e.componentVersion.trim() === e.componentVersion && "string" == typeof e.packFingerprint && s.test(e.packFingerprint) && e.normalizerId === o ? {
      schemaVersion: r,
      componentId: a,
      componentVersion: e.componentVersion,
      packFingerprint: e.packFingerprint,
      normalizerId: o
    } : null
  }

  function d(e, t) {
    let i = u(e),
      n = u(t);
    return !!(i && n && i.componentVersion === n.componentVersion && i.packFingerprint === n.packFingerprint)
  }
  e.s(["DICHVIDEO_VI_NORMALIZER_ID", 0, o, "normalizePiperComponentExecutionIdentity", 0, u, "samePiperComponentExecutionIdentity", 0, d], 15166);
  let c = "desktop-processing-session-v1",
    l = "local-job-resume-v1",
    _ = new Map(["preflight", "stt", "translation", "tts", "compose_audio", "retime", "export", "finalize"].map((e, t) => [e, t])),
    p = /^[a-f0-9]{64}$/,
    h = /(^|_)(?:job_token|auth_token|account_token|token|bearer|authorization)(?:_|$)/i,
    m = /^[A-Za-z0-9._-]+$/;

  function g(e) {
    if (!e || e.trim() !== e || "." === e || ".." === e) return !1;
    let t = new TextEncoder().encode(e).byteLength;
    return t <= 128 && t <= 72 && m.test(e) && !/^_+$/.test(e)
  }

  function f(e) {
    return function e(t) {
      if (void 0 !== t) {
        if (null === t || "string" == typeof t || "boolean" == typeof t) return t;
        if ("number" == typeof t) {
          if (!Number.isFinite(t)) throw Error("desktop_processing_snapshot_not_json");
          return t
        }
        if (Array.isArray(t)) {
          let i = t.map(e);
          if (i.some(e => void 0 === e)) throw Error("desktop_processing_snapshot_not_json");
          return i
        }
        if (t && "object" == typeof t) {
          if ("[object Object]" !== Object.prototype.toString.call(t)) throw Error("desktop_processing_snapshot_not_json");
          return Object.fromEntries(Object.entries(t).map(([t, i]) => [t, e(i)]).filter(([, e]) => void 0 !== e))
        }
        throw Error("desktop_processing_snapshot_not_json")
      }
    }(e)
  }
  async function v(e) {
    let t, i = e.translationStyle.prompt ?? "",
      r = (e.glossary ?? []).map(e => [e.source, e.target, e.dictionary_name ?? null, e.group_name ?? null]),
      a = void 0 === e.piperExecutionIdentity ? void 0 : u(e.piperExecutionIdentity);
    if (void 0 !== e.piperExecutionIdentity && !a) throw Error("desktop_processing_piper_identity_invalid");
    return {
      source_language: e.sourceLanguage,
      target_language: e.targetLanguage,
      translation_style: {
        style_id: e.translationStyle.styleId,
        custom_prompt_sha256: i ? await n(i) : null
      },
      glossary_fingerprint: await n(r),
      processing_mode: e.processingMode,
      include_tts: e.includeTts,
      tts_provider: e.ttsProvider ?? null,
      tts_voice: e.ttsVoice ?? null,
      ...void 0 === a ? {} : {
        piper_execution_identity: a
      },
      dubbing_timeline: f(e.dubbingTimeline),
      ...void 0 === e.dubbingTimelineIntent ? {} : {
        dubbing_timeline_intent: e.dubbingTimelineIntent
      },
      subtitle_mode: f(e.subtitleMode),
      resource_policy: null === e.resourcePolicy ? null : f(e.resourcePolicy),
      effective_local_engine_settings_fingerprint: await n((Reflect.deleteProperty(t = f(e.effectiveLocalEngineSettings ?? {}), "openai_api_key"), t)),
      runtime_package_hash: e.runtimePackageHash,
      runtime_trust_set_id: e.runtimeTrustSetId,
      engine_policy_version: e.enginePolicyVersion,
      processing_policy_hash: e.processingPolicyHash
    }
  }

  function b(e) {
    return !!e && "object" == typeof e && !Array.isArray(e)
  }
  let y = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})?$/;

  function I(e) {
    if ("string" != typeof e || e.trim() !== e) return null;
    let t = y.exec(e);
    if (!t) return null;
    let [, i, n, r, a, o, s, , u] = t, d = Number(i), c = Number(n), l = Number(r), _ = Number(a), p = Number(o), h = Number(s);
    if (d < 1970 || c < 1 || c > 12 || _ > 23 || p > 59 || h > 59) return null;
    let m = new Date(Date.UTC(d, c, 0)).getUTCDate();
    if (l < 1 || l > m) return null;
    if (u && "Z" !== u) {
      let [e, t] = u.slice(1).split(":").map(Number);
      if (e > 23 || t > 59) return null
    }
    let g = Date.parse(u ? e : `${e}Z`);
    return Number.isFinite(g) ? new Date(g).toISOString() : null
  }

  function S(e) {
    return "string" == typeof e && p.test(e)
  }

  function j(e) {
    return "string" == typeof e && _.has(e)
  }

  function P(e) {
    let t = e.trim().replaceAll("\\", "/").replace(/\/+$/, "");
    if (!t || t.includes("\0")) return null;
    let i = /^[A-Za-z]:\//.test(t) || t.startsWith("//");
    if (!i && !t.startsWith("/")) return null;
    let n = t.split("/").filter(Boolean);
    return n.some(e => "." === e || ".." === e) ? null : {
      parts: i ? n.map(e => e.toLocaleLowerCase("en-US")) : n,
      windows: i
    }
  }

  function A(e, t) {
    let i = P(e);
    if (!i || i.parts.length < 4) return !1;
    let n = i.windows ? t.toLocaleLowerCase("en-US") : t;
    return "source" === i.parts.at(-2) && i.parts.at(-3) === n && "projects" === i.parts.at(-4)
  }
  let H = new Set(["schema_version", "project_id", "job_id", "attempt_id", "logical_job_id", "resume_generation", "producing_app_version", "device_id", "lifecycle_contract_version", "policy_snapshot_hash", "renewal_deadline_at", "lease_generation", "authorized_source_seconds", "queue_snapshot_hash", "current_stage", "interruption_counts", "source_pin_path", "native_output_root_path", "piper_execution_identity", "updated_at"]);

  function w(e) {
    if (!b(e) || Object.keys(e).some(e => h.test(e) || !H.has(e)) || e.schema_version !== c || e.lifecycle_contract_version !== l || "string" != typeof e.project_id || !e.project_id || e.project_id.trim() !== e.project_id || "string" != typeof e.job_id || !g(e.job_id) || void 0 !== e.attempt_id && ("string" != typeof e.attempt_id || !g(e.attempt_id) || e.attempt_id !== e.job_id) || void 0 !== e.logical_job_id && ("string" != typeof e.logical_job_id || !g(e.logical_job_id)) || void 0 !== e.resume_generation && (!Number.isSafeInteger(e.resume_generation) || e.resume_generation < 0) || void 0 !== e.producing_app_version && ("string" != typeof e.producing_app_version || !e.producing_app_version || e.producing_app_version.trim() !== e.producing_app_version || e.producing_app_version.length > 32) || "string" != typeof e.device_id || !e.device_id || e.device_id.trim() !== e.device_id || !S(e.policy_snapshot_hash) || !S(e.queue_snapshot_hash)) return null;
    let t = I(e.renewal_deadline_at),
      i = I(e.updated_at);
    if (!t || !i || !Number.isSafeInteger(e.lease_generation) || e.lease_generation < 0 || !Number.isSafeInteger(e.authorized_source_seconds) || e.authorized_source_seconds <= 0 || !j(e.current_stage)) return null;
    let n = function(e) {
      if (!b(e)) return null;
      let t = {};
      for (let [i, n] of Object.entries(e)) {
        if (!j(i) || !Number.isSafeInteger(n) || n < 0) return null;
        t[i] = n
      }
      return t
    }(e.interruption_counts);
    if (!n || "string" != typeof e.source_pin_path || "string" != typeof e.native_output_root_path || !A(e.source_pin_path, e.project_id) || null === P(e.native_output_root_path)) return null;
    let r = void 0 === e.piper_execution_identity ? void 0 : u(e.piper_execution_identity);
    return void 0 === e.piper_execution_identity || r ? {
      schema_version: c,
      project_id: e.project_id,
      job_id: e.job_id,
      ...void 0 === e.attempt_id ? {} : {
        attempt_id: e.attempt_id
      },
      ...void 0 === e.logical_job_id ? {} : {
        logical_job_id: e.logical_job_id
      },
      ...void 0 === e.resume_generation ? {} : {
        resume_generation: e.resume_generation
      },
      ...void 0 === e.producing_app_version ? {} : {
        producing_app_version: e.producing_app_version
      },
      device_id: e.device_id,
      lifecycle_contract_version: l,
      policy_snapshot_hash: e.policy_snapshot_hash,
      renewal_deadline_at: t,
      lease_generation: e.lease_generation,
      authorized_source_seconds: e.authorized_source_seconds,
      queue_snapshot_hash: e.queue_snapshot_hash,
      current_stage: e.current_stage,
      interruption_counts: n,
      source_pin_path: e.source_pin_path,
      native_output_root_path: e.native_output_root_path,
      ...r ? {
        piper_execution_identity: r
      } : {},
      updated_at: i
    } : null
  }
  async function T({
    currentSession: e,
    readPersistedSession: t,
    applySession: i
  }) {
    try {
      let n = function(e, t) {
        let i = w(e),
          n = w(t);
        if (!i || !n || "finalize" !== n.current_stage) return null;
        let r = i.piper_execution_identity,
          a = n.piper_execution_identity,
          o = void 0 === r ? void 0 === a : void 0 !== a && d(r, a);
        return i.project_id === n.project_id && i.job_id === n.job_id && i.attempt_id === n.attempt_id && i.logical_job_id === n.logical_job_id && i.resume_generation === n.resume_generation && i.producing_app_version === n.producing_app_version && i.device_id === n.device_id && i.policy_snapshot_hash === n.policy_snapshot_hash && i.authorized_source_seconds === n.authorized_source_seconds && i.queue_snapshot_hash === n.queue_snapshot_hash && i.source_pin_path === n.source_pin_path && i.native_output_root_path === n.native_output_root_path && o ? n : null
      }(e, await t());
      if (!n) return !1;
      return await i(n), !0
    } catch {
      return !1
    }
  }
  e.s(["LOCAL_JOB_LIFECYCLE_CONTRACT", 0, l, "buildQueueSnapshotHashInput", 0, v, "createDesktopProcessingSession", 0, function(e) {
    if (!A(e.sourcePinPath, e.projectId)) throw Error("desktop_processing_source_pin_unmanaged");
    let t = w({
      schema_version: c,
      project_id: e.projectId,
      job_id: e.jobId,
      ...e.attemptId ? {
        attempt_id: e.attemptId
      } : {},
      ...e.logicalJobId ? {
        logical_job_id: e.logicalJobId
      } : {},
      ...null === e.resumeGeneration || void 0 === e.resumeGeneration ? {} : {
        resume_generation: e.resumeGeneration
      },
      ...e.producingAppVersion ? {
        producing_app_version: e.producingAppVersion
      } : {},
      device_id: e.deviceId,
      lifecycle_contract_version: l,
      policy_snapshot_hash: e.policySnapshotHash,
      renewal_deadline_at: e.renewalDeadlineAt,
      lease_generation: e.leaseGeneration,
      authorized_source_seconds: e.authorizedSourceSeconds,
      queue_snapshot_hash: e.queueSnapshotHash,
      current_stage: e.currentStage,
      interruption_counts: {},
      source_pin_path: e.sourcePinPath,
      native_output_root_path: e.nativeOutputRootPath,
      ...e.piperExecutionIdentity ? {
        piper_execution_identity: e.piperExecutionIdentity
      } : {},
      updated_at: e.now ?? new Date().toISOString()
    });
    if (!t) throw Error("desktop_processing_session_invalid");
    return t
  }, "normalizeDesktopProcessingSession", 0, w, "refreshFinalizedDesktopProcessingSession", 0, T], 48357)
}, 675, e => {
  "use strict";
  let t = /^[a-f0-9]{64}$/,
    i = /^sha256:[a-f0-9]{64}$/,
    n = /^terminal:[a-f0-9]{64}$/,
    r = /^playback:[a-f0-9]{64}$/,
    a = /^edit:[a-f0-9]{64}$/;

  function o(e, t) {
    return Object.assign(Error(t), {
      code: e,
      fallbackAllowed: !1
    })
  }

  function s(e) {
    return e ? i.test(e) ? e : t.test(e) ? `sha256:${e}` : null : null
  }

  function u(e) {
    return !!(e && "object" == typeof e && /^generation:[0-9a-f]{64}$/.test(String(e.generationId)) && /^sha256:[0-9a-f]{64}$/.test(String(e.planHash)) && /^sha256:[0-9a-f]{64}$/.test(String(e.timelineStateHash)))
  }

  function d(e) {
    if ("string" != typeof e || !/^(0|[1-9][0-9]*)$/.test(e)) return !1;
    try {
      let t = BigInt(e);
      return t >= BigInt(0) && t <= (BigInt(1) << BigInt(64)) - BigInt(1) && t.toString() === e
    } catch {
      return !1
    }
  }

  function c(e) {
    let t = e.processingSession,
      i = s(e.sourceFingerprint),
      r = s(t?.policy_snapshot_hash);
    if (!t || t.project_id !== e.id || !t.job_id || !i || !r) throw o("terminal_project_authority_unavailable", "terminal project authority is incomplete");
    let a = e.activeTerminalGeneration;
    if (a && !n.test(a)) throw o("terminal_project_generation_invalid", "active terminal generation identity is invalid");
    return {
      projectId: e.id,
      jobId: t.job_id,
      sourceIdentity: i,
      settingsGeneration: r,
      ...a ? {
        expectedGenerationId: a
      } : {},
      ...a && e.nativeProjectReadiness?.timingAuthority ? {
        expectedTimingAuthority: e.nativeProjectReadiness.timingAuthority
      } : {}
    }
  }

  function l(e) {
    if (!e || e.nleDocument) return !1;
    try {
      return c(e), !0
    } catch {
      return !1
    }
  }
  async function _(e, t) {
    let s = c(e),
      l = await t(s);
    return "ready" === l.state ? function(e, t) {
      let s = "ready" !== t.state || t.projectId !== e.projectId || t.jobId !== e.jobId || !t.generationId || !n.test(t.generationId) || !t.snapshotHash || !i.test(t.snapshotHash) || !t.audioGenerationId || !t.playbackGenerationId || !t.graphHash || !i.test(t.graphHash) || !t.transportProjectionHash || !i.test(t.transportProjectionHash) || null != t.timelineStateHash && t.timelineStateHash !== t.transportProjectionHash || !t.audioScheduleHash || !i.test(t.audioScheduleHash) || !t.visualSnapshotHash || !i.test(t.visualSnapshotHash) || !t.captionSetHash || !i.test(t.captionSetHash) || !u(t.timingAuthority),
        c = null != t.authoritySchemaVersion || null != t.editRevision || null != t.assetManifestHash ? "terminal-readiness-receipt-v3" !== t.authoritySchemaVersion || !a.test(t.playbackGenerationId ?? "") || !d(t.editRevision) || !t.assetManifestHash || !i.test(t.assetManifestHash) || null != t.artifactMembershipHash : !r.test(t.playbackGenerationId ?? "") || !t.artifactMembershipHash || !i.test(t.artifactMembershipHash) || null != t.authoritySchemaVersion || null != t.editRevision || null != t.assetManifestHash;
      if (s || c) throw o("terminal_project_authority_mismatch", "terminal project receipt does not match the local project authority");
      return {
        ...t,
        timelineStateHash: t.transportProjectionHash
      }
    }(s, l) : function(e, t) {
      if (t.projectId !== e.projectId || t.jobId !== e.jobId || "ready" === t.state || t.generationId || t.snapshotHash || t.timelineStateHash || t.audioGenerationId || t.playbackGenerationId || t.graphHash || t.transportProjectionHash || t.audioScheduleHash || t.visualSnapshotHash || t.captionSetHash || t.artifactMembershipHash || t.authoritySchemaVersion || t.editRevision || t.assetManifestHash || t.timingAuthority) throw o("terminal_project_authority_mismatch", "terminal project response carries mixed authority");
      return t
    }(s, l)
  }
  async function p(e, t) {
    let i = await _(e, t.inspect);
    if ("ready" !== i.state) return i;
    let n = await t.loadProjection(e, i);
    if (n.projectId !== i.projectId || n.generationId !== i.generationId || n.snapshotHash !== i.snapshotHash || n.timingAuthority.generationId !== i.timingAuthority.generationId || n.timingAuthority.planHash !== i.timingAuthority.planHash || n.timingAuthority.timelineStateHash !== i.timingAuthority.timelineStateHash || n.audioGenerationId !== i.audioGenerationId || n.playbackGenerationId !== i.playbackGenerationId || n.graphHash !== i.graphHash || n.transportProjectionHash !== i.transportProjectionHash || n.audioScheduleHash !== i.audioScheduleHash || n.visualSnapshotHash !== i.visualSnapshotHash || n.graph.generationId !== i.playbackGenerationId || n.graph.graphHash !== i.graphHash || "terminal-readiness-receipt-v3" === i.authoritySchemaVersion && ("project-edit-graph-v1" !== n.graph.schemaVersion || n.graph.editRevision !== i.editRevision || n.graph.assetManifestHash !== i.assetManifestHash || n.graph.captionSetHash !== i.captionSetHash) || "terminal-readiness-receipt-v3" !== i.authoritySchemaVersion && "project-playback-graph-v1" !== n.graph.schemaVersion) throw o("terminal_project_projection_mismatch", "terminal project projection does not match the admitted receipt");
    return t.commit(n, i), i
  }
  e.s(["canHydrateTerminalProject", 0, l, "canOpenTerminalProject", 0, function(e) {
    if (!e || e.nleDocument) return !1;
    let t = e.terminalAdmission,
      n = e.nativeProjectReadiness,
      o = t?.authoritySchemaVersion === "terminal-readiness-receipt-v3" ? a.test(t.playbackGenerationId ?? "") && d(t.editRevision) && i.test(t.assetManifestHash ?? "") && null == t.artifactMembershipHash : r.test(t?.playbackGenerationId ?? "") && i.test(t?.artifactMembershipHash ?? "") && t?.editRevision == null && t?.assetManifestHash == null;
    return !!(t?.state === "ready" && t.projectId === e.id && t.jobId === e.processingSession?.job_id && t.generationId && t.generationId === e.activeTerminalGeneration && u(t.timingAuthority) && t.playbackGenerationId && t.graphHash && t.transportProjectionHash && t.audioScheduleHash && t.visualSnapshotHash && t.audioGenerationId && t.audioGenerationId === n?.audioGenerationId && o)
  }, "claimTerminalAdmissionRefreshes", 0, function(e, t) {
    let i = e.flatMap(e => {
        let t = function(e) {
          if (!e || "completed" !== e.status || !l(e)) return null;
          let t = e.terminalAdmission;
          if (t?.state === "ready" || t?.state === "permanent_error") return null;
          let i = e.processingSession,
            n = t?.recovery;
          return JSON.stringify([e.id, i.job_id, s(e.sourceFingerprint), s(i.policy_snapshot_hash), e.nativeProjectReadiness?.timelineGeneration ?? null, e.nativeProjectReadiness?.timelineStateHash ?? null, e.nativeProjectReadiness?.audioGenerationId ?? null, t?.state ?? "missing", n?.stage ?? null, n?.missingArtifactCount ?? null, n?.nextRetryAtMs ?? null])
        }(e);
        return t ? [{
          videoId: e.id,
          key: t
        }] : []
      }),
      n = new Set(i.map(e => e.key));
    for (let e of t) n.has(e) || t.delete(e);
    return i.filter(e => !t.has(e.key) && (t.add(e.key), !0))
  }, "hydrateTerminalProject", 0, p, "inspectTerminalProjectAdmission", 0, _, "projectVideoPatchFromHydratedProjection", 0, function(e, t, i) {
    let n, r, a, s, u = function(e) {
      let t = e.projectAudio,
        i = function(e) {
          switch (e.state) {
            case "not_requested":
            case "requested":
            case "ready":
            case "canceled":
            case "regeneration_required":
              return {
                state: e.state
              };
            case "running":
              return "string" == typeof e.operationId && e.operationId.length > 0 ? {
                state: "running",
                operationId: e.operationId
              } : {
                state: "running"
              };
            case "failed":
              if ("string" == typeof e.code && e.code.length > 0) return {
                state: "failed",
                code: e.code
              }
          }
          throw o("terminal_project_projection_mismatch", "project audio separation state is invalid")
        }(t.separationState),
        n = Number(t.updatedAtMs);
      if (!Number.isSafeInteger(n) || n < 0) throw o("terminal_project_projection_mismatch", "project audio timestamp is outside the frontend exact range");
      let r = t.backgroundArtifactReceipt;
      if ("separated_background" === t.sourceSelection && !r) throw o("terminal_project_projection_mismatch", "separated project audio is missing its verified artifact receipt");
      return {
        state: {
          schemaVersion: t.schemaVersion,
          audioGenerationId: t.audioGenerationId,
          sourceSelection: t.sourceSelection,
          gainPercent: t.gainPercent,
          dashboardSnapshotMode: t.dashboardSnapshotMode,
          separationState: i,
          backgroundArtifactReceipt: r ? {
            schemaVersion: r.schemaVersion,
            engineId: r.engine.engineId,
            runtimeVersion: r.engine.runtimeVersion,
            outputContractVersion: r.outputContractVersion
          } : null,
          updatedAtMs: n
        }
      }
    }(t.graph);
    return {
      nativeProjectReadiness: (n = t.graph, r = e.nativeProjectReadiness, a = r?.timelineGeneration === t.playbackGenerationId && r.timelineStateHash === t.transportProjectionHash ? r.exportState : {
        state: "needs_export"
      }, s = "source_timeline" === n.mode.mode ? {
        state: "unapplied"
      } : {
        state: "applied",
        targetTempoTenths: n.mode.requestedVoiceRateTenths,
        generationId: t.playbackGenerationId,
        logicalPlanHash: t.transportProjectionHash
      }, {
        readyForEdit: !0,
        timelineGeneration: t.playbackGenerationId,
        timelineStateHash: t.transportProjectionHash,
        tempoState: s,
        exportState: a,
        audioGenerationId: t.audioGenerationId,
        timingAuthority: t.timingAuthority
      }),
      projectAudioTrack: u.state,
      terminalAdmission: i,
      activeTerminalGeneration: t.generationId,
      editedSubtitleTtsDirty: e.editedSubtitleTtsDirty,
      editedSubtitleTtsDirtyCaptionIds: e.editedSubtitleTtsDirtyCaptionIds
    }
  }, "readyTerminalAdmissionFromMutation", 0, function(e) {
    let t = null == e.editRevision ? null : String(e.editRevision),
      n = {
        state: "ready",
        projectId: e.projectId,
        jobId: e.jobId,
        generationId: e.terminalGenerationId,
        snapshotHash: e.terminalSnapshotHash,
        timelineStateHash: e.transportProjectionHash,
        audioGenerationId: e.audioGenerationId,
        graphHash: e.graphHash,
        transportProjectionHash: e.transportProjectionHash,
        audioScheduleHash: e.audioScheduleHash,
        visualSnapshotHash: e.visualSnapshotHash,
        captionSetHash: e.captionSetHash,
        timingAuthority: e.timingAuthority,
        recovery: null
      };
    if ("terminal-readiness-receipt-v3" === e.authoritySchemaVersion) {
      if (!a.test(e.playbackGenerationId) || !d(t) || !e.assetManifestHash || !i.test(e.assetManifestHash) || null != e.artifactMembershipHash) throw o("terminal_project_authority_mismatch", "Terminal V3 mutation receipt is incomplete");
      return {
        ...n,
        playbackGenerationId: e.playbackGenerationId,
        authoritySchemaVersion: e.authoritySchemaVersion,
        editRevision: t,
        assetManifestHash: e.assetManifestHash
      }
    }
    if (!r.test(e.playbackGenerationId) || !e.artifactMembershipHash || !i.test(e.artifactMembershipHash) || null != e.editRevision || null != e.assetManifestHash) throw o("terminal_project_authority_mismatch", "Terminal V2 mutation receipt is incomplete");
    return {
      ...n,
      playbackGenerationId: e.playbackGenerationId,
      artifactMembershipHash: e.artifactMembershipHash
    }
  }])
}, 79153, e => {
  "use strict";

  function t(e) {
    return Number.isFinite(e) ? Math.max(0, Math.min(1, e)) : 0
  }

  function i(e) {
    return Number(e.toFixed(4))
  }
  e.s(["DEFAULT_NATIVE_SUBTITLE_OCR_REGION", 0, {
    x: 0,
    y: .58,
    width: 1,
    height: .4
  }, "clampNativeSubtitleOcrRegion", 0, function(e) {
    let n = Math.max(.05, Math.min(1, t(e.width))),
      r = Math.max(.05, Math.min(1, t(e.height))),
      a = Math.max(0, Math.min(1 - n, t(e.x))),
      o = Math.max(0, Math.min(1 - r, t(e.y)));
    return {
      x: i(a),
      y: i(o),
      width: i(n),
      height: i(r)
    }
  }])
}, 43035, e => {
  "use strict";
  let t = {
    balanced: {
      _dichvideo_processing_profile: "server_authorized"
    },
    accurate: {
      _dichvideo_processing_profile: "server_authorized"
    },
    ocr_only: {
      _dichvideo_processing_profile: "server_authorized"
    }
  };
  e.s(["LOCAL_PROCESSING_MODE_OPTIONS", 0, [{
    value: "balanced",
    label: "Nhận diện giọng nói",
    description: "Xử lý nhanh, cân bằng tốc độ và chất lượng cho hầu hết video có giọng nói rõ."
  }, {
    value: "ocr_only",
    label: "Phụ đề có sẵn trong video.",
    description: "Đọc phụ đề có sẵn trong hình ảnh; thời gian xử lý có thể lâu hơn Nhận diện giọng nói."
  }], "applyLocalProcessingMode", 0, function(e, i) {
    return {
      ...i,
      ...t[e]
    }
  }, "isHighAccuracyProcessingMode", 0, function(e) {
    return "accurate" === e
  }, "isOcrOnlyProcessingMode", 0, function(e) {
    return "ocr_only" === e
  }])
}, 56260, e => {
  "use strict";
  var t = e.i(47167),
    i = e.i(79153),
    n = e.i(43035);

  function r(e, t, i, n) {
    return Number.isFinite(e) ? Math.max(i, Math.min(n, e)) : t
  }

  function a(e) {
    return Number.isFinite(e) ? e <= 0 ? 0 : Math.max(.12, Math.min(1, e)) : .18
  }

  function o(e) {
    return "separate_background" === e || "mute_original" === e ? e : "mix_original"
  }

  function s(e, t) {
    if (null != e || null != t) return {
      strategy: o(e),
      volume: a("number" == typeof t ? t : NaN)
    }
  }

  function u(e) {
    let t = "voiceover_tts_chunks" === e.display_subtitle_timing ? "voiceover_tts_chunks" : "source_timing";
    return {
      volumeOriginalAudio: a(e.volume_original_audio),
      originalAudioStrategy: o(e.original_audio_strategy),
      volumeTranslatedAudio: r(e.volume_translated_audio, 3, 3, 5),
      syncVoiceTiming: !!e.sync_voice_timing,
      maxAccelerateAudio: r(e.max_accelerate_audio, 2, 1, 4),
      accelerationRateRegulation: !!e.acceleration_rate_regulation,
      avoidOverlap: !!e.avoid_overlap,
      displaySubtitleTiming: t
    }
  }

  function d(e, t) {
    return e && t?.trim() === "piper_native"
  }
  e.s(["buildLocalJobRequestedFeatures", 0, function(e, t, i = {}) {
    let r = e ? ["subtitles", "voiceover"] : ["subtitles"];
    return (0, n.isHighAccuracyProcessingMode)(t) && r.push("high_accuracy_processing"), i?.preferNoWatermark && r.push("no_watermark"), r
  }, "buildLocalVoiceAuthorizationRoute", 0, function(e, t, i) {
    if (!d(e, t)) return {};
    let n = i?.trim() ?? "";
    if (!n) throw Error("local_voice_dichvideo_route_invalid");
    return {
      local_tts_provider: "piper_native",
      local_tts_voice: n
    }
  }, "buildNativeDubbingTimelineSettings", 0, function(e, t = {}) {
    if (!1 === t.includeTts || !e || "source_timeline" === e.mode) return {
      mode: "source_timeline"
    };
    if ("fixed_voice_speed" === e.mode) {
      let t = e.requestedVoiceRateTenths;
      return !Number.isInteger(t) || t < 10 || t > 20 ? {
        mode: "source_timeline"
      } : {
        mode: "fixed_voice_speed",
        requestedVoiceRateTenths: t,
        fixedVoiceRateSchema: "project-fixed-voice-rate-v2"
      }
    }
    return {
      mode: "source_timeline"
    }
  }, "buildNativeEditedSubtitleTtsCompatibilitySettings", 0, function(e) {
    return {
      ...u(e),
      syncVoiceTiming: !0,
      maxAccelerateAudio: r(e.max_accelerate_audio, 2, 2, 4),
      accelerationRateRegulation: !0,
      avoidOverlap: !0,
      displaySubtitleTiming: "source_timing"
    }
  }, "buildNativeSoniCompatibilitySettings", 0, u, "buildNativeSubtitleOcrSettings", 0, function(e, r) {
    let a = t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_SUBTITLE_OCR?.trim() || t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_SUBTITLE_OCR_MODE?.trim() || "",
      o = (0, n.isOcrOnlyProcessingMode)(r) ? "ocr_only_auto" : (0, n.isHighAccuracyProcessingMode)(r) ? "local_high_accuracy" : a;
    if (!o || "disabled" === o || "local_high_accuracy" !== o && "ocr_only_auto" !== o) return null;
    if ("ocr_only_auto" === o) return (0, n.isOcrOnlyProcessingMode)(r) ? {
      mode: o,
      model: t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_SUBTITLE_OCR_MODEL?.trim() || "cpu_high_accuracy",
      region: null,
      repairPolicy: null
    } : null;
    let s = e.nativeSubtitleOcrRegion ? (0, i.clampNativeSubtitleOcrRegion)(e.nativeSubtitleOcrRegion) : function(e) {
      if (!e) return null;
      let t = e.split(",").map(e => Number(e.trim()));
      if (4 !== t.length || t.some(e => !Number.isFinite(e))) return null;
      let [i, n, r, a] = t;
      return i < 0 || n < 0 || r <= 0 || a <= 0 || i + r > 1 || n + a > 1 ? null : {
        x: i,
        y: n,
        width: r,
        height: a
      }
    }(t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_SUBTITLE_OCR_REGION);
    return {
      mode: "local_high_accuracy",
      model: t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_SUBTITLE_OCR_MODEL?.trim() || "cpu_high_accuracy",
      region: s ?? i.DEFAULT_NATIVE_SUBTITLE_OCR_REGION,
      repairPolicy: t.default.env.NEXT_PUBLIC_DICHVIDEO_NATIVE_SUBTITLE_OCR_REPAIR_POLICY?.trim() || "suspicious_only"
    }
  }, "normalizeOriginalAudioPolicy", 0, s, "originalAudioPolicyFromSoniSettings", 0, function(e) {
    return s(e.original_audio_strategy, e.volume_original_audio) ?? {
      strategy: "mix_original",
      volume: .18
    }
  }, "shouldPreferNoWatermarkForLocalJob", 0, function({
    license: e,
    balance: t
  }) {
    let i = e?.plan_code ?? e?.plan ?? null;
    return Math.max(0, t?.video_credits_seconds ?? 0) > 0 || "free_weekly" !== i && "trial" !== i && "credit_payg" !== i && !!e?.paid_local_processing_allowed
  }, "shouldRequestLocalVoiceDichVideo", 0, d, "withVideoOriginalAudioPolicy", 0, function(e, t) {
    let i = s(t.originalAudioStrategy, t.originalAudioVolume);
    return i ? {
      ...e,
      original_audio_strategy: i.strategy,
      volume_original_audio: i.volume
    } : e
  }])
}, 51026, e => {
  "use strict";
  let t = "native-hybrid-retime-degradation-v3",
    i = "windows_current_user_dpapi_v1",
    n = /^[0-9a-f]{64}$/;

  function r(e) {
    return !e || "object" != typeof e || Array.isArray(e) ? null : e
  }

  function a({
    schema: e,
    timeWarpMapRepresentation: r,
    presetId: o,
    timingIntent: s,
    timeWarpMapHash: u,
    semanticAnchorGroupCount: d,
    mapSegmentCount: c,
    renderUnitCount: l,
    degradedGroupCount: _,
    degradedCueCount: p,
    maxEffectiveTempo: h,
    outputDurationMs: m
  }) {
    let g = "hybrid_1_25" === o || "hybrid_1_4" === o,
      f = (e, t = !1) => "number" == typeof e && Number.isSafeInteger(e) && e >= +!!t && e <= 1e7,
      v = "number" == typeof m && Number.isSafeInteger(m) && m >= 1 && m <= 108e5;
    if (e === t && r === i && ("current_preset" === s || "historical_numeric" === s) && ("current_preset" === s ? g : null === o) && "string" == typeof u && n.test(u) && f(d, !0) && f(c, !0) && f(l, !0) && f(_) && f(p) && !(_ > d) && "number" == typeof h && Number.isFinite(h) && !(h <= 0) && !(h > 3) && v) return {
      schemaVersion: t,
      timeWarpMapRepresentation: i,
      presetId: g ? o : null,
      timingIntent: s,
      timeWarpMapHash: u,
      semanticAnchorGroupCount: d,
      mapSegmentCount: c,
      renderUnitCount: l,
      degradedGroupCount: _,
      degradedCueCount: p,
      maxEffectiveTempo: h,
      outputDurationMs: m
    }
  }

  function o(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    if (e < 60) return `${Math.max(1,Math.round(e))} gi\xe2y`;
    let t = Math.max(1, Math.round(e / 60)),
      i = Math.floor(t / 60),
      n = t % 60;
    return 0 === i ? `${n} ph\xfat` : 0 === n ? `${i} giờ` : `${i} giờ ${n} ph\xfat`
  }
  e.s(["dubbingTimelineResultFromManifestSnapshot", 0, function(e) {
    let t = r(e);
    if (t) return a({
      schema: t.schema_version,
      timeWarpMapRepresentation: t.time_warp_map_representation,
      presetId: t.preset_id,
      timingIntent: t.timing_intent,
      timeWarpMapHash: t.time_warp_map_hash,
      semanticAnchorGroupCount: t.semantic_anchor_group_count,
      mapSegmentCount: t.map_segment_count,
      renderUnitCount: t.render_unit_count,
      degradedGroupCount: t.degraded_group_count,
      degradedCueCount: t.degraded_cue_count,
      maxEffectiveTempo: t.max_effective_tempo,
      outputDurationMs: t.output_duration_ms
    })
  }, "dubbingTimelineResultFromNativeMetrics", 0, function(e) {
    let t = r(e);
    if (t) return a({
      schema: t.dubbing_timeline_degradation_schema,
      timeWarpMapRepresentation: t.dubbing_timeline_time_warp_map_representation,
      presetId: t.dubbing_timeline_preset_id,
      timingIntent: t.dubbing_timeline_timing_intent,
      timeWarpMapHash: t.dubbing_timeline_time_warp_map_hash,
      semanticAnchorGroupCount: t.dubbing_timeline_semantic_anchor_group_count,
      mapSegmentCount: t.dubbing_timeline_map_segment_count,
      renderUnitCount: t.dubbing_timeline_render_unit_count,
      degradedGroupCount: t.dubbing_timeline_degraded_group_count,
      degradedCueCount: t.dubbing_timeline_degraded_cue_count,
      maxEffectiveTempo: t.dubbing_timeline_max_effective_tempo,
      outputDurationMs: t.dubbing_timeline_output_duration_ms
    })
  }, "dubbingTimelineResultToManifestSnapshot", 0, function(e) {
    let t = r(e);
    if (!t) return;
    let i = a({
      schema: t.schemaVersion,
      timeWarpMapRepresentation: t.timeWarpMapRepresentation,
      presetId: t.presetId,
      timingIntent: t.timingIntent,
      timeWarpMapHash: t.timeWarpMapHash,
      semanticAnchorGroupCount: t.semanticAnchorGroupCount,
      mapSegmentCount: t.mapSegmentCount,
      renderUnitCount: t.renderUnitCount,
      degradedGroupCount: t.degradedGroupCount,
      degradedCueCount: t.degradedCueCount,
      maxEffectiveTempo: t.maxEffectiveTempo,
      outputDurationMs: t.outputDurationMs
    });
    if (i) return {
      schema_version: i.schemaVersion,
      time_warp_map_representation: i.timeWarpMapRepresentation,
      preset_id: i.presetId,
      timing_intent: i.timingIntent,
      time_warp_map_hash: i.timeWarpMapHash,
      semantic_anchor_group_count: i.semanticAnchorGroupCount,
      map_segment_count: i.mapSegmentCount,
      render_unit_count: i.renderUnitCount,
      degraded_group_count: i.degradedGroupCount,
      degraded_cue_count: i.degradedCueCount,
      max_effective_tempo: i.maxEffectiveTempo,
      output_duration_ms: i.outputDurationMs
    }
  }, "formatDubbingTimelineDegradationNotice", 0, function(e) {
    let t = a({
      schema: e?.schemaVersion,
      timeWarpMapRepresentation: e?.timeWarpMapRepresentation,
      presetId: e?.presetId,
      timingIntent: e?.timingIntent,
      timeWarpMapHash: e?.timeWarpMapHash,
      semanticAnchorGroupCount: e?.semanticAnchorGroupCount,
      mapSegmentCount: e?.mapSegmentCount,
      renderUnitCount: e?.renderUnitCount,
      degradedGroupCount: e?.degradedGroupCount,
      degradedCueCount: e?.degradedCueCount,
      maxEffectiveTempo: e?.maxEffectiveTempo,
      outputDurationMs: e?.outputDurationMs
    });
    return t && 0 !== t.degradedGroupCount ? `${t.degradedGroupCount} đoạn qu\xe1 d\xe0y chữ sẽ đọc nhanh hơn để giữ video trong giới hạn. Nhanh nhất ${t.maxEffectiveTempo.toFixed(2)}x.` : null
  }, "formatDubbingTimelineDurationNotice", 0, function(e, t) {
    let i = o(e),
      n = o(t);
    return i && n ? `Độ d\xe0i video sau khi xử l\xfd: khoảng ${n} (video gốc ${i})` : null
  }])
}, 58450, 5750, 63754, e => {
  "use strict";
  var t = e.i(48357),
    i = e.i(56260),
    n = e.i(51026),
    r = e.i(15166),
    a = e.i(675);
  let o = new Set(["source_separation_preflight_unsafe_candidate", "source_separation_extract_source_unreadable", "source_separation_process_failed", "source_separation_output_missing", "source_separation_output_empty", "source_separation_stream_probe_failed", "source_separation_stream_endpoint_mismatch", "source_separation_stream_sample_rate_mismatch", "source_separation_stream_channel_mismatch", "source_separation_promotion_failed", "source_separation_receipt_mismatch", "source_separation_carrier_failed"]),
    s = Object.freeze({
      project_audio_source_unreadable: "Không thể đọc âm thanh gốc.",
      project_audio_separation_unavailable: "Bộ tách giọng chưa sẵn sàng.",
      native_source_separation_runtime_missing: "Bộ tách giọng chưa sẵn sàng.",
      project_audio_insufficient_memory: "Không đủ bộ nhớ để tách giọng.",
      project_audio_insufficient_disk: "Không đủ dung lượng trống để tách giọng.",
      project_audio_separation_failed: "Không thể tách giọng khỏi video này.",
      project_audio_candidate_invalid: "Kết quả tách giọng không hợp lệ.",
      project_audio_separation_canceled: "Đã hủy tách giọng.",
      project_audio_generation_stale: "Âm thanh của project vừa thay đổi. Hãy thử lại.",
      project_audio_export_locked: "Không thể đổi âm thanh khi đang xuất video.",
      nle_background_project_invalid: "Không thể đọc âm thanh gốc.",
      nle_background_cache_invalid: "Âm thanh nền đã lưu không còn hợp lệ.",
      nle_background_artifact_invalid: "Kết quả tách giọng không hợp lệ.",
      nle_document_mutation_stale: "Âm thanh của project vừa thay đổi. Hãy thử lại.",
      nle_background_response_invalid: "Kết quả tách giọng không hợp lệ.",
      nle_background_request_invalid: "Yêu cầu tách giọng không hợp lệ. Hãy thử lại.",
      project_audio_pointer_invalid: "Không thể đọc âm thanh gốc.",
      project_audio_generation_invalid: "Âm thanh của project vừa thay đổi. Hãy thử lại.",
      project_audio_operation_invalid: "Không thể bắt đầu tách giọng. Hãy thử lại."
    });

  function u(e) {
    var t;
    let i = _(e),
      n = !(t = i.customerMessage) || t.length > 240 || /[\u0000-\u001f\u007f]/.test(t) ? null : t.trim();
    if (n) return n;
    let r = i.code,
      a = r && s[r];
    return a || (r?.startsWith("nle_background_") || r?.startsWith("nle_document_") ? "Không thể tách giọng cho project này. Hãy thử lại." : "Không thể cập nhật âm thanh video. Hãy thử lại.")
  }

  function d(e) {
    var t;
    return {
      schema_version: e.schemaVersion,
      audio_generation_id: e.audioGenerationId,
      source_selection: e.sourceSelection,
      gain_percent: e.gainPercent,
      dashboard_snapshot_mode: e.dashboardSnapshotMode,
      separation_state: "failed" === (t = e.separationState).state ? {
        state: "failed",
        code: t.code
      } : {
        state: t.state
      },
      background_summary: e.backgroundArtifactReceipt ? {
        schema_version: e.backgroundArtifactReceipt.schemaVersion,
        engine_id: e.backgroundArtifactReceipt.engineId,
        runtime_version: e.backgroundArtifactReceipt.runtimeVersion,
        output_contract_version: e.backgroundArtifactReceipt.outputContractVersion
      } : null,
      updated_at_ms: e.updatedAtMs
    }
  }

  function c(e) {
    let t = m(e);
    if (!t || "project-audio-track-v1" !== t.schema_version) return null;
    let i = g(t.audio_generation_id),
      n = t.source_selection,
      r = t.dashboard_snapshot_mode,
      a = t.gain_percent,
      o = t.updated_at_ms,
      s = function(e) {
        let t = m(e);
        switch (t?.state) {
          case "not_requested":
          case "requested":
          case "running":
          case "ready":
          case "canceled":
          case "regeneration_required":
            return {
              state: t.state
            };
          case "failed": {
            let e = g(t.code);
            return e ? {
              state: "failed",
              code: e
            } : null
          }
          default:
            return null
        }
      }(t.separation_state);
    if (!i || "original_mix" !== n && "separated_background" !== n && "separated_vocals" !== n || !["keep_low", "keep_full", "separate_background", "muted"].includes(String(r)) || "number" != typeof a || !Number.isInteger(a) || a < 0 || a > 100 || "number" != typeof o || !Number.isSafeInteger(o) || o <= 0 || !s) return null;
    let u = m(t.background_summary),
      d = u ? {
        schemaVersion: g(u.schema_version) ?? "",
        engineId: g(u.engine_id) ?? "",
        runtimeVersion: g(u.runtime_version) ?? "",
        outputContractVersion: g(u.output_contract_version) ?? ""
      } : null;
    return d && Object.values(d).some(e => !e) || ("separated_background" === n || "separated_vocals" === n) && !d ? null : {
      schemaVersion: "project-audio-track-v1",
      audioGenerationId: i,
      sourceSelection: n,
      gainPercent: a,
      dashboardSnapshotMode: r,
      separationState: s,
      backgroundArtifactReceipt: d,
      updatedAtMs: o
    }
  }

  function l(e) {
    return _(e).code
  }

  function _(e) {
    let t = m(e),
      i = t ? g(t.message) || g(t.error) || g(t.detail) : "string" == typeof e ? g(e) : null,
      n = function(e) {
        if (!e || "{" !== e[0] && "[" !== e[0]) return null;
        try {
          return m(JSON.parse(e))
        } catch {
          return null
        }
      }(i),
      r = p(t, "code", "error_code") || p(n, "code", "error_code") || (i && /^(?:project_audio|nle_background|nle_document|native_source_separation|native_vnext)_[a-z0-9_]+$/.test(i) ? i : null);
    return {
      code: "native_vnext_canceled" === r ? "project_audio_separation_canceled" : r,
      customerMessage: p(t, "customerMessage", "customer_message") || p(n, "customerMessage", "customer_message"),
      developerMessage: p(t, "developerMessage", "developer_message") || p(n, "developerMessage", "developer_message"),
      message: p(n, "message", "error", "detail") || (n ? null : i)
    }
  }

  function p(e, ...t) {
    if (!e) return null;
    for (let i of t) {
      let t = g(e[i]);
      if (t) return t
    }
    return null
  }

  function h(e) {
    return Object.assign(Error(e), {
      code: e
    })
  }

  function m(e) {
    return e && "object" == typeof e && !Array.isArray(e) ? e : null
  }

  function g(e) {
    return "string" == typeof e && e.trim().length > 0 ? e.trim() : null
  }
  e.s(["createProjectAudioTrackController", 0, function(e) {
    let t = new Map,
      i = new Map,
      n = new Map,
      r = new Map,
      s = 0,
      d = t => {
        let i = e.getVideo(t),
          n = i?.nativeProjectReadiness,
          r = i?.projectAudioTrack,
          a = i?.processingSession?.job_id?.trim() || i?.cuePreviewJobId?.trim(),
          o = i?.terminalAdmission,
          s = o?.generationId,
          u = o?.snapshotHash;
        if (!i || !n?.readyForEdit || !r || !a || o?.state !== "ready" || o.projectId !== i.id || o.jobId !== a || !s || !u || s !== i.activeTerminalGeneration || !o.playbackGenerationId || o.playbackGenerationId !== n.timelineGeneration || o.timelineStateHash !== n.timelineStateHash || !o.graphHash || !o.transportProjectionHash || !o.audioScheduleHash || !o.visualSnapshotHash || !o.captionSetHash || !o.artifactMembershipHash || !o.timingAuthority || o.audioGenerationId !== r.audioGenerationId) throw h("project_audio_not_ready");
        return {
          video: i,
          readiness: n,
          audio: r,
          jobId: a,
          terminal: o,
          terminalGenerationId: s,
          terminalSnapshotHash: u
        }
      },
      c = async (t, i, n) => {
        var o;
        let s = d(t),
          u = !i.operationId || r.get(t) === i.operationId,
          c = s.audio.audioGenerationId === i.audioGenerationId && s.readiness.timelineGeneration === i.timelineGeneration && s.terminalGenerationId === i.terminalGenerationId && s.terminalSnapshotHash === i.terminalSnapshotHash;
        if (!u || !c || (o = () => {
            p.inspect(t)
          }, (n.projectId !== i.projectId || n.jobId !== i.jobId || n.timelineGeneration !== n.playbackGenerationId || n.transportProjectionHash !== i.expectedAuthority.transportProjectionHash || n.visualSnapshotHash !== i.expectedAuthority.visualSnapshotHash || n.timingAuthority.generationId !== i.timingAuthority.generationId || n.timingAuthority.planHash !== i.timingAuthority.planHash || n.timingAuthority.timelineStateHash !== i.timingAuthority.timelineStateHash || !i.audioGenerationId || !n.state.audioGenerationId || !n.terminalGenerationId || !n.terminalSnapshotHash) && (o(), 1))) return u && c && p.inspect(t), !1;
        if (e.updateVideo(t, {
            projectAudioTrack: n.state,
            projectAudioPreviewCarrierPath: n.previewCarrierPath,
            nativeProjectReadiness: {
              ...s.readiness,
              timelineGeneration: n.playbackGenerationId,
              timelineStateHash: n.transportProjectionHash,
              audioGenerationId: n.state.audioGenerationId,
              timingAuthority: n.timingAuthority,
              exportState: n.exportState
            },
            terminalAdmission: (0, a.readyTerminalAdmissionFromMutation)(n),
            activeTerminalGeneration: n.terminalGenerationId
          }), e.activateTerminal && i.operationId) try {
          if (!await e.activateTerminal(t, n.terminalGenerationId)) throw h("project_audio_terminal_activation_failed")
        } catch (i) {
          throw e.updateVideo(t, {
            terminalAdmission: void 0,
            activeTerminalGeneration: void 0
          }), i
        }
        return await e.persistVideo?.(t).catch(i => {
          e.onPersistenceError?.(t, i)
        }), !0
      }, _ = (t, i, n) => {
        let a = d(t),
          o = (s += 1, `project-audio-${i}-${t}-${Date.now().toString(36)}-${s}`),
          u = e.nextAuthorityRevision?.(t) ?? String(s);
        return r.set(t, o), {
          expected: {
            projectId: a.video.id,
            jobId: a.jobId,
            audioGenerationId: a.audio.audioGenerationId,
            timelineGeneration: a.readiness.timelineGeneration,
            terminalGenerationId: a.terminalGenerationId,
            terminalSnapshotHash: a.terminalSnapshotHash,
            expectedAuthority: {
              generationId: a.terminal.playbackGenerationId,
              graphHash: a.terminal.graphHash,
              transportProjectionHash: a.terminal.transportProjectionHash,
              audioScheduleHash: a.terminal.audioScheduleHash,
              visualSnapshotHash: a.terminal.visualSnapshotHash
            },
            captionSetHash: a.terminal.captionSetHash,
            timingAuthority: a.terminal.timingAuthority,
            operationId: o
          },
          request: {
            projectId: a.video.id,
            jobId: a.jobId,
            operationId: o,
            expectedAudioGenerationId: a.audio.audioGenerationId,
            expectedTimelineGeneration: a.terminal.playbackGenerationId,
            expectedTerminalGenerationId: a.terminalGenerationId,
            expectedTerminalSnapshotHash: a.terminalSnapshotHash,
            expectedAuthority: {
              generationId: a.terminal.playbackGenerationId,
              graphHash: a.terminal.graphHash,
              transportProjectionHash: a.terminal.transportProjectionHash,
              audioScheduleHash: a.terminal.audioScheduleHash,
              visualSnapshotHash: a.terminal.visualSnapshotHash
            },
            customerMutationRevision: u,
            ...void 0 === n ? {} : {
              gainPercent: n
            }
          }
        }
      }, p = {
        inspect: async t => {
          let i = d(t);
          if (!e.inspect) throw h("project_audio_command_unavailable");
          let n = await e.inspect({
            projectId: i.video.id,
            jobId: i.jobId,
            expectedTimelineGeneration: i.terminal.playbackGenerationId
          });
          await c(t, {
            projectId: i.video.id,
            jobId: i.jobId,
            audioGenerationId: i.audio.audioGenerationId,
            timelineGeneration: i.readiness.timelineGeneration,
            terminalGenerationId: i.terminalGenerationId,
            terminalSnapshotHash: i.terminalSnapshotHash,
            expectedAuthority: {
              generationId: i.terminal.playbackGenerationId,
              graphHash: i.terminal.graphHash,
              transportProjectionHash: i.terminal.transportProjectionHash,
              audioScheduleHash: i.terminal.audioScheduleHash,
              visualSnapshotHash: i.terminal.visualSnapshotHash
            },
            captionSetHash: i.terminal.captionSetHash,
            timingAuthority: i.terminal.timingAuthority
          }, n) && "running" !== n.state.separationState.state && e.onOperation?.(t, {
            state: "idle"
          })
        },
        queueGain: (n, r) => {
          if (!Number.isInteger(r) || r < 0 || r > 100) throw h("project_audio_gain_invalid");
          let a = d(n);
          e.updateVideo(n, {
            projectAudioTrack: {
              ...a.audio,
              gainPercent: r
            }
          }), i.set(n, r);
          let o = t.get(n);
          o && clearTimeout(o), t.set(n, setTimeout(() => {
            t.delete(n), p.flushGain(n)
          }, 250))
        },
        flushGain: async r => {
          let a = t.get(r);
          a && clearTimeout(a), t.delete(r);
          let o = i.get(r);
          if (void 0 === o) return void await n.get(r);
          i.delete(r);
          let s = (n.get(r) ?? Promise.resolve()).catch(() => {}).then(async () => {
            if (!e.setGain) throw h("project_audio_command_unavailable");
            let {
              request: t,
              expected: i
            } = _(r, "gain", o), n = await e.setGain(t);
            await c(r, i, n)
          });
          n.set(r, s);
          try {
            await s
          } finally {
            n.get(r) === s && n.delete(r)
          }
        },
        separate: async t => {
          if (await p.flushGain(t), !e.separate) throw h("project_audio_command_unavailable");
          let {
            request: i,
            expected: n
          } = _(t, "separate");
          e.onOperation?.(t, {
            state: "separating",
            operationId: i.operationId,
            progressBasisPoints: 0
          });
          try {
            let a = await e.separate(i, {
              onProgress: n => {
                r.get(t) === i.operationId && e.onOperation?.(t, {
                  state: "separating",
                  operationId: i.operationId,
                  progressBasisPoints: n.overallBasisPoints
                })
              }
            });
            await c(t, n, a), e.onOperation?.(t, {
              state: "idle"
            })
          } catch (r) {
            let i = l(r) ?? "project_audio_separation_failed",
              n = function(e) {
                if (!e || "object" != typeof e) return;
                let t = "diagnosticCode" in e && "string" == typeof e.diagnosticCode ? e.diagnosticCode : "diagnostic_code" in e && "string" == typeof e.diagnostic_code ? e.diagnostic_code : null;
                return t && o.has(t) ? t : void 0
              }(r);
            throw e.onOperation?.(t, {
              state: "error",
              code: i,
              ...n ? {
                diagnosticCode: n
              } : {},
              message: u(r)
            }), "project_audio_generation_stale" === i && p.inspect(t), r
          }
        },
        restore: async t => {
          if (await p.flushGain(t), !e.restore) throw h("project_audio_command_unavailable");
          let {
            request: i,
            expected: n
          } = _(t, "restore"), r = await e.restore(i);
          await c(t, n, r), e.onOperation?.(t, {
            state: "idle"
          })
        },
        cancel: async t => {
          let i = r.get(t);
          i && e.cancel && await e.cancel(i)
        }
      };
    return p
  }, "projectAudioErrorCode", 0, l, "projectAudioErrorLogMessage", 0, function(e) {
    let t = _(e);
    return ([t.code ? `code=${t.code}` : "", t.developerMessage ? `developer=${t.developerMessage}` : "", t.message && t.message !== t.code ? `message=${t.message}` : ""].filter(Boolean).join(" | ") || "unknown_error").replace(/Bearer\s+\S+/gi, "Bearer <redacted>").replace(/\b(auth_token|job_token|api_key|apikey|password|secret)\s*[:=]\s*[^,\s|;]+/gi, (e, t) => `${t}=<redacted>`).replace(/[A-Za-z]:[\\/][^\s\"'|]+/g, "<path>").replace(/\s+/g, " ").trim().slice(0, 1200)
  }, "projectAudioOperationFailureMessage", 0, function(e, t, i) {
    return t || ("error" === e.state ? e.message : i ? u({
      code: i
    }) : null)
  }, "projectAudioTrackCustomerMessage", 0, u, "projectAudioTrackFromManifestSnapshot", 0, c, "projectAudioTrackManifestSnapshot", 0, d], 5750);
  var f = e.i(30148);
  let v = "tts_segment_",
    b = "billing",
    y = "subtitle_exclusions",
    I = "export_watermark_policy",
    S = "dubbing_timeline",
    j = "dubbing_timeline_result",
    P = "native-dubbing-timeline-v3",
    A = "original_audio_policy",
    H = "cue_preview",
    w = "native-cue-preview-plan-v2",
    T = "project_tempo",
    k = "native-project-tempo-v1",
    M = "native-project-tempo-v2",
    x = "project_audio_track",
    C = "edited_subtitle_tts",
    G = "edited-subtitle-tts-v1",
    V = "processing_recovery_binding",
    N = "last_error_detail",
    E = "dichvideo_vi_normalizer_v1",
    O = /(^|_)(?:job_token|auth_token|account_token|api_key|apikey|password|secret|token|bearer|authorization)(?:_|$)/i,
    R = new Set(["schema_version", "source_language", "target_language", "translation_style", "glossary", "processing_mode", "include_tts", "tts_provider", "tts_voice", "piper_execution_identity", "effective_local_engine_settings", "dubbing_timeline", "dubbing_timeline_intent", "subtitle_mode", "resource_policy", "runtime_package_hash", "runtime_trust_set_id", "engine_policy_version", "processing_policy_hash"]);

  function D(e, t) {
    if (!e) return t.toISOString();
    let i = e instanceof Date ? e : new Date(e);
    return Number.isNaN(i.getTime()) ? t.toISOString() : i.toISOString()
  }

  function z(e) {
    if (!e) return null;
    let t = e instanceof Date ? e : new Date(e);
    return Number.isNaN(t.getTime()) ? null : t.toISOString()
  }

  function $(e) {
    if (!e) return;
    let t = new Date(e);
    return Number.isNaN(t.getTime()) ? void 0 : t
  }

  function F(e) {
    return "number" == typeof e && Number.isFinite(e) ? Math.max(0, Math.round(e)) : null
  }

  function L(e) {
    if ("string" != typeof e) return;
    let t = e.trim();
    return t.length > 0 ? t : void 0
  }

  function B(e) {
    let t = L(e)?.toLowerCase();
    return t && /^[a-z][a-z0-9_]{0,127}$/.test(t) ? t : void 0
  }

  function U(e) {
    if ("number" == typeof e && Number.isFinite(e)) return Math.max(0, Math.round(e))
  }

  function q(e) {
    if (Number.isSafeInteger(e) && "number" == typeof e && !(e < 0)) return e
  }

  function W(e) {
    if ("number" == typeof e && Number.isFinite(e)) return Math.max(0, e)
  }

  function J(e, t, i) {
    return "number" == typeof e && Number.isFinite(e) && e >= t && e <= i ? e : void 0
  }

  function K(e) {
    return !e || "object" != typeof e || Array.isArray(e) ? null : e
  }

  function Z(e) {
    return e.replace(/\\/g, "/").replace(/^\/\/\?\/UNC\//i, "//").replace(/^\/\/\?\//, "").replace(/\/+$/, "")
  }

  function X(e, t) {
    let i = e?.trim();
    if (!i) return;
    let n = Z(i),
      r = Z(t),
      a = `${r}/`;
    return n.startsWith(a) ? n.slice(a.length) : /^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(i) ? n : void 0
  }

  function Y(e, t) {
    if (!t) return;
    if (/^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(t)) return t;
    let i = e.includes("\\") ? "\\" : "/",
      n = e.replace(/[\\/]+$/, "");
    return `${n}${i}${t.replace(/[\\/]/g,i)}`
  }

  function Q(e) {
    if ("number" == typeof e && Number.isFinite(e) && !(e < 0) && !(e > 5)) return e
  }

  function ee(e, t) {
    let i = X(e, t);
    if (!(!i || /^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(i))) return i.replace(/\\/g, "/").split("/").some(e => ".." === e) ? void 0 : i
  }

  function et(e, t) {
    if ("string" != typeof t || !t.trim()) return;
    let i = t.trim();
    if (!/^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(i) && !i.replace(/\\/g, "/").split("/").some(e => ".." === e)) return Y(e, i)
  }

  function ei(e) {
    return "string" == typeof e && e.trim() === e && e.length > 0
  }

  function en(e) {
    let t = K(e);
    if (!t || function e(t) {
        return !!t && "object" == typeof t && (Array.isArray(t) ? t.some(e) : Object.entries(t).some(([t, i]) => O.test(t) || e(i)))
      }(t) || Object.keys(t).some(e => !R.has(e)) || "desktop-processing-recovery-binding-v1" !== t.schema_version || !ei(t.source_language) || !ei(t.target_language) || !K(t.translation_style) || !Array.isArray(t.glossary) || "balanced" !== t.processing_mode && "accurate" !== t.processing_mode && "ocr_only" !== t.processing_mode || "boolean" != typeof t.include_tts || !(null === t.tts_provider || ei(t.tts_provider)) || !(null === t.tts_voice || ei(t.tts_voice)) || !K(t.effective_local_engine_settings) || !K(t.dubbing_timeline) || !K(t.subtitle_mode) || !(null === t.resource_policy || K(t.resource_policy)) || !ei(t.runtime_package_hash) || !ei(t.runtime_trust_set_id) || !ei(t.engine_policy_version) || !ei(t.processing_policy_hash)) return null;
    let i = void 0 === t.piper_execution_identity ? void 0 : (0, r.normalizePiperComponentExecutionIdentity)(t.piper_execution_identity),
      n = t.include_tts && "piper_native" === t.tts_provider;
    return (void 0 === t.piper_execution_identity || i) && (!n || t.tts_voice && i) && (n || !i) ? JSON.parse(JSON.stringify(t)) : null
  }

  function er(e, t) {
    let i = ee(e.cuePreviewPlanPath, t),
      n = ee(e.cuePreviewTimelineVideoPath, t),
      r = L(e.cuePreviewPlanHash),
      a = L(e.cuePreviewJobId),
      o = e.cuePreviewCueCount,
      s = e.cuePreviewGeneration,
      u = e.cuePreviewArchitecture,
      d = Q(e.cuePreviewOriginalVolume),
      c = Q(e.cuePreviewTranslatedVolume);
    return !i || !n || !r || !/^sha256:[0-9a-f]{64}$/.test(r) || e.cuePreviewSchemaVersion !== w || !Number.isSafeInteger(o) || (o ?? 0) <= 0 || !Number.isSafeInteger(s) || (s ?? 0) <= 0 || "cue_window_v1" !== u && "chunk_cache_v1" !== u || !a || a.length > 256 || /[\\/]/.test(a) || void 0 === d || d > 1 || void 0 === c ? null : {
      planArtifact: i,
      timelineArtifact: n,
      snapshot: {
        schema_version: w,
        plan_hash: r,
        cue_count: o,
        generation: s,
        architecture: u,
        job_id: a,
        original_volume: d,
        translated_volume: c
      }
    }
  }

  function ea(e) {
    return /^generation:[0-9a-f]{64}$/.test(e.generationId) && /^sha256:[0-9a-f]{64}$/.test(e.planHash) && /^sha256:[0-9a-f]{64}$/.test(e.timelineStateHash)
  }

  function eo(e) {
    return "string" == typeof e && e.length > 0 && e.length <= 160 && "." !== e && ".." !== e && /^[A-Za-z0-9._-]+$/.test(e)
  }

  function es(e) {
    if (!Array.isArray(e)) return null;
    let t = [];
    for (let i of e) {
      if ("string" != typeof i) return null;
      let e = i.trim();
      e && !t.includes(e) && t.push(e)
    }
    return t
  }

  function eu(e, t) {
    let i = K(e);
    if (i?.state === "unapplied") return {
      state: "unapplied"
    };
    if (i?.state !== "applied" || !Number.isInteger(i.targetTempoTenths) || "number" != typeof i.targetTempoTenths) return null;
    let n = i.targetTempoTenths,
      r = t === M ? n >= 10 && n <= 20 ? n : null : t === k ? n >= 10 && n <= 15 ? n : n >= 16 && n <= 18 ? 15 : null : null;
    if (null === r) return null;
    let a = L(i.generationId),
      o = L(i.logicalPlanHash);
    return a && /^(?:generation|playback):[0-9a-f]{64}$/.test(a) && o && /^sha256:[0-9a-f]{64}$/.test(o) ? {
      state: "applied",
      targetTempoTenths: r,
      generationId: a,
      logicalPlanHash: o
    } : null
  }

  function ed(e) {
    let t = K(e);
    if (t?.state === "needs_export") return {
      state: "needs_export"
    };
    if (t?.state === "exporting") {
      let e = L(t.snapshotId),
        i = L(t.partialRelPath),
        n = L(t.requestedFinalPath);
      return e && i ? {
        state: "exporting",
        snapshotId: e,
        partialRelPath: i,
        ...n ? {
          requestedFinalPath: n
        } : {}
      } : null
    }
    if (t?.state === "delivered") {
      let e = K(t.result);
      return e ? L(e.audioGenerationId) ? {
        state: "delivered",
        result: {
          ...e
        }
      } : {
        state: "needs_export"
      } : null
    }
    return null
  }

  function ec(e, r, a = {}, o = {}) {
    var s, u, c, l, _, p, h, m, g, w, k;
    let O, R, $, U, K, Z, Y, Q, ee, et, ei, el, e_, ep, eh, em, eg, ef, ev, eb, ey = new Date,
      eI = o.preserveUpdatedAt ? D(e.projectManifestUpdatedAt, ey) : ey.toISOString(),
      eS = {},
      ej = er(e, r),
      eP = e.voiceSubtitlePath ?? e.translatedSubtitlePath;
    for (let [t, i] of [
        ["thumbnail", X(e.thumbnail, r)],
        ["preview_video", X(e.previewVideoPath, r)],
        ["preview_source", X(e.previewSourcePath, r)],
        ["draft_video", X(e.draftVideoPath, r)],
        ["translated_video", X(e.translatedVideoPath, r)],
        ["final_export", X(e.finalExportPath, r)],
        ["translated_subtitle", X(eP, r)],
        ["source_subtitle", X(e.sourceSubtitlePath, r)],
        ["aligned_source_subtitle", X(e.alignedSourceSubtitlePath, r)],
        ["subtitle_alignment", X(e.subtitleAlignmentPath, r)],
        ["display_subtitle", X(e.displaySubtitlePath, r)],
        ["voice_subtitle", X(e.voiceSubtitlePath, r)],
        ["translation_debug", X(e.translationDebugPath, r)],
        ["performance_trace", X(e.performanceTracePath, r)],
        ["support_bundle", X(e.supportBundlePath, r)],
        ["tts_timeline", X(e.ttsTimelineAudioPath, r)],
        ["tts_manifest", X(e.ttsManifestPath, r)],
        ["dubbing_timeline_video", X(e.dubbingTimelineVideoPath, r)],
        ["cue_preview_plan", ej?.planArtifact],
        ["cue_preview_timeline_video", ej?.timelineArtifact],
        ["project_audio_preview_carrier", X(e.projectAudioPreviewCarrierPath, r)],
        ["srt_audio_output", X(e.srtAudioOutputPath, r)],
        ["srt_audio_work_dir", X(e.srtAudioWorkDir, r)],
        ["srt_audio_tts_manifest", X(e.srtAudioTtsManifestPath, r)],
        ["srt_audio_audio_manifest", X(e.srtAudioAudioManifestPath, r)]
      ]) i && (eS[t] = i);
    let eA = (ej ? [] : e.ttsAudioFiles ?? []).map((e, t) => [`${v}${String(t).padStart(4,"0")}`, X(e, r)]).filter(e => !!e[1]);
    for (let [e, t] of eA) eS[e] = t;
    eA.length > 0 && (eS.tts_segments = "tts/segments");
    return {
      schema_version: 1,
      id: e.id,
      project_type: e.projectType ?? "video",
      name: e.name,
      status: "completed" === (s = e.status) || "error" === s || "idle" === s ? s : "processing",
      created_at: D(e.addedAt, ey),
      updated_at: eI,
      source: {
        mode: "srt_audio" === e.projectType ? e.sourceKind ?? "srt_file" : "linked",
        path: e.path,
        size: e.size,
        modified_at: e.sourceModifiedAt ?? null,
        fingerprint: e.sourceFingerprint ?? null
      },
      media: {
        duration: e.duration,
        output_duration: W(e.outputDuration) ?? null,
        width: e.width,
        height: e.height,
        fps: e.fps,
        codec: e.codec,
        audio_codec: e.audioCodec ?? null,
        audio_stream_count: q(e.sourceAudioStreamCount) ?? null
      },
      processing: {
        started_at: z(e.processingStartedAt),
        completed_at: z(e.processingCompletedAt),
        duration_ms: F(e.processingDurationMs)
      },
      processing_session: (0, t.normalizeDesktopProcessingSession)(e.processingSession),
      project_authorization_receipt: e.projectAuthorizationReceipt ?? null,
      artifacts: eS,
      settings_snapshot: (k = (u = function(e, t) {
        let i = t.excludedSubtitleFingerprints?.filter(Boolean) ?? [];
        if (0 === i.length) {
          let t = {
            ...e
          };
          return delete t[y], t
        }
        return {
          ...e,
          [y]: {
            fingerprints: i
          }
        }
      }({
        ...a,
        ...void 0 !== e.seriesBatchParentId ? {
          series_batch_parent_id: e.seriesBatchParentId === e.id ? null : e.seriesBatchParentId
        } : {}
      }, e), U = (0, i.normalizeOriginalAudioPolicy)(e.originalAudioStrategy, e.originalAudioVolume), K = {
        ...u
      }, U ? K[A] = U : delete K[A], c = K, Z = function(e) {
        let t = e.dubbingTimeline;
        if (!t) return null;
        if ("hybrid_stretch" !== t.mode) return {
          mode: "preserve_duration"
        };
        let i = J(t.targetTempo, 1, 1.8),
          n = J(t.maxVideoSlowdown, 1, 3),
          r = J(t.maxTotalStretchRatio, 1, 3);
        if (void 0 === i || void 0 === n || void 0 === r) return {
          mode: "preserve_duration"
        };
        let a = "current_preset" === e.dubbingTimelineIntent && ("hybrid_1_25" === t.presetId || "hybrid_1_4" === t.presetId) && ("hybrid_1_25" === t.presetId && 1.25 === i || "hybrid_1_4" === t.presetId && 1.4 === i) && 3 === n && 3 === r,
          o = "historical_numeric" === e.dubbingTimelineIntent && void 0 === t.presetId;
        return a || o ? {
          schema_version: P,
          timing_intent: e.dubbingTimelineIntent,
          preset_id: a ? t.presetId : null,
          mode: "hybrid_stretch",
          target_tempo: i,
          max_video_slowdown: n,
          max_total_stretch_ratio: r
        } : {
          mode: "preserve_duration"
        }
      }(e), Y = {
        ...c
      }, Z ? Y[S] = Z : delete Y[S], l = Y, Q = (0, n.dubbingTimelineResultToManifestSnapshot)(e.dubbingTimelineResult), ee = {
        ...l
      }, Q ? ee[j] = Q : delete ee[j], ee), R = (O = e.exportWatermarkPolicy) && L(O.authorizationJti) && L(O.jobId) ? {
        watermark_required: !!O.watermarkRequired,
        watermark_text: O.watermarkText ?? null,
        authorization_jti: O.authorizationJti,
        ...L(O.deviceId) ? {
          device_id: L(O.deviceId)
        } : {},
        job_id: O.jobId,
        plan_code: O.planCode,
        token_expires_at: O.tokenExpiresAt,
        charged_seconds: Math.max(0, Math.round(O.chargedSeconds || 0)),
        fair_use_seconds_used: Math.max(0, Math.round(O.fairUseSecondsUsed || 0)),
        payg_overage_charged_seconds: Math.max(0, Math.round(O.paygOverageChargedSeconds || 0)),
        voice_premium_charged_seconds: Math.max(0, Math.round(O.voicePremiumChargedSeconds || 0)),
        ...L(O.authorizationContractVersion) ? {
          authorization_contract_version: L(O.authorizationContractVersion)
        } : {},
        ...L(O.billingSource) ? {
          billing_source: L(O.billingSource)
        } : {},
        ...L(O.sourceContentHash) ? {
          source_content_hash: L(O.sourceContentHash)
        } : {},
        ...Array.isArray(O.grantedFeatures) && O.grantedFeatures.length > 0 && O.grantedFeatures.every(e => L(e)) ? {
          granted_features: [...O.grantedFeatures]
        } : {}
      } : null, $ = {
        ...k
      }, R ? $[I] = R : delete $[I], _ = $, et = er(e, r), ei = {
        ..._
      }, et ? ei[H] = et.snapshot : delete ei[H], p = ei, el = function(e) {
        let t = e.nativeProjectReadiness;
        if (!t?.readyForEdit || !/^(?:generation|playback):[0-9a-f]{64}$/.test(t.timelineGeneration) || !/^sha256:[0-9a-f]{64}$/.test(t.timelineStateHash)) return null;
        let i = eu(t.tempoState, M),
          n = ed(t.exportState);
        if (!i || !n || "applied" === i.state && i.generationId !== t.timelineGeneration) return null;
        let r = e.projectTempoMarkerCueIds?.filter(e => "string" == typeof e && e.trim().length > 0).map(e => e.trim()).filter((e, t, i) => i.indexOf(e) === t),
          a = eo(t.audioGenerationId) ? t.audioGenerationId : void 0,
          o = t.timingAuthority;
        return o && !ea(o) ? null : {
          schema_version: M,
          ready_for_edit: !0,
          timeline_generation: t.timelineGeneration,
          timeline_state_hash: t.timelineStateHash,
          ...a ? {
            audio_generation_id: a
          } : {},
          ...o ? {
            timing_authority: {
              generation_id: o.generationId,
              plan_hash: o.planHash,
              timeline_state_hash: o.timelineStateHash
            }
          } : {},
          tempo_state: i,
          export_state: n,
          ...r ? {
            marker_cue_ids: r
          } : {}
        }
      }(e), e_ = {
        ...p
      }, el ? e_[T] = el : delete e_[T], ep = {
        ...e_
      }, e.projectAudioTrack ? ep[x] = d(e.projectAudioTrack) : delete ep[x], h = ep, m = (eh = function(e) {
        let t = L(e.billingScopeJobId),
          i = L(e.pausedBillingScopeJobId),
          n = L(e.lastAuthorizedJobId);
        if (!t && !i && !n) return null;
        let r = {};
        return t && (r.billing_scope_job_id = t), i && (r.paused_billing_scope_job_id = i), n && (r.last_authorized_job_id = n), "number" == typeof e.billingSourceVideoSeconds && Number.isFinite(e.billingSourceVideoSeconds) && (r.source_video_seconds = Math.max(1, Math.round(e.billingSourceVideoSeconds))), "number" == typeof e.billingChargedSeconds && Number.isFinite(e.billingChargedSeconds) && (r.charged_seconds = Math.max(0, Math.round(e.billingChargedSeconds || 0))), "number" == typeof e.billingNonRefundableSeconds && Number.isFinite(e.billingNonRefundableSeconds) && (r.non_refundable_seconds = Math.max(0, Math.round(e.billingNonRefundableSeconds || 0))), L(e.billingTargetLanguage) && (r.target_language = L(e.billingTargetLanguage)), L(e.billingTtsProvider) && (r.tts_provider = L(e.billingTtsProvider)), !0 === e.billingAuthorizationPending && "string" == typeof e.billingAuthorizationRequestKeyHash && /^[a-f0-9]{64}$/.test(e.billingAuthorizationRequestKeyHash) && (r.authorization_pending = !0, r.authorization_request_key_hash = e.billingAuthorizationRequestKeyHash), L(e.nativeTtsProvider) && (r.native_tts_provider = L(e.nativeTtsProvider)), L(e.nativeTtsVoice) && (r.native_tts_voice = L(e.nativeTtsVoice)), "piper_native" === L(e.nativeTtsProvider) && L(e.nativeTtsVoice) && (r.native_tts_normalizer = E), r
      }(e)) ? {
        ...h,
        [b]: eh
      } : h, g = (em = en(e.processingRecoveryBinding)) ? {
        ...m,
        [V]: em
      } : m, ef = (eg = !0 === e.editedSubtitleTtsDirty) ? es(e.editedSubtitleTtsDirtyCaptionIds) ?? [] : [], w = {
        ...g,
        [C]: {
          schema_version: G,
          dirty: eg,
          caption_ids: ef
        }
      }, ev = "error" === e.status ? L(e.processingErrorDetail) : void 0, eb = {
        ...w
      }, ev ? eb[N] = ev : delete eb[N], eb),
      nle_document: e.nleDocument ? (0, f.encodeNleDocument)(e.nleDocument) : void 0,
      last_error_code: "error" === e.status ? B(e.processingErrorCode) ?? "processing_error" : null,
      last_error_message: e.processingError ?? null
    }
  }
  e.s(["buildProjectManifestFromVideo", 0, ec, "buildSrtAudioProjectManifest", 0, function(e) {
    let t = new Date,
      i = e.completedAt ?? t,
      n = e.sourcePath?.trim() || `paste://srt/${e.id}`,
      a = e.sourceContent?.length ?? 0,
      o = Math.max(e.analysis.lastEndMs, e.analysis.durationMs, 1) / 1e3,
      s = {};
    e.outputPath?.trim() && (s.srt_audio_output = e.outputPath.trim()), e.workDir?.trim() && (s.srt_audio_work_dir = e.workDir.trim()), e.ttsManifestPath?.trim() && (s.srt_audio_tts_manifest = e.ttsManifestPath.trim()), e.audioManifestPath?.trim() && (s.srt_audio_audio_manifest = e.audioManifestPath.trim());
    let u = L(e.provider) ?? "edge_tts",
      d = e.piperExecutionIdentity ? (0, r.normalizePiperComponentExecutionIdentity)(e.piperExecutionIdentity) : null;
    if ("completed" === e.status && "piper_native" === u && !d) throw Error("srt_audio_piper_execution_identity_required");
    return {
      schema_version: 1,
      id: e.id,
      project_type: "srt_audio",
      name: e.name,
      status: e.status,
      created_at: D(e.startedAt, t),
      updated_at: i.toISOString(),
      source: {
        mode: e.sourceKind,
        path: n,
        size: a,
        modified_at: null,
        fingerprint: null
      },
      media: {
        duration: o,
        output_duration: W(e.outputPath ? null != e.outputDurationMs ? e.outputDurationMs / 1e3 : o : void 0) ?? null,
        width: 0,
        height: 0,
        fps: 0,
        codec: "srt_audio",
        audio_codec: "aac"
      },
      processing: {
        started_at: z(e.startedAt),
        completed_at: z(i),
        duration_ms: F(e.processingDurationMs)
      },
      processing_session: null,
      artifacts: s,
      settings_snapshot: {
        projectType: "srt_audio",
        sourceKind: e.sourceKind,
        ttsProvider: u,
        voice: e.voice,
        ..."piper_native" === u ? {
          ttsNormalizer: E
        } : {},
        ...d ? {
          piperExecutionIdentity: d
        } : {},
        cueCount: e.analysis.cueCount,
        speakableCueCount: e.analysis.speakableCueCount,
        voicePhraseCount: e.analysis.voicePhraseCount,
        totalTextChars: e.analysis.totalTextChars,
        overlapCount: e.analysis.overlapCount
      },
      last_error_code: "error" === e.status ? "srt_audio_failed" : null,
      last_error_message: e.errorMessage ?? null
    }
  }, "manifestRecordToVideoFile", 0, function(e, a = {}) {
    let o, s, u, d, l, _, p, h, m, g, O, R, D, z, Z, X, ee, {
        manifest: ei,
        project_root: er
      } = e,
      ec = ei.artifacts,
      el = "srt_audio" === ei.project_type ? "srt_audio" : "video",
      e_ = K(ei.settings_snapshot?.[b]),
      ep = L(e_?.authorization_request_key_hash),
      eh = e_?.authorization_pending === !0 && !!ep && /^[a-f0-9]{64}$/.test(ep ?? ""),
      em = (o = L(e_?.native_tts_provider), s = L(e_?.native_tts_voice), "piper_native" !== o || s && L(e_?.native_tts_normalizer) === E ? {
        provider: o,
        voice: s
      } : {}),
      eg = em.provider ? em : function(e) {
        if ("srt_audio" !== e.project_type) return {};
        let t = L(e.settings_snapshot?.ttsProvider),
          i = L(e.settings_snapshot?.voice);
        return t && i && ("piper_native" !== t || L(e.settings_snapshot?.ttsNormalizer) === E && (0, r.normalizePiperComponentExecutionIdentity)(e.settings_snapshot?.piperExecutionIdentity)) ? {
          provider: t,
          voice: i
        } : {}
      }(ei),
      ef = (u = K(ei.settings_snapshot?.[A]), (0, i.normalizeOriginalAudioPolicy)(u?.strategy, u?.volume)),
      ev = function(e) {
        let t = K(e.settings_snapshot?.[y]);
        var i = t?.fingerprints;
        if (!Array.isArray(i)) return;
        let n = i.filter(e => "string" == typeof e).map(e => e.trim()).filter(Boolean);
        return n.length > 0 ? n : void 0
      }(ei),
      eb = (d = K(ei.settings_snapshot?.[H]), l = et(er, ei.artifacts.cue_preview_plan), _ = et(er, ei.artifacts.cue_preview_timeline_video), p = L(d?.plan_hash), h = L(d?.job_id), m = d?.cue_count, g = d?.generation, O = d?.architecture, R = Q(d?.original_volume), D = Q(d?.translated_volume), !d || !l || !_ || d.schema_version !== w || !p || !/^sha256:[0-9a-f]{64}$/.test(p) || !Number.isSafeInteger(m) || m <= 0 || !Number.isSafeInteger(g) || g <= 0 || "cue_window_v1" !== O && "chunk_cache_v1" !== O || !h || h.length > 256 || /[\\/]/.test(h) || void 0 === R || R > 1 || void 0 === D ? {} : {
        cuePreviewPlanPath: l,
        cuePreviewPlanHash: p,
        cuePreviewSchemaVersion: w,
        cuePreviewCueCount: m,
        cuePreviewGeneration: g,
        cuePreviewArchitecture: O,
        cuePreviewTimelineVideoPath: _,
        cuePreviewJobId: h,
        cuePreviewOriginalVolume: R,
        cuePreviewTranslatedVolume: D
      }),
      ey = (z = c(ei.settings_snapshot?.[x]), Z = z?.separationState.state === "running" ? {
        ...z,
        sourceSelection: "original_mix",
        separationState: {
          state: "canceled"
        }
      } : z, X = et(er, ei.artifacts.project_audio_preview_carrier), Z && X ? {
        projectAudioTrack: Z,
        projectAudioPreviewCarrierPath: X
      } : {}),
      eI = Y(er, ec.voice_subtitle),
      eS = Y(er, ec.display_subtitle),
      ej = eI ?? Y(er, ec.translated_subtitle),
      eP = ei.nle_document ? (0, f.decodeNleDocument)(ei.nle_document) : void 0,
      eA = (0, t.normalizeDesktopProcessingSession)(ei.processing_session);
    return {
      id: ei.id,
      name: ei.name,
      path: ei.source.path,
      projectType: el,
      sourceKind: "srt_file" === ei.source.mode || "srt_paste" === ei.source.mode || "text_file" === ei.source.mode || "text_paste" === ei.source.mode ? ei.source.mode : "video",
      sourceMode: "linked",
      sourceMissing: ("srt_audio" !== el || "srt_paste" !== ei.source.mode && "text_paste" !== ei.source.mode) && (a.sourceMissing ?? !1),
      sourceModifiedAt: ei.source.modified_at,
      sourceFingerprint: ei.source.fingerprint,
      projectRoot: er,
      projectManifestUpdatedAt: ei.updated_at,
      nleDocumentAvailable: !0 === e.nle_document_available || !!eP,
      nleDocument: eP,
      size: ei.source.size,
      duration: ei.media.duration,
      outputDuration: W(ei.media.output_duration),
      dubbingTimelineResult: (0, n.dubbingTimelineResultFromManifestSnapshot)(ei.settings_snapshot?.[j]),
      width: ei.media.width,
      height: ei.media.height,
      fps: ei.media.fps,
      codec: ei.media.codec,
      audioCodec: ei.media.audio_codec ?? void 0,
      sourceAudioStreamCount: q(ei.media.audio_stream_count),
      originalAudioStrategy: ef?.strategy,
      originalAudioVolume: ef?.volume,
      thumbnail: Y(er, ec.thumbnail),
      previewVideoPath: Y(er, ec.preview_video),
      previewSourcePath: Y(er, ec.preview_source),
      draftVideoPath: Y(er, ec.draft_video),
      translatedVideoPath: Y(er, ec.translated_video),
      ...eb,
      ... function(e, t) {
        let i = K(e.settings_snapshot?.[T]),
          n = L(i?.schema_version);
        if (!i || n !== k && n !== M || !0 !== i.ready_for_edit) return {};
        let r = L(i.timeline_generation),
          a = L(i.timeline_state_hash),
          o = L(i.audio_generation_id),
          s = null == i.timing_authority ? void 0 : function(e) {
            let t = K(e);
            if (!t) return null;
            let i = {
              generationId: L(t.generation_id) ?? "",
              planHash: L(t.plan_hash) ?? "",
              timelineStateHash: L(t.timeline_state_hash) ?? ""
            };
            return ea(i) ? i : null
          }(i.timing_authority),
          u = o ?? (eo(t) ? t : void 0),
          d = eu(i.tempo_state, n),
          c = ed(i.export_state);
        if (!r || !/^(?:generation|playback):[0-9a-f]{64}$/.test(r) || !a || !/^sha256:[0-9a-f]{64}$/.test(a) || !d || !c || null != i.timing_authority && !s || void 0 !== o && !eo(o) || "applied" === d.state && d.generationId !== r) return {};
        let l = Array.isArray(i.marker_cue_ids) && i.marker_cue_ids.every(e => "string" == typeof e && e.trim().length > 0) ? [...new Set(i.marker_cue_ids.map(e => e.trim()))] : void 0;
        return {
          nativeProjectReadiness: {
            readyForEdit: !0,
            timelineGeneration: r,
            timelineStateHash: a,
            ...u ? {
              audioGenerationId: u
            } : {},
            ...s ? {
              timingAuthority: s
            } : {},
            tempoState: d,
            exportState: c
          },
          ...l ? {
            projectTempoMarkerCueIds: l
          } : {}
        }
      }(ei, ey.projectAudioTrack?.audioGenerationId),
      ...ey,
      finalExportPath: Y(er, ec.final_export),
      translatedSubtitlePath: ej,
      sourceSubtitlePath: Y(er, ec.source_subtitle),
      alignedSourceSubtitlePath: Y(er, ec.aligned_source_subtitle),
      subtitleAlignmentPath: Y(er, ec.subtitle_alignment),
      displaySubtitlePath: eS,
      voiceSubtitlePath: eI,
      translationDebugPath: Y(er, ec.translation_debug),
      performanceTracePath: Y(er, ec.performance_trace),
      supportBundlePath: Y(er, ec.support_bundle),
      ttsTimelineAudioPath: Y(er, ec.tts_timeline),
      ttsManifestPath: Y(er, ec.tts_manifest),
      dubbingTimelineVideoPath: Y(er, ec.dubbing_timeline_video),
      srtAudioOutputPath: Y(er, ec.srt_audio_output),
      srtAudioWorkDir: Y(er, ec.srt_audio_work_dir),
      srtAudioTtsManifestPath: Y(er, ec.srt_audio_tts_manifest),
      srtAudioAudioManifestPath: Y(er, ec.srt_audio_audio_manifest),
      billingScopeJobId: L(e_?.billing_scope_job_id),
      pausedBillingScopeJobId: L(e_?.paused_billing_scope_job_id),
      lastAuthorizedJobId: L(e_?.last_authorized_job_id),
      billingSourceVideoSeconds: U(e_?.source_video_seconds),
      billingChargedSeconds: U(e_?.charged_seconds),
      billingNonRefundableSeconds: U(e_?.non_refundable_seconds),
      billingTargetLanguage: L(e_?.target_language),
      billingTtsProvider: L(e_?.tts_provider),
      billingAuthorizationPending: !!eh || void 0,
      billingAuthorizationRequestKeyHash: eh ? ep : void 0,
      seriesBatchParentId: ei.settings_snapshot?.series_batch_parent_id === null ? null : L(ei.settings_snapshot?.series_batch_parent_id) !== ei.id ? L(ei.settings_snapshot?.series_batch_parent_id) : void 0,
      nativeTtsProvider: eg.provider,
      nativeTtsVoice: eg.voice,
      exportWatermarkPolicy: function(e) {
        let t = K(e.settings_snapshot?.[I]);
        if (!t) return;
        let i = L(t.authorization_jti),
          n = L(t.job_id),
          r = L(t.plan_code),
          a = L(t.token_expires_at);
        if (i && n && r && a) return {
          watermarkRequired: !0 === t.watermark_required,
          watermarkText: "string" == typeof t.watermark_text ? t.watermark_text : null,
          authorizationJti: i,
          deviceId: L(t.device_id),
          jobId: n,
          planCode: r,
          tokenExpiresAt: a,
          chargedSeconds: U(t.charged_seconds) ?? 0,
          fairUseSecondsUsed: U(t.fair_use_seconds_used) ?? 0,
          paygOverageChargedSeconds: U(t.payg_overage_charged_seconds) ?? 0,
          voicePremiumChargedSeconds: U(t.voice_premium_charged_seconds) ?? 0,
          authorizationContractVersion: L(t.authorization_contract_version),
          billingSource: L(t.billing_source),
          sourceContentHash: L(t.source_content_hash),
          grantedFeatures: Array.isArray(t.granted_features) && t.granted_features.every(e => "string" == typeof e) ? [...t.granted_features] : void 0
        }
      }(ei),
      projectAuthorizationReceipt: ei.project_authorization_receipt ?? void 0,
      ... function(e) {
        let t = K(e.settings_snapshot?.[S]);
        if (!t) return {};
        if ("hybrid_stretch" !== t.mode) return {
          dubbingTimeline: {
            mode: "preserve_duration"
          }
        };
        let i = J(t.target_tempo, 1, 1.8),
          n = J(t.max_video_slowdown, 1, 3),
          r = J(t.max_total_stretch_ratio, 1, 3);
        if (void 0 === i || void 0 === n || void 0 === r) return {
          dubbingTimeline: {
            mode: "preserve_duration"
          }
        };
        if (t.schema_version === P) {
          if ("current_preset" === t.timing_intent && ("hybrid_1_25" === t.preset_id || "hybrid_1_4" === t.preset_id) && ("hybrid_1_25" === t.preset_id && 1.25 === i || "hybrid_1_4" === t.preset_id && 1.4 === i) && 3 === n && 3 === r) return {
            dubbingTimeline: {
              mode: "hybrid_stretch",
              presetId: t.preset_id,
              targetTempo: i,
              maxVideoSlowdown: n,
              maxTotalStretchRatio: r
            },
            dubbingTimelineIntent: "current_preset"
          };
          if ("historical_numeric" !== t.timing_intent || null !== t.preset_id) return {
            dubbingTimeline: {
              mode: "preserve_duration"
            }
          }
        }
        return {
          dubbingTimeline: {
            mode: "hybrid_stretch",
            targetTempo: i,
            maxVideoSlowdown: n,
            maxTotalStretchRatio: r
          },
          dubbingTimelineIntent: "historical_numeric"
        }
      }(ei),
      ... function(e) {
        let t = K(e.settings_snapshot?.[C]);
        if (!t || t.schema_version !== G || "boolean" != typeof t.dirty) return {};
        let i = es(t.caption_ids);
        return i ? {
          editedSubtitleTtsDirty: t.dirty,
          editedSubtitleTtsDirtyCaptionIds: t.dirty ? i : []
        } : {}
      }(ei),
      excludedSubtitleFingerprints: ev,
      ttsAudioFiles: eb.cuePreviewPlanPath ? void 0 : (ee = Object.entries(ec).map(([e, t]) => {
        if (!e.startsWith(v)) return null;
        let i = e.slice(v.length);
        if (!/^\d+$/.test(i)) return null;
        let n = Y(er, t);
        return n ? {
          index: Number(i),
          path: n
        } : null
      }).filter(e => !!e).sort((e, t) => e.index - t.index).map(e => e.path)).length > 0 ? ee : ec.tts_segments ? [] : void 0,
      status: function(e, t) {
        if ("completed" === e || "error" === e || "idle" === e) return e;
        if ("processing" !== e) return "error";
        switch (t?.current_stage) {
          case "stt":
            return "transcribing";
          case "translation":
            return "translating";
          case "tts":
          case "compose_audio":
          case "retime":
          case "finalize":
            return "generating_tts";
          case "export":
            return "exporting";
          default:
            return "importing"
        }
      }(ei.status, eA),
      processingError: ei.last_error_message ?? void 0,
      processingErrorCode: B(ei.last_error_code),
      processingErrorDetail: L(ei.settings_snapshot?.[N]),
      processingStartedAt: $(ei.processing?.started_at),
      processingCompletedAt: $(ei.processing?.completed_at),
      processingDurationMs: F(ei.processing?.duration_ms) ?? void 0,
      processingSession: eA ?? void 0,
      processingRecoveryBinding: en(ei.settings_snapshot?.[V]) ?? void 0,
      addedAt: new Date(ei.created_at)
    }
  }], 63754), e.i(89268);
  var el = e.i(81341),
    e_ = e.i(63126);
  async function ep(e) {
    try {
      return (await (0, e_.readProjectManifest)(e)).manifest.settings_snapshot
    } catch {
      return null
    }
  }
  async function eh(e, t = {}, i = {}) {
    if (!(0, el.isTauri)()) return;
    let n = e.projectRoot ?? await (0, e_.getProjectWorkspaceDir)(e.id),
      r = await ep(e.id),
      a = ec({
        ...e,
        projectRoot: n,
        sourceMode: "linked"
      }, n, {
        ...r ?? {},
        ...t
      }, i);
    await (0, e_.writeProjectManifest)(e.id, a)
  }
  async function em(e, t, i = {}) {
    let n = t().videos.find(t => t.id === e);
    n && await eh(n, i)
  }
  async function eg(e, t) {
    if ("linked" === e.sourceMode && !await (0, el.fileExists)(e.path)) throw t(), Error("Không tìm thấy video gốc. Hãy khôi phục file gốc hoặc import lại video trước khi xử lý.")
  }
  e.s(["ensureLinkedSourceAvailable", 0, eg, "persistLatestProjectManifest", 0, em, "persistProjectManifestForVideo", 0, eh], 58450)
}]);