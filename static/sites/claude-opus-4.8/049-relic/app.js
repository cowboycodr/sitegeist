(() => {
  "use strict";

  // --- Illustrations: hand-built inline SVGs, one distinctive motif per object ---
  const art = {
    chair: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><ellipse cx="60" cy="106" rx="42" ry="6" fill="#000" opacity=".1"/><path d="M30 54q-8 2-8 20v22q0 6 7 6t7-6V72q3-12-6-18z" fill="#a8532e"/><path d="M90 54q8 2 8 20v22q0 6-7 6t-7-6V72q-3-12 6-18z" fill="#a8532e"/><path d="M32 44q0-28 28-28t28 28v14q0 8-7 8H39q-7 0-7-8z" fill="#8a3f22"/><rect x="36" y="66" width="48" height="22" rx="7" fill="#b5673c"/><path d="M38 88v18M82 88v18" stroke="#5a2e19" stroke-width="5" stroke-linecap="round"/></svg>`,
    sofa: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><ellipse cx="60" cy="100" rx="46" ry="6" fill="#000" opacity=".1"/><rect x="18" y="46" width="84" height="26" rx="10" fill="#8a3f22"/><rect x="22" y="60" width="76" height="24" rx="9" fill="#b5673c"/><rect x="16" y="54" width="14" height="30" rx="6" fill="#a8532e"/><rect x="90" y="54" width="14" height="30" rx="6" fill="#a8532e"/><path d="M28 84v14M92 84v14" stroke="#5a2e19" stroke-width="5" stroke-linecap="round"/></svg>`,
    floorlamp: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><path d="M42 40h36l-8 22H50z" fill="#b1852f"/><path d="M42 40h36l-2 6H44z" fill="#8a6320"/><path d="M60 62v42" stroke="#5a2e19" stroke-width="4"/><path d="M44 104h32" stroke="#5a2e19" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="30" r="4" fill="#e7cf9a"/></svg>`,
    tablelamp: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><path d="M40 40h40l-10 26H50z" fill="#b1852f"/><path d="M40 40h40l-2 6H42z" fill="#8a6320"/><path d="M60 66v26" stroke="#5a2e19" stroke-width="4"/><path d="M44 92q16-8 32 0z" fill="#8a3f22"/><ellipse cx="60" cy="94" rx="18" ry="5" fill="#5a2e19"/></svg>`,
    vase: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><path d="M50 24h20l-2 12q14 12 14 34t-22 30q-22-8-22-30t14-34z" fill="#5a5f43"/><path d="M50 24h20l-2 12H52z" fill="#454a33"/><path d="M46 78q14 8 28 0" fill="none" stroke="#e7cf9a" stroke-width="2" opacity=".5"/></svg>`,
    jug: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><path d="M46 30h24l6 16q10 8 10 28t-18 26q-24 0-24-26 0-20 8-28z" fill="#a8532e"/><path d="M70 46q16 2 16 18t-14 14" fill="none" stroke="#8a3f22" stroke-width="6"/><path d="M46 30h24l3 8H49z" fill="#8a3f22"/></svg>`,
    clock: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><circle cx="60" cy="58" r="34" fill="#b1852f"/><circle cx="60" cy="58" r="27" fill="#f3ead9"/><path d="M60 58V38M60 58l16 6" stroke="#2a231c" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="58" r="3" fill="#2a231c"/><path d="M40 90l-6 14M80 90l6 14" stroke="#5a2e19" stroke-width="5" stroke-linecap="round"/></svg>`,
    watch: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><circle cx="60" cy="62" r="30" fill="#b1852f"/><circle cx="60" cy="62" r="23" fill="#f3ead9"/><path d="M60 62V46M60 62l12 6" stroke="#2a231c" stroke-width="2.5" stroke-linecap="round"/><rect x="54" y="20" width="12" height="12" rx="3" fill="#8a6320"/><circle cx="60" cy="16" r="4" fill="#b1852f"/></svg>`,
    typewriter: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><rect x="28" y="60" width="64" height="32" rx="6" fill="#2a231c"/><rect x="40" y="40" width="40" height="24" rx="4" fill="#5a5f43"/><rect x="46" y="46" width="28" height="10" rx="2" fill="#f3ead9"/><path d="M36 74h48M36 82h48" stroke="#b1852f" stroke-width="3"/><circle cx="40" cy="38" r="4" fill="#8a3f22"/><circle cx="80" cy="38" r="4" fill="#8a3f22"/></svg>`,
    mirror: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><ellipse cx="60" cy="58" rx="30" ry="40" fill="#b1852f"/><ellipse cx="60" cy="58" rx="23" ry="33" fill="#d7e0dd"/><path d="M48 40q8-6 20 0" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M52 98q8 6 16 0" fill="none" stroke="#8a6320" stroke-width="4"/></svg>`,
    decanter: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><path d="M54 22h12v8l14 26v22q0 14-20 14t-20-14V56l14-26z" fill="#5a5f43" opacity=".55"/><path d="M42 78q18 10 36 0v6q0 12-18 12t-18-12z" fill="#a8532e" opacity=".8"/><rect x="52" y="14" width="16" height="10" rx="3" fill="#b1852f"/></svg>`,
    rug: `<svg viewBox="0 0 120 120" role="img" aria-hidden="true"><rect x="24" y="34" width="72" height="52" rx="4" fill="#8a3f22"/><rect x="32" y="42" width="56" height="36" rx="2" fill="#a8532e"/><path d="M46 60h28M60 48v24" stroke="#e7cf9a" stroke-width="3"/><rect x="52" y="52" width="16" height="16" fill="#5a5f43"/><path d="M24 88h72M24 32h72" stroke="#e7cf9a" stroke-width="2" opacity=".5"/></svg>`,
  };

  const catalog = [
    { id: "danish-lounge", art: "chair", cat: "seating", name: "Danish Lounge Chair", maker: "Fritz H. workshop", era: "1958", price: "$1,480", cond: "Very good", desc: "Teak frame with the original wool webbing, gently sun-warmed on the left arm where a window once stood. It has been sat in for sixty years and intends to be sat in for sixty more.", material: "Oiled teak, wool", origin: "Denmark", dims: "72 × 78 × 84 cm" },
    { id: "roll-arm-sofa", art: "sofa", cat: "seating", name: "Roll-Arm Reading Sofa", maker: "Unknown atelier", era: "1935", price: "$2,150", cond: "Restored", desc: "A low three-seat sofa reupholstered in the last decade over its original horsehair. The walnut feet keep every scuff of their first parlour.", material: "Walnut, linen", origin: "France", dims: "196 × 84 × 78 cm" },
    { id: "brass-floor-lamp", art: "floorlamp", cat: "lighting", name: "Standing Brass Reader", maker: "Fielding & Sons", era: "1949", price: "$620", cond: "Good", desc: "An adjustable brass floor lamp with a hand-pierced shade. Rewired and safety-tested; the patina left entirely alone.", material: "Solid brass", origin: "England", dims: "148 cm tall" },
    { id: "mushroom-lamp", art: "tablelamp", cat: "lighting", name: "Mushroom Table Lamp", maker: "Verre Lumière", era: "1972", price: "$540", cond: "Very good", desc: "Amber glass dome over a matte base that throws a warm, low pool of light. One small kiln bubble near the rim — a maker's fingerprint, not a flaw.", material: "Blown glass", origin: "France", dims: "34 cm tall" },
    { id: "olive-vase", art: "vase", cat: "ceramics", name: "Tall Olive-Glaze Vase", maker: "Studio Hänsel", era: "1968", price: "$310", cond: "Excellent", desc: "A slender stoneware vase in a dry olive glaze that pools darker toward the foot. Signed and dated underneath in a confident thumbprint of slip.", material: "Stoneware", origin: "West Germany", dims: "42 cm tall" },
    { id: "cider-jug", art: "jug", cat: "ceramics", name: "Farmhouse Cider Jug", maker: "Country pottery", era: "1910", price: "$185", cond: "Honest wear", desc: "A salt-glazed jug that carried cider to the fields. Two fine crazing lines and a chip on the spout, both a century old and part of the story.", material: "Salt-glazed earthenware", origin: "England", dims: "31 cm tall" },
    { id: "station-clock", art: "clock", cat: "timepieces", name: "Enamel Station Clock", maker: "Ateliers Bréguet", era: "1924", price: "$1,090", cond: "Serviced", desc: "A double-sided enamel wall clock salvaged from a provincial railway hall. Movement cleaned and running true to within a minute a week.", material: "Enamel, brass", origin: "France", dims: "38 cm diameter" },
    { id: "pocket-watch", art: "watch", cat: "timepieces", name: "Half-Hunter Pocket Watch", maker: "J. W. Benson", era: "1901", price: "$760", cond: "Very good", desc: "A silver half-hunter with a legible enamel dial and a reassuring tick. Case initials worn soft by a waistcoat pocket — original owner unknown, well loved.", material: "Sterling silver", origin: "England", dims: "50 mm case" },
    { id: "portable-typewriter", art: "typewriter", cat: "objects", name: "Olive Portable Typewriter", maker: "Corona works", era: "1946", price: "$420", cond: "Working", desc: "A crackle-finish portable that still strikes crisply. New ribbon fitted; the carriage return has the satisfying weight only age gives.", material: "Enamelled steel", origin: "USA", dims: "30 × 30 × 15 cm" },
    { id: "gilt-mirror", art: "mirror", cat: "objects", name: "Oval Gilt Mirror", maker: "Gilder's shop", era: "1890", price: "$680", cond: "Age-appropriate", desc: "An oval mirror in a worn giltwood frame with the mercury glass beautifully foxed at the edges — a soft, silvered reflection you cannot fake.", material: "Giltwood, mercury glass", origin: "Italy", dims: "58 × 78 cm" },
    { id: "cut-decanter", art: "decanter", cat: "objects", name: "Cut-Glass Decanter", maker: "Val cristallerie", era: "1955", price: "$240", cond: "Excellent", desc: "A heavy lead-crystal decanter with a matching stopper that seats with a clean note. No chips, no cloudiness — only the weight of good glass.", material: "Lead crystal", origin: "Belgium", dims: "28 cm tall" },
    { id: "village-rug", art: "rug", cat: "objects", name: "Small Village Rug", maker: "Village loom", era: "1940", price: "$530", cond: "Honest wear", desc: "A hand-knotted wool rug with madder-red field and a single off-square medallion. Even low pile at the centre where a doorway once was.", material: "Hand-knotted wool", origin: "Anatolia", dims: "120 × 84 cm" },
  ];

  const catLabels = {
    seating: "Seating", lighting: "Lighting", ceramics: "Ceramics",
    timepieces: "Timepieces", objects: "Everyday thing",
  };

  const catalogEl = document.getElementById("catalog");
  const emptyEl = document.getElementById("empty");
  const countEl = document.getElementById("result-count");
  const chips = Array.from(document.querySelectorAll(".chip"));

  function render(filter) {
    const items = filter === "all" ? catalog : catalog.filter((i) => i.cat === filter);
    catalogEl.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card";
      btn.dataset.id = item.id;
      btn.setAttribute("aria-haspopup", "dialog");
      btn.innerHTML = `
        <span class="card-art"><span class="card-tag">${catLabels[item.cat]}</span>${art[item.art]}</span>
        <span class="card-body">
          <span class="card-era">${item.era} · ${item.origin}</span>
          <span class="card-name">${item.name}</span>
          <span class="card-maker">${item.maker}</span>
          <span class="card-foot">
            <span class="card-price">${item.price}</span>
            <span class="card-cond">${item.cond}</span>
          </span>
        </span>`;
      btn.addEventListener("click", () => openDetail(item, btn));
      li.appendChild(btn);
      catalogEl.appendChild(li);
    });
    emptyEl.hidden = items.length !== 0;
    countEl.textContent = `${items.length} object${items.length === 1 ? "" : "s"}${filter === "all" ? "" : " · " + catLabels[filter]}`;
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      render(chip.dataset.filter);
    });
  });

  // --- Detail dialog ---
  const backdrop = document.getElementById("detail");
  const dlgClose = document.getElementById("detail-close");
  const dEra = document.getElementById("detail-era");
  const dTitle = document.getElementById("detail-title");
  const dPrice = document.getElementById("detail-price");
  const dDesc = document.getElementById("detail-desc");
  const dArt = document.getElementById("detail-art");
  const dMeta = document.getElementById("detail-meta");
  let lastFocus = null;

  function openDetail(item, trigger) {
    lastFocus = trigger || null;
    dEra.textContent = `${item.era} · ${item.origin} · ${catLabels[item.cat]}`;
    dTitle.textContent = item.name;
    dPrice.textContent = item.price;
    dDesc.textContent = item.desc;
    dArt.innerHTML = art[item.art];
    dMeta.innerHTML = `
      <div><dt>Maker</dt><dd>${item.maker}</dd></div>
      <div><dt>Material</dt><dd>${item.material}</dd></div>
      <div><dt>Dimensions</dt><dd>${item.dims}</dd></div>
      <div><dt>Condition</dt><dd>${item.cond}</dd></div>`;
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    dlgClose.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeDetail() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.stopPropagation(); closeDetail(); return; }
    if (e.key === "Tab") {
      const focusables = backdrop.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  dlgClose.addEventListener("click", closeDetail);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeDetail(); });

  render("all");
})();
