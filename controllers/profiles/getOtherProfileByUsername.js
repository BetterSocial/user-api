const { User, UserFollowUser } = require('../../databases/models');
const Validator = require('fastest-validator');
const checkMoreOrLess =
  require('../../helpers/checkMoreOrLess').checkMoreOrLess;
const url = require('url');

const v = new Validator();

module.exports = async (req, res) => {
  try {
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
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'User not found',
      });
    }
    let copyUser = { ...user.dataValues };

    delete copyUser.following;
    delete copyUser.follower;

    copyUser.following = user.dataValues.following.length;
    copyUser.following_symbol = checkMoreOrLess(
      user.dataValues.following.length
    );
    copyUser.follower = user.dataValues.follower.length;
    copyUser.follower_symbol = checkMoreOrLess(user.dataValues.follower.length);

    let findIndex = user.dataValues.follower.findIndex(
      (value) => value.user_id_follower === req.userId
    );
    const isUserFollowingMe = user.dataValues.following.findIndex(
      (value) => value.user_id_followed === req.userId
    );

    console.log('copiedUser')
    console.log(isUserFollowingMe)

    copyUser.is_following = findIndex > -1 ? true : false;
    if(copyUser.only_received_dm_from_user_following) copyUser.isSignedMessageEnabled = isUserFollowingMe > -1;
    else copyUser.isSignedMessageEnabled = true;
    
    copyUser.isAnonMessageEnabled =
      copyUser.allow_anon_dm && copyUser.isSignedMessageEnabled;

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: copyUser,
    });
  } catch (error) {
    const { status, data } = error.response;
    return res.status(500).json({
      code: status,
      status: 'error',
      message: data,
    });
  }
};
