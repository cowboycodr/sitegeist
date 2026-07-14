(() => {
  "use strict";

  /* ---- mobile nav toggle ---- */
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (toggle && list) {
    const setOpen = (open) => {
      list.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    list.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-nav")) setOpen(false);
    });
  }

  /* ---- shared vessel silhouettes ---- */
  const shapes = {
    mug: '<path d="M60 40h60v70a30 30 0 0 1-30 30H90a30 30 0 0 1-30-30z" fill="{c}"/><path d="M120 55h14a20 20 0 0 1 0 40h-14" fill="none" stroke="{c}" stroke-width="10"/>',
    bowl: '<path d="M40 70h120c-4 44-30 66-60 66S44 114 40 70z" fill="{c}"/><ellipse cx="100" cy="70" rx="60" ry="12" fill="{d}"/>',
    vase: '<path d="M78 40h44l-8 30c14 10 20 26 20 44 0 32-16 52-38 52s-38-20-38-52c0-18 6-34 20-44z" fill="{c}"/>',
    plate: '<ellipse cx="100" cy="92" rx="70" ry="30" fill="{c}"/><ellipse cx="100" cy="86" rx="46" ry="18" fill="{d}"/>',
    jug: '<path d="M64 48h56v10l14 8-14 6v58a26 26 0 0 1-26 26H90a26 26 0 0 1-26-26z" fill="{c}"/>',
  };
  const svg = (shape, c, d) =>
    '<svg viewBox="0 0 200 150" role="img" aria-hidden="true">' +
    shapes[shape].replaceAll("{c}", c).replaceAll("{d}", d) +
    "</svg>";

  /* ---- available work ---- */
  const pieces = [
    { name: "Morning Mug", shape: "mug", c: "#a76a4a", d: "#7c4a32", desc: "Wide handle, thumb-rest pressed for a right hand. Holds a proper measure.", price: "£32", state: "available" },
    { name: "Hollow Bowl No.7", shape: "bowl", c: "#6f7f63", d: "#586a4e", desc: "Cereal-deep with a poured green that pools at the base.", price: "£46", state: "last" },
    { name: "North Vale Vase", shape: "vase", c: "#c68a63", d: "#a76a4a", desc: "Tall neck for a single stem or a handful of dry grasses.", price: "£78", state: "available" },
    { name: "Supper Plate", shape: "plate", c: "#b98b64", d: "#d8c3a3", desc: "A dinner plate with an uneven rim you'll come to trust.", price: "£40", state: "available" },
    { name: "Creek Jug", shape: "jug", c: "#7c4a32", d: "#5a3626", desc: "A one-pint pourer with a sharp lip that never drips.", price: "£58", state: "reserved" },
    { name: "Ash Tea Bowl", shape: "bowl", c: "#8a7d64", d: "#6b5f49", desc: "Handleless, held in two palms. Warms slowly, cools slower.", price: "£36", state: "last" },
  ];
  const tags = {
    available: ["tag-available", "Available"],
    last: ["tag-last", "Last one"],
    reserved: ["tag-reserved", "Reserved"],
  };
  const grid = document.getElementById("work-grid");
  if (grid) {
    const frag = document.createDocumentFragment();
    pieces.forEach((p) => {
      const li = document.createElement("li");
      li.className = "work-card";
      const [tclass, tlabel] = tags[p.state];
      li.innerHTML =
        '<div class="work-figure">' + svg(p.shape, p.c, p.d) + "</div>" +
        '<h3 class="work-name">' + p.name + "</h3>" +
        '<p class="work-desc">' + p.desc + "</p>" +
        '<div class="work-meta"><span class="work-price">' + p.price +
        '</span><span class="tag ' + tclass + '">' + tlabel + "</span></div>";
      frag.appendChild(li);
    });
    grid.appendChild(frag);
  }

  /* ---- glaze swatches ---- */
  const glazes = [
    { name: "Riverbed Ash", color: "#d8c3a3", read: "<strong>Riverbed Ash</strong> — pale oatmeal broken by iron speckle, mixed from wood ash and creek silt." },
    { name: "North Wall Lichen", color: "#6f7f63", read: "<strong>North Wall Lichen</strong> — the grey-green of lichen on shaded stone, from copper and a pinch of ash." },
    { name: "Dry Riverbed", color: "#b98b64", read: "<strong>Dry Riverbed</strong> — warm clay-brown that cracks like a summer bed, high in local iron oxide." },
    { name: "Rain on Hill", color: "#4c4433", read: "<strong>Rain on Hill</strong> — a deep saturated brown-black, the colour of soil after a downpour." },
    { name: "Terracotta Dusk", color: "#c68a63", read: "<strong>Terracotta Dusk</strong> — a soft orange fired thin so the clay body glows through." },
  ];
  const holder = document.getElementById("swatches");
  const read = document.getElementById("swatch-read");
  if (holder && read) {
    glazes.forEach((g, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "swatch";
      b.style.background = g.color;
      b.setAttribute("role", "listitem");
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.setAttribute("aria-label", g.name + " glaze");
      b.innerHTML = "<span>" + g.name.split(" ")[0] + "</span>";
      b.addEventListener("click", () => {
        holder.querySelectorAll(".swatch").forEach((s) => s.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        read.innerHTML = g.read;
      });
      holder.appendChild(b);
    });
  }
})();
