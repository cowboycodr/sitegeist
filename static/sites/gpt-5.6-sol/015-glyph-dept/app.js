const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#site-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menuButton.querySelector('b').textContent=open?'+':'−';nav.classList.toggle('open',!open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.querySelector('b').textContent='+'}));
const tester=document.querySelector('#tester');const editable=document.querySelector('#editable');
const size=document.querySelector('#size');const weight=document.querySelector('#weight');
function update(){editable.style.fontSize=`${size.value}px`;editable.style.fontWeight=weight.value;document.querySelector('#size-output').value=`${size.value} px`;document.querySelector('#weight-output').value=weight.value}
size.addEventListener('input',update);weight.addEventListener('input',update);
document.querySelector('#family').addEventListener('change',e=>editable.dataset.family=e.target.value);
document.querySelector('#invert').addEventListener('click',e=>{const pressed=e.currentTarget.getAttribute('aria-pressed')==='true';e.currentTarget.setAttribute('aria-pressed',String(!pressed));tester.classList.toggle('inverted',!pressed)});
document.querySelectorAll('[data-sample]').forEach(button=>button.addEventListener('click',()=>{editable.textContent=button.dataset.sample;document.querySelector('#tester').scrollIntoView();editable.focus()}));
update();
