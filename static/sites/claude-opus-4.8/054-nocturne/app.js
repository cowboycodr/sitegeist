"use strict";
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Starfield ---------- */
  const starField = document.getElementById("stars");
  if (starField) {
    const count = reduceMotion ? 40 : 80;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (Math.random() * 100).toFixed(2) + "%";
      const scale = 0.6 + Math.random() * 1.6;
      s.style.transform = "scale(" + scale.toFixed(2) + ")";
      s.style.setProperty("--dur", (3 + Math.random() * 5).toFixed(1) + "s");
      s.style.animationDelay = (-Math.random() * 6).toFixed(1) + "s";
      frag.appendChild(s);
    }
    starField.appendChild(frag);
  }

  /* ---------- Data ---------- */
  const bottle = (accent) =>
    '<svg class="flacon__bottle" viewBox="0 0 90 130" role="img" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="g' + accent.slice(1) + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + accent + '" stop-opacity="0.55"/>' +
    '<stop offset="1" stop-color="' + accent + '" stop-opacity="0.05"/></linearGradient></defs>' +
    '<rect x="37" y="6" width="16" height="12" rx="2" fill="' + accent + '" opacity="0.7"/>' +
    '<rect x="34" y="17" width="22" height="8" rx="2" fill="' + accent + '" opacity="0.4"/>' +
    '<path d="M28 30 h34 a8 8 0 0 1 8 8 v74 a10 10 0 0 1 -10 10 h-38 a10 10 0 0 1 -10 -10 v-74 a8 8 0 0 1 8 -8 z" ' +
    'fill="url(#g' + accent.slice(1) + ')" stroke="' + accent + '" stroke-opacity="0.6" stroke-width="1.2"/>' +
    '<ellipse cx="45" cy="70" rx="15" ry="20" fill="' + accent + '" opacity="0.28"/>' +
    '<line x1="26" y1="46" x2="64" y2="46" stroke="' + accent + '" stroke-opacity="0.35" stroke-width="0.8"/>' +
    "</svg>";

  const scents = [
    {
      name: "Cendre",
      accord: "Smoke",
      accent: "#d38a5c",
      desc: "Cold woodsmoke drifting over a room where a candle just went out.",
      notes: ["Birch tar", "Incense", "Vetiver", "Ash"],
      moods: ["Restless", "Solitary"],
    },
    {
      name: "Basalt",
      accord: "Mineral",
      accent: "#8fb0c9",
      desc: "Wet stone and cool metal — the clean severity of a cliff after rain.",
      notes: ["Flint", "Slate", "Ambrette", "Sea salt"],
      moods: ["Clear", "Solitary"],
    },
    {
      name: "Belladone",
      accord: "Night bloom",
      accent: "#b78bd0",
      desc: "Tuberose and jasmine that open only after dark, heavy and narcotic.",
      notes: ["Tuberose", "Jasmine sambac", "Datura", "Honey"],
      moods: ["Romantic", "Restless"],
    },
    {
      name: "Loin",
      accord: "Distant weather",
      accent: "#a3aefc",
      desc: "Ozone and petrichor from a storm that is still an hour from arriving.",
      notes: ["Ozone", "Petrichor", "Iris", "Grey musk"],
      moods: ["Clear", "Romantic"],
    },
  ];

  const flaconList = document.getElementById("flacons");
  if (flaconList) {
    scents.forEach((s) => {
      const li = document.createElement("li");
      li.className = "flacon";
      li.style.setProperty("--accent", s.accent);
      li.innerHTML =
        bottle(s.accent) +
        '<p class="flacon__accord">' + s.accord + "</p>" +
        '<h3 class="flacon__name">' + s.name + "</h3>" +
        '<p class="flacon__desc">' + s.desc + "</p>" +
        '<ul class="flacon__notes">' +
        s.notes.map((n) => "<li>" + n + "</li>").join("") +
        "</ul>";
      flaconList.appendChild(li);
    });
  }

  /* ---------- Finder ---------- */
  const moodDefs = [
    { key: "Restless", label: "Restless & awake" },
    { key: "Solitary", label: "Alone, at peace" },
    { key: "Romantic", label: "Romantic" },
    { key: "Clear", label: "Cold & clear" },
  ];
  const moodBox = document.getElementById("moods");
  const result = document.getElementById("result");

  const render = (mood) => {
    const match = scents.find((s) => s.moods.includes(mood)) || scents[0];
    result.innerHTML =
      '<article class="result-card">' +
      '<p class="result-card__accord">' + match.accord + " — your match</p>" +
      '<h3 class="result-card__name">' + match.name + "</h3>" +
      '<p class="result-card__desc">' + match.desc + "</p>" +
      '<p class="result-card__notes">Key notes: ' + match.notes.join(" · ") + "</p>" +
      "</article>";
  };

  if (moodBox && result) {
    moodDefs.forEach((m, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = m.label;
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.dataset.mood = m.key;
      b.tabIndex = i === 0 ? 0 : -1;
      moodBox.appendChild(b);
    });

    const chips = Array.from(moodBox.querySelectorAll(".chip"));
    const select = (chip) => {
      chips.forEach((c) => {
        c.setAttribute("aria-checked", "false");
        c.tabIndex = -1;
      });
      chip.setAttribute("aria-checked", "true");
      chip.tabIndex = 0;
      render(chip.dataset.mood);
    };

    moodBox.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (chip) select(chip);
    });

    moodBox.addEventListener("keydown", (e) => {
      const idx = chips.indexOf(document.activeElement);
      if (idx === -1) return;
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % chips.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + chips.length) % chips.length;
      if (next !== -1) {
        e.preventDefault();
        chips[next].focus();
        select(chips[next]);
      }
    });
  }
})();
