(() => {
  "use strict";

  // Breathing patterns. Each phase: label shown, target scale of the guide
  // rings (1 = open / full breath, 0.55 = settled), and duration in seconds.
  const PATTERNS = {
    calm: [
      { label: "Breathe in", scale: 1, secs: 4 },
      { label: "Hold", scale: 1, secs: 4 },
      { label: "Breathe out", scale: 0.55, secs: 6 },
    ],
    box: [
      { label: "Breathe in", scale: 1, secs: 4 },
      { label: "Hold", scale: 1, secs: 4 },
      { label: "Breathe out", scale: 0.55, secs: 4 },
      { label: "Hold", scale: 0.55, secs: 4 },
    ],
    rest: [
      { label: "Breathe in", scale: 1, secs: 4 },
      { label: "Hold", scale: 1, secs: 7 },
      { label: "Breathe out", scale: 0.55, secs: 8 },
    ],
  };

  const guide = document.querySelector(".guide");
  const phaseEl = document.getElementById("phase");
  const countEl = document.getElementById("count");
  const statusEl = document.getElementById("status");
  const toggle = document.getElementById("toggle");
  const cycleEl = document.getElementById("cycleCount");
  const chips = Array.from(document.querySelectorAll(".chip"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let current = "calm";
  let running = false;
  let phaseIndex = 0;
  let secondsLeft = 0;
  let cycles = 0;
  let tickTimer = 0;

  const clear = () => {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = 0; }
  };

  const setGuide = (scale, secs) => {
    guide.style.setProperty("--dur", (reduceMotion.matches ? 0.001 : secs) + "s");
    guide.style.setProperty("--s", scale);
  };

  const renderCycles = () => {
    cycleEl.textContent = cycles === 1 ? "1 cycle" : cycles + " cycles";
  };

  const enterPhase = (index) => {
    const seq = PATTERNS[current];
    phaseIndex = index % seq.length;
    if (phaseIndex === 0 && index !== 0) {
      cycles += 1;
      renderCycles();
    }
    const phase = seq[phaseIndex];
    secondsLeft = phase.secs;
    phaseEl.textContent = phase.label;
    countEl.textContent = secondsLeft;
    statusEl.textContent = phase.label + " — " + phase.secs + " seconds.";
    setGuide(phase.scale, phase.secs);

    clear();
    tickTimer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        enterPhase(phaseIndex + 1);
        return;
      }
      countEl.textContent = secondsLeft;
    }, 1000);
  };

  const start = () => {
    running = true;
    cycles = 0;
    renderCycles();
    toggle.textContent = "End session";
    toggle.setAttribute("aria-pressed", "true");
    guide.setAttribute("data-active", "true");
    enterPhase(0);
  };

  const stop = () => {
    running = false;
    clear();
    toggle.textContent = "Begin session";
    toggle.setAttribute("aria-pressed", "false");
    guide.removeAttribute("data-active");
    phaseEl.textContent = "Ready";
    countEl.textContent = PATTERNS[current][0].secs;
    setGuide(0.55, 0.6);
    statusEl.textContent = "Paused. Pick a rhythm below, then begin.";
  };

  toggle.addEventListener("click", () => {
    running ? stop() : start();
  });

  // Rhythm selection behaves as a radiogroup.
  const selectChip = (chip) => {
    chips.forEach((c) => {
      const on = c === chip;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-checked", on ? "true" : "false");
      c.tabIndex = on ? 0 : -1;
    });
    current = chip.dataset.pattern;
    if (running) {
      // Restart the sequence with the new rhythm.
      cycles = 0;
      renderCycles();
      enterPhase(0);
    } else {
      countEl.textContent = PATTERNS[current][0].secs;
    }
  };

  chips.forEach((chip, i) => {
    chip.tabIndex = chip.classList.contains("is-active") ? 0 : -1;
    chip.addEventListener("click", () => selectChip(chip));
    chip.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = chips[(i + 1) % chips.length];
        next.focus();
        selectChip(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = chips[(i - 1 + chips.length) % chips.length];
        prev.focus();
        selectChip(prev);
      }
    });
  });

  // Rest the guide at its settled size on load.
  setGuide(0.55, 0.6);
  renderCycles();
})();
