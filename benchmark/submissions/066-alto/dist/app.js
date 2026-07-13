const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#site-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open)});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));

const tabs=document.querySelectorAll('.space-tabs button');
const cards=document.querySelectorAll('.space-card');
tabs.forEach(tab=>tab.addEventListener('click',()=>{
  tabs.forEach(item=>{item.classList.remove('active');item.setAttribute('aria-selected','false')});
  tab.classList.add('active');tab.setAttribute('aria-selected','true');
  cards.forEach(card=>card.classList.toggle('hidden',tab.dataset.filter!=='all'&&card.dataset.type!==tab.dataset.filter));
}));

const form=document.querySelector('#visit-form');
const note=form.querySelector('.form-note');
form.addEventListener('submit',event=>{event.preventDefault();const name=new FormData(form).get('name').trim().split(' ')[0];note.textContent=`Thanks${name?', '+name:''}. Your visit request is ready — we’ll be in touch soon.`;note.classList.add('success');form.reset()});

const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
  reveals.forEach(item=>observer.observe(item));
}else{reveals.forEach(item=>item.classList.add('visible'))}
