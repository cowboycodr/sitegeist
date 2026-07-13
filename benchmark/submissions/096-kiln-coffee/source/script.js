const bagButton=document.querySelector('.bag');
const panel=document.querySelector('.bag-panel');
const scrim=document.querySelector('.scrim');
const closeButton=document.querySelector('.close-bag');
const items=document.querySelector('.bag-items');
const count=document.querySelector('#bag-count');
const total=document.querySelector('.bag-total b');
const checkout=document.querySelector('.checkout');
let cart=[];

function openBag(){panel.classList.add('open');panel.setAttribute('aria-hidden','false');bagButton.setAttribute('aria-expanded','true');scrim.hidden=false;closeButton.focus()}
function closeBag(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');bagButton.setAttribute('aria-expanded','false');scrim.hidden=true;bagButton.focus()}
function render(){
  count.textContent=cart.length;
  count.classList.remove('pulse');void count.offsetWidth;count.classList.add('pulse');
  total.textContent='$'+cart.reduce((sum,item)=>sum+item.price,0);
  checkout.disabled=cart.length===0;
  items.innerHTML=cart.length?cart.map((item,index)=>`<div class="bag-item"><div><b>${item.name}</b><small>Whole bean · 250g</small></div><span>$${item.price}</span><button type="button" data-remove="${index}" aria-label="Remove ${item.name}">×</button></div>`).join(''):'<p class="empty">Your bag is cool. Add something fresh.</p>';
}
document.querySelectorAll('.add').forEach(button=>button.addEventListener('click',()=>{cart.push({name:button.dataset.product,price:Number(button.dataset.price)});render();openBag()}));
items.addEventListener('click',event=>{const button=event.target.closest('[data-remove]');if(button){cart.splice(Number(button.dataset.remove),1);render()}});
bagButton.addEventListener('click',openBag);closeButton.addEventListener('click',closeBag);scrim.addEventListener('click',closeBag);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open'))closeBag()});
checkout.addEventListener('click',()=>{checkout.textContent='Ready for checkout';setTimeout(()=>checkout.textContent='Checkout',1400)});
render();
