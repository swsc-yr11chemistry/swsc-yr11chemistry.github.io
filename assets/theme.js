(function(){
var KEY='y11-theme',root=document.documentElement;
function saved(){try{var t=localStorage.getItem(KEY);return t==='dark'||t==='light'?t:null}catch(e){return null}}
function system(){try{return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){return 'light'}}
function current(){return root.getAttribute('data-theme')||system()}
var s=saved();if(s)root.setAttribute('data-theme',s);

var MOON='<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>';
var SUN='<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>';
var btns=[];
function paint(){var d=current()==='dark';btns.forEach(function(b){
 b.innerHTML='<svg class="thico" viewBox="0 0 24 24" aria-hidden="true">'+(d?SUN:MOON)+'</svg><span>'+(d?'Light mode':'Dark mode')+'</span>';
 b.setAttribute('aria-pressed',d?'true':'false');b.title=d?'Switch to light mode':'Switch to dark mode'})}
function toggle(){var t=current()==='dark'?'light':'dark';root.setAttribute('data-theme',t);try{localStorage.setItem(KEY,t)}catch(e){}paint()}

var css='.thico{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
'.themebtn{appearance:none;display:inline-flex;align-items:center;gap:6px;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:4px;padding:6px 12px 6px 10px;font:700 14px var(--body,system-ui,sans-serif);cursor:pointer}'+
'.themebtn:hover{border-color:var(--accent,var(--acc))}'+
'header>.themebtn{position:absolute;top:14px;right:14px;z-index:2}'+
'@media (max-width:640px){header>.themebtn{position:relative;top:auto;right:auto;margin-bottom:10px}}'+
'@media print{.themebtn,[data-theme-btn]{display:none!important}}';

function mount(){
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var b=document.createElement('button');b.type='button';b.setAttribute('data-theme-btn','');
 var slot=document.querySelector('.toolbtns')||document.querySelector('.toprow .r');
 if(slot){b.className=slot.classList.contains('toolbtns')?'tbtn':'btn';slot.insertBefore(b,slot.firstChild)}
 else{var h=document.querySelector('header');if(!h)return;b.className='themebtn';h.insertBefore(b,h.firstChild)}
 btns.push(b);b.addEventListener('click',toggle);paint();
 try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(!saved())paint()})}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();

var before=null;
window.addEventListener('beforeprint',function(){before=root.getAttribute('data-theme');root.setAttribute('data-theme','light')});
window.addEventListener('afterprint',function(){if(before)root.setAttribute('data-theme',before);else root.removeAttribute('data-theme');before=null});
})();
