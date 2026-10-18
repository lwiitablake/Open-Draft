/* Pure project validation and exporters. No network or browser storage. */
(function (root) {
  'use strict';
  const T=root.WikiTranslator || (typeof require==='function'?require('./translator.js'):null);
  const VERSION = 1, MAX_BYTES = 4 * 1024 * 1024;
  const BUILD = Object.freeze({name:'Open Draft',version:'0.3.0',releaseDate:'2026-10-17'});
  const LICENSES = {
    unknown: {label:'Not decided / unknown',url:''},
    reserved: {label:'All rights reserved',url:''},
    'CC-BY-4.0': {label:'CC BY 4.0',url:'https://creativecommons.org/licenses/by/4.0/'},
    'CC-BY-SA-4.0': {label:'CC BY-SA 4.0',url:'https://creativecommons.org/licenses/by-sa/4.0/'},
    'CC-BY-NC-4.0': {label:'CC BY-NC 4.0',url:'https://creativecommons.org/licenses/by-nc/4.0/'},
    'CC-BY-ND-4.0': {label:'CC BY-ND 4.0',url:'https://creativecommons.org/licenses/by-nd/4.0/'},
    'CC-BY-NC-SA-4.0': {label:'CC BY-NC-SA 4.0',url:'https://creativecommons.org/licenses/by-nc-sa/4.0/'},
    'CC-BY-NC-ND-4.0': {label:'CC BY-NC-ND 4.0',url:'https://creativecommons.org/licenses/by-nc-nd/4.0/'},
    CC0: {label:'CC0 1.0 dedication',url:'https://creativecommons.org/publicdomain/zero/1.0/'}
  };
  const TYPES = {paragraph:'Paragraph',h2:'Section heading',h3:'Subsection heading',list:'Bulleted list',quote:'Quotation',image:'Image'};
  const uid = () => 'i' + (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replaceAll('-','');
  const h = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const w = s => String(s ?? '').replace(/[&<>\[\]{}|'=#*:;!_~]/g,c=>'&#'+c.charCodeAt(0)+';');
  function safeURL(s) { try { const u=new URL(s); return ['https:','http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; } }
  function blank() { return {format:'open-draft',version:VERSION,translator:T.empty(),title:'',author:'',audience:'General readers',scope:'',destination:'wikibooks',license:'unknown',rightsNote:'',pages:[{id:uid(),title:'Introduction',blocks:[]}],sources:[],media:[],checks:{rights:false,content:false,accessibility:false},updated:new Date().toISOString()}; }
  function sample() { const p=blank(); p.title='Observing the everyday'; p.scope='A short guide to making careful observations and asking useful questions.'; p.pages[0].blocks=[{id:uid(),type:'h2',text:'Start with a question',sourceId:'',mediaId:''},{id:uid(),type:'paragraph',text:'Choose a familiar place. What changes during the day? Write down what you notice before deciding what it means.',sourceId:'',mediaId:''},{id:uid(),type:'list',text:'Describe what you can observe.\nSeparate observations from interpretations.\nRecord the questions you would like to investigate.',sourceId:'',mediaId:''}]; return p; }
  function validate(raw) {
    if (!raw || raw.format!=='open-draft' || raw.version!==VERSION) throw Error('This is not a supported Open Draft project (version 1).');
    if (new TextEncoder().encode(JSON.stringify(raw)).length>MAX_BYTES) throw Error('Project exceeds the 4 MB draft limit.');
    const str=(v,max=20000)=>{if(typeof v!=='string'||v.length>max)throw Error('Project contains missing or oversized text fields.'); return v;};
    const arr=(v,max)=>{if(!Array.isArray(v)||v.length>max)throw Error('Project contains an invalid or oversized collection.');return v;};
    const one=(v,opts)=>{if(!opts.includes(v))throw Error('Project contains an unsupported option.');return v;};
    const ids=new Set(); const id=v=>{str(v,80);if(!/^[a-zA-Z0-9_-]+$/.test(v)||ids.has(v))throw Error('Project contains invalid or duplicate identifiers.');ids.add(v);return v;};
    const p={format:'open-draft',version:VERSION,title:str(raw.title,120),author:str(raw.author,300),audience:str(raw.audience,1000),scope:str(raw.scope),destination:one(raw.destination,['wikibooks','commons','local']),license:one(raw.license,Object.keys(LICENSES)),rightsNote:str(raw.rightsNote),updated:str(raw.updated,100),checks:{rights:false,content:false,accessibility:false}};
    p.translator=T.validate(raw.translator===undefined?T.empty():raw.translator);
    p.sources=arr(raw.sources,100).map(s=>({id:id(s.id),title:str(s.title,500),author:str(s.author,500),url:str(s.url,2000),note:str(s.note)}));
    p.media=arr(raw.media,20).map(m=>{const item={id:id(m.id),name:str(m.name,120),type:one(m.type,['image/png','image/jpeg','image/webp']),data:str(m.data,3*1024*1024),title:str(m.title,500),author:str(m.author,500),source:str(m.source,2000),license:one(m.license,Object.keys(LICENSES)),alt:str(m.alt,2000),caption:str(m.caption,4000),date:str(m.date,100),changes:str(m.changes,4000),permission:str(m.permission,4000)}; if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(png|jpg|jpeg|webp)$/i.test(item.name)||item.name.includes('..'))throw Error('Media filename is unsafe.'); const ext=item.name.split('.').pop().toLowerCase(); if(({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'})[ext]!==item.type)throw Error('Media extension and type do not match.'); if(!validImage(item.data,item.type))throw Error('Media data is invalid or is not a supported raster image.');return item;});
    if(new Set(p.media.map(m=>m.name.toLowerCase())).size!==p.media.length)throw Error('Duplicate media filenames are not supported.');
    p.pages=arr(raw.pages,50).map(pg=>({id:id(pg.id),title:str(pg.title,120),blocks:arr(pg.blocks,200).map(b=>({id:id(b.id),type:one(b.type,Object.keys(TYPES)),text:str(b.text),sourceId:str(b.sourceId,80),mediaId:str(b.mediaId,80)}))}));
    if(!p.pages.length)throw Error('A project needs at least one page.');
    const sourceIds=new Set(p.sources.map(s=>s.id)), mediaIds=new Set(p.media.map(m=>m.id));
    for(const pg of p.pages)for(const b of pg.blocks){if(b.sourceId&&!sourceIds.has(b.sourceId))throw Error('A block refers to a missing source.');if(b.mediaId&&!mediaIds.has(b.mediaId))throw Error('A block refers to missing media.');if(['h2','h3'].includes(b.type)&&b.sourceId)throw Error('Heading citations are unsupported; attach the source to a paragraph.');}
    return p;
  }
  function validImage(data,type) {
    if(typeof data!=='string'||!data.startsWith('data:'+type+';base64,'))return false;
    const base=data.split(',')[1]; if(!base||base.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(base))return false;
    try { const bytes=atob(base); return type==='image/png'?bytes.startsWith('\x89PNG\r\n\x1a\n'):type==='image/jpeg'?bytes.startsWith('\xff\xd8\xff'):type==='image/webp'?bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP':false; } catch {return false;}
  }
  function titleOK(t){return !!t.trim() && !/[\[\]{}<>|#:/\\\x00-\x1f\x7f]/.test(t) && !/[\n\r]/.test(t) && !t.includes('~~~') && !['.','..'].includes(t.trim()) && new TextEncoder().encode(t.trim()).length<=120;}
  function canonical(t){const s=t.trim().replaceAll('_',' ').replace(/\s+/g,' ');return s.charAt(0).toUpperCase()+s.slice(1);}
  function issues(p) {
    const out=[],add=(level,text,step)=>out.push({level,text,step});
    if(!titleOK(p.title))add('Fix','Give the project a wiki-safe title: at most 120 UTF-8 bytes; no slashes, namespace colons, brackets, or markup.','setup');
    if(!p.author.trim())add('Fix','Add the author or contributor credit.','setup');
    if(!p.scope.trim()||!p.audience.trim())add('Review','Describe the purpose and intended readers.','setup');
    if(p.destination==='wikibooks'&&p.license!=='CC-BY-SA-4.0')add('Fix','This Wikibooks draft workflow requires CC BY-SA 4.0 for your original text. Review contribution terms and imported rights; selecting a license does not clear third-party material.','setup');
    if(p.destination==='wikibooks')add('Review','Before publishing original text, review Wikibooks’ CC BY-SA and GFDL contribution terms. This draft’s license picker does not accept those terms for you. Imported text has separate compatibility and attribution rules.','setup');
    if(p.destination==='local'&&p.license==='unknown')add('Review','The project license is undecided. Private drafting is still available.','setup');
    if(p.translator?.useColors&&!T.colorsApplied(p.translator))add('Fix','Translator colors fall below 4.5:1; wiki defaults are exported instead.','translate');
    const titles=new Set();
    if(p.destination!=='commons')for(const pg of p.pages){
      if(!titleOK(pg.title))add('Fix','A page needs a wiki-safe title.','write');
      const key=canonical(pg.title);if(titles.has(key))add('Fix','Duplicate wiki page title: '+pg.title+'.','write');titles.add(key);
      if(!pg.blocks.length)add('Fix','The page “'+pg.title+'” is empty.','write');
      let section=false;
      for(const b of pg.blocks){
        if(b.type==='h2')section=true;
        if(b.type==='h3'&&!section)add('Fix','“'+pg.title+'” has a subsection before a section heading.','write');
        if(b.type!=='image'&&!b.text.trim())add('Fix','“'+pg.title+'” contains an empty '+TYPES[b.type].toLowerCase()+'.','write');
        if(['h2','h3'].includes(b.type)&&/[\r\n]/.test(b.text))add('Fix','Keep each section heading on one line.','write');
        if(b.type==='image'&&!b.mediaId)add('Fix','Choose an image for the image block in “'+pg.title+'”.','write');
        if(b.type==='quote'&&!b.sourceId)add('Review','A quotation in “'+pg.title+'” needs its source and permission context.','write');
      }
    }
    for(const s of p.sources){if(!s.title.trim()||!safeURL(s.url))add('Fix','Each source needs a title and a valid HTTP(S) URL.','sources');}
    if(!p.sources.length&&p.destination==='wikibooks')add('Review','No sources recorded. Review which claims need reliable references.','sources');
    if(p.destination==='commons'&&!p.media.length)add('Fix','Add at least one image to prepare a Commons package.','sources');
    for(const m of p.media){
      if(!m.alt.trim())add('Fix','Add a contextual text alternative for “'+m.name+'”.','sources');
      if(!m.title.trim()||!m.author.trim()||!m.source.trim()||!m.date.trim())add('Fix','Complete title, creator, source, and creation date for “'+m.name+'”.','sources');
      if(p.destination!=='local'&&!['CC-BY-4.0','CC-BY-SA-4.0','CC0'].includes(m.license))add('Fix','“'+m.name+'” needs a supported freely reusable license for this Commons workflow. NC, ND, unknown, and reserved rights cannot pass this check.','sources');
      if(!m.permission.trim())add('Review','Record rights evidence for “'+m.name+'”, including whether it is entirely your own work.','sources');
    }
    return out;
  }
  function sourceWiki(s){return (s.author?w(s.author)+'. ':'')+(safeURL(s.url)?'['+safeURL(s.url).replace(/[\[\]<>\s]/g,c=>encodeURIComponent(c))+' '+w(s.title)+']':w(s.title))+(s.note?' — '+w(s.note):'');}
  function pageWiki(p,pg){
    const chunks=['<!-- DRAFT: review in a wiki sandbox before publication. -->','[['+p.title.trim()+'|Back to book]]'];
    for(const b of pg.blocks){let text=w(b.text.trim()),s=p.sources.find(s=>s.id===b.sourceId); const cite=s?'<ref>'+sourceWiki(s)+'</ref>':'';
      if(b.type==='h2'||b.type==='h3'){const mark=b.type==='h2'?'==':'===';chunks.push(mark+' '+text.replace(/[\r\n]+/g,' ')+' '+mark);}
      else if(b.type==='list')chunks.push(b.text.split(/\r?\n/).filter(l=>l.trim()).map(l=>'* '+w(l.trim())).join('\n')+cite);
      else if(b.type==='quote')chunks.push('<blockquote>'+text+cite+'</blockquote>');
      else if(b.type==='image'){const m=p.media.find(m=>m.id===b.mediaId);chunks.push(m?'[[File:'+m.name+'|thumb|alt='+w(m.alt.replace(/[\r\n]+/g,' '))+'|'+w(m.caption||m.title)+']]'+cite:'<!-- Image not selected. -->');}
      else chunks.push(text+cite);
    }
    if(pg.blocks.some(b=>b.sourceId))chunks.push('== References ==\n<references />');
    return chunks.join('\n\n')+'\n';
  }
  function rootWiki(p){return '<!-- DRAFT: review scope and existing books before publication. -->\n'+w(p.scope)+'\n\nIntended readers: '+w(p.audience)+'\n\n== Contents ==\n'+p.pages.map(pg=>'* [['+p.title.trim()+'/'+pg.title.trim()+'|'+w(pg.title)+']]').join('\n')+'\n\n== Attribution ==\nOriginal text credit: '+w(p.author)+'\n\n'+w(p.rightsNote)+'\n';}
  function credits(p){return ['PROJECT TEXT',p.title+' — '+p.author,'Selected license: '+LICENSES[p.license].label,LICENSES[p.license].url,p.rightsNote,'','MEDIA (separate licenses)',...p.media.map(m=>[m.title+' — '+m.author,'File: '+m.name,'Source: '+m.source,'License: '+LICENSES[m.license].label+' '+LICENSES[m.license].url,'Changes: '+(m.changes||'Not recorded'),'Rights evidence: '+(m.permission||'Not recorded')].join('\n')),'','REFERENCES (citation is separate from reuse permission)',...p.sources.map(s=>[s.author,s.title,s.url,s.note].filter(Boolean).join(' — '))].join('\n');}
  function commonsWiki(m){const tags={'CC-BY-4.0':'Cc-by-4.0','CC-BY-SA-4.0':'Cc-by-sa-4.0',CC0:'Cc-zero'};return '== Summary ==\n{{Information\n|description='+w(m.caption||m.title)+'\n|date='+w(m.date)+'\n|source='+w(m.source)+'\n|author='+w(m.author)+'\n|permission='+w(m.permission)+'\n|other versions=\n}}\n\n== Licensing ==\n'+(tags[m.license]?'{{'+tags[m.license]+'}}':'<!-- LICENSE UNRESOLVED: do not upload yet. -->')+'\n\n<!-- Suggested alternative text: '+w(m.alt).replaceAll('--','—')+' -->\n<!-- Changes: '+w(m.changes).replaceAll('--','—')+' -->\n<!-- Review relevant existing Commons categories before publication. -->\n';}
  function readerBody(p,pg,shift=0){let refs=[]; const blocks=pg.blocks.map(b=>{const s=p.sources.find(s=>s.id===b.sourceId);let ref='';if(s){refs.push(s);ref=' <sup><a href="#reference-'+pg.id+'-'+refs.length+'" aria-label="Reference '+refs.length+'">['+refs.length+']</a></sup>';}
      if(b.type==='image'){const m=p.media.find(m=>m.id===b.mediaId);return m?'<figure><img src="'+m.data+'" alt="'+h(m.alt)+'"><figcaption>'+h(m.caption||m.title)+ref+'<br>'+h(m.author)+' · '+h(LICENSES[m.license].label)+'</figcaption></figure>':'<p>[Image not selected]</p>';}
      const text=h(b.text).replace(/\n/g,'<br>');if(['h2','h3'].includes(b.type)){const tag='h'+(Number(b.type[1])+shift);return '<'+tag+'>'+h(b.text)+'</'+tag+'>';}
      if(b.type==='list')return '<ul>'+b.text.split(/\r?\n/).filter(l=>l.trim()).map((l,i,a)=>'<li>'+h(l)+(i===a.length-1?ref:'')+'</li>').join('')+'</ul>';
      return b.type==='quote'?'<blockquote><p>'+text+ref+'</p></blockquote>':'<p>'+text+ref+'</p>';
    }).join('\n');
    const level='h'+(2+shift);return blocks+(refs.length?'<section class="credits"><'+level+'>References</'+level+'><ol>'+refs.map((s,i)=>'<li id="reference-'+pg.id+'-'+(i+1)+'">'+h(s.author)+' '+(safeURL(s.url)?'<a href="'+h(safeURL(s.url))+'">'+h(s.title)+'</a>':h(s.title))+' '+h(s.note)+'</li>').join('')+'</ol></section>':'');
  }
  function htmlExport(p){return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+h(p.title)+'</title><style>body{font:1.1rem/1.7 system-ui,sans-serif;max-width:75ch;margin:3rem auto;padding:0 1.2rem;color:#172f33}a{color:#175947}img{max-width:100%;height:auto}figure{margin:2rem 0}h1,h2,h3{line-height:1.2}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.page{break-before:page}a:focus-visible{outline:3px solid #124fc6}@media print{a[href^="http"]::after{content:" (" attr(href) ")";overflow-wrap:anywhere}figure{break-inside:avoid}}</style></head><body><header><p>Draft · accessibility and rights review required</p><h1>'+h(p.title)+'</h1><p>'+h(p.scope)+'</p><p>For '+h(p.audience)+'</p></header><nav aria-label="Contents"><h2>Contents</h2><ol>'+p.pages.map(pg=>'<li><a href="#page-'+pg.id+'">'+h(pg.title)+'</a></li>').join('')+'</ol></nav><main>'+p.pages.map(pg=>'<article class="page" aria-label="'+h(pg.title)+'"><h2 id="page-'+pg.id+'">'+h(pg.title)+'</h2>'+readerBody(p,pg,1)+'</article>').join('')+'</main><footer><h2>Attribution and rights</h2><pre>'+h(credits(p))+'</pre></footer></body></html>';}
  function filenames(p){return p.pages.map((pg,i)=>({title:p.title.trim()+'/'+pg.title.trim(),file:'pages/'+String(i+1).padStart(2,'0')+'-chapter.wiki',page:pg}));}
  function guide(p){const list=issues(p);return '# '+p.title+' — contribution handoff\n\nPrepared with '+BUILD.name+' v'+BUILD.version+' (release '+BUILD.releaseDate+'). Project content retains its own licenses.\n\nDRAFT ONLY. This ZIP is not a wiki import format. Nothing has been published.\n\n'+(p.destination==='commons'?'Destination: Wikimedia Commons. This package contains media and metadata; it does not publish book pages.\n':'Destination: English Wikibooks, with media prepared separately for Wikimedia Commons.\n')+'\n## Before publishing\n\n'+(list.length?list.map(x=>'- '+x.level+': '+x.text).join('\n'):'No automated issues found. This is not a conformance or rights determination.')+'\n\nHuman review acknowledgments at export: '+JSON.stringify(p.checks)+'\nReview the originals, sources, neutral presentation, alternative text in context, copyright permissions, and destination rules. Recheck the rendered wiki with a keyboard and assistive technology.\n\n## Step by step\n\n1. Keep project.opendraft.json as your editable backup. Open it in Open Draft to continue. Do not upload that file to a wiki.\n2. Read ATTRIBUTION.txt and the rights notes. A project license does not relicense third-party media.\n3. For media, check https://commons.wikimedia.org/wiki/Commons:Project_scope and https://commons.wikimedia.org/wiki/Commons:Licensing. Review personal information, faces, and image metadata before upload.\n4. Sign in to Commons and open https://commons.wikimedia.org/wiki/Special:UploadWizard. Upload the original files in media/, confirm permissions, and enter the descriptions/credits from commons/. Select appropriate existing categories. If a filename is changed, replace its File: references in every wiki page before publishing. Reuse existing Commons files rather than duplicating them.\n'+(p.destination==='commons'?'5. Review each published file page and its licensing. Alternative text is contextual and must also be provided wherever an image is embedded.\n':'5. Check existing books and the contribution guidance: https://en.wikibooks.org/wiki/Help:Contributing. Choose the correct book scope and discuss major changes with contributors.\n6. Sign in to Wikibooks. Begin at User:YOUR_USERNAME/sandbox. Use Edit source; copy a .wiki file into the editor. Sandbox saving is public publication too. Use Show preview before Publish changes. Sandbox book links may still point at the intended final book titles.\n7. When reviewed, create or edit each destination below individually. Check for existing content first; merge carefully instead of overwriting it. Paste source, inspect references/figures/navigation, and include required attribution for reused text on the destination page and in the edit summary. Preserve source links/permalinks and modification notices. Then publish.\n8. Recheck all links and images on the wiki. Request community feedback. Do not claim accessibility based solely on this app.\n\n## Page mapping\n\n- pages/00-book.wiki → '+p.title+'\n'+filenames(p).map(f=>'- '+f.file+' → '+f.title).join('\n')+'\n')+'\n## Limitations\n\nEnglish destination guidance; plain text, headings, lists, quotations, images, and references only. No automated rights verification, account connection, or community acceptance. No IMSCC, EPUB, or verified tagged PDF conversion in this prototype.\n';}
  const api={VERSION,BUILD,MAX_BYTES,LICENSES,TYPES,uid,h,w,safeURL,blank,sample,validate,validImage,titleOK,canonical,issues,pageWiki,rootWiki,credits,commonsWiki,readerBody,htmlExport,filenames,guide};
  root.OpenDraft=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
