const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXE});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const root=path.resolve(__dirname,'../docs'),out=path.resolve(__dirname,'../test-results'),origin='http://reader.test/';
 await context.route(origin+'**',r=>{const rel=new URL(r.request().url()).pathname.slice(1)||'index.html';const f=path.resolve(root,rel);if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return r.fulfill({status:404});return r.fulfill({body:fs.readFileSync(f),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css'})[path.extname(f)]||'text/plain'});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let calls=0,fail=false;
 const live=JSON.parse(fs.readFileSync(path.join(out,'live-book.json'))),meta=JSON.parse(fs.readFileSync(path.join(out,'live-metadata.json')));
 assert(live.parse.text&&meta.query.rightsinfo);
 await context.route('https://en.wikibooks.org/w/api.php?**',r=>{calls++;const u=new URL(r.request().url());if(fail)return r.fulfill({status:503});const data=u.searchParams.get('action')==='parse'?live:meta;return r.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(data)});});
 await page.goto(origin);assert.equal(calls,0,'No request until user action');
 await page.getByRole('button',{name:'Try Foundations',exact:false}).click();await page.locator('#reader-result').waitFor({state:'visible'});
 assert((await page.locator('#book-title').innerText()).includes('Foundations'));
 assert((await page.locator('#license-info').innerText()).includes('CC BY-SA 4.0'));
 assert((await page.locator('#source-record').inputValue()).includes('oldid='+live.parse.revid));
 assert((await page.locator('#attribution').inputValue()).includes('Changes:'));
 const before=calls;await page.locator('#reader-content a[data-read-page]').first().click();await page.waitForFunction(n=>document.querySelector('#reader-status').textContent.startsWith('Page loaded'),null);assert(calls>before);
 await page.locator('#reader-spacing').check();await page.locator('#reader-size').selectOption('size-largest');assert((await page.locator('#reader-content').getAttribute('class')).includes('spacious'));
 const download=page.waitForEvent('download');await page.locator('#download-source').click();await (await download).saveAs(path.join(out,'reader-source.txt'));assert(fs.readFileSync(path.join(out,'reader-source.txt'),'utf8').includes('oldid='));
 await page.screenshot({path:path.join(out,'reader-desktop.png'),fullPage:true});
 await context.route(origin+'qa-axe.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'axe.min.js'))}));
 await page.addScriptTag({url:origin+'qa-axe.js'});
 const results=[];
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow at '+width);const a=await page.evaluate(async()=>{const r=await axe.run();return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.html)}));});results.push({width,violations:a});assert.deepEqual(a,[]);if(width===390)await page.screenshot({path:path.join(out,'reader-mobile.png'),fullPage:true});}
 fail=true;await page.locator('#load-book').click();await page.locator('#reader-error').filter({hasText:'could not be reached'}).waitFor();assert(await page.locator('#reader-result').isVisible());fail=false;
 await page.locator('#book-url').fill('https://example.com/book');const n=calls;await page.locator('#load-book').click();assert((await page.locator('#reader-error').innerText()).includes('currently supports'));assert.equal(calls,n);
 // Untrusted remote markup cannot introduce executable content or app control IDs.
 live.parse.text='<h2 id="reader-form">Test</h2><script>alert(1)</script><a href="javascript:alert(1)">Bad link</a><img src="https://example.com/x" onerror="alert(1)"><iframe src="https://example.com"></iframe><p onclick="alert(1)">Text</p><a href="#reader-form">Jump</a>';
 await page.locator('#education-example').click();await page.locator('#wiki-reader-form').waitFor();assert.equal(await page.locator('#reader-content script,#reader-content iframe,#reader-content img,#reader-content [onclick],#reader-content a[href^="javascript:"]').count(),0);assert.equal(await page.locator('#reader-form').count(),1);
 // Authoring remains reachable and its working copy survives returning to the reader.
 await page.getByRole('link',{name:'Create & adapt',exact:true}).click();await page.locator('#title').fill('Keep my draft');await page.waitForFunction(()=>document.querySelector('#save-state').textContent.includes('Working copy saved'));page.on('dialog',d=>d.accept());await page.getByRole('link',{name:'Read & explore',exact:true}).click();await page.getByRole('link',{name:'Create & adapt',exact:true}).click();assert.equal(await page.locator('#title').inputValue(),'Keep my draft');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'reader-results.json'),JSON.stringify({passed:true,realAPIFixtures:true,liveBrowserNetwork:false,results},null,2));await browser.close();console.log('Reader fixture tests passed: revision, metadata, chapter navigation, failure handling, sanitization, exports, responsive axe, and editor continuity.');
})().catch(e=>{console.error(e);process.exit(1)});
