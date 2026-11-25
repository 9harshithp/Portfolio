'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const projectDetails=[
{type:'HOUSEHOLD SERVICES · FULL-STACK',image:'societycook',cats:['Full-stack'],tags:['React','Node.js','MySQL','TiDB'],url:'https://societycook.vercel.app',challenge:'Concurrent booking requests and consistent service scheduling.',solution:'Transaction-safe booking and cancellation, row-level locking, recurring sessions, Sentry and UptimeRobot monitoring.',result:'Deployed via Vercel and Render with TiDB Cloud. The project includes backend and browser tests for bookings.'},
{type:'CARE BOOKING · JAVA',image:'dearhand',cats:['Full-stack','Java'],tags:['Java','Spring Boot','React','Razorpay'],challenge:'Reliable booking and payment processing across multiple account roles.',solution:'Spring Security JWT, Flyway migrations, signed payment verification and idempotent webhook processing.',result:'The React frontend runs on Vercel and the Spring Boot API runs on Render.'},
{type:'DEVELOPER TOOLS',image:'buglens',cats:['Full-stack','AI'],tags:['TypeScript','Express','PostgreSQL','Anthropic'],url:'https://buglens-2be.pages.dev/',challenge:'A report can describe a failure and still leave out the steps that triggered it.',solution:'Rule-based scoring, editable classifications, duplicate detection, AI fallback, BDD suggestions and account-specific history.',result:'Testers can compare two reports, export the rewrite and review earlier scores.'},
{type:'HEALTHCARE PROTOTYPE · AI',image:'pharmasure',cats:['Full-stack','AI','Java'],tags:['React','Spring Boot','Gemini','MySQL'],url:'https://pharmasure.vercel.app/',challenge:'Tracking medicine stock, expiry dates and information across multiple roles.',solution:'Predictive expiry alerts, OCR, AI-assisted data extraction and pharmacist inventory features.',result:'The demo shows pharmacists the batch and expiry information for each item.'},
{type:'EDUCATION · WEB PREVIEW',image:'talent',cats:['Full-stack','AI'],tags:['Next.js','TypeScript','Tailwind','Gemini'],url:'https://talent-tuition-center.vercel.app/',challenge:'Give parents an easy way to find class schedules and students a place to check results.',solution:'The preview pairs a public course directory with separate sign-ins for students, teachers and administrators.',result:'The public demo uses sample accounts and browser-only sign-in.'},
{type:'E-COMMERCE · TYPESCRIPT',image:'desiri',cats:['Full-stack'],tags:['React 19','Express 5','Drizzle','PostgreSQL'],url:'https://desiri-naturals-km63.vercel.app/',challenge:'Keep API contracts and frontend data models consistent across a TypeScript monorepo.',solution:'OpenAPI and Orval-generated clients, shared Zod validation, pnpm workspaces and PostgreSQL schema management.',result:'The storefront and API share the same product and order definitions.'},
{
  type:'FLIGHT GAME', image:'paperly', cats:['Games'],
  tags:['PixiJS','Flight controls','Chapter progression'], challenge:'Give players precise steering while keeping the next ring readable against the mountains.',
  solution:'Keyboard steering and a separate boost control let the player adjust speed on approach. The chapter selector shows which routes are available, completed or locked.',
  result:'Players can launch a chapter, choose a plane in the hangar and revisit their flight log.'
},
{
  type:'HILL-CLIMB RACING GAME', image:'ridgeline', cats:['Games'],
  tags:['PixiJS','Vehicle controls','2D terrain'], challenge:'Keep fuel, distance and upcoming terrain readable while the player controls the vehicle.',
  solution:'Gas and brake have keyboard and on-screen controls. The race HUD tracks fuel, coins and distance while the terrain scrolls past.',
  result:'Players can retry a track against their personal best and visit the garage between runs.'
}
];

