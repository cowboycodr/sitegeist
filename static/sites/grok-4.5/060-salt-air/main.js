(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const form = document.getElementById("booking-form");
  const status = document.getElementById("form-status");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const arrive = form.elements.namedItem("arrive");
      const depart = form.elements.namedItem("depart");
      const name = form.elements.namedItem("name");

      if (!(arrive instanceof HTMLInputElement) || !(depart instanceof HTMLInputElement)) {
        return;
      }

      if (arrive.value && depart.value && depart.value <= arrive.value) {
        status.hidden = false;
        status.textContent = "Please choose a departure date after your arrival.";
        depart.focus();
        return;
      }

      const guestName =
        name instanceof HTMLInputElement && name.value.trim()
          ? name.value.trim().split(/\s+/)[0]
          : "there";

      status.hidden = false;
      status.textContent =
        "Thanks, " +
        guestName +
        ". Your request is ready—call or email the desk to confirm these dates.";
      form.reset();
    });
  }
})();
