const { User, UserFollowUser } = require("../../databases/models");
const Validator = require("fastest-validator");
const checkMoreOrLess = require('../../helpers/checkMoreOrLess').checkMoreOrLess;
const url = require("url");

const v = new Validator();

module.exports = async (req, res) => {
  try {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    const schema = {
      other_user_id: "string|empty:false",
    };
    const validate = v.validate(query, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    let { other_user_id } = query;

    const user = await User.findByPk(other_user_id, {
      include: [
        {
          model: UserFollowUser,
          as: "following",
        },
        {
          model: UserFollowUser,
          as: "follower",
        },
      ],
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User not found",
      });
    } else {
      let copyUser = { ...user.dataValues };
      delete copyUser.following;
      delete copyUser.follower;
      
      copyUser.following = user.dataValues.following.length;
      copyUser.following_symbol = checkMoreOrLess(user.dataValues.following.length)
      copyUser.follower = user.dataValues.follower.length;
      copyUser.follower_symbol = checkMoreOrLess(user.dataValues.follower.length)

      let findIndex = user.dataValues.follower.findIndex((value) => value.user_id_follower === req.params.id)
      copyUser.is_following = findIndex > -1 ? true : false

      return res.json({
        status: "success",
        code: 200,
        data: copyUser,
      });
    }
  } catch (error) {
    const { status, data } = error.response;
    return res.status(500).json({
      code: status,
      status: "error",
      message: data,
    });
  }
};
