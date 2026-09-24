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
}, 68877, e => {
  "use strict";
  let t = (0, e.i(56420).default)("arrow-right", [
    ["path", {
      d: "M5 12h14",
      key: "1ays0h"
    }],
    ["path", {
      d: "m12 5 7 7-7 7",
      key: "xquz4c"
    }]
  ]);
  e.s(["ArrowRight", 0, t], 68877)
}, 33525, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "warnOnce", {
    enumerable: !0,
    get: function() {
      return n
    }
  });
  let n = e => {}
}, 67423, (e, t, r) => {
  "use strict";

  function n({
    widthInt: e,
    heightInt: t,
    blurWidth: r,
    blurHeight: i,
    blurDataURL: a,
    objectFit: l
  }) {
    let o = r ? 40 * r : e,
      s = i ? 40 * i : t,
      d = o && s ? `viewBox='0 0 ${o} ${s}'` : "";
    return `%3Csvg xmlns='http://www.w3.org/2000/svg' ${d}%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='${d?"none":"contain"===l?"xMidYMid":"cover"===l?"xMidYMid slice":"none"}' style='filter: url(%23b);' href='${a}'/%3E%3C/svg%3E`
  }
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "getImageBlurSvg", {
    enumerable: !0,
    get: function() {
      return n
    }
  })
}, 87690, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  });
  var n = {
    VALID_LOADERS: function() {
      return a
    },
    imageConfigDefault: function() {
      return l
    }
  };
  for (var i in n) Object.defineProperty(r, i, {
    enumerable: !0,
    get: n[i]
  });
  let a = ["default", "imgix", "cloudinary", "akamai", "custom"],
    l = {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [32, 48, 64, 96, 128, 256, 384],
      path: "/_next/image",
      loader: "default",
      loaderFile: "",
      domains: [],
      disableStaticImages: !1,
      minimumCacheTTL: 14400,
      formats: ["image/webp"],
      maximumDiskCacheSize: void 0,
      maximumRedirects: 3,
      maximumResponseBody: 5e7,
      dangerouslyAllowLocalIP: !1,
      dangerouslyAllowSVG: !1,
      contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
      contentDispositionType: "attachment",
      localPatterns: void 0,
      remotePatterns: [],
      qualities: [75],
      unoptimized: !1,
      customCacheHandler: !1
    }
}, 8927, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "getImgProps", {
    enumerable: !0,
    get: function() {
      return d
    }
  }), e.r(33525);
  let n = e.r(43369),
    i = e.r(67423),
    a = e.r(87690),
    l = ["-moz-initial", "fill", "none", "scale-down", void 0];

  function o(e) {
    return void 0 !== e.default
  }

  function s(e) {
    return void 0 === e ? e : "number" == typeof e ? Number.isFinite(e) ? e : NaN : "string" == typeof e && /^[0-9]+$/.test(e) ? parseInt(e, 10) : NaN
  }

  function d({
    src: e,
    sizes: t,
    unoptimized: r = !1,
    priority: u = !1,
    preload: c = !1,
    loading: f,
    className: h,
    quality: m,
    width: p,
    height: g,
    fill: y = !1,
    style: v,
    overrideSrc: w,
    onLoad: b,
    onLoadingComplete: x,
    placeholder: _ = "empty",
    blurDataURL: S,
    fetchPriority: j,
    decoding: k = "async",
    layout: P,
    objectFit: C,
    objectPosition: I,
    lazyBoundary: R,
    lazyRoot: D,
    ...E
  }, M) {
    var T;
    let O, B, N, {
        imgConf: z,
        showAltText: V,
        blurComplete: L,
        defaultLoader: q
      } = M,
      F = z || a.imageConfigDefault;
    if ("allSizes" in F) O = F;
    else {
      let e = [...F.deviceSizes, ...F.imageSizes].sort((e, t) => e - t),
        t = F.deviceSizes.sort((e, t) => e - t),
        r = F.qualities?.sort((e, t) => e - t);
      O = {
        ...F,
        allSizes: e,
        deviceSizes: t,
        qualities: r
      }
    }
    if (void 0 === q) throw Object.defineProperty(Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config"), "__NEXT_ERROR_CODE", {
      value: "E163",
      enumerable: !1,
      configurable: !0
    });
    let $ = E.loader || q;
    delete E.loader, delete E.srcSet;
    let A = "__next_img_default" in $;
    if (A) {
      if ("custom" === O.loader) throw Object.defineProperty(Error(`Image with src "${e}" is missing "loader" prop.
Read more: https://nextjs.org/docs/messages/next-image-missing-loader`), "__NEXT_ERROR_CODE", {
        value: "E252",
        enumerable: !1,
        configurable: !0
      })
    } else {
      let e = $;
      $ = t => {
        let {
          config: r,
          ...n
        } = t;
        return e(n)
      }
    }
    if (P) {
      "fill" === P && (y = !0);
      let e = {
        intrinsic: {
          maxWidth: "100%",
          height: "auto"
        },
        responsive: {
          width: "100%",
          height: "auto"
        }
      } [P];
      e && (v = {
        ...v,
        ...e
      });
      let r = {
        responsive: "100vw",
        fill: "100vw"
      } [P];
      r && !t && (t = r)
    }
    let U = "",
      H = s(p),
      X = s(g);
    if ((T = e) && "object" == typeof T && (o(T) || void 0 !== T.src)) {
      let t = o(e) ? e.default : e;
      if (!t.src) throw Object.defineProperty(Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received ${JSON.stringify(t)}`), "__NEXT_ERROR_CODE", {
        value: "E460",
        enumerable: !1,
        configurable: !0
      });
      if (!t.height || !t.width) throw Object.defineProperty(Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received ${JSON.stringify(t)}`), "__NEXT_ERROR_CODE", {
        value: "E48",
        enumerable: !1,
        configurable: !0
      });
      if (B = t.blurWidth, N = t.blurHeight, S = S || t.blurDataURL, U = t.src, !y)
        if (H || X) {
          if (H && !X) {
            let e = H / t.width;
            X = Math.round(t.height * e)
          } else if (!H && X) {
            let e = X / t.height;
            H = Math.round(t.width * e)
          }
        } else H = t.width, X = t.height
    }
    let K = !u && !c && ("lazy" === f || void 0 === f);
    (!(e = "string" == typeof e ? e : U) || e.startsWith("data:") || e.startsWith("blob:")) && (r = !0, K = !1), O.unoptimized && (r = !0), A && !O.dangerouslyAllowSVG && e.split("?", 1)[0].endsWith(".svg") && (r = !0);
    let W = s(m),
      G = Object.assign(y ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: C,
        objectPosition: I
      } : {}, V ? {} : {
        color: "transparent"
      }, v),
      Q = L || "empty" === _ ? null : "blur" === _ ? `url("data:image/svg+xml;charset=utf-8,${(0,i.getImageBlurSvg)({widthInt:H,heightInt:X,blurWidth:B,blurHeight:N,blurDataURL:S||"",objectFit:G.objectFit})}")` : `url("${_}")`,
      Y = l.includes(G.objectFit) ? "fill" === G.objectFit ? "100% 100%" : "cover" : G.objectFit,
      J = Q ? {
        backgroundSize: Y,
        backgroundPosition: G.objectPosition || "50% 50%",
        backgroundRepeat: "no-repeat",
        backgroundImage: Q
      } : {},
      Z = function({
        config: e,
        src: t,
        unoptimized: r,
        width: i,
        quality: a,
        sizes: l,
        loader: o
      }) {
        if (r) {
          if (t.startsWith("/") && !t.startsWith("//")) {
            let e = (0, n.getDeploymentId)();
            if (e) {
              let r = t.indexOf("?");
              if (-1 !== r) {
                let n = new URLSearchParams(t.slice(r + 1));
                n.get("dpl") || (n.append("dpl", e), t = t.slice(0, r) + "?" + n.toString())
              } else t += `?dpl=${e}`
            }
          }
          return {
            src: t,
            srcSet: void 0,
            sizes: void 0
          }
        }
        let {
          widths: s,
          kind: d
        } = function({
          deviceSizes: e,
          allSizes: t
        }, r, n) {
          if (n) {
            let r = /(^|\s)(1?\d?\d)vw/g,
              i = [];
            for (let e; e = r.exec(n);) i.push(parseInt(e[2]));
            if (i.length) {
              let r = .01 * Math.min(...i);
              return {
                widths: t.filter(t => t >= e[0] * r),
                kind: "w"
              }
            }
            return {
              widths: t,
              kind: "w"
            }
          }
          return "number" != typeof r ? {
            widths: e,
            kind: "w"
          } : {
            widths: [...new Set([r, 2 * r].map(e => t.find(t => t >= e) || t[t.length - 1]))],
            kind: "x"
          }
        }(e, i, l), u = s.length - 1;
        return {
          sizes: l || "w" !== d ? l : "100vw",
          srcSet: s.map((r, n) => `${o({config:e,src:t,quality:a,width:r})} ${"w"===d?r:n+1}${d}`).join(", "),
          src: o({
            config: e,
            src: t,
            quality: a,
            width: s[u]
          })
        }
      }({
        config: O,
        src: e,
        unoptimized: r,
        width: H,
        quality: W,
        sizes: t,
        loader: $
      }),
      ee = K ? "lazy" : f;
    return {
      props: {
        ...E,
        loading: ee,
        fetchPriority: j,
        width: H,
        height: X,
        decoding: k,
        className: h,
        style: {
          ...G,
          ...J
        },
        sizes: Z.sizes,
        srcSet: Z.srcSet,
        src: w || Z.src
      },
      meta: {
        unoptimized: r,
        preload: c || u,
        placeholder: _,
        fill: y
      }
    }
  }
}, 98879, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "default", {
    enumerable: !0,
    get: function() {
      return o
    }
  });
  let n = e.r(71645),
    i = "u" < typeof window,
    a = i ? () => {} : n.useLayoutEffect,
    l = i ? () => {} : n.useEffect;

  function o(e) {
    let {
      headManager: t,
      reduceComponentsToState: r
    } = e;

    function o() {
      if (t && t.mountedInstances) {
        let e = n.Children.toArray(Array.from(t.mountedInstances).filter(Boolean));
        t.updateHead(r(e))
      }
    }
    return i && (t?.mountedInstances?.add(e.children), o()), a(() => (t?.mountedInstances?.add(e.children), () => {
      t?.mountedInstances?.delete(e.children)
    })), a(() => (t && (t._pendingUpdate = o), () => {
      t && (t._pendingUpdate = o)
    })), l(() => (t && t._pendingUpdate && (t._pendingUpdate(), t._pendingUpdate = null), () => {
      t && t._pendingUpdate && (t._pendingUpdate(), t._pendingUpdate = null)
    })), null
  }
}, 25633, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  });
  var n = {
    default: function() {
      return p
    },
    defaultHead: function() {
      return c
    }
  };
  for (var i in n) Object.defineProperty(r, i, {
    enumerable: !0,
    get: n[i]
  });
  let a = e.r(55682),
    l = e.r(90809),
    o = e.r(43476),
    s = l._(e.r(71645)),
    d = a._(e.r(98879)),
    u = e.r(42732);

  function c() {
    return [(0, o.jsx)("meta", {
      charSet: "utf-8"
    }, "charset"), (0, o.jsx)("meta", {
      name: "viewport",
      content: "width=device-width"
    }, "viewport")]
  }

  function f(e, t) {
    return "string" == typeof t || "number" == typeof t ? e : t.type === s.default.Fragment ? e.concat(s.default.Children.toArray(t.props.children).reduce((e, t) => "string" == typeof t || "number" == typeof t ? e : e.concat(t), [])) : e.concat(t)
  }
  e.r(33525);
  let h = ["name", "httpEquiv", "charSet", "itemProp"];

  function m(e) {
    let t, r, n, i;
    return e.reduce(f, []).reverse().concat(c().reverse()).filter((t = new Set, r = new Set, n = new Set, i = {}, e => {
      let a = !0,
        l = !1;
      if (e.key && "number" != typeof e.key && e.key.indexOf("$") > 0) {
        l = !0;
        let r = e.key.slice(e.key.indexOf("$") + 1);
        t.has(r) ? a = !1 : t.add(r)
      }
      switch (e.type) {
        case "title":
        case "base":
          r.has(e.type) ? a = !1 : r.add(e.type);
          break;
        case "meta":
          for (let t = 0, r = h.length; t < r; t++) {
            let r = h[t];
            if (e.props.hasOwnProperty(r))
              if ("charSet" === r) n.has(r) ? a = !1 : n.add(r);
              else {
                let t = e.props[r],
                  n = i[r] || new Set;
                ("name" !== r || !l) && n.has(t) ? a = !1 : (n.add(t), i[r] = n)
              }
          }
      }
      return a
    })).reverse().map((e, t) => {
      let r = e.key || t;
      return s.default.cloneElement(e, {
        key: r
      })
    })
  }
  let p = function({
    children: e
  }) {
    let t = (0, s.useContext)(u.HeadManagerContext);
    return (0, o.jsx)(d.default, {
      reduceComponentsToState: m,
      headManager: t,
      children: e
    })
  };
  ("function" == typeof r.default || "object" == typeof r.default && null !== r.default) && void 0 === r.default.__esModule && (Object.defineProperty(r.default, "__esModule", {
    value: !0
  }), Object.assign(r.default, r), t.exports = r.default)
}, 18556, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "ImageConfigContext", {
    enumerable: !0,
    get: function() {
      return a
    }
  });
  let n = e.r(55682)._(e.r(71645)),
    i = e.r(87690),
    a = n.default.createContext(i.imageConfigDefault)
}, 65856, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "RouterContext", {
    enumerable: !0,
    get: function() {
      return n
    }
  });
  let n = e.r(55682)._(e.r(71645)).default.createContext(null)
}, 70965, (e, t, r) => {
  "use strict";

  function n(e, t) {
    let r = e || 75;
    return t?.qualities?.length ? t.qualities.reduce((e, t) => Math.abs(t - r) < Math.abs(e - r) ? t : e, t.qualities[0]) : r
  }
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "findClosestQuality", {
    enumerable: !0,
    get: function() {
      return n
    }
  })
}, 1948, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "default", {
    enumerable: !0,
    get: function() {
      return l
    }
  });
  let n = e.r(70965),
    i = e.r(43369);

  function a({
    config: e,
    src: t,
    width: r,
    quality: l
  }) {
    let o = (0, i.getDeploymentId)();
    if (t.startsWith("/") && !t.startsWith("//")) {
      let e = t.indexOf("?");
      if (-1 !== e) {
        let r = new URLSearchParams(t.slice(e + 1)),
          n = r.get("dpl");
        if (n) {
          o = n, r.delete("dpl");
          let i = r.toString();
          t = t.slice(0, e) + (i ? "?" + i : "")
        }
      }
    }
    if (t.startsWith("/") && t.includes("?") && e.localPatterns?.length === 1 && "**" === e.localPatterns[0].pathname && "" === e.localPatterns[0].search) throw Object.defineProperty(Error(`Image with src "${t}" is using a query string which is not configured in images.localPatterns.
Read more: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns`), "__NEXT_ERROR_CODE", {
      value: "E871",
      enumerable: !1,
      configurable: !0
    });
    let s = (0, n.findClosestQuality)(l, e);
    return `${e.path}?url=${encodeURIComponent(t)}&w=${r}&q=${s}${t.startsWith("/")&&o?`&dpl=${o}`:""}`
  }
  a.__next_img_default = !0;
  let l = a
}, 18581, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "useMergedRef", {
    enumerable: !0,
    get: function() {
      return i
    }
  });
  let n = e.r(71645);

  function i(e, t) {
    let r = (0, n.useRef)(null),
      i = (0, n.useRef)(null);
    return (0, n.useCallback)(n => {
      if (null === n) {
        let e = r.current;
        e && (r.current = null, e());
        let t = i.current;
        t && (i.current = null, t())
      } else e && (r.current = a(e, n)), t && (i.current = a(t, n))
    }, [e, t])
  }

  function a(e, t) {
    if ("function" != typeof e) return e.current = t, () => {
      e.current = null
    };
    {
      let r = e(t);
      return "function" == typeof r ? r : () => e(null)
    }
  }("function" == typeof r.default || "object" == typeof r.default && null !== r.default) && void 0 === r.default.__esModule && (Object.defineProperty(r.default, "__esModule", {
    value: !0
  }), Object.assign(r.default, r), t.exports = r.default)
}, 5500, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  }), Object.defineProperty(r, "Image", {
    enumerable: !0,
    get: function() {
      return b
    }
  });
  let n = e.r(55682),
    i = e.r(90809),
    a = e.r(43476),
    l = i._(e.r(71645)),
    o = n._(e.r(74080)),
    s = n._(e.r(25633)),
    d = e.r(8927),
    u = e.r(87690),
    c = e.r(18556);
  e.r(33525);
  let f = e.r(65856),
    h = n._(e.r(1948)),
    m = e.r(18581),
    p = {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [32, 48, 64, 96, 128, 256, 384],
      qualities: [75],
      path: "/_next/image",
      loader: "default",
      dangerouslyAllowSVG: !1,
      unoptimized: !0
    };

  function g(e, t, r, n, i, a, l) {
    let o = e?.src;
    e && e["data-loaded-src"] !== o && (e["data-loaded-src"] = o, ("decode" in e ? e.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (e.parentElement && e.isConnected) {
        if ("empty" !== t && i(!0), r?.current) {
          let t = new Event("load");
          Object.defineProperty(t, "target", {
            writable: !1,
            value: e
          });
          let n = !1,
            i = !1;
          r.current({
            ...t,
            nativeEvent: t,
            currentTarget: e,
            target: e,
            isDefaultPrevented: () => n,
            isPropagationStopped: () => i,
            persist: () => {},
            preventDefault: () => {
              n = !0, t.preventDefault()
            },
            stopPropagation: () => {
              i = !0, t.stopPropagation()
            }
          })
        }
        n?.current && n.current(e)
      }
    }))
  }

  function y(e) {
    return l.use ? {
      fetchPriority: e
    } : {
      fetchpriority: e
    }
  }
  "u" < typeof window && (globalThis.__NEXT_IMAGE_IMPORTED = !0);
  let v = (0, l.forwardRef)(({
    src: e,
    srcSet: t,
    sizes: r,
    height: n,
    width: i,
    decoding: o,
    className: s,
    style: d,
    fetchPriority: u,
    placeholder: c,
    loading: f,
    unoptimized: h,
    fill: p,
    onLoadRef: v,
    onLoadingCompleteRef: w,
    setBlurComplete: b,
    setShowAltText: x,
    sizesInput: _,
    onLoad: S,
    onError: j,
    ...k
  }, P) => {
    let C = (0, l.useCallback)(e => {
        e && (j && (e.src = e.src), e.complete && g(e, c, v, w, b, h, _))
      }, [e, c, v, w, b, j, h, _]),
      I = (0, m.useMergedRef)(P, C);
    return (0, a.jsx)("img", {
      ...k,
      ...y(u),
      loading: f,
      width: i,
      height: n,
      decoding: o,
      "data-nimg": p ? "fill" : "1",
      className: s,
      style: d,
      sizes: r,
      srcSet: t,
      src: e,
      ref: I,
      onLoad: e => {
        g(e.currentTarget, c, v, w, b, h, _)
      },
      onError: e => {
        x(!0), "empty" !== c && b(!0), j && j(e)
      }
    })
  });

  function w({
    isAppRouter: e,
    imgAttributes: t
  }) {
    let r = {
      as: "image",
      imageSrcSet: t.srcSet,
      imageSizes: t.sizes,
      crossOrigin: t.crossOrigin,
      referrerPolicy: t.referrerPolicy,
      ...y(t.fetchPriority)
    };
    return e && o.default.preload ? (o.default.preload(t.src, r), null) : (0, a.jsx)(s.default, {
      children: (0, a.jsx)("link", {
        rel: "preload",
        href: t.srcSet ? void 0 : t.src,
        ...r
      }, "__nimg-" + t.src + t.srcSet + t.sizes)
    })
  }
  let b = (0, l.forwardRef)((e, t) => {
    let r = (0, l.useContext)(f.RouterContext),
      n = (0, l.useContext)(c.ImageConfigContext),
      i = (0, l.useMemo)(() => {
        let e = p || n || u.imageConfigDefault,
          t = [...e.deviceSizes, ...e.imageSizes].sort((e, t) => e - t),
          r = e.deviceSizes.sort((e, t) => e - t),
          i = e.qualities?.sort((e, t) => e - t);
        return {
          ...e,
          allSizes: t,
          deviceSizes: r,
          qualities: i,
          localPatterns: "u" < typeof window ? n?.localPatterns : e.localPatterns
        }
      }, [n]),
      {
        onLoad: o,
        onLoadingComplete: s
      } = e,
      m = (0, l.useRef)(o);
    (0, l.useEffect)(() => {
      m.current = o
    }, [o]);
    let g = (0, l.useRef)(s);
    (0, l.useEffect)(() => {
      g.current = s
    }, [s]);
    let [y, b] = (0, l.useState)(!1), [x, _] = (0, l.useState)(!1), {
      props: S,
      meta: j
    } = (0, d.getImgProps)(e, {
      defaultLoader: h.default,
      imgConf: i,
      blurComplete: y,
      showAltText: x
    });
    return (0, a.jsxs)(a.Fragment, {
      children: [(0, a.jsx)(v, {
        ...S,
        unoptimized: j.unoptimized,
        placeholder: j.placeholder,
        fill: j.fill,
        onLoadRef: m,
        onLoadingCompleteRef: g,
        setBlurComplete: b,
        setShowAltText: _,
        sizesInput: e.sizes,
        ref: t
      }), j.preload ? (0, a.jsx)(w, {
        isAppRouter: !r,
        imgAttributes: S
      }) : null]
    })
  });
  ("function" == typeof r.default || "object" == typeof r.default && null !== r.default) && void 0 === r.default.__esModule && (Object.defineProperty(r.default, "__esModule", {
    value: !0
  }), Object.assign(r.default, r), t.exports = r.default)
}, 94909, (e, t, r) => {
  "use strict";
  Object.defineProperty(r, "__esModule", {
    value: !0
  });
  var n = {
    default: function() {
      return u
    },
    getImageProps: function() {
      return d
    }
  };
  for (var i in n) Object.defineProperty(r, i, {
    enumerable: !0,
    get: n[i]
  });
  let a = e.r(55682),
    l = e.r(8927),
    o = e.r(5500),
    s = a._(e.r(1948));

  function d(e) {
    let {
      props: t
    } = (0, l.getImgProps)(e, {
      defaultLoader: s.default,
      imgConf: {
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [32, 48, 64, 96, 128, 256, 384],
        qualities: [75],
        path: "/_next/image",
        loader: "default",
        dangerouslyAllowSVG: !1,
        unoptimized: !0
      }
    });
    for (let [e, r] of Object.entries(t)) void 0 === r && delete t[e];
    return {
      props: t
    }
  }
  let u = o.Image
}, 57688, (e, t, r) => {
  t.exports = e.r(94909)
}, 56522, e => {
  "use strict";
  let t = (0, e.i(56420).default)("save", [
    ["path", {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }],
    ["path", {
      d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
      key: "1ydtos"
    }],
    ["path", {
      d: "M7 3v4a1 1 0 0 0 1 1h7",
      key: "t51u73"
    }]
  ]);
  e.s(["Save", 0, t], 56522)
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
}, 80345, 81469, 78422, 38465, 88991, 1975, 71040, e => {
  "use strict";
  var t = e.i(68834),
    r = e.i(79473),
    n = e.i(48868),
    i = e.i(75157);
  let a = /(\d{3,4})\s*p/i,
    l = {
      youtube: "YouTube",
      tiktok: "TikTok",
      facebook: "Facebook",
      instagram: "Instagram",
      douyin: "Douyin",
      bilibili: "Bilibili",
      twitter: "Twitter/X",
      x: "Twitter/X",
      threads: "Threads",
      vimeo: "Vimeo",
      dailymotion: "Dailymotion",
      pinterest: "Pinterest",
      reddit: "Reddit",
      twitch: "Twitch",
      snapchat: "Snapchat",
      linkedin: "LinkedIn",
      tumblr: "Tumblr"
    };

  function o(e) {
    let t = e.trim();
    if (!t) return !1;
    try {
      let e = new URL(t);
      return "http:" === e.protocol || "https:" === e.protocol
    } catch {
      return !1
    }
  }

  function s(e) {
    let t = e.filter(e => "video" === e.kind);
    if (0 === t.length) return null;
    let r = t.filter(e => "number" == typeof e.filesize && e.filesize > 0);
    if (r.length > 0) return r.reduce((e, t) => t.filesize > e.filesize ? t : e);
    let n = t.map(e => {
      let t;
      return {
        format: e,
        resolution: (t = e.label.match(a)) ? Number.parseInt(t[1], 10) : null
      }
    }).filter(e => null !== e.resolution).sort((e, t) => t.resolution - e.resolution);
    return n.length > 0 ? n[0].format : t[0]
  }

  function d(e) {
    return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime()
  }

  function u(e) {
    if ("string" == typeof e) return e;
    if (e && "object" == typeof e) {
      for (let t of ["code", "message", "error"]) {
        let r = e[t];
        if ("string" == typeof r && r.trim()) return r.trim()
      }
      return String(e)
    }
    return ""
  }
  e.s(["SUPPORTED_PLATFORM_NAMES", 0, ["YouTube", "TikTok", "Instagram", "Facebook", "Douyin", "Bilibili", "Twitter/X", "Threads"], "isSupportedPlatformUrl", 0, o, "pickBestPlatformFormat", 0, s, "platformSourceLabel", 0, function(e) {
    let t = e.trim().toLowerCase();
    return t ? l[t] ?? `${t[0].toUpperCase()}${t.slice(1)}` : ""
  }], 81469);
  let c = "Tính năng này chỉ khả dụng trong ứng dụng DichVideo trên máy tính.";

  function f(e) {
    let t = u(e);
    return t.includes("platform_download_canceled") ? "Đã hủy tải." : t.includes("tauri_environment_required") ? c : t.includes("platform_download_url_forbidden") ? "Nền tảng từ chối địa chỉ tải của định dạng này. Hãy chọn chất lượng khác." : t.includes("platform_download_write_failed") ? "Không ghi được file tải về. Kiểm tra dung lượng đĩa và quyền ghi." : "Tải video thất bại. Thử lại sau."
  }
  e.s(["formatDownloadedAtLabel", 0, function(e, t = new Date) {
    let r = new Date(e);
    if (Number.isNaN(r.getTime())) return "";
    let n = String(r.getHours()).padStart(2, "0"),
      i = String(r.getMinutes()).padStart(2, "0"),
      a = `${n}:${i}`,
      l = Math.round((d(t) - d(r)) / 864e5);
    if (0 === l) return `H\xf4m nay ${a}`;
    if (1 === l) return `H\xf4m qua ${a}`;
    let o = r.getFullYear(),
      s = String(r.getMonth() + 1).padStart(2, "0"),
      u = String(r.getDate()).padStart(2, "0");
    return `${u}/${s}/${o} ${a}`
  }, "platformChannelErrorMessage", 0, function(e) {
    let t = u(e);
    return t.includes("tauri_environment_required") ? c : t.includes("platform_url_invalid") ? "Đường dẫn không hợp lệ. Hãy dán đầy đủ địa chỉ kênh hoặc playlist." : "Không lấy được danh sách video. Kiểm tra lại đường dẫn hoặc thử lại."
  }, "platformDownloadErrorMessage", 0, f, "platformDownloadProgressPercent", 0, function(e, t) {
    return !t || t <= 0 ? null : Math.min(100, Math.round(e / t * 100))
  }, "platformExtractErrorMessage", 0, function(e) {
    let t = u(e);
    return t.includes("tauri_environment_required") ? c : t.includes("platform_url_invalid") ? "Đường dẫn không hợp lệ. Hãy dán đầy đủ địa chỉ video." : "Không lấy được thông tin video. Kiểm tra lại đường dẫn hoặc thử lại."
  }], 78422);
  var h = e.i(65991),
    m = e.i(44077);
  e.i(89268);
  var p = e.i(81341);

  function g(e) {
    let t = e?.trim();
    return t ? (/^[a-zA-Z]:[\\/]/.test(t) || t.includes("\\") ? t.replace(/[\\/]+/g, "\\") : t).toLowerCase() : ""
  }

  function y(e) {
    let t = new Set,
      r = [];
    for (let n of e) {
      let e = g(n.filePath);
      !e || t.has(e) || (t.add(e), r.push(n))
    }
    return r
  }

  function v(e) {
    let t = Date.parse(e.downloadedAt);
    return Number.isNaN(t) ? null : t
  }

  function w(e) {
    return e.title.trim() || function(e) {
      let t = e?.trim();
      if (!t) return "";
      let r = t.split(/[\\/]+/).filter(Boolean);
      return r[r.length - 1] ?? ""
    }(e.filePath) || "video"
  }

  function b(e, t) {
    let r = new Set(t.queueVideoIds);
    return e.map(e => {
      let n = t.videos.find(t => {
        var r, n;
        let i, a;
        return r = t.path, n = e.filePath, i = g(r), a = g(n), "" !== i && i === a
      });
      return n ? r.has(n.id) ? {
        entry: e,
        videoId: n.id,
        action: "unavailable",
        reason: "already_queued"
      } : "idle" !== n.status || n.translatedVideoPath ? {
        entry: e,
        videoId: n.id,
        action: "unavailable",
        reason: "already_processed"
      } : {
        entry: e,
        videoId: n.id,
        action: "reuse"
      } : {
        entry: e,
        videoId: null,
        action: "import"
      }
    })
  }

  function x(e, t) {
    return e.filter(e => e.action === t)
  }
  async function _(e) {
    let t = (0, p.isTauri)(),
      r = h.useVideoStore.getState(),
      n = m.useQueueStore.getState(),
      i = b(y(e), {
        videos: r.videos,
        queueVideoIds: (0, m.inFlightQueueVideoIds)(n.items)
      }),
      a = {
        activeVideoId: null,
        missingEntryIds: [],
        failed: []
      },
      l = null,
      o = [];
    for (let e of x(i, "import")) {
      let {
        entry: r
      } = e;
      if (t && !await (0, p.fileExists)(r.filePath)) {
        a.missingEntryIds.push(r.id);
        continue
      }
      try {
        let e = (0, m.inFlightQueueVideoIds)(m.useQueueStore.getState().items),
          t = await h.useVideoStore.getState().addVideoFromFile(r.filePath, {
            queueVideoIds: e
          });
        l = t, m.useQueueStore.getState().isVideoQueued(t) || o.push(t)
      } catch (e) {
        a.failed.push({
          entryId: r.id,
          filePath: r.filePath,
          message: e instanceof Error ? e.message : String(e)
        })
      }
    }
    for (let e of x(i, "reuse")) {
      let {
        entry: r,
        videoId: n
      } = e;
      if (n) {
        if (t && !await (0, p.fileExists)(r.filePath)) {
          a.missingEntryIds.push(r.id);
          continue
        }
        l = n, h.useVideoStore.getState().dashboardDraftVideoIds.includes(n) || o.push(n)
      }
    }
    return o.length > 0 && h.useVideoStore.getState().addDashboardDraftVideoIds(o), l && h.useVideoStore.getState().setActiveVideo(l), a.activeVideoId = l, a
  }
  e.s(["buildDownloadedImportPlan", 0, b, "downloadedImportPlanEntries", 0, x, "entryDisplayTitle", 0, w, "normalizeDownloadedVideoEntries", 0, y, "sortDownloadedVideoEntries", 0, function(e) {
    return [...e].sort((e, t) => {
      let r = v(e),
        n = v(t);
      return null === r && null === n ? w(e).localeCompare(w(t)) : null === r ? 1 : null === n ? -1 : n !== r ? n - r : w(e).localeCompare(w(t))
    })
  }, "unavailableReasonLabel", 0, function(e) {
    switch (e) {
      case "already_queued":
        return "Đang xử lý";
      case "already_processed":
        return "Đã xử lý";
      default:
        return null
    }
  }], 38465), e.s(["importDownloadedVideos", 0, _], 88991);
  var S = e.i(86682);
  async function j(e) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    return (0, S.invoke)("extract_platform_media", {
      url: e
    })
  }
  async function k(e, t) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    return (0, S.invoke)("list_platform_channel", {
      url: e,
      limit: t ?? null
    })
  }
  async function P(e) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    return (0, S.invoke)("download_platform_media", {
      ...e
    })
  }
  let C = !1;
  async function I(e) {
    (0, p.isTauri)() && await (0, S.invoke)("cancel_platform_download", {
      downloadId: e
    })
  }
  async function R(e) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    await (0, S.invoke)("delete_platform_download_file", {
      path: e
    })
  }
  async function D(t) {
    if (!(0, p.isTauri)()) return () => {};
    let {
      listen: r
    } = await e.A(23982);
    return r("platform-download-progress", e => {
      t(e.payload)
    })
  }
  e.s(["cancelPlatformDownload", 0, I, "deletePlatformDownloadFile", 0, R, "downloadPlatformMedia", 0, P, "extractPlatformMedia", 0, j, "listPlatformChannel", 0, k, "onPlatformDownloadProgress", 0, D, "warmPlatformConnection", 0, function() {
    (0, p.isTauri)() && !C && (C = !0, (0, S.invoke)("warm_platform_connection").catch(() => void 0))
  }], 1975);
  let E = null;

  function M(e, t) {
    let r = {
      ...e
    };
    return delete r[t], r
  }
  let T = null;

  function O(e) {
    if ("string" == typeof e) return e;
    if (e && "object" == typeof e)
      for (let t of ["code", "message", "error"]) {
        let r = e[t];
        if ("string" == typeof r && r.trim()) return r.trim()
      }
    return ""
  }
  let B = (0, t.create)()((0, r.persist)((e, t) => ({
    history: [],
    active: {},
    channel: null,
    channelLoading: !1,
    channelItemStatus: {},
    channelBatchRunning: !1,
    channelBatchSummary: null,
    linksBatch: [],
    linksBatchRunning: !1,
    linksBatchSummary: null,
    extract: async e => j(e),
    download: async ({
      info: r,
      format: n,
      sourceUrl: a,
      downloadId: l
    }) => {
      E ??= D(e => {
        B.setState(t => {
          let r = t.active[e.downloadId];
          return r ? {
            active: {
              ...t.active,
              [e.downloadId]: {
                ...r,
                downloadedBytes: e.downloadedBytes,
                totalBytes: e.totalBytes
              }
            }
          } : t
        })
      });
      let o = l ?? (0, i.generateId)(),
        s = new Date().toISOString();
      e(e => ({
        active: {
          ...e.active,
          [o]: {
            title: r.title,
            downloadedBytes: 0,
            totalBytes: null
          }
        }
      }));
      try {
        let i = await P({
            downloadId: o,
            formatUrl: n.url,
            source: r.source,
            title: r.title,
            ext: n.ext
          }),
          l = {
            id: o,
            sourceUrl: a,
            source: r.source,
            title: r.title,
            thumbnail: r.thumbnail,
            author: r.author,
            durationSeconds: r.duration,
            formatLabel: n.label,
            filePath: i,
            fileSizeBytes: t().active[o]?.totalBytes ?? n.filesize,
            downloadedAt: new Date().toISOString(),
            rightsConfirmedAt: s
          };
        return e(e => ({
          active: M(e.active, o),
          history: [l, ...e.history]
        })), _([l]).catch(e => {
          console.warn("Auto-staging downloaded video failed:", e)
        }), l
      } catch (t) {
        throw e(e => ({
          active: M(e.active, o)
        })), t
      }
    },
    cancel: async e => {
      await I(e)
    },
    removeFromHistory: t => {
      e(e => ({
        history: e.history.filter(e => e.id !== t)
      }))
    },
    deleteDownloadedFile: async r => {
      let n = t().history.find(e => e.id === r);
      if (n) {
        try {
          await R(n.filePath)
        } catch (t) {
          if (String(t).includes("platform_download_file_missing")) return void e(e => ({
            history: e.history.filter(e => e.id !== r)
          }));
          throw t
        }
        e(e => ({
          history: e.history.filter(e => e.id !== r)
        }))
      }
    },
    listChannel: async r => {
      if (t().channelBatchRunning) return;
      let n = r.trim();
      e({
        channelLoading: !0,
        channelBatchSummary: null
      });
      try {
        let t = await k(n),
          r = new Set,
          i = t.items.map(e => ({
            ...e,
            url: e.url.trim()
          })).filter(e => !(!o(e.url) || r.has(e.url)) && (r.add(e.url), !0));
        e({
          channel: {
            sourceUrl: n,
            source: t.source,
            items: i
          },
          channelLoading: !1,
          channelItemStatus: {}
        })
      } catch (t) {
        throw e({
          channel: null,
          channelLoading: !1,
          channelItemStatus: {}
        }), t
      }
    },
    clearChannel: () => {
      t().channelBatchRunning || e({
        channel: null,
        channelItemStatus: {},
        channelBatchSummary: null
      })
    },
    downloadChannelItems: async ({
      items: r
    }) => {
      if (t().channelBatchRunning || t().linksBatchRunning || 0 === r.length) return {
        total: r.length,
        completed: 0,
        failed: 0,
        canceled: !1
      };
      let n = {
        cancelRequested: !1,
        currentDownloadId: null
      };
      T = n;
      let a = (t, r) => {
        e(e => ({
          channelItemStatus: {
            ...e.channelItemStatus,
            [t]: r
          }
        }))
      };
      for (let t of (e({
          channelBatchRunning: !0,
          channelBatchSummary: null
        }), r)) a(t.url, {
        status: "pending",
        error: null
      });
      let l = 0,
        o = 0;
      for (let e of r) {
        if (n.cancelRequested) break;
        a(e.url, {
          status: "downloading",
          error: null
        });
        try {
          let r = await t().extract(e.url);
          if (n.cancelRequested) {
            a(e.url, {
              status: "pending",
              error: null
            });
            break
          }
          let o = s(r.formats);
          if (!o) throw Error("platform_download_failed");
          let d = (0, i.generateId)();
          n.currentDownloadId = d, await t().download({
            info: r,
            format: o,
            sourceUrl: e.url,
            downloadId: d
          }), l += 1, a(e.url, {
            status: "done",
            error: null
          })
        } catch (r) {
          let t = O(r);
          if (n.cancelRequested || t.includes("platform_download_canceled")) {
            a(e.url, {
              status: "pending",
              error: null
            }), n.cancelRequested = !0;
            break
          }
          o += 1, a(e.url, {
            status: "error",
            error: f(r)
          })
        } finally {
          n.currentDownloadId = null
        }
      }
      let d = {
        total: r.length,
        completed: l,
        failed: o,
        canceled: n.cancelRequested
      };
      return T = null, e({
        channelBatchRunning: !1,
        channelBatchSummary: d
      }), d
    },
    cancelChannelBatch: () => {
      let e = T;
      if (!e || !t().channelBatchRunning) return;
      e.cancelRequested = !0;
      let r = e.currentDownloadId;
      r && t().cancel(r)
    },
    downloadLinks: async ({
      items: r
    }) => {
      if (t().channelBatchRunning || t().linksBatchRunning || 0 === r.length) return {
        total: r.length,
        completed: 0,
        failed: 0,
        canceled: !1
      };
      let n = {
        cancelRequested: !1,
        currentDownloadId: null
      };
      T = n;
      let a = r.map(e => ({
          url: e.url,
          info: e.info,
          status: "pending",
          error: null
        })),
        l = new Set(a.map(e => e.url)),
        o = (t, r, n = null) => {
          e(e => ({
            linksBatch: e.linksBatch.map(e => e.url === t ? {
              ...e,
              status: r,
              error: n
            } : e)
          }))
        };
      e(e => ({
        linksBatchRunning: !0,
        linksBatchSummary: null,
        linksBatch: [...a, ...e.linksBatch.filter(e => !l.has(e.url))]
      }));
      let d = 0,
        u = 0;
      for (let e of a) {
        if (n.cancelRequested) {
          o(e.url, "cancelled");
          continue
        }
        o(e.url, "downloading");
        try {
          let r = s(e.info.formats);
          if (!r) throw Error("platform_download_failed");
          let a = (0, i.generateId)();
          n.currentDownloadId = a, await t().download({
            info: e.info,
            format: r,
            sourceUrl: e.url,
            downloadId: a
          }), d += 1, o(e.url, "done")
        } catch (r) {
          let t = O(r);
          if (n.cancelRequested || t.includes("platform_download_canceled")) {
            o(e.url, "cancelled"), n.cancelRequested = !0;
            continue
          }
          u += 1, o(e.url, "error", f(r))
        } finally {
          n.currentDownloadId = null
        }
      }
      let c = {
        total: a.length,
        completed: d,
        failed: u,
        canceled: n.cancelRequested
      };
      return T = null, e({
        linksBatchRunning: !1,
        linksBatchSummary: c
      }), c
    },
    retryLinksItem: async e => {
      let r = t().linksBatch.find(t => t.url === e && ("error" === t.status || "cancelled" === t.status));
      r && await t().downloadLinks({
        items: [{
          url: r.url,
          info: r.info
        }]
      })
    },
    cancelLinksBatch: () => {
      let e = T;
      if (!e || !t().linksBatchRunning) return;
      e.cancelRequested = !0;
      let r = e.currentDownloadId;
      r && t().cancel(r)
    },
    clearLinksBatch: () => {
      t().linksBatchRunning || e({
        linksBatch: [],
        linksBatchSummary: null
      })
    }
  }), {
    name: "dichvideo-platform-downloads",
    storage: (0, r.createJSONStorage)(() => (0, n.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      history: e.history
    })
  }));
  e.s(["usePlatformDownloadStore", 0, B], 80345);
  var N = e.i(71645);
  e.s(["useMissingPlatformFiles", 0, function(e) {
    let [t, r] = (0, N.useState)(new Set);
    return (0, N.useEffect)(() => {
      let t = !0;
      return (async () => {
        let n = new Set;
        await Promise.all(e.map(async e => {
          await (0, p.fileExists)(e.filePath) || n.add(e.id)
        })), t && r(n)
      })(), () => {
        t = !1
      }
    }, [e]), t
  }], 71040)
}, 30372, 88901, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    n = e.i(46696),
    i = e.i(56420);
  let a = (0, i.default)("folder-down", [
    ["path", {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }],
    ["path", {
      d: "M12 10v6",
      key: "1bos4e"
    }],
    ["path", {
      d: "m15 13-3 3-3-3",
      key: "6j2sf0"
    }]
  ]);
  e.s(["FolderDown", 0, a], 88901);
  var l = e.i(69644);
  let o = (0, i.default)("import", [
    ["path", {
      d: "M12 3v12",
      key: "1x0j5s"
    }],
    ["path", {
      d: "m8 11 4 4 4-4",
      key: "1dohi6"
    }],
    ["path", {
      d: "M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4",
      key: "1ywtjm"
    }]
  ]);
  var s = e.i(32781),
    d = e.i(21357),
    u = e.i(73474),
    c = e.i(87486),
    f = e.i(19455),
    h = e.i(46798),
    m = e.i(65991),
    p = e.i(44077),
    g = e.i(80345),
    y = e.i(81469),
    v = e.i(78422),
    w = e.i(88991),
    b = e.i(13308),
    x = e.i(38991),
    _ = e.i(8594);
  async function S(e, {
    setPreparationMessage: t
  }) {
    if (!await (0, b.ensureMediaToolsReady)({
        setPreparationMessage: t,
        logContext: "platform-download-import",
        checkingMessage: "Đang kiểm tra trình đọc video...",
        preparingMessage: "Đang chuẩn bị trình đọc video...",
        errorTitle: "Không thể chuẩn bị trình đọc video",
        contextMessage: "DichVideo chưa thể chuẩn bị thành phần đọc video."
      }) || !(await (0, w.importDownloadedVideos)([e])).activeVideoId) return !1;
    let r = _.useTerminalProjectStore.getState().active?.projectId ?? null;
    return await x.useAppStore.getState().leaveEditor("dashboard", r), !0
  }
  var j = e.i(71040);
  e.i(89268);
  var k = e.i(81341),
    P = e.i(63126),
    C = e.i(75157),
    I = e.i(38465);
  let R = {
    already_queued: "warning",
    already_processed: "secondary"
  };
  e.s(["DownloadedVideoList", 0, function({
    entries: e,
    hideProcessed: i = !1,
    bare: w = !1,
    className: b
  }) {
    let x = (0, m.useVideoStore)(e => e.videos),
      _ = (0, m.useVideoStore)(e => e.dashboardDraftVideoIds),
      D = (0, p.useQueueStore)(e => e.items),
      E = (0, g.usePlatformDownloadStore)(e => e.removeFromHistory),
      M = (0, g.usePlatformDownloadStore)(e => e.deleteDownloadedFile),
      T = (0, j.useMissingPlatformFiles)(e),
      O = (0, r.useMemo)(() => (0, p.inFlightQueueVideoIds)(D), [D]),
      B = (0, r.useMemo)(() => (0, I.sortDownloadedVideoEntries)((0, I.normalizeDownloadedVideoEntries)(e)), [e]),
      N = (0, r.useMemo)(() => (0, I.buildDownloadedImportPlan)(B, {
        videos: x,
        queueVideoIds: O
      }), [B, x, O]),
      z = (0, r.useMemo)(() => new Map(N.map(e => [e.entry.id, e])), [N]),
      V = (0, r.useMemo)(() => i ? B.filter(e => z.get(e.id)?.reason !== "already_processed") : B, [i, B, z]),
      [L, q] = (0, r.useState)(null),
      [F, $] = (0, r.useState)(null),
      [A, U] = (0, r.useState)(null),
      H = null !== L || null !== F,
      X = (0, r.useCallback)(async e => {
        if (!L) {
          q(e.id);
          try {
            await S(e, {
              setPreparationMessage: U
            })
          } catch (t) {
            console.error("Failed to import downloaded video:", t), n.toast.error("Không thể nhập video", {
              description: e.title
            })
          } finally {
            q(null)
          }
        }
      }, [L]),
      K = (0, r.useCallback)(async (e, t, r) => {
        if (!F) {
          if (r) return void n.toast.info("Video đang trong hàng chờ xử lý", {
            description: "Gỡ video khỏi hàng chờ trước khi xóa file."
          });
          if (await (0, k.askMessage)("Xóa video đã tải", t ? `"${(0,I.entryDisplayTitle)(e)}" sẽ bị x\xf3a khỏi lịch sử tải. File tr\xean m\xe1y kh\xf4ng c\xf2n tồn tại.` : `"${(0,I.entryDisplayTitle)(e)}" sẽ bị x\xf3a khỏi m\xe1y t\xednh v\xe0 khỏi lịch sử tải.`, "warning", {
              confirmLabel: "Xóa",
              cancelLabel: "Hủy"
            })) {
            $(e.id);
            try {
              t ? E(e.id) : await M(e.id)
            } catch (t) {
              console.error("Failed to delete downloaded video:", t), n.toast.error("Không thể xóa file", {
                description: (0, I.entryDisplayTitle)(e)
              })
            } finally {
              $(null)
            }
          }
        }
      }, [F, M, E]);
    return w && 0 === V.length ? null : (0, t.jsxs)("section", {
      "data-testid": "downloaded-video-list",
      className: (0, C.cn)("flex flex-col", w ? "" : "h-full flex-1 overflow-hidden rounded-lg border border-border bg-background/45", b),
      children: [(0, t.jsxs)("div", {
        className: "flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2",
        children: [(0, t.jsxs)("div", {
          className: "flex min-w-0 items-center gap-2",
          children: [(0, t.jsx)(a, {
            className: "h-4 w-4 shrink-0 text-muted-foreground"
          }), (0, t.jsxs)("div", {
            className: "min-w-0",
            children: [(0, t.jsx)("p", {
              className: "truncate text-xs font-semibold",
              children: "Video đã tải xuống"
            }), (0, t.jsxs)("p", {
              className: "mt-0.5 text-[11px] text-muted-foreground",
              children: [V.length, " video"]
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [A ? (0, t.jsxs)("p", {
            className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
            children: [(0, t.jsx)(s.Loader2, {
              className: "h-3 w-3 animate-spin"
            }), A]
          }) : null, (0, t.jsxs)(c.Badge, {
            variant: "secondary",
            className: "h-6 px-2 text-[11px]",
            children: [V.length, " video"]
          })]
        })]
      }), 0 === V.length ? (0, t.jsxs)("div", {
        className: "flex flex-1 flex-col items-center justify-center px-4 py-5 text-center",
        children: [(0, t.jsx)("div", {
          className: "mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-muted-foreground",
          children: (0, t.jsx)(a, {
            className: "h-5 w-5"
          })
        }), (0, t.jsx)("p", {
          className: "text-xs font-semibold",
          children: i ? "Chưa có video nào cần xử lý" : "Chưa có video nào được tải xuống"
        }), (0, t.jsx)("p", {
          className: "mt-0.5 text-[11px] text-muted-foreground",
          children: i ? "Video tải xong sẽ tự thêm vào hàng chờ xử lý" : "Video tải xong sẽ hiện ở đây"
        })]
      }) : (0, t.jsx)(h.TooltipProvider, {
        delayDuration: 0,
        children: (0, t.jsx)("div", {
          className: "divide-y divide-border",
          children: V.map(e => {
            let r = z.get(e.id),
              i = r?.action === "unavailable",
              a = T.has(e.id),
              m = i || a || H,
              p = r?.videoId != null && _.includes(r.videoId),
              g = [(0, y.platformSourceLabel)(e.source), e.formatLabel, null !== e.durationSeconds && e.durationSeconds > 0 ? (0, C.formatDuration)(e.durationSeconds) : null, null !== e.fileSizeBytes && e.fileSizeBytes > 0 ? (0, C.formatFileSize)(e.fileSizeBytes) : null, (0, v.formatDownloadedAtLabel)(e.downloadedAt), a ? "Tệp không còn" : null].filter(e => !!e),
              w = (0, I.entryDisplayTitle)(e),
              b = (0, I.unavailableReasonLabel)(r?.reason),
              x = L === e.id;
            return (0, t.jsxs)("div", {
              className: "flex items-center gap-3 px-3 py-2",
              children: [(0, t.jsxs)("div", {
                className: (0, C.cn)("flex min-w-0 flex-1 items-center gap-3", m && "opacity-70"),
                children: [(0, t.jsx)("div", {
                  className: "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                  children: e.thumbnail ? (0, t.jsx)("img", {
                    src: e.thumbnail,
                    alt: w,
                    className: "h-full w-full object-cover"
                  }) : (0, t.jsx)(d.Play, {
                    className: "h-4 w-4 text-muted-foreground"
                  })
                }), (0, t.jsxs)("div", {
                  className: "min-w-0 flex-1",
                  children: [(0, t.jsx)("p", {
                    className: (0, C.cn)("truncate text-xs font-semibold", a && "text-muted-foreground"),
                    children: w
                  }), (0, t.jsx)("p", {
                    className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                    children: g.length > 0 ? g.join(" · ") : e.filePath
                  })]
                })]
              }), i && b ? (0, t.jsx)(c.Badge, {
                variant: r?.reason ? R[r.reason] : "secondary",
                className: "shrink-0",
                children: b
              }) : p ? (0, t.jsx)(c.Badge, {
                variant: "success",
                className: "shrink-0",
                children: "Trong hàng chờ"
              }) : null, (0, t.jsxs)(h.Tooltip, {
                children: [(0, t.jsx)(h.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsxs)(f.Button, {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    className: "h-7 shrink-0 px-2 text-xs",
                    disabled: m,
                    onClick: () => void X(e),
                    children: [x ? (0, t.jsx)(s.Loader2, {
                      className: "h-3.5 w-3.5 animate-spin"
                    }) : (0, t.jsx)(o, {
                      className: "h-3.5 w-3.5"
                    }), "Đưa vào DichVideo"]
                  })
                }), (0, t.jsx)(h.TooltipContent, {
                  children: "Nhập video vào trang chủ xử lý"
                })]
              }), (0, t.jsxs)(h.Tooltip, {
                children: [(0, t.jsx)(h.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsx)(f.Button, {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 w-7 shrink-0 p-0",
                    disabled: a || H,
                    "aria-label": "Mở thư mục chứa file",
                    onClick: () => {
                      (0, P.revealPathInSystem)(e.filePath).catch(t => {
                        console.error("Failed to reveal download folder:", t), n.toast.error("Không thể mở thư mục chứa file", {
                          description: (0, I.entryDisplayTitle)(e)
                        })
                      })
                    },
                    children: (0, t.jsx)(l.FolderOpen, {
                      className: "h-3.5 w-3.5"
                    })
                  })
                }), (0, t.jsx)(h.TooltipContent, {
                  children: "Mở thư mục chứa file"
                })]
              }), (0, t.jsxs)(h.Tooltip, {
                children: [(0, t.jsx)(h.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsx)(f.Button, {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive",
                    disabled: H,
                    "aria-label": "Xóa video đã tải",
                    onClick: () => void K(e, a, r?.reason === "already_queued"),
                    children: F === e.id ? (0, t.jsx)(s.Loader2, {
                      className: "h-3.5 w-3.5 animate-spin"
                    }) : (0, t.jsx)(u.Trash2, {
                      className: "h-3.5 w-3.5"
                    })
                  })
                }), (0, t.jsx)(h.TooltipContent, {
                  children: "Xóa file khỏi máy và khỏi lịch sử"
                })]
              })]
            }, e.id)
          })
        })
      })]
    })
  }], 30372)
}, 27431, e => {
  e.v(e => Promise.resolve().then(() => e(68078)))
}, 70578, e => {
  e.v(t => Promise.all(["static/chunks/05-hc5mcv332i.js"].map(t => e.l(t))).then(() => t(12315)))
}]);