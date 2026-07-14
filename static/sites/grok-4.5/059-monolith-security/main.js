(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  const setScrolled = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  const closeMenu = () => {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  };

  const openMenu = () => {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    mobileNav.hidden = false;
  };

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 900px)").matches) closeMenu();
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("is-error");

      if (!form.checkValidity()) {
        status.textContent = "Please complete the required fields.";
        status.classList.add("is-error");
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid && typeof firstInvalid.focus === "function") {
          firstInvalid.focus();
        }
        return;
      }

      const nameInput = form.querySelector("#name");
      const name = nameInput && nameInput.value ? nameInput.value.trim().split(/\s+/)[0] : "there";
      status.textContent = `Thanks, ${name}. Your briefing request is ready to send through your secure channel.`;
      form.reset();
    });
  }
})();
