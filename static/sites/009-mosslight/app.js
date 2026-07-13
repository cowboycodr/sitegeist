const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const planner = document.querySelector('.planner');
document.querySelectorAll('[data-open-planner]').forEach(button => button.addEventListener('click', () => planner.showModal()));
planner.addEventListener('click', event => {
  if (event.target === planner) planner.close();
});
document.querySelector('.reveal').addEventListener('click', () => {
  document.querySelector('.planner-result').hidden = false;
});
