const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { getProjectStory, projectStoryLabels } = load('src/content/pages/project-stories.ts');
const { projects } = load('src/lib/site-config.ts');
const { localizeProject } = load('src/lib/localized-site.ts');
const { regions } = load('src/lib/regions.ts');
const { splitInlineLinks } = load('src/lib/content-blocks.ts');

const arabic = /[؀-ۿ]/;
const langs = ['en', 'ar'];
// Arrays from load() come from another realm, so copy them with Array.from before deepEqual.
const words = text => splitInlineLinks(text).map(part => part.text).join('');
// Arabic titles on the site use Eastern digits (نانا ٢٢٢); the copy uses Western ones, as people search.
const westernDigits = text => text.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660));
const allowedServices = [
  '/services/3d-visualization',
  '/services/architectural-design',
  '/services/architectural-design/interior-design-services',
  '/services/architectural-design/urban-planning',
];
const regionOf = slug => Object.values(regions).find(region => region.projectSlugs.includes(slug));

test('every project has a complete story in English and Arabic', () => {
  for (const project of projects) {
    // The cover is the hero (alt in project-alt.ts); every other image gets a caption and alt.
    const galleryImages = (project.gallery ?? []).filter(image => image !== project.cover);
    const arTitle = westernDigits(localizeProject(project, 'ar').title);
    for (const lang of langs) {
      const story = getProjectStory(project.slug, lang);
      const where = `${project.slug} (${lang})`;
      assert.ok(story, `${where} has a story`);
      assert.ok(story.heading && story.paragraphs.length >= 2, `${where} has a heading and an overview`);
      assert.ok(story.typology, `${where} has a typology`);
      assert.deepEqual(Array.from(story.views, view => view.image), Array.from(galleryImages), `${where} describes every gallery image, in order`);
      for (const view of story.views) {
        assert.ok(view.title && view.text, `${where} caption for ${view.image}`);
        assert.ok(view.alt.length >= 40 && view.alt.length <= 160, `${where} alt for ${view.image} is ${view.alt.length} characters`);
        if (lang === 'en') {
          assert.ok(view.alt.toLowerCase().startsWith(project.title.toLowerCase()), `${where} alt starts with the project name: ${view.alt}`);
        } else {
          const name = arTitle.split(' ').slice(0, 2).join(' ');
          assert.ok(westernDigits(view.alt).includes(name), `${where} alt names the project (${name}): ${view.alt}`);
        }
      }
      assert.ok(story.faqs.length >= 3 && story.faqs.every(faq => faq.question && faq.answer), `${where} has FAQs`);
      assert.ok(allowedServices.includes(story.service.path), `${where} links to a real service page: ${story.service.path}`);
      assert.ok(story.cta.heading1 && story.cta.heading2 && story.cta.body, `${where} has a call to action`);
      if (lang === 'ar') {
        const texts = [story.heading, ...story.paragraphs, ...story.views.flatMap(v => [v.title, v.text, v.alt]), ...story.faqs.flatMap(f => [f.question, f.answer])];
        assert.ok(texts.every(text => arabic.test(text)), `${where} is written in Arabic`);
      }
    }
  }
});

test('each overview links its service page and its country page once each', () => {
  for (const project of projects) {
    const region = regionOf(project.slug);
    for (const lang of langs) {
      const story = getProjectStory(project.slug, lang);
      const links = story.paragraphs.flatMap(text => splitInlineLinks(text).filter(part => part.href));
      const expected = [story.service.path, ...(region ? [region.path] : [])].sort();
      assert.deepEqual(Array.from(links, link => link.href).sort(), expected, `${project.slug} (${lang}) in-text links`);
      assert.ok(links.every(link => link.text.trim()), `${project.slug} (${lang}) links have anchor text`);
    }
  }
});

test('no two pages share a search title, description, alt text or FAQ question', () => {
  for (const lang of langs) {
    const stories = projects.map(project => getProjectStory(project.slug, lang));
    for (const [label, values] of [
      ['title', stories.map(s => s.seo.title)],
      ['description', stories.map(s => s.seo.description)],
      ['alt', stories.flatMap(s => s.views.map(v => v.alt))],
      ['FAQ question', stories.flatMap(s => s.faqs.map(f => f.question))],
    ]) {
      const seen = new Set();
      for (const value of values) {
        assert.ok(!seen.has(value), `${lang} ${label} is used twice: ${value}`);
        seen.add(value);
      }
    }
  }
});

test('search-result text keeps to the lengths Google shows, and names the project', () => {
  for (const project of projects) {
    for (const lang of langs) {
      const { seo } = getProjectStory(project.slug, lang);
      const where = `${project.slug} (${lang})`;
      assert.ok(seo.title.length >= 50 && seo.title.length <= 60, `${where} title is ${seo.title.length} characters`);
      assert.ok(seo.description.length >= 120 && seo.description.length <= 155, `${where} description is ${seo.description.length} characters`);
    }
    assert.ok(getProjectStory(project.slug, 'en').seo.title.toLowerCase().startsWith(project.title.toLowerCase()), `${project.slug} title starts with the name`);
    const arWords = westernDigits(localizeProject(project, 'ar').title).split(' ');
    assert.ok(arWords.some(word => getProjectStory(project.slug, 'ar').seo.title.includes(word)), `${project.slug} Arabic title names the project`);
  }
});

