const getstreamService = require('../../services/getstream');
const {
  UserBlockedPostAnonymous,
  UserBlockedPostAnonymousHistory,
  sequelize,
} = require('../../databases/models');
const { v4: uuidv4 } = require('uuid');
const Validator = require('fastest-validator');
const {
  responseSuccess,
  Response,
  ResponseSuccess,
} = require('../../utils/Responses');
const v = new Validator();

const Responses = require('../../utils/Responses');

module.exports = async (req, res) => {
  const schema = {
    postId: 'string',
    reason: 'array|optional:true',
    message: 'string|optional:true',
    source: 'string',
  };
  const validate = await v.validate(req.body, schema);
  if (validate.length) {
    return ResponseSuccess(res, validate, 400);
  }
  try {
    const { postId, reason, message } = req.body;

    const result = await sequelize.transaction(async (t) => {
      const reasonBlock = {
        reason: reason ? reason : null,
        message: message ? message : null,
      };
      const userBlock = {
        blocked_action_id: uuidv4(),
        user_id_blocker: req.userId,
        post_anonymous_id_blocked: postId,
        reason_blocked: reasonBlock,
      };
      const userBlockedPostAnonymous = await UserBlockedPostAnonymous.create(
        userBlock,
        { transaction: t }
      );

      const history = {
        user_blocked_post_anonymous_history_id: uuidv4(),
        user_id_blocker: req.userId,
        post_anonymous_id_blocked: postId,
        action: 'out',
        source: `postId:${postId}`,
      };

      const userBlockedPostAnonymousHistory =
        await UserBlockedPostAnonymousHistory.create(history, {
          transaction: t,
        });
    });

    return res
      .status(201)
      .json(responseSuccess('Success block post anonymous'));
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error,
      data: '',
      status: 'error',
    });
  }
};
