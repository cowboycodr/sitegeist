const path=document.querySelector('#wavePath');
const amp=document.querySelector('#amplitude');
const freq=document.querySelector('#frequency');
function draw(){
  const a=Number(amp.value),f=Number(freq.value);let d='';
  for(let x=0;x<=800;x+=4){const y=140-Math.sin((x/800)*Math.PI*2*f)*a*56;d+=(x?'L':'M')+x+' '+y}
  path.setAttribute('d',d);
  document.querySelector('#ampOut').textContent=a.toFixed(1);document.querySelector('#ampLabel').textContent=a.toFixed(1);
  document.querySelector('#freqOut').textContent=f.toFixed(1);document.querySelector('#freqLabel').textContent=f.toFixed(1);
}
amp.addEventListener('input',draw);freq.addEventListener('input',draw);
document.querySelector('#randomize').addEventListener('click',()=>{amp.value=(.3+Math.random()*1.7).toFixed(1);freq.value=(.5+Math.random()*3.5).toFixed(1);draw()});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});button.classList.add('active');button.setAttribute('aria-pressed','true');
  document.querySelectorAll('.course').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);
}));draw();
