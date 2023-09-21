const Validator = require('fastest-validator');
const v = new Validator();
const getstreamService = require('../../services/getstream');

exports.createToken = async (req, res) => {
  const schema = {
    user_id: 'string|empty:false'
  };
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(403).json({
      code: 403,
      status: 'error',
      message: validate
    });
  }
  let {user_id} = req.body;
  const userToken = await getstreamService.createToken(user_id);
  return res.status(200).json({
    id: user_id,
    token: userToken
  });
};
