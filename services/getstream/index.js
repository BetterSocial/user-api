const createUser = require('./createUser');
const createToken = require('./createToken');
const createPost = require('./createPost');
const deleteFeedById = require('./deleteFeedById');
const getFeeds = require('./getFeeds');
const {followUser, followUsers, followUserExclusive} = require('./followUser');
const createReaction = require('./createReaction');
const getReaction = require('./getReaction');
const upVote = require('./upVote');
const downVote = require('./downVote');
const comment = require('./comment');
const like = require('./like');
const {
  followTopic,
  followTopics,
  followMainFeedTopic,
  unfollowMainFeedTopic
} = require('./followTopic');
const {followLocation} = require('./followLocation');
const deleteFeed = require('./deleteFeed');
const commentChild = require('./commentChild');
const childUpvote = require('./childUpvote');
const childDownvote = require('./childDownvote');
const updateReaction = require('./updateReaction');
const deleteReaction = require('./deleteReaction');
const validationReaction = require('./ValidationReaction');
const getDomain = require('./getDomain');
const getDetailDomain = require('./getDetailDomain');
const updateActivity = require('./updateActivity');
const getDetailFeed = require('./getDetailFeed');
const voteComment = require('./voteComment');
const getOtherFeeds = require('./getOtherFeeds');
const getActivitiesByFeed = require('./getActivitiesByFeed');
const {notificationGetNewFeed} = require('./notificationFeed');
const {notificationFollowFeed} = require('./notificationFollowFeed');
const {notificationCommentFeed} = require('./notificationActionFeed');

module.exports = {
  childDownvote,
  childUpvote,
  comment,
  commentChild,
  createPost,
  createReaction,
  createToken,
  createUser,
  deleteFeed,
  deleteFeedById,
  deleteReaction,
  downVote,
  followLocation,
  followTopic,
  followTopics,
  followUser,
  followUserExclusive,
  followUsers,
  followMainFeedTopic,
  unfollowMainFeedTopic,
  getDetailDomain,
  getDetailFeed,
  getDomain,
  getFeeds,
  getOtherFeeds,
  getReaction,
  like,
  notificationCommentFeed,
  notificationFollowFeed,
  notificationGetNewFeed,
  upVote,
  updateActivity,
  updateReaction,
  validationReaction,
  voteComment,
  getActivitiesByFeed
};
