const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const dialog = document.querySelector('#manifesto');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('[data-open-manifesto]').forEach((button) => {
  button.addEventListener('click', () => dialog.showModal());
});

document.querySelector('[data-close-manifesto]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) dialog.close();
});

const tracker = document.querySelector('#tracker');
const hero = document.querySelector('.hero');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
hero.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches) return;
  const box = hero.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width - .5) * 28;
  const y = ((event.clientY - box.top) / box.height - .5) * 28;
  tracker.style.transform = `translate(${x}px, ${y}px)`;
});
