(() => {
  "use strict";

  /* ---------- Heliograph sun dial ---------- */
  const svgNS = "http://www.w3.org/2000/svg";
  const CX = 160, CY = 200, R = 130;
  const orb = document.getElementById("sun-orb");
  const rays = document.getElementById("rays");
  const ticks = document.getElementById("arc-ticks");
  const hour = document.getElementById("hour");
  const hourOut = document.getElementById("hour-out");

  const posFor = (t) => {
    // t: 0 (sunrise, left) .. 1 (sunset, right); arc over the top
    const angle = Math.PI - t * Math.PI;
    return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
  };

  if (ticks) {
    for (let i = 0; i <= 12; i += 1) {
      const p1 = posFor(i / 12);
      const angle = Math.PI - (i / 12) * Math.PI;
      const inner = 0.93;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", (CX + R * inner * Math.cos(angle)).toFixed(1));
      line.setAttribute("y1", (CY - R * inner * Math.sin(angle)).toFixed(1));
      line.setAttribute("x2", p1.x.toFixed(1));
      line.setAttribute("y2", p1.y.toFixed(1));
      ticks.appendChild(line);
    }
  }

  const drawRays = () => {
    if (!rays) return;
    while (rays.firstChild) rays.removeChild(rays.firstChild);
    const cx = parseFloat(orb.getAttribute("cx"));
    const cy = parseFloat(orb.getAttribute("cy"));
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", (cx + 24 * Math.cos(a)).toFixed(1));
      line.setAttribute("y1", (cy + 24 * Math.sin(a)).toFixed(1));
      line.setAttribute("x2", (cx + 34 * Math.cos(a)).toFixed(1));
      line.setAttribute("y2", (cy + 34 * Math.sin(a)).toFixed(1));
      rays.appendChild(line);
    }
  };

  const labelFor = (t) => {
    if (t <= 0.08) return "Dawn · low sun";
    if (t < 0.3) return "Morning · rising output";
    if (t < 0.45) return "Late morning · strong";
    if (t <= 0.55) return "Noon · full irradiance";
    if (t < 0.72) return "Afternoon · strong";
    if (t < 0.92) return "Evening · falling output";
    return "Dusk · low sun";
  };

  const updateDial = () => {
    const t = hour.value / 100;
    const p = posFor(t);
    orb.setAttribute("cx", p.x.toFixed(1));
    orb.setAttribute("cy", p.y.toFixed(1));
    const intensity = Math.sin(t * Math.PI);
    orb.setAttribute("r", (12 + intensity * 10).toFixed(1));
    orb.style.opacity = (0.55 + intensity * 0.45).toFixed(2);
    drawRays();
    if (hourOut) hourOut.textContent = labelFor(t);
  };

  if (hour && orb) {
    hour.addEventListener("input", updateDial);
    updateDial();
  }

  /* ---------- System estimator ---------- */
  const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const area = document.getElementById("area");
  const sun = document.getElementById("sun");
  const rate = document.getElementById("rate");

  const areaOut = document.getElementById("area-out");
  const sunOut = document.getElementById("sun-out");
  const rateOut = document.getElementById("rate-out");

  const rKw = document.getElementById("r-kw");
  const rKwh = document.getElementById("r-kwh");
  const rSave = document.getElementById("r-save");

  const WATT_PER_M2 = 190;       // module density
  const PERFORMANCE_RATIO = 0.8; // real-world derate

  const updateCalc = () => {
    const a = parseFloat(area.value);
    const s = parseFloat(sun.value);
    const r = parseFloat(rate.value);

    const kw = (a * WATT_PER_M2) / 1000;
    const kwh = kw * s * 365 * PERFORMANCE_RATIO;
    const save = kwh * r;

    if (areaOut) areaOut.textContent = nf0.format(a) + " m²";
    if (sunOut) sunOut.textContent = s.toFixed(1) + " h";
    if (rateOut) rateOut.textContent = "$" + r.toFixed(2) + " / kWh";

    if (rKw) rKw.textContent = kw.toFixed(1) + " kW";
    if (rKwh) rKwh.textContent = nf0.format(kwh) + " kWh";
    if (rSave) rSave.textContent = "$" + nf0.format(save);
  };

  if (area && sun && rate) {
    [area, sun, rate].forEach((el) => el.addEventListener("input", updateCalc));
    updateCalc();
  }

  /* ---------- Bridge pull-state hint (optional, non-essential) ---------- */
  document.addEventListener("sitegeist:pull-state", (event) => {
    document.body.classList.toggle("sitegeist-pulling", Boolean(event.detail && event.detail.active));
  });
})();
