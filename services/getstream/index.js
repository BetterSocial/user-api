const createUser = require("./createUser");
const createToken = require("./createToken");
const createPost = require("./createPost");
const getFeeds = require("./getFeeds");
const followUser = require("./followUser");
const createReaction = require("./createReaction");
const getReaction = require("./getReaction");
const upVote = require("./upVote");
const downVote = require("./downVote");
const comment = require("./comment");
const like = require("./like");
const { followTopic, followTopics } = require("./followTopic");
const followLocation = require("./followLocation");
const deleteFeed = require("./deleteFeed");
const commentChild = require("./commentChild");
const childUpvote = require("./childUpvote");
const childDownvote = require("./childDownvote");
const updateReaction = require("./updateReaction");
const deleteReaction = require("./deleteReaction");
const validationReaction = require("./ValidationReaction");
const getDomain = require("./getDomain");
const getDetailDomain = require("./getDetailDomain");
const updateActivity = require("./updateActivity");

module.exports = {
  getDetailDomain,
  getDomain,
  createUser,
  createToken,
  createPost,
  getFeeds,
  followUser,
  createReaction,
  getReaction,
  upVote,
  downVote,
  comment,
  like,
  followTopic,
  followTopics,
  followLocation,
  deleteFeed,
  commentChild,
  childUpvote,
  childDownvote,
  updateReaction,
  deleteReaction,
  validationReaction,
  updateActivity,
};
