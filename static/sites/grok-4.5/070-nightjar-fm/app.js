(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile nav */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    const setNav = (open) => {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      siteNav.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNav(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNav(false);
    });
  }

  /* Schedule tabs */
  const tabs = Array.from(document.querySelectorAll(".schedule-toolbar [role='tab']"));
  const panels = {
    "tab-tonight": document.getElementById("panel-tonight"),
    "tab-midweek": document.getElementById("panel-midweek"),
    "tab-weekend": document.getElementById("panel-weekend"),
  };

  const activateTab = (tab) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
      const panel = panels[item.id];
      if (panel) {
        panel.hidden = !selected;
        panel.classList.toggle("is-active", selected);
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        event.preventDefault();
        next.focus();
        activateTab(next);
      }
    });
  });

  /* Offline ambient player via Web Audio API */
  const playBtn = document.getElementById("play-btn");
  const volumeInput = document.getElementById("volume");
  const statusPill = document.getElementById("status-pill");
  const statusDetail = document.getElementById("status-detail");
  const iconPlay = playBtn ? playBtn.querySelector(".icon-play") : null;
  const iconPause = playBtn ? playBtn.querySelector(".icon-pause") : null;

  let audioCtx = null;
  let masterGain = null;
  let oscillators = [];
  let noiseNodes = [];
  let isPlaying = false;

  const stopSignal = () => {
    oscillators.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (_) {
        /* already stopped */
      }
    });
    noiseNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (_) {
        /* already stopped */
      }
    });
    oscillators = [];
    noiseNodes = [];
  };

  const createNoiseBuffer = (ctx) => {
    const duration = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    return buffer;
  };

  const startSignal = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      statusDetail.textContent = "Audio is unavailable in this browser";
      return false;
    }

    if (!audioCtx) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
    }

    stopSignal();

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const vol = volumeInput ? Number(volumeInput.value) / 100 : 0.55;
    masterGain.gain.setValueAtTime(Math.max(0.0001, vol * 0.22), audioCtx.currentTime);

    const partials = [
      { freq: 55, type: "sine", gain: 0.35 },
      { freq: 82.5, type: "sine", gain: 0.18 },
      { freq: 110, type: "triangle", gain: 0.08 },
      { freq: 165, type: "sine", gain: 0.05 },
    ];

    partials.forEach((partial, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();

      osc.type = partial.type;
      osc.frequency.value = partial.freq;

      lfo.type = "sine";
      lfo.frequency.value = 0.03 + index * 0.015;
      lfoGain.gain.value = partial.freq * 0.004;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.value = partial.gain;
      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      lfo.start();
      oscillators.push(osc, lfo);
    });

    const noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer(audioCtx);
    noise.loop = true;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 480;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.028;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    noiseNodes.push(noise);

    return true;
  };

  const setPlayingUi = (playing) => {
    isPlaying = playing;
    document.body.classList.toggle("is-playing", playing);

    if (statusPill) {
      statusPill.dataset.state = playing ? "live" : "idle";
      statusPill.textContent = playing ? "On air" : "Standby";
    }
    if (statusDetail) {
      statusDetail.textContent = playing
        ? "Local night signal is open"
        : "Press play to open the night signal";
    }
    if (playBtn) {
      playBtn.setAttribute("aria-label", playing ? "Pause live signal" : "Play live signal");
    }
    if (iconPlay) iconPlay.hidden = playing;
    if (iconPause) iconPause.hidden = !playing;
  };

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (isPlaying) {
        stopSignal();
        if (audioCtx && audioCtx.state === "running") {
          audioCtx.suspend();
        }
        setPlayingUi(false);
        return;
      }

      const ok = startSignal();
      if (ok) setPlayingUi(true);
    });
  }

  if (volumeInput) {
    const syncVolume = () => {
      const value = Number(volumeInput.value);
      volumeInput.setAttribute("aria-valuenow", String(value));
      if (masterGain && audioCtx) {
        masterGain.gain.setTargetAtTime(
          Math.max(0.0001, (value / 100) * 0.22),
          audioCtx.currentTime,
          0.03,
        );
      }
    };
    volumeInput.addEventListener("input", syncVolume);
  }

  /* Deep-link CTA focuses player after scroll */
  const ctaListen = document.getElementById("cta-listen");
  if (ctaListen && playBtn) {
    ctaListen.addEventListener("click", () => {
      window.setTimeout(() => {
        playBtn.focus({ preventScroll: reducedMotion });
      }, reducedMotion ? 0 : 350);
    });
  }
})();
