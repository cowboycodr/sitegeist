(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const svgNS = "http://www.w3.org/2000/svg";
  const el = (name, attrs) => {
    const node = document.createElementNS(svgNS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  };

  /* ---------- Hero gauge ---------- */
  const GAUGE_MAX = 2.0;
  const gaugeFill = $("#gauge-fill");
  const gaugeValueEl = $("#gauge-value");
  const cx = 200, cy = 190, r = 160;

  if (gaugeFill) {
    const len = gaugeFill.getTotalLength();
    const target = parseFloat(gaugeValueEl.dataset.target);
    const frac = Math.min(1, target / GAUGE_MAX);
    gaugeFill.style.strokeDasharray = len;
    gaugeFill.style.strokeDashoffset = reduceMotion ? len * (1 - frac) : len;

    // Threshold tick + label at 1.5 C
    const tickGroup = $("#gauge-tick");
    const tf = 1.5 / GAUGE_MAX;
    const ang = Math.PI - tf * Math.PI; // 180deg -> 0deg
    const px = (rad) => cx + rad * Math.cos(ang);
    const py = (rad) => cy - rad * Math.sin(ang);
    tickGroup.appendChild(el("line", { x1: px(r - 10), y1: py(r - 10), x2: px(r + 10), y2: py(r + 10) }));
    const label = el("text", { x: px(r + 26), y: py(r + 26), "text-anchor": "middle", "dominant-baseline": "middle" });
    label.textContent = "1.5";
    tickGroup.appendChild(label);

    const runGauge = () => {
      if (reduceMotion) { gaugeValueEl.textContent = target.toFixed(2); return; }
      requestAnimationFrame(() => { gaugeFill.style.strokeDashoffset = len * (1 - frac); });
      const dur = 1600, t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        gaugeValueEl.textContent = (target * eased).toFixed(2);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { runGauge(); obs.disconnect(); } });
      }, { threshold: 0.4 });
      io.observe(gaugeValueEl);
    } else {
      runGauge();
    }
  }

  /* ---------- Signals ---------- */
  const signals = [
    {
      name: "Atmospheric CO₂", value: "428", unit: "ppm", accent: "#ff5d4b",
      trend: "up", trendText: "+2.4 ppm on the year, highest in ~800,000 years",
      series: [316, 331, 339, 354, 369, 379, 390, 401, 412, 421, 428],
    },
    {
      name: "Global surface temp", value: "+1.36", unit: "°C", accent: "#f2c14e",
      trend: "up", trendText: "warmest years on record cluster in the last decade",
      series: [0.28, 0.18, 0.42, 0.35, 0.62, 0.55, 0.74, 0.98, 1.02, 1.18, 1.36],
    },
    {
      name: "Mean sea level", value: "+101", unit: "mm", accent: "#3fd0c9",
      trend: "up", trendText: "rise since 1993, and the rate is accelerating",
      series: [0, 12, 24, 33, 45, 56, 66, 78, 88, 95, 101],
    },
    {
      name: "Arctic sea ice min", value: "4.28", unit: "M km²", accent: "#7aa7ff",
      trend: "down", trendText: "September minimum, down roughly 13% per decade",
      series: [7.5, 7.2, 6.9, 6.1, 5.9, 4.9, 4.6, 5.1, 4.4, 4.3, 4.28],
    },
  ];

  const sparkPath = (series, w, h) => {
    const min = Math.min(...series), max = Math.max(...series);
    const span = max - min || 1;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return [x, y];
    });
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const fill = "M" + pts[0][0].toFixed(1) + " " + h + " " + line.slice(1) + " L" + w + " " + h + " Z";
    return { line, fill };
  };

  const grid = $("#signal-grid");
  if (grid) {
    signals.forEach((s) => {
      const li = document.createElement("li");
      li.className = "signal-card";
      li.style.setProperty("--card-accent", s.accent);
      const arrow = s.trend === "up" ? "↑" : "↓";
      li.innerHTML =
        '<span class="signal-name"></span>' +
        '<span class="signal-value"></span>' +
        '<svg class="spark" viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true">' +
        '<path class="fill"></path><path class="line"></path></svg>' +
        '<span class="signal-trend"></span>';
      li.querySelector(".signal-name").textContent = s.name;
      const val = li.querySelector(".signal-value");
      val.textContent = s.value;
      const u = document.createElement("span");
      u.className = "u"; u.textContent = s.unit; val.appendChild(u);
      const sp = sparkPath(s.series, 100, 42);
      li.querySelector(".spark .line").setAttribute("d", sp.line);
      li.querySelector(".spark .fill").setAttribute("d", sp.fill);
      const trend = li.querySelector(".signal-trend");
      trend.innerHTML = "<b>" + arrow + "</b> ";
      trend.appendChild(document.createTextNode(s.trendText));
      grid.appendChild(li);
    });
  }

  /* ---------- Trajectory ---------- */
  const CURRENT = 1.36;
  const X0 = 60, X1 = 620, Y0 = 300, YTOP = 30, VMAX = 4;
  const plotX = (year) => X0 + ((year - 1980) / 120) * (X1 - X0);
  const plotY = (v) => Y0 - (v / VMAX) * (Y0 - YTOP);

  // Representative historical anomaly 1980 -> 2025
  const hist = [
    [1980, 0.28], [1985, 0.15], [1990, 0.45], [1995, 0.46], [2000, 0.42],
    [2005, 0.69], [2010, 0.72], [2015, 0.91], [2018, 0.86], [2020, 1.02],
    [2023, 1.18], [2025, CURRENT],
  ];

  const rateTable = [
    [-8, 1.45], [-6, 1.52], [-4, 1.62], [-2, 1.88], [0, 2.40], [2, 3.00], [4, 3.62],
  ];
  const endFor = (rate) => {
    for (let i = 0; i < rateTable.length - 1; i += 1) {
      const [a, va] = rateTable[i], [b, vb] = rateTable[i + 1];
      if (rate >= a && rate <= b) return va + (vb - va) * ((rate - a) / (b - a));
    }
    return rateTable[rateTable.length - 1][1];
  };

  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const projWarming = (year, end) => {
    const t = (year - 2025) / 75;
    const peak = Math.max(end, CURRENT + 0.1);
    if (t <= 0.45) return CURRENT + (peak - CURRENT) * easeInOut(t / 0.45);
    return peak + (end - peak) * easeInOut((t - 0.45) / 0.55);
  };

  const histPath = $("#hist-path");
  if (histPath) {
    histPath.setAttribute("d", hist.map((p, i) =>
      (i ? "L" : "M") + plotX(p[0]).toFixed(1) + " " + plotY(p[1]).toFixed(1)).join(" "));
  }

  // Static grid + axes
  const gGrid = $("#traj-grid"), gX = $("#traj-xaxis"), gY = $("#traj-yaxis");
  if (gGrid) {
    [0, 1, 2, 3, 4].forEach((v) => {
      const y = plotY(v);
      gGrid.appendChild(el("line", { x1: X0, y1: y, x2: X1, y2: y }));
      const t = el("text", { x: X0 - 8, y: y + 4, "text-anchor": "end" });
      t.textContent = v + "°";
      gY.appendChild(t);
    });
    [1980, 2020, 2060, 2100].forEach((yr) => {
      const x = plotX(yr);
      const t = el("text", { x, y: Y0 + 20, "text-anchor": "middle" });
      t.textContent = yr;
      gX.appendChild(t);
    });
  }
  const thLine = $("#threshold-line"), thLabel = $("#threshold-label");
  if (thLine) {
    const y = plotY(1.5);
    thLine.setAttribute("y1", y); thLine.setAttribute("y2", y);
    thLine.setAttribute("x1", X0); thLine.setAttribute("x2", X1);
    thLabel.setAttribute("x", X1); thLabel.setAttribute("y", y - 6);
  }

  const projPath = $("#proj-path"), projArea = $("#proj-area");
  const slider = $("#cut-rate"), cutOut = $("#cut-out");
  const projValueEl = $("#proj-value"), projCrossEl = $("#proj-cross");
  const verdict = $("#verdict"), verdictText = $("#verdict-text");
  const chips = Array.from(document.querySelectorAll(".chip"));

  const crossYear = (end) => {
    for (let yr = 2025; yr <= 2100; yr += 1) {
      if (projWarming(yr, end) >= 1.5) return yr;
    }
    return null;
  };

  const render = (rate) => {
    const end = endFor(rate);
    const pts = [];
    for (let yr = 2025; yr <= 2100; yr += 2) pts.push([yr, projWarming(yr, end)]);
    if (pts[pts.length - 1][0] !== 2100) pts.push([2100, projWarming(2100, end)]);
    const line = pts.map((p, i) =>
      (i ? "L" : "M") + plotX(p[0]).toFixed(1) + " " + plotY(p[1]).toFixed(1)).join(" ");
    projPath.setAttribute("d", line);
    projArea.setAttribute("d", "M" + plotX(2025).toFixed(1) + " " + Y0 + " " +
      line.slice(1) + " L" + plotX(2100).toFixed(1) + " " + Y0 + " Z");

    const sign = rate > 0 ? "+" : rate < 0 ? "−" : "±";
    cutOut.textContent = sign + Math.abs(rate) + "% per year";

    projValueEl.textContent = end.toFixed(1);
    const cross = crossYear(end);
    const peak = Math.max(end, CURRENT + 0.1);
    if (cross) {
      projCrossEl.textContent = "1.5 °C reached around " + cross;
    } else {
      projCrossEl.textContent = "Stays below the 1.5 °C line";
    }

    let band, msg, color;
    if (end <= 1.6) {
      band = "good"; color = "#3fd0c9";
      msg = peak > 1.5
        ? "A brief overshoot, then warming settles close to the line. This is the reachable future."
        : "Warming holds below 1.5 °C. The steepest cuts keep the line intact.";
    } else if (end <= 2.2) {
      band = "mid"; color = "#f2c14e";
      msg = "The line is crossed and warming keeps climbing. Adaptation costs rise, but the worst is avoided.";
    } else {
      band = "bad"; color = "#ff5d4b";
      msg = "Emissions keep growing and warming runs well past 2 °C. Impacts compound across every signal.";
    }
    verdict.dataset.band = band;
    verdictText.textContent = msg;
    projPath.style.setProperty("--proj", color);
    projArea.style.setProperty("--proj", color);

    chips.forEach((c) => c.setAttribute("aria-pressed", String(Number(c.dataset.rate) === rate)));
  };

  if (slider) {
    slider.addEventListener("input", () => render(Number(slider.value)));
    chips.forEach((c) => c.addEventListener("click", () => {
      slider.value = c.dataset.rate;
      render(Number(c.dataset.rate));
    }));
    render(Number(slider.value));
  }
})();
