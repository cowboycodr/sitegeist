(() => {
  "use strict";

  const canvas = document.getElementById("game-canvas");
  const overlay = document.getElementById("game-overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayCopy = document.getElementById("overlay-copy");
  const startButton = document.getElementById("start-button");
  const hudScore = document.getElementById("hud-score");
  const hudBest = document.getElementById("hud-best");
  const hudTime = document.getElementById("hud-time");
  if (!canvas || !overlay || !startButton) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const CELL = 8;
  const ROUND_SECONDS = 30;

  const BRIGHT = ["#ff2d78", "#16f4d0", "#ffd23f", "#ff7a00"];
  const GLITCH = "#4a3a66";

  const paddle = { w: 48, h: 8, x: (W - 48) / 2, y: H - 18 };
  let drops = [];
  let sparks = [];
  let score = 0;
  let best = 0;
  let timeLeft = ROUND_SECONDS;
  let spawnTimer = 0;
  let running = false;
  let lastFrame = 0;
  let rafId = 0;

  const keys = { left: false, right: false };
  let pointerTargetX = null;

  function setHud() {
    hudScore.textContent = String(score);
    hudBest.textContent = String(best);
    hudTime.textContent = String(Math.max(0, Math.ceil(timeLeft)));
  }

  function spawnDrop() {
    const glitch = Math.random() < 0.28;
    drops.push({
      x: CELL * Math.floor(Math.random() * (W / CELL - 1)),
      y: -CELL,
      speed: 42 + Math.random() * 46 + (ROUND_SECONDS - timeLeft) * 1.6,
      glitch,
      color: glitch ? GLITCH : BRIGHT[Math.floor(Math.random() * BRIGHT.length)],
    });
  }

  function burst(x, y, color) {
    for (let i = 0; i < 6; i += 1) {
      sparks.push({
        x, y,
        vx: (Math.random() - 0.5) * 90,
        vy: -30 - Math.random() * 70,
        life: 0.5,
        color,
      });
    }
  }

  function update(dt) {
    const speed = 190;
    if (keys.left) paddle.x -= speed * dt;
    if (keys.right) paddle.x += speed * dt;
    if (pointerTargetX !== null) {
      const target = pointerTargetX - paddle.w / 2;
      paddle.x += (target - paddle.x) * Math.min(1, dt * 14);
    }
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnDrop();
      spawnTimer = Math.max(0.22, 0.6 - (ROUND_SECONDS - timeLeft) * 0.011);
    }

    for (const d of drops) d.y += d.speed * dt;
    drops = drops.filter((d) => {
      if (
        d.y + CELL >= paddle.y &&
        d.y <= paddle.y + paddle.h &&
        d.x + CELL >= paddle.x &&
        d.x <= paddle.x + paddle.w
      ) {
        if (d.glitch) {
          score = Math.max(0, score - 3);
          burst(d.x, paddle.y, GLITCH);
        } else {
          score += 1;
          burst(d.x, paddle.y, d.color);
        }
        return false;
      }
      return d.y < H + CELL;
    });

    for (const s of sparks) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 260 * dt;
      s.life -= dt;
    }
    sparks = sparks.filter((s) => s.life > 0);

    timeLeft -= dt;
    if (timeLeft <= 0) endRound();
  }

  function draw() {
    ctx.fillStyle = "#050011";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.045)";
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

    for (const d of drops) {
      ctx.fillStyle = d.color;
      ctx.fillRect(Math.round(d.x), Math.round(d.y), CELL, CELL);
      if (d.glitch) {
        ctx.fillStyle = "#050011";
        ctx.fillRect(Math.round(d.x) + 2, Math.round(d.y) + 2, 4, 4);
      }
    }

    for (const s of sparks) {
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 3, 3);
    }

    ctx.fillStyle = "#fdf6ff";
    ctx.fillRect(Math.round(paddle.x), paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = "#ff2d78";
    ctx.fillRect(Math.round(paddle.x) + 4, paddle.y + 2, paddle.w - 8, 4);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    update(dt);
    draw();
    setHud();
    rafId = requestAnimationFrame(frame);
  }

  function startRound() {
    drops = [];
    sparks = [];
    score = 0;
    timeLeft = ROUND_SECONDS;
    spawnTimer = 0;
    paddle.x = (W - paddle.w) / 2;
    pointerTargetX = null;
    running = true;
    overlay.hidden = true;
    setHud();
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
    canvas.focus?.();
  }

  function endRound() {
    running = false;
    cancelAnimationFrame(rafId);
    best = Math.max(best, score);
    timeLeft = 0;
    setHud();
    draw();
    overlayTitle.textContent = "TIME UP!";
    overlayCopy.textContent =
      score >= 25
        ? `You caught ${score} pixels. Certified pixel wrangler.`
        : `You caught ${score} pixels. The glitches send their regards.`;
    startButton.textContent = "Play again";
    overlay.hidden = false;
    startButton.focus();
  }

  startButton.addEventListener("click", startRound);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      keys.left = true;
      pointerTargetX = null;
      if (running) event.preventDefault();
    }
    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      keys.right = true;
      pointerTargetX = null;
      if (running) event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") keys.left = false;
    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") keys.right = false;
  });

  function canvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  }

  canvas.addEventListener("pointermove", (event) => {
    if (!running) return;
    pointerTargetX = canvasX(event.clientX);
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (!running) return;
    canvas.setPointerCapture?.(event.pointerId);
    pointerTargetX = canvasX(event.clientX);
  });

  // Idle attract screen behind the overlay.
  ctx.fillStyle = "#050011";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = BRIGHT[i % BRIGHT.length];
    ctx.fillRect(
      CELL * Math.floor(Math.random() * (W / CELL - 1)),
      CELL * Math.floor(Math.random() * (H / CELL - 3)),
      CELL,
      CELL,
    );
  }
  setHud();
})();
