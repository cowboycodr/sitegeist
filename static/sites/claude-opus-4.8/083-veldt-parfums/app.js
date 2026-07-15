(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Subtle reveal for sections; skipped when reduced motion is preferred.
	const reveal = document.querySelectorAll(".card, .layer, .entries li, .sec-head, .comp-intro, .notes-copy");
	if (!reduceMotion && "IntersectionObserver" in window) {
		reveal.forEach((el) => {
			el.style.opacity = "0";
			el.style.transform = "translateY(16px)";
			el.style.transition = "opacity .6s ease, transform .6s ease";
		});
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.style.opacity = "1";
				entry.target.style.transform = "none";
				io.unobserve(entry.target);
			});
		}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
		reveal.forEach((el) => io.observe(el));
	}

	// Highlight the current section in the primary nav.
	const links = Array.from(document.querySelectorAll(".nav a"));
	const map = new Map();
	links.forEach((link) => {
		const id = link.getAttribute("href").slice(1);
		const target = document.getElementById(id);
		if (target) map.set(target, link);
	});
	if (map.size && "IntersectionObserver" in window) {
		const spy = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const link = map.get(entry.target);
				if (!link) return;
				if (entry.isIntersecting) {
					links.forEach((l) => l.removeAttribute("aria-current"));
					link.setAttribute("aria-current", "true");
				}
			});
		}, { rootMargin: "-45% 0px -50% 0px" });
		map.forEach((_link, target) => spy.observe(target));
	}
})();
