(() => {
  "use strict";

  /* ---- Mobile navigation ---- */
  const navToggle = document.getElementById("navToggle");
  const navList = document.getElementById("navList");

  navToggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navList.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navList.classList.contains("open")) {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });

  /* ---- Generative noise bloom player ---- */
  const playButton = document.getElementById("playButton");
  const playLabel = document.getElementById("playLabel");
  const meterBars = Array.from(document.querySelectorAll("#meter span"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let audioContext = null;
  let stopPlayback = null;
  let meterFrame = 0;

  const idleMeter = () => {
    meterBars.forEach((bar) => {
      bar.style.height = "12%";
      bar.style.opacity = "0.35";
    });
  };

  const animateMeter = (analyser, data) => {
    analyser.getByteFrequencyData(data);
    const step = Math.floor(data.length / meterBars.length);
    meterBars.forEach((bar, index) => {
      const value = data[index * step] / 255;
      bar.style.height = `${Math.max(12, value * 100)}%`;
      bar.style.opacity = String(0.35 + value * 0.65);
    });
    meterFrame = requestAnimationFrame(() => animateMeter(analyser, data));
  };

  const stop = () => {
    if (stopPlayback) {
      stopPlayback();
      stopPlayback = null;
    }
    cancelAnimationFrame(meterFrame);
    meterFrame = 0;
    idleMeter();
    playButton.setAttribute("aria-pressed", "false");
    playLabel.textContent = "Play a noise bloom";
  };

  const start = () => {
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        playLabel.textContent = "Audio not supported here";
        playButton.disabled = true;
        return;
      }
      audioContext = new Ctx();
    }
    audioContext.resume();

    const now = audioContext.currentTime;
    const duration = 30;

    /* pink-ish noise buffer */
    const bufferLength = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferLength, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferLength; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + 0.029 * white;
      b1 = 0.985 * b1 + 0.049 * white;
      b2 = 0.95 * b2 + 0.09 * white;
      channel[i] = (b0 + b1 + b2 + white * 0.05) * 0.4;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration * 0.6);
    filter.frequency.exponentialRampToValueAtTime(220, now + duration);

    /* slow drone underneath */
    const drone = audioContext.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 55;
    const droneGain = audioContext.createGain();
    droneGain.gain.value = 0.06;

    const master = audioContext.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.5, now + 4);
    master.gain.setValueAtTime(0.5, now + duration - 5);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    const data = new Uint8Array(analyser.frequencyBinCount);

    noise.connect(filter);
    filter.connect(master);
    drone.connect(droneGain);
    droneGain.connect(master);
    master.connect(analyser);
    analyser.connect(audioContext.destination);

    noise.start(now);
    drone.start(now);
    noise.stop(now + duration);
    drone.stop(now + duration);
    noise.onended = stop;

    stopPlayback = () => {
      noise.onended = null;
      try {
        noise.stop();
        drone.stop();
      } catch (error) {
        /* already stopped */
      }
      master.disconnect();
      analyser.disconnect();
    };

    playButton.setAttribute("aria-pressed", "true");
    playLabel.textContent = "Stop the bloom";
    if (!reducedMotion.matches) {
      meterFrame = requestAnimationFrame(() => animateMeter(analyser, data));
    } else {
      meterBars.forEach((bar) => {
        bar.style.height = "55%";
        bar.style.opacity = "0.8";
      });
    }
  };

  playButton.addEventListener("click", () => {
    if (stopPlayback) {
      stop();
    } else {
      start();
    }
  });

  idleMeter();
})();
