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

            console.log('transaction 2')

            const result = await UserFollowUser.findAll({
                where : {
                    user_id_follower : myUserId,
                    user_id_followed : userId,
                }
            }, 
            {
                transaction : t
            })

            if(result.length === 0) {
                await UserFollowUser.create({
                    follow_action_id: uuidv4(),
                    user_id_follower : myUserId,
                    user_id_followed : userId,
                },
                {
                    transaction: t
                })    
            }
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
        
        await getstreamService.followUser(req.token, userId, "user", 1);
        res.json({
            message: "The user has been successfully unblocked",
            code: 200,
            data: result,
            status: "success",
        });
    } catch (e) {
        return res.status(403).json({
            code: 403,
            status: "error",
            message: `error unblocking : ${e}`,
        });
    }
}