(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const joinForm = document.getElementById("join-form");
  const formStatus = document.getElementById("form-status");

  const setNavOpen = (open) => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    siteNav.classList.toggle("is-open", open);
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  if (joinForm && formStatus) {
    joinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formStatus.classList.remove("is-error");

      const name = joinForm.elements.namedItem("name");
      const email = joinForm.elements.namedItem("email");
      const pace = joinForm.elements.namedItem("pace");

      const nameValue = name && "value" in name ? String(name.value).trim() : "";
      const emailValue = email && "value" in email ? String(email.value).trim() : "";
      const paceValue = pace && "value" in pace ? String(pace.value).trim() : "";

      if (!nameValue || !emailValue || !paceValue) {
        formStatus.classList.add("is-error");
        formStatus.textContent = "Please complete name, email, and pace band.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        formStatus.classList.add("is-error");
        formStatus.textContent = "Enter a valid email so we can confirm the ride.";
        return;
      }

      formStatus.textContent =
        "You’re on the list for Fjord Edge Loop. We’ll confirm by Wednesday evening.";
      joinForm.reset();
    });
  }
})();
