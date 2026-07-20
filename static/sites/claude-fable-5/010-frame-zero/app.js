(() => {
  "use strict";

  const filters = Array.from(document.querySelectorAll(".filter"));
  const films = Array.from(document.querySelectorAll(".film"));
  const status = document.getElementById("filter-status");

  const strandNames = {
    all: "all",
    signal: "Signal",
    fault: "Fault Lines",
    night: "Night Shift",
    short: "Short Circuits",
  };

  const applyFilter = (key) => {
    let shown = 0;
    films.forEach((film) => {
      const match = key === "all" || film.dataset.strand === key;
      film.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    filters.forEach((button) => {
      const active = button.dataset.filter === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (status) {
      status.textContent =
        key === "all"
          ? `Showing all ${shown} featured films.`
          : `Showing ${shown} film${shown === 1 ? "" : "s"} in the ${strandNames[key]} strand.`;
    }
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });
})();
