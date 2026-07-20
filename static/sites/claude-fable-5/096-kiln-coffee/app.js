(() => {
  "use strict";

  /* Bag counter */
  const bag = document.querySelector(".bag");
  const bagCount = document.getElementById("bag-count");
  let count = 0;

  document.querySelectorAll(".add-btn").forEach((button) => {
    let resetTimer = 0;
    button.addEventListener("click", () => {
      count += 1;
      bagCount.textContent = String(count);
      bag.classList.remove("bumped");
      void bag.offsetWidth;
      bag.classList.add("bumped");

      const name = button.dataset.coffee;
      button.textContent = "Added";
      button.classList.add("added");
      button.setAttribute("aria-label", `${name} added to bag`);
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.textContent = "Add to bag";
        button.classList.remove("added");
        button.removeAttribute("aria-label");
      }, 1400);
    });
  });

  /* Roast profile chart */
  const profiles = {
    light: {
      curve: "M56 90 C 120 250, 200 268, 300 220 S 520 120, 596 96",
      crackX: 430,
      dropX: 596,
      dropY: 96,
      caption: "Gera Sunrise — charge 190°, gentle drying phase, dropped 62 seconds after first crack at 198°.",
      time: "10:42",
      temp: "198°C",
      dev: "14%",
    },
    medium: {
      curve: "M56 84 C 120 244, 210 258, 320 200 S 540 100, 606 78",
      crackX: 452,
      dropX: 606,
      dropY: 78,
      caption: "Cerro Alto — slower Maillard stretch, dropped 98 seconds after first crack at 206°.",
      time: "11:38",
      temp: "206°C",
      dev: "18%",
    },
    dark: {
      curve: "M56 80 C 124 238, 224 246, 344 178 S 556 78, 612 58",
      crackX: 470,
      dropX: 612,
      dropY: 58,
      caption: "Kiln Ember — steady heat into second crack, dropped at 218° before any oil surfaces.",
      time: "12:56",
      temp: "218°C",
      dev: "23%",
    },
  };

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panel = document.getElementById("profile-chart");
  const curve = document.getElementById("curve");
  const crackLine = document.getElementById("crack-line");
  const crackText = document.getElementById("crack-text");
  const dropDot = document.getElementById("drop-dot");
  const caption = document.getElementById("profile-caption");
  const statTime = document.getElementById("stat-time");
  const statTemp = document.getElementById("stat-temp");
  const statDev = document.getElementById("stat-dev");

  const selectTab = (tab, focus) => {
    const profile = profiles[tab.dataset.profile];
    if (!profile) return;

    tabs.forEach((other) => {
      const active = other === tab;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", active ? "true" : "false");
      other.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    if (focus) tab.focus();

    curve.setAttribute("d", profile.curve);
    crackLine.setAttribute("x1", profile.crackX);
    crackLine.setAttribute("x2", profile.crackX);
    crackText.setAttribute("x", profile.crackX);
    dropDot.setAttribute("cx", profile.dropX);
    dropDot.setAttribute("cy", profile.dropY);
    caption.textContent = profile.caption;
    statTime.textContent = profile.time;
    statTemp.textContent = profile.temp;
    statDev.textContent = profile.dev;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (event) => {
      let next = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      if (next === -1) return;
      event.preventDefault();
      event.stopPropagation();
      selectTab(tabs[next], true);
    });
  });
})();
