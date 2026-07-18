(() => {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (!toggle || !list) return;

  const close = () => {
    list.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  list.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("a")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && list.classList.contains("open")) {
      close();
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      list.classList.contains("open") &&
      event.target instanceof Node &&
      !list.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      close();
    }
  });
})();
