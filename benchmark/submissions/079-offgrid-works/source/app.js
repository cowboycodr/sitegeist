const qs=(s,c=document)=>c.querySelector(s),qsa=(s,c=document)=>[...c.querySelectorAll(s)];
const dialog=qs('.config');
qsa('[data-open-config]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
qs('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
qsa('.config input').forEach(i=>i.addEventListener('change',()=>{const family=qs('[name=cabin]:checked').value==='family',extended=qs('[name=range]:checked').value==='310';qs('#price').textContent='$'+(74800+(family?12000:0)+(extended?20000:0)).toLocaleString()}));
const tours=[['The day room','Desk, dining, and lounge in one open configuration.'],['The night room','A true queen bed unfolds without rearranging your gear.'],['The mud room','A heated entry and wet locker keep weather where it belongs.']];let tour=0;
function showTour(){qs('#tourCurrent').textContent=String(tour+1).padStart(2,'0');qs('#tourTitle').textContent=tours[tour][0];qs('#tourText').textContent=tours[tour][1]}
qs('.next').addEventListener('click',()=>{tour=(tour+1)%3;showTour()});qs('.prev').addEventListener('click',()=>{tour=(tour+2)%3;showTour()});
const modules={galley:['MODULE 01','Field galley','Induction cooktop, deep sink, 48L fridge, and every utensil secured for washboard roads.','08 MIN'],studio:['MODULE 02','Field studio','A full-width birch desk, task lighting, and hidden power for making a living from anywhere.','06 MIN'],gear:['MODULE 03','Gear locker','Ventilated, washable storage sized for bikes, boards, boots, and the mess that follows.','05 MIN'],sleep:['MODULE 04','Guest berth','A second two-person berth with private reading lights and quick-stow bedding.','07 MIN']};
qsa('[data-module]').forEach(b=>b.addEventListener('click',()=>{qsa('[data-module]').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});b.classList.add('active');b.setAttribute('aria-selected','true');const d=modules[b.dataset.module];['#moduleIndex','#moduleTitle','#moduleDesc','#moduleTime'].forEach((s,i)=>qs(s).textContent=d[i])}));
qsa('.hotspot button').forEach(b=>b.addEventListener('click',()=>b.parentElement.classList.toggle('open')));
qs('.menu').addEventListener('click',e=>{const n=qs('.nav'),open=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});
