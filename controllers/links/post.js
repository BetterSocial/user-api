const {FirebaseDynamicLinks} = require('firebase-dynamic-links');
const {getDetailFeed} = require('../../services/getstream');
const {isDateExpired} = require('../../utils/date');

module.exports = async (req, res) => {
  const {
    FIREBASE_DYNAMIC_LINK_URL,
    FIREBASE_API_KEY,
    BETTER_WEB_APP_URL,
    FIREBASE_DYNAMIC_LINK_ANDROID_APP_PACKAGE,
    FIREBASE_DYNAMIC_LINK_IOS_APP_PACKAGE,
    BETTER_APP_STORE_ID
  } = process.env;

  const firebaseDynamicLinks = new FirebaseDynamicLinks(FIREBASE_API_KEY);
  const firebaseDynamicLinkURL = FIREBASE_DYNAMIC_LINK_URL;
  const firebaseDynamicLinkAndroidAppPackage = FIREBASE_DYNAMIC_LINK_ANDROID_APP_PACKAGE;
  const firebaseDynamicLinkIOSAppPackage = FIREBASE_DYNAMIC_LINK_IOS_APP_PACKAGE;

  let post = null;
  try {
    let response = await getDetailFeed(req?.token, req?.params?.postId, 'main_feed');
    post = response?.results?.length > 0 ? response?.results[0] : null;
  } catch (e) {
    console.log(e);
    return res.status(500);
  }

  if (!post) {
    return res.status(404);
  }

  if (isDateExpired(post?.expired_at)) {
    return generateExpiredPostFirebaseDynamicLink();
  }

  if (post?.privacy?.toLowerCase() !== 'public') {
    return generateNotPublicFirebaseDynamicLink();
  }

  try {
    const betterWebAppUrl = `${BETTER_WEB_APP_URL}?postId=${post?.id}`;
    const {shortLink} = await firebaseDynamicLinks.createLink({
      longDynamicLink: `${FIREBASE_DYNAMIC_LINK_URL}?link=${betterWebAppUrl}&apn=${firebaseDynamicLinkAndroidAppPackage}&afl=${betterWebAppUrl}&isi=${BETTER_APP_STORE_ID}&ibi=${firebaseDynamicLinkIOSAppPackage}&ifl=${betterWebAppUrl}`
    });

    return res.redirect(shortLink);
  } catch (e) {
    console.log(e);
    return res.status(500);
  }

  async function generateNotPublicFirebaseDynamicLink() {
    const {shortLink} = await firebaseDynamicLinks.createLink({
      dynamicLinkInfo: {
        domainUriPrefix: `${firebaseDynamicLinkURL}`,
        link: `${firebaseDynamicLinkURL}/postprivate`,
        androidInfo: {
          androidPackageName: firebaseDynamicLinkAndroidAppPackage
        },
        iosInfo: {
          iosBundleId: firebaseDynamicLinkIOSAppPackage
        }
      }
    });

    return res.redirect(shortLink);
  }

  async function generateExpiredPostFirebaseDynamicLink() {
    const {shortLink} = await firebaseDynamicLinks.createLink({
      dynamicLinkInfo: {
        domainUriPrefix: `${firebaseDynamicLinkURL}`,
        link: `${firebaseDynamicLinkURL}/postexpired`,
        androidInfo: {
          androidPackageName: firebaseDynamicLinkAndroidAppPackage
        },
        iosInfo: {
          iosBundleId: firebaseDynamicLinkIOSAppPackage
        }
      }
    });

    return res.redirect(shortLink);
  }
};
