const button = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');
const links = menu.querySelectorAll('a');

function setMenu(open) {
  button.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  menu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) links[0].focus();
}

button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    button.focus();
  }
});

const emailButton = document.querySelector('.copy-email');
emailButton.addEventListener('click', async () => {
  const label = emailButton.querySelector('span');
  try {
    await navigator.clipboard.writeText(emailButton.dataset.email);
    label.textContent = 'Copied ✓';
  } catch (_) {
    label.textContent = 'Select email';
  }
  window.setTimeout(() => { label.textContent = 'Copy ↗'; }, 1800);
});
