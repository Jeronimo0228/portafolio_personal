import React, { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://widget.simplybook.me/v2/widget/widget.js";
const CONTAINER_ID = "sbw_c78kvi";

const WIDGET_CONFIG = {
  widget_type: "iframe",
  url: "https://personaljeronimo.simplybook.me",
  theme: "classic",
  theme_settings: {
    timeline_hide_unavailable: "1",
    hide_past_days: "0",
    timeline_show_end_time: "0",
    timeline_modern_display: "as_slots",
    sb_base_color: "#90adc6",
    display_item_mode: "block",
    body_bg_color: "#e9eaec",
    sb_review_image: "",
    btn_color_1: "#fad02c",
    sb_company_label_color: "#ffffff",
    hide_img_mode: "0",
    sb_busy: "#c7b3b3",
    sb_available: "#d6ebff",
  },
  timeline: "modern",
  datepicker: "top_calendar",
  is_rtl: false,
  app_config: {
    clear_session: 0,
    allow_switch_to_ada: 0,
    predefined: [],
  },
};

/** Load SimplyBook once per page. Do not set crossOrigin — their CDN has no CORS ACAO. */
function loadSimplybookScript() {
  if (typeof window.SimplybookWidget === "function") {
    return Promise.resolve();
  }

  const existing = document.querySelector(`script[data-simplybook-widget="1"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (typeof window.SimplybookWidget === "function") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("SimplyBook script failed")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.simplybookWidget = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("SimplyBook script failed"));
    document.body.appendChild(script);
  });
}

function buildFallbackSrc() {
  const params = new URLSearchParams({
    "widget-type": "iframe",
    theme: "classic",
    timeline: "modern",
    datepicker: "top_calendar",
    host_url: typeof window !== "undefined" ? window.location.href : "",
  });
  return `https://personaljeronimo.simplybook.me/v2/?${params.toString()}`;
}

export default function BookingWidget() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [fallbackSrc, setFallbackSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      try {
        await loadSimplybookScript();
        if (cancelled || !containerRef.current) return;

        // Allow remount after React StrictMode cleanup
        if (window.SimplybookWidget) {
          window.SimplybookWidget._instanceCreated = false;
        }

        containerRef.current.innerHTML = "";

        // Pass the DOM node directly (supported by SimplyBook)
        // eslint-disable-next-line no-new
        new window.SimplybookWidget({
          ...WIDGET_CONFIG,
          container_id: containerRef.current,
        });

        // Ensure iframe is tall enough before size postMessage arrives
        const iframe = containerRef.current.querySelector("iframe");
        if (iframe) {
          iframe.style.minHeight = "720px";
          iframe.style.width = "100%";
          iframe.style.border = "0";
          iframe.setAttribute("scrolling", "no");
        }

        if (!cancelled) setStatus("ready");
      } catch {
        if (cancelled) return;
        setFallbackSrc(buildFallbackSrc());
        setStatus("fallback");
      }
    };

    mount();

    return () => {
      cancelled = true;
      // Keep the shared script; only clear this container
      if (containerRef.current) containerRef.current.innerHTML = "";
      if (window.SimplybookWidget) {
        window.SimplybookWidget._instanceCreated = false;
      }
    };
  }, []);

  if (status === "fallback" && fallbackSrc) {
    return (
      <iframe
        title="Reservas SimplyBook"
        src={fallbackSrc}
        className="w-full border-0 block"
        style={{ minHeight: 720, background: "#e9eaec" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div
      id={CONTAINER_ID}
      ref={containerRef}
      className="w-full rounded-sm"
      style={{ minHeight: 720, background: "#e9eaec" }}
      aria-busy={status === "loading"}
      aria-label="Calendario de reservas SimplyBook"
    />
  );
}
