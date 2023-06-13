const { User, UserFollowUser } = require('../../databases/models');
const Validator = require('fastest-validator');
const checkMoreOrLess = require('../../helpers/checkMoreOrLess').checkMoreOrLess;
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

    const user = await User.findOne({
      where: { username: req.params.username },
      include: [
        {
          model: UserFollowUser,
          as: 'following',
        },
        {
          model: UserFollowUser,
          as: 'follower',
        },
      ],
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

    let clonedUser = { ...user.dataValues };
    delete clonedUser.following
    delete clonedUser.follower

    clonedUser.following = user.dataValues.following.length;
    clonedUser.following_symbol = checkMoreOrLess(
      user.dataValues.following.length
    );
    clonedUser.follower = user.dataValues.follower.length;
    clonedUser.follower_symbol = checkMoreOrLess(user.dataValues.follower.length);

    clonedUser.isSignedMessageEnabled = false;
    clonedUser.isAnonMessageEnabled = false;
    let findIndex = user.dataValues.follower.findIndex(
      (value) => value.user_id_follower === req.userId
    );
    const isUserFollowingMe = user.dataValues.following.findIndex(
      (value) => value.user_id_followed === req.userId
    );

    clonedUser.is_following = findIndex > -1 ? true : false;
    if(clonedUser.only_received_dm_from_user_following) clonedUser.isSignedMessageEnabled = isUserFollowingMe > -1;
    else clonedUser.isSignedMessageEnabled = true;


    clonedUser.isAnonMessageEnabled =
      clonedUser.allow_anon_dm && clonedUser.isSignedMessageEnabled;

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
