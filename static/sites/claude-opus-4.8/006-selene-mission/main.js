(() => {
  "use strict";

  // Launch window: the next month boundary at least ~34 days out, so the
  // countdown always reads as a real, forward-looking window without a server.
  const now = new Date();
  const target = new Date(now.getTime());
  target.setUTCDate(1);
  target.setUTCHours(14, 0, 0, 0);
  target.setUTCMonth(target.getUTCMonth() + 2);

  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };

  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    let diff = Math.max(0, target.getTime() - Date.now());
    const days = Math.floor(diff / 86400000);
    diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000);
    diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    els.days.textContent = String(days);
    els.hours.textContent = pad(hours);
    els.mins.textContent = pad(mins);
    els.secs.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);

  // Smooth-scroll for same-page anchors while keeping keyboard focus sane.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      const dest = document.getElementById(id);
      if (!dest) return;
      event.preventDefault();
      dest.scrollIntoView({ behavior: "smooth", block: "start" });
      dest.setAttribute("tabindex", "-1");
      dest.focus({ preventScroll: true });
    });
  });
})();
