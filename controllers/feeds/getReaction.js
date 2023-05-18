const UsersFunction = require("../../databases/functions/users");
const getstreamService = require("../../services/getstream");
const {User} = require ('../../databases/models')

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      activity_id: "string|empty:false",
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    let {activity_id, limit} = req.body;
    const token = req.token;
    const anonymUser = await UsersFunction.findAnonymousUserId(User, req.userId)
    getstreamService
      .getReaction(activity_id, token, limit)
      .then((result) => {
        let mappingNewRes = result.results.map((dataUser) => {
          let is_you = false
          if(dataUser?.data?.anon_user_info_emoji_name) {
            if(anonymUser.user_id === dataUser.user_id) is_you = true
            return {...dataUser, user_id:null, user: {}, is_you}
          }
          if(dataUser?.user_id === req.userId) {
            is_you = true
          }
          return {...dataUser, is_you}
        })
        res.status(200).json({
          status: "success",
          data: mappingNewRes,
        });
      })
      .catch((err) => {
        res.status(403).json({
          status: "failed",
          data: null,
          error: err,
        });
      });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};