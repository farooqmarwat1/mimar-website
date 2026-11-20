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

// Deliverable 4 (19 Nov 2026): US city queries landed on the home page; the USA page now has one
// subheading per city, in both languages.
test('the USA page names each searched city in its own subheading', () => {
  const { regions } = load('src/lib/regions.ts');
  const usa = regions.usa;
  const cities = ['San Francisco', 'Dallas', 'New York', 'Miami', 'Los Angeles', 'Houston'];
  assert.equal(JSON.stringify(usa.cityHub.cities.map(c => c.city)), JSON.stringify(cities));
  for (const c of usa.cityHub.cities) assert.ok(c.heading.includes(c.city), c.heading);
  const ar = localizeRegion(usa, 'ar');
  assert.equal(ar.cityHub.cities.length, cities.length, 'Arabic has every city');
  assert.equal(ar.faqs.length, usa.faqs.length, 'Arabic has every FAQ');
  assert.ok(usa.description.length <= 160 && ar.description.length <= 160);
  assert.ok(usa.faqs.some(f => /outsource/i.test(f.question)));
});

test('the home title and description fit a search result and end on a call to action', () => {
  const { siteConfig, faqs } = load('src/lib/site-config.ts');
  const { siteConfigAr } = load('src/lib/ar/site-config.ar.ts');
  assert.ok(siteConfig.title.length <= 60, siteConfig.title);
  assert.match(siteConfig.title, /\| Mimar Studios$/);
  assert.ok(siteConfig.description.length <= 160, siteConfig.description);
  assert.match(siteConfig.description, /quote/i);
  assert.equal(siteConfigAr.faqs.length, faqs.length, 'Arabic home has every FAQ');
});

// Deliverable 5 (19 Nov 2026): every region page has the H1/H2/H3 plan and a description that fits a
// search result, in both languages, and a short label for breadcrumbs and buttons.
test('every region page has its heading plan, a short label and a description that fits', () => {
  for (const region of regionList) {
    for (const r of [region, localizeRegion(region, 'ar')]) {
      assert.ok(r.marketHeading && r.localHeading && r.localHeading.heading && r.localHeading.body, `${r.name} heading plan`);
      assert.ok(r.label && r.label.length <= 60, `${r.name} label: ${r.label}`);
      assert.ok(r.description.length >= 110 && r.description.length <= 160, `${r.name} description is ${r.description.length}: ${r.description}`);
    }
  }
  const { regions } = load('src/lib/regions.ts');
  assert.ok(regions.saudiArabia.faqs.some(f => /Wafi/.test(f.question)), 'Saudi Wafi FAQ');
  assert.equal(localizeRegion(regions.saudiArabia, 'ar').faqs.length, regions.saudiArabia.faqs.length, 'Arabic Saudi FAQs match');
});

test('the old Middle East article is gone from the legacy content', () => {
  for (const file of ['../src/content/legacy-seo.json', '../src/content/legacy-seo.ar.json']) {
    const pages = require(file);
    assert.ok(!pages.some(page => page.path === '/3d-visualization-middle-east'), file);
  }
});

// Earlier Deliverable 4 and 5 drafts (20 Nov 2026, SEO_MIGRATION.md point 36).
test('every region page links the core 3D Visualization page in its first 300 words', () => {
  for (const region of regionList) {
    for (const r of [region, localizeRegion(region, 'ar')]) {
      const lead = [r.h1, r.intro, r.marketHeading, r.marketCopy].join(' ');
      const link = lead.indexOf('](/services/3d-visualization)');
      assert.ok(link > 0, `${r.name} market copy links /services/3d-visualization`);
      assert.ok(lead.slice(0, link).split(/\s+/).length <= 300, `${r.name} link is within the first 300 words`);
    }
  }
});

test('the UAE and Saudi pages link up to the Middle East hub, and the USA has its own section headings', () => {
  const { regions } = load('src/lib/regions.ts');
  for (const key of ['uae', 'saudiArabia']) assert.ok(regions[key].relatedRegions.includes('middleEast'), key);
  const usa = regions.usa;
  assert.equal(usa.headings.projects, 'Featured US Architectural Developments');
  assert.equal(usa.headings.why, 'Built for US Real Estate Workflows');
  assert.ok(localizeRegion(usa, 'ar').headings.faq, 'Arabic USA FAQ heading');
  assert.match(usa.description, /48 hrs/);
  assert.ok(usa.faqs.some(f => /files do you deliver/.test(f.question)));
  assert.equal(localizeRegion(usa, 'ar').faqs.length, usa.faqs.length, 'Arabic USA FAQs match');
});

test('the services showcase puts all 11 service links in the server HTML', () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/components/sections/ServicesPreview.tsx'), 'utf8');
  const items = source.slice(source.indexOf('export const items = ['), source.indexOf('];', source.indexOf('export const items = [')));
  assert.equal((items.match(/href: "\/services\//g) || []).length, 11);
  assert.match(source, /\{groups\.map\(\(group, groupIndex\) =>/, 'every group is rendered, not only the active one');
  assert.doesNotMatch(source, /groups\[activeGroup\]\.map/);
});
