(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 63676, e => {
  "use strict";
  let i = (0, e.i(56420).default)("x", [
    ["path", {
      d: "M18 6 6 18",
      key: "1bl5f8"
    }],
    ["path", {
      d: "m6 6 12 12",
      key: "d8bk6v"
    }]
  ]);
  e.s(["X", 0, i], 63676)
}, 53138, e => {
  "use strict";
  var i = e.i(55566);
  e.s(["AlertTriangle", () => i.default])
}, 34047, e => {
  "use strict";
  var i = e.i(43476),
    n = e.i(53138),
    t = e.i(76639),
    r = e.i(19455);
  let s = (0, e.i(68834).create)((e, i) => ({
      pendingRequest: null,
      showProcessingGuidance: i => {
        try {
          (function() {
            try {
              return window.localStorage
            } catch {
              return null
            }
          })()?.setItem("dichvideo.seen.hybrid_longvideo_warning", "1")
        } catch {}
        e({
          pendingRequest: i
        })
      },
      dismissProcessingGuidance: () => {
        i().pendingRequest && e({
          pendingRequest: null
        })
      }
    })),
    d = {
      hybrid_long_video: {
        title: "Lưu ý khi kéo dãn video",
        description: "Việc xử lý kéo dãn video sẽ làm tăng thời gian xử lý so với chế độ 'Giữ nguyên video'.",
        detail: "Chế độ này giúp giọng đọc dễ nghe hơn, nhưng sẽ cần thêm thời gian xử lý trước khi xuất.",
        actionLabel: "Đã hiểu"
      }
    };
  e.s(["ProcessingGuidanceDialog", 0, function() {
    let {
      pendingRequest: e,
      dismissProcessingGuidance: l
    } = s(), a = !!e, o = e ? d[e.kind] : d.hybrid_long_video;
    return (0, i.jsx)(t.Dialog, {
      open: a,
      onOpenChange: i => {
        !i && e && l()
      },
      children: (0, i.jsxs)(t.DialogContent, {
        "data-testid": "processing-guidance-dialog",
        className: "w-[calc(100vw-1.5rem)] max-w-md",
        children: [(0, i.jsxs)(t.DialogHeader, {
          children: [(0, i.jsx)(t.DialogTitle, {
            children: o.title
          }), (0, i.jsx)(t.DialogDescription, {
            children: o.description
          })]
        }), (0, i.jsxs)("div", {
          className: "flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm",
          children: [(0, i.jsx)("div", {
            className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-background",
            children: (0, i.jsx)(n.AlertTriangle, {
              className: "h-4 w-4 text-primary"
            })
          }), (0, i.jsx)("p", {
            className: "min-w-0 leading-5 text-muted-foreground",
            children: o.detail
          })]
        }), (0, i.jsx)(t.DialogFooter, {
          className: "gap-2 sm:justify-end",
          children: (0, i.jsx)(r.Button, {
            onClick: l,
            children: o.actionLabel
          })
        })]
      })
    })
  }], 34047)
}, 45033, e => {
  e.n(e.i(34047))
}]);