const { Op } = require("sequelize")

const getAllLocationByIds = async (locationModel, ids = [], t = null) => {
    if (ids.length === 0) return []
    try {
        const locations = await locationModel.findAll({
            where: {
                location_id: {
                    [Op.in]: ids
                }
            },
            raw: true
        }, { transaction: t })

        console.log('locations in function')
        console.log(locations)
        return Promise.resolve(locations)
    } catch (e) {
        console.log(e)
        return  Promise.resolve([])
    }
}

module.exports = getAllLocationByIds