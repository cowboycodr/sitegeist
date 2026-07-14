(() => {
  "use strict";

  const pieces = Array.from(document.querySelectorAll(".piece"));

  const setOpen = (button, open) => {
    const note = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open));
    if (note) note.hidden = !open;
  };

  pieces.forEach((button) => {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      pieces.forEach((other) => {
        if (other !== button) setOpen(other, false);
      });
      setOpen(button, !isOpen);
    });
  });

  // The bridge announces a pull-to-dismiss gesture; collapse open notes so the
  // viewer sees the collection in its resting state during the transition.
  document.addEventListener("sitegeist:pull-state", (event) => {
    if (event.detail && event.detail.active) {
      pieces.forEach((button) => setOpen(button, false));
    }
  });
})();
