const getstreamService = require("../../services/getstream");


const getFeedChatService = async (req, res) => {
    try {
        console.log(req.userId, 'jamanlu')
        const data = await getstreamService.notificationGetNewFeed(req.userId, req.token)
        res.status(200).send({
            success: true,
            data: data.results,
            message: "Success get data"
        })
    } catch (e) {
        res.status(400).json({
            success: false,
            data: null,
            message: String(e)
        })
    }

}


module.exports = {
    getFeedChatService
}