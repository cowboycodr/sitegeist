const menu = document.querySelector('.menu');
const mobileNav = document.querySelector('.mobile-nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
}));

const player = document.querySelector('[data-player]');
const play = player.querySelector('.play');
const progress = player.querySelector('.scrubber span');
const elapsed = player.querySelector('.elapsed');
let playing = false;
let seconds = 0;
let timer;

function renderTime() {
  elapsed.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  progress.style.width = `${seconds / 222 * 100}%`;
}
function setPlaying(next) {
  playing = next;
  player.classList.toggle('playing', playing);
  play.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} Colour of the Static`);
  clearInterval(timer);
  if (playing) timer = setInterval(() => { seconds = (seconds + 1) % 223; renderTime(); }, 1000);
}
play.addEventListener('click', () => setPlaying(!playing));
player.querySelectorAll('.skip-track').forEach(button => button.addEventListener('click', () => {
  seconds = button.getAttribute('aria-label').startsWith('Next') ? Math.min(222, seconds + 30) : Math.max(0, seconds - 30);
  renderTime();
}));