test('the copy makes no unprovable claims', () => {
  for (const project of projects) {
    const en = getProjectStory(project.slug, 'en');
    const text = [en.seo.title, en.seo.description, en.heading, ...en.paragraphs.map(words), ...en.faqs.flatMap(f => [f.question, f.answer])].join(' ');
    assert.ok(!/\b(best|award-winning|leading|number one|#1)\b/i.test(text), `${project.slug} has no "best"-style claim`);
  }
});

test('the CTA headings stay short enough for one line each, like the home page', () => {
  for (const project of projects) {
    const { cta } = getProjectStory(project.slug, 'en');
    assert.ok(cta.heading1.length <= 26 && cta.heading2.length <= 30, `${project.slug} CTA: "${cta.heading1}" / "${cta.heading2}"`);
  }
});

test('Aark Residences keeps its D7 keywords', () => {
  const en = getProjectStory('aark-residences', 'en');
  const text = [en.heading, ...en.paragraphs.map(words), ...en.faqs.flatMap(faq => [faq.question, faq.answer])].join(' ').toLowerCase();
  for (const keyword of ['aark residences', 'off-plan', 'modern residential rendering', 'residential development in the uae']) {
    assert.ok(text.includes(keyword), `uses "${keyword}"`);
  }
  const ar = getProjectStory('aark-residences', 'ar');
  assert.ok([...ar.paragraphs, ...ar.faqs.map(faq => faq.question)].join(' ').includes('على الخارطة'), 'Arabic says off-plan');
});

test('gallery and FAQ headings carry the project name', () => {
  assert.equal(projectStoryLabels.en.showcase('Aark Residences'), 'Aark Residences visual showcase');
  assert.equal(projectStoryLabels.en.faqs('Aark Residences'), 'Aark Residences FAQs');
  assert.match(projectStoryLabels.ar.faqs('آرك ريزيدنسز'), /آرك ريزيدنسز/);
});

// Width and height of a JPEG, read from its SOF marker (no image library needed).
function jpegSize(file) {
  const buf = require('node:fs').readFileSync(file);
  let i = 2;
  while (i < buf.length) {
    const marker = buf[i + 1];
    const length = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + length;
  }
  throw new Error(`no size in ${file}`);
}

test('every captioned render gets a box of its real shape (no letterbox around it)', () => {
  const path = require('node:path');
  const { galleryRatio } = load('src/content/pages/project-stories.ts');
  for (const project of projects) {
    for (const view of getProjectStory(project.slug, 'en').views) {
      const { width, height } = jpegSize(path.join(__dirname, '..', 'public', view.image));
      const [w, h] = galleryRatio(view.image).split('/').map(Number);
      assert.ok(Math.abs(width / height - w / h) < 0.02, `${view.image} is ${width}x${height} but its box is ${galleryRatio(view.image)}`);
    }
  }
});

test('the gallery alternates full-width renders and pairs, with no render left alone', () => {
  const { planGalleryRows, galleryRatioValue } = load('src/content/pages/project-stories.ts');
  for (const project of projects) {
    const images = (project.gallery ?? []).filter(image => image !== project.cover);
    const rows = Array.from(planGalleryRows(images), row => Array.from(row));
    assert.deepEqual(rows.flat(), Array.from(images), `${project.slug}: every render once, in order`);
    for (const [index, row] of rows.entries()) {
      assert.ok(row.length >= 1 && row.length <= 3, `${project.slug}: row ${index + 1} has ${row.length} renders`);
      if (row.length === 1 && images.length > 1) {
        assert.ok(galleryRatioValue(row[0]) >= 1.2, `${project.slug}: a tall render (${row[0]}) is not full width`);
        assert.ok(!rows[index - 1] || rows[index - 1].length > 1, `${project.slug}: two full-width rows in a row`);
      }
    }
  }
  // The rhythm on plain 16:9 sets of different sizes.
  const wide = n => Array.from({ length: n }, (_, i) => `/projects/catalog/x/image-${i + 1}.jpg`);
  const shape = n => Array.from(planGalleryRows(wide(n)), row => row.length).join(',');
  assert.equal(shape(1), '1');
  assert.equal(shape(2), '2');
  assert.equal(shape(3), '1,2');
  assert.equal(shape(4), '1,2,1');
  assert.equal(shape(5), '1,2,2');
  assert.equal(shape(6), '1,2,1,2');
  assert.equal(shape(8), '1,2,1,2,2');
});

test('a project without a story (a new CMS project) gets no story, so the page keeps the old layout', () => {
  assert.equal(getProjectStory('a-new-cms-project', 'en'), undefined);
  assert.equal(getProjectStory('a-new-cms-project', 'ar'), undefined);
});
