(() => {
  "use strict";

  const BOX_LIMIT = 6;
  const counts = { croissant: 0, kouign: 0, canele: 0, polenta: 0 };

  const meter = document.getElementById("box-meter");
  const confirmLine = document.getElementById("box-confirm");
  const reserveButton = document.getElementById("reserve");
  const steppers = Array.from(document.querySelectorAll(".step"));
  const outputs = new Map(
    Array.from(document.querySelectorAll("[data-count]")).map((el) => [el.dataset.count, el]),
  );

  const total = () => Object.values(counts).reduce((sum, n) => sum + n, 0);

  const render = () => {
    const filled = total();
    for (const [item, el] of outputs) el.textContent = String(counts[item]);
    meter.textContent = `Box: ${filled} of ${BOX_LIMIT} filled`;
    for (const button of steppers) {
      const delta = Number(button.dataset.delta);
      button.disabled =
        (delta < 0 && counts[button.dataset.item] === 0) ||
        (delta > 0 && filled >= BOX_LIMIT);
    }
  };

  for (const button of steppers) {
    button.addEventListener("click", () => {
      const item = button.dataset.item;
      const delta = Number(button.dataset.delta);
      const next = counts[item] + delta;
      if (next < 0 || (delta > 0 && total() >= BOX_LIMIT)) return;
      counts[item] = next;
      confirmLine.textContent = "";
      render();
    });
  }

  reserveButton.addEventListener("click", () => {
    const filled = total();
    if (filled === 0) {
      confirmLine.textContent = "Your box is empty — add a pastry or two first.";
      return;
    }
    const word = filled === 1 ? "pastry" : "pastries";
    confirmLine.textContent = `Reserved: a box of ${filled} ${word}, ready at the counter from 7 am. (Demonstration only.)`;
  });

  render();
})();
