(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];

  const closeNav = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  const openNav = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    siteNav.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 721px)").matches) closeNav();
    });
  }

  const tabs = Array.from(document.querySelectorAll(".day-tab"));
  const panels = Array.from(document.querySelectorAll(".day-panel"));

  if (!tabs.length || !panels.length) return;

  const activateTab = (tab, { focus = false } = {}) => {
    const day = tab.getAttribute("data-day");

    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", selected ? "true" : "false");
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const match = panel.id === `panel-day${day}`;
      panel.classList.toggle("is-active", match);
      if (match) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex === null) return;
      event.preventDefault();
      activateTab(tabs[nextIndex], { focus: true });
    });
  });
})();
