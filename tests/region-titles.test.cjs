const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { regionList } = load('src/lib/regions.ts');
const { localizeRegion } = load('src/lib/ar/regions.ar.ts');
const { regionalTitles } = load('src/lib/region.ts');

// Google shows about 60 characters of a title; the country pages used to run to 63-76 and were cut
// off (SEO_MIGRATION.md point 29).
test('every country page title fits a search result and names its country', () => {
  const countryWord = { UAE: /UAE/, USA: /USA/, 'Saudi Arabia': /Saudi Arabia/, Pakistan: /Pakistan/, 'Middle East': /Middle East/ };
  const arCountryWord = { UAE: /الإمارات/, USA: /الولايات المتحدة/, 'Saudi Arabia': /السعودية/, Pakistan: /باكستان/, 'Middle East': /الشرق الأوسط/ };
  for (const region of regionList) {
    const en = region.seoTitle;
    const ar = localizeRegion(region, 'ar').seoTitle;
    assert.ok(en.length >= 50 && en.length <= 60, `${region.name} title is ${en.length} characters: ${en}`);
    assert.ok(ar.length >= 45 && ar.length <= 60, `${region.name} Arabic title is ${ar.length} characters: ${ar}`);
    assert.match(en, countryWord[region.name], `${region.name} title names the country`);
    assert.match(ar, arCountryWord[region.name], `${region.name} Arabic title names the country`);
    assert.match(en, /\| Mimar Studios$/, `${region.name} title ends with the brand`);
  }
});

test('the regional home tab titles lead with the brand', () => {
  for (const title of Object.values(regionalTitles.en)) assert.match(title, /^Mimar Studios \| /);
  for (const title of Object.values(regionalTitles.ar)) assert.match(title, /^استوديوهات معمار \| /);
});

test('the Middle East hub lists the Gulf projects, links its markets, and keeps the old URL', () => {
  const { regions } = load('src/lib/regions.ts');
  const me = regions.middleEast;
  assert.equal(me.path, '/3d-visualization-middle-east');
  const gulf = [...regions.uae.projectSlugs, ...regions.saudiArabia.projectSlugs, 'amerat-park'];
  assert.deepEqual([...me.projectSlugs].sort(), gulf.sort(), 'every UAE, Saudi and Oman project');
  // A project's country page is the first region that lists it, so the hub must come last.
  const keys = Object.keys(regions);
  assert.equal(keys[keys.length - 1], 'middleEast');
  const ar = localizeRegion(me, 'ar');
  assert.equal(ar.locations.length, me.locations.length, 'Arabic has every location');
  assert.equal(ar.testimonials.length, me.testimonials.length);
  assert.ok(ar.faqs.length >= 5 && ar.services.length === me.services.length && ar.reasons.length === me.reasons.length);
});

test('the old Middle East article is gone from the legacy content', () => {
  for (const file of ['../src/content/legacy-seo.json', '../src/content/legacy-seo.ar.json']) {
    const pages = require(file);
    assert.ok(!pages.some(page => page.path === '/3d-visualization-middle-east'), file);
  }
});
