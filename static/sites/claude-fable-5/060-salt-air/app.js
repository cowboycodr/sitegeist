(() => {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");

  const closeNav = () => {
    navList.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  navList.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navList.classList.contains("open")) {
      closeNav();
      toggle.focus();
    }
  });

  const form = document.querySelector(".book-form");
  const status = form.querySelector(".form-status");
  const nameField = document.getElementById("f-name");
  const arriveField = document.getElementById("f-arrive");
  const departField = document.getElementById("f-depart");

  const setInvalid = (field, invalid) => {
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameField.value.trim();
    const arrive = arriveField.value;
    const depart = departField.value;

    setInvalid(nameField, !name);
    setInvalid(arriveField, !arrive);
    setInvalid(departField, !depart || (arrive && depart <= arrive));

    status.classList.remove("ok", "err");

    if (!name || !arrive || !depart) {
      status.textContent = "We just need your name and both dates to write back.";
      status.classList.add("err");
      return;
    }
    if (depart <= arrive) {
      status.textContent = "Your leaving date should fall after your arrival — even our slowest mornings end eventually.";
      status.classList.add("err");
      return;
    }

    status.textContent = `Thank you, ${name} — your note is on the desk. We'll write back within a day with what's free.`;
    status.classList.add("ok");
    form.reset();
  });
})();
