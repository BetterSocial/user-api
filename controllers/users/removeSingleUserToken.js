const Validator = require('fastest-validator');
const {FcmToken} = require('../../databases/models');
const {findFcmToken} = require('../../databases/functions/fcmToken');
const ErrorResponse = require('../../utils/response/ErrorResponse');

const v = new Validator();
module.exports = async (req, res) => {
  try {
    const schema = {
      fcm_token: 'string|empty:false'
    };
    const validate = v.validate(req.query, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: 'error',
        message: validate
      });
    }
    const exist = await findFcmToken(FcmToken, req.userId, req?.query?.fcm_token);
    if (!exist) {
      return ErrorResponse.e404(res, 'Token not found');
    }
    await FcmToken.destroy({
      where: {
        user_id: req.userId,
        token: req?.query?.fcm_token
      }
    });

    return res.status(200).send({success: true, message: 'Success delete fcm token'});
  } catch (e) {
    return res.status(400).send({success: false, message: String(e)});
  }
};
