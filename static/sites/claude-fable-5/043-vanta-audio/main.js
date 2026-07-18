(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Gentle reveal-on-scroll for section content; skipped entirely when the
  // visitor prefers reduced motion or the browser lacks IntersectionObserver.
  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".card, .eng-list li, .wave-figure, .spec-table, .hero-stats"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    for (const target of targets) {
      target.classList.add("reveal");
      observer.observe(target);
    }
  }

  // Keep in-page navigation friendly to keyboard users: after following an
  // anchor link, move focus to the section heading it points at.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;
    const heading = section.matches("h1, h2, h3")
      ? section
      : section.querySelector("h1, h2, h3");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  });
})();
