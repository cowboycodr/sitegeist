(() => {
  "use strict";

  /* ---------- Collection filtering ---------- */
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".card"));
  const status = document.querySelector(".filter-status");

  const labels = {
    all: "all",
    furniture: "furniture",
    lighting: "lighting",
    objects: "everyday things",
  };

  const applyFilter = (filter) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    chips.forEach((chip) => {
      const active = chip.dataset.filter === filter;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    if (status) {
      status.textContent =
        filter === "all"
          ? `Showing all ${shown} objects.`
          : `Showing ${shown} ${labels[filter]} object${shown === 1 ? "" : "s"}.`;
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
  });

  /* ---------- Consignment form ---------- */
  const form = document.getElementById("sell-form");
  const formStatus = document.getElementById("form-status");

  if (form && formStatus) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const required = Array.from(form.querySelectorAll("[required]"));
      let firstInvalid = null;
      required.forEach((field) => {
        const valid = field.value.trim() !== "";
        field.setAttribute("aria-invalid", String(!valid));
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        formStatus.textContent =
          "Please tell us your name, the object, and its era before sending.";
        formStatus.className = "form-status is-error";
        firstInvalid.focus();
        return;
      }

      const objectName = form.elements["object-name"].value.trim();
      form.reset();
      required.forEach((field) => field.removeAttribute("aria-invalid"));
      formStatus.textContent = `Received. An appraiser will write to you about “${objectName}” within two working days.`;
      formStatus.className = "form-status is-success";
    });
  }
})();
