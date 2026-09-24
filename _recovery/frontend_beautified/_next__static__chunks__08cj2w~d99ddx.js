(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 68270, 35952, e => {
  "use strict";
  var i, t, n, l, s, a, r, o, u, h, c, w, b = e.i(86682);
  class d {
    constructor(...e) {
      this.type = "Logical", 1 === e.length ? "Logical" in e[0] ? (this.width = e[0].Logical.width, this.height = e[0].Logical.height) : (this.width = e[0].width, this.height = e[0].height) : (this.width = e[0], this.height = e[1])
    }
    toPhysical(e) {
      return new p(this.width * e, this.height * e)
    } [b.SERIALIZE_TO_IPC_FN]() {
      return {
        width: this.width,
        height: this.height
      }
    }
    toJSON() {
      return this[b.SERIALIZE_TO_IPC_FN]()
    }
  }
  class p {
    constructor(...e) {
      this.type = "Physical", 1 === e.length ? "Physical" in e[0] ? (this.width = e[0].Physical.width, this.height = e[0].Physical.height) : (this.width = e[0].width, this.height = e[0].height) : (this.width = e[0], this.height = e[1])
    }
    toLogical(e) {
      return new d(this.width / e, this.height / e)
    } [b.SERIALIZE_TO_IPC_FN]() {
      return {
        width: this.width,
        height: this.height
      }
    }
    toJSON() {
      return this[b.SERIALIZE_TO_IPC_FN]()
    }
  }
  class v {
    constructor(e) {
      this.size = e
    }
    toLogical(e) {
      return this.size instanceof d ? this.size : this.size.toLogical(e)
    }
    toPhysical(e) {
      return this.size instanceof p ? this.size : this.size.toPhysical(e)
    } [b.SERIALIZE_TO_IPC_FN]() {
      return {
        [`${this.size.type}`]: {
          width: this.size.width,
          height: this.size.height
        }
      }
    }
    toJSON() {
      return this[b.SERIALIZE_TO_IPC_FN]()
    }
  }
  class y {
    constructor(...e) {
      this.type = "Logical", 1 === e.length ? "Logical" in e[0] ? (this.x = e[0].Logical.x, this.y = e[0].Logical.y) : (this.x = e[0].x, this.y = e[0].y) : (this.x = e[0], this.y = e[1])
    }
    toPhysical(e) {
      return new g(this.x * e, this.y * e)
    } [b.SERIALIZE_TO_IPC_FN]() {
      return {
        x: this.x,
        y: this.y
      }
    }
    toJSON() {
      return this[b.SERIALIZE_TO_IPC_FN]()
    }
  }
  class g {
    constructor(...e) {
      this.type = "Physical", 1 === e.length ? "Physical" in e[0] ? (this.x = e[0].Physical.x, this.y = e[0].Physical.y) : (this.x = e[0].x, this.y = e[0].y) : (this.x = e[0], this.y = e[1])
    }
    toLogical(e) {
      return new y(this.x / e, this.y / e)
    } [b.SERIALIZE_TO_IPC_FN]() {
      return {
        x: this.x,
        y: this.y
      }
    }
    toJSON() {
      return this[b.SERIALIZE_TO_IPC_FN]()
    }
  }
  class _ {
    constructor(e) {
      this.position = e
    }
    toLogical(e) {
      return this.position instanceof y ? this.position : this.position.toLogical(e)
    }
    toPhysical(e) {
      return this.position instanceof g ? this.position : this.position.toPhysical(e)
    } [b.SERIALIZE_TO_IPC_FN]() {
      return {
        [`${this.position.type}`]: {
          x: this.position.x,
          y: this.position.y
        }
      }
    }
    toJSON() {
      return this[b.SERIALIZE_TO_IPC_FN]()
    }
  }
  var k = e.i(8325),
    m = b;
  class f extends m.Resource {
    constructor(e) {
      super(e)
    }
    static async new(e, i, t) {
      return (0, m.invoke)("plugin:image|new", {
        rgba: E(e),
        width: i,
        height: t
      }).then(e => new f(e))
    }
    static async fromBytes(e) {
      return (0, m.invoke)("plugin:image|from_bytes", {
        bytes: E(e)
      }).then(e => new f(e))
    }
    static async fromPath(e) {
      return (0, m.invoke)("plugin:image|from_path", {
        path: e
      }).then(e => new f(e))
    }
    async rgba() {
      return (0, m.invoke)("plugin:image|rgba", {
        rid: this.rid
      }).then(e => new Uint8Array(e))
    }
    async size() {
      return (0, m.invoke)("plugin:image|size", {
        rid: this.rid
      })
    }
  }

  function E(e) {
    return null == e ? null : "string" == typeof e ? e : e instanceof f ? e.rid : e
  }(i = r || (r = {}))[i.Critical = 1] = "Critical", i[i.Informational = 2] = "Informational";
  class z {
    constructor(e) {
      this._preventDefault = !1, this.event = e.event, this.id = e.id
    }
    preventDefault() {
      this._preventDefault = !0
    }
    isPreventDefault() {
      return this._preventDefault
    }
  }

  function T() {
    return new O(window.__TAURI_INTERNALS__.metadata.currentWindow.label, {
      skip: !0
    })
  }
  async function I() {
    return (0, b.invoke)("plugin:window|get_all_windows").then(e => e.map(e => new O(e, {
      skip: !0
    })))
  }(t = o || (o = {})).None = "none", t.Normal = "normal", t.Indeterminate = "indeterminate", t.Paused = "paused", t.Error = "error";
  let A = ["tauri://created", "tauri://error"];
  class O {
    constructor(e, i = {}) {
      var t;
      this.label = e, this.listeners = Object.create(null), (null == i ? void 0 : i.skip) || (0, b.invoke)("plugin:window|create", {
        options: {
          ...i,
          parent: "string" == typeof i.parent ? i.parent : null == (t = i.parent) ? void 0 : t.label,
          label: e
        }
      }).then(async () => this.emit("tauri://created")).catch(async e => this.emit("tauri://error", e))
    }
    static async getByLabel(e) {
      var i;
      return null != (i = (await I()).find(i => i.label === e)) ? i : null
    }
    static getCurrent() {
      return T()
    }
    static async getAll() {
      return I()
    }
    static async getFocusedWindow() {
      for (let e of (await I()))
        if (await e.isFocused()) return e;
      return null
    }
    async listen(e, i) {
      return this._handleTauriEvent(e, i) ? () => {
        let t = this.listeners[e];
        t.splice(t.indexOf(i), 1)
      } : (0, k.listen)(e, i, {
        target: {
          kind: "Window",
          label: this.label
        }
      })
    }
    async once(e, i) {
      return this._handleTauriEvent(e, i) ? () => {
        let t = this.listeners[e];
        t.splice(t.indexOf(i), 1)
      } : (0, k.once)(e, i, {
        target: {
          kind: "Window",
          label: this.label
        }
      })
    }
    async emit(e, i) {
      if (A.includes(e)) {
        for (let t of this.listeners[e] || []) t({
          event: e,
          id: -1,
          payload: i
        });
        return
      }
      return (0, k.emit)(e, i)
    }
    async emitTo(e, i, t) {
      if (A.includes(i)) {
        for (let e of this.listeners[i] || []) e({
          event: i,
          id: -1,
          payload: t
        });
        return
      }
      return (0, k.emitTo)(e, i, t)
    }
    _handleTauriEvent(e, i) {
      return !!A.includes(e) && (e in this.listeners ? this.listeners[e].push(i) : this.listeners[e] = [i], !0)
    }
    async scaleFactor() {
      return (0, b.invoke)("plugin:window|scale_factor", {
        label: this.label
      })
    }
    async innerPosition() {
      return (0, b.invoke)("plugin:window|inner_position", {
        label: this.label
      }).then(e => new g(e))
    }
    async outerPosition() {
      return (0, b.invoke)("plugin:window|outer_position", {
        label: this.label
      }).then(e => new g(e))
    }
    async innerSize() {
      return (0, b.invoke)("plugin:window|inner_size", {
        label: this.label
      }).then(e => new p(e))
    }
    async outerSize() {
      return (0, b.invoke)("plugin:window|outer_size", {
        label: this.label
      }).then(e => new p(e))
    }
    async isFullscreen() {
      return (0, b.invoke)("plugin:window|is_fullscreen", {
        label: this.label
      })
    }
    async isMinimized() {
      return (0, b.invoke)("plugin:window|is_minimized", {
        label: this.label
      })
    }
    async isMaximized() {
      return (0, b.invoke)("plugin:window|is_maximized", {
        label: this.label
      })
    }
    async isFocused() {
      return (0, b.invoke)("plugin:window|is_focused", {
        label: this.label
      })
    }
    async isDecorated() {
      return (0, b.invoke)("plugin:window|is_decorated", {
        label: this.label
      })
    }
    async isResizable() {
      return (0, b.invoke)("plugin:window|is_resizable", {
        label: this.label
      })
    }
    async isMaximizable() {
      return (0, b.invoke)("plugin:window|is_maximizable", {
        label: this.label
      })
    }
    async isMinimizable() {
      return (0, b.invoke)("plugin:window|is_minimizable", {
        label: this.label
      })
    }
    async isClosable() {
      return (0, b.invoke)("plugin:window|is_closable", {
        label: this.label
      })
    }
    async isVisible() {
      return (0, b.invoke)("plugin:window|is_visible", {
        label: this.label
      })
    }
    async title() {
      return (0, b.invoke)("plugin:window|title", {
        label: this.label
      })
    }
    async theme() {
      return (0, b.invoke)("plugin:window|theme", {
        label: this.label
      })
    }
    async isAlwaysOnTop() {
      return (0, b.invoke)("plugin:window|is_always_on_top", {
        label: this.label
      })
    }
    async center() {
      return (0, b.invoke)("plugin:window|center", {
        label: this.label
      })
    }
    async requestUserAttention(e) {
      let i = null;
      return e && (i = e === r.Critical ? {
        type: "Critical"
      } : {
        type: "Informational"
      }), (0, b.invoke)("plugin:window|request_user_attention", {
        label: this.label,
        value: i
      })
    }
    async setResizable(e) {
      return (0, b.invoke)("plugin:window|set_resizable", {
        label: this.label,
        value: e
      })
    }
    async setEnabled(e) {
      return (0, b.invoke)("plugin:window|set_enabled", {
        label: this.label,
        value: e
      })
    }
    async isEnabled() {
      return (0, b.invoke)("plugin:window|is_enabled", {
        label: this.label
      })
    }
    async setMaximizable(e) {
      return (0, b.invoke)("plugin:window|set_maximizable", {
        label: this.label,
        value: e
      })
    }
    async setMinimizable(e) {
      return (0, b.invoke)("plugin:window|set_minimizable", {
        label: this.label,
        value: e
      })
    }
    async setClosable(e) {
      return (0, b.invoke)("plugin:window|set_closable", {
        label: this.label,
        value: e
      })
    }
    async setTitle(e) {
      return (0, b.invoke)("plugin:window|set_title", {
        label: this.label,
        value: e
      })
    }
    async maximize() {
      return (0, b.invoke)("plugin:window|maximize", {
        label: this.label
      })
    }
    async unmaximize() {
      return (0, b.invoke)("plugin:window|unmaximize", {
        label: this.label
      })
    }
    async toggleMaximize() {
      return (0, b.invoke)("plugin:window|toggle_maximize", {
        label: this.label
      })
    }
    async minimize() {
      return (0, b.invoke)("plugin:window|minimize", {
        label: this.label
      })
    }
    async unminimize() {
      return (0, b.invoke)("plugin:window|unminimize", {
        label: this.label
      })
    }
    async show() {
      return (0, b.invoke)("plugin:window|show", {
        label: this.label
      })
    }
    async hide() {
      return (0, b.invoke)("plugin:window|hide", {
        label: this.label
      })
    }
    async close() {
      return (0, b.invoke)("plugin:window|close", {
        label: this.label
      })
    }
    async destroy() {
      return (0, b.invoke)("plugin:window|destroy", {
        label: this.label
      })
    }
    async setDecorations(e) {
      return (0, b.invoke)("plugin:window|set_decorations", {
        label: this.label,
        value: e
      })
    }
    async setShadow(e) {
      return (0, b.invoke)("plugin:window|set_shadow", {
        label: this.label,
        value: e
      })
    }
    async setEffects(e) {
      return (0, b.invoke)("plugin:window|set_effects", {
        label: this.label,
        value: e
      })
    }
    async clearEffects() {
      return (0, b.invoke)("plugin:window|set_effects", {
        label: this.label,
        value: null
      })
    }
    async setAlwaysOnTop(e) {
      return (0, b.invoke)("plugin:window|set_always_on_top", {
        label: this.label,
        value: e
      })
    }
    async setAlwaysOnBottom(e) {
      return (0, b.invoke)("plugin:window|set_always_on_bottom", {
        label: this.label,
        value: e
      })
    }
    async setContentProtected(e) {
      return (0, b.invoke)("plugin:window|set_content_protected", {
        label: this.label,
        value: e
      })
    }
    async setSize(e) {
      return (0, b.invoke)("plugin:window|set_size", {
        label: this.label,
        value: e instanceof v ? e : new v(e)
      })
    }
    async setMinSize(e) {
      return (0, b.invoke)("plugin:window|set_min_size", {
        label: this.label,
        value: e instanceof v ? e : e ? new v(e) : null
      })
    }
    async setMaxSize(e) {
      return (0, b.invoke)("plugin:window|set_max_size", {
        label: this.label,
        value: e instanceof v ? e : e ? new v(e) : null
      })
    }
    async setSizeConstraints(e) {
      function i(e) {
        return e ? {
          Logical: e
        } : null
      }
      return (0, b.invoke)("plugin:window|set_size_constraints", {
        label: this.label,
        value: {
          minWidth: i(null == e ? void 0 : e.minWidth),
          minHeight: i(null == e ? void 0 : e.minHeight),
          maxWidth: i(null == e ? void 0 : e.maxWidth),
          maxHeight: i(null == e ? void 0 : e.maxHeight)
        }
      })
    }
    async setPosition(e) {
      return (0, b.invoke)("plugin:window|set_position", {
        label: this.label,
        value: e instanceof _ ? e : new _(e)
      })
    }
    async setFullscreen(e) {
      return (0, b.invoke)("plugin:window|set_fullscreen", {
        label: this.label,
        value: e
      })
    }
    async setSimpleFullscreen(e) {
      return (0, b.invoke)("plugin:window|set_simple_fullscreen", {
        label: this.label,
        value: e
      })
    }
    async setFocus() {
      return (0, b.invoke)("plugin:window|set_focus", {
        label: this.label
      })
    }
    async setFocusable(e) {
      return (0, b.invoke)("plugin:window|set_focusable", {
        label: this.label,
        value: e
      })
    }
    async setIcon(e) {
      return (0, b.invoke)("plugin:window|set_icon", {
        label: this.label,
        value: E(e)
      })
    }
    async setSkipTaskbar(e) {
      return (0, b.invoke)("plugin:window|set_skip_taskbar", {
        label: this.label,
        value: e
      })
    }
    async setCursorGrab(e) {
      return (0, b.invoke)("plugin:window|set_cursor_grab", {
        label: this.label,
        value: e
      })
    }
    async setCursorVisible(e) {
      return (0, b.invoke)("plugin:window|set_cursor_visible", {
        label: this.label,
        value: e
      })
    }
    async setCursorIcon(e) {
      return (0, b.invoke)("plugin:window|set_cursor_icon", {
        label: this.label,
        value: e
      })
    }
    async setBackgroundColor(e) {
      return (0, b.invoke)("plugin:window|set_background_color", {
        color: e
      })
    }
    async setCursorPosition(e) {
      return (0, b.invoke)("plugin:window|set_cursor_position", {
        label: this.label,
        value: e instanceof _ ? e : new _(e)
      })
    }
    async setIgnoreCursorEvents(e) {
      return (0, b.invoke)("plugin:window|set_ignore_cursor_events", {
        label: this.label,
        value: e
      })
    }
    async startDragging() {
      return (0, b.invoke)("plugin:window|start_dragging", {
        label: this.label
      })
    }
    async startResizeDragging(e) {
      return (0, b.invoke)("plugin:window|start_resize_dragging", {
        label: this.label,
        value: e
      })
    }
    async setBadgeCount(e) {
      return (0, b.invoke)("plugin:window|set_badge_count", {
        label: this.label,
        value: e
      })
    }
    async setBadgeLabel(e) {
      return (0, b.invoke)("plugin:window|set_badge_label", {
        label: this.label,
        value: e
      })
    }
    async setOverlayIcon(e) {
      return (0, b.invoke)("plugin:window|set_overlay_icon", {
        label: this.label,
        value: e ? E(e) : void 0
      })
    }
    async setProgressBar(e) {
      return (0, b.invoke)("plugin:window|set_progress_bar", {
        label: this.label,
        value: e
      })
    }
    async setVisibleOnAllWorkspaces(e) {
      return (0, b.invoke)("plugin:window|set_visible_on_all_workspaces", {
        label: this.label,
        value: e
      })
    }
    async setTitleBarStyle(e) {
      return (0, b.invoke)("plugin:window|set_title_bar_style", {
        label: this.label,
        value: e
      })
    }
    async setTheme(e) {
      return (0, b.invoke)("plugin:window|set_theme", {
        label: this.label,
        value: e
      })
    }
    async onResized(e) {
      return this.listen(k.TauriEvent.WINDOW_RESIZED, i => {
        i.payload = new p(i.payload), e(i)
      })
    }
    async onMoved(e) {
      return this.listen(k.TauriEvent.WINDOW_MOVED, i => {
        i.payload = new g(i.payload), e(i)
      })
    }
    async onCloseRequested(e) {
      return this.listen(k.TauriEvent.WINDOW_CLOSE_REQUESTED, async i => {
        let t = new z(i);
        await e(t), t.isPreventDefault() || await this.destroy()
      })
    }
    async onDragDropEvent(e) {
      let i = await this.listen(k.TauriEvent.DRAG_ENTER, i => {
          e({
            ...i,
            payload: {
              type: "enter",
              paths: i.payload.paths,
              position: new g(i.payload.position)
            }
          })
        }),
        t = await this.listen(k.TauriEvent.DRAG_OVER, i => {
          e({
            ...i,
            payload: {
              type: "over",
              position: new g(i.payload.position)
            }
          })
        }),
        n = await this.listen(k.TauriEvent.DRAG_DROP, i => {
          e({
            ...i,
            payload: {
              type: "drop",
              paths: i.payload.paths,
              position: new g(i.payload.position)
            }
          })
        }),
        l = await this.listen(k.TauriEvent.DRAG_LEAVE, i => {
          e({
            ...i,
            payload: {
              type: "leave"
            }
          })
        });
      return () => {
        i(), n(), t(), l()
      }
    }
    async onFocusChanged(e) {
      let i = await this.listen(k.TauriEvent.WINDOW_FOCUS, i => {
          e({
            ...i,
            payload: !0
          })
        }),
        t = await this.listen(k.TauriEvent.WINDOW_BLUR, i => {
          e({
            ...i,
            payload: !1
          })
        });
      return () => {
        i(), t()
      }
    }
    async onScaleChanged(e) {
      return this.listen(k.TauriEvent.WINDOW_SCALE_FACTOR_CHANGED, e)
    }
    async onThemeChanged(e) {
      return this.listen(k.TauriEvent.WINDOW_THEME_CHANGED, e)
    }
  }

  function x() {
    return new L(T(), window.__TAURI_INTERNALS__.metadata.currentWebview.label, {
      skip: !0
    })
  }
  async function S() {
    return (0, b.invoke)("plugin:webview|get_all_webviews").then(e => e.map(e => new L(new O(e.windowLabel, {
      skip: !0
    }), e.label, {
      skip: !0
    })))
  }(n = u || (u = {})).Disabled = "disabled", n.Throttle = "throttle", n.Suspend = "suspend", (l = h || (h = {})).Default = "default", l.FluentOverlay = "fluentOverlay", (s = c || (c = {})).AppearanceBased = "appearanceBased", s.Light = "light", s.Dark = "dark", s.MediumLight = "mediumLight", s.UltraDark = "ultraDark", s.Titlebar = "titlebar", s.Selection = "selection", s.Menu = "menu", s.Popover = "popover", s.Sidebar = "sidebar", s.HeaderView = "headerView", s.Sheet = "sheet", s.WindowBackground = "windowBackground", s.HudWindow = "hudWindow", s.FullScreenUI = "fullScreenUI", s.Tooltip = "tooltip", s.ContentBackground = "contentBackground", s.UnderWindowBackground = "underWindowBackground", s.UnderPageBackground = "underPageBackground", s.Mica = "mica", s.Blur = "blur", s.Acrylic = "acrylic", s.Tabbed = "tabbed", s.TabbedDark = "tabbedDark", s.TabbedLight = "tabbedLight", (a = w || (w = {})).FollowsWindowActiveState = "followsWindowActiveState", a.Active = "active", a.Inactive = "inactive", e.s(["Window", 0, O, "getCurrentWindow", 0, T], 35952);
  let C = ["tauri://created", "tauri://error"];
  class L {
    constructor(e, i, t) {
      this.window = e, this.label = i, this.listeners = Object.create(null), (null == t ? void 0 : t.skip) || (0, b.invoke)("plugin:webview|create_webview", {
        windowLabel: e.label,
        options: {
          ...t,
          label: i
        }
      }).then(async () => this.emit("tauri://created")).catch(async e => this.emit("tauri://error", e))
    }
    static async getByLabel(e) {
      var i;
      return null != (i = (await S()).find(i => i.label === e)) ? i : null
    }
    static getCurrent() {
      return x()
    }
    static async getAll() {
      return S()
    }
    async listen(e, i) {
      return this._handleTauriEvent(e, i) ? () => {
        let t = this.listeners[e];
        t.splice(t.indexOf(i), 1)
      } : (0, k.listen)(e, i, {
        target: {
          kind: "Webview",
          label: this.label
        }
      })
    }
    async once(e, i) {
      return this._handleTauriEvent(e, i) ? () => {
        let t = this.listeners[e];
        t.splice(t.indexOf(i), 1)
      } : (0, k.once)(e, i, {
        target: {
          kind: "Webview",
          label: this.label
        }
      })
    }
    async emit(e, i) {
      if (C.includes(e)) {
        for (let t of this.listeners[e] || []) t({
          event: e,
          id: -1,
          payload: i
        });
        return
      }
      return (0, k.emit)(e, i)
    }
    async emitTo(e, i, t) {
      if (C.includes(i)) {
        for (let e of this.listeners[i] || []) e({
          event: i,
          id: -1,
          payload: t
        });
        return
      }
      return (0, k.emitTo)(e, i, t)
    }
    _handleTauriEvent(e, i) {
      return !!C.includes(e) && (e in this.listeners ? this.listeners[e].push(i) : this.listeners[e] = [i], !0)
    }
    async position() {
      return (0, b.invoke)("plugin:webview|webview_position", {
        label: this.label
      }).then(e => new g(e))
    }
    async size() {
      return (0, b.invoke)("plugin:webview|webview_size", {
        label: this.label
      }).then(e => new p(e))
    }
    async close() {
      return (0, b.invoke)("plugin:webview|webview_close", {
        label: this.label
      })
    }
    async setSize(e) {
      return (0, b.invoke)("plugin:webview|set_webview_size", {
        label: this.label,
        value: e instanceof v ? e : new v(e)
      })
    }
    async setPosition(e) {
      return (0, b.invoke)("plugin:webview|set_webview_position", {
        label: this.label,
        value: e instanceof _ ? e : new _(e)
      })
    }
    async setFocus() {
      return (0, b.invoke)("plugin:webview|set_webview_focus", {
        label: this.label
      })
    }
    async setAutoResize(e) {
      return (0, b.invoke)("plugin:webview|set_webview_auto_resize", {
        label: this.label,
        value: e
      })
    }
    async hide() {
      return (0, b.invoke)("plugin:webview|webview_hide", {
        label: this.label
      })
    }
    async show() {
      return (0, b.invoke)("plugin:webview|webview_show", {
        label: this.label
      })
    }
    async setZoom(e) {
      return (0, b.invoke)("plugin:webview|set_webview_zoom", {
        label: this.label,
        value: e
      })
    }
    async reparent(e) {
      return (0, b.invoke)("plugin:webview|reparent", {
        label: this.label,
        window: "string" == typeof e ? e : e.label
      })
    }
    async clearAllBrowsingData() {
      return (0, b.invoke)("plugin:webview|clear_all_browsing_data")
    }
    async setBackgroundColor(e) {
      return (0, b.invoke)("plugin:webview|set_webview_background_color", {
        color: e
      })
    }
    async onDragDropEvent(e) {
      let i = await this.listen(k.TauriEvent.DRAG_ENTER, i => {
          e({
            ...i,
            payload: {
              type: "enter",
              paths: i.payload.paths,
              position: new g(i.payload.position)
            }
          })
        }),
        t = await this.listen(k.TauriEvent.DRAG_OVER, i => {
          e({
            ...i,
            payload: {
              type: "over",
              position: new g(i.payload.position)
            }
          })
        }),
        n = await this.listen(k.TauriEvent.DRAG_DROP, i => {
          e({
            ...i,
            payload: {
              type: "drop",
              paths: i.payload.paths,
              position: new g(i.payload.position)
            }
          })
        }),
        l = await this.listen(k.TauriEvent.DRAG_LEAVE, i => {
          e({
            ...i,
            payload: {
              type: "leave"
            }
          })
        });
      return () => {
        i(), n(), t(), l()
      }
    }
  }
  e.s(["getCurrentWebview", 0, x], 68270)
}, 71028, 26150, e => {
  "use strict";
  var i = e.i(56420);
  let t = (0, i.default)("gauge", [
    ["path", {
      d: "m12 14 4-4",
      key: "9kzdfg"
    }],
    ["path", {
      d: "M3.34 19a10 10 0 1 1 17.32 0",
      key: "19p75a"
    }]
  ]);
  e.s(["Gauge", 0, t], 71028);
  let n = (0, i.default)("volume-x", [
    ["path", {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }],
    ["line", {
      x1: "22",
      x2: "16",
      y1: "9",
      y2: "15",
      key: "1ewh16"
    }],
    ["line", {
      x1: "16",
      x2: "22",
      y1: "9",
      y2: "15",
      key: "5ykzw1"
    }]
  ]);
  e.s(["VolumeX", 0, n], 26150)
}]);