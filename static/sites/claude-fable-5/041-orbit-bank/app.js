(() => {
  "use strict";

  // Illustrative sample rates relative to USD; no live data is fetched.
  const RATES = { USD: 1, EUR: 0.9124, GBP: 0.7812, JPY: 155.42, BRL: 5.43, AUD: 1.51 };
  const SYMBOLS = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", BRL: "R$", AUD: "A$" };

  const amount = document.getElementById("fx-amount");
  const from = document.getElementById("fx-from");
  const to = document.getElementById("fx-to");
  const output = document.getElementById("fx-output");
  const rateLine = document.getElementById("fx-rate");
  const swap = document.getElementById("fx-swap");
  const form = amount.closest("form");

  const format = (code, value) => {
    const digits = code === "JPY" ? 0 : 2;
    return SYMBOLS[code] + value.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const update = () => {
    const value = Math.max(0, parseFloat(amount.value) || 0);
    const rate = RATES[to.value] / RATES[from.value];
    output.textContent = format(to.value, value * rate);
    rateLine.textContent = `1 ${from.value} = ${rate.toLocaleString("en-US", {
      maximumSignificantDigits: 5,
    })} ${to.value}`;
  };

  amount.addEventListener("input", update);
  from.addEventListener("change", update);
  to.addEventListener("change", update);
  form.addEventListener("submit", (event) => event.preventDefault());

  swap.addEventListener("click", () => {
    const held = from.value;
    from.value = to.value;
    to.value = held;
    update();
  });

  update();
})();
