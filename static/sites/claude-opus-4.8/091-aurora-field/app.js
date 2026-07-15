(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Star field ---------- */
  var canvas = document.getElementById("sky");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 6500);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.2,
          base: Math.random() * 0.5 + 0.3,
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.9 + 0.2,
          hue: Math.random() < 0.15 ? 190 : (Math.random() < 0.2 ? 40 : 220)
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = reduce ? s.base : s.base + Math.sin(t / 1000 * s.sp + s.tw) * 0.28;
        if (a < 0) a = 0;
        ctx.beginPath();
        ctx.fillStyle = "hsla(" + s.hue + ", 70%, 88%, " + a + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    }

    resize();
    if (reduce) { draw(0); } else { raf = requestAnimationFrame(draw); }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); if (reduce) draw(0); }, 150);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else if (!reduce) { raf = requestAnimationFrame(draw); }
    });
  }

  /* ---------- Tonight's sky (computed locally, no network) ---------- */
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var fmt = function (mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    return pad(Math.floor(mins / 60)) + ":" + pad(Math.floor(mins % 60));
  };

  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  var now = new Date();
  var doy = dayOfYear(now);

  // High-latitude seasonal darkness swing (station at ~64 N).
  // Approximate astronomical twilight bounds across the year.
  var seasonal = Math.cos((doy - 172) / 365 * 2 * Math.PI); // +1 near winter solstice
  var duskMin = 20 * 60 + Math.round(seasonal * 150);   // earlier dusk in winter
  var dawnMin = 6 * 60 - Math.round(seasonal * 150) + 1440; // later dawn in winter
  var full = document.getElementById("dark-window");
  if (full) {
    if (seasonal < -0.75) {
      full.textContent = "Bright nights";
      var mw = full.nextElementSibling;
      if (mw) mw.textContent = "Near solstice the sky never fully darkens. Aurora and midnight light instead.";
    } else {
      full.textContent = fmt(duskMin) + " → " + fmt(dawnMin);
    }
  }

  // Moon phase (Conway-style approximation).
  function moonAge(d) {
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    if (m < 3) { y--; m += 12; }
    var c = 365.25 * y, e = 30.6 * m;
    var jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    var b = jd - Math.floor(jd);
    return b * 29.5305882; // days into cycle
  }
  var age = moonAge(now);
  var illum = (1 - Math.cos(age / 29.53 * 2 * Math.PI)) / 2;
  var phaseNames = [
    [1, "New moon"], [6.4, "Waxing crescent"], [8.4, "First quarter"],
    [13.8, "Waxing gibbous"], [15.8, "Full moon"], [21.1, "Waning gibbous"],
    [23.1, "Last quarter"], [28.5, "Waning crescent"], [30, "New moon"]
  ];
  var phase = "New moon";
  for (var p = 0; p < phaseNames.length; p++) { if (age <= phaseNames[p][0]) { phase = phaseNames[p][1]; break; } }
  var setText = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  setText("moon-phase", phase);
  setText("moon-illum", Math.round(illum * 100) + "%");
  setText("moon-rise", fmt(Math.round((age / 29.53) * 1440 + 18 * 60)));
  var mg = document.getElementById("moon-glyph");
  if (mg) {
    var lit = Math.round(illum * 100);
    var shadow = 100 - lit;
    mg.style.background = "conic-gradient(from " + (age > 14.77 ? 90 : 270) + "deg, #dfe6ff 0 " + lit + "%, #1a2138 " + lit + "% 100%)";
    if (shadow < 4) mg.style.background = "#dfe6ff";
    if (lit < 4) mg.style.background = "#1a2138";
  }

  // Aurora Kp — deterministic pseudo-forecast seeded by the date.
  var seed = (now.getFullYear() * 1000 + doy);
  var rnd = (Math.sin(seed) * 43758.5453) % 1;
  rnd = Math.abs(rnd);
  var kp = Math.round((rnd * 6 + (seasonal < -0.3 ? 1 : 0)) * 10) / 10;
  if (kp > 9) kp = 9;
  var kpWords = ["Quiet", "Quiet", "Unsettled", "Active", "Minor storm", "Moderate storm", "Strong storm"];
  var word = kpWords[Math.min(6, Math.floor(kp))];
  setText("kp-value", kp.toFixed(1));
  setText("kp-word", word);
  var fill = document.getElementById("kp-fill");
  if (fill) { requestAnimationFrame(function () { fill.style.width = Math.round(kp / 9 * 100) + "%"; }); }

  // Overhead-now list: rotate seasonal deep-sky targets by hour.
  var catalog = [
    ["Polaris", "Ursae Minoris"], ["Vega", "α Lyrae"], ["Deneb", "α Cygni"],
    ["The Double Cluster", "NGC 869 / 884"], ["Andromeda Galaxy", "M31"],
    ["Ring Nebula", "M57"], ["Great Cluster", "M13"], ["Pleiades", "M45"],
    ["Capella", "α Aurigae"], ["Cassiopeia", "the W"], ["Perseus arm", "Milky Way"],
    ["Almach", "double star"]
  ];
  var hr = now.getHours();
  var list = document.getElementById("objlist");
  if (list) {
    list.innerHTML = "";
    var picks = [];
    for (var k = 0; k < 6; k++) {
      picks.push(catalog[(hr * 2 + k * 3 + doy) % catalog.length]);
    }
    picks.forEach(function (o, idx) {
      var alt = 20 + ((hr * 7 + idx * 13 + doy) % 65);
      var li = document.createElement("li");
      var a = document.createElement("span"); a.className = "obj-name"; a.textContent = o[0] + " · " + o[1];
      var b = document.createElement("span"); b.className = "obj-alt"; b.textContent = alt + "° alt";
      li.appendChild(a); li.appendChild(b);
      list.appendChild(li);
    });
  }

  // Season copy.
  var months = ["deep winter", "deep winter", "early spring", "spring", "late spring",
    "midnight-sun season", "midnight-sun season", "late summer", "early autumn",
    "autumn", "aurora season", "deep winter"];
  var seasonNotes = {
    "deep winter": "Longest darkness of the year. Prime imaging and the strongest aurora.",
    "early spring": "Nights shorten but stay dark and cold. Excellent transparency.",
    "spring": "Balanced nights with fewer clouds. Good for galaxies.",
    "late spring": "Twilight lingers; short dark windows near midnight.",
    "midnight-sun season": "No true darkness. We run daytime tours and solar viewing.",
    "late summer": "Darkness returns after midnight. Meteor showers peak.",
    "early autumn": "Crisp, long nights returning. First aurora of the season.",
    "autumn": "Reliable dark and rising aurora activity.",
    "aurora season": "Cold, clear, and active — our busiest residencies."
  };
  var seasonName = months[now.getMonth()];
  setText("season", seasonName.charAt(0).toUpperCase() + seasonName.slice(1));
  setText("season-note", seasonNotes[seasonName] || "Clear northern nights.");

  // Live clock.
  var clock = document.getElementById("clock");
  function tick() {
    if (!clock) return;
    var d = new Date();
    clock.textContent = "Station time " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  tick();
  setInterval(tick, 15000);
})();
