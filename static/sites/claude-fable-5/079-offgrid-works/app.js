(() => {
  "use strict";

  const form = document.querySelector(".config-form");
  if (!form) return;

  const outRange = document.getElementById("out-range");
  const outWeight = document.getElementById("out-weight");
  const outSleeps = document.getElementById("out-sleeps");
  const outPrice = document.getElementById("out-price");
  const outSummary = document.getElementById("out-summary");
  const reserveBtn = document.getElementById("reserve-btn");
  const reserveConfirm = document.getElementById("reserve-confirm");

  const packNames = { scout: "Scout", range: "Range", basecamp: "Basecamp" };
  const moduleNames = {
    galley: "galley",
    bunk: "bunk",
    desk: "desk",
    locker: "gear locker",
    bath: "wet bath",
    power: "power wall",
  };

  const update = () => {
    const pack = form.querySelector('input[name="pack"]:checked');
    const modules = [...form.querySelectorAll('input[name="module"]:checked')];

    const baseRange = Number(pack.dataset.range);
    let price = Number(pack.dataset.price);
    let weight = 0;
    for (const m of modules) {
      weight += Number(m.dataset.weight);
      price += Number(m.dataset.price);
    }

    // Roughly 1 mile of range per 12 kg of module load.
    const range = Math.round(baseRange - weight / 12);

    outRange.textContent = String(range);
    outWeight.textContent = String(weight);
    outSleeps.textContent = modules.length >= 4 ? "2–4" : "2";
    outPrice.textContent = price.toLocaleString("en-US");

    const extras = modules
      .filter((m) => !m.disabled)
      .map((m) => moduleNames[m.value]);
    const extrasText = extras.length
      ? `, plus ${extras.join(extras.length > 2 ? ", " : " and ").replace(/, ([^,]*)$/, ", and $1")}`
      : "";
    outSummary.textContent = `${packNames[pack.value]} pack with galley and bunk${extrasText}. Ready for the long way home.`;

    if (!reserveConfirm.hidden) {
      reserveConfirm.hidden = true;
      reserveBtn.textContent = "Reserve this build";
    }
  };

  form.addEventListener("change", update);
  form.addEventListener("submit", (event) => event.preventDefault());

  reserveBtn.addEventListener("click", () => {
    reserveConfirm.hidden = false;
    reserveBtn.textContent = "Build reserved";
  });

  update();
})();
