(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Mobile nav */
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");

  const setNavOpen = (open) => {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  };

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  /* Menu tabs */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  const activateTab = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle("is-active", selected);
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panelEl) => {
      const match = panelEl.id === tab.getAttribute("aria-controls");
      panelEl.classList.toggle("is-active", match);
      panelEl.hidden = !match;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        next = tabs[0];
      } else if (event.key === "End") {
        next = tabs[tabs.length - 1];
      }
      if (next) {
        event.preventDefault();
        next.focus();
        activateTab(next);
      }
    });
  });

  /* Reservation form — local only, no network */
  const form = document.getElementById("book-form");
  const status = document.getElementById("form-status");
  const dateInput = document.getElementById("date");

  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  const clearInvalid = () => {
    if (!form) return;
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  };

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearInvalid();
      status.classList.remove("is-error");

      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const date = form.elements.namedItem("date");
      const time = form.elements.namedItem("time");
      const guests = form.elements.namedItem("guests");

      let valid = true;
      const mark = (el) => {
        if (el) el.classList.add("is-invalid");
        valid = false;
      };

      if (!name || !String(name.value).trim()) mark(name);
      if (!email || !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) mark(email);
      if (!date || !date.value) mark(date);
      if (!time || !time.value) mark(time);
      if (!guests || !guests.value) mark(guests);

      if (!valid) {
        status.textContent = "Please complete the required fields.";
        status.classList.add("is-error");
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const guestCount = guests.value;
      const when = new Date(`${date.value}T${time.value}`);
      const whenLabel = when.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      status.textContent = `Request received for ${guestCount} on ${whenLabel}. We’ll confirm by email shortly.`;
      form.reset();
      if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        dateInput.min = `${yyyy}-${mm}-${dd}`;
      }
    });
  }
})();
