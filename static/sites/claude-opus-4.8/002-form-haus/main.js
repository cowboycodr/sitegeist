(() => {
	"use strict";

	// Mobile navigation toggle
	const toggle = document.querySelector(".nav-toggle");
	const mobileNav = document.getElementById("mobile-nav");

	const setNav = (open) => {
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
		mobileNav.hidden = !open;
	};

	if (toggle && mobileNav) {
		toggle.addEventListener("click", () => {
			setNav(toggle.getAttribute("aria-expanded") !== "true");
		});
		mobileNav.addEventListener("click", (event) => {
			if (event.target.tagName === "A") setNav(false);
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
				setNav(false);
				toggle.focus();
			}
		});
	}

	// Scroll reveal, respecting reduced-motion
	const reveals = Array.from(document.querySelectorAll(".reveal"));
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (reduce || !("IntersectionObserver" in window)) {
		reveals.forEach((el) => el.classList.add("is-in"));
	} else {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-in");
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
		reveals.forEach((el) => observer.observe(el));
	}
})();
