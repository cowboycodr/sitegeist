/* Tidepool Lab — station chart + tabs */
(() => {
  "use strict";

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const STATIONS = {
    north: {
      name: "North Reef",
      note: "Peak 16.8 °C in September; anomaly +0.6 °C over the ten-year baseline.",
      temps: [11.2, 11.0, 11.6, 12.1, 12.9, 13.8, 14.9, 16.1, 16.8, 15.4, 13.2, 11.9],
    },
    cove: {
      name: "Anemone Cove",
      note: "Sheltered pools run warm; midsummer readings top 18 °C at slack tide.",
      temps: [12.0, 11.8, 12.4, 13.2, 14.3, 15.6, 17.1, 18.2, 18.0, 16.1, 13.9, 12.5],
    },
    shelf: {
      name: "Granite Shelf",
      note: "Wave-swept and cool; upwelling holds spring readings under 12 °C.",
      temps: [10.6, 10.4, 10.9, 11.3, 11.8, 12.6, 13.7, 14.9, 15.6, 14.3, 12.4, 11.2],
    },
  };

  const SVG_NS = "http://www.w3.org/2000/svg";
  const VIEW = { w: 720, h: 320, left: 46, right: 16, top: 18, bottom: 34 };
  const T_MIN = 9;
  const T_MAX = 19;

  const chart = {
    grid: document.getElementById("chart-grid"),
    area: document.getElementById("chart-area"),
    line: document.getElementById("chart-line"),
    dots: document.getElementById("chart-dots"),
    labels: document.getElementById("chart-labels"),
    title: document.getElementById("chart-title"),
    note: document.getElementById("chart-note"),
    panel: document.getElementById("chart-panel"),
    tableMonths: document.getElementById("table-months"),
    tableValues: document.getElementById("table-values"),
  };

  if (!chart.line) return;

  const plotW = VIEW.w - VIEW.left - VIEW.right;
  const plotH = VIEW.h - VIEW.top - VIEW.bottom;
  const x = (i) => VIEW.left + (plotW * i) / (MONTHS.length - 1);
  const y = (t) => VIEW.top + plotH * (1 - (t - T_MIN) / (T_MAX - T_MIN));

  const el = (tag, attrs, text) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const drawStatic = () => {
    for (let t = 10; t <= 18; t += 2) {
      chart.grid.appendChild(el("line", {
        class: "chart-grid-line",
        x1: VIEW.left, x2: VIEW.w - VIEW.right, y1: y(t), y2: y(t),
      }));
      chart.labels.appendChild(el("text", {
        class: "chart-axis-text", x: VIEW.left - 8, y: y(t) + 4, "text-anchor": "end",
      }, `${t}°`));
    }
    MONTHS.forEach((month, i) => {
      chart.labels.appendChild(el("text", {
        class: "chart-axis-text", x: x(i), y: VIEW.h - 10, "text-anchor": "middle",
      }, month));
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = month;
      chart.tableMonths.appendChild(th);
    });
  };

  const render = (key) => {
    const station = STATIONS[key];
    const points = station.temps.map((t, i) => `${x(i).toFixed(1)},${y(t).toFixed(1)}`);
    chart.line.setAttribute("d", `M${points.join(" L")}`);
    chart.area.setAttribute(
      "d",
      `M${points.join(" L")} L${x(MONTHS.length - 1).toFixed(1)},${y(T_MIN)} L${VIEW.left},${y(T_MIN)} Z`,
    );

    chart.dots.replaceChildren();
    station.temps.forEach((t, i) => {
      chart.dots.appendChild(el("circle", { class: "chart-dot", cx: x(i), cy: y(t), r: 4.5 }));
    });

    chart.title.textContent = `${station.name} · 2025 monthly mean`;
    chart.note.textContent = station.note;

    chart.tableValues.querySelectorAll("td").forEach((cell) => cell.remove());
    station.temps.forEach((t) => {
      const td = document.createElement("td");
      td.textContent = t.toFixed(1);
      chart.tableValues.appendChild(td);
    });
  };

  const tabs = Array.from(document.querySelectorAll(".tab"));

  const select = (tab, focus) => {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      other.tabIndex = selected ? 0 : -1;
    });
    chart.panel.setAttribute("aria-labelledby", tab.id);
    render(tab.dataset.station);
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (event) => {
      let next = -1;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      if (next >= 0) {
        event.preventDefault();
        select(tabs[next], true);
      }
    });
  });

  drawStatic();
  render("north");
})();
