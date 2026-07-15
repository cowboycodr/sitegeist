(() => {
  "use strict";

  // Route data — each has a hand-drawn contour path for the mini map.
  const routes = [
    {
      id: "gravel",
      label: "Gravel",
      name: "Nordmarka Long",
      tagline: "Forest gravel · lakeside",
      copy: "Ninety kilometres of pine, packed dirt and cold lakes north of the city. The route the club was built around, ridden in every season since 2016.",
      metrics: [["88 km", "Distance"], ["1 240 m", "Climbing"], ["Endurance", "Effort"]],
      path: "M20 150 C60 120 70 170 110 150 S160 90 200 110 S250 170 290 130 S340 80 380 100",
      accent: "#f3a53f",
    },
    {
      id: "coast",
      label: "Coastal",
      name: "Fjord Perimeter",
      tagline: "Tarmac · sea air",
      copy: "A flowing loop that hugs the Oslofjord shoreline, trading elevation for the widest horizons in the club catalogue. Ideal for a first fast day.",
      metrics: [["64 km", "Distance"], ["410 m", "Climbing"], ["Spirited", "Effort"]],
      path: "M20 120 C70 100 90 60 140 80 S210 150 260 120 S330 60 380 90",
      accent: "#63d3e6",
    },
    {
      id: "climb",
      label: "Climbing",
      name: "Grefsenkollen Stack",
      tagline: "Switchbacks · panorama",
      copy: "Three linked climbs to the ridge above Oslo, rewarded with a bakery and a view over the whole basin. Steep, honest, and lit for autumn evenings.",
      metrics: [["47 km", "Distance"], ["1 020 m", "Climbing"], ["Hard", "Effort"]],
      path: "M20 230 L90 220 L120 150 L170 165 L200 90 L250 105 L280 55 L380 60",
      accent: "#ffcd86",
    },
    {
      id: "night",
      label: "Night",
      name: "Aurora Circuit",
      tagline: "Lit paths · winter",
      copy: "A safe, well-lit winter loop on cleared cycle paths. Reflective kit is compulsory; the pace stays social so the group holds together in the dark.",
      metrics: [["36 km", "Distance"], ["260 m", "Climbing"], ["Social", "Effort"]],
      path: "M20 150 C80 150 90 100 150 120 S200 180 250 150 S320 110 380 140",
      accent: "#9db0d2",
    },
  ];

  const tabsEl = document.getElementById("route-tabs");
  const panelsEl = document.getElementById("route-panels");
  if (!tabsEl || !panelsEl) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const tabs = [];
  const panels = [];

  const buildMap = (route) => {
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 400 280");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("aria-hidden", "true");

    // background contour lines
    const contours = ["M0 210 Q120 180 200 205 T400 190", "M0 160 Q140 120 220 150 T400 130", "M0 110 Q120 80 210 100 T400 80"];
    contours.forEach((d) => {
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", "#23375f");
      p.setAttribute("stroke-width", "1.2");
      svg.appendChild(p);
    });

    // the route line
    const line = document.createElementNS(svgNS, "path");
    line.setAttribute("d", route.path);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", route.accent);
    line.setAttribute("stroke-width", "3.5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    svg.appendChild(line);

    // start + end markers
    const mk = (cx, cy, r, fill) => {
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", cx); c.setAttribute("cy", cy);
      c.setAttribute("r", r); c.setAttribute("fill", fill);
      svg.appendChild(c);
    };
    mk(20, route.id === "gravel" ? 150 : route.id === "climb" ? 230 : 150, 5, "#63d3e6");
    mk(380, route.id === "gravel" ? 100 : route.id === "coast" ? 90 : route.id === "climb" ? 60 : 140, 6, route.accent);
    return svg;
  };

  routes.forEach((route, index) => {
    const tab = document.createElement("button");
    tab.className = "tab";
    tab.type = "button";
    tab.textContent = route.label;
    tab.id = "tab-" + route.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "panel-" + route.id);
    tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
    tab.tabIndex = index === 0 ? 0 : -1;
    tabsEl.appendChild(tab);
    tabs.push(tab);

    const panel = document.createElement("div");
    panel.className = "route-panel";
    panel.id = "panel-" + route.id;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", "tab-" + route.id);
    panel.tabIndex = 0;
    if (index !== 0) panel.hidden = true;

    const map = document.createElement("div");
    map.className = "route-map";
    map.appendChild(buildMap(route));

    const facts = document.createElement("div");
    facts.className = "route-facts";
    const metricsHtml = route.metrics
      .map((m) => `<div class="metric"><b>${m[0]}</b><span>${m[1]}</span></div>`)
      .join("");
    facts.innerHTML =
      `<div class="tagline">${route.tagline}</div>` +
      `<h3>${route.name}</h3>` +
      `<p>${route.copy}</p>` +
      `<div class="metrics">${metricsHtml}</div>`;

    panel.appendChild(map);
    panel.appendChild(facts);
    panelsEl.appendChild(panel);
    panels.push(panel);
  });

  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on && focus) tab.focus();
    });
  };

  tabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    select(tabs.indexOf(tab), false);
  });

  tabsEl.addEventListener("keydown", (e) => {
    const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    if (current < 0) return;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next !== null) { e.preventDefault(); select(next, true); }
  });

  // Next-ride panel: pick the soonest of the fixed weekly rides.
  const schedule = [
    { dow: 2, hour: 18, min: 30, name: "Tuesday · Torshov Intervals", when: "18:30 · Sofienbergparken gate" },
    { dow: 4, hour: 18, min: 0, name: "Thursday · Fjord Recovery", when: "18:00 · Aker Brygge, by the clock" },
    { dow: 0, hour: 9, min: 0, name: "Sunday · Nordmarka Long", when: "09:00 · Frognerseteren station" },
  ];
  const now = new Date();
  let best = null, bestDelta = Infinity;
  schedule.forEach((r) => {
    let delta = (r.dow - now.getDay() + 7) % 7;
    const cand = new Date(now);
    cand.setDate(now.getDate() + delta);
    cand.setHours(r.hour, r.min, 0, 0);
    if (cand <= now) cand.setDate(cand.getDate() + 7);
    const ms = cand - now;
    if (ms < bestDelta) { bestDelta = ms; best = r; }
  });
  if (best) {
    const nameEl = document.getElementById("next-ride-name");
    const whenEl = document.getElementById("next-ride-when");
    if (nameEl) nameEl.textContent = best.name;
    if (whenEl) whenEl.textContent = best.when;
  }
})();
