(() => {
  "use strict";

  // Mobile navigation toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".nav-toggle-label").textContent = "Menu";
      }
    });
  }

  // Size selection: one active size per product
  document.querySelectorAll(".size-row").forEach((row) => {
    const sizes = row.querySelectorAll(".size");
    sizes.forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        sizes.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      });
    });
  });

  // "Hold a unit" tally in the header
  const counter = document.getElementById("unit-count");
  let held = 0;
  document.querySelectorAll(".btn-add").forEach((button) => {
    const name = button.dataset.name || "unit";
    button.addEventListener("click", () => {
      const holding = button.classList.toggle("is-held");
      held += holding ? 1 : -1;
      if (counter) counter.textContent = String(held);
      button.textContent = holding ? "Held — release" : "Hold a unit";
      button.setAttribute(
        "aria-label",
        holding ? `Release your hold on the ${name}` : `Hold a unit of the ${name}`,
      );
    });
  });
})();
