const bagButton=document.querySelector('.bag');
const bagPanel=document.querySelector('.bag-panel');
const closeBag=document.querySelector('.close-bag');
const scrim=document.querySelector('.scrim');
const bagCount=bagButton.querySelector('b');
const bagItems=document.querySelector('.bag-items');
const subtotal=document.querySelector('.bag-foot strong');
const prices={'Tide Vase':148,'Sunday Cup':54,'Low Serving Bowl':92,'Moon Jar':176};
const items=[];

function openBag(){bagPanel.classList.add('open');bagPanel.setAttribute('aria-hidden','false');bagButton.setAttribute('aria-expanded','true');scrim.hidden=false;closeBag.focus()}
function shutBag(){bagPanel.classList.remove('open');bagPanel.setAttribute('aria-hidden','true');bagButton.setAttribute('aria-expanded','false');scrim.hidden=true;bagButton.focus()}
function renderBag(){bagCount.textContent=items.length;subtotal.textContent=`$${items.reduce((sum,item)=>sum+prices[item],0)}`;bagItems.innerHTML=items.length?items.map((item,index)=>`<div class="line-item"><span>${item}</span><button type="button" aria-label="Remove ${item}" data-remove="${index}">×</button></div>`).join(''):'<p>Your bag is waiting for something made by hand.</p>'}
bagButton.addEventListener('click',openBag);closeBag.addEventListener('click',shutBag);scrim.addEventListener('click',shutBag);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&bagPanel.classList.contains('open'))shutBag()});
document.querySelectorAll('.add').forEach(button=>button.addEventListener('click',()=>{items.push(button.dataset.item);renderBag();button.querySelector('span').textContent='Added';setTimeout(()=>button.querySelector('span').textContent='Add to bag',900)}));
bagItems.addEventListener('click',event=>{const button=event.target.closest('[data-remove]');if(button){items.splice(Number(button.dataset.remove),1);renderBag()}});
document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filters .active').classList.remove('active');button.classList.add('active');document.querySelectorAll('.product').forEach(product=>product.classList.toggle('hidden',button.dataset.filter!=='all'&&product.dataset.category!==button.dataset.filter))}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
