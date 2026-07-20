/* Latent Garden — hero growth simulation.
   A tiny branching model: stems rise from the soil line, curve toward a light
   point, split occasionally, and bloom at their tips. Runs entirely locally. */

(() => {
  "use strict";

  const canvas = document.getElementById("garden-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const COLORS = {
    stem: "rgba(143, 201, 122, 0.55)",
    stemDeep: "rgba(76, 138, 82, 0.5)",
    bloomWarm: "rgba(242, 181, 68, 0.9)",
    bloomHot: "rgba(232, 114, 76, 0.85)",
    bloomPale: "rgba(247, 243, 232, 0.85)",
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let shoots = [];
  let blooms = [];
  let running = true;
  let rafId = 0;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeShoot(x, y, angle, energy, thickness) {
    return {
      x, y, angle, energy, thickness,
      wobble: rand(0, Math.PI * 2),
      speed: rand(0.6, 1.3),
    };
  }

  function seed() {
    shoots = [];
    blooms = [];
    ctx.clearRect(0, 0, width, height);
    const count = Math.max(6, Math.round(width / 90));
    for (let i = 0; i < count; i += 1) {
      const x = rand(width * 0.03, width * 0.97);
      shoots.push(makeShoot(
        x,
        height + rand(0, 24),
        -Math.PI / 2 + rand(-0.35, 0.35),
        rand(height * 0.35, height * 0.85),
        rand(1.2, 2.6),
      ));
    }
  }

  function bloomAt(x, y, radius) {
    blooms.push({ x, y, radius, life: 0, color: pick([COLORS.bloomWarm, COLORS.bloomHot, COLORS.bloomPale]) });
  }

  function step() {
    // Gentle fade so old growth recedes like an afterimage.
    ctx.fillStyle = "rgba(24, 42, 29, 0.018)";
    ctx.fillRect(0, 0, width, height);

    const lightX = width / 2;
    const nextShoots = [];

    for (const s of shoots) {
      const px = s.x;
      const py = s.y;
      s.wobble += 0.11;
      // Phototropism: lean slightly toward the light column, plus sway.
      const pull = Math.max(-0.02, Math.min(0.02, (lightX - s.x) * 0.00003));
      s.angle += Math.sin(s.wobble) * 0.055 + pull;
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.energy -= s.speed;

      ctx.strokeStyle = s.thickness > 1.7 ? COLORS.stemDeep : COLORS.stem;
      ctx.lineWidth = s.thickness;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      const escaped = s.x < -30 || s.x > width + 30 || s.y < -30;
      if (s.energy <= 0 || escaped) {
        if (!escaped) bloomAt(s.x, s.y, rand(2, 4.5));
        continue;
      }

      // Occasional split: one branch veers off, both lose energy.
      if (s.thickness > 0.7 && Math.random() < 0.012) {
        const child = makeShoot(
          s.x, s.y,
          s.angle + rand(0.5, 1.1) * (Math.random() < 0.5 ? -1 : 1),
          s.energy * rand(0.4, 0.7),
          s.thickness * 0.72,
        );
        s.energy *= 0.75;
        nextShoots.push(child);
        if (Math.random() < 0.35) bloomAt(s.x, s.y, rand(1.2, 2.4));
      }
      nextShoots.push(s);
    }
    shoots = nextShoots;

    // Blooms pulse open once, then settle.
    for (const b of blooms) {
      if (b.life > 1) continue;
      b.life += 0.06;
      const r = b.radius * Math.min(1, b.life);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    blooms = blooms.filter((b) => b.life <= 1);

    // Keep the meadow alive: replant when growth thins out.
    if (shoots.length < 4) {
      shoots.push(makeShoot(
        rand(width * 0.05, width * 0.95),
        height + rand(0, 20),
        -Math.PI / 2 + rand(-0.35, 0.35),
        rand(height * 0.3, height * 0.7),
        rand(1.1, 2.2),
      ));
    }
  }

  function loop() {
    step();
    rafId = requestAnimationFrame(loop);
  }

  function drawStill() {
    // Reduced motion or paused: grow a complete garden instantly, no animation.
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < 900 && shoots.length; i += 1) step();
    for (const b of blooms) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    blooms = [];
  }

  function start() {
    cancelAnimationFrame(rafId);
    seed();
    if (reduceMotion.matches || !running) {
      drawStill();
    } else {
      loop();
    }
  }

  const reseedButton = document.getElementById("reseed");
  const toggleButton = document.getElementById("toggle-growth");

  if (reseedButton) reseedButton.addEventListener("click", start);

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      running = !running;
      toggleButton.setAttribute("aria-pressed", String(running));
      toggleButton.textContent = running ? "Pause growth" : "Resume growth";
      if (!running || reduceMotion.matches) {
        cancelAnimationFrame(rafId);
      } else {
        cancelAnimationFrame(rafId);
        loop();
      }
    });
  }

  reduceMotion.addEventListener("change", start);

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      start();
    }, 150);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else if (running && !reduceMotion.matches) {
      cancelAnimationFrame(rafId);
      loop();
    }
  });

  resize();
  start();
})();
