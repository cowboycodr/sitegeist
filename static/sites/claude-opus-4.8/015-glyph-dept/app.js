(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Type tester ---------- */
  const stage = document.getElementById("stage-text");
  const sample = document.getElementById("sample");
  const inputs = {
    weight: document.getElementById("weight"),
    width: document.getElementById("width"),
    size: document.getElementById("size"),
    slant: document.getElementById("slant"),
  };
  const outs = {
    weight: document.getElementById("weight-out"),
    width: document.getElementById("width-out"),
    size: document.getElementById("size-out"),
    slant: document.getElementById("slant-out"),
  };
  const families = {
    grotesk: 'var(--sans)',
    serif: 'var(--serif)',
    mono: 'var(--mono)',
  };

  let family = "grotesk";

  const defaults = { weight: 520, width: 100, size: 120, slant: 0 };

  function render() {
    if (!stage) return;
    const weight = Number(inputs.weight.value);
    const width = Number(inputs.width.value);
    const size = Number(inputs.size.value);
    const slant = Number(inputs.slant.value);

    const text = sample.value.trim() === "" ? "Handgloves" : sample.value;
    stage.textContent = text;

    stage.style.fontFamily =
      family === "grotesk" ? '"Helvetica Neue", Arial, system-ui, sans-serif'
      : family === "serif" ? '"Iowan Old Style", Palatino, Georgia, serif'
      : '"SFMono-Regular", Menlo, Consolas, monospace';
    stage.style.fontStyle = family === "serif" && slant !== 0 ? "italic" : "normal";
    stage.style.fontWeight = String(weight);
    stage.style.fontSize = size + "px";
    stage.style.transform = `scaleX(${width / 100}) skewX(${-slant}deg)`;

    outs.weight.textContent = String(weight);
    outs.width.textContent = width + "%";
    outs.size.textContent = size + "px";
    outs.slant.textContent = slant + "°";
  }

  Object.values(inputs).forEach((el) => el && el.addEventListener("input", render));
  if (sample) sample.addEventListener("input", render);

  const reset = document.getElementById("reset");
  if (reset) {
    reset.addEventListener("click", () => {
      Object.keys(defaults).forEach((k) => { inputs[k].value = defaults[k]; });
      render();
    });
  }

  /* ---------- Family segmented control ---------- */
  const segButtons = Array.from(document.querySelectorAll(".segmented button"));
  function selectFamily(btn) {
    family = btn.dataset.family;
    segButtons.forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
    render();
  }
  segButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => selectFamily(btn));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = segButtons[(i + dir + segButtons.length) % segButtons.length];
      next.focus();
      selectFamily(next);
    });
  });

  render();

  /* ---------- Pointer-driven "flex" on display letters ---------- */
  if (!reduceMotion.matches) {
    document.querySelectorAll("[data-flex]").forEach((el) => {
      const base = el.closest("[data-card]") ? el : el;
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const weight = 300 + Math.round(x * 550);
        const stretch = 0.9 + y * 0.35;
        el.style.fontWeight = String(weight);
        if (!el.classList.contains("hero__line--wide")) {
          el.style.transform = `scaleX(${stretch.toFixed(3)})`;
          el.style.transformOrigin = "left";
        }
      });
      el.addEventListener("pointerleave", () => {
        el.style.fontWeight = "";
        if (!el.classList.contains("hero__line--heavy") &&
            !el.classList.contains("card__big--wide")) {
          el.style.transform = "";
        }
      });
    });
  }

  /* ---------- Bridge pull-state: dim while the viewer is pulling ---------- */
  document.addEventListener("sitegeist:pull-state", (e) => {
    document.body.style.opacity = e.detail && e.detail.active ? "0.96" : "";
  });
})();
