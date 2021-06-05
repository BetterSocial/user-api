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
const followTopic = require("./followTopic");
const followLocation = require("./followLocation");
const deleteFeed = require("./deleteFeed");
const commentChild = require("./commentChild");
const childUpvote = require("./childUpvote");
const childDownvote = require("./childDownvote");
const updateReaction = require("./updateReaction");
const deleteReaction = require("./deleteReaction");
const validationReaction = require("./ValidationReaction");

module.exports = {
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
  followLocation,
  deleteFeed,
  commentChild,
  childUpvote,
  childDownvote,
  updateReaction,
  deleteReaction,
  validationReaction,
};
