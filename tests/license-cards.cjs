/* Focused mobile, keyboard, and persistence checks for the license-card UI. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXE});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const root=path.resolve(__dirname,'../docs'),out=path.resolve(__dirname,'../test-results');
 await context.route('http://opendraft.test/**',async r=>{const rel=new URL(r.request().url()).pathname.slice(1)||'index.html';const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return r.fulfill({status:404});return r.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css'})[path.extname(file)]||'text/plain'});});
 const page=await context.newPage();await page.goto('http://opendraft.test/create.html');
 const group=page.getByRole('group',{name:'License for your original text',exact:true});
 assert.equal(await group.getByRole('radio').count(),9);
 await group.getByRole('radio',{name:'Not decided / unknown',exact:true}).focus();await page.keyboard.press('ArrowRight');
 assert(await group.getByRole('radio',{name:'All rights reserved',exact:true}).isChecked());
 await page.locator('label[for="license-3"]').tap();assert(await group.getByRole('radio',{name:'CC BY-SA 4.0',exact:true}).isChecked());
 for(const radio of await group.getByRole('radio').all()){
  await radio.check();assert.equal(await group.locator('input:checked').count(),1);
  const value=await radio.inputValue();await page.waitForFunction(v=>JSON.parse(sessionStorage.getItem('open-draft:v1:/')||'{}').license===v,value);
 }
 await group.getByRole('radio',{name:'CC BY-NC-SA 4.0',exact:true}).check();
 await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('open-draft:v1:/')||'{}').license==='CC-BY-NC-SA-4.0');
 await page.reload();assert(await group.getByRole('radio',{name:'CC BY-NC-SA 4.0',exact:true}).isChecked());
 const sizes=await group.locator('label').evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
 assert(sizes.every(r=>r.w>=44&&r.h>=44));
 await group.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'license-cards-mobile.png'),fullPage:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow at '+width);}
 await page.setViewportSize({width:320,height:900});
 await context.route('http://opendraft.test/spacing.css',r=>r.fulfill({contentType:'text/css',body:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'}));
 await page.addStyleTag({url:'http://opendraft.test/spacing.css'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Text spacing overflow');
 await context.route('http://opendraft.test/axe.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'axe.min.js'))}));
 await page.addScriptTag({url:'http://opendraft.test/axe.js'});
 const a=await page.evaluate(async()=>{const r=await axe.run();return {violations:r.violations.map(v=>v.id),incomplete:r.incomplete.map(v=>v.id)};});assert.deepEqual(a.violations,[]);
 await page.emulateMedia({forcedColors:'active'});assert(await group.getByRole('radio',{name:'CC BY-NC-SA 4.0',exact:true}).isChecked());
 fs.writeFileSync(path.join(out,'license-cards-results.json'),JSON.stringify({passed:true,choices:9,widths:[320,390,768,1440],keyboard:true,touchEmulation:true,persistence:true,textSpacing:true,axe:a},null,2));
 await browser.close();console.log('License cards: keyboard, touch emulation, all choices, persistence, target sizes, reflow, text spacing, and axe passed.');
})().catch(e=>{console.error(e);process.exit(1)});
