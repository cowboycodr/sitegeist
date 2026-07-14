(() => {
  "use strict";

  // Mobile navigation toggle
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close the menu after choosing a destination
    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Booking enquiry — handled entirely on the page, no network request
  const form = document.getElementById("stay-form");
  const note = document.getElementById("form-note");
  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      if (!name || !email) {
        note.textContent = "Please add your name and email so we can write back.";
        return;
      }
      const first = name.split(/\s+/)[0];
      note.textContent =
        "Thank you, " + first + " — we've noted your dates and will reply by email soon.";
      form.reset();
      const nights = form.elements.nights;
      if (nights) nights.value = "2";
    });
  }
})();
