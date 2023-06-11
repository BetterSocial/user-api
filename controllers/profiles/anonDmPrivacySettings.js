const Validator = require('fastest-validator');
const { UserFollowUser, User } = require('../../databases/models');
const ErrorResponse = require('../../utils/response/ErrorResponse');

const v = new Validator();

exports.anonDmPrivacySettings = async (req, res) => {
  try {
    const schema = {
      allowAnonDm: 'boolean',
      onlyReceivedDmFromUserFollowing: 'boolean',
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: 'error',
        message: validate,
      });
    }
    const { allowAnonDm, onlyReceivedDmFromUserFollowing } = req.body;
    if (onlyReceivedDmFromUserFollowing) {
      const countFollowing = await UserFollowUser.count({
        where: { user_id_follower: req.userId },
      });
      if (countFollowing < 20) {
        return ErrorResponse.e403(
          res,
          `To protect your connections anonymity, you need to follow at least 20 users to enable this option`
        );
      }
    }
    await User.update(
      { allowAnonDm, onlyReceivedDmFromUserFollowing },
      { where: { user_id: req.userId } }
    );
    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return ErrorResponse.e400(res, error.message);
  }
};
