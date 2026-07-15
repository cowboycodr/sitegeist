(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header shadow */
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile nav */
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* Menu tabs */
  const tablist = document.querySelector("[data-tabs]");
  if (tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const select = (tab) => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !active;
      });
    };
    tablist.addEventListener("click", (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });
    tablist.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next);
        next.focus();
      }
    });
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".section-head, .dish, .pour, .visit-card, .fire-copy, .fire-art, .reserve-form");
  if (!reduceMotion && "IntersectionObserver" in window) {
    revealEls.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* Toast helper */
  const toastEl = document.querySelector("[data-toast]");
  let toastTimer = 0;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
      window.setTimeout(() => { toastEl.hidden = true; }, 400);
    }, 4200);
  };

  /* Reservation form — no network; confirm locally */
  const form = document.querySelector("[data-reserve]");
  if (form) {
    const status = form.querySelector("[data-status]");
    const dateInput = form.querySelector("#r-date");
    if (dateInput) {
      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
      dateInput.min = iso;
      if (!dateInput.value) dateInput.value = iso;
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#r-name");
      if (!name.value.trim()) {
        status.textContent = "Please add a name so we know who to hold the table for.";
        status.classList.add("is-error");
        name.focus();
        return;
      }
      const guests = form.querySelector("#r-guests").value;
      const date = form.querySelector("#r-date").value;
      const time = form.querySelector("#r-time").value;
      status.classList.remove("is-error");
      status.textContent = `Gracias, ${name.value.trim().split(" ")[0]} — request received. We'll confirm your table before tonight.`;
      let pretty = "";
      if (date) {
        const d = new Date(date + "T00:00:00");
        pretty = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      }
      toast(`Table for ${guests} requested${pretty ? " · " + pretty : ""}${time ? " · " + time : ""}`);
    });
  }

  /* Smooth-scroll focus management for in-page anchors */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      const restore = target.getAttribute("tabindex");
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (restore === null) target.removeAttribute("tabindex");
    });
  });
})();
