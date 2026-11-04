const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// Values built inside the loaded module come from another realm; compare them as plain data.
const plain = value => JSON.parse(JSON.stringify(value));
const seo = () => load('src/lib/ai/seo-checks.ts');

// ---- Building blocks -------------------------------------------------------------

test('a keyword counts with plurals and in any order; a place must appear as written', () => {
  const { mentionsKeyword, mentionsPlace } = seo();
  assert(mentionsKeyword('Interactive Master Plans Versus Flythroughs', 'interactive master plan'));
  assert(mentionsKeyword('How master plans become interactive', 'interactive master plan'), 'word order may change');
  assert(mentionsKeyword('Housing societies in Pakistan', 'housing society'));
  assert(!mentionsKeyword('Interactive tours for buyers', 'interactive master plan'));
  assert(mentionsPlace('Approvals in Islamabad and Rawalpindi', 'Islamabad'));
  assert(!mentionsPlace('Approvals in the capital', 'Islamabad'));
});

test('keyword density counts the phrase, plurals included, against all words', () => {
  const { keywordDensity } = seo();
  const text = `${'word '.repeat(196)}interactive master plans and an interactive master plan`;
  assert.deepEqual(plain(keywordDensity(text, 'interactive master plan')), { count: 2, words: 204, density: 1 });
});

test('flow measures average sentence length and over-long paragraphs', () => {
  const { flowStats } = seo();
  assert.deepEqual(plain(flowStats(['One two three. Four five six seven eight.', 'Nine ten.'])), { averageSentenceWords: 3.3, longParagraphs: 0 });
  assert.equal(flowStats(['word '.repeat(95)]).longParagraphs, 1);
});

// ---- The four findings -----------------------------------------------------------------

const paragraph = (extra = '') => `This short sentence explains one idea clearly. Another short sentence adds a detail for buyers. ${extra}`.trim();
const good = over => ({
  keyword: 'interactive master plan',
  description: 'Plan an interactive master plan for a housing society launch in Islamabad: what to build, how to stay compliant and how it lifts plot sales today.',
  headings: ['Key takeaways: interactive master plans', 'Interactive master plan features buyers expect', 'Approvals in Islamabad and Rawalpindi', 'Supporting overseas buyers from Pakistan'],
  paragraphs: [
    ...Array.from({ length: 30 }, (_, i) => paragraph(i % 6 === 0 ? 'An interactive master plan shows live plot availability.' : '')),
    'In short, an interactive master plan helps every launch sell with clarity.',
  ],
  faqQuestions: ['How long does an interactive master plan take?', 'Which approvals apply in Islamabad?'],
  geoTerms: ['Islamabad', 'Pakistan', 'Rawalpindi'],
  geo: 'Islamabad, Pakistan',
  coverAlt: 'Tablet showing an interactive master plan of a housing society in Islamabad',
  ...over,
});

test('an article that follows the rules has nothing to fix', () => {
  const { seoIssues } = seo();
  assert.deepEqual(plain(seoIssues(good())), []);
});

