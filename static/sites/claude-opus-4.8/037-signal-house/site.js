(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Mobile navigation ---- */
	const toggle = document.getElementById("navToggle");
	const menu = document.getElementById("navMenu");
	if (toggle && menu) {
		const setOpen = (open) => {
			toggle.setAttribute("aria-expanded", String(open));
			menu.classList.toggle("open", open);
		};
		toggle.addEventListener("click", () => {
			setOpen(toggle.getAttribute("aria-expanded") !== "true");
		});
		menu.addEventListener("click", (event) => {
			if (event.target.closest("a")) setOpen(false);
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") setOpen(false);
		});
	}

	/* ---- Reveal on scroll ---- */
	const items = Array.from(document.querySelectorAll(".reveal"));
	if (reduceMotion || !("IntersectionObserver" in window)) {
		items.forEach((el) => el.classList.add("in"));
	} else {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("in");
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
		items.forEach((el) => io.observe(el));
	}

	/* ---- Equalizer randomised timing ---- */
	if (!reduceMotion) {
		document.querySelectorAll("#equalizer span").forEach((bar) => {
			bar.style.animationDuration = (1 + Math.random() * 0.7).toFixed(2) + "s";
			bar.style.animationDelay = (Math.random() * -1.4).toFixed(2) + "s";
		});

		/* ---- Cycling frequency readout ---- */
		const freq = document.getElementById("freq");
		if (freq) {
			let value = 7;
			setInterval(() => {
				value = (value + 1) % 10;
				freq.textContent = String(value);
			}, 2600);
		}
	}
})();
