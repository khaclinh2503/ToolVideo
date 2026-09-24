(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 63676, e => {
  "use strict";
  let a = (0, e.i(56420).default)("x", [
    ["path", {
      d: "M18 6 6 18",
      key: "1bl5f8"
    }],
    ["path", {
      d: "m6 6 12 12",
      key: "d8bk6v"
    }]
  ]);
  e.s(["X", 0, a], 63676)
}, 32781, e => {
  "use strict";
  var a = e.i(58379);
  e.s(["Loader2", () => a.default])
}, 62368, e => {
  "use strict";
  let a = (0, e.i(56420).default)("download", [
    ["path", {
      d: "M12 15V3",
      key: "m9g1x1"
    }],
    ["path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
      key: "ih7n3h"
    }],
    ["path", {
      d: "m7 10 5 5 5-5",
      key: "brsn70"
    }]
  ]);
  e.s(["Download", 0, a], 62368)
}, 68148, e => {
  "use strict";
  var a = e.i(43476),
    n = e.i(71645),
    t = e.i(30030),
    r = e.i(48425),
    i = "Progress",
    [s, l] = (0, t.createContextScope)(i),
    [o, d] = s(i),
    c = n.forwardRef((e, n) => {
      var t, i;
      let {
        __scopeProgress: s,
        value: l = null,
        max: d,
        getValueLabel: c = p,
        ...u
      } = e;
      (d || 0 === d) && !g(d) && console.error((t = `${d}`, `Invalid prop \`max\` of value \`${t}\` supplied to \`Progress\`. Only numbers greater than 0 are valid max values. Defaulting to \`100\`.`));
      let m = g(d) ? d : 100;
      null === l || v(l, m) || console.error((i = `${l}`, `Invalid prop \`value\` of value \`${i}\` supplied to \`Progress\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or 100 if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`));
      let f = v(l, m) ? l : null,
        b = x(f) ? c(f, m) : void 0;
      return (0, a.jsx)(o, {
        scope: s,
        value: f,
        max: m,
        children: (0, a.jsx)(r.Primitive.div, {
          "aria-valuemax": m,
          "aria-valuemin": 0,
          "aria-valuenow": x(f) ? f : void 0,
          "aria-valuetext": b,
          role: "progressbar",
          "data-state": h(f, m),
          "data-value": f ?? void 0,
          "data-max": m,
          ...u,
          ref: n
        })
      })
    });
  c.displayName = i;
  var u = "ProgressIndicator",
    m = n.forwardRef((e, n) => {
      let {
        __scopeProgress: t,
        ...i
      } = e, s = d(u, t);
      return (0, a.jsx)(r.Primitive.div, {
        "data-state": h(s.value, s.max),
        "data-value": s.value ?? void 0,
        "data-max": s.max,
        ...i,
        ref: n
      })
    });

  function p(e, a) {
    return `${Math.round(e/a*100)}%`
  }

  function h(e, a) {
    return null == e ? "indeterminate" : e === a ? "complete" : "loading"
  }

  function x(e) {
    return "number" == typeof e
  }

  function g(e) {
    return x(e) && !isNaN(e) && e > 0
  }

  function v(e, a) {
    return x(e) && !isNaN(e) && e <= a && e >= 0
  }
  m.displayName = u;
  var f = e.i(75157);
  let b = n.forwardRef(({
    className: e,
    value: n,
    indicatorClassName: t,
    ...r
  }, i) => (0, a.jsx)(c, {
    ref: i,
    className: (0, f.cn)("relative h-2 w-full overflow-hidden rounded-full bg-secondary", e),
    ...r,
    children: (0, a.jsx)(m, {
      className: (0, f.cn)("h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out", t),
      style: {
        transform: `translateX(-${100-(n||0)}%)`
      }
    })
  }));
  b.displayName = c.displayName, e.s(["Progress", 0, b], 68148)
}, 91973, e => {
  "use strict";
  var a = e.i(43476),
    n = e.i(62368),
    t = e.i(32781),
    r = e.i(76639),
    i = e.i(19455),
    s = e.i(68148),
    l = e.i(45017),
    o = e.i(34618);
  e.s(["EnginePreparationDialog", 0, function() {
    let {
      pendingRequest: e,
      resolveEnginePreparation: d
    } = (0, l.useEnginePreparationStore)(), {
      status: c,
      progress: u
    } = (0, o.useEngineVnextInstallStore)(), m = !!e, p = e?.detailTitle ?? "Cài đặt một lần cho máy này", h = e?.detailDescription ?? "App tự kiểm tra máy và tải đúng gói cần dùng. Bạn vẫn kiểm soát bước này và có thể chọn để sau.";
    return (0, a.jsx)(r.Dialog, {
      open: m,
      onOpenChange: a => {
        !a && e && d("cancelled")
      },
      children: (0, a.jsxs)(r.DialogContent, {
        "data-testid": "engine-preparation-dialog",
        className: "w-[calc(100vw-1.5rem)] max-w-md",
        children: [(0, a.jsxs)(r.DialogHeader, {
          children: [(0, a.jsx)(r.DialogTitle, {
            children: e?.title ?? "Chuẩn bị bộ xử lý video"
          }), (0, a.jsx)(r.DialogDescription, {
            children: e?.description ?? "DichVideo sẽ tự chọn bộ xử lý phù hợp nhất cho máy này trước khi chạy video. Bước này chỉ làm một lần và bạn chưa bị trừ phút."
          })]
        }), (0, a.jsxs)("div", {
          className: "rounded-lg border border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground",
          children: [(0, a.jsxs)("div", {
            className: "flex items-start gap-3",
            children: [(0, a.jsx)("div", {
              className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background",
              children: (0, a.jsx)(n.Download, {
                className: "h-4 w-4 text-primary"
              })
            }), (0, a.jsxs)("div", {
              className: "min-w-0",
              children: [(0, a.jsx)("p", {
                className: "font-medium text-foreground",
                children: p
              }), (0, a.jsx)("p", {
                className: "mt-1 text-xs leading-5",
                children: h
              }), e?.downloadSizeMb || e?.diskSpaceGb ? (0, a.jsxs)("p", {
                className: "mt-2 text-[11px] leading-5 text-muted-foreground",
                children: [e.downloadSizeMb ? `Tải khoảng ${e.downloadSizeMb} MB. ` : null, e.diskSpaceGb ? `Cần khoảng ${e.diskSpaceGb} GB trống.` : null]
              }) : null]
            })]
          }), "installing" === c ? (0, a.jsxs)("div", {
            className: "mt-3 space-y-2 rounded-md border border-border/70 bg-background/60 px-3 py-2",
            children: [(0, a.jsxs)("div", {
              className: "flex items-center justify-between gap-3",
              children: [(0, a.jsx)("p", {
                className: "truncate text-[11px] font-medium",
                children: u?.message ?? "Đang cài DichVideo Engine..."
              }), (0, a.jsxs)("span", {
                className: "text-[10px] font-medium text-muted-foreground",
                children: [Math.round(u?.percent ?? 0), "%"]
              })]
            }), (0, a.jsx)(s.Progress, {
              value: u?.percent ?? 0,
              className: "h-1.5"
            })]
          }) : null]
        }), (0, a.jsxs)(r.DialogFooter, {
          className: "gap-2 sm:justify-end",
          children: [(0, a.jsx)(i.Button, {
            variant: "outline",
            onClick: () => d("cancelled"),
            children: e?.cancelLabel ?? "Để sau"
          }), (0, a.jsxs)(i.Button, {
            onClick: () => d("confirmed"),
            children: [e ? (0, a.jsx)(n.Download, {
              className: "mr-2 h-4 w-4"
            }) : (0, a.jsx)(t.Loader2, {
              className: "mr-2 h-4 w-4 animate-spin"
            }), e?.confirmLabel ?? "Chuẩn bị bộ xử lý phù hợp"]
          })]
        })]
      })
    })
  }])
}, 49702, e => {
  e.n(e.i(91973))
}]);