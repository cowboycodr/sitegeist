(() => {
  "use strict";

  /* Mobile navigation ------------------------------------------------ */
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  if (toggle && navList) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      navList.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    navList.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  /* Ride-mode toggle ------------------------------------------------- */
  const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
  const modeNote = document.getElementById("mode-note");
  const specs = {
    glide: {
      weight: "14 kg", range: "72 km", volume: "42 dB",
      speed: "25 km/h", charge: "2.5 hrs",
      note: "Glide — the softest assist, tuned for calm streets and long, quiet distances.",
    },
    city: {
      weight: "14 kg", range: "58 km", volume: "46 dB",
      speed: "25 km/h", charge: "2.5 hrs",
      note: "City — a firmer push for hills and quick starts, still hushed against the traffic.",
    },
  };
  const specCells = {};
  document.querySelectorAll("[data-spec]").forEach((cell) => {
    specCells[cell.dataset.spec] = cell;
  });
  const applyMode = (mode) => {
    const data = specs[mode];
    if (!data) return;
    Object.keys(specCells).forEach((key) => {
      if (data[key]) specCells[key].textContent = data[key];
    });
    if (modeNote) modeNote.textContent = data.note;
    modeButtons.forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  };
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyMode(btn.dataset.mode));
  });

  /* Booking form (fully local — nothing leaves the page) ------------- */
  const form = document.getElementById("ride-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const name = (form.elements.name.value || "there").trim().split(/\s+/)[0];
      const studio = form.elements.studio.value;
      status.textContent = `Thanks, ${name} — your ride at ${studio} is reserved. We'll be in touch.`;
      status.classList.add("is-shown");
      form.reset();
    });
  }

  /* Scroll reveal ---------------------------------------------------- */
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }
})();
