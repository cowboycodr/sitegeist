(() => {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const filmCards = document.querySelectorAll(".film-card");
  const watchTriggers = document.querySelectorAll("[data-open-watch]");
  const dialog = document.getElementById("watch-dialog");
  const dialogClose = dialog ? dialog.querySelector(".dialog-close") : null;
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Mobile navigation */
  if (navToggle && siteNav) {
    const setNav = (open) => {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      siteNav.classList.toggle("is-open", open);
      if (open) {
        siteNav.querySelector("a")?.focus();
      }
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNav(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        navToggle.focus();
      }
    });
  }

  /* Program filters */
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === button ? "true" : "false");
      });

      filmCards.forEach((card) => {
        const day = card.getAttribute("data-day") || "";
        const show = filter === "all" || day === filter;
        card.hidden = !show;
      });
    });
  });

  /* Watch / program dialog */
  let lastFocus = null;

  const openDialog = () => {
    if (!dialog) return;
    lastFocus = document.activeElement;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    dialogClose?.focus();
  };

  const closeDialog = () => {
    if (!dialog) return;
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  };

  watchTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openDialog();
    });
  });

  dialogClose?.addEventListener("click", closeDialog);

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog && !dialog.hidden) {
      closeDialog();
    }
  });

  /* Current section highlight for in-page nav */
  const sections = ["program", "voices", "about", "visit"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const match = link.getAttribute("href") === `#${id}`;
            if (match) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
