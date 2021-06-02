const { checkMoreOrLess } = require('./checkMoreOrLess');

test('< 25 should returns < 25', () => {
  expect(checkMoreOrLess(15)).toBe("< 25");
});

test('> 25 and < 50 should returns > 25', () => {
  expect(checkMoreOrLess(27)).toBe("> 25");
});

test('> 50 and < 100 should returns > 50', () => {
  expect(checkMoreOrLess(56)).toBe("> 50");
});