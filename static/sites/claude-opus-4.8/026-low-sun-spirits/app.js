(() => {
  "use strict";

  const bottles = [
    {
      hour: "Golden hour",
      name: "Longshadow",
      kind: "Botanical gin",
      notes: "Juniper softened with desert sage, pink peppercorn, and a squeeze of sun-warmed citrus.",
      proof: "44% ABV · Rested 3 weeks",
      fill: "#e9b45a",
    },
    {
      hour: "Dusk",
      name: "Ember Wash",
      kind: "Agave spirit",
      notes: "Roasted heart of agave with mesquite smoke, dried fig, and a long, dry finish.",
      proof: "46% ABV · Rested 8 weeks",
      fill: "#d9603a",
    },
    {
      hour: "First dark",
      name: "Navy Hour",
      kind: "Amaro liqueur",
      notes: "Bitter root and dark cherry drawn out slow, with juniper resin and cold night air.",
      proof: "30% ABV · Rested 16 weeks",
      fill: "#8a3f66",
    },
  ];

  const botanicals = [
    { name: "Desert sage", note: "Cut at dusk, when the resin is heaviest." },
    { name: "Mesquite", note: "Roasted pods for smoke and sweetness." },
    { name: "Pink peppercorn", note: "Bright heat that lifts the nose." },
    { name: "Prickly pear", note: "Fruit pressed for color and body." },
    { name: "Creosote", note: "The smell of rain on hot rock." },
    { name: "Sun-dried citrus", note: "Peel candied by the afternoon heat." },
  ];

  const bottleSVG = (fill) =>
    '<svg class="bottle-art" viewBox="0 0 96 168" role="img" aria-hidden="true">' +
    '<defs><linearGradient id="g' + fill.slice(1) + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + fill + '"/><stop offset="1" stop-color="#2a1206"/>' +
    "</linearGradient></defs>" +
    '<rect x="40" y="4" width="16" height="22" rx="3" fill="#1d1329"/>' +
    '<path d="M40 26 h16 v14 q18 10 18 34 v70 q0 12 -12 12 h-28 q-12 0 -12 -12 v-70 q0 -24 18 -34 z" fill="url(#g' + fill.slice(1) + ')" stroke="#f6e4c8" stroke-opacity="0.25"/>' +
    '<rect x="26" y="96" width="44" height="40" rx="4" fill="#fbf3e6" fill-opacity="0.92"/>' +
    '<line x1="34" y1="108" x2="62" y2="108" stroke="#43265a" stroke-width="2"/>' +
    '<line x1="34" y1="118" x2="62" y2="118" stroke="#43265a" stroke-width="1.5" stroke-opacity="0.6"/>' +
    '<circle cx="48" cy="128" r="3" fill="#e5642f"/>' +
    "</svg>";

  const bottleGrid = document.querySelector(".bottle-grid");
  if (bottleGrid) {
    bottleGrid.innerHTML = bottles
      .map(
        (b) =>
          '<li class="bottle-card">' +
          bottleSVG(b.fill) +
          '<p class="bottle-hour">' + b.hour + "</p>" +
          '<h3 class="bottle-name">' + b.name + "</h3>" +
          '<p class="bottle-kind">' + b.kind + "</p>" +
          '<p class="bottle-notes">' + b.notes + "</p>" +
          '<p class="bottle-proof">' + b.proof + "</p>" +
          "</li>",
      )
      .join("");
  }

  const botList = document.querySelector(".botanical-list");
  if (botList) {
    botList.innerHTML = botanicals
      .map((b) => "<li><strong>" + b.name + "</strong><span>" + b.note + "</span></li>")
      .join("");
  }

  // Bridge integration: reflect pull-to-dismiss state with a small hint.
  const hint = document.querySelector("[data-pull-hint]");
  if (hint) {
    document.addEventListener("sitegeist:pull-state", (event) => {
      const active = !!(event.detail && event.detail.active);
      hint.hidden = !active;
    });
  }
})();
