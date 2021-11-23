const ClientError = require("../../exceptions/ClientError");
const TopicService = require("../../services/postgres/TopicService");
const TopicValidator = require("../../validators/topic");
const topics = require("./topics");
const { Topics, UserTopic, UserTopicHistory } = require("../../databases/models");
const UserTopicService = require("../../services/postgres/UserTopicService");

const getFollowTopic = async (req, res) => {
    try {
        // validasi inputan user
        let { name } = req.query;
        TopicValidator.validatePutTopicFollow({ name })
        // toDo  get topic id menggunakan name dari parameter
        let topicService = new TopicService(Topics);
        let topic = await topicService.getTopicByName(name);
        let { topic_id } = topic;
        // mendapatkan user_topic menggunakan user_id dan topic id
        let userTopicService = new UserTopicService(UserTopic, UserTopicHistory);
        let result = await userTopicService.getUserTopic(req.userId, topic_id);
        res.status(200).json({
            status: "success",
            code: 200,
            data: result,
        });

    } catch (error) {
        console.log(error);
        if (error instanceof ClientError) {
            return res.status(error.statusCode).json({
                "code": error.statusCode,
                "status": 'fail',
                "message": error.message,
                "data": "null"
            });
        }
        return res.status(500).json({
            "code": error.statusCode,
            "status": 'error',
            "message": 'Internal server error',
            "data": "null"
        });
    }
}
const putFollowTopic = async (req, res) => {
    try {
        // validasi inputan user
        let { name } = req.body;
        TopicValidator.validatePutTopicFollow({ name })
        // toDo  get topic id menggunakan name dari parameter
        let topicService = new TopicService(Topics);
        let topic = await topicService.getTopicByName(name);
        let { topic_id } = topic;
        // mendapatkan user_topic menggunakan user_id dan topic id
        let userTopicService = new UserTopicService(UserTopic, UserTopicHistory);
        let result = await userTopicService.followTopic(req.userId, topic_id);
        let message = result ? 'Success delete topic user' : 'Success add topic user'
        res.status(200).json({
            status: "success",
            code: 200,
            data: !result,
            message
        });

    } catch (error) {
        console.log(error);
        if (error instanceof ClientError) {
            return res.status(error.statusCode).json({
                "code": error.statusCode,
                "status": 'fail',
                "message": error.message,
                "data": "null"
            });
        }
        return res.status(500).json({
            "code": error.statusCode,
            "status": 'error',
            "message": 'Internal server error',
            "data": "null"
        });
    }
}

module.exports = {
    topics,
    putFollowTopic,
    getFollowTopic,
};
