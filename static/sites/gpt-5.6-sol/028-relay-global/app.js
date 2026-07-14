const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
  menuButton.querySelector('.sr-only').textContent = open ? 'Open menu' : 'Close menu';
});

mobileNav.addEventListener('click', event => {
  if (event.target.matches('a')) {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Open menu';
  }
});

document.querySelector('.tracker').addEventListener('submit', event => {
  event.preventDefault();
  const id = new FormData(event.currentTarget).get('tracking-id').trim().toUpperCase();
  document.querySelector('.form-message').textContent = `Demo search ready for ${id} — connect your carrier data to view live milestones.`;
});
