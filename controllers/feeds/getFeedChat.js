const UsersFunction = require('../../databases/functions/users');
const {UserBlockedUser, User} = require ('../../databases/models')
const getstreamService = require("../../services/getstream");
const moment = require('moment')
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 0 } );

const getFeedChatService = async (req, res) => {
    try {
        const myAnonymousId = await UsersFunction.findAnonymousUserId(User, req.userId)
        const data = await getstreamService.notificationGetNewFeed(req.userId, req.token)
        let newFeed = []

        for (let i = 0; i < data.results.length; i++) {

            const mapping = data.results[i].activities.map((feed) => ({...feed, isSeen: data.results[i].is_seen, isRead: data.results[i].is_read }))
            newFeed.push(...mapping)
        }

        let newGroup = {}
        const groupingFeed = newFeed.reduce((a,b, index) => {
            const localDate = moment.utc(b.time).local().format()
            const activity_id = (b.reaction && b.reaction.activity_id) || b.id
            const downvote = typeof b.object === 'object' ? b.object.reaction_counts.downvotes : 0
            const upvote = typeof b.object === 'object' ? b.object.reaction_counts.upvotes : 0
            const totalComment = typeof b.object === 'object' ? b.object.reaction_counts.comment : 0
            const childComment = typeof b.object === 'object' ? b.object?.latest_reactions?.comment : [0]
            const mapCountLevel2 = childComment.map((comment) => comment?.children_counts?.comment || 0) || [0]
            let totalCommentLevel3 = []
            childComment.forEach((comment) => {
            const mapCount = comment?.latest_children?.comment?.map(
                (comment) => comment?.children_counts?.comment || 0
                    );
                    if (Array.isArray(mapCount)) {
                    totalCommentLevel3.push(...mapCount);
                }
            })
            let total3 = 0;

            if (totalCommentLevel3.length > 0) {
                total3 = totalCommentLevel3.reduce((a, b) => a + b);
            }
      console.log(total3, 'tata')
            // childComment?.latest_children?.comment?.forEach((comment) => {
            //     console.log(comment, 'sambal')
            // })
            const commentLevel2 = mapCountLevel2.reduce((a, b)=> a + b)
            const message = typeof b.object === 'object' ? b.object.message : b.message
            const constantActor = typeof b.object === 'object' ? b.object.actor : b.actor
            let actor = typeof b.object === 'object' ? b.object.actor : b.actor
            const isAnonym = typeof b.object === 'object' ? b.object.anonimity : b.anonimity
            const isOwnPost = actor.id === req.userId || actor.id === myAnonymousId.user_id
            if(isAnonym) {
                actor = {...actor, id: null, data: {
                    username: "Anonymous",
                }}
            }
            if(!newGroup[activity_id]) {
                newGroup[activity_id] = {
                    activity_id: activity_id,
                    isSeen: b.isSeen,
                    totalComment: totalComment + commentLevel2 + total3,
                    isOwnPost,
                    totalCommentBadge: 0,
                    isRead:b.isRead,
                    unreadComment: !b.isRead ? 1 : 0,
                    type: "post-notif",
                    titlePost: message,
                    downvote: downvote || 0, 
                    upvote: upvote || 0,
                    // block: b.blockCount,
                    postMaker: actor,
                    isAnonym:isAnonym ,
                    comments: [],
                    data: {
                        last_message_at: localDate,
                        updated_at: localDate
                    },
               
                }
                if(actor && typeof actor === 'object') {
                    a.push(newGroup[activity_id])
                }
            }
            let myReaction = b.reaction
            if(myReaction) {
                myReaction = {...myReaction,isOwningReaction: req.userId === myReaction.user_id || myReaction.user_id === myAnonymousId.user_id }
                if(myReaction.data.is_anonymous || myReaction.data.anon_user_info_emoji_name) {
                    myReaction = {...myReaction,  user_id: null, user: {}, }
                }
                newGroup[activity_id].comments.push({reaction: myReaction, actor: myReaction.data.is_anonymous ||  myReaction.data.anon_user_info_emoji_name ?  {} : constantActor})
                // newGroup[activity_id].totalComment = newGroup[activity_id].comments.filter((data) => data.reaction.kind === 'comment').length || 0
                newGroup[activity_id].totalCommentBadge = newGroup[activity_id].comments.filter((data) => constantActor.id !== req.userId && data.reaction.kind === 'comment').length || 0
                
            }
            return a
        }, [])
        let feedGroup = []
        for(let i = 0; i < groupingFeed.length; i++) {
            const blockCount = await UserBlockedUser.count({
                where: {
                    post_id: groupingFeed[i].activity_id
                }
            })
            feedGroup.push({...groupingFeed[i], block: blockCount})
        }
        res.status(200).send({
            success: true,
            data:feedGroup,
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