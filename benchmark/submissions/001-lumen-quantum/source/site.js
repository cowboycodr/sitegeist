(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const captureMode = new URLSearchParams(window.location.search).get("sitegeistCapture") === "1";
  const motionIsReduced = () => reducedMotion.matches || captureMode;
  const quantumFields = new Set();

  if (captureMode) root.dataset.sitegeistCapture = "";

  document.addEventListener("sitegeist:pull-state", (event) => {
    const paused = event instanceof CustomEvent && event.detail?.active === true;
    quantumFields.forEach((field) => field.setPaused(paused));
  });

  class QuantumField {
    constructor(canvas, variant = "hero") {
      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true });
      this.variant = variant;
      this.mode = "coherence";
      this.width = 0;
      this.height = 0;
      this.pixelRatio = 1;
      this.nodes = [];
      this.frame = 0;
      this.paused = false;
      this.visible = true;
      this.pointer = { x: 0.72, y: 0.45, active: false };
      this.startedAt = performance.now();

      if (!this.context) return;

      this.resize = this.resize.bind(this);
      this.draw = this.draw.bind(this);
      quantumFields.add(this);
      this.resize();

      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(canvas);
      } else {
        window.addEventListener("resize", this.resize, { passive: true });
      }

      if ("IntersectionObserver" in window) {
        this.visibilityObserver = new IntersectionObserver((entries) => {
          this.visible = entries[0]?.isIntersecting ?? true;
        });
        this.visibilityObserver.observe(canvas);
      }

      const pointerTarget = variant === "hero" ? window : canvas;
      pointerTarget.addEventListener(
        "pointermove",
        (event) => {
          const bounds = canvas.getBoundingClientRect();
          this.pointer.x = (event.clientX - bounds.left) / Math.max(1, bounds.width);
          this.pointer.y = (event.clientY - bounds.top) / Math.max(1, bounds.height);
          this.pointer.active = true;
        },
        { passive: true },
      );

      pointerTarget.addEventListener(
        "pointerleave",
        () => {
          this.pointer.active = false;
        },
        { passive: true },
      );

      if (motionIsReduced()) {
        this.draw(this.startedAt, true);
      } else {
        this.frame = requestAnimationFrame(this.draw);
      }
    }

    settings() {
      const settings = {
        coherence: {
          count: this.variant === "hero" ? 34 : 28,
          speed: 0.00038,
          reach: this.variant === "hero" ? 135 : 165,
          color: [108, 245, 215],
          secondary: [200, 255, 77],
          shape: "orbit",
        },
        correction: {
          count: 36,
          speed: 0.00025,
          reach: 120,
          color: [255, 184, 103],
          secondary: [200, 255, 77],
          shape: "grid",
        },
        routing: {
          count: 32,
          speed: 0.00052,
          reach: 190,
          color: [169, 155, 255],
          secondary: [84, 216, 229],
          shape: "flow",
        },
      };

      return settings[this.mode];
    }

    setPaused(paused) {
      if (this.paused === paused) return;
      this.paused = paused;
      if (paused) {
        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = 0;
      } else if (!motionIsReduced() && !this.frame) {
        this.frame = requestAnimationFrame(this.draw);
      }
    }

    setMode(mode) {
      if (!Object.prototype.hasOwnProperty.call({ coherence: 1, correction: 1, routing: 1 }, mode)) {
        return;
      }
      this.mode = mode;
      this.createNodes();
      if (motionIsReduced()) this.draw(this.startedAt, true);
    }

    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (width === this.width && height === this.height && pixelRatio === this.pixelRatio) return;

      this.width = width;
      this.height = height;
      this.pixelRatio = pixelRatio;
      this.canvas.width = Math.round(width * pixelRatio);
      this.canvas.height = Math.round(height * pixelRatio);
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      this.createNodes();
      if (motionIsReduced()) this.draw(this.startedAt, true);
    }

    createNodes() {
      const { count } = this.settings();
      this.nodes = Array.from({ length: count }, (_, index) => {
        const fraction = index / count;
        const goldenAngle = index * 2.399963229728653;
        const band = ((index * 17) % count) / count;
        return {
          index,
          fraction,
          angle: goldenAngle,
          phase: (index * 1.61803398875) % (Math.PI * 2),
          band,
          size: index % 9 === 0 ? 2.5 : index % 4 === 0 ? 1.7 : 1,
          drift: 0.55 + ((index * 13) % 11) / 15,
          x: 0,
          y: 0,
        };
      });
    }

    placeNode(node, time) {
      const { shape, speed } = this.settings();
      const t = time * speed * node.drift + node.phase;
      const compact = this.width < 700;

      if (this.variant === "hero") {
        const centerX = this.width * (compact ? 0.78 : 0.76);
        const centerY = this.height * 0.44;
        const radiusX = this.width * (compact ? 0.31 : 0.27) * (0.35 + node.band * 0.75);
        const radiusY = this.height * 0.28 * (0.4 + node.band * 0.65);
        node.x = centerX + Math.cos(node.angle + t * 0.35) * radiusX + Math.sin(t * 1.3) * 9;
        node.y = centerY + Math.sin(node.angle + t * 0.5) * radiusY + Math.cos(t) * 7;
        return;
      }

      if (shape === "grid") {
        const columns = 6;
        const column = node.index % columns;
        const row = Math.floor(node.index / columns);
        const rows = Math.ceil(this.nodes.length / columns);
        node.x = this.width * (0.18 + (column / (columns - 1)) * 0.64) + Math.sin(t * 1.7) * 8;
        node.y = this.height * (0.18 + (row / Math.max(1, rows - 1)) * 0.64) + Math.cos(t * 1.3) * 8;
      } else if (shape === "flow") {
        const lane = node.index % 4;
        node.x = this.width * (0.12 + node.band * 0.76);
        node.y =
          this.height * (0.22 + lane * 0.18) +
          Math.sin(node.band * Math.PI * 3 + t * 1.8) * this.height * 0.09;
      } else {
        const radius = Math.min(this.width, this.height) * (0.18 + node.band * 0.28);
        node.x = this.width / 2 + Math.cos(node.angle + t * 0.7) * radius * 1.35;
        node.y = this.height / 2 + Math.sin(node.angle + t * 0.85) * radius * 0.78;
      }

      if (this.pointer.active) {
        const pointerX = this.pointer.x * this.width;
        const pointerY = this.pointer.y * this.height;
        const deltaX = node.x - pointerX;
        const deltaY = node.y - pointerY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < 130 && distance > 0) {
          const force = (130 - distance) / 130;
          node.x += (deltaX / distance) * force * 22;
          node.y += (deltaY / distance) * force * 22;
        }
      }
    }

    draw(time, once = false) {
      if (!this.context || !this.width || !this.height) return;
      this.frame = 0;
      if (this.paused && !once) return;

      if (this.visible || once) {
        const context = this.context;
        const { reach, color, secondary, shape } = this.settings();
        context.clearRect(0, 0, this.width, this.height);

        if (this.variant === "lab") {
          const glow = context.createRadialGradient(
            this.width / 2,
            this.height / 2,
            0,
            this.width / 2,
            this.height / 2,
            Math.min(this.width, this.height) * 0.48,
          );
          glow.addColorStop(0, `rgba(${color.join(",")},0.08)`);
          glow.addColorStop(1, `rgba(${color.join(",")},0)`);
          context.fillStyle = glow;
          context.fillRect(0, 0, this.width, this.height);
        }

        this.nodes.forEach((node) => this.placeNode(node, time - this.startedAt));
        context.save();
        context.globalCompositeOperation = "lighter";

        for (let first = 0; first < this.nodes.length; first += 1) {
          const a = this.nodes[first];
          for (let second = first + 1; second < this.nodes.length; second += 1) {
            const b = this.nodes[second];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            const connectionAllowed =
              shape !== "grid" ||
              Math.abs((a.index % 6) - (b.index % 6)) +
                Math.abs(Math.floor(a.index / 6) - Math.floor(b.index / 6)) <=
                1;

            if (distance < reach && connectionAllowed) {
              const alpha = (1 - distance / reach) * (this.variant === "hero" ? 0.15 : 0.25);
              context.beginPath();
              context.moveTo(a.x, a.y);
              context.lineTo(b.x, b.y);
              context.strokeStyle = `rgba(${color.join(",")},${alpha})`;
              context.lineWidth = 0.65;
              context.stroke();
            }
          }
        }

        this.nodes.forEach((node) => {
          const isAnchor = node.index % 9 === 0;
          if (isAnchor) {
            context.beginPath();
            context.arc(node.x, node.y, 10, 0, Math.PI * 2);
            context.strokeStyle = `rgba(${secondary.join(",")},0.18)`;
            context.lineWidth = 1;
            context.stroke();
          }

          context.beginPath();
          context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
          context.fillStyle = isAnchor
            ? `rgba(${secondary.join(",")},0.95)`
            : `rgba(${color.join(",")},${this.variant === "hero" ? 0.68 : 0.86})`;
          context.shadowColor = `rgba(${color.join(",")},0.75)`;
          context.shadowBlur = isAnchor ? 14 : 7;
          context.fill();
        });

        context.restore();
      }

      if (!once && !motionIsReduced() && !this.paused) {
        this.frame = requestAnimationFrame(this.draw);
      }
    }
  }

  const installMenu = () => {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      menu.hidden = true;
      document.body.classList.remove("menu-open");
    };

    const open = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
      menu.hidden = false;
      document.body.classList.add("menu-open");
      menu.querySelector("a")?.focus();
    };

    toggle.addEventListener("click", () => {
      if (toggle.getAttribute("aria-expanded") === "true") close();
      else open();
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        close();
        toggle.focus();
      }
    });
  };

  const installHeader = () => {
    const header = document.querySelector("[data-header]");
    if (!header) return;

    let frame = 0;
    const update = () => {
      header.classList.toggle("is-scrolled", scrollPosition() > 24);
      frame = 0;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!frame) frame = requestAnimationFrame(update);
      },
      { passive: true },
    );
    update();
  };

  const installReveals = () => {
    const elements = [...document.querySelectorAll("[data-reveal]")];
    if (!elements.length) return;

    if (!("IntersectionObserver" in window) || motionIsReduced()) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" },
    );

    elements.forEach((element) => observer.observe(element));
  };

  const installPapers = () => {
    document.querySelectorAll(".paper-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const panel = document.getElementById(toggle.getAttribute("aria-controls"));
        if (!panel) return;
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      });
    });
  };

  const installCounters = () => {
    const counters = [...document.querySelectorAll("[data-count]")];
    if (!counters.length) return;

    const animate = (element) => {
      if (element.dataset.counted === "true") return;
      element.dataset.counted = "true";
      const target = Number.parseInt(element.dataset.count, 10);
      if (!Number.isFinite(target) || motionIsReduced()) {
        element.textContent = String(target);
        return;
      }

      const duration = 1100;
      const start = performance.now();
      const from = Math.max(0, Math.floor(target * 0.74));
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - progress) ** 3;
        element.textContent = String(Math.round(from + (target - from) * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((counter) => observer.observe(counter));
  };

  const installTopologyControls = (field) => {
    const readouts = {
      code: document.getElementById("mode-code"),
      coherence: document.getElementById("coherence-value"),
      error: document.getElementById("error-value"),
      coupling: document.getElementById("coupling-value"),
    };
    const modes = {
      coherence: {
        code: "C–01",
        coherence: "118.4 <small>μs</small>",
        error: "0.031 <small>%</small>",
        coupling: "8.74 <small>MHz</small>",
      },
      correction: {
        code: "E–12",
        coherence: "124.8 <small>μs</small>",
        error: "0.008 <small>%</small>",
        coupling: "7.91 <small>MHz</small>",
      },
      routing: {
        code: "R–07",
        coherence: "109.2 <small>μs</small>",
        error: "0.024 <small>%</small>",
        coupling: "9.18 <small>MHz</small>",
      },
    };

    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;
        const values = modes[mode];
        if (!values) return;

        document.querySelectorAll("[data-mode]").forEach((candidate) => {
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });

        field?.setMode(mode);
        readouts.code.textContent = values.code;
        readouts.coherence.innerHTML = values.coherence;
        readouts.error.innerHTML = values.error;
        readouts.coupling.innerHTML = values.coupling;
      });
    });
  };

  root.dataset.js = "ready";
  installMenu();
  installHeader();
  installReveals();
  installPapers();
  installCounters();

  const heroCanvas = document.getElementById("hero-field");
  const labCanvas = document.getElementById("lab-field");
  if (heroCanvas) new QuantumField(heroCanvas, "hero");
  const labField = labCanvas ? new QuantumField(labCanvas, "lab") : null;
  installTopologyControls(labField);
})();
