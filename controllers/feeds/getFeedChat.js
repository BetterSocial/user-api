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
        for (let i = 0; i < data.results.length; i++) {
            newFeed.push(...data.results[i].activities)
        }
        let newGroup = {}
        const groupingFeed = newFeed.reduce((a,b, index) => {
            const activity_id = b.reaction.activity_id
            const downvote = b.object.reaction_counts.downvotes || 0
            const upvote = b.object.reaction_counts.upvotes || 0
            const totalVote = upvote - downvote
            if(!newGroup[activity_id]) {
                newGroup[activity_id] = {
                    activity_id: activity_id,
                    titlePost: b.object.message,
                    downvote: totalVote < 0 ? totalVote * -1 : 0, 
                    upvote: totalVote > 0 ? totalVote : 0,
                    block: blockList,
                    postMaker: b.object.actor,
                    comments: [],
                    data: {
                        last_message_at: b.reaction.updated_at,
                        updated_at: b.reaction.updated_at
                    }
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