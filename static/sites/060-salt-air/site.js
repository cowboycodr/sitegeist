const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('open', !open);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const dialog = document.querySelector('.booking-dialog');
document.querySelectorAll('[data-open-booking]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector('.check-button').addEventListener('click', () => {
  const arrival = document.querySelector('#arrival').value;
  const departure = document.querySelector('#departure').value;
  const response = document.querySelector('.booking-response');
  response.textContent = arrival && departure
    ? 'Lovely. Call +1 207 412 0618 and we’ll finish arranging your stay.'
    : 'Choose an arrival and departure date to begin.';
});
