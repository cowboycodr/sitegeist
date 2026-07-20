(() => {
  "use strict";

  const tablist = document.querySelector(".tabs");
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll("[role='tab']"));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  const select = (tab, focus) => {
    tabs.forEach((other, index) => {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      other.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        event.preventDefault();
        select(next, true);
      }
    });
  });
})();
