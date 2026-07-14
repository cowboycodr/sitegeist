(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const navPanel = document.getElementById("nav-panel");
  const toast = document.getElementById("toast");
  let toastTimer = 0;

  function setMenuOpen(open) {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      navPanel.hidden = false;
    } else {
      navPanel.hidden = true;
    }
  }

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });

    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  }

  document.querySelectorAll(".product").forEach((product) => {
    const sizes = product.querySelectorAll(".size:not(:disabled)");
    const addBtn = product.querySelector(".add-btn");
    const name = product.querySelector("h3")?.textContent?.trim() || "Piece";

    sizes.forEach((size) => {
      size.addEventListener("click", () => {
        sizes.forEach((other) => other.setAttribute("aria-pressed", "false"));
        size.setAttribute("aria-pressed", "true");
      });
    });

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const selected = product.querySelector('.size[aria-pressed="true"]');
        if (!selected) {
          showToast("Select a size first");
          const first = sizes[0];
          if (first) first.focus();
          return;
        }
        showToast(`${name} · size ${selected.textContent.trim()} added`);
      });
    }
  });
})();
