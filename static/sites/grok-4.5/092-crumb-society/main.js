(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const orderNote = document.getElementById("order-note");

  if (navToggle && siteNav) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      siteNav.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  document.querySelectorAll(".box-order").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-box") || "box";
      if (!orderNote) return;
      orderNote.hidden = false;
      orderNote.textContent =
        name +
        " selected. Pick up at the counter during open hours — we assemble the morning of.";
      orderNote.focus?.();
    });
  });
})();
