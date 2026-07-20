(() => {
  "use strict";

  const FAMILIES = {
    marrow: {
      name: "Marrow Display",
      stack: 'Georgia, "Times New Roman", Times, serif',
      weight: 700,
      italic: false,
      sample: "Hefty quartz jukebox",
    },
    signalgrotesk: {
      name: "Signal Grotesk",
      stack: '"Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif',
      weight: 500,
      italic: false,
      sample: "Wayfinding at gate B7",
    },
    ledgermono: {
      name: "Ledger Mono",
      stack: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      weight: 400,
      italic: false,
      sample: "sum(0O1lI) == 42;",
    },
    vellumtext: {
      name: "Vellum Text",
      stack: 'Georgia, "Times New Roman", Times, serif',
      weight: 400,
      italic: true,
      sample: "The quiet chapter begins",
    },
    parapetslab: {
      name: "Parapet Slab",
      stack: '"Courier New", Georgia, serif',
      weight: 700,
      italic: false,
      sample: "BUILT TO HOLD",
    },
    loudhailer: {
      name: "Loudhailer",
      stack: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
      weight: 900,
      italic: false,
      sample: "NOW HEAR THIS",
    },
  };

  const SURPRISES = [
    "Sphinx of black quartz, judge my vow",
    "Grumpy wizards make toxic brew",
    "Pack my box with five dozen jugs",
    "Kerning is a contract",
    "Viva la víspera — «quoted» & framed",
    "0123456789 ¶ § † ★",
  ];

  const stage = document.getElementById("stage-text");
  const nameOut = document.getElementById("stage-family-name");
  const styleOut = document.getElementById("stage-style-readout");
  const chipRow = document.getElementById("family-chips");
  const sliders = {
    size: document.getElementById("axis-size"),
    weight: document.getElementById("axis-weight"),
    track: document.getElementById("axis-track"),
    slant: document.getElementById("axis-slant"),
  };
  const outputs = {
    size: document.getElementById("out-size"),
    weight: document.getElementById("out-weight"),
    track: document.getElementById("out-track"),
    slant: document.getElementById("out-slant"),
  };
  if (!stage || !chipRow) return;

  const state = {
    family: "marrow",
    size: 64,
    weight: 700,
    track: 0,
    slant: 0,
    letterCase: "none",
  };

  const apply = () => {
    const family = FAMILIES[state.family];
    stage.style.fontFamily = family.stack;
    stage.style.fontStyle = family.italic ? "italic" : "normal";
    stage.style.fontSize = state.size + "px";
    stage.style.fontWeight = String(state.weight);
    stage.style.letterSpacing = state.track / 1000 + "em";
    stage.style.transform = state.slant ? "skewX(" + -state.slant + "deg)" : "";
    stage.style.textTransform = state.letterCase === "none" ? "" : state.letterCase;
    nameOut.textContent = family.name;
    styleOut.textContent = "wt " + state.weight + " / " + state.size + " px";
    outputs.size.value = String(state.size);
    outputs.weight.value = String(state.weight);
    outputs.track.value = String(state.track);
    outputs.slant.value = String(state.slant);
  };

  const setFamily = (key, replaceSample) => {
    if (!FAMILIES[key]) return;
    state.family = key;
    state.weight = FAMILIES[key].weight;
    sliders.weight.value = String(state.weight);
    if (replaceSample) stage.textContent = FAMILIES[key].sample;
    chipRow.querySelectorAll(".chip").forEach((chip) => {
      const active = chip.dataset.family === key;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-checked", active ? "true" : "false");
    });
    apply();
  };

  Object.keys(FAMILIES).forEach((key, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (index === 0 ? " is-active" : "");
    chip.dataset.family = key;
    chip.setAttribute("role", "radio");
    chip.setAttribute("aria-checked", index === 0 ? "true" : "false");
    chip.textContent = FAMILIES[key].name;
    chip.addEventListener("click", () => setFamily(key, false));
    chipRow.appendChild(chip);
  });

  sliders.size.addEventListener("input", () => { state.size = Number(sliders.size.value); apply(); });
  sliders.weight.addEventListener("input", () => { state.weight = Number(sliders.weight.value); apply(); });
  sliders.track.addEventListener("input", () => { state.track = Number(sliders.track.value); apply(); });
  sliders.slant.addEventListener("input", () => { state.slant = Number(sliders.slant.value); apply(); });

  document.querySelectorAll(".chip[data-case]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.letterCase = chip.dataset.case;
      document.querySelectorAll(".chip[data-case]").forEach((other) => {
        const active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-checked", active ? "true" : "false");
      });
      apply();
    });
  });

  const scramble = document.getElementById("btn-scramble");
  let surpriseIndex = 0;
  if (scramble) {
    scramble.addEventListener("click", () => {
      stage.textContent = SURPRISES[surpriseIndex % SURPRISES.length];
      surpriseIndex += 1;
      apply();
    });
  }

  const reset = document.getElementById("btn-reset");
  if (reset) {
    reset.addEventListener("click", () => {
      state.size = 64;
      state.track = 0;
      state.slant = 0;
      state.weight = FAMILIES[state.family].weight;
      sliders.size.value = "64";
      sliders.track.value = "0";
      sliders.slant.value = "0";
      sliders.weight.value = String(state.weight);
      apply();
    });
  }

  // Keep the specimen plain text: strip any rich formatting pasted in.
  stage.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData("text/plain");
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
    selection.collapseToEnd();
  });

  document.querySelectorAll(".load-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setFamily(button.dataset.load, true);
      const tester = document.getElementById("tester");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      tester.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      stage.focus({ preventScroll: true });
    });
  });

  apply();
})();
