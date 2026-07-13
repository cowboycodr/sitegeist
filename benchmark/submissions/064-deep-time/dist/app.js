const eras={
  hadean:{number:'4.54',unit:'billion years ago',kicker:'Fire & stone',title:'A world without ground',copy:'Gravity gathers a cloud of ancient dust. The young Earth glows molten, struck by worlds still finding their orbits. From catastrophe, a planet takes shape.',fact:'Volcanic gas',skin:'hadean'},
  proterozoic:{number:'2.40',unit:'billion years ago',kicker:'The oxygen revolution',title:'The planet learns to breathe',copy:'Tiny cyanobacteria release a waste product—oxygen. It rusts the seas, transforms the sky, and opens an entirely new chemistry for living things.',fact:'Oxygen rising',skin:'proterozoic'},
  paleozoic:{number:'541',unit:'million years ago',kicker:'An explosion of forms',title:'Life invents the animal',copy:'Eyes, shells, spines, and jaws appear in a geological instant. Later, green life crosses onto land, and animals follow into vast fern forests.',fact:'Warm shallow seas',skin:'paleozoic'},
  mesozoic:{number:'252',unit:'million years ago',kicker:'Age of giants',title:'Continents on the move',copy:'One supercontinent breaks apart. Dinosaurs diversify across the shifting world while the first birds take wing and flowers quietly remake the land.',fact:'Greenhouse world',skin:'mesozoic'},
  cenozoic:{number:'66',unit:'million years ago',kicker:'After the impact',title:'The age of mammals',copy:'With the great reptiles gone, mammals radiate into every habitat. Grasslands spread, climates cool, and one primate begins to read the rocks.',fact:'Cooling climate',skin:'cenozoic'}
};
const tabs=[...document.querySelectorAll('[role="tab"]')];
const planet=document.querySelector('#planet');
function selectEra(tab){
  tabs.forEach(t=>t.setAttribute('aria-selected',String(t===tab)));
  const e=eras[tab.dataset.era];
  document.querySelector('#era-number').textContent=e.number;
  document.querySelector('#era-unit').textContent=e.unit;
  document.querySelector('#era-kicker').textContent=e.kicker;
  document.querySelector('#era-title').textContent=e.title;
  document.querySelector('#era-copy').textContent=e.copy;
  document.querySelector('#era-fact').textContent=e.fact;
  planet.dataset.skin=e.skin;
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectEra(tab));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();let next=index;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
    tabs[next].focus();selectEra(tabs[next]);
  });
});
const skins={
  proterozoic:'radial-gradient(circle at 30% 29%,#7faeb0 0 9%,transparent 10%),radial-gradient(circle at 67% 64%,#315b62 0 12%,transparent 20%),repeating-radial-gradient(circle at 45% 45%,#173d44 0 18px,#416f70 20px 33px,#b76847 35px 38px)',
  paleozoic:'radial-gradient(ellipse at 35% 35%,#c8a259 0 8%,transparent 9%),radial-gradient(ellipse at 62% 58%,#3b6952 0 18%,transparent 19%),repeating-radial-gradient(circle at 55% 50%,#1c463b 0 19px,#70805b 20px 37px,#b89c69 39px 42px)',
  mesozoic:'radial-gradient(ellipse at 35% 28%,#b9c16e 0 12%,transparent 13%),radial-gradient(ellipse at 65% 65%,#405a2d 0 21%,transparent 22%),repeating-radial-gradient(circle at 50% 50%,#234034 0 22px,#677342 23px 39px,#b29b65 41px 44px)',
  cenozoic:'radial-gradient(ellipse at 30% 25%,#e6e2cf 0 13%,transparent 14%),radial-gradient(ellipse at 60% 63%,#608370 0 18%,transparent 19%),repeating-radial-gradient(circle at 45% 50%,#31554f 0 21px,#6e9181 23px 38px,#b8b299 40px 43px)'
};
new MutationObserver(()=>{const s=planet.dataset.skin;planet.style.background=skins[s]||'';planet.style.boxShadow=s==='hadean'?'0 0 70px rgba(213,79,43,.25)':'0 0 70px rgba(90,150,135,.18)'}).observe(planet,{attributes:true});
const menuButton=document.querySelector('.menu-button');const menu=document.querySelector('#mobile-menu');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menu.hidden=open});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}));
