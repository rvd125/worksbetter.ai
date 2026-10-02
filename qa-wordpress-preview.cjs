const {chromium}=require('playwright'),fs=require('fs');
const config=JSON.parse(fs.readFileSync(process.env.WB_PREVIEW_CONFIG,'utf8'));
const out=process.env.WB_QA_OUTPUT,checks=[],errors=[],observations=[];
const url=path=>'https://worksbetter.ai'+path+(process.env.WB_PUBLIC_QA?'':'?wpvibe_preview='+encodeURIComponent(config.token));
const check=(name,pass)=>{checks.push({name,pass:!!pass});if(!pass)throw Error(name)};
(async()=>{
 const browser=await chromium.launch({headless:true,proxy:{server:process.env.HTTPS_PROXY}});
 try{
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   await context.route('**/*',r=>new URL(r.request().url()).hostname==='worksbetter.ai'&&r.request().method()==='GET'?r.continue():r.abort());
   await context.addInitScript(()=>{window.__events=[];window.gtag=(...a)=>window.__events.push(a)});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   let payload,requests=0;
   await page.route('**/wp-json/worksbetter/v1/enquiries',async r=>{requests++;payload=r.request().postDataJSON();await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({saved:true,reference:'WB-SYNTHETIC-INTERCEPTED-STAGING'})})});
   const response=await page.goto(url('/'),{waitUntil:'networkidle'});
   // The native GA bootstrap defines gtag after init scripts; intercept it after
   // the actual page loads. This checks client calls, not GA processing.
   await page.evaluate(()=>{window.__events=[];window.gtag=(...a)=>window.__events.push(a)});
   check(`home ${width}: actual TLS response200`,response.status()===200);
   check(`home ${width}: one heading`,await page.locator('h1').count()===1);
   check(`home ${width}: three delivery modes`,await page.locator('.wb-mode-grid article').count()===3);
   check(`home ${width}: isolated draft assets`,await page.locator(`script[src*="${process.env.WB_PUBLIC_QA?'worksbetter-wpvibe-draft':'worksbetter-wpvibe-draft-wpvibe-draft'}/assets/systems.js"]`).count()===1);
   check(`home ${width}: no overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(`home ${width}: one Guides destination`,await page.locator('nav[aria-label="Main navigation"] a').evaluateAll(as=>as.filter(a=>{const u=new URL(a.href);return u.origin===location.origin&&u.pathname.replace(/\/+$/,'')==='/guides'}).length)===1);
   observations.push({width,title:await page.title(),heading:await page.locator('h1').innerText(),description:await page.locator('meta[name="description"]').getAttribute('content'),opening:await page.locator('.hero-invitation').innerText()});
   await page.screenshot({path:out+`/wordpress-home-${width}.png`});
   if(process.env.WB_COPY_ONLY){await context.close();continue;}
   await page.locator('#delivery-modes').screenshot({path:out+`/wordpress-modes-${width}.png`});
   await page.locator('.examples-menu summary').click();check(`menu ${width}: opens`,await page.locator('.examples-menu').evaluate(e=>e.open));await page.keyboard.press('Escape');check(`menu ${width}: closes`,!(await page.locator('.examples-menu').evaluate(e=>e.open)));
   await page.locator('[data-delivery-mode="automatic"]').click();check(`contact ${width}: selected automatic`,await page.locator('#contact-run').inputValue()==='automatic');
   await page.locator('#enquiry-submit').click();check(`contact ${width}: blank cannot send`,requests===0);
   await page.locator('#contact-name').fill('SYNTHETIC INTERCEPTED STAGING QA');await page.locator('#contact-address').fill('qa@example.com');await page.locator('#contact-brief').fill('SYNTHETIC INTERCEPTED STAGING QA: no real enquiry or notification.');
   await page.screenshot({path:out+`/wordpress-form-${width}.png`});await page.locator('#enquiry-submit').click();await page.locator('#enquiry-success').waitFor({state:'visible'});
   check(`contact ${width}: mock payload retains preference`,payload.brief.includes('Fully automated AI workflow'));
   const events=await page.evaluate(()=>window.__events);check(`contact ${width}: one client conversion`,events.filter(e=>e[1]==='generate_lead').length===1);check(`contact ${width}: no PII in custom events`,!JSON.stringify(events).match(/qa@example|SYNTHETIC INTERCEPTED|Fully automated AI workflow/));
   await page.goto(url('/inside-an-ai-agent-fleet/'),{waitUntil:'networkidle'});check(`safeguards ${width}: live PHP shadow loaded`,await page.locator('#wb-story-steps li').count()===7);
   for(let i=0;i<4;i++)await page.locator('#wb-next').click();check(`enquiry ${width}: staff/customer separate`,(await page.locator('#wb-story-status').innerText()).includes('Customer confirmation is still pending'));
   await page.locator('[data-story="invoice"]').click();await page.locator('#wb-story-case').selectOption('duplicate');await page.locator('#wb-next').click();check(`invoice ${width}: duplicate stops`,await page.locator('#wb-next').isDisabled());
   await page.locator('#wb-story-case').selectOption('mismatch');for(let i=0;i<4;i++)await page.locator('#wb-next').click();check(`invoice ${width}: reason required`,await page.locator('#wb-reason').isVisible());
   await page.locator('#wb-reason').fill('SYNTHETIC: agreed scope explains this fictional difference.');await page.locator('#wb-next').click();check(`invoice ${width}: no payment claim`,(await page.locator('#wb-story-status').innerText()).includes('No payment occurs'));
   await page.locator('[data-story="reporting"]').click();await page.locator('#wb-story-case').selectOption('unresolved');await page.locator('#wb-next').click();await page.locator('#wb-next').click();check(`reporting ${width}: held for review`,await page.locator('#wb-next').isDisabled()&&await page.locator('#wb-retry').isVisible());
   await page.screenshot({path:out+`/wordpress-reporting-held-${width}.png`});await page.locator('#wb-retry').click();check(`reporting ${width}: retry resumes`,!(await page.locator('#wb-next').isDisabled()));
   await page.goto(url('/guides/'),{waitUntil:'networkidle'});check(`guides ${width}: native contact link`,await page.locator('.guide-header a[href$="#contact"]').isVisible());await page.screenshot({path:out+`/wordpress-guides-${width}.png`});await page.locator('.guide-header a[href$="#contact"]').click();await page.locator('#contact-dialog').waitFor({state:'visible'});check(`guides ${width}: contact journey opens`,await page.locator('#contact-dialog').evaluate(e=>e.open));
   await page.goto(url('/why-are-we-entering-this-twice/'),{waitUntil:'networkidle'});check(`article ${width}: contact/privacy footer`,await page.locator('a[href$="#contact"]').count()>0&&await page.locator('a[href*="/enquiry-privacy/"]').count()>0);
   await page.goto(url('/enquiry-privacy/'),{waitUntil:'networkidle'});
   check(`privacy ${width}: response heading`,await page.locator('h1').count()===1);
   check(`privacy ${width}: no overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(`privacy ${width}: owner email`,(await page.locator('main').innerText()).includes('hello@worksbetter.ai'));
   await page.getByText('Where is it stored, and who can see it?',{exact:true}).click();await page.getByText('Is my idea sent to an AI model?',{exact:true}).click();
   check(`privacy ${width}: storage/AI disclosure`,(await page.locator('main').innerText()).includes('WordPress')&&(await page.locator('main').innerText()).includes('OpenRouter'));
   check(`privacy ${width}: old email absent`,!(await page.locator('body').innerText()).includes('hello@renzodemartini.com'));
   await page.screenshot({path:out+`/wordpress-privacy-${width}.png`,fullPage:true});
   await page.locator('[data-contact]').first().click();await page.locator('#contact-dialog').waitFor({state:'visible'});
   await page.locator('#contact-brief').fill('SYNTHETIC INTERCEPTED QA: connect the tools our business already uses.');
   check(`privacy ${width}: edited brief email destination`,(await page.locator('#contact-email').getAttribute('href')).startsWith('mailto:hello@worksbetter.ai?'));
   await page.locator('#contact-run').selectOption('approval');
   await page.locator('#contact-found').fill('SYNTHETIC INTERCEPTED QA');
   const email=await page.locator('#contact-email').getAttribute('href');
   check(`privacy ${width}: mode/source preserve email`,email.startsWith('mailto:hello@worksbetter.ai?')&&decodeURIComponent(email).includes('approval')&&decodeURIComponent(email).includes('SYNTHETIC INTERCEPTED QA'));
   await page.screenshot({path:out+`/wordpress-privacy-contact-${width}.png`});
   await page.goto(url('/'),{waitUntil:'networkidle'});await page.locator('[data-delivery-mode="automatic"]').click();
   await page.locator('#contact-brief').fill('SYNTHETIC INTERCEPTED QA: handle routine tasks in our existing systems.');
   check(`home ${width}: systems opener/edit email destination`,(await page.locator('#contact-email').getAttribute('href')).startsWith('mailto:hello@worksbetter.ai?'));
   await page.locator('#contact-run').selectOption('tool');await page.locator('#contact-found').fill('SYNTHETIC INTERCEPTED QA');
   check(`home ${width}: mode/source maintain email destination`,(await page.locator('#contact-email').getAttribute('href')).startsWith('mailto:hello@worksbetter.ai?'));
   await context.close();
  }
  check('no uncaught browser errors',errors.length===0);
 }finally{
  await browser.close();fs.writeFileSync(out+(process.env.WB_COPY_ONLY?'/wordpress-existing-systems-qa.json':'/wordpress-preview-qa.json'),JSON.stringify({scope:process.env.WB_PUBLIC_QA?'Actual public WordPress HTTPS desktop/mobile checks; client submissions intercepted; no real notification or GA processing evidence':process.env.WB_COPY_ONLY?'Actual isolated WordPress HTTPS home render after owner existing-systems clarification; desktop/mobile; no enquiry POST or live deployment. TLS verification enabled.':'Actual isolated WordPress HTTPS preview, ephemeral container trusts only configured proxy CA; TLS verification enabled; all enquiry POSTs intercepted; not production deployment or real delivery/GA receipt',checks,errors,observations},null,2));
 }
 console.log(JSON.stringify({checks:checks.length,failed:checks.filter(x=>!x.pass),errors}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
