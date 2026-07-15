(() => {
	"use strict";

	/* ---- Mobile nav ---- */
	const toggle = document.getElementById("navToggle");
	const links = document.getElementById("navLinks");
	if (toggle && links) {
		toggle.addEventListener("click", () => {
			const open = links.classList.toggle("open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		});
		links.addEventListener("click", (e) => {
			if (e.target.closest("a")) {
				links.classList.remove("open");
				toggle.setAttribute("aria-expanded", "false");
			}
		});
	}

	/* ---- Collection filter ---- */
	const filters = Array.from(document.querySelectorAll(".filter"));
	const pieces = Array.from(document.querySelectorAll(".piece"));
	filters.forEach((btn) => {
		btn.addEventListener("click", () => {
			filters.forEach((f) => f.setAttribute("aria-pressed", "false"));
			btn.setAttribute("aria-pressed", "true");
			const want = btn.dataset.filter;
			pieces.forEach((p) => {
				const show = want === "all" || p.dataset.cat === want;
				p.classList.toggle("hide", !show);
			});
		});
	});

	/* ---- Accordion ---- */
	const accBtns = Array.from(document.querySelectorAll(".acc-btn"));
	const setPanel = (btn, open) => {
		const panel = document.getElementById(btn.getAttribute("aria-controls"));
		btn.setAttribute("aria-expanded", open ? "true" : "false");
		if (!panel) return;
		panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
	};
	accBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const open = btn.getAttribute("aria-expanded") === "true";
			accBtns.forEach((b) => setPanel(b, false));
			setPanel(btn, !open);
		});
	});
	// open the first panel initially
	accBtns.filter((b) => b.getAttribute("aria-expanded") === "true").forEach((b) => setPanel(b, true));
	window.addEventListener("resize", () => {
		accBtns.forEach((b) => {
			if (b.getAttribute("aria-expanded") === "true") {
				const panel = document.getElementById(b.getAttribute("aria-controls"));
				if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
			}
		});
	});

	/* ---- Reveal on scroll ---- */
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const reveals = Array.from(document.querySelectorAll(".reveal"));
	if (reduce || !("IntersectionObserver" in window)) {
		reveals.forEach((el) => el.classList.add("in"));
	} else {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("in");
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
		reveals.forEach((el) => io.observe(el));
	}
})();
