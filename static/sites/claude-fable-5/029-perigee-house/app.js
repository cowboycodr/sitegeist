(() => {
  "use strict";

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navList.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        navList.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navList.classList.contains("open")) {
        navList.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Voyage window picker
  const voyages = {
    equinox: {
      name: "Equinox Voyage",
      desc: "Balanced light along the whole ground track. The terminator runs pole to pole, and every orbit serves an even split of blue day and jewelled night.",
      dates: "18 – 26 March 2031",
      berths: "4 suites remaining",
    },
    solstice: {
      name: "Solstice Voyage",
      desc: "The long-light season. High-latitude passes stay sunlit for most of each orbit — endless golden hours over Scandinavia, Alaska, and the Southern Ocean.",
      dates: "12 – 20 June 2031",
      berths: "7 suites remaining",
    },
    aurora: {
      name: "Aurora Voyage",
      desc: "Timed to the autumn geomagnetic season. Night passes skim the auroral ovals, and the Aurora Suites hold position for the show.",
      dates: "9 – 17 October 2031",
      berths: "2 suites remaining",
    },
  };
  const tabs = Array.from(document.querySelectorAll(".voyage-tab"));
  const nameEl = document.getElementById("voyage-name");
  const descEl = document.getElementById("voyage-desc");
  const datesEl = document.getElementById("voyage-dates");
  const berthsEl = document.getElementById("voyage-berths");
  const windowSelect = document.getElementById("guest-window");

  const selectVoyage = (key) => {
    const voyage = voyages[key];
    if (!voyage) return;
    tabs.forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab.dataset.voyage === key));
    });
    if (nameEl) nameEl.textContent = voyage.name;
    if (descEl) descEl.textContent = voyage.desc;
    if (datesEl) datesEl.textContent = voyage.dates;
    if (berthsEl) berthsEl.textContent = voyage.berths;
    if (windowSelect) windowSelect.value = key;
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectVoyage(tab.dataset.voyage));
  });

  // Reservation form (no network — everything stays on board)
  const form = document.getElementById("reserve-form");
  const note = document.getElementById("form-note");
  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.namedItem("name");
      const guest = name instanceof HTMLInputElement ? name.value.trim() : "";
      if (!guest) {
        note.textContent = "Please add your full name so we can open the file.";
        if (name instanceof HTMLInputElement) name.focus();
        return;
      }
      const key = windowSelect instanceof HTMLSelectElement ? windowSelect.value : "equinox";
      const voyage = voyages[key] || voyages.equinox;
      note.textContent = `Noted, ${guest}. Your flight-qualification file for the ${voyage.name} is open — the concierge desk will take it from here.`;
      form.reset();
      if (windowSelect instanceof HTMLSelectElement) windowSelect.value = key;
    });
  }
})();
