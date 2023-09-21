const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const crypto = require('crypto');
const {Transaction} = require('sequelize');
const CryptoUtils = require('../../../utils/crypto');

/**
 *
 * @param {Model} model
 * @param {String} userId
 * @param {Transaction} transaction
 */
module.exports = async (model, userId, transaction = null) => {
  const salt = process.env.BETTER_HASH_SALT;
  let myTs = moment('2023-01-01', 'YYYY-MM-DD').format('YYYY-MM-DD HH:mm:ss');

  const saltedUserId = salt + userId + salt;

  const anonymousUsername = crypto.createHash('sha256').update(saltedUserId).digest('hex');
  const encryptedUserId = CryptoUtils.encryptSignedUserId(userId);
  const userIdAnonymous = uuidv4();
  const user = await model.create(
    {
      user_id: userIdAnonymous,
      human_id: userIdAnonymous,
      country_code: '',
      username: anonymousUsername,
      real_name: '',
      profile_pic_path: '',
      profile_pic_asset_id: '',
      profile_pic_public_id: '',
      createdAt: myTs,
      updatedAt: myTs,
      last_active_at: myTs,
      status: 'Y',
      bio: '',
      is_anonymous: true,
      encrypted: encryptedUserId
    },
    {transaction, returning: true}
  );

  return user;
};
