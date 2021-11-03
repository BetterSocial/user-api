const Validator = require('fastest-validator');
const {UserBlockedUser} = require('../../databases/models');
const v = new Validator();

module.exports = async(req,res) => {
    try {
        const schema = {
            user_id : "string"
        }

        const validate = v.validate(req.body, schema);
        if(validate.length) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: validate,
            });
        }
    } catch(e) {
        return res.status(403).json({
            code: 403,
            status: "error",
            message: `error validating : ${e}`,
        });
    }

    try {
        let {user_id} = req.body
        let userIdBlockedStatus = await UserBlockedUser.findAll({
            where : {
                user_id_blocked : user_id,
                user_id_blocker : myUserId
            }
        })

        if(userIdBlockedStatus.length > 0) {
            return res.status(200).json({
                code: 200,
                status: "success",
                message: `You block this user`,
                data : {
                    blocked : false,
                    blocker : true,
                }
            })
        }

        let userIdBlockerStatus = await UserBlockedUser.findAll({
            where : {
                user_id_blocked : myUserId,
                user_id_blocker : user_id
            }
        })

        if(userIdBlockerStatus.length > 0) {
            return res.status(200).json({
                code: 200,
                status: "success",
                message: `This user blocks you`,
                data : {
                    blocked : true,
                    blocker : false,
                }
            })
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: ``,
            data : {
                blocked : false,
                blocker : false,
            }
        })
    } catch (e) {
        return res.status(403).json({
            code: 403,
            status: "error",
            message: `error getting data : ${e}`,
        });
    } 
}