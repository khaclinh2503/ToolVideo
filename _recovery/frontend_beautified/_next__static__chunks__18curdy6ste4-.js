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
}, 32781, e => {
  "use strict";
  var t = e.i(58379);
  e.s(["Loader2", () => t.default])
}, 62368, e => {
  "use strict";
  let t = (0, e.i(56420).default)("download", [
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
  e.s(["Download", 0, t], 62368)
}, 68148, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    a = e.i(30030),
    n = e.i(48425),
    i = "Progress",
    [l, s] = (0, a.createContextScope)(i),
    [o, d] = l(i),
    c = r.forwardRef((e, r) => {
      var a, i;
      let {
        __scopeProgress: l,
        value: s = null,
        max: d,
        getValueLabel: c = f,
        ...u
      } = e;
      (d || 0 === d) && !x(d) && console.error((a = `${d}`, `Invalid prop \`max\` of value \`${a}\` supplied to \`Progress\`. Only numbers greater than 0 are valid max values. Defaulting to \`100\`.`));
      let h = x(d) ? d : 100;
      null === s || g(s, h) || console.error((i = `${s}`, `Invalid prop \`value\` of value \`${i}\` supplied to \`Progress\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or 100 if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`));
      let v = g(s, h) ? s : null,
        b = p(v) ? c(v, h) : void 0;
      return (0, t.jsx)(o, {
        scope: l,
        value: v,
        max: h,
        children: (0, t.jsx)(n.Primitive.div, {
          "aria-valuemax": h,
          "aria-valuemin": 0,
          "aria-valuenow": p(v) ? v : void 0,
          "aria-valuetext": b,
          role: "progressbar",
          "data-state": m(v, h),
          "data-value": v ?? void 0,
          "data-max": h,
          ...u,
          ref: r
        })
      })
    });
  c.displayName = i;
  var u = "ProgressIndicator",
    h = r.forwardRef((e, r) => {
      let {
        __scopeProgress: a,
        ...i
      } = e, l = d(u, a);
      return (0, t.jsx)(n.Primitive.div, {
        "data-state": m(l.value, l.max),
        "data-value": l.value ?? void 0,
        "data-max": l.max,
        ...i,
        ref: r
      })
    });

  function f(e, t) {
    return `${Math.round(e/t*100)}%`
  }

  function m(e, t) {
    return null == e ? "indeterminate" : e === t ? "complete" : "loading"
  }

  function p(e) {
    return "number" == typeof e
  }

  function x(e) {
    return p(e) && !isNaN(e) && e > 0
  }

  function g(e, t) {
    return p(e) && !isNaN(e) && e <= t && e >= 0
  }
  h.displayName = u;
  var v = e.i(75157);
  let b = r.forwardRef(({
    className: e,
    value: r,
    indicatorClassName: a,
    ...n
  }, i) => (0, t.jsx)(c, {
    ref: i,
    className: (0, v.cn)("relative h-2 w-full overflow-hidden rounded-full bg-secondary", e),
    ...n,
    children: (0, t.jsx)(h, {
      className: (0, v.cn)("h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out", a),
      style: {
        transform: `translateX(-${100-(r||0)}%)`
      }
    })
  }));
  b.displayName = c.displayName, e.s(["Progress", 0, b], 68148)
}, 86318, e => {
  "use strict";
  var t = e.i(71645);
  e.i(43476);
  var r = t.createContext(void 0);
  e.s(["useDirection", 0, function(e) {
    let a = t.useContext(r);
    return e || a || "ltr"
  }])
}, 93479, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(75157);
  e.s(["Input", 0, function({
    className: e,
    type: a,
    ...n
  }) {
    return (0, t.jsx)("input", {
      type: a,
      "data-slot": "input",
      className: (0, r.cn)("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", e),
      ...n
    })
  }])
}, 24687, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    a = e.i(75157);
  let n = r.forwardRef(({
    className: e,
    ...r
  }, n) => (0, t.jsx)("textarea", {
    className: (0, a.cn)("flex min-h-[60px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none", e),
    ref: n,
    ...r
  }));
  n.displayName = "Textarea", e.s(["Textarea", 0, n])
}, 75830, e => {
  "use strict";
  var t = e.i(71645),
    r = e.i(30030),
    a = e.i(20783),
    n = e.i(91918),
    i = e.i(43476),
    l = new WeakMap;

  function s(e, t) {
    var r, a;
    let n, i, l;
    if ("at" in Array.prototype) return Array.prototype.at.call(e, t);
    let s = (r = e, a = t, n = r.length, (l = (i = o(a)) >= 0 ? i : n + i) < 0 || l >= n ? -1 : l);
    return -1 === s ? void 0 : e[s]
  }

  function o(e) {
    return e != e || 0 === e ? 0 : Math.trunc(e)
  }(class e extends Map {
    #e;
    constructor(e) {
      super(e), this.#e = [...super.keys()], l.set(this, !0)
    }
    set(e, t) {
      return l.get(this) && (this.has(e) ? this.#e[this.#e.indexOf(e)] = e : this.#e.push(e)), super.set(e, t), this
    }
    insert(e, t, r) {
      let a, n = this.has(t),
        i = this.#e.length,
        l = o(e),
        s = l >= 0 ? l : i + l,
        d = s < 0 || s >= i ? -1 : s;
      if (d === this.size || n && d === this.size - 1 || -1 === d) return this.set(t, r), this;
      let c = this.size + +!n;
      l < 0 && s++;
      let u = [...this.#e],
        h = !1;
      for (let e = s; e < c; e++)
        if (s === e) {
          let i = u[e];
          u[e] === t && (i = u[e + 1]), n && this.delete(t), a = this.get(i), this.set(t, r)
        } else {
          h || u[e - 1] !== t || (h = !0);
          let r = u[h ? e : e - 1],
            n = a;
          a = this.get(r), this.delete(r), this.set(r, n)
        } return this
    }
    with(t, r, a) {
      let n = new e(this);
      return n.insert(t, r, a), n
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
      let t = s(this.#e, e);
      if (void 0 !== t) return this.get(t)
    }
    entryAt(e) {
      let t = s(this.#e, e);
      if (void 0 !== t) return [t, this.get(t)]
    }
    indexOf(e) {
      return this.#e.indexOf(e)
    }
    keyAt(e) {
      return s(this.#e, e)
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
        n = 0;
      for (let e of this) Reflect.apply(t, r, [e, n, this]) && a.push(e), n++;
      return new e(a)
    }
    map(t, r) {
      let a = [],
        n = 0;
      for (let e of this) a.push([e[0], Reflect.apply(t, r, [e, n, this])]), n++;
      return new e(a)
    }
    reduce(...e) {
      let [t, r] = e, a = 0, n = r ?? this.at(0);
      for (let r of this) n = 0 === a && 1 === e.length ? r : Reflect.apply(t, this, [n, r, a, this]), a++;
      return n
    }
    reduceRight(...e) {
      let [t, r] = e, a = r ?? this.at(-1);
      for (let r = this.size - 1; r >= 0; r--) {
        let n = this.at(r);
        a = r === this.size - 1 && 1 === e.length ? n : Reflect.apply(t, this, [a, n, r, this])
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
        n = this.size - 1;
      if (void 0 === t) return a;
      t < 0 && (t += this.size), void 0 !== r && r > 0 && (n = r - 1);
      for (let e = t; e <= n; e++) {
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
    let l = e + "CollectionProvider",
      [s, o] = (0, r.createContextScope)(l),
      [d, c] = s(l, {
        collectionRef: {
          current: null
        },
        itemMap: new Map
      }),
      u = e => {
        let {
          scope: r,
          children: a
        } = e, n = t.useRef(null), l = t.useRef(new Map).current;
        return (0, i.jsx)(d, {
          scope: r,
          itemMap: l,
          collectionRef: n,
          children: a
        })
      };
    u.displayName = l;
    let h = e + "CollectionSlot",
      f = (0, n.createSlot)(h),
      m = t.forwardRef((e, t) => {
        let {
          scope: r,
          children: n
        } = e, l = c(h, r), s = (0, a.useComposedRefs)(t, l.collectionRef);
        return (0, i.jsx)(f, {
          ref: s,
          children: n
        })
      });
    m.displayName = h;
    let p = e + "CollectionItemSlot",
      x = "data-radix-collection-item",
      g = (0, n.createSlot)(p),
      v = t.forwardRef((e, r) => {
        let {
          scope: n,
          children: l,
          ...s
        } = e, o = t.useRef(null), d = (0, a.useComposedRefs)(r, o), u = c(p, n);
        return t.useEffect(() => (u.itemMap.set(o, {
          ref: o,
          ...s
        }), () => void u.itemMap.delete(o))), (0, i.jsx)(g, {
          ...{
            [x]: ""
          },
          ref: d,
          children: l
        })
      });
    return v.displayName = p, [{
      Provider: u,
      Slot: m,
      ItemSlot: v
    }, function(r) {
      let a = c(e + "CollectionConsumer", r);
      return t.useCallback(() => {
        let e = a.collectionRef.current;
        if (!e) return [];
        let t = Array.from(e.querySelectorAll(`[${x}]`));
        return Array.from(a.itemMap.values()).sort((e, r) => t.indexOf(e.ref.current) - t.indexOf(r.ref.current))
      }, [a.collectionRef, a.itemMap])
    }, o]
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
}, 43957, e => {
  "use strict";
  let t = (0, e.i(56420).default)("check", [
    ["path", {
      d: "M20 6 9 17l-5-5",
      key: "1gmf2c"
    }]
  ]);
  e.s(["default", 0, t])
}, 99682, e => {
  "use strict";
  var t = e.i(71645);
  e.s(["usePrevious", 0, function(e) {
    let r = t.useRef({
      value: e,
      previous: e
    });
    return t.useMemo(() => (r.current.value !== e && (r.current.previous = r.current.value, r.current.value = e), r.current.previous), [e])
  }])
}, 93698, e => {
  "use strict";
  var t = e.i(43957);
  e.s(["CheckIcon", () => t.default])
}, 95925, e => {
  "use strict";
  let t = (0, e.i(56420).default)("rotate-ccw", [
    ["path", {
      d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
      key: "1357e3"
    }],
    ["path", {
      d: "M3 3v5h5",
      key: "1xhq8a"
    }]
  ]);
  e.s(["RotateCcw", 0, t], 95925)
}, 66595, e => {
  "use strict";
  let t = (0, e.i(56420).default)("search", [
    ["path", {
      d: "m21 21-4.34-4.34",
      key: "14j7rj"
    }],
    ["circle", {
      cx: "11",
      cy: "11",
      r: "8",
      key: "4ej97u"
    }]
  ]);
  e.s(["Search", 0, t], 66595)
}, 87486, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(25913),
    a = e.i(86011),
    n = e.i(75157);
  let i = (0, r.cva)("group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!", {
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
    asChild: l = !1,
    ...s
  }) {
    let o = l ? a.Slot.Root : "span";
    return (0, t.jsx)(o, {
      "data-slot": "badge",
      "data-variant": r,
      className: (0, n.cn)(i({
        variant: r
      }), e),
      ...s
    })
  }])
}, 21357, e => {
  "use strict";
  let t = (0, e.i(56420).default)("play", [
    ["path", {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }]
  ]);
  e.s(["Play", 0, t], 21357)
}, 57428, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    a = e.i(20783),
    n = e.i(30030),
    i = e.i(81140),
    l = e.i(69340),
    s = e.i(99682),
    o = e.i(35804),
    d = e.i(96626),
    c = e.i(48425),
    u = "Checkbox",
    [h, f] = (0, n.createContextScope)(u),
    [m, p] = h(u);

  function x(e) {
    let {
      __scopeCheckbox: a,
      checked: n,
      children: i,
      defaultChecked: s,
      disabled: o,
      form: d,
      name: c,
      onCheckedChange: h,
      required: f,
      value: p = "on",
      internal_do_not_use_render: x
    } = e, [g, v] = (0, l.useControllableState)({
      prop: n,
      defaultProp: s ?? !1,
      onChange: h,
      caller: u
    }), [b, y] = r.useState(null), [w, k] = r.useState(null), j = r.useRef(!1), S = !b || !!d || !!b.closest("form"), C = {
      checked: g,
      disabled: o,
      setChecked: v,
      control: b,
      setControl: y,
      name: c,
      form: d,
      value: p,
      hasConsumerStoppedPropagationRef: j,
      required: f,
      defaultChecked: !N(s) && s,
      isFormControl: S,
      bubbleInput: w,
      setBubbleInput: k
    };
    return (0, t.jsx)(m, {
      scope: a,
      ...C,
      children: "function" == typeof x ? x(C) : i
    })
  }
  var g = "CheckboxTrigger",
    v = r.forwardRef(({
      __scopeCheckbox: e,
      onKeyDown: n,
      onClick: l,
      ...s
    }, o) => {
      let {
        control: d,
        value: u,
        disabled: h,
        checked: f,
        required: m,
        setControl: x,
        setChecked: v,
        hasConsumerStoppedPropagationRef: b,
        isFormControl: y,
        bubbleInput: w
      } = p(g, e), k = (0, a.useComposedRefs)(o, x), j = r.useRef(f);
      return r.useEffect(() => {
        let e = d?.form;
        if (e) {
          let t = () => v(j.current);
          return e.addEventListener("reset", t), () => e.removeEventListener("reset", t)
        }
      }, [d, v]), (0, t.jsx)(c.Primitive.button, {
        type: "button",
        role: "checkbox",
        "aria-checked": N(f) ? "mixed" : f,
        "aria-required": m,
        "data-state": S(f),
        "data-disabled": h ? "" : void 0,
        disabled: h,
        value: u,
        ...s,
        ref: k,
        onKeyDown: (0, i.composeEventHandlers)(n, e => {
          "Enter" === e.key && e.preventDefault()
        }),
        onClick: (0, i.composeEventHandlers)(l, e => {
          v(e => !!N(e) || !e), w && y && (b.current = e.isPropagationStopped(), b.current || e.stopPropagation())
        })
      })
    });
  v.displayName = g;
  var b = r.forwardRef((e, r) => {
    let {
      __scopeCheckbox: a,
      name: n,
      checked: i,
      defaultChecked: l,
      required: s,
      disabled: o,
      value: d,
      onCheckedChange: c,
      form: u,
      ...h
    } = e;
    return (0, t.jsx)(x, {
      __scopeCheckbox: a,
      checked: i,
      defaultChecked: l,
      disabled: o,
      required: s,
      onCheckedChange: c,
      name: n,
      form: u,
      value: d,
      internal_do_not_use_render: ({
        isFormControl: e
      }) => (0, t.jsxs)(t.Fragment, {
        children: [(0, t.jsx)(v, {
          ...h,
          ref: r,
          __scopeCheckbox: a
        }), e && (0, t.jsx)(j, {
          __scopeCheckbox: a
        })]
      })
    })
  });
  b.displayName = u;
  var y = "CheckboxIndicator",
    w = r.forwardRef((e, r) => {
      let {
        __scopeCheckbox: a,
        forceMount: n,
        ...i
      } = e, l = p(y, a);
      return (0, t.jsx)(d.Presence, {
        present: n || N(l.checked) || !0 === l.checked,
        children: (0, t.jsx)(c.Primitive.span, {
          "data-state": S(l.checked),
          "data-disabled": l.disabled ? "" : void 0,
          ...i,
          ref: r,
          style: {
            pointerEvents: "none",
            ...e.style
          }
        })
      })
    });
  w.displayName = y;
  var k = "CheckboxBubbleInput",
    j = r.forwardRef(({
      __scopeCheckbox: e,
      ...n
    }, i) => {
      let {
        control: l,
        hasConsumerStoppedPropagationRef: d,
        checked: u,
        defaultChecked: h,
        required: f,
        disabled: m,
        name: x,
        value: g,
        form: v,
        bubbleInput: b,
        setBubbleInput: y
      } = p(k, e), w = (0, a.useComposedRefs)(i, y), j = (0, s.usePrevious)(u), S = (0, o.useSize)(l);
      r.useEffect(() => {
        if (!b) return;
        let e = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked").set,
          t = !d.current;
        if (j !== u && e) {
          let r = new Event("click", {
            bubbles: t
          });
          b.indeterminate = N(u), e.call(b, !N(u) && u), b.dispatchEvent(r)
        }
      }, [b, j, u, d]);
      let C = r.useRef(!N(u) && u);
      return (0, t.jsx)(c.Primitive.input, {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: h ?? C.current,
        required: f,
        disabled: m,
        name: x,
        value: g,
        form: v,
        ...n,
        tabIndex: -1,
        ref: w,
        style: {
          ...n.style,
          ...S,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          transform: "translateX(-100%)"
        }
      })
    });

  function N(e) {
    return "indeterminate" === e
  }

  function S(e) {
    return N(e) ? "indeterminate" : e ? "checked" : "unchecked"
  }
  j.displayName = k, e.s(["Checkbox", 0, b, "CheckboxIndicator", 0, w, "Indicator", 0, w, "Root", 0, b, "createCheckboxScope", 0, f, "unstable_BubbleInput", 0, j, "unstable_CheckboxBubbleInput", 0, j, "unstable_CheckboxProvider", 0, x, "unstable_CheckboxTrigger", 0, v, "unstable_Provider", 0, x, "unstable_Trigger", 0, v], 88474);
  var C = e.i(88474),
    C = C,
    D = e.i(75157),
    P = e.i(93698);
  e.s(["Checkbox", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)(C.Root, {
      "data-slot": "checkbox",
      className: (0, D.cn)("peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary", e),
      ...r,
      children: (0, t.jsx)(C.Indicator, {
        "data-slot": "checkbox-indicator",
        className: "grid place-content-center text-current transition-none [&>svg]:size-3.5",
        children: (0, t.jsx)(P.CheckIcon, {})
      })
    })
  }], 57428)
}, 69644, e => {
  "use strict";
  let t = (0, e.i(56420).default)("folder-open", [
    ["path", {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }]
  ]);
  e.s(["FolderOpen", 0, t], 69644)
}, 77572, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(25913),
    a = e.i(71645),
    n = e.i(81140),
    i = e.i(30030),
    l = e.i(75830),
    s = e.i(20783),
    o = e.i(10772),
    d = e.i(48425),
    c = e.i(30207),
    u = e.i(69340),
    h = e.i(86318),
    f = "rovingFocusGroup.onEntryFocus",
    m = {
      bubbles: !1,
      cancelable: !0
    },
    p = "RovingFocusGroup",
    [x, g, v] = (0, l.createCollection)(p),
    [b, y] = (0, i.createContextScope)(p, [v]),
    [w, k] = b(p),
    j = a.forwardRef((e, r) => (0, t.jsx)(x.Provider, {
      scope: e.__scopeRovingFocusGroup,
      children: (0, t.jsx)(x.Slot, {
        scope: e.__scopeRovingFocusGroup,
        children: (0, t.jsx)(N, {
          ...e,
          ref: r
        })
      })
    }));
  j.displayName = p;
  var N = a.forwardRef((e, r) => {
      let {
        __scopeRovingFocusGroup: i,
        orientation: l,
        loop: o = !1,
        dir: x,
        currentTabStopId: v,
        defaultCurrentTabStopId: b,
        onCurrentTabStopIdChange: y,
        onEntryFocus: k,
        preventScrollOnEntryFocus: j = !1,
        ...N
      } = e, S = a.useRef(null), C = (0, s.useComposedRefs)(r, S), D = (0, h.useDirection)(x), [T, R] = (0, u.useControllableState)({
        prop: v,
        defaultProp: b ?? null,
        onChange: y,
        caller: p
      }), [B, I] = a.useState(!1), M = (0, c.useCallbackRef)(k), _ = g(i), E = a.useRef(!1), [L, z] = a.useState(0);
      return a.useEffect(() => {
        let e = S.current;
        if (e) return e.addEventListener(f, M), () => e.removeEventListener(f, M)
      }, [M]), (0, t.jsx)(w, {
        scope: i,
        orientation: l,
        dir: D,
        loop: o,
        currentTabStopId: T,
        onItemFocus: a.useCallback(e => R(e), [R]),
        onItemShiftTab: a.useCallback(() => I(!0), []),
        onFocusableItemAdd: a.useCallback(() => z(e => e + 1), []),
        onFocusableItemRemove: a.useCallback(() => z(e => e - 1), []),
        children: (0, t.jsx)(d.Primitive.div, {
          tabIndex: B || 0 === L ? -1 : 0,
          "data-orientation": l,
          ...N,
          ref: C,
          style: {
            outline: "none",
            ...e.style
          },
          onMouseDown: (0, n.composeEventHandlers)(e.onMouseDown, () => {
            E.current = !0
          }),
          onFocus: (0, n.composeEventHandlers)(e.onFocus, e => {
            let t = !E.current;
            if (e.target === e.currentTarget && t && !B) {
              let t = new CustomEvent(f, m);
              if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
                let e = _().filter(e => e.focusable);
                P([e.find(e => e.active), e.find(e => e.id === T), ...e].filter(Boolean).map(e => e.ref.current), j)
              }
            }
            E.current = !1
          }),
          onBlur: (0, n.composeEventHandlers)(e.onBlur, () => I(!1))
        })
      })
    }),
    S = "RovingFocusGroupItem",
    C = a.forwardRef((e, r) => {
      let {
        __scopeRovingFocusGroup: i,
        focusable: l = !0,
        active: s = !1,
        tabStopId: c,
        children: u,
        ...h
      } = e, f = (0, o.useId)(), m = c || f, p = k(S, i), v = p.currentTabStopId === m, b = g(i), {
        onFocusableItemAdd: y,
        onFocusableItemRemove: w,
        currentTabStopId: j
      } = p;
      return a.useEffect(() => {
        if (l) return y(), () => w()
      }, [l, y, w]), (0, t.jsx)(x.ItemSlot, {
        scope: i,
        id: m,
        focusable: l,
        active: s,
        children: (0, t.jsx)(d.Primitive.span, {
          tabIndex: v ? 0 : -1,
          "data-orientation": p.orientation,
          ...h,
          ref: r,
          onMouseDown: (0, n.composeEventHandlers)(e.onMouseDown, e => {
            l ? p.onItemFocus(m) : e.preventDefault()
          }),
          onFocus: (0, n.composeEventHandlers)(e.onFocus, () => p.onItemFocus(m)),
          onKeyDown: (0, n.composeEventHandlers)(e.onKeyDown, e => {
            if ("Tab" === e.key && e.shiftKey) return void p.onItemShiftTab();
            if (e.target !== e.currentTarget) return;
            let t = function(e, t, r) {
              var a;
              let n = (a = e.key, "rtl" !== r ? a : "ArrowLeft" === a ? "ArrowRight" : "ArrowRight" === a ? "ArrowLeft" : a);
              if (!("vertical" === t && ["ArrowLeft", "ArrowRight"].includes(n)) && !("horizontal" === t && ["ArrowUp", "ArrowDown"].includes(n))) return D[n]
            }(e, p.orientation, p.dir);
            if (void 0 !== t) {
              if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
              e.preventDefault();
              let n = b().filter(e => e.focusable).map(e => e.ref.current);
              if ("last" === t) n.reverse();
              else if ("prev" === t || "next" === t) {
                var r, a;
                "prev" === t && n.reverse();
                let i = n.indexOf(e.currentTarget);
                n = p.loop ? (r = n, a = i + 1, r.map((e, t) => r[(a + t) % r.length])) : n.slice(i + 1)
              }
              setTimeout(() => P(n))
            }
          }),
          children: "function" == typeof u ? u({
            isCurrentTabStop: v,
            hasTabStop: null != j
          }) : u
        })
      })
    });
  C.displayName = S;
  var D = {
    ArrowLeft: "prev",
    ArrowUp: "prev",
    ArrowRight: "next",
    ArrowDown: "next",
    PageUp: "first",
    Home: "first",
    PageDown: "last",
    End: "last"
  };

  function P(e, t = !1) {
    let r = document.activeElement;
    for (let a of e)
      if (a === r || (a.focus({
          preventScroll: t
        }), document.activeElement !== r)) return
  }
  var T = e.i(96626),
    R = "Tabs",
    [B, I] = (0, i.createContextScope)(R, [y]),
    M = y(),
    [_, E] = B(R),
    L = a.forwardRef((e, r) => {
      let {
        __scopeTabs: a,
        value: n,
        onValueChange: i,
        defaultValue: l,
        orientation: s = "horizontal",
        dir: c,
        activationMode: f = "automatic",
        ...m
      } = e, p = (0, h.useDirection)(c), [x, g] = (0, u.useControllableState)({
        prop: n,
        onChange: i,
        defaultProp: l ?? "",
        caller: R
      });
      return (0, t.jsx)(_, {
        scope: a,
        baseId: (0, o.useId)(),
        value: x,
        onValueChange: g,
        orientation: s,
        dir: p,
        activationMode: f,
        children: (0, t.jsx)(d.Primitive.div, {
          dir: p,
          "data-orientation": s,
          ...m,
          ref: r
        })
      })
    });
  L.displayName = R;
  var z = "TabsList",
    F = a.forwardRef((e, r) => {
      let {
        __scopeTabs: a,
        loop: n = !0,
        ...i
      } = e, l = E(z, a), s = M(a);
      return (0, t.jsx)(j, {
        asChild: !0,
        ...s,
        orientation: l.orientation,
        dir: l.dir,
        loop: n,
        children: (0, t.jsx)(d.Primitive.div, {
          role: "tablist",
          "aria-orientation": l.orientation,
          ...i,
          ref: r
        })
      })
    });
  F.displayName = z;
  var V = "TabsTrigger",
    A = a.forwardRef((e, r) => {
      let {
        __scopeTabs: a,
        value: i,
        disabled: l = !1,
        ...s
      } = e, o = E(V, a), c = M(a), u = H(o.baseId, i), h = K(o.baseId, i), f = i === o.value;
      return (0, t.jsx)(C, {
        asChild: !0,
        ...c,
        focusable: !l,
        active: f,
        children: (0, t.jsx)(d.Primitive.button, {
          type: "button",
          role: "tab",
          "aria-selected": f,
          "aria-controls": h,
          "data-state": f ? "active" : "inactive",
          "data-disabled": l ? "" : void 0,
          disabled: l,
          id: u,
          ...s,
          ref: r,
          onMouseDown: (0, n.composeEventHandlers)(e.onMouseDown, e => {
            l || 0 !== e.button || !1 !== e.ctrlKey ? e.preventDefault() : o.onValueChange(i)
          }),
          onKeyDown: (0, n.composeEventHandlers)(e.onKeyDown, e => {
            [" ", "Enter"].includes(e.key) && o.onValueChange(i)
          }),
          onFocus: (0, n.composeEventHandlers)(e.onFocus, () => {
            let e = "manual" !== o.activationMode;
            f || l || !e || o.onValueChange(i)
          })
        })
      })
    });
  A.displayName = V;
  var $ = "TabsContent",
    q = a.forwardRef((e, r) => {
      let {
        __scopeTabs: n,
        value: i,
        forceMount: l,
        children: s,
        ...o
      } = e, c = E($, n), u = H(c.baseId, i), h = K(c.baseId, i), f = i === c.value, m = a.useRef(f);
      return a.useEffect(() => {
        let e = requestAnimationFrame(() => m.current = !1);
        return () => cancelAnimationFrame(e)
      }, []), (0, t.jsx)(T.Presence, {
        present: l || f,
        children: ({
          present: a
        }) => (0, t.jsx)(d.Primitive.div, {
          "data-state": f ? "active" : "inactive",
          "data-orientation": c.orientation,
          role: "tabpanel",
          "aria-labelledby": u,
          hidden: !a,
          id: h,
          tabIndex: 0,
          ...o,
          ref: r,
          style: {
            ...e.style,
            animationDuration: m.current ? "0s" : void 0
          },
          children: a && s
        })
      })
    });

  function H(e, t) {
    return `${e}-trigger-${t}`
  }

  function K(e, t) {
    return `${e}-content-${t}`
  }
  q.displayName = $, e.s(["Content", 0, q, "List", 0, F, "Root", 0, L, "Tabs", 0, L, "TabsContent", 0, q, "TabsList", 0, F, "TabsTrigger", 0, A, "Trigger", 0, A, "createTabsScope", 0, I], 26209);
  var O = e.i(26209),
    O = O,
    U = e.i(75157);
  let X = (0, r.cva)("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none", {
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
    return (0, t.jsx)(O.Root, {
      "data-slot": "tabs",
      "data-orientation": r,
      className: (0, U.cn)("group/tabs flex gap-2 data-horizontal:flex-col", e),
      ...a
    })
  }, "TabsContent", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)(O.Content, {
      "data-slot": "tabs-content",
      className: (0, U.cn)("flex-1 text-sm outline-none", e),
      ...r
    })
  }, "TabsList", 0, function({
    className: e,
    variant: r = "default",
    ...a
  }) {
    return (0, t.jsx)(O.List, {
      "data-slot": "tabs-list",
      "data-variant": r,
      className: (0, U.cn)(X({
        variant: r
      }), e),
      ...a
    })
  }, "TabsTrigger", 0, function({
    className: e,
    ...r
  }) {
    return (0, t.jsx)(O.Trigger, {
      "data-slot": "tabs-trigger",
      className: (0, U.cn)("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent", "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100", e),
      ...r
    })
  }], 77572)
}, 80345, 81469, 78422, 38465, 88991, 1975, 71040, e => {
  "use strict";
  var t = e.i(68834),
    r = e.i(79473),
    a = e.i(48868),
    n = e.i(75157);
  let i = /(\d{3,4})\s*p/i,
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

  function s(e) {
    let t = e.trim();
    if (!t) return !1;
    try {
      let e = new URL(t);
      return "http:" === e.protocol || "https:" === e.protocol
    } catch {
      return !1
    }
  }

  function o(e) {
    let t = e.filter(e => "video" === e.kind);
    if (0 === t.length) return null;
    let r = t.filter(e => "number" == typeof e.filesize && e.filesize > 0);
    if (r.length > 0) return r.reduce((e, t) => t.filesize > e.filesize ? t : e);
    let a = t.map(e => {
      let t;
      return {
        format: e,
        resolution: (t = e.label.match(i)) ? Number.parseInt(t[1], 10) : null
      }
    }).filter(e => null !== e.resolution).sort((e, t) => t.resolution - e.resolution);
    return a.length > 0 ? a[0].format : t[0]
  }

  function d(e) {
    return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime()
  }

  function c(e) {
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
  e.s(["SUPPORTED_PLATFORM_NAMES", 0, ["YouTube", "TikTok", "Instagram", "Facebook", "Douyin", "Bilibili", "Twitter/X", "Threads"], "isSupportedPlatformUrl", 0, s, "pickBestPlatformFormat", 0, o, "platformSourceLabel", 0, function(e) {
    let t = e.trim().toLowerCase();
    return t ? l[t] ?? `${t[0].toUpperCase()}${t.slice(1)}` : ""
  }], 81469);
  let u = "Tính năng này chỉ khả dụng trong ứng dụng DichVideo trên máy tính.";

  function h(e) {
    let t = c(e);
    return t.includes("platform_download_canceled") ? "Đã hủy tải." : t.includes("tauri_environment_required") ? u : t.includes("platform_download_url_forbidden") ? "Nền tảng từ chối địa chỉ tải của định dạng này. Hãy chọn chất lượng khác." : t.includes("platform_download_write_failed") ? "Không ghi được file tải về. Kiểm tra dung lượng đĩa và quyền ghi." : "Tải video thất bại. Thử lại sau."
  }
  e.s(["formatDownloadedAtLabel", 0, function(e, t = new Date) {
    let r = new Date(e);
    if (Number.isNaN(r.getTime())) return "";
    let a = String(r.getHours()).padStart(2, "0"),
      n = String(r.getMinutes()).padStart(2, "0"),
      i = `${a}:${n}`,
      l = Math.round((d(t) - d(r)) / 864e5);
    if (0 === l) return `H\xf4m nay ${i}`;
    if (1 === l) return `H\xf4m qua ${i}`;
    let s = r.getFullYear(),
      o = String(r.getMonth() + 1).padStart(2, "0"),
      c = String(r.getDate()).padStart(2, "0");
    return `${c}/${o}/${s} ${i}`
  }, "platformChannelErrorMessage", 0, function(e) {
    let t = c(e);
    return t.includes("tauri_environment_required") ? u : t.includes("platform_url_invalid") ? "Đường dẫn không hợp lệ. Hãy dán đầy đủ địa chỉ kênh hoặc playlist." : "Không lấy được danh sách video. Kiểm tra lại đường dẫn hoặc thử lại."
  }, "platformDownloadErrorMessage", 0, h, "platformDownloadProgressPercent", 0, function(e, t) {
    return !t || t <= 0 ? null : Math.min(100, Math.round(e / t * 100))
  }, "platformExtractErrorMessage", 0, function(e) {
    let t = c(e);
    return t.includes("tauri_environment_required") ? u : t.includes("platform_url_invalid") ? "Đường dẫn không hợp lệ. Hãy dán đầy đủ địa chỉ video." : "Không lấy được thông tin video. Kiểm tra lại đường dẫn hoặc thử lại."
  }], 78422);
  var f = e.i(65991),
    m = e.i(44077);
  e.i(89268);
  var p = e.i(81341);

  function x(e) {
    let t = e?.trim();
    return t ? (/^[a-zA-Z]:[\\/]/.test(t) || t.includes("\\") ? t.replace(/[\\/]+/g, "\\") : t).toLowerCase() : ""
  }

  function g(e) {
    let t = new Set,
      r = [];
    for (let a of e) {
      let e = x(a.filePath);
      !e || t.has(e) || (t.add(e), r.push(a))
    }
    return r
  }

  function v(e) {
    let t = Date.parse(e.downloadedAt);
    return Number.isNaN(t) ? null : t
  }

  function b(e) {
    return e.title.trim() || function(e) {
      let t = e?.trim();
      if (!t) return "";
      let r = t.split(/[\\/]+/).filter(Boolean);
      return r[r.length - 1] ?? ""
    }(e.filePath) || "video"
  }

  function y(e, t) {
    let r = new Set(t.queueVideoIds);
    return e.map(e => {
      let a = t.videos.find(t => {
        var r, a;
        let n, i;
        return r = t.path, a = e.filePath, n = x(r), i = x(a), "" !== n && n === i
      });
      return a ? r.has(a.id) ? {
        entry: e,
        videoId: a.id,
        action: "unavailable",
        reason: "already_queued"
      } : "idle" !== a.status || a.translatedVideoPath ? {
        entry: e,
        videoId: a.id,
        action: "unavailable",
        reason: "already_processed"
      } : {
        entry: e,
        videoId: a.id,
        action: "reuse"
      } : {
        entry: e,
        videoId: null,
        action: "import"
      }
    })
  }

  function w(e, t) {
    return e.filter(e => e.action === t)
  }
  async function k(e) {
    let t = (0, p.isTauri)(),
      r = f.useVideoStore.getState(),
      a = m.useQueueStore.getState(),
      n = y(g(e), {
        videos: r.videos,
        queueVideoIds: (0, m.inFlightQueueVideoIds)(a.items)
      }),
      i = {
        activeVideoId: null,
        missingEntryIds: [],
        failed: []
      },
      l = null,
      s = [];
    for (let e of w(n, "import")) {
      let {
        entry: r
      } = e;
      if (t && !await (0, p.fileExists)(r.filePath)) {
        i.missingEntryIds.push(r.id);
        continue
      }
      try {
        let e = (0, m.inFlightQueueVideoIds)(m.useQueueStore.getState().items),
          t = await f.useVideoStore.getState().addVideoFromFile(r.filePath, {
            queueVideoIds: e
          });
        l = t, m.useQueueStore.getState().isVideoQueued(t) || s.push(t)
      } catch (e) {
        i.failed.push({
          entryId: r.id,
          filePath: r.filePath,
          message: e instanceof Error ? e.message : String(e)
        })
      }
    }
    for (let e of w(n, "reuse")) {
      let {
        entry: r,
        videoId: a
      } = e;
      if (a) {
        if (t && !await (0, p.fileExists)(r.filePath)) {
          i.missingEntryIds.push(r.id);
          continue
        }
        l = a, f.useVideoStore.getState().dashboardDraftVideoIds.includes(a) || s.push(a)
      }
    }
    return s.length > 0 && f.useVideoStore.getState().addDashboardDraftVideoIds(s), l && f.useVideoStore.getState().setActiveVideo(l), i.activeVideoId = l, i
  }
  e.s(["buildDownloadedImportPlan", 0, y, "downloadedImportPlanEntries", 0, w, "entryDisplayTitle", 0, b, "normalizeDownloadedVideoEntries", 0, g, "sortDownloadedVideoEntries", 0, function(e) {
    return [...e].sort((e, t) => {
      let r = v(e),
        a = v(t);
      return null === r && null === a ? b(e).localeCompare(b(t)) : null === r ? 1 : null === a ? -1 : a !== r ? a - r : b(e).localeCompare(b(t))
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
  }], 38465), e.s(["importDownloadedVideos", 0, k], 88991);
  var j = e.i(86682);
  async function N(e) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    return (0, j.invoke)("extract_platform_media", {
      url: e
    })
  }
  async function S(e, t) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    return (0, j.invoke)("list_platform_channel", {
      url: e,
      limit: t ?? null
    })
  }
  async function C(e) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    return (0, j.invoke)("download_platform_media", {
      ...e
    })
  }
  let D = !1;
  async function P(e) {
    (0, p.isTauri)() && await (0, j.invoke)("cancel_platform_download", {
      downloadId: e
    })
  }
  async function T(e) {
    if (!(0, p.isTauri)()) throw Error("tauri_environment_required");
    await (0, j.invoke)("delete_platform_download_file", {
      path: e
    })
  }
  async function R(t) {
    if (!(0, p.isTauri)()) return () => {};
    let {
      listen: r
    } = await e.A(23982);
    return r("platform-download-progress", e => {
      t(e.payload)
    })
  }
  e.s(["cancelPlatformDownload", 0, P, "deletePlatformDownloadFile", 0, T, "downloadPlatformMedia", 0, C, "extractPlatformMedia", 0, N, "listPlatformChannel", 0, S, "onPlatformDownloadProgress", 0, R, "warmPlatformConnection", 0, function() {
    (0, p.isTauri)() && !D && (D = !0, (0, j.invoke)("warm_platform_connection").catch(() => void 0))
  }], 1975);
  let B = null;

  function I(e, t) {
    let r = {
      ...e
    };
    return delete r[t], r
  }
  let M = null;

  function _(e) {
    if ("string" == typeof e) return e;
    if (e && "object" == typeof e)
      for (let t of ["code", "message", "error"]) {
        let r = e[t];
        if ("string" == typeof r && r.trim()) return r.trim()
      }
    return ""
  }
  let E = (0, t.create)()((0, r.persist)((e, t) => ({
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
    extract: async e => N(e),
    download: async ({
      info: r,
      format: a,
      sourceUrl: i,
      downloadId: l
    }) => {
      B ??= R(e => {
        E.setState(t => {
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
      let s = l ?? (0, n.generateId)(),
        o = new Date().toISOString();
      e(e => ({
        active: {
          ...e.active,
          [s]: {
            title: r.title,
            downloadedBytes: 0,
            totalBytes: null
          }
        }
      }));
      try {
        let n = await C({
            downloadId: s,
            formatUrl: a.url,
            source: r.source,
            title: r.title,
            ext: a.ext
          }),
          l = {
            id: s,
            sourceUrl: i,
            source: r.source,
            title: r.title,
            thumbnail: r.thumbnail,
            author: r.author,
            durationSeconds: r.duration,
            formatLabel: a.label,
            filePath: n,
            fileSizeBytes: t().active[s]?.totalBytes ?? a.filesize,
            downloadedAt: new Date().toISOString(),
            rightsConfirmedAt: o
          };
        return e(e => ({
          active: I(e.active, s),
          history: [l, ...e.history]
        })), k([l]).catch(e => {
          console.warn("Auto-staging downloaded video failed:", e)
        }), l
      } catch (t) {
        throw e(e => ({
          active: I(e.active, s)
        })), t
      }
    },
    cancel: async e => {
      await P(e)
    },
    removeFromHistory: t => {
      e(e => ({
        history: e.history.filter(e => e.id !== t)
      }))
    },
    deleteDownloadedFile: async r => {
      let a = t().history.find(e => e.id === r);
      if (a) {
        try {
          await T(a.filePath)
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
      let a = r.trim();
      e({
        channelLoading: !0,
        channelBatchSummary: null
      });
      try {
        let t = await S(a),
          r = new Set,
          n = t.items.map(e => ({
            ...e,
            url: e.url.trim()
          })).filter(e => !(!s(e.url) || r.has(e.url)) && (r.add(e.url), !0));
        e({
          channel: {
            sourceUrl: a,
            source: t.source,
            items: n
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
      let a = {
        cancelRequested: !1,
        currentDownloadId: null
      };
      M = a;
      let i = (t, r) => {
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
        }), r)) i(t.url, {
        status: "pending",
        error: null
      });
      let l = 0,
        s = 0;
      for (let e of r) {
        if (a.cancelRequested) break;
        i(e.url, {
          status: "downloading",
          error: null
        });
        try {
          let r = await t().extract(e.url);
          if (a.cancelRequested) {
            i(e.url, {
              status: "pending",
              error: null
            });
            break
          }
          let s = o(r.formats);
          if (!s) throw Error("platform_download_failed");
          let d = (0, n.generateId)();
          a.currentDownloadId = d, await t().download({
            info: r,
            format: s,
            sourceUrl: e.url,
            downloadId: d
          }), l += 1, i(e.url, {
            status: "done",
            error: null
          })
        } catch (r) {
          let t = _(r);
          if (a.cancelRequested || t.includes("platform_download_canceled")) {
            i(e.url, {
              status: "pending",
              error: null
            }), a.cancelRequested = !0;
            break
          }
          s += 1, i(e.url, {
            status: "error",
            error: h(r)
          })
        } finally {
          a.currentDownloadId = null
        }
      }
      let d = {
        total: r.length,
        completed: l,
        failed: s,
        canceled: a.cancelRequested
      };
      return M = null, e({
        channelBatchRunning: !1,
        channelBatchSummary: d
      }), d
    },
    cancelChannelBatch: () => {
      let e = M;
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
      let a = {
        cancelRequested: !1,
        currentDownloadId: null
      };
      M = a;
      let i = r.map(e => ({
          url: e.url,
          info: e.info,
          status: "pending",
          error: null
        })),
        l = new Set(i.map(e => e.url)),
        s = (t, r, a = null) => {
          e(e => ({
            linksBatch: e.linksBatch.map(e => e.url === t ? {
              ...e,
              status: r,
              error: a
            } : e)
          }))
        };
      e(e => ({
        linksBatchRunning: !0,
        linksBatchSummary: null,
        linksBatch: [...i, ...e.linksBatch.filter(e => !l.has(e.url))]
      }));
      let d = 0,
        c = 0;
      for (let e of i) {
        if (a.cancelRequested) {
          s(e.url, "cancelled");
          continue
        }
        s(e.url, "downloading");
        try {
          let r = o(e.info.formats);
          if (!r) throw Error("platform_download_failed");
          let i = (0, n.generateId)();
          a.currentDownloadId = i, await t().download({
            info: e.info,
            format: r,
            sourceUrl: e.url,
            downloadId: i
          }), d += 1, s(e.url, "done")
        } catch (r) {
          let t = _(r);
          if (a.cancelRequested || t.includes("platform_download_canceled")) {
            s(e.url, "cancelled"), a.cancelRequested = !0;
            continue
          }
          c += 1, s(e.url, "error", h(r))
        } finally {
          a.currentDownloadId = null
        }
      }
      let u = {
        total: i.length,
        completed: d,
        failed: c,
        canceled: a.cancelRequested
      };
      return M = null, e({
        linksBatchRunning: !1,
        linksBatchSummary: u
      }), u
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
      let e = M;
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
    storage: (0, r.createJSONStorage)(() => (0, a.createLegacyStorage)(() => localStorage, {})),
    partialize: e => ({
      history: e.history
    })
  }));
  e.s(["usePlatformDownloadStore", 0, E], 80345);
  var L = e.i(71645);
  e.s(["useMissingPlatformFiles", 0, function(e) {
    let [t, r] = (0, L.useState)(new Set);
    return (0, L.useEffect)(() => {
      let t = !0;
      return (async () => {
        let a = new Set;
        await Promise.all(e.map(async e => {
          await (0, p.fileExists)(e.filePath) || a.add(e.id)
        })), t && r(a)
      })(), () => {
        t = !1
      }
    }, [e]), t
  }], 71040)
}, 30372, 88901, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    a = e.i(46696),
    n = e.i(56420);
  let i = (0, n.default)("folder-down", [
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
  e.s(["FolderDown", 0, i], 88901);
  var l = e.i(69644);
  let s = (0, n.default)("import", [
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
  var o = e.i(32781),
    d = e.i(21357),
    c = e.i(73474),
    u = e.i(87486),
    h = e.i(19455),
    f = e.i(46798),
    m = e.i(65991),
    p = e.i(44077),
    x = e.i(80345),
    g = e.i(81469),
    v = e.i(78422),
    b = e.i(88991),
    y = e.i(13308),
    w = e.i(38991),
    k = e.i(8594);
  async function j(e, {
    setPreparationMessage: t
  }) {
    if (!await (0, y.ensureMediaToolsReady)({
        setPreparationMessage: t,
        logContext: "platform-download-import",
        checkingMessage: "Đang kiểm tra trình đọc video...",
        preparingMessage: "Đang chuẩn bị trình đọc video...",
        errorTitle: "Không thể chuẩn bị trình đọc video",
        contextMessage: "DichVideo chưa thể chuẩn bị thành phần đọc video."
      }) || !(await (0, b.importDownloadedVideos)([e])).activeVideoId) return !1;
    let r = k.useTerminalProjectStore.getState().active?.projectId ?? null;
    return await w.useAppStore.getState().leaveEditor("dashboard", r), !0
  }
  var N = e.i(71040);
  e.i(89268);
  var S = e.i(81341),
    C = e.i(63126),
    D = e.i(75157),
    P = e.i(38465);
  let T = {
    already_queued: "warning",
    already_processed: "secondary"
  };
  e.s(["DownloadedVideoList", 0, function({
    entries: e,
    hideProcessed: n = !1,
    bare: b = !1,
    className: y
  }) {
    let w = (0, m.useVideoStore)(e => e.videos),
      k = (0, m.useVideoStore)(e => e.dashboardDraftVideoIds),
      R = (0, p.useQueueStore)(e => e.items),
      B = (0, x.usePlatformDownloadStore)(e => e.removeFromHistory),
      I = (0, x.usePlatformDownloadStore)(e => e.deleteDownloadedFile),
      M = (0, N.useMissingPlatformFiles)(e),
      _ = (0, r.useMemo)(() => (0, p.inFlightQueueVideoIds)(R), [R]),
      E = (0, r.useMemo)(() => (0, P.sortDownloadedVideoEntries)((0, P.normalizeDownloadedVideoEntries)(e)), [e]),
      L = (0, r.useMemo)(() => (0, P.buildDownloadedImportPlan)(E, {
        videos: w,
        queueVideoIds: _
      }), [E, w, _]),
      z = (0, r.useMemo)(() => new Map(L.map(e => [e.entry.id, e])), [L]),
      F = (0, r.useMemo)(() => n ? E.filter(e => z.get(e.id)?.reason !== "already_processed") : E, [n, E, z]),
      [V, A] = (0, r.useState)(null),
      [$, q] = (0, r.useState)(null),
      [H, K] = (0, r.useState)(null),
      O = null !== V || null !== $,
      U = (0, r.useCallback)(async e => {
        if (!V) {
          A(e.id);
          try {
            await j(e, {
              setPreparationMessage: K
            })
          } catch (t) {
            console.error("Failed to import downloaded video:", t), a.toast.error("Không thể nhập video", {
              description: e.title
            })
          } finally {
            A(null)
          }
        }
      }, [V]),
      X = (0, r.useCallback)(async (e, t, r) => {
        if (!$) {
          if (r) return void a.toast.info("Video đang trong hàng chờ xử lý", {
            description: "Gỡ video khỏi hàng chờ trước khi xóa file."
          });
          if (await (0, S.askMessage)("Xóa video đã tải", t ? `"${(0,P.entryDisplayTitle)(e)}" sẽ bị x\xf3a khỏi lịch sử tải. File tr\xean m\xe1y kh\xf4ng c\xf2n tồn tại.` : `"${(0,P.entryDisplayTitle)(e)}" sẽ bị x\xf3a khỏi m\xe1y t\xednh v\xe0 khỏi lịch sử tải.`, "warning", {
              confirmLabel: "Xóa",
              cancelLabel: "Hủy"
            })) {
            q(e.id);
            try {
              t ? B(e.id) : await I(e.id)
            } catch (t) {
              console.error("Failed to delete downloaded video:", t), a.toast.error("Không thể xóa file", {
                description: (0, P.entryDisplayTitle)(e)
              })
            } finally {
              q(null)
            }
          }
        }
      }, [$, I, B]);
    return b && 0 === F.length ? null : (0, t.jsxs)("section", {
      "data-testid": "downloaded-video-list",
      className: (0, D.cn)("flex flex-col", b ? "" : "h-full flex-1 overflow-hidden rounded-lg border border-border bg-background/45", y),
      children: [(0, t.jsxs)("div", {
        className: "flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2",
        children: [(0, t.jsxs)("div", {
          className: "flex min-w-0 items-center gap-2",
          children: [(0, t.jsx)(i, {
            className: "h-4 w-4 shrink-0 text-muted-foreground"
          }), (0, t.jsxs)("div", {
            className: "min-w-0",
            children: [(0, t.jsx)("p", {
              className: "truncate text-xs font-semibold",
              children: "Video đã tải xuống"
            }), (0, t.jsxs)("p", {
              className: "mt-0.5 text-[11px] text-muted-foreground",
              children: [F.length, " video"]
            })]
          })]
        }), (0, t.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [H ? (0, t.jsxs)("p", {
            className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
            children: [(0, t.jsx)(o.Loader2, {
              className: "h-3 w-3 animate-spin"
            }), H]
          }) : null, (0, t.jsxs)(u.Badge, {
            variant: "secondary",
            className: "h-6 px-2 text-[11px]",
            children: [F.length, " video"]
          })]
        })]
      }), 0 === F.length ? (0, t.jsxs)("div", {
        className: "flex flex-1 flex-col items-center justify-center px-4 py-5 text-center",
        children: [(0, t.jsx)("div", {
          className: "mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-muted-foreground",
          children: (0, t.jsx)(i, {
            className: "h-5 w-5"
          })
        }), (0, t.jsx)("p", {
          className: "text-xs font-semibold",
          children: n ? "Chưa có video nào cần xử lý" : "Chưa có video nào được tải xuống"
        }), (0, t.jsx)("p", {
          className: "mt-0.5 text-[11px] text-muted-foreground",
          children: n ? "Video tải xong sẽ tự thêm vào hàng chờ xử lý" : "Video tải xong sẽ hiện ở đây"
        })]
      }) : (0, t.jsx)(f.TooltipProvider, {
        delayDuration: 0,
        children: (0, t.jsx)("div", {
          className: "divide-y divide-border",
          children: F.map(e => {
            let r = z.get(e.id),
              n = r?.action === "unavailable",
              i = M.has(e.id),
              m = n || i || O,
              p = r?.videoId != null && k.includes(r.videoId),
              x = [(0, g.platformSourceLabel)(e.source), e.formatLabel, null !== e.durationSeconds && e.durationSeconds > 0 ? (0, D.formatDuration)(e.durationSeconds) : null, null !== e.fileSizeBytes && e.fileSizeBytes > 0 ? (0, D.formatFileSize)(e.fileSizeBytes) : null, (0, v.formatDownloadedAtLabel)(e.downloadedAt), i ? "Tệp không còn" : null].filter(e => !!e),
              b = (0, P.entryDisplayTitle)(e),
              y = (0, P.unavailableReasonLabel)(r?.reason),
              w = V === e.id;
            return (0, t.jsxs)("div", {
              className: "flex items-center gap-3 px-3 py-2",
              children: [(0, t.jsxs)("div", {
                className: (0, D.cn)("flex min-w-0 flex-1 items-center gap-3", m && "opacity-70"),
                children: [(0, t.jsx)("div", {
                  className: "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                  children: e.thumbnail ? (0, t.jsx)("img", {
                    src: e.thumbnail,
                    alt: b,
                    className: "h-full w-full object-cover"
                  }) : (0, t.jsx)(d.Play, {
                    className: "h-4 w-4 text-muted-foreground"
                  })
                }), (0, t.jsxs)("div", {
                  className: "min-w-0 flex-1",
                  children: [(0, t.jsx)("p", {
                    className: (0, D.cn)("truncate text-xs font-semibold", i && "text-muted-foreground"),
                    children: b
                  }), (0, t.jsx)("p", {
                    className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                    children: x.length > 0 ? x.join(" · ") : e.filePath
                  })]
                })]
              }), n && y ? (0, t.jsx)(u.Badge, {
                variant: r?.reason ? T[r.reason] : "secondary",
                className: "shrink-0",
                children: y
              }) : p ? (0, t.jsx)(u.Badge, {
                variant: "success",
                className: "shrink-0",
                children: "Trong hàng chờ"
              }) : null, (0, t.jsxs)(f.Tooltip, {
                children: [(0, t.jsx)(f.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsxs)(h.Button, {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    className: "h-7 shrink-0 px-2 text-xs",
                    disabled: m,
                    onClick: () => void U(e),
                    children: [w ? (0, t.jsx)(o.Loader2, {
                      className: "h-3.5 w-3.5 animate-spin"
                    }) : (0, t.jsx)(s, {
                      className: "h-3.5 w-3.5"
                    }), "Đưa vào DichVideo"]
                  })
                }), (0, t.jsx)(f.TooltipContent, {
                  children: "Nhập video vào trang chủ xử lý"
                })]
              }), (0, t.jsxs)(f.Tooltip, {
                children: [(0, t.jsx)(f.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsx)(h.Button, {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 w-7 shrink-0 p-0",
                    disabled: i || O,
                    "aria-label": "Mở thư mục chứa file",
                    onClick: () => {
                      (0, C.revealPathInSystem)(e.filePath).catch(t => {
                        console.error("Failed to reveal download folder:", t), a.toast.error("Không thể mở thư mục chứa file", {
                          description: (0, P.entryDisplayTitle)(e)
                        })
                      })
                    },
                    children: (0, t.jsx)(l.FolderOpen, {
                      className: "h-3.5 w-3.5"
                    })
                  })
                }), (0, t.jsx)(f.TooltipContent, {
                  children: "Mở thư mục chứa file"
                })]
              }), (0, t.jsxs)(f.Tooltip, {
                children: [(0, t.jsx)(f.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsx)(h.Button, {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive",
                    disabled: O,
                    "aria-label": "Xóa video đã tải",
                    onClick: () => void X(e, i, r?.reason === "already_queued"),
                    children: $ === e.id ? (0, t.jsx)(o.Loader2, {
                      className: "h-3.5 w-3.5 animate-spin"
                    }) : (0, t.jsx)(c.Trash2, {
                      className: "h-3.5 w-3.5"
                    })
                  })
                }), (0, t.jsx)(f.TooltipContent, {
                  children: "Xóa file khỏi máy và khỏi lịch sử"
                })]
              })]
            }, e.id)
          })
        })
      })]
    })
  }], 30372)
}, 24360, e => {
  "use strict";
  var t = e.i(43476),
    r = e.i(71645),
    a = e.i(53851),
    n = e.i(87486),
    i = e.i(77572),
    l = e.i(62368),
    s = e.i(56420);
  let o = (0, s.default)("list-video", [
    ["path", {
      d: "M21 5H3",
      key: "1fi0y6"
    }],
    ["path", {
      d: "M10 12H3",
      key: "1ulcyk"
    }],
    ["path", {
      d: "M10 19H3",
      key: "108z41"
    }],
    ["path", {
      d: "M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z",
      key: "ms4nik"
    }]
  ]);
  var d = e.i(32781),
    c = e.i(21357),
    u = e.i(66595),
    h = e.i(63676),
    f = e.i(19455),
    m = e.i(57428),
    p = e.i(93479),
    x = e.i(81469),
    g = e.i(78422),
    v = e.i(75157),
    b = e.i(80345);
  let y = {
      pending: "Chờ",
      downloading: "Đang tải",
      done: "Xong",
      error: "Lỗi"
    },
    w = {
      pending: "secondary",
      downloading: "info",
      done: "success",
      error: "destructive"
    };

  function k() {
    let e = (0, b.usePlatformDownloadStore)(e => e.history),
      a = (0, b.usePlatformDownloadStore)(e => e.channel),
      i = (0, b.usePlatformDownloadStore)(e => e.channelLoading),
      s = (0, b.usePlatformDownloadStore)(e => e.channelItemStatus),
      k = (0, b.usePlatformDownloadStore)(e => e.channelBatchRunning),
      j = (0, b.usePlatformDownloadStore)(e => e.channelBatchSummary),
      N = (0, b.usePlatformDownloadStore)(e => e.listChannel),
      S = (0, b.usePlatformDownloadStore)(e => e.clearChannel),
      C = (0, b.usePlatformDownloadStore)(e => e.downloadChannelItems),
      D = (0, b.usePlatformDownloadStore)(e => e.cancelChannelBatch),
      [P, T] = (0, r.useState)(""),
      [R, B] = (0, r.useState)(null),
      [I, M] = (0, r.useState)([]),
      [_, E] = (0, r.useState)(!1),
      L = (0, r.useMemo)(() => a?.items ?? [], [a]),
      z = (0, r.useMemo)(() => new Set(e.map(e => e.sourceUrl)), [e]),
      F = (0, r.useMemo)(() => L.filter(e => I.includes(e.url)), [L, I]),
      V = L.length > 0 && I.length === L.length,
      A = (0, r.useMemo)(() => L.filter(e => {
        let t = s[e.url]?.status;
        return "done" === t || "error" === t
      }).length, [L, s]),
      $ = async e => {
        let t = (e ?? P).trim();
        if ((0, x.isSupportedPlatformUrl)(t) && !i && !k) {
          B(null);
          try {
            await N(t);
            let e = b.usePlatformDownloadStore.getState().channel;
            M((e?.items ?? []).map(e => e.url)), E(!1)
          } catch (e) {
            M([]), B((0, g.platformChannelErrorMessage)(e))
          }
        }
      }, q = e => {
        M(t => t.includes(e.url) ? t.filter(t => t !== e.url) : [...t, e.url])
      }, H = j ? `${j.canceled?"Đã dừng":"Hoàn tất"}: đ\xe3 tải ${j.completed}/${j.total} video${j.failed>0?`, ${j.failed} lỗi`:""}` : null;
    return (0, t.jsxs)("section", {
      className: "space-y-3 rounded-lg border border-border bg-background/45 p-4",
      children: [(0, t.jsxs)("div", {
        className: "flex items-center gap-2",
        children: [(0, t.jsx)(o, {
          className: "h-4 w-4 shrink-0 text-muted-foreground"
        }), (0, t.jsxs)("div", {
          className: "min-w-0",
          children: [(0, t.jsx)("p", {
            className: "text-xs font-semibold",
            children: "Tải theo kênh / playlist"
          }), (0, t.jsx)("p", {
            className: "mt-0.5 text-[11px] text-muted-foreground",
            children: "Dán đường dẫn kênh, playlist hoặc trang cá nhân để chọn nhiều video cùng lúc."
          })]
        })]
      }), (0, t.jsxs)("div", {
        className: "flex gap-2",
        children: [(0, t.jsx)(p.Input, {
          value: P,
          onChange: e => {
            T(e.target.value), B(null)
          },
          onPaste: e => {
            let t = e.clipboardData.getData("text").trim();
            (0, x.isSupportedPlatformUrl)(t) && (T(t), $(t))
          },
          onKeyDown: e => {
            "Enter" === e.key && $()
          },
          placeholder: "Dán đường dẫn kênh, playlist hoặc trang cá nhân...",
          disabled: i || k
        }), (0, t.jsxs)(f.Button, {
          type: "button",
          className: "shrink-0",
          disabled: i || k || !(0, x.isSupportedPlatformUrl)(P),
          onClick: () => void $(),
          children: [i ? (0, t.jsx)(d.Loader2, {
            className: "h-4 w-4 animate-spin"
          }) : (0, t.jsx)(u.Search, {
            className: "h-4 w-4"
          }), "Lấy danh sách"]
        })]
      }), i ? (0, t.jsxs)("p", {
        className: "flex items-center gap-1.5 text-xs text-muted-foreground",
        children: [(0, t.jsx)(d.Loader2, {
          className: "h-3.5 w-3.5 animate-spin"
        }), "Đang lấy danh sách video..."]
      }) : null, R ? (0, t.jsx)("p", {
        className: "text-xs text-destructive",
        children: R
      }) : null, a ? (0, t.jsxs)("div", {
        className: "space-y-3",
        children: [(0, t.jsxs)("div", {
          className: "flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3",
          children: [(0, t.jsx)("p", {
            className: "text-[11px] text-muted-foreground",
            children: [(0, x.platformSourceLabel)(a.source ?? ""), `${L.length} video`].filter(Boolean).join(" · ")
          }), (0, t.jsxs)("div", {
            className: "flex items-center gap-1",
            children: [L.length > 1 ? (0, t.jsx)(f.Button, {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-7 px-2 text-[11px]",
              disabled: k,
              onClick: () => {
                M(V ? [] : L.map(e => e.url))
              },
              children: V ? "Bỏ chọn tất cả" : "Chọn tất cả"
            }) : null, (0, t.jsxs)(f.Button, {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-7 px-2 text-[11px]",
              disabled: k,
              onClick: () => {
                S(), M([])
              },
              children: [(0, t.jsx)(h.X, {
                className: "h-3.5 w-3.5"
              }), "Đóng"]
            })]
          })]
        }), 0 === L.length ? (0, t.jsx)("p", {
          className: "rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground",
          children: "Không tìm thấy video nào trong đường dẫn này."
        }) : (0, t.jsx)("div", {
          className: "divide-y divide-border rounded-md border border-border",
          children: L.map(e => {
            let r = I.includes(e.url),
              a = s[e.url],
              i = z.has(e.url),
              l = e.title?.trim() || e.url;
            return (0, t.jsxs)("div", {
              className: (0, v.cn)("flex items-center gap-3 px-3 py-2", r ? "bg-primary/5" : "bg-transparent"),
              children: [(0, t.jsx)(m.Checkbox, {
                checked: r,
                disabled: k,
                onCheckedChange: () => q(e),
                "aria-label": `Chọn ${l}`,
                className: "shrink-0"
              }), (0, t.jsxs)("button", {
                type: "button",
                disabled: k,
                onClick: () => q(e),
                className: (0, v.cn)("flex min-w-0 flex-1 items-center gap-3 text-left", k && "cursor-not-allowed opacity-70"),
                children: [(0, t.jsx)("div", {
                  className: "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
                  children: e.thumbnail ? (0, t.jsx)("img", {
                    src: e.thumbnail,
                    alt: l,
                    className: "h-full w-full object-cover"
                  }) : (0, t.jsx)(c.Play, {
                    className: "h-4 w-4 text-muted-foreground"
                  })
                }), (0, t.jsxs)("div", {
                  className: "min-w-0 flex-1",
                  children: [(0, t.jsx)("p", {
                    className: "truncate text-xs font-semibold",
                    children: l
                  }), (0, t.jsx)("p", {
                    className: (0, v.cn)("mt-0.5 truncate text-[11px]", a?.status === "error" ? "text-destructive" : "text-muted-foreground"),
                    children: a?.status === "error" && a.error ? a.error : e.url
                  })]
                })]
              }), i ? (0, t.jsx)(n.Badge, {
                variant: "secondary",
                className: "shrink-0",
                children: "Đã tải"
              }) : null, a ? (0, t.jsxs)(n.Badge, {
                variant: w[a.status],
                className: "shrink-0 gap-1",
                children: ["downloading" === a.status ? (0, t.jsx)(d.Loader2, {
                  className: "h-3 w-3 animate-spin"
                }) : null, y[a.status]]
              }) : null]
            }, e.url)
          })
        }), L.length > 0 ? (0, t.jsxs)(t.Fragment, {
          children: [(0, t.jsxs)("label", {
            className: "flex items-start gap-2 text-xs text-muted-foreground",
            children: [(0, t.jsx)(m.Checkbox, {
              checked: _,
              disabled: k,
              onCheckedChange: e => E(!0 === e),
              className: "mt-0.5"
            }), (0, t.jsx)("span", {
              children: "Tôi xác nhận có quyền sử dụng các video này và tự chịu trách nhiệm về bản quyền."
            })]
          }), (0, t.jsx)("div", {
            className: "flex flex-wrap items-center gap-2",
            children: k ? (0, t.jsxs)(t.Fragment, {
              children: [(0, t.jsx)("p", {
                className: "text-xs text-muted-foreground",
                children: `Đang tải ${A}/${F.length||L.length} video`
              }), (0, t.jsxs)(f.Button, {
                type: "button",
                variant: "outline",
                className: "shrink-0",
                onClick: D,
                children: [(0, t.jsx)(h.X, {
                  className: "h-4 w-4"
                }), "Dừng tải"]
              })]
            }) : (0, t.jsxs)(f.Button, {
              type: "button",
              className: "shrink-0",
              disabled: !_ || 0 === F.length,
              onClick: () => {
                _ && 0 !== F.length && !k && (B(null), C({
                  items: F
                }))
              },
              children: [(0, t.jsx)(l.Download, {
                className: "h-4 w-4"
              }), `Tải ${F.length} video`]
            })
          })]
        }) : null, H ? (0, t.jsx)("p", {
          className: "text-xs text-muted-foreground",
          children: H
        }) : null]
      }) : null]
    })
  }
  let j = (0, s.default)("scan-search", [
    ["path", {
      d: "M3 7V5a2 2 0 0 1 2-2h2",
      key: "aa7l1z"
    }],
    ["path", {
      d: "M17 3h2a2 2 0 0 1 2 2v2",
      key: "4qcy5o"
    }],
    ["path", {
      d: "M21 17v2a2 2 0 0 1-2 2h-2",
      key: "6vwrx8"
    }],
    ["path", {
      d: "M7 21H5a2 2 0 0 1-2-2v-2",
      key: "ioqczr"
    }],
    ["circle", {
      cx: "12",
      cy: "12",
      r: "3",
      key: "1v7zrd"
    }],
    ["path", {
      d: "m16 16-1.9-1.9",
      key: "1dq9hf"
    }]
  ]);
  var N = e.i(46696),
    S = e.i(24687);

  function C() {
    let e = (0, b.usePlatformDownloadStore)(e => e.extract),
      a = (0, b.usePlatformDownloadStore)(e => e.downloadLinks),
      n = (0, b.usePlatformDownloadStore)(e => e.linksBatchRunning),
      i = (0, b.usePlatformDownloadStore)(e => e.channelBatchRunning),
      [l, s] = (0, r.useState)(""),
      [o, u] = (0, r.useState)(null),
      [p, y] = (0, r.useState)([]),
      [w, k] = (0, r.useState)([]),
      [C, D] = (0, r.useState)(!1),
      [P, T] = (0, r.useState)(null),
      R = null !== o,
      B = n || i,
      {
        valid: I,
        skipped: M
      } = (0, r.useMemo)(() => (function(e) {
        let t = new Set,
          r = 0,
          a = [];
        for (let n of e.split(/\r?\n/)) {
          let e = n.trim();
          if (e) {
            if (!(0, x.isSupportedPlatformUrl)(e) || t.has(e)) {
              r += 1;
              continue
            }
            t.add(e), a.push(e)
          }
        }
        return {
          valid: a,
          skipped: r
        }
      })(l), [l]),
      _ = (0, r.useMemo)(() => p.filter(e => e.checked), [p]),
      E = p.length > 0 && _.length === p.length,
      L = async () => {
        if (R || 0 === I.length) return;
        T(null), y([]), k([]), D(!1);
        let t = [],
          r = [];
        for (let [a, n] of I.entries()) {
          u({
            index: a + 1,
            total: I.length
          });
          try {
            let r = await e(n);
            t.push({
              url: n,
              info: r,
              checked: !0
            })
          } catch (e) {
            r.push({
              url: n,
              message: (0, g.platformExtractErrorMessage)(e)
            })
          }
          y([...t]), k([...r])
        }
        u(null), 0 === t.length && T("Không quét được link nào — kiểm tra lại đường dẫn.")
      }, z = async () => {
        if (!C || 0 === _.length || B) return;
        let e = _.map(e => ({
          url: e.url,
          info: e.info
        }));
        s(""), y([]), k([]), D(!1), N.toast.success(`Đ\xe3 th\xeam ${e.length} lượt tải`, {
          description: "Các video sẽ tải lần lượt — xem tiến trình ở mục Lượt tải bên dưới."
        }), await a({
          items: e
        })
      };
    return (0, t.jsxs)("div", {
      className: "space-y-3 rounded-lg border border-border bg-background/45 p-4",
      children: [(0, t.jsx)(S.Textarea, {
        value: l,
        onChange: e => {
          s(e.target.value), T(null)
        },
        placeholder: "Dán link video cần tải (mỗi dòng 1 link) — YouTube, TikTok, Facebook...",
        disabled: R,
        className: "min-h-20 text-xs"
      }), (0, t.jsxs)("div", {
        className: "flex items-center justify-between gap-2",
        children: [(0, t.jsx)("p", {
          className: "text-[11px] text-muted-foreground",
          children: M > 0 ? `${I.length} link hợp lệ \xb7 bỏ qua ${M} d\xf2ng` : I.length > 0 ? `${I.length} link hợp lệ` : "Mỗi dòng một link video."
        }), (0, t.jsxs)(f.Button, {
          type: "button",
          size: "sm",
          className: "h-8 shrink-0",
          disabled: R || 0 === I.length,
          onClick: () => void L(),
          children: [R ? (0, t.jsx)(d.Loader2, {
            className: "h-3.5 w-3.5 animate-spin"
          }) : (0, t.jsx)(j, {
            className: "h-3.5 w-3.5"
          }), R ? `Đang qu\xe9t ${o.index}/${o.total}` : "Quét link"]
        })]
      }), P ? (0, t.jsx)("p", {
        className: "text-xs text-destructive",
        children: P
      }) : null, w.length > 0 ? (0, t.jsx)("div", {
        className: "space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2",
        children: w.map(e => (0, t.jsxs)("div", {
          className: "flex items-center gap-2 text-[11px]",
          children: [(0, t.jsxs)("span", {
            className: "min-w-0 flex-1 truncate text-muted-foreground",
            children: [e.url, " — ", e.message]
          }), (0, t.jsx)("button", {
            type: "button",
            "aria-label": "Bỏ qua link lỗi này",
            className: "shrink-0 text-muted-foreground hover:text-foreground",
            onClick: () => k(t => t.filter(t => t.url !== e.url)),
            children: (0, t.jsx)(h.X, {
              className: "h-3 w-3"
            })
          })]
        }, e.url))
      }) : null, p.length > 0 ? (0, t.jsxs)("div", {
        className: "space-y-2",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center justify-between",
          children: [(0, t.jsxs)("p", {
            className: "text-xs font-semibold",
            children: [p.length, " video"]
          }), (0, t.jsx)(f.Button, {
            type: "button",
            variant: "ghost",
            size: "sm",
            className: "h-6 px-2 text-[11px]",
            onClick: () => {
              let e = !E;
              y(t => t.map(t => ({
                ...t,
                checked: e
              })))
            },
            children: E ? "Bỏ chọn tất cả" : "Chọn tất cả"
          })]
        }), (0, t.jsx)("div", {
          className: "divide-y divide-border rounded-md border border-border",
          children: p.map(e => (0, t.jsxs)("div", {
            className: "flex items-center gap-3 px-3 py-2",
            children: [(0, t.jsx)(m.Checkbox, {
              checked: e.checked,
              onCheckedChange: t => y(r => r.map(r => r.url === e.url ? {
                ...r,
                checked: !0 === t
              } : r)),
              "aria-label": `Chọn ${e.info.title}`,
              className: "shrink-0"
            }), (0, t.jsx)("div", {
              className: "flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary",
              children: e.info.thumbnail ? (0, t.jsx)("img", {
                src: e.info.thumbnail,
                alt: e.info.title,
                className: "h-full w-full object-cover"
              }) : (0, t.jsx)(c.Play, {
                className: "h-4 w-4 text-muted-foreground"
              })
            }), (0, t.jsxs)("div", {
              className: "min-w-0 flex-1",
              children: [(0, t.jsx)("p", {
                className: "line-clamp-2 text-xs font-semibold",
                children: e.info.title
              }), (0, t.jsx)("p", {
                className: "mt-0.5 truncate text-[11px] text-muted-foreground",
                children: [(0, x.platformSourceLabel)(e.info.source), e.info.author, null !== e.info.duration ? (0, v.formatDuration)(e.info.duration) : null].filter(Boolean).join(" · ")
              })]
            }), (0, t.jsx)("button", {
              type: "button",
              "aria-label": "Bỏ video này",
              className: "shrink-0 text-muted-foreground hover:text-foreground",
              onClick: () => y(t => t.filter(t => t.url !== e.url)),
              children: (0, t.jsx)(h.X, {
                className: "h-3.5 w-3.5"
              })
            })]
          }, e.url))
        }), (0, t.jsxs)("label", {
          className: "flex items-start gap-2 text-xs text-muted-foreground",
          children: [(0, t.jsx)(m.Checkbox, {
            checked: C,
            onCheckedChange: e => D(!0 === e),
            className: "mt-0.5"
          }), (0, t.jsx)("span", {
            children: "Tôi xác nhận có quyền sử dụng các video này và tự chịu trách nhiệm về bản quyền."
          })]
        }), (0, t.jsxs)(f.Button, {
          type: "button",
          className: "w-full",
          disabled: !C || 0 === _.length || B,
          onClick: () => void z(),
          children: [B ? (0, t.jsx)(d.Loader2, {
            className: "h-4 w-4 animate-spin"
          }) : null, "Tải ", _.length, " mục"]
        })]
      }) : null]
    })
  }
  var D = e.i(88901),
    P = e.i(95925),
    T = e.i(68148),
    R = e.i(30372);

  function B() {
    let e = (0, b.usePlatformDownloadStore)(e => e.active),
      a = (0, b.usePlatformDownloadStore)(e => e.history),
      i = (0, b.usePlatformDownloadStore)(e => e.linksBatch),
      l = (0, b.usePlatformDownloadStore)(e => e.linksBatchRunning),
      s = (0, b.usePlatformDownloadStore)(e => e.linksBatchSummary),
      o = (0, b.usePlatformDownloadStore)(e => e.channelBatchRunning),
      c = (0, b.usePlatformDownloadStore)(e => e.channelBatchSummary),
      u = (0, b.usePlatformDownloadStore)(e => e.cancel),
      m = (0, b.usePlatformDownloadStore)(e => e.cancelLinksBatch),
      p = (0, b.usePlatformDownloadStore)(e => e.cancelChannelBatch),
      x = (0, b.usePlatformDownloadStore)(e => e.retryLinksItem),
      y = (0, b.usePlatformDownloadStore)(e => e.clearLinksBatch),
      [w, k] = (0, r.useState)("running"),
      j = Object.entries(e),
      N = (0, r.useMemo)(() => i.filter(e => "pending" === e.status || "downloading" === e.status), [i]),
      S = (0, r.useMemo)(() => i.filter(e => "error" === e.status || "cancelled" === e.status), [i]),
      C = l || o,
      [B, I] = (0, r.useState)(C);
    C !== B && (I(C), C && k("running"));
    let M = j.length + N.length,
      _ = s ?? c,
      E = _ ? `${_.canceled?"Đã dừng":"Hoàn tất"}: đ\xe3 tải ${_.completed}/${_.total} video${_.failed>0?`, ${_.failed} lỗi`:""}` : null,
      L = [{
        key: "running",
        label: "Đang chạy",
        count: M
      }, {
        key: "done",
        label: "Hoàn tất",
        count: a.length
      }, {
        key: "failed",
        label: "Lỗi / Đã hủy",
        count: S.length
      }];
    return (0, t.jsxs)("section", {
      className: "overflow-hidden rounded-lg border border-border bg-background/45",
      children: [(0, t.jsxs)("div", {
        className: "flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2",
        children: [(0, t.jsxs)("div", {
          className: "flex min-w-0 items-center gap-2",
          children: [(0, t.jsx)(D.FolderDown, {
            className: "h-4 w-4 shrink-0 text-muted-foreground"
          }), (0, t.jsx)("p", {
            className: "truncate text-xs font-semibold",
            children: "Lượt tải"
          })]
        }), (0, t.jsx)("div", {
          className: "flex items-center gap-1",
          children: L.map(e => (0, t.jsxs)("button", {
            type: "button",
            onClick: () => k(e.key),
            className: (0, v.cn)("rounded-md px-2 py-1 text-[11px] font-medium", w === e.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"),
            children: [e.label, " (", e.count, ")"]
          }, e.key))
        })]
      }), "running" === w ? (0, t.jsxs)("div", {
        className: "space-y-2 p-3",
        children: [C ? (0, t.jsxs)("div", {
          className: "flex items-center justify-between gap-2",
          children: [(0, t.jsxs)("p", {
            className: "flex items-center gap-1.5 text-xs text-muted-foreground",
            children: [(0, t.jsx)(d.Loader2, {
              className: "h-3.5 w-3.5 animate-spin"
            }), "Đang tải lần lượt từng video..."]
          }), (0, t.jsxs)(f.Button, {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "h-7 shrink-0 text-xs",
            onClick: l ? m : p,
            children: [(0, t.jsx)(h.X, {
              className: "h-3.5 w-3.5"
            }), "Dừng tất cả"]
          })]
        }) : null, j.map(([e, r]) => {
          let a = (0, g.platformDownloadProgressPercent)(r.downloadedBytes, r.totalBytes);
          return (0, t.jsxs)("div", {
            className: "space-y-1.5 rounded-md border border-border p-3",
            children: [(0, t.jsxs)("div", {
              className: "flex items-center justify-between gap-2",
              children: [(0, t.jsx)("p", {
                className: "min-w-0 truncate text-sm font-medium",
                children: r.title
              }), (0, t.jsxs)(f.Button, {
                type: "button",
                size: "sm",
                variant: "ghost",
                className: "h-7 shrink-0 px-2 text-xs",
                onClick: () => void u(e),
                children: [(0, t.jsx)(h.X, {
                  className: "h-3.5 w-3.5"
                }), "Hủy"]
              })]
            }), (0, t.jsx)(T.Progress, {
              value: a ?? 100,
              className: (0, v.cn)("h-1.5", null === a && "animate-pulse")
            }), (0, t.jsx)("p", {
              className: "text-xs text-muted-foreground",
              children: null !== a && null !== r.totalBytes ? `${(0,v.formatFileSize)(r.downloadedBytes)} / ${(0,v.formatFileSize)(r.totalBytes)} (${a}%)` : (0, v.formatFileSize)(r.downloadedBytes)
            })]
          }, e)
        }), N.filter(e => "pending" === e.status).map(e => (0, t.jsxs)("div", {
          className: "flex items-center gap-3 rounded-md border border-border px-3 py-2",
          children: [(0, t.jsxs)("div", {
            className: "min-w-0 flex-1",
            children: [(0, t.jsx)("p", {
              className: "truncate text-xs font-medium",
              children: e.info.title
            }), (0, t.jsx)("p", {
              className: "mt-0.5 truncate text-[11px] text-muted-foreground",
              children: e.url
            })]
          }), (0, t.jsx)(n.Badge, {
            variant: "secondary",
            className: "shrink-0",
            children: "Chờ"
          })]
        }, e.url)), C || 0 !== M ? null : (0, t.jsxs)("div", {
          className: "space-y-1 px-1 py-3 text-center",
          children: [(0, t.jsx)("p", {
            className: "text-xs text-muted-foreground",
            children: "Không có lượt tải nào đang chạy."
          }), E ? (0, t.jsx)("p", {
            className: "text-[11px] text-muted-foreground",
            children: E
          }) : null]
        })]
      }) : null, "done" === w ? (0, t.jsx)("div", {
        className: "p-3",
        children: (0, t.jsx)(R.DownloadedVideoList, {
          entries: a
        })
      }) : null, "failed" === w ? (0, t.jsxs)("div", {
        className: "space-y-2 p-3",
        children: [S.length > 0 ? (0, t.jsx)("div", {
          className: "flex justify-end",
          children: (0, t.jsx)(f.Button, {
            type: "button",
            variant: "ghost",
            size: "sm",
            className: "h-7 px-2 text-[11px]",
            disabled: C,
            onClick: y,
            children: "Xóa tất cả"
          })
        }) : null, S.map(e => (0, t.jsxs)("div", {
          className: "flex items-center gap-3 rounded-md border border-border px-3 py-2",
          children: [(0, t.jsxs)("div", {
            className: "min-w-0 flex-1",
            children: [(0, t.jsx)("p", {
              className: "truncate text-xs font-medium",
              children: e.info.title
            }), (0, t.jsx)("p", {
              className: "mt-0.5 truncate text-[11px] text-destructive",
              children: "cancelled" === e.status ? "Đã hủy lượt tải này." : e.error ?? "Tải thất bại."
            })]
          }), (0, t.jsxs)(f.Button, {
            type: "button",
            variant: "ghost",
            size: "sm",
            className: "h-7 shrink-0 px-2 text-xs",
            disabled: C,
            onClick: () => void x(e.url),
            children: [(0, t.jsx)(P.RotateCcw, {
              className: "h-3.5 w-3.5"
            }), "Thử lại"]
          })]
        }, e.url)), 0 === S.length ? (0, t.jsx)("p", {
          className: "px-1 py-3 text-center text-xs text-muted-foreground",
          children: "Không có lượt tải lỗi hoặc đã hủy."
        }) : null]
      }) : null]
    })
  }
  e.i(89268);
  var I = e.i(81341),
    M = e.i(1975);
  e.s(["DownloadPage", 0, function() {
    return (0, r.useEffect)(() => {
      (0, M.warmPlatformConnection)()
    }, []), (0, t.jsx)("div", {
      "data-testid": "desktop-view-download",
      className: "h-full overflow-y-auto bg-background",
      children: (0, t.jsxs)("div", {
        className: "mx-auto flex max-w-3xl flex-col gap-4 px-5 py-4",
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-3 border-b border-border pb-3",
          children: [(0, t.jsx)("div", {
            className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary",
            children: (0, t.jsx)(a.CloudDownload, {
              className: "h-4.5 w-4.5"
            })
          }), (0, t.jsxs)("div", {
            className: "min-w-0",
            children: [(0, t.jsx)("h1", {
              className: "text-base font-semibold",
              children: "Tải video"
            }), (0, t.jsx)("p", {
              className: "text-xs text-muted-foreground",
              children: "Tải video về máy từ các nền tảng được hỗ trợ."
            }), (0, t.jsxs)("div", {
              className: "mt-1.5 flex flex-wrap items-center gap-1",
              "data-testid": "supported-platforms",
              children: [x.SUPPORTED_PLATFORM_NAMES.map(e => (0, t.jsx)(n.Badge, {
                variant: "secondary",
                className: "h-5 px-1.5 text-[10px] font-normal",
                children: e
              }, e)), (0, t.jsx)("span", {
                className: "text-[10px] text-muted-foreground",
                children: "và hàng trăm nền tảng khác"
              })]
            })]
          })]
        }), (0, I.isTauri)() ? (0, t.jsxs)(t.Fragment, {
          children: [(0, t.jsxs)(i.Tabs, {
            defaultValue: "links",
            children: [(0, t.jsxs)(i.TabsList, {
              className: "w-full",
              children: [(0, t.jsx)(i.TabsTrigger, {
                value: "links",
                className: "flex-1",
                children: "Video"
              }), (0, t.jsx)(i.TabsTrigger, {
                value: "channel",
                className: "flex-1",
                children: "Kênh / Playlist"
              })]
            }), (0, t.jsx)(i.TabsContent, {
              value: "links",
              children: (0, t.jsx)(C, {})
            }), (0, t.jsx)(i.TabsContent, {
              value: "channel",
              children: (0, t.jsx)(k, {})
            })]
          }), (0, t.jsx)(B, {})]
        }) : (0, t.jsx)("p", {
          className: "rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground",
          children: "Tính năng tải video chỉ khả dụng trong ứng dụng DichVideo trên máy tính."
        })]
      })
    })
  }], 24360)
}]);