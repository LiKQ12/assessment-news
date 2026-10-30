(()=>{'use strict';
const COPY=window.APPROVED_COPY;
const D=window.STORY_DATA,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const PRESENTATION=window.STORY_PRESENTATION;
function emphasizeCopy(text,phrases=[]){
 let html=esc(text);
 for(const phrase of phrases){const escaped=esc(phrase);html=html.replace(escaped,'<span class="narrative-accent">'+escaped+'</span>')}
 return html.replace(/\n/g,'<br>');
}
const palette=['#BC354B','#8bb0b8','#b98077','#acabc4','#9faf86','#c19369','#8899ad','#bd9eae'];
const chartInstances=[],state={stage:'resume',answers:[null,null,null,null],started:0,deadline:0,submitted:false};
window.storyState=state;
function stage(name){state.stage=name;$$('[data-stage]').forEach(el=>el.hidden=el.dataset.stage!==name)}
const questions=[
 {name:'言语理解',text:'各种媒体暴力节目与个体暴力性行为之间是否存在直接的因果？怀疑论者认为多数研究夸大了媒体暴力对观众的影响。危言耸听者则认为暴力媒体直接造成了侵略性行为，他们认为暴力节目会使越来越多的人把观看暴力视频当成有趣的娱乐活动，从而进一步巩固社会暴力倾向。而现实是，一种社会行为背后也许不只有一种原因，在反驳危言耸听者时，首先要弄清何为暴力，在为两者关系下定义前，要重新考虑前提条件。材料的主要内容是：',options:['给媒体暴力与暴力行为下定义','批评媒体暴力节目造成的不良影响','讨论暴力节目与个体暴力的关系','揭示暴力行为对社会的影响']},
 {name:'逻辑推理',text:'一项调查结果表明，某水域受到石油泄漏污染后，水鸟的存活率为95%。其根据是附近某动物诊所的统计：该诊所诊治的受污染伤害的水鸟中，有二十分之一死去。在下列各项事实中，最能对水鸟存活率的结论提出质疑的是：',options:['有20%的水鸟受到石油污染的严重伤害','在受污染伤害的水鸟中存活希望较大的才被送到诊所','死去的水鸟是体型较大的水鸟','有些接受过治疗的水鸟又被重新送回诊所']},
 {name:'资料分析',text:'近年智能手机市场竞争激烈，下图为某手机运营商绘制的A、B两款手机在某地4年来的用户数量图。请根据下列信息回答问题：A手机用户与B手机用户相比：',options:['过去四年，该地区A手机的新用户总量大于B手机的新用户总量','过去四年，B手机新用户的增长速度低于A手机新用户的增长速度','过去四年，B手机在第二年的新用户增长率低于A手机的新用户增长率','过去四年，该地区A手机新用户数和B手机新用户数接近']},
 {name:'图形推理',text:'从四个选项中选出符合图形规律的一项，填入空缺处。',options:['A','B','C','D']}
];
$('#questions').innerHTML=questions.map((q,i)=>`<fieldset class="question"><legend>${i+1}. ${q.name}</legend><p class="qtext">${q.text}</p>${i===2?'<div id="exam-data" class="exam-data" role="img" aria-label="四年A手机新用户为9800、11000、15000、18000人，B手机为2500、4330、8500、14000人"></div>':''}${i===3?`<div class="pattern-question"><div class="pattern-main"><img src="assets/figure-question.png" alt="原题图形，右下区域有三格空缺"></div><div class="pattern-choices">${q.options.map((v,j)=>`<label class="pattern-option"><span class="pattern-cut" style="--offset:${[-163,-244,-320,-400][j]}px"><img src="assets/figure-question.png" alt="原题${v}选项"></span><span><input type="radio" name="q${i}" value="${j}">${v}</span></label>`).join('')}</div></div>`:`<div class="options">${q.options.map((v,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"><b>${'ABCD'[j]}.</b><span>${v}</span></label>`).join('')}</div>`}</fieldset>`).join('');
$('#send').onclick=()=>{stage('mail');$('#start-exam').focus()};
let timer=null,examChart,reportTransition;
$('#start-exam').onclick=()=>{
 stage('exam');state.submitted=false;state.answers.fill(null);$('#exam').reset();$('#answered').textContent='已作答 0 / 4 题';
 if(!examChart){examChart=echarts.init($('#exam-data'),null,{renderer:'svg'});examChart.setOption({animation:false,textStyle:{fontFamily:'Microsoft YaHei',fontSize:9},grid:{left:42,right:8,top:12,bottom:35},legend:{bottom:0,itemWidth:8,itemHeight:8,textStyle:{fontSize:9}},xAxis:{type:'category',data:['第一年','第二年','第三年','第四年'],axisTick:{show:false},axisLabel:{fontSize:9}},yAxis:{type:'value',max:35000,interval:10000,axisLabel:{fontSize:8},splitLine:{lineStyle:{color:'#ddd'}}},series:[{name:'A手机用户',type:'bar',stack:'total',data:[9800,11000,15000,18000],itemStyle:{color:'#6994ad'},label:{show:true,position:'inside',fontSize:9}},{name:'B手机用户',type:'bar',stack:'total',data:[2500,4330,8500,14000],itemStyle:{color:'#c59351'},label:{show:true,position:'inside',fontSize:9}}]})}else examChart.resize();
 setTimeout(()=>{if(state.stage!=='exam')return;state.started=Date.now();state.deadline=state.started+180000;timer=setInterval(tick,200);tick()},900);
};
$('#exam').addEventListener('change',e=>{if(!e.target.matches('input[type=radio]'))return;state.answers[Number(e.target.name.slice(1))]=Number(e.target.value);$('#answered').textContent=`已作答 ${state.answers.filter(x=>x!==null).length} / 4 题`});
function tick(){const left=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));$('#timer').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;if(left===0)submit()}
function enterReport(){
 clearInterval(timer);clearTimeout(reportTransition);
 $('#experience').hidden=true;$('#report').hidden=false;state.stage='report';
 $('#report').dataset.enteredAt=String(Date.now());window.scrollTo(0,0);initArticle();
}
function submit(){if(state.submitted||state.stage!=='exam')return;state.submitted=true;clearInterval(timer);const seconds=state.started?Math.min(180,Math.max(0,Math.round((Date.now()-state.started)/1000))):0;stage('submitted');$('#receipt-copy').textContent=`已作答 ${state.answers.filter(x=>x!==null).length}/4题　用时${Math.floor(seconds/60)}分${seconds%60}秒`;$('.receipt').dataset.submittedAt=String(Date.now());$('.receipt').focus();reportTransition=setTimeout(enterReport,1000)}
$('#skip-invitation').onclick=enterReport;$('#skip-exam').onclick=enterReport;
$('#exam').onsubmit=e=>{e.preventDefault();submit()};document.addEventListener('visibilitychange',()=>{if(state.stage==='exam'&&state.started)tick()});
const titles={1:'高校毕业生预计规模逐年增加，2026届达1270万人，较2021届增长39.7%',2:'三组调查中，投递50份以上简历的占比均最高，分别为34.9%、39.2%和31.74%',3:'在已收集的企业校招项目中，81.6%的项目选择将测评安排在首次人工面试前',4:'在要求测评企业所属门类中，制造业占比最高，达57.8%',5:D[5].title,6:D[6].title,7:D[7].title,8:D[8].title,9:D[9].title,10:D[10].title,11:D[11].title,12:D[12].title};
const restoredChartNotes={"1": "数据来源：教育部、中国青年报、人民网、新华网。注：各届均为预计规模。", "2": "数据来源：智联招聘、智联研究院、广州南方学院。不同投递数量区间人数占比，单位：%。", "3": "数据来源：企业招聘官网、企业指定招聘页及高校公开招聘公告。", "4": "注：数据来源于企业招聘官网、官方招聘平台及高校就业信息网公开的招聘公告。以公开企业名单及招聘信息为线索开展定向检索，并依据《国民经济行业分类》归类。本图纳入90个企业招聘名称，涉及116条已确认测评的招聘项目记录。"};
function section(n){return `<section class="chart-section" id="figure-${n}" aria-label="图${n}"><h3>${esc(titles[n])}</h3><div id="viz-${n}"></div><p class="chart-foot source-note">${esc(COPY.notes[n]||restoredChartNotes[n]||D[n]?.note||'')}</p></section>`}
function chapter(title,singleLine=false){return `<header class="chapter-scene"><h2${singleLine?' class="single-line-heading"':''}>${title}</h2></header>`}
$('#story').innerHTML=COPY.story.map(item=>{
 if(item.type==='figure')return section(item.n);
 if(item.type==='heading')return chapter(esc(item.text).replace(esc(item.emphasis),'<em>'+esc(item.emphasis)+'</em>'),item.sourceIndex===74);
 return '<p class="story-copy" data-paragraph="'+item.id+'" data-copy-source="'+item.sourceIndex+'">'+emphasizeCopy(item.text,PRESENTATION.emphasis.story[item.sourceIndex])+'</p>';
}).join('')+'<section class="ending" id="ending"><div class="ending-copy">'+COPY.ending.map((text,index)=>'<p'+(index===3?' class="ending-one-line"':'')+'>'+emphasizeCopy(text,PRESENTATION.emphasis.ending[index])+'</p>').join('')+'</div><div class="end-rule"></div></section>';
const reportReferences=[{"publisher": "智联招聘", "name": "2023大学生就业力报告", "year": "2023", "url": "https://special.zhaopin.com/2022/shz/szqh090253/file/2023%E5%B9%B4%E5%B0%B1%E4%B8%9A%E5%8A%9B%E6%8A%A5%E5%91%8A.pdf"}, {"publisher": "智联招聘", "name": "2024大学生就业力调研报告", "year": "2024", "url": "https://file.digitaling.com/eImg/uimages/20240711/1720666811119410.pdf", "carrier": "报告原文，第三方存档"}, {"publisher": "广州南方学院", "name": "广州南方学院2025年毕业生就业质量年度报告", "year": "2025", "url": "https://www.nfu.edu.cn/guangzhounanfangxueyuan2025nianbiyeshengjiuyezhiliangniandubaogao.pdf"}, {"publisher": "怡安", "name": "2010校园招聘趋势调研报告", "year": "2010", "url": "https://www.aon.com/thought-leadership/china-connect/attachment/1007/cc2010july2campus.pdf"}, {"publisher": "北森", "name": "2017—2018中国企业校园招聘测评趋势报告", "year": "2018", "url": "https://www.beisen.com/res/356.html"}, {"publisher": "Mercer | Mettl", "name": "Building on collective strength: Managing a multigenerational workforce during economic challenges", "year": "2023", "url": "https://resources.mettl.com/wp-content/uploads/2024/01/multi-generational-workforce-Report-Final.pdf"}];
$('#source-list').innerHTML=reportReferences.map(s=>`<li>${esc(s.publisher)}：《${esc(s.name)}》，${esc(s.year)}。<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.carrier||'报告原文或发布页')}</a></li>`).join('');
let articleInitialized=false;
function initArticle(){if(articleInitialized)return;articleInitialized=true;initVoices();placeDecor();paintSky();Revision.observeReading();const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const n=Number(e.target.id.split('-')[1]);try{if(e.target.dataset.ready==='true')continue;renderers[n]();e.target.dataset.ready='true';Revision.watchFigure(e.target);requestAnimationFrame(()=>{balanceVisibleText();fitViewportFigures()})}catch(error){e.target.dataset.error=error.message;console.error('Chart',n,error)}observer.unobserve(e.target)}},{rootMargin:'800px'});$$('.chart-section').forEach(s=>observer.observe(s));requestAnimationFrame(()=>{window.storyAudit.renderAll();fitViewportFigures()})}
const base={backgroundColor:'transparent',color:palette,textStyle:{fontFamily:'Microsoft YaHei',color:'#FFFFFF'},animationDuration:650,tooltip:{trigger:'item',confine:true,backgroundColor:'#f2f4f5',borderColor:'#7f909b',textStyle:{color:'#000000',fontSize:13},extraCssText:'max-width:450px;white-space:normal;line-height:1.7'},aria:{enabled:true}};
const axis={nameTextStyle:{color:'#FFFFFF',fontSize:15},axisLine:{lineStyle:{color:'#6a7d88'}},axisLabel:{color:'#FFFFFF',fontSize:14},axisTick:{show:false},splitLine:{lineStyle:{color:'#3c4c56',type:'dashed'}}};
function ec(el,option){const c=echarts.init(el,null,{renderer:'svg'});c.setOption({...base,...option,animation:false});chartInstances.push(c);Revision.registerChart(el,c);return c}
function mount(n,detail=false){const el=$(`#viz-${n}`);el.innerHTML=detail?`<div class="chart-layout"><div class="chart"></div><aside class="detail"></aside></div>`:'<div class="chart"></div>';return {el,plot:el.querySelector('.chart'),detail:el.querySelector('.detail')}}
function multiline(s,n=12){return s.match(new RegExp('.{1,'+n+'}','g'))?.join('\n')||s}
const renderers={
1(){const {plot}=mount(1);ec(plot,{grid:{left:70,right:45,top:45,bottom:45},tooltip:{...base.tooltip,trigger:'axis',formatter:p=>`${p[0].axisValue}届<br>预计规模：${p[0].value}万人`},xAxis:{...axis,type:'category',boundaryGap:false,data:D[1].map(r=>r.year)},yAxis:{...axis,type:'value',min:0,max:1400,name:'万人'},series:[{type:'line',data:D[1].map(r=>r.value),lineStyle:{width:4},symbolSize:10,itemStyle:{color:palette[0]},areaStyle:{color:'#d9b85d18'},label:{show:true,position:'top',distance:14,color:'#FFFFFF',fontSize:20}}]})},
2(){const {plot}=mount(2),grids=[],xs=[],ys=[],series=[],title=[];D[2].forEach((g,i)=>{const left=2+i*33;grids.push({left:`${left+7}%`,width:'23%',top:65,bottom:40});xs.push({...axis,type:'value',gridIndex:i,min:0,max:50,axisLabel:{...axis.axisLabel,formatter:'{value}%'}});ys.push({...axis,type:'category',gridIndex:i,inverse:true,data:g.rows.map(r=>r.label),splitLine:{show:false},axisLine:{show:false},axisLabel:{...axis.axisLabel,fontSize:14}});title.push({text:g.name,left:`${left}%`,top:4,textStyle:{fontSize:15,color:'#FFFFFF'}});series.push({name:g.name,type:'bar',xAxisIndex:i,yAxisIndex:i,barWidth:25,data:g.rows.map(r=>({value:r.percent,itemStyle:{color:r.label==='50份以上'?palette[0]:palette[i]+'99'}})),label:{show:true,position:'right',color:'#FFFFFF',fontSize:15,formatter:p=>p.value.toFixed(g.decimals)+'%'}})});ec(plot,{grid:grids,xAxis:xs,yAxis:ys,series,title,tooltip:{...base.tooltip,formatter:p=>`${esc(p.seriesName)}<br>${esc(p.name)}：${p.value}%`}})},
3(){const el=$('#viz-3'),groups=['首次人工面试前','人工面试轮次之间','公告面试环节之后'];el.innerHTML=`<div class="dot-columns">${groups.map((g,i)=>{const rows=D[3].filter(r=>r.stage===g);return `<div class="dot-group"><h4>${g}</h4><strong>${rows.length}</strong><small>个 · ${(rows.length/87*100).toFixed(1)}%</small><div class="dots">${rows.map(r=>`<button class="dot" data-project="${D[3].indexOf(r)}" aria-label="${esc(r.company+' '+r.project)}" title="${esc(r.company)}"></button>`).join('')}</div></div>`}).join('')}</div><div class="inline-detail" aria-live="polite"></div>`;const detail=el.querySelector('.inline-detail');function show(index){const r=D[3][index];detail.innerHTML=`<b>${esc(r.company)} · ${esc(r.project)}</b><br>${esc(r.flow)}`}el.querySelectorAll('.dot').forEach(b=>{b.onclick=()=>show(+b.dataset.project);b.onmouseenter=()=>show(+b.dataset.project)});show(0)},
4(){},
5(){},
6(){},
7(){},
8(){},
9(){},
 10(){
  const {plot}=mount(10),raw=D[10];
  const nodes=raw.nodes.map(n=>({...n,symbolSize:n.kind==='provider'?58:12,label:{show:n.kind==='provider',color:'#182433',fontSize:17,position:'right',distance:9},itemStyle:{color:palette[n.category%8]}}));
  const links=raw.edges.map(e=>({...e,lineStyle:{color:palette[e.category%8],opacity:.46,type:e.kind==='self'?'dashed':'solid',width:1.1}}));
  function describe(p){
   if(p.dataType==='edge'){
    const e=p.data,a=raw.nodes.find(n=>n.id===e.source),b=raw.nodes.find(n=>n.id===e.target);
    return '<b>'+esc(a?.name)+' → '+esc(b?.name)+'</b><br>'+(e.kind==='self'?'求职者自述':'企业案例、招聘公告或联合项目')+' · '+e.recordCount+'条记录';
   }
   const node=raw.nodes.find(n=>n.id===p.data.id);if(!node)return '';
   const edges=raw.edges.filter(e=>e.source===node.id||e.target===node.id);
   return '<b>'+esc(node.name)+'</b><div class="relation-tooltip-list">'+edges.map(e=>{const other=raw.nodes.find(n=>n.id===(e.source===node.id?e.target:e.source));return '<p>'+esc(other?.name)+'<br><small>'+(e.kind==='self'?'求职者自述':'企业案例、招聘公告或联合项目')+' · '+e.recordCount+'条记录</small></p>'}).join('')+'</div>';
  }
  const c=ec(plot,{tooltip:{...base.tooltip,formatter:describe,enterable:true,confine:true,extraCssText:'max-width:400px;max-height:350px;overflow:auto;white-space:normal;line-height:1.7'},series:[{id:'provider-network',type:'graph',layout:'none',data:nodes,links,roam:false,left:38,right:90,top:28,bottom:32,emphasis:{focus:'adjacency',scale:1.2,label:{show:true,color:'#182433',fontSize:15,backgroundColor:'#f0f5f8',padding:[3,5]},lineStyle:{opacity:1,width:2}},blur:{lineStyle:{opacity:.07},itemStyle:{opacity:.3}}}]});
  plot.dataset.nodeCount=nodes.length;plot.dataset.edgeCount=links.length;plot.dataset.detailMode='hover';
  const foot=document.createElement('p');foot.className='chart-foot';foot.textContent='连线表示已采集的关联记录，不表示市场份额；公开材料与个人自述分别保留。';$('#viz-10').append(foot);
 },
11(){},
12(){}
};
function decorate(src,side,type='character'){return `<img class="decor ${type} ${side} ${src.toLowerCase()}" src="assets/illustrations/${src}.png" alt="" aria-hidden="true" loading="lazy">`}
$('#send').onclick=()=>{if($('#send').disabled)return;$('#send').disabled=true;$('.opening').classList.add('posting');setTimeout(()=>{stage('mail');$('#experience').classList.add('mail-arrived');$('.mail-notice').hidden=false;setTimeout(()=>{$('#experience').classList.remove('mail-arrived');$('.mail-notice').hidden=true},1500);$('#start-exam').focus()},2400)};
const dataGraph=$('#exam-data');dataGraph.id='exam-data-original';dataGraph.innerHTML='<img src="assets/exam-data.svg" alt="原题柱形图：四年A手机用户为9800、11000、15000、18000人，B手机为2500、4330、8500、14000人">';
const analysisRow=document.createElement('div');analysisRow.className='analysis-layout';dataGraph.before(analysisRow);const analysisOptions=analysisRow.parentElement.querySelector('.options');analysisRow.append(dataGraph,analysisOptions);
const pattern=$('.pattern-question');pattern.innerHTML=`<img class="pattern-full" src="assets/exam-pattern.svg" alt="原题图形及空缺"><div class="pattern-choices">${['A','B','C','D'].map((v,i)=>`<label class="pattern-option"><img src="assets/exam-option-${i}.svg" alt="原题${v}选项"><span><input type="radio" name="q3" value="${i}">${v}</span></label>`).join('')}</div>`;
$('#start-exam').onclick=()=>{stage('exam');state.submitted=false;state.answers.fill(null);$('#exam').reset();$('#answered').textContent='已作答 0 / 4 题';clearInterval(timer);$('#timer').textContent='03:00';const controls=$$('#exam input, #exam .submit');controls.forEach(e=>e.disabled=true);let begun=false;const begin=()=>{if(begun||state.stage!=='exam')return;begun=true;controls.forEach(e=>e.disabled=false);state.started=Date.now();state.deadline=state.started+180000;timer=setInterval(tick,200);tick()};$('#exam').addEventListener('animationend',begin,{once:true});setTimeout(begin,800)};

const prototypeWidgets=[];
function prototype(n){
 const host=$(`#viz-${n}`),spec=window.CHART_PROTOTYPES[n],localInk=n>=5?'#182433':'#f7f8fb';host.classList.add('prototype-chart');host.dataset.prototype='original';if(host.shadowRoot)return;const root=host.attachShadow({mode:'open'});root.innerHTML=`<style>${spec.css}</style><div class="widget-body">${spec.html}</div>`;const body=root.querySelector('.widget-body');
 const overrides=document.createElement('style');overrides.textContent=`:host{display:block;color:#000;background:#fff;font:15px/1.8 "Microsoft YaHei",sans-serif}.widget-body{position:relative;background:#fff;color:#000;overflow:hidden}.page{width:100%!important;max-width:none!important;margin:0!important;padding:18px 14px!important;color:#000!important}h1,.tools,.toolbar,#replay{display:none!important}.source-list,.source-dialog a[href]{display:none!important}a,button,p,h1,h2,h3,small,span,label{color:#000!important}button{cursor:pointer}#chart{width:100%!important;min-width:0!important}#chart-container{min-width:0!important;width:100%!important}#industry-toolbar{margin:4px 22px 12px!important}#industry-toolbar label,#industry-toolbar select{font-size:15px!important;color:#000!important}.wall{margin-bottom:0!important}.record{opacity:1;animation:none!important;transform:none}.mask{position:fixed!important;inset:0!important;z-index:200!important;background:#0009!important}.mask[hidden]{display:none!important}.source-dialog{position:absolute!important;top:5vh!important;bottom:5vh!important;right:5vw!important;max-height:90vh!important;width:500px!important;background:#fff!important;color:#000!important}.panel-hint,.row-content>p{font-size:14px!important}.note{font-size:14px!important;color:#000!important}.close{background:#fff!important;color:#000!important}.category-name,.category-total{color:#000!important}`;root.append(overrides);const adaptation=document.createElement('style');adaptation.textContent=window.iterationShadowCSS;root.append(adaptation);
 const doc=new Proxy(document,{get(target,key){if(key==='getElementById')return id=>root.getElementById(id);if(key==='querySelector')return s=>root.querySelector(s);if(key==='querySelectorAll')return s=>root.querySelectorAll(s);if(key==='body')return body;if(key==='head')return root;if(key==='documentElement')return body;if(key==='activeElement')return root.activeElement||document.activeElement;const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v}});
 const localWindow=new Proxy(window,{get(t,k){if(k==='storyInstallEcharts')return ()=>{};if(k==='open')return ()=>{};if(k==='innerWidth')return host.clientWidth;const v=Reflect.get(t,k,t);return typeof v==='function'&&!['Image','XMLSerializer'].includes(k)?v.bind(t):v},set(t,k,v){host[k]=v;return true}});

 function theme(value,context=''){
  if(Array.isArray(value))return value.map(x=>theme(x,context)).filter(x=>x!==null);
  if(typeof value==='string'&&COPY.oldNotes[n])return value.replace(COPY.oldNotes[n],COPY.notes[n]);
  if(!value||typeof value!=='object')return value;
  const text=String(value.style?.text||'').replace(/\s/g,'');
  if(value.id==='source-note'||(text&&[D[n]?.title,D[n]?.note].some(t=>t&&String(t).replace(/\s/g,'')===text)))return null;
  const result={};
  for(const[k,v]of Object.entries(value)){
   const tc=/label|textStyle|axisLabel|title|nameTextStyle/.test(k)||context==='text'||value.type==='text';
   if(k==='tooltip'){result[k]={...v,backgroundColor:'#f4f6f8',borderColor:'#a4acb5',textStyle:{...v.textStyle,color:'#111',fontSize:14}};continue}
   if(k==='title'){result[k]={...v,show:false};continue}
   if(k==='backgroundColor'){result[k]='transparent';continue}
   if(k==='color'&&tc){result[k]=localInk;continue}
   if(k==='fill'&&value.text!==undefined){result[k]=localInk;continue}
   if(k==='fill'&&typeof v==='string'&&/^#(?:fff(?:fff)?|DBEAFE|FFEDD5|EDE9FE)$/i.test(v)){result[k]='rgba(127,145,166,.12)';continue}
   if(k==='font'&&typeof v==='string'){result[k]=v.replace(/(\d+(?:\.\d+)?)px/,(_,s)=>Math.max(14,+s)+'px');continue}
   if(k==='fontSize'&&typeof v==='number'){result[k]=Math.max(14,v);continue}
   if(k==='animation'){result[k]=!matchMedia('(prefers-reduced-motion: reduce)').matches;continue}
   if((k==='animationDuration'||k==='animationDurationUpdate')&&typeof v==='number'){result[k]=Math.min(v,650);continue}
   result[k]=theme(v,tc?'text':context);
  }
  return result;
 }
 const nativeInstances=[];const engine={...echarts,init(el,...args){const c=echarts.init(el,args[0]||null,{...(args[1]||{}),renderer:'svg'}),set=c.setOption.bind(c);c.setOption=(o,...rest)=>set(theme(o),...rest);nativeInstances.push(c);chartInstances.push(c);Revision.registerChart(host,c,n);return c}};
 try{new Function('document','window','echarts',spec.js)(doc,localWindow,engine);host.dataset.ready='true'}catch(e){host.dataset.error=e.message;throw e}root.querySelectorAll('h1').forEach(e=>e.remove());prototypeWidgets.push({n,root,host,instances:nativeInstances});Revision.stylePrototype(n,root,host,nativeInstances);
}
for(const n of [4,7,8,9,11])renderers[n]=()=>prototype(n);
renderers[5]=()=>{const el=$('#viz-5');el.innerHTML='<div class="timeline-snake">'+D[5].events.map((e,i)=>`<article class="timeline-event e${i}"><span class="timeline-dot"></span><b>${esc(e.date)}</b><h4>${esc(e.title)}</h4><p>${esc(e.body)}</p></article>`).join('')+'</div>';const grid=el.firstChild,svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('timeline-path');svg.setAttribute('aria-hidden','true');grid.prepend(svg);function path(){const w=grid.clientWidth,h=grid.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);const pts=[...grid.querySelectorAll('.timeline-dot')].map(e=>{const r=e.getBoundingClientRect(),b=grid.getBoundingClientRect();return [r.left-b.left+7,r.top-b.top+7]});let d='M'+pts[0].join(',');for(let i=1;i<pts.length;i++){const[x,y]=pts[i],[px,py]=pts[i-1];d+=Math.abs(y-py)>80?` C ${px+(i===6?40:-40)},${py+80} ${x+(i===6?40:-40)},${y-80} ${x},${y}`:` L${x},${y}`}svg.innerHTML=`<path d="${d}" fill="none" stroke="#BC354B" stroke-width="2" stroke-dasharray="5 8"/>`};requestAnimationFrame(path);addEventListener('resize',path)};
renderers[6]=()=>{$('#viz-6').innerHTML=`<img class="original-wordcloud" src="assets/g06-original.png" alt="原始测评类型词云，沿用135个词语的原位置与大小"><p class="chart-foot">${esc(D[6].note)}</p>`};
renderers[12]=()=>{const el=$('#viz-12');el.innerHTML='<div class="cloud" aria-label="81个求职者态度词语"></div><div class="word-detail" aria-live="polite" hidden></div>';const cloud=el.firstChild,detail=el.lastChild,terms=D[12].terms;layoutCloud(cloud,terms.map(t=>({text:t.word,weight:t.count})),i=>{const t=terms[i];detail.hidden=false;detail.innerHTML=`<h4>${esc(t.word)}</h4><p>${t.count}篇原帖提及</p>${t.ids.map(id=>D[12].records.find(r=>r.id===id)).filter(Boolean).map(r=>`<blockquote>${esc(r.attitude_text||r.evidence)}</blockquote>`).join('')}`;})};

window.iterationShadowCSS=[
 ':host,.widget-body,.page,#chart,#chart-container{background:transparent!important;color:var(--ink)!important}',
 ':host{display:block;font-family:"Microsoft YaHei",sans-serif}.page{padding:12px 0 18px!important}',
 'a,button,p,h2,h3,h4,small,span,label,select,.category-name,.category-total{color:var(--page-ink)!important}svg text{fill:var(--page-ink)!important}',
 'select,option{background:var(--panel)!important}#industry-toolbar{margin:0 10px 10px!important}',
 '.source-dialog{background:var(--panel)!important;color:var(--ink)!important;border-color:var(--line)!important}',
 '.source-dialog p,.source-dialog h3,.case-link,.back{color:var(--ink)!important}.case-link,.close{background:var(--panel)!important}',
 '.feedback-panel,.note,.case-link{border-color:var(--line)!important}.panel-title{font-size:21px}.panel-hint,.row-content>p,.note{font-size:15px!important;line-height:1.85!important}',
 '.wall{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:26px}.feedback-row{grid-template-columns:100px minmax(0,1fr)}',
 '.record:hover{transform:translateY(-4px)!important}.record.is-open .flap{transform:scaleY(-.8)!important}',
 '.source-dialog a[href],.source-list,.toolbar,#replay{display:none!important}'
].join('');

function layoutCloud(host,words,onSelect){
 const width=host.clientWidth,ctx=document.createElement('canvas').getContext('2d');
 const max=Math.max(...words.map(w=>w.weight));
 const sorted=words.map((w,i)=>({...w,index:i})).sort((a,b)=>b.weight-a.weight||a.index-b.index);
 let boxes=[],height=words.length>100?540:450;
 for(let trial=0;trial<13;trial++){
  height=(words.length>100?540:450)+trial*40;boxes=[];let success=true;
  for(let i=0;i<sorted.length;i++){
   const w=sorted[i],font=15+Math.pow((w.weight-1)/Math.max(1,max-1),.66)*(words.length>100?44:48),size=font*(1-Math.min(trial,3)*.035);
   ctx.font=size+'px Microsoft YaHei';const tw=ctx.measureText(w.text).width+10,th=size*1.24+6;let spot=null;
   for(let step=0;step<7000;step++){
    const angle=step*2.3999632297+(i%5)*.13,r=Math.sqrt(step)*5.3;
    const x=width/2+Math.cos(angle)*r*1.42-tw/2,y=height/2+Math.sin(angle)*r*.83-th/2;
    if(x<5||y<6||x+tw>width-5||y+th>height-6)continue;
    if(boxes.every(b=>x+tw<b.x||x>b.x+b.w||y+th<b.y||y>b.y+b.h)){spot={x,y,w:tw,h:th,size,index:w.index};break}
   }
   if(!spot){success=false;break}boxes.push(spot)
  }
  if(success)break;
 }
 if(boxes.length!==words.length)throw Error('词云未能完整排入全部词语：'+boxes.length+'/'+words.length);
 host.style.height=height+'px';host.dataset.wordCount=String(words.length);host.dataset.layout='horizontal-free-cloud';
 const colors=['var(--cloud-primary)','var(--cloud-red)','var(--cloud-gray)','var(--cloud-primary)','var(--cloud-red)','var(--cloud-gray)'];
 boxes.forEach((b,i)=>{
  const w=words[b.index],button=document.createElement('button');button.type='button';button.textContent=w.text;
  button.style.cssText='left:'+b.x+'px;top:'+b.y+'px;font-size:'+b.size+'px;--word-ink:'+colors[(b.index*7+i)%colors.length];
  button.dataset.weight=w.weight;button.title=w.text+' · '+w.weight;button.setAttribute('aria-label',w.text+'，'+w.weight+'份材料提及');
  button.onclick=()=>{onSelect(b.index);requestAnimationFrame(balanceVisibleText)};host.append(button)
 });
}

function initVoices(){
 const host=$('#voice-stage'),ordered=COPY.voices.map(text=>({text}));
 host.innerHTML=ordered.map((v,i)=>'<div class="voice theme-'+i%5+'" style="--voice-size:'+([19,26,22,29,20,24,21][i%7])+'px">'+esc(v.text)+'</div>').join('');
 host.insertAdjacentHTML('afterbegin','<img class="voice-object v-envelope" src="assets/illustrations/O02.png" alt="" aria-hidden="true"><img class="voice-object v-laptop" src="assets/illustrations/O01.png" alt="" aria-hidden="true">');
 const lines=[...host.querySelectorAll('.voice')];let scheduled=false,anchors=[],layoutKey='';
 function scatter(w,vh){
  for(const key of ['height','position','display','flexWrap','justifyContent','gap'])host.style[key]='';
  lines.forEach(el=>{el.style.position='';el.style.whiteSpace='';el.style.transform=''});
  let boxes=[];
  for(let trial=0;trial<14;trial++){
   let seed=73819+trial*211;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
   const scale=1-trial*.025;lines.forEach((el,i)=>el.style.fontSize=([19,26,22,27,20,24,21][i%7]*scale)+'px');
   boxes=[];let ok=true;const indices=lines.map((el,i)=>({i,w:el.offsetWidth,h:el.offsetHeight})).sort((a,b)=>b.w*b.h-a.w*a.h);
   for(const box of indices){
    let spot=null;const gap=16+rand()*12;
    for(let k=0;k<14000;k++){
     const x=w*.035+rand()*(w*.93-box.w),y=vh*.055+rand()*(vh*.89-box.h);
     if(boxes.every(b=>x+box.w+gap<b.x||x>b.x+b.w+gap||y+box.h+gap<b.y||y>b.y+b.h+gap)){spot={...box,x,y};break}
    }
    if(!spot){ok=false;break}boxes.push(spot);
   }
   if(ok)break;
  }
  if(boxes.length!==lines.length){host.dataset.layout='compact-fallback';host.style.height='auto';host.style.position='relative';host.style.display='flex';host.style.flexWrap='wrap';host.style.justifyContent='center';host.style.gap='18px';lines.forEach(el=>{el.style.position='static';el.style.whiteSpace='normal';el.style.transform='none'});return false}
  const left=Math.min(...boxes.map(b=>b.x)),right=Math.max(...boxes.map(b=>b.x+b.w)),top=Math.min(...boxes.map(b=>b.y)),bottom=Math.max(...boxes.map(b=>b.y+b.h));
  anchors=[];for(const b of boxes)anchors[b.i]={x:b.x+(w-left-right)/2,y:b.y+(vh-top-bottom)/2};
  host.dataset.layout='centered-free-scatter';host.dataset.complete=boxes.length;return true;
 }
 function draw(){
  scheduled=false;const r=$('#voices').getBoundingClientRect(),vh=innerHeight,w=host.clientWidth;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){host.dataset.layout='static';return}
  const key=w+'x'+vh;if(key!==layoutKey){const ok=scatter(w,vh);layoutKey=key;if(!ok)return}if(anchors.length!==lines.length)return;
  const caseBottom=$('#case').getBoundingClientRect().bottom;const p=Math.max(0,Math.min(1,(vh*.5-caseBottom)/(r.height-vh+vh*.5)));host.dataset.progress=p.toFixed(3);host.dataset.triggerCaseBottom=caseBottom.toFixed(1);host.style.visibility=p>0?'visible':'hidden';
  host.style.clipPath='inset(0 0 '+Math.max(0,vh-$('#story').getBoundingClientRect().top)+'px 0)';
  lines.forEach((el,i)=>{
   const anchor=anchors[i];
   let x;
   if(p<.3){const q=p/.3,e=1-Math.pow(1-q,2);x=w+80+i*7+(anchor.x-w-80-i*7)*e}
   else if(p<.7)x=anchor.x-(p-.5)*22;
   else x=anchor.x-4.4-Math.pow((p-.7)/.3,1.12)*(w+el.offsetWidth+140);
   el.style.transform='translate3d('+x+'px,'+anchor.y+'px,0)';const fadeStart=Math.max(0,Math.min(.09,anchor.y/vh*.09));el.style.opacity=String(Math.max(0,Math.min(1,(p-fadeStart)/.1)));
  })
 }
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(draw)}},{passive:true});
 addEventListener('resize',draw);draw();
}

