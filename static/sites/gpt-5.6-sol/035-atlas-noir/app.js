const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('open', !open);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

const inquiryButton = document.querySelector('.inquiry-button');
const inquiryNote = document.querySelector('.inquiry-note');

inquiryButton.addEventListener('click', () => {
  const open = inquiryButton.getAttribute('aria-expanded') === 'true';
  inquiryButton.setAttribute('aria-expanded', String(!open));
  inquiryNote.hidden = open;
});
