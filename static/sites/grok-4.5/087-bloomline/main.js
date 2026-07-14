(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const toggle = document.querySelector(".nav-toggle");
  const panel = document.getElementById("mobile-nav");

  const setMenuOpen = (open) => {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    panel.classList.toggle("is-open", open);
    if (open) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  };

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }

  const form = document.getElementById("order-form");
  const status = document.getElementById("form-status");
  const success = document.getElementById("form-success");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const occasion = String(data.get("occasion") || "").trim();
      const date = String(data.get("date") || "").trim();
      const palette = String(data.get("palette") || "").trim();
      const notes = String(data.get("notes") || "").trim();

      if (!name || !email || !occasion || !date) {
        if (status) {
          status.textContent = "Please complete name, email, occasion, and preferred date.";
        }
        if (success) {
          success.hidden = true;
          success.classList.remove("is-visible");
        }
        return;
      }

      const occasionLabel =
        form.querySelector(`#occasion option[value="${CSS.escape(occasion)}"]`)?.textContent ||
        occasion;

      const summary = [
        `Bloomline request from ${name}`,
        `Email: ${email}`,
        `Occasion: ${occasionLabel}`,
        `Preferred date: ${date}`,
        palette ? `Palette: ${palette}` : null,
        notes ? `Notes: ${notes}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      if (status) {
        status.textContent = summary;
      }
      if (success) {
        success.hidden = false;
        success.classList.add("is-visible");
      }
    });

    form.addEventListener("reset", () => {
      if (status) status.textContent = "";
      if (success) {
        success.hidden = true;
        success.classList.remove("is-visible");
      }
    });
  }
})();
