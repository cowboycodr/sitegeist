(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- Scroll reveal ---- */
  const revealables = Array.from(document.querySelectorAll(".reveal"));
  if (revealables.length) {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 },
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* ---- Soundstage spectrum ---- */
  const canvas = document.getElementById("spectrum");
  const caption = document.getElementById("stage-caption");
  const chips = Array.from(document.querySelectorAll(".chip"));

  const captions = {
    near: "Intimate — the voice a hand's width from your ear, breath and all.",
    mid: "Mid hall — the source steps back; reflections bloom into the room.",
    far: "Far field — a distant stage, air and reverb doing the work.",
  };

  const profiles = {
    // spread: how wide the energy sits, height: peak energy, tint mix
    near: { spread: 0.55, gain: 1.0, mix: 0.15 },
    mid: { spread: 0.8, gain: 0.78, mix: 0.5 },
    far: { spread: 1.15, gain: 0.58, mix: 0.85 },
  };

  let mode = "near";
  let target = profiles.near;
  let cur = { spread: target.spread, gain: target.gain, mix: target.mix };

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const BARS = 56;
    const seeds = Array.from({ length: BARS }, (_, i) => ({
      phase: (i / BARS) * Math.PI * 2 + Math.random() * 0.6,
      speed: 0.6 + Math.random() * 0.9,
      base: Math.random() * 0.4,
    }));

    const mixColor = (m) => {
      // amber (215,151,90) -> violet (111,107,208)
      const r = Math.round(215 + (111 - 215) * m);
      const g = Math.round(151 + (107 - 151) * m);
      const b = Math.round(90 + (208 - 90) * m);
      return [r, g, b];
    };

    const draw = (t) => {
      // ease current toward target
      cur.spread += (target.spread - cur.spread) * 0.06;
      cur.gain += (target.gain - cur.gain) * 0.06;
      cur.mix += (target.mix - cur.mix) * 0.06;

      ctx.clearRect(0, 0, W, H);
      const [cr, cg, cb] = mixColor(cur.mix);
      const mid = W / 2;
      const barW = W / BARS;
      const baseY = H - 14;

      // center reference line
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(W, baseY);
      ctx.stroke();

      for (let i = 0; i < BARS; i += 1) {
        const s = seeds[i];
        const dist = Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2); // 0 center -> 1 edge
        const bell = Math.exp(-Math.pow(dist / cur.spread, 2) * 2.4);
        const osc = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
        const amp = (s.base + osc) * bell * cur.gain;
        const h = Math.max(3, amp * (H - 40));
        const x = i * barW + barW * 0.18;
        const w = barW * 0.64;
        const alpha = 0.35 + 0.55 * bell;

        const grad = ctx.createLinearGradient(0, baseY - h, 0, baseY);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0.05)`);
        ctx.fillStyle = grad;
        roundRect(ctx, x, baseY - h, w, h, Math.min(w / 2, 3));
        ctx.fill();

        // mirrored soft reflection
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha * 0.12})`;
        roundRect(ctx, x, baseY, w, Math.min(h * 0.4, 16), 2);
        ctx.fill();
      }

      // subtle center glow marking the source
      const glow = ctx.createRadialGradient(mid, baseY - 40, 4, mid, baseY - 40, 120 * cur.spread);
      glow.addColorStop(0, `rgba(${cr},${cg},${cb},${0.18 * cur.gain})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
    };

    const roundRect = (c, x, y, w, h, r) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    let raf = 0;
    const loop = (t) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion.matches) {
        draw(1200); // single static frame
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Only animate while visible
    if ("IntersectionObserver" in window) {
      const vis = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? start() : stop()));
        },
        { threshold: 0.1 },
      );
      vis.observe(canvas);
    } else {
      start();
    }

    reduceMotion.addEventListener("change", () => {
      stop();
      start();
    });
  }

  /* ---- Chip control ---- */
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const pos = chip.getAttribute("data-pos");
      if (!profiles[pos]) return;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      mode = pos;
      target = profiles[pos];
      if (caption) caption.textContent = captions[pos];
    });
  });
})();
