(() => {
  "use strict";

  /* ---- Suite tabs ---- */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panelFor = (tab) => document.getElementById(tab.getAttribute("aria-controls"));

  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      panelFor(t).hidden = !on;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  /* ---- Reservation form (design fiction, no network) ---- */
  const form = document.getElementById("reserve-form");
  const status = document.getElementById("reserve-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const email = form.elements.email;
      const emailOk = /.+@.+\..+/.test(email.value.trim());
      if (!name.value.trim()) {
        status.textContent = "Please add a name so the concierge can reach you.";
        name.focus();
        return;
      }
      if (!emailOk) {
        status.textContent = "Please enter a valid email for your confirmation.";
        email.focus();
        return;
      }
      const suite = form.elements.suite;
      const label = suite.options[suite.selectedIndex].text;
      status.textContent =
        "Request received — an orbital concierge will confirm your " +
        label + " on the manifest within one working day.";
      form.reset();
    });
  }
})();
