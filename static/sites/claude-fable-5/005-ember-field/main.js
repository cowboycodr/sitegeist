(() => {
  "use strict";

  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".roast-card"));
  const note = document.getElementById("finder-note");

  const labels = {
    all: "Showing all four roasts of the season.",
    pourover: "Dawn Terrace and Orchard Smoke shine brightest as pour-over.",
    espresso: "Hearthline and Late Lantern are built for the espresso machine.",
    press: "Orchard Smoke and Late Lantern reward a long, coarse steep.",
  };

  const applyFilter = (brew) => {
    chips.forEach((chip) => {
      chip.setAttribute("aria-pressed", String(chip.dataset.brew === brew));
    });
    cards.forEach((card) => {
      const match = brew === "all" || card.dataset.brews.split(" ").includes(brew);
      card.classList.toggle("is-dimmed", !match);
    });
    if (note) note.textContent = labels[brew] || labels.all;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.brew));
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealTargets = document.querySelectorAll(
    ".roast-card, .journey-step, .producer-card, .ritual",
  );

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
      { threshold: 0.15 },
    );
    revealTargets.forEach((target) => {
      target.classList.add("reveal");
      observer.observe(target);
    });
  }
})();
