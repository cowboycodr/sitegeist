(() => {
  "use strict";

  // Highlight the nav link for the section currently in view.
  const links = Array.from(document.querySelectorAll("nav.top a[href^='#']"));
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const byId = new Map(links.map((link) => [link.hash.slice(1), link]));
  const setCurrent = (id) => {
    links.forEach((link) => {
      const current = link.hash.slice(1) === id;
      link.style.borderBottomColor = current ? "var(--rust)" : "";
      link.style.color = current ? "var(--rust)" : "";
      if (current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && byId.has(entry.target.id)) setCurrent(entry.target.id);
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
})();
