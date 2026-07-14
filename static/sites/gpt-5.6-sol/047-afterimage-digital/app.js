(() => {
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.work-canvas');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero && !reduced) {
    hero.addEventListener('pointermove', (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * 18;
      hero.querySelectorAll('.orb').forEach((orb, index) => {
        const depth = (index + 1) * 0.55;
        orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });
  }

  if (art) {
    let x = 50;
    let y = 50;
    const paint = () => {
      art.style.setProperty('--mx', `${x}%`);
      art.style.setProperty('--my', `${y}%`);
    };
    art.addEventListener('pointermove', (event) => {
      const bounds = art.getBoundingClientRect();
      x = ((event.clientX - bounds.left) / bounds.width) * 100;
      y = ((event.clientY - bounds.top) / bounds.height) * 100;
      paint();
    });
    art.addEventListener('keydown', (event) => {
      const moves = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] };
      if (!moves[event.key]) return;
      event.preventDefault();
      x = Math.max(4, Math.min(96, x + moves[event.key][0]));
      y = Math.max(4, Math.min(96, y + moves[event.key][1]));
      paint();
    });
  }
})();
