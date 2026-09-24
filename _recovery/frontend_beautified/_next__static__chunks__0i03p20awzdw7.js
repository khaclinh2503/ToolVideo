(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 32781, e => {
  "use strict";
  var t = e.i(58379);
  e.s(["Loader2", () => t.default])
}, 87486, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(25913),
    a = e.i(86011),
    i = e.i(75157);
  let s = (0, r.cva)("group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!", {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        "primary-soft": "border-primary/20 bg-primary/10 text-primary [a]:hover:bg-primary/20",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 [a]:hover:bg-emerald-500/20",
        warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 [a]:hover:bg-yellow-500/20",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-600 [a]:hover:bg-blue-500/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  });
  e.s(["Badge", 0, function({
    className: e,
    variant: r = "default",
    asChild: n = !1,
    ...o
  }) {
    let l = n ? a.Slot.Root : "span";
    return (0, t.jsx)(l, {
      "data-slot": "badge",
      "data-variant": r,
      className: (0, i.cn)(s({
        variant: r
      }), e),
      ...o
    })
  }])
}, 77572, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(25913),
    a = e.i(71645),
    i = e.i(81140),
    s = e.i(30030),
    n = e.i(75830),
    o = e.i(20783),
    l = e.i(10772),
    c = e.i(48425),
    d = e.i(30207),
    u = e.i(69340),
    h = e.i(86318),
    p = "rovingFocusGroup.onEntryFocus",
    f = {
      bubbles: !1,
      cancelable: !0
    },
    g = "RovingFocusGroup",
    [v, m, x] = (0, n.createCollection)(g),
    [b, y] = (0, s.createContextScope)(g, [x]),
    [k, w] = b(g),
    C = a.forwardRef((e, r) => (0, t.jsx)(v.Provider, {
      scope: e.__scopeRovingFocusGroup,
      children: (0, t.jsx)(v.Slot, {
        scope: e.__scopeRovingFocusGroup,
        children: (0, t.jsx)(j, {
          ...e,
          ref: r
        })
      })
    }));
  C.displayName = g;
  var j = a.forwardRef((e, r) => {
      let {
        __scopeRovingFocusGroup: s,
        orientation: n,
        loop: l = !1,
        dir: v,
        currentTabStopId: x,
        defaultCurrentTabStopId: b,
        onCurrentTabStopIdChange: y,
        onEntryFocus: w,
        preventScrollOnEntryFocus: C = !1,
        ...j
      } = e, N = a.useRef(null), T = (0, o.useComposedRefs)(r, N), R = (0, h.useDirection)(v), [E, I] = (0, u.useControllableState)({
        prop: x,
        defaultProp: b ?? null,
        onChange: y,
        caller: g
      }), [V, A] = a.useState(!1), M = (0, d.useCallbackRef)(w), z = m(s), D = a.useRef(!1), [O, F] = a.useState(0);
      return a.useEffect(() => {
        let e = N.current;
        if (e) return e.addEventListener(p, M), () => e.removeEventListener(p, M)
      }, [M]), (0, t.jsx)(k, {
        scope: s,
        orientation: n,
        dir: R,
        loop: l,
        currentTabStopId: E,
        onItemFocus: a.useCallback(e => I(e), [I]),
        onItemShiftTab: a.useCallback(() => A(!0), []),
        onFocusableItemAdd: a.useCallback(() => F(e => e + 1), []),
        onFocusableItemRemove: a.useCallback(() => F(e => e - 1), []),
        children: (0, t.jsx)(c.Primitive.div, {
          tabIndex: V || 0 === O ? -1 : 0,
          "data-orientation": n,
          ...j,
          ref: T,
          style: {
            outline: "none",
            ...e.style
          },
          onMouseDown: (0, i.composeEventHandlers)(e.onMouseDown, () => {
            D.current = !0
          }),
          onFocus: (0, i.composeEventHandlers)(e.onFocus, e => {
            let t = !D.current;
            if (e.target === e.currentTarget && t && !V) {
              let t = new CustomEvent(p, f);
              if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
                let e = z().filter(e => e.focusable);
                S([e.find(e => e.active), e.find(e => e.id === E), ...e].filter(Boolean).map(e => e.ref.current), C)
              }
            }
            D.current = !1
          }),
          onBlur: (0, i.composeEventHandlers)(e.onBlur, () => A(!1))
        })
      })
    }),
    N = "RovingFocusGroupItem",
    T = a.forwardRef((e, r) => {
      let {
        __scopeRovingFocusGroup: s,
        focusable: n = !0,
        active: o = !1,
        tabStopId: d,
        children: u,
        ...h
      } = e, p = (0, l.useId)(), f = d || p, g = w(N, s), x = g.currentTabStopId === f, b = m(s), {
        onFocusableItemAdd: y,
        onFocusableItemRemove: k,
        currentTabStopId: C
      } = g;
      return a.useEffect(() => {
        if (n) return y(), () => k()
      }, [n, y, k]), (0, t.jsx)(v.ItemSlot, {
        scope: s,
        id: f,
        focusable: n,
        active: o,
        children: (0, t.jsx)(c.Primitive.span, {
          tabIndex: x ? 0 : -1,
          "data-orientation": g.orientation,
          ...h,
          ref: r,
          onMouseDown: (0, i.composeEventHandlers)(e.onMouseDown, e => {
            n ? g.onItemFocus(f) : e.preventDefault()
          }),
          onFocus: (0, i.composeEventHandlers)(e.onFocus, () => g.onItemFocus(f)),
          onKeyDown: (0, i.composeEventHandlers)(e.onKeyDown, e => {
            if ("Tab" === e.key && e.shiftKey) return void g.onItemShiftTab();
            if (e.target !== e.currentTarget) return;
            let t = function(e, t, r) {
              var a;
              let i = (a = e.key, "rtl" !== r ? a : "ArrowLeft" === a ? "ArrowRight" : "ArrowRight" === a ? "ArrowLeft" : a);
              if (!("vertical" === t && ["ArrowLeft", "ArrowRight"].includes(i)) && !("horizontal" === t && ["ArrowUp", "ArrowDown"].includes(i))) return R[i]
            }(e, g.orientation, g.dir);
            if (void 0 !== t) {
              if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
              e.preventDefault();
              let i = b().filter(e => e.focusable).map(e => e.ref.current);
              if ("last" === t) i.reverse();
              else if ("prev" === t || "next" === t) {
                var r, a;
                "prev" === t && i.reverse();
                let s = i.indexOf(e.currentTarget);
                i = g.loop ? (r = i, a = s + 1, r.map((e, t) => r[(a + t) % r.length])) : i.slice(s + 1)
              }
              setTimeout(() => S(i))
            }
          }),
          children: "function" == typeof u ? u({
            isCurrentTabStop: x,
            hasTabStop: null != C
          }) : u
        })
      })
    });
  T.displayName = N;
  var R = {
    ArrowLeft: "prev",
    ArrowUp: "prev",
    ArrowRight: "next",
    ArrowDown: "next",
    PageUp: "first",
    Home: "first",
    PageDown: "last",
    End: "last"
  };

  function S(e, t = !1) {
    let r = document.activeElement;
    for (let a of e)
      if (a === r || (a.focus({
          preventScroll: t
        }), document.activeElement !== r)) return
  }
  var E = e.i(96626),
    I = "Tabs",
    [V, A] = (0, s.createContextScope)(I, [y]),
    M = y(),
    [z, D] = V(I),
    O = a.forwardRef((e, r) => {
      let {
        __scopeTabs: a,
        value: i,
        onValueChange: s,
        defaultValue: n,
        orientation: o = "horizontal",
        dir: d,
        activationMode: p = "automatic",
        ...f
      } = e, g = (0, h.useDirection)(d), [v, m] = (0, u.useControllableState)({
        prop: i,
        onChange: s,
        defaultProp: n ?? "",
        caller: I
      });
      return (0, t.jsx)(z, {
        scope: a,
        baseId: (0, l.useId)(),
        value: v,
        onValueChange: m,
        orientation: o,
        dir: g,
        activationMode: p,
        children: (0, t.jsx)(c.Primitive.div, {
          dir: g,
          "data-orientation": o,
          ...f,
          ref: r
        })
      })
    });
  O.displayName = I;
  var F = "TabsList",
    L = a.forwardRef((e, r) => {
      let {
        __scopeTabs: a,
        loop: i = !0,
        ...s
      } = e, n = D(F, a), o = M(a);
      return (0, t.jsx)(C, {
        asChild: !0,
        ...o,
        orientation: n.orientation,
        dir: n.dir,
        loop: i,
        children: (0, t.jsx)(c.Primitive.div, {
          role: "tablist",
          "aria-orientation": n.orientation,
          ...s,
          ref: r
        })
      })
    });
  L.displayName = F;
  var P = "TabsTrigger",
    K = a.forwardRef((e, r) => {
      let {
        __scopeTabs: a,
        value: s,
        disabled: n = !1,
        ...o
      } = e, l = D(P, a), d = M(a), u = B(l.baseId, s), h = G(l.baseId, s), p = s === l.value;
      return (0, t.jsx)(T, {
        asChild: !0,
        ...d,
        focusable: !n,
        active: p,
        children: (0, t.jsx)(c.Primitive.button, {
          type: "button",
          role: "tab",
          "aria-selected": p,
          "aria-controls": h,
          "data-state": p ? "active" : "inactive",
          "data-disabled": n ? "" : void 0,
          disabled: n,
          id: u,
          ...o,
          ref: r,
          onMouseDown: (0, i.composeEventHandlers)(e.onMouseDown, e => {
            n || 0 !== e.button || !1 !== e.ctrlKey ? e.preventDefault() : l.onValueChange(s)
          }),
          onKeyDown: (0, i.composeEventHandlers)(e.onKeyDown, e => {
            [" ", "Enter"].includes(e.key) && l.onValueChange(s)
          }),
          onFocus: (0, i.composeEventHandlers)(e.onFocus, () => {
            let e = "manual" !== l.activationMode;
            p || n || !e || l.onValueChange(s)
          })
        })
      })
    });
  K.displayName = P;
  var _ = "TabsContent",
    H = a.forwardRef((e, r) => {
      let {
        __scopeTabs: i,
        value: s,
        forceMount: n,
        children: o,
        ...l
      } = e, d = D(_, i), u = B(d.baseId, s), h = G(d.baseId, s), p = s === d.value, f = a.useRef(p);
      return a.useEffect(() => {
        let e = requestAnimationFrame(() => f.current = !1);
        return () => cancelAnimationFrame(e)
      }, []), (0, t.jsx)(E.Presence, {
        present: n || p,
        children: ({
          present: a
        }) => (0, t.jsx)(c.Primitive.div, {
          "data-state": p ? "active" : "inactive",
          "data-orientation": d.orientation,
          role: "tabpanel",
          "aria-labelledby": u,
          hidden: !a,
          id: h,
          tabIndex: 0,
          ...l,
          ref: r,
          style: {
            ...e.style,
            animationDuration: f.current ? "0s" : void 0
          },
          children: a && o
        })
      })
    });

  function B(e, t) {
    return `${e}-trigger-${t}`
  }

  function G(e, t) {
    return `${e}-content-${t}`
  }
  H.displayName = _, e.s(["Content", 0, H, "List", 0, L, "Root", 0, O, "Tabs", 0, O, "TabsContent", 0, H, "TabsList", 0, L, "TabsTrigger", 0, K, "Trigger", 0, K, "createTabsScope", 0, A], 26209);
  var U = e.i(26209),
    U = U,
    $ = e.i(75157);
  let J = (0, r.cva)("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none", {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  });
  e.s(["Tabs", 0, function({
    className: e,
    orientation: r = "horizontal",
    ...a
  }) {
    return (0, t.jsx)(U.Root, {
      "data-slot": "tabs",
      "data-orientation": r,
      className: (0, $.cn)("group/tabs flex gap-2 data-horizontal:flex-col", e),
      ...a
    })
  }, "TabsContent", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)(U.Content, {
      "data-slot": "tabs-content",
      className: (0, $.cn)("flex-1 text-sm outline-none", e),
      ...r
    })
  }, "TabsList", 0, function({
    className: e,
    variant: r = "default",
    ...a
  }) {
    return (0, t.jsx)(U.List, {
      "data-slot": "tabs-list",
      "data-variant": r,
      className: (0, $.cn)(J({
        variant: r
      }), e),
      ...a
    })
  }, "TabsTrigger", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)(U.Trigger, {
      "data-slot": "tabs-trigger",
      className: (0, $.cn)("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent", "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100", e),
      ...r
    })
  }], 77572)
}, 86318, e => {
  "use strict";
  var t = e.i(71645);
  e.i(43476);
  var r = t.createContext(void 0);
  e.s(["useDirection", 0, function(e) {
    let a = t.useContext(r);
    return e || a || "ltr"
  }])
}, 73474, e => {
  "use strict";
  let t = (0, e.i(56420).default)("trash-2", [
    ["path", {
      d: "M10 11v6",
      key: "nco0om"
    }],
    ["path", {
      d: "M14 11v6",
      key: "outv1u"
    }],
    ["path", {
      d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
      key: "miytrc"
    }],
    ["path", {
      d: "M3 6h18",
      key: "d0wm0j"
    }],
    ["path", {
      d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
      key: "e791ji"
    }]
  ]);
  e.s(["Trash2", 0, t], 73474)
}, 93479, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(75157);
  e.s(["Input", 0, function({
    className: e,
    type: a,
    ...i
  }) {
    return (0, t.jsx)("input", {
      type: a,
      "data-slot": "input",
      className: (0, r.cn)("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", e),
      ...i
    })
  }])
}, 24687, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    a = e.i(75157);
  let i = r.forwardRef(({
    className: e,
    ...r
  }, i) => (0, t.jsx)("textarea", {
    className: (0, a.cn)("flex min-h-[60px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none", e),
    ref: i,
    ...r
  }));
  i.displayName = "Textarea", e.s(["Textarea", 0, i])
}, 75830, e => {
  "use strict";
  var t = e.i(71645),
    r = e.i(30030),
    a = e.i(20783),
    i = e.i(91918),
    s = e.i(43476),
    n = new WeakMap;

  function o(e, t) {
    var r, a;
    let i, s, n;
    if ("at" in Array.prototype) return Array.prototype.at.call(e, t);
    let o = (r = e, a = t, i = r.length, (n = (s = l(a)) >= 0 ? s : i + s) < 0 || n >= i ? -1 : n);
    return -1 === o ? void 0 : e[o]
  }

  function l(e) {
    return e != e || 0 === e ? 0 : Math.trunc(e)
  }(class e extends Map {
    #e;
    constructor(e) {
      super(e), this.#e = [...super.keys()], n.set(this, !0)
    }
    set(e, t) {
      return n.get(this) && (this.has(e) ? this.#e[this.#e.indexOf(e)] = e : this.#e.push(e)), super.set(e, t), this
    }
    insert(e, t, r) {
      let a, i = this.has(t),
        s = this.#e.length,
        n = l(e),
        o = n >= 0 ? n : s + n,
        c = o < 0 || o >= s ? -1 : o;
      if (c === this.size || i && c === this.size - 1 || -1 === c) return this.set(t, r), this;
      let d = this.size + +!i;
      n < 0 && o++;
      let u = [...this.#e],
        h = !1;
      for (let e = o; e < d; e++)
        if (o === e) {
          let s = u[e];
          u[e] === t && (s = u[e + 1]), i && this.delete(t), a = this.get(s), this.set(t, r)
        } else {
          h || u[e - 1] !== t || (h = !0);
          let r = u[h ? e : e - 1],
            i = a;
          a = this.get(r), this.delete(r), this.set(r, i)
        } return this
    }
    with(t, r, a) {
      let i = new e(this);
      return i.insert(t, r, a), i
    }
    before(e) {
      let t = this.#e.indexOf(e) - 1;
      if (!(t < 0)) return this.entryAt(t)
    }
    setBefore(e, t, r) {
      let a = this.#e.indexOf(e);
      return -1 === a ? this : this.insert(a, t, r)
    }
    after(e) {
      let t = this.#e.indexOf(e);
      if (-1 !== (t = -1 === t || t === this.size - 1 ? -1 : t + 1)) return this.entryAt(t)
    }
    setAfter(e, t, r) {
      let a = this.#e.indexOf(e);
      return -1 === a ? this : this.insert(a + 1, t, r)
    }
    first() {
      return this.entryAt(0)
    }
    last() {
      return this.entryAt(-1)
    }
    clear() {
      return this.#e = [], super.clear()
    }
    delete(e) {
      let t = super.delete(e);
      return t && this.#e.splice(this.#e.indexOf(e), 1), t
    }
    deleteAt(e) {
      let t = this.keyAt(e);
      return void 0 !== t && this.delete(t)
    }
    at(e) {
      let t = o(this.#e, e);
      if (void 0 !== t) return this.get(t)
    }
    entryAt(e) {
      let t = o(this.#e, e);
      if (void 0 !== t) return [t, this.get(t)]
    }
    indexOf(e) {
      return this.#e.indexOf(e)
    }
    keyAt(e) {
      return o(this.#e, e)
    }
    from(e, t) {
      let r = this.indexOf(e);
      if (-1 === r) return;
      let a = r + t;
      return a < 0 && (a = 0), a >= this.size && (a = this.size - 1), this.at(a)
    }
    keyFrom(e, t) {
      let r = this.indexOf(e);
      if (-1 === r) return;
      let a = r + t;
      return a < 0 && (a = 0), a >= this.size && (a = this.size - 1), this.keyAt(a)
    }
    find(e, t) {
      let r = 0;
      for (let a of this) {
        if (Reflect.apply(e, t, [a, r, this])) return a;
        r++
      }
    }
    findIndex(e, t) {
      let r = 0;
      for (let a of this) {
        if (Reflect.apply(e, t, [a, r, this])) return r;
        r++
      }
      return -1
    }
    filter(t, r) {
      let a = [],
        i = 0;
      for (let e of this) Reflect.apply(t, r, [e, i, this]) && a.push(e), i++;
      return new e(a)
    }
    map(t, r) {
      let a = [],
        i = 0;
      for (let e of this) a.push([e[0], Reflect.apply(t, r, [e, i, this])]), i++;
      return new e(a)
    }
    reduce(...e) {
      let [t, r] = e, a = 0, i = r ?? this.at(0);
      for (let r of this) i = 0 === a && 1 === e.length ? r : Reflect.apply(t, this, [i, r, a, this]), a++;
      return i
    }
    reduceRight(...e) {
      let [t, r] = e, a = r ?? this.at(-1);
      for (let r = this.size - 1; r >= 0; r--) {
        let i = this.at(r);
        a = r === this.size - 1 && 1 === e.length ? i : Reflect.apply(t, this, [a, i, r, this])
      }
      return a
    }
    toSorted(t) {
      return new e([...this.entries()].sort(t))
    }
    toReversed() {
      let t = new e;
      for (let e = this.size - 1; e >= 0; e--) {
        let r = this.keyAt(e),
          a = this.get(r);
        t.set(r, a)
      }
      return t
    }
    toSpliced(...t) {
      let r = [...this.entries()];
      return r.splice(...t), new e(r)
    }
    slice(t, r) {
      let a = new e,
        i = this.size - 1;
      if (void 0 === t) return a;
      t < 0 && (t += this.size), void 0 !== r && r > 0 && (i = r - 1);
      for (let e = t; e <= i; e++) {
        let t = this.keyAt(e),
          r = this.get(t);
        a.set(t, r)
      }
      return a
    }
    every(e, t) {
      let r = 0;
      for (let a of this) {
        if (!Reflect.apply(e, t, [a, r, this])) return !1;
        r++
      }
      return !0
    }
    some(e, t) {
      let r = 0;
      for (let a of this) {
        if (Reflect.apply(e, t, [a, r, this])) return !0;
        r++
      }
      return !1
    }
  }), e.s(["createCollection", 0, function(e) {
    let n = e + "CollectionProvider",
      [o, l] = (0, r.createContextScope)(n),
      [c, d] = o(n, {
        collectionRef: {
          current: null
        },
        itemMap: new Map
      }),
      u = e => {
        let {
          scope: r,
          children: a
        } = e, i = t.useRef(null), n = t.useRef(new Map).current;
        return (0, s.jsx)(c, {
          scope: r,
          itemMap: n,
          collectionRef: i,
          children: a
        })
      };
    u.displayName = n;
    let h = e + "CollectionSlot",
      p = (0, i.createSlot)(h),
      f = t.forwardRef((e, t) => {
        let {
          scope: r,
          children: i
        } = e, n = d(h, r), o = (0, a.useComposedRefs)(t, n.collectionRef);
        return (0, s.jsx)(p, {
          ref: o,
          children: i
        })
      });
    f.displayName = h;
    let g = e + "CollectionItemSlot",
      v = "data-radix-collection-item",
      m = (0, i.createSlot)(g),
      x = t.forwardRef((e, r) => {
        let {
          scope: i,
          children: n,
          ...o
        } = e, l = t.useRef(null), c = (0, a.useComposedRefs)(r, l), u = d(g, i);
        return t.useEffect(() => (u.itemMap.set(l, {
          ref: l,
          ...o
        }), () => void u.itemMap.delete(l))), (0, s.jsx)(m, {
          ...{
            [v]: ""
          },
          ref: c,
          children: n
        })
      });
    return x.displayName = g, [{
      Provider: u,
      Slot: f,
      ItemSlot: x
    }, function(r) {
      let a = d(e + "CollectionConsumer", r);
      return t.useCallback(() => {
        let e = a.collectionRef.current;
        if (!e) return [];
        let t = Array.from(e.querySelectorAll(`[${v}]`));
        return Array.from(a.itemMap.values()).sort((e, r) => t.indexOf(e.ref.current) - t.indexOf(r.ref.current))
      }, [a.collectionRef, a.itemMap])
    }, l]
  }])
}, 97923, e => {
  "use strict";
  let t = (0, e.i(56420).default)("log-in", [
    ["path", {
      d: "m10 17 5-5-5-5",
      key: "1bsop3"
    }],
    ["path", {
      d: "M15 12H3",
      key: "6jk70r"
    }],
    ["path", {
      d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",
      key: "u53s6r"
    }]
  ]);
  e.s(["LogIn", 0, t], 97923)
}, 59727, 15745, 71609, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645);
  let a = (0, e.i(56420).default)("clipboard-paste", [
    ["path", {
      d: "M11 14h10",
      key: "1w8e9d"
    }],
    ["path", {
      d: "M16 4h2a2 2 0 0 1 2 2v1.344",
      key: "1e62lh"
    }],
    ["path", {
      d: "m17 18 4-4-4-4",
      key: "z2g111"
    }],
    ["path", {
      d: "M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113",
      key: "bjbb7m"
    }],
    ["rect", {
      x: "8",
      y: "2",
      width: "8",
      height: "4",
      rx: "1",
      key: "ublpy"
    }]
  ]);
  e.s(["ClipboardPaste", 0, a], 15745);
  var i = e.i(32781),
    s = e.i(97923),
    n = e.i(73474),
    o = e.i(87486),
    l = e.i(19455),
    c = e.i(93479),
    d = e.i(77572),
    u = e.i(24687);
  e.i(89268);
  var h = e.i(62281),
    p = e.i(17569),
    f = e.i(78238),
    g = e.i(68834),
    v = e.i(81341);
  let m = (0, g.create)(e => ({
    status: null,
    setStatus: t => e({
      status: t
    }),
    refresh: async () => {
      if (!(0, v.isTauri)()) return null;
      try {
        let t = await (0, h.getViralVoiceCapCutStatus)();
        return e({
          status: t
        }), t
      } catch {
        return null
      }
    }
  }));
  e.s(["useViralVoiceStore", 0, m], 71609);
  var x = e.i(68527);
  e.s(["CapCutLoginFields", 0, function({
    onConnected: e
  }) {
    let g = m(e => e.status),
      v = m(e => e.setStatus),
      [b, y] = (0, r.useState)("password"),
      [k, w] = (0, r.useState)(""),
      [C, j] = (0, r.useState)(""),
      [N, T] = (0, r.useState)(""),
      [R, S] = (0, r.useState)(!1),
      [E, I] = (0, r.useState)(!1),
      [V, A] = (0, r.useState)(!1),
      [M, z] = (0, r.useState)(!1),
      [D, O] = (0, r.useState)(!1),
      [F, L] = (0, r.useState)(null),
      P = g?.connected === !0 || g?.configured === !0,
      K = (0, r.useCallback)(async (e = !1) => {
        S(!0);
        try {
          let t = await (0, h.getViralVoiceCapCutStatus)();
          v(t), e && L({
            tone: t.connected ? "success" : "error",
            message: t.connected ? "Kết nối thành công." : "Chưa đăng nhập cho Giọng cao cấp."
          })
        } catch (e) {
          L({
            tone: "error",
            message: (0, f.viralVoiceErrorText)(e)
          })
        } finally {
          S(!1)
        }
      }, [v]);
    (0, r.useEffect)(() => {
      K()
    }, [K]);
    let _ = async () => {
      L(null), I(!0);
      try {
        await (0, x.checkPremiumVoiceSynthesisReadiness)({
          surface: "settings",
          voice: x.PREMIUM_VOICE_SETTINGS_CHECK_VOICE_ID
        });
        let e = await (0, h.getViralVoiceCapCutStatus)();
        v(e), L({
          tone: "success",
          message: "Kiểm tra giọng thành công. Có thể xử lý bằng Giọng cao cấp."
        })
      } catch (e) {
        L({
          tone: "error",
          message: (0, f.viralVoiceErrorText)(e)
        })
      } finally {
        I(!1)
      }
    }, H = async () => {
      if (L(null), !k.trim() || !C) return void L({
        tone: "error",
        message: "Nhập email và mật khẩu trước khi đăng nhập."
      });
      A(!0);
      try {
        let t = await (0, h.loginViralVoiceCapCut)({
          email: k.trim(),
          password: C,
          locale: "vi-VN",
          region: "VN"
        });
        j(""), v(t), O(!1), L({
          tone: "success",
          message: "Đăng nhập thành công. Kết nối thành công."
        }), t.connected && e?.()
      } catch (e) {
        L({
          tone: "error",
          message: (0, f.viralVoiceErrorText)(e)
        })
      } finally {
        A(!1)
      }
    }, B = async () => {
      if (L(null), !N.trim()) return void L({
        tone: "error",
        message: "Dán JSON cookie trước khi nhập cookie."
      });
      z(!0);
      try {
        let t = await (0, h.importViralVoiceCapCutCookies)({
          cookiesJson: N.trim(),
          locale: "vi-VN",
          region: "VN"
        });
        T(""), v(t), O(!1), L({
          tone: "success",
          message: "Cookie hợp lệ. Kết nối thành công."
        }), t.connected && e?.()
      } catch (e) {
        L({
          tone: "error",
          message: (0, f.viralVoiceErrorText)(e)
        })
      } finally {
        z(!1)
      }
    }, G = async () => {
      L(null);
      try {
        let e = await (0, h.deleteViralVoiceCapCutSession)();
        v(e), O(!0), L({
          tone: "success",
          message: "Đã xóa phiên Giọng cao cấp trên máy này."
        })
      } catch (e) {
        L({
          tone: "error",
          message: (0, f.viralVoiceErrorText)(e)
        })
      }
    };
    return (0, t.jsxs)("div", {
      className: "space-y-2.5",
      "data-provider-setup": "cc",
      children: [(0, t.jsxs)("div", {
        className: "flex flex-wrap items-center justify-between gap-2",
        children: [(0, t.jsx)("p", {
          className: "text-[11px] font-semibold text-foreground",
          children: "Đăng nhập Giọng CC"
        }), (0, t.jsx)(o.Badge, {
          variant: P ? "success" : "outline",
          className: "h-5 shrink-0 px-2 text-[10px]",
          children: P ? "Đã cấu hình" : "Chưa đăng nhập"
        })]
      }), (0, t.jsx)("p", {
        className: "text-[10px] leading-4 text-muted-foreground",
        children: p.PREMIUM_VOICE_LOGIN_GUIDANCE
      }), P && !D ? null : (0, t.jsxs)(d.Tabs, {
        value: b,
        onValueChange: e => y("cookie" === e ? "cookie" : "password"),
        children: [(0, t.jsxs)(d.TabsList, {
          className: "grid h-8 w-full grid-cols-2",
          children: [(0, t.jsx)(d.TabsTrigger, {
            value: "password",
            className: "h-6 text-xs",
            children: "Email"
          }), (0, t.jsx)(d.TabsTrigger, {
            value: "cookie",
            className: "h-6 text-xs",
            children: "Nhập cookie"
          })]
        }), (0, t.jsxs)(d.TabsContent, {
          value: "password",
          className: "mt-2 space-y-2",
          children: [(0, t.jsxs)("div", {
            className: "grid gap-2 sm:grid-cols-[1fr_1fr_auto]",
            children: [(0, t.jsx)(c.Input, {
              value: k,
              onChange: e => w(e.target.value),
              placeholder: "Email đăng nhập",
              autoComplete: "username",
              className: "h-9 text-xs"
            }), (0, t.jsx)(c.Input, {
              value: C,
              onChange: e => j(e.target.value),
              placeholder: "Mật khẩu",
              type: "password",
              autoComplete: "current-password",
              className: "h-9 text-xs"
            }), (0, t.jsxs)(l.Button, {
              type: "button",
              size: "sm",
              className: "h-9 text-xs",
              onClick: () => void H(),
              disabled: V,
              children: [V ? (0, t.jsx)(i.Loader2, {
                className: "h-3.5 w-3.5 animate-spin"
              }) : (0, t.jsx)(s.LogIn, {
                className: "h-3.5 w-3.5"
              }), "Đăng nhập"]
            })]
          }), (0, t.jsx)("p", {
            className: "text-[10px] leading-4 text-muted-foreground",
            children: "Nếu tài khoản báo bị chặn hoặc lỗi bảo mật, hãy Đổi tài khoản khác rồi đăng nhập lại."
          })]
        }), (0, t.jsxs)(d.TabsContent, {
          value: "cookie",
          className: "mt-2 space-y-2",
          children: [(0, t.jsxs)("div", {
            className: "space-y-1 text-[10px] leading-4 text-muted-foreground",
            children: [(0, t.jsx)("p", {
              className: "font-medium text-foreground",
              children: "Cách lấy cookie"
            }), (0, t.jsxs)("ol", {
              className: "list-decimal space-y-1 pl-4",
              children: [(0, t.jsx)("li", {
                children: "Mở CC trên Chrome hoặc Edge và đăng nhập tài khoản CC."
              }), (0, t.jsx)("li", {
                children: "Mở tiện ích Edit This Cookie hoặc tiện ích export cookie tương tự."
              }), (0, t.jsx)("li", {
                children: "Chọn CC, sau đó bấm Export JSON."
              }), (0, t.jsx)("li", {
                children: "Dán toàn bộ JSON vào ô bên dưới rồi bấm Nhập cookie."
              }), (0, t.jsx)("li", {
                children: "Nếu vẫn bị từ chối, đăng xuất rồi đăng nhập lại CC hoặc Đổi tài khoản khác."
              })]
            })]
          }), (0, t.jsx)(u.Textarea, {
            value: N,
            onChange: e => T(e.target.value),
            placeholder: "Dán JSON cookie đã export từ trình duyệt",
            spellCheck: !1,
            className: "h-28 min-h-28 resize-none font-mono text-[11px]"
          }), (0, t.jsxs)("div", {
            className: "flex flex-wrap items-center justify-between gap-2",
            children: [(0, t.jsx)("p", {
              className: "min-w-0 text-[10px] leading-4 text-muted-foreground",
              children: "Nếu cookie bị từ chối, mở tài khoản trên trình duyệt hoặc Đổi tài khoản khác."
            }), (0, t.jsxs)(l.Button, {
              type: "button",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => void B(),
              disabled: M,
              children: [M ? (0, t.jsx)(i.Loader2, {
                className: "h-3.5 w-3.5 animate-spin"
              }) : (0, t.jsx)(a, {
                className: "h-3.5 w-3.5"
              }), "Nhập cookie"]
            })]
          })]
        })]
      }), (0, t.jsx)("div", {
        className: "rounded-lg border border-border bg-background/60 p-2.5",
        children: (0, t.jsxs)("div", {
          className: "flex flex-wrap items-center justify-between gap-2",
          children: [(0, t.jsxs)("div", {
            className: "min-w-0",
            children: [(0, t.jsx)("p", {
              className: "text-xs font-medium",
              children: g?.accountLabel ?? "Chưa có phiên đăng nhập"
            }), (0, t.jsx)("p", {
              className: "truncate text-[10px] text-muted-foreground",
              children: g?.message ?? "Đang kiểm tra..."
            })]
          }), (0, t.jsxs)("div", {
            className: "flex shrink-0 items-center gap-2",
            children: [P && !D ? (0, t.jsx)(l.Button, {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => O(!0),
              children: "Đổi tài khoản"
            }) : null, (0, t.jsxs)(l.Button, {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => void _(),
              disabled: R || E,
              children: [R || E ? (0, t.jsx)(i.Loader2, {
                className: "h-3.5 w-3.5 animate-spin"
              }) : null, "Kiểm tra"]
            }), (0, t.jsxs)(l.Button, {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-8 text-xs",
              onClick: () => void G(),
              children: [(0, t.jsx)(n.Trash2, {
                className: "h-3.5 w-3.5"
              }), "Xóa phiên"]
            })]
          })]
        })
      }), F ? (0, t.jsx)("div", {
        className: `rounded-lg border p-2 text-[10px] ${"success"===F.tone?"border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300":"border-destructive/30 bg-destructive/10 text-destructive"}`,
        children: F.message
      }) : null]
    })
  }], 59727)
}]);