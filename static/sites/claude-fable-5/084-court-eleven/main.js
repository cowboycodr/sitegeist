(() => {
  "use strict";

  /* Mobile navigation */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Booking grid preview */
  const days = {
    "day-fri": { label: "Friday 17", taken: [0, 1, 4, 7, 10] },
    "day-sat": { label: "Saturday 18", taken: [2, 3, 5, 6, 8, 11] },
    "day-sun": { label: "Sunday 19", taken: [1, 5, 9] },
  };
  const blocks = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "17:00", "18:00", "19:00", "20:00", "21:00",
  ];

  const tabs = Array.from(document.querySelectorAll(".day-btn"));
  const panel = document.getElementById("slot-panel");
  const status = document.getElementById("booking-status");
  let activeDay = "day-fri";
  let held = null;

  const renderSlots = () => {
    const day = days[activeDay];
    panel.textContent = "";
    blocks.forEach((time, index) => {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "slot";
      slot.textContent = time;
      const isHeld = held && held.day === activeDay && held.index === index;
      slot.setAttribute("aria-pressed", String(Boolean(isHeld)));
      if (day.taken.includes(index)) {
        slot.disabled = true;
        slot.setAttribute("aria-label", `${time} on ${day.label}, unavailable`);
      } else {
        slot.setAttribute("aria-label", `${time} on ${day.label}, available`);
        slot.addEventListener("click", () => {
          if (isHeldSlot(index)) {
            held = null;
            status.textContent = "Hold released. Select a block to hold it.";
          } else {
            held = { day: activeDay, index };
            status.textContent = `Holding Court · ${day.label} at ${time}. Confirm at the desk or on the member app.`;
          }
          renderSlots();
          const refreshed = panel.children[index];
          if (refreshed) refreshed.focus();
        });
      }
      panel.append(slot);
    });
  };

  const isHeldSlot = (index) => held && held.day === activeDay && held.index === index;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeDay = tab.id;
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      renderSlots();
    });
  });

  panel.parentElement.querySelector(".day-picker").addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const current = tabs.findIndex((t) => t.id === activeDay);
    const next = event.key === "ArrowRight"
      ? (current + 1) % tabs.length
      : (current - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
    event.preventDefault();
  });

  renderSlots();
})();
