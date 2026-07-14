(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navMenu.classList.toggle("is-open", !open);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
      }
    });
  }

  /* ---------- Lab tabs ---------- */
  const tabs = Array.from(document.querySelectorAll(".lab-tab"));
  const panels = Array.from(document.querySelectorAll(".lab-panel"));

  function activateLab(name, { focusTab = false } = {}) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.lab === name;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.dataset.lab === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    if (name === "orbit") orbit.ensureRunning();
    if (name === "sort") sortViz.draw();
    if (name === "waves") waves.draw();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateLab(tab.dataset.lab));

    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activateLab(next.dataset.lab, { focusTab: true });
      }
    });
  });

  /* ---------- Helpers ---------- */
  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { w, h, dpr, cssW: rect.width, cssH: rect.height };
  }

  function bindRange(id, outId, fmt = (v) => Number(v).toFixed(1)) {
    const input = document.getElementById(id);
    const out = document.getElementById(outId);
    if (!input) return null;
    const sync = () => {
      if (out) out.value = fmt(input.value);
    };
    input.addEventListener("input", sync);
    sync();
    return input;
  }

  /* ---------- Hero constellation ---------- */
  const heroCanvas = document.getElementById("heroCanvas");
  const hero = {
    nodes: [],
    t: 0,
    raf: 0,
    init() {
      if (!heroCanvas) return;
      const count = 18;
      this.nodes = Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return {
          baseA: a,
          r: 0.22 + (i % 5) * 0.07,
          size: 2.5 + (i % 4),
          speed: 0.15 + (i % 6) * 0.04,
          phase: i * 0.7,
          hue: i % 2 === 0 ? "teal" : "indigo",
        };
      });
      this.loop();
      window.addEventListener("resize", () => this.draw());
    },
    loop() {
      this.draw();
      if (!reduceMotion) {
        this.t += 0.008;
        this.raf = requestAnimationFrame(() => this.loop());
      }
    },
    draw() {
      const { w, h } = fitCanvas(heroCanvas);
      const ctx = heroCanvas.getContext("2d");
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);

      ctx.clearRect(0, 0, w, h);

      // soft rings
      for (let i = 0; i < 4; i++) {
        const r = scale * (0.18 + i * 0.1);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.08 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.12);
      coreGrad.addColorStop(0, "rgba(94, 234, 212, 0.9)");
      coreGrad.addColorStop(0.45, "rgba(129, 140, 248, 0.55)");
      coreGrad.addColorStop(1, "rgba(129, 140, 248, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.12, 0, Math.PI * 2);
      ctx.fill();

      const points = this.nodes.map((n) => {
        const a = n.baseA + this.t * n.speed;
        const wobble = Math.sin(this.t * 1.4 + n.phase) * 0.03;
        const r = scale * (n.r + wobble);
        return {
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          size: n.size * (scale / 420),
          hue: n.hue,
        };
      });

      // links
      ctx.lineWidth = Math.max(1, scale / 480);
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < scale * 0.28) {
            const alpha = 0.22 * (1 - dist / (scale * 0.28));
            ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === "teal" ? "rgba(94, 234, 212, 0.95)" : "rgba(167, 139, 250, 0.95)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === "teal" ? "rgba(94, 234, 212, 0.15)" : "rgba(167, 139, 250, 0.15)";
        ctx.fill();
      });
    },
  };

  /* ---------- Wave lab ---------- */
  const waveCanvas = document.getElementById("waveCanvas");
  const waves = {
    t: 0,
    raf: 0,
    active: true,
    init() {
      if (!waveCanvas) return;
      this.freqA = bindRange("freqA", "freqAOut");
      this.freqB = bindRange("freqB", "freqBOut");
      this.ampA = bindRange("ampA", "ampAOut");
      this.ampB = bindRange("ampB", "ampBOut");
      this.showA = document.getElementById("showA");
      this.showB = document.getElementById("showB");
      this.showSum = document.getElementById("showSum");
      this.insight = document.getElementById("waveInsight");

      ["freqA", "freqB", "ampA", "ampB", "showA", "showB", "showSum"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => this.updateInsight());
      });

      this.updateInsight();
      this.loop();
      window.addEventListener("resize", () => this.draw());
    },
    updateInsight() {
      if (!this.insight) return;
      const fa = Number(this.freqA?.value || 2);
      const fb = Number(this.freqB?.value || 3);
      const diff = Math.abs(fa - fb);
      if (diff < 0.05) {
        this.insight.textContent =
          "Frequencies match — crests reinforce each other. This is constructive interference.";
      } else if (diff < 0.5) {
        this.insight.textContent =
          "Close frequencies create a slow beat: the envelope swells and fades as the waves drift in and out of phase.";
      } else {
        this.insight.textContent =
          "Different frequencies weave a complex sum. Toggle layers off to isolate each wave’s shape.";
      }
    },
    loop() {
      this.draw();
      if (!reduceMotion) {
        this.t += 0.04;
        this.raf = requestAnimationFrame(() => this.loop());
      } else {
        this.draw();
      }
    },
    draw() {
      if (!waveCanvas || waveCanvas.offsetParent === null && !document.getElementById("panel-waves")?.classList.contains("is-active")) {
        // still draw when active panel
      }
      const panel = document.getElementById("panel-waves");
      if (panel && panel.hidden) return;

      const { w, h } = fitCanvas(waveCanvas);
      const ctx = waveCanvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
      ctx.lineWidth = 1;
      const mid = h / 2;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
      for (let x = 0; x < w; x += w / 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const fa = Number(this.freqA?.value || 2);
      const fb = Number(this.freqB?.value || 3);
      const aa = Number(this.ampA?.value || 1);
      const ab = Number(this.ampB?.value || 0.8);
      const ampScale = h * 0.18;
      const samples = Math.floor(w);

      const sample = (freq, amp, phase, x) => {
        const nx = x / w;
        return Math.sin(nx * Math.PI * 2 * freq * 2 + this.t * freq + phase) * amp * ampScale;
      };

      const drawWave = (color, getY, width = 2) => {
        ctx.beginPath();
        for (let x = 0; x <= samples; x++) {
          const y = mid + getY(x);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = "round";
        ctx.stroke();
      };

      if (this.showA?.checked) {
        drawWave("rgba(94, 234, 212, 0.7)", (x) => sample(fa, aa, 0, x), 1.75);
      }
      if (this.showB?.checked) {
        drawWave("rgba(167, 139, 250, 0.7)", (x) => sample(fb, ab, 0.8, x), 1.75);
      }
      if (this.showSum?.checked !== false) {
        drawWave(
          "rgba(251, 191, 36, 0.95)",
          (x) => sample(fa, aa, 0, x) + sample(fb, ab, 0.8, x),
          2.75
        );
      }

      // legend
      ctx.font = `${Math.max(11, w * 0.018)}px system-ui, sans-serif`;
      const legend = [
        { c: "rgba(94, 234, 212, 0.9)", t: "A" },
        { c: "rgba(167, 139, 250, 0.9)", t: "B" },
        { c: "rgba(251, 191, 36, 0.95)", t: "Sum" },
      ];
      legend.forEach((item, i) => {
        const x = w * 0.04 + i * w * 0.12;
        const y = h * 0.1;
        ctx.fillStyle = item.c;
        ctx.fillRect(x, y - 4, 12, 4);
        ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
        ctx.fillText(item.t, x + 18, y + 2);
      });
    },
  };

  /* ---------- Orbit lab ---------- */
  const orbitCanvas = document.getElementById("orbitCanvas");
  const orbit = {
    bodies: [],
    trail: true,
    trails: [],
    aim: { x: 1, y: 0 },
    dragging: false,
    running: false,
    raf: 0,
    init() {
      if (!orbitCanvas) return;
      this.grav = bindRange("grav", "gravOut");
      this.speed = bindRange("speed", "speedOut");
      this.insight = document.getElementById("orbitInsight");

      document.getElementById("orbitLaunch")?.addEventListener("click", () => this.launch());
      document.getElementById("orbitReset")?.addEventListener("click", () => this.reset());
      const trailBtn = document.getElementById("orbitTrail");
      trailBtn?.addEventListener("click", () => {
        this.trail = !this.trail;
        trailBtn.setAttribute("aria-pressed", String(this.trail));
        trailBtn.textContent = this.trail ? "Trail on" : "Trail off";
        if (!this.trail) this.trails = [];
      });

      const pointerPos = (e) => {
        const rect = orbitCanvas.getBoundingClientRect();
        const { w, h } = fitCanvas(orbitCanvas);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: ((clientX - rect.left) / rect.width) * w,
          y: ((clientY - rect.top) / rect.height) * h,
          w,
          h,
        };
      };

      const setAim = (e) => {
        const p = pointerPos(e);
        const cx = p.w * 0.28;
        const cy = p.h * 0.5;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        this.aim.x = dx / len;
        this.aim.y = dy / len;
        this.draw();
      };

      orbitCanvas.addEventListener("pointerdown", (e) => {
        this.dragging = true;
        orbitCanvas.setPointerCapture(e.pointerId);
        setAim(e);
      });
      orbitCanvas.addEventListener("pointermove", (e) => {
        if (this.dragging) setAim(e);
      });
      orbitCanvas.addEventListener("pointerup", () => {
        this.dragging = false;
      });
      orbitCanvas.addEventListener("pointercancel", () => {
        this.dragging = false;
      });

      this.reset();
      window.addEventListener("resize", () => this.draw());
    },
    ensureRunning() {
      if (!this.running) {
        this.running = true;
        this.loop();
      }
    },
    reset() {
      this.bodies = [];
      this.trails = [];
      this.aim = { x: 0.15, y: -0.98 };
      this.launch();
      this.ensureRunning();
    },
    launch() {
      const { w, h } = fitCanvas(orbitCanvas);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const startX = w * 0.28;
      const startY = h * 0.5;
      const speedMul = Number(this.speed?.value || 1);
      const base = Math.min(w, h) * 0.0042 * speedMul;
      this.bodies = [
        {
          x: startX,
          y: startY,
          vx: this.aim.x * base * 55,
          vy: this.aim.y * base * 55,
          r: Math.max(4, Math.min(w, h) * 0.012),
        },
      ];
      this.trails = [[]];
      this.star = { x: cx, y: cy, mass: 1 };
      if (this.insight) {
        this.insight.textContent =
          "Watch the path. Circular-ish loops mean balanced speed. Spirals mean gravity is winning.";
      }
    },
    step() {
      if (!this.bodies.length) return;
      const g = Number(this.grav?.value || 1);
      const { w, h } = fitCanvas(orbitCanvas);
      const starMass = Math.min(w, h) * 0.55 * g;

      this.bodies.forEach((b, i) => {
        const dx = this.star.x - b.x;
        const dy = this.star.y - b.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) + 0.001;
        const force = starMass / distSq;
        b.vx += (force * dx) / dist;
        b.vy += (force * dy) / dist;
        b.x += b.vx;
        b.y += b.vy;

        if (this.trail) {
          if (!this.trails[i]) this.trails[i] = [];
          this.trails[i].push({ x: b.x, y: b.y });
          if (this.trails[i].length > 180) this.trails[i].shift();
        }

        // soft wrap / reset if escaped far
        if (dist > Math.max(w, h) * 1.4 || dist < b.r + Math.min(w, h) * 0.035) {
          if (dist < b.r + Math.min(w, h) * 0.035 && this.insight) {
            this.insight.textContent =
              "Impact! Gravity pulled the moon into the star. Raise launch speed or lower gravity.";
          } else if (dist > Math.max(w, h) * 1.4 && this.insight) {
            this.insight.textContent =
              "Escape trajectory — speed outran gravity. Try a gentler launch or more gravity.";
          }
        }
      });
    },
    loop() {
      const panel = document.getElementById("panel-orbit");
      if (panel && !panel.hidden) {
        if (!reduceMotion) this.step();
        this.draw();
      }
      this.raf = requestAnimationFrame(() => this.loop());
    },
    draw() {
      if (!orbitCanvas) return;
      const { w, h } = fitCanvas(orbitCanvas);
      const ctx = orbitCanvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      // star field dots
      ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
      for (let i = 0; i < 40; i++) {
        const x = ((i * 97) % w);
        const y = ((i * 53) % h);
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      const cx = this.star?.x ?? w / 2;
      const cy = this.star?.y ?? h / 2;
      const starR = Math.min(w, h) * 0.045;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, starR * 3.5);
      glow.addColorStop(0, "rgba(251, 191, 36, 0.85)");
      glow.addColorStop(0.35, "rgba(251, 146, 60, 0.35)");
      glow.addColorStop(1, "rgba(251, 146, 60, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, starR * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx, cy, starR, 0, Math.PI * 2);
      ctx.fill();

      // aim line from launch pad
      const padX = w * 0.28;
      const padY = h * 0.5;
      ctx.strokeStyle = "rgba(94, 234, 212, 0.55)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(padX, padY);
      ctx.lineTo(padX + this.aim.x * Math.min(w, h) * 0.18, padY + this.aim.y * Math.min(w, h) * 0.18);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(94, 234, 212, 0.35)";
      ctx.beginPath();
      ctx.arc(padX, padY, 5, 0, Math.PI * 2);
      ctx.fill();

      // trails
      this.trails.forEach((trail) => {
        if (!trail || trail.length < 2) return;
        ctx.beginPath();
        trail.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "rgba(129, 140, 248, 0.55)";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      this.bodies.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = "#a5b4fc";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(165, 180, 252, 0.2)";
        ctx.fill();
      });

      ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
      ctx.font = `${Math.max(11, w * 0.018)}px system-ui, sans-serif`;
      ctx.fillText("Drag to aim · Launch to fly", w * 0.04, h * 0.1);
    },
  };

  /* ---------- Sort lab ---------- */
  const sortCanvas = document.getElementById("sortCanvas");
  const sortViz = {
    arr: [],
    i: 0,
    j: 0,
    state: "idle",
    compares: 0,
    swaps: 0,
    playing: false,
    timer: 0,
    highlight: { a: -1, b: -1, sortedFrom: -1 },
    algo: "insertion",
    init() {
      if (!sortCanvas) return;
      this.nInput = bindRange("sortN", "sortNOut", (v) => String(Math.round(Number(v))));
      this.speedInput = bindRange("sortSpeed", "sortSpeedOut");
      this.algoSelect = document.getElementById("sortAlgo");
      this.compareEl = document.getElementById("sortCompares");
      this.swapEl = document.getElementById("sortSwaps");
      this.insight = document.getElementById("sortInsight");

      document.getElementById("sortPlay")?.addEventListener("click", () => this.togglePlay());
      document.getElementById("sortStep")?.addEventListener("click", () => {
        this.playing = false;
        this.updatePlayLabel();
        this.step();
        this.draw();
      });
      document.getElementById("sortShuffle")?.addEventListener("click", () => {
        this.playing = false;
        this.updatePlayLabel();
        this.shuffle();
      });

      this.algoSelect?.addEventListener("change", () => {
        this.playing = false;
        this.updatePlayLabel();
        this.shuffle();
      });
      this.nInput?.addEventListener("change", () => {
        this.playing = false;
        this.updatePlayLabel();
        this.shuffle();
      });

      this.shuffle();
      this.tick();
      window.addEventListener("resize", () => this.draw());
    },
    updatePlayLabel() {
      const btn = document.getElementById("sortPlay");
      if (btn) btn.textContent = this.playing ? "Pause" : "Play";
    },
    togglePlay() {
      if (this.state === "done") this.shuffle();
      this.playing = !this.playing;
      this.updatePlayLabel();
    },
    shuffle() {
      const n = Number(this.nInput?.value || 24);
      this.arr = Array.from({ length: n }, (_, i) => i + 1);
      for (let i = this.arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.arr[i], this.arr[j]] = [this.arr[j], this.arr[i]];
      }
      this.algo = this.algoSelect?.value || "insertion";
      this.compares = 0;
      this.swaps = 0;
      this.highlight = { a: -1, b: -1, sortedFrom: -1 };
      this.resetAlgoState();
      this.syncStats();
      this.draw();
    },
    resetAlgoState() {
      this.i = 0;
      this.j = 0;
      this.state = "ready";
      if (this.algo === "insertion") {
        this.i = 1;
        this.j = 1;
        this.key = this.arr[1];
        this.phase = "pick";
      } else if (this.algo === "selection") {
        this.i = 0;
        this.j = 1;
        this.minIdx = 0;
        this.phase = "scan";
      } else {
        // bubble
        this.i = 0;
        this.j = 0;
        this.phase = "compare";
        this.n = this.arr.length;
      }
    },
    syncStats() {
      if (this.compareEl) this.compareEl.textContent = String(this.compares);
      if (this.swapEl) this.swapEl.textContent = String(this.swaps);
    },
    finish() {
      this.state = "done";
      this.playing = false;
      this.updatePlayLabel();
      this.highlight = { a: -1, b: -1, sortedFrom: 0 };
      if (this.insight) {
        // keep stats line structure
      }
      this.syncStats();
    },
    step() {
      if (this.state === "done") return;
      if (this.state === "ready") this.state = "running";

      if (this.algo === "bubble") this.stepBubble();
      else if (this.algo === "selection") this.stepSelection();
      else this.stepInsertion();

      this.syncStats();
    },
    stepBubble() {
      const n = this.arr.length;
      if (this.i >= n - 1) {
        this.finish();
        return;
      }
      if (this.j >= n - 1 - this.i) {
        this.j = 0;
        this.i += 1;
        this.highlight.sortedFrom = n - this.i;
        return;
      }
      this.compares += 1;
      this.highlight.a = this.j;
      this.highlight.b = this.j + 1;
      if (this.arr[this.j] > this.arr[this.j + 1]) {
        [this.arr[this.j], this.arr[this.j + 1]] = [this.arr[this.j + 1], this.arr[this.j]];
        this.swaps += 1;
      }
      this.j += 1;
    },
    stepSelection() {
      const n = this.arr.length;
      if (this.i >= n - 1) {
        this.finish();
        return;
      }
      if (this.phase === "scan") {
        if (this.j < n) {
          this.compares += 1;
          this.highlight.a = this.minIdx;
          this.highlight.b = this.j;
          if (this.arr[this.j] < this.arr[this.minIdx]) this.minIdx = this.j;
          this.j += 1;
        } else {
          this.phase = "swap";
        }
        return;
      }
      if (this.phase === "swap") {
        if (this.minIdx !== this.i) {
          [this.arr[this.i], this.arr[this.minIdx]] = [this.arr[this.minIdx], this.arr[this.i]];
          this.swaps += 1;
        }
        this.highlight.a = this.i;
        this.highlight.b = this.minIdx;
        this.i += 1;
        this.j = this.i + 1;
        this.minIdx = this.i;
        this.phase = "scan";
        this.highlight.sortedFrom = this.i;
      }
    },
    stepInsertion() {
      const n = this.arr.length;
      if (this.i >= n) {
        this.finish();
        return;
      }
      if (this.phase === "pick") {
        this.key = this.arr[this.i];
        this.j = this.i - 1;
        this.phase = "shift";
        this.highlight.a = this.i;
        this.highlight.b = this.j;
        return;
      }
      if (this.phase === "shift") {
        if (this.j >= 0) {
          this.compares += 1;
          this.highlight.a = this.j;
          this.highlight.b = this.j + 1;
          if (this.arr[this.j] > this.key) {
            this.arr[this.j + 1] = this.arr[this.j];
            this.swaps += 1;
            this.j -= 1;
          } else {
            this.phase = "place";
          }
        } else {
          this.phase = "place";
        }
        return;
      }
      if (this.phase === "place") {
        this.arr[this.j + 1] = this.key;
        this.highlight.sortedFrom = this.i + 1;
        this.i += 1;
        this.phase = "pick";
      }
    },
    tick() {
      const panel = document.getElementById("panel-sort");
      if (panel && !panel.hidden && this.playing) {
        const speed = Number(this.speedInput?.value || 1);
        const steps = Math.max(1, Math.round(speed));
        for (let s = 0; s < steps; s++) this.step();
        this.draw();
      }
      const delay = reduceMotion ? 120 : Math.max(16, 80 / Number(this.speedInput?.value || 1));
      this.timer = window.setTimeout(() => this.tick(), delay);
    },
    draw() {
      if (!sortCanvas) return;
      const panel = document.getElementById("panel-sort");
      if (panel && panel.hidden) return;

      const { w, h } = fitCanvas(sortCanvas);
      const ctx = sortCanvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      const n = this.arr.length || 1;
      const gap = Math.max(1, w * 0.004);
      const barW = (w - gap * (n + 1)) / n;
      const maxVal = n;

      this.arr.forEach((val, idx) => {
        const barH = (val / maxVal) * (h * 0.78);
        const x = gap + idx * (barW + gap);
        const y = h - barH - h * 0.1;

        let color = "rgba(129, 140, 248, 0.85)";
        if (this.highlight.sortedFrom >= 0 && idx < this.highlight.sortedFrom) {
          color = "rgba(94, 234, 212, 0.75)";
        }
        if (idx === this.highlight.a) color = "rgba(251, 191, 36, 0.95)";
        if (idx === this.highlight.b) color = "rgba(251, 113, 133, 0.95)";
        if (this.state === "done") color = "rgba(94, 234, 212, 0.9)";

        ctx.fillStyle = color;
        ctx.beginPath();
        const r = Math.min(6, barW / 2);
        roundRect(ctx, x, y, barW, barH, r);
        ctx.fill();
      });

      ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
      ctx.font = `${Math.max(11, w * 0.018)}px system-ui, sans-serif`;
      const labels = { bubble: "Bubble sort", insertion: "Insertion sort", selection: "Selection sort" };
      ctx.fillText(labels[this.algo] || this.algo, w * 0.04, h * 0.1);
    },
  };

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /* ---------- Boot ---------- */
  hero.init();
  waves.init();
  orbit.init();
  sortViz.init();
})();
