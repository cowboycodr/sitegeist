(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const form = document.getElementById("subscribe-form");
  const status = document.getElementById("form-status");

  const setScrolled = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  if (navToggle && siteNav) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      siteNav.classList.remove("is-open");
    };

    const openNav = () => {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
      siteNav.classList.add("is-open");
    };

    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.matchMedia("(min-width: 641px)").matches) closeNav();
      },
      { passive: true },
    );
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.querySelector("#email");
      if (!(email instanceof HTMLInputElement)) return;

      const value = email.value.trim();
      if (!value || !email.checkValidity()) {
        status.textContent = "Please enter a valid email address.";
        status.classList.remove("is-success");
        email.focus();
        return;
      }

      status.textContent = "Thank you — you are on the list for the next issue.";
      status.classList.add("is-success");
      form.reset();
    });
  }
})();
