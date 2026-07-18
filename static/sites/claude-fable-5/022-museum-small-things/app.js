/* Museum of Small Things — catalogue and interactions */
(() => {
  "use strict";

  const icon = (body) =>
    `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

  const CATALOGUE = [
    {
      accession: "MST 2026.014",
      name: "Brass coat button",
      donor: "Donated by E. Halvorsen, Bergen",
      teaser: "Two winters at sea, and one that never ended.",
      story:
        "It came off my grandfather's navy coat the week he retired. He carried it in his pocket for forty years afterwards, “in case the coat wanted it back.” The coat is long gone. The button never got the news, and neither, I think, did he.",
      art: icon(
        '<circle cx="32" cy="32" r="17"/><circle cx="26" cy="28" r="1.6" fill="currentColor" stroke="none"/><circle cx="38" cy="28" r="1.6" fill="currentColor" stroke="none"/><circle cx="26" cy="38" r="1.6" fill="currentColor" stroke="none"/><circle cx="38" cy="38" r="1.6" fill="currentColor" stroke="none"/><circle cx="32" cy="32" r="11" stroke-dasharray="2.5 4"/>'
      ),
    },
    {
      accession: "MST 2026.021",
      name: "Bus transfer, 1998",
      donor: "Anonymous donor, Toronto",
      teaser: "Valid for one journey. It lasted twenty-six years.",
      story:
        "First date. She missed her stop on purpose and I pretended not to notice for eleven blocks. The transfer expired at 11:40 p.m.; we were married four years later. I keep it in my wallet, folded once, exactly where a ticket inspector would look.",
      art: icon(
        '<rect x="14" y="18" width="36" height="28" rx="2"/><line x1="14" y1="26" x2="50" y2="26"/><line x1="20" y1="33" x2="38" y2="33"/><line x1="20" y1="39" x2="32" y2="39"/><circle cx="43" cy="37" r="4" stroke-dasharray="2 2.5"/>'
      ),
    },
    {
      accession: "MST 2026.008",
      name: "Mended teacup",
      donor: "Donated by R. Okafor, Lagos",
      teaser: "Glued back together after an argument that never was.",
      story:
        "My mother threw it, missed, and we both laughed before we remembered we were fighting. Neither of us could finish the argument after that. I glued the handle back on that night. The crack still shows. We agreed it should.",
      art: icon(
        '<path d="M18 22h24v14a12 12 0 0 1-24 0z"/><path d="M42 25h5a5 5 0 0 1 0 10h-5"/><path d="M26 22l4 9-3 8" stroke-width="1.8"/><line x1="15" y1="52" x2="45" y2="52"/>'
      ),
    },
    {
      accession: "MST 2025.190",
      name: "One glass marble",
      donor: "Donated by T. Prasad, Pune",
      teaser: "Traded for a whole sandwich in 1989. Still a bargain.",
      story:
        "Ajay said it had a galaxy inside and charged me my entire lunch. He moved away that summer and I never learned his address. I have owned houses since. This is the only purchase I have never once regretted.",
      art: icon(
        '<circle cx="32" cy="32" r="16"/><path d="M24 26c4-5 12-5 16 0" stroke-width="1.8"/><path d="M26 36c3 4 9 4 12 0" stroke-width="1.8"/><circle cx="27" cy="27" r="2" fill="currentColor" stroke="none"/>'
      ),
    },
    {
      accession: "MST 2025.233",
      name: "Hotel key fob, room 214",
      donor: "Donated by M. & J. Laurent, Lyon",
      teaser: "We checked out. It didn’t.",
      story:
        "Our honeymoon hotel closed in 2011 and mailed nothing to anyone. But we had forgotten to return the key, so in a way we are still checked in. On hard anniversaries we put it on the table between us, like a room we can go back to.",
      art: icon(
        '<circle cx="24" cy="26" r="9"/><circle cx="24" cy="26" r="3.5"/><path d="M31 33l14 14"/><path d="M40 42l4-4M45 47l4-4" stroke-width="2.2"/>'
      ),
    },
    {
      accession: "MST 2026.002",
      name: "Pressed daisy",
      donor: "Donated by S. Whitfield, Cardiff",
      teaser: "Picked from a churchyard, kept in a dictionary.",
      story:
        "I took it from the grass outside my grandmother's funeral because I needed my hands to do something. It lives between “grief” and “grocer” in her dictionary, which feels about right. Some days I open the book just to check on it.",
      art: icon(
        '<circle cx="32" cy="24" r="4.5"/><path d="M32 12v7M32 29v7M20 24h7M37 24h7M23.5 15.5l5 5M35.5 27.5l5 5M40.5 15.5l-5 5M28.5 27.5l-5 5" stroke-width="2.2"/><path d="M32 36v14"/><path d="M32 44c-4 0-6-3-6-3" stroke-width="2"/>'
      ),
    },
    {
      accession: "MST 2025.312",
      name: "Mixtape: “DRIVE SAFE”",
      donor: "Donated by K. Reyes, Albuquerque",
      teaser: "Ninety minutes of my brother, in order.",
      story:
        "He made it the week I left for college and labelled it in capital letters like an order. Track six cuts off where the radio DJ talked over the ending, and you can hear him groan. I no longer own anything that can play it. It is the loudest thing in my house.",
      art: icon(
        '<rect x="13" y="20" width="38" height="24" rx="2"/><circle cx="24" cy="32" r="4"/><circle cx="40" cy="32" r="4"/><line x1="28" y1="32" x2="36" y2="32" stroke-width="1.8"/><line x1="18" y1="24" x2="46" y2="24" stroke-width="1.6"/>'
      ),
    },
    {
      accession: "MST 2026.030",
      name: "Key to a demolished flat",
      donor: "Anonymous donor, Manchester",
      teaser: "It opens a door that is now sky.",
      story:
        "The building came down in 2019 and is a car park now. I stood at the fence on the last day like a mourner. The key opens nothing, which is not the same as opening nothing important: it opens the kitchen where my daughter took her first steps, third floor, no lift.",
      art: icon(
        '<circle cx="22" cy="24" r="8"/><circle cx="22" cy="24" r="3"/><path d="M28 30l16 16"/><path d="M38 40v6h-5" stroke-width="2.2"/>'
      ),
    },
    {
      accession: "MST 2025.277",
      name: "Spool of scarlet thread",
      donor: "Donated by A. Ben Youssef, Tunis",
      teaser: "Everything she mended is still holding.",
      story:
        "From my grandmother's sewing box. She used it only for things she loved: the hem of a wedding dress, a bear's ear, my school coat. There is exactly enough left for one more repair. I am saving it, the way you save the last of a language.",
      art: icon(
        '<path d="M22 16h20l-4 5v22l4 5H22l4-5V21z"/><line x1="26" y1="26" x2="38" y2="26" stroke-width="1.8"/><line x1="26" y1="31" x2="38" y2="31" stroke-width="1.8"/><line x1="26" y1="36" x2="38" y2="36" stroke-width="1.8"/><path d="M38 48c6 0 10-4 12-8" stroke-width="1.8" stroke-dasharray="3 3"/>'
      ),
    },
    {
      accession: "MST 2026.041",
      name: "Grey pebble, Whitby",
      donor: "Donated by P. Adeyemi, Leeds",
      teaser: "The beach kept him. I kept the beach.",
      story:
        "We scattered my father where the sea takes the cliff, a little more each year. I picked up the nearest stone because you cannot leave a place like that with empty hands. It is the most ordinary object in this museum. It is the heaviest thing I own.",
      art: icon(
        '<ellipse cx="32" cy="36" rx="15" ry="10"/><path d="M14 50h36" stroke-width="2.2"/><path d="M18 20c3 2 6 2 9 0s6-2 9 0 6 2 9 0" stroke-width="1.8"/>'
      ),
    },
    {
      accession: "MST 2025.145",
      name: "Cinema stub, seat J12",
      donor: "Donated by L. Nowak, Kraków",
      teaser: "The film was terrible. The company was not.",
      story:
        "Last outing with my best friend before her diagnosis. We laughed so hard at the wrong moments that a stranger shushed us, which made it worse. She kept her stub too. When she died, her sister mailed it to me, and now J11 and J12 sit together in my desk drawer.",
      art: icon(
        '<path d="M14 24h36v6a4 4 0 0 0 0 8v6H14v-6a4 4 0 0 0 0-8z"/><line x1="26" y1="24" x2="26" y2="44" stroke-dasharray="2.5 3" stroke-width="1.8"/><line x1="32" y1="30" x2="44" y2="30" stroke-width="1.8"/><line x1="32" y1="36" x2="41" y2="36" stroke-width="1.8"/>'
      ),
    },
    {
      accession: "MST 2026.055",
      name: "Baby tooth in a matchbox",
      donor: "Donated by H. Tanaka, Osaka",
      teaser: "The smallest thing a person can outgrow.",
      story:
        "My son is thirty-one and taller than the doorframe he once bit while learning to walk. The tooth fairy paid out decades ago; the matchbox stayed on my shelf. Sometimes the museum of a whole childhood is four millimetres of enamel and a rattle when you shake it.",
      art: icon(
        '<rect x="16" y="26" width="32" height="18" rx="2"/><rect x="20" y="22" width="24" height="8" rx="1.5"/><path d="M29 33c0-2.5 1.4-4 3-4s3 1.5 3 4c0 3-1 6-2 6-.6 0-.7-1.6-1-1.6s-.4 1.6-1 1.6c-1 0-2-3-2-6z" stroke-width="2"/>'
      ),
    },
  ];

  /* ---------- Render collection ---------- */

  const grid = document.getElementById("object-grid");
  const record = document.getElementById("record");
  let openIndex = -1;
  let lastTrigger = null;

  CATALOGUE.forEach((object, index) => {
    const item = document.createElement("li");
    const card = document.createElement("button");
    card.type = "button";
    card.className = "object-card";
    card.setAttribute("aria-haspopup", "dialog");

    const figure = document.createElement("div");
    figure.className = "object-figure";
    figure.setAttribute("aria-hidden", "true");
    figure.innerHTML = object.art;

    const accession = document.createElement("p");
    accession.className = "object-accession";
    accession.textContent = object.accession;

    const name = document.createElement("h3");
    name.className = "object-name";
    name.textContent = object.name;

    const teaser = document.createElement("p");
    teaser.className = "object-teaser";
    teaser.textContent = object.teaser;

    const cta = document.createElement("span");
    cta.className = "object-cta";
    cta.textContent = "Read the record →";

    card.append(figure, accession, name, teaser, cta);
    card.addEventListener("click", () => openRecord(index, card));
    item.appendChild(card);
    grid.appendChild(item);
  });

  /* ---------- Object record dialog ---------- */

  const fill = (index) => {
    const object = CATALOGUE[index];
    document.getElementById("record-accession").textContent = object.accession;
    document.getElementById("record-figure").innerHTML = object.art;
    document.getElementById("record-title").textContent = object.name;
    document.getElementById("record-donor").textContent = object.donor;
    document.getElementById("record-story").textContent = object.story;
    openIndex = index;
  };

  const openRecord = (index, trigger) => {
    lastTrigger = trigger || null;
    fill(index);
    if (typeof record.showModal === "function") record.showModal();
    else record.setAttribute("open", "");
  };

  const closeRecord = () => {
    if (record.open) record.close();
  };

  const step = (delta) => {
    fill((openIndex + delta + CATALOGUE.length) % CATALOGUE.length);
  };

  document.getElementById("record-close").addEventListener("click", closeRecord);
  document.getElementById("record-prev").addEventListener("click", () => step(-1));
  document.getElementById("record-next").addEventListener("click", () => step(1));

  record.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  });

  // Click on the backdrop (outside the card) closes the record.
  record.addEventListener("click", (event) => {
    if (event.target === record) closeRecord();
  });

  record.addEventListener("close", () => {
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
  });

  /* ---------- Submission form (local only) ---------- */

  const form = document.getElementById("submit-form");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const object = form.elements.object.value.trim();
    const story = form.elements.story.value.trim();

    if (!name || !object || !story) {
      status.textContent = "Please add your name, the object, and its story — every record needs all three.";
      return;
    }

    status.textContent = `Thank you, ${name}. “${object}” has been drafted for the registrars’ desk. Nothing leaves your browser — but the story is written now, and that is how every acquisition begins.`;
    form.reset();
  });
})();
