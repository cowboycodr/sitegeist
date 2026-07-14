const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('open', !open);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-scroll-target]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector(button.dataset.scrollTarget).scrollIntoView({ behavior: 'smooth' });
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const dialog = document.querySelector('.method-dialog');
document.querySelectorAll('[data-open-dialog]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) dialog.close();
});

const recommendations = {
  starting: ['Map your operational footprint', 'Start with Scope 1 and 2 activity data, then identify the material Scope 3 categories for your business.'],
  improving: ['Build a data quality plan', 'Replace your highest-impact estimates first, assign data owners and create a repeatable monthly collection rhythm.'],
  scaling: ['Connect targets to decisions', 'Translate your reduction pathway into team-level actions, budgets and live performance indicators.']
};
document.querySelectorAll('[data-readiness]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-readiness]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const choice = recommendations[button.dataset.readiness];
  document.querySelector('#recommendation-title').textContent = choice[0];
  document.querySelector('#recommendation-copy').textContent = choice[1];
}));

const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const item = entry.target;
    const target = Number(item.dataset.count);
    if (reduceMotion) item.textContent = String(target);
    else {
      let start;
      const update = (time) => {
        start ??= time;
        const progress = Math.min((time - start) / 900, 1);
        item.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }
    observer.unobserve(item);
  });
}, { threshold: .4 });
counters.forEach((counter) => counterObserver.observe(counter));
