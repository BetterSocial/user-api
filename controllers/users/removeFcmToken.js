const {FcmToken} = require('../../databases/models');
module.exports = async (req, res) => {
  try {
    const removeToken = await FcmToken.destroy({
      where: {
        user_id: req.userId
      }
    });
    if (removeToken) {
      return res.status(200).send({success: true, message: 'Success delete fcm token'});
    }
    res.status(400).send({success: false, message: 'No user id with token listed'});
  } catch (e) {
    return res.status(400).send({success: false, message: String(e)});
  }
};
