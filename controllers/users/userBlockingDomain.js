const {
  UserBlockedDomain,
  UserBlockedDomainHistory,
  sequelize,
} = require("../../databases/models");
const { v4: uuidv4 } = require("uuid");
const Validator = require("fastest-validator");
const v = new Validator();
module.exports = async (req, res) => {
  try {
    const schema = {
      domainId: "string",
      reason: "array|optional:true",
      message: "string|optional:true",
      source: "string",
    };
    const validate = await v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    const reason = {
      reason: req.body.reason ? req.body.reason : null,
      message: req.body.message ? req.body.message : null,
    };
    const domainBlock = {
      user_blocked_domain_id: uuidv4(),
      user_id_blocker: req.userId,
      domain_page_id: req.body.domainId,
      reason_blocked: reason,
    };
    const result = await UserBlockedDomain.create(domainBlock);
    res.json({
      message: "The domain has been successfully blocked",
      code: 200,
      data: result,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error,
      data: "",
      status: "error",
    });
  }
};
