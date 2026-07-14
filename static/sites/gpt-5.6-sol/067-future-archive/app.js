const filters = document.querySelectorAll('.filter');
const records = document.querySelectorAll('.record');
const dialog = document.querySelector('#record-dialog');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    const selectedType = button.dataset.filter;
    records.forEach((record) => {
      record.hidden = selectedType !== 'all' && record.dataset.type !== selectedType;
    });
  });
});

records.forEach((record) => {
  record.addEventListener('click', () => {
    document.querySelector('#dialog-title').textContent = record.dataset.title;
    dialog.querySelector('.dialog-id').textContent = record.dataset.id;
    document.querySelector('#dialog-format').textContent = record.dataset.format;
    document.querySelector('#dialog-year').textContent = record.dataset.year;
    document.querySelector('#dialog-size').textContent = record.dataset.size;
    dialog.showModal();
  });
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector('#start-deposit').addEventListener('click', () => {
  const note = document.querySelector('#inquiry-note');
  note.hidden = false;
  note.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
});
