/* Afterlight Arcade — self-contained arcade logic.
   No network, no storage requirements; everything runs in-page. */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Deterministic pseudo-random (mulberry32) ---------- */
  const makeRng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* ---------- Content: worlds ---------- */
  const WORLDS = [
    { name: "Afterglow Run", tag: "Endless / Reflex", blurb: "The house game. Thread neon gates until the sky turns gold.", players: "2.4k", c1: "#24e0ff", c2: "#ff2e97", motif: "run" },
    { name: "Tidewreck", tag: "Puzzle / Physics", blurb: "Sink derelict ships by bending the current, one wave at a time.", players: "980", c1: "#3affc8", c2: "#1e7bff", motif: "wave" },
    { name: "Pale Circuit", tag: "Roguelite", blurb: "Rewire a dying city grid before the last streetlight blinks out.", players: "1.7k", c1: "#8b5cff", c2: "#ff2e97", motif: "grid" },
    { name: "Moth & Marrow", tag: "Atmosphere / Metroid", blurb: "Explore a lantern-lit cavern that only maps itself as you glow.", players: "640", c1: "#ffb84d", c2: "#ff5b7a", motif: "orb" },
    { name: "Static Bloom", tag: "Rhythm", blurb: "Grow impossible flowers on the downbeat of a broken radio.", players: "1.1k", c1: "#ff2e97", c2: "#ffb84d", motif: "bloom" },
    { name: "Coldstart", tag: "Strategy", blurb: "Boot a frozen colony with three watts and a bad attitude.", players: "520", c1: "#24e0ff", c2: "#8b5cff", motif: "grid" },
    { name: "Duskrunners", tag: "Racing", blurb: "Drift the overpass at 3am; headlights are optional, nerve is not.", players: "1.9k", c1: "#ff5b7a", c2: "#8b5cff", motif: "run" },
    { name: "Salt & Signal", tag: "Narrative", blurb: "Decode love letters bounced off a lonely coastal beacon.", players: "410", c1: "#3affc8", c2: "#ffb84d", motif: "wave" },
    { name: "Neon Tenders", tag: "Cozy / Sim", blurb: "Run the last all-night noodle cart on the arcade strip.", players: "1.3k", c1: "#ffb84d", c2: "#24e0ff", motif: "bloom" },
    { name: "Voidvault", tag: "Shooter", blurb: "Bank every bullet off gravity wells to crack the vault open.", players: "870", c1: "#8b5cff", c2: "#3affc8", motif: "orb" },
    { name: "Papercut Sky", tag: "Platformer", blurb: "Fold the horizon into stairs and climb toward a paper sun.", players: "700", c1: "#ff2e97", c2: "#24e0ff", motif: "grid" },
    { name: "Last Quarter", tag: "Idle / Clicker", blurb: "One coin left. Make the machine believe in you a little longer.", players: "2.1k", c1: "#24e0ff", c2: "#ff5b7a", motif: "orb" },
  ];

  const thumbSvg = (w) => {
    const motifs = {
      run: `<path d='M0 120 Q80 70 160 120 T320 120' fill='none' stroke='${w.c1}' stroke-width='3' opacity='.9'/><path d='M0 145 Q80 95 160 145 T320 145' fill='none' stroke='${w.c2}' stroke-width='3' opacity='.7'/><rect x='150' y='96' width='20' height='20' rx='4' fill='#fff'/>`,
      wave: `<path d='M0 130 Q40 100 80 130 T160 130 T240 130 T320 130' fill='none' stroke='${w.c1}' stroke-width='4'/><path d='M0 150 Q40 120 80 150 T160 150 T240 150 T320 150' fill='none' stroke='${w.c2}' stroke-width='4' opacity='.7'/>`,
      grid: `<g opacity='.85'>${Array.from({ length: 7 }, (_, i) => `<line x1='${20 + i * 46}' y1='30' x2='${20 + i * 46}' y2='170' stroke='${w.c1}' stroke-width='1.4'/>`).join("")}${Array.from({ length: 4 }, (_, i) => `<line x1='10' y1='${40 + i * 40}' x2='310' y2='${40 + i * 40}' stroke='${w.c2}' stroke-width='1.4'/>`).join("")}</g>`,
      orb: `<circle cx='160' cy='100' r='42' fill='none' stroke='${w.c1}' stroke-width='3'/><circle cx='160' cy='100' r='22' fill='${w.c2}' opacity='.85'/><circle cx='160' cy='100' r='64' fill='none' stroke='${w.c2}' stroke-width='1.5' stroke-dasharray='5 7'/>`,
      bloom: `<g transform='translate(160 105)'>${Array.from({ length: 6 }, (_, i) => `<ellipse cx='0' cy='-34' rx='12' ry='30' fill='${i % 2 ? w.c1 : w.c2}' opacity='.8' transform='rotate(${i * 60})'/>`).join("")}<circle r='12' fill='#fff'/></g>`,
    };
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0c0722'/><stop offset='1' stop-color='#160a33'/></linearGradient></defs><rect width='320' height='200' fill='url(#g)'/>${motifs[w.motif] || motifs.orb}</svg>`,
    )}`;
  };

  const grid = document.getElementById("world-grid");
  if (grid) {
    grid.innerHTML = WORLDS.map(
      (w) => `<li class="world-card">
        <img class="world-thumb" src="${thumbSvg(w)}" alt="${w.name} cabinet art" loading="lazy" width="320" height="200" />
        <div class="world-info">
          <span class="world-tag">${w.tag}</span>
          <h3>${w.name}</h3>
          <p>${w.blurb}</p>
          <div class="world-foot"><span class="pill">${w.players} online</span><span>▸ enter</span></div>
        </div>
      </li>`,
    ).join("");
  }

  /* ---------- Countdown to sunrise / weekly reset ---------- */
  const two = (n) => String(n).padStart(2, "0");
  const nextSunday = () => {
    const now = new Date();
    const d = new Date(now);
    const days = (7 - now.getDay()) % 7;
    d.setDate(now.getDate() + days);
    d.setHours(6, 0, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 7);
    return d;
  };
  const resetTarget = nextSunday();
  const elChallenge = document.getElementById("challenge-countdown");
  const elReset = document.getElementById("stat-reset");
  const tickCountdown = () => {
    const ms = Math.max(0, resetTarget - new Date());
    const s = Math.floor(ms / 1000);
    const dd = Math.floor(s / 86400);
    const hh = Math.floor((s % 86400) / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (elChallenge) elChallenge.textContent = `${dd}d ${two(hh)}:${two(mm)}:${two(ss)}`;
    if (elReset) elReset.textContent = `${dd}d ${two(hh)}h`;
  };
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Leaderboard (living, simulated locally) ---------- */
  const HANDLES = [
    "vaporwren", "kitsune09", "m0thlight", "grid_ghost", "salt_signal", "duskdrift",
    "paper_sun", "neon_tender", "coldstart", "voidbank", "lastquarter", "tidewreck",
    "static_bloom", "afterglow_", "midnite_dev", "pixel_pilot", "arc_angel", "lumen_",
    "byte_owl", "glowfish",
  ];
  const boardBody = document.getElementById("board-body");
  const boardNote = document.getElementById("board-note");
  const statRuns = document.getElementById("stat-runs");

  const seed = (() => {
    const t = new Date();
    return t.getFullYear() * 1000 + t.getMonth() * 40 + t.getDate();
  })();
  const rng = makeRng(seed);

  let entries = HANDLES.slice()
    .map((h) => ({
      handle: h,
      score: 400 + Math.floor(rng() * 1400),
      world: WORLDS[Math.floor(rng() * WORLDS.length)].name,
      gold: rng() < 0.18,
      you: false,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  let youBest = 0;
  let runsTonight = 1200 + Math.floor(rng() * 400);
  if (statRuns) statRuns.textContent = runsTonight.toLocaleString();

  const renderBoard = (flashHandle) => {
    if (!boardBody) return;
    entries.sort((a, b) => b.score - a.score);
    boardBody.innerHTML = entries
      .slice(0, 10)
      .map((e, i) => {
        const cls = [e.you ? "you" : "", e.gold ? "gold" : "", e.handle === flashHandle ? "flash" : ""]
          .filter(Boolean)
          .join(" ");
        return `<tr class="${cls}"><td class="rank">${i + 1}</td><td>@${e.handle}</td><td>${e.world}</td><td class="num">${e.score.toLocaleString()}</td></tr>`;
      })
      .join("");
  };
  renderBoard();

  // Simulated live activity: bumps an existing rider or adds a fresh run.
  const pulse = () => {
    if (rng() < 0.55) {
      const idx = Math.floor(rng() * entries.length);
      entries[idx].score += Math.floor(rng() * 40) + 5;
      renderBoard(entries[idx].handle);
    } else {
      const handle = HANDLES[Math.floor(rng() * HANDLES.length)];
      const existing = entries.find((e) => e.handle === handle && !e.you);
      const score = 500 + Math.floor(rng() * 1300);
      if (existing) {
        existing.score = Math.max(existing.score, score);
      } else {
        entries.push({ handle, score, world: WORLDS[Math.floor(rng() * WORLDS.length)].name, gold: false, you: false });
        entries.sort((a, b) => b.score - a.score);
        entries = entries.slice(0, 12);
      }
      renderBoard(handle);
    }
    runsTonight += 1;
    if (statRuns) statRuns.textContent = runsTonight.toLocaleString();
    if (boardNote) boardNote.textContent = `Live · ${runsTonight.toLocaleString()} runs logged tonight`;
  };
  if (boardNote) boardNote.textContent = `Live · ${runsTonight.toLocaleString()} runs logged tonight`;
  setInterval(pulse, 2600);

  const postScore = (score) => {
    youBest = Math.max(youBest, score);
    let me = entries.find((e) => e.you);
    if (me) {
      me.score = Math.max(me.score, score);
    } else {
      me = { handle: "you_afterlight", score, world: "Afterglow Run", gold: false, you: true };
      entries.push(me);
    }
    entries.sort((a, b) => b.score - a.score);
    entries = entries.slice(0, 12);
    // keep "you" visible even if outside top 10
    if (!entries.slice(0, 10).some((e) => e.you)) {
      entries.splice(9, 1, me);
    }
    renderBoard(me.handle);
  };

  /* ---------- Afterglow Run — the playable game ---------- */
  const canvas = document.getElementById("game");
  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("start-btn");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const kicker = document.getElementById("overlay-kicker");
  const titleEl = document.getElementById("overlay-title");
  const bodyEl = document.getElementById("overlay-body");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const state = {
      running: false,
      score: 0,
      best: 0,
      player: { x: W / 2, y: H - 70, r: 12 },
      target: W / 2,
      gates: [],
      motes: [],
      speed: 2.4,
      spawn: 0,
      t: 0,
      shake: 0,
      raf: 0,
      last: 0,
    };

    // starfield motes for depth
    const initMotes = () => {
      state.motes = Array.from({ length: 28 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: 0.4 + Math.random() * 1.6,
      }));
    };
    initMotes();

    const reset = () => {
      state.score = 0;
      state.player.x = W / 2;
      state.target = W / 2;
      state.gates = [];
      state.speed = 2.4;
      state.spawn = 0;
      state.t = 0;
      state.shake = 0;
    };

    const spawnGate = () => {
      const gap = 96 - Math.min(38, state.score / 40);
      const cx = 40 + Math.random() * (W - 80);
      state.gates.push({ y: -30, cx, gap: Math.max(58, gap), passed: false });
    };

    const setOverlay = (stateName, k, t, b, btn) => {
      overlay.dataset.state = stateName;
      if (k) kicker.textContent = k;
      if (t) titleEl.textContent = t;
      if (b) bodyEl.textContent = b;
      if (btn) startBtn.textContent = btn;
    };

    const end = () => {
      state.running = false;
      const final = Math.floor(state.score);
      state.best = Math.max(state.best, final);
      bestEl.textContent = state.best;
      postScore(final);
      const clean = final >= 900;
      setOverlay(
        "over",
        clean ? "Clean run — challenge cleared!" : "Run over",
        clean ? "Golden!" : "Afterglow Run",
        clean
          ? `You reached ${final} and threaded every gate. Your handle glows gold on the board.`
          : `You scored ${final}. The horizon's still dark — one more run?`,
        "Run it back",
      );
    };

    const start = () => {
      reset();
      state.running = true;
      setOverlay("playing");
      state.last = performance.now();
      if (!state.raf) loop(state.last);
    };

    const drawStatic = () => {
      // one paint for reduced-motion friendliness / idle
      ctx.fillStyle = "#05030f";
      ctx.fillRect(0, 0, W, H);
      drawMotes();
      drawPlayer();
    };

    const drawMotes = () => {
      for (const m of state.motes) {
        ctx.globalAlpha = 0.25 + m.z * 0.3;
        ctx.fillStyle = m.z > 1.1 ? "#8b5cff" : "#24e0ff";
        ctx.fillRect(m.x, m.y, 2, 2);
      }
      ctx.globalAlpha = 1;
    };

    const drawPlayer = () => {
      const p = state.player;
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#24e0ff";
      const g = ctx.createLinearGradient(p.x - p.r, p.y, p.x + p.r, p.y);
      g.addColorStop(0, "#24e0ff");
      g.addColorStop(1, "#ff2e97");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.r);
      ctx.lineTo(p.x + p.r, p.y + p.r);
      ctx.lineTo(p.x, p.y + p.r * 0.5);
      ctx.lineTo(p.x - p.r, p.y + p.r);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawGate = (gate) => {
      const half = gate.gap / 2;
      ctx.lineWidth = 4;
      ctx.strokeStyle = gate.passed ? "rgba(58,255,200,.6)" : "#ff2e97";
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;
      // left wall
      ctx.beginPath();
      ctx.moveTo(0, gate.y);
      ctx.lineTo(gate.cx - half, gate.y);
      ctx.stroke();
      // right wall
      ctx.beginPath();
      ctx.moveTo(gate.cx + half, gate.y);
      ctx.lineTo(W, gate.y);
      ctx.stroke();
      // gate posts
      ctx.fillStyle = "#ffb84d";
      ctx.fillRect(gate.cx - half - 3, gate.y - 4, 6, 8);
      ctx.fillRect(gate.cx + half - 3, gate.y - 4, 6, 8);
      ctx.shadowBlur = 0;
    };

    const step = (dt) => {
      state.t += dt;
      state.score += dt * 0.06 * (state.speed / 2.4);
      state.speed = 2.4 + state.score / 220;
      scoreEl.textContent = Math.floor(state.score);

      // player easing toward target
      const p = state.player;
      p.x += (state.target - p.x) * Math.min(1, dt * 0.02);
      p.x = Math.max(p.r, Math.min(W - p.r, p.x));

      // motes
      for (const m of state.motes) {
        m.y += m.z * state.speed * 0.5 * dt * 0.06;
        if (m.y > H) {
          m.y = -4;
          m.x = Math.random() * W;
        }
      }

      // gates
      state.spawn -= dt;
      if (state.spawn <= 0) {
        spawnGate();
        state.spawn = Math.max(520, 900 - state.score) ;
      }
      const advance = state.speed * dt * 0.06;
      for (const gate of state.gates) {
        gate.y += advance;
        if (!gate.passed && gate.y > p.y) {
          gate.passed = true;
        }
        // collision when gate crosses player band
        if (Math.abs(gate.y - p.y) < 8) {
          const half = gate.gap / 2;
          if (p.x < gate.cx - half + p.r || p.x > gate.cx + half - p.r) {
            state.shake = 8;
            end();
            return;
          }
        }
      }
      state.gates = state.gates.filter((g) => g.y < H + 20);
    };

    const render = () => {
      ctx.save();
      if (state.shake > 0) {
        ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
        state.shake *= 0.85;
      }
      ctx.fillStyle = "#05030f";
      ctx.fillRect(-10, -10, W + 20, H + 20);
      // horizon glow
      const hg = ctx.createLinearGradient(0, 0, 0, H);
      hg.addColorStop(0, "rgba(139,92,255,.18)");
      hg.addColorStop(1, "rgba(255,46,151,.05)");
      ctx.fillStyle = hg;
      ctx.fillRect(-10, -10, W + 20, H + 20);
      drawMotes();
      for (const gate of state.gates) drawGate(gate);
      drawPlayer();
      ctx.restore();
    };

    const loop = (now) => {
      state.raf = 0;
      let dt = now - state.last;
      state.last = now;
      if (dt > 60) dt = 60; // clamp after tab switches
      if (state.running) {
        step(dt);
      }
      render();
      if (state.running || state.shake > 0.5) {
        state.raf = requestAnimationFrame(loop);
      }
    };

    // Idle first paint
    drawStatic();

    /* ----- Controls ----- */
    let keyLeft = false;
    let keyRight = false;
    const moveStep = () => {
      if (keyLeft) state.target -= 26;
      if (keyRight) state.target += 26;
      state.target = Math.max(state.player.r, Math.min(W - state.player.r, state.target));
    };

    window.addEventListener("keydown", (e) => {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keyLeft = true; if (state.running) { moveStep(); e.preventDefault(); } }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keyRight = true; if (state.running) { moveStep(); e.preventDefault(); } }
      else if ((e.key === " " || e.key === "Enter") && !state.running && document.activeElement === startBtn) { /* button handles */ }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyLeft = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyRight = false;
    });

    // Continuous key steering while held
    setInterval(() => { if (state.running && (keyLeft || keyRight)) moveStep(); }, 45);

    startBtn.addEventListener("click", start);

    const btnL = document.getElementById("btn-left");
    const btnR = document.getElementById("btn-right");
    const hold = (btn, dir) => {
      let iv = 0;
      const go = () => { state.target = Math.max(state.player.r, Math.min(W - state.player.r, state.target + dir * 26)); };
      const startHold = (e) => { e.preventDefault(); go(); iv = setInterval(go, 60); };
      const stopHold = () => { clearInterval(iv); iv = 0; };
      btn.addEventListener("pointerdown", startHold);
      btn.addEventListener("pointerup", stopHold);
      btn.addEventListener("pointerleave", stopHold);
      btn.addEventListener("pointercancel", stopHold);
    };
    if (btnL) hold(btnL, -1);
    if (btnR) hold(btnR, 1);

    // Canvas pointer: tap sides / drag to steer
    let dragging = false;
    const canvasX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };
    canvas.addEventListener("pointerdown", (e) => {
      if (!state.running) return;
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      state.target = canvasX(e.clientX);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!state.running || !dragging) return;
      state.target = canvasX(e.clientX);
    });
    const dragEnd = () => { dragging = false; };
    canvas.addEventListener("pointerup", dragEnd);
    canvas.addEventListener("pointercancel", dragEnd);
  }
})();
