# Harshith P — Engineering Portfolio

[![CI](https://github.com/9harshithp/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/9harshithp/Portfolio/actions/workflows/ci.yml)

Personal engineering portfolio for **Harshith P**, Backend Engineer at GammaStack and Full Stack & Game Developer in Mysuru, India.

**Live Production URL:** https://portfolio-bay-three-10.vercel.app/

## Tech Stack

- Static HTML, CSS, and vanilla JavaScript (`index.html`, `style.css`, `studio.css`, `app.js`, `studio.js`)
- Technical SEO & AEO: canonical URL, Open Graph & Twitter/X metadata, `sitemap.xml`, `robots.txt`, `llms.txt`, and Schema.org `@graph` JSON-LD (`WebSite`, `ProfilePage`, `Person`, `ItemList`)
- Google Analytics 4 (`G-NJ0QBENB9W`) with Consent Mode v2 controls and zero-PII event tracking
- Google Search Console verification (`google57bc4c8b8289e9c9.html`)

## Latest Production Mobile PageSpeed Scores

- **Performance:** 97
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

## Local Verification

```bash
# Syntax & HTML validation
node --check app.js && node --check studio.js
npx -y html-validate index.html

# Playwright regression suite
python3 -m http.server 4173 --bind 127.0.0.1 &
node tests/portfolio.spec.mjs
```

