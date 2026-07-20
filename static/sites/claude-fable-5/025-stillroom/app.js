(() => {
  "use strict";

  const PRACTICES = {
    resonant: {
      label: "Resonant tide",
      blurb: "Even tides of breath — about five and a half seconds in, the same out. A gentle default for almost any moment.",
      phases: [
        { name: "Breathe in", cls: "is-in", seconds: 5.5 },
        { name: "Breathe out", cls: "is-out", seconds: 5.5 },
      ],
    },
    box: {
      label: "Box breathing",
      blurb: "Four even sides — in, held, out, held. A composed rhythm for gathering yourself before a demanding hour.",
      phases: [
        { name: "Breathe in", cls: "is-in", seconds: 4 },
        { name: "Hold", cls: "is-hold-full", seconds: 4 },
        { name: "Breathe out", cls: "is-out", seconds: 4 },
        { name: "Hold", cls: "is-hold-empty", seconds: 4 },
      ],
    },
    soften: {
      label: "Long exhale",
      blurb: "In for four, a quiet hold of seven, out for eight. The long exhale asks the body, kindly, to stand down.",
      phases: [
        { name: "Breathe in", cls: "is-in", seconds: 4 },
        { name: "Hold", cls: "is-hold-full", seconds: 7 },
        { name: "Breathe out", cls: "is-out", seconds: 8 },
      ],
    },
    ground: {
      label: "Grounding",
      blurb: "In for four, out for six — a slight lean toward the exhale. Light enough to practice with eyes open, feet on the floor.",
      phases: [
        { name: "Breathe in", cls: "is-in", seconds: 4 },
        { name: "Breathe out", cls: "is-out", seconds: 6 },
      ],
    },
  };

  const VESSEL_CLASSES = ["is-in", "is-out", "is-hold-full", "is-hold-empty"];

  const vessel = document.getElementById("vessel");
  const phaseLabel = document.getElementById("phase-label");
  const phaseCount = document.getElementById("phase-count");
  const practiceChips = document.getElementById("practice-chips");
  const lengthChips = document.getElementById("length-chips");
  const blurb = document.getElementById("practice-blurb");
  const toggleButton = document.getElementById("session-toggle");
  const resetButton = document.getElementById("session-reset");
  const progress = document.getElementById("session-progress");
  const announce = document.getElementById("session-announce");

  let practiceKey = "resonant";
  let minutes = 5;
  let running = false;
  let phaseIndex = 0;
  let phaseRemaining = 0;
  let sessionRemaining = 0;
  let tickTimer = 0;
  let lastTick = 0;

  const formatClock = (totalSeconds) => {
    const whole = Math.max(0, Math.ceil(totalSeconds));
    const m = Math.floor(whole / 60);
    const s = whole % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const selectChip = (group, chip) => {
    group.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-checked", String(c === chip)));
  };

  const setVesselPhase = (phase) => {
    vessel.style.setProperty("--phase-seconds", `${phase.seconds}s`);
    vessel.style.transitionDuration = `${phase.seconds}s`;
    VESSEL_CLASSES.forEach((cls) => vessel.classList.remove(cls));
    // Force a reflow so back-to-back identical classes still restart cleanly.
    void vessel.offsetWidth;
    vessel.classList.add(phase.cls);
  };

  const restVessel = () => {
    vessel.style.transitionDuration = "1.2s";
    VESSEL_CLASSES.forEach((cls) => vessel.classList.remove(cls));
    vessel.classList.add("is-out");
  };

  const enterPhase = (index) => {
    const practice = PRACTICES[practiceKey];
    phaseIndex = index % practice.phases.length;
    const phase = practice.phases[phaseIndex];
    phaseRemaining = phase.seconds;
    phaseLabel.textContent = phase.name;
    phaseCount.textContent = String(Math.ceil(phaseRemaining));
    setVesselPhase(phase);
  };

  const finishSession = () => {
    stopTicking();
    running = false;
    restVessel();
    phaseLabel.textContent = "Complete";
    phaseCount.textContent = " ";
    progress.textContent = "Session complete. Stay a moment before you go.";
    announce.textContent = "Session complete.";
    toggleButton.textContent = "Begin again";
    resetButton.hidden = true;
  };

  const stopTicking = () => {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = 0;
    }
  };

  const tick = () => {
    const now = performance.now();
    const delta = Math.min(1.5, (now - lastTick) / 1000);
    lastTick = now;

    sessionRemaining -= delta;
    phaseRemaining -= delta;

    if (sessionRemaining <= 0) {
      finishSession();
      return;
    }
    if (phaseRemaining <= 0) {
      enterPhase(phaseIndex + 1);
    } else {
      phaseCount.textContent = String(Math.ceil(phaseRemaining));
    }
    progress.textContent = `${PRACTICES[practiceKey].label} · ${formatClock(sessionRemaining)} remaining`;
  };

  const startSession = () => {
    running = true;
    sessionRemaining = minutes * 60;
    toggleButton.textContent = "Pause";
    resetButton.hidden = false;
    progress.textContent = `${PRACTICES[practiceKey].label} · ${formatClock(sessionRemaining)} remaining`;
    announce.textContent = `${PRACTICES[practiceKey].label} session started, ${minutes} minutes.`;
    enterPhase(0);
    lastTick = performance.now();
    tickTimer = setInterval(tick, 200);
  };

  const pauseSession = () => {
    stopTicking();
    // Freeze the vessel where it is by clearing the transition target softly.
    phaseLabel.textContent = "Paused";
    toggleButton.textContent = "Resume";
    progress.textContent = `Paused · ${formatClock(sessionRemaining)} remaining`;
    announce.textContent = `Paused with ${formatClock(sessionRemaining)} remaining.`;
  };

  const resumeSession = () => {
    const phase = PRACTICES[practiceKey].phases[phaseIndex];
    phaseLabel.textContent = phase.name;
    lastTick = performance.now();
    tickTimer = setInterval(tick, 200);
    toggleButton.textContent = "Pause";
  };

  const resetSession = () => {
    stopTicking();
    running = false;
    restVessel();
    phaseLabel.textContent = "Ready";
    phaseCount.textContent = " ";
    progress.textContent = "";
    announce.textContent = "";
    toggleButton.textContent = "Begin a session";
    resetButton.hidden = true;
  };

  toggleButton.addEventListener("click", () => {
    if (!running) {
      startSession();
    } else if (tickTimer) {
      pauseSession();
    } else {
      resumeSession();
    }
  });

  resetButton.addEventListener("click", resetSession);

  practiceChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    selectChip(practiceChips, chip);
    practiceKey = chip.dataset.practice;
    blurb.textContent = PRACTICES[practiceKey].blurb;
    if (running) {
      enterPhase(0);
      progress.textContent = `${PRACTICES[practiceKey].label} · ${formatClock(sessionRemaining)} remaining`;
    }
  });

  lengthChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    selectChip(lengthChips, chip);
    minutes = Number(chip.dataset.minutes);
    if (!running) progress.textContent = "";
  });

  document.querySelectorAll("[data-begin]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.begin;
      const chip = practiceChips.querySelector(`[data-practice="${key}"]`);
      if (chip) selectChip(practiceChips, chip);
      practiceKey = key;
      blurb.textContent = PRACTICES[key].blurb;
      resetSession();
      document.getElementById("session").scrollIntoView({ block: "start" });
      startSession();
    });
  });
})();
