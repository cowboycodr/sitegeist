(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!("IntersectionObserver" in window) || reduceMotion.matches) return;

  document.documentElement.classList.add("js-reveal");

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

  for (const element of document.querySelectorAll(".reveal")) {
    observer.observe(element);
  }

  // If motion preference changes mid-session, show everything at once.
  reduceMotion.addEventListener("change", () => {
    if (!reduceMotion.matches) return;
    observer.disconnect();
    for (const element of document.querySelectorAll(".reveal")) {
      element.classList.add("is-visible");
    }
  });
})();
