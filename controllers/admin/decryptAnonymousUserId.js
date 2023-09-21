const CryptoUtils = require('../../utils/crypto');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

const decryptAnonymousUserId = async (req, res) => {
  try {
    let {id} = req.body;

    let signedUserId = CryptoUtils.decryptAnonymousUserId(id);
    let data = {
      signed_user_id: signedUserId
    };
    return SuccessResponse(res, data, 'success decrypted id');
  } catch (error) {
    return ErrorResponse.e400(res, error);
  }
};

module.exports = decryptAnonymousUserId;
