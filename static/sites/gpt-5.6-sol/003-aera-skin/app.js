const menuButton=document.querySelector('[data-menu-button]');
const menu=document.querySelector('[data-menu]');
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menu.hidden=open});
menu?.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}));

const tabs=[...document.querySelectorAll('[data-tab]')];
const panels=[...document.querySelectorAll('[data-panel]')];
const visual=document.querySelector('[data-product-visual]');
function selectTab(id){tabs.forEach(tab=>{const active=tab.dataset.tab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});panels.forEach(panel=>panel.hidden=panel.dataset.panel!==id);visual.dataset.productVisual=id;visual.querySelector('.stage-number').textContent=`0${id}`;const names={1:'CLOUD MILK',2:'STILL WATER',3:'SOFT SHIELD'};visual.querySelector('.bottle-name').textContent=names[id];visual.querySelector('.bottle-detail').innerHTML=id==='1'?'Barrier essence<br>100 ml':id==='2'?'Recovery serum<br>30 ml':'Comfort cream<br>50 ml'}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab.dataset.tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=event.key==='ArrowRight'?(index+1)%tabs.length:(index-1+tabs.length)%tabs.length;selectTab(tabs[next].dataset.tab);tabs[next].focus()})});

const quiz=document.querySelector('[data-quiz]');
const progress=document.querySelector('[data-progress]');
function showQuizStep(step){quiz.querySelectorAll('[data-quiz-step]').forEach(el=>el.hidden=el.dataset.quizStep!==String(step));progress.style.width=`${step*33.333}%`}
document.querySelectorAll('[data-open-quiz]').forEach(button=>button.addEventListener('click',()=>{showQuizStep(1);quiz.showModal()}));
document.querySelector('[data-close-quiz]').addEventListener('click',()=>quiz.close());
quiz.addEventListener('click',event=>{if(event.target===quiz)quiz.close()});
quiz.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>showQuizStep(Number(button.dataset.answer)+1)));
document.querySelector('[data-quiz-shop]').addEventListener('click',()=>{quiz.close();document.querySelector('#ritual').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});

const toast=document.querySelector('[data-toast]');let toastTimer;
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{const count=document.querySelector('.bag-button span');count.textContent=String(Number(count.textContent)+1);document.querySelector('.bag-button').setAttribute('aria-label',`Shopping bag, ${count.textContent} item${count.textContent==='1'?'':'s'}`);toast.textContent=`${button.dataset.add} added to your ritual`;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}));

document.querySelector('[data-newsletter]').addEventListener('submit',event=>{event.preventDefault();const status=document.querySelector('[data-newsletter-status]');status.textContent='You’re on the list. Welcome to a softer kind of skincare.';event.currentTarget.reset()});
