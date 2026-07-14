(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Gentle staggered reveal for sections and cards, disabled when motion is reduced.
  const targets = document.querySelectorAll(
    ".hero, .section-head, .card, .material, .oath, .atelier-art, .atelier-copy",
  );

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
  } else {
    targets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(i % 4, 3) * 70}ms`);
    });
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    targets.forEach((el) => io.observe(el));
  }

  // Cooperate with the viewer's pull-to-dismiss gesture: mute nonessential motion
  // while a pull is active so the site stays calm under the gesture.
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = !!(event.detail && event.detail.active);
    document.documentElement.classList.toggle("is-pulling", active);
  });
})();
