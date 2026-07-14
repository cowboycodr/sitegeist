(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");
  var filterButtons = document.querySelectorAll("[data-filter]");
  var faceCards = document.querySelectorAll("[data-face-grid] .face-card");
  var weightInput = document.querySelector('[data-axis="weight"]');
  var widthInput = document.querySelector('[data-axis="width"]');
  var slantInput = document.querySelector('[data-axis="slant"]');
  var trackInput = document.querySelector('[data-axis="track"]');
  var sampleInput = document.querySelector("[data-sample-input]");
  var preview = document.querySelector("[data-lab-preview]");
  var outWeight = document.querySelector("[data-out-weight]");
  var outWidth = document.querySelector("[data-out-width]");
  var outSlant = document.querySelector("[data-out-slant]");
  var outTrack = document.querySelector("[data-out-track]");
  var presetButtons = document.querySelectorAll("[data-preset]");

  var presets = {
    neutral: { weight: 400, width: 100, slant: 0, track: 0 },
    poster: { weight: 860, width: 125, slant: -4, track: 6 },
    ui: { weight: 520, width: 96, slant: 0, track: 1 },
    kinetic: { weight: 720, width: 140, slant: 8, track: 10 }
  };

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
  }

  function toggleNav() {
    if (!navToggle || !navMenu) return;
    var open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", open ? "false" : "true");
    navMenu.classList.toggle("is-open", !open);
  }

  function setFilter(name) {
    filterButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-filter") === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    faceCards.forEach(function (card) {
      var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
      var show = name === "all" || tags.indexOf(name) !== -1;
      card.classList.toggle("is-hidden", !show);
    });
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateLab() {
    if (!preview || !weightInput || !widthInput || !slantInput || !trackInput) return;

    var weight = clampNumber(Number(weightInput.value) || 400, 100, 900);
    var width = clampNumber(Number(widthInput.value) || 100, 75, 150);
    var slant = clampNumber(Number(slantInput.value) || 0, -12, 12);
    var track = clampNumber(Number(trackInput.value) || 0, -4, 16);
    var text = sampleInput && sampleInput.value.trim() ? sampleInput.value : "MOVE";

    preview.textContent = text.toUpperCase();
    preview.style.fontWeight = String(weight);
    preview.style.transform = "scaleX(" + (width / 100).toFixed(3) + ") skewX(" + (-slant) + "deg)";
    preview.style.letterSpacing = (track * 0.04).toFixed(3) + "em";
    preview.style.filter = "contrast(" + (0.92 + weight / 2500).toFixed(3) + ")";

    if (outWeight) outWeight.textContent = String(Math.round(weight));
    if (outWidth) outWidth.textContent = String(Math.round(width));
    if (outSlant) outSlant.textContent = slant + "°";
    if (outTrack) outTrack.textContent = String(Math.round(track));
  }

  function applyPreset(name) {
    var preset = presets[name];
    if (!preset) return;
    if (weightInput) weightInput.value = String(preset.weight);
    if (widthInput) widthInput.value = String(preset.width);
    if (slantInput) slantInput.value = String(preset.slant);
    if (trackInput) trackInput.value = String(preset.track);
    updateLab();
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
  }

  if (navMenu) {
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFilter(btn.getAttribute("data-filter") || "all");
    });
  });

  [weightInput, widthInput, slantInput, trackInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener("input", updateLab);
    input.addEventListener("change", updateLab);
  });

  if (sampleInput) {
    sampleInput.addEventListener("input", updateLab);
  }

  presetButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyPreset(btn.getAttribute("data-preset") || "neutral");
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  updateLab();
})();
