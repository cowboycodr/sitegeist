const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const dialog = document.querySelector('.order-dialog');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

document.querySelectorAll('.js-order').forEach((button) => button.addEventListener('click', () => {
  dialog.showModal();
}));

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
