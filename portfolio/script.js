// Starfield: clean implementation with frequent thin colored shooting streaks
(function(){
  // Ensure browser restores scroll position on navigation/refresh instead of forcing to top.
  try{
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  }catch(e){ /* ignore in restricted environments */ }
  // support multiple canvas IDs: prefer existing `space-canvas`, fall back to `sky` used in the template
  let canvas = document.getElementById('space-canvas');
  if(!canvas) canvas = document.getElementById('sky');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  // w/h track the canvas size in CSS pixels (user space). The backing store
  // will be sized to CSS * devicePixelRatio for crisp rendering.
  let w = innerWidth;
  let h = innerHeight;
  let mx = 0.5, my = 0.5; // normalized mouse position

  const stars = [];
  const shooting = [];

  const palette = [
    'rgba(108,70,255,1)',
    'rgba(109,227,255,1)',
    'rgba(154,230,255,1)',
    'rgba(154,230,180,1)'
  ];

  const rand = (a,b)=> Math.random()*(b-a)+a;

  function createStars(count = Math.floor((w*h)/4200)){
    stars.length = 0;
    for(let i=0;i<count;i++){
      const r = Math.random()*1.8 + 0.3;
      const alpha = Math.random()*0.9 + 0.05;
      const c = (Math.random() < 0.12) ? [210,230,255] : [255,255,255];
      // small jitter/orbital motion around a fixed base position
      const baseX = Math.random()*w;
      const baseY = Math.random()*h;
      const jx = rand(0.2, 1.4); // horizontal jitter radius (smaller)
      const jy = rand(0.2, 1.4); // vertical jitter radius (smaller)
      const jSpeed = rand(0.00008, 0.0012); // much slower jitter speed
      const jPhase = rand(0, Math.PI*2);
      // pulse/twinkle slower as well
      const tw = Math.random()*0.004 + 0.0004;
      stars.push({ baseX, baseY, r, baseR: r, alpha, tw, color: c, jx, jy, jSpeed, jPhase, drawX: baseX, drawY: baseY });
    }
  }

  // Shooting-star model (trail of points, tapered gradient, head glow)
  function spawnStreak(){
    // choose a spawn strategy similar to the user's sample: mostly top-to-down-right with some side spawns
    const pick = Math.random();
    let x, y, angle;
    if(pick < 0.6){
      x = Math.random()*w; y = Math.random()*h*0.2; // near top
      angle = (Math.PI/3) + (Math.random()-0.5) * 0.7; // down-right with variance
    } else if(pick < 0.8){
      x = -20; y = Math.random()*h*0.7; angle = (Math.PI/4) + (Math.random()-0.5)*0.6; // left edge in
    } else {
      x = w + 20; y = Math.random()*h*0.7; angle = (Math.PI*3/4) + (Math.random()-0.5)*0.6; // right edge in
    }

    // speed scales with viewport but kept modest for calmer feel
    const speedBase = (Math.min(w,h) / 900) * rand(0.35, 0.95);
    const vx = Math.cos(angle) * speedBase;
    const vy = Math.sin(angle) * speedBase;
    const length = rand(60, 160);
    const ttl = rand(700, 1400);
    shooting.push({ x, y, vx, vy, length, life:0, ttl, trail: [] });
  }

  // control spawning frequency (ms between spawns, randomized)
  let lastSpawn = 0;

  function update(dt){
    // stars: pulse radius & drift. reduced parallax effect
    const now = Date.now();
    for(const s of stars){
      const pulse = 0.7 + Math.abs(Math.sin(now * s.tw * 0.5)) * 1.6; // 0.7..2.3
      s.r = s.baseR * pulse;
      s.alpha = Math.max(0.06, Math.min(1, s.alpha + Math.sin(now * s.tw * 0.3) * 0.01));
      // jitter/orbital motion around base position (no long-term drift)
      const t = now;
      s.drawX = s.baseX + Math.cos(t * s.jSpeed + s.jPhase) * s.jx;
      s.drawY = s.baseY + Math.sin(t * s.jSpeed + s.jPhase) * s.jy;
      // parallax: very small influence
      s.px = (mx - 0.5) * 4 * (s.r/1.8);
      s.py = (my - 0.5) * 3 * (s.r/1.8);
    }

    // shooting stars update
    for(let i = shooting.length-1; i >= 0; i--){
      const st = shooting[i];
      st.life += dt;
      st.x += st.vx * dt;
      st.y += st.vy * dt;
      // push trail points
      // push current point
      st.trail.push({ x: st.x, y: st.y, t: st.life });
      // densify trail by interpolating points between last and previous if gap is large
      if(st.trail.length > 1){
        const lastIdx = st.trail.length - 1;
        const prev = st.trail[lastIdx - 1];
        const cur = st.trail[lastIdx];
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        const dist = Math.hypot(dx, dy);
        const maxStep = 3; // px between interpolated points (smaller => denser)
        if(dist > maxStep){
          const steps = Math.min(32, Math.floor(dist / maxStep));
          // insert evenly spaced intermediate points between prev and cur
          for(let k = 1; k <= steps; k++){
            const tfrac = k / (steps + 1);
            const ix = prev.x + dx * tfrac;
            const iy = prev.y + dy * tfrac;
            // insert before the last element
            st.trail.splice(lastIdx, 0, { x: ix, y: iy, t: st.life });
          }
        }
      }
      // limit length
      if(st.trail.length > 64) st.trail.splice(0, st.trail.length - 64);
      // removal if expired or far off-screen
      if(st.life > st.ttl || st.x < -220 || st.x > w + 220 || st.y < -220 || st.y > h + 220) shooting.splice(i,1);
    }

    // spawn logic: reduced spawn frequency
    if(now - lastSpawn > rand(1200, 4200)){
      const burst = (Math.random() < 0.04) ? Math.floor(rand(2,3)) : 1;
      for(let i=0;i<burst;i++) spawnStreak();
      lastSpawn = now;
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    // subtle vignette (DISABLED FOR DEBUG)
    // Temporarily disable the radial vignette fill to determine whether the repeating
    // vertical band the user sees is coming from this canvas overlay. Commented out
    // the original code so it can be restored easily after testing.
    /*
    const g = ctx.createRadialGradient(w*0.15,h*0.18,10,w*0.5,h*0.5,Math.max(w,h));
    // make vignette subtle: center mostly transparent, edges softly dark (avoid heavy opaque band)
    g.addColorStop(0,'rgba(20,26,34,0.02)');
    g.addColorStop(0.6,'rgba(6,8,10,0.18)');
    g.addColorStop(1,'rgba(0,0,0,0.60)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    */

    // draw stars (use jittered draw positions)
    for(const s of stars){
      const [r,gc,b] = s.color;
      const cr = Math.max(0.45, s.r * 0.45);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(${r},${gc},${b},${Math.max(0.16, s.alpha)})`;
      const drawX = (s.drawX !== undefined) ? s.drawX : s.baseX;
      const drawY = (s.drawY !== undefined) ? s.drawY : s.baseY;
      ctx.beginPath(); ctx.arc(drawX + (s.px||0), drawY + (s.py||0), cr, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // draw shooting stars (trail segments + head)
    for(const st of shooting){
      // draw trail segments from oldest to newest
      for(let j=0;j<st.trail.length-1;j++){
        const p1 = st.trail[j];
        const p2 = st.trail[j+1];
        const frac = j / st.trail.length;
        const grad = ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);
        grad.addColorStop(0, `rgba(255,255,230,${0.0 * (1-frac)})`);
        grad.addColorStop(0.5, `rgba(89,176,255,${0.10*(1-frac)})`);
        grad.addColorStop(1, `rgba(255,255,230,${0.75*(1-frac)})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (1.0 * (1-frac)) + 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      }
      // head glow
      const headAlpha = Math.max(0, 1 - st.life / st.ttl);
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,230,${Math.min(1, headAlpha)})`; ctx.arc(st.x, st.y, 2.4 + (1.4*headAlpha), 0, Math.PI*2); ctx.fill();
    }
  }

  // custom cursor: only attach if element present and device supports fine pointer
  const cursor = document.getElementById('custom-cursor');
  if(cursor && window.matchMedia && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    // We'll do a slight eased follow to reduce jitter and keep CSS animations smooth.
    let targetX = null, targetY = null;
    let curX = 0, curY = 0;
    function setTarget(e){
      if(e.clientX < 0 || e.clientY < 0 || e.clientX > window.innerWidth || e.clientY > window.innerHeight){
        cursor.style.opacity = '0';
        targetX = null; targetY = null; return;
      }
      targetX = e.clientX; targetY = e.clientY; cursor.style.opacity = '1';
    }
    window.addEventListener('mousemove', setTarget);
    window.addEventListener('pointermove', setTarget);

    // gentle smoothing loop
    (function followLoop(){
      if(targetX !== null && targetY !== null){
        curX += (targetX - curX) * 0.28; curY += (targetY - curY) * 0.28;
        cursor.style.left = Math.round(curX) + 'px'; cursor.style.top = Math.round(curY) + 'px';
      }
      requestAnimationFrame(followLoop);
    })();
    window.addEventListener('mouseleave', ()=> cursor.style.opacity = '0');
    window.addEventListener('mouseenter', ()=> cursor.style.opacity = '1');
    // hide cursor when pointer leaves the document (pointerleave) or mouseout to null
    document.addEventListener('pointerleave', ()=>{ cursor.style.opacity = '0'; });
    window.addEventListener('mouseout', (ev)=>{ if(!ev.relatedTarget) cursor.style.opacity = '0'; });
    // also handle visibility change (tab switches)
    document.addEventListener('visibilitychange', ()=>{ if(document.hidden) cursor.style.opacity = '0'; else cursor.style.opacity = '1'; });
    // hide cursor when window loses focus, show when focused
    window.addEventListener('blur', ()=> cursor.style.opacity = '0');
    window.addEventListener('focus', ()=> cursor.style.opacity = '1');
  }

  // helper to reset shooting stars
  function resetStreaks(){ shooting.length = 0; lastSpawn = Date.now() + 80; }
  window.resetShootingStars = resetStreaks;

  let last = performance.now();
  function loop(now){ const dt = now - last; last = now; update(dt); draw(); requestAnimationFrame(loop); }

  function resize(){
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    // compute CSS size to cover the full document (so canvas doesn't exceed the body)
    const cssW = document.documentElement.clientWidth || window.innerWidth;
    const cssH = Math.max(document.documentElement.scrollHeight || 0, window.innerHeight);
    // set CSS size so the canvas element fills the document area
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    // set backing store size for crisp rendering
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    // set transform so drawing coordinates are in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // keep w/h as CSS pixels for drawing math elsewhere
    w = cssW;
    h = cssH;
    // seed stars density based on CSS area
    createStars(Math.floor((w * h) / 4200));
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e)=>{ mx = e.clientX / Math.max(1, w); my = e.clientY / Math.max(1, h); });

  // size canvas for current DPR and seed stars
  resize(); requestAnimationFrame(loop);
  // initial burst to make effect visible immediately
  for(let i=0;i<6;i++){ setTimeout(spawnStreak, i*120); }

  // Note: do not force scroll-to-top on load; respect browser default behavior.

  // Smooth travel animation: spawn a small orb when CTA buttons are clicked that flies to the target.
  (function(){
    function createOrb(){
      const o = document.createElement('div'); o.className = 'travel-orb'; document.body.appendChild(o); return o;
    }

    function flyOrbFromTo(orb, fromRect, toRect, cb){
      // place at center of source
      const startX = fromRect.left + fromRect.width/2;
      const startY = fromRect.top + fromRect.height/2;
      const endX = toRect.left + toRect.width/2;
      const endY = toRect.top + toRect.height/2;
      orb.style.left = startX + 'px'; orb.style.top = startY + 'px'; orb.style.opacity = '1';
      // force layout then set destination
      requestAnimationFrame(()=>{
        orb.classList.add('in-flight');
        orb.style.left = endX + 'px'; orb.style.top = endY + 'px';
        orb.style.transform = 'translate(-50%,-50%) scale(0.6)';
        // cleanup after transition
        setTimeout(()=>{
          orb.style.opacity = '0';
          orb.remove();
          if(cb) cb();
        }, 760);
      });
    }

    // attach to hero CTA links that have a hash target
    document.addEventListener('click', (e)=>{
      const a = e.target.closest('.cta-row a[href^="#"]');
      if(!a) return;
      const href = a.getAttribute('href');
      if(!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if(!target) return;
      e.preventDefault();
      const orb = createOrb();
      const fromRect = a.getBoundingClientRect();
      const toRect = target.getBoundingClientRect();
      // scroll smoothly to the target while orb flies (start scroll immediately)
      target.scrollIntoView({behavior:'smooth', block:'start'});
      flyOrbFromTo(orb, fromRect, toRect);
    }, {passive:false});
  })();

  // Fallback enforcement: for stubborn cases where the native cursor reappears due to other styles
  // or UA behavior, apply an inline style to hide the cursor on fine-pointer devices and persist it
  // with a MutationObserver. This is intentionally conservative and only enabled when the device
  // reports a fine pointer and the user hasn't requested reduced motion.
  try{
    if(window.matchMedia && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      const applyHide = ()=>{
        try{
          // 1) inline hide for root/body
          document.documentElement.style.cursor = 'none';
          if(document.body) document.body.style.cursor = 'none';
          // 2) insert a style element that forces cursor:none !important (broad fallback)
          if(!document.getElementById('__force_hide_cursor_style')){
            const s = document.createElement('style');
            s.id = '__force_hide_cursor_style';
            // include html/body, all elements, and pseudo-elements to cover cases where
            // content is rendered outside <body> or pseudo-elements show a cursor.
            s.textContent = `html, body, * { cursor: none !important; }
*::before, *::after { cursor: none !important; }`;
            (document.head || document.documentElement).appendChild(s);
          }
          // 3) apply inline cursor:none to all existing elements (brute-force)
          try{ Array.from(document.querySelectorAll('*')).forEach(el=>{ if(el && el.style) el.style.cursor = 'none'; }); }catch(e){}
        }catch(e){}
      };
      applyHide();
      const mo = new MutationObserver((mut)=>{
        // reapply to any new nodes or attribute changes
        for(const m of mut){
          if(m.type === 'childList'){
            m.addedNodes && m.addedNodes.forEach(n => { try{ if(n.nodeType===1){ (n.style && (n.style.cursor='none')); Array.from(n.querySelectorAll? n.querySelectorAll('*') : []).forEach(el=> el.style && (el.style.cursor='none')); } }catch(e){} });
          }
          if(m.type === 'attributes' && m.target && m.target.style){ try{ m.target.style.cursor = 'none'; }catch(e){} }
        }
      });
      mo.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
      // reapply on focus/visibility events
      window.addEventListener('focus', applyHide);
      document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) applyHide(); });
  // Keep observer active for the page lifetime to cover elements injected later.
  // Disconnect when the page unloads to avoid leaks.
  window.addEventListener('beforeunload', ()=> mo.disconnect());
    }
  }catch(e){/* ignore */}

  // Observe project cards and trigger crash animation when they enter the viewport.
  // Use IntersectionObserver where available, but also run a scroll/viewport fallback using
  // getBoundingClientRect so transforms don't confuse the trigger.
  (function(){
    try{
      const projects = Array.from(document.querySelectorAll('.project'));
      if(!projects.length) return;
      // remove any existing animation classes so animations can re-run and set deterministic sides
      // remove the js-hidden guard so CSS transitions and visibility/opacity can take over
      const grid = document.querySelector('.projects-grid');
      if(grid && grid.classList.contains('js-hidden')) grid.classList.remove('js-hidden');
      projects.forEach((p, idx)=>{
        p.classList.remove('crash','in-view','from-left','from-right');
        // alternate sides deterministically by index
        p.classList.add((idx % 2 === 0) ? 'from-left' : 'from-right');
      });

      function triggerInView(el){
        if(el.classList.contains('in-view')) return;
        // ensure side class exists; it was set deterministically above
        requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add('in-view')));
      }

      const supportsIO = 'IntersectionObserver' in window;
      let io = null;
  // Unified threshold (fraction) for show/hide
  const VISIBILITY_THRESHOLD = 0.60; // show when >= 60%, hide when < 60%
      if(supportsIO){
        // Use multiple thresholds to get a reasonable intersectionRatio reading
        io = new IntersectionObserver((entries)=>{
          for(const ent of entries){
            const ratio = ent.intersectionRatio;
            const el = ent.target;
            if(ratio >= VISIBILITY_THRESHOLD){
              const delay = Math.random()*300; setTimeout(()=> triggerInView(el), delay);
            } else {
              // hide (slide out) when below threshold
              el.classList.remove('in-view');
            }
          }
        }, { threshold: [0, 0.05, 0.12, 0.18, 0.25, 0.4, VISIBILITY_THRESHOLD, 0.75] });
        projects.forEach(p=> io.observe(p));
      }

      // Fallback / reinforcement: check bounding rect on scroll/resize and trigger if visible
      let ticking = false;
      function checkProjects(){
        for(const p of projects){
          const r = p.getBoundingClientRect();
          const height = Math.max(1, r.height);
          // compute fraction visible vertically
          const visibleTop = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
          const frac = visibleTop / height;
          // unified threshold: show when >= VISIBILITY_THRESHOLD, hide when < VISIBILITY_THRESHOLD
          if(frac >= VISIBILITY_THRESHOLD && !p.classList.contains('in-view')){
            const delay = Math.random()*300; setTimeout(()=> triggerInView(p), delay);
          }
          if(frac < VISIBILITY_THRESHOLD && p.classList.contains('in-view')){
            p.classList.remove('in-view');
          }
        }
        ticking = false;
      }
      function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(checkProjects); } }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);

      // initial check after a short delay to allow any native restore to finish
      setTimeout(()=>{ onScroll(); checkProjects(); }, 150);
    }catch(e){ /* ignore in older browsers */ }
  })();

  // Ensure the <body> element always covers the full document height.
  // Some scripts/elements can end up outside the body; this helper sets body.minHeight
  // to match documentElement.scrollHeight and keeps it updated on resize and DOM changes.
  (function ensureBodyCovers(){
    try{
      const apply = ()=>{
        const h = Math.max(document.documentElement.scrollHeight || 0, window.innerHeight || 0);
        if(document.body) document.body.style.minHeight = h + 'px';
      };
      let timer = null;
      const debouncedApply = ()=>{ clearTimeout(timer); timer = setTimeout(apply, 80); };
      // initial
      apply();
      window.addEventListener('resize', debouncedApply, { passive: true });
      // watch for DOM changes that affect height
      const mo = new MutationObserver(debouncedApply);
      mo.observe(document.documentElement, { childList:true, subtree:true, attributes:true });
      // cleanup on unload
      window.addEventListener('beforeunload', ()=> mo.disconnect());
      // reapply after a short delay to account for late resources
      setTimeout(apply, 250);
    }catch(e){/* ignore */}
  })();

  // (Button glitch handler removed)
})();

