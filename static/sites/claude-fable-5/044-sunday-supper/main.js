(() => {
  "use strict";

  const form = document.getElementById("booking-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  const dayNames = {
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };

  const timeNames = {
    "17:00": "5:00",
    "17:45": "5:45",
    "18:30": "6:30",
    "19:15": "7:15",
    "20:00": "8:00",
    "20:45": "8:45",
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.elements.name;
    const phone = form.elements.phone;
    let firstInvalid = null;

    for (const field of [name, phone]) {
      const empty = field.value.trim() === "";
      field.setAttribute("aria-invalid", empty ? "true" : "false");
      if (empty && !firstInvalid) firstInvalid = field;
    }

    if (firstInvalid) {
      status.classList.add("is-error");
      status.textContent = "Please add your name and a phone number so we can confirm.";
      firstInvalid.focus();
      return;
    }

    const day = dayNames[form.elements.day.value] || "Sunday";
    const time = timeNames[form.elements.time.value] || "7:15";
    const party = form.elements.party.value;

    status.classList.remove("is-error");
    status.textContent =
      "Thank you, " + name.value.trim() + " — we have your request for " +
      party + " on " + day + " at " + time + ". We'll ring you shortly to confirm.";

    form.reset();
  });

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement && field.getAttribute("aria-invalid") === "true") {
      if (field.value.trim() !== "") field.setAttribute("aria-invalid", "false");
    }
  });
})();
