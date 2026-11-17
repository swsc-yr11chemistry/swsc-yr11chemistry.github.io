(function(){
var L=window.LESSON;
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
var IC={
warmup:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
learn:'<path d="M3 5h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v14h-7a3 3 0 0 0-2 1 3 3 0 0 0-2-1H3z"/><path d="M12 6v14"/>',
practise:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
ques:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
book:'<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M8 8h7M8 12h7"/>',
back:'<path d="M15 6l-6 6 6 6"/>',
board:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'};
function svg(n,cls){return '<svg class="ico'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'}
var S={done:{},cur:null,q:{}};
try{var r=JSON.parse(localStorage.getItem(L.key)||'{}');for(var k in r)S[k]=r[k]}catch(e){}
function save(){try{localStorage.setItem(L.key,JSON.stringify(S))}catch(e){}}


var h='<div class="toprow"><a class="tbtn back" href="'+(L.outline||'../../')+'">'+svg('back')+'Course outline</a><div class="toolbtns"><button class="tbtn" id="wordsBtn" type="button">'+svg('book')+'Key words</button><button class="tbtn" id="boardBtn" type="button">'+svg('board')+'Show on the board</button></div></div>'+
'<div class="hero"><div class="txt"><div class="eyebrow">'+esc(L.eyebrow)+'</div><h1>'+esc(L.title)+'</h1><div class="sub">'+esc(L.sub)+'</div><div class="kq">'+svg('ques')+'<span>'+esc(L.kq)+'</span></div></div>'+L.art+'</div>'+
'<div class="hgrid"><div class="hbox hli"><div class="lab">'+svg('target')+'Learning intention</div><p>'+L.li+'</p><div class="lab" style="margin-top:6px">Success criteria</div><ul>'+L.must.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ul><details><summary>Show the Should and Could criteria</summary><ul>'+L.more.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ul></details></div>'+
'<div class="hbox htyw"><div class="lab">'+svg('list')+'Today you will</div><ol>'+L.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol></div></div>';
$('#head').innerHTML=h;$('.hero').setAttribute('data-n',L.num||'');
var sd=document.createElement('aside');sd.className='side';sd.innerHTML='<div class="prog"><div class="pbar"><i id="pfill"></i></div><div class="pmeta"><span id="pdone"></span></div></div>'+
'<div class="tabs" role="tablist" id="tabs">'+L.parts.map(function(p){return '<button class="tab" role="tab" type="button" data-part="'+p[0]+'" id="t-'+p[0]+'" aria-controls="p-'+p[0]+'"><span class="ti">'+svg(p[0])+'</span><span class="tt"><b>'+p[1]+'</b></span></button>'}).join('')+'</div>';
var lb=$('.lbody');lb.insertBefore(sd,lb.firstChild);


var dr=document.createElement('div');
dr.innerHTML='<div class="scrim" id="scrim" hidden></div><aside class="drawer" id="drawer" role="dialog" aria-label="Key words" hidden><button class="x" id="drx" type="button" aria-label="Close">&times;</button><h2>Key words</h2><dl>'+L.words.map(function(w){return '<dt>'+w[0]+'</dt><dd>'+w[1]+'</dd>'}).join('')+'</dl><h3>Watch out</h3>'+L.watch.map(function(w){return '<div class="rm"><b>'+w[0]+'</b><span>'+w[1]+'</span></div>'}).join('')+'</aside>';
document.body.appendChild(dr);
var opener=null;
function drawer(o){$('#drawer').hidden=!o;$('#scrim').hidden=!o;if(o){opener=document.activeElement;$('#drx').focus()}else if(opener)opener.focus()}
$('#wordsBtn').onclick=function(){drawer(true)};$('#drx').onclick=function(){drawer(false)};$('#scrim').onclick=function(){drawer(false)};


var bd=document.createElement('div');bd.className='board';bd.id='board';bd.hidden=true;bd.setAttribute('role','dialog');bd.setAttribute('aria-label','Board view');
bd.innerHTML='<div><h2>'+esc(L.title)+'</h2><div class="bsub">'+esc(L.sub)+'</div></div><div class="bgrid"><div class="bbox li"><div class="bl">'+svg('target')+'Learning intention</div><div>'+L.li+'</div></div><div class="bbox kqb"><div class="bl">'+svg('ques')+'Key question</div><div>'+esc(L.kq)+'</div></div><div class="bbox tyw"><div class="bl">'+svg('list')+'Today you will</div><ol>'+L.steps.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol></div></div><div class="bfoot"><div class="bsc" id="bsc" hidden><b>Success criteria</b>'+L.must.map(function(s){return '<span>'+s+'</span>'}).join('')+'</div><div class="toolbtns"><button class="tbtn" id="bscb" type="button">Success criteria</button><button class="tbtn" id="bclose" type="button">Close</button></div></div>';
document.body.appendChild(bd);
function board(o){bd.hidden=!o;if(o){opener=document.activeElement;$('#bclose').focus()}else if(opener)opener.focus()}
$('#boardBtn').onclick=function(){board(true)};$('#bclose').onclick=function(){board(false)};
$('#bscb').onclick=function(){var b=$('#bsc');b.hidden=!b.hidden};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!bd.hidden)board(false);else if(!$('#drawer').hidden)drawer(false)}});


