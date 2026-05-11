import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (el: HTMLElement, forceReload?: boolean) => void;
    };
  }
}

const TrustpilotWidget = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.Trustpilot) {
      window.Trustpilot.loadFromElement(ref.current, true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-US"
      data-template-id="56278e9abfbbba0bdcd568bc"
      data-businessunit-id="6a01fe4bc9edb6df38ff2e8c"
      data-style-height="52px"
      data-style-width="100%"
      data-token="101d0d34-70dc-463e-a7d0-9f11e9fee89e"
    >
      <a
        href="https://www.trustpilot.com/review/hybridfunding.co"
        target="_blank"
        rel="noopener noreferrer"
      >
        Trustpilot
      </a>
    </div>
  );
};

export default TrustpilotWidget;
