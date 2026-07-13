document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((filter) => filter.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
    document.querySelectorAll('.item').forEach((item) => {
      item.hidden = button.dataset.filter !== 'all' && item.dataset.kind !== button.dataset.filter;
    });
  });
});

document.getElementById('reserve').addEventListener('click', () => {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
});
