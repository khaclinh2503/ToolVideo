(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 65491, e => {
  "use strict";
  let t;
  var n = e.i(71645),
    r = e.i(20783),
    o = e.i(48425),
    a = e.i(30207),
    i = e.i(43476),
    c = "focusScope.autoFocusOnMount",
    s = "focusScope.autoFocusOnUnmount",
    l = {
      bubbles: !1,
      cancelable: !0
    },
    u = n.forwardRef((e, t) => {
      let {
        loop: u = !1,
        trapped: v = !1,
        onMountAutoFocus: h,
        onUnmountAutoFocus: g,
        ...y
      } = e, [b, E] = n.useState(null), w = (0, a.useCallbackRef)(h), x = (0, a.useCallbackRef)(g), C = n.useRef(null), R = (0, r.useComposedRefs)(t, e => E(e)), N = n.useRef({
        paused: !1,
        pause() {
          this.paused = !0
        },
        resume() {
          this.paused = !1
        }
      }).current;
      n.useEffect(() => {
        if (v) {
          let e = function(e) {
              if (N.paused || !b) return;
              let t = e.target;
              b.contains(t) ? C.current = t : p(C.current, {
                select: !0
              })
            },
            t = function(e) {
              if (N.paused || !b) return;
              let t = e.relatedTarget;
              null !== t && (b.contains(t) || p(C.current, {
                select: !0
              }))
            };
          document.addEventListener("focusin", e), document.addEventListener("focusout", t);
          let n = new MutationObserver(function(e) {
            if (document.activeElement === document.body)
              for (let t of e) t.removedNodes.length > 0 && p(b)
          });
          return b && n.observe(b, {
            childList: !0,
            subtree: !0
          }), () => {
            document.removeEventListener("focusin", e), document.removeEventListener("focusout", t), n.disconnect()
          }
        }
      }, [v, b, N.paused]), n.useEffect(() => {
        if (b) {
          m.add(N);
          let e = document.activeElement;
          if (!b.contains(e)) {
            let t = new CustomEvent(c, l);
            b.addEventListener(c, w), b.dispatchEvent(t), t.defaultPrevented || (function(e, {
              select: t = !1
            } = {}) {
              let n = document.activeElement;
              for (let r of e)
                if (p(r, {
                    select: t
                  }), document.activeElement !== n) return
            }(d(b).filter(e => "A" !== e.tagName), {
              select: !0
            }), document.activeElement === e && p(b))
          }
          return () => {
            b.removeEventListener(c, w), setTimeout(() => {
              let t = new CustomEvent(s, l);
              b.addEventListener(s, x), b.dispatchEvent(t), t.defaultPrevented || p(e ?? document.body, {
                select: !0
              }), b.removeEventListener(s, x), m.remove(N)
            }, 0)
          }
        }
      }, [b, w, x, N]);
      let S = n.useCallback(e => {
        if (!u && !v || N.paused) return;
        let t = "Tab" === e.key && !e.altKey && !e.ctrlKey && !e.metaKey,
          n = document.activeElement;
        if (t && n) {
          var r;
          let t, o = e.currentTarget,
            [a, i] = [f(t = d(r = o), r), f(t.reverse(), r)];
          a && i ? e.shiftKey || n !== i ? e.shiftKey && n === a && (e.preventDefault(), u && p(i, {
            select: !0
          })) : (e.preventDefault(), u && p(a, {
            select: !0
          })) : n === o && e.preventDefault()
        }
      }, [u, v, N.paused]);
      return (0, i.jsx)(o.Primitive.div, {
        tabIndex: -1,
        ...y,
        ref: R,
        onKeyDown: S
      })
    });

  function d(e) {
    let t = [],
      n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
        acceptNode: e => {
          let t = "INPUT" === e.tagName && "hidden" === e.type;
          return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        }
      });
    for (; n.nextNode();) t.push(n.currentNode);
    return t
  }

  function f(e, t) {
    for (let n of e)
      if (! function(e, {
          upTo: t
        }) {
          if ("hidden" === getComputedStyle(e).visibility) return !0;
          for (; e && (void 0 === t || e !== t);) {
            if ("none" === getComputedStyle(e).display) return !0;
            e = e.parentElement
          }
          return !1
        }(n, {
          upTo: t
        })) return n
  }

  function p(e, {
    select: t = !1
  } = {}) {
    if (e && e.focus) {
      var n;
      let r = document.activeElement;
      e.focus({
        preventScroll: !0
      }), e !== r && (n = e) instanceof HTMLInputElement && "select" in n && t && e.select()
    }
  }
  u.displayName = "FocusScope";
  var m = (t = [], {
    add(e) {
      let n = t[0];
      e !== n && n?.pause(), (t = v(t, e)).unshift(e)
    },
    remove(e) {
      t = v(t, e), t[0]?.resume()
    }
  });

  function v(e, t) {
    let n = [...e],
      r = n.indexOf(t);
    return -1 !== r && n.splice(r, 1), n
  }
  e.s(["FocusScope", 0, u])
}, 3536, e => {
  "use strict";
  var t = e.i(71645),
    n = 0,
    r = null;

  function o() {
    let e = document.createElement("span");
    return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e
  }
  e.s(["useFocusGuards", 0, function() {
    t.useEffect(() => {
      r || (r = {
        start: o(),
        end: o()
      });
      let {
        start: e,
        end: t
      } = r;
      return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== t && document.body.insertAdjacentElement("beforeend", t), n++, () => {
        1 === n && (r?.start.remove(), r?.end.remove(), r = null), n = Math.max(0, n - 1)
      }
    }, [])
  }])
}, 85369, e => {
  "use strict";
  var t, n, r, o, a, i, c, s = e.i(90571),
    l = e.i(71645),
    u = "right-scroll-bar-position",
    d = "width-before-scroll-bar";

  function f(e, t) {
    return "function" == typeof e ? e(t) : e && (e.current = t), e
  }
  var p = "u" > typeof window ? l.useLayoutEffect : l.useEffect,
    m = new WeakMap,
    v = (void 0 === t && (t = {}), (void 0 === n && (n = function(e) {
      return e
    }), r = [], o = !1, a = {
      read: function() {
        if (o) throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
        return r.length ? r[r.length - 1] : null
      },
      useMedium: function(e) {
        var t = n(e, o);
        return r.push(t),
          function() {
            r = r.filter(function(e) {
              return e !== t
            })
          }
      },
      assignSyncMedium: function(e) {
        for (o = !0; r.length;) {
          var t = r;
          r = [], t.forEach(e)
        }
        r = {
          push: function(t) {
            return e(t)
          },
          filter: function() {
            return r
          }
        }
      },
      assignMedium: function(e) {
        o = !0;
        var t = [];
        if (r.length) {
          var n = r;
          r = [], n.forEach(e), t = r
        }
        var a = function() {
            var n = t;
            t = [], n.forEach(e)
          },
          i = function() {
            return Promise.resolve().then(a)
          };
        i(), r = {
          push: function(e) {
            t.push(e), i()
          },
          filter: function(e) {
            return t = t.filter(e), r
          }
        }
      }
    }).options = (0, s.__assign)({
      async: !0,
      ssr: !1
    }, t), a),
    h = function() {},
    g = l.forwardRef(function(e, t) {
      var n, r, o, a, i = l.useRef(null),
        c = l.useState({
          onScrollCapture: h,
          onWheelCapture: h,
          onTouchMoveCapture: h
        }),
        u = c[0],
        d = c[1],
        g = e.forwardProps,
        y = e.children,
        b = e.className,
        E = e.removeScrollBar,
        w = e.enabled,
        x = e.shards,
        C = e.sideCar,
        R = e.noRelative,
        N = e.noIsolation,
        S = e.inert,
        D = e.allowPinchZoom,
        _ = e.as,
        k = e.gapMode,
        T = (0, s.__rest)(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]),
        P = (n = [i, t], r = function(e) {
          return n.forEach(function(t) {
            return f(t, e)
          })
        }, (o = (0, l.useState)(function() {
          return {
            value: null,
            callback: r,
            facade: {
              get current() {
                return o.value
              },
              set current(value) {
                var e = o.value;
                e !== value && (o.value = value, o.callback(value, e))
              }
            }
          }
        })[0]).callback = r, a = o.facade, p(function() {
          var e = m.get(a);
          if (e) {
            var t = new Set(e),
              r = new Set(n),
              o = a.current;
            t.forEach(function(e) {
              r.has(e) || f(e, null)
            }), r.forEach(function(e) {
              t.has(e) || f(e, o)
            })
          }
          m.set(a, n)
        }, [n]), a),
        A = (0, s.__assign)((0, s.__assign)({}, T), u);
      return l.createElement(l.Fragment, null, w && l.createElement(C, {
        sideCar: v,
        removeScrollBar: E,
        shards: x,
        noRelative: R,
        noIsolation: N,
        inert: S,
        setCallbacks: d,
        allowPinchZoom: !!D,
        lockRef: i,
        gapMode: k
      }), g ? l.cloneElement(l.Children.only(y), (0, s.__assign)((0, s.__assign)({}, A), {
        ref: P
      })) : l.createElement(void 0 === _ ? "div" : _, (0, s.__assign)({}, A, {
        className: b,
        ref: P
      }), y))
    });
  g.defaultProps = {
    enabled: !0,
    removeScrollBar: !0,
    inert: !1
  }, g.classNames = {
    fullWidth: d,
    zeroRight: u
  };
  var y = function(e) {
    var t = e.sideCar,
      n = (0, s.__rest)(e, ["sideCar"]);
    if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
    var r = t.read();
    if (!r) throw Error("Sidecar medium not found");
    return l.createElement(r, (0, s.__assign)({}, n))
  };
  y.isSideCarExport = !0;
  var b = function() {
      var e = 0,
        t = null;
      return {
        add: function(n) {
          if (0 == e && (t = function() {
              if (!document) return null;
              var e = document.createElement("style");
              e.type = "text/css";
              var t = c || ("u" > typeof __webpack_nonce__ ? __webpack_nonce__ : void 0);
              return t && e.setAttribute("nonce", t), e
            }())) {
            var r, o;
            (r = t).styleSheet ? r.styleSheet.cssText = n : r.appendChild(document.createTextNode(n)), o = t, (document.head || document.getElementsByTagName("head")[0]).appendChild(o)
          }
          e++
        },
        remove: function() {
          --e || !t || (t.parentNode && t.parentNode.removeChild(t), t = null)
        }
      }
    },
    E = function() {
      var e = b();
      return function(t, n) {
        l.useEffect(function() {
          return e.add(t),
            function() {
              e.remove()
            }
        }, [t && n])
      }
    },
    w = function() {
      var e = E();
      return function(t) {
        return e(t.styles, t.dynamic), null
      }
    },
    x = {
      left: 0,
      top: 0,
      right: 0,
      gap: 0
    },
    C = function(e) {
      return parseInt(e || "", 10) || 0
    },
    R = function(e) {
      var t = window.getComputedStyle(document.body),
        n = t["padding" === e ? "paddingLeft" : "marginLeft"],
        r = t["padding" === e ? "paddingTop" : "marginTop"],
        o = t["padding" === e ? "paddingRight" : "marginRight"];
      return [C(n), C(r), C(o)]
    },
    N = function(e) {
      if (void 0 === e && (e = "margin"), "u" < typeof window) return x;
      var t = R(e),
        n = document.documentElement.clientWidth,
        r = window.innerWidth;
      return {
        left: t[0],
        top: t[1],
        right: t[2],
        gap: Math.max(0, r - n + t[2] - t[0])
      }
    },
    S = w(),
    D = "data-scroll-locked",
    _ = function(e, t, n, r) {
      var o = e.left,
        a = e.top,
        i = e.right,
        c = e.gap;
      return void 0 === n && (n = "margin"), "\n  .".concat("with-scroll-bars-hidden", " {\n   overflow: hidden ").concat(r, ";\n   padding-right: ").concat(c, "px ").concat(r, ";\n  }\n  body[").concat(D, "] {\n    overflow: hidden ").concat(r, ";\n    overscroll-behavior: contain;\n    ").concat([t && "position: relative ".concat(r, ";"), "margin" === n && "\n    padding-left: ".concat(o, "px;\n    padding-top: ").concat(a, "px;\n    padding-right: ").concat(i, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(c, "px ").concat(r, ";\n    "), "padding" === n && "padding-right: ".concat(c, "px ").concat(r, ";")].filter(Boolean).join(""), "\n  }\n  \n  .").concat(u, " {\n    right: ").concat(c, "px ").concat(r, ";\n  }\n  \n  .").concat(d, " {\n    margin-right: ").concat(c, "px ").concat(r, ";\n  }\n  \n  .").concat(u, " .").concat(u, " {\n    right: 0 ").concat(r, ";\n  }\n  \n  .").concat(d, " .").concat(d, " {\n    margin-right: 0 ").concat(r, ";\n  }\n  \n  body[").concat(D, "] {\n    ").concat("--removed-body-scroll-bar-size", ": ").concat(c, "px;\n  }\n")
    },
    k = function() {
      var e = parseInt(document.body.getAttribute(D) || "0", 10);
      return isFinite(e) ? e : 0
    },
    T = function() {
      l.useEffect(function() {
        return document.body.setAttribute(D, (k() + 1).toString()),
          function() {
            var e = k() - 1;
            e <= 0 ? document.body.removeAttribute(D) : document.body.setAttribute(D, e.toString())
          }
      }, [])
    },
    P = function(e) {
      var t = e.noRelative,
        n = e.noImportant,
        r = e.gapMode,
        o = void 0 === r ? "margin" : r;
      T();
      var a = l.useMemo(function() {
        return N(o)
      }, [o]);
      return l.createElement(S, {
        styles: _(a, !t, o, n ? "" : "!important")
      })
    },
    A = !1;
  if ("u" > typeof window) try {
    var j = Object.defineProperty({}, "passive", {
      get: function() {
        return A = !0, !0
      }
    });
    window.addEventListener("test", j, j), window.removeEventListener("test", j, j)
  } catch (e) {
    A = !1
  }
  var M = !!A && {
      passive: !1
    },
    F = function(e, t) {
      if (!(e instanceof Element)) return !1;
      var n = window.getComputedStyle(e);
      return "hidden" !== n[t] && (n.overflowY !== n.overflowX || "TEXTAREA" === e.tagName || "visible" !== n[t])
    },
    L = function(e, t) {
      var n = t.ownerDocument,
        r = t;
      do {
        if ("u" > typeof ShadowRoot && r instanceof ShadowRoot && (r = r.host), I(e, r)) {
          var o = O(e, r);
          if (o[1] > o[2]) return !0
        }
        r = r.parentNode
      } while (r && r !== n.body) return !1
    },
    I = function(e, t) {
      return "v" === e ? F(t, "overflowY") : F(t, "overflowX")
    },
    O = function(e, t) {
      return "v" === e ? [t.scrollTop, t.scrollHeight, t.clientHeight] : [t.scrollLeft, t.scrollWidth, t.clientWidth]
    },
    W = function(e, t, n, r, o) {
      var a, i = (a = window.getComputedStyle(t).direction, "h" === e && "rtl" === a ? -1 : 1),
        c = i * r,
        s = n.target,
        l = t.contains(s),
        u = !1,
        d = c > 0,
        f = 0,
        p = 0;
      do {
        if (!s) break;
        var m = O(e, s),
          v = m[0],
          h = m[1] - m[2] - i * v;
        (v || h) && I(e, s) && (f += h, p += v);
        var g = s.parentNode;
        s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g
      } while (!l && s !== document.body || l && (t.contains(s) || t === s)) return d && (o && 1 > Math.abs(f) || !o && c > f) ? u = !0 : !d && (o && 1 > Math.abs(p) || !o && -c > p) && (u = !0), u
    },
    K = function(e) {
      return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0]
    },
    B = function(e) {
      return [e.deltaX, e.deltaY]
    },
    H = function(e) {
      return e && "current" in e ? e.current : e
    },
    X = 0,
    U = [];
  let Y = (i = function(e) {
    var t = l.useRef([]),
      n = l.useRef([0, 0]),
      r = l.useRef(),
      o = l.useState(X++)[0],
      a = l.useState(w)[0],
      i = l.useRef(e);
    l.useEffect(function() {
      i.current = e
    }, [e]), l.useEffect(function() {
      if (e.inert) {
        document.body.classList.add("block-interactivity-".concat(o));
        var t = (0, s.__spreadArray)([e.lockRef.current], (e.shards || []).map(H), !0).filter(Boolean);
        return t.forEach(function(e) {
            return e.classList.add("allow-interactivity-".concat(o))
          }),
          function() {
            document.body.classList.remove("block-interactivity-".concat(o)), t.forEach(function(e) {
              return e.classList.remove("allow-interactivity-".concat(o))
            })
          }
      }
    }, [e.inert, e.lockRef.current, e.shards]);
    var c = l.useCallback(function(e, t) {
        if ("touches" in e && 2 === e.touches.length || "wheel" === e.type && e.ctrlKey) return !i.current.allowPinchZoom;
        var o, a = K(e),
          c = n.current,
          s = "deltaX" in e ? e.deltaX : c[0] - a[0],
          l = "deltaY" in e ? e.deltaY : c[1] - a[1],
          u = e.target,
          d = Math.abs(s) > Math.abs(l) ? "h" : "v";
        if ("touches" in e && "h" === d && "range" === u.type) return !1;
        var f = window.getSelection(),
          p = f && f.anchorNode;
        if (p && (p === u || p.contains(u))) return !1;
        var m = L(d, u);
        if (!m) return !0;
        if (m ? o = d : (o = "v" === d ? "h" : "v", m = L(d, u)), !m) return !1;
        if (!r.current && "changedTouches" in e && (s || l) && (r.current = o), !o) return !0;
        var v = r.current || o;
        return W(v, t, e, "h" === v ? s : l, !0)
      }, []),
      u = l.useCallback(function(e) {
        if (U.length && U[U.length - 1] === a) {
          var n = "deltaY" in e ? B(e) : K(e),
            r = t.current.filter(function(t) {
              var r;
              return t.name === e.type && (t.target === e.target || e.target === t.shadowParent) && (r = t.delta, r[0] === n[0] && r[1] === n[1])
            })[0];
          if (r && r.should) {
            e.cancelable && e.preventDefault();
            return
          }
          if (!r) {
            var o = (i.current.shards || []).map(H).filter(Boolean).filter(function(t) {
              return t.contains(e.target)
            });
            (o.length > 0 ? c(e, o[0]) : !i.current.noIsolation) && e.cancelable && e.preventDefault()
          }
        }
      }, []),
      d = l.useCallback(function(e, n, r, o) {
        var a = {
          name: e,
          delta: n,
          target: r,
          should: o,
          shadowParent: function(e) {
            for (var t = null; null !== e;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
            return t
          }(r)
        };
        t.current.push(a), setTimeout(function() {
          t.current = t.current.filter(function(e) {
            return e !== a
          })
        }, 1)
      }, []),
      f = l.useCallback(function(e) {
        n.current = K(e), r.current = void 0
      }, []),
      p = l.useCallback(function(t) {
        d(t.type, B(t), t.target, c(t, e.lockRef.current))
      }, []),
      m = l.useCallback(function(t) {
        d(t.type, K(t), t.target, c(t, e.lockRef.current))
      }, []);
    l.useEffect(function() {
      return U.push(a), e.setCallbacks({
          onScrollCapture: p,
          onWheelCapture: p,
          onTouchMoveCapture: m
        }), document.addEventListener("wheel", u, M), document.addEventListener("touchmove", u, M), document.addEventListener("touchstart", f, M),
        function() {
          U = U.filter(function(e) {
            return e !== a
          }), document.removeEventListener("wheel", u, M), document.removeEventListener("touchmove", u, M), document.removeEventListener("touchstart", f, M)
        }
    }, []);
    var v = e.removeScrollBar,
      h = e.inert;
    return l.createElement(l.Fragment, null, h ? l.createElement(a, {
      styles: "\n  .block-interactivity-".concat(o, " {pointer-events: none;}\n  .allow-interactivity-").concat(o, " {pointer-events: all;}\n")
    }) : null, v ? l.createElement(P, {
      noRelative: e.noRelative,
      gapMode: e.gapMode
    }) : null)
  }, v.useMedium(i), y);
  var z = l.forwardRef(function(e, t) {
    return l.createElement(g, (0, s.__assign)({}, e, {
      ref: t,
      sideCar: Y
    }))
  });
  z.classNames = g.classNames, e.s(["RemoveScroll", 0, z], 85369)
}, 86312, e => {
  "use strict";
  var t = new WeakMap,
    n = new WeakMap,
    r = {},
    o = 0,
    a = function(e) {
      return e && (e.host || a(e.parentNode))
    },
    i = function(e, i, c, s) {
      var l = (Array.isArray(e) ? e : [e]).map(function(e) {
        if (i.contains(e)) return e;
        var t = a(e);
        return t && i.contains(t) ? t : (console.error("aria-hidden", e, "in not contained inside", i, ". Doing nothing"), null)
      }).filter(function(e) {
        return !!e
      });
      r[c] || (r[c] = new WeakMap);
      var u = r[c],
        d = [],
        f = new Set,
        p = new Set(l),
        m = function(e) {
          !e || f.has(e) || (f.add(e), m(e.parentNode))
        };
      l.forEach(m);
      var v = function(e) {
        !e || p.has(e) || Array.prototype.forEach.call(e.children, function(e) {
          if (f.has(e)) v(e);
          else try {
            var r = e.getAttribute(s),
              o = null !== r && "false" !== r,
              a = (t.get(e) || 0) + 1,
              i = (u.get(e) || 0) + 1;
            t.set(e, a), u.set(e, i), d.push(e), 1 === a && o && n.set(e, !0), 1 === i && e.setAttribute(c, "true"), o || e.setAttribute(s, "true")
          } catch (t) {
            console.error("aria-hidden: cannot operate on ", e, t)
          }
        })
      };
      return v(i), f.clear(), o++,
        function() {
          d.forEach(function(e) {
            var r = t.get(e) - 1,
              o = u.get(e) - 1;
            t.set(e, r), u.set(e, o), r || (n.has(e) || e.removeAttribute(s), n.delete(e)), o || e.removeAttribute(c)
          }), --o || (t = new WeakMap, t = new WeakMap, n = new WeakMap, r = {})
        }
    };
  e.s(["hideOthers", 0, function(e, t, n) {
    void 0 === n && (n = "data-aria-hidden");
    var r = Array.from(Array.isArray(e) ? e : [e]),
      o = t || ("u" < typeof document ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body);
    return o ? (r.push.apply(r, Array.from(o.querySelectorAll("[aria-live], script"))), i(r, o, n, "aria-hidden")) : function() {
      return null
    }
  }])
}, 76639, 26999, e => {
  "use strict";
  var t = e.i(43476),
    n = e.i(71645),
    r = e.i(81140),
    o = e.i(20783),
    a = e.i(30030),
    i = e.i(10772),
    c = e.i(69340),
    s = e.i(26330),
    l = e.i(65491),
    u = e.i(74606),
    d = e.i(96626),
    f = e.i(48425),
    p = e.i(3536),
    m = e.i(85369),
    v = e.i(86312),
    h = e.i(91918),
    g = "Dialog",
    [y, b] = (0, a.createContextScope)(g),
    [E, w] = y(g),
    x = e => {
      let {
        __scopeDialog: r,
        children: o,
        open: a,
        defaultOpen: s,
        onOpenChange: l,
        modal: u = !0
      } = e, d = n.useRef(null), f = n.useRef(null), [p, m] = (0, c.useControllableState)({
        prop: a,
        defaultProp: s ?? !1,
        onChange: l,
        caller: g
      });
      return (0, t.jsx)(E, {
        scope: r,
        triggerRef: d,
        contentRef: f,
        contentId: (0, i.useId)(),
        titleId: (0, i.useId)(),
        descriptionId: (0, i.useId)(),
        open: p,
        onOpenChange: m,
        onOpenToggle: n.useCallback(() => m(e => !e), [m]),
        modal: u,
        children: o
      })
    };
  x.displayName = g;
  var C = "DialogTrigger",
    R = n.forwardRef((e, n) => {
      let {
        __scopeDialog: a,
        ...i
      } = e, c = w(C, a), s = (0, o.useComposedRefs)(n, c.triggerRef);
      return (0, t.jsx)(f.Primitive.button, {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": c.open,
        "aria-controls": c.open ? c.contentId : void 0,
        "data-state": U(c.open),
        ...i,
        ref: s,
        onClick: (0, r.composeEventHandlers)(e.onClick, c.onOpenToggle)
      })
    });
  R.displayName = C;
  var N = "DialogPortal",
    [S, D] = y(N, {
      forceMount: void 0
    }),
    _ = e => {
      let {
        __scopeDialog: r,
        forceMount: o,
        children: a,
        container: i
      } = e, c = w(N, r);
      return (0, t.jsx)(S, {
        scope: r,
        forceMount: o,
        children: n.Children.map(a, e => (0, t.jsx)(d.Presence, {
          present: o || c.open,
          children: (0, t.jsx)(u.Portal, {
            asChild: !0,
            container: i,
            children: e
          })
        }))
      })
    };
  _.displayName = N;
  var k = "DialogOverlay",
    T = n.forwardRef((e, n) => {
      let r = D(k, e.__scopeDialog),
        {
          forceMount: o = r.forceMount,
          ...a
        } = e,
        i = w(k, e.__scopeDialog);
      return i.modal ? (0, t.jsx)(d.Presence, {
        present: o || i.open,
        children: (0, t.jsx)(A, {
          ...a,
          ref: n
        })
      }) : null
    });
  T.displayName = k;
  var P = (0, h.createSlot)("DialogOverlay.RemoveScroll"),
    A = n.forwardRef((e, n) => {
      let {
        __scopeDialog: r,
        ...a
      } = e, i = w(k, r), c = (0, s.useDismissableLayerSurface)(), l = (0, o.useComposedRefs)(n, c);
      return (0, t.jsx)(m.RemoveScroll, {
        as: P,
        allowPinchZoom: !0,
        shards: [i.contentRef],
        children: (0, t.jsx)(f.Primitive.div, {
          "data-state": U(i.open),
          ...a,
          ref: l,
          style: {
            pointerEvents: "auto",
            ...a.style
          }
        })
      })
    }),
    j = "DialogContent",
    M = n.forwardRef((e, n) => {
      let r = D(j, e.__scopeDialog),
        {
          forceMount: o = r.forceMount,
          ...a
        } = e,
        i = w(j, e.__scopeDialog);
      return (0, t.jsx)(d.Presence, {
        present: o || i.open,
        children: i.modal ? (0, t.jsx)(F, {
          ...a,
          ref: n
        }) : (0, t.jsx)(L, {
          ...a,
          ref: n
        })
      })
    });
  M.displayName = j;
  var F = n.forwardRef((e, a) => {
      let i = w(j, e.__scopeDialog),
        c = n.useRef(null),
        s = (0, o.useComposedRefs)(a, i.contentRef, c);
      return n.useEffect(() => {
        let e = c.current;
        if (e) return (0, v.hideOthers)(e)
      }, []), (0, t.jsx)(I, {
        ...e,
        ref: s,
        trapFocus: i.open,
        disableOutsidePointerEvents: i.open,
        onCloseAutoFocus: (0, r.composeEventHandlers)(e.onCloseAutoFocus, e => {
          e.preventDefault(), i.triggerRef.current?.focus()
        }),
        onPointerDownOutside: (0, r.composeEventHandlers)(e.onPointerDownOutside, e => {
          let t = e.detail.originalEvent,
            n = 0 === t.button && !0 === t.ctrlKey;
          (2 === t.button || n) && e.preventDefault()
        }),
        onFocusOutside: (0, r.composeEventHandlers)(e.onFocusOutside, e => e.preventDefault())
      })
    }),
    L = n.forwardRef((e, r) => {
      let o = w(j, e.__scopeDialog),
        a = n.useRef(!1),
        i = n.useRef(!1);
      return (0, t.jsx)(I, {
        ...e,
        ref: r,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: t => {
          e.onCloseAutoFocus?.(t), t.defaultPrevented || (a.current || o.triggerRef.current?.focus(), t.preventDefault()), a.current = !1, i.current = !1
        },
        onInteractOutside: t => {
          e.onInteractOutside?.(t), t.defaultPrevented || (a.current = !0, "pointerdown" === t.detail.originalEvent.type && (i.current = !0));
          let n = t.target;
          o.triggerRef.current?.contains(n) && t.preventDefault(), "focusin" === t.detail.originalEvent.type && i.current && t.preventDefault()
        }
      })
    }),
    I = n.forwardRef((e, n) => {
      let {
        __scopeDialog: r,
        trapFocus: o,
        onOpenAutoFocus: a,
        onCloseAutoFocus: i,
        ...c
      } = e, u = w(j, r);
      return (0, p.useFocusGuards)(), (0, t.jsx)(t.Fragment, {
        children: (0, t.jsx)(l.FocusScope, {
          asChild: !0,
          loop: !0,
          trapped: o,
          onMountAutoFocus: a,
          onUnmountAutoFocus: i,
          children: (0, t.jsx)(s.DismissableLayer, {
            role: "dialog",
            id: u.contentId,
            "aria-describedby": u.descriptionId,
            "aria-labelledby": u.titleId,
            "data-state": U(u.open),
            ...c,
            ref: n,
            deferPointerDownOutside: !0,
            onDismiss: () => u.onOpenChange(!1)
          })
        })
      })
    }),
    O = "DialogTitle",
    W = n.forwardRef((e, n) => {
      let {
        __scopeDialog: r,
        ...o
      } = e, a = w(O, r);
      return (0, t.jsx)(f.Primitive.h2, {
        id: a.titleId,
        ...o,
        ref: n
      })
    });
  W.displayName = O;
  var K = "DialogDescription",
    B = n.forwardRef((e, n) => {
      let {
        __scopeDialog: r,
        ...o
      } = e, a = w(K, r);
      return (0, t.jsx)(f.Primitive.p, {
        id: a.descriptionId,
        ...o,
        ref: n
      })
    });
  B.displayName = K;
  var H = "DialogClose",
    X = n.forwardRef((e, n) => {
      let {
        __scopeDialog: o,
        ...a
      } = e, i = w(H, o);
      return (0, t.jsx)(f.Primitive.button, {
        type: "button",
        ...a,
        ref: n,
        onClick: (0, r.composeEventHandlers)(e.onClick, () => i.onOpenChange(!1))
      })
    });

  function U(e) {
    return e ? "open" : "closed"
  }
  X.displayName = H, e.s(["Close", 0, X, "Content", 0, M, "Description", 0, B, "Overlay", 0, T, "Portal", 0, _, "Root", 0, x, "Title", 0, W, "Trigger", 0, R], 26999);
  var Y = e.i(63676),
    z = e.i(75157);
  let Z = n.forwardRef(({
    className: e,
    ...n
  }, r) => (0, t.jsx)(T, {
    ref: r,
    className: (0, z.cn)("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", e),
    ...n
  }));
  Z.displayName = T.displayName;
  let G = n.forwardRef(({
    className: e,
    hideCloseButton: n,
    children: r,
    ...o
  }, a) => (0, t.jsxs)(_, {
    children: [(0, t.jsx)(Z, {}), (0, t.jsxs)(M, {
      ref: a,
      className: (0, z.cn)("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl", e),
      ...o,
      children: [r, n ? null : (0, t.jsxs)(X, {
        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        children: [(0, t.jsx)(Y.X, {
          className: "h-4 w-4"
        }), (0, t.jsx)("span", {
          className: "sr-only",
          children: "Đóng"
        })]
      })]
    })]
  }));
  G.displayName = M.displayName;
  let q = ({
    className: e,
    ...n
  }) => (0, t.jsx)("div", {
    className: (0, z.cn)("flex flex-col space-y-1.5 text-center sm:text-left", e),
    ...n
  });
  q.displayName = "DialogHeader";
  let J = ({
    className: e,
    ...n
  }) => (0, t.jsx)("div", {
    className: (0, z.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", e),
    ...n
  });
  J.displayName = "DialogFooter";
  let Q = n.forwardRef(({
    className: e,
    ...n
  }, r) => (0, t.jsx)(W, {
    ref: r,
    className: (0, z.cn)("text-lg font-semibold leading-none tracking-tight", e),
    ...n
  }));
  Q.displayName = W.displayName;
  let V = n.forwardRef(({
    className: e,
    ...n
  }, r) => (0, t.jsx)(B, {
    ref: r,
    className: (0, z.cn)("text-sm text-muted-foreground", e),
    ...n
  }));
  V.displayName = B.displayName, e.s(["Dialog", 0, x, "DialogContent", 0, G, "DialogDescription", 0, V, "DialogFooter", 0, J, "DialogHeader", 0, q, "DialogTitle", 0, Q, "DialogTrigger", 0, R], 76639)
}]);