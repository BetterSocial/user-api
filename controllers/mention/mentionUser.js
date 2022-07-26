const { Op } = require("sequelize");
const { User } = require("../../databases/models");
module.exports = async (req, res) => {
    let { name } = req.params

    let users = await User.findAll({
        attributes: ['user_id', 'username'],
        where: {
            username: {
                [Op.like]: `%${name}%`
            }
        }
    })
    return res.status(200).json({
        'status': 'success',
        'data': users,
    })
}