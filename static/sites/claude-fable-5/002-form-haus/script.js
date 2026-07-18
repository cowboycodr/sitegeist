(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const revealTargets = Array.from(document.querySelectorAll(".reveal"));

  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    document.documentElement.classList.add("no-observer");
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
  );

  revealTargets.forEach((el) => observer.observe(el));

  reduceMotion.addEventListener("change", (event) => {
    if (event.matches) {
      observer.disconnect();
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    }
  });
})();
