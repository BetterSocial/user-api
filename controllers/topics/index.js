/* eslint-disable no-underscore-dangle */
const {QueryTypes} = require('sequelize');
const {followMainFeedTopic, unfollowMainFeedTopic} = require('../../services/getstream');
const ClientError = require('../../exceptions/ClientError');
const TopicService = require('../../services/postgres/TopicService');
const TopicValidator = require('../../validators/topic');
const topics = require('./topics');
const getFollowedTopic = require('./getFollowedTopic');
const {Topics, UserTopic, UserTopicHistory, sequelize} = require('../../databases/models');
const UserTopicService = require('../../services/postgres/UserTopicService');

const getFollowTopic = async (req, res) => {
  try {
    // validasi inputan user
    const {name} = req.query;
    TopicValidator.validatePutTopicFollow({name});
    // toDo  get topic id menggunakan name dari parameter
    const topicService = new TopicService(Topics);
    const topic = await topicService.getTopicByName(name);
    const {topic_id} = topic;
    // mendapatkan user_topic menggunakan user_id dan topic id
    const userTopicService = new UserTopicService(UserTopic, UserTopicHistory);
    const result = await userTopicService.getUserTopic(req.userId, topic_id);
    return res.status(200).json({
      status: 'success',
      code: 200,
      data: result
    });
  } catch (error) {
    console.log(error);
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        code: error.statusCode,
        status: 'fail',
        message: error.message,
        data: 'null'
      });
    }
    return res.status(500).json({
      code: error.statusCode,
      status: 'error',
      message: 'Internal server error',
      data: 'null'
    });
  }
};
const putFollowTopic = async (req, res) => {
  try {
    // validasi inputan user
    const {name} = req.body;
    TopicValidator.validatePutTopicFollow({name});
    // toDo  get topic id menggunakan name dari parameter
    const topicService = new TopicService(Topics);
    const topic = await topicService.getTopicByName(name);
    const {topic_id} = topic;
    // mendapatkan user_topic menggunakan user_id dan topic id
    const userTopicService = new UserTopicService(UserTopic, UserTopicHistory);
    const result = await userTopicService.followTopic(req.userId, topic_id);
    const message = result ? 'Success delete topic user' : 'Success add topic user';
    return res.status(200).json({
      status: 'success',
      code: 200,
      data: !result,
      message
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        code: error.statusCode,
        status: 'fail',
        message: error.message,
        data: 'null'
      });
    }
    return res.status(500).json({
      code: error.statusCode,
      status: 'error',
      message: 'Internal server error',
      data: 'null'
    });
  }
};

const getTopics = async (req, res) => {
  const {name} = req.query;

  try {
    const results = await sequelize.query(
      `SELECT 
            "Topic".*,
            count("topicFollower"."user_id") 
                AS "followersCount"
            FROM "topics" 
                AS "Topic" 
            LEFT OUTER JOIN "user_topics" 
                AS "topicFollower" 
            ON "Topic"."topic_id" = 
                "topicFollower"."topic_id" 
            WHERE 
                "Topic"."name" ILIKE :likeQuery
            GROUP BY 
                "Topic"."topic_id"
            ORDER BY
                "followersCount" DESC
            LIMIT 5`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          likeQuery: `%${name}%`
        }
      }
    );

    const message = 'Success get topic user';
    return res.json({
      status: 'success',
      code: 200,
      message,
      data: results
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
};

const followTopicV2 = async (req, res) => {
  try {
    const {name} = req.body;
    const {token, userId} = req;

    TopicValidator.validatePutTopicFollow({name});

    const topicService = new TopicService(Topics);
    const topic = await topicService.getTopicByName(name);
    const {topic_id} = topic;
    const userTopicService = new UserTopicService(UserTopic, UserTopicHistory);
    const result = await userTopicService.followTopic(userId, topic_id);

    const message = await _afterPutTopic(result, token, userId, name);

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: !result,
      message
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).json({
        code: error.statusCode,
        status: 'fail',
        message: error.message,
        data: 'null'
      });
    }
    return res.status(500).json({
      code: error.statusCode,
      status: 'error',
      message: 'Internal server error',
      data: 'null'
    });
  }
};

const _afterPutTopic = async (topic, token, userId, name) => {
  // follow / unfollow main feed topic
  if (topic) {
    await unfollowMainFeedTopic(token, userId, name);
  } else {
    await followMainFeedTopic(token, userId, name);
  }

  const message = topic ? 'Success delete topic user v2' : 'Success add topic user v2';

  return message;
};

const getFollowerList = async (req, res) => {
  const {userId} = req;
  const {name, limit = 40} = req.query;
  try {
    const query = `
    SELECT users.user_id,
        users.username,
        users.bio,
        users.profile_pic_path,
        users.created_at,
        users.updated_at,
        is_following_subquery.user_id_follower,
        CASE COALESCE(is_following_subquery.user_id_follower, '')
            WHEN '' THEN false
            ELSE true
        END as is_following
    FROM topics A 
    INNER JOIN user_topics B
        ON A.topic_id = B.topic_id
    INNER JOIN users
        ON B.user_id = users.user_id
    LEFT JOIN (	
        SELECT 
            Z.user_id_followed as subquery_user_id_followed, 
            count(Z.user_id_follower) as follower_count
        FROM user_follow_user Z
        GROUP BY Z.user_id_followed
    ) as subquery
        ON subquery.subquery_user_id_followed = B.user_id
    LEFT JOIN(
        SELECT X.user_id_follower, X.user_id_followed FROM user_follow_user X
        WHERE X.user_id_follower = ':userId'
    ) as is_following_subquery
        ON is_following_subquery.user_id_followed = users.user_id
    WHERE LOWER(A.name) = LOWER(:name)
        AND users.is_anonymous = false
    ORDER BY subquery.follower_count DESC NULLS last
    LIMIT :limit`;

    const response = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        name,
        limit
      }
    });

    res.status(200).json({
      status: 'success',
      code: 200,
      data: response
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  topics,
  putFollowTopic,
  getFollowTopic,
  getFollowedTopic,
  getFollowerList,
  getTopics,
  followTopicV2
};
