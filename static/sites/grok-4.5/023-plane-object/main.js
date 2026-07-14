(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const form = document.getElementById("configure-form");
  const summary = document.getElementById("form-summary");

  const pieceLabels = {
    "low-span": "Low Span",
    "plane-desk": "Plane Desk",
    "bench-block": "Bench Block",
    "frame-cabinet": "Frame Cabinet",
  };

  const finishLabels = {
    oak: "White oak oil",
    ash: "Pale ash oil",
    lino: "Clay linoleum top",
    graphite: "Graphite steel legs",
  };

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const closeNav = () => {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const toggleNav = () => {
    if (!siteNav || !navToggle) return;
    const open = !siteNav.classList.contains("is-open");
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const updateSummary = () => {
    if (!form || !summary) return;
    const data = new FormData(form);
    const piece = pieceLabels[data.get("piece")] || "Piece";
    const span = data.get("span") || "—";
    const finish = finishLabels[data.get("finish")] || "Finish";
    const modules = data.getAll("modules");
    const moduleText = modules.length
      ? ` · ${modules.length} module${modules.length > 1 ? "s" : ""}`
      : "";
    summary.textContent = `${piece} · ${span} cm · ${finish}${moduleText}`;
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
  }

  if (siteNav) {
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  document.addEventListener("click", (event) => {
    if (!siteNav || !navToggle) return;
    if (!siteNav.classList.contains("is-open")) return;
    const target = event.target;
    if (siteNav.contains(target) || navToggle.contains(target)) return;
    closeNav();
  });

  if (form) {
    form.addEventListener("change", updateSummary);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updateSummary();
      summary.textContent = `${summary.textContent} — configuration saved on this device.`;
    });
    updateSummary();
  }
})();
