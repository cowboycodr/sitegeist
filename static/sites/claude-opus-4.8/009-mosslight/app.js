(() => {
  "use strict";

  // Mobile navigation toggle
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");

  if (toggle && list) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      list.classList.toggle("open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a destination
    list.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Close on Escape or when clicking away
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-nav")) setOpen(false);
    });
  }

  // Demonstration booking form — stays on the page, sends nothing
  const form = document.querySelector(".plan-form");
  const status = document.querySelector(".form-status");

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = (form.elements.name.value || "").trim();
      const cabin = form.elements.cabin.value;
      const nights = form.elements.nights.value;

      if (!name) {
        status.hidden = false;
        status.textContent = "Please add a name so we know who to write back to.";
        form.elements.name.focus();
        return;
      }

      const cabinPhrase = cabin === "No preference" ? "a cabin" : cabin;
      status.hidden = false;
      status.textContent =
        "Thank you, " + name + ". We'll hold " + cabinPhrase + " for " +
        nights + (Number(nights) === 1 ? " night" : " nights") +
        " and write back within a day.";
      form.reset();
    });
  }
})();
