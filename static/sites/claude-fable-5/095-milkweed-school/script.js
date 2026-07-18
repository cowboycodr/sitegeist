(() => {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.tagName === "A") setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      nav.classList.contains("open") &&
      event.target instanceof Node &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) setOpen(false);
  });
})();
