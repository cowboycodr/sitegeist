const dialog = document.querySelector('.reserve');
const openButtons = document.querySelectorAll('[data-open-reserve]');
const closeButton = document.querySelector('[data-close-reserve]');
const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('.copy-status');

openButtons.forEach((button) => {
  button.addEventListener('click', () => dialog.showModal());
});

closeButton.addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('seats@fondue.club');
    copyStatus.textContent = 'Copied. See you around the pot.';
    copyButton.textContent = 'Email copied!';
  } catch {
    copyStatus.textContent = 'Select the address above to copy it.';
  }
});
