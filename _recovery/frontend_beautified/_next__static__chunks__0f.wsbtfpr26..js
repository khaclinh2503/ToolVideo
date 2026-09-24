(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 47841, e => {
  "use strict";
  var i = e.i(71645);
  e.i(89268);
  var t = e.i(30797),
    r = e.i(41824),
    n = e.i(7787),
    a = e.i(81341),
    o = e.i(57342);
  e.s(["NativeVnextWarmup", 0, function() {
    let e = (0, o.useCloudStore)(e => e.apiUrl),
      s = (0, o.useCloudStore)(e => e.token),
      u = (0, o.useCloudStore)(e => e.fetchServerConfig),
      l = (0, o.useCloudStore)(e => e.refreshDeviceSession);
    return i.default.useEffect(() => {
      if (!(0, a.isTauri)() || !s) return;
      let e = !1,
        i = window.setTimeout(() => {
          (async () => {
            try {
              u();
              let [i, a, o] = await Promise.all([(0, r.getDeviceFingerprint)(), (0, t.getAppVersion)(), (0, n.getEngineRegistryStatus)()]);
              if (e) return;
              let s = o.installedFamilies.find(e => "dichvideo-engine-vnext" === e.family);
              if (!s?.healthy || !s.packageSha256) return;
              await l({
                device: {
                  hardware_fingerprint_hash: i.hardware_fingerprint_hash,
                  installation_id: i.installation_id,
                  app_version: a,
                  os: i.os,
                  runtime_hash: s.packageSha256,
                  anchor_count: i.anchor_count
                }
              })
            } catch (e) {
              console.warn("[native-vnext-warmup] skipped", e)
            }
          })()
        }, 2e3);
      return () => {
        e = !0, window.clearTimeout(i)
      }
    }, [e, s, u, l]), null
  }])
}, 42590, e => {
  e.n(e.i(47841))
}]);