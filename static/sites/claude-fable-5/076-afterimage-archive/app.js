/* Afterimage Archive — plate renderer and record viewer.
   All plate artwork is generated deterministically from the catalogue
   record's seed, so every visit shows the same sixteen reconstructions. */
(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  const PLATES = [
    { no: "014", title: "Latch and Wire", artist: "Miriam Okafor", year: 1968, decade: 1960, process: "Photogram", recovered: "Estate sale, Rochester, 2004", seed: 3, note: "Household hardware laid directly on gelatin-silver paper. The latch was borrowed from Okafor's own darkroom door and returned before morning." },
    { no: "027", title: "Static Field II", artist: "Devon Ruiz", year: 1969, decade: 1960, process: "Luminogram", recovered: "Community darkroom closure, Oakland, 2006", seed: 11, note: "Made by moving a penlight above the easel for ninety seconds. Ruiz called the series 'weather reports from a room with no windows.'" },
    { no: "081", title: "Slow Burn", artist: "Anneke Vos", year: 1971, decade: 1970, process: "Chemigram", recovered: "Framing-shop drawer, Utrecht, 2005", seed: 19, note: "Developer painted on with a sponge, fixer flicked from a toothbrush. The print was abandoned mid-wash and kept its tide lines." },
    { no: "106", title: "Eclipse Rehearsal", artist: "Tomas Iwai", year: 1973, decade: 1970, process: "Solarization", recovered: "Portfolio donation, Kyoto, 2008", seed: 27, note: "Re-exposed under the enlarger at the moment the highlights formed. Iwai timed the flash by holding his breath." },
    { no: "149", title: "Kitchen Window, 4 a.m.", artist: "Miriam Okafor", year: 1975, decade: 1970, process: "Photogram", recovered: "Estate sale, Rochester, 2004", seed: 35, note: "Lace curtain and two drinking glasses, printed before the household woke. One of four surviving prints from the 'Quiet Hours' series." },
    { no: "203", title: "Signal Decay", artist: "Priya Menon", year: 1977, decade: 1970, process: "Luminogram", recovered: "University storage, Madras, 2010", seed: 43, note: "An oscilloscope trace photographed off the tube, then contact-printed through frosted mylar until the waveform blurred to breath." },
    { no: "238", title: "Sixteen Exposures of a Door", artist: "Carl Whitfield", year: 1979, decade: 1970, process: "Multiple exposure", recovered: "Yard sale, Birmingham, 2007", seed: 51, note: "The same door, opened one inch further in each exposure. Whitfield never said which door, or what was behind it." },
    { no: "311", title: "Acid Bloom", artist: "Anneke Vos", year: 1982, decade: 1980, process: "Chemigram", recovered: "Framing-shop drawer, Utrecht, 2005", seed: 59, note: "Resist of candle wax scraped away in stages between baths. The bloom pattern took eleven hours and, by Vos's account, most of a thermos of coffee." },
    { no: "356", title: "Half-Remembered Room", artist: "Devon Ruiz", year: 1984, decade: 1980, process: "Pinhole", recovered: "Community darkroom closure, Oakland, 2006", seed: 67, note: "A forty-minute exposure through a hole pierced in a biscuit tin. Everything that moved vanished; only the furniture is remembered." },
    { no: "402", title: "Interference Study 9", artist: "Priya Menon", year: 1986, decade: 1980, process: "Luminogram", recovered: "University storage, Madras, 2010", seed: 75, note: "Two penlights swung on strings of slightly different lengths. The interference pattern is the sound of the room, drawn in light." },
    { no: "477", title: "The Argument, Rewound", artist: "Carl Whitfield", year: 1988, decade: 1980, process: "Multiple exposure", recovered: "Yard sale, Birmingham, 2007", seed: 83, note: "Eight exposures of two chairs, printed in reverse order of the evening they describe. The chairs end the print facing one another." },
    { no: "530", title: "Salt on Glass", artist: "Tomas Iwai", year: 1990, decade: 1990, process: "Solarization", recovered: "Portfolio donation, Kyoto, 2008", seed: 91, note: "Sea salt crystallized on a glass plate, enlarged and flashed. The Mackie lines around each crystal read like coastlines." },
    { no: "618", title: "Ferns, Inverted", artist: "Lena Barros", year: 1992, decade: 1990, process: "Photogram", recovered: "Botanical society archive, Lisbon, 2011", seed: 99, note: "Pressed ferns from a herbarium sheet, printed as white shadows. Barros catalogued the species on the verso in pencil." },
    { no: "701", title: "Long Room, Small Hole", artist: "Lena Barros", year: 1995, decade: 1990, process: "Pinhole", recovered: "Botanical society archive, Lisbon, 2011", seed: 107, note: "The society's reading room, exposed through the wall of a shoebox over a full afternoon of light and dust." },
    { no: "856", title: "Dial Tone", artist: "Priya Menon", year: 1997, decade: 1990, process: "Luminogram", recovered: "University storage, Madras, 2010", seed: 115, note: "The last of the interference studies. A single steady light, held still: the drone before the line goes dead." },
    { no: "947", title: "Last Print Before Closing", artist: "Anneke Vos", year: 1999, decade: 1990, process: "Chemigram", recovered: "Framing-shop drawer, Utrecht, 2005", seed: 123, note: "Made the night Vos's darkroom building was sold. She poured the remaining chemistry across one final sheet and let it decide." },
  ];

  /* Deterministic PRNG (mulberry32) so plate art is stable across visits. */
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const el = (name, attrs) => {
    const node = document.createElementNS(SVG_NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  };

  const PAPER = "#f0e7d6";
  const INK = "#141110";

  /* Each process family gets its own drawing routine on a 400×400 plate. */
  const drawers = {
    Photogram(g, r) {
      const objects = 4 + Math.floor(r() * 4);
      for (let i = 0; i < objects; i += 1) {
        const cx = 60 + r() * 280;
        const cy = 60 + r() * 280;
        const kind = r();
        const opacity = (0.55 + r() * 0.4).toFixed(2);
        if (kind < 0.4) {
          g.appendChild(el("circle", { cx, cy, r: 14 + r() * 46, fill: PAPER, "fill-opacity": opacity }));
        } else if (kind < 0.7) {
          g.appendChild(el("rect", {
            x: cx - 40, y: cy - 6, width: 40 + r() * 90, height: 6 + r() * 14,
            fill: PAPER, "fill-opacity": opacity,
            transform: `rotate(${Math.round(r() * 180)} ${cx} ${cy})`,
          }));
        } else {
          const x2 = cx + (r() - 0.5) * 220;
          const y2 = cy + (r() - 0.5) * 220;
          g.appendChild(el("line", {
            x1: cx, y1: cy, x2, y2,
            stroke: PAPER, "stroke-opacity": opacity, "stroke-width": 2 + r() * 4, "stroke-linecap": "round",
          }));
        }
      }
    },
    Luminogram(g, r) {
      const bands = 3 + Math.floor(r() * 3);
      for (let i = 0; i < bands; i += 1) {
        const cy = 50 + r() * 300;
        const sweep = [];
        for (let x = 0; x <= 400; x += 25) {
          sweep.push(`${x},${(cy + Math.sin(x / (28 + r() * 22) + i * 2) * (18 + r() * 42)).toFixed(1)}`);
        }
        g.appendChild(el("polyline", {
          points: sweep.join(" "),
          fill: "none", stroke: PAPER,
          "stroke-opacity": (0.25 + r() * 0.55).toFixed(2),
          "stroke-width": 3 + r() * 16, "stroke-linecap": "round",
        }));
      }
      g.appendChild(el("circle", {
        cx: 80 + r() * 240, cy: 80 + r() * 240, r: 26 + r() * 44,
        fill: PAPER, "fill-opacity": "0.28",
      }));
    },
    Chemigram(g, r) {
      const blobs = 5 + Math.floor(r() * 5);
      for (let i = 0; i < blobs; i += 1) {
        const cx = 50 + r() * 300;
        const cy = 50 + r() * 300;
        const radius = 20 + r() * 70;
        let d = "";
        const lobes = 7;
        for (let k = 0; k <= lobes; k += 1) {
          const angle = (k / lobes) * Math.PI * 2;
          const wobble = radius * (0.65 + r() * 0.6);
          const px = (cx + Math.cos(angle) * wobble).toFixed(1);
          const py = (cy + Math.sin(angle) * wobble).toFixed(1);
          d += (k === 0 ? `M${px} ${py}` : ` L${px} ${py}`);
        }
        d += " Z";
        const tone = r();
        g.appendChild(el("path", {
          d,
          fill: tone < 0.6 ? PAPER : "#e2582c",
          "fill-opacity": (tone < 0.6 ? 0.3 + r() * 0.45 : 0.2 + r() * 0.3).toFixed(2),
          stroke: PAPER, "stroke-opacity": "0.25", "stroke-width": "1",
        }));
      }
    },
    Solarization(g, r) {
      const cx = 130 + r() * 140;
      const cy = 130 + r() * 140;
      const rings = 5 + Math.floor(r() * 4);
      for (let i = rings; i >= 1; i -= 1) {
        g.appendChild(el("circle", {
          cx, cy, r: (i / rings) * (120 + r() * 60),
          fill: "none", stroke: i % 2 ? PAPER : "#d8b98a",
          "stroke-opacity": (0.2 + (i / rings) * 0.55).toFixed(2),
          "stroke-width": 1.5 + r() * 5,
        }));
      }
      g.appendChild(el("circle", { cx, cy, r: 16 + r() * 18, fill: PAPER, "fill-opacity": "0.85" }));
      g.appendChild(el("circle", { cx, cy, r: 7 + r() * 8, fill: INK }));
    },
    "Multiple exposure"(g, r) {
      const frames = 5 + Math.floor(r() * 5);
      const w = 90 + r() * 60;
      const h = 150 + r() * 90;
      for (let i = 0; i < frames; i += 1) {
        const x = 40 + (i / frames) * (300 - w * 0.4) + (r() - 0.5) * 24;
        const y = 60 + (r() - 0.5) * 50;
        g.appendChild(el("rect", {
          x: x.toFixed(1), y: y.toFixed(1), width: w.toFixed(1), height: h.toFixed(1),
          fill: PAPER, "fill-opacity": (0.09 + r() * 0.14).toFixed(2),
          stroke: PAPER, "stroke-opacity": "0.35", "stroke-width": "1",
          transform: `rotate(${((r() - 0.5) * 10).toFixed(1)} ${(x + w / 2).toFixed(1)} ${(y + h / 2).toFixed(1)})`,
        }));
      }
    },
    Pinhole(g, r) {
      g.appendChild(el("rect", { x: 0, y: 0, width: 400, height: 400, fill: "#26201b" }));
      const glow = el("circle", { cx: 200, cy: 190, r: 165, fill: "#d8b98a", "fill-opacity": "0.16" });
      g.appendChild(glow);
      g.appendChild(el("circle", { cx: 200, cy: 190, r: 110, fill: "#f0e7d6", "fill-opacity": "0.1" }));
      const shapes = 3 + Math.floor(r() * 3);
      for (let i = 0; i < shapes; i += 1) {
        const w = 40 + r() * 80;
        const h = 60 + r() * 120;
        const x = 40 + r() * (320 - w);
        g.appendChild(el("rect", {
          x: x.toFixed(1), y: (330 - h).toFixed(1), width: w.toFixed(1), height: h.toFixed(1),
          fill: INK, "fill-opacity": (0.6 + r() * 0.35).toFixed(2),
        }));
      }
      g.appendChild(el("rect", { x: 0, y: 330, width: 400, height: 70, fill: INK, "fill-opacity": "0.7" }));
    },
  };

  const buildPlateSvg = (plate, large) => {
    const svg = el("svg", { viewBox: "0 0 400 400", role: "img" });
    svg.setAttribute("aria-label",
      `Plate ${plate.no}: ${plate.title}. Reconstruction of a ${plate.process.toLowerCase()} by ${plate.artist}, ${plate.year}.`);

    const filterId = `grain-${plate.no}${large ? "-lg" : ""}`;
    const defs = el("defs", {});
    const filter = el("filter", { id: filterId, x: "-5%", y: "-5%", width: "110%", height: "110%" });
    filter.appendChild(el("feTurbulence", {
      type: "fractalNoise", baseFrequency: "0.8", numOctaves: "2",
      seed: String(plate.seed), stitchTiles: "stitch", result: "noise",
    }));
    filter.appendChild(el("feColorMatrix", {
      in: "noise", type: "matrix",
      values: "0 0 0 0 0.92  0 0 0 0 0.87  0 0 0 0 0.78  0 0 0 0.1 0",
    }));
    filter.appendChild(el("feComposite", { operator: "over", in2: "SourceGraphic" }));
    defs.appendChild(filter);
    svg.appendChild(defs);

    const group = el("g", { filter: `url(#${filterId})` });
    group.appendChild(el("rect", { x: 0, y: 0, width: 400, height: 400, fill: INK }));
    drawers[plate.process](group, rng(plate.seed * 2654435761));
    /* Plate edge and catalogue notch, common to every reconstruction. */
    group.appendChild(el("rect", {
      x: 6, y: 6, width: 388, height: 388,
      fill: "none", stroke: PAPER, "stroke-opacity": "0.22", "stroke-width": "1.5",
    }));
    group.appendChild(el("line", {
      x1: 16, y1: 384, x2: 76, y2: 384,
      stroke: "#e2582c", "stroke-opacity": "0.8", "stroke-width": "2",
    }));
    svg.appendChild(group);
    return svg;
  };

  /* ---------- Grid ---------- */
  const grid = document.getElementById("plate-grid");
  const status = document.getElementById("filter-status");
  const cards = [];

  PLATES.forEach((plate, index) => {
    const li = document.createElement("li");
    li.className = "plate-card";
    li.dataset.decade = String(plate.decade);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "plate-button";
    button.addEventListener("click", () => openRecord(index));

    const art = document.createElement("div");
    art.className = "plate-art";
    art.appendChild(buildPlateSvg(plate, false));

    const caption = document.createElement("div");
    caption.className = "plate-caption";

    const no = document.createElement("span");
    no.className = "plate-no";
    no.textContent = `Plate ${plate.no}`;

    const title = document.createElement("p");
    title.className = "plate-title";
    title.textContent = plate.title;

    const sub = document.createElement("span");
    sub.className = "plate-sub";
    sub.textContent = `${plate.artist} · ${plate.year} · ${plate.process}`;

    caption.append(no, title, sub);
    button.append(art, caption);
    li.appendChild(button);
    grid.appendChild(li);
    cards.push(li);
  });

  /* ---------- Filters ---------- */
  const filters = Array.from(document.querySelectorAll(".filter"));
  const NUMBER_WORDS = { 16: "all sixteen plates", 2: "two plates", 5: "five plates", 4: "four plates" };

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((other) => {
        const active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      const decade = button.dataset.decade;
      let shown = 0;
      cards.forEach((card) => {
        const visible = decade === "all" || card.dataset.decade === decade;
        card.hidden = !visible;
        if (visible) shown += 1;
      });
      const label = decade === "all" ? "all decades" : button.textContent.trim();
      status.textContent = `Showing ${NUMBER_WORDS[shown] || `${shown} plates`} — ${label}.`;
    });
  });

  /* ---------- Record dialog ---------- */
  const dialog = document.getElementById("record");
  const figure = document.getElementById("record-figure");
  const fields = {
    no: document.getElementById("record-no"),
    title: document.getElementById("record-title"),
    artist: document.getElementById("record-artist"),
    year: document.getElementById("record-year"),
    process: document.getElementById("record-process"),
    recovered: document.getElementById("record-recovered"),
    note: document.getElementById("record-note"),
  };
  const prevButton = document.getElementById("record-prev");
  const nextButton = document.getElementById("record-next");
  let currentIndex = 0;

  const visibleIndices = () =>
    cards.reduce((list, card, index) => (card.hidden ? list : (list.push(index), list)), []);

  const renderRecord = (index) => {
    const plate = PLATES[index];
    currentIndex = index;
    figure.replaceChildren(buildPlateSvg(plate, true));
    fields.no.textContent = `Plate ${plate.no} of 947`;
    fields.title.textContent = plate.title;
    fields.artist.textContent = plate.artist;
    fields.year.textContent = String(plate.year);
    fields.process.textContent = plate.process;
    fields.recovered.textContent = plate.recovered;
    fields.note.textContent = plate.note;
  };

  const step = (direction) => {
    const pool = visibleIndices();
    if (!pool.length) return;
    const position = pool.indexOf(currentIndex);
    const next = pool[(position + direction + pool.length) % pool.length];
    renderRecord(next);
  };

  const openRecord = (index) => {
    renderRecord(index);
    dialog.showModal();
  };

  prevButton.addEventListener("click", () => step(-1));
  nextButton.addEventListener("click", () => step(1));
  document.getElementById("record-close").addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
  });

  /* Close when the backdrop itself is clicked or tapped. */
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
