const {FirebaseDynamicLinks} = require('firebase-dynamic-links');

module.exports = async (req, res) => {
    const firebaseDynamicLinks = new FirebaseDynamicLinks(process.env.FIREBASE_API_KEY)
    const firebaseDynamicLinkURL = process.env.FIREBASE_DYNAMIC_LINK_URL
    const firebaseDynamicLinkAndroidAppPackage = process.env.FIREBASE_DYNAMIC_LINK_ANDROID_APP_PACKAGE
    const firebaseDynamicLinkIOSAppPackage = process.env.FIREBASE_DYNAMIC_LINK_IOS_APP_PACKAGE
    // console.log(req.params.username)
    console.log(firebaseDynamicLinkURL)
    console.log(firebaseDynamicLinkAndroidAppPackage)
    console.log(firebaseDynamicLinkIOSAppPackage)
    try {
        const {shortLink, previewLink} = await firebaseDynamicLinks.createLink({
            dynamicLinkInfo : {
                domainUriPrefix: `${firebaseDynamicLinkURL}`,
                link: `${firebaseDynamicLinkURL}/users?username=${req.params.username}`,
                androidInfo: {
                    androidPackageName: firebaseDynamicLinkAndroidAppPackage,
                },
                iosInfo : {
                    iosBundleId: firebaseDynamicLinkIOSAppPackage
                }
            }
        })
    
        console.log(shortLink)
        // console.log(previewLink)
        return res.redirect(shortLink)
        // return res.redirect('https://link.bettersocial.org/users')
    } catch(e) {
        console.log(e)
        return res.status(500)
    }
}