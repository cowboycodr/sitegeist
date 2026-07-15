(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- scroll reveal ---------- */
  const revealables = Array.from(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window) || reduce.matches) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ---------- interactive kinetic arm ---------- */
  const slider = document.getElementById("pose");
  const readout = document.getElementById("poseval");
  const upper = document.getElementById("upper");
  const fore = document.getElementById("fore");
  const wristg = document.getElementById("wristg");
  const jawL = document.getElementById("jawL");
  const jawR = document.getElementById("jawR");
  const arc = document.getElementById("arc");

  if (!slider || !upper || !fore || !wristg) return;

  const SHOULDER = { x: 200, y: 234 };
  const UPPER_LEN = 92; // elbow offset within upper frame
  const FORE_LEN = 80; // wrist offset within fore frame

  const rot = (px, py, deg) => {
    const t = (deg * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    return { x: px * c - py * s, y: px * s + py * c };
  };

  // forward kinematics for the reach-arc envelope
  const tipAt = (u) => {
    const a1 = -42 + u * 74;
    const a2 = 34 - u * 78;
    const elbow = rot(0, -UPPER_LEN, a1);
    const wrist = rot(0, -FORE_LEN, a1 + a2);
    return {
      x: SHOULDER.x + elbow.x + wrist.x,
      y: SHOULDER.y + elbow.y + wrist.y,
    };
  };

  if (arc) {
    let d = "";
    for (let i = 0; i <= 24; i += 1) {
      const p = tipAt(i / 24);
      d += (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1) + " ";
    }
    arc.setAttribute("d", d.trim());
  }

  const apply = (value) => {
    const u = Math.min(1, Math.max(0, value / 100));
    const a1 = -42 + u * 74;
    const a2 = 34 - u * 78;
    const a3 = -(a1 + a2) * 0.5;
    upper.setAttribute("transform", "rotate(" + a1.toFixed(2) + ")");
    fore.setAttribute("transform", "rotate(" + a2.toFixed(2) + ")");
    wristg.setAttribute("transform", "translate(0 -80) rotate(" + a3.toFixed(2) + ")");
    // grip opens toward the extremes of reach, closes mid-travel (a "grasp")
    const grip = 6 + Math.abs(u - 0.5) * 20;
    if (jawL) jawL.setAttribute("d", "M-4 -6 L" + (-4 - grip).toFixed(1) + " -20");
    if (jawR) jawR.setAttribute("d", "M4 -6 L" + (4 + grip).toFixed(1) + " -20");
    const deg = Math.round(20 + u * 140);
    if (readout) readout.textContent = deg + "°";
  };

  slider.addEventListener("input", (e) => apply(Number(e.target.value)));
  apply(Number(slider.value));

  /* ---------- gentle idle sway (motion-safe) ---------- */
  if (!reduce.matches) {
    let raf = 0;
    let touched = false;
    slider.addEventListener("pointerdown", () => { touched = true; cancelAnimationFrame(raf); }, { once: true });
    slider.addEventListener("keydown", () => { touched = true; cancelAnimationFrame(raf); }, { once: true });
    const start = performance.now();
    const loop = (now) => {
      if (touched) return;
      const t = (now - start) / 2600;
      const v = 42 + Math.sin(t) * 30;
      slider.value = String(Math.round(v));
      apply(v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
})();
