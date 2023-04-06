const UsersFunction = require("../../databases/functions/users")
const reactionList = require("../../vendor/getstream/feed/reactionList")
const moment = require('moment')
const {User} = require ('../../databases/models')
const Getstream = require("../../vendor/getstream")
const { getAnonymUser } = require("../../utils/getAnonymUser")

module.exports = async(req, res) => {
    console.log(req.query, req.params, 'lala')
    try {
        const {params, query} = req
        const post = await Getstream.feed.getPlainFeedById(params.id)
        const myAnonymousId = await getAnonymUser(req.userId)
        const reaction = await reactionList(params.id, query.kind, query.limit)
        const sortByDate = reaction.results.sort((a, b) => moment(a.created_at).unix() -  moment(b.created_at).unix())
        const removeSensitiveData = sortByDate.map((data) => {
            if(data.data.anon_user_info_emoji_name) {
                return {...data, user_id: null, user: {}, target_feeds: [], is_you: myAnonymousId === data.user_id, is_author: data.user_id === post.actor.id}
            }
            return {...data, is_you: req.userId === data.user_id, is_author: data.user_id === post.actor.id}
        })

        res.status(200).send({success: true, data: removeSensitiveData, message: 'success get reaction data', total: removeSensitiveData.length})
    } catch(e) {
        res.status(400).send({success: false, data: [], message: 'failed to get reaction list'})

    }

}