(()=>{
  'use strict';
  const section=document.querySelector('.stack-showcase'),rail=document.querySelector('#stack-rail'),track=document.querySelector('#stack-track'),toggle=document.querySelector('#stack-pause');
  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const providers=window.WBProviders;
  const items=providers.catalog.map(p=>'<li class="stack-provider stack-'+p.style+'"><div class="stack-provider-art">'+providers.image(p,'stack')+'</div><span>'+p.name+'</span><small>'+p.category+'</small></li>').join('');
  track.innerHTML='<ul class="stack-group" aria-label="Software and AI in my working stack">'+items+'</ul><ul class="stack-group stack-duplicate" aria-hidden="true">'+items+'</ul>';
  let paused=!!media?.matches;
  function paint(){section.classList.toggle('stack-paused',paused||!!media?.matches||document.hidden);toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=media?.matches?'Scroll to browse':paused?'▶ Resume rotation':'Ⅱ Pause & browse';toggle.disabled=!!media?.matches}
  toggle.onclick=()=>{paused=!paused;paint()};
  media?.addEventListener?.('change',()=>{paused=!!media.matches;paint()});
  document.addEventListener('visibilitychange',paint);
  rail.addEventListener('pointerdown',()=>{paused=true;paint()});
  rail.addEventListener('keydown',()=>{paused=true;paint()});
  if(window.IntersectionObserver){const observer=new window.IntersectionObserver(entries=>{section.classList.toggle('stack-offscreen',!entries[0].isIntersecting)},{rootMargin:'120px'});observer.observe(section)}
  paint();
})();
