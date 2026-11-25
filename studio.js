'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const canvas = document.querySelector('#weave');
const context = canvas.getContext('2d');
let width = 0;
let height = 0;
let inView = true;
let frame = 0;
let mouseX = 0;
let mouseY = 0;
let easedX = 0;
let easedY = 0;
let ink = '#6c78ff';
let isLight = document.documentElement.dataset.theme === 'light';

function syncThemeCache() {
  isLight = document.documentElement.dataset.theme === 'light';
  const val = getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim();
  if (val) ink = val;
}
syncThemeCache();
window.addEventListener('themechange', syncThemeCache);

// Project a gently folding lattice into the hero. Only visible tiles near the
// moving crest are illuminated, so the text keeps a quiet reading area.
function paintField(time) {
  if (!context || !width || !height) return;
  const t = reduceMotion.matches ? 1.4 : time / 1900;
  easedX += (mouseX - easedX) * 0.045;
  easedY += (mouseY - easedY) * 0.045;
  context.clearRect(0, 0, width, height);
  const tile = width < 700 ? 18 : Math.min(36, width / 39);
  const horizon = height * (width < 700 ? 0.46 : 0.32);
  const origin = width * 0.55;
  const range = width < 700 ? 10 : 14;
  function point(i, j) {
    const wave = Math.sin(i * 0.32 + t) * Math.cos(j * 0.27 - t * 0.55);
    return [origin + (i - j) * tile + easedX * 19,
      horizon + (i + j) * tile * 0.43 - wave * tile * 1.5 + easedY * 13];
  }
  context.strokeStyle = ink;
  context.fillStyle = ink;
  for (let j = -range; j <= range; j++) {
    for (let i = -range; i <= range; i++) {
      const crest = Math.exp(-((i - 4 * Math.sin(t * .35)) ** 2 / 60 + (j + 3 * Math.cos(t * .3)) ** 2 / 32));
      const alpha = crest * (0.34 + 0.22 * Math.sin(i * .5 + j * .4 - t));
      if (alpha < .02) continue;
      const corners = [point(i,j), point(i+1,j), point(i+1,j+1), point(i,j+1)];
      context.beginPath();
      corners.forEach(([x,y], index) => index ? context.lineTo(x,y) : context.moveTo(x,y));
      context.closePath();
      context.globalAlpha = alpha * (isLight ? .85 : 1);
      context.stroke();
      context.globalAlpha = alpha * .14;
      context.fill();
      if ((i * 3 + j) % 9 === 0 && crest > .35) {
        context.globalAlpha = crest * .85;
        context.fillRect(corners[0][0]-1, corners[0][1]-1, 3, 3);
      }
    }
  }
  context.globalAlpha = 1;
}
function draw(time) {
  frame = 0;
  paintField(time);
  if (inView && !document.hidden && !reduceMotion.matches) frame = requestAnimationFrame(draw);
}
function startField() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  if (inView && !document.hidden) frame = requestAnimationFrame(draw);
}
function resizeField() {
  width = hero.clientWidth;
  height = hero.clientHeight;
  const density = Math.min(window.devicePixelRatio || 1, 1.75);
  canvas.width = width * density;
  canvas.height = height * density;
  context?.setTransform(density,0,0,density,0,0);
  startField();
}
new ResizeObserver(resizeField).observe(hero);
new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; startField(); }).observe(hero);
document.addEventListener('visibilitychange', startField);
reduceMotion.addEventListener('change', startField);
hero.addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType === 'touch') return;
  const bounds = hero.getBoundingClientRect();
  mouseX = (event.clientX - bounds.left) / width * 2 - 1;
  mouseY = (event.clientY - bounds.top) / height * 2 - 1;
  hero.style.setProperty('--tilt', mouseX * 5 + 'deg');
  hero.style.setProperty('--pitch', -mouseY * 4 + 'deg');
});
hero.addEventListener('pointerleave', () => {
  mouseX = mouseY = 0;
  hero.style.setProperty('--tilt', '0deg');
  hero.style.setProperty('--pitch', '0deg');
});

let spotlight = 0;
let busy = false;
let drag = null;
const card = document.querySelector('#spotlight');
const deckIndex = step => (spotlight + step + projects.length) % projects.length;

