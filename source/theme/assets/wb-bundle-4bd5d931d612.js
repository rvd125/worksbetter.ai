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
