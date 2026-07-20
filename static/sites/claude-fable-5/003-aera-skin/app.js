(() => {
  "use strict";

  /* ---------- Add-to-bag note ---------- */
  const bagNote = document.getElementById("bag-note");
  let bagCount = 0;
  let noteTimer = 0;

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      bagCount += 1;
      const name = button.dataset.product;
      bagNote.textContent = `${name} added — ${bagCount} item${bagCount === 1 ? "" : "s"} in your bag.`;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => {
        bagNote.textContent = `${bagCount} item${bagCount === 1 ? "" : "s"} waiting in your bag.`;
      }, 4000);
    });
  });

  /* ---------- Skin quiz ---------- */
  const form = document.getElementById("quiz-form");
  const result = document.getElementById("quiz-result");
  const resultBody = document.getElementById("quiz-result-body");

  const openings = {
    tight: "Your skin is telling you it is short on lipids. Start every ritual with Still Cleanser and be generous with Quiet Cream at night.",
    comfortable: "Your barrier is in good standing — the goal now is to keep it that way. The full four-step ritual, once daily, is plenty.",
    shiny: "Oil is not the enemy; dehydration under it usually is. Cleanse once in the evening only, and let Veil Serum do the balancing.",
  };
  const middles = {
    sting: "Because new products tend to flush your skin, introduce one formula per week — Aera is fragrance-free precisely for mornings like yours.",
    fine: "Since your skin accepts most formulas gracefully, you can begin the whole ritual at once.",
    congest: "Prone to congestion? Keep textures thin: Veil Serum in the morning, Quiet Cream only where you feel tightness.",
  };
  const closings = {
    calm: "For redness, lean on the niacinamide and ceramides in Veil Serum, and never skip Soft Light SPF 40 — sun is the loudest trigger of all.",
    dewy: "For dew, layer Veil Serum on damp skin and press Quiet Cream over it while it is still tacky.",
    even: "For evenness, consistency beats intensity: the serum every day, sunscreen every daylight hour, and eight quiet weeks.",
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const q1 = data.get("q1");
    const q2 = data.get("q2");
    const q3 = data.get("q3");
    if (!q1 || !q2 || !q3) return;
    resultBody.textContent = `${openings[q1]} ${middles[q2]} ${closings[q3]}`;
    result.hidden = false;
    result.focus();
  });
})();
