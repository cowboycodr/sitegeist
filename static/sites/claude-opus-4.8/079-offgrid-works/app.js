(() => {
  "use strict";

  // --- Configurator data (fully local, no network) ---
  const TRIMS = {
    scout:     { name: "Scout",     base: 62000, range: 340, sleeps: 2, kwh: 8 },
    ridgeline: { name: "Ridgeline", base: 78000, range: 300, sleeps: 3, kwh: 12 },
    basecamp:  { name: "Basecamp",  base: 94000, range: 270, sleeps: 4, kwh: 15 },
  };

  const MODULES = [
    { id: "galley",  name: "Trail galley",    desc: "Induction top, 65 L fridge, filtered tank.", price: 6200, dRange: -14, dSleeps: 0, dPower: 0 },
    { id: "loft",    name: "Pop-up loft",     desc: "Insulated roof tent adds two more berths.",   price: 5400, dRange: -12, dSleeps: 2, dPower: 0 },
    { id: "desk",    name: "Fold-flat desk",  desc: "Skylight workstation with mesh hotspot.",     price: 2900, dRange: -3,  dSleeps: 0, dPower: 0 },
    { id: "battery", name: "Range extender",  desc: "Second pack for the long empty stretches.",   price: 9800, dRange: 95,  dSleeps: 0, dPower: 4 },
    { id: "shower",  name: "Wet cell",        desc: "Sealed shower + composting head.",            price: 4300, dRange: -9,  dSleeps: 0, dPower: 0 },
    { id: "solar",   name: "Solar awning",    desc: "Deployable 900 W wing for long stays.",       price: 3100, dRange: -2,  dSleeps: 0, dPower: 2 },
  ];

  const state = { trim: "scout", mods: new Set() };
  const money = (n) => "$" + n.toLocaleString("en-US");

  // --- Build module checkboxes ---
  const modHost = document.getElementById("modules");
  MODULES.forEach((m) => {
    const label = document.createElement("label");
    label.className = "opt";
    label.innerHTML =
      '<input type="checkbox" value="' + m.id + '" aria-describedby="' + m.id + '-d" />' +
      '<span style="flex:1">' +
      '<span class="opt-name">' + m.name + '</span>' +
      '<span class="opt-desc" id="' + m.id + '-d">' + m.desc + '</span>' +
      '</span>' +
      '<span class="opt-price">+' + money(m.price) + '</span>';
    modHost.appendChild(label);
  });

  // --- Rendering ---
  const els = {
    range: document.getElementById("g-range"),
    sleeps: document.getElementById("g-sleeps"),
    power: document.getElementById("g-power"),
    list: document.getElementById("mods-list"),
    total: document.getElementById("total"),
    badge: document.getElementById("trim-badge"),
    name: document.getElementById("build-name"),
  };

  function render() {
    const t = TRIMS[state.trim];
    let range = t.range, sleeps = t.sleeps, power = t.kwh, total = t.base;
    const chosen = MODULES.filter((m) => state.mods.has(m.id));
    chosen.forEach((m) => {
      range += m.dRange; sleeps += m.dSleeps; power += m.dPower; total += m.price;
    });
    range = Math.max(180, range);

    els.range.textContent = range;
    els.sleeps.textContent = sleeps;
    els.power.textContent = power;
    els.total.textContent = money(total);
    els.badge.textContent = t.name + " trim";
    els.name.textContent = chosen.length
      ? t.name + " · " + chosen.length + (chosen.length === 1 ? " module" : " modules")
      : t.name + " · stock";

    els.list.innerHTML = "";
    if (!chosen.length) {
      const li = document.createElement("li");
      li.className = "mods-empty";
      li.textContent = "Stock build — add modules to make it yours.";
      els.list.appendChild(li);
    } else {
      chosen.forEach((m) => {
        const li = document.createElement("li");
        li.innerHTML = "<span>" + m.name + "</span><span>+" + money(m.price) + "</span>";
        els.list.appendChild(li);
      });
    }
  }

  // --- Interaction ---
  document.querySelectorAll(".trim").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.trim = btn.dataset.trim;
      document.querySelectorAll(".trim").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)));
      render();
    });
  });

  modHost.addEventListener("change", (e) => {
    const cb = e.target;
    if (!(cb instanceof HTMLInputElement)) return;
    if (cb.checked) state.mods.add(cb.value);
    else state.mods.delete(cb.value);
    render();
  });

  render();

  // --- Scroll reveal (respects reduced motion) ---
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }
})();
