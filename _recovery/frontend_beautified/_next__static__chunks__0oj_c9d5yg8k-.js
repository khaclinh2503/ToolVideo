(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 62185, e => {
  "use strict";
  var t = e.i(68834);
  e.i(89268);
  var n = e.i(30797);
  let r = null,
    a = 0,
    l = e => {
      let t = e instanceof Error ? e.message : "string" == typeof e ? e : "",
        n = t.toLowerCase();
      return n.includes("desktop") ? "Cập nhật App chỉ dùng được trong bản desktop." : n.includes("not_available") || n.includes("no pending update") ? "Chưa có bản cập nhật App mới." : n.includes("signature") || n.includes("pubkey") ? "Không xác minh được gói cập nhật App. Hãy thử lại sau." : n.includes("network") || n.includes("fetch") || n.includes("endpoint") || n.includes("404") ? "Chưa kiểm tra được cập nhật App. Hãy thử lại sau." : t ? "Không thể kiểm tra/cài cập nhật App. Hãy thử lại sau." : "Không thể kiểm tra/cài cập nhật App."
    },
    i = (0, t.create)((e, t) => ({
      appUpdate: null,
      checkedAt: null,
      progress: null,
      loading: !1,
      installing: !1,
      error: null,
      refreshAppUpdate: async (i = {}) => {
        let s = i.staleMs ?? 0,
          p = t().checkedAt;
        if (!i.force && p && Date.now() - p < s || r && (await r, !i.force)) return;
        let u = ++a;
        r = (async () => {
          i.silent || e({
            loading: !0,
            error: null
          });
          try {
            let t = await (0, n.checkAppUpdate)({
              timeoutMs: i.timeoutMs
            });
            if (u !== a) return;
            e({
              appUpdate: t,
              checkedAt: Date.now(),
              loading: !1,
              error: null
            })
          } catch (t) {
            if (u !== a) return;
            e({
              checkedAt: Date.now(),
              loading: !1,
              error: i.silent ? null : l(t)
            })
          }
        })().finally(() => {
          u === a && (r = null)
        }), await r
      },
      installAppUpdate: async () => {
        let i = t().appUpdate;
        a += 1, r = null, e({
          installing: !0,
          loading: !1,
          progress: null,
          error: null
        });
        try {
          await (0, n.installAppUpdate)(t => {
            e({
              progress: t
            })
          });
          let r = t().appUpdate ?? i,
            a = t().appUpdate?.latestVersion ?? i?.latestVersion ?? null ?? t().appUpdate?.currentVersion ?? i?.currentVersion ?? "0.1.0";
          e({
            appUpdate: {
              available: !1,
              currentVersion: a,
              latestVersion: t().appUpdate?.latestVersion ?? i?.latestVersion ?? a,
              date: r?.date ?? null,
              body: r?.body ?? null,
              appEnv: r?.appEnv ?? "production"
            },
            checkedAt: Date.now(),
            installing: !1,
            progress: null,
            error: null
          })
        } catch (t) {
          e({
            installing: !1,
            progress: null,
            error: l(t)
          })
        }
      },
      clearError: () => e({
        error: null
      })
    }));
  e.s(["APP_UPDATE_CACHE_MS", 0, 3e5, "useAppUpdateStore", 0, i])
}, 54438, e => {
  "use strict";
  var t = e.i(71645),
    n = e.i(35771);
  e.i(89268);
  var r = e.i(81341),
    a = e.i(7787),
    l = e.i(38991),
    i = e.i(57342),
    s = e.i(62185),
    p = e.i(34618);
  let u = "dichvideo.engineSettings.opened.v1";
  e.s(["EngineReadinessGate", 0, function() {
    let e = (0, i.useCloudStore)(e => e.apiUrl),
      o = (0, l.useAppStore)(e => e.openEngineSettings),
      c = (0, p.useEngineVnextInstallStore)(e => e.status),
      d = (0, p.useEngineVnextInstallStore)(e => e.ready),
      g = (0, p.useEngineVnextInstallStore)(e => e.requiresInstall),
      h = (0, p.useEngineVnextInstallStore)(e => e.loadStatus),
      A = (0, s.useAppUpdateStore)(e => e.appUpdate),
      f = (0, s.useAppUpdateStore)(e => e.installing),
      U = (0, s.useAppUpdateStore)(e => e.refreshAppUpdate),
      E = (0, s.useAppUpdateStore)(e => e.installAppUpdate),
      S = t.default.useRef(!1),
      y = t.default.useRef(!1),
      _ = t.default.useRef(!1),
      T = t.default.useRef(!1);
    return t.default.useEffect(() => {
      if (!(0, r.isTauri)() || y.current) return;
      y.current = !0;
      let t = "true" !== localStorage.getItem(u);
      t && localStorage.setItem(u, "true"), (async () => {
        await U({
          force: t,
          silent: !0,
          staleMs: s.APP_UPDATE_CACHE_MS,
          timeoutMs: n.APP_STARTUP_UPDATE_CHECK_TIMEOUT_MS
        });
        let r = s.useAppUpdateStore.getState().appUpdate;
        if (r?.available) {
          S.current = !0, o(), _.current || (_.current = !0, await E());
          return
        }
        await h(e, {
          force: t,
          staleMs: p.ENGINE_VNEXT_STATUS_CACHE_MS
        }), T.current || (T.current = !0, (0, a.runLegacyRuntimeCleanupMigration)({
          dryRun: !1,
          force: !1
        }).then(e => {
          (e.ran || e.errors.length > 0) && console.info("Legacy runtime cleanup migration:", e)
        }).catch(e => {
          console.warn("Legacy runtime cleanup migration skipped:", e)
        }))
      })()
    }, [e, E, h, o, U]), t.default.useEffect(() => {
      if ((0, r.isTauri)()) {
        if (f || A?.available) {
          S.current = !0, o();
          return
        }
        if (d) {
          S.current = !1;
          return
        }
        "idle" === c || "checking" === c || "installing" === c || g && (S.current || (S.current = !0, o()))
      }
    }, [A?.available, f, o, d, g, c]), null
  }, "FIRST_ENGINE_SETTINGS_OPENED_KEY", 0, u])
}, 98446, e => {
  e.n(e.i(54438))
}]);