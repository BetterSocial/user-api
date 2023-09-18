let formatIdGetStream = require('./formatIdGetStream');

test(' formatIdGetStream', () => {
  expect(formatIdGetStream('THIS_SHOULD_BE_LOWER-CASE')).toBe('this_should_be_lower-case');
});
