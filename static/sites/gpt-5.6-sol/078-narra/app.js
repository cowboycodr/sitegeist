const builder = document.querySelector('#builder-dialog');
const overview = document.querySelector('#overview-dialog');

document.querySelectorAll('[data-open-builder]').forEach((button) => {
  button.addEventListener('click', () => builder.showModal());
});

document.querySelector('#watch-overview').addEventListener('click', () => overview.showModal());

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelectorAll('[data-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    builder.querySelector('.choice-status').textContent = `${button.dataset.choice} selected — your new narrative is ready to take shape.`;
  });
});

document.querySelector('.dialog-build').addEventListener('click', () => {
  overview.close();
  builder.showModal();
});
