const menu = document.querySelector('.menu');
const mobileNav = document.querySelector('.mobile-nav');

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  mobileNav.classList.toggle('open', !open);
});

mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
}));

document.querySelectorAll('.route-item').forEach((item) => {
  item.addEventListener('mouseenter', () => {
    document.querySelectorAll('.route-item').forEach((route) => route.classList.remove('active'));
    item.classList.add('active');
  });
  item.addEventListener('focus', () => {
    document.querySelectorAll('.route-item').forEach((route) => route.classList.remove('active'));
    item.classList.add('active');
  });
});

const joinButton = document.querySelector('.join-button');
const joinNote = document.querySelector('.join-note');
joinButton?.addEventListener('click', () => {
  const open = joinButton.getAttribute('aria-expanded') === 'true';
  joinButton.setAttribute('aria-expanded', String(!open));
  joinNote.classList.toggle('open', !open);
});
