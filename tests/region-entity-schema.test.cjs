const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./load.cjs');

// Consultant Deliverable 11 (GEO, 8 region pages), applied where it fits the verified facts:
// external sameAs profiles, contact languages, office departments, a Service node per region
// page and the local currency on each region branch. Its removal of the Dubai and US Business
// Profiles was not applied - the owner confirmed those profiles on 18 Nov 2026.

const { siteJsonLd, siteJsonLdAr } = load('src/lib/seo.ts');
const { social } = load('src/lib/site-config.ts');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const org = (graph) => graph['@graph'].find((n) => n['@id'] === 'https://mim.archi/#organization');

test('Organization sameAs uses the footer social profiles and drops the dead ones', () => {
  for (const graph of [siteJsonLd, siteJsonLdAr]) {
    const sameAs = org(graph).sameAs;
    for (const url of Object.values(social)) assert.ok(sameAs.includes(url), `${url} missing from sameAs`);
    assert.ok(!sameAs.some((u) => /linkedin\.com\/company\/mimar-studios|pinterest\.com\/mimarstudios/.test(u)));
    assert.ok(!sameAs.some((u) => u.startsWith('https://mim.archi')), 'sameAs must point outside the site');
    assert.equal(new Set(sameAs).size, sameAs.length, 'sameAs has duplicates');
  }
});

test('every contact point names its languages and every department is a node in the graph', () => {
  const o = org(siteJsonLd);
  for (const point of o.contactPoint) assert.ok(point.availableLanguage.length > 0, `${point.areaServed} has no availableLanguage`);
  const ids = new Set(siteJsonLd['@graph'].map((n) => n['@id']));
  for (const dept of o.department) assert.ok(ids.has(dept['@id']), `${dept['@id']} is not in the graph`);
});

const regionPages = [
  'src/app/(site)/3d-visualization-services-uae/page.tsx',
  'src/app/(site)/3d-visualization-services-saudi-arabia/page.tsx',
  'src/app/(site)/3d-visualization-services-pakistan/page.tsx',
  'src/app/(site)/3d-visualization-usa/page.tsx',
  'src/app/(site)/3d-visualization-middle-east/page.tsx',
  'src/components/regions/RegionPageAr.tsx',
];

test('each region page has its own Service @id and quotes its branches in the local currency', () => {
  for (const file of regionPages) {
    const src = read(file);
    assert.match(src, /"@id": `\$\{siteUrl\((region\.path|pagePath)\)\}#service`/, `${file} reuses the services page Service @id`);
    assert.match(src, /currenciesAccepted: localCurrency\[location\.countryCode\]/, `${file} has no currenciesAccepted`);
  }
  const { localCurrency } = load('src/lib/regions.ts');
  assert.equal(JSON.stringify(localCurrency), JSON.stringify({ AE: 'AED', SA: 'SAR', PK: 'PKR', US: 'USD' }));
});

test('llms.txt lists the regional pages in English and Arabic', () => {
  const src = read('src/app/llms.txt/route.ts');
  assert.match(src, /"## Regional pages"/);
  assert.match(src, /regionList\.map\(\(r\) => \{\s*const ar = localizeRegion\(r, "ar"\)/);
});

test('Dubai, the six US cities and Istanbul are listed in llms.txt, matching the schema', () => {
  const { profileLocations } = load('src/lib/profile-locations.ts');
  const en = profileLocations('en');
  assert.equal(JSON.stringify(en.map((l) => l.city)), JSON.stringify(['Dubai', 'New York', 'Dallas', 'San Francisco', 'Los Angeles', 'Houston', 'Austin', 'Istanbul']));
  assert.equal(profileLocations('ar').length, en.length);
  const istanbulNode = siteJsonLd['@graph'].find((n) => n['@id'] === 'https://mim.archi/#localbusiness-istanbul');
  const istanbul = en.find((l) => l.city === 'Istanbul');
  assert.ok(istanbul.address.includes(istanbulNode.address.streetAddress) && istanbul.address.includes(istanbulNode.address.postalCode));
  assert.equal(istanbul.gbpUrl, istanbulNode.hasMap);
  assert.equal(istanbul.phone, undefined);
  assert.match(read('src/app/llms.txt/route.ts'), /"## Business Profile locations"/);
});
