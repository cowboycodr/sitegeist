// NULL Laboratory — field notes toggles + cycle readout
(() => {
  "use strict";

  // Expand/collapse experiment field notes.
  document.querySelectorAll(".exp-toggle").forEach((button) => {
    const notes = document.getElementById(button.getAttribute("aria-controls"));
    if (!notes) return;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      notes.hidden = open;
    });
  });

  // Cycle readout: day-of-year counter, ticking hex suffix unless reduced motion.
  const readout = document.getElementById("cycle-readout");
  if (!readout) return;
  const now = new Date();
  const day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const base = "D" + String(day).padStart(3, "0");
  readout.textContent = base;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = 0;
  const tick = () => {
    const hex = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    readout.textContent = base + "." + hex;
  };
  const applyMotion = () => {
    if (reduceMotion.matches) {
      clearInterval(timer);
      timer = 0;
      readout.textContent = base;
    } else if (!timer) {
      tick();
      timer = setInterval(tick, 1200);
    }
  };
  applyMotion();
  reduceMotion.addEventListener("change", applyMotion);
})();
