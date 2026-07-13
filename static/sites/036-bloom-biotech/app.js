const nav=document.querySelector('.nav-shell');
const menu=document.querySelector('.menu');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
const email=document.querySelector('.email');
email.addEventListener('click',async()=>{const status=document.querySelector('.copy-status');try{await navigator.clipboard.writeText(email.dataset.email);status.textContent='Email copied to clipboard'}catch{status.textContent='Email: hello@bloom.bio'}});