renderers[5]=()=>{
 const el=$('#viz-5');el.innerHTML='<div class="timeline-snake">'+D[5].events.map((e,i)=>'<article class="timeline-event" data-index="'+i+'"><span class="timeline-dot"></span><b>'+esc(e.date)+'</b><h4>'+esc(e.title)+'</h4><p>'+esc(e.body)+'</p></article>').join('')+'</div>';
 const grid=el.firstChild,svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('timeline-path');grid.prepend(svg);
 function path(){
  const events=[...grid.querySelectorAll('.timeline-event')];events.forEach((e,i)=>{const row=Math.floor(i/4),col=row%2?4-i%4:i%4+1;e.style.gridColumn=col;e.style.gridRow=row+1});
  const gb=grid.getBoundingClientRect(),pts=events.map(e=>{const b=e.querySelector('.timeline-dot').getBoundingClientRect();return [b.left-gb.left+7,b.top-gb.top+7]});
  svg.setAttribute('viewBox','0 0 '+grid.clientWidth+' '+grid.clientHeight);let d='M'+pts[0].join(',');
  for(let i=1;i<pts.length;i++){const [x,y]=pts[i],[px,py]=pts[i-1];if(i%4===0){const dir=Math.floor((i-1)/4)%2===0?1:-1,edge=dir>0?grid.clientWidth-6:6;d+=' H'+(edge-dir*18)+' Q'+edge+','+py+' '+edge+','+(py+18)+' V'+(y-18)+' Q'+edge+','+y+' '+(edge-dir*18)+','+y+' H'+x}else d+=' L'+x+','+y}
  svg.innerHTML='<path d="'+d+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 8"/>';
 }
 requestAnimationFrame(()=>{balanceVisibleText();path()});addEventListener('resize',()=>requestAnimationFrame(path));
};
renderers[6]=()=>{
 const el=$('#viz-6');el.innerHTML='<div class="cloud" aria-label="135个测评内容词语"></div><div class="word-detail" aria-live="polite" hidden></div>';
 const detail=el.lastChild;layoutCloud(el.firstChild,D[6].words.map(w=>({text:w.text,weight:w.weight})),i=>{
  const w=D[6].words[i];detail.hidden=false;detail.innerHTML='<h4>'+esc(w.text)+'</h4><p>该词在'+w.weight+'份采集材料中被提及；其中企业招聘材料'+w.official+'份、社媒原帖'+w.social+'篇、网页资讯'+w.news+'篇。</p>';
 });
};
renderers[12]=()=>{
 const el=$('#viz-12');el.innerHTML='<div class="cloud cloud-frequency-a" aria-label="81个求职者态度词语，按提及频率排列"></div><div class="word-detail" aria-live="polite" hidden></div>';
 const cloud=el.firstChild,detail=el.lastChild,terms=D[12].terms,layout=PRESENTATION.cloudA;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox',layout.viewBox.join(' '));svg.classList.add('frequency-cloud');
 cloud.dataset.wordCount=String(terms.length);cloud.dataset.layout='approved-frequency-a';
 for(const box of layout.terms){
  const t=terms[box.index];
  if(t.word!==box.word)throw Error('A版词云与原始词语不匹配');
  const term=document.createElementNS('http://www.w3.org/2000/svg','g');term.classList.add('term');
  term.setAttribute('role','button');term.setAttribute('tabindex','0');
  term.setAttribute('aria-label',t.word+'，'+t.count+'篇原帖提及');
  term.dataset.word=t.word;term.dataset.weight=String(t.count);term.dataset.recordIds=t.ids.join(',');
  term.innerHTML='<title>'+esc(t.word+'：'+t.count+'篇原帖提及')+'</title><text x="'+box.x+'" y="'+box.y+'" font-family="Microsoft YaHei" font-size="'+box.font+'" fill="'+box.color+'">'+esc(t.word)+'</text>';
  const showDetail=()=>{
   detail.hidden=false;detail.innerHTML='<h4>'+esc(t.word)+'</h4><p>在所选的个人原帖中，共有'+t.count+'篇提及这一表达。</p>'+t.ids.map(id=>D[12].records.find(r=>r.id===id)).filter(Boolean).map(r=>'<blockquote>'+esc(r.attitude_text||r.evidence)+'</blockquote>').join('');
   requestAnimationFrame(balanceVisibleText);
  };
  term.onclick=showDetail;term.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showDetail()}};
  svg.append(term);
 }
 cloud.append(svg);
};

