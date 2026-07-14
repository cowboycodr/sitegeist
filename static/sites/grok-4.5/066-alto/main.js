(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const year = document.getElementById("year");
  const form = document.getElementById("tour-form");
  const status = document.getElementById("form-status");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

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

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 880px)").matches) closeMenu();
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("is-error");

      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const nameValue = name && "value" in name ? String(name.value).trim() : "";
      const emailValue = email && "value" in email ? String(email.value).trim() : "";

      if (!nameValue || !emailValue) {
        status.textContent = "Please add your name and email so a host can reply.";
        status.classList.add("is-error");
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
      if (!emailOk) {
        status.textContent = "That email doesn’t look quite right. Try again?";
        status.classList.add("is-error");
        return;
      }

      status.textContent = "Thanks — a host will be in touch within one business day.";
      form.reset();
    });
  }
})();
