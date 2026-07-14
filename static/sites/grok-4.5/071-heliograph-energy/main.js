(() => {
  "use strict";

  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const form = document.getElementById("plan-form");
  const status = document.getElementById("form-status");

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 641px)").matches) {
        setNavOpen(false);
      }
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const scale = form.elements.namedItem("scale");

      const nameValue = name && "value" in name ? String(name.value).trim() : "";
      const emailValue = email && "value" in email ? String(email.value).trim() : "";
      const scaleValue = scale && "value" in scale ? String(scale.value).trim() : "";

      if (!nameValue || !emailValue || !scaleValue) {
        status.hidden = false;
        status.dataset.state = "error";
        status.textContent = "Please complete name, email, and project scale.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        status.hidden = false;
        status.dataset.state = "error";
        status.textContent = "Enter a valid email address so we can reply.";
        return;
      }

      status.hidden = false;
      status.dataset.state = "ok";
      status.textContent =
        "Thank you, " +
        nameValue +
        ". Your placement study request is ready to share with Heliograph. This demo keeps your details on this device only.";
      form.reset();
    });
  }
})();
