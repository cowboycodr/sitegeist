(() => {
  "use strict";

  document.documentElement.classList.add("js");

  // Archive theme filter
  const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
  const issues = Array.from(document.querySelectorAll("#archive-list .issue"));
  const empty = document.getElementById("archive-empty");

  const applyFilter = (theme) => {
    let shown = 0;
    for (const issue of issues) {
      const match = theme === "all" || issue.dataset.theme === theme;
      issue.hidden = !match;
      if (match) shown += 1;
    }
    if (empty) empty.hidden = shown > 0;
  };

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      for (const other of chips) {
        const active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      }
      applyFilter(chip.dataset.filter);
    });
  }

  // Scroll reveal, skipped when the user prefers reduced motion
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealables = Array.from(document.querySelectorAll(".reveal"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    for (const el of revealables) el.classList.add("is-visible");
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
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of revealables) observer.observe(el);
})();
