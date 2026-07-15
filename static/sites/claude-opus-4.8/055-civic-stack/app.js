(() => {
	"use strict";

	const toggle = document.querySelector(".nav-toggle");
	const list = document.getElementById("nav-list");
	if (!toggle || !list) return;

	const setOpen = (open) => {
		list.classList.toggle("open", open);
		toggle.setAttribute("aria-expanded", String(open));
	};

	toggle.addEventListener("click", () => {
		setOpen(toggle.getAttribute("aria-expanded") !== "true");
	});

	// Close the mobile menu after choosing a destination.
	list.addEventListener("click", (event) => {
		if (event.target.closest("a")) setOpen(false);
	});

	// Dismiss on Escape for keyboard users.
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") setOpen(false);
	});

	// Reset menu state when leaving the mobile breakpoint.
	const mq = window.matchMedia("(min-width: 641px)");
	const sync = () => { if (mq.matches) setOpen(false); };
	mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
})();
