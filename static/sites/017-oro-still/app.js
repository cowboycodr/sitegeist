(() => {
  const dialog = document.querySelector('.materials-dialog');
  const openers = document.querySelectorAll('[data-open-materials]');
  const closer = document.querySelector('[data-close-materials]');

  openers.forEach((button) => button.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
  }));

  closer.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
})();
