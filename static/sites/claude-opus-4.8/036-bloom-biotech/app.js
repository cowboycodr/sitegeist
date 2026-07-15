(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Living colony ---------- */
  const svgNS = "http://www.w3.org/2000/svg";
  const colony = document.getElementById("colony");
  const CX = 200, CY = 200;
  const cells = [];
  if (colony) {
    // Deterministic spiral of cells (phyllotaxis) so layout is stable.
    const N = 90;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i += 1) {
      const radius = 12 + 138 * Math.sqrt(i / N);
      const angle = i * golden;
      const x = CX + radius * Math.cos(angle);
      const y = CY + radius * Math.sin(angle);
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", x.toFixed(1));
      c.setAttribute("cy", y.toFixed(1));
      c.setAttribute("r", "0");
      colony.appendChild(c);
      cells.push({ el: c, order: radius });
    }
  }

  const signal = document.getElementById("signal");
  const signalOut = document.getElementById("signalOut");
  const growthVal = document.getElementById("growthVal");

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function render(pct) {
    if (signalOut) signalOut.textContent = pct + "%";
    // Regeneration curve: saturating response to signal.
    const regen = Math.round(100 * (1 - Math.exp(-pct / 34)));
    if (growthVal) growthVal.textContent = regen;

    // How many cells are "alive" scales with signal; radius/color scale too.
    const activeRadius = 12 + (pct / 100) * 150;
    cells.forEach((cell) => {
      const alive = cell.order <= activeRadius;
      const t = clamp((activeRadius - cell.order) / 40, 0, 1);
      cell.el.setAttribute("r", alive ? (2.4 + 4.6 * t).toFixed(1) : "0");
      cell.el.setAttribute("opacity", alive ? (0.35 + 0.65 * t).toFixed(2) : "0");
      // Blend green -> pink toward the outer active frontier.
      const g = Math.round(155 - 40 * (1 - t));
      cell.el.setAttribute("fill", t > 0.75 ? "#d98cae" : `rgb(79, ${g}, 108)`);
    });
  }

  if (signal) {
    signal.addEventListener("input", () => render(clamp(parseInt(signal.value, 10) || 0, 0, 100)));
    render(parseInt(signal.value, 10) || 0);
  }

  /* ---------- Bridge pull-state (dim while pulling to dismiss) ---------- */
  document.addEventListener("sitegeist:pull-state", (e) => {
    document.body.style.transition = "opacity .2s ease";
    document.body.style.opacity = e.detail && e.detail.active ? "0.72" : "1";
  });
})();
