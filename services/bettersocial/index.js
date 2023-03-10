const BetterSocialCreateAnonymousUser = require('./user/BetterSocialCreateAnonymousUser');
const BetterSocialCreateUser = require('./user/BetterSocialCreateUser');

const BetterSocialCore = {
    user: {
        createUser: BetterSocialCreateUser,
        createAnonymousUser: BetterSocialCreateAnonymousUser,
    },
    fcmToken: {
        sendNotification: require('./fcmToken/sendNotification'),
    }
}

module.exports = BetterSocialCore