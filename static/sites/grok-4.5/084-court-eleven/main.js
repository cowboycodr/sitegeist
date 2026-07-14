(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const form = document.querySelector("[data-book-form]");
  const status = document.querySelector("[data-form-status]");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeNav();
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = form.querySelector("#name");
      const name = nameInput ? String(nameInput.value || "").trim() : "";
      const surface = form.querySelector("#surface");
      const windowSelect = form.querySelector("#window");
      const players = form.querySelector("#players");

      status.classList.remove("is-error");

      if (!name) {
        status.textContent = "Please add your name so we can hold the request.";
        status.classList.add("is-error");
        if (nameInput) nameInput.focus();
        return;
      }

      const surfaceLabel = surface?.selectedOptions?.[0]?.text || "a court";
      const windowLabel = windowSelect?.selectedOptions?.[0]?.text || "your window";
      const playersLabel = players?.selectedOptions?.[0]?.text || "your group";

      status.textContent =
        `Thanks, ${name}. We held a request for ${surfaceLabel.toLowerCase()} ` +
        `in the ${windowLabel.toLowerCase()} window (${playersLabel.toLowerCase()}). ` +
        `A host will confirm at the desk—bring whites if you have them.`;

      form.reset();
    });
  }
})();
