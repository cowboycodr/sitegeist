(() => {
  "use strict";

  const rows = [
    { rank: 1, name: "Nova Kite", handle: "@novakite", world: "Dawn Circuit", filter: "dawn", score: "1,248,900", initials: "NK" },
    { rank: 2, name: "Mira Flux", handle: "@miraflux", world: "Signal District", filter: "signal", score: "1,201,440", initials: "MF" },
    { rank: 3, name: "Hex Bloom", handle: "@hexbloom", world: "Void Garden", filter: "void", score: "1,176,220", initials: "HB" },
    { rank: 4, name: "Rook Pulse", handle: "@rookpulse", world: "Dawn Circuit", filter: "dawn", score: "1,154,080", initials: "RP" },
    { rank: 5, name: "Yara Volt", handle: "@yaravolt", world: "Signal District", filter: "signal", score: "1,109,650", initials: "YV" },
    { rank: 6, name: "Juno Arc", handle: "@junoarc", world: "Void Garden", filter: "void", score: "1,082,310", initials: "JA" },
    { rank: 7, name: "Theo Night", handle: "@theonight", world: "Dawn Circuit", filter: "dawn", score: "1,041,990", initials: "TN" },
    { rank: 8, name: "Sable Ray", handle: "@sableray", world: "Signal District", filter: "signal", score: "998,420", initials: "SR" }
  ];

  const lbBody = document.getElementById("lb-body");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const modal = document.getElementById("start-modal");
  const openStart = document.getElementById("open-start");
  const runStatus = document.getElementById("run-status");
  const startTriggers = document.querySelectorAll('#hero-start, #nav-start, a[href="#start"]');

  function renderLeaderboard(filter) {
    if (!lbBody) return;
    const filtered = filter === "all" ? rows : rows.filter((row) => row.filter === filter);
    lbBody.innerHTML = "";

    if (!filtered.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No runners on this board yet. Be the first glow.";
      tr.appendChild(td);
      lbBody.appendChild(tr);
      return;
    }

    filtered.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.dataset.world = row.filter;

      const rank = document.createElement("td");
      rank.className = "rank-cell";
      rank.textContent = String(index + 1).padStart(2, "0");

      const player = document.createElement("td");
      player.innerHTML =
        '<div class="player-cell">' +
        '<span class="avatar" aria-hidden="true">' + row.initials + "</span>" +
        "<div><span class=\"player-name\">" + row.name + "</span>" +
        '<span class="player-handle">' + row.handle + "</span></div></div>";

      const world = document.createElement("td");
      world.className = "world-cell";
      world.textContent = row.world;

      const score = document.createElement("td");
      score.className = "score-cell";
      score.textContent = row.score;

      tr.append(rank, player, world, score);
      lbBody.appendChild(tr);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === button ? "true" : "false");
      });
      renderLeaderboard(filter);
    });
  });

  renderLeaderboard("all");

  /* Mobile nav */
  function setNavOpen(open) {
    if (!navToggle || !siteNav) return;
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      setNavOpen(!siteNav.classList.contains("is-open"));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });
  }

  /* Challenge countdown — fixed target: next Monday 00:00 UTC from a stable base */
  function nextMondayUtc(from) {
    const d = new Date(from.getTime());
    const day = d.getUTCDay();
    const daysUntil = day === 0 ? 1 : 8 - day;
    d.setUTCDate(d.getUTCDate() + daysUntil);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  const daysEl = document.getElementById("t-days");
  const hoursEl = document.getElementById("t-hours");
  const minsEl = document.getElementById("t-mins");
  const secsEl = document.getElementById("t-secs");
  let timerId = null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickTimer() {
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;
    const now = new Date();
    let target = nextMondayUtc(now);
    if (target.getTime() <= now.getTime()) {
      target = nextMondayUtc(new Date(now.getTime() + 86400000));
    }
    let diff = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(diff / 86400000);
    diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000);
    diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  tickTimer();
  if (!reduceMotion) {
    timerId = window.setInterval(tickTimer, 1000);
  }

  /* Modal */
  let lastFocus = null;

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null || el === container.querySelector(".modal-close"));
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (runStatus) runStatus.textContent = "";
    const panel = modal.querySelector(".modal-panel");
    const focusable = getFocusable(modal);
    const target = focusable.find((el) => el.classList.contains("run-option")) || focusable[0];
    if (target) target.focus();
    if (panel) panel.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  if (openStart) {
    openStart.addEventListener("click", openModal);
  }

  startTriggers.forEach((el) => {
    el.addEventListener("click", (event) => {
      if (el.id === "hero-start" || el.id === "nav-start") {
        event.preventDefault();
        openModal();
        setNavOpen(false);
      }
    });
  });

  if (modal) {
    modal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable(modal).filter((el) => el.offsetParent !== null || el.classList.contains("modal-close"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  document.querySelectorAll("[data-run]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.getAttribute("data-run") || "cabinet";
      if (runStatus) {
        runStatus.textContent = "Session queued · " + name + " · local night-shift ready.";
      }
    });
  });

  /* Cleanup timer if page is unloaded */
  window.addEventListener("pagehide", () => {
    if (timerId) window.clearInterval(timerId);
  });
})();
