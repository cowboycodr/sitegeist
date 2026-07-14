(() => {
  "use strict";

  // Emission factors (illustrative, tCO2e per unit of activity).
  const FACTORS = {
    energyPerMWh: 0.35,   // grid intensity before renewable adjustment
    fleetPerKkm: 0.62,    // per thousand km
    supplyPerMspend: 78,  // per $1M of purchased goods spend (input is $k spend/100 -> handled below)
  };

  const TARGET_YEAR = 2030;
  const nf = new Intl.NumberFormat("en-US");

  const el = (id) => document.getElementById(id);
  const inputs = {
    energy: el("energy"),
    fleet: el("fleet"),
    supply: el("supply"),
    renewable: el("renewable"),
  };
  const outs = {
    energy: el("energy-out"),
    fleet: el("fleet-out"),
    supply: el("supply-out"),
    renewable: el("renewable-out"),
  };

  const totalNum = el("total-num");
  const totalSub = el("total-sub");
  const bars = {
    s1: { bar: el("s1-bar"), val: el("s1-val") },
    s2: { bar: el("s2-bar"), val: el("s2-val") },
    s3: { bar: el("s3-bar"), val: el("s3-val") },
  };
  const glideLine = el("glide-line");
  const glideStart = el("glide-start");
  const glideEnd = el("glide-end");
  const glideYear = el("glide-year");
  const glideNote = el("glide-note");

  const round = (n) => Math.round(n);

  function labelFor(key, v) {
    switch (key) {
      case "energy": return nf.format(v) + " MWh";
      case "fleet": return nf.format(v) + " k·km";
      case "supply": return "$" + (v / 1000).toFixed(1) + "M spend";
      case "renewable": return v + "%";
      default: return String(v);
    }
  }

  function compute() {
    const energy = Number(inputs.energy.value);
    const fleet = Number(inputs.fleet.value);
    const supply = Number(inputs.supply.value);
    const renewable = Number(inputs.renewable.value) / 100;

    // Scope 1: direct combustion from fleet & logistics.
    const s1 = fleet * FACTORS.fleetPerKkm;
    // Scope 2: purchased energy, reduced by renewable share.
    const s2 = energy * FACTORS.energyPerMWh * (1 - renewable);
    // Scope 3: value chain from purchased goods spend ($k input -> $M).
    const s3 = (supply / 1000) * FACTORS.supplyPerMspend;

    return { s1, s2, s3, total: s1 + s2 + s3 };
  }

  function updateGlide(total) {
    const start = { x: 4, y0: 8 };
    const endX = 316;
    const baseY = 112;
    const topY = 8;
    // Map total onto a start height; higher total = higher start line.
    const maxTotal = 7000;
    const frac = Math.min(1, total / maxTotal);
    const startY = baseY - frac * (baseY - topY);

    // Build an eased decline curve from start to zero at target.
    const pts = [];
    const steps = 8;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = start.x + t * (endX - start.x);
      const eased = Math.pow(1 - t, 1.7); // convex decline toward zero
      const y = baseY - eased * (baseY - startY);
      pts.push(x.toFixed(1) + "," + y.toFixed(1));
    }
    glideLine.setAttribute("points", pts.join(" "));
    glideStart.setAttribute("cx", start.x);
    glideStart.setAttribute("cy", startY.toFixed(1));
    glideEnd.setAttribute("cx", endX);
    glideEnd.setAttribute("cy", baseY);
    glideYear.textContent = TARGET_YEAR + " target";

    const years = TARGET_YEAR - 2026;
    const pct = Math.min(99, Math.max(0, round((1 - Math.pow(0.02, 1 / years)) * 100)));
    if (total <= 0) {
      glideNote.textContent = "Already at net zero — hold the line and verify removals.";
    } else {
      glideNote.textContent =
        "About a " + pct + "% annual cut reaches net zero by " + TARGET_YEAR + ".";
    }
  }

  function render() {
    for (const key of Object.keys(inputs)) {
      outs[key].textContent = labelFor(key, Number(inputs[key].value));
    }

    const { s1, s2, s3, total } = compute();
    totalNum.textContent = nf.format(round(total));

    const peak = Math.max(s1, s2, s3, 1);
    const set = (k, v) => {
      bars[k].val.textContent = nf.format(round(v)) + " t";
      bars[k].bar.style.width = (v / peak) * 100 + "%";
    };
    set("s1", s1);
    set("s2", s2);
    set("s3", s3);

    if (total <= 0) {
      totalSub.textContent = "No modelled emissions — a fully decarbonised profile.";
    } else {
      const largest = s3 >= s1 && s3 >= s2 ? "Scope 3 value chain"
        : s2 >= s1 ? "Scope 2 energy" : "Scope 1 direct";
      totalSub.textContent = largest + " dominates this footprint.";
    }

    updateGlide(total);
  }

  for (const input of Object.values(inputs)) {
    input.addEventListener("input", render);
  }

  render();
})();
