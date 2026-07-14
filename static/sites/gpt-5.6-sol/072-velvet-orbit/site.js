const menuButton = document.querySelector('.menu-button');
const menuPanel = document.querySelector('#menu-panel');
const menuClose = document.querySelector('.panel-close');
const storyPanel = document.querySelector('#story-panel');
const storyClose = document.querySelector('.story-close');
const openButtons = document.querySelectorAll('[data-open]');
let returnFocus = null;

const stories = {
  collection: {
    kicker: 'Aphelion / The collection',
    title: 'The body,<br>re-orbited.',
    text: 'Sixteen looks trace a path from structured midnight velvet to mirror-bright lamé. Broad lunar shoulders, curved seams and weightless drape hold every silhouette in exquisite tension.',
    meta: ['16 looks', 'Edition 04', 'AW 2026']
  },
  campaign: {
    kicker: 'Campaign 04 / Far light',
    title: 'Caught at<br>aphelion.',
    text: 'A study in distance, reflection and motion. The Aphelion campaign captures cloth at the edge of light—where every fold becomes a horizon and every silhouette finds its own orbit.',
    meta: ['Paris', 'Film + stills', 'AW 2026']
  },
  about: {
    kicker: 'Velvet Orbit / The maison',
    title: 'Matter with<br>intention.',
    text: 'Velvet Orbit is a directional Paris label pairing architectural form with fluid surfaces. Each edition is cut in small runs and constructed to be worn beyond a single season.',
    meta: ['Founded 2022', 'Paris', 'Independent']
  }
};

function setPageLocked(locked) {
  document.body.classList.toggle('panel-open', locked);
}

function closeMenu(restore = true) {
  menuPanel.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  setPageLocked(!storyPanel.hidden);
  if (restore) menuButton.focus();
}

function showStory(kind, trigger) {
  const story = stories[kind] || stories.collection;
  returnFocus = trigger;
  document.querySelector('#story-kicker').textContent = story.kicker;
  document.querySelector('#story-title').innerHTML = story.title;
  document.querySelector('#story-text').textContent = story.text;
  document.querySelector('#story-meta').replaceChildren(...story.meta.map(item => {
    const span = document.createElement('span');
    span.textContent = item;
    return span;
  }));
  closeMenu(false);
  storyPanel.hidden = false;
  setPageLocked(true);
  storyClose.focus();
}

menuButton.addEventListener('click', () => {
  menuPanel.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  setPageLocked(true);
  menuClose.focus();
});
menuClose.addEventListener('click', () => closeMenu());
openButtons.forEach(button => button.addEventListener('click', () => showStory(button.dataset.open, button)));
storyClose.addEventListener('click', () => {
  storyPanel.hidden = true;
  setPageLocked(false);
  if (returnFocus) returnFocus.focus();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!storyPanel.hidden) storyClose.click();
    else if (!menuPanel.hidden) closeMenu();
    return;
  }
  if (event.key !== 'Tab') return;
  const activePanel = !storyPanel.hidden ? storyPanel : (!menuPanel.hidden ? menuPanel : null);
  if (!activePanel) return;
  const focusable = [...activePanel.querySelectorAll('button:not([disabled]), a[href]')];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
