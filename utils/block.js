const {
  BLOCK_POST_ANONYMOUS,
  BLOCK_DOMAIN_KEY,
  BLOCK_FEED_KEY,
} = require("../helpers/constants");

const getIdBlockAnonymous = (userId) => {
  return BLOCK_POST_ANONYMOUS + userId;
};

const getIdBlockDomain = (userId) => {
  return BLOCK_DOMAIN_KEY + userId;
};

const getIdBlockFeed = (userId) => {
  return BLOCK_FEED_KEY + userId;
};

module.exports = {
  getIdBlockAnonymous,
  getIdBlockDomain,
  getIdBlockFeed,
};
