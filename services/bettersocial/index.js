const BetterSocialBlockUserV2 = require('./user/BetterSocialBlockUserV2');
const BetterSocialCheckTargetFollowStatus = require('./user/BetterSocialCheckTargetFollowStatus');
const BetterSocialCheckTargetFollowStatusBatch = require('./user/BetterSocialCheckTargetFollowStatusBatch');
const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');
const BetterSocialUnblockUserV2 = require('./user/BetterSocialUnblockUserV2');
const postComment = require("./post/comment");
const postCommentChild = require('./post/commentChild');

const BetterSocialCore = {
    user: {
        createUser: BetterSocialCreateUser,
        createAnonymousUser: BetterSocialCreateAnonymousUser,
        blockUser: BetterSocialBlockUserV2,
        unblockUser: BetterSocialUnblockUserV2,
        checkTargetUserFollowStatus: BetterSocialCheckTargetFollowStatus,
        checkTargetUserFollowStatusBatch: BetterSocialCheckTargetFollowStatusBatch,
    },
    fcmToken: {
        sendNotification: require('./fcmToken/sendNotification'),
        sendCommentNotification: require('./fcmToken/sendCommentNotification'),
        sendReplyCommentNotification: require('./fcmToken/sendReplyCommentNotification'),
        sendMultiDeviceNotification: require('./fcmToken/sendMultiDeviceNotification'),
        sendMultiDeviceCommentNotification: require('./fcmToken/sendMultiDeviceCommentNotification'),
        sendMultiDeviceReplyCommentNotification: require('./fcmToken/sendMultiDeviceReplyCommentNotification'),
    },
    post: {
        blockAnonymousPost: require('./post/blockAnonymousPost'),
        createPost: require('./post/createPost'),
        createPollPost: require('./post/createPollPost'),
        comment: postComment.BetterSocialCreateComment,
        commentV3: postComment.BetterSocialCreateCommentV3,
        commentDomain: require('./post/commentDomain'),
        commentChild: postCommentChild.BetterSocialCreateCommentChild,
        commentChildV3: postCommentChild.BetterSocialCreateCommentChildV3
    },
    constantList: {
        color: require('./constantList/color'),
        emoji: require('./constantList/emoji'),
        utils: require('./constantList/utils'),
    },
    score: {
        blockUser: require('./score/block-user'),
        unblockUser: require('./score/unblock-user'),
    },
};

module.exports = BetterSocialCore;
