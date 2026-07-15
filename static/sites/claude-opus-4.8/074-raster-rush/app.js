(() => {
  "use strict";

  /* ---------- Animated stat counters ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const runCount = (el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      if (reduceMotion) { el.textContent = String(target); return; }
      const start = performance.now();
      const dur = 900;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach((c) => io.observe(c));
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- Mini game ---------- */
  const canvas = document.getElementById("stage");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayHint = document.getElementById("overlayHint");
  const startBtn = document.getElementById("startBtn");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const livesEl = document.getElementById("lives");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  const PAL = { pink: "#ff2e63", yellow: "#ffb800", cyan: "#00e5ff", green: "#39ff14", violet: "#7c4dff" };

  const state = {
    running: false,
    score: 0,
    best: 0,
    lives: 3,
    player: { x: W / 2, w: 46, h: 14 },
    items: [],
    particles: [],
    spawnTimer: 0,
    spawnEvery: 62,
    speed: 1.5,
    tick: 0,
    move: 0, // -1 left, 1 right, 0 none
  };

  const hearts = (n) => "♥".repeat(Math.max(0, n)) + "♡".repeat(Math.max(0, 3 - n));

  function reset() {
    state.score = 0;
    state.lives = 3;
    state.player.x = W / 2;
    state.items = [];
    state.particles = [];
    state.spawnTimer = 0;
    state.spawnEvery = 62;
    state.speed = 1.5;
    state.tick = 0;
    scoreEl.textContent = "0";
    livesEl.textContent = hearts(3);
  }

  function spawn() {
    const isBomb = Math.random() < 0.28;
    state.items.push({
      x: 20 + Math.random() * (W - 40),
      y: -16,
      r: 11,
      bomb: isBomb,
      vy: state.speed + Math.random() * 1.2,
      spin: Math.random() * Math.PI,
    });
  }

  function burst(x, y, color) {
    if (reduceMotion) return;
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1 + Math.random() * 3;
      state.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
        life: 26, color,
      });
    }
  }

  function endGame() {
    state.running = false;
    state.move = 0;
    if (state.score > state.best) {
      state.best = state.score;
      bestEl.textContent = String(state.best);
    }
    overlay.setAttribute("data-state", "idle");
    overlayTitle.textContent = "GAME OVER";
    overlayHint.textContent = "You scored " + state.score + ". Press start to rush again.";
    startBtn.textContent = "Retry";
    startBtn.focus();
  }

  function start() {
    reset();
    state.running = true;
    overlay.setAttribute("data-state", "playing");
    if (!loopHandle) loop();
  }

  function update() {
    state.tick++;
    // difficulty creep
    if (state.tick % 360 === 0) {
      state.speed += 0.35;
      if (state.spawnEvery > 30) state.spawnEvery -= 4;
    }

    // player movement
    const p = state.player;
    let dir = state.move;
    if (keys.left && !keys.right) dir = -1;
    else if (keys.right && !keys.left) dir = 1;
    if (dir) p.x += dir * 5.2;
    p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x));

    // spawn
    if (++state.spawnTimer >= state.spawnEvery) {
      state.spawnTimer = 0;
      spawn();
    }

    // items
    const py = H - 34;
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      it.y += it.vy;
      it.spin += 0.08;
      // catch test
      if (it.y + it.r >= py && it.y - it.r <= py + p.h &&
          Math.abs(it.x - p.x) <= p.w / 2 + it.r - 2) {
        if (it.bomb) {
          state.lives--;
          livesEl.textContent = hearts(state.lives);
          burst(it.x, py, PAL.pink);
          state.items.splice(i, 1);
          if (state.lives <= 0) { endGame(); return; }
        } else {
          state.score += 10;
          scoreEl.textContent = String(state.score);
          burst(it.x, py, PAL.yellow);
          state.items.splice(i, 1);
        }
        continue;
      }
      if (it.y - it.r > H) state.items.splice(i, 1);
    }

    // particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.14; pt.life--;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }
  }

  function drawGem(it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    if (it.bomb) {
      ctx.fillStyle = PAL.pink;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, it.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // fuse spark
      ctx.fillStyle = PAL.yellow;
      ctx.fillRect(-2, -it.r - 5, 4, 5);
      ctx.fillStyle = "#000";
      ctx.fillRect(-4, -3, 3, 3);
      ctx.fillRect(2, -3, 3, 3);
    } else {
      ctx.rotate(it.spin);
      ctx.fillStyle = PAL.cyan;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      const r = it.r;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(-3, -6, 3, 3);
    }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    // starfield backdrop
    ctx.fillStyle = "#05030f";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(124,77,255,0.35)";
    for (let i = 0; i < 26; i++) {
      const sx = (i * 71 + (reduceMotion ? 0 : state.tick * 0.4) * (1 + (i % 3))) % W;
      const sy = (i * 53) % H;
      ctx.fillRect(sx, (sy + i) % H, 2, 2);
    }

    // items
    state.items.forEach(drawGem);

    // particles
    state.particles.forEach((pt) => {
      ctx.globalAlpha = Math.max(0, pt.life / 26);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    // player collector
    const p = state.player;
    const py = H - 34;
    ctx.fillStyle = PAL.green;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - p.w / 2, py + p.h);
    ctx.lineTo(p.x - p.w / 2 + 6, py);
    ctx.lineTo(p.x + p.w / 2 - 6, py);
    ctx.lineTo(p.x + p.w / 2, py + p.h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(p.x - 10, py + 3, 4, 4);
    ctx.fillRect(p.x + 6, py + 3, 4, 4);
  }

  let loopHandle = 0;
  function loop() {
    if (state.running) update();
    render();
    if (state.running) {
      loopHandle = requestAnimationFrame(loop);
    } else {
      loopHandle = 0;
    }
  }

  /* ---------- Input ---------- */
  const keys = { left: false, right: false };

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { keys.left = true; if (state.running) e.preventDefault(); }
    else if (e.key === "ArrowRight") { keys.right = true; if (state.running) e.preventDefault(); }
    else if ((e.key === " " || e.key === "Enter") && !state.running &&
             document.activeElement === startBtn) { /* button handles it */ }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") keys.left = false;
    else if (e.key === "ArrowRight") keys.right = false;
  });

  const holdBtn = (btn, val) => {
    const on = (e) => { e.preventDefault(); state.move = val; };
    const off = () => { if (state.move === val) state.move = 0; };
    btn.addEventListener("pointerdown", on);
    btn.addEventListener("pointerup", off);
    btn.addEventListener("pointerleave", off);
    btn.addEventListener("pointercancel", off);
  };
  holdBtn(leftBtn, -1);
  holdBtn(rightBtn, 1);

  // drag on stage to steer
  let dragging = false;
  const stageToX = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (!state.running) return;
    dragging = true;
    state.player.x = stageToX(e.clientX);
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging && state.running) state.player.x = stageToX(e.clientX);
  });
  const stopDrag = () => { dragging = false; };
  canvas.addEventListener("pointerup", stopDrag);
  canvas.addEventListener("pointercancel", stopDrag);

  startBtn.addEventListener("click", start);

  // initial idle frame
  render();
})();
