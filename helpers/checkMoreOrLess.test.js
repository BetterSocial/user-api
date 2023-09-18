const {checkMoreOrLess} = require('./checkMoreOrLess');

test('< 25 should returns < 25', () => {
  expect(checkMoreOrLess(15)).toBe('< 25');
});

test('> 25 and < 50 should returns > 25', () => {
  expect(checkMoreOrLess(27)).toBe('> 25');
});

test('> 50 and < 100 should returns > 50', () => {
  expect(checkMoreOrLess(56)).toBe('> 50');
});

test('> 100 && val < 250', () => {
  expect(checkMoreOrLess(137)).toBe('> 100');
});

test('> 250 && val < 500', () => {
  expect(checkMoreOrLess(255)).toBe('> 250');
});

test('> 500 && val < 1000', () => {
  expect(checkMoreOrLess(525)).toBe('> 500');
});

test('> 1000 && val < 2000', () => {
  expect(checkMoreOrLess(1997)).toBe('> 1000');
});

test('> 2000 && val < 5000', () => {
  expect(checkMoreOrLess(2010)).toBe('> 2000');
});

test('> 5000 && val < 10000', () => {
  expect(checkMoreOrLess(9919)).toBe('> 5000');
});

test('> 10000 && val < 15000', () => {
  expect(checkMoreOrLess(14045)).toBe('> 10000');
});

test('> 15000 && val < 20000', () => {
  expect(checkMoreOrLess(17845)).toBe('> 15000');
});

test('> 20000 && val < 30000', () => {
  expect(checkMoreOrLess(29753)).toBe('> 20000');
});

test('> 40000 && val < 100000', () => {
  expect(checkMoreOrLess(50227)).toBe('> 40000');
});

test('> 100000 && val < 150000', () => {
  expect(checkMoreOrLess(120564)).toBe('> 100000');
});

test('> 150000 && val < 200000', () => {
  expect(checkMoreOrLess(170845)).toBe('> 150000');
});

test('> 200000 && val < 300000', () => {
  expect(checkMoreOrLess(201096)).toBe('> 200000');
});

test('> 300000 && val < 400000', () => {
  expect(checkMoreOrLess(310396)).toBe('> 300000');
});

test('> 400000 && val < 1000000', () => {
  expect(checkMoreOrLess(970525)).toBe('> 400000');
});

test('val > 1000000', () => {
  expect(checkMoreOrLess(3120000)).toBe('> 1000000');
});
