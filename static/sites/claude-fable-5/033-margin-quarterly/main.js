(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal essays as they enter the viewport.
  const essays = document.querySelectorAll(".essay");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    essays.forEach((essay) => essay.classList.add("is-visible"));
  } else {
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    essays.forEach((essay) => revealer.observe(essay));
  }

  // Mark the nav link for the section currently in view.
  const navLinks = Array.from(document.querySelectorAll(".topnav a"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const setCurrent = (id) => {
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${id}`;
        if (isCurrent) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    const spotter = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => spotter.observe(section));
  }
})();
