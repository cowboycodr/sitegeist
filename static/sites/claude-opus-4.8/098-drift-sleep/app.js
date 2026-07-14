(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	/* ---------- Breathing ---------- */
	const ring = document.getElementById("ring");
	const cue = document.getElementById("cue");
	const toggle = document.getElementById("breathToggle");
	const cycleOut = document.getElementById("cycleCount");

	const phases = [
		{ label: "Inhale", cls: "grow", ms: 4000 },
		{ label: "Hold", cls: "hold", ms: 7000 },
		{ label: "Exhale", cls: "shrink", ms: 8000 },
	];
	let breathing = false;
	let phaseIndex = 0;
	let cycles = 0;
	let breathTimer = 0;

	function applyPhase(i) {
		const p = phases[i];
		ring.classList.remove("grow", "hold", "shrink");
		// force reflow so the transition restarts cleanly
		void ring.offsetWidth;
		ring.classList.add(p.cls);
		if (reduceMotion.matches) {
			ring.style.transitionDuration = "0s";
		} else {
			ring.style.transitionDuration = p.cls === "hold" ? "0.4s" : (p.ms / 1000) + "s";
		}
		cue.textContent = p.label + "…";
	}

	function step() {
		applyPhase(phaseIndex);
		breathTimer = window.setTimeout(() => {
			if (phaseIndex === phases.length - 1) {
				cycles += 1;
				cycleOut.textContent = String(cycles);
			}
			phaseIndex = (phaseIndex + 1) % phases.length;
			step();
		}, phases[phaseIndex].ms);
	}

	function startBreath() {
		breathing = true;
		phaseIndex = 0;
		toggle.textContent = "Pause";
		toggle.setAttribute("aria-pressed", "true");
		step();
	}

	function stopBreath() {
		breathing = false;
		window.clearTimeout(breathTimer);
		toggle.textContent = "Begin breathing";
		toggle.setAttribute("aria-pressed", "false");
		cue.textContent = "Paused";
		ring.classList.remove("grow", "hold", "shrink");
		ring.classList.add("shrink");
	}

	toggle.addEventListener("click", () => {
		if (breathing) stopBreath(); else startBreath();
	});

	/* ---------- Soundscapes (generative, offline WebAudio) ---------- */
	const scapesWrap = document.getElementById("scapes");
	const nowPlaying = document.getElementById("nowPlaying");
	const stopBtn = document.getElementById("stopSound");
	const timerSel = document.getElementById("timer");
	const jump = document.getElementById("soundJump");

	let ctx = null;
	let master = null;
	let nodes = [];
	let current = null;
	let fadeTimer = 0;

	const names = { rain: "Night Rain", tide: "Slow Tide", ember: "Low Ember", drone: "Moon Drone" };

	function ensureCtx() {
		if (!ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			if (!AC) return null;
			ctx = new AC();
			master = ctx.createGain();
			master.gain.value = 0;
			master.connect(ctx.destination);
		}
		if (ctx.state === "suspended") ctx.resume();
		return ctx;
	}

	function noiseBuffer(seconds) {
		const len = ctx.sampleRate * seconds;
		const buf = ctx.createBuffer(1, len, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
		return buf;
	}

	function tearDown() {
		nodes.forEach((n) => { try { n.stop && n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
		nodes = [];
	}

	function buildScape(kind) {
		tearDown();
		const src = ctx.createBufferSource();
		src.buffer = noiseBuffer(4);
		src.loop = true;
		const filter = ctx.createBiquadFilter();
		const gain = ctx.createGain();

		if (kind === "rain") {
			filter.type = "bandpass";
			filter.frequency.value = 1400;
			filter.Q.value = 0.6;
			gain.gain.value = 0.5;
		} else if (kind === "tide") {
			filter.type = "lowpass";
			filter.frequency.value = 600;
			gain.gain.value = 0.6;
			// slow swell
			const lfo = ctx.createOscillator();
			const lfoGain = ctx.createGain();
			lfo.frequency.value = 0.08;
			lfoGain.gain.value = 0.35;
			lfo.connect(lfoGain).connect(gain.gain);
			lfo.start();
			nodes.push(lfo);
		} else if (kind === "ember") {
			filter.type = "lowpass";
			filter.frequency.value = 900;
			gain.gain.value = 0.45;
		} else if (kind === "drone") {
			filter.type = "lowpass";
			filter.frequency.value = 500;
			gain.gain.value = 0.12;
			// warm pad tones
			[110, 164.81, 220].forEach((f) => {
				const osc = ctx.createOscillator();
				const og = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = f;
				og.gain.value = 0.12;
				osc.connect(og).connect(master);
				osc.start();
				nodes.push(osc, og);
			});
		}

		src.connect(filter).connect(gain).connect(master);
		src.start();
		nodes.push(src, filter, gain);
	}

	function fadeMaster(target, seconds) {
		if (!ctx) return;
		const now = ctx.currentTime;
		master.gain.cancelScheduledValues(now);
		master.gain.setValueAtTime(master.gain.value, now);
		master.gain.linearRampToValueAtTime(target, now + seconds);
	}

	function scheduleFadeOut() {
		window.clearTimeout(fadeTimer);
		const minutes = parseInt(timerSel.value, 10) || 30;
		fadeTimer = window.setTimeout(() => {
			fadeMaster(0, 8);
			window.setTimeout(stopSound, 8200);
		}, minutes * 60 * 1000);
	}

	function playScape(kind, btn) {
		if (!ensureCtx()) {
			nowPlaying.textContent = "audio unavailable on this device";
			return;
		}
		[...scapesWrap.querySelectorAll(".scape")].forEach((b) => b.setAttribute("aria-pressed", "false"));
		btn.setAttribute("aria-pressed", "true");
		buildScape(kind);
		fadeMaster(0.8, 2);
		current = kind;
		nowPlaying.textContent = names[kind];
		stopBtn.disabled = false;
		scheduleFadeOut();
	}

	function stopSound() {
		window.clearTimeout(fadeTimer);
		fadeMaster(0, 1.2);
		window.setTimeout(() => { tearDown(); }, 1300);
		current = null;
		nowPlaying.textContent = "nothing yet";
		stopBtn.disabled = true;
		[...scapesWrap.querySelectorAll(".scape")].forEach((b) => b.setAttribute("aria-pressed", "false"));
	}

	scapesWrap.addEventListener("click", (e) => {
		const btn = e.target.closest(".scape");
		if (!btn) return;
		const kind = btn.dataset.scape;
		if (current === kind) { stopSound(); return; }
		playScape(kind, btn);
	});

	stopBtn.addEventListener("click", stopSound);
	timerSel.addEventListener("change", () => { if (current) scheduleFadeOut(); });
	jump.addEventListener("click", () => {
		document.getElementById("sound").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
	});

	/* ---------- Ritual progress ---------- */
	const steps = document.getElementById("steps");
	const bar = document.getElementById("progressBar");
	const done = document.getElementById("ritualDone");
	const boxes = [...steps.querySelectorAll("input[type=checkbox]")];

	function updateProgress() {
		const checked = boxes.filter((b) => b.checked).length;
		bar.style.width = (checked / boxes.length * 100) + "%";
		done.hidden = checked !== boxes.length;
	}
	steps.addEventListener("change", updateProgress);

	/* ---------- Pause things when the viewer dismisses via pull ---------- */
	document.addEventListener("sitegeist:pull-state", (e) => {
		if (e.detail && e.detail.active && current) { /* keep audio; nothing intrusive */ }
	});
})();
