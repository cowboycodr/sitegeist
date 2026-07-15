(() => {
  "use strict";

  const svg = document.getElementById("drawing");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const baysInput = document.getElementById("bays");
  const tiersInput = document.getElementById("tiers");
  const outBays = document.getElementById("out-bays");
  const outTiers = document.getElementById("out-tiers");
  const explodeBtn = document.getElementById("explode");
  const swatches = Array.from(document.querySelectorAll(".swatch"));

  const finishes = {
    birch:    { fill: "#e7d9bd", edge: "#c7ac7c", grain: true,  label: "birch" },
    charcoal: { fill: "#2b2d2e", edge: "#16181a", grain: false, label: "charcoal" },
    signal:   { fill: "#d9482f", edge: "#a8341f", grain: false, label: "signal red" },
  };

  const state = { bays: 2, tiers: 4, finish: "birch", exploded: false };

  const el = (name, attrs) => {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  };

  // geometry in drawing units, centred in a 400 x 420 viewBox
  const T = 12;            // panel thickness
  const CELL_W = 78;       // interior bay width
  const CELL_H = 66;       // interior tier height
  const VW = 400, VH = 420;

  function planeCount() {
    const verticals = state.bays + 1;
    const horizontals = state.tiers + 1;
    return verticals + horizontals;
  }
  function nodeCount() {
    // one node at every plane intersection
    return (state.bays + 1) * (state.tiers + 1);
  }

  function priceFor() {
    const base = 120;
    const perPlane = 34;
    const perNode = 6;
    const finishAdj = state.finish === "signal" ? 40 : state.finish === "charcoal" ? 55 : 0;
    return base + planeCount() * perPlane + nodeCount() * perNode + finishAdj;
  }

  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const f = finishes[state.finish];

    if (f.grain) {
      const defs = el("defs", {});
      const pat = el("pattern", {
        id: "cfg-grain", width: 5, height: 5,
        patternUnits: "userSpaceOnUse", patternTransform: "rotate(90)",
      });
      pat.appendChild(el("rect", { width: 5, height: 5, fill: f.fill }));
      pat.appendChild(el("path", { d: "M0 0 H5", stroke: f.edge, "stroke-width": 0.5, opacity: 0.55 }));
      defs.appendChild(pat);
      svg.appendChild(defs);
    }
    const panelFill = f.grain ? "url(#cfg-grain)" : f.fill;

    const gap = state.exploded ? 18 : 0;
    const innerW = state.bays * CELL_W + (state.bays + 1) * T;
    const innerH = state.tiers * CELL_H + (state.tiers + 1) * T;
    const totalW = innerW + gap * state.bays;
    const totalH = innerH + gap * state.tiers;
    const scale = Math.min((VW - 60) / totalW, (VH - 60) / totalH, 1);
    const ox = (VW - totalW * scale) / 2;
    const oy = (VH - totalH * scale) / 2;

    const g = el("g", { transform: `translate(${ox} ${oy}) scale(${scale})` });

    // column x positions (left edge of each vertical divider)
    const colX = [];
    for (let c = 0; c <= state.bays; c++) {
      colX.push(c * (T + CELL_W + gap));
    }
    const rowY = [];
    for (let r = 0; r <= state.tiers; r++) {
      rowY.push(r * (T + CELL_H + gap));
    }
    const spanW = colX[state.bays] + T;
    const spanH = rowY[state.tiers] + T;

    // baseline / floor reference line
    g.appendChild(el("line", {
      x1: -14, y1: spanH + 10, x2: spanW + 14, y2: spanH + 10,
      stroke: "#17110c", "stroke-width": 1, "stroke-dasharray": "2 4", opacity: 0.4,
    }));

    // horizontal planes (shelves) — draw first so verticals sit on top visually
    for (let r = 0; r <= state.tiers; r++) {
      g.appendChild(el("rect", {
        x: 0, y: rowY[r], width: spanW, height: T,
        fill: panelFill, stroke: f.edge, "stroke-width": 1.5,
      }));
    }
    // vertical planes (dividers)
    for (let c = 0; c <= state.bays; c++) {
      g.appendChild(el("rect", {
        x: colX[c], y: 0, width: T, height: spanH,
        fill: panelFill, stroke: f.edge, "stroke-width": 1.5,
      }));
    }

    // signal-orange nodes at intersections
    for (let c = 0; c <= state.bays; c++) {
      for (let r = 0; r <= state.tiers; r++) {
        g.appendChild(el("circle", {
          cx: colX[c] + T / 2, cy: rowY[r] + T / 2, r: 4,
          fill: "#d9482f", stroke: "#17110c", "stroke-width": 1,
        }));
      }
    }

    // exploded connector hints
    if (state.exploded) {
      for (let c = 0; c <= state.bays; c++) {
        for (let r = 0; r < state.tiers; r++) {
          const x = colX[c] + T / 2;
          const y1 = rowY[r] + T;
          const y2 = rowY[r + 1];
          g.appendChild(el("line", {
            x1: x, y1: y1, x2: x, y2: y2,
            stroke: "#a8341f", "stroke-width": 1, "stroke-dasharray": "2 3",
          }));
        }
      }
    }

    // dimension annotation
    const dimY = spanH + 22;
    g.appendChild(el("line", { x1: 0, y1: dimY, x2: spanW, y2: dimY, stroke: "#4a4238", "stroke-width": 0.8 }));
    g.appendChild(el("line", { x1: 0, y1: dimY - 4, x2: 0, y2: dimY + 4, stroke: "#4a4238", "stroke-width": 0.8 }));
    g.appendChild(el("line", { x1: spanW, y1: dimY - 4, x2: spanW, y2: dimY + 4, stroke: "#4a4238", "stroke-width": 0.8 }));

    svg.appendChild(g);
    updateSpecs();
  }

  function mm(cells, cell) {
    // 1 drawing unit ~ 4.5 mm, rounded to a tidy number
    return Math.round((cells * cell + (cells + 1) * T) * 4.5 / 10) * 10;
  }

  function updateSpecs() {
    const w = mm(state.bays, CELL_W);
    const h = mm(state.tiers, CELL_H);
    const d = 340;
    document.getElementById("spec-dims").textContent = `${w} × ${h} × ${d} mm`;
    document.getElementById("spec-planes").textContent = String(planeCount());
    document.getElementById("spec-nodes").textContent = String(nodeCount());
    document.getElementById("spec-price").textContent =
      "$" + priceFor().toLocaleString("en-US");
    document.getElementById("spec-model").textContent =
      `PO-01 · ${state.bays}×${state.tiers} · ${finishes[state.finish].label}`;
  }

  // events
  baysInput.addEventListener("input", () => {
    state.bays = +baysInput.value;
    outBays.textContent = baysInput.value;
    render();
  });
  tiersInput.addEventListener("input", () => {
    state.tiers = +tiersInput.value;
    outTiers.textContent = tiersInput.value;
    render();
  });

  swatches.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.finish = btn.dataset.finish;
      swatches.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
      render();
    });
  });
  // keyboard support for the radiogroup
  const group = document.querySelector(".swatches");
  group.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" &&
        e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = swatches.findIndex((b) => b.classList.contains("is-on"));
    const dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
    const next = swatches[(i + dir + swatches.length) % swatches.length];
    next.focus();
    next.click();
  });

  explodeBtn.addEventListener("click", () => {
    state.exploded = !state.exploded;
    explodeBtn.setAttribute("aria-checked", state.exploded ? "true" : "false");
    render();
  });

  render();
})();