test('the published article\'s four problems are each caught', () => {
  const { seoIssues } = seo();
  const issues = seoIssues(good({
    description: 'Learn how to deploy an interactive master plan for housing society launches in Pakistan, ensuring CDA compliance, smooth tech integration, and sales growth.',
    headings: ['Key takeaways', 'Interactive Master Plans Versus Architectural Flythroughs', 'Aligning Deployments with Islamabad and Regional Regulations', 'Delivering Modern Real Estate Launches'],
    paragraphs: ['An interactive master plan helps.', ...Array.from({ length: 30 }, () => paragraph()), 'Modern launches need clear tools for buyers.'],
    faqQuestions: ['What is the difference between an interactive master plan and a flythrough?', 'Can it work offline?'],
    geoTerms: ['Islamabad', 'Pakistan'],
    coverAlt: 'A man wears VR in a sunlit modern villa with wood panels and glass walls overlooking a garden.',
  })).join('\n');
  assert.match(issues, /meta description is 156 characters/);
  assert.match(issues, /in at least 2 section headings; it is in 1/);
  assert.match(issues, /again in the closing section/);
  assert.match(issues, /cover image's alt text/);
  assert.match(issues, /at least 3 places in geoTerms/);
  assert.match(issues, /Name Islamabad or Pakistan in at least 2 section headings; only 1 does/);
  assert.match(issues, /FAQ question about Islamabad/);
});

test('flow and stuffing problems are caught, and density is only judged on real articles', () => {
  const { seoIssues } = seo();
  const long = 'This sentence keeps going and going with many many words that never seem to end before it finally reaches the full stop at last here.';
  const issues = seoIssues(good({ paragraphs: [...good().paragraphs, `${long} ${long} ${long} ${long}`] })).join('\n');
  assert.match(issues, /paragraph is over 90 words/);
  const stuffed = seoIssues(good({ paragraphs: Array.from({ length: 40 }, () => 'An interactive master plan here. Interactive master plan again.') })).join('\n');
  assert.match(stuffed, /keyword stuffing/);
  assert.match(stuffed, /Sentences average|keyword stuffing/);
  assert.deepEqual(plain(seoIssues(good({ paragraphs: ['An interactive master plan. An interactive master plan.'] })).filter(issue => /stuffing|appears/.test(issue))), [], 'a few lines are not judged on density');
  assert.equal(seoIssues(good({ description: 'Short' }), { description: false }).some(issue => /meta description/.test(issue)), false);
  assert.equal(seoIssues(good({ geo: undefined, geoTerms: [] })).some(issue => /geoTerms|headings; only|FAQ question about/.test(issue)), false, 'no location, no local checks');
});

test('a markdown body splits into headings and plain paragraphs', () => {
  const { splitMarkdownBody } = seo();
  const { headings, paragraphs } = splitMarkdownBody('Intro with a [link](/services) here.\n\n## First heading\nLine one.\nLine two.\n\n- a bullet\n- another\n\n### Sub heading\nText.');
  assert.deepEqual(plain(headings), ['First heading']);
  assert(paragraphs.includes('Intro with a link here.'));
  assert(paragraphs.includes('Line one. Line two.'));
  assert(paragraphs.includes('a bullet'));
});

// ---- Addresses, alt text, file names ----------------------------------------------------

test('article addresses keep the subject and the place, and never end on a joining word', () => {
  const { articleSlug, slugify } = load('src/lib/slug.ts');
  assert.equal(articleSlug('How to Deploy an Interactive Master Plan for Housing Society Launches in Pakistan'), 'deploy-interactive-master-plan-housing-society-launches-pakistan');
  assert.equal(articleSlug('How to Plan 3D Rendering Deliverables for Off-Plan Residential Launches in Riyadh'), 'plan-3d-rendering-deliverables-off-plan-residential-launches-riyadh');
  assert.equal(articleSlug('Al Sa\'fat Green Building Compliance in Dubai'), 'al-sa-fat-green-building-compliance-in-dubai', 'short titles are kept whole');
  assert.equal(slugify('How to Deploy an Interactive Master Plan for Housing Society Launches in Pakistan'), 'how-to-deploy-an-interactive-master-plan-for-housing-society-launches', 'the plain cut no longer ends on "in"');
  assert(articleSlug('a '.repeat(80) + 'Very Long Subject Words That Keep Going On And On For A Long While Here').length <= 70);
});

test('cover alt text names the keyword and place; the alt-text request asks for them only if true', () => {
  const { libraryCoverAlt, altTextPrompt, ALT_TEXT_PROMPT } = load('src/lib/ai/image-prompt.ts');
  assert.equal(libraryCoverAlt('Architectural visualization of residential towers at sunset.', 'interactive master plan', 'Islamabad'), 'Architectural visualization of residential towers at sunset, illustrating interactive master plan in Islamabad');
  assert.equal(libraryCoverAlt('A photo.', undefined, 'Islamabad'), 'A photo.');
  assert(libraryCoverAlt('x'.repeat(200), 'k').length <= 160);
  assert.match(altTextPrompt({ keyword: 'interactive master plan', place: 'Islamabad' }), /"interactive master plan" in Islamabad.*if it fits what the image shows/);
  assert.equal(altTextPrompt(), ALT_TEXT_PROMPT);
});

test('uploaded and generated covers get a readable file name from the title', () => {
  const { coverFileBase } = load('src/lib/storage.ts', { '@/lib/firebase/admin': { adminBucket: () => ({}), isFirebaseConfigured: true } });
  const base = coverFileBase('How to Deploy an Interactive Master Plan for Housing Society Launches in Pakistan');
  assert.match(base, /^how-to-deploy-an-interactive-master-plan/);
  assert(base.length <= 60);
  assert.doesNotMatch(base, /-(in|for|of|to)$/);
});

// ---- The editor's checklist -----------------------------------------------------------------

test('the editor shows the SEO checklist as advice, never as a blocker', async () => {
  const { checkPost } = load('src/lib/post-validation.ts', { '@/lib/internal-paths': { findUnknownPaths: async () => [], collectLinkedPaths: () => [] } });
  const post = {
    title: 'How to Deploy an Interactive Master Plan in Pakistan', seoTitle: 'Interactive Master Plan: Pakistan Society Launch Guide',
    description: 'Learn how to deploy an interactive master plan for housing society launches in Pakistan, ensuring CDA compliance, smooth tech integration, and sales growth.',
    categories: ['vr-real-estate'], faq: [{ question: 'Can it work offline?', answer: 'Yes.' }], related: [], sources: [],
    blocks: [{ type: 'h2', text: 'Key takeaways' }, { type: 'p', text: 'word '.repeat(300).trim() }],
    keywords: ['interactive master plan'], geoTerms: ['Islamabad', 'Pakistan'], geo: 'Islamabad, Pakistan',
    coverImage: { url: 'https://example.com/x.jpg', alt: 'A man wears VR in a villa.' },
  };
  const check = await checkPost(post);
  assert.deepEqual(plain(check.errors), {}, 'nothing here blocks publishing');
  assert(check.warnings.some(warning => /meta description is 156 characters: over 155/.test(warning)));
  assert(check.warnings.some(warning => /^SEO: Use the primary keyword/.test(warning)));
  assert(check.warnings.some(warning => /^SEO: The cover image's alt text/.test(warning)));
  assert(check.warnings.some(warning => /^SEO: Add at least one FAQ question about Islamabad/.test(warning)));
  const quiet = await checkPost({ ...post, seo: false });
  assert.equal(quiet.warnings.some(warning => warning.startsWith('SEO:')), false, 'the AI writer turns the advice off: it enforces the same rules itself');
});

test('the AI writer\'s gates enforce the same rules as rewrite reasons', () => {
  const policy = load('src/lib/ai/editorial-policy.ts');
  const article = {
    title: 'Interactive master plan for housing society launches in Islamabad', seoTitle: 'Interactive Master Plan: Pakistan Society Launch Guide',
    description: 'Learn how to deploy an interactive master plan for housing society launches in Pakistan, ensuring CDA compliance, smooth tech integration, and sales growth.',
    keywords: ['interactive master plan', 'b one', 'c two', 'd three', 'e four'], geoTerms: ['Islamabad', 'Pakistan'], category: 'vr-real-estate',
    body: 'An interactive master plan shows plots. Developers in Islamabad, Pakistan use it.\n\n## Key takeaways\n- One.\n\n## Local market considerations\nText.\n\n## Delivering launches\nText.',
    faq: Array.from({ length: 4 }, (_, i) => ({ question: `Question ${i + 1} about launches?`, answer: 'A clear and complete answer that explains the point in enough words to stand on its own for a reader.' })),
    related: [],
  };
  const errors = policy.articlePolicyErrors(article, { keyword: 'interactive master plan', geo: 'Islamabad, Pakistan', category: 'vr-real-estate' }).join('\n');
  assert.match(errors, /meta description is 156 characters/);
  assert.match(errors, /2 section headings; it is in 0/);
  assert.match(errors, /at least 3 places in geoTerms/);
  assert.match(errors, /FAQ question about Islamabad/);
});
