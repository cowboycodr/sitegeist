(() => {
	"use strict";

	const seasons = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

	const metrics = {
		temp: {
			label: "Water temp",
			unit: "°C",
			note: "Slack-low readings from Pool 4. A cooler recent trend tracks a run of strong summer upwelling.",
			data: [15.2, 15.6, 16.1, 16.4, 16.0, 15.7, 15.3, 15.5, 15.1],
			decimals: 1,
		},
		diversity: {
			label: "Diversity index",
			unit: "",
			note: "Shannon index across the fixed transect. Recovery follows the return of predatory sea stars to the mid zone.",
			data: [2.41, 2.35, 2.28, 2.19, 2.26, 2.38, 2.52, 2.61, 2.74],
			decimals: 2,
		},
		coverage: {
			label: "Kelp cover",
			unit: "%",
			note: "Percent canopy cover along the low shelf. Cooler, nutrient-rich water has let the understory rebound.",
			data: [58, 52, 47, 39, 44, 51, 60, 66, 71],
			decimals: 0,
		},
	};

	const svgNS = "http://www.w3.org/2000/svg";
	const W = 600, H = 260, padL = 46, padR = 18, padT = 18, padB = 34;

	const lineEl = document.getElementById("chart-line");
	const dotsEl = document.getElementById("chart-dots");
	const gridEl = document.getElementById("chart-grid");
	const xlabEl = document.getElementById("chart-xlabels");
	const metricLabel = document.getElementById("chart-metric-label");
	const latestEl = document.getElementById("chart-latest");
	const noteEl = document.getElementById("chart-note");
	const region = document.getElementById("chart-region");
	const tabs = Array.from(document.querySelectorAll(".chart-tab"));

	function fmt(value, decimals, unit) {
		return value.toFixed(decimals) + (unit ? unit : "");
	}

	function drawChart(key) {
		const m = metrics[key];
		const data = m.data;
		const min = Math.min.apply(null, data);
		const max = Math.max.apply(null, data);
		const span = max - min || 1;
		const lo = min - span * 0.15;
		const hi = max + span * 0.15;
		const plotW = W - padL - padR;
		const plotH = H - padT - padB;

		const x = (i) => padL + (plotW * i) / (data.length - 1);
		const y = (v) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;

		gridEl.textContent = "";
		xlabEl.textContent = "";
		dotsEl.textContent = "";

		for (let g = 0; g <= 4; g += 1) {
			const gy = padT + (plotH * g) / 4;
			const gl = document.createElementNS(svgNS, "line");
			gl.setAttribute("x1", padL);
			gl.setAttribute("x2", W - padR);
			gl.setAttribute("y1", gy);
			gl.setAttribute("y2", gy);
			gridEl.appendChild(gl);
			const val = hi - ((hi - lo) * g) / 4;
			const t = document.createElementNS(svgNS, "text");
			t.setAttribute("x", padL - 8);
			t.setAttribute("y", gy + 4);
			t.setAttribute("text-anchor", "end");
			t.setAttribute("fill", "rgba(7,42,48,0.55)");
			t.setAttribute("font-size", "11");
			t.textContent = val.toFixed(m.decimals);
			gridEl.appendChild(t);
		}

		const points = data.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
		lineEl.setAttribute("points", points);

		data.forEach((v, i) => {
			const c = document.createElementNS(svgNS, "circle");
			c.setAttribute("class", "chart-dot");
			c.setAttribute("cx", x(i).toFixed(1));
			c.setAttribute("cy", y(v).toFixed(1));
			c.setAttribute("r", "4.5");
			const tt = document.createElementNS(svgNS, "title");
			tt.textContent = seasons[i] + ": " + fmt(v, m.decimals, m.unit);
			c.appendChild(tt);
			dotsEl.appendChild(c);

			if (i % 2 === 0 || i === data.length - 1) {
				const xl = document.createElementNS(svgNS, "text");
				xl.setAttribute("x", x(i));
				xl.setAttribute("y", H - 10);
				xl.setAttribute("text-anchor", "middle");
				xl.textContent = seasons[i];
				xlabEl.appendChild(xl);
			}
		});

		metricLabel.textContent = m.label;
		latestEl.textContent = fmt(data[data.length - 1], m.decimals, m.unit) + " · 2026";
		noteEl.textContent = m.note;
	}

	function activate(tab) {
		tabs.forEach((t) => {
			const on = t === tab;
			t.classList.toggle("is-active", on);
			t.setAttribute("aria-selected", on ? "true" : "false");
			t.setAttribute("tabindex", on ? "0" : "-1");
		});
		region.setAttribute("aria-labelledby", tab.id);
		drawChart(tab.dataset.metric);
	}

	tabs.forEach((tab, idx) => {
		tab.addEventListener("click", () => activate(tab));
		tab.addEventListener("keydown", (e) => {
			let next = null;
			if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
			else if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
			if (next) {
				e.preventDefault();
				next.focus();
				activate(next);
			}
		});
	});

	drawChart("temp");

	// Zone explorer
	const zones = [
		{
			name: "Splash zone",
			depth: "Above the waterline · rarely submerged",
			desc: "Sprayed by breaking waves but almost never covered. Life here endures sun, salt, and long hours of dry air.",
			species: ["Periwinkle snail", "Rockweed", "Acorn barnacle", "Lichen crust"],
		},
		{
			name: "High-tide zone",
			depth: "Submerged briefly at high tide",
			desc: "Covered only at the day's highest water. Hardy grazers and filter-feeders wait out the exposure sealed tight.",
			species: ["Ochre sea star", "Aggregating anemone", "Shore crab", "Limpet"],
		},
		{
			name: "Mid-tide zone",
			depth: "Twice-daily rise and fall",
			desc: "The busy middle band, wetted and drained with every tide. Competition for rock space is fierce and colorful.",
			species: ["California mussel", "Gooseneck barnacle", "Hermit crab", "Turban snail"],
		},
		{
			name: "Low-tide zone",
			depth: "Exposed only at the lowest tides",
			desc: "The lush shelf revealed at slack low. Kelp, urchins, and the pool's most delicate specialists shelter here.",
			species: ["Giant green anemone", "Purple urchin", "Feather boa kelp", "Nudibranch"],
		},
	];

	const slider = document.getElementById("zone-slider");
	const zName = document.getElementById("zone-name");
	const zDepth = document.getElementById("zone-depth");
	const zDesc = document.getElementById("zone-desc");
	const zList = document.getElementById("zone-species");

	function showZone(i) {
		const z = zones[i];
		zName.textContent = z.name;
		zDepth.textContent = z.depth;
		zDesc.textContent = z.desc;
		zList.textContent = "";
		z.species.forEach((s) => {
			const li = document.createElement("li");
			li.textContent = s;
			zList.appendChild(li);
		});
	}

	slider.addEventListener("input", () => showZone(Number(slider.value)));
	showZone(0);
})();
