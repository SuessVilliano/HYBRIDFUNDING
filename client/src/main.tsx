import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

initAnalytics();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </HelmetProvider>
);
