const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('#site-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open)});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));

const spaces={
  hotels:{kicker:'HOSPITALITY',title:'Service that never keeps a guest waiting.',description:'Send towels, amenities, and room service upstairs while your team stays focused on a warm welcome.',items:['Guest amenity delivery','Room service support','Front desk relief']},
  hospitals:{kicker:'HEALTHCARE',title:'More time for care, less time in transit.',description:'Move medications, lab samples, and supplies between departments while clinical teams stay close to patients.',items:['Pharmacy-to-floor runs','Lab sample transport','Supply replenishment']},
  campuses:{kicker:'CAMPUSES',title:'A better way across busy buildings.',description:'Connect mailrooms, labs, libraries, and offices with dependable deliveries that fit the rhythm of campus life.',items:['Mail and parcel delivery','Lab materials transport','After-hours support']}
};
const tabs=[...document.querySelectorAll('[role="tab"]')];
const panel=document.querySelector('#space-panel');
function selectSpace(tab){const key=tab.dataset.space;const data=spaces[key];tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1});panel.setAttribute('aria-labelledby',tab.id);panel.querySelector('.space-art').dataset.art=key;panel.querySelector('.space-kicker').textContent=data.kicker;panel.querySelector('h3').textContent=data.title;panel.querySelector('[data-space-description]').textContent=data.description;panel.querySelector('[data-space-list]').innerHTML=data.items.map(item=>`<li>${item}</li>`).join('')}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectSpace(tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();selectSpace(tabs[next])})});

const dialog=document.querySelector('.demo-dialog');
document.querySelector('[data-open-demo]').addEventListener('click',()=>dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
document.querySelector('.dialog-done').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
document.querySelector('#year').textContent=new Date().getFullYear();
