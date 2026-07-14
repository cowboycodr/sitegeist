(() => {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];

  function setNavOpen(open) {
    if (!siteNav || !navToggle) return;
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = !siteNav.classList.contains("is-open");
      setNavOpen(open);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!siteNav.classList.contains("is-open")) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (siteNav.contains(target) || navToggle.contains(target)) return;
      setNavOpen(false);
    });
  }

  const dayTabs = Array.from(document.querySelectorAll(".day-tab"));
  const activityItems = Array.from(document.querySelectorAll(".activity-item"));

  function filterActivities(day) {
    activityItems.forEach((item) => {
      const match = item.getAttribute("data-day") === day;
      item.hidden = !match;
    });
  }

  if (dayTabs.length) {
    dayTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const day = tab.getAttribute("data-day");
        dayTabs.forEach((t) => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
        filterActivities(day);
      });
    });

    const selected = dayTabs.find((tab) => tab.getAttribute("aria-selected") === "true") || dayTabs[0];
    if (selected) {
      filterActivities(selected.getAttribute("data-day"));
    }
  }

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
