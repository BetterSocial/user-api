const moment = require('moment');
const LocationFunction = require('../../databases/functions/location');
const TopicFunction = require('../../databases/functions/topics');

const UsersFunction = require('../../databases/functions/users');
const {sequelize} = require('../../databases/models');

const {Topics, User, Locations} = require('../../databases/models');
const BetterSocialCore = require('../../services/bettersocial');
const {createRefreshToken} = require('../../services/jwt');
const {registerV2ServiceQueue} = require('../../services/redis');
const {addForCreateAccount} = require('../../services/score');
const Getstream = require('../../vendor/getstream');

/**
 *
 * @param {import("express").Request} req
 * @param {Response} res
 */
const registerV2 = async (req, res) => {
  let token;
  let refresh_token;
  let anonymousToken;

  /**
   * @type {RegisterBody}
   */
  const {data} = req.body;
  const {users, follows, local_community, topics} = data;

  const checkUser = await User.findOne({
    where: {
      human_id: users.human_id
    }
  });

  let insertedObject = {};
  let isUnverifiedUser = checkUser && checkUser.verified_status === 'UNVERIFIED';

  if (isUnverifiedUser) {
    let updatedUser;
    try {
      users.verified_status = 'VERIFIED';
      await checkUser.update(users);
      updatedUser = await checkUser.save();
    } catch (e) {
      return res.status(500).json({
        status: 'error on sql transaction',
        code: 500,
        message: e
      });
    }

    const topicRegistered = await TopicFunction.findAllByTopicIds(Topics, topics);
    const locations = await LocationFunction.getAllLocationByIds(Locations, local_community);

    insertedObject = {
      user: updatedUser,
      anonymousUser: await UsersFunction.findAnonymousUserId(User, updatedUser.user_id, {
        raw: false
      }),
      topics: topicRegistered,
      locations
    };
  } else {
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
        status: 'error on sql transaction',
        code: 500,
        message: e
      });
    }
    /**
     * Inserting data to Postgres DB (END)
     */
  }

  /**
   * Creating User to Getstream
   */
  try {
    if (isUnverifiedUser) {
      token = Getstream.core.createToken(insertedObject?.user?.user_id);
      anonymousToken = Getstream.core.createToken(
        insertedObject?.anonymousUser?.user_id?.toLowerCase()
      );
    } else {
      token = await BetterSocialCore.user.createUser(insertedObject?.user);
      anonymousToken = Getstream.core.createToken(
        insertedObject?.anonymousUser?.user_id?.toLowerCase()
      );
      await BetterSocialCore.user.createAnonymousUser(insertedObject?.anonymousUser);
    }
  } catch (e) {
    console.log('error on inserting user to getstream creating', e);
    return res.status(500).json({
      status: 'error on inserting user to getstream creating',
      code: 500,
      message: e
    });
  }
  try {
    refresh_token = await createRefreshToken(insertedObject?.user?.user_id);
  } catch (e) {
    console.log('error on inserting user to getstream creating refresh token', e);
    return res.status(500).json({
      status: 'error on inserting user to getstream creating refresh token',
      code: 500,
      message: e
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
  } catch (e) {
    console.log('error on inserting user to queue', e);
    return res.status(500).json({
      status: 'error on inserting user to queue',
      code: 500,
      message: e
    });
  }
  /**
   * Creating register user queue (END)
   */

  /**
   * Creating scoring queue
   */
  try {
    const scoringQueueTopic = insertedObject?.topics?.map((topic) => topic.name);
    const scoringProcessData = {
      user_id: insertedObject?.user?.user_id,
      register_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      emails: [],
      twitter_acc: '',
      topics: scoringQueueTopic,
      follow_users: follows
    };

    addForCreateAccount(scoringProcessData);
  } catch (e) {
    console.log('error on inserting score queue', e);
    return res.status(500).json({
      status: 'error on inserting score queue',
      code: 500,
      message: e
    });
  }
  /**
   * Creating scoring queue (END)
   */

  return res.status(200).json({
    status: 'success',
    code: 200,
    data: insertedObject?.user,
    anonymousToken,
    token,
    refresh_token
  });
};

module.exports = registerV2;
