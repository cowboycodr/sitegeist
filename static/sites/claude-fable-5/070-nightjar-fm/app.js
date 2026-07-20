(() => {
  "use strict";

  const toggle = document.getElementById("live-toggle");
  const status = document.getElementById("live-status");
  const visualizer = document.getElementById("visualizer");
  const trackTitle = document.getElementById("track-title");
  const bars = visualizer ? Array.from(visualizer.children) : [];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const tracks = [
    "Cassia Vault — Sodium Lamps at Four",
    "Erding Loop — Fen Static",
    "M. Ostrava — Hours Without Names",
    "Glass Harbor Trio — Slow Tide, Slower",
    "Weft — Antenna Lullaby",
    "Perihelion Club — The Long Corridor",
  ];

  let playing = false;
  let barTimer = 0;
  let trackTimer = 0;
  let trackIndex = 0;

  const settleBars = () => {
    bars.forEach((bar) => {
      bar.style.height = "12%";
    });
  };

  const danceBars = () => {
    bars.forEach((bar) => {
      bar.style.height = `${15 + Math.round(Math.random() * 80)}%`;
    });
  };

  const startVisualizer = () => {
    if (reducedMotion.matches) {
      // Static "on" state: a fixed waveform instead of animation.
      bars.forEach((bar, index) => {
        bar.style.height = `${25 + ((index * 37) % 55)}%`;
      });
      return;
    }
    danceBars();
    barTimer = window.setInterval(danceBars, 220);
  };

  const stopVisualizer = () => {
    window.clearInterval(barTimer);
    barTimer = 0;
    settleBars();
  };

  const rotateTrack = () => {
    trackIndex = (trackIndex + 1) % tracks.length;
    if (trackTitle) trackTitle.textContent = tracks[trackIndex];
  };

  const setPlaying = (next) => {
    playing = next;
    document.body.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.textContent = playing ? "Tune out" : "Tune in";
    if (playing) {
      status.textContent = "Receiving 104.4 MHz — you are listening to Nightjar FM.";
      startVisualizer();
      trackTimer = window.setInterval(rotateTrack, 12000);
    } else {
      status.textContent = "Receiver idle — press Tune in to join the broadcast.";
      stopVisualizer();
      window.clearInterval(trackTimer);
      trackTimer = 0;
    }
  };

  if (toggle && status && bars.length) {
    settleBars();
    toggle.addEventListener("click", () => setPlaying(!playing));
    reducedMotion.addEventListener("change", () => {
      if (playing) {
        stopVisualizer();
        startVisualizer();
      }
    });
  }
})();
