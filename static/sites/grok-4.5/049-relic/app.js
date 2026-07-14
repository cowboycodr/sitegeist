(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const pieces = document.querySelectorAll(".piece");
  const sellForm = document.getElementById("sell-form");
  const formStatus = document.getElementById("form-status");

  const setNavOpen = (open) => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    siteNav.classList.toggle("is-open", open);
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 860px)").matches) {
        setNavOpen(false);
      }
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach((other) => {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });

      pieces.forEach((piece) => {
        const category = piece.getAttribute("data-category");
        const show = filter === "all" || category === filter;
        piece.classList.toggle("is-hidden", !show);
      });
    });
  });

  if (sellForm && formStatus) {
    sellForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formStatus.dataset.state = "";

      const objectName = sellForm.querySelector("#object-name");
      const objectCat = sellForm.querySelector("#object-cat");
      const objectNotes = sellForm.querySelector("#object-notes");

      const name = (objectName && objectName.value || "").trim();
      const cat = (objectCat && objectCat.value || "").trim();
      const notes = (objectNotes && objectNotes.value || "").trim();

      if (!name || !cat || !notes) {
        formStatus.dataset.state = "error";
        formStatus.textContent = "Please complete all fields before requesting a review.";
        return;
      }

      formStatus.dataset.state = "";
      formStatus.textContent =
        "Intake note saved locally. A curator would follow up with photography next—nothing was sent online.";
      sellForm.reset();
    });
  }
})();
