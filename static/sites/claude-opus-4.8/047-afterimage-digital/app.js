"use strict";
(() => {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* ---------- deterministic pseudo-random ---------- */
	function makeRng(seed) {
		let s = seed >>> 0 || 1;
		return () => {
			s ^= s << 13; s >>>= 0;
			s ^= s >> 17;
			s ^= s << 5; s >>>= 0;
			return s / 4294967296;
		};
	}

	/* ---------- crisp canvas sizing ---------- */
	function fit(canvas) {
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = Math.max(1, Math.round(rect.width));
		const h = Math.max(1, Math.round(rect.height));
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		const ctx = canvas.getContext("2d");
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		return { ctx, w, h };
	}

	function glow(ctx, x, y, r, color, alpha) {
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, color.replace("ALPHA", alpha));
		g.addColorStop(1, color.replace("ALPHA", "0"));
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}

	/* ---------- generative artwork renderer ---------- */
	function renderArtwork(canvas, work) {
		const { ctx, w, h } = fit(canvas);
		const rng = makeRng(work.seed);
		const P = work.palette;
		ctx.globalCompositeOperation = "source-over";
		const bg = ctx.createLinearGradient(0, 0, w, h);
		bg.addColorStop(0, "#05040d");
		bg.addColorStop(1, "#0a0718");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, w, h);
		ctx.globalCompositeOperation = "lighter";
		const cx = w / 2, cy = h / 2, R = Math.min(w, h);

		if (work.motif === "orbits") {
			for (let i = 0; i < 7; i++) {
				const rad = R * (0.14 + i * 0.06);
				const col = P[i % P.length];
				ctx.strokeStyle = col.replace("ALPHA", 0.5 - i * 0.03);
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				ctx.ellipse(cx, cy, rad, rad * (0.55 + rng() * 0.25), rng() * Math.PI, 0, Math.PI * 2);
				ctx.stroke();
				const a = rng() * Math.PI * 2;
				glow(ctx, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.7, R * 0.12, col, 0.9);
			}
			glow(ctx, cx, cy, R * 0.4, P[0], 0.5);
		} else if (work.motif === "bloom") {
			const petals = 9;
			for (let i = 0; i < petals; i++) {
				const a = (i / petals) * Math.PI * 2 + rng() * 0.2;
				const len = R * (0.28 + rng() * 0.14);
				for (let t = 0; t < 6; t++) {
					const x = cx + Math.cos(a) * len * (t / 6);
					const y = cy + Math.sin(a) * len * (t / 6);
					glow(ctx, x, y, R * (0.06 + t * 0.012), P[i % P.length], 0.5);
				}
			}
			glow(ctx, cx, cy, R * 0.22, "rgba(255,255,255,ALPHA)", 0.9);
		} else if (work.motif === "waves") {
			for (let l = 0; l < 5; l++) {
				const col = P[l % P.length];
				ctx.strokeStyle = col.replace("ALPHA", 0.55);
				ctx.lineWidth = 1.6;
				ctx.beginPath();
				const base = h * (0.28 + l * 0.11);
				const amp = R * (0.05 + rng() * 0.05);
				const ph = rng() * Math.PI * 2;
				for (let x = 0; x <= w; x += 6) {
					const y = base + Math.sin(x / w * Math.PI * 3 + ph) * amp;
					x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
			glow(ctx, cx, h * 0.32, R * 0.4, P[0], 0.45);
		} else if (work.motif === "grid") {
			const n = 6;
			const pts = [];
			for (let i = 0; i <= n; i++) {
				pts[i] = [];
				for (let j = 0; j <= n; j++) {
					pts[i][j] = [ (i / n) * w + (rng() - 0.5) * w * 0.06,
						(j / n) * h + (rng() - 0.5) * h * 0.06 ];
				}
			}
			ctx.lineWidth = 1;
			for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
				const col = P[(i + j) % P.length];
				if (i < n) { line(ctx, pts[i][j], pts[i + 1][j], col); }
				if (j < n) { line(ctx, pts[i][j], pts[i][j + 1], col); }
			}
			for (let k = 0; k < 6; k++)
				glow(ctx, rng() * w, rng() * h, R * 0.14, P[k % P.length], 0.7);
		} else if (work.motif === "aurora") {
			for (let l = 0; l < 4; l++) {
				const col = P[l % P.length];
				const grad = ctx.createLinearGradient(0, 0, 0, h);
				grad.addColorStop(0, col.replace("ALPHA", 0));
				grad.addColorStop(0.5, col.replace("ALPHA", 0.4));
				grad.addColorStop(1, col.replace("ALPHA", 0));
				ctx.fillStyle = grad;
				ctx.beginPath();
				const off = l * w * 0.12;
				ctx.moveTo(off, h);
				for (let x = 0; x <= w; x += 8) {
					const y = h * 0.5 + Math.sin(x / w * Math.PI * 2 + l) * R * 0.18 + (rng() - 0.5) * 6;
					ctx.lineTo(x + off * 0.1, y);
				}
				ctx.lineTo(w, h);
				ctx.closePath();
				ctx.fill();
			}
		} else { /* shards */
			for (let i = 0; i < 14; i++) {
				const col = P[i % P.length];
				ctx.strokeStyle = col.replace("ALPHA", 0.6);
				ctx.lineWidth = 1 + rng() * 1.5;
				const x1 = rng() * w, y1 = rng() * h;
				const a = rng() * Math.PI * 2, len = R * (0.2 + rng() * 0.3);
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x1 + Math.cos(a) * len, y1 + Math.sin(a) * len);
				ctx.stroke();
				glow(ctx, x1, y1, R * 0.1, col, 0.8);
			}
			glow(ctx, cx, cy, R * 0.3, P[0], 0.4);
		}
		ctx.globalCompositeOperation = "source-over";
	}

	function line(ctx, a, b, col) {
		ctx.strokeStyle = col.replace("ALPHA", 0.35);
		ctx.beginPath();
		ctx.moveTo(a[0], a[1]);
		ctx.lineTo(b[0], b[1]);
		ctx.stroke();
	}

	/* ---------- data ---------- */
	const C = {
		cyan: "rgba(70,230,255,ALPHA)",
		magenta: "rgba(255,92,200,ALPHA)",
		violet: "rgba(154,123,255,ALPHA)",
		amber: "rgba(255,207,107,ALPHA)",
		mint: "rgba(120,255,214,ALPHA)",
		rose: "rgba(255,138,164,ALPHA)",
	};
	const works = [
		{ title: "Persistence", artist: "Vera Lumen", motif: "orbits", seed: 10427,
			palette: [C.cyan, C.violet, C.magenta],
			statement: "Concentric light traces the path of a gaze that will not fade — an orbit held in the eye long after the source has gone dark." },
		{ title: "Signal Bloom", artist: "Kito Mercèd", motif: "bloom", seed: 88123,
			palette: [C.magenta, C.rose, C.amber],
			statement: "A radial burst grown from a single transmission, unfolding petal by petal into the retina like a flower made of noise." },
		{ title: "Tidewave", artist: "Naomi Sørensen", motif: "waves", seed: 42019,
			palette: [C.mint, C.cyan, C.violet],
			statement: "Standing waves of luminance, layered until the surface becomes an ocean you feel more than see. The afterimage keeps rolling." },
		{ title: "Neon Meridian", artist: "Idris Vale", motif: "grid", seed: 60677,
			palette: [C.cyan, C.amber, C.magenta],
			statement: "A warped lattice of longitude lines — a map of a place that exists only while the screen is warm." },
		{ title: "Aurora Memory", artist: "Liu Wenqing", motif: "aurora", seed: 33511,
			palette: [C.mint, C.violet, C.cyan],
			statement: "Curtains of colour drawn from remembered skies, drifting upward in bands the eye reconstructs from pure light." },
		{ title: "Shatterlight", artist: "Priya Anand", motif: "shards", seed: 71903,
			palette: [C.magenta, C.cyan, C.amber],
			statement: "A frame broken into splinters of glow, each shard a separate afterimage refusing to reassemble into a single picture." },
	];

	const artists = [
		{ name: "Vera Lumen", role: "Light & motion", g: ["#46e6ff", "#9a7bff"],
			bio: "Builds real-time systems where the viewer's attention becomes the brush. Exhibited across three continents of screens." },
		{ name: "Kito Mercèd", role: "Generative form", g: ["#ff5cc8", "#ffcf6b"],
			bio: "Coaxes organic blooms out of raw signal, treating noise as a garden to be tended rather than cleaned." },
		{ name: "Naomi Sørensen", role: "Sound-reactive", g: ["#78ffd6", "#46e6ff"],
			bio: "Translates the physics of water into the physics of colour, so every wave you see once made a sound." },
		{ name: "Liu Wenqing", role: "Atmospheres", g: ["#9a7bff", "#78ffd6"],
			bio: "Reconstructs remembered skies from pure gradient, mapping the aurora of places that were never photographed." },
	];

	/* ---------- build exhibition grid ---------- */
	const grid = document.getElementById("work-grid");
	const cardCanvases = [];
	works.forEach((work, i) => {
		const li = document.createElement("li");
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "work";
		btn.setAttribute("aria-haspopup", "dialog");
		const canvas = document.createElement("canvas");
		canvas.className = "work-canvas";
		const body = document.createElement("div");
		body.className = "work-body";
		const idx = document.createElement("p");
		idx.className = "work-index";
		idx.textContent = "Work " + String(i + 1).padStart(2, "0");
		const t = document.createElement("p");
		t.className = "work-title";
		t.textContent = work.title;
		const a = document.createElement("p");
		a.className = "work-artist";
		a.textContent = work.artist;
		body.append(idx, t, a);
		btn.append(canvas, body);
		btn.setAttribute("aria-label", work.title + " by " + work.artist + " — open details");
		btn.addEventListener("click", () => openLightbox(work, i));
		li.appendChild(btn);
		grid.appendChild(li);
		cardCanvases.push({ canvas, work });
	});

	/* ---------- build artists ---------- */
	const artistList = document.getElementById("artist-list");
	artists.forEach((ar) => {
		const li = document.createElement("li");
		li.className = "artist";
		const av = document.createElement("div");
		av.className = "artist-avatar";
		av.style.background = "radial-gradient(circle at 34% 30%, #fff, " + ar.g[0] + " 42%, " + ar.g[1] + " 100%)";
		const nm = document.createElement("p");
		nm.className = "artist-name";
		nm.textContent = ar.name;
		const rl = document.createElement("p");
		rl.className = "artist-role";
		rl.textContent = ar.role;
		const bio = document.createElement("p");
		bio.className = "artist-bio";
		bio.textContent = ar.bio;
		li.append(av, nm, rl, bio);
		artistList.appendChild(li);
	});

	/* ---------- lightbox ---------- */
	const lightbox = document.getElementById("lightbox");
	const lbCanvas = document.getElementById("lightbox-canvas");
	let lastFocus = null;
	function openLightbox(work, i) {
		document.getElementById("lightbox-eyebrow").textContent = "Work " + String(i + 1).padStart(2, "0") + " · Exhibition 017";
		document.getElementById("lightbox-title").textContent = work.title;
		document.getElementById("lightbox-artist").textContent = "by " + work.artist;
		document.getElementById("lightbox-statement").textContent = work.statement;
		lastFocus = document.activeElement;
		lightbox.hidden = false;
		requestAnimationFrame(() => renderArtwork(lbCanvas, work));
		lightbox.querySelector(".lightbox-close").focus();
		document.addEventListener("keydown", onKey);
	}
	function closeLightbox() {
		lightbox.hidden = true;
		document.removeEventListener("keydown", onKey);
		if (lastFocus && lastFocus.focus) lastFocus.focus();
	}
	function onKey(e) {
		if (e.key === "Escape") { e.stopPropagation(); closeLightbox(); }
	}
	lightbox.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeLightbox));

	/* ---------- hero afterimage field ---------- */
	const heroCanvas = document.getElementById("hero-canvas");
	let hero = fit(heroCanvas);
	const motes = [];
	function seedMotes() {
		motes.length = 0;
		const cols = ["rgba(70,230,255,", "rgba(255,92,200,", "rgba(154,123,255,", "rgba(255,207,107,"];
		for (let i = 0; i < 26; i++) {
			motes.push({
				x: Math.random() * hero.w, y: Math.random() * hero.h,
				vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
				r: 30 + Math.random() * 70, c: cols[i % cols.length],
			});
		}
	}
	seedMotes();

	const trail = [];
	function pushTrail(x, y) {
		trail.push({ x, y, life: 1 });
		if (trail.length > 60) trail.shift();
	}
	heroCanvas.addEventListener("pointermove", (e) => {
		const rect = heroCanvas.getBoundingClientRect();
		pushTrail(e.clientX - rect.left, e.clientY - rect.top);
	});
	heroCanvas.addEventListener("pointerdown", (e) => {
		const rect = heroCanvas.getBoundingClientRect();
		pushTrail(e.clientX - rect.left, e.clientY - rect.top);
	});

	function paintHero(fade) {
		const ctx = hero.ctx, w = hero.w, h = hero.h;
		if (fade) {
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = "rgba(6,6,14,0.14)";
			ctx.fillRect(0, 0, w, h);
		} else {
			ctx.clearRect(0, 0, w, h);
		}
		ctx.globalCompositeOperation = "lighter";
		for (const m of motes) {
			glow(ctx, m.x, m.y, m.r, m.c + "ALPHA)", 0.10);
			if (fade) {
				m.x += m.vx; m.y += m.vy;
				if (m.x < -80) m.x = w + 80; if (m.x > w + 80) m.x = -80;
				if (m.y < -80) m.y = h + 80; if (m.y > h + 80) m.y = -80;
			}
		}
		for (const p of trail) {
			glow(ctx, p.x, p.y, 26 * p.life + 6, "rgba(70,230,255,ALPHA)", 0.5 * p.life);
			glow(ctx, p.x + 6, p.y + 4, 20 * p.life + 4, "rgba(255,92,200,ALPHA)", 0.35 * p.life);
			if (fade) p.life *= 0.94;
		}
		for (let i = trail.length - 1; i >= 0; i--) if (trail[i].life < 0.05) trail.splice(i, 1);
		ctx.globalCompositeOperation = "source-over";
	}

	let running = false;
	function loop() {
		if (!running) return;
		paintHero(true);
		requestAnimationFrame(loop);
	}
	function startHero() {
		if (reduceMotion.matches) { paintHero(false); return; }
		if (running) return;
		running = true;
		requestAnimationFrame(loop);
	}

	/* ---------- render cards (in view only, once) ---------- */
	function renderCards() {
		cardCanvases.forEach((c) => renderArtwork(c.canvas, c.work));
	}

	/* ---------- resize ---------- */
	let resizeTimer = 0;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			hero = fit(heroCanvas);
			seedMotes();
			if (reduceMotion.matches) paintHero(false);
			renderCards();
			if (!lightbox.hidden) {
				const t = document.getElementById("lightbox-title").textContent;
				const w = works.find((x) => x.title === t);
				if (w) renderArtwork(lbCanvas, w);
			}
		}, 180);
	});

	reduceMotion.addEventListener("change", () => {
		running = false;
		startHero();
	});

	/* ---------- go ---------- */
	renderCards();
	startHero();
	const hint = document.getElementById("hero-hint");
	if (reduceMotion.matches && hint) hint.textContent = "A field of light held still — Exhibition 017, on view now.";
})();
