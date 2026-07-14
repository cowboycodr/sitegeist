(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- Year ---- */
	const yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	/* ---- Sticky header state ---- */
	const head = document.querySelector(".site-head");
	const onScroll = () => {
		if (!head) return;
		head.classList.toggle("scrolled", window.scrollY > 12);
	};
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	/* ---- Seamless marquee (double the text) ---- */
	const marquee = document.querySelector(".marquee");
	if (marquee && !reduceMotion) {
		marquee.textContent = marquee.textContent.trim() + " " + marquee.textContent.trim() + " ";
	}

	/* ---- Expedition cards ---- */
	const routes = [
		{
			region: "Sub-polar Atlantic",
			name: "The Windward Fjords",
			blurb: "A road-less coast reached only by sea. Nineteen hours of open water for one week of absolute quiet.",
			days: "11 days",
			status: "1 party open",
			motif: "fjord",
		},
		{
			region: "Horn of Africa",
			name: "Salt & Silence",
			blurb: "The Danakil at first light — mirage horizons, sulphur fields, and a geologist who reads the ground like scripture.",
			days: "9 days",
			status: "Provisional",
			motif: "desert",
		},
		{
			region: "Central Asia",
			name: "Beneath the Karakoram",
			blurb: "High-valley days with a family whose orchard predates the border. Apricots on the roof, snow on the passes.",
			days: "14 days",
			status: "1 party open",
			motif: "peak",
		},
		{
			region: "Southern Ocean",
			name: "The Last Meridian",
			blurb: "Sub-antarctic islands where the wind has never met a fence. Albatross weather and a single anchorage.",
			days: "16 days",
			status: "Waitlist",
			motif: "wave",
		},
	];

	const motifs = {
		fjord: '<svg viewBox="0 0 200 92" fill="none" stroke="#caa46a" stroke-width="1.3"><path d="M0 70 L34 30 L52 60 L84 20 L108 62 L142 34 L170 66 L200 40" opacity=".85"/><path d="M0 82 Q100 74 200 82" stroke="#e4c98f" opacity=".5"/></svg>',
		desert: '<svg viewBox="0 0 200 92" fill="none" stroke="#caa46a" stroke-width="1.3"><path d="M0 74 Q50 52 100 70 T200 66" opacity=".85"/><path d="M0 84 Q60 70 120 82 T200 78" stroke="#e4c98f" opacity=".5"/><circle cx="150" cy="28" r="12" stroke="#e4c98f" opacity=".7"/></svg>',
		peak: '<svg viewBox="0 0 200 92" fill="none" stroke="#caa46a" stroke-width="1.3"><path d="M0 82 L48 22 L78 56 L112 14 L150 62 L200 30" opacity=".85"/><path d="M40 30 L48 22 L57 32 M104 24 L112 14 L121 26" stroke="#e4c98f" opacity=".7"/></svg>',
		wave: '<svg viewBox="0 0 200 92" fill="none" stroke="#caa46a" stroke-width="1.3"><path d="M0 58 Q25 40 50 58 T100 58 T150 58 T200 58" opacity=".85"/><path d="M0 74 Q25 58 50 74 T100 74 T150 74 T200 74" stroke="#e4c98f" opacity=".5"/></svg>',
	};

	const cards = document.getElementById("cards");
	if (cards) {
		routes.forEach((r) => {
			const el = document.createElement("article");
			el.className = "card";
			el.innerHTML =
				'<span class="card-glow" aria-hidden="true"></span>' +
				'<div class="card-fig" aria-hidden="true">' + motifs[r.motif] + "</div>" +
				'<p class="card-region">' + r.region + "</p>" +
				"<h3>" + r.name + "</h3>" +
				"<p>" + r.blurb + "</p>" +
				'<div class="card-meta"><span class="days">' + r.days + '</span><span class="status">' + r.status + "</span></div>";
			cards.appendChild(el);
		});
	}

	/* ---- Form (client-only, sends nothing) ---- */
	const form = document.getElementById("enquiry");
	const status = document.getElementById("form-status");
	if (form && status) {
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const name = form.querySelector("#f-name");
			const email = form.querySelector("#f-email");
			if (!name.value.trim()) {
				status.textContent = "Please share a name so we know who is calling.";
				name.focus();
				return;
			}
			if (!email.checkValidity() || !email.value.trim()) {
				status.textContent = "A valid email lets the desk write back.";
				email.focus();
				return;
			}
			const first = name.value.trim().split(/\s+/)[0];
			status.textContent = "Thank you, " + first + ". The desk will reply within two working days.";
			form.reset();
		});
	}

	/* ---- Hero terrain: layered contour lines on canvas ---- */
	const canvas = document.getElementById("terrain");
	if (canvas && canvas.getContext) {
		const ctx = canvas.getContext("2d");
		let w = 0, h = 0, dpr = 1;
		const LINES = 26;

		const noise = (x, seed) =>
			Math.sin(x * 0.9 + seed) * 0.5 +
			Math.sin(x * 2.3 + seed * 1.7) * 0.28 +
			Math.sin(x * 4.7 + seed * 0.6) * 0.14;

		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const draw = (t) => {
			ctx.clearRect(0, 0, w, h);
			for (let i = 0; i < LINES; i++) {
				const p = i / (LINES - 1);
				const baseY = h * (0.12 + p * 0.95);
				const amp = 26 + p * 70;
				const seed = i * 0.6 + t * 0.00013;
				ctx.beginPath();
				const step = Math.max(6, w / 90);
				for (let x = -20; x <= w + 20; x += step) {
					const nx = x / w * 6;
					const y = baseY + noise(nx, seed) * amp;
					if (x <= -20) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				const alpha = 0.05 + p * 0.16;
				ctx.strokeStyle = "rgba(202,164,106," + alpha.toFixed(3) + ")";
				ctx.lineWidth = 1;
				ctx.stroke();
			}
		};

		resize();
		window.addEventListener("resize", resize, { passive: true });

		if (reduceMotion) {
			draw(0);
		} else {
			let raf = 0;
			const loop = (t) => {
				draw(t);
				raf = requestAnimationFrame(loop);
			};
			raf = requestAnimationFrame(loop);
			document.addEventListener("visibilitychange", () => {
				if (document.hidden) {
					cancelAnimationFrame(raf);
				} else {
					raf = requestAnimationFrame(loop);
				}
			});
		}
	}

	/* ---- Bridge pull-state: soften hero during viewer dismissal ---- */
	document.addEventListener("sitegeist:pull-state", (e) => {
		const active = e && e.detail && e.detail.active;
		document.body.style.filter = active ? "saturate(0.85)" : "";
	});
})();
