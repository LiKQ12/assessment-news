/* Local, dependency-free presentation changes agreed with the author. */
window.Revision=(()=>{
 const charts=new Map(),seen=new WeakSet(),watched=new WeakSet();
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const $=s=>document.querySelector(s);
 function setupCase(){
  const panel=$('#case'),person=panel.querySelector('.character');
  panel.dataset.layout='image-copy-character-source';
  panel.dataset.characterWidth='';person.removeAttribute('style');
 }
 function alignOpening(){
  const opening=document.querySelector('.opening');if(opening.hidden||opening.classList.contains('posting'))return;
  const scene=opening.querySelector('.delivery-scene'),paper=scene.querySelector('.resume-paper');
  scene.style.transform='none';
  const h=opening.querySelector('h1').getBoundingClientRect(),p=opening.querySelector('.opening-intro').getBoundingClientRect(),r=paper.getBoundingClientRect();
  if(!r.height)return;
  const offset=(h.top+p.bottom-r.top-r.bottom)/2;
  scene.style.transform='translateY('+offset+'px)';scene.dataset.alignedCenter=((h.top+p.bottom)/2).toFixed(2);
 }
 function decorateHeadings(){
  const second=document.querySelectorAll('.chapter-scene h2')[1];
  if(second&&!second.querySelector('em'))second.innerHTML=second.innerHTML.replace('作答时间与提交期限','<em>作答时间与提交期限</em>');
  document.querySelectorAll('.chapter-scene h2 em').forEach(el=>{
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 120 12');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
   svg.innerHTML='<path d="M3 3Q58 5 117 2"/><path d="M2 9Q63 12 118 8"/>';el.append(svg);
  });
 }
 function assignPalettes(){
  let light=false;
  for(const child of $('#story').children){if(child.id==='figure-5')light=true;if(child.matches('.side-object-zone'))continue;child.classList.toggle('reading-light',light);child.classList.toggle('reading-dark',!light)}
  $('#case').classList.add('reading-dark');$('#voices').classList.add('reading-dark');$('#sources').classList.add('reading-light');
 }
 function registerChart(el,c,n){
  const section=el.closest('.chart-section')||el.getRootNode().host?.closest('.chart-section');
  if(!section)return;n=n||Number(section.id.split('-')[1]);
  if(!charts.has(n))charts.set(n,[]);charts.get(n).push(c);
  el.dataset.animationRole='first-entry';
 }
 function playChart(n){
  for(const c of charts.get(n)||[]){
   const dom=c.getDom();if(dom.dataset.entrancePlayed==='true')continue;
   dom.dataset.entrancePlayed='true';
   if(reduced())continue;
   if(n===1||n===2){const option=c.getOption();c.clear();c.setOption({...option,animation:true,animationDuration:2400,animationEasing:'cubicInOut',animationDelay:idx=>Math.min(idx*90,450)});}
   else if(n===10){
    const option=c.getOption(),s=option.series[0],data=s.data,links=s.links;
    c.setOption({animation:false,series:[{id:s.id,data:data.map(v=>({...v,symbolSize:0})),links:links.map(v=>({...v,lineStyle:{...v.lineStyle,opacity:0}}))}]});
    requestAnimationFrame(()=>{c.setOption({animation:true,animationDurationUpdate:2000,animationEasingUpdate:'cubicInOut',series:[{id:s.id,data}]});setTimeout(()=>c.setOption({animationDurationUpdate:1800,series:[{id:s.id,links}]}),600)});
   }else{
    dom.classList.add('viz-unfold');setTimeout(()=>dom.classList.remove('viz-unfold'),3400);
   }
  }
 }
 function playFigure(el){
  const n=Number(el.id.split('-')[1]);
  el.querySelectorAll('.dot,.cloud button,.cloud .term').forEach((e,i)=>e.style.setProperty('--reveal-delay',Math.min(i%15*65,850)+'ms'));
  playChart(n);
  if(n===11){const wall=el.querySelector('[id^="viz-"]').shadowRoot?.querySelector('.wall');wall?.classList.add('revision-entered')}
 }
 function reveal(el){
  if(seen.has(el))return;seen.add(el);el.dataset.entrancePlayed='true';el.classList.remove('reveal-pending');el.dataset.revealStartTop=el.getBoundingClientRect().top.toFixed(1);el.dataset.revealViewport=String(innerHeight);
  if(!reduced())el.classList.add('is-revealing');
  if(el.matches('.chart-section'))playFigure(el);
 }
 const pending=new Set();
 function makeEntryObserver(){return new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){e.target.dataset.revealBoundary=String(e.rootBounds.bottom);reveal(e.target);pending.delete(e.target);entryObserver.unobserve(e.target)}
 },{threshold:0,rootMargin:'0px 0px -'+Math.round(innerHeight*.2)+'px 0px'});}
 let entryObserver=makeEntryObserver();
 function watch(el){if(watched.has(el))return;watched.add(el);if(reduced()){el.dataset.entrancePlayed='true';return;}el.classList.add('reveal-pending');pending.add(el);entryObserver.observe(el)}
 addEventListener('resize',()=>{entryObserver.disconnect();entryObserver=makeEntryObserver();pending.forEach(el=>entryObserver.observe(el))});
 function observeReading(){
  assignPalettes();
  document.querySelectorAll('.bridge-copy,#case .case-copy,#ending .ending-copy').forEach(el=>{el.classList.add('motion-reading');el.dataset.motionGroup='reading';watch(el)});
  document.querySelectorAll('.chart-section').forEach(watchFigure);
 }
 function watchFigure(el){el.classList.add('motion-figure','motion-chart');el.dataset.motionGroup='figure';watch(el);if(seen.has(el))playFigure(el)}
 function stylePrototype(n,root,host,instances){
  const replacement=window.APPROVED_COPY.notes[n],oldNote=window.APPROVED_COPY.oldNotes[n]||window.STORY_DATA[n]?.note;
  if(replacement&&oldNote){
   root.querySelectorAll('[aria-label]').forEach(el=>{const label=el.getAttribute('aria-label');if(label.includes(oldNote))el.setAttribute('aria-label',label.replace(oldNote,replacement))});
   if(n===11)root.querySelectorAll('.note').forEach(el=>{if(el.textContent.includes(oldNote))el.textContent=el.textContent.replace(oldNote,'').trim()});
  }
  const style=document.createElement('style');
  style.textContent=`
   :host{color:var(--ink)}.widget-body,.page,#chart,#chart-container,#industry-toolbar{background:transparent!important}
   #industry-toolbar{margin:0!important;padding:12px 0 0!important;min-height:48px;gap:12px!important}
   #industry-toolbar label{color:var(--ink)!important;font-size:15px!important}
   #industry-toolbar #industry-preview{color:var(--ink)!important;background:var(--panel)!important;border:1px solid var(--line)!important;border-radius:6px!important;padding:9px 36px 9px 12px!important;min-width:250px;font-size:15px!important;cursor:pointer}
   #industry-toolbar #industry-preview option{color:var(--ink)!important;background:var(--panel)!important}
   :host([data-figure="4"]) #chart-container{height:var(--viewport-plot-height)!important;min-height:0!important}
   .viz-unfold{animation:revision-unfold 3s ease-in-out both}
   @keyframes revision-unfold{from{clip-path:inset(0 100% 0 0);opacity:.2}to{clip-path:inset(0);opacity:1}}
   .revision-entered .record{animation:revision-receipt 2.1s both!important;animation-delay:var(--revision-delay,0ms)!important}
   @keyframes revision-receipt{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
   @media(prefers-reduced-motion:reduce){.revision-entered .record{animation:none!important}}
  `;
  root.append(style);host.dataset.figure=String(n);
  root.querySelectorAll('.record').forEach((e,i)=>e.style.setProperty('--revision-delay',Math.min(i%12*70,770)+'ms'));
 }
 addEventListener('load',alignOpening);addEventListener('resize',alignOpening);
 return{setupCase,alignOpening,decorateHeadings,assignPalettes,registerChart,observeReading,watchFigure,stylePrototype};
})();
