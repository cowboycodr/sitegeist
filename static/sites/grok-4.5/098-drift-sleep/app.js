(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Soundscapes (Web Audio, fully offline) ---------- */
  let audioCtx = null;
  let masterGain = null;
  let activeNodes = [];
  let activeSoundId = null;

  const volumeEl = document.getElementById("volume");
  const soundStatus = document.getElementById("sound-status");
  const soundButtons = Array.from(document.querySelectorAll("[data-sound]"));

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        if (soundStatus) soundStatus.textContent = "Audio is not supported in this browser.";
        return null;
      }
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = volumeEl ? Number(volumeEl.value) : 0.35;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function stopSound() {
    activeNodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop();
      } catch (_) {
        /* already stopped */
      }
      try {
        node.disconnect();
      } catch (_) {
        /* ignore */
      }
    });
    activeNodes = [];
    activeSoundId = null;
    soundButtons.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
    if (soundStatus) soundStatus.textContent = "Soundscape paused.";
  }

  function createNoiseBuffer(ctx, seconds, type) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      if (type === "brown") {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else if (type === "pink") {
        // Voss-McCartney-ish approximation via filtering white
        last = 0.98 * last + 0.02 * white;
        data[i] = (white + last) * 0.5;
      } else {
        data[i] = white;
      }
    }
    return buffer;
  }

  function playNoise(type, filterFreq, filterType, gainValue) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, 3, type);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType || "lowpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = gainValue;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    activeNodes.push(source, filter, gain);
  }

  function playTone(freq, type, gainValue, lfoRate, lfoDepth) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = type || "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.value = gainValue;

    if (lfoRate) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = lfoDepth || 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      activeNodes.push(lfo, lfoGain);
    }

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    activeNodes.push(osc, gain);
  }

  function startSoundscape(id) {
    stopSound();
    if (!ensureAudio()) return;

    const labels = {
      rain: "Soft rain",
      ocean: "Distant shore",
      night: "Night field",
      hush: "Warm hush",
    };

    if (id === "rain") {
      playNoise("pink", 1800, "lowpass", 0.28);
      playNoise("white", 4200, "highpass", 0.05);
    } else if (id === "ocean") {
      playNoise("brown", 420, "lowpass", 0.45);
      playTone(55, "sine", 0.03, 0.08, 0.02);
      playTone(82, "sine", 0.015, 0.05, 0.01);
    } else if (id === "night") {
      playNoise("pink", 900, "lowpass", 0.12);
      playTone(196, "sine", 0.012, 0.04, 0.008);
      playTone(293.66, "triangle", 0.006, 0.07, 0.004);
      playTone(392, "sine", 0.004, 0.03, 0.003);
    } else if (id === "hush") {
      playNoise("brown", 220, "lowpass", 0.35);
      playTone(65.4, "sine", 0.04, 0.06, 0.015);
      playTone(98, "sine", 0.02, 0.04, 0.01);
    }

    activeSoundId = id;
    soundButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-sound") === id ? "true" : "false");
    });
    if (soundStatus) {
      soundStatus.textContent = `Playing ${labels[id] || id}.`;
    }
  }

  soundButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-sound");
      if (activeSoundId === id) {
        stopSound();
        return;
      }
      startSoundscape(id);
    });
  });

  if (volumeEl) {
    volumeEl.addEventListener("input", () => {
      if (masterGain && audioCtx) {
        masterGain.gain.setTargetAtTime(Number(volumeEl.value), audioCtx.currentTime, 0.02);
      }
    });
  }

  const stopSoundBtn = document.getElementById("stop-sound");
  if (stopSoundBtn) {
    stopSoundBtn.addEventListener("click", () => stopSound());
  }

  /* ---------- Breath guide ---------- */
  const breathRing = document.getElementById("breath-ring");
  const breathPhase = document.getElementById("breath-phase");
  const breathCount = document.getElementById("breath-count");
  const breathStart = document.getElementById("breath-start");
  const breathStop = document.getElementById("breath-stop");
  const breathModeButtons = Array.from(document.querySelectorAll("[data-breath-mode]"));

  const modes = {
    rest: {
      label: "Rest",
      // inhale, hold, exhale, hold (seconds)
      phases: [
        { name: "Breathe in", seconds: 4 },
        { name: "Hold gently", seconds: 2 },
        { name: "Breathe out", seconds: 6 },
        { name: "Rest", seconds: 2 },
      ],
    },
    sleep: {
      label: "Sleep",
      phases: [
        { name: "Breathe in", seconds: 4 },
        { name: "Hold", seconds: 7 },
        { name: "Breathe out", seconds: 8 },
      ],
    },
    calm: {
      label: "Calm",
      phases: [
        { name: "Breathe in", seconds: 5 },
        { name: "Breathe out", seconds: 5 },
      ],
    },
  };

  let currentMode = "rest";
  let breathTimer = null;
  let breathRunning = false;
  let phaseIndex = 0;
  let secondsLeft = 0;
  let cycleCount = 0;

  function setBreathUI() {
    if (breathPhase) {
      if (!breathRunning) {
        breathPhase.textContent = "Ready when you are";
      }
    }
    if (breathCount) {
      breathCount.textContent = breathRunning
        ? `Cycle ${cycleCount} · ${secondsLeft}s`
        : `${modes[currentMode].label} pattern`;
    }
  }

  function clearBreathTimer() {
    if (breathTimer) {
      window.clearInterval(breathTimer);
      breathTimer = null;
    }
  }

  function stopBreath() {
    breathRunning = false;
    clearBreathTimer();
    if (breathRing) breathRing.classList.remove("is-active");
    if (breathStart) {
      breathStart.disabled = false;
      breathStart.setAttribute("aria-pressed", "false");
    }
    if (breathStop) breathStop.disabled = true;
    setBreathUI();
  }

  function tickBreath() {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      phaseIndex = (phaseIndex + 1) % modes[currentMode].phases.length;
      if (phaseIndex === 0) cycleCount += 1;
      const phase = modes[currentMode].phases[phaseIndex];
      secondsLeft = phase.seconds;
      if (breathPhase) breathPhase.textContent = phase.name;
    }
    if (breathCount) {
      breathCount.textContent = `Cycle ${cycleCount} · ${secondsLeft}s`;
    }
  }

  function startBreath() {
    ensureAudio(); // unlock on user gesture if needed later
    breathRunning = true;
    phaseIndex = 0;
    cycleCount = 1;
    const phase = modes[currentMode].phases[0];
    secondsLeft = phase.seconds;
    if (breathPhase) breathPhase.textContent = phase.name;
    if (breathRing && !prefersReducedMotion) {
      breathRing.classList.add("is-active");
    } else if (breathRing) {
      breathRing.classList.add("is-active");
    }
    if (breathStart) {
      breathStart.disabled = true;
      breathStart.setAttribute("aria-pressed", "true");
    }
    if (breathStop) breathStop.disabled = false;
    setBreathUI();
    clearBreathTimer();
    breathTimer = window.setInterval(tickBreath, 1000);
  }

  breathModeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMode = btn.getAttribute("data-breath-mode") || "rest";
      breathModeButtons.forEach((b) => {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      if (breathRunning) {
        stopBreath();
        startBreath();
      } else {
        setBreathUI();
      }
    });
  });

  if (breathStart) breathStart.addEventListener("click", startBreath);
  if (breathStop) breathStop.addEventListener("click", stopBreath);
  setBreathUI();

  /* ---------- Wind-down routine ---------- */
  const stepChecks = Array.from(document.querySelectorAll("[data-step-check]"));
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const startRoutineBtn = document.getElementById("start-routine");
  const resetRoutineBtn = document.getElementById("reset-routine");
  const liveRegion = document.getElementById("live-region");

  function updateProgress() {
    const total = stepChecks.length || 1;
    const done = stepChecks.filter((c) => c.checked).length;
    const pct = Math.round((done / total) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressLabel) {
      progressLabel.textContent = done === total ? "Routine complete" : `${done} of ${total} steps`;
    }
    if (liveRegion && done === total && total > 0) {
      liveRegion.textContent = "Wind-down routine complete. Rest well.";
    }
  }

  stepChecks.forEach((check) => {
    check.addEventListener("change", updateProgress);
  });

  if (resetRoutineBtn) {
    resetRoutineBtn.addEventListener("click", () => {
      stepChecks.forEach((c) => {
        c.checked = false;
      });
      updateProgress();
      if (liveRegion) liveRegion.textContent = "Routine reset.";
    });
  }

  if (startRoutineBtn) {
    startRoutineBtn.addEventListener("click", () => {
      const firstUnchecked = stepChecks.find((c) => !c.checked) || stepChecks[0];
      if (firstUnchecked) {
        firstUnchecked.focus();
        const card = firstUnchecked.closest(".routine-step");
        if (card) card.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
      }
      // Gentle default: start rest breath + hush soundscape
      if (!activeSoundId) startSoundscape("hush");
      if (!breathRunning) {
        currentMode = "sleep";
        breathModeButtons.forEach((b) => {
          b.setAttribute(
            "aria-pressed",
            b.getAttribute("data-breath-mode") === "sleep" ? "true" : "false"
          );
        });
        startBreath();
      }
      if (liveRegion) {
        liveRegion.textContent = "Wind-down started with sleep breathing and warm hush.";
      }
      const breathSection = document.getElementById("breath");
      if (breathSection) {
        // Keep focus path accessible without forcing jump every time
      }
    });
  }

  updateProgress();

  /* Secondary CTA: hear a soundscape */
  const hearSound = document.getElementById("hear-soundscape");
  if (hearSound) {
    hearSound.addEventListener("click", (event) => {
      event.preventDefault();
      const panel = document.getElementById("soundscapes");
      if (panel) {
        panel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
      if (!activeSoundId) startSoundscape("rain");
    });
  }

  /* Primary CTA smooth scroll already via href; enhance with focus */
  const windDownCta = document.getElementById("start-winding-down");
  if (windDownCta) {
    windDownCta.addEventListener("click", () => {
      // Handled by anchor; also nudge routine
      window.setTimeout(() => {
        if (startRoutineBtn) startRoutineBtn.focus();
      }, prefersReducedMotion ? 0 : 400);
    });
  }
})();
