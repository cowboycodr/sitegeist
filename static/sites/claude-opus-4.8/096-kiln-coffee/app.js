(() => {
	"use strict";

	// Progressive scroll reveal — purely decorative, disabled for reduced motion.
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const targets = document.querySelectorAll(
		".batch-card, .coffee, .producer-list li, .steps li, .section-head, .cta"
	);

	if (reduce || !("IntersectionObserver" in window)) {
		targets.forEach((el) => el.classList.add("is-in"));
		return;
	}

	targets.forEach((el) => el.classList.add("reveal"));

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-in");
					observer.unobserve(entry.target);
				}
			});
		},
		{ rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
	);

	targets.forEach((el) => observer.observe(el));
})();
