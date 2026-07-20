(() => {
  "use strict";

  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (!nav || !toggle || !list) return;

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("open"));
  });

  list.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (nav.classList.contains("open") && !nav.contains(event.target)) setOpen(false);
  });
})();