var ids=L.parts.map(function(p){return p[0]});
function prog(){var n=ids.filter(function(i){return S.done[i]}).length;
$('#pfill').style.width=(100*n/ids.length)+'%';$('#pdone').textContent=n+' of '+ids.length+' parts finished';
ids.forEach(function(i){$('#t-'+i).classList.toggle('done',!!S.done[i])})}
function show(id,noscroll){S.cur=id;ids.forEach(function(i){var sel=i===id;$('#p-'+i).hidden=!sel;var t=$('#t-'+i);t.setAttribute('aria-selected',sel);t.tabIndex=sel?0:-1});save();prog();if(!noscroll)window.scrollTo({top:0})}
$$('.tab').forEach(function(t){t.onclick=function(){show(t.dataset.part)};t.onkeydown=function(e){var i=ids.indexOf(t.dataset.part);if((e.key==='ArrowRight'||e.key==='ArrowDown')&&i<ids.length-1){show(ids[i+1],true);$('#t-'+ids[i+1]).focus()}if((e.key==='ArrowLeft'||e.key==='ArrowUp')&&i>0){show(ids[i-1],true);$('#t-'+ids[i-1]).focus()}}});
$$('[data-finish]').forEach(function(b){b.onclick=function(){var id=b.dataset.finish;S.done[id]=true;var i=ids.indexOf(id);prog();if(i<ids.length-1)show(ids[i+1]);else{var e=$('#endmsg');if(e)e.hidden=false;save()}}});


$$('.steps').forEach(function(box){var st=$$('.step',box),n=st.length,idx=0;var fin=$('[data-needsteps]');
var nav=document.createElement('div');nav.className='stepnav';nav.innerHTML='<button class="btn" type="button" id="sb">Back</button><span class="dots">'+st.map(function(){return '<i></i>'}).join('')+'</span><button class="btn primary" type="button" id="sn">Next</button>';
box.parentNode.insertBefore(nav,box.nextSibling);
st.forEach(function(s,i){var l=document.createElement('div');l.className='steplab';l.textContent='Part '+(i+1)+' of '+n;s.insertBefore(l,s.firstChild)});
function go(i,sc){idx=i;st.forEach(function(s,j){s.hidden=j!==i});$$('.dots i',nav).forEach(function(d,j){d.classList.toggle('on',j===i)});$('#sb',nav).disabled=i===0;$('#sn',nav).disabled=i===n-1;if(fin)fin.hidden=!(S.done[fin.dataset.finish]||i===n-1);if(sc)box.scrollIntoView({block:'start'})}
$('#sb',nav).onclick=function(){go(idx-1,true)};$('#sn',nav).onclick=function(){go(idx+1,true)};go(0)});


