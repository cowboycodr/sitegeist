(() => {
  "use strict";

  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reduce.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  reveals.forEach((el) => io.observe(el));
})();
