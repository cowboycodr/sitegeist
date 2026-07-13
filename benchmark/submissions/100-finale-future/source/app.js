const menu = document.querySelector('.menu');
const panel = document.querySelector('#navpanel');

function closeMenu() {
  panel.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.querySelector('b').textContent = 'Menu';
}

menu.addEventListener('click', () => {
  const open = !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('b').textContent = open ? 'Close' : 'Menu';
});

panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    menu.focus();
  }
});

const filters = document.querySelectorAll('.filter');
const events = document.querySelectorAll('.event');
filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const selected = button.dataset.filter;
  events.forEach((item) => item.classList.toggle('hidden', selected !== 'all' && item.dataset.kind !== selected));
}));