function face(project) {
  return '<div class="deck-image"><img draggable="false" alt="'+project.name+' project preview" src="assets/'+project.image+'-600.webp" srcset="assets/'+project.image+'-600.webp 600w, assets/'+project.image+'.webp '+project.w+'w" sizes="(max-width: 700px) 90vw, 420px" width="600" height="'+project.h600+'"></div><div class="deck-content"><small>'+project.type+'</small><h2>'+project.name+'</h2><p>'+project.desc+'</p><button type="button">Explore project</button></div>';
}

function showSpotlight() {
  card.innerHTML = face(projects[spotlight]);
  document.querySelector('#spot-index').textContent = (spotlight + 1) + ' / ' + projects.length;
  card.querySelector('button').onclick = () => {
    document.querySelector('[data-filter="All"]').click();
    active = spotlight;
    render();
    document.querySelector('#projects').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth'});
  };
}

function pose(x) {
  return 'translateX('+x+'px) rotate('+Math.max(-18,Math.min(18,x/15))+'deg)';
}

async function advance(step, offset = 0) {
  if (busy) return;
  busy = true;
  const next = deckIndex(step);
  const under = document.createElement('div');
  under.className = 'deck-card deck-under';
  under.inert = true;
  under.setAttribute('aria-hidden','true');
  try {
    if (!reduceMotion.matches) {
      under.innerHTML = face(projects[next]);
      card.before(under);
      await card.animate([
        {transform:pose(offset),opacity:1},
        {transform:pose(step * card.offsetWidth * 1.15),opacity:0}
      ],{duration:300,easing:'cubic-bezier(.35,.03,.7,.45)'}).finished;
    }
    spotlight = next;
    showSpotlight();
  } finally {
    card.style.transform = '';
    under.remove();
    busy = false;
  }
}

card.addEventListener('pointerdown', event => {
  if (busy || drag || !event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
  drag = {id:event.pointerId,x:event.clientX,y:event.clientY};
  card.setPointerCapture(event.pointerId);
});
card.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId || reduceMotion.matches) return;
  card.style.transform = pose(event.clientX - drag.x);
});
card.addEventListener('pointerup', event => {
  if (drag?.id !== event.pointerId) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  const bounds = card.parentElement.getBoundingClientRect();
  drag = null;
  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) advance(Math.sign(dx),dx);
  else if (Math.hypot(dx,dy) < 12) advance(event.clientX < bounds.left + bounds.width/2 ? -1 : 1);
  else card.style.transform = '';
});
card.addEventListener('lostpointercapture', () => {
  if (drag) { drag = null; card.style.transform = ''; }
});
document.querySelector('#spot-prev').onclick = () => advance(-1);
document.querySelector('#spot-next').onclick = () => advance(1);
showSpotlight();
const journey = document.querySelector('.timeline');
const jobs = [...journey.querySelectorAll('article')];
let job = 0;
function updateJourney() {
  const left = journey.getBoundingClientRect().left;
  const distances = jobs.map(item => Math.abs(item.getBoundingClientRect().left - left));
  job = distances.indexOf(Math.min(...distances));
  jobs.forEach((item,i) => item.classList.toggle('chosen',i===job));
  document.querySelector('#exp-count').textContent = (job+1)+' / '+jobs.length;
}
function moveJourney(step) {
  const target = jobs[(job+step+jobs.length)%jobs.length];
  journey.scrollBy({left:target.getBoundingClientRect().left-journey.getBoundingClientRect().left,behavior:reduceMotion.matches?'instant':'smooth'});
}
document.querySelector('#exp-prev').onclick = () => moveJourney(-1);
document.querySelector('#exp-next').onclick = () => moveJourney(1);
journey.addEventListener('scroll',updateJourney,{passive:true});
updateJourney();

const stage = document.querySelector('#project-stage');
let touchStart;
stage.addEventListener('touchstart',event=>{touchStart=event.touches[0].clientX},{passive:true});
stage.addEventListener('touchend',event=>{
  const delta=event.changedTouches[0].clientX-touchStart;
  if(Math.abs(delta)>65) document.querySelector(delta<0?'#next':'#prev').click();
},{passive:true});
const note = document.querySelector('#note');
note.addEventListener('submit',event=>{
  event.preventDefault();
  const fields=new FormData(note);
  location.href='mailto:harshithp914@gmail.com?subject='+encodeURIComponent('Portfolio enquiry from '+fields.get('sender'))+'&body='+encodeURIComponent(fields.get('message'));
});
