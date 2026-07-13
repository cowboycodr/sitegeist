const menu = document.querySelector('.menu');
const links = document.querySelector('#nav-links');

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  links.classList.toggle('open', !open);
});

links?.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false');
  links.classList.remove('open');
});

const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.intro, .feature, .global > div, .closing > *').forEach((el) => {
  el.classList.add('reveal');
  reveal.observe(el);
});
