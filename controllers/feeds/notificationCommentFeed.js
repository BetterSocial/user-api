const getstreamService = require("../../services/getstream");

module.exports = async (req, res) => {
    let body = req.body
    body = {
        ...body,
        userid: req.userId,
        kind: req.params.kind,
        useridFeed: req.body.userid
    }
    try {
        
        const process = await getstreamService.notificationCommentFeed(body)
        res.status(200).send({
            success: true,
            message: "Success create notifucation"
        })
       
    } catch (e) {
        res.status(400).send({
            success: false,
            message: String(e)
        })
    }
}