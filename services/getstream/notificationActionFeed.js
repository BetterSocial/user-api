const stream = require("getstream");


const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );

const notificationCommentFeed = async (body) => {
    const processNotif =  client.reactions.add(body.kind, body.activityId, { text: body.message }, {targetFeeds: [`notification:${body.useridFeed}`], userId: body.userid})
    return processNotif
}

module.exports = {
    notificationCommentFeed
}