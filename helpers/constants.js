const POST_TYPE_STANDARD = 0;
const POST_TYPE_POLL = 1;
const POST_TYPE_LINK = 2;
const NO_POLL_OPTION_UUID = '00000000-0000-0000-0000-000000000000';

const POST_VERB_POLL = 'poll';
// const POST_VERB_TWEET = 'tweet';

const CONTENT_TYPE_POST = 'post';
const CONTENT_TYPE_COMMENT = 'comment';

// TODO
// Changed temporarily, until logic improvement on getting the feeds is implemented.
const MAX_FEED_FETCH_LIMIT = 10;
const MAX_FEED_FETCH_LIMIT_DOMAIN = 20;
const MAX_GET_FEED_FROM_GETSTREAM_ITERATION = 10;
const MAX_DATA_RETURN_LENGTH = 10;
const MAX_DOMAIN_DATA_RETURN_LENGTH = 20;

const REDIS_TTL = 86400;
const BLOCK_DOMAIN_KEY = 'BLOCK_DOMAIN_';
const BLOCK_FEED_KEY = 'BLOCK_FEED_';
const BLOCK_POST_ANONYMOUS = 'BLOCK_POST_ANONYMOUS_';
const BLOCK_POST_ANONYMOUS_AUTHOR = 'BLOCK_POST_ANONYMOUS_AUTHOR_';
const API_PREFIX_V1 = '/api/v1';
const GETSTREAM_RANKING_METHOD = 'betterscore';
const GETSTREAM_TIME_LINEAR_RANKING_METHOD = 'time_linear';
const GETSTREAM_TIME_RANDOM_RANKING_METHOD = 'time_random';

const POST_CHECK_FEED_NOT_FOUND = 1;
const POST_CHECK_AUTHOR_NOT_FOLLOWING = 2;
const POST_CHECK_FEED_EXPIRED = 3;
const POST_CHECK_AUTHOR_BLOCKED = 4;

const POST_VERSION = 2;

const USERS_DEFAULT_IMAGE =
  'https://res.cloudinary.com/hpjivutj2/image/upload/v1680929851/default-profile-picture_vrmmdn.png';

const CHANNEL_TYPE = {
  CHAT: 1,
  GROUP: 2,
  TOPIC: 3,
  ANONYMOUS: 4
};

const NOTIFICATION_TOPIC_NAME_PREFIX = 'topic_';

module.exports = {
  API_PREFIX_V1,
  BLOCK_DOMAIN_KEY,
  BLOCK_FEED_KEY,
  BLOCK_POST_ANONYMOUS,
  BLOCK_POST_ANONYMOUS_AUTHOR,
  CHANNEL_TYPE,
  CONTENT_TYPE_COMMENT,
  CONTENT_TYPE_POST,
  GETSTREAM_RANKING_METHOD,
  GETSTREAM_TIME_LINEAR_RANKING_METHOD,
  GETSTREAM_TIME_RANDOM_RANKING_METHOD,
  MAX_DATA_RETURN_LENGTH,
  MAX_DOMAIN_DATA_RETURN_LENGTH,
  MAX_FEED_FETCH_LIMIT_DOMAIN,
  MAX_FEED_FETCH_LIMIT,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  NOTIFICATION_TOPIC_NAME_PREFIX,
  NO_POLL_OPTION_UUID,
  POST_TYPE_LINK,
  POST_TYPE_POLL,
  POST_TYPE_STANDARD,
  POST_VERB_POLL,
  POST_VERSION,
  REDIS_TTL,
  POST_CHECK_FEED_NOT_FOUND,
  POST_CHECK_AUTHOR_NOT_FOLLOWING,
  POST_CHECK_FEED_EXPIRED,
  POST_CHECK_AUTHOR_BLOCKED,
  USERS_DEFAULT_IMAGE
};
