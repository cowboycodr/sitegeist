(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const form = document.querySelector("[data-seat-form]");
  const status = document.querySelector("[data-form-status]");
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  const setNavOpen = (open) => {
    if (!header || !toggle || !mobileNav) return;
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      mobileNav.hidden = false;
    } else {
      mobileNav.hidden = true;
    }
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  const activateTab = (key, { focusTab = false } = {}) => {
    tabs.forEach((tab) => {
      const active = tab.getAttribute("data-tab") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.getAttribute("data-panel") === key;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab.getAttribute("data-tab"));
    });

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activateTab(tabs[next].getAttribute("data-tab"), { focusTab: true });
    });
  });

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("is-error");

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const guests = String(data.get("guests") || "");
      const evening = String(data.get("evening") || "");

      if (!name) {
        status.textContent = "Please add your name so we know whose fork is whose.";
        status.classList.add("is-error");
        form.querySelector("#name")?.focus();
        return;
      }

      const eveningLabels = {
        "jul-18": "Friday Jul 18 — Warehouse loft",
        "jul-26": "Saturday Jul 26 — Greenhouse",
        "aug-01": "Friday Aug 1 — Midnight Raclette",
      };

      const hold = {
        name,
        guests,
        evening,
        note: String(data.get("note") || "").trim(),
        heldAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem("fondue-club-hold", JSON.stringify(hold));
      } catch {
        /* storage may be unavailable; still confirm locally */
      }

      const label = eveningLabels[evening] || "the next melt";
      status.textContent = `You're on the list, ${name} — ${guests} seat${guests === "1" ? "" : "s"} for ${label}. See you at the pot.`;
      form.reset();
      form.querySelector("#guests").value = guests;
      form.querySelector("#evening").value = evening;
    });
  }
})();
