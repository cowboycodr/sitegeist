(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const filters = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".roast-card");
  const detail = document.getElementById("roast-detail");
  const detailTitle = document.getElementById("roast-detail-title");
  const detailCopy = document.getElementById("roast-detail-copy");
  const detailBrew = document.getElementById("roast-detail-brew");

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("nav--open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("nav--open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      filters.forEach((other) => {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });

      cards.forEach((card) => {
        const methods = (card.getAttribute("data-methods") || "").split(/\s+/);
        const show = filter === "all" || methods.includes(filter);
        card.hidden = !show;
      });
    });
  });

  document.querySelectorAll("[data-select-roast]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".roast-card");
      if (!card || !detail) return;

      const name = card.getAttribute("data-name") || "Selected roast";
      const brew = card.getAttribute("data-brew") || "";
      const notes = card.querySelector(".roast-card__notes");
      const origin = card.querySelector(".roast-card__origin");

      detail.hidden = false;
      if (detailTitle) detailTitle.textContent = name;
      if (detailCopy) {
        const originText = origin ? origin.textContent.trim() : "";
        const notesText = notes ? notes.textContent.trim() : "";
        detailCopy.textContent = originText
          ? `${originText}. ${notesText}`
          : notesText;
      }
      if (detailBrew) detailBrew.textContent = brew;

      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      detail.focus?.();
    });
  });

  if (detail && !detail.hasAttribute("tabindex")) {
    detail.setAttribute("tabindex", "-1");
  }
})();
