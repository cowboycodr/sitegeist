(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Sticky header state */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile navigation */
  if (navToggle && siteNav) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      siteNav.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.matchMedia("(min-width: 721px)").matches) setOpen(false);
      },
      { passive: true }
    );
  }

  /* Section nav current state */
  const sectionIds = ["experience", "suites", "station", "itinerary", "reserve"];
  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));

  const updateCurrent = () => {
    const y = window.scrollY + 100;
    let current = "";
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) current = id;
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.slice(1);
      if (id && id === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };
  updateCurrent();
  window.addEventListener("scroll", updateCurrent, { passive: true });

  /* Station tour tabs */
  const tabRoot = document.querySelector("[data-tour-panels]");
  if (tabRoot) {
    const tabs = Array.from(tabRoot.querySelectorAll("[data-tour-tab]"));
    const panels = Array.from(tabRoot.querySelectorAll("[data-tour-panel]"));

    const activate = (key, focusTab) => {
      tabs.forEach((tab) => {
        const active = tab.getAttribute("data-tour-tab") === key;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
        if (active && focusTab) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.getAttribute("data-tour-panel") === key;
        panel.classList.toggle("is-active", active);
        if (active) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activate(tab.getAttribute("data-tour-tab") || "", false);
      });

      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = tabs[(index + 1) % tabs.length];
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = tabs[(index - 1 + tabs.length) % tabs.length];
        } else if (event.key === "Home") {
          next = tabs[0];
        } else if (event.key === "End") {
          next = tabs[tabs.length - 1];
        }
        if (next) {
          event.preventDefault();
          activate(next.getAttribute("data-tour-tab") || "", true);
        }
      });
    });
  }

  /* Local-only reservation interest form */
  const form = document.querySelector("[data-reserve-form]");
  const status = document.querySelector("[data-form-status]");

  if (form && status) {
    const storageKey = "perigee-house-interest";

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        Object.keys(saved).forEach((key) => {
          const field = form.elements.namedItem(key);
          if (field && "value" in field && typeof saved[key] === "string") {
            field.value = saved[key];
          }
        });
        status.textContent = "Previously saved interest loaded from this browser.";
        status.classList.add("is-success");
      }
    } catch {
      /* ignore storage errors */
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.classList.remove("is-error", "is-success");

      if (!form.checkValidity()) {
        status.textContent = "Please complete the required fields.";
        status.classList.add("is-error");
        form.reportValidity();
        return;
      }

      const data = {
        name: String(form.elements.namedItem("name")?.value || "").trim(),
        email: String(form.elements.namedItem("email")?.value || "").trim(),
        party: String(form.elements.namedItem("party")?.value || ""),
        suite: String(form.elements.namedItem("suite")?.value || ""),
        window: String(form.elements.namedItem("window")?.value || ""),
        notes: String(form.elements.namedItem("notes")?.value || "").trim(),
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        status.textContent =
          "Interest saved on this device. No network request was made.";
        status.classList.add("is-success");
      } catch {
        status.textContent =
          "Could not write to local storage, but your details were not sent anywhere.";
        status.classList.add("is-error");
      }
    });
  }

  /* Soft smooth focus for in-page anchors when reduced motion is off */
  if (!reduceMotion.matches) {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const id = anchor.getAttribute("href")?.slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        /* let native smooth scroll run; ensure focus for a11y after jump */
        window.setTimeout(() => {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }, 400);
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
})();
