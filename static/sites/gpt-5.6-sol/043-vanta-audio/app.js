const signal = document.querySelector('.signal');
const wave = document.querySelector('.wave-card');
signal.addEventListener('click', () => {
  const active = signal.getAttribute('aria-pressed') === 'true';
  signal.setAttribute('aria-pressed', String(!active));
  wave.classList.toggle('playing', !active);
  signal.querySelector('.signal-icon').textContent = active ? '▶' : 'Ⅱ';
  signal.querySelector('b').textContent = active ? 'Reveal the signal' : 'Signal revealed';
});

const inquiry = document.querySelector('.inquiry');
const availability = document.querySelector('.availability');
inquiry.addEventListener('click', () => {
  availability.textContent = 'Audition request noted — a Vanta listening room will welcome you.';
  availability.classList.add('show');
  inquiry.textContent = 'Request received  ✓';
});
