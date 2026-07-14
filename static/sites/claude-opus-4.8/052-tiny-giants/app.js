(() => {
	"use strict";

	// Current year in footer
	const yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	// Mobile nav toggle
	const toggle = document.querySelector(".nav-toggle");
	const list = document.getElementById("nav-list");
	if (toggle && list) {
		const setOpen = (open) => {
			list.classList.toggle("open", open);
			toggle.setAttribute("aria-expanded", String(open));
		};
		toggle.addEventListener("click", () => {
			setOpen(toggle.getAttribute("aria-expanded") !== "true");
		});
		list.addEventListener("click", (event) => {
			if (event.target.closest("a")) setOpen(false);
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") setOpen(false);
		});
		document.addEventListener("click", (event) => {
			if (!event.target.closest(".site-nav")) setOpen(false);
		});
	}

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Count-up animation for hero stats
	const counters = document.querySelectorAll(".hero-stats dd[data-count]");
	const runCount = (el) => {
		const target = Number(el.dataset.count);
		if (reduceMotion || !Number.isFinite(target)) {
			el.textContent = String(target);
			return;
		}
		const duration = 900;
		const start = performance.now();
		const step = (now) => {
			const p = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			el.textContent = String(Math.round(target * eased));
			if (p < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	if ("IntersectionObserver" in window && counters.length) {
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

	// Newsletter form (client-side only, no network)
	const form = document.querySelector(".signup-form");
	if (form) {
		const input = form.querySelector("#email");
		const note = form.querySelector(".signup-note");
		const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const value = input.value.trim();
			if (!valid.test(value)) {
				note.textContent = "Please pop in a valid email so we can reach you.";
				note.classList.add("error");
				input.focus();
				return;
			}
			note.classList.remove("error");
			note.textContent = "Hooray! You're on the list for little dispatches.";
			form.reset();
		});
		input.addEventListener("input", () => {
			if (note.textContent) {
				note.textContent = "";
				note.classList.remove("error");
			}
		});
	}
})();
