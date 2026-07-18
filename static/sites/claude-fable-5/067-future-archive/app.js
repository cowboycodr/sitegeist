(() => {
  "use strict";

  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll("#stacks .card"));
  const emptyNote = document.getElementById("stacks-empty");
  if (!chips.length || !cards.length) return;

  const applyFilter = (filter) => {
    let visible = 0;
    for (const card of cards) {
      const show = filter === "all" || card.dataset.kind === filter;
      card.hidden = !show;
      if (show) visible += 1;
    }
    if (emptyNote) emptyNote.hidden = visible > 0;
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
})();
