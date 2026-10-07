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
