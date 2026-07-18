(() => {
  "use strict";

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    const close = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        close();
        toggle.focus();
      }
    });
  }

  // Footprint estimator — runs entirely locally
  const form = document.getElementById("calc-form");
  const result = document.getElementById("calc-result");
  if (form && result) {
    const estimate = () => {
      const people = Math.max(0, Number(form.elements.people.value) || 0);
      const energy = Math.max(0, Number(form.elements.energy.value) || 0);
      const fleet = Math.max(0, Number(form.elements.fleet.value) || 0);
      // Screening factors: 0.9 t/employee, 0.35 t/MWh, 0.19 kg per km
      const tonnes = people * 0.9 + energy * 0.35 + fleet * 1000 * 0.00019;
      const rounded = Math.round(tonnes).toLocaleString("en-US");
      result.innerHTML =
        "Estimated footprint: <strong>≈ " + rounded + " tCO₂e / year</strong>";
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      estimate();
    });
    form.addEventListener("input", estimate);
  }

  // Hero counter — counts up once, skipped under reduced motion
  const counter = document.getElementById("hero-count");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counter && !reduceMotion && "IntersectionObserver" in window) {
    const target = Number(counter.dataset.target) || 0;
    let started = false;
    const observer = new IntersectionObserver((entries) => {
      if (started || !entries.some((entry) => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      const duration = 1200;
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(counter);
  }
})();
