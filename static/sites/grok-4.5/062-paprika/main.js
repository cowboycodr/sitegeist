(() => {
  "use strict";

  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const backdrop = document.getElementById("finder-backdrop");
  const dialog = document.getElementById("finder-dialog");
  const finderForm = document.getElementById("finder-form");
  const finderResult = document.getElementById("finder-result");
  const openButtons = document.querySelectorAll("[data-open-finder]");
  const closeButtons = document.querySelectorAll("[data-close-finder]");
  const tabs = Array.from(document.querySelectorAll('.menu-tab[role="tab"]'));
  const panels = {
    mains: document.getElementById("panel-mains"),
    bowls: document.getElementById("panel-bowls"),
    sides: document.getElementById("panel-sides"),
  };

  const kitchenCounts = {
    Westside: 6,
    "River District": 5,
    "East End": 4,
    "Old Market": 7,
    "Harbor Row": 3,
    Hillcrest: 4,
    "North Commons": 5,
    "Lantern Quarter": 8,
  };

  let lastFocus = null;

  function setMenuOpen(open) {
    if (!menuToggle || !navMenu) return;
    navMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      setMenuOpen(!navMenu.classList.contains("open"));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
  }

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  }

  function openFinder(event) {
    if (event) event.preventDefault();
    if (!backdrop || !dialog) return;
    lastFocus = document.activeElement;
    backdrop.hidden = false;
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    const focusable = getFocusable(dialog);
    const target = dialog.querySelector("#neighborhood") || focusable[0];
    if (target) target.focus();
  }

  function closeFinder() {
    if (!backdrop) return;
    backdrop.classList.remove("open");
    backdrop.hidden = true;
    document.body.style.overflow = "";
    if (finderResult) {
      finderResult.classList.remove("show");
      finderResult.textContent = "";
    }
    if (finderForm) finderForm.reset();
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openButtons.forEach((btn) => btn.addEventListener("click", openFinder));
  closeButtons.forEach((btn) => btn.addEventListener("click", closeFinder));

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeFinder();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (backdrop && backdrop.classList.contains("open")) {
        closeFinder();
        return;
      }
      if (navMenu && navMenu.classList.contains("open")) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    }

    if (e.key === "Tab" && backdrop && backdrop.classList.contains("open")) {
      const focusable = getFocusable(dialog);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (finderForm && finderResult) {
    finderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const select = document.getElementById("neighborhood");
      const when = document.getElementById("when");
      const area = select ? select.value : "";
      if (!area) {
        finderResult.classList.add("show");
        finderResult.textContent = "Choose a neighborhood to continue.";
        if (select) select.focus();
        return;
      }
      const count = kitchenCounts[area] || 3;
      const timing =
        when && when.value === "asap"
          ? "as soon as possible"
          : when
            ? `around ${when.options[when.selectedIndex].text.replace("Around ", "").toLowerCase()}`
            : "tonight";
      finderResult.classList.add("show");
      finderResult.textContent = `Good news — ${count} kitchens can deliver hot to ${area} ${timing}. Scroll the kitchens list to meet them.`;
    });
  }

  function activateTab(tab) {
    const panelKey = tab.id.replace("tab-", "");
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
    });
    Object.keys(panels).forEach((key) => {
      const panel = panels[key];
      if (!panel) return;
      const active = key === panelKey;
      panel.classList.toggle("active", active);
      if (active) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (e.key === "Home") {
        next = tabs[0];
      } else if (e.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        e.preventDefault();
        activateTab(next);
        next.focus();
      }
    });
  });

  // Ensure initial panel state
  const initial = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
  if (initial) activateTab(initial);
})();
