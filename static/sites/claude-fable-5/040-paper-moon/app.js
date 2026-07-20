(() => {
  "use strict";

  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  const select = (tab, focus) => {
    tabs.forEach((other, index) => {
      const active = other === tab;
      other.setAttribute("aria-selected", String(active));
      other.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let target = null;
      if (event.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
      else if (event.key === "ArrowLeft") target = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === "Home") target = tabs[0];
      else if (event.key === "End") target = tabs[tabs.length - 1];
      if (target) {
        event.preventDefault();
        select(target, true);
      }
    });
  });
})();
