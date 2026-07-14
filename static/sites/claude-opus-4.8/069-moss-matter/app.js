(() => {
  "use strict";

  // Mobile navigation toggle
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");

  if (toggle && list) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      list.classList.toggle("open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a destination
    list.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Close on Escape and when leaving the small-screen layout
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    const mq = window.matchMedia("(min-width: 761px)");
    const sync = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
  }

  // Reflect the viewer bridge's pull-to-dismiss state as a subtle header cue
  document.addEventListener("sitegeist:pull-state", (event) => {
    const active = !!(event.detail && event.detail.active);
    document.body.classList.toggle("is-pulling", active);
  });
})();
