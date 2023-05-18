const { messaging } = require('firebase-admin');
const FcmTokenFunction = require('../../../databases/functions/fcmToken');
const { FcmToken } = require('../../../databases/models');

const sendMultiDeviceNotification = async (
    userIdFollower,
    userNameFollower,
    userIdFollowed,
    userNameFollowed
    ) => {
    const userTargetTokens = await FcmTokenFunction.findAllTokenByUserId(
        FcmToken,
        userIdFollowed
    );

    await Promise.all(
        userTargetTokens.map(async (user) => {
            const payload = {
                token: user.token,
                notification: {
                    title: userNameFollower,
                    body: `${userNameFollower} just started following you. Say 'Hi'!`,
                    click_action: 'OPEN_ACTIVITY_1',
                },
                data: {
                    username: userNameFollowed,
                    type: 'follow_user',
                    user_id: userIdFollowed,
                    user_id_follower: userIdFollower,
                    username_follower: userNameFollower,
                },
            };
            
            await messaging().send(payload);
        })
    );
};

module.exports = sendMultiDeviceNotification;
