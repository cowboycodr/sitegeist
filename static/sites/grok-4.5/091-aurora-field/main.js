(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Navigation ----- */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    siteNav.classList.toggle("is-open", open);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  /* ----- Starfield ----- */
  function paintStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(240, Math.floor(rect.height));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const count = prefersReducedMotion
      ? Math.floor((width * height) / 9000)
      : Math.floor((width * height) / 5200);

    // Deterministic-ish scatter so resize is stable enough
    let seed = 1234567;
    function rand() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    for (let i = 0; i < count; i += 1) {
      const x = rand() * width;
      const y = rand() * height * 0.92;
      const r = rand() * 1.5 + 0.3;
      const a = 0.35 + rand() * 0.65;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${220 + Math.floor(rand() * 30)}, ${230 + Math.floor(rand() * 20)}, ${235 + Math.floor(rand() * 20)}, ${a})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // A few brighter stars
    for (let i = 0; i < 12; i += 1) {
      const x = rand() * width;
      const y = rand() * height * 0.7;
      const r = 1.4 + rand() * 1.2;
      ctx.beginPath();
      ctx.fillStyle = "rgba(240, 250, 255, 0.95)";
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(160, 220, 200, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.moveTo(x - r * 3, y);
      ctx.lineTo(x + r * 3, y);
      ctx.moveTo(x, y - r * 3);
      ctx.lineTo(x, y + r * 3);
      ctx.stroke();
    }
  }

  let resizeTimer = 0;
  function scheduleStarfield() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(paintStarfield, 80);
  }

  paintStarfield();
  window.addEventListener("resize", scheduleStarfield);

  /* ----- Tonight's sky (local date calculations) ----- */
  function julianDay(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function moonIllumination(date) {
    // Simplified phase fraction from synodic month relative to known new moon
    const knownNew = Date.UTC(2000, 0, 6, 18, 14, 0);
    const synodic = 29.530588853;
    const days = (date.getTime() - knownNew) / 86400000;
    const age = ((days % synodic) + synodic) % synodic;
    const phase = age / synodic;
    const illum = 0.5 * (1 - Math.cos(2 * Math.PI * phase));
    return { age, phase, illum };
  }

  function moonPhaseName(phase) {
    if (phase < 0.03 || phase >= 0.97) return "New moon";
    if (phase < 0.22) return "Waxing crescent";
    if (phase < 0.28) return "First quarter";
    if (phase < 0.47) return "Waxing gibbous";
    if (phase < 0.53) return "Full moon";
    if (phase < 0.72) return "Waning gibbous";
    if (phase < 0.78) return "Last quarter";
    return "Waning crescent";
  }

  function drawMoon(svg, phase) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const ns = "http://www.w3.org/2000/svg";
    const append = (tag, attrs) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      svg.appendChild(el);
      return el;
    };

    append("circle", {
      cx: "32",
      cy: "32",
      r: "22",
      fill: "#1a2830",
      stroke: "#6a8a9a",
      "stroke-width": "1.2",
    });
    append("circle", {
      cx: "32",
      cy: "32",
      r: "20",
      fill: "#d8e6ee",
    });

    if (phase > 0.02 && phase < 0.98) {
      const k = Math.cos(2 * Math.PI * phase);
      const rx = Math.max(0.5, Math.abs(k) * 20);
      if (phase < 0.5) {
        const sweep = phase < 0.25 ? 1 : 0;
        append("path", {
          d: `M32 12 A20 20 0 1 0 32 52 A${rx} 20 0 1 ${sweep} 32 12 Z`,
          fill: "#1a2830",
        });
      } else {
        const sweep = phase < 0.75 ? 0 : 1;
        append("path", {
          d: `M32 12 A20 20 0 1 1 32 52 A${rx} 20 0 1 ${sweep} 32 12 Z`,
          fill: "#1a2830",
        });
      }
    }
  }

  function formatTime(date) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function estimateObservingWindow(date) {
    // Approximate for ~64° N without network: long winter nights, short summer
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const dayOfYear =
      (Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()) -
        Date.UTC(start.getFullYear(), 0, 0)) /
      86400000;
    // Rough night length hours at 64N
    const nightHours = 12 + 8 * Math.cos(((dayOfYear - 172) / 365) * 2 * Math.PI);
    const half = Math.max(2.5, Math.min(10, nightHours / 2));
    const dusk = new Date(start);
    dusk.setHours(12, 0, 0, 0);
    dusk.setTime(dusk.getTime() + (12 - half) * 3600000);
    const dawn = new Date(dusk.getTime() + nightHours * 3600000);
    return { dusk, dawn, nightHours };
  }

  function auroraOutlook(date) {
    // Deterministic pseudo-outlook from date seed — offline friendly
    const seed = Math.floor(julianDay(date));
    const tier = seed % 5;
    const labels = [
      "Quiet",
      "Quiet to unsettled",
      "Unsettled",
      "Active — watch for arcs",
      "Storm watch — elevated chance",
    ];
    return labels[tier];
  }

  function featuredObjects(date) {
    const month = date.getMonth();
    // Seasonal emphasis
    if (month >= 10 || month <= 1) {
      return [
        { name: "M42 Orion Nebula", meta: "Nebula · best after 21:30" },
        { name: "M45 Pleiades", meta: "Cluster · high all night" },
        { name: "Sirius", meta: "Star · culminates near midnight" },
      ];
    }
    if (month >= 2 && month <= 4) {
      return [
        { name: "M51 Whirlpool", meta: "Galaxy · meridian near 23:00" },
        { name: "Leo triplet", meta: "Galaxies · mid-evening" },
        { name: "Arcturus", meta: "Star · rising in the east" },
      ];
    }
    if (month >= 5 && month <= 7) {
      return [
        { name: "M13 Hercules", meta: "Cluster · high after dusk" },
        { name: "Milky Way core", meta: "Field · southern horizon" },
        { name: "Saturn", meta: "Planet · check local altitude" },
      ];
    }
    return [
      { name: "M31 Andromeda", meta: "Galaxy · transit near midnight" },
      { name: "M33 Triangulum", meta: "Galaxy · binocular target" },
      { name: "Jupiter", meta: "Planet · bright on the meridian" },
    ];
  }

  function updateSkyBriefing() {
    const now = new Date();
    const { dusk, dawn, nightHours } = estimateObservingWindow(now);
    const moon = moonIllumination(now);
    const phaseName = moonPhaseName(moon.phase);

    const windowEl = document.getElementById("obs-window");
    const windowNote = document.getElementById("obs-window-note");
    if (windowEl) {
      windowEl.textContent = `${formatTime(dusk)} – ${formatTime(dawn)}`;
    }
    if (windowNote) {
      windowNote.textContent = `Approx. ${nightHours.toFixed(1)} h of dark time at 64° N for this date.`;
    }

    const phaseEl = document.getElementById("moon-phase");
    const illumEl = document.getElementById("moon-illum");
    const moonIcon = document.getElementById("moon-icon");
    if (phaseEl) phaseEl.textContent = phaseName;
    if (illumEl) {
      illumEl.textContent = `${Math.round(moon.illum * 100)}% illuminated · local calculation`;
    }
    if (moonIcon) drawMoon(moonIcon, moon.phase);

    const auroraEl = document.getElementById("aurora-outlook");
    if (auroraEl) auroraEl.textContent = auroraOutlook(now);

    const list = document.getElementById("featured-objects");
    if (list) {
      const items = featuredObjects(now);
      list.innerHTML = "";
      items.forEach((obj) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.className = "obj-name";
        name.textContent = obj.name;
        const meta = document.createElement("span");
        meta.className = "obj-meta";
        meta.textContent = obj.meta;
        li.appendChild(name);
        li.appendChild(meta);
        list.appendChild(li);
      });
    }
  }

  updateSkyBriefing();

  /* ----- Visit form (offline summary only) ----- */
  const form = document.getElementById("visit-form");
  const status = document.getElementById("form-status");
  const summary = document.getElementById("request-summary");

  const roleLabels = {
    public: "Public night ticket",
    observing: "Observing residency",
    instrument: "Instrument residency",
    educator: "Educator fellowship",
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const role = String(data.get("role") || "");
      const dates = String(data.get("dates") || "").trim();
      const notes = String(data.get("notes") || "").trim();

      if (!name) {
        if (status) status.textContent = "Please enter your name.";
        document.getElementById("visitor-name")?.focus();
        return;
      }
      if (!role) {
        if (status) status.textContent = "Please choose what you are interested in.";
        document.getElementById("visitor-role")?.focus();
        return;
      }

      const lines = [
        "AURORA FIELD — VISIT REQUEST SUMMARY",
        "====================================",
        `Name: ${name}`,
        `Interest: ${roleLabels[role] || role}`,
        `Preferred dates: ${dates || "(not specified)"}`,
        `Notes: ${notes || "(none)"}`,
        "",
        `Composed locally: ${new Date().toLocaleString()}`,
        "Site: Aurora Field · 64.1466° N",
        "",
        "Copy this summary and send it when you have connectivity.",
        "No data left this page.",
      ];

      if (summary) {
        summary.hidden = false;
        summary.textContent = lines.join("\n");
      }
      if (status) {
        status.textContent = "Summary ready below — copy when you can send it.";
      }
    });

    form.addEventListener("reset", () => {
      if (status) status.textContent = "";
      if (summary) {
        summary.hidden = true;
        summary.textContent = "";
      }
    });
  }
})();
