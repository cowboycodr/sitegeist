const soundButton = document.querySelector('.sound');
const spark = document.querySelector('.cursor-spark');
let audioContext;

soundButton.addEventListener('click', () => {
  const isOn = soundButton.getAttribute('aria-pressed') === 'true';
  soundButton.setAttribute('aria-pressed', String(!isOn));
  soundButton.textContent = isOn ? '♫' : '♪';
  if (!isOn) {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + .18);
    gain.gain.setValueAtTime(.07, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .32);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + .32);
  }
});

if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  addEventListener('pointermove', event => {
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.opacity = '1';
  });
  document.documentElement.addEventListener('mouseleave', () => spark.style.opacity = '0');
}
