const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('#mobile-menu');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
}

menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menu.hidden = !willOpen;
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    menuButton.focus();
  }
});
