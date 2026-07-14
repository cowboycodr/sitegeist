(() => {
  "use strict";

  var stops = [
    { place: "Batumi", note: "Boarding by the Black Sea. Rain on the platform, tea in paper cups." },
    { place: "Kobuleti", note: "The coast slides past. Eucalyptus, then the first low hills." },
    { place: "Kutaisi", note: "A junction of old bridges. We stretch our legs and buy plums." },
    { place: "Gori", note: "Fields and freight yards. The mountains start to close in." },
    { place: "Tbilisi", note: "Arrival before the city admits it is awake. The dispatch begins here." }
  ];

  function init() {
    var svg = document.getElementById("route-map");
    var path = document.getElementById("flight-path");
    var plane = document.getElementById("map-plane");
    var stopsLayer = document.getElementById("map-stops");
    if (!svg || !path || !plane || !stopsLayer) return;

    var idxEl = document.getElementById("readout-index");
    var placeEl = document.getElementById("readout-place");
    var noteEl = document.getElementById("readout-note");

    var total = path.getTotalLength();
    var buttons = [];
    var current = -1;

    // Sample points evenly along the drawn path.
    var points = stops.map(function (_, i) {
      var len = stops.length === 1 ? 0 : (i / (stops.length - 1)) * total;
      var p = path.getPointAtLength(len);
      var ahead = path.getPointAtLength(Math.min(total, len + 1));
      var angle = Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180 / Math.PI;
      return { x: p.x, y: p.y, angle: angle, len: len };
    });

    stops.forEach(function (stop, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "stop-btn";
      b.setAttribute("data-label", stop.place);
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Stop " + (i + 1) + ", " + stop.place);
      b.style.left = (points[i].x / 400 * 100) + "%";
      b.style.top = (points[i].y / 300 * 100) + "%";
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          buttons[(i + 1) % buttons.length].focus();
          select((i + 1) % buttons.length);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          var prev = (i - 1 + buttons.length) % buttons.length;
          buttons[prev].focus();
          select(prev);
        }
      });
      stopsLayer.appendChild(b);
      buttons.push(b);
    });

    function select(i) {
      if (i === current) return;
      current = i;
      var pt = points[i];
      plane.setAttribute("transform",
        "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ") rotate(" + pt.angle.toFixed(1) + ")");
      buttons.forEach(function (b, j) {
        b.setAttribute("aria-pressed", j === i ? "true" : "false");
      });
      idxEl.textContent = "Stop " + (i + 1) + " of " + stops.length;
      placeEl.textContent = stops[i].place;
      noteEl.textContent = stops[i].note;
    }

    // Start at the origin stop.
    select(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
