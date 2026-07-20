(() => {
  "use strict";

  const NODES = [
    {
      x: 104, y: 340, label: "Interviews", kind: "Source",
      title: "Field interviews, coastal towns",
      body: "Nineteen transcripts tagged by theme. Three quotes are already pinned to the storyline.",
    },
    {
      x: 236, y: 176, label: "Flood data", kind: "Source",
      title: "Municipal flood records, 1998–2025",
      body: "A cleaned dataset of 4,300 incidents. Two anomalies are linked to the interviews for context.",
    },
    {
      x: 396, y: 96, label: "Insight", kind: "Note",
      title: "Insurance retreat precedes migration",
      body: "A working note connecting premium spikes in the data to the moving stories in the interviews.",
    },
    {
      x: 442, y: 250, label: "Counter", kind: "Note",
      title: "Counter-evidence: the harbor district",
      body: "One neighborhood defies the trend. Flagged as a labeled fork so the team can argue it out.",
    },
    {
      x: 232, y: 352, label: "Draft", kind: "Thread",
      title: "Draft: “Leaving the waterline”",
      body: "The assembled storyline — every paragraph cites the nodes behind it, contradictions included.",
    },
  ];

  const svg = document.getElementById("story-map");
  if (!svg) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const nodeLayer = document.getElementById("node-layer");
  const threads = Array.from(svg.querySelectorAll(".thread"));
  const detailKind = document.getElementById("detail-kind");
  const detailTitle = document.getElementById("detail-title");
  const detailBody = document.getElementById("detail-body");
  const stepLabel = document.getElementById("thread-step");
  const prevButton = document.getElementById("thread-prev");
  const nextButton = document.getElementById("thread-next");

  let current = 0;
  const groups = [];

  NODES.forEach((node, index) => {
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", "map-node");
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${node.kind}: ${node.title}`);

    const halo = document.createElementNS(SVG_NS, "circle");
    halo.setAttribute("class", "halo");
    halo.setAttribute("cx", node.x);
    halo.setAttribute("cy", node.y);
    halo.setAttribute("r", 24);

    const core = document.createElementNS(SVG_NS, "circle");
    core.setAttribute("class", "core");
    core.setAttribute("cx", node.x);
    core.setAttribute("cy", node.y);
    core.setAttribute("r", 14);
    core.setAttribute("filter", "url(#soft)");

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", node.x);
    text.setAttribute("y", node.y + 44);
    text.setAttribute("text-anchor", "middle");
    text.textContent = node.label;

    group.append(halo, core, text);
    nodeLayer.append(group);
    groups.push(group);

    const activate = () => select(index);
    group.addEventListener("click", activate);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  function select(index) {
    current = index;
    const node = NODES[index];

    groups.forEach((group, i) => {
      group.classList.toggle("active", i === index);
      const core = group.querySelector(".core");
      core.setAttribute("fill", i <= index ? "#e8a13c" : "#f4ede1");
      core.setAttribute("opacity", i <= index ? "1" : "0.55");
    });

    threads.forEach((thread, i) => {
      thread.classList.toggle("lit", i < index);
    });

    detailKind.textContent = node.kind;
    detailTitle.textContent = node.title;
    detailBody.textContent = node.body;
    stepLabel.textContent = `Node ${index + 1} of ${NODES.length}`;
    prevButton.disabled = index === 0;
    nextButton.disabled = index === NODES.length - 1;
  }

  prevButton.addEventListener("click", () => select(Math.max(0, current - 1)));
  nextButton.addEventListener("click", () => select(Math.min(NODES.length - 1, current + 1)));

  select(0);
})();
