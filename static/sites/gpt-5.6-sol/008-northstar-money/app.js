const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const starting = document.querySelector('#starting');
const monthly = document.querySelector('#monthly');
const years = document.querySelector('#years');
const projection = document.querySelector('#projection');

function updateProjection() {
  const principal = Number(starting.value);
  const contribution = Number(monthly.value);
  const term = Number(years.value);
  const monthlyRate = .06 / 12;
  const months = term * 12;
  const future = principal * Math.pow(1 + monthlyRate, months) + contribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  document.querySelector('#starting-output').value = money.format(principal);
  document.querySelector('#monthly-output').value = money.format(contribution);
  document.querySelector('#years-output').value = `${term} years`;
  document.querySelector('#end-year').textContent = new Date().getFullYear() + term;
  projection.textContent = money.format(future);
}

[starting, monthly, years].forEach(input => input.addEventListener('input', updateProjection));
updateProjection();

const eye = document.querySelector('.eye');
eye.addEventListener('click', () => {
  const balance = document.querySelector('.balance');
  const hidden = eye.getAttribute('aria-pressed') === 'true';
  eye.setAttribute('aria-pressed', String(!hidden));
  eye.setAttribute('aria-label', hidden ? 'Hide balance' : 'Show balance');
  balance.textContent = hidden ? balance.dataset.balance : '••••••••';
});
