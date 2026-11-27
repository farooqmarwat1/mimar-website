// Fixes from the 27 Nov 2026 re-audit: Arabic digits inside link targets, old internal links that
// went through a redirect, and invisible characters in article titles.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { match } = require('next/dist/compiled/path-to-regexp');
const { load, root } = require('./load.cjs');

const { INTERNAL_REDIRECTS, finalInternalPath } = load('src/lib/internal-redirects.ts');
const { localizeDigits } = load('src/i18n/config.ts');
const { splitInlineLinks, stripInvisible, cleanArticleText } = load('src/lib/content-blocks.ts');

/** Where next.config.mjs sends a path: the first matching redirect's destination, or null. */
async function configDestination(pathname) {
  const config = (await import(pathToFileURL(path.join(root, 'next.config.mjs')).href)).default;
  for (const rule of await config.redirects()) {
    if (rule.has) continue;
    const hit = match(rule.source, { decode: decodeURIComponent })(pathname);
    if (hit) return rule.destination.replace(/:(\w+)\*?/g, (_, name) => [].concat(hit.params[name] ?? '').join('/'));
  }
  return null;
}

test('every old article link maps to the URL next.config.mjs redirects it to, in one step', async () => {
  for (const [from, to] of Object.entries(INTERNAL_REDIRECTS)) {
    const destination = await configDestination(from);
    assert.ok(destination, `${from} is no longer redirected in next.config.mjs`);
    assert.equal(destination.replace(/\/$/, ''), to, from);
    assert.equal(await configDestination(`${to}/`), null, `${to} redirects again`);
  }
});

test('finalInternalPath rewrites known old paths (with or without a slash) and leaves the rest alone', () => {
  assert.equal(finalInternalPath('/vr-360-tours'), '/services/interactive-services/vr-360-tours');
  assert.equal(finalInternalPath('/vr-360-tours/'), '/services/interactive-services/vr-360-tours');
  assert.equal(finalInternalPath('/profile#team'), '/about-us#team');
  assert.equal(finalInternalPath('/services/3d-visualization'), '/services/3d-visualization');
  assert.equal(finalInternalPath('https://example.com/profile'), 'https://example.com/profile');
  assert.equal(finalInternalPath('//example.com/profile'), '//example.com/profile');
});

test('Arabic digits never reach a link target', () => {
  const text = 'جرّب [جولات 360](/services/interactive-services/vr-360-tours) اليوم، 3 مشاريع.';
  const localized = localizeDigits(text, 'ar');
  assert.ok(localized.includes('](/services/interactive-services/vr-360-tours)'), localized);
  assert.ok(localized.includes('٣٦٠') && localized.includes('٣ مشاريع'), 'visible digits are still Arabic');
  const link = splitInlineLinks(localized).find((part) => part.href);
  assert.equal(link.href, '/services/interactive-services/vr-360-tours');
  assert.equal(localizeDigits('4YFN 2024', 'ar'), '4YFN ٢٠٢٤');
  assert.equal(localizeDigits(text, 'en'), text);
});

test('zero-width spaces are removed from article titles, descriptions and headings only', () => {
  assert.equal(stripInvisible('12 FAQ​ About﻿ Interior⁠ Design'), '12 FAQ About Interior Design');
  // RLM and ZWNJ stay: they can be intentional in right-to-left text.
  assert.equal(stripInvisible('‏عربي‌'), '‏عربي‌');
  const cleaned = cleanArticleText({
    title: 'Elements​ in Interior Design',
    seoTitle: 'Elements in Interior​ Design',
    description: 'A guide​',
    blocks: [
      { type: 'h2', text: 'Colour​' },
      { type: 'p', text: 'Body text keeps​ its characters' },
    ],
  });
  assert.equal(cleaned.title, 'Elements in Interior Design');
  assert.equal(cleaned.seoTitle, 'Elements in Interior Design');
  assert.equal(cleaned.description, 'A guide');
  assert.equal(cleaned.blocks[0].text, 'Colour');
  assert.equal(cleaned.blocks[1].text, 'Body text keeps​ its characters');
});
