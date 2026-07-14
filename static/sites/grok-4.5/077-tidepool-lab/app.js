(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const speciesCards = document.querySelectorAll(".species-card");

  function setNavOpen(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.textContent = open ? "Close" : "Menu";
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === button ? "true" : "false");
      });

      speciesCards.forEach((card) => {
        const tags = (card.getAttribute("data-tags") || "").split(/\s+/);
        const show = filter === "all" || tags.includes(filter);
        card.hidden = !show;
      });
    });
  });

  const sections = ["mission", "data", "biodiversity", "habitats", "researchers"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateCurrentNav() {
    if (!sections.length) return;
    const marker = window.scrollY + 120;
    let currentId = null;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) currentId = section.id;
    });

    navAnchors.forEach((anchor) => {
      const href = anchor.getAttribute("href") || "";
      const id = href.slice(1);
      if (id && id === currentId) {
        anchor.setAttribute("aria-current", "true");
      } else {
        anchor.removeAttribute("aria-current");
      }
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateCurrentNav();
        ticking = false;
      });
    },
    { passive: true }
  );

  updateCurrentNav();
})();
