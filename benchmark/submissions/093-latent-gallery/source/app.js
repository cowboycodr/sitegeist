(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.querySelector('#artwork');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, raf = 0, pointer = { x: .72, y: .45 };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function field(t = 0) {
    ctx.clearRect(0, 0, w, h);
    const mobile = w < 700;
    const cx = w * (mobile ? .63 : pointer.x), cy = h * pointer.y;
    ctx.globalCompositeOperation = 'lighter';
    const colors = ['#dfff3f', '#ff563e', '#6753ff'];
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      const count = 150;
      for (let i = 0; i <= count; i++) {
        const a = (i / count) * Math.PI * 2;
        const pulse = Math.sin(a * (3 + layer) + t * (.0003 + layer * .00008)) * (24 + layer * 6);
        const r = Math.min(w, h) * (.19 + layer * .065) + pulse;
        const x = cx + Math.cos(a) * r * (1.1 + .14 * Math.sin(t * .00021));
        const y = cy + Math.sin(a) * r * (.72 + .1 * Math.cos(t * .00017)) + Math.sin(a * 7 - t * .0004) * 15;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = colors[layer]; ctx.lineWidth = layer === 0 ? 1.4 : .8; ctx.globalAlpha = .68;
      ctx.stroke();
      ctx.globalAlpha = .035; ctx.fillStyle = colors[layer]; ctx.fill();
    }
    ctx.globalAlpha = .28;
    for (let i = 0; i < 44; i++) {
      const a = i * 2.399 + t * .00003;
      const r = Math.sqrt(i / 44) * Math.min(w, h) * .44;
      const x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * .8;
      ctx.fillStyle = colors[i % 3]; ctx.fillRect(x, y, i % 7 === 0 ? 3 : 1, i % 7 === 0 ? 3 : 1);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (!reduce) raf = requestAnimationFrame(field);
  }
  function initHero() { cancelAnimationFrame(raf); resize(); field(0); }
  addEventListener('resize', initHero, { passive: true });
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    pointer.x += ((e.clientX-r.left)/r.width-pointer.x)*.08;
    pointer.y += ((e.clientY-r.top)/r.height-pointer.y)*.08;
  }, { passive: true });
  initHero();

  document.querySelectorAll('.mini-canvas').forEach(el => {
    const c = el.getContext('2d'), seed = +el.dataset.seed;
    const dpr = Math.min(devicePixelRatio || 1, 2), width = el.clientWidth, height = el.clientHeight;
    el.width = width*dpr; el.height = height*dpr; c.scale(dpr,dpr);
    c.fillStyle = seed === 27 ? '#6b55f6' : seed === 42 ? '#ff6246' : '#121310'; c.fillRect(0,0,width,height);
    c.globalCompositeOperation='lighter';
    for(let i=0;i<90;i++){
      const a=i*.43+seed, r=(i/90)*Math.min(width,height)*.47;
      const x=width/2+Math.cos(a)*r*(seed===11?.65:1), y=height/2+Math.sin(a)*r;
      c.beginPath(); c.arc(x,y,2+(i%9)*.75,0,Math.PI*2);
      c.fillStyle=i%3===0?'#dfff3f':i%3===1?'#ff765f':'#8a79ff'; c.globalAlpha=.18+(i%5)*.08; c.fill();
    }
    c.globalCompositeOperation='source-over'; c.globalAlpha=.7; c.strokeStyle='#f4f1e8'; c.lineWidth=.65;
    for(let i=0;i<14;i++){c.beginPath();for(let j=0;j<80;j++){const x=j/79*width,y=height/2+Math.sin(j*.14+i*.55+seed)*height*.13+(i-7)*height*.025;j?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
  });
})();
