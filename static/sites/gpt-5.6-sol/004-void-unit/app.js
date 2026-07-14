(() => {
  const menu = document.querySelector('#menu');
  const cart = document.querySelector('#cart');
  const scrim = document.querySelector('#scrim');
  const items = [];
  let lastFocus = null;

  function openLayer(layer) {
    lastFocus = document.activeElement;
    layer.classList.add('open');
    layer.setAttribute('aria-hidden', 'false');
    if (layer === cart) scrim.classList.add('on');
    document.body.style.overflow = 'hidden';
    layer.querySelector('button, a').focus();
  }

  function closeLayers() {
    [menu, cart].forEach(layer => {
      layer.classList.remove('open');
      layer.setAttribute('aria-hidden', 'true');
    });
    scrim.classList.remove('on');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelector('#menuOpen').addEventListener('click', () => openLayer(menu));
  document.querySelector('#cartOpen').addEventListener('click', () => openLayer(cart));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeLayers));
  scrim.addEventListener('click', closeLayers);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeLayers));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLayers(); });

  document.querySelectorAll('.add').forEach(button => button.addEventListener('click', () => {
    items.push({ name: button.dataset.item, price: button.dataset.price });
    document.querySelector('#bagCount').textContent = items.length;
    document.querySelector('#cartItems').innerHTML = items.map(item => `<div class="cart-row"><span>${item.name}</span><span>${item.price}</span></div>`).join('');
    button.textContent = 'Added ✓';
    setTimeout(() => { button.textContent = 'Add to unit'; }, 1200);
  }));
})();
