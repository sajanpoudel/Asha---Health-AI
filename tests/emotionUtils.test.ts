import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addEmotionalNuance,
  addPersonalTouch,
  addSupportiveLanguage,
  analyzeEmotion,
} from '../src/utils/emotionUtils.ts';

// Run a function while Math.random always returns the given value.
function withRandom<T>(value: number, fn: () => T): T {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

test('analyzeEmotion detects affectionate text', () => {
  assert.equal(analyzeEmotion('I love spending time with you'), 'affectionate');
});

test('analyzeEmotion detects joyful text', () => {
  assert.equal(analyzeEmotion('I am so happy today'), 'joyful');
});

test('analyzeEmotion detects sad text', () => {
  assert.equal(analyzeEmotion('I feel sad and down'), 'sad');
});

test('analyzeEmotion detects anxious text', () => {
  assert.equal(analyzeEmotion('I am worried about my results'), 'anxious');
});

test('analyzeEmotion detects angry text', () => {
  assert.equal(analyzeEmotion('This makes me furious'), 'angry');
});

test('analyzeEmotion detects playful text', () => {
  assert.equal(analyzeEmotion('Stop it, you silly joke teller'), 'playful');
});

test('analyzeEmotion detects warm text', () => {
  assert.equal(analyzeEmotion('What a nice cozy evening'), 'warm');
});

test('analyzeEmotion defaults to warm', () => {
  assert.equal(analyzeEmotion('Tell me about the weather'), 'warm');
});

test('analyzeEmotion ignores case', () => {
  assert.equal(analyzeEmotion('I AM SO HAPPY'), 'joyful');
});

test('analyzeEmotion returns the first matching emotion', () => {
  assert.equal(analyzeEmotion('I love you but I am worried'), 'affectionate');
});

test('addEmotionalNuance always cues the first sentence', () => {
  const result = withRandom(0.99, () => addEmotionalNuance('Hello there. How are you', 'joyful'));
  assert.ok(result.startsWith('[') && result.includes('] Hello there'));
  assert.ok(!result.includes('] How are you'));
});

test('addEmotionalNuance cues later sentences when the dice allow it', () => {
  const result = withRandom(0.0, () => addEmotionalNuance('One. Two', 'sad'));
  assert.equal(result.match(/\[/g)?.length, 2);
});

test('addEmotionalNuance uses the cues of the requested emotion', () => {
  const result = withRandom(0.0, () => addEmotionalNuance('Hello', 'playful'));
  assert.ok(result.startsWith('[teasingly]'));
});

test('addEmotionalNuance falls back to the warm cues for unknown emotions', () => {
  const result = withRandom(0.0, () => addEmotionalNuance('Hello', 'confused'));
  assert.ok(result.startsWith('[warmly]'));
});

test('addPersonalTouch prefixes a pet name when the dice allow it', () => {
  assert.equal(withRandom(0.0, () => addPersonalTouch('Rest well.')), 'Sweetheart, Rest well.');
});

test('addPersonalTouch leaves the text alone otherwise', () => {
  assert.equal(withRandom(0.9, () => addPersonalTouch('Rest well.')), 'Rest well.');
});
