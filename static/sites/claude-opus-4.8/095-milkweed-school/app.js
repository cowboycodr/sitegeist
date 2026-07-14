(() => {
  "use strict";

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (toggle && list) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      list.classList.toggle("open", open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    list.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- season tabs ---------- */
  const tabs = Array.from(document.querySelectorAll('.season-tab[role="tab"]'));
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next);
        next.focus();
      }
    });
  });

  /* ---------- open-day form (no network; local confirmation only) ---------- */
  const form = document.getElementById("visit-form");
  const note = document.getElementById("form-note");
  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      note.classList.remove("ok", "err");
      if (!name || !validEmail) {
        note.textContent = "Please add your name and a valid email so we can hold your place.";
        note.classList.add("err");
        return;
      }
      const first = name.split(/\s+/)[0];
      note.textContent = "Thanks, " + first + " — your place is pencilled in. Bring wellies and we'll see you at the fire circle.";
      note.classList.add("ok");
      form.reset();
    });
  }
})();
