const specimen = document.querySelector('#type-input');
const weight = document.querySelector('#weight');
const width = document.querySelector('#width');
const slant = document.querySelector('#slant');
const motion = document.querySelector('#motion-toggle');

function updateSpecimen() {
  const wght = weight.value;
  const wdth = width.value;
  const slnt = slant.value;
  specimen.style.fontWeight = wght;
  specimen.style.transform = `skew(${slnt}deg) scaleX(${wdth / 100})`;
  document.querySelector('#weight-output').value = wght;
  document.querySelector('#width-output').value = `${wdth}%`;
  document.querySelector('#slant-output').value = `${slnt < 0 ? '−' : ''}${Math.abs(slnt)}°`;
}

[weight, width, slant].forEach(control => control.addEventListener('input', updateSpecimen));

document.querySelectorAll('.face-card .round').forEach(button => {
  button.addEventListener('click', () => document.querySelector('#lab').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
});

motion.addEventListener('click', () => {
  const active = motion.getAttribute('aria-pressed') === 'true';
  motion.setAttribute('aria-pressed', String(!active));
  motion.lastChild.textContent = active ? ' Motion off' : ' Motion on';
  specimen.classList.toggle('is-moving', !active);
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) specimen.classList.add('is-moving');
else {
  motion.setAttribute('aria-pressed', 'false');
  motion.lastChild.textContent = ' Motion off';
}
updateSpecimen();
