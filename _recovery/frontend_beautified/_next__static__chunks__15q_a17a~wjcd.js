(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 84635, e => {
  "use strict";
  var t = e.i(43476),
    i = e.i(71645),
    a = e.i(57688),
    s = e.i(53138),
    n = e.i(51757),
    r = e.i(78001),
    l = e.i(33658),
    o = e.i(80796),
    d = e.i(69644);
  let c = (0, e.i(56420).default)("layers", [
    ["path", {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }],
    ["path", {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }],
    ["path", {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }]
  ]);
  var u = e.i(32781),
    h = e.i(28523),
    m = e.i(21357),
    x = e.i(95925),
    p = e.i(73474),
    g = e.i(63676),
    f = e.i(87486),
    v = e.i(19455),
    b = e.i(68148),
    w = e.i(46798),
    j = e.i(76639);
  e.i(89268);
  var y = e.i(7787),
    N = e.i(81341),
    S = e.i(63126),
    k = e.i(46696),
    B = e.i(38991),
    C = e.i(57342),
    T = e.i(65991),
    M = e.i(33228),
    D = e.i(44077),
    I = e.i(4073),
    _ = e.i(69160),
    E = e.i(87518),
    P = e.i(53752);

  function V(e, t) {
    return e.thumbnail ? e.thumbnail : e.videoId ? t.find(t => t.id === e.videoId)?.thumbnail : void 0
  }

  function z(e) {
    let t = (0, I.useSeriesBatchStore)(e => e.items),
      a = (0, I.useSeriesBatchStore)(e => e.setItemThumbnails),
      s = (0, T.useVideoStore)(e => e.videos);
    i.default.useEffect(() => {
      if (!e || !(0, N.isTauri)() || 0 === t.length) return;
      let i = !1;
      return (async () => {
        let e = "",
          n = [];
        for (let a of t) {
          if (i) return;
          if (!V(a, s)) try {
            e || (e = await (0, S.getTempDir)());
            let t = function(e, t) {
              let i = e.replace(/[\\/]+$/, ""),
                a = e.includes("\\") ? "\\" : "/";
              return `${i}${a}${t}`
            }(e, function(e) {
              let t = 0x811c9dc5;
              for (let i = 0; i < e.length; i += 1) t ^= e.charCodeAt(i), t = Math.imul(t, 0x1000193);
              return `series-batch-thumb-${(t>>>0).toString(16)}.jpg`
            }(a.path));
            if (await (0, N.fileExists)(t) || await (0, P.generateThumbnail)(a.path, t, 1), i) return;
            n.push({
              path: a.path,
              thumbnail: t
            })
          } catch {}
        }!i && n.length > 0 && a(n)
      })(), () => {
        i = !0
      }
    }, [e, t, a, s])
  }
  var F = e.i(38825),
    L = e.i(27895),
    A = e.i(75157),
    $ = e.i(3091),
    H = e.i(59416),
    K = e.i(53851),
    O = e.i(77071),
    Q = e.i(57428),
    R = e.i(99375),
    q = e.i(5071),
    X = e.i(80345),
    U = e.i(71040),
    J = e.i(81469),
    G = e.i(78422),
    W = e.i(92719),
    Y = e.i(20829),
    Z = e.i(77730);
  let ee = [];

  function et() {
    let {
      dialogOpen: e,
      closeDialog: s,
      templateName: n,
      outputDir: r,
      setOutputDir: l,
      autoExport: c,
      setAutoExport: u,
      setExecutionSnapshot: h,
      items: m,
      addPaths: x,
      removePaths: g,
      bindItemVideo: b,
      startUiPreview: w,
      templateVideoId: y,
      markStampApplied: k,
      setItemStatuses: B
    } = (0, I.useSeriesBatchStore)(), {
      videos: C,
      addVideoFromFile: M,
      readSeriesBatchStamps: P,
      applySeriesBatchStamps: F
    } = (0, T.useVideoStore)(), [L, $] = i.default.useState(!1), [H, et] = i.default.useState(!1), [ei, ea] = i.default.useState(!1), [es, en] = i.default.useState(new Set), er = i.default.useRef(!1), el = (0, X.usePlatformDownloadStore)(e => e.history), eo = (0, U.useMissingPlatformFiles)(ei ? el : ee);
    z(e), i.default.useEffect(() => {
      if (!e || r.trim() || !(0, N.isTauri)()) return;
      let t = !1;
      return et(!0), (0, S.getDefaultOutputDir)().then(e => {
        !t && e && (et(!1), l(e))
      }).finally(() => {
        t || et(!1)
      }), () => {
        t = !0
      }
    }, [e, r, l]);
    let ed = async () => {
      if (!(0, N.isTauri)()) {
        let e = document.getElementById("series-batch-file-input");
        e?.click();
        return
      }
      let e = await (0, N.openMultipleFileDialog)();
      0 !== e.length && x(e)
    }, ec = async () => {
      if (!(0, N.isTauri)()) return void await (0, N.showMessage)("Cần app desktop", "Thêm folder video chỉ chạy trong DichVideo desktop.", "warning");
      let e = await (0, N.openDirectoryDialog)();
      if (e) try {
        let t = await (0, N.listVideoFilesInDirectory)(e);
        if (0 === t.length) return void await (0, N.showMessage)("Folder không có video", "Chọn folder chứa file .mp4, .mkv, .mov hoặc .webm. Thư mục xuất bên trên chỉ là nơi ghi MP4, không phải folder nguồn.", "warning");
        x(t)
      } catch (e) {
        await (0, N.showMessage)("Không đọc được folder", e instanceof Error ? e.message : "Không liệt kê được video trong folder này.", "error")
      }
    }, eu = async () => {
      if (!(0, N.isTauri)()) return void await (0, N.showMessage)("Cần app desktop", "Chọn thư mục xuất chỉ chạy trong DichVideo desktop.", "warning");
      let e = await (0, N.openDirectoryDialog)();
      e && l(e)
    }, eh = async () => {
      if (!er.current) {
        er.current = !0, $(!0);
        try {
          let e = r.trim();
          if (!e && (0, N.isTauri)() && (e = await (0, S.getDefaultOutputDir)()) && l(e), c && !e) return void await (0, N.showMessage)("Chưa có thư mục xuất", "Hãy chọn thư mục xuất trước khi bật tự xuất.", "warning");
          if (c) {
            let t = (0, _.collectSeriesBatchOutputCollisions)(m.filter(e => "skip" !== e.kind).map(e => e.path), e);
            if (t.length > 0) {
              let e = 1 === t[0].sourcePaths.length;
              await (0, N.showMessage)(e ? "Không thể ghi đè video nguồn" : "Trùng tên file xuất", e ? "Hãy chọn thư mục xuất khác thư mục video nguồn." : `${t[0].outputName} được tạo từ nhiều video. H\xe3y đổi t\xean hoặc bỏ bớt video tr\xf9ng.`, "warning");
              return
            }
          }
          let t = C.find(e => e.id === y);
          if (!t || !y) return void await (0, N.showMessage)("Không tìm thấy tập mẫu", "Hãy mở lại tập mẫu trong Editor rồi bắt đầu hàng loạt.", "warning");
          let i = D.useQueueStore.getState(),
            a = [...i.items].reverse().find(e => e.videoId === t.id),
            s = a?.executionSnapshot ?? i.runs.find(e => e.id === a?.runId)?.snapshot,
            n = q.useDashboardPreferencesStore.getState(),
            o = (0, Y.buildQueueSnapshot)({
              sourceLang: n.sourceLang,
              targetLang: n.targetLang,
              processingMode: n.processingMode,
              voiceMode: n.voiceMode,
              originalAudioMode: n.originalAudioMode,
              baseSettings: W.useSettingsStore.getState().settings
            }),
            d = await P(t.id),
            u = (0, _.seriesBatchStampFingerprint)(d),
            x = T.useVideoStore.getState().videos.find(e => e.id === t.id) ?? t,
            p = {
              ...(0, Z.projectRecoveryExecutionSnapshot)(s ?? o, x),
              createdAt: new Date().toISOString(),
              seriesBatchStampSnapshot: structuredClone(d)
            };
          h(p), w(), await (0, E.startSeriesBatchProcessing)({
            items: m,
            parentVideoId: t.id,
            existingVideos: T.useVideoStore.getState().videos,
            addVideoFromFile: M,
            enqueueAndStart: i.enqueueAndStart,
            applyStamps: async e => {
              await F(e, d);
              let t = T.useVideoStore.getState().videos.find(t => t.id === e);
              t && k([t.path], u)
            },
            snapshotFromParent: () => p,
            onItemBound: b,
            onItemStatus: (e, t) => B([{
              path: e,
              status: t
            }])
          })
        } finally {
          er.current = !1, $(!1)
        }
      }
    }, em = m.filter(e => "skip" !== e.kind), ex = em.length, ep = (0, _.compactSeriesBatchVideoTitle)(n || "Tập mẫu", 58), eg = c && !r.trim(), ef = (0, _.collectSeriesBatchOutputCollisions)(em.map(e => e.path), r.trim() || "."), ev = c && ef.length > 0, eb = ev && 1 === ef[0].sourcePaths.length, ew = es.size;
    return (0, t.jsxs)(t.Fragment, {
      children: [(0, t.jsx)(j.Dialog, {
        open: e,
        onOpenChange: e => !e && s(),
        children: (0, t.jsxs)(j.DialogContent, {
          className: "w-[calc(100vw-1.5rem)] max-w-2xl min-w-0 overflow-hidden",
          "data-series-batch-dialog": !0,
          children: [(0, t.jsxs)(j.DialogHeader, {
            className: "min-w-0 gap-2",
            children: [(0, t.jsx)(j.DialogTitle, {
              children: "Xử lý hàng loạt"
            }), (0, t.jsxs)(j.DialogDescription, {
              className: "grid min-w-0 gap-1.5 text-xs",
              children: [(0, t.jsxs)("span", {
                className: "flex min-w-0 items-center gap-2",
                children: [(0, t.jsx)("span", {
                  className: "shrink-0 text-muted-foreground",
                  children: "Video mẫu"
                }), (0, t.jsx)("span", {
                  className: "min-w-0 truncate rounded-md bg-muted/70 px-2 py-1 font-medium text-foreground",
                  title: n || void 0,
                  children: ep
                })]
              }), (0, t.jsx)("span", {
                className: "text-[11px] text-muted-foreground",
                children: "Áp dụng logo, style phụ đề, canvas và giọng của video mẫu cho từng video."
              })]
            })]
          }), (0, t.jsxs)("div", {
            className: "min-w-0 space-y-3",
            children: [(0, t.jsxs)("div", {
              className: "grid min-w-0 gap-3 sm:grid-cols-2",
              children: [(0, t.jsxs)("section", {
                className: "flex min-h-36 min-w-0 flex-col rounded-lg border border-border bg-muted/20 p-3",
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: "Nguồn video"
                }), (0, t.jsx)("p", {
                  className: "mt-1 h-8 text-[11px] leading-4 text-muted-foreground",
                  children: "Chọn một thư mục, nhiều file video, hoặc video đã tải bằng công cụ Tải video."
                }), (0, t.jsxs)("div", {
                  className: "mt-auto grid grid-cols-2 gap-2",
                  children: [(0, t.jsxs)(v.Button, {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    className: "h-8 min-w-0 text-xs",
                    "data-series-batch-add-folder": !0,
                    onClick: () => void ec(),
                    children: [(0, t.jsx)(d.FolderOpen, {
                      className: "h-3.5 w-3.5"
                    }), "Thêm folder"]
                  }), (0, t.jsxs)(v.Button, {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    className: "h-8 min-w-0 text-xs",
                    onClick: () => void ed(),
                    children: [(0, t.jsx)(O.Plus, {
                      className: "h-3.5 w-3.5"
                    }), "Thêm video"]
                  }), (0, t.jsxs)(v.Button, {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    className: "col-span-2 h-8 min-w-0 text-xs",
                    disabled: !(0, N.isTauri)(),
                    "data-series-batch-add-downloads": !0,
                    onClick: () => ea(!0),
                    children: [(0, t.jsx)(K.CloudDownload, {
                      className: "h-3.5 w-3.5"
                    }), "Chọn từ video đã tải (", el.length, ")"]
                  })]
                })]
              }), (0, t.jsxs)("section", {
                className: "flex min-h-36 min-w-0 flex-col rounded-lg border border-border bg-muted/20 p-3",
                "data-series-batch-output-section": !0,
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: "Thư mục xuất MP4"
                }), (0, t.jsx)("p", {
                  className: "mt-1 h-8 truncate text-[11px] leading-4 text-muted-foreground",
                  title: r || void 0,
                  children: H ? "Đang lấy thư mục mặc định..." : r || "Chưa chọn thư mục xuất"
                }), (0, t.jsxs)("div", {
                  className: "mt-2 flex items-center justify-between gap-3",
                  children: [(0, t.jsx)("label", {
                    htmlFor: "series-batch-auto-export",
                    className: "text-[11px] font-medium",
                    children: "Tự xuất khi xử lý xong"
                  }), (0, t.jsx)(R.Switch, {
                    id: "series-batch-auto-export",
                    className: "shrink-0",
                    checked: c,
                    onCheckedChange: u,
                    "aria-label": "Tự xuất khi xử lý xong"
                  })]
                }), (0, t.jsxs)(v.Button, {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  className: "mt-auto h-8 w-full text-xs",
                  onClick: () => void eu(),
                  children: [(0, t.jsx)(d.FolderOpen, {
                    className: "h-3.5 w-3.5"
                  }), "Chọn thư mục xuất"]
                })]
              })]
            }), ev ? (0, t.jsx)("p", {
              className: "text-[11px] leading-4 text-destructive",
              children: eb ? "Thư mục xuất đang trùng thư mục video nguồn. Hãy chọn thư mục khác." : `Tr\xf9ng t\xean file xuất: ${ef[0].outputName}. Đổi t\xean hoặc bỏ bớt video tr\xf9ng.`
            }) : eg && !H ? (0, t.jsx)("p", {
              className: "text-[11px] leading-4 text-destructive",
              children: "Chọn thư mục xuất trước khi bắt đầu."
            }) : null, (0, t.jsxs)("div", {
              className: "min-w-0 overflow-hidden rounded-lg border border-border bg-background/45",
              children: [(0, t.jsxs)("div", {
                className: "flex min-w-0 items-center justify-between gap-2 border-b border-border px-3 py-2",
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: "Danh sách video"
                }), (0, t.jsxs)("div", {
                  className: "flex shrink-0 items-center gap-1.5",
                  children: [ex > 0 ? (0, t.jsx)(v.Button, {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive",
                    "data-series-batch-clear": !0,
                    onClick: () => {
                      0 !== ex && g(em.map(e => e.path))
                    },
                    children: "Xóa hết"
                  }) : null, (0, t.jsxs)(f.Badge, {
                    variant: "secondary",
                    className: "h-6 px-2 text-[11px]",
                    children: [ex, " video"]
                  })]
                })]
              }), (0, t.jsx)("div", {
                className: "max-h-64 min-w-0 divide-y divide-border overflow-y-auto overflow-x-hidden",
                children: 0 === ex ? (0, t.jsx)("p", {
                  className: "px-3 py-6 text-center text-xs text-muted-foreground",
                  children: "Chưa có video nguồn. Bấm Thêm folder hoặc Thêm video."
                }) : em.map(e => {
                  let i = V(e, C);
                  return (0, t.jsxs)("div", {
                    className: "grid min-w-0 grid-cols-[4rem_minmax(0,1fr)_auto_1.75rem] items-center gap-2 px-3 py-2",
                    children: [(0, t.jsx)("div", {
                      className: "flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                      "data-series-batch-thumb": !0,
                      children: i ? (0, t.jsx)(a.default, {
                        src: (0, N.resolveMediaSrc)(i),
                        alt: e.name,
                        width: 128,
                        height: 72,
                        className: "h-full w-full object-cover",
                        unoptimized: !0
                      }) : (0, t.jsx)(o.Film, {
                        className: "h-3.5 w-3.5 text-muted-foreground"
                      })
                    }), (0, t.jsxs)("div", {
                      className: "min-w-0 flex-1 overflow-hidden",
                      children: [(0, t.jsx)("p", {
                        className: "truncate text-xs font-semibold",
                        title: e.name,
                        children: (0, _.compactSeriesBatchVideoTitle)(e.name, 48)
                      }), (0, t.jsx)("p", {
                        className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                        title: e.path,
                        children: (0, _.seriesBatchParentFolderLabel)(e.path)
                      })]
                    }), (0, t.jsx)(f.Badge, {
                      variant: (0, _.seriesBatchBadgeVariant)(e),
                      className: "max-w-[5.5rem] shrink-0 truncate text-[11px]",
                      children: (0, _.seriesBatchKindLabel)(e.kind)
                    }), (0, t.jsx)(v.Button, {
                      type: "button",
                      variant: "ghost",
                      size: "icon",
                      className: "h-7 w-7 shrink-0",
                      "data-series-batch-remove": !0,
                      "aria-label": `X\xf3a ${e.name} khỏi h\xe0ng loạt`,
                      title: "Xóa khỏi hàng loạt",
                      onClick: () => g([e.path]),
                      children: (0, t.jsx)(p.Trash2, {
                        className: "h-3.5 w-3.5"
                      })
                    })]
                  }, e.path)
                })
              })]
            })]
          }), (0, t.jsx)("input", {
            id: "series-batch-file-input",
            type: "file",
            multiple: !0,
            accept: "video/*,.mp4,.mkv,.mov,.webm",
            className: "hidden",
            onChange: e => {
              var t;
              t = e.target.files, t?.length && x([...t].map(e => e.path || e.name)), e.currentTarget.value = ""
            }
          }), (0, t.jsxs)(j.DialogFooter, {
            className: "min-w-0 flex-wrap items-center gap-2 border-t border-border pt-3 sm:justify-between",
            children: [(0, t.jsxs)("p", {
              className: "min-w-0 flex-1 text-[11px] text-muted-foreground",
              children: [ex, " video · xử lý tuần tự", c ? " · tự xuất từng video" : ""]
            }), (0, t.jsxs)("div", {
              className: "flex gap-2",
              children: [(0, t.jsx)(v.Button, {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "h-8 text-xs",
                onClick: s,
                children: "Hủy"
              }), (0, t.jsx)(v.Button, {
                type: "button",
                size: "sm",
                className: "h-8 text-xs",
                disabled: 0 === ex || L || H || eg || ev,
                onClick: () => void eh(),
                children: c ? "Bắt đầu xử lý & xuất" : "Bắt đầu xử lý"
              })]
            })]
          })]
        })
      }), (0, t.jsx)(j.Dialog, {
        open: ei,
        onOpenChange: ea,
        children: (0, t.jsxs)(j.DialogContent, {
          className: "w-[calc(100vw-1.5rem)] max-w-xl min-w-0 overflow-hidden",
          "data-series-batch-downloads-picker": !0,
          children: [(0, t.jsxs)(j.DialogHeader, {
            className: "min-w-0",
            children: [(0, t.jsx)(j.DialogTitle, {
              children: "Chọn từ video đã tải"
            }), (0, t.jsx)(j.DialogDescription, {
              className: "text-xs",
              children: "Tích chọn video tải bằng công cụ Tải video rồi đưa vào danh sách xử lý hàng loạt."
            })]
          }), 0 === el.length ? (0, t.jsxs)("div", {
            className: "flex flex-col items-center px-4 py-8 text-center",
            children: [(0, t.jsx)("div", {
              className: "mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-muted-foreground",
              children: (0, t.jsx)(K.CloudDownload, {
                className: "h-5 w-5"
              })
            }), (0, t.jsx)("p", {
              className: "text-xs font-semibold",
              children: "Chưa có video nào tải xong"
            }), (0, t.jsx)("p", {
              className: "mt-0.5 text-[11px] text-muted-foreground",
              children: "Video tải xong ở trang Tải video sẽ hiện ở đây."
            })]
          }) : (0, t.jsx)("div", {
            className: "max-h-80 min-w-0 divide-y divide-border overflow-y-auto overflow-x-hidden rounded-lg border border-border",
            children: el.map(e => {
              let i = eo.has(e.id),
                a = m.some(t => "skip" !== t.kind && (0, _.isSameMediaPath)(t.path, e.filePath)),
                s = i || a,
                n = [(0, J.platformSourceLabel)(e.source), e.formatLabel, null !== e.durationSeconds && e.durationSeconds > 0 ? (0, A.formatDuration)(e.durationSeconds) : null, null !== e.fileSizeBytes && e.fileSizeBytes > 0 ? (0, A.formatFileSize)(e.fileSizeBytes) : null, (0, G.formatDownloadedAtLabel)(e.downloadedAt), a ? "Đã có trong danh sách" : null, i ? "Tệp không còn" : null].filter(e => !!e);
              return (0, t.jsxs)("label", {
                className: (0, A.cn)("flex items-center gap-3 px-3 py-2", s ? "opacity-60" : "cursor-pointer hover:bg-muted/40"),
                children: [(0, t.jsx)(Q.Checkbox, {
                  checked: es.has(e.id),
                  disabled: s,
                  onCheckedChange: t => {
                    var i, a;
                    return i = e.id, a = !0 === t, void en(e => {
                      let t = new Set(e);
                      return a ? t.add(i) : t.delete(i), t
                    })
                  },
                  "aria-label": `Chọn ${e.title}`
                }), (0, t.jsx)("div", {
                  className: "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                  children: e.thumbnail ? (0, t.jsx)("img", {
                    src: e.thumbnail,
                    alt: e.title,
                    className: "h-full w-full object-cover"
                  }) : (0, t.jsx)(o.Film, {
                    className: "h-4 w-4 text-muted-foreground"
                  })
                }), (0, t.jsxs)("div", {
                  className: "min-w-0 flex-1",
                  children: [(0, t.jsx)("p", {
                    className: "truncate text-xs font-semibold",
                    title: e.title,
                    children: e.title
                  }), (0, t.jsx)("p", {
                    className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                    children: n.join(" · ")
                  })]
                })]
              }, e.id)
            })
          }), (0, t.jsxs)(j.DialogFooter, {
            className: "min-w-0 flex-wrap items-center gap-2 border-t border-border pt-3 sm:justify-between",
            children: [(0, t.jsxs)("p", {
              className: "min-w-0 flex-1 text-[11px] text-muted-foreground",
              children: ["Đã chọn ", ew, " video"]
            }), (0, t.jsxs)("div", {
              className: "flex gap-2",
              children: [(0, t.jsx)(v.Button, {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "h-8 text-xs",
                onClick: () => ea(!1),
                children: "Đóng"
              }), (0, t.jsxs)(v.Button, {
                type: "button",
                size: "sm",
                className: "h-8 text-xs",
                disabled: 0 === ew,
                onClick: () => {
                  let e = el.filter(e => es.has(e.id) && !eo.has(e.id));
                  0 !== e.length && (x(e.map(e => e.filePath)), en(new Set), ea(!1))
                },
                children: ["Thêm ", ew, " video vào hàng loạt"]
              })]
            })]
          })]
        })
      })]
    })
  }
  var ei = e.i(30148),
    ea = e.i(1046),
    es = e.i(65055);

  function en(e, t) {
    let i = Number.isFinite(t) ? Math.max(0, Math.min(100, t)) : 0,
      a = Math.round(i);
    return "failed" === e || "interrupted" === e ? {
      value: i,
      label: `Dừng tại ${a}%`,
      active: !1
    } : {
      value: i,
      label: `${a}%`,
      active: (0, es.isQueueItemActive)(e)
    }
  }
  var er = e.i(53065);
  let el = {
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
        label: "Đã xử lý",
        variant: "success"
      },
      error: {
        label: "Có lỗi",
        variant: "destructive"
      }
    },
    eo = "md:grid-cols-[minmax(0,0.85fr)_minmax(0,0.8fr)_minmax(27rem,auto)]";
  e.s(["HistoryPage", 0, function() {
    let {
      setCurrentView: e
    } = (0, B.useAppStore)(), P = (0, C.useCloudStore)(e => e.getJobDisposition), {
      videos: K,
      tasks: O,
      activeVideoId: Q,
      openNleProject: R,
      deleteVideoProject: X,
      addVideoFromFile: U,
      readSeriesBatchStamps: J,
      applySeriesBatchStamps: G
    } = (0, T.useVideoStore)(), ee = (0, I.useSeriesBatchStore)(e => e.panelOpen), ed = (0, I.useSeriesBatchStore)(e => e.openDialog), ec = (0, I.useSeriesBatchStore)(e => e.templateVideoId), eu = (0, I.useSeriesBatchStore)(e => e.items), eh = (0, I.useSeriesBatchStore)(e => e.executionSnapshot), em = (0, I.useSeriesBatchStore)(e => e.setExecutionSnapshot), ex = (0, I.useSeriesBatchStore)(e => e.removePaths), ep = (0, I.useSeriesBatchStore)(e => e.bindItemVideo), eg = (0, I.useSeriesBatchStore)(e => e.reconcileLegacyItemVideos), ef = (0, T.useVideoStore)(e => e.projectHistoryHydrationState), ev = (0, I.useSeriesBatchStore)(e => e.markStampApplied), eb = (0, I.useSeriesBatchStore)(e => e.setItemStatuses), ew = (0, I.useSeriesBatchStore)(e => e.finishBatch), {
      jobs: ej,
      cancelManualExportBatch: ey
    } = (0, M.useExportStore)(), [eN, eS] = i.default.useState(!1), ek = i.default.useRef(!1), eB = (0, D.useQueueStore)(e => e.items), eC = (0, D.useQueueStore)(e => e.runs), eT = (0, D.useQueueStore)(e => e.activeRunId), eM = (0, D.useQueueStore)(e => e.pauseQueue), eD = (0, D.useQueueStore)(e => e.resumeQueue), eI = (0, D.useQueueStore)(e => e.retryQueueItem), e_ = (0, D.useQueueStore)(e => e.removeQueueItem), [eE, eP] = i.default.useState(null), [eV, ez] = i.default.useState(null), eF = i.default.useRef(null), [eL, eA] = i.default.useState(!1), [e$, eH] = i.default.useState(null), [eK, eO] = i.default.useState(!1), [eQ, eR] = i.default.useState(null), [eq, eX] = i.default.useState(null), [eU, eJ] = i.default.useState(!1), eG = i.default.useRef(0);
    i.default.useEffect(() => {
      ee && "ready" === ef && eg(K)
    }, [ee, ef, eg, K]), i.default.useEffect(() => {
      if ("ready" === ef && K.some(e => e.id === ec))
        for (let e of eu) {
          let t = K.find(t => t.id === e.videoId);
          "skip" !== e.kind && t && void 0 === t.seriesBatchParentId && ep(e.path, t.id, ec)
        }
    }, [eu, ec, ep, ef, K]);
    let eW = i.default.useMemo(() => eC.find(e => e.id === eT), [eT, eC]),
      eY = i.default.useMemo(() => eB.filter(e => (!eT || e.runId === eT) && "skipped" !== e.status && "done" !== e.status && "settlement_pending" !== e.status), [eT, eB]),
      eZ = i.default.useMemo(() => new Set(eY.map(e => e.videoId)), [eY]),
      e0 = i.default.useMemo(() => [...K].filter(e => (0, $.hasHistoryResult)(e) || eZ.has(e.id)).sort($.compareHistoryActivityDesc), [eZ, K]),
      e1 = i.default.useMemo(() => eu.filter(e => "skip" !== e.kind), [eu]),
      e3 = i.default.useMemo(() => new Set(e1.flatMap(e => e.videoId ? [e.videoId] : [])), [e1]),
      e5 = i.default.useMemo(() => (0, _.collectSeriesBatchRecoveryItems)(e1), [e1]).length > 0 && !e1.some(e => "running" === e.status),
      e2 = i.default.useMemo(() => K.find(e => e.id === ec), [ec, K]),
      e8 = ee && e1.length > 0;
    z(e8), i.default.useEffect(() => {
      e8 && e2 && !e2.nleDocument && J(e2.id).catch(e => {
        console.warn("Series batch parent stamp hydrate failed:", e)
      })
    }, [e2, J, e8]);
    let e4 = i.default.useMemo(() => (0, _.seriesBatchStampFingerprint)((0, _.seriesBatchStampsFromVideo)(e2)), [e2]),
      e6 = i.default.useMemo(() => {
        let e = new Set(e0.map(e => e.seriesBatchParentId)),
          t = K.filter(t => e.has(t.id) && !e0.some(e => e.id === t.id)),
          i = (0, _.groupSeriesBatchHistory)([...e0, ...t]);
        return !e8 || !e2 || i.some(e => e.id === e2.id) ? i : [e2, ...i]
      }, [e2, e0, e8, K]),
      e7 = eE ? K.find(e => e.id === eE) : void 0,
      e9 = e7 ? (0, F.projectDeletionMode)(e7, e$) : "normal",
      te = "requires_abandonment" === e9,
      tt = e$?.disposition === "unknown_manual_review",
      ti = e$ ? (0, F.formatBillingLiabilityDuration)(e$.outstanding_total_seconds) : null,
      ta = i.default.useCallback(() => {
        eG.current += 1, eP(null), eH(null), eR(null), eO(!1), eX(null), eJ(!1)
      }, []),
      ts = async e => {
        if (ee && e.id === ec && (0, _.seriesBatchParentDeletionBlocked)(e1)) return void k.toast.warning("Chưa thể xóa video cha", {
          description: "Hãy xử lý xong hoặc xóa các video con chưa hoàn tất trước."
        });
        let t = eG.current + 1;
        eG.current = t, eP(e.id), eH(null), eR(null), eO(!1), eX(null);
        let i = (0, F.projectDeletionJobId)(e);
        if (i && "normal" !== (0, F.projectDeletionMode)(e, null)) {
          eO(!0);
          try {
            let e = await P(i);
            if (eG.current !== t) return;
            eH(e)
          } catch (e) {
            if (eG.current !== t) return;
            eR(e instanceof Error ? e.message : "Không kiểm tra được trạng thái phút của job.")
          } finally {
            eG.current === t && eO(!1)
          }
        }
      }, tn = async () => {
        if (e7 && !eK && !eQ && "requires_disposition" !== e9) {
          eA(!0);
          try {
            let e = ee && e7.id === ec,
              t = ee && e1.some(e => e.videoId === e7.id);
            await X(e7.id, {
              disposition: e$,
              confirmAbandon: te
            }), e && ew(), t && ex([e7.path]), ta()
          } catch (e) {
            if ("project_export_active" === e?.code) {
              let e = ej.find(e => e.videoId === e7.id && ("queued" === e.status || "processing" === e.status));
              if (!e) return void await (0, N.showMessage)("Project đang được xuất video", "Hãy chờ tác vụ xuất hiện tại hoàn tất rồi thử xóa lại.", "warning");
              eX(e.batchId);
              return
            }
            await (0, N.showMessage)("Không thể xóa project", e instanceof Error ? e.message : "Vui lòng thử lại sau.", "error")
          } finally {
            eA(!1)
          }
        }
      }, tr = async e => {
        if (!e) return void await (0, N.showMessage)("Không hiện được file audio", "Không xác định được đường dẫn file audio đã tạo.", "warning");
        try {
          await (0, y.openSrtAudioOutputFolder)(e)
        } catch (e) {
          await (0, N.showMessage)("Không hiện được file audio", e instanceof Error ? e.message : "Vui lòng kiểm tra file audio còn tồn tại.", "error")
        }
      }, tl = async (e, t) => {
        if ("srt_audio" === e.projectType) return void await tr(t.path);
        let i = t.path;
        if (!i) return void await (0, N.showMessage)("Không hiển thị được file", "Không xác định được đường dẫn file đã xuất.", "warning");
        try {
          await (0, S.revealPathInSystem)(i)
        } catch (e) {
          await (0, N.showMessage)("Không hiển thị được file", e instanceof Error ? e.message : "Vui lòng kiểm tra file xuất còn tồn tại.", "error")
        }
      }, to = async (t, i) => {
        if ("srt_audio" === t.projectType) {
          if (i.path) try {
            await tr(i.path);
            return
          } catch (e) {
            await (0, N.showMessage)("Không hiển thị được file audio", e instanceof Error ? e.message : "Vui lòng kiểm tra file xuất còn tồn tại.", "error")
          }
          e("srt-audio");
          return
        }
        if (!eF.current) {
          eF.current = t.id, ez(t.id);
          try {
            let e = e8 ? e1.find(e => e.videoId === t.id) : void 0;
            if (e && e2 && t.id !== e2.id) try {
              let i = await J(e2.id),
                a = (0, _.seriesBatchStampFingerprint)(i);
              (0, _.seriesBatchStampsNeedSync)(e.appliedStampFingerprint, a) && (await G(t.id, i), ev([t.path], a))
            } catch (e) {
              console.error("Series batch stamp pull failed:", e), await (0, N.showMessage)("Chưa đồng bộ được cài đặt", "Video vẫn mở với cài đặt hiện tại. Hãy bấm Đồng bộ cài đặt rồi mở lại.", "warning")
            }
            await R(t.id) || await (0, N.showMessage)("Project cần xử lý lại", "Project này chưa có dữ liệu NLE hoàn chỉnh.", "warning")
          } catch (t) {
            var a;
            let e = "nle_image_asset_missing" === (a = function(e) {
              if (e && "object" == typeof e) {
                let t = "code" in e ? e.code : "message" in e ? e.message : null;
                if ("string" == typeof t && t.trim()) return t.trim()
              }
              return "string" == typeof e && e.trim() ? e.trim() : "nle_document_invalid"
            }(t)) ? {
              title: "Không tìm thấy ảnh overlay",
              description: "Hãy khôi phục ảnh gốc về vị trí cũ, rồi mở lại project để thay hoặc xóa ảnh.",
              kind: "warning"
            } : "project_reprocess_required" === a || "nle_document_reprocess_required" === a ? {
              title: "Project cần xử lý lại",
              description: "Project này chưa có dữ liệu NLE hoàn chỉnh.",
              kind: "warning"
            } : {
              title: "Chưa thể mở Editor",
              description: "Dữ liệu chỉnh sửa của project không hợp lệ. Hãy gửi log hỗ trợ để kiểm tra.",
              kind: "error"
            };
            console.error("NLE project open failed:", t instanceof Error ? `${t.message}
${t.stack??""}` : JSON.stringify(t)), await (0, N.showMessage)(e.title, e.description, e.kind)
          } finally {
            eF.current = null, ez(null)
          }
        }
      }, td = async e => {
        if (ek.current) return;
        let t = (0, _.collectSeriesBatchRecoveryItems)(I.useSeriesBatchStore.getState().items);
        if (0 !== t.length) {
          ek.current = !0, eS(!0);
          try {
            let i = D.useQueueStore.getState(),
              a = [...i.items].reverse().find(t => t.videoId === e.id),
              s = a?.executionSnapshot ?? i.runs.find(e => e.id === a?.runId)?.snapshot,
              n = q.useDashboardPreferencesStore.getState(),
              r = (0, Y.buildQueueSnapshot)({
                sourceLang: n.sourceLang,
                targetLang: n.targetLang,
                processingMode: n.processingMode,
                voiceMode: n.voiceMode,
                originalAudioMode: n.originalAudioMode,
                baseSettings: W.useSettingsStore.getState().settings
              }),
              l = eh?.seriesBatchStampSnapshot ?? await J(e.id),
              o = (0, _.seriesBatchStampFingerprint)(l),
              d = T.useVideoStore.getState().videos.find(t => t.id === e.id) ?? e,
              c = (0, E.resolveSeriesBatchExecutionSnapshot)(eh, () => ({
                ...(0, Z.projectRecoveryExecutionSnapshot)(s ?? r, d),
                createdAt: new Date().toISOString(),
                seriesBatchStampSnapshot: structuredClone(l)
              }));
            em(c);
            let u = await (0, E.resumeSeriesBatchProcessing)({
              items: t,
              parentVideoId: e.id,
              existingVideos: T.useVideoStore.getState().videos,
              addVideoFromFile: U,
              enqueueAndStart: i.enqueueAndStart,
              applyStamps: async e => {
                await G(e, l);
                let t = T.useVideoStore.getState().videos.find(t => t.id === e);
                t && ev([t.path], o)
              },
              snapshotFromParent: () => c,
              onItemBound: ep,
              onItemStatus: (e, t) => eb([{
                path: e,
                status: t
              }])
            });
            u > 0 && k.toast.info(`Đ\xe3 tiếp tục xử l\xfd ${u} video`)
          } catch (e) {
            await (0, N.showMessage)("Không thể tiếp tục xử lý", e instanceof Error ? e.message : "Vui lòng thử lại sau.", "error")
          } finally {
            ek.current = !1, eS(!1)
          }
        }
      }, tc = async e => {
        await (0, er.awaitProjectVisualMutation)(e.id);
        let t = await J(e.id),
          i = (0, _.seriesBatchStampFingerprint)(t),
          a = [],
          s = 0;
        for (let i of e1) {
          let n = (0, _.resolveSeriesBatchItemVideo)(i, K);
          if (n && n.id !== e.id) try {
            await G(n.id, t), a.push(i.path)
          } catch (e) {
            s += 1, console.error("Series batch stamp apply failed:", e)
          }
        }
        ev(a, i), 0 === a.length ? k.toast.warning("Chưa có video con sẵn sàng để đồng bộ") : s > 0 ? k.toast.warning(`Đ\xe3 đồng bộ ${a.length} video, ${s} video chưa th\xe0nh c\xf4ng`) : k.toast.success(`Đ\xe3 đồng bộ c\xe0i đặt cho ${a.length} video`)
      }, tu = async () => {
        if (eq) {
          eJ(!0);
          try {
            await ey(eq), eX(null), await (0, N.showMessage)("Đã hủy xuất video", "Bạn có thể bấm Xóa project lần nữa.", "info")
          } catch (e) {
            await (0, N.showMessage)("Chưa thể hủy xuất video", e instanceof Error ? e.message : "Vui lòng thử lại.", "error")
          } finally {
            eJ(!1)
          }
        }
      };
    return (0, t.jsxs)(t.Fragment, {
      children: [(0, t.jsx)("div", {
        "data-testid": "desktop-view-history",
        className: "h-full overflow-y-auto bg-background",
        children: (0, t.jsx)("div", {
          className: "mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4",
          children: (0, t.jsxs)("section", {
            className: "overflow-hidden rounded-lg border border-border bg-card/70",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center justify-between border-b border-border px-4 py-3",
              children: [(0, t.jsxs)("div", {
                children: [(0, t.jsx)("p", {
                  className: "text-xs font-semibold",
                  children: "Video"
                }), (0, t.jsx)("p", {
                  className: "mt-1 text-xs text-muted-foreground",
                  children: "Theo dõi tiến độ hoặc mở lại từng video."
                })]
              }), (0, t.jsx)(n.CheckCircle2, {
                className: "h-4 w-4 text-primary"
              })]
            }), e6.length > 0 || e8 ? (0, t.jsx)("div", {
              className: "divide-y divide-border",
              children: e6.map(e => {
                let s = e8 && e2?.id === e.id,
                  n = K.find(t => t.id === e.seriesBatchParentId && t.id !== e.id),
                  j = K.some(t => t.seriesBatchParentId === e.id && t.id !== e.id),
                  y = e8 && e3.has(e.id);
                if (y && e2?.id !== e.id) return null;
                let S = [...eY].reverse().find(t => t.videoId === e.id),
                  k = S ? [...O].reverse().find(t => t.videoId === e.id && ("processing" === t.status || "pending" === t.status)) : void 0,
                  B = S ? Math.max(S.progress, k?.progress ?? S.progress) : 0,
                  C = S ? en(S.status, B) : null,
                  T = S && ("failed" === S.status || "interrupted" === S.status) ? (0, ea.getProcessingErrorDisplay)(S.errorMessage) : null,
                  M = S ? k?.message || S.message || S.stage : null,
                  D = !!(S && eW?.status === "running" && eW.activeItemId === S.id),
                  I = S?.status === "paused",
                  E = S?.status === "failed",
                  P = !!(S && ("waiting" === S.status || "paused" === S.status || "failed" === S.status || "interrupted" === S.status || "settlement_pending" === S.status)),
                  z = el[e.status],
                  F = e.id === Q,
                  R = (0, L.formatProcessingDurationLabel)(e),
                  q = (0, $.getHistoryOutputState)(e),
                  X = (0, $.getCompactVideoTitle)(e.name, 28),
                  U = !!q.label,
                  J = !!q.detail,
                  G = J && !R,
                  W = "srt_audio" === e.projectType,
                  Y = ("completed" === e.status || s) && !W && !n && !y,
                  Z = W || (0, ei.canHydrateNleProject)(e),
                  ee = "final" === q.kind && !!q.path && !W,
                  et = "error" === q.kind,
                  er = (0, t.jsxs)(t.Fragment, {
                    children: [(0, t.jsx)("div", {
                      className: "flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                      children: e.thumbnail ? (0, t.jsx)(a.default, {
                        src: (0, N.resolveMediaSrc)(e.thumbnail),
                        alt: e.name,
                        width: 192,
                        height: 108,
                        className: "h-full w-full object-cover",
                        unoptimized: !0
                      }) : W ? (0, t.jsx)(l.FileAudio, {
                        className: "h-5 w-5 text-primary"
                      }) : (0, t.jsx)(o.Film, {
                        className: "h-4 w-4 text-muted-foreground"
                      })
                    }), (0, t.jsxs)("div", {
                      className: "min-w-0 flex-1",
                      children: [(0, t.jsx)("p", {
                        className: "truncate text-xs font-semibold",
                        title: e.name,
                        children: X
                      }), (0, t.jsx)("p", {
                        className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                        children: W ? `${"text_file"===e.sourceKind||"text_paste"===e.sourceKind?"Text":"SRT"} sang Audio \xb7 ${(0,A.formatDuration)(e.outputDuration??e.duration)}` : `${(0,A.formatDuration)(e.duration)} \xb7 ${(0,A.formatFileSize)(e.size)} \xb7 ${e.width}x${e.height}`
                      })]
                    })]
                  });
                return (0, t.jsxs)(i.default.Fragment, {
                  children: [(0, t.jsxs)("div", {
                    "data-history-project-id": e.id,
                    "data-history-batch-parent": s || j ? "true" : void 0,
                    "data-history-parent-id": n?.id,
                    className: (0, A.cn)("group relative grid items-center gap-3 px-4 py-3 transition-colors", n && "ml-8 border-l-2 border-primary/25", s ? eo : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(24rem,auto)]", F ? "bg-primary/5" : "bg-transparent", Z ? "hover:bg-muted/30" : null),
                    children: [Z ? (0, t.jsx)("button", {
                      type: "button",
                      "data-history-card-open": !0,
                      "aria-label": W ? q.actionLabel : `Mở ${e.name} trong Editor`,
                      disabled: null !== eV,
                      onClick: () => void to(e, q),
                      className: "absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset disabled:cursor-wait"
                    }) : null, (0, t.jsxs)("div", {
                      className: "flex min-w-0 items-center gap-3 text-left",
                      children: [er, n ? (0, t.jsx)("span", {
                        className: "shrink-0 text-[10px] text-muted-foreground",
                        title: n.name,
                        children: "Video con"
                      }) : null]
                    }), S && C ? (0, t.jsxs)("div", {
                      "data-history-queue-progress": !0,
                      className: "w-full min-w-0",
                      children: [(0, t.jsxs)("div", {
                        className: "mb-1 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground",
                        children: [(0, t.jsx)(f.Badge, {
                          variant: (0, es.queueItemStatusVariant)(S.status),
                          className: "max-w-[12rem] shrink-0 truncate text-[10px]",
                          title: T?.detail ?? es.QUEUE_ITEM_STATUS_LABELS[S.status],
                          children: T?.badgeLabel ?? es.QUEUE_ITEM_STATUS_LABELS[S.status]
                        }), (0, t.jsx)("span", {
                          className: "min-w-0 flex-1 truncate",
                          title: T?.detail ?? M ?? void 0,
                          children: T?.detail ?? M
                        }), (0, t.jsx)("span", {
                          className: "shrink-0 font-mono text-primary",
                          children: C.label
                        })]
                      }), (0, t.jsx)(b.Progress, {
                        value: C.value
                      })]
                    }) : (0, t.jsxs)("div", {
                      "data-history-output-block": !0,
                      className: "flex w-full min-w-0 justify-self-start self-start flex-col items-start justify-start gap-1.5",
                      children: [(0, t.jsxs)("div", {
                        className: "flex min-w-0 flex-wrap items-center gap-2 leading-none",
                        children: [U ? (0, t.jsx)(f.Badge, {
                          variant: q.variant,
                          title: q.detail || q.label,
                          className: "max-w-[16rem] truncate leading-none",
                          children: q.label
                        }) : null, U ? null : (0, t.jsx)(f.Badge, {
                          variant: z.variant,
                          className: "text-[10px]",
                          children: z.label
                        })]
                      }), G ? (0, t.jsx)("span", {
                        "data-output-detail": !0,
                        className: "block w-full max-w-full min-w-0 truncate text-[11px] leading-4 text-muted-foreground",
                        title: q.detail,
                        children: q.detail
                      }) : null, !G && (J || R) ? (0, t.jsxs)("span", {
                        "data-history-output-meta": !0,
                        className: "flex w-full max-w-full min-w-0 items-baseline gap-1.5 text-[11px] leading-4 text-muted-foreground",
                        title: q.path,
                        children: [R ? (0, t.jsxs)("span", {
                          "data-output-duration": !0,
                          className: "shrink-0 leading-4",
                          children: ["Xử lý: ", R]
                        }) : null, R && J ? (0, t.jsx)("span", {
                          "aria-hidden": "true",
                          className: "shrink-0 leading-4",
                          children: "·"
                        }) : null, J ? (0, t.jsx)("span", {
                          "data-output-file": !0,
                          className: "min-w-0 truncate leading-4",
                          title: q.path || q.detail,
                          children: q.detail
                        }) : null]
                      }) : null, e.sourceMissing ? (0, t.jsx)("span", {
                        "data-history-source-missing-note": !0,
                        className: "min-w-0 truncate text-[11px] text-warning-foreground",
                        title: e.path,
                        children: W ? "File SRT gốc không tìm thấy. Audio đã xuất vẫn có thể mở nếu còn tồn tại." : "Video gốc không tìm thấy. Cần import lại để xử lý tiếp."
                      }) : null]
                    }), (0, t.jsx)(w.TooltipProvider, {
                      delayDuration: 250,
                      children: (0, t.jsxs)("div", {
                        "data-history-actions": !0,
                        className: "relative z-20 flex w-full min-w-0 shrink-0 flex-nowrap items-center justify-end gap-2",
                        children: [D ? (0, t.jsxs)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          className: "h-8 whitespace-nowrap text-xs",
                          onClick: () => void eM(),
                          children: [(0, t.jsx)(h.Pause, {
                            className: "h-3.5 w-3.5"
                          }), "Tạm dừng"]
                        }) : null, I ? (0, t.jsxs)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          className: "h-8 whitespace-nowrap text-xs",
                          onClick: () => void eD(),
                          children: [(0, t.jsx)(m.Play, {
                            className: "h-3.5 w-3.5"
                          }), "Tiếp tục"]
                        }) : null, E && S ? (0, t.jsxs)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          className: "h-8 whitespace-nowrap text-xs",
                          onClick: () => void eI(S.id),
                          children: [(0, t.jsx)(x.RotateCcw, {
                            className: "h-3.5 w-3.5"
                          }), "Thử lại"]
                        }) : null, P && S ? (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "ghost",
                          size: "icon",
                          className: "h-8 w-8",
                          "aria-label": `Bỏ khỏi h\xe0ng đợi ${e.name}`,
                          title: "Bỏ khỏi hàng đợi",
                          onClick: () => e_(S.id),
                          children: (0, t.jsx)(g.X, {
                            className: "h-4 w-4"
                          })
                        }) : null, ee ? (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "icon",
                          "aria-label": `Hiện file đ\xe3 xuất ${e.name}`,
                          title: "Hiện file đã xuất trong thư mục",
                          onClick: () => void tl(e, q),
                          className: "h-8 w-8",
                          children: (0, t.jsx)(d.FolderOpen, {
                            className: "h-3.5 w-3.5"
                          })
                        }) : null, s ? (0, t.jsxs)(t.Fragment, {
                          children: [e5 ? (0, t.jsxs)(v.Button, {
                            type: "button",
                            variant: "outline",
                            size: "sm",
                            className: "h-8 whitespace-nowrap text-xs",
                            "data-history-batch-resume": !0,
                            disabled: eN,
                            onClick: () => void td(e),
                            children: [eN ? (0, t.jsx)(u.Loader2, {
                              className: "h-3.5 w-3.5 animate-spin"
                            }) : (0, t.jsx)(m.Play, {
                              className: "h-3.5 w-3.5"
                            }), eN ? "Đang tiếp tục..." : "Tiếp tục xử lý"]
                          }) : null, (0, t.jsxs)(w.Tooltip, {
                            children: [(0, t.jsx)(w.TooltipTrigger, {
                              asChild: !0,
                              children: (0, t.jsx)(v.Button, {
                                type: "button",
                                variant: "outline",
                                size: "icon",
                                className: "h-8 w-8",
                                "aria-label": "Đồng bộ cài đặt cho video con",
                                "data-history-batch-apply-all": !0,
                                onClick: () => void tc(e),
                                children: (0, t.jsx)(r.CopyCheck, {
                                  "aria-hidden": "true",
                                  className: "h-3.5 w-3.5"
                                })
                              })
                            }), (0, t.jsx)(w.TooltipContent, {
                              side: "top",
                              children: "Đồng bộ cài đặt cho video con"
                            })]
                          })]
                        }) : null, Y ? (0, t.jsxs)(w.Tooltip, {
                          children: [(0, t.jsx)(w.TooltipTrigger, {
                            asChild: !0,
                            children: (0, t.jsx)(v.Button, {
                              type: "button",
                              variant: "outline",
                              size: "icon",
                              className: "h-8 w-8",
                              "aria-label": "Xử lý hàng loạt",
                              "data-history-series-batch-open": !0,
                              onClick: () => ed({
                                videoId: e.id,
                                path: e.path,
                                name: e.name
                              }),
                              children: (0, t.jsx)(c, {
                                "aria-hidden": "true",
                                className: "h-3.5 w-3.5"
                              })
                            })
                          }), (0, t.jsx)(w.TooltipContent, {
                            side: "top",
                            children: "Xử lý hàng loạt"
                          })]
                        }) : null, et || T ? (0, t.jsx)(H.ErrorSupportLogButton, {
                          videoId: e.id,
                          videoName: e.name
                        }) : null, (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "ghost",
                          size: "icon",
                          className: "h-8 w-8",
                          "aria-label": `X\xf3a project ${e.name}`,
                          onClick: () => void ts(e),
                          children: (0, t.jsx)(p.Trash2, {
                            className: "h-4 w-4"
                          })
                        })]
                      })
                    })]
                  }), s ? e1.map(e => {
                    let i = (0, _.resolveSeriesBatchItemVideo)(e, K),
                      s = i ? [...eY].reverse().find(e => e.videoId === i.id) : void 0,
                      n = i && s ? [...O].reverse().find(e => e.videoId === i.id && ("processing" === e.status || "pending" === e.status)) : void 0,
                      r = s ? Math.max(s.progress, n?.progress ?? s.progress) : 0,
                      l = s ? en(s.status, r) : null,
                      c = s && ("failed" === s.status || "interrupted" === s.status) ? (0, ea.getProcessingErrorDisplay)(s.errorMessage) : null,
                      u = i ? (0, $.getHistoryOutputState)(i) : null,
                      w = (0, _.seriesBatchHistoryStatusPresentation)(e, u),
                      j = !!(i && ((0, $.hasHistoryResult)(i) || eZ.has(i.id))),
                      y = (0, _.seriesBatchChildRemovalTarget)(i),
                      S = !!(i && ("srt_audio" === i.projectType || (0, ei.canHydrateNleProject)(i))),
                      k = !!(i && u?.kind === "final" && u.path && "srt_audio" !== i.projectType),
                      B = s?.status === "failed",
                      C = !!(s && ("waiting" === s.status || "paused" === s.status || "failed" === s.status || "interrupted" === s.status || "settlement_pending" === s.status)),
                      T = V(e, K),
                      M = (0, _.seriesBatchStampsNeedSync)(e.appliedStampFingerprint, e4);
                    return (0, t.jsxs)("div", {
                      "data-history-batch-child": !0,
                      "data-history-batch-stamp-state": e.appliedStampFingerprint ? M ? "stale" : "applied" : "pending",
                      className: (0, A.cn)("group relative grid items-center gap-3 bg-muted/20 py-2.5 pr-4 pl-28 transition-colors", eo, j && S ? "hover:bg-muted/40" : null),
                      children: [j && i && S && u ? (0, t.jsx)("button", {
                        type: "button",
                        "data-history-batch-child-open": !0,
                        "aria-label": "srt_audio" === i.projectType ? u.actionLabel : `Mở ${e.name} trong Editor`,
                        disabled: null !== eV,
                        onClick: () => void to(i, u),
                        className: "absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset disabled:cursor-wait"
                      }) : null, (0, t.jsxs)("div", {
                        className: "flex min-w-0 items-center gap-3",
                        children: [(0, t.jsx)("div", {
                          className: "flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                          "data-history-batch-child-thumb": !0,
                          children: T ? (0, t.jsx)(a.default, {
                            src: (0, N.resolveMediaSrc)(T),
                            alt: e.name,
                            width: 128,
                            height: 72,
                            className: "h-full w-full object-cover",
                            unoptimized: !0
                          }) : (0, t.jsx)(o.Film, {
                            className: "h-3.5 w-3.5 text-muted-foreground"
                          })
                        }), (0, t.jsx)("div", {
                          className: "min-w-0 flex-1",
                          children: (0, t.jsx)("p", {
                            className: "truncate text-xs font-medium",
                            title: e.name,
                            children: e.name
                          })
                        })]
                      }), (0, t.jsx)("div", {
                        className: "min-w-0",
                        children: s && l ? (0, t.jsxs)("div", {
                          "data-history-batch-child-progress": !0,
                          className: "w-full min-w-0",
                          children: [(0, t.jsxs)("div", {
                            className: "mb-1 flex min-w-0 items-center gap-2 text-[10px] text-muted-foreground",
                            children: [(0, t.jsx)(f.Badge, {
                              variant: (0, es.queueItemStatusVariant)(s.status),
                              className: "max-w-[10rem] shrink-0 truncate text-[10px]",
                              title: c?.detail ?? es.QUEUE_ITEM_STATUS_LABELS[s.status],
                              children: c?.badgeLabel ?? es.QUEUE_ITEM_STATUS_LABELS[s.status]
                            }), (0, t.jsx)("span", {
                              className: "shrink-0 font-mono text-primary",
                              children: l.label
                            })]
                          }), (0, t.jsx)(b.Progress, {
                            value: l.value
                          })]
                        }) : (0, t.jsx)(f.Badge, {
                          variant: w.variant,
                          className: "max-w-[12rem] truncate text-[10px]",
                          title: w.detail || w.label,
                          children: w.label
                        })
                      }), (0, t.jsxs)("div", {
                        "data-history-batch-child-actions": !0,
                        className: "relative z-20 flex min-w-0 flex-wrap items-center justify-end gap-1",
                        children: [s && eW?.status === "running" && eW.activeItemId === s.id ? (0, t.jsxs)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          className: "h-8 text-xs",
                          onClick: () => void eM(),
                          children: [(0, t.jsx)(h.Pause, {
                            className: "h-3.5 w-3.5"
                          }), "Tạm dừng"]
                        }) : null, s?.status === "paused" ? (0, t.jsxs)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          className: "h-8 text-xs",
                          onClick: () => void eD(),
                          children: [(0, t.jsx)(m.Play, {
                            className: "h-3.5 w-3.5"
                          }), "Tiếp tục"]
                        }) : null, B && s ? (0, t.jsxs)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          className: "h-8 text-xs",
                          onClick: () => void eI(s.id),
                          children: [(0, t.jsx)(x.RotateCcw, {
                            className: "h-3.5 w-3.5"
                          }), "Thử lại"]
                        }) : null, C && s ? (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "ghost",
                          size: "icon",
                          className: "h-8 w-8",
                          "aria-label": `Bỏ khỏi h\xe0ng đợi ${e.name}`,
                          onClick: () => e_(s.id),
                          children: (0, t.jsx)(g.X, {
                            className: "h-4 w-4"
                          })
                        }) : null, k && i && u ? (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "outline",
                          size: "icon",
                          className: "h-8 w-8",
                          "aria-label": `Hiện file đ\xe3 xuất ${e.name}`,
                          onClick: () => void tl(i, u),
                          children: (0, t.jsx)(d.FolderOpen, {
                            className: "h-3.5 w-3.5"
                          })
                        }) : null, j && i && (u?.kind === "error" || c) ? (0, t.jsx)(H.ErrorSupportLogButton, {
                          videoId: i.id,
                          videoName: i.name,
                          compact: !0
                        }) : null, "project" === y && i ? (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "ghost",
                          size: "icon",
                          className: "h-8 w-8",
                          "aria-label": `X\xf3a project ${e.name}`,
                          onClick: () => void ts(i),
                          children: (0, t.jsx)(p.Trash2, {
                            className: "h-4 w-4"
                          })
                        }) : (0, t.jsx)(v.Button, {
                          type: "button",
                          variant: "ghost",
                          size: "icon",
                          className: "h-8 w-8",
                          "aria-label": `X\xf3a khỏi l\xf4 ${e.name}`,
                          onClick: () => ex([e.path]),
                          children: (0, t.jsx)(p.Trash2, {
                            className: "h-4 w-4"
                          })
                        })]
                      })]
                    }, e.path)
                  }) : null]
                }, e.id)
              })
            }) : (0, t.jsxs)("div", {
              className: "flex min-h-52 flex-col items-center justify-center px-4 py-8 text-center",
              children: [(0, t.jsx)("div", {
                className: "mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-muted-foreground",
                children: (0, t.jsx)(o.Film, {
                  className: "h-5 w-5"
                })
              }), (0, t.jsx)("p", {
                className: "text-sm font-semibold",
                children: "Chưa có video nào"
              }), (0, t.jsx)("p", {
                className: "mt-1 max-w-sm text-xs leading-5 text-muted-foreground",
                children: "Video đã thêm sẽ xuất hiện ở đây."
              }), (0, t.jsx)(v.Button, {
                className: "mt-4",
                size: "sm",
                onClick: () => e("dashboard"),
                children: "Về trang chủ"
              })]
            })]
          })
        })
      }), (0, t.jsx)(et, {}), (0, t.jsx)(j.Dialog, {
        open: !!e7,
        onOpenChange: e => {
          e || eL || ta()
        },
        children: (0, t.jsxs)(j.DialogContent, {
          className: "w-[calc(100vw-1.5rem)] max-w-md overflow-hidden",
          onKeyDown: e => {
            "Enter" !== e.key || (e.preventDefault(), e.stopPropagation(), eL || eK || eQ || !e7 || te || "requires_disposition" !== e9 && tn())
          },
          children: [(0, t.jsxs)(j.DialogHeader, {
            className: "min-w-0",
            children: [(0, t.jsx)(j.DialogTitle, {
              children: te ? "Job đã dừng xử lý" : "Xóa project khỏi lịch sử?"
            }), (0, t.jsx)(j.DialogDescription, {
              className: "break-words",
              children: null !== eq ? "Project đang được xuất video. Hãy hủy xuất, chờ tác vụ dừng hoàn toàn rồi bấm xóa lại." : eK ? "Đang kiểm tra trạng thái phút của job trước khi cho phép xóa." : eQ ? "Không kiểm tra được trạng thái phút. Project vẫn được giữ nguyên để bạn thử lại." : tt ? "Hệ thống chưa thể xác định tự động số phút còn chịu trách nhiệm. Nếu xóa, job sẽ dừng và DichVideo không cam kết hoàn phút; hãy liên hệ hỗ trợ nếu cần đối soát." : te && ti ? `Job chưa tạo được video ho\xe0n chỉnh v\xe0 c\xf2n ${ti} chưa được b\xf9. Nếu x\xf3a, ${ti} kh\xf4ng được ho\xe0n.` : "App sẽ xóa project này khỏi lịch sử, các tiến trình liên quan và dữ liệu project do DichVideo tạo. Video gốc và file bạn đã tải xuống sẽ được giữ nguyên."
            })]
          }), eK ? (0, t.jsxs)("div", {
            className: "flex min-h-16 items-center gap-3 border-y border-border py-3 text-sm text-muted-foreground",
            children: [(0, t.jsx)(u.Loader2, {
              className: "h-4 w-4 shrink-0 animate-spin"
            }), "Đang đối chiếu trạng thái job"]
          }) : te ? (0, t.jsxs)("div", {
            className: "flex items-start gap-3 border-y border-destructive/30 py-3 text-sm leading-6",
            children: [(0, t.jsx)(s.AlertTriangle, {
              className: "mt-0.5 h-4 w-4 shrink-0 text-destructive"
            }), (0, t.jsx)("p", {
              children: "Xóa là hành động cuối cùng: dữ liệu xử lý bị dừng, còn video gốc và file đã tải xuống vẫn được giữ."
            })]
          }) : null, e7 ? (0, t.jsxs)("div", {
            className: "min-w-0 overflow-hidden rounded-md border border-border bg-muted/30 p-3",
            children: [(0, t.jsx)("p", {
              className: "break-words text-sm font-medium",
              children: e7.name
            }), (0, t.jsxs)("p", {
              className: "mt-1 break-all text-xs text-muted-foreground",
              children: ["srt_audio" === e7.projectType ? "Nguồn SRT" : "Video gốc", ": ", e7.path]
            })]
          }) : null, (0, t.jsxs)(j.DialogFooter, {
            className: "flex-row items-center justify-between gap-3 sm:justify-between sm:space-x-0",
            children: [(0, t.jsx)("p", {
              "data-delete-shortcut-hint": !0,
              className: "min-w-0 text-xs text-muted-foreground",
              children: te ? "Dùng nút xóa nếu bạn muốn bỏ project này." : "Nhấn Enter để xóa nhanh."
            }), (0, t.jsxs)("div", {
              className: "flex shrink-0 flex-wrap items-center justify-end gap-2",
              children: [(0, t.jsx)(v.Button, {
                type: "button",
                variant: "outline",
                onClick: ta,
                disabled: eL,
                children: "Hủy"
              }), eQ && e7 ? (0, t.jsx)(v.Button, {
                type: "button",
                onClick: () => void ts(e7),
                children: "Thử lại"
              }) : (0, t.jsxs)(t.Fragment, {
                children: [eq ? (0, t.jsxs)(v.Button, {
                  type: "button",
                  onClick: () => void tu(),
                  disabled: eU,
                  children: [eU ? (0, t.jsx)(u.Loader2, {
                    className: "h-4 w-4 animate-spin"
                  }) : null, "Hủy xuất"]
                }) : null, (0, t.jsxs)(v.Button, {
                  type: "button",
                  variant: "destructive",
                  onClick: tn,
                  disabled: eL || eU || null !== eq || eK || !!eQ || "requires_disposition" === e9,
                  children: [eK ? (0, t.jsx)(u.Loader2, {
                    className: "h-4 w-4 animate-spin"
                  }) : (0, t.jsx)(p.Trash2, {
                    className: "h-4 w-4"
                  }), eL ? "Đang xóa..." : te ? "Vẫn xóa project" : "Xóa project"]
                })]
              })]
            })]
          })]
        })
      })]
    })
  }], 84635)
}]);