function balanceVisibleText(){
 const roots=[document,...prototypeWidgets.map(w=>w.root)];
 for(const root of roots)for(const el of root.querySelectorAll('.story-copy,.case-copy p,.case-source,.opening-intro,.ending p,.timeline-event p,.chart-foot,.chart-meta,.detail p,.word-detail p,.word-detail blockquote,.source-dialog p,.row-content>p,.panel-hint')){
  if(!el.getClientRects().length||el.dataset.balanced===String(Math.round(el.clientWidth)))continue;
  el.querySelectorAll('.keep-tail').forEach(s=>s.replaceWith(...s.childNodes));
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),chars=[];let node;
  while(node=walker.nextNode())for(let i=0;i<node.textContent.length;i++){if(!node.textContent[i].trim())continue;const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+1);const b=r.getBoundingClientRect();if(b.width)chars.push({node,i,y:Math.round(b.top),c:node.textContent[i]})}
  const lines=[];for(const c of chars){let line=lines.find(l=>Math.abs(l.y-c.y)<6);if(!line){line={y:c.y,chars:[]};lines.push(line)}line.chars.push(c)}
  lines.sort((a,b)=>a.y-b.y);const last=lines.at(-1);
  if(last&&lines.length>1&&last.chars.length<8&&chars.length>=8){
   const from=chars[chars.length-9]||chars[0],to=chars.at(-1),range=document.createRange();range.setStart(from.node,from.i);range.setEnd(to.node,to.i+1);
   const span=document.createElement('span');span.className='keep-tail';span.append(range.extractContents());range.insertNode(span);
  }
  el.dataset.balanced=String(Math.round(el.clientWidth));
 }
}

