"use strict";

(function () {
	const SVGNS = "http://www.w3.org/2000/svg";

	// Station grid (id -> position + population weight in thousands)
	const stations = {
		a: { x: 70, y: 320, pop: 42 },
		b: { x: 170, y: 250, pop: 55 },
		c: { x: 280, y: 210, pop: 88 },
		d: { x: 300, y: 90, pop: 40 },
		e: { x: 420, y: 150, pop: 61 },
		f: { x: 530, y: 90, pop: 34 },
		g: { x: 400, y: 300, pop: 47 },
		h: { x: 520, y: 330, pop: 39 },
		i: { x: 190, y: 120, pop: 45 },
		j: { x: 90, y: 160, pop: 33 },
	};

	const lines = [
		{ id: "spine", name: "Rapid Rail Spine", color: "#35e0d0", path: ["a", "b", "c", "e", "f"] },
		{ id: "cross", name: "Cross-town Bus", color: "#ffb14e", path: ["j", "i", "c", "g", "h"] },
		{ id: "ring", name: "Harbor Ring", color: "#9784ff", path: ["b", "d", "e", "g", "b"] },
		{ id: "shuttle", name: "Neighborhood Shuttle", color: "#8fe36b", path: ["a", "j", "i", "d"] },
	];

	const active = new Set(lines.map((l) => l.id));

	const svg = document.getElementById("net-svg");
	const toggles = document.getElementById("line-toggles");
	const note = document.getElementById("explorer-note");
	if (!svg || !toggles) return;

	const linkLayer = document.createElementNS(SVGNS, "g");
	const stationLayer = document.createElementNS(SVGNS, "g");
	svg.appendChild(linkLayer);
	svg.appendChild(stationLayer);

	// Draw one polyline per line
	const linkEls = {};
	lines.forEach((line) => {
		const el = document.createElementNS(SVGNS, "polyline");
		el.setAttribute("class", "net-link");
		el.setAttribute("stroke", line.color);
		el.setAttribute(
			"points",
			line.path.map((id) => stations[id].x + "," + stations[id].y).join(" ")
		);
		linkLayer.appendChild(el);
		linkEls[line.id] = el;
	});

	// Draw stations
	const stationEls = {};
	Object.keys(stations).forEach((id) => {
		const s = stations[id];
		const c = document.createElementNS(SVGNS, "circle");
		c.setAttribute("class", "net-station");
		c.setAttribute("cx", s.x);
		c.setAttribute("cy", s.y);
		c.setAttribute("r", 9);
		stationLayer.appendChild(c);
		stationEls[id] = c;
	});

	function servedStations() {
		const set = new Set();
		lines.forEach((line) => {
			if (active.has(line.id)) line.path.forEach((id) => set.add(id));
		});
		return set;
	}

	function formatK(n) {
		if (n >= 1000) return (n / 1000).toFixed(1) + "M";
		return n + "K";
	}

	function render() {
		const served = servedStations();

		lines.forEach((line) => {
			linkEls[line.id].classList.toggle("net-dim", !active.has(line.id));
		});
		Object.keys(stations).forEach((id) => {
			stationEls[id].classList.toggle("net-dim", !served.has(id));
		});

		let reach = 0;
		served.forEach((id) => (reach += stations[id].pop));

		setText("stat-stations", served.size);
		setText("stat-reach", formatK(reach));
		setText("stat-lines", active.size);

		if (active.size === 0) {
			note.textContent = "No lines active — turn one on to serve the city.";
		} else if (active.size === lines.length) {
			note.textContent = "Full network: every mode connected into one system.";
		} else {
			note.textContent = active.size + " of " + lines.length + " lines active.";
		}
	}

	function setText(id, value) {
		const el = document.getElementById(id);
		if (el) el.textContent = value;
	}

	// Build toggle buttons
	lines.forEach((line) => {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "line-btn";
		btn.style.setProperty("--c", line.color);
		btn.setAttribute("aria-pressed", "true");
		btn.innerHTML =
			'<span class="swatch" aria-hidden="true"></span>' +
			'<span class="lb-name">' + line.name + "</span>" +
			'<span class="lb-state">On</span>';
		const state = btn.querySelector(".lb-state");
		btn.addEventListener("click", function () {
			if (active.has(line.id)) {
				active.delete(line.id);
				btn.setAttribute("aria-pressed", "false");
				state.textContent = "Off";
			} else {
				active.add(line.id);
				btn.setAttribute("aria-pressed", "true");
				state.textContent = "On";
			}
			render();
		});
		toggles.appendChild(btn);
	});

	render();
})();
