/* Rich editor controller. Project ownership and downloads remain in app.js. */
(function(root){
 'use strict';
 const T=root.WikiTranslator;
 function view(){return `<section class="panel translator-panel">
 <div class="panel-heading"><div><p class="section-label">WRITE VISUALLY · COPY WIKITEXT</p><h2 id="view-title" tabindex="-1">Your words, translated for a wiki.</h2><p>Format your draft on the left. Copy the generated code on the right into the wiki’s source editor.</p></div><span class="badge">Wiki translator</span></div>
 <p class="hint">This scratchpad is saved with your project. It is separate from the book pages in Write &amp; organize. No AI service or automatic publication is involved.</p>
 <div class="translator-split">
 <section class="editor-column" aria-labelledby="visual-label"><h3 id="visual-label">Rich content editor</h3>
 <div class="rich-toolbar" role="group" aria-label="Text formatting">
 <button type="button" data-command="bold" aria-pressed="false" title="Bold (Ctrl+B)"><strong>Bold</strong></button>
 <button type="button" data-command="italic" aria-pressed="false" title="Italic (Ctrl+I)"><em>Italic</em></button>
 <button type="button" data-command="insertUnorderedList">Bullet list</button><button type="button" data-command="insertOrderedList">Numbered list</button>
 <button type="button" data-command="undo">Undo</button><button type="button" data-command="redo">Redo</button><button type="button" data-command="removeFormat">Clear emphasis</button>
 </div>
 <div class="block-format"><label for="rich-format">Paragraph style</label><select id="rich-format"><option value="p">Paragraph</option><option value="h2">Section heading (H2)</option><option value="h3">Subsection heading (H3)</option><option value="blockquote">Quotation</option></select></div>
 <div id="rich-editor" class="rich-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="visual-label" aria-describedby="rich-help" spellcheck="true"></div>
 <p id="rich-help" class="hint">Select text to format it. Tab moves to the next control. Paste inserts plain text so hidden formatting and unsafe content stay out. Use headings for structure, not just appearance.</p>
 <details><summary>Add or remove a link</summary><label for="rich-url">Link destination (HTTP or HTTPS)</label><input id="rich-url" type="url" placeholder="https://example.org/article" aria-describedby="rich-link-help"><p id="rich-link-help" class="hint">Select descriptive text in the editor first, then enter the destination. The selection is retained while you use these controls.</p><div class="actions"><button type="button" id="rich-add-link">Apply link to selection</button><button type="button" id="rich-remove-link">Remove link</button></div></details>
 </section>
 <section class="code-column" aria-labelledby="code-label"><h3 id="code-label">Wiki code · updates as you type</h3><label class="small" for="rich-code">Generated wikitext (read only)</label><textarea id="rich-code" class="code rich-code" readonly spellcheck="false" aria-describedby="wiki-help"></textarea><div class="actions"><button id="rich-copy" class="primary" type="button">Copy wiki code</button><button id="rich-download" type="button">Download .wiki</button></div><p id="wiki-help" class="hint">Paste into <strong>Edit source</strong>, then use <strong>Show preview</strong> on the wiki. This is a one-way translator; edit the visual draft to change the code. Wiki skins, extensions, and local policies can affect rendering.</p><p id="rich-status" class="hint" role="status" aria-live="polite"></p></section>
 </div>
 <div id="rich-error" role="alert"></div>
 <details class="color-details" open><summary>Colors &amp; contrast</summary><p>Wiki defaults are the most portable option. When adding color, set both the text and background. Never communicate meaning through color alone.</p>
 <label class="check"><input id="rich-use-colors" type="checkbox"> Include a custom color pair in the wiki code</label>
 <div class="color-fields"><div><label for="rich-foreground">Text color</label><div class="color-entry"><input id="rich-foreground" type="color" value="#172f33"><label class="sr-only" for="rich-foreground-hex">Text color hex value</label><input id="rich-foreground-hex" value="#172f33" maxlength="7" spellcheck="false" aria-describedby="hex-help"></div></div><div><label for="rich-background">Background color</label><div class="color-entry"><input id="rich-background" type="color" value="#ffffff"><label class="sr-only" for="rich-background-hex">Background color hex value</label><input id="rich-background-hex" value="#ffffff" maxlength="7" spellcheck="false" aria-describedby="hex-help"></div></div></div>
 <p id="hex-help" class="hint">Hex values use # and six hexadecimal digits, for example #24594c.</p><p id="rich-contrast" class="contrast-result" role="status" aria-live="polite"></p>
 <button id="rich-safe-colors" type="button">Use high-contrast ink on white</button>
 <p class="hint">This tool requires at least 4.5:1 for all custom text pairs. WCAG permits 3:1 for qualifying large text, but the destination controls font size. Passing this pair check does not establish full accessibility. Recheck links, headings, dark mode, print, and forced colors on the wiki. <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum" target="_blank" rel="noopener noreferrer">WCAG contrast guidance (new tab)</a>.</p></details>
 <section class="draft-tips" aria-labelledby="draft-tips-label"><h3 id="draft-tips-label">Suggestions for this draft</h3><ul id="rich-suggestions"></ul></section>
 <section class="udl-section" aria-labelledby="udl-label"><h3 id="udl-label">Make room for different ways of learning.</h3><p>Universal Design for Learning (UDL) helps authors anticipate barriers and give readers useful options. Choose suggestions that fit the goal; these are prompts for judgment, not a compliance score.</p>
 <div class="udl-grid"><article><span class="eyebrow">ENGAGEMENT</span><h4>Give the reading a purpose</h4><p>State a learning goal and connect it to a relevant question. Offer optional examples or routes through the material.</p><p><strong>Why:</strong> purpose and meaningful choice can help readers direct their effort.</p><button data-starter="goal" type="button">Add a goal starter</button></article>
 <article><span class="eyebrow">REPRESENTATION</span><h4>Explain an idea more than one way</h4><p>Define unfamiliar terms and pair an explanation with a worked example. Give meaningful diagrams text alternatives.</p><p><strong>Why:</strong> this reduces avoidable language and perception barriers.</p><button data-starter="example" type="button">Add an example starter</button></article>
 <article><span class="eyebrow">ACTION &amp; EXPRESSION</span><h4>Offer a choice of practice</h4><p>Invite readers to explain, sketch with a description, or compare examples when each option serves the same goal.</p><p><strong>Why:</strong> response options let readers practice without relying on just one mode of expression.</p><button data-starter="practice" type="button">Add a practice starter</button></article></div>
 <p class="hint">Original app guidance informed by <a href="https://udlguidelines.cast.org/" target="_blank" rel="noopener noreferrer">CAST UDL Guidelines 3.0 (new tab)</a>. Options respond to barriers and context, not fixed “learning styles.” Starter prompts require your subject knowledge and review.</p></section>
 </section>`;}
 function mount(container,initial,onChange,download){
  const $=s=>container.querySelector(s),editor=$('#rich-editor');let doc=T.validate(initial),range=null,closed=false,tipTimer;
  editor.innerHTML=T.html(doc);
  const say=t=>{$('#rich-status').textContent=t;},error=t=>{$('#rich-error').textContent=t;};
  function remember(){const s=window.getSelection();if(s.rangeCount&&editor.contains(s.getRangeAt(0).commonAncestorContainer)){range=s.getRangeAt(0).cloneRange();for(const cmd of ['bold','italic']){try{$('[data-command="'+cmd+'"]').setAttribute('aria-pressed',String(document.queryCommandState(cmd)));}catch{}}}}
  function restore(){editor.focus();const s=window.getSelection();s.removeAllRanges();if(range&&editor.contains(range.commonAncestorContainer)){s.addRange(range);}else{const r=document.createRange();r.selectNodeContents(editor);r.collapse(false);s.addRange(r);} }
  function tips(){if(closed)return;const list=T.suggestions(doc);if(!list.length)list.push('Review the source, reading order, factual accuracy, and rights before publishing. Add media and citations through the book workflow when needed.');$('#rich-suggestions').replaceChildren(...list.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));}
  function paint(){
   $('#rich-code').value=T.toWiki(doc);const ratio=T.contrast(doc.foreground,doc.background),pass=ratio>=4.5;
   const applied=T.colorsApplied(doc);editor.style.color=applied?doc.foreground:'#172f33';editor.style.backgroundColor=applied?doc.background:'#ffffff';
   $('#rich-contrast').textContent=`${ratio.toFixed(2)}:1 — ${pass?'Meets the 4.5:1 text-pair threshold.':'Below the 4.5:1 threshold. Choose a darker text color or a lighter background.'} ${applied?'Color pair included in the code.':doc.useColors?'This pair is not applied. The editor stays readable and the code uses wiki defaults.':'Custom colors are off; the code uses wiki defaults.'}`;
   $('#rich-contrast').classList.toggle('contrast-warning',!pass);
   clearTimeout(tipTimer);tipTimer=setTimeout(tips,500);
  }
  function commit(next){if(onChange(next)===false)return false;doc=next;paint();return true;}
  function sync(){try{const result=T.fromDOM(editor,doc);if(!commit(result.doc))throw Error('The project is too large. Download a backup and reduce its size.');error('');if(result.warnings.length)say(result.warnings.join(' '));remember();}catch(e){error(e.message);editor.innerHTML=T.html(doc);range=null;}}
  function command(cmd,value=null){try{restore();document.execCommand('styleWithCSS',false,false);const ok=document.execCommand(cmd,false,value);sync();remember();if(!ok)say('This browser may not support that formatting action. Review the editor and generated code.');}catch(e){error('Formatting was not available: '+e.message);}}
  document.addEventListener('selectionchange',remember);
  editor.addEventListener('input',sync);
  editor.addEventListener('paste',e=>{e.preventDefault();const value=e.clipboardData?.getData('text/plain')||'';if(value.length+T.text(doc).length>100000){error('The translator limit is 100,000 characters. Paste a smaller section.');return;}command('insertText',value);say('Pasted as plain text. Apply the formatting you want with the toolbar.');});
  editor.addEventListener('drop',e=>{e.preventDefault();say('File and HTML drops are not supported. Paste plain text or use Sources & media for images.');});
  editor.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['b','i'].includes(e.key.toLowerCase())){e.preventDefault();command(e.key.toLowerCase()==='b'?'bold':'italic');}});
  container.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>command(b.dataset.command));
  $('#rich-format').onchange=e=>command('formatBlock',e.target.value);
  $('#rich-add-link').onclick=()=>{const u=T.url($('#rich-url').value);if(!u){error('Enter a valid HTTP or HTTPS link without a username or password.');$('#rich-url').focus();return;}if(!range||range.collapsed){error('Select the words to link in the rich content editor first.');editor.focus();return;}command('createLink',u);say('Link applied. Use descriptive text and check its destination.');};
  $('#rich-remove-link').onclick=()=>command('unlink');
  $('#rich-copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#rich-code').value);say('Wiki code copied. Use Edit source and Show preview on the wiki.');}catch{$('#rich-code').focus();$('#rich-code').select();say('Code selected. Use your keyboard’s copy command.');}};
  $('#rich-download').onclick=()=>download('translator-draft.wiki',new Blob([T.toWiki(doc)],{type:'text/plain;charset=utf-8'}));
  for(const key of ['foreground','background']){
   $('#rich-'+key).value=doc[key];$('#rich-'+key+'-hex').value=doc[key];
   const update=value=>{if(!T.hex(value)){$('#rich-'+key+'-hex').setAttribute('aria-invalid','true');error('Use a complete six-digit hex color, such as #24594c. The previous valid color is still in use.');return;}$('#rich-'+key+'-hex').removeAttribute('aria-invalid');error('');$('#rich-'+key).value=value;$('#rich-'+key+'-hex').value=value;commit({...doc,[key]:value.toLowerCase()});};
   $('#rich-'+key).oninput=e=>update(e.target.value);$('#rich-'+key+'-hex').oninput=e=>update(e.target.value);
  }
  $('#rich-use-colors').checked=doc.useColors;$('#rich-use-colors').onchange=e=>commit({...doc,useColors:e.target.checked});
  $('#rich-safe-colors').onclick=()=>{commit({...doc,foreground:'#172f33',background:'#ffffff'});for(const k of ['foreground','background']){$('#rich-'+k).value=doc[k];$('#rich-'+k+'-hex').value=doc[k];$('#rich-'+k+'-hex').removeAttribute('aria-invalid');}error('');say('High-contrast ink and white selected.');};
  const starters={goal:['Learning goal','After this section, you can…'],example:['Worked example','First, consider…\nNext, notice…\nThis shows…'],practice:['Try it your way','Explain the idea in your own words, create a sketch with a text description, or compare two examples. Check your response against…']};
  container.querySelectorAll('[data-starter]').forEach(b=>b.onclick=()=>{const [title,body]=starters[b.dataset.starter];const run=text=>[{text,bold:false,italic:false,link:''}];try{const added=[{type:'h2',runs:run(title)},{type:'p',runs:run(body)}];T.validate({...doc,blocks:[...doc.blocks,...added]});range=document.createRange();range.selectNodeContents(editor);range.collapse(false);command('insertHTML','<p><br></p>'+T.html({...doc,blocks:added}));say('Starter added at the end. Replace the ellipses with your own content before publishing.');}catch(e){error(e.message);}});
  paint();tips();return ()=>{closed=true;clearTimeout(tipTimer);document.removeEventListener('selectionchange',remember);};
 }
 root.WikiTranslatorUI={view,mount};
})(globalThis);
