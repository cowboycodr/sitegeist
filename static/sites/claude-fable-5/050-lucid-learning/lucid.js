/* Lucid interactive labs */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Hero: drifting light rings (ambient, skipped on reduced motion) ---------- */
  const heroCanvas = document.getElementById("hero-canvas");
  if (heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    const S = heroCanvas.width;
    const drawHero = (t) => {
      ctx.clearRect(0, 0, S, S);
      const cx = S / 2;
      const cy = S / 2;
      for (let i = 0; i < 7; i += 1) {
        const phase = t * 0.00035 + i * 0.9;
        const r = 60 + i * 38 + Math.sin(phase) * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 ? "rgba(239, 99, 81, 0.5)" : "rgba(36, 31, 78, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        const a = phase * 0.6;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? "#ffd166" : "#0f8b8d";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.fillStyle = "#241f4e";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd166";
      ctx.fill();
    };
    if (reducedMotion.matches) {
      drawHero(4200);
    } else {
      const loop = (t) => {
        drawHero(t);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Lab 1: wave anatomy ---------- */
  const waveFreq = document.getElementById("wave-freq");
  const waveAmp = document.getElementById("wave-amp");
  const wavePath = document.getElementById("wave-path");
  const waveReadout = document.getElementById("wave-readout");
  const drawWave = () => {
    const f = parseFloat(waveFreq.value);
    const a = parseFloat(waveAmp.value);
    const points = [];
    for (let x = 0; x <= 480; x += 4) {
      const y = 130 - Math.sin(((x - 240) / 480) * Math.PI * 2 * f) * a * 70;
      points.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
    }
    wavePath.setAttribute("d", points.join(" "));
    waveReadout.textContent = `y = ${a.toFixed(1)} · sin(${f.toFixed(1)}x)`;
  };
  if (wavePath) {
    waveFreq.addEventListener("input", drawWave);
    waveAmp.addEventListener("input", drawWave);
    drawWave();
  }

  /* ---------- Lab 2: pendulum ---------- */
  const pendLength = document.getElementById("pend-length");
  const pendGravity = document.getElementById("pend-gravity");
  const pendReadout = document.getElementById("pend-readout");
  const pendRod = document.getElementById("pend-rod");
  const pendBob = document.getElementById("pend-bob");
  const pendToggle = document.getElementById("pend-toggle");
  if (pendRod) {
    const pivotX = 240;
    const pivotY = 24;
    const maxAngle = Math.PI / 5;
    let running = !reducedMotion.matches;
    let phase = 0;
    let lastTime = null;

    const period = () =>
      2 * Math.PI * Math.sqrt(parseFloat(pendLength.value) / parseFloat(pendGravity.value));

    const setPendulum = (angle) => {
      const px = 80 * parseFloat(pendLength.value) + 80; // 0.3–2 m → 104–240 px
      const x = pivotX + Math.sin(angle) * px;
      const y = pivotY + Math.cos(angle) * px;
      pendRod.setAttribute("x2", x.toFixed(1));
      pendRod.setAttribute("y2", y.toFixed(1));
      pendBob.setAttribute("cx", x.toFixed(1));
      pendBob.setAttribute("cy", y.toFixed(1));
    };

    const updateReadout = () => {
      pendReadout.textContent = `Period ≈ ${period().toFixed(2)} s`;
    };

    const tick = (time) => {
      if (lastTime !== null && running) {
        phase += ((time - lastTime) / 1000) * ((Math.PI * 2) / period());
        setPendulum(Math.sin(phase) * maxAngle);
      }
      lastTime = time;
      requestAnimationFrame(tick);
    };

    const syncToggle = () => {
      pendToggle.textContent = running ? "Pause swing" : "Play swing";
      pendToggle.setAttribute("aria-pressed", String(running));
    };

    pendToggle.addEventListener("click", () => {
      running = !running;
      syncToggle();
    });
    pendLength.addEventListener("input", () => {
      updateReadout();
      if (!running) setPendulum(Math.sin(phase) * maxAngle);
    });
    pendGravity.addEventListener("input", updateReadout);

    setPendulum(Math.sin(0.8) * maxAngle);
    phase = 0.8;
    updateReadout();
    syncToggle();
    requestAnimationFrame(tick);
  }

  /* ---------- Lab 3: refraction ---------- */
  const snellAngle = document.getElementById("snell-angle");
  const snellIndex = document.getElementById("snell-index");
  const snellIn = document.getElementById("snell-in");
  const snellOut = document.getElementById("snell-out");
  const snellReadout = document.getElementById("snell-readout");
  if (snellIn) {
    const hitX = 240;
    const hitY = 150;
    const drawSnell = () => {
      const theta1 = (parseFloat(snellAngle.value) * Math.PI) / 180;
      const n = parseFloat(snellIndex.value);
      const theta2 = Math.asin(Math.min(1, Math.sin(theta1) / n));
      const inLen = 140;
      const outLen = 135;
      snellIn.setAttribute("x1", (hitX - Math.sin(theta1) * inLen).toFixed(1));
      snellIn.setAttribute("y1", (hitY - Math.cos(theta1) * inLen).toFixed(1));
      snellOut.setAttribute("x2", (hitX + Math.sin(theta2) * outLen).toFixed(1));
      snellOut.setAttribute("y2", (hitY + Math.cos(theta2) * outLen).toFixed(1));
      snellReadout.textContent =
        `${Math.round(parseFloat(snellAngle.value))}° in air → ` +
        `${Math.round((theta2 * 180) / Math.PI)}° in the medium`;
    };
    snellAngle.addEventListener("input", drawSnell);
    snellIndex.addEventListener("input", drawSnell);
    drawSnell();
  }
})();
