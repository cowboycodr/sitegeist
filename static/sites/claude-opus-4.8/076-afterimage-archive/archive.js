"use strict";

/* Afterimage Archive — plate catalogue, decade filter, and in-page record viewer.
   Each plate's "exposure" and complementary "afterimage" are procedural gradients,
   standing in for photographs the archive cannot faithfully reproduce. */

(function () {
  var PLATES = [
    {
      num: "014", decade: "1960s", year: 1968, title: "Solar Burn, No. 3",
      process: "Chemogram on fibre paper", condition: "Fixer staining, edges lifted",
      expose: "radial-gradient(120% 90% at 30% 20%, #b8622a 0%, #5a2410 40%, #140b08 100%)",
      after: "radial-gradient(120% 90% at 30% 20%, #4fd6cf 0%, #2b6fb0 45%, transparent 80%)",
      desc: "Photographic paper worked directly with developer and fixer under open sun. No camera, no negative — only the record of chemistry meeting light on a single afternoon."
    },
    {
      num: "088", decade: "1970s", year: 1973, title: "Persistence (Green)",
      process: "Cliché-verre", condition: "Emulsion crazing throughout",
      expose: "linear-gradient(135deg, #1c3a24 0%, #0e1a12 55%, #060a07 100%)",
      after: "linear-gradient(135deg, #e26db0 0%, #e9b64b 60%, transparent 100%)",
      desc: "Drawn onto smoked glass, then printed as a photograph. The maker was testing how long a complementary afterimage lingers when the field is nearly monochrome."
    },
    {
      num: "132", decade: "1970s", year: 1976, title: "Night Bus, Long Exposure",
      process: "Silver gelatin", condition: "Silvering-out along verso",
      expose: "linear-gradient(180deg, #10141c 0%, #223049 55%, #0a0d14 100%)",
      after: "linear-gradient(180deg, #e9b64b 0%, #e26db0 60%, transparent 100%)",
      desc: "A thirty-second exposure from a moving vehicle. Streetlights smear into ribbons; the bus itself never resolves. One of nine survivors from a roll of thirty-six."
    },
    {
      num: "205", decade: "1980s", year: 1982, title: "Retinal Field, No. 3",
      process: "Cibachrome", condition: "Dye fade, cyan-shifted",
      expose: "conic-gradient(from 200deg at 60% 40%, #7a1f4d, #241033, #12203f, #7a1f4d)",
      after: "conic-gradient(from 200deg at 60% 40%, #e9b64b, #4fd6cf, #e26db0, #e9b64b)",
      desc: "Made by staring at a coloured lamp, then photographing a blank wall while the afterimage still floated across it. The print is a picture of something that was never in the room."
    },
    {
      num: "311", decade: "1980s", year: 1985, title: "Xerox Decay",
      process: "Photocopy transfer, 40th generation", condition: "Toner flaking",
      expose: "repeating-linear-gradient(90deg, #2b2b2b 0 3px, #171717 3px 7px), linear-gradient(180deg, #333, #0c0c0c)",
      after: "linear-gradient(180deg, #4fd6cf, #e26db0)",
      desc: "A portrait copied on a photocopier forty times over, each pass eroding the last. By the fortieth generation only a rhythm of grain remains where a face had been."
    },
    {
      num: "402", decade: "1980s", year: 1988, title: "Untitled (Flare)",
      process: "Dye transfer", condition: "Good; slight gloss loss",
      expose: "radial-gradient(90% 120% at 70% 30%, #f0d27a 0%, #c8622a 25%, #3a1608 60%, #0c0705 100%)",
      after: "radial-gradient(90% 120% at 70% 30%, #2b6fb0 0%, #4fd6cf 30%, transparent 70%)",
      desc: "The lens turned deliberately toward the sun. The flare — usually a mistake to be cropped away — is treated here as the sole subject of the frame."
    },
    {
      num: "517", decade: "1990s", year: 1991, title: "Scanner Ghosts",
      process: "Flatbed capture", condition: "Native digital; carrier lost",
      expose: "linear-gradient(115deg, #0d1418 0%, #1a3038 40%, #071013 100%)",
      after: "linear-gradient(115deg, #e26db0 0%, #e9b64b 50%, transparent 100%)",
      desc: "Objects dragged across an office flatbed mid-scan, smearing into vertical ghosts. Among the earliest works the archive holds that were never a physical print at all."
    },
    {
      num: "640", decade: "1990s", year: 1994, title: "Domestic Overexposure",
      process: "C-print", condition: "Highlight blocking, corner crease",
      expose: "linear-gradient(160deg, #e8e2d2 0%, #b9a17e 35%, #4a3a26 75%, #14100a 100%)",
      after: "linear-gradient(160deg, #2b6fb0 0%, #4fd6cf 40%, transparent 90%)",
      desc: "A kitchen window opened onto full noon and printed several stops too bright, until the ordinary room dissolves into white. The domestic made blinding."
    },
    {
      num: "788", decade: "1990s", year: 1997, title: "Last Roll",
      process: "Expired film, hand-processed", condition: "Heavy fogging, colour crossover",
      expose: "conic-gradient(from 30deg at 40% 60%, #7a5a2a, #2a3a5a, #5a2a4a, #7a5a2a)",
      after: "conic-gradient(from 30deg at 40% 60%, #4fd6cf, #e9b64b, #e26db0, #4fd6cf)",
      desc: "Shot on film years past its date and developed in improvised chemistry. The fog and crossover are not damage to the image — by 1997 they were the image."
    },
    {
      num: "902", decade: "1990s", year: 1999, title: "Afterglow",
      process: "Early digital composite", condition: "Compression artefacts",
      expose: "radial-gradient(100% 100% at 50% 100%, #5a2a6a 0%, #2a1a4a 40%, #0a0814 100%)",
      after: "radial-gradient(100% 100% at 50% 100%, #e9b64b 0%, #e26db0 45%, transparent 85%)",
      desc: "Layered scans blended in the first consumer editing software, closing the survey at the turn of the century. The century's last picture in the sequence, and the archive's newest."
    }
  ];

  function make(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  var grid = document.getElementById("plate-grid");
  var emptyNote = document.getElementById("empty-note");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  // Build plate cards
  PLATES.forEach(function (p) {
    var li = make("li", "plate");
    li.dataset.decade = p.decade;

    var btn = make("button", "plate-btn");
    btn.type = "button";
    btn.setAttribute("aria-label", "Plate " + p.num + ", " + p.title + ", " + p.year + ". Open record.");

    var imgWrap = make("div", "plate-img");
    imgWrap.style.setProperty("--expose", p.expose);
    imgWrap.style.setProperty("--after", p.after);
    var num = make("span", "plate-num");
    num.textContent = "PLATE " + p.num;
    imgWrap.appendChild(num);

    var cap = make("div", "plate-cap");
    var t = make("h3", "plate-title");
    t.textContent = p.title;
    var sub = make("p", "plate-sub");
    sub.textContent = p.year + " · " + p.process;
    cap.appendChild(t);
    cap.appendChild(sub);

    btn.appendChild(imgWrap);
    btn.appendChild(cap);
    btn.addEventListener("click", function () { openViewer(p, btn); });
    li.appendChild(btn);
    grid.appendChild(li);
  });

  // Decade filter
  function applyFilter(decade) {
    var shown = 0;
    Array.prototype.forEach.call(grid.children, function (li) {
      var match = decade === "all" || li.dataset.decade === decade;
      li.hidden = !match;
      if (match) shown += 1;
    });
    emptyNote.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      applyFilter(chip.dataset.decade);
    });
  });

  // In-page record viewer
  var viewer = document.getElementById("viewer");
  var card = viewer.querySelector(".viewer-card");
  var plateEl = document.getElementById("viewer-plate");
  var lastFocus = null;

  function openViewer(p, trigger) {
    lastFocus = trigger || null;
    document.getElementById("viewer-cat").textContent = "Plate " + p.num + " · " + p.decade;
    document.getElementById("viewer-title").textContent = p.title;
    document.getElementById("viewer-year").textContent = p.year;
    document.getElementById("viewer-process").textContent = p.process;
    document.getElementById("viewer-condition").textContent = p.condition;
    document.getElementById("viewer-desc").textContent = p.desc;
    plateEl.style.setProperty("--expose", p.expose);
    plateEl.style.setProperty("--after", p.after);
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    card.focus();
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  viewer.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeViewer);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !viewer.hidden) closeViewer();
  });

  // Keep focus within the open dialog
  card.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || viewer.hidden) return;
    var focusable = card.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // The bridge announces a viewer pull-to-dismiss gesture; close any open record so
  // the host viewer can take over cleanly. Harmless when standalone (never fires).
  document.addEventListener("sitegeist:pull-state", function (e) {
    if (e.detail && e.detail.active) closeViewer();
  });
})();
