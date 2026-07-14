(() => {
	"use strict";

	const experiments = [
		{
			id: "NL-118",
			title: "Parallax Cartography",
			field: "spatial",
			blurb: "A depth-map renderer that turns a single photograph into a walkable room you can lean into.",
			status: "in trials",
			progress: 72,
		},
		{
			id: "NL-104",
			title: "Whisper Grid",
			field: "perception",
			blurb: "On-device sound localization that draws where a noise came from without ever recording it.",
			status: "stable",
			progress: 88,
		},
		{
			id: "NL-131",
			title: "Soft Cursor",
			field: "interface",
			blurb: "A pointer with mass and drag — it overshoots, settles, and remembers where your attention drifts.",
			status: "in trials",
			progress: 54,
		},
		{
			id: "NL-097",
			title: "Null Compass",
			field: "spatial",
			blurb: "Indoor orientation from magnetic anomalies alone. No beacons, no satellites, no certainty.",
			status: "unstable",
			progress: 31,
		},
		{
			id: "NL-126",
			title: "Latent Sketchpad",
			field: "perception",
			blurb: "A tiny vision model that guesses your next stroke and quietly steps aside when it is wrong.",
			status: "in trials",
			progress: 66,
		},
		{
			id: "NL-142",
			title: "Haptic Punctuation",
			field: "interface",
			blurb: "Reading through your fingertips: commas buzz, full stops tap, questions hang in suspense.",
			status: "prototype",
			progress: 40,
		},
	];

	const logEntries = [
		{ date: "2026.07", title: "Soft Cursor enters public trial", note: "Twelve testers, six agreed the drag felt 'alive'. Six did not." },
		{ date: "2026.05", title: "Whisper Grid reaches stable", note: "Localization within 8&deg; on-device, zero audio persisted to disk." },
		{ date: "2026.02", title: "Null Compass marked unstable", note: "Elevators remain our nemesis. Honest results, published anyway." },
		{ date: "2025.11", title: "Laboratory index rebuilt", note: "Rewrote everything as static instruments. Fewer moving parts, more replayable." },
	];

	// ---- render experiment cards ----
	const grid = document.getElementById("exp-grid");
	const empty = document.getElementById("exp-empty");

	function cardMarkup(x) {
		const li = document.createElement("li");
		li.className = "card";
		li.dataset.field = x.field;
		li.innerHTML =
			'<div class="card-top"><span>' + x.id + '</span>' +
			'<span class="card-tag">' + x.field + '</span></div>' +
			'<h3>' + x.title + '</h3>' +
			'<p>' + x.blurb + '</p>' +
			'<div class="card-foot"><span>' + x.status + '</span>' +
			'<span class="bar" style="--v:' + x.progress + '%" role="img" aria-label="readiness ' + x.progress + ' percent"></span></div>';
		return li;
	}

	experiments.forEach((x) => grid.appendChild(cardMarkup(x)));

	// ---- filters ----
	const chips = Array.from(document.querySelectorAll(".chip"));
	chips.forEach((chip) => {
		chip.addEventListener("click", () => {
			const filter = chip.dataset.filter;
			chips.forEach((c) => {
				const active = c === chip;
				c.classList.toggle("is-active", active);
				c.setAttribute("aria-pressed", active ? "true" : "false");
			});
			let visible = 0;
			Array.from(grid.children).forEach((card) => {
				const show = filter === "all" || card.dataset.field === filter;
				card.hidden = !show;
				if (show) visible += 1;
			});
			empty.hidden = visible !== 0;
		});
	});

	// ---- log ----
	const timeline = document.querySelector(".timeline");
	logEntries.forEach((e) => {
		const li = document.createElement("li");
		li.innerHTML =
			'<time>' + e.date + '</time>' +
			'<div class="entry"><strong>' + e.title + '</strong><span>' + e.note + '</span></div>';
		timeline.appendChild(li);
	});

	// ---- count-up stats (respects reduced motion) ----
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const counters = Array.from(document.querySelectorAll(".stat dd"));
	if (!reduced && "IntersectionObserver" in window) {
		const io = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				const target = parseInt(el.dataset.count, 10);
				let n = 0;
				const step = Math.max(1, Math.round(target / 24));
				const tick = () => {
					n = Math.min(target, n + step);
					el.textContent = String(n);
					if (n < target) requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
				obs.unobserve(el);
			});
		}, { threshold: 0.6 });
		counters.forEach((c) => io.observe(c));
	}

	// ---- lightweight status flavor ----
	const statusText = document.getElementById("status-text");
	if (statusText && !reduced) {
		const phrases = ["systems nominal", "6 sensors live", "replay buffer warm", "null set stable"];
		let i = 0;
		setInterval(() => {
			i = (i + 1) % phrases.length;
			statusText.textContent = phrases[i];
		}, 4200);
	}

	// ---- honor pull-state from bridge (keeps viewer gesture calm) ----
	document.addEventListener("sitegeist:pull-state", (e) => {
		document.body.style.setProperty("--pulling", e.detail && e.detail.active ? "1" : "0");
	});
})();
