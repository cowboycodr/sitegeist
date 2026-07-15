(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* --- crisp canvas sizing for high-dpi --- */
  function fitCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: cssW, h: cssH };
  }

  const palette = {
    violet: "#8b7bff",
    amber: "#ffc857",
    teal: "#4fe6c4",
    pink: "#ff77b0",
    muted: "rgba(167,173,222,0.5)",
  };

  /* ============ Hero: pendulum wave ============ */
  const pend = document.getElementById("pendulum");
  if (pend) {
    let view = fitCanvas(pend);
    const N = 15;
    const base = 12; // oscillations of slowest in the cycle
    const cycle = 24; // seconds for full realignment
    let start = performance.now();

    function drawPend(now) {
      const { ctx, w, h } = view;
      const t = reduceMotion.matches ? 6.0 : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const topY = h * 0.16;
      const len = h * 0.66;
      const margin = w * 0.12;
      const span = w - margin * 2;

      // support bar
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(margin * 0.6, topY);
      ctx.lineTo(w - margin * 0.6, topY);
      ctx.stroke();

      for (let i = 0; i < N; i++) {
        const osc = base + i;
        const freq = (2 * Math.PI * osc) / cycle;
        const angle = 0.62 * Math.cos(freq * t);
        const px = margin + (span * i) / (N - 1);
        const bx = px + Math.sin(angle) * len;
        const by = topY + Math.cos(angle) * len;

        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, topY);
        ctx.lineTo(bx, by);
        ctx.stroke();

        const hue = i / (N - 1);
        const col = mix(palette.teal, palette.pink, hue);
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function loopPend(now) {
      drawPend(now);
      if (!reduceMotion.matches) requestAnimationFrame(loopPend);
    }
    requestAnimationFrame(loopPend);
    reduceMotion.addEventListener("change", () => {
      if (reduceMotion.matches) drawPend(performance.now());
      else { start = performance.now(); requestAnimationFrame(loopPend); }
    });
    window.addEventListener("resize", debounce(() => {
      view = fitCanvas(pend);
      drawPend(performance.now());
    }, 160));
  }

  /* ============ Lab: wave interference ============ */
  const waves = document.getElementById("waves");
  if (waves) {
    let view = fitCanvas(waves);
    const fa = document.getElementById("fa");
    const fb = document.getElementById("fb");
    const amp = document.getElementById("amp");
    const outFa = document.getElementById("outFa");
    const outFb = document.getElementById("outFb");
    const outAmp = document.getElementById("outAmp");
    const playBtn = document.getElementById("playBtn");

    let playing = !reduceMotion.matches;
    let phase = 0;
    let last = performance.now();

    function sync() {
      outFa.textContent = fa.value;
      outFb.textContent = fb.value;
      outAmp.textContent = amp.value + "%";
    }
    [fa, fb, amp].forEach((el) => el.addEventListener("input", () => { sync(); if (!playing) drawWaves(); }));
    sync();

    function setPlaying(on) {
      playing = on;
      playBtn.setAttribute("aria-pressed", String(on));
      playBtn.textContent = on ? "Pause motion" : "Resume motion";
      if (on) { last = performance.now(); requestAnimationFrame(loopWaves); }
    }
    playBtn.addEventListener("click", () => setPlaying(!playing));

    function curve(ctx, w, h, fn, color, width, glow) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = glow ? color : "transparent";
      ctx.shadowBlur = glow ? 10 : 0;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 - fn(x / w);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawWaves() {
      const { ctx, w, h } = view;
      ctx.clearRect(0, 0, w, h);
      const A = (h * 0.19) * (parseInt(amp.value, 10) / 100);
      const wa = parseInt(fa.value, 10);
      const wb = parseInt(fb.value, 10);

      // baseline grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gy = (h * i) / 4;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

      const P = phase;
      const yA = (u) => A * Math.sin(u * Math.PI * 2 * wa + P);
      const yB = (u) => A * Math.sin(u * Math.PI * 2 * wb - P);

      // filled sum area
      ctx.fillStyle = "rgba(255,200,87,0.10)";
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      for (let x = 0; x <= w; x += 2) {
        const u = x / w;
        ctx.lineTo(x, h / 2 - (yA(u) + yB(u)) / 1);
      }
      ctx.lineTo(w, h / 2);
      ctx.closePath();
      ctx.fill();

      curve(ctx, w, h, yA, palette.teal, 2, false);
      curve(ctx, w, h, yB, palette.pink, 2, false);
      curve(ctx, w, h, (u) => yA(u) + yB(u), palette.amber, 3.2, true);
    }

    function loopWaves(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phase += dt * 1.6;
      drawWaves();
      if (playing) requestAnimationFrame(loopWaves);
    }

    if (playing) requestAnimationFrame(loopWaves); else drawWaves();
    playBtn.textContent = playing ? "Pause motion" : "Resume motion";
    playBtn.setAttribute("aria-pressed", String(playing));

    reduceMotion.addEventListener("change", () => {
      if (reduceMotion.matches) setPlaying(false);
    });
    window.addEventListener("resize", debounce(() => {
      view = fitCanvas(waves);
      drawWaves();
    }, 160));
  }

  /* ============ Subjects ============ */
  const grid = document.querySelector(".card-grid");
  if (grid) {
    const subjects = [
      { name: "Physics", color: palette.teal, tag: "24 scenes", blurb: "Orbits, waves, and collisions you can nudge, pause, and rewind.", icon: iconWave },
      { name: "Calculus", color: palette.amber, tag: "18 scenes", blurb: "Watch a slope become a curve become an area — one drag at a time.", icon: iconCurve },
      { name: "Biology", color: palette.pink, tag: "16 scenes", blurb: "Cells divide and signals travel in diagrams that actually run.", icon: iconCell },
      { name: "Chemistry", color: palette.violet, tag: "20 scenes", blurb: "Bond, break, and balance reactions in a tinker-friendly bench.", icon: iconFlask },
      { name: "Astronomy", color: palette.teal, tag: "12 scenes", blurb: "Scale the solar system by hand and feel just how empty space is.", icon: iconStar },
      { name: "Statistics", color: palette.amber, tag: "15 scenes", blurb: "Roll ten thousand dice and see a bell curve assemble itself.", icon: iconBars },
      { name: "Geometry", color: palette.pink, tag: "14 scenes", blurb: "Fold, unfold, and prove — with shapes that respond to your hand.", icon: iconShape },
      { name: "Logic", color: palette.violet, tag: "11 scenes", blurb: "Flip switches through gates and light up a circuit of reasoning.", icon: iconGate },
      { name: "Music", color: palette.teal, tag: "9 scenes", blurb: "Pluck a string, split a frequency, and hear the math of harmony.", icon: iconNote },
    ];

    subjects.forEach((s) => {
      const li = document.createElement("li");
      li.className = "card";
      const glyph = document.createElement("div");
      glyph.className = "card-glyph";
      glyph.style.background = "rgba(255,255,255,0.06)";
      glyph.style.color = s.color;
      glyph.innerHTML = s.icon();
      const h3 = document.createElement("h3");
      h3.textContent = s.name;
      const p = document.createElement("p");
      p.textContent = s.blurb;
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = s.tag;
      li.append(glyph, h3, p, tag);
      grid.appendChild(li);
    });
  }

  /* ============ live "watch time" counter ============ */
  const watchDd = document.querySelector(".stat-row div:last-child dd");
  if (watchDd && !reduceMotion.matches) {
    const t0 = Date.now();
    const fmt = (s) => {
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m + ":" + String(r).padStart(2, "0");
    };
    watchDd.textContent = "0:00";
    setInterval(() => {
      watchDd.textContent = fmt(Math.floor((Date.now() - t0) / 1000));
    }, 1000);
  } else if (watchDd) {
    watchDd.textContent = "0:00";
  }

  /* ============ helpers ============ */
  function debounce(fn, ms) {
    let id;
    return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
  }
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const ca = hexToRgb(a), cb = hexToRgb(b);
    const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
    const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
    const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  /* icon builders (inline svg strings) */
  function iconWave() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0"/></svg>'; }
  function iconCurve() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 21V3M3 21h18M3 21C9 21 15 15 21 3"/></svg>'; }
  function iconCell() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><circle cx="7" cy="8" r="1"/></svg>'; }
  function iconFlask() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/></svg>'; }
  function iconStar() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg>'; }
  function iconBars() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V12M9 20V6M14 20V9M19 20V4"/></svg>'; }
  function iconShape() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 16H3z"/></svg>'; }
  function iconGate() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="12" r="2"/><path d="M9 7h4M9 17h4M15 12l-2-3M15 12l-2 3"/></svg>'; }
  function iconNote() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="18" r="2.5"/><circle cx="18" cy="15" r="2.5"/><path d="M9.5 18V6l11-2v11"/></svg>'; }
})();
