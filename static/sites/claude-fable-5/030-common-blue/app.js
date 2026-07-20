(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation toggle
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Project filter chips
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".project-card"));
  const emptyNote = document.querySelector(".empty-note");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((other) => {
        const active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      const filter = chip.dataset.filter;
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.type === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (emptyNote) emptyNote.hidden = visible > 0;
    });
  });

  // Impact counters: count up when scrolled into view, unless motion is reduced
  const counters = Array.from(document.querySelectorAll(".impact-number"));
  const format = (value) => value.toLocaleString("en-US");
  const finish = (element, target) => {
    element.textContent = format(target);
  };
  if (reducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((element) => finish(element, Number(element.dataset.count)));
  } else {
    const animate = (element, target) => {
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = format(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target, Number(entry.target.dataset.count));
      });
    }, { threshold: 0.4 });
    counters.forEach((element) => observer.observe(element));
  }

  // Signup form: validate locally and confirm; no network requests are made
  const form = document.querySelector(".signup");
  if (form) {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector("#signup-name");
      const town = form.querySelector("#signup-town");
      const missing = [name, town].filter((field) => !field.value.trim());
      missing.forEach((field) => field.classList.add("invalid"));
      [name, town]
        .filter((field) => field.value.trim())
        .forEach((field) => field.classList.remove("invalid"));
      if (missing.length) {
        status.textContent = "Please add your name and town so a crew can find you.";
        missing[0].focus();
        return;
      }
      const interest = form.querySelector("#signup-interest");
      const label = interest.options[interest.selectedIndex].textContent.toLowerCase();
      status.textContent = `Thanks, ${name.value.trim()} — the ${town.value.trim()} crew will be in touch about ${label}.`;
      form.reset();
    });
  }
})();
