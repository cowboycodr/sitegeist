(() => {
  "use strict";

  const roasts = [
    {
      name: "Ridge Ember",
      origin: "Nariño, Colombia",
      price: "£13",
      notes: "Red plum, brown sugar, a long cocoa finish. Our steady house filter.",
      method: "filter",
      intensity: "light",
      heat: 2,
    },
    {
      name: "Dawn Guji",
      origin: "Guji, Ethiopia",
      price: "£15",
      notes: "Bergamot, jasmine, and white peach — bright and floral to the last sip.",
      method: "filter",
      intensity: "light",
      heat: 1,
    },
    {
      name: "Cedar Slope",
      origin: "Huehuetenango, Guatemala",
      price: "£13",
      notes: "Toasted almond, baking spice, milk chocolate. Balanced and forgiving.",
      method: "filter",
      intensity: "medium",
      heat: 3,
    },
    {
      name: "Kiln Lane",
      origin: "Blend · Colombia & Brazil",
      price: "£14",
      notes: "Fudge, roasted hazelnut, and a syrupy body built to hold milk.",
      method: "espresso",
      intensity: "medium",
      heat: 4,
    },
    {
      name: "Nightwork",
      origin: "Blend · Brazil & Sumatra",
      price: "£14",
      notes: "Dark cocoa, molasses, cedar smoke. A deep, low espresso for the evening.",
      method: "espresso",
      intensity: "dark",
      heat: 5,
    },
    {
      name: "Old Mill Decaf",
      origin: "Huila, Colombia",
      price: "£14",
      notes: "Sugar-cane decaffeinated. Cherry cola and cocoa, no edges. Brews either way.",
      method: "filter",
      intensity: "medium",
      heat: 3,
    },
  ];

  const grid = document.getElementById("roast-grid");
  const empty = document.getElementById("roast-empty");
  const toast = document.getElementById("toast");
  let toastTimer = 0;

  const state = { method: "all", intensity: "all" };

  const heatDots = (n) => {
    let out = "";
    for (let i = 1; i <= 5; i += 1) out += `<span class="${i <= n ? "on" : ""}"></span>`;
    return out;
  };

  const escape = (s) => s.replace(/[&<>"]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
  ));

  function render() {
    const list = roasts.filter((r) =>
      (state.method === "all" || r.method === state.method) &&
      (state.intensity === "all" || r.intensity === state.intensity));

    grid.innerHTML = list.map((r) => `
      <li class="roast">
        <div class="roast-top">
          <h3>${escape(r.name)}</h3>
          <span class="roast-price">${escape(r.price)}</span>
        </div>
        <p class="roast-origin">${escape(r.origin)}</p>
        <p class="roast-notes">${escape(r.notes)}</p>
        <div class="roast-meta">
          <span class="tag">${escape(r.method === "espresso" ? "Espresso" : "Filter")}</span>
          <span class="tag">${escape(r.intensity)} roast</span>
        </div>
        <div class="roast-heat" role="img" aria-label="Roast level ${r.heat} of 5">${heatDots(r.heat)}</div>
        <button class="buy" type="button" data-name="${escape(r.name)}">Add a bag</button>
      </li>
    `).join("");

    empty.hidden = list.length !== 0;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    // force reflow so the transition runs
    void toast.offsetWidth;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
      window.setTimeout(() => { toast.hidden = true; }, 300);
    }, 2400);
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy");
    if (!btn) return;
    showToast(`${btn.dataset.name} added — we'll roast it fresh.`);
  });

  document.querySelectorAll(".filter-group").forEach((group) => {
    const key = group.dataset.filter;
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state[key] = chip.dataset.value;
      group.querySelectorAll(".chip").forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      render();
    });
  });

  // mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => {
      setOpen(!links.classList.contains("open"));
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  render();
})();
