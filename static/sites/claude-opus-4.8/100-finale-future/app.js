(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- Tabbed program ---- */
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !active;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next); next.focus(); }
    });
  });

  /* ---- Count-up counters ---- */
  const counters = Array.from(document.querySelectorAll("dd[data-count]"));
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion.matches) { el.textContent = String(target); return; }
    const start = performance.now();
    const dur = 1100;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCount(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => io.observe(c));
  } else {
    counters.forEach(runCount);
  }

  /* ---- Vision ticker ---- */
  const visions = [
    "Latent Gardens", "Cold Boot", "The Glitch Museum", "First Contact",
    "Feedback Loop", "Ghosts in the Render", "Static Rave", "Protocols of Care",
    "Teaching Stones to Count", "Unfinished Manifestos", "The Hundredth Vision",
    "Volumetric Fog", "Machine Lullabies", "Corrupted Archives", "Signal / Noise",
    "Rooms That Remember", "A Choir of Sensors", "The Last Refresh",
  ];
  const track = document.getElementById("ticker-track");
  if (track) {
    const build = () => {
      visions.forEach((v, i) => {
        const s = document.createElement("span");
        s.textContent = v;
        if (i % 4 === 1) s.className = "hot";
        track.appendChild(s);
      });
    };
    build();
    build(); // duplicate for seamless -50% loop
  }

  /* ---- Constellation background ---- */
  const canvas = document.getElementById("constellation");
  if (canvas && !reduceMotion.matches) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, running = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(28, Math.min(72, Math.floor((w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            const a = (1 - d2 / 15000) * 0.35;
            ctx.strokeStyle = "rgba(120, 200, 220," + a + ")";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(255, 120, 170, 0.75)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; draw(); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });
    reduceMotion.addEventListener("change", (e) => {
      if (e.matches) { stop(); ctx.clearRect(0, 0, w, h); }
    });
  }
})();
