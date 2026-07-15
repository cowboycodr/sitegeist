"use strict";

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------------- *
   * Shared station model (all data generated locally, no network)  *
   * -------------------------------------------------------------- */
  const stations = [
    { id: "monterey", name: "Monterey Canyon", coord: "36.60° N · 122.03° W — depth 890 m",
      x: 88, y: 150, status: "ok", species: "Blue whale · 17 Hz call", base: 30, bands: [0.9, 0.2, 0.15, 0.35] },
    { id: "azores", name: "Azores Ridge", coord: "38.52° N · 28.63° W — depth 1240 m",
      x: 300, y: 128, status: "ok", species: "Sperm whale · echolocation clicks", base: 210, bands: [0.3, 0.5, 0.8, 0.6] },
    { id: "hebrides", name: "Inner Hebrides", coord: "56.30° N · 6.20° W — depth 140 m",
      x: 268, y: 70, status: "warn", species: "Harbour porpoise · narrowband clicks", base: 520, bands: [0.15, 0.35, 0.55, 0.95] },
    { id: "reef", name: "Great Barrier Reef", coord: "18.28° S · 147.70° E — depth 30 m",
      x: 552, y: 232, status: "ok", species: "Snapping shrimp · reef chorus", base: 700, bands: [0.4, 0.6, 0.7, 0.9] },
    { id: "kaikoura", name: "Kaikōura Trench", coord: "42.42° S · 173.70° E — depth 1600 m",
      x: 596, y: 268, status: "off", species: "Station in maintenance", base: 90, bands: [0.6, 0.3, 0.2, 0.2] },
  ];

  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

  /* -------------------------------------------------------------- *
   * Hero waveform                                                  *
   * -------------------------------------------------------------- */
  (function heroWave() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;

    function size() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr());
      canvas.height = Math.round(h * dpr());
      ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    const layers = [
      { amp: 0.16, freq: 1.6, speed: 0.5, color: "rgba(53,212,196,0.55)", width: 2 },
      { amp: 0.11, freq: 2.7, speed: -0.8, color: "rgba(79,184,255,0.4)", width: 1.6 },
      { amp: 0.07, freq: 4.1, speed: 1.2, color: "rgba(166,255,122,0.35)", width: 1.2 },
    ];

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const mid = h * 0.62;
      for (const L of layers) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const p = x / w;
          const envelope = Math.sin(p * Math.PI); // fade at edges
          const y = mid +
            Math.sin(p * Math.PI * 2 * L.freq + t * L.speed) * h * L.amp * envelope +
            Math.sin(p * Math.PI * 2 * L.freq * 2.3 + t * L.speed * 1.7) * h * L.amp * 0.35 * envelope;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = L.color;
        ctx.lineWidth = L.width;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    }

    if (reduceMotion) {
      draw(1.2);
    } else {
      let raf;
      const loop = () => { draw(performance.now() / 1000); raf = requestAnimationFrame(loop); };
      loop();
      window.addEventListener("resize", () => { cancelAnimationFrame(raf); loop(); });
    }
  })();

  /* -------------------------------------------------------------- *
   * Hero count-up                                                  *
   * -------------------------------------------------------------- */
  (function counts() {
    const els = document.querySelectorAll(".hero-stats dd[data-count]");
    const fmt = (n) => {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
      return Math.round(n).toLocaleString("en-US");
    };
    els.forEach((el) => {
      const target = Number(el.getAttribute("data-count"));
      if (reduceMotion) { el.textContent = fmt(target); return; }
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  })();

  /* -------------------------------------------------------------- *
   * Spectrogram scope                                              *
   * -------------------------------------------------------------- */
  (function scope() {
    const canvas = document.getElementById("scopeCanvas");
    const list = document.getElementById("stationList");
    if (!canvas || !list) return;
    const ctx = canvas.getContext("2d");
    const nameEl = document.getElementById("scopeName");
    const metaEl = document.getElementById("scopeMeta");
    const speciesEl = document.getElementById("scopeSpecies");
    const toggle = document.getElementById("playToggle");
    const playLabel = document.getElementById("playLabel");

    let current = stations[0];
    let playing = !reduceMotion;
    let col = 0;
    let w = 0, h = 0;
    const ROWS = 64;

    // Build station buttons
    stations.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "station-btn";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.dataset.id = s.id;
      b.innerHTML = `<span class="sb-name"></span><span class="sb-sub"></span>`;
      b.querySelector(".sb-name").textContent = s.name;
      b.querySelector(".sb-sub").textContent =
        s.status === "off" ? "Maintenance" : s.status === "warn" ? "Elevated noise" : "Streaming";
      b.addEventListener("click", () => select(s.id));
      list.appendChild(b);
    });

    function size() {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.round(r.height);
      canvas.width = Math.round(w * dpr());
      canvas.height = Math.round(h * dpr());
      ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0);
      clear();
    }

    function clear() {
      ctx.fillStyle = "#04121a";
      ctx.fillRect(0, 0, w, h);
      col = 0;
    }

    // Intensity at a frequency row for the current station and time.
    function intensity(row, t) {
      const s = current;
      const f = row / ROWS; // 0 = low freq, 1 = high
      let v = 0;
      // four broad bands emphasised per station
      for (let b = 0; b < 4; b++) {
        const center = (b + 0.5) / 4;
        const g = Math.exp(-Math.pow((f - center) / 0.13, 2));
        v += s.bands[b] * g;
      }
      // moving tonal call sweeping slowly
      if (s.status !== "off") {
        const callFreq = 0.12 + 0.06 * Math.sin(t * 0.6 + s.base);
        v += Math.exp(-Math.pow((f - callFreq) / 0.03, 2)) * (0.6 + 0.4 * Math.sin(t * 3 + s.base));
        // click transients at high freq
        const click = Math.sin(t * 22 + row + s.base) > 0.86 ? 0.5 : 0;
        v += click * f * s.bands[3];
      } else {
        v *= 0.25;
      }
      v += (Math.sin(row * 12.9 + t * 40) * 0.5 + 0.5) * 0.08; // texture noise
      return Math.min(1, v);
    }

    function color(v) {
      // deep -> teal -> phosphor mapping
      if (v < 0.35) {
        const p = v / 0.35;
        return `rgb(${6 + p * 8},${20 + p * 60},${40 + p * 60})`;
      } else if (v < 0.7) {
        const p = (v - 0.35) / 0.35;
        return `rgb(${14 + p * 20},${80 + p * 132},${100 + p * 96})`;
      }
      const p = (v - 0.7) / 0.3;
      return `rgb(${34 + p * 132},${212 + p * 43},${196 - p * 74})`;
    }

    function drawColumn(t) {
      const rowH = h / ROWS;
      const x = col;
      for (let r = 0; r < ROWS; r++) {
        const v = intensity(ROWS - 1 - r, t);
        ctx.fillStyle = color(v);
        ctx.fillRect(x, r * rowH, 2, rowH + 1);
      }
      col += 2;
      if (col >= w) {
        // shift left by copying — simple wrap to keep it scrolling
        const img = ctx.getImageData(2 * dpr(), 0, canvas.width - 2 * dpr(), canvas.height);
        ctx.putImageData(img, 0, 0);
        col = w - 2;
      }
    }

    function renderStatic() {
      clear();
      const t = 2.0;
      for (let x = 0; x < w; x += 2) {
        col = x;
        drawColumnStatic(x, t + x * 0.02);
      }
    }
    function drawColumnStatic(x, t) {
      const rowH = h / ROWS;
      for (let r = 0; r < ROWS; r++) {
        const v = intensity(ROWS - 1 - r, t);
        ctx.fillStyle = color(v);
        ctx.fillRect(x, r * rowH, 2, rowH + 1);
      }
    }

    function select(id) {
      const s = stations.find((x) => x.id === id);
      if (!s) return;
      current = s;
      nameEl.textContent = s.name;
      metaEl.textContent = s.coord;
      speciesEl.textContent = s.species;
      list.querySelectorAll(".station-btn").forEach((b) => {
        b.setAttribute("aria-selected", b.dataset.id === id ? "true" : "false");
      });
      const off = s.status === "off";
      if (off) { setPlaying(false); toggle.disabled = false; }
      if (reduceMotion || !playing) renderStatic();
    }

    function setPlaying(on) {
      playing = on;
      toggle.setAttribute("aria-pressed", String(on));
      playLabel.textContent = on ? "Streaming" : "Paused";
    }

    toggle.addEventListener("click", () => {
      if (reduceMotion) { renderStatic(); return; }
      setPlaying(!playing);
      if (playing) loopStart();
    });

    size();
    window.addEventListener("resize", () => { size(); if (reduceMotion || !playing) renderStatic(); });

    let raf = 0;
    function frame() {
      if (!playing) { raf = 0; return; }
      drawColumn(performance.now() / 1000);
      raf = requestAnimationFrame(frame);
    }
    function loopStart() { if (!raf) frame(); }

    if (reduceMotion) {
      setPlaying(false);
      renderStatic();
    } else {
      setPlaying(true);
      loopStart();
    }
  })();

  /* -------------------------------------------------------------- *
   * Network map nodes                                              *
   * -------------------------------------------------------------- */
  (function map() {
    const g = document.getElementById("mapNodes");
    const note = document.getElementById("mapNote");
    if (!g) return;
    const SVGNS = "http://www.w3.org/2000/svg";

    const statusText = {
      ok: "streaming · nominal noise floor",
      warn: "streaming · elevated vessel noise",
      off: "offline · scheduled maintenance",
    };

    stations.forEach((s) => {
      const node = document.createElementNS(SVGNS, "g");
      node.setAttribute("class", "map-node " + (s.status === "ok" ? "" : s.status));
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", `${s.name}: ${statusText[s.status]}`);

      if (s.status === "ok") {
        const pulse = document.createElementNS(SVGNS, "circle");
        pulse.setAttribute("class", "pulse");
        pulse.setAttribute("cx", s.x); pulse.setAttribute("cy", s.y); pulse.setAttribute("r", 7);
        node.appendChild(pulse);
      }
      const core = document.createElementNS(SVGNS, "circle");
      core.setAttribute("class", "core");
      core.setAttribute("cx", s.x); core.setAttribute("cy", s.y); core.setAttribute("r", 5);
      node.appendChild(core);

      const show = () => {
        note.innerHTML = `<strong>${s.name}</strong> — ${statusText[s.status]}`;
      };
      node.addEventListener("mouseenter", show);
      node.addEventListener("focus", show);
      node.addEventListener("click", show);
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); }
      });
      g.appendChild(node);
    });
  })();

  /* -------------------------------------------------------------- *
   * Data chart                                                     *
   * -------------------------------------------------------------- */
  (function chart() {
    const svg = document.getElementById("chart");
    const legend = document.getElementById("legend");
    if (!svg) return;
    const SVGNS = "http://www.w3.org/2000/svg";
    const W = 720, H = 300, padL = 44, padR = 16, padT = 20, padB = 34;
    const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];

    const series = [
      { key: "mammal", label: "Marine mammal detections", color: "#35d4c4", on: true,
        data: [42, 48, 55, 61, 70, 66, 58, 63, 74, 82, 71, 60] },
      { key: "noise", label: "Vessel noise index", color: "#4fb8ff", on: true,
        data: [58, 60, 57, 52, 46, 44, 49, 55, 51, 47, 43, 40] },
    ];

    const maxV = 100;
    const xAt = (i) => padL + (i / (months.length - 1)) * (W - padL - padR);
    const yAt = (v) => padT + (1 - v / maxV) * (H - padT - padB);

    function render() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // grid + y labels
      for (let v = 0; v <= 100; v += 25) {
        const y = yAt(v);
        const line = document.createElementNS(SVGNS, "line");
        line.setAttribute("class", "axis");
        line.setAttribute("x1", padL); line.setAttribute("x2", W - padR);
        line.setAttribute("y1", y); line.setAttribute("y2", y);
        line.setAttribute("opacity", v === 0 ? "0.6" : "0.25");
        svg.appendChild(line);
        const lbl = document.createElementNS(SVGNS, "text");
        lbl.setAttribute("x", padL - 8); lbl.setAttribute("y", y + 3);
        lbl.setAttribute("text-anchor", "end");
        lbl.textContent = v;
        svg.appendChild(lbl);
      }
      // x labels
      months.forEach((m, i) => {
        const t = document.createElementNS(SVGNS, "text");
        t.setAttribute("x", xAt(i)); t.setAttribute("y", H - padB + 18);
        t.setAttribute("text-anchor", "middle");
        t.textContent = m;
        svg.appendChild(t);
      });

      series.forEach((s) => {
        if (!s.on) return;
        // area
        let d = `M ${xAt(0)} ${yAt(s.data[0])}`;
        s.data.forEach((v, i) => { if (i) d += ` L ${xAt(i)} ${yAt(v)}`; });
        const area = document.createElementNS(SVGNS, "path");
        area.setAttribute("d", d + ` L ${xAt(11)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`);
        area.setAttribute("fill", s.color);
        area.setAttribute("opacity", "0.1");
        svg.appendChild(area);

        const path = document.createElementNS(SVGNS, "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", s.color);
        path.setAttribute("stroke-width", "2.5");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-linecap", "round");
        svg.appendChild(path);

        if (!reduceMotion) {
          const len = path.getTotalLength ? path.getTotalLength() : 0;
          if (len) {
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
            path.style.transition = "stroke-dashoffset 1.2s ease-out";
            requestAnimationFrame(() => { path.style.strokeDashoffset = "0"; });
          }
        }

        s.data.forEach((v, i) => {
          const c = document.createElementNS(SVGNS, "circle");
          c.setAttribute("cx", xAt(i)); c.setAttribute("cy", yAt(v)); c.setAttribute("r", 2.6);
          c.setAttribute("fill", s.color);
          svg.appendChild(c);
        });
      });
    }

    series.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-pressed", "true");
      b.innerHTML = `<span class="swatch"></span><span></span>`;
      b.querySelector(".swatch").style.background = s.color;
      b.querySelector("span:last-child").textContent = s.label;
      b.addEventListener("click", () => {
        s.on = !s.on;
        b.setAttribute("aria-pressed", String(s.on));
        render();
      });
      legend.appendChild(b);
    });

    render();
  })();
})();
