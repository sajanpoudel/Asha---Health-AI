import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeHtmlEntities,
  escapeHtml,
  stripHtmlAndFormatting,
  simplifyText,
  addNaturalPauses,
  formatAiResponse,
} from '../src/utils/textUtils.ts';

test('escapeHtml escapes every special character', () => {
  assert.equal(
    escapeHtml(`<a href="x">Tom & 'Jerry'</a>`),
    '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#039;Jerry&#039;&lt;/a&gt;'
  );
});

test('decodeHtmlEntities reverses escapeHtml', () => {
  const original = `5 < 6 & "quoted" 'text'`;
  assert.equal(decodeHtmlEntities(escapeHtml(original)), original);
});

test('decodeHtmlEntities leaves unknown entities alone', () => {
  assert.equal(decodeHtmlEntities('&unknown; text'), '&unknown; text');
});

test('stripHtmlAndFormatting removes tags and collapses spaces', () => {
  assert.equal(stripHtmlAndFormatting('<p>Hello   <strong>world</strong></p>\n'), 'Hello world');
});

test('simplifyText swaps complex words for simple ones', () => {
  const result = simplifyText('We utilize this approach regarding sleep.');
  assert.match(result, /We use this approach about sleep\./);
});

test('simplifyText adds pause markers', () => {
  assert.match(simplifyText('Drink water, rest well.'), /<break time="\d+ms"\/>/);
});

test('decodeHtmlEntities decodes numeric apostrophes and spaces', () => {
  assert.equal(decodeHtmlEntities("it&#039;s&nbsp;fine"), "it's fine");
});

test('escapeHtml leaves plain text untouched', () => {
  assert.equal(escapeHtml('Plain text 123'), 'Plain text 123');
});

test('stripHtmlAndFormatting decodes entities after removing tags', () => {
  assert.equal(stripHtmlAndFormatting('<b>Tom &amp; Jerry</b>'), 'Tom & Jerry');
});

test('addNaturalPauses adds a pause after every sentence', () => {
  const result = addNaturalPauses('Drink water. Rest well.');
  assert.equal(result.match(/<break time="400ms"\/>/g)?.length, 2);
});

test('addNaturalPauses adds short pauses after commas', () => {
  assert.match(addNaturalPauses('Eat, sleep, repeat.'), /, <break time="200ms"\/>/);
});

test('simplifyText turns list items into pauses', () => {
  const result = simplifyText('1. Drink water');
  assert.ok(result.includes('Drink water <break time="500ms"/>'));
});

test('simplifyText strips tags before simplifying', () => {
  assert.ok(!simplifyText('<p>Please utilize this</p>').includes('<p>'));
});

test('formatAiResponse removes emotional cues in em tags', () => {
  assert.ok(!formatAiResponse('<em>smiling</em> Hello').includes('smiling'));
});
