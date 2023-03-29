const BetterSocialBlockUserV2 = require('./user/BetterSocialBlockUserV2');
const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');

const BetterSocialCore = {
    user: {
        createUser: BetterSocialCreateUser,
        createAnonymousUser: BetterSocialCreateAnonymousUser,
        blockUser: BetterSocialBlockUserV2
    },
    fcmToken: {
        sendNotification: require('./fcmToken/sendNotification'),
        sendCommentNotification: require('./fcmToken/sendCommentNotification'),
        sendReplyCommentNotification: require('./fcmToken/sendReplyCommentNotification')
    },
    post: {
        createPost: require('./post/createPost'),
        createPollPost: require('./post/createPollPost'),
        comment: require('./post/comment'),
        commentChild: require('./post/commentChild')
    },
    constantList: {
        color: require('./constantList/color'),
        emoji: require('./constantList/emoji'),
        utils: require('./constantList/utils'),
    }
}

module.exports = BetterSocialCore