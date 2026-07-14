(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------- Scroll reveal ---------- */
	const revealTargets = document.querySelectorAll(
		".section-head, .card, .post, .hero__copy, .hero__visual, .posture__intro, .meters, .contact__panel, .stat"
	);
	revealTargets.forEach((el) => el.classList.add("reveal"));

	const meters = document.querySelectorAll(".meter");
	const counted = new WeakSet();

	const fillMeter = (meter) => {
		const value = Number(meter.getAttribute("data-value")) || 0;
		const fill = meter.querySelector(".meter__fill");
		if (fill) fill.style.width = value + "%";
	};

	const formatCount = (value, decimals, suffix) => {
		let text;
		if (decimals) {
			text = value.toFixed(decimals);
		} else if (value >= 1000) {
			text = Math.round(value).toLocaleString("en-US");
		} else {
			text = String(Math.round(value));
		}
		return text + (suffix || "");
	};

	const runCount = (el) => {
		if (counted.has(el)) return;
		counted.add(el);
		const target = Number(el.getAttribute("data-count")) || 0;
		const decimals = Number(el.getAttribute("data-decimals")) || 0;
		const suffix = el.getAttribute("data-suffix") || "";
		if (reduceMotion) {
			el.textContent = formatCount(target, decimals, suffix);
			return;
		}
		const duration = 1400;
		const start = performance.now();
		const step = (now) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			el.textContent = formatCount(target * eased, decimals, suffix);
			if (t < 1) requestAnimationFrame(step);
			else el.textContent = formatCount(target, decimals, suffix);
		};
		requestAnimationFrame(step);
	};

	if ("IntersectionObserver" in window) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add("is-in");
					if (entry.target.classList.contains("meters")) {
						entry.target.querySelectorAll(".meter").forEach(fillMeter);
					}
					entry.target.querySelectorAll("[data-count]").forEach(runCount);
					io.unobserve(entry.target);
				});
			},
			{ threshold: 0.2 }
		);
		revealTargets.forEach((el) => io.observe(el));
	} else {
		revealTargets.forEach((el) => el.classList.add("is-in"));
		meters.forEach(fillMeter);
		document.querySelectorAll("[data-count]").forEach(runCount);
	}

	/* ---------- Monolith scanner canvas ---------- */
	const canvas = document.getElementById("scanner");
	if (!canvas || !canvas.getContext) return;
	const ctx = canvas.getContext("2d");

	const W = canvas.width;
	const H = canvas.height;
	const cx = W / 2;

	// The monolith slab, centered.
	const slab = { w: 150, h: 340, x: cx - 75, y: (H - 340) / 2 };
	const accent = "#3fe7c6";
	const accent2 = "#2fa8ff";

	// Incoming "threats" that get deflected at the shield boundary.
	const shieldR = 205;
	let threats = [];

	const spawnThreat = () => {
		const angle = Math.random() * Math.PI * 2;
		const dist = shieldR + 120 + Math.random() * 160;
		return {
			angle,
			x: cx + Math.cos(angle) * dist,
			y: H / 2 + Math.sin(angle) * dist,
			speed: 0.6 + Math.random() * 0.9,
			state: "incoming",
			flash: 0,
		};
	};

	for (let i = 0; i < 22; i += 1) threats.push(spawnThreat());

	const drawSlab = (scanY) => {
		const grad = ctx.createLinearGradient(slab.x, slab.y, slab.x + slab.w, slab.y);
		grad.addColorStop(0, "#0f1a24");
		grad.addColorStop(0.5, "#1a2b3a");
		grad.addColorStop(1, "#0c151d");
		ctx.fillStyle = grad;
		ctx.strokeStyle = "rgba(63,231,198,0.55)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.roundRect(slab.x, slab.y, slab.w, slab.h, 8);
		ctx.fill();
		ctx.stroke();

		// inner core glow
		ctx.save();
		ctx.beginPath();
		ctx.roundRect(slab.x, slab.y, slab.w, slab.h, 8);
		ctx.clip();
		const core = ctx.createLinearGradient(0, slab.y, 0, slab.y + slab.h);
		core.addColorStop(0, "rgba(47,168,255,0.05)");
		core.addColorStop(0.5, "rgba(63,231,198,0.14)");
		core.addColorStop(1, "rgba(47,168,255,0.05)");
		ctx.fillStyle = core;
		ctx.fillRect(slab.x, slab.y, slab.w, slab.h);

		// horizontal circuitry lines
		ctx.strokeStyle = "rgba(63,231,198,0.14)";
		ctx.lineWidth = 1;
		for (let y = slab.y + 24; y < slab.y + slab.h; y += 26) {
			ctx.beginPath();
			ctx.moveTo(slab.x + 12, y);
			ctx.lineTo(slab.x + slab.w - 12, y);
			ctx.stroke();
		}

		// scan bar
		ctx.fillStyle = "rgba(63,231,198,0.9)";
		ctx.shadowColor = accent;
		ctx.shadowBlur = 18;
		ctx.fillRect(slab.x, scanY - 1.5, slab.w, 3);
		ctx.shadowBlur = 0;
		ctx.restore();
	};

	const drawShield = (t) => {
		ctx.save();
		ctx.translate(cx, H / 2);
		for (let ring = 0; ring < 3; ring += 1) {
			const r = shieldR - ring * 26;
			ctx.beginPath();
			ctx.arc(0, 0, r, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(63,231,198," + (0.10 - ring * 0.025) + ")";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		// rotating arc accent
		const a = t * 0.0006;
		ctx.beginPath();
		ctx.arc(0, 0, shieldR, a, a + 0.9);
		ctx.strokeStyle = accent2;
		ctx.lineWidth = 2.4;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, shieldR, a + Math.PI, a + Math.PI + 0.9);
		ctx.strokeStyle = accent;
		ctx.lineWidth = 2.4;
		ctx.stroke();
		ctx.restore();
	};

	let startTime = performance.now();

	const render = (now) => {
		const t = now - startTime;
		ctx.clearRect(0, 0, W, H);

		drawShield(t);

		// threats move toward center, deflect at shield edge
		threats.forEach((th) => {
			if (th.state === "incoming") {
				const dx = cx - th.x;
				const dy = H / 2 - th.y;
				const d = Math.hypot(dx, dy);
				if (d <= shieldR) {
					th.state = "deflected";
					th.flash = 1;
				} else {
					th.x += (dx / d) * th.speed * 1.6;
					th.y += (dy / d) * th.speed * 1.6;
				}
			} else {
				th.flash -= 0.05;
				const dx = th.x - cx;
				const dy = th.y - H / 2;
				const d = Math.hypot(dx, dy) || 1;
				th.x += (dx / d) * 2.4;
				th.y += (dy / d) * 2.4;
			}

			ctx.beginPath();
			ctx.arc(th.x, th.y, th.state === "incoming" ? 2.4 : 3.4, 0, Math.PI * 2);
			if (th.state === "incoming") {
				ctx.fillStyle = "rgba(255,180,84,0.85)";
			} else {
				ctx.fillStyle = "rgba(63,231,198," + Math.max(0, th.flash) + ")";
			}
			ctx.fill();

			// trailing line for incoming
			if (th.state === "incoming") {
				const dx = cx - th.x;
				const dy = H / 2 - th.y;
				const d = Math.hypot(dx, dy) || 1;
				ctx.beginPath();
				ctx.moveTo(th.x, th.y);
				ctx.lineTo(th.x - (dx / d) * 14, th.y - (dy / d) * 14);
				ctx.strokeStyle = "rgba(255,180,84,0.25)";
				ctx.lineWidth = 1;
				ctx.stroke();
			}
		});

		// recycle spent threats
		threats = threats.filter((th) => {
			if (th.state === "deflected" && (th.flash <= 0 || th.x < -40 || th.x > W + 40 || th.y < -40 || th.y > H + 40)) {
				return false;
			}
			return true;
		});
		while (threats.length < 22) threats.push(spawnThreat());

		// scanning bar oscillates
		const scanY = slab.y + (Math.sin(t * 0.0011) * 0.5 + 0.5) * slab.h;
		drawSlab(scanY);

		if (!reduceMotion) requestAnimationFrame(render);
	};

	if (reduceMotion) {
		// draw a single static frame
		drawShield(1000);
		threats.forEach((th) => {
			ctx.beginPath();
			ctx.arc(th.x, th.y, 2.4, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(255,180,84,0.7)";
			ctx.fill();
		});
		drawSlab(slab.y + slab.h * 0.42);
	} else {
		requestAnimationFrame(render);
	}
})();
