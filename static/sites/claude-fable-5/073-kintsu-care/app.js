(() => {
  "use strict";

  const form = document.getElementById("checkin-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".step"));
  const dots = Array.from(form.querySelectorAll(".dot"));
  const stepLabel = document.getElementById("checkin-step-label");
  const nav = form.querySelector(".checkin-nav");
  const progress = form.querySelector(".checkin-progress");
  const backBtn = document.getElementById("back-btn");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const result = document.getElementById("checkin-result");
  const resultTitle = document.getElementById("result-title");
  const resultBody = document.getElementById("result-body");
  const resultTool = document.getElementById("result-tool");
  const intensity = document.getElementById("intensity");
  const intensityOut = document.getElementById("intensity-out");
  const note = document.getElementById("note");

  const intensityWords = {
    1: "1 — a whisper at the edge of the day",
    2: "2 — quiet, but you can hear it",
    3: "3 — present, but sharing the room",
    4: "4 — loud enough to lead",
    5: "5 — filling the whole room",
  };

  const responses = {
    heavy: {
      title: "Heavy is worth naming.",
      body: "Weight like this rarely lifts by force. You noticed it and set it down here for a moment — that counts as care, not weakness.",
      tool: "Try the evening unload tonight: three prompts to move the day's residue from your head to the page.",
    },
    frayed: {
      title: "Frayed edges can be tended.",
      body: "When everything pulls at once, the nervous system needs a signal that it can stand down. Ninety seconds of longer exhales is often enough to loosen the knot.",
      tool: "Open paced breathing — four counts in, six counts out — before the next thing on your list.",
    },
    tender: {
      title: "Tender is honest.",
      body: "Something in you is close to the surface today. That openness is uncomfortable, and it is also exactly the material good therapy works with.",
      tool: "Write one sentence in a thought record about what feels most tender, so it is ready for your next session.",
    },
    steady: {
      title: "Steady days are data too.",
      body: "Checking in when things are calm teaches you what steady actually feels like — so you can find your way back to it on harder days.",
      tool: "Note one thing that helped make today steady. Ordinary causes are the easiest to repeat.",
    },
    bright: {
      title: "Let brightness register.",
      body: "Good days deserve as much attention as hard ones. Pausing on them helps the memory hold, and gives future-you evidence that brightness returns.",
      tool: "Take thirty seconds with 5-4-3-2-1 grounding — not to calm down, but to soak this in through your senses.",
    },
  };

  let current = 0;

  const moodChosen = () => form.querySelector('input[name="mood"]:checked');

  function render() {
    steps.forEach((step, i) => {
      const active = i === current;
      step.hidden = !active;
      step.classList.toggle("is-current", active);
    });
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i <= current));
    stepLabel.textContent = `Step ${current + 1} of 3`;
    backBtn.hidden = current === 0;
    nextBtn.textContent = current === steps.length - 1 ? "Finish check-in" : "Continue";
    nextBtn.disabled = current === 0 && !moodChosen();
  }

  function finish() {
    const mood = moodChosen();
    const key = mood ? mood.value : "steady";
    const entry = responses[key];
    resultTitle.textContent = entry.title;
    const trimmed = note.value.trim();
    resultBody.textContent = trimmed
      ? `${entry.body} And what you set down here stays here — it is not stored or sent anywhere.`
      : entry.body;
    resultTool.textContent = entry.tool;

    steps.forEach((step) => { step.hidden = true; });
    nav.hidden = true;
    progress.hidden = true;
    result.hidden = false;
    result.focus();
  }

  nextBtn.addEventListener("click", () => {
    if (current === steps.length - 1) {
      finish();
      return;
    }
    current += 1;
    render();
    const focusable = steps[current].querySelector("input, textarea");
    if (focusable) focusable.focus();
  });

  backBtn.addEventListener("click", () => {
    if (current === 0) return;
    current -= 1;
    render();
  });

  restartBtn.addEventListener("click", () => {
    form.reset();
    current = 0;
    result.hidden = true;
    nav.hidden = false;
    progress.hidden = false;
    render();
  });

  form.addEventListener("submit", (event) => event.preventDefault());

  form.addEventListener("change", (event) => {
    if (event.target.name === "mood" && current === 0) {
      nextBtn.disabled = false;
    }
  });

  intensity.addEventListener("input", () => {
    intensityOut.textContent = intensityWords[intensity.value] || intensity.value;
  });

  render();
})();
