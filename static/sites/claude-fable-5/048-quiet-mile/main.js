(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Decibel bars: set target widths, grow when scrolled into view.
  const bars = Array.from(document.querySelectorAll(".db-bar"));
  bars.forEach((bar) => {
    bar.style.setProperty("--w", `${bar.dataset.width}%`);
  });

  const grow = (bar) => bar.classList.add("grown");

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    bars.forEach(grow);
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            grow(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    bars.forEach((bar) => observer.observe(bar));
  }

  // Test-ride form: handled entirely locally, no network.
  const form = document.getElementById("ride-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = Array.from(form.querySelectorAll("input, select"));
      let firstInvalid = null;
      fields.forEach((field) => {
        const empty = !field.value.trim();
        field.setAttribute("aria-invalid", empty ? "true" : "false");
        if (empty && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.textContent = "Please fill in every field so we can hold your slot.";
        status.className = "form-status err";
        firstInvalid.focus();
        return;
      }

      const name = form.elements.name.value.trim();
      const studio = form.elements.studio.value.split("—")[0].trim();
      status.textContent = `Thank you, ${name} — your ride at the ${studio} studio is pencilled in. We'll confirm quietly.`;
      status.className = "form-status ok";
      form.reset();
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
    });
  }
})();
