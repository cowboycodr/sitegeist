(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.textContent = open ? "Close" : "Menu";
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "Menu";
      });
    });
  }

  /* ---------- Player ---------- */
  const playBtn = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");
  const disc = document.getElementById("deck-disc");
  const wave = document.getElementById("wave");
  const progressFill = document.getElementById("progress-fill");
  const progressBar = document.getElementById("progress-bar");
  const timeCurrent = document.getElementById("time-current");
  const timeTotal = document.getElementById("time-total");
  const nowTitle = document.getElementById("now-title");
  const nowPlace = document.getElementById("now-place");
  const trackList = document.getElementById("track-list");
  const tracks = trackList ? Array.from(trackList.querySelectorAll(".track")) : [];

  let playing = false;
  let elapsed = 0;
  let duration = 222;
  let timerId = null;

  const playPath = "M8 5.5v13l11-6.5-11-6.5z";
  const pausePath = "M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z";

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function setProgress() {
    const pct = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
    if (progressFill) progressFill.style.width = pct + "%";
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
    if (timeCurrent) timeCurrent.textContent = formatTime(elapsed);
  }

  function setPlaying(next) {
    playing = next;
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", String(playing));
      const title = nowTitle ? nowTitle.textContent : "track";
      playBtn.setAttribute("aria-label", (playing ? "Pause " : "Play ") + title);
    }
    if (playIcon) {
      playIcon.innerHTML = '<path d="' + (playing ? pausePath : playPath) + '"/>';
    }
    if (disc) disc.classList.toggle("is-spinning", playing && !reduceMotion);
    if (wave) wave.classList.toggle("is-active", playing && !reduceMotion);

    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    if (playing) {
      timerId = window.setInterval(() => {
        elapsed += 1;
        if (elapsed >= duration) {
          elapsed = duration;
          setProgress();
          setPlaying(false);
          return;
        }
        setProgress();
      }, 1000);
    }
  }

  function loadTrack(button, autoplay) {
    if (!button) return;
    const title = button.getAttribute("data-title") || "Untitled";
    const place = button.getAttribute("data-place") || "";
    const total = button.getAttribute("data-duration") || "0:00";
    const seconds = Number(button.getAttribute("data-seconds") || "0");

    tracks.forEach((t) => {
      const active = t === button;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });

    if (trackList) trackList.setAttribute("aria-activedescendant", button.id);
    if (nowTitle) nowTitle.textContent = title;
    if (nowPlace) nowPlace.textContent = place;
    if (timeTotal) timeTotal.textContent = total;

    duration = seconds > 0 ? seconds : 180;
    elapsed = 0;
    setProgress();
    setPlaying(Boolean(autoplay));
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => setPlaying(!playing));
  }

  tracks.forEach((btn) => {
    btn.addEventListener("click", () => {
      const same = btn.classList.contains("is-active");
      if (same) {
        setPlaying(!playing);
      } else {
        loadTrack(btn, true);
      }
    });
  });

  const startListening = document.getElementById("start-listening");
  if (startListening) {
    startListening.addEventListener("click", () => {
      window.setTimeout(() => {
        if (!playing && tracks[0]) {
          loadTrack(tracks[0], true);
        } else if (!playing) {
          setPlaying(true);
        }
      }, 50);
    });
  }

  setProgress();

  /* ---------- Region map ---------- */
  const regions = {
    "region-sahel": {
      name: "West Africa & the Sahel",
      desc: "Griot lineages, desert night songs, and market drum languages recorded from Senegal to Niger.",
      count: "642",
      langs: "18",
      tags: ["ngoni", "talking drum", "griot"],
    },
    "region-andes": {
      name: "Andes",
      desc: "High-altitude processionals, panpipe ensembles, and feast-day marches from Cusco to the Altiplano.",
      count: "381",
      langs: "9",
      tags: ["panpipe", "charango", "processional"],
    },
    "region-pacific": {
      name: "Pacific Northwest",
      desc: "Cedar flutes, potlatch songs, and coastal languages preserved along islands and inlets.",
      count: "214",
      langs: "11",
      tags: ["cedar flute", "potlatch", "coast"],
    },
    "region-southasia": {
      name: "South Asia",
      desc: "Work songs, classical fragments, and village choruses from Kerala through the Gangetic plain.",
      count: "529",
      langs: "22",
      tags: ["work song", "raga", "chorus"],
    },
    "region-atlantic": {
      name: "North Atlantic",
      desc: "Harbor lullabies, chain-song shanties, and unaccompanied ballads from Faroe to Newfoundland.",
      count: "176",
      langs: "7",
      tags: ["lullaby", "ballad", "harbor"],
    },
    "region-seasia": {
      name: "Southeast Asia",
      desc: "Gamelan pathways, court repertoires, and village ensembles spanning islands and river deltas.",
      count: "298",
      langs: "14",
      tags: ["gamelan", "court", "ensemble"],
    },
  };

  const regionName = document.getElementById("region-name");
  const regionDesc = document.getElementById("region-desc");
  const regionCount = document.getElementById("region-count");
  const regionLangs = document.getElementById("region-langs");
  const regionTags = document.getElementById("region-tags");
  const regionEls = Array.from(document.querySelectorAll(".region"));

  function selectRegion(id) {
    const data = regions[id];
    if (!data) return;

    regionEls.forEach((el) => {
      const on = el.id === id;
      el.classList.toggle("is-selected", on);
      el.setAttribute("aria-pressed", String(on));
    });

    if (regionName) regionName.textContent = data.name;
    if (regionDesc) regionDesc.textContent = data.desc;
    if (regionCount) regionCount.textContent = data.count;
    if (regionLangs) regionLangs.textContent = data.langs;
    if (regionTags) {
      regionTags.innerHTML = data.tags
        .map((t) => '<span class="tag">' + t + "</span>")
        .join("");
    }
  }

  regionEls.forEach((el) => {
    el.addEventListener("click", () => selectRegion(el.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectRegion(el.id);
      }
    });
  });
})();
