(() => {
  "use strict";

  const preview = document.getElementById("lab-preview");
  const textInput = document.getElementById("lab-text");
  const weight = document.getElementById("lab-weight");
  const width = document.getElementById("lab-width");
  const slant = document.getElementById("lab-slant");
  const tracking = document.getElementById("lab-tracking");
  const randomButton = document.getElementById("lab-random");
  const form = document.querySelector(".lab-controls");
  if (!preview || !textInput || !weight || !width || !slant || !tracking || !form) return;

  const readouts = {
    weight: document.getElementById("lab-weight-value"),
    width: document.getElementById("lab-width-value"),
    slant: document.getElementById("lab-slant-value"),
    tracking: document.getElementById("lab-tracking-value"),
  };

  const apply = () => {
    const text = textInput.value.trim();
    preview.textContent = text === "" ? "Kinetic" : text;
    preview.style.fontWeight = weight.value;
    preview.style.letterSpacing = `${tracking.value / 100}em`;
    preview.style.transform = `scaleX(${width.value / 100}) skewX(${-slant.value}deg)`;
    readouts.weight.textContent = weight.value;
    readouts.width.textContent = `${width.value}%`;
    readouts.slant.textContent = `${slant.value}°`;
    readouts.tracking.textContent = tracking.value;
  };

  const randomBetween = (input) => {
    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step) || 1;
    const steps = Math.floor((max - min) / step);
    return String(min + step * Math.floor(Math.random() * (steps + 1)));
  };

  form.addEventListener("input", apply);
  form.addEventListener("reset", () => {
    requestAnimationFrame(apply);
  });
  if (randomButton) {
    randomButton.addEventListener("click", () => {
      weight.value = randomBetween(weight);
      width.value = randomBetween(width);
      slant.value = randomBetween(slant);
      tracking.value = randomBetween(tracking);
      apply();
    });
  }
  form.addEventListener("submit", (event) => event.preventDefault());

  apply();
})();
