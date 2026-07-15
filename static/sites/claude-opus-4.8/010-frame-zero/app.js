(() => {
  "use strict";

  const films = [
    { code: "01", title: "Nightbloom", meta: ["Fiction", "94 min", "Portugal"], strand: "premiere", tag: "World premiere",
      blurb: "A florist works the graveyard shift and the flowers start keeping her secrets." },
    { code: "02", title: "The Long Static", meta: ["Nonfiction", "78 min", "USA"], strand: "doc", tag: "Nonfiction",
      blurb: "Three amateur radio operators listen for a signal everyone else stopped believing in." },
    { code: "03", title: "Salt of the Border", meta: ["Fiction", "112 min", "Mexico"], strand: "premiere", tag: "Premiere",
      blurb: "Two smugglers share a single map and completely different ideas of home." },
    { code: "04", title: "Reel Eleven", meta: ["Restored", "88 min", "1974"], strand: "restored", tag: "4K restoration",
      blurb: "The lost cut of a small-town noir, rescued from a projectionist's garage." },
    { code: "05", title: "Held Over", meta: ["Short", "14 min", "Japan"], strand: "short", tag: "Short",
      blurb: "A ticket-taker refuses to let the last showing of the year actually end." },
    { code: "06", title: "Undertow Choir", meta: ["Nonfiction", "101 min", "Iceland"], strand: "doc", tag: "Nonfiction",
      blurb: "A fishing village sings to the sea, and this year the sea answers back." },
    { code: "07", title: "Nine Volt", meta: ["Short", "9 min", "Canada"], strand: "short", tag: "Short",
      blurb: "A power cut turns one apartment block into a single, flickering conversation." },
    { code: "08", title: "Paper Cities", meta: ["Fiction", "97 min", "India"], strand: "premiere", tag: "Debut feature",
      blurb: "An architect builds model towns nobody can afford to actually live in." },
    { code: "09", title: "The Print Room", meta: ["Restored", "83 min", "1968"], strand: "restored", tag: "Restored",
      blurb: "A newly discovered experimental feature, projected exactly once since its screening." }
  ];

  const schedule = [
    { day: "Night", num: "01", title: "Opening: Nightbloom", when: "Thu · 8:00 PM · Main Hall",
      note: "World premiere followed by a conversation with the director." },
    { day: "Night", num: "04", title: "Nonfiction Double: The Long Static + Undertow Choir", when: "Sun · 6:30 PM · Main Hall",
      note: "Two listeners' films, back to back, with a short intermission." },
    { day: "Night", num: "07", title: "Shorts in the Dark", when: "Wed · 9:15 PM · Studio 2",
      note: "Five shorts programmed to be watched without a single house light." },
    { day: "Night", num: "10", title: "Restored: Reel Eleven", when: "Sat · 7:00 PM · Main Hall",
      note: "The rescued cut, projected from the original recovered reels." },
    { day: "Night", num: "12", title: "Closing: Salt of the Border", when: "Mon · 8:30 PM · Main Hall",
      note: "Festival close with a walkthrough of the projection room afterward." }
  ];

  const voices = [
    { name: "Ilse Marchetti", role: "Director, Nightbloom", note: "Trained as a botanist before turning a night job into her first feature." },
    { name: "Dovid Aarons", role: "Director, The Long Static", note: "Records field audio in dead zones; this is his debut documentary." },
    { name: "Reyna Solís", role: "Director, Salt of the Border", note: "Writes maps before scripts. Her borders are always personal ones." },
    { name: "Kaveh Mistry", role: "Director, Paper Cities", note: "An architect who kept designing towns until one became a film." }
  ];

  const posterHues = {
    "01": 8, "02": 205, "03": 32, "04": 268, "05": 340,
    "06": 190, "07": 52, "08": 128, "09": 288
  };

  const sprockets = (side) => {
    let dots = "";
    for (let i = 0; i < 7; i += 1) dots += "<i></i>";
    return '<span class="sprockets ' + side + '">' + dots + "</span>";
  };

  const grid = document.getElementById("film-grid");
  const empty = document.getElementById("film-empty");

  const render = (filter) => {
    const list = filter === "all" ? films : films.filter((f) => f.strand === filter);
    grid.innerHTML = list.map((f) => {
      const hue = posterHues[f.code] || 40;
      const bg = "background:linear-gradient(150deg,hsl(" + hue + " 45% 20%),hsl(" + ((hue + 40) % 360) + " 55% 12%));";
      return (
        '<li class="film" data-strand="' + f.strand + '">' +
          '<div class="film-poster" style="' + bg + '">' +
            sprockets("left") +
            '<span class="film-code">' + f.code + "</span>" +
            sprockets("right") +
          "</div>" +
          '<div class="film-body">' +
            '<p class="film-meta">' + f.meta.map((m) => "<span>" + m + "</span>").join("") + "</p>" +
            "<h3>" + f.title + "</h3>" +
            "<p>" + f.blurb + "</p>" +
            '<span class="tag">' + f.tag + "</span>" +
          "</div>" +
        "</li>"
      );
    }).join("");
    empty.hidden = list.length !== 0;
  };

  render("all");

  const chips = Array.from(document.querySelectorAll(".chip"));
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });
      render(chip.dataset.filter);
    });
  });

  const timeline = document.getElementById("timeline");
  timeline.innerHTML = schedule.map((s) => (
    "<li>" +
      '<div class="slot-day">' + s.day + "<b>" + s.num + "</b></div>" +
      '<div class="slot-body">' +
        "<h3>" + s.title + "</h3>" +
        "<p>" + s.note + "</p>" +
        '<span class="when">' + s.when + "</span>" +
      "</div>" +
    "</li>"
  )).join("");

  const voiceGrid = document.getElementById("voice-grid");
  voiceGrid.innerHTML = voices.map((v) => {
    const initials = v.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
    return (
      '<div class="voice">' +
        '<div class="initials" aria-hidden="true">' + initials + "</div>" +
        "<h3>" + v.name + "</h3>" +
        '<p class="role">' + v.role + "</p>" +
        "<p>" + v.note + "</p>" +
      "</div>"
    );
  }).join("");

  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const notify = document.getElementById("notify");
  const email = document.getElementById("email");
  const note = document.getElementById("notify-note");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  notify.addEventListener("click", () => {
    const value = email.value.trim();
    if (!value) {
      note.textContent = "Add an email and we'll hold your place in the program drop.";
      note.className = "field-note err";
      email.focus();
      return;
    }
    if (!emailPattern.test(value)) {
      note.textContent = "That address looks off — double-check it and try again.";
      note.className = "field-note err";
      email.focus();
      return;
    }
    note.textContent = "You're on the list. Watch for the first strand reveal.";
    note.className = "field-note ok";
    email.value = "";
  });
  email.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); notify.click(); }
  });
})();
