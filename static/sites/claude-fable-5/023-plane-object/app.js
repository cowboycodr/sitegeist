/* Plane Object configurator — draws the piece, counts the parts, prices it. */

(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const form = document.querySelector(".config-controls");
  const drawing = document.getElementById("preview-drawing");
  const tiersField = document.getElementById("tiers-field");
  if (!form || !drawing) return;

  const readout = {
    name: document.getElementById("readout-name"),
    panels: document.getElementById("readout-panels"),
    uprights: document.getElementById("readout-uprights"),
    joints: document.getElementById("readout-joints"),
    pack: document.getElementById("readout-pack"),
    price: document.getElementById("readout-price"),
  };

  const FINISHES = {
    birch: { label: "oiled birch", panel: "#d9b98c", panelDeep: "#c8a26f", upright: "#f2e3c9" },
    smoked: { label: "smoked birch", panel: "#9c7550", panelDeep: "#835e3d", upright: "#c9a276" },
  };

  const FORM_LABEL = { shelf: "Shelf", bench: "Bench", desk: "Desk" };
  const TIER_WORD = { 2: "two", 3: "three", 4: "four" };

  const INK = "#1c1a17";
  const ACCENT = "#e8542f";
  const CX = 260;

  const el = (name, attrs) => {
    const node = document.createElementNS(SVG_NS, name);
    for (const key of Object.keys(attrs)) node.setAttribute(key, attrs[key]);
    return node;
  };

  const plank = (x, y, w) => {
    const g = el("g", {});
    g.appendChild(el("rect", { x, y, width: w, height: 14, fill: state.finishSpec.panel, stroke: INK, "stroke-width": 2.5 }));
    g.appendChild(el("line", { x1: x, y1: y + 7, x2: x + w, y2: y + 7, stroke: state.finishSpec.panelDeep, "stroke-width": 1.5 }));
    return g;
  };

  const upright = (x, y1, y2) =>
    el("rect", { x: x - 6, y: y1, width: 12, height: y2 - y1, fill: state.finishSpec.upright, stroke: INK, "stroke-width": 2.5 });

  const bolt = (x, y) => el("circle", { cx: x, cy: y, r: 4.5, fill: ACCENT, stroke: INK, "stroke-width": 2 });

  const dimension = (y, x1, x2, label) => {
    const g = el("g", {});
    g.appendChild(el("line", { x1, y1: y, x2, y2: y, stroke: INK, "stroke-width": 2 }));
    g.appendChild(el("line", { x1, y1: y - 5, x2: x1, y2: y + 5, stroke: INK, "stroke-width": 2 }));
    g.appendChild(el("line", { x1: x2, y1: y - 5, x2, y2: y + 5, stroke: INK, "stroke-width": 2 }));
    const text = el("text", {
      x: (x1 + x2) / 2, y: y + 22, "text-anchor": "middle",
      "font-size": 14, "font-weight": 600, fill: "#4c463d", "letter-spacing": "0.04em",
    });
    text.textContent = label;
    g.appendChild(text);
    return g;
  };

  const state = { form: "shelf", width: 2, tiers: 3, finish: "birch", finishSpec: FINISHES.birch };

  function readForm() {
    const data = new FormData(form);
    state.form = data.get("form");
    state.width = Number(data.get("width"));
    state.tiers = Number(data.get("tiers"));
    state.finish = data.get("finish");
    state.finishSpec = FINISHES[state.finish];
  }

  function build() {
    readForm();

    const usesTiers = state.form === "shelf";
    tiersField.classList.toggle("is-disabled", !usesTiers);
    for (const input of tiersField.querySelectorAll("input")) input.disabled = !usesTiers;

    const panelW = state.width * 140;
    const left = CX - panelW / 2;
    const right = CX + panelW / 2;
    const uprightXs = [left + 18, right - 18];
    if (state.width === 3) uprightXs.push(CX);

    let panelYs;
    let uprightTop;
    const floorY = 330;

    if (state.form === "shelf") {
      const top = 350 - state.tiers * 78;
      panelYs = [];
      for (let i = 0; i < state.tiers; i += 1) panelYs.push(top + i * 78);
      panelYs.push(floorY - 14);
      uprightTop = top + 14;
    } else if (state.form === "bench") {
      panelYs = [floorY - 88];
      uprightTop = floorY - 74;
    } else {
      panelYs = [floorY - 170];
      uprightTop = floorY - 156;
    }

    drawing.replaceChildren();

    for (const x of uprightXs) drawing.appendChild(upright(x, uprightTop, floorY));
    for (const y of panelYs) drawing.appendChild(plank(left, y, panelW));
    for (const y of panelYs) for (const x of uprightXs) drawing.appendChild(bolt(x, y + 7));

    const mm = (state.width * 400).toLocaleString("en-US").replace(",", " ");
    drawing.appendChild(dimension(floorY + 30, left, right, mm + " mm"));

    const panels = panelYs.length;
    const uprights = uprightXs.length;
    const joints = panels * uprights;

    const price = 60 + panels * state.width * 42 + uprights * 34 + joints * 6;
    const packLong = state.width * 40 + 4;
    const packDeep = state.form === "desk" ? 62 : 44;
    const packThick = 6 + panels * 2 + uprights * 2;

    const tierText = usesTiers ? " · " + TIER_WORD[state.tiers] + " tiers" : "";
    readout.name.textContent =
      FORM_LABEL[state.form] + " · " + mm + " mm" + tierText + " · " + state.finishSpec.label;
    readout.panels.textContent = String(panels);
    readout.uprights.textContent = String(uprights);
    readout.joints.textContent = String(joints);
    readout.pack.textContent = packLong + " × " + packDeep + " × " + packThick + " cm";
    readout.price.textContent = "€" + price;
  }

  form.addEventListener("change", build);
  form.addEventListener("submit", (event) => event.preventDefault());
  build();
})();
