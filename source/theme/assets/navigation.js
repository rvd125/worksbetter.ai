(()=>{
 const nav=document.querySelector('nav[aria-label="Main navigation"]');
 if(nav){
  let guides=[...nav.querySelectorAll('a')].find(link=>{try{const url=new URL(link.href,location.href);return url.origin===location.origin&&url.pathname.replace(/\/+$/,'')==='/guides'}catch{return false}});
  if(!guides){
   guides=document.createElement('a');
   guides.href='/guides/';
   guides.textContent='Guides';
   const yourIdea=[...nav.querySelectorAll('a')].find(link=>link.getAttribute('href')==='#your-idea');
   nav.insertBefore(guides,yourIdea||null);
  }
  guides.classList.add('guide-nav-link');
  const setGuidesMobile=()=>{
   const isMobile=window.matchMedia('(max-width:600px)').matches;
   guides.style.display=isMobile?'inline-flex':'';
   guides.style.alignItems=isMobile?'center':'';
   guides.style.minHeight=isMobile?'44px':'';
   guides.style.fontSize=isMobile?'14px':'';
   guides.style.whiteSpace=isMobile?'nowrap':'';
  };
  setGuidesMobile();
  window.matchMedia('(max-width:600px)').addEventListener('change',setGuidesMobile);
 }
 const menu=document.querySelector('.examples-menu');
 if(!menu)return;
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 document.addEventListener('click',event=>{if(!menu.contains(event.target)||event.target.closest('a'))menu.open=false;});
})();