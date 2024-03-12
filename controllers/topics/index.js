/* eslint-disable no-underscore-dangle */
const {QueryTypes} = require('sequelize');
const {
  followMainFeedTopic,
  unfollowMainFeedTopic,
  addTopicToChatTab,
  removeTopicFromChatTab
} = require('../../services/getstream');
const ClientError = require('../../exceptions/ClientError');
const TopicService = require('../../services/postgres/TopicService');
const TopicValidator = require('../../validators/topic');
const topics = require('./topics');
const getFollowedTopic = require('./getFollowedTopic');
const {Topics, UserTopic, UserTopicHistory, sequelize, User} = require('../../databases/models');
const UserTopicService = require('../../services/postgres/UserTopicService');
const getSubscribableTopic = require('./getSubscribeableTopic');
const {getAnonymUser} = require('../../utils/getAnonymUser');
const UsersFunction = require('../../databases/functions/users');

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
  const signUserId = req.userId;
  const anonymousId = await getAnonymUser(req.userId);

  try {
    const results = await sequelize.query(
      `SELECT 
            "Topic".*,
            count("topicFollower"."user_id") 
                AS "followersCount",
            CASE
              WHEN (SELECT 
                count(user_id) as user_id_total 
              FROM user_topics 
              WHERE 
                user_id = :signUserId
                AND topic_id = "Topic".topic_id 
              LIMIT 1) > 0 THEN 'sign'
              WHEN (SELECT 
                count(user_id) as user_id_total 
              FROM user_topics 
              WHERE 
                user_id = :anonymousId
                AND topic_id = "Topic".topic_id 
              LIMIT 1) > 0 THEN 'anon'
              ELSE 'null'
              END AS is_followed_by
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
          likeQuery: `%${name}%`,
          signUserId: signUserId,
          anonymousId: anonymousId
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
    const {name, with_system_message = false} = req.body;
    const {token, userId} = req;

    // logic get user sign and anonymous
    let secondDetailUser;
    let secondDetailUserId;
    const detailTokenUser = await UsersFunction.findUserById(User, userId);
    if (!detailTokenUser.is_anonymous) {
      secondDetailUser = await UsersFunction.findAnonymousUserId(User, userId);
    } else {
      secondDetailUserId = await UsersFunction.findSignedUserId(User, userId);
      secondDetailUser = await UsersFunction.findUserById(User, secondDetailUserId);
    }

    TopicValidator.validatePutTopicFollow({name});

    //Logic get topic
    const topicService = new TopicService(Topics);
    const topic = await topicService.getTopicByName(name);
    const {topic_id} = topic;
    const userTopicService = new UserTopicService(UserTopic, UserTopicHistory);

    //get follow status
    const [getTokenUserStatus, getSecondUserStatus] = await Promise.all([
      userTopicService.getFollowTopicStatus(detailTokenUser.user_id, topic_id),
      userTopicService.getFollowTopicStatus(secondDetailUser.user_id, topic_id)
    ]);

    let data = [];
    if (getTokenUserStatus) {
      await userTopicService.unfollowTopic(detailTokenUser.user_id, topic_id);
      data.push(
        await _afterPutTopic(
          true,
          token,
          detailTokenUser.user_id,
          name,
          detailTokenUser.is_anonymous,
          with_system_message
        )
      );
    } else {
      await userTopicService.followTopic(detailTokenUser.user_id, topic_id);
      data.push(
        await _afterPutTopic(
          false,
          token,
          detailTokenUser.user_id,
          name,
          detailTokenUser.is_anonymous,
          with_system_message
        )
      );

      if (getSecondUserStatus) {
        await userTopicService.unfollowTopic(secondDetailUser.user_id, topic_id);
        data.push(
          await _afterPutTopic(
            true,
            token,
            secondDetailUser.user_id,
            name,
            detailTokenUser.is_anonymous,
            with_system_message
          )
        );
      }
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: data
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

const _afterPutTopic = async (
  isUnfollow,
  token,
  userId,
  name,
  isAnonymous,
  withSystemMessage = false
) => {
  // follow / unfollow main feed topic
  try {
    if (isUnfollow) {
      await unfollowMainFeedTopic(token, userId, name);
      await removeTopicFromChatTab(token, name, userId);
    } else {
      await followMainFeedTopic(token, userId, name);
      await addTopicToChatTab(token, name, userId, isAnonymous, withSystemMessage);
    }
  } catch (error) {
    console.log('After put topic error: ', error);
  }

  let data;
  if (isUnfollow) {
    data = {
      message: 'Success delete topic user v2',
      type: 'unfollow',
      userId
    };
  } else {
    data = {
      message: 'Success add topic user v2',
      type: 'follow',
      userId
    };
  }

  return data;
};

const getFollowerList = async (req, res) => {
  const {userId} = req;
  const {name, limit = 50, offset = 0, search = null} = req.query;
  try {
    const searchQuery = search ? `AND LOWER(users.username) LIKE LOWER(:search)` : '';

    let user_topics = await sequelize.query(
      `select tp.topic_id from topics as tp
      left join user_topics as utp on tp.topic_id = utp.topic_id
      where utp.user_id = :userId`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          userId
        }
      }
    );
    let topicIds = user_topics.map((topic) => topic.topic_id);
    const similarTopicQuery =
      topicIds.length > 0
        ? `ARRAY( select name from topics as tp
      left join user_topics as utp on tp.topic_id = utp.topic_id
      where utp.user_id = "users".user_id and tp.topic_id in (:topicIds) limit 3)`
        : 'ARRAY[]::text[]';

    const query = `
    SELECT users.user_id,
        users.username,
        users.bio,
        users.profile_pic_path,
        users.karma_score,
        users.created_at,
        users.updated_at,
        is_following_subquery.user_id_follower,
        CASE COALESCE(is_following_subquery.user_id_follower, '')
            WHEN '' THEN false
            ELSE true
        END as following,
        CASE COALESCE(is_following_subquery.user_id_follower, '')
            WHEN '' THEN false
            ELSE true
        END as is_following,
        ${similarTopicQuery} as community_info
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
        WHERE X.user_id_follower = :userId
    ) as is_following_subquery
        ON is_following_subquery.user_id_followed = users.user_id
    WHERE LOWER(A.name) = LOWER(:name)
        AND users.is_anonymous = false
        AND users.verified_status != 'UNVERIFIED'
        ${searchQuery}
    ORDER BY 
      subquery.follower_count DESC NULLS last, 
      users.karma_score
    LIMIT :limit
    OFFSET :offset`;

    const response = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        topicIds,
        name,
        limit,
        offset,
        search: `%${search}%`
      }
    });

    res.status(200).json({
      status: 'success',
      code: 200,
      next: parseInt(offset, 10) + parseInt(response?.length || 0, 10),
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
  getSubscribableTopic,
  followTopicV2
};
