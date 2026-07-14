(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- utilities ---------- */

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function next() {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function randomSeed() {
    return (Math.random() * 0xffffffff) >>> 0;
  }

  function formatSeed(seed) {
    return seed.toString(16).toUpperCase().padStart(8, "0");
  }

  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height || cssW * 0.66));
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w, h, dpr, cssW, cssH };
  }

  /* ---------- navigation ---------- */

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ---------- generative engines ---------- */

  function createHero(canvas) {
    let seed = randomSeed();
    let rand = mulberry32(seed);
    let particles = [];
    let time = 0;
    let raf = 0;
    let running = !reduceMotion;

    function rebuild() {
      rand = mulberry32(seed);
      const { w, h } = fitCanvas(canvas);
      const count = Math.floor((w * h) / 14000);
      particles = [];
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: rand() * w,
          y: rand() * h,
          r: 0.6 + rand() * 2.4,
          sp: 0.15 + rand() * 0.55,
          phase: rand() * Math.PI * 2,
          hue: 250 + rand() * 80,
          a: 0.15 + rand() * 0.45,
        });
      }
      paint(true);
    }

    function paint(forceStill) {
      const { w, h } = fitCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0a0b14");
      g.addColorStop(0.45, "#12102a");
      g.addColorStop(1, "#0b1520");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // soft nebula blobs
      for (let i = 0; i < 5; i += 1) {
        const bx = (0.15 + ((i * 0.17 + seed % 7) % 1) * 0.7) * w;
        const by = (0.2 + ((i * 0.23 + (seed >> 3) % 5) % 1) * 0.55) * h;
        const br = Math.min(w, h) * (0.18 + (i % 3) * 0.05);
        const rg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const hues = ["139,124,255", "94,200,212", "224,122,154", "224,176,106"];
        const c = hues[i % hues.length];
        rg.addColorStop(0, `rgba(${c},0.18)`);
        rg.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      const t = forceStill ? 0 : time;
      particles.forEach((p) => {
        const ox = Math.sin(t * 0.00035 * p.sp + p.phase) * 18;
        const oy = Math.cos(t * 0.00028 * p.sp + p.phase * 1.3) * 14;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 70%, 72%, ${p.a})`;
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // faint horizon line
      ctx.strokeStyle = "rgba(232,230,240,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.bezierCurveTo(w * 0.3, h * 0.68, w * 0.7, h * 0.78, w, h * 0.7);
      ctx.stroke();
    }

    function frame(ts) {
      if (!running) return;
      time = ts;
      paint(false);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        paint(true);
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    rebuild();
    start();

    return {
      resize: rebuild,
      reseed() {
        seed = randomSeed();
        rebuild();
      },
      stop,
      start,
    };
  }

  function createField(canvas, seedLabel) {
    let seed = randomSeed();
    let rand = mulberry32(seed);
    let points = [];
    let time = 0;
    let raf = 0;
    let running = !reduceMotion;
    let paused = false;

    function updateSeedLabel() {
      if (seedLabel) seedLabel.textContent = `Seed ${formatSeed(seed)}`;
    }

    function rebuild() {
      rand = mulberry32(seed);
      updateSeedLabel();
      const { w, h } = fitCanvas(canvas);
      const n = Math.floor((w * h) / 4200);
      points = [];
      for (let i = 0; i < n; i += 1) {
        points.push({
          x: rand() * w,
          y: rand() * h,
          vx: (rand() - 0.5) * 0.35,
          vy: (rand() - 0.5) * 0.35,
          r: 1 + rand() * 2.8,
          hue: 255 + rand() * 70,
          life: rand(),
        });
      }
      paint(true);
    }

    function paint(still) {
      const { w, h } = fitCanvas(canvas);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(7,8,15,0.28)";
      if (still) {
        ctx.fillStyle = "#07080f";
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.fillRect(0, 0, w, h);
      }

      const cx = w * 0.5;
      const cy = h * 0.5;
      const ax = Math.sin(time * 0.0004) * w * 0.12;
      const ay = Math.cos(time * 0.0003) * h * 0.1;

      // attractor glow
      const rg = ctx.createRadialGradient(cx + ax, cy + ay, 0, cx + ax, cy + ay, Math.min(w, h) * 0.45);
      rg.addColorStop(0, "rgba(139,124,255,0.12)");
      rg.addColorStop(0.5, "rgba(94,200,212,0.05)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);

      points.forEach((p) => {
        if (!still && !paused) {
          const dx = cx + ax - p.x;
          const dy = cy + ay - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          p.vx += (dx / d) * 0.018;
          p.vy += (dy / d) * 0.018;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x += w;
          if (p.x > w) p.x -= w;
          if (p.y < 0) p.y += h;
          if (p.y > h) p.y -= h;
        }
        const pulse = still ? 1 : 0.7 + 0.3 * Math.sin(time * 0.003 + p.life * 10);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 68%, 70%, ${0.35 * pulse})`;
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function frame(ts) {
      if (!running || paused) return;
      time = ts;
      paint(false);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        paint(true);
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    rebuild();
    start();

    return {
      resize: rebuild,
      reseed() {
        seed = randomSeed();
        rebuild();
        if (!paused && !reduceMotion) start();
      },
      setPaused(value) {
        paused = value;
        if (paused) {
          cancelAnimationFrame(raf);
          paint(true);
        } else if (!reduceMotion) {
          start();
        }
      },
      getPaused: () => paused,
    };
  }

  function createRibbons(canvas) {
    let seed = randomSeed();
    let time = 0;
    let raf = 0;
    let running = !reduceMotion;

    function paint(still) {
      const { w, h } = fitCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const rand = mulberry32(seed);
      ctx.fillStyle = "#07080f";
      ctx.fillRect(0, 0, w, h);

      const ribbons = 5 + Math.floor(rand() * 3);
      const t = still ? seed % 1000 : time * 0.001;

      for (let r = 0; r < ribbons; r += 1) {
        const amp = h * (0.08 + rand() * 0.16);
        const freq = 1.2 + rand() * 2.4;
        const phase = rand() * Math.PI * 2;
        const y0 = h * (0.2 + rand() * 0.6);
        const hue = 180 + rand() * 140;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y =
            y0 +
            Math.sin((x / w) * Math.PI * freq + phase + t * (0.4 + r * 0.07)) * amp +
            Math.sin((x / w) * Math.PI * (freq * 1.7) - t * 0.3) * amp * 0.35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue}, 70%, 68%, 0.55)`;
        ctx.lineWidth = 1.5 + rand() * 2.5;
        ctx.stroke();
      }

      // soft vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    function frame(ts) {
      if (!running) return;
      time = ts;
      paint(false);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        paint(true);
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    paint(true);
    start();

    return {
      resize() {
        paint(reduceMotion);
      },
      reseed() {
        seed = randomSeed();
        paint(reduceMotion);
        if (!reduceMotion) start();
      },
    };
  }

  function createLattice(canvas) {
    let seed = randomSeed();
    let grid = [];
    let cols = 0;
    let rows = 0;
    let cell = 8;
    let generation = 0;
    let raf = 0;
    let running = !reduceMotion;
    let last = 0;

    function initGrid() {
      const { w, h } = fitCanvas(canvas);
      cell = Math.max(6, Math.floor(Math.min(w, h) / 48));
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      const rand = mulberry32(seed);
      grid = new Array(cols * rows).fill(0);
      const cx = Math.floor(cols / 2);
      const cy = Math.floor(rows / 2);
      for (let i = 0; i < cols * rows * 0.12; i += 1) {
        const x = cx + Math.floor((rand() - 0.5) * cols * 0.5);
        const y = cy + Math.floor((rand() - 0.5) * rows * 0.5);
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          grid[y * cols + x] = 1;
        }
      }
      generation = 0;
      paint();
    }

    function neighbors(x, y) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = (x + dx + cols) % cols;
          const ny = (y + dy + rows) % rows;
          n += grid[ny * cols + nx];
        }
      }
      return n;
    }

    function step() {
      const next = new Array(cols * rows);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          const n = neighbors(x, y);
          const alive = grid[i] === 1;
          // soft bloom rule: birth on 3, survive on 2-3, rare spontaneous growth
          if (alive) next[i] = n === 2 || n === 3 ? 1 : 0;
          else next[i] = n === 3 ? 1 : 0;
        }
      }
      // occasional reseed spark to keep lattice living
      if (generation % 40 === 0) {
        const rand = mulberry32(seed + generation + 1);
        for (let k = 0; k < 8; k += 1) {
          const x = Math.floor(rand() * cols);
          const y = Math.floor(rand() * rows);
          next[y * cols + x] = 1;
        }
      }
      grid = next;
      generation += 1;
    }

    function paint() {
      const { w, h } = fitCanvas(canvas);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#07080f";
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          if (!grid[y * cols + x]) continue;
          const n = neighbors(x, y);
          const hue = 140 + n * 12 + (generation % 30);
          ctx.fillStyle = `hsla(${hue}, 55%, ${48 + n * 4}%, 0.75)`;
          ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
        }
      }
    }

    function frame(ts) {
      if (!running) return;
      if (ts - last > 120) {
        step();
        paint();
        last = ts;
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        // advance a few generations for a rich still
        for (let i = 0; i < 12; i += 1) step();
        paint();
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    initGrid();
    start();

    return {
      resize: initGrid,
      reseed() {
        seed = randomSeed();
        initGrid();
        if (!reduceMotion) start();
      },
    };
  }

  function createInterference(canvas) {
    let seed = randomSeed();
    let time = 0;
    let raf = 0;
    let running = !reduceMotion;

    function paint(still) {
      const { w, h, dpr } = fitCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const rand = mulberry32(seed);
      const sources = [];
      for (let i = 0; i < 3; i += 1) {
        sources.push({
          x: rand() * w,
          y: rand() * h,
          f: 0.012 + rand() * 0.02,
          phase: rand() * Math.PI * 2,
        });
      }

      const img = ctx.createImageData(w, h);
      const data = img.data;
      const t = still ? 0 : time * 0.0015;
      const step = Math.max(1, Math.floor(2 * dpr));

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          let v = 0;
          for (let s = 0; s < sources.length; s += 1) {
            const src = sources[s];
            const dx = x - src.x;
            const dy = y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            v += Math.sin(dist * src.f - t + src.phase);
          }
          v = (v / sources.length + 1) * 0.5;
          const r = Math.floor(30 + v * 180 + (seed % 40));
          const g = Math.floor(40 + (1 - v) * 90);
          const b = Math.floor(90 + v * 140);
          for (let oy = 0; oy < step && y + oy < h; oy += 1) {
            for (let ox = 0; ox < step && x + ox < w; ox += 1) {
              const i = ((y + oy) * w + (x + ox)) * 4;
              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
              data[i + 3] = 255;
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);

      // overlay dark edges
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.72);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(7,8,15,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    function frame(ts) {
      if (!running) return;
      time = ts;
      paint(false);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        paint(true);
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    paint(true);
    start();

    return {
      resize() {
        paint(reduceMotion);
      },
      reseed() {
        seed = randomSeed();
        paint(reduceMotion);
        if (!reduceMotion) start();
      },
    };
  }

  function createOrbitOrb(canvas) {
    let seed = hashString("latent-visit") ^ randomSeed();
    let time = 0;
    let raf = 0;
    let running = !reduceMotion;

    function paint(still) {
      const { w, h } = fitCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.42;
      const t = still ? seed % 500 : time * 0.001;
      const rand = mulberry32(seed);

      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.1);
      bg.addColorStop(0, "#1a1630");
      bg.addColorStop(1, "#07080f");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 8; i += 1) {
        const rr = r * (0.25 + i * 0.08);
        const rot = t * (0.15 + i * 0.03) * (i % 2 === 0 ? 1 : -1);
        ctx.strokeStyle = `hsla(${250 + i * 12}, 70%, 70%, ${0.15 + i * 0.04})`;
        ctx.lineWidth = 1 + (i % 3) * 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * (0.55 + rand() * 0.35), rot, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 24; i += 1) {
        const ang = t * 0.4 + i * ((Math.PI * 2) / 24) + rand();
        const rad = r * (0.3 + (i % 5) * 0.1);
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang * 1.1) * rad * 0.7;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${200 + i * 6}, 75%, 72%, 0.7)`;
        ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(ts) {
      if (!running) return;
      time = ts;
      paint(false);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion) {
        paint(true);
        return;
      }
      running = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    paint(true);
    start();

    return {
      resize() {
        paint(reduceMotion);
      },
      reseed() {
        seed = randomSeed();
        paint(reduceMotion);
        if (!reduceMotion) start();
      },
    };
  }

  /* ---------- wire up ---------- */

  const engines = [];

  const heroCanvas = document.getElementById("hero-canvas");
  if (heroCanvas) engines.push(createHero(heroCanvas));

  const featureCanvas = document.getElementById("feature-canvas");
  const featureSeed = document.getElementById("feature-seed");
  let fieldEngine = null;
  if (featureCanvas) {
    fieldEngine = createField(featureCanvas, featureSeed);
    engines.push(fieldEngine);
  }

  const reseedBtn = document.getElementById("feature-reseed");
  const pauseBtn = document.getElementById("feature-pause");
  if (reseedBtn && fieldEngine) {
    reseedBtn.addEventListener("click", () => fieldEngine.reseed());
  }
  if (pauseBtn && fieldEngine) {
    if (reduceMotion) {
      pauseBtn.setAttribute("aria-pressed", "true");
      pauseBtn.textContent = "Paused";
      pauseBtn.disabled = true;
    } else {
      pauseBtn.addEventListener("click", () => {
        const next = !fieldEngine.getPaused();
        fieldEngine.setPaused(next);
        pauseBtn.setAttribute("aria-pressed", next ? "true" : "false");
        pauseBtn.textContent = next ? "Resume" : "Pause";
      });
    }
  }

  const editionMap = {
    "edition-a": createRibbons,
    "edition-b": createLattice,
    "edition-c": createInterference,
  };

  Object.keys(editionMap).forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const engine = editionMap[id](canvas);
    engines.push(engine);
    canvas._engine = engine;
  });

  document.querySelectorAll(".reseed-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-target");
      const canvas = document.getElementById(id);
      if (canvas && canvas._engine) canvas._engine.reseed();
    });
  });

  const visitCanvas = document.getElementById("visit-canvas");
  if (visitCanvas) engines.push(createOrbitOrb(visitCanvas));

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      engines.forEach((e) => {
        if (e && typeof e.resize === "function") e.resize();
      });
    }, 120);
  });
})();
