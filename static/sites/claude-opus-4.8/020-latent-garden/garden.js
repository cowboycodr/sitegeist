(() => {
	"use strict";

	/* ---------- Nav toggle ---------- */
	const toggle = document.querySelector(".nav-toggle");
	const links = document.getElementById("nav-links");
	if (toggle && links) {
		toggle.addEventListener("click", () => {
			const open = toggle.getAttribute("aria-expanded") === "true";
			toggle.setAttribute("aria-expanded", String(!open));
			links.classList.toggle("open", !open);
		});
		links.addEventListener("click", (e) => {
			if (e.target.closest("a")) {
				toggle.setAttribute("aria-expanded", "false");
				links.classList.remove("open");
			}
		});
	}

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* ---------- Value-noise flow field ---------- */
	const perm = new Uint8Array(512);
	function reseed(seed) {
		let s = seed >>> 0;
		const p = new Uint8Array(256);
		for (let i = 0; i < 256; i++) p[i] = i;
		for (let i = 255; i > 0; i--) {
			s = (s * 1664525 + 1013904223) >>> 0;
			const j = s % (i + 1);
			const t = p[i]; p[i] = p[j]; p[j] = t;
		}
		for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
	}
	const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
	const lerp = (a, b, t) => a + (b - a) * t;
	function grad(hash, x, y) {
		const h = hash & 3;
		const u = h < 2 ? x : y;
		const v = h < 2 ? y : x;
		return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
	}
	function noise(x, y) {
		const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
		x -= Math.floor(x); y -= Math.floor(y);
		const u = fade(x), v = fade(y);
		const a = perm[X] + Y, b = perm[X + 1] + Y;
		return lerp(
			lerp(grad(perm[a], x, y), grad(perm[b], x - 1, y), u),
			lerp(grad(perm[a + 1], x, y - 1), grad(perm[b + 1], x - 1, y - 1), u),
			v
		);
	}

	const PALETTE = ["#c9f26b", "#a8e05f", "#7fae5a", "#f0a6c0", "#e9edd6"];

	/* ---------- Garden system ---------- */
	function createGarden(canvas, opts) {
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return null;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let w = 0, h = 0;
		let agents = [];
		let season = opts.season || 1;
		const pointer = { x: -1, y: -1, active: false };
		let raf = 0;

		function resize() {
			const rect = canvas.getBoundingClientRect();
			w = Math.max(1, Math.round(rect.width));
			h = Math.max(1, Math.round(rect.height));
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			paintBackground(true);
		}

		function paintBackground(hard) {
			ctx.fillStyle = opts.bg;
			ctx.globalAlpha = hard ? 1 : opts.fade;
			ctx.fillRect(0, 0, w, h);
			ctx.globalAlpha = 1;
		}

		function count() {
			const area = w * h;
			return Math.max(60, Math.min(opts.maxAgents, Math.round(area / opts.density)));
		}

		function spawn() {
			return {
				x: Math.random() * w,
				y: Math.random() * h,
				life: 40 + Math.random() * 160,
				color: PALETTE[(Math.random() * PALETTE.length) | 0],
				width: 0.5 + Math.random() * 1.6,
			};
		}

		function seed(newSeason) {
			season = newSeason;
			reseed(0x9e37 + season * 2654435761);
			agents = new Array(count());
			for (let i = 0; i < agents.length; i++) agents[i] = spawn();
			paintBackground(true);
			if (opts.onSeason) opts.onSeason(season, agents.length);
		}

		function step() {
			paintBackground(false);
			const scale = opts.scale;
			for (let i = 0; i < agents.length; i++) {
				const a = agents[i];
				const angle = noise(a.x * scale, a.y * scale) * Math.PI * 2.5
					+ noise(a.x * scale * 0.5, a.y * scale * 0.5 + 100) * Math.PI;
				let vx = Math.cos(angle), vy = Math.sin(angle) - 0.25; // slight upward reach for light
				if (pointer.active) {
					const dx = a.x - pointer.x, dy = a.y - pointer.y;
					const d2 = dx * dx + dy * dy;
					if (d2 < 14000 && d2 > 0.01) {
						const f = (1 - d2 / 14000) * 2.4;
						vx += (dx / Math.sqrt(d2)) * f;
						vy += (dy / Math.sqrt(d2)) * f;
					}
				}
				const nx = a.x + vx * opts.speed;
				const ny = a.y + vy * opts.speed;
				ctx.strokeStyle = a.color;
				ctx.globalAlpha = 0.55;
				ctx.lineWidth = a.width;
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(nx, ny);
				ctx.stroke();
				a.x = nx; a.y = ny; a.life -= 1;
				if (a.life <= 0 || a.x < -20 || a.x > w + 20 || a.y < -20 || a.y > h + 20) {
					agents[i] = spawn();
				}
			}
			ctx.globalAlpha = 1;
		}

		function bloomStill() {
			// Reduced-motion: draw one dense settled composition, no animation.
			reseed(0x9e37 + season * 2654435761);
			paintBackground(true);
			const n = count();
			for (let i = 0; i < n; i++) {
				let x = Math.random() * w, y = Math.random() * h;
				const color = PALETTE[(Math.random() * PALETTE.length) | 0];
				ctx.strokeStyle = color;
				ctx.globalAlpha = 0.4;
				ctx.lineWidth = 0.6 + Math.random() * 1.2;
				ctx.beginPath();
				ctx.moveTo(x, y);
				for (let k = 0; k < 26; k++) {
					const angle = noise(x * opts.scale, y * opts.scale) * Math.PI * 2.5
						+ noise(x * opts.scale * 0.5, y * opts.scale * 0.5 + 100) * Math.PI;
					x += Math.cos(angle) * opts.speed * 1.4;
					y += (Math.sin(angle) - 0.25) * opts.speed * 1.4;
					ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
			ctx.globalAlpha = 1;
			if (opts.onSeason) opts.onSeason(season, n);
		}

		function loop() {
			step();
			raf = requestAnimationFrame(loop);
		}

		function start() {
			cancelAnimationFrame(raf);
			resize();
			seed(season);
			if (reduceMotion.matches) {
				bloomStill();
			} else {
				loop();
			}
		}

		// pointer interaction
		function setPointer(clientX, clientY) {
			const rect = canvas.getBoundingClientRect();
			pointer.x = clientX - rect.left;
			pointer.y = clientY - rect.top;
			pointer.active = true;
		}
		if (opts.interactive) {
			canvas.style.pointerEvents = "auto";
			window.addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY), { passive: true });
			window.addEventListener("pointerdown", (e) => setPointer(e.clientX, e.clientY), { passive: true });
			window.addEventListener("pointerup", () => { pointer.active = false; }, { passive: true });
			window.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
		}

		let rt;
		window.addEventListener("resize", () => {
			clearTimeout(rt);
			rt = setTimeout(start, 180);
		}, { passive: true });

		reduceMotion.addEventListener("change", start);

		return {
			start,
			nextSeason() {
				cancelAnimationFrame(raf);
				seed(season + 1);
				if (reduceMotion.matches) bloomStill(); else loop();
			},
		};
	}

	/* ---------- Wire up ---------- */
	const heroCanvas = document.getElementById("garden-canvas");
	const miniCanvas = document.getElementById("mini-canvas");
	const statAgents = document.getElementById("stat-agents");
	const statSeason = document.getElementById("stat-season");

	const hero = heroCanvas && createGarden(heroCanvas, {
		bg: "#0d1710", fade: 0.045, scale: 0.0016, speed: 1.4,
		density: 5200, maxAgents: 900, interactive: true, season: 1,
	});

	const mini = miniCanvas && createGarden(miniCanvas, {
		bg: "#0a120c", fade: 0.06, scale: 0.0032, speed: 1.1,
		density: 2600, maxAgents: 500, interactive: true, season: 1,
		onSeason(season, n) {
			if (statAgents) statAgents.textContent = n.toLocaleString();
			if (statSeason) statSeason.textContent = String(season);
		},
	});

	if (hero) hero.start();
	if (mini) mini.start();

	const seedBtn = document.getElementById("seed-btn");
	if (seedBtn) {
		seedBtn.addEventListener("click", () => {
			if (hero) hero.nextSeason();
			if (mini) mini.nextSeason();
		});
	}
})();
