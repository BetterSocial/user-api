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
            const activity_id = (b.reaction && b.reaction.activity_id) || b.id
            const downvote = typeof b.object === 'object' ? b.object.reaction_counts.downvotes : 0
            const upvote = typeof b.object === 'object' ? b.object.reaction_counts.upvotes : 0
            const totalVote = upvote - downvote
            let actor = b.actor.data
            const isAnonym = typeof b.object === 'object' ? b.object.anonimity : b.anonimity
            if(isAnonym) {
                actor = {...actor, data: {
                    username: "Anonymous"
                }}
            }
            if(!newGroup[activity_id]) {
                newGroup[activity_id] = {
                    activity_id: activity_id,
                    titlePost: b.object.message,
                    downvote: totalVote < 0 ? totalVote * -1 : 0, 
                    upvote: totalVote > 0 ? totalVote : 0,
                    block: blockList,
                    postMaker: actor,
                    isAnonym: b.object.anonimity ,
                    comments: [],
                    data: {
                        last_message_at: typeof b.reaction === 'object' ? b.reaction.updated_at : b.time,
                        updated_at: typeof b.reaction === 'object' ? b.reaction.updated_at : b.time
                    }
                }
                a.push(newGroup[activity_id])
            }
            let myReaction = b.reaction
            if(!myReaction) {
                myReaction = {
                    created_at: b.time,
                    updated_at: b.time,
                    data: {
                        count_downvote: downvote,
                        count_upvote: upvote,
                        text: null
                    },
                    parent: "",
                    actor:b.actor
                }
            }
            newGroup[activity_id].comments.push({reaction: myReaction, actor: b.actor})
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