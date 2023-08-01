/* eslint-disable global-require */
const BetterSocialBlockUserV2 = require('./user/BetterSocialBlockUserV2');
const BetterSocialCheckTargetFollowStatus = require('./user/BetterSocialCheckTargetFollowStatus');
const BetterSocialCheckTargetFollowStatusBatch = require('./user/BetterSocialCheckTargetFollowStatusBatch');
const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');
const BetterSocialUnblockUserV2 = require('./user/BetterSocialUnblockUserV2');
const BetterSocialCheckPasswordForDemoLogin = require('./user/BetterSocialCheckPasswordForDemoLogin');
const postComment = require('./post/comment');
const postCommentChild = require('./post/commentChild');
const postCommentDomain = require('./post/commentDomain');
const {BetterSocialCreatePostV3} = require('./post/createPostV3')

const BetterSocialCore = {
  user: {
    createUser: BetterSocialCreateUser,
    createAnonymousUser: BetterSocialCreateAnonymousUser,
    blockUser: BetterSocialBlockUserV2,
    unblockUser: BetterSocialUnblockUserV2,
    checkTargetUserFollowStatus: BetterSocialCheckTargetFollowStatus,
    checkTargetUserFollowStatusBatch: BetterSocialCheckTargetFollowStatusBatch,
    checkPasswordForDemoLogin: BetterSocialCheckPasswordForDemoLogin
  },
  fcmToken: {
    sendNotification: require('./fcmToken/sendNotification'),
    sendCommentNotification: require('./fcmToken/sendCommentNotification'),
    sendReplyCommentNotification: require('./fcmToken/sendReplyCommentNotification'),
    sendMultiDeviceNotification: require('./fcmToken/sendMultiDeviceNotification'),
    sendMultiDeviceCommentNotification: require('./fcmToken/sendMultiDeviceCommentNotification'),
    sendMultiDeviceReplyCommentNotification: require('./fcmToken/sendMultiDeviceReplyCommentNotification')
  },
  post: {
    blockAnonymousPost: require('./post/blockAnonymousPost'),
    createPost: require('./post/createPost'),
    createPostV3: BetterSocialCreatePostV3,
    createPollPost: require('./post/createPollPost'),
    comment: postComment.BetterSocialCreateComment,
    commentV3: postComment.BetterSocialCreateCommentV3,
    commentV3Anonymous: postComment.BetterSocialCreateCommentV3Anonymous,
    commentDomain: postCommentDomain.BetterSocialCreateComment,
    commentDomainV3: postCommentDomain.BetterSocialCreateCommentV3,
    commentDomainV3Anonymous: postCommentDomain.BetterSocialCreateCommentV3Anonymous,
    commentChild: postCommentChild.BetterSocialCreateCommentChild,
    commentChildV3: postCommentChild.BetterSocialCreateCommentChildV3,
    commentChildV3Anonymous: postCommentChild.BetterSocialCreateCommentChildV3Anonymous
  },
  constantList: {
    color: require('./constantList/color'),
    emoji: require('./constantList/emoji'),
    utils: require('./constantList/utils')
  },
  score: {
    blockUser: require('./score/block-user'),
    unblockUser: require('./score/unblock-user')
  }
};

module.exports = BetterSocialCore;
