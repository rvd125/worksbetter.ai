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
