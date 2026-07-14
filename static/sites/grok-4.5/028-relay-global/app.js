(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const trackForm = document.getElementById("track-form");
  const trackResult = document.getElementById("track-result");
  const shipmentInput = document.getElementById("shipment-id");

  const knownShipments = {
    "RG-482910": {
      status: "Relay handoff",
      route: "Shanghai → Rotterdam → Chicago",
      detail: "Cold-chain unit is queued for air feeder at EU Hub RDM-3. ETA Chicago hub Tue 14:40 local.",
    },
    "RG-119304": {
      status: "In transit",
      route: "Shenzhen → Los Angeles",
      detail: "Ocean leg on Pacific trunk 7. Customs pre-clearance submitted. Next scan at LAX relay.",
    },
    "RG-775201": {
      status: "Delivered",
      route: "São Paulo → Hamburg",
      detail: "Proof of delivery captured at Hamburg dock bay 14. Seal intact; temperature within band.",
    },
  };

  function setMenuOpen(open) {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      setMenuOpen(!navLinks.classList.contains("is-open"));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  function renderResult(shipmentId) {
    if (!trackResult) return;

    const match = knownShipments[shipmentId];
    if (match) {
      trackResult.innerHTML =
        '<span class="badge">' +
        match.status +
        "</span>" +
        "<h4>" +
        shipmentId +
        "</h4>" +
        "<p><strong>" +
        match.route +
        "</strong></p>" +
        "<p>" +
        match.detail +
        "</p>";
    } else if (/^RG-[A-Z0-9]{4,12}$/.test(shipmentId)) {
      trackResult.innerHTML =
        '<span class="badge">On network</span>' +
        "<h4>" +
        shipmentId +
        "</h4>" +
        "<p><strong>Multimodal corridor assigned</strong></p>" +
        "<p>This reference is recognized on the Relay mesh. Latest milestone: origin gate-out confirmed; next handoff expected within 6 hours.</p>";
    } else {
      trackResult.innerHTML =
        '<span class="badge" style="background:rgba(244,63,94,0.12);color:#e11d48">Not found</span>' +
        "<h4>No match for that reference</h4>" +
        "<p>Use a Relay ID such as <strong>RG-482910</strong>. References start with RG- followed by digits or letters.</p>";
    }

    trackResult.classList.add("is-visible");
  }

  if (trackForm && shipmentInput) {
    trackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = normalizeId(shipmentInput.value);
      shipmentInput.value = id;
      if (!id) {
        shipmentInput.focus();
        return;
      }
      renderResult(id);
    });
  }
})();
