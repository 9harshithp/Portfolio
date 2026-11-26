'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const projectDetails=[
{type:'HOUSEHOLD SERVICES · FULL-STACK',image:'societycook',w:1450,h:869,h600:360,cats:['Full-stack'],tags:['React','Node.js','MySQL','TiDB'],url:'https://societycook.vercel.app',challenge:'Concurrent booking requests and consistent service scheduling.',solution:'Transaction-safe booking and cancellation, row-level locking, recurring sessions, Sentry and UptimeRobot monitoring.',result:'Deployed via Vercel and Render with TiDB Cloud. The project includes backend and browser tests for bookings.'},
{type:'CARE BOOKING · JAVA',image:'dearhand',w:1450,h:825,h600:341,cats:['Full-stack','Java'],tags:['Java','Spring Boot','React','Razorpay'],challenge:'Reliable booking and payment processing across multiple account roles.',solution:'Spring Security JWT, Flyway migrations, signed payment verification and idempotent webhook processing.',result:'The React frontend runs on Vercel and the Spring Boot API runs on Render.'},
{type:'DEVELOPER TOOLS',image:'buglens',w:1450,h:848,h600:351,cats:['Full-stack','AI'],tags:['TypeScript','Express','PostgreSQL','Anthropic'],url:'https://buglens-2be.pages.dev/',challenge:'A report can describe a failure and still leave out the steps that triggered it.',solution:'Rule-based scoring, editable classifications, duplicate detection, AI fallback, BDD suggestions and account-specific history.',result:'Testers can compare two reports, export the rewrite and review earlier scores.'},
{type:'HEALTHCARE PROTOTYPE · AI',image:'pharmasure',w:1450,h:569,h600:235,cats:['Full-stack','AI','Java'],tags:['React','Spring Boot','Gemini','MySQL'],url:'https://pharmasure.vercel.app/',challenge:'Tracking medicine stock, expiry dates and information across multiple roles.',solution:'Predictive expiry alerts, OCR, AI-assisted data extraction and pharmacist inventory features.',result:'The demo shows pharmacists the batch and expiry information for each item.'},
{type:'EDUCATION · WEB PREVIEW',image:'talent',w:1450,h:668,h600:276,cats:['Full-stack','AI'],tags:['Next.js','TypeScript','Tailwind','Gemini'],url:'https://talent-tuition-center.vercel.app/',challenge:'Give parents an easy way to find class schedules and students a place to check results.',solution:'The preview pairs a public course directory with separate sign-ins for students, teachers and administrators.',result:'The public demo uses sample accounts and browser-only sign-in.'},
{type:'E-COMMERCE · TYPESCRIPT',image:'desiri',w:1450,h:848,h600:351,cats:['Full-stack'],tags:['React 19','Express 5','Drizzle','PostgreSQL'],url:'https://desiri-naturals-km63.vercel.app/',challenge:'Keep API contracts and frontend data models consistent across a TypeScript monorepo.',solution:'OpenAPI and Orval-generated clients, shared Zod validation, pnpm workspaces and PostgreSQL schema management.',result:'The storefront and API share the same product and order definitions.'},
{
  type:'FLIGHT GAME', image:'paperly', w:1856, h:1085, h600:351, cats:['Games'],
  tags:['PixiJS','Flight controls','Chapter progression'], challenge:'Give players precise steering while keeping the next ring readable against the mountains.',
  solution:'Keyboard steering and a separate boost control let the player adjust speed on approach. The chapter selector shows which routes are available, completed or locked.',
  result:'Players can launch a chapter, choose a plane in the hangar and revisit their flight log.'
},
{
  type:'HILL-CLIMB RACING GAME', image:'ridgeline', w:1856, h:1085, h600:351, cats:['Games'],
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
function visual(p){
  return '<img loading="lazy" src="assets/'+p.image+'.webp" srcset="assets/'+p.image+'-600.webp 600w, assets/'+p.image+'.webp '+p.w+'w" sizes="(max-width: 900px) 90vw, 650px" width="'+p.w+'" height="'+p.h+'" alt="'+p.name+' web application screenshot">';
}
function render(){
  const list=filtered(),p=list[active];
  $('#count').textContent=String(active+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');
  $('#project-stage').innerHTML='<article class="stage" data-project-name="'+p.name+'"><div class="stage-visual">'+visual(p)+'</div><div class="stage-text"><small>'+p.type+'</small><h3>'+p.name+'</h3><p>'+p.desc+'</p>'+tags(p.tags)+'<div class="stage-links">'+(p.url?'<a href="'+p.url+'" target="_blank" rel="noopener noreferrer" data-track="demo">Visit site</a>':'')+'<a href="https://github.com/9harshithp/'+p.repo+'" target="_blank" rel="noopener noreferrer" data-track="source">Source code</a><button type="button" id="details" data-track="case">Case study</button></div></div></article>';
  $('#project-grid').innerHTML=list.map((item,i)=>'<button type="button" class="'+(i===active?'current':'')+'" data-index="'+i+'" aria-pressed="'+(i===active)+'"><img loading="lazy" alt="" src="assets/'+item.image+'-600.webp" width="600" height="'+item.h600+'"><small>'+item.type+'</small><strong>'+item.name+'</strong></button>').join('');
  $('#details').onclick=()=>{$('#case-content').innerHTML='<small>ENGINEERING CASE STUDY</small><h2 id="case-title">'+p.name+'</h2><h4>Challenge</h4><p>'+p.challenge+'</p><h4>Implementation</h4><p>'+p.solution+'</p><h4>Outcome</h4><p>'+p.result+'</p>'+tags(p.tags);$('#case').showModal()};
  $$('#project-grid button').forEach(b=>b.onclick=()=>{active=+b.dataset.index;render();trackProjectView(filtered()[active]?.name,'grid')});
}
$('#prev').onclick=()=>{active=(active+filtered().length-1)%filtered().length;render();trackProjectView(filtered()[active]?.name,'carousel')};
$('#next').onclick=()=>{active=(active+1)%filtered().length;render();trackProjectView(filtered()[active]?.name,'carousel')};
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');filter=b.dataset.filter;active=0;render();trackProjectView(filtered()[active]?.name,'filter')});

// Analytics & consent helpers (GA4 G-NJ0QBENB9W)
let lastProjectTracked = '';
function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
function trackProjectView(projectName, source) {
  if (!projectName) return;
  const key = projectName + '|' + source;
  if (lastProjectTracked === key) return;
  lastProjectTracked = key;
  trackEvent('project_view', { project_name: projectName, source });
}

render();
trackProjectView(filtered()[active]?.name, 'initial');

function setAnalyticsConsent(granted) {
  const value = granted ? 'granted' : 'denied';
  try { localStorage.setItem('ga_consent', value); } catch {}
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
  const banner = $('#consent-banner');
  if (banner) banner.hidden = true;
  const status = $('#consent-status');
  if (status) status.textContent = granted ? 'Current preference: Analytics enabled.' : 'Current preference: Analytics disabled.';
}

(function initConsent() {
  let saved = null;
  try { saved = localStorage.getItem('ga_consent'); } catch {}
  const banner = $('#consent-banner');
  if (banner && !saved) banner.hidden = false;
  const status = $('#consent-status');
  if (status) status.textContent = saved === 'granted' ? 'Current preference: Analytics enabled.' : saved === 'denied' ? 'Current preference: Analytics disabled.' : 'Current preference: Not yet selected (analytics paused by default).';
  $('#consent-accept')?.addEventListener('click', () => setAnalyticsConsent(true));
  $('#consent-decline')?.addEventListener('click', () => setAnalyticsConsent(false));
  $('#privacy-accept')?.addEventListener('click', () => { setAnalyticsConsent(true); $('#privacy-dialog')?.close(); });
  $('#privacy-decline')?.addEventListener('click', () => { setAnalyticsConsent(false); $('#privacy-dialog')?.close(); });
  const openPrivacy = () => $('#privacy-dialog')?.showModal();
  $('#privacy-open')?.addEventListener('click', openPrivacy);
  $('#consent-privacy')?.addEventListener('click', openPrivacy);
})();

// Delegated event tracking (single listener prevents duplicate events)
document.addEventListener('click', event => {
  const target = event.target.closest('a, button');
  if (!target) return;
  const href = target.getAttribute('href') || '';
  if (href.includes('drive.google.com')) {
    trackEvent('resume_click', { link_location: 'hero' });
    return;
  }
  if (href === 'https://github.com/9harshithp') {
    trackEvent('github_click', { link_location: 'socials' });
    return;
  }
  if (href.includes('linkedin.com/in/harshithp914')) {
    const loc = target.closest('#contact') ? 'contact' : 'socials';
    trackEvent('linkedin_click', { link_location: loc });
    return;
  }
  if (href.startsWith('mailto:')) {
    trackEvent('contact_click', { method: 'mailto_link' });
    return;
  }
  if (target.id === 'copy') {
    trackEvent('email_copy', { method: 'copy_button' });
    return;
  }
  const stageEl = target.closest('#project-stage .stage');
  if (stageEl) {
    const projectName = stageEl.dataset.projectName;
    if (target.dataset.track === 'source') trackEvent('project_source_click', { project_name: projectName, source: 'stage' });
    else if (target.dataset.track === 'demo') trackEvent('project_demo_click', { project_name: projectName });
    else if (target.dataset.track === 'case') trackEvent('case_study_open', { project_name: projectName });
    return;
  }
  const dirItem = target.closest('.project-directory [data-project]');
  if (dirItem && target.tagName === 'A') {
    trackEvent('project_source_click', { project_name: target.textContent.trim(), source: 'directory' });
  }
});
$('#note')?.addEventListener('submit', () => {
  trackEvent('contact_click', { method: 'email_draft_form' });
});
const accents=[['#b8c5ff','#6c78ff'],['#7ae6d6','#378eaa'],['#f3c878','#cf9259'],['#d7b2ff','#a98af0']];let accent=0;try{accent=Number(localStorage.getItem('accent')||0)%accents.length;document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'}catch{}
function color(){document.documentElement.style.setProperty('--accent',accents[accent][0]);document.documentElement.style.setProperty('--accent2',accents[accent][1]);window.dispatchEvent(new Event('themechange'))}color();
$('#palette').onclick=()=>{accent=(accent+1)%accents.length;color();try{localStorage.setItem('accent',accent)}catch{}};
$('#theme').onclick=()=>{const root=document.documentElement;root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';window.dispatchEvent(new Event('themechange'));try{localStorage.setItem('theme',root.dataset.theme)}catch{}};
$('#menu').onclick=()=>{const open=$('#navlinks').classList.toggle('open');$('#menu').setAttribute('aria-expanded',open)};
$$('#navlinks a').forEach(a=>a.onclick=()=>{$('#navlinks').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')});
$$('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText('harshithp914@gmail.com');$('#email-status').textContent='Email copied to clipboard.'}catch{$('#email-status').textContent='harshithp914@gmail.com'}};
const motion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!motion&&'IntersectionObserver'in window){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:0});
  $$('.section > *').forEach(el=>{el.classList.add('reveal');obs.observe(el)});
  const phrases=["Hello, I’m","Namaskara, I’m","Hi there, I’m"];
  let pi=0,ch=phrases[0].length,del=true;
  function type(){
    const phrase=phrases[pi];
    $('#typed').textContent=phrase.slice(0,ch);
    if(!del&&ch===phrase.length){del=true;setTimeout(type,1700);return}
    if(del&&ch===0){del=false;pi=(pi+1)%phrases.length}
    ch+=del?-1:1;
    setTimeout(type,del?45:85);
  }
  setTimeout(type,1700);
}
function scroll(){const h=document.documentElement;$('#progress').style.width=(h.scrollTop/Math.max(1,h.scrollHeight-innerHeight)*100)+'%';let id='home';$$('main section[id]').forEach(s=>{if(s.getBoundingClientRect().top<160)id=s.id});$$('#navlinks a').forEach(a=>a.classList.toggle('active',a.hash==='#'+id))}
addEventListener('scroll',scroll,{passive:true});scroll();