const directory = document.querySelectorAll('.project-directory [data-project]');
const detailsByImage = new Map(projectDetails.map(project => [project.image, project]));
const projects = Array.from(directory, item => {
  const link = item.querySelector('a');
  return {
    ...detailsByImage.get(item.dataset.project),
    name: link.textContent,
    desc: item.querySelector('p').textContent,
    repo: new URL(link.href).pathname.split('/').pop()
  };
});
let active=0,filter='All';
function filtered(){return projects.filter(p=>filter==='All'||p.cats.includes(filter))}
function tags(list){return '<div class="tags">'+list.map(t=>'<span>'+t+'</span>').join('')+'</div>'}
function visual(p){return p.image?'<img loading="lazy" src="assets/'+p.image+'.webp" alt="'+p.name+' homepage">':'<div class="bug-art"><small>DEFECT QUALITY / ILLUSTRATIVE SCORE</small><strong>92/100</strong><div><span style="width:95%"></span></div><div><span style="width:85%"></span></div><div><span style="width:90%"></span></div><small>Title · Reproduction · Context</small></div>'}
function render(){const list=filtered(),p=list[active];$('#count').textContent=String(active+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');$('#project-stage').innerHTML='<article class="stage"><div class="stage-visual">'+visual(p)+'</div><div class="stage-text"><small>'+p.type+'</small><h3>'+p.name+'</h3><p>'+p.desc+'</p>'+tags(p.tags)+'<div class="stage-links">'+(p.url?'<a href="'+p.url+'" target="_blank" rel="noopener">Visit site</a>':'')+'<a href="https://github.com/9harshithp/'+p.repo+'" target="_blank" rel="noopener">Source code</a><button id="details">Case study</button></div></div></article>';$('#project-grid').innerHTML=list.map((item,i)=>'<button class="'+(i===active?'current':'')+'" data-index="'+i+'" aria-pressed="'+(i===active)+'"><img loading="lazy" alt="" src="assets/'+item.image+'.webp"><small>'+item.type+'</small><strong>'+item.name+'</strong></button>').join('');$('#details').onclick=()=>{$('#case-content').innerHTML='<small>ENGINEERING CASE STUDY</small><h3>'+p.name+'</h3><h4>Challenge</h4><p>'+p.challenge+'</p><h4>Implementation</h4><p>'+p.solution+'</p><h4>Outcome</h4><p>'+p.result+'</p>'+tags(p.tags);$('#case').showModal()};$$('#project-grid button').forEach(b=>b.onclick=()=>{active=+b.dataset.index;render()})}
$('#prev').onclick=()=>{active=(active+filtered().length-1)%filtered().length;render()};$('#next').onclick=()=>{active=(active+1)%filtered().length;render()};$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');filter=b.dataset.filter;active=0;render()});render();
const accents=[['#b8c5ff','#6c78ff'],['#7ae6d6','#378eaa'],['#f3c878','#cf9259'],['#d7b2ff','#a98af0']];let accent=0;try{accent=Number(localStorage.getItem('accent')||0)%accents.length;document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'}catch{}
function color(){document.documentElement.style.setProperty('--accent',accents[accent][0]);document.documentElement.style.setProperty('--accent2',accents[accent][1])}color();
$('#palette').onclick=()=>{accent=(accent+1)%accents.length;color();try{localStorage.setItem('accent',accent)}catch{}};$('#theme').onclick=()=>{const root=document.documentElement;root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('theme',root.dataset.theme)}catch{}};
$('#menu').onclick=()=>{const open=$('#navlinks').classList.toggle('open');$('#menu').setAttribute('aria-expanded',open)};$$('#navlinks a').forEach(a=>a.onclick=()=>{$('#navlinks').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')});
$$('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText('harshithp914@gmail.com');$('#email-status').textContent='Email copied to clipboard.'}catch{$('#email-status').textContent='harshithp914@gmail.com'}};
const motion=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!motion&&'IntersectionObserver'in window){const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:0});$$('.section > *').forEach(el=>{el.classList.add('reveal');obs.observe(el)});const phrases=["Hello, I'm","Namaskara, I’m","Hi there, I’m"];let pi=0,ch=0,del=false;function type(){const phrase=phrases[pi];$('#typed').textContent=phrase.slice(0,ch);if(!del&&ch===phrase.length){del=true;setTimeout(type,1700);return}if(del&&ch===0){del=false;pi=(pi+1)%phrases.length}ch+=del?-1:1;setTimeout(type,del?45:85)}type()}
function scroll(){const h=document.documentElement;$('#progress').style.width=(h.scrollTop/Math.max(1,h.scrollHeight-innerHeight)*100)+'%';let id='home';$$('main section[id]').forEach(s=>{if(s.getBoundingClientRect().top<160)id=s.id});$$('#navlinks a').forEach(a=>a.classList.toggle('active',a.hash==='#'+id))}addEventListener('scroll',scroll,{passive:true});scroll();
