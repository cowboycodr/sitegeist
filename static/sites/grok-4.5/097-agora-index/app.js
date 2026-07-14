(() => {
  "use strict";

  const cities = {
    harbor: {
      name: "Harbor City",
      index: 72,
      population: "1.24M",
      updated: "Today, 09:00",
      stats: {
        budgetClarity: { value: "78", delta: "+3.2", dir: "up" },
        housingAccess: { value: "61", delta: "−1.4", dir: "down" },
        transitReliability: { value: "84", delta: "+0.8", dir: "up" },
        participation: { value: "69", delta: "+5.1", dir: "up" },
      },
      signals: {
        budget: { score: 78, blurb: "Capital plans published on schedule; operating variance under 4%." },
        housing: { score: 61, blurb: "Permits up, but affordable unit completions lag target by 18%." },
        transit: { score: 84, blurb: "On-time rail strong; late-night bus gaps remain on two corridors." },
        civic: { score: 69, blurb: "Hearing turnout rising; digital comment volume doubled year over year." },
      },
      budgetBars: [
        { name: "Housing", pct: 22, label: "22%" },
        { name: "Transit", pct: 28, label: "28%" },
        { name: "Public safety", pct: 18, label: "18%" },
        { name: "Parks & open", pct: 9, label: "9%" },
        { name: "Education", pct: 15, label: "15%" },
        { name: "Other", pct: 8, label: "8%" },
      ],
      trendPoints: [58, 60, 59, 63, 65, 64, 68, 70, 69, 71, 72, 72],
      housingPoints: [70, 68, 67, 66, 65, 64, 63, 62, 62, 61, 61, 61],
      trends: [
        { kind: "pos", mark: "↑", title: "Open budget pack released", detail: "Full capital schedule with ward-level maps.", meta: "2d" },
        { kind: "neu", mark: "·", title: "Housing lottery window open", detail: "3,120 applicants for 410 units this cycle.", meta: "5d" },
        { kind: "neg", mark: "↓", title: "Bus line 14 reliability dip", detail: "Weekend on-time fell to 71% after detours.", meta: "1w" },
        { kind: "pos", mark: "↑", title: "Neighborhood assembly quorum", detail: "14 of 16 districts met participation threshold.", meta: "2w" },
      ],
      participation: [
        { num: "41k", label: "Public comments YTD", note: "Across hearings, portal, and mail." },
        { num: "62%", label: "Hearing livestream views", note: "Share of agenda items with archive." },
        { num: "9.4", label: "Days to post minutes", note: "Median after session close." },
      ],
      table: [
        { metric: "Capital transparency", domain: "Budget", score: 86, level: "high", change: "+4" },
        { metric: "Affordable pipeline", domain: "Housing", score: 54, level: "mid", change: "−2" },
        { metric: "Peak rail on-time", domain: "Transit", score: 91, level: "high", change: "+1" },
        { metric: "Bus frequency equity", domain: "Transit", score: 73, level: "high", change: "0" },
        { metric: "Hearing accessibility", domain: "Participation", score: 68, level: "mid", change: "+6" },
        { metric: "FOIA median days", domain: "Participation", score: 57, level: "mid", change: "−3" },
      ],
    },
    ridge: {
      name: "Ridge County",
      index: 65,
      population: "812k",
      updated: "Today, 08:40",
      stats: {
        budgetClarity: { value: "71", delta: "+1.0", dir: "up" },
        housingAccess: { value: "58", delta: "−0.6", dir: "down" },
        transitReliability: { value: "63", delta: "+2.4", dir: "up" },
        participation: { value: "74", delta: "+3.8", dir: "up" },
      },
      signals: {
        budget: { score: 71, blurb: "Program budgets readable; multi-year forecast still incomplete." },
        housing: { score: 58, blurb: "ADU approvals climbing; rent burden remains high in three towns." },
        transit: { score: 63, blurb: "New BRT spine on track; rural fixed-route coverage still thin." },
        civic: { score: 74, blurb: "Town halls well attended; participatory budget cycle fully online." },
      },
      budgetBars: [
        { name: "Housing", pct: 16, label: "16%" },
        { name: "Transit", pct: 21, label: "21%" },
        { name: "Public safety", pct: 24, label: "24%" },
        { name: "Parks & open", pct: 12, label: "12%" },
        { name: "Education", pct: 18, label: "18%" },
        { name: "Other", pct: 9, label: "9%" },
      ],
      trendPoints: [55, 56, 57, 58, 60, 59, 61, 62, 63, 64, 64, 65],
      housingPoints: [64, 63, 62, 61, 60, 60, 59, 59, 58, 58, 58, 58],
      trends: [
        { kind: "pos", mark: "↑", title: "Participatory budget ballots", detail: "18,400 verified votes across 42 projects.", meta: "3d" },
        { kind: "pos", mark: "↑", title: "BRT stations open for review", detail: "Design boards posted in five libraries.", meta: "6d" },
        { kind: "neu", mark: "·", title: "ADU ordinance workshop", detail: "Staff draft open for written comment.", meta: "1w" },
        { kind: "neg", mark: "↓", title: "Shelter bed shortfall", detail: "Winter capacity 12% below demand model.", meta: "2w" },
      ],
      participation: [
        { num: "28k", label: "Public comments YTD", note: "Portal + hybrid meetings." },
        { num: "79%", label: "Hearing livestream views", note: "County board and planning." },
        { num: "6.1", label: "Days to post minutes", note: "Median after session close." },
      ],
      table: [
        { metric: "Capital transparency", domain: "Budget", score: 74, level: "high", change: "+2" },
        { metric: "Affordable pipeline", domain: "Housing", score: 49, level: "low", change: "−1" },
        { metric: "Peak rail on-time", domain: "Transit", score: 0, level: "mid", change: "—" },
        { metric: "Bus frequency equity", domain: "Transit", score: 66, level: "mid", change: "+3" },
        { metric: "Hearing accessibility", domain: "Participation", score: 81, level: "high", change: "+5" },
        { metric: "FOIA median days", domain: "Participation", score: 70, level: "high", change: "+2" },
      ],
    },
    mesa: {
      name: "Mesa Verde",
      index: 81,
      population: "498k",
      updated: "Today, 09:15",
      stats: {
        budgetClarity: { value: "88", delta: "+2.1", dir: "up" },
        housingAccess: { value: "74", delta: "+1.8", dir: "up" },
        transitReliability: { value: "79", delta: "0.0", dir: "flat" },
        participation: { value: "83", delta: "+4.0", dir: "up" },
      },
      signals: {
        budget: { score: 88, blurb: "Open data API mirrors every ledger line; dashboards updated nightly." },
        housing: { score: 74, blurb: "Inclusionary zoning delivering; waitlists shortened in two quarters." },
        transit: { score: 79, blurb: "Light rail on-time steady; first/last-mile micromobility expanding." },
        civic: { score: 83, blurb: "Multilingual notices standard; youth assembly seats filled." },
      },
      budgetBars: [
        { name: "Housing", pct: 26, label: "26%" },
        { name: "Transit", pct: 24, label: "24%" },
        { name: "Public safety", pct: 14, label: "14%" },
        { name: "Parks & open", pct: 11, label: "11%" },
        { name: "Education", pct: 17, label: "17%" },
        { name: "Other", pct: 8, label: "8%" },
      ],
      trendPoints: [70, 71, 73, 74, 75, 76, 77, 78, 79, 80, 80, 81],
      housingPoints: [66, 67, 68, 69, 70, 70, 71, 72, 72, 73, 74, 74],
      trends: [
        { kind: "pos", mark: "↑", title: "Inclusionary units certified", detail: "214 permanently affordable homes this quarter.", meta: "1d" },
        { kind: "pos", mark: "↑", title: "Ledger mirror published", detail: "Machine-readable budget with audit trail.", meta: "4d" },
        { kind: "neu", mark: "·", title: "Micromobility RFP shortlist", detail: "Three operators under public review.", meta: "1w" },
        { kind: "pos", mark: "↑", title: "Youth assembly convened", detail: "Full slate seated; first budget memo issued.", meta: "3w" },
      ],
      participation: [
        { num: "36k", label: "Public comments YTD", note: "Highest per-capita in sample." },
        { num: "88%", label: "Hearing livestream views", note: "With captioned archives." },
        { num: "3.2", label: "Days to post minutes", note: "Median after session close." },
      ],
      table: [
        { metric: "Capital transparency", domain: "Budget", score: 94, level: "high", change: "+3" },
        { metric: "Affordable pipeline", domain: "Housing", score: 77, level: "high", change: "+4" },
        { metric: "Peak rail on-time", domain: "Transit", score: 87, level: "high", change: "0" },
        { metric: "Bus frequency equity", domain: "Transit", score: 80, level: "high", change: "+2" },
        { metric: "Hearing accessibility", domain: "Participation", score: 90, level: "high", change: "+1" },
        { metric: "FOIA median days", domain: "Participation", score: 84, level: "high", change: "+5" },
      ],
    },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function levelClass(level) {
    if (level === "high") return "high";
    if (level === "low") return "low";
    return "mid";
  }

  function levelLabel(level) {
    if (level === "high") return "Strong";
    if (level === "low") return "Watch";
    return "Mixed";
  }

  function buildSparkline(points, pointsB) {
    const w = 480;
    const h = 120;
    const pad = 8;
    const all = points.concat(pointsB);
    const min = Math.min(...all) - 4;
    const max = Math.max(...all) + 4;
    const sx = (i, len) => pad + (i / (len - 1)) * (w - pad * 2);
    const sy = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);

    const path = (arr, close) => {
      const d = arr
        .map((v, i) => `${i === 0 ? "M" : "L"}${sx(i, arr.length).toFixed(1)},${sy(v).toFixed(1)}`)
        .join(" ");
      if (!close) return d;
      return `${d} L${sx(arr.length - 1, arr.length).toFixed(1)},${h - pad} L${sx(0, arr.length).toFixed(1)},${h - pad} Z`;
    };

    return `
      <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Twelve-month composite index and housing access trends">
        <title>Index trend vs housing access</title>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1a7a6d" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#1a7a6d" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${path(points, true)}" fill="url(#areaFill)"/>
        <path d="${path(points, false)}" fill="none" stroke="#1a7a6d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="${path(pointsB, false)}" fill="none" stroke="#a63d4a" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
    `;
  }

  function renderCity(id) {
    const city = cities[id];
    if (!city) return;

    const indexEl = $("#composite-index");
    const popEl = $("#city-population");
    const updatedEl = $("#city-updated");
    const cityNameEls = $$("[data-city-name]");

    if (indexEl) indexEl.textContent = String(city.index);
    if (popEl) popEl.textContent = city.population;
    if (updatedEl) updatedEl.textContent = city.updated;
    cityNameEls.forEach((el) => {
      el.textContent = city.name;
    });

    const statMap = [
      ["stat-budget", city.stats.budgetClarity],
      ["stat-housing", city.stats.housingAccess],
      ["stat-transit", city.stats.transitReliability],
      ["stat-civic", city.stats.participation],
    ];

    statMap.forEach(([key, data]) => {
      const tile = document.querySelector(`[data-stat="${key}"]`);
      if (!tile) return;
      const value = tile.querySelector(".value");
      const delta = tile.querySelector(".delta");
      if (value) value.textContent = data.value;
      if (delta) {
        delta.textContent = `${data.delta} pts`;
        delta.className = `delta ${data.dir}`;
      }
    });

    const signalKeys = ["budget", "housing", "transit", "civic"];
    signalKeys.forEach((key) => {
      const card = document.querySelector(`[data-signal="${key}"]`);
      if (!card) return;
      const s = city.signals[key];
      const score = card.querySelector(".signal-score");
      const blurb = card.querySelector(".signal-blurb");
      const meter = card.querySelector(".meter > span");
      if (score) score.textContent = `${s.score}/100`;
      if (blurb) blurb.textContent = s.blurb;
      if (meter) {
        const host = meter.parentElement;
        if (host && host.hasAttribute("aria-valuenow")) {
          host.setAttribute("aria-valuenow", String(s.score));
        }
        requestAnimationFrame(() => {
          meter.style.width = `${s.score}%`;
        });
      }
    });

    const barChart = $("#budget-bars");
    if (barChart) {
      barChart.innerHTML = city.budgetBars
        .map(
          (row) => `
        <div class="bar-row">
          <div class="name">${row.name}</div>
          <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:0%" data-target="${row.pct}"></div></div>
          <div class="bar-val">${row.label}</div>
        </div>`
        )
        .join("");
      requestAnimationFrame(() => {
        $$(".bar-fill", barChart).forEach((el) => {
          el.style.width = `${el.getAttribute("data-target")}%`;
        });
      });
    }

    const spark = $("#sparkline");
    if (spark) {
      spark.innerHTML = buildSparkline(city.trendPoints, city.housingPoints);
    }

    const trendList = $("#trend-list");
    if (trendList) {
      trendList.innerHTML = city.trends
        .map(
          (t) => `
        <li>
          <div class="trend-icon ${t.kind}" aria-hidden="true">${t.mark}</div>
          <div class="trend-body">
            <strong>${t.title}</strong>
            <span>${t.detail}</span>
          </div>
          <div class="trend-meta">${t.meta}</div>
        </li>`
        )
        .join("");
    }

    const partGrid = $("#part-grid");
    if (partGrid) {
      partGrid.innerHTML = city.participation
        .map(
          (p) => `
        <article class="part-card">
          <div class="eyebrow" style="margin:0">${p.label}</div>
          <div class="num">${p.num}</div>
          <p>${p.note}</p>
        </article>`
        )
        .join("");
    }

    const tbody = $("#metrics-body");
    if (tbody) {
      tbody.innerHTML = city.table
        .map(
          (row) => `
        <tr>
          <td>${row.metric}</td>
          <td>${row.domain}</td>
          <td>${row.score === 0 ? "n/a" : row.score}</td>
          <td><span class="pill ${levelClass(row.level)}">${levelLabel(row.level)}</span></td>
          <td>${row.change}</td>
        </tr>`
        )
        .join("");
    }

    document.title = `Agora Index — ${city.name}`;
  }

  function downloadOpenData() {
    const id = $("#city-select")?.value || "harbor";
    const city = cities[id];
    const payload = {
      source: "Agora Index",
      generated: new Date().toISOString().slice(0, 10),
      city: city.name,
      compositeIndex: city.index,
      population: city.population,
      signals: city.signals,
      budgetShares: city.budgetBars,
      metrics: city.table,
      note: "Illustrative open civic signals for offline demonstration. Not official statistics.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agora-index-${id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setupNav() {
    const toggle = $("#menu-toggle");
    const drawer = $("#nav-drawer");
    if (!toggle || !drawer) return;

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      const label = open ? "Close menu" : "Open menu";
      toggle.setAttribute("aria-label", label);
    };

    toggle.addEventListener("click", () => {
      setOpen(!drawer.classList.contains("is-open"));
    });

    $$("a", drawer).forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function setupSmoothAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (typeof target.focus === "function") {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  function init() {
    const select = $("#city-select");
    if (select) {
      select.addEventListener("change", () => renderCity(select.value));
      renderCity(select.value);
    } else {
      renderCity("harbor");
    }

    $$("[data-action='download']").forEach((btn) => {
      btn.addEventListener("click", downloadOpenData);
    });

    setupNav();
    setupSmoothAnchors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
