(() => {
  "use strict";

  const practices = {
    softwave: {
      id: "softwave",
      name: "Soft Wave",
      blurb: "A gentle rising and falling breath for settling the nervous system.",
      durationMin: 3,
      phases: [
        { name: "Inhale", seconds: 4, scale: 1.15, cue: "Breathe in slowly through the nose." },
        { name: "Exhale", seconds: 6, scale: 0.82, cue: "Let the breath leave without forcing." },
      ],
      color: "#6f8268",
    },
    box: {
      id: "box",
      name: "Still Box",
      blurb: "Equal counts for balance — inhale, hold, exhale, hold.",
      durationMin: 4,
      phases: [
        { name: "Inhale", seconds: 4, scale: 1.12, cue: "Fill the lungs evenly." },
        { name: "Hold", seconds: 4, scale: 1.12, cue: "Rest at the top. Soften the jaw." },
        { name: "Exhale", seconds: 4, scale: 0.8, cue: "Release through the mouth or nose." },
        { name: "Hold", seconds: 4, scale: 0.8, cue: "Empty pause. Keep the shoulders easy." },
      ],
      color: "#b8926a",
    },
    stillpoint: {
      id: "stillpoint",
      name: "Still Point",
      blurb: "Longer exhales to arrive in quiet awareness.",
      durationMin: 5,
      phases: [
        { name: "Inhale", seconds: 4, scale: 1.1, cue: "Draw a quiet breath in." },
        { name: "Hold", seconds: 2, scale: 1.1, cue: "A brief still moment." },
        { name: "Exhale", seconds: 8, scale: 0.78, cue: "Lengthen the exhale. Let the body settle." },
      ],
      color: "#8a847a",
    },
    evening: {
      id: "evening",
      name: "Evening Softening",
      blurb: "A slower cadence for the last light of the day.",
      durationMin: 6,
      phases: [
        { name: "Inhale", seconds: 5, scale: 1.08, cue: "Inhale softly into the belly." },
        { name: "Exhale", seconds: 7, scale: 0.8, cue: "Exhale as if dimming a lamp." },
      ],
      color: "#9aab9e",
    },
  };

  const els = {
    session: document.getElementById("session-panel"),
    sessionTitle: document.getElementById("session-title"),
    sessionDesc: document.getElementById("session-desc"),
    phaseLabel: document.getElementById("phase-label"),
    breathCircle: document.getElementById("breath-circle"),
    cue: document.getElementById("cue-text"),
    timeLeft: document.getElementById("time-left"),
    cycleCount: document.getElementById("cycle-count"),
    phaseTime: document.getElementById("phase-time"),
    progressBar: document.getElementById("progress-bar"),
    btnStart: document.getElementById("btn-start"),
    btnPause: document.getElementById("btn-pause"),
    btnReset: document.getElementById("btn-reset"),
    btnClose: document.getElementById("btn-close-session"),
    live: document.getElementById("live-region"),
    practiceButtons: document.querySelectorAll("[data-practice]"),
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let state = {
    practice: null,
    running: false,
    started: false,
    totalMs: 0,
    elapsedMs: 0,
    phaseIndex: 0,
    phaseElapsedMs: 0,
    cycles: 0,
    lastTs: 0,
    raf: 0,
  };

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function announce(message) {
    if (!els.live) return;
    els.live.textContent = message;
  }

  function setCircleScale(scale, durationMs) {
    if (!els.breathCircle) return;
    if (reducedMotion) {
      els.breathCircle.style.transition = "none";
      els.breathCircle.style.transform = `scale(${scale})`;
      return;
    }
    els.breathCircle.style.transition = durationMs
      ? `transform ${durationMs}ms linear, background 0.6s ease`
      : "transform 0.4s ease, background 0.6s ease";
    els.breathCircle.style.transform = `scale(${scale})`;
  }

  function currentPhase() {
    if (!state.practice) return null;
    return state.practice.phases[state.phaseIndex];
  }

  function applyPhase(phase, announcePhase) {
    if (!phase) return;
    els.phaseLabel.textContent = phase.name;
    els.cue.innerHTML = `<strong>${phase.name}.</strong> ${phase.cue}`;
    els.phaseTime.textContent = formatTime(phase.seconds * 1000 - state.phaseElapsedMs);
    setCircleScale(phase.scale, phase.seconds * 1000);
    if (announcePhase) {
      announce(`${phase.name}. ${phase.cue}`);
    }
  }

  function updateHud() {
    const remaining = state.totalMs - state.elapsedMs;
    els.timeLeft.textContent = formatTime(remaining);
    els.cycleCount.textContent = String(state.cycles);
    const phase = currentPhase();
    if (phase) {
      const phaseLeft = phase.seconds * 1000 - state.phaseElapsedMs;
      els.phaseTime.textContent = formatTime(phaseLeft);
    }
    const pct = state.totalMs > 0 ? Math.min(100, (state.elapsedMs / state.totalMs) * 100) : 0;
    els.progressBar.style.width = `${pct}%`;
    els.progressBar.parentElement.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  function advancePhase() {
    if (!state.practice) return;
    state.phaseElapsedMs = 0;
    state.phaseIndex += 1;
    if (state.phaseIndex >= state.practice.phases.length) {
      state.phaseIndex = 0;
      state.cycles += 1;
    }
    applyPhase(currentPhase(), true);
  }

  function tick(ts) {
    if (!state.running) return;
    if (!state.lastTs) state.lastTs = ts;
    const delta = ts - state.lastTs;
    state.lastTs = ts;

    state.elapsedMs += delta;
    state.phaseElapsedMs += delta;

    const phase = currentPhase();
    if (phase && state.phaseElapsedMs >= phase.seconds * 1000) {
      const overflow = state.phaseElapsedMs - phase.seconds * 1000;
      advancePhase();
      state.phaseElapsedMs = overflow;
    }

    if (state.elapsedMs >= state.totalMs) {
      state.elapsedMs = state.totalMs;
      updateHud();
      completeSession();
      return;
    }

    updateHud();
    state.raf = requestAnimationFrame(tick);
  }

  function completeSession() {
    state.running = false;
    state.started = false;
    cancelAnimationFrame(state.raf);
    els.phaseLabel.textContent = "Complete";
    els.cue.innerHTML = "<strong>Session complete.</strong> Take a moment before returning to your day.";
    setCircleScale(0.92, 800);
    els.btnStart.disabled = false;
    els.btnStart.textContent = "Begin again";
    els.btnPause.disabled = true;
    els.btnPause.textContent = "Pause";
    announce("Session complete. Take a moment before returning to your day.");
  }

  function openSession(id) {
    const practice = practices[id];
    if (!practice) return;

    stopSession(true);
    state.practice = practice;
    state.totalMs = practice.durationMin * 60 * 1000;
    state.elapsedMs = 0;
    state.phaseIndex = 0;
    state.phaseElapsedMs = 0;
    state.cycles = 0;
    state.started = false;
    state.running = false;

    els.session.classList.add("is-active");
    els.sessionTitle.textContent = practice.name;
    els.sessionDesc.textContent = practice.blurb;
    els.breathCircle.style.background =
      `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.6), transparent 52%), ` +
      `linear-gradient(155deg, ${practice.color}, #4f5e49)`;
    els.btnStart.disabled = false;
    els.btnStart.textContent = "Begin";
    els.btnPause.disabled = true;
    els.btnPause.textContent = "Pause";
    els.progressBar.style.width = "0%";

    applyPhase(currentPhase(), false);
    updateHud();
    els.phaseLabel.textContent = "Ready";
    els.cue.innerHTML = `<strong>Ready when you are.</strong> ${practice.blurb}`;

    els.session.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    els.btnStart.focus();
    announce(`${practice.name} session ready. ${practice.durationMin} minutes.`);
  }

  function startSession() {
    if (!state.practice) return;
    if (state.elapsedMs >= state.totalMs) {
      state.elapsedMs = 0;
      state.phaseIndex = 0;
      state.phaseElapsedMs = 0;
      state.cycles = 0;
    }
    state.running = true;
    state.started = true;
    state.lastTs = 0;
    els.btnStart.disabled = true;
    els.btnStart.textContent = "Begin";
    els.btnPause.disabled = false;
    els.btnPause.textContent = "Pause";
    els.breathCircle.classList.add("is-running");
    applyPhase(currentPhase(), true);
    state.raf = requestAnimationFrame(tick);
  }

  function pauseSession() {
    if (!state.running) return;
    state.running = false;
    cancelAnimationFrame(state.raf);
    els.btnStart.disabled = false;
    els.btnStart.textContent = "Resume";
    els.btnPause.disabled = true;
    announce("Session paused.");
  }

  function stopSession(silent) {
    state.running = false;
    cancelAnimationFrame(state.raf);
    state.lastTs = 0;
    if (!silent) {
      announce("Session closed.");
    }
  }

  function resetSession() {
    if (!state.practice) return;
    stopSession(true);
    state.elapsedMs = 0;
    state.phaseIndex = 0;
    state.phaseElapsedMs = 0;
    state.cycles = 0;
    state.started = false;
    els.btnStart.disabled = false;
    els.btnStart.textContent = "Begin";
    els.btnPause.disabled = true;
    els.btnPause.textContent = "Pause";
    els.breathCircle.classList.remove("is-running");
    applyPhase(currentPhase(), false);
    updateHud();
    els.phaseLabel.textContent = "Ready";
    els.cue.innerHTML = `<strong>Ready when you are.</strong> ${state.practice.blurb}`;
    announce("Session reset.");
  }

  function closeSession() {
    stopSession(false);
    els.session.classList.remove("is-active");
    state.practice = null;
    const firstCard = document.querySelector("[data-practice]");
    if (firstCard) firstCard.focus();
  }

  els.practiceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      openSession(btn.getAttribute("data-practice"));
    });
  });

  els.btnStart.addEventListener("click", startSession);
  els.btnPause.addEventListener("click", pauseSession);
  els.btnReset.addEventListener("click", resetSession);
  els.btnClose.addEventListener("click", closeSession);

  document.querySelectorAll('a[href="#practices"]').forEach((link) => {
    link.addEventListener("click", () => {
      // native hash navigation handles the rest
    });
  });

  document.getElementById("btn-begin-hero")?.addEventListener("click", () => {
    openSession("softwave");
  });

  // Keyboard: Space on focused start/pause when session open
  document.addEventListener("keydown", (event) => {
    if (!els.session.classList.contains("is-active")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeSession();
    }
  });
})();
