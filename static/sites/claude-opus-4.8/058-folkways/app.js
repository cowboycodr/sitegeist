(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // --- Archive data -------------------------------------------------------
  const TRACKS = [
    { id: "millet", title: "Millet-Grinding Song", tradition: "Work Song", place: "Fouta Djallon, Guinea",
      region: "West Africa", note: "A call-and-response sung at dawn over the grinding stone.",
      len: 214, base: 174, color: "#c47a26", x: 96, y: 96 },
    { id: "long", title: "Long-Song of the Steppe", tradition: "Vocal", place: "Khangai Range, Mongolia",
      region: "Central Asia", note: "An unhurried melody that stretches a single vowel across the sky.",
      len: 331, base: 130, color: "#7f9a72", x: 300, y: 78 },
    { id: "hora", title: "Village Hora", tradition: "Dance", place: "Maramureș, Romania",
      region: "Eastern Europe", note: "Fiddle and voice for a circle dance in the church square.",
      len: 186, base: 220, color: "#b1502e", x: 214, y: 70 },
    { id: "keening", title: "Keening for the Tide", tradition: "Lament", place: "Connemara coast, Ireland",
      region: "Western Europe", note: "A shore lament, recorded as the fishing boats returned.",
      len: 258, base: 155, color: "#8a6db0", x: 178, y: 62 },
    { id: "pan", title: "Highland Panpipes", tradition: "Instrumental", place: "Altiplano, Bolivia",
      region: "South America", note: "Siku pipes traded breath for breath between two players.",
      len: 172, base: 262, color: "#4f9aa8", x: 118, y: 176 },
    { id: "gamelan", title: "Rain Gamelan", tradition: "Ensemble", place: "Central Java, Indonesia",
      region: "Southeast Asia", note: "Bronze metallophones shimmering under a monsoon roof.",
      len: 296, base: 196, color: "#d1a03a", x: 336, y: 168 },
    { id: "delta", title: "Delta Field Holler", tradition: "Blues", place: "Mississippi Delta, USA",
      region: "North America", note: "One voice across a cotton field, bent by the heat.",
      len: 148, base: 146, color: "#c9683e", x: 92, y: 82 },
    { id: "lullaby", title: "Mountain Lullaby", tradition: "Lullaby", place: "Svaneti, Georgia",
      region: "Central Asia", note: "Three voices braided close for a child who will not sleep.",
      len: 203, base: 165, color: "#9a8ac0", x: 256, y: 86 }
  ];

  const cardsEl = document.getElementById("cards");
  const filtersEl = document.getElementById("filters");
  const markersEl = document.getElementById("markers");
  const atlasCurrent = document.getElementById("atlas-current");

  let current = 0;
  let activeFilter = "All";

  // --- Collection cards ---------------------------------------------------
  function swatch(t) {
    return `linear-gradient(135deg, ${t.color}, #201826 140%)`;
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function renderCards() {
    cardsEl.innerHTML = "";
    TRACKS.forEach((t, i) => {
      if (activeFilter !== "All" && t.tradition !== activeFilter) return;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card";
      btn.setAttribute("aria-current", i === current ? "true" : "false");
      btn.innerHTML =
        `<span class="card-swatch" style="background:${swatch(t)}"></span>` +
        `<span class="card-tradition">${t.tradition}</span>` +
        `<span class="card-title">${t.title}</span>` +
        `<span class="card-place">${t.place}</span>` +
        `<span class="card-len">${fmt(t.len)}</span>`;
      btn.addEventListener("click", () => { select(i, true); });
      li.appendChild(btn);
      cardsEl.appendChild(li);
    });
  }

  function renderFilters() {
    const set = ["All", ...Array.from(new Set(TRACKS.map((t) => t.tradition)))];
    set.forEach((name) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = name;
      b.setAttribute("aria-pressed", name === activeFilter ? "true" : "false");
      b.addEventListener("click", () => {
        activeFilter = name;
        Array.from(filtersEl.children).forEach((c) =>
          c.setAttribute("aria-pressed", c === b ? "true" : "false"));
        renderCards();
      });
      filtersEl.appendChild(b);
    });
  }

  // --- Map markers --------------------------------------------------------
  const SVGNS = "http://www.w3.org/2000/svg";
  function renderMarkers() {
    TRACKS.forEach((t, i) => {
      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "marker");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `${t.title}, ${t.place}`);
      g.setAttribute("aria-current", i === current ? "true" : "false");
      const ring = document.createElementNS(SVGNS, "circle");
      ring.setAttribute("class", "ring");
      ring.setAttribute("cx", t.x); ring.setAttribute("cy", t.y); ring.setAttribute("r", 9);
      const dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("class", "dot");
      dot.setAttribute("cx", t.x); dot.setAttribute("cy", t.y); dot.setAttribute("r", 4);
      g.appendChild(ring); g.appendChild(dot);
      const activate = () => select(i, false);
      g.addEventListener("click", activate);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      });
      g.addEventListener("mouseenter", () => showPlace(t));
      g.addEventListener("focus", () => showPlace(t));
      markersEl.appendChild(g);
    });
  }

  function showPlace(t) {
    atlasCurrent.textContent = `${t.title} — ${t.place}`;
  }

  function syncCurrentMarkers() {
    Array.from(markersEl.children).forEach((g, i) =>
      g.setAttribute("aria-current", i === current ? "true" : "false"));
  }

  // --- Player -------------------------------------------------------------
  const els = {
    region: document.getElementById("player-region"),
    meta: document.getElementById("player-meta"),
    track: document.getElementById("player-track"),
    note: document.getElementById("player-note"),
    play: document.getElementById("play"),
    prev: document.getElementById("prev"),
    next: document.getElementById("next"),
    elapsed: document.getElementById("elapsed"),
    dur: document.getElementById("dur"),
    fill: document.getElementById("progress-fill"),
    canvas: document.getElementById("wave"),
    icPlay: null, icPause: null
  };
  els.icPlay = els.play.querySelector(".ic-play");
  els.icPause = els.play.querySelector(".ic-pause");
  const ctx2d = els.canvas.getContext("2d");

  let playing = false;
  let pos = 0;            // seconds elapsed in the current track
  let lastTs = 0;
  let rafId = 0;

  // Web Audio (created lazily on first play)
  let audio = null;
  function ensureAudio() {
    if (audio) return audio;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const c = new AC();
    const master = c.createGain();
    master.gain.value = 0.0001;
    master.connect(c.destination);
    audio = { c, master, voices: [] };
    return audio;
  }

  function stopVoices() {
    if (!audio) return;
    audio.voices.forEach((v) => { try { v.stop(); } catch (e) {} });
    audio.voices = [];
  }

  function startVoices() {
    if (!audio) return;
    const t = TRACKS[current];
    const now = audio.c.currentTime;
    const partials = [1, 2, 3, 4.02];
    const gains = [0.5, 0.24, 0.12, 0.06];
    partials.forEach((p, i) => {
      const osc = audio.c.createOscillator();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.value = t.base * p;
      const g = audio.c.createGain();
      g.gain.value = gains[i];
      // gentle vibrato for a "voice / field" feel
      const lfo = audio.c.createOscillator();
      lfo.frequency.value = 4.5 + i * 0.7;
      const lfoGain = audio.c.createGain();
      lfoGain.gain.value = t.base * p * 0.006;
      lfo.connect(lfoGain).connect(osc.frequency);
      osc.connect(g).connect(audio.master);
      osc.start(now); lfo.start(now);
      audio.voices.push(osc, lfo);
    });
  }

  function setMaster(target) {
    if (!audio) return;
    const g = audio.master.gain;
    g.cancelScheduledValues(audio.c.currentTime);
    g.setTargetAtTime(target, audio.c.currentTime, 0.15);
  }

  function loadTrack() {
    const t = TRACKS[current];
    els.region.textContent = t.region;
    els.meta.textContent = t.tradition + " · field recording";
    els.track.textContent = t.title;
    els.note.textContent = t.note;
    els.dur.textContent = fmt(t.len);
    pos = 0;
    updateProgress();
    drawWave(0);
    showPlace(t);
  }

  function updateProgress() {
    const t = TRACKS[current];
    els.elapsed.textContent = fmt(pos);
    els.fill.style.width = (pos / t.len * 100) + "%";
  }

  function play() {
    const a = ensureAudio();
    if (a && a.c.state === "suspended") a.c.resume();
    if (a) { stopVoices(); startVoices(); setMaster(0.16); }
    playing = true;
    els.play.setAttribute("aria-pressed", "true");
    els.play.setAttribute("aria-label", "Pause");
    els.icPlay.hidden = true; els.icPause.hidden = false;
    lastTs = performance.now();
    loop(lastTs);
  }

  function pause() {
    playing = false;
    els.play.setAttribute("aria-pressed", "false");
    els.play.setAttribute("aria-label", "Play");
    els.icPlay.hidden = false; els.icPause.hidden = true;
    setMaster(0.0001);
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    drawWave(0); // settle to a static frame
  }

  function toggle() { playing ? pause() : play(); }

  function select(i, scrollToPlayer) {
    const wasPlaying = playing;
    if (playing) { setMaster(0.0001); stopVoices(); }
    current = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    loadTrack();
    syncCurrentMarkers();
    renderCards();
    if (wasPlaying) { startVoices(); setMaster(0.16); }
    if (scrollToPlayer && !reduceMotion.matches) {
      document.getElementById("player").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // --- Visualization ------------------------------------------------------
  function drawWave(phase) {
    const t = TRACKS[current];
    const c = ctx2d;
    const w = els.canvas.width, h = els.canvas.height;
    c.clearRect(0, 0, w, h);
    const mid = h / 2;
    const bars = 64;
    const bw = w / bars;
    const progress = t.len ? pos / t.len : 0;
    for (let i = 0; i < bars; i++) {
      // deterministic pseudo-waveform seeded by track base + index
      const seed = Math.sin(i * 12.9898 + t.base) * 43758.5453;
      const rnd = seed - Math.floor(seed);
      const env = 0.35 + 0.65 * Math.abs(Math.sin(i / bars * Math.PI));
      const pulse = playing ? (0.6 + 0.4 * Math.sin(phase * 0.004 + i * 0.5)) : 0.7;
      let amp = (0.2 + rnd * 0.8) * env * pulse;
      const bh = amp * (h * 0.44);
      const played = i / bars <= progress;
      c.fillStyle = played ? t.color : "rgba(244,234,216,0.22)";
      const x = i * bw + bw * 0.15;
      const bwid = bw * 0.7;
      c.fillRect(x, mid - bh, bwid, bh * 2);
    }
    // playhead
    c.fillStyle = "rgba(244,234,216,0.6)";
    c.fillRect(progress * w - 1, 8, 2, h - 16);
  }

  function loop(ts) {
    if (!playing) return;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    pos += dt;
    const t = TRACKS[current];
    if (pos >= t.len) { select(current + 1, false); if (playing) { /* continue */ } }
    updateProgress();
    if (!reduceMotion.matches) drawWave(ts);
    else drawWave(0);
    rafId = requestAnimationFrame(loop);
  }

  // --- Wiring -------------------------------------------------------------
  els.play.addEventListener("click", toggle);
  els.prev.addEventListener("click", () => select(current - 1, false));
  els.next.addEventListener("click", () => select(current + 1, false));

  // keyboard: space/arrows when focus is inside the player group
  document.getElementById("player").addEventListener("keydown", (e) => {
    if (e.target.closest("button")) return; // let buttons handle themselves
    if (e.key === "ArrowRight") { e.preventDefault(); select(current + 1, false); }
    if (e.key === "ArrowLeft") { e.preventDefault(); select(current - 1, false); }
  });

  // Canvas keeps a fixed logical size (640x180); CSS scales it to fit.
  window.addEventListener("resize", () => { if (!playing) drawWave(0); });

  reduceMotion.addEventListener?.("change", () => { if (playing) drawWave(0); });

  // Init
  renderFilters();
  renderCards();
  renderMarkers();
  loadTrack();
})();
