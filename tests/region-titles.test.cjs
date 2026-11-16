const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { regionList } = load('src/lib/regions.ts');
const { localizeRegion } = load('src/lib/ar/regions.ar.ts');
const { regionalTitles } = load('src/lib/region.ts');

// Google shows about 60 characters of a title; the country pages used to run to 63-76 and were cut
// off (SEO_MIGRATION.md point 29).
test('every country page title fits a search result and names its country', () => {
  const countryWord = { UAE: /UAE/, USA: /USA/, 'Saudi Arabia': /Saudi Arabia/, Pakistan: /Pakistan/ };
  const arCountryWord = { UAE: /الإمارات/, USA: /الولايات المتحدة/, 'Saudi Arabia': /السعودية/, Pakistan: /باكستان/ };
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
