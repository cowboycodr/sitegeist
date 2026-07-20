(() => {
  "use strict";

  // Gentle forward-kinematics animation for the hero arm diagram.
  const seg1 = document.getElementById("seg1");
  const seg2 = document.getElementById("seg2");
  const seg3 = document.getElementById("seg3");
  const joint2 = document.getElementById("joint2");
  const joint3 = document.getElementById("joint3");
  const effector = document.getElementById("effector");
  const trace = document.getElementById("trace");
  if (!seg1 || !seg2 || !seg3 || !joint2 || !joint3 || !effector || !trace) return;

  const BASE_X = 210;
  const BASE_Y = 308;
  const L1 = 110;
  const L2 = 95;
  const L3 = 44;
  const tracePoints = [];
  const TRACE_MAX = 90;

  const pose = (t) => {
    // Slow, overlapping sine sweeps so the arm looks deliberate, not busy.
    const a1 = -Math.PI / 2 + 0.45 * Math.sin(t * 0.00035);
    const a2 = a1 + 0.9 + 0.55 * Math.sin(t * 0.00052 + 1.2);
    const a3 = a2 + 0.4 + 0.5 * Math.sin(t * 0.00078 + 2.4);

    const x1 = BASE_X + L1 * Math.cos(a1);
    const y1 = BASE_Y + L1 * Math.sin(a1);
    const x2 = x1 + L2 * Math.cos(a2);
    const y2 = y1 + L2 * Math.sin(a2);
    const x3 = x2 + L3 * Math.cos(a3);
    const y3 = y2 + L3 * Math.sin(a3);
    return { x1, y1, x2, y2, x3, y3 };
  };

  const apply = ({ x1, y1, x2, y2, x3, y3 }) => {
    seg1.setAttribute("x2", x1.toFixed(1));
    seg1.setAttribute("y2", y1.toFixed(1));
    seg2.setAttribute("x1", x1.toFixed(1));
    seg2.setAttribute("y1", y1.toFixed(1));
    seg2.setAttribute("x2", x2.toFixed(1));
    seg2.setAttribute("y2", y2.toFixed(1));
    seg3.setAttribute("x1", x2.toFixed(1));
    seg3.setAttribute("y1", y2.toFixed(1));
    seg3.setAttribute("x2", x3.toFixed(1));
    seg3.setAttribute("y2", y3.toFixed(1));
    joint2.setAttribute("cx", x1.toFixed(1));
    joint2.setAttribute("cy", y1.toFixed(1));
    joint3.setAttribute("cx", x2.toFixed(1));
    joint3.setAttribute("cy", y2.toFixed(1));
    effector.setAttribute("cx", x3.toFixed(1));
    effector.setAttribute("cy", y3.toFixed(1));
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  const tick = (t) => {
    const p = pose(t);
    apply(p);
    tracePoints.push([p.x3, p.y3]);
    if (tracePoints.length > TRACE_MAX) tracePoints.shift();
    trace.setAttribute(
      "d",
      tracePoints
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
        .join(" "),
    );
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    tracePoints.length = 0;
    trace.setAttribute("d", "");
    apply(pose(4200)); // settle into a pleasant static pose
  };

  const sync = () => (reducedMotion.matches ? stop() : start());
  reducedMotion.addEventListener("change", sync);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else {
      sync();
    }
  });

  sync();
})();
