(()=>{
  'use strict';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(el,config){
    const steps=['What arrives','What happens','What moves next'];let selected=0;
    function paint(){
      const links=selected===0?config.incoming:selected===2?config.outgoing:[];
      el.innerHTML='<div class="backstage-nav" role="group" aria-label="Explore behind the scenes">'+steps.map((label,i)=>'<button type="button" data-backstage-stage="'+i+'" aria-pressed="'+(selected===i)+'"><span>0'+(i+1)+'</span>'+label+'</button>').join('')+'</div><div class="backstage-stage stage-'+selected+'"><div class="backstage-orbit" aria-hidden="true"><i></i><b>'+esc(selected===0?'↓':selected===1?config.symbol:'↗')+'</b><i></i></div><span class="backstage-kicker">'+esc(selected===0?'THE STARTING POINT':selected===1?config.role:'THE HANDOVER')+'</span>'+(selected===0?'<dl class="backstage-facts">'+config.facts.map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>':selected===1?'<p class="backstage-explanation">'+esc(config.action)+'</p>':'<div class="backstage-evidence"><span>'+esc(config.evidenceLabel||'CURRENT SAMPLE')+'</span><p>'+esc(config.evidence)+'</p></div>')+(links.length?'<div class="backstage-links"><span>'+ (selected===0?'Connected inputs':'Explore a connected next step')+'</span>'+links.map(n=>'<button type="button" data-backstage-jump="'+esc(n.id)+'">'+esc(n.label)+' <b aria-hidden="true">↗</b></button>').join('')+'</div>':selected===0?'<p class="backstage-caption">This is where this part of the journey starts.</p>':selected===2?'<p class="backstage-caption">The result stays ready for the next business decision.</p>':'')+'</div><div class="backstage-foot"><p>'+esc(config.note)+'</p><button type="button" class="text-button" data-backstage-next>'+ (selected<2?'Follow this step →':'Explore again ↺')+'</button></div>';
      el.querySelectorAll('[data-backstage-stage]').forEach(b=>b.onclick=()=>{selected=+b.dataset.backstageStage;paint();el.querySelector('[data-backstage-stage="'+selected+'"]').focus({preventScroll:true})});
      el.querySelectorAll('[data-backstage-jump]').forEach(b=>b.onclick=()=>{config.onJump(b.dataset.backstageJump);el.querySelector('[data-backstage-stage="0"]').focus({preventScroll:true})});
      el.querySelector('[data-backstage-next]').onclick=()=>{selected=(selected+1)%3;paint();el.querySelector('[data-backstage-next]').focus({preventScroll:true})};
    }
    paint();
  }
  window.WBBackstage={mount};
})();
