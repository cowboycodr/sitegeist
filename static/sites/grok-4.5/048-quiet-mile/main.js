(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const form = document.querySelector("#ride-form");
  const status = document.querySelector("#form-status");

  /* Sticky header border on scroll */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile navigation */
  const setNavOpen = (open) => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (open) {
      const first = mobileNav.querySelector("a");
      if (first) first.focus();
    }
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setNavOpen(false);
        menuToggle.focus();
      }
    });
  }

  /* Local test-ride form (no network) */
  if (form && status) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const city = String(data.get("city") || "").trim();
      const time = String(data.get("time") || "").trim();

      if (!name || !city || !time) {
        status.dataset.state = "error";
        status.textContent = "Please complete every field to continue.";
        return;
      }

      status.dataset.state = "ok";
      status.textContent = `Thanks, ${name}. Your ${time} ride in ${city} is held locally — a Quiet Mile guide will confirm when you visit a studio.`;
      form.reset();
    });
  }

  /* Scroll reveal */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");

  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
})();
