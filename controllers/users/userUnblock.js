const Validator = require('fastest-validator');
const { v4: uuidv4 } = require("uuid");

const {sequelize, UserBlockedUser, UserFollowUser} = require("../../databases/models");
const { getIdBlockFeed } = require('../../utils/block');
const { delCache } = require('../../services/redis');
const getstreamService = require("../../services/getstream");

const v = new Validator();

module.exports = async(req,res) => {
    try {
        const schema = {
            userId: "string"
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

    let {userId} = req.body;
    let myUserId = req.userId;

    try {
        const result = await sequelize.transaction(async (t) => {
            await UserBlockedUser.destroy({
                where : {
                    user_id_blocker : myUserId,
                    user_id_blocked : userId
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
        } 
        
        const key = getIdBlockFeed(req.userId);
        delCache(key);
    
        const scoringProcessData = {
          user_id: req.userId,
          feed_id: req.body.postId,
          unblocked_user_id: req.body.userId,
          activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        };
        await addForBlockUser(scoringProcessData);
    } catch (e) {
        return res.status(403).json({
            code: 403,
            status: "error",
            message: `error unblocking : ${e}`,
        });
    }
}
