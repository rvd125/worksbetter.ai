/* /navigation.js */
(()=>{
 // Skip to the main task and transfer keyboard focus, including fragment loads.
 const focusMain=()=>{
  if(location.hash!=='#main-content')return;
  document.getElementById('main-content')?.focus({preventScroll:true});
 };
 document.querySelectorAll('a.skip[href="#main-content"]').forEach(link=>link.addEventListener('click',()=>{
  const main=document.getElementById('main-content');
  if(main){main.focus({preventScroll:true});main.scrollIntoView({block:'start',behavior:'instant'});}
 }));
 window.addEventListener('hashchange',focusMain);
 focusMain();
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

;
/* /measurement.js */
/* Privacy-first interaction measurement. Never sends prompt text, names, email, or business data. */
(() => {
  'use strict';
  const valid = new Set([
    'workflow_view', 'workflow_step_open', 'before_after_toggle', 'system_selected',
    'problem_selected', 'diagnostic_started', 'diagnostic_completed', 'diagnostic_fallback', 'calculator_used',
    'demo_started', 'demo_completed', 'cta_clicked', 'contact_started', 'enquiry_started', 'guide_enquiry_clicked'
  ]);
  const aliases=Object.freeze({demo_start:'demo_started',demo_complete:'demo_completed',contact_open:'contact_started'});
  const history = [];
  let enquiryStarted=false;
  let calculatorUsed = false;
  let contactWorkflow = 'general';

  function cleanWorkflow(value) {
    return new Set(['invoice', 'enquiry', 'finance', 'onboarding', 'routing', 'reporting']).has(value)
      ? value
      : 'general';
  }

  function workflowFor(element) {
    if (!element) return cleanWorkflow(document.body?.getAttribute('data-workflow'));
    return cleanWorkflow(
      element.dataset.system || element.dataset.run || element.dataset.result ||
      element.dataset.preview || element.dataset.impact || element.dataset.scenarios ||
      element.dataset.expand || element.closest?.('[data-workflow]')?.getAttribute('data-workflow') ||
      document.body?.getAttribute('data-workflow')
    );
  }

  function track(name, properties = {}) {
    name=aliases[name]||name;
    if (!valid.has(name)||document.body.classList.contains('logged-in')) return;
    const workflow = cleanWorkflow(properties.workflow);
    if (name === 'contact_started') contactWorkflow = workflow;
    const event = Object.freeze({ event: name, page: document.body.classList.contains('problem-home') ? 'home' : document.body.classList.contains('guide-page') ? 'guide' : cleanWorkflow(document.body?.getAttribute('data-workflow')), workflow });
    history.push(event);
    if (history.length > 100) history.shift();
    window.dispatchEvent(new CustomEvent('wb:measurement', { detail: event }));

    // GA4 receives only the interaction name, workflow category and page category.
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, { workflow: event.workflow, wb_page: event.page });
    }
  }

  window.WBAnalytics = Object.freeze({
    track,
    mode: 'ga4-no-input-content',
    snapshot: () => history.map((event) => ({ ...event })),
    clear: () => { history.length = 0; }
  });

  const pageWorkflow = cleanWorkflow(document.body?.getAttribute('data-workflow'));
  if (pageWorkflow !== 'general') track('workflow_view', { workflow: pageWorkflow });

  document.addEventListener('click', (event) => {
    const target = event.target.closest?.('a,button');
    if (!target) return;
    const workflow = workflowFor(target);

    if (target.closest('.guide-enquiry') && target.matches('a[href]')) {
      const destination = new URL(target.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname === '/' && destination.hash === '#contact') {
        track('guide_enquiry_clicked', { workflow });
        return;
      }
    }
    if (target.dataset.idea) track('problem_selected', { workflow });
                else if (target.dataset.preview || target.dataset.impact) track('before_after_toggle', { workflow });
    else if (target.dataset.inspect || target.dataset.question || target.dataset.next) track('workflow_step_open', { workflow });
    else if (target.id === 'contact-email' || target.getAttribute('href')?.startsWith('mailto:')) track('cta_clicked', { workflow: contactWorkflow });
    else if (target.matches('a[href]') || target.classList.contains('button')) track('cta_clicked', { workflow });
  }, { passive: true });

  document.addEventListener('input', (event) => {
    if(!enquiryStarted&&event.target.closest?.('#enquiry-form')&&!event.target.matches?.('#contact-website')){enquiryStarted=true;track('enquiry_started',{workflow:contactWorkflow});}
    if (!calculatorUsed && event.target.matches?.('#estimate-volume,#estimate-before,#estimate-after')) {
      calculatorUsed = true;
      track('calculator_used', { workflow: workflowFor(event.target) });
    }
  }, { passive: true });

})();

;
/* /workflow-routes.js */
window.WBRoutes = {"invoice": "/simpro-xero-invoice-automation/", "enquiry": "/ai-customer-enquiry-automation/", "finance": "/job-profitability-reporting/", "onboarding": "/employee-onboarding-automation/", "routing": "/lead-routing-automation/", "reporting": "/multi-source-report-automation/"};

;
/* /flow-model.js */
(function(root){
  'use strict';
  function finite(value,label,min,max){const n=Number(value);if(value===''||!Number.isFinite(n)||n<min||n>max)throw new Error(label+' must be between '+min+' and '+max+'.');return n;}
  function invoice(input){
    const hours=finite(input.hours,'Hours',0,1000),rate=finite(input.rate,'Hourly rate',0,10000),materials=finite(input.materials,'Materials',0,1000000),variation=finite(input.variation,'Extra work',0,1000000);
    const included=input.approved===true;
    const lines=[{description:'Labour',quantity:hours,rate,amount:Math.round(hours*rate*100)/100},{description:'Materials',quantity:1,rate:materials,amount:materials}];
    if(included&&variation>0)lines.push({description:'Approved extra work',quantity:1,rate:variation,amount:variation});
    return {kind:'invoice',mode:'simulation',job:'WB-1042',lines,subtotal:Math.round(lines.reduce((v,l)=>v+l.amount,0)*100)/100,needsDecision:variation>0&&!included,excluded:included?0:variation,approved:included,externalAction:false};
  }
  function finance(input){
    const threshold=finite(input.threshold,'Margin threshold',0,100);
    const lines=String(input.csv||'').trim().split(/\r?\n/);if(lines.length<2||lines.length>21)throw new Error('Use a header and between 1 and 20 rows.');
    if(lines.shift().trim().toLowerCase()!=='job,revenue,cost')throw new Error('Use the header: job,revenue,cost');
    const rows=lines.map((line,i)=>{const parts=line.split(',');if(parts.length!==3||!parts[0].trim())throw new Error('Check row '+(i+2)+': use job,revenue,cost.');const revenue=finite(parts[1],'Revenue on row '+(i+2),1,10000000),cost=finite(parts[2],'Cost on row '+(i+2),0,10000000);return {job:parts[0].trim().slice(0,70),revenue,cost,profit:revenue-cost,margin:(revenue-cost)/revenue*100};});
    return {kind:'finance',mode:'simulation',rows,threshold,flagged:rows.filter(r=>r.margin<threshold),revenue:rows.reduce((v,r)=>v+r.revenue,0),profit:rows.reduce((v,r)=>v+r.profit,0),externalAction:false};
  }
  function enquiry(input){
    const message=String(input.message||'').trim().slice(0,2500);if(message.length<8)throw new Error('Add a customer message of at least 8 characters.');
    const tone=['friendly','concise'].includes(input.tone)?input.tone:'friendly';
    const urgent=/urgent|today|asap|tomorrow/i.test(message),camera=/camera|cctv/i.test(message),quote=/quote|price|cost/i.test(message);
    const opening=tone==='friendly'?'Thanks for getting in touch. We’d be happy to understand what you need.':'Thanks for your enquiry.';
    const body=camera?'Please share the site address, areas needing camera coverage and any existing equipment.':'Please share a little more about the work you need and the site address.';
    const timing=urgent?'We’ve noted your requested timing. We’ll need to check availability before confirming.':'Please also let us know your preferred timing.';
    return {kind:'enquiry',mode:'simulation',message,tone,urgent,intent:camera?'Camera installation':quote?'Pricing enquiry':'General service enquiry',reply:opening+'\n\n'+body+' '+timing+'\n\nWith those details, we can discuss the next step.',externalAction:false};
  }
  function onboarding(input){
    const person=String(input.person||'').trim().slice(0,80);if(person.length<2)throw new Error('Add a sample starter name.');
    const role=['Field technician','Office coordinator'].includes(input.role)?input.role:'Field technician';
    const requirements=[['contract','Signed contract'],['induction','Induction record'],...(role==='Field technician'?[['licence','Role licence evidence']]:[])];
    const checks=requirements.map(([key,label])=>({key,label,ready:input[key]==='yes'}));
    const missing=checks.filter(c=>!c.ready).map(c=>c.label);
    return {kind:'onboarding',mode:'simulation',person,role,checks,missing,ready:missing.length===0,externalAction:false};
  }
  function routing(input){
    const message=String(input.message||'').trim().slice(0,1000);if(message.length<8)throw new Error('Add a sample lead request of at least 8 characters.');
    const region=['ACT','NSW','VIC'].includes(input.region)?input.region:'Unknown';
    const capacity=input.capacity==='busy'?'busy':'available',duplicate=input.duplicate==='yes';
    const service=/cabl|network|fibre/i.test(message)?'Cabling':/audio|visual|meeting room|\bav\b/i.test(message)?'Audio visual':'Needs clarification';
    const route=duplicate?'existing':region==='Unknown'||service==='Needs clarification'?'exception':capacity==='busy'?'backup':'primary';
    const owner=route==='existing'?'Existing account owner':route==='exception'?'Sales triage queue':region+' '+service+(route==='backup'?' backup queue':' team');
    const reason=route==='existing'?'An existing lead keeps its recorded ownership.':route==='exception'?'Location or service needs clarification before assignment.':route==='backup'?'The matching team is busy; a backup is recommended.':'The territory and service match an available team.';
    return {kind:'routing',route,owner,reason,message,region,service,capacity,duplicate,action:route==='exception'?'Clarify the missing details':route==='existing'?'Add the enquiry to the existing lead':'Confirm availability and arrange the first contact',externalAction:false};
  }
  function reporting(input){
    const revenue=finite(input.revenue,'Revenue',0,10000000),jobs=finite(input.jobs,'Completed jobs',0,10000),leads=finite(input.leads,'Open leads',0,10000),age=finite(input.age,'Age of accounting extract',0,365);
    if(!Number.isInteger(jobs)||!Number.isInteger(leads)||!Number.isInteger(age))throw new Error('Use whole numbers for counts and extract age.');
    const missing=input.source==='missing',stale=age>7;
    const issues=[...(stale?['Xero extract is '+age+' days old; refresh before relying on the revenue.']:[]),...(missing?['Airtable is unavailable; the lead count has not been supplied.']:[])];
    return {kind:'reporting',revenue,jobs,leads:missing?null:leads,age,missing,stale,issues,complete:issues.length===0,sources:[{name:'Xero',measure:'Recorded revenue · AUD ex GST',value:revenue,status:stale?'Refresh required':age+' day(s) old'},{name:'Simpro',measure:'Completed jobs',value:jobs,status:'Current sample'},{name:'Airtable',measure:'Open leads',value:missing?null:leads,status:missing?'Unavailable':'Current sample'}],externalAction:false};
  }
  function savings(input){
    const volume=finite(input.volume,'Weekly volume',0,10000),before=finite(input.before,'Old process minutes',0,1440),after=finite(input.after,'New process minutes',0,1440);
    return {oldHours:volume*before/60,newHours:volume*after/60,savedHours:volume*(before-after)/60,volume,before,after};
  }
  const api={invoice,finance,enquiry,onboarding,routing,reporting,savings};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WBFlowModel=api;
})(typeof window==='undefined'?{}:window);

