(() => {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  if (toggle && nav) {
    const close = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  // Reflect the neutral viewer pull gesture so the page gives visual feedback.
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = !!(event.detail && event.detail.active);
    document.body.classList.toggle("is-pulling", active);
  });
})();