var qn=0;
function setQ(el,v){S.q[el.dataset.qid]=v;save()}
function parseNum(s){s=String(s).toLowerCase().replace(/[−–]/g,'-').replace(/,/g,'').replace(/\s+/g,'');
var sup={'⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9};
s=s.replace(/([x×*]10)(⁻?[⁰¹²³⁴-⁹]+)/,function(m,a,b){var neg=b.charAt(0)==='⁻';var d=b.replace('⁻','').split('').map(function(c){return sup[c]}).join('');return a+'^'+(neg?'-':'')+d});
var m=s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:e([+-]?\d+)|[x×*]10\^?\(?([+-]?\d+)\)?)?/);if(!m)return null;
var v=parseFloat(m[1]),ex=m[2]!==undefined?m[2]:m[3];if(ex!==undefined)v*=Math.pow(10,parseInt(ex,10));return{v:v,rest:s.slice(m[0].length),mant:m[1]}}
function nu(s){return String(s).toLowerCase().replace(/[µμ]/g,'u').replace(/³/g,'3').replace(/\s+/g,'')}
function near(a,b,t){return Math.abs(a-b)<=Math.abs(b)*(t||0.001)+1e-15}
function sfOf(m){m=m.replace(/^[+-]/,'');var d;if(m.indexOf('.')>-1){d=m.replace('.','').replace(/^0+/,'')}else{d=m.replace(/^0+/,'').replace(/0+$/,'')}return d.length||1}
$$('.numq').forEach(function(q){q.dataset.qid='q'+(qn++);var inp=$('input',q),fb=$('.fb',q),rv=$('.reveal',q);
function chk(silent){var raw=inp.value;if(!raw.trim()){fb.hidden=false;fb.className='fb info';fb.innerHTML='Type your answer first.';return}
var p=parseNum(raw),want=parseFloat(q.dataset.num),msg,ok=false;
if(!p){msg='<b>Check the number.</b> Write your answer as a number, for example 2500 or 0.0025.'}
else if(near(p.v,want,parseFloat(q.dataset.tol))){var sf=q.dataset.sf;if(sf&&sfOf(p.mant)!==+sf){fb.hidden=false;fb.className='fb info';fb.innerHTML='<b>Right value, but check the figures.</b> Give your answer to '+sf+' significant figures.';rv.hidden=false;if(!silent)setQ(q,{v:raw,c:1});return}ok=true;var u=q.dataset.unit;if(u&&nu(p.rest).indexOf(nu(u))<0)msg='<b>Right number.</b> Remember to write the unit ('+esc(u)+').';else msg='<b>Correct.</b> Compare your working with the worked answer below.'}
else{msg='<b>Not quite.</b> '+(q.dataset.hint||'Check which unit is bigger, then see the worked answer below.');
if(q.dataset.traps){try{var t=JSON.parse(q.dataset.traps);for(var k in t){if(near(p.v,parseFloat(k),parseFloat(q.dataset.tol))){msg='<b>Not quite.</b> '+t[k];break}}}catch(e){}}}
fb.hidden=false;fb.className='fb '+(ok?'ok':'no');fb.innerHTML=msg;rv.hidden=false;if(!silent)setQ(q,{v:raw,c:1})}
$('.chk',q).onclick=function(){chk(false)};inp.onkeydown=function(e){if(e.key==='Enter')chk(false)};
var s=S.q[q.dataset.qid];if(s){inp.value=s.v||'';if(s.c)chk(true)}});

