const ClientError = require("../../exceptions/ClientError");
const TopicService = require("../../services/postgres/TopicService");
const TopicValidator = require("../../validators/topic");
const topics = require("./topics");
const getFollowedTopic = require("./getFollowedTopic");
const { Topics, UserTopic, UserTopicHistory, sequelize } = require("../../databases/models");
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
        let message = result ? 'Success delete topic user' : 'Success add topic user';
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

const getTopics = async (req, res) => {
    let { name } = req.query;
    console.log(name);
    let query = `select topic_id, name,icon_path, categories, flg_show,  count(*) as follower from (Select * from topics where name ILIKE'%${name}%')as topics join user_topics Using (topic_id) group by topics.name, topics.topic_id, topics.icon_path, topics.categories, topics.created_at, topics.flg_show order by follower desc`;
    try {
        // let topicService = new TopicService(Topics);
        // let topics = await topicService.search(name);
        // // todo mendapatkan topic paling popular berdasarkan banyak user yang follow
        // let ids = topics.map(item => {
        //     return item.topic_id;
        // });
        const [results, metadata] = await sequelize.query(query,
            {
                raw: false
            }
        )

        // console.log(ids);

        // const { count, rows } = await UserTopic.findAndCountAll({
        //     where: {
        //         'topic_id': { in: ids }
        //     }
        // });
        // console.log(count);
        // console.log(rows);


        // console.log(countRes);


        let message = 'Success get topic user';
        return res.json({
            status: "success",
            code: 200,
            message,
            data: results,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            "code": 500,
            "message": 'Internal server error'
        })
    }
}

module.exports = {
    topics,
    putFollowTopic,
    getFollowTopic,
    getFollowedTopic,
    getTopics
};
