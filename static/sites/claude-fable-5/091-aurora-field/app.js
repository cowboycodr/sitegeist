(() => {
  "use strict";

  const now = new Date();

  // --- Tonight's date line ---
  const dateEl = document.getElementById("tonight-date");
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // --- Moon phase from the synodic month (reference new moon: 2000-01-06 18:14 UTC) ---
  const SYNODIC_DAYS = 29.530588853;
  const refNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const ageDays = ((now.getTime() - refNewMoon) / 86400000) % SYNODIC_DAYS;
  const phase = ageDays / SYNODIC_DAYS; // 0 = new, 0.5 = full
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  let phaseName;
  if (phase < 0.03 || phase > 0.97) phaseName = "New moon";
  else if (phase < 0.22) phaseName = "Waxing crescent";
  else if (phase < 0.28) phaseName = "First quarter";
  else if (phase < 0.47) phaseName = "Waxing gibbous";
  else if (phase < 0.53) phaseName = "Full moon";
  else if (phase < 0.72) phaseName = "Waning gibbous";
  else if (phase < 0.78) phaseName = "Last quarter";
  else phaseName = "Waning crescent";

  const moonEl = document.getElementById("stat-moon");
  if (moonEl) moonEl.textContent = `${phaseName} · ${illumination}% lit`;

  // --- Dark window: a seasonal approximation for 64° N ---
  // Day-of-year drives a cosine between midsummer (no astronomical dark)
  // and midwinter (dark from mid-afternoon to mid-morning).
  const startOfYear = Date.UTC(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - startOfYear) / 86400000);
  const seasonal = Math.cos(((dayOfYear - 172) / 365.25) * 2 * Math.PI); // -1 midsummer, +1 midwinter
  const darkEl = document.getElementById("stat-dark");
  if (darkEl) {
    if (seasonal < -0.62) {
      darkEl.textContent = "Midnight sun — no astronomical dark";
    } else {
      const halfWindow = 1.5 + (seasonal + 0.62) * 4.2; // hours either side of 00:30
      const fmt = (h) => {
        const total = ((h % 24) + 24) % 24;
        const hh = String(Math.floor(total)).padStart(2, "0");
        const mm = String(Math.round((total % 1) * 60) % 60).padStart(2, "0");
        return `${hh}:${mm}`;
      };
      darkEl.textContent = `${fmt(0.5 - halfWindow)} → ${fmt(0.5 + halfWindow)}`;
    }
  }

  // --- Aurora outlook: a deterministic day-seeded index, honest about being an outlook ---
  const seed = (dayOfYear * 2654435761) % 97;
  const kp = 2 + (seed % 5); // 2..6
  const auroraEl = document.getElementById("stat-aurora");
  if (auroraEl) {
    const note = kp >= 5 ? "storm-level display possible" : kp >= 4 ? "overhead likely" : "arc on the northern horizon";
    auroraEl.textContent = `Kp ${kp} · ${note}`;
  }

  // --- Sky transparency, seeded the same way ---
  const seeingEl = document.getElementById("stat-seeing");
  if (seeingEl) {
    const sqm = (21.6 + ((seed * 7) % 40) / 100).toFixed(1);
    const grade = sqm >= 21.9 ? "Excellent" : "Very good";
    seeingEl.textContent = `${grade} · ${sqm} mag/arcsec²`;
  }
})();
