const count = document.querySelector('.bag-count');
const toast = document.querySelector('.toast');
let items = 0;
let toastTimer;

function announce(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('.add-button').forEach((button) => {
  button.addEventListener('click', () => {
    items += 1;
    count.textContent = String(items).padStart(2, '0');
    count.setAttribute('aria-label', `${items} ${items === 1 ? 'item' : 'items'}`);
    announce(`${button.dataset.item} added to your box`);
  });
});

document.querySelector('.box-button').addEventListener('click', () => {
  document.querySelector('.bake-section').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  announce('Pick six favourites from today’s bake');
});
