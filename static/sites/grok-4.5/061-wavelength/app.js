(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const form = document.getElementById("access-form");
  const formStatus = document.getElementById("form-status");
  const playButtons = document.querySelectorAll("[data-play]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile nav */
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        toggle.focus();
      }
    });
  }

  /* Simulated local “recordings” — Web Audio tones, no network */
  let audioCtx = null;
  let activeNode = null;
  let activeGain = null;
  let activeId = null;
  let stopTimer = null;

  const profiles = {
    "blue-whale": { freq: 52, type: "sine", duration: 2.4, harmonic: 0.35 },
    "reef-chorus": { freq: 220, type: "triangle", duration: 2.0, harmonic: 0.55 },
    "ship-lane": { freq: 95, type: "sawtooth", duration: 1.8, harmonic: 0.2 },
    "ice-calving": { freq: 140, type: "square", duration: 1.6, harmonic: 0.15 },
  };

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function stopPlayback() {
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    if (activeGain && audioCtx) {
      try {
        activeGain.gain.cancelScheduledValues(audioCtx.currentTime);
        activeGain.gain.setValueAtTime(activeGain.gain.value, audioCtx.currentTime);
        activeGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      } catch (_) {
        /* ignore */
      }
    }
    if (activeNode) {
      try {
        activeNode.stop(audioCtx ? audioCtx.currentTime + 0.1 : 0);
      } catch (_) {
        /* ignore */
      }
    }
    activeNode = null;
    activeGain = null;
    activeId = null;

    playButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
      btn.closest(".recording")?.classList.remove("is-playing");
      const label = btn.getAttribute("data-label") || "Play sample";
      btn.setAttribute("aria-label", label);
      const icon = btn.querySelector("[data-icon]");
      if (icon) icon.innerHTML = playIcon();
    });
  }

  function playIcon() {
    return '<polygon points="8,5 20,12 8,19" fill="currentColor"/>';
  }

  function stopIcon() {
    return '<rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor"/>';
  }

  function playSample(id, button) {
    const profile = profiles[id];
    if (!profile) return;

    if (activeId === id) {
      stopPlayback();
      return;
    }

    stopPlayback();

    const ctx = ensureAudio();
    if (!ctx) {
      button.setAttribute("aria-pressed", "true");
      button.closest(".recording")?.classList.add("is-playing");
      button.setAttribute("aria-label", "Stop sample");
      const icon = button.querySelector("[data-icon]");
      if (icon) icon.innerHTML = stopIcon();
      stopTimer = setTimeout(stopPlayback, profile.duration * 1000);
      activeId = id;
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = profile.type;
    osc.frequency.setValueAtTime(profile.freq, now);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(profile.freq * (1 + profile.harmonic), now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(profile.freq * 4, now);
    filter.Q.setValueAtTime(0.7, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.05, now + profile.duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + profile.duration + 0.05);
    osc2.stop(now + profile.duration + 0.05);

    activeNode = osc;
    activeGain = gain;
    activeId = id;

    button.setAttribute("aria-pressed", "true");
    button.closest(".recording")?.classList.add("is-playing");
    button.setAttribute("aria-label", "Stop sample");
    const icon = button.querySelector("[data-icon]");
    if (icon) icon.innerHTML = stopIcon();

    stopTimer = setTimeout(stopPlayback, profile.duration * 1000 + 50);
  }

  playButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-play");
      playSample(id, btn);
    });
  });

  /* Local access request — no network, form-action none */
  if (form && formStatus) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.querySelector("#email");
      const interest = form.querySelector("#interest");
      const value = email ? email.value.trim() : "";
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!valid) {
        formStatus.dataset.kind = "error";
        formStatus.textContent = "Enter a valid email so we can note your request locally.";
        email?.focus();
        return;
      }

      formStatus.dataset.kind = "ok";
      const topic = interest ? interest.options[interest.selectedIndex].text : "open data";
      formStatus.textContent =
        "Request recorded on this device for " + topic.toLowerCase() + ". No data left this browser.";
      form.reset();
    });
  }

  /* Subtle waveform animation when motion is allowed */
  if (!reduceMotion) {
    const waveA = document.getElementById("wave-a");
    const waveB = document.getElementById("wave-b");
    if (waveA && waveB) {
      let t = 0;
      let frame;

      function path(amplitude, freq, phase, mid) {
        const points = [];
        const w = 520;
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * w;
          const y =
            mid +
            Math.sin(i * freq + phase) * amplitude +
            Math.sin(i * freq * 2.1 + phase * 1.3) * (amplitude * 0.35);
          points.push((i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1));
        }
        return points.join(" ");
      }

      function tick() {
        t += 0.04;
        waveA.setAttribute("d", path(22, 0.28, t, 70));
        waveB.setAttribute("d", path(14, 0.42, t * 1.15 + 1, 70));
        frame = requestAnimationFrame(tick);
      }

      frame = requestAnimationFrame(tick);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          cancelAnimationFrame(frame);
        } else {
          frame = requestAnimationFrame(tick);
        }
      });
    }
  }

  /* Clock for panel timestamp */
  const clock = document.getElementById("panel-clock");
  if (clock) {
    function updateClock() {
      const now = new Date();
      clock.textContent = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    }
    updateClock();
    setInterval(updateClock, 1000);
  }
})();
