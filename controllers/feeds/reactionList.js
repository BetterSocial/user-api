const UsersFunction = require("../../databases/functions/users")
const reactionList = require("../../vendor/getstream/feed/reactionList")
const moment = require('moment')
const {User} = require ('../../databases/models')
const Getstream = require("../../vendor/getstream")
const { getAnonymUser } = require("../../utils/getAnonymUser")
const { handleAnonymousData } = require("../../utils")
const { POST_VERSION } = require("../../helpers/constants")

module.exports = async(req, res) => {
    try {
        const {params, query} = req
        const post = await Getstream.feed.getPlainFeedById(params.id)
        const myAnonymousId = await getAnonymUser(req.userId)
        
        let anonymActor = post?.actor?.id
        if(post?.anonymous && post?.version < POST_VERSION) anonymActor = await getAnonymUser(anonymActor)

        const reaction = await reactionList(params.id, query.kind, query.limit)
        const sortByDate = reaction.results.sort((a, b) => moment(a.created_at).unix() -  moment(b.created_at).unix())
        const removeSensitiveData = sortByDate.map((data) => {
            let children = data.latest_children?.comment || []
            children.map((dataChildren) => {
                return handleAnonymousData(dataChildren, req, post.actor.id, myAnonymousId, anonymActor)
            })
            return handleAnonymousData(data, req, post.actor.id, myAnonymousId, anonymActor)
        })

        res.status(200).send({success: true, data: removeSensitiveData, message: 'success get reaction data', total: removeSensitiveData.length})
    } catch(e) {
        res.status(400).send({success: false, data: [], message: 'failed to get reaction list', error: e})

    }

}