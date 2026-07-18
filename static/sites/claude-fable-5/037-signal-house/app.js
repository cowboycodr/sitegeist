(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  if (header && toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealed = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window && revealed.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    revealed.forEach((element) => observer.observe(element));
  } else {
    document.documentElement.classList.add("no-observer");
  }

  const copyLink = document.getElementById("copyEmail");
  const hint = document.getElementById("copyHint");
  if (copyLink && hint) {
    copyLink.addEventListener("click", (event) => {
      event.preventDefault();
      const email = copyLink.getAttribute("data-email") || copyLink.textContent.trim();
      const done = () => { hint.textContent = "Copied — talk soon."; };
      const fail = () => { hint.textContent = "Copy didn't work — jot it down: " + email; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, fail);
      } else {
        fail();
      }
    });
  }
})();
