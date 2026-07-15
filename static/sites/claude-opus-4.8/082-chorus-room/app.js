"use strict";

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Data ---------- */
  const rooms = [
    {
      id: "afterglow",
      room: "Afterglow Club",
      album: "Neon Cartography",
      artist: "Halcyon Reef",
      tag: "Ambient",
      listeners: 2841,
      here: "you + 340 here",
      hues: [268, 320],
      tracks: [
        ["Border Lights", 224], ["Slow Freeway", 271], ["Cartographer", 198],
        ["Tidal", 246], ["Neon Cartography", 305], ["Home Frequency", 214],
      ],
      chat: [
        ["Mira", "the way track two just opens up. put your headphones on."],
        ["Deo", "this whole record is a night drive"],
        ["June", "waiting for the title track, it destroys me every time"],
      ],
    },
    {
      id: "basement",
      room: "The Basement",
      album: "Copper Wires",
      artist: "Sunday Mechanics",
      tag: "Indie Rock",
      listeners: 1976,
      here: "you + 512 here",
      hues: [18, 44],
      tracks: [
        ["Ignition", 187], ["Copper Wires", 233], ["Rust Belt", 209],
        ["Garage Door", 176], ["Long Way Round", 258], ["Last Call", 241],
      ],
      chat: [
        ["Tess", "first band I saw live and this album still holds up"],
        ["Ronan", "the bridge on Rust Belt >>>"],
        ["Ash", "who else is screaming Long Way Round in a minute"],
      ],
    },
    {
      id: "kitchen",
      room: "Kitchen Sessions",
      album: "Marrow",
      artist: "Odessa Vale",
      tag: "Soul",
      listeners: 3402,
      here: "you + 890 here",
      hues: [340, 20],
      tracks: [
        ["Marrow", 215], ["Bone Deep", 254], ["Salt", 189],
        ["Warm Water", 262], ["Sunday Best", 231], ["Amen Corner", 288],
      ],
      chat: [
        ["Lena", "her voice on Salt is unreal, no notes"],
        ["Kojo", "cooking dinner to this, best possible use"],
        ["Priya", "warm water is the one. every single time."],
      ],
    },
    {
      id: "observatory",
      room: "The Observatory",
      album: "Parallax",
      artist: "Meridian Field",
      tag: "Electronic",
      listeners: 1533,
      here: "you + 210 here",
      hues: [200, 260],
      tracks: [
        ["Parallax", 268], ["Blue Shift", 241], ["Orbit Decay", 225],
        ["Event Horizon", 312], ["Redshift", 198], ["Coming Home", 276],
      ],
      chat: [
        ["Wen", "event horizon at full volume, lights off. trust me."],
        ["Marco", "this is what my brain sounds like at 2am"],
        ["Sky", "orbit decay has the fattest low end"],
      ],
    },
    {
      id: "porch",
      room: "Front Porch",
      album: "Dust & Honey",
      artist: "The Weathervanes",
      tag: "Folk",
      listeners: 987,
      here: "you + 128 here",
      hues: [40, 90],
      tracks: [
        ["Dust & Honey", 203], ["Creekbed", 187], ["Whittle", 172],
        ["Harvest Moon", 244], ["Old Fence", 215], ["Goodnight Holler", 231],
      ],
      chat: [
        ["Cal", "harmonies on the chorus give me chills"],
        ["Nell", "this is a rocking-chair-and-lemonade record"],
        ["Bo", "whittle is so short and so perfect"],
      ],
    },
    {
      id: "atrium",
      room: "Glass Atrium",
      album: "Vitrine",
      artist: "Clara Nought",
      tag: "Jazz",
      listeners: 1244,
      here: "you + 176 here",
      hues: [150, 190],
      tracks: [
        ["Vitrine", 296], ["Brass Rain", 264], ["Late Set", 331],
        ["Quarter Note", 208], ["Smoke Room", 279], ["Encore", 247],
      ],
      chat: [
        ["Ivo", "the piano runs on Late Set are absurd"],
        ["Suki", "poured a drink specifically for this room"],
        ["Fen", "brass rain, oh my"],
      ],
    },
  ];

  const bots = [
    ["Mira", "syncing perfectly on my end, love this"],
    ["Deo", "ok that transition was clean"],
    ["June", "chills. actual chills."],
    ["Tess", "adding this to the shelf immediately"],
    ["Ash", "who picked this room, you have taste"],
    ["Kojo", "turning it up"],
    ["Wen", "the bassline though"],
    ["Sky", "someone start a poll for the encore"],
    ["Cal", "this bridge lives in my head rent free"],
    ["Suki", "best twelve minutes of my night"],
  ];

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
  const rand = (n) => Math.floor(Math.random() * n);

  function coverSvg(hues, seed) {
    const [h1, h2] = hues;
    const bars = [];
    let r = seed * 9301 + 49297;
    const nx = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 14; i++) {
      const bh = 20 + nx() * 76;
      bars.push(`<rect x="${8 + i * 14}" y="${100 - bh / 2}" width="8" height="${bh}" rx="3" fill="rgba(255,255,255,${0.35 + nx() * 0.5})"/>`);
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='hsl(${h1},72%,58%)'/>
        <stop offset='1' stop-color='hsl(${h2},70%,46%)'/>
      </linearGradient></defs>
      <rect width='200' height='200' fill='url(#g)'/>
      <circle cx='150' cy='52' r='40' fill='rgba(255,255,255,.12)'/>
      <circle cx='150' cy='52' r='9' fill='rgba(20,15,34,.55)'/>
      <g transform='translate(0,50)'>${bars.join("")}</g>
    </svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  function avatarColor(name) {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `hsl(${h},70%,66%)`;
  }

  /* ---------- State ---------- */
  const state = { room: rooms[0], track: 0, elapsed: 0, playing: !reduceMotion, volume: 72 };
  let ticker = null;

  /* ---------- Build room cards ---------- */
  const grid = $("#roomGrid");
  rooms.forEach((rm, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "room-card";
    btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    btn.dataset.id = rm.id;
    btn.innerHTML = `
      <div class="rc-cover" style="background:${coverSvg(rm.hues, i + 1)};background-size:cover"></div>
      <div class="rc-meta">
        <span class="rc-room">${rm.room}</span>
        <span class="rc-album">${rm.album} · ${rm.artist}</span>
        <span class="rc-now"><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span> ${rm.tracks[0][0]}</span>
      </div>
      <div class="rc-foot">
        <span class="rc-listeners">♪ ${rm.listeners.toLocaleString()} listening</span>
        <span class="rc-tag">${rm.tag}</span>
      </div>`;
    btn.addEventListener("click", () => selectRoom(rm.id, true));
    li.appendChild(btn);
    grid.appendChild(li);
  });
  $("#statRooms").textContent = String(rooms.length);

  /* ---------- Booth elements ---------- */
  const el = {
    cover: $("#boothCover"), room: $("#boothRoom"), track: $("#boothTrack"), artist: $("#boothArtist"),
    viz: $("#viz"), seek: $("#boothSeek"), elapsed: $("#boothElapsed"), duration: $("#boothDuration"),
    playBtn: $("#playBtn"), tracklist: $("#tracklist"), vol: $("#vol"),
    chatLog: $("#chatLog"), chatHere: $("#chatHere"), chatForm: $("#chatForm"), chatInput: $("#chatInput"),
  };

  // Build visualizer bars
  for (let i = 0; i < 28; i++) {
    const bar = document.createElement("i");
    bar.style.animationDelay = `${(i % 7) * 90}ms`;
    bar.style.animationDuration = `${700 + (i % 5) * 120}ms`;
    el.viz.appendChild(bar);
  }

  function renderTracklist() {
    el.tracklist.innerHTML = "";
    state.room.tracks.forEach(([name, len], i) => {
      const li = document.createElement("li");
      li.setAttribute("aria-current", i === state.track ? "true" : "false");
      li.innerHTML = `<span class="tl-n">${i + 1}</span><span class="tl-title">${name}</span><span class="tl-len">${fmt(len)}</span>`;
      li.addEventListener("click", () => { state.track = i; state.elapsed = 0; refreshTrack(); });
      el.tracklist.appendChild(li);
    });
  }

  function refreshTrack() {
    const [name, len] = state.room.tracks[state.track];
    el.track.textContent = name;
    el.duration.textContent = fmt(len);
    el.seek.max = String(len);
    updateSeek();
    el.tracklist.querySelectorAll("li").forEach((li, i) =>
      li.setAttribute("aria-current", i === state.track ? "true" : "false"));
  }

  function updateSeek() {
    const len = state.room.tracks[state.track][1];
    el.seek.value = String(Math.min(state.elapsed, len));
    el.elapsed.textContent = fmt(state.elapsed);
    el.seek.style.setProperty("--pct", `${(state.elapsed / len) * 100}%`);
  }

  function setPlaying(on) {
    state.playing = on;
    el.playBtn.setAttribute("aria-pressed", String(on));
    el.playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    el.viz.classList.toggle("playing", on && !reduceMotion);
    if (on) startTicker(); else stopTicker();
  }

  function startTicker() {
    stopTicker();
    ticker = window.setInterval(() => {
      if (!state.playing) return;
      state.elapsed += 1;
      const len = state.room.tracks[state.track][1];
      if (state.elapsed >= len) {
        // Between tracks: a friend chimes in, then advance.
        addSystem(`Between tracks — up next: ${state.room.tracks[(state.track + 1) % state.room.tracks.length][0]}`);
        state.track = (state.track + 1) % state.room.tracks.length;
        state.elapsed = 0;
        refreshTrack();
        maybeBotChat();
      } else {
        updateSeek();
      }
    }, 1000);
  }
  function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

  /* ---------- Chat ---------- */
  function timeStamp() {
    const d = new Date();
    return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function addMessage(who, txt, kind = "") {
    const li = document.createElement("li");
    li.className = `msg ${kind}`;
    if (kind === "system") {
      li.innerHTML = `<p class="txt">${escapeHtml(txt)}</p>`;
    } else {
      const initials = who.slice(0, 2).toUpperCase();
      li.innerHTML = `
        <span class="av" style="background:${avatarColor(who)}">${initials}</span>
        <div class="bubble">
          <span class="who">${escapeHtml(who)}</span><span class="when">${timeStamp()}</span>
          <p class="txt">${escapeHtml(txt)}</p>
        </div>`;
    }
    el.chatLog.appendChild(li);
    el.chatLog.scrollTop = el.chatLog.scrollHeight;
    // Trim to keep the log tidy.
    while (el.chatLog.children.length > 40) el.chatLog.removeChild(el.chatLog.firstChild);
  }
  function addSystem(txt) { addMessage("", txt, "system"); }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  let botTimer = null;
  function maybeBotChat() {
    if (Math.random() < 0.7) {
      const [who, txt] = bots[rand(bots.length)];
      window.setTimeout(() => addMessage(who, txt), 900 + rand(1600));
    }
  }
  function startBotLoop() {
    stopBotLoop();
    const loop = () => {
      if (state.playing && document.visibilityState === "visible") maybeBotChat();
      botTimer = window.setTimeout(loop, 9000 + rand(11000));
    };
    botTimer = window.setTimeout(loop, 9000 + rand(8000));
  }
  function stopBotLoop() { if (botTimer) { clearTimeout(botTimer); botTimer = null; } }

  /* ---------- Select room ---------- */
  function selectRoom(id, announce) {
    const rm = rooms.find((r) => r.id === id);
    if (!rm) return;
    state.room = rm;
    state.track = 0;
    state.elapsed = 0;

    const idx = rooms.indexOf(rm) + 1;
    el.cover.style.background = coverSvg(rm.hues, idx);
    el.cover.style.backgroundSize = "cover";
    el.room.textContent = rm.room;
    el.artist.textContent = rm.artist + " — " + rm.album;
    el.chatHere.textContent = rm.here;

    renderTracklist();
    refreshTrack();

    grid.querySelectorAll(".room-card").forEach((c) =>
      c.setAttribute("aria-pressed", String(c.dataset.id === id)));

    // Seed the chat with this room's conversation.
    el.chatLog.innerHTML = "";
    addSystem(`You joined ${rm.room}. ${rm.tracks[0][0]} is playing.`);
    rm.chat.forEach(([who, txt]) => addMessage(who, txt));

    if (announce) {
      toast(`Joined ${rm.room}`);
      document.getElementById("booth").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  /* ---------- Controls ---------- */
  el.playBtn.addEventListener("click", () => setPlaying(!state.playing));
  $("[data-next]").addEventListener("click", () => {
    state.track = (state.track + 1) % state.room.tracks.length; state.elapsed = 0; refreshTrack();
  });
  $("[data-prev]").addEventListener("click", () => {
    if (state.elapsed > 3) { state.elapsed = 0; updateSeek(); return; }
    state.track = (state.track - 1 + state.room.tracks.length) % state.room.tracks.length;
    state.elapsed = 0; refreshTrack();
  });
  el.seek.addEventListener("input", () => {
    state.elapsed = Number(el.seek.value); updateSeek();
  });
  el.vol.addEventListener("input", () => { state.volume = Number(el.vol.value); });

  el.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = el.chatInput.value.trim();
    if (!val) return;
    addMessage("You", val, "you");
    el.chatInput.value = "";
    maybeBotChat();
  });

  document.querySelectorAll("[data-react]").forEach((b) => {
    b.addEventListener("click", () => {
      addMessage("You", b.dataset.react, "you");
      maybeBotChat();
    });
  });

  document.querySelector("[data-start-session]").addEventListener("click", () => {
    toast("Session started — pick a record from your shelf to host.");
    document.getElementById("rooms").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Presence flicker ---------- */
  const presenceEl = $("#presenceCount");
  let presence = 12408;
  window.setInterval(() => {
    presence += rand(21) - 10;
    presenceEl.textContent = presence.toLocaleString();
  }, 4000);

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Pause background when tab hidden ---------- */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopBotLoop();
    else startBotLoop();
  });

  /* ---------- Init ---------- */
  selectRoom(rooms[0].id, false);
  setPlaying(!reduceMotion);
  startBotLoop();
})();
