(() => {
	"use strict";

	/* Scroll reveal (respects reduced motion) */
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const reveals = document.querySelectorAll(".reveal");
	if (reduce || !("IntersectionObserver" in window)) {
		reveals.forEach((el) => el.classList.add("in"));
	} else {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("in");
						io.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
		);
		reveals.forEach((el) => io.observe(el));
	}

	/* Skin quiz */
	const quiz = document.getElementById("quiz-card");
	if (!quiz) return;

	const questions = [
		{
			q: "By late afternoon, your skin usually feels…",
			options: [
				{ label: "Tight and papery", tag: "dry" },
				{ label: "Shiny through the T-zone", tag: "oily" },
				{ label: "Comfortable, then reactive", tag: "sensitive" },
				{ label: "Balanced but a little dull", tag: "normal" },
			],
		},
		{
			q: "What are you most hoping to soften?",
			options: [
				{ label: "Redness and stinging", tag: "sensitive" },
				{ label: "Flaking and rough patches", tag: "dry" },
				{ label: "Congestion and shine", tag: "oily" },
				{ label: "A tired, uneven look", tag: "normal" },
			],
		},
		{
			q: "How does your barrier react to new actives?",
			options: [
				{ label: "It flares almost instantly", tag: "sensitive" },
				{ label: "It drinks them up, stays calm", tag: "normal" },
				{ label: "It gets greasy or breaks out", tag: "oily" },
				{ label: "It tolerates them but dries out", tag: "dry" },
			],
		},
		{
			q: "The finish you want at the end of a ritual is…",
			options: [
				{ label: "Cushioned and nourished", tag: "dry" },
				{ label: "Fresh and weightless", tag: "oily" },
				{ label: "Bare, soothed, undisturbed", tag: "sensitive" },
				{ label: "Soft-lit and even", tag: "normal" },
			],
		},
	];

	const results = {
		dry: {
			title: "The Replenish Ritual",
			text: "Your barrier is thirsty. A cushion of ceramides and squalane will rebuild moisture without heaviness.",
			recs: ["Barrier Balm Cleanser", "Ceramide Veil Serum", "Rich Repair Cream"],
		},
		oily: {
			title: "The Rebalance Ritual",
			text: "You need clarity, not stripping. Gentle acids and niacinamide calm shine while keeping the barrier intact.",
			recs: ["Milk-to-Foam Cleanser", "Niacinamide Fluid", "Weightless Gel Moisturizer"],
		},
		sensitive: {
			title: "The Soothe Ritual",
			text: "Less is the luxury here. A short, fragrance-free routine quiets reactivity and reinforces your defenses.",
			recs: ["Calm Cream Cleanser", "Panthenol Recovery Serum", "Barrier Shield Cream"],
		},
		normal: {
			title: "The Radiance Ritual",
			text: "Your barrier is steady — now we polish. Antioxidants and light exfoliation bring back a quiet glow.",
			recs: ["Gentle Gel Cleanser", "Vitamin C Softening Serum", "Featherlight Day Cream"],
		},
	};

	const total = questions.length;
	const answers = new Array(total).fill(null);
	let current = 0;

	const bar = quiz.querySelector(".quiz-progress i");
	const count = quiz.querySelector(".quiz-count");
	const stage = quiz.querySelector(".quiz-stage");
	const back = quiz.querySelector('[data-role="back"]');
	const next = quiz.querySelector('[data-role="next"]');
	const restart = quiz.querySelector('[data-role="restart"]');

	function tally() {
		const score = {};
		answers.forEach((tag) => {
			if (tag) score[tag] = (score[tag] || 0) + 1;
		});
		let best = "normal";
		let max = -1;
		Object.keys(score).forEach((tag) => {
			if (score[tag] > max) {
				max = score[tag];
				best = tag;
			}
		});
		return best;
	}

	function renderQuestion() {
		const item = questions[current];
		bar.style.width = ((current) / total) * 100 + "%";
		count.textContent = "Question " + (current + 1) + " of " + total;
		next.textContent = current === total - 1 ? "See my ritual" : "Next";
		back.hidden = current === 0;
		restart.hidden = true;
		next.hidden = false;

		const opts = item.options
			.map((opt, i) => {
				const pressed = answers[current] === opt.tag ? "true" : "false";
				return (
					'<button class="opt" type="button" role="radio" aria-pressed="' +
					pressed +
					'" aria-checked="' +
					pressed +
					'" data-tag="' +
					opt.tag +
					'" data-i="' +
					i +
					'"><span class="tick" aria-hidden="true">' +
					checkSvg +
					"</span><span>" +
					opt.label +
					"</span></button>"
				);
			})
			.join("");

		stage.innerHTML =
			'<h3 class="quiz-q" id="quiz-q">' +
			item.q +
			'</h3><div class="quiz-options" role="radiogroup" aria-labelledby="quiz-q">' +
			opts +
			"</div>";

		syncNext();
		const first = stage.querySelector(".opt");
		if (first) first.focus();
	}

	function syncNext() {
		next.disabled = !answers[current];
		next.style.opacity = answers[current] ? "1" : "0.55";
	}

	function renderResult() {
		bar.style.width = "100%";
		count.textContent = "Complete";
		next.hidden = true;
		back.hidden = true;
		restart.hidden = false;

		const r = results[tally()];
		const chips = r.recs.map((n) => '<span class="chip">' + n + "</span>").join("");
		stage.innerHTML =
			'<div class="quiz-result"><div class="rmark" aria-hidden="true">' +
			leafSvg +
			"</div><h3>" +
			r.title +
			"</h3><p>" +
			r.text +
			'</p><div class="recs">' +
			chips +
			'</div><a class="btn btn-primary" href="#collection">Shop these picks</a></div>';
		stage.querySelector("h3").setAttribute("tabindex", "-1");
		stage.querySelector("h3").focus();
	}

	stage.addEventListener("click", (e) => {
		const btn = e.target.closest(".opt");
		if (!btn) return;
		answers[current] = btn.dataset.tag;
		stage.querySelectorAll(".opt").forEach((o) => {
			const on = o === btn;
			o.setAttribute("aria-pressed", on ? "true" : "false");
			o.setAttribute("aria-checked", on ? "true" : "false");
		});
		syncNext();
	});

	stage.addEventListener("keydown", (e) => {
		if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		const opts = Array.from(stage.querySelectorAll(".opt"));
		const idx = opts.indexOf(document.activeElement);
		if (idx === -1) return;
		e.preventDefault();
		const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
		const nextEl = opts[(idx + dir + opts.length) % opts.length];
		nextEl.focus();
	});

	next.addEventListener("click", () => {
		if (!answers[current]) return;
		if (current === total - 1) {
			renderResult();
		} else {
			current += 1;
			renderQuestion();
		}
	});

	back.addEventListener("click", () => {
		if (current > 0) {
			current -= 1;
			renderQuestion();
		}
	});

	restart.addEventListener("click", () => {
		current = 0;
		answers.fill(null);
		renderQuestion();
	});

	const checkSvg =
		'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
	const leafSvg =
		'<svg viewBox="0 0 48 48" width="62" height="62" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M40 8C22 8 12 18 12 32c0 4 1 8 1 8s4-2 8-2c14 0 18-10 19-30Z"/><path d="M14 40C22 30 30 22 38 16"/></svg>';

	renderQuestion();
})();
