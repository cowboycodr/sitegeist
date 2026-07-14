"use strict";

(function () {
  /* ---------- Warming stripes ---------- */
  var stripes = document.getElementById("stripes");
  if (stripes) {
    // Deterministic-ish anomaly curve from ~1900 to now: cool early, warm late.
    var years = 62; // one stripe per ~2 years
    var frag = document.createDocumentFragment();
    for (var i = 0; i < years; i++) {
      var t = i / (years - 1);
      // rising trend + gentle wobble
      var warm = Math.pow(t, 1.7) + 0.06 * Math.sin(i * 1.3);
      warm = Math.max(0, Math.min(1, warm));
      var span = document.createElement("span");
      span.style.background = stripeColor(warm);
      frag.appendChild(span);
    }
    stripes.appendChild(frag);
  }

  function stripeColor(w) {
    // 0 -> deep blue, 0.5 -> pale, 1 -> deep red
    if (w < 0.5) {
      var k = w / 0.5;
      return mix([26, 68, 120], [220, 232, 238], k);
    }
    var k2 = (w - 0.5) / 0.5;
    return mix([245, 226, 210], [176, 26, 20], k2);
  }
  function mix(a, b, k) {
    var r = Math.round(a[0] + (b[0] - a[0]) * k);
    var g = Math.round(a[1] + (b[1] - a[1]) * k);
    var bl = Math.round(a[2] + (b[2] - a[2]) * k);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  /* ---------- Reading-time clock ---------- */
  var clock = document.getElementById("session-clock");
  if (clock) {
    var start = Date.now();
    var tick = function () {
      var s = Math.floor((Date.now() - start) / 1000);
      var m = Math.floor(s / 60);
      clock.textContent = pad(m) + ":" + pad(s % 60);
    };
    setInterval(tick, 1000);
    tick();
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  /* ---------- Story cards + filtering ---------- */
  var stories = [
    { desk: "investigations", tag: "Investigation", title: "The permits that outran the flood maps", dek: "How a decade of fast-tracked approvals put 40,000 homes inside a hazard line nobody updated.", place: "Coastal review", read: "18 min" },
    { desk: "oceans", tag: "Oceans", title: "A reef keeps its own weather diary", dek: "Divers and sensors recorded the exact hours a warm-water pulse began bleaching a nursery.", place: "Field report", read: "11 min" },
    { desk: "cities", tag: "Cities", title: "The block that beat the heat dome", dek: "Trees, paint, and stubborn neighbors dropped one street 7°C below the grid around it.", place: "Data story", read: "9 min" },
    { desk: "investigations", tag: "Investigation", title: "Following the methane the map forgot", dek: "Satellite plumes, leaked logbooks, and a night drive traced an unreported leak to its valve.", place: "Investigation", read: "22 min" },
    { desk: "oceans", tag: "Oceans", title: "When the current changed its mind", dek: "Fishers noticed before the models did. We reconstructed the season the water turned.", place: "Long read", read: "14 min" },
    { desk: "cities", tag: "Cities", title: "Rewiring a city for the summer that stays", dek: "Inside the retrofit crews racing the calendar to cool schools before the next threshold week.", place: "Field report", read: "12 min" }
  ];

  var cards = document.getElementById("cards");
  function render(desk) {
    if (!cards) return;
    cards.innerHTML = "";
    var frag = document.createDocumentFragment();
    stories.forEach(function (s) {
      if (desk !== "all" && s.desk !== desk) return;
      var a = document.createElement("a");
      a.className = "card";
      a.href = "#latest";
      a.setAttribute("aria-label", s.title);
      a.innerHTML =
        '<p class="card__desk">' + s.tag + "</p>" +
        '<h3 class="card__title">' + s.title + "</h3>" +
        '<p class="card__dek">' + s.dek + "</p>" +
        '<p class="card__meta"><span>' + s.place + '</span><span class="read">' + s.read + " read</span></p>";
      frag.appendChild(a);
    });
    cards.appendChild(frag);
  }
  render("all");

  var chips = document.querySelectorAll(".chip");
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener("click", function () {
      Array.prototype.forEach.call(chips, function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      render(chip.getAttribute("data-desk"));
    });
  });

  /* ---------- Atlas slider ---------- */
  var year = document.getElementById("year");
  var yearValue = document.getElementById("year-value");
  var readout = document.getElementById("atlas-readout");
  var glacier = document.getElementById("glacier");
  var sea = document.getElementById("sea");
  var heat = document.getElementById("heat-band");

  function updateAtlas() {
    if (!year) return;
    var y = parseInt(year.value, 10);
    var t = (y - 1900) / (2025 - 1900); // 0..1
    var anomaly = (-0.15 + Math.pow(t, 1.6) * 1.55).toFixed(1);
    if (yearValue) yearValue.textContent = y;
    if (readout) {
      readout.innerHTML = "Global anomaly in " + y + ": " +
        (anomaly >= 0 ? "+" : "") + anomaly + "&nbsp;°C";
    }
    if (glacier) glacier.setAttribute("opacity", (0.7 - t * 0.5).toFixed(2));
    if (sea) sea.setAttribute("y", (170 - t * 22).toFixed(0));
    if (heat) heat.setAttribute("opacity", (0.08 + t * 0.42).toFixed(2));
  }
  if (year) {
    year.addEventListener("input", updateAtlas);
    updateAtlas();
  }

  /* ---------- Bridge pull-state visual hook (optional, non-essential) ---------- */
  document.addEventListener("sitegeist:pull-state", function (e) {
    document.body.style.opacity = e.detail && e.detail.active ? "0.96" : "";
  });
})();
