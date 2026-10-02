(()=>{
  'use strict';
  const field=document.querySelector('#own-idea'),question=document.querySelector('#rotating-question'),toggle=document.querySelector('#pause-examples'),ghost=document.querySelector('#prompt-ghost'),text=document.querySelector('#prompt-ghost-text');
  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const examples=[
    ['What’s getting in the way?','We finish the job in Simpro, then spend hours turning it into an invoice in Xero. What if that happened for us?'],
    ['Are enquiries slipping through?','Customer requests land in Outlook. Could AI prepare the reply and keep the whole team in the loop?'],
    ['Chasing paperwork again?','Our new starter is ready. The paperwork isn’t. Could one update tell us exactly what is missing?'],
    ['Where is the profit going?','The figures are in Xero and Excel. Show me which jobs need attention before the month is over.'],
    ['Can’t find the answer?','The answer is somewhere in SharePoint. Could our team just ask a question and find the right source?'],
    ['Typing the same thing twice?','Our team copies the same details across three systems. What if the information followed the work?']
  ];
  let index=0,count=0,phase='typing',timer=null,paused=!!media?.matches;
  function clear(){clearTimeout(timer);timer=null}
  function blocked(){return paused||media?.matches||document.hidden||document.activeElement===field||field.value.trim().length>0}
  function display(){question.textContent=examples[index][0];text.textContent=examples[index][1].slice(0,count);ghost.hidden=document.activeElement===field||field.value.trim().length>0||!!media?.matches||(paused&&count===0);ghost.classList.toggle('typing-paused',paused);field.setAttribute('placeholder',ghost.hidden?examples[index][1]:'')}
  function schedule(delay=55){clear();if(!blocked())timer=setTimeout(tick,delay)}
  function tick(){if(blocked()){clear();return}const sentence=examples[index][1];let delay=32;
    if(phase==='typing'){count=Math.min(sentence.length,count+1);if(count===sentence.length){phase='hold';delay=3400}else delay=/[,.?]/.test(sentence[count-1])?190:34}
    else if(phase==='hold'){phase='deleting';delay=30}
    else if(phase==='deleting'){count=Math.max(0,count-2);delay=19;if(count===0){phase='gap';delay=400}}
    else{index=(index+1)%examples.length;phase='typing';delay=100}
    display();schedule(delay)
  }
  function paint(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume typing examples':'Pause typing examples');toggle.innerHTML=(paused?'▶':'Ⅱ')+' <span>'+(paused?'Resume examples':'Pause examples')+'</span>';toggle.disabled=!!media?.matches||field.value.trim().length>0;display()}
  function freeze(){clear();paused=true;paint()}
  field.addEventListener('focus',freeze);field.addEventListener('input',freeze);field.addEventListener('blur',display);
  document.querySelector('#own-form').addEventListener('submit',freeze);
  document.querySelectorAll('[data-idea]').forEach(b=>b.addEventListener('click',freeze));
  toggle.onclick=()=>{paused=!paused;paint();schedule()};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();else schedule()});
  media?.addEventListener?.('change',()=>{if(media.matches)freeze();else paint()});
  document.querySelector('#idea-reset').addEventListener('click',()=>{index=0;count=0;phase='typing';freeze()});
  paint();schedule(450);
})();
