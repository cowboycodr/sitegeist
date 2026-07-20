(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = document.querySelectorAll(".reveal");

  const showAll = () => targets.forEach((el) => el.classList.add("is-visible"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    targets.forEach((el) => observer.observe(el));
    reduceMotion.addEventListener("change", (event) => {
      if (event.matches) {
        observer.disconnect();
        showAll();
      }
    });
  }
})();
