(() => {
  "use strict";

  // --- Pantry crate ---------------------------------------------------------
  const crate = [];
  const crateNote = document.getElementById("crate-note");

  const describeCrate = () => {
    if (crate.length === 0) {
      return "Your crate is empty — for now.";
    }
    const counts = new Map();
    crate.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1));
    const items = [...counts.entries()].map(([name, n]) => (n > 1 ? `${name} ×${n}` : name));
    const list =
      items.length === 1
        ? items[0]
        : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
    return `In your crate: ${list}. It'll keep — good things take time.`;
  };

  document.querySelectorAll(".crate-btn").forEach((button) => {
    button.addEventListener("click", () => {
      crate.push(button.dataset.name);
      if (crateNote) crateNote.textContent = describeCrate();
      button.classList.add("added");
      button.textContent = "In the crate ✓";
      window.setTimeout(() => {
        button.classList.remove("added");
        button.textContent = "Add to crate";
      }, 1800);
    });
  });

  // --- Workshop booking -----------------------------------------------------
  const bookingNote = document.getElementById("booking-note");

  document.querySelectorAll(".book-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!bookingNote) return;
      bookingNote.hidden = false;
      bookingNote.textContent =
        `You're pencilled in for “${button.dataset.title}” on ${button.dataset.date}. ` +
        "We'll hold your crock — swing by the studio to confirm and pay.";
      bookingNote.scrollIntoView({ block: "nearest" });
    });
  });
})();
