const createPost = require("./createPost");
const getFeeds = require("./getFeeds");
const followUser = require("./followUser");
const createReaction = require("./createReaction");
const getReaction = require("./getReaction");
const upvote = require("./upVote");
const downvote = require("./downVote");
const comment = require("./comment");
const like = require("./like");
const createPollPost = require("./createPollPost");
const deleteFeed = require("./deleteFeed");
const getFeedUser = require("./getFeedUser");
const commentChild = require("./commentChild");
const childDownvote = require("./childDownvote");
const childUpvote = require("./childUpvote");
const updateReaction = require("./updateReaction");
const deleteReaction = require("./deleteReaction");

module.exports = {
  createPost,
  getFeeds,
  followUser,
  createReaction,
  getReaction,
  upvote,
  comment,
  like,
  createPollPost,
  deleteFeed,
  getFeedUser,
  downvote,
  commentChild,
  childDownvote,
  childUpvote,
  updateReaction,
  deleteReaction,
};
