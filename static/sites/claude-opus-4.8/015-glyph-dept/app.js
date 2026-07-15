(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const $ = (id) => document.getElementById(id);
	const specimen = $("specimen");
	const stage = specimen ? specimen.parentElement : null;
	const textInput = $("sampleText");

	const axes = {
		weight: { input: $("ctlWeight"), out: $("outWeight") },
		width: { input: $("ctlWidth"), out: $("outWidth") },
		size: { input: $("ctlSize"), out: $("outSize") },
		track: { input: $("ctlTrack"), out: $("outTrack") },
		slant: { input: $("ctlSlant"), out: $("outSlant") },
	};

	// Visual fill for the range track.
	function paintRange(input) {
		const min = Number(input.min);
		const max = Number(input.max);
		const val = Number(input.value);
		const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
		input.style.setProperty("--fill", pct + "%");
	}

	// Apply every axis to the specimen and keep it inside the stage.
	function render() {
		if (!specimen) return;
		const weight = Number(axes.weight.input.value);
		const width = Number(axes.width.input.value);
		const size = Number(axes.size.input.value);
		const track = Number(axes.track.input.value);
		const slant = Number(axes.slant.input.value);

		axes.weight.out.textContent = weight;
		axes.width.out.textContent = width;
		axes.size.out.textContent = size;
		axes.track.out.textContent = track;
		axes.slant.out.textContent = slant;

		specimen.style.fontWeight = weight;
		specimen.style.fontSize = size + "px";
		specimen.style.letterSpacing = (track / 100) + "em";

		const scaleX = width / 100;
		const skew = -slant;
		// Reset horizontal scale before measuring so the fit stays accurate.
		specimen.style.transform = "scaleX(" + scaleX + ") skewX(" + skew + "deg)";
		fit(scaleX, skew);
	}

	// Shrink the whole specimen if it would spill past the stage padding.
	function fit(scaleX, skew) {
		if (!stage) return;
		specimen.style.transform = "scaleX(" + scaleX + ") skewX(" + skew + "deg)";
		const avail = stage.clientWidth - 40;
		const rect = specimen.getBoundingClientRect();
		if (rect.width > avail && rect.width > 0) {
			const shrink = avail / rect.width;
			specimen.style.transform =
				"scale(" + (scaleX * shrink) + ", " + shrink + ") skewX(" + skew + "deg)";
		}
	}

	Object.values(axes).forEach(({ input }) => {
		if (!input) return;
		paintRange(input);
		input.addEventListener("input", () => {
			paintRange(input);
			render();
		});
	});

	if (textInput && specimen) {
		textInput.addEventListener("input", () => {
			const value = textInput.value.trim();
			specimen.textContent = value || "Handgloves";
			render();
		});
	}

	// Presets snap the axes to a curated look.
	const presets = {
		poster: { weight: 900, width: 155, size: 128, track: -2, slant: 0 },
		editorial: { weight: 400, width: 100, size: 76, track: 1, slant: 0 },
		condensed: { weight: 700, width: 62, size: 112, track: 4, slant: -8 },
		reset: { weight: 600, width: 100, size: 88, track: 0, slant: 0 },
	};

	document.querySelectorAll("[data-preset]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const preset = presets[btn.dataset.preset];
			if (!preset) return;
			Object.entries(preset).forEach(([key, val]) => {
				const axis = axes[key];
				if (!axis || !axis.input) return;
				axis.input.value = val;
				paintRange(axis.input);
			});
			render();
		});
	});

	window.addEventListener("resize", render, { passive: true });

	// Subtle scroll-driven stretch on the hero words (motion-optional).
	if (!reduceMotion) {
		const words = Array.from(document.querySelectorAll(".hero-title .line"));
		let ticking = false;
		const update = () => {
			ticking = false;
			const y = window.scrollY || 0;
			words.forEach((word, i) => {
				const s = 1 + Math.min(0.28, y / 1400) * (1 + i * 0.35);
				word.style.transform = "scaleX(" + s.toFixed(3) + ")";
			});
		};
		window.addEventListener(
			"scroll",
			() => {
				if (ticking) return;
				ticking = true;
				requestAnimationFrame(update);
			},
			{ passive: true }
		);
		update();
	}

	// Reset from the bridge's pull-to-dismiss gesture state (no-op visual hook).
	document.addEventListener("sitegeist:pull-state", () => {});

	render();
})();
