(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  const format = (value, suffix) => value.toLocaleString("en-US") + suffix;

  const animate = (el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    if (!Number.isFinite(target) || reduceMotion.matches) {
      el.textContent = format(target, suffix);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(target * eased), suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach((el) => animate(el));
    return;
  }

  const seen = new WeakSet();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => observer.observe(el));
})();
