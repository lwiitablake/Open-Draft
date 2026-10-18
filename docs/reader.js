/* Public Wikibooks reader. Remote markup is rebuilt from an allowlist, never inserted live. */
(() => {
 'use strict';
 const ORIGIN='https://en.wikibooks.org', $=s=>document.querySelector(s);
 let current=null, controller=null;
 const pageURL=title=>ORIGIN+'/wiki/'+encodeURIComponent(title.replaceAll(' ','_')).replaceAll('%2F','/');
 function inputPage(value){
  let u;try{u=new URL(value);}catch{throw Error('Paste a complete English Wikibooks page URL.');}
  if(u.origin!==ORIGIN||u.username||u.password)throw Error('This reader currently supports https://en.wikibooks.org only.');
  if(u.searchParams.has('action')&&u.searchParams.get('action')!=='view')throw Error('Open a reading page rather than an editing or history link.');
  const title=u.pathname.startsWith('/wiki/')?decodeURIComponent(u.pathname.slice(6)).replaceAll('_',' '):u.pathname==='/w/index.php'?u.searchParams.get('title'):null;
  if(!title||title.length>500||title.includes(':'))throw Error('Choose a book or chapter page. Special, file, user, and discussion pages open on Wikibooks instead.');
  const oldid=u.searchParams.get('oldid');if(oldid&&!/^\d+$/.test(oldid))throw Error('The revision number in this link is invalid.');
  return {title,oldid};
 }
 function link(url,text){const a=document.createElement('a');a.href=url;a.textContent=text;return a;}
 function cleanHTML(html,base){
  const parsed=new DOMParser().parseFromString(html,'text/html'), out=document.createDocumentFragment();let omitted=0;
  const allowed=new Set('p div span section h1 h2 h3 h4 h5 h6 ul ol li dl dt dd strong b em i u s small sup sub blockquote pre code br hr table caption thead tbody tfoot tr th td figure figcaption a abbr'.split(' '));
  const forbidden=new Set('SCRIPT STYLE LINK META IFRAME OBJECT EMBED FORM INPUT BUTTON SELECT TEXTAREA SVG MATH AUDIO VIDEO SOURCE'.split(' '));
  function copy(node,parent){
   if(node.nodeType===3){parent.append(document.createTextNode(node.textContent));return;}
   if(node.nodeType!==1)return;
   if(forbidden.has(node.tagName)){omitted++;return;}
   if(node.classList.contains('mw-editsection'))return;
   if(node.tagName==='IMG'){
    omitted++;const note=document.createElement('span');note.className='media-note';note.textContent='[Image: '+(node.getAttribute('alt')||'no source alternative text supplied')+'. Open the original page to view the image and its file license.]';parent.append(note);return;
   }
   const tag=node.tagName.toLowerCase();
   if(!allowed.has(tag)){for(const child of node.childNodes)copy(child,parent);return;}
   const el=document.createElement(tag==='h1'?'h2':tag);
   if(node.id)el.id='wiki-'+node.id;
   if(node.hasAttribute('lang')&&/^[a-z0-9-]{1,35}$/i.test(node.lang))el.lang=node.lang;
   if(['ltr','rtl','auto'].includes(node.getAttribute('dir')))el.dir=node.getAttribute('dir');
   if(['td','th'].includes(tag))for(const attr of ['rowspan','colspan'])if(/^\d{1,2}$/.test(node.getAttribute(attr)||''))el.setAttribute(attr,node.getAttribute(attr));
   if(tag==='th'&&['row','col','rowgroup','colgroup'].includes(node.getAttribute('scope')))el.scope=node.getAttribute('scope');
   if(tag==='ol'&&/^-?\d{1,6}$/.test(node.getAttribute('start')||''))el.start=node.getAttribute('start');
   if(tag==='a'){
    try{const raw=node.getAttribute('href')||'',url=new URL(raw,base);if(['https:','http:'].includes(url.protocol)&&!url.username&&!url.password){
     if(raw.startsWith('#'))el.href='#wiki-'+raw.slice(1);
     else {el.href=url.href;el.rel='noopener noreferrer';try{inputPage(url.href);el.dataset.readPage=url.href;}catch{}}
    }}catch{}
   }
   for(const child of node.childNodes)copy(child,el);
   if(tag==='table'){const wrap=document.createElement('div');wrap.className='wiki-table';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Source table; scroll horizontally if needed');wrap.append(el);parent.append(wrap);}else parent.append(el);
  }
  for(const child of parsed.body.childNodes)copy(child,out);
  return {fragment:out,omitted};
 }
 async function api(params,signal){
  const u=new URL('/w/api.php',ORIGIN);u.search=new URLSearchParams({format:'json',formatversion:'2',origin:'*',...params});
  const res=await fetch(u,{signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!res.ok)throw Error('Wikibooks could not be reached ('+res.status+'). Try again or open the original.');
  const text=await res.text();if(text.length>6000000)throw Error('This page is too large for this reader. Open it on Wikibooks.');
  const data=JSON.parse(text);if(data.error)throw Error('Wikibooks could not return that page. Check the address or open the original.');return data;
 }
 async function load(value){
  let requested;try{requested=inputPage(value);}catch(e){$('#reader-error').textContent=e.message;return;}
  controller?.abort();const request=new AbortController();controller=request;const timeout=setTimeout(()=>request.abort(),25000);
  $('#reader-error').textContent='';$('#reader-status').textContent='Loading from English Wikibooks…';$('#load-book').disabled=true;
  try{
   const result=await api({action:'parse',...(requested.oldid?{oldid:requested.oldid}:{page:requested.title,redirects:'1'}),prop:'text|revid',disableeditsection:'1'},request.signal);
   const p=result.parse;if(!p||typeof p.text!=='string'||!Number.isSafeInteger(p.revid)||p.revid<=0||typeof p.title!=='string')throw Error('Unexpected page response. Open the original instead.');
   inputPage(pageURL(p.title));
   const revision=ORIGIN+'/w/index.php?'+new URLSearchParams({title:p.title,oldid:String(p.revid)});
   const metadata=await api({action:'query',revids:String(p.revid),prop:'revisions',rvprop:'timestamp',meta:'siteinfo',siprop:'rightsinfo'},request.signal);
   const date=metadata.query?.pages?.[0]?.revisions?.[0]?.timestamp||'Not supplied';
   const rights=metadata.query?.rightsinfo;const license=rights?.url==='https://creativecommons.org/licenses/by-sa/4.0/'||rights?.url==='https://creativecommons.org/licenses/by-sa/4.0/deed.en'?'CC BY-SA 4.0':null;
   const sanitized=cleanHTML(p.text,pageURL(p.title));
   if(request.signal.aborted)return;
   current={title:p.title,revision,revid:p.revid,date,url:pageURL(p.title),license};
   $('#reader-content').replaceChildren(sanitized.fragment);$('#book-title').textContent=p.title;
   $('#book-url').value=current.url;$('#reader-result').hidden=false;
   $('#source-links').replaceChildren(link(revision,'View this revision on Wikibooks'),link(ORIGIN+'/w/index.php?'+new URLSearchParams({title:p.title,action:'history'}),'Authors & contributor history'),link(ORIGIN+'/w/index.php?'+new URLSearchParams({title:'Special:CiteThisPage',page:p.title,id:String(p.revid)}),'Citation styles on Wikibooks'));
   $('#source-links').append(link('#reader-size','Reading preferences'),link('#license-info','License & reuse'),link('#reader-content','Read page text'));
   $('#revision-info').textContent='Revision '+p.revid+' · Last edited '+date+' · Loaded '+new Date().toLocaleDateString();
   $('#license-info').textContent=license?'Site-wide text license: CC BY-SA 4.0. Page-specific notices and third-party material may have additional terms.':'License could not be verified automatically. Check the original footer and copyright policy before reuse.';
   $('#reading-limit').textContent='Reading presentation reformatted. '+(sanitized.omitted?sanitized.omitted+' media or interactive elements are represented by notes or omitted. ':'')+'References and source links are retained where supported. This is one page, not a downloaded whole book. Check the original for layout-dependent meaning and media licenses.';
   $('#source-record').value=p.title+'\nWikibooks · Revision '+p.revid+'\nLast edited: '+date+'\n'+revision+'\nContributor history: '+ORIGIN+'/w/index.php?'+new URLSearchParams({title:p.title,action:'history'})+'\nText license: '+(license||'Unverified')+'\nThis source record is not a formatted academic citation.';
   $('#attribution').value=license?'From “'+p.title+'”, by Wikibooks contributors. Source: '+revision+'. Text licensed under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/. Changes: [describe changes, or state “None” only if copying the original unchanged]. Retain any additional attribution and prior modification notices.':'Verify the source license before preparing a reuse attribution.';
   const headings=[...$('#reader-content').querySelectorAll('h2,h3,h4,h5,h6')];const list=document.createElement('ul');headings.forEach((h,i)=>{if(!h.id)h.id='wiki-section-'+i;const li=document.createElement('li');li.append(link('#'+h.id,h.textContent));list.append(li);});$('#page-outline').replaceChildren(list);$('#outline-details').hidden=!headings.length;
   $('#reader-status').textContent='Page loaded. Follow book and chapter links in the reading pane to continue.';$('#book-title').focus();
  }catch(e){if(controller!==request)return;$('#reader-error').textContent=request.signal.aborted?'Loading timed out. Try again or open the page on Wikibooks.':e.message;$('#reader-status').textContent=current?'Previous page retained.':'No page loaded.';}
  finally{clearTimeout(timeout);if(controller===request)$('#load-book').disabled=false;}
 }
 $('#reader-form').addEventListener('submit',e=>{e.preventDefault();load($('#book-url').value.trim());});
 $('#education-example').onclick=()=>{$('#book-url').value=pageURL('Foundations of Education and Instructional Assessment');load($('#book-url').value);};
 $('#reader-content').addEventListener('click',e=>{const a=e.target.closest('a[data-read-page]');if(a&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&e.button===0){e.preventDefault();load(a.dataset.readPage);}});
 $('#reader-size').onchange=e=>{$('#reader-content').className='wiki-reading '+e.target.value+($('#reader-spacing').checked?' spacious':'');};
 $('#reader-spacing').onchange=e=>$('#reader-content').classList.toggle('spacious',e.target.checked);
 for(const button of document.querySelectorAll('[data-copy-reader]'))button.onclick=async()=>{const el=document.getElementById(button.dataset.copyReader);try{await navigator.clipboard.writeText(el.value);$('#reader-status').textContent='Copied to clipboard.';}catch{el.focus();el.select();$('#reader-status').textContent='Copy unavailable. Text selected; use your device’s Copy command.';}};
 $('#download-source').onclick=()=>{const blob=new Blob([$('#source-record').value+'\n\nReuse attribution draft:\n'+$('#attribution').value],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=link(url,'');a.download='wikibooks-source-record.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
})();
