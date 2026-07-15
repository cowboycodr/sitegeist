(() => {
	"use strict";

	// Reflect pull-to-dismiss state from the viewer bridge (optional, non-essential).
	document.addEventListener("sitegeist:pull-state", (event) => {
		const active = event && event.detail && event.detail.active;
		document.documentElement.classList.toggle("is-pulling", !!active);
	});

	// Lightweight email capture demo — no network, no storage.
	const form = document.querySelector(".open-form");
	const input = document.getElementById("email");
	const note = document.getElementById("formNote");
	if (!form || !input || !note) return;

	const valid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const value = input.value;
		if (!valid(value)) {
			note.textContent = "Please enter a valid email address.";
			note.className = "form-note err";
			input.focus();
			return;
		}
		note.textContent = "Thanks — your Orbit invite is on its way.";
		note.className = "form-note ok";
		form.reset();
	});

	input.addEventListener("input", () => {
		if (note.classList.contains("err") && valid(input.value)) {
			note.textContent = "We only use your email to send your invite.";
			note.className = "form-note";
		}
	});
})();
