(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- Room mood filters ---- */
  const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".room-card"));
  const emptyNote = document.getElementById("filter-empty");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((other) => {
        const active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      const filter = chip.dataset.filter;
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.mood === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      emptyNote.hidden = visible > 0;
    });
  });

  /* ---- Join buttons ---- */
  const joinNote = document.getElementById("join-note");
  let joinTimer = 0;
  document.querySelectorAll(".join-btn").forEach((button) => {
    button.addEventListener("click", () => {
      joinNote.textContent =
        "You’re on the door list for “" +
        button.dataset.room +
        "” — you’ll slip in when the current track ends.";
      clearTimeout(joinTimer);
      joinTimer = setTimeout(() => {
        joinNote.textContent = "";
      }, 6000);
    });
  });

  /* ---- Now-playing progress (simulated, honors reduced motion) ---- */
  const bar = document.getElementById("np-bar");
  const elapsedLabel = document.getElementById("np-elapsed");
  const gapLabel = document.getElementById("gap-count");
  const progress = document.querySelector(".np-progress");
  const trackLength = 252; // 4:12
  let elapsed = 97; // 1:37

  const format = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ":" + String(s).padStart(2, "0");
  };

  const render = () => {
    bar.style.width = ((elapsed / trackLength) * 100).toFixed(1) + "%";
    elapsedLabel.textContent = format(elapsed);
    gapLabel.textContent = format(trackLength - elapsed);
    progress.setAttribute("aria-valuenow", String(elapsed));
    progress.setAttribute(
      "aria-valuetext",
      format(elapsed) + " of " + format(trackLength)
    );
  };

  render();

  if (!reducedMotion.matches) {
    const tick = setInterval(() => {
      if (reducedMotion.matches) return;
      elapsed += 1;
      if (elapsed >= trackLength) {
        clearInterval(tick);
        elapsed = trackLength;
      }
      render();
    }, 1000);
  }

  /* ---- Whisper form ---- */
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const log = document.querySelector(".chat-log");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const item = document.createElement("li");
    item.className = "msg msg-whisper";

    const avatar = document.createElement("span");
    avatar.className = "avatar av-1";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "Y";

    const body = document.createElement("div");
    const name = document.createElement("p");
    name.className = "msg-name";
    name.textContent = "You ";
    const tag = document.createElement("em");
    tag.textContent = "whisper";
    name.appendChild(tag);

    const message = document.createElement("p");
    message.textContent = text;

    body.appendChild(name);
    body.appendChild(message);
    item.appendChild(avatar);
    item.appendChild(body);
    log.appendChild(item);

    input.value = "";
    input.focus();
  });
})();
