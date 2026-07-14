(() => {
  "use strict";

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const $ = (id) => document.getElementById(id);

  const startEl = $("start-balance");
  const monthlyEl = $("monthly");
  const yearsEl = $("years");
  const returnEl = $("return-rate");

  const startLabel = $("start-balance-label");
  const monthlyLabel = $("monthly-label");
  const yearsLabel = $("years-label");
  const returnLabel = $("return-label");
  const futureValueEl = $("future-value");
  const totalContributedEl = $("total-contributed");
  const growthEarnedEl = $("growth-earned");
  const barContrib = $("bar-contrib");
  const barGrowth = $("bar-growth");
  const heroProjection = $("hero-projection");

  function futureValue(principal, monthly, years, annualRate) {
    const months = Math.max(0, Math.round(years * 12));
    const r = annualRate / 100 / 12;
    if (r === 0) {
      return principal + monthly * months;
    }
    const growthFactor = Math.pow(1 + r, months);
    const fvPrincipal = principal * growthFactor;
    const fvAnnuity = monthly * ((growthFactor - 1) / r);
    return fvPrincipal + fvAnnuity;
  }

  function updatePlanner() {
    if (!startEl || !monthlyEl || !yearsEl || !returnEl) return;

    const principal = Number(startEl.value);
    const monthly = Number(monthlyEl.value);
    const years = Number(yearsEl.value);
    const annualRate = Number(returnEl.value);

    startLabel.textContent = currency.format(principal);
    monthlyLabel.textContent = currency.format(monthly);
    yearsLabel.textContent = years === 1 ? "1 year" : `${years} years`;
    returnLabel.textContent = `${annualRate.toFixed(1)}%`;

    const fv = futureValue(principal, monthly, years, annualRate);
    const contributed = principal + monthly * years * 12;
    const growth = Math.max(0, fv - contributed);
    const total = Math.max(fv, 1);
    const contribPct = Math.min(100, Math.max(0, (contributed / total) * 100));
    const growthPct = Math.min(100, Math.max(0, 100 - contribPct));

    const formatted = currency.format(Math.round(fv));
    futureValueEl.textContent = formatted;
    totalContributedEl.textContent = currency.format(Math.round(contributed));
    growthEarnedEl.textContent = currency.format(Math.round(growth));
    barContrib.style.width = `${contribPct}%`;
    barGrowth.style.width = `${growthPct}%`;

    if (heroProjection) {
      heroProjection.textContent = formatted;
    }
  }

  [startEl, monthlyEl, yearsEl, returnEl].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", updatePlanner);
    el.addEventListener("change", updatePlanner);
  });

  updatePlanner();

  // Sticky header state
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = $("nav-toggle");
  const nav = $("primary-nav");

  function setNavOpen(open) {
    if (!header || !toggle) return;
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = !header.classList.contains("nav-open");
      setNavOpen(open);
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  // FAQ: one open at a time for cleaner keyboard flow (optional UX)
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