const characterSpecs=[{id:'13',asset:'P03',side:'left',width:312},{id:'57',asset:'P05',side:'left',width:276},{id:'65',asset:'P02',side:'right',width:432},{id:'80',asset:'P04',side:'right',width:408},{id:'94',asset:'P06',side:'right',width:264}];
for(const child of [...$('#story').children]){
 if(child.matches('.chart-section,#ending'))continue;
 let wrap=child.previousElementSibling;
 if(!wrap?.matches('.story-bridge')){wrap=document.createElement('section');wrap.className='story-bridge';wrap.innerHTML='<div class="bridge-copy"></div>';child.before(wrap)}
 wrap.firstChild.append(child);
}
for(const spec of characterSpecs){
 const p=document.querySelector('[data-paragraph="'+spec.id+'"]'),wrap=p?.closest('.story-bridge');if(!wrap)continue;
 wrap.classList.add(spec.side);wrap.dataset.asset=spec.asset;wrap.dataset.characterWidth=spec.width;wrap.insertAdjacentHTML('beforeend',decorate(spec.asset,spec.side));
}
$('.case>.character')?.remove();$('.case').insertAdjacentHTML('beforeend',decorate('P01','right'));
$('.case').dataset.characterWidth=200;$('.case').dataset.asset='P01';
$('#ending').insertAdjacentHTML('beforeend',decorate('P07-complete','right'));$('#ending').dataset.characterWidth=570;$('#ending').dataset.asset='P07-complete';
const sideObjects=[['O01','left',1],['O02','right',3],['O07','left',4],['O03','right',6],['O06','left',8],['O04','right',10],['O05','left',12],['O02','right',5],['O07','left',9]];
sideObjects.forEach(([asset,side,fig],i)=>{const deco=document.createElement('div');deco.className='side-object-zone '+side;deco.dataset.figure=fig;deco.style.setProperty('--object-angle',(i%2?-13:11)+'deg');deco.innerHTML=decorate(asset,side,'object');$('#story').append(deco)});
function placeDecor(){
 if($('#report').hidden)return;
 const w=document.documentElement.clientWidth,cw=$('#figure-1').getBoundingClientRect().width;
 for(const wrap of document.querySelectorAll('.story-bridge,#ending')){
  const img=wrap.querySelector(':scope>.character');if(!img)continue;
  const rect=wrap.getBoundingClientRect(),side=img.classList.contains('left')?'left':'right';
  const content=wrap.querySelector('.bridge-copy'),contentHeight=content?.getBoundingClientRect().height||300;
  const maxHeight=Math.max(270,Math.min(innerHeight*.48,contentHeight+45));
  const width=Math.min(+wrap.dataset.characterWidth,img.naturalWidth?maxHeight*img.naturalWidth/img.naturalHeight:250);
  img.style.width=width+'px';img.style.setProperty('left',side==='left'?(w*.05-rect.left)+'px':'auto','important');img.style.setProperty('right',side==='right'?(rect.right-w*.95)+'px':'auto','important');img.style.top='50%';
  const textWidth=Math.min(619,Math.floor(w*.45+cw/2-width-38));wrap.style.setProperty('--illustrated-text',Math.max(250,textWidth)+'px');
  if(content)content.style.width=Math.max(250,textWidth)+'px';
  if(img.complete&&img.naturalWidth&&!wrap.matches('.case'))wrap.style.minHeight=(width*img.naturalHeight/img.naturalWidth+innerHeight*.02)+'px';
  if(wrap.id==='ending'){
   const line=wrap.querySelector('.ending-one-line'),lineRight=line.getBoundingClientRect().right;
   const left=Math.max(w*.95-width,lineRight+24),fittedWidth=Math.min(width,w-24-left);
   img.style.width=fittedWidth+'px';img.style.setProperty('left',(left-rect.left)+'px','important');img.style.setProperty('right','auto','important');
   wrap.style.minHeight=innerHeight+'px';
  }
 }
 const story=$('#story').getBoundingClientRect();
 for(const zone of document.querySelectorAll('.side-object-zone')){const fig=$('#figure-'+zone.dataset.figure).getBoundingClientRect();zone.style.top=(fig.top-story.top+Math.min(fig.height*.6,480))+'px'}
}

