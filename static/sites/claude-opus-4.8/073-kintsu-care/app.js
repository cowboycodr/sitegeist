(() => {
	"use strict";

	// Footer year
	const yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	// Range value mirror
	const range = document.getElementById("energy");
	const rangeVal = document.getElementById("energy-val");
	if (range && rangeVal) {
		const sync = () => { rangeVal.textContent = range.value; };
		range.addEventListener("input", sync);
		sync();
	}

	// Check-in form -> gentle reflection (fully local, no network)
	const form = document.getElementById("checkin-form");
	const result = document.getElementById("reflect");
	const titleEl = document.getElementById("reflect-title");
	const bodyEl = document.getElementById("reflect-body");
	const mirrorEl = document.getElementById("reflect-mirror");
	const streakPips = document.getElementById("streak-pips");
	const streakLabel = document.getElementById("streak-label");
	if (!form || !result) return;

	const responses = {
		steady: {
			title: "A steady day noticed",
			body: "Steadiness is quietly hard-won. Naming it helps it hold. Consider a small anchor for tomorrow — the same walk, the same tea, the same first breath.",
		},
		bright: {
			title: "Something bright to keep",
			body: "Lighter days are worth studying, not just enjoying. What made room for this? Jot the ingredient down so future-you can reach for it.",
		},
		heavy: {
			title: "A heavier day, gently held",
			body: "You showed up to name it, and that counts. Heaviness asks for smaller steps, not solutions. Rest, water, and one kind message to yourself are enough for now.",
		},
		frayed: {
			title: "Frayed edges, seen clearly",
			body: "When things feel scattered, one thread at a time is plenty. Pick the nearest small task, finish it, and let that be the whole plan for the next hour.",
		},
		numb: {
			title: "A flat, quiet day",
			body: "Numbness is information, not failure. Warmth, movement, or a familiar voice can loosen it. If flatness lingers for weeks, your therapist is a good place to bring it.",
		},
	};

	const energyLine = (n) => {
		if (n <= 3) return "Energy is low today — plan for less and forgive the pace.";
		if (n <= 6) return "Energy is middling — protect it by choosing fewer, kinder tasks.";
		return "Energy is fuller today — a good moment for the thing you keep postponing.";
	};

	let streak = 0;
	const renderStreak = () => {
		if (!streakPips || !streakLabel) return;
		streakPips.innerHTML = "";
		const total = 5;
		for (let i = 0; i < total; i += 1) {
			const pip = document.createElement("span");
			pip.className = "pip" + (i < Math.min(streak, total) ? " on" : "");
			streakPips.appendChild(pip);
		}
		streakLabel.textContent = streak === 1 ? "1 check-in this session" : streak + " check-ins this session";
	};
	renderStreak();

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const mood = form.querySelector('input[name="mood"]:checked');
		const key = mood ? mood.value : "steady";
		const data = responses[key] || responses.steady;
		const energy = range ? Number(range.value) : 5;
		const note = (document.getElementById("note")?.value || "").trim();

		titleEl.textContent = data.title;
		bodyEl.textContent = data.body + " " + energyLine(energy);

		if (note) {
			const trimmed = note.length > 180 ? note.slice(0, 177) + "…" : note;
			mirrorEl.textContent = "“" + trimmed + "”";
			mirrorEl.hidden = false;
		} else {
			mirrorEl.hidden = true;
		}

		streak += 1;
		renderStreak();

		result.hidden = false;
		result.setAttribute("aria-live", "polite");
		result.focus({ preventScroll: false });
	});
})();
