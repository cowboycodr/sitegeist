(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const ticketForm = document.getElementById("ticket-form");
  const formStatus = document.getElementById("form-status");
  const archiveList = document.getElementById("archive-list");
  const filterButtons = document.querySelectorAll(".chip[data-filter]");

  const prices = {
    general: 14,
    discount: 10,
    member: 8,
    midnight: 12,
  };

  function closeNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }

  function openNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    siteNav.classList.add("is-open");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeNav();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach((other) => {
        other.classList.toggle("is-active", other === button);
      });

      if (!archiveList) return;

      archiveList.querySelectorAll(".archive-item").forEach((item) => {
        const strand = item.getAttribute("data-strand");
        const show = filter === "all" || strand === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  if (ticketForm && formStatus) {
    ticketForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const screening = ticketForm.querySelector("#screening");
      const countField = ticketForm.querySelector("#tickets-count");
      const typeField = ticketForm.querySelector("#ticket-type");
      const nameField = ticketForm.querySelector("#guest-name");
      const emailField = ticketForm.querySelector("#guest-email");

      formStatus.classList.remove("is-error");
      formStatus.textContent = "";

      if (
        !screening ||
        !countField ||
        !typeField ||
        !nameField ||
        !emailField ||
        !ticketForm.checkValidity()
      ) {
        formStatus.classList.add("is-error");
        formStatus.textContent = "Please complete every field to hold your seats.";
        ticketForm.reportValidity();
        return;
      }

      const count = Number(countField.value) || 1;
      const type = typeField.value;
      const unit = prices[type] ?? 14;
      const total = unit * count;
      const label =
        screening.options[screening.selectedIndex]?.text || "your screening";
      const guest = nameField.value.trim();

      formStatus.textContent =
        "Held for " +
        guest +
        " — " +
        count +
        (count === 1 ? " seat" : " seats") +
        " for " +
        label +
        ". Total $" +
        total +
        ". Show this confirmation at the box office.";

      ticketForm.reset();
      countField.value = "2";
    });
  }

  // Mark current nav section while scrolling (lightweight)
  const sectionIds = ["tonight", "program", "series", "archive", "visit", "tickets"];
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');

  if ("IntersectionObserver" in window && navLinks.length) {
    const linkMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute("href")?.slice(1);
      if (id) linkMap.set(id, link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => link.removeAttribute("aria-current"));
          const active = linkMap.get(id);
          if (active) active.setAttribute("aria-current", "true");
        });
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: 0.01,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
