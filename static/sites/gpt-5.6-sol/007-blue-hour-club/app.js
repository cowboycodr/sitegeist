(() => {
  const nights = {
    fri: [
      ['8:30 PM','POST-BOP / ORIGINALS','The Lenora Hayes Quartet','Tenor saxophone with a rhythm section that knows when to leave space.','CHICAGO RESIDENT'],
      ['11:15 PM','SOUL JAZZ / DEEP CUTS','Milo Green Organ Trio','Hammond heat, brushed drums, and melodies built for the small hours.','LATE NIGHT FAVORITE']
    ],
    sat: [
      ['8:00 PM','VOCAL JAZZ / STANDARDS','Nia Brooks After Dark','A velvet voice and spare piano reframe songs you thought you knew.','ALBUM RELEASE'],
      ['10:45 PM','HARD BOP / NEW WORK','The South Branch Five','Brass-forward originals with the pulse of the city underneath.','CHICAGO RESIDENT']
    ],
    sun: [
      ['7:30 PM','PIANO TRIO / BALLADS','Ellis Ward Trio','A Sunday set of patient tempos, deep harmony, and open space.','SUNDAY SESSION'],
      ['10:00 PM','OPEN SESSION / IMPROVISED','Blue Hour Assembly','Our residents share the stand. No set list, no two nights alike.','ONE NIGHT ONLY']
    ]
  };
  const cards = [...document.querySelectorAll('.set-card')];
  document.querySelectorAll('.date').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.date').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button); });
    nights[button.dataset.date].forEach((set,index) => {
      const card = cards[index];
      ['[data-time]','[data-style]','[data-artist]','[data-detail]','[data-tag]'].forEach((selector,i) => card.querySelector(selector).textContent = set[i]);
    });
  }));
  const dialog = document.querySelector('#reserve-dialog');
  document.querySelectorAll('[data-reserve]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.querySelectorAll('.party button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.party button').forEach(item => item.setAttribute('aria-pressed', item === button));
  }));
})();
