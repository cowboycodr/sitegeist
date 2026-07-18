(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal-on-scroll for cards, rows, and steps.
  const revealables = document.querySelectorAll("[data-reveal]");
  if (!reducedMotion && "IntersectionObserver" in window && revealables.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    revealables.forEach((element) => observer.observe(element));
  } else {
    document.documentElement.classList.add("no-observer");
  }

  // Order form: local confirmation only — no network anywhere on this site.
  const form = document.querySelector(".order-form");
  if (form) {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector("#of-name").value.trim();
      const occasion = form.querySelector("#of-occasion").value;
      const bravery = form.querySelector("input[name='bravery']:checked").value;
      if (!name) {
        status.textContent = "Tell us your name first — we like to know who we're arguing on behalf of.";
        form.querySelector("#of-name").focus();
        return;
      }
      status.textContent =
        "Noted, " + name + ". A " + bravery + " composition for “" +
        occasion.toLowerCase() + "” is on the bench. We'll be in touch within the hour.";
      form.reset();
    });
  }
})();
