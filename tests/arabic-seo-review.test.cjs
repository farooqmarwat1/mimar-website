const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./load.cjs');

const { serviceSeoAr } = load('src/lib/ar/service-metadata.ar.ts');
const { serviceDetailsAr } = load('src/lib/ar/service-details.ar.ts');

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|json)$/.test(entry.name) ? [full] : [];
  });
}

// "استوديوهات معمار" is a plural of things, so a verb or pronoun that refers to it is feminine
// singular: "تقدّم استوديوهات معمار", not "يقدّم" (Arabic review, SEO_MIGRATION.md point 36).
// The exception is a verb whose subject is something else, e.g. "عرض جوي متحرك يقدّم استوديوهات معمار"
// (an aerial film that introduces the studio), which is listed here.
test('verbs before the Arabic studio name agree with it', () => {
  const allowed = ['عرض جوي متحرك يقدّم استوديوهات معمار'];
  const wrong = /(?<![؀-ۿ])(?:ي[؀-ۿً-ْ]+|تأسس|بدأ) استوديوهات معمار|استوديوهات معمار هو /g;
  const hits = [];
  for (const file of sourceFiles(path.join(__dirname, '..', 'src'))) {
    let text = fs.readFileSync(file, 'utf8');
    for (const phrase of allowed) text = text.split(phrase).join('');
    for (const match of text.matchAll(wrong)) hits.push(`${path.relative(process.cwd(), file)}: ${match[0]}`);
  }
  assert.deepEqual(hits, []);
});

test('the three Arabic core service pages have full titles, descriptions and keyword H1s', () => {
  for (const slug of ['architectural-design', '3d-visualization', 'interactive-services']) {
    const seo = serviceSeoAr[slug];
    assert.ok(seo, `${slug} has an Arabic SEO entry`);
    assert.ok(seo.title.length >= 45 && seo.title.length <= 60, `${slug} Arabic title is ${seo.title.length} characters`);
    assert.ok(seo.description.length >= 120 && seo.description.length <= 160, `${slug} Arabic description is ${seo.description.length} characters`);
    assert.match(seo.title, /معمار$/, `${slug} Arabic title ends with the brand`);
    assert.doesNotMatch(`${seo.title} ${seo.description}`, /استوديو معمار/, `${slug} uses the studio's Arabic name استوديوهات معمار`);
    const heading = serviceDetailsAr[slug].heading;
    assert.ok(heading && heading.length > serviceDetailsAr[slug].title.length, `${slug} has an Arabic H1 longer than its short name`);
  }
  assert.match(serviceSeoAr['3d-visualization'].title, /الإظهار المعماري/);
});
