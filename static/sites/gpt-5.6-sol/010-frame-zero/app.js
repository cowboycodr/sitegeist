const films = {
  signal: { index:'01', title:'A Signal Fires Back', kicker:'Opening film / Feature', description:'After a radio astronomer receives a transmission in her own voice, she follows it into a desert where memory and prophecy share the same frequency.', director:'Inés Mercado', origin:'Mexico, 2026', runtime:'98 minutes', art:'signal' },
  cicada: { index:'02', title:'Cicada Season', kicker:'Official selection / Short', description:'During the hottest week on record, two brothers hear a rhythm in the city noise that everyone else has learned to ignore.', director:'Ravi Sen', origin:'India, 2026', runtime:'17 minutes', art:'cicada' },
  soft: { index:'03', title:'Soft Concrete', kicker:'Official selection / Feature', description:'An architect returns to the estate she grew up in and finds its residents quietly rebuilding the future inside its condemned walls.', director:'Ellie Adeyemi', origin:'United Kingdom, 2025', runtime:'74 minutes', art:'soft' },
  after: { index:'04', title:'After the Blue Hour', kicker:'Midnight selection / Short', description:'A night-shift driver picks up the same passenger three times, each on a different side of the city and a different side of dawn.', director:'Mara Voss', origin:'Germany, 2026', runtime:'24 minutes', art:'after' },
  dust: { index:'05', title:'Dust Archive', kicker:'Official selection / Feature', description:'A family archivist discovers that the oldest objects in her collection remember events no living witness can confirm.', director:'Nadia Okafor', origin:'Ghana, 2025', runtime:'83 minutes', art:'dust' },
  static: { index:'06', title:'Static Bloom', kicker:'Closing film / Short', description:'Flowers begin growing from discarded electronics, forcing a teenage repair artist to choose between wonder and explanation.', director:'Léa Morin', origin:'France, 2026', runtime:'12 minutes', art:'static' }
};

const dialog = document.querySelector('#film-dialog');
const art = document.querySelector('#dialog-art');
let returnFocus;

document.querySelectorAll('.js-open-film').forEach(button => button.addEventListener('click', () => {
  const film = films[button.dataset.film];
  returnFocus = button;
  document.querySelector('#dialog-index').textContent = film.index;
  document.querySelector('#dialog-kicker').textContent = film.kicker;
  document.querySelector('#dialog-title').textContent = film.title;
  document.querySelector('#dialog-description').textContent = film.description;
  document.querySelector('#dialog-director').textContent = film.director;
  document.querySelector('#dialog-origin').textContent = film.origin;
  document.querySelector('#dialog-runtime').textContent = film.runtime;
  art.className = `dialog-art dialog-${film.art}`;
  const watchButton = document.querySelector('.watch-button');
  watchButton.classList.remove('is-confirmed');
  watchButton.innerHTML = 'Watch during festival <span>▶</span>';
  document.querySelector('.watch-note').textContent = 'Available 08—14 August. No account required.';
  dialog.showModal();
}));

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => returnFocus?.focus());

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.film-card');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  let visible = 0;
  filters.forEach(item => { const selected = item === button; item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', selected); });
  cards.forEach(card => { const show = filter === 'all' || card.dataset.type === filter; card.hidden = !show; if (show) visible += 1; });
  document.querySelector('#filter-status').textContent = `Showing ${visible} ${filter === 'all' ? 'films' : filter + (visible === 1 ? '' : 's')}`;
}));

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('is-open', !open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }));

document.querySelector('.watch-button').addEventListener('click', event => {
  event.currentTarget.classList.add('is-confirmed');
  event.currentTarget.innerHTML = 'Added to your festival list <span>✓</span>';
  document.querySelector('.watch-note').textContent = 'Saved locally for this visit. Streaming opens 08 August.';
});
