(() => {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");
  const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 860px)").matches) {
        setNavOpen(false);
      }
    });
  }

  /* Collection filters */
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const objectCards = Array.from(document.querySelectorAll(".object-card"));
  const emptyState = document.querySelector("#collection-empty");
  const liveRegion = document.querySelector("#filter-live");

  function applyFilter(category) {
    let visible = 0;

    objectCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category") || "";
      const show = category === "all" || cardCategory === category;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyState) emptyState.hidden = visible > 0;

    if (liveRegion) {
      const label =
        category === "all"
          ? "all categories"
          : category.replace(/-/g, " ");
      liveRegion.textContent = `Showing ${visible} object${visible === 1 ? "" : "s"} in ${label}.`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-filter") || "all";
      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === button ? "true" : "false");
      });
      applyFilter(category);
    });
  });

  /* Object submission form — local only, no network */
  const form = document.querySelector("#object-form");
  const status = document.querySelector("#form-status");

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = form.elements.namedItem("object-name");
      const story = form.elements.namedItem("object-story");
      const place = form.elements.namedItem("object-place");
      const theme = form.elements.namedItem("object-theme");

      const nameVal = name && "value" in name ? String(name.value).trim() : "";
      const storyVal = story && "value" in story ? String(story.value).trim() : "";
      const placeVal = place && "value" in place ? String(place.value).trim() : "";
      const themeVal = theme && "value" in theme ? String(theme.value).trim() : "";

      if (!nameVal || !storyVal || !placeVal || !themeVal) {
        status.dataset.tone = "error";
        status.textContent = "Please complete every field before submitting.";
        return;
      }

      if (storyVal.length < 40) {
        status.dataset.tone = "error";
        status.textContent = "Stories need a little room — at least a few sentences.";
        return;
      }

      status.dataset.tone = "ok";
      status.textContent =
        "Received. Your object is held in a local queue for curatorial review. Nothing was sent over the network.";
      form.reset();
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        if (status.dataset.tone === "error") {
          status.textContent = "";
          delete status.dataset.tone;
        }
      }, 0);
    });
  }

  /* Current year in footer */
  const yearEl = document.querySelector("#year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
