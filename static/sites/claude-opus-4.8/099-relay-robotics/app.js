(() => {
	"use strict";

	// Accessible tabs for the "Where it works" section.
	const tablist = document.querySelector(".tablist");
	if (tablist) {
		const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

		const select = (tab, setFocus) => {
			tabs.forEach((t) => {
				const active = t === tab;
				t.classList.toggle("is-active", active);
				t.setAttribute("aria-selected", active ? "true" : "false");
				t.tabIndex = active ? 0 : -1;
				const panel = document.getElementById(t.getAttribute("aria-controls"));
				if (panel) {
					panel.classList.toggle("is-active", active);
					panel.hidden = !active;
				}
			});
			if (setFocus) tab.focus();
		};

		tablist.addEventListener("click", (e) => {
			const tab = e.target.closest('[role="tab"]');
			if (tab) select(tab, false);
		});

		tablist.addEventListener("keydown", (e) => {
			const i = tabs.indexOf(document.activeElement);
			if (i === -1) return;
			let next = null;
			if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
			else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
			else if (e.key === "Home") next = tabs[0];
			else if (e.key === "End") next = tabs[tabs.length - 1];
			if (next) {
				e.preventDefault();
				select(next, true);
			}
		});
	}
})();
