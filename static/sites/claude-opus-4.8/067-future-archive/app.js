(() => {
  "use strict";

  var slider = document.getElementById("horizon");
  if (!slider) return;

  var yearOut = document.getElementById("yearOut");
  var horizonOut = document.getElementById("horizonOut");
  var mediumName = document.getElementById("mediumName");
  var mediumDesc = document.getElementById("mediumDesc");
  var integrityFill = document.getElementById("integrityFill");
  var integrityPct = document.getElementById("integrityPct");

  var BASE_YEAR = 2125;

  var TIERS = [
    {
      years: 10,
      label: "10-year horizon",
      medium: "Hot mirrored disk arrays",
      desc: "Kept online across three data halls with continuous fixity checks and yearly format review.",
      redundancy: 62,
    },
    {
      years: 50,
      label: "50-year horizon",
      medium: "Managed tape + cloud replica",
      desc: "Written to enterprise tape and a cold cloud mirror, refreshed onto new media every few years.",
      redundancy: 74,
    },
    {
      years: 100,
      label: "100-year horizon",
      medium: "Silica glass + cold cloud mirror",
      desc: "Etched into fused quartz and mirrored across seven vaults, with format checks every decade.",
      redundancy: 86,
    },
    {
      years: 500,
      label: "500-year horizon",
      medium: "Fused-quartz vault array",
      desc: "Distributed over independent geological sites with open readers and scheduled migration audits.",
      redundancy: 94,
    },
    {
      years: 1000,
      label: "Millennial horizon",
      medium: "Deep-vault quartz + nickel plates",
      desc: "Human-readable nickel microplates paired with quartz masters, sealed against grid and climate failure.",
      redundancy: 99,
    },
  ];

  function render(index) {
    var tier = TIERS[index];
    var targetYear = BASE_YEAR + tier.years;

    yearOut.textContent = String(targetYear);
    horizonOut.textContent = tier.label;
    mediumName.textContent = tier.medium;
    mediumDesc.textContent = tier.desc;
    integrityFill.style.width = tier.redundancy + "%";
    integrityPct.textContent = tier.redundancy + "%";
    slider.setAttribute("aria-valuetext", tier.label);
  }

  slider.addEventListener("input", function () {
    render(parseInt(slider.value, 10) || 0);
  });

  render(parseInt(slider.value, 10) || 0);
})();
