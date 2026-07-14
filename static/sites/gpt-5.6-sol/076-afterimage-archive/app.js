const records = [
  ['p1','AA—014','Light Leak, North Wall','Mara Venn · 1971 · Gelatin silver print'],
  ['p2','AA—361','Emulsion Study no. 4','Osei Calder · 1986 · Distressed chromogenic print'],
  ['p3','AA—207','Eight Attempts at Vanishing','Ruth Kamei · 1978 · Contact sheet'],
  ['p4','AA—006','Untitled Solar Trace','Ilya Soren · 1969 · Lumen print'],
  ['p5','AA—722','Fold / Exposure','Celeste Im · 1992 · Silver dye bleach print'],
  ['p6','AA—284','Peripheral Motion','Anwar Bell · 1981 · Six-part gelatin silver print'],
  ['p7','AA—901','Apparition in Red','Elena Orlov · 1997 · Cibachrome photogram'],
  ['p8','AA—106','Static Field','Jules Aalto · 1974 · Xerographic transfer']
];

const filters = document.querySelectorAll('.filter');
const works = document.querySelectorAll('.record');
const count = document.querySelector('#visible-count');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed','false'); });
  button.classList.add('active'); button.setAttribute('aria-pressed','true');
  const filter = button.dataset.filter; let visible = 0;
  works.forEach(work => { const show = filter === 'all' || work.dataset.category === filter; work.hidden = !show; if (show) visible++; });
  count.textContent = String(visible).padStart(2,'0');
}));

const viewer = document.querySelector('#viewer');
const viewerImage = viewer.querySelector('.viewer-image');
document.querySelectorAll('[data-record]').forEach(button => button.addEventListener('click', () => {
  const record = records[Number(button.dataset.record)-1];
  viewerImage.className = `viewer-image plate ${record[0]}`;
  viewerImage.innerHTML = '<span class="grain"></span>';
  document.querySelector('#viewer-index').textContent = record[1];
  document.querySelector('#viewer-title').textContent = record[2];
  document.querySelector('#viewer-detail').textContent = record[3];
  viewer.showModal();
}));
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open)); mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true; menuButton.setAttribute('aria-expanded','false');
}));
