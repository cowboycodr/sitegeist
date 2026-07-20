(() => {
	"use strict";

	// Mobile navigation toggle
	const toggle = document.querySelector(".nav-toggle");
	const nav = document.getElementById("site-nav");
	if (toggle && nav) {
		toggle.addEventListener("click", () => {
			const open = nav.classList.toggle("is-open");
			toggle.setAttribute("aria-expanded", String(open));
		});
		nav.addEventListener("click", (event) => {
			if (event.target instanceof HTMLAnchorElement) {
				nav.classList.remove("is-open");
				toggle.setAttribute("aria-expanded", "false");
			}
		});
	}

	// Wonder Machine question generator
	const questions = [
		"Why do cats always land on their feet?",
		"Where does the wind start?",
		"Do fish get thirsty?",
		"Why is the moon following me?",
		"What color is a mirror?",
		"Why do onions make us cry but not carrots?",
		"How does the sky hold up all that rain?",
		"Why can't we tickle ourselves?",
		"Where does the dark go in the morning?",
		"Do worms have favorite foods?",
		"Why do our fingers wrinkle in the bath?",
		"How do birds know where south is?",
		"Why does hot chocolate taste better in winter?",
		"What are shadows made of?",
		"Why do we forget our dreams?",
		"How heavy is a cloud?",
	];
	const questionEl = document.getElementById("wonder-question");
	const questionBtn = document.getElementById("wonder-button");
	if (questionEl && questionBtn) {
		let last = 0;
		questionBtn.addEventListener("click", () => {
			let next = last;
			while (next === last) {
				next = Math.floor(Math.random() * questions.length);
			}
			last = next;
			questionEl.textContent = questions[next];
		});
	}
})();
