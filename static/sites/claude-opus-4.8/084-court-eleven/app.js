(function () {
  "use strict";

  // ----- Mobile menu -----
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // ----- Schedule tabs -----
  var schedules = {
    "tab-mon": [
      ["06:00", "Sunrise singles", "Open play · Courts 1–4", "open", "Open"],
      ["08:30", "Cardio clinic", "Coaching · Court 7", "few", "2 spots"],
      ["12:00", "Lunch doubles rotation", "Open play · Courts 8–11", "open", "Open"],
      ["18:30", "Ladder night", "League · All courts", "wait", "Waitlist"]
    ],
    "tab-wed": [
      ["07:00", "Clay fundamentals", "Coaching · Court 3", "few", "3 spots"],
      ["10:00", "Open play block", "Open play · Courts 5–9", "open", "Open"],
      ["17:00", "Junior academy", "Coaching · Courts 1–2", "wait", "Waitlist"],
      ["20:00", "Late doubles", "Open play · Courts 10–11", "open", "Open"]
    ],
    "tab-fri": [
      ["06:00", "Sunrise singles", "Open play · Courts 1–4", "open", "Open"],
      ["09:30", "Recovery flow", "Recovery · Stretch studio", "few", "4 spots"],
      ["13:00", "Founder’s clinic", "Coaching · Court 6", "wait", "Waitlist"],
      ["19:00", "Wine &amp; rally social", "Open play · Courts 7–11", "open", "Open"]
    ],
    "tab-sat": [
      ["07:30", "Weekend doubles", "Open play · Courts 1–6", "open", "Open"],
      ["10:00", "Kids on clay", "Coaching · Courts 2–3", "few", "5 spots"],
      ["14:00", "Club tournament", "League · All courts", "wait", "Bracket full"],
      ["18:00", "Golden hour rally", "Open play · Courts 8–11", "open", "Open"]
    ]
  };

  var panel = document.getElementById("panel");
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function render(id) {
    var rows = schedules[id];
    if (!rows || !panel) return;
    var html = "";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html += '<div class="slot"><span class="time">' + r[0] +
        '</span><span class="what"><b>' + r[1] + '</b><span>' + r[2] +
        '</span></span><span class="state ' + r[3] + '">' + r[4] + '</span></div>';
    }
    panel.innerHTML = html;
  }

  function select(tab) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
    render(tab.id);
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () { select(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); next.focus(); select(next); }
    });
  });
})();
