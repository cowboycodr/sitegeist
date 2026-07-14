(() => {
  "use strict";

  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("mobile-nav");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(open);
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  const mq = window.matchMedia("(min-width: 780px)");
  const onChange = () => {
    if (mq.matches) setOpen(false);
  };
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onChange);
  }
})();
