const {
    PollingOption,
    LogPolling,
    sequelize,
} = require("../databases/models");
const { NO_POLL_OPTION_UUID } = require("../helpers/constants");
const _ = require('lodash')

/**
 * 
 * @param {String} userId 
 * @param {Object} postBody 
 */

const formatLocationGetStream = require("../helpers/formatLocationGetStream");

const handleCreatePostTO = (userId, postBody) => {
    let {
        privacy,
        topics,
        location,
    } = postBody;

    let TO = []
    TO.push(`main_feed:${userId}`)
    TO.push(`notification:${userId}`)

    if (privacy === "public") {
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

    return TO
}

const modifyPollPostObject = async (userId, item) => {
    let post = { ...item };
    let pollOptions = await PollingOption.findAll({
        where: {
            polling_option_id: item.polls,
        },
    });

    let pollingOptionsId = pollOptions.reduce((acc, current) => {
        acc.push(current.polling_id);
        return acc;
    }, []);

    let logPolling = await LogPolling.findAll({
        where: {
            polling_id: pollingOptionsId,
            user_id: userId,
        },
    });

    if (logPolling.length > 0) {
        if (item.multiplechoice) post.mypolling = logPolling;
        else post.mypolling = logPolling[0];
        post.isalreadypolling = true;
    } else {
        post.isalreadypolling = false;
        post.mypolling = [];
    }

    let distinctPollingByUserId = await sequelize.query(
        `SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id='${item.polling_id}' AND polling_option_id !='${NO_POLL_OPTION_UUID}'`
    );
    let voteCount = distinctPollingByUserId[0].length;

    post.pollOptions = pollOptions;
    post.voteCount = voteCount;

    return post
}

const modifyAnonymousAndBlockPost = async (feeds, listBlockUser, listBlockDomain, listPostAnonymous) => {

    let listBlock = String(listBlockUser + listBlockDomain);
    // let yFilter = listBlockUser.map((itemY) => {
    //   return itemY.user_id_blocked;
    // });
    // let filteredX = feeds.filter(
    //   (itemX) => !yFilter.includes(itemX.actor.id)
    // );
    // let newArr = feeds.reduce((feed, current) => {
    //   if (!yFilter.includes(current.actor.id)) {
    //     feed.push(current);
    //   }
    //   return feed;
    // }, []);

    let newArr = await _.filter(feeds, function (o) {
        return !listBlock.includes(o?.actor?.id);
    });

    let listAnonymous = listPostAnonymous.map((value) => {
        return value.post_anonymous_id_blocked;
    });

    let feedWithAnonymous = newArr.reduce((feed, current) => {
        if (!listAnonymous.includes(current?.id)) {
            feed.push(current);
        }
        return feed;
    }, []);

    return feedWithAnonymous
}

const modifyAnonimityPost = (item) => {
    let newItem = { ...item }

    if (newItem.anonimity) {
        newItem.actor = {}
        newItem.to = []
        newItem.origin = null
        newItem.object = ""
    }

    return newItem
}

const isPostBlocked = (item, listAnonymousAuthor, listBlock) => {
    if (listAnonymousAuthor.includes(item.actor.id) && item.anonimity) return true
    if (listBlock.includes(item.actor.id)) return true

    return false
}

module.exports = {
    handleCreatePostTO,
    isPostBlocked,
    modifyAnonimityPost,
    modifyAnonymousAndBlockPost,
    modifyPollPostObject
}