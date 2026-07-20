(() => {
  "use strict";

  /* Mobile navigation toggle */
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");

  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      toggle.focus();
    }
  });

  /* Case-study tabs with arrow-key support */
  const tabs = Array.from(document.querySelectorAll("[role='tab']"));

  const selectTab = (tab, focus = true) => {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(other.getAttribute("aria-controls")).hidden = !selected;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (event) => {
      let target = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        target = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        target = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        target = tabs[0];
      } else if (event.key === "End") {
        target = tabs[tabs.length - 1];
      }
      if (target) {
        event.preventDefault();
        selectTab(target);
      }
    });
  });

  /* Reveal-on-scroll, skipped when the user prefers reduced motion */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealed = document.querySelectorAll(".reveal");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealed.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealed.forEach((el) => observer.observe(el));
  }
})();
