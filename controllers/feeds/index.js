const blockAnonymousPostV2 = require('./blockAnonymousPostV2');
const childDownvote = require('./childDownvote');
const childUpvote = require('./childUpvote');
const comment = require('./comment');
const commentV2 = require('./commentV2');
const commentV3 = require('./commentV3');
const commentChild = require('./commentChild');
const commentChildV2 = require('./commentChildV2');
const commentDomain = require('./commentDomain');
const commentDomainV2 = require('./commentDomainV2');
const createPollPost = require('./createPollPost');
const createPost = require('./createPost');
const createPostV2 = require('./createPostV2');
const createReaction = require('./createReaction');
const deleteAnonymousPost = require('./deleteAnonymousPost');
const deleteFeed = require('./deleteFeed');
const deletePost = require('./deletePost');
const deleteReaction = require('./deleteReaction');
const detailFeed = require('./detailFeed');
const downvote = require('./downVote');
const downVoteDomain = require('./downVoteDomain');
const followUser = require('./followUser');
const getFeeds = require('./getFeeds');
const getFeedUser = require('./getFeedUser');
const getOpenGraph = require('./getOpenGraph');
const getReaction = require('./getReaction');
const inputPoll = require('./inputPoll');
const iVoteComment = require('./iVoteComment');
const like = require('./like');
const notificationCommentFeed = require('./notificationCommentFeed');
const updateReaction = require('./updateReaction');
const upvote = require('./upVote');
const upVoteDomain = require('./upVoteDomain');
const voteComment = require('./voteComment');
const isAuthorFollowMe = require('./isAuthorFollowMe');
const generateAnonymousUsername = require('./generateAnonymousUsername');
const reactionList = require('./reactionList');
const { createQueuePostTime } = require('./createPostTime');
const { getFeedChatService } = require('./getFeedChat');
const { putMainFeed } = require('./updateActivity');
const getOneFeedChatService = require('./getOneFeedChat');

module.exports = {
  blockAnonymousPostV2,
  childDownvote,
  childUpvote,
  comment,
  commentV2,
  commentV3,
  commentChild,
  commentChildV2,
  commentDomain,
  commentDomainV2,
  createPollPost,
  createPost,
  createPostV2,
  createQueuePostTime,
  createReaction,
  deleteAnonymousPost,
  deleteFeed,
  deletePost,
  deleteReaction,
  detailFeed,
  downvote,
  downVoteDomain,
  followUser,
  generateAnonymousUsername,
  getFeedChatService,
  getOneFeedChatService,
  getFeeds,
  getFeedUser,
  getOpenGraph,
  getReaction,
  inputPoll,
  isAuthorFollowMe,
  iVoteComment,
  like,
  notificationCommentFeed,
  putMainFeed,
  updateReaction,
  upvote,
  upVoteDomain,
  voteComment,
  reactionList,
};
