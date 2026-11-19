const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { aboutContent } = load('src/content/pages/about-us.ts');
const { regions } = load('src/lib/regions.ts');

// SEO_MIGRATION.md point 34: the About page title, H1, markets and FAQs (sheets D1, D8, D9, D10).
test('the About page names the studio correctly in its title, description and H1', () => {
  const en = aboutContent.en;
  assert.ok(en.title.length >= 50 && en.title.length <= 60, `title is ${en.title.length} characters`);
  assert.ok(en.description.length >= 120 && en.description.length <= 155, `description is ${en.description.length} characters`);
  for (const text of [en.title, en.description, en.heroTitle]) {
    assert.match(text, /Mimar Studios/, `"${text}" uses the brand`);
    assert.doesNotMatch(text, /Mimar Studio\b|mimAR/, `"${text}" has no old or misspelt brand`);
  }
  const ar = aboutContent.ar;
  assert.ok(ar.title.length <= 60 && ar.description.length >= 120 && ar.description.length <= 155);
  assert.match(ar.title, /استوديوهات معمار/);
  assert.match(ar.heroTitle, /استوديوهات معمار/);
});

test('every market row links a real region page, in both languages', () => {
  for (const lang of ['en', 'ar']) {
    const rows = aboutContent[lang].where;
    assert.deepEqual(Array.from(rows, row => row.region), ['pakistan', 'uae', 'saudiArabia', 'usa', 'middleEast'], `${lang} markets`);
    for (const row of rows) {
      assert.ok(regions[row.region], `${lang}: ${row.region} is a region`);
      assert.ok(row.label && row.body.length > 40, `${lang}: ${row.region} has a label and a sentence`);
    }
  }
});

test('the About FAQs exist in both languages and say nothing unconfirmed', () => {
  for (const lang of ['en', 'ar']) {
    const faqs = aboutContent[lang].faqs;
    assert.equal(faqs.length, 5, `${lang} has five FAQs`);
    for (const faq of faqs) assert.ok(faq.question && faq.answer.length > 60, `${lang}: ${faq.question}`);
  }
  // Project and office counts disagree across the site until the owner confirms them, so the FAQs
  // state none (no "250+", "270+", "14 countries" or office counts).
  const text = aboutContent.en.faqs.map(faq => faq.answer).join(' ');
  assert.doesNotMatch(text, /\d+\+|\b\d+ (countries|offices|projects)\b/);
});
