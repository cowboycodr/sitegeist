(() => {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const familySelect = document.getElementById("family-select");
  const sizeRange = document.getElementById("size-range");
  const weightRange = document.getElementById("weight-range");
  const trackRange = document.getElementById("track-range");
  const sampleInput = document.getElementById("sample-input");
  const testerOutput = document.getElementById("tester-output");
  const sizeValue = document.getElementById("size-value");
  const weightValue = document.getElementById("weight-value");
  const trackValue = document.getElementById("track-value");

  const familyClasses = [
    "family-face-collide",
    "family-face-stretch",
    "family-face-murmur",
    "family-face-signal",
    "family-face-perform",
    "family-face-ledger",
  ];

  function closeNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  function applyFamily(family) {
    if (!testerOutput || !familySelect) return;
    familyClasses.forEach((cls) => testerOutput.classList.remove(cls));
    testerOutput.classList.add(`family-face-${family}`);
    if (familySelect.value !== family) {
      familySelect.value = family;
    }
  }

  function updatePreview() {
    if (!testerOutput) return;

    const size = sizeRange ? Number(sizeRange.value) : 64;
    const weight = weightRange ? Number(weightRange.value) : 500;
    const tracking = trackRange ? Number(trackRange.value) : 0;
    const text = sampleInput ? sampleInput.value : "Letters that perform";

    testerOutput.textContent = text.length ? text : "Type something";
    testerOutput.style.fontSize = `${size}px`;
    testerOutput.style.fontWeight = String(weight);
    testerOutput.style.letterSpacing = `${tracking / 1000}em`;

    if (sizeValue) sizeValue.textContent = String(size);
    if (weightValue) weightValue.textContent = String(weight);
    if (trackValue) trackValue.textContent = String(tracking);
  }

  if (familySelect) {
    familySelect.addEventListener("change", () => {
      applyFamily(familySelect.value);
    });
  }

  [sizeRange, weightRange, trackRange].forEach((input) => {
    if (input) {
      input.addEventListener("input", updatePreview);
    }
  });

  if (sampleInput) {
    sampleInput.addEventListener("input", updatePreview);
  }

  document.querySelectorAll("[data-use]").forEach((button) => {
    button.addEventListener("click", () => {
      const family = button.getAttribute("data-use");
      if (!family) return;
      applyFamily(family);
      updatePreview();
      const tester = document.getElementById("tester");
      if (tester) {
        tester.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (sampleInput) sampleInput.focus({ preventScroll: true });
    });
  });

  applyFamily(familySelect ? familySelect.value : "stretch");
  updatePreview();
})();
