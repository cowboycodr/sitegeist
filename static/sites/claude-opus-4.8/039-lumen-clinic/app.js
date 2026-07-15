(() => {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Signal dataset: illustrative preventive-health panels ---
  var signals = [
    {
      id: "metabolic",
      name: "Metabolic",
      hint: "Glucose & lipids",
      color: "#6fe0c8",
      tag: "Panel 01 · Fasted draw",
      title: "Metabolic balance",
      desc: "How steadily your body turns food into fuel. We track fasting glucose, insulin sensitivity, and the lipid ratios that quietly shape long-term risk.",
      metrics: [
        { label: "Fasting glucose", value: "88", unit: "mg/dL", status: "in" },
        { label: "HbA1c", value: "5.2", unit: "%", status: "in" },
        { label: "Triglyceride ratio", value: "1.4", unit: "", status: "watch" }
      ],
      guidance: "Steady and healthy. One flag: your triglyceride ratio drifted up. A 20-minute walk after your largest meal is the single highest-leverage change this quarter."
    },
    {
      id: "cardio",
      name: "Cardiovascular",
      hint: "Heart & vessels",
      color: "#7bc4ff",
      tag: "Panel 02 · Resting + wearable",
      title: "Cardiovascular resilience",
      desc: "The pressure, rhythm, and inflammatory markers behind heart health, blended with resting heart-rate trends from your wearable.",
      metrics: [
        { label: "Blood pressure", value: "118/74", unit: "mmHg", status: "in" },
        { label: "Resting HR", value: "58", unit: "bpm", status: "in" },
        { label: "hs-CRP", value: "0.7", unit: "mg/L", status: "in" }
      ],
      guidance: "Excellent range across the board. Your resting heart rate is trending down month over month — a clear marker that your training is landing."
    },
    {
      id: "vitamins",
      name: "Nutrients",
      hint: "Vitamins & minerals",
      color: "#ffd59e",
      tag: "Panel 03 · Micronutrients",
      title: "Nutrient reserves",
      desc: "The vitamins and minerals that run out first when life gets busy — the ones responsible for energy, mood, and recovery.",
      metrics: [
        { label: "Vitamin D", value: "26", unit: "ng/mL", status: "watch" },
        { label: "Ferritin", value: "64", unit: "ng/mL", status: "in" },
        { label: "Vitamin B12", value: "540", unit: "pg/mL", status: "in" }
      ],
      guidance: "Vitamin D sits just under target after winter. We've suggested a modest daily dose and a recheck in eight weeks — no supplement stacking required."
    },
    {
      id: "sleep",
      name: "Sleep & Stress",
      hint: "Recovery signals",
      color: "#ff9fb2",
      tag: "Panel 04 · 14-day trend",
      title: "Sleep & recovery",
      desc: "Cortisol rhythm paired with two weeks of sleep and heart-rate-variability data, so guidance reflects your real nights, not a single lab morning.",
      metrics: [
        { label: "Avg sleep", value: "6.4", unit: "hrs", status: "watch" },
        { label: "HRV", value: "61", unit: "ms", status: "in" },
        { label: "Morning cortisol", value: "14", unit: "µg/dL", status: "in" }
      ],
      guidance: "Recovery capacity is strong, but sleep duration is the limiter. Protecting a consistent lights-out time would lift nearly every other signal on this page."
    }
  ];

  // --- Hero ring animation ---
  var arc = document.querySelector(".ring-arc");
  var scoreEl = document.querySelector("[data-score]");
  if (arc) {
    var r = 86;
    var circ = 2 * Math.PI * r;
    arc.setAttribute("stroke-dasharray", circ.toFixed(2));
    var target = 0.86; // fraction filled
    if (reduceMotion) {
      arc.setAttribute("stroke-dashoffset", (circ * (1 - target)).toFixed(2));
      if (scoreEl) scoreEl.textContent = "86";
    } else {
      arc.setAttribute("stroke-dashoffset", circ.toFixed(2));
      var start = null, dur = 1400;
      var tick = function (ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        arc.setAttribute("stroke-dashoffset", (circ * (1 - target * eased)).toFixed(2));
        if (scoreEl) scoreEl.textContent = Math.round(86 * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      // Start when in view (or immediately if already visible)
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { requestAnimationFrame(tick); io.disconnect(); }
          });
        }, { threshold: 0.4 });
        io.observe(arc);
      } else {
        requestAnimationFrame(tick);
      }
    }
  }

  // --- Signals explorer ---
  var list = document.getElementById("signal-list");
  var detail = document.getElementById("signal-detail");
  if (list && detail) {
    var buttons = [];

    signals.forEach(function (s, i) {
      var b = document.createElement("button");
      b.className = "signal-btn";
      b.type = "button";
      b.id = "sig-tab-" + s.id;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.setAttribute("aria-controls", "signal-detail");
      b.tabIndex = i === 0 ? 0 : -1;
      b.dataset.index = String(i);
      b.innerHTML =
        '<span class="signal-dot" style="background:' + s.color + '"></span>' +
        '<span><b>' + s.name + "</b><small>" + s.hint + "</small></span>";
      b.addEventListener("click", function () { select(i); });
      list.appendChild(b);
      buttons.push(b);
    });

    list.addEventListener("keydown", function (e) {
      var current = buttons.findIndex(function (b) { return b.getAttribute("aria-selected") === "true"; });
      var next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % buttons.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = buttons.length - 1;
      if (next >= 0) { e.preventDefault(); select(next); buttons[next].focus(); }
    });

    function statusClass(st) { return st === "in" ? "status-in" : "status-watch"; }
    function statusLabel(st) { return st === "in" ? "In range" : "Watch"; }

    function select(i) {
      var s = signals[i];
      buttons.forEach(function (b, j) {
        var on = j === i;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });

      var metrics = s.metrics.map(function (m) {
        return '<div class="metric"><span>' + m.label + "</span><strong>" + m.value +
          (m.unit ? ' <em style="color:var(--muted)">' + m.unit + "</em>" : "") +
          '</strong><em class="' + statusClass(m.status) + '">' + statusLabel(m.status) + "</em></div>";
      }).join("");

      detail.innerHTML =
        '<span class="tag" style="color:' + s.color + '"><span class="signal-dot" style="background:' + s.color + '"></span>' + s.tag + "</span>" +
        "<h3>" + s.title + "</h3>" +
        '<p class="desc">' + s.desc + "</p>" +
        '<div class="readout">' + metrics + "</div>" +
        '<p class="guidance"><strong>Lumen reads:</strong> ' + s.guidance + "</p>";
      detail.setAttribute("aria-labelledby", "sig-tab-" + s.id);
    }

    select(0);
  }

  // --- Footer year ---
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
