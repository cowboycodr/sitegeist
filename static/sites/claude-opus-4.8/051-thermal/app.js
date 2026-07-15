(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Count-up statistics ---- */
	const formatValue = (value, decimals, suffix) => {
		const num = decimals ? value.toFixed(decimals) : Math.round(value).toString();
		return num + suffix;
	};

	const animateCount = (el) => {
		const target = parseFloat(el.dataset.count);
		const decimals = parseInt(el.dataset.decimals || "0", 10);
		const suffix = el.dataset.suffix || "";

		if (reduceMotion || !Number.isFinite(target)) {
			el.textContent = formatValue(target, decimals, suffix);
			return;
		}

		const duration = 1400;
		const start = performance.now();
		const step = (now) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			el.textContent = formatValue(target * eased, decimals, suffix);
			if (t < 1) requestAnimationFrame(step);
			else el.textContent = formatValue(target, decimals, suffix);
		};
		requestAnimationFrame(step);
	};

	const counters = Array.from(document.querySelectorAll("[data-count]"));
	if ("IntersectionObserver" in window && counters.length) {
		const io = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					animateCount(entry.target);
					obs.unobserve(entry.target);
				}
			});
		}, { threshold: 0.4 });
		counters.forEach((el) => io.observe(el));
	} else {
		counters.forEach(animateCount);
	}

	/* ---- Temperature explorer ---- */
	const range = document.getElementById("tempRange");
	if (range) {
		const tempVal = document.getElementById("tempVal");
		const powerVal = document.getElementById("powerVal");
		const effVal = document.getElementById("effVal");
		const gaugeFill = document.getElementById("gaugeFill");
		const min = 60;
		const max = 600;

		const update = () => {
			const temp = parseInt(range.value, 10);
			const frac = (temp - min) / (max - min);
			// Carnot-inspired efficiency curve, capped for realism.
			const efficiency = Math.round(8 + frac * 34);
			const power = (0.6 + frac * 7.2).toFixed(1);

			tempVal.textContent = temp;
			powerVal.textContent = power;
			effVal.textContent = efficiency;
			gaugeFill.style.width = (12 + frac * 84) + "%";
			range.setAttribute("aria-valuetext", temp + "°C, " + power + " megawatts recovered");
		};

		range.setAttribute("role", "slider");
		update();
		range.addEventListener("input", update);
	}

	/* ---- Sitegeist pull-state: pause looping motion while dragging ---- */
	document.addEventListener("sitegeist:pull-state", (event) => {
		const active = event.detail && event.detail.active;
		document.body.classList.toggle("pull-active", Boolean(active));
	});
})();
