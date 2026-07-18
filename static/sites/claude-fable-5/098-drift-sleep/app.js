(() => {
  "use strict";

  /* ---------- Breath pacer: 4s inhale, 6s exhale ---------- */

  const ring = document.getElementById("breathRing");
  const phaseLabel = document.getElementById("breathPhase");
  const toggle = document.getElementById("breathToggle");
  const countLabel = document.getElementById("breathCount");

  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;

  let breathing = false;
  let breathTimer = 0;
  let rounds = 0;

  const setPhase = (name, text) => {
    ring.classList.remove("inhale", "exhale");
    if (name) ring.classList.add(name);
    phaseLabel.textContent = text;
  };

  const inhale = () => {
    setPhase("inhale", "Breathe in… 2… 3… 4");
    breathTimer = window.setTimeout(exhale, INHALE_MS);
  };

  const exhale = () => {
    setPhase("exhale", "And out… slowly… all the way");
    breathTimer = window.setTimeout(() => {
      rounds += 1;
      countLabel.textContent = rounds === 1 ? "1 round completed" : rounds + " rounds completed";
      inhale();
    }, EXHALE_MS);
  };

  toggle.addEventListener("click", () => {
    breathing = !breathing;
    toggle.setAttribute("aria-pressed", String(breathing));
    if (breathing) {
      toggle.textContent = "Pause breathing";
      inhale();
    } else {
      window.clearTimeout(breathTimer);
      toggle.textContent = "Begin breathing";
      setPhase(null, "Paused — resume whenever you like");
    }
  });

  /* ---------- Soundscapes: generated locally with Web Audio ---------- */

  const chips = Array.from(document.querySelectorAll(".sound-chip"));
  const volumeInput = document.getElementById("volume");
  const soundNote = document.getElementById("soundNote");

  let audioContext = null;
  let masterGain = null;
  let currentNodes = [];
  let currentSound = null;

  const volumeValue = () => (Number(volumeInput.value) / 100) * 0.5;

  const ensureContext = () => {
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      audioContext = new Ctx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = volumeValue();
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return true;
  };

  const noiseBuffer = () => {
    const length = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  };

  const startNoiseVoice = (filterType, frequency, q, gainLevel) => {
    const source = audioContext.createBufferSource();
    source.buffer = noiseBuffer();
    source.loop = true;
    const filter = audioContext.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = audioContext.createGain();
    gain.gain.value = gainLevel;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    return { stop: () => source.stop(), filter, gain };
  };

  const builders = {
    rain: () => {
      const body = startNoiseVoice("lowpass", 900, 0.6, 0.8);
      const patter = startNoiseVoice("bandpass", 2600, 1.2, 0.18);
      return [body, patter];
    },
    wind: () => {
      const gust = startNoiseVoice("bandpass", 400, 1.6, 0.9);
      const lfo = audioContext.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = audioContext.createGain();
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain);
      lfoGain.connect(gust.filter.frequency);
      lfo.start();
      return [gust, { stop: () => lfo.stop() }];
    },
    hum: () => {
      const voices = [55, 110, 165].map((freq, index) => {
        const osc = audioContext.createOscillator();
        osc.type = index === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        const gain = audioContext.createGain();
        gain.gain.value = [0.5, 0.18, 0.05][index];
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        return { stop: () => osc.stop() };
      });
      return voices;
    },
  };

  const labels = {
    rain: "Night rain is playing — soft static with a distant patter.",
    wind: "High wind is playing — slow gusts that rise and fall.",
    hum: "Deep hum is playing — three low tones settling together.",
  };

  const stopSound = () => {
    currentNodes.forEach((node) => {
      try { node.stop(); } catch { /* already stopped */ }
    });
    currentNodes = [];
    currentSound = null;
    chips.forEach((chip) => chip.setAttribute("aria-pressed", "false"));
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const kind = chip.dataset.sound;
      if (currentSound === kind) {
        stopSound();
        soundNote.textContent = "Soundscape stopped. Pick another texture anytime.";
        return;
      }
      if (!ensureContext()) {
        soundNote.textContent = "Audio isn't available in this browser, but every texture ships with the app.";
        return;
      }
      stopSound();
      currentSound = kind;
      currentNodes = builders[kind]();
      chip.setAttribute("aria-pressed", "true");
      soundNote.textContent = labels[kind];
    });
  });

  volumeInput.addEventListener("input", () => {
    if (masterGain) {
      masterGain.gain.setTargetAtTime(volumeValue(), audioContext.currentTime, 0.05);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && currentSound) {
      stopSound();
      soundNote.textContent = "Soundscape paused while the page was away.";
    }
  });
})();
