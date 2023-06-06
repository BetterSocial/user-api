const Validator = require('fastest-validator');
const { UserFollowUser, User } = require('../../databases/models');
const ErrorResponse = require('../../utils/response/ErrorResponse');

const v = new Validator();

exports.anonDmPrivacySettings = async (req, res) => {
  try {
    const schema = {
      allowAnonDm: 'boolean',
      onlyReceivedAnonDmFromUserFollowing: 'boolean',
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: 'error',
        message: validate,
      });
    }
    const { allowAnonDm, onlyReceivedAnonDmFromUserFollowing } = req.body;
    if (onlyReceivedAnonDmFromUserFollowing) {
      const countFollower = await UserFollowUser.count({
        where: { user_id_followed: req.userId },
      });
      if (countFollower < 20) {
        return ErrorResponse.e403(
          res,
          `Cant change setting, user's follower is less than 20`
        );
      }
    }
    await User.update(
      { allowAnonDm, onlyReceivedAnonDmFromUserFollowing },
      { where: { user_id: req.userId } }
    );
    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return ErrorResponse.e400(res, error.message);
  }
};
