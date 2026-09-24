(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 94533, e => {
  "use strict";
  let t = (0, e.i(56420).default)("wand-sparkles", [
    ["path", {
      d: "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",
      key: "ul74o6"
    }],
    ["path", {
      d: "m14 7 3 3",
      key: "1r5n42"
    }],
    ["path", {
      d: "M5 6v4",
      key: "ilb8ba"
    }],
    ["path", {
      d: "M19 14v4",
      key: "blhpug"
    }],
    ["path", {
      d: "M10 2v2",
      key: "7u0qdc"
    }],
    ["path", {
      d: "M7 8H3",
      key: "zfb6yr"
    }],
    ["path", {
      d: "M21 16h-4",
      key: "1cnmox"
    }],
    ["path", {
      d: "M11 3H9",
      key: "1obp7u"
    }]
  ]);
  e.s(["Wand2", 0, t], 94533)
}, 50157, 76133, e => {
  "use strict";
  var t = e.i(43476),
    s = e.i(71645),
    i = e.i(56420);
  let n = (0, i.default)("mic", [
      ["path", {
        d: "M12 19v3",
        key: "npa21l"
      }],
      ["path", {
        d: "M19 10v2a7 7 0 0 1-14 0v-2",
        key: "1vc78b"
      }],
      ["rect", {
        x: "9",
        y: "2",
        width: "6",
        height: "13",
        rx: "3",
        key: "s6n7sd"
      }]
    ]),
    r = (0, i.default)("cloud-upload", [
      ["path", {
        d: "M12 13v8",
        key: "1l5pq0"
      }],
      ["path", {
        d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
        key: "1pljnt"
      }],
      ["path", {
        d: "m8 17 4-4 4 4",
        key: "1quai1"
      }]
    ]);
  var a = e.i(51757),
    l = e.i(99847),
    o = e.i(32781),
    d = e.i(23827),
    c = e.i(95925),
    u = e.i(28623),
    m = e.i(84026),
    h = e.i(97142),
    x = e.i(62368),
    p = e.i(63676),
    g = e.i(19455),
    f = e.i(93479),
    v = e.i(57428),
    b = e.i(48425),
    y = s.forwardRef((e, s) => (0, t.jsx)(b.Primitive.label, {
      ...e,
      ref: s,
      onMouseDown: t => {
        t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault())
      }
    }));
  y.displayName = "Label", e.s(["Label", 0, y, "Root", 0, y], 73741);
  var j = e.i(73741),
    j = j,
    N = e.i(75157);

  function w({
    className: e,
    ...s
  }) {
    return (0, t.jsx)(j.Root, {
      "data-slot": "label",
      className: (0, N.cn)("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
      ...s
    })
  }
  var S = e.i(79212),
    k = e.i(3134);
  e.i(89268);
  var T = e.i(81341);
  e.s(["VieNeuTurboPanel", 0, function({
    onCreated: i,
    isOpen: b,
    onToggleOpen: y,
    className: j
  }) {
    let C = (0, S.useVieNeuTurboStore)(),
      [I, L] = (0, s.useState)(""),
      [V, D] = (0, s.useState)(""),
      [P, M] = (0, s.useState)(!0),
      [B, E] = (0, s.useState)(!1),
      [z, A] = (0, s.useState)(""),
      [$, R] = (0, s.useState)(0),
      [U, _] = (0, s.useState)(C.status?.sizeBytes ?? 0),
      [O, G] = (0, s.useState)(null),
      [K, F] = (0, s.useState)(null),
      [H, W] = (0, s.useState)(0),
      X = (0, s.useRef)(null),
      [q, Y] = (0, s.useState)(!1),
      [Z, J] = (0, s.useState)(null),
      Q = (0, s.useRef)(null),
      ee = void 0 !== b ? b : q,
      et = e => {
        y ? y(e) : Y(e)
      };
    (0, s.useEffect)(() => {
      if (C.busy) {
        W(0), X.current = null;
        let e = setInterval(() => {
          W(e => e + 1)
        }, 1e3);
        return () => clearInterval(e)
      }
      W(0), G(null), F(null), A(""), R(0), X.current = null
    }, [C.busy]), (0, s.useEffect)(() => {
      let t, s = !1;
      return e.A(23982).then(({
        listen: e
      }) => e("vieneu-turbo-runtime-progress", e => {
        let t = Date.now(),
          s = e.payload.bytesDownloaded ?? 0,
          i = e.payload.bytesTotal ?? 0;
        if (R(s), _(i), A(e.payload.stage ?? ""), F(e.payload.etaSeconds ?? null), "downloading" === (e.payload.stage ?? "").toLowerCase())
          if (null != e.payload.speedBytesPerSec) G(e.payload.speedBytesPerSec);
          else if (X.current) {
          let e = (t - X.current.time) / 1e3,
            i = s - X.current.bytes;
          e >= .5 && i > 0 && (G(Math.round(i / e)), X.current = {
            bytes: s,
            time: t
          })
        } else s > 0 && (X.current = {
          bytes: s,
          time: t
        });
        else G(null), F(null), X.current = null
      })).then(e => {
        s ? e() : t = e
      }).catch(() => {}), () => {
        s = !0, t?.()
      }
    }, []);
    let es = function(e) {
      let {
        phase: t,
        stage: s = "",
        bytesDownloaded: i = 0,
        bytesTotal: n = 0,
        speedBytesPerSec: r = null,
        etaSeconds: a = null,
        elapsedSeconds: l = 0
      } = e, o = Math.max(0, i ?? 0), d = Math.max(0, n ?? 0), c = Math.max(0, l);
      if ("loading-voices" === t) return {
        phaseKey: "loading-voices",
        title: "Đang nạp danh sách giọng đọc…",
        detail: c > 0 ? `Khởi động tiến tr\xecnh xử l\xfd giọng n\xf3i offline (${c}s)` : "Khởi động tiến trình xử lý giọng nói offline",
        percent: null,
        cancelLabel: null,
        isCancelable: !1
      };
      if ("checking" === t) return {
        phaseKey: "checking",
        title: "Đang xác minh tài nguyên…",
        detail: c > 0 ? `Kiểm tra t\xednh to\xe0n vẹn của m\xf4 h\xecnh AI offline (${c}s)` : "Kiểm tra tính toàn vẹn của mô hình AI offline",
        percent: null,
        cancelLabel: null,
        isCancelable: !1
      };
      if ("enrolling" === t) return {
        phaseKey: "enrolling",
        title: "Đang phân tích và nhân bản giọng đọc…",
        detail: c > 0 ? `Thời gian đ\xe3 chạy: ${c}s` : null,
        percent: null,
        cancelLabel: "Hủy",
        isCancelable: !0
      };
      if ("deleting" === t) return {
        phaseKey: "deleting",
        title: "Đang xóa giọng đọc…",
        detail: null,
        percent: null,
        cancelLabel: null,
        isCancelable: !1
      };
      if ("installing" === t) {
        let e = (s ?? "").toLowerCase();
        if ("downloading" === e && d > 0 && o < d) {
          let e = Math.min(99, Math.round(o / d * 100)),
            t = (o / 1048576).toFixed(1),
            s = (d / 1048576).toFixed(1),
            i = null == r || r <= 0 ? null : r >= 1048576 ? `${(r/1048576).toFixed(1)} MB/s` : `${Math.round(r/1024)} KB/s`,
            n = function(e) {
              if (null == e || e < 0) return null;
              if (e < 60) return `C\xf2n khoảng ${e} gi\xe2y`;
              let t = Math.floor(e / 60),
                s = e % 60;
              return s > 0 ? `C\xf2n khoảng ${t} ph\xfat ${s} gi\xe2y` : `C\xf2n khoảng ${t} ph\xfat`
            }(a),
            l = `${t} MB / ${s} MB`;
          return i && (l += ` \xb7 ${i}`), n ? l += ` \xb7 ${n}` : l += c > 0 ? ` \xb7 Đang ước t\xednh… (${c}s)` : " · Đang ước tính…", {
            phaseKey: "downloading",
            title: `Đang tải t\xe0i nguy\xean m\xf4 h\xecnh (${e}%)`,
            detail: l,
            percent: e,
            cancelLabel: "Hủy tải",
            isCancelable: !0
          }
        }
        if ("extracting" === e || "ready" === e && o >= d) return {
          phaseKey: "extracting",
          title: "Đang giải nén tài nguyên mô hình…",
          detail: c > 0 ? `Thiết lập m\xf4i trường AI offline… (${c}s)` : "Thiết lập môi trường AI offline…",
          percent: null,
          cancelLabel: "Hủy",
          isCancelable: !0
        };
        if ("verifying" === e) {
          let e = d > 0 ? (d / 1048576).toFixed(1) : null;
          return {
            phaseKey: "verifying",
            title: "Đang xác minh tài nguyên…",
            detail: d > 0 && o >= d && e ? `Đ\xe3 tải ${e} MB \xb7 Đang kiểm tra m\xe3 to\xe0n vẹn SHA-256` : c > 0 ? `Kiểm tra t\xednh to\xe0n vẹn của m\xf4 h\xecnh… (${c}s)` : "Kiểm tra tính toàn vẹn của mô hình…",
            percent: null,
            cancelLabel: "Hủy",
            isCancelable: !0
          }
        }
        return {
          phaseKey: "busy",
          title: "Đang chuẩn bị tài nguyên…",
          detail: c > 0 ? `Đang kết nối… (${c}s)` : "Đang kết nối…",
          percent: null,
          cancelLabel: "Hủy tải",
          isCancelable: !0
        }
      }
      return {
        phaseKey: "busy",
        title: "Đang xử lý…",
        detail: null,
        percent: null,
        cancelLabel: null,
        isCancelable: !1
      }
    }({
      phase: C.phase,
      stage: z,
      bytesDownloaded: $,
      bytesTotal: U || (C.status?.sizeBytes ?? 0),
      speedBytesPerSec: O,
      etaSeconds: K,
      elapsedSeconds: H
    });
    async function ei(t) {
      try {
        let {
          open: s
        } = await e.A(27431), i = await s({
          multiple: !1,
          filters: ["zip" === t ? {
            name: "Gói nén ZIP",
            extensions: ["zip"]
          } : {
            name: "Âm thanh (WAV, MP3)",
            extensions: ["wav", "mp3", "WAV", "MP3"]
          }]
        });
        "string" == typeof i && ("zip" === t ? await C.install(i) : (D(i), J(null)))
      } catch (e) {
        S.useVieNeuTurboStore.setState({
          error: String(e)
        })
      }
    }
    let en = async () => {
      if (!I.trim() || !V || !B || C.busy) return;
      let e = await C.enroll(I.trim(), V, P);
      e && (L(""), D(""), E(!1), et(!1), i?.(e.voice_id))
    }, er = V ? V.split(/[\\/]/).pop() : null;
    return C.status?.ready ? void 0 === b || ee ? (0, t.jsxs)("div", {
      className: (0, N.cn)("space-y-3", j),
      children: [ee ? (0, t.jsxs)("div", {
        className: "relative rounded-md border border-border bg-card p-3.5 shadow-xs transition-all",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center justify-between border-b border-border/60 pb-2.5",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center gap-2",
            children: [(0, t.jsx)("div", {
              className: "flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary",
              children: (0, t.jsx)(n, {
                className: "h-3.5 w-3.5"
              })
            }), (0, t.jsx)("h4", {
              className: "text-xs font-semibold text-foreground",
              children: "Tạo bản sao giọng nói mới (Voice Clone)"
            })]
          }), (0, t.jsx)(g.Button, {
            size: "icon",
            variant: "ghost",
            className: "h-6 w-6 rounded text-muted-foreground hover:text-foreground",
            onClick: () => et(!1),
            children: (0, t.jsx)(p.X, {
              className: "h-3.5 w-3.5"
            })
          })]
        }), (0, t.jsxs)("div", {
          className: "mt-3 space-y-3 text-xs",
          children: [(0, t.jsxs)("div", {
            className: "space-y-1",
            children: [(0, t.jsx)(w, {
              className: "text-[11px] font-medium text-foreground",
              children: "1. Đặt tên giọng đọc"
            }), (0, t.jsx)(f.Input, {
              value: I,
              onChange: e => L(e.target.value),
              maxLength: 80,
              placeholder: "Ví dụ: Giọng đọc của Tuấn, Giọng Mai review...",
              className: "h-8 rounded text-xs bg-muted/20",
              disabled: C.busy
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-1.5",
            children: [(0, t.jsx)(w, {
              className: "text-[11px] font-medium text-foreground",
              children: "2. Chọn file âm thanh mẫu (WAV hoặc MP3 từ 3–8 giây)"
            }), V ? (0, t.jsxs)("div", {
              className: "space-y-2 rounded-md border border-border/80 bg-muted/20 p-2.5",
              children: [(0, t.jsxs)("div", {
                className: "flex items-center justify-between gap-2",
                children: [(0, t.jsxs)("div", {
                  className: "flex min-w-0 items-center gap-2",
                  children: [(0, t.jsx)(d.Volume2, {
                    className: "h-3.5 w-3.5 shrink-0 text-primary"
                  }), (0, t.jsx)("p", {
                    className: "truncate font-medium text-foreground",
                    title: V,
                    children: er
                  })]
                }), (0, t.jsxs)(g.Button, {
                  size: "sm",
                  variant: "ghost",
                  className: "h-6 rounded text-[11px] text-muted-foreground hover:text-foreground",
                  disabled: C.busy,
                  onClick: () => void ei("audio"),
                  children: [(0, t.jsx)(c.RotateCcw, {
                    className: "mr-1 h-3 w-3"
                  }), "Đổi file"]
                })]
              }), (0, t.jsx)("div", {
                className: "flex items-center gap-2 rounded bg-background/80 px-2 py-1",
                children: (0, t.jsx)("audio", {
                  ref: Q,
                  controls: !0,
                  src: (0, T.resolveMediaSrc)(V),
                  className: "h-7 w-full",
                  onError: () => J("Không phát được định dạng âm thanh này")
                })
              }), Z ? (0, t.jsx)("p", {
                className: "text-[10px] text-destructive",
                children: Z
              }) : null]
            }) : (0, t.jsxs)("button", {
              type: "button",
              disabled: C.busy,
              onClick: () => void ei("audio"),
              className: "flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border p-3.5 text-center transition-colors hover:border-primary/50 hover:bg-muted/30",
              children: [(0, t.jsx)(r, {
                className: "h-5 w-5 text-muted-foreground"
              }), (0, t.jsx)("p", {
                className: "font-medium text-foreground",
                children: "Bấm để chọn file WAV hoặc MP3 từ máy tính"
              }), (0, t.jsx)("p", {
                className: "text-[10px] text-muted-foreground",
                children: "Khuyến nghị: Giọng đọc rõ chữ, tốc độ vừa phải, không có nhạc nền hay tạp âm lớn"
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "space-y-2 border-t border-border/40 pt-2.5",
            children: [(0, t.jsxs)("label", {
              className: "flex items-center gap-2 cursor-pointer select-none text-[11px] text-foreground",
              children: [(0, t.jsx)(v.Checkbox, {
                checked: P,
                onCheckedChange: e => M(!!e),
                disabled: C.busy
              }), (0, t.jsx)("span", {
                children: "Tự động khử ồn và làm sạch âm thanh (Denoise)"
              })]
            }), (0, t.jsxs)("label", {
              className: "flex items-start gap-2 cursor-pointer select-none text-[11px] text-muted-foreground",
              children: [(0, t.jsx)(v.Checkbox, {
                checked: B,
                onCheckedChange: e => E(!!e),
                disabled: C.busy,
                className: "mt-0.5"
              }), (0, t.jsx)("span", {
                className: "leading-tight",
                children: "Đây là giọng nói của tôi hoặc tôi đã có sự cho phép hợp pháp để sử dụng. Âm thanh được xử lý hoàn toàn trên máy tính cá nhân."
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "flex items-center justify-end gap-2 pt-1",
            children: [(0, t.jsx)(g.Button, {
              size: "sm",
              variant: "ghost",
              className: "h-7 rounded text-xs",
              disabled: C.busy,
              onClick: () => et(!1),
              children: "Đóng"
            }), (0, t.jsx)(g.Button, {
              size: "sm",
              className: "h-7 rounded gap-1.5 text-xs shadow-xs",
              disabled: C.busy || !B || !I.trim() || !V,
              onClick: () => void en(),
              children: C.busy && "enrolling" === C.phase ? (0, t.jsxs)(t.Fragment, {
                children: [(0, t.jsx)(o.Loader2, {
                  className: "h-3.5 w-3.5 animate-spin"
                }), "Đang tạo giọng…"]
              }) : (0, t.jsxs)(t.Fragment, {
                children: [(0, t.jsx)(a.CheckCircle2, {
                  className: "h-3.5 w-3.5"
                }), "Tạo và lưu giọng"]
              })
            })]
          })]
        })]
      }) : (0, t.jsxs)("div", {
        className: "flex items-center justify-between rounded-md border border-border bg-muted/30 p-2.5",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-2.5",
          children: [(0, t.jsx)("div", {
            className: "flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary",
            children: (0, t.jsx)(n, {
              className: "h-3.5 w-3.5"
            })
          }), (0, t.jsxs)("div", {
            children: [(0, t.jsx)("p", {
              className: "text-xs font-semibold text-foreground",
              children: "Clone giọng nói cá nhân"
            }), (0, t.jsx)("p", {
              className: "text-[10px] text-muted-foreground",
              children: "Tạo giọng đọc mới từ file thu âm 3-8 giây (chạy ngoại tuyến 100%)"
            })]
          })]
        }), (0, t.jsxs)(g.Button, {
          size: "sm",
          variant: "outline",
          className: "h-7 rounded gap-1.5 text-xs font-medium",
          disabled: C.busy,
          onClick: () => et(!0),
          children: [(0, t.jsx)(n, {
            className: "h-3.5 w-3.5"
          }), "+ Tạo giọng mới"]
        })]
      }), C.busy && "enrolling" !== C.phase ? (0, t.jsxs)("div", {
        className: "flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs",
        children: [(0, t.jsxs)("span", {
          className: "flex items-center gap-2 text-foreground",
          role: "status",
          children: [(0, t.jsx)(o.Loader2, {
            className: "h-3.5 w-3.5 animate-spin text-primary"
          }), (0, t.jsx)("span", {
            children: es.title
          }), es.detail ? (0, t.jsxs)("span", {
            className: "text-muted-foreground font-mono text-[11px]",
            children: ["(", es.detail, ")"]
          }) : null]
        }), es.cancelLabel ? (0, t.jsx)(g.Button, {
          size: "sm",
          variant: "ghost",
          className: "h-6 text-[10px]",
          onClick: () => {
            (0, k.cancelTurboInstall)(), (0, k.cancelTurboOperation)()
          },
          children: es.cancelLabel
        }) : null]
      }) : null, C.error ? (0, t.jsxs)("div", {
        className: "flex items-center gap-1.5 rounded-lg bg-destructive/10 p-2 text-xs text-destructive",
        role: "alert",
        children: [(0, t.jsx)(l.AlertCircle, {
          className: "h-3.5 w-3.5 shrink-0"
        }), (0, t.jsx)("span", {
          children: C.error
        })]
      }) : null]
    }) : null : (0, t.jsxs)("div", {
      className: (0, N.cn)("rounded-md border border-border bg-card p-3.5 text-xs shadow-xs", j),
      children: [(0, t.jsx)("div", {
        className: "flex items-start justify-between gap-3",
        children: (0, t.jsxs)("div", {
          className: "flex items-center gap-2.5",
          children: [(0, t.jsx)("div", {
            className: "flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary",
            children: (0, t.jsx)(u.Sparkles, {
              className: "h-4 w-4"
            })
          }), (0, t.jsxs)("div", {
            children: [(0, t.jsx)("h3", {
              className: "text-xs font-semibold text-foreground",
              children: "Kích hoạt Mô hình AI & Clone giọng (Offline)"
            }), (0, t.jsx)("p", {
              className: "text-[11px] text-muted-foreground",
              children: "Chất lượng phòng thu 48kHz, xử lý riêng tư 100% trên máy tính của bạn"
            })]
          })]
        })
      }), (0, t.jsxs)("div", {
        className: "mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-1.5 rounded border border-border/60 bg-muted/30 p-2 text-[11px]",
          children: [(0, t.jsx)(m.ShieldCheck, {
            className: "h-3.5 w-3.5 shrink-0 text-muted-foreground"
          }), (0, t.jsx)("span", {
            children: "100% Riêng tư trên máy"
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center gap-1.5 rounded border border-border/60 bg-muted/30 p-2 text-[11px]",
          children: [(0, t.jsx)(h.Cpu, {
            className: "h-3.5 w-3.5 shrink-0 text-muted-foreground"
          }), (0, t.jsx)("span", {
            children: "Tối ưu CPU, không cần GPU"
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center gap-1.5 rounded border border-border/60 bg-muted/30 p-2 text-[11px]",
          children: [(0, t.jsx)(n, {
            className: "h-3.5 w-3.5 shrink-0 text-muted-foreground"
          }), (0, t.jsx)("span", {
            children: "Nhân bản từ mẫu 3-8s"
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center gap-1.5 rounded border border-border/60 bg-muted/30 p-2 text-[11px]",
          children: [(0, t.jsx)(u.Sparkles, {
            className: "h-3.5 w-3.5 shrink-0 text-muted-foreground"
          }), (0, t.jsx)("span", {
            children: "Âm thanh 48kHz tự nhiên"
          })]
        })]
      }), C.status?.sizeBytes ? (0, t.jsxs)("p", {
        className: "mt-2 text-[10px] text-muted-foreground",
        children: ["Dung lượng tải: ~", (C.status.sizeBytes / 1048576).toFixed(0), " MB · Dung lượng sau cài đặt: ~", (C.status.installedSizeBytes / 1048576).toFixed(0), " MB"]
      }) : null, C.busy ? (0, t.jsxs)("div", {
        className: "mt-3 space-y-2 rounded border border-primary/20 bg-primary/5 p-2.5",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center justify-between text-xs",
          children: [(0, t.jsxs)("span", {
            className: "flex items-center gap-1.5 font-medium text-foreground",
            role: "status",
            children: [(0, t.jsx)(o.Loader2, {
              className: "h-3.5 w-3.5 animate-spin text-primary shrink-0"
            }), (0, t.jsx)("span", {
              children: es.title
            })]
          }), es.cancelLabel ? (0, t.jsx)(g.Button, {
            size: "sm",
            variant: "ghost",
            className: "h-6 rounded text-[10px] text-muted-foreground hover:text-foreground",
            onClick: () => {
              (0, k.cancelTurboInstall)(), (0, k.cancelTurboOperation)()
            },
            children: es.cancelLabel
          }) : null]
        }), es.detail ? (0, t.jsx)("p", {
          className: "text-[11px] text-muted-foreground font-mono",
          children: es.detail
        }) : null, null !== es.percent ? (0, t.jsx)("div", {
          className: "h-1.5 w-full overflow-hidden rounded bg-primary/20",
          children: (0, t.jsx)("div", {
            className: "h-full bg-primary transition-all duration-300",
            style: {
              width: `${es.percent}%`
            }
          })
        }) : (0, t.jsx)("div", {
          className: "h-1.5 w-full overflow-hidden rounded bg-primary/20",
          children: (0, t.jsx)("div", {
            className: "h-full w-1/3 animate-indeterminate bg-primary"
          })
        })]
      }) : (0, t.jsxs)("div", {
        className: "mt-3 flex flex-wrap items-center gap-2",
        children: [C.status?.downloadable ? (0, t.jsxs)(g.Button, {
          size: "sm",
          className: "h-7 rounded gap-1.5 text-xs shadow-xs",
          disabled: C.busy,
          onClick: () => void C.install(),
          children: [(0, t.jsx)(x.Download, {
            className: "h-3.5 w-3.5"
          }), "Tải và kích hoạt tài nguyên"]
        }) : (0, t.jsx)("p", {
          className: "text-xs text-muted-foreground",
          children: "Gói tải trực tuyến hiện chưa sẵn sàng. Bạn có thể cài đặt bằng file ZIP bên dưới."
        }), (0, t.jsx)(g.Button, {
          size: "sm",
          variant: "outline",
          className: "h-7 rounded text-xs",
          disabled: C.busy || !C.status?.localInstallable,
          onClick: () => void ei("zip"),
          children: "Cài từ gói ZIP"
        })]
      }), C.error ? (0, t.jsxs)("div", {
        className: "mt-2 flex items-center gap-1.5 text-[11px] text-destructive",
        role: "alert",
        children: [(0, t.jsx)(l.AlertCircle, {
          className: "h-3.5 w-3.5 shrink-0"
        }), (0, t.jsx)("span", {
          children: C.error
        })]
      }) : null]
    })
  }], 50157);
  var C = e.i(41120),
    I = e.i(73474),
    L = e.i(87486),
    V = e.i(76223),
    D = e.i(55313);
  e.s(["TtssieureKeyFields", 0, function() {
    let e = (0, D.useTtssieureStore)(e => e.keyStatus),
      i = (0, D.useTtssieureStore)(e => e.keyStatusLoading),
      [n, r] = (0, s.useState)(""),
      [a, l] = (0, s.useState)(!1),
      [d, c] = (0, s.useState)(!1),
      [u, h] = (0, s.useState)(null);
    (0, s.useEffect)(() => {
      D.useTtssieureStore.getState().refreshKeyStatus().catch(() => {})
    }, []);
    let x = e?.configured === !0,
      p = async () => {
        let e = n.trim();
        if (e && !a) {
          l(!0), h(null);
          try {
            await D.useTtssieureStore.getState().saveKey(e), r(""), h({
              tone: "success",
              message: "Đã lưu API key vào bộ nhớ bảo mật của hệ điều hành."
            })
          } catch (e) {
            h({
              tone: "error",
              message: (0, V.ttssieureErrorMessage)(e)
            })
          } finally {
            l(!1)
          }
        }
      }, v = async () => {
        if (!d) {
          c(!0), h(null);
          try {
            await D.useTtssieureStore.getState().clearKey(), h({
              tone: "success",
              message: "Đã xóa API key."
            })
          } catch (e) {
            h({
              tone: "error",
              message: (0, V.ttssieureErrorMessage)(e)
            })
          } finally {
            c(!1)
          }
        }
      }, b = async () => {
        try {
          await D.useTtssieureStore.getState().refreshKeyStatus()
        } catch (e) {
          h({
            tone: "error",
            message: (0, V.ttssieureErrorMessage)(e)
          })
        }
      };
    return (0, t.jsxs)("div", {
      className: "space-y-2",
      "data-provider-setup": "ttssieure",
      children: [(0, t.jsxs)("div", {
        className: "flex items-center justify-between gap-2",
        children: [(0, t.jsx)("p", {
          className: "text-[11px] font-semibold text-foreground",
          children: "API key TTSsieure.com"
        }), (0, t.jsx)(L.Badge, {
          variant: x ? "success" : "outline",
          className: "h-5 shrink-0 px-2 text-[10px]",
          children: x ? "Đã nhập key" : "Chưa nhập key"
        })]
      }), (0, t.jsxs)("div", {
        className: "flex items-center gap-2",
        children: [(0, t.jsx)(f.Input, {
          type: "password",
          autoComplete: "off",
          placeholder: x ? "Nhập key mới để thay thế…" : "Dán API key TTSsieure…",
          value: n,
          onChange: e => r(e.target.value),
          className: "h-8 flex-1 text-xs",
          disabled: a
        }), (0, t.jsxs)(g.Button, {
          type: "button",
          size: "sm",
          className: "h-8 shrink-0 gap-1.5 text-xs",
          disabled: !n.trim() || a,
          onClick: () => void p(),
          children: [a ? (0, t.jsx)(o.Loader2, {
            className: "h-3.5 w-3.5 animate-spin"
          }) : (0, t.jsx)(m.ShieldCheck, {
            className: "h-3.5 w-3.5"
          }), "Lưu key"]
        })]
      }), x ? (0, t.jsxs)("div", {
        className: "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-background/60 px-2.5 py-1.5 text-[11px]",
        children: [(0, t.jsx)("span", {
          className: "font-mono text-muted-foreground",
          children: e?.maskedHint ?? "••••"
        }), e?.accountLabel ? (0, t.jsx)("span", {
          className: "truncate text-muted-foreground",
          children: e.accountLabel
        }) : null, "number" == typeof e?.balance ? (0, t.jsxs)("span", {
          className: "font-semibold text-foreground",
          children: ["Số dư: ", e.balance, " credit"]
        }) : null, (0, t.jsx)(g.Button, {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "ml-auto h-6 w-6 text-muted-foreground",
          title: "Làm mới số dư",
          disabled: i,
          onClick: () => void b(),
          children: (0, t.jsx)(C.RefreshCw, {
            className: `h-3 w-3 ${i?"animate-spin":""}`
          })
        }), (0, t.jsxs)(g.Button, {
          type: "button",
          variant: "ghost",
          size: "sm",
          className: "h-6 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-destructive",
          disabled: d,
          onClick: () => void v(),
          children: [d ? (0, t.jsx)(o.Loader2, {
            className: "h-3 w-3 animate-spin"
          }) : (0, t.jsx)(I.Trash2, {
            className: "h-3 w-3"
          }), "Xóa key"]
        })]
      }) : null, u ? (0, t.jsx)("p", {
        className: `text-[11px] ${"success"===u.tone?"text-emerald-500":"text-destructive"}`,
        children: u.message
      }) : null, (0, t.jsx)("p", {
        className: "text-[10px] leading-4 text-muted-foreground",
        children: "Đăng nhập tài khoản tại TTSsieure.com để tạo API key rồi dán vào đây. Key được lưu trong bộ nhớ bảo mật của hệ điều hành (Windows DPAPI) — không ghi vào file project hay cài đặt app. Khi bạn duyệt tạo giọng trong Editor, nội dung phụ đề được gửi tới TTSsieure và phí trừ vào tài khoản TTSsieure của bạn."
      })]
    })
  }], 76133)
}, 16327, e => {
  "use strict";
  var t = e.i(26495);
  e.s(["ChevronDown", () => t.default])
}, 70533, 6537, e => {
  "use strict";
  var t = e.i(56420);
  let s = (0, t.default)("library", [
    ["path", {
      d: "m16 6 4 14",
      key: "ji33uf"
    }],
    ["path", {
      d: "M12 6v14",
      key: "1n7gus"
    }],
    ["path", {
      d: "M8 8v12",
      key: "1gg7y9"
    }],
    ["path", {
      d: "M4 4v16",
      key: "6qkkli"
    }]
  ]);
  e.s(["Library", 0, s], 70533);
  let i = (0, t.default)("lock", [
    ["rect", {
      width: "18",
      height: "11",
      x: "3",
      y: "11",
      rx: "2",
      ry: "2",
      key: "1w4ew1"
    }],
    ["path", {
      d: "M7 11V7a5 5 0 0 1 10 0v4",
      key: "fwvmzm"
    }]
  ]);
  e.s(["Lock", 0, i], 6537)
}, 63453, e => {
  "use strict";
  let t = (0, e.i(56420).default)("mic-vocal", [
    ["path", {
      d: "m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12",
      key: "80a601"
    }],
    ["path", {
      d: "M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5",
      key: "j0ngtp"
    }],
    ["circle", {
      cx: "16",
      cy: "7",
      r: "5",
      key: "d08jfb"
    }]
  ]);
  e.s(["Mic2", 0, t], 63453)
}, 25398, e => {
  "use strict";
  let t = (0, e.i(56420).default)("rotate-cw", [
    ["path", {
      d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",
      key: "1p45f6"
    }],
    ["path", {
      d: "M21 3v5h-5",
      key: "1q7to0"
    }]
  ]);
  e.s(["RotateCw", 0, t], 25398)
}, 86563, e => {
  "use strict";
  let t = (0, e.i(56420).default)("star", [
    ["path", {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }]
  ]);
  e.s(["Star", 0, t], 86563)
}, 78909, e => {
  "use strict";
  var t = e.i(43476),
    s = e.i(71645),
    i = e.i(26999),
    n = e.i(75157);
  let r = i.Trigger,
    a = i.Title,
    l = i.Description,
    o = s.forwardRef(({
      className: e,
      ...s
    }, r) => (0, t.jsx)(i.Portal, {
      children: (0, t.jsx)(i.Content, {
        ref: r,
        className: (0, n.cn)("fixed left-[50%] top-[50%] z-50 w-[min(40rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-border bg-card text-card-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", e),
        ...s
      })
    }));
  o.displayName = i.Content.displayName, e.s(["CenteredDropdown", 0, function({
    modal: e = !1,
    ...s
  }) {
    return (0, t.jsx)(i.Root, {
      modal: e,
      ...s
    })
  }, "CenteredDropdownContent", 0, o, "CenteredDropdownDescription", 0, l, "CenteredDropdownTitle", 0, a, "CenteredDropdownTrigger", 0, r])
}, 98534, e => {
  "use strict";
  var t = e.i(43476),
    s = e.i(71645),
    i = e.i(79212),
    n = e.i(50157),
    r = e.i(59727),
    a = e.i(76133),
    l = e.i(72888),
    o = e.i(89664),
    d = e.i(16327),
    c = e.i(82022),
    u = e.i(70533),
    m = e.i(6537),
    h = e.i(63453),
    x = e.i(15281),
    p = e.i(21357),
    g = e.i(77071),
    f = e.i(25398),
    v = e.i(66595),
    b = e.i(86563),
    y = e.i(73474),
    j = e.i(63676),
    N = e.i(19455),
    w = e.i(93479),
    S = e.i(76639),
    k = e.i(67489),
    T = e.i(78909),
    C = e.i(27875),
    I = e.i(63511);

  function L(e) {
    return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d")
  }
  var V = e.i(68834),
    D = e.i(79473),
    P = e.i(48868);

  function M(e) {
    if (!Array.isArray(e)) return [];
    let t = new Set,
      s = [];
    for (let i of e)
      if ("string" == typeof i) {
        let e = i.trim();
        e && !t.has(e) && (t.add(e), s.push(e))
      } return s
  }
  let B = (0, V.create)()((0, D.persist)((e, t) => ({
    favorites: [],
    isFavorite: e => {
      if ("string" != typeof e) return !1;
      let s = e.trim();
      return s.length > 0 && t().favorites.includes(s)
    },
    toggleFavorite: t => {
      if ("string" != typeof t) return;
      let s = t.trim();
      s && e(e => ({
        favorites: M(e.favorites.includes(s) ? e.favorites.filter(e => e !== s) : [...e.favorites, s])
      }))
    },
    addFavorite: t => {
      if ("string" != typeof t) return;
      let s = t.trim();
      s && e(e => e.favorites.includes(s) ? e : {
        favorites: M([...e.favorites, s])
      })
    },
    removeFavorite: t => {
      if ("string" != typeof t) return;
      let s = t.trim();
      s && e(e => ({
        favorites: e.favorites.filter(e => e !== s)
      }))
    },
    setFavorites: t => {
      e({
        favorites: M(t)
      })
    },
    clearFavorites: () => {
      e({
        favorites: []
      })
    }
  }), {
    name: "dichvideo-voice-favorites",
    storage: (0, D.createJSONStorage)(() => (0, P.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      favorites: e.favorites
    }),
    merge: (e, t) => ({
      ...t,
      favorites: M(e?.favorites)
    })
  }));
  var E = e.i(5071),
    z = e.i(55313),
    A = e.i(71609),
    $ = e.i(76223);
  e.i(89268);
  var R = e.i(81341),
    U = e.i(24614),
    _ = e.i(88455),
    O = e.i(82139),
    G = e.i(75157);

  function K() {
    return (0, C.getPremiumVoiceOptions)()
  }

  function F(e, t = K()) {
    if (!e) return null;
    if ((0, l.isVieNeuTurboVoiceId)(e)) {
      let t = i.useVieNeuTurboStore.getState().voices.find(t => t.voice_id === e);
      return {
        id: e,
        voice: e,
        provider: "vieneu_turbo",
        shortLabel: t?.name ?? "Giọng Turbo đã chọn",
        label: t?.name ?? "Giọng Turbo đã chọn",
        description: t?.kind === "clone" ? "Giọng của tôi · Clone" : "VieNeu Turbo · 48 kHz"
      }
    }
    return t.find(t => t.id === e) ?? t[0] ?? null
  }
  C.PREMIUM_VOICE_GROUPS.find(e => "cc" === e.id)?.options, e.s(["PremiumVoiceSelect", 0, function({
    value: V,
    onValueChange: D,
    disabled: P = !1,
    previewing: M = !1,
    onPreview: H,
    dichVideoProcessingEnabled: W = !0,
    onTopUpMinutes: X,
    className: q,
    triggerClassName: Y,
    targetLang: Z
  }) {
    let [J, Q] = (0, s.useState)(!1), [ee, et] = (0, s.useState)(""), [es, ei] = (0, s.useState)("all"), [en, er] = (0, s.useState)("all"), [ea, el] = (0, s.useState)("all"), eo = "all" === ea || "saved" === ea || "vieneu" === ea, [ed, ec] = (0, s.useState)(!1), [eu, em] = (0, s.useState)(null), [eh, ex] = (0, s.useState)(null), [ep, eg] = (0, s.useState)(null), [ef, ev] = (0, s.useState)(null), [eb, ey] = (0, s.useState)(""), [ej, eN] = (0, s.useState)(null), ew = (0, i.useVieNeuTurboStore)(), eS = (0, I.useVieNeuCatalogStore)(e => e.status), ek = (0, I.useVieNeuCatalogStore)(e => e.error), eT = (0, E.useDashboardPreferencesStore)(e => e.targetLang), eC = Z ?? eT, eI = (0, E.useDashboardPreferencesStore)(e => e.voiceMode), eL = (0, z.useTtssieureStore)(e => e.keyStatus?.configured === !0), eV = (0, A.useViralVoiceStore)(e => e.status?.connected === !0), eD = (0, z.useTtssieureStore)(e => e.catalogs), eP = (0, z.useTtssieureStore)(e => e.savedVoices), eM = (0, z.useTtssieureStore)(e => e.voiceLists), eB = (0, z.useTtssieureStore)(e => e.dashboardSelection);
    (0, s.useEffect)(() => {
      if (J) {
        i.useVieNeuTurboStore.getState().refresh(), I.useVieNeuCatalogStore.getState().load(), A.useViralVoiceStore.getState().refresh();
        let e = z.useTtssieureStore.getState();
        if (e.refreshKeyStatus().catch(() => {}), e.keyStatus?.configured)
          for (let t of $.TTSSIEURE_PROVIDERS) e.loadCatalog(t).catch(() => {})
      }
    }, [J]), (0, s.useEffect)(() => {
      J || (em(null), e.A(70578).then(e => e.stopPremiumVoicePreview()).catch(() => {}))
    }, [J]), (0, s.useEffect)(() => {
      if (!ef) {
        eN(null), (0, O.stopVoicePreviewAudio)();
        return
      }
      ey(""), z.useTtssieureStore.getState().fetchVoiceList(ef, (0, $.normalizeTtssieureTargetLang)(eC))
    }, [ef, eC]);
    let eE = ef ? eM[ef] : void 0,
      ez = _.TRANSLATION_TARGET_LANGUAGES.find(e => e.code === (0, $.normalizeTtssieureTargetLang)(eC))?.viName,
      eA = (eE?.list?.voices ?? []).filter(e => {
        let t = eb.trim().toLowerCase();
        return !t || e.name.toLowerCase().includes(t) || e.voiceId.toLowerCase().includes(t) || (e.description ?? "").toLowerCase().includes(t)
      }),
      e$ = ew.voices.map(e => ({
        id: e.voice_id,
        voice: e.voice_id,
        provider: "vieneu_turbo",
        label: e.name,
        shortLabel: e.name,
        description: "clone" === e.kind ? "Giọng clone cá nhân · 48 kHz" : "VieNeu Turbo · 48 kHz",
        demoAudioPath: ""
      })),
      eR = [],
      eU = {};
    for (let e of $.TTSSIEURE_PROVIDERS) {
      let t = eD[e],
        s = t?.snapshot,
        i = (0, $.ttssieureModelInfo)(s)?.modelId ?? $.TTSSIEURE_ALLOWED_MODELS[e],
        n = (0, $.ttssieureLanguageSupport)(e, eC, s),
        r = null != s && !n.supported,
        a = `${(0,$.ttssieureProviderLabel)(e)} \xb7 ${i}`;
      for (let t of eP) {
        if (t.provider !== e) continue;
        let s = (0, $.ttssieureVoiceOptionId)(e, i, t.voiceId);
        eU[s] = t, eR.push({
          id: s,
          voice: t.voiceId,
          provider: "ttssieure",
          label: t.name,
          shortLabel: t.name,
          description: r ? `${a} — ${n.reason??"không hỗ trợ ngôn ngữ đích"}` : `${a} \xb7 ${t.voiceId} \xb7 ${t.verifiedAtMs?"đã xác minh":"chưa xác minh"}`,
          disabled: r,
          demoAudioPath: ""
        })
      }
    }
    let e_ = [{
        id: "vieneu-clone",
        label: "Giọng của tôi",
        options: e$.filter(e => e.id.startsWith("vnt:clone:"))
      }, ...C.PREMIUM_VOICE_GROUPS.map(e => "vieneu" === e.id ? {
        ...e,
        options: [...e.options, ...e$.filter(e => e.id.startsWith("vnt:preset:"))]
      } : e), {
        id: "ttssieure",
        label: "Giọng đã lưu · TTSsieure.com",
        options: eR
      }],
      eO = B(e => e.favorites),
      eG = B(e => e.toggleFavorite),
      eK = B(e => e.isFavorite),
      eF = (0, $.parseTtssieureVoiceId)(V),
      eH = null !== eB && eB.targetLang === (0, $.normalizeTtssieureTargetLang)(eC) && (!!eF?.modelId || !V && "none" === eI),
      eW = V && (0, l.isVieNeuTurboVoiceId)(V) ? e$.find(e => e.id === V) ?? {
        id: V,
        voice: V,
        provider: "vieneu_turbo",
        label: "Giọng Turbo đã chọn",
        shortLabel: "Giọng Turbo đã chọn",
        description: "VieNeu Turbo"
      } : eF?.modelId ? {
        id: V,
        voice: eF.voiceId,
        provider: "ttssieure",
        label: eB?.displayName ?? eF.voiceId,
        shortLabel: eB?.displayName ?? eF.voiceId,
        description: `${(0,$.ttssieureProviderLabel)(eF.provider)} \xb7 trả ph\xed qua TTSSieure`
      } : eH && eB ? {
        id: (0, $.ttssieureVoiceOptionId)(eB.provider, eB.modelId, eB.voiceId),
        voice: eB.voiceId,
        provider: "ttssieure",
        label: eB.displayName ?? eB.voiceId,
        shortLabel: eB.displayName ?? eB.voiceId,
        description: `${(0,$.ttssieureProviderLabel)(eB.provider)} \xb7 trả ph\xed qua TTSSieure`
      } : F(V),
      eX = !!eW,
      eq = eW?.shortLabel ?? "Chọn giọng đọc",
      eY = function(e, t) {
        let s = e.reduce((e, t) => e + t.options.length, 0);
        if (void 0 !== t) {
          let i = t instanceof Set ? t : Array.isArray(t) ? new Set(t.filter(e => "string" == typeof e && e.trim().length > 0)) : new Set,
            n = new Set;
          for (let t of e)
            for (let e of t.options) n.add(e.id);
          let r = 0;
          for (let e of i) n.has(e) && r++;
          return [{
            id: "all",
            label: "Tất cả",
            count: s
          }, {
            id: "saved",
            label: "Đã lưu",
            count: r
          }, ...e.map(e => ({
            id: e.id,
            label: "vieneu" === e.id ? "Giọng cao cấp" : e.label,
            count: e.options.length
          }))]
        }
        return [{
          id: "all",
          label: "Tất cả",
          count: s
        }, ...e.map(e => ({
          id: e.id,
          label: "vieneu" === e.id ? "Giọng cao cấp" : e.label,
          count: e.options.length
        }))]
      }(e_, eO),
      eZ = eY.find(e => "saved" === e.id),
      eJ = eZ?.count ?? 0,
      eQ = e_.find(e => "vieneu-clone" === e.id),
      e0 = eQ?.options.length ?? 0,
      e1 = function(e, t, s, i, n = "all", r = "all") {
        let a = s.trim().toLowerCase(),
          l = L(s.trim()),
          o = i instanceof Set ? i : Array.isArray(i) ? new Set(i.filter(e => "string" == typeof e && e.trim().length > 0)) : null;
        return e.filter(e => "all" === t || "saved" === t || e.id === t).map(e => ({
          ...e,
          options: e.options.filter(e => {
            if ("saved" === t && (!o || !o.has(e.id))) return !1;
            if ("all" !== n) {
              if (e.gender && e.gender !== n) return !1;
              if (!e.gender) {
                let t = /nữ|nu\b|female/i.test(e.label + " " + e.description),
                  s = /nam\b|male/i.test(e.label + " " + e.description);
                if ("female" === n && !t || "male" === n && !s) return !1
              }
            }
            if ("all" !== r) {
              let t = L(r),
                s = e.region ? L(e.region) : "",
                i = L(e.label + " " + e.description);
              if (!s.includes(t) && !i.includes(t)) return !1
            }
            if (a) {
              let t = [e.label, e.shortLabel, e.description, e.categoryLabel ?? "", e.region ?? ""],
                s = t.some(e => e.toLowerCase().includes(a)),
                i = t.some(e => L(e).includes(l));
              if (!s && !i) return !1
            }
            return !0
          })
        })).filter(e => e.options.length > 0)
      }(e_, ea, ee, eO, es, en),
      e5 = K().length + e0;
    return (0, t.jsxs)(T.CenteredDropdown, {
      open: J,
      onOpenChange: Q,
      children: [(0, t.jsxs)("div", {
        className: (0, G.cn)("relative h-9 min-w-[10.5rem] max-w-full", q),
        children: [(0, t.jsx)(T.CenteredDropdownTrigger, {
          asChild: !0,
          children: (0, t.jsxs)(N.Button, {
            type: "button",
            variant: "outline",
            className: (0, G.cn)("group min-h-9 w-full min-w-0 justify-between gap-2 rounded px-2.5 py-1.5 text-left text-xs font-semibold transition-colors", eX ? "border-primary/40 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-background/70 hover:text-foreground", Y),
            disabled: P,
            title: eW ? `Giọng đọc: ${eW.label}` : "Chọn giọng đọc",
            children: [(0, t.jsxs)("span", {
              className: "flex min-w-0 items-center gap-1.5",
              children: [(0, t.jsx)(h.Mic2, {
                className: "h-3.5 w-3.5 shrink-0"
              }), (0, t.jsx)("span", {
                className: "sr-only",
                children: "Giọng đọc"
              }), (0, t.jsx)("span", {
                className: "min-w-0 truncate",
                children: eq
              }), V && (0, l.isVieNeuTurboVoiceId)(V) ? (0, t.jsx)("span", {
                className: "shrink-0 rounded bg-primary-foreground/20 px-1 py-0.2 text-[9px] font-normal uppercase",
                children: V.startsWith("vnt:clone:") ? "Clone" : "Turbo"
              }) : null, eW?.provider === "ttssieure" ? (0, t.jsx)("span", {
                className: "shrink-0 rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-normal uppercase text-amber-200",
                children: "TTSsieure"
              }) : null]
            }), (0, t.jsx)(d.ChevronDown, {
              className: (0, G.cn)("h-3.5 w-3.5 shrink-0 opacity-70 transition-transform", J && "rotate-180")
            })]
          })
        }), (0, t.jsxs)(T.CenteredDropdownContent, {
          className: "flex h-[min(78vh,44rem)] w-[min(48rem,calc(100vw-2rem))] flex-col overflow-hidden p-0 rounded-lg border border-border bg-card shadow-2xl",
          children: [(0, t.jsxs)("div", {
            className: "flex items-center justify-between border-b border-border px-4 py-2.5",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsx)(h.Mic2, {
                className: "h-4 w-4 shrink-0 text-primary"
              }), (0, t.jsxs)("div", {
                children: [(0, t.jsx)(T.CenteredDropdownTitle, {
                  className: "text-xs font-semibold",
                  children: "Thư viện giọng đọc"
                }), (0, t.jsxs)(T.CenteredDropdownDescription, {
                  className: "text-[10px] text-muted-foreground",
                  children: [e5, " giọng đọc tiếng Việt · Hỗ trợ clone giọng ngoại tuyến"]
                })]
              })]
            }), ew.status?.ready ? (0, t.jsxs)(N.Button, {
              type: "button",
              size: "sm",
              className: "h-8 shrink-0 gap-1.5 rounded bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
              onClick: () => {
                el("vieneu-clone"), ec(!0)
              },
              children: [(0, t.jsx)(h.Mic2, {
                className: "h-3.5 w-3.5"
              }), (0, t.jsx)("span", {
                children: "+ Tạo giọng mới"
              })]
            }) : null, (0, t.jsx)(N.Button, {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7 text-muted-foreground hover:text-foreground",
              onClick: () => Q(!1),
              children: (0, t.jsx)(j.X, {
                className: "h-3.5 w-3.5"
              })
            })]
          }), (0, t.jsxs)("div", {
            className: "flex min-h-0 flex-1",
            children: [(0, t.jsx)("nav", {
              "aria-label": "Nhà cung cấp giọng",
              className: "flex w-44 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-secondary/20 p-2",
              children: eY.map(e => {
                let s = ea === e.id;
                return (0, t.jsxs)("button", {
                  type: "button",
                  "aria-pressed": s,
                  "data-voice-provider-filter": e.id,
                  onClick: () => {
                    el(e.id), "all" !== e.id && "saved" !== e.id && "vieneu" !== e.id && er("all"), "vieneu-clone" === e.id && ec(!1)
                  },
                  className: (0, G.cn)("flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-xs font-semibold transition-colors", s ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"),
                  children: ["saved" === e.id ? (0, t.jsx)(b.Star, {
                    className: (0, G.cn)("h-3 w-3 shrink-0", s ? "fill-primary-foreground text-primary-foreground" : "fill-amber-500 text-amber-500")
                  }) : "vieneu-clone" === e.id ? (0, t.jsx)(h.Mic2, {
                    className: "h-3 w-3 shrink-0"
                  }) : "ttssieure" === e.id ? (0, t.jsx)(u.Library, {
                    className: "h-3 w-3 shrink-0"
                  }) : null, (0, t.jsx)("span", {
                    className: "min-w-0 flex-1 truncate text-left",
                    children: "saved" === e.id ? "Đã lưu" : "vieneu-clone" === e.id ? "Giọng của tôi" : "vieneu" === e.id ? "Giọng cao cấp" : "cc" === e.id ? "Giọng CC" : "dichvideo" === e.id ? "Giọng DichVideo" : "ttssieure" === e.id ? "TTSsieure.com" : e.label
                  }), (0, t.jsxs)("span", {
                    className: "shrink-0 tabular-nums opacity-80",
                    children: ["(", e.count, ")"]
                  })]
                }, e.id)
              })
            }), (0, t.jsxs)("div", {
              className: "flex min-w-0 flex-1 flex-col",
              children: [(0, t.jsxs)("div", {
                className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
                children: [(0, t.jsxs)("div", {
                  className: "relative min-w-[180px] flex-1",
                  children: [(0, t.jsx)(v.Search, {
                    className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                  }), (0, t.jsx)(w.Input, {
                    type: "text",
                    placeholder: "Tìm kiếm giọng đọc (tên, vùng miền, phong cách)...",
                    value: ee,
                    onChange: e => et(e.target.value),
                    className: "h-8 bg-muted/30 pl-8 pr-7 text-xs"
                  }), ee ? (0, t.jsx)("button", {
                    type: "button",
                    onClick: () => et(""),
                    className: "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground",
                    children: (0, t.jsx)(j.X, {
                      className: "h-3 w-3"
                    })
                  }) : null]
                }), (0, t.jsx)("div", {
                  className: "flex items-center rounded-md border border-border bg-secondary/40 p-0.5",
                  children: [{
                    id: "all",
                    label: "Tất cả"
                  }, {
                    id: "male",
                    label: "Nam"
                  }, {
                    id: "female",
                    label: "Nữ"
                  }].map(e => (0, t.jsx)("button", {
                    type: "button",
                    onClick: () => ei(e.id),
                    className: (0, G.cn)("h-6 rounded px-2 text-[11px] font-medium transition-colors", es === e.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"),
                    children: e.label
                  }, e.id))
                }), (0, t.jsx)("div", {
                  className: (0, G.cn)("flex items-center rounded-md border border-border bg-secondary/40 p-0.5", !eo && "opacity-45"),
                  title: eo ? void 0 : "Lọc vùng miền chỉ áp dụng cho Giọng cao cấp và Đã lưu",
                  children: ["all", "Bắc", "Trung", "Nam"].map(e => (0, t.jsx)("button", {
                    type: "button",
                    disabled: !eo,
                    onClick: () => er(e),
                    className: (0, G.cn)("h-6 rounded px-2 text-[11px] font-medium transition-colors", en === e ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground", !eo && "cursor-not-allowed"),
                    children: "all" === e ? "Tất cả miền" : e
                  }, e))
                })]
              }), (0, t.jsxs)("div", {
                className: "min-h-0 flex-1 space-y-3 overflow-y-auto p-3",
                children: [!ew.status?.ready && ("all" === ea || "vieneu" === ea || "vieneu-clone" === ea) || "vieneu-clone" === ea && ed ? (0, t.jsx)(n.VieNeuTurboPanel, {
                  isOpen: ed || !ew.status?.ready,
                  onToggleOpen: ec,
                  onCreated: e => {
                    el("vieneu-clone"), et(""), ec(!1), e && D(e)
                  }
                }) : null, "ttssieure" === ea ? (0, t.jsx)("div", {
                  className: "rounded-md border border-border bg-muted/30 px-2.5 py-2",
                  children: (0, t.jsx)(a.TtssieureKeyFields, {})
                }) : null, "cc" === ea ? (0, t.jsx)("div", {
                  className: "rounded-md border border-border bg-muted/30 px-2.5 py-2",
                  children: (0, t.jsx)(r.CapCutLoginFields, {})
                }) : null, 0 !== e1.length || ed && ew.status?.ready ? null : (0, t.jsx)("div", {
                  className: "p-6 text-center text-xs text-muted-foreground",
                  children: "saved" === ea && 0 === eJ ? "Chưa có giọng đã lưu. Nhấn ☆ bên cạnh giọng để thêm." : "ttssieure" === ea && 0 === eP.length ? (0, t.jsxs)("div", {
                    className: "flex flex-col items-center justify-center gap-2 py-2",
                    children: [(0, t.jsx)("p", {
                      className: "font-semibold text-foreground",
                      children: "Chưa có giọng TTSsieure nào được lưu"
                    }), (0, t.jsx)("p", {
                      className: "max-w-sm text-[11px] text-muted-foreground",
                      children: "Duyệt danh sách giọng TTSsieure ngay trong app — nghe thử miễn phí rồi lưu giọng vào đây. Lưu giọng không trừ credit — chỉ tạo giọng trong Editor mới tính phí."
                    }), (0, t.jsxs)("div", {
                      className: "mt-1 flex items-center gap-2",
                      children: [(0, t.jsxs)(N.Button, {
                        type: "button",
                        size: "sm",
                        className: "h-8 gap-1.5 rounded text-xs",
                        onClick: () => ev("elevenlabs"),
                        children: [(0, t.jsx)(u.Library, {
                          className: "h-3.5 w-3.5"
                        }), "Duyệt giọng TTSSieure"]
                      }), (0, t.jsxs)(N.Button, {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-8 gap-1.5 rounded text-xs",
                        onClick: () => void(0, R.openUrlInSystemBrowser)($.TTSSIEURE_LIBRARY_URL),
                        children: [(0, t.jsx)(c.ExternalLink, {
                          className: "h-3.5 w-3.5"
                        }), "Mở thư viện TTSSieure"]
                      }), (0, t.jsxs)(N.Button, {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-8 gap-1.5 rounded text-xs",
                        onClick: () => {
                          eg(null), ex({
                            mode: "add",
                            provider: "elevenlabs",
                            voiceId: "",
                            name: ""
                          })
                        },
                        children: [(0, t.jsx)(g.Plus, {
                          className: "h-3.5 w-3.5"
                        }), "Thêm giọng bằng ID"]
                      })]
                    })]
                  }) : "vieneu-clone" === ea && 0 === e0 && ew.status?.ready && !ed ? (0, t.jsxs)("div", {
                    className: "flex flex-col items-center justify-center gap-2 py-4",
                    children: [(0, t.jsx)("div", {
                      className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary",
                      children: (0, t.jsx)(h.Mic2, {
                        className: "h-5 w-5"
                      })
                    }), (0, t.jsx)("p", {
                      className: "font-semibold text-foreground",
                      children: "Bạn chưa có giọng clone nào"
                    }), (0, t.jsx)("p", {
                      className: "max-w-xs text-[11px] text-muted-foreground",
                      children: "Tạo bản sao giọng nói bất kỳ từ một file ghi âm 3-8 giây, chạy ngoại tuyến 100%."
                    }), (0, t.jsxs)(N.Button, {
                      type: "button",
                      size: "sm",
                      className: "mt-2 gap-1.5 rounded text-xs shadow-xs",
                      onClick: () => ec(!0),
                      children: [(0, t.jsx)(h.Mic2, {
                        className: "h-3.5 w-3.5"
                      }), "Tạo giọng clone mới"]
                    })]
                  }) : ed ? null : "Không tìm thấy giọng đọc nào phù hợp."
                }), e1.map(s => (0, t.jsxs)("section", {
                  "data-voice-group": s.id,
                  className: "space-y-1",
                  children: [(0, t.jsxs)("p", {
                    className: (0, G.cn)("px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", "vieneu-clone" === s.id && ew.status?.ready && "flex items-center justify-between gap-2"),
                    children: [(0, t.jsx)("span", {
                      children: "dichvideo" === s.id ? "Giọng DichVideo (Cần phút mua)" : "vieneu-clone" === s.id ? "Giọng của tôi" : "vieneu" === s.id ? "Giọng cao cấp" : s.label
                    }), "vieneu-clone" === s.id && ew.status?.ready ? (0, t.jsxs)(N.Button, {
                      type: "button",
                      size: "sm",
                      variant: ed ? "secondary" : "outline",
                      className: "h-6 gap-1 rounded px-2 text-[10px] font-semibold normal-case tracking-normal",
                      onClick: () => ec(!ed),
                      children: [(0, t.jsx)(h.Mic2, {
                        className: "h-3 w-3"
                      }), (0, t.jsx)("span", {
                        children: ed ? "Đóng tạo giọng" : "+ Tạo giọng mới"
                      })]
                    }) : null]
                  }), "dichvideo" !== s.id || W ? null : (0, t.jsxs)("div", {
                    className: "flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5",
                    children: [(0, t.jsx)("p", {
                      className: "text-[10px] leading-4 text-muted-foreground",
                      children: "Cần có phút đã nạp hoặc gói trả phí để dùng Giọng DichVideo."
                    }), X ? (0, t.jsx)(N.Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-7 shrink-0 px-2 text-[10px]",
                      onClick: X,
                      children: "Nạp phút"
                    }) : null]
                  }), "vieneu" === s.id && "loading" === eS ? (0, t.jsx)("div", {
                    className: "flex items-center gap-2 rounded-md bg-muted/50 px-2 py-2 text-[11px] text-muted-foreground",
                    children: "Đang tải danh sách giọng cao cấp…"
                  }) : null, "ttssieure" === s.id ? (0, t.jsxs)("div", {
                    className: "space-y-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5",
                    children: [(0, t.jsx)("p", {
                      className: "text-[10px] leading-4 text-amber-700 dark:text-amber-400",
                      children: "Giọng TTSsieure.com trừ credit tài khoản của bạn khi bạn duyệt tạo trong Editor. Chọn ở đây chỉ lưu giọng — chưa trừ credit, chưa tạo âm thanh."
                    }), eL || "ttssieure" === ea ? null : (0, t.jsx)("p", {
                      className: "text-[10px] leading-4 text-muted-foreground",
                      children: "Nhập API key ở tab TTSsieure.com."
                    }), (0, t.jsxs)("div", {
                      className: "flex flex-wrap items-center gap-1.5 pt-0.5",
                      children: [(0, t.jsxs)(N.Button, {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-7 gap-1.5 rounded text-[11px]",
                        onClick: () => ev("elevenlabs"),
                        children: [(0, t.jsx)(u.Library, {
                          className: "h-3 w-3"
                        }), "Duyệt giọng TTSSieure"]
                      }), (0, t.jsxs)(N.Button, {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-7 gap-1.5 rounded text-[11px]",
                        onClick: () => void(0, R.openUrlInSystemBrowser)($.TTSSIEURE_LIBRARY_URL),
                        children: [(0, t.jsx)(c.ExternalLink, {
                          className: "h-3 w-3"
                        }), "Mở thư viện TTSSieure"]
                      }), (0, t.jsxs)(N.Button, {
                        type: "button",
                        variant: "outline",
                        size: "sm",
                        className: "h-7 gap-1.5 rounded text-[11px]",
                        onClick: () => {
                          eg(null), ex({
                            mode: "add",
                            provider: "elevenlabs",
                            voiceId: "",
                            name: ""
                          })
                        },
                        children: [(0, t.jsx)(g.Plus, {
                          className: "h-3 w-3"
                        }), "Thêm giọng bằng ID"]
                      })]
                    })]
                  }) : null, "vieneu" === s.id && "error" === eS ? (0, t.jsxs)("div", {
                    className: "flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-2",
                    children: [(0, t.jsx)("p", {
                      className: "text-[11px] leading-4 text-muted-foreground",
                      children: ek ?? "Chưa tải được danh sách giọng cao cấp."
                    }), (0, t.jsx)(N.Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-7 shrink-0 px-2 text-[10px]",
                      onClick: () => void I.useVieNeuCatalogStore.getState().retry(),
                      children: "Thử lại"
                    })]
                  }) : null, (0, t.jsx)("div", {
                    className: "grid gap-1 sm:grid-cols-2",
                    children: s.options.map(i => {
                      let n = eW?.id === i.id,
                        r = "dichvideo" === s.id && !W,
                        a = "cc" === s.id && !eV || "ttssieure" === i.provider && !eL,
                        l = eu === i.id;
                      return (0, t.jsxs)("div", {
                        className: (0, G.cn)("grid min-w-0 grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs transition-colors hover:bg-muted/60", n && "border-primary/40 bg-primary/10 text-foreground shadow-sm"),
                        children: [(0, t.jsxs)("button", {
                          type: "button",
                          "data-voice-option": i.id,
                          "data-connection-locked": a || void 0,
                          "aria-pressed": n,
                          className: (0, G.cn)("grid min-w-0 grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", a && "opacity-60"),
                          disabled: P || i.disabled || r,
                          onClick: () => {
                            if (a) {
                              let e = "cc" === s.id ? "cc" : "ttssieure";
                              el(e), "function" == typeof requestAnimationFrame && requestAnimationFrame(() => {
                                document.querySelector(`[data-provider-setup="${e}"]`)?.scrollIntoView({
                                  block: "nearest"
                                })
                              });
                              return
                            }
                            let e = (0, $.parseTtssieureVoiceId)(i.id);
                            if ("ttssieure" === i.provider && e?.modelId) {
                              z.useTtssieureStore.getState().selectDashboardVoice({
                                provider: e.provider,
                                modelId: e.modelId,
                                voiceId: e.voiceId,
                                displayName: i.label
                              }, eC), E.useDashboardPreferencesStore.getState().setVoiceMode("none"), D(i.id), Q(!1);
                              return
                            }
                            z.useTtssieureStore.getState().clearDashboardVoice(), D(i.id), "vieneu_native" !== i.provider || ew.status?.ready ? Q(!1) : (el("vieneu"), ew.refresh())
                          },
                          children: [(0, t.jsx)("span", {
                            className: "flex h-4 w-4 shrink-0 items-center justify-center",
                            children: n ? (0, t.jsx)(o.Check, {
                              className: "h-3.5 w-3.5 text-primary"
                            }) : a ? (0, t.jsx)(m.Lock, {
                              className: "h-3 w-3 text-muted-foreground"
                            }) : null
                          }), (0, t.jsxs)("span", {
                            className: "min-w-0",
                            children: [(0, t.jsxs)("span", {
                              className: "flex items-center gap-1.5 font-medium",
                              children: [(0, t.jsx)("span", {
                                className: "truncate",
                                children: i.shortLabel || i.label
                              }), i.categoryLabel ? (0, t.jsx)("span", {
                                className: "shrink-0 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-normal text-primary",
                                children: i.categoryLabel.split(" ")[0]
                              }) : null]
                            }), (0, t.jsx)("span", {
                              className: "block truncate text-[10px] leading-4 text-muted-foreground",
                              children: a ? "cc" === s.id ? "Đăng nhập CapCut ở đầu tab để chọn giọng này" : "Nhập API key TTSsieure ở đầu tab để chọn giọng này" : i.description
                            })]
                          })]
                        }), (0, t.jsxs)("div", {
                          className: "flex items-center gap-0.5",
                          children: [(0, t.jsx)(N.Button, {
                            type: "button",
                            "data-favorite-voice": i.id,
                            variant: "ghost",
                            size: "icon",
                            className: (0, G.cn)("h-7 w-7 shrink-0 rounded-md transition-colors", eK(i.id) ? "text-amber-500 hover:bg-background/80 hover:text-amber-600" : "text-muted-foreground hover:bg-background/80 hover:text-foreground"),
                            title: eK(i.id) ? `Bỏ lưu giọng ${i.label}` : `Lưu giọng ${i.label}`,
                            "aria-label": eK(i.id) ? `Bỏ lưu giọng ${i.label}` : `Lưu giọng ${i.label}`,
                            "aria-pressed": eK(i.id),
                            onClick: e => {
                              e.preventDefault(), e.stopPropagation(), eG(i.id)
                            },
                            children: (0, t.jsx)(b.Star, {
                              className: (0, G.cn)("h-3.5 w-3.5", eK(i.id) ? "fill-amber-500 text-amber-500" : "text-muted-foreground")
                            })
                          }), (0, t.jsx)(N.Button, {
                            type: "button",
                            "data-preview-voice": i.id,
                            variant: "ghost",
                            size: "icon",
                            className: "h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-background/80 hover:text-foreground",
                            title: "ttssieure" !== i.provider || eU[i.id]?.sampleUrl ? l ? `Đang ph\xe1t ${i.label}` : `Nghe mẫu ${i.label}` : `${i.label} — kh\xf4ng c\xf3 mẫu miễn ph\xed`,
                            "aria-label": `Nghe mẫu ${i.label}`,
                            disabled: P || i.disabled || "ttssieure" !== i.provider && !H || "ttssieure" === i.provider && !eU[i.id]?.sampleUrl || M,
                            onClick: t => ((t, s) => {
                              if (s.preventDefault(), s.stopPropagation(), eu === t) {
                                em(null), e.A(70578).then(e => e.stopPremiumVoicePreview()).catch(() => {});
                                return
                              }
                              let i = (0, $.parseTtssieureVoiceId)(t);
                              if (i?.modelId && (0, R.isTauri)()) return eL ? (em(t), e.A(70578).then(e => e.stopPremiumVoicePreview()).catch(() => {}), void(0, U.ttssieureVoicePreview)({
                                provider: i.provider,
                                modelId: i.modelId,
                                voiceId: i.voiceId,
                                previewUrl: eU[t]?.sampleUrl
                              }).then(e => (0, O.playVoicePreviewAudio)((0, R.resolveMediaSrc)(e))).catch(() => em(null))) : void el("ttssieure");
                              em(t);
                              try {
                                H && H(t)
                              } catch {
                                em(null)
                              }
                            })(i.id, t),
                            children: (0, t.jsx)(p.Play, {
                              className: (0, G.cn)("h-3.5 w-3.5", l && "fill-primary text-primary")
                            })
                          }), "ttssieure" === i.provider && eU[i.id] ? (0, t.jsxs)(t.Fragment, {
                            children: [(0, t.jsx)(N.Button, {
                              type: "button",
                              "data-rename-voice": i.id,
                              variant: "ghost",
                              size: "icon",
                              className: "h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-background/80 hover:text-foreground",
                              title: `Đổi t\xean ${i.label}`,
                              "aria-label": `Đổi t\xean ${i.label}`,
                              onClick: e => {
                                e.preventDefault(), e.stopPropagation();
                                let t = eU[i.id];
                                eg(null), ex({
                                  mode: "edit",
                                  voice: t,
                                  name: t.name
                                })
                              },
                              children: (0, t.jsx)(x.Pencil, {
                                className: "h-3.5 w-3.5"
                              })
                            }), (0, t.jsx)(N.Button, {
                              type: "button",
                              "data-remove-voice": i.id,
                              variant: "ghost",
                              size: "icon",
                              className: "h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-background/80 hover:text-destructive",
                              title: `X\xf3a ${i.label} khỏi danh s\xe1ch đ\xe3 lưu`,
                              "aria-label": `X\xf3a ${i.label} khỏi danh s\xe1ch đ\xe3 lưu`,
                              onClick: async t => {
                                t.preventDefault(), t.stopPropagation();
                                let s = eU[i.id],
                                  {
                                    confirm: n
                                  } = await e.A(27431);
                                await n(`X\xf3a "${s.name}" khỏi danh s\xe1ch giọng đ\xe3 lưu? Chỉ x\xf3a tr\xean m\xe1y n\xe0y — giọng tr\xean TTSsieure kh\xf4ng bị ảnh hưởng.`, {
                                  title: "Xóa giọng TTSsieure đã lưu",
                                  kind: "warning"
                                }) && z.useTtssieureStore.getState().removeSavedVoice(s.provider, s.voiceId)
                              },
                              children: (0, t.jsx)(y.Trash2, {
                                className: "h-3.5 w-3.5"
                              })
                            })]
                          }) : null, "vieneu-clone" === s.id ? (0, t.jsx)(N.Button, {
                            type: "button",
                            variant: "ghost",
                            size: "icon",
                            className: "h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-background/80 hover:text-destructive",
                            title: `X\xf3a giọng ${i.label}`,
                            "aria-label": `X\xf3a giọng ${i.label}`,
                            disabled: ew.busy,
                            onClick: async t => {
                              t.preventDefault(), t.stopPropagation();
                              let {
                                confirm: s
                              } = await e.A(27431);
                              await s(`X\xf3a giọng ${i.label}? Dự \xe1n d\xf9ng giọng n\xe0y sẽ kh\xf4ng tạo lại được audio bằng giọng đ\xf3.`, {
                                title: "Xóa giọng của tôi",
                                kind: "warning"
                              }) && await ew.remove(i.id)
                            },
                            children: (0, t.jsx)(y.Trash2, {
                              className: "h-3.5 w-3.5"
                            })
                          }) : null]
                        })]
                      }, i.id)
                    })
                  })]
                }, s.id))]
              })]
            })]
          })]
        })]
      }), (0, t.jsx)(S.Dialog, {
        open: null !== ef,
        onOpenChange: e => {
          e || ev(null)
        },
        children: (0, t.jsxs)(S.DialogContent, {
          className: "flex h-[min(76vh,42rem)] w-[min(34rem,calc(100vw-2rem))] flex-col",
          children: [(0, t.jsxs)(S.DialogHeader, {
            children: [(0, t.jsx)(S.DialogTitle, {
              className: "text-sm",
              children: "Duyệt giọng TTSSieure"
            }), (0, t.jsxs)(S.DialogDescription, {
              className: "text-[11px]",
              children: ["Danh sách tải một lần theo Ngôn ngữ dịch của project", ez ? ` (${ez})` : "", " — đổi ngôn ngữ ở phần Ngôn ngữ gốc phía trên. Nghe thử miễn phí — lưu giọng không trừ credit."]
            })]
          }), ef ? (0, t.jsxs)("div", {
            className: "flex min-h-0 flex-1 flex-col gap-2",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center gap-2",
              children: [(0, t.jsxs)(k.Select, {
                value: ef,
                onValueChange: e => ev(e),
                children: [(0, t.jsx)(k.SelectTrigger, {
                  className: "h-8 w-44 shrink-0 text-xs",
                  children: (0, t.jsx)(k.SelectValue, {})
                }), (0, t.jsx)(k.SelectContent, {
                  children: $.TTSSIEURE_PROVIDERS.map(e => (0, t.jsxs)(k.SelectItem, {
                    value: e,
                    className: "text-xs",
                    children: [$.TTSSIEURE_PROVIDER_LABELS[e], " · ", $.TTSSIEURE_ALLOWED_MODELS[e]]
                  }, e))
                })]
              }), (0, t.jsxs)("div", {
                className: "relative min-w-0 flex-1",
                children: [(0, t.jsx)(v.Search, {
                  className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                }), (0, t.jsx)(w.Input, {
                  type: "text",
                  placeholder: "Lọc theo tên / mô tả…",
                  value: eb,
                  onChange: e => ey(e.target.value),
                  className: "h-8 bg-muted/30 pl-8 text-xs"
                })]
              }), (0, t.jsx)(N.Button, {
                type: "button",
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
                title: "Tải lại danh sách",
                disabled: eE?.status === "loading",
                onClick: () => void z.useTtssieureStore.getState().fetchVoiceList(ef, (0, $.normalizeTtssieureTargetLang)(eC), {
                  refresh: !0
                }),
                children: (0, t.jsx)(f.RotateCw, {
                  className: (0, G.cn)("h-3.5 w-3.5", eE?.status === "loading" && "animate-spin")
                })
              })]
            }), eL ? eE?.status === "error" ? (0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-2",
              children: [(0, t.jsx)("p", {
                className: "text-[11px] leading-4 text-muted-foreground",
                children: eE.error ?? "Không tải được danh sách giọng."
              }), (0, t.jsx)(N.Button, {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "h-7 shrink-0 px-2 text-[10px]",
                onClick: () => void z.useTtssieureStore.getState().fetchVoiceList(ef, (0, $.normalizeTtssieureTargetLang)(eC), {
                  refresh: !0
                }),
                children: "Thử lại"
              })]
            }) : eE?.status !== "loading" && eE ? 0 === eA.length ? (0, t.jsx)("p", {
              className: "rounded-md bg-muted/50 px-2 py-2 text-[11px] text-muted-foreground",
              children: "Không có giọng nào cho ngôn ngữ này. Thử đổi nhà cung cấp hoặc xem thư viện TTSSieure."
            }) : (0, t.jsx)("div", {
              className: "min-h-0 flex-1 space-y-1 overflow-y-auto pr-1",
              children: eA.map(e => {
                let s = `${ef}/${e.voiceId}`,
                  i = eP.some(t => t.provider === ef && t.voiceId === e.voiceId),
                  n = "premade" === e.kind ? "Có sẵn" : "shared" === e.kind ? "Cộng đồng" : "cloned" === e.kind ? "Clone của bạn" : "Hệ thống";
                return (0, t.jsxs)("div", {
                  className: "grid grid-cols-[1.75rem_1fr_auto] items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs hover:bg-muted/60",
                  children: [(0, t.jsx)(N.Button, {
                    type: "button",
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-background/80 hover:text-foreground",
                    title: e.previewUrl ? `Nghe mẫu ${e.name}` : "Không có mẫu miễn phí",
                    "aria-label": `Nghe mẫu ${e.name}`,
                    disabled: !e.previewUrl,
                    onClick: () => (e => {
                      if (!ef) return;
                      let t = `${ef}/${e.voiceId}`;
                      if (ej === t) {
                        eN(null), (0, O.stopVoicePreviewAudio)();
                        return
                      }
                      if (!e.previewUrl || !(0, R.isTauri)()) return;
                      eN(t);
                      let s = async e => {
                        let s = await (0, U.ttssieureVoicePreview)({
                          provider: ef,
                          modelId: $.TTSSIEURE_ALLOWED_MODELS[ef],
                          voiceId: e.voiceId,
                          previewUrl: e.previewUrl
                        });
                        (await (0, O.playVoicePreviewAudio)((0, R.resolveMediaSrc)(s))).addEventListener("ended", () => eN(e => e === t ? null : e))
                      };
                      s(e).catch(async () => {
                        let t = await z.useTtssieureStore.getState().fetchVoiceList(ef, (0, $.normalizeTtssieureTargetLang)(eC), {
                            refresh: !0
                          }),
                          i = t.list?.voices.find(t => t.voiceId === e.voiceId);
                        if (!i?.previewUrl || i.previewUrl === e.previewUrl) throw Error("no fresh preview");
                        await s(i)
                      }).catch(() => eN(e => e === t ? null : e))
                    })(e),
                    children: (0, t.jsx)(p.Play, {
                      className: (0, G.cn)("h-3.5 w-3.5", ej === s && "text-primary")
                    })
                  }), (0, t.jsxs)("div", {
                    className: "min-w-0",
                    children: [(0, t.jsxs)("p", {
                      className: "flex items-center gap-1.5 font-medium",
                      children: [(0, t.jsx)("span", {
                        className: "truncate",
                        children: e.name
                      }), (0, t.jsx)("span", {
                        className: "shrink-0 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-normal text-primary",
                        children: n
                      }), e.gender ? (0, t.jsx)("span", {
                        className: "shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] font-normal text-muted-foreground",
                        children: "female" === e.gender ? "Nữ" : "male" === e.gender ? "Nam" : e.gender
                      }) : null]
                    }), (0, t.jsx)("p", {
                      className: "truncate text-[10px] leading-4 text-muted-foreground",
                      children: e.description || e.voiceId
                    })]
                  }), (0, t.jsx)(N.Button, {
                    type: "button",
                    variant: i ? "ghost" : "outline",
                    size: "sm",
                    className: "h-7 shrink-0 gap-1 rounded px-2 text-[11px]",
                    disabled: i,
                    onClick: () => z.useTtssieureStore.getState().addSavedVoice({
                      provider: ef,
                      voiceId: e.voiceId,
                      name: e.name,
                      sampleUrl: e.previewUrl
                    }),
                    children: i ? (0, t.jsxs)(t.Fragment, {
                      children: [(0, t.jsx)(o.Check, {
                        className: "h-3 w-3"
                      }), "Đã lưu"]
                    }) : (0, t.jsxs)(t.Fragment, {
                      children: [(0, t.jsx)(g.Plus, {
                        className: "h-3 w-3"
                      }), "Lưu"]
                    })
                  })]
                }, s)
              })
            }) : (0, t.jsx)("p", {
              className: "rounded-md bg-muted/50 px-2 py-2 text-[11px] text-muted-foreground",
              children: "Đang tải danh sách giọng…"
            }) : (0, t.jsx)("p", {
              className: "rounded-md bg-muted/50 px-2 py-2 text-[11px] text-muted-foreground",
              children: "Nhập API key ở tab TTSsieure.com để tải danh sách giọng."
            }), eE?.status === "ready" && eE.list?.truncated ? (0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-2 border-t border-border pt-2",
              children: [(0, t.jsx)("p", {
                className: "text-[10px] leading-4 text-muted-foreground",
                children: "Đây chỉ là một phần danh sách — xem đầy đủ tại thư viện TTSSieure."
              }), (0, t.jsxs)(N.Button, {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "h-7 shrink-0 gap-1 px-2 text-[10px]",
                onClick: () => void(0, R.openUrlInSystemBrowser)($.TTSSIEURE_LIBRARY_URL),
                children: [(0, t.jsx)(c.ExternalLink, {
                  className: "h-3 w-3"
                }), "Mở thư viện"]
              })]
            }) : null]
          }) : null]
        })
      }), (0, t.jsx)(S.Dialog, {
        open: null !== eh,
        onOpenChange: e => {
          e || ex(null)
        },
        children: (0, t.jsxs)(S.DialogContent, {
          className: "w-[min(24rem,calc(100vw-2rem))]",
          children: [(0, t.jsxs)(S.DialogHeader, {
            children: [(0, t.jsx)(S.DialogTitle, {
              className: "text-sm",
              children: eh?.mode === "edit" ? "Đổi tên giọng đã lưu" : "Thêm giọng TTSsieure bằng ID"
            }), (0, t.jsx)(S.DialogDescription, {
              className: "text-[11px]",
              children: eh?.mode === "edit" ? `ID: ${eh.voice.voiceId} \xb7 ${(0,$.ttssieureProviderLabel)(eh.voice.provider)}` : 'Dán Voice ID từ thư viện TTSSieure (nút "Copy Voice ID"). Lưu giọng không trừ credit.'
            })]
          }), eh ? (0, t.jsxs)("div", {
            className: "space-y-3",
            children: ["add" === eh.mode ? (0, t.jsxs)("div", {
              className: "space-y-1.5",
              children: [(0, t.jsx)("label", {
                className: "text-[11px] font-medium text-muted-foreground",
                htmlFor: "tts-voice-provider",
                children: "Nhà cung cấp"
              }), (0, t.jsxs)(k.Select, {
                value: eh.provider,
                onValueChange: e => ex({
                  ...eh,
                  provider: e
                }),
                children: [(0, t.jsx)(k.SelectTrigger, {
                  id: "tts-voice-provider",
                  className: "h-8 text-xs",
                  children: (0, t.jsx)(k.SelectValue, {})
                }), (0, t.jsx)(k.SelectContent, {
                  children: $.TTSSIEURE_PROVIDERS.map(e => (0, t.jsxs)(k.SelectItem, {
                    value: e,
                    className: "text-xs",
                    children: [$.TTSSIEURE_PROVIDER_LABELS[e], " · ", $.TTSSIEURE_ALLOWED_MODELS[e]]
                  }, e))
                })]
              })]
            }) : null, "add" === eh.mode ? (0, t.jsxs)("div", {
              className: "space-y-1.5",
              children: [(0, t.jsx)("label", {
                className: "text-[11px] font-medium text-muted-foreground",
                htmlFor: "tts-voice-id",
                children: "Voice ID"
              }), (0, t.jsx)(w.Input, {
                id: "tts-voice-id",
                value: eh.voiceId,
                onChange: e => ex({
                  ...eh,
                  voiceId: e.target.value
                }),
                placeholder: "vd: 362703657091277",
                className: "h-8 font-mono text-xs",
                autoFocus: !0
              })]
            }) : null, (0, t.jsxs)("div", {
              className: "space-y-1.5",
              children: [(0, t.jsx)("label", {
                className: "text-[11px] font-medium text-muted-foreground",
                htmlFor: "tts-voice-name",
                children: "Tên gợi nhớ"
              }), (0, t.jsx)(w.Input, {
                id: "tts-voice-name",
                value: eh.name,
                onChange: e => ex({
                  ...eh,
                  name: e.target.value
                }),
                placeholder: "add" === eh.mode ? "Để trống = dùng Voice ID" : "",
                className: "h-8 text-xs"
              })]
            }), ep ? (0, t.jsx)("p", {
              className: "text-[11px] text-destructive",
              children: ep
            }) : null]
          }) : null, (0, t.jsxs)(S.DialogFooter, {
            className: "gap-2",
            children: [(0, t.jsx)(N.Button, {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => ex(null),
              children: "Hủy"
            }), (0, t.jsx)(N.Button, {
              type: "button",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => {
                if (!eh) return;
                if ("edit" === eh.mode) return eh.name.trim() ? (z.useTtssieureStore.getState().renameSavedVoice(eh.voice.provider, eh.voice.voiceId, eh.name), void ex(null)) : void eg("Nhập tên gợi nhớ.");
                let e = eh.voiceId.trim();
                e ? eP.some(t => t.provider === eh.provider && t.voiceId === e) ? eg("Giọng này đã có trong danh sách đã lưu.") : z.useTtssieureStore.getState().addSavedVoice({
                  provider: eh.provider,
                  voiceId: e,
                  name: eh.name
                }) ? ex(null) : eg("Voice ID không hợp lệ.") : eg("Nhập Voice ID.")
              },
              children: "Lưu"
            })]
          })]
        })
      })]
    })
  }, "premiumVoiceSelectOptions", 0, K, "selectedVoiceOption", 0, F], 98534)
}]);