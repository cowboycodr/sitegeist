(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Count-up on the hero stats when they scroll into view.
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const runCount = (el) => {
    const target = Number(el.dataset.count) || 0;
    if (reduceMotion || target === 0) {
      el.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  } else {
    counters.forEach(runCount);
  }

  // "Grab a seat" — decrement remaining seats and confirm with a toast.
  const seatBtn = document.querySelector("[data-seat]");
  const seatCount = counters.find((el) => el.dataset.count === "9");
  const toast = document.getElementById("seatToast");
  let toastTimer = 0;

  if (seatBtn && toast) {
    seatBtn.addEventListener("click", () => {
      if (seatCount) {
        const left = Math.max(0, (Number(seatCount.textContent) || 0) - 1);
        seatCount.textContent = String(left);
        if (left === 0) {
          seatBtn.disabled = true;
          seatBtn.textContent = "Pot's full — see you next melt";
        }
      }
      toast.hidden = false;
      // force reflow so the transition plays
      void toast.offsetWidth;
      toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toast.classList.remove("show");
      }, 2600);
    });
  }
})();
