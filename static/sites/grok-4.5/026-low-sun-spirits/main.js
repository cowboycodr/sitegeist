(() => {
  "use strict";

  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  if (toggle && nav) {
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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeNav();
    });
  }

  // Mark current section in nav when scrolling
  const sectionIds = ["bottles", "craft", "botanicals", "distillery"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === `#${id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("is-error");

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();

      if (!name || !email) {
        status.classList.add("is-error");
        status.textContent = "Please add your name and email.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.classList.add("is-error");
        status.textContent = "That email does not look complete.";
        return;
      }

      status.textContent = `Thank you, ${name}. Your note is saved in this browser only — we will write when the next batch is ready.`;
      form.reset();
    });
  }

  // Soft parallax on hero sun when motion is allowed
  const sun = document.querySelector(".hero-sun");
  if (sun && !reduceMotion.matches) {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = Math.min(window.scrollY, 420);
        sun.style.transform = `translate(-50%, calc(-30% + ${y * 0.08}px))`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
