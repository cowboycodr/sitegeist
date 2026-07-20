(() => {
  "use strict";

  const demo = document.querySelector("[data-demo]");
  if (!demo) return;

  const toggle = demo.querySelector("[data-demo-toggle]");
  const status = demo.querySelector("[data-demo-status]");
  const steps = Array.from(demo.querySelectorAll(".demo-step"));

  const messages = [
    "Loading at the dock — cargo bay locked.",
    "Navigating the hallway, yielding to foot traffic.",
    "Riding the elevator to the fourth floor.",
    "Delivered to room 412. Bay opened with a badge tap.",
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let phase = 0;
  let timer = 0;
  let playing = false;

  const setPhase = (next) => {
    phase = next;
    demo.dataset.phase = String(phase);
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", index === phase);
    });
    status.textContent = messages[phase];
  };

  const stop = (message) => {
    playing = false;
    window.clearTimeout(timer);
    demo.classList.remove("is-playing");
    toggle.setAttribute("aria-pressed", "false");
    toggle.textContent = "Play the run";
    if (message) status.textContent = message;
  };

  const advance = () => {
    if (!playing) return;
    if (phase >= steps.length - 1) {
      stop("Run complete — Relay One heads back to the dock.");
      setTimeout(() => {
        demo.classList.remove("is-playing");
        setPhase(0);
        status.textContent = "Ready at the loading dock.";
      }, reduceMotion.matches ? 0 : 1200);
      return;
    }
    setPhase(phase + 1);
    timer = window.setTimeout(advance, reduceMotion.matches ? 1500 : 2600);
  };

  toggle.addEventListener("click", () => {
    if (playing) {
      stop("Paused mid-run.");
      return;
    }
    playing = true;
    demo.classList.add("is-playing");
    toggle.setAttribute("aria-pressed", "true");
    toggle.textContent = "Pause";
    setPhase(0);
    timer = window.setTimeout(advance, reduceMotion.matches ? 1500 : 1800);
  });
})();
