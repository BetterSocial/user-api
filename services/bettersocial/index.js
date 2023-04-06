const BetterSocialBlockUserV2 = require('./user/BetterSocialBlockUserV2');
const BetterSocialCheckTargetFollowStatus = require('./user/BetterSocialCheckTargetFollowStatus');
const BetterSocialCheckTargetFollowStatusBatch = require('./user/BetterSocialCheckTargetFollowStatusBatch');
const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');
const BetterSocialUnblockUserV2 = require('./user/BetterSocialUnblockUserV2');

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
        sendReplyCommentNotification: require('./fcmToken/sendReplyCommentNotification')
    },
    post: {
        blockAnonymousPost: require('./post/blockAnonymousPost'),
        createPost: require('./post/createPost'),
        createPollPost: require('./post/createPollPost'),
        comment: require('./post/comment'),
        commentChild: require('./post/commentChild')
    },
    constantList: {
        color: require('./constantList/color'),
        emoji: require('./constantList/emoji'),
        utils: require('./constantList/utils'),
    },
    score: {
        blockUser: require('./score/block-user'),
        unblockUser: require('./score/unblock-user'),
    }
}

module.exports = BetterSocialCore