(() => {
  "use strict";

  // Accord unfold toggles on each scent card
  document.querySelectorAll(".scent-card__toggle").forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!panel) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      toggle.querySelector(".scent-card__toggle-label").textContent = open
        ? "Unfold the accord"
        : "Fold the accord";
    });
  });
})();
