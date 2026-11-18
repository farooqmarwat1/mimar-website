const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { requestCountry, cloudflareClientIp, trustCloudflareHeaders } = load('src/lib/geo-headers.ts');
const { clientIp, describeRequest } = load('src/lib/visits.ts', {
  'firebase-admin/firestore': { FieldValue: {} },
  '@/lib/firebase/admin': { adminDb() {}, isFirebaseConfigured: false },
});

const headers = (values) => new Headers(values);
const withTrust = (value, fn) => {
  const before = process.env.TRUST_CF_HEADERS;
  if (value === undefined) delete process.env.TRUST_CF_HEADERS;
  else process.env.TRUST_CF_HEADERS = value;
  try {
    return fn();
  } finally {
    if (before === undefined) delete process.env.TRUST_CF_HEADERS;
    else process.env.TRUST_CF_HEADERS = before;
  }
};

test('Vercel country header works as before and Cloudflare headers are ignored by default', () => {
  withTrust(undefined, () => {
    assert.equal(trustCloudflareHeaders(), false);
    assert.equal(requestCountry(headers({ 'x-vercel-ip-country': 'sa' })), 'SA');
    // Anyone who reaches the origin directly could send this by hand, so it is not read.
    assert.equal(requestCountry(headers({ 'cf-ipcountry': 'SA' })), null);
    assert.equal(cloudflareClientIp(headers({ 'cf-connecting-ip': '203.0.113.9' })), null);
  });
});

test('with TRUST_CF_HEADERS=1 the Cloudflare country and address are used', () => {
  withTrust('1', () => {
    assert.equal(requestCountry(headers({ 'cf-ipcountry': 'pk' })), 'PK');
    assert.equal(cloudflareClientIp(headers({ 'cf-connecting-ip': '203.0.113.9' })), '203.0.113.9');
    // The Vercel header still wins when both are present.
    assert.equal(requestCountry(headers({ 'x-vercel-ip-country': 'AE', 'cf-ipcountry': 'PK' })), 'AE');
  });
});

test('Cloudflare "unknown" and Tor codes, and malformed values, count as no country', () => {
  withTrust('1', () => {
    for (const value of ['XX', 'T1', 'ZZZ', '', '1', 'S A']) {
      assert.equal(requestCountry(headers({ 'cf-ipcountry': value })), null, value);
    }
  });
});

test('visitor records take the Cloudflare address and country only when trusted', () => {
  const request = { 'cf-connecting-ip': '198.51.100.20', 'cf-ipcountry': 'SA', 'x-forwarded-for': '10.0.0.1', 'user-agent': 'Mozilla/5.0 Chrome/120' };
  withTrust(undefined, () => {
    assert.equal(clientIp(headers(request)), '10.0.0.1'); // falls through to x-forwarded-for
    assert.equal(describeRequest(headers(request)).country, undefined);
  });
  withTrust('1', () => {
    assert.equal(clientIp(headers(request)), '198.51.100.20');
    assert.equal(describeRequest(headers(request)).country, 'SA');
  });
});
