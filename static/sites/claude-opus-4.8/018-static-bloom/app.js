"use strict";

/* Static Bloom — self-contained catalogue. No network, no storage.
   Preview tones are synthesized locally with the Web Audio API and only
   ever start from a direct user gesture. */

(function () {
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------- data ---------- */
	var releases = [
		{ cat: "SB072", title: "Halogen Choir", artist: "Vesna Loom", year: 2026, texture: "Drone", palette: ["#f2b8ff", "#7aa8ff"], root: 220.0 },
		{ cat: "SB071", title: "Copper Rain", artist: "The Antenna Gardeners", year: 2026, texture: "Field", palette: ["#54e6c8", "#7aa8ff"], root: 261.6 },
		{ cat: "SB070", title: "Soft Machinery", artist: "Neon Batiste", year: 2025, texture: "Techno", palette: ["#ffcf6b", "#f2b8ff"], root: 196.0 },
		{ cat: "SB069", title: "Paper Weather", artist: "Isla Fervent", year: 2025, texture: "Ambient", palette: ["#7aa8ff", "#54e6c8"], root: 293.7 },
		{ cat: "SB068", title: "Static Bloom", artist: "House Ensemble", year: 2025, texture: "Drone", palette: ["#f2b8ff", "#ffcf6b"], root: 174.6 },
		{ cat: "SB067", title: "Low Orbit Lullaby", artist: "Cariad & the Hush", year: 2024, texture: "Ambient", palette: ["#54e6c8", "#ffcf6b"], root: 246.9 }
	];

	var stories = [
		{ badge: "In the room", name: "Vesna Loom", record: "Halogen Choir", quote: "I recorded the ceiling lights of a closing library. The record is what they said as they cooled." },
		{ badge: "Origins", name: "Neon Batiste", record: "Soft Machinery", quote: "My grandmother's sewing machine keeps perfect time. I just gave it a bassline and stayed out of the way." },
		{ badge: "Field notes", name: "The Antenna Gardeners", record: "Copper Rain", quote: "We buried microphones for a year. Copper Rain is the eleven minutes where the storm agreed with us." }
	];

	var editions = [
		{ no: "Edition 01 · numbered /150", title: "Halogen Choir — Aurora Press", desc: "Translucent rose vinyl with a hand-etched B-side and a foil sleeve that shifts in low light.", tags: ["180g", "Foil sleeve", "Etched"], left: 22, total: 150, edge: "rgba(242,184,255,0.3)" },
		{ no: "Edition 02 · numbered /100", title: "Copper Rain — Field Cut", desc: "Sea-glass green pressing paired with a fold-out map of every place we buried a microphone.", tags: ["Sea glass", "Fold-out map", "Signed"], left: 58, total: 100, edge: "rgba(84,230,200,0.32)" },
		{ no: "Edition 03 · numbered /75", title: "Soft Machinery — Amber Lathe", desc: "Lathe-cut amber discs, individually turned, each a little different from the last.", tags: ["Lathe cut", "Amber", "One-of-a-kind"], left: 9, total: 75, edge: "rgba(255,207,107,0.32)" }
	];

	var textures = ["All", "Drone", "Ambient", "Techno", "Field"];

	var archive = releases.map(function (r) {
		return { cat: r.cat, title: r.title, artist: r.artist, texture: r.texture, year: r.year };
	}).concat([
		{ cat: "SB061", title: "Vellum", artist: "Isla Fervent", texture: "Ambient", year: 2023 },
		{ cat: "SB055", title: "Iron in the Signal", artist: "Neon Batiste", texture: "Techno", year: 2022 },
		{ cat: "SB048", title: "Tidewrack", artist: "The Antenna Gardeners", texture: "Field", year: 2021 },
		{ cat: "SB033", title: "Quiet Alloy", artist: "Vesna Loom", texture: "Drone", year: 2019 },
		{ cat: "SB012", title: "First Light, No Signal", artist: "House Ensemble", texture: "Ambient", year: 2017 }
	]);

	/* ---------- helpers ---------- */
	function el(tag, cls, text) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		if (text != null) n.textContent = text;
		return n;
	}

	function coverSVG(pal, seed) {
		var a = pal[0], b = pal[1];
		var circles = "";
		for (var i = 0; i < 5; i++) {
			var cx = 20 + ((seed * (i + 3) * 37) % 60);
			var cy = 20 + ((seed * (i + 5) * 53) % 60);
			var rr = 6 + ((seed * (i + 2)) % 22);
			var op = 0.18 + (i % 3) * 0.16;
			circles += "<circle cx='" + cx + "' cy='" + cy + "' r='" + rr + "' fill='none' stroke='#fff' stroke-opacity='" + op.toFixed(2) + "' stroke-width='1.2'/>";
		}
		return "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' role='img'>" +
			"<defs><linearGradient id='g" + seed + "' x1='0' y1='0' x2='1' y2='1'>" +
			"<stop offset='0' stop-color='" + a + "'/><stop offset='1' stop-color='" + b + "'/></linearGradient></defs>" +
			"<rect width='100' height='100' fill='url(#g" + seed + ")'/>" +
			"<rect width='100' height='100' fill='#0b0710' opacity='0.35'/>" +
			circles +
			"<circle cx='50' cy='50' r='15' fill='#0b0710' opacity='0.55'/>" +
			"<circle cx='50' cy='50' r='3' fill='#fff'/></svg>";
	}

	/* ---------- audio preview ---------- */
	var audio = null;
	function ctx() {
		if (!audio) {
			var AC = window.AudioContext || window.webkitAudioContext;
			if (AC) audio = new AC();
		}
		return audio;
	}
	var voices = [];
	function stopTone() {
		var c = audio;
		if (!c) return;
		voices.forEach(function (v) {
			try {
				v.g.gain.cancelScheduledValues(c.currentTime);
				v.g.gain.setTargetAtTime(0, c.currentTime, 0.08);
				v.o.stop(c.currentTime + 0.4);
			} catch (e) {}
		});
		voices = [];
	}
	function playTone(root) {
		var c = ctx();
		if (!c) return;
		if (c.state === "suspended") c.resume();
		stopTone();
		var ratios = [1, 1.5, 2.0];
		ratios.forEach(function (ratio, i) {
			var o = c.createOscillator();
			var g = c.createGain();
			o.type = i === 0 ? "sine" : "triangle";
			o.frequency.value = root * ratio;
			g.gain.value = 0;
			o.connect(g).connect(c.destination);
			o.start();
			g.gain.setTargetAtTime(0.05 / (i + 1), c.currentTime, 0.15);
			voices.push({ o: o, g: g });
		});
	}

	/* ---------- render releases + player ---------- */
	var grid = document.getElementById("release-grid");
	var player = document.getElementById("player");
	var pTitle = document.getElementById("player-title");
	var pArtist = document.getElementById("player-artist");
	var pToggle = document.getElementById("player-toggle");
	var viz = document.getElementById("player-viz");
	var current = null;

	for (var v = 0; v < 5; v++) viz.appendChild(el("i"));
	Array.prototype.forEach.call(viz.children, function (bar, i) {
		bar.style.animationDelay = (i * 0.12) + "s";
	});

	function setPlaying(rel) {
		current = rel;
		player.hidden = false;
		player.setAttribute("data-paused", "false");
		pToggle.setAttribute("aria-pressed", "true");
		pToggle.setAttribute("aria-label", "Pause preview");
		pTitle.textContent = rel.title;
		pArtist.textContent = rel.artist + " · " + rel.cat;
		playTone(rel.root);
		syncButtons();
	}
	function pause() {
		player.setAttribute("data-paused", "true");
		pToggle.setAttribute("aria-pressed", "false");
		pToggle.setAttribute("aria-label", "Play preview");
		stopTone();
		syncButtons();
	}
	function syncButtons() {
		var paused = player.getAttribute("data-paused") === "true";
		Array.prototype.forEach.call(grid.querySelectorAll(".play"), function (btn) {
			var on = current && btn.dataset.cat === current.cat && !paused;
			btn.setAttribute("aria-pressed", on ? "true" : "false");
			btn.querySelector(".play__label").textContent = on ? "Playing" : "Play";
		});
	}

	pToggle.addEventListener("click", function () {
		if (!current) return;
		if (player.getAttribute("data-paused") === "true") setPlaying(current);
		else pause();
	});

	releases.forEach(function (r, idx) {
		var card = el("article", "release");
		var cover = el("div", "release__cover");
		cover.style.background = "linear-gradient(160deg," + r.palette[0] + "," + r.palette[1] + ")";
		cover.innerHTML = coverSVG(r.palette, idx + 2);
		cover.setAttribute("role", "img");
		cover.setAttribute("aria-label", r.title + " cover art");

		var body = el("div", "release__body");
		body.appendChild(el("span", "release__cat", r.cat + " · " + r.texture));
		body.appendChild(el("span", "release__title", r.title));
		body.appendChild(el("span", "release__artist", r.artist));

		var foot = el("div", "release__foot");
		foot.appendChild(el("span", "release__year", String(r.year)));
		var btn = el("button", "play");
		btn.type = "button";
		btn.dataset.cat = r.cat;
		btn.setAttribute("aria-pressed", "false");
		btn.setAttribute("aria-label", "Play a preview of " + r.title + " by " + r.artist);
		btn.appendChild(el("span", "play__tri"));
		btn.appendChild(el("span", "play__label", "Play"));
		btn.addEventListener("click", function () {
			if (current && current.cat === r.cat && player.getAttribute("data-paused") !== "true") pause();
			else setPlaying(r);
		});
		foot.appendChild(btn);

		body.appendChild(foot);
		card.appendChild(cover);
		card.appendChild(body);
		grid.appendChild(card);
	});

	/* ---------- stories ---------- */
	var slist = document.getElementById("story-list");
	stories.forEach(function (s) {
		var c = el("article", "story");
		c.appendChild(el("span", "story__badge", s.badge));
		c.appendChild(el("h3", null, s.record));
		c.appendChild(el("p", "story__quote", s.quote));
		var by = el("p", "story__by");
		by.appendChild(document.createTextNode("— "));
		by.appendChild(el("strong", null, s.name));
		c.appendChild(by);
		slist.appendChild(c);
	});

	/* ---------- editions ---------- */
	var egrid = document.getElementById("edition-grid");
	editions.forEach(function (e) {
		var c = el("article", "edition");
		c.style.setProperty("--edge", e.edge);
		c.appendChild(el("span", "edition__no", e.no));
		c.appendChild(el("h3", null, e.title));
		c.appendChild(el("p", null, e.desc));
		var meta = el("div", "edition__meta");
		e.tags.forEach(function (t) { meta.appendChild(el("span", "tag", t)); });
		c.appendChild(meta);
		var bar = el("div", "edition__bar");
		var span = el("span");
		var pct = Math.round(((e.total - e.left) / e.total) * 100);
		span.style.width = pct + "%";
		bar.appendChild(span);
		c.appendChild(bar);
		c.appendChild(el("p", "edition__left", e.left + " of " + e.total + " remaining"));
		egrid.appendChild(c);
	});

	/* ---------- archive + filters ---------- */
	var alist = document.getElementById("archive-list");
	var filters = document.getElementById("filters");
	var active = "All";

	function renderArchive() {
		alist.innerHTML = "";
		archive.filter(function (a) {
			return active === "All" || a.texture === active;
		}).forEach(function (a) {
			var li = document.createElement("li");
			li.appendChild(el("span", "archive__cat", a.cat));
			var main = el("div", "archive__main");
			main.appendChild(el("strong", null, a.title));
			main.appendChild(el("span", null, a.artist + " · " + a.year));
			li.appendChild(main);
			li.appendChild(el("span", "archive__tex", a.texture));
			alist.appendChild(li);
		});
	}

	textures.forEach(function (t) {
		var b = el("button", "filter", t);
		b.type = "button";
		b.setAttribute("aria-pressed", t === active ? "true" : "false");
		b.addEventListener("click", function () {
			active = t;
			Array.prototype.forEach.call(filters.children, function (c) {
				c.setAttribute("aria-pressed", c === b ? "true" : "false");
			});
			renderArchive();
		});
		filters.appendChild(b);
	});
	renderArchive();

	/* stop audio if the page is hidden */
	document.addEventListener("visibilitychange", function () {
		if (document.hidden && player.getAttribute("data-paused") === "false") pause();
	});
})();
