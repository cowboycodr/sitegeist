(() => {
	"use strict";

	// --- Synthetic but deterministic civic dataset ---------------------------
	// A tiny seeded generator keeps figures stable across reloads so the
	// dashboard reads like a real feed rather than random noise.
	function seeded(seed) {
		let s = seed % 2147483647;
		if (s <= 0) s += 2147483646;
		return () => (s = (s * 16807) % 2147483647) / 2147483647;
	}

	const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

	const DISTRICTS = [
		{ id: "riverside", name: "Riverside" },
		{ id: "old-town", name: "Old Town" },
		{ id: "harbor", name: "Harbor" },
		{ id: "northgate", name: "Northgate" },
		{ id: "meadows", name: "The Meadows" },
		{ id: "junction", name: "Junction" },
	];

	const SIGNALS = [
		{
			id: "budget",
			name: "Budget",
			accent: "#f4b740",
			unit: "% delivered",
			base: 64,
			swing: 18,
			better: "up",
			format: (v) => v.toFixed(0),
			note: "Share of the district capital budget spent on schedule.",
			metric: "Committed spend",
		},
		{
			id: "housing",
			name: "Housing",
			accent: "#4fd1c5",
			unit: "permits / mo",
			base: 42,
			swing: 26,
			better: "up",
			format: (v) => v.toFixed(0),
			note: "New residential permits issued, all unit types combined.",
			metric: "Permits issued",
		},
		{
			id: "transit",
			name: "Transit",
			accent: "#7bd88f",
			unit: "% on-time",
			base: 82,
			swing: 12,
			better: "up",
			format: (v) => v.toFixed(0),
			note: "Buses and light rail arriving within four minutes of schedule.",
			metric: "On-time rate",
		},
		{
			id: "participation",
			name: "Participation",
			accent: "#f2788f",
			unit: "% of adults",
			base: 27,
			swing: 20,
			better: "up",
			format: (v) => v.toFixed(0),
			note: "Residents who joined a hearing, survey, or budget vote.",
			metric: "Engaged residents",
		},
	];

	function series(districtIndex, signal, sig) {
		const rnd = seeded((districtIndex + 3) * 97 + signal.charCodeAt(0) * 13);
		const out = [];
		let level = sig.base + (rnd() - 0.5) * sig.swing;
		const drift = (rnd() - 0.45) * (sig.swing / 12);
		for (let i = 0; i < 12; i += 1) {
			level += drift + (rnd() - 0.5) * (sig.swing / 3);
			level = Math.max(2, level);
			out.push(Math.round(level * 10) / 10);
		}
		return out;
	}

	// Pre-compute the whole dataset.
	const DATA = DISTRICTS.map((d, di) => ({
		...d,
		signals: SIGNALS.map((s) => ({ id: s.id, values: series(di, s.id, s) })),
	}));

	// --- State ---------------------------------------------------------------
	let districtIndex = 0;
	let signalIndex = -1; // -1 = city overview across signals

	const tabs = document.getElementById("district-tabs");
	const grid = document.getElementById("signal-grid");
	const chart = document.getElementById("chart");
	const chartAxis = document.getElementById("chart-axis");
	const detailTitle = document.getElementById("detail-title");
	const detailMeta = document.getElementById("detail-meta");
	const detailStats = document.getElementById("detail-stats");
	const toast = document.getElementById("toast");
	const stamp = document.getElementById("stamp");

	const svgNS = "http://www.w3.org/2000/svg";
	const el = (tag, attrs) => {
		const node = document.createElementNS(svgNS, tag);
		for (const k in attrs) node.setAttribute(k, attrs[k]);
		return node;
	};

	function valuesFor(di, si) {
		return DATA[di].signals[si].values;
	}

	function delta(values) {
		const first = values[0];
		const last = values[values.length - 1];
		return first === 0 ? 0 : ((last - first) / first) * 100;
	}

	// --- Sparkline for cards -------------------------------------------------
	function sparkPath(values, w, h, pad) {
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = max - min || 1;
		return values
			.map((v, i) => {
				const x = pad + (i / (values.length - 1)) * (w - pad * 2);
				const y = h - pad - ((v - min) / span) * (h - pad * 2);
				return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(" ");
	}

	// --- Render the district tabs -------------------------------------------
	function renderTabs() {
		tabs.textContent = "";
		DISTRICTS.forEach((d, i) => {
			const b = document.createElement("button");
			b.className = "chip";
			b.type = "button";
			b.textContent = d.name;
			b.setAttribute("role", "tab");
			b.id = `tab-${d.id}`;
			b.setAttribute("aria-selected", String(i === districtIndex));
			b.tabIndex = i === districtIndex ? 0 : -1;
			b.addEventListener("click", () => selectDistrict(i));
			b.addEventListener("keydown", (e) => {
				if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
					e.preventDefault();
					const dir = e.key === "ArrowRight" ? 1 : -1;
					const next = (districtIndex + dir + DISTRICTS.length) % DISTRICTS.length;
					selectDistrict(next);
					tabs.children[next].focus();
				}
			});
			tabs.appendChild(b);
		});
	}

	// --- Render signal cards -------------------------------------------------
	function renderCards() {
		grid.textContent = "";
		SIGNALS.forEach((s, si) => {
			const values = valuesFor(districtIndex, si);
			const latest = values[values.length - 1];
			const d = delta(values);
			const up = d >= 0;

			const card = document.createElement("button");
			card.className = "card";
			card.type = "button";
			card.style.setProperty("--accent", s.accent);
			card.setAttribute("aria-pressed", String(si === signalIndex));
			card.setAttribute("aria-label",
				`${s.name} in ${DISTRICTS[districtIndex].name}: ${s.format(latest)} ${s.unit}, ` +
				`${up ? "up" : "down"} ${Math.abs(d).toFixed(0)} percent over twelve months. Open detail.`);

			const top = document.createElement("div");
			top.className = "card__top";
			top.innerHTML = `<span class="card__name">${s.name}</span>` +
				`<span class="card__badge">${s.metric}</span>`;

			const value = document.createElement("div");
			value.innerHTML = `<span class="card__value">${s.format(latest)}</span> ` +
				`<span class="card__unit">${s.unit}</span>`;

			const dl = document.createElement("div");
			dl.className = `card__delta ${up ? "up" : "down"}`;
			dl.textContent = `${up ? "▲" : "▼"} ${Math.abs(d).toFixed(1)}% YoY`;

			const spark = el("svg", { class: "card__spark", viewBox: "0 0 220 40", preserveAspectRatio: "none" });
			spark.setAttribute("aria-hidden", "true");
			spark.appendChild(el("path", {
				d: sparkPath(values, 220, 40, 4),
				fill: "none",
				stroke: s.accent,
				"stroke-width": "2.5",
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
			}));

			const note = document.createElement("p");
			note.className = "card__note";
			note.textContent = s.note;

			card.append(top, value, dl, spark, note);
			card.addEventListener("click", () => selectSignal(si));
			grid.appendChild(card);
		});
	}

	// --- Render the detail chart --------------------------------------------
	function renderDetail() {
		chart.textContent = "";
		const W = 720, H = 240, padL = 8, padR = 8, padT = 16, padB = 16;

		let seriesList;
		if (signalIndex === -1) {
			detailTitle.textContent = `${DISTRICTS[districtIndex].name} · city overview`;
			detailMeta.textContent = "All four signal families over the last twelve months. Tap a card to isolate one.";
			seriesList = SIGNALS.map((s, si) => ({ color: s.accent, values: valuesFor(districtIndex, si) }));
		} else {
			const s = SIGNALS[signalIndex];
			detailTitle.textContent = `${DISTRICTS[districtIndex].name} · ${s.name}`;
			detailMeta.textContent = s.note;
			seriesList = [{ color: s.accent, values: valuesFor(districtIndex, signalIndex) }];
		}
		chart.setAttribute("aria-label",
			`Twelve-month trend chart for ${detailTitle.textContent.replace(" · ", ", ")}.`);

		// Shared scale so overview lines are comparable in shape.
		seriesList.forEach((entry) => {
			const values = entry.values;
			const min = Math.min(...values);
			const max = Math.max(...values);
			const span = max - min || 1;
			const point = (v, i) => {
				const x = padL + (i / (values.length - 1)) * (W - padL - padR);
				const y = H - padB - ((v - min) / span) * (H - padT - padB);
				return [x, y];
			};

			// gridlines (only once)
			if (entry === seriesList[0]) {
				for (let g = 0; g <= 3; g += 1) {
					const y = padT + (g / 3) * (H - padT - padB);
					chart.appendChild(el("line", {
						x1: padL, x2: W - padR, y1: y, y2: y,
						stroke: "rgba(255,255,255,0.06)", "stroke-width": "1",
					}));
				}
			}

			const dPath = values.map((v, i) => {
				const [x, y] = point(v, i);
				return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
			}).join(" ");

			if (seriesList.length === 1) {
				const [, y0] = point(values[0], 0);
				const [xEnd] = point(values[values.length - 1], values.length - 1);
				chart.appendChild(el("path", {
					d: `${dPath} L${xEnd.toFixed(1)} ${H - padB} L${padL} ${H - padB} Z`,
					fill: entry.color, "fill-opacity": "0.12", stroke: "none",
				}));
			}

			chart.appendChild(el("path", {
				d: dPath, fill: "none", stroke: entry.color,
				"stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round",
			}));

			// endpoint marker
			const [ex, ey] = point(values[values.length - 1], values.length - 1);
			chart.appendChild(el("circle", { cx: ex, cy: ey, r: "4.5", fill: entry.color }));
		});

		chartAxis.textContent = "";
		[0, 3, 6, 9, 11].forEach((i) => {
			const span = document.createElement("span");
			span.textContent = MONTHS[i];
			chartAxis.appendChild(span);
		});

		renderStats();
	}

	function renderStats() {
		detailStats.textContent = "";
		const rows = [];
		if (signalIndex === -1) {
			SIGNALS.forEach((s, si) => {
				const v = valuesFor(districtIndex, si);
				rows.push([s.name, `${s.format(v[v.length - 1])} ${s.unit}`]);
			});
		} else {
			const s = SIGNALS[signalIndex];
			const v = valuesFor(districtIndex, signalIndex);
			const d = delta(v);
			rows.push(["Latest", `${s.format(v[v.length - 1])} ${s.unit}`]);
			rows.push(["12-mo low", `${s.format(Math.min(...v))}`]);
			rows.push(["12-mo high", `${s.format(Math.max(...v))}`]);
			rows.push(["Change", `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`]);
		}
		rows.forEach(([dt, dd]) => {
			const wrap = document.createElement("div");
			const t = document.createElement("dt");
			t.textContent = dt;
			const d = document.createElement("dd");
			d.textContent = dd;
			wrap.append(t, d);
			detailStats.appendChild(wrap);
		});
	}

	// --- Actions -------------------------------------------------------------
	function selectDistrict(i) {
		districtIndex = i;
		Array.from(tabs.children).forEach((c, idx) => {
			c.setAttribute("aria-selected", String(idx === i));
			c.tabIndex = idx === i ? 0 : -1;
		});
		renderCards();
		renderDetail();
	}

	function selectSignal(si) {
		signalIndex = signalIndex === si ? -1 : si;
		Array.from(grid.children).forEach((c, idx) =>
			c.setAttribute("aria-pressed", String(idx === signalIndex)));
		renderDetail();
		document.querySelector(".detail").scrollIntoView({
			behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
			block: "nearest",
		});
	}

	// --- Open-data download (built entirely client-side, no network) --------
	let toastTimer = 0;
	function showToast(msg) {
		toast.hidden = false;
		toast.textContent = msg;
		requestAnimationFrame(() => toast.classList.add("show"));
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => { toast.hidden = true; }, 250);
		}, 2600);
	}

	function buildCSV() {
		const lines = ["district,signal,month,value,unit"];
		DATA.forEach((d) => {
			d.signals.forEach((sig, si) => {
				const meta = SIGNALS[si];
				sig.values.forEach((v, mi) => {
					lines.push(`${d.name},${meta.name},${MONTHS[mi]},${v},${meta.unit}`);
				});
			});
		});
		return lines.join("\n");
	}

	document.querySelector("[data-download]").addEventListener("click", (e) => {
		e.preventDefault();
		try {
			const blob = new Blob([buildCSV()], { type: "text/csv" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "agora-index-open-data.csv";
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			showToast("Open dataset downloaded — 288 rows, CC BY 4.0.");
		} catch (err) {
			showToast("Download unavailable in this viewer.");
		}
	});

	// --- Bridge: reduce visual motion while a pull gesture is active ---------
	document.addEventListener("sitegeist:pull-state", (e) => {
		document.body.style.setProperty("scroll-behavior", e.detail.active ? "auto" : "");
	});

	// --- Init ----------------------------------------------------------------
	function pad(n) { return String(n).padStart(2, "0"); }
	const now = new Date();
	stamp.innerHTML = `<strong>Snapshot</strong> ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:00 local`;

	renderTabs();
	renderCards();
	renderDetail();
})();
