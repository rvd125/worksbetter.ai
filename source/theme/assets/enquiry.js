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
