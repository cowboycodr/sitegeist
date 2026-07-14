"use strict";

// Build the dial ticks and numerals, then run a live analog clock.
(function () {
  var CENTER = 120;

  var ticks = document.getElementById("ticks");
  var numerals = document.getElementById("numerals");
  if (ticks && numerals) {
    for (var i = 0; i < 60; i += 1) {
      var angle = (i / 60) * Math.PI * 2;
      var major = i % 5 === 0;
      var outer = 100;
      var inner = major ? 90 : 95;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", (CENTER + Math.sin(angle) * inner).toFixed(1));
      line.setAttribute("y1", (CENTER - Math.cos(angle) * inner).toFixed(1));
      line.setAttribute("x2", (CENTER + Math.sin(angle) * outer).toFixed(1));
      line.setAttribute("y2", (CENTER - Math.cos(angle) * outer).toFixed(1));
      line.setAttribute("stroke-width", major ? "2" : "1");
      if (major) line.setAttribute("stroke", "#c8a24a");
      ticks.appendChild(line);
    }
    for (var h = 1; h <= 12; h += 1) {
      var a = (h / 12) * Math.PI * 2;
      var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", (CENTER + Math.sin(a) * 76).toFixed(1));
      t.setAttribute("y", (CENTER - Math.cos(a) * 76 + 5).toFixed(1));
      t.textContent = String(h);
      numerals.appendChild(t);
    }
  }

  var hour = document.getElementById("hand-hour");
  var minute = document.getElementById("hand-minute");
  var second = document.getElementById("hand-second");
  var readout = document.getElementById("live-time");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rotate(el, deg) {
    if (el) el.setAttribute("transform", "rotate(" + deg.toFixed(2) + " 120 120)");
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function tick() {
    var now = new Date();
    var s = now.getSeconds() + now.getMilliseconds() / 1000;
    var m = now.getMinutes() + s / 60;
    var hr = (now.getHours() % 12) + m / 60;
    rotate(hour, hr * 30);
    rotate(minute, m * 6);
    rotate(second, s * 6);
    if (readout) {
      readout.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    }
  }

  tick();
  if (reduce) {
    // Update once a second without smooth sweep.
    setInterval(tick, 1000);
  } else {
    (function loop() {
      tick();
      requestAnimationFrame(loop);
    })();
  }
})();
