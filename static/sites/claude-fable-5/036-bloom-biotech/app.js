(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  if (toggle && navList) {
    const closeNav = () => {
      navList.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Accordion stepper (single-open)
  const steps = Array.from(document.querySelectorAll(".step"));
  steps.forEach((step) => {
    const btn = step.querySelector(".step-btn");
    btn.addEventListener("click", () => {
      const isActive = step.classList.contains("is-active");
      steps.forEach((s) => {
        s.classList.remove("is-active");
        s.querySelector(".step-btn").setAttribute("aria-expanded", "false");
      });
      if (!isActive) {
        step.classList.add("is-active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Count-up stats when hero enters view
  const counters = Array.from(document.querySelectorAll(".hero-stats dd"));
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => obs.observe(c));
  } else {
    counters.forEach(runCount);
  }
})();
