const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const { splitInlineLinks, stripInlineLinks, blocksToPlainText, blocksToHtml, countWords, parseBlocks } = load('src/lib/content-blocks.ts');

// Parts come from another realm, so compare plain copies.
const plain = parts => Array.from(parts, part => ({ ...part }));

test('**bold** becomes a bold part and the asterisks are gone', () => {
  assert.deepEqual(plain(splitInlineLinks('**Warmth and light.** Warm color temperatures read as welcoming.')), [
    { text: 'Warmth and light.', bold: true },
    { text: ' Warm color temperatures read as welcoming.' },
  ]);
});

test('bold in the middle and at the end of a sentence', () => {
  assert.deepEqual(plain(splitInlineLinks('Use **soft light** and **wood**')), [
    { text: 'Use ' },
    { text: 'soft light', bold: true },
    { text: ' and ' },
    { text: 'wood', bold: true },
  ]);
});

test('bold can hold a link, and a link keeps working next to bold', () => {
  assert.deepEqual(plain(splitInlineLinks('See **[our services](/services)** and [projects](/projects)')), [
    { text: 'See ' },
    { text: 'our services', href: '/services', bold: true },
    { text: ' and ' },
    { text: 'projects', href: '/projects' },
  ]);
});

test('a stray or unbalanced ** is left as text, never swallowing the paragraph', () => {
  assert.deepEqual(plain(splitInlineLinks('Five ** stars')), [{ text: 'Five ** stars' }]);
  assert.deepEqual(plain(splitInlineLinks('Unclosed **bold text')), [{ text: 'Unclosed **bold text' }]);
  assert.deepEqual(plain(splitInlineLinks('2 ** 3 and 4 ** 5')), [{ text: '2 ** 3 and 4 ** 5' }]);
});

test('text with no bold or link is a single plain part, as before', () => {
  assert.deepEqual(plain(splitInlineLinks('Just a sentence.')), [{ text: 'Just a sentence.' }]);
});

test('external links are still never turned into links', () => {
  assert.deepEqual(plain(splitInlineLinks('**[x](//evil.com)**')), [{ text: '[x](//evil.com)', bold: true }]);
});

test('plain text, word count and JSON-LD HTML carry no asterisks', () => {
  const blocks = parseBlocks('- **Warmth and light.** Warm light feels safe.\n\nUsed with **care**.');
  assert.equal(stripInlineLinks('**Bold** and [link](/a)'), 'Bold and link');
  assert.equal(blocksToPlainText(blocks).includes('*'), false);
  assert.equal(blocksToHtml(blocks).includes('*'), false);
  assert.equal(countWords(blocks), 10);
});
