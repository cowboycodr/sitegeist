(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const meals = [...document.querySelectorAll('.meal-card')];
  const menuNote = document.querySelector('[data-menu-note]');
  const dialog = document.querySelector('[data-bag-dialog]');
  const bagItems = document.querySelector('[data-bag-items]');
  const count = document.querySelector('[data-bag-count]');
  const total = document.querySelector('[data-total]');
  const toast = document.querySelector('[data-toast]');
  const prices = {'Red harissa chicken': 18, 'Golden coconut curry': 16, 'Sunday beef ragù': 21};
  const bag = [];
  let toastTimer;

  const announce = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const renderBag = () => {
    count.textContent = bag.length;
    total.textContent = `$${bag.reduce((sum, item) => sum + prices[item], 0)}`;
    if (!bag.length) {
      bagItems.innerHTML = '<p class="empty-bag">Nothing here yet. Pick something delicious.</p>';
      return;
    }
    bagItems.innerHTML = '';
    bag.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'bag-item';
      const name = document.createElement('span');
      name.textContent = item;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        bag.splice(index, 1);
        renderBag();
        announce(`${item} removed`);
      });
      row.append(name, remove);
      bagItems.append(row);
    });
  };

  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((button) => {
      const active = button === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const category = filter.dataset.filter;
    let shown = 0;
    meals.forEach((meal) => {
      const visible = category === 'all' || meal.dataset.category.split(' ').includes(category);
      meal.hidden = !visible;
      if (visible) shown += 1;
    });
    menuNote.textContent = `${shown} ${shown === 1 ? 'dish' : 'dishes'} ready near you tonight`;
  }));

  document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
    const meal = button.dataset.meal;
    bag.push(meal);
    renderBag();
    announce(`${meal} added to your table`);
  }));

  document.querySelector('[data-open-bag]').addEventListener('click', () => dialog.showModal());
  document.querySelector('[data-close-bag]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.querySelector('[data-checkout]').addEventListener('click', () => {
    const note = document.querySelector('[data-dialog-note]');
    note.textContent = bag.length ? 'Delivery slots: 7:10, 7:25, or 7:40 tonight. This is a static demo.' : 'Add a dinner first, then choose a delivery time.';
    announce(bag.length ? 'Delivery times are ready' : 'Your table is empty');
  });
})();
