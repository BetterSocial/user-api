const blockAnonymousPostV2 = require('./blockAnonymousPostV2');
const childDownvote = require('./childDownvote');
const childUpvote = require('./childUpvote');
const comment = require('./comment');
const commentV2 = require('./commentV2');
const commentV3 = require('./commentV3');
const commentChild = require('./commentChild');
const commentChildV2 = require('./commentChildV2');
const commentChildV3 = require('./commentChildV3');
const commentDomain = require('./commentDomain');
const commentDomainV2 = require('./commentDomainV2');
const commentDomainV3 = require('./commentDomainV3');
const createPollPost = require('./createPollPost');
const createPost = require('./createPost');
const createPostV2 = require('./createPostV2');
const createPostV3 = require('./createPostV3');
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
const getFeedsV2 = require('./getFeedsV2');
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
const {createQueuePostTime} = require('./createPostTime');
const {getFeedChatService} = require('./getFeedChat');
const {putMainFeed} = require('./updateActivity');
const getOneFeedChatService = require('./getOneFeedChat');
const getAnonymousFeedChatService = require('./getAnonymousFeedChat');
const commentVoteV2 = require('./commentVoteV2');

module.exports = {
  blockAnonymousPostV2,
  childDownvote,
  childUpvote,
  comment,
  commentV2,
  commentV3,
  commentChild,
  commentChildV2,
  commentChildV3,
  commentDomain,
  commentDomainV2,
  commentDomainV3,
  createPollPost,
  createPost,
  createPostV2,
  createPostV3,
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
  getAnonymousFeedChatService,
  getFeedChatService,
  getOneFeedChatService,
  getFeeds,
  getFeedsV2,
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
  commentVoteV2
};
