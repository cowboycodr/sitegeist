(() => {
  "use strict";

  const SHIPMENTS = {
    "RG-8841-TYO": {
      status: "In transit",
      route: "Halvern Bay → Kessho Harbor · Ocean + rail · ETA Jul 24, 09:40",
      legs: [
        { title: "Picked up — Halvern Bay yard", meta: "Jul 12, 06:15 · custody: Relay Drayage 04", state: "done" },
        { title: "Loaded — MV Coral Meridian", meta: "Jul 13, 21:02 · handoff window met (+0 min)", state: "done" },
        { title: "Ocean leg — North Pacific lane", meta: "Day 4 of 8 · on schedule", state: "now" },
        { title: "Rail handoff — Kessho Harbor", meta: "Booked Jul 21, 14:00 · window guaranteed", state: "" },
        { title: "Delivery — Kessho inland depot", meta: "ETA Jul 24, 09:40", state: "" },
      ],
    },
    "RG-2107-RTM": {
      status: "At handoff",
      route: "Nordkade → Adari Point · Air + road · ETA Jul 18, 17:00",
      legs: [
        { title: "Picked up — Nordkade freight campus", meta: "Jul 16, 08:30 · custody: Relay Air 12", state: "done" },
        { title: "Air leg — Nordkade to Adari Point", meta: "Jul 17, 02:10 · arrived 22 min early", state: "done" },
        { title: "Customs clearance — Adari Point", meta: "In progress · docs pre-filed via Relay ID", state: "now" },
        { title: "Road leg — final 180 km", meta: "Carrier staged · departs on clearance", state: "" },
        { title: "Delivery — Adari commercial district", meta: "ETA Jul 18, 17:00", state: "" },
      ],
    },
    "RG-5530-SCL": {
      status: "Delivered",
      route: "Puerto Sereno → Marlowe Reach · Ocean · Completed Jul 15",
      legs: [
        { title: "Picked up — Puerto Sereno terminal", meta: "Jun 28, 11:45 · custody: Relay Marine 07", state: "done" },
        { title: "Ocean leg — South Pacific lane", meta: "Jun 30 – Jul 13 · 1 weather reroute, ETA held", state: "done" },
        { title: "Port handoff — Marlowe Reach", meta: "Jul 14, 05:20 · window met (+3 min)", state: "done" },
        { title: "Delivered — Marlowe Reach depot", meta: "Jul 15, 10:05 · signed: receiving dock B", state: "done" },
      ],
    },
  };

  const form = document.getElementById("track-form");
  const input = document.getElementById("track-input");
  const result = document.getElementById("track-result");
  if (!form || !input || !result) return;

  const escapeHtml = (text) =>
    text.replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));

  const normalize = (raw) =>
    raw.trim().toUpperCase().replace(/[‐-―]/g, "-").replace(/\s+/g, "");

  const render = (raw) => {
    const id = normalize(raw);
    if (!id) {
      result.innerHTML = "";
      return;
    }
    const shipment = SHIPMENTS[id];
    if (!shipment) {
      result.innerHTML =
        '<div class="track-error"><strong>' + escapeHtml(id) + "</strong> is not on the network. " +
        "Check the waybill ID, or try one of the sample shipments above.</div>";
      return;
    }
    const legs = shipment.legs
      .map(
        (leg) =>
          '<li class="' + leg.state + '"><span class="tl-title">' + leg.title +
          '</span><span class="tl-meta">' + leg.meta + "</span></li>",
      )
      .join("");
    result.innerHTML =
      '<article class="waybill-card"><div class="waybill-head">' +
      '<span class="waybill-id">' + id + "</span>" +
      '<span class="waybill-status">' + shipment.status + "</span></div>" +
      '<p class="waybill-route">' + shipment.route + "</p>" +
      '<ol class="timeline">' + legs + "</ol></article>";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render(input.value);
  });

  document.querySelectorAll(".chip[data-waybill]").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.waybill;
      render(chip.dataset.waybill);
    });
  });
})();
