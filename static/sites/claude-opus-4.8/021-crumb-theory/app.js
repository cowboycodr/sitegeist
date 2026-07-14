(() => {
	"use strict";

	// Today's date label
	const dateEl = document.getElementById("today-date");
	if (dateEl) {
		try {
			dateEl.textContent = new Date().toLocaleDateString(undefined, {
				weekday: "long",
				month: "long",
				day: "numeric",
			});
		} catch (_) {
			/* keep fallback text */
		}
	}

	// Counter filtering
	const grid = document.getElementById("counter-grid");
	const chips = Array.from(document.querySelectorAll(".chip"));
	const countEl = document.getElementById("count-n");
	const emptyNote = document.getElementById("empty-note");

	const applyFilter = (filter) => {
		if (!grid) return;
		let shown = 0;
		grid.querySelectorAll(".card").forEach((card) => {
			const match = filter === "all" || card.dataset.cat === filter;
			card.hidden = !match;
			if (match) shown += 1;
		});
		if (countEl) countEl.textContent = String(shown);
		if (emptyNote) emptyNote.hidden = shown !== 0;
	};

	chips.forEach((chip) => {
		chip.addEventListener("click", () => {
			chips.forEach((c) => {
				const on = c === chip;
				c.classList.toggle("is-on", on);
				c.setAttribute("aria-pressed", on ? "true" : "false");
			});
			applyFilter(chip.dataset.filter);
		});
	});

	// Preorder reservation (no network — local confirmation only)
	const reserveBtn = document.getElementById("reserve-btn");
	const status = document.getElementById("reserve-status");
	if (reserveBtn && status) {
		let reserved = false;
		reserveBtn.addEventListener("click", () => {
			reserved = !reserved;
			if (reserved) {
				status.textContent = "Held under your name — pick it up warm this weekend.";
				reserveBtn.textContent = "Reserved · tap to release";
			} else {
				status.textContent = "Reservation released. The box is back on the shelf.";
				reserveBtn.textContent = "Reserve this box";
			}
		});
	}
})();
