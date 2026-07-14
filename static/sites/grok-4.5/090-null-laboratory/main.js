(() => {
  "use strict";

  const nav = document.querySelector("[data-site-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-experiment-grid] .experiment-card"));
  const navLinks = nav ? Array.from(nav.querySelectorAll("a[href^='#']")) : [];

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      nav.classList.toggle("is-open", !open);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeNav();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  const setFilter = (domain) => {
    filterButtons.forEach((button) => {
      const active = button.getAttribute("data-filter") === domain;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    cards.forEach((card) => {
      const match = domain === "all" || card.getAttribute("data-domain") === domain;
      card.hidden = !match;
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const domain = button.getAttribute("data-filter") || "all";
      setFilter(domain);
    });
  });

  // Mark current section in nav when scrolling (progressive enhancement)
  const sections = ["experiments", "domains", "manifesto", "index"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const linkById = new Map(
      navLinks
        .map((link) => {
          const href = link.getAttribute("href") || "";
          const id = href.startsWith("#") ? href.slice(1) : "";
          return id ? [id, link] : null;
        })
        .filter(Boolean)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          linkById.forEach((link, key) => {
            if (key === id) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0.01 }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
