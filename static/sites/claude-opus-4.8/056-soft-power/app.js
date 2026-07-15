(() => {
  "use strict";

  /* Dispatches — rendered from data so the grid stays consistent */
  const dispatches = [
    {
      num: "01",
      title: "The luxury of being unreachable",
      blurb: "Silence became the last status symbol. We priced it.",
      by: "Dara Osei · 7 min read",
    },
    {
      num: "02",
      title: "Everyone's a curator now",
      blurb: "The gallery moved into the group chat, and taste got personal.",
      by: "Lena Fossey · 5 min read",
    },
    {
      num: "03",
      title: "Nostalgia, sold by the yard",
      blurb: "Why the past keeps arriving pre-worn and priced to move.",
      by: "Marcus Vale · 8 min read",
    },
    {
      num: "04",
      title: "The soft launch of a self",
      blurb: "Identity as a rolling release — patched, teased, never quite shipped.",
      by: "Ines Marchetti · 6 min read",
    },
    {
      num: "05",
      title: "Rooms that photograph well",
      blurb: "How the camera quietly redesigned the places we actually live.",
      by: "Lena Fossey · 9 min read",
    },
    {
      num: "06",
      title: "The economy of enthusiasm",
      blurb: "Loving things loudly turned out to be labor. Who's getting paid?",
      by: "Dara Osei · 10 min read",
    },
  ];

  const mount = document.getElementById("cards");
  if (mount) {
    const frag = document.createDocumentFragment();
    for (const d of dispatches) {
      const card = document.createElement("article");
      card.className = "card";

      const num = document.createElement("span");
      num.className = "num";
      num.textContent = "Dispatch " + d.num;

      const h = document.createElement("h3");
      h.textContent = d.title;

      const p = document.createElement("p");
      p.textContent = d.blurb;

      const by = document.createElement("p");
      by.className = "byline";
      by.textContent = d.by;

      card.append(num, h, p, by);
      frag.appendChild(card);
    }
    mount.appendChild(frag);
  }

  /* Theme toggle with reduced, self-contained state */
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    const label = toggle.querySelector(".theme-toggle-label");
    const setTheme = (night) => {
      document.documentElement.setAttribute("data-theme", night ? "night" : "day");
      toggle.setAttribute("aria-pressed", String(night));
      if (label) label.textContent = night ? "Day" : "Night";
    };
    let night = false;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    if (media.matches) night = true;
    setTheme(night);
    toggle.addEventListener("click", () => {
      night = !night;
      setTheme(night);
    });
  }
})();
