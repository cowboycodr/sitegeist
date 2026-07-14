const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open);});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals=document.querySelectorAll('.reveal');
if(reduce||!('IntersectionObserver' in window)){reveals.forEach(el=>el.classList.add('visible'));}else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});reveals.forEach(el=>observer.observe(el));}
document.querySelector('.copy-email')?.addEventListener('click',async event=>{const button=event.currentTarget;const email=button.dataset.email;try{await navigator.clipboard.writeText(email);button.querySelector('span').textContent='Copied';}catch{button.querySelector('span').textContent='Select email';}setTimeout(()=>{button.querySelector('span').textContent='Copy';},2200);});
