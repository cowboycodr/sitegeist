(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Deterministic pseudo-random so the demo is reproducible offline. */
  const makeRng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  const CATALOG = [
    { sev: "ok", name: "MFA enforced on privileged identities", meta: "identity" },
    { sev: "ok", name: "TLS 1.3 verified on public endpoints", meta: "edge" },
    { sev: "ok", name: "Disk encryption attested fleet-wide", meta: "data" },
    { sev: "ok", name: "Central logging pipeline healthy", meta: "observability" },
    { sev: "ok", name: "Network segmentation policy intact", meta: "network" },
    { sev: "med", name: "3 SaaS apps missing SSO enrollment", meta: "saas" },
    { sev: "med", name: "Stale IAM role not used in 90 days", meta: "cloud" },
    { sev: "med", name: "Certificate expiring within 14 days", meta: "edge" },
    { sev: "high", name: "Service token with excess scope", meta: "identity" },
    { sev: "high", name: "Public bucket with listable objects", meta: "storage" },
    { sev: "high", name: "Unpatched CVE on ingress gateway", meta: "edge" },
    { sev: "crit", name: "Admin console reachable from internet", meta: "network" },
    { sev: "crit", name: "Leaked credential seen in the wild", meta: "identity" },
  ];

  const SEV_WEIGHT = { crit: 26, high: 12, med: 5, ok: 0 };

  const els = {
    btn: document.getElementById("assessBtn"),
    status: document.getElementById("assessStatus"),
    bar: document.getElementById("assessBar"),
    findings: document.getElementById("findings"),
    dialFill: document.getElementById("dialFill"),
    dialScore: document.getElementById("dialScore"),
    tally: {
      crit: document.querySelector('.tally-n[data-sev="crit"]'),
      high: document.querySelector('.tally-n[data-sev="high"]'),
      med: document.querySelector('.tally-n[data-sev="med"]'),
      ok: document.querySelector('.tally-n[data-sev="ok"]'),
    },
  };

  const DASH = 327; // 2*pi*52 rounded, matches CSS
  let running = false;
  let runSeed = 20260714;

  const setDial = (score) => {
    const offset = DASH - (DASH * Math.max(0, Math.min(100, score))) / 100;
    els.dialFill.style.strokeDashoffset = String(offset);
    els.dialScore.textContent = String(score);
    const color = score >= 85 ? "var(--ok)" : score >= 65 ? "var(--high)" : "var(--crit)";
    els.dialFill.style.stroke = color;
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 40) : ms));

  const pickFindings = (rng) => {
    const pool = CATALOG.slice();
    // Always surface a spread; shuffle deterministically.
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = 6 + Math.floor(rng() * 3); // 6–8 findings
    return pool.slice(0, count);
  };

  async function runAssessment() {
    if (running) return;
    running = true;
    els.btn.disabled = true;
    els.btn.textContent = "Assessing…";
    els.findings.innerHTML = "";
    Object.values(els.tally).forEach((n) => (n.textContent = "0"));
    els.bar.style.width = "0";
    setDial(0);
    els.dialScore.textContent = "—";

    const rng = makeRng(runSeed++);
    const phases = [
      "Enumerating reachable assets…",
      "Fingerprinting services…",
      "Correlating known controls…",
      "Scoring exposure…",
    ];

    for (let p = 0; p < phases.length; p += 1) {
      els.status.textContent = phases[p];
      els.bar.style.width = `${((p + 1) / (phases.length + 1)) * 100}%`;
      await wait(520);
    }

    const findings = pickFindings(rng);
    const counts = { crit: 0, high: 0, med: 0, ok: 0 };
    let penalty = 0;

    for (const f of findings) {
      const li = document.createElement("li");
      li.className = "finding";
      li.dataset.sev = f.sev;
      const label = { crit: "Critical", high: "High", med: "Medium", ok: "Verified" }[f.sev];
      li.innerHTML =
        `<b>${label}</b><span class="f-name"></span><span class="f-meta"></span>`;
      li.querySelector(".f-name").textContent = f.name;
      li.querySelector(".f-meta").textContent = f.meta;
      els.findings.appendChild(li);
      counts[f.sev] += 1;
      penalty += SEV_WEIGHT[f.sev];
      els.tally[f.sev].textContent = String(counts[f.sev]);
      await wait(240);
    }

    els.bar.style.width = "100%";
    const score = Math.max(12, 100 - penalty);
    setDial(score);

    const worst = counts.crit ? "critical" : counts.high ? "high-severity" : counts.med ? "medium" : "no";
    els.status.textContent =
      counts.crit || counts.high
        ? `Complete — ${worst} exposure found. Playbooks staged for response.`
        : `Complete — ${worst} findings above threshold. Posture holding.`;

    els.btn.disabled = false;
    els.btn.textContent = "Re-run assessment";
    running = false;
  }

  if (els.btn) els.btn.addEventListener("click", runAssessment);

  /* Count-up for the headline stat, respectful of reduced motion. */
  const counter = document.querySelector("[data-count]");
  if (counter) {
    const target = parseInt(counter.dataset.count, 10);
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counter.textContent = target.toLocaleString("en-US");
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          const start = performance.now();
          const dur = 1100;
          const step = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            counter.textContent = Math.round(target * eased).toLocaleString("en-US");
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });
      io.observe(counter);
    }
  }
})();
