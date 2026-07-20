(() => {
  "use strict";

  const form = document.getElementById("seat-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  const seatWords = {
    "1": "one fork",
    "2": "two forks",
    "3": "three forks",
    "4": "a whole table of forks",
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = form.elements["guest-name"];
    const name = nameInput.value.trim();
    if (!name) {
      note.textContent = "The chalkboard needs a name — any name. Even a fake one.";
      note.classList.add("is-error");
      nameInput.focus();
      return;
    }
    const seats = new FormData(form).get("seats") || "1";
    note.classList.remove("is-error");
    note.textContent =
      "Chalked in: " + name + ", " + (seatWords[seats] || "one fork") +
      ". The address lands 24 hours before the first bubble. Bring wine.";
  });
})();
