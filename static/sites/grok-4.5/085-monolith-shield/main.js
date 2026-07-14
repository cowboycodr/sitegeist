(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const navPanel = document.getElementById("nav-panel");

  if (navToggle && navPanel) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navPanel.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!navPanel.classList.contains("is-open")) return;
      if (navPanel.contains(event.target) || navToggle.contains(event.target)) return;
      setOpen(false);
    });
  }

  const capItems = Array.from(document.querySelectorAll(".cap-item"));
  const panels = Array.from(document.querySelectorAll(".detail-card"));

  const activateCap = (index) => {
    capItems.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
    });
    panels.forEach((panel) => {
      const match = Number(panel.getAttribute("data-panel")) === index;
      panel.hidden = !match;
    });
  };

  capItems.forEach((item) => {
    const index = Number(item.getAttribute("data-cap"));
    item.addEventListener("click", () => activateCap(index));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCap(index);
      }
    });
  });

  const form = document.getElementById("assess-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const fields = ["org", "domain", "email"].map((id) => form.elements.namedItem(id));
      let valid = true;

      fields.forEach((field) => {
        if (!(field instanceof HTMLInputElement)) return;
        const ok = field.value.trim().length > 0 && field.checkValidity();
        field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        status.textContent = "Fill in organization, domain, and a valid work email.";
        status.classList.remove("success");
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
        return;
      }

      const org = String(form.elements.namedItem("org").value || "").trim();
      const scope = String(form.elements.namedItem("scope").value || "full");
      status.textContent = `Assessment queued for ${org} (${scope}). This is a local demo—nothing was sent.`;
      status.classList.add("success");
      form.reset();
      fields.forEach((field) => {
        if (field instanceof HTMLElement) field.classList.remove("invalid");
      });
    });
  }
})();
