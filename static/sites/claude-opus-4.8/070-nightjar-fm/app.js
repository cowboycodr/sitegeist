(() => {
	"use strict";

	const listenBtn = document.getElementById("listen");
	const player = document.querySelector(".player");
	const statusEl = document.getElementById("player-status");
	const trackEl = document.getElementById("player-track");
	const subEl = document.getElementById("player-sub");
	const volume = document.getElementById("volume");
	const btnLabel = listenBtn.querySelector(".btn-label");

	const tracks = [
		"Threshold — untitled loop (03)",
		"Small Hours — nocturne for tape delay",
		"Deep Static — patch no. 7",
		"Blue Hour — reverb study",
		"First Light — morning motif",
	];

	// --- Synthesized carrier tone (stands in for the live stream) ---
	let ctx = null;
	let master = null;
	let voices = [];
	let live = false;

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	function level() {
		return Math.pow(volume.value / 100, 2) * 0.16;
	}

	function startAudio() {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return false;
		if (!ctx) {
			ctx = new AudioCtx();
			master = ctx.createGain();
			master.gain.value = 0;
			master.connect(ctx.destination);

			// A gentle triad drone: two detuned oscillators feeding a slow lowpass.
			const freqs = [110, 164.81, 220];
			freqs.forEach((f, i) => {
				const osc = ctx.createOscillator();
				osc.type = i === 1 ? "triangle" : "sine";
				osc.frequency.value = f;
				const detune = ctx.createOscillator();
				detune.frequency.value = 0.05 + i * 0.03;
				const detuneGain = ctx.createGain();
				detuneGain.gain.value = 2.5;
				detune.connect(detuneGain).connect(osc.detune);
				const g = ctx.createGain();
				g.gain.value = i === 0 ? 0.6 : 0.32;
				const lp = ctx.createBiquadFilter();
				lp.type = "lowpass";
				lp.frequency.value = 700 + i * 180;
				osc.connect(g).connect(lp).connect(master);
				osc.start();
				detune.start();
				voices.push(osc, detune);
			});
		}
		if (ctx.state === "suspended") ctx.resume();
		master.gain.cancelScheduledValues(ctx.currentTime);
		master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
		master.gain.linearRampToValueAtTime(level(), ctx.currentTime + 1.4);
		return true;
	}

	function stopAudio() {
		if (!ctx || !master) return;
		master.gain.cancelScheduledValues(ctx.currentTime);
		master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
		master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
	}

	function setLive(on) {
		live = on;
		listenBtn.setAttribute("aria-pressed", String(on));
		player.classList.toggle("is-live", on);
		btnLabel.textContent = on ? "Stop" : "Listen live";
		if (on) {
			const t = tracks[nowIndex()] || tracks[0];
			statusEl.textContent = "On air · live";
			trackEl.innerHTML = "";
			trackEl.textContent = t;
			subEl.textContent = "Synthesized carrier tone — adjust level to taste.";
		} else {
			statusEl.textContent = "Signal idle";
			trackEl.innerHTML = "Press <em>Listen live</em> to open the transmission";
			subEl.textContent = "A soft synthesized carrier tone stands in for the live stream.";
		}
	}

	listenBtn.addEventListener("click", () => {
		if (live) {
			stopAudio();
			setLive(false);
		} else {
			const ok = startAudio();
			setLive(true);
			if (!ok) {
				subEl.textContent = "Your browser blocked audio, but the schedule below is live.";
			}
		}
	});

	volume.addEventListener("input", () => {
		if (live && ctx && master) {
			master.gain.cancelScheduledValues(ctx.currentTime);
			master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
			master.gain.linearRampToValueAtTime(level(), ctx.currentTime + 0.1);
		}
	});

	// --- Schedule: highlight the current show and run station clock ---
	const shows = Array.from(document.querySelectorAll(".show"));

	function nowIndex() {
		const h = new Date().getHours();
		// Programme boundaries by start hour: 23, 0, 2, 4, 6.
		if (h >= 23 || h < 0) return 0;
		if (h < 2) return 1;
		if (h < 4) return 2;
		if (h < 6) return 3;
		if (h < 7) return 4;
		return -1;
	}

	function markNow() {
		const idx = nowIndex();
		shows.forEach((el, i) => el.classList.toggle("is-now", i === idx));
	}

	const clock = document.getElementById("clock");
	function tick() {
		const d = new Date();
		clock.textContent =
			String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
	}

	markNow();
	tick();
	setInterval(() => { tick(); markNow(); }, 30000);

	// Pause audio when the tab is hidden to avoid a stray tone in the background.
	document.addEventListener("visibilitychange", () => {
		if (document.hidden && live) stopAudio();
		else if (!document.hidden && live) startAudio();
	});

	// The bridge announces pull-to-dismiss gestures; soften motion accordingly.
	document.addEventListener("sitegeist:pull-state", (e) => {
		document.body.style.opacity = e.detail && e.detail.active ? "0.96" : "";
	});
})();
