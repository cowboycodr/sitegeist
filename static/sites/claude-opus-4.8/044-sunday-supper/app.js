(() => {
	"use strict";

	// --- Hours: highlight today & compute open/closed ---------------------
	const schedule = {
		0: [16, 21], // Sunday 4–9
		1: null,     // Monday closed
		2: [17, 22], 3: [17, 22], 4: [17, 22],
		5: [17, 23], 6: [17, 23],
	};
	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const now = new Date();
	const today = now.getDay();
	const hourNow = now.getHours() + now.getMinutes() / 60;

	const list = document.getElementById("hours-list");
	if (list) {
		const item = list.querySelector('li[data-day="' + today + '"]');
		if (item) item.classList.add("today");
	}

	const statusEl = document.getElementById("hours-status");
	if (statusEl) {
		const span = schedule[today];
		let open = false;
		if (span && hourNow >= span[0] && hourNow < span[1]) open = true;

		let msg;
		if (open) {
			msg = "We're open right now — the kitchen is on.";
		} else {
			// find next opening
			let nextMsg = "";
			for (let i = 0; i <= 7; i += 1) {
				const d = (today + i) % 7;
				const s = schedule[d];
				if (!s) continue;
				if (i === 0 && hourNow < s[0]) { nextMsg = "opens today at 5"; break; }
				if (i === 0 && hourNow >= s[1]) continue;
				if (i === 1) { nextMsg = "opens tomorrow"; break; }
				if (i > 1) { nextMsg = "opens " + dayNames[d]; break; }
			}
			msg = "Closed at the moment — " + (nextMsg || "back soon") + ".";
		}
		statusEl.innerHTML =
			'<span class="dot ' + (open ? "open" : "closed") + '"></span>' + msg;
	}

	// --- Reservation form: client-side confirmation only ------------------
	const form = document.getElementById("reserve-form");
	const dateInput = document.getElementById("r-date");
	const msgEl = document.getElementById("form-msg");

	if (dateInput) {
		const pad = (n) => String(n).padStart(2, "0");
		const iso = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
		dateInput.min = iso;
		dateInput.value = iso;
	}

	if (form && msgEl) {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const name = form.elements.name.value.trim();
			const date = form.elements.date.value;
			if (!name) {
				msgEl.textContent = "Please add a name so we know who to expect.";
				msgEl.className = "form-msg err";
				form.elements.name.focus();
				return;
			}
			if (!date) {
				msgEl.textContent = "Pick a date for your table, please.";
				msgEl.className = "form-msg err";
				return;
			}
			const guests = form.elements.guests.value;
			const time = form.elements.time.value;
			const when = new Date(date + "T00:00:00");
			const pretty = isNaN(when)
				? date
				: when.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
			msgEl.textContent =
				"Thanks, " + name + " — request noted for " + guests +
				" at " + time + ", " + pretty + ". We'll confirm by text shortly.";
			msgEl.className = "form-msg ok";
			form.reset();
			if (dateInput) dateInput.value = dateInput.min;
		});
	}
})();
