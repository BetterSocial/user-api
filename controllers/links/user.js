const {FirebaseDynamicLinks} = require('firebase-dynamic-links');
const UsersFunction = require('../../databases/functions/users');
const {User} = require('../../databases/models');

module.exports = async (req, res) => {
  const {
    BETTER_WEB_APP_URL,
    FIREBASE_API_KEY,
    FIREBASE_DYNAMIC_LINK_URL,
    FIREBASE_DYNAMIC_LINK_ANDROID_APP_PACKAGE,
    FIREBASE_DYNAMIC_LINK_IOS_APP_PACKAGE,
    BETTER_APP_STORE_ID
  } = process.env;

  const firebaseDynamicLinks = new FirebaseDynamicLinks(FIREBASE_API_KEY);
  const firebaseDynamicLinkURL = FIREBASE_DYNAMIC_LINK_URL;
  const firebaseDynamicLinkAndroidAppPackage = FIREBASE_DYNAMIC_LINK_ANDROID_APP_PACKAGE;
  const firebaseDynamicLinkIOSAppPackage = FIREBASE_DYNAMIC_LINK_IOS_APP_PACKAGE;

  const {username} = req.params;

  try {
    const targetUser = await UsersFunction.findUserByUsername(User, username);

    const betterWebAppUrl = `${BETTER_WEB_APP_URL}/profile/${username}`;
    const betterWebAppUrlWithId = `${betterWebAppUrl}?userId=${targetUser.user_id}`;
    const {shortLink} = await firebaseDynamicLinks.createLink({
      longDynamicLink:
        firebaseDynamicLinkURL +
        '?link=' +
        betterWebAppUrlWithId +
        '&apn=' +
        firebaseDynamicLinkAndroidAppPackage +
        '&afl=' +
        betterWebAppUrlWithId +
        '&isi=' +
        BETTER_APP_STORE_ID +
        '&ibi=' +
        firebaseDynamicLinkIOSAppPackage +
        'ifl=' +
        betterWebAppUrlWithId
    });

    return res.redirect(shortLink);
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
};
