const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const load = async () => import(pathToFileURL(path.join(root, 'scripts', 'cron.mjs')).href);

test('the cron runner calls the right route with the bearer secret', async () => {
  const { cronRequest } = await load();
  assert.deepEqual(cronRequest('blog-results', { CRON_SECRET: ' s3cret ' }), {
    url: 'https://mim.archi/api/cron/blog-results',
    headers: { authorization: 'Bearer s3cret' },
  });
  assert.equal(cronRequest('collect-ideas', { CRON_SECRET: 'x', SITE_URL: 'https://example.test/' }).url, 'https://example.test/api/cron/collect-ideas');
});

test('the cron runner refuses unknown jobs and a missing secret', async () => {
  const { cronRequest } = await load();
  assert.throws(() => cronRequest('drop-tables', { CRON_SECRET: 'x' }), /unknown job/);
  assert.throws(() => cronRequest(undefined, { CRON_SECRET: 'x' }), /unknown job/);
  assert.throws(() => cronRequest('blog-report', {}), /CRON_SECRET is not set/);
  assert.throws(() => cronRequest('blog-report', { CRON_SECRET: '   ' }), /CRON_SECRET is not set/);
});

test('every job in vercel.json has a cron runner job, and the build ships the runner', async () => {
  const fs = require('node:fs');
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const { cronRequest } = await load();
  for (const { path: route } of vercel.crons) {
    const job = route.replace('/api/cron/', '');
    assert.doesNotThrow(() => cronRequest(job, { CRON_SECRET: 'x' }), route);
  }
  const config = (await import(pathToFileURL(path.join(root, 'next.config.mjs')).href)).default;
  assert.deepEqual(config.outputFileTracingIncludes['/api/cron/*'], ['./scripts/cron.mjs']);
});
