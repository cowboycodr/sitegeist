/* Deep Time — interactive stratigraphic timeline (dependency-free) */
(() => {
  "use strict";

  // Geological chapters, oldest first. "start" in millions of years ago (Ma).
  const ERAS = [
    {
      id: "hadean", name: "Hadean", accent: "#8a5a3c",
      span: "4540 – 4000 Ma", start: 4540, end: 4000,
      kicker: "Eon · Fire",
      tag: "A world still cooling from its own making.",
      desc: "The infant Earth is a bombarded furnace. A drifting body strikes it and flings the Moon into orbit. As the crust hardens, the first oceans rain down and steam back up again.",
      facts: ["The Moon forms from a giant impact", "First solid crust and zircon crystals", "Oceans condense, then boil, then stay"],
      chips: ["No life", "Molten crust", "Heavy bombardment"],
    },
    {
      id: "archean", name: "Archean", accent: "#a86a30",
      span: "4000 – 2500 Ma", start: 4000, end: 2500,
      kicker: "Eon · First life",
      tag: "Chemistry learns to copy itself.",
      desc: "In hydrothermal shallows, single cells take hold. Cyanobacteria begin to photosynthesise, quietly seeding the atmosphere with a poison that will one day become breath.",
      facts: ["Oldest confirmed microfossils", "Stromatolites build reef-like mounds", "Continents grow their first cores"],
      chips: ["Microbial mats", "Anoxic seas", "Green sunlight"],
    },
    {
      id: "proterozoic", name: "Proterozoic", accent: "#7f9a6a",
      span: "2500 – 541 Ma", start: 2500, end: 541,
      kicker: "Eon · Oxygen",
      tag: "The air turns, and the world nearly freezes.",
      desc: "Oxygen floods the atmosphere in the Great Oxidation Event, rusting the oceans red. Complex cells appear, then the planet ices over pole to pole — Snowball Earth — before thawing into the first animals.",
      facts: ["Great Oxidation Event rusts the seas", "Eukaryotic cells with a nucleus arise", "Snowball Earth glaciations", "The soft Ediacaran biota"],
      chips: ["Banded iron", "Snowball Earth", "First animals"],
    },
    {
      id: "paleozoic", name: "Paleozoic", accent: "#5a8b96",
      span: "541 – 252 Ma", start: 541, end: 252,
      kicker: "Era · Ancient life",
      tag: "Life invents the body, then the shore.",
      desc: "The Cambrian explosion fills the seas with eyes, shells, and spines. Fish give rise to limbs, plants green the continents, and forests lay down the coal that still warms us. It ends in the largest dying of all.",
      facts: ["Cambrian explosion of animal body plans", "First vertebrates and jawed fish", "Plants and arthropods colonise land", "Vast coal-forming forests"],
      chips: ["Trilobites", "First forests", "Amphibians"],
    },
    {
      id: "mesozoic", name: "Mesozoic", accent: "#c9743a",
      span: "252 – 66 Ma", start: 252, end: 66,
      kicker: "Era · Middle life",
      tag: "The age of reptiles, and the first flowers.",
      desc: "From the great Permian silence, dinosaurs rise to rule land, sea, and sky. Mammals scurry in the undergrowth, flowering plants unfurl, and birds take feathered flight — until an asteroid closes the curtain.",
      facts: ["Dinosaurs dominate every landscape", "First mammals and true birds", "Flowering plants transform the land", "Pangaea rifts apart into oceans"],
      chips: ["Dinosaurs", "Flowers", "Pangaea splits"],
    },
    {
      id: "cenozoic", name: "Cenozoic", accent: "#e0c88a",
      span: "66 Ma – now", start: 66, end: 0,
      kicker: "Era · Recent life",
      tag: "Mammals inherit a scarred, cooling world.",
      desc: "In the impact's aftermath, mammals radiate into every niche. Grasslands spread, ice ages come and go, and in the last thin sliver of time a curious upright ape begins to read the very rocks that made it.",
      facts: ["Mammals radiate across the continents", "Grasses and grazing herds spread", "Ice ages sculpt the northern world", "Hominins, and eventually us"],
      chips: ["Mammals", "Ice ages", "Humans"],
    },
  ];

  const EXTINCTIONS = [
    { name: "End-Ordovician", when: "≈444 Ma", loss: 85, note: "Glaciation drops sea levels; the shallow, crowded seas empty of trilobites and brachiopods." },
    { name: "Late Devonian", when: "≈372 Ma", loss: 75, note: "A long, staggered crisis strikes reef-builders and armoured fish across warming, oxygen-starved seas." },
    { name: "End-Permian", when: "≈252 Ma", loss: 96, note: "“The Great Dying.” Siberian volcanism nearly ends complex life — the closest Earth came to sterile." },
    { name: "End-Triassic", when: "≈201 Ma", loss: 80, note: "Volcanic rifting of Pangaea clears competitors and opens the world to the coming dinosaurs." },
    { name: "End-Cretaceous", when: "≈66 Ma", loss: 76, note: "An asteroid strikes Chicxulub; the non-avian dinosaurs vanish and mammals inherit the ruins." },
  ];

  // Specimens with hand-built inline SVG motifs.
  const SPECIMENS = [
    {
      name: "Stromatolite", era: "Archean",
      note: "Layered mounds built by microbial mats — among the oldest fossils of life.",
      svg: `<g fill="none" stroke="#7f9a6a" stroke-width="3">
        <path d="M40 130 Q75 40 110 130" /><path d="M60 130 Q95 55 130 130" />
        <path d="M95 130 Q140 30 185 130" /><path d="M150 130 Q185 60 220 130" />
      </g><rect x="20" y="128" width="200" height="8" fill="#4a3a28"/>`,
    },
    {
      name: "Trilobite", era: "Paleozoic",
      note: "An armoured arthropod that crawled the Cambrian seafloor for 270 million years.",
      svg: `<g fill="#5a8b96" stroke="#0e0a07" stroke-width="1.5">
        <ellipse cx="120" cy="75" rx="42" ry="60"/></g>
        <g stroke="#0e0a07" stroke-width="1.5"><path d="M120 20 V130"/>
        <path d="M92 40 H148 M88 60 H152 M86 80 H154 M90 100 H150"/></g>`,
    },
    {
      name: "Ammonite", era: "Mesozoic",
      note: "A coiled cephalopod, its spiral shell a signature of the age of reptiles.",
      svg: `<g fill="none" stroke="#c9743a" stroke-width="3">
        <path d="M120 75 m0 0 a8 8 0 1 1 8 -8 a18 18 0 1 1 -22 12 a30 30 0 1 1 38 -20 a44 44 0 1 1 -58 30"/>
      </g>`,
    },
    {
      name: "Fern frond", era: "Paleozoic",
      note: "Cast from a Carboniferous coal swamp — the green that greened the land.",
      svg: `<g stroke="#7f9a6a" stroke-width="2.5" fill="none">
        <path d="M120 130 C120 90 120 50 120 25"/>
        <g><path d="M120 40 q-22 -6 -34 4 M120 55 q-26 -6 -40 6 M120 72 q-30 -4 -46 8 M120 90 q-30 -2 -46 12"/>
        <path d="M120 40 q22 -6 34 4 M120 55 q26 -6 40 6 M120 72 q30 -4 46 8 M120 90 q30 -2 46 12"/></g>
      </g>`,
    },
    {
      name: "Theropod tooth", era: "Mesozoic",
      note: "A serrated blade shed by a predatory dinosaur and buried in river sand.",
      svg: `<path d="M120 20 C150 60 150 110 128 130 C112 118 106 96 108 70 C110 46 114 32 120 20 Z" fill="#e0c88a" stroke="#0e0a07" stroke-width="1.5"/>
        <path d="M128 40 l6 2 M130 55 l6 2 M130 70 l6 2 M128 85 l6 2 M124 100 l6 2" stroke="#0e0a07" stroke-width="1.5"/>`,
    },
    {
      name: "Mammoth molar", era: "Cenozoic",
      note: "Ridged for grinding ice-age grasses on the cold Pleistocene steppe.",
      svg: `<g fill="#e8dcc2" stroke="#0e0a07" stroke-width="1.5">
        <rect x="72" y="46" width="96" height="70" rx="10"/></g>
        <g stroke="#8a5a3c" stroke-width="3"><path d="M84 46 V116 M98 46 V116 M112 46 V116 M126 46 V116 M140 46 V116 M154 46 V116"/></g>`,
    },
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ---- Timeline rail + stage ---- */
  const list = $("#era-list");
  const stage = $("#era-stage");
  let current = 0;

  ERAS.forEach((era, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "era-btn";
    btn.id = "erabtn-" + era.id;
    btn.style.setProperty("--era-accent", era.accent);
    btn.innerHTML =
      `<span class="era-swatch" style="background:${era.accent}"></span>${era.name}` +
      `<span class="era-span">${era.span}</span>`;
    btn.addEventListener("click", () => select(i));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); select(Math.min(ERAS.length - 1, i + 1), true); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); select(Math.max(0, i - 1), true); }
      else if (e.key === "Home") { e.preventDefault(); select(0, true); }
      else if (e.key === "End") { e.preventDefault(); select(ERAS.length - 1, true); }
    });
    li.appendChild(btn);
    list.appendChild(li);
  });

  const OLDEST = ERAS[0].start;

  function render(era) {
    const pct = Math.max(2, Math.round(((OLDEST - era.end) / OLDEST) * 100));
    stage.style.setProperty("--era-accent", era.accent);
    stage.innerHTML =
      `<article class="era-card">
        <div class="era-band"></div>
        <div class="era-body">
          <p class="era-kicker"><span>${era.kicker}</span><span class="era-when">${era.span}</span></p>
          <h3>${era.name}</h3>
          <p class="era-tag">${era.tag}</p>
          <p class="era-desc">${era.desc}</p>
          <ul class="era-facts">${era.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
          <div class="era-meta">${era.chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>
          <div class="era-progress" role="img" aria-label="Position in Earth history: ${pct} percent of the way to the present">
            <i style="width:${reduceMotion ? pct : 2}%"></i>
          </div>
          <div class="era-scale"><span>4.54 billion years ago</span><span>Today</span></div>
        </div>
      </article>`;
    if (!reduceMotion) {
      requestAnimationFrame(() => {
        const bar = stage.querySelector(".era-progress i");
        if (bar) bar.style.width = pct + "%";
      });
    }
  }

  function select(i, focus) {
    current = i;
    const era = ERAS[i];
    render(era);
    list.querySelectorAll(".era-btn").forEach((b, idx) => {
      const on = idx === i;
      b.setAttribute("aria-current", on ? "true" : "false");
      if (on && focus) b.focus();
      if (on) b.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  select(0);

  /* ---- Extinctions ---- */
  const extList = $("#ext-list");
  extList.innerHTML = EXTINCTIONS.map((e) =>
    `<li class="ext-item">
      <div class="ext-dial" style="--loss:${e.loss}"><b>${e.loss}%</b></div>
      <div class="ext-body">
        <p class="ext-when">${e.when}</p>
        <h3>${e.name}</h3>
        <p>${e.note}</p>
      </div>
    </li>`).join("");

  /* ---- Collection ---- */
  const grid = $("#specimen-grid");
  grid.innerHTML = SPECIMENS.map((s) =>
    `<article class="specimen">
      <figure>
        <svg viewBox="0 0 240 150" role="img" aria-label="${s.name} specimen illustration">${s.svg}</svg>
        <figcaption>
          <span class="sp-era">${s.era}</span>
          <h3>${s.name}</h3>
          <p>${s.note}</p>
        </figcaption>
      </figure>
    </article>`).join("");

  /* ---- Gallery viewer keyboard signal (from bridge, when embedded) ----
     Left/Right arrows at the document level step through eras when the
     timeline is the focus of attention; harmless otherwise. */
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName))) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tl = document.getElementById("timeline");
    const rect = tl.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > 0;
    if (!inView) return;
    if (e.key === "ArrowRight") { e.preventDefault(); select(Math.min(ERAS.length - 1, current + 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); select(Math.max(0, current - 1)); }
  });
})();
