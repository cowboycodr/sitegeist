const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? 'Open menu' : 'Close menu';
  nav.classList.toggle('open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Open menu';
}));

const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project-card');
const empty = document.querySelector('.empty-state');

filters.forEach((filter) => filter.addEventListener('click', () => {
  filters.forEach((item) => {
    const selected = item === filter;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  let visible = 0;
  projects.forEach((project) => {
    const show = filter.dataset.filter === 'all' || project.dataset.tags.split(' ').includes(filter.dataset.filter);
    project.hidden = !show;
    if (show) visible += 1;
  });
  empty.hidden = visible > 0;
}));
