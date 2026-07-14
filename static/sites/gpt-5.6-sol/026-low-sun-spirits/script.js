const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('open', !open);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const products = {
  gin: { number: '01', name: 'Desert Gin', kicker: 'Bright / Mineral / Wild', description: 'High-desert juniper meets creosote, citrus peel, and a breath of mineral salinity. Crisp at first light; softly resinous after dark.', values: ['11, all wild-minded', '86 / 43% ABV', 'Tonic & grapefruit'], bottle: 'DESERT GIN', color: '#d9b78d' },
  amaro: { number: '02', name: 'Sunset Amaro', kicker: 'Bittersweet / Citrus / Ember', description: 'A slow infusion of desert citrus, roasted agave, and bitter roots. Vivid and floral up front, with a long earthen finish.', values: ['17, layered slowly', '58 / 29% ABV', 'Orange peel & ice'], bottle: 'SUNSET AMARO', color: '#cf6a42' },
  whiskey: { number: '03', name: 'Mesquite Whiskey', kicker: 'Toasted / Honeyed / Deep', description: 'Malted barley and native mesquite smoke rest together in oak. Warm grain, desert honey, and a restrained curl of smoke.', values: ['Mesquite & malt', '92 / 46% ABV', 'One clear cube'], bottle: 'MESQUITE', color: '#aa8155' }
};

const panel = document.querySelector('.product-panel');
const tabs = [...document.querySelectorAll('[data-product]')];

function showProduct(key) {
  const item = products[key];
  tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.product === key)));
  panel.querySelector('.big-number').textContent = item.number;
  panel.querySelector('.product-kicker').textContent = item.kicker;
  panel.querySelector('.product-copy h3').textContent = item.name;
  panel.querySelector('.product-description').textContent = item.description;
  panel.querySelectorAll('dd').forEach((value, index) => { value.textContent = item.values[index]; });
  panel.querySelector('.bottle-type').textContent = item.bottle;
  panel.querySelector('.bottle-num').textContent = `NO. ${item.number}`;
  panel.querySelector('.product-visual').className = `product-visual ${key === 'gin' ? '' : key}`;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showProduct(tab.dataset.product));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + offset + tabs.length) % tabs.length];
    next.focus();
    showProduct(next.dataset.product);
  });
});
