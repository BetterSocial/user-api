const { POST_TYPE_STANDARD } = require('./constants');
const { MAX_FEED_FETCH_LIMIT } = require('./constants');
const { POST_VERB_POLL } = require('./constants');


test('constant POST_TYPE_STANDARD', () => {
    expect(POST_TYPE_STANDARD).toBe(0);
});

test('constant MAX_FEED_FETCH_LIMIT', () => {
    expect(MAX_FEED_FETCH_LIMIT).toBe(10);
});


test('constant POST_VERB_POLL', () => {
    expect(POST_VERB_POLL).toBe("poll");
});
