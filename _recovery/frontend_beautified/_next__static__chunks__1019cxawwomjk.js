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
}, 59684, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    o = e.i(48425),
    a = e.i(96626),
    n = e.i(30030),
    i = e.i(20783),
    l = e.i(30207),
    s = e.i(86318),
    c = e.i(34620),
    d = e.i(70152),
    u = e.i(81140),
    p = "ScrollArea",
    [f, h] = (0, n.createContextScope)(p),
    [v, m] = f(p),
    g = r.forwardRef((e, a) => {
      let {
        __scopeScrollArea: n,
        type: l = "hover",
        dir: c,
        scrollHideDelay: d = 600,
        ...u
      } = e, [p, f] = r.useState(null), [h, m] = r.useState(null), [g, w] = r.useState(null), [b, x] = r.useState(null), [y, P] = r.useState(null), [C, S] = r.useState(0), [R, k] = r.useState(0), [j, E] = r.useState(!1), [T, N] = r.useState(!1), A = (0, i.useComposedRefs)(a, e => f(e)), L = (0, s.useDirection)(c);
      return (0, t.jsx)(v, {
        scope: n,
        type: l,
        dir: L,
        scrollHideDelay: d,
        scrollArea: p,
        viewport: h,
        onViewportChange: m,
        content: g,
        onContentChange: w,
        scrollbarX: b,
        onScrollbarXChange: x,
        scrollbarXEnabled: j,
        onScrollbarXEnabledChange: E,
        scrollbarY: y,
        onScrollbarYChange: P,
        scrollbarYEnabled: T,
        onScrollbarYEnabledChange: N,
        onCornerWidthChange: S,
        onCornerHeightChange: k,
        children: (0, t.jsx)(o.Primitive.div, {
          dir: L,
          ...u,
          ref: A,
          style: {
            position: "relative",
            "--radix-scroll-area-corner-width": C + "px",
            "--radix-scroll-area-corner-height": R + "px",
            ...e.style
          }
        })
      })
    });
  g.displayName = p;
  var w = "ScrollAreaViewport",
    b = r.forwardRef((e, a) => {
      let {
        __scopeScrollArea: n,
        children: l,
        nonce: s,
        ...c
      } = e, d = m(w, n), u = r.useRef(null), p = (0, i.useComposedRefs)(a, u, d.onViewportChange);
      return (0, t.jsxs)(t.Fragment, {
        children: [(0, t.jsx)(x, {
          nonce: s
        }), (0, t.jsx)(o.Primitive.div, {
          "data-radix-scroll-area-viewport": "",
          ...c,
          ref: p,
          style: {
            overflowX: d.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: d.scrollbarYEnabled ? "scroll" : "hidden",
            ...e.style
          },
          children: (0, t.jsx)("div", {
            ref: d.onContentChange,
            style: {
              minWidth: "100%",
              display: "table"
            },
            children: l
          })
        })]
      })
    });
  b.displayName = w;
  var x = r.memo(({
      nonce: e
    }) => (0, t.jsx)("style", {
      dangerouslySetInnerHTML: {
        __html: "[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}"
      },
      nonce: e
    }), (e, t) => e.nonce === t.nonce),
    y = "ScrollAreaScrollbar",
    P = r.forwardRef((e, o) => {
      let {
        forceMount: a,
        ...n
      } = e, i = m(y, e.__scopeScrollArea), {
        onScrollbarXEnabledChange: l,
        onScrollbarYEnabledChange: s
      } = i, c = "horizontal" === e.orientation;
      return r.useEffect(() => (c ? l(!0) : s(!0), () => {
        c ? l(!1) : s(!1)
      }), [c, l, s]), "hover" === i.type ? (0, t.jsx)(C, {
        ...n,
        ref: o,
        forceMount: a
      }) : "scroll" === i.type ? (0, t.jsx)(S, {
        ...n,
        ref: o,
        forceMount: a
      }) : "auto" === i.type ? (0, t.jsx)(R, {
        ...n,
        ref: o,
        forceMount: a
      }) : "always" === i.type ? (0, t.jsx)(k, {
        ...n,
        ref: o,
        "data-state": "visible"
      }) : null
    });
  P.displayName = y;
  var C = r.forwardRef((e, o) => {
      let {
        forceMount: n,
        ...i
      } = e, l = m(y, e.__scopeScrollArea), [s, c] = r.useState(!1);
      return r.useEffect(() => {
        let e = l.scrollArea,
          t = 0;
        if (e) {
          let r = () => {
              window.clearTimeout(t), c(!0)
            },
            o = () => {
              t = window.setTimeout(() => c(!1), l.scrollHideDelay)
            };
          return e.addEventListener("pointerenter", r), e.addEventListener("pointerleave", o), () => {
            window.clearTimeout(t), e.removeEventListener("pointerenter", r), e.removeEventListener("pointerleave", o)
          }
        }
      }, [l.scrollArea, l.scrollHideDelay]), (0, t.jsx)(a.Presence, {
        present: n || s,
        children: (0, t.jsx)(R, {
          "data-state": s ? "visible" : "hidden",
          ...i,
          ref: o
        })
      })
    }),
    S = r.forwardRef((e, o) => {
      var n;
      let {
        forceMount: i,
        ...l
      } = e, s = m(y, e.__scopeScrollArea), c = "horizontal" === e.orientation, d = X(() => f("SCROLL_END"), 100), [p, f] = (n = {
        hidden: {
          SCROLL: "scrolling"
        },
        scrolling: {
          SCROLL_END: "idle",
          POINTER_ENTER: "interacting"
        },
        interacting: {
          SCROLL: "interacting",
          POINTER_LEAVE: "idle"
        },
        idle: {
          HIDE: "hidden",
          SCROLL: "scrolling",
          POINTER_ENTER: "interacting"
        }
      }, r.useReducer((e, t) => n[e][t] ?? e, "hidden"));
      return r.useEffect(() => {
        if ("idle" === p) {
          let e = window.setTimeout(() => f("HIDE"), s.scrollHideDelay);
          return () => window.clearTimeout(e)
        }
      }, [p, s.scrollHideDelay, f]), r.useEffect(() => {
        let e = s.viewport,
          t = c ? "scrollLeft" : "scrollTop";
        if (e) {
          let r = e[t],
            o = () => {
              let o = e[t];
              r !== o && (f("SCROLL"), d()), r = o
            };
          return e.addEventListener("scroll", o), () => e.removeEventListener("scroll", o)
        }
      }, [s.viewport, c, f, d]), (0, t.jsx)(a.Presence, {
        present: i || "hidden" !== p,
        children: (0, t.jsx)(k, {
          "data-state": "hidden" === p ? "hidden" : "visible",
          ...l,
          ref: o,
          onPointerEnter: (0, u.composeEventHandlers)(e.onPointerEnter, () => f("POINTER_ENTER")),
          onPointerLeave: (0, u.composeEventHandlers)(e.onPointerLeave, () => f("POINTER_LEAVE"))
        })
      })
    }),
    R = r.forwardRef((e, o) => {
      let n = m(y, e.__scopeScrollArea),
        {
          forceMount: i,
          ...l
        } = e,
        [s, c] = r.useState(!1),
        d = "horizontal" === e.orientation,
        u = X(() => {
          if (n.viewport) {
            let e = n.viewport.offsetWidth < n.viewport.scrollWidth,
              t = n.viewport.offsetHeight < n.viewport.scrollHeight;
            c(d ? e : t)
          }
        }, 10);
      return U(n.viewport, u), U(n.content, u), (0, t.jsx)(a.Presence, {
        present: i || s,
        children: (0, t.jsx)(k, {
          "data-state": s ? "visible" : "hidden",
          ...l,
          ref: o
        })
      })
    }),
    k = r.forwardRef((e, o) => {
      let {
        orientation: a = "vertical",
        ...n
      } = e, i = m(y, e.__scopeScrollArea), l = r.useRef(null), s = r.useRef(0), [c, d] = r.useState({
        content: 0,
        viewport: 0,
        scrollbar: {
          size: 0,
          paddingStart: 0,
          paddingEnd: 0
        }
      }), u = F(c.viewport, c.content), p = {
        ...n,
        sizes: c,
        onSizesChange: d,
        hasThumb: !!(u > 0 && u < 1),
        onThumbChange: e => l.current = e,
        onThumbPointerUp: () => s.current = 0,
        onThumbPointerDown: e => s.current = e
      };

      function f(e, t) {
        return function(e, t, r, o = "ltr") {
          let a = I(r),
            n = t || a / 2,
            i = r.scrollbar.paddingStart + n,
            l = r.scrollbar.size - r.scrollbar.paddingEnd - (a - n),
            s = r.content - r.viewport;
          return B([i, l], "ltr" === o ? [0, s] : [-1 * s, 0])(e)
        }(e, s.current, c, t)
      }
      return "horizontal" === a ? (0, t.jsx)(j, {
        ...p,
        ref: o,
        onThumbPositionChange: () => {
          if (i.viewport && l.current) {
            let e = V(i.viewport.scrollLeft, c, i.dir);
            l.current.style.transform = `translate3d(${e}px, 0, 0)`
          }
        },
        onWheelScroll: e => {
          i.viewport && (i.viewport.scrollLeft = e)
        },
        onDragScroll: e => {
          i.viewport && (i.viewport.scrollLeft = f(e, i.dir))
        }
      }) : "vertical" === a ? (0, t.jsx)(E, {
        ...p,
        ref: o,
        onThumbPositionChange: () => {
          if (i.viewport && l.current) {
            let e = V(i.viewport.scrollTop, c);
            l.current.style.transform = `translate3d(0, ${e}px, 0)`
          }
        },
        onWheelScroll: e => {
          i.viewport && (i.viewport.scrollTop = e)
        },
        onDragScroll: e => {
          i.viewport && (i.viewport.scrollTop = f(e))
        }
      }) : null
    }),
    j = r.forwardRef((e, o) => {
      let {
        sizes: a,
        onSizesChange: n,
        ...l
      } = e, s = m(y, e.__scopeScrollArea), [c, d] = r.useState(), u = r.useRef(null), p = (0, i.useComposedRefs)(o, u, s.onScrollbarXChange);
      return r.useEffect(() => {
        u.current && d(getComputedStyle(u.current))
      }, [u]), (0, t.jsx)(A, {
        "data-orientation": "horizontal",
        ...l,
        ref: p,
        sizes: a,
        style: {
          bottom: 0,
          left: "rtl" === s.dir ? "var(--radix-scroll-area-corner-width)" : 0,
          right: "ltr" === s.dir ? "var(--radix-scroll-area-corner-width)" : 0,
          "--radix-scroll-area-thumb-width": I(a) + "px",
          ...e.style
        },
        onThumbPointerDown: t => e.onThumbPointerDown(t.x),
        onDragScroll: t => e.onDragScroll(t.x),
        onWheelScroll: (t, r) => {
          if (s.viewport) {
            var o, a;
            let n = s.viewport.scrollLeft + t.deltaX;
            e.onWheelScroll(n), o = n, a = r, o > 0 && o < a && t.preventDefault()
          }
        },
        onResize: () => {
          u.current && s.viewport && c && n({
            content: s.viewport.scrollWidth,
            viewport: s.viewport.offsetWidth,
            scrollbar: {
              size: u.current.clientWidth,
              paddingStart: z(c.paddingLeft),
              paddingEnd: z(c.paddingRight)
            }
          })
        }
      })
    }),
    E = r.forwardRef((e, o) => {
      let {
        sizes: a,
        onSizesChange: n,
        ...l
      } = e, s = m(y, e.__scopeScrollArea), [c, d] = r.useState(), u = r.useRef(null), p = (0, i.useComposedRefs)(o, u, s.onScrollbarYChange);
      return r.useEffect(() => {
        u.current && d(getComputedStyle(u.current))
      }, [u]), (0, t.jsx)(A, {
        "data-orientation": "vertical",
        ...l,
        ref: p,
        sizes: a,
        style: {
          top: 0,
          right: "ltr" === s.dir ? 0 : void 0,
          left: "rtl" === s.dir ? 0 : void 0,
          bottom: "var(--radix-scroll-area-corner-height)",
          "--radix-scroll-area-thumb-height": I(a) + "px",
          ...e.style
        },
        onThumbPointerDown: t => e.onThumbPointerDown(t.y),
        onDragScroll: t => e.onDragScroll(t.y),
        onWheelScroll: (t, r) => {
          if (s.viewport) {
            var o, a;
            let n = s.viewport.scrollTop + t.deltaY;
            e.onWheelScroll(n), o = n, a = r, o > 0 && o < a && t.preventDefault()
          }
        },
        onResize: () => {
          u.current && s.viewport && c && n({
            content: s.viewport.scrollHeight,
            viewport: s.viewport.offsetHeight,
            scrollbar: {
              size: u.current.clientHeight,
              paddingStart: z(c.paddingTop),
              paddingEnd: z(c.paddingBottom)
            }
          })
        }
      })
    }),
    [T, N] = f(y),
    A = r.forwardRef((e, a) => {
      let {
        __scopeScrollArea: n,
        sizes: s,
        hasThumb: c,
        onThumbChange: d,
        onThumbPointerUp: p,
        onThumbPointerDown: f,
        onThumbPositionChange: h,
        onDragScroll: v,
        onWheelScroll: g,
        onResize: w,
        ...b
      } = e, x = m(y, n), [P, C] = r.useState(null), S = (0, i.useComposedRefs)(a, e => C(e)), R = r.useRef(null), k = r.useRef(""), j = x.viewport, E = s.content - s.viewport, N = (0, l.useCallbackRef)(g), A = (0, l.useCallbackRef)(h), L = X(w, 10);

      function _(e) {
        R.current && v({
          x: e.clientX - R.current.left,
          y: e.clientY - R.current.top
        })
      }
      return r.useEffect(() => {
        let e = e => {
          let t = e.target;
          P?.contains(t) && N(e, E)
        };
        return document.addEventListener("wheel", e, {
          passive: !1
        }), () => document.removeEventListener("wheel", e, {
          passive: !1
        })
      }, [j, P, E, N]), r.useEffect(A, [s, A]), U(P, L), U(x.content, L), (0, t.jsx)(T, {
        scope: n,
        scrollbar: P,
        hasThumb: c,
        onThumbChange: (0, l.useCallbackRef)(d),
        onThumbPointerUp: (0, l.useCallbackRef)(p),
        onThumbPositionChange: A,
        onThumbPointerDown: (0, l.useCallbackRef)(f),
        children: (0, t.jsx)(o.Primitive.div, {
          ...b,
          ref: S,
          style: {
            position: "absolute",
            ...b.style
          },
          onPointerDown: (0, u.composeEventHandlers)(e.onPointerDown, e => {
            0 === e.button && (e.target.setPointerCapture(e.pointerId), R.current = P.getBoundingClientRect(), k.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", x.viewport && (x.viewport.style.scrollBehavior = "auto"), _(e))
          }),
          onPointerMove: (0, u.composeEventHandlers)(e.onPointerMove, _),
          onPointerUp: (0, u.composeEventHandlers)(e.onPointerUp, e => {
            let t = e.target;
            t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), document.body.style.webkitUserSelect = k.current, x.viewport && (x.viewport.style.scrollBehavior = ""), R.current = null
          })
        })
      })
    }),
    L = "ScrollAreaThumb",
    _ = r.forwardRef((e, r) => {
      let {
        forceMount: o,
        ...n
      } = e, i = N(L, e.__scopeScrollArea);
      return (0, t.jsx)(a.Presence, {
        present: o || i.hasThumb,
        children: (0, t.jsx)(D, {
          ref: r,
          ...n
        })
      })
    }),
    D = r.forwardRef((e, a) => {
      let {
        __scopeScrollArea: n,
        style: l,
        ...s
      } = e, c = m(L, n), d = N(L, n), {
        onThumbPositionChange: p
      } = d, f = (0, i.useComposedRefs)(a, e => d.onThumbChange(e)), h = r.useRef(void 0), v = X(() => {
        h.current && (h.current(), h.current = void 0)
      }, 100);
      return r.useEffect(() => {
        let e = c.viewport;
        if (e) {
          let t = () => {
            v(), h.current || (h.current = W(e, p), p())
          };
          return p(), e.addEventListener("scroll", t), () => e.removeEventListener("scroll", t)
        }
      }, [c.viewport, v, p]), (0, t.jsx)(o.Primitive.div, {
        "data-state": d.hasThumb ? "visible" : "hidden",
        ...s,
        ref: f,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...l
        },
        onPointerDownCapture: (0, u.composeEventHandlers)(e.onPointerDownCapture, e => {
          let t = e.target.getBoundingClientRect(),
            r = e.clientX - t.left,
            o = e.clientY - t.top;
          d.onThumbPointerDown({
            x: r,
            y: o
          })
        }),
        onPointerUp: (0, u.composeEventHandlers)(e.onPointerUp, d.onThumbPointerUp)
      })
    });
  _.displayName = L;
  var M = "ScrollAreaCorner",
    O = r.forwardRef((e, r) => {
      let o = m(M, e.__scopeScrollArea),
        a = !!(o.scrollbarX && o.scrollbarY);
      return "scroll" !== o.type && a ? (0, t.jsx)(H, {
        ...e,
        ref: r
      }) : null
    });
  O.displayName = M;
  var H = r.forwardRef((e, a) => {
    let {
      __scopeScrollArea: n,
      ...i
    } = e, l = m(M, n), [s, c] = r.useState(0), [d, u] = r.useState(0), p = !!(s && d);
    return U(l.scrollbarX, () => {
      let e = l.scrollbarX?.offsetHeight || 0;
      l.onCornerHeightChange(e), u(e)
    }), U(l.scrollbarY, () => {
      let e = l.scrollbarY?.offsetWidth || 0;
      l.onCornerWidthChange(e), c(e)
    }), p ? (0, t.jsx)(o.Primitive.div, {
      ...i,
      ref: a,
      style: {
        width: s,
        height: d,
        position: "absolute",
        right: "ltr" === l.dir ? 0 : void 0,
        left: "rtl" === l.dir ? 0 : void 0,
        bottom: 0,
        ...e.style
      }
    }) : null
  });

  function z(e) {
    return e ? parseInt(e, 10) : 0
  }

  function F(e, t) {
    let r = e / t;
    return isNaN(r) ? 0 : r
  }

  function I(e) {
    let t = F(e.viewport, e.content),
      r = e.scrollbar.paddingStart + e.scrollbar.paddingEnd;
    return Math.max((e.scrollbar.size - r) * t, 18)
  }

  function V(e, t, r = "ltr") {
    let o = I(t),
      a = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
      n = t.scrollbar.size - a,
      i = t.content - t.viewport,
      l = (0, d.clamp)(e, "ltr" === r ? [0, i] : [-1 * i, 0]);
    return B([0, i], [0, n - o])(l)
  }

  function B(e, t) {
    return r => {
      if (e[0] === e[1] || t[0] === t[1]) return t[0];
      let o = (t[1] - t[0]) / (e[1] - e[0]);
      return t[0] + o * (r - e[0])
    }
  }
  var W = (e, t = () => {}) => {
    let r = {
        left: e.scrollLeft,
        top: e.scrollTop
      },
      o = 0;
    return ! function a() {
      let n = {
          left: e.scrollLeft,
          top: e.scrollTop
        },
        i = r.left !== n.left,
        l = r.top !== n.top;
      (i || l) && t(), r = n, o = window.requestAnimationFrame(a)
    }(), () => window.cancelAnimationFrame(o)
  };

  function X(e, t) {
    let o = (0, l.useCallbackRef)(e),
      a = r.useRef(0);
    return r.useEffect(() => () => window.clearTimeout(a.current), []), r.useCallback(() => {
      window.clearTimeout(a.current), a.current = window.setTimeout(o, t)
    }, [o, t])
  }

  function U(e, t) {
    let r = (0, l.useCallbackRef)(t);
    (0, c.useLayoutEffect)(() => {
      let t = 0;
      if (e) {
        let o = new ResizeObserver(() => {
          cancelAnimationFrame(t), t = window.requestAnimationFrame(r)
        });
        return o.observe(e), () => {
          window.cancelAnimationFrame(t), o.unobserve(e)
        }
      }
    }, [e, r])
  }
  var Y = e.i(75157);
  let $ = r.forwardRef(({
    className: e,
    children: r,
    viewportRef: o,
    onViewportScroll: a,
    ...n
  }, i) => (0, t.jsxs)(g, {
    ref: i,
    className: (0, Y.cn)("relative overflow-hidden", e),
    ...n,
    children: [(0, t.jsx)(b, {
      ref: o,
      className: "h-full w-full rounded-[inherit]",
      onScroll: a,
      children: r
    }), (0, t.jsx)(q, {}), (0, t.jsx)(O, {})]
  }));
  $.displayName = g.displayName;
  let q = r.forwardRef(({
    className: e,
    orientation: r = "vertical",
    ...o
  }, a) => (0, t.jsx)(P, {
    ref: a,
    orientation: r,
    className: (0, Y.cn)("flex touch-none select-none transition-colors", "vertical" === r && "h-full w-2.5 border-l border-l-transparent p-[1px]", "horizontal" === r && "h-2.5 flex-col border-t border-t-transparent p-[1px]", e),
    ...o,
    children: (0, t.jsx)(_, {
      className: "relative flex-1 rounded-full bg-border"
    })
  }));
  q.displayName = P.displayName, e.s(["ScrollArea", 0, $], 59684)
}, 5216, e => {
  e.q("/_next/static/media/nle-preview-sonic.worker.14xo1l3vg.i8m.ts")
}, 53138, e => {
  "use strict";
  var t = e.i(55566);
  e.s(["AlertTriangle", () => t.default])
}, 99375, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    o = e.i(81140),
    a = e.i(20783),
    n = e.i(30030),
    i = e.i(69340),
    l = e.i(99682),
    s = e.i(35804),
    c = e.i(48425),
    d = "Switch",
    [u, p] = (0, n.createContextScope)(d),
    [f, h] = u(d);

  function v(e) {
    let {
      __scopeSwitch: o,
      checked: a,
      children: n,
      defaultChecked: l,
      disabled: s,
      form: c,
      name: u,
      onCheckedChange: p,
      required: h,
      value: v = "on",
      internal_do_not_use_render: m
    } = e, [g, w] = (0, i.useControllableState)({
      prop: a,
      defaultProp: l ?? !1,
      onChange: p,
      caller: d
    }), [b, x] = r.useState(null), [y, P] = r.useState(null), C = r.useRef(!1), S = !b || !!c || !!b.closest("form"), R = {
      checked: g,
      setChecked: w,
      disabled: s,
      control: b,
      setControl: x,
      name: u,
      form: c,
      value: v,
      hasConsumerStoppedPropagationRef: C,
      required: h,
      defaultChecked: l,
      isFormControl: S,
      bubbleInput: y,
      setBubbleInput: P
    };
    return (0, t.jsx)(f, {
      scope: o,
      ...R,
      children: "function" == typeof m ? m(R) : n
    })
  }
  var m = "SwitchTrigger",
    g = r.forwardRef(({
      __scopeSwitch: e,
      onClick: r,
      ...n
    }, i) => {
      let {
        value: l,
        disabled: s,
        checked: d,
        required: u,
        setControl: p,
        setChecked: f,
        hasConsumerStoppedPropagationRef: v,
        isFormControl: g,
        bubbleInput: w
      } = h(m, e), b = (0, a.useComposedRefs)(i, p);
      return (0, t.jsx)(c.Primitive.button, {
        type: "button",
        role: "switch",
        "aria-checked": d,
        "aria-required": u,
        "data-state": C(d),
        "data-disabled": s ? "" : void 0,
        disabled: s,
        value: l,
        ...n,
        ref: b,
        onClick: (0, o.composeEventHandlers)(r, e => {
          f(e => !e), w && g && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation())
        })
      })
    });
  g.displayName = m;
  var w = r.forwardRef((e, r) => {
    let {
      __scopeSwitch: o,
      name: a,
      checked: n,
      defaultChecked: i,
      required: l,
      disabled: s,
      value: c,
      onCheckedChange: d,
      form: u,
      ...p
    } = e;
    return (0, t.jsx)(v, {
      __scopeSwitch: o,
      checked: n,
      defaultChecked: i,
      disabled: s,
      required: l,
      onCheckedChange: d,
      name: a,
      form: u,
      value: c,
      internal_do_not_use_render: ({
        isFormControl: e
      }) => (0, t.jsxs)(t.Fragment, {
        children: [(0, t.jsx)(g, {
          ...p,
          ref: r,
          __scopeSwitch: o
        }), e && (0, t.jsx)(P, {
          __scopeSwitch: o
        })]
      })
    })
  });
  w.displayName = d;
  var b = "SwitchThumb",
    x = r.forwardRef((e, r) => {
      let {
        __scopeSwitch: o,
        ...a
      } = e, n = h(b, o);
      return (0, t.jsx)(c.Primitive.span, {
        "data-state": C(n.checked),
        "data-disabled": n.disabled ? "" : void 0,
        ...a,
        ref: r
      })
    });
  x.displayName = b;
  var y = "SwitchBubbleInput",
    P = r.forwardRef(({
      __scopeSwitch: e,
      ...o
    }, n) => {
      let {
        control: i,
        hasConsumerStoppedPropagationRef: d,
        checked: u,
        defaultChecked: p,
        required: f,
        disabled: v,
        name: m,
        value: g,
        form: w,
        bubbleInput: b,
        setBubbleInput: x
      } = h(y, e), P = (0, a.useComposedRefs)(n, x), C = (0, l.usePrevious)(u), S = (0, s.useSize)(i);
      r.useEffect(() => {
        if (!b) return;
        let e = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked").set,
          t = !d.current;
        if (C !== u && e) {
          let r = new Event("click", {
            bubbles: t
          });
          e.call(b, u), b.dispatchEvent(r)
        }
      }, [b, C, u, d]);
      let R = r.useRef(u);
      return (0, t.jsx)(c.Primitive.input, {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: p ?? R.current,
        required: f,
        disabled: v,
        name: m,
        value: g,
        form: w,
        ...o,
        tabIndex: -1,
        ref: P,
        style: {
          ...o.style,
          ...S,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          transform: "translateX(-100%)"
        }
      })
    });

  function C(e) {
    return e ? "checked" : "unchecked"
  }
  P.displayName = y;
  var S = e.i(75157);
  let R = r.forwardRef(({
    className: e,
    ...r
  }, o) => (0, t.jsx)(w, {
    className: (0, S.cn)("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", e),
    ...r,
    ref: o,
    children: (0, t.jsx)(x, {
      className: (0, S.cn)("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")
    })
  }));
  R.displayName = w.displayName, e.s(["Switch", 0, R], 99375)
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
}, 72382, e => {
  "use strict";
  let t = (0, e.i(56420).default)("eye", [
    ["path", {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }],
    ["circle", {
      cx: "12",
      cy: "12",
      r: "3",
      key: "1v7zrd"
    }]
  ]);
  e.s(["Eye", 0, t], 72382)
}, 80860, e => {
  "use strict";
  let t = (0, e.i(56420).default)("eye-off", [
    ["path", {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }],
    ["path", {
      d: "M14.084 14.158a3 3 0 0 1-4.242-4.242",
      key: "151rxh"
    }],
    ["path", {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }],
    ["path", {
      d: "m2 2 20 20",
      key: "1ooewy"
    }]
  ]);
  e.s(["EyeOff", 0, t], 80860)
}, 26091, e => {
  "use strict";
  let t = (0, e.i(56420).default)("file-text", [
    ["path", {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }],
    ["path", {
      d: "M14 2v5a1 1 0 0 0 1 1h5",
      key: "wfsgrz"
    }],
    ["path", {
      d: "M10 9H8",
      key: "b1mrlr"
    }],
    ["path", {
      d: "M16 13H8",
      key: "t4e002"
    }],
    ["path", {
      d: "M16 17H8",
      key: "z1uh3a"
    }]
  ]);
  e.s(["FileText", 0, t], 26091)
}, 68148, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    o = e.i(30030),
    a = e.i(48425),
    n = "Progress",
    [i, l] = (0, o.createContextScope)(n),
    [s, c] = i(n),
    d = r.forwardRef((e, r) => {
      var o, n;
      let {
        __scopeProgress: i,
        value: l = null,
        max: c,
        getValueLabel: d = f,
        ...u
      } = e;
      (c || 0 === c) && !m(c) && console.error((o = `${c}`, `Invalid prop \`max\` of value \`${o}\` supplied to \`Progress\`. Only numbers greater than 0 are valid max values. Defaulting to \`100\`.`));
      let p = m(c) ? c : 100;
      null === l || g(l, p) || console.error((n = `${l}`, `Invalid prop \`value\` of value \`${n}\` supplied to \`Progress\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or 100 if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`));
      let w = g(l, p) ? l : null,
        b = v(w) ? d(w, p) : void 0;
      return (0, t.jsx)(s, {
        scope: i,
        value: w,
        max: p,
        children: (0, t.jsx)(a.Primitive.div, {
          "aria-valuemax": p,
          "aria-valuemin": 0,
          "aria-valuenow": v(w) ? w : void 0,
          "aria-valuetext": b,
          role: "progressbar",
          "data-state": h(w, p),
          "data-value": w ?? void 0,
          "data-max": p,
          ...u,
          ref: r
        })
      })
    });
  d.displayName = n;
  var u = "ProgressIndicator",
    p = r.forwardRef((e, r) => {
      let {
        __scopeProgress: o,
        ...n
      } = e, i = c(u, o);
      return (0, t.jsx)(a.Primitive.div, {
        "data-state": h(i.value, i.max),
        "data-value": i.value ?? void 0,
        "data-max": i.max,
        ...n,
        ref: r
      })
    });

  function f(e, t) {
    return `${Math.round(e/t*100)}%`
  }

  function h(e, t) {
    return null == e ? "indeterminate" : e === t ? "complete" : "loading"
  }

  function v(e) {
    return "number" == typeof e
  }

  function m(e) {
    return v(e) && !isNaN(e) && e > 0
  }

  function g(e, t) {
    return v(e) && !isNaN(e) && e <= t && e >= 0
  }
  p.displayName = u;
  var w = e.i(75157);
  let b = r.forwardRef(({
    className: e,
    value: r,
    indicatorClassName: o,
    ...a
  }, n) => (0, t.jsx)(d, {
    ref: n,
    className: (0, w.cn)("relative h-2 w-full overflow-hidden rounded-full bg-secondary", e),
    ...a,
    children: (0, t.jsx)(p, {
      className: (0, w.cn)("h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out", o),
      style: {
        transform: `translateX(-${100-(r||0)}%)`
      }
    })
  }));
  b.displayName = d.displayName, e.s(["Progress", 0, b], 68148)
}, 33658, 28523, e => {
  "use strict";
  var t = e.i(56420);
  let r = (0, t.default)("file-headphone", [
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
  e.s(["FileAudio", 0, r], 33658);
  let o = (0, t.default)("pause", [
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
  e.s(["Pause", 0, o], 28523)
}, 78001, e => {
  "use strict";
  let t = (0, e.i(56420).default)("copy-check", [
    ["path", {
      d: "m12 15 2 2 4-4",
      key: "2c609p"
    }],
    ["rect", {
      width: "14",
      height: "14",
      x: "8",
      y: "8",
      rx: "2",
      ry: "2",
      key: "17jyea"
    }],
    ["path", {
      d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
      key: "zix9uf"
    }]
  ]);
  e.s(["CopyCheck", 0, t], 78001)
}, 59416, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    o = e.i(69644),
    a = e.i(32781),
    n = e.i(19455);
  e.i(89268);
  var i = e.i(63126),
    l = e.i(81341),
    s = e.i(75157),
    c = e.i(65991);
  e.s(["ErrorSupportLogButton", 0, function({
    videoId: e,
    videoName: d,
    compact: u = !1,
    className: p
  }) {
    let f = (0, c.useVideoStore)(e => e.exportSupportBundle),
      [h, v] = r.default.useState(!1),
      m = async () => {
        if (!h) {
          v(!0);
          try {
            let t = await f(e);
            await (0, i.openProjectSupportBundleFolder)(t.path)
          } catch (e) {
            await (0, l.showMessage)("Không tạo được log", e instanceof Error ? e.message : "Vui lòng thử lại sau.", "error")
          } finally {
            v(!1)
          }
        }
      };
    return (0, t.jsxs)(n.Button, {
      type: "button",
      variant: "outline",
      size: u ? "icon" : "sm",
      "aria-label": `Mở log ${d}`,
      title: "Mở log hỗ trợ",
      disabled: h,
      onClick: () => void m(),
      className: (0, s.cn)(u && "h-8 w-8", p),
      children: [h ? (0, t.jsx)(a.Loader2, {
        className: "h-3.5 w-3.5 animate-spin"
      }) : (0, t.jsx)(o.FolderOpen, {
        className: "h-3.5 w-3.5"
      }), u ? null : "Mở log"]
    })
  }])
}, 3091, e => {
  "use strict";
  var t = e.i(1046);
  let r = new Set(["importing", "extracting_audio", "transcribing", "translating", "generating_tts", "exporting"]);

  function o(e) {
    return e ? e.split(/[\\/]/).filter(Boolean).pop() ?? e : ""
  }

  function a(e) {
    if (!e) return 0;
    let t = e instanceof Date ? e.getTime() : Date.parse(e);
    return Number.isFinite(t) ? t : 0
  }

  function n(e) {
    let t = a(e.processingCompletedAt);
    return t > 0 ? t : a(e.addedAt) || i(e)
  }

  function i(e) {
    return a(e.projectManifestUpdatedAt)
  }
  e.s(["compareHistoryActivityDesc", 0, function(e, t) {
    let r = n(t) - n(e);
    return 0 !== r ? r : i(t) - i(e)
  }, "getCompactVideoTitle", 0, function(e, t = 34) {
    let r = (o(e) || e).replace(/\.[^.]+$/, "");
    return r.length <= t ? r : `${r.slice(0,t)}...`
  }, "getHistoryOutputState", 0, function(e) {
    if ("error" === e.status) {
      let r = (0, t.getProcessingErrorDisplay)(e.processingError, e.processingErrorCode);
      return {
        kind: "error",
        label: r.badgeLabel,
        detail: r.detail,
        variant: "destructive",
        actionLabel: "start_fresh" === r.action ? "Bắt đầu lại" : "Mở project",
        action: "start_fresh" === r.action ? "start_fresh" : void 0
      }
    }
    if (r.has(e.status)) return {
      kind: "processing",
      label: "Đang xử lý",
      detail: "Đang chạy trong hàng đợi",
      variant: "warning",
      actionLabel: "Mở project"
    };
    if (e.srtAudioOutputPath) return {
      kind: "final",
      label: "Audio hoàn chỉnh",
      detail: o(e.srtAudioOutputPath),
      path: e.srtAudioOutputPath,
      variant: "success",
      actionLabel: "Hiện file"
    };
    if (e.finalExportPath) return {
      kind: "final",
      label: "Video hoàn chỉnh",
      detail: o(e.finalExportPath),
      path: e.finalExportPath,
      variant: "primary-soft",
      actionLabel: "Mở kết quả"
    };
    if (e.cuePreviewPlanPath) return {
      kind: "needs_export",
      label: "Đã xử lý",
      detail: "Bản hoàn chỉnh được ghép khi Xuất video.",
      variant: "success",
      actionLabel: "Mở project"
    };
    let a = e.draftVideoPath ?? e.translatedVideoPath;
    if (a && e.subtitlesBurnedIntoVideo) return {
      kind: "final",
      label: "Video hoàn chỉnh",
      detail: o(a),
      path: a,
      variant: "primary-soft",
      actionLabel: "Mở kết quả"
    };
    let n = !!(e.displaySubtitlePath || e.translatedSubtitlePath);
    return a && n ? {
      kind: "needs_export",
      label: "",
      detail: "",
      path: a,
      variant: "secondary",
      actionLabel: "Mở project"
    } : n ? {
      kind: "needs_export",
      label: "Phụ đề sẵn sàng",
      detail: "Video gốc + phụ đề",
      variant: "success",
      actionLabel: "Mở project"
    } : a ? {
      kind: "draft",
      label: "",
      detail: "",
      path: a,
      variant: "secondary",
      actionLabel: "Mở project"
    } : {
      kind: "empty",
      label: "Đã xử lý",
      detail: "srt_audio" === e.projectType ? "Chưa có file audio" : "Chưa có file video",
      variant: e.finalExportHasSubtitles ? "warning" : "outline",
      actionLabel: "Mở project"
    }
  }, "hasHistoryResult", 0, function(e) {
    return !!(e.srtAudioOutputPath || e.finalExportPath || e.draftVideoPath || e.translatedVideoPath || e.cuePreviewPlanPath || "completed" === e.status || "error" === e.status)
  }])
}, 37822, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    o = e.i(81140),
    a = e.i(20783),
    n = e.i(30030),
    i = e.i(26330),
    l = e.i(3536),
    s = e.i(65491),
    c = e.i(10772),
    d = e.i(53660),
    u = e.i(74606),
    p = e.i(96626),
    f = e.i(48425),
    h = e.i(91918),
    v = e.i(69340),
    m = e.i(86312),
    g = e.i(85369),
    w = "Popover",
    [b, x] = (0, n.createContextScope)(w, [d.createPopperScope]),
    y = (0, d.createPopperScope)(),
    [P, C] = b(w),
    S = e => {
      let {
        __scopePopover: o,
        children: a,
        open: n,
        defaultOpen: i,
        onOpenChange: l,
        modal: s = !1
      } = e, u = y(o), p = r.useRef(null), [f, h] = r.useState(!1), [m, g] = (0, v.useControllableState)({
        prop: n,
        defaultProp: i ?? !1,
        onChange: l,
        caller: w
      });
      return (0, t.jsx)(d.Root, {
        ...u,
        children: (0, t.jsx)(P, {
          scope: o,
          contentId: (0, c.useId)(),
          triggerRef: p,
          open: m,
          onOpenChange: g,
          onOpenToggle: r.useCallback(() => g(e => !e), [g]),
          hasCustomAnchor: f,
          onCustomAnchorAdd: r.useCallback(() => h(!0), []),
          onCustomAnchorRemove: r.useCallback(() => h(!1), []),
          modal: s,
          children: a
        })
      })
    };
  S.displayName = w;
  var R = "PopoverAnchor";
  r.forwardRef((e, o) => {
    let {
      __scopePopover: a,
      ...n
    } = e, i = C(R, a), l = y(a), {
      onCustomAnchorAdd: s,
      onCustomAnchorRemove: c
    } = i;
    return r.useEffect(() => (s(), () => c()), [s, c]), (0, t.jsx)(d.Anchor, {
      ...l,
      ...n,
      ref: o
    })
  }).displayName = R;
  var k = "PopoverTrigger",
    j = r.forwardRef((e, r) => {
      let {
        __scopePopover: n,
        ...i
      } = e, l = C(k, n), s = y(n), c = (0, a.useComposedRefs)(r, l.triggerRef), u = (0, t.jsx)(f.Primitive.button, {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": l.open,
        "aria-controls": l.open ? l.contentId : void 0,
        "data-state": F(l.open),
        ...i,
        ref: c,
        onClick: (0, o.composeEventHandlers)(e.onClick, l.onOpenToggle)
      });
      return l.hasCustomAnchor ? u : (0, t.jsx)(d.Anchor, {
        asChild: !0,
        ...s,
        children: u
      })
    });
  j.displayName = k;
  var E = "PopoverPortal",
    [T, N] = b(E, {
      forceMount: void 0
    }),
    A = e => {
      let {
        __scopePopover: r,
        forceMount: o,
        children: a,
        container: n
      } = e, i = C(E, r);
      return (0, t.jsx)(T, {
        scope: r,
        forceMount: o,
        children: (0, t.jsx)(p.Presence, {
          present: o || i.open,
          children: (0, t.jsx)(u.Portal, {
            asChild: !0,
            container: n,
            children: a
          })
        })
      })
    };
  A.displayName = E;
  var L = "PopoverContent",
    _ = r.forwardRef((e, r) => {
      let o = N(L, e.__scopePopover),
        {
          forceMount: a = o.forceMount,
          ...n
        } = e,
        i = C(L, e.__scopePopover);
      return (0, t.jsx)(p.Presence, {
        present: a || i.open,
        children: i.modal ? (0, t.jsx)(M, {
          ...n,
          ref: r
        }) : (0, t.jsx)(O, {
          ...n,
          ref: r
        })
      })
    });
  _.displayName = L;
  var D = (0, h.createSlot)("PopoverContent.RemoveScroll"),
    M = r.forwardRef((e, n) => {
      let i = C(L, e.__scopePopover),
        l = r.useRef(null),
        s = (0, a.useComposedRefs)(n, l),
        c = r.useRef(!1);
      return r.useEffect(() => {
        let e = l.current;
        if (e) return (0, m.hideOthers)(e)
      }, []), (0, t.jsx)(g.RemoveScroll, {
        as: D,
        allowPinchZoom: !0,
        children: (0, t.jsx)(H, {
          ...e,
          ref: s,
          trapFocus: i.open,
          disableOutsidePointerEvents: !0,
          onCloseAutoFocus: (0, o.composeEventHandlers)(e.onCloseAutoFocus, e => {
            e.preventDefault(), c.current || i.triggerRef.current?.focus()
          }),
          onPointerDownOutside: (0, o.composeEventHandlers)(e.onPointerDownOutside, e => {
            let t = e.detail.originalEvent,
              r = 0 === t.button && !0 === t.ctrlKey;
            c.current = 2 === t.button || r
          }, {
            checkForDefaultPrevented: !1
          }),
          onFocusOutside: (0, o.composeEventHandlers)(e.onFocusOutside, e => e.preventDefault(), {
            checkForDefaultPrevented: !1
          })
        })
      })
    }),
    O = r.forwardRef((e, o) => {
      let a = C(L, e.__scopePopover),
        n = r.useRef(!1),
        i = r.useRef(!1);
      return (0, t.jsx)(H, {
        ...e,
        ref: o,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: t => {
          e.onCloseAutoFocus?.(t), t.defaultPrevented || (n.current || a.triggerRef.current?.focus(), t.preventDefault()), n.current = !1, i.current = !1
        },
        onInteractOutside: t => {
          e.onInteractOutside?.(t), t.defaultPrevented || (n.current = !0, "pointerdown" === t.detail.originalEvent.type && (i.current = !0));
          let r = t.target;
          a.triggerRef.current?.contains(r) && t.preventDefault(), "focusin" === t.detail.originalEvent.type && i.current && t.preventDefault()
        }
      })
    }),
    H = r.forwardRef((e, r) => {
      let {
        __scopePopover: o,
        trapFocus: a,
        onOpenAutoFocus: n,
        onCloseAutoFocus: c,
        disableOutsidePointerEvents: u,
        onEscapeKeyDown: p,
        onPointerDownOutside: f,
        onFocusOutside: h,
        onInteractOutside: v,
        ...m
      } = e, g = C(L, o), w = y(o);
      return (0, l.useFocusGuards)(), (0, t.jsx)(s.FocusScope, {
        asChild: !0,
        loop: !0,
        trapped: a,
        onMountAutoFocus: n,
        onUnmountAutoFocus: c,
        children: (0, t.jsx)(i.DismissableLayer, {
          asChild: !0,
          disableOutsidePointerEvents: u,
          onInteractOutside: v,
          onEscapeKeyDown: p,
          onPointerDownOutside: f,
          onFocusOutside: h,
          onDismiss: () => g.onOpenChange(!1),
          deferPointerDownOutside: !0,
          children: (0, t.jsx)(d.Content, {
            "data-state": F(g.open),
            role: "dialog",
            id: g.contentId,
            ...w,
            ...m,
            ref: r,
            style: {
              ...m.style,
              "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
              "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
              "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
            }
          })
        })
      })
    }),
    z = "PopoverClose";

  function F(e) {
    return e ? "open" : "closed"
  }
  r.forwardRef((e, r) => {
    let {
      __scopePopover: a,
      ...n
    } = e, i = C(z, a);
    return (0, t.jsx)(f.Primitive.button, {
      type: "button",
      ...n,
      ref: r,
      onClick: (0, o.composeEventHandlers)(e.onClick, () => i.onOpenChange(!1))
    })
  }).displayName = z, r.forwardRef((e, r) => {
    let {
      __scopePopover: o,
      ...a
    } = e, n = y(o);
    return (0, t.jsx)(d.Arrow, {
      ...n,
      ...a,
      ref: r
    })
  }).displayName = "PopoverArrow";
  var I = e.i(75157);
  let V = r.forwardRef(({
    className: e,
    align: r = "end",
    sideOffset: o = 8,
    ...a
  }, n) => (0, t.jsx)(A, {
    children: (0, t.jsx)(_, {
      ref: n,
      align: r,
      sideOffset: o,
      className: (0, I.cn)("z-50 rounded-lg border border-border bg-card text-card-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", e),
      ...a
    })
  }));
  V.displayName = _.displayName, e.s(["Popover", 0, S, "PopoverContent", 0, V, "PopoverTrigger", 0, j], 37822)
}, 27431, e => {
  e.v(e => Promise.resolve().then(() => e(68078)))
}, 70578, e => {
  e.v(t => Promise.all(["static/chunks/05-hc5mcv332i.js"].map(t => e.l(t))).then(() => t(12315)))
}]);