;
/* /project-data.js */
window.WBProjects = {
  invoice: {
    name:'Finished job → invoice draft', caption:'The job is done. Why is the invoice still waiting?',
    description:'The challenge: extra work is recorded but not approved. Change the amounts, then decide what belongs on the invoice.',
    stack:['n8n','Webhook','Simpro','Xero','OpenAI'], engine:'n8n + webhook',
    nodes:[['Job completed','Simpro event','SP','auto'],['Read job notes','AI · OpenAI','AI','ai'],['Match the job','Simpro record','SP','tool'],['Calculate lines','Agreed rates','$','auto'],['Separate extra work','Approval rule','↳','auto'],['Approve scope','You decide','','human'],['Prepare invoice','Xero draft','X','auto']],
    positions:[[10,30],[34,30],[25,72],[47,72],[61,30],[75,72],[89,30]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Read the job notes','Find the customer and rates','Re-key invoice lines','Chase extra-work approval','Type the approved changes again'],
    next:['Job completion starts the process','AI extracts the recorded work','Rules calculate and separate extras','You approve the scope once','Approved lines flow into a draft'],
    delay:'The invoice waits in an admin queue before someone re-enters the job.',
    relief:'One recorded job flows through to a draft; only the scope decision waits for you.',
    estimate:{volume:40,before:18,after:4,unit:'jobs / week'},
    effects:['Approved scope retained','Invoice draft prepared','Job reference carried across']
  },
  enquiry: {
    name:'New enquiry → coordinated follow-up',caption:'One enquiry. Three places to update. No clear owner.',
    description:'The challenge: an urgent customer request can be lost between a form, an inbox and the team. Try changing the message or tone.',
    stack:['Zapier','Jotform','Outlook','Airtable','Teams','Anthropic'],engine:'Zapier',
    nodes:[['Enquiry received','Jotform','JF','auto'],['Understand the ask','AI · Anthropic','AI','ai'],['Find missing details','Intake guide','?','tool'],['Check urgency','Timing rule','◷','auto'],['Prepare a response','Outlook draft','O','auto'],['Review the reply','You decide','','human'],['Pass it forward','Airtable + Teams','↳','auto']],
    positions:[[10,25],[35,25],[60,25],[85,25],[85,70],[57,70],[23,70]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Open the form notification','Interpret what the customer needs','Copy details into a lead tracker','Write a reply from scratch','Forward context to the team'],
    next:['The form starts the handover','AI identifies the request','Missing details and urgency are checked','You refine the proposed response','Lead context flows to the team'],
    delay:'The team waits for someone to copy the enquiry out of their inbox.',
    relief:'The same enquiry carries its context into the reply, lead record and team handover.',
    estimate:{volume:30,before:15,after:3,unit:'enquiries / week'},
    effects:['Reply marked ready','Airtable handover prepared','Teams context prepared']
  },
  finance: {
    name:'Scattered figures → a decision',caption:'Revenue looks fine. Which jobs are quietly losing margin?',
    description:'The challenge: account totals hide individual jobs. Change the sample figures and the threshold to test what needs attention.',
    stack:['MCP server','Xero or MYOB','Excel','OpenRouter'],engine:'MCP + controlled tools',
    nodes:[['Ask about margins','Business question','?','auto'],['Read the figures','Xero or MYOB','↔','tool'],['Match each job','Excel context','XL','tool'],['Calculate margins','Explicit calculation','%','auto'],['Explain the signal','AI · OpenRouter','AI','ai'],['Choose what to review','Your judgement','','human'],['Prepare a briefing','Evidence + figures','▥','auto']],
    positions:[[10,48],[31,22],[31,73],[53,48],[74,22],[74,73],[92,48]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Export account figures','Find the matching job spreadsheet','Join and check the rows','Calculate the margins','Build a briefing for the meeting'],
    next:['Start with a business question','Authorised tools provide figures','Job context is matched','Calculations support the AI explanation','You decide what warrants action'],
    delay:'A simple question waits for the next spreadsheet refresh or reporting cycle.',
    relief:'A question starts the analysis. Figures stay attached to the explanation.',
    estimate:{volume:3,before:90,after:15,unit:'briefings / week'},
    effects:['Job evidence retained','Low-margin list prepared','Meeting briefing prepared']
  },
  onboarding: {
    name:'New starter → ready for day one',caption:'A start date is set. Is everything actually ready?',
    description:'The challenge: missing evidence must stop a handover, while completed details should never need to be typed twice. Toggle the sample records.',
    inputs:{person:'Alex Morgan',role:'Field technician',contract:'yes',induction:'no',licence:'yes'},
    stack:['Webhooks','Employment Hero','SharePoint','Teams','Anthropic'],engine:'Webhooks + rules',
    nodes:[['Starter record updated','Employment Hero','EH','auto'],['Understand the role','AI · Anthropic','AI','ai'],['Find the evidence','SharePoint','SP','tool'],['Check requirements','Role checklist','✓','auto'],['Ready or missing?','Evidence rule','↳','auto'],['Confirm the next step','People team','','human'],['Prepare the handover','Teams + checklist','T','auto']],
    positions:[[10,24],[34,24],[60,24],[85,24],[85,73],[58,73],[23,73]],
    edges:[[0,1,1],[1,2,2],[2,3,3],[3,4,4],[4,5,5],[5,6,6]],
    old:['Read the starter notification','Re-type details into a checklist','Hunt through folders for evidence','Chase the missing items','Tell the team what is ready'],
    next:['An update starts the checks','Role context shapes the checklist','Existing evidence is reused','You review readiness or the gaps','A clear handover follows your decision'],
    delay:'A manager waits for another manual checklist update to know what is missing.',
    relief:'An updated record triggers the checks; missing evidence remains visible until resolved.',
    estimate:{volume:4,before:45,after:10,unit:'starters / week'},
    effects:['Starter details retained','Evidence checklist prepared','Teams handover prepared']
  }
};

Object.assign(window.WBProjects,{"routing": {"name": "New lead \u2192 accountable owner", "old": ["Read the incoming lead", "Work out the territory and service", "Check whether someone already owns it", "Ask around for an available person", "Forward the message and update the tracker"], "next": ["A lead starts the intake", "The request is classified", "Rules check existing ownership and capacity", "You confirm the recommended route", "The owner receives context and a next action"], "delay": "A lead waits while the team forwards messages and asks who should take it.", "relief": "The routing reason stays attached to the handover. Exceptions have a queue.", "estimate": {"volume": 35, "before": 12, "after": 3, "unit": "leads / week"}}, "reporting": {"name": "Scattered sources \u2192 management pack", "old": ["Export three systems", "Find the reporting period", "Copy figures into a report", "Chase missing or stale extracts", "Write commentary and circulate the pack"], "next": ["One reporting request starts collection", "Source measures remain separately labelled", "Freshness and availability checks flag gaps", "A narrative is drafted from the supplied evidence", "You review the source-linked report"], "delay": "The meeting pack waits for another spreadsheet export and manual update.", "relief": "The report shows both the evidence available and the information still missing.", "estimate": {"volume": 1, "before": 180, "after": 25, "unit": "reports / week"}}});

;
/* /systems-data.js */
(function(root){
  const node=(id,label,sub,kind,x,y,detail)=>({id,label,sub,kind,x,y,detail});
  const edge=(from,to,kind='flow',label='')=>({from,to,kind,label});
  const systems={
    invoice:{area:'Operations',title:'Turn finished work into an invoice.',promise:'The job carries its context all the way to billing. You decide the exceptions.',type:'A prepared draft with a visible approval',stack:'Simpro · Xero',challenge:'An unapproved variation should not hold the rest of the job hostage.',
      inputs:{hours:12,rate:150,materials:600,variation:180,approved:false},
      nodes:[node('event','Job completed','Recorded job completion','app',90,140,'A completion event brings the job reference and recorded work into the system.'),node('agent','Billing agent','AI interprets the job','agent',330,140,'Reads the job context and proposes invoice lines. The preview uses your sample fields instead of a live model.'),node('model','Interpret the job notes','AI assistance','model',170,330,'The reasoning model supports the agent. Model credentials would stay on the server.'),node('job','Job context','Simpro','tool',325,330,'The source job remains the reference for hours, materials and extra work.'),node('rates','Price calculator','Agreed rates','tool',480,330,'Calculates the recorded hours at the agreed rate. This is arithmetic, not a model guessing a price.'),node('rule','Scope check','Separate the exception','rule',565,140,'Separates unapproved extra work from the base invoice scope.'),node('base','Base scope','Recorded work','app',755,70,'The base scope stays available while you decide on extra work.'),node('human','Review variation','Your decision','human',755,235,'Include the variation or keep it out. Both routes retain the base work.'),node('draft','Invoice draft','Xero · prepared here','app',930,140,'Combines the recorded work with your scope decision into an invoice draft.'),node('audit','Decision record','Scope + reference','tool',930,350,'Keeps the sample job reference alongside the scope decision.')],
      edges:[edge('event','agent'),edge('model','agent','support'),edge('job','agent','support'),edge('rates','agent','support'),edge('agent','rule'),edge('rule','base','flow','base'),edge('rule','human','flow','exception'),edge('base','draft'),edge('human','draft'),edge('draft','audit','support')]
    },
    enquiry:{area:'Customer experience',title:'Answer with the whole business behind you.',promise:'An enquiry meets your service knowledge, finds the gaps and reaches the right person.',type:'Knowledge retrieval + a conversation agent',stack:'SharePoint · Jotform · Zapier · Outlook',challenge:'A fast answer is only useful if it understands your services and knows what is missing.',
      inputs:{message:'We need cameras at a second warehouse. Can you quote for installation tomorrow?',tone:'friendly'},
      nodes:[node('docs','Service documents','SharePoint','app',85,75,'Sample intake guidance supplies the questions a customer reply should cover.'),node('index','Prepare knowledge','Searchable excerpts','app',285,75,'In a live build, documents would be indexed for retrieval. Here the service guide is a fixed sample.'),node('knowledge','Service knowledge','Scope · site · timing','tool',480,75,'Supplies the service-specific questions attached to the response.'),node('message','New enquiry','Jotform / Outlook','app',85,235,'A form or message starts the customer conversation.'),node('agent','Customer agent','AI + retrieved context','agent',400,235,'Combines the enquiry with the service guide to propose a useful response.'),node('model','Model access','via OpenRouter','model',220,385,'A language model accessed via OpenRouter could interpret intent and draft in the selected tone. This simulation uses guided sample logic.'),node('memory','Conversation context','This enquiry','tool',400,385,'Keeps the customer’s original message available to the agent and reviewer.'),node('priority','Urgency check','Promising nothing yet','rule',605,235,'Urgent requests need an availability check before anyone promises a date.'),node('human','Review response','You own the promise','human',800,235,'Edit the draft before accepting it. Nothing is sent from the demonstration.'),node('availability','Availability question','Urgent branch','tool',625,385,'An urgent message activates this branch and adds a timing check to the draft.'),node('reply','Reply draft','Outlook','app',985,80,'Prepares the reviewed customer response.'),node('lead','Lead context','Airtable','app',985,235,'Prepares the enquiry, intent and priority as a lead handover.'),node('team','Team handover','Teams','app',985,385,'Carries the same context to the team without another manual entry.')],
      edges:[edge('docs','index'),edge('index','knowledge'),edge('knowledge','agent','support'),edge('message','agent'),edge('model','agent','support'),edge('memory','agent','support'),edge('agent','priority'),edge('priority','human'),edge('priority','availability','support','urgent'),edge('availability','human','support'),edge('human','reply'),edge('human','lead'),edge('human','team')]
    },
    finance:{area:'Finance',title:'Ask one question. Put a team on it.',promise:'Specialist agents examine the same evidence from different angles, then bring you one briefing.',type:'A coordinating agent + specialist analysis',stack:'MCP server · Xero or MYOB · Excel',challenge:'A total can look healthy while individual jobs are eroding the result.',
      inputs:{csv:'job,revenue,cost\nOffice fit-out,24000,18000\nWarehouse cameras,16000,10400\nService project,10000,9200',threshold:20},
      nodes:[node('ask','Which jobs need attention?','Your business question','app',100,95,'Starts an analysis of the sample jobs and your chosen margin threshold.'),node('chief','Finance coordinator','AI delegates the question','agent',420,95,'Coordinates specialist views and combines their evidence. This is a simulated agent team.'),node('model','Model access','via OpenRouter','model',240,205,'Provides access to a model for coordinator and specialist interpretation in a live build. This simulation uses explicit calculations for numeric results.'),node('mcp','Controlled tools','MCP server','tool',95,320,'In a live build, this boundary exposes only authorised accounting and spreadsheet tools.'),node('accounts','Account figures','Xero or MYOB','tool',80,450,'Supplies revenue and direct costs. The preview uses editable CSV data.'),node('excel','Job context','Excel','tool',255,450,'Matches the figures to job names so the briefing remains traceable.'),node('margin','Margin analyst','Find exceptions','agent',390,295,'Calculates each job margin and flags those below your threshold.'),node('cost','Cost analyst','Understand cost weight','agent',625,295,'Compares direct costs with revenue and identifies the highest cost share.'),node('revenue','Revenue analyst','See concentration','agent',860,295,'Identifies how much total revenue comes from the largest job.'),node('marginmodel','Model + calculation','Evidence-backed','model',390,445,'The margin calculation is (revenue minus direct cost) divided by revenue.'),node('costmodel','Model + calculation','Evidence-backed','model',625,445,'Cost share is direct cost divided by revenue. It does not explain the underlying cause.'),node('revmodel','Model + calculation','Evidence-backed','model',860,445,'Revenue share is job revenue divided by total revenue.'),node('human','Choose the next question','Your judgement','human',725,95,'Review the briefing and decide what merits investigation.'),node('brief','Management briefing','Findings + evidence','app',950,95,'Combines the three specialist views without inventing cash forecasts or business causes.')],
      edges:[edge('ask','chief'),edge('model','chief','support'),edge('mcp','chief','support'),edge('accounts','mcp','support'),edge('excel','mcp','support'),edge('chief','margin','delegate'),edge('chief','cost','delegate'),edge('chief','revenue','delegate'),edge('mcp','margin','support'),edge('marginmodel','margin','support'),edge('costmodel','cost','support'),edge('revmodel','revenue','support'),edge('margin','human','return'),edge('cost','human','return'),edge('revenue','human','return'),edge('human','brief')]
    },
    onboarding:{area:'People & operations',title:'Make day one ready before day one.',promise:'One update checks the evidence in parallel. Missing items take their own route; readiness stays honest.',type:'An event hub + parallel checks + a recovery loop',stack:'Webhooks · Employment Hero · SharePoint · Teams',challenge:'A manager should not need to chase three people to find the one missing record.',
      inputs:{person:'Alex Morgan',role:'Field technician',contract:'yes',induction:'no',licence:'yes'},
      nodes:[node('event','Starter updated','Employment Hero','app',85,220,'A record update triggers a fresh readiness check without retyping the starter details.'),node('agent','Readiness agent','AI understands the role','agent',300,220,'Selects the sample evidence requirements for the chosen role.'),node('model','Model access','via OpenRouter','model',185,390,'A language model accessed via OpenRouter could interpret role context. This simulation uses a defined role checklist.'),node('records','Evidence store','SharePoint','tool',390,420,'Supplies the recorded or missing status of the sample evidence.'),node('contract','Contract check','Recorded or missing','app',535,75,'Checks whether the signed contract is recorded.'),node('induction','Induction check','Recorded or missing','app',535,220,'Checks whether the induction record is present.'),node('licence','Licence check','Role dependent','app',535,360,'The field role needs sample licence evidence; the office role does not.'),node('gate','Readiness gate','All required checks','rule',745,220,'Combines the parallel checks. Missing required evidence cannot be approved away.'),node('missing','Review missing items','Follow-up request','human',915,70,'Prepares a request naming the missing items. The record stays on hold.'),node('human','Confirm handover','People team','human',915,320,'Confirms the day-one handover only when the required sample evidence is present.'),node('teams','Day-one handover','Teams · prepared here','app',915,450,'Prepares the team handover after review. No account is created and no message is sent.')],
      edges:[edge('event','agent'),edge('model','agent','support'),edge('records','agent','support'),edge('agent','contract'),edge('agent','induction'),edge('agent','licence'),edge('contract','gate'),edge('induction','gate'),edge('licence','gate'),edge('gate','missing','flow','missing'),edge('missing','event','loop','evidence updated → recheck'),edge('gate','human','flow','ready'),edge('human','teams')]
    }
  };
  Object.assign(systems,{"routing": {"area": "Sales & growth", "title": "Get the lead to the right person.", "promise": "A clear owner, a reason and a next step. No forwarding lottery.", "type": "An intelligent intake + a routing switch", "stack": "Jotform \u00b7 n8n \u00b7 Airtable \u00b7 Teams", "challenge": "A promising lead should not sit in an inbox because the usual owner is busy.", "inputs": {"message": "We need structured cabling for a new office.", "region": "ACT", "capacity": "available", "duplicate": "no"}, "nodes": [{"id": "intake", "label": "Lead arrives", "sub": "Jotform / webhook", "kind": "app", "x": 85, "y": 240, "detail": "A sample enquiry arrives with a location and a request. No form submission is sent."}, {"id": "agent", "label": "Understand the request", "sub": "AI classifies the ask", "kind": "agent", "x": 295, "y": 240, "detail": "A live model could classify free text. This demo recognises cabling and audio-visual keywords; unclear requests stay for review."}, {"id": "model", "label": "Model access", "sub": "via OpenRouter", "kind": "model", "x": 155, "y": 440, "detail": "A language model accessed via OpenRouter could interpret requests in a live build. This simulation uses explicit matching rules."}, {"id": "rules", "label": "Territory & capacity", "sub": "Airtable", "kind": "tool", "x": 350, "y": 440, "detail": "The sample routing rules use ACT, NSW or VIC, the service and team availability. These are fictional team assignments."}, {"id": "switch", "label": "Choose the route", "sub": "Ownership rules", "kind": "rule", "x": 505, "y": 240, "detail": "Checks existing ownership first, then location and service, then availability. It never assigns an unclear lead silently."}, {"id": "primary", "label": "Territory team", "sub": "Standard route", "kind": "app", "x": 715, "y": 65, "detail": "The matching regional service team is available to take the lead."}, {"id": "backup", "label": "Backup team", "sub": "Capacity route", "kind": "app", "x": 715, "y": 195, "detail": "The usual team is busy, so the sample recommends its backup queue."}, {"id": "existing", "label": "Existing owner", "sub": "Duplicate route", "kind": "app", "x": 715, "y": 325, "detail": "An existing lead stays with its recorded owner instead of creating a second handover."}, {"id": "exception", "label": "Triage queue", "sub": "Unclear request", "kind": "app", "x": 715, "y": 455, "detail": "Missing territory or an unrecognised service stays in a triage queue for clarification."}, {"id": "human", "label": "Confirm ownership", "sub": "Sales coordinator", "kind": "human", "x": 930, "y": 195, "detail": "Review the suggested owner and reason. You can change the sample and rerun before accepting it."}, {"id": "handover", "label": "Owner + next action", "sub": "Airtable / Teams", "kind": "app", "x": 930, "y": 395, "detail": "Prepares a handover with the original request, recommended queue and routing reason. It does not assign a real lead."}], "edges": [{"from": "intake", "to": "agent", "kind": "flow", "label": ""}, {"from": "model", "to": "agent", "kind": "support", "label": ""}, {"from": "rules", "to": "switch", "kind": "support", "label": ""}, {"from": "agent", "to": "switch", "kind": "flow", "label": ""}, {"from": "switch", "to": "primary", "kind": "flow", "label": ""}, {"from": "switch", "to": "backup", "kind": "flow", "label": ""}, {"from": "switch", "to": "existing", "kind": "flow", "label": ""}, {"from": "switch", "to": "exception", "kind": "flow", "label": ""}, {"from": "primary", "to": "human", "kind": "return", "label": ""}, {"from": "backup", "to": "human", "kind": "return", "label": ""}, {"from": "existing", "to": "human", "kind": "return", "label": ""}, {"from": "exception", "to": "human", "kind": "return", "label": ""}, {"from": "human", "to": "handover", "kind": "flow", "label": ""}]}, "reporting": {"area": "Management reporting", "title": "Many sources. One report you can trace.", "promise": "Build a meeting pack from the systems doing the work, with the gaps still visible.", "type": "Parallel source collection + reconciliation + a report builder", "stack": "Xero \u00b7 Simpro \u00b7 Airtable \u00b7 SharePoint \u00b7 Teams", "challenge": "Every management meeting starts with another round of exports, copy-paste and checking which figures are current.", "inputs": {"revenue": 82000, "jobs": 24, "leads": 18, "age": 1, "source": "available"}, "nodes": [{"id": "schedule", "label": "Weekly report requested", "sub": "n8n / schedule", "kind": "app", "x": 85, "y": 240, "detail": "Starts a sample weekly reporting run. There is no scheduled background task in this demo."}, {"id": "xero", "label": "Recorded revenue", "sub": "Xero", "kind": "app", "x": 285, "y": 80, "detail": "Provides the sample accounting revenue: an amount in AUD, excluding GST. It is not cash received or profit."}, {"id": "simpro", "label": "Jobs completed", "sub": "Simpro", "kind": "app", "x": 285, "y": 240, "detail": "Provides a separate sample count of completed jobs. It is not added to revenue or treated as invoiced jobs."}, {"id": "airtable", "label": "Open leads", "sub": "Airtable", "kind": "app", "x": 285, "y": 400, "detail": "Provides the sample open-lead count. A missing source remains missing; it is never silently turned into zero."}, {"id": "join", "label": "Align the period", "sub": "Source references", "kind": "rule", "x": 525, "y": 240, "detail": "Brings the three measures into the same reporting pack without pretending different units can be totalled together."}, {"id": "quality", "label": "Fresh enough?", "sub": "Sample 7-day rule", "kind": "rule", "x": 715, "y": 240, "detail": "Flags an accounting extract older than seven days or an unavailable lead source. The threshold is illustrative."}, {"id": "gaps", "label": "Source gaps", "sub": "Refresh or flag", "kind": "tool", "x": 720, "y": 440, "detail": "Lists missing or stale sources. A live system would retry or notify the data owner; here you change the sample and rerun."}, {"id": "agent", "label": "Draft the narrative", "sub": "AI + source context", "kind": "agent", "x": 920, "y": 80, "detail": "Summarises the supplied metrics and flags. The demo uses a generated template, not a live model, and invents no trend or cause."}, {"id": "model", "label": "Model access", "sub": "via OpenRouter", "kind": "model", "x": 530, "y": 80, "detail": "A language model accessed via OpenRouter could draft commentary from validated figures and source references. This simulation uses defined sample text."}, {"id": "human", "label": "Review the pack", "sub": "Management review", "kind": "human", "x": 920, "y": 265, "detail": "Check the values, source freshness and gaps before marking the draft reviewed. Review cannot fill in missing data."}, {"id": "pack", "label": "Management pack", "sub": "SharePoint / Teams", "kind": "app", "x": 920, "y": 445, "detail": "Prepares the report with a source register. If inputs are incomplete, it remains a flagged draft, not a complete report."}], "edges": [{"from": "schedule", "to": "xero", "kind": "flow", "label": ""}, {"from": "schedule", "to": "simpro", "kind": "flow", "label": ""}, {"from": "schedule", "to": "airtable", "kind": "flow", "label": ""}, {"from": "xero", "to": "join", "kind": "flow", "label": ""}, {"from": "simpro", "to": "join", "kind": "flow", "label": ""}, {"from": "airtable", "to": "join", "kind": "flow", "label": ""}, {"from": "join", "to": "quality", "kind": "flow", "label": ""}, {"from": "quality", "to": "gaps", "kind": "support", "label": ""}, {"from": "quality", "to": "agent", "kind": "flow", "label": ""}, {"from": "gaps", "to": "agent", "kind": "return", "label": ""}, {"from": "model", "to": "agent", "kind": "support", "label": ""}, {"from": "agent", "to": "human", "kind": "flow", "label": ""}, {"from": "human", "to": "pack", "kind": "flow", "label": ""}]}});
  if(typeof module!=='undefined'&&module.exports)module.exports=systems;else root.WBSystems=systems;
})(typeof window==='undefined'?{}:window);

;
/* /systems-engine.js */
(function(root){
  const model=typeof module!=='undefined'&&module.exports?require('./flow-model.js'):root.WBFlowModel;
  function trace(key,r){
    const p=(text,nodes,wait=false)=>({text,nodes,wait});
    if(key==='invoice')return [p('A completed job starts the billing agent.',['event','agent']),p('The agent consults job context, the model and agreed rates.',['model','job','rates','agent']),p(r.needsDecision?'Base work continues. The variation branches to you.':'No extra work is held. Review the base scope.',['rule','base','human'],true),p('Your decision flows into the invoice draft.',['base','human','draft']),p('The draft keeps its job reference and decision record.',['draft','audit'])];
    if(key==='enquiry')return [p('Service guidance becomes context for the conversation.',['docs','index','knowledge']),p('The enquiry reaches an agent with knowledge and conversation context.',['message','agent','knowledge','model','memory']),p(r.urgent?'Urgent timing activates an availability check.':['The agent identifies the missing scope, site and timing.'][0],r.urgent?['agent','priority','availability']:['agent','priority']),p('Review the draft. You own the promise made to the customer.',['human'],true),p('One reviewed enquiry prepares three coordinated handovers.',['human','reply','lead','team'])];
    if(key==='finance')return [p('Your question reaches the finance coordinator.',['ask','chief','model']),p('Controlled tools provide the accounting figures and job context.',['mcp','accounts','excel','chief']),p('Three specialists examine margin, cost weight and revenue concentration.',['chief','margin','cost','revenue','marginmodel','costmodel','revmodel']),p('The specialists return their findings for your judgement.',['margin','cost','revenue','human'],true),p('One briefing brings the evidence together.',['human','brief'])];
    if(key==='onboarding')return [p('A starter update activates the readiness agent.',['event','agent','model']),p('The role checklist checks the evidence in parallel.',['agent','records','contract','induction','licence']),p(r.ready?'Every required sample record is present.':'The checks converge. '+r.missing.length+' required item(s) are missing.',['contract','induction','licence','gate']),p(r.ready?'Ready for a person to confirm the handover.':'Readiness stays on hold. Review the missing-item request.',r.ready?['gate','human']:['gate','missing'],true),p(r.ready?'The reviewed handover is prepared for the team.':'A follow-up is prepared. Update the evidence and rerun to take the ready route.',r.ready?['human','teams']:['missing'])];
    if(key==='routing')return [p('A lead arrives with a request and location.',['intake','agent','model']),p('Ownership rules check service, territory and team capacity.',['agent','rules','switch']),p(r.reason,['switch',r.route]),p('Confirm the recommended owner and next action.',[r.route,'human'],true),p('A handover keeps the request, owner and routing reason together.',['human','handover'])];
    if(key==='reporting')return [p('A weekly request starts three source collections.',['schedule','xero','simpro','airtable']),p('The source measures are aligned to the sample reporting pack.',['xero','simpro','airtable','join']),p(r.complete?'All sample sources pass the availability and freshness checks.':'The quality check flags '+r.issues.length+' source issue(s).',r.complete?['join','quality']:['join','quality','gaps']),p('A narrative is prepared from the measures and source status.',['agent','model']),p('Review the figures and source register. Missing data stays missing.',['human'],true),p(r.complete?'A reviewed sample management pack is ready.':'A flagged draft is prepared with the unresolved source gaps.',['human','pack'])];
    throw new Error('Unknown system.');
  }
  function create(key,inputs){const input={...inputs,approved:false};const result=model[key](input);return {key,input,result,trace:trace(key,result),index:-1,waiting:false,finished:false,reviewed:false,reply:null,decision:null}}
  function next(s){if(s.waiting||s.finished)return s;s.index++;const p=s.trace[s.index];s.waiting=p.wait;s.finished=s.index===s.trace.length-1;return s}
  function decide(s,include=true){if(!s.waiting)return s;if(s.key==='enquiry'&&!String(s.reply??s.result.reply).trim())throw new Error('Add a reply before reviewing.');if(s.key==='invoice'){s.input.approved=include;s.result=model.invoice(s.input)}s.reviewed=true;s.decision=include;s.waiting=false;return next(s)}
  const api={create,next,decide,trace};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WBSystemEngine=api;
})(typeof window==='undefined'?{}:window);

;
/* /workflow-questions.js */
(function(root){
  const questions={
    invoice:{title:'Can AI prepare invoices without retyping the job?',answer:'Turn recorded work into a draft. Keep the pricing rules explicit and put exceptions in front of the right person.',payoff:'One job record. One scope decision. A prepared invoice.',
      prompts:[{question:'What happens to unapproved extras?',answer:'The base work remains available. The extra amount waits for your decision.',input:{variation:180}},{question:'What if there is no extra work?',answer:'The base scope goes to review with no variation held back.',input:{variation:0}}]},
    enquiry:{title:'Can AI answer customers using our own information?',answer:'Bring service knowledge into the reply, identify missing details and keep a person in charge of the promise.',payoff:'A useful reply. A lead record. The same context for the team.',
      prompts:[{question:'What if the customer needs it tomorrow?',answer:'An urgent request activates the availability check. The draft does not promise a date.',input:{message:'We need cameras installed at our new warehouse tomorrow. Can you quote urgently?',tone:'friendly'}},{question:'Can the reply sound like us?',answer:'Try a shorter response, then edit the draft before reviewing it.',input:{message:'We are planning cameras for our warehouse next month. Can you send a quote?',tone:'concise'}}]},
    finance:{title:'Which jobs are making money—and which need attention?',answer:'Ask about job profitability. Specialists compare margins, cost weight and revenue concentration using the same figures.',payoff:'One question. Three evidence-backed perspectives.',
      prompts:[{question:'Which jobs are below 20% margin?',answer:'The margin analyst flags the sample service project. The other specialists add cost and revenue context.',input:{threshold:20}},{question:'What if our minimum margin is 30%?',answer:'A higher threshold flags two sample jobs. The calculations and briefing update together.',input:{threshold:30}}]},
    onboarding:{title:'Can onboarding work without chasing every document?',answer:'Check role requirements in parallel. Keep missing evidence visible and give the team a clear readiness decision.',payoff:'The evidence changes. The readiness route changes with it.',
      prompts:[{question:'What is still missing before day one?',answer:'The missing induction record keeps readiness on hold and prepares a follow-up request.',input:{role:'Field technician',contract:'yes',induction:'no',licence:'yes'}},{question:'What changes when everything is recorded?',answer:'With the required sample evidence present, the flow moves to a person for handover approval.',input:{role:'Field technician',contract:'yes',induction:'yes',licence:'yes'}}]}
  };
  Object.assign(questions,{"routing": {"title": "Who should own this lead\u2014and what if they are busy?", "answer": "Use territory, service and capacity to recommend an owner. Keep existing leads with their owner and unclear requests visible.", "payoff": "One lead. A deliberate route. A clear next action.", "prompts": [{"question": "What if the usual team is busy?", "input": {"capacity": "busy", "duplicate": "no", "region": "ACT", "message": "We need structured cabling for a new office."}, "answer": "Use territory, service and capacity to recommend an owner. Keep existing leads with their owner and unclear requests visible."}, {"question": "What if the lead already exists?", "input": {"duplicate": "yes"}, "answer": "Use territory, service and capacity to recommend an owner. Keep existing leads with their owner and unclear requests visible."}, {"question": "What if the location is unknown?", "input": {"region": "Unknown", "duplicate": "no"}, "answer": "Use territory, service and capacity to recommend an owner. Keep existing leads with their owner and unclear requests visible."}]}, "reporting": {"title": "Can our weekly report build itself from different systems?", "answer": "Collect distinct measures, check freshness and prepare one source-linked draft. Missing information stays visible.", "payoff": "Three sources. One pack. Every number has a home.", "prompts": [{"question": "What if one source is unavailable?", "input": {"source": "missing"}, "answer": "Collect distinct measures, check freshness and prepare one source-linked draft. Missing information stays visible."}, {"question": "What if the figures are out of date?", "input": {"age": 12, "source": "available"}, "answer": "Collect distinct measures, check freshness and prepare one source-linked draft. Missing information stays visible."}, {"question": "What does a complete report look like?", "input": {"age": 1, "source": "available"}, "answer": "Collect distinct measures, check freshness and prepare one source-linked draft. Missing information stays visible."}]}});
  if(typeof module!=='undefined'&&module.exports)module.exports=questions;else root.WBQuestions=questions;
})(typeof window==='undefined'?{}:window);

;
/* /backstage.js */
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

;
/* /providers.js */
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
    ['openai','OpenAI','AI provider',['openai','chatgpt'],'icon'],
    ['claude','Anthropic','AI provider',['anthropic','claude'],'icon'],
    ['openrouter','OpenRouter','Model access',['openrouter'],'icon'],
    ['huggingface','Hugging Face','Open-source model ecosystem',['hugging face','huggingface'],'icon']
  ];
  const catalog=entries.map(([id,name,category,aliases,style])=>({id,name,category,aliases,style,src:style==='name'?null:(window.WBWordPress.assets+'/brand-assets/')+(id==='simpro'?'simpro-icon.png':id+'.svg')}));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function find(text){const value=String(text).toLowerCase();return catalog.filter(p=>p.aliases.some(a=>value.includes(a)))}
  function image(p,mode='node'){
    const src=p.id==='jotform'&&mode==='node'?(window.WBWordPress.assets+'/brand-assets/jotform-icon.svg'):p.src;
    return src?'<img class="provider-logo provider-'+p.id+'" src="'+src+'" alt="'+esc(p.name)+'" width="40" height="40" loading="lazy" decoding="async">':'<span class="provider-name">'+esc(p.name)+'</span>';
  }
  function nodeMarkup(text){const matches=find(text).filter(p=>p.src&&p.style!=='wordmark'||p.id==='jotform');return matches.length?'<span class="provider-marks '+(matches.length>1?'provider-pair':'')+'">'+matches.map(p=>image(p)).join('')+'</span>':''}
  window.WBProviders={catalog,find,image,nodeMarkup};
})();

