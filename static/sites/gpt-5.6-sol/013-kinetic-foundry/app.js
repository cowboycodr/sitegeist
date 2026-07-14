(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const motionButton = document.querySelector('.motion-toggle');
  const stage = document.querySelector('.arm-stage');
  const contactButton = document.querySelector('.contact-button');
  const contactNote = document.querySelector('.contact-note');

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
    menuButton.querySelector('.sr-only').textContent = isOpen ? 'Open menu' : 'Close menu';
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Open menu';
  }));

  motionButton?.addEventListener('click', () => {
    const paused = stage.classList.toggle('paused');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.querySelector('span').textContent = paused ? 'Resume motion' : 'Pause motion';
    motionButton.querySelector('i').textContent = paused ? '▶' : 'Ⅱ';
  });

  contactButton?.addEventListener('click', () => {
    const isOpen = contactButton.getAttribute('aria-expanded') === 'true';
    contactButton.setAttribute('aria-expanded', String(!isOpen));
    contactNote.hidden = isOpen;
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage?.classList.add('paused');
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', 'true');
      motionButton.querySelector('span').textContent = 'Resume motion';
      motionButton.querySelector('i').textContent = '▶';
    }
  }
})();
