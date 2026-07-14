const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('open', !open);
});

navigation.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

const sites = {
  gulf: {
    coord: '29.7° N / 95.3° W', title: 'Gulf Coast, USA', signal: 'Compound flooding',
    change: '+8.4 in. sea level since 1950', reporters: '6 contributors',
    summary: 'Communities document saltwater intrusion, insurance retreat, and the slow loss of protective wetlands.', reports: 'View 14 reports'
  },
  sahel: {
    coord: '14.5° N / 14.4° W', title: 'The Sahel, Senegal', signal: 'Heat & rainfall volatility',
    change: '+1.5°C since 1960', reporters: '11 contributors',
    summary: 'Pastoralists and growers track shifting rains, extreme heat, and new routes through a changing grassland.', reports: 'View 21 reports'
  },
  amazon: {
    coord: '3.4° S / 65.8° W', title: 'Upper Amazon, Brazil', signal: 'Drought & forest loss',
    change: '−2.8 m river level anomaly', reporters: '8 contributors',
    summary: 'River communities map stranded channels, fish mortality, and the reach of fire into humid forest.', reports: 'View 18 reports'
  }
};

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panel = document.querySelector('#site-panel');

function selectSite(tab) {
  const site = sites[tab.dataset.site];
  tabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
  panel.setAttribute('aria-labelledby', tab.id);
  document.querySelector('#site-coord').textContent = site.coord;
  document.querySelector('#site-title').textContent = site.title;
  document.querySelector('#site-signal').textContent = site.signal;
  document.querySelector('#site-change').textContent = site.change;
  document.querySelector('#site-reporters').textContent = site.reporters;
  document.querySelector('#site-summary').textContent = site.summary;
  panel.querySelector('a').firstChild.textContent = `${site.reports} `;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectSite(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const increment = event.key === 'ArrowDown' ? 1 : -1;
    const next = tabs[(index + increment + tabs.length) % tabs.length];
    next.focus();
    selectSite(next);
  });
});
