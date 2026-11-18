const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const plain = value => JSON.parse(JSON.stringify(value));
const research = () => load('src/lib/ai/keyword-research.ts');
const briefs = () => load('src/lib/ai/blog-brief.ts');
const seo = () => load('src/lib/ai/seo-checks.ts');
const CATEGORIES = ['3d-visualization', 'vr-real-estate', 'architecture', 'real-estate-tech'];

test("a competitor title splits into the keywords inside it, as in the SEO consultant's example", () => {
  const { keywordCandidates } = research();
  const found = keywordCandidates('Why US Real Estate Developers Are Investing More in Architectural Visualization', 40);
  for (const phrase of ['us real estate developers', 'real estate developers', 'architectural visualization']) assert.ok(found.includes(phrase), phrase);
  assert.ok(!found.some(phrase => /^(why|in|are|more) | (in|are|more)$/.test(phrase)), 'no keyword starts or ends on a filler word');
  assert.ok(!keywordCandidates('8 Top Rendering Techniques: The Ultimate Guide 2024').some(phrase => /\b(8|2024)\b/.test(phrase)), 'listicle counts and years are dropped');
  assert.ok(keywordCandidates('360 virtual tours for off-plan sales').includes('360 virtual tours'), '360 is part of a search');
});

test('keywords are scored on demand against difficulty, and the winner must show real demand', () => {
  const { scoreCandidate, pickResearchKeyword } = research();
  const demanded = scoreCandidate({ keyword: 'architectural visualization', autocomplete: true, suggestions: 6, impressions: 900, competitors: 3 });
  const crowded = scoreCandidate({ keyword: '3d rendering services', autocomplete: true, suggestions: 6, impressions: 900, competitors: 9 });
  const offTopic = scoreCandidate({ keyword: 'us real estate developers', autocomplete: true, suggestions: 6, impressions: 900, competitors: 0 });
  const silent = scoreCandidate({ keyword: 'architectural visualization trends', autocomplete: false, suggestions: 0, impressions: 0, competitors: 0 });
  assert.ok(demanded.score > crowded.score, 'more competitor coverage lowers the score');
  assert.equal(offTopic.onTopic, false);
  assert.ok(demanded.demand > 0 && demanded.difficulty === 36);
  assert.equal(pickResearchKeyword([offTopic, silent, crowded, demanded]).keyword, 'architectural visualization');
  assert.equal(pickResearchKeyword([offTopic, silent]), null, 'no demand and off topic: nothing is picked');
});

test('candidate titles are rechecked against competitors and our own articles', () => {
  const { recheckTitles, chooseTitle } = research();
  const competitors = [{ title: 'Why Real Estate Developers Invest in Architectural Visualization', url: 'https://example.com/a' }];
  const checks = recheckTitles(
    [
      'Why Real Estate Developers Invest in Architectural Visualization',
      'Architectural Visualization Budgets: What US Developers Should Plan For',
      'Architectural Visualization for Zoning Board Presentations in the USA',
      'A title without the phrase',
      'Our Existing Architectural Visualization Guide',
    ],
    'architectural visualization',
    competitors,
    ['Our Existing Architectural Visualization Guide'],
  );
  assert.deepEqual(plain(checks.map(check => check.ok)), [false, true, true, false, false]);
  assert.match(checks[0].reason, /competitor already published/);
  assert.match(checks[4].reason, /we already have/);
  const chosen = chooseTitle(checks);
  assert.ok(chosen && checks.find(check => check.title === chosen.title).ok);
  assert.equal(chosen.alternates.length, 1);
  assert.equal(chooseTitle(checks.filter(check => !check.ok)), null);
});

test('a typed outline becomes H2 and H3 headings, and a brief is checked before it is queued', () => {
  const { parseOutline, normalizeBrief, briefProblems, missingSections } = briefs();
  assert.deepEqual(plain(parseOutline('H2: First section\n  ○ H3: A sub-section\n## Second\n### Third\nPlain line')), [
    { level: 2, text: 'First section' },
    { level: 3, text: 'A sub-section' },
    { level: 2, text: 'Second' },
    { level: 3, text: 'Third' },
    { level: 2, text: 'Plain line' },
  ]);
  const brief = normalizeBrief({ title: 'Short', keyword: 'one', outline: 'H2: A', ctaPath: 'https://evil.example', category: 'nope', seoTitle: 'Too short', description: 'Too short' });
  const problems = briefProblems(brief, CATEGORIES).join(' ');
  for (const part of ['12-120 characters', '2-6 words', 'SEO title is', 'meta description is', 'at least 3 sections', 'path on our site', 'four blog categories']) assert.match(problems, new RegExp(part));
  const loose = normalizeBrief({ title: 'Real Estate Rendering in Dubai: Top Trends', keyword: 'real estate rendering dubai', outline: 'H2: A\nH2: B\nH2: C', ctaPath: '/x', category: '3d-visualization' });
  assert.match(briefProblems(loose, CATEGORIES).join(' '), /word for word/, 'the article gates want the keyword exactly, so "in Dubai" matters');
  const good = normalizeBrief({ title: 'Real Estate Rendering in Dubai: Top Trends', keyword: 'Real Estate Rendering in Dubai', outline: 'H2: Trends in Dubai\nH2: Lighting\nH2: Animation', ctaPath: '/3d-visualization-services-uae/', category: '3d-visualization' });
  assert.equal(good.keyword, 'real estate rendering in dubai');
  assert.equal(good.ctaPath, '/3d-visualization-services-uae');
  assert.deepEqual(plain(briefProblems(good, CATEGORIES)), []);
  assert.deepEqual(plain(missingSections(good, ['Trends in Dubai for 2027', 'Cinematic Animation'])), ['Lighting']);
});

test('every Deliverable 6 brief passes the article gates as written', () => {
  const { normalizeBrief, briefProblems } = briefs();
  const { mentionsKeyword, mentionsPlace } = seo();
  const data = require('../src/content/briefs/deliverable-6.json');
  assert.equal(data.briefs.length, 16);
  assert.equal(new Set(data.briefs.map(brief => brief.keyword)).size, 16, 'no two briefs share a primary keyword');
  for (const raw of data.briefs) {
    const brief = normalizeBrief(raw);
    assert.deepEqual(plain(briefProblems(brief, CATEGORIES)), [], brief.ref);
    const sections = brief.outline.filter(heading => heading.level === 2).map(heading => heading.text);
    assert.ok(sections.filter(heading => mentionsKeyword(heading, brief.keyword)).length >= 2, `${brief.ref}: keyword in 2 sections`);
    if (brief.geo) {
      const places = brief.geo.split(',').map(place => place.trim());
      const [city, country] = [places[0], places.length > 1 ? places[places.length - 1] : undefined];
      assert.ok(sections.filter(heading => mentionsPlace(heading, city) || (country && mentionsPlace(heading, country))).length >= 2, `${brief.ref}: place in 2 sections`);
    }
    assert.ok(brief.ar.seoTitle.includes(brief.ar.keyword) && brief.ar.description.includes(brief.ar.keyword), `${brief.ref}: Arabic meta uses the Arabic keyword`);
  }
});
