(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealables = Array.from(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach((el) => observer.observe(el));
  }

  /* ---------- Stat count-up ---------- */
  const stats = Array.from(document.querySelectorAll(".stat-num[data-count]"));
  const animateStat = (el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (prefersReduced || !Number.isFinite(target)) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (stats.length) {
    if (!("IntersectionObserver" in window)) {
      stats.forEach(animateStat);
    } else {
      const statObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      stats.forEach((el) => statObs.observe(el));
    }
  }

  /* ---------- Portfolio filter ---------- */
  const filters = Array.from(document.querySelectorAll(".filter"));
  const companies = Array.from(document.querySelectorAll(".company"));
  const emptyMsg = document.getElementById("companyEmpty");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.filter;
      filters.forEach((f) => {
        const active = f === btn;
        f.classList.toggle("is-active", active);
        f.setAttribute("aria-selected", String(active));
      });
      let visible = 0;
      companies.forEach((card) => {
        const show = value === "all" || card.dataset.domain === value;
        card.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });
      if (emptyMsg) emptyMsg.hidden = visible !== 0;
    });
  });

  /* ---------- Pitch form validation ---------- */
  const form = document.getElementById("pitchForm");
  const status = document.getElementById("formStatus");
  if (form) {
    const showError = (name, message) => {
      const field = form.querySelector(`[name="${name}"]`).closest(".field");
      const errorEl = form.querySelector(`.error[data-for="${name}"]`);
      if (field) field.classList.toggle("invalid", Boolean(message));
      if (errorEl) errorEl.textContent = message || "";
    };
    const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = {
        founder: form.founder.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
        pitch: form.pitch.value.trim(),
      };
      let ok = true;
      if (!data.founder) { showError("founder", "Tell us who you are."); ok = false; } else showError("founder");
      if (!validEmail(data.email)) { showError("email", "A valid email, please."); ok = false; } else showError("email");
      if (!data.company) { showError("company", "What is it called?"); ok = false; } else showError("company");
      if (data.pitch.length < 12) { showError("pitch", "A sentence or two, at least."); ok = false; } else showError("pitch");

      if (!ok) {
        if (status) { status.textContent = "Please fix the highlighted fields."; status.classList.remove("ok"); }
        return;
      }
      form.reset();
      if (status) {
        status.textContent = `Thanks, ${data.founder.split(" ")[0]} — your pitch is in. A partner will reply within five business days.`;
        status.classList.add("ok");
      }
    });

    form.addEventListener("input", (event) => {
      const name = event.target.name;
      if (name && form.querySelector(`.error[data-for="${name}"]`)) showError(name);
    });
  }
})();
