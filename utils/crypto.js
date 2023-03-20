const crypto = require('crypto')

const CryptoUtils = {
    getAnonymousUsername: (signedUserId) => {
        const salt = process.env.BETTER_HASH_SALT;
        const saltedUserId = salt + signedUserId + salt;
        const anonymousUsername = crypto.createHash('sha256').update(saltedUserId).digest('hex');

        return anonymousUsername
    },

    sha256: (input) => {
        const salt = process.env.BETTER_HASH_SALT;
        const saltedInput = salt + input + salt;
        const hashedInput = crypto.createHash('sha256').update(saltedInput).digest('hex');

        return hashedInput
    },

    randomInt: (max) => {
        return crypto.randomInt(max);
    }
}

module.exports = CryptoUtils