(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Shipment tracker (fully local, deterministic) ---- */
  const form = document.getElementById("track-form");
  const input = document.getElementById("code");
  const result = document.getElementById("track-result");

  const LANES = [
    { from: "Shanghai, CN", to: "Rotterdam, NL", mode: "Ocean", eta: "in 6 days" },
    { from: "Los Angeles, US", to: "Yokohama, JP", mode: "Ocean", eta: "in 9 days" },
    { from: "Frankfurt, DE", to: "Chicago, US", mode: "Air", eta: "in 14 hours" },
    { from: "Singapore, SG", to: "Mumbai, IN", mode: "Air", eta: "in 7 hours" },
    { from: "Chongqing, CN", to: "Duisburg, DE", mode: "Rail", eta: "in 4 days" },
    { from: "Antwerp, BE", to: "Milan, IT", mode: "Road", eta: "in 26 hours" },
  ];

  const STAGES = [
    ["Origin pickup", "Cargo collected and sealed"],
    ["Export relay", "Cleared at origin hub"],
    ["Line-haul", "In transit on primary lane"],
    ["Interchange", "Handoff at transfer hub"],
    ["Import relay", "Customs cleared at destination"],
    ["Final relay", "Out for last-mile delivery"],
  ];

  // Small deterministic string hash so any code yields a stable, plausible result.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
    ));
  }

  function validCode(code) {
    return /^[A-Z0-9]{4,}[- ]?[A-Z0-9-]{2,}$/.test(code);
  }

  function render(raw) {
    const code = raw.trim().toUpperCase();
    if (!code) {
      result.innerHTML = "";
      return;
    }
    if (!validCode(code)) {
      result.innerHTML =
        '<div class="result-error" role="status"><strong>No match.</strong> ' +
        "Enter a Relay waybill such as <em>RLG-4471-KX</em> — letters and numbers, four or more characters.</div>";
      return;
    }

    const h = hash(code);
    const lane = LANES[h % LANES.length];
    const current = 1 + (h >> 3) % (STAGES.length - 1); // never fully delivered, always something in motion
    const delayed = (h >> 7) % 5 === 0;

    const times = ["06:12", "09:40", "13:05", "18:22", "21:50", "07:15"];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let steps = "";
    STAGES.forEach((st, i) => {
      let cls = "";
      let meta = "";
      if (i < current) {
        cls = "done";
        meta = days[(h + i) % 6] + " · " + times[(h + i * 2) % 6] + " · scanned";
      } else if (i === current) {
        cls = "current";
        meta = st[1] + " · live";
      } else {
        meta = "Scheduled";
      }
      const badge = i === current ? '<span class="badge">now</span>' : "";
      steps +=
        '<li class="' + cls + '"><div class="tl-title">' + esc(st[0]) + badge +
        '</div><div class="tl-meta">' + esc(meta) + "</div></li>";
    });

    const chipClass = delayed ? "status-chip warn" : "status-chip";
    const chipText = delayed ? "Minor delay" : "On schedule";
    const etaText = delayed ? lane.eta + " (revised)" : lane.eta;

    result.innerHTML =
      '<div class="result-card">' +
        '<div class="result-top">' +
          '<span class="result-code">' + esc(code) + "</span>" +
          '<span class="' + chipClass + '">' + chipText + "</span>" +
        "</div>" +
        '<p class="result-route"><strong>' + esc(lane.from) + "</strong> → <strong>" +
          esc(lane.to) + "</strong> · " + esc(lane.mode) +
          ' lane · <span class="result-eta">ETA ' + esc(etaText) + "</span></p>" +
        '<ol class="timeline">' + steps + "</ol>" +
      "</div>";
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      render(input.value);
    });
  }

  document.querySelectorAll(".sample-code").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code") || btn.textContent;
      input.value = code;
      render(code);
      input.focus();
    });
  });

  /* ---- Count-up metrics ---- */
  const nums = document.querySelectorAll(".metric-num");

  function animateNum(el) {
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = (el.getAttribute("data-count") || "").includes(".") ? 1 : 0;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && nums.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateNum(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  } else {
    nums.forEach(animateNum);
  }
})();
