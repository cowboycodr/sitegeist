(() => {
  "use strict";

  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");

  if (nav && toggle && navList) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"));
    });

    navList.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  const form = document.querySelector(".join-form");
  const status = document.querySelector(".form-status");

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = form.elements.name.value.trim();
      const ride = form.elements.ride;

      if (!name || !ride.value) {
        status.textContent = "Add your name and pick a ride — then we can save you a wheel.";
        status.classList.add("is-error");
        (name ? ride : form.elements.name).focus();
        return;
      }

      const label = ride.options[ride.selectedIndex].text;
      status.textContent = `See you out there, ${name}. You're on the list for ${label}.`;
      status.classList.remove("is-error");
      form.reset();
    });
  }
})();
