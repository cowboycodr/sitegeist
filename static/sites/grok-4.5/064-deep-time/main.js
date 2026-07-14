(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  const closeNav = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    siteNav.classList.remove("is-open");
  };

  const openNav = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    siteNav.classList.add("is-open");
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  /* Era tabs */
  const tabs = Array.from(document.querySelectorAll(".era-tab"));
  const panels = Array.from(document.querySelectorAll(".era-panel"));

  const activateEra = (tab, { focusPanel = false } = {}) => {
    if (!tab) return;
    const era = tab.getAttribute("data-era");

    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const match = panel.getAttribute("data-era") === era;
      panel.classList.toggle("is-active", match);
      if (match) {
        panel.removeAttribute("hidden");
        if (focusPanel) panel.focus({ preventScroll: true });
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateEra(tab));

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex === null) return;
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      activateEra(nextTab);
      nextTab.focus();
    });
  });

  /* Collection filters */
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(document.querySelectorAll(".specimen-card"));

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      const show = filter === "all" || tags.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilter(filter);
    });
  });
})();
