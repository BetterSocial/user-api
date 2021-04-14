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
};
