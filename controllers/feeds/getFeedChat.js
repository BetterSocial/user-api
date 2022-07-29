const {UserBlockedUser} = require ('../../databases/models')
const getstreamService = require("../../services/getstream");
const moment = require('moment')


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
            const mapping = data.results[i].activities.map((feed) => ({...feed, isSeen: data.results[i].is_seen}))
            newFeed.push(...mapping)
        }
        let newGroup = {}
        const groupingFeed = newFeed.reduce((a,b, index) => {
            const localDate = moment.utc(b.time).local().format()
            console.log(b, 'babon')
            const activity_id = (b.reaction && b.reaction.activity_id) || b.id
            const downvote = typeof b.object === 'object' ? b.object.reaction_counts.downvotes : 0
            const upvote = typeof b.object === 'object' ? b.object.reaction_counts.upvotes : 0
            const message = typeof b.object === 'object' ? b.object.message : b.message
            const totalVote = upvote - downvote

            let actor = typeof b.object === 'object' ? b.object.actor : b.actor
            const isAnonym = typeof b.object === 'object' ? b.object.anonimity : b.anonimity
            if(isAnonym) {
                actor = {...actor, data: {
                    username: "Anonymous"
                }}
            }
            if(!newGroup[activity_id]) {
                newGroup[activity_id] = {
                    activity_id: activity_id,
                    isSeen: b.isSeen,
                    titlePost: message,
                    downvote: totalVote < 0 ? totalVote * -1 : 0, 
                    upvote: totalVote > 0 ? totalVote : 0,
                    block: blockList,
                    postMaker: actor,
                    isAnonym:isAnonym ,
                    comments: [],
                    data: {
                        last_message_at: localDate,
                        updated_at: localDate
                    },
               
                }
                a.push(newGroup[activity_id])
            }
            let myReaction = b.reaction
            if(myReaction) {
                newGroup[activity_id].comments.push({reaction: myReaction, actor: b.actor})
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