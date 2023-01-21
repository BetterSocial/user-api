const {FirebaseDynamicLinks} = require('firebase-dynamic-links');
const { getDetailFeed } = require('../../services/getstream');
const { isDateExpired } = require('../../utils/date');

module.exports = async (req, res) => {
    const firebaseDynamicLinks = new FirebaseDynamicLinks(process.env.FIREBASE_API_KEY)
    const firebaseDynamicLinkURL = process.env.FIREBASE_DYNAMIC_LINK_URL
    const firebaseDynamicLinkAndroidAppPackage = process.env.FIREBASE_DYNAMIC_LINK_ANDROID_APP_PACKAGE
    const firebaseDynamicLinkIOSAppPackage = process.env.FIREBASE_DYNAMIC_LINK_IOS_APP_PACKAGE

    let post = null
    try {
        response = await getDetailFeed(req?.token, req?.params?.postId, 'main_feed')
        post = response?.results?.length > 0 ? response?.results[0] : null
        console.log(post)
    } catch(e) {
        console.log(e)
        return res.status(500)
    }

    if (!post) {
        return res.status(404)
    }

    if(isDateExpired(post?.expired_at)) {
        return generateExpiredPostFirebaseDynamicLink()
    }

    if(post?.privacy?.toLowerCase() !== 'public') {
        return generateNotPublicFirebaseDynamicLink()
    }

    try {
        const {shortLink, previewLink} = await firebaseDynamicLinks.createLink({
            dynamicLinkInfo : {
                domainUriPrefix: `${firebaseDynamicLinkURL}`,
                link: `${firebaseDynamicLinkURL}/post?postId=${req.params.postId}`,
                // androidInfo: {
                //     androidPackageName: firebaseDynamicLinkAndroidAppPackage,
                // },
                iosInfo : {
                    iosBundleId: firebaseDynamicLinkIOSAppPackage
                }
            }
        })
    
        console.log(shortLink)
        console.log(previewLink)
        return res.redirect(shortLink)
        // return res.redirect('https://link.bettersocial.org/users')
    } catch(e) {
        console.log(e)
        return res.status(500)
    }

    async function generateNotPublicFirebaseDynamicLink() {
        const {shortLink, previewLink} = await firebaseDynamicLinks.createLink({
            dynamicLinkInfo : {
                domainUriPrefix: `${firebaseDynamicLinkURL}`,
                link: `${firebaseDynamicLinkURL}/postprivate`,
                androidInfo: {
                    androidPackageName: firebaseDynamicLinkAndroidAppPackage,
                },
                iosInfo : {
                    iosBundleId: firebaseDynamicLinkIOSAppPackage
                }
            }
        })

        return res.redirect(shortLink)
    }

    async function generateExpiredPostFirebaseDynamicLink() {
        const {shortLink, previewLink} = await firebaseDynamicLinks.createLink({
            dynamicLinkInfo : {
                domainUriPrefix: `${firebaseDynamicLinkURL}`,
                link: `${firebaseDynamicLinkURL}/postexpired`,
                androidInfo: {
                    androidPackageName: firebaseDynamicLinkAndroidAppPackage,
                },
                iosInfo : {
                    iosBundleId: firebaseDynamicLinkIOSAppPackage
                }
            }
        })

        return res.redirect(shortLink)
    }
}