(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 68476, 21826, e => {
  "use strict";
  e.i(47167);
  let t = "https://api.dichvideo.com",
    n = "https://dichvideo-api.gbcihl.easypanel.host",
    a = e => {
      let a = (e?.trim() ?? "").replace(/\/+$/, "");
      return a && a !== n ? a : t
    },
    r = a("https://api.dichvideo.com"),
    i = {
      "dichvideo-admin.gbcihl.easypanel.host": t
    };
  class s extends Error {
    status;
    code;
    constructor(e, t) {
      super(t.message), this.name = "CloudApiError", this.status = e, this.code = t.code
    }
  }
  let o = e => (a(e), i[window.location.hostname] ?? null ?? r),
    l = async e => {
      let t = await e.text();
      if (!t) return null;
      try {
        return JSON.parse(t)
      } catch {
        return t
      }
    };
  async function d(e, t) {
    let n, a = new Headers({
      Accept: "application/json"
    });
    void 0 !== t.body && a.set("Content-Type", "application/json"), t.token && a.set("Authorization", `Bearer ${t.token}`), void 0 !== t.idempotencyKey && a.set("Idempotency-Key", t.idempotencyKey);
    let r = t.requestTimeoutMs,
      i = r ? new AbortController : null,
      d = i && r ? setTimeout(() => i.abort(), r) : null;
    try {
      n = await fetch(`${o(t.apiUrl)}${e}`, {
        method: t.method ?? "GET",
        headers: a,
        body: void 0 === t.body ? void 0 : JSON.stringify(t.body),
        signal: i?.signal
      })
    } catch (t) {
      let e = t instanceof Error ? t.name : "";
      if (i?.signal.aborted || "AbortError" === e) throw new s(408, {
        code: "request_timeout",
        message: "Server DichVideo phản hồi chậm. Hãy thử lại hoặc kiểm tra mạng."
      });
      throw new s(0, {
        code: "server_unreachable",
        message: "Không kết nối được server DichVideo. Kiểm tra mạng rồi thử lại."
      })
    } finally {
      null !== d && clearTimeout(d)
    }
    let u = await l(n);
    if (!n.ok) throw new s(n.status, ((e, t) => {
      if (t && "object" == typeof t && "error" in t) {
        let {
          error: n
        } = t;
        if (n && "object" == typeof n) return {
          code: "string" == typeof n.code ? n.code : `http_${e}`,
          message: "string" == typeof n.message && n.message.length > 0 ? n.message : `Cloud API request failed with HTTP ${e}.`
        }
      }
      if ("string" == typeof t && t.length > 0) return {
        code: `http_${e}`,
        message: t
      };
      if (t && "object" == typeof t && "detail" in t) {
        let n = t.detail;
        if ("string" == typeof n && n.length > 0) return {
          code: `http_${e}`,
          message: n
        };
        if (Array.isArray(n) && n.length > 0) return {
          code: "validation_error",
          message: "Thông tin gửi lên chưa hợp lệ. Kiểm tra lại rồi thử tiếp."
        }
      }
      return {
        code: `http_${e}`,
        message: `Cloud API request failed with HTTP ${e}.`
      }
    })(n.status, u));
    return u
  }
  e.s(["ADMIN_DASHBOARD_REQUEST_TIMEOUT_MS", 0, 2e4, "CLOUD_API_URL_EDITABLE", 0, !1, "CLOUD_APP_ENV", 0, "production", "CLOUD_LOGIN_REQUEST_TIMEOUT_MS", 0, 2e4, "CLOUD_STATUS_REQUEST_TIMEOUT_MS", 0, 8e3, "CloudApiError", 0, s, "DEFAULT_CLOUD_API_URL", 0, r, "DEFAULT_PRODUCTION_CLOUD_API_URL", 0, t, "LEGACY_EASYPANEL_CLOUD_API_URL", 0, n, "LOCAL_DEVELOPMENT_CLOUD_API_URL", 0, "http://127.0.0.1:8000", "LOCAL_PREFLIGHT_REQUEST_TIMEOUT_MS", 0, 3e4, "cloudRequest", 0, d, "normalizeCloudApiUrl", 0, o], 21826);
  let u = {
      ready: e => d("/ready", {
        apiUrl: e,
        requestTimeoutMs: 4e3
      }),
      plans: e => d("/plans", {
        apiUrl: e,
        requestTimeoutMs: 8e3
      }),
      recordMarketingFunnelEvent: (e, t) => d("/funnel/events", {
        apiUrl: e,
        method: "POST",
        body: t
      }),
      licenseStatus: (e, t) => d("/license/status", {
        apiUrl: e,
        token: t,
        requestTimeoutMs: 8e3
      }),
      creditBalance: (e, t) => d("/credits/balance", {
        apiUrl: e,
        token: t,
        requestTimeoutMs: 8e3
      }),
      devGrant: (e, t, n) => d("/credits/dev-grant", {
        apiUrl: e,
        token: t,
        method: "POST",
        body: n
      }),
      productAnnouncements: (e, t = {}) => {
        let n = new URLSearchParams;
        t.target && n.set("target", t.target), t.app_env && n.set("app_env", t.app_env), t.app_version && n.set("app_version", t.app_version);
        let a = n.toString();
        return d(a ? `/app/announcements?${a}` : "/app/announcements", {
          apiUrl: e,
          requestTimeoutMs: 4e3
        })
      },
      createPaymentCheckout: (e, t, n, a) => d("/payments/checkout", {
        apiUrl: e,
        token: t,
        idempotencyKey: a,
        method: "POST",
        body: n
      }),
      createManualOrder: (e, t, n, a) => d("/payments/manual-order", {
        apiUrl: e,
        token: t,
        idempotencyKey: a,
        method: "POST",
        body: n
      }),
      paymentCheckout: (e, t, n) => d(`/payments/${encodeURIComponent(n)}`, {
        apiUrl: e,
        token: t
      }),
      markManualPaymentPaid: (e, t, n) => d(`/payments/${encodeURIComponent(n)}/mark-paid`, {
        apiUrl: e,
        token: t,
        method: "POST"
      }),
      markManualOrderPaid: (e, t, n, a) => d(`/payments/manual-order/${encodeURIComponent(n)}/mark-paid`, {
        apiUrl: e,
        token: t,
        method: "POST",
        body: a
      }),
      claimFreeTrial: (e, t, n) => d("/trial/claim", {
        apiUrl: e,
        token: t,
        method: "POST",
        body: n
      }),
      requestOfflineLease: (e, t, n) => d("/devices/offline-lease", {
        apiUrl: e,
        token: t,
        method: "POST",
        body: n
      })
    },
    c = {
      ...u,
      ...{
        registrationPolicy: e => d("/auth/registration-policy", {
          apiUrl: e,
          requestTimeoutMs: 8e3
        }),
        devLogin: (e, t) => d("/auth/dev-login", {
          apiUrl: e,
          method: "POST",
          body: t
        }),
        requestAccountLoginCode: (e, t) => d("/auth/request-login-code", {
          apiUrl: e,
          method: "POST",
          body: t
        }),
        confirmAccountLoginCode: (e, t) => d("/auth/login-code", {
          apiUrl: e,
          method: "POST",
          body: t
        }),
        passwordLogin: (e, t) => d("/auth/password-login", {
          apiUrl: e,
          method: "POST",
          body: t
        }),
        refreshAuthToken: (e, t) => d("/auth/refresh", {
          apiUrl: e,
          token: t,
          method: "POST"
        }),
        logoutAuthToken: (e, t) => d("/auth/logout", {
          apiUrl: e,
          token: t,
          method: "POST"
        }),
        bootstrapSupabaseAccount: (e, t) => d("/auth/supabase-bootstrap", {
          apiUrl: e,
          token: t,
          method: "POST",
          requestTimeoutMs: 2e4
        }),
        createPublicAccount: (e, t) => d("/auth/public-account", {
          apiUrl: e,
          method: "POST",
          body: t,
          requestTimeoutMs: 2e4
        }),
        me: (e, t) => d("/me", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        accountStatus: (e, t, n) => d(n?.includeJobs === !1 ? "/account/status?include_jobs=false" : "/account/status", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        activateDevice: (e, t, n) => d("/devices/activate", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        heartbeatDevice: (e, t, n) => d("/devices/heartbeat", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: {
            device_id: n
          }
        }),
        releaseDevice: (e, t, n) => d("/devices/release", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: {
            device_id: n
          }
        }),
        switchDevice: (e, t, n) => d("/devices/switch", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        currentDevices: (e, t) => d("/devices/current", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        deviceSession: (e, t, n) => d("/devices/session", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n,
          requestTimeoutMs: 4e3
        })
      },
      ...{
        listJobs: (e, t) => d("/jobs", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        getJob: (e, t, n) => d(`/jobs/${encodeURIComponent(n)}`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        createJob: (e, t, n) => d("/jobs", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        authorizeLocalJob: (e, t, n) => d("/jobs/authorize-local", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        localPreflight: (e, t, n) => d("/jobs/local-preflight", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n,
          requestTimeoutMs: 3e4
        }),
        exportPolicyForLocalJob: (e, t, n) => d(`/jobs/${encodeURIComponent(n)}/export-policy`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        issueProjectAuthorizationReceipt: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/project-authorization-receipt`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a,
          requestTimeoutMs: 1e4
        }),
        heartbeatJob: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/heartbeat`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a,
          requestTimeoutMs: 8e3
        }),
        resumeLocalJob: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/resume-local`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a,
          requestTimeoutMs: 8e3
        }),
        renewLocalJobToken: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/token/renew`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a,
          requestTimeoutMs: 1e4
        }),
        reportJobTerminal: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/terminal-report`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a,
          requestTimeoutMs: 8e3
        }),
        getJobDisposition: (e, t, n) => d(`/jobs/${encodeURIComponent(n)}/disposition`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 8e3
        }),
        uploadJobMetrics: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/metrics`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        uploadJobDiagnostic: (e, t, n, a) => d(`/jobs/${encodeURIComponent(n)}/diagnostics`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        recordPremiumVoiceCheck: (e, t, n) => d("/jobs/premium-voice-checks", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n,
          requestTimeoutMs: 6e3
        }),
        serverConfig: (e, t = {}) => d("/runtime/server-config", {
          apiUrl: e,
          requestTimeoutMs: t.requestTimeoutMs
        }),
        engineVnextManifest: (e, t = "windows-x64", n = "alpha", a) => {
          let r = new URLSearchParams({
            platform: t,
            channel: n
          });
          return a?.trim() && r.set("app_version", a.trim()), d(`/runtime/engine-vnext/manifest?${r.toString()}`, {
            apiUrl: e,
            requestTimeoutMs: 8e3
          })
        },
        cancelJob: (e, t, n) => d(`/jobs/${encodeURIComponent(n)}/cancel`, {
          apiUrl: e,
          token: t,
          method: "POST"
        }),
        translateSegments: (e, t, n) => d("/translation/segments", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        finalizeTranslationCharacterConsistency: (e, t, n) => d("/translation/consistency/finalize", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        synthesizeTtsSegments: (e, t, n) => d("/tts/segments", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n,
          requestTimeoutMs: 12e4
        })
      },
      ...{
        adminInboxSummary: (e, t) => d("/admin/inbox/summary", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminInboxItems: (e, t, n = 20) => d(`/admin/inbox/items?limit=${n}`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminOpsStatus: (e, t) => d("/admin/ops/status", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminDashboardOverview: (e, t) => d("/admin/dashboard/overview", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminJobs: (e, t, n = {}) => {
          let a = new URLSearchParams;
          return a.set("limit", String(n.limit ?? 20)), n.status && a.set("status", n.status), n.workspace && a.set("workspace", n.workspace), !1 === n.includeMeta && a.set("include_meta", "false"), n.cursor && a.set("cursor", n.cursor), d(`/admin/jobs?${a.toString()}`, {
            apiUrl: e,
            token: t,
            requestTimeoutMs: 2e4
          })
        },
        adminJobDiagnostic: (e, t, n) => d(`/admin/jobs/${encodeURIComponent(n)}/diagnostic`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminClearJobDiagnostic: (e, t, n) => d(`/admin/jobs/${encodeURIComponent(n)}/diagnostic/clear`, {
          apiUrl: e,
          token: t,
          method: "POST",
          requestTimeoutMs: 2e4
        }),
        adminReconcileStaleJobs: (e, t, n = 100) => d("/admin/jobs/reconcile-stale", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: {
            limit: n
          },
          requestTimeoutMs: 2e4
        }),
        adminBulkClearJobDiagnostics: (e, t, n = 7, a = 100) => d("/admin/jobs/diagnostics/clear", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: {
            older_than_days: n,
            limit: a
          },
          requestTimeoutMs: 2e4
        }),
        adminBulkArchiveJobs: (e, t, n = 7, a = 100, r = "old_failure_cleanup") => d("/admin/jobs/archive", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: {
            older_than_days: n,
            limit: a,
            reason: r
          },
          requestTimeoutMs: 2e4
        }),
        adminBootstrap: (e, t, n = "") => d(`/admin/bootstrap?q=${encodeURIComponent(n)}`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminPlans: (e, t) => d("/admin/plans", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminAnnouncements: (e, t) => d("/admin/announcements", {
          apiUrl: e,
          token: t
        }),
        adminCreateAnnouncement: (e, t, n) => d("/admin/announcements", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        adminUpdateAnnouncement: (e, t, n, a) => d(`/admin/announcements/${encodeURIComponent(n)}`, {
          apiUrl: e,
          token: t,
          method: "PUT",
          body: a
        }),
        adminArchiveAnnouncement: (e, t, n) => d(`/admin/announcements/${encodeURIComponent(n)}/archive`, {
          apiUrl: e,
          token: t,
          method: "POST"
        }),
        adminUpdateFreeDailyQuota: (e, t, n) => d("/admin/plans/free-weekly/quota", {
          apiUrl: e,
          token: t,
          method: "POST",
          body: n
        }),
        adminCustomerDirectory: (e, t, n = "") => d(`/admin/customers?q=${encodeURIComponent(n)}`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminCustomerProfile: (e, t, n) => d(`/admin/customers/${encodeURIComponent(n)}`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminPendingManualPayments: (e, t) => d("/admin/payments/pending", {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminManualPayments: (e, t, n = 100) => d(`/admin/payments?limit=${n}`, {
          apiUrl: e,
          token: t,
          requestTimeoutMs: 2e4
        }),
        adminPaymentOperations: (e, t, n = {}) => {
          let a = new URLSearchParams;
          return a.set("limit", String(n.limit ?? 100)), n.provider && a.set("provider", n.provider), n.status && a.set("status", n.status), n.q && a.set("q", n.q), d(`/admin/payments/operations?${a.toString()}`, {
            apiUrl: e,
            token: t,
            requestTimeoutMs: 2e4
          })
        },
        adminConfirmManualPayment: (e, t, n, a) => d(`/admin/payments/${encodeURIComponent(n)}/confirm`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminNeedsInfoManualPayment: (e, t, n, a) => d(`/admin/payments/${encodeURIComponent(n)}/needs-info`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminRejectManualPayment: (e, t, n, a) => d(`/admin/payments/${encodeURIComponent(n)}/reject`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminRefundManualPayment: (e, t, n, a) => d(`/admin/payments/${encodeURIComponent(n)}/refund`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminResendAccountLoginCode: (e, t, n, a) => d(`/admin/users/${encodeURIComponent(n)}/login-code`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminSendSupabasePasswordReset: (e, t, n, a) => d(`/admin/users/${encodeURIComponent(n)}/password-reset`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminGrantUserCredits: (e, t, n, a) => d(`/admin/users/${encodeURIComponent(n)}/credits/grant`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminGrantUserSubscription: (e, t, n, a) => d(`/admin/users/${encodeURIComponent(n)}/subscription/grant`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        }),
        adminResetUserDevices: (e, t, n, a) => d(`/admin/users/${encodeURIComponent(n)}/devices/reset`, {
          apiUrl: e,
          token: t,
          method: "POST",
          body: a
        })
      },
      productAnnouncements: u.productAnnouncements
    };
  e.s(["cloudApi", 0, c], 68476)
}, 14829, e => {
  "use strict";
  let t = "https://zalo.me/0981478480";
  e.s(["ACCOUNT_SIGNUP_HREF", 0, "/account?mode=signup", "DESKTOP_APP_VERSION", 0, "1.6.5", "DOWNLOAD_APP_HREF", 0, "https://api.dichvideo.com/app/download/windows/latest?source=landing&channel=stable&arch=x64", "TELEGRAM_CONTACT_HREF", 0, "https://t.me/hanv123s", "UPGRADE_CONTACT_HREF", 0, t, "ZALO_CONTACT_HREF", 0, t])
}, 82022, e => {
  "use strict";
  let t = (0, e.i(56420).default)("external-link", [
    ["path", {
      d: "M15 3h6v6",
      key: "1q9fwt"
    }],
    ["path", {
      d: "M10 14 21 3",
      key: "gplh6r"
    }],
    ["path", {
      d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
      key: "a6xqqp"
    }]
  ]);
  e.s(["ExternalLink", 0, t], 82022)
}, 54626, e => {
  "use strict";
  e.s(["BRAND", 0, {
    domain: "dichvideo.com",
    productName: "Dịch Video",
    technicalName: "Dich Video",
    slug: "dichvideo",
    tagline: "Dịch video, phụ đề và lồng tiếng bằng AI"
  }])
}, 90509, e => {
  "use strict";
  var t = e.i(68476),
    n = e.i(21826),
    a = e.i(14829),
    r = e.i(80932);
  let i = "dichvideo_marketing_visitor_id";
  e.s(["buildTrackedDownloadHref", 0, function(e = "landing", t) {
    let n = new URL(a.DOWNLOAD_APP_HREF);
    return n.searchParams.set("source", e), n.searchParams.set("channel", n.searchParams.get("channel") || "stable"), n.searchParams.set("arch", n.searchParams.get("arch") || "x64"), t?.trim() && n.searchParams.set("visitor_id", t.trim()), n.toString()
  }, "getOrCreateMarketingVisitorId", 0, function() {
    (0, r.captureGoogleAdsClickIds)();
    let e = localStorage.getItem(i);
    if (e) return e;
    let t = "u" > typeof crypto && "randomUUID" in crypto ? crypto.randomUUID() : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return localStorage.setItem(i, t), t
  }, "recordMarketingFunnelEvent", 0, function(e) {
    let a = (0, r.getStoredGoogleAdsClickIds)(),
      i = a ? {
        ...e,
        metadata: {
          ...e.metadata,
          google_ads_click_ids: a
        }
      } : e;
    return t.cloudApi.recordMarketingFunnelEvent(n.DEFAULT_CLOUD_API_URL, i).then(() => void 0).catch(() => void 0)
  }])
}, 25913, 86011, e => {
  "use strict";
  var t = e.i(7670);
  let n = e => "boolean" == typeof e ? `${e}` : 0 === e ? "0" : e,
    a = t.clsx;
  e.s(["cva", 0, (e, t) => r => {
    var i;
    if ((null == t ? void 0 : t.variants) == null) return a(e, null == r ? void 0 : r.class, null == r ? void 0 : r.className);
    let {
      variants: s,
      defaultVariants: o
    } = t, l = Object.keys(s).map(e => {
      let t = null == r ? void 0 : r[e],
        a = null == o ? void 0 : o[e];
      if (null === t) return null;
      let i = n(t) || n(a);
      return s[e][i]
    }), d = r && Object.entries(r).reduce((e, t) => {
      let [n, a] = t;
      return void 0 === a || (e[n] = a), e
    }, {});
    return a(e, l, null == t || null == (i = t.compoundVariants) ? void 0 : i.reduce((e, t) => {
      let {
        class: n,
        className: a,
        ...r
      } = t;
      return Object.entries(r).every(e => {
        let [t, n] = e;
        return Array.isArray(n) ? n.includes({
          ...o,
          ...d
        } [t]) : ({
          ...o,
          ...d
        })[t] === n
      }) ? [...e, n, a] : e
    }, []), null == r ? void 0 : r.class, null == r ? void 0 : r.className)
  }], 25913);
  var r = e.i(91918);
  e.s(["Slot", 0, r], 86011)
}, 19455, e => {
  "use strict";
  var t = e.i(43476),
    n = e.i(25913),
    a = e.i(86011),
    r = e.i(75157);
  let i = (0, n.cva)("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  });
  e.s(["Button", 0, function({
    className: e,
    variant: n = "default",
    size: s = "default",
    asChild: o = !1,
    ...l
  }) {
    let d = o ? a.Slot.Root : "button";
    return (0, t.jsx)(d, {
      "data-slot": "button",
      "data-variant": n,
      "data-size": s,
      className: (0, r.cn)(i({
        variant: n,
        size: s,
        className: e
      })),
      ...l
    })
  }])
}, 23827, e => {
  "use strict";
  let t = (0, e.i(56420).default)("volume-2", [
    ["path", {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }],
    ["path", {
      d: "M16 9a5 5 0 0 1 0 6",
      key: "1q6k2b"
    }],
    ["path", {
      d: "M19.364 18.364a9 9 0 0 0 0-12.728",
      key: "ijwkga"
    }]
  ]);
  e.s(["Volume2", 0, t], 23827)
}, 63511, e => {
  "use strict";
  var t = e.i(68834),
    n = e.i(54302),
    a = e.i(3007);
  let r = (0, t.create)((e, t) => ({
    status: "idle",
    voices: [],
    revision: null,
    error: null,
    load: async () => {
      let r = t().status;
      if ("loading" !== r && "ready" !== r) {
        e({
          status: "loading",
          error: null
        });
        try {
          let t = await (0, a.listVieNeuEmbeddedVoices)(),
            r = (0, n.applyVieNeuEmbeddedCatalog)(t.voices);
          e({
            status: "ready",
            voices: r,
            revision: t.revision,
            error: null
          })
        } catch (t) {
          e({
            status: "error",
            error: t instanceof Error ? t.message : String(t)
          })
        }
      }
    },
    retry: async () => {
      "loading" !== t().status && (e({
        status: "idle",
        error: null
      }), await t().load())
    }
  }));
  e.s(["useVieNeuCatalogStore", 0, r])
}, 79212, e => {
  "use strict";
  var t = e.i(68834),
    n = e.i(3134);
  let a = (0, t.create)((e, t) => ({
    status: null,
    voices: [],
    busy: !1,
    error: null,
    phase: "idle",
    refresh: async () => {
      if (!t().busy) {
        e({
          busy: !0,
          error: null,
          phase: "checking"
        });
        try {
          let t = await (0, n.turboRuntimeStatus)();
          e({
            status: t,
            phase: t.ready ? "loading-voices" : "checking"
          }), e({
            voices: t.ready ? await (0, n.listTurboVoices)() : []
          })
        } catch (t) {
          e({
            voices: [],
            error: String(t)
          })
        } finally {
          e({
            busy: !1,
            phase: "idle"
          })
        }
      }
    },
    install: async a => {
      if (!t().busy) {
        e({
          busy: !0,
          error: null,
          phase: "installing"
        });
        try {
          await (0, n.installTurboRuntime)(a), e({
            phase: "checking"
          });
          let t = await (0, n.turboRuntimeStatus)();
          if (e({
              status: t,
              phase: "loading-voices"
            }), !t.ready) throw Error(t.error ?? "Tài nguyên chưa sẵn sàng.");
          e({
            voices: await (0, n.listTurboVoices)()
          })
        } catch (n) {
          let t = String(n);
          e({
            error: t.includes("native_tts_piper_canceled") || t.toLowerCase().includes("canceled") ? "Đã hủy chuẩn bị tài nguyên." : t
          })
        } finally {
          e({
            busy: !1,
            phase: "idle"
          })
        }
      }
    },
    enroll: async (a, r, i = !0) => {
      if (t().busy) return null;
      e({
        busy: !0,
        error: null,
        phase: "enrolling"
      });
      try {
        let t = await (0, n.enrollTurboVoice)(a, r, i);
        return e({
          voices: await (0, n.listTurboVoices)()
        }), t
      } catch (t) {
        return e({
          error: String(t)
        }), null
      } finally {
        e({
          busy: !1,
          phase: "idle"
        })
      }
    },
    remove: async a => {
      if (!t().busy) {
        e({
          busy: !0,
          error: null,
          phase: "deleting"
        });
        try {
          await (0, n.deleteTurboVoice)(a), e({
            voices: await (0, n.listTurboVoices)()
          })
        } catch (t) {
          e({
            error: String(t)
          })
        } finally {
          e({
            busy: !1,
            phase: "idle"
          })
        }
      }
    }
  }));
  e.s(["useVieNeuTurboStore", 0, a])
}, 70387, e => {
  "use strict";
  let t = (0, e.i(56420).default)("credit-card", [
    ["rect", {
      width: "20",
      height: "14",
      x: "2",
      y: "5",
      rx: "2",
      key: "ynyp8z"
    }],
    ["line", {
      x1: "2",
      x2: "22",
      y1: "10",
      y2: "10",
      key: "1b3vmo"
    }]
  ]);
  e.s(["CreditCard", 0, t], 70387)
}, 28587, e => {
  "use strict";
  let t = new Set(["monthly_unlimited", "monthly_unlimited_legacy"]),
    n = new Set(["trial", "free_weekly"]);

  function a(e) {
    let t = Math.max(0, Math.floor("number" == typeof e && Number.isFinite(e) ? e : 0));
    if (0 === t) return "0 phút";
    let n = Math.floor(t / 60),
      a = t % 60;
    return 0 === n ? `${a}s` : a > 0 ? `${n} ph\xfat ${a}s` : `${n} ph\xfat`
  }

  function r(e) {
    return Math.max(0, e?.video_credits_seconds ?? 0)
  }

  function i(e) {
    return e?.plan_code ?? e?.plan ?? null
  }

  function s(e) {
    return Math.max(0, e.fair_use_remaining_seconds ?? (e.monthly_fair_use_seconds ?? 0) - (e.monthly_used_seconds ?? 0))
  }

  function o(e) {
    if (!e) return null;
    let t = new Date(e);
    return Number.isNaN(t.getTime()) ? null : new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Bangkok"
    }).format(t)
  }

  function l(e) {
    let t = o(e.current_period_ends_at),
      n = o(e.expires_at),
      a = e.current_period_ends_at ? Date.parse(e.current_period_ends_at) : NaN,
      r = e.expires_at ? Date.parse(e.expires_at) : NaN,
      i = Number.isFinite(a) && Number.isFinite(r) && a < r,
      s = i ? t : n ?? t;
    return s ? `${i?"Reset":"Hết hạn"}: ${s}` : ""
  }

  function d(e) {
    let t = o(e?.video_credits_expires_at);
    return t ? `Hết hạn: ${t}` : ""
  }

  function u(e, n) {
    let o, u, c;
    return {
      state: e.loadState,
      userEmail: e.userEmail,
      ...n,
      ...(o = i(e.license), u = !!(e.license && "active" === e.license.status && o && t.has(o)), c = r(e.balance), {
        unlimited: {
          active: u,
          heading: "Unlimited Standard",
          minutesLabel: u ? `C\xf2n ${a(s(e.license))}` : "Không hoạt động",
          periodLabel: e.license && o && t.has(o) ? l(e.license) : ""
        },
        wallet: {
          active: c > 0,
          heading: "Ví phút đã nạp",
          minutesLabel: c > 0 ? `C\xf2n ${a(c)}` : "0 phút",
          periodLabel: d(e.balance)
        }
      }),
      settingsMinutesHeading: "Số phút hiện có",
      statusLabel: "refresh_error" === e.loadState ? "Chưa thể cập nhật tài khoản" : ""
    }
  }

  function c(e, t) {
    return u(e, {
      planLabel: t,
      minutesLabel: "",
      periodLabel: "",
      tone: "muted"
    })
  }

  function m(e) {
    var o, m, h, p, g;
    let b;
    if ("logged_out" === e.loadState) return c({
      ...e,
      userEmail: null
    }, "Chưa đăng nhập");
    if (!e.hasTrustedData) {
      if ("refresh_error" === e.loadState) return c(e, "Chưa thể cập nhật tài khoản");
      if ("loading" === e.loadState || null === e.freeEntitlement) return c(e, "Đang kiểm tra tài khoản")
    }
    let f = i(e.license);
    if (e.license && f && t.has(f)) return u(e, {
      planLabel: "Fair Use",
      minutesLabel: `C\xf2n ${a(s(e.license))}`,
      periodLabel: l(e.license),
      tone: "active" === e.license.status ? "active" : "warning"
    });
    let v = (o = e.license) && "trial" === i(o) && "active" === o.status && "active" === o.authorization_status ? Math.max(0, o.included_video_seconds_available ?? o.fair_use_remaining_seconds ?? (o.monthly_fair_use_seconds ?? 0) - (o.monthly_used_seconds ?? 0)) : null;
    if (null !== v && v > 0) return u(e, {
      planLabel: "Dùng thử miễn phí",
      minutesLabel: `C\xf2n ${a(v)}`,
      periodLabel: "",
      tone: "active"
    });
    if (m = e.freeEntitlement, m?.kind === "trial" && "enforce" === m.policy_mode && "converted" !== m.status && "exhausted" !== m.status && "expired" !== m.status && ("active" === m.status || "inactive" === m.status) && Math.max(0, m.bucket_remaining_seconds) > 0) return u(e, {
      planLabel: "Dùng thử miễn phí",
      minutesLabel: `C\xf2n ${a(e.freeEntitlement.bucket_remaining_seconds)}`,
      periodLabel: "",
      tone: "active"
    });
    let y = r(e.balance);
    return y > 0 || "credit_payg" === f ? u(e, {
      planLabel: "Nạp phút",
      minutesLabel: y > 0 ? `C\xf2n ${a(y)}` : "0 phút",
      periodLabel: d(e.balance),
      tone: y > 0 ? "active" : "warning"
    }) : (h = e.freeEntitlement, h?.kind === "trial" && "enforce" === h.policy_mode && ("exhausted" === h.status || "expired" === h.status || "active" === h.status && h.bucket_remaining_seconds <= 0)) ? u(e, {
      planLabel: "Dùng thử đã hết",
      minutesLabel: "0 phút",
      periodLabel: "",
      tone: "warning"
    }) : (p = e.license, g = e.freeEntitlement, (b = i(p)) && n.has(b) && g?.kind === "none" && "inactive" === g.status && 0 === g.bucket_remaining_seconds && 0 === g.transition_remaining_seconds) ? u(e, {
      planLabel: "Miễn phí",
      minutesLabel: "0 phút",
      periodLabel: "",
      tone: "muted"
    }) : e.freeEntitlement?.status === "unavailable" ? c(e, "Chưa thể cập nhật tài khoản") : u(e, {
      planLabel: "Miễn phí",
      minutesLabel: "0 phút",
      periodLabel: "",
      tone: "muted"
    })
  }

  function h(e) {
    return e.startsWith("Còn ") ? `c\xf2n ${e.slice(4)}` : e
  }
  e.s(["buildAccountPresentation", 0, m, "buildAdminAccountPresentation", 0, function(e) {
    let t = m(e),
      n = `V\xed nạp th\xeam ${a(r(e.balance))}`,
      i = t.planLabel;
    return "Dùng thử miễn phí" === t.planLabel ? i = `D\xf9ng thử \xb7 ${h(t.minutesLabel)}` : "Dùng thử đã hết" === t.planLabel ? i = "Dùng thử đã hết · 0 phút" : t.minutesLabel && (i = `${t.planLabel} \xb7 ${h(t.minutesLabel)}`), {
      ...t,
      primaryLabel: i,
      secondaryLabel: n
    }
  }, "formatAccountPresentationMinutes", 0, a])
}, 53851, e => {
  "use strict";
  let t = (0, e.i(56420).default)("cloud-download", [
    ["path", {
      d: "M12 13v8l-4-4",
      key: "1f5nwf"
    }],
    ["path", {
      d: "m12 21 4-4",
      key: "1lfcce"
    }],
    ["path", {
      d: "M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284",
      key: "ui1hmy"
    }]
  ]);
  e.s(["CloudDownload", 0, t], 53851)
}, 66794, e => {
  "use strict";
  let t = (0, e.i(56420).default)("settings", [
    ["path", {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }],
    ["circle", {
      cx: "12",
      cy: "12",
      r: "3",
      key: "1v7zrd"
    }]
  ]);
  e.s(["Settings", 0, t], 66794)
}, 67927, e => {
  "use strict";
  let t = (0, e.i(56420).default)("chevron-right", [
    ["path", {
      d: "m9 18 6-6-6-6",
      key: "mthhwq"
    }]
  ]);
  e.s(["ChevronRight", 0, t], 67927)
}, 94004, e => {
  "use strict";
  let t = (0, e.i(56420).default)("history", [
    ["path", {
      d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
      key: "1357e3"
    }],
    ["path", {
      d: "M3 3v5h5",
      key: "1xhq8a"
    }],
    ["path", {
      d: "M12 7v5l4 2",
      key: "1fdv2h"
    }]
  ]);
  e.s(["History", 0, t], 94004)
}, 24071, e => {
  "use strict";
  let t = (0, e.i(56420).default)("chevron-left", [
    ["path", {
      d: "m15 18-6-6 6-6",
      key: "1wnfg3"
    }]
  ]);
  e.s(["ChevronLeft", 0, t], 24071)
}, 49817, e => {
  "use strict";
  let t = (0, e.i(56420).default)("house", [
    ["path", {
      d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
      key: "5wwlr5"
    }],
    ["path", {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "r6nss1"
    }]
  ]);
  e.s(["Home", 0, t], 49817)
}, 67585, (e, t, n) => {
  "use strict";
  Object.defineProperty(n, "__esModule", {
    value: !0
  }), Object.defineProperty(n, "BailoutToCSR", {
    enumerable: !0,
    get: function() {
      return r
    }
  });
  let a = e.r(32061);

  function r({
    reason: e,
    children: t
  }) {
    if ("u" < typeof window) throw Object.defineProperty(new a.BailoutToCSRError(e), "__NEXT_ERROR_CODE", {
      value: "E394",
      enumerable: !1,
      configurable: !0
    });
    return t
  }
}, 9885, (e, t, n) => {
  "use strict";

  function a(e) {
    return e.split("/").map(e => encodeURIComponent(e)).join("/")
  }
  Object.defineProperty(n, "__esModule", {
    value: !0
  }), Object.defineProperty(n, "encodeURIPath", {
    enumerable: !0,
    get: function() {
      return a
    }
  })
}, 52157, (e, t, n) => {
  "use strict";
  Object.defineProperty(n, "__esModule", {
    value: !0
  }), Object.defineProperty(n, "PreloadChunks", {
    enumerable: !0,
    get: function() {
      return l
    }
  });
  let a = e.r(43476),
    r = e.r(74080),
    i = e.r(63599),
    s = e.r(9885),
    o = e.r(43369);

  function l({
    moduleIds: e
  }) {
    if ("u" > typeof window) return null;
    let t = i.workAsyncStorage.getStore();
    if (void 0 === t) return null;
    let n = [];
    if (t.reactLoadableManifest && e) {
      let a = t.reactLoadableManifest;
      for (let t of e) {
        if (!a[t]) continue;
        let e = a[t].files;
        n.push(...e)
      }
    }
    if (0 === n.length) return null;
    let d = (0, o.getAssetTokenQuery)();
    return (0, a.jsx)(a.Fragment, {
      children: n.map(e => {
        let n = `${t.assetPrefix}/_next/${(0,s.encodeURIPath)(e)}${d}`;
        return e.endsWith(".css") ? (0, a.jsx)("link", {
          precedence: "dynamic",
          href: n,
          rel: "stylesheet",
          as: "style",
          nonce: t.nonce
        }, e) : ((0, r.preload)(n, {
          as: "script",
          fetchPriority: "low",
          nonce: t.nonce
        }), null)
      })
    })
  }
}, 69093, (e, t, n) => {
  "use strict";
  Object.defineProperty(n, "__esModule", {
    value: !0
  }), Object.defineProperty(n, "default", {
    enumerable: !0,
    get: function() {
      return d
    }
  });
  let a = e.r(43476),
    r = e.r(71645),
    i = e.r(67585),
    s = e.r(52157);

  function o(e) {
    return {
      default: e && "default" in e ? e.default : e
    }
  }
  let l = {
      loader: () => Promise.resolve(o(() => null)),
      loading: null,
      ssr: !0
    },
    d = function(e) {
      let t = {
          ...l,
          ...e
        },
        n = (0, r.lazy)(() => t.loader().then(o)),
        d = t.loading;

      function u(e) {
        let o = d ? (0, a.jsx)(d, {
            isLoading: !0,
            pastDelay: !0,
            error: null
          }) : null,
          l = !t.ssr || !!t.loading,
          u = l ? r.Suspense : r.Fragment,
          c = t.ssr ? (0, a.jsxs)(a.Fragment, {
            children: ["u" < typeof window ? (0, a.jsx)(s.PreloadChunks, {
              moduleIds: t.modules
            }) : null, (0, a.jsx)(n, {
              ...e
            })]
          }) : (0, a.jsx)(i.BailoutToCSR, {
            reason: "next/dynamic",
            children: (0, a.jsx)(n, {
              ...e
            })
          });
        return (0, a.jsx)(u, {
          ...l ? {
            fallback: o
          } : {},
          children: c
        })
      }
      return u.displayName = "LoadableComponent", u
    }
}, 70703, (e, t, n) => {
  "use strict";
  Object.defineProperty(n, "__esModule", {
    value: !0
  }), Object.defineProperty(n, "default", {
    enumerable: !0,
    get: function() {
      return r
    }
  });
  let a = e.r(55682)._(e.r(69093));

  function r(e, t) {
    let n = {};
    "function" == typeof e && (n.loader = e);
    let r = {
      ...n,
      ...t
    };
    return (0, a.default)({
      ...r,
      modules: r.loadableGenerated?.modules
    })
  }("function" == typeof n.default || "object" == typeof n.default && null !== n.default) && void 0 === n.default.__esModule && (Object.defineProperty(n.default, "__esModule", {
    value: !0
  }), Object.assign(n.default, n), t.exports = n.default)
}, 30335, e => {
  "use strict";
  var t = e.i(43476),
    n = e.i(71645),
    a = e.i(70703),
    r = e.i(46696),
    i = e.i(75157),
    s = e.i(49817),
    o = e.i(80796),
    l = e.i(94004),
    d = e.i(66794),
    u = e.i(24071),
    c = e.i(67927),
    m = e.i(53851),
    h = e.i(70387),
    p = e.i(23827),
    g = e.i(82022),
    b = e.i(19455),
    f = e.i(46798),
    v = e.i(28587),
    y = e.i(54626),
    x = e.i(38991),
    _ = e.i(57342),
    j = e.i(8594),
    k = e.i(15430);
  let S = [{
      icon: s.Home,
      label: "Trang chủ",
      view: "dashboard"
    }, {
      icon: l.History,
      label: "Lịch sử",
      view: "history"
    }, {
      icon: o.Film,
      label: "Trình chỉnh sửa",
      view: "editor"
    }, {
      icon: p.Volume2,
      label: "Text / SRT sang Audio",
      view: "srt-audio"
    }, {
      icon: m.CloudDownload,
      label: "Tải video",
      view: "download"
    }, {
      icon: d.Settings,
      label: "Cài đặt",
      view: "settings"
    }],
    w = {
      active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      muted: "border-border bg-background/70 text-muted-foreground"
    },
    T = [{
      label: "Zalo",
      href: "https://zalo.me/0981478480",
      ariaLabel: "Liên hệ Zalo",
      Icon: function({
        className: e
      }) {
        return (0, t.jsxs)("svg", {
          className: e,
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          fill: "none",
          children: [(0, t.jsx)("path", {
            d: "M5.75 4.5h12.5a2.75 2.75 0 0 1 2.75 2.75v8.2a2.75 2.75 0 0 1-2.75 2.75h-5.7l-4.3 2.35v-2.35h-2.5A2.75 2.75 0 0 1 3 15.45v-8.2A2.75 2.75 0 0 1 5.75 4.5Z",
            fill: "currentColor"
          }), (0, t.jsx)("path", {
            d: "M7.15 14.35h4.05v-1.2H8.95l2.25-3.2v-1H7.35v1.2h2.1l-2.3 3.22v.98Zm5.05 0h1.28v-2.58c0-.73.38-1.19.98-1.19.55 0 .86.36.86 1v2.77h1.28v-3c0-1.13-.64-1.86-1.68-1.86-.62 0-1.12.25-1.44.72V9.6H12.2v4.75Z",
            fill: "white"
          })]
        })
      },
      className: "text-[#0068ff]"
    }, {
      label: "Telegram",
      href: "https://t.me/hanv123s",
      ariaLabel: "Liên hệ Telegram",
      Icon: function({
        className: e
      }) {
        return (0, t.jsx)("svg", {
          className: e,
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          fill: "none",
          children: (0, t.jsx)("path", {
            d: "M21.35 4.78 18.3 19.13c-.23 1.02-.83 1.27-1.68.79l-4.65-3.43-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73 8.62-7.79c.38-.33-.08-.52-.58-.19L6.5 13.1l-4.58-1.43c-1-.31-1.02-1 .21-1.48L20.03 3.3c.83-.31 1.55.19 1.32 1.48Z",
            fill: "currentColor"
          })
        })
      },
      className: "text-[#229ed9]"
    }],
    P = [{
      label: "TTSsieure.com",
      href: "https://ttssieure.com/",
      tooltip: "Tạo giọng đọc chất lượng cao giá rẻ.",
      ariaLabel: "Mở TTSsieure.com",
      Icon: g.ExternalLink
    }];

  function C() {
    let {
      currentView: e,
      openAccountPricingSettings: a,
      leaveEditor: r,
      sidebarCollapsed: s,
      toggleSidebar: l
    } = (0, x.useAppStore)(), d = (0, j.useTerminalProjectStore)(e => e.active?.projectId ?? null), {
      token: m,
      user: p,
      license: g,
      balance: C,
      freeEntitlement: A,
      accountStatusState: L,
      authSessionState: M,
      hasTrustedAccountData: O,
      loading: R,
      refreshCloudStatus: N
    } = (0, _.useCloudStore)(), [E, I] = (0, n.useState)(!1), $ = (0, n.useRef)(null), D = (0, n.useRef)(0), q = !s || E, U = (0, v.buildAccountPresentation)({
      loadState: (0, k.hasActiveAccountSession)({
        token: m,
        authSessionState: M
      }) ? L : "logged_out",
      userEmail: p?.email ?? null,
      license: g,
      balance: C,
      freeEntitlement: A,
      hasTrustedData: O
    }), V = [U.planLabel, U.userEmail, U.periodLabel, U.minutesLabel, U.statusLabel].filter(Boolean).join(" · ");
    (0, n.useEffect)(() => {
      if (!m) {
        $.current = null, D.current = 0;
        return
      }
      R || $.current === m || ($.current = m, D.current = Date.now(), N({
        background: !0,
        suppressErrors: !0
      }))
    }, [R, N, m]), (0, n.useEffect)(() => {
      if (!m) {
        D.current = 0;
        return
      }
      let e = () => {
        if ("hidden" === document.visibilityState) return;
        let e = Date.now();
        R || e - D.current < 3e4 || (D.current = e, N({
          background: !0,
          suppressErrors: !0
        }))
      };
      return window.addEventListener("focus", e), document.addEventListener("visibilitychange", e), () => {
        window.removeEventListener("focus", e), document.removeEventListener("visibilitychange", e)
      }
    }, [R, N, m]);
    let z = () => {
        s && I(!0)
      },
      B = () => {
        I(!1)
      };
    return (0, t.jsx)(f.TooltipProvider, {
      delayDuration: 0,
      children: (0, t.jsxs)("aside", {
        onMouseEnter: z,
        onMouseLeave: B,
        onFocusCapture: z,
        onBlurCapture: e => {
          let t = e.relatedTarget;
          t && e.currentTarget.contains(t) || B()
        },
        className: (0, i.cn)("flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transition-all duration-300 ease-in-out relative", q ? "w-56" : "w-16"),
        children: [(0, t.jsxs)("div", {
          className: "flex items-center gap-3 px-4 h-14 border-b border-[var(--sidebar-border)]",
          children: [(0, t.jsx)("div", {
            className: "flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary shrink-0",
            children: (0, t.jsx)(o.Film, {
              className: "w-4 h-4"
            })
          }), q && (0, t.jsxs)("div", {
            className: "animate-in overflow-hidden",
            children: [(0, t.jsx)("h1", {
              className: "text-sm font-bold text-foreground whitespace-nowrap",
              children: y.BRAND.domain
            }), (0, t.jsx)("p", {
              className: "text-[10px] text-muted-foreground whitespace-nowrap",
              children: y.BRAND.productName
            })]
          })]
        }), (0, t.jsxs)("nav", {
          className: "flex-1 py-3 px-2 space-y-1",
          children: [S.map(n => {
            let a = e === n.view,
              s = n.icon;
            return (0, t.jsxs)(f.Tooltip, {
              children: [(0, t.jsx)(f.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsxs)("button", {
                  "data-testid": `desktop-nav-${n.view}`,
                  "aria-current": a ? "page" : void 0,
                  onClick: () => void r(n.view, d),
                  className: (0, i.cn)("flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200", a ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-[var(--sidebar-hover)] hover:text-foreground"),
                  children: [(0, t.jsx)(s, {
                    className: (0, i.cn)("w-4 h-4 shrink-0", a && "text-primary")
                  }), q && (0, t.jsx)("span", {
                    className: "whitespace-nowrap",
                    children: n.label
                  }), a && q && (0, t.jsx)("div", {
                    className: "ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  })]
                })
              }), !q && (0, t.jsx)(f.TooltipContent, {
                side: "right",
                className: "text-xs",
                children: n.label
              })]
            }, n.view)
          }), (0, t.jsxs)("div", {
            "data-testid": "desktop-sidebar-other-tools",
            className: "mt-3 border-t border-[var(--sidebar-border)] pt-3",
            children: [q ? (0, t.jsx)("p", {
              className: "px-1 pb-1 text-xs font-semibold text-muted-foreground",
              children: "Công cụ khác"
            }) : null, (0, t.jsx)("div", {
              className: "grid gap-1.5",
              children: P.map(({
                label: e,
                href: n,
                tooltip: a,
                ariaLabel: r,
                Icon: s
              }) => (0, t.jsxs)(f.Tooltip, {
                children: [(0, t.jsx)(f.TooltipTrigger, {
                  asChild: !0,
                  children: (0, t.jsxs)("a", {
                    href: n,
                    target: "_blank",
                    rel: "noreferrer",
                    "aria-label": r,
                    className: (0, i.cn)("flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/70 text-xs font-medium transition-colors hover:bg-[var(--sidebar-hover)] hover:text-foreground", q ? "px-2" : "px-0"),
                    children: [(0, t.jsx)(s, {
                      className: "h-4 w-4 shrink-0 text-muted-foreground"
                    }), q ? (0, t.jsx)("span", {
                      className: "truncate",
                      children: e
                    }) : null]
                  })
                }), (0, t.jsx)(f.TooltipContent, {
                  side: "right",
                  className: "text-xs",
                  children: a
                })]
              }, n))
            })]
          })]
        }), (0, t.jsxs)("div", {
          "data-testid": "desktop-sidebar-contact-links",
          className: "px-2 pb-2",
          children: [q ? (0, t.jsx)("p", {
            className: "px-1 pb-1 text-xs font-semibold text-muted-foreground",
            children: "Báo lỗi/Góp ý/Hỗ trợ/Nâng cấp"
          }) : null, (0, t.jsx)("div", {
            className: (0, i.cn)("grid gap-1.5", q ? "grid-cols-2" : "grid-cols-1"),
            children: T.map(({
              label: e,
              href: n,
              ariaLabel: a,
              Icon: r,
              className: s
            }) => (0, t.jsxs)(f.Tooltip, {
              children: [(0, t.jsx)(f.TooltipTrigger, {
                asChild: !0,
                children: (0, t.jsxs)("a", {
                  href: n,
                  target: "_blank",
                  rel: "noreferrer",
                  "aria-label": a,
                  className: (0, i.cn)("flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/70 text-xs font-medium transition-colors hover:bg-[var(--sidebar-hover)] hover:text-foreground", q ? "px-2" : "px-0"),
                  children: [(0, t.jsx)(r, {
                    className: (0, i.cn)("h-4 w-4 shrink-0", s)
                  }), q ? (0, t.jsx)("span", {
                    className: "truncate",
                    children: e
                  }) : null]
                })
              }), (0, t.jsx)(f.TooltipContent, {
                side: "right",
                className: "text-xs",
                children: a
              })]
            }, n))
          })]
        }), (0, t.jsx)("div", {
          className: "px-2 pb-2",
          children: (0, t.jsxs)(f.Tooltip, {
            children: [(0, t.jsx)(f.TooltipTrigger, {
              asChild: !0,
              children: (0, t.jsx)("button", {
                type: "button",
                "data-testid": "desktop-sidebar-account-summary",
                onClick: () => {
                  r("settings", d).then(a)
                },
                className: (0, i.cn)("w-full rounded-lg border text-left transition-colors hover:bg-[var(--sidebar-hover)]", q ? "px-2.5 py-2" : "flex h-10 items-center justify-center px-0", w[U.tone]),
                children: q ? (0, t.jsxs)("div", {
                  className: "min-w-0",
                  children: [(0, t.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [(0, t.jsx)(h.CreditCard, {
                      className: "h-3.5 w-3.5 shrink-0"
                    }), (0, t.jsx)("p", {
                      className: "truncate text-xs font-semibold",
                      children: U.planLabel
                    })]
                  }), U.periodLabel ? (0, t.jsx)("p", {
                    className: "mt-1 truncate text-[10px] text-current/75",
                    children: U.periodLabel
                  }) : null, U.minutesLabel ? (0, t.jsx)("p", {
                    className: "mt-0.5 truncate text-[10px] font-medium",
                    children: U.minutesLabel
                  }) : null, U.statusLabel ? (0, t.jsx)("p", {
                    className: "mt-0.5 truncate text-[10px] text-current/75",
                    children: U.statusLabel
                  }) : null]
                }) : (0, t.jsx)(h.CreditCard, {
                  className: "h-4 w-4"
                })
              })
            }), (0, t.jsx)(f.TooltipContent, {
              side: "right",
              className: "max-w-64 text-xs",
              children: V
            })]
          })
        }), (0, t.jsx)("div", {
          className: "p-2 border-t border-[var(--sidebar-border)]",
          children: (0, t.jsx)(b.Button, {
            variant: "ghost",
            size: "icon",
            onClick: l,
            className: "w-full h-8 text-muted-foreground hover:text-foreground",
            children: s ? (0, t.jsx)(c.ChevronRight, {
              className: "w-4 h-4"
            }) : (0, t.jsx)(u.ChevronLeft, {
              className: "w-4 h-4"
            })
          })
        })]
      })
    })
  }

  function A() {
    return (0, t.jsx)("div", {
      className: "h-8 w-40 rounded-md bg-muted/60",
      "aria-hidden": "true"
    })
  }
  let L = (0, a.default)(() => e.A(78454).then(e => e.HeaderTaskBadge), {
      loadableGenerated: {
        modules: [49020]
      },
      loading: () => null
    }),
    M = (0, a.default)(() => e.A(10686).then(e => e.HeaderActions), {
      loadableGenerated: {
        modules: [75983]
      },
      loading: () => (0, t.jsx)(A, {})
    });

  function O() {
    let {
      currentView: e
    } = (0, x.useAppStore)();
    return (0, t.jsxs)("header", {
      "data-testid": "desktop-app-header",
      className: "flex items-center justify-between h-14 px-5 border-b border-border bg-card/50 backdrop-blur-sm",
      children: [(0, t.jsxs)("div", {
        className: "flex items-center gap-4",
        children: [(0, t.jsx)("h2", {
          className: "text-sm font-semibold",
          children: (() => {
            switch (e) {
              case "dashboard":
                return "Trang chủ";
              case "editor":
                return "Trình chỉnh sửa video";
              case "history":
                return "Lịch sử";
              case "srt-audio":
                return "Text / SRT sang Audio";
              case "download":
                return "Tải video";
              case "settings":
                return "Cài đặt";
              default:
                return y.BRAND.productName
            }
          })()
        }), (0, t.jsx)(L, {})]
      }), (0, t.jsx)(M, {})]
    })
  }
  var R = e.i(6285);
  let N = () => () => {},
    E = () => !0,
    I = () => !1;
  var $ = e.i(90509);
  e.i(89268);
  var D = e.i(30797),
    q = e.i(81341);
  let U = "dichvideo_app_first_open_recorded_at";

  function V() {
    return n.default.useEffect(() => {
      if (!(0, q.isTauri)() || window.localStorage.getItem(U)) return;
      let e = !1;
      return (async () => {
        let t = null;
        try {
          t = await (0, D.getAppVersion)()
        } catch {
          t = null
        }
        if (e) return;
        let n = (0, $.getOrCreateMarketingVisitorId)();
        window.localStorage.setItem(U, new Date().toISOString()), (0, $.recordMarketingFunnelEvent)({
          event: "app_first_open",
          path: "/app",
          visitor_id: n,
          metadata: {
            surface: "desktop",
            app_version: t
          }
        })
      })(), () => {
        e = !0
      }
    }, []), null
  }
  var z = e.i(68476),
    B = e.i(21826),
    F = e.i(48357),
    H = e.i(7787);
  let J = new Set(["stale_protected_session", "sidecar_binding_mismatch", "invalid_output_root", "missing_file"]);

  function G(e) {
    let t = new Map;
    for (let n of e) {
      let e = (0, F.normalizeDesktopProcessingSession)(n.processingSession);
      e && t.set(e.job_id, e)
    }
    return [...t.values()].sort((e, t) => e.job_id.localeCompare(t.job_id))
  }

  function K(e) {
    return [...new Set(e)].sort((e, t) => e.localeCompare(t))
  }
  async function Z(e, t) {
    return (0, H.recoverEngineVnextMediaArtifacts)({
      protectedJobs: G(e).map(e => ({
        jobId: e.job_id,
        sourcePinPath: e.source_pin_path,
        nativeOutputRootPath: e.native_output_root_path
      })),
      protectedTerminalJobIds: K(t)
    })
  }
  var Q = e.i(675),
    W = e.i(64581),
    Y = e.i(44077),
    X = e.i(65991);

  function ee(e, t) {
    let n = e && "object" == typeof e ? Reflect.get(e, "code") : null;
    return "string" == typeof n && /^[a-z][a-z0-9_]{0,127}$/.test(n) ? n : t
  }

  function et() {
    let e = (0, _.useCloudStore)(e => e.token),
      t = (0, _.useCloudStore)(e => e.user?.id ?? null),
      a = (0, _.useCloudStore)(e => e.cloudStatusFetchedAt),
      r = (0, _.useCloudStore)(e => e.terminalOutboxSnapshot),
      i = (0, X.useVideoStore)(e => e.refreshTerminalAdmission),
      s = (0, X.useVideoStore)(e => e.syncProjectHistoryFromManifests),
      o = (0, X.useVideoStore)(e => e.projectHistoryHydrationState),
      l = (0, X.useVideoStore)(e => e.videos),
      d = n.useRef(null),
      u = n.useRef(null),
      c = n.useRef(new Set),
      m = n.useMemo(() => r?.items.map(e => e.job_id) ?? [], [r]),
      h = n.useMemo(() => JSON.stringify({
        sessions: G(l).map(e => ({
          jobId: e.job_id,
          sourcePinPath: e.source_pin_path,
          nativeOutputRootPath: e.native_output_root_path
        })),
        terminalJobIds: K(m)
      }), [m, l]);
    n.useEffect(() => {
      let e = function({
        execute: e,
        schedule: t,
        cancel: n,
        retryDelaysMs: a = [1e3, 5e3, 3e4]
      }) {
        let r = new Map,
          i = null,
          s = null,
          o = null,
          l = null,
          d = null,
          u = !1,
          c = () => {
            o && (n(o.handle), o = null)
          },
          m = n => {
            u || (i = n.signature, e(n.input).then(() => {
              if (u || (i = null, l = n.signature, r.delete(n.signature), !s)) return;
              let e = s;
              s = null, m(e)
            }, () => {
              if (u) return;
              if (i = null, s) {
                let e = s;
                s = null, m(e);
                return
              }
              let e = (r.get(n.signature) ?? 0) + 1;
              r.set(n.signature, e);
              let l = a[e - 1];
              if (void 0 === l) {
                d = n.signature;
                return
              }
              o = {
                handle: t(() => {
                  o = null, u || d === n.signature || m(n)
                }, l),
                request: n
              }
            }))
          };
        return {
          request(e, t) {
            if (u || !e) return;
            if (e === i) {
              s = null;
              return
            }
            if (e === o?.request.signature) return;
            if (e === s?.signature) {
              s = {
                signature: e,
                input: t
              };
              return
            }
            let n = {
              signature: e,
              input: t
            };
            if (null !== i) {
              r.clear(), l = null, d = null, s = n;
              return
            }
            e !== l && e !== d && (c(), r.clear(), l = null, d = null, m(n))
          },
          dispose() {
            u || (u = !0, s = null, c())
          }
        }
      }({
        execute: async e => {
          try {
            let t = await Z(e.videos, e.terminalJobIds);
            await (0, D.appendAppLog)("info", `[native-media-recovery] source_pins_deleted=${t.sourcePinsDeleted} source_pins_retained=${t.sourcePinsRetained} cleanup_retried=${t.cleanupWorkspacesRetried} cleanup_pending=${t.cleanupPending} orphans_removed=${t.orphansRemoved} project_audio_recovered=${t.projectAudioRecovered} project_audio_pending=${t.projectAudioRecoveryPending}`).catch(() => void 0)
          } catch (e) {
            throw await (0, D.appendAppLog)("warn", `[native-media-recovery] failed code=${function(e){if(e&&"object"==typeof e){let t=Reflect.get(e,"code");if("string"==typeof t&&/^native_media_recovery_[a-z0-9_]+$/.test(t))return t}let t=e instanceof Error?e.message:String(e??"");return t.match(/\bnative_media_recovery_[a-z0-9_]+\b/)?.[0]??"native_media_recovery_failed"}(e)} subreason=${function(e){if(!e||"object"!=typeof e)return"unavailable";let t=Reflect.get(e,"diagnosticCode"),n=Reflect.get(e,"diagnostic_code"),a="string"==typeof t?t:n;return"string"==typeof a&&J.has(a)?a:"unavailable"}(e)}`).catch(() => void 0), e
          }
        },
        schedule: (e, t) => window.setTimeout(e, t),
        cancel: e => window.clearTimeout(e)
      });
      return u.current = e, () => {
        u.current === e && (u.current = null), e.dispose()
      }
    }, []), n.useEffect(() => {
      (0, q.isTauri)() && "idle" === o && s().catch(async e => {
        await (0, D.appendAppLog)("warn", `[project-history] startup_sync_failed code=${ee(e,"project_history_startup_sync_failed")}`).catch(() => void 0)
      })
    }, [o, s]), n.useEffect(() => {
      if (!(0, q.isTauri)() || "ready" !== o) return;
      let e = (0, Q.claimTerminalAdmissionRefreshes)(l, c.current);
      if (0 === e.length) return;
      let t = !1;
      return (async () => {
        for (let {
            videoId: n
          }
          of e) {
          if (t) return;
          await i(n).catch(async e => {
            await (0, D.appendAppLog)("warn", `[terminal-project] admission_refresh_failed code=${ee(e,"terminal_project_admission_refresh_failed")} video=${n}`).catch(() => void 0)
          })
        }
      })(), () => {
        t = !0
      }
    }, [i, o, l]);
    let p = n.useCallback(() => {
      if (!(0, q.isTauri)() || "ready" !== o) return Promise.resolve();
      if (d.current) return d.current;
      let e = (async () => {
        let e = await (0, H.reconcileEngineVnextProcessingProjects)(),
          t = _.useCloudStore.getState(),
          n = e.filter(e => "settlement_pending" === e.disposition && "authorization_reconciliation_pending" === e.reasonCode).map(e => e.jobId);
        if (t.token && t.user && n.length > 0) {
          let t = (await Promise.all(n.map(async e => {
            try {
              let t = await (0, W.withFreshAuthToken)(_.useCloudStore.getState, _.useCloudStore.setState, (t, n) => z.cloudApi.getJob(t, n, e));
              return {
                jobId: e,
                status: t.status,
                errorCode: t.error_code ?? void 0,
                updatedAt: t.updated_at
              }
            } catch (t) {
              if (t instanceof B.CloudApiError && 404 === t.status) return {
                jobId: e,
                status: "not_found",
                updatedAt: new Date().toISOString()
              };
              return null
            }
          }))).filter(e => null !== e);
          t.length > 0 && (e = await (0, H.reconcileEngineVnextProcessingProjects)({
            jobObservations: t
          }))
        }(0, Y.applyNativeProcessingSettlements)(e), e.some(e => "completed_ready" === e.disposition) && (await s(), (0, Y.applyNativeProcessingSettlements)(e))
      })().finally(() => {
        d.current === e && (d.current = null)
      });
      return d.current = e, e
    }, [o, s]);
    return n.useEffect(() => {
      let e = () => {
        p().catch(async e => {
          await (0, D.appendAppLog)("warn", `[processing-settlement] reconcile_failed code=${ee(e,"processing_reconciliation_failed")}`).catch(() => void 0)
        })
      };
      window.addEventListener("online", e);
      let t = Y.useQueueStore.persist.onFinishHydration(e);
      return e(), () => {
        window.removeEventListener("online", e), t()
      }
    }, [p]), n.useEffect(() => {
      e && t && p().catch(() => void 0)
    }, [a, p, e, t]), n.useEffect(() => {
      (0, q.isTauri)() && "ready" === o && null !== r && u.current?.request(h, {
        videos: l,
        terminalJobIds: m
      })
    }, [h, o, m, r, l]), null
  }
  var en = e.i(69160),
    ea = e.i(81795),
    er = e.i(33228),
    ei = e.i(4073),
    es = e.i(44318);

  function eo() {
    let e = (0, ei.useSeriesBatchStore)(e => e.panelOpen),
      t = (0, ei.useSeriesBatchStore)(e => e.autoExportActive),
      a = (0, ei.useSeriesBatchStore)(e => e.outputDir),
      r = (0, ei.useSeriesBatchStore)(e => e.items),
      i = (0, ei.useSeriesBatchStore)(e => e.exportBatchIds),
      s = (0, ei.useSeriesBatchStore)(e => e.setItemExportStatuses),
      o = (0, X.useVideoStore)(e => e.videos),
      l = (0, er.useExportStore)(e => e.jobs),
      d = n.default.useMemo(() => r.filter(e => "skip" !== e.kind), [r]);
    return n.default.useEffect(() => {
      if (0 === i.length) return;
      let e = new Set(i),
        t = l.filter(t => e.has(t.batchId)),
        n = d.flatMap(e => {
          var n;
          let a = (0, en.resolveSeriesBatchItemVideo)(e, o);
          if (!a) return [];
          let r = [...t].reverse().find(e => e.videoId === a.id),
            i = r ? "queued" === (n = r.status) ? "queued" : "processing" === n ? "exporting" : "completed" === n ? "delivered" : "delivery_failed" === n || "error" === n || "canceled" === n ? "failed" : null : null;
          return i ? [{
            videoId: a.id,
            exportStatus: i
          }] : []
        });
      n.length > 0 && s(n)
    }, [d, i, l, s, o]), n.default.useEffect(() => {
      if (!e || !t) return;
      let n = a.trim();
      if (!n || (0, en.collectSeriesBatchOutputCollisions)(d.map(e => e.path), n).length > 0) return;
      let r = d.flatMap(e => {
        let n = (0, en.resolveSeriesBatchItemVideo)(e, o);
        return (0, en.seriesBatchAutoExportEligible)(e, n, t) && n ? [n] : []
      });
      r.length > 0 && function(e, t) {
        let n, a = ei.useSeriesBatchStore.getState(),
          r = a.items.flatMap(t => {
            if ("waiting" !== t.exportStatus && "failed" !== t.exportStatus) return [];
            let n = (0, en.resolveSeriesBatchItemVideo)(t, e);
            return n ? [n] : []
          });
        if (0 === r.length) return;
        let i = (n = es.useSubtitleStore.getState(), r.map(e => {
            let a = e.nleDocument?.subtitleStyle ?? n.globalStyle;
            return {
              video: e,
              savePath: (0, en.joinSeriesBatchExportPath)(t, e.path),
              defaultOutputDir: t,
              subtitles: (0, ea.getRenderSubtitlesForVideo)(n.subtitles, n.renderSubtitles, e.id),
              globalStyle: a,
              exportLayers: e.exportLayers ?? [],
              subtitleRenderSize: e.width > 0 && e.height > 0 ? {
                width: e.width,
                height: e.height
              } : null,
              subtitlesEnabled: !1 !== a.enabled,
              overwriteExisting: !0,
              preservePreparedSubtitleTiming: (0, ea.hasRenderSubtitlesForVideo)(n.renderSubtitles, e.id)
            }
          })),
          {
            batchId: s,
            jobIds: o
          } = er.useExportStore.getState().startManualExportBatch(i);
        0 === o.length || (a.trackExportBatch(s), a.setItemExportStatuses(r.map(e => ({
          videoId: e.id,
          exportStatus: "queued"
        }))), o.length)
      }(r, n)
    }, [t, d, a, e, o]), null
  }
  var el = e.i(54302),
    ed = e.i(63511),
    eu = e.i(68834),
    ec = e.i(3007);
  let em = e => e instanceof Error ? e.message : String(e),
    eh = (0, eu.create)((e, t) => ({
      status: null,
      installing: !1,
      loading: !1,
      cancelRequested: !1,
      backgroundStarted: !1,
      progress: null,
      error: null,
      prepareInBackground: async () => {
        if (!t().backgroundStarted) {
          e({
            backgroundStarted: !0
          });
          try {
            let n = await (0, ec.getVieNeuRuntimeStatus)();
            e({
              status: n
            }), n.ready || !n.downloadable || t().cancelRequested || await t().install()
          } catch {}
        }
      },
      refresh: async () => {
        if (!t().loading && !t().installing) {
          e({
            loading: !0,
            error: null
          });
          try {
            e({
              status: await (0, ec.getVieNeuRuntimeStatus)()
            })
          } catch (t) {
            e({
              error: em(t)
            })
          } finally {
            e({
              loading: !1
            })
          }
        }
      },
      install: async () => {
        let n;
        if (!t().installing) {
          e({
            installing: !0,
            error: null,
            progress: null,
            cancelRequested: !1
          });
          try {
            let a = await (0, ec.getVieNeuRuntimeStatus)();
            if (e({
                status: a
              }), t().cancelRequested || a.ready) return;
            if (!a.downloadable) throw Error(a.error ?? "Gói tài nguyên chưa được công bố.");
            if (n = await (0, ec.listenVieNeuRuntimeProgress)(t => e({
                progress: t
              })), t().cancelRequested) return;
            await (0, ec.installVieNeuRuntime)();
            let r = await (0, ec.getVieNeuRuntimeStatus)();
            if (e({
                status: r
              }), !r.ready) throw Error(r.error ?? "Chưa cài xong tài nguyên giọng đọc.")
          } catch (t) {
            e({
              error: em(t)
            })
          } finally {
            n?.(), e({
              installing: !1
            })
          }
        }
      },
      cancel: async () => {
        e({
          cancelRequested: !0
        });
        try {
          await (0, ec.cancelVieNeuRuntimeInstall)()
        } catch (t) {
          e({
            error: em(t)
          })
        }
      }
    }));
  var ep = e.i(79212);
  let eg = "premium-voices-runtime-download";

  function eb() {
    return (0, n.useEffect)(() => {
      if (!(0, q.isTauri)()) return;
      let e = !1,
        t = !1;
      ed.useVieNeuCatalogStore.getState().load();
      let n = () => {
          let t = eh.getState(),
            n = (0, el.getVieNeuVoiceOptions)().length;
          if (t.installing && t.status?.downloadable && !t.status.ready) {
            e = !0;
            let a = Math.max(0, Math.min(100, Math.floor(t.progress?.percent ?? 0)));
            r.toast.loading(t.progress?.stage === "installing" ? `Đang c\xe0i ${n} giọng cao cấp…` : `Đang tải ${n} giọng cao cấp… ${a}%`, {
              id: eg,
              position: "top-right",
              duration: 1 / 0,
              action: {
                label: "Để sau",
                onClick: () => {
                  eh.getState().cancel()
                }
              }
            })
          } else e && !t.installing && (e = !1, t.cancelRequested ? r.toast.dismiss(eg) : t.status?.ready ? r.toast.success(`${n} giọng cao cấp đ\xe3 sẵn s\xe0ng`, {
            id: eg,
            position: "top-right",
            duration: 4e3,
            action: void 0
          }) : r.toast.error("Chưa tải xong giọng cao cấp. Bạn vẫn có thể dùng ứng dụng.", {
            id: eg,
            position: "top-right",
            duration: 6e3,
            action: {
              label: "Thử lại",
              onClick: () => {
                eh.getState().install()
              }
            }
          }))
        },
        a = eh.subscribe(n);
      n();
      let i = setTimeout(() => {
        ed.useVieNeuCatalogStore.getState().load().then(() => {
          t || ((0, el.getVieNeuVoiceOptions)().length > 0 || ep.useVieNeuTurboStore.getState().voices.length > 0) && eh.getState().prepareInBackground()
        })
      }, 1e3);
      return () => {
        t = !0, clearTimeout(i), a(), r.toast.dismiss(eg)
      }
    }, []), null
  }
  var ef = e.i(91865);

  function ev({
    label: e = "Dang tai giao dien..."
  }) {
    return (0, t.jsx)("div", {
      className: "flex h-full min-h-0 items-center justify-center bg-background",
      children: (0, t.jsx)("div", {
        className: "h-8 w-40 animate-pulse rounded-md bg-muted",
        "aria-label": e
      })
    })
  }

  function ey() {
    Promise.all([e.A(4555), e.A(93240), e.A(69345), e.A(49980), e.A(51797), e.A(59634)])
  }
  let ex = (0, a.default)(() => e.A(4555).then(e => e.DashboardPage), {
      loading: () => (0, t.jsx)(ev, {
        label: "Dang tai trang chu..."
      })
    }),
    e_ = (0, a.default)(() => e.A(93240).then(e => e.EditorPage), {
      loading: () => (0, t.jsx)(ev, {
        label: "Dang tai trinh chinh sua..."
      })
    }),
    ej = (0, a.default)(() => e.A(69345).then(e => e.HistoryPage), {
      loading: () => (0, t.jsx)(ev, {
        label: "Dang tai lich su..."
      })
    }),
    ek = (0, a.default)(() => e.A(49980).then(e => e.SrtAudioPage), {
      loading: () => (0, t.jsx)(ev, {
        label: "Đang tải Text / SRT sang Audio..."
      })
    }),
    eS = (0, a.default)(() => e.A(51797).then(e => e.DownloadPage), {
      loading: () => (0, t.jsx)(ev, {
        label: "Đang tải trang tải video..."
      })
    }),
    ew = (0, a.default)(() => e.A(59634).then(e => e.SettingsPage), {
      loading: () => (0, t.jsx)(ev, {
        label: "Dang tai cai dat..."
      })
    }),
    eT = (0, a.default)(() => e.A(97682).then(e => e.EnginePreparationDialog), {
      loadableGenerated: {
        modules: [49702]
      },
      loading: () => null
    }),
    eP = (0, a.default)(() => e.A(30680).then(e => e.ProcessingGuidanceDialog), {
      loadableGenerated: {
        modules: [45033]
      },
      loading: () => null
    }),
    eC = (0, a.default)(() => e.A(32578).then(e => e.EngineReadinessGate), {
      loadableGenerated: {
        modules: [98446]
      },
      loading: () => null
    }),
    eA = (0, a.default)(() => e.A(3072).then(e => e.NativeVnextWarmup), {
      loadableGenerated: {
        modules: [42590]
      },
      loading: () => null
    }),
    eL = (0, a.default)(() => e.A(10193).then(e => e.CapCutLoginDialog), {
      loadableGenerated: {
        modules: [99852]
      },
      loading: () => null
    });

  function eM({
    children: e
  }) {
    let {
      currentView: a,
      setSidebarCollapsed: i
    } = (0, x.useAppStore)(), {
      loadStatus: s
    } = (0, R.useDependencyStore)(), o = (0, n.useSyncExternalStore)(N, E, I);
    return (n.default.useEffect(() => {
      if (!o) return;
      let e = (0, ef.consumeOrphanedNativeResourcePolicyMarker)();
      e && r.toast.warning(e), i(!1), s()
    }, [o, s, i]), n.default.useEffect(() => {
      if (o) {
        if ("requestIdleCallback" in window) {
          let e = window.requestIdleCallback(() => ey(), {
            timeout: 1500
          });
          return () => window.cancelIdleCallback(e)
        }
        let e = globalThis.setTimeout(() => ey(), 300);
        return () => globalThis.clearTimeout(e)
      }
    }, [o]), o) ? (0, t.jsxs)("div", {
      "data-testid": "desktop-app-shell",
      className: "flex h-screen w-screen overflow-hidden bg-background",
      children: [(0, t.jsx)(C, {}), (0, t.jsxs)("div", {
        className: "flex flex-col flex-1 min-w-0 overflow-hidden",
        children: [(0, t.jsx)(O, {}), (0, t.jsx)("main", {
          "data-testid": "desktop-app-main",
          className: "flex-1 overflow-hidden",
          children: (() => {
            if (e) return e;
            switch (a) {
              case "dashboard":
              default:
                return (0, t.jsx)(ex, {});
              case "editor":
                return (0, t.jsx)(e_, {});
              case "history":
                return (0, t.jsx)(ej, {});
              case "srt-audio":
                return (0, t.jsx)(ek, {});
              case "download":
                return (0, t.jsx)(eS, {});
              case "settings":
                return (0, t.jsx)(ew, {})
            }
          })()
        })]
      }), (0, t.jsx)(eT, {}), (0, t.jsx)(eL, {}), (0, t.jsx)(eP, {}), (0, t.jsx)(eC, {}), (0, t.jsx)(eA, {}), (0, t.jsx)(et, {}), (0, t.jsx)(eo, {}), (0, t.jsx)(eb, {}), (0, t.jsx)(V, {})]
    }) : (0, t.jsx)("div", {
      "data-section": "desktop-shell-hydration-placeholder",
      className: "h-screen w-screen bg-background"
    })
  }
  e.s(["default", 0, function() {
    return (0, t.jsx)(eM, {})
  }], 30335)
}, 78454, e => {
  e.v(t => Promise.all(["static/chunks/0~n__a_a_hje0.js"].map(t => e.l(t))).then(() => t(49020)))
}, 10686, e => {
  e.v(t => Promise.all(["static/chunks/146w6qtb-kum0.js"].map(t => e.l(t))).then(() => t(75983)))
}, 98233, e => {
  e.v(t => Promise.all(["static/chunks/13m-as53c.eq1.js"].map(t => e.l(t))).then(() => t(57180)))
}, 5990, e => {
  e.v(e => Promise.resolve().then(() => e(44318)))
}, 82855, e => {
  e.v(e => Promise.resolve().then(() => e(65991)))
}, 68915, e => {
  e.v(e => Promise.resolve().then(() => e(44077)))
}, 55149, e => {
  e.v(e => Promise.resolve().then(() => e(58450)))
}, 4555, e => {
  e.v(t => Promise.all(["static/chunks/0c5w.e4s4uka0.js", "static/chunks/0sgt68puzf6~c.js", "static/chunks/0~hmmhm-vm4.w.js", "static/chunks/0578_tyb29tq-.js", "static/chunks/08cj2w~d99ddx.js", "static/chunks/0vz9yilo41rdx.js", "static/chunks/0z5-dwgrlpd5z.js"].map(t => e.l(t))).then(() => t(17198)))
}, 93240, e => {
  e.v(t => Promise.all(["static/chunks/0c5w.e4s4uka0.js", "static/chunks/0y.ajh1jamial.js", "static/chunks/1019cxawwomjk.js", "static/chunks/03vbltr6fbmbr.js", "static/chunks/0kflgkknl-bqh.js", "static/chunks/047nud66rccod.js", "static/chunks/0.6blbmfgc-ff.js"].map(t => e.l(t))).then(() => t(76722)))
}, 69345, e => {
  e.v(t => Promise.all(["static/chunks/0c5w.e4s4uka0.js", "static/chunks/15q_a17a~wjcd.js", "static/chunks/0gs3bie7w7.f4.js"].map(t => e.l(t))).then(() => t(84635)))
}, 49980, e => {
  e.v(t => Promise.all(["static/chunks/0c5w.e4s4uka0.js", "static/chunks/1208~ab1ynaee.js", "static/chunks/0sgt68puzf6~c.js", "static/chunks/0~.w5vrzb08tf.js", "static/chunks/0sggn.mke39u1.js"].map(t => e.l(t))).then(() => t(45909)))
}, 51797, e => {
  e.v(t => Promise.all(["static/chunks/18curdy6ste4-.js"].map(t => e.l(t))).then(() => t(24360)))
}, 59634, e => {
  e.v(t => Promise.all(["static/chunks/0c5w.e4s4uka0.js", "static/chunks/0p-b1yj12hoys.js", "static/chunks/07tcniedxdc~j.js"].map(t => e.l(t))).then(() => t(25617)))
}, 97682, e => {
  e.v(t => Promise.all(["static/chunks/0xi8jm0fmodh..js", "static/chunks/0c5w.e4s4uka0.js"].map(t => e.l(t))).then(() => t(49702)))
}, 30680, e => {
  e.v(t => Promise.all(["static/chunks/0gz1orkzc~xkl.js", "static/chunks/0c5w.e4s4uka0.js"].map(t => e.l(t))).then(() => t(45033)))
}, 32578, e => {
  e.v(t => Promise.all(["static/chunks/0oj_c9d5yg8k-.js"].map(t => e.l(t))).then(() => t(98446)))
}, 3072, e => {
  e.v(t => Promise.all(["static/chunks/0f.wsbtfpr26..js"].map(t => e.l(t))).then(() => t(42590)))
}, 10193, e => {
  e.v(t => Promise.all(["static/chunks/0q9en4zgk.jcw.js", "static/chunks/0c5w.e4s4uka0.js", "static/chunks/0i03p20awzdw7.js"].map(t => e.l(t))).then(() => t(99852)))
}]);