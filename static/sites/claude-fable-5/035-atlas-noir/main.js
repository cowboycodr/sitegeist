(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  if (toggle && navList) {
    const close = () => {
      navList.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navList.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  // Reveal on scroll
  const revealed = document.querySelectorAll(".reveal");
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealed.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    revealed.forEach((el) => observer.observe(el));
  }

  // Expedition inquiry form (no network; acknowledged locally)
  const form = document.querySelector(".plan-form");
  if (form) {
    const note = form.querySelector(".form-note");
    const name = form.querySelector("#f-name");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!name.value.trim()) {
        name.setAttribute("aria-invalid", "true");
        note.textContent = "A name, please — even a nom de voyage will do.";
        name.focus();
        return;
      }
      name.removeAttribute("aria-invalid");
      note.textContent =
        "Coordinates received, " +
        name.value.trim() +
        ". The atelier will reply within two days with a first sketch.";
      form.reset();
    });
    name.addEventListener("input", () => {
      if (name.value.trim()) name.removeAttribute("aria-invalid");
    });
  }
})();
