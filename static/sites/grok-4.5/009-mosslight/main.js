(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const form = document.getElementById("stay-form");
  const status = document.getElementById("form-status");

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const cabin = form.elements.namedItem("cabin");
      const cabinLabel =
        cabin && cabin.selectedOptions && cabin.selectedOptions[0]
          ? cabin.selectedOptions[0].text
          : "your cabin";

      status.textContent =
        "Thank you. Your inquiry for " +
        cabinLabel +
        " is noted. A host will reply with availability and arrival details — no account or payment is collected on this page.";
      status.classList.add("is-visible");
      form.reset();
    });
  }

  // Set min date for arrival/departure to today when possible
  const arrival = document.getElementById("arrival");
  const departure = document.getElementById("departure");
  if (arrival && departure) {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    arrival.setAttribute("min", iso);
    departure.setAttribute("min", iso);

    arrival.addEventListener("change", () => {
      if (arrival.value) {
        departure.setAttribute("min", arrival.value);
        if (departure.value && departure.value < arrival.value) {
          departure.value = arrival.value;
        }
      }
    });
  }
})();
