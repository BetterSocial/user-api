const Validator = require('fastest-validator');
const { v4: uuidv4 } = require("uuid");

const {sequelize, UserBlockedDomain, UserFollowDomain} = require("../../databases/models");


const v = new Validator();

const unblockDomain = async (req, res) => {
    try {
        const schema = {
            domain_page_id: {type: "string" }
        };

        const validate = await v.validate(req.body, schema);
        if (validate.length) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: `error validating : ${validate}`,
            });
        }
    } catch (e) {
        return res.status(403).json({
            code: 403,
            status: "error",
            message: `error trying to validate : ${e}`,
        });
    }

    let {domain_page_id} = req.body;
    let myUserId = req.userId;

    try {
        const result = await sequelize.transaction(async (t) => {
            await UserBlockedDomain.destroy({
                where : {
                    user_id_blocker : myUserId,
                    domain_page_id : domain_page_id
                }
            }, 
            {
                transaction : t
            })
        })

        if (result === null) {
            return res.status(409).json({
              code: 409,
              status: "error",
              message: "error create data",
            });
        } else {
            return res.status(200).json({
                code: 200,
                status: true,
                message: 'Success unblock domain'
            }) 
        }
  
    } catch (e) {
        return res.status(403).json({
            code: 403,
            status: "error",
            message: `error unblocking : ${e}`,
        });
    }
}

module.exports = {
    unblockDomain
}