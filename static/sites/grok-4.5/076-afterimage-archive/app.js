(() => {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(document.querySelectorAll(".card"));
  const countEl = document.querySelector("[data-archive-count]");
  const backdrop = document.querySelector(".detail-backdrop");
  const panel = document.querySelector(".detail-panel");
  const detailMedia = document.querySelector("[data-detail-media]");
  const detailMeta = document.querySelector("[data-detail-meta]");
  const detailTitle = document.querySelector("[data-detail-title]");
  const detailArtist = document.querySelector("[data-detail-artist]");
  const detailBody = document.querySelector("[data-detail-body]");
  const detailSpecs = document.querySelector("[data-detail-specs]");
  const closeBtn = document.querySelector("[data-detail-close]");

  const entries = {
    "ghost-plate-17": {
      title: "Ghost Plate 17",
      artist: "Elena Varga",
      year: "1971",
      process: "Solarized gelatin silver",
      decade: "1968-1979",
      medium: "Gelatin silver print",
      dimensions: "27.9 × 35.6 cm",
      origin: "Prague, CSSR",
      accession: "AA-0142",
      body: [
        "Varga exposed the same plate three times under a safelight, each pass shorter than the last, then solarized the latent image mid-development. The residual figure is neither presence nor absence—an afterimage fixed before the eye could rest.",
        "Printed in an edition of seven, only two prints survived the 1974 studio flood. This scan is taken from the archive’s acquisition print, purchased from a private collection in Brno in 2019."
      ]
    },
    "interval-burn": {
      title: "Interval Burn",
      artist: "Marcus Hale",
      year: "1976",
      process: "Enlarger light painting",
      decade: "1968-1979",
      medium: "Fiber-based silver print",
      dimensions: "40.6 × 50.8 cm",
      origin: "Chicago, USA",
      accession: "AA-0287",
      body: [
        "Hale timed the enlarger lamp with a kitchen timer, opening and closing a cardboard aperture over the paper in eight-second intervals. The grid of burns maps duration as density rather than as narrative frame.",
        "Originally dismissed as process notes rather than finished work, Interval Burn was recovered from Hale’s estate boxes labeled “tests only.” The archive treats those tests as the work."
      ]
    },
    "wet-collodion-memory": {
      title: "Wet Collodion Memory",
      artist: "S. Ikemoto",
      year: "1969",
      process: "Rephotographed collodion",
      decade: "1968-1979",
      medium: "Contact print from glass plate",
      dimensions: "12.7 × 17.8 cm",
      origin: "Kyoto, Japan",
      accession: "AA-0091",
      body: [
        "Ikemoto rephotographed a cracked nineteenth-century portrait plate under raking light, then printed the second exposure as if it were the original. The fracture becomes the subject; the sitter becomes atmosphere.",
        "A handwritten verso note in Japanese reads: “what remains when the face forgets itself.”"
      ]
    },
    "cyan-delay": {
      title: "Cyan Delay",
      artist: "Rhea Coltrane",
      year: "1983",
      process: "Cross-processed slide film",
      decade: "1980-1989",
      medium: "C-print from E-6 film",
      dimensions: "50.8 × 61.0 cm",
      origin: "London, UK",
      accession: "AA-0415",
      body: [
        "Coltrane shot Tungsten-balanced slide film outdoors at dusk, then forced a C-41 process. The cyan cast is not a mistake but a measured delay between color temperature and chemical expectation.",
        "This print was exhibited once in a university hallway show and never editioned. The archive holds the only known large print and the original mounted slide."
      ]
    },
    "double-horizon": {
      title: "Double Horizon",
      artist: "Jean-Pierre Molet",
      year: "1981",
      process: "In-camera double exposure",
      decade: "1980-1989",
      medium: "Gelatin silver print",
      dimensions: "30.5 × 40.6 cm",
      origin: "Marseille, France",
      accession: "AA-0362",
      body: [
        "Molet overlapped two sea horizons shot minutes apart—one under fog, one under hard sun—without resetting the film advance. The shoreline refuses a single weather.",
        "Critics of the time filed the series under “student exercises.” Later landscape historians cite it as an early rejection of decisive-moment purity."
      ]
    },
    "phosphor-trace": {
      title: "Phosphor Trace",
      artist: "Nadia Okonkwo",
      year: "1987",
      process: "Oscilloscope photogram",
      decade: "1980-1989",
      medium: "Direct positive paper",
      dimensions: "20.3 × 25.4 cm",
      origin: "Lagos / London",
      accession: "AA-0508",
      body: [
        "Okonkwo pressed photographic paper to a CRT oscilloscope running a decaying sine wave. No camera intervened. The trace is both instrument readout and gesture.",
        "Collected from a technical school dumpster by a colleague who recognized the paper stock, the set of twelve traces is now catalogued as a single suite."
      ]
    },
    "residue-map": {
      title: "Residue Map",
      artist: "Tomasz Bielik",
      year: "1992",
      process: "Chemigram on RC paper",
      decade: "1990-1999",
      medium: "Chemigram",
      dimensions: "35.6 × 43.2 cm",
      origin: "Kraków, Poland",
      accession: "AA-0674",
      body: [
        "Bielik painted resist varnish in the shape of municipal cadastral lines, then bathed the paper in alternating developer and fixer. The city appears as chemical erosion rather than survey.",
        "No negative exists. Each print is unique, and the archive’s copy shows varnish cracks that themselves map a second, accidental cartography."
      ]
    },
    "late-flare": {
      title: "Late Flare",
      artist: "Camille Ortez",
      year: "1996",
      process: "Lens flare as subject",
      decade: "1990-1999",
      medium: "Chromogenic print",
      dimensions: "61.0 × 76.2 cm",
      origin: "Mexico City, Mexico",
      accession: "AA-0789",
      body: [
        "Ortez pointed a damaged telephoto at a sodium streetlamp and focused on the internal reflections instead of the source. The photograph records the instrument’s blindness as spectacle.",
        "Published only in a photocopied zine of twelve copies. This archival print was made from the original negative in 2021 under the artist’s supervision."
      ]
    },
    "shutter-ghost": {
      title: "Shutter Ghost",
      artist: "H. Renfield",
      year: "1999",
      process: "Leaf shutter failure study",
      decade: "1990-1999",
      medium: "Gelatin silver print",
      dimensions: "24.0 × 30.5 cm",
      origin: "Toronto, Canada",
      accession: "AA-0912",
      body: [
        "Renfield deliberately used a camera with a sticking leaf shutter, capturing partial closures as radial veils across domestic interiors. Failure becomes the exposure’s architecture.",
        "The series closed the archive’s founding decade cutoff. Renfield donated the negatives with the condition that they never be “corrected” in digitization."
      ]
    }
  };

  function setCount(visible) {
    if (!countEl) return;
    countEl.innerHTML = `<strong>${visible}</strong> of ${cards.length} plates`;
  }

  function applyFilter(decade) {
    let visible = 0;
    cards.forEach((card) => {
      const match = decade === "all" || card.dataset.decade === decade;
      card.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });
    setCount(visible);
    filterButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === decade));
    });
  }

  function openDetail(id) {
    const entry = entries[id];
    if (!entry || !backdrop) return;

    const card = document.querySelector(`.card[data-id="${id}"]`);
    const thumb = card ? card.querySelector(".card-thumb") : null;
    if (detailMedia && thumb) {
      detailMedia.innerHTML = thumb.innerHTML;
    }

    if (detailMeta) {
      detailMeta.innerHTML = `<span>${entry.process}</span><span>${entry.year}</span><span>${entry.accession}</span>`;
    }
    if (detailTitle) detailTitle.textContent = entry.title;
    if (detailArtist) detailArtist.textContent = entry.artist;
    if (detailBody) {
      detailBody.innerHTML = entry.body.map((p) => `<p>${p}</p>`).join("");
    }
    if (detailSpecs) {
      detailSpecs.innerHTML = [
        ["Medium", entry.medium],
        ["Dimensions", entry.dimensions],
        ["Origin", entry.origin],
        ["Decade", entry.decade]
      ]
        .map(
          ([label, value]) =>
            `<div class="spec"><dt>${label}</dt><dd>${value}</dd></div>`
        )
        .join("");
    }

    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("detail-open");
    if (closeBtn) closeBtn.focus();
  }

  function closeDetail() {
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("detail-open");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter || "all"));
  });

  document.querySelectorAll("[data-open-entry]").forEach((btn) => {
    btn.addEventListener("click", () => openDetail(btn.getAttribute("data-open-entry")));
  });

  if (closeBtn) closeBtn.addEventListener("click", closeDetail);

  if (backdrop) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeDetail();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetail();
      if (siteNav && siteNav.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  if (panel) {
    panel.addEventListener("click", (event) => event.stopPropagation());
  }

  applyFilter("all");
})();
