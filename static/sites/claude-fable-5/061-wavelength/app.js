/* Wavelength — hero waveform, seasonal spectrogram, local call synthesis */
(() => {
	"use strict";

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* Deterministic pseudo-random, so the spectrogram is stable between renders. */
	const mulberry32 = (seed) => () => {
		seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	/* ============ Hero waveform ============ */
	const hero = document.getElementById("hero-wave");
	if (hero) {
		const ctx = hero.getContext("2d");
		let width = 0;
		let height = 0;
		let raf = 0;

		const resize = () => {
			const rect = hero.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = Math.max(1, Math.round(rect.width));
			height = Math.max(1, Math.round(rect.height));
			hero.width = Math.round(width * dpr);
			hero.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const drawFrame = (time) => {
			ctx.clearRect(0, 0, width, height);
			const lines = 5;
			for (let line = 0; line < lines; line += 1) {
				const baseY = height * (0.3 + (line / (lines - 1)) * 0.45);
				const amp = 14 + line * 9;
				const speed = 0.00016 + line * 0.00005;
				const freq = 0.006 - line * 0.0008;
				ctx.beginPath();
				for (let x = 0; x <= width; x += 4) {
					const y = baseY +
						Math.sin(x * freq + time * speed) * amp *
						Math.sin(x * 0.0016 + line + time * 0.0001);
					if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
				}
				ctx.strokeStyle = `rgba(77, 227, 201, ${0.05 + line * 0.035})`;
				ctx.lineWidth = 1.4;
				ctx.stroke();
			}
		};

		const loop = (time) => {
			drawFrame(time);
			raf = requestAnimationFrame(loop);
		};

		const start = () => {
			cancelAnimationFrame(raf);
			if (reducedMotion.matches) drawFrame(12000);
			else raf = requestAnimationFrame(loop);
		};

		resize();
		start();
		window.addEventListener("resize", () => { resize(); if (reducedMotion.matches) drawFrame(12000); });
		reducedMotion.addEventListener("change", start);
	}

	/* ============ Seasonal spectrogram ============ */
	const seasons = {
		winter: {
			seed: 11, storm: 0.75, chorusBand: 0.86, chorusStrength: 1.0, crackle: 0.15,
			caption: "Winter: the 20 Hz fin whale chorus forms a bright unbroken band; storms lift broadband noise above 1 kHz for days at a time.",
		},
		spring: {
			seed: 29, storm: 0.4, chorusBand: 0.62, chorusStrength: 0.75, crackle: 0.4,
			caption: "Spring: humpback song climbs into the mid band as the fin chorus fades; the first zooplankton blooms bring feeding activity back.",
		},
		summer: {
			seed: 47, storm: 0.15, chorusBand: 0.55, chorusStrength: 0.35, crackle: 0.85,
			caption: "Summer: the quietest low band of the year — but reef and shelf crackle peaks, and vessel passages stand out as sharp vertical stripes.",
		},
		autumn: {
			seed: 73, storm: 0.55, chorusBand: 0.8, chorusStrength: 0.6, crackle: 0.5,
			caption: "Autumn: migrating blue and fin whales re-enter from the north while early gales begin to roughen the surface noise floor.",
		},
	};

	const spectro = document.getElementById("spectrogram");
	const caption = document.getElementById("spectro-caption");
	const chips = Array.from(document.querySelectorAll(".chip[data-season]"));

	const drawSeason = (name) => {
		if (!spectro) return;
		const cfg = seasons[name];
		const ctx = spectro.getContext("2d");
		const w = spectro.width;
		const h = spectro.height;
		const rand = mulberry32(cfg.seed);
		const cols = 240;
		const rows = 72;
		const cw = w / cols;
		const rh = h / rows;

		ctx.fillStyle = "#030d17";
		ctx.fillRect(0, 0, w, h);

		/* Vessel passages: a few bright vertical stripes. */
		const vessels = new Set();
		const vesselCount = 3 + Math.round(rand() * 3);
		for (let i = 0; i < vesselCount; i += 1) vessels.add(Math.floor(rand() * cols));

		for (let c = 0; c < cols; c += 1) {
			const stormEnvelope = cfg.storm * (0.5 + 0.5 * Math.sin(c * 0.09 + cfg.seed)) *
				(0.6 + 0.4 * Math.sin(c * 0.023));
			const vessel = vessels.has(c) || vessels.has(c - 1);
			for (let r = 0; r < rows; r += 1) {
				const depth = r / rows;                 /* 0 = top = high frequency */
				const lowBand = 1 - depth;              /* proximity to top */
				let energy = 0.05 + rand() * 0.08;

				/* Ambient noise floor rises toward low frequencies. */
				energy += depth * 0.16;

				/* Whale chorus band. */
				const bandDist = Math.abs(depth - cfg.chorusBand);
				if (bandDist < 0.05) energy += cfg.chorusStrength * (1 - bandDist / 0.05) * (0.55 + rand() * 0.3);

				/* Storm noise lifts the upper half. */
				energy += stormEnvelope * lowBand * 0.5 * (0.6 + rand() * 0.4);

				/* Biological crackle: speckle in the top third. */
				if (depth < 0.34 && rand() < cfg.crackle * 0.22) energy += 0.45 + rand() * 0.35;

				/* Vessel: broadband vertical stripe, strongest low. */
				if (vessel) energy += 0.35 + depth * 0.3;

				energy = Math.min(1, energy);

				/* Cold-to-hot colour map: abyss blue -> teal -> amber. */
				let rC, gC, bC;
				if (energy < 0.45) {
					const t = energy / 0.45;
					rC = 6 + t * 10; gC = 22 + t * 110; bC = 42 + t * 90;
				} else if (energy < 0.75) {
					const t = (energy - 0.45) / 0.3;
					rC = 16 + t * 61; gC = 132 + t * 95; bC = 132 + t * 69;
				} else {
					const t = (energy - 0.75) / 0.25;
					rC = 77 + t * 178; gC = 227 - t * 47; bC = 201 - t * 107;
				}
				ctx.fillStyle = `rgb(${rC | 0}, ${gC | 0}, ${bC | 0})`;
				ctx.fillRect(c * cw, r * rh, cw + 0.6, rh + 0.6);
			}
		}
		if (caption) caption.textContent = cfg.caption;
	};

	chips.forEach((chip) => {
		chip.addEventListener("click", () => {
			chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
			drawSeason(chip.dataset.season);
		});
	});
	drawSeason("winter");

	/* ============ Local call synthesis (Web Audio, no network) ============ */
	let audioCtx = null;
	let activeStop = null;
	let activeButton = null;

	const setPlaying = (button, playing) => {
		button.setAttribute("aria-pressed", String(playing));
		const label = button.querySelector(".play-label");
		if (label) label.textContent = playing ? "Stop" : "Play call";
	};

	const stopActive = () => {
		if (activeStop) { activeStop(); activeStop = null; }
		if (activeButton) { setPlaying(activeButton, false); activeButton = null; }
	};

	/* Each voice returns a stop() function. All end on their own after `duration`. */
	const voices = {
		humpback(ctx, out, done) {
			const duration = 6;
			const now = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			gain.gain.setValueAtTime(0, now);
			osc.connect(gain).connect(out);
			/* Three rising moans with vibrato. */
			const lfo = ctx.createOscillator();
			const lfoGain = ctx.createGain();
			lfo.frequency.value = 5.5;
			lfoGain.gain.value = 9;
			lfo.connect(lfoGain).connect(osc.frequency);
			for (let i = 0; i < 3; i += 1) {
				const t = now + i * 2;
				osc.frequency.setValueAtTime(210 + i * 40, t);
				osc.frequency.exponentialRampToValueAtTime(560 + i * 30, t + 1.5);
				gain.gain.setValueAtTime(0.0001, t);
				gain.gain.exponentialRampToValueAtTime(0.28, t + 0.25);
				gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
			}
			osc.start(now); lfo.start(now);
			osc.stop(now + duration); lfo.stop(now + duration);
			osc.onended = done;
			return () => { try { osc.stop(); lfo.stop(); } catch (e) { /* already stopped */ } };
		},
		fin(ctx, out, done) {
			const duration = 6;
			const now = ctx.currentTime;
			const oscs = [];
			/* Metronomic ~1 s infrasonic pulses; a 40 Hz partial keeps them audible on small speakers. */
			for (let i = 0; i < 6; i += 1) {
				const t = now + i * 1.0;
				[20, 40].forEach((freq, idx) => {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = "sine";
					osc.frequency.setValueAtTime(freq + 3, t);
					osc.frequency.linearRampToValueAtTime(freq - 2, t + 0.7);
					gain.gain.setValueAtTime(0.0001, t);
					gain.gain.exponentialRampToValueAtTime(idx === 0 ? 0.5 : 0.22, t + 0.05);
					gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
					osc.connect(gain).connect(out);
					osc.start(t); osc.stop(t + 0.9);
					oscs.push(osc);
				});
			}
			oscs[oscs.length - 1].onended = done;
			return () => oscs.forEach((o) => { try { o.stop(); } catch (e) { /* already stopped */ } });
		},
		reef(ctx, out, done) {
			const duration = 6;
			const now = ctx.currentTime;
			/* Dense snap crackle: filtered noise bursts. */
			const bufferLen = Math.floor(ctx.sampleRate * duration);
			const buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			const rand = mulberry32(7);
			let i = 0;
			while (i < bufferLen) {
				if (rand() < 0.0021) {
					const snapLen = 40 + Math.floor(rand() * 220);
					const amp = 0.25 + rand() * 0.75;
					for (let j = 0; j < snapLen && i + j < bufferLen; j += 1) {
						data[i + j] += (rand() * 2 - 1) * amp * (1 - j / snapLen);
					}
					i += snapLen;
				} else {
					data[i] = (rand() * 2 - 1) * 0.012;
					i += 1;
				}
			}
			const src = ctx.createBufferSource();
			src.buffer = buffer;
			const filter = ctx.createBiquadFilter();
			filter.type = "highpass";
			filter.frequency.value = 1800;
			const gain = ctx.createGain();
			gain.gain.value = 0.5;
			src.connect(filter).connect(gain).connect(out);
			src.start(now);
			src.stop(now + duration);
			src.onended = done;
			return () => { try { src.stop(); } catch (e) { /* already stopped */ } };
		},
	};

	document.querySelectorAll(".button-play").forEach((button) => {
		button.addEventListener("click", () => {
			const voice = button.dataset.voice;
			if (button === activeButton) { stopActive(); return; }
			stopActive();
			if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			if (audioCtx.state === "suspended") audioCtx.resume();
			const master = audioCtx.createGain();
			master.gain.value = 0.9;
			master.connect(audioCtx.destination);
			activeButton = button;
			setPlaying(button, true);
			activeStop = voices[voice](audioCtx, master, () => {
				if (activeButton === button) { activeStop = null; stopActive(); }
			});
		});
	});
})();
