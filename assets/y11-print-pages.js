/* "Print lessons" and "Teacher answers" pages: list every lesson page on the course outline, then print the ticked ones together. */
(function(){
"use strict";
const mode=document.body.dataset.mode==="answers"?"answers":"student";
const $=id=>document.getElementById(id);
const listEl=$("lessonList"),stack=$("stack"),status=$("status"),go=$("printGo");
const base=new URL("./",location.href);
const HOST="swsc-yr11chemistry.github.io";

const titleOf=html=>{const m=html.match(/<title>([^<]*)<\/title>/i);return m?m[1].trim():"";};
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
async function getText(u){const r=await fetch(u,{cache:"no-cache"});if(!r.ok)throw new Error(r.status+" "+u);return r.text();}

/* Links on the outline point at the live site. Read them from wherever this page is served. */
function local(u){
  let x;try{x=new URL(u,base);}catch(e){return null;}
  if(x.host===HOST&&location.host!==HOST)x=new URL(x.pathname+x.search,base);
  if(x.origin!==location.origin)return null;
  x.hash="";return x.href;
}

async function findLessons(){
  const html=await getText(base.href);
  const m=html.match(/const TERMS=(\[[\s\S]*?\]);\n/);
  if(!m)throw new Error("Could not read the course outline.");
  const TERMS=JSON.parse(m[1]);
  const seen=new Set(),groups=[];
  for(const t of TERMS){
    for(const w of t.weeks){
      const label=`${t.name==="Orientation"?"Step-Up":t.name} · Week ${w.n}`;
      for(const it of (w.items||[])){
        const abs=it.u?local(it.u):null;
        if(!abs||seen.has(abs))continue;seen.add(abs);
        let page;try{page=await getText(abs);}catch(e){continue;}
        if(!/window\.LESSON\s*=/.test(page))continue;
        let g=groups.find(x=>x.label===label);if(!g){g={label,items:[]};groups.push(g);}
        g.items.push({url:abs,title:titleOf(page)||it.t});
      }
    }
  }
  return groups;
}

function render(groups){
  if(!groups.length){listEl.innerHTML=`<p class="muted">No lesson pages are on the course outline yet.</p>`;return;}
  listEl.innerHTML=groups.map(g=>`<fieldset class="grp"><legend>${esc(g.label)}</legend>${g.items.map(it=>`<label class="row"><input type="checkbox" checked value="${esc(it.url)}"><span>${esc(it.title)}</span></label>`).join("")}</fieldset>`).join("");
  go.disabled=false;count();
  listEl.addEventListener("change",count);
}
function picked(){return [...listEl.querySelectorAll("input:checked")].map(i=>i.value);}
function count(){const n=picked().length;go.lastChild.textContent=n?` Print ${n} lesson${n>1?"s":""}`:" Tick a lesson to print";go.disabled=!n;}
$("allBtn").onclick=()=>{listEl.querySelectorAll("input").forEach(i=>i.checked=true);count();};
$("noneBtn").onclick=()=>{listEl.querySelectorAll("input").forEach(i=>i.checked=false);count();};

let built="";
go.onclick=async()=>{
  const urls=picked();if(!urls.length)return;
  const key=urls.join("|");
  if(built!==key){
    go.disabled=true;stack.innerHTML="";
    const host=$("frames");
    for(let i=0;i<urls.length;i++){
      status.textContent=`Getting lesson ${i+1} of ${urls.length} ready…`;
      try{
        const {win,frame}=await Y11Print.load(urls[i],host);
        stack.insertAdjacentHTML("beforeend",mode==="answers"?Y11Print.answers(win):Y11Print.student(win));
        frame.remove();
      }catch(e){stack.insertAdjacentHTML("beforeend",`<article class="pr-doc"><p>This lesson could not be loaded: ${esc(urls[i])}</p></article>`);}
    }
    built=key;go.disabled=false;
  }
  status.textContent="Ready. The print window should open now.";
  setTimeout(()=>{window.print();status.textContent="";},150);
};

findLessons().then(render).catch(()=>{listEl.innerHTML=`<p class="muted">The lesson list could not be loaded. Check your connection and refresh the page.</p>`;});
})();
