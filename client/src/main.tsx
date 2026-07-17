import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

initAnalytics();

// Register the PWA service worker (production only — dev servers don't ship /sw.js)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* non-fatal: the site works fine without the service worker */
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </HelmetProvider>
);
