const crypto = require('crypto')

const CryptoUtils = {
    getAnonymousUsername: (signedUserId) => {
        const salt = process.env.BETTER_HASH_SALT;
        const saltedUserId = salt + signedUserId + salt;
        const anonymousUsername = crypto.createHash('sha256').update(saltedUserId).digest('hex');

        return anonymousUsername
    }
}

module.exports = CryptoUtils