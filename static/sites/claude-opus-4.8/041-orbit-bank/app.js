(() => {
  "use strict";

  // Waitlist form — purely local, no network. Validates and confirms in place.
  const form = document.querySelector(".waitlist");
  const input = document.getElementById("email");
  const note = document.getElementById("formNote");

  if (form && input && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        note.textContent = "Please enter a valid email address.";
        note.classList.add("error");
        input.focus();
        return;
      }
      note.classList.remove("error");
      note.textContent = "You're on the list — we'll reserve your Orbit.";
      form.reset();
    });

    input.addEventListener("input", () => {
      if (note.textContent) {
        note.textContent = "";
        note.classList.remove("error");
      }
    });
  }

  // Back-to-top button
  const toTop = document.getElementById("toTop");
  if (toTop) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    const update = () => {
      const show = window.scrollY > 640;
      toTop.hidden = !show;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    update();
  }
})();
