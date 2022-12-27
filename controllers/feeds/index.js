const childDownvote = require("./childDownvote");
const childUpvote = require("./childUpvote");
const comment = require("./comment");
const commentChild = require("./commentChild");
const commentDomain = require('./commentDomain')
const createPollPost = require("./createPollPost");
const createPost = require("./createPost");
const createReaction = require("./createReaction");
const deleteFeed = require("./deleteFeed");
const deletePost = require("./deletePost")
const deleteReaction = require("./deleteReaction");
const detailFeed = require("./detailFeed");
const downvote = require("./downVote");
const downVoteDomain = require("./downVoteDomain");
const followUser = require("./followUser");
const getFeeds = require("./getFeeds");
const getFeedUser = require("./getFeedUser");
const getOpenGraph = require('./getOpenGraph')
const getReaction = require("./getReaction");
const inputPoll = require("./inputPoll");
const iVoteComment = require("./iVoteComment");
const like = require("./like");
const notificationCommentFeed = require("./notificationCommentFeed")
const updateReaction = require("./updateReaction");
const upvote = require("./upVote");
const upVoteDomain = require("./upVoteDomain");
const voteComment = require("./voteComment");

const { createQueuePostTime } = require("./createPostTime");
const { getFeedChatService } = require("./getFeedChat")
const { putMainFeed } = require("./updateActivity");

module.exports = {
  childDownvote,
  childUpvote,
  comment,
  commentChild,
  commentDomain,
  createPollPost,
  createPost,
  createQueuePostTime,
  createReaction,
  deleteFeed,
  deletePost,
  deleteReaction,
  detailFeed,
  downvote,
  downVoteDomain,
  followUser,
  getFeedChatService,
  getFeeds,
  getFeedUser,
  getOpenGraph,
  getReaction,
  inputPoll,
  iVoteComment,
  like,
  notificationCommentFeed,
  putMainFeed,
  updateReaction,
  upvote,
  upVoteDomain,
  voteComment,
};
