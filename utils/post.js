const {
    PollingOption,
    LogPolling,
    Topics,
    sequelize,
} = require("../databases/models");
const { NO_POLL_OPTION_UUID } = require("../helpers/constants");
const _ = require('lodash')
const uuid = require('uuid').v4

/**
 * 
 * @param {String} userId 
 * @param {Object} postBody 
 */

const formatLocationGetStream = require("../helpers/formatLocationGetStream");
const { convertTopicWithEmoji } = require("./custom");

const handleCreatePostTO = (userId, postBody) => {
    let {
        privacy,
        topics,
        location,
        message,
        tagUsers
    } = postBody;
    let TO = []
    if (tagUsers && Array.isArray(tagUsers)) {
        const mapTagUser = tagUsers.map((user) => `notification:${user}`)
        TO.push(...mapTagUser)
    }
    TO.push(`main_feed:${userId}`)
    TO.push(`notification:${userId}`)

    if (privacy.toLowerCase() === "public") {
        TO.push(`user:${userId}`)
        TO.push("location:everywhere");

        if (topics !== null) {
            filterAllTopics(message, topics).map((value) => {
                TO.push("topic:" + value);
            });
        }

        if (location !== null) {
            let loc = formatLocationGetStream(location);
            TO.push("location:" + loc);
        }
    }
    const removeDupilcate = _.union(TO)
    return removeDupilcate
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

const isPostBlocked = (item, listAnonymous, listBlock, myLocations, listAnonymousPostIds) => {
    // Check if this anonymous post is from the user that has other blocked anonymous post
    if (listAnonymous.includes(item?.actor?.id) && item?.anonimity) return true

    // Check if this users have been blocked
    if (listBlock.includes(item.actor.id)) return true

    // Check locations
    if (!myLocations.includes(item.location) && item.location != "Everywhere") return true

    return false
}

/**
 * 
 * @param {String} text 
 * @param {String[]} topics 
 * @returns {String[]}
 */
const filterAllTopics = (text, topics = []) => {
    const topicsFromText = text.match(/#([a-zA-Z0-9-_]+)\b/gi) || []
    let topicsFromTextWithoutHashtag = topicsFromText.reduce((acc, next) => {
        acc.push(next.slice(1))
        return acc
    }, [])

    return [...new Set([...topicsFromTextWithoutHashtag, ...topics])]
}

/**
 * 
 * @param {String[]} topics 
 */
const insertTopics = async (topics = []) => {
    let lastTopic = await Topics.findOne({
        order: [['topic_id', 'DESC']],
        limit: 1,
        raw: true
    })

    for (let index in topics) {
        let topic = topics[index]
        let topicIndex = parseInt(lastTopic.topic_id) + parseInt(index) + parseInt(1)

        try {
            let result = await Topics.findOrCreate({
                where: { name: topic },
                defaults: {
                    topic_id: topicIndex,
                    name: topic,
                    icon_path: '',
                    is_custom_topic: true,
                    created_at: new Date(),
                    categories: '',

                }
            })
        } catch (e) {
            console.log(e)
            break;
        }
    }
}

module.exports = {
    filterAllTopics,
    handleCreatePostTO,
    insertTopics,
    isPostBlocked,
    modifyAnonimityPost,
    modifyAnonymousAndBlockPost,
    modifyPollPostObject
}