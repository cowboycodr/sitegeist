(() => {
  "use strict";

  const tabs = Array.from(document.querySelectorAll(".era-tab"));
  if (!tabs.length) return;

  const panelFor = (tab) => document.getElementById(tab.getAttribute("aria-controls"));

  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      panelFor(tab).hidden = !active;
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index, false));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      let next = null;
      if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
      else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = last;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });
  });

  select(0, false);

  // Reveal sections as they enter view; static fallback if unsupported.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!("IntersectionObserver" in window) || reduced.matches) return;

  const targets = document.querySelectorAll(".specimen, .ext-item, .section-head");
  targets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = "1";
      entry.target.style.transform = "none";
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  targets.forEach((el) => observer.observe(el));
})();
