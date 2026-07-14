(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const form = document.getElementById("finder-form");
  const result = document.getElementById("finder-result");
  const resultName = document.getElementById("result-name");
  const resultText = document.getElementById("result-text");
  const resultLink = document.getElementById("result-link");

  const scents = {
    cinder: {
      name: "Cinder Veil",
      id: "scent-cinder",
      text:
        "Warm resin, charred wood, and a soft ash trail. Cinder Veil is the scent of a room after the fire has gone quiet — intimate, smoked, and lingering close to skin.",
    },
    slate: {
      name: "Slate Rain",
      id: "scent-slate",
      text:
        "Wet stone, iris, and cool metallic air. Slate Rain wears like midnight streets after rain — clean, mineral, and quietly present.",
    },
    luna: {
      name: "Luna Bloom",
      id: "scent-luna",
      text:
        "Night jasmine and tuberose over dark green wood. Luna Bloom is a garden that only opens after dusk — floral, luminous, and unhurried.",
    },
    front: {
      name: "Front",
      id: "scent-front",
      text:
        "Ozone, cold wind, and the charge before thunder. Front is weather bottled — electric, open, and ready for the deep hours of night.",
    },
  };

  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    siteNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

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
      if (window.matchMedia("(min-width: 720px)").matches) {
        setNavOpen(false);
      }
    });
  }

  function resolveScent(when, mood, presence) {
    if (mood === "smoke") return scents.cinder;
    if (mood === "mineral") return scents.slate;
    if (mood === "flower") return scents.luna;
    if (mood === "weather") return scents.front;

    if (when === "dawn") return scents.slate;
    if (when === "night" && presence === "bold") return scents.luna;
    if (presence === "close") return scents.slate;
    return scents.front;
  }

  if (form && result && resultName && resultText && resultLink) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const when = data.get("when");
      const mood = data.get("mood");
      const presence = data.get("presence");

      if (!when || !mood || !presence) {
        const firstEmpty = form.querySelector(
          'input[name="when"]:not(:checked), input[name="mood"]:not(:checked), input[name="presence"]:not(:checked)'
        );
        const fieldset = firstEmpty
          ? form.querySelector(
              `input[name="${firstEmpty.name}"]`
            )?.closest("fieldset")
          : null;
        if (fieldset) {
          fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
          const firstRadio = fieldset.querySelector('input[type="radio"]');
          if (firstRadio) firstRadio.focus();
        }
        return;
      }

      const match = resolveScent(String(when), String(mood), String(presence));
      resultName.textContent = match.name;
      resultText.textContent = match.text;
      resultLink.href = "#" + match.id;
      result.hidden = false;
      result.focus();
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    form.addEventListener("reset", () => {
      result.hidden = true;
      resultName.textContent = "";
      resultText.textContent = "";
      resultLink.href = "#collection";
    });
  }
})();
