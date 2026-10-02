const {chromium}=require('playwright'),fs=require('fs');
(async()=>{const checks=[],errors=[],check=(name,pass)=>{checks.push({name,pass:!!pass});if(!pass)throw Error(name)};
const browser=await chromium.launch({headless:true,proxy:{server:process.env.HTTPS_PROXY}});
try{for(const width of [1440,390]){const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
await ctx.route('**/*',r=>['worksbetter.ai','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(r.request().url()).hostname)&&r.request().method()==='GET'?r.continue():r.abort());
const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('https://worksbetter.ai/',{waitUntil:'networkidle'});
for(const key of ['invoice','enquiry','finance','onboarding','routing','reporting']){const card=page.locator('#system-'+key);check(`${width} ${key}: diagram present`,await card.count()===1);
await card.locator('[data-scenarios]').click();const dialog=card.locator('.scenario-dialog');check(`${width} ${key}: situation opens`,await dialog.isVisible());await dialog.locator('button.close').click();
await card.locator('[data-run]').click();await card.locator('[data-result]').click();const result=card.locator('.system-result');check(`${width} ${key}: result opens`,await result.isVisible());
for(let i=0;i<20;i++){if(await result.locator('[data-approve]').count()){await result.locator('[data-approve]').click();continue}if(await result.locator('[data-result-next]').count()){await result.locator('[data-result-next]').click();continue}break}
check(`${width} ${key}: bounded completion`,await result.locator('.completion-note').count()===1);await result.locator('[data-hide-result]').click();await card.locator('[data-run]').click();check(`${width} ${key}: replay`,await card.locator('.system-status').innerText()!=='');}
await ctx.close();}check('no uncaught browser errors',errors.length===0);fs.writeFileSync('/qa-output/growth-pass/acquisition-tools/qa.json',JSON.stringify({scope:'Actual public desktop/mobile six example interactions; only site/Google Fonts GET allowed, all POST and external analytics blocked',checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors}));}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
