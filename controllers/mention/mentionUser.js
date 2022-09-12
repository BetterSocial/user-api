const { Op } = require("sequelize");
const { User } = require("../../databases/models");
module.exports = async (req, res) => {
    let { name } = req.params

    let data = [];
    let users = await User.findAll({
        attributes: ['user_id', 'username'],
        where: {
            username: {
                [Op.iLike]: `%${name}%`
            }
        }
    })
    data.push(users);
    return res.status(200).json({
        'status': 'success',
        'data': data,
    })
}