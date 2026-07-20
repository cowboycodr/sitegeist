(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scenario picker ---------- */

  const scenarios = {
    low: {
      name: "Deep cuts",
      temp: "+1.6",
      desc:
        "Emissions halve by 2035 and reach net zero around 2050. Warming peaks just " +
        "above 1.5 °C and slowly declines. Coral reefs are badly damaged but some " +
        "persist, most summer Arctic ice survives, and sea-level rise stays manageable " +
        "for most coastal cities this century.",
      heat: "×8.6",
      sea: "0.4 m",
      ice: "1-in-10",
    },
    current: {
      name: "Current policies",
      temp: "+2.7",
      desc:
        "Policies already on the books bend the curve but do not hold the line. Around " +
        "+2.7 °C, most warm-water coral reefs are lost, extreme heat that was once a " +
        "1-in-50-year event arrives most summers, and hundreds of millions of people " +
        "face chronic water stress.",
      heat: "×14",
      sea: "0.6 m",
      ice: "1-in-3",
    },
    high: {
      name: "High emissions",
      temp: "+4.4",
      desc:
        "Fossil use grows unchecked through the century. Beyond +4 °C, large regions " +
        "near the equator see heat and humidity past the limits of outdoor labour, major " +
        "ice sheets are committed to long-term collapse, and adaptation shifts from " +
        "expensive to impossible in many places.",
      heat: "×39",
      sea: "0.8 m+",
      ice: "Near-certain",
    },
  };

  const buttons = Array.from(document.querySelectorAll(".scenario-btn"));
  const tempEl = document.getElementById("scenario-temp");
  const nameEl = document.getElementById("scenario-name");
  const descEl = document.getElementById("scenario-desc");
  const heatEl = document.getElementById("fact-heat");
  const seaEl = document.getElementById("fact-sea");
  const iceEl = document.getElementById("fact-ice");

  const selectScenario = (key) => {
    const data = scenarios[key];
    if (!data) return;
    buttons.forEach((button) => {
      const active = button.dataset.scenario === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    tempEl.textContent = data.temp;
    nameEl.textContent = data.name;
    descEl.textContent = data.desc;
    heatEl.textContent = data.heat;
    seaEl.textContent = data.sea;
    iceEl.textContent = data.ice;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectScenario(button.dataset.scenario));
  });

  /* ---------- stat count-up (skipped under reduced motion) ---------- */

  const stats = Array.from(document.querySelectorAll(".stat"));

  const animateStat = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- reveal on scroll ---------- */

  const revealables = Array.from(
    document.querySelectorAll(".card, .action-list li, .chart-frame, .scenario-panel"),
  );
  revealables.forEach((el) => el.classList.add("reveal"));

  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    revealables.forEach((el) => observer.observe(el));

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateStat(entry.target);
          statObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );
    stats.forEach((el) => statObserver.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }
})();
