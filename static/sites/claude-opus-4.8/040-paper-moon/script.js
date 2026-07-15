(() => {
  "use strict";

  /* Poster hues from data attribute */
  document.querySelectorAll(".film-poster[data-hue]").forEach((el) => {
    el.style.setProperty("--h", el.getAttribute("data-hue"));
  });

  /* Mobile nav */
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
      mobileNav.dataset.open = String(open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false)),
    );
  }

  /* Ticket reservation */
  const reserve = document.getElementById("reserve-btn");
  const note = document.getElementById("stub-note");
  const serial = document.getElementById("stub-serial");
  if (reserve && note) {
    reserve.addEventListener("click", () => {
      if (reserve.classList.contains("is-done")) return;
      reserve.classList.add("is-done");
      reserve.textContent = "Seat held ✓";
      const n = 100 + Math.floor(Math.random() * 890);
      if (serial) serial.textContent = String(n).padStart(4, "0");
      note.textContent = "Held under No. " + String(n).padStart(4, "0") +
        " — pick it up at the box office by 7:00 PM.";
    });
  }

  /* Program filter */
  const chips = document.querySelectorAll(".chip[data-strand]");
  const cards = document.querySelectorAll(".film-card");
  const empty = document.getElementById("film-empty");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const strand = chip.dataset.strand;
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      let visible = 0;
      cards.forEach((card) => {
        const show = strand === "all" || card.dataset.strand === strand;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  });

  /* Archive reel */
  const picks = [
    { year: "1967", title: "Harbor Lights", tag: "Restored classic" },
    { year: "1983", title: "The Glass Orchard", tag: "Midnight rarity" },
    { year: "1959", title: "Streetcar to Nowhere", tag: "Restored classic" },
    { year: "2019", title: "Salt Gardens", tag: "New voice" },
    { year: "1974", title: "Paper Houses", tag: "Opening night, 1974" },
    { year: "1991", title: "Neon Undertow", tag: "Cult noir" },
    { year: "1948", title: "The Last Reel", tag: "Silent with live score" },
    { year: "2004", title: "Low Meridian", tag: "Festival premiere" },
  ];
  const reel = document.querySelector(".reel");
  const reelBtn = document.getElementById("reel-btn");
  const yearEl = document.getElementById("reel-year");
  const titleEl = document.getElementById("reel-title");
  const tagEl = document.getElementById("reel-tag");
  let last = -1;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reelBtn && reel && titleEl) {
    reelBtn.addEventListener("click", () => {
      let i;
      do { i = Math.floor(Math.random() * picks.length); } while (i === last && picks.length > 1);
      last = i;
      const apply = () => {
        yearEl.textContent = picks[i].year;
        titleEl.textContent = picks[i].title;
        tagEl.textContent = picks[i].tag;
      };
      if (reduce) { apply(); return; }
      reel.classList.remove("is-spinning");
      void reel.offsetWidth;
      reel.classList.add("is-spinning");
      apply();
    });
  }

  /* Bridge: reflect pull state (touch dismissal) subtly, non-essential */
  document.addEventListener("sitegeist:pull-state", (e) => {
    document.body.style.setProperty(
      "cursor",
      e.detail && e.detail.active ? "grabbing" : "",
    );
  });
})();
