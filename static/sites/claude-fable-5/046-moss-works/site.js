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

    document.addEventListener("click", (event) => {
      if (nav.classList.contains("is-open") && !nav.contains(event.target)) {
        setOpen(false);
      }
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".project-card, .tenet, .process-steps li, .note"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    for (const target of targets) {
      target.classList.add("reveal");
      observer.observe(target);
    }
  }
})();
