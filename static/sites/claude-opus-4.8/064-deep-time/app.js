"use strict";
(() => {
  // ---- Geologic chapters: position is a rough share of the 4,540 Ma span ----
  const ERAS = [
    {
      tag: "Hadean Eon", name: "The Molten World", pos: 0.02,
      span: "4,540 – 4,000 million years ago",
      body: "A newborn planet glows under relentless bombardment. Oceans of magma churn beneath a black sky, and a Mars-sized impactor casts off the debris that becomes the Moon.",
      facts: ["No solid crust", "The Moon is born", "Sky the colour of iron"],
      art: "hadean"
    },
    {
      tag: "Archean Eon", name: "First Breath of Life", pos: 0.18,
      span: "4,000 – 2,500 million years ago",
      body: "In warm, metal-rich seas, the first single cells begin to copy themselves. Mats of cyanobacteria build stromatolites and quietly start exhaling a poison called oxygen.",
      facts: ["Life appears", "Stromatolite reefs", "Oxygen begins"],
      art: "archean"
    },
    {
      tag: "Proterozoic Eon", name: "Rust and Ice", pos: 0.4,
      span: "2,500 – 541 million years ago",
      body: "Free oxygen rusts the oceans red and nearly ends life in the Great Oxidation. Later the whole world freezes into 'Snowball Earth', then thaws to give the first complex cells room to grow.",
      facts: ["Great Oxidation", "Snowball Earth", "First eukaryotes"],
      art: "proterozoic"
    },
    {
      tag: "Paleozoic Era", name: "The Cambrian Explosion", pos: 0.6,
      span: "541 – 252 million years ago",
      body: "Bodies erupt into every shape at once — shells, eyes, legs, spines. Fish learn to swim, plants crawl onto land, and forests exhale the coal we still burn today.",
      facts: ["Eyes invented", "Life leaves the sea", "Coal forests"],
      art: "paleozoic"
    },
    {
      tag: "Mesozoic Era", name: "Age of the Dinosaurs", pos: 0.78,
      span: "252 – 66 million years ago",
      body: "After the greatest extinction of all, the survivors inherit a warm, green world. Dinosaurs rule the land for 165 million years while the first flowers and feathers appear.",
      facts: ["Dinosaurs reign", "First flowers", "Feathers take flight"],
      art: "mesozoic"
    },
    {
      tag: "Cenozoic Era", name: "The Age of Mammals", pos: 0.9,
      span: "66 – 2.6 million years ago",
      body: "With the giant reptiles gone, mammals radiate into every niche — whales return to the sea, grasses spread, and a lineage of upright apes begins to watch the horizon.",
      facts: ["Whales evolve", "Grasslands spread", "Apes stand up"],
      art: "cenozoic"
    },
    {
      tag: "Quaternary Period", name: "Ice and Us", pos: 0.97,
      span: "2.6 million years ago – 11,700 years ago",
      body: "Ice ages advance and retreat like a slow tide. Mammoths cross land bridges, and among the cold-adapted creatures a small, curious hominin learns fire, language, and art.",
      facts: ["Repeating ice ages", "Megafauna roam", "Humans emerge"],
      art: "quaternary"
    },
    {
      tag: "Anthropocene", name: "The Thin Present", pos: 1,
      span: "11,700 years ago – today",
      body: "A single species reshapes coastlines, atmosphere, and climate within a few thousand years. The newest layer of rock is threaded with concrete, plastic, and carbon — and it is still being laid.",
      facts: ["Cities and farms", "Carbon rising", "Layer still forming"],
      art: "anthropocene"
    }
  ];

  // ---- Inline scene generators (deterministic, no network) ----
  const S = (inner, extra) =>
    `<svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" ${extra || ""}>${inner}</svg>`;
  const strataBg = (a, b) =>
    `<rect width="400" height="170" fill="${a}"/><rect y="120" width="400" height="50" fill="${b}" opacity=".6"/>`;

  const SCENES = {
    hadean: () => S(strataBg("#1a0f12", "#3a1810") +
      `<circle cx="300" cy="46" r="40" fill="#e2703a"/><circle cx="300" cy="46" r="40" fill="url(#g1)"/>
       <defs><radialGradient id="g1" cx=".35" cy=".35"><stop offset="0" stop-color="#f7d98a"/><stop offset="1" stop-color="#8a2d18" stop-opacity=".2"/></radialGradient></defs>
       <path d="M0 150 Q100 120 200 148 T400 140" fill="none" stroke="#e2703a" stroke-width="3" opacity=".8"/>
       <circle cx="90" cy="40" r="12" fill="#5a6572"/><path d="M0 165 L400 165" stroke="#f2c14e" stroke-width="4" opacity=".5"/>`),
    archean: () => S(strataBg("#0d1a1a", "#123028") +
      `<g fill="#2f5a52">${Array.from({length:6},(_,i)=>`<ellipse cx="${40+i*62}" cy="150" rx="22" ry="9"/>`).join("")}</g>
       <g stroke="#7fa663" stroke-width="2" opacity=".8">${Array.from({length:6},(_,i)=>`<path d="M${40+i*62} 150 q-4 -30 0 -46" fill="none"/>`).join("")}</g>
       <circle cx="330" cy="40" r="26" fill="#f2c14e" opacity=".5"/>`),
    proterozoic: () => S(strataBg("#141c2a", "#2a1f14") +
      `<rect width="400" height="80" fill="#5f9ea9" opacity=".25"/>
       <g fill="#b45a3c" opacity=".5">${Array.from({length:14},(_,i)=>`<rect x="${i*30}" y="86" width="26" height="8" rx="2"/>`).join("")}</g>
       <g fill="#dfe7ef" opacity=".85"><circle cx="120" cy="50" r="4"/><circle cx="250" cy="70" r="3"/><circle cx="320" cy="44" r="5"/></g>`),
    paleozoic: () => S(strataBg("#0d1626", "#153048") +
      `<path d="M0 60 Q80 40 140 66 T280 60 T400 70 L400 170 L0 170Z" fill="#12324a" opacity=".7"/>
       <g fill="none" stroke="#5f9ea9" stroke-width="2.4">
         <path d="M60 120 q26 -18 52 0 q-26 22 -52 0Z" fill="#5f9ea9" opacity=".6"/>
         <path d="M250 96 q30 -20 60 0 q-30 24 -60 0Z" fill="#7fa663" opacity=".6"/></g>
       <circle cx="86" cy="118" r="3" fill="#08131f"/><circle cx="276" cy="94" r="3" fill="#08131f"/>`),
    mesozoic: () => S(strataBg("#101a12", "#20301a") +
      `<circle cx="330" cy="42" r="24" fill="#f2c14e" opacity=".55"/>
       <path d="M20 150 q60 -20 90 -66 q10 -30 34 -30 q30 0 30 26 q34 4 46 40 q10 30 40 36" fill="none" stroke="#7fa663" stroke-width="4" stroke-linecap="round"/>
       <path d="M40 150 q40 -14 66 -50" fill="none" stroke="#e2703a" stroke-width="3" opacity=".7"/>
       <g fill="#2f5a52">${Array.from({length:5},(_,i)=>`<path d="M${30+i*80} 150 l10 -34 l10 34Z"/>`).join("")}</g>`),
    cenozoic: () => S(strataBg("#0e1520", "#243018") +
      `<rect y="118" width="400" height="52" fill="#5a7a3a" opacity=".45"/>
       <g stroke="#7fa663" stroke-width="1.4" opacity=".8">${Array.from({length:40},(_,i)=>`<path d="M${i*10+4} 150 v-16"/>`).join("")}</g>
       <path d="M120 120 q26 -30 60 -18 q30 10 20 34 q-10 20 -40 12 q-8 20 -30 6 q-24 -14 -10 -34Z" fill="#8a6a4a"/>
       <circle cx="150" cy="118" r="3" fill="#0e1520"/><circle cx="330" cy="40" r="20" fill="#f2c14e" opacity=".5"/>`),
    quaternary: () => S(strataBg("#0c1420", "#1c2b3a") +
      `<path d="M0 110 L70 70 L140 108 L210 66 L300 112 L400 74 L400 170 L0 170Z" fill="#a9c3d6" opacity=".6"/>
       <path d="M0 130 L70 96 L140 128 L210 92 L300 132 L400 98" fill="none" stroke="#dfe7ef" stroke-width="2" opacity=".7"/>
       <g fill="#dfe7ef">${Array.from({length:18},(_,i)=>`<circle cx="${(i*53)%400}" cy="${20+(i*29)%60}" r="1.8"/>`).join("")}</g>`),
    anthropocene: () => S(strataBg("#0c1018", "#1a1410") +
      `<g fill="#2a3342">${[40,80,120,170,220,260,310,350].map((x,i)=>`<rect x="${x}" y="${150-(30+((i*23)%64))}" width="24" height="${30+((i*23)%64)}"/>`).join("")}</g>
       <g fill="#f2c14e" opacity=".85">${[40,80,120,170,220,260,310,350].map((x,i)=>`<rect x="${x+4}" y="${120-((i*23)%40)}" width="4" height="4"/>`).join("")}</g>
       <path d="M0 46 Q120 20 200 42 T400 34" fill="none" stroke="#e2703a" stroke-width="3" opacity=".7"/>
       <text x="12" y="24" fill="#9aa8bd" font-family="serif" font-size="12" opacity=".7">now</text>`)
  };

  // ---- Specimens ----
  const spec = (inner) =>
    `<svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="120" fill="#0a0d14"/>${inner}</svg>`;
  const SPECIMENS = [
    {
      name: "Ammonite", meta: "Jurassic · 175 Ma",
      body: "A coiled predator of the ancient seas. Its logarithmic spiral is the same curve we find in galaxies and hurricanes.",
      art: spec(`<g transform="translate(120 60)"><g fill="none" stroke="#e2703a" stroke-width="3">
        <path d="M0 0 A6 6 0 1 1 6 -8 A14 14 0 1 1 -12 -18 A26 26 0 1 1 26 -34 A40 40 0 1 1 -46 -8"/></g>
        <g stroke="#5f9ea9" stroke-width="1.2" opacity=".7">${Array.from({length:12},(_,i)=>`<line x1="0" y1="0" x2="${Math.cos(i/12*6.28)*44}" y2="${Math.sin(i/12*6.28)*44}"/>`).join("")}</g></g>`)
    },
    {
      name: "Trilobite", meta: "Cambrian · 500 Ma",
      body: "Among the first animals to see. Its calcite eyes focused light with lenses of solid crystal, unblinking for 270 million years.",
      art: spec(`<g transform="translate(120 60)"><ellipse cx="0" cy="0" rx="34" ry="48" fill="none" stroke="#7fa663" stroke-width="3"/>
        <line x1="-34" y1="-30" x2="34" y2="-30" stroke="#7fa663" stroke-width="2"/>
        <g stroke="#7fa663" stroke-width="2" opacity=".8">${Array.from({length:9},(_,i)=>`<line x1="0" y1="${-24+i*7}" x2="${(i%2?26:22)}" y2="${-20+i*7}"/><line x1="0" y1="${-24+i*7}" x2="${-(i%2?26:22)}" y2="${-20+i*7}"/>`).join("")}</g>
        <line x1="0" y1="-46" x2="0" y2="44" stroke="#7fa663" stroke-width="1.5" opacity=".5"/></g>`)
    },
    {
      name: "Archaeopteryx", meta: "Jurassic · 150 Ma",
      body: "Half dinosaur, half bird. Its feathered wings and toothed jaw caught the moment reptiles first tilted toward the sky.",
      art: spec(`<g transform="translate(120 62)" fill="none" stroke="#f2c14e" stroke-width="2.6" stroke-linecap="round">
        <path d="M-40 20 q30 -10 40 -34 q6 -14 20 -12 q10 2 6 14"/>
        <path d="M-8 -26 q26 -6 40 8"/>
        <g stroke-width="1.6" opacity=".8"><path d="M-30 14 l-22 6"/><path d="M-20 6 l-24 2"/><path d="M-10 -2 l-24 -4"/><path d="M2 -8 l-18 -12"/></g>
        <path d="M8 -8 q22 8 40 34" /><circle cx="30" cy="-16" r="2.2" fill="#f2c14e"/></g>`)
    },
    {
      name: "Stromatolite", meta: "Archean · 3.4 Ga",
      body: "Not a bone but a city of bacteria, layered dome upon dome. These living rocks first filled the air with the oxygen we breathe.",
      art: spec(`<g transform="translate(120 118)">${Array.from({length:5},(_,i)=>`<path d="M${-70+i*30} 0 q10 ${-40-i*4} 20 0" fill="none" stroke="#5f9ea9" stroke-width="2.4" opacity="${0.9-i*0.1}"/><path d="M${-70+i*30} -14 q10 ${-32-i*4} 20 0" fill="none" stroke="#7fa663" stroke-width="1.8" opacity=".6"/>`).join("")}</g>`)
    },
    {
      name: "Fern frond", meta: "Carboniferous · 320 Ma",
      body: "Pressed flat as paper, a leaf from the coal forests. Its buried kin became the fuel that later powered an industrial world.",
      art: spec(`<g transform="translate(120 60)" stroke="#7fa663" fill="none" stroke-linecap="round">
        <path d="M0 46 C-6 10 -6 -20 0 -48" stroke-width="2.6"/>
        <g stroke-width="1.6" opacity=".85">${Array.from({length:11},(_,i)=>{const y=40-i*8;const l=26-Math.abs(i-5)*3;return `<path d="M0 ${y} q${l} ${-4} ${l} ${-14}"/><path d="M0 ${y} q${-l} ${-4} ${-l} ${-14}"/>`}).join("")}</g></g>`)
    },
    {
      name: "Mammoth tusk", meta: "Pleistocene · 40 ka",
      body: "A curve of ivory from the ice-age steppe. Some still emerge from thawing permafrost, so fresh they seem to remember the cold.",
      art: spec(`<g transform="translate(120 60)"><path d="M-40 -34 C10 -30 46 0 30 44 C24 60 4 54 6 40 C16 6 -14 -12 -44 -18Z" fill="none" stroke="#dfe7ef" stroke-width="3"/>
        <path d="M-34 -26 C8 -22 36 2 24 38" fill="none" stroke="#9aa8bd" stroke-width="1.4" opacity=".7"/></g>`)
    }
  ];

  // ---- Mass extinctions ----
  const EXTINCTIONS = [
    { when: "445 Ma", name: "Ordovician–Silurian", note: "Glaciation drops the seas and freezes the shallow reefs.", loss: "≈85%" },
    { when: "372 Ma", name: "Late Devonian", note: "Oxygen-starved oceans smother reef-builders over millions of years.", loss: "≈75%" },
    { when: "252 Ma", name: "Permian–Triassic", note: "'The Great Dying' — Siberian volcanism nearly ends complex life.", loss: "≈96%" },
    { when: "201 Ma", name: "Triassic–Jurassic", note: "Rifting continents and volcanism clear the stage for dinosaurs.", loss: "≈80%" },
    { when: "66 Ma", name: "Cretaceous–Paleogene", note: "An asteroid strikes; the non-avian dinosaurs vanish in an afternoon.", loss: "≈76%" }
  ];

  // ---- Render collection + extinctions ----
  const grid = document.getElementById("collection-grid");
  grid.innerHTML = SPECIMENS.map((s) => `
    <article class="card">
      <div class="spec">${s.art}</div>
      <span class="meta">${s.meta}</span>
      <h3>${s.name}</h3>
      <p>${s.body}</p>
    </article>`).join("");

  document.getElementById("ext-list").innerHTML = EXTINCTIONS.map((e, i) => `
    <li class="ext">
      <span class="when">${e.when}</span>
      <span class="name">${i + 1}. ${e.name}<small>${e.note}</small></span>
      <span class="loss">${e.loss}<small>genera lost</small></span>
    </li>`).join("");

  // ---- Timeline interaction ----
  const els = {
    tag: document.getElementById("era-tag"),
    name: document.getElementById("era-name"),
    span: document.getElementById("era-span"),
    body: document.getElementById("era-body"),
    facts: document.getElementById("era-facts"),
    figure: document.getElementById("era-figure"),
    marks: document.getElementById("tl-marks"),
    progress: document.getElementById("tl-progress"),
    counter: document.getElementById("counter"),
    prev: document.getElementById("prev"),
    next: document.getElementById("next")
  };

  let current = 0;

  // build marker buttons once
  els.marks.innerHTML = ERAS.map((e, i) =>
    `<li><button type="button" data-i="${i}" style="left:${(e.pos * 100).toFixed(2)}%" aria-label="${e.name}, ${e.span}"><span></span></button></li>`
  ).join("");
  const buttons = Array.from(els.marks.querySelectorAll("button"));

  function render(i) {
    current = i;
    const e = ERAS[i];
    els.tag.textContent = e.tag;
    els.name.textContent = e.name;
    els.span.textContent = e.span;
    els.body.textContent = e.body;
    els.facts.innerHTML = e.facts.map((f) => `<li>${f}</li>`).join("");
    els.figure.innerHTML = SCENES[e.art] ? SCENES[e.art]() : "";
    els.progress.style.width = (e.pos * 100).toFixed(2) + "%";
    els.counter.textContent = `Chapter ${i + 1} of ${ERAS.length}`;
    buttons.forEach((b, bi) => {
      b.setAttribute("aria-current", bi === i ? "true" : "false");
      b.tabIndex = bi === i ? 0 : -1;
    });
    els.prev.disabled = i === 0;
    els.next.disabled = i === ERAS.length - 1;
  }

  buttons.forEach((b) => b.addEventListener("click", () => {
    render(Number(b.dataset.i));
    b.focus();
  }));

  els.prev.addEventListener("click", () => { if (current > 0) render(current - 1); });
  els.next.addEventListener("click", () => { if (current < ERAS.length - 1) render(current + 1); });

  // keyboard navigation across the tablist
  els.marks.addEventListener("keydown", (ev) => {
    let ni = current;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") ni = Math.min(ERAS.length - 1, current + 1);
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") ni = Math.max(0, current - 1);
    else if (ev.key === "Home") ni = 0;
    else if (ev.key === "End") ni = ERAS.length - 1;
    else return;
    ev.preventDefault();
    render(ni);
    buttons[ni].focus();
  });

  render(0);
})();
