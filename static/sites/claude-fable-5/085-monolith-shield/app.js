(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- UTC clock in the posture panel ---- */
  const clock = document.getElementById("utc-clock");
  const tick = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    clock.textContent =
      pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds()) + " UTC";
  };
  tick();
  setInterval(tick, 1000);

  /* ---- Assessment simulation ---- */
  const runBtn = document.getElementById("run-btn");
  const statusEl = document.getElementById("assess-status");
  const barFill = document.getElementById("bar-fill");
  const steps = Array.from(document.querySelectorAll("#assess-steps [data-step]"));
  const result = document.getElementById("assess-result");

  const phases = [
    "Enumerating reachable surface…",
    "Fingerprinting services and identities…",
    "Exercising control stack…",
    "Correlating findings…",
    "Sealing evidence and scoring…",
  ];

  let running = false;
  let timers = [];

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const finish = () => {
    steps.forEach((li) => {
      li.classList.remove("active");
      li.classList.add("done");
    });
    barFill.style.width = "100%";
    statusEl.textContent = "Complete — evidence trail sealed.";
    result.hidden = false;
    runBtn.disabled = false;
    runBtn.textContent = "Run again";
    running = false;
  };

  const runAssessment = () => {
    if (running) return;
    running = true;
    clearTimers();
    runBtn.disabled = true;
    result.hidden = true;
    steps.forEach((li) => li.classList.remove("active", "done"));
    barFill.style.width = "0%";

    if (reducedMotion.matches) {
      finish();
      return;
    }

    const stepMs = 650;
    phases.forEach((label, i) => {
      timers.push(
        setTimeout(() => {
          steps.forEach((li, j) => {
            li.classList.toggle("done", j < i);
            li.classList.toggle("active", j === i);
          });
          statusEl.textContent = "Phase " + (i + 1) + "/5 — " + label;
          barFill.style.width = String(Math.round(((i + 1) / phases.length) * 100)) + "%";
        }, i * stepMs),
      );
    });
    timers.push(setTimeout(finish, phases.length * stepMs + 250));
  };

  runBtn.addEventListener("click", runAssessment);

  /* Hero primary action scrolls to the demo, then starts it */
  document.querySelectorAll('a[href="#assessment"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (!running) runAssessment();
    });
  });

  /* ---- Rotating signal feed ---- */
  const signalList = document.getElementById("signal-list");
  const extraSignals = [
    ['ok', "Egress policy verified on vpc-core"],
    ['ok', "Secrets sweep: repositories clean"],
    ['warn', "SaaS token aging: crm-tenant-02"],
    ['ok', "Backup isolation test passed"],
    ['ok', "Surface delta: 0 new exposures"],
  ];
  let signalIndex = 0;
  if (!reducedMotion.matches && signalList) {
    setInterval(() => {
      const [kind, text] = extraSignals[signalIndex % extraSignals.length];
      signalIndex += 1;
      const li = document.createElement("li");
      const tag = document.createElement("span");
      tag.className = "sig " + kind;
      tag.textContent = kind === "ok" ? "OK" : "WATCH";
      li.appendChild(tag);
      li.appendChild(document.createTextNode(" " + text));
      signalList.insertBefore(li, signalList.firstChild);
      while (signalList.children.length > 4) signalList.removeChild(signalList.lastChild);
    }, 4000);
  }
})();
