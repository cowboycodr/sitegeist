(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Deterministic PRNG so every edition is fully described by its seed.
  const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const newSeed = () => Math.floor(Math.random() * 0xffffff) + 1;
  const seedLabel = (seed) => seed.toString(16).padStart(6, "0").toUpperCase();

  // Smooth 2D value noise built on the seeded PRNG.
  const makeNoise = (rand) => {
    const size = 64;
    const grid = new Float32Array(size * size);
    for (let i = 0; i < grid.length; i += 1) grid[i] = rand();
    const at = (x, y) => grid[((y % size) + size) % size * size + (((x % size) + size) % size)];
    const fade = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = fade(x - xi);
      const yf = fade(y - yi);
      const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
      const bot = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
      return top + (bot - top) * yf;
    };
  };

  const PAPER = "#101218";
  const INKS = ["#ece9df", "#cdf24b", "#8f83ff", "#e2704a", "#5fb8a5"];
  const pick = (rand, list) => list[Math.floor(rand() * list.length)];

  /* ---- the four exhibition systems ---- */

  const algorithms = {
    drift(ctx, w, h, rand) {
      const noise = makeNoise(rand);
      const scale = 0.004 + rand() * 0.004;
      const swirl = 3 + rand() * 5;
      const colors = [INKS[0], pick(rand, INKS.slice(1))];
      ctx.lineCap = "round";
      for (let i = 0; i < 420; i += 1) {
        let x = rand() * w;
        let y = rand() * h;
        ctx.strokeStyle = colors[rand() < 0.82 ? 0 : 1];
        ctx.globalAlpha = 0.16 + rand() * 0.3;
        ctx.lineWidth = rand() < 0.9 ? 1.2 : 3.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const steps = 60 + Math.floor(rand() * 120);
        for (let s = 0; s < steps; s += 1) {
          const a = noise(x * scale * 10, y * scale * 10) * Math.PI * swirl;
          x += Math.cos(a) * 3.2;
          y += Math.sin(a) * 3.2;
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },

    lattice(ctx, w, h, rand) {
      const cols = 6 + Math.floor(rand() * 4);
      const cell = w / (cols + 1);
      const rows = Math.floor(h / cell) - 1;
      const accent = pick(rand, INKS.slice(1));
      const phaseX = rand() * 6;
      const phaseY = rand() * 6;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const cx = cell * (c + 1) + cell / 2;
          const cy = cell * (r + 1) + cell / 2;
          const wave = Math.sin(c * 0.9 + phaseX) + Math.cos(r * 0.7 + phaseY);
          const radius = (cell * 0.42) * (0.35 + 0.65 * Math.abs(Math.sin(wave + rand() * 0.4)));
          const arcs = 2 + Math.floor(rand() * 4);
          const isAccent = rand() < 0.14;
          ctx.strokeStyle = isAccent ? accent : INKS[0];
          ctx.globalAlpha = isAccent ? 0.95 : 0.35 + rand() * 0.4;
          for (let k = 1; k <= arcs; k += 1) {
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            const start = wave + k;
            ctx.arc(cx, cy, (radius * k) / arcs, start, start + Math.PI * (0.7 + rand() * 1.2));
            ctx.stroke();
          }
          if (rand() < 0.1) {
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    },

    moss(ctx, w, h, rand) {
      const accent = pick(rand, INKS.slice(1));
      const walkers = 26 + Math.floor(rand() * 14);
      ctx.lineCap = "round";
      for (let i = 0; i < walkers; i += 1) {
        let x = w * (0.2 + rand() * 0.6);
        let y = h * (0.2 + rand() * 0.6);
        let angle = rand() * Math.PI * 2;
        const isAccent = rand() < 0.22;
        const life = 300 + Math.floor(rand() * 500);
        for (let s = 0; s < life; s += 1) {
          angle += (rand() - 0.5) * 1.1;
          const nx = x + Math.cos(angle) * 4;
          const ny = y + Math.sin(angle) * 4;
          if (nx < 30 || nx > w - 30 || ny < 30 || ny > h - 30) { angle += Math.PI / 2; continue; }
          const t = s / life;
          ctx.strokeStyle = isAccent ? accent : INKS[0];
          ctx.globalAlpha = 0.35 * (1 - t) + 0.05;
          ctx.lineWidth = 3.2 * (1 - t) + 0.4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          if (rand() < 0.012) {
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(nx, ny, 1.6 + rand() * 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
          x = nx;
          y = ny;
        }
      }
      ctx.globalAlpha = 1;
    },

    shards(ctx, w, h, rand) {
      const accent = pick(rand, INKS.slice(1));
      const accent2 = pick(rand, INKS.slice(1));
      const margin = 40;
      const divide = (x, y, rw, rh, depth) => {
        const minSide = 60;
        if (depth <= 0 || (rw < minSide * 2 && rh < minSide * 2) || rand() < 0.16) {
          const roll = rand();
          ctx.lineWidth = 2;
          ctx.strokeStyle = INKS[0];
          ctx.globalAlpha = 0.85;
          ctx.strokeRect(x, y, rw, rh);
          if (roll < 0.18) {
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(x, y, rw, rh);
          } else if (roll < 0.32) {
            ctx.fillStyle = accent2;
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            ctx.arc(x + rw / 2, y + rh / 2, Math.min(rw, rh) * 0.32, 0, Math.PI * 2);
            ctx.fill();
          } else if (roll < 0.5) {
            const lines = 3 + Math.floor(rand() * 6);
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 1.2;
            const vertical = rand() < 0.5;
            for (let i = 1; i < lines; i += 1) {
              ctx.beginPath();
              if (vertical) {
                ctx.moveTo(x + (rw * i) / lines, y);
                ctx.lineTo(x + (rw * i) / lines, y + rh);
              } else {
                ctx.moveTo(x, y + (rh * i) / lines);
                ctx.lineTo(x + rw, y + (rh * i) / lines);
              }
              ctx.stroke();
            }
          }
          return;
        }
        const cut = 0.3 + rand() * 0.4;
        if (rw > rh) {
          divide(x, y, rw * cut, rh, depth - 1);
          divide(x + rw * cut, y, rw * (1 - cut), rh, depth - 1);
        } else {
          divide(x, y, rw, rh * cut, depth - 1);
          divide(x, y + rh * cut, rw, rh * (1 - cut), depth - 1);
        }
      };
      divide(margin, margin, w - margin * 2, h - margin * 2, 6);
      ctx.globalAlpha = 1;
    },
  };

  const renderWork = (canvas, algorithm, seed) => {
    const ctx = canvas.getContext("2d");
    const { width: w, height: h } = canvas;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
    algorithms[algorithm](ctx, w, h, mulberry32(seed));
  };

  document.querySelectorAll(".work").forEach((work) => {
    const canvas = work.querySelector("canvas");
    const output = work.querySelector(".seed");
    const button = work.querySelector(".reseed");
    const algorithm = work.dataset.algorithm;
    const draw = () => {
      const seed = newSeed();
      renderWork(canvas, algorithm, seed);
      output.textContent = seedLabel(seed);
    };
    button.addEventListener("click", draw);
    draw();
  });

  /* ---- hero: slow constellation drift ---- */

  const hero = document.getElementById("hero-canvas");
  if (hero) {
    const ctx = hero.getContext("2d");
    let particles = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      hero.width = Math.round(width * dpr);
      hero.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rand = mulberry32(newSeed());
      const count = Math.min(90, Math.floor((width * height) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 0.25,
        vy: (rand() - 0.5) * 0.25,
        r: 0.8 + rand() * 1.8,
        hue: rand() < 0.5 ? "205,242,75" : "143,131,255",
      }));
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = `rgba(${p.hue},0.7)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            ctx.strokeStyle = `rgba(236,233,223,${0.12 * (1 - d2 / (110 * 110))})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const tick = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
      }
      paint();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      resize();
      if (reducedMotion.matches) {
        paint();
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    });
    reducedMotion.addEventListener("change", start);
    start();
  }
})();
