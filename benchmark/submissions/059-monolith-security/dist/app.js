(() => {
  const menuButton = document.querySelector('.menu');
  const mobileNav = document.querySelector('#mobile-nav');
  const dialog = document.querySelector('#access-dialog');
  const closeButton = dialog.querySelector('.close');

  const closeMenu = () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const opening = mobileNav.hidden;
    mobileNav.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.querySelectorAll('[data-open-dialog]').forEach((button) => button.addEventListener('click', () => {
    closeMenu();
    dialog.showModal();
  }));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
