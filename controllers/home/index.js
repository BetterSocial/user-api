const packageJSON = require('../../package.json')

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
const home = async(req, res) => {
    return res.status(200).json({
        app: "BetterSocial",
        version: packageJSON.version
    })
}

module.exports = home