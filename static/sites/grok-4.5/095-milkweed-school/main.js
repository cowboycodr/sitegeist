(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const form = document.getElementById("interest-form");
  const status = document.getElementById("form-status");
  const storageKey = "milkweed-school-open-day-request";

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    siteNav.classList.toggle("is-open", open);
  }

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

  function markValidity(field, ok) {
    field.classList.toggle("invalid", !ok);
    field.setAttribute("aria-invalid", ok ? "false" : "true");
  }

  function validateField(field) {
    const value = (field.value || "").trim();
    const ok = value.length > 0;
    markValidity(field, ok);
    return ok;
  }

  if (form && status) {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach((key) => {
          const field = form.elements.namedItem(key);
          if (field && "value" in field && data[key]) {
            field.value = data[key];
          }
        });
        status.textContent = "We found a saved open-day request on this device.";
      }
    } catch (_) {
      /* ignore storage errors */
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const fields = ["family", "ages", "contact", "month"].map((name) =>
        form.elements.namedItem(name)
      );

      let valid = true;
      fields.forEach((field) => {
        if (!field || !("value" in field)) return;
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        status.textContent = "Please complete each field so we can welcome your family.";
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid && typeof firstInvalid.focus === "function") {
          firstInvalid.focus();
        }
        return;
      }

      const payload = {
        family: form.elements.namedItem("family").value.trim(),
        ages: form.elements.namedItem("ages").value.trim(),
        contact: form.elements.namedItem("contact").value.trim(),
        month: form.elements.namedItem("month").value,
        savedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(payload));
        status.textContent =
          "Request saved on this device. Bring these details when you visit or contact the school office.";
      } catch (_) {
        status.textContent =
          "Request noted. Write these details down and share them with the school office — storage is unavailable in this browser.";
      }
    });

    form.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value) validateField(field);
      });
      field.addEventListener("input", () => {
        if (field.classList.contains("invalid")) validateField(field);
      });
    });
  }
})();
