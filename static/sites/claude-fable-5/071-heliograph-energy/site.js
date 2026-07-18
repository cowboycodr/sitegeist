(() => {
  "use strict";

  document.documentElement.classList.add("js");

  /* ----- Mobile navigation ----- */
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");

  if (toggle && navList) {
    const close = () => {
      navList.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    navList.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navList.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navList.classList.contains("is-open") &&
        event.target instanceof Node &&
        !navList.contains(event.target) &&
        !toggle.contains(event.target)
      ) close();
    });
  }

  /* ----- System planner ----- */
  const area = document.getElementById("area");
  const sun = document.getElementById("sun");
  const setting = document.getElementById("setting");
  const areaValue = document.getElementById("area-value");
  const sunValue = document.getElementById("sun-value");
  const resultKw = document.getElementById("result-kw");
  const resultKwh = document.getElementById("result-kwh");
  const resultCo2 = document.getElementById("result-co2");
  const resultNote = document.getElementById("result-note");

  const settings = {
    home: { density: 0.2, ratio: 0.78, label: "residential array" },
    campus: { density: 0.21, ratio: 0.8, label: "campus rooftop fleet" },
    public: { density: 0.18, ratio: 0.76, label: "public canopy" },
  };

  const update = () => {
    if (!area || !sun || !setting) return;
    const squareMeters = Number(area.value);
    const sunHours = Number(sun.value);
    const profile = settings[setting.value] || settings.home;

    // ~0.4 kW per panel at ~2 m² each, derated by setting density and losses.
    const kilowatts = squareMeters * profile.density;
    const annualKwh = kilowatts * sunHours * 365 * profile.ratio;
    const tonnesCo2 = annualKwh * 0.0004;
    const panels = Math.max(1, Math.round(squareMeters / 2));

    areaValue.textContent = `${squareMeters} m²`;
    sunValue.textContent = `${sunHours} h/day`;
    resultKw.textContent = `${kilowatts.toFixed(1)} kW`;
    resultKwh.textContent = `${Math.round(annualKwh).toLocaleString("en-US")} kWh`;
    resultCo2.textContent = `${tonnesCo2.toFixed(1)} t`;
    resultNote.textContent = `A composed ${profile.label} of roughly ${panels} panels, sized from your figures.`;
  };

  [area, sun, setting].forEach((control) => {
    if (!control) return;
    control.addEventListener("input", update);
    control.addEventListener("change", update);
  });
  update();

  /* ----- Scroll reveal ----- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealed = document.querySelectorAll(".reveal");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealed.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealed.forEach((el) => observer.observe(el));
  }
})();
