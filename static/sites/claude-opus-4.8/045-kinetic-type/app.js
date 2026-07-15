(() => {
  "use strict";

  /* ---------- Typeface library ---------- */
  const families = [
    {
      name: "Velocity Grotesk",
      sample: "Rush",
      tag: "Display",
      font: "var(--grotesk)",
      weight: 800,
      style: "normal",
      desc: "A tightly-spaced grotesque built for headlines that need to move fast.",
      styles: "9 weights · Italics · Variable",
    },
    {
      name: "Marrow Serif",
      sample: "Grace",
      tag: "Serif",
      font: "var(--serif)",
      weight: 500,
      style: "italic",
      desc: "High-contrast editorial serif with a restless, calligraphic italic.",
      styles: "6 weights · Optical sizes",
    },
    {
      name: "Signal Mono",
      sample: "01<>",
      tag: "Mono",
      font: "var(--mono)",
      weight: 600,
      style: "normal",
      desc: "A fixed-width workhorse for code, data, and interface chrome.",
      styles: "5 weights · Ligatures",
    },
    {
      name: "Loop Display",
      sample: "Wow!",
      tag: "Kinetic",
      font: "var(--grotesk)",
      weight: 900,
      style: "normal",
      desc: "An ultra-bold display face drawn to be animated, looped, and stretched.",
      styles: "3 axes · Motion kit",
    },
    {
      name: "Quire Text",
      sample: "Read",
      tag: "Text",
      font: "var(--serif)",
      weight: 400,
      style: "normal",
      desc: "A calm, low-contrast text serif that stays comfortable at small sizes.",
      styles: "4 weights · Small caps",
    },
    {
      name: "Pivot Sans",
      sample: "Aa",
      tag: "Variable",
      font: "var(--grotesk)",
      weight: 300,
      style: "normal",
      desc: "A humanist sans with width and slant axes for responsive identities.",
      styles: "Width · Weight · Slant",
    },
  ];

  const grid = document.getElementById("spec-grid");
  if (grid) {
    const frag = document.createDocumentFragment();
    families.forEach((f) => {
      const li = document.createElement("li");
      li.className = "spec-card";
      const sample = document.createElement("div");
      sample.className = "spec-sample";
      sample.textContent = f.sample;
      sample.style.fontFamily = f.font;
      sample.style.fontWeight = String(f.weight);
      sample.style.fontStyle = f.style;
      const meta = document.createElement("div");
      meta.className = "spec-meta";
      const name = document.createElement("span");
      name.className = "spec-name";
      name.textContent = f.name;
      const tag = document.createElement("span");
      tag.className = "spec-tag";
      tag.textContent = f.tag;
      meta.append(name, tag);
      const desc = document.createElement("p");
      desc.className = "spec-desc";
      desc.textContent = f.desc;
      const styles = document.createElement("p");
      styles.className = "spec-styles";
      const b = document.createElement("b");
      b.textContent = f.styles.split(" · ")[0];
      styles.append(b, document.createTextNode(" · " + f.styles.split(" · ").slice(1).join(" · ")));
      li.append(sample, meta, desc, styles);
      frag.appendChild(li);
    });
    grid.appendChild(frag);
  }

  /* ---------- Variable lab ---------- */
  const canvas = document.getElementById("labCanvas");
  const text = document.getElementById("labText");
  const weight = document.getElementById("labWeight");
  const size = document.getElementById("labSize");
  const track = document.getElementById("labTrack");
  const slant = document.getElementById("labSlant");
  const caps = document.getElementById("labCaps");
  const animateBtn = document.getElementById("labAnimate");
  const controls = document.getElementById("labControls");

  const out = {
    weight: document.getElementById("outWeight"),
    size: document.getElementById("outSize"),
    track: document.getElementById("outTrack"),
    slant: document.getElementById("outSlant"),
  };

  const fontMap = {
    grotesk: "var(--grotesk)",
    serif: "var(--serif)",
    mono: "var(--mono)",
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function currentStyle() {
    const el = controls && controls.querySelector('input[name="labStyle"]:checked');
    return el ? el.value : "grotesk";
  }

  function render() {
    if (!canvas) return;
    const raw = (text && text.value) || "";
    const label = raw.trim() === "" ? "Kinetic" : raw;
    canvas.textContent = caps && caps.checked ? label.toUpperCase() : label;
    canvas.style.fontFamily = fontMap[currentStyle()];
    canvas.style.fontWeight = weight.value;
    canvas.style.fontSize = size.value + "px";
    canvas.style.letterSpacing = track.value + "px";
    canvas.style.transform = "skewX(" + -slant.value + "deg)";
    if (out.weight) out.weight.textContent = weight.value;
    if (out.size) out.size.textContent = size.value;
    if (out.track) out.track.textContent = track.value;
    if (out.slant) out.slant.textContent = slant.value;
  }

  [text, weight, size, track, slant].forEach((c) => c && c.addEventListener("input", render));
  if (caps) caps.addEventListener("change", render);
  if (controls) {
    controls.querySelectorAll('input[name="labStyle"]').forEach((r) =>
      r.addEventListener("change", render)
    );
  }

  /* Reset restores defaults after the native form reset ticks over. */
  if (controls) {
    controls.addEventListener("reset", () => {
      stopAnimation();
      window.setTimeout(render, 0);
    });
  }

  /* ---------- Axis animation ---------- */
  let rafId = 0;
  let startTime = 0;

  function tick(now) {
    if (!startTime) startTime = now;
    const t = (now - startTime) / 1000;
    const w = Math.round(500 + 400 * Math.sin(t * 1.1));
    const s = Math.round(12 * Math.sin(t * 0.9));
    const tr = Math.round(8 + 12 * Math.sin(t * 0.7));
    weight.value = String(w);
    slant.value = String(s);
    track.value = String(tr);
    render();
    rafId = window.requestAnimationFrame(tick);
  }

  function startAnimation() {
    if (rafId || reduceMotion.matches) return;
    startTime = 0;
    rafId = window.requestAnimationFrame(tick);
    if (animateBtn) animateBtn.setAttribute("aria-pressed", "true");
  }

  function stopAnimation() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    if (animateBtn) animateBtn.setAttribute("aria-pressed", "false");
  }

  if (animateBtn) {
    animateBtn.addEventListener("click", () => {
      if (rafId) {
        stopAnimation();
      } else if (reduceMotion.matches) {
        animateBtn.setAttribute("aria-pressed", "false");
      } else {
        startAnimation();
      }
    });
  }

  /* Manual slider interaction interrupts the auto animation. */
  [weight, size, track, slant].forEach((c) =>
    c && c.addEventListener("pointerdown", stopAnimation)
  );
  reduceMotion.addEventListener("change", (e) => { if (e.matches) stopAnimation(); });

  render();

  /* ---------- Bridge pull-state affordance (optional, non-essential) ---------- */
  document.addEventListener("sitegeist:pull-state", (e) => {
    document.body.classList.toggle("is-pulling", !!(e.detail && e.detail.active));
  });
})();
