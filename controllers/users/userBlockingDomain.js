const {UserBlockedDomain, UserBlockedDomainHistory, sequelize} = require('../../databases/models');
const {v4: uuidv4} = require('uuid');
const Validator = require('fastest-validator');
const delCache = require('../../services/redis/delCache');
const {BLOCK_DOMAIN_KEY} = require('../../helpers/constants');
const {getIdBlockDomain} = require('../../utils/block');
const v = new Validator();
module.exports = async (req, res) => {
  console.log(req.body, 'makal');
  try {
    const schema = {
      domainId: {type: 'string'},
      reason: {type: 'array', optional: true},
      message: {type: 'string', optional: true},
      source: {type: 'string'}
    };
    const validate = await v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: 'error',
        message: validate
      });
    }
    const result = await sequelize.transaction(async (t) => {
      const reason = {
        reason: req.body.reason ? req.body.reason : null,
        message: req.body.message ? req.body.message : null
      };
      const domainBlock = {
        user_blocked_domain_id: uuidv4(),
        user_id_blocker: req.userId,
        domain_page_id: req.body.domainId,
        reason_blocked: reason
      };
      const blockDomain = await UserBlockedDomain.create(domainBlock, {
        transaction: t
      });
      const userBlockDomainHistory = {
        user_blocked_domain_history_id: uuidv4(),
        user_id_blocker: req.userId,
        domain_page_id: req.body.domainId,
        action: 'out',
        source: req.body.source
      };
      const history = await UserBlockedDomainHistory.create(userBlockDomainHistory, {
        transaction: t
      });
      return history;
    });
    const MY_KEY = getIdBlockDomain(req.userId);
    delCache(MY_KEY);
    res.json({
      message: 'The domain has been successfully blocked',
      code: 200,
      data: result,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error,
      data: '',
      status: 'error'
    });
  }
};
