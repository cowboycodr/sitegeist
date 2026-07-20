(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const svgNS = "http://www.w3.org/2000/svg";

  /* ---- hero dial: build minute track and hour markers ---- */

  const tickRing = document.getElementById("tick-ring");
  const hourMarkers = document.getElementById("hour-markers");
  if (tickRing && hourMarkers) {
    for (let i = 0; i < 60; i += 1) {
      const isHour = i % 5 === 0;
      const tick = document.createElementNS(svgNS, "line");
      tick.setAttribute("y1", "-93");
      tick.setAttribute("y2", isHour ? "-84" : "-89");
      tick.setAttribute("stroke-width", isHour ? "2" : "1");
      tick.setAttribute("transform", `rotate(${i * 6})`);
      if (isHour) tick.setAttribute("stroke", "#c8a35a");
      tickRing.appendChild(tick);
    }
    for (let h = 1; h <= 12; h += 1) {
      const angle = ((h * 30 - 90) * Math.PI) / 180;
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", (Math.cos(angle) * 73).toFixed(1));
      label.setAttribute("y", (Math.sin(angle) * 73 + 4).toFixed(1));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "11");
      label.setAttribute("font-family", "Georgia, serif");
      label.textContent = String(h);
      hourMarkers.appendChild(label);
    }
  }

  /* ---- hero dial: run the hands on real time ---- */

  const handHour = document.getElementById("hand-hour");
  const handMinute = document.getElementById("hand-minute");
  const handSecond = document.getElementById("hand-second");
  let clockTimer = 0;

  const setHands = () => {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    handHour.setAttribute("transform", `rotate(${(hours * 30).toFixed(2)})`);
    handMinute.setAttribute("transform", `rotate(${(minutes * 6).toFixed(2)})`);
    handSecond.setAttribute("transform", `rotate(${seconds * 6})`);
  };

  const startClock = () => {
    if (clockTimer || !handHour || !handMinute || !handSecond) return;
    setHands();
    clockTimer = window.setInterval(setHands, 1000);
  };
  const stopClock = () => {
    if (!clockTimer) return;
    window.clearInterval(clockTimer);
    clockTimer = 0;
  };

  // With reduced motion the dial stays at its classic static pose (10:09:36).
  if (!reducedMotion.matches) startClock();
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) stopClock();
    else startClock();
  });

  /* ---- movement schematic: draw the gear wheels ---- */

  const drawGear = (id, radius, teeth) => {
    const group = document.getElementById(id);
    if (!group) return;
    const inner = radius - 6;
    let d = "";
    for (let i = 0; i < teeth; i += 1) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.5) / teeth) * Math.PI * 2;
      const a2 = ((i + 1) / teeth) * Math.PI * 2;
      const x0 = Math.cos(a0) * radius;
      const y0 = Math.sin(a0) * radius;
      d += `${i === 0 ? "M" : "L"} ${x0.toFixed(1)} ${y0.toFixed(1)} `;
      d += `L ${(Math.cos(a1) * inner).toFixed(1)} ${(Math.sin(a1) * inner).toFixed(1)} `;
      d += `L ${(Math.cos(a2) * radius).toFixed(1)} ${(Math.sin(a2) * radius).toFixed(1)} `;
    }
    const rim = document.createElementNS(svgNS, "path");
    rim.setAttribute("d", `${d}Z`);
    rim.setAttribute("fill", "none");
    rim.setAttribute("stroke", "currentColor");
    rim.setAttribute("stroke-width", "2");
    group.appendChild(rim);
    const hub = document.createElementNS(svgNS, "circle");
    hub.setAttribute("r", String(inner * 0.55));
    hub.setAttribute("fill", "none");
    hub.setAttribute("stroke", "currentColor");
    hub.setAttribute("stroke-width", "1.5");
    group.appendChild(hub);
    for (let s = 0; s < 4; s += 1) {
      const spoke = document.createElementNS(svgNS, "line");
      spoke.setAttribute("y1", String(-inner * 0.55));
      spoke.setAttribute("y2", String(inner * 0.55));
      spoke.setAttribute("stroke", "currentColor");
      spoke.setAttribute("stroke-width", "1.5");
      spoke.setAttribute("transform", `rotate(${s * 45})`);
      group.appendChild(spoke);
    }
  };

  drawGear("gear-large", 52, 24);
  drawGear("gear-mid", 34, 16);
  drawGear("gear-small", 26, 12);

  /* ---- reveal-on-scroll ---- */

  const revealTargets = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    revealTargets.forEach((el) => observer.observe(el));
  }
})();
