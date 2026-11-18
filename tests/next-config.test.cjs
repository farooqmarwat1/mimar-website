const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { load } = require('./load.cjs');

const root = path.join(__dirname, '..');
const { withTrailingSlash } = load('src/lib/trailing-slash.ts');

const loadConfig = async () => (await import(pathToFileURL(path.join(root, 'next.config.mjs')).href)).default;

// next.config.mjs holds its own copy of withTrailingSlash (a .mjs config cannot import a .ts file, and
// Hostinger's WebAssembly compiler cannot load a .ts config at all). These tests keep the copy honest.

test('there is one config file, next.config.mjs, not a TypeScript one next to it', () => {
  assert.ok(fs.existsSync(path.join(root, 'next.config.mjs')));
  assert.ok(!fs.existsSync(path.join(root, 'next.config.ts')), 'two configs would confuse Next');
});

test('the config is plain JavaScript (no import of a .ts file)', () => {
  const text = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8');
  assert.ok(!/^import\s.+\.ts["']/m.test(text) && !/from\s+["'][^"']*src\/lib\/[^"']*["']/.test(text), 'a .mjs config must not import app source');
});

test('every legacy redirect points straight at its final URL with a trailing slash, as the TypeScript helper says', async () => {
  const config = await loadConfig();
  const rules = await config.redirects();
  // Pages only: a redirect to a file (the .jpg -> .webp render rule) keeps its exact path.
  const internal = rules.filter((rule) => rule.destination.startsWith('/') && !/\.[a-z0-9]+$/i.test(rule.destination));
  assert.ok(internal.length > 30, `expected the legacy rules, got ${internal.length}`);
  for (const rule of internal) {
    assert.equal(rule.destination, withTrailingSlash(rule.destination), `${rule.source} -> ${rule.destination}`);
    assert.ok(rule.destination.endsWith('/'), `${rule.source} -> ${rule.destination} has no trailing slash`);
    assert.equal(rule.permanent, true);
  }
  // Each legacy rule exists with and without the slash.
  const sources = new Set(rules.map((rule) => rule.source));
  assert.ok(sources.has('/our-portfolio') && sources.has('/our-portfolio/'));
  assert.ok(sources.has('/contact-us') && sources.has('/contact-us/'));
});

test('trailing-slash settings and the noindex rule for the Hostinger test domain are intact', async () => {
  const config = await loadConfig();
  assert.equal(config.trailingSlash, true);
  assert.equal(config.skipTrailingSlashRedirect, true);
  const headers = await config.headers();
  const hostinger = headers.find((rule) => rule.has?.some((h) => h.type === 'host' && /hostingersite/.test(h.value)));
  assert.ok(hostinger, 'the *.hostingersite.com noindex rule is missing');
  assert.deepEqual(hostinger.headers, [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]);
  // mim.archi itself must never match a noindex host rule.
  for (const rule of headers.filter((r) => r.has?.some((h) => h.type === 'host'))) {
    for (const h of rule.has) assert.ok(!new RegExp(`^${h.value}$`).test('mim.archi'), `${h.value} matches mim.archi`);
  }
});

test('the self-hosting build script uses webpack', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['build:selfhost'], 'next build --webpack');
  assert.equal(pkg.scripts.build, 'next build', 'the Vercel build stays on the default bundler');
});
