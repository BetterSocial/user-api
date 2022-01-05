const getDomain = require("./getDomain");
const getDetailDomain = require("./getDetailDomain");
const getProfileDomain = require("./getProfileDomain");
const followDomain = require("./followDomain");
const unfollowDomain = require("./unfollowDomain");
const iFollow = require("./iFollow");
const getFollowedDomain = require('./getFollowedDomain')
const {getBlockedDomain} = require("./getBlockedDomain")
const {unblockDomain} = require("./unblockDomain")
const {getSingleBlockedDomain} = require("./getSingleBlockedDomain")

module.exports = {
  getDomain,
  getDetailDomain,
  getFollowedDomain,
  getProfileDomain,
  unfollowDomain,
  followDomain,
  iFollow,
  getBlockedDomain,
  unblockDomain,
  getSingleBlockedDomain
};
