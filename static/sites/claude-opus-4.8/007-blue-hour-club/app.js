(() => {
  "use strict";

  const sets = [
    {
      time: "8:30 PM",
      act: "The Marlowe Trio",
      desc: "Standards, slow-walked. Brushes and a borrowed Rhodes to open the night.",
      tag: "First set",
    },
    {
      time: "10:30 PM",
      act: "Odile Rey Quartet",
      desc: "Original modal writing with a front line that trades long, searching lines.",
      tag: "Headline",
    },
    {
      time: "12:30 AM",
      act: "After-Hours Session",
      desc: "Open horn. Whoever's still in the room and willing to sit in.",
      tag: "Late",
    },
  ];

  const residents = [
    {
      name: "Odile Rey",
      instr: "Tenor saxophone",
      night: "Every Thursday",
      bio: "Leads the house quartet. Writes the tunes you'll be humming on the platform home.",
    },
    {
      name: "Marcus Vane",
      instr: "Upright bass",
      night: "First Fridays",
      bio: "Anchors the room. Twenty years of Chicago basements in every walking line.",
    },
    {
      name: "Ilse Boone",
      instr: "Piano & voice",
      night: "Sunday late",
      bio: "Turns the lights down herself. Ballads that make the bar go quiet.",
    },
    {
      name: "Del Prater",
      instr: "Drums",
      night: "Rotating",
      bio: "Keeps time you can lean on and pushes when the after-hours session needs it.",
    },
  ];

  const setlist = document.getElementById("setlist");
  if (setlist) {
    const frag = document.createDocumentFragment();
    for (const s of sets) {
      const li = document.createElement("li");
      li.className = "set";
      li.innerHTML =
        '<span class="set-time"></span>' +
        '<div class="set-main"><p class="set-act"></p><p class="set-desc"></p></div>' +
        '<span class="set-tag"></span>';
      li.querySelector(".set-time").textContent = s.time;
      li.querySelector(".set-act").textContent = s.act;
      li.querySelector(".set-desc").textContent = s.desc;
      li.querySelector(".set-tag").textContent = s.tag;
      frag.appendChild(li);
    }
    setlist.appendChild(frag);
  }

  const grid = document.getElementById("residents-grid");
  if (grid) {
    const frag = document.createDocumentFragment();
    for (const r of residents) {
      const li = document.createElement("li");
      li.className = "resident";
      li.innerHTML =
        '<span class="resident-disc" aria-hidden="true"></span>' +
        '<h3></h3><p class="instr"></p><p class="bio"></p>' +
        '<span class="night"></span>';
      li.querySelector("h3").textContent = r.name;
      li.querySelector(".instr").textContent = r.instr;
      li.querySelector(".bio").textContent = r.bio;
      li.querySelector(".night").textContent = r.night;
      frag.appendChild(li);
    }
    grid.appendChild(frag);
  }

  const form = document.getElementById("reserve-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const set = form.elements.set.value;
      const party = Math.max(1, Math.min(8, parseInt(form.elements.party.value, 10) || 2));
      if (!name) {
        status.textContent = "Add a name and we'll hold the table.";
        form.elements.name.focus();
        return;
      }
      const guests = party === 1 ? "solo" : party + " guests";
      status.textContent =
        "Held — " + name + ", " + guests + ", " + set + ". See you under the lamps.";
    });
  }

  // The viewer bridge announces a pull-to-dismiss gesture; dim the haze softly.
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = event && event.detail && event.detail.active;
    const haze = document.querySelector(".haze");
    if (haze) haze.style.opacity = active ? "0.5" : "";
  });
})();
