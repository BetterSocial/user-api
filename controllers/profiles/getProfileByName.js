const { User, UserFollowUser } = require('../../databases/models');
const Validator = require('fastest-validator');
const validator = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      username: 'string|empty:false',
    };

    let validated = validator.validate(req.params, schema);
    if (!validated)
      return res.json({
        code: 403,
        message: validated,
        status: 'error',
      });

    let { username } = req.params;

    let user = await User.findOne({
      where: { username, is_anonymous: false },
      attributes: {
        exclude: ['human_id'],
      },
    });

    if (!user)
      return res.json({
        code: 404,
        message: `No user with username ${username} found`,
        status: 'error',
      });

    let clonedUser = { ...user.toJSON() };

    clonedUser.isAnonMessageEnabled = false;
    if (
      clonedUser.allowAnonDm &&
      !clonedUser.onlyReceivedAnonDmFromUserFollowing
    ) {
      clonedUser.isAnonMessageEnabled = true;
    }

    return res.json({
      code: 200,
      message: 'Success',
      data: clonedUser,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      code: 500,
      message: e,
      status: 'error',
    });
  }
};
