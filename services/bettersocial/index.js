const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');

const BetterSocialCore = {
    user: {
        createUser: BetterSocialCreateUser,
        createAnonymousUser: BetterSocialCreateAnonymousUser,
    },
    fcmToken: {
        sendNotification: require('./fcmToken/sendNotification'),
    },
    post: {
        createPost: require('./post/createPost'),
        createPollPost: require('./post/createPollPost'),
    },
    constantList: {
        color: require('./constantList/color'),
        emoji: require('./constantList/emoji'),
        utils: require('./constantList/utils'),
    }
}

module.exports = BetterSocialCore