(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  const toast = document.querySelector(".toast");
  let toastTimer = 0;

  /* Sticky header state */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  if (toggle && drawer) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.classList.toggle("is-open", open);
      drawer.hidden = !open;
    };

    setOpen(false);

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 800px)").matches) {
        setOpen(false);
      }
    });
  }

  /* Toast */
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2400);
  };

  /* Product add */
  document.querySelectorAll(".product-add").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-product") || "Ritual step";
      const pressed = button.getAttribute("aria-pressed") === "true";
      if (pressed) {
        button.setAttribute("aria-pressed", "false");
        button.textContent = "Add to ritual";
        showToast(`Removed ${name}`);
      } else {
        button.setAttribute("aria-pressed", "true");
        button.textContent = "In your ritual";
        showToast(`${name} added to ritual`);
      }
    });
  });

  /* Skin quiz */
  const quiz = document.querySelector("[data-quiz]");
  if (!quiz) return;

  const steps = Array.from(quiz.querySelectorAll(".quiz-step"));
  const progressDots = Array.from(quiz.querySelectorAll(".quiz-progress span"));
  const btnBack = quiz.querySelector("[data-quiz-back]");
  const btnNext = quiz.querySelector("[data-quiz-next]");
  const btnRestart = quiz.querySelector("[data-quiz-restart]");
  const answers = {};
  let index = 0;

  const results = {
    dry: {
      title: "The Restore Path",
      body: "Your barrier is asking for replenishment. Focus on lipid-rich layers and fewer actives until comfort returns.",
      ritual: "Milk Cleanse → Barrier Serum → Comfort Cream → Night Seal",
    },
    oily: {
      title: "The Balance Path",
      body: "Oil and resilience can coexist. Lightweight humectants and a calm barrier keep shine without stripping.",
      ritual: "Milk Cleanse → Barrier Serum → Soft Emulsion → Optional Night Seal",
    },
    combo: {
      title: "The Harmony Path",
      body: "Different zones, one barrier. Keep the base simple and layer richness only where dryness appears.",
      ritual: "Milk Cleanse → Barrier Serum → Comfort Cream on dry zones",
    },
    sensitive: {
      title: "The Soften Path",
      body: "Less noise, more repair. Fragrance-free layers and ceramide support calm reactive skin.",
      ritual: "Milk Cleanse → Barrier Serum → Comfort Cream (pause strong actives)",
    },
  };

  const scoreResult = () => {
    const tally = { dry: 0, oily: 0, combo: 0, sensitive: 0 };
    Object.values(answers).forEach((key) => {
      if (tally[key] !== undefined) tally[key] += 1;
    });
    return Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  };

  const updateProgress = () => {
    progressDots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index && index < steps.length - 1);
      dot.classList.toggle("is-done", i < index || index === steps.length - 1);
    });
  };

  const showStep = (nextIndex) => {
    steps.forEach((step, i) => {
      step.classList.toggle("is-active", i === nextIndex);
      step.hidden = i !== nextIndex;
    });
    index = nextIndex;
    updateProgress();

    const isResult = steps[index].dataset.step === "result";
    if (btnBack) {
      btnBack.hidden = index === 0 || isResult;
      btnBack.disabled = index === 0;
    }
    if (btnNext) {
      btnNext.hidden = isResult;
      if (!isResult) {
        const selected = steps[index].querySelector(".quiz-option.is-selected");
        btnNext.disabled = !selected;
        btnNext.textContent = index === steps.length - 2 ? "See my path" : "Continue";
      }
    }
    if (btnRestart) {
      btnRestart.hidden = !isResult;
    }

    if (isResult) {
      const key = scoreResult();
      const result = results[key] || results.combo;
      const titleEl = quiz.querySelector("[data-result-title]");
      const bodyEl = quiz.querySelector("[data-result-body]");
      const ritualEl = quiz.querySelector("[data-result-ritual]");
      if (titleEl) titleEl.textContent = result.title;
      if (bodyEl) bodyEl.textContent = result.body;
      if (ritualEl) ritualEl.innerHTML = `<strong>Suggested ritual</strong>${result.ritual}`;
    }
  };

  steps.forEach((step) => {
    step.querySelectorAll(".quiz-option").forEach((option) => {
      option.addEventListener("click", () => {
        step.querySelectorAll(".quiz-option").forEach((o) => {
          o.classList.remove("is-selected");
          o.setAttribute("aria-pressed", "false");
        });
        option.classList.add("is-selected");
        option.setAttribute("aria-pressed", "true");
        const q = step.dataset.question;
        if (q) answers[q] = option.dataset.value;
        if (btnNext) btnNext.disabled = false;
      });
    });
  });

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (index < steps.length - 1) showStep(index + 1);
    });
  }

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (index > 0) showStep(index - 1);
    });
  }

  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      quiz.querySelectorAll(".quiz-option").forEach((o) => {
        o.classList.remove("is-selected");
        o.setAttribute("aria-pressed", "false");
      });
      showStep(0);
    });
  }

  showStep(0);
})();
