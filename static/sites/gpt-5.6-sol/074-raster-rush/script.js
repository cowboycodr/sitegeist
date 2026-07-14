const screen = document.querySelector('.screen');
const ship = document.querySelector('#ship');
const score = document.querySelector('#score');
let x = 46, y = 17, points = 840;
let soundEnabled = false;
let audioContext;

function beep(frequency, duration = 0.06) {
  if (!soundEnabled) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.035, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function move(direction) {
  screen.classList.add('active');
  if (direction === 'left') x = Math.max(8, x - 7);
  if (direction === 'right') x = Math.min(84, x + 7);
  if (direction === 'up') y = Math.min(55, y + 6);
  if (direction === 'down') y = Math.max(7, y - 6);
  points += 10;
  ship.style.left = `${x}%`;
  ship.style.bottom = `${y}%`;
  score.textContent = String(points).padStart(5, '0');
  beep(direction === 'up' ? 520 : direction === 'down' ? 260 : 390);
}

document.querySelectorAll('[data-move]').forEach((button) => {
  button.addEventListener('click', () => move(button.dataset.move));
});

screen.addEventListener('keydown', (event) => {
  const directions = {ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down'};
  if (directions[event.key]) {
    event.preventDefault();
    move(directions[event.key]);
  }
});

document.querySelector('.arcade-button').addEventListener('click', () => {
  screen.classList.add('active');
  points += 100;
  score.textContent = String(points).padStart(5, '0');
  beep(720, 0.12);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ship.animate([{transform:'scale(1)'},{transform:'scale(1.45)'},{transform:'scale(1)'}], {duration:240});
  }
});

document.querySelector('.sound-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  soundEnabled = enabled;
  button.setAttribute('aria-pressed', String(enabled));
  button.innerHTML = `<span aria-hidden="true">♪</span> Sound: ${enabled ? 'on' : 'off'}`;
});

document.querySelector('.copy-email').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(button.dataset.email);
    button.firstChild.textContent = 'Copied to clipboard ';
  } catch {
    button.firstChild.textContent = 'Email: hello@rasterrush.games ';
  }
});