;
/* /systems.js */
(()=>{
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
  const systems=window.WBSystems,engine=window.WBSystemEngine,model=window.WBFlowModel,meta=window.WBProjects,questions=window.WBQuestions;
  const pageKey=document.body.getAttribute('data-workflow');
  const activeKeys=pageKey&&systems[pageKey]?[pageKey]:Object.keys(systems);
  const track=(name,key)=>window.WBAnalytics?.track(name,{workflow:key});
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:2}).format(n);
  const icons={agent:'<rect x="4" y="6" width="16" height="13" rx="4"/><path d="M12 2v4M8 11h1m6 0h1M8 15h8M1 10v5m22-5v5"/>',human:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',tool:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v13c0 4 16 4 16 0V5M4 11c0 4 16 4 16 0"/>',model:'<path d="M12 2l3 6 7 4-7 4-3 6-3-6-7-4 7-4Z"/><path d="M12 8v8M8 12h8"/>',rule:'<path d="M12 2l10 10-10 10L2 12Z"/><path d="M8 12h8m-4-4v8"/>',app:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 8h10M7 12h10M7 16h6"/>'};
  function brand(n){return ['app','tool','model'].includes(n.kind)?window.WBProviders.nodeMarkup(n.sub):''}
  const icon=k=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[k]+'</svg>';
  const states={},inputs={},timers={},estimates={},inspections={};let selected='invoice',editing='invoice',stepDelay=5200;
  const journey={routing:['Lead arrives','Route selected','You confirm','Owner ready'],reporting:['Sources arrive','Pack drafted','You review','Report ready'],invoice:['Job complete','AI prepares','You decide','Draft ready'],enquiry:['Enquiry arrives','AI finds context','You review','Team aligned'],finance:['Ask a question','Agents investigate','You review','Briefing ready'],onboarding:['Starter added','Evidence checked','You decide','Next step ready']};
  const root=id=>$('#system-'+id);
  const within=(id,s)=>root(id).querySelector(s);
  function path(e,c){const a=c.nodes.find(n=>n.id===e.from),b=c.nodes.find(n=>n.id===e.to);let x=a.x,y=a.y,tx=b.x,ty=b.y;
    if(e.kind==='loop')return 'M'+x+' '+(y-29)+'V18H'+tx+'V'+(ty-29);
    if(e.kind==='support'||e.kind==='delegate'||e.kind==='return'||Math.abs(tx-x)<100){const down=ty>y;y+=down?29:-29;ty+=down?-29:29;return 'M'+x+' '+y+'C'+x+' '+((y+ty)/2)+' '+tx+' '+((y+ty)/2)+' '+tx+' '+ty}
    const right=tx>x;x+=right?76:-76;tx+=right?-76:76;return 'M'+x+' '+y+'C'+((x+tx)/2)+' '+y+' '+((x+tx)/2)+' '+ty+' '+tx+' '+ty;
  }
  function diagram(key){const c=systems[key];return '<div class="diagram-scroll" tabindex="0" role="region" aria-label="'+esc(c.area)+' interactive system canvas"><div class="diagram-viewport"><div class="system-diagram"><svg class="connections" viewBox="0 0 1080 520" aria-hidden="true"><defs><marker id="arrow-'+key+'" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="none" stroke="#b1c9e6" stroke-width="1"/></marker></defs>'+c.edges.map((e,i)=>'<path class="connection '+e.kind+'" data-edge="'+i+'" marker-end="url(#arrow-'+key+')" d="'+path(e,c)+'"/><circle class="flow-packet" data-packet="'+i+'" r="3" fill="#c7e1ff"><animateMotion dur="5.2s" repeatCount="indefinite" path="'+path(e,c)+'"/></circle>').join('')+'</svg>'+c.nodes.map(n=>{const mark=brand(n);return '<button type="button" class="system-node kind-'+n.kind+(mark?' has-provider':'')+'" style="left:'+n.x+'px;top:'+n.y+'px" data-inspect="'+n.id+'" aria-pressed="false" aria-controls="inspector-'+key+'"><span class="node-icon">'+(mark||icon(n.kind))+'</span><span class="node-copy"><strong>'+esc(n.label)+'</strong><small>'+esc(n.sub)+'</small></span>'+(n.kind==='agent'?'<b class="intelligence-badge">AI</b>':n.kind==='human'?'<b class="human-badge">YOU</b>':'')+'<span class="inspect-cue" aria-hidden="true">i</span><span class="curtain-cue" aria-hidden="true">Behind the scenes ↗</span><span class="node-port"></span></button>'}).join('')+'</div></div></div>'}
  $('#systems-gallery').innerHTML=Object.entries(systems).filter(([key])=>activeKeys.includes(key)).map(([key,c],i)=>'<article class="system-card" id="system-'+key+'" aria-labelledby="title-'+key+'"><div class="system-story"><span class="system-number"><b>0'+(i+1)+'</b> '+esc(c.area)+'</span><h2 id="title-'+key+'">'+esc(questions[key].title)+'</h2><p>'+esc(questions[key].payoff)+'</p><div class="story-actions"><button class="button primary" data-preview="'+key+'">See the result ↗</button><button class="button" data-run="'+key+'">▶ Explore how it works</button><button class="text-button" data-scenarios="'+key+'">Try a different situation ↗</button></div><button class="impact-link" data-impact="'+key+'">Estimate the time this could release <span>↗</span></button>'+(!pageKey&&window.WBRoutes?.[key]?'<a class="workflow-guide-link" href="'+window.WBRoutes[key]+'">Explore the full example ↗</a>':'')+(key==='reporting'?'<a class="workflow-guide-link" href="/why-monthly-reporting-takes-two-days/">Reports disagree? Use the handover checklist ↗</a>':'')+'</div><div class="system-surface"><div class="surface-heading"><div><span class="architecture-label">'+esc(c.type)+'</span><small>Click a card. See behind the scenes.</small></div><button class="expand-button" data-expand="'+key+'" aria-label="Explore '+esc(c.area)+' canvas">Explore <span aria-hidden="true">⛶</span></button></div>'+'<p class="simulation-note">Interactive simulation · fictional data</p>'+diagram(key)+'<div class="journey-track" aria-label="Journey progress">'+journey[key].map((label,j)=>'<span data-phase="'+j+'"><b>'+String(j+1).padStart(2,'0')+'</b>'+label+'</span>').join('')+'</div><div class="canvas-follow"><button type="button" data-follow="'+key+'" aria-pressed="true">Follow active steps: on</button><span>Swipe the canvas to explore ↔</span></div><div class="surface-controls"><span class="system-status" role="status" aria-live="polite" aria-atomic="true">Choose a step, or watch the whole system work.</span><div><button class="icon-button" data-pause="'+key+'" aria-label="Pause '+esc(c.area)+' simulation" disabled><span aria-hidden="true">Ⅱ</span></button><button class="text-button" data-next="'+key+'">Next →</button><button class="text-button outcome-button" data-result="'+key+'">Open outcome ↗</button></div></div></div><dialog class="inspector journey-modal" id="inspector-'+key+'" aria-label="Explore a workflow step"><div class="inspector-body"></div><div class="step-access"><label>Jump to a step<select data-node-picker="'+key+'"><option value="">Choose any step</option>'+c.nodes.map(n=>'<option value="'+n.id+'">'+esc(n.label)+'</option>').join('')+'</select></label></div></dialog><dialog class="scenario-dialog journey-modal" aria-labelledby="scenario-title-'+key+'"><form method="dialog"><button class="close" aria-label="Close situations">×</button></form><span class="eyebrow">SAME BUSINESS. DIFFERENT POSSIBILITIES.</span><h2 id="scenario-title-'+key+'">What if…</h2><p>'+esc(questions[key].answer)+'</p><div class="question-prompts">'+questions[key].prompts.map((p,j)=>'<button type="button" data-question="'+j+'" data-system="'+key+'" aria-pressed="false"><span>'+esc(p.question)+'</span><b aria-hidden="true">↗</b></button>').join('')+'</div><button class="text-button" data-edit="'+key+'">Make it your own — change the sample ↗</button><p class="sample-note">Fictional data. No live account connections.</p></dialog><dialog class="system-result journey-modal" aria-label="'+esc(c.area)+' outcome"><div class="result-content"></div></dialog></article>').join('');
  function resize(){ $$('.diagram-viewport').forEach(v=>{const scale=v.clientWidth/1080;v.style.height=(520*scale)+'px';v.querySelector('.system-diagram').style.transform='scale('+scale+')'}) }
  if(window.ResizeObserver){const ro=new ResizeObserver(resize);$$('.diagram-viewport').forEach(v=>ro.observe(v))}window.addEventListener('resize',resize);resize();
  function stop(key){clearTimeout(timers[key]);delete timers[key];if(states[key])states[key].running=false}
  function stopAll(){Object.keys(states).forEach(k=>{stop(k);paint(k)})}
  function schedule(key){if(stepDelay===0){stop(key);paint(key);return}timers[key]=setTimeout(()=>{if(!states[key]?.running)return;engine.next(states[key]);if(states[key].waiting||states[key].finished)stop(key);paint(key);if(states[key].running)schedule(key)},stepDelay)}
  function run(key,scenario=null){if(!activeKeys.includes(key))return;track('demo_start',key);stopAll();selected=key;comparison(key);const s=engine.create(key,inputs[key]||systems[key].inputs);states[key]=s;engine.next(s);s.running=true;clearInspection(key);if(within(key,'.system-result').open)within(key,'.system-result').close();root(key).querySelectorAll('[data-question]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.question===scenario)));s.scenario=scenario;paint(key);schedule(key)}
  function advance(key){if(!states[key]){run(key);stop(key);paint(key);return}stop(key);engine.next(states[key]);paint(key)}
  function followStep(key,current){
    const scroll=within(key,'.diagram-scroll'),s=states[key],control=within(key,'[data-follow]');
    if(!s||!scroll||control.getAttribute('aria-pressed')!=='true'||s.lastVisiblePhase===s.index)return;
    s.lastVisiblePhase=s.index;
    if(scroll.scrollWidth<=scroll.clientWidth)return;
    const candidates=systems[key].nodes.filter(n=>current.nodes.includes(n.id));
    const lead=candidates.find(n=>n.kind==='human')||[...candidates].reverse().find(n=>!['model','tool'].includes(n.kind))||candidates[0];
    if(!lead)return;
    const scale=within(key,'.diagram-viewport').clientWidth/1080;
    scroll.scrollTo?.({left:Math.max(0,lead.x*scale-scroll.clientWidth/2),behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function paint(key){const s=states[key],c=systems[key];if(!s)return;if(s.finished&&!s.completionTracked){s.completionTracked=true;track('demo_complete',key);}const current=s.trace[s.index];root(key).classList.add('has-started');root(key).classList.toggle('awaiting-you',s.waiting);root(key).setAttribute('data-flow-state',s.finished?'finished':s.waiting?'waiting':s.running?'running':'paused');const done=new Set(s.trace.slice(0,s.index).flatMap(p=>p.nodes));const active=new Set(current.nodes);
    root(key).querySelectorAll('[data-inspect]').forEach(b=>{const id=b.dataset.inspect;b.classList.toggle('is-current',active.has(id)&&!s.finished);b.classList.toggle('is-complete',done.has(id)||s.finished&&active.has(id));b.classList.toggle('is-waiting',s.waiting&&active.has(id)&&(c.nodes.find(n=>n.id===id).kind==='human'||id==='missing'));b.classList.toggle('is-running',s.running&&active.has(id));});
    const visited=new Set([...done,...active]);root(key).querySelectorAll('[data-edge]').forEach(el=>{const e=c.edges[+el.dataset.edge];const both=visited.has(e.from)&&visited.has(e.to);const live=both&&(active.has(e.from)||active.has(e.to));el.classList.toggle('is-complete',both);el.classList.toggle('is-running',s.running&&live);within(key,'[data-packet="'+el.dataset.edge+'"]').classList.toggle('is-active',s.running&&live);el.classList.toggle('is-unused',(key==='routing'&&['primary','backup','existing','exception'].some(id=>(e.from===id||e.to===id)&&id!==s.result.route))||(key==='reporting'&&s.result.complete&&(e.from==='gaps'||e.to==='gaps'))||(key==='enquiry'&&!s.result.urgent&&(e.from==='availability'||e.to==='availability'))||(key==='onboarding'&&((s.result.ready&&(e.to==='missing'||e.kind==='loop'))||(!s.result.ready&&(e.to==='human'||e.to==='teams')))));});
    followStep(key,current);
    within(key,'.system-status').textContent=current.text;const pause=within(key,'[data-pause]');pause.disabled=stepDelay===0||s.waiting||s.finished;pause.innerHTML='<span aria-hidden="true">'+(s.running?'Ⅱ':'▶')+'</span>';pause.setAttribute('aria-label',(s.running?'Pause ':'Continue ')+c.area+' simulation');within(key,'[data-next]').disabled=s.waiting||s.finished;within(key,'[data-run]').textContent='↻ Run again';
    const phase=s.finished?3:s.waiting?2:s.reviewed?3:s.index===0?0:1;
    root(key).querySelectorAll('[data-phase]').forEach(el=>{const j=+el.dataset.phase;el.classList.toggle('phase-active',j===phase);el.classList.toggle('phase-done',j<phase);el.setAttribute('aria-current',j===phase?'step':'false')});
    const outcome=within(key,'[data-result]');outcome.textContent=s.waiting?'Your decision ↗':s.finished?'See the result ↗':'Preview the result ↗';outcome.classList.toggle('needs-decision',s.waiting);
    if(within(key,'.system-result').open)renderResult(key);
  }
  function snapshot(key,id){const s=states[key];if(!s)return 'Run the sample to see the information used here.';const r=s.result;const visited=s.trace.slice(0,s.index+1).some(p=>p.nodes.includes(id));if(!visited)return 'This branch has not run in the current example.';
    if(key==='invoice'){if(id==='rates')return s.input.hours+' hours × '+money(+s.input.rate)+' + '+money(+s.input.materials)+' materials.';if(id==='human'||id==='rule')return money(+s.input.variation)+' extra work. '+(s.reviewed?(s.decision?'Included by your decision.':'Held out by your decision.'):'Waiting for your scope decision.');return 'Job WB-1042 · draft subtotal '+money(r.subtotal)+' excluding GST.'}
    if(key==='enquiry'){if(id==='knowledge'||id==='docs'||id==='index')return 'Sample guide: ask for the site, scope of work and preferred timing; check availability before promising a date.';if(id==='message'||id==='memory')return r.message;if(id==='priority'||id==='availability')return r.urgent?'Urgent request: availability must be checked.':'Standard timing: ask for the preferred date.';return r.intent+' · '+r.tone+' tone · '+(s.reviewed?'response reviewed locally':'response awaiting review')}
    if(key==='finance'){const worst=[...r.rows].sort((a,b)=>b.cost/b.revenue-a.cost/a.revenue)[0],largest=[...r.rows].sort((a,b)=>b.revenue-a.revenue)[0];if(id==='margin'||id==='marginmodel')return r.flagged.length+' job(s) below '+r.threshold+'% margin: '+(r.flagged.map(x=>x.job).join(', ')||'none')+'.';if(id==='cost'||id==='costmodel')return worst.job+': direct costs are '+(worst.cost/worst.revenue*100).toFixed(1)+'% of revenue.';if(id==='revenue'||id==='revmodel')return largest.job+' contributes '+(largest.revenue/r.revenue*100).toFixed(1)+'% of recorded revenue.';return r.rows.length+' sample jobs · '+money(r.revenue)+' revenue · '+money(r.profit)+' gross profit.'}
    if(key==='routing')return id==='rules'?'Region: '+r.region+' · Service: '+r.service+' · Capacity: '+r.capacity:r.owner+' · '+r.reason;
    if(key==='reporting'){const source=r.sources.find(x=>x.name.toLowerCase()===id);if(source)return source.measure+': '+(source.value===null?'Unavailable':source.name==='Xero'?money(source.value):source.value)+' · '+source.status;return r.complete?'Three source measures pass the sample checks.':r.issues.join(' ');}
    const check=r.checks.find(x=>x.key===id);if(check)return check.label+': '+(check.ready?'recorded':'missing');if(id==='licence')return 'Not required for the sample office role.';return r.person+' · '+r.role+' · '+(r.ready?'all required sample evidence present':'missing '+r.missing.join(', '));
  }
  function clearInspection(key){delete inspections[key];if(within(key,'.inspector').open)within(key,'.inspector').close();within(key,'[data-node-picker]').value='';root(key).querySelectorAll('[data-inspect]').forEach(b=>{b.setAttribute('aria-pressed','false');b.classList.remove('is-selected')});root(key).querySelectorAll('[data-edge]').forEach(e=>e.classList.remove('is-selected'))}
  function inspect(key,id){track('workflow_step_open',key);stopAll();const n=systems[key].nodes.find(x=>x.id===id);if(!n)return;inspections[key]=id;within(key,'[data-node-picker]').value=id;root(key).querySelectorAll('[data-inspect]').forEach(b=>{const on=b.dataset.inspect===id;b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',String(on))});root(key).querySelectorAll('[data-edge]').forEach(el=>{const e=systems[key].edges[+el.dataset.edge];el.classList.toggle('is-selected',e.from===id||e.to===id)});
    const dialog=within(key,'.inspector'),el=within(key,'.inspector-body'),index=systems[key].nodes.indexOf(n);
    el.innerHTML='<button class="inspector-close" aria-label="Back to the workflow">×</button><span class="modal-role role-'+n.kind+'">'+icon(n.kind)+(n.kind==='agent'||n.kind==='model'?'AI interprets':n.kind==='human'?'You stay in control':'Automation carries the work')+'</span><h2>'+esc(n.label)+'</h2><div class="backstage"></div><div class="step-actions"><button class="text-button" data-previous '+(index===0?'disabled':'')+'>← Previous part</button><button class="text-button" data-forward '+(index===systems[key].nodes.length-1?'disabled':'')+'>Next part →</button></div><button class="button primary" data-return>'+(states[key]?.waiting?'Make your decision ↗':states[key]?.finished?'See the outcome ↗':'Back to the flow →')+'</button>';
    const input=states[key]?.input||inputs[key]||systems[key].inputs;
    const facts=key==='invoice'?[['Job','WB-1042'],['Labour',input.hours+' hours at '+money(+input.rate)],['Materials',money(+input.materials)],['Extra work to review',money(+input.variation)]]:key==='enquiry'?[['Customer message',input.message],['Reply tone',input.tone]]:key==='finance'?model.finance(input).rows.map(row=>[row.job,money(row.revenue)+' revenue · '+money(row.cost)+' direct costs']).concat([['Margin to flag','Below '+input.threshold+'%']]):key==='routing'?[['Lead request',input.message],['Region',input.region],['Team capacity',input.capacity],['Existing lead',input.duplicate]]:key==='reporting'?[['Recorded revenue',money(+input.revenue)],['Completed jobs',input.jobs],['Lead source',input.source],['Accounting extract age',input.age+' days']]:[['New starter',input.person],['Role',input.role],['Contract / induction / licence',[input.contract,input.induction,input.licence].join(' / ')]];
    const connected=direction=>[...new Set(systems[key].edges.filter(e=>e[direction==='incoming'?'to':'from']===id).map(e=>e[direction==='incoming'?'from':'to']))].map(other=>systems[key].nodes.find(x=>x.id===other));
    window.WBBackstage.mount(el.querySelector('.backstage'),{title:n.label,role:n.kind==='agent'||n.kind==='model'?'AI makes sense of the context':n.kind==='human'?'You make the decision':'Automation moves the work',symbol:n.kind==='agent'||n.kind==='model'?'AI':n.kind==='human'?'◎':'↗',facts,action:n.detail,incoming:connected('incoming'),outgoing:connected('outgoing'),evidence:snapshot(key,id),note:'Sample data · connections show possible paths, not live activity.',onJump:other=>inspect(key,other)});
    const named=window.WBProviders.find(n.sub);
    if(named.length){const row=document.createElement('div');row.className='step-provider-row';row.innerHTML=named.map(p=>'<span>'+window.WBProviders.image(p)+'<span>'+esc(p.name)+'</span></span>').join('');el.querySelector('.backstage').before(row)}
    el.querySelector('.inspector-close').onclick=()=>dialog.close();
    el.querySelector('[data-previous]').onclick=()=>inspect(key,systems[key].nodes[index-1].id);
    el.querySelector('[data-forward]').onclick=()=>inspect(key,systems[key].nodes[index+1].id);
    el.querySelector('[data-return]').onclick=()=>{dialog.close();const s=states[key];if(s?.waiting||s?.finished)openResult(key);else if(s){stop(key);paint(key)}};
    if(!dialog.open)dialog.showModal();
  }
  function openResult(key){if(!states[key])run(key);stopAll();renderResult(key);const dialog=within(key,'.system-result');if(!dialog.open)dialog.showModal()}

  let focused=null,focusPlaceholder=null,focusOpener=null;
  function expand(key){if(focused)return;stopAll();focused=key;focusOpener=within(key,'[data-expand]');focusPlaceholder=document.createElement('div');focusPlaceholder.className='focus-placeholder';const card=root(key);card.before(focusPlaceholder);$('#focus-content').append(card);$('#focus-dialog').showModal();document.body.classList.add('canvas-focused');resize();const canvas=within(key,'.diagram-scroll');canvas.scrollIntoView({block:'start',behavior:'instant'});canvas.focus({preventScroll:true})}
  function restoreFocus(refocus=true){if(!focused)return;const card=root(focused);focusPlaceholder.replaceWith(card);focused=null;focusPlaceholder=null;document.body.classList.remove('canvas-focused');resize();if(refocus)focusOpener?.focus({preventScroll:true})}
  $('#focus-dialog').addEventListener('close',()=>restoreFocus());
  function renderResult(key){const s=states[key],r=s.result,el=within(key,'.result-content'),dialog=within(key,'.system-result');
    const scroll=dialog.scrollTop,active=document.activeElement,hadFocus=el.contains(active);
    const focusId=hadFocus?active.id:null;
    const focusAction=hadFocus?['data-hide-result','data-change','data-build','data-result-next','data-approve','data-decline'].find(a=>active.hasAttribute(a)):null;
    const selection=hadFocus&&active.tagName==='TEXTAREA'?{start:active.selectionStart,end:active.selectionEnd,direction:active.selectionDirection,scroll:active.scrollTop}:null;
    let content='',title='',decision='Mark reviewed',hint='Review the result before the final handover.',extra='';
    if(key==='invoice'){title='An invoice with the scope decision attached.';content='<div class="invoice-paper"><div class="document-brand"><div class="wb-identity wb-document" aria-label="Works Better by Renzo Demartini"><span class="wb-type"><span class="wb-name">works<span>better</span><b aria-hidden="true">.</b></span><span class="wb-byline">by Renzo Demartini</span></span></div><span>DRAFT<br>WB-1042</span></div><div class="document-recipient"><span>PREPARED FROM YOUR JOB</span><strong>Labour &amp; materials</strong><small>Sample invoice · AUD</small></div><dl>'+r.lines.map(l=>'<div><dt>'+esc(l.description)+'</dt><dd>'+money(l.amount)+'</dd></div>').join('')+'</dl><div class="invoice-total">Subtotal · ex GST <b>'+money(r.subtotal)+'</b></div>'+(r.excluded?'<p class="held-note">'+money(r.excluded)+' variation held outside this draft.</p>':'')+'</div>';decision=+s.input.variation?'Include the variation':'Approve base scope';hint='Base work stays in the draft. You decide whether the extra work belongs here.';if(+s.input.variation)extra='<button class="button" data-decline>Keep the variation out</button>'}
    if(key==='enquiry'){title='A reply with context. A team with the same story.';content='<div class="reply-paper"><label for="reply-'+key+'">Edit the response before reviewing</label><textarea id="reply-'+key+'" maxlength="3000">'+esc(s.reply??r.reply)+'</textarea></div><div class="handover-cards"><div><small>AIRTABLE / LEAD CONTEXT</small><strong>'+esc(r.intent)+'</strong><p>'+ (r.urgent?'Availability check required':'Standard follow-up')+'</p></div><div><small>TEAMS / NEXT STEP</small><strong>Confirm scope, site and timing.</strong><p>Original enquiry stays attached.</p></div></div>';decision='Review this response';hint='Your edited response stays with the customer context. Nothing is sent.'}
    if(key==='finance'){title='Three specialist views. One management briefing.';const cost=[...r.rows].sort((a,b)=>b.cost/b.revenue-a.cost/a.revenue)[0],top=[...r.rows].sort((a,b)=>b.revenue-a.revenue)[0];content='<div class="specialist-findings"><div><span>MARGIN ANALYST</span><strong>'+r.flagged.length+' need a closer look</strong><p>Below your '+r.threshold+'% threshold: '+esc(r.flagged.map(x=>x.job).join(', ')||'none')+'.</p></div><div><span>COST ANALYST</span><strong>'+(cost.cost/cost.revenue*100).toFixed(1)+'% cost share</strong><p>'+esc(cost.job)+' has the highest direct-cost share.</p></div><div><span>REVENUE ANALYST</span><strong>'+(top.revenue/r.revenue*100).toFixed(1)+'% of revenue</strong><p>'+esc(top.job)+' is the largest recorded job.</p></div></div><div class="margin-chart">'+r.rows.map(x=>'<div><span>'+esc(x.job)+'</span><div class="margin-track"><i style="width:'+Math.max(0,Math.min(100,x.margin))+'%"></i></div><b>'+x.margin.toFixed(1)+'%</b></div>').join('')+'</div>';decision='Review the briefing';hint='These are direct-cost margins. The evidence suggests questions to investigate, not causes or forecasts.'}
    if(key==='onboarding'){title=r.ready?'Ready for the people team’s decision.':'One missing item stays visible.';content='<div class="readiness"><div><span>'+esc(r.role)+'</span><h4>'+esc(r.person)+'</h4><b class="'+(r.ready?'ready':'held')+'">'+(r.ready?'Evidence present':'Readiness on hold')+'</b></div><ul>'+r.checks.map(c=>'<li class="'+(c.ready?'ready':'held')+'"><span>'+(c.ready?'✓':'!')+'</span>'+esc(c.label)+'<small>'+(c.ready?'Recorded':'Missing')+'</small></li>').join('')+'</ul></div>';decision=r.ready?'Confirm the handover':'Prepare missing-item request';hint=r.ready?'The required sample evidence is present. Confirm before preparing the handover.':'Missing: '+r.missing.join(', ')+'. Update the example and rerun to unlock the ready branch.'}
    if(key==='routing'){title='The lead has a route. The team has the context.';content='<div class="routing-receipt"><span class="eyebrow">SUGGESTED OWNER / FICTIONAL TEAM</span><h4>'+esc(r.owner)+'</h4><p>'+esc(r.reason)+'</p><div class="route-options">'+[['primary','Territory team'],['backup','Backup queue'],['existing','Existing owner'],['exception','Triage queue']].map(([id,label])=>'<span class="'+(r.route===id?'route-chosen':'')+'">'+(r.route===id?'✓ ':'')+label+'</span>').join('')+'</div><dl><div><dt>Original request</dt><dd>'+esc(r.message)+'</dd></div><div><dt>Next action</dt><dd>'+esc(r.action)+'</dd></div></dl></div>';decision='Confirm this handover';hint=r.route==='exception'?'This confirms a triage handover, not an assignment to a service team. Clarify the sample and rerun to change the route.':'The same request and routing reason travel with the owner. No real lead is assigned.'}
    if(key==='reporting'){title=r.complete?'A meeting pack with its sources attached.':'A useful draft. Its gaps stay visible.';content='<div class="report-pack"><div class="report-masthead"><span>WEEKLY MANAGEMENT PACK</span><b>'+ (r.complete?'Sample sources checked':'Source review needed')+'</b></div><div class="report-metrics">'+r.sources.map(x=>'<article><span>'+esc(x.measure)+'</span><strong>'+(x.value===null?'Not available':x.name==='Xero'?money(x.value):x.value)+'</strong><small>'+esc(x.name)+' · '+esc(x.status)+'</small></article>').join('')+'</div><section class="report-narrative"><h4>Draft commentary</h4><p>The sample accounting extract records '+money(r.revenue)+' revenue excluding GST. Simpro records '+r.jobs+' completed jobs. '+(r.missing?'The lead source is unavailable, so no lead count is included.':'Airtable records '+r.leads+' open leads.')+' These are separate measures, not a combined total. '+(r.stale?'Refresh the accounting extract before relying on its revenue figure.':'No prior-period comparison is supplied, so no growth trend is claimed.')+'</p></section><div class="report-source-register"><h4>Source register</h4>'+r.sources.map(x=>'<div><strong>'+esc(x.name)+'</strong><span>'+esc(x.status)+'</span></div>').join('')+'</div>'+(r.issues.length?'<ul class="report-issues">'+r.issues.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+'</div>';decision=r.complete?'Review the management pack':'Review the flagged draft';hint=r.complete?'The pack keeps each metric tied to its source. No report is uploaded or circulated.':'Review does not fill the gaps. Change the source status or refresh the extract in the example, then rerun.'}
    el.innerHTML='<div class="result-heading"><div><span class="eyebrow">'+(s.finished?'PREPARED IN THIS DEMO':s.waiting?'YOUR DECISION':'WORK IN PROGRESS')+'</span><h3 tabindex="-1">'+title+'</h3></div><button class="text-button" data-hide-result>Back to the flow ×</button></div>'+content+'<div class="result-actions">'+(!s.finished?'<p class="result-progress" role="status">'+esc(s.trace[s.index].text)+'</p>':'')+'<p>'+esc(hint)+'</p><div>'+(s.waiting?'<button class="button primary" data-approve>'+decision+'</button>'+extra:s.finished?'<span class="completion-note" tabindex="-1" role="status">✓ '+((key==='onboarding'&&!r.ready)||(key==='reporting'&&!r.complete)?(key==='reporting'?'Flagged draft prepared. Source gaps remain.':'Follow-up prepared. Readiness remains on hold.'):'Prepared locally. No business records changed.')+'</span>':'<button class="button primary" data-result-next>'+(s.reviewed?'Finish preparing the result →':'Continue the workflow →')+'</button>')+'<button class="text-button" data-change>Change the example ↗</button><button class="text-button" data-build>Build this with Renzo ↗</button></div><p class="result-error" role="status"></p></div>';
    el.querySelector('[data-hide-result]').onclick=()=>within(key,'.system-result').close();el.querySelector('[data-change]').onclick=()=>{within(key,'.system-result').close();edit(key)};el.querySelector('[data-build]').onclick=()=>{within(key,'.system-result').close();contact(key)};
    if(el.querySelector('[data-result-next]'))el.querySelector('[data-result-next]').onclick=()=>advance(key);
    const approve=value=>{if(!s.waiting)return;stop(key);try{engine.decide(s,value);s.running=!s.finished;paint(key);if(s.running)schedule(key)}catch(e){el.querySelector('.result-error').textContent=e.message}};
    if(el.querySelector('[data-approve]'))el.querySelector('[data-approve]').onclick=()=>approve(true);if(el.querySelector('[data-decline]'))el.querySelector('[data-decline]').onclick=()=>approve(false);
    if(key==='enquiry')el.querySelector('textarea').oninput=e=>{s.reply=e.target.value;if(s.reviewed){stop(key);s.reviewed=false;s.finished=false;s.waiting=true;s.index=s.trace.findIndex(p=>p.wait);paint(key)}};
    if(dialog.open){
      if(hadFocus){
        const target=(focusId&&document.getElementById(focusId))||(focusAction&&el.querySelector('['+focusAction+']'))||el.querySelector('[data-approve]')||el.querySelector('[data-result-next]')||el.querySelector('.completion-note')||el.querySelector('h3');
        target?.focus({preventScroll:true});
        if(selection&&target?.tagName==='TEXTAREA'){target.setSelectionRange(selection.start,selection.end,selection.direction);target.scrollTop=selection.scroll;}
      }
      dialog.scrollTop=scroll;
    }
  }
  function edit(key){if(within(key,'.scenario-dialog').open)within(key,'.scenario-dialog').close();stopAll();editing=key;selected=key;comparison(key);const v=inputs[key]||systems[key].inputs;$('#edit-title').textContent=systems[key].title;$('#edit-challenge').textContent=systems[key].challenge;let html='';
    const number=(id,label,max)=>'<label>'+label+'<input name="'+id+'" type="number" min="0" max="'+max+'" step="0.01" value="'+v[id]+'" required></label>';
    if(key==='invoice')html=number('hours','Labour hours',1000)+number('rate','Hourly rate ($)',10000)+number('materials','Materials ($)',1000000)+number('variation','Unapproved extra work ($)',1000000);
    if(key==='enquiry')html='<label class="full">Customer enquiry<textarea name="message" maxlength="2500" required>'+esc(v.message)+'</textarea></label><label>Reply tone<select name="tone"><option value="friendly">Friendly and helpful</option><option value="concise" '+(v.tone==='concise'?'selected':'')+'>Short and clear</option></select></label><p>Try “urgent” or “tomorrow” to activate the availability branch.</p>';
    if(key==='finance')html='<label class="full">Sample figures (job,revenue,cost)<textarea name="csv" maxlength="5000" required>'+esc(v.csv)+'</textarea></label>'+number('threshold','Flag margins below (%)',100)+'<p>Up to 20 jobs. Direct costs only; use fictional figures.</p>';
    if(key==='onboarding')html='<label>Sample starter<input name="person" value="'+esc(v.person)+'" maxlength="80" required></label><label>Role<select name="role"><option>Field technician</option><option '+(v.role==='Office coordinator'?'selected':'')+'>Office coordinator</option></select></label>'+[['contract','Signed contract'],['induction','Induction record'],['licence','Licence evidence']].map(([id,label])=>'<label>'+label+'<select name="'+id+'"><option value="yes">Recorded</option><option value="no" '+(v[id]==='no'?'selected':'')+'>Missing</option></select></label>').join('')+'<p>The office role does not require the sample licence evidence.</p>';
    if(key==='routing')html='<label class="full">Lead request<textarea name="message" maxlength="1000" required>'+esc(v.message)+'</textarea></label><label>Region<select name="region">'+['ACT','NSW','VIC','Unknown'].map(x=>'<option '+(v.region===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label>Usual team capacity<select name="capacity"><option value="available">Available</option><option value="busy" '+(v.capacity==='busy'?'selected':'')+'>Busy</option></select></label><label>Lead already exists<select name="duplicate"><option value="no">No</option><option value="yes" '+(v.duplicate==='yes'?'selected':'')+'>Yes</option></select></label><p>Try cabling or audio visual. Other requests go to triage. These team names are fictional.</p>';
    if(key==='reporting')html=number('revenue','Xero revenue · AUD ex GST',10000000)+number('jobs','Simpro completed jobs',10000)+number('leads','Airtable open leads',10000)+number('age','Age of Xero extract · days',365)+'<label>Lead source<select name="source"><option value="available">Available</option><option value="missing" '+(v.source==='missing'?'selected':'')+'>Unavailable</option></select></label><p>Use whole numbers for counts and days. Over seven days flags the accounting extract. Missing data is not treated as zero.</p>';
    $('#edit-fields').innerHTML=html;$('#edit-error').textContent='';$('#edit-dialog').showModal();
  }
  $('#edit-form').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));try{engine.create(editing,v);inputs[editing]=v;$('#edit-dialog').close();run(editing)}catch(err){$('#edit-error').textContent=err.message}};
  $('#reset-example').onclick=()=>{inputs[editing]={...systems[editing].inputs};$('#edit-dialog').close();edit(editing)};
  $$('[data-expand]').forEach(b=>b.onclick=()=>expand(b.dataset.expand));$$('[data-node-picker]').forEach(b=>b.onchange=()=>{if(b.value)inspect(b.dataset.nodePicker,b.value);else clearInspection(b.dataset.nodePicker)});$$('[data-question]').forEach(b=>b.onclick=()=>{const key=b.dataset.system,j=+b.dataset.question;within(key,'.scenario-dialog').close();inputs[key]={...systems[key].inputs,...questions[key].prompts[j].input};run(key,j)});
  $$('[data-scenarios]').forEach(b=>b.onclick=()=>{stopAll();within(b.dataset.scenarios,'.scenario-dialog').showModal()});
  $$('[data-impact]').forEach(b=>b.onclick=()=>{stopAll();comparison(b.dataset.impact);$('#impact-dialog').showModal()});
  activeKeys.forEach(key=>{const d=within(key,'.inspector');d.addEventListener('close',()=>clearInspection(key))});
  $$('[data-preview]').forEach(b=>b.onclick=()=>openResult(b.dataset.preview));
  $$('[data-run]').forEach(b=>b.onclick=()=>run(b.dataset.run));$$('[data-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.edit));
  activeKeys.forEach(key=>{root(key).querySelectorAll('[data-inspect]').forEach(b=>{b.onclick=()=>inspect(key,b.dataset.inspect);const highlight=on=>root(key).querySelectorAll('[data-edge]').forEach(el=>{const edge=systems[key].edges[+el.dataset.edge];el.classList.toggle('is-hovered',on&&(edge.from===b.dataset.inspect||edge.to===b.dataset.inspect))});b.onpointerenter=()=>highlight(true);b.onpointerleave=()=>highlight(false);b.onfocus=()=>highlight(true);b.onblur=()=>highlight(false)});within(key,'[data-pause]').onclick=()=>{const s=states[key];if(!s)return;if(s.running)stop(key);else {stopAll();s.running=true;schedule(key)}paint(key)};within(key,'[data-next]').onclick=()=>advance(key);within(key,'[data-result]').onclick=()=>openResult(key)});
  function comparison(key){selected=key;$('#compare-project').value=key;const c=meta[key],v=estimates[key]||(estimates[key]={...c.estimate});$('#old-process').innerHTML=c.old.map((x,i)=>'<li><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(x)+'</li>').join('');$('#new-process').innerHTML=c.next.map((x,i)=>'<li><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(x)+'</li>').join('');$('#old-delay').textContent=c.delay;$('#new-relief').textContent=c.relief;$('#volume-label').textContent=c.estimate.unit;for(const id of ['volume','before','after']){$('#estimate-'+id).value=v[id];$('#estimate-'+id).oninput=e=>{v[id]=e.target.value;calculateSavings()}}calculateSavings()}
  function calculateSavings(){try{const r=model.savings(estimates[selected]);$('#saved-hours').textContent=Math.abs(r.savedHours).toFixed(1);$('#saved-label').textContent=r.savedHours>=0?'potential handling time released / week':'extra hours / week';$('#old-hours').textContent=r.oldHours.toFixed(1)+' h';$('#new-hours').textContent=r.newHours.toFixed(1)+' h';const max=Math.max(r.oldHours,r.newHours,1);$('#old-time-bar').style.width=r.oldHours/max*100+'%';$('#new-time-bar').style.width=r.newHours/max*100+'%';$('#estimate-error').textContent=''}catch(e){$('#estimate-error').textContent=e.message;$('#saved-hours').textContent='—';$('#old-hours').textContent='—';$('#new-hours').textContent='—';$('#old-time-bar').style.width='0%';$('#new-time-bar').style.width='0%'}}
  $('#flow-pace').onchange=e=>{stepDelay=e.target.value==='manual'?0:Number(e.target.value);Object.keys(states).forEach(key=>{const s=states[key];if(s.running){clearTimeout(timers[key]);if(stepDelay)schedule(key);else stop(key);paint(key)}});$$('[data-packet]').forEach(p=>p.querySelector('animateMotion')?.setAttribute('dur',(stepDelay||5200)/1000+'s'))};
  $('#compare-project').onchange=e=>comparison(e.target.value);
  function contact(key,mode,brief){key=key||pageKey||null;track('contact_open',key||'general');stopAll();const template=brief||(key?'I would like to improve '+systems[key].title.toLowerCase()+'.':'')+($('#own-idea').value.trim()?'\n\nMy task: '+$('#own-idea').value.trim():'');if(window.WBEnquiry)window.WBEnquiry.seed(template,mode);else if(!$('#contact-brief').value){$('#contact-brief').value=template;if(mode&&$('#contact-run')&&!$('#contact-run').value)$('#contact-run').value=mode;}email();if(!$('#contact-dialog').open)$('#contact-dialog').showModal()}
  function email(){$('#contact-email').href='mailto:hello@worksbetter.ai?subject='+encodeURIComponent('Works Better — could we build this?')+'&body='+encodeURIComponent(window.WBEnquiry?.getBrief?.()||$('#contact-brief').value)}
  $$('[data-follow]').forEach(b=>b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.textContent='Follow active steps: '+(on?'on':'off');const state=states[b.dataset.follow];if(on&&state){state.lastVisiblePhase=-1;paint(b.dataset.follow)}});
  $$('[data-contact]').forEach(b=>b.onclick=()=>contact(b.dataset.workflowContact||pageKey||null,b.dataset.deliveryMode));$('#contact-brief').oninput=email;$('#copy-brief').onclick=async()=>{try{await navigator.clipboard.writeText(window.WBEnquiry?.getBrief?.()||$('#contact-brief').value);$('#copy-message').textContent='Copied.';track('brief_copy',pageKey||'general')}catch{$('#contact-brief').focus();$('#contact-brief').select?.();$('#copy-message').textContent='Your written brief is selected. Open the email draft to include your selected delivery mode and source.'}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});comparison(pageKey||'invoice');
  /* Progressive discovery: real page links without JS; one selected canvas with JS. */
  if(!pageKey && document.querySelector('[data-choose-system]')){
    const choices=$$('[data-choose-system]');
    const announcement=$('.wb-selection-status');
    let visibleKey=null;
    function chooseSystem(key,notify=false){
      if(!activeKeys.includes(key))return;
      const changed=visibleKey!==key;
      if(changed){stopAll();if(focused){$('#focus-dialog').close();restoreFocus(false);}activeKeys.forEach(k=>root(k).querySelectorAll('dialog[open]').forEach(d=>d.close()));}
      activeKeys.forEach(k=>{root(k).hidden=k!==key;});
      choices.forEach(a=>{const current=a.dataset.chooseSystem===key;a.setAttribute('aria-pressed',String(current));});
      visibleKey=key;resize();
      if(announcement)announcement.textContent=systems[key].area+' example selected. Explore the result or follow the steps below.';
      if(notify && changed)track('system_selected',key);
    }
    choices.forEach(a=>{
      a.setAttribute('role','button');a.setAttribute('aria-controls','system-'+a.dataset.chooseSystem);
      a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();chooseSystem(a.dataset.chooseSystem,true);history.replaceState(null,'','#system-'+a.dataset.chooseSystem);};
      a.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();a.click();}});
    });
    const fromHash=()=>{const key=location.hash.replace(/^#system-/,'');if(activeKeys.includes(key))chooseSystem(key,true);};
    chooseSystem(activeKeys.includes(location.hash.replace(/^#system-/,''))?location.hash.slice(8):'invoice');
    window.addEventListener('hashchange',fromHash);
    document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#system-"]');if(a)chooseSystem(a.getAttribute('href').slice(8),true);});
  }
  window.WBSystemUI={run,advance,inspect,edit,states,inputs,stopAll,expand,clearInspection,openResult,contact};
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){stepDelay=0;$('#flow-pace').value='manual'}
})();

;
/* /possibility-model.js */
(function(root){
  'use strict';
  const patterns={
    routing:{match:/\b(lead routing|routing|route|territor\w*|capacity|assign\w*)\b/gi,title:'Every lead has an accountable owner.',agent:'Classify the opportunity',source:'Territory & ownership',output:'An owned next step',detail:'Interpret the request, then apply explicit territory, existing-owner and capacity rules. Unclear requests should go to triage.',review:'Confirm the owner',reviewDetail:'Check the recommended team and the routing reason. Exceptions and existing ownership should not disappear in the handover.',tools:['Jotform','Airtable','Teams'],example:'routing'},
    reporting:{match:/\b(reports?|reporting|multi.source|multiple sources|weekly|exports?|meeting pack)\b/gi,title:'Many sources. One traceable report.',agent:'Coordinate the report',source:'Measures & reporting period',output:'A source-linked pack',detail:'Collect agreed measures from authorised systems, check freshness and availability, then draft a management pack. Do not invent missing values.',review:'Review the sources',reviewDetail:'Check definitions, timing and source gaps. Reviewing a report does not make an outdated extract current or fill a missing measure.',tools:['Xero','Simpro','Airtable'],example:'reporting'},
    invoice:{match:/\b(invoice[sd]?|invoicing|billing|retyp\w*|double entry)\b/gi,title:'From finished work to ready-to-review.',agent:'Prepare the draft',source:'Job details & pricing',output:'An invoice draft',detail:'Reuse the job record and agreed pricing to prepare a draft. An AI step could interpret messy job notes; fixed rules should calculate amounts.',review:'Check scope & extras',reviewDetail:'A person checks exceptions, scope and any extra work before a draft can proceed. Preparing an invoice does not approve it.',tools:['Simpro','Xero'],example:'invoice'},
    enquiry:{match:/\b(enquir\w*|inquir\w*|customer|leads?|repl\w*|inbox|emails?|support)\b/gi,title:'Every enquiry gets a way forward.',agent:'Understand the ask',source:'Approved service info',output:'A reply to review',detail:'Use approved information to draft a relevant response, identify missing details and suggest who should handle the next step.',review:'Check the promise',reviewDetail:'Your team checks dates, scope and commitments. Only an approved response would be passed to a sending step.',tools:['Outlook','Teams'],example:'enquiry'},
    finance:{match:/\b(profit\w*|margin\w*|cash\s?flow|financ\w*|revenue|numbers|figures|losing money|costs?|budget\w*)\b/gi,title:'See the signal inside your numbers.',agent:'Coordinate the analysis',source:'Figures & job context',output:'A decision briefing',detail:'Coordinate separate checks on margin, costs and revenue. Calculations should use traceable figures, while AI could help explain the exceptions.',review:'Check the evidence',reviewDetail:'A person reviews the source figures and investigates the exceptions before acting. A low margin is a question to explore, not proof of its cause.',tools:['Xero','Excel'],example:'finance'},
    onboarding:{match:/\b(onboard\w*|starter\w*|induction\w*|licen[cs]\w*|employee\w*|hiring|contracts?)\b/gi,title:'A ready team starts with joined-up work.',agent:'Coordinate readiness',source:'Role & starter details',output:'An agreed next step',detail:'Check the required evidence in parallel. Missing records can trigger a follow-up instead of disappearing into another email chain.',review:'Confirm what’s ready',reviewDetail:'Your people team decides the next step. Missing evidence must remain visible; approving a handover must not mark an absent document as received.',tools:['Employment Hero','SharePoint'],example:'onboarding'},
    documents:{match:/\b(documents?|files?|pdfs?|sharepoint|polic\w*|procedures?|tenders?|search|knowledge)\b/gi,title:'Your information, ready for the question.',agent:'Find useful context',source:'Approved documents',output:'An answer with sources',detail:'Search an approved set of documents and assemble a draft answer with source references. If the evidence is missing, the system should say so.',review:'Verify the source',reviewDetail:'Check the source, permissions and freshness of the information before using an answer. A fluent answer is not a substitute for evidence.',tools:['SharePoint','Teams'],example:null}
  };
  const generic={title:'Let’s give this work a better path.',agent:'Make sense of the input',source:'Your existing information',output:'A useful next action',detail:'Start by identifying what arrives, what someone has to decide, and what a useful result looks like. AI may help interpret information; a simple rule may be enough for some steps.',review:'Keep the right decision',reviewDetail:'Decide which judgement needs a person, what can be checked automatically, and what should happen if the input is incomplete.',tools:[],example:null};
  const software=['Simpro','Xero','Mitti','SharePoint','Outlook','Teams','Airtable','MYOB','Jotform','Employment Hero','OpenAI','Anthropic','OpenRouter','Excel','Zapier','n8n'];
  const priorities={time:'Start with the repeated handover that takes the most time. Measure handling time before and after a small pilot.',accuracy:'Start with a clear validation rule and make exceptions visible. Compare error and rework rates during a small pilot.',visibility:'Start by giving each item an owner, a status and a next step. Test whether the team can see what needs attention.'};
  function create(value,angle='auto',priority='time'){
    const issue=String(value??'').trim();
    if(issue.length<12)throw new Error('Add a little more detail about the work that is slowing you down.');
    if(issue.length>2000)throw new Error('Keep your starting point under 2,000 characters.');
    if(!['auto','general',...Object.keys(patterns)].includes(angle))throw new Error('Choose an available angle.');
    if(!Object.hasOwn(priorities,priority))throw new Error('Choose what matters most.');
    const matches=Object.entries(patterns).map(([key,p])=>[key,(issue.match(p.match)||[]).length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
    const key=angle==='auto'?(matches[0]?.[0]||'general'):angle,p=patterns[key]||generic;
    const mentioned=software.filter(name=>new RegExp('\\b'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(' ','\\s*')+'\\b','i').test(issue));
    const tools=mentioned.length?mentioned.slice(0,4):p.tools;
    const nodes=[],edges=[];
    const node=(id,label,kind,x,y,detail)=>nodes.push({id,label,kind,x,y,detail});
    const edge=(from,to,kind='flow')=>edges.push({from,to,kind});
    node('start','Your starting point','input',100,200,issue);
    node('agent',p.agent,'ai',320,200,p.detail);edge('start','agent');
    node('context',p.source,'data',320,365,'Potential context: '+(tools.length?tools.join(', '):'the records and systems you already use')+'. '+(mentioned.length?'These names came from your description.':'These are suggestions to confirm together.')+' Access and integration methods would be checked before a build.');edge('context','agent','context');
    if(key==='routing'){
      [['owner','Existing or matched owner'],['triage','Backup or triage']].forEach(([id,label],i)=>{node(id,label,'automation',540,100+i*200,'Apply agreed routing rules. Retain existing ownership, check capacity and keep unclear requests in a visible queue.');edge('agent',id,'branch');edge(id,'human','branch')});
    }else if(key==='reporting'){
      [['accounts','Account measures'],['operations','Operational measures'],['pipeline','Sales measures']].forEach(([id,label],i)=>{node(id,label,'automation',540,65+i*135,'Collect the approved measure and attach its source, reporting period and freshness. Keep missing information explicit.');edge('agent',id,'branch');edge(id,'human','branch')});
    }else if(key==='finance'){
      [['margin','Margin check','Compare revenue and direct costs by job.'],['cost','Cost check','Surface unusual cost shares for investigation.'],['revenue','Revenue check','See which jobs contribute most to the recorded revenue.']].forEach(([id,label,detail],i)=>{node(id,label,'ai',540,65+i*135,detail);edge('agent',id,'branch');edge(id,'human','branch')});
    }else if(key==='onboarding'){
      [['contract','Contract evidence'],['induction','Induction evidence'],['licence','Role requirements']].forEach(([id,label],i)=>{node(id,label,'automation',540,65+i*135,'Check that the required sample evidence is present. If it is missing or unclear, keep it on hold for follow-up. The real checklist would be agreed for each role.');edge('agent',id,'branch');edge(id,'human','branch')});
    }else if(key==='invoice'){
      node('base','Agreed scope','automation',540,110,'Apply the agreed rates and calculation rules to the base work. Keep the original job reference.');node('extra','Exceptions & extras','automation',540,290,'Separate items that need a judgement so they cannot silently slip into the approved scope.');edge('agent','base','branch');edge('agent','extra','branch');edge('base','human');edge('extra','human');
    }else if(key==='enquiry'){
      node('timing','Timing & availability','automation',540,100,'An urgent enquiry could trigger an availability check. Do not promise a date without confirming it.');node('details','Missing details','ai',540,300,'Identify the scope, location or timing that the team still needs to ask about.');edge('agent','timing','branch');edge('agent','details','branch');edge('timing','human');edge('details','human');
    }else{
      node('check',key==='documents'?'Check the sources':'Check what’s missing','automation',540,200,key==='documents'?'Attach references and check permissions. If the material cannot support an answer, route the question back for review.':'Validate the information and flag missing details. Confirm the real rules with the people doing the work.');edge('agent','check');edge('check','human');
    }
    node('human',p.review,'human',750,200,p.reviewDetail);
    node('outcome',p.output,'outcome',940,200,'This is the proposed outcome, not an executed task. '+priorities[priority]);edge('human','outcome');
    return {issue,key,priority,title:p.title,tools,mentioned:mentioned.length>0,example:p.example,nodes,edges,takeaway:priorities[priority],matched:matches.map(x=>x[0]),live:false};
  }
  const api={create,priorities};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WBPossibility=api;
})(typeof window==='undefined'?{}:window);

;
/* /play-area.js */
(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
if(!$('#own-form'))return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const roles={input:'STARTING POINT',data:'CONNECTED INFORMATION',ai:'AI AGENT',automation:'TOOLS & RULES',human:'HUMAN REVIEW',outcome:'PROPOSED RESULT'};
const symbols={input:'↗',data:'▤',ai:'AI',automation:'⚙',human:'◎',outcome:'✓'};
let plan=null,submitted='',busy=false,controller=null,sequence=0,timer=null,step=-1,playing=false;
const style=document.createElement('style');style.textContent=
'#idea-canvas{max-height:650px}.wb-live-summary{padding:0 32px 18px;color:#bdcde3;font-size:16px;line-height:1.7}.wb-live-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:16px 24px;border-top:1px solid #8daefe33}.wb-live-controls button{min-height:44px}.wb-step-copy{flex-basis:100%;color:#bed0e9;line-height:1.7}.wb-assumptions{padding:0 32px 24px;color:#a4bad7;font-size:13px;line-height:1.8}.wb-assumptions summary{cursor:pointer;min-height:40px}.wb-live-map .idea-node{width:180px;min-height:126px;padding:15px;text-align:left;border-radius:16px;transition:box-shadow .35s,background .35s,border-color .35s,opacity .35s;overflow:hidden}.wb-live-map .idea-node strong{font-size:15px;font-weight:600}.wb-live-map .idea-node .wb-node-icon{display:flex;align-items:center;gap:7px;margin:0 0 9px;min-height:28px}.wb-node-icon .provider-logo{width:28px;height:28px;object-fit:contain}.wb-role-icon{display:inline-grid;place-items:center;width:30px;height:28px;border-radius:8px;background:#a0c1ff24;color:#d7e6ff;font-size:12px;font-weight:800}.wb-live-map .idea-node small{position:static;display:block;margin-top:9px;color:#90a8c8;font-size:10px}.wb-live-map .idea-ai{border-color:#8bacff;background:linear-gradient(140deg,#304f91,#142b51);box-shadow:0 0 24px #538cff23,inset 0 1px #cde0ff25}.wb-live-map .idea-human{border-color:#d2ba76}.wb-live-map .idea-outcome{border-color:#b7e393}.wb-live-map .idea-node.is-current{border-color:#d8fba1;box-shadow:0 0 0 3px #d8fba126,0 0 45px #94bdff55;z-index:3;background:linear-gradient(145deg,#375780,#1e3550)}.wb-live-map .idea-node.is-complete{border-color:#9cbf8d}.wb-live-map .idea-wire{animation:none;stroke-dasharray:none;stroke-dashoffset:0;stroke-width:2;stroke:#6383ae75}.wb-live-map .idea-wire.is-complete{stroke:#9ac38c}.wb-live-map .idea-wire.is-current{stroke:#d4f99d;stroke-width:3;stroke-dasharray:8 8}.wb-live-map.is-playing .idea-wire.is-current{animation:wb-flow .7s linear infinite}.wb-live-map .canvas-caption{font-size:11px}.wb-generating{opacity:.65}.wb-live-controls .text-button[disabled]{opacity:.4}.wb-live-controls .wb-step-count{margin-left:auto;color:#adc1dd;font-size:12px}@keyframes wb-flow{to{stroke-dashoffset:-32}}@media(prefers-reduced-motion:reduce){.wb-live-map .idea-wire{animation:none!important}}@media(max-width:600px){.wb-live-summary,.wb-assumptions{padding-left:20px;padding-right:20px}.wb-live-controls{padding:16px}.wb-live-controls .wb-step-count{margin-left:0}.wb-step-copy{font-size:14px}}';style.textContent+="#idea-canvas{max-height:none;overflow:auto}.wb-live-map{background:radial-gradient(ellipse at 45% 40%,#26477325,transparent 65%)}.wb-live-map .idea-node{width:174px;height:104px;min-height:104px;padding:14px 12px;display:flex;align-items:center;gap:9px;overflow:visible;border-radius:12px;box-shadow:0 5px 0 #02081280,inset 0 1px #b6d7ff30;animation:wb-card-in .55s both;animation-delay:calc(var(--node-order)*90ms)}.wb-live-map .idea-node .wb-node-icon{flex:0 0 30px;width:30px;height:34px;margin:0;display:grid;place-items:center;background:#9cbbe21a;border-radius:8px}.wb-node-icon svg{width:25px;height:25px}.wb-live-map .wb-card-copy{display:block;min-width:0;text-transform:none;letter-spacing:normal}.wb-live-map .idea-node strong{font-size:14px;line-height:1.4;display:block}.wb-live-map .idea-node small{font-size:12px;line-height:1.4;margin-top:5px}.wb-live-map .wb-role-badge{position:absolute;right:12px;top:-14px;padding:4px 8px;font-size:10px;color:#e0eaff;background:#3e5b91;border:1px solid #a6c2ff;border-radius:4px}.wb-live-map .idea-human,.wb-live-map .idea-human.is-current{background:linear-gradient(140deg,#4b4431,#292a27);border-color:#d4b365;color:#f1e2b5;box-shadow:0 5px 0 #02081280,0 0 24px #cfa74618}.wb-live-map .idea-human .wb-role-badge{color:#f4dda0;background:#4a4027;border-color:#d4b365}.wb-live-map .idea-human .wb-node-icon{color:#f1d78d;background:#ddba5420}.wb-live-map .idea-human.is-current{box-shadow:0 0 0 3px #d4b36530,0 0 38px #d4b36545}.wb-live-map .idea-node:hover{border-color:#c3d7fa;box-shadow:0 0 28px #82b6ff35}.wb-live-map .wb-info{position:absolute;right:7px;bottom:6px;font-size:10px;border:1px solid #aec4e34d;border-radius:50%;width:14px;height:14px;line-height:12px;text-align:center;color:#b1c5dd99}.wb-support-wire{position:absolute;inset:0;pointer-events:none;width:100%;height:100%}.wb-support-wire path{fill:none;stroke:#8fb9e86b;stroke-width:1.5;stroke-dasharray:2 7}.wb-support{position:absolute;top:270px;transform:translateX(-50%);width:170px;border:0;padding:0;background:transparent;color:#d5e1f2;text-align:center;cursor:pointer}.wb-support-icons{display:flex;justify-content:center;align-items:center;gap:5px;height:48px;margin-bottom:11px}.wb-support-icons .provider-logo{width:44px;height:44px;object-fit:contain}.wb-support-icons svg{height:44px;width:44px;padding:9px;border:1px solid #7493b8;border-radius:50%;background:#263954}.wb-support strong{display:block;font-size:13px;line-height:1.4}.wb-support small{display:block;color:#91a8c8;font-size:12px;margin-top:4px}.wb-live-map .canvas-caption{bottom:12px;top:auto}.wb-live-map .idea-ai.is-current{background:linear-gradient(140deg,#4265ac,#213e6b)}@keyframes wb-card-in{from{opacity:0;translate:0 9px}to{opacity:1;translate:0 0}}@media(prefers-reduced-motion:reduce){.wb-live-map .idea-node{animation:none!important}}";document.head.append(style);
$('#play-disclosure').textContent='Selecting a sample also requests live AI. You can cancel the browser request while it is running; it may already have reached the provider. Your typed business problem is sent to Works Better’s AI workflow service to create this illustrative proposal. Do not enter customer records, passwords or sensitive information. No business accounts are accessed or changed.';
$('#own-idea').placeholder='For example: We enter the same job details twice, then chase approval by email.';
function stop(){clearTimeout(timer);timer=null;playing=false;$('#idea-canvas')?.querySelector('.wb-live-map')?.classList.remove('is-playing');if($('#wb-watch'))$('#wb-watch').textContent=step>=plan?.nodes.length-1?'Replay workflow':'Watch workflow';}
const shapes={ai:'<rect x="4" y="6" width="16" height="13" rx="4"/><path d="M12 2v4M8 11h1m6 0h1M8 15h8M1 10v5m22-5v5"/>',human:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',automation:'<path d="M12 2l10 10-10 10L2 12Z"/><path d="M8 12h8m-4-4v8"/>',data:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v13c0 4 16 4 16 0V5M4 11c0 4 16 4 16 0"/>',input:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 8h10M7 12h10M7 16h6"/>',outcome:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7"/>'};
const glyph=kind=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shapes[kind]+'</svg>';
function locate(){plan.width=Math.max(1100,plan.nodes.length*212+40);plan.height=405;plan.nodes.forEach((n,i)=>{n.x=126+i*212;n.y=125;});}
function path(e){const a=plan.nodes[e.from],b=plan.nodes[e.to];if(e.to===e.from+1)return 'M'+(a.x+87)+' '+a.y+'H'+(b.x-87);const top=32+(e.from%2)*12;return 'M'+a.x+' '+(a.y-52)+'C'+a.x+' '+top+' '+b.x+' '+top+' '+b.x+' '+(b.y-52);}
function icon(n){const found=(window.WBProviders?.find(n.tools.join(' '))||[]).filter(p=>p.src);return '<span class="wb-node-icon">'+((n.kind==='input'||n.kind==='data')&&found.length?window.WBProviders.image(found[0]):glyph(n.kind))+'</span>';}
function support(){const ai=plan.nodes.findIndex(n=>n.kind==='ai');const entries=[];if(ai>=0)entries.push({label:'AI assistance',sub:'Illustrative workflow proposal',tools:'',parent:ai,kind:'ai'});const seen=new Set();plan.nodes.forEach((n,i)=>{const names=n.tools.filter(t=>!seen.has(t.toLowerCase())&&!/^(ai agent|openrouter|openai)$/i.test(t));names.forEach(t=>seen.add(t.toLowerCase()));if(names.length)entries.push({label:names.join(' + '),sub:'Proposed connection',tools:names.join(' '),parent:i,kind:'data'});});return entries.sort((a,b)=>a.parent-b.parent).map((s,i)=>{const x=(i+1)*plan.width/(entries.length+1),n=plan.nodes[s.parent],providers=(window.WBProviders?.find(s.tools)||[]).filter(p=>p.src).slice(0,2);return '<svg class="wb-support-wire" viewBox="0 0 '+plan.width+' '+plan.height+'" aria-hidden="true"><path d="M'+n.x+' 180 C'+n.x+' 225 '+x+' 230 '+x+' 270"/></svg><button type="button" class="wb-support" style="left:'+x+'px" data-support="'+s.parent+'" aria-label="Explore '+esc(s.label)+'"><span class="wb-support-icons">'+(providers.length?providers.map(p=>window.WBProviders.image(p)).join(''):glyph(s.kind))+'</span><strong>'+esc(s.label)+'</strong><small>'+esc(s.sub)+'</small></button>';}).join('');}
function render(){stop();step=-1;locate();$('#idea-result-title').textContent=plan.title;$('#idea-takeaway').textContent=plan.takeaway;$('#idea-example').hidden=true;
$('.idea-result-top .eyebrow').textContent=plan.live?'YOUR AI-GENERATED WORKFLOW':'STANDARD PLANNING OUTLINE · AI UNAVAILABLE';
$('#wb-live-summary')?.remove();const summary=document.createElement('p');summary.id='wb-live-summary';summary.className='wb-live-summary';summary.textContent=plan.summary;$('.idea-result-top').after(summary);
$('#idea-canvas').innerHTML='<div class="possibility-map wb-live-map" style="width:'+plan.width+'px;min-width:'+plan.width+'px;height:'+plan.height+'px"><svg viewBox="0 0 '+plan.width+' '+plan.height+'" aria-hidden="true">'+plan.edges.map((e,i)=>'<path class="idea-wire" data-wire="'+i+'" d="'+path(e)+'"/>').join('')+'</svg>'+plan.nodes.map((n,i)=>'<button type="button" class="idea-node idea-'+n.kind+'" style="left:'+n.x+'px;top:'+n.y+'px;--node-order:'+i+'" data-idea-node="'+i+'" aria-label="Explore step '+(i+1)+': '+esc(n.label)+'" aria-haspopup="dialog">'+icon(n)+'<span class="wb-card-copy"><strong>'+esc(n.label)+'</strong><small>'+esc(n.kind==='human'?'Your decision':n.kind==='ai'?'AI interprets the work':n.kind==='outcome'?'Proposed result':n.tools.join(' · ')||'Workflow step')+'</small></span>'+((n.kind==='human'||n.kind==='ai')?'<b class="wb-role-badge">'+(n.kind==='human'?'YOU · HUMAN':'AI')+'</b>':'')+'<span class="wb-info" aria-hidden="true">i</span></button>').join('')+support()+'<span class="canvas-caption">PROPOSED WORKFLOW · Tap a card to explore its role</span></div>';
$('#wb-live-controls')?.remove();const controls=document.createElement('div');controls.id='wb-live-controls';controls.className='wb-live-controls';controls.innerHTML='<button type="button" class="button" id="wb-watch">Watch workflow</button><button type="button" class="text-button" id="wb-next">Next step →</button><span class="wb-step-count" id="wb-step-count">'+plan.nodes.length+' connected steps</span><p class="wb-step-copy" id="wb-step-copy" role="status">Follow the proposal step by step, or select any card to explore it.</p>';$('#idea-canvas').after(controls);
$('#wb-assumptions')?.remove();const assumptions=document.createElement('details');assumptions.id='wb-assumptions';assumptions.className='wb-assumptions';assumptions.innerHTML='<summary>What still needs confirming</summary><ul>'+plan.assumptions.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ul>';$('.idea-result-bottom').after(assumptions);
$('#idea-result .concept-note').textContent=plan.live?'AI-generated proposal, not an executed workflow. Your accounts have not been accessed. Review assumptions and scope with Renzo.':'Standard planning outline, not AI-generated or tailored advice. Your accounts have not been accessed. Discuss your specific process with Renzo.';
$$('[data-idea-node]').forEach(b=>b.onclick=()=>{stop();highlight(+b.dataset.ideaNode,false);inspect(+b.dataset.ideaNode);});$$('[data-support]').forEach(b=>b.onclick=()=>{stop();inspect(+b.dataset.support);});$('#wb-watch').onclick=()=>{if(playing){stop();return;}if(step>=plan.nodes.length-1)step=-1;playing=true;$('#wb-watch').textContent='Pause workflow';$('.wb-live-map').classList.add('is-playing');advance();};$('#wb-next').onclick=()=>{stop();highlight((step+1)%plan.nodes.length,true);};$('#idea-result').hidden=false;
}
function highlight(i,follow){step=i;$$('[data-idea-node]').forEach((el,j)=>{el.classList.toggle('is-current',j===i);el.classList.toggle('is-complete',j<i);el.setAttribute('aria-current',j===i?'step':'false');});$$('[data-wire]').forEach(el=>{const e=plan.edges[+el.dataset.wire];el.classList.toggle('is-current',e.to===i);el.classList.toggle('is-complete',e.to<i);});$('#wb-step-count').textContent='Step '+(i+1)+' of '+plan.nodes.length;$('#wb-step-copy').textContent=plan.nodes[i].label+': '+plan.nodes[i].detail;if(follow){const box=$('#idea-canvas');box.scrollTo({left:Math.max(0,plan.nodes[i].x-box.clientWidth/2),top:Math.max(0,plan.nodes[i].y-box.clientHeight/2),behavior:reduced()?'instant':'smooth'});}}
function advance(){if(!playing)return;highlight(step+1,true);if(step>=plan.nodes.length-1){stop();return;}timer=setTimeout(advance,5200);}
function inspect(i){const n=plan.nodes[i];$('#idea-node-role').textContent='STEP '+(i+1)+' / '+roles[n.kind];$('#idea-node-title').textContent=n.label;const connected=out=>plan.edges.filter(e=>(out?e.from:e.to)===i).map(e=>{const idx=out?e.to:e.from;return {...plan.nodes[idx],id:String(idx)};});window.WBBackstage.mount($('#idea-backstage'),{title:n.label,role:roles[n.kind],symbol:symbols[n.kind],facts:[['Your request',plan.issue],['Proposed systems',n.tools.join(', ')||'To confirm during scoping']],action:n.detail,incoming:connected(false),outgoing:connected(true),evidence:plan.takeaway,evidenceLabel:'PROPOSED NEXT STEP',note:'Proposed from your input. No business records have been accessed or changed.',onJump:id=>{highlight(+id,false);inspect(+id);}});if(!$('#idea-node-dialog').open)$('#idea-node-dialog').showModal();}
// A failed provider never fabricates an AI result or loses the visitor's input.
function startingPoint(issue){
 return {live:false,issue,title:'A practical starting point for your workflow',summary:'The AI service could not complete your proposal. This standard planning outline keeps your idea moving; Renzo can tailor it after reviewing your process.',takeaway:'Discuss the task, current tools and approval rules before choosing a connection or committing to a build.',assumptions:['Your systems, data access and integration options still need checking.','AI may not be necessary; use rules for predictable work and people for decisions.','No business accounts have been accessed and no work has been executed.'],nodes:[
 {kind:'input',label:'Describe the task',detail:'Use your description as the starting point. Confirm what triggers the work and what a useful result looks like.',tools:[]},
 {kind:'data',label:'Check the source information',detail:'Identify the records, tools, owners and permissions needed. Check the quality of the information before connecting anything.',tools:[]},
 {kind:'automation',label:'Choose the smallest useful change',detail:'Confirm which steps can use existing integrations or clear rules. Consider AI only where interpretation or drafting helps.',tools:[]},
 {kind:'human',label:'Review scope and safeguards',detail:'A person approves access, exception handling, cost and success measures before implementation.',tools:[]},
 {kind:'outcome',label:'Test and measure one workflow',detail:'Test with sample records, compare against the current process, and agree ownership before any wider rollout.',tools:[]}],edges:[{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4}]};
}
function validPlan(data){
 if(data?.live!==true||!Array.isArray(data.nodes)||data.nodes.length!==5||!Array.isArray(data.edges)||data.edges.length<4||data.edges.length>8)return false;
 if(!['title','summary','takeaway'].every(k=>typeof data[k]==='string'&&data[k].length>0&&data[k].length<=1000)||!Array.isArray(data.assumptions)||!data.assumptions.length||data.assumptions.length>3||!data.assumptions.every(a=>typeof a==='string'&&a.length>0&&a.length<=1000))return false;
 const kinds=new Set(Object.keys(roles)),connected=new Set();
 if(!data.nodes.every(n=>n&&kinds.has(n.kind)&&typeof n.label==='string'&&n.label.length>0&&n.label.length<=100&&typeof n.detail==='string'&&n.detail.length>0&&n.detail.length<=1000&&Array.isArray(n.tools)&&n.tools.length<=3&&n.tools.every(t=>typeof t==='string'&&t.length>0&&t.length<=100)))return false;
 if(!data.nodes.some(n=>n.kind==='human')||data.nodes[4].kind!=='outcome')return false;
 for(const e of data.edges){if(!e||!Number.isInteger(e.from)||!Number.isInteger(e.to)||e.from<0||e.to>=5||e.from>=e.to)return false;connected.add(e.from);connected.add(e.to);}
 return connected.size===5&&[0,1,2,3].every(i=>data.edges.some(e=>e.from===i&&e.to===i+1));
}
async function generate(scroll=true){
 if(busy)return;
 const issue=$('#own-idea').value.trim();
 if(issue.length<12||issue.length>2000){$('#idea-error').textContent='Describe your idea in 12 to 2,000 characters.';$('#own-idea').setAttribute('aria-invalid','true');$('#own-idea').focus();return;}
 stop();const run=++sequence;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),35000);
 busy=true;submitted=issue;$('#idea-result').hidden=true;$('#imagine-button').disabled=true;$('#imagine-button').textContent='Designing your workflow…';$('#idea-cancel').hidden=false;$('#own-form').setAttribute('aria-busy','true');$('#idea-error').textContent='Connecting the steps. If AI is unavailable, you will still get a planning outline.';$('#own-idea').setAttribute('aria-invalid','false');
 const workflow=$('#idea-angle').value;window.WBAnalytics?.track('diagnostic_started',{workflow});
 try{
  const url=window.WBWordPress.enquiries.replace('enquiries','possibility');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({issue,angle:workflow,priority:$('#idea-priority').value}),signal:controller.signal});
  const data=await response.json();if(!response.ok||!validPlan(data))throw Error('AI proposal unavailable');
  if(run!==sequence||$('#own-idea').value.trim()!==issue)return;
  plan={...data,issue};render();$('#idea-error').textContent='';window.WBAnalytics?.track('diagnostic_completed',{workflow});
 }catch(e){
  if(run!==sequence||$('#own-idea').value.trim()!==issue)return;
  plan=startingPoint(issue);render();$('#idea-error').textContent='Your idea is retained. Review this standard outline, retry the AI, or discuss it with Renzo.';window.WBAnalytics?.track('diagnostic_fallback',{workflow});
 }finally{
  clearTimeout(timeout);if(run===sequence){busy=false;$('#idea-cancel').hidden=true;$('#imagine-button').disabled=false;$('#imagine-button').textContent=plan?.live===false?'Retry AI workflow ↗':'Design my workflow ↗';$('#own-form').removeAttribute('aria-busy');if(scroll&&plan&&!$('#idea-result').hidden){$('#idea-result').scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});$('#idea-result-title').focus({preventScroll:true});}}
 }
}
$('#idea-cancel').onclick=()=>{if(!busy)return;sequence++;controller?.abort();busy=false;$('#idea-cancel').hidden=true;$('#imagine-button').disabled=false;$('#imagine-button').textContent='Design my workflow ↗';$('#own-form').removeAttribute('aria-busy');$('#idea-error').textContent='Browser request cancelled. Your idea is still here. The provider may already have received the request.';$('#own-idea').focus({preventScroll:true});};
$('#own-form').onsubmit=e=>{e.preventDefault();generate();};$$('[data-idea]').forEach(b=>b.onclick=()=>{if(busy)return;$('#own-idea').value=b.dataset.idea;$('#idea-angle').value='auto';generate();});$('#idea-angle').onchange=()=>generate(false);$('#idea-priority').onchange=()=>generate(false);
$('#own-idea').addEventListener('input',()=>{if(busy){sequence++;controller?.abort();busy=false;$('#idea-cancel').hidden=true;$('#imagine-button').disabled=false;$('#imagine-button').textContent='Design my workflow ↗';$('#own-form').removeAttribute('aria-busy');}if($('#own-idea').value.trim()!==submitted){stop();$('#idea-result').hidden=true;$('#idea-error').textContent=plan?'Your idea changed. Generate a new workflow to update it.':'';}});
$('#idea-reset').onclick=()=>{stop();sequence++;controller?.abort();busy=false;$('#idea-cancel').hidden=true;plan=null;submitted='';$('#idea-result').hidden=true;$('#own-idea').value='';$('#idea-error').textContent='';$('#imagine-button').disabled=false;$('#imagine-button').textContent='Design my workflow ↗';$('#own-form').removeAttribute('aria-busy');$('#own-idea').focus();};
$('#idea-node-back').onclick=()=>$('#idea-node-dialog').close();$('#idea-build').onclick=()=>{if(!plan)return;stop();const brief='Hi Renzo,\n\nI would like to explore this workflow:\n'+plan.issue+'\n\n'+(plan.live?'AI-generated proposal: ':'Standard planning outline: ')+plan.title+'\n'+plan.summary+'\n\nProposed steps:\n'+plan.nodes.map((n,i)=>(i+1)+'. '+n.label+': '+n.detail).join('\n')+'\n\nTo confirm:\n'+plan.assumptions.join('\n')+'\n\nCould we discuss scope and a practical first step?';window.WBSystemUI.contact(null,null,brief);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});$('#imagine-button').textContent='Design my workflow ↗';window.WBPlayArea={generate,getPlan:()=>plan};
})();

;
/* /prompt-examples.js */
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

;
/* /enquiry.js */
(()=>{
 'use strict';const $=s=>document.querySelector(s),form=$('#enquiry-form');if(!form)return;
 const status=$('#enquiry-status'),submit=$('#enquiry-submit'),submitLabel=submit.textContent;let busy=false,requestId='',lastPayload='';const trackedLeads=new Set();
 function trackLead(id){
  if(trackedLeads.has(id)||document.body.classList.contains('logged-in')||typeof window.gtag!=='function')return;
  try{window.gtag('event','generate_lead',{send_to:'G-SZ0YNX9CXG',form_id:'enquiry-form',method:'contact_form'});trackedLeads.add(id);}catch{}
 }
 function reset(){if(busy)return;form.hidden=false;$('#enquiry-success').hidden=true;status.textContent='';}
 function getBrief(){const mode=$('#contact-run'),run=mode?.value?mode.selectedOptions[0].textContent:'';const found=$('#contact-found')?.value.trim()||'';return $('#contact-brief').value.trim()+(run?'\n\nHow I want the work to run: '+run:'')+(found?'\n\nHow I found Works Better: '+found:'')}
 function email(){$('#contact-email').href='mailto:hello@worksbetter.ai?subject='+encodeURIComponent('Works Better — could we build this?')+'&body='+encodeURIComponent(getBrief())}
 // Keep the draft only in this document. Reopening never resets validation,
 // an uncertain save, or the successful receipt; a new enquiry is explicit.
 let draftStarted=false;
 function seed(brief,mode){
  if(draftStarted)return false;
  const hasDetails=['#contact-brief','#contact-name','#contact-address','#contact-company','#contact-found'].some(id=>$(id)?.value.trim());
  draftStarted=true;
  if(hasDetails)return false;
  $('#contact-brief').value=brief;
  if(mode&&$('#contact-run')&&!$('#contact-run').value)$('#contact-run').value=mode;
  return true;
 }
 function open(){seed('');email();const dialog=$('#contact-dialog');if(dialog){if(!dialog.open)dialog.showModal()}else{$('#contact')?.scrollIntoView({behavior:'smooth'});$('#contact-name')?.focus({preventScroll:true})}window.WBAnalytics?.track('contact_open',{workflow:'general'})}
 if(!window.WBSystemUI){document.querySelectorAll('[data-contact]').forEach(b=>b.onclick=open);$('#contact-brief').oninput=email;$('#copy-brief').onclick=async()=>{try{await navigator.clipboard.writeText(getBrief());$('#copy-message').textContent='Copied.'}catch{$('#copy-message').textContent='Open the email draft to include your brief, selected delivery mode and source. Or copy your written brief manually.'}};}
 $('#enquiry-new').onclick=()=>{if(busy)return;requestId='';lastPayload='';form.reset();draftStarted=false;reset();email();$('#contact-name').focus()};
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!form.reportValidity())return;
  if($('#contact-brief').value.trim().length<12){status.textContent='Tell me a little more about the work you want to improve (at least 12 characters).';status.focus();return;}
  const brief=getBrief();
  const fields={name:$('#contact-name').value.trim(),email:$('#contact-address').value.trim(),company:$('#contact-company').value.trim(),brief:brief,website:$('#contact-website').value,source:location.pathname};
  const serial=JSON.stringify(fields);if(serial!==lastPayload){requestId=crypto.randomUUID();lastPayload=serial;}
  busy=true;submit.disabled=true;submit.textContent='Sending…';status.textContent='Saving your enquiry…';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(window.WBWordPress.enquiries,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,id:requestId}),signal:controller.signal});let data;try{data=await response.json()}catch{throw new Error('We could not confirm your enquiry. Your details are still here. Try again or use the email option below.')}
   if(!response.ok||!data.saved||typeof data.reference!=='string')throw new Error(data.error||'We could not save your enquiry. Try again or use the email option below.');
   trackLead(requestId);$('#enquiry-receipt').textContent='Your reference: '+data.reference;form.hidden=true;$('#enquiry-success').hidden=false;status.textContent='';$('#enquiry-new').focus();
  }catch(err){status.textContent=err.name==='AbortError'?'The confirmation took too long. Your details are still here. Retry to check the same enquiry, or use the email option below.':err.message;status.focus();}
  finally{clearTimeout(timeout);busy=false;submit.disabled=false;submit.textContent=submitLabel;}
 });
 window.WBEnquiry={reset,getBrief,seed};
 $('#contact-run')?.addEventListener('change',email);$('#contact-found')?.addEventListener('input',email);$('#contact-brief').addEventListener('change',email);
 if(location.hash==='#contact')document.querySelector('[data-contact]')?.click();
 window.addEventListener('hashchange',()=>{if(location.hash==='#contact')document.querySelector('[data-contact]')?.click();});
})();
