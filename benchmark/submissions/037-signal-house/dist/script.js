const menuButton = document.querySelector('.menu-button');
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

document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.filters .active').classList.remove('active');
  button.classList.add('active');
  const filter = button.dataset.filter;
  document.querySelectorAll('.project').forEach(project => {
    project.classList.toggle('hidden', filter !== 'all' && !project.dataset.kind.includes(filter));
  });
}));

const projectDialog = document.querySelector('.project-dialog');
document.querySelectorAll('.project-open').forEach(button => button.addEventListener('click', () => {
  projectDialog.querySelector('h2').textContent = button.dataset.project;
  projectDialog.showModal();
}));
const contactDialog = document.querySelector('.contact-dialog');
document.querySelectorAll('.js-contact').forEach(button => button.addEventListener('click', () => contactDialog.showModal()));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
});

document.querySelectorAll('.copy-email').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.email);
    const label = button.querySelector('span');
    label.textContent = 'Copied!';
    window.setTimeout(() => { label.textContent = button.classList.contains('big-copy') ? 'Copy email' : 'Copy'; }, 1800);
  } catch (_) {
    button.querySelector('span').textContent = 'Select address';
  }
}));
