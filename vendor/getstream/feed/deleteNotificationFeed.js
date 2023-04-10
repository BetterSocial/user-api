const GetstreamSingleton = require("../singleton")

const deleteNotificationFeed = async(userId, activityId) => {
    const client = GetstreamSingleton.getInstance()
    return client.feed(`notification`, userId).removeActivity(activityId)
}

module.exports = deleteNotificationFeed