const { Op } = require("sequelize");
const { User, sequelize } = require("../../databases/models");
module.exports = async (req, res) => {
    let { name } = req.query

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