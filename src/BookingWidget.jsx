import React, { useEffect, useRef } from "react";

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
  container_id: CONTAINER_ID,
};

/**
 * Loads SimplyBook only from widget.simplybook.me (HTTPS).
 * Avoids re-injecting the script if it is already present.
 */
export default function BookingWidget() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let scriptEl = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    let createdByUs = false;

    const initWidget = () => {
      if (!mountedRef.current) return;
      if (typeof window.SimplybookWidget !== "function") return;
      const container = document.getElementById(CONTAINER_ID);
      if (!container) return;
      container.innerHTML = "";
      // eslint-disable-next-line no-new
      new window.SimplybookWidget(WIDGET_CONFIG);
    };

    if (scriptEl && typeof window.SimplybookWidget === "function") {
      initWidget();
    } else {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.async = true;
        scriptEl.src = SCRIPT_SRC;
        scriptEl.crossOrigin = "anonymous";
        createdByUs = true;
        document.head.appendChild(scriptEl);
      }
      scriptEl.addEventListener("load", initWidget);
    }

    return () => {
      mountedRef.current = false;
      scriptEl?.removeEventListener("load", initWidget);
      if (createdByUs && scriptEl?.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      const container = document.getElementById(CONTAINER_ID);
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div
      id={CONTAINER_ID}
      className="w-full min-h-[640px] rounded-sm overflow-hidden"
      style={{ background: "#e9eaec" }}
      aria-label="Calendario de reservas SimplyBook"
    />
  );
}
