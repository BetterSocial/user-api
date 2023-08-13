const CryptoUtils = require('../../utils/crypto');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

const decryptAnonymousUserId = async (req, res) => {
  try {
    const {encrypted_id} = req.body;
    if (!encrypted_id) {
      return ErrorResponse.e400(res, 'Encrypted Id required');
    }

    const signedUserId = CryptoUtils.decryptAnonymousUserId(encrypted_id);
    const data = {
      signed_user_id: signedUserId
    };
    return SuccessResponse(res, data, 'success decrypted id');
  } catch (error) {
    return ErrorResponse.e400(res, error);
  }
};

module.exports = decryptAnonymousUserId;
