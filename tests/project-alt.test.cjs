const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { projectCoverAlt, projectGalleryAlt } = load('src/lib/project-alt.ts');
const { projects } = load('src/lib/site-config.ts');

test('every portfolio project has its own cover alt text in English and Arabic, never the old "by Mimar Studios" pattern', () => {
  assert.equal(projects.length, 19);
  const seen = new Set();
  for (const project of projects) {
    for (const lang of ['en', 'ar']) {
      const alt = projectCoverAlt(project, lang);
      assert.ok(alt.length > 60, `${project.slug} (${lang}) alt text is descriptive`);
      assert.ok(!alt.includes('by Mimar Studios') && !alt.includes('من استوديوهات معمار'), `${project.slug} (${lang}) is not the fallback sentence`);
      assert.ok(!seen.has(alt), `${project.slug} (${lang}) alt text is unique`);
      seen.add(alt);
    }
    assert.match(projectCoverAlt(project, 'ar'), /[؀-ۿ]/, `${project.slug} Arabic alt is Arabic`);
  }
});

test('a project that is not in the list (a new CMS project) falls back to name, type and place', () => {
  const project = { slug: 'brand-new', title: 'Brand New', category: '3D Visualization', location: 'Dubai, UAE' };
  assert.equal(projectCoverAlt(project, 'en'), 'Brand New - 3D Visualization by Mimar Studios in Dubai, UAE');
  assert.match(projectCoverAlt(project, 'ar'), /^Brand New - 3D Visualization من استوديوهات معمار في Dubai, UAE$/);
});

test('gallery alt text names the project, the work and the place, and numbers the view', () => {
  const project = { slug: 'abuja', title: 'Abuja', category: 'Interior Design', location: 'Abuja, Nigeria' };
  assert.equal(projectGalleryAlt(project, 'en', 3), 'Abuja - Interior Design in Abuja, Nigeria - view 3');
  assert.match(projectGalleryAlt(project, 'ar', 3), /منظر 3$/);
});
