(() => {
  "use strict";

  const homeView = document.getElementById("home-view");
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const panelIds = new Set(panels.map((panel) => panel.id));

  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  const openMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const showHome = (hashTarget) => {
    if (homeView) homeView.hidden = false;
    panels.forEach((panel) => {
      panel.hidden = true;
      panel.classList.remove("is-active");
    });

    if (hashTarget && hashTarget !== "home") {
      const el = document.getElementById(hashTarget);
      if (el) {
        window.requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const showPanel = (id) => {
    if (homeView) homeView.hidden = true;
    panels.forEach((panel) => {
      const active = panel.id === id;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    window.scrollTo({ top: 0, behavior: "auto" });
    const activePanel = document.getElementById(id);
    const heading = activePanel && activePanel.querySelector("h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  };

  const routeFromHash = () => {
    const raw = (window.location.hash || "#home").slice(1);
    const id = raw || "home";

    if (panelIds.has(id)) {
      showPanel(id);
      return;
    }

    if (id === "home" || !id) {
      showHome();
      return;
    }

    // In-page section on the home view
    showHome(id);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const navMode = link.getAttribute("data-nav");

    if (navMode === "home" && !panelIds.has(id)) {
      // Let the browser update the hash; hashchange handles routing + scroll
      return;
    }

    if (panelIds.has(id) || id === "home" || navMode === "issue" || panelIds.has(navMode || "")) {
      // Default hash navigation is fine; route on hashchange
      return;
    }
  });

  window.addEventListener("hashchange", routeFromHash);

  // Initial route
  routeFromHash();
})();
