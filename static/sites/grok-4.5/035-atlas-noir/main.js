(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const form = document.getElementById("plan-form");
  const status = document.getElementById("form-status");

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("is-error");

      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const region = form.elements.namedItem("region");

      if (!name?.value?.trim() || !email?.value?.trim() || !region?.value) {
        status.textContent = "Please complete name, email, and preferred region.";
        status.classList.add("is-error");
        return;
      }

      const emailValue = String(email.value).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        status.textContent = "Enter a valid email address.";
        status.classList.add("is-error");
        email.focus();
        return;
      }

      status.textContent =
        "Thank you. Your route sketch request is recorded. A private advisor will reply within five working days.";
      form.reset();
    });
  }
})();
