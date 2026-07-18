(() => {
  "use strict";

  /* ---------- Study motifs (Web Audio, fully offline) ---------- */

  // Each tune: scale degrees in semitones from the root, root frequency,
  // note length in seconds, and a simple timbre choice.
  const TUNES = {
    andes:      { root: 392.0, steps: [0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 12], dur: 0.28, wave: "triangle" },
    sahel:      { root: 261.6, steps: [0, 3, 5, 7, 10, 7, 5, 3, 0, 5, 7, 3],  dur: 0.24, wave: "sawtooth" },
    appalachia: { root: 293.7, steps: [0, 2, 3, 7, 10, 7, 3, 2, 0, 3, 7, 10], dur: 0.34, wave: "triangle" },
    balkans:    { root: 329.6, steps: [0, 1, 4, 5, 7, 8, 11, 8, 7, 5, 4, 1],  dur: 0.2,  wave: "sawtooth" },
    mekong:     { root: 349.2, steps: [0, 2, 5, 7, 9, 7, 5, 2, 0, 5, 9, 7],   dur: 0.3,  wave: "sine" },
    hebrides:   { root: 311.1, steps: [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0, 7],  dur: 0.32, wave: "triangle" },
  };

  let audioCtx = null;
  let current = null; // { card, nodes: [], timer }

  const stopCurrent = () => {
    if (!current) return;
    current.nodes.forEach((node) => {
      try { node.stop(); } catch (error) { /* already stopped */ }
    });
    clearTimeout(current.timer);
    current.card.classList.remove("is-playing");
    current.card.querySelector(".play").setAttribute("aria-pressed", "false");
    current = null;
  };

  const playTune = (card, name) => {
    const tune = TUNES[name];
    if (!tune) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const master = audioCtx.createGain();
    master.gain.value = 0.16;
    master.connect(audioCtx.destination);

    const start = audioCtx.currentTime + 0.05;
    const nodes = [];
    // Two passes through the motif, gently plucked.
    const sequence = tune.steps.concat(tune.steps);
    sequence.forEach((step, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = start + index * tune.dur;
      osc.type = tune.wave;
      osc.frequency.value = tune.root * Math.pow(2, step / 12);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + tune.dur * 1.6);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + tune.dur * 1.7);
      nodes.push(osc);
    });

    const totalMs = (sequence.length * tune.dur + 0.8) * 1000;
    card.classList.add("is-playing");
    card.querySelector(".play").setAttribute("aria-pressed", "true");
    current = { card, nodes, timer: setTimeout(stopCurrent, totalMs) };
  };

  const cards = Array.from(document.querySelectorAll(".recording"));
  cards.forEach((card) => {
    const button = card.querySelector(".play");
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const wasThis = current && current.card === card;
      stopCurrent();
      if (!wasThis) playTune(card, card.dataset.tune);
    });
  });

  /* ---------- Region filtering ---------- */

  const chips = Array.from(document.querySelectorAll(".chip"));
  const emptyNote = document.getElementById("empty-note");

  const applyFilter = (region) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = region === "all" || card.dataset.region === region;
      card.hidden = !match;
      card.classList.toggle("is-highlighted", match && region !== "all");
      if (match) shown += 1;
    });
    emptyNote.hidden = shown > 0;
    chips.forEach((chip) => {
      const active = chip.dataset.region === region;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.region));
  });

  /* ---------- Map markers and legend ---------- */

  const markers = Array.from(document.querySelectorAll(".marker"));
  const legendButtons = Array.from(document.querySelectorAll(".legend-btn"));

  const selectRegion = (region) => {
    markers.forEach((marker) => {
      marker.classList.toggle("is-active", marker.dataset.region === region);
    });
    legendButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.region === region);
    });
    applyFilter(region);
    document.getElementById("recordings").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  markers.forEach((marker) => {
    const label = marker.querySelector("text").textContent;
    marker.setAttribute("role", "button");
    marker.setAttribute("tabindex", "0");
    marker.setAttribute("aria-label", `Show recordings from ${label}`);
    marker.addEventListener("click", () => selectRegion(marker.dataset.region));
    marker.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectRegion(marker.dataset.region);
      }
    });
  });

  legendButtons.forEach((button) => {
    button.addEventListener("click", () => selectRegion(button.dataset.region));
  });

  /* ---------- Pause audio when viewer pull-dismisses the page ---------- */
  document.addEventListener("sitegeist:pull-state", (event) => {
    if (event.detail && event.detail.active) stopCurrent();
  });
})();
