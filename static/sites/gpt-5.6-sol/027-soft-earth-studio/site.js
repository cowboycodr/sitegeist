const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu');

menu?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(isOpen));
  menu.textContent = isOpen ? 'Close' : 'Menu';
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
  if (menu) menu.textContent = 'Menu';
}));

const filters = document.querySelectorAll('.filter');
const works = document.querySelectorAll('.work');
const count = document.querySelector('#work-count');

filters.forEach((button) => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  let visible = 0;
  works.forEach((work) => {
    const show = selected === 'all' || work.dataset.kind === selected;
    work.hidden = !show;
    if (show) visible += 1;
  });
  if (count) count.textContent = String(visible);
}));
