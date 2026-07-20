(() => {
  "use strict";

  const scents = {
    fumee: {
      name: "Fumée",
      hour: "21:00 — dusk",
      cardId: "scent-fumee",
      line: "You linger where warmth is. Fumée keeps the fire going: cade and black tea over birch tar and cold incense.",
    },
    lithique: {
      name: "Lithique",
      hour: "23:00 — sea wall",
      cardId: "scent-lithique",
      line: "You think best in salt air. Lithique is rain on granite: flint and sea salt over wet stone and ambergris.",
    },
    selene: {
      name: "Séléné",
      hour: "01:00 — walled garden",
      cardId: "scent-selene",
      line: "You keep the garden's secret. Séléné opens only in darkness: moonflower and night jasmine over white musk.",
    },
    orage: {
      name: "Orage Lointain",
      hour: "04:00 — open plain",
      cardId: "scent-orage",
      line: "You watch the horizon. Orage Lointain smells of weather on its way: ozone and petrichor over vetiver.",
    },
  };

  const result = document.getElementById("finder-result");
  const choices = Array.from(document.querySelectorAll(".choice"));

  const renderResult = (scent) => {
    result.textContent = "";

    const card = document.createElement("div");
    card.className = "result-card";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Your match · " + scent.hour;

    const heading = document.createElement("h3");
    heading.textContent = scent.name;

    const line = document.createElement("p");
    line.textContent = scent.line;

    const link = document.createElement("p");
    const anchor = document.createElement("a");
    anchor.href = "#" + scent.cardId;
    anchor.textContent = "See " + scent.name + " in the collection";
    link.appendChild(anchor);

    card.append(eyebrow, heading, line, link);
    result.appendChild(card);
  };

  choices.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const scent = scents[button.dataset.scent];
      if (!scent) return;

      choices.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));

      document.querySelectorAll(".card.is-matched").forEach((card) => {
        card.classList.remove("is-matched");
      });
      const matched = document.getElementById(scent.cardId);
      if (matched) matched.classList.add("is-matched");

      renderResult(scent);
    });
  });
})();
