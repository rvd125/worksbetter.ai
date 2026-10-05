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
    const event = Object.freeze({ event: name, page: document.body.classList.contains('guide-page') ? 'guide' : cleanWorkflow(document.body?.getAttribute('data-workflow')) || 'home', workflow });
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
/* /enquiry.js */
(()=>{
 'use strict';const $=s=>document.querySelector(s),form=$('#enquiry-form');if(!form)return;
 const status=$('#enquiry-status'),submit=$('#enquiry-submit');let busy=false,requestId='',lastPayload='';const trackedLeads=new Set();
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
 function open(){seed('');email();if(!$('#contact-dialog').open)$('#contact-dialog').showModal();window.WBAnalytics?.track('contact_open',{workflow:'general'})}
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
  finally{clearTimeout(timeout);busy=false;submit.disabled=false;submit.textContent='Send my enquiry ↗';}
 });
 window.WBEnquiry={reset,getBrief,seed};
 $('#contact-run')?.addEventListener('change',email);$('#contact-found')?.addEventListener('input',email);
 if(location.hash==='#contact')document.querySelector('[data-contact]')?.click();
 window.addEventListener('hashchange',()=>{if(location.hash==='#contact')document.querySelector('[data-contact]')?.click();});
})();

;
/* /fleet.js */
/* Internal catalogue removed. Public, user-confirmed workflow logic only. */
window.WBSafeguards = Object.freeze({
 enquiry:{title:'Customer enquiry: two separate decisions',cases:[['new','New customer'],['known','Existing customer']],steps:[
 ['Outlook enquiry','A fictional customer sends an enquiry.'],
 ['Check customer records','AI checks the customer database. If needed, research the company from the email domain.'],
 ['Prepare the team brief','The team receives an enriched brief and a prepared meeting reply.'],
 ['Staff approval','A person reviews the prepared response before sending.'],
 ['Zapier sends the reply','Staff approval allows the meeting reply to be sent. The customer time is still unconfirmed.'],
 ['Customer confirms a time','Customer confirmation is a separate event from staff approval.'],
 ['Complete the handover','Connected actions complete confirmation, calendar and invitation, assignment and CRM updates.']]},
 invoice:{title:'Supplier invoice: stop, approve or decline',cases:[['match','New invoice; purchase order matches'],['mismatch','New invoice; purchase order differs'],['duplicate','Already recorded in Xero']],steps:[
 ['Invoice received','The supplier and invoice in this demonstration are fictional.'],
 ['Check Xero','AI checks for an existing invoice. A duplicate stops here.'],
 ['Compare the purchase order','A new invoice is compared with its purchase order. A mismatch remains visible.'],
 ['Human decision','Approve or decline. A mismatch needs an explanation before approval.'],
 ['n8n connects the approved work','Save the invoice in Google Drive, record it in Xero with approver details, and prepare/connect a Gmail receipt acknowledgement. Receipt is not payment.']]},
 reporting:{title:'Daily reporting: agree the data before the dashboard',cases:[['matched','Source references agree'],['unresolved','An unresolved source reference']],steps:[
 ['Five Xero files and Simpro','Collect source records for weekday reporting. Excel belonged to the former manual assembly; the demonstration uses fictional records.'],
 ['Match the references','Connect corresponding records without treating missing information as zero.'],
 ['Reconcile and review','Hold unresolved data for review. Resolve the issue and rerun the checks.'],
 ['Refresh the decision dashboard','Agreed data reaches management reporting refreshed on weekdays. Human review continues; net savings and financial return have not been calculated.']]}
});

