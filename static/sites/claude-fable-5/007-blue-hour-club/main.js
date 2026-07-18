(() => {
  "use strict";

  const form = document.getElementById("reserve-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  const requiredFields = ["f-name", "f-phone", "f-night", "f-party"].map((id) =>
    document.getElementById(id),
  );

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field.value.trim()) field.removeAttribute("aria-invalid");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const missing = requiredFields.filter((field) => !field.value.trim());
    missing.forEach((field) => field.setAttribute("aria-invalid", "true"));

    if (missing.length) {
      status.classList.add("error");
      status.textContent =
        "We need your name, phone, night, and party size before we can hold a table.";
      missing[0].focus();
      return;
    }

    const name = document.getElementById("f-name").value.trim();
    const night = document.getElementById("f-night").value.split("—")[0].trim();
    const party = document.getElementById("f-party").value.trim();

    status.classList.remove("error");
    status.textContent = `You're in the book, ${name} — table for ${party} on ${night}. We'll ring that afternoon to confirm. See you after dark.`;
    form.reset();
  });
})();
