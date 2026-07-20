(() => {
  "use strict";

  const tablist = document.querySelector(".glaze-tabs");
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll("[role='tab']"));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  const select = (tab, focus) => {
    tabs.forEach((other, index) => {
      const active = other === tab;
      other.setAttribute("aria-selected", active ? "true" : "false");
      other.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (event) => {
      let target = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        target = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        target = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        target = tabs[0];
      } else if (event.key === "End") {
        target = tabs[tabs.length - 1];
      }
      if (target) {
        event.preventDefault();
        select(target, true);
      }
    });
  });
})();
