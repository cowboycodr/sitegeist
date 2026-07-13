(() => {
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  }

  const tabs = document.querySelectorAll('.day-tab');
  const artists = document.querySelectorAll('.artist');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const day = tab.dataset.day;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      artists.forEach((artist) => {
        artist.hidden = day !== 'all' && artist.dataset.day !== day;
      });
    });
  });
})();
