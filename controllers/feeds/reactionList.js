const reactionList = require("../../vendor/getstream/feed/reactionList")
const moment = require('moment')

module.exports = async(req, res) => {
    console.log(req.query, req.params, 'lala')
    try {
        const {params, query} = req
        const reaction = await reactionList(params.id, query.kind, query.limit)
        const sortByDate = reaction.results.sort((a, b) => moment(a.created_at).unix() -  moment(b.created_at).unix())
        const removeSensitiveData = sortByDate.map((data) => {
            if(data.data.anon_user_info_emoji_name) {
                return {...data, user_id: null, user: {}, target_feeds: []}
            }
            return {...data}
        })
        res.status(200).send({success: true, data: removeSensitiveData, message: 'success get reaction data', total: removeSensitiveData.length})
    } catch(e) {
        res.status(400).send({success: false, data: [], message: 'failed to get reaction list'})

    }

}