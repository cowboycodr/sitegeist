(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const navPanel = document.getElementById("nav-panel");

  if (navToggle && navPanel) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navPanel.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  const captions = [
    "Cab: panoramic glass, quiet drive seat, and a dash that never shouts.",
    "Work bay: lock the Studio Desk mid-cabin—power, light, and cable spine included.",
    "Galley & lounge: cook, fold the ledge, keep the aisle clear nose to tail.",
    "Sleep loft: queen up top, dark-sky panel, climate micro-zone for cool nights."
  ];

  const tourScene = document.getElementById("tour-scene");
  const tourCaption = document.getElementById("tour-caption");
  const tourSteps = Array.from(document.querySelectorAll(".tour-step"));

  const setTourStep = (index) => {
    const step = Math.max(0, Math.min(captions.length - 1, index));
    if (tourScene) tourScene.dataset.step = String(step);
    if (tourCaption) tourCaption.textContent = captions[step];
    tourSteps.forEach((button, i) => {
      const active = i === step;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  };

  tourSteps.forEach((button) => {
    button.addEventListener("click", () => {
      setTourStep(Number(button.dataset.step) || 0);
    });
  });

  const tourRoot = document.getElementById("tour");
  if (tourRoot) {
    tourRoot.addEventListener("keydown", (event) => {
      if (!tourSteps.length) return;
      const current = Number(tourScene?.dataset.step || 0);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setTourStep(current + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setTourStep(current - 1);
      }
    });
  }

  const prices = {
    ridge: { desk: 78400, galley: 81200, loft: 79800 },
    summit: { desk: 89400, galley: 92200, loft: 90800 },
    trail: { desk: 68400, galley: 71200, loft: 69800 }
  };

  const finishNames = {
    pine: "Pine Ridge",
    sand: "Desert Sand",
    slate: "Night Slate"
  };

  const chassisNames = {
    ridge: "Ridge",
    summit: "Summit",
    trail: "Trail"
  };

  const moduleNames = {
    desk: "Studio Desk",
    galley: "Galley Nest",
    loft: "Loft Sleep"
  };

  const form = document.getElementById("configure-form");
  const summaryText = document.getElementById("summary-text");
  const summaryPrice = document.getElementById("summary-price");
  const formStatus = document.getElementById("form-status");

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);

  const readBuild = () => {
    if (!form) return null;
    const data = new FormData(form);
    return {
      chassis: String(data.get("chassis") || "ridge"),
      module: String(data.get("module") || "desk"),
      finish: String(data.get("finish") || "pine")
    };
  };

  const updateSummary = () => {
    const build = readBuild();
    if (!build || !summaryText || !summaryPrice) return;
    const price = prices[build.chassis]?.[build.module] ?? 78400;
    summaryText.textContent = `${chassisNames[build.chassis]} · ${moduleNames[build.module]} · ${finishNames[build.finish]}`;
    summaryPrice.textContent = formatPrice(price);
  };

  if (form) {
    form.addEventListener("change", updateSummary);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updateSummary();
      const build = readBuild();
      try {
        window.localStorage.setItem(
          "offgrid-works-build",
          JSON.stringify({ ...build, savedAt: Date.now() })
        );
      } catch {
        /* storage may be unavailable; still confirm locally */
      }
      if (formStatus) {
        formStatus.hidden = false;
        formStatus.textContent = "Build saved on this device.";
      }
    });

    try {
      const saved = JSON.parse(window.localStorage.getItem("offgrid-works-build") || "null");
      if (saved && typeof saved === "object") {
        ["chassis", "module", "finish"].forEach((name) => {
          if (!saved[name]) return;
          const input = form.querySelector(`input[name="${name}"][value="${saved[name]}"]`);
          if (input) input.checked = true;
        });
      }
    } catch {
      /* ignore corrupt storage */
    }

    updateSummary();
  }
})();
