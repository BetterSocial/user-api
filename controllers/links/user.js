const {FirebaseDynamicLinks} = require('firebase-dynamic-links');

module.exports = async (req, res) => {
    const firebaseDynamicLinks = new FirebaseDynamicLinks(process.env.FIREBASE_API_KEY)
    console.log(req.params.username)
    try {
        const {shortLink, previewLink} = await firebaseDynamicLinks.createLink({
            dynamicLinkInfo : {
                domainUriPrefix: 'https://link.bettersocial.org',
                link: `https://link.bettersocial.org/users?username=${req.params.username}`,
                androidInfo: {
                    androidPackageName: 'org.bettersocial.dev',
                },
                iosInfo : {
                    iosBundleId: 'org.reactjs.native.example.BetterSocial'
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
}