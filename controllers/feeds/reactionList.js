const UsersFunction = require("../../databases/functions/users")
const reactionList = require("../../vendor/getstream/feed/reactionList")
const moment = require('moment')
const {User} = require ('../../databases/models')
const Getstream = require("../../vendor/getstream")
const { getAnonymUser } = require("../../utils/getAnonymUser")
const { handleAnonymousData } = require("../../utils")

module.exports = async(req, res) => {
    try {
        const {params, query} = req
        const post = await Getstream.feed.getPlainFeedById(params.id)
        const myAnonymousId = await getAnonymUser(req.userId)
        const reaction = await reactionList(params.id, query.kind, query.limit)
        const sortByDate = reaction.results.sort((a, b) => moment(a.created_at).unix() -  moment(b.created_at).unix())
        const removeSensitiveData = await Promise.all(sortByDate.map(async(data) => {
            const anonymId = await getAnonymUser(data.user_id)
            let children = data.latest_children?.comment || []
            children.map((dataChildren) => {
                return handleAnonymousData(dataChildren, req, post.actor.id, myAnonymousId, anonymId)
            })
            return handleAnonymousData(data, req, post.actor.id, myAnonymousId, anonymId)
        })) 

        res.status(200).send({success: true, data: removeSensitiveData, message: 'success get reaction data', total: removeSensitiveData.length})
    } catch(e) {
        res.status(400).send({success: false, data: [], message: 'failed to get reaction list', error: e})

    }

}