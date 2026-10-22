const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: id => id === 'server-only' ? {} : mocks[id] ?? require(id),
    Date, Error, SyntaxError, URL, Request, Response, Buffer, process, console: { error() {} } });
  return exports;
}
const policy = load('src/lib/ai/editorial-policy.ts');
test('quoted hosting values and PEM line breaks normalize without changing keys', () => {
  const crypto = require('node:crypto');
  const env = load('src/lib/env.ts');
  assert.equal(env.envValue(' "https://example.upstash.io" '), 'https://example.upstash.io');
  const pem = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ format: 'pem', type: 'pkcs8' });
  for (const input of [pem, JSON.stringify(pem), "'" + pem.replace(/\n/g, '\\n') + "'"]) {
    assert.equal(crypto.createPrivateKey(env.pemEnvValue(input)).asymmetricKeyType, 'rsa');
  }
});
function article() {
  return {
    title: 'Architectural rendering for developers in Dubai',
    seoTitle: 'Architectural rendering in Dubai: a developer guide',
    description: 'Architectural rendering helps Dubai developers explain projects clearly. Learn how to plan views, compare deliverables and brief a visualization studio.',
    keywords: ['architectural rendering', 'rendering brief', 'exterior visualization', 'interior visualization', 'developer guide'],
    geoTerms: ['Dubai', 'UAE'], category: 'architecture',
    body: 'Architectural rendering explains a planned building before construction begins. Developers in Dubai, UAE can use clear views to communicate design decisions.\n\n## Planning the brief\nDefine the intended audience.\n\n## Local market considerations\nCheck local project requirements against authoritative sources.\n\n## Comparing deliverables\nReview the agreed scope.',
    faq: Array.from({ length: 4 }, (_, i) => ({ question: `What should a developer consider at stage ${i + 1}?`, answer: 'A developer should define the audience, clarify the design scope and agree which views are necessary before requesting a detailed proposal from a studio.' })),
    related: [],
  };
}
test('valid SEO and location fields pass; keyword, location and category drift fail', () => {
  const context = { keyword: 'architectural rendering', geo: 'Dubai, UAE', category: 'architecture' };
  assert.equal(policy.articlePolicyErrors(article(), context).length, 0);
  const invalid = article(); invalid.geoTerms = []; invalid.category = 'branding'; invalid.seoTitle = 'Unrelated';
  const errors = policy.articlePolicyErrors(invalid, context).join(' ');
  assert.match(errors, /primary keyword/); assert.match(errors, /Dubai/); assert.match(errors, /category/);
});
test('generic, malformed and keyword-mismatched topics fail before queuing', () => {
  assert.equal(policy.topicPolicyErrors('How architectural rendering supports developer decisions', 'architectural rendering').length, 0);
  assert(policy.topicPolicyErrors('Short', 'rendering').length > 0);
  assert(policy.topicPolicyErrors('A completely unrelated architectural topic', 'building surveys').length > 0);
});

test('queue respects existing topics and planner lease, and releases lease after failure', async () => {
  for (const mode of ['empty', 'queued', 'busy', 'failure']) {
    let suggestions = 0, added, released = false;
    const lock = { set: async () => { released = true; } };
    const db = { collection: name => name === 'siteBlogPlanner' ? { doc: () => lock } : { add: async data => { added = data; } },
      runTransaction: async fn => fn({ get: async () => ({ get: () => mode === 'busy' ? Date.now() + 60_000 : 0 }), set() {} }) };
    const queue = load('src/lib/ai/topic-queue.ts', {
      '@/lib/firebase/admin': { adminDb: () => db },
      '@/lib/generation': { listTopics: async () => mode === 'queued' ? [{ status: 'queued' }] : [] },
      './provider': { getProvider: () => ({}) },
      './auto-topic': { planAutoTopic: async () => { suggestions++; if (mode === 'failure') throw Error('AI unavailable'); return { topic: 'A researched topic' }; } },
    });
    if (mode === 'failure') { await assert.rejects(queue.ensureAutoTopicQueued()); assert(released); }
    else { await queue.ensureAutoTopicQueued(); }
    if (mode === 'empty') { assert.equal(added.status, 'queued'); assert.equal(added.source, 'auto'); }
    if (mode === 'busy' || mode === 'queued') assert.equal(suggestions, 0);
  }
});

