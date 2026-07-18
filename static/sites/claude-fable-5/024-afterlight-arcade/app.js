(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- weekly challenge countdown ---------- */
  const countdown = document.getElementById("countdown");
  const nextMondayUtc = () => {
    const now = new Date();
    const day = now.getUTCDay();
    const daysAhead = ((8 - day) % 7) || 7;
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysAhead);
  };
  let deadline = nextMondayUtc();
  const pad = (n) => String(n).padStart(2, "0");
  const renderCountdown = () => {
    let ms = deadline - Date.now();
    if (ms <= 0) {
      deadline = nextMondayUtc();
      ms = deadline - Date.now();
    }
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    countdown.textContent = `${d}d ${pad(Math.floor(s / 3600) % 24)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  renderCountdown();
  setInterval(renderCountdown, 1000);

  /* ---------- hero stats gentle drift ---------- */
  const runsEl = document.getElementById("runs-tonight");
  const onlineEl = document.getElementById("players-online");
  let runs = 48112;
  let online = 6204;
  const fmt = (n) => n.toLocaleString("en-US");
  setInterval(() => {
    runs += 1 + Math.floor(Math.random() * 4);
    online = Math.max(5200, online + Math.floor(Math.random() * 7) - 3);
    runsEl.textContent = fmt(runs);
    onlineEl.textContent = fmt(online);
  }, 4000);

  /* ---------- leaderboard tabs + live ticks ---------- */
  const boards = {
    vector: {
      name: "Vector Tide",
      runsTonight: 8921,
      rows: [
        ["NEB", 1204880], ["VXA", 1187410], ["SOL", 1102995], ["RIN", 1066120], ["OKO", 1020455],
      ],
    },
    necro: {
      name: "Neon Necropolis",
      runsTonight: 7310,
      rows: [
        ["KYO", 987340], ["ASH", 954010], ["LUX", 921875], ["MOTH", 899430], ["ZED", 861200],
      ],
    },
    circuit: {
      name: "Sunset Circuit",
      runsTonight: 10204,
      rows: [
        ["RUE", 1118205], ["JET", 1094880], ["NOVA", 1051340], ["PIX", 1008765], ["DUSK", 976540],
      ],
    },
    garden: {
      name: "Garden.exe",
      runsTonight: 4188,
      rows: [
        ["MOSS", 640010], ["FERN", 612385], ["ROOT", 588740], ["IVY", 561220], ["SEED", 540955],
      ],
    },
  };
  const handles = ["ARC", "GLOW", "HEX", "NYX", "PULS", "VEIL", "ECHO", "WISP", "BYTE", "OWL"];

  const tabs = Array.from(document.querySelectorAll('.board-tabs [role="tab"]'));
  const panel = document.getElementById("panel-board");
  const body = document.getElementById("board-body");
  const note = document.getElementById("board-note");
  let current = "vector";

  const minutesAgo = () => {
    const m = Math.floor(Math.random() * 55) + 1;
    return m < 60 ? `${m}m ago` : "1h ago";
  };

  const renderBoard = (key, freshRank) => {
    const board = boards[key];
    body.textContent = "";
    board.rows.forEach(([player, score], index) => {
      const tr = document.createElement("tr");
      if (index === freshRank && !reducedMotion.matches) tr.className = "fresh";
      const cells = [
        String(index + 1),
        player,
        fmt(score),
        index === freshRank ? "just now" : minutesAgo(),
      ];
      cells.forEach((text, cellIndex) => {
        const td = document.createElement("td");
        td.textContent = text;
        if (cellIndex === 3) td.className = "col-when";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    note.textContent = `${board.name} — ${fmt(board.runsTonight)} runs logged tonight.`;
  };

  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    current = tab.dataset.board;
    renderBoard(current);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      let target = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") target = tabs[(index + 1) % tabs.length];
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === "Home") target = tabs[0];
      else if (event.key === "End") target = tabs[tabs.length - 1];
      if (target) {
        event.preventDefault();
        target.focus();
        selectTab(target);
      }
    });
  });
  renderBoard(current);

  // a new score lands somewhere every few seconds to keep the board "living"
  setInterval(() => {
    const keys = Object.keys(boards);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const board = boards[key];
    const rank = 1 + Math.floor(Math.random() * 4);
    const above = board.rows[rank - 1][1];
    const below = rank < board.rows.length ? board.rows[rank][1] : above - 60000;
    const score = below + Math.floor(Math.random() * Math.max(1, above - below - 1)) + 1;
    const player = handles[Math.floor(Math.random() * handles.length)];
    board.rows.splice(rank, 0, [player, score]);
    board.rows.length = 5;
    board.runsTonight += 1 + Math.floor(Math.random() * 3);
    if (key === current) renderBoard(current, rank);
  }, 6000);

  /* ---------- Afterglow pattern mini-game ---------- */
  const pads = Array.from(document.querySelectorAll(".pad"));
  const statusEl = document.getElementById("mini-status");
  const streakEl = document.getElementById("mini-streak");
  const bestEl = document.getElementById("mini-best");
  const startBtn = document.getElementById("mini-start");

  let sequence = [];
  let inputIndex = 0;
  let accepting = false;
  let playing = false;
  let best = 0;
  const timers = new Set();

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };

  const flash = (padIndex, duration) => {
    const padEl = pads[padIndex];
    padEl.classList.add("lit");
    later(() => padEl.classList.remove("lit"), duration);
  };

  const playSequence = () => {
    accepting = false;
    statusEl.textContent = "Watch the pattern…";
    const step = reducedMotion.matches ? 700 : 520;
    sequence.forEach((padIndex, i) => {
      later(() => flash(padIndex, step * 0.6), 500 + i * step);
    });
    later(() => {
      accepting = true;
      inputIndex = 0;
      statusEl.textContent = "Your turn — echo it back.";
    }, 500 + sequence.length * step);
  };

  const extendAndPlay = () => {
    sequence.push(Math.floor(Math.random() * 4));
    playSequence();
  };

  const gameOver = () => {
    accepting = false;
    playing = false;
    statusEl.textContent = `Game over at streak ${sequence.length - 1}. Press start to run it back.`;
    startBtn.textContent = "Run it back";
    pads.forEach((p) => p.classList.add("lit"));
    later(() => pads.forEach((p) => p.classList.remove("lit")), 350);
  };

  const handlePad = (padIndex) => {
    if (!accepting) {
      flash(padIndex, 160);
      return;
    }
    flash(padIndex, 200);
    if (padIndex !== sequence[inputIndex]) {
      gameOver();
      return;
    }
    inputIndex += 1;
    if (inputIndex === sequence.length) {
      const streak = sequence.length;
      streakEl.textContent = String(streak);
      if (streak > best) {
        best = streak;
        bestEl.textContent = String(best);
      }
      accepting = false;
      statusEl.textContent = "Locked in. Next round…";
      later(extendAndPlay, 700);
    }
  };

  pads.forEach((padEl) => {
    padEl.addEventListener("click", () => handlePad(Number(padEl.dataset.pad)));
  });

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.key >= "1" && event.key <= "4") handlePad(Number(event.key) - 1);
  });

  startBtn.addEventListener("click", () => {
    if (playing) return;
    clearTimers();
    playing = true;
    sequence = [];
    inputIndex = 0;
    streakEl.textContent = "0";
    startBtn.textContent = "Running…";
    later(() => {
      startBtn.textContent = "Restart";
      playing = false;
    }, 1200);
    extendAndPlay();
  });
})();
