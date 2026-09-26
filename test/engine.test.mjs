import test from 'node:test';
import assert from 'node:assert/strict';
import { compareGarments, validateMeasurements } from '../engine.mjs';

const reference = { chest: 54, length: 70, sleeve: 64 };
const items = [
  { name: 'Riverside', chest: 52, length: 68, sleeve: 63 },
  { name: 'Maple', chest: 56, length: 72, sleeve: 66 },
  { name: 'Pine', chest: 53, length: 71, sleeve: 65 },
];

test('orders by normalized dimensional differences, not original inventory order', () => {
  const ranked = compareGarments(reference, items);
  assert.deepEqual(ranked.map((item) => item.name), ['Pine', 'Riverside', 'Maple']);
  assert.deepEqual(ranked[0].differences, { chest: -1, length: 1, sleeve: 1 });
  assert.equal(ranked[0].label, 'Close measurements');
});

test('uses a stable tie break and never mutates the supplied inventory', () => {
  const copy = structuredClone(items);
  const ranked = compareGarments(reference, [items[0], { ...items[0], name: 'Second' }]);
  assert.deepEqual(ranked.map((item) => item.name), ['Riverside', 'Second']);
  assert.deepEqual(items, copy);
});

test('rejects absent and implausible measurements instead of implying a match', () => {
  assert.throws(() => validateMeasurements({ chest: '', length: 70, sleeve: 64 }), RangeError);
  assert.throws(() => compareGarments(reference, [{ name: 'Incomplete', chest: 52, length: 68 }]), RangeError);
  assert.throws(() => compareGarments(reference, Array(31).fill(items[0])), RangeError);
});
