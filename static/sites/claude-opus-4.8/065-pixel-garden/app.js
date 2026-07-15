(() => {
  "use strict";

  const canvas = document.getElementById("garden");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;   // 360
  const H = canvas.height;  // 270
  const GROUND = H - 34;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const PALETTES = [
    { stem: "#5bbf74", leaf: "#7bd88f", bloom: "#ff8fb1", core: "#ffd76e" },
    { stem: "#4aa9c4", leaf: "#79cfe0", bloom: "#b28dff", core: "#ffe08a" },
    { stem: "#c99a3f", leaf: "#e8c463", bloom: "#ff9d6e", core: "#fff0b0" },
    { stem: "#6b8fd8", leaf: "#8fb0ff", bloom: "#ff8fb1", core: "#c9f5d0" },
  ];

  let plants = [];
  let seed = (Math.random() * 1e9) | 0;
  const rnd = () => {
    // small deterministic-ish PRNG so a plant looks stable frame to frame
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const status = document.getElementById("garden-hint");
  const baseHint = status ? status.textContent : "";
  const announce = (msg) => { if (status) status.textContent = msg; };

  function makePlant(x) {
    const p = PALETTES[(Math.random() * PALETTES.length) | 0];
    const maxH = 70 + Math.random() * 90;
    const segs = [];
    let sway = (Math.random() - 0.5) * 22;
    const n = 5 + ((Math.random() * 4) | 0);
    for (let i = 0; i < n; i++) {
      segs.push({ dx: (Math.random() - 0.5) * 10, leaf: Math.random() > 0.4, side: Math.random() > 0.5 ? 1 : -1 });
    }
    return {
      x: Math.max(14, Math.min(W - 14, x)),
      maxH, segs, sway, pal: p,
      petals: 5 + ((Math.random() * 4) | 0),
      grow: reduce.matches ? 1 : 0,
    };
  }

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function drawBackground() {
    // sky gradient handled by CSS bg; paint soft stars + ground
    ctx.clearRect(0, 0, W, H);
    // stars
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 26; i++) {
      const sx = (i * 97 + 13) % W;
      const sy = (i * 53 + 7) % (GROUND - 40);
      px(sx, sy, 2, 2, i % 3 ? "#3a4d6b" : "#8fa6d8");
    }
    ctx.globalAlpha = 1;
    // ground rows
    px(0, GROUND, W, H - GROUND, "#243a2a");
    px(0, GROUND, W, 4, "#31563a");
    for (let x = 0; x < W; x += 8) {
      px(x + (x % 16 ? 2 : 5), GROUND + 8 + (x % 24 ? 0 : 4), 2, 2, "#3b6547");
    }
  }

  function drawPlant(pl) {
    const g = pl.grow;
    const h = pl.maxH * g;
    const topY = GROUND - h;
    // stem, built from segments curving with sway
    const steps = 22;
    let prevX = pl.x, prevY = GROUND;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const yy = GROUND - h * t;
      const xx = pl.x + Math.sin(t * Math.PI) * pl.sway * t;
      px(xx - 1, yy, 3, 3, pl.pal.stem);
      // leaves at intervals
      if (i % 5 === 0 && t < 0.92) {
        const side = i % 10 === 0 ? 1 : -1;
        const ls = 6 * g;
        for (let l = 0; l < 4; l++) {
          px(xx + side * (3 + l * 2), yy - l, Math.max(1, ls - l), 2, pl.pal.leaf);
        }
      }
      prevX = xx; prevY = yy;
    }
    // flower head at top once grown enough
    if (g > 0.55) {
      const cx = prevX, cy = topY;
      const petalR = 4 + 3 * g;
      const alpha = Math.min(1, (g - 0.55) / 0.35);
      ctx.globalAlpha = alpha;
      for (let k = 0; k < pl.petals; k++) {
        const a = (k / pl.petals) * Math.PI * 2 + pl.sway * 0.02;
        const px1 = cx + Math.cos(a) * petalR;
        const py1 = cy + Math.sin(a) * petalR;
        px(px1 - 2, py1 - 2, 4, 4, pl.pal.bloom);
      }
      px(cx - 2, cy - 2, 4, 4, pl.pal.core);
      ctx.globalAlpha = 1;
    }
  }

  function render() {
    drawBackground();
    for (const pl of plants) drawPlant(pl);
  }

  let raf = 0;
  function tick() {
    let animating = false;
    for (const pl of plants) {
      if (pl.grow < 1) {
        pl.grow = Math.min(1, pl.grow + 0.035);
        animating = true;
      }
    }
    render();
    raf = animating ? requestAnimationFrame(tick) : 0;
  }

  function plant(x) {
    if (plants.length >= 40) plants.shift();
    plants.push(makePlant(x));
    announce("Planted a seed. " + plants.length + " growing.");
    if (reduce.matches) {
      render();
    } else if (!raf) {
      raf = requestAnimationFrame(tick);
    }
  }

  function localX(evt) {
    const r = canvas.getBoundingClientRect();
    const cx = (evt.clientX - r.left) / r.width;
    return Math.max(0, Math.min(1, cx)) * W;
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    plant(localX(e));
  });

  canvas.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      plant(30 + Math.random() * (W - 60));
    }
  });

  const plantBtn = document.getElementById("plant");
  if (plantBtn) plantBtn.addEventListener("click", () => plant(30 + Math.random() * (W - 60)));

  const clearBtn = document.getElementById("clear");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    plants = [];
    render();
    announce("Plot cleared. " + baseHint);
  });

  // seed the plot with a few starter plants
  render();
  const starters = [W * 0.24, W * 0.5, W * 0.74];
  for (const sx of starters) plants.push(makePlant(sx));
  if (reduce.matches) render();
  else raf = requestAnimationFrame(tick);
})();
