"use strict";

/* ---------- Object motifs (line-art SVG, CSP-safe presentation attributes) ---------- */
const L = 'fill="none" stroke="#26211c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
const A = 'fill="#b56a3a"';
const T = 'fill="none" stroke="#8f4f28" stroke-width="4" stroke-linecap="round"';
const motifs = {
  key: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="30" cy="34" r="16" ${L}/><circle cx="30" cy="34" r="5" ${A}/><path d="M42 46 L78 82 M70 74 L80 64 M60 64 L68 56" ${L}/></svg>`,
  button: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" ${L}/><circle cx="41" cy="43" r="4" ${A}/><circle cx="59" cy="43" r="4" ${A}/><circle cx="41" cy="57" r="4" ${A}/><circle cx="59" cy="57" r="4" ${A}/></svg>`,
  ticket: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 34 h64 v12 a6 6 0 0 0 0 12 v8 h-64 v-8 a6 6 0 0 0 0-12 z" ${L}/><path d="M64 34 v32" fill="none" stroke="#b56a3a" stroke-width="4" stroke-dasharray="3 6"/><path d="M26 46 h26 M26 54 h20" ${T}/></svg>`,
  shell: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 78 C22 78 16 44 30 30 C40 20 60 20 70 30 C84 44 78 78 50 78 Z" ${L}/><path d="M50 78 L34 34 M50 78 L50 30 M50 78 L66 34" ${L}/></svg>`,
  thimble: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M34 78 h32 v-24 a16 16 0 0 0-32 0 z" ${L}/><path d="M40 44 h4 M50 42 h4 M60 44 h4 M38 54 h4 M48 52 h4 M58 54 h4 M44 62 h4 M54 62 h4" fill="none" stroke="#b56a3a" stroke-width="4" stroke-linecap="round"/></svg>`,
  matches: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="26" y="42" width="48" height="34" rx="4" ${L}/><rect x="26" y="58" width="48" height="18" rx="4" fill="#ece4d6" stroke="#26211c" stroke-width="5"/><path d="M46 42 v-16 M54 42 v-16" ${L}/><circle cx="46" cy="24" r="4" ${A}/><circle cx="54" cy="24" r="4" ${A}/></svg>`,
  spoon: `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="38" cy="34" rx="15" ry="19" ${L}/><path d="M44 48 C56 64 60 72 64 82" ${L}/></svg>`,
  watch: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="52" r="26" ${L}/><path d="M42 26 h16 M40 22 h20" ${L}/><path d="M50 52 L50 38 M50 52 L62 58" ${T}/></svg>`,
  marble: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="52" r="28" ${L}/><path d="M34 38 C48 46 52 58 66 66" fill="none" stroke="#b56a3a" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="42" r="4" fill="#f4efe6"/></svg>`,
  postcard: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="20" y="32" width="60" height="40" rx="3" ${L}/><rect x="60" y="38" width="14" height="12" rx="2" fill="none" stroke="#8f4f28" stroke-width="4"/><path d="M26 42 h24 M26 50 h24 M26 58 h44" ${T}/></svg>`,
  glasses: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="32" cy="52" r="14" ${L}/><circle cx="68" cy="52" r="14" ${L}/><path d="M46 52 h8 M18 46 l-6-6 M82 46 l6-6" ${L}/></svg>`,
  ring: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="58" r="22" ${L}/><path d="M40 40 L50 24 L60 40 Z" ${L}/><circle cx="50" cy="34" r="3" ${A}/></svg>`,
};