test('scheduled endpoint rejects unauthorized calls, records skips and prevents replay', async () => {
  const previousSecret = process.env.CRON_SECRET; process.env.CRON_SECRET = 'test-secret';
  let result = {}, transactions = 0;
  const status = { set: async data => { result = { ...result, ...data }; } };
  const db = { collection: () => ({ doc: () => status }), runTransaction: async fn => { transactions++; return fn({
    get: async () => ({ get: key => result[key] }), set: (_ref, data) => { result = { ...result, ...data }; },
  }); } };
  const cron = load('src/app/api/cron/generate-blog/route.ts', {
    '@/lib/ai/auto-topic': {}, '@/lib/ai/generate-post': { aiConfigured: () => true },
    '@/lib/ai/provider': {}, '@/lib/ai/topic-queue': {},
    '@/lib/firebase/admin': { isFirebaseConfigured: true, adminDb: () => db },
    '@/lib/generation': {}, '@/lib/mailer': {}, '@/lib/posts': {},
    '@/lib/rate-limit': { checkRateLimit: async () => ({ allowed: false }) }, '@/lib/site-config': {},
  });
  try {
    assert.equal((await cron.GET(new Request('https://example.com'))).status, 401);
    assert.equal(transactions, 0);
    const request = () => new Request('https://example.com', { headers: { Authorization: 'Bearer test-secret' } });
    assert.match((await (await cron.GET(request())).json()).skipped, /limit/);
    assert.equal(result.state, 'skipped'); assert.equal(result.leaseUntil, 0);
    result.completedDay = new Date().toISOString().slice(0, 10);
    assert.match((await (await cron.GET(request())).json()).skipped, /complete/);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = previousSecret;
  }
});

test('a draft still failing mandatory checks after rewriting is never saved', async () => {
  let writes = 0, saves = 0;
  const states = [];
  const sources = ['https://one.example/a', 'https://two.example/b', 'https://two.example/c'].map(url => ({
    url, title: 'Research', page: { url, title: 'Research', text: 'Independent background information on project delivery.' },
  }));
  const provider = { name: 'gemini', model: 'mock', describeError: () => null,
    research: async () => ({ brief: 'Verified research facts. '.repeat(30), sources }),
    write: async () => { writes++; return article(); },
  };
  const generator = load('src/lib/ai/generate-post.ts', {
    './editorial-policy': policy,
    '@/lib/ai/provider': { aiConfigured: () => true, getProvider: () => provider },
    '@/lib/ai/safe-fetch': { fetchPageText: async () => null }, '@/lib/ai/similarity': load('src/lib/ai/similarity.ts'),
    '@/lib/ai/types': load('src/lib/ai/types.ts'), '@/lib/content-blocks': load('src/lib/content-blocks.ts'),
    '@/lib/generation': { getJob: async () => ({ topic: 'Rendering scope for developers', keyword: 'architectural rendering', geo: 'Dubai, UAE', category: 'architecture', seedUrls: [] }), updateJob: async (_id, state) => states.push(state) },
    '@/lib/internal-paths': { knownInternalPaths: async () => new Set(), normalizePath: p => p },
    '@/lib/legacy-seo': { blogCategories: [{ slug: 'architecture' }], legacySeoPages: [] },
    '@/lib/post-validation': { checkPost: async () => ({ errors: {}, warnings: [] }) },
    '@/lib/posts': { getPublishedPosts: async () => [], savePost: async () => { saves++; } },
    '@/lib/regions': { regionList: [] }, '@/lib/service-details': { servicePath: s => '/services/' + s },
    '@/lib/site-config': { offices: [], services: [], siteConfig: {} }, '@/lib/slug': {},
  });
  await assert.rejects(generator.runGeneration('test'), /failed SEO\/GEO checks/);
  assert.equal(writes, 2); assert.equal(saves, 0); assert.equal(states.at(-1).status, 'failed');
});

test('successful scheduled generation records completion and refills the queue', async () => {
  const secret = process.env.CRON_SECRET; process.env.CRON_SECRET = 'test-secret';
  let saved = {}, refills = 0, forwardedKeyword;
  const ref = { set: async patch => { saved = { ...saved, ...patch }; } };
  const db = { collection: () => ({ doc: () => ref }), runTransaction: async fn => fn({ get: async () => ({ get: () => undefined }), set() {} }) };
  const cron = load('src/app/api/cron/generate-blog/route.ts', {
    '@/lib/ai/auto-topic': {}, '@/lib/ai/generate-post': { aiConfigured: () => true, runGeneration: async () => 'post-id' },
    '@/lib/ai/provider': {}, '@/lib/ai/topic-queue': { ensureAutoTopicQueued: async () => { refills++; } },
    '@/lib/firebase/admin': { isFirebaseConfigured: true, adminDb: () => db },
    '@/lib/generation': { claimNextTopic: async () => ({ id: 'topic-id', topic: 'Rendering scope', keyword: 'architectural rendering' }),
      createJob: async input => { forwardedKeyword = input.keyword; return 'job-id'; }, finishTopic: async () => {} },
    '@/lib/mailer': { getMailer: () => null }, '@/lib/posts': { listPostsAdmin: async () => [], getPostAdmin: async () => null },
    '@/lib/rate-limit': { checkRateLimit: async () => ({ allowed: true }) }, '@/lib/site-config': {},
  });
  try {
    const response = await cron.GET(new Request('https://example.com', { headers: { Authorization: 'Bearer test-secret' } }));
    assert.equal((await response.json()).ok, true); assert.equal(saved.state, 'done');
    assert.equal(saved.completedDay, new Date().toISOString().slice(0, 10));
    assert.equal(forwardedKeyword, 'architectural rendering'); assert.equal(refills, 1);
  } finally { if (secret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = secret; }
});
