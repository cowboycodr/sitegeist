(() => {
  const dialog = document.querySelector('#ritual-dialog');
  const openers = document.querySelectorAll('[data-open-ritual]');
  const closeButton = dialog.querySelector('.dialog-close');
  const startButton = dialog.querySelector('.start-ritual');
  const live = dialog.querySelector('.ritual-live');
  const soundButton = document.querySelector('#sound-toggle');
  const soundLabel = soundButton.querySelector('.sound-label');
  const soundStatus = document.querySelector('#sound-status');
  let audio;

  openers.forEach((button) => button.addEventListener('click', () => dialog.showModal()));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
  startButton.addEventListener('click', () => {
    live.textContent = 'Your ritual has begun. Place your screen face down.';
    startButton.textContent = 'Drifting now · 18:00';
    startButton.disabled = true;
    window.setTimeout(() => dialog.close(), 1800);
  });

  function startSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      soundStatus.textContent = 'Ambient audio is not supported in this browser';
      return false;
    }
    const context = new AudioContext();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 1.8);
    filter.type = 'lowpass';
    filter.frequency.value = 430;
    filter.Q.value = 0.8;
    filter.connect(master);
    master.connect(context.destination);
    const tones = [110, 164.81, 220].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * -5;
      gain.gain.value = index === 0 ? 0.45 : 0.13;
      oscillator.connect(gain).connect(filter);
      oscillator.start();
      return oscillator;
    });
    audio = { context, master, tones };
    return true;
  }

  function stopSound() {
    if (!audio) return;
    const now = audio.context.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(audio.master.gain.value, 0.0001), now);
    audio.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    window.setTimeout(() => audio.context.close(), 800);
    audio = null;
  }

  soundButton.addEventListener('click', () => {
    const playing = soundButton.getAttribute('aria-pressed') === 'true';
    if (playing) {
      stopSound();
      soundButton.setAttribute('aria-pressed', 'false');
      soundLabel.textContent = 'Hear a soundscape';
      soundStatus.textContent = 'A locally generated, gentle night tone';
    } else if (startSound()) {
      soundButton.setAttribute('aria-pressed', 'true');
      soundLabel.textContent = 'Quiet the soundscape';
      soundStatus.textContent = 'Night tone is playing softly';
    }
  });
})();
