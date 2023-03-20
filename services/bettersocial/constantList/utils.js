const CryptoUtils = require('../../../utils/crypto');
const BetterSocialColorList = require('./color');
const BetterSocialEmojiList = require('./emoji');

const BetterSocialConstantListUtils = {
    getRandomColor: function() {
        const random = CryptoUtils.randomInt(BetterSocialColorList.length);
        return BetterSocialColorList[random];
    },

    getRandomEmoji: function() {
        const random = CryptoUtils.randomInt(BetterSocialEmojiList.length);
        return BetterSocialEmojiList[random];
    }
}

module.exports = BetterSocialConstantListUtils;