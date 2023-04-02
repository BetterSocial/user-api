const GetstreamSingleton = require("../singleton");

module.exports = async(reactionId) => {
    if(!reactionId) throw new Error("Reaction ID is required");
    // if(!activityId) throw new Error("Activity ID is required");

    const client = GetstreamSingleton.getInstance();
    const reaction = await client.reactions.get(reactionId)

    if(!reaction) Promise.reject(new Error("Reaction not found"));
    return Promise.resolve(reaction);
}