(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const navPanel = document.getElementById("nav-panel");
  const accountPanel = document.getElementById("account-panel");
  const accountForm = document.getElementById("account-form");
  const formStatus = document.getElementById("form-status");
  const openAccountButtons = document.querySelectorAll("[data-open-account]");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function setNavOpen(open) {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navPanel.classList.toggle("is-open", open);
    navPanel.hidden = !open;
  }

  if (navToggle && navPanel) {
    navPanel.hidden = true;
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  function openAccount() {
    if (!accountPanel) return;
    accountPanel.classList.add("is-open");
    accountPanel.hidden = false;
    const first = accountPanel.querySelector("input");
    if (first) first.focus();
    accountPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  openAccountButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openAccount();
    });
  });

  if (accountForm && formStatus) {
    accountForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(accountForm);
      const email = String(data.get("email") || "").trim();
      const name = String(data.get("name") || "").trim();

      if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formStatus.dataset.type = "error";
        formStatus.textContent = "Please enter your name and a valid email.";
        return;
      }

      formStatus.dataset.type = "ok";
      formStatus.textContent =
        "You’re on the list. We’ll email your Orbit setup link shortly.";
      accountForm.reset();
    });
  }

  // Keyboard-friendly in-page nav: close mobile menu after hash change
  window.addEventListener("hashchange", () => setNavOpen(false));
})();
