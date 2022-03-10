/**
 * 
 * @param {String} userId 
 * @param {Object} postBody 
 */

const formatLocationGetStream = require("../helpers/formatLocationGetStream");

const handlePostTO = (userId, postBody) => {
    let {
        privacy,
        topics,
        location,
    } = postBody;

    let TO = []
    // TO.push(`user_exc:${userId}`)

    if(privacy === "public") {
        TO.push(`user:${userId}`)
        TO.push("location:everywhere");

        if (topics !== null) {
            topics.map((value) => {
                TO.push("topic:" + value);
            });
        }

        if (location !== null) {
            let loc = formatLocationGetStream(location);
            TO.push("location:" + loc);
        }
    }

    console.log(TO)
    return TO
}

module.exports = {
    handlePostTO
}