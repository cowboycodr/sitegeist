(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const tabs = Array.from(document.querySelectorAll("[data-system-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-system-panel]"));

  if (!tabs.length || !panels.length) return;

  const activate = (id) => {
    tabs.forEach((tab) => {
      const selected = tab.getAttribute("data-system-tab") === id;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const match = panel.getAttribute("data-system-panel") === id;
      panel.classList.toggle("is-active", match);
      panel.hidden = !match;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activate(tab.getAttribute("data-system-tab"));
    });

    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let next = null;

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }

      if (next) {
        event.preventDefault();
        next.focus();
        activate(next.getAttribute("data-system-tab"));
      }
    });
  });

  activate(tabs[0].getAttribute("data-system-tab"));
})();
