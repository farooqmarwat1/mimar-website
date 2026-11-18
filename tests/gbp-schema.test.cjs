const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { siteJsonLd, siteJsonLdAr } = load('src/lib/seo.ts');

// (The loader runs the module in its own VM context, so arrays and objects are compared as JSON.)
// The owner's "GMB Profiles" table (19 Oct 2026): nine verified Google Business Profiles. Every link was
// opened on 18 Nov 2026 and reaches the listing (share.google answers for dead links too, so check by hand
// before changing one). Dallas is marked up with the maps CID of the same listing.
const VERIFIED_PROFILES = {
  Islamabad: 'https://share.google/9UmptDgeq3JNUfBZW',
  Dubai: 'https://share.google/zExBKdwTHeYWP6xBc',
  'New York': 'https://share.google/1moaNAdc6IN5roHSm',
  Dallas: 'https://maps.google.com/?cid=10127851720809782624',
  'San Francisco': 'https://share.google/jF9Xy8mD5BPlUy1wY',
  'Los Angeles': 'https://share.google/1DPWaFVsmxJDSZocn',
  Houston: 'https://share.google/H6hiSKKIuuuV59ZFt',
  Austin: 'https://maps.app.goo.gl/rQE1yMo767ZwhQLK8',
  Istanbul: 'https://share.google/52xpHYZjQEjnqvTFh',
};

const node = (graph, id) => graph['@graph'].find((n) => n['@id'] === `https://mim.archi/#${id}`);

test('the Organization links every verified Business Profile, in English and Arabic', () => {
  for (const graph of [siteJsonLd, siteJsonLdAr]) {
    const sameAs = node(graph, 'organization').sameAs;
    for (const [city, url] of Object.entries(VERIFIED_PROFILES)) {
      assert.ok(sameAs.includes(url), `${city} profile missing from Organization.sameAs`);
    }
  }
});

test('Islamabad and Istanbul branches point at their profiles; Istanbul invents no address or phone', () => {
  const islamabad = node(siteJsonLd, 'localbusiness-islamabad');
  assert.equal(islamabad.hasMap, VERIFIED_PROFILES.Islamabad);
  assert.equal(JSON.stringify(islamabad.sameAs), JSON.stringify([VERIFIED_PROFILES.Islamabad]));

  const istanbul = node(siteJsonLd, 'localbusiness-istanbul');
  assert.ok(istanbul, 'Istanbul LocalBusiness missing');
  assert.equal(istanbul.hasMap, VERIFIED_PROFILES.Istanbul);
  assert.equal(JSON.stringify(istanbul.address), JSON.stringify({ '@type': 'PostalAddress', addressLocality: 'Istanbul', addressCountry: 'TR' }));
  assert.equal(istanbul.telephone, undefined);
  assert.ok(node(siteJsonLdAr, 'localbusiness-istanbul'), 'Istanbul missing from the Arabic graph');
  assert.ok(node(siteJsonLd, 'organization').areaServed.includes('Turkey'));
});
