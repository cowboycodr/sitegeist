(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Smooth section focus for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (typeof target.focus === "function") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Essay panels (no external navigation) ---------- */
  const essayButtons = document.querySelectorAll("[data-essay]");
  const panels = document.querySelectorAll(".essay-panel");

  const closeAllPanels = () => {
    panels.forEach((panel) => {
      panel.classList.remove("is-open");
      panel.setAttribute("hidden", "");
    });
    essayButtons.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  };

  essayButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const id = btn.getAttribute("data-essay");
      const panel = document.getElementById(id);
      if (!panel) return;
      const wasOpen = panel.classList.contains("is-open");
      closeAllPanels();
      if (!wasOpen) {
        panel.classList.add("is-open");
        panel.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }
    });
  });

  document.querySelectorAll("[data-close-panel]").forEach((btn) => {
    btn.addEventListener("click", () => closeAllPanels());
  });

  /* ---------- Ambient particle field ---------- */
  const ambient = document.getElementById("ambient-canvas");
  if (ambient) {
    const ctx = ambient.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      ambient.width = Math.floor(width * dpr);
      ambient.height = Math.floor(height * dpr);
      ambient.style.width = `${width}px`;
      ambient.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor((width * height) / 22000));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (anywhere) => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + Math.random() * 40,
      r: 0.6 + Math.random() * 2.2,
      vy: -(0.12 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 0.18,
      a: 0.15 + Math.random() * 0.45,
      hue: Math.random() > 0.72 ? 28 : 145 + Math.random() * 25,
    });

    const draw = (ts) => {
      if (!ctx) return;
      const dt = Math.min(32, ts - last || 16);
      last = ts;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          if (p.y < -10 || p.x < -10 || p.x > width + 10) {
            Object.assign(p, spawn(false));
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 55%, 68%, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
  }

  /* ---------- Seed panel simulation ---------- */
  const seedCanvas = document.getElementById("seed-canvas");
  const densityInput = document.getElementById("seed-density");
  if (seedCanvas) {
    const ctx = seedCanvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;
    let seeds = [];
    let t = 0;
    let raf = 0;

    const density = () => (densityInput ? Number(densityInput.value) : 18);

    const resize = () => {
      const rect = seedCanvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      seedCanvas.width = Math.floor(w * dpr);
      seedCanvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
    };

    const rebuild = () => {
      const n = density();
      seeds = Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 18 + Math.random() * Math.min(w, h) * 0.28;
        return {
          ox: w * 0.5 + Math.cos(angle) * dist * 0.15,
          oy: h * 0.78,
          angle,
          length: 40 + Math.random() * 70,
          sway: 0.4 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          hue: 130 + Math.random() * 40,
          bloom: Math.random() > 0.55,
        };
      });
    };

    const drawStem = (s, time) => {
      const sway = Math.sin(time * 0.0012 * s.sway + s.phase) * 12;
      const tipX = s.ox + Math.cos(s.angle - Math.PI / 2) * s.length + sway;
      const tipY = s.oy - s.length + Math.sin(time * 0.0008 + s.phase) * 4;

      const grad = ctx.createLinearGradient(s.ox, s.oy, tipX, tipY);
      grad.addColorStop(0, "rgba(30, 61, 44, 0.1)");
      grad.addColorStop(0.4, `hsla(${s.hue}, 45%, 42%, 0.75)`);
      grad.addColorStop(1, `hsla(${s.hue + 20}, 60%, 68%, 0.95)`);

      ctx.beginPath();
      ctx.moveTo(s.ox, s.oy);
      ctx.quadraticCurveTo(s.ox + sway * 0.4, s.oy - s.length * 0.5, tipX, tipY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.stroke();

      // leaf
      const midX = (s.ox + tipX) / 2 + sway * 0.2;
      const midY = (s.oy + tipY) / 2;
      ctx.beginPath();
      ctx.ellipse(midX + 8, midY, 10, 4, s.angle + 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 50%, 48%, 0.35)`;
      ctx.fill();

      if (s.bloom) {
        ctx.beginPath();
        ctx.fillStyle = `hsla(${28 + (s.hue % 20)}, 70%, 72%, 0.85)`;
        ctx.arc(tipX, tipY, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(157, 255, 200, 0.35)";
        ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 55%, 65%, 0.7)`;
        ctx.arc(tipX, tipY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (time) => {
      t = time;
      ctx.clearRect(0, 0, w, h);

      // soil glow
      const soil = ctx.createRadialGradient(w * 0.5, h * 0.9, 10, w * 0.5, h * 0.85, w * 0.45);
      soil.addColorStop(0, "rgba(61, 122, 85, 0.28)");
      soil.addColorStop(1, "rgba(61, 122, 85, 0)");
      ctx.fillStyle = soil;
      ctx.fillRect(0, 0, w, h);

      // soft grid of latent nodes
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (let i = 0; i < 5; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          const x = (w * (i + 0.5)) / 5;
          const y = (h * (j + 0.4)) / 3.5;
          ctx.beginPath();
          ctx.strokeStyle = "rgba(157, 255, 200, 0.5)";
          ctx.arc(x, y, 10 + ((i + j) % 3) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      seeds.forEach((s) => drawStem(s, reduceMotion ? 0 : time));

      // seed core
      ctx.beginPath();
      ctx.fillStyle = "rgba(157, 255, 200, 0.15)";
      ctx.arc(w * 0.5, h * 0.78, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "rgba(232, 180, 138, 0.85)";
      ctx.arc(w * 0.5, h * 0.78, 5, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) {
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (densityInput) {
      densityInput.addEventListener("input", () => {
        rebuild();
        if (reduceMotion) frame(0);
      });
    }

    if (reduceMotion) {
      frame(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduceMotion) raf = requestAnimationFrame(frame);
    });
  }

  /* ---------- Growth field simulation ---------- */
  const growth = document.getElementById("growth-canvas");
  if (growth) {
    const ctx = growth.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes = [];
    let links = [];
    let raf = 0;
    let tick = 0;

    const resize = () => {
      const rect = growth.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      growth.width = Math.floor(w * dpr);
      growth.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initGraph();
    };

    const initGraph = () => {
      const cols = Math.max(5, Math.floor(w / 70));
      const rows = Math.max(4, Math.floor(h / 70));
      nodes = [];
      links = [];
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const jitterX = (Math.random() - 0.5) * 18;
          const jitterY = (Math.random() - 0.5) * 18;
          nodes.push({
            x: ((x + 0.5) / cols) * w + jitterX,
            y: ((y + 0.5) / rows) * h + jitterY,
            baseX: 0,
            baseY: 0,
            phase: Math.random() * Math.PI * 2,
            kind: Math.random(),
          });
        }
      }
      nodes.forEach((n) => {
        n.baseX = n.x;
        n.baseY = n.y;
      });
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 95) {
            links.push({ i, j, dist });
          }
        }
      }
    };

    const frame = (time) => {
      tick = time;
      ctx.clearRect(0, 0, w, h);

      // background wash
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "rgba(14, 32, 24, 0.9)");
      bg.addColorStop(1, "rgba(8, 18, 14, 0.95)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const t = reduceMotion ? 0 : time * 0.001;

      nodes.forEach((n) => {
        if (!reduceMotion) {
          n.x = n.baseX + Math.sin(t * 0.7 + n.phase) * 4;
          n.y = n.baseY + Math.cos(t * 0.55 + n.phase * 1.3) * 3.5;
        }
      });

      // links
      links.forEach((l) => {
        const a = nodes[l.i];
        const b = nodes[l.j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        const alpha = Math.max(0, 1 - dist / 100) * 0.35;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(143, 188, 154, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      // nodes as buds / latent tokens
      nodes.forEach((n, idx) => {
        const pulse = reduceMotion ? 0.6 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.4 + n.phase));
        const r = n.kind > 0.82 ? 3.8 : 2.2;
        if (n.kind > 0.82) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(232, 180, 138, ${0.25 * pulse})`;
          ctx.arc(n.x, n.y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = `rgba(240, 201, 168, ${0.75 + 0.2 * pulse})`;
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.fillStyle = `rgba(157, 255, 200, ${0.35 + 0.4 * pulse})`;
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // occasional signal hop
        if (!reduceMotion && (idx + Math.floor(t * 3)) % 37 === 0) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(157, 255, 200, 0.35)";
          ctx.arc(n.x, n.y, 10 + (t * 20) % 12, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // soft light bloom top-left
      const glow = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, w * 0.45);
      glow.addColorStop(0, "rgba(157, 255, 200, 0.08)");
      glow.addColorStop(1, "rgba(157, 255, 200, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) frame(0);
    else raf = requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduceMotion) raf = requestAnimationFrame(frame);
    });
  }

  /* ---------- Year in footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
