const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const images = () => load('src/lib/ai/image-prompt.ts');

test('the cover prompt fits the article, the place and the rules against text, logos and real buildings', () => {
  const { buildImagePrompt } = images();
  const prompt = buildImagePrompt({ title: 'What drives 3D rendering cost in Riyadh', keyword: '3d rendering cost', geo: 'Riyadh, Saudi Arabia', category: '3d-visualization' });
  assert.match(prompt, /16:9/);
  assert.match(prompt, /architectural visualization of a contemporary building/);
  assert.match(prompt, /"What drives 3D rendering cost in Riyadh"/);
  assert.match(prompt, /suit Riyadh, Saudi Arabia .* without showing any real, recognisable building/);
  assert.match(prompt, /no text, letters, numbers, signage, logos/);
  assert.match(prompt, /No recognisable faces/);
});

test('the scene follows the service, and an editor description replaces it', () => {
  const { buildImagePrompt } = images();
  assert.match(buildImagePrompt({ title: 'Branding for real estate developers' }), /unbranded property brochures/);
  assert.match(buildImagePrompt({ title: 'Do 360 virtual tours sell off-plan homes?' }), /VR headset/);
  assert.match(buildImagePrompt({ title: 'Choosing interior finishes for a villa' }), /residential interior/);
  const custom = buildImagePrompt({ title: 'Any title', description: 'a courtyard villa at dusk' });
  assert.match(custom, /Show: a courtyard villa at dusk/);
  assert.doesNotMatch(custom, /It illustrates an article/);
  assert.match(buildImagePrompt({ title: 'General guide' }), /Keep the setting generic/);
});

test('alt text from the model is tidied, with a fallback from the article', () => {
  const { cleanAltText } = images();
  assert.equal(cleanAltText('Alt text: "Courtyard villa with palm trees at dusk."', { title: 'T' }), 'Courtyard villa with palm trees at dusk.');
  assert.equal(cleanAltText('Image of a villa', { title: 'Villa design guide', keyword: 'villa design' }), 'Illustration for villa design');
  assert.equal(cleanAltText(undefined, { title: 'Villa design guide' }), 'Illustration for Villa design guide');
  assert.equal(cleanAltText('x'.repeat(300), { title: 'Villa design guide' }), 'Illustration for Villa design guide');
  assert.equal(cleanAltText("Let's check elements: * building type", { title: 'Villa design guide' }), 'Illustration for Villa design guide', 'model notes are not alt text');
});
