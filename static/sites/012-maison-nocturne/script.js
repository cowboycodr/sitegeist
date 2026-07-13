const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});

menu?.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    toggle?.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('open');
    toggle?.focus();
  }
});
