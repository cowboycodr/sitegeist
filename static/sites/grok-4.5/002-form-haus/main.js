(() => {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (nav.contains(target) || toggle.contains(target)) return;
    setOpen(false);
  });

  const mq = window.matchMedia("(min-width: 721px)");
  const onViewport = () => {
    if (mq.matches) setOpen(false);
  };
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onViewport);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onViewport);
  }
})();
