const menuButton=document.querySelector('.menu-button');
const mobileNav=document.querySelector('#mobile-nav');
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));mobileNav.hidden=open;});
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');}));

const openings={Today:4,Tuesday:6,Wednesday:8,Thursday:5,Friday:3,Saturday:2};
document.querySelectorAll('.date').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.date').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  const day=button.dataset.day;
  document.querySelector('#availability-title').textContent=`${openings[day]} openings ${day==='Today'?'today':day}`;
}));
document.querySelectorAll('.times button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.times button').forEach(item=>{item.classList.remove('selected');item.setAttribute('aria-pressed','false');});
  button.classList.add('selected');
  button.setAttribute('aria-pressed','true');
}));
