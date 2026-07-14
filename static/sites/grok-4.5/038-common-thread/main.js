(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const notice = document.getElementById("notice");
  let noticeTimer = null;

  function setScrolled() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  function showNotice(message) {
    if (!notice) return;
    notice.textContent = message;
    notice.classList.add("is-visible");
    notice.setAttribute("role", "status");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      notice.classList.remove("is-visible");
    }, 3200);
  }

  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const action = el.getAttribute("data-action");
      if (action === "shop") {
        showNotice("Edition 04 is ready in-store and online. Thank you for shopping slower.");
      } else if (action === "trace") {
        const target = document.getElementById("materials");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          const firstToggle = target.querySelector(".fiber-toggle");
          if (firstToggle) firstToggle.focus({ preventScroll: true });
        }
      } else if (action === "repair") {
        showNotice("Repair request noted. Mail-in kits ship free within 48 hours.");
      }
    });
  });

  document.querySelectorAll(".fiber-item").forEach((item) => {
    const button = item.querySelector(".fiber-toggle");
    const panel = item.querySelector(".fiber-panel");
    if (!button || !panel) return;

    const panelId = panel.id || `fiber-panel-${Math.random().toString(36).slice(2, 8)}`;
    panel.id = panelId;
    button.setAttribute("aria-controls", panelId);
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".fiber-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          const otherBtn = openItem.querySelector(".fiber-toggle");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("is-open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // Open first fiber by default for clarity
  const firstFiber = document.querySelector(".fiber-item");
  if (firstFiber) {
    firstFiber.classList.add("is-open");
    const btn = firstFiber.querySelector(".fiber-toggle");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }
})();
