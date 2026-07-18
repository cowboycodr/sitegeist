(() => {
  "use strict";

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Vision draw machine
  const visions = [
    { n: 1, t: "A choir of obsolete modems performs the dawn chorus", m: "Sound — Day one" },
    { n: 4, t: "Portraits painted by a cursor left alone overnight", m: "Digital art — Day one" },
    { n: 9, t: "A love letter compiled without warnings", m: "Code — Day one" },
    { n: 17, t: "A browser that only renders forgotten pages", m: "Digital art — Day one" },
    { n: 22, t: "The complete works of an autocomplete, unabridged", m: "Conversation — Day one" },
    { n: 28, t: "Percussion for cooling fans in four movements", m: "Sound — Day one" },
    { n: 33, t: "Dance notation compiled to shader code, live", m: "Performance — Day two" },
    { n: 41, t: "A map of every place the internet believes is empty", m: "Digital art — Day two" },
    { n: 48, t: "The museum of interfaces nobody shipped", m: "Digital art — Day two" },
    { n: 55, t: "An opera sung entirely in error messages", m: "Sound — Day two" },
    { n: 61, t: "Ten performers, one shared runtime, no undo", m: "Code — Day two" },
    { n: 66, t: "A séance for deprecated functions", m: "Performance — Day two" },
    { n: 72, t: "A duet between a violinist and her latency", m: "Performance — Day three" },
    { n: 77, t: "Subtitles for a film that refuses to exist", m: "Digital art — Day three" },
    { n: 84, t: "The sound of a data center dreaming of rain", m: "Sound — Day three" },
    { n: 89, t: "Weather reports from simulated cities", m: "Performance — Day three" },
    { n: 93, t: "A eulogy delivered by the machine it mourns", m: "Conversation — Day three" },
    { n: 100, t: "The last vision is written by the audience", m: "Everyone — Day three" },
  ];

  const numberEl = document.getElementById("vision-number");
  const titleEl = document.getElementById("vision-title");
  const metaEl = document.getElementById("vision-meta");
  const drawBtn = document.getElementById("draw-vision");

  if (numberEl && titleEl && metaEl && drawBtn) {
    let current = 0;
    drawBtn.addEventListener("click", () => {
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * visions.length);
      }
      current = next;
      const v = visions[current];
      numberEl.textContent = "Nº " + String(v.n).padStart(3, "0");
      titleEl.textContent = v.t;
      metaEl.textContent = v.m;
    });
  }
})();
