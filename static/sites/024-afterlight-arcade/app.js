(() => {
  const modal = document.querySelector('.game-modal');
  const game = document.querySelector('.mini-game');
  const ship = document.querySelector('.mini-ship');
  let position = 50;

  document.querySelector('[data-open-game]').addEventListener('click', () => {
    modal.showModal();
    game.focus();
  });
  document.querySelector('.modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });

  function move(amount) {
    position = Math.max(12, Math.min(88, position + amount));
    ship.style.left = position + '%';
  }
  game.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-8); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(8); }
  });
  game.addEventListener('pointerdown', (event) => {
    const box = game.getBoundingClientRect();
    position = Math.max(12, Math.min(88, ((event.clientX - box.left) / box.width) * 100));
    ship.style.left = position + '%';
  });

  const join = document.querySelector('[data-join]');
  join.addEventListener('click', () => {
    const active = join.classList.toggle('joined');
    join.firstChild.textContent = active ? 'Challenge joined ' : 'Enter challenge ';
    join.setAttribute('aria-pressed', String(active));
  });

  const sound = document.querySelector('.sound-toggle');
  sound.addEventListener('click', () => {
    const on = sound.getAttribute('aria-pressed') !== 'true';
    sound.setAttribute('aria-pressed', String(on));
    sound.innerHTML = `<span aria-hidden="true">${on ? '◗' : '◖'}</span> FX ${on ? 'on' : 'off'}`;
  });
})();