/* ---------- The collection ---------- */
const objects = [
  {
    id: "brass-key",
    acc: "1962.014",
    title: "The Brass Door Key",
    motif: "key",
    room: "home",
    donor: "Gift of Aurelia Sandoval",
    meta: "Brass · c. 1958",
    snip: "It opened a front door that has not existed for forty years, yet it still hangs by the coats.",
    tags: ["home", "loss", "habit"],
    story: [
      "The house on Calle Verde was sold in 1979, then demolished a decade later to make room for a road. Aurelia kept the key.",
      "\"Every winter I found it in a coat pocket,\" she wrote. \"I would think, I must throw this away — and then I would put it back. It weighs almost nothing. It weighs everything.\"",
      "The key no longer opens a door. It opens an afternoon: a kettle, a radio, her mother calling her in from the yard before the light went.",
    ],
  },
  {
    id: "coat-button",
    acc: "1988.221",
    title: "A Single Coat Button",
    motif: "button",
    room: "worn",
    donor: "Gift of Theo Marsh",
    meta: "Horn · four holes",
    snip: "Sewn back on eleven times. The coat is gone; the button outlived it.",
    tags: ["worn", "care", "repair"],
    story: [
      "The coat was his father's, then his, then no one's. But the button kept coming loose, and someone kept sewing it back.",
      "\"My mother sewed it, then I learned to. It became a small argument with time — the coat wanted to fall apart, and we refused.\"",
      "When the coat was finally too thin to wear, Theo cut the button free and kept it in a matchbox. It is the last piece still holding on.",
    ],
  },
  {
    id: "cinema-stub",
    acc: "2001.077",
    title: "Ticket Stub, Row H",
    motif: "ticket",
    room: "journeys",
    donor: "Anonymous",
    meta: "Paper · 1994",
    snip: "The film was forgettable. The person in the next seat was not.",
    tags: ["journeys", "chance", "first"],
    story: [
      "Nobody remembers the movie. They remember the armrest neither of them claimed, and the walk to the bus that took the long way on purpose.",
      "The stub was found thirty years later inside a paperback, used as a bookmark and forgotten there — a receipt for a night that changed a life without announcing it.",
      "It has been donated anonymously, \"so that the two of us can stay strangers to everyone but each other.\"",
    ],
  },
  {
    id: "beach-shell",
    acc: "1975.102",
    title: "Shell From an Ordinary Beach",
    motif: "shell",
    room: "journeys",
    donor: "Gift of the Okafor family",
    meta: "Scallop · unpolished",
    snip: "Chosen by a five-year-old from ten thousand others, and therefore priceless.",
    tags: ["journeys", "childhood", "family"],
    story: [
      "It is a common scallop shell, chipped at one edge, worth nothing at all. A child picked it on the last family holiday before the family became a different shape.",
      "\"She gave it to me and said, keep this one, it's the best one. It was not the best one. It is the best one.\"",
      "The Okafors donated it together, all of them, which is itself a small miracle the shell can take some credit for.",
    ],
  },
  {
    id: "silver-thimble",
    acc: "1949.031",
    title: "Grandmother's Thimble",
    motif: "thimble",
    room: "worn",
    donor: "Gift of Ruth Adler",
    meta: "Nickel silver · worn smooth",
    snip: "The dimples are polished flat on one side from a lifetime of the same finger.",
    tags: ["worn", "craft", "inheritance"],
    story: [
      "You can tell which hand wore it. Decades of pressure smoothed the little dimples on one side into a mirror.",
      "It mended school trousers, wedding hems, and eventually a wedding dress that came back around a generation later.",
      "\"I don't sew,\" Ruth admits. \"But I keep it on the windowsill, and every so often I put it on, just to feel where her finger went.\"",
    ],
  },
  {
    id: "matchbox",
    acc: "1993.188",
    title: "Half-Full Matchbox",
    motif: "matches",
    room: "home",
    donor: "Gift of Lena Brandt",
    meta: "Cardboard · café print",
    snip: "Eleven matches, one struck. The café closed in 1996.",
    tags: ["home", "place", "memory"],
    story: [
      "The café on the corner gave out matchboxes to everyone, whether they smoked or not. This one holds eleven matches and a memory of a Tuesday.",
      "One match is missing — struck to light a birthday candle on a slice of cake shared between two people who only had one fork.",
      "The café is a phone shop now. The matchbox is the only proof the light was ever there.",
    ],
  },
  {
    id: "bent-spoon",
    acc: "1980.045",
    title: "The Slightly Bent Spoon",
    motif: "spoon",
    room: "home",
    donor: "Gift of the Petrov household",
    meta: "Steel · handle bent left",
    snip: "Every family has one. This is the one that was always fought over.",
    tags: ["home", "ritual", "belonging"],
    story: [
      "Out of a drawer of identical spoons, this was the good one — bent slightly at the handle, and somehow always claimed first at breakfast.",
      "No one knows why it was better. It simply was. To hold it was to have won a small, wordless morning contest.",
      "\"When we cleared the house, four grown adults stood around the drawer,\" the Petrovs wrote. \"We all reached for the same spoon.\"",
    ],
  },
  {
    id: "stopped-watch",
    acc: "1967.009",
    title: "Watch Stopped at 4:10",
    motif: "watch",
    room: "worn",
    donor: "Gift of Samuel Ibori",
    meta: "Wind-up · unrepaired",
    snip: "It could be fixed for a small fee. It will never be fixed.",
    tags: ["worn", "grief", "time"],
    story: [
      "It stopped the afternoon he stopped, and nobody has wound it since. A jeweler once offered to clean the movement. The offer was declined, politely and forever.",
      "\"Ten past four is not a time on that watch,\" Samuel says. \"It is a place. It is exactly where I left him.\"",
      "The hands have not moved in fifty-nine years. In the museum they never will.",
    ],
  },
  {
    id: "clay-marble",
    acc: "1955.077",
    title: "The Lucky Marble",
    motif: "marble",
    room: "play",
    donor: "Gift of Hannah Weiss",
    meta: "Glass · single blue swirl",
    snip: "Undefeated in the schoolyard. Retired at the height of its powers.",
    tags: ["play", "childhood", "luck"],
    story: [
      "It never lost. Whether by skill or superstition, this marble won every game it played, and its owner retired it undefeated at the age of nine.",
      "It rode in a pocket for the rest of his life, rubbed for luck before exams, interviews, and one very frightening flight.",
      "\"I never really believed in it,\" Hannah's father admitted near the end. \"I just never wanted to find out I was wrong.\"",
    ],
  },
  {
    id: "postcard",
    acc: "1971.244",
    title: "Postcard Never Sent",
    motif: "postcard",
    room: "journeys",
    donor: "Gift of Marguerite Lévy",
    meta: "Card · address blank",
    snip: "\"Wish you were here.\" Written, addressed to no one, kept for fifty years.",
    tags: ["journeys", "longing", "words"],
    story: [
      "The front shows a harbor at dusk. The back is filled edge to edge in careful handwriting — and there is no address, no stamp, no name.",
      "It was written to someone who could no longer receive post, on a trip taken partly to feel near them again.",
      "\"Some letters aren't meant to arrive,\" Marguerite wrote. \"They're meant to be written. This one arrived in me.\"",
    ],
  },
  {
    id: "reading-glasses",
    acc: "1990.118",
    title: "His Reading Glasses",
    motif: "glasses",
    room: "worn",
    donor: "Gift of Dev Ramanathan",
    meta: "Wire frame · one arm taped",
    snip: "Folded on top of a newspaper he never finished.",
    tags: ["worn", "grief", "ordinary"],
    story: [
      "They were left folded on the sports page, arm mended with a strip of tape he refused to replace because \"it still works, doesn't it.\"",
      "For a year no one moved them. To move them was to admit the newspaper would stay unfinished.",
      "They are donated now not because the grief is gone, but because it has found a shape it can rest in — a small glass case, well lit, kept.",
    ],
  },
  {
    id: "wedding-ring",
    acc: "1948.001",
    title: "The Resized Ring",
    motif: "ring",
    room: "worn",
    donor: "Gift of Eleanor Voss",
    meta: "Gold · resized twice",
    snip: "Made larger for one marriage, smaller for the next. The gold remembers both.",
    tags: ["worn", "love", "change"],
    story: [
      "The same band was resized twice across one long life — once larger, once smaller — and worn through joy, loss, and a second, quieter joy.",
      "A jeweler can see the seams if he looks. \"Two solders,\" he said. \"This ring has had a whole life.\"",
      "It is the first object in the collection, accession number one, donated on the day the museum opened, \"so the small things would have a place to be believed.\"",
    ],
  },
];

