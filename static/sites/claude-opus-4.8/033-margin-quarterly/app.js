(() => {
  "use strict";

  /* ---- Dusk / day mode ---- */
  const root = document.documentElement;
  const toggle = document.getElementById("modeToggle");
  const label = toggle ? toggle.querySelector(".mode-label") : null;

  const applyMode = (mode) => {
    if (mode === "dusk") {
      root.setAttribute("data-mode", "dusk");
      if (label) label.textContent = "Day";
      if (toggle) toggle.setAttribute("aria-pressed", "true");
    } else {
      root.removeAttribute("data-mode");
      if (label) label.textContent = "Dusk";
      if (toggle) toggle.setAttribute("aria-pressed", "false");
    }
  };

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  applyMode(media.matches ? "dusk" : "day");
  media.addEventListener("change", (e) => applyMode(e.matches ? "dusk" : "day"));

  if (toggle) {
    toggle.addEventListener("click", () => {
      applyMode(root.getAttribute("data-mode") === "dusk" ? "day" : "dusk");
    });
  }

  /* ---- Archive season filter ---- */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const issues = Array.from(document.querySelectorAll(".issue"));
  const empty = document.getElementById("archiveEmpty");

  const filterBy = (season) => {
    let shown = 0;
    issues.forEach((el) => {
      const match = season === "all" || el.dataset.season === season;
      el.hidden = !match;
      if (match) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      filterBy(chip.dataset.season);
    });
  });

  /* ---- Dispatch sign-up (client-side only) ---- */
  const form = document.getElementById("signup");
  const input = document.getElementById("email");
  const status = document.getElementById("signupStatus");

  if (form && input && status) {
    const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value;
      if (!valid(value)) {
        status.textContent = "Please enter a valid email address.";
        status.className = "signup-status err";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      status.textContent = "You're on the list — a letter arrives each season.";
      status.className = "signup-status ok";
      form.reset();
    });

    input.addEventListener("input", () => {
      if (status.textContent) {
        status.textContent = "";
        status.className = "signup-status";
        input.removeAttribute("aria-invalid");
      }
    });
  }
})();
