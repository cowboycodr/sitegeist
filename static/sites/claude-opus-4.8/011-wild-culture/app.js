(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* Mobile navigation toggle */
	const toggle = document.querySelector(".nav-toggle");
	const mobileNav = document.getElementById("mobile-nav");
	if (toggle && mobileNav) {
		const setOpen = (open) => {
			toggle.setAttribute("aria-expanded", String(open));
			mobileNav.hidden = !open;
		};
		toggle.addEventListener("click", () => {
			setOpen(toggle.getAttribute("aria-expanded") !== "true");
		});
		mobileNav.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => setOpen(false));
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
				setOpen(false);
				toggle.focus();
			}
		});
	}

	/* Bubbling ferment jar in the hero */
	const ferment = document.getElementById("ferment");
	if (ferment && !reduceMotion) {
		for (let i = 0; i < 12; i += 1) {
			const bubble = document.createElement("span");
			bubble.className = "b";
			const size = 4 + Math.random() * 12;
			bubble.style.width = size + "px";
			bubble.style.height = size + "px";
			bubble.style.left = (6 + Math.random() * 84) + "%";
			bubble.style.animationDuration = (3.2 + Math.random() * 3.4) + "s";
			bubble.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
			ferment.appendChild(bubble);
		}
	}
})();
