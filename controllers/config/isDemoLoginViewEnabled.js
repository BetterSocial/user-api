/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
const isDemoLoginViewEnabled = async (req, res) => {
    return res.status(200).json({
        success: process.env.IS_DEMO_LOGIN_ENABLED === 'true'
    })
}

module.exports = isDemoLoginViewEnabled