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
