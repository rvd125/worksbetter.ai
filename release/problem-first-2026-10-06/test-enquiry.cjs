/* Contract tests for the new home and existing modal, with no live submissions.
   Run: NODE_PATH=<qa-runtime>/node_modules node test-enquiry.cjs */
const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const theme=path.resolve(__dirname,'../../source/theme');
let count=0;
function check(ok,message){assert.ok(ok,message);count++;}
function render(){
 if(process.env.WB_NATIVE_HTML)return fs.readFileSync(process.env.WB_NATIVE_HTML,'utf8');
 let s=fs.readFileSync(path.join(theme,'front-page.php'),'utf8');
 s=s.replace(/<\?php echo esc_url\(home_url\('([^']*)'\)\); \?>/g,(_,u)=>'https://worksbetter.ai'+u)
 .replace(/<\?php echo esc_url\(get_template_directory_uri\(\) \. '([^']*)'\); \?>/g,(_,u)=>'https://worksbetter.ai/wp-content/themes/worksbetter'+u)
 .replace(/<\?php body_class\('problem-home'\); \?>/,'class="problem-home"').replace(/<\?php language_attributes\(\); \?>/,'lang="en-AU"')
 .replace(/<\?php bloginfo\('charset'\); \?>/,'UTF-8').replace(/<\?php[\s\S]*?\?>/g,'');
 return s;
}
function setup({modal=false,loggedIn=false,query=""}={}){
 const dom=new JSDOM(render(),{url:'https://worksbetter.ai/'+query,runScripts:'outside-only'}),w=dom.window,d=w.document;
 const calls=[],events=[];
 w.WBWordPress={enquiries:'https://worksbetter.ai/wp-json/worksbetter/v1/enquiries'};
 w.gtag=(...args)=>events.push(args);
 if(loggedIn)d.body.classList.add('logged-in');
 if(modal){const dialog=d.createElement('dialog');dialog.id='contact-dialog';dialog.showModal=()=>{dialog.open=true};d.body.append(dialog);const b=d.createElement('button');b.dataset.contact='';d.body.append(b);}
 w.fetch=async(url,opts)=>{calls.push({url,body:JSON.parse(opts.body)});return{ok:true,json:async()=>({saved:true,reference:'TEST-001'})}};
 for(const f of ['measurement.js','enquiry.js','problem-home.js']) w.eval(fs.readFileSync(path.join(theme,'assets',f),'utf8'));
 return{dom,w,d,calls,events};
}
const fill=t=>{t.d.querySelector('#contact-name').value='Test Person';t.d.querySelector('#contact-address').value='test@example.invalid';t.d.querySelector('#contact-brief').value='Our report combines five accounting files.';};
const submit=async t=>{t.d.querySelector('form').dispatchEvent(new t.w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setImmediate(r));};
(async()=>{
 const markup=new JSDOM(render()).window.document;
 check(markup.querySelectorAll('h1').length===1,'Exactly one H1');
 const ids=[...markup.querySelectorAll('[id]')].map(x=>x.id);check(ids.length===new Set(ids).size,'No duplicate IDs');
 for(const a of markup.querySelectorAll('a[href^="#"]'))check(markup.getElementById(a.hash.slice(1)),'Every fragment target exists: '+a.hash);
 for(const el of markup.querySelectorAll('input,textarea'))check(markup.querySelector(`label[for="${el.id}"]`),'Every field labelled');
 check(markup.querySelector('form').method==='post','No GET fallback exposes form data in URL');
 check(markup.getElementById('start-small')&&markup.getElementById('playground')&&markup.getElementById('contact'),'Legacy incoming sections remain');
 let t=setup();fill(t);await submit(t);
 check(t.calls.length===1&&t.calls[0].body.id,'One POST with idempotency ID');
 check(t.d.querySelector('form').hidden&& !t.d.querySelector('#enquiry-success').hidden,'Receipt shown only after saved response');
 check(t.events.filter(e=>e[1]==='generate_lead').length===1,'One lead event after success');
 check(t.d.querySelector('#enquiry-submit').textContent.includes('Send to Renzo'),'CTA label restored');
 check(!JSON.stringify(t.events).includes('test@example.invalid')&&!JSON.stringify(t.events).includes('accounting'),'No enquiry content in measurement');
 t.d.querySelector('#enquiry-new').click();check(!t.d.querySelector('form').hidden&&t.d.querySelector('#contact-brief').value==='','Explicit new enquiry resets');t.dom.window.close();
 t=setup();fill(t);let attempt=0;t.w.fetch=async(u,o)=>{t.calls.push(JSON.parse(o.body));if(!attempt++)throw Object.assign(new Error('timeout'),{name:'AbortError'});return{ok:true,json:async()=>({saved:true,reference:'TEST-002'})}};
 await submit(t);check(!t.d.querySelector('form').hidden&&t.d.querySelector('#enquiry-success').hidden,'Timeout never shows success');
 check(t.d.querySelector('#contact-brief').value.includes('five accounting'),'Timeout preserves draft');
 check(t.events.every(e=>e[1]!=='generate_lead'),'Timeout not a lead');
 await submit(t);check(t.calls[0].id===t.calls[1].id,'Unchanged retry reuses ID');t.dom.window.close();
 t=setup();fill(t);t.w.fetch=async(u,o)=>{t.calls.push(JSON.parse(o.body));return{ok:true,json:async()=>({saved:true})}};await submit(t);
 check(t.d.querySelector('#enquiry-success').hidden,'Missing reference not confirmed');
 t.d.querySelector('#contact-brief').value+=' More context.';await submit(t);check(t.calls[0].id!==t.calls[1].id,'Changed payload gets new ID');t.dom.window.close();
 t=setup();t.d.querySelector('[data-problem="reporting"]').click();check(t.d.querySelector('#contact-brief').value.includes('reports by hand'),'Contextual prompt seeded');
 check(decodeURIComponent(t.d.querySelector('#contact-email').href).includes('reports by hand'),'Seed updates email draft');
 t.d.querySelector('#contact-brief').value='Keep my own edited context.';t.d.querySelector('[data-problem="invoice"]').click();check(t.d.querySelector('#contact-brief').value==='Keep my own edited context.','Problem selection preserves edited draft');
 check(t.w.WBAnalytics.snapshot().every(e=>e.page==='home'),'Home taxonomy distinct');t.dom.window.close();
 t=setup();fill(t);t.d.querySelector('[data-problem="enquiry"]').click();check(t.d.querySelector('#contact-brief').value.includes('five accounting'),'Pre-existing form input never replaced');t.dom.window.close();
 t=setup({modal:true});fill(t);t.d.querySelector('[data-contact]').click();check(t.d.querySelector('#contact-dialog').open,'Legacy modal still opens');check(t.d.querySelector('#contact-brief').value.includes('five accounting'),'Legacy open preserves draft');t.dom.window.close();
 t=setup({loggedIn:true});fill(t);await submit(t);check(t.events.length===0,'Owner traffic excluded from events');t.dom.window.close();
 t=setup();fill(t);let resolve;t.w.fetch=async(u,o)=>{t.calls.push(JSON.parse(o.body));return new Promise(r=>resolve=r)};await submit(t);await submit(t);check(t.calls.length===1,'Double submit suppressed while pending');resolve({ok:true,json:async()=>({saved:true,reference:'TEST-003'})});await new Promise(r=>setImmediate(r));t.dom.window.close();
 t=setup({query:'?problem=reporting#contact'});check(t.d.querySelector('#contact-brief').value.includes('reports by hand'),'Known referral category seeds a useful prompt');t.dom.window.close();
 t=setup({query:'?problem=%3Cscript%3Ebad%3C/script%3E'});check(t.d.querySelector('#contact-brief').value===''&&t.w.WBAnalytics.snapshot().length===0,'Unknown referral values ignored');t.dom.window.close();
 t=setup({query:'?problem=reporting&utm_source=partner&utm_medium=referral&utm_campaign=reporting_handoff#contact'});fill(t);await submit(t);
 check(!t.d.querySelector('#contact-campaign').hidden,'Recognised campaign context shown before submitting');
 check(t.calls[0].body.brief.includes('Campaign link: Reporting handoff (partner / referral)'),'Recognised campaign context saved with enquiry');
 check(t.d.querySelector('#contact-brief').value==='Our report combines five accounting files.','Attribution does not rewrite the buyer’s words');
 t.d.querySelector('#contact-brief').dispatchEvent(new t.w.Event('change'));check(decodeURIComponent(t.d.querySelector('#contact-email').href).includes('Campaign link: Reporting handoff'),'Email fallback includes recognised context');t.dom.window.close();
 t=setup({query:'?problem=reporting&utm_source=private-person@example.invalid&utm_medium=referral&utm_campaign=reporting_handoff'});fill(t);await submit(t);check(t.d.querySelector('#contact-campaign').hidden&&!JSON.stringify(t.calls).includes('private-person'),'Unrecognised campaign values never copied into enquiry');t.dom.window.close();
 console.log(JSON.stringify({passed:count,liveSubmissions:0,scope:'DOM and submission contract only; no visual/browser rendering'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
