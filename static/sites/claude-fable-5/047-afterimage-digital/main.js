/* Afterimage Digital — Exhibition 017: live renderers for the hero field and four works. */
(() => {
  "use strict";

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduceQuery.matches;
  let userPaused = false;

  const scenes = [];

  function makeScene(canvas, draw) {
    const ctx = canvas.getContext("2d");
    const scene = {
      canvas,
      ctx,
      w: 0,
      h: 0,
      t: 0,
      frame: 0,
      // pointer in canvas pixels; targets ease toward it
      px: null,
      py: null,
      active: false,
      draw,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scene.w = Math.max(1, Math.round(rect.width * dpr));
      scene.h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = scene.w;
      canvas.height = scene.h;
      renderStill(scene);
    };

    const setPointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = scene.w / Math.max(1, rect.width);
      scene.px = (clientX - rect.left) * dpr;
      scene.py = (clientY - rect.top) * dpr;
      scene.active = true;
      if (paused) renderStill(scene);
    };

    canvas.addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY));
    canvas.addEventListener("pointerdown", (e) => setPointer(e.clientX, e.clientY));
    canvas.addEventListener("pointerleave", () => { scene.active = false; });

    // Keyboard: arrow keys steer a virtual pointer inside focused works.
    if (canvas.tabIndex >= 0) {
      canvas.addEventListener("keydown", (e) => {
        const step = scene.w * 0.06;
        if (scene.px === null) { scene.px = scene.w / 2; scene.py = scene.h / 2; }
        let handled = true;
        if (e.key === "ArrowLeft") scene.px -= step;
        else if (e.key === "ArrowRight") scene.px += step;
        else if (e.key === "ArrowUp") scene.py -= step;
        else if (e.key === "ArrowDown") scene.py += step;
        else if (e.key === " " || e.key === "Enter") { scene.px = scene.w / 2; scene.py = scene.h / 2; }
        else handled = false;
        if (handled) {
          e.preventDefault();
          scene.px = Math.max(0, Math.min(scene.w, scene.px));
          scene.py = Math.max(0, Math.min(scene.h, scene.py));
          scene.active = true;
          if (paused) renderStill(scene);
        }
      });
    }

    new ResizeObserver(resize).observe(canvas);
    resize();
    scenes.push(scene);
    return scene;
  }

  function renderStill(scene) {
    // A single settled frame for reduced motion / paused state.
    scene.draw(scene, 40, true);
  }

  const TAU = Math.PI * 2;

  /* --- hero: drifting orbs with additive glow --- */
  function drawHero(s, t, still) {
    const { ctx, w, h } = s;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = still ? "#060309" : "rgba(6, 3, 9, 0.16)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const colors = ["163,255,214", "255,122,217", "122,226,255"];
    for (let i = 0; i < 9; i++) {
      const c = colors[i % 3];
      const a = t * (0.08 + i * 0.013) + i * 2.3;
      let x = w * (0.5 + 0.42 * Math.sin(a) * Math.cos(a * 0.6 + i));
      let y = h * (0.5 + 0.4 * Math.sin(a * 0.7 + i * 1.7));
      if (s.active && s.px !== null) {
        x += (s.px - x) * 0.08;
        y += (s.py - y) * 0.08;
      }
      const r = Math.min(w, h) * (0.04 + 0.02 * Math.sin(t * 0.5 + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, `rgba(${c},0.55)`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 4, 0, TAU);
      ctx.fill();
    }
  }

  /* --- 01 Phosphor Tide: green sine waves bending toward the pointer --- */
  function drawTide(s, t, still) {
    const { ctx, w, h } = s;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = still ? "#04020a" : "rgba(4, 2, 10, 0.14)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const lines = 7;
    for (let i = 0; i < lines; i++) {
      const base = h * (0.18 + (i / (lines - 1)) * 0.64);
      ctx.beginPath();
      for (let x = 0; x <= w; x += Math.max(4, w / 160)) {
        let y = base + Math.sin(x / (w * 0.11) + t * (0.7 + i * 0.09) + i) * h * 0.05;
        if (s.px !== null) {
          const d = Math.hypot(x - s.px, base - s.py);
          const pull = Math.exp(-(d * d) / (2 * (w * 0.14) ** 2));
          y += (s.py - y) * pull * 0.55;
        }
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(163,255,214,${0.16 + 0.07 * Math.sin(t + i)})`;
      ctx.lineWidth = Math.max(1.2, h * 0.006);
      ctx.stroke();
    }
  }

  /* --- 02 Retinal Bloom: magenta rings pulsing from the pointer --- */
  function drawBloom(s, t, still) {
    const { ctx, w, h } = s;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = still ? "#04020a" : "rgba(4, 2, 10, 0.1)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const cx = s.px !== null ? s.px : w / 2;
    const cy = s.py !== null ? s.py : h / 2;
    const maxR = Math.hypot(w, h) * 0.5;
    for (let i = 0; i < 6; i++) {
      const phase = (t * 0.35 + i / 6) % 1;
      const r = 8 + phase * maxR;
      const alpha = (1 - phase) * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = `rgba(255,122,217,${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1.5, (1 - phase) * h * 0.012);
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.18);
    g.addColorStop(0, "rgba(255,180,235,0.5)");
    g.addColorStop(1, "rgba(255,122,217,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.18, 0, TAU);
    ctx.fill();
  }

  /* --- 03 Slow Ghost: cyan comet echoing the pointer's path --- */
  function drawGhost(s, t, still) {
    const { ctx, w, h } = s;
    if (!s.trail) { s.trail = []; s.gx = w / 2; s.gy = h / 2; }
    const tx = s.px !== null ? s.px : w / 2 + Math.sin(t * 0.6) * w * 0.28;
    const ty = s.py !== null ? s.py : h / 2 + Math.cos(t * 0.45) * h * 0.24;
    s.gx += (tx - s.gx) * (still ? 1 : 0.035);
    s.gy += (ty - s.gy) * (still ? 1 : 0.035);
    s.trail.push({ x: s.gx, y: s.gy });
    if (s.trail.length > 70) s.trail.shift();

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = still ? "#04020a" : "rgba(4, 2, 10, 0.18)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < s.trail.length; i++) {
      const p = s.trail[i];
      const f = i / s.trail.length;
      const r = 1 + f * h * 0.02;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fillStyle = `rgba(122,226,255,${(f * 0.35).toFixed(3)})`;
      ctx.fill();
    }
    const g = ctx.createRadialGradient(s.gx, s.gy, 0, s.gx, s.gy, h * 0.09);
    g.addColorStop(0, "rgba(200,245,255,0.8)");
    g.addColorStop(1, "rgba(122,226,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.gx, s.gy, h * 0.09, 0, TAU);
    ctx.fill();
  }

  /* --- 04 Cathode Garden: amber stems leaning toward the pointer --- */
  function drawGarden(s, t, still) {
    const { ctx, w, h } = s;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = still ? "#04020a" : "rgba(4, 2, 10, 0.2)";
    ctx.fillRect(0, 0, w, h);
    // faint scanlines
    ctx.fillStyle = "rgba(255,196,107,0.03)";
    for (let y = 0; y < h; y += Math.max(4, h * 0.02)) ctx.fillRect(0, y, w, 1);
    ctx.globalCompositeOperation = "lighter";
    const stems = 11;
    for (let i = 0; i < stems; i++) {
      const rootX = w * ((i + 0.5) / stems);
      const sway = Math.sin(t * 0.8 + i * 1.9) * w * 0.02;
      let lean = 0;
      if (s.px !== null) {
        const d = s.px - rootX;
        lean = Math.max(-1, Math.min(1, d / (w * 0.4))) * w * 0.06 *
          Math.exp(-Math.abs(d) / (w * 0.5));
      }
      const height = h * (0.35 + 0.28 * Math.abs(Math.sin(i * 2.7 + 1)));
      const tipX = rootX + sway + lean;
      const tipY = h - height;
      ctx.beginPath();
      ctx.moveTo(rootX, h);
      ctx.quadraticCurveTo(rootX + (sway + lean) * 0.4, h - height * 0.55, tipX, tipY);
      ctx.strokeStyle = `rgba(255,196,107,${0.18 + 0.08 * Math.sin(t + i * 2)})`;
      ctx.lineWidth = Math.max(1.2, h * 0.007);
      ctx.stroke();
      const g = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, h * 0.045);
      g.addColorStop(0, "rgba(255,224,170,0.6)");
      g.addColorStop(1, "rgba(255,196,107,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(tipX, tipY, h * 0.045, 0, TAU);
      ctx.fill();
    }
  }

  const pieces = { tide: drawTide, bloom: drawBloom, ghost: drawGhost, garden: drawGarden };

  const heroCanvas = document.getElementById("hero-canvas");
  if (heroCanvas) makeScene(heroCanvas, drawHero);
  document.querySelectorAll(".work-canvas").forEach((canvas) => {
    const draw = pieces[canvas.dataset.piece];
    if (draw) makeScene(canvas, draw);
  });

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused) {
      for (const s of scenes) {
        s.t += dt;
        s.draw(s, s.t, false);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* --- motion toggle --- */
  const toggle = document.getElementById("motion-toggle");
  function applyPaused() {
    paused = userPaused || reduceQuery.matches;
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(userPaused));
      toggle.textContent = userPaused ? "Resume motion" : "Pause all motion";
    }
    if (paused) scenes.forEach(renderStill);
    else last = performance.now();
  }
  if (toggle) {
    toggle.addEventListener("click", () => {
      userPaused = !userPaused;
      applyPaused();
    });
  }
  reduceQuery.addEventListener?.("change", applyPaused);
  applyPaused();
})();
