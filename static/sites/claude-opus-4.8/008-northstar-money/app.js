(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const monthly = $("monthly");
  const years = $("years");
  const start = $("start");
  const riskInputs = Array.from(document.querySelectorAll('input[name="risk"]'));

  const monthlyOut = $("monthly-out");
  const yearsOut = $("years-out");
  const startOut = $("start-out");

  const totalEl = $("total");
  const contributedEl = $("contributed");
  const growthEl = $("growthamt");

  const baseLine = $("base-line");
  const areaLine = $("area-line");
  const totalLine = $("total-line");

  const W = 480;
  const H = 220;
  const PAD = 6;

  const usd0 = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const risk = () => {
    const picked = riskInputs.find((r) => r.checked) || riskInputs[0];
    return Number(picked.value);
  };

  // Build the yearly series for total balance and contributions-only.
  function series() {
    const m = Number(monthly.value);
    const yrs = Number(years.value);
    const s = Number(start.value);
    const annual = risk() / 100;
    const rate = annual / 12;

    const totals = [];
    const bases = [];
    let balance = s;
    let contributed = s;

    totals.push(balance);
    bases.push(contributed);

    for (let y = 1; y <= yrs; y += 1) {
      for (let month = 0; month < 12; month += 1) {
        balance = balance * (1 + rate) + m;
        contributed += m;
      }
      totals.push(balance);
      bases.push(contributed);
    }
    return { totals, bases, contributed, yrs };
  }

  function toPath(values, max) {
    const n = values.length - 1;
    let d = "";
    for (let i = 0; i < values.length; i += 1) {
      const x = PAD + (i / n) * (W - PAD * 2);
      const y = H - PAD - (values[i] / max) * (H - PAD * 2);
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    return d.trim();
  }

  function areaPath(values, max) {
    const n = values.length - 1;
    let d = "M" + PAD + " " + (H - PAD) + " ";
    for (let i = 0; i < values.length; i += 1) {
      const x = PAD + (i / n) * (W - PAD * 2);
      const y = H - PAD - (values[i] / max) * (H - PAD * 2);
      d += "L" + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    d += "L" + (W - PAD) + " " + (H - PAD) + " Z";
    return d;
  }

  function render() {
    monthlyOut.textContent = usd0.format(Number(monthly.value));
    const yrs = Number(years.value);
    yearsOut.textContent = yrs + (yrs === 1 ? " year" : " years");
    startOut.textContent = usd0.format(Number(start.value));

    const { totals, bases, contributed } = series();
    const finalTotal = totals[totals.length - 1];
    const max = Math.max(finalTotal, 1);

    totalEl.textContent = usd0.format(finalTotal);
    contributedEl.textContent = usd0.format(contributed);
    growthEl.textContent = usd0.format(Math.max(0, finalTotal - contributed));

    totalLine.setAttribute("d", toPath(totals, max));
    areaLine.setAttribute("d", areaPath(totals, max));
    baseLine.setAttribute("d", toPath(bases, max));
  }

  [monthly, years, start].forEach((el) => el.addEventListener("input", render));
  riskInputs.forEach((el) => el.addEventListener("change", render));

  render();
})();
