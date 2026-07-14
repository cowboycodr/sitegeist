const filters = document.querySelectorAll('.filter');
const products = document.querySelectorAll('.product-card');
const saves = document.querySelectorAll('.save');
const count = document.querySelector('.saved-count');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const searchButton = document.querySelector('.search-toggle');
const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#site-search');
const searchStatus = document.querySelector('.search-status');
const emptyState = document.querySelector('.empty-state');
const savedButton = document.querySelector('.saved-button');
const sortButton = document.querySelector('.sort-button');
const productGrid = document.querySelector('.product-grid');
const curatorOrder = Array.from(products);
let savedOnly = false;
let alphabetical = false;

function showMatching(category = 'all', query = '') {
  let visible = 0;
  products.forEach((product) => {
    const categoryMatch = category === 'all' || product.dataset.category === category;
    const queryMatch = product.dataset.name.toLowerCase().includes(query.toLowerCase());
    const savedMatch = !savedOnly || product.querySelector('.save').getAttribute('aria-pressed') === 'true';
    product.hidden = !(categoryMatch && queryMatch && savedMatch);
    if (!product.hidden) visible += 1;
  });
  emptyState.hidden = visible !== 0;
  if (query) searchStatus.textContent = `${visible} ${visible === 1 ? 'object' : 'objects'} found`;
  return visible;
}

filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  showMatching(button.dataset.filter, searchInput.value.trim());
}));

saves.forEach((button) => button.addEventListener('click', () => {
  const saved = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!saved));
  button.textContent = saved ? '♡' : '♥';
  count.textContent = String(document.querySelectorAll('.save[aria-pressed="true"]').length);
  if (savedOnly) {
    const activeFilter = document.querySelector('.filter.active').dataset.filter;
    showMatching(activeFilter, searchInput.value.trim());
  }
}));

savedButton.addEventListener('click', () => {
  savedOnly = !savedOnly;
  savedButton.classList.toggle('active', savedOnly);
  savedButton.setAttribute('aria-pressed', String(savedOnly));
  const activeFilter = document.querySelector('.filter.active').dataset.filter;
  showMatching(activeFilter, searchInput.value.trim());
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelector('#collection').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
});

sortButton.addEventListener('click', () => {
  alphabetical = !alphabetical;
  const order = alphabetical ? [...curatorOrder].sort((a, b) => a.dataset.name.localeCompare(b.dataset.name)) : curatorOrder;
  order.forEach((product) => productGrid.appendChild(product));
  sortButton.firstChild.textContent = alphabetical ? 'Sort: A–Z ' : "Sort: Curator's edit ";
});

function toggleMenu(force) {
  const open = typeof force === 'boolean' ? force : mobileMenu.hidden;
  mobileMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
}
menuButton.addEventListener('click', () => toggleMenu());
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

function toggleSearch(force) {
  const open = typeof force === 'boolean' ? force : searchPanel.hidden;
  searchPanel.hidden = !open;
  searchButton.setAttribute('aria-expanded', String(open));
  if (open) searchInput.focus();
}
searchButton.addEventListener('click', () => toggleSearch());
document.querySelector('.search-close').addEventListener('click', () => toggleSearch(false));
searchInput.addEventListener('input', () => {
  const activeFilter = document.querySelector('.filter.active').dataset.filter;
  showMatching(activeFilter, searchInput.value.trim());
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { toggleSearch(false); toggleMenu(false); }
});

const inquiryButton = document.querySelector('.inquiry-button');
const inquiryNote = document.querySelector('.inquiry-note');
inquiryButton.addEventListener('click', () => {
  const open = inquiryNote.hidden;
  inquiryNote.hidden = !open;
  inquiryButton.setAttribute('aria-expanded', String(open));
  inquiryButton.firstChild.textContent = open ? 'Submission checklist ' : 'Tell us about your piece ';
});
