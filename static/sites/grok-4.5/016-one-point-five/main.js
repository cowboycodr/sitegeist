(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (navToggle && siteNav) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", open ? "false" : "true");
      siteNav.classList.toggle("is-open", !open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  // Signal domain filters
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const signalCards = Array.from(document.querySelectorAll(".signal-card"));

  const setFilter = (domain) => {
    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === domain;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    signalCards.forEach((card) => {
      const match = domain === "all" || card.dataset.domain === domain;
      card.classList.toggle("is-hidden", !match);
    });
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter || "all"));
  });

  // Pathway highlight
  const pathwaySelect = document.getElementById("pathway-select");
  const pathLines = {
    aligned: document.getElementById("path-aligned"),
    delayed: document.getElementById("path-delayed"),
    current: document.getElementById("path-current"),
  };
  const pathwayCards = Array.from(document.querySelectorAll(".pathway-card"));

  const setPathway = (key) => {
    Object.entries(pathLines).forEach(([name, el]) => {
      if (!el) return;
      el.classList.toggle("is-active", name === key);
      el.style.opacity = name === key ? "1" : "0.35";
    });

    pathwayCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.pathway === key);
    });
  };

  if (pathwaySelect) {
    pathwaySelect.addEventListener("change", () => setPathway(pathwaySelect.value));
    setPathway(pathwaySelect.value);
  }

  // Gentle entrance for meters when first visible
  if (!reduceMotion && "IntersectionObserver" in window) {
    const meters = document.querySelectorAll(".meter-fill");
    meters.forEach((meter) => {
      const level = meter.style.getPropertyValue("--level") || "50%";
      meter.style.width = "0%";
      meter.dataset.level = level;
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          requestAnimationFrame(() => {
            el.style.transition = "width 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
            el.style.width = el.dataset.level || "50%";
          });
          obs.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );

    meters.forEach((meter) => observer.observe(meter));
  }
})();
