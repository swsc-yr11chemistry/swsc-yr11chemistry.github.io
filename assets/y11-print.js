/* Printable versions of the Year 11 lesson pages.
   Y11Print.student(win) builds a worksheet with blank answer spaces.
   Y11Print.answers(win) builds the teacher answer file for the same lesson. */
(function(){
"use strict";
const P=window.Y11Print={};

const txt=el=>(el?el.textContent:"").replace(/\s+/g," ").trim();
const cut=(s,n)=>s.length>n?s.slice(0,n).replace(/\s+\S*$/,"")+"…":s;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const LET="ABCDEFGH";
const LEVELS=["Not yet","Getting there","I can do this"];

function lines(n){let h="";for(let i=0;i<n;i++)h+=`<div class="pr-line"></div>`;return `<div class="pr-lines">${h}</div>`;}
const box=label=>`<li><span class="pr-box"></span><span>${label}</span></li>`;
const ticks=(opts,cls)=>`<ul class="pr-ticks${cls?" "+cls:""}">${opts.map(box).join("")}</ul>`;
const frag=(doc,html)=>{const t=doc.createElement("template");t.innerHTML=html;return t.content;};

/* On-screen instructions that make no sense on paper. */
const PAPER=[
  [/Type your answer and press Check to see the worked answer\./g,"Write your answer."],
  [/Type your answer and press Check\./g,"Write your answer."],
  [/Type the missing number, then press Check\./g,"Write the missing number."],
  [/Choose an answer for every card, then press Check my answers\./g,"Tick an answer for every card."],
  [/,? then press Check my answers\./g,"."],
  [/\s*Then press Check my answers\./g,""],
  [/,? then press Check\./g,"."],
  [/\s*You will see the worked answer straight away\./g,""]
];
function paperText(root){
  const w=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];
  while(w.nextNode())ns.push(w.currentNode);
  ns.forEach(n=>{let s=n.nodeValue;PAPER.forEach(([a,b])=>{s=s.replace(a,b);});if(s!==n.nodeValue)n.nodeValue=s;});
}

function qrSVG(url){
  try{
    if(typeof window.qrcode!=="function")return "";
    const q=window.qrcode(0,"M");q.addData(url);q.make();
    return q.createSvgTag({cellSize:2,margin:0,scalable:true});
  }catch(e){return "";}
}
function cleanURL(win){try{const u=new URL(win.location.href);u.search="";u.hash="";return u.href;}catch(e){return "";}}

function header(L,url,mode){
  const qr=mode==="student"&&url?qrSVG(url):"";
  let h=`<header class="pr-head"><div class="pr-htxt">`;
  if(L.eyebrow)h+=`<div class="pr-eyebrow">${esc(L.eyebrow)}${mode==="answers"?" · Teacher answers":""}</div>`;
  h+=`<h1>${esc(L.title||"")}</h1>`;
  if(L.sub)h+=`<p class="pr-sub">${esc(L.sub)}</p>`;
  if(L.kq)h+=`<p class="pr-kq"><b>Key question</b> ${esc(L.kq)}</p>`;
  h+=`</div>`;
  if(qr)h+=`<div class="pr-qr">${qr}<span>Scan for the online version</span></div>`;
  h+=`</header>`;
  if(mode==="student")h+=`<div class="pr-name"><span>Name</span><i></i><span>Date</span><i class="short"></i></div>`;
  return h;
}

function intro(L){
  const li=L.li?`<p>${L.li}</p>`:"";
  const must=(L.must||[]).length?`<h3>Success criteria</h3><ul>${L.must.map(s=>`<li>${s}</li>`).join("")}</ul>`:"";
  const more=(L.more||[]).length?`<h3>Should and Could</h3><ul>${L.more.map(s=>`<li>${s}</li>`).join("")}</ul>`:"";
  const steps=(L.steps||[]).length?`<section class="pr-icard"><h2>Today you will</h2><ol>${L.steps.map(s=>`<li>${s}</li>`).join("")}</ol></section>`:"";
  return `<div class="pr-intro"><section class="pr-icard"><h2>Learning intention</h2>${li}${must}${more}</section>${steps}</div>`;
}

function keyWords(L){
  const w=L.words||[],x=L.watch||[];
  if(!w.length&&!x.length)return "";
  return `<section class="pr-part pr-kw"><h2>Key words</h2>${w.length?`<dl>${w.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>`:""}${x.length?`<h3>Watch out</h3>${x.map(([a,b])=>`<div class="pr-watch"><b>${a}</b> ${b}</div>`).join("")}`:""}</section>`;
}

function goalTable(L){
  const crit=(L.must||[]).concat(L.more||[]);
  if(!crit.length)return "";
  return `<table class="pr-goal"><thead><tr><th>Success criterion</th>${LEVELS.map(l=>`<th>${l}</th>`).join("")}</tr></thead><tbody>${crit.map(c=>`<tr><td>${c}</td>${LEVELS.map(()=>`<td><span class="pr-box"></span></td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

/* The answer behind a "Worked answer" or "Show the answer" drop-down. */
function revealHTML(d){
  if(!d)return "";
  const k=d.cloneNode(true);const s=k.querySelector(":scope>summary");if(s)s.remove();
  k.querySelectorAll("button").forEach(b=>b.remove());
  return k.innerHTML.trim();
}
function questionText(q){
  const p=q.querySelector(":scope>p");
  return p?cut(txt(p).replace(/^\d+\.\s*/,""),170):"";
}

/* Turn one lesson part into a print block. Answers found on the way go into ans. */
function part(doc,L,id,label,i,ans,qno){
  const src=doc.getElementById("p-"+id);if(!src)return "";
  const p=src.cloneNode(true);
  p.removeAttribute("hidden");p.removeAttribute("id");
  p.querySelectorAll("[hidden]").forEach(e=>e.removeAttribute("hidden"));
  p.querySelectorAll("[id]").forEach(e=>{e.dataset.pid=e.id;e.removeAttribute("id");});
  const items=[];

  /* Number each question in page order, so the teacher file can point to it. */
  const qs=[...p.querySelectorAll(".q,.cardset")];
  qs.forEach(q=>{
    const n=++qno.n;
    const tag=`<span class="pr-qno">${n}</span>`;

    if(q.classList.contains("cardset")){
      const cards=[...q.querySelectorAll(".card")];
      const rows=cards.map((c,k)=>{
        const sel=c.querySelector("select"),why=c.querySelector(".why");
        const right=sel?[...sel.options].find(o=>o.value===c.dataset.right):null;
        const whyT=why?(why.dataset.t||why.innerHTML):"";
        const name=c.querySelector(":scope>p");
        return `<tr><td>${k+1}</td><td>${name?name.innerHTML:""}</td><td><b>${right?right.textContent:""}</b></td><td>${whyT}</td></tr>`;
      }).join("");
      items.push({n,context:"Card sort",html:`<table class="pr-atable"><thead><tr><th></th><th>Card</th><th>Answer</th><th>Why</th></tr></thead><tbody>${rows}</tbody></table>`});
      cards.forEach((c,k)=>{
        const sel=c.querySelector("select");
        const opts=sel?[...sel.options].filter(o=>o.value).map(o=>o.textContent):[];
        c.querySelectorAll("select,.why").forEach(e=>e.remove());
        c.className="pr-card";
        c.insertAdjacentHTML("afterbegin",`<div class="pr-cno">${k+1}</div>`);
        c.insertAdjacentHTML("beforeend",`<p class="pr-hint">Tick one.</p>${ticks(opts)}`);
      });
      const wrap=q.querySelector(".cards");if(wrap)wrap.className="pr-cards";
      q.querySelectorAll(".checkall,.fb,button").forEach(e=>e.remove());
      q.className="pr-q pr-cardq";q.insertAdjacentHTML("afterbegin",`<div class="pr-cardhead">${tag}<span class="pr-hint">Card sort</span></div>`);
      return;
    }

    const rv=q.querySelector(":scope>details.reveal");
    const isMC=q.classList.contains("mcq"),isNum=q.classList.contains("numq"),isCoef=q.classList.contains("coefq");
    let ansHTML=revealHTML(rv);
    if(isMC){
      const opts=[...q.querySelectorAll(".opt")];const r=opts.findIndex(o=>o.hasAttribute("data-right"));
      if(r>-1)ansHTML=`<p><b>${LET[r]}. ${opts[r].innerHTML}</b></p>`+ansHTML;
      const box=q.querySelector(".opts");
      if(box)box.outerHTML=`<ol class="pr-opts">${opts.map((o,j)=>`<li><span class="pr-let">${LET[j]}</span><span>${o.innerHTML}</span></li>`).join("")}</ol>`;
    }
    if(ansHTML)items.push({n,context:questionText(q),html:ansHTML});

    if(isCoef){
      q.querySelectorAll("input.cf").forEach(inp=>{const s=doc.createElement("span");s.className="pr-cf";inp.replaceWith(s);});
      const note=q.querySelector(".inrow .note");
      if(note)q.querySelector(".inrow").insertAdjacentHTML("beforebegin",`<p class="pr-hint">${note.innerHTML}</p>`);
    }
    const hadSpace=!!q.querySelector("textarea");
    q.querySelectorAll("textarea").forEach(t=>t.replaceWith(frag(doc,lines(4))));
    q.querySelectorAll(".inrow,.fb,details.reveal,input,button,select").forEach(e=>e.remove());
    if(isNum)q.insertAdjacentHTML("beforeend",lines(4));
    else if(!isMC&&!isCoef&&!hadSpace&&rv)q.insertAdjacentHTML("beforeend",lines(3));
    q.className="pr-q";
    const first=q.firstElementChild;
    if(first&&first.tagName==="P"){first.innerHTML=first.innerHTML.replace(/^\s*(<b>\s*\d+\.\s*<\/b>|\d+\.)\s*/,"");first.insertAdjacentHTML("afterbegin",tag);}else q.insertAdjacentHTML("afterbegin",`<p>${tag}</p>`);
  });

  /* The self-check in the last part is rebuilt from the lesson's success criteria. */
  const gc=p.querySelector('[data-pid="goalcheck"]');
  if(gc)gc.outerHTML=goalTable(L);

  /* Extend and Challenge prints open. */
  p.querySelectorAll("details.extend").forEach(d=>{
    const s=d.querySelector(":scope>summary");if(s)s.remove();
    const b=doc.createElement("div");b.className="pr-extend";
    b.insertAdjacentHTML("afterbegin",`<p class="pr-xhead">Finished the Core work? Try these.</p>`);
    while(d.firstChild)b.appendChild(d.firstChild);d.replaceWith(b);
  });
  p.querySelectorAll("details").forEach(d=>{const s=d.querySelector(":scope>summary");const b=doc.createElement("div");
    if(s){b.insertAdjacentHTML("afterbegin",`<h4>${s.innerHTML}</h4>`);s.remove();}
    while(d.firstChild)b.appendChild(d.firstChild);d.replaceWith(b);});

  p.querySelectorAll("textarea").forEach(t=>t.replaceWith(frag(doc,lines(4))));
  p.querySelectorAll("button,select,input,.stepnav,.dots,.finish,.fb,[data-pid=endmsg],[data-pid=score]").forEach(e=>e.remove());
  p.querySelectorAll(".steplab").forEach(e=>e.remove());
  p.querySelectorAll(".step").forEach(e=>e.classList.add("pr-step"));
  paperText(p);

  ans.push({label,i,items});

  const phead=p.querySelector(".phead h2");
  const title=phead?phead.innerHTML:label;
  if(p.querySelector(".phead"))p.querySelector(".phead").remove();
  return `<section class="pr-part"><div class="pr-phead"><span class="pr-pno">Part ${i+1} · ${esc(label)}</span><h2>${title}</h2></div><div class="pr-pbody">${p.innerHTML}</div></section>`;
}

function build(win,mode){
  const doc=win.document,L=win.LESSON;
  if(!L||!L.parts)return "";
  const url=cleanURL(win);const ans=[];const qno={n:0};
  const parts=L.parts.map(([id,label],i)=>part(doc,L,id,label,i,ans,qno)).join("");
  if(mode==="answers"){
    const body=ans.filter(a=>a.items.length).map(a=>`<section class="pr-part pr-ans"><div class="pr-phead"><span class="pr-pno">Part ${a.i+1}</span><h2>${esc(a.label)}</h2></div>${a.items.map(it=>`<div class="pr-aitem"><div class="pr-anum">${it.n}</div><div>${it.context?`<p class="pr-actx">${it.context}</p>`:""}<div class="pr-abody">${it.html}</div></div></div>`).join("")}</section>`).join("");
    return `<article class="pr-doc pr-teacher">${header(L,url,"answers")}${body||`<p>This lesson has no answers to show.</p>`}</article>`;
  }
  return `<article class="pr-doc">${header(L,url,"student")}${intro(L)}${parts}${keyWords(L)}${url?`<footer class="pr-foot">Online version: ${url}</footer>`:""}</article>`;
}

P.student=win=>build(win,"student");
P.answers=win=>build(win,"answers");

/* Load a lesson page in a hidden frame so its script runs, then hand back its window. */
P.load=function(url,host){
  return new Promise((res,rej)=>{
    const f=document.createElement("iframe");
    f.setAttribute("aria-hidden","true");f.tabIndex=-1;
    f.style.cssText="position:absolute;width:1100px;height:800px;left:-10000px;top:0;border:0;visibility:hidden";
    let done=false;
    const t=setTimeout(()=>{if(!done){done=true;f.remove();rej(new Error("Timed out loading "+url));}},20000);
    f.onload=()=>{if(done)return;
      const w=f.contentWindow;
      const wait=n=>{const tabs=w.document.getElementById("tabs");
        if((w.LESSON&&tabs&&tabs.children.length)||n>100){done=true;clearTimeout(t);res({win:w,frame:f});}
        else setTimeout(()=>wait(n+1),50);};
      wait(0);};
    f.src=url;(host||document.body).appendChild(f);
  });
};

/* Print button on a lesson page. */
const PRINT_ICON='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg>';
function initLesson(){
  if(!window.LESSON||!document.getElementById("tabs"))return;
  try{if(window.frameElement)return;}catch(e){return;}
  const root=document.documentElement;let holder=null,theme=null;
  const prepare=()=>{
    if(holder)return;
    theme=root.getAttribute("data-theme");root.setAttribute("data-theme","light");
    holder=document.createElement("div");holder.className="y11print";holder.innerHTML=P.student(window);
    document.body.appendChild(holder);document.body.classList.add("pr-on");
  };
  const clear=()=>{if(!holder)return;holder.remove();holder=null;document.body.classList.remove("pr-on");
    if(theme)root.setAttribute("data-theme",theme);else root.removeAttribute("data-theme");};
  window.addEventListener("beforeprint",prepare);
  window.addEventListener("afterprint",()=>setTimeout(clear,300));
  const slot=document.querySelector(".toolbtns");
  if(slot&&!document.getElementById("printBtn")){
    const b=document.createElement("button");b.className="tbtn";b.id="printBtn";b.type="button";
    b.innerHTML=PRINT_ICON+"Print or save as PDF";b.title="Print this lesson as a worksheet, or save it as a PDF";
    slot.appendChild(b);
    b.addEventListener("click",()=>{clear();prepare();setTimeout(()=>window.print(),60);});
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initLesson);else initLesson();
})();
