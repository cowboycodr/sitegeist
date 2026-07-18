(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- transit: on-time performance by corridor ---------- */

  const OTP = {
    d30: {
      label: "last 30 days",
      average: 87,
      routes: [
        { name: "Line 1", detail: "Riverfront – Depot", value: 92 },
        { name: "Line 4", detail: "Crosstown", value: 89 },
        { name: "Line 7", detail: "University loop", value: 86 },
        { name: "Line 12", detail: "Eastgate express", value: 84 },
        { name: "Line 19", detail: "Millbrook local", value: 78 },
      ],
      note: "Signal priority on Line 1 and Line 4 went live in May; both corridors now clear the 80% goal comfortably.",
    },
    d90: {
      label: "last 90 days",
      average: 84,
      routes: [
        { name: "Line 1", detail: "Riverfront – Depot", value: 89 },
        { name: "Line 4", detail: "Crosstown", value: 86 },
        { name: "Line 7", detail: "University loop", value: 84 },
        { name: "Line 12", detail: "Eastgate express", value: 81 },
        { name: "Line 19", detail: "Millbrook local", value: 74 },
      ],
      note: "Quarter average lifted by the spring schedule rewrite; Line 19 still loses time at the Millbrook rail crossing.",
    },
    d365: {
      label: "past 12 months",
      average: 80,
      routes: [
        { name: "Line 1", detail: "Riverfront – Depot", value: 84 },
        { name: "Line 4", detail: "Crosstown", value: 82 },
        { name: "Line 7", detail: "University loop", value: 80 },
        { name: "Line 12", detail: "Eastgate express", value: 77 },
        { name: "Line 19", detail: "Millbrook local", value: 70 },
      ],
      note: "A full year of AVL pings shows steady gains each quarter since the fleet telemetry upgrade last August.",
    },
  };

  const routeList = document.getElementById("route-list");
  const summary = document.getElementById("transit-summary");
  const tabs = Array.from(document.querySelectorAll(".seg__btn"));

  const renderWindow = (key) => {
    const data = OTP[key];
    if (!data || !routeList) return;
    routeList.textContent = "";
    data.routes.forEach((route) => {
      const li = document.createElement("li");
      li.className = "route-row";

      const name = document.createElement("span");
      name.className = "route-row__name";
      name.textContent = route.name;
      const detail = document.createElement("small");
      detail.textContent = route.detail;
      name.appendChild(detail);

      const track = document.createElement("div");
      track.className = "route-row__track";
      const bar = document.createElement("div");
      bar.className = "route-row__bar" + (route.value >= 80 ? " is-good" : "");
      track.appendChild(bar);

      const val = document.createElement("span");
      val.className = "route-row__val";
      val.textContent = route.value + "%";

      li.append(name, track, val);
      routeList.appendChild(li);

      const setWidth = () => { bar.style.width = route.value + "%"; };
      if (reduceMotion) setWidth();
      else requestAnimationFrame(() => requestAnimationFrame(setWidth));
    });
    summary.textContent = "";
    const strong = document.createElement("strong");
    strong.textContent = `System average: ${data.average}% on time (${data.label}).`;
    summary.append(strong, " " + data.note);
  };

  const selectTab = (tab) => {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    document.getElementById("transit-panel")?.setAttribute("aria-labelledby", tab.id);
    renderWindow(tab.dataset.window);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  renderWindow("d30");

  /* ---------- participation: sortable ward table ---------- */

  const WARDS = [
    { ward: "Ward 1 · Riverfront", turnout: 41, attend: 220, change: 3.1 },
    { ward: "Ward 2 · Old Mill", turnout: 37, attend: 145, change: -1.2 },
    { ward: "Ward 3 · Northgate", turnout: 52, attend: 310, change: 4.8 },
    { ward: "Ward 4 · Fairfield", turnout: 29, attend: 96, change: 0.4 },
    { ward: "Ward 5 · University", turnout: 33, attend: 188, change: 6.2 },
    { ward: "Ward 6 · Eastgate", turnout: 46, attend: 174, change: -0.8 },
    { ward: "Ward 7 · Harbor", turnout: 39, attend: 152, change: 1.9 },
    { ward: "Ward 8 · Millbrook", turnout: 26, attend: 81, change: 2.4 },
    { ward: "Ward 9 · Cedar Hills", turnout: 55, attend: 236, change: 0.9 },
    { ward: "Ward 10 · Southline", turnout: 31, attend: 118, change: -2.1 },
    { ward: "Ward 11 · Parkside", turnout: 48, attend: 265, change: 1.4 },
    { ward: "Ward 12 · The Flats", turnout: 35, attend: 155, change: 5.0 },
  ];

  const tbody = document.querySelector("#ward-table tbody");
  const sortButtons = Array.from(document.querySelectorAll(".sort-btn"));
  let sortKey = "ward";
  let sortAsc = true;

  const formatChange = (value) =>
    (value > 0 ? "+" : value < 0 ? "−" : "") + Math.abs(value).toFixed(1) + " pts";

  const renderTable = () => {
    const rows = WARDS.slice().sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === "string" ? va.localeCompare(vb, undefined, { numeric: true }) : va - vb;
      return sortAsc ? cmp : -cmp;
    });
    tbody.textContent = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");

      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = row.ward;

      const turnout = document.createElement("td");
      turnout.className = "num";
      const cell = document.createElement("div");
      cell.className = "bar-cell";
      const label = document.createElement("span");
      label.textContent = row.turnout + "%";
      const track = document.createElement("div");
      track.className = "bar-cell__track";
      track.setAttribute("aria-hidden", "true");
      const fill = document.createElement("div");
      fill.className = "bar-cell__fill";
      fill.style.width = row.turnout + "%";
      track.appendChild(fill);
      cell.append(label, track);
      turnout.appendChild(cell);

      const attend = document.createElement("td");
      attend.className = "num";
      attend.textContent = String(row.attend);

      const change = document.createElement("td");
      change.className = "num";
      change.textContent = formatChange(row.change);
      change.style.color = row.change > 0 ? "#1e7d43" : row.change < 0 ? "#b23a2a" : "";

      tr.append(th, turnout, attend, change);
      tbody.appendChild(tr);
    });

    sortButtons.forEach((btn) => {
      const active = btn.dataset.key === sortKey;
      btn.querySelector(".sort-arrow").textContent = active ? (sortAsc ? "▲" : "▼") : "";
      btn.closest("th").setAttribute(
        "aria-sort",
        active ? (sortAsc ? "ascending" : "descending") : "none",
      );
    });
  };

  sortButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (key === sortKey) sortAsc = !sortAsc;
      else {
        sortKey = key;
        sortAsc = btn.dataset.type === "text";
      }
      renderTable();
    });
  });

  renderTable();

  /* ---------- count-up numbers (skipped under reduced motion) ---------- */

  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll("[data-count]");
    const animate = (el) => {
      const end = Number(el.dataset.count);
      const finalText = el.textContent;
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        if (t < 1) {
          el.textContent = Math.round(end * eased).toLocaleString("en-US");
          requestAnimationFrame(tick);
        } else {
          el.textContent = finalText;
        }
      };
      requestAnimationFrame(tick);
    };
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animate(entry.target);
        }
      });
    }, { threshold: 0.6 });
    targets.forEach((el) => observer.observe(el));
  }
})();