(()=>{
 'use strict';const $=s=>document.querySelector(s),data=window.WBSafeguards;
 if(!data||!$('#wb-story-steps'))return;
 let key='enquiry',scenario='new',step=0,terminal=false,held=false,resolved=false;
 const next=$('#wb-next'),decline=$('#wb-decline'),retry=$('#wb-retry'),status=$('#wb-story-status');
 const message=text=>{status.textContent=text;};
 function render(){
  const story=data[key];$('#wb-story-title').textContent=story.title;
  const list=$('#wb-story-steps');list.replaceChildren();
  story.steps.forEach(([label,detail],i)=>{const li=document.createElement('li'),h=document.createElement('strong'),p=document.createElement('p');h.textContent=label;p.textContent=detail;li.append(h,p);li.className=i<step?'complete':i===step?'current':'waiting';if(i===step)li.setAttribute('aria-current','step');list.append(li);});
  next.disabled=terminal||held;next.textContent='Next step';decline.hidden=!(key==='invoice'&&step===3&&!terminal);retry.hidden=!held;
  $('#wb-reason-wrap').hidden=!(key==='invoice'&&scenario==='mismatch'&&step===3&&!terminal);
  if(key==='enquiry'&&step===3)next.textContent='Approve prepared reply';
  if(key==='enquiry'&&step===4)next.textContent='Customer confirms a time';
  if(key==='enquiry'&&step===5)next.textContent='Complete connected actions';
  if(key==='invoice'&&step===3)next.textContent='Approve and connect';
  if(step===story.steps.length-1){terminal=true;next.disabled=true;next.textContent='Example complete';}
 }
 function reset(){step=0;terminal=false;held=false;resolved=false;$('#wb-reason').value='';message('Fictional demonstration. No email is sent and no business record is changed.');render();}
 function choose(chosen){key=chosen;const select=$('#wb-story-case');select.replaceChildren();data[key].cases.forEach(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o);});scenario=select.value;document.querySelectorAll('[data-story]').forEach(b=>{const selected=b.dataset.story===key;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('primary',selected);});reset();}
 document.querySelectorAll('[data-story]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.story)));
 $('#wb-story-case').addEventListener('change',e=>{scenario=e.target.value;reset();});$('#wb-reset').addEventListener('click',reset);
 next.addEventListener('click',()=>{
  if(terminal||held)return;
  if(key==='invoice'&&step===3&&scenario==='mismatch'&&!$('#wb-reason').value.trim()){message('Explain the purchase-order mismatch before approving.');$('#wb-reason').focus();return;}
  step++;
  if(key==='invoice'&&step===1&&scenario==='duplicate'){terminal=true;message('Duplicate found in Xero. Stopped: nothing is filed, recorded or acknowledged. Reset to try another fictional case.');}
  else if(key==='reporting'&&step===2&&scenario==='unresolved'&&!resolved){held=true;message('An unresolved reference holds the dashboard update. Review the source, resolve it and rerun.');}
  else if(key==='enquiry'&&step===1){message(scenario==='known'?'Existing customer found. Use the customer record for context.':'No customer match. Research the company from the email domain before preparing the brief.');}
  else if(key==='enquiry'&&step===4){message('Staff approved the reply; Zapier sends it. Customer confirmation is still pending.');}
  else if(key==='enquiry'&&step===5){message('The customer confirmed a time. Calendar, assignment and CRM actions can now follow.');}
  else if(key==='invoice'&&step===4){message('Approved. n8n connects filing, the Xero record with approver details and a Gmail receipt acknowledgement. No payment occurs.');}
  else if(key==='reporting'&&step===3){message('Checks passed. The fictional dashboard is refreshed; the documented implementation refreshes on weekdays.');}
  else message(data[key].steps[step][1]);
  window.WBAnalytics?.track('workflow_step_open',{workflow:key});render();
 });
 decline.addEventListener('click',()=>{if(key!=='invoice'||step!==3||terminal)return;terminal=true;message('Declined. Nothing is filed, recorded or acknowledged. Reset to try another case.');render();});
 retry.addEventListener('click',()=>{if(!held)return;resolved=true;held=false;step=1;message('The source has been reviewed in this fictional case. Rerun reconciliation before refreshing the dashboard.');render();});
 function chooseFromHash(){const requested=window.location.hash.slice(1);if(Object.prototype.hasOwnProperty.call(data,requested))choose(requested);}
 choose(key);chooseFromHash();window.addEventListener('hashchange',chooseFromHash);
})();
