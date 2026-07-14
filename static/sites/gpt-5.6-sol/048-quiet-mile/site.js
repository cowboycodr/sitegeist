const dialog = document.querySelector('#ride-dialog');
const closeButton = dialog.querySelector('.dialog-close');
const status = dialog.querySelector('.ride-status');

document.querySelectorAll('.js-ride').forEach((button) => {
  button.addEventListener('click', () => dialog.showModal());
});

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.querySelectorAll('[data-city]').forEach((button) => {
  button.addEventListener('click', () => {
    dialog.querySelectorAll('[data-city]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    status.textContent = `${button.dataset.city} studio · Next rides available Friday and Saturday.`;
  });
});
