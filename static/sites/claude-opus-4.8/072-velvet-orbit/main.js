(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Orbit animation — only when motion is welcome.
  const stage = document.querySelector("[data-orbit]");
  const applyMotion = () => {
    if (!stage) return;
    if (reduceMotion.matches) stage.removeAttribute("data-spin");
    else stage.setAttribute("data-spin", "");
  };
  applyMotion();
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", applyMotion);

  // Newsletter form — fully local, no network.
  const form = document.querySelector("[data-signup]");
  const note = document.querySelector("[data-form-note]");
  if (form && note) {
    const input = form.querySelector("#email");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = (input.value || "").trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        note.textContent = "Enter a valid email to join the orbit list.";
        input.focus();
        return;
      }
      note.textContent = "You're on the list — watch for Collection 05.";
      form.reset();
    });
  }

  // Smooth in-page navigation without changing the URL bar destination.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // Gentle acknowledgement of the viewer's pull-to-dismiss gesture.
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = !!(event.detail && event.detail.active);
    document.body.classList.toggle("is-pulling", active);
  });
})();
