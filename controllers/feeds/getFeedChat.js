const {UserBlockedUser} = require ('../../databases/models')
const getstreamService = require("../../services/getstream");



const getFeedChatService = async (req, res) => {
    try {
        const blockList = await UserBlockedUser.count({
            where: {
                user_id_blocker: req.userId
            }
        })
        const data = await getstreamService.notificationGetNewFeed(req.userId, req.token)
        let newFeed = []
        console.log(blockList,'sumba')
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
                    block: blockList,
                    comments: []
                }
                a.push(newGroup[activity_id])
            }
            newGroup[activity_id].comments.push({reaction: b.reaction, actor: b.actor})
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