// Lightweight analytics initializer. No-ops when env vars are unset.
// Set the following in Vercel env (and locally as needed):
//   VITE_GA_MEASUREMENT_ID  (e.g. G-XXXXXXXXXX)
//   VITE_POSTHOG_KEY        (e.g. phc_xxxxxxxx)
//   VITE_POSTHOG_HOST       (defaults to https://us.i.posthog.com)
//   VITE_META_PIXEL_ID      (e.g. 1234567890)

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void; init: Function };
    fbq?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const PH_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const PH_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";
const META_PIXEL = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

function loadGA() {
  if (!GA_ID || typeof window === "undefined") return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: true });
}

function loadPostHog() {
  if (!PH_KEY || typeof window === "undefined") return;
  // Posthog snippet (small inline loader)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function(t: any, e: any) {
    let o, n, p, r;
    e.__SV ||
      ((window as any).posthog = e,
      (e._i = []),
      (e.init = function (i: any, s: any, a: any) {
        function g(t: any, e: any) {
          const o = e.split(".");
          if (o.length === 2) { t = t[o[0]]; e = o[1]; }
          t[e] = function (...args: any[]) { t.push([e].concat(args)); };
        }
        ((p = t.createElement("script")).type = "text/javascript"),
          (p.crossOrigin = "anonymous"),
          (p.async = !0),
          (p.src = (s.api_host || PH_HOST) + "/static/array.js"),
          (r = t.getElementsByTagName("script")[0]).parentNode!.insertBefore(p, r);
        let u: any = e;
        for (let v = "init capture identify alias group reset onFeatureFlags".split(" "), w = 0; w < v.length; w++) {
          g(u, v[w]);
        }
        e._i.push([i, s, a]);
      }),
      (e.__SV = 1));
  })(document, (window as any).posthog || []);
  (window as any).posthog.init(PH_KEY, { api_host: PH_HOST, capture_pageview: true });
}

function loadMetaPixel() {
  if (!META_PIXEL || typeof window === "undefined") return;
  /* eslint-disable */
  (function(f: any, b: any, e: any, v: any) {
    if (f.fbq) return;
    const n: any = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    const t = b.createElement(e); t.async = !0; t.src = v;
    const s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq!("init", META_PIXEL);
  window.fbq!("track", "PageView");
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  loadGA();
  loadPostHog();
  loadMetaPixel();
}

export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", event, props || {});
  if (window.posthog) window.posthog.capture(event, props);
  if (window.fbq) window.fbq("trackCustom", event, props || {});
}
