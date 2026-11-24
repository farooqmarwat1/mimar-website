const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { countryFromTimeZone, isPlausiblePhone } = load('src/lib/phone-country.ts');

test('time zone gives the visitor country for the studio markets', () => {
  assert.equal(countryFromTimeZone('Asia/Karachi'), 'PK');
  assert.equal(countryFromTimeZone('Asia/Riyadh'), 'SA');
  assert.equal(countryFromTimeZone('Asia/Dubai'), 'AE');
  assert.equal(countryFromTimeZone('America/New_York'), 'US');
  assert.equal(countryFromTimeZone('Europe/London'), 'GB');
});

test('legacy aliases and other US zones resolve, unknown zones do not', () => {
  assert.equal(countryFromTimeZone('Asia/Calcutta'), 'IN');
  assert.equal(countryFromTimeZone('America/Indiana/Knox'), 'US');
  assert.equal(countryFromTimeZone('America/North_Dakota/Center'), 'US');
  assert.equal(countryFromTimeZone('Etc/UTC'), null);
  assert.equal(countryFromTimeZone(''), null);
  assert.equal(countryFromTimeZone(undefined), null);
});

test('phone check accepts real formats', () => {
  for (const value of ['03325983077', '0332 5983077', '+92 332-598-3077', '(212) 555 0101', '00966 55 123 4567', '050.123.4567']) {
    assert.equal(isPlausiblePhone(value), true, value);
  }
});

test('phone check rejects letters, too few and too many digits', () => {
  for (const value of ['abc', '12345', '0332abc5983', '1234567890123456', '+', '   ']) {
    assert.equal(isPlausiblePhone(value), false, value);
  }
});
