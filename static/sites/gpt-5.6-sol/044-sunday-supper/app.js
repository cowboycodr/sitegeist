const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.querySelector('.sr-only').textContent = open ? 'Open menu' : 'Close menu';
  nav.classList.toggle('open', !open);
});

nav.querySelectorAll('a, button').forEach((item) => item.addEventListener('click', () => {
  navToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

const dialog = document.querySelector('#reserve-dialog');
document.querySelectorAll('.js-reserve').forEach((button) => {
  button.addEventListener('click', () => dialog.showModal());
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector('#year').textContent = new Date().getFullYear();
