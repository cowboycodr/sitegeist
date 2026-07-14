(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal on scroll */
  const revealables = Array.from(document.querySelectorAll(".reveal"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* Collection filter */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll("#pieces .card"));
  const empty = document.getElementById("empty");

  const applyFilter = (value) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = value === "all" || card.dataset.cat === value;
      card.classList.toggle("hide", !match);
      if (match) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", active ? "true" : "false");
      });
      applyFilter(chip.dataset.filter);
    });
  });

  /* Pull-to-dismiss visual acknowledgement from the neutral bridge */
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = !!(event.detail && event.detail.active);
    document.body.style.transition = reduce ? "none" : "opacity 0.2s ease";
    document.body.style.opacity = active ? "0.92" : "";
  });
})();
