(() => {
  "use strict";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile nav */
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Mood / energy selection */
  function wireToggleGroup(selector) {
    const buttons = Array.from(document.querySelectorAll(selector));
    if (!buttons.length) return { get: () => null };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
      });
    });

    return {
      get() {
        const active = buttons.find(
          (b) => b.getAttribute("aria-pressed") === "true"
        );
        return active ? active.dataset.value || active.textContent.trim() : null;
      },
    };
  }

  const mood = wireToggleGroup(".mood-btn");
  const energy = wireToggleGroup(".energy-btn");

  const form = document.getElementById("checkin-form");
  const result = document.getElementById("checkin-result");
  const resultTitle = document.getElementById("checkin-result-title");
  const resultBody = document.getElementById("checkin-result-body");
  const note = document.getElementById("checkin-note");
  const resetBtn = document.getElementById("checkin-reset");

  const reflections = {
    steady: {
      title: "A steady day deserves gentle notice.",
      body: "Evenness is a form of care. Keep one small anchor today—water, a short walk, or a note you will share with your therapist when you are ready.",
    },
    heavy: {
      title: "Heavy feelings are allowed here.",
      body: "You do not have to fix the whole day. Choose one kind boundary, rest when you can, and let this check-in be enough for now.",
    },
    bright: {
      title: "Hold a little of this brightness.",
      body: "Name what is supporting you so it is easier to find again. Save a sentence for later—future you will be glad you did.",
    },
    restless: {
      title: "Restlessness can be information.",
      body: "Channel a few minutes into movement or a grounding breath before you decide the next task. Small structure often softens the edge.",
    },
    tender: {
      title: "Tenderness asks for patience.",
      body: "Slow the pace where you can. A warm drink, softer lighting, and honest language with yourself all count as real care.",
    },
  };

  const energyNote = {
    "1": "Energy is low—protect the essentials and postpone what can wait.",
    "2": "A quiet pace fits. One meaningful step is still progress.",
    "3": "A middle gear day. Balance effort with recovery.",
    "4": "You have some fuel—use it on what matters most.",
    "5": "High energy can scatter. Point it at one clear intention.",
  };

  function showResult(title, body) {
    if (!result || !resultTitle || !resultBody) return;
    resultTitle.textContent = title;
    resultBody.textContent = body;
    result.classList.add("is-visible");
    if (!prefersReduced) {
      result.setAttribute("tabindex", "-1");
      result.focus({ preventScroll: false });
    }
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const moodValue = mood.get();
      const energyValue = energy.get();

      if (!moodValue) {
        showResult(
          "Choose how you feel first.",
          "Pick a mood that is close enough. Precision is optional; honesty is the point."
        );
        return;
      }

      const base = reflections[moodValue] || reflections.steady;
      const energyLine =
        energyValue && energyNote[energyValue]
          ? " " + energyNote[energyValue]
          : "";
      const noteText = note && note.value.trim() ? " Your note is private on this device and stays with you." : "";

      showResult(base.title, base.body + energyLine + noteText);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document
        .querySelectorAll('.mood-btn[aria-pressed="true"], .energy-btn[aria-pressed="true"]')
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
      if (note) note.value = "";
      if (result) {
        result.classList.remove("is-visible");
        resultTitle.textContent = "";
        resultBody.textContent = "";
      }
    });
  }

  /* Guided practices expand */
  document.querySelectorAll(".practice-toggle").forEach((btn) => {
    const targetId = btn.getAttribute("aria-controls");
    const panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) return;

    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      const next = !pressed;
      btn.setAttribute("aria-pressed", next ? "true" : "false");
      btn.textContent = next ? "Hide steps" : "Show steps";
      panel.classList.toggle("is-open", next);
      panel.hidden = !next;
    });
  });
})();
