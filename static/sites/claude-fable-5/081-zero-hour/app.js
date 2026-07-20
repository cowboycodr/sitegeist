(() => {
  "use strict";

  /* ---------- Visual evidence: anomaly chart + scrubber ---------- */

  const START_YEAR = 1950;
  // Illustrative global land–ocean anomalies (°C vs 1951–1980), one per year 1950–2025.
  const ANOMALIES = [
    -0.17, -0.07, 0.01, 0.08, -0.13, -0.14, -0.19, 0.05, 0.06, 0.03,
    -0.03, 0.06, 0.03, 0.05, -0.20, -0.11, -0.06, -0.02, -0.08, 0.05,
    0.03, -0.08, 0.01, 0.16, -0.07, -0.01, -0.10, 0.18, 0.07, 0.16,
    0.26, 0.32, 0.14, 0.31, 0.16, 0.12, 0.18, 0.32, 0.39, 0.27,
    0.45, 0.41, 0.22, 0.23, 0.31, 0.45, 0.33, 0.46, 0.61, 0.38,
    0.39, 0.54, 0.63, 0.62, 0.53, 0.68, 0.64, 0.66, 0.54, 0.66,
    0.72, 0.61, 0.65, 0.68, 0.75, 0.90, 1.01, 0.92, 0.85, 0.98,
    1.01, 0.85, 0.89, 1.17, 1.28, 1.29,
  ];

  const chart = document.getElementById("anomaly-chart");
  const scrub = document.getElementById("year-scrub");
  const readYear = document.getElementById("readout-year");
  const readValue = document.getElementById("readout-value");
  const readNote = document.getElementById("readout-note");

  const SVG_NS = "http://www.w3.org/2000/svg";
  const WIDTH = 760;
  const HEIGHT = 300;
  const PAD = { top: 16, right: 12, bottom: 34, left: 44 };
  const MIN_V = -0.4;
  const MAX_V = 1.5;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const yFor = (v) => PAD.top + plotH * (1 - (v - MIN_V) / (MAX_V - MIN_V));
  const zeroY = yFor(0);
  const barW = plotW / ANOMALIES.length;

  const colorFor = (v) => {
    if (v < 0) return "#2e6d7d";
    if (v < 0.3) return "#7d9070";
    if (v < 0.6) return "#c77f45";
    if (v < 0.9) return "#e4552b";
    return "#9c2c12";
  };

  const el = (name, attrs) => {
    const node = document.createElementNS(SVG_NS, name);
    for (const key of Object.keys(attrs)) node.setAttribute(key, attrs[key]);
    return node;
  };

  const bars = [];
  if (chart) {
    // Gridlines and axis labels.
    [-0.4, 0, 0.4, 0.8, 1.2].forEach((v) => {
      const y = yFor(v);
      chart.appendChild(el("line", {
        x1: PAD.left, x2: WIDTH - PAD.right, y1: y, y2: y,
        stroke: v === 0 ? "#14201d" : "rgba(20,32,29,0.15)",
        "stroke-width": v === 0 ? 1.5 : 1,
      }));
      const label = el("text", {
        x: PAD.left - 8, y: y + 4, "text-anchor": "end",
        "font-size": "11", "font-family": "system-ui, sans-serif", fill: "#3d4d48",
      });
      label.textContent = (v > 0 ? "+" : "") + v.toFixed(1);
      chart.appendChild(label);
    });
    [1950, 1975, 2000, 2025].forEach((year) => {
      const x = PAD.left + (year - START_YEAR) * barW + barW / 2;
      const label = el("text", {
        x, y: HEIGHT - 10, "text-anchor": "middle",
        "font-size": "11", "font-family": "system-ui, sans-serif", fill: "#3d4d48",
      });
      label.textContent = String(year);
      chart.appendChild(label);
    });

    ANOMALIES.forEach((v, i) => {
      const x = PAD.left + i * barW;
      const y = v >= 0 ? yFor(v) : zeroY;
      const h = Math.max(1, Math.abs(yFor(v) - zeroY));
      const bar = el("rect", {
        x: x + 0.6, y, width: Math.max(1, barW - 1.2), height: h,
        fill: colorFor(v),
      });
      chart.appendChild(bar);
      bars.push(bar);
    });
  }

  const marker = chart ? el("rect", {
    x: 0, y: PAD.top - 4, width: Math.max(2, barW), height: plotH + 8,
    fill: "none", stroke: "#14201d", "stroke-width": 2,
  }) : null;
  if (chart && marker) chart.appendChild(marker);

  const formatAnomaly = (v) =>
    (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2) + " °C";

  const update = () => {
    if (!scrub) return;
    const year = Number(scrub.value);
    const i = year - START_YEAR;
    const v = ANOMALIES[i];
    if (readYear) readYear.textContent = String(year);
    if (readValue) readValue.textContent = formatAnomaly(v);
    if (readNote) readNote.textContent = v >= 0 ? "above baseline" : "below baseline";
    if (marker) marker.setAttribute("x", PAD.left + i * barW);
    bars.forEach((bar, j) => bar.setAttribute("opacity", j === i ? "1" : "0.82"));
  };

  if (scrub) {
    scrub.addEventListener("input", update);
    update();
  }

  /* ---------- Atlas: accessible tabs ---------- */

  const tabs = Array.from(document.querySelectorAll(".atlas-tab"));
  const panels = Array.from(document.querySelectorAll(".atlas-panel"));

  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        event.preventDefault();
        selectTab(next, true);
      }
    });
  });
})();
