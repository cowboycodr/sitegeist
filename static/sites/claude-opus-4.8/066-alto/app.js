(() => {
  "use strict";

  // Mobile navigation toggle
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (toggle && mobileNav) {
    const setNav = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.classList.toggle("open", open);
      mobileNav.hidden = !open;
    };
    toggle.addEventListener("click", () => {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });
  }

  // Space filtering
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll("#spaceGrid .card"));
  const empty = document.getElementById("spaceEmpty");
  if (chips.length && cards.length) {
    const apply = (filter) => {
      let shown = 0;
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ");
        const match = filter === "all" || tags.includes(filter);
        card.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    };
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-selected", String(c === chip));
        });
        apply(chip.dataset.filter);
      });
    });
  }

  // Membership billing toggle
  const monthly = document.getElementById("billMonthly");
  const yearly = document.getElementById("billYearly");
  const amounts = Array.from(document.querySelectorAll(".amount"));
  if (monthly && yearly && amounts.length) {
    const setPeriod = (period) => {
      const isYearly = period === "yearly";
      yearly.classList.toggle("is-active", isYearly);
      monthly.classList.toggle("is-active", !isYearly);
      yearly.setAttribute("aria-pressed", String(isYearly));
      monthly.setAttribute("aria-pressed", String(!isYearly));
      amounts.forEach((el) => {
        el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
      });
    };
    monthly.addEventListener("click", () => setPeriod("monthly"));
    yearly.addEventListener("click", () => setPeriod("yearly"));
  }
})();
