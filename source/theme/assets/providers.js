(()=>{
  'use strict';
  const entries=[
    ['simpro','Simpro','Jobs & projects',['simpro'],'icon'],
    ['xero','Xero','Accounting',['xero'],'icon'],
    ['airtable','Airtable','Connected data',['airtable'],'icon'],
    ['outlook','Outlook','Email',['outlook'],'icon'],
    ['teams','Teams','Team collaboration',['teams'],'icon'],
    ['sharepoint','SharePoint','Business knowledge',['sharepoint'],'icon'],
    ['excel','Excel','Numbers & analysis',['excel'],'icon'],
    ['employmenthero','Employment Hero','People & payroll',['employment hero','employmenthero'],'icon'],
    ['myob','MYOB','Accounting',['myob'],'name'],
    ['mitti','Mitti','Business context',['mitti'],'name'],
    ['n8n','n8n','Automation',['n8n'],'wordmark'],
    ['zapier','Zapier','Automation',['zapier'],'wordmark'],
    ['jotform','Jotform','Forms & intake',['jotform'],'wordmark'],
    ['openai','ChatGPT / OpenAI','AI & reasoning',['openai','chatgpt'],'icon'],
    ['claude','Claude / Anthropic','AI & reasoning',['anthropic','claude'],'icon'],
    ['openrouter','OpenRouter','Model access',['openrouter'],'icon'],
    ['huggingface','Hugging Face','Open-source model ecosystem',['hugging face','huggingface'],'icon']
  ];
  const catalog=entries.map(([id,name,category,aliases,style])=>({id,name,category,aliases,style,src:style==='name'?null:(window.WBWordPress.assets+'/brand-assets/')+(id==='simpro'?'simpro-icon.png':id+'.svg')}));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function find(text){const value=String(text).toLowerCase();return catalog.filter(p=>p.aliases.some(a=>value.includes(a)))}
  function image(p,mode='node'){
    const src=p.id==='jotform'&&mode==='node'?(window.WBWordPress.assets+'/brand-assets/jotform-icon.svg'):p.src;
    return src?'<img class="provider-logo provider-'+p.id+'" src="'+src+'" alt="'+esc(p.name)+'" width="40" height="40" decoding="async">':'<span class="provider-name">'+esc(p.name)+'</span>';
  }
  function nodeMarkup(text){const matches=find(text).filter(p=>p.src&&p.style!=='wordmark'||p.id==='jotform');return matches.length?'<span class="provider-marks '+(matches.length>1?'provider-pair':'')+'">'+matches.map(p=>image(p)).join('')+'</span>':''}
  window.WBProviders={catalog,find,image,nodeMarkup};
})();