const sky=document.createElement('div');sky.id='night-sky';sky.setAttribute('aria-hidden','true');document.body.prepend(sky);
const dawn=document.createElement('div');dawn.id='dawn-sky';dawn.setAttribute('aria-hidden','true');document.body.prepend(dawn);
for(let i=0;i<140;i++){const star=document.createElement('i');star.style.cssText='left:'+((i*71.37)%100)+'%;top:'+((i*43.91)%100)+'%;--star-duration:'+(3+i%7)+'s;--star-delay:-'+(i%9)+'s;width:'+(i%11===0?2.6:1.3)+'px;height:'+(i%11===0?2.6:1.3)+'px';sky.append(star)}
function paintSky(){
 if($('#report').hidden)return;
 const first=$('#case'),timeline=$('#figure-5'),last=$('#ending');
 const start=first.getBoundingClientRect().top+scrollY-innerHeight*.25;
 const pivot=timeline.getBoundingClientRect().top+scrollY;
 const end=last.getBoundingClientRect().bottom+scrollY-innerHeight*.5;
 const anchor=scrollY+innerHeight*.5;
 const before=anchor<pivot;
 const t=before?Math.max(0,Math.min(1,(anchor-start)/Math.max(1,pivot-start))):Math.max(0,Math.min(1,(anchor-pivot)/Math.max(1,end-pivot)));
 const stops=before?
  [{p:0,c:[[7,14,28],[11,20,37],[18,29,48]]},{p:.62,c:[[24,38,61],[37,54,78],[52,68,87]]},{p:1,c:[[105,119,136],[105,119,136],[105,119,136]]}]:
  [{p:0,c:[[105,119,136],[105,119,136],[105,119,136]]},{p:.45,c:[[161,187,208],[184,202,215],[209,214,215]]},{p:1,c:[[215,231,241],[235,242,246],[247,230,212]]}];
 let j=0;while(j<stops.length-2&&t>stops[j+1].p)j++;
 const a=stops[j],b=stops[j+1],q=(t-a.p)/(b.p-a.p);
 const colors=a.c.map((c,k)=>c.map((v,i)=>Math.round(v+(b.c[k][i]-v)*q)));
 const style=document.documentElement.style,rgb=c=>'rgb('+c.join(',')+')';
 style.setProperty('--sky',rgb(colors[1]));['top','middle','horizon'].forEach((k,i)=>style.setProperty('--sky-'+k,rgb(colors[i])));style.setProperty('--sky-visible','1');
 // Reading colours belong to content sections, rather than to the viewport.
 // A soft text underlay keeps both colours readable around dawn's midpoint.
 style.setProperty('--star-opacity',before?Math.max(0,1-t*1.35):0);
 style.setProperty('--dawn-opacity',before?0:Math.max(0,(t-.25)/.75));
 document.body.dataset.skyProgress=(before?t*.5:.5+t*.5).toFixed(3);
 document.body.dataset.theme=before?'dark':'light';
 document.body.dataset.textPivot='figure-5';
}

