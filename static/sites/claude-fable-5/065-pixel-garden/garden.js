// Pixel Garden — community plot
(() => {
  "use strict";

  const COLS = 8;
  const ROWS = 4;
  const NS = "http://www.w3.org/2000/svg";

  const grid = document.getElementById("plot-grid");
  const status = document.getElementById("plot-status");
  const clearButton = document.getElementById("plot-clear");
  if (!grid || !status || !clearButton) return;

  // Each species draws its three growth stages as pixel rects on an 8x8 canvas.
  const SPECIES = [
    {
      name: "sprout",
      stages: [
        [[3, 5, 2, 2, "#7ee08a"], [3, 7, 2, 1, "#3f9d5a"]],
        [[3, 3, 2, 4, "#3f9d5a"], [1, 4, 2, 2, "#7ee08a"], [5, 3, 2, 2, "#7ee08a"]],
        [[3, 2, 2, 5, "#3f9d5a"], [1, 3, 2, 2, "#7ee08a"], [5, 2, 2, 2, "#7ee08a"], [3, 0, 2, 2, "#7ee08a"]],
      ],
      grown: "a tall fern",
    },
    {
      name: "blossom",
      stages: [
        [[3, 6, 2, 1, "#3f9d5a"], [3, 4, 2, 2, "#ff8fab"]],
        [[3, 4, 2, 3, "#3f9d5a"], [2, 1, 4, 3, "#ff8fab"], [3, 2, 2, 1, "#ffd166"]],
        [[3, 4, 2, 3, "#3f9d5a"], [1, 1, 6, 3, "#ff8fab"], [3, 2, 2, 1, "#ffd166"], [1, 5, 1, 1, "#ff8fab"], [6, 5, 1, 1, "#ff8fab"]],
      ],
      grown: "a pink blossom",
    },
    {
      name: "sunbud",
      stages: [
        [[3, 5, 2, 2, "#ffd166"]],
        [[3, 4, 2, 3, "#3f9d5a"], [2, 2, 4, 2, "#ffd166"]],
        [[3, 3, 2, 4, "#3f9d5a"], [2, 0, 4, 3, "#ffd166"], [3, 1, 2, 1, "#e0a94a"]],
      ],
      grown: "a sunbud",
    },
    {
      name: "moonshroom",
      stages: [
        [[3, 6, 2, 1, "#8fb7ff"]],
        [[3, 5, 2, 2, "#e8eefb"], [2, 3, 4, 2, "#8fb7ff"]],
        [[3, 4, 2, 3, "#e8eefb"], [1, 1, 6, 3, "#8fb7ff"], [2, 2, 1, 1, "#e8eefb"], [5, 2, 1, 1, "#e8eefb"]],
      ],
      grown: "a moonshroom",
    },
  ];

  const MESSAGES = [
    "Something stirs in the soil.",
    "It likes it here.",
    "The moths approve.",
    "Careful — it hums at night.",
    "That one follows the moon.",
    "The plot smells like rain.",
  ];

  const tiles = [];

  const drawTile = (tile) => {
    const { button, stage, species } = tile;
    button.textContent = "";
    button.classList.remove("grown-1", "grown-2", "grown-3");
    if (stage === 0) {
      button.setAttribute("aria-label", `Empty soil, row ${tile.row + 1}, column ${tile.col + 1}. Plant a seed.`);
      return;
    }
    button.classList.add(`grown-${stage}`);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 8 8");
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.setAttribute("aria-hidden", "true");
    for (const [x, y, w, h, fill] of species.stages[stage - 1]) {
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", w);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", fill);
      svg.append(rect);
    }
    button.append(svg);
    const state = stage === 3 ? `fully grown ${species.grown}` : `${species.name}, stage ${stage} of 3`;
    button.setAttribute(
      "aria-label",
      `Row ${tile.row + 1}, column ${tile.col + 1}: ${state}.${stage < 3 ? " Activate to grow." : ""}`,
    );
  };

  const countGrown = () => tiles.filter((t) => t.stage === 3).length;

  const announce = (tile) => {
    if (tile.stage === 3) {
      const grown = countGrown();
      status.textContent = `Your ${tile.species.grown} is fully grown! ${grown} plant${grown === 1 ? "" : "s"} in bloom.`;
    } else if (tile.stage === 1) {
      status.textContent = `You planted a ${tile.species.name}. ${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}`;
    } else {
      status.textContent = `The ${tile.species.name} grew a little. ${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}`;
    }
  };

  const setRoving = (index) => {
    tiles.forEach((tile, i) => {
      tile.button.tabIndex = i === index ? 0 : -1;
    });
  };

  for (let row = 0; row < ROWS; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.setAttribute("role", "row");
    rowElement.style.display = "contents";
    for (let col = 0; col < COLS; col += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "plot-tile";
      button.setAttribute("role", "gridcell");
      const tile = { button, row, col, stage: 0, species: SPECIES[0] };
      const index = row * COLS + col;
      button.addEventListener("click", () => {
        if (tile.stage === 0) {
          tile.species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
          tile.stage = 1;
        } else if (tile.stage < 3) {
          tile.stage += 1;
        } else {
          status.textContent = `The ${tile.species.grown} is happy as it is. Try an empty tile.`;
          return;
        }
        drawTile(tile);
        announce(tile);
        setRoving(index);
      });
      button.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight") next = index + 1 < tiles.length ? index + 1 : index;
        else if (event.key === "ArrowLeft") next = index > 0 ? index - 1 : index;
        else if (event.key === "ArrowDown") next = index + COLS < tiles.length ? index + COLS : index;
        else if (event.key === "ArrowUp") next = index - COLS >= 0 ? index - COLS : index;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tiles.length - 1;
        if (next === null) return;
        event.preventDefault();
        setRoving(next);
        tiles[next].button.focus();
      });
      tiles.push(tile);
      drawTile(tile);
      rowElement.append(button);
    }
    grid.append(rowElement);
  }
  setRoving(0);

  clearButton.addEventListener("click", () => {
    for (const tile of tiles) {
      tile.stage = 0;
      drawTile(tile);
    }
    status.textContent = "You turned the soil. The plot is ready for new seeds.";
  });
})();
