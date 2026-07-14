(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const toast = document.querySelector("[data-toast]");
  const modal = document.querySelector("[data-modal]");
  const modalPanel = document.querySelector("[data-modal-panel]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalCopy = document.querySelector("[data-modal-copy]");
  const modalKicker = document.querySelector("[data-modal-kicker]");
  const modalLabel = document.querySelector("[data-modal-label]");
  const modalHint = document.querySelector("[data-modal-hint]");
  const modalInput = document.querySelector("[data-modal-input]");
  const modalSubmit = document.querySelector("[data-modal-submit]");
  const modalForm = document.querySelector("[data-modal-form]");
  const roomGrid = document.querySelector("[data-room-grid]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

  let lastFocus = null;
  let toastTimer = null;
  let modalMode = "join";

  const modes = {
    join: {
      kicker: "Room access",
      title: "Join a room",
      copy: "Enter a six-character room code shared by a host, or browse open rooms on this page.",
      label: "Room code",
      placeholder: "MOTWN3",
      submit: "Enter room",
      hint: "Tip: codes look like MOTWN3.",
      success: (value) => `Looking for room ${value.toUpperCase()}… this is a local demo.`,
    },
    session: {
      kicker: "New session",
      title: "Start a session",
      copy: "Name your listening room. Friends can join with the code you’ll get after setup.",
      label: "Room name",
      placeholder: "Midnight Motown Circle",
      submit: "Create session",
      hint: "Sessions play one album start to finish.",
      success: (value) => `Session “${value}” staged — demo only, nothing was sent online.`,
    },
  };

  function showToast(message) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = message;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => {
        toast.hidden = true;
        toast.textContent = "";
      }, 300);
    }, 3200);
  }

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function closeMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  }

  function openMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    mobileNav.hidden = false;
  }

  function toggleMobileNav() {
    if (!mobileNav) return;
    if (mobileNav.hidden) openMobileNav();
    else closeMobileNav();
  }

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
  }

  function openModal(mode) {
    if (!modal || !modes[mode]) return;
    modalMode = mode;
    const config = modes[mode];
    lastFocus = document.activeElement;

    modalKicker.textContent = config.kicker;
    modalTitle.textContent = config.title;
    modalCopy.textContent = config.copy;
    modalLabel.textContent = config.label;
    modalInput.placeholder = config.placeholder;
    modalInput.value = "";
    modalSubmit.textContent = config.submit;
    modalHint.innerHTML = config.hint.includes("MOTWN3")
      ? 'Tip: codes look like <code>MOTWN3</code>.'
      : config.hint;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeMobileNav();

    requestAnimationFrame(() => {
      modalInput.focus();
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function applyFilter(filter) {
    if (!roomGrid) return;
    const tiles = roomGrid.querySelectorAll(".room-tile");
    tiles.forEach((tile) => {
      const tags = (tile.getAttribute("data-tags") || "").split(/\s+/);
      const show = filter === "all" || tags.includes(filter);
      tile.classList.toggle("is-hidden", !show);
    });
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileNav);
  }

  document.querySelectorAll("[data-nav-close]").forEach((el) => {
    el.addEventListener("click", () => closeMobileNav());
  });

  document.querySelectorAll("[data-open-join]").forEach((el) => {
    el.addEventListener("click", () => openModal("join"));
  });

  document.querySelectorAll("[data-open-session]").forEach((el) => {
    el.addEventListener("click", () => openModal("session"));
  });

  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", () => closeModal());
  });

  if (modalForm) {
    modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = (modalInput.value || "").trim();
      if (!value) {
        modalInput.focus();
        showToast(
          modalMode === "join"
            ? "Enter a room code to continue."
            : "Give your session a name."
        );
        return;
      }
      const config = modes[modalMode];
      closeModal();
      showToast(config.success(value));
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      applyFilter(filter);
    });
  });

  if (roomGrid) {
    roomGrid.addEventListener("click", (event) => {
      const tile = event.target.closest(".room-tile");
      if (!tile || tile.classList.contains("is-hidden")) return;
      const name = tile.querySelector("h3")?.textContent?.trim() || "this room";
      showToast(`Joining “${name}”… local demo only.`);
    });

    roomGrid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const tile = event.target.closest(".room-tile");
      if (!tile) return;
      event.preventDefault();
      tile.click();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (modal && !modal.hidden) {
        closeModal();
        return;
      }
      if (mobileNav && !mobileNav.hidden) {
        closeMobileNav();
        navToggle?.focus();
      }
      return;
    }

    if (event.key === "Tab" && modal && !modal.hidden && modalPanel) {
      const focusable = getFocusable(modalPanel);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function syncMotion() {
    const waves = document.querySelectorAll("[data-wave]");
    const vinyl = document.querySelector(".vinyl");
    if (reduceMotion.matches) {
      waves.forEach((wave) => {
        wave.querySelectorAll("span").forEach((span) => {
          span.style.animation = "none";
          span.style.opacity = "0.85";
        });
      });
      if (vinyl) vinyl.style.animation = "none";
    } else {
      waves.forEach((wave) => {
        wave.querySelectorAll("span").forEach((span) => {
          span.style.animation = "";
          span.style.opacity = "";
        });
      });
      if (vinyl) vinyl.style.animation = "";
    }
  }
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", syncMotion);
  } else if (reduceMotion.addListener) {
    reduceMotion.addListener(syncMotion);
  }
  syncMotion();
})();
