const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');

const BetterSocialCore = {
    user: {
        createUser: BetterSocialCreateUser,
        createAnonymousUser: BetterSocialCreateAnonymousUser,
    },
    fcmToken: {
        sendNotification: require('./fcmToken/sendNotification'),
        sendCommentNotification: require('./fcmToken/sendCommentNotification'),
    },
    post: {
        createPost: require('./post/createPost'),
        createPollPost: require('./post/createPollPost'),
        comment: require('./post/comment'),
    },
    constantList: {
        color: require('./constantList/color'),
        emoji: require('./constantList/emoji'),
        utils: require('./constantList/utils'),
    }
}

module.exports = BetterSocialCore