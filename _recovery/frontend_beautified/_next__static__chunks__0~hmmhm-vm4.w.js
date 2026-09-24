(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 17198, e => {
  "use strict";
  var t = e.i(43476),
    n = e.i(71645),
    s = e.i(57688),
    a = e.i(68270),
    i = e.i(68877),
    r = e.i(56420);
  let l = (0, r.default)("arrow-right-left", [
    ["path", {
      d: "m16 3 4 4-4 4",
      key: "1x1c3m"
    }],
    ["path", {
      d: "M20 7H4",
      key: "zbl0bi"
    }],
    ["path", {
      d: "m8 21-4-4 4-4",
      key: "h9nckh"
    }],
    ["path", {
      d: "M4 17h16",
      key: "g4d7ey"
    }]
  ]);
  var o = e.i(89664),
    d = e.i(16327),
    c = e.i(71028);
  let u = (0, r.default)("languages", [
      ["path", {
        d: "m5 8 6 6",
        key: "1wu5hv"
      }],
      ["path", {
        d: "m4 14 6-6 2-3",
        key: "1k1g8d"
      }],
      ["path", {
        d: "M2 5h12",
        key: "or177f"
      }],
      ["path", {
        d: "M7 2h1",
        key: "1t2jsx"
      }],
      ["path", {
        d: "m22 22-5-10-5 10",
        key: "don7ne"
      }],
      ["path", {
        d: "M14 18h6",
        key: "1m8k6r"
      }]
    ]),
    m = (0, r.default)("link-2", [
      ["path", {
        d: "M9 17H7A5 5 0 0 1 7 7h2",
        key: "8i5ue5"
      }],
      ["path", {
        d: "M15 7h2a5 5 0 1 1 0 10h-2",
        key: "1b9ql8"
      }],
      ["line", {
        x1: "8",
        x2: "16",
        y1: "12",
        y2: "12",
        key: "1jonct"
      }]
    ]);
  var h = e.i(32781),
    x = e.i(63453);
  let g = (0, r.default)("music-2", [
    ["circle", {
      cx: "8",
      cy: "18",
      r: "4",
      key: "1fc0mg"
    }],
    ["path", {
      d: "M12 18V2l7 4",
      key: "g04rme"
    }]
  ]);
  var p = e.i(21357),
    b = e.i(66595),
    f = e.i(73474),
    v = e.i(25981),
    y = e.i(23827),
    j = e.i(26150),
    N = e.i(94533),
    w = e.i(19455),
    k = e.i(87486),
    S = e.i(78909),
    C = e.i(98534),
    T = e.i(30372),
    _ = e.i(46696),
    P = e.i(62368),
    M = e.i(63676),
    A = e.i(57428),
    D = e.i(93479),
    L = e.i(80345),
    V = e.i(81469),
    I = e.i(78422),
    O = e.i(75157);

  function E() {
    let e = (0, L.usePlatformDownloadStore)(e => e.extract),
      s = (0, L.usePlatformDownloadStore)(e => e.download),
      a = (0, L.usePlatformDownloadStore)(e => e.cancel),
      [i, r] = (0, n.useState)(""),
      [l, o] = (0, n.useState)(!1),
      [d, c] = (0, n.useState)("idle"),
      [u, m] = (0, n.useState)(null),
      x = (0, L.usePlatformDownloadStore)(e => u ? e.active[u] : void 0),
      g = i.trim(),
      p = "idle" !== d,
      b = (0, V.isSupportedPlatformUrl)(g) && l && !p,
      f = async () => {
        if (b) {
          c("scanning");
          try {
            let t = await e(g),
              n = (0, V.pickBestPlatformFormat)(t.formats);
            if (!n) throw Error("Không tìm thấy định dạng phù hợp để tải.");
            let a = (0, O.generateId)();
            m(a), c("downloading"), r("");
            try {
              await s({
                info: t,
                format: n,
                sourceUrl: g,
                downloadId: a
              }), _.toast.success("Đã tải xong — video đã vào hàng chờ xử lý", {
                description: t.title
              })
            } finally {
              m(null), c("idle")
            }
          } catch (t) {
            c("idle");
            let e = (0, I.platformDownloadErrorMessage)(t);
            if (/cancel/i.test(e)) return;
            _.toast.error("Không thể tải video", {
              description: e
            })
          }
        }
      };
    return (0, t.jsxs)("div", {
      children: [(0, t.jsxs)("div", {
        className: "flex items-center gap-2 px-3 py-2",
        children: [(0, t.jsx)(D.Input, {
          value: i,
          onChange: e => r(e.target.value),
          onKeyDown: e => {
            "Enter" === e.key && f()
          },
          placeholder: "Dán link YouTube, TikTok, Instagram, Facebook…",
          disabled: p,
          className: "h-8 text-xs"
        }), (0, t.jsxs)(w.Button, {
          type: "button",
          size: "sm",
          className: "h-8 shrink-0 px-2.5 text-xs",
          disabled: !b,
          onClick: () => void f(),
          children: [p ? (0, t.jsx)(h.Loader2, {
            className: "h-3.5 w-3.5 animate-spin"
          }) : (0, t.jsx)(P.Download, {
            className: "h-3.5 w-3.5"
          }), "scanning" === d ? "Đang quét…" : "Tải"]
        })]
      }), (0, t.jsxs)("label", {
        className: "flex items-start gap-2 border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground",
        children: [(0, t.jsx)(A.Checkbox, {
          checked: l,
          onCheckedChange: e => o(!0 === e),
          disabled: p,
          className: "mt-0.5"
        }), (0, t.jsx)("span", {
          children: "Tôi xác nhận có quyền sử dụng video này và tự chịu trách nhiệm về bản quyền."
        })]
      }), "downloading" === d ? (0, t.jsxs)("div", {
        className: "flex items-center gap-2 border-t border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground",
        children: [(0, t.jsx)(h.Loader2, {
          className: "h-3 w-3 shrink-0 animate-spin"
        }), (0, t.jsxs)("span", {
          className: "min-w-0 truncate",
          children: ["Đang tải", x?.title ? ` ${x.title}` : ""]
        }), (0, t.jsxs)("span", {
          className: (0, O.cn)("ml-auto shrink-0", !x && "invisible"),
          children: [(0, O.formatFileSize)(x?.downloadedBytes ?? 0), x?.totalBytes ? ` / ${(0,O.formatFileSize)(x.totalBytes)}` : ""]
        }), u ? (0, t.jsx)("button", {
          type: "button",
          "aria-label": "Hủy tải",
          onClick: () => void a(u),
          className: "shrink-0 text-muted-foreground transition-colors hover:text-destructive",
          children: (0, t.jsx)(M.X, {
            className: "h-3.5 w-3.5"
          })
        }) : null]
      }) : null]
    })
  }
  var R = e.i(15281),
    F = e.i(56522),
    z = e.i(76639),
    B = e.i(24687),
    H = e.i(58749),
    U = e.i(92719);

  function K(e) {
    return "duplicate_name" === e ? "Tên này đã được dùng cho một yêu cầu khác." : "invalid_prompt" === e ? "Nhập tên và yêu cầu dịch trước khi lưu." : "not_found" === e ? "Yêu cầu này không còn tồn tại." : "duplicate_id" === e ? "Không thể lưu yêu cầu lúc này. Hãy thử lại." : ""
  }

  function G({
    disabled: e
  }) {
    let s = (0, U.useSettingsStore)(e => e.settings.translationStyleSettings),
      a = (0, U.useSettingsStore)(e => e.setTranslationStyleSelection),
      i = (0, U.useSettingsStore)(e => e.addSavedTranslationStylePrompt),
      r = (0, U.useSettingsStore)(e => e.updateSavedTranslationStylePrompt),
      l = (0, U.useSettingsStore)(e => e.removeSavedTranslationStylePrompt),
      [c, u] = (0, n.useState)(!1),
      [m, h] = (0, n.useState)(""),
      [x, g] = (0, n.useState)(""),
      [p, b] = (0, n.useState)(!1),
      [v, y] = (0, n.useState)(null),
      [j, k] = (0, n.useState)(""),
      [S, C] = (0, n.useState)(""),
      [T, _] = (0, n.useState)(""),
      P = (0, H.translationStyleLabel)(s),
      A = "builtin" === s.selection.kind ? s.selection.styleId : null,
      L = H.TRANSLATION_STYLE_OPTIONS[0],
      V = (0, n.useMemo)(() => H.TRANSLATION_STYLE_OPTIONS.filter(e => "builtin" === e.group), []),
      I = t => {
        e || (a({
          kind: "builtin",
          styleId: t
        }), u(!1))
      },
      E = () => {
        if (e || !v) return;
        let t = r(v, j, S);
        t ? _(K(t)) : (y(null), _(""))
      };
    return (0, t.jsxs)(z.Dialog, {
      open: c,
      onOpenChange: t => {
        if (!e || !t) {
          var n, a;
          t && (h((n = s.selection, a = s.savedPrompts, "custom" === n.kind ? n.prompt : "saved" !== n.kind ? "" : a.find(e => e.id === n.savedPromptId)?.prompt ?? "")), g(""), b(!1), y(null), k(""), C(""), _("")), u(t)
        }
      },
      children: [(0, t.jsx)(z.DialogTrigger, {
        asChild: !0,
        children: (0, t.jsxs)("button", {
          type: "button",
          disabled: e,
          "aria-label": `Phong c\xe1ch dịch: ${P}`,
          className: (0, O.cn)("flex min-h-9 w-full items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-left transition-colors", "hover:bg-background/70 disabled:cursor-not-allowed disabled:opacity-60"),
          children: [(0, t.jsxs)("span", {
            className: "flex min-w-0 items-center gap-2",
            children: [(0, t.jsx)(N.Wand2, {
              className: "h-4 w-4 shrink-0 text-primary"
            }), (0, t.jsxs)("span", {
              className: "min-w-0",
              children: [(0, t.jsx)("span", {
                className: "block truncate text-xs font-semibold",
                children: P
              }), (0, t.jsx)("span", {
                className: "block truncate text-[10px] leading-4 text-muted-foreground",
                children: e ? "Giữ nguyên cho hàng đợi đang xử lý" : "Chọn trước khi bắt đầu xử lý"
              })]
            })]
          }), (0, t.jsx)(d.ChevronDown, {
            className: (0, O.cn)("h-4 w-4 shrink-0 text-muted-foreground transition-transform", c && "rotate-180")
          })]
        })
      }), (0, t.jsxs)(z.DialogContent, {
        className: "flex max-h-[calc(100dvh-2rem)] w-[min(832px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0",
        children: [(0, t.jsxs)(z.DialogHeader, {
          className: "shrink-0 border-b border-border px-4 py-3 pr-12 text-left",
          children: [(0, t.jsx)(z.DialogTitle, {
            className: "text-sm",
            children: "Phong cách dịch"
          }), (0, t.jsx)(z.DialogDescription, {
            className: "text-xs leading-4",
            children: "Áp dụng một phong cách cho toàn bộ video trong lần xử lý này."
          })]
        }), (0, t.jsxs)("div", {
          className: "grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 md:overflow-hidden",
          children: [(0, t.jsxs)("div", {
            "data-translation-style-region": "presets",
            className: "min-w-0 space-y-3 md:overflow-y-auto md:pr-1",
            children: [(0, t.jsxs)("section", {
              "aria-labelledby": "translation-style-recommended",
              children: [(0, t.jsx)("p", {
                id: "translation-style-recommended",
                className: "mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground",
                children: "Khuyên dùng"
              }), (0, t.jsxs)("button", {
                type: "button",
                disabled: e,
                "aria-pressed": A === L.id,
                onClick: () => I(L.id),
                className: (0, O.cn)("grid w-full grid-cols-[1rem_1fr] items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors", A === L.id ? "border-primary/45 bg-primary/10" : "border-border hover:bg-muted/60"),
                children: [(0, t.jsx)("span", {
                  className: "flex h-4 items-center justify-center",
                  children: A === L.id ? (0, t.jsx)(o.Check, {
                    className: "h-3.5 w-3.5 text-primary"
                  }) : null
                }), (0, t.jsxs)("span", {
                  className: "min-w-0",
                  children: [(0, t.jsx)("span", {
                    className: "block text-xs font-medium",
                    children: "Tự động (khuyến nghị)"
                  }), (0, t.jsx)("span", {
                    className: "block text-[10px] leading-4 text-muted-foreground",
                    children: L.description
                  })]
                })]
              })]
            }), (0, t.jsxs)("section", {
              "aria-labelledby": "translation-style-builtins",
              children: [(0, t.jsx)("p", {
                id: "translation-style-builtins",
                className: "mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground",
                children: "Phong cách có sẵn"
              }), (0, t.jsx)("div", {
                className: "grid gap-1.5 sm:grid-cols-2",
                children: V.map(n => {
                  let s = A === n.id;
                  return (0, t.jsxs)("button", {
                    type: "button",
                    disabled: e,
                    "aria-pressed": s,
                    onClick: () => I(n.id),
                    className: (0, O.cn)("grid min-h-[54px] w-full grid-cols-[1rem_1fr] items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors", s ? "border-primary/45 bg-primary/10" : "border-border hover:bg-muted/60"),
                    children: [(0, t.jsx)("span", {
                      className: "flex h-4 items-center justify-center",
                      children: s ? (0, t.jsx)(o.Check, {
                        className: "h-3.5 w-3.5 text-primary"
                      }) : null
                    }), (0, t.jsxs)("span", {
                      className: "min-w-0",
                      children: [(0, t.jsx)("span", {
                        className: "block text-xs font-medium",
                        children: n.label
                      }), (0, t.jsx)("span", {
                        className: "block text-[10px] leading-4 text-muted-foreground",
                        children: n.description
                      })]
                    })]
                  }, n.id)
                })
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "min-w-0 space-y-3 md:flex md:min-h-0 md:flex-col md:overflow-hidden",
            children: [s.savedPrompts.length > 0 ? (0, t.jsxs)("section", {
              "aria-labelledby": "translation-style-saved",
              className: "min-h-0 md:flex md:flex-1 md:flex-col",
              children: [(0, t.jsx)("p", {
                id: "translation-style-saved",
                className: "mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground",
                children: "Đã lưu"
              }), (0, t.jsx)("div", {
                "data-translation-style-region": "saved-list",
                className: "max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border md:max-h-none md:min-h-0 md:flex-1",
                children: s.savedPrompts.map(n => {
                  let i = "saved" === s.selection.kind && s.selection.savedPromptId === n.id,
                    r = v === n.id;
                  return (0, t.jsx)("div", {
                    className: "p-1.5",
                    children: r ? (0, t.jsxs)("div", {
                      className: "space-y-1.5",
                      children: [(0, t.jsx)(D.Input, {
                        value: j,
                        disabled: e,
                        maxLength: H.SAVED_TRANSLATION_STYLE_NAME_MAX_CHARS,
                        "aria-label": "Tên yêu cầu đã lưu",
                        onChange: e => k(e.target.value)
                      }), (0, t.jsx)(B.Textarea, {
                        value: S,
                        disabled: e,
                        maxLength: H.CUSTOM_TRANSLATION_STYLE_PROMPT_MAX_CHARS,
                        rows: 3,
                        "aria-label": "Nội dung yêu cầu đã lưu",
                        onChange: e => C(e.target.value)
                      }), (0, t.jsxs)("div", {
                        className: "flex justify-end gap-1",
                        children: [(0, t.jsx)(w.Button, {
                          type: "button",
                          size: "icon-xs",
                          variant: "ghost",
                          title: "Hủy sửa",
                          onClick: () => y(null),
                          children: (0, t.jsx)(M.X, {})
                        }), (0, t.jsx)(w.Button, {
                          type: "button",
                          size: "icon-xs",
                          disabled: e,
                          title: "Lưu thay đổi",
                          onClick: E,
                          children: (0, t.jsx)(F.Save, {})
                        })]
                      })]
                    }) : (0, t.jsxs)("div", {
                      className: "grid grid-cols-[1fr_auto_auto] items-center gap-1",
                      children: [(0, t.jsxs)("button", {
                        type: "button",
                        disabled: e,
                        "aria-pressed": i,
                        onClick: () => {
                          var t;
                          return t = n.id, void(!e && (a({
                            kind: "saved",
                            savedPromptId: t
                          }), u(!1)))
                        },
                        className: (0, O.cn)("grid min-w-0 grid-cols-[1rem_1fr] items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-muted/60", i && "bg-primary/10"),
                        children: [(0, t.jsx)("span", {
                          className: "flex h-4 items-center justify-center",
                          children: i ? (0, t.jsx)(o.Check, {
                            className: "h-3.5 w-3.5 text-primary"
                          }) : null
                        }), (0, t.jsxs)("span", {
                          className: "min-w-0",
                          children: [(0, t.jsx)("span", {
                            className: "block truncate text-xs font-medium",
                            children: n.name
                          }), (0, t.jsx)("span", {
                            className: "block truncate text-[10px] text-muted-foreground",
                            children: n.prompt
                          })]
                        })]
                      }), (0, t.jsx)(w.Button, {
                        type: "button",
                        size: "icon-xs",
                        variant: "ghost",
                        disabled: e,
                        title: `Sửa ${n.name}`,
                        onClick: () => {
                          y(n.id), k(n.name), C(n.prompt), _("")
                        },
                        children: (0, t.jsx)(R.Pencil, {})
                      }), (0, t.jsx)(w.Button, {
                        type: "button",
                        size: "icon-xs",
                        variant: "ghost",
                        disabled: e,
                        title: `X\xf3a ${n.name}`,
                        onClick: () => {
                          var t;
                          return t = n.id, void(!e && (l(t), v === t && y(null), _("")))
                        },
                        children: (0, t.jsx)(f.Trash2, {})
                      })]
                    })
                  }, n.id)
                })
              })]
            }) : null, (0, t.jsxs)("section", {
              "aria-labelledby": "translation-style-custom",
              "data-translation-style-region": "custom-composer",
              className: "shrink-0",
              children: [(0, t.jsxs)("div", {
                className: "mb-1.5 flex items-center justify-between gap-3",
                children: [(0, t.jsx)("p", {
                  id: "translation-style-custom",
                  className: "text-[10px] font-semibold uppercase text-muted-foreground",
                  children: "Yêu cầu riêng"
                }), (0, t.jsxs)("span", {
                  className: "text-[10px] tabular-nums text-muted-foreground",
                  children: [Array.from(m).length, "/", H.CUSTOM_TRANSLATION_STYLE_PROMPT_MAX_CHARS]
                })]
              }), (0, t.jsx)(B.Textarea, {
                value: m,
                disabled: e,
                maxLength: H.CUSTOM_TRANSLATION_STYLE_PROMPT_MAX_CHARS,
                rows: 4,
                placeholder: "Ví dụ: Dịch tự nhiên như lời kể phim tài liệu, câu ngắn và rõ ý.",
                "aria-label": "Yêu cầu dịch riêng",
                onChange: e => {
                  h(e.target.value), _("")
                }
              }), p ? (0, t.jsxs)("div", {
                className: "mt-2 grid grid-cols-[1fr_auto_auto] gap-1.5",
                children: [(0, t.jsx)(D.Input, {
                  value: x,
                  disabled: e,
                  maxLength: H.SAVED_TRANSLATION_STYLE_NAME_MAX_CHARS,
                  placeholder: "Tên để dùng lại",
                  "aria-label": "Tên yêu cầu dịch",
                  onChange: e => {
                    g(e.target.value), _("")
                  }
                }), (0, t.jsx)(w.Button, {
                  type: "button",
                  size: "sm",
                  variant: "ghost",
                  onClick: () => b(!1),
                  children: "Hủy"
                }), (0, t.jsxs)(w.Button, {
                  type: "button",
                  size: "sm",
                  disabled: e,
                  onClick: () => {
                    if (e) return;
                    let t = i(x, m);
                    t ? _(K(t)) : u(!1)
                  },
                  children: [(0, t.jsx)(F.Save, {}), "Lưu"]
                })]
              }) : (0, t.jsxs)("div", {
                className: "mt-2 flex flex-wrap justify-end gap-1.5",
                children: [(0, t.jsxs)(w.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  disabled: e,
                  onClick: () => b(!0),
                  children: [(0, t.jsx)(F.Save, {}), "Lưu yêu cầu"]
                }), (0, t.jsxs)(w.Button, {
                  type: "button",
                  size: "sm",
                  disabled: e,
                  onClick: () => {
                    if (e) return;
                    let t = (0, H.normalizeTranslationStylePrompt)(m);
                    t ? (a({
                      kind: "custom",
                      prompt: t
                    }), u(!1)) : _("Nhập yêu cầu dịch trước khi áp dụng.")
                  },
                  children: [(0, t.jsx)(o.Check, {}), "Áp dụng"]
                })]
              })]
            }), T ? (0, t.jsx)("p", {
              role: "alert",
              className: "shrink-0 text-[11px] leading-4 text-destructive",
              children: T
            }) : null]
          })]
        })]
      })]
    })
  }
  var Y = e.i(38991),
    $ = e.i(65991),
    X = e.i(44318),
    q = e.i(57342),
    W = e.i(44077),
    Q = e.i(34618),
    J = e.i(6285),
    Z = e.i(30606),
    ee = e.i(5071);
  e.i(89268);
  var et = e.i(81341),
    en = e.i(1975),
    es = e.i(43035),
    ea = e.i(56260),
    ei = e.i(88455);
  let er = /\p{M}/gu;

  function el(e) {
    return e.replace(/đ/g, "d").replace(/Đ/g, "D").normalize("NFD").replace(er, "").toLowerCase().trim().replace(/\s+/g, " ")
  }
  let eo = ["code", "value", "name", "nativeName", "viName"];
  var ed = e.i(1046),
    ec = e.i(13052),
    eu = e.i(97347),
    em = e.i(80341),
    eh = e.i(14829),
    ex = e.i(13308),
    eg = e.i(20829),
    ep = e.i(27875),
    eb = e.i(77496),
    ef = e.i(17569),
    ev = e.i(89290),
    ey = e.i(17245),
    ej = e.i(54302),
    eN = e.i(78238);
  async function ew({
    videoIds: e,
    snapshot: t,
    enqueueAndStart: n,
    clearDraftIds: s,
    openHistory: a
  }) {
    await n(e, t), s(), a()
  }
  let ek = {
      idle: {
        label: "Sẵn sàng",
        variant: "secondary"
      },
      importing: {
        label: "Đang nhập",
        variant: "warning"
      },
      extracting_audio: {
        label: "Tách âm thanh",
        variant: "warning"
      },
      transcribing: {
        label: "Nhận diện giọng",
        variant: "warning"
      },
      translating: {
        label: "Đang dịch",
        variant: "warning"
      },
      generating_tts: {
        label: "Tạo giọng đọc",
        variant: "warning"
      },
      exporting: {
        label: "Xuất video",
        variant: "warning"
      },
      completed: {
        label: "Hoàn thành",
        variant: "success"
      },
      error: {
        label: "Có lỗi",
        variant: "destructive"
      }
    },
    eS = ei.DASHBOARD_SOURCE_LANGUAGE_OPTIONS,
    eC = [...ei.DASHBOARD_PRIMARY_TARGET_LANGUAGE_OPTIONS, ...ei.DASHBOARD_ADDITIONAL_TARGET_LANGUAGE_OPTIONS],
    eT = "flex w-full max-w-full flex-wrap gap-1 rounded-md border border-border bg-secondary/40 p-1";

  function e_({
    value: e,
    options: n,
    onChange: s,
    showDescription: a = !1,
    embedded: i = !1
  }) {
    return (0, t.jsx)("div", {
      className: (0, O.cn)(i ? "contents" : eT),
      children: n.map(n => {
        let i = n.value === e,
          r = !!n.disabled;
        return (0, t.jsxs)("button", {
          type: "button",
          title: a ? void 0 : n.tooltip ?? n.description,
          "aria-pressed": i,
          disabled: r,
          onClick: () => {
            r || s(n.value)
          },
          className: (0, O.cn)(a ? "min-h-12 min-w-[120px] flex-1 rounded px-2.5 py-1.5 text-left transition-colors" : "min-h-9 min-w-[96px] flex-1 rounded px-2.5 py-1.5 text-left transition-colors", i && "bg-primary text-primary-foreground shadow-sm", !i && !r && "bg-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground", r && "cursor-not-allowed bg-muted/50 text-muted-foreground opacity-70"),
          children: [(0, t.jsxs)("span", {
            className: "flex items-center justify-between gap-2 text-xs font-semibold",
            children: [n.label, i ? (0, t.jsx)(o.Check, {
              className: "h-3.5 w-3.5 shrink-0"
            }) : null]
          }), a && n.description ? (0, t.jsx)("span", {
            className: (0, O.cn)("mt-0.5 block text-[10px] leading-3", i ? "text-primary-foreground/75" : "text-muted-foreground/85"),
            children: n.description
          }) : null]
        }, n.value)
      })
    })
  }

  function eP({
    value: e,
    options: s,
    searchOptions: a,
    onChange: i,
    onRequestMore: r,
    title: l = "Ngôn ngữ khác",
    className: c
  }) {
    var m;
    let h, [x, g] = (0, n.useState)(!1),
      [p, f] = (0, n.useState)(""),
      v = s.find(t => t.value === e),
      y = !!v,
      j = v?.label ?? l,
      N = el(p).length > 0,
      w = N ? (m = a ?? s, (h = el(p)) ? m.filter(e => {
        let t;
        return !(t = el(h)) || eo.some(n => {
          let s = e[n];
          return "string" == typeof s && el(s).includes(t)
        })
      }) : [...m]) : s;
    return (0, t.jsxs)(S.CenteredDropdown, {
      open: x,
      onOpenChange: e => {
        g(e), e || f("")
      },
      children: [(0, t.jsx)(S.CenteredDropdownTrigger, {
        asChild: !0,
        children: (0, t.jsxs)("button", {
          type: "button",
          className: (0, O.cn)("flex min-h-9 w-full min-w-[10.5rem] items-center justify-between gap-2 rounded px-2.5 py-1.5 text-left text-xs font-semibold transition-colors sm:w-44", y ? "border-primary/40 bg-primary text-primary-foreground shadow-sm" : "bg-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground", c),
          title: j,
          children: [(0, t.jsxs)("span", {
            className: "flex min-w-0 items-center gap-1.5",
            children: [(0, t.jsx)(u, {
              className: "h-3.5 w-3.5 shrink-0"
            }), (0, t.jsx)("span", {
              className: "min-w-0 truncate",
              children: j
            })]
          }), (0, t.jsx)(d.ChevronDown, {
            className: (0, O.cn)("h-3.5 w-3.5 shrink-0 opacity-70 transition-transform", x && "rotate-180")
          })]
        })
      }), (0, t.jsxs)(S.CenteredDropdownContent, {
        className: "flex w-[min(60rem,calc(100vw-2rem))] max-h-[min(30rem,calc(100vh-4rem))] flex-col overflow-hidden p-0",
        children: [(0, t.jsx)("div", {
          className: "border-b border-border px-3 py-2.5",
          children: (0, t.jsxs)("div", {
            className: "flex min-w-0 items-center gap-2",
            children: [(0, t.jsx)(u, {
              className: "h-3.5 w-3.5 shrink-0 text-primary"
            }), (0, t.jsxs)("div", {
              className: "min-w-0",
              children: [(0, t.jsx)(S.CenteredDropdownTitle, {
                className: "truncate text-xs font-semibold",
                children: l
              }), (0, t.jsx)(S.CenteredDropdownDescription, {
                className: "truncate text-[10px] text-muted-foreground",
                children: N ? `${w.length} kết quả` : `${s.length} ng\xf4n ngữ`
              })]
            })]
          })
        }), (0, t.jsx)("div", {
          className: "border-b border-border px-3 py-2",
          children: (0, t.jsxs)("div", {
            className: "relative",
            children: [(0, t.jsx)(b.Search, {
              className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            }), (0, t.jsx)("input", {
              type: "search",
              autoFocus: !0,
              value: p,
              onChange: e => f(e.target.value),
              placeholder: "Tìm ngôn ngữ...",
              "aria-label": "Tìm ngôn ngữ",
              className: "w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            })]
          })
        }), (0, t.jsxs)("div", {
          className: "overflow-y-auto p-2",
          children: [N && 0 === w.length ? (0, t.jsx)("p", {
            className: "px-2 py-4 text-center text-xs text-muted-foreground",
            children: "Không tìm thấy ngôn ngữ."
          }) : null, (0, t.jsxs)("div", {
            className: "grid gap-1 sm:grid-cols-3 xl:grid-cols-4",
            children: [w.map(n => {
              let s = n.value === e;
              return (0, t.jsxs)("button", {
                type: "button",
                title: n.description,
                className: (0, O.cn)("grid w-full min-w-0 grid-cols-[1rem_1fr] items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/60", s && "border-primary/40 bg-primary/10 text-foreground shadow-sm"),
                onClick: () => {
                  i(n.value), g(!1)
                },
                children: [(0, t.jsx)("span", {
                  className: "flex h-4 w-4 shrink-0 items-center justify-center",
                  children: s ? (0, t.jsx)(o.Check, {
                    className: "h-3.5 w-3.5 text-primary"
                  }) : null
                }), (0, t.jsxs)("span", {
                  className: "min-w-0",
                  children: [(0, t.jsx)("span", {
                    className: "block truncate font-medium",
                    children: n.label
                  }), n.description ? (0, t.jsx)("span", {
                    className: "block truncate text-[10px] leading-4 text-muted-foreground",
                    children: n.description
                  }) : null]
                })]
              }, n.value)
            }), r ? (0, t.jsxs)("button", {
              type: "button",
              "data-value": "__request_more_source_language",
              className: "col-span-full mt-1 flex w-full min-w-0 items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
              onClick: () => {
                g(!1), r()
              },
              children: [(0, t.jsx)(u, {
                className: "h-3.5 w-3.5 shrink-0"
              }), (0, t.jsx)("span", {
                className: "truncate",
                children: "Yêu cầu thêm ngôn ngữ"
              })]
            }) : null]
          })]
        })]
      })]
    })
  }

  function eM() {
    (0, et.showMessage)("Yêu cầu thêm ngôn ngữ", "Vui lòng liên hệ Telegram https://t.me/hanv123s để được hỗ trợ", "info")
  }

  function eA({
    icon: e,
    title: n,
    description: s,
    children: a
  }) {
    return (0, t.jsxs)("div", {
      className: "flex flex-wrap items-center gap-3 border-b border-border/70 py-2.5 last:border-b-0",
      children: [(0, t.jsxs)("div", {
        className: "flex min-w-[160px] items-center gap-2.5",
        style: {
          flex: "0 1 190px"
        },
        title: s,
        children: [(0, t.jsx)("div", {
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-primary",
          children: (0, t.jsx)(e, {
            className: "h-3.5 w-3.5"
          })
        }), (0, t.jsxs)("div", {
          children: [(0, t.jsx)("p", {
            className: "text-xs font-semibold",
            children: n
          }), (0, t.jsx)("p", {
            className: "sr-only",
            children: s
          })]
        })]
      }), (0, t.jsx)("div", {
        className: "min-w-0 flex-1",
        style: {
          flex: "1 1 520px"
        },
        children: a
      })]
    })
  }
  e.s(["DashboardPage", 0, function() {
    let {
      setCurrentView: e,
      openEngineSettings: r,
      openAccountPricingSettings: o,
      setCapCutLoginOpen: d
    } = (0, Y.useAppStore)(), {
      sourceLang: b,
      targetLang: S,
      processingMode: _,
      voiceMode: P,
      originalAudioMode: M,
      setSourceLang: A,
      setTargetLang: D,
      setProcessingMode: V,
      setVoiceMode: I,
      setOriginalAudioMode: R
    } = (0, ee.useDashboardPreferencesStore)(), {
      videos: F,
      activeVideoId: z,
      dashboardDraftVideoIds: B,
      addVideo: H,
      addVideoFromFile: K,
      addDashboardDraftVideoIds: er,
      removeDashboardDraftVideoId: el,
      clearDashboardDraftVideoIds: eo,
      removeVideo: eD,
      setActiveVideo: eL
    } = (0, $.useVideoStore)(), {
      settings: eV
    } = (0, U.useSettingsStore)(), {
      setGlobalStyle: eI
    } = (0, X.useSubtitleStore)(), eO = (0, W.useQueueStore)(e => e.enqueueAndStart), eE = (0, W.useQueueStore)(e => e.isVideoQueued), eR = (0, W.useQueueStore)(e => {
      let t = e.activeRunId ? e.runs.find(t => t.id === e.activeRunId) : void 0;
      return t?.status === "running" || t?.status === "pausing" || t?.status === "paused"
    }), {
      apiUrl: eF,
      token: ez,
      license: eB,
      balance: eH,
      paymentSessions: eU,
      refreshCloudStatus: eK,
      loading: eG
    } = (0, q.useCloudStore)(), eY = (0, Q.useEngineVnextInstallStore)(e => e.loadStatus), e$ = (0, J.useDependencyStore)(e => e.installing), eX = (0, L.usePlatformDownloadStore)(e => e.history), eq = (0, ei.normalizeSourceLanguageCode)(b), eW = (0, ei.normalizeTargetLanguageCode)(S), eQ = "vi" !== eW, eJ = eQ ? eg.NON_VIETNAMESE_VOICE_OPTIONS : eg.VOICE_OPTIONS, eZ = eQ && (0, ep.isPremiumVoiceId)(P) ? "female" : P, e0 = (0, ea.shouldPreferNoWatermarkForLocalJob)({
      license: eB,
      balance: eH
    });
    (0, n.useEffect)(() => {
      (0, ei.isSourceLanguageCode)(b) || A((0, ei.normalizeSourceLanguageCode)(b))
    }, [b, A]), (0, n.useEffect)(() => {
      (0, ei.isTargetLanguageCode)(S) || D((0, ei.normalizeTargetLanguageCode)(S))
    }, [S, D]), (0, n.useEffect)(() => {
      (0, en.warmPlatformConnection)()
    }, []);
    let e1 = (0, n.useRef)(null),
      [e5, e2] = (0, n.useState)(!1),
      [e3, e4] = (0, n.useState)(null),
      [e7, e8] = (0, n.useState)(null),
      e6 = (0, eg.effectiveOriginalAudioModeForTimeline)(M, {
        mode: "source_timeline"
      }),
      e9 = eg.ORIGINAL_AUDIO_OPTIONS.map(e => ({
        ...e,
        disabled: !1
      })),
      te = F.find(e => e.id === z),
      tt = B.map(e => F.find(t => t.id === e)).filter(e => !!e).filter(e => (0, eu.isQueuedVideo)(e) && !eE(e.id)),
      tn = tt.reduce((e, t) => e + Math.max(0, t.duration), 0),
      ts = tt.map(e => e.duration),
      ta = (0, em.evaluateEntitlementPreflight)({
        isDesktop: (0, et.isTauri)(),
        hasSession: !!ez,
        license: eB,
        balance: eH,
        queuedVideoSeconds: ts,
        paymentSessions: eU
      }),
      ti = te && tt.some(e => e.id === te.id) ? te : tt[0],
      tr = tt.length > 1 ? `Xử l\xfd tất cả (${tt.length})` : "none" === P ? "Dịch và tạo phụ đề" : "Dịch và tạo video",
      tl = (0, eg.entitlementPreflightMessage)(ta),
      to = (0, eg.entitlementGateTitle)(ta),
      td = "ready" === ta.status ? tr : "needs_upgrade" === ta.status ? "Chọn ít video hơn" : to,
      tc = "ready" === ta.status && !!ti && !e7,
      tu = ti ? (0, eg.processingTimeLabel)(ta.requiredSeconds) : null,
      tm = !!(e3 || e$?.packageId === "ffmpeg"),
      th = e3 ?? (e$?.packageId === "ffmpeg" ? e$.message : null) ?? (e5 ? "Thả video vào đây" : ti ? ti.name : "Thả tập tin vào đây"),
      tx = e$?.packageId === "ffmpeg" ? `${e$.percent}%` : ti ? `${(0,O.formatDuration)(ti.duration)} \xb7 ${(0,O.formatFileSize)(ti.size)} \xb7 ${ti.width}x${ti.height}` : "Hoặc nhấn để chọn video từ máy tính",
      tg = (0, n.useCallback)(() => {
        window.open(eh.UPGRADE_CONTACT_HREF, "_blank")
      }, []),
      tp = (0, n.useCallback)(async e => {
        try {
          await (0, ev.playPremiumVoicePreview)(e)
        } catch (t) {
          if ((0, eN.viralVoiceNeedsSettings)(t) && d(!0), (0, ej.isVieNeuVoiceId)(e) && ((0, ey.isVieNeuRuntimeMissingError)(t) || (0, ey.isVieNeuCanceledError)(t))) return;
          await (0, et.showMessage)("Chưa tạo được mẫu giọng", `${(0,ej.isVieNeuVoiceId)(e)?(0,ey.vieneuVoiceErrorText)(t):(0,eN.viralVoiceErrorText)(t)}

C\xe2u demo: ${(0,ev.premiumVoicePreviewText)(e)}`, "warning")
        }
      }, [d]),
      tb = (0, n.useCallback)(e => {
        (0, ep.isPremiumVoiceId)(e) && (I(e), (0, eb.isViralVoiceId)(e) && (0, ef.openCapCutLoginIfNeeded)())
      }, [I]),
      tf = (0, n.useCallback)(e => {
        e !== _ && V(e)
      }, [_, V]),
      tv = (0, n.useCallback)(async () => (0, ex.ensureMediaToolsReady)({
        setPreparationMessage: e4,
        logContext: "import",
        checkingMessage: "Đang kiểm tra trình đọc video...",
        preparingMessage: "Đang chuẩn bị trình đọc video...",
        errorTitle: "Không thể chuẩn bị trình đọc video",
        contextMessage: "DichVideo chưa thể chuẩn bị thành phần đọc video."
      }), []),
      ty = (0, n.useCallback)(async () => (0, ex.ensureMediaToolsReady)({
        setPreparationMessage: e8,
        logContext: "processing",
        checkingMessage: "Đang kiểm tra FFmpeg...",
        preparingMessage: "Đang chuẩn bị FFmpeg...",
        errorTitle: "Không thể chuẩn bị FFmpeg",
        contextMessage: "DichVideo chưa thể chuẩn bị FFmpeg để tạo audio/video."
      }), []),
      tj = (0, n.useCallback)(async () => {
        if (!(0, et.isTauri)()) return !0;
        await eY(eF, {
          force: !0
        });
        let e = Q.useEngineVnextInstallStore.getState();
        return !!e.ready || (e.requiresInstall && r(), !1)
      }, [eF, eY, r]),
      tN = (0, n.useCallback)(async e => {
        if (0 !== e.length) try {
          if (!await tv()) return;
          let t = null,
            n = [];
          for (let s of e) {
            let e = (0, W.inFlightQueueVideoIds)(W.useQueueStore.getState().items);
            t = await K(s, {
              queueVideoIds: e
            }), eE(t) || n.push(t)
          }
          t && eL(t), n.length > 0 && er(n)
        } catch (e) {
          console.error("Failed to import videos:", e), await (0, et.showMessage)("Không thể nhập video", (0, eg.importFailureMessage)(e), "error")
        }
      }, [er, K, tv, eE, eL]),
      tw = (0, n.useCallback)(async e => {
        let t = (0, ec.filterSupportedVideoFiles)(e);
        if (0 === t.length) return void await (0, et.showMessage)("Không có video hợp lệ", "Hãy chọn file video định dạng MP4, MKV, MOV, AVI, WebM, FLV hoặc WMV.", "warning");
        let n = null,
          s = [];
        for (let e of t) {
          let t = H({
            name: e.name,
            path: URL.createObjectURL(e),
            size: e.size,
            duration: 0,
            width: 0,
            height: 0,
            fps: 0,
            codec: e.type || "browser"
          });
          s.push(t), n = t
        }
        er(s), n && eL(n)
      }, [er, H, eL]),
      tk = (0, n.useCallback)(async () => {
        if (!(0, et.isTauri)()) return void e1.current?.click();
        let e = await (0, et.openMultipleFileDialog)();
        await tN(e)
      }, [tN]),
      tS = (0, n.useCallback)(e => {
        let t = Array.from(e.currentTarget.files ?? []);
        e.currentTarget.value = "", tw(t)
      }, [tw]);
    (0, n.useEffect)(() => {
      let e;
      if (!(0, et.isTauri)()) return;
      let t = !1;
      return (0, a.getCurrentWebview)().onDragDropEvent(e => {
        if ("enter" === e.payload.type || "over" === e.payload.type) return void e2(!0);
        e2(!1);
        let t = (0, ec.getVideoPathsFromTauriDragDropPayload)(e.payload);
        t.length > 0 ? tN(t) : "drop" === e.payload.type && (0, et.showMessage)("Không có video hợp lệ", "Hãy thả file video định dạng MP4, MKV, MOV, AVI, WebM, FLV hoặc WMV.", "warning")
      }).then(n => {
        t ? n() : e = n
      }).catch(e => {
        console.error("Failed to subscribe to Tauri file drop events:", e)
      }), () => {
        t = !0, e?.()
      }
    }, [tN]);
    let tC = (0, n.useCallback)(e => {
        e.preventDefault(), e2(!0)
      }, []),
      tT = (0, n.useCallback)(() => {
        e2(!1)
      }, []),
      t_ = (0, n.useCallback)(e => {
        if (e.preventDefault(), e2(!1), !(0, et.isTauri)()) return void tw(Array.from(e.dataTransfer.files));
        let t = (0, ec.filterSupportedVideoPaths)(Array.from(e.dataTransfer.files).map(e => e.path).filter(Boolean));
        t.length > 0 ? tN(t) : (0, et.showMessage)("Không đọc được đường dẫn file", "Nếu kéo thả không hoạt động, hãy nhấn vùng Tải lên để chọn video từ hộp thoại file.", "warning")
      }, [tw, tN]),
      tP = (0, n.useCallback)(e => {
        el(e), eD(e)
      }, [el, eD]),
      tM = (0, n.useCallback)(async e => {
        await eK({
          staleMs: eg.CLOUD_STATUS_PREFLIGHT_CACHE_MS
        });
        let t = q.useCloudStore.getState(),
          n = (0, em.evaluateEntitlementPreflight)({
            isDesktop: (0, et.isTauri)(),
            hasSession: !!t.token,
            license: t.license,
            balance: t.balance,
            queuedVideoSeconds: e,
            paymentSessions: t.paymentSessions
          });
        return "ready" === n.status || (await (0, et.showMessage)("Chưa thể xử lý video", (0, eg.entitlementPreflightMessage)(n), "warning"), !1)
      }, [eK]),
      tA = (0, n.useCallback)(async e => {
        if ("en" !== eq) return !0;
        try {
          return await (0, Z.ensureEnglishSttAddonReadyForProcessing)({
            sourceLanguage: eq,
            apiUrl: eF,
            onStatusMessage: e8
          }), (0, Z.markEnglishSttAddonPromptHandledForVideos)(e), !0
        } catch (t) {
          let e = t instanceof Error ? t.message : String(t);
          return await (0, et.showMessage)("Chưa tải được gói tiếng Anh", e, "warning"), !1
        } finally {
          e8(null)
        }
      }, [eF, eq]),
      tD = (0, n.useCallback)(async e => {
        if (!(0, Z.isWhisperMultilingualSourceLanguage)(eq)) return !0;
        try {
          return await (0, Z.ensureWhisperMultilingualSttAddonReadyForProcessing)({
            sourceLanguage: eq,
            apiUrl: eF,
            onStatusMessage: e8
          }), (0, Z.markEnglishSttAddonPromptHandledForVideos)(e), !0
        } catch (t) {
          let e = t instanceof Error ? t.message : String(t);
          return await (0, et.showMessage)("Chưa tải được gói nhận diện đa ngôn ngữ", e, "warning"), !1
        } finally {
          e8(null)
        }
      }, [eF, eq]),
      tL = async () => {
        if (!ti) return void await (0, et.showMessage)("Chưa có video", "Hãy tải hoặc chọn một video trước khi xử lý.", "warning");
        if (!await tj() || !await ty() || !await tM([ti.duration]) || !await tA([ti.id]) || !await tD([ti.id])) return;
        let t = (0, eg.buildQueueSnapshot)({
          sourceLang: eq,
          targetLang: eW,
          processingMode: _,
          voiceMode: P,
          originalAudioMode: M,
          selectedDurations: [ti.duration],
          baseSettings: eV
        });
        eI({
          fontSize: 18,
          wordsPerCaption: 4
        }), await ew({
          videoIds: [ti.id],
          snapshot: t,
          enqueueAndStart: eO,
          clearDraftIds: () => el(ti.id),
          openHistory: () => e("history")
        })
      }, tV = async () => {
        let t = tt.filter(eu.isQueuedVideo);
        if (0 === t.length) return void await (0, et.showMessage)("Chưa có video", "Hãy tải hoặc chọn một video trước khi xử lý.", "warning");
        if (!await tj() || !await ty() || !await tM(t.map(e => e.duration)) || !await tA(t.map(e => e.id)) || !await tD(t.map(e => e.id))) return;
        let n = (0, eg.buildQueueSnapshot)({
          sourceLang: eq,
          targetLang: eW,
          processingMode: _,
          voiceMode: P,
          originalAudioMode: M,
          selectedDurations: t.map(e => e.duration),
          baseSettings: eV
        });
        eI({
          fontSize: 18,
          wordsPerCaption: 4
        }), await ew({
          videoIds: t.map(e => e.id),
          snapshot: n,
          enqueueAndStart: eO,
          clearDraftIds: eo,
          openHistory: () => e("history")
        })
      };
    return (0, t.jsx)("div", {
      "data-testid": "desktop-view-dashboard",
      className: "h-full overflow-y-auto bg-background",
      children: (0, t.jsx)("div", {
        className: "mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4",
        children: (0, t.jsxs)("section", {
          className: "overflow-hidden rounded-lg border border-border bg-card/70",
          children: ["ready" !== ta.status ? (0, t.jsx)("div", {
            "data-section": "dashboard-account-gate",
            className: "border-b border-border bg-background/45 px-4 py-3",
            children: (0, t.jsxs)("div", {
              className: "flex flex-wrap items-center justify-between gap-3",
              children: [(0, t.jsxs)("div", {
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: to
                }), (0, t.jsx)("p", {
                  className: "mt-1 text-[11px] leading-4 text-muted-foreground",
                  children: tl
                })]
              }), (0, t.jsxs)("div", {
                className: "flex flex-wrap items-center gap-2",
                children: ["signed_out" === ta.status ? (0, t.jsx)(w.Button, {
                  type: "button",
                  size: "sm",
                  onClick: () => e("settings"),
                  children: "Đăng nhập"
                }) : null, "needs_plan" === ta.status ? (0, t.jsxs)(t.Fragment, {
                  children: [(0, t.jsx)(w.Button, {
                    type: "button",
                    size: "sm",
                    onClick: () => e("settings"),
                    children: "Kích hoạt gói miễn phí"
                  }), (0, t.jsx)(w.Button, {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    onClick: tg,
                    children: "Liên hệ nâng cấp"
                  })]
                }) : null, "needs_upgrade" === ta.status ? (0, t.jsx)(w.Button, {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  onClick: tg,
                  children: "Liên hệ nâng cấp"
                }) : null, (0, t.jsxs)(w.Button, {
                  type: "button",
                  size: "sm",
                  variant: "ghost",
                  disabled: eG,
                  onClick: () => void eK(),
                  children: [eG ? (0, t.jsx)(h.Loader2, {
                    className: "h-3.5 w-3.5 animate-spin"
                  }) : null, "Làm mới"]
                })]
              })]
            })
          }) : null, (0, t.jsx)("div", {
            className: "border-b border-border px-4 py-3",
            children: (0, t.jsxs)("div", {
              className: "flex flex-wrap items-center justify-between gap-3",
              children: [(0, t.jsxs)("div", {
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: "Tải lên"
                }), (0, t.jsx)("p", {
                  className: "mt-1 text-xs text-muted-foreground",
                  children: "Từ máy tính hoặc từ YouTube, TikTok, Facebook và các nền tảng khác."
                })]
              }), (0, t.jsxs)("div", {
                className: "grid w-full grid-cols-[minmax(0,1fr)_11.5rem] items-center gap-2 sm:w-auto",
                children: [tu ? (0, t.jsx)("span", {
                  className: "min-w-0 truncate text-right text-xs font-medium text-muted-foreground",
                  children: tu
                }) : (0, t.jsx)("span", {
                  "aria-hidden": "true"
                }), (0, t.jsxs)(w.Button, {
                  type: "button",
                  size: "sm",
                  className: "w-[11.5rem] shrink-0",
                  onClick: () => void(tt.length > 1 ? tV() : tL()),
                  disabled: !tc,
                  title: !tc && ti ? tl : void 0,
                  children: [e7 ? (0, t.jsx)(h.Loader2, {
                    className: "h-3.5 w-3.5 animate-spin"
                  }) : (0, t.jsx)(N.Wand2, {
                    className: "h-3.5 w-3.5"
                  }), e7 ?? td]
                })]
              })]
            })
          }), (0, t.jsxs)("div", {
            className: "space-y-4 p-4",
            children: [(0, t.jsx)("input", {
              ref: e1,
              type: "file",
              accept: "video/mp4,video/x-matroska,video/x-msvideo,video/quicktime,video/webm,video/x-flv,video/x-ms-wmv",
              multiple: !0,
              className: "hidden",
              onChange: tS
            }), (0, t.jsx)("section", {
              onDragOver: tC,
              onDragLeave: tT,
              onDrop: t_,
              className: (0, O.cn)("overflow-hidden rounded-lg border-2 border-dashed bg-background/40 transition-colors", e5 ? "border-primary bg-primary/10" : "border-border"),
              children: (0, t.jsxs)("div", {
                className: (0, O.cn)("grid", (0, et.isTauri)() && "sm:grid-cols-2"),
                children: [(0, t.jsxs)("button", {
                  type: "button",
                  onClick: tk,
                  disabled: tm,
                  className: (0, O.cn)("flex h-full w-full flex-col items-center justify-center px-4 py-5 text-center transition-colors", !e5 && "hover:bg-background/70", tm && "cursor-wait opacity-80"),
                  children: [(0, t.jsx)("div", {
                    className: (0, O.cn)("mb-2 flex h-11 w-11 items-center justify-center rounded-md", e5 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"),
                    children: tm ? (0, t.jsx)(h.Loader2, {
                      className: "h-5 w-5 animate-spin"
                    }) : (0, t.jsx)(v.Upload, {
                      className: "h-5 w-5"
                    })
                  }), (0, t.jsx)("p", {
                    className: "text-xs font-semibold",
                    children: th
                  }), (0, t.jsx)("p", {
                    className: "mt-0.5 text-[11px] text-muted-foreground",
                    children: tx
                  })]
                }), (0, et.isTauri)() ? (0, t.jsxs)("div", {
                  className: "border-t border-border sm:border-l sm:border-t-0",
                  children: [(0, t.jsxs)("div", {
                    className: "flex items-center justify-center gap-1.5 px-3 pt-3",
                    "aria-hidden": "true",
                    children: [(0, t.jsx)("span", {
                      title: "YouTube",
                      className: "flex h-5 w-5 items-center justify-center rounded bg-[#ff0000]",
                      children: (0, t.jsx)(p.Play, {
                        className: "h-3 w-3 fill-white text-white"
                      })
                    }), (0, t.jsx)("span", {
                      title: "TikTok · Douyin",
                      className: "flex h-5 w-5 items-center justify-center rounded bg-black/90",
                      children: (0, t.jsx)(g, {
                        className: "h-3 w-3 text-white"
                      })
                    }), (0, t.jsx)("span", {
                      title: "Facebook",
                      className: "flex h-5 w-5 items-center justify-center rounded bg-[#1877f2] text-[10px] font-bold leading-none text-white",
                      children: "f"
                    }), (0, t.jsx)("span", {
                      title: "Và nhiều nền tảng khác",
                      className: "flex h-5 w-5 items-center justify-center rounded bg-secondary text-muted-foreground",
                      children: (0, t.jsx)(m, {
                        className: "h-3 w-3"
                      })
                    })]
                  }), (0, t.jsx)(E, {}), (0, t.jsx)(T.DownloadedVideoList, {
                    entries: eX,
                    hideProcessed: !0,
                    bare: !0,
                    className: "border-t border-border"
                  })]
                }) : null]
              })
            }), tt.length > 0 ? (0, t.jsxs)("div", {
              className: "overflow-hidden rounded-lg border border-border bg-background/45",
              children: [(0, t.jsxs)("div", {
                className: "flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2",
                children: [(0, t.jsxs)("div", {
                  children: [(0, t.jsx)("p", {
                    className: "text-xs font-semibold",
                    children: "Video chờ xử lý"
                  }), (0, t.jsxs)("p", {
                    className: "mt-0.5 text-[11px] text-muted-foreground",
                    children: ["Tổng thời lượng ", (0, O.formatDuration)(tn)]
                  })]
                }), (0, t.jsxs)(k.Badge, {
                  variant: "secondary",
                  className: "h-6 px-2 text-[11px]",
                  children: [tt.length, " video"]
                })]
              }), (0, t.jsx)("div", {
                className: "divide-y divide-border",
                children: tt.length > 0 ? tt.map(e => {
                  let n = ek[e.status],
                    a = e.id === z,
                    i = "error" === e.status ? e.processingError : void 0,
                    r = i ? (0, ed.getProcessingErrorDisplay)(i, e.processingErrorCode) : null;
                  return (0, t.jsxs)("div", {
                    className: (0, O.cn)("flex items-center gap-3 px-3 py-2", a ? "bg-primary/5" : "bg-transparent"),
                    children: [(0, t.jsxs)("button", {
                      type: "button",
                      onClick: () => eL(e.id),
                      className: "flex min-w-0 flex-1 items-center gap-3 text-left",
                      children: [(0, t.jsx)("div", {
                        className: "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                        children: e.thumbnail ? (0, t.jsx)(s.default, {
                          src: (0, et.resolveMediaSrc)(e.thumbnail),
                          alt: e.name,
                          width: 160,
                          height: 96,
                          className: "h-full w-full object-cover",
                          unoptimized: !0
                        }) : (0, t.jsx)(p.Play, {
                          className: "h-4 w-4 text-muted-foreground"
                        })
                      }), (0, t.jsxs)("div", {
                        className: "min-w-0 flex-1",
                        children: [(0, t.jsx)("p", {
                          className: "truncate text-xs font-semibold",
                          children: e.name
                        }), (0, t.jsxs)("p", {
                          className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                          children: [(0, O.formatDuration)(e.duration), " · ", (0, O.formatFileSize)(e.size), " · ", e.width, "x", e.height]
                        })]
                      })]
                    }), (0, t.jsx)(k.Badge, {
                      variant: n.variant,
                      title: r?.detail ?? n.label,
                      className: "inline-flex max-w-[14rem] shrink-0 truncate",
                      children: r?.badgeLabel ?? n.label
                    }), r?.action === "top_up_minutes" ? (0, t.jsx)(w.Button, {
                      type: "button",
                      variant: "outline",
                      size: "sm",
                      onClick: o,
                      className: "h-7 shrink-0 px-2 text-[11px]",
                      children: "Nạp phút"
                    }) : null, (0, t.jsxs)(w.Button, {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      title: "Xóa khỏi hàng chờ",
                      "aria-label": `X\xf3a ${e.name} khỏi h\xe0ng chờ`,
                      onClick: () => tP(e.id),
                      className: "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive",
                      children: [(0, t.jsx)(f.Trash2, {
                        className: "h-3.5 w-3.5"
                      }), "Xóa"]
                    })]
                  }, e.id)
                }) : (0, t.jsx)("div", {
                  className: "px-3 py-4 text-center text-xs text-muted-foreground",
                  children: "Không có video chờ xử lý."
                })
              })]
            }) : null, (0, t.jsxs)("div", {
              className: "rounded-lg border border-border bg-background/45 px-3",
              children: [(0, t.jsx)(eA, {
                icon: c.Gauge,
                title: "Chế độ xử lý",
                description: "Chọn chế độ xử lý phù hợp với nội dung video.",
                children: (0, t.jsx)(e_, {
                  value: _,
                  options: es.LOCAL_PROCESSING_MODE_OPTIONS,
                  onChange: tf,
                  showDescription: !0
                })
              }), (0, t.jsx)(eA, {
                icon: l,
                title: "Ngôn ngữ gốc",
                description: "Chọn ngôn ngữ nguồn của video và ngôn ngữ đích của phụ đề, giọng đọc.",
                children: (0, t.jsxs)("div", {
                  className: "flex min-w-0 flex-wrap items-center gap-2",
                  children: [(0, t.jsx)("div", {
                    className: (0, O.cn)(eT, "flex-1"),
                    children: (0, t.jsx)(eP, {
                      value: eq,
                      options: eS,
                      searchOptions: eS,
                      onChange: A,
                      onRequestMore: eM,
                      title: "Ngôn ngữ nguồn",
                      className: "sm:flex-1"
                    })
                  }), (0, t.jsx)(i.ArrowRight, {
                    className: "h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  }), (0, t.jsxs)("div", {
                    className: "flex shrink-0 items-center gap-2.5",
                    title: "Ngôn ngữ đích của phụ đề và giọng đọc.",
                    children: [(0, t.jsx)("div", {
                      className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-primary",
                      children: (0, t.jsx)(u, {
                        className: "h-3.5 w-3.5"
                      })
                    }), (0, t.jsx)("p", {
                      className: "text-xs font-semibold",
                      children: "Ngôn ngữ dịch"
                    })]
                  }), (0, t.jsx)("div", {
                    className: (0, O.cn)(eT, "flex-1"),
                    children: (0, t.jsx)(eP, {
                      value: eW,
                      options: eC,
                      searchOptions: eC,
                      onChange: D,
                      title: "Ngôn ngữ dịch",
                      className: "sm:flex-1"
                    })
                  })]
                })
              }), (0, t.jsx)(eA, {
                icon: N.Wand2,
                title: "Phong cách dịch",
                description: "Chọn văn phong dùng cho toàn bộ video trước khi bắt đầu xử lý.",
                children: (0, t.jsx)(G, {
                  disabled: eR
                })
              }), (0, t.jsxs)(eA, {
                icon: x.Mic2,
                title: "Giọng đọc",
                description: "Chọn giọng lồng tiếng hoặc bỏ qua TTS để chỉ tạo phụ đề.",
                children: [(0, t.jsxs)("div", {
                  className: eT,
                  children: [(0, t.jsx)(e_, {
                    value: eZ,
                    options: eJ,
                    onChange: I,
                    embedded: !0
                  }), eQ ? null : (0, t.jsx)(C.PremiumVoiceSelect, {
                    className: "min-w-[10.5rem] flex-1 sm:w-44 sm:flex-none",
                    value: (0, ep.isPremiumVoiceId)(P) ? P : void 0,
                    onValueChange: tb,
                    onPreview: e => void tp(e),
                    dichVideoProcessingEnabled: e0,
                    onTopUpMinutes: o
                  })]
                }), eQ ? (0, t.jsx)("p", {
                  className: "mt-1.5 text-[10px] leading-4 text-muted-foreground",
                  children: "Nam/Nữ chọn giọng nam/nữ mặc định của ngôn ngữ đích; giọng Việt cao cấp chỉ áp dụng cho tiếng Việt."
                }) : null]
              }), (0, t.jsx)(eA, {
                icon: "muted" === M ? j.VolumeX : y.Volume2,
                title: "Âm thanh gốc",
                description: "Chọn mức âm thanh gốc trong video xuất.",
                children: (0, t.jsx)("div", {
                  className: "space-y-1.5",
                  children: (0, t.jsx)(e_, {
                    value: e6,
                    options: e9,
                    onChange: R
                  })
                })
              })]
            })]
          })]
        })
      })
    })
  }], 17198)
}]);