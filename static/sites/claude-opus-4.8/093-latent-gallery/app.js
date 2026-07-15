(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* ---- Seeded PRNG (mulberry32) ---- */
	function makeRng(seed) {
		let a = seed >>> 0;
		return function () {
			a |= 0; a = (a + 0x6D2B79F5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	const randomSeed = () => (Math.floor(Math.random() * 0xffffffff) >>> 0);

	const PALETTES = [
		["#52e0d8", "#8a6bff", "#e857b8"],
		["#f4c85a", "#e857b8", "#8a6bff"],
		["#52e0d8", "#5aa0f4", "#c9f45a"],
		["#e857b8", "#ff8a5a", "#f4c85a"],
		["#8a6bff", "#52e0d8", "#eae6ff"],
	];
	const ALGOS = ["Flow field", "Attractor", "Voronoi", "Perlin drift", "Cellular"];
	const TITLES = ["Untitled Bloom", "Drift No.", "Field Study", "Emergent Form", "Latent Path", "Quiet Automata", "Warm Chaos", "Diffusion"];

	/* ---- 2D value-noise from a seeded gradient grid ---- */
	function makeNoise(rng) {
		const size = 64;
		const grid = new Float32Array(size * size);
		for (let i = 0; i < grid.length; i++) grid[i] = rng() * Math.PI * 2;
		return function (x, y) {
			const xi = Math.floor(x) & (size - 1);
			const yi = Math.floor(y) & (size - 1);
			return grid[yi * size + xi];
		};
	}

	/* ---------------------------------------------------------------
	   Thumbnail renderer for the works grid — a still generative piece
	----------------------------------------------------------------*/
	function renderPiece(canvas, seed, opts) {
		const rng = makeRng(seed);
		const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = canvas.clientWidth || 320;
		const h = canvas.clientHeight || 240;
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		const ctx = canvas.getContext("2d");
		ctx.scale(dpr, dpr);

		ctx.fillStyle = "#06060d";
		ctx.fillRect(0, 0, w, h);

		const noise = makeNoise(rng);
		const scale = 0.04 + rng() * 0.03;
		const lines = Math.round(220 + rng() * 260);
		const steps = 26;
		ctx.lineWidth = 0.9;
		ctx.globalCompositeOperation = "lighter";

		for (let i = 0; i < lines; i++) {
			let x = rng() * w;
			let y = rng() * h;
			const col = palette[Math.floor(rng() * palette.length)];
			ctx.strokeStyle = col;
			ctx.globalAlpha = 0.05 + rng() * 0.12;
			ctx.beginPath();
			ctx.moveTo(x, y);
			for (let s = 0; s < steps; s++) {
				const ang = noise(x * scale, y * scale) + i * 0.001;
				x += Math.cos(ang) * 3.2;
				y += Math.sin(ang) * 3.2;
				if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;
				ctx.lineTo(x, y);
			}
			ctx.stroke();
		}

		/* a few luminous seed points */
		ctx.globalCompositeOperation = "lighter";
		const dots = 3 + Math.floor(rng() * 4);
		for (let d = 0; d < dots; d++) {
			const px = rng() * w, py = rng() * h, r = 8 + rng() * 26;
			const g = ctx.createRadialGradient(px, py, 0, px, py, r);
			g.addColorStop(0, palette[Math.floor(rng() * palette.length)] + "cc");
			g.addColorStop(1, "transparent");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(px, py, r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";

		if (opts && opts.algo) return palette;
		return palette;
	}

	/* ---- Build the works grid ---- */
	const grid = document.getElementById("works");
	function buildGrid(count) {
		if (!grid) return;
		grid.innerHTML = "";
		for (let i = 0; i < count; i++) {
			const seed = randomSeed();
			const li = document.createElement("li");
			li.className = "work";
			const algo = ALGOS[i % ALGOS.length];
			const title = TITLES[i % TITLES.length] + (Math.random() < 0.4 ? " " + (i + 1) : "");
			li.innerHTML =
				'<span class="work-algo">' + algo + '</span>' +
				'<canvas aria-label="Generative work: ' + title + '"></canvas>' +
				'<div class="work-meta"><span class="work-title">' + title +
				'</span><span class="work-seed">#' + seed.toString(16).padStart(8, "0") + '</span></div>';
			grid.appendChild(li);
			const canvas = li.querySelector("canvas");
			// defer render so layout width is known
			requestAnimationFrame(() => renderPiece(canvas, seed));
		}
	}

	/* ---------------------------------------------------------------
	   Hero flow field — animated (or a single still frame when reduced)
	----------------------------------------------------------------*/
	const heroCanvas = document.querySelector(".hero-canvas");
	let heroState = null;
	let rafId = 0;

	function initHero(seed) {
		if (!heroCanvas) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = heroCanvas.clientWidth || window.innerWidth;
		const h = heroCanvas.clientHeight || 600;
		heroCanvas.width = Math.round(w * dpr);
		heroCanvas.height = Math.round(h * dpr);
		const ctx = heroCanvas.getContext("2d");
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.fillStyle = "#0a0912";
		ctx.fillRect(0, 0, w, h);

		const rng = makeRng(seed);
		const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
		const noise = makeNoise(rng);
		const scale = 0.0032 + rng() * 0.0016;
		const count = Math.round(Math.min(680, (w * h) / 1600));
		const particles = [];
		for (let i = 0; i < count; i++) {
			particles.push({
				x: rng() * w, y: rng() * h,
				col: palette[Math.floor(rng() * palette.length)],
				a: 0.04 + rng() * 0.08,
			});
		}
		heroState = { ctx, w, h, noise, scale, particles, t: 0 };

		if (reduceMotion.matches) {
			// render a rich still frame
			for (let f = 0; f < 90; f++) stepHero(false);
			// darken slightly to keep text readable already handled by grain overlay
		}
	}

	function stepHero(clear) {
		const s = heroState;
		if (!s) return;
		const { ctx, w, h, noise, scale, particles } = s;
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(10, 9, 18, 0.06)";
		if (clear) ctx.fillRect(0, 0, w, h);
		ctx.globalCompositeOperation = "lighter";
		s.t += 0.0016;
		for (const p of particles) {
			const ang = noise(p.x * scale, p.y * scale) + s.t;
			const nx = p.x + Math.cos(ang) * 1.4;
			const ny = p.y + Math.sin(ang) * 1.4;
			ctx.strokeStyle = p.col;
			ctx.globalAlpha = p.a;
			ctx.lineWidth = 1.1;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(nx, ny);
			ctx.stroke();
			p.x = nx; p.y = ny;
			if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
				p.x = Math.random() * w; p.y = Math.random() * h;
			}
		}
		ctx.globalAlpha = 1;
	}

	function animate() {
		stepHero(false);
		rafId = requestAnimationFrame(animate);
	}

	function startHero(seed) {
		cancelAnimationFrame(rafId);
		initHero(seed);
		if (!reduceMotion.matches) {
			rafId = requestAnimationFrame(animate);
		}
	}

	/* ---- Live status toast ---- */
	const toast = document.querySelector(".livemsg");
	let toastTimer = 0;
	function announce(msg) {
		if (!toast) return;
		toast.textContent = msg;
		toast.classList.add("show");
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
	}

	/* ---- Reseed everything ---- */
	function reseed() {
		startHero(randomSeed());
		buildGrid(6);
		announce("Field reseeded — a new arrangement.");
	}

	/* ---- Count-up stats ---- */
	function countUp() {
		if (reduceMotion.matches) return;
		document.querySelectorAll(".hero-stats dd").forEach((el) => {
			const target = parseInt(el.getAttribute("data-count"), 10);
			if (!Number.isFinite(target)) return;
			const dur = 1100;
			const start = performance.now();
			el.textContent = "0";
			function tick(now) {
				const p = Math.min(1, (now - start) / dur);
				const eased = 1 - Math.pow(1 - p, 3);
				el.textContent = Math.round(target * eased).toLocaleString();
				if (p < 1) requestAnimationFrame(tick);
			}
			requestAnimationFrame(tick);
		});
	}

	/* ---- Artist signature preview → repaint hero with fixed seed ---- */
	document.querySelectorAll(".artist").forEach((btn) => {
		btn.addEventListener("click", () => {
			document.querySelectorAll(".artist").forEach((b) => b.removeAttribute("aria-pressed"));
			btn.setAttribute("aria-pressed", "true");
			const sig = parseInt(btn.getAttribute("data-signature"), 10) || 0;
			startHero(0x51617 + sig * 0x9e3779b1);
			const name = btn.querySelector(".artist-name");
			announce("Now showing the signature system of " + (name ? name.textContent : "this artist") + ".");
			document.getElementById("top").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
		});
	});

	const regen = document.querySelector(".regen");
	if (regen) regen.addEventListener("click", reseed);

	/* ---- Resize handling (debounced) ---- */
	let resizeTimer = 0;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			if (heroState) startHero(randomSeed());
			document.querySelectorAll(".work canvas").forEach((c) => {
				const seedText = c.parentElement.querySelector(".work-seed").textContent.replace("#", "");
				renderPiece(c, parseInt(seedText, 16) >>> 0);
			});
		}, 220);
	});

	/* ---- Bridge pull-state: subtle acknowledgement, no layout impact ---- */
	document.addEventListener("sitegeist:pull-state", (e) => {
		document.body.style.filter = e.detail && e.detail.active ? "brightness(1.06)" : "";
	});

	/* ---- Boot ---- */
	function boot() {
		startHero(randomSeed());
		buildGrid(6);
		countUp();
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
