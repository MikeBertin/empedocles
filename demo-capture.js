// demo-capture.js — records demo.gif, the README montage of the three demos.
//
// Drives the local static server through four beats (landing → Methinks converging
// → HIFF race → NK ruggedness sweep) with Playwright + the system Chrome, records
// one continuous .webm, and prints its filename. A second ffmpeg pass turns the
// .webm into an optimised, palette-based GIF (see below).
//
//   # 1. serve the repo root on :8750
//   python3 -m http.server 8750
//
//   # 2. record the webm  (needs: npm i playwright  +  Google Chrome installed)
//   node demo-capture.js                       # writes a page@<hash>.webm
//
//   # 3. webm -> gif  (needs ffmpeg)
//   V=$(ls -t *.webm | head -1)
//   ffmpeg -i "$V" -vf "fps=12,scale=660:-1:flags=lanczos,palettegen=stats_mode=diff" -y palette.png
//   ffmpeg -i "$V" -i palette.png -lavfi "fps=12,scale=660:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -y demo.gif
//
// The GIF goes stale like og.png when a demo changes — re-record to refresh.

const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8750';
const W = 1000, H = 680;
const OUT = process.env.OUT_DIR || '.';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'load' });
  await sleep(400);
}
// Scroll an element to near the top of the viewport so the action is framed.
async function frame(page, sel, top = 96) {
  await page.evaluate(({ sel, top }) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.scrollY - top));
  }, { sel, top });
  await sleep(250);
}
// Animate a range input min→max→min, dispatching input events so the demo redraws.
async function sweepRange(page, sel, ms) {
  await page.evaluate(async ({ sel, ms }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const min = parseFloat(el.min || '0'), max = parseFloat(el.max || '100'),
          step = parseFloat(el.step || '1'), start = performance.now();
    return new Promise(res => {
      function f(now) {
        let t = (now - start) / ms; if (t >= 1) t = 1;
        const tri = t < 0.5 ? t * 2 : (1 - t) * 2;                 // up then back down
        let v = min + (max - min) * tri;
        v = Math.round(v / step) * step;
        el.value = String(v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        if (t < 1) requestAnimationFrame(f); else res();
      }
      requestAnimationFrame(f);
    });
  }, { sel, ms });
}
const set = (page, sel, val) => page.$eval(sel, (el, v) => {
  el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, val);
const click = (page, sel) => page.$eval(sel, el => el.click());

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  const page = await context.newPage();

  // 0 — Landing hero: gradient title + the three animated demo cards
  await goto(page, '/');
  await sleep(1500);

  // 1 — Methinks (Watch): a population converges on the target, green spreading
  await goto(page, '/methinks/');
  await set(page, '#w-speed', 2);                 // watchable convergence
  await frame(page, '.layout', 150);
  await click(page, '#w-run');
  await sleep(2900);

  // 2 — HIFF (Race): mutation stalls on a patchwork while crossover climbs the hierarchy
  await goto(page, '/hiff/');
  await click(page, '.tab[data-tab="race"]');
  await sleep(250);
  await frame(page, '.race-cols', 70);
  await click(page, '#r-run');
  await sleep(3600);

  // 3 — NK (Landscape): sweep epistasis K — smooth plaid dissolves into rugged static
  await goto(page, '/nk/');
  await frame(page, '#l-canvas', 150);
  await sleep(600);
  await sweepRange(page, '#l-k', 3400);
  await sleep(300);

  const video = page.video();
  await context.close();
  await browser.close();
  const path = await video.path();
  console.log(path);
})();
