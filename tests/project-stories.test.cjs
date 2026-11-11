const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { getProjectStory, projectStoryLabels } = load('src/content/pages/project-stories.ts');
const { projects } = load('src/lib/site-config.ts');
const { regions } = load('src/lib/regions.ts');
const { splitInlineLinks } = load('src/lib/content-blocks.ts');

const arabic = /[؀-ۿ]/;
// Arrays from load() come from another realm, so copy them with Array.from before deepEqual.
const words = text => splitInlineLinks(text).map(part => part.text).join('');

test('the Aark Residences story is complete in English and Arabic', () => {
  const aark = projects.find(project => project.slug === 'aark-residences');
  // The cover is the hero (alt in project-alt.ts); every other image gets a caption and alt.
  const galleryImages = aark.gallery.filter(image => image !== aark.cover);
  for (const lang of ['en', 'ar']) {
    const story = getProjectStory('aark-residences', lang);
    assert.ok(story, `${lang} story exists`);
    assert.ok(story.heading && story.paragraphs.length >= 2, `${lang} has a heading and an overview`);
    assert.deepEqual(Array.from(story.views, view => view.image), Array.from(galleryImages), `${lang} describes every gallery image, in order`);
    for (const view of story.views) {
      assert.ok(view.title && view.text, `${lang} caption for ${view.image}`);
      assert.ok(view.alt.length >= 40 && view.alt.length <= 160, `${lang} alt for ${view.image} is ${view.alt.length} characters`);
      assert.match(view.alt, lang === 'ar' ? /آرك ريزيدنسز/ : /^Aark Residences/, `${lang} alt names the project`);
    }
    assert.equal(new Set(story.views.map(view => view.alt)).size, story.views.length, `${lang} alt texts are all different`);
    assert.ok(story.faqs.length >= 3 && story.faqs.every(faq => faq.question && faq.answer), `${lang} has FAQs`);
    assert.ok(story.service.path.startsWith('/services/'), `${lang} links to a service page`);
    assert.ok(story.cta.heading1 && story.cta.heading2 && story.cta.body, `${lang} has a call to action`);
  }
  const ar = getProjectStory('aark-residences', 'ar');
  assert.match(ar.heading, arabic, 'Arabic heading is Arabic');
  assert.ok(ar.paragraphs.every(text => arabic.test(text)), 'Arabic overview is Arabic');
  assert.ok(ar.views.every(view => arabic.test(view.alt) && arabic.test(view.text)), 'Arabic captions and alts are Arabic');
});

test('the overview links the service page and the country page once each', () => {
  for (const lang of ['en', 'ar']) {
    const story = getProjectStory('aark-residences', lang);
    const links = story.paragraphs.flatMap(text => splitInlineLinks(text).filter(part => part.href));
    assert.deepEqual(
      Array.from(links, link => link.href).sort(),
      [regions.uae.path, story.service.path].sort(),
      `${lang} in-text links`,
    );
    assert.ok(links.every(link => link.text.trim()), `${lang} links have anchor text`);
  }
});

test('the D7 keywords are used, and the sheet\'s claim is not', () => {
  const en = getProjectStory('aark-residences', 'en');
  const text = [en.heading, ...en.paragraphs.map(words), ...en.faqs.flatMap(faq => [faq.question, faq.answer])].join(' ').toLowerCase();
  for (const keyword of ['aark residences', 'off-plan', 'modern residential rendering', 'residential development in the uae']) {
    assert.ok(text.includes(keyword), `uses "${keyword}"`);
  }
  assert.ok(!text.includes('best residential project'), 'no unprovable "best project" claim');
  const ar = getProjectStory('aark-residences', 'ar');
  assert.ok([...ar.paragraphs, ...ar.faqs.map(faq => faq.question)].join(' ').includes('على الخارطة'), 'Arabic says off-plan');
});

test('search-result text keeps to the lengths Google shows, and names the project', () => {
  for (const lang of ['en', 'ar']) {
    const { seo } = getProjectStory('aark-residences', lang);
    assert.ok(seo.title.length >= 50 && seo.title.length <= 60, `${lang} title is ${seo.title.length} characters`);
    assert.ok(seo.description.length >= 120 && seo.description.length <= 155, `${lang} description is ${seo.description.length} characters`);
  }
  assert.match(getProjectStory('aark-residences', 'en').seo.title, /^Aark Residences/);
});

test('gallery and FAQ headings carry the project name', () => {
  assert.equal(projectStoryLabels.en.showcase('Aark Residences'), 'Aark Residences visual showcase');
  assert.equal(projectStoryLabels.en.faqs('Aark Residences'), 'Aark Residences FAQs');
  assert.match(projectStoryLabels.ar.faqs('آرك ريزيدنسز'), /آرك ريزيدنسز/);
});

test('a project without a story keeps the old layout', () => {
  assert.equal(getProjectStory('abuja', 'en'), undefined);
  assert.equal(getProjectStory('abuja', 'ar'), undefined);
});
