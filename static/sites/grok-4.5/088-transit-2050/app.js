(() => {
  "use strict";

  const routes = {
    a: {
      name: "Line A — Waterfront Express",
      detail:
        "High-frequency electric rail connecting the port district to the civic core every 4 minutes at peak. Priority signals and dedicated ROW cut end-to-end time by 18 minutes.",
    },
    b: {
      name: "Line B — Cross-Town Spine",
      detail:
        "A bidirectional bus rapid corridor with all-door boarding, level platforms, and protected stations. Serves 12 neighborhoods currently more than 20 minutes from rapid service.",
    },
    c: {
      name: "Line C — Green Loop",
      detail:
        "An orbital light-rail ring linking university, hospital, and industrial job centers without forcing a downtown transfer. Fully battery-assisted and zero-emission.",
    },
    d: {
      name: "Line D — Equity Extension",
      detail:
        "Night and early-morning service upgrades for shift workers, plus free transfers within 90 minutes. Fare integration designed with community boards in four priority districts.",
    },
  };

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const routeCards = document.querySelectorAll(".route-card");
  const detailTitle = document.getElementById("route-detail-title");
  const detailBody = document.getElementById("route-detail-body");
  const mapHighlights = document.querySelectorAll("[data-route-line]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setActiveRoute(id) {
    const data = routes[id];
    if (!data || !detailTitle || !detailBody) return;

    detailTitle.textContent = data.name;
    detailBody.textContent = data.detail;

    routeCards.forEach((card) => {
      const active = card.getAttribute("data-route") === id;
      card.setAttribute("aria-pressed", active ? "true" : "false");
    });

    mapHighlights.forEach((el) => {
      const match = el.getAttribute("data-route-line") === id;
      el.style.opacity = match ? "1" : "0.28";
      el.style.strokeWidth = match ? "7" : "4.5";
    });
  }

  routeCards.forEach((card) => {
    card.addEventListener("click", () => {
      setActiveRoute(card.getAttribute("data-route"));
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveRoute(card.getAttribute("data-route"));
      }
    });
  });

  setActiveRoute("a");

  // Soft reveal for sections when motion is allowed
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".pillar, .route-card, .timeline-item, .stat");
    targets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
  }
})();
