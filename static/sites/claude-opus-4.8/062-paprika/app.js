"use strict";

(function () {
  // Small procedural "dish" artwork — no external images, all inline SVG.
  function dishArt(base, accent, garnish) {
    return (
      '<svg class="card__img" viewBox="0 0 250 150" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="250" height="150" fill="#2a1a12"/>' +
      '<rect width="250" height="150" fill="url(#bowlbg)" opacity="0"/>' +
      '<ellipse cx="125" cy="80" rx="98" ry="58" fill="#3a251a"/>' +
      '<ellipse cx="125" cy="76" rx="86" ry="50" fill="' + base + '"/>' +
      '<ellipse cx="105" cy="66" rx="26" ry="16" fill="' + accent + '"/>' +
      '<ellipse cx="152" cy="86" rx="22" ry="14" fill="' + accent + '" opacity=".85"/>' +
      '<circle cx="132" cy="62" r="7" fill="' + garnish + '"/>' +
      '<circle cx="96" cy="90" r="6" fill="' + garnish + '"/>' +
      '<circle cx="160" cy="66" r="5" fill="#f4c85a"/>' +
      '<path d="M118 58c10 3 14 10 10 18" fill="none" stroke="#5f8a34" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  var dishes = [
    { name: "Smoked Paprika Chicken", kitchen: "Ember & Oak", price: "$16", heat: "medium", hot: 2, tag: "Signature", desc: "Charred thigh, burnt-honey glaze, roasted peppers.", art: dishArt("#c9412a", "#e2683a", "#8f2318") },
    { name: "Green Herb Bowl", kitchen: "Rootroom", price: "$14", heat: "mild", hot: 1, tag: "Veg", desc: "Grains, soft herbs, lemon-tahini, toasted seeds.", art: dishArt("#7fae4b", "#9cc76a", "#4d7a2b") },
    { name: "Diablo Short Rib", kitchen: "Casa Fuego", price: "$21", heat: "hot", hot: 3, tag: "Chef's pick", desc: "Slow rib, dried-chili sauce, pickled onion.", art: dishArt("#a72d13", "#d34121", "#5f1608") },
    { name: "Golden Turmeric Dal", kitchen: "Little Spoon", price: "$13", heat: "mild", hot: 1, tag: "Comfort", desc: "Buttered lentils, crisp shallot, warm flatbread.", art: dishArt("#e0a02a", "#f0b840", "#b8781a") },
    { name: "Firecracker Noodles", kitchen: "Wok Nights", price: "$15", heat: "hot", hot: 3, tag: "New", desc: "Blistered chilies, garlic, spring onion, sesame.", art: dishArt("#d34121", "#f0873a", "#7fae4b") },
    { name: "Charred Corn Tacos", kitchen: "Maíz", price: "$12", heat: "medium", hot: 2, tag: "Street", desc: "Grilled corn, smoky crema, lime, cotija.", art: dishArt("#e2b23a", "#f4c85a", "#c9412a") },
    { name: "Roasted Tomato Orzo", kitchen: "Ember & Oak", price: "$14", heat: "mild", hot: 1, tag: "Veg", desc: "Slow tomatoes, basil, whipped ricotta.", art: dishArt("#c9412a", "#e2683a", "#7fae4b") },
    { name: "Peri-Peri Halloumi", kitchen: "Casa Fuego", price: "$15", heat: "medium", hot: 2, tag: "Grill", desc: "Seared halloumi, peri sauce, herb salad.", art: dishArt("#d98a2a", "#f0a24a", "#a72d13") },
  ];

  var kitchens = [
    { name: "Ember & Oak", chef: "Chef Nadia Rees", note: "Live-fire comfort food, three streets over.", meta: "★ 4.9 · 22 min", color: "#c9412a" },
    { name: "Casa Fuego", chef: "Chef Diego Marín", note: "Family recipes with a serious chili habit.", meta: "★ 4.8 · 25 min", color: "#a72d13" },
    { name: "Rootroom", chef: "Chef Ivy Cole", note: "Vegetable-first plates, nothing dull.", meta: "★ 4.9 · 19 min", color: "#5f8a34" },
    { name: "Wok Nights", chef: "Chef Ken Tanaka", note: "Wok-charred noodles cooked to order.", meta: "★ 4.7 · 24 min", color: "#e0872a" },
  ];

  function pepper(filled) {
    return (
      '<svg class="pepper ' + (filled ? "" : "pepper--off") + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M14 4c1 2 0 3-1 4 4 0 7 3 7 8 0 3-3 5-7 5-6 0-10-4-10-9 0-1 1-2 2-2 3 0 4 2 6 2 2 0 2-2 1-4-1-2 0-4 2-4z" fill="#d34121"/>' +
      '<path d="M13 3c1 0 2 1 2 2-1 0-2 0-2 1-1-1-1-2 0-3z" fill="#5f8a34"/></svg>'
    );
  }

  function heatDots(level) {
    var out = "";
    for (var i = 1; i <= 3; i++) out += pepper(i <= level);
    return '<span class="heat-dots" role="img" aria-label="Heat ' + level + ' of 3">' + out + "</span>";
  }

  function renderDishes(filter) {
    var list = document.getElementById("dishes");
    var empty = document.getElementById("empty");
    var shown = dishes.filter(function (d) {
      return filter === "all" || d.heat === filter;
    });
    list.innerHTML = shown
      .map(function (d) {
        return (
          '<li class="card">' +
          d.art +
          '<div class="card__body">' +
          '<div class="card__top"><span class="card__name">' + d.name + '</span>' +
          '<span class="card__price">' + d.price + "</span></div>" +
          '<p class="card__kitchen">' + d.kitchen + "</p>" +
          '<p class="card__desc">' + d.desc + "</p>" +
          '<div class="card__foot">' + heatDots(d.hot) +
          '<span class="tag">' + d.tag + "</span></div>" +
          "</div></li>"
        );
      })
      .join("");
    empty.hidden = shown.length !== 0;
  }

  function renderKitchens() {
    var grid = document.getElementById("kitchens-grid");
    if (!grid) return;
    grid.innerHTML = kitchens
      .map(function (k) {
        var initial = k.name.charAt(0);
        return (
          '<div class="kcard">' +
          '<span class="kcard__badge" style="background:' + k.color + '" aria-hidden="true">' + initial + "</span>" +
          "<div><h3>" + k.name + "</h3>" +
          "<p>" + k.chef + " — " + k.note + "</p>" +
          '<p class="kcard__meta">' + k.meta + "</p></div>" +
          "</div>"
        );
      })
      .join("");
  }

  function wireFilters() {
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        renderDishes(chip.dataset.heat);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderDishes("all");
    renderKitchens();
    wireFilters();
  });
})();
