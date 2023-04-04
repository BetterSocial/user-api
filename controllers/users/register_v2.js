const Validator = require("fastest-validator");
const moment = require("moment");
const LocationFunction = require("../../databases/functions/location");
const TopicFunction = require("../../databases/functions/topics");

const UserFollowUserFunction = require("../../databases/functions/userFollowUser");
const UserLocationFunction = require("../../databases/functions/userLocation");
const UsersFunction = require("../../databases/functions/users");
const UserTopicFunction = require("../../databases/functions/userTopic");
const { sequelize } = require("../../databases/models");

const { 
    Topics,
    User,
    Locations,
} = require("../../databases/models");
const BetterSocialCore = require("../../services/bettersocial");
const BetterSocialCreateUser = require("../../services/bettersocial/user/BetterSocialCreateUser");
const { createRefreshToken } = require("../../services/jwt");
const { registerV2ServiceQueue } = require("../../services/redis");
const { addForCreateAccount } = require("../../services/score");
const Getstream = require("../../vendor/getstream");


const v = new Validator()

/**
 * 
 * @param {import("express").Request} req 
 * @param {Response} res 
 */
const registerV2 = async (req, res) => {
    let token, refresh_token;

    /**
     * @type {RegisterBody}
     */
    const { data } = req.body;
    const { users, follows, local_community, topics } = data;
    
    let insertedObject = {};

    /**
     * Inserting data to Postgres DB
     */
    try {
        insertedObject = await sequelize.transaction(async (t) => {
            const user = await UsersFunction.register(User, users, t);
            const anonymousUser = await UsersFunction.registerAnonymous(User, user?.user_id, t);

            const topicRegistered = await TopicFunction.findAllByTopicIds(Topics, topics, t, true);
            const locations = await LocationFunction.getAllLocationByIds(Locations, local_community, t);

            return {
                user,
                anonymousUser,
                topics: topicRegistered,
                locations
            };
        });
    } catch (e) {
        console.log('error on sql transaction', e);
        return res.status(500).json({
            status: "error on sql transaction",
            code: 500,
            message: e,
        });
    }
    /**
     * Inserting data to Postgres DB (END)
     */

    /**
     * Creating User to Getstream
     */
    try {        
        token = await BetterSocialCore.user.createUser(insertedObject?.user);
        await BetterSocialCore.user.createAnonymousUser(insertedObject?.anonymousUser);
    } catch (e) {
        console.log('error on inserting user to getstream creating', e);
        return res.status(500).json({
            status: "error on inserting user to getstream creating",
            code: 500,
            message: e,
        });
    }
    try {        
        refresh_token = await createRefreshToken(insertedObject?.user?.user_id);
    } catch (e) {
        console.log('error on inserting user to getstream creating refresh token', e);
        return res.status(500).json({
            status: "error on inserting user to getstream creating refresh token",
            code: 500,
            message: e,
        });
    }
    /**
     * Creating User to Getstream (END)
     */

    /**
     * Creating register user queue
     */
    try {    
        await registerV2ServiceQueue(
            token,
            insertedObject?.user?.user_id,
            follows || [],
            insertedObject?.topics,
            insertedObject?.locations,
            insertedObject?.anonymousUser?.user_id
        );    
    } catch(e) {
        console.log('error on inserting user to queue', e);
        return res.status(500).json({
            status: "error on inserting user to queue",
            code: 500,
            message: e,
        });
    }
    /**
     * Creating register user queue (END)
     */

    /**
     * Creating scoring queue
     */
    try {
        const scoringQueueTopic = insertedObject?.topics?.map((topic) => {
            let temp = Object.assign({}, topic.dataValues);
            return temp.name;
        })
        const scoringProcessData = {
            user_id: insertedObject?.user?.user_id,
            register_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            emails: [],
            twitter_acc: "",
            topics: scoringQueueTopic,
            follow_users: follows
        };
    
        addForCreateAccount(scoringProcessData);    
    } catch(e) {
        console.log('error on inserting score queue', e);
        return res.status(500).json({
            status: "error on inserting score queue",
            code: 500,
            message: e,
        });
    }
    /**
     * Creating scoring queue (END)
     */

    return res.status(200).json({
        status: "success",
        code: 200,
        data: insertedObject?.user,
        token: token,
        refresh_token: refresh_token,
    })
}

module.exports = registerV2;