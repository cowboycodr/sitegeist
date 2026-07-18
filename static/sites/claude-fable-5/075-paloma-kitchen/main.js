(() => {
  "use strict";

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  if (toggle && navList) {
    const close = () => {
      navList.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navList.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
    document.addEventListener("click", (event) => {
      if (!navList.classList.contains("open")) return;
      if (event.target instanceof Node && !toggle.contains(event.target) && !navList.contains(event.target)) {
        close();
      }
    });
  }

  // Booking form: no network — confirm locally
  const form = document.querySelector(".book-form");
  const status = document.querySelector(".form-status");
  if (form && status) {
    const dateInput = form.querySelector("#bk-date");
    if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("error");

      const name = form.querySelector("#bk-name").value.trim();
      const date = form.querySelector("#bk-date").value;
      const time = form.querySelector("#bk-time").value;
      const party = form.querySelector("#bk-party").value;

      if (!name || !date || !time || !party) {
        status.classList.add("error");
        status.textContent = "Please fill in your name, date, time, and party size so we can hold the table.";
        return;
      }

      const when = new Date(date + "T12:00:00");
      const pretty = when.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      status.textContent =
        "Gracias, " + name + " — we'll hold a table for " + party.toLowerCase() +
        " on " + pretty + " at " + time + ". Look for the dove above the door.";
      form.reset();
    });
  }
})();
