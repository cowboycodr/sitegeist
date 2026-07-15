/* Bloomline — small progressive enhancements, no network access */
(() => {
	"use strict";

	// Smooth anchor scrolling that respects reduced-motion.
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener("click", (event) => {
			const id = link.getAttribute("href");
			if (!id || id === "#") return;
			const target = document.querySelector(id);
			if (!target) return;
			event.preventDefault();
			target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
			target.setAttribute("tabindex", "-1");
			target.focus({ preventScroll: true });
		});
	});

	// Newsletter form — purely local acknowledgement, no submission.
	const form = document.getElementById("signup-form");
	const note = document.getElementById("signup-note");
	if (form && note) {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const input = form.querySelector("input[type='email']");
			const value = input ? input.value.trim() : "";
			if (!value) {
				note.textContent = "Add an email and we'll send the seasonal notes.";
				note.removeAttribute("data-state");
				if (input) input.focus();
				return;
			}
			note.textContent = "You're on the list — first stems land in your inbox.";
			note.setAttribute("data-state", "ok");
			form.reset();
		});
	}

	// Reveal-on-scroll for cards and sections.
	const revealables = document.querySelectorAll("[data-reveal]");
	if (!reduce && "IntersectionObserver" in window) {
		revealables.forEach((el) => { el.style.opacity = "0"; el.style.transform = "translateY(18px)"; });
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
				el.style.opacity = "1";
				el.style.transform = "none";
				io.unobserve(el);
			});
		}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
		revealables.forEach((el) => io.observe(el));
	}
})();
