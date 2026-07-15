"use strict";

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (nav && toggle) {
    var closeNav = function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Signature motif: spot the odd one ---------- */
  var dotGrid = document.getElementById("dotGrid");
  var spotHint = document.getElementById("spotHint");
  if (dotGrid) {
    var setupSpotter = function () {
      dotGrid.innerHTML = "";
      var count = 15;
      var oddIndex = Math.floor(Math.random() * count);
      for (var i = 0; i < count; i++) {
        var dot = document.createElement("button");
        dot.className = "dot" + (i === oddIndex ? " is-odd" : "");
        dot.type = "button";
        dot.setAttribute(
          "aria-label",
          i === oddIndex ? "A shape — is it the odd one?" : "A common circle"
        );
        dot.dataset.odd = i === oddIndex ? "1" : "0";
        dotGrid.appendChild(dot);
      }
    };

    var solved = false;
    dotGrid.addEventListener("click", function (e) {
      var dot = e.target.closest(".dot");
      if (!dot || solved) return;
      if (dot.dataset.odd === "1") {
        solved = true;
        dot.classList.add("found");
        spotHint.textContent = "That's the one. We do the same with brands — restart?";
        var reset = document.createElement("button");
        reset.type = "button";
        reset.className = "filter";
        reset.style.marginTop = "12px";
        reset.textContent = "Play again";
        reset.addEventListener("click", function () {
          solved = false;
          reset.remove();
          setupSpotter();
          spotHint.textContent = "Fourteen are common. One is not. Find it.";
        });
        spotHint.after(reset);
      } else {
        dot.classList.remove("miss");
        void dot.offsetWidth;
        if (!reduceMotion) dot.classList.add("miss");
        spotHint.textContent = "Common. Keep looking.";
      }
    });

    setupSpotter();
  }

  /* ---------- Work grid ---------- */
  var projects = [
    {
      title: "Loop Cannery",
      cats: ["identity"],
      tags: ["Identity", "Packaging"],
      desc: "A canned-water brand that turned the humble tin into a collectible label system.",
      a: "#ffcf3a", b: "#ff4d3d", motif: "can"
    },
    {
      title: "Second Sunday",
      cats: ["campaign"],
      tags: ["Campaign", "Print"],
      desc: "A city museum campaign that made a quiet weekday the loudest day of the week.",
      a: "#2f6bff", b: "#ffcf3a", motif: "burst"
    },
    {
      title: "Ordinary Machines",
      cats: ["digital", "identity"],
      tags: ["Digital", "Identity"],
      desc: "Brand and product site for a robotics studio that wanted to feel warm, not clinical.",
      a: "#16130f", b: "#ff4d3d", motif: "grid"
    },
    {
      title: "Pocket Weather",
      cats: ["digital"],
      tags: ["Digital", "Motion"],
      desc: "A forecast app that reports the weather with the honesty of a very blunt friend.",
      a: "#ff4d3d", b: "#2f6bff", motif: "wave"
    },
    {
      title: "The Usual",
      cats: ["campaign", "identity"],
      tags: ["Identity", "Campaign"],
      desc: "A neighbourhood café rebrand built entirely around one regular's coffee order.",
      a: "#ffcf3a", b: "#16130f", motif: "cup"
    },
    {
      title: "Field Notes Live",
      cats: ["digital"],
      tags: ["Digital", "Editorial"],
      desc: "An editorial platform for a science non-profit — dense reading, made effortless.",
      a: "#2f6bff", b: "#ff4d3d", motif: "lines"
    }
  ];

  var motifs = {
    can: '<rect x="34" y="18" width="32" height="64" rx="6" fill="B" stroke="#16130f" stroke-width="3"/><rect x="34" y="34" width="32" height="14" fill="A"/><circle cx="50" cy="41" r="4" fill="#16130f"/>',
    burst: '<g stroke="#16130f" stroke-width="3"><circle cx="50" cy="50" r="20" fill="B"/><path d="M50 12v14M50 74v14M12 50h14M74 50h14M24 24l10 10M66 66l10 10M76 24 66 34M24 76l10-10" stroke-linecap="round"/></g>',
    grid: '<g fill="A"><rect x="26" y="26" width="14" height="14" rx="3"/><rect x="46" y="26" width="14" height="14" rx="3"/><rect x="26" y="46" width="14" height="14" rx="3"/></g><rect x="46" y="46" width="14" height="14" rx="7" fill="B"/><g fill="A"><rect x="26" y="66" width="14" height="8" rx="4"/><rect x="46" y="66" width="14" height="8" rx="4"/></g>',
    wave: '<path d="M14 60q12-24 24 0t24 0 24 0" fill="none" stroke="B" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="34" r="10" fill="A" stroke="#16130f" stroke-width="3"/>',
    cup: '<path d="M32 40h28v20a14 14 0 0 1-28 0z" fill="B" stroke="#16130f" stroke-width="3"/><path d="M60 46h8a6 6 0 0 1 0 12h-8" fill="none" stroke="#16130f" stroke-width="3"/><path d="M40 30c0-4 6-4 6-8M50 30c0-4 6-4 6-8" stroke="A" stroke-width="3" fill="none" stroke-linecap="round"/>',
    lines: '<g stroke="B" stroke-width="4" stroke-linecap="round"><path d="M28 34h44M28 46h44M28 58h30"/></g><circle cx="66" cy="58" r="6" fill="A"/>'
  };

  var grid = document.getElementById("workGrid");
  if (grid) {
    projects.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "card reveal";
      card.dataset.cats = p.cats.join(" ");

      var thumb = document.createElement("div");
      thumb.className = "thumb";
      var svgBody = motifs[p.motif].replace(/A/g, p.a).replace(/B/g, p.b);
      thumb.innerHTML =
        '<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' +
        p.title + ' cover artwork" style="background:' + p.a + '22">' + svgBody + "</svg>";

      var body = document.createElement("div");
      body.className = "body";
      var meta = p.tags
        .map(function (t) { return '<span class="tag">' + t + "</span>"; })
        .join("");
      body.innerHTML =
        '<div class="meta">' + meta + "</div>" +
        "<h3>" + p.title + "</h3>" +
        "<p>" + p.desc + "</p>";

      card.appendChild(thumb);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ---------- Filters ---------- */
  var filters = document.querySelectorAll(".filter[data-filter]");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.dataset.filter;
      filters.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      document.querySelectorAll(".card").forEach(function (card) {
        var show = value === "all" || card.dataset.cats.indexOf(value) !== -1;
        card.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var runCount = function (el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = performance.now();
    var dur = 1100;
    var step = function (now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var co = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCount(entry.target);
              co.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---------- Brief form (client-side only) ---------- */
  var form = document.getElementById("briefForm");
  var status = document.getElementById("formStatus");
  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name").value.trim();
      var email = document.getElementById("email").value.trim();
      var brief = document.getElementById("brief").value.trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !validEmail || !brief) {
        status.textContent = "Add your name, a valid email, and a line about the work.";
        status.style.color = "#16130f";
        return;
      }
      form.reset();
      status.textContent =
        "Thanks, " + name.split(" ")[0] + ". Your brief is noted — we reply within two working days.";
    });
  }
})();
