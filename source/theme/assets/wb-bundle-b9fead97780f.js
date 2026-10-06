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
/* /enquiry.js */
(()=>{
 'use strict';const $=s=>document.querySelector(s),form=$('#enquiry-form');if(!form)return;
 const status=$('#enquiry-status'),submit=$('#enquiry-submit'),submitLabel=submit.textContent;let busy=false,requestId='',lastPayload='';const trackedLeads=new Set();
 function trackLead(id){
  if(trackedLeads.has(id)||document.body.classList.contains('logged-in')||typeof window.gtag!=='function')return;
  try{window.gtag('event','generate_lead',{send_to:'G-SZ0YNX9CXG',form_id:'enquiry-form',method:'contact_form'});trackedLeads.add(id);}catch{}
 }
 function reset(){if(busy)return;form.hidden=false;$('#enquiry-success').hidden=true;status.textContent='';}
 function getBrief(){const mode=$('#contact-run'),run=mode?.value?mode.selectedOptions[0].textContent:'';const found=$('#contact-found')?.value.trim()||'';const campaign=$('#contact-campaign')?.textContent.trim()||'';return $('#contact-brief').value.trim()+(run?'\n\nHow I want the work to run: '+run:'')+(found?'\n\nHow I found Works Better: '+found:'')+(campaign?'\n\n'+campaign:'')}
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
