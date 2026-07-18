(() => {
  "use strict";

  // Mobile navigation toggle
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Stay sketcher
  const build = document.getElementById("plan-build");
  const output = document.getElementById("plan-output");
  if (build && output) {
    const rates = { "Fernbrook": 210, "Hemlock Hall": 285, "Lantern Low": 195, "any": 195 };
    const seasonNotes = {
      summer: "the creek will be at its quietest and the swifts at their loudest",
      autumn: "pack boots — it will be mushroom weather on the loop",
      winter: "expect snow-quiet and the hottest tubs of the year",
      spring: "you may catch the trillium fortnight if the forest agrees",
    };
    build.addEventListener("click", () => {
      const cabin = document.getElementById("plan-cabin").value;
      const season = document.getElementById("plan-season").value;
      const nights = Math.min(14, Math.max(1, Number(document.getElementById("plan-nights").value) || 1));
      const guests = Math.min(4, Math.max(1, Number(document.getElementById("plan-guests").value) || 1));
      const cabinName = cabin === "any" ? "whichever cabin is quietest" : cabin;
      const rough = rates[cabin] * nights;
      output.textContent =
        `${nights} night${nights === 1 ? "" : "s"} for ${guests} guest${guests === 1 ? "" : "s"} in ${cabinName}, ` +
        `roughly $${rough.toLocaleString("en-US")} before tea and firewood — and ${seasonNotes[season]}. ` +
        "Write it on paper before you lose signal at the gate.";
    });
  }
})();
