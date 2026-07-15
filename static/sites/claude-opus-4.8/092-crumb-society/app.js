(() => {
  "use strict";

  const bakes = [
    { name: "Cultured Croissant", price: 4.5, cat: "viennoiserie", tag: "Signature", desc: "27 layers of 72-hour cultured butter, shatter-crisp shell." },
    { name: "Rye Kouign-Amann", price: 5, cat: "viennoiserie", tag: "Limited", desc: "Caramel-lacquered edges over stone-milled rye dough." },
    { name: "Morning Bun", price: 4.75, cat: "viennoiserie", desc: "Orange sugar, cinnamon, and a spiral you can hear." },
    { name: "Country Sourdough", price: 8, cat: "loaves", tag: "Daily", desc: "Red fife and levain, blistered crust, open crumb." },
    { name: "Seeded Rye Miche", price: 9, cat: "loaves", desc: "Deep bake, toasted caraway, keeps all week." },
    { name: "Milk & Honey Loaf", price: 7, cat: "loaves", desc: "Soft, tearable, brushed with local wildflower honey." },
    { name: "Roasted Plum Danish", price: 5.25, cat: "sweet", tag: "Seasonal", desc: "Orchard plums roasted down to a jam with backbone." },
    { name: "Brown Butter Canelé", price: 3.5, cat: "sweet", desc: "Custard center, mahogany shell, a whisper of rum." },
    { name: "Grain & Chocolate Cookie", price: 4, cat: "sweet", desc: "Heritage flour, sea salt, puddles of dark chocolate." }
  ];

  const money = (n) => "$" + (Number.isInteger(n) ? n : n.toFixed(2));

  /* ---- Today's bake board ---- */
  const menu = document.getElementById("menu");
  const chips = Array.from(document.querySelectorAll(".chip"));

  const renderMenu = (filter) => {
    const items = bakes.filter((b) => filter === "all" || b.cat === filter);
    menu.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Sold out for today — check back at 7:00 tomorrow.";
      menu.appendChild(li);
      return;
    }
    for (const b of items) {
      const li = document.createElement("li");
      const row = document.createElement("div");
      row.className = "row";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = b.name;
      const price = document.createElement("span");
      price.className = "price-tag";
      price.textContent = money(b.price);
      row.append(name, price);
      const desc = document.createElement("p");
      desc.className = "desc";
      desc.textContent = b.desc;
      li.append(row, desc);
      if (b.tag) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = b.tag;
        li.appendChild(tag);
      }
      menu.appendChild(li);
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.remove("is-on");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-selected", "true");
      renderMenu(chip.dataset.filter);
    });
  });

  renderMenu("all");

  /* ---- Box builder ---- */
  const MAX = 12;
  const builder = document.getElementById("builder");
  const countEl = document.getElementById("count");
  const priceEl = document.getElementById("price");
  const resetBtn = document.getElementById("reset");
  const qty = new Map();

  const total = () => Array.from(qty.values()).reduce((a, b) => a + b, 0);

  const refresh = () => {
    const n = total();
    countEl.textContent = String(n);
    const sum = bakes.reduce((acc, b, i) => acc + (qty.get(i) || 0) * b.price, 0);
    priceEl.textContent = "$" + sum.toFixed(2);
    builder.querySelectorAll("[data-plus]").forEach((btn) => {
      btn.disabled = n >= MAX;
    });
  };

  bakes.forEach((b, i) => {
    qty.set(i, 0);
    const li = document.createElement("li");

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "b-name";
    name.textContent = b.name;
    const p = document.createElement("div");
    p.className = "b-price";
    p.textContent = money(b.price) + " each";
    info.append(name, p);

    const stepper = document.createElement("div");
    stepper.className = "stepper";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Remove one " + b.name);
    minus.disabled = true;

    const q = document.createElement("span");
    q.className = "qty";
    q.textContent = "0";
    q.setAttribute("aria-live", "polite");
    q.setAttribute("aria-label", b.name + " quantity");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.dataset.plus = "1";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Add one " + b.name);

    plus.addEventListener("click", () => {
      if (total() >= MAX) return;
      qty.set(i, qty.get(i) + 1);
      q.textContent = String(qty.get(i));
      minus.disabled = false;
      refresh();
    });
    minus.addEventListener("click", () => {
      if (qty.get(i) <= 0) return;
      qty.set(i, qty.get(i) - 1);
      q.textContent = String(qty.get(i));
      minus.disabled = qty.get(i) === 0;
      refresh();
    });

    stepper.append(minus, q, plus);
    li.append(info, stepper);
    builder.appendChild(li);
  });

  resetBtn.addEventListener("click", () => {
    bakes.forEach((_, i) => qty.set(i, 0));
    builder.querySelectorAll(".qty").forEach((el) => (el.textContent = "0"));
    builder.querySelectorAll("[aria-label^='Remove']").forEach((el) => (el.disabled = true));
    refresh();
  });

  refresh();
})();
