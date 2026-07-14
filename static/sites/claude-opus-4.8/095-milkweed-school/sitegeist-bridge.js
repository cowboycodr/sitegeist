(() => {
  "use strict";

  if (window.parent === window) return;

  const parameters = new URLSearchParams(window.location.search);
  const slug = parameters.get("sitegeistSlug");
  const channel = parameters.get("sitegeistChannel");
  if (!slug || !channel) return;

  const scrollTop = () => Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  const findTouch = (touches, identifier) => {
    for (let index = 0; index < touches.length; index += 1) {
      if (touches[index].identifier === identifier) return touches[index];
    }
    return null;
  };
  const send = (kind, detail = {}) => {
    window.parent.postMessage(
      { protocol: "sitegeist-embed", version: 1, slug, channel, kind, ...detail },
      "*",
    );
  };
  const point = (touch, event, detail = {}) => ({
    identifier: touch.identifier,
    screenX: Math.round(touch.screenX),
    screenY: Math.round(touch.screenY),
    timeStamp: Math.round(event.timeStamp),
    scrollTop: Math.round(scrollTop()),
    ...detail,
  });
  const announcePullState = (active) => {
    document.dispatchEvent(new CustomEvent("sitegeist:pull-state", { detail: { active } }));
  };

  let activeTouch = null;
  let awaitingSettle = false;
  let scrollFrame = 0;

  const cancelTouch = (event) => {
    if (!activeTouch) return;
    const wasClaimed = activeTouch.claimed;
    send("pull-cancel", {
      identifier: activeTouch.identifier,
      timeStamp: Math.round(event?.timeStamp ?? performance.now()),
      scrollTop: Math.round(scrollTop()),
    });
    activeTouch = null;
    awaitingSettle = wasClaimed;
    if (!wasClaimed) announcePullState(false);
  };

  window.addEventListener(
    "touchstart",
    (event) => {
      if (activeTouch) {
        if (event.touches.length !== 1) cancelTouch(event);
        return;
      }
      if (awaitingSettle || event.touches.length !== 1 || event.changedTouches.length !== 1) return;

      const touch = event.changedTouches[0];
      activeTouch = {
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        claimed: false,
      };
      send("pull-start", point(touch, event));
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!activeTouch) return;
      if (event.touches.length !== 1) {
        if (activeTouch.claimed) event.preventDefault();
        cancelTouch(event);
        return;
      }

      const touch = findTouch(event.touches, activeTouch.identifier);
      if (!touch) {
        cancelTouch(event);
        return;
      }

      if (!activeTouch.claimed) {
        const deltaX = touch.clientX - activeTouch.startX;
        const deltaY = touch.clientY - activeTouch.startY;
        const movement = Math.hypot(deltaX, deltaY);
        if (movement < 9) return;
        if (scrollTop() <= 1 && deltaY > 0 && deltaY > Math.abs(deltaX) * 1.15) {
          activeTouch.claimed = true;
          announcePullState(true);
        } else {
          cancelTouch(event);
          return;
        }
      }

      event.preventDefault();
      send("pull-move", point(touch, event, { claimed: true }));
    },
    { passive: false },
  );

  window.addEventListener(
    "touchend",
    (event) => {
      if (!activeTouch) return;
      const touch = findTouch(event.changedTouches, activeTouch.identifier);
      if (!touch) return;
      if (activeTouch.claimed) {
        send("pull-end", point(touch, event));
        awaitingSettle = true;
      } else {
        send("pull-cancel", {
          identifier: activeTouch.identifier,
          timeStamp: Math.round(event.timeStamp),
          scrollTop: Math.round(scrollTop()),
        });
        announcePullState(false);
      }
      activeTouch = null;
    },
    { passive: true },
  );

  window.addEventListener("touchcancel", cancelTouch, { passive: true });

  window.addEventListener(
    "scroll",
    (event) => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        send("scroll", {
          scrollTop: Math.round(scrollTop()),
          timeStamp: Math.round(event.timeStamp),
        });
        scrollFrame = 0;
      });
    },
    { passive: true },
  );

  window.addEventListener(
    "wheel",
    (event) => {
      send("wheel", {
        deltaY: Math.round(event.deltaY),
        scrollTop: Math.round(scrollTop()),
        timeStamp: Math.round(event.timeStamp),
      });
    },
    { passive: true },
  );

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    ) return;
    if (event.key === "Escape" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
      send("key", { key: event.key, timeStamp: Math.round(event.timeStamp) });
    }
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (
      event.source !== window.parent ||
      !message ||
      message.protocol !== "sitegeist-embed" ||
      message.version !== 1 ||
      message.slug !== slug ||
      message.channel !== channel ||
      message.kind !== "pull-settled"
    ) return;
    awaitingSettle = false;
    announcePullState(false);
  });

  send("ready", { scrollTop: Math.round(scrollTop()), timeStamp: Math.round(performance.now()) });
})();
