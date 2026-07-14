(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && nav) {
    const closeNav = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };

    const openNav = () => {
      toggle.setAttribute("aria-expanded", "true");
      nav.classList.add("is-open");
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.matchMedia("(min-width: 720px)").matches) closeNav();
      },
      { passive: true }
    );
  }

  const sections = ["projects", "approach", "studio", "notes", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${id}`;
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0.01,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
