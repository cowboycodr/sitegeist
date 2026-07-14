(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* Expand / collapse scent accords with a smooth, accessible height animation. */
	const toggles = document.querySelectorAll(".scent-toggle");
	toggles.forEach((toggle) => {
		const panel = document.getElementById(toggle.getAttribute("aria-controls"));
		if (!panel) return;

		toggle.addEventListener("click", () => {
			const open = toggle.getAttribute("aria-expanded") === "true";
			if (open) {
				collapse(panel);
				toggle.setAttribute("aria-expanded", "false");
				toggle.querySelector(".toggle-label").textContent = "Trace the accord";
			} else {
				expand(panel);
				toggle.setAttribute("aria-expanded", "true");
				toggle.querySelector(".toggle-label").textContent = "Close accord";
			}
		});
	});

	function expand(panel) {
		panel.hidden = false;
		if (reduceMotion) return;
		const target = panel.scrollHeight;
		panel.style.height = "0px";
		panel.style.opacity = "0";
		requestAnimationFrame(() => {
			panel.style.transition = "height 0.32s ease, opacity 0.32s ease";
			panel.style.height = target + "px";
			panel.style.opacity = "1";
		});
		panel.addEventListener("transitionend", function done(e) {
			if (e.propertyName !== "height") return;
			panel.style.height = "";
			panel.style.transition = "";
			panel.removeEventListener("transitionend", done);
		});
	}

	function collapse(panel) {
		if (reduceMotion) {
			panel.hidden = true;
			return;
		}
		const start = panel.scrollHeight;
		panel.style.height = start + "px";
		panel.style.transition = "height 0.3s ease, opacity 0.3s ease";
		requestAnimationFrame(() => {
			panel.style.height = "0px";
			panel.style.opacity = "0";
		});
		panel.addEventListener("transitionend", function done(e) {
			if (e.propertyName !== "height") return;
			panel.hidden = true;
			panel.style.height = "";
			panel.style.opacity = "";
			panel.style.transition = "";
			panel.removeEventListener("transitionend", done);
		});
	}

	/* Reveal sections on scroll (skipped entirely under reduced motion). */
	if (!reduceMotion && "IntersectionObserver" in window) {
		const items = document.querySelectorAll(
			".scent, .steps li, .pull, .atelier-inner, .section-head"
		);
		items.forEach((el) => el.classList.add("reveal"));
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("in");
						io.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
		);
		items.forEach((el) => io.observe(el));
	}
})();
