const specimens = [...document.querySelectorAll('.specimen')];
const detail = document.querySelector('.detail');
const note = detail.querySelector('p');

specimens.forEach((specimen) => {
  specimen.addEventListener('click', () => {
    const wasActive = specimen.classList.contains('active');
    specimens.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-expanded', 'false');
    });
    if (wasActive) {
      detail.classList.remove('show');
      note.textContent = '';
      return;
    }
    specimen.classList.add('active');
    specimen.setAttribute('aria-expanded', 'true');
    note.textContent = specimen.dataset.note;
    detail.classList.add('show');
  });
});
