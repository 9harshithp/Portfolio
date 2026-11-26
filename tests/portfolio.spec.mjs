import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || '4173';
const BASE = `http://127.0.0.1:${PORT}`;
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

const launchOptions = { args: ['--no-sandbox', '--headless=new'] };
if (process.env.CHROME_PATH) {
  launchOptions.executablePath = process.env.CHROME_PATH;
}

const browser = await chromium.launch(launchOptions);

try {
  // 1. Static endpoints & local asset verification
  const context = await browser.newContext();
  const page = await context.newPage();
  const staticPaths = [
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/site.webmanifest',
    '/assets/og-preview.png',
    '/google57bc4c8b8289e9c9.html',
    '/style.css',
    '/studio.css',
    '/app.js',
    '/studio.js'
  ];
  for (const p of staticPaths) {
    const res = await page.request.get(BASE + p);
    assert.equal(res.status(), 200, `${p} returned ${res.status()}`);
  }
  const robotsTxt = await (await page.request.get(BASE + '/robots.txt')).text();
  assert.ok(robotsTxt.includes('User-agent: *'));
  assert.ok(robotsTxt.includes('Allow: /'));
  assert.ok(robotsTxt.includes('Sitemap: https://portfolio-bay-three-10.vercel.app/sitemap.xml'));

  // Verify all local assets referenced in index.html exist
  const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
  const assetRefs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map(m => m[1])
    .filter(u => !u.startsWith('http') && !u.startsWith('#') && !u.startsWith('mailto:'));
  for (const ref of assetRefs) {
    const clean = ref.startsWith('/') ? ref.slice(1) : ref;
    assert.ok(fs.existsSync(clean), `Missing local asset: ${clean}`);
  }
  await context.close();

  // 2. Regression tests across desktop, tablet, and mobile viewports
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const p = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedLocalReqs = [];
    p.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    p.on('pageerror', err => pageErrors.push(err.message));
    p.on('requestfailed', req => {
      if (req.url().startsWith(BASE)) {
        failedLocalReqs.push(`${req.url()} (${req.failure()?.errorText})`);
      }
    });

    const resp = await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    assert.equal(resp.status(), 200, `[${vp.name}] homepage status`);

    // No horizontal overflow
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `[${vp.name}] horizontal overflow: ${overflow}px`);

    // SEO: canonical, robots, JSON-LD
    const canonical = await p.getAttribute('link[rel="canonical"]', 'href');
    assert.equal(canonical, 'https://portfolio-bay-three-10.vercel.app/');
    const robotsMeta = await p.getAttribute('meta[name="robots"]', 'content');
    assert.ok(!robotsMeta.includes('noindex'));

    const ldCount = await p.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(el.textContent);
      return Array.isArray(data['@graph']) ? data['@graph'].length : 0;
    });
    assert.equal(ldCount, 4, `[${vp.name}] JSON-LD @graph items`);

    // All 8 projects in grid and directory
    assert.equal(await p.locator('#project-grid button').count(), 8, `[${vp.name}] project grid count`);
    assert.equal(await p.locator('.project-directory li').count(), 8, `[${vp.name}] project directory count`);

    // Scroll lazy images into view and verify none are broken
    await p.evaluate(async () => {
      for (const el of document.querySelectorAll('img[loading="lazy"]')) {
        el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
        await new Promise(r => setTimeout(r, 80));
      }
      await Promise.all(Array.from(document.images).map(img =>
        img.complete ? null : new Promise(r => {
          img.addEventListener('load', r, { once: true });
          img.addEventListener('error', r, { once: true });
        })
      ));
      window.scrollTo(0, 0);
    });
    const brokenImages = await p.evaluate(() =>
      Array.from(document.images)
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src)
    );
    assert.deepEqual(brokenImages, [], `[${vp.name}] broken images`);

    // Spotlight swipe / loop both directions
    assert.equal(await p.locator('#spot-index').textContent(), '1 / 8');
    await p.click('#spot-prev');
    await p.waitForTimeout(400);
    assert.equal(await p.locator('#spot-index').textContent(), '8 / 8', `[${vp.name}] spotlight prev loop`);
    await p.click('#spot-next');
    await p.waitForTimeout(400);
    assert.equal(await p.locator('#spot-index').textContent(), '1 / 8', `[${vp.name}] spotlight next loop`);

    // Project carousel next/prev loop
    assert.equal(await p.locator('#count').textContent(), '01 / 08');
    await p.click('#prev');
    assert.equal(await p.locator('#count').textContent(), '08 / 08');
    await p.click('#next');
    assert.equal(await p.locator('#count').textContent(), '01 / 08');

    // Project filters & game projects do not display Visit site
    await p.click('[data-filter="Games"]');
    assert.equal(await p.locator('#project-grid button').count(), 2, `[${vp.name}] Games filter count`);
    assert.equal(await p.locator('#project-stage a:has-text("Visit site")').count(), 0, `[${vp.name}] Paperly has no Visit site`);
    assert.equal(await p.locator('#project-stage a:has-text("Source code")').count(), 1, `[${vp.name}] Paperly has Source code`);
    await p.click('#next');
    assert.equal(await p.locator('#project-stage a:has-text("Visit site")').count(), 0, `[${vp.name}] Ridgeline Rally has no Visit site`);

    // Software project with URL has Visit site + Case study
    await p.click('[data-filter="All"]');
    assert.equal(await p.locator('#project-grid button').count(), 8);
    assert.equal(await p.locator('#project-stage a:has-text("Visit site")').count(), 1);
    await p.click('#details');
    assert.equal(await p.locator('#case[open]').count(), 1, `[${vp.name}] Case study dialog opened`);
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('#case[open]').count(), 0, `[${vp.name}] Case study dialog closed via Esc`);

    // Theme toggle
    const themeBefore = await p.getAttribute('html', 'data-theme');
    await p.click('#theme');
    const themeAfter = await p.getAttribute('html', 'data-theme');
    assert.notEqual(themeBefore, themeAfter, `[${vp.name}] theme toggled`);
    await p.click('#theme');

    // Resume & contact links
    const resumeHref = await p.getAttribute('a:has-text("View résumé")', 'href');
    assert.ok(resumeHref.includes('drive.google.com'));
    const mailHref = await p.getAttribute('a:has-text("Send an email")', 'href');
    assert.equal(mailHref, 'mailto:harshithp914@gmail.com');

    // Navigation link click
    if (vp.width <= 700) {
      await p.click('#menu');
    }
    await p.click('#navlinks a[href="#projects"]');
    await p.waitForTimeout(200);

    // GA4 initialization, consent controls, and custom events check (desktop)
    if (vp.name === 'desktop') {
      const gaInit = await p.evaluate(() => ({
        init: window.__ga4Initialized,
        hasConfig: Array.isArray(window.dataLayer) && window.dataLayer.some(a => a[0] === 'config' && a[1] === 'G-NJ0QBENB9W'),
        bannerVisible: !document.getElementById('consent-banner').hidden
      }));
      assert.equal(gaInit.init, true, 'GA4 initialized once');
      assert.equal(gaInit.hasConfig, true, 'GA4 config present');
      assert.equal(gaInit.bannerVisible, true, 'Consent banner visible initially');

      await p.click('#consent-accept');
      assert.equal(await p.evaluate(() => document.getElementById('consent-banner').hidden), true, 'Consent banner hides on accept');
      assert.equal(await p.evaluate(() => localStorage.getItem('ga_consent')), 'granted');

      await p.click('#privacy-open');
      assert.equal(await p.locator('#privacy-dialog[open]').count(), 1, 'Privacy dialog opens');
      await p.click('#privacy-decline');
      assert.equal(await p.evaluate(() => localStorage.getItem('ga_consent')), 'denied');

      // Trigger tracked events and inspect dataLayer
      await p.click('#copy');
      await p.click('#details');
      await p.keyboard.press('Escape');
      const events = await p.evaluate(() =>
        window.dataLayer.filter(a => a[0] === 'event').map(a => ({ name: a[1], params: a[2] }))
      );
      const names = events.map(e => e.name);
      assert.ok(names.includes('project_view'), 'project_view tracked');
      assert.ok(names.includes('email_copy'), 'email_copy tracked');
      assert.ok(names.includes('case_study_open'), 'case_study_open tracked');
      const caseEv = events.find(e => e.name === 'case_study_open');
      assert.ok(caseEv.params?.project_name, 'case_study_open has project_name');
    }

    assert.deepEqual(consoleErrors, [], `[${vp.name}] console errors`);
    assert.deepEqual(pageErrors, [], `[${vp.name}] page errors`);
    assert.deepEqual(failedLocalReqs, [], `[${vp.name}] failed local requests`);
    console.log(`PASS [${vp.name} ${vp.width}x${vp.height}]`);
    await ctx.close();
  }
} finally {
  await browser.close();
}

