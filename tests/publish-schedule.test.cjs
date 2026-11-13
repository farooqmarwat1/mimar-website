const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const plain = value => JSON.parse(JSON.stringify(value));

test('the schedule runs on Pakistan dates and skips weekends', () => {
  const { karachiDay, isKarachiWeekday, weekdayDates } = load('src/lib/publish-schedule.ts');
  // 20:30 UTC on Friday is already Saturday in Pakistan (UTC+5).
  assert.equal(karachiDay(new Date('2026-11-13T20:30:00Z')), '2026-11-14');
  assert.equal(isKarachiWeekday(new Date('2026-11-13T12:00:00Z')), true, 'Friday');
  assert.equal(isKarachiWeekday(new Date('2026-11-13T20:30:00Z')), false, 'already Saturday in Pakistan');
  assert.deepEqual(plain(weekdayDates('2026-11-13', 4)), ['2026-11-13', '2026-11-16', '2026-11-17', '2026-11-18']);
  assert.deepEqual(plain(weekdayDates('2026-11-14', 1)), ['2026-11-16'], 'a weekend start moves to Monday');
});

test('one post is due at a time: the earliest whose date has come', () => {
  const { nextDue } = load('src/lib/publish-schedule.ts');
  const posts = [{ id: 'c', scheduledFor: '2026-11-18' }, { id: 'a', scheduledFor: '2026-11-16' }, { id: 'b', scheduledFor: '2026-11-17' }, { id: 'x' }];
  assert.equal(nextDue(posts, '2026-11-15'), null, 'nothing due before its date');
  assert.equal(nextDue(posts, '2026-11-17').id, 'a', 'a missed day publishes the oldest first');
  assert.equal(nextDue(posts.filter(post => post.id !== 'a'), '2026-11-17').id, 'b');
});
