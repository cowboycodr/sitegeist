(() => {
  "use strict";

  /* -------- drop countdown -------- */
  // Fixed close time for Drop 07, computed from load so the clock always reads live.
  const clock = document.getElementById("clock");
  if (clock) {
    const fields = {
      d: clock.querySelector('[data-u="d"]'),
      h: clock.querySelector('[data-u="h"]'),
      m: clock.querySelector('[data-u="m"]'),
      s: clock.querySelector('[data-u="s"]'),
    };
    // Close window: 3 days, 7 hours out from first view — no restock after.
    const deadline = Date.now() + ((3 * 24 + 7) * 60 + 42) * 60 * 1000;
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let left = Math.max(0, deadline - Date.now());
      const s = Math.floor(left / 1000);
      fields.d.textContent = pad(Math.floor(s / 86400));
      fields.h.textContent = pad(Math.floor((s % 86400) / 3600));
      fields.m.textContent = pad(Math.floor((s % 3600) / 60));
      fields.s.textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* -------- bag / acquire -------- */
  const bagBtn = document.getElementById("bag");
  const bagCount = bagBtn ? bagBtn.querySelector(".count") : null;
  const bag = new Set();
  const syncBag = () => {
    if (!bagCount) return;
    bagCount.textContent = String(bag.size);
    bagBtn.setAttribute("aria-label", `Bag, ${bag.size} unit${bag.size === 1 ? "" : "s"}`);
    bagBtn.classList.add("flash");
    setTimeout(() => bagBtn.classList.remove("flash"), 250);
  };

  document.querySelectorAll(".acquire").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      btn.textContent = on ? "Acquire" : "In bag ✓";
      if (on) bag.delete(id); else bag.add(id);
      syncBag();
    });
  });

  if (bagBtn) {
    bagBtn.addEventListener("click", () => {
      const strip = document.getElementById("bag-note");
      if (!strip) return;
      strip.textContent = bag.size
        ? `${bag.size} unit${bag.size === 1 ? "" : "s"} held · checkout opens at drop close`
        : "Bag empty · select units from Drop 07";
      strip.hidden = false;
      clearTimeout(strip._t);
      strip._t = setTimeout(() => { strip.hidden = true; }, 3600);
    });
  }

  /* -------- lookbook viewer -------- */
  const dialog = document.getElementById("viewer");
  if (dialog && typeof dialog.showModal === "function") {
    const body = dialog.querySelector(".viewer-body");
    const titleEl = dialog.querySelector("[data-vt]");
    const metaEl = dialog.querySelector("[data-vm]");
    document.querySelectorAll(".look").forEach((look) => {
      look.addEventListener("click", () => {
        const svg = look.querySelector("svg");
        body.innerHTML = "";
        if (svg) body.appendChild(svg.cloneNode(true));
        titleEl.textContent = look.dataset.title || "";
        metaEl.textContent = look.dataset.meta || "";
        dialog.showModal();
      });
    });
    dialog.querySelector(".viewer-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  /* -------- signup (client-side only; no network) -------- */
  const form = document.getElementById("signup-form");
  if (form) {
    const input = form.querySelector("input");
    const note = form.querySelector(".note");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (input.value || "").trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        note.textContent = "> invalid address — try again";
        note.style.color = "var(--alarm)";
        input.focus();
        return;
      }
      note.textContent = "> access requested — you're on the roster";
      note.style.color = "var(--acid)";
      input.value = "";
    });
  }

  /* -------- current year -------- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
