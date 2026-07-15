(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- System explorer tabs ---- */
	const tabs = Array.from(document.querySelectorAll(".flow-step"));
	const panels = new Map();
	tabs.forEach((tab) => {
		const id = tab.getAttribute("aria-controls");
		const panel = document.getElementById(id);
		if (panel) panels.set(tab, panel);
	});

	function activate(tab, focus) {
		tabs.forEach((t) => {
			const on = t === tab;
			t.classList.toggle("is-active", on);
			t.setAttribute("aria-selected", on ? "true" : "false");
			t.tabIndex = on ? 0 : -1;
			const panel = panels.get(t);
			if (panel) panel.hidden = !on;
		});
		if (focus) tab.focus();
	}

	tabs.forEach((tab, index) => {
		tab.addEventListener("click", () => activate(tab, false));
		tab.addEventListener("keydown", (event) => {
			let next = null;
			if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
			else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
			else if (event.key === "Home") next = tabs[0];
			else if (event.key === "End") next = tabs[tabs.length - 1];
			if (next) {
				event.preventDefault();
				activate(next, true);
			}
		});
	});

	/* ---- Count-up hero stats ---- */
	function formatNumber(n) {
		return Math.round(n).toLocaleString("en-US");
	}

	function countUp(el) {
		const target = Number(el.dataset.count || "0");
		const suffix = el.dataset.suffix || "";
		if (reduceMotion || !Number.isFinite(target)) {
			el.textContent = formatNumber(target) + suffix;
			return;
		}
		const duration = 1100;
		const start = performance.now();
		function tick(now) {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			el.textContent = formatNumber(target * eased) + suffix;
			if (t < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}

	const counters = Array.from(document.querySelectorAll("[data-count]"));
	const gauges = Array.from(document.querySelectorAll(".gauge"));

	if ("IntersectionObserver" in window && !reduceMotion) {
		const io = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				if (el.matches("[data-count]")) countUp(el);
				else el.classList.add("is-shown");
				obs.unobserve(el);
			});
		}, { threshold: 0.35 });
		counters.forEach((el) => io.observe(el));
		gauges.forEach((el) => io.observe(el));
	} else {
		counters.forEach(countUp);
		gauges.forEach((el) => el.classList.add("is-shown"));
	}
})();
