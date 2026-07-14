const dialog = document.querySelector('#assessment');
document.querySelectorAll('[data-open-assessment]').forEach(button => {
  button.addEventListener('click', () => dialog.showModal());
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
document.querySelectorAll('.node').forEach(node => {
  node.addEventListener('click', () => {
    document.querySelector('#nodeLabel').textContent = node.dataset.node;
  });
});
document.querySelectorAll('.options button').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelector('.demo-response').textContent = `${option.textContent.toUpperCase()} SELECTED — ASSESSMENT SCOPE READY`;
  });
});
