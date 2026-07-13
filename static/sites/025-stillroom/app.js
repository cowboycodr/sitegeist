(() => {
  const dialog = document.querySelector('#session-dialog');
  const title = document.querySelector('#session-title');
  const display = document.querySelector('#time-display');
  const instruction = document.querySelector('.session-instruction');
  const toggle = document.querySelector('.session-toggle');
  const close = document.querySelector('.close-session');
  let total = 180;
  let remaining = total;
  let timer = null;

  const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  function stop(resetLabel = true) {
    if (timer) window.clearInterval(timer);
    timer = null;
    dialog.classList.remove('is-running');
    if (resetLabel) toggle.textContent = remaining < total ? 'Continue' : 'Begin';
  }

  function openSession(name = 'Soft Reset', minutes = 3) {
    stop(false);
    title.textContent = name;
    total = Number(minutes) * 60;
    remaining = total;
    display.textContent = format(remaining);
    instruction.textContent = 'Settle in and press begin.';
    toggle.textContent = 'Begin';
    dialog.showModal();
  }

  document.querySelectorAll('.js-start').forEach(button => button.addEventListener('click', () => openSession()));
  document.querySelectorAll('.js-practice').forEach(button => button.addEventListener('click', () => openSession(button.dataset.practice, button.dataset.minutes)));

  toggle.addEventListener('click', () => {
    if (timer) {
      stop();
      instruction.textContent = 'Paused. Return when you’re ready.';
      return;
    }
    toggle.textContent = 'Pause';
    instruction.textContent = 'Breathe in slowly… and let go.';
    dialog.classList.add('is-running');
    timer = window.setInterval(() => {
      remaining -= 1;
      display.textContent = format(remaining);
      instruction.textContent = remaining % 14 > 7 ? 'Let the breath soften.' : 'Notice where you are.';
      if (remaining <= 0) {
        stop(false);
        display.textContent = '00:00';
        instruction.textContent = 'That is enough. Take your time returning.';
        toggle.textContent = 'Begin again';
        remaining = total;
      }
    }, 1000);
  });

  close.addEventListener('click', () => { stop(); dialog.close(); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) { stop(); dialog.close(); }
  });
  dialog.addEventListener('cancel', () => stop());
})();
