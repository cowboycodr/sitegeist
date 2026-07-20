(() => {
  "use strict";

  const map = document.getElementById("network-map");
  const cards = Array.from(document.querySelectorAll(".line-card"));
  const paths = new Map(
    Array.from(document.querySelectorAll(".map-line")).map((p) => [p.dataset.line, p]),
  );

  let selected = null;

  const apply = (line) => {
    selected = line;
    map.classList.toggle("has-focus", Boolean(line));
    paths.forEach((path, key) => path.classList.toggle("is-active", key === line));
    cards.forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.line === line));
    });
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      apply(card.dataset.line === selected ? null : card.dataset.line);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selected) apply(null);
  });

  // Count-up figures on first reveal.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  if (!reduceMotion && "IntersectionObserver" in window) {
    const animate = (el) => {
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) * (1 - t);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => observer.observe(el));
  }
})();
