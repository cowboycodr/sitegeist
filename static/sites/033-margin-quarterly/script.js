const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
const progress = document.querySelector('.progress span');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
  document.body.style.overflow = '';
}

menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menu.hidden = !opening;
  document.body.style.overflow = opening ? 'hidden' : '';
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
}, { passive: true });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
