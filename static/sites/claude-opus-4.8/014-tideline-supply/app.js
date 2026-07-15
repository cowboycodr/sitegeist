(() => {
	"use strict";

	const toggle = document.querySelector(".nav-toggle");
	const nav = document.getElementById("site-nav");
	if (!toggle || !nav) return;

	const close = () => {
		nav.classList.remove("open");
		toggle.setAttribute("aria-expanded", "false");
	};

	toggle.addEventListener("click", () => {
		const open = nav.classList.toggle("open");
		toggle.setAttribute("aria-expanded", open ? "true" : "false");
	});

	nav.addEventListener("click", (event) => {
		if (event.target.closest("a")) close();
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") close();
	});

	// The viewer bridge announces pull-to-dismiss gestures; collapse the
	// mobile menu if one begins so it never overlaps the gesture surface.
	document.addEventListener("sitegeist:pull-state", (event) => {
		if (event.detail && event.detail.active) close();
	});
})();
