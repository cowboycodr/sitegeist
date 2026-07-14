(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var navLinks = nav ? nav.querySelectorAll("a") : [];

  function setNavOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 721px)").matches) {
        setNavOpen(false);
      }
    });
  }

  // Highlight current section in nav when scrolling (keyboard / mouse friendly)
  var sections = ["collection", "materials", "process", "atelier"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var activeId = null;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        });
        navLinks.forEach(function (link) {
          var href = link.getAttribute("href") || "";
          var match = href === "#" + activeId;
          if (match) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0.01 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();
