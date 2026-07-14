(() => {
  "use strict";

  const beats = {
    setup: {
      kicker: "Beat 01 · Setup",
      title: "The shared ambition",
      body: "Everyone wants the waterfront open by summer. The brief is clear; the path is not. Narra starts by pinning what is agreed before conflict enters.",
      sources: "Project charter · Resident survey Q3",
      questions: "What does open actually mean for night access?",
      noteBeat: "Shared ambition",
      noteBody: "Charter language is aspirational. Survey respondents care more about hours and lighting than ribbon-cutting dates.",
    },
    tension: {
      kicker: "Beat 02 · Tension",
      title: "The process risk",
      body: "Stakeholders agree on the destination but stall on procedure. The story turns when delay is framed as design, not accident.",
      sources: "Harbor minutes · Site walk",
      questions: "Who owns the next vote?",
      noteBeat: "The process risk",
      noteBody: "Minutes show three deferred votes on the same clause. Delay is structural, not accidental—schedule pressure alone does not explain the pattern.",
    },
    evidence: {
      kicker: "Beat 03 · Evidence",
      title: "What the record actually shows",
      body: "Quotes, timestamps, and conflicting testimony cluster here. Weak links stay visible so the narrative does not paper over gaps.",
      sources: "Harbor minutes · Site walk audio",
      questions: "Which testimony is first-hand?",
      noteBeat: "Record vs. memory",
      noteBody: "Audio places two speakers at the quay on different nights. The minutes collapse both into a single session—a provenance risk.",
    },
    turn: {
      kicker: "Beat 04 · Turn",
      title: "Procedure is the product",
      body: "The insight: the bottleneck is not funding, it is sequential approvals that never run in parallel. The map reframes the antagonist as process design.",
      sources: "Policy brief · Harbor minutes",
      questions: "Can two votes run concurrently?",
      noteBeat: "Procedure is the product",
      noteBody: "Comparative cases show concurrent review cut six weeks without reducing oversight. Local rules do not forbid it—habit does.",
    },
    claim: {
      kicker: "Beat 05 · Claim",
      title: "A defendable recommendation",
      body: "Parallelize the remaining votes, publish a single decision calendar, and attach residual risks to named owners. Every claim still links to evidence.",
      sources: "All linked sources",
      questions: "What is the residual risk register?",
      noteBeat: "Defendable recommendation",
      noteBody: "Draft claim holds if we keep the confidence mark on concurrent review as provisional pending counsel review.",
    },
  };

  const sourceNotes = {
    s1: {
      noteBeat: "Harbor Commission minutes",
      noteBody: "Three deferred votes on clause 4b. Attendance drops after the second deferral—process fatigue is in the record.",
    },
    s2: {
      noteBeat: "Resident survey Q3",
      noteBody: "Lighting and evening hours outrank ceremonial opening dates by nearly two to one among respondents near the quay.",
    },
    s3: {
      noteBeat: "Site walk audio",
      noteBody: "Field notes capture informal agreements that never entered the minutes—useful tension for the evidence beat.",
    },
  };

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const mapNodes = Array.from(document.querySelectorAll("[data-map-node]"));
  const detail = document.querySelector("[data-map-detail]");
  const detailKicker = detail?.querySelector(".map-kicker");
  const detailTitle = detail?.querySelector("[data-detail-title]");
  const detailBody = detail?.querySelector("[data-detail-body]");
  const detailSources = detail?.querySelector("[data-detail-sources]");
  const detailQuestions = detail?.querySelector("[data-detail-questions]");
  const beatButtons = Array.from(document.querySelectorAll("[data-beat]"));
  const sourceRows = Array.from(document.querySelectorAll("[data-source]"));
  const noteBeat = document.querySelector("[data-note-beat]");
  const noteBody = document.querySelector("[data-note-body]");
  const form = document.querySelector("[data-cta-form]");
  const formStatus = document.querySelector("[data-form-status]");

  function setActiveBeat(id) {
    const data = beats[id];
    if (!data) return;

    mapNodes.forEach((node) => {
      const active = node.getAttribute("data-map-node") === id;
      node.setAttribute("aria-pressed", active ? "true" : "false");
    });

    beatButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-beat") === id);
    });

    if (detailKicker) detailKicker.textContent = data.kicker;
    if (detailTitle) detailTitle.textContent = data.title;
    if (detailBody) detailBody.textContent = data.body;
    if (detailSources) detailSources.textContent = data.sources;
    if (detailQuestions) detailQuestions.textContent = data.questions;
    if (noteBeat) noteBeat.textContent = data.noteBeat;
    if (noteBody) noteBody.textContent = data.noteBody;
  }

  mapNodes.forEach((node) => {
    const id = node.getAttribute("data-map-node");
    const activate = () => setActiveBeat(id);
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  beatButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveBeat(btn.getAttribute("data-beat"));
    });
  });

  sourceRows.forEach((row) => {
    row.addEventListener("click", () => {
      sourceRows.forEach((r) => r.classList.remove("is-active"));
      row.classList.add("is-active");
      const data = sourceNotes[row.getAttribute("data-source")];
      if (!data) return;
      if (noteBeat) noteBeat.textContent = data.noteBeat;
      if (noteBody) noteBody.textContent = data.noteBody;
    });
  });

  function closeMobileNav() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", open ? "false" : "true");
      mobileNav.hidden = open;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (form && formStatus) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = form.querySelector("[data-email]");
      const email = emailInput?.value?.trim() || "";
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      formStatus.classList.remove("is-success", "is-error");

      if (!valid) {
        formStatus.textContent = "Enter a valid work email to open a local demo workspace.";
        formStatus.classList.add("is-error");
        emailInput?.focus();
        return;
      }

      const focus = form.querySelector("[data-focus]")?.value || "investigation";
      formStatus.textContent = `Workspace reserved for ${email}. Focus: ${focus.replace(/-/g, " ")}. Nothing was sent—this demo stays on your device.`;
      formStatus.classList.add("is-success");
      form.reset();
    });
  }

  setActiveBeat("tension");
})();
