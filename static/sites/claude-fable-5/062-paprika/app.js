(() => {
  "use strict";

  // Dish filtering
  const chips = Array.from(document.querySelectorAll(".chip"));
  const dishes = Array.from(document.querySelectorAll(".dish"));
  const status = document.querySelector(".filter-status");

  const labels = {
    all: "all",
    fire: "fiery",
    comfort: "comfort",
    green: "green & bright",
  };

  const applyFilter = (filter) => {
    let shown = 0;
    dishes.forEach((dish) => {
      const tags = (dish.dataset.tags || "").split(/\s+/);
      const match = filter === "all" || tags.includes(filter);
      dish.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    if (status) {
      const noun = shown === 1 ? "dish" : "dishes";
      status.textContent =
        filter === "all"
          ? `Showing all ${shown} ${noun}.`
          : `Showing ${shown} ${labels[filter]} ${noun}.`;
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((other) => {
        const active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      applyFilter(chip.dataset.filter);
    });
  });

  // Scroll reveal, skipped when the visitor prefers reduced motion
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = document.querySelectorAll(".dish, .kitchen, .step, .cta-band");

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    targets.forEach((target) => {
      target.classList.add("reveal");
      observer.observe(target);
    });
  }
})();