let iterationRAF=false;
addEventListener('scroll',()=>{if(iterationRAF)return;iterationRAF=true;requestAnimationFrame(()=>{iterationRAF=false;paintSky();balanceVisibleText()})},{passive:true});
addEventListener('resize',()=>{placeDecor();paintSky();requestAnimationFrame(balanceVisibleText)});
addEventListener('load',()=>{placeDecor();paintSky();balanceVisibleText()});
document.querySelectorAll('.character').forEach(img=>img.addEventListener('load',placeDecor));
document.addEventListener('click',()=>setTimeout(()=>{placeDecor();paintSky();balanceVisibleText()},80));
requestAnimationFrame(()=>{placeDecor();paintSky();balanceVisibleText()});
window.iterationAudit={balanceVisibleText,placeDecor,paintSky,prototypeWidgets,fitViewportFigures};


function fitViewportFigures(){
 if($('#report').hidden)return;
 for(const n of [4,10]){
  const section=$('#figure-'+n),host=$('#viz-'+n);if(!host||(!host.children.length&&!host.shadowRoot))continue;
  const plot=n===4?host.shadowRoot?.querySelector('#chart-container'):host.querySelector('.chart');
  if(!plot)continue;
  let height;
  if(n===4){
   height=innerHeight+24;
   section.dataset.mainPlotHeight=String(height-78);
  }else{
   const nodes=D[10].nodes,xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
   const coordinateRatio=(Math.max(...xs)-Math.min(...xs))/(Math.max(...ys)-Math.min(...ys));
   height=60+(host.clientWidth-128)/coordinateRatio;
   section.dataset.coordinateRatio=coordinateRatio.toFixed(6);
   section.dataset.mainPlotHeight=height.toFixed(3);
  }
  const changed=section.dataset.viewportPlotHeight!==height.toFixed(2);
  section.style.setProperty('--viewport-plot-height',height+'px');
  section.dataset.viewportPlotHeight=height.toFixed(2);
  if(changed&&host.revisionRefresh)host.revisionRefresh();
 }
 for(const w of prototypeWidgets)for(const c of w.instances){
  if(w.n===4)c.resize({width:w.host.clientWidth,height:parseFloat(getComputedStyle($('#figure-4')).getPropertyValue('--viewport-plot-height'))});
 }
 for(const c of chartInstances)if(c.getDom().closest('#viz-10'))c.resize();
 placeDecor();paintSky();
}
Revision.setupCase();
Revision.alignOpening();
Revision.decorateHeadings();
addEventListener('resize',()=>requestAnimationFrame(fitViewportFigures));
addEventListener('load',()=>requestAnimationFrame(fitViewportFigures));
new ResizeObserver(()=>requestAnimationFrame(fitViewportFigures)).observe($('#story'));

let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{chartInstances.forEach(c=>c.resize());examChart?.resize();if(articleInitialized)for(const n of [6,12])if($(`#figure-${n}`).dataset.ready)renderers[n]()},150)});
if(new URLSearchParams(location.search).get('view')==='report'){$('#experience').hidden=true;$('#report').hidden=false;state.stage='report';initArticle();setTimeout(()=>{if(location.hash)document.querySelector(location.hash)?.scrollIntoView({behavior:'instant'})},100)}
window.storyAudit={renderAll(){document.querySelectorAll('img[loading=lazy]').forEach(e=>e.loading='eager');for(let n=1;n<=12;n++){if(!$(`#figure-${n}`).dataset.ready){renderers[n]();$(`#figure-${n}`).dataset.ready='true';Revision.watchFigure($(`#figure-${n}`))}}},chartCount:12,sourceCount:D.sources.length,renderers};
if(new URLSearchParams(location.search).get('audit')==='1'&&state.stage==='report')window.storyAudit.renderAll();
if(location.hash){const jump=()=>document.querySelector(location.hash)?.scrollIntoView({behavior:'instant'});addEventListener('load',()=>setTimeout(jump,180),{once:true});addEventListener('hashchange',jump)}
})();