const rooms = [
  { id: "all", label: "All rooms" },
  { id: "home", label: "The Kitchen Drawer" },
  { id: "worn", label: "Things Once Worn" },
  { id: "journeys", label: "Journeys" },
  { id: "play", label: "Play" },
];

/* ---------- Render ---------- */
const grid = document.getElementById("grid");
const roomBar = document.getElementById("rooms");
const dialog = document.getElementById("detail");
let current = "all";
let openIndex = -1;

function visibleObjects() {
  return current === "all" ? objects : objects.filter((o) => o.room === current);
}

function renderGrid() {
  const list = visibleObjects();
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = '<p class="empty">This room is being rehung. Please try another.</p>';
    return;
  }
  list.forEach((obj) => {
    const idx = objects.indexOf(obj);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vitrine";
    btn.setAttribute("aria-label", `${obj.title}. ${obj.meta}. Open story.`);
    btn.innerHTML =
      `<div class="frame"><span class="acc">${obj.acc}</span>${motifs[obj.motif]}</div>` +
      `<div class="plaque"><div class="meta">${obj.meta}</div>` +
      `<h3>${obj.title}</h3><p class="snip">${obj.snip}</p></div>`;
    btn.addEventListener("click", () => openObject(idx));
    grid.appendChild(btn);
  });
}

