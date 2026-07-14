(() => {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("detail-panel");
  const panelTitle = document.getElementById("panel-title");
  const panelBody = document.getElementById("panel-body");
  const panelClose = document.getElementById("panel-close");

  const notes = {
    "outer-banks": {
      title: "Outer Banks, before the wind shifts",
      body: [
        "We spent four days on a barrier island where the road ends in sand and the forecast is more suggestion than plan. The kit that stayed useful was simple: a shell that sealed out spray without cooking you, a dry sack that floated when the skiff took a wave, and layers you could rinse and wear again by afternoon.",
        "Tideline pieces are cut for that kind of day—long exposure, mixed wet and dry work, and no patience for fragile hardware. Field notes like this one feed the next pattern revision, not a marketing calendar."
      ]
    },
    "cold-water": {
      title: "Cold-water layers that still move",
      body: [
        "Pacific mornings under 55°F punish stiff fabric. Our midlayers use a dense knit that traps heat when you are still on the beach, then dumps moisture once you start paddling. Seams sit off the shoulders so a board bag strap does not saw through them.",
        "We test every revision on dawn sessions and long drives home in damp clothes. If it only looks coastal, it does not ship."
      ]
    },
    "pack-light": {
      title: "Pack light for remote breaks",
      body: [
        "When the trail to the cove is longer than the session, every ounce earns its keep. Our duffels collapse flat, shrug off grit, and open wide enough for a folded wetsuit without a wrestling match.",
        "The rule is the same as the tagline: goods made for water without walls—places where the map fades and the tide sets the schedule."
      ]
    }
  };

  const goods = {
    "harbor-shell": {
      title: "Harbor Shell",
      body: [
        "A three-season coastal shell with a matte face cloth, taped critical seams, and a hem that cinches over a harness or boardshorts. Two-way zip, storm flap, and pockets high enough to clear a spray deck.",
        "Built for put-ins, ferry decks, and windy overlooks—not fashion weeks. Available in Tide Navy and Drift Sand."
      ]
    },
    "break-duffel": {
      title: "Break Duffel 45L",
      body: [
        "Welded base panel, drain grommets, and shoulder straps that stow when you want a clean grab-handle bag. Holds a damp suit, towel, and a day's layers without turning the car into a tide pool.",
        "Field weight: 1.1 lb. Volume: 45 liters. Hardware is marine-grade and replaceable."
      ]
    },
    "salt-knit": {
      title: "Salt Knit Crew",
      body: [
        "A midweight crew that layers under shells and over rashguards. Yarn holds shape after salt rinse cycles; cuffs stay put when you paddle. No logos loud enough to spoil a quiet beach.",
        "Cut slightly long in the back for seated boat days. Colors: Kelp, Foam, and Charcoal Tide."
      ]
    }
  };

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setNavOpen(false);
    });
  }

  function openPanel(entry) {
    if (!panel || !panelTitle || !panelBody || !entry) return;
    panelTitle.textContent = entry.title;
    panelBody.innerHTML = "";
    entry.body.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      panelBody.appendChild(p);
    });
    panel.classList.add("is-open");
    panel.hidden = false;
    panel.setAttribute("tabindex", "-1");
    panel.focus({ preventScroll: false });
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function closePanel() {
    if (!panel) return;
    panel.classList.remove("is-open");
    panel.hidden = true;
  }

  document.querySelectorAll("[data-note]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const key = el.getAttribute("data-note");
      openPanel(notes[key]);
    });
  });

  document.querySelectorAll("[data-good]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const key = el.getAttribute("data-good");
      openPanel(goods[key]);
    });
  });

  if (panelClose) {
    panelClose.addEventListener("click", closePanel);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanel();
  });

  // Active section highlight for in-page nav
  const sections = ["goods", "field-notes", "approach", "outposts"];
  const navLinks = sections
    .map((id) => document.querySelector(`.site-nav a[href="#${id}"]`))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navLinks.length) {
    const map = new Map(
      sections.map((id) => [id, document.querySelector(`.site-nav a[href="#${id}"]`)])
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const link = map.get(entry.target.id);
          if (!link) return;
          navLinks.forEach((n) => n.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "page");
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
    );
    sections.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
  }
})();
