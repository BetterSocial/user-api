const {FcmToken} = require('../../databases/models');
const moment = require('moment');
module.exports = async (req, res) => {
  try {
    const {fcm_token} = req.body;
    const payload = {
      user_id: req.userId,
      token: fcm_token,
      updated_at: moment().format()
    };

    const exist = await FcmToken.findOne({
      where: {
        user_id: req.userId,
        token: fcm_token
      }
    });
    if (!exist) {
      await FcmToken.create({...payload, created_at: moment().format()});
    }
    return res.status(200).send({success: true, message: 'Success save fcm token'});
  } catch (e) {
    return res.status(400).send({success: false, message: String(e)});
  }
};
