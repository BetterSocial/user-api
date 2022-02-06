const {UserBlockedUser} = require ('../../databases/models')
const getstreamService = require("../../services/getstream");



const getFeedChatService = async (req, res) => {
    try {
        const data = await getstreamService.notificationGetNewFeed(req.userId, req.token)
        const blockList = await UserBlockedUser.findAll({
            where: {
                user_id_blocker: req.userId
            }
        })
        console.log(blockList, 'mantap')
        let newFeed = []
        for (let i = 0; i < data.results.length; i++) {
            newFeed.push(...data.results[i].activities)
        }
        let newGroup = {}
        const groupingFeed = newFeed.reduce((a,b, index) => {
            const activity_id = b.reaction.activity_id
            if(!newGroup[activity_id]) {
                newGroup[activity_id] = {
                    activity_id: activity_id,
                    titlePost: b.object.message,
                    downvote: b.object.count_downvote, 
                    upvote: b.object.count_upvote,
                    block: blockList.length,
                    comments: []
                }
                a.push(newGroup[activity_id])
            }
            if(newGroup[activity_id].comments.length <= 0) {
                newGroup[activity_id].comments.push({reaction: b.reaction, actor: b.actor})
            }
            return a
        }, [])
        res.status(200).send({
            success: true,
            data: groupingFeed,
            message: "Success get data",
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