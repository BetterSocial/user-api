const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const Validator = require('fastest-validator');
const {sequelize, LogPolling, Polling, PollingOption} = require('../../databases/models');

const {NO_POLL_OPTION_UUID} = require('../../helpers/constants');

const v = new Validator();

module.exports = async (req, res) => {
  const {token} = req;
  const currentDataIsoString = new Date().toISOString();

  if (!token)
    return res.status(401).json({
      code: 401,
      message: 'Failed auth',
      data: null
    });

  const schema = {
    polling_id: 'string|empty:false',
    polling_option_id: 'string|empty:false'
  };

  const validated = v.validate(req.body, schema);
  if (validated.length)
    return res.status(403).json({
      message: 'Error validation',
      error: validated
    });

  const {polling_id, polling_option_id} = req.body;

  /*
        Get multiple choice flag
    */
  const polling = await Polling.findOne({
    where: {polling_id}
  });

  const {flg_multiple} = polling.toJSON();

  /*
        Check if polling user is author of the post
    */

  /*
    if(user_id === req.userId) return res.status(403).json({
        code : 403,
        message : "You cannot make a poll on your own post"
    })
    */

  /*
        Not a multiple choice : Check if there's a same log with same polling_id and by the same user
    */
  if (!flg_multiple) {
    const logPolling = await LogPolling.findOne({
      where: {polling_id, user_id: req.userId}
    });

    if (logPolling)
      return res.status(403).json({
        code: 403,
        message: 'You have poll in this post'
      });
  }

  /*
        A multiple choice : Check if there's a same log with same polling_option_id
    */
  if (flg_multiple) {
    if (polling_option_id !== NO_POLL_OPTION_UUID) {
      const logPolling = await LogPolling.findOne({
        where: {polling_option_id, user_id: req.userId}
      });

      if (logPolling)
        return res.status(403).json({
          code: 403,
          message: 'You have select this option for this post'
        });
    }
  }

  try {
    await sequelize.transaction(async (t) => {
      const currentTimeIsoString = moment().utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
      await LogPolling.create(
        {
          log_polling_id: uuidv4(),
          polling_option_id,
          polling_id,
          user_id: req.userId,
          created_at: currentTimeIsoString,
          updated_at: currentDataIsoString
        },
        {transaction: t}
      );

      if (polling_option_id !== NO_POLL_OPTION_UUID) {
        const pollingOption = await PollingOption.findOne(
          {
            where: {
              polling_option_id
            },
            order: [['created_at', 'ASC']]
          },
          {transaction: t}
        );

        const {counter} = pollingOption.toJSON();

        await pollingOption.update({
          counter: parseInt(counter, 10) + 1
        });
      }
    });

    return res.status(200).json({
      code: 200,
      status: 'input poll success',
      data: null
    });
  } catch (e) {
    return res.status(500).json({
      code: 500,
      status: 'input poll failed',
      data: null,
      error: e
    });
  }
};
