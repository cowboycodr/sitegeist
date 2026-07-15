(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Projects ---- */
	const projects = [
		{
			tag: "Culture",
			name: "Harbour Reading Room",
			desc: "A public library lit by a continuous northern clerestory over the harbour.",
			meta: "Nordhavn · 2024",
			sky: "#cfd8dc", wall: "#e9e1d2", accent: "#e7a34a",
			windows: [[0.18, 0.28, 0.22, 0.5], [0.5, 0.24, 0.34, 0.44]]
		},
		{
			tag: "Living",
			name: "Nine Courtyard Houses",
			desc: "Terraced homes turned inward around planted light-wells and low winter sun.",
			meta: "Amager · 2023",
			sky: "#d9d2c4", wall: "#ded3bf", accent: "#c9772a",
			windows: [[0.12, 0.4, 0.16, 0.42], [0.36, 0.34, 0.16, 0.48], [0.6, 0.4, 0.16, 0.42]]
		},
		{
			tag: "Culture",
			name: "Chapel of Still Air",
			desc: "A crematorium chapel where a single oculus draws the day slowly across lime walls.",
			meta: "Vestre · 2022",
			sky: "#c7cfd1", wall: "#efe8db", accent: "#e7a34a",
			windows: [[0.42, 0.14, 0.16, 0.16, "round"]]
		},
		{
			tag: "Workplace",
			name: "Timber Atelier",
			desc: "A workshop and offices under a folded roof that rakes daylight deep into the plan.",
			meta: "Refshaleøen · 2021",
			sky: "#d2cbbd", wall: "#e3d8c4", accent: "#c9772a",
			windows: [[0.1, 0.5, 0.8, 0.06], [0.16, 0.24, 0.2, 0.2], [0.62, 0.24, 0.22, 0.2]]
		},
		{
			tag: "Living",
			name: "The Long Loft",
			desc: "A warehouse conversion where a lantern spine returns light to every apartment.",
			meta: "Islands Brygge · 2020",
			sky: "#cdd6d9", wall: "#e7ddcc", accent: "#e7a34a",
			windows: [[0.14, 0.3, 0.14, 0.5], [0.34, 0.3, 0.14, 0.5], [0.54, 0.3, 0.14, 0.5], [0.74, 0.3, 0.12, 0.5]]
		},
		{
			tag: "Culture",
			name: "Kite Museum Pavilion",
			desc: "A translucent pavilion that glows at dusk and dissolves into daylight by noon.",
			meta: "Kalvebod · 2019",
			sky: "#d8d0c1", wall: "#ece2cf", accent: "#c9772a",
			windows: [[0.2, 0.2, 0.6, 0.44, "round"]]
		}
	];

	const NS = "http://www.w3.org/2000/svg";
	function facade(p) {
		const svg = document.createElementNS(NS, "svg");
		svg.setAttribute("viewBox", "0 0 400 300");
		svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
		svg.setAttribute("class", "card-art");
		svg.setAttribute("role", "img");
		svg.setAttribute("aria-label", p.name + " — daylight facade study");

		const rect = (x, y, w, h, fill, rx) => {
			const r = document.createElementNS(NS, "rect");
			r.setAttribute("x", x); r.setAttribute("y", y);
			r.setAttribute("width", w); r.setAttribute("height", h);
			r.setAttribute("fill", fill);
			if (rx) { r.setAttribute("rx", rx); r.setAttribute("ry", rx); }
			return r;
		};

		svg.appendChild(rect(0, 0, 400, 300, p.sky));
		// soft sun glow
		const glow = document.createElementNS(NS, "circle");
		glow.setAttribute("cx", 70); glow.setAttribute("cy", 60); glow.setAttribute("r", 46);
		glow.setAttribute("fill", p.accent); glow.setAttribute("opacity", "0.35");
		svg.appendChild(glow);
		// building mass
		svg.appendChild(rect(0, 132, 400, 168, p.wall));
		// shadow gradient on ground
		svg.appendChild(rect(0, 250, 400, 50, p.wall === "#e3d8c4" ? "#d5c9b2" : "#d9cfba"));
		// windows
		p.windows.forEach(w => {
			const wx = w[0] * 400, wy = 132 + w[1] * 168, ww = w[2] * 400, wh = w[3] * 168;
			const isRound = w[4] === "round";
			svg.appendChild(rect(wx, wy, ww, wh, p.accent, isRound ? Math.min(ww, wh) / 2 : 3));
			// light spill below aperture
			const spill = document.createElementNS(NS, "polygon");
			const pts = [
				[wx, wy + wh],
				[wx + ww, wy + wh],
				[wx + ww + 14, 300],
				[wx - 14, 300]
			].map(pt => pt.join(",")).join(" ");
			spill.setAttribute("points", pts);
			spill.setAttribute("fill", p.accent);
			spill.setAttribute("opacity", "0.16");
			svg.appendChild(spill);
		});
		return svg;
	}

	const grid = document.getElementById("projectGrid");
	if (grid) {
		projects.forEach(p => {
			const li = document.createElement("li");
			li.className = "reveal";
			const a = document.createElement("a");
			a.className = "card";
			a.href = "#projects";
			a.setAttribute("aria-label", p.name + ", " + p.tag + " project, " + p.meta);
			a.appendChild(facade(p));
			const body = document.createElement("div");
			body.className = "card-body";
			body.innerHTML =
				'<span class="card-tag"></span>' +
				'<h3></h3><p></p>' +
				'<span class="card-meta"></span>';
			body.querySelector(".card-tag").textContent = p.tag;
			body.querySelector("h3").textContent = p.name;
			body.querySelector("p").textContent = p.desc;
			body.querySelector(".card-meta").textContent = p.meta;
			a.appendChild(body);
			li.appendChild(a);
			grid.appendChild(li);
		});
	}

	/* ---- Mobile nav ---- */
	const toggle = document.getElementById("navToggle");
	const mnav = document.getElementById("mobileNav");
	if (toggle && mnav) {
		const setOpen = open => {
			toggle.setAttribute("aria-expanded", String(open));
			toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
			mnav.hidden = !open;
		};
		toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
		mnav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
	}

	/* ---- Daylight slider ---- */
	const slider = document.getElementById("lightSlider");
	if (slider) {
		const root = document.documentElement;
		const apply = v => {
			const t = v / 100; // 0 dawn .. 1 dusk
			root.style.setProperty("--sun-x", (12 + t * 76) + "%");
			// warmth peaks warm at edges (low sun), cooler at midday
			const warmth = 0.4 + Math.abs(t - 0.5) * 0.9;
			root.style.setProperty("--sun-warmth", warmth.toFixed(2));
		};
		apply(Number(slider.value));
		slider.addEventListener("input", () => apply(Number(slider.value)));
	}

	/* ---- Reveal on scroll ---- */
	const revealables = () => document.querySelectorAll(".reveal");
	if (reduceMotion || !("IntersectionObserver" in window)) {
		revealables().forEach(el => el.classList.add("in"));
	} else {
		const io = new IntersectionObserver((entries, obs) => {
			entries.forEach(e => {
				if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
			});
		}, { threshold: 0.15 });
		// project cards are created above; also tag static sections
		document.querySelectorAll(".section-head, .note, .principles li, .approach-figure, .contact-details").forEach(el => el.classList.add("reveal"));
		revealables().forEach(el => io.observe(el));
	}

	/* ---- Count up ---- */
	const counters = document.querySelectorAll("[data-count]");
	const runCount = el => {
		const target = Number(el.dataset.count);
		if (reduceMotion) { el.textContent = String(target); return; }
		const dur = 1100, start = performance.now();
		const step = now => {
			const p = Math.min(1, (now - start) / dur);
			const eased = 1 - Math.pow(1 - p, 3);
			el.textContent = String(Math.round(target * eased));
			if (p < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};
	if ("IntersectionObserver" in window && !reduceMotion) {
		const cio = new IntersectionObserver((entries, obs) => {
			entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); } });
		}, { threshold: 0.6 });
		counters.forEach(c => cio.observe(c));
	} else {
		counters.forEach(runCount);
	}
})();
