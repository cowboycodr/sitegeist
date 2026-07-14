(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* ---- animated hero counters ---- */
	const counters = document.querySelectorAll("[data-count]");
	const runCount = (el) => {
		const target = parseFloat(el.dataset.count);
		const suffix = el.dataset.suffix || "";
		const decimals = (el.dataset.count.split(".")[1] || "").length;
		if (reduceMotion.matches) {
			el.textContent = target.toFixed(decimals) + suffix;
			return;
		}
		const start = performance.now();
		const dur = 1100;
		const tick = (now) => {
			const p = Math.min(1, (now - start) / dur);
			const eased = 1 - Math.pow(1 - p, 3);
			el.textContent = (target * eased).toFixed(decimals) + suffix;
			if (p < 1) requestAnimationFrame(tick);
			else el.textContent = target.toFixed(decimals) + suffix;
		};
		requestAnimationFrame(tick);
	};

	if ("IntersectionObserver" in window) {
		const io = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					runCount(entry.target);
					obs.unobserve(entry.target);
				}
			});
		}, { threshold: 0.6 });
		counters.forEach((el) => io.observe(el));
	} else {
		counters.forEach(runCount);
	}

	/* ---- "Watch it work" jump ---- */
	const demoJump = document.querySelector("[data-demo-jump]");
	const demoSection = document.getElementById("demo");
	if (demoJump && demoSection) {
		demoJump.addEventListener("click", () => {
			demoSection.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
			setTimeout(() => document.getElementById("routePlay")?.focus(), reduceMotion.matches ? 0 : 500);
		});
	}

	/* ---- route delivery demo ---- */
	const playBtn = document.getElementById("routePlay");
	const status = document.getElementById("routeStatus");
	const line = document.getElementById("routeLine");
	const bot = document.getElementById("routeBot");
	const stepEls = Array.from(document.querySelectorAll(".route-steps span"));

	if (playBtn && status && line && bot) {
		const steps = [
			{ label: "Loading payload at the dock…", at: 0 },
			{ label: "Rolling down the main corridor.", at: 0.5 },
			{ label: "Calling the elevator to level 2.", at: 0.85 },
			{ label: "Delivered to Room 214. Heading back to dock.", at: 1 },
		];
		const total = line.getTotalLength();
		let playing = false;

		const place = (frac) => {
			const pt = line.getPointAtLength(total * frac);
			bot.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
		};

		const setStep = (i) => {
			stepEls.forEach((el, idx) => {
				el.classList.toggle("active", idx === i);
				el.classList.toggle("done", idx < i);
			});
			status.textContent = steps[i].label;
		};

		place(0);

		const run = () => {
			if (playing) return;
			playing = true;
			playBtn.disabled = true;
			playBtn.textContent = "Delivering…";
			line.classList.add("drawn");
			stepEls.forEach((el) => el.classList.remove("done"));

			if (reduceMotion.matches) {
				let i = 0;
				setStep(0);
				place(0);
				const stepTimer = setInterval(() => {
					i += 1;
					if (i >= steps.length) {
						clearInterval(stepTimer);
						finish();
						return;
					}
					setStep(i);
					place(steps[i].at);
				}, 900);
				return;
			}

			const start = performance.now();
			const dur = 4200;
			let stepIndex = -1;
			const frame = (now) => {
				const p = Math.min(1, (now - start) / dur);
				place(p);
				let current = 0;
				for (let s = 0; s < steps.length; s += 1) {
					if (p >= steps[s].at - 0.001) current = s;
				}
				if (current !== stepIndex) {
					stepIndex = current;
					setStep(current);
				}
				if (p < 1) requestAnimationFrame(frame);
				else finish();
			};
			requestAnimationFrame(frame);
		};

		const finish = () => {
			playing = false;
			playBtn.disabled = false;
			playBtn.textContent = "Replay delivery";
			stepEls.forEach((el, idx) => {
				el.classList.toggle("done", idx < steps.length - 1);
			});
		};

		playBtn.addEventListener("click", run);
	}

	/* ---- gentle pointer tilt on space cards ---- */
	const tiltCards = document.querySelectorAll("[data-tilt]");
	if (!reduceMotion.matches && window.matchMedia("(pointer: fine)").matches) {
		tiltCards.forEach((card) => {
			card.addEventListener("pointermove", (e) => {
				const r = card.getBoundingClientRect();
				const dx = (e.clientX - r.left) / r.width - 0.5;
				const dy = (e.clientY - r.top) / r.height - 0.5;
				card.style.transform = `translateY(-6px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg)`;
			});
			card.addEventListener("pointerleave", () => {
				card.style.transform = "";
			});
		});
	}
})();
