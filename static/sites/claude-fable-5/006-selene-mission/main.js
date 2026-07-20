(() => {
  "use strict";

  /* ---------- launch countdown ---------- */

  const LAUNCH = Date.parse("2027-03-14T13:00:00Z");
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");

  const pad = (n) => String(n).padStart(2, "0");

  const renderClock = () => {
    const remaining = LAUNCH - Date.now();
    if (remaining <= 0) {
      daysEl.textContent = "0";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      return;
    }
    const mins = Math.floor(remaining / 60000);
    daysEl.textContent = String(Math.floor(mins / 1440));
    hoursEl.textContent = pad(Math.floor((mins % 1440) / 60));
    minsEl.textContent = pad(mins % 60);
  };

  renderClock();
  setInterval(renderClock, 30000);

  /* ---------- mission phase tabs ---------- */

  const tabs = Array.from(document.querySelectorAll(".phase-tab"));
  const panels = Array.from(document.querySelectorAll(".phase-panel"));

  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index, false));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = (index + 1) % tabs.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = (index - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = tabs.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      event.stopPropagation();
      select(next, true);
    });
  });
})();
