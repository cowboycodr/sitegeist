const dialog=document.querySelector('#checkin');
const feelings=[...document.querySelectorAll('.feelings button')];
const response=document.querySelector('.checkin-response');
const toast=document.querySelector('.toast');
let toastTimer;

document.querySelectorAll('[data-open-checkin]').forEach(button=>button.addEventListener('click',()=>{
  if(typeof dialog.showModal==='function') dialog.showModal();
}));

feelings.forEach(button=>button.addEventListener('click',()=>{
  feelings.forEach(item=>item.setAttribute('aria-pressed','false'));
  button.setAttribute('aria-pressed','true');
  response.textContent=`You’re feeling ${button.textContent.toLowerCase()}. Take one slow breath and let that be enough for now.`;
}));

dialog.addEventListener('close',()=>{
  if(dialog.returnValue==='done') showToast('Your moment has been saved for today.');
});

document.querySelectorAll('[data-practice]').forEach(button=>button.addEventListener('click',()=>{
  showToast(`${button.dataset.practice} is ready. Take a comfortable breath to begin.`);
}));

document.querySelector('.profile').addEventListener('click',()=>showToast('Your private space is all caught up.'));

function showToast(message){
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);
}
