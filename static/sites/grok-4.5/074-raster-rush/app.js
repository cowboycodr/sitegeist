(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile navigation */
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    const setNavOpen = (open) => {
      siteNav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    navToggle.addEventListener("click", () => {
      setNavOpen(!siteNav.classList.contains("is-open"));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  /* Rush Pixel mini-game */
  const canvas = document.getElementById("game");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const coinsEl = document.getElementById("coins");
  const statusEl = document.getElementById("status");
  const btnStart = document.getElementById("btn-start");
  const btnJump = document.getElementById("btn-jump");

  const W = canvas.width;
  const H = canvas.height;
  const GROUND = H - 56;
  const STORAGE_KEY = "raster-rush-best";

  let best = 0;
  try {
    best = Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch (_) {
    best = 0;
  }
  if (bestEl) bestEl.textContent = String(best);

  const state = {
    mode: "ready", // ready | running | dead
    t: 0,
    score: 0,
    coins: 0,
    speed: 4.2,
    distance: 0,
    player: {
      x: 84,
      y: GROUND - 28,
      w: 22,
      h: 28,
      vy: 0,
      onGround: true,
      jumpBuffered: false,
    },
    obstacles: [],
    pickups: [],
    particles: [],
    spawnTimer: 0,
    coinTimer: 40,
    flash: 0,
  };

  const palette = {
    bgTop: "#12081f",
    bgBot: "#05030c",
    ground: "#1a0f2e",
    groundLine: "#ff2d95",
    player: "#b8ff00",
    playerAccent: "#00f0ff",
    spike: "#ff2d95",
    coin: "#00f0ff",
    text: "#fff5e6",
    dim: "#c4b5d4",
  };

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function updateHud() {
    if (scoreEl) scoreEl.textContent = String(Math.floor(state.score));
    if (coinsEl) coinsEl.textContent = String(state.coins);
    if (bestEl) bestEl.textContent = String(best);
  }

  function resetRun() {
    state.mode = "running";
    state.t = 0;
    state.score = 0;
    state.coins = 0;
    state.speed = 4.2;
    state.distance = 0;
    state.obstacles = [];
    state.pickups = [];
    state.particles = [];
    state.spawnTimer = 50;
    state.coinTimer = 30;
    state.flash = 0;
    state.player.y = GROUND - state.player.h;
    state.player.vy = 0;
    state.player.onGround = true;
    state.player.jumpBuffered = false;
    setStatus("Running");
    updateHud();
  }

  function endRun() {
    state.mode = "dead";
    state.flash = 8;
    setStatus("Game over");
    if (state.score > best) {
      best = Math.floor(state.score);
      try {
        localStorage.setItem(STORAGE_KEY, String(best));
      } catch (_) {
        /* ignore */
      }
    }
    updateHud();
  }

  function jump() {
    if (state.mode === "ready") {
      resetRun();
      state.player.vy = -10.5;
      state.player.onGround = false;
      return;
    }
    if (state.mode === "dead") {
      resetRun();
      return;
    }
    if (state.player.onGround) {
      state.player.vy = -10.5;
      state.player.onGround = false;
      spawnDust(state.player.x + state.player.w / 2, GROUND);
    } else {
      state.player.jumpBuffered = true;
    }
  }

  function spawnDust(x, y) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 5; i += 1) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        life: 12 + Math.random() * 8,
        color: palette.playerAccent,
      });
    }
  }

  function spawnSpark(x, y, color) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 8; i += 1) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 14 + Math.random() * 10,
        color,
      });
    }
  }

  function spawnObstacle() {
    const kind = Math.random() < 0.65 ? "spike" : "block";
    if (kind === "spike") {
      state.obstacles.push({
        type: "spike",
        x: W + 10,
        y: GROUND - 24,
        w: 22,
        h: 24,
      });
    } else {
      const h = 28 + Math.floor(Math.random() * 24);
      state.obstacles.push({
        type: "block",
        x: W + 10,
        y: GROUND - h,
        w: 28,
        h,
      });
    }
  }

  function spawnCoin() {
    const air = Math.random() < 0.55;
    state.pickups.push({
      x: W + 8,
      y: air ? GROUND - 70 - Math.random() * 50 : GROUND - 36,
      w: 14,
      h: 14,
      got: false,
    });
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function update(dt) {
    if (state.mode !== "running") return;

    state.t += dt;
    state.distance += state.speed;
    state.score += state.speed * 0.15 + state.coins * 0.002;
    state.speed = Math.min(9.5, 4.2 + state.distance / 1800);

    const p = state.player;
    p.vy += 0.55;
    p.y += p.vy;

    if (p.y >= GROUND - p.h) {
      p.y = GROUND - p.h;
      p.vy = 0;
      if (!p.onGround && p.jumpBuffered) {
        p.onGround = true;
        p.jumpBuffered = false;
        p.vy = -10.5;
        p.onGround = false;
        spawnDust(p.x + p.w / 2, GROUND);
      } else {
        p.onGround = true;
        p.jumpBuffered = false;
      }
    }

    state.spawnTimer -= 1;
    if (state.spawnTimer <= 0) {
      spawnObstacle();
      state.spawnTimer = 55 + Math.floor(Math.random() * 55) - Math.floor(state.speed * 2);
      state.spawnTimer = Math.max(28, state.spawnTimer);
    }

    state.coinTimer -= 1;
    if (state.coinTimer <= 0) {
      spawnCoin();
      state.coinTimer = 35 + Math.floor(Math.random() * 45);
    }

    for (let i = state.obstacles.length - 1; i >= 0; i -= 1) {
      const o = state.obstacles[i];
      o.x -= state.speed;
      if (o.x + o.w < -20) {
        state.obstacles.splice(i, 1);
        continue;
      }
      const hitbox = {
        x: p.x + 3,
        y: p.y + 2,
        w: p.w - 6,
        h: p.h - 3,
      };
      if (rectsOverlap(hitbox, o)) {
        endRun();
        return;
      }
    }

    for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
      const c = state.pickups[i];
      c.x -= state.speed;
      if (c.x + c.w < -10) {
        state.pickups.splice(i, 1);
        continue;
      }
      if (!c.got && rectsOverlap(p, c)) {
        c.got = true;
        state.coins += 1;
        state.score += 25;
        spawnSpark(c.x + c.w / 2, c.y + c.h / 2, palette.coin);
        state.pickups.splice(i, 1);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const pt = state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 1;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    if (state.flash > 0) state.flash -= 1;
    updateHud();
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, palette.bgTop);
    g.addColorStop(1, palette.bgBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // parallax blocks
    ctx.fillStyle = "rgba(139, 92, 246, 0.18)";
    const scroll = (state.distance * 0.25) % 80;
    for (let x = -scroll; x < W; x += 80) {
      const h = 30 + ((x + scroll) / 80 % 3) * 18;
      ctx.fillRect(x, GROUND - h - 40, 24, h);
    }

    // stars
    ctx.fillStyle = "rgba(255, 245, 230, 0.35)";
    for (let i = 0; i < 18; i += 1) {
      const sx = (i * 97 + state.distance * 0.1) % W;
      const sy = (i * 37) % (GROUND - 60);
      ctx.fillRect(sx, 12 + sy * 0.4, 2, 2);
    }

    // ground
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = palette.groundLine;
    ctx.fillRect(0, GROUND, W, 4);

    // dashed track
    ctx.fillStyle = "#00f0ff";
    const dashScroll = state.distance % 32;
    for (let x = -dashScroll; x < W; x += 32) {
      ctx.fillRect(x, GROUND + 18, 16, 3);
    }
  }

  function drawPlayer() {
    const p = state.player;
    // body
    ctx.fillStyle = palette.player;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    // legs when running
    if (state.mode === "running" && p.onGround && !prefersReducedMotion) {
      const step = Math.floor(state.t / 4) % 2;
      ctx.fillStyle = palette.playerAccent;
      ctx.fillRect(p.x + 2, p.y + p.h - 6, 6, 6 + step * 2);
      ctx.fillRect(p.x + p.w - 8, p.y + p.h - 6, 6, 6 + (1 - step) * 2);
    } else {
      ctx.fillStyle = palette.playerAccent;
      ctx.fillRect(p.x + 2, p.y + p.h - 8, 6, 8);
      ctx.fillRect(p.x + p.w - 8, p.y + p.h - 8, 6, 8);
    }
    // eye
    ctx.fillStyle = "#0a0612";
    ctx.fillRect(p.x + 12, p.y + 8, 5, 5);
    // scarf
    ctx.fillStyle = palette.spike;
    ctx.fillRect(p.x - 2, p.y + 10, 6, 4);
  }

  function drawObstacles() {
    state.obstacles.forEach((o) => {
      if (o.type === "spike") {
        ctx.fillStyle = palette.spike;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h);
        ctx.lineTo(o.x + o.w / 2, o.y);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 245, 230, 0.25)";
        ctx.fillRect(o.x + o.w / 2 - 2, o.y + 8, 3, 10);
      } else {
        ctx.fillStyle = "#8b5cf6";
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.fillStyle = "#ff6b00";
        ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, 6);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(o.x, o.y + o.h - 6, o.w, 6);
      }
    });
  }

  function drawPickups() {
    state.pickups.forEach((c) => {
      const pulse = prefersReducedMotion ? 0 : Math.sin(state.t / 6 + c.x) * 2;
      ctx.fillStyle = palette.coin;
      ctx.fillRect(c.x, c.y + pulse, c.w, c.h);
      ctx.fillStyle = "#fff5e6";
      ctx.fillRect(c.x + 4, c.y + 4 + pulse, 4, 4);
      ctx.shadowColor = "transparent";
    });
  }

  function drawParticles() {
    state.particles.forEach((pt) => {
      ctx.globalAlpha = Math.max(0, pt.life / 20);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
      ctx.globalAlpha = 1;
    });
  }

  function drawOverlay() {
    if (state.mode === "ready") {
      ctx.fillStyle = "rgba(5, 3, 12, 0.45)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = palette.text;
      ctx.font = "bold 28px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("RUSH PIXEL", W / 2, H / 2 - 24);
      ctx.fillStyle = palette.coin;
      ctx.font = "16px ui-monospace, monospace";
      ctx.fillText("Press Enter or Start Run", W / 2, H / 2 + 10);
      ctx.fillStyle = palette.dim;
      ctx.font = "13px ui-monospace, monospace";
      ctx.fillText("Space / Tap to jump · Collect cyan coins", W / 2, H / 2 + 36);
    } else if (state.mode === "dead") {
      ctx.fillStyle = "rgba(5, 3, 12, 0.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = palette.spike;
      ctx.font = "bold 28px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("CRASHED", W / 2, H / 2 - 18);
      ctx.fillStyle = palette.text;
      ctx.font = "16px ui-monospace, monospace";
      ctx.fillText("Score " + Math.floor(state.score) + " · Coins " + state.coins, W / 2, H / 2 + 12);
      ctx.fillStyle = palette.lime || "#b8ff00";
      ctx.fillStyle = "#b8ff00";
      ctx.font = "14px ui-monospace, monospace";
      ctx.fillText("Enter / Start for another run", W / 2, H / 2 + 40);
    }

    if (state.flash > 0) {
      ctx.fillStyle = "rgba(255, 45, 149, 0.25)";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function draw() {
    drawBackground();
    drawPickups();
    drawObstacles();
    drawPlayer();
    drawParticles();
    drawOverlay();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(2, (now - last) / 16.666);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  // Input
  function onKey(event) {
    if (event.key === " " || event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
      event.preventDefault();
      jump();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (state.mode === "ready" || state.mode === "dead") resetRun();
      else jump();
    }
  }

  window.addEventListener("keydown", onKey);

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (state.mode === "ready" || state.mode === "dead") resetRun();
    else jump();
  });

  if (btnStart) {
    btnStart.addEventListener("click", () => {
      if (state.mode === "running") return;
      resetRun();
    });
  }

  if (btnJump) {
    btnJump.addEventListener("click", () => jump());
  }

  setStatus("Ready");
  updateHud();
  draw();
  requestAnimationFrame(frame);
})();
