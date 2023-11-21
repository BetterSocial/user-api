const mainFeedFollowing = require('./feed/mainFeedFollowing');
const mainFeedFollowingAnon = require('./feed/mainFeedFollowingAnon');
const createUser = require('./core/createUser');
const createToken = require('./core/createToken');
const updateUserRemoveHumanId = require('./core/updateUserRemoveHumanId');

const createTokenChat = require('./chat/createTokenChat');
const findPmChannel = require('./chat/findPmChannel');
const sendSystemMessageForTokenHolder = require('./chat/sendSystemMessageForTokenHolder');
const sendFollowSystemMessage = require('./chat/sendFollowSystemMessage');
const syncUser = require('./chat/syncUser');

const comment = require('./feed/comment');
const commentAnonymous = require('./feed/commentAnonymous');
const commentChild = require('./feed/commentChild');
const commentChildAnonymous = require('./feed/commentChildAnonymous');
const createAnonymousPost = require('./feed/createAnonymousPost');
const createPost = require('./feed/createPost');
const deleteNotificationFeed = require('./feed/deleteNotificationFeed');
const getAnonymousFeeds = require('./feed/getAnonymousFeeds');
const getPlainFeedById = require('./feed/getPlainFeedById');
const getReactionById = require('./feed/getReactionById');
const followAnonUser = require('./feed/followAnonUser');
const followUser = require('./feed/followUser');
const followUserExclusive = require('./feed/followUserExclusive');
const unfollowAnonUser = require('./feed/unfollowAnonUser');
const unfollowAnonUserByBlockAnonPost = require('./feed/unfollowAnonUserByBlockAnonPost');
const unfollowUser = require('./feed/unfollowUser');
const unfollowUserExclusive = require('./feed/unfollowUserExclusive');
const followUserAnon = require('./feed/followUserAnon');

const Getstream = {
  core: {
    createUser,
    createToken,
    updateUserRemoveHumanId
  },
  chat: {
    createTokenChat,
    findPmChannel,
    sendFollowSystemMessage,
    sendSystemMessageForTokenHolder,
    syncUser
  },
  feed: {
    comment,
    commentAnonymous,
    commentChild,
    commentChildAnonymous,
    createAnonymousPost,
    createPost,
    deleteNotificationFeed,
    getAnonymousFeeds,
    getPlainFeedById,
    getReactionById,
    followAnonUser,
    followUser,
    followUserExclusive,
    unfollowAnonUser,
    unfollowAnonUserByBlockAnonPost,
    unfollowUser,
    unfollowUserExclusive,
    followMainFeedFollowing: mainFeedFollowing.follow,
    unfollowMainFeedFollowing: mainFeedFollowing.unfollow,
    followMainFeedFollowingAnon: mainFeedFollowingAnon.follow,
    unfollowMainFeedFollowingAnon: mainFeedFollowingAnon.unfollow,
    followUserAnon
  }
};

module.exports = Getstream;
