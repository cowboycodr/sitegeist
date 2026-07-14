const schedules = {
  tonight: [
    ["23:00", "Low Light Assembly", "Mara Vale", true],
    ["01:00", "Peripheral Vision", "Osei Ward", false],
    ["02:30", "The Long Echo", "June Static", false],
    ["04:00", "Before the Birds", "Ines North", false]
  ],
  tomorrow: [
    ["23:00", "Heat Mirage", "Ari Sol", false],
    ["00:30", "Substrate", "E. Kestrel", false],
    ["02:00", "Objects in Fog", "Miko Venn", false],
    ["04:00", "Pale Horizon", "Tala Moss", false]
  ],
  thursday: [
    ["23:00", "Night Bloom", "Nia Grey", false],
    ["00:30", "Soft Machines", "Wren Archive", false],
    ["02:00", "Magnetic Weather", "Samir Lake", false],
    ["04:30", "First Light Studies", "Clara Coil", false]
  ]
};

const list = document.querySelector("#schedule-list");
function renderSchedule(day) {
  list.innerHTML = "";
  schedules[day].forEach(([time, title, host, onair]) => {
    const row = document.createElement("article");
    row.className = `show${onair ? " onair" : ""}`;
    row.innerHTML = `<div class="show-time">${time}${onair ? " · LIVE" : ""}</div><div class="show-title">${title}</div><div class="show-host">Selected by ${host}</div><div class="show-arrow" aria-hidden="true">↗</div>`;
    list.append(row);
  });
}
renderSchedule("tonight");

document.querySelectorAll("[data-day]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-day]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderSchedule(button.dataset.day);
  });
});

const play = document.querySelector(".js-play");
const receiver = document.querySelector("#receiver");
play.addEventListener("click", () => {
  const playing = !play.classList.contains("playing");
  play.classList.toggle("playing", playing);
  receiver.classList.toggle("playing", playing);
  play.setAttribute("aria-pressed", String(playing));
  play.querySelector(".play-label").textContent = playing ? "Signal live" : "Listen live";
});

function updateClock() {
  const now = new Date();
  document.querySelector("#clock").textContent = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", hour12: false});
}
updateClock();
setInterval(updateClock, 30000);
