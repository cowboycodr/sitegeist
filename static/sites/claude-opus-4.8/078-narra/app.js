(() => {
	"use strict";

	const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Fragment data for the narrative mapper ---------------------- */
	const KIND = {
		source: { color: "#e8735a", role: "Source" },
		note: { color: "#e9a04b", role: "Note" },
		idea: { color: "#7fd0c4", role: "Idea" },
	};

	const FRAGMENTS = [
		{ id: "f1", kind: "source", label: "1854 cholera map",
			title: "1854 cholera map", note: "Snow's original street survey of Soho pump deaths." },
		{ id: "f2", kind: "note", label: "Deaths cluster on one pump",
			title: "Deaths cluster on one pump", note: "Your reading: mortality falls off sharply away from Broad Street." },
		{ id: "f3", kind: "source", label: "Brewery workers survive",
			title: "Brewery workers survive", note: "Interview record — staff drank the brewery's own supply." },
		{ id: "f4", kind: "idea", label: "Water, not air, carries it",
			title: "Water, not air, carries it", note: "The claim the whole map is being built to support." },
		{ id: "f5", kind: "note", label: "Counter-case: miasma theory",
			title: "Counter-case: miasma theory", note: "Complicates the thread — the reigning explanation of the day." },
		{ id: "f6", kind: "source", label: "Pump handle removed",
			title: "Pump handle removed", note: "Parish record dated the week the outbreak eased." },
	];

	const chipList = document.getElementById("chip-list");
	const spine = document.getElementById("spine");
	const spineEmpty = document.getElementById("spine-empty");
	const wires = document.getElementById("wires");
	const resetBtn = document.getElementById("reset-map");
	const placed = [];

	function makeChip(f) {
		const li = document.createElement("li");
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "chip";
		btn.id = "chip-" + f.id;
		btn.setAttribute("aria-pressed", "false");
		btn.style.setProperty("--kind-color", KIND[f.kind].color);
		btn.innerHTML =
			'<span class="chip__dot" aria-hidden="true"></span>' +
			'<span class="chip__label"></span>';
		btn.querySelector(".chip__label").textContent = f.label;
		btn.addEventListener("click", () => toggleFragment(f, btn));
		li.appendChild(btn);
		return li;
	}

	function toggleFragment(f, btn) {
		const idx = placed.indexOf(f.id);
		if (idx === -1) {
			placed.push(f.id);
			btn.setAttribute("aria-pressed", "true");
		} else {
			placed.splice(idx, 1);
			btn.setAttribute("aria-pressed", "false");
		}
		render();
	}

	function removeFragment(id) {
		const idx = placed.indexOf(id);
		if (idx > -1) placed.splice(idx, 1);
		const chip = document.getElementById("chip-" + id);
		if (chip) chip.setAttribute("aria-pressed", "false");
		render();
	}

	function render() {
		[...spine.querySelectorAll(".node")].forEach((n) => n.remove());
		spineEmpty.hidden = placed.length > 0;
		spineEmpty.style.display = placed.length > 0 ? "none" : "";

		placed.forEach((id) => {
			const f = FRAGMENTS.find((x) => x.id === id);
			const li = document.createElement("li");
			li.className = "node";
			li.style.setProperty("--kind-color", KIND[f.kind].color);
			li.innerHTML =
				'<div class="node__top">' +
				'<span class="node__role"></span>' +
				'<button class="node__remove" type="button" aria-label="Remove from spine">&times;</button>' +
				"</div>" +
				'<span class="node__title"></span>' +
				'<p class="node__note"></p>';
			li.querySelector(".node__role").textContent = KIND[f.kind].role;
			li.querySelector(".node__title").textContent = f.title;
			li.querySelector(".node__note").textContent = f.note;
			li.querySelector(".node__remove").addEventListener("click", () => removeFragment(id));
			spine.appendChild(li);
		});

		requestAnimationFrame(drawWires);
	}

	function drawWires() {
		while (wires.firstChild) wires.removeChild(wires.firstChild);
		const nodes = [...spine.querySelectorAll(".node")];
		if (nodes.length < 2) return;
		const stage = wires.getBoundingClientRect();
		if (!stage.width || !stage.height) return;

		const pts = nodes.map((n) => {
			const r = n.getBoundingClientRect();
			return {
				x: ((r.left - stage.left + 10) / stage.width) * 100,
				y: ((r.top - stage.top + r.height / 2) / stage.height) * 100,
			};
		});

		for (let i = 0; i < pts.length - 1; i += 1) {
			const a = pts[i];
			const b = pts[i + 1];
			const midY = (a.y + b.y) / 2;
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute(
				"d",
				`M${a.x} ${a.y} C ${a.x - 6} ${midY}, ${b.x - 6} ${midY}, ${b.x} ${b.y}`,
			);
			wires.appendChild(path);
		}
	}

	if (chipList) {
		FRAGMENTS.forEach((f) => chipList.appendChild(makeChip(f)));
		render();
		resetBtn.addEventListener("click", () => {
			placed.length = 0;
			chipList.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
			render();
		});
		window.addEventListener("resize", () => requestAnimationFrame(drawWires));
	}

	/* ---- Hero stat count-up ----------------------------------------- */
	function countUp(el) {
		const target = parseInt(el.getAttribute("data-count"), 10);
		if (!Number.isFinite(target)) return;
		const suffix = /\+/.test(el.textContent) ? "+" : "";
		if (prefersReduced) return;
		const start = performance.now();
		const dur = 1100;
		function tick(now) {
			const p = Math.min(1, (now - start) / dur);
			const eased = 1 - Math.pow(1 - p, 3);
			el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
			if (p < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}

	const stats = [...document.querySelectorAll(".hero__stats dd[data-count]")];
	if (stats.length && "IntersectionObserver" in window) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					countUp(e.target);
					io.unobserve(e.target);
				}
			});
		}, { threshold: 0.6 });
		stats.forEach((s) => io.observe(s));
	}

	/* ---- Overview stepper ------------------------------------------- */
	const playBtn = document.getElementById("overview-play");
	const caption = document.getElementById("overview-caption");
	const ticks = [...document.querySelectorAll("#overview-ticks li")];
	const STEPS = [
		"Step 1 — Drop a reading list into Narra. Each source lands as a card that remembers why you saved it.",
		"Step 2 — Thread two cards together and name the relationship: supports, complicates, or answers.",
		"Step 3 — Narra orders the threads into a spine, so the argument reads top to bottom.",
		"Step 4 — Walk the finished map end to end — every claim still carries the evidence beneath it.",
	];
	let step = -1;
	let timer = 0;

	function showStep(i) {
		step = i;
		caption.textContent = STEPS[i];
		ticks.forEach((t, ti) => t.classList.toggle("on", ti <= i));
	}

	function stopOverview(reset) {
		clearInterval(timer);
		timer = 0;
		playBtn.setAttribute("aria-pressed", "false");
		playBtn.querySelector(".overview__play-label").textContent = "Watch overview";
		if (reset) {
			step = -1;
			ticks.forEach((t) => t.classList.remove("on"));
			caption.textContent =
				"Press play to step through how a scattered reading list becomes a narrative you can defend.";
		}
	}

	if (playBtn) {
		playBtn.addEventListener("click", () => {
			if (timer) { stopOverview(false); return; }
			playBtn.setAttribute("aria-pressed", "true");
			playBtn.querySelector(".overview__play-label").textContent = "Pause";
			showStep(step < 0 || step >= STEPS.length - 1 ? 0 : step);
			if (prefersReduced) {
				showStep(STEPS.length - 1);
				stopOverview(false);
				return;
			}
			timer = setInterval(() => {
				if (step >= STEPS.length - 1) { stopOverview(false); return; }
				showStep(step + 1);
			}, 2600);
		});
	}
})();
