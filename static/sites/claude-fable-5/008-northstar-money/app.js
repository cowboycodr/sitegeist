(() => {
  "use strict";

  const monthlyInput = document.getElementById("monthly");
  const yearsInput = document.getElementById("years");
  const rateInput = document.getElementById("rate");
  if (!monthlyInput || !yearsInput || !rateInput) return;

  const monthlyOut = document.getElementById("monthly-value");
  const yearsOut = document.getElementById("years-value");
  const rateOut = document.getElementById("rate-value");

  const projectedOut = document.getElementById("projected-total");
  const contributedOut = document.getElementById("contributed-total");
  const growthOut = document.getElementById("growth-total");

  const chartGrid = document.getElementById("chart-grid");
  const areaContrib = document.getElementById("area-contrib");
  const areaGrowth = document.getElementById("area-growth");
  const lineTotal = document.getElementById("line-total");
  const xLabels = document.getElementById("chart-x-labels");
  const yLabels = document.getElementById("chart-y-labels");

  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 560;
  const H = 300;
  const PAD = { top: 18, right: 16, bottom: 30, left: 58 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const compact = (value) => {
    if (value >= 1e6) {
      const millions = value / 1e6;
      return "$" + (millions >= 10 ? Math.round(millions) : millions.toFixed(1)) + "M";
    }
    if (value >= 1e3) return "$" + Math.round(value / 1e3) + "K";
    return "$" + Math.round(value);
  };

  // Yearly series of { contributed, total } with monthly compounding.
  const buildSeries = (monthly, years, annualRate) => {
    const r = annualRate / 100 / 12;
    const series = [{ contributed: 0, total: 0 }];
    let total = 0;
    let contributed = 0;
    for (let year = 1; year <= years; year += 1) {
      for (let month = 0; month < 12; month += 1) {
        total = total * (1 + r) + monthly;
        contributed += monthly;
      }
      series.push({ contributed, total });
    }
    return series;
  };

  const niceCeil = (value) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const scaled = value / magnitude;
    const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
    return nice * magnitude;
  };

  const clearChildren = (node) => {
    while (node.firstChild) node.removeChild(node.firstChild);
  };

  const makeText = (x, y, content, anchor) => {
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", anchor);
    text.textContent = content;
    return text;
  };

  const render = () => {
    const monthly = Number(monthlyInput.value);
    const years = Number(yearsInput.value);
    const rate = Number(rateInput.value);

    monthlyOut.textContent = currency.format(monthly);
    yearsOut.textContent = years + (years === 1 ? " year" : " years");
    rateOut.textContent = rate.toFixed(1) + "%";

    const series = buildSeries(monthly, years, rate);
    const final = series[series.length - 1];

    projectedOut.textContent = currency.format(final.total);
    contributedOut.textContent = currency.format(final.contributed);
    growthOut.textContent = currency.format(final.total - final.contributed);

    const yMax = niceCeil(final.total * 1.05);
    const xAt = (year) => PAD.left + (year / years) * plotW;
    const yAt = (value) => PAD.top + plotH - (value / yMax) * plotH;

    let totalPath = "";
    let contribPath = "";
    series.forEach((pt, year) => {
      const x = xAt(year).toFixed(1);
      const cmd = year === 0 ? "M" : "L";
      totalPath += `${cmd}${x} ${yAt(pt.total).toFixed(1)} `;
      contribPath += `${cmd}${x} ${yAt(pt.contributed).toFixed(1)} `;
    });

    const baseline = (PAD.top + plotH).toFixed(1);
    const left = PAD.left.toFixed(1);
    const right = (PAD.left + plotW).toFixed(1);

    lineTotal.setAttribute("d", totalPath.trim());
    areaContrib.setAttribute("d", `${contribPath}L${right} ${baseline} L${left} ${baseline} Z`);

    // Growth band: area between the total line and the contribution line.
    let reverseContrib = "";
    for (let year = years; year >= 0; year -= 1) {
      reverseContrib += `L${xAt(year).toFixed(1)} ${yAt(series[year].contributed).toFixed(1)} `;
    }
    areaGrowth.setAttribute("d", `${totalPath}${reverseContrib}Z`);

    clearChildren(chartGrid);
    clearChildren(yLabels);
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i += 1) {
      const value = (yMax / gridLines) * i;
      const y = yAt(value);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", left);
      line.setAttribute("x2", right);
      line.setAttribute("y1", y.toFixed(1));
      line.setAttribute("y2", y.toFixed(1));
      chartGrid.appendChild(line);
      yLabels.appendChild(makeText(PAD.left - 8, (y + 4).toFixed(1), compact(value), "end"));
    }

    clearChildren(xLabels);
    const tickCount = Math.min(years, 5);
    for (let i = 0; i <= tickCount; i += 1) {
      const year = Math.round((years / tickCount) * i);
      xLabels.appendChild(
        makeText(xAt(year).toFixed(1), (H - 10).toFixed(1), year === 0 ? "Now" : year + "y", "middle"),
      );
    }
  };

  [monthlyInput, yearsInput, rateInput].forEach((input) => {
    input.addEventListener("input", render);
  });

  render();
})();
