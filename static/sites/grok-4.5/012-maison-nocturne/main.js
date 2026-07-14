(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const form = document.getElementById("visit-form");
  const status = document.getElementById("form-status");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    siteNav.classList.toggle("is-open", open);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  // Highlight current section in nav while scrolling
  const sectionIds = ["collection", "silhouettes", "atelier", "visit"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

  function updateCurrentNav() {
    const scrollY = window.scrollY + 96;
    let current = null;
    for (const section of sections) {
      if (section.offsetTop <= scrollY) current = section.id;
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      if (id && id === current) {
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
      requestAnimationFrame(() => {
        updateCurrentNav();
        ticking = false;
      });
    },
    { passive: true }
  );
  updateCurrentNav();

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = /** @type {HTMLInputElement} */ (form.elements.namedItem("name"));
      const email = /** @type {HTMLInputElement} */ (form.elements.namedItem("email"));

      if (!name.value.trim() || !email.value.trim() || !email.checkValidity()) {
        status.hidden = false;
        status.dataset.state = "error";
        status.textContent = "Please provide a valid name and email to request an appointment.";
        return;
      }

      status.hidden = false;
      status.dataset.state = "ok";
      status.textContent =
        "Request received. The atelier will reply with an available evening near the window.";

      form.reset();

      if (!reduceMotion) {
        status.animate(
          [
            { opacity: 0.4, transform: "translateY(4px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 280, easing: "ease-out" }
        );
      }
    });
  }
})();
