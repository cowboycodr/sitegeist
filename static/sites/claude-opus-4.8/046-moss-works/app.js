(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- mobile navigation --- */
  const toggle = document.querySelector(".menu-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- scroll reveal --- */
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* --- contact form: local, no network --- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (form && note) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const name = (form.elements.namedItem("name") || {}).value || "there";
      const first = String(name).trim().split(/\s+/)[0] || "there";
      note.textContent = `Thanks, ${first}. We'll write back within two working days to talk soil and seasons.`;
      note.setAttribute("data-state", "ok");
      form.reset();
    });
  }

  /* --- footer year --- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- honor viewer pull-state so nonessential motion pauses --- */
  document.addEventListener("sitegeist:pull-state", (event) => {
    document.documentElement.classList.toggle("is-pulling", Boolean(event.detail && event.detail.active));
  });
})();