$$('.coefq').forEach(function(q){q.dataset.qid='q'+(qn++);var ins=$$('input.cf',q),fb=$('.fb',q),rv=$('.reveal',q),want=q.dataset.ans.split(',').map(Number);
function chk(silent){var got=ins.map(function(i){var v=i.value.trim();return v===''?1:parseInt(v,10)});fb.hidden=false;
if(got.some(function(g){return !(g>0)})){fb.className='fb info';fb.innerHTML='Use whole numbers only. Leave a box empty if the number is 1.';return}
var same=got.every(function(g,i){return g===want[i]}),k=got[0]/want[0],mult=got.every(function(g,i){return Math.abs(g-want[i]*k)<1e-9});
if(same){fb.className='fb ok';fb.innerHTML='<b>Balanced.</b> Check your atom count against the worked answer below.'}
else if(mult){fb.className='fb info';fb.innerHTML='<b>Balanced, but not in the lowest whole numbers.</b> Divide every number by the same amount.'}
else{fb.className='fb no';fb.innerHTML='<b>Not balanced yet.</b> Count each type of atom on both sides again.'}
rv.hidden=false;if(!silent)setQ(q,{v:ins.map(function(i){return i.value}),c:1})}
$('.chk',q).onclick=function(){chk(false)};
var s=S.q[q.dataset.qid];if(s){ins.forEach(function(i,j){i.value=(s.v||[])[j]||''});if(s.c)chk(true)}});
function scoreUpdate(){var s=$('#score');if(!s)return;var all=$$('#p-check .mcq'),ok=all.filter(function(m){return m.classList.contains('got')}).length,ans=all.filter(function(m){return m.dataset.done}).length;s.hidden=!ans;s.textContent='You have answered '+ans+' of '+all.length+' and got '+ok+' right.'}
$$('.mcq').forEach(function(q){q.dataset.qid='q'+(qn++);var fb=$('.fb',q),rv=$('.reveal',q),opts=$$('.opt',q);
function pick(i,silent){var o=opts[i],right=o.hasAttribute('data-right');q.dataset.done=1;opts.forEach(function(x){x.disabled=true;if(x.hasAttribute('data-right'))x.classList.add('right')});o.setAttribute('aria-pressed','true');
if(right)q.classList.add('got');else o.classList.add('wrong');
fb.hidden=false;fb.className='fb '+(right?'ok':'no');fb.innerHTML=right?'<b>Correct.</b>':'<b>Not quite.</b> '+(o.dataset.why||'See the worked answer below.');if(rv)rv.hidden=false;if(!silent)setQ(q,{p:i});scoreUpdate()}
opts.forEach(function(o,i){o.onclick=function(){pick(i,false)}});
var s=S.q[q.dataset.qid];if(s&&s.p!==undefined)pick(s.p,true)});
$$('.cardset').forEach(function(cs){cs.dataset.qid='q'+(qn++);var cards=$$('.card',cs),btn=$('.checkall',cs),fb=$('.fb',cs);
function run(silent){var n=0,got=0;cards.forEach(function(c){var v=$('select',c).value,w=c.dataset.right;var why=$('.why',c);if(!v){return}n++;c.classList.remove('ok','no');var ok=v===w;if(ok)got++;c.classList.add(ok?'ok':'no');why.hidden=false;why.innerHTML=(ok?'<b>Right.</b> ':'<b>Look again.</b> ')+why.dataset.t});
fb.hidden=false;fb.className='fb info';fb.textContent=n<cards.length?'You have answered '+n+' of '+cards.length+'. Choose an answer for every card, then check again.':(got===cards.length?'You got all '+cards.length+' right.':'You got '+got+' of '+cards.length+' right. Read the notes on the cards you got wrong.');if(!silent)setQ(cs,{s:cards.map(function(c){return $('select',c).value}),c:1})}
cards.forEach(function(c){var w=$('.why',c);w.dataset.t=w.innerHTML;w.hidden=true});
btn.onclick=function(){run(false)};
var s=S.q[cs.dataset.qid];if(s){cards.forEach(function(c,i){$('select',c).value=s.s[i]||''});if(s.c)run(true)}});
$$('textarea').forEach(function(t){t.dataset.qid='q'+(qn++);var s=S.q[t.dataset.qid];if(s)t.value=s.v||'';t.oninput=function(){setQ(t,{v:t.value})}});


var gc=$('#goalcheck');if(gc){S.goal=S.goal||{};var crit=L.must.concat(L.more),lv=['Not yet','Getting there','I can do this'];
gc.innerHTML=crit.map(function(c,i){return '<div class="grow"><p>'+c+'</p><div class="opts" role="group" aria-label="How sure am I">'+lv.map(function(l,k){return '<button class="opt gopt" type="button" data-c="'+i+'" data-k="'+k+'" aria-pressed="'+(S.goal[i]===k)+'">'+l+'</button>'}).join('')+'</div></div>'}).join('');
$$('.gopt',gc).forEach(function(b){b.onclick=function(){var i=b.dataset.c,k=+b.dataset.k;S.goal[i]=k;save();$$('.gopt[data-c="'+i+'"]',gc).forEach(function(x){x.setAttribute('aria-pressed',String(+x.dataset.k===k))})}})}

var start=S.cur&&ids.indexOf(S.cur)>-1?S.cur:(ids.filter(function(i){return !S.done[i]})[0]||ids[0]);
show(start,true);
if(ids.every(function(i){return S.done[i]})){var e=$('#endmsg');if(e)e.hidden=false}
})();
