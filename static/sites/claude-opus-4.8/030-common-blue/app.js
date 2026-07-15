(() => {
	"use strict";

	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* --- Mobile nav toggle --- */
	const toggle = document.querySelector(".nav-toggle");
	const navList = document.getElementById("nav-list");
	if (toggle && navList) {
		const closeNav = () => {
			navList.classList.remove("open");
			toggle.setAttribute("aria-expanded", "false");
		};
		toggle.addEventListener("click", () => {
			const open = navList.classList.toggle("open");
			toggle.setAttribute("aria-expanded", String(open));
		});
		navList.addEventListener("click", (event) => {
			if (event.target.closest("a")) closeNav();
		});
		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") closeNav();
		});
	}

	/* --- Project filter --- */
	const chips = Array.from(document.querySelectorAll(".chip"));
	const cards = Array.from(document.querySelectorAll("#project-grid .card"));
	const empty = document.getElementById("filter-empty");
	if (chips.length && cards.length) {
		chips.forEach((chip) => {
			chip.addEventListener("click", () => {
				const filter = chip.dataset.filter;
				chips.forEach((c) => {
					const active = c === chip;
					c.classList.toggle("is-active", active);
					c.setAttribute("aria-pressed", String(active));
				});
				let visible = 0;
				cards.forEach((card) => {
					const show = filter === "all" || card.dataset.focus === filter;
					card.classList.toggle("is-hidden", !show);
					if (show) visible += 1;
				});
				if (empty) empty.hidden = visible !== 0;
			});
		});
	}

	/* --- Impact counters --- */
	const nums = Array.from(document.querySelectorAll(".impact-item .num"));
	const formatValue = (value, decimals) =>
		decimals > 0
			? value.toFixed(decimals)
			: Math.round(value).toLocaleString("en-US");

	const runCounter = (el) => {
		const target = parseFloat(el.dataset.to);
		const suffix = el.dataset.suffix || "";
		const decimals = parseInt(el.dataset.decimals || "0", 10);
		if (prefersReducedMotion) {
			el.textContent = formatValue(target, decimals) + suffix;
			return;
		}
		const duration = 1400;
		const start = performance.now();
		const step = (now) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			el.textContent = formatValue(target * eased, decimals) + suffix;
			if (t < 1) requestAnimationFrame(step);
			else el.textContent = formatValue(target, decimals) + suffix;
		};
		requestAnimationFrame(step);
	};

	if (nums.length) {
		if ("IntersectionObserver" in window) {
			const io = new IntersectionObserver((entries, obs) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						runCounter(entry.target);
						obs.unobserve(entry.target);
					}
				});
			}, { threshold: 0.4 });
			nums.forEach((n) => io.observe(n));
		} else {
			nums.forEach(runCounter);
		}
	}

	/* --- Join form validation (fully local) --- */
	const form = document.getElementById("join-form");
	if (form) {
		const status = document.getElementById("form-status");
		const setError = (name, message) => {
			const field = form.querySelector(`[name="${name}"]`).closest(".field");
			const slot = form.querySelector(`.field-error[data-for="${name}"]`);
			if (field) field.classList.toggle("invalid", Boolean(message));
			if (slot) slot.textContent = message || "";
		};

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const data = new FormData(form);
			let firstInvalid = null;

			const name = (data.get("name") || "").toString().trim();
			const email = (data.get("email") || "").toString().trim();
			const region = (data.get("region") || "").toString().trim();

			const nameErr = name ? "" : "Please tell us your name.";
			const emailErr = !email
				? "We need an email to reach you."
				: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
					? ""
					: "That email doesn't look right.";
			const regionErr = region ? "" : "Pick your nearest coastline.";

			setError("name", nameErr);
			setError("email", emailErr);
			setError("region", regionErr);

			if (nameErr) firstInvalid = firstInvalid || "name";
			if (emailErr) firstInvalid = firstInvalid || "email";
			if (regionErr) firstInvalid = firstInvalid || "region";

			if (firstInvalid) {
				status.textContent = "Please fix the highlighted fields.";
				status.classList.remove("success");
				const el = form.querySelector(`[name="${firstInvalid}"]`);
				if (el) el.focus();
				return;
			}

			status.textContent = `Thanks, ${name}! A coordinator for ${region} will reach out soon.`;
			status.classList.add("success");
			form.reset();
		});

		form.addEventListener("input", (event) => {
			const field = event.target.closest(".field");
			if (field && field.classList.contains("invalid")) {
				const named = event.target.getAttribute("name");
				if (named) setError(named, "");
			}
		});
	}
})();