function renderRooms() {
  rooms.forEach((r) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "room";
    b.textContent = r.label;
    b.setAttribute("aria-pressed", String(r.id === current));
    b.addEventListener("click", () => {
      current = r.id;
      [...roomBar.children].forEach((c, i) =>
        c.setAttribute("aria-pressed", String(rooms[i].id === current)),
      );
      renderGrid();
    });
    roomBar.appendChild(b);
  });
}

/* ---------- Detail dialog ---------- */
const dArt = document.getElementById("d-art");
const dAcc = document.getElementById("d-acc");
const dTitle = document.getElementById("d-title");
const dDonor = document.getElementById("d-donor");
const dStory = document.getElementById("d-story");
const dTags = document.getElementById("d-tags");

function fillDetail(idx) {
  const o = objects[idx];
  openIndex = idx;
  dArt.innerHTML = motifs[o.motif];
  dAcc.textContent = `Accession ${o.acc} · ${o.meta}`;
  dTitle.textContent = o.title;
  dDonor.textContent = o.donor;
  dStory.innerHTML = o.story.map((p) => `<p>${p}</p>`).join("");
  dTags.innerHTML = o.tags.map((t) => `<span>#${t}</span>`).join("");
  dStory.parentElement.scrollTop = 0;
}

function openObject(idx) {
  fillDetail(idx);
  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
  document.getElementById("d-close").focus();
}

function step(delta) {
  const next = (openIndex + delta + objects.length) % objects.length;
  fillDetail(next);
}

document.getElementById("d-close").addEventListener("click", () => dialog.close());
document.getElementById("d-prev").addEventListener("click", () => step(-1));
document.getElementById("d-next").addEventListener("click", () => step(1));
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
dialog.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
});

/* ---------- Submit form (client-side acknowledgement only) ---------- */
const form = document.getElementById("submit-form");
const note = document.getElementById("form-note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("obj-name").value.trim();
  if (!name) {
    note.textContent = "Please name the object first.";
    return;
  }
  note.textContent = `Thank you. “${name}” has been added to the acquisitions queue for review by our curators.`;
  form.reset();
});

/* ---------- Init ---------- */
renderRooms();
renderGrid();

/* Bridge pull-to-dismiss visual acknowledgement (optional, non-essential) */
document.addEventListener("sitegeist:pull-state", (e) => {
  document.body.style.filter = e.detail && e.detail.active ? "saturate(1.06)" : "";
});
