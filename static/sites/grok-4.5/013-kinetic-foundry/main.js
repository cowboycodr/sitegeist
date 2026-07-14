(() => {
  "use strict";

  const nav = document.querySelector("[data-site-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const headerLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    headerLinks.forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (nav.contains(target) || toggle.contains(target)) return;
      setNavOpen(false);
    });
  }

  const sections = ["machines", "capabilities", "approach", "safety", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateCurrentNav() {
    if (!headerLinks.length || !sections.length) return;
    const offset = 100;
    let currentId = "";

    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top - offset <= 0) currentId = section.id;
    }

    headerLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      if (id && id === currentId) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateCurrentNav();
        ticking = false;
      });
    },
    { passive: true }
  );

  updateCurrentNav();
})();
