const product=document.querySelector('#product');
const finishName=document.querySelector('#finishName');
document.querySelectorAll('.swatch').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.swatch').forEach(item=>item.setAttribute('aria-pressed','false'));
  button.setAttribute('aria-pressed','true');
  product.style.setProperty('--finish',button.dataset.color);
  finishName.textContent=button.dataset.name;
}));
document.querySelectorAll('.size-btn').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.size-btn').forEach(item=>item.setAttribute('aria-pressed','false'));
  button.setAttribute('aria-pressed','true');
  const size=Number(button.dataset.size);
  product.style.transform=`scaleX(${size/1200})`;
  document.querySelector('#measure').textContent=`${size} mm width`;
}));
let count=0;
document.querySelector('#add').addEventListener('click',()=>{
  count+=1;
  document.querySelector('#count').textContent=count;
  document.querySelector('.bag').setAttribute('aria-label',`Shopping bag, ${count} ${count===1?'item':'items'}`);
  const toast=document.querySelector('#toast');
  toast.classList.add('show');
  window.setTimeout(()=>toast.classList.remove('show'),2200);
});
