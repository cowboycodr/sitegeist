(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Scroll-reveal */
  const revealables = Array.from(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* Count-up stats */
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const runCount = (el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && !reduce) {
    const co = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* Smooth in-page navigation with focus management */
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* Bridge pull-state hook: gently fade the page while the viewer pulls to dismiss */
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = !!(event.detail && event.detail.active);
    document.body.style.transition = reduce ? "" : "opacity .2s ease";
    document.body.style.opacity = active ? "0.82" : "";
  });
})();
