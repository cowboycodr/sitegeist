const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
}));

document.querySelectorAll('.step').forEach((step) => {
  step.addEventListener('click', () => {
    document.querySelectorAll('.step').forEach((item) => {
      const active = item === step;
      item.classList.toggle('active', active);
      item.setAttribute('aria-expanded', String(active));
      item.querySelector('.step-toggle').textContent = active ? '−' : '+';
    });
  });
});

const contactButton = document.querySelector('.contact-orb');
const projectDetails = document.querySelector('.project-details');
contactButton.addEventListener('click', () => {
  const open = contactButton.getAttribute('aria-expanded') === 'true';
  contactButton.setAttribute('aria-expanded', String(!open));
  projectDetails.hidden = open;
  contactButton.querySelector('span').innerHTML = open ? 'Start a<br>conversation' : 'Project desk<br>is ready';
